import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Admin tool — revenue dashboard, read LIVE from Stripe (Gadi 2026-08-05:
 * the old Firestore-based version drifted because it trusted the user
 * doc's `subscriptionStatus`, which lags Stripe; and it couldn't show the
 * trial pipeline). Stripe is the source of truth for money, so we list
 * subscriptions straight from it.
 *
 * What it returns:
 *   - MRR / ARR from ACTIVE (paying) subs only. Trials are NOT revenue.
 *   - active-paying + trialing counts.
 *   - a paying breakdown (tier × billing) AND a separate TRIALING
 *     breakdown, so the Family/Schools trial pipeline is visible.
 *   - subscriber rows for the table (active + trialing), at-risk
 *     (past_due/unpaid/incomplete), and recently-canceled (30d).
 *
 * Amounts come from each price live; ILS is converted to USD for one
 * unified figure. Tier is derived from the price id via the STRIPE_PRICE_*
 * env vars (same ids the webhook provisions on).
 *
 * USAGE: GET /api/admin/revenue?secret=$ADMIN_SECRET
 */

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const ILS_TO_USD = 0.27; // ~1/3.7, directional

type Tier = "clear" | "deep" | "family" | "schools";
type Billing = "monthly" | "yearly";

type Subscriber = {
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

type BreakdownEntry = { tier: Tier; billing: Billing; count: number; mrr: number };

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
  return m;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tierMap = buildTierMap();

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

  const active: Subscriber[] = [];      // active + trialing (for the table)
  const atRisk: Subscriber[] = [];
  const recentlyCanceled: Subscriber[] = [];

  let mrr = 0;
  let activePayingCount = 0;
  let trialingCount = 0;

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
    const tier: Tier = tierMap[priceId] ?? "clear";

    const cust = typeof s.customer === "object" && s.customer && !("deleted" in s.customer) ? s.customer : null;
    const email = cust?.email ?? (s.metadata?.email as string | undefined) ?? null;
    const country = cust?.address?.country ?? null;
    const stripeCustomerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;

    const sub: Subscriber = {
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
      mrr += monthlyUsd;
      if (billing !== "unknown") bump(payBreak, tier, billing, monthlyUsd);
    } else if (s.status === "trialing") {
      active.push(sub);
      trialingCount += 1;
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

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      mrrUsd: Math.round(mrr * 100) / 100,
      arrUsd: Math.round(mrr * 12 * 100) / 100,
      activePayingCount,
      trialingCount,
      atRiskCount: atRisk.length,
      recentlyCanceledCount: recentlyCanceled.length,
    },
    breakdown: toArray(payBreak),
    trialingBreakdown: toArray(trialBreak),
    active,
    atRisk,
    recentlyCanceled,
  });
}
