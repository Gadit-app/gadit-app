import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { dunningIsHebrew, buildDunningEmail } from "@/lib/dunning-email";

const DAY = 86_400_000;
/** Reminder window: the last ~2.5 days of the 7-day grace (so it lands on
 *  day 5 with the 03:45 UTC daily run). */
const REMIND_WITHIN_MS = 2.5 * DAY;

/**
 * Daily grace-expiry cron. A subscription that fails to renew is kept on its
 * paid plan for a 7-day grace window (set by the webhook as `graceUntil`), so a
 * transient card decline doesn't cut off a paying customer before Stripe's
 * retries run. This cron downgrades to `basic` any user whose past_due grace
 * has passed. `subscriptionStatus` stays "past_due" so the update-card banner
 * keeps nudging them until Stripe finally cancels the subscription (which the
 * webhook turns into a clean basic + no grace).
 *
 * It also sends ONE reminder email per failed invoice on day 5 of the grace
 * (Gadi 2026-09-30), only while the subscription is still past_due and the
 * invoice is still open; same languages as the first email (lib/dunning-email).
 *
 * Idempotent: a user already on basic is skipped. A recovered payment clears
 * graceUntil (webhook), so it never fires for someone who paid.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Manual dry run: GET /api/cron/grace-expiry?secret=$ADMIN_SECRET&dryRun=1
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const qsecret = req.nextUrl.searchParams.get("secret");
  const ok =
    (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) ||
    (process.env.ADMIN_SECRET && qsecret === process.env.ADMIN_SECRET);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const db = getAdminDb();
  const now = Date.now();

  // Small set (only subs that failed to renew), so filter graceUntil in code
  // rather than needing a composite Firestore index.
  const snap = await db.collection("users").where("subscriptionStatus", "==", "past_due").get();
  const downgraded: string[] = [];
  const reminded: string[] = [];
  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  for (const doc of snap.docs) {
    const d = doc.data();
    const grace = typeof d.graceUntil === "number" ? d.graceUntil : null;

    // Day-5 reminder: once per failed invoice, only inside the grace window.
    const invoiceId = typeof d.dunningNotifiedInvoice === "string" ? d.dunningNotifiedInvoice : null;
    if (
      stripe && resend && grace !== null && invoiceId &&
      grace > now && grace - now <= REMIND_WITHIN_MS &&
      d.dunningReminderInvoice !== invoiceId
    ) {
      try {
        const inv = await stripe.invoices.retrieve(invoiceId);
        const to = (typeof d.email === "string" && d.email) || inv.customer_email || "";
        if (inv.status === "open" && (inv.amount_due ?? 0) > 0 && inv.hosted_invoice_url && to) {
          reminded.push(doc.id);
          if (!dryRun) {
            const he = dunningIsHebrew(d, { currency: inv.currency, country: inv.customer_address?.country ?? null });
            const { subject, html } = buildDunningEmail({
              he,
              url: inv.hosted_invoice_url,
              kind: "reminder",
              daysLeft: Math.ceil((grace - now) / DAY),
            });
            await resend.emails.send({ from: "Gadit <notify@gadit.app>", to, subject, html });
            await doc.ref.set({ dunningReminderInvoice: invoiceId }, { merge: true });
          }
        }
      } catch (err) {
        console.error("[grace-expiry] reminder failed for", doc.id, err);
      }
    }

    if (d.plan && d.plan !== "basic" && grace !== null && grace < now) {
      downgraded.push(doc.id);
      if (!dryRun) {
        await doc.ref.set(
          { plan: "basic", graceExpiredAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
    }
  }

  return NextResponse.json({ checked: snap.size, downgraded: downgraded.length, ids: downgraded, reminded: reminded.length, remindedIds: reminded, dryRun });
}
