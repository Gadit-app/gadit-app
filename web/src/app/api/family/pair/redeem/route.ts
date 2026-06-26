/**
 * POST /api/family/pair/redeem
 *
 * No auth. Anyone with a valid 6-digit code can redeem it. The code
 * itself is the secret (rate-limited by Vercel + Firestore writes).
 *
 * Body: { code: string /* "048213" *\/ }
 * Response: { token: string, role: "kid" | "parent", familyId, memberId, name }
 *
 * Flow:
 *   1. Look up pairingCodes/{code}. 404 if missing.
 *   2. Expired? Delete + 410.
 *   3. Look up the family member to get role + name.
 *   4. Compute synthetic uid = `${familyId}_${memberId}`.
 *   5. Ensure the Firebase Auth user exists (create if not).
 *   6. Ensure users/{syntheticUid} doc exists with plan: "deep" and
 *      familyId pointer — gates existing feature checks.
 *   7. Stamp `userId` + `deviceLinkedAt` on the member doc.
 *   8. Delete the pairing code (one-shot).
 *   9. Mint custom token with role claim and return it. Client calls
 *      `signInWithCustomToken(token)`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor, isParentRole, MemberRole } from "@/lib/family";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    const db = getAdminDb();
    const codeRef = db.collection("pairingCodes").doc(code);
    const codeSnap = await codeRef.get();
    if (!codeSnap.exists) {
      return NextResponse.json({ error: "code_not_found" }, { status: 404 });
    }
    const codeData = codeSnap.data() as { familyId: string; memberId: string; expiresAt: number };

    if (Date.now() > codeData.expiresAt) {
      await codeRef.delete();
      return NextResponse.json({ error: "code_expired" }, { status: 410 });
    }

    const { familyId, memberId } = codeData;
    const memberRef = db.collection("families").doc(familyId).collection("members").doc(memberId);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      await codeRef.delete();
      return NextResponse.json({ error: "member_not_found" }, { status: 404 });
    }
    const member = memberSnap.data() as { role: MemberRole; name: string };
    const role: "kid" | "parent" = isParentRole(member.role) ? "parent" : "kid";

    const syntheticUid = syntheticUidFor(familyId, memberId);
    const auth = getAdminAuth();

    // Create the Firebase Auth user if missing.
    try {
      await auth.getUser(syntheticUid);
    } catch {
      await auth.createUser({
        uid: syntheticUid,
        displayName: member.name || undefined,
      });
    }

    // Ensure users/{syntheticUid} exists with plan:"deep" so existing
    // feature gates (notebook, kids mode, quizzes) pass for this member.
    const userRef = db.collection("users").doc(syntheticUid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      await userRef.set({
        plan: "deep",
        familyId,
        memberId,
        memberRole: member.role,
        familyRole: role,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Member's feature plan is governed by the family subscription,
      // so we always reset to "deep" on re-pair. If the family's
      // subscription lapses, downstream banner code handles UX.
      await userRef.set(
        { plan: "deep", familyId, memberId, memberRole: member.role, familyRole: role },
        { merge: true }
      );
    }

    // Stamp the member doc so the parent UI shows "linked".
    await memberRef.set(
      { userId: syntheticUid, deviceLinkedAt: new Date().toISOString() },
      { merge: true }
    );

    // One-shot: delete the code so it can't be reused.
    await codeRef.delete();

    // Mint a custom token with role claim. The kids-side and parent-
    // side UI both branch on this claim.
    const token = await auth.createCustomToken(syntheticUid, {
      role,
      familyId,
      memberId,
    });

    return NextResponse.json({
      token,
      role,
      familyId,
      memberId,
      name: member.name,
    });
  } catch (err) {
    console.error("[/api/family/pair/redeem] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
