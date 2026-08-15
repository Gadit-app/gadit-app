import Stripe from "stripe";
import { NEW_SCHOOLS_PRICE_IDS } from "@/lib/schools-prices";

/**
 * Shared Stripe revenue summary, read LIVE from Stripe.
 *
 * Stripe is the source of truth for money. The admin Revenue page AND the
 * admin Overview both call this so their numbers AGREE — the Overview used
 * to compute MRR from the Firestore user doc's `subscriptionStatus`, which
 * (a) lags Stripe and (b) counted TRIALING subs as revenue, so it showed a
 * much higher "monthly revenue" than the Revenue page. Only ACTIVE (paying)
 * subs are revenue; trials are a separate pipeline (Gadi 2026-08-12).
 */

export type Tier = "clear" | "deep" | "family" | "schools";
export type Billing = "monthly" | "yearly";

export type RevenueSubscriber = {
  uid: string;            // stripe subscription id (table key)
  email: string | null;
  tier: Tier;
  billing: Billing | "unknown";
  monthlyUsd: number;
  currency: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  signedUpAt: string | null;
  stripeCustomerId: string | null;
  country: string | null;
};

export type BreakdownEntry = { tier: Tier; billing: Billing; count: number; mrr: number };

export type StripeRevenue = {
  mrrUsd: number;
  arrUsd: number;
  /** Monthly $ the trialing subs WOULD bring if they all convert (pipeline). */
  trialingMrrUsd: number;
  trialingArrUsd: number;
  /** mrrUsd + trialingMrrUsd — current paying plus the full trial pipeline. */
  totalMrrUsd: number;
  totalArrUsd: number;
  activePayingCount: number;
  trialingCount: number;
  atRiskCount: number;
  recentlyCanceledCount: number;
  /** Paying subs (active) counted by tier. */
  payingByTier: Record<Tier, number>;
  /** Trialing subs counted by tier (the pipeline). */
  trialingByTier: Record<Tier, number>;
  payBreakdown: BreakdownEntry[];
  trialingBreakdown: BreakdownEntry[];
  active: RevenueSubscriber[];      // active + trialing (for the table)
  atRisk: RevenueSubscriber[];
  recentlyCanceled: RevenueSubscriber[];
};

const ILS_TO_USD = 0.27; // ~1/3.7, directional

function buildTierMap(): Record<string, Tier> {
  const m: Record<string, Tier> = {};
  const add = (id: string | undefined, t: Tier) => { if (id) m[id] = t; };
  add(process.env.STRIPE_PRICE_CLEAR_MONTHLY, "clear");
  add(process.env.STRIPE_PRICE_CLEAR_YEARLY, "clear");
  add(process.env.STRIPE_PRICE_DEEP_MONTHLY, "deep");
  add(process.env.STRIPE_PRICE_DEEP_YEARLY, "deep");
  add(process.env.STRIPE_PRICE_FAMILY_MONTHLY, "family");
  add(process.env.STRIPE_PRICE_FAMILY_YEARLY, "family");
  add(process.env.STRIPE_PRICE_SCHOOLS_MONTHLY, "schools");
  add(process.env.STRIPE_PRICE_SCHOOLS_YEARLY, "schools");
  add(process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY, "schools");
  add(process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY, "schools");
  add(process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY, "schools");
  add(process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY, "schools");
  // New 3-tier Schools ladder (hardcoded IDs). The product-name map below
  // also catches these (same "Gadit Schools" product), this is belt-and-braces.
  for (const id of NEW_SCHOOLS_PRICE_IDS) m[id] = "schools";
  return m;
}

/**
 * Map each Stripe PRODUCT id to a tier by its name. This is the robust
 * source of truth: a Family sub on ANY Family price (current, retired,
 * monthly, yearly) counts as Family, even if the env var was never updated
 * to that price id. Env-price mapping stays as a fallback.
 */
async function buildProductTierMap(stripe: Stripe): Promise<Record<string, Tier>> {
  const m: Record<string, Tier> = {};
  const products = await stripe.products.list({ limit: 100 });
  for (const p of products.data) {
    const n = (p.name || "").toLowerCase();
    const t: Tier | null =
      n.includes("family") ? "family" :
      n.includes("school") ? "schools" :
      n.includes("deep") ? "deep" :
      n.includes("clear") ? "clear" : null;
    if (t) m[p.id] = t;
  }
  return m;
}

export async function summarizeStripeRevenue(stripe: Stripe): Promise<StripeRevenue> {
  const tierMap = buildTierMap();
  const productTier = await buildProductTierMap(stripe);

  // List all subscriptions (paginate).
  const subs: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    subs.push(...page.data);
    startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (subs.length >= 2000) break;
  } while (startingAfter);

  const active: RevenueSubscriber[] = [];   // active + trialing (for the table)
  const atRisk: RevenueSubscriber[] = [];
  const recentlyCanceled: RevenueSubscriber[] = [];

  let mrr = 0;
  let trialingMrr = 0;
  let activePayingCount = 0;
  let trialingCount = 0;
  const payingByTier: Record<Tier, number> = { clear: 0, deep: 0, family: 0, schools: 0 };
  const trialingByTier: Record<Tier, number> = { clear: 0, deep: 0, family: 0, schools: 0 };

  const payBreak = new Map<string, BreakdownEntry>();
  const trialBreak = new Map<string, BreakdownEntry>();
  const bump = (map: Map<string, BreakdownEntry>, tier: Tier, billing: Billing, usd: number) => {
    const key = `${tier}_${billing}`;
    const cur = map.get(key) ?? { tier, billing, count: 0, mrr: 0 };
    cur.count += 1;
    cur.mrr += usd;
    map.set(key, cur);
  };

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;

  for (const s of subs) {
    const price = s.items.data[0]?.price;
    const priceId = price?.id ?? "";
    const interval = price?.recurring?.interval; // "month" | "year"
    const billing: Billing | "unknown" = interval === "year" ? "yearly" : interval === "month" ? "monthly" : "unknown";
    const amount = (price?.unit_amount ?? 0) / 100;
    const currency = (price?.currency ?? "usd").toLowerCase();
    const monthlyNative = billing === "yearly" ? amount / 12 : amount;
    const monthlyUsd = currency === "ils" ? monthlyNative * ILS_TO_USD : monthlyNative;
    const prodId = typeof price?.product === "string" ? price.product : price?.product?.id ?? "";
    const tier: Tier = productTier[prodId] ?? tierMap[priceId] ?? "clear";

    const cust = typeof s.customer === "object" && s.customer && !("deleted" in s.customer) ? s.customer : null;
    const email = cust?.email ?? (s.metadata?.email as string | undefined) ?? null;
    const country = cust?.address?.country ?? null;
    const stripeCustomerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;

    const sub: RevenueSubscriber = {
      uid: s.id,
      email,
      tier,
      billing,
      monthlyUsd,
      currency,
      status: s.status,
      cancelAtPeriodEnd: s.cancel_at_period_end ?? false,
      trialEnd: s.trial_end ? new Date(s.trial_end * 1000).toISOString() : null,
      signedUpAt: new Date(s.created * 1000).toISOString(),
      stripeCustomerId,
      country,
    };

    if (s.status === "active") {
      active.push(sub);
      activePayingCount += 1;
      payingByTier[tier] += 1;
      mrr += monthlyUsd;
      if (billing !== "unknown") bump(payBreak, tier, billing, monthlyUsd);
    } else if (s.status === "trialing") {
      active.push(sub);
      trialingCount += 1;
      trialingByTier[tier] += 1;
      trialingMrr += monthlyUsd;
      if (billing !== "unknown") bump(trialBreak, tier, billing, monthlyUsd);
    } else if (s.status === "past_due" || s.status === "unpaid" || s.status === "incomplete") {
      atRisk.push(sub);
    } else if (s.status === "canceled") {
      const endedMs = (s.canceled_at ?? s.ended_at ?? 0) * 1000;
      if (endedMs > thirtyDaysAgo) recentlyCanceled.push(sub);
    }
  }

  // active first (by contribution), trialing after.
  active.sort((a, b) => {
    const ap = a.status === "active" ? 1 : 0;
    const bp = b.status === "active" ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.monthlyUsd - a.monthlyUsd;
  });
  atRisk.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));
  recentlyCanceled.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));

  const TIER_ORDER: Tier[] = ["clear", "deep", "family", "schools"];
  const toArray = (map: Map<string, BreakdownEntry>) =>
    [...map.values()]
      .map((b) => ({ ...b, mrr: Math.round(b.mrr * 100) / 100 }))
      .sort((a, b) =>
        TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
        (a.billing === "monthly" ? -1 : 1) - (b.billing === "monthly" ? -1 : 1),
      );

  const totalMrr = mrr + trialingMrr;
  return {
    mrrUsd: Math.round(mrr * 100) / 100,
    arrUsd: Math.round(mrr * 12 * 100) / 100,
    trialingMrrUsd: Math.round(trialingMrr * 100) / 100,
    trialingArrUsd: Math.round(trialingMrr * 12 * 100) / 100,
    totalMrrUsd: Math.round(totalMrr * 100) / 100,
    totalArrUsd: Math.round(totalMrr * 12 * 100) / 100,
    activePayingCount,
    trialingCount,
    atRiskCount: atRisk.length,
    recentlyCanceledCount: recentlyCanceled.length,
    payingByTier,
    trialingByTier,
    payBreakdown: toArray(payBreak),
    trialingBreakdown: toArray(trialBreak),
    active,
    atRisk,
    recentlyCanceled,
  };
}
