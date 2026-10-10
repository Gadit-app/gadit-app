/**
 * POST /api/auth/handoff  (Authorization: Bearer <ID token>)  →  { token }
 *
 * Carries a signed-in session from www.gadit.app to the purchase host
 * gadit.app (Gadi 2026-10-10: a Basic subscriber sent the families page
 * could not upgrade; on gadit.app he was signed out and his password
 * "didn't work"). Firebase keeps one session per origin, so the two hosts
 * never shared it. The hidden /auth/bridge page on www calls this with the
 * www session and posts the custom token to gadit.app only, which signs in
 * with it. A custom token is valid for one hour and signs in only the
 * caller's own account.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Only the bridge page on www asks for this.
  const origin = req.headers.get("origin") || "";
  if (origin && origin !== "https://www.gadit.app" && !origin.startsWith("http://localhost")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const token = await getAdminAuth().createCustomToken(decoded.uid);
    return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
}
