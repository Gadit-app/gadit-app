import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Admin tool — revenue dashboard. Aggregates current subscriptions
 * straight out of /users/{uid} (set by the Stripe webhook on
 * checkout.session.completed and subscription.updated):
 *
 *   - MRR broken out by plan × billing period (Clear monthly / Clear
 *     yearly / Deep monthly / Deep yearly)
 *   - ARR (MRR × 12)
 *   - List of active subscribers with their plan, billing period, and
 *     monthly revenue contribution
 *   - "At-risk" subscribers — past_due, unpaid, incomplete, or marked
 *     to cancel at period end
 *   - Recently canceled subscribers (downgraded to basic in the last 30d)
 *
 * Pure Firestore read — no Stripe API call — so it's fast and cheap.
 * Trade-off: we don't see live renewal dates / payment retry status;
 * for that the user can click the Stripe link rendered in each row.
 *
 * USAGE:
 *   GET /api/admin/revenue?secret=$ADMIN_SECRET
 *
 * Auth: ADMIN_SECRET env var.
 */

export const maxDuration = 60;

type Plan = "basic" | "clear" | "deep";

type Subscriber = {
  uid: string;
  email: string | null;
  plan: Plan;
  billing: "monthly" | "yearly" | "unknown";
  monthlyUsd: number;
  status: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  signedUpAt: string | null;
  stripeCustomerId: string | null;
  country: string | null;
};

function buildPriceMap(): Record<string, { plan: Plan; billing: "monthly" | "yearly"; monthlyUsd: number }> {
  const map: Record<string, { plan: Plan; billing: "monthly" | "yearly"; monthlyUsd: number }> = {};
  const clearMo = process.env.STRIPE_PRICE_CLEAR_MONTHLY;
  const clearYr = process.env.STRIPE_PRICE_CLEAR_YEARLY;
  const deepMo  = process.env.STRIPE_PRICE_DEEP_MONTHLY;
  const deepYr  = process.env.STRIPE_PRICE_DEEP_YEARLY;
  if (clearMo) map[clearMo] = { plan: "clear", billing: "monthly", monthlyUsd: 2.99 };
  if (clearYr) map[clearYr] = { plan: "clear", billing: "yearly",  monthlyUsd: 29.99 / 12 };
  if (deepMo)  map[deepMo]  = { plan: "deep",  billing: "monthly", monthlyUsd: 4.99 };
  if (deepYr)  map[deepYr]  = { plan: "deep",  billing: "yearly",  monthlyUsd: 49.99 / 12 };
  return map;
}

function tsToIso(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") return new Date(v).toISOString();
  if (typeof v === "string") return v;
  return null;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured — refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getAdminAuth();
  const db = getAdminDb();
  const priceMap = buildPriceMap();

  // ---------- 1) Auth users ----------
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 5000) break;
  } while (pageToken);

  // ---------- 2) Bulk-load Firestore docs ----------
  const userDocs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < authUsers.length; i += CHUNK) {
    const refs = authUsers
      .slice(i, i + CHUNK)
      .map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) {
      if (snap.exists) userDocs.set(snap.id, snap.data() ?? {});
    }
  }

  // ---------- 3) Project subscribers ----------
  const active: Subscriber[] = [];
  const atRisk: Subscriber[] = [];
  const recentlyCanceled: Subscriber[] = [];

  let mrr = 0;
  const breakdown = {
    clearMonthly: { count: 0, mrr: 0 },
    clearYearly:  { count: 0, mrr: 0 },
    deepMonthly:  { count: 0, mrr: 0 },
    deepYearly:   { count: 0, mrr: 0 },
  };

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;

  for (const u of authUsers) {
    const d = userDocs.get(u.uid) ?? {};
    const plan = (d.plan as Plan) || "basic";
    const status = (d.subscriptionStatus as string) || "";
    const priceId = (d.priceId as string) || "";
    const priceInfo = priceMap[priceId];
    const cancelAtPeriodEnd = (d.cancelAtPeriodEnd as boolean) ?? false;
    const trialEnd = tsToIso(d.trialEnd);
    const stripeCustomerId = (d.stripeCustomerId as string) ?? null;
    const signedUpAt = u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : null;

    // Skip true basic users (never paid) entirely
    if (plan === "basic" && !stripeCustomerId) continue;

    const sub: Subscriber = {
      uid: u.uid,
      email: u.email ?? null,
      plan,
      billing: priceInfo?.billing ?? "unknown",
      monthlyUsd: priceInfo?.monthlyUsd ?? 0,
      status,
      cancelAtPeriodEnd,
      trialEnd,
      signedUpAt,
      stripeCustomerId,
      country: (d.country as string) ?? null,
    };

    if (plan === "basic" && stripeCustomerId) {
      // Was paid once; now downgraded. Counts as recently canceled if
      // the doc was updated in the last 30d.
      const updatedMs = tsToIso(d.updatedAt) ? new Date(tsToIso(d.updatedAt)!).getTime() : 0;
      if (updatedMs > thirtyDaysAgo) recentlyCanceled.push(sub);
      continue;
    }

    // Paid plan. Classify by billing health.
    if (status === "active" || status === "trialing") {
      active.push(sub);
      mrr += sub.monthlyUsd;
      // Per-tier breakdown
      if (plan === "clear" && sub.billing === "monthly") {
        breakdown.clearMonthly.count++;
        breakdown.clearMonthly.mrr += sub.monthlyUsd;
      } else if (plan === "clear" && sub.billing === "yearly") {
        breakdown.clearYearly.count++;
        breakdown.clearYearly.mrr += sub.monthlyUsd;
      } else if (plan === "deep" && sub.billing === "monthly") {
        breakdown.deepMonthly.count++;
        breakdown.deepMonthly.mrr += sub.monthlyUsd;
      } else if (plan === "deep" && sub.billing === "yearly") {
        breakdown.deepYearly.count++;
        breakdown.deepYearly.mrr += sub.monthlyUsd;
      }
    } else if (status === "past_due" || status === "unpaid" || status === "incomplete") {
      atRisk.push(sub);
    }
  }

  // Sort: by monthly contribution descending (biggest spenders first)
  active.sort((a, b) => b.monthlyUsd - a.monthlyUsd);
  atRisk.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));
  recentlyCanceled.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      mrrUsd: Math.round(mrr * 100) / 100,
      arrUsd: Math.round(mrr * 12 * 100) / 100,
      activeCount: active.length,
      atRiskCount: atRisk.length,
      recentlyCanceledCount: recentlyCanceled.length,
    },
    breakdown: {
      clearMonthly: { ...breakdown.clearMonthly, mrr: Math.round(breakdown.clearMonthly.mrr * 100) / 100 },
      clearYearly:  { ...breakdown.clearYearly,  mrr: Math.round(breakdown.clearYearly.mrr  * 100) / 100 },
      deepMonthly:  { ...breakdown.deepMonthly,  mrr: Math.round(breakdown.deepMonthly.mrr  * 100) / 100 },
      deepYearly:   { ...breakdown.deepYearly,   mrr: Math.round(breakdown.deepYearly.mrr   * 100) / 100 },
    },
    active,
    atRisk,
    recentlyCanceled,
  });
}
