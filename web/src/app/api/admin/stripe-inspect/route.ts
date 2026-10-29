import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Read-only Stripe view of one customer, for billing support (Gadi
 * 2026-10-29). The Stripe key stays in Vercel: support reads Stripe through
 * this route instead of a key on the local machine.
 *
 *   GET /api/admin/stripe-inspect?secret=$ADMIN_SECRET&email=a@b.com
 *   GET /api/admin/stripe-inspect?secret=$ADMIN_SECRET&uid=<firebase uid>
 *   GET /api/admin/stripe-inspect?secret=$ADMIN_SECRET&customer=cus_...
 *
 * Returns the customer(s), their subscriptions, recent invoices, charges
 * (with the bank's decline reason) and cards. Never writes anything.
 */

const iso = (s?: number | null) => (s ? new Date(s * 1000).toISOString() : null);

type Card = Stripe.PaymentMethod.Card | Stripe.Charge.PaymentMethodDetails.Card | null | undefined;
const cardOf = (c: Card) =>
  c ? { brand: c.brand, last4: c.last4, exp: `${c.exp_month}/${c.exp_year}`, country: c.country, funding: c.funding } : null;

async function customerIds(req: NextRequest): Promise<string[]> {
  const p = req.nextUrl.searchParams;
  const customer = p.get("customer");
  if (customer) return [customer];
  const ids = new Set<string>();
  let email = p.get("email")?.trim().toLowerCase() ?? "";
  const uid = p.get("uid");
  if (uid) {
    const d = (await getAdminDb().collection("users").doc(uid).get()).data();
    if (typeof d?.stripeCustomerId === "string") ids.add(d.stripeCustomerId);
    if (!email && typeof d?.email === "string") email = d.email.toLowerCase();
  }
  if (email) {
    const list = await stripe.customers.list({ email, limit: 10 });
    for (const c of list.data) ids.add(c.id);
  }
  return [...ids];
}

async function inspect(id: string) {
  const [customer, subs, invoices, charges, cards] = await Promise.all([
    stripe.customers.retrieve(id),
    stripe.subscriptions.list({ customer: id, status: "all", limit: 10, expand: ["data.default_payment_method"] }),
    stripe.invoices.list({ customer: id, limit: 10 }),
    stripe.charges.list({ customer: id, limit: 15 }),
    stripe.paymentMethods.list({ customer: id, type: "card", limit: 10 }),
  ]);
  if ("deleted" in customer && customer.deleted) return { id, deleted: true };
  const c = customer as Stripe.Customer;
  return {
    id,
    email: c.email,
    name: c.name,
    created: iso(c.created),
    metadata: c.metadata,
    subscriptions: subs.data.map((s) => {
      const item = s.items.data[0];
      const pm = s.default_payment_method as Stripe.PaymentMethod | string | null;
      return {
        id: s.id,
        status: s.status,
        price: item?.price.id,
        amount: item?.price.unit_amount,
        currency: item?.price.currency,
        interval: item?.price.recurring?.interval,
        created: iso(s.created),
        trialEnd: iso(s.trial_end),
        periodEnd: iso(item?.current_period_end),
        cancelAtPeriodEnd: s.cancel_at_period_end,
        canceledAt: iso(s.canceled_at),
        card: pm && typeof pm === "object" ? cardOf(pm.card) : null,
        metadata: s.metadata,
      };
    }),
    invoices: invoices.data.map((i) => ({
      id: i.id,
      status: i.status,
      amountDue: i.amount_due,
      amountPaid: i.amount_paid,
      currency: i.currency,
      reason: i.billing_reason,
      created: iso(i.created),
      attempts: i.attempt_count,
      nextAttempt: iso(i.next_payment_attempt),
      payUrl: i.hosted_invoice_url,
    })),
    charges: charges.data.map((ch) => ({
      id: ch.id,
      created: iso(ch.created),
      status: ch.status,
      amount: ch.amount,
      currency: ch.currency,
      failureCode: ch.failure_code,
      failureMessage: ch.failure_message,
      outcome: ch.outcome
        ? { type: ch.outcome.type, reason: ch.outcome.reason, network: ch.outcome.network_status, message: ch.outcome.seller_message }
        : null,
      card: cardOf(ch.payment_method_details?.card),
      threeDS: ch.payment_method_details?.card?.three_d_secure?.result ?? null,
    })),
    cards: cards.data.map((p) => ({ id: p.id, ...cardOf(p.card) })),
  };
}

export async function GET(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || req.nextUrl.searchParams.get("secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const ids = await customerIds(req);
    if (ids.length === 0) return NextResponse.json({ customers: [], note: "no Stripe customer found" });
    return NextResponse.json({ customers: await Promise.all(ids.map(inspect)) });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 500) }, { status: 500 });
  }
}
