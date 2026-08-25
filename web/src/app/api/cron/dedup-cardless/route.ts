import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Daily cleanup for card-less trial duplicates. The /subscribe flow already
 * cancels a user's leftover card-less trials whenever they revisit it, but a
 * card-less trial created AFTER the user already has a real (carded) sub lingers
 * if they never come back (e.g. elihtov signed up carded, then started a second
 * signup without finishing it). Such a card-less trial never charges, but it
 * clutters the dashboard as an active "trialing" row.
 *
 * This cancels a card-less trialing subscription whenever the SAME customer also
 * has a real sub — active, or trialing WITH a card. Card-less trials that stand
 * alone are left untouched (they are the user's only pending signup).
 *
 * Auth: Vercel cron Bearer CRON_SECRET, or ?secret=ADMIN_SECRET (+ &dryRun=1).
 */

export const maxDuration = 120;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  return !!qs && qs === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  // Pull every non-terminal sub, grouped by customer.
  const subs: Stripe.Subscription[] = [];
  let after: string | undefined;
  do {
    const page = await stripe.subscriptions.list({ status: "all", limit: 100, ...(after ? { starting_after: after } : {}) });
    subs.push(...page.data);
    after = page.has_more ? page.data[page.data.length - 1]?.id : undefined;
    if (subs.length >= 3000) break;
  } while (after);

  const byCustomer = new Map<string, Stripe.Subscription[]>();
  for (const s of subs) {
    const cid = typeof s.customer === "string" ? s.customer : s.customer?.id;
    if (!cid) continue;
    (byCustomer.get(cid) ?? byCustomer.set(cid, []).get(cid)!).push(s);
  }

  const toCancel: string[] = [];
  for (const list of byCustomer.values()) {
    const hasReal = list.some((s) => s.status === "active" || (s.status === "trialing" && !!s.default_payment_method) || s.status === "past_due");
    if (!hasReal) continue; // a lone card-less trial is a legit pending signup
    for (const s of list) {
      if (s.status === "trialing" && !s.default_payment_method) toCancel.push(s.id);
    }
  }

  let canceled = 0;
  if (!dryRun) {
    for (const id of toCancel) {
      try { await stripe.subscriptions.cancel(id); canceled++; }
      catch (e) { console.warn("[dedup-cardless] cancel failed", id, e); }
    }
  }

  return NextResponse.json({ ok: true, dryRun, subscriptions: subs.length, customers: byCustomer.size, cardlessDuplicates: toCancel.length, canceled });
}
