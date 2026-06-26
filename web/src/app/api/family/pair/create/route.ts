/**
 * POST /api/family/pair/create
 *
 * Owner generates a 6-digit pairing code for a family member.
 *
 * Auth: owner of the family (verified via Firebase ID token; owner uid
 * must equal `familyId`, which is the family doc id).
 * Body: { memberId: string }
 * Response: { code: string, expiresAt: number /* ms epoch *\/ }
 *
 * Side effects:
 *   - Deletes any existing pairing code for this (familyId, memberId),
 *     so only one active code per member at a time.
 *   - Creates `pairingCodes/{code}` with familyId, memberId, expiresAt.
 *
 * The code is the doc id (top-level collection), which lets the redeem
 * step look it up with a single `get`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { generateSixDigitCode, PAIRING_CODE_TTL_MS } from "@/lib/family";

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
    // Confirm owner is the actual owner of the family. familyId === ownerUid.
    const familyRef = db.collection("families").doc(ownerUid);
    const familySnap = await familyRef.get();
    if (!familySnap.exists) {
      return NextResponse.json({ error: "family_not_found" }, { status: 404 });
    }
    // Confirm the member exists in this family.
    const memberSnap = await familyRef.collection("members").doc(memberId).get();
    if (!memberSnap.exists) {
      return NextResponse.json({ error: "member_not_found" }, { status: 404 });
    }
    if (memberSnap.data()?.isOwner) {
      return NextResponse.json({ error: "cannot_pair_owner" }, { status: 400 });
    }

    // Delete any existing pairing code for this (familyId, memberId).
    const existing = await db
      .collection("pairingCodes")
      .where("familyId", "==", ownerUid)
      .where("memberId", "==", memberId)
      .get();
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    // Generate a unique code. Retry up to 5x in the (vanishing) chance
    // of collision with another live code anywhere in the system.
    let code = "";
    for (let i = 0; i < 5; i++) {
      const candidate = generateSixDigitCode();
      const existsSnap = await db.collection("pairingCodes").doc(candidate).get();
      if (!existsSnap.exists) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return NextResponse.json({ error: "code_generation_failed" }, { status: 500 });
    }

    const expiresAt = Date.now() + PAIRING_CODE_TTL_MS;
    await db.collection("pairingCodes").doc(code).set({
      familyId: ownerUid,
      memberId,
      expiresAt,
      createdAt: Date.now(),
    });

    return NextResponse.json({ code, expiresAt });
  } catch (err) {
    console.error("[/api/family/pair/create] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
