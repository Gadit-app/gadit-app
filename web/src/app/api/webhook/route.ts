import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getDb() {
  const app = getApps().length === 0 ? initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }) : getApps()[0];
  return getFirestore(app);
}

function getPlanFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    [process.env.STRIPE_PRICE_CLEAR_MONTHLY!]: "clear",
    [process.env.STRIPE_PRICE_CLEAR_YEARLY!]: "clear",
    [process.env.STRIPE_PRICE_DEEP_MONTHLY!]: "deep",
    [process.env.STRIPE_PRICE_DEEP_YEARLY!]: "deep",
  };
  return map[priceId] ?? "basic";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId ?? session.client_reference_id;
    const priceId = session.line_items?.data?.[0]?.price?.id;
    if (userId) {
      await setDoc(doc(db, "users", userId), {
        plan: getPlanFromPriceId(priceId ?? ""),
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    // Find user by stripeCustomerId and downgrade to basic
    // For simplicity we rely on the customer portal for cancellations
  }

  return NextResponse.json({ received: true });
}
