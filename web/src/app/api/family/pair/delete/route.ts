/**
 * POST /api/family/pair/delete
 *
 * Owner removes a family member ENTIRELY (not just unpair). Deletes the
 * member doc, deletes the synthetic Firebase Auth user + its user doc.
 * The billing owner can never be deleted.
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
      return NextResponse.json({ error: "cannot_delete_owner" }, { status: 400 });
    }

    // Clean up the synthetic member account (best effort — it may never
    // have been paired, in which case there's nothing to delete).
    const syntheticUid = syntheticUidFor(ownerUid, memberId);
    try {
      await getAdminAuth().deleteUser(syntheticUid);
    } catch {
      /* no synthetic auth user — fine */
    }
    try {
      await db.collection("users").doc(syntheticUid).delete();
    } catch {
      /* no user doc — fine */
    }

    await memberRef.delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/family/pair/delete] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
