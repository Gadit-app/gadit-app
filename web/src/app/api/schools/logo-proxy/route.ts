import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isAllowedImageUrl } from "@/lib/image-proxy-url";

/**
 * GET /api/schools/logo-proxy?schoolId=UID
 *
 * Streams a school's logo through our own origin so the "Auto from logo" colour
 * extraction can read the pixels: loading the Firebase Storage URL directly
 * taints the <canvas> (cross-origin), but the same image served from our domain
 * does not. Logos are not secret.
 *
 * The school doc can be written from the owner's browser, so the stored URL is
 * not trusted (night QA 2026-11-13): only a file in our own bucket is fetched,
 * redirects are refused, and the answer is always served as a picture, never
 * as a page that could run script on this origin.
 */

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  if (!schoolId) return NextResponse.json({ error: "missing_schoolId" }, { status: 400 });

  const snap = await getAdminDb().collection("schools").doc(schoolId).get();
  const url = (snap.data() as { logoUrl?: string | null } | undefined)?.logoUrl;
  if (!url || !isAllowedImageUrl(url)) {
    return NextResponse.json({ error: "no_logo" }, { status: 404 });
  }

  const upstream = await fetch(url, { redirect: "error" }).catch(() => null);
  if (!upstream || !upstream.ok) return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  const type = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!["image/png", "image/jpeg", "image/webp"].includes(type)) {
    return NextResponse.json({ error: "not_an_image" }, { status: 415 });
  }

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=300",
    },
  });
}
