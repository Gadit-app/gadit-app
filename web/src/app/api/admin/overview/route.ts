import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRecord } from "firebase-admin/auth";

/**
 * Admin tool — single overview endpoint that the /admin main dashboard
 * consumes. Returns everything a "morning glance" view needs:
 *
 *   - User counts: total, by-plan, new this week, new this month
 *   - MRR + revenue: monthly recurring revenue, projected month revenue
 *   - Activity: searches today / this week / this month (signed-in +
 *     anonymous), top searched words, top languages
 *   - Conversion funnel: anonymous users → signed-up → paid (this month)
 *   - Geo: top countries
 *
 * Single endpoint instead of N small ones because the dashboard wants
 * all of these on one page and rendering N spinners would be ugly.
 * One bulk RPC per Firestore collection keeps it cheap.
 *
 * USAGE:
 *   GET /api/admin/overview?secret=$ADMIN_SECRET
 *
 * Auth: ADMIN_SECRET env var (same as the other admin endpoints).
 */

export const maxDuration = 60;

type Plan = "basic" | "clear" | "deep";

// Pricing model — kept in sync with web/src/app/pricing/PricingClient.tsx.
// MRR computation: for yearly subscriptions we divide by 12 so a year of
// Clear shows as $2.50/mo MRR contribution rather than counting the full
// $29.99 as one month.
const MONTHLY_PRICE: Record<string, number> = {
  // Filled at request time from env vars so we don't ship price IDs in
  // the bundle. Map: priceId → monthly $ contribution to MRR.
};

function buildPriceMap(): Record<string, number> {
  const map: Record<string, number> = {};
  const clearMo = process.env.STRIPE_PRICE_CLEAR_MONTHLY;
  const clearYr = process.env.STRIPE_PRICE_CLEAR_YEARLY;
  const deepMo  = process.env.STRIPE_PRICE_DEEP_MONTHLY;
  const deepYr  = process.env.STRIPE_PRICE_DEEP_YEARLY;
  if (clearMo) map[clearMo] = 2.99;
  if (clearYr) map[clearYr] = 29.99 / 12;
  if (deepMo)  map[deepMo]  = 4.99;
  if (deepYr)  map[deepYr]  = 49.99 / 12;
  return map;
}

function tsToMs(v: unknown): number | null {
  if (!v) return null;
  if (typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: () => Date }).toDate === "function") {
    return (v as { toDate: () => Date }).toDate().getTime();
  }
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = new Date(v).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function startOfDayUTC(daysAgo: number): number {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.getTime();
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const auth = getAdminAuth();
  const db = getAdminDb();
  const priceMap = buildPriceMap();
  const now = Date.now();
  const todayStart = startOfDayUTC(0);
  const weekStart  = startOfDayUTC(7);
  const monthStart = startOfDayUTC(30);

  // ---------- 1) All Auth users + their Firestore docs ----------
  const authUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    authUsers.push(...page.users);
    pageToken = page.pageToken;
    if (authUsers.length >= 5000) break;
  } while (pageToken);

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

  // ---------- 2) User aggregates ----------
  const byPlan = { basic: 0, clear: 0, deep: 0 };
  let signupsToday = 0;
  let signupsWeek = 0;
  let signupsMonth = 0;
  let mrr = 0;
  let activeSubs = 0;
  let compAccounts = 0;
  const byCountry = new Map<string, number>();

  for (const u of authUsers) {
    const d = userDocs.get(u.uid) ?? {};
    const plan = (d.plan as Plan) || "basic";
    byPlan[plan] = (byPlan[plan] ?? 0) + 1;
    const country = (d.country as string) || "?";
    byCountry.set(country, (byCountry.get(country) ?? 0) + 1);

    const created = u.metadata.creationTime ? new Date(u.metadata.creationTime).getTime() : 0;
    if (created >= todayStart) signupsToday++;
    if (created >= weekStart)  signupsWeek++;
    if (created >= monthStart) signupsMonth++;

    // Comp / internal accounts (owner, testing) keep their feature plan but
    // are NOT paying customers, so they never count toward MRR or active
    // subscriptions (Gadi's own account, 2026-07-23). Tracked separately.
    if (d.comp === true) {
      compAccounts++;
      continue;
    }

    // MRR — only counts users whose plan is paid AND subscription is in a
    // billing state (active, trialing). Past_due / canceled don't count.
    if (plan !== "basic") {
      const status = (d.subscriptionStatus as string) || "";
      const billable = status === "active" || status === "trialing";
      if (billable) {
        activeSubs++;
        const priceId = (d.priceId as string) || "";
        const monthly = priceMap[priceId];
        if (monthly) {
          mrr += monthly;
        } else {
          // Unknown priceId (manual upgrade, legacy doc, etc.) — fall
          // back to the monthly price for the plan so MRR isn't
          // understated.
          mrr += plan === "clear" ? 2.99 : 4.99;
        }
      }
    }
  }

  const sortedCountries = Array.from(byCountry.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({ code, count }));

  // ---------- 3) Activity (signed-in dailyUsage + anonymous anonUsage) ----------
  const sevenDaysAgoIso = new Date(weekStart).toISOString().slice(0, 10);
  const thirtyDaysAgoIso = new Date(monthStart).toISOString().slice(0, 10);

  const dailyUsageSnap = await db
    .collection("dailyUsage")
    .where("date", ">=", thirtyDaysAgoIso)
    .get();
  const anonUsageSnap = await db
    .collection("anonUsage")
    .where("date", ">=", thirtyDaysAgoIso)
    .get();

  let searchesToday = 0;
  let searchesWeek = 0;
  let searchesMonth = 0;
  const todayIso = new Date(todayStart).toISOString().slice(0, 10);

  for (const doc of [...dailyUsageSnap.docs, ...anonUsageSnap.docs]) {
    const data = doc.data();
    const count = typeof data.count === "number" ? data.count : 0;
    const date = data.date as string;
    if (date === todayIso) searchesToday += count;
    if (date >= sevenDaysAgoIso) searchesWeek += count;
    searchesMonth += count;
  }

  // ---------- 4) Top searched words + top languages ----------
  // wordSearches has a `lastAt` field — we can sort by count without
  // worrying about freshness for the leaderboard. For language
  // distribution we sum counts grouped by lang.
  const wordSnap = await db
    .collection("wordSearches")
    .orderBy("count", "desc")
    .limit(20)
    .get();
  const topWords = wordSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      word: (d.word as string) ?? "",
      lang: (d.lang as string) ?? "",
      count: typeof d.count === "number" ? d.count : 0,
    };
  });

  // For language distribution, scan ALL wordSearches once. Acceptable
  // at our scale (thousands of docs). Cheap and gives us accurate
  // by-lang totals.
  const allWordSnap = await db.collection("wordSearches").get();
  const byLang = new Map<string, number>();
  for (const doc of allWordSnap.docs) {
    const d = doc.data();
    const lang = (d.lang as string) || "?";
    const count = typeof d.count === "number" ? d.count : 0;
    byLang.set(lang, (byLang.get(lang) ?? 0) + count);
  }
  const sortedLangs = Array.from(byLang.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({ lang, count }));

  // ---------- 5) Conversion funnel (this month) ----------
  // Anonymous = distinct IPs in anonUsage this month.
  // Signed-up = users whose createdAt is in this month.
  // Paid = users currently on a paid plan whose lastSeenAt or
  //   createdAt is in this month (good enough — measures "people
  //   who became paying customers in this window").
  const distinctIps = new Set<string>();
  for (const doc of anonUsageSnap.docs) {
    const d = doc.data();
    const ip = (d.ip as string) || doc.id.split("_")[0];
    distinctIps.add(ip);
  }
  const anonsMonth = distinctIps.size;

  let paidThisMonth = 0;
  for (const u of authUsers) {
    const d = userDocs.get(u.uid) ?? {};
    const plan = (d.plan as Plan) || "basic";
    if (plan === "basic") continue;
    const created = u.metadata.creationTime ? new Date(u.metadata.creationTime).getTime() : 0;
    const lastSeen = tsToMs(d.lastSeenAt) ?? created;
    if (lastSeen >= monthStart || created >= monthStart) paidThisMonth++;
  }

  const funnel = {
    anonymousMonth: anonsMonth,
    signedUpMonth: signupsMonth,
    paidMonth: paidThisMonth,
    // Conversion rates, rounded to 0.1%
    anonToSignup: anonsMonth > 0
      ? Math.round((signupsMonth / anonsMonth) * 1000) / 10
      : 0,
    signupToPaid: signupsMonth > 0
      ? Math.round((paidThisMonth / signupsMonth) * 1000) / 10
      : 0,
  };

  return NextResponse.json({
    generatedAt: new Date(now).toISOString(),
    users: {
      total: authUsers.length,
      byPlan,
      signupsToday,
      signupsWeek,
      signupsMonth,
    },
    revenue: {
      mrrUsd: Math.round(mrr * 100) / 100,
      activeSubscriptions: activeSubs,
      arrUsd: Math.round(mrr * 12 * 100) / 100,
      compAccounts,
    },
    activity: {
      searchesToday,
      searchesWeek,
      searchesMonth,
      topWords,
      byLang: sortedLangs,
    },
    funnel,
    geo: {
      topCountries: sortedCountries,
    },
  });
}
