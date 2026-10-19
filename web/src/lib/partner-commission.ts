import "server-only";
import type { DocumentReference, Firestore } from "firebase-admin/firestore";
import {
  COMMISSION_HOLD_MS, EARNED_LIFETIME_RATE, EARNED_TIER_PAYING, FIRST_SALE_BONUS_ID,
  FIRST_SALE_BONUS_MINOR, firstSaleBonusActive, rateFor, type PartnerTier,
} from "@/lib/partners";

/**
 * Books one partner commission (Gadi 2026-10-18), shared by the Stripe
 * webhook (every paid invoice) and the admin's manual commission (Israeli
 * schools pay by bank transfer, outside Stripe). Applies the partner's own
 * rate, the earned tier (from the 5th paying customer, 15% after the first
 * year) and the first paying customer bonus. Idempotent on `docId`.
 * Commission is on the full amount paid, VAT included (Gadi 2026-10-18).
 */
export async function bookPartnerCommission(
  db: Firestore,
  partnerRef: DocumentReference,
  partner: Record<string, unknown> | undefined,
  c: { docId: string; referredUid: string; gross: number; currency: string; yearOne: boolean; paidAtMs: number; note?: string; manual?: boolean },
): Promise<{ booked: boolean; amount: number; rate: number; bonus: boolean }> {
  // A demo partner (Zoom presentations) never earns real commissions (Gadi 2026-10-19).
  if (partner?.demo === true) return { booked: false, amount: 0, rate: 0, bonus: false };
  const commissionRef = partnerRef.collection("commissions").doc(c.docId);
  if ((await commissionRef.get()).exists) return { booked: false, amount: 0, rate: 0, bonus: false };

  const tier = (partner?.tier as PartnerTier) ?? "standard";
  const explicit = c.yearOne ? partner?.rateYearOne : partner?.rateLifetime;
  let rate = typeof explicit === "number" ? explicit : rateFor(tier, c.yearOne);

  // Paying customers so far (bonus docs are not payments).
  const prior = await partnerRef.collection("commissions").get();
  const payingBefore = new Set<string>();
  prior.forEach((d) => { const x = d.data(); if (x.kind !== "bonus" && x.referredUid) payingBefore.add(x.referredUid); });
  const payingAfter = new Set(payingBefore).add(c.referredUid);
  const earned = payingAfter.size >= EARNED_TIER_PAYING;
  if (!c.yearOne && earned) rate = Math.max(rate, EARNED_LIFETIME_RATE);
  const amount = Math.round(c.gross * rate);

  const now = Date.now();
  const currency = (c.currency || "usd").toLowerCase();
  await commissionRef.set({
    invoiceId: c.docId,
    referredUid: c.referredUid,
    gross: c.gross,
    amount,
    currency,
    rate,
    yearOne: c.yearOne,
    createdAt: now,
    releaseAt: now + COMMISSION_HOLD_MS,
    paidAt: null,
    ...(c.manual ? { manual: true } : {}),
    ...(c.note ? { note: c.note } : {}),
  });

  // The partner reached the earned tier: their lifetime rate is 15% from now on.
  const lifetime = partner?.rateLifetime;
  if (earned && (typeof lifetime !== "number" || lifetime < EARNED_LIFETIME_RATE)) {
    await partnerRef.update({ rateLifetime: EARNED_LIFETIME_RATE, earnedTierAt: now });
  }

  // First paying customer bonus, once per partner, until the deadline.
  let bonus = false;
  if (payingBefore.size === 0 && firstSaleBonusActive(c.paidAtMs)) {
    const bonusRef = partnerRef.collection("commissions").doc(FIRST_SALE_BONUS_ID);
    const cur = currency === "ils" ? "ils" : "usd";
    bonus = await db.runTransaction(async (tx) => {
      if ((await tx.get(bonusRef)).exists) return false;
      tx.set(bonusRef, {
        invoiceId: FIRST_SALE_BONUS_ID,
        referredUid: c.referredUid,
        gross: 0,
        amount: FIRST_SALE_BONUS_MINOR[cur],
        currency: cur,
        rate: 0,
        yearOne: true,
        kind: "bonus",
        createdAt: now,
        releaseAt: now + COMMISSION_HOLD_MS,
        paidAt: null,
      });
      return true;
    });
  }
  return { booked: true, amount, rate, bonus };
}
