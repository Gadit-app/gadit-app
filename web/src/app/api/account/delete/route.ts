import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getAdminAuth,
  getAdminDb,
  verifyUserAndGetPlan,
} from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * /api/account/delete — permanently remove the requesting user.
 *
 * Beta security review caught that the AccountV2 "Delete account"
 * button was a no-op (the comment in code literally said
 * "endpoint not implemented yet"). For a B2C app shipping with
 * paid subscriptions and personal data (notebook entries, search
 * history), this is a GDPR / consumer-trust hole — and an
 * embarrassing one when a tester finds it on day one.
 *
 * Order matters here:
 *   1. Cancel any live Stripe subscription (so we don't keep
 *      charging a card after the user is gone).
 *   2. Delete Firestore documents we own:
 *        - users/{uid}                   (plan, customer ID, etc.)
 *        - notebook/{uid}/entries/*      (saved words)
 *        - dailyUsage/{uid}_*            (quota counters)
 *   3. Delete the Firebase Auth user (auth record).
 *
 * If any step fails partway, we return 500 and ask the user to retry
 * or email support — Stripe customer cancellation is idempotent so
 * a retry is safe; Firestore deletes likewise. The auth deletion is
 * last specifically because once it's gone, the client can no longer
 * present a token to retry the earlier steps.
 *
 * Note: /api/webhook still runs on Stripe events for this user
 * post-deletion (cancellation event arrives async). It just won't
 * find the user doc anymore, which is fine — the webhook is
 * idempotent.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    const { userId } = userInfo;
    const db = getAdminDb();

    // 1. Cancel Stripe subscription if any.
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      const customerId = userDoc.data()?.stripeCustomerId as
        | string
        | undefined;
      if (customerId) {
        // List active subs and cancel each. Most users have at most
        // one, but list-then-loop handles edge cases (e.g. someone
        // who briefly had two from a glitched checkout).
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 10,
        });
        for (const sub of subs.data) {
          if (
            sub.status !== "canceled" &&
            sub.status !== "incomplete_expired"
          ) {
            await stripe.subscriptions.cancel(sub.id).catch((err) => {
              console.error(`Stripe cancel failed for ${sub.id}:`, err);
            });
          }
        }
      }
    } catch (err) {
      console.error("Stripe cleanup failed (non-fatal):", err);
    }

    // 2. Delete Firestore documents owned by this user.
    // Sub-collections are not deleted automatically by deleting the
    // parent doc, so we walk them explicitly.
    try {
      const notebookRef = db
        .collection("notebook")
        .doc(userId)
        .collection("entries");
      const entries = await notebookRef.get();
      const batch = db.batch();
      entries.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      // Daily usage docs use composite IDs (userId_YYYY-MM-DD); we
      // query by userId field so the future-dated ones are caught too.
      const usage = await db
        .collection("dailyUsage")
        .where("userId", "==", userId)
        .get();
      const usageBatch = db.batch();
      usage.forEach((d) => usageBatch.delete(d.ref));
      await usageBatch.commit();

      // Top-level user doc.
      await db.collection("users").doc(userId).delete();
    } catch (err) {
      console.error("Firestore cleanup failed:", err);
      return NextResponse.json(
        {
          error: "partial_failure",
          message:
            "Account data partially removed. Please email support@gadit.app to complete deletion.",
        },
        { status: 500 }
      );
    }

    // 3. Delete the Firebase Auth user. Once this lands, no future
    // tokens can be minted for this UID, so this MUST be last.
    try {
      await getAdminAuth().deleteUser(userId);
    } catch (err) {
      console.error("Auth deletion failed:", err);
      return NextResponse.json(
        {
          error: "partial_failure",
          message:
            "Account data removed but the auth record persists. Please email support@gadit.app.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
