/**
 * POST /api/family/pair/revoke
 *
 * Owner revokes a paired member's device. Clears `userId` from the
 * member doc and revokes the synthetic Firebase Auth user's refresh
 * tokens so the device is signed out on its next API call.
 *
 * Body: { memberId: string }
 * Auth: owner of the family.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { syntheticUidFor } from "@/lib/family";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const ownerUid = decoded.uid;

    const { memberId } = await req.json();
    if (!memberId || typeof memberId !== "string") {
      return NextResponse.json({ error: "missing_memberId" }, { status: 400 });
    }

    const db = getAdminDb();
    const memberRef = db.collection("families").doc(ownerUid).collection("members").doc(memberId);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      return NextResponse.json({ error: "member_not_found" }, { status: 404 });
    }
    if (memberSnap.data()?.isOwner) {
      return NextResponse.json({ error: "cannot_revoke_owner" }, { status: 400 });
    }

    const syntheticUid = syntheticUidFor(ownerUid, memberId);
    try {
      await getAdminAuth().revokeRefreshTokens(syntheticUid);
    } catch {
      // ok if user doesn't exist yet — nothing to revoke
    }

    await memberRef.set({ userId: null, deviceLinkedAt: null }, { merge: true });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/family/pair/revoke] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
