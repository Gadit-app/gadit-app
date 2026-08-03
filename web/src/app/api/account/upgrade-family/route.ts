import { NextRequest, NextResponse } from "next/server";
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
 */

export const maxDuration = 60;

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

  const currentPrice = live.items.data[0]?.price;
  const interval = currentPrice?.recurring?.interval; // "month" | "year"
  if (!interval) return NextResponse.json({ eligible: false, reason: "no_interval" });

  const familyPrice = interval === "year"
    ? process.env.STRIPE_PRICE_FAMILY_YEARLY
    : process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  if (!familyPrice) return NextResponse.json({ eligible: false, reason: "no_family_price" });
  if (currentPrice?.id === familyPrice) return NextResponse.json({ eligible: false, reason: "already_family" });

  // Best-effort Family price for the CTA copy (currency + amount).
  let familyAmount: number | null = null;
  let familyCurrency: string | null = null;
  try {
    const fp = await stripe.prices.retrieve(familyPrice);
    familyAmount = fp.unit_amount != null ? fp.unit_amount / 100 : null;
    familyCurrency = fp.currency ?? null;
  } catch { /* copy falls back to a generic label */ }

  return NextResponse.json({
    eligible: true,
    interval, // "month" | "year"
    email: email || null,
    familyAmount,
    familyCurrency,
  });
}

export async function POST(req: NextRequest) {
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

  const item = live.items.data[0];
  const interval = item?.price?.recurring?.interval;
  if (!item || !interval) return NextResponse.json({ error: "could_not_read_price" }, { status: 500 });

  const familyPrice = interval === "year"
    ? process.env.STRIPE_PRICE_FAMILY_YEARLY
    : process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  if (!familyPrice) return NextResponse.json({ error: "family_price_not_set" }, { status: 503 });
  if (item.price?.id === familyPrice) return NextResponse.json({ ok: true, alreadyFamily: true });

  // Swap the price, stamp uid/email so the webhook provisions Family, and
  // invoice the proration now (charge the difference immediately).
  await stripe.subscriptions.update(live.id, {
    items: [{ id: item.id, price: familyPrice }],
    metadata: { ...(live.metadata ?? {}), uid: caller.userId, ...(email ? { email } : {}) },
    proration_behavior: "always_invoice",
  });

  return NextResponse.json({ ok: true, cycle: interval });
}
