import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * /api/retention — the in-app cancellation flow with a one-time save offer.
 *
 * Cancellation used to live only inside Stripe's hosted billing portal. This
 * funnels it through us so we can show a save offer first. The offer, and the
 * "once per customer" rule, come straight from the 2026-08-25 LLM council on
 * retention:
 *
 *   "trial extension, once."  NOT money — a discount devalues the price and
 *   trains cancel-for-a-deal; an extension costs nothing, doesn't touch the
 *   price, and buys activation time (the real reason carded trialers bail).
 *
 * So the offer is a 14-day trial extension, shown ONCE ever (gated by
 * users/{uid}.retentionOfferShownAt), only to a TRIALING sub that has a card
 * on file. An active payer who cancels gets no offer (outside the council's
 * scope) and goes straight to cancel.
 *
 * Mechanism note: Stripe coupons only apply to full invoice cycles (>= 1
 * month), never to 14 extra trial days, so the extension pushes trial_end,
 * it is not a coupon.
 *
 * Actions (POST { action }):
 *   "check"  -> { trialing, hasCard, offerEligible }  (UI decides what to show)
 *   "extend" -> extend trial_end by 14 days, mark the offer used. { ok, trialEnd }
 *   "cancel" -> cancel_at_period_end = true (keeps access through the period). { ok }
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const EXTENSION_DAYS = 14;

function hasCard(sub: Stripe.Subscription): boolean {
  if (sub.default_payment_method) return true;
  const cust = sub.customer;
  if (cust && typeof cust === "object" && !("deleted" in cust && cust.deleted)) {
    const c = cust as Stripe.Customer;
    if (c.invoice_settings?.default_payment_method) return true;
    if (c.default_source) return true;
  }
  return false;
}

/** The subscription we'd act on: prefer a trialing one, else an active one. */
function pickSub(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  return (
    subs.find((s) => s.status === "trialing") ??
    subs.find((s) => s.status === "active") ??
    null
  );
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

    const { action } = (await req.json().catch(() => ({}))) as { action?: string };
    if (!action || !["check", "extend", "cancel"].includes(action)) {
      return NextResponse.json({ error: "bad_action" }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(userInfo.userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data() ?? {};
    const customerId = userData.stripeCustomerId as string | undefined;
    if (!customerId) return NextResponse.json({ error: "no_subscription" }, { status: 400 });

    const list = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 20,
      expand: ["data.customer"],
    });
    const sub = pickSub(list.data);
    if (!sub) return NextResponse.json({ error: "no_active_subscription" }, { status: 400 });

    const trialing = sub.status === "trialing";
    const carded = hasCard(sub);
    const alreadyShown = !!userData.retentionOfferShownAt;
    // The council's exact scope: a card-holding trialer, offered once ever.
    const offerEligible = trialing && carded && !alreadyShown;

    if (action === "check") {
      return NextResponse.json({ trialing, hasCard: carded, offerEligible });
    }

    if (action === "extend") {
      // Guard: never extend if the offer was already spent, or the sub isn't a
      // trial (extending a live paid sub would give free service, not the point).
      if (!offerEligible) {
        return NextResponse.json({ error: "not_eligible" }, { status: 409 });
      }
      const base = sub.trial_end ? sub.trial_end * 1000 : Date.now();
      const newTrialEndMs = base + EXTENSION_DAYS * 86_400_000;
      const updated = await stripe.subscriptions.update(sub.id, {
        trial_end: Math.floor(newTrialEndMs / 1000),
        proration_behavior: "none",
      });
      await userRef.set(
        {
          retentionOfferShownAt: FieldValue.serverTimestamp(),
          retentionOfferOutcome: "extended",
          retentionExtendedDays: EXTENSION_DAYS,
        },
        { merge: true },
      );
      return NextResponse.json({
        ok: true,
        trialEnd: updated.trial_end ? new Date(updated.trial_end * 1000).toISOString() : null,
      });
    }

    // action === "cancel": end at period end so they keep the access they paid
    // for (or the trial they're on). Records that the offer path was used up so
    // it never reappears — a customer who cancels shouldn't be re-pitched.
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
    await userRef.set(
      {
        retentionOfferShownAt: FieldValue.serverTimestamp(),
        retentionOfferOutcome: "canceled",
      },
      { merge: true },
    );
    return NextResponse.json({ ok: true, canceled: true });
  } catch (err) {
    console.error("[retention] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
