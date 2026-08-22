/**
 * POST /api/yooniz/gift  — body { token }
 *
 * Direction A of the Yooniz <-> Gadit points bridge: a Yooniz parent gifts
 * cosmetic points into a Gadit kid's GIFT wallet. Same HMAC token scheme as
 * SSO/status. Payload: { v:1, parentEmail, memberId, amount, iat, nonce }.
 *
 * Council rules: gift points are COSMETIC ONLY and weekly-capped (a treat).
 * They live in a SEPARATE wallet (users/{syntheticUid}.giftPoints) and NEVER
 * touch the earned `points`, ranks, or the parent dashboard. Cap: 50/kid/week
 * (Sunday-Saturday, Israel time). Idempotent by nonce (a retry never
 * double-credits). Returns { granted, giftPointsTotal, remainingThisWeek }.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { syntheticUidFor } from "@/lib/family";
import { GIFT_WEEKLY_CAP } from "@/lib/gamification";
import { verifyToken, israelWeekKey } from "@/lib/yooniz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(req: NextRequest) {
  const secret = process.env.YOONIZ_GADIT_SSO_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  let token = "";
  try { token = ((await req.json())?.token as string) || ""; } catch { /* ignore */ }
  const v = verifyToken(token, secret);
  if (!v.ok) return NextResponse.json({ error: "invalid_token", reason: v.reason }, { status: 401 });

  const parentEmail = String(v.payload.parentEmail ?? "").toLowerCase().trim();
  const memberId = String(v.payload.memberId ?? "").trim(); // the Yooniz kidId
  const amount = Number(v.payload.amount);
  const nonce = String(v.payload.nonce ?? "").trim();
  if (!parentEmail || !memberId || !nonce) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (!Number.isInteger(amount) || amount <= 0) return NextResponse.json({ error: "bad_amount" }, { status: 400 });

  const db = getAdminDb();
  const auth = getAdminAuth();

  // Resolve the child, mirroring the SSO mapping exactly.
  let ownerUid: string;
  try {
    ownerUid = (await auth.getUserByEmail(parentEmail)).uid;
  } catch {
    return NextResponse.json({ granted: 0, giftPointsTotal: 0, remainingThisWeek: 0, reason: "family_not_found" });
  }
  const membersSnap = await db.collection("families").doc(ownerUid).collection("members").get();
  const member = membersSnap.docs.find(
    (d) => { const m = d.data(); return m.yoonizKidId === memberId || m.yoonizMemberId === memberId; },
  );
  if (!member) {
    return NextResponse.json({ granted: 0, giftPointsTotal: 0, remainingThisWeek: 0, reason: "member_not_found" });
  }
  const syntheticUid = syntheticUidFor(ownerUid, member.id);
  const weekKey = israelWeekKey();

  const userRef = db.collection("users").doc(syntheticUid);
  const ledgerCol = userRef.collection("giftLedger");
  const nonceRef = db.collection("yoonizGiftNonces").doc(nonce);
  const nowIso = new Date().toISOString();

  try {
    const out = await db.runTransaction(async (tx) => {
      // Idempotency: a repeated nonce returns the SAME result, no re-credit.
      const nonceSnap = await tx.get(nonceRef);
      if (nonceSnap.exists) {
        const d = nonceSnap.data() as { granted: number; giftPointsTotal: number; remainingThisWeek: number };
        return { granted: d.granted, giftPointsTotal: d.giftPointsTotal, remainingThisWeek: d.remainingThisWeek };
      }
      // How much of the weekly cap is already used.
      const weekSnap = await tx.get(ledgerCol.where("weekKey", "==", weekKey));
      let usedThisWeek = 0;
      weekSnap.forEach((d) => { usedThisWeek += Number((d.data() as { delta?: number }).delta) || 0; });
      const remainingBefore = Math.max(0, GIFT_WEEKLY_CAP - usedThisWeek);
      const granted = Math.max(0, Math.min(amount, remainingBefore));
      const remainingThisWeek = remainingBefore - granted;

      const userSnap = await tx.get(userRef);
      const curGift = Number((userSnap.data() as { giftPoints?: number } | undefined)?.giftPoints) || 0;
      const giftPointsTotal = curGift + granted;

      // Record the nonce result (idempotency) regardless of granted amount.
      tx.create(nonceRef, { granted, giftPointsTotal, remainingThisWeek, weekKey, syntheticUid, ts: nowIso });
      if (granted > 0) {
        tx.set(userRef, { giftPoints: FieldValue.increment(granted) }, { merge: true });
        tx.set(ledgerCol.doc(), { delta: granted, weekKey, nonce, source: "yooniz_gift", ts: nowIso });
      }
      return { granted, giftPointsTotal, remainingThisWeek };
    });
    return NextResponse.json(out);
  } catch (err) {
    console.error("[yooniz/gift] failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
