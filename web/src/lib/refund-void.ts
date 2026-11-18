import "server-only";
import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { EARNED_LIFETIME_RATE, EARNED_TIER_PAYING, FIRST_SALE_BONUS_ID } from "@/lib/partners";

/**
 * Refund policy the team applies by hand (council round 5, 2026-11-18):
 * refundable on request within 14 days: the customer's first invoice with
 * amount_paid > 0 (the $0 trial invoice does not count), and any paid invoice
 * with billing_reason "subscription_cycle" on a yearly price. Refunds are
 * issued in the Stripe Dashboard; this code only handles what follows.
 *
 * A refunded (or disputed) payment takes back what it earned (council round 5,
 * 2026-11-18): the 14-day refund on the first payment must not leave a
 * partner's commission, the first paying customer bonus or a member-gets-member
 * reward in place, or "pay, refund, keep the bonus" becomes a loop.
 *
 * - The commission doc id is the Stripe invoice id. A full refund deletes an
 *   unpaid commission; a partial refund lowers it in proportion. A commission
 *   already paid out is left alone and logged (the 30-day hold makes that rare).
 * - The first-sale bonus goes when its customer's payment is refunded, unpaid.
 * - The earned 15% tier is recounted; a partner below 5 paying customers again
 *   loses the automatic rate (only when it was set automatically: earnedTierAt).
 * - An ungranted member-gets-member reward for that customer is removed.
 * Best-effort, idempotent, never throws.
 */
export async function voidEarningsForRefund(stripe: Stripe, charge: Stripe.Charge, why: "refund" | "dispute"): Promise<void> {
  try {
    const amount = charge.amount ?? 0;
    const refunded = why === "dispute" ? amount : charge.amount_refunded ?? 0;
    if (amount <= 0 || refunded <= 0) return;
    const share = Math.min(1, refunded / amount);

    const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
    const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id;
    if (!pi || !customerId) return;
    const payments = await stripe.invoicePayments.list({ payment: { type: "payment_intent", payment_intent: pi }, limit: 1 });
    const inv = payments.data[0]?.invoice;
    const invoiceId = typeof inv === "string" ? inv : inv?.id;
    if (!invoiceId) return;

    const db = getAdminDb();
    const users = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
    if (users.empty) return;
    const userRef = users.docs[0].ref;
    const uid = userRef.id;
    const u = users.docs[0].data();

    // 1. Partner commission, bonus and tier.
    const partnerId = u.referredPartnerId as string | undefined;
    if (partnerId) {
      const partnerRef = db.collection("partners").doc(partnerId);
      const commRef = partnerRef.collection("commissions").doc(invoiceId);
      const comm = await commRef.get();
      if (comm.exists) {
        const c = comm.data() ?? {};
        if (c.paidAt) {
          console.warn(`[refund] commission ${invoiceId} already paid to partner ${partnerId}; not changed`);
        } else if (share >= 1) {
          await commRef.delete();
        } else if (!c.refundShare || c.refundShare < share) {
          // Proportional to the original amount, so a second partial refund is not applied twice.
          const original = typeof c.originalAmount === "number" ? c.originalAmount : c.amount;
          await commRef.update({ originalAmount: original, amount: Math.round(original * (1 - share)), refundShare: share });
        }
      }
      if (share >= 1) {
        const bonusRef = partnerRef.collection("commissions").doc(FIRST_SALE_BONUS_ID);
        const bonus = await bonusRef.get();
        if (bonus.exists && bonus.data()?.referredUid === uid && !bonus.data()?.paidAt) await bonusRef.delete();
        // Recount paying customers (bonus docs are not payments).
        const all = await partnerRef.collection("commissions").get();
        const paying = new Set<string>();
        all.forEach((d) => { const x = d.data(); if (x.kind !== "bonus" && x.referredUid) paying.add(x.referredUid); });
        const p = (await partnerRef.get()).data() ?? {};
        if (paying.size < EARNED_TIER_PAYING && p.earnedTierAt && p.rateLifetime === EARNED_LIFETIME_RATE) {
          await partnerRef.update({ rateLifetime: FieldValue.delete(), earnedTierAt: FieldValue.delete() });
        }
      }
    }

    // 2. Member-gets-member reward, only on a full refund of the paying friend.
    const referrerUid = u.referredByUser as string | undefined;
    if (share >= 1 && referrerUid && referrerUid !== uid) {
      const rewardRef = db.collection("users").doc(referrerUid).collection("referralRewards").doc(uid);
      const reward = await rewardRef.get();
      if (reward.exists && reward.data()?.invoiceId === invoiceId && reward.data()?.granted !== true) {
        await rewardRef.delete();
        await db.collection("users").doc(referrerUid).set(
          { referralConversions: FieldValue.increment(-1), referralRewardsOwed: FieldValue.increment(-1) },
          { merge: true },
        );
      }
    }
    console.log(`[refund] ${why} on invoice ${invoiceId} (share ${share.toFixed(2)}) for ${uid}: earnings voided`);

    // 3. "A refund also ends the subscription" (Terms §3). A full refund ends
    // it only when the refunded invoice is the subscription's latest one; a
    // dispute ends it whatever invoice is disputed; a partial refund never does.
    // The customer.subscription.deleted branch then moves the user to Basic.
    if (share >= 1) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const fromInvoice = invoice.parent?.subscription_details?.subscription;
        const subId = (typeof fromInvoice === "string" ? fromInvoice : fromInvoice?.id) || (u.subscriptionId as string | undefined);
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const latest = typeof sub.latest_invoice === "string" ? sub.latest_invoice : sub.latest_invoice?.id;
          const live = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
          if (live && (why === "dispute" || latest === invoiceId)) {
            await stripe.subscriptions.cancel(subId);
            console.log(`[refund] ${why}: subscription ${subId} cancelled for ${uid}`);
          }
        }
      } catch (e) {
        console.warn("[refund] cancelling the subscription failed (non-blocking):", e);
      }
    }
  } catch (e) {
    console.warn("[refund] voidEarningsForRefund failed (non-blocking):", e);
  }
}
