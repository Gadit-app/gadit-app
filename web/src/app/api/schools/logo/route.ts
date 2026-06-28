import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { ALLOWED_LOGO_MIMES, MAX_LOGO_BYTES } from "@/lib/school";

/**
 * POST /api/schools/logo
 *
 * Owner-only endpoint. Accepts a multipart/form-data upload with a
 * single `file` field, validates the type + size, writes it to
 * gs://<bucket>/schools/{schoolId}/logo.<ext>, and updates
 * schools/{schoolId}.logoUrl with the public download URL.
 *
 * Why server-side and not direct-to-Storage from the client:
 *   1. We need to validate type + size against the ALLOWED_LOGO_MIMES /
 *      MAX_LOGO_BYTES constants. Client-side checks can be skipped.
 *   2. SVG is deliberately excluded — it's an XSS vector when shown
 *      inside an <img src> on the kid-facing /c/<CODE> page.
 *   3. Firebase Storage security rules are coarse for principal-only
 *      writes; doing it server-side lets us check the user owns this
 *      specific school before touching their logo bucket.
 *
 * Response: { logoUrl }
 */

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  const userId = decoded.uid;

  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(userId).get();
  const userData = userSnap.data();
  if (!userData?.schoolId || userData.schoolId !== userId) {
    return NextResponse.json({ error: "schools_subscription_required" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }
  if (!(ALLOWED_LOGO_MIMES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "bad_type" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const objectPath = `schools/${userId}/logo.${ext}`;

  const bucket = getAdminStorage().bucket();
  const obj = bucket.file(objectPath);
  const arrayBuf = await file.arrayBuffer();
  await obj.save(Buffer.from(arrayBuf), {
    contentType: file.type,
    metadata: {
      cacheControl: "public, max-age=86400",
    },
  });
  // Make the logo publicly readable. The kid view at /c/<CODE> needs to
  // load it without authentication; a download URL with a long-lived
  // token would work too but is more code, and a public logo is not
  // sensitive (it's already on the school's website).
  await obj.makePublic();
  // Append a cache-bust query param so a replaced logo loads fresh
  // instead of showing the previously-cached image. The Storage
  // object overwrites the previous one at the same path, so the
  // canonical URL is identical; without ?v= the browser keeps
  // serving the old image for up to 24h (the cacheControl header).
  // Tested 2026-06-28: Gadi uploaded a new logo and saw the old one
  // until cache eviction.
  const logoUrl = `https://storage.googleapis.com/${bucket.name}/${objectPath}?v=${Date.now()}`;

  await db.collection("schools").doc(userId).set(
    {
      logoUrl,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return NextResponse.json({ logoUrl });
}
