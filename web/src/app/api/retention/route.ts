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
 *   "cancel" -> { reason?, comment? }: a trial ends now, a paid sub at period end. { ok, endedNow }
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const EXTENSION_DAYS = 14;

// The exit-survey reasons (canonical English, see REASONS in
// DeleteAccountModal + the two cancel-only ones) mapped to Stripe's feedback.
const STRIPE_FEEDBACK: Record<string, Stripe.SubscriptionCancelParams.CancellationDetails.Feedback> = {
  "I didn't want an automatic charge": "other",
  "I didn't use it enough": "unused",
  "Too expensive for me": "too_expensive",
  "It isn't right for my children": "missing_features",
  "It was confusing / hard to use": "too_complex",
  "I found another solution": "switched_service",
  "I don't need it right now": "unused",
  "Something didn't work (a technical problem)": "other",
};
const PAUSE_DAYS = 30;
const PAUSE_ONCE_PER_MS = 365 * 86_400_000;

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

/** The subscription we'd act on: trialing, else active, else past_due. */
function pickSub(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  return (
    subs.find((s) => s.status === "trialing") ??
    subs.find((s) => s.status === "active") ??
    subs.find((s) => s.status === "past_due") ??
    null
  );
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { action?: string; reason?: unknown; comment?: unknown; renewalOff?: unknown };
    const { action } = body;
    if (!action || !["check", "extend", "cancel", "pause", "resume"].includes(action)) {
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
    // A month's break instead of cancelling (as in Yooniz): only for a paying
    // MONTHLY subscriber, once a year, never on a sub already set to end.
    const pauseUsedMs = (userData.pauseUsedAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
    const pauseEligible =
      sub.status === "active" &&
      sub.items.data[0]?.price?.recurring?.interval === "month" &&
      !sub.cancel_at_period_end &&
      !sub.pause_collection &&
      Date.now() - pauseUsedMs > PAUSE_ONCE_PER_MS;

    if (action === "check") {
      return NextResponse.json({ trialing, hasCard: carded, offerEligible, pauseEligible });
    }

    if (action === "pause") {
      if (!pauseEligible) return NextResponse.json({ error: "not_eligible" }, { status: 409 });
      const resumesAt = Math.floor((Date.now() + PAUSE_DAYS * 86_400_000) / 1000);
      // "void": the invoices of the paused month are voided, the plan stays.
      await stripe.subscriptions.update(sub.id, { pause_collection: { behavior: "void", resumes_at: resumesAt } });
      await userRef.set(
        { pauseUsedAt: FieldValue.serverTimestamp(), pausedUntil: resumesAt, retentionOfferOutcome: "paused" },
        { merge: true },
      );
      await db.collection("cancellations").add({
        uid: userInfo.userId,
        email: (userData.email as string | undefined) ?? null,
        subscriptionId: sub.id,
        type: "pause",
        reason: typeof body.reason === "string" ? body.reason.slice(0, 120) : null,
        at: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, paused: true, resumesAt });
    }

    if (action === "resume") {
      // "I cancelled by mistake": undo a scheduled cancellation. The webhook
      // sees the change and alerts Gadi once.
      const scheduled = list.data.find(
        (s) => (s.status === "active" || s.status === "trialing" || s.status === "past_due") && s.cancel_at_period_end,
      );
      if (!scheduled) return NextResponse.json({ error: "nothing_to_resume" }, { status: 409 });
      await stripe.subscriptions.update(scheduled.id, { cancel_at_period_end: false });
      await userRef.set({ cancelAtPeriodEnd: false, retentionOfferOutcome: "resumed" }, { merge: true });
      return NextResponse.json({ ok: true, resumed: true });
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

    // action === "cancel". A paying subscriber keeps the access they paid for
    // until the period ends. A free trial ends NOW (Gadi 2026-10-21: someone
    // who cancels a trial does not keep 14 free days of Family): the sub is
    // deleted, and the webhook moves the account (and its family) to free.
    // The exit reason goes to Stripe's cancellation_details too, so the churn
    // alert e-mail carries it. Records that the offer path was used up so it
    // never reappears: a customer who cancels shouldn't be re-pitched.
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 120) : "";
    const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : "";
    const cancellation_details: Stripe.SubscriptionCancelParams.CancellationDetails = {
      feedback: STRIPE_FEEDBACK[reason] ?? (reason ? "other" : undefined),
      comment: [reason && `Reason: ${reason}`, comment && `Note: ${comment}`].filter(Boolean).join(" | ") || undefined,
    };
    // "Turn off renewal only" (Gadi 2026-10-24, after a parent cancelled 3
    // minutes in because she feared the automatic charge): a trial keeps
    // running to its end and is simply never charged. Any other trial cancel
    // still ends now (the 2026-10-21 rule).
    const renewalOff = trialing && body.renewalOff === true;
    const endsNow = trialing && !renewalOff;
    if (endsNow) {
      await stripe.subscriptions.cancel(sub.id, { cancellation_details });
    } else {
      await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true, cancellation_details });
    }
    await userRef.set(
      {
        retentionOfferShownAt: FieldValue.serverTimestamp(),
        retentionOfferOutcome: "canceled",
        cancelReason: reason || null,
        cancelComment: comment || null,
        cancelReasonAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await db.collection("cancellations").add({
      uid: userInfo.userId,
      email: (userData.email as string | undefined) ?? null,
      subscriptionId: sub.id,
      priceId: sub.items.data[0]?.price?.id ?? null,
      status: sub.status,
      endedNow: endsNow,
      ...(renewalOff ? { type: "renewal_off" } : {}),
      reason: reason || null,
      comment: comment || null,
      at: FieldValue.serverTimestamp(),
    });
    if (renewalOff) await userRef.set({ cancelAtPeriodEnd: true }, { merge: true });
    return NextResponse.json({ ok: true, canceled: true, endedNow: endsNow, renewalOff });
  } catch (err) {
    console.error("[retention] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
