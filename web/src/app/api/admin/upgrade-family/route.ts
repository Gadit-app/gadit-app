import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Admin — upgrade an existing Clear/Deep subscriber to the Family plan on
 * their EXISTING Stripe subscription (Gadi 2026-08-03: students who bought
 * Clear/Deep before Family launched).
 *
 * What it does, in one shot:
 *   1. Finds the user's live subscription in Stripe.
 *   2. Swaps the price to the matching Family price (monthly↔monthly,
 *      yearly↔yearly) with `always_invoice` proration — Stripe credits the
 *      unused Clear/Deep and charges the difference NOW (Gadi's choice).
 *   3. Stamps metadata.uid + metadata.email on the sub so the webhook's
 *      activateFromSubscriptionMetadata path re-provisions them as a REAL
 *      Family owner (plan=deep + familyId + bootstrapped family doc), not
 *      just "Deep". Old hosted-checkout subs had no metadata.uid, so a bare
 *      price change would have left them without the family dashboard.
 *
 * No new subscription, no re-entering a card, no double billing.
 *
 * USAGE:
 *   POST /api/admin/upgrade-family?secret=$ADMIN_SECRET
 *   Body: { "email": "student@example.com" }  (or { "uid": "..." })
 *   Optional: ?dryRun=1 — report the planned change, charge nothing.
 *
 * Auth: ADMIN_SECRET via ?secret= (same as the sibling admin routes).
 */

export const maxDuration = 60;

function gate(req: NextRequest): NextResponse | null {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function POST(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  let email = "";
  let uidParam = "";
  try {
    const body = (await req.json()) as { email?: string; uid?: string };
    email = (body.email ?? "").trim().toLowerCase();
    uidParam = (body.uid ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!email && !uidParam) {
    return NextResponse.json({ error: "email or uid required" }, { status: 400 });
  }

  const auth = getAdminAuth();
  const db = getAdminDb();

  // Resolve uid.
  let uid: string | null = uidParam || null;
  if (!uid && email) {
    try {
      uid = (await auth.getUserByEmail(email)).uid;
    } catch {
      return NextResponse.json({ error: "no Firebase user for that email" }, { status: 404 });
    }
  }
  if (!uid) return NextResponse.json({ error: "could not resolve uid" }, { status: 404 });

  // Doc → email + stripeCustomerId.
  const doc = await db.collection("users").doc(uid).get();
  const d = doc.exists ? (doc.data() ?? {}) : {};
  if (!email) email = (d.email as string | undefined) ?? "";
  let customerId = (d.stripeCustomerId as string | undefined) ?? null;
  if (!customerId && email) {
    const found = await stripe.customers.list({ email, limit: 1 });
    customerId = found.data[0]?.id ?? null;
  }
  if (!customerId) return NextResponse.json({ error: "no Stripe customer for this user" }, { status: 404 });

  // Live subscription (active preferred, else trialing-with-card).
  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  const live = subs.data.find((s) => s.status === "active")
    ?? subs.data.find((s) => s.status === "trialing" && !!s.default_payment_method);
  if (!live) return NextResponse.json({ error: "no live subscription to upgrade" }, { status: 404 });

  const item = live.items.data[0];
  const currentPrice = item?.price;
  const interval = currentPrice?.recurring?.interval; // "month" | "year"
  if (!item || !interval) return NextResponse.json({ error: "could not read current price/interval" }, { status: 500 });

  const familyMonthly = process.env.STRIPE_PRICE_FAMILY_MONTHLY;
  const familyYearly = process.env.STRIPE_PRICE_FAMILY_YEARLY;
  const familyPrice = interval === "year" ? familyYearly : familyMonthly;
  if (!familyPrice) return NextResponse.json({ error: "Family price env var not set" }, { status: 503 });

  if (currentPrice?.id === familyPrice) {
    return NextResponse.json({ ok: true, alreadyFamily: true, uid, email, subId: live.id });
  }

  const plan = {
    uid, email, subId: live.id, cycle: interval,
    from: currentPrice?.id, fromAmount: (currentPrice?.unit_amount ?? 0) / 100,
    to: familyPrice,
  };

  if (dryRun) {
    return NextResponse.json({ dryRun: true, ...plan, note: "Re-run without dryRun=1 to apply. Will charge the prorated difference now." });
  }

  // Apply: swap the price, stamp uid/email so the webhook provisions Family,
  // and invoice the proration immediately (charge the difference now).
  await stripe.subscriptions.update(live.id, {
    items: [{ id: item.id, price: familyPrice }],
    metadata: { ...(live.metadata ?? {}), uid, ...(email ? { email } : {}) },
    proration_behavior: "always_invoice",
  });

  return NextResponse.json({
    ok: true,
    ...plan,
    provisioning: "The webhook (subscription.updated) now sets plan=deep + familyId and bootstraps the family doc.",
  });
}
