import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

const MONTHLY_LIMIT_CLEAR = 30;
const MONTHLY_LIMIT_DEEP = 100;

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userInfo.userId).get();
    const data = userDoc.data() ?? {};

    // Image usage this month
    const monthKey = currentMonthKey();
    const usageDoc = await db
      .collection("users")
      .doc(userInfo.userId)
      .collection("imageUsage")
      .doc(monthKey)
      .get();
    const imagesUsed = (usageDoc.data()?.count as number | undefined) ?? 0;
    const imagesLimit =
      userInfo.plan === "deep"
        ? MONTHLY_LIMIT_DEEP
        : userInfo.plan === "clear"
        ? MONTHLY_LIMIT_CLEAR
        : 0;

    // Trial info — trialEnd is a unix timestamp (seconds) from Stripe.
    const trialEndSec =
      typeof data.trialEnd === "number" && data.trialEnd > 0 ? data.trialEnd : null;
    const nowSec = Math.floor(Date.now() / 1000);
    const isTrial =
      data.subscriptionStatus === "trialing" && trialEndSec !== null && trialEndSec > nowSec;
    const trialDaysLeft = isTrial && trialEndSec ? Math.ceil((trialEndSec - nowSec) / 86400) : 0;

    return NextResponse.json({
      plan: userInfo.plan,
      email: data.email ?? null,
      stripeCustomerId: data.stripeCustomerId ?? null,
      subscriptionId: data.subscriptionId ?? null,
      subscriptionStatus: data.subscriptionStatus ?? null,
      isTrial,
      trialDaysLeft,
      trialEnd: trialEndSec,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      images: {
        used: imagesUsed,
        limit: imagesLimit,
        monthKey,
      },
    });
  } catch (err) {
    console.error("account error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
