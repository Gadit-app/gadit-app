import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Admin tool — revenue dashboard. Aggregates current subscriptions
 * straight out of /users/{uid} (set by the Stripe webhook), but pulls
 * the ACTUAL amount + currency of each price live from Stripe so it can
 * never drift from the real prices (Gadi 2026-08-04: the old version
 * hardcoded Clear/Deep USD amounts and knew nothing about Family or
 * Schools, so those tiers showed $0 and the totals were wrong).
 *
 * Fixes vs the old version:
 *   - Recognizes ALL paid tiers: Clear, Deep, Family, Schools (Family
 *     via `familyId`, Schools via `schoolId`, else the `plan` field).
 *   - Real amount + currency per price, fetched once from Stripe.
 *     ILS prices are converted to USD for one unified MRR figure.
 *   - TRIALING subs are NOT counted as revenue — they haven't paid.
 *     They get their own count; MRR is active-paying only.
 *   - Breakdown is a generic list (tier × billing), so every tier shows.
 *
 * USAGE: GET /api/admin/revenue?secret=$ADMIN_SECRET
 */

export const maxDuration = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Fixed FX for turning ILS MRR into the unified USD figure. Approximate
// on purpose — this dashboard is a directional revenue read, not
// accounting. ~3.7 ₪ / $.
const ILS_TO_USD = 0.27;

type Tier = "clear" | "deep" | "family" | "schools";
type Billing = "monthly" | "yearly" | "unknown";

type Subscriber = {
  uid: string;
  email: string | null;
  tier: Tier;
  billing: Billing;
  monthlyUsd: number;      // normalized to USD (ILS converted)
  currency: string;        // native price currency (e.g. "usd" | "ils")
  status: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  signedUpAt: string | null;
  stripeCustomerId: string | null;
  country: string | null;
};

type PriceInfo = { billing: "monthly" | "yearly"; monthlyUsd: number; currency: string };

/** Fetch the real amount + currency for each unique price id from Stripe. */
async function loadPriceInfo(priceIds: string[]): Promise<Map<string, PriceInfo>> {
  const map = new Map<string, PriceInfo>();
  const unique = [...new Set(priceIds)].filter(Boolean);
  await Promise.all(
    unique.map(async (pid) => {
      try {
        const p = await stripe.prices.retrieve(pid);
        const interval = p.recurring?.interval; // "month" | "year"
        const amount = (p.unit_amount ?? 0) / 100;
        const currency = (p.currency ?? "usd").toLowerCase();
        const monthlyNative = interval === "year" ? amount / 12 : amount;
        const monthlyUsd = currency === "ils" ? monthlyNative * ILS_TO_USD : monthlyNative;
        map.set(pid, { billing: interval === "year" ? "yearly" : "monthly", monthlyUsd, currency });
      } catch {
        /* unknown/deleted price → leave unmapped (shows as $0, unknown) */
      }
    }),
  );
  return map;
}

function tierOf(d: FirebaseFirestore.DocumentData): Tier {
  if (d.familyId) return "family";
  if (d.schoolId) return "schools";
  const plan = (d.plan as string) || "basic";
  return plan === "deep" ? "deep" : "clear";
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
    return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getAdminAuth();
  const db = getAdminDb();

  // 1) Auth users
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 5000) break;
  } while (pageToken);

  // 2) Bulk-load Firestore docs
  const userDocs = new Map<string, FirebaseFirestore.DocumentData>();
  const CHUNK = 400;
  for (let i = 0; i < authUsers.length; i += CHUNK) {
    const refs = authUsers.slice(i, i + CHUNK).map((u) => db.collection("users").doc(u.uid));
    const snaps = await db.getAll(...refs);
    for (const snap of snaps) if (snap.exists) userDocs.set(snap.id, snap.data() ?? {});
  }

  // 3) Fetch real prices from Stripe for every priceId seen on a paid doc.
  const priceIds: string[] = [];
  for (const u of authUsers) {
    const d = userDocs.get(u.uid);
    if (d?.priceId) priceIds.push(d.priceId as string);
  }
  const priceMap = await loadPriceInfo(priceIds);

  // 4) Project subscribers
  const active: Subscriber[] = []; // active + trialing (for the table)
  const atRisk: Subscriber[] = [];
  const recentlyCanceled: Subscriber[] = [];

  let mrr = 0;                 // active-paying only, USD
  let activePayingCount = 0;
  let trialingCount = 0;

  // Generic tier×billing breakdown, keyed "tier_billing".
  const breakdownMap = new Map<string, { tier: Tier; billing: "monthly" | "yearly"; count: number; mrr: number }>();
  const bump = (tier: Tier, billing: "monthly" | "yearly", usd: number) => {
    const key = `${tier}_${billing}`;
    const cur = breakdownMap.get(key) ?? { tier, billing, count: 0, mrr: 0 };
    cur.count += 1;
    cur.mrr += usd;
    breakdownMap.set(key, cur);
  };

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;

  for (const u of authUsers) {
    const d = userDocs.get(u.uid) ?? {};
    const plan = (d.plan as string) || "basic";
    const status = (d.subscriptionStatus as string) || "";
    const priceId = (d.priceId as string) || "";
    const info = priceMap.get(priceId);
    const stripeCustomerId = (d.stripeCustomerId as string) ?? null;

    // Skip true basic users (never paid) entirely.
    if (plan === "basic" && !stripeCustomerId) continue;

    const sub: Subscriber = {
      uid: u.uid,
      email: u.email ?? null,
      tier: tierOf(d),
      billing: info?.billing ?? "unknown",
      monthlyUsd: info?.monthlyUsd ?? 0,
      currency: info?.currency ?? "usd",
      status,
      cancelAtPeriodEnd: (d.cancelAtPeriodEnd as boolean) ?? false,
      trialEnd: tsToIso(d.trialEnd),
      signedUpAt: u.metadata.creationTime ? new Date(u.metadata.creationTime).toISOString() : null,
      stripeCustomerId,
      country: (d.country as string) ?? null,
    };

    if (plan === "basic" && stripeCustomerId) {
      // Was paid once, now downgraded. Recently-canceled if touched in 30d.
      const updated = tsToIso(d.updatedAt);
      if (updated && new Date(updated).getTime() > thirtyDaysAgo) recentlyCanceled.push(sub);
      continue;
    }

    if (status === "active") {
      active.push(sub);
      activePayingCount += 1;
      mrr += sub.monthlyUsd;
      if (sub.billing !== "unknown") bump(sub.tier, sub.billing, sub.monthlyUsd);
    } else if (status === "trialing") {
      // Visible in the table, but NOT revenue: a trial hasn't paid.
      active.push(sub);
      trialingCount += 1;
    } else if (status === "past_due" || status === "unpaid" || status === "incomplete") {
      atRisk.push(sub);
    }
  }

  // active list: paying first (by contribution), trialing after.
  active.sort((a, b) => {
    const ap = a.status === "active" ? 1 : 0;
    const bp = b.status === "active" ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.monthlyUsd - a.monthlyUsd;
  });
  atRisk.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));
  recentlyCanceled.sort((a, b) => (b.signedUpAt ?? "").localeCompare(a.signedUpAt ?? ""));

  const TIER_ORDER: Tier[] = ["clear", "deep", "family", "schools"];
  const breakdown = [...breakdownMap.values()]
    .map((b) => ({ ...b, mrr: Math.round(b.mrr * 100) / 100 }))
    .sort((a, b) =>
      TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) ||
      (a.billing === "monthly" ? -1 : 1) - (b.billing === "monthly" ? -1 : 1),
    );

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    summary: {
      mrrUsd: Math.round(mrr * 100) / 100,
      arrUsd: Math.round(mrr * 12 * 100) / 100,
      activePayingCount,
      trialingCount,
      atRiskCount: atRisk.length,
      recentlyCanceledCount: recentlyCanceled.length,
    },
    breakdown,
    active,
    atRisk,
    recentlyCanceled,
  });
}
