/**
 * Shared-device profile switcher for a Family (Gadi 2026-08-05,
 * back-to-parent added 2026-08-04).
 *
 * On a shared computer, kids switch between their profiles WITHOUT the
 * parent generating a fresh 6-digit code each time (the /c/<CODE> roster
 * picker, but for a family). Any signed-in member of a family can switch
 * to any OTHER profile of the SAME family, INCLUDING back to the parent
 * account. This mirrors the "kids mode on a shared computer" idea: one
 * tap to become any household profile, no password.
 *
 * Owner switch target: the parent's REAL uid is the family id, so we mint
 * the token for `familyId` (not a synthetic member uid). That restores
 * the parent's actual account — billing, member management, everything.
 * Gadi chose the frictionless model (no PIN) for the simplest UX; a
 * parent PIN can layer on later if the household needs it.
 *
 *   GET  → { members: [{ id, name, role, colorIndex, isOwner }] }
 *   POST { memberId } → { token, role, memberId, name }
 *
 * Auth: Firebase ID token (Authorization: Bearer <token>). The caller's
 * family is derived from their user doc's `familyId`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor, isParentRole, type MemberRole } from "@/lib/family";

async function resolveFamily(req: NextRequest): Promise<{ familyId: string } | null> {
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const snap = await db.collection("users").doc(decoded.uid).get();
    const familyId = snap.data()?.familyId as string | undefined;
    if (!familyId) return null;
    return { familyId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const ctx = await resolveFamily(req);
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const snap = await db.collection("families").doc(ctx.familyId).collection("members").orderBy("createdAt", "asc").get();
  // Every profile in the household is a switch target now, INCLUDING the
  // parent/owner, so a kid (or the parent testing) always has a one-tap
  // way back to the parent account.
  const members = snap.docs.map((d) => {
    const m = d.data() as { isOwner?: boolean; name?: string; role?: string; colorIndex?: number; avatarPhotoUrl?: string | null; avatarId?: string | null };
    return {
      id: d.id,
      name: m.name || "",
      role: m.role || "boy",
      colorIndex: m.colorIndex ?? 0,
      avatarPhotoUrl: m.avatarPhotoUrl || "",
      avatarId: m.avatarId || "",
      isOwner: !!m.isOwner,
    };
  });

  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const ctx = await resolveFamily(req);
  if (!ctx) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let memberId = "";
  try {
    const body = (await req.json()) as { memberId?: string };
    memberId = (body.memberId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  if (!memberId) return NextResponse.json({ error: "member_required" }, { status: 400 });

  const db = getAdminDb();
  const memberRef = db.collection("families").doc(ctx.familyId).collection("members").doc(memberId);
  const memberSnap = await memberRef.get();
  if (!memberSnap.exists) return NextResponse.json({ error: "member_not_found" }, { status: 404 });
  const member = memberSnap.data() as { role: MemberRole; name: string; isOwner?: boolean };
  const auth = getAdminAuth();

  // Back to the parent: the owner's real uid IS the family id. Mint the
  // token for that uid so the parent lands in their genuine account. Do
  // NOT touch the owner's user doc (it already holds their real plan and
  // Stripe data) — only stamp membership onto synthetic member accounts.
  if (member.isOwner) {
    const token = await auth.createCustomToken(ctx.familyId, {
      role: "parent",
      familyId: ctx.familyId,
      memberId,
    });
    return NextResponse.json({ token, role: "parent", memberId, name: member.name });
  }

  const role: "kid" | "parent" = isParentRole(member.role) ? "parent" : "kid";
  const syntheticUid = syntheticUidFor(ctx.familyId, memberId);

  // Ensure the Firebase Auth user + user doc exist (same as pair redeem),
  // so a member who was never paired on their own device can still be
  // switched to on a shared one.
  try {
    await auth.getUser(syntheticUid);
  } catch {
    await auth.createUser({ uid: syntheticUid, displayName: member.name || undefined });
  }
  await db.collection("users").doc(syntheticUid).set(
    { plan: "deep", familyId: ctx.familyId, memberId, memberRole: member.role, familyRole: role },
    { merge: true },
  );
  await memberRef.set({ userId: syntheticUid, deviceLinkedAt: new Date().toISOString() }, { merge: true });

  const token = await auth.createCustomToken(syntheticUid, { role, familyId: ctx.familyId, memberId });
  return NextResponse.json({ token, role, memberId, name: member.name });
}
