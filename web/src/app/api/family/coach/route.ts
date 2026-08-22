/**
 * Parent-side coach management (owner only).
 *   GET  → { grants: CoachGrant[] }              active grants for the family
 *   POST { coachEmail, memberId } → { grant }    grant a coach access to a child
 *
 * Auth: Firebase ID token; the caller must OWN the family (owner uid = familyId).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { resolveOwner, bearer, type CoachGrant } from "@/lib/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await resolveOwner(bearer(req));
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getAdminDb();
  const snap = await db
    .collection("coachGrants")
    .where("familyId", "==", ctx.familyId)
    .where("revoked", "==", false)
    .get();
  const grants = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CoachGrant, "id">) }));
  grants.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ grants });
}

export async function POST(req: NextRequest) {
  const ctx = await resolveOwner(bearer(req));
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let coachEmail = "", memberId = "";
  try {
    const b = (await req.json()) as { coachEmail?: string; memberId?: string };
    coachEmail = (b.coachEmail ?? "").toLowerCase().trim();
    memberId = (b.memberId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coachEmail);
  if (!emailOk) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (!memberId) return NextResponse.json({ error: "member_required" }, { status: 400 });

  const db = getAdminDb();
  // The child must be a real, non-owner member of THIS family.
  const memberSnap = await db.collection("families").doc(ctx.familyId).collection("members").doc(memberId).get();
  if (!memberSnap.exists) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const member = memberSnap.data() as { name?: string; isOwner?: boolean };
  if (member.isOwner) return NextResponse.json({ error: "cannot_grant_owner" }, { status: 400 });

  // Idempotent: reuse an existing active grant for the same (email, child).
  const existing = await db
    .collection("coachGrants")
    .where("familyId", "==", ctx.familyId)
    .where("memberId", "==", memberId)
    .where("coachEmail", "==", coachEmail)
    .where("revoked", "==", false)
    .limit(1)
    .get();
  if (!existing.empty) {
    const d = existing.docs[0];
    return NextResponse.json({ grant: { id: d.id, ...(d.data() as Omit<CoachGrant, "id">) } });
  }

  const now = new Date().toISOString();
  const data: Omit<CoachGrant, "id"> = {
    coachEmail,
    familyId: ctx.familyId,
    memberId,
    memberName: member.name || "",
    grantedBy: ctx.familyId,
    createdAt: now,
    revoked: false,
  };
  const ref = await db.collection("coachGrants").add(data);
  return NextResponse.json({ grant: { id: ref.id, ...data } });
}
