import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { runCheckoutRecovery } from "@/lib/checkout-recovery";
import { sendDripEmail } from "@/lib/email-drip/send";
import { buildUnsubUrl } from "@/lib/email-drip/registry";

/**
 * Abandoned-checkout recovery emails (Gadi 2026-10-21). Someone who opened
 * /checkout (Family, Individual, any Payment Element plan) and never entered
 * a card gets up to three emails: E1 one hour after, E2 after a day, E3
 * after three days, each with a button straight back to the same plan.
 * Selection and ledger: lib/checkout-recovery.ts. Copy:
 * lib/email-drip/checkout-recovery-content.ts.
 *
 * KILL SWITCH, default OFF: nothing is sent unless the Firestore doc
 * emailConfig/checkoutRecovery has enabled: true. While off (or with
 * &dryRun=1) the run only reports who WOULD get which email.
 * Shabbat: scheduled mail, so no sends from Friday 15:00 to Saturday 21:00
 * Israel time; the next run after Shabbat picks them up.
 *
 * Schedule: hourly (vercel.json), like school-digest, so E1 lands about an
 * hour after the checkout was left instead of up to a day later.
 *
 * Auth: Vercel cron Bearer CRON_SECRET, or ?secret=ADMIN_SECRET (+ &dryRun=1).
 */

export const maxDuration = 120;
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  return !!qs && !!process.env.ADMIN_SECRET && qs === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  try {
    const report = await runCheckoutRecovery({
      stripe,
      db: getAdminDb(),
      auth: getAdminAuth(),
      dryRun,
      unsubUrl: buildUnsubUrl,
      send: (m) => sendDripEmail({ ...m, scheduled: true }),
    });
    return NextResponse.json(report);
  } catch (e) {
    console.error("[checkout-recovery] run failed", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
