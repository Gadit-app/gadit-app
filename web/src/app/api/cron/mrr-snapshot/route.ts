import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";
import { BUSINESS_TZ } from "@/lib/admin-config";

/**
 * Nightly MRR snapshot (spec §6). Stripe does NOT store historical MRR, so
 * the 12-month graph and the cohort table (both DEFERRED to 200+ payers,
 * spec §13) can only ever be built if we start accruing snapshots NOW.
 *
 * This cron computes the live Stripe revenue summary and upserts:
 *   - mrrSnapshots/{YYYY-MM}       (month bucket, last write of the month wins)
 *   - mrrSnapshotsDaily/{YYYY-MM-DD} (daily point, feeds intra-month trend)
 *
 * Idempotent: re-running the same day overwrites the same doc. Cheap: one
 * Stripe summarize + two Firestore writes.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>. A manual run
 * can pass ?secret=$ADMIN_SECRET.
 *
 * USAGE:
 *   GET /api/cron/mrr-snapshot            (Vercel Cron, 02:00 UTC)
 *   GET /api/cron/mrr-snapshot?secret=…   (manual)
 */

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function authorise(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  const secret = req.nextUrl.searchParams.get("secret") || "";
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && secret === adminSecret;
}

// YYYY-MM / YYYY-MM-DD in the declared business timezone (spec §14).
function stamps(tz: string): { month: string; day: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = `${get("year")}-${get("month")}-${get("day")}`;
  return { month: day.slice(0, 7), day };
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rev = await summarizeStripeRevenue(stripe);
  const { month, day } = stamps(BUSINESS_TZ);

  // The persisted point: headline money + the breakdown needed later to
  // reconstruct MRR-by-tier over time and to seed cohort M0 baselines.
  const point = {
    asOf: rev.asOf,
    month,
    day,
    businessTz: rev.businessTz,
    mrrUsd: rev.mrrUsd,
    atRiskMrrUsd: rev.atRiskMrrUsd,
    trialingMrrUsd: rev.trialingMrrUsd,
    newMrrUsd: rev.newMrrUsd,
    churnedMrrUsd: rev.churnedMrrUsd,
    netNewMrrUsd: rev.netNewMrrUsd,
    payingCustomers: rev.activePayingCustomers,
    payingSubscriptions: rev.activePayingCount,
    newCustomersThisMonth: rev.newCustomersThisMonth,
    churnedCustomersThisMonth: rev.churnedCustomersThisMonth,
    trialingCount: rev.trialingCount,
    arpuUsd: rev.arpuUsd,
    monthlyChurnPct: rev.monthlyChurnPct,
    trialConversionPct: rev.trialConversionPct,
    payingByTier: rev.payingByTier,
    payBreakdown: rev.payBreakdown,
  };

  const db = getAdminDb();
  await Promise.all([
    db.collection("mrrSnapshots").doc(month).set(point, { merge: true }),
    db.collection("mrrSnapshotsDaily").doc(day).set(point, { merge: true }),
  ]);

  return NextResponse.json({ ok: true, month, day, mrrUsd: rev.mrrUsd, payingCustomers: rev.activePayingCustomers });
}
