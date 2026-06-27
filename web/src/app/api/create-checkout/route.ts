import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Every MONTHLY paid tier (Clear, Deep, Family) grants a 14-day trial.
// Yearly plans never get a trial — they're committing 12 months up
// front and the savings already incentivise the buy. The CTA text on
// /pricing for all three monthly tiers reads "Try 14 days free" so
// the checkout behaviour has to honour that promise.
const TRIAL_DAYS = 14;
const CLEAR_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const DEEP_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_DEEP_MONTHLY ?? "";
const FAMILY_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const FAMILY_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_YEARLY ?? "";

function isFamilyPriceId(priceId: string): boolean {
  return (
    (!!FAMILY_MONTHLY_PRICE_ID && priceId === FAMILY_MONTHLY_PRICE_ID) ||
    (!!FAMILY_YEARLY_PRICE_ID && priceId === FAMILY_YEARLY_PRICE_ID)
  );
}

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    // Resolve user from the verified Firebase ID token, NOT from a client-supplied
    // userId. Otherwise a malicious user could start a checkout that credits a
    // different account on webhook completion.
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const userId = decoded.uid;
    const userEmail = decoded.email ?? undefined;

    // (Removed) Email-verification gate that was blocking checkout.
    // Firebase's default verification email goes through their generic
    // sender and is reliably classified as spam by Gmail / Outlook /
    // Seznam (Czech), so non-Google sign-ups got stuck behind a wall
    // they couldn't get past — multiple beta testers, including a
    // user in the Czech Republic trying the Clear trial, hit this and
    // never received the email. Stripe Checkout itself requires a real
    // payment instrument (card + billing address + cardholder name),
    // which is a substantially stronger 'this is a real human who can
    // be billed' check than email round-trip. The verification email
    // is still sent on signup — verified emails are still nicer for
    // password resets and receipts — but it's no longer load-bearing
    // for purchase.

    const isClearMonthly = !!CLEAR_MONTHLY_PRICE_ID && priceId === CLEAR_MONTHLY_PRICE_ID;
    const isDeepMonthly = !!DEEP_MONTHLY_PRICE_ID && priceId === DEEP_MONTHLY_PRICE_ID;
    const isFamilyMonthly = !!FAMILY_MONTHLY_PRICE_ID && priceId === FAMILY_MONTHLY_PRICE_ID;
    // All three paid monthly tiers honour the "Try 14 days free" CTA.
    const grantsTrial = isClearMonthly || isDeepMonthly || isFamilyMonthly;

    const isFamily = isFamilyPriceId(priceId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      // Enable promotion codes so Gadi can ship one-off "first month free"
      // coupons to specific people (school principals, family/friend gifts,
      // launch partners) without having to manually provision their
      // accounts. Coupon codes are created in the Stripe dashboard.
      allow_promotion_codes: true,
      // On Family checkout, success route lands on /family so the parent
      // immediately sees the "add your kids" empty state.
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}${isFamily ? "/family?welcome=1" : "/?success=1"}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}/?canceled=1`,
      metadata: { userId, ...(isFamily && { isFamily: "1" }) },
      ...(grantsTrial && {
        subscription_data: {
          trial_period_days: TRIAL_DAYS,
          // If user cancels during trial → keep access until trial end (Stripe handles this).
          // If trial ends without payment method (shouldn't happen — Checkout collects card) → cancel.
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
        },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
