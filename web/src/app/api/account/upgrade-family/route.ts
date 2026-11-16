import { NextRequest, NextResponse } from "next/server";
import { isIosAppUA } from "@/lib/native-app";
import Stripe from "stripe";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Self-service — a Clear/Deep subscriber upgrades THEMSELVES to the Family
 * plan on their EXISTING Stripe subscription, from their own account area
 * (Gadi 2026-08-03: we must never force-upgrade a paying customer; the
 * consent has to be theirs, initiated from "change plan"). The auth here is
 * the user's OWN Firebase ID token — that IS the consent.
 *
 * Same mechanics as /api/admin/upgrade-family, but scoped to the caller:
 *   1. Find the caller's live subscription in Stripe.
 *   2. Swap the price to the matching Family price (monthly↔monthly,
 *      yearly↔yearly) with `always_invoice` proration — Stripe credits the
 *      unused Clear/Deep and charges the difference NOW.
 *   3. Stamp metadata.uid + metadata.email so the webhook re-provisions
 *      them as a REAL Family owner (plan=deep + familyId + family doc).
 *
 * No new subscription, no re-entering a card. GET first to preview
 * (interval + estimated Family price) so the button copy can be honest.
 *
 * 2026-11-16 (Gadi approved the button on the account page): the preview now
 * carries the exact amount charged today (Stripe's own proration preview,
 * pinned by proration_date so the charge matches it), and the switch happens
 * only when that payment goes through (payment_behavior
 * "pending_if_incomplete"): a declined card leaves the plan as it was instead
 * of a Family plan with an unpaid invoice. Never inside the Play or iOS app.
 */

export const maxDuration = 60;

/** The Play app (TWA) and the iOS app never sell: the same rule as middleware.ts. */
function inStoreApp(req: NextRequest): boolean {
  if (isIosAppUA(req.headers.get("user-agent"))) return true;
  const host = (req.headers.get("host") || "").split(":")[0];
  return host !== "gadit.app" && req.cookies.get("gadit_play")?.value === "1";
}

/** The amount of a price in the subscription's currency (a multi-currency price keeps the others in currency_options). */
async function priceIn(priceId: string, currency: string): Promise<number | null> {
  try {
    const p = await stripe.prices.retrieve(priceId, { expand: ["currency_options"] });
    if (p.currency === currency) return p.unit_amount ?? null;
    const opt = (p as unknown as { currency_options?: Record<string, { unit_amount?: number | null }> }).currency_options?.[currency];
    return opt?.unit_amount ?? null;
  } catch { return null; }
}

async function resolveCaller(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  return verifyUserAndGetPlan(idToken);
}

/**
 * Find the caller's live subscription + resolve the target Family price for
 * its billing interval. Shared by GET (preview) and POST (apply).
 */
async function loadUpgradeContext(uid: string) {
  const db = getAdminDb();
  const doc = await db.collection("users").doc(uid).get();
  const d = doc.exists ? (doc.data() ?? {}) : {};
  const email = (d.email as string | undefined) ?? "";
  const alreadyFamily = !!d.familyId;
  const isSchool = !!d.schoolId;

  let customerId = (d.stripeCustomerId as string | undefined) ?? null;
  if (!customerId && email) {
    const found = await stripe.customers.list({ email, limit: 1 });
    customerId = found.data[0]?.id ?? null;
  }

  return { db, email, alreadyFamily, isSchool, customerId };
}

export async function GET(req: NextRequest) {
  const caller = await resolveCaller(req);
  if (!caller) return NextResponse.json({ error: "login_required" }, { status: 401 });
  if (inStoreApp(req)) return NextResponse.json({ eligible: false, reason: "in_app" });

  const { email, alreadyFamily, isSchool, customerId } = await loadUpgradeContext(caller.userId);

  // Not eligible → tell the client so it can hide the button.
  if (alreadyFamily) return NextResponse.json({ eligible: false, reason: "already_family" });
  if (isSchool) return NextResponse.json({ eligible: false, reason: "school" });
  if (caller.plan !== "clear" && caller.plan !== "deep") {
    return NextResponse.json({ eligible: false, reason: "not_paid" });
  }
  if (!customerId) return NextResponse.json({ eligible: false, reason: "no_customer" });

  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  const live = subs.data.find((s) => s.status === "active")
    ?? subs.data.find((s) => s.status === "trialing" && !!s.default_payment_method);
  if (!live) return NextResponse.json({ eligible: false, reason: "no_live_sub" });
  // Set to end: switching would only change the last weeks of a plan that is leaving.
  if (live.cancel_at_period_end) return NextResponse.json({ eligible: false, reason: "canceling" });

  const currentPrice = live.items.data[0]?.price;
  const interval = currentPrice?.recurring?.interval; // "month" | "year"
  if (!interval) return NextResponse.json({ eligible: false, reason: "no_interval" });

  const familyPrice = interval === "year"
    ? process.env.STRIPE_PRICE_FAMILY_YEARLY
    : process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  if (!familyPrice) return NextResponse.json({ eligible: false, reason: "no_family_price" });
  if (currentPrice?.id === familyPrice) return NextResponse.json({ eligible: false, reason: "already_family" });

  // What the switch costs: the Family price in the subscription's currency,
  // and today's charge as Stripe would invoice it (the unused part of the
  // current plan is credited). proration_date pins the preview; the POST
  // sends it back so the charge equals what the user saw.
  const currency = live.currency;
  const familyAmount = await priceIn(familyPrice, currency);
  const prorationDate = Math.floor(Date.now() / 1000);
  let amountNow: number | null = null;
  try {
    const preview = await stripe.invoices.createPreview({
      customer: customerId,
      subscription: live.id,
      subscription_details: {
        items: [{ id: live.items.data[0].id, price: familyPrice }],
        proration_behavior: "always_invoice",
        proration_date: prorationDate,
      },
    });
    const isProration = (l: Stripe.InvoiceLineItem) =>
      !!(l.parent?.subscription_item_details?.proration || l.parent?.invoice_item_details?.proration);
    amountNow = Math.max(0, preview.lines.data.filter(isProration).reduce((n, l) => n + l.amount, 0));
  } catch (err) {
    console.warn("[upgrade-family] preview failed:", err);
  }
  // No honest number, no button: we never ask to approve an unknown charge.
  if (familyAmount == null || amountNow == null) return NextResponse.json({ eligible: false, reason: "no_preview" });

  return NextResponse.json({
    eligible: true,
    interval, // "month" | "year"
    email: email || null,
    currency,
    familyAmount: familyAmount / 100,
    amountNow: amountNow / 100,
    trialing: live.status === "trialing",
    prorationDate,
  });
}

export async function POST(req: NextRequest) {
  // A plan change that charges now: never from inside the iOS app (App Review 3.1.1).
  if (inStoreApp(req)) {
    return NextResponse.json({ error: "not_available_in_app" }, { status: 403 });
  }
  const caller = await resolveCaller(req);
  if (!caller) return NextResponse.json({ error: "login_required" }, { status: 401 });

  const { email, alreadyFamily, isSchool, customerId } = await loadUpgradeContext(caller.userId);

  if (alreadyFamily) return NextResponse.json({ ok: true, alreadyFamily: true });
  if (isSchool) return NextResponse.json({ error: "school_account" }, { status: 400 });
  if (caller.plan !== "clear" && caller.plan !== "deep") {
    return NextResponse.json({ error: "not_a_paid_plan" }, { status: 400 });
  }
  if (!customerId) return NextResponse.json({ error: "no_customer" }, { status: 404 });

  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  const live = subs.data.find((s) => s.status === "active")
    ?? subs.data.find((s) => s.status === "trialing" && !!s.default_payment_method);
  if (!live) return NextResponse.json({ error: "no_live_subscription" }, { status: 404 });
  if (live.cancel_at_period_end) return NextResponse.json({ error: "subscription_canceling" }, { status: 409 });

  const item = live.items.data[0];
  const interval = item?.price?.recurring?.interval;
  if (!item || !interval) return NextResponse.json({ error: "could_not_read_price" }, { status: 500 });

  const familyPrice = interval === "year"
    ? process.env.STRIPE_PRICE_FAMILY_YEARLY
    : process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  if (!familyPrice) return NextResponse.json({ error: "family_price_not_set" }, { status: 503 });
  if (item.price?.id === familyPrice) return NextResponse.json({ ok: true, alreadyFamily: true });

  // The proration time the user saw in the preview, so the charge matches it
  // (only a recent one, inside the current period).
  let body: { prorationDate?: unknown } = {};
  try { body = await req.json(); } catch { /* no body: prorate as of now */ }
  const now = Math.floor(Date.now() / 1000);
  const pd = typeof body.prorationDate === "number" ? Math.floor(body.prorationDate) : null;
  const periodStart = (item as unknown as { current_period_start?: number }).current_period_start ?? 0;
  const prorationDate = pd && pd <= now && pd > now - 30 * 60 && pd >= periodStart ? pd : undefined;

  // 1. Stamp uid/email so the webhook provisions the Family (family doc,
  //    familyId) once the price changes. Harmless on its own.
  await stripe.subscriptions.update(live.id, {
    metadata: { ...(live.metadata ?? {}), uid: caller.userId, ...(email ? { email } : {}) },
  });
  // 2. Swap the price and invoice the difference now. "pending_if_incomplete":
  //    the new price applies only once that invoice is paid; a declined card
  //    leaves the subscription exactly as it was.
  const updated = await stripe.subscriptions.update(live.id, {
    items: [{ id: item.id, price: familyPrice }],
    proration_behavior: "always_invoice",
    payment_behavior: "pending_if_incomplete",
    ...(prorationDate ? { proration_date: prorationDate } : {}),
  });
  if (updated.pending_update) {
    // Not paid: void the invoice so no retry charges for a switch that did not happen.
    try {
      const inv = typeof updated.latest_invoice === "string" ? updated.latest_invoice : updated.latest_invoice?.id;
      if (inv) {
        const got = await stripe.invoices.retrieve(inv);
        if (got.status === "open" && got.id) await stripe.invoices.voidInvoice(got.id);
      }
    } catch (err) {
      console.warn("[upgrade-family] void after a failed payment:", err);
    }
    return NextResponse.json({ error: "payment_failed" }, { status: 402 });
  }

  return NextResponse.json({ ok: true, cycle: interval });
}
