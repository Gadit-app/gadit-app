import Stripe from "stripe";
import { NEW_SCHOOLS_PRICE_IDS } from "@/lib/schools-prices";
import { CAC_USD, GROSS_MARGIN, BUSINESS_TZ } from "@/lib/admin-config";

/**
 * Shared Stripe revenue summary, read LIVE from Stripe.
 *
 * Stripe is the source of truth for money. The admin Revenue page AND the
 * admin Overview both call this so their numbers AGREE. Only ACTIVE (and,
 * per the 2026-08-17 spec, past_due) subs are revenue; trials are a
 * separate pipeline.
 *
 * MRR is computed to the locked spec (v4, 2026-08-17):
 *   - From `price.unit_amount` (the recurring amount), NOT the invoice, so
 *     an intro coupon (9.90) never leaks into MRR.
 *   - A subscription = the SUM of all its items (× quantity), not item[0].
 *   - months_in_interval = interval_count × {month:1, year:12}. day / week /
 *     metered are unsupported in v1 → excluded and counted as "unmapped".
 *   - Recurring discounts reduce MRR (percent_off + amount_off); a `once`
 *     coupon does NOT (it doesn't touch the recurring price).
 *   - pause_collection (paused sub) produces no cash → excluded from MRR.
 *   - No tax anywhere (US company, the Stripe amount IS the full amount).
 *   - status: active + past_due are IN MRR; past_due is ALSO surfaced as
 *     "revenue at risk" (in B2C a failed card recovers in days, so
 *     excluding it manufactures phantom churn). trialing / incomplete /
 *     canceled are never in MRR.
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
  mrrUsd: number;                 // active + past_due, spec §12
  arrUsd: number;
  /** past_due MRR that could still fail — a subset already inside mrrUsd. */
  atRiskMrrUsd: number;
  /** Monthly $ the trialing subs WOULD bring if they all convert (pipeline). */
  trialingMrrUsd: number;
  trialingArrUsd: number;
  /** mrrUsd + trialingMrrUsd — current paying plus the full trial pipeline. */
  totalMrrUsd: number;
  totalArrUsd: number;

  // --- Net-new MRR movement this calendar month (best-effort; expansion /
  //     contraction / reactivation need the read-model history, deferred). ---
  newMrrUsd: number;
  churnedMrrUsd: number;
  netNewMrrUsd: number;

  // --- Counts ---
  activePayingCount: number;      // active + past_due SUBSCRIPTIONS
  activePayingCustomers: number;  // active + past_due unique CUSTOMERS (spec §8)
  newCustomersThisMonth: number;  // first-ever paying, this month (not reactivation)
  churnedCustomersThisMonth: number;
  trialingCount: number;
  atRiskCount: number;            // past_due / unpaid / incomplete subs
  pastDueCount: number;           // just past_due (failed collection)
  scheduledCancelCount: number;   // active but cancel_at_period_end
  endedThisWeekCount: number;
  pausedCount: number;
  unmappedPriceCount: number;     // paying subs on a price we couldn't value
  recentlyCanceledCount: number;

  // --- Decision metrics (spec §13) ---
  arpuUsd: number;                // mrr / paying customers
  monthlyChurnPct: number;        // churned / paying-at-start-of-month
  trialConversionPct: number | null;   // resolved trials → paid
  trialResolvedCount: number;
  cacUsd: number;
  grossMargin: number;
  cacPaybackMonths: number | null;

  /** Paying subs (active + past_due) counted by tier. */
  payingByTier: Record<Tier, number>;
  /** Trialing subs counted by tier (the pipeline). */
  trialingByTier: Record<Tier, number>;
  payBreakdown: BreakdownEntry[];
  trialingBreakdown: BreakdownEntry[];
  active: RevenueSubscriber[];      // active + past_due + trialing (for the table)
  atRisk: RevenueSubscriber[];
  recentlyCanceled: RevenueSubscriber[];
  unmappedPriceIds: string[];

  asOf: string;
  businessTz: string;
};

// Directional FX to the reporting currency (USD). Locked constants; the
// spec wants a declared, dated FX rather than naive multi-currency summing.
const FX_TO_USD: Record<string, number> = {
  usd: 1,
  ils: 0.27,   // ~1/3.7
  eur: 1.08,
  gbp: 1.27,
};
function toUsd(amount: number, currency: string): number {
  return amount * (FX_TO_USD[currency.toLowerCase()] ?? 1);
}

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
  for (const id of NEW_SCHOOLS_PRICE_IDS) m[id] = "schools";
  return m;
}

/**
 * Map each Stripe PRODUCT id to a tier by its name. Robust fallback: a
 * Family sub on ANY Family price counts as Family even if the env var was
 * never updated to that price id.
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

/** months_in_interval per spec §11. Returns NaN for day/week/metered (v1 blocks them). */
function monthsInInterval(price: Stripe.Price | undefined): number {
  const r = price?.recurring;
  if (!r) return NaN;
  if (r.usage_type === "metered") return NaN;
  const count = r.interval_count ?? 1;
  switch (r.interval) {
    case "month": return count * 1;
    case "year":  return count * 12;
    // day / week are blocked in v1 (spec §11) — treat as unsupported.
    default:      return NaN;
  }
}

/** Loose narrowing of subscription-level coupons without `any`. */
function couponsOn(sub: Stripe.Subscription): Stripe.Coupon[] {
  const out: Stripe.Coupon[] = [];
  const s = sub as unknown as { discount?: unknown; discounts?: unknown };
  const push = (d: unknown) => {
    if (d && typeof d === "object" && "coupon" in d) {
      const c = (d as { coupon?: unknown }).coupon;
      if (c && typeof c === "object" && "id" in c) out.push(c as Stripe.Coupon);
    }
  };
  push(s.discount);
  if (Array.isArray(s.discounts)) for (const d of s.discounts) push(d);
  return out;
}

/**
 * Reduce a native-currency monthly amount by the subscription's recurring
 * coupons. `once` coupons are ignored (they don't change the recurring
 * price); percent_off and amount_off both handled. amount_off is per
 * invoice, so it's divided across the interval's months.
 */
function applyDiscounts(monthlyNative: number, months: number, coupons: Stripe.Coupon[]): number {
  let m = monthlyNative;
  for (const c of coupons) {
    if (c.duration === "once") continue; // no recurring effect
    if (typeof c.percent_off === "number" && c.percent_off > 0) {
      m = m * (1 - c.percent_off / 100);
    }
    if (typeof c.amount_off === "number" && c.amount_off > 0 && months > 0) {
      m = Math.max(0, m - (c.amount_off / 100) / months);
    }
  }
  return m;
}

function isPaused(s: Stripe.Subscription): boolean {
  return !!s.pause_collection;
}

// Business-timezone calendar-month start (spec §14: declared TZ, not raw UTC).
// At our scale the intra-day boundary shift is immaterial, but we anchor the
// cut to the declared TZ so MTD stays stable as volume grows.
function monthStartMs(tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const y = get("year");
  const mo = get("month"); // 1-12
  // Offset (ms) between the declared TZ and UTC right now.
  const asUtc = Date.UTC(y, mo - 1, get("day"), get("hour"), get("minute"), get("second"));
  const offset = asUtc - Date.now();
  // First instant of this month in the declared TZ, expressed as a real unix ms.
  return Date.UTC(y, mo - 1, 1, 0, 0, 0) - offset;
}

export async function summarizeStripeRevenue(stripe: Stripe): Promise<StripeRevenue> {
  const tierMap = buildTierMap();
  const productTier = await buildProductTierMap(stripe);

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

  const now = Date.now();
  const monthStart = monthStartMs(BUSINESS_TZ);
  const weekAgo = now - 7 * 86_400_000;
  const thirtyDaysAgo = now - 30 * 86_400_000;

  const active: RevenueSubscriber[] = [];   // active + past_due + trialing (for the table)
  const atRisk: RevenueSubscriber[] = [];
  const recentlyCanceled: RevenueSubscriber[] = [];
  const unmappedPriceIds = new Set<string>();

  let mrr = 0;
  let atRiskMrr = 0;
  let trialingMrr = 0;
  let newMrr = 0;
  let churnedMrr = 0;
  let activePayingCount = 0;
  let trialingCount = 0;
  let pastDueCount = 0;
  let scheduledCancelCount = 0;
  let endedThisWeekCount = 0;
  let pausedCount = 0;
  let trialResolvedCount = 0;
  let trialConvertedCount = 0;

  const payingByTier: Record<Tier, number> = { clear: 0, deep: 0, family: 0, schools: 0 };
  const trialingByTier: Record<Tier, number> = { clear: 0, deep: 0, family: 0, schools: 0 };
  const payingCustomers = new Set<string>();

  // Per-customer bookkeeping for new / churned customer detection.
  const earliestCreatedByCustomer = new Map<string, number>();
  const hasActiveByCustomer = new Map<string, boolean>();
  const lastEndedByCustomer = new Map<string, number>();

  const payBreak = new Map<string, BreakdownEntry>();
  const trialBreak = new Map<string, BreakdownEntry>();
  const bump = (map: Map<string, BreakdownEntry>, tier: Tier, billing: Billing, usd: number) => {
    const key = `${tier}_${billing}`;
    const cur = map.get(key) ?? { tier, billing, count: 0, mrr: 0 };
    cur.count += 1;
    cur.mrr += usd;
    map.set(key, cur);
  };

  for (const s of subs) {
    const primary = s.items.data[0]?.price;
    const priceId = primary?.id ?? "";
    const interval = primary?.recurring?.interval;
    const billing: Billing | "unknown" = interval === "year" ? "yearly" : interval === "month" ? "monthly" : "unknown";
    const currency = (primary?.currency ?? "usd").toLowerCase();
    const coupons = couponsOn(s);

    // Sum ALL items (× quantity), each valued from its own recurring price.
    let monthlyNative = 0;
    let unsupported = false;
    for (const item of s.items.data) {
      const p = item.price;
      const months = monthsInInterval(p);
      const unit = p?.unit_amount; // null for tiered / metered
      if (unit == null || !(months > 0)) { unsupported = true; continue; }
      const qty = item.quantity ?? 1;
      monthlyNative += (unit * qty) / 100 / months;
    }
    if (coupons.length) {
      const months = monthsInInterval(primary) || 1;
      monthlyNative = applyDiscounts(monthlyNative, months, coupons);
    }
    const monthlyUsd = toUsd(monthlyNative, currency);

    const prodId = typeof primary?.product === "string" ? primary.product : primary?.product?.id ?? "";
    const tier: Tier = productTier[prodId] ?? tierMap[priceId] ?? "clear";

    const cust = typeof s.customer === "object" && s.customer && !("deleted" in s.customer) ? s.customer : null;
    const email = cust?.email ?? (s.metadata?.email as string | undefined) ?? null;
    const country = cust?.address?.country ?? null;
    const stripeCustomerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
    const custKey = stripeCustomerId ?? s.id;

    const createdMs = s.created * 1000;
    const endedMs = (s.canceled_at ?? s.ended_at ?? 0) * 1000;
    const prev = earliestCreatedByCustomer.get(custKey);
    if (prev == null || createdMs < prev) earliestCreatedByCustomer.set(custKey, createdMs);

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
      signedUpAt: new Date(createdMs).toISOString(),
      stripeCustomerId,
      country,
    };

    // Trial → paid resolution (spec §13.1): a trial that has ended and is
    // now paying counts as converted; ended-and-gone counts as resolved-lost.
    if (s.trial_end && s.trial_end * 1000 < now) {
      trialResolvedCount += 1;
      if (s.status === "active" || s.status === "past_due") trialConvertedCount += 1;
    }

    const paused = isPaused(s);
    const paying = (s.status === "active" || s.status === "past_due") && !paused;

    if (paying) {
      active.push(sub);
      activePayingCount += 1;
      payingByTier[tier] += 1;
      payingCustomers.add(custKey);
      hasActiveByCustomer.set(custKey, true);
      mrr += monthlyUsd;
      if (s.status === "past_due") { atRiskMrr += monthlyUsd; pastDueCount += 1; atRisk.push(sub); }
      if (s.cancel_at_period_end) scheduledCancelCount += 1;
      if (unsupported && monthlyUsd === 0) { unmappedPriceIds.add(priceId || "(no-price)"); }
      if (billing !== "unknown" && monthlyUsd > 0) bump(payBreak, tier, billing, monthlyUsd);
      if (createdMs >= monthStart) newMrr += monthlyUsd;
    } else if (paused) {
      pausedCount += 1;
    } else if (s.status === "trialing") {
      active.push(sub);
      trialingCount += 1;
      trialingByTier[tier] += 1;
      trialingMrr += monthlyUsd;
      if (billing !== "unknown") bump(trialBreak, tier, billing, monthlyUsd);
    } else if (s.status === "unpaid" || s.status === "incomplete") {
      atRisk.push(sub);
    } else if (s.status === "canceled") {
      if (endedMs > thirtyDaysAgo) recentlyCanceled.push(sub);
      if (endedMs > weekAgo) endedThisWeekCount += 1;
      if (endedMs >= monthStart) {
        churnedMrr += monthlyUsd;
        const le = lastEndedByCustomer.get(custKey) ?? 0;
        if (endedMs > le) lastEndedByCustomer.set(custKey, endedMs);
      }
    }
  }

  // New customers this month = customers whose FIRST-EVER sub started this
  // month and who are currently paying (first-time MRR, not reactivation).
  let newCustomersThisMonth = 0;
  for (const cust of payingCustomers) {
    const first = earliestCreatedByCustomer.get(cust) ?? 0;
    if (first >= monthStart) newCustomersThisMonth += 1;
  }
  // Churned customers this month = customers with a sub ended this month and
  // no currently-paying sub.
  let churnedCustomersThisMonth = 0;
  for (const [cust, ended] of lastEndedByCustomer) {
    if (ended >= monthStart && !hasActiveByCustomer.get(cust)) churnedCustomersThisMonth += 1;
  }

  const activePayingCustomers = payingCustomers.size;
  // paying-at-start-of-month ≈ end − new + churned (standard reconstruction).
  const payingAtStart = Math.max(0, activePayingCustomers - newCustomersThisMonth + churnedCustomersThisMonth);
  const monthlyChurnPct = payingAtStart > 0
    ? Math.round((churnedCustomersThisMonth / payingAtStart) * 1000) / 10
    : 0;

  const arpuUsd = activePayingCustomers > 0 ? mrr / activePayingCustomers : 0;
  const trialConversionPct = trialResolvedCount > 0
    ? Math.round((trialConvertedCount / trialResolvedCount) * 1000) / 10
    : null;
  const cacPaybackMonths = arpuUsd > 0 && GROSS_MARGIN > 0
    ? Math.round((CAC_USD / (arpuUsd * GROSS_MARGIN)) * 10) / 10
    : null;

  active.sort((a, b) => {
    const rank = (st: string) => (st === "active" ? 2 : st === "past_due" ? 1 : 0);
    const d = rank(b.status) - rank(a.status);
    if (d !== 0) return d;
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

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const totalMrr = mrr + trialingMrr;
  return {
    mrrUsd: r2(mrr),
    arrUsd: r2(mrr * 12),
    atRiskMrrUsd: r2(atRiskMrr),
    trialingMrrUsd: r2(trialingMrr),
    trialingArrUsd: r2(trialingMrr * 12),
    totalMrrUsd: r2(totalMrr),
    totalArrUsd: r2(totalMrr * 12),
    newMrrUsd: r2(newMrr),
    churnedMrrUsd: r2(churnedMrr),
    netNewMrrUsd: r2(newMrr - churnedMrr),
    activePayingCount,
    activePayingCustomers,
    newCustomersThisMonth,
    churnedCustomersThisMonth,
    trialingCount,
    atRiskCount: atRisk.length,
    pastDueCount,
    scheduledCancelCount,
    endedThisWeekCount,
    pausedCount,
    unmappedPriceCount: unmappedPriceIds.size,
    recentlyCanceledCount: recentlyCanceled.length,
    arpuUsd: r2(arpuUsd),
    monthlyChurnPct,
    trialConversionPct,
    trialResolvedCount,
    cacUsd: CAC_USD,
    grossMargin: GROSS_MARGIN,
    cacPaybackMonths,
    payingByTier,
    trialingByTier,
    payBreakdown: toArray(payBreak),
    trialingBreakdown: toArray(trialBreak),
    active,
    atRisk,
    recentlyCanceled,
    unmappedPriceIds: [...unmappedPriceIds],
    asOf: new Date(now).toISOString(),
    businessTz: BUSINESS_TZ,
  };
}
