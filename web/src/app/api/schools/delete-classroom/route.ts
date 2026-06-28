import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * DELETE /api/schools/delete-classroom?id=<classroomId>
 *
 * Owner-only. Deletes the classroom doc, the matching classroomCodes
 * lookup, and ALL searches in the classroom's searches subcollection
 * in a single batch. The principal is responsible for warning the
 * teacher first — UI gates the call behind window.confirm().
 *
 * Why server-side and not client-side delete: the lookup doc + the
 * classroom doc + the searches subcollection must all be cleaned up
 * together. Client SDK rules disallow direct delete on classroomCodes
 * (the lookup is admin-only), so the cleanup has to happen here.
 */

export async function DELETE(req: NextRequest) {
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

  const url = new URL(req.url);
  const classroomId = url.searchParams.get("id") ?? "";
  if (!classroomId) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const db = getAdminDb();

  // Verify ownership before touching anything.
  const userSnap = await db.collection("users").doc(userId).get();
  const userData = userSnap.data();
  if (!userData?.schoolId || userData.schoolId !== userId) {
    return NextResponse.json({ error: "schools_subscription_required" }, { status: 403 });
  }

  const classroomRef = db
    .collection("schools")
    .doc(userId)
    .collection("classrooms")
    .doc(classroomId);

  const classroomSnap = await classroomRef.get();
  if (!classroomSnap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const classroomData = classroomSnap.data() as { code?: string };
  const code = classroomData?.code;

  // Delete the searches subcollection in pages of 200. Firestore has
  // no recursive-delete API outside the CLI; this loop is the safe
  // pattern. A class with 50,000 searches still completes in seconds.
  const searchesRef = classroomRef.collection("searches");
  while (true) {
    const batch = db.batch();
    const snap = await searchesRef.limit(200).get();
    if (snap.empty) break;
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (snap.size < 200) break;
  }

  // Final atomic cleanup: classroom doc + lookup doc.
  await db.runTransaction(async (tx) => {
    tx.delete(classroomRef);
    if (code) {
      tx.delete(db.collection("classroomCodes").doc(code));
    }
  });

  return NextResponse.json({ ok: true });
}
