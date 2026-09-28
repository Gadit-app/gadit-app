import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isNewSchoolsPrice } from "@/lib/schools-prices";

/**
 * POST /api/renew — one stable way back for a customer whose subscription
 * ended after failed charges (Gadi 2026-09-28, Ortal's case). A canceled
 * Stripe subscription cannot be reopened, so this sends the signed-in user
 * to the right place for their state:
 *   - active / trialing sub   → { status: "active" } (nothing to do)
 *   - past_due sub            → the open invoice's hosted page (pay it, the
 *                               same subscription continues)
 *   - only canceled subs      → a hosted Checkout for the SAME price and
 *                               currency, on the SAME Stripe customer, with
 *                               NO trial; the webhook re-provisions the
 *                               existing account (family, kids and notebooks
 *                               are kept; bootstrapFamily is idempotent).
 *   - never subscribed        → { status: "none" } (the page links to plans)
 *
 * Auth: Firebase ID token (Bearer). Blocked inside the Play app by the
 * middleware (BLOCKED_IN_PLAY), like every purchase surface.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FAMILY_IDS = [process.env.STRIPE_PRICE_FAMILY_MONTHLY, process.env.STRIPE_PRICE_FAMILY_YEARLY].filter(Boolean);
const SCHOOLS_IDS = [
  process.env.STRIPE_PRICE_SCHOOLS_MONTHLY,
  process.env.STRIPE_PRICE_SCHOOLS_YEARLY,
  process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY,
  process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY,
  process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY,
  process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY,
].filter(Boolean);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid: string;
  let email: string | undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
    email = decoded.email ?? undefined;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { lang?: string };
  const lang = typeof body.lang === "string" && /^[a-z]{2,3}(-[A-Z]{2})?$/.test(body.lang) ? body.lang : "he";
  const prefix = lang === "en" ? "" : `/${lang}`;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.gadit.app";

  try {
    const snap = await getAdminDb().collection("users").doc(uid).get();
    const data = snap.data() ?? {};
    // Already has paid access (incl. plans granted by hand with no Stripe
    // sub, and a past_due user still inside the grace window is handled
    // below). A lapsed sub always lands on plan "basic" in the webhook/cron.
    if (data.plan && data.plan !== "basic" && data.subscriptionStatus !== "past_due") {
      return NextResponse.json({ status: "active" });
    }
    let customerId = typeof data.stripeCustomerId === "string" ? data.stripeCustomerId : "";
    if (!customerId && email) {
      const found = await stripe.customers.list({ email, limit: 1 });
      customerId = found.data[0]?.id ?? "";
    }
    if (!customerId) return NextResponse.json({ status: "none" });

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
    if (subs.data.some((s) => s.status === "active" || s.status === "trialing")) {
      return NextResponse.json({ status: "active" });
    }

    const pastDue = subs.data.find((s) => s.status === "past_due" || s.status === "unpaid");
    if (pastDue) {
      const open = await stripe.invoices.list({ subscription: pastDue.id, status: "open", limit: 1 });
      const url = open.data[0]?.hosted_invoice_url;
      if (url) return NextResponse.json({ status: "redirect", url });
    }

    // Newest ended subscription = the plan to bring back.
    const ended = subs.data
      .filter((s) => s.status === "canceled" || s.status === "incomplete_expired")
      .sort((a, b) => (b.canceled_at ?? b.created) - (a.canceled_at ?? a.created))[0];
    // The plan we last provisioned for this account wins over "newest ended
    // Stripe sub": a Family owner with an older Deep trial must get Family.
    const storedPrice = typeof data.priceId === "string" && data.priceId.startsWith("price_") ? data.priceId : "";
    const priceId = storedPrice || ended?.items.data[0]?.price?.id || "";
    if (!priceId) return NextResponse.json({ status: "none" });

    // Bill in the currency they paid before (₪ for Hebrew families).
    let currency = ended?.currency ?? "usd";
    if (ended) {
      const inv = await stripe.invoices.list({ subscription: ended.id, limit: 1 });
      currency = inv.data[0]?.currency ?? currency;
    }

    const isFamily = FAMILY_IDS.includes(priceId);
    const isSchools = SCHOOLS_IDS.includes(priceId) || isNewSchoolsPrice(priceId);
    const home = isSchools ? `${prefix}/schools` : isFamily ? `${prefix}/family` : `${prefix}/`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(currency !== "usd" && { currency }),
      adaptive_pricing: { enabled: false },
      payment_method_types: ["card"],
      payment_method_collection: "always",
      client_reference_id: uid,
      metadata: {
        userId: uid,
        renew: "1",
        ...(isFamily && { isFamily: "1" }),
        ...(isSchools && { isSchools: "1" }),
      },
      locale: "auto",
      success_url: `${base}${home}`,
      cancel_url: `${base}${prefix}/renew`,
    });
    return NextResponse.json({ status: "redirect", url: session.url });
  } catch (err) {
    console.error("[renew] failed:", err);
    return NextResponse.json({ error: "renew_failed" }, { status: 500 });
  }
}
