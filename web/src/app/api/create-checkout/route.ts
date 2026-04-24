import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Only Clear MONTHLY gets a free trial. Clear yearly and Deep do not.
const TRIAL_DAYS = 14;
const CLEAR_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_MONTHLY ?? "";

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

    const isClearMonthly = !!CLEAR_MONTHLY_PRICE_ID && priceId === CLEAR_MONTHLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}/?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}/?canceled=1`,
      metadata: { userId },
      ...(isClearMonthly && {
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
