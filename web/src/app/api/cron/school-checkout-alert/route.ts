import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { runSchoolCheckoutAlert } from "@/lib/school-checkout-alert";

/**
 * Alert Gadi about a school purchase that was started and not finished
 * (Gadi 2026-11-09): a school plan's Stripe payment page opened 30+ minutes
 * ago and not paid. Logic and ledger: lib/school-checkout-alert.ts.
 *
 * Schedule: every 15 minutes (vercel.json), so the alert lands 30 to 45
 * minutes after the person left the payment page.
 *
 * Auth: Vercel cron Bearer CRON_SECRET, or ?secret=ADMIN_SECRET (+ &dryRun=1
 * to see who would be alerted without sending).
 */

export const maxDuration = 60;
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
  const notifyTo = process.env.NOTIFY_EMAIL;
  try {
    const report = await runSchoolCheckoutAlert({
      stripe,
      db: getAdminDb(),
      auth: getAdminAuth(),
      dryRun: dryRun || !notifyTo,
      send: async (m) => {
        if (!notifyTo) return false;
        const r = await sendMail({ from: "Gadit <notify@gadit.app>", to: notifyTo, subject: m.subject, html: m.html, ...(m.replyTo ? { replyTo: m.replyTo } : {}) });
        if (r.error) console.error("[school-checkout-alert] send failed", r.error);
        return !r.error;
      },
    });
    return NextResponse.json(report);
  } catch (e) {
    console.error("[school-checkout-alert] run failed", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
