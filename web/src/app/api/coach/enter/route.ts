/**
 * Coach-side: enter a student's profile. POST { grantId } → { token, memberName }.
 * Mints a Firebase custom token for the CHILD's synthetic uid (full switch-in,
 * like the family profile switcher), with a `coach` claim so the app can show
 * an "exit coaching" affordance. Gated by a live grant whose coachEmail matches
 * the caller's verified email; a revoked grant fails here immediately.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor, isParentRole, type MemberRole } from "@/lib/family";
import { verifyCoach, bearer } from "@/lib/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const coach = await verifyCoach(bearer(req));
  if (!coach) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let grantId = "";
  try {
    grantId = ((await req.json())?.grantId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!grantId) return NextResponse.json({ error: "grant_required" }, { status: 400 });

  const db = getAdminDb();
  const grantSnap = await db.collection("coachGrants").doc(grantId).get();
  if (!grantSnap.exists) return NextResponse.json({ error: "grant_not_found" }, { status: 404 });
  const grant = grantSnap.data() as { coachEmail: string; familyId: string; memberId: string; revoked: boolean };
  // The grant must be live AND belong to THIS coach's email.
  if (grant.revoked || grant.coachEmail !== coach.email) {
    return NextResponse.json({ error: "no_access" }, { status: 403 });
  }

  const { familyId, memberId } = grant;
  const memberRef = db.collection("families").doc(familyId).collection("members").doc(memberId);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const member = memberSnap.data() as { role: MemberRole; name: string; isOwner?: boolean };
  if (member.isOwner) return NextResponse.json({ error: "cannot_enter_owner" }, { status: 400 });

  const auth = getAdminAuth();
  const role: "kid" | "parent" = isParentRole(member.role) ? "parent" : "kid";
  const syntheticUid = syntheticUidFor(familyId, memberId);

  // Ensure the child's Firebase Auth user + user doc exist (same as switch-member).
  try {
    await auth.getUser(syntheticUid);
  } catch {
    await auth.createUser({ uid: syntheticUid, displayName: member.name || undefined });
  }
  await db.collection("users").doc(syntheticUid).set(
    { plan: "deep", familyId, memberId, memberRole: member.role, familyRole: role },
    { merge: true },
  );
  await memberRef.set({ userId: syntheticUid, deviceLinkedAt: new Date().toISOString() }, { merge: true });

  const token = await auth.createCustomToken(syntheticUid, {
    role,
    familyId,
    memberId,
    coach: true,            // marks this as a coach session (app shows "exit coaching")
    coachEmail: coach.email,
  });
  return NextResponse.json({ token, memberName: member.name });
}
