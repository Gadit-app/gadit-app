import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * /api/subscribe — in-app checkout (Stripe Payment Element flow).
 *
 * Ported from the Yooniz playbook (Gadi, 2026-07-12): Stripe's HOSTED
 * Checkout has no Hebrew locale, so Hebrew users get an in-app payment
 * page (/checkout) rendered with the Payment Element at locale "he".
 * The hosted flow (create-checkout) stays untouched as the path for
 * other languages and as fallback.
 *
 * Gadit divergence from the Yooniz recipe: EVERY Gadit tier has a
 * 14-day trial, so the first invoice is $0 and there is no
 * PaymentIntent to confirm. The subscription is created with
 * payment_behavior "default_incomplete" and the card is collected via
 * the subscription's PENDING SETUP INTENT (mode: "setup" in the
 * response). If a flow ever produces an immediately-payable invoice
 * (e.g. trial removed later), the confirmation_secret path is also
 * wired (mode: "payment"). SDK v22 note: invoice.payment_intent was
 * removed — latest_invoice.confirmation_secret is the only way to a
 * payment client secret.
 *
 * Activation: the subscription carries metadata.uid, and the webhook's
 * subscription-event path (customer.subscription.created/updated)
 * provisions the account once a payment method is attached. No
 * checkout.session exists in this flow.
 */

const TRIAL_DAYS = 14;

function paidPriceIds(): Set<string> {
  return new Set(
    [
      process.env.STRIPE_PRICE_CLEAR_MONTHLY,
      process.env.STRIPE_PRICE_CLEAR_YEARLY,
      process.env.STRIPE_PRICE_DEEP_MONTHLY,
      process.env.STRIPE_PRICE_DEEP_YEARLY,
      process.env.STRIPE_PRICE_FAMILY_MONTHLY,
      process.env.STRIPE_PRICE_FAMILY_YEARLY,
      process.env.STRIPE_PRICE_SCHOOLS_MONTHLY,
      process.env.STRIPE_PRICE_SCHOOLS_YEARLY,
      process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY,
      process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY,
    ].filter((v): v is string => !!v),
  );
}

/** Resolve (or create) the Stripe customer for this user, self-healing
 *  when the stored customerId was deleted on Stripe's side. The id is
 *  written back to the user doc IMMEDIATELY so the webhook's
 *  customer-lookup fallback can always find this user. */
async function resolveCustomer(uid: string, email: string | undefined): Promise<string> {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  const existing = snap.exists ? (snap.data()?.stripeCustomerId as string | undefined) : undefined;

  if (existing) {
    try {
      const c = await stripe.customers.retrieve(existing);
      if (!(c as Stripe.DeletedCustomer).deleted) return existing;
    } catch {
      // fall through to create a fresh customer
    }
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { uid },
  });
  await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

type ClientSecretResult = { clientSecret: string; mode: "setup" | "payment" } | null;

function extractClientSecret(sub: Stripe.Subscription): ClientSecretResult {
  const seti = sub.pending_setup_intent;
  if (seti && typeof seti === "object" && seti.client_secret) {
    return { clientSecret: seti.client_secret, mode: "setup" };
  }
  const invoice = sub.latest_invoice;
  if (invoice && typeof invoice === "object") {
    const conf = (invoice as unknown as { confirmation_secret?: { client_secret?: string } })
      .confirmation_secret;
    if (conf?.client_secret) {
      return { clientSecret: conf.client_secret, mode: "payment" };
    }
  }
  return null;
}

const SUB_EXPAND = ["pending_setup_intent", "latest_invoice.confirmation_secret"];

export async function POST(req: NextRequest) {
  try {
    const { priceId, code, lang } = (await req.json()) as {
      priceId?: string;
      code?: string;
      lang?: string;
    };

    if (!priceId || !paidPriceIds().has(priceId)) {
      return NextResponse.json({ error: "invalid_price" }, { status: 400 });
    }

    // Auth — resolve user from the verified Firebase ID token only.
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const uid = decoded.uid;
    const email = decoded.email ?? undefined;

    // Optional promotion code (e.g. GREENWARTH) typed on our page.
    let discounts: Stripe.SubscriptionCreateParams.Discount[] | undefined;
    if (code && typeof code === "string" && code.trim()) {
      const promos = await stripe.promotionCodes.list({
        code: code.trim().toUpperCase(),
        active: true,
        limit: 1,
      });
      const promo = promos.data[0];
      if (!promo) {
        return NextResponse.json({ error: "invalid_code" }, { status: 400 });
      }
      discounts = [{ promotion_code: promo.id }];
    }

    const customer = await resolveCustomer(uid, email);

    // Reuse an abandoned in-progress subscription for the same price
    // (every page load would otherwise mint a new incomplete/trialing
    // sub — Yooniz landmine #4). A sub without a default payment
    // method is one whose checkout was never completed. Skipped when a
    // promo code is present: the reused sub was created WITHOUT the
    // discount, and silently dropping a coupon is worse than an extra
    // incomplete sub (trial-end cancel cleans those up anyway).
    const existing = discounts
      ? { data: [] as Stripe.Subscription[] }
      : await stripe.subscriptions.list({
      customer,
      status: "trialing",
      limit: 10,
      expand: SUB_EXPAND.map((e) => `data.${e}`),
    });
    const reusable = existing.data.find(
      (s) =>
        !s.default_payment_method &&
        s.items.data[0]?.price?.id === priceId &&
        s.metadata?.uid === uid &&
        s.pending_setup_intent,
    );
    if (reusable) {
      const secret = extractClientSecret(reusable);
      if (secret) return NextResponse.json(secret);
    }

    const sub = await stripe.subscriptions.create({
      customer,
      items: [{ price: priceId, quantity: 1 }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        // Card + Link only (Gadi 2026-07-12: Klarna / Amazon Pay confuse
        // visitors). This list propagates to the pending SetupIntent, so
        // it controls what the Payment Element displays. Google Pay and
        // Apple Pay ride on "card" automatically where the device
        // supports them (Apple Pay additionally needs the domain
        // registered in the Stripe dashboard).
        payment_method_types: ["card", "link"],
      },
      trial_period_days: TRIAL_DAYS,
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      ...(discounts && { discounts }),
      // metadata.uid is what the webhook's subscription path keys on —
      // it replaces client_reference_id of the hosted flow.
      metadata: {
        uid,
        ...(email && { email }),
        ...(lang && typeof lang === "string" && { lang: lang.slice(0, 5) }),
        surface: "payment_element",
      },
      expand: SUB_EXPAND,
    });

    const secret = extractClientSecret(sub);
    if (!secret) {
      console.error("[subscribe] no client secret on subscription", sub.id, sub.status);
      return NextResponse.json({ error: "no_client_secret" }, { status: 500 });
    }
    return NextResponse.json(secret);
  } catch (err) {
    console.error("[subscribe] error:", err);
    return NextResponse.json({ error: "subscribe_failed" }, { status: 500 });
  }
}
