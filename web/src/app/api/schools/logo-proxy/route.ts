import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * GET /api/schools/logo-proxy?schoolId=UID
 *
 * Streams a school's logo through our own origin so the "Auto from logo" colour
 * extraction can read the pixels: loading the Firebase Storage URL directly
 * taints the <canvas> (cross-origin), but the same image served from our domain
 * does not. Only fetches the logoUrl already stored on the school doc (no
 * arbitrary URLs), so there is no SSRF surface. Logos are not secret.
 */

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const schoolId = req.nextUrl.searchParams.get("schoolId");
  if (!schoolId) return NextResponse.json({ error: "missing_schoolId" }, { status: 400 });

  const snap = await getAdminDb().collection("schools").doc(schoolId).get();
  const url = (snap.data() as { logoUrl?: string | null } | undefined)?.logoUrl;
  if (!url || !/^https:\/\//.test(url)) {
    return NextResponse.json({ error: "no_logo" }, { status: 404 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) return NextResponse.json({ error: "fetch_failed" }, { status: 502 });

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/png",
      "Cache-Control": "private, max-age=300",
    },
  });
}
