/**
 * Shared-device profile switcher for a Family (Gadi 2026-08-05).
 *
 * On a shared computer, kids should be able to switch between their
 * profiles WITHOUT the parent generating a fresh 6-digit code each time
 * (the /c/<CODE> roster picker, but for a family). Any signed-in member
 * of a family can switch to any OTHER non-owner member of the SAME
 * family; we mint a custom token for that member and the client signs in
 * with it.
 *
 * The billing OWNER is never a switch target (a kid must not be able to
 * become the paying account and touch billing). To use the owner
 * account, log in normally.
 *
 *   GET  → { members: [{ id, name, role, colorIndex }] }  (non-owner)
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
  const rows = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as { isOwner?: boolean; name?: string; role?: string; colorIndex?: number }),
  }));
  const members = rows
    .filter((m) => !m.isOwner) // never offer the billing owner as a switch target
    .map((m) => ({
      id: m.id,
      name: m.name || "",
      role: m.role || "boy",
      colorIndex: m.colorIndex ?? 0,
    }));

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
  if (member.isOwner) return NextResponse.json({ error: "cannot_switch_to_owner" }, { status: 403 });

  const role: "kid" | "parent" = isParentRole(member.role) ? "parent" : "kid";
  const syntheticUid = syntheticUidFor(ctx.familyId, memberId);
  const auth = getAdminAuth();

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
