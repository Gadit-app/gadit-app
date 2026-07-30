import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { rateFor, COMMISSION_HOLD_MS, YEAR_ONE_MS, PartnerTier } from "@/lib/partners";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Book a partner (affiliate) commission for a paid invoice.
 *
 * Fires on every `invoice.payment_succeeded` for a referred customer, so
 * the partner earns on each month actually paid — churn self-corrects. If
 * the paying customer wasn't referred (no `referredPartnerId` on their
 * user doc), this is a no-op.
 *
 * Rate follows the tier and whether the payment lands in the customer's
 * first year (25%/30% year one, 10% for life after). The commission doc
 * id is the Stripe invoice id, so a webhook retry can never double-count.
 * Everything is best-effort: a failure here must never break provisioning
 * or make Stripe retry the whole event.
 */
async function accruePartnerCommission(invoice: Stripe.Invoice) {
  try {
    if (!invoice.id) return;
    const gross = invoice.amount_paid ?? 0;
    if (gross <= 0) return; // $0 / trial invoices earn nothing

    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!customerId) return;

    const db = getAdminDb();
    const userId = await findUserIdByCustomer(customerId);
    if (!userId) return;

    const userSnap = await db.collection("users").doc(userId).get();
    const u = userSnap.data() ?? {};
    const partnerId = u.referredPartnerId as string | undefined;
    if (!partnerId) return; // customer wasn't referred by a partner

    const partnerRef = db.collection("partners").doc(partnerId);
    const partnerSnap = await partnerRef.get();
    const partner = partnerSnap.data();
    if (!partnerSnap.exists || partner?.status === "suspended") return;

    const commissionRef = partnerRef.collection("commissions").doc(invoice.id);
    if ((await commissionRef.get()).exists) return; // idempotent on retry

    const referredAt = (u.referredAt as number | undefined) ?? Date.now();
    const paidAtMs = (invoice.created ?? Math.floor(Date.now() / 1000)) * 1000;
    const yearOne = paidAtMs - referredAt < YEAR_ONE_MS;
    // Prefer the partner's explicit per-partner rate; fall back to the
    // tier default for any legacy partner created before rates were stored.
    const tier = (partner?.tier as PartnerTier) ?? "standard";
    const explicit = yearOne ? partner?.rateYearOne : partner?.rateLifetime;
    const rate = typeof explicit === "number" ? explicit : rateFor(tier, yearOne);
    const amount = Math.round(gross * rate);

    const now = Date.now();
    await commissionRef.set({
      invoiceId: invoice.id,
      referredUid: userId,
      gross,
      amount,
      currency: invoice.currency ?? "usd",
      rate,
      yearOne,
      createdAt: now,
      releaseAt: now + COMMISSION_HOLD_MS,
      paidAt: null,
    });
    console.log(
      `[webhook] commission ${amount} ${invoice.currency} -> partner ${partnerId} (rate ${rate}, invoice ${invoice.id})`,
    );
  } catch (e) {
    console.warn("[webhook] accruePartnerCommission failed (non-blocking):", e);
  }
}

/**
 * Notify Gadi by email the FIRST time a customer's paid subscription
 * activates (Family / Schools / Clear / Deep). Deduped via a `notifiedPaid`
 * flag on the user doc, so renewals and repeated subscription.updated
 * events never re-send. Non-blocking: every failure is swallowed so it can
 * never break provisioning. This is the "someone just PAID" signal, which
 * the client-side notify-signup never gave — that one only fires on account
 * creation, so a family that upgraded from a free account produced no alert
 * (Gadi 2026-07-27).
 */
async function notifyPaidActivation(uid: string, tier: string, email: string | null) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.NOTIFY_EMAIL;
    if (!resendKey || !notifyTo) return;
    const db = getAdminDb();
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (snap.data()?.notifiedPaid === true) return; // dedupe: fire once per customer

    const when = new Date().toLocaleString("en-IL", {
      timeZone: "Asia/Jerusalem",
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">New ${tier} subscription 💰</div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#6B7280;width:110px;">Plan</td><td style="padding:8px 0;font-weight:600;">${tier}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;font-weight:500;">${(email ?? "(none)").replace(/</g, "&lt;")}</td></tr>
        <tr><td style="padding:8px 0;color:#6B7280;">When</td><td style="padding:8px 0;">${when} (Israel time)</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #F3F4F6;text-align:center;">
        <a href="https://www.gadit.app/admin/users" style="display:inline-block;background:#0EA5A5;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open admin dashboard</a>
      </div>
    </div>
  </div>
</body></html>`;
    const resend = new Resend(resendKey);
    const res = await resend.emails.send({
      from: "Gadit <notify@gadit.app>",
      to: notifyTo,
      subject: `💰 New ${tier} subscription: ${email ?? uid}`,
      html,
    });
    if (res.error) {
      console.error("[webhook] notifyPaidActivation resend error:", res.error);
      return;
    }
    await ref.set({ notifiedPaid: true, notifiedPaidAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("[webhook] notifyPaidActivation failed:", e);
  }
}

// Feature-level plan. Family and Schools billing both translate to "deep"
// features for every paired member or classroom kid, so existing feature
// gates (notebook, images, kids mode, quizzes) all work unchanged. The
// "Family" identity lives in `users/{uid}.familyId` + `families/{familyId}`;
// the "Schools" identity in `users/{uid}.schoolId` + `schools/{schoolId}`.
// Retired Family price IDs ($6.99/mo + $69/yr, replaced 2026-07-16 by
// $5.99/₪19.90 + $59/₪199). Env vars point at the NEW prices, but any
// subscriber who signed up on the old ones keeps renewing on them
// forever — without these entries their subscription.updated events
// would map to "basic" and silently downgrade a paying family.
const LEGACY_FAMILY_PRICE_IDS = [
  "price_1TqqNWRprLKxF6OiZAzFpn35", // Family monthly $6.99
  "price_1TqqNXRprLKxF6Oi700Vbwxv", // Family yearly $69
];

function getPlanFromPriceId(priceId: string): "basic" | "clear" | "deep" {
  const map: Record<string, "basic" | "clear" | "deep"> = {
    [process.env.STRIPE_PRICE_CLEAR_MONTHLY!]: "clear",
    [process.env.STRIPE_PRICE_CLEAR_YEARLY!]: "clear",
    [process.env.STRIPE_PRICE_DEEP_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_DEEP_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_FAMILY_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_FAMILY_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_YEARLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY!]: "deep",
  };
  if (LEGACY_FAMILY_PRICE_IDS.includes(priceId)) return "deep";
  return map[priceId] ?? "basic";
}

function isFamilyPriceId(priceId: string): boolean {
  return (
    priceId === process.env.STRIPE_PRICE_FAMILY_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY ||
    LEGACY_FAMILY_PRICE_IDS.includes(priceId)
  );
}

function isSchoolsPriceId(priceId: string): boolean {
  return (
    priceId === process.env.STRIPE_PRICE_SCHOOLS_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_YEARLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY
  );
}

// Bootstrap the family doc + the owner's member record on the very first
// Family checkout. Idempotent: re-runs no-op via merge. Owner's role is
// "father" by default; user can change it on /family afterwards. familyId
// is the owner's Firebase Auth uid (mirrors Yooniz).
async function bootstrapFamily(ownerUid: string, plan: "monthly" | "yearly") {
  const db = getAdminDb();
  const familyRef = db.collection("families").doc(ownerUid);
  const familySnap = await familyRef.get();
  if (!familySnap.exists) {
    await familyRef.set({
      ownerUid,
      plan,
      createdAt: new Date().toISOString(),
    });
    // Owner's own member doc — they're a full user inside their own family.
    await familyRef.collection("members").doc(ownerUid).set({
      id: ownerUid,
      role: "father",
      name: "",
      colorIndex: 0,
      isOwner: true,
      userId: ownerUid,
      createdAt: new Date().toISOString(),
    });
    console.log(`[webhook] family bootstrapped: ${ownerUid}`);
  } else {
    await familyRef.set({ plan, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

// Bootstrap the school doc on the very first Schools checkout. Idempotent:
// re-runs no-op via merge. schoolId is the owner's Firebase Auth uid
// (mirrors families/). The school starts with no classrooms — the principal
// adds them from /schools after landing on the welcome state. School name
// is blank until the principal sets it in the dashboard.
async function bootstrapSchool(ownerUid: string, plan: "monthly" | "yearly", email: string | null) {
  const db = getAdminDb();
  const schoolRef = db.collection("schools").doc(ownerUid);
  const schoolSnap = await schoolRef.get();
  if (!schoolSnap.exists) {
    await schoolRef.set({
      ownerUid,
      plan,
      name: "",
      logoUrl: null,
      contactEmail: email,
      createdAt: new Date().toISOString(),
    });
    console.log(`[webhook] school bootstrapped: ${ownerUid}`);
  } else {
    await schoolRef.set({ plan, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

async function applyPlanToUser(
  userId: string,
  plan: "basic" | "clear" | "deep",
  extra: Record<string, unknown>
) {
  const db = getAdminDb();
  await db.collection("users").doc(userId).set(
    {
      plan,
      ...extra,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  console.log(`[webhook] user ${userId} -> plan=${plan}`);
}

async function findUserIdByCustomer(customerId: string): Promise<string | null> {
  const db = getAdminDb();
  const snap = await db
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

/** True when subId is the subscription currently recorded on the user
 *  doc (or when no subscription is recorded at all). Downgrade guard:
 *  a dying OLD subscription must never overwrite a live new one. */
async function isCurrentSubscription(userId: string, subId: string): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db.collection("users").doc(userId).get();
  if (!snap.exists) return true;
  const current = snap.data()?.subscriptionId as string | undefined;
  return !current || current === subId;
}

/**
 * Activation path for the in-app Payment Element flow (/checkout →
 * /api/subscribe). Those subscriptions have NO checkout.session — the
 * user is identified by subscription metadata.uid instead of
 * client_reference_id, and provisioning (plan + family/schools
 * bootstrap) happens here on customer.subscription.created/updated.
 *
 * Card-first guard: with a 14-day trial + default_incomplete, Stripe
 * creates the subscription as `trialing` BEFORE the card is entered.
 * Granting on that would hand out card-less trials to anyone who
 * merely opened the checkout page. We activate only once a default
 * payment method is attached (confirmSetup completed) or the
 * subscription is outright `active` (paid). Everything is idempotent,
 * so the events that follow (payment attach, status changes) re-apply
 * safely. Returns true when the event was handled by this path.
 */
async function activateFromSubscriptionMetadata(sub: Stripe.Subscription): Promise<boolean> {
  const uid = sub.metadata?.uid;
  if (!uid) return false; // hosted-checkout subscription — other handlers own it

  const priceId = sub.items.data[0]?.price?.id ?? "";
  const plan = getPlanFromPriceId(priceId);
  const hasCard = !!sub.default_payment_method;
  const statusOk = sub.status === "active" || (sub.status === "trialing" && hasCard);

  if (!statusOk) {
    // Canceled / past_due / unpaid → downgrade (mirrors the customer-
    // lookup path) — but ONLY if this sub is the user's current one.
    // Abandoned Payment-Element subs auto-cancel at trial end
    // (missing_payment_method: cancel); if the user meanwhile paid via
    // another subscription, that cancellation must not clobber it.
    if (sub.status === "canceled" || sub.status === "unpaid" || sub.status === "past_due") {
      if (await isCurrentSubscription(uid, sub.id)) {
        await applyPlanToUser(uid, "basic", {
          subscriptionStatus: sub.status,
        });
      } else {
        console.log(`[webhook] ignoring ${sub.status} for stale sub ${sub.id} (uid=${uid})`);
      }
      return true;
    }
    console.log(`[webhook] sub ${sub.id} (uid=${uid}) awaiting payment method, skipping activation`);
    return true;
  }

  const family = isFamilyPriceId(priceId);
  const schools = isSchoolsPriceId(priceId);
  const billingCycle: "monthly" | "yearly" =
    priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_YEARLY ||
    priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY
      ? "yearly"
      : "monthly";
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const email = (sub.metadata?.email as string | undefined) ?? null;

  await applyPlanToUser(uid, plan, {
    ...(email && { email }),
    stripeCustomerId: customerId,
    subscriptionId: sub.id,
    priceId,
    subscriptionStatus: sub.status,
    trialEnd: sub.trial_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    ...(family && { familyId: uid }),
    ...(schools && { schoolId: uid }),
  });

  if (family) await bootstrapFamily(uid, billingCycle);
  if (schools) await bootstrapSchool(uid, billingCycle, email);

  if (plan !== "basic") {
    const tier = family ? "Family" : schools ? "Schools" : plan === "clear" ? "Clear" : "Deep";
    await notifyPaidActivation(uid, tier, email);
  }
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] Missing signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook config missing" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  console.log(`[webhook] received event: ${event.type}`);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;

      if (!userId) {
        console.error("[webhook] No userId found in session metadata or client_reference_id");
        return NextResponse.json({ received: true, warning: "no_user_id" });
      }

      // line_items is NOT included by default — load it explicitly
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "subscription"],
      });
      const priceId = fullSession.line_items?.data?.[0]?.price?.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      // If subscription started in trial, capture trial info so the UI can show it
      const sub =
        typeof fullSession.subscription === "object" && fullSession.subscription
          ? fullSession.subscription
          : null;
      const trialEnd = sub?.trial_end ?? null;
      const subscriptionStatus = sub?.status ?? null;

      const family = isFamilyPriceId(priceId);
      const schools = isSchoolsPriceId(priceId);
      const billingCycle: "monthly" | "yearly" =
        priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY ||
        priceId === process.env.STRIPE_PRICE_SCHOOLS_YEARLY ||
        priceId === process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY
          ? "yearly"
          : "monthly";
      const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

      await applyPlanToUser(userId, plan, {
        email: customerEmail,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        priceId,
        ...(family && { familyId: userId }),
        ...(schools && { schoolId: userId }),
        ...(subscriptionStatus && { subscriptionStatus }),
        ...(trialEnd && { trialEnd }),
      });

      if (family) {
        await bootstrapFamily(userId, billingCycle);
      }
      if (schools) {
        await bootstrapSchool(userId, billingCycle, customerEmail);
      }

      if (plan !== "basic") {
        const tier = family ? "Family" : schools ? "Schools" : plan === "clear" ? "Clear" : "Deep";
        await notifyPaidActivation(userId, tier, customerEmail);
      }
    }

    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      await activateFromSubscriptionMetadata(sub);
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      // Payment-Element subscriptions (metadata.uid) are provisioned
      // here; hosted-checkout ones fall through to the legacy
      // customer-lookup update below.
      if (await activateFromSubscriptionMetadata(sub)) {
        return NextResponse.json({ received: true });
      }
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await findUserIdByCustomer(customerId);
      if (userId) {
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = getPlanFromPriceId(priceId);
        // If subscription is not active (past_due, canceled, etc), downgrade to basic
        const effectivePlan = sub.status === "active" || sub.status === "trialing" ? plan : "basic";
        await applyPlanToUser(userId, effectivePlan, {
          subscriptionId: sub.id,
          subscriptionStatus: sub.status,
          priceId,
          // trial_end becomes null once the trial converts to paid; clear it then.
          trialEnd: sub.trial_end ?? null,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      // A Payment-Element sub that never got a card was never activated
      // (nobody's plan came from it), so its deletion — auto-cancel at
      // trial end or manual cleanup — must not downgrade anyone. The
      // user may hold a plan granted by an entirely different flow
      // (hosted checkout, admin) that this sub knows nothing about.
      const neverActivated = !!sub.metadata?.uid && !sub.default_payment_method;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await findUserIdByCustomer(customerId);
      // Stale-sub guard, same as the metadata path: a dying OLD
      // subscription must not downgrade a user whose CURRENT
      // subscription is alive.
      if (userId && !neverActivated && (await isCurrentSubscription(userId, sub.id))) {
        await applyPlanToUser(userId, "basic", {
          subscriptionStatus: "canceled",
        });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      await accruePartnerCommission(invoice);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
