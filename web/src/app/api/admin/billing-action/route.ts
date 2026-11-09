import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Billing support actions (Gadi 2026-11-08). The Stripe key stays in Vercel.
 *
 *   POST /api/admin/billing-action?secret=$ADMIN_SECRET
 *
 *   {"action":"pay_invoice","invoice":"in_..."}
 *     Charges an open invoice now with the saved card (after the customer
 *     says the card is fixed). Returns the bank's decline reason on failure.
 *
 *   {"action":"move_billing_day","subscription":"sub_...","until":"2026-11-16T06:00:00Z","dryRun":true}
 *     Moves the monthly billing day: voids the open renewal invoices of the
 *     subscription and sets a free stretch until `until`. From then the
 *     customer is billed on that day every month. dryRun shows what would change.
 */

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || req.nextUrl.searchParams.get("secret") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    if (body.action === "pay_invoice") {
      const id = String(body.invoice || "");
      if (!id.startsWith("in_")) return NextResponse.json({ error: "invoice required" }, { status: 400 });
      try {
        const inv = await stripe.invoices.pay(id);
        return NextResponse.json({ ok: true, invoice: inv.id, status: inv.status, amountPaid: inv.amount_paid, currency: inv.currency });
      } catch (e) {
        const err = e as { code?: string; decline_code?: string; message?: string };
        return NextResponse.json({ ok: false, code: err.code, declineCode: err.decline_code, message: err.message });
      }
    }

    if (body.action === "move_billing_day") {
      const subId = String(body.subscription || "");
      const until = Math.floor(new Date(String(body.until || "")).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      if (!subId.startsWith("sub_")) return NextResponse.json({ error: "subscription required" }, { status: 400 });
      if (!until || until < now + 3600 || until > now + 40 * 86400) {
        return NextResponse.json({ error: "until must be between 1 hour and 40 days from now" }, { status: 400 });
      }
      const sub = await stripe.subscriptions.retrieve(subId);
      if (sub.status === "canceled") return NextResponse.json({ error: "subscription canceled" }, { status: 409 });
      const open = await stripe.invoices.list({ subscription: subId, status: "open", limit: 10 });
      const toVoid = open.data.filter((i) => i.billing_reason === "subscription_cycle");
      if (body.dryRun) {
        return NextResponse.json({
          dryRun: true,
          status: sub.status,
          wouldVoid: toVoid.map((i) => ({ id: i.id, amountDue: i.amount_due, currency: i.currency })),
          nextCharge: new Date(until * 1000).toISOString(),
        });
      }
      const voided: string[] = [];
      for (const i of toVoid) {
        await stripe.invoices.voidInvoice(i.id!);
        voided.push(i.id!);
      }
      const updated = await stripe.subscriptions.update(subId, {
        trial_end: until,
        proration_behavior: "none",
        metadata: { ...sub.metadata, billingDayMoved: new Date().toISOString().slice(0, 10) },
      });
      return NextResponse.json({ ok: true, voided, status: updated.status, nextCharge: new Date(until * 1000).toISOString() });
    }

    // A card-update link that needs no login (for customers who can't sign in,
    // e.g. a forgotten password). Stripe's hosted page, valid 23 hours. On
    // success /api/card-saved makes the new card the subscription's card and
    // pays any open invoice. Gadi 2026-11-09 (Ilanit).
    //   {"action":"card_link","customer":"cus_..."}
    if (body.action === "card_link") {
      const customer = String(body.customer || "");
      if (!customer.startsWith("cus_")) return NextResponse.json({ error: "customer required" }, { status: 400 });
      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer,
        payment_method_types: ["card"],
        expires_at: Math.floor(Date.now() / 1000) + 23 * 3600,
        metadata: { purpose: "card_update" },
        success_url: "https://www.gadit.app/api/card-saved?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "https://www.gadit.app/",
      });
      return NextResponse.json({ ok: true, url: session.url, expiresAt: new Date(session.expires_at * 1000).toISOString() });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 500) }, { status: 500 });
  }
}
