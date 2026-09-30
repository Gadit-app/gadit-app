import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * POST /api/portal/settle — runs right after the customer updates their card in
 * the Stripe portal (banner flow, /account?card=updated). Makes the new card
 * count immediately instead of waiting for Stripe's next Smart Retry (days):
 *   1. the customer's default card becomes every live subscription's card
 *      (a subscription-level default would otherwise keep the dead card);
 *   2. any open invoice is paid now with it.
 * The webhook then sees invoice.payment_succeeded / subscription active and
 * clears the past-due state and grace as usual. Gadi 2026-09-30.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const userInfo = await verifyUserAndGetPlan(idToken);
  if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const userDoc = await getAdminDb().collection("users").doc(userInfo.userId).get();
  const customerId = userDoc.data()?.stripeCustomerId as string | undefined;
  if (!customerId) return NextResponse.json({ error: "no_customer" }, { status: 400 });

  try {
    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    let pm =
      typeof customer.invoice_settings?.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings?.default_payment_method?.id ?? null;
    if (!pm) {
      const cards = await stripe.paymentMethods.list({ customer: customerId, type: "card", limit: 1 });
      pm = cards.data[0]?.id ?? null;
    }
    if (!pm) return NextResponse.json({ ok: false, reason: "no_card" });

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
    let subsUpdated = 0;
    for (const s of subs.data) {
      if (!["active", "trialing", "past_due", "unpaid"].includes(s.status)) continue;
      const cur = typeof s.default_payment_method === "string" ? s.default_payment_method : s.default_payment_method?.id;
      if (cur && cur !== pm) {
        await stripe.subscriptions.update(s.id, { default_payment_method: pm });
        subsUpdated++;
      }
    }

    const open = await stripe.invoices.list({ customer: customerId, status: "open", limit: 10 });
    let paid = 0;
    const failed: string[] = [];
    for (const inv of open.data) {
      if ((inv.amount_due ?? 0) <= 0 || !inv.id) continue;
      try {
        await stripe.invoices.pay(inv.id, { payment_method: pm });
        paid++;
      } catch (e) {
        failed.push(inv.id);
        console.error("[portal/settle] pay failed", inv.id, String(e));
      }
    }
    return NextResponse.json({ ok: failed.length === 0, subsUpdated, paid, failed: failed.length });
  } catch (err) {
    console.error("[portal/settle] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
