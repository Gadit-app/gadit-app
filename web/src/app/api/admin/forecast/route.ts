import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BUSINESS_TZ } from "@/lib/admin-config";
import { applyDiscounts, couponsOn } from "@/lib/admin-revenue";
import { isInternalEmail } from "@/lib/internal-accounts";

/**
 * Cash-flow forecast, read LIVE from Stripe. Answers "how much money lands in my
 * account, and on which day", split into:
 *   - conversions: trials (with a card on file) that end soon and start charging,
 *   - renewals: active subs billing again at their period end,
 *   - retries: past_due subs Stripe will retry.
 *
 * Card-less trials are excluded (they expire without charging). Amounts use the
 * recurring price (× quantity, minus any recurring discount, the same rule as
 * the Revenue page) so intro coupons don't distort the forecast. A monthly
 * sub charges again every month inside the window, not just once. Our own
 * accounts are never counted (Gadi 2026-10-10).
 *
 * Currencies are kept separate (never fake-converted). Admin-gated by ADMIN_SECRET.
 * USAGE: GET /api/admin/forecast?secret=$ADMIN_SECRET
 */

export const maxDuration = 120;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Kind = "conversion" | "renewal" | "retry";
type Charge = { at: number; kind: Kind; amount: number; currency: string; email: string | null; tier: string };

function subAmount(s: Stripe.Subscription): { amount: number; currency: string } | null {
  let total = 0;
  let currency = "";
  for (const item of s.items.data) {
    const p = item.price;
    if (!p.recurring) continue;
    total += (p.unit_amount ?? 0) * (item.quantity ?? 1);
    currency = p.currency;
  }
  if (!currency) return null;
  const coupons = couponsOn(s);
  const months = monthsOf(s);
  const native = total / 100;
  // applyDiscounts works on a monthly figure; convert there and back.
  const amount = coupons.length ? applyDiscounts(native / months, months, coupons) * months : native;
  return { amount: Math.round(amount * 100) / 100, currency };
}

/** Months between charges (1 for monthly, 12 for yearly). */
function monthsOf(s: Stripe.Subscription): number {
  const r = s.items.data[0]?.price?.recurring;
  if (!r) return 1;
  const n = r.interval_count || 1;
  return r.interval === "year" ? 12 * n : r.interval === "month" ? n : 1;
}

/** The same calendar day, `months` later. */
function addMonths(ms: number, months: number): number {
  const d = new Date(ms);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.getTime();
}

// Newer Stripe API keeps the period end on the subscription ITEM, not the sub.
function periodEndMs(s: Stripe.Subscription): number | null {
  const it = s.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  return it?.current_period_end ? it.current_period_end * 1000 : null;
}

function hasCard(s: Stripe.Subscription): boolean {
  if (s.default_payment_method) return true;
  const cust = s.customer;
  if (cust && typeof cust === "object" && !("deleted" in cust && cust.deleted)) {
    const c = cust as Stripe.Customer;
    if (c.invoice_settings?.default_payment_method) return true;
    if (c.default_source) return true;
  }
  return false;
}

function tierFromSub(s: Stripe.Subscription): string {
  // No product expand (that would push the expand past Stripe's 4-level cap and
  // 500 the whole call). The price nickname is enough for a label.
  const nick = s.items.data[0]?.price?.nickname || "";
  // Legacy Clear / Deep prices read as Individual (Gadi 2026-10-10).
  return (nick || "Subscription").replace(/^Gadit\s+/i, "").replace(/\b(Clear|Deep)\b/g, "Individual");
}

function dayKey(ms: number): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ms));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const subs: Stripe.Subscription[] = [];
  let startingAfter: string | undefined;
  do {
    const page = await stripe.subscriptions.list({
      status: "all", limit: 100, expand: ["data.customer", "data.discounts.source.coupon"],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });
    subs.push(...page.data);
    startingAfter = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (subs.length >= 3000) break;
  } while (startingAfter);

  const now = Date.now();
  const horizon = now + 92 * 86_400_000;
  const charges: Charge[] = [];
  for (const s of subs) {
    const custEmail = typeof s.customer === "object" && s.customer && !("deleted" in s.customer) ? (s.customer as Stripe.Customer).email : null;
    if (isInternalEmail(custEmail ?? (s.metadata?.email as string | undefined))) continue;
    const amt = subAmount(s);
    if (!amt || amt.amount <= 0) continue;
    let at: number | null = null;
    let kind: Kind | null = null;
    if (s.status === "trialing") {
      if (!hasCard(s)) continue; // a card-less trial never charges
      at = s.trial_end ? s.trial_end * 1000 : null;
      kind = "conversion";
    } else if (s.status === "active") {
      if (s.cancel_at_period_end) continue; // set to end, no renewal
      at = periodEndMs(s);
      kind = "renewal";
    } else if (s.status === "past_due") {
      at = periodEndMs(s) ?? now;
      kind = "retry";
    } else {
      continue;
    }
    if (!at) continue;
    const base = { amount: amt.amount, currency: amt.currency, email: custEmail ?? null, tier: tierFromSub(s) };
    charges.push({ at, kind, ...base });
    // Later charges inside the window are renewals (unless set to cancel).
    if (s.cancel_at_period_end) continue;
    const step = monthsOf(s);
    for (let next = addMonths(at, step); next <= horizon; next = addMonths(next, step)) {
      charges.push({ at: next, kind: "renewal", ...base });
    }
  }

  // Group into days. Each day: per-currency sums split by kind, plus the items.
  const byDay = new Map<string, { date: string; conversions: Record<string, number>; renewals: Record<string, number>; retries: Record<string, number>; count: number; items: Charge[] }>();
  for (const ch of charges) {
    const key = dayKey(ch.at);
    const d = byDay.get(key) ?? { date: key, conversions: {}, renewals: {}, retries: {}, count: 0, items: [] };
    const bucket = ch.kind === "conversion" ? d.conversions : ch.kind === "renewal" ? d.renewals : d.retries;
    bucket[ch.currency] = (bucket[ch.currency] ?? 0) + ch.amount;
    d.count += 1;
    d.items.push(ch);
    byDay.set(key, d);
  }

  const days = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({
    ...d,
    items: d.items.sort((a, b) => a.at - b.at).map((i) => ({ kind: i.kind, amount: i.amount, currency: i.currency, email: i.email, tier: i.tier })),
  }));

  // Rolling window totals (from now), per currency, split conversion vs renewal.
  function windowTotals(daysAhead: number) {
    const cutoff = now + daysAhead * 86_400_000;
    const conv: Record<string, number> = {};
    const renew: Record<string, number> = {};
    for (const ch of charges) {
      if (ch.at > cutoff || ch.at < now - 3 * 86_400_000) continue;
      if (ch.kind === "retry") continue; // a failed payment is not expected money
      const b = ch.kind === "renewal" ? renew : conv;
      b[ch.currency] = (b[ch.currency] ?? 0) + ch.amount;
    }
    return { conversions: conv, renewals: renew };
  }

  return NextResponse.json({
    generatedAt: new Date(now).toISOString(),
    tz: BUSINESS_TZ,
    counts: { subscriptions: subs.length, upcomingCharges: charges.length },
    next7: windowTotals(7),
    next30: windowTotals(30),
    next90: windowTotals(90),
    days,
  });
}
