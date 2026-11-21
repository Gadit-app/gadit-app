/**
 * Revoke a coach grant (owner only). POST { grantId } → { ok }.
 * A new entry is refused at once (/api/coach/enter). A coach who is already
 * inside the child's profile is refused on their next request, within a few
 * seconds (coachSessionLive in lib/firebase-admin.ts).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, forgetCoachSession } from "@/lib/firebase-admin";
import { resolveOwner, bearer } from "@/lib/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ctx = await resolveOwner(bearer(req));
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let grantId = "";
  try {
    grantId = ((await req.json())?.grantId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!grantId) return NextResponse.json({ error: "grant_required" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection("coachGrants").doc(grantId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "grant_not_found" }, { status: 404 });
  // Only the family that owns the grant may revoke it.
  if ((snap.data() as { familyId?: string }).familyId !== ctx.familyId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await ref.set({ revoked: true, revokedAt: new Date().toISOString() }, { merge: true });
  forgetCoachSession(grantId);
  return NextResponse.json({ ok: true });
}
