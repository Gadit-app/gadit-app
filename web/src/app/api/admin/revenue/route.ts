import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";

/**
 * Admin tool — revenue dashboard, read LIVE from Stripe (Gadi 2026-08-05:
 * the old Firestore-based version drifted because it trusted the user
 * doc's `subscriptionStatus`, which lags Stripe; and it couldn't show the
 * trial pipeline). Stripe is the source of truth for money.
 *
 * The classification logic now lives in `lib/admin-revenue.ts` so the
 * Overview page can reuse it and both pages report the SAME money figures
 * (Gadi 2026-08-12 — the Overview was counting trials as revenue).
 *
 * What it returns:
 *   - MRR / ARR from ACTIVE (paying) subs only. Trials are NOT revenue.
 *   - active-paying + trialing counts.
 *   - a paying breakdown (tier × billing) AND a separate TRIALING
 *     breakdown, so the Family/Schools trial pipeline is visible.
 *   - subscriber rows for the table (active + trialing), at-risk
 *     (past_due/unpaid/incomplete), and recently-canceled (30d).
 *
 * USAGE: GET /api/admin/revenue?secret=$ADMIN_SECRET
 */

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const r = await summarizeStripeRevenue(stripe);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      mrrUsd: r.mrrUsd,
      arrUsd: r.arrUsd,
      activePayingCount: r.activePayingCount,
      trialingCount: r.trialingCount,
      atRiskCount: r.atRiskCount,
      recentlyCanceledCount: r.recentlyCanceledCount,
    },
    breakdown: r.payBreakdown,
    trialingBreakdown: r.trialingBreakdown,
    active: r.active,
    atRisk: r.atRisk,
    recentlyCanceled: r.recentlyCanceled,
  });
}
