import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getPlanFromPriceId(priceId: string): "basic" | "clear" | "deep" {
  const map: Record<string, "basic" | "clear" | "deep"> = {
    [process.env.STRIPE_PRICE_CLEAR_MONTHLY!]: "clear",
    [process.env.STRIPE_PRICE_CLEAR_YEARLY!]: "clear",
    [process.env.STRIPE_PRICE_DEEP_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_DEEP_YEARLY!]: "deep",
  };
  return map[priceId] ?? "basic";
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
        expand: ["line_items"],
      });
      const priceId = fullSession.line_items?.data?.[0]?.price?.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await applyPlanToUser(userId, plan, {
        email: session.customer_details?.email ?? session.customer_email,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        priceId,
      });
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
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
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const userId = await findUserIdByCustomer(customerId);
      if (userId) {
        await applyPlanToUser(userId, "basic", {
          subscriptionStatus: "canceled",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
