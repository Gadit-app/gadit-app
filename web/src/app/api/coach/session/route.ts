/**
 * Is this coach session still allowed? GET → { active: true } or 401.
 * Asked by the coach bar (CoachSessionBanner) while a coach is inside a
 * child's profile, so a coach whose access the parent revoked is taken out of
 * the profile instead of meeting errors on every page. The check itself is
 * the one every route runs (getAdminAuth().verifyIdToken, lib/firebase-admin.ts).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, COACH_SESSION_ENDED } from "@/lib/firebase-admin";
import { bearer } from "@/lib/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = bearer(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await getAdminAuth().verifyIdToken(token);
    return NextResponse.json({ active: true });
  } catch (e) {
    // `ended` only for a revoked grant: any other failure (an expired token, a
    // network fault) must not throw the coach out.
    const ended = e instanceof Error && e.message === COACH_SESSION_ENDED;
    return NextResponse.json({ error: "unauthorized", ended }, { status: 401 });
  }
}
