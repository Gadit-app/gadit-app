import type { RevenueSubscriber, StripeRevenue } from "@/lib/admin-revenue";

/**
 * The people behind each "needs attention" chip on the admin Overview
 * (Gadi 2026-10-18: the chips said "2 scheduled cancels" without saying
 * WHO). Each list is built from the same Stripe pass, and from the same
 * flags that bump the counters, so a list always matches its chip. Our own
 * accounts are already left out by summarizeStripeRevenue.
 */

export type AttentionKind = "payment" | "scheduled" | "ended" | "unmapped" | "cardless" | "appUpgrade";

export type AttentionPerson = {
  subId: string;
  email: string | null;
  name: string | null;
  /** Firebase uid when the Stripe customer maps to an account. */
  uid: string | null;
  country: string | null;
  tier: string;
  billing: string;
  amount: number | null;
  currency: string;
  monthlyUsd: number;
  status: string;
  /** The date that matters for this list (ISO). */
  date: string | null;
  /** A second date for context (ISO): cancel requested, period start... */
  date2: string | null;
  reason: string | null;
  stripeCustomerId: string | null;
  priceId: string | null;
};

export type UserLookup = {
  byCustomer: Map<string, string>;
  byEmail: Map<string, string>;
  info: Map<string, { name: string | null; country: string | null }>;
};

function person(s: RevenueSubscriber, look: UserLookup, date: string | null | undefined, date2: string | null | undefined): AttentionPerson {
  const uid =
    (s.stripeCustomerId ? look.byCustomer.get(s.stripeCustomerId) : undefined) ??
    (s.email ? look.byEmail.get(s.email.trim().toLowerCase()) : undefined) ??
    null;
  const u = uid ? look.info.get(uid) : undefined;
  return {
    subId: s.uid,
    email: s.email,
    name: u?.name || s.name || null,
    uid,
    country: u?.country || s.country || null,
    tier: s.tier,
    billing: s.billing,
    amount: s.amountNative ?? null,
    currency: s.currency,
    monthlyUsd: Math.round(s.monthlyUsd * 100) / 100,
    status: s.status,
    date: date ?? null,
    date2: date2 ?? null,
    reason: s.cancelReason ?? null,
    stripeCustomerId: s.stripeCustomerId,
    priceId: s.priceId ?? null,
  };
}

const byDateAsc = (a: AttentionPerson, b: AttentionPerson) => (a.date ?? "").localeCompare(b.date ?? "");
const byDateDesc = (a: AttentionPerson, b: AttentionPerson) => (b.date ?? "").localeCompare(a.date ?? "");

export function buildAttentionLists(
  rev: Pick<StripeRevenue, "active" | "atRisk" | "recentlyCanceled" | "cardlessTrials">,
  look: UserLookup,
): Record<Exclude<AttentionKind, "appUpgrade">, AttentionPerson[]> {
  return {
    // past_due / unpaid / incomplete: the charge that failed opened the
    // current period, so that is the date; the period end is when access stops.
    payment: rev.atRisk.map((s) => person(s, look, s.periodStart ?? s.signedUpAt, s.periodEnd)).sort(byDateDesc),
    // Paying and set to cancel: the day it ends, then the day they asked.
    scheduled: rev.active
      .filter((s) => s.scheduledCancel)
      .map((s) => person(s, look, s.cancelAt ?? s.periodEnd, s.canceledAt))
      .sort(byDateAsc),
    // Ended in the last 7 days (real churn, not a lapsed trial).
    ended: rev.recentlyCanceled
      .filter((s) => s.endedThisWeek)
      .map((s) => person(s, look, s.endedAt ?? s.canceledAt, s.canceledAt !== s.endedAt ? s.canceledAt : null))
      .sort(byDateDesc),
    // Paying on a price the MRR engine could not value.
    unmapped: rev.active
      .filter((s) => s.unmappedPrice)
      .map((s) => person(s, look, s.signedUpAt, null))
      .sort(byDateDesc),
    // Opened checkout and never entered a card: when they started, and the
    // day Stripe drops the trial.
    cardless: (rev.cardlessTrials ?? []).map((s) => person(s, look, s.signedUpAt, s.trialEnd)).sort(byDateDesc),
  };
}

/** Free users who hit something locked inside the Play or iOS app in the last
 *  30 days (api/app-intent, Gadi 2026-10-25): they cannot buy in the app, so
 *  they may need a hand. status = the platform, reason = what they tapped. */
export async function buildAppUpgradeList(db: FirebaseFirestore.Firestore): Promise<AttentionPerson[]> {
  const since = Date.now() - 30 * 86_400_000;
  const snap = await db.collection("users").where("appUpgradeIntent.lastAt", ">=", since).get();
  const out: AttentionPerson[] = [];
  for (const d of snap.docs) {
    const x = d.data();
    const paying = x.subscriptionStatus === "active" || x.subscriptionStatus === "trialing" || x.subscriptionStatus === "past_due";
    if (paying || x.familyId || x.schoolId) continue;
    const i = x.appUpgradeIntent ?? {};
    out.push({
      subId: d.id, email: x.email ?? null, name: x.displayName ?? x.name ?? null, uid: d.id, country: x.country ?? null,
      tier: "Basic", billing: "", amount: null, currency: "", monthlyUsd: 0,
      status: i.platform === "ios" ? "iOS app" : "Play app",
      date: i.lastAt ? new Date(i.lastAt).toISOString() : null,
      date2: i.firstAt && i.firstAt !== i.lastAt ? new Date(i.firstAt).toISOString() : null,
      reason: Array.isArray(i.features) ? i.features.join(", ") : null,
      stripeCustomerId: x.stripeCustomerId ?? null, priceId: null,
    });
  }
  return out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
