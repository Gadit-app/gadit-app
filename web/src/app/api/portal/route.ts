import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    const userDoc = await getAdminDb().collection("users").doc(userInfo.userId).get();
    const customerId = userDoc.data()?.stripeCustomerId as string | undefined;
    if (!customerId) {
      return NextResponse.json(
        { error: "no_subscription", message: "No Stripe customer found for this user" },
        { status: 400 }
      );
    }

    const returnUrl =
      process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/account`
        : "https://www.gadit.app/account";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("portal error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
