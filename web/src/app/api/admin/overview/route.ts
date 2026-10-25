import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";
import { customerCategory, internalUids, isPayingStatus, type CustomerCategory } from "@/lib/internal-accounts";
import type { UserRecord } from "firebase-admin/auth";
import { buildAttentionLists, type UserLookup, buildAppUpgradeList } from "./attention";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Admin tool — single overview endpoint that the /admin main dashboard
 * consumes. Returns everything a "morning glance" view needs:
 *
 *   - Money (Stripe, same helper as the Revenue page)
 *   - Accounts: total, by customer category, signups today / 7 / 30 days
 *   - Activity: searches and people today / 7 days, from the activity log
 *     (the same source as the Activity page, humans only)
 *   - Conversion funnel: anonymous visitors → signups → paying, 30 days
 *
 * One definition everywhere (Gadi 2026-10-10): our own accounts and everyone
 * attached to them are never counted, the four customer categories are
 * Basic / Individual / Family / Schools, a family counts once, and paying
 * means active or past_due in the grace period (trials apart). Top words,
 * languages and countries live on their own pages, not here.
 *
 * USAGE:
 *   GET /api/admin/overview?secret=$ADMIN_SECRET
 */

export const maxDuration = 60;

const DAY = 86_400_000;

/** Midnight today, Israel time, as epoch ms. */
function israelDayStart(now: number): number {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
  const guess = Date.parse(`${p}T00:00:00+03:00`);
  // +02:00 in winter: if that midnight is still "yesterday" in Israel, move an hour.
  const back = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(guess));
  return back === p ? guess : guess + 3_600_000;
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
  // Money from Stripe (source of truth), same helper as the Revenue page.
  const rev = await summarizeStripeRevenue(stripe);
  const now = Date.now();
  const todayStart = israelDayStart(now);
  const weekStart = now - 7 * DAY;
  const monthStart = now - 30 * DAY;

  // ---------- 1) All Auth users + their Firestore docs ----------
  const allAuthUsers: UserRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    allAuthUsers.push(...page.users);
    pageToken = page.pageToken;
    if (allAuthUsers.length >= 5000) break;
  } while (pageToken);

  // Synthetic family-member (kid) uids `${familyId}_${memberId}` are
  // device-paired child sessions, not accounts (Gadi 2026-07-27).
  const authUsers = allAuthUsers.filter((u) => !u.uid.includes("_"));

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

  const internal = internalUids(authUsers.map((u) => {
    const d = userDocs.get(u.uid) ?? {};
    return { uid: u.uid, email: u.email ?? (typeof d.email === "string" ? d.email : null), familyId: d.familyId, schoolId: d.schoolId };
  }));
  const counted = authUsers.filter((u) => !internal.has(u.uid));

  // Stripe customer / email → account, for the "needs attention" lists
  // (name, country flag, link to Subscribers).
  const look: UserLookup = { byCustomer: new Map(), byEmail: new Map(), info: new Map() };
  for (const u of authUsers) {
    const d = userDocs.get(u.uid) ?? {};
    if (typeof d.stripeCustomerId === "string" && d.stripeCustomerId) look.byCustomer.set(d.stripeCustomerId, u.uid);
    const email = (u.email ?? (typeof d.email === "string" ? d.email : "")).trim().toLowerCase();
    if (email && !look.byEmail.has(email)) look.byEmail.set(email, u.uid);
    const name =
      (u.displayName ?? "").trim() ||
      (typeof d.displayName === "string" ? d.displayName.trim() : "") ||
      (typeof d.name === "string" ? d.name.trim() : "") ||
      null;
    look.info.set(u.uid, { name, country: typeof d.country === "string" && d.country ? d.country.toUpperCase() : null });
  }

  // ---------- 2) Accounts (money comes from Stripe) ----------
  const byCategory: Record<CustomerCategory, number> = { basic: 0, individual: 0, family: 0, schools: 0 };
  const families = new Set<string>();
  let signupsToday = 0;
  let signupsWeek = 0;
  let signupsMonth = 0;
  // Signups of the last 30 days who pay now / are in a trial (the funnel).
  const signupPaying = new Set<string>();
  const signupTrialing = new Set<string>();

  for (const u of counted) {
    const d = userDocs.get(u.uid) ?? {};
    const cat = customerCategory(d, u.uid);
    // A family counts once, however many of its members have accounts.
    if (cat === "family") {
      const fid = typeof d.familyId === "string" ? d.familyId : u.uid;
      if (!families.has(fid)) { families.add(fid); byCategory.family += 1; }
    } else {
      byCategory[cat] += 1;
    }

    const created = u.metadata.creationTime ? new Date(u.metadata.creationTime).getTime() : 0;
    if (created >= todayStart) signupsToday++;
    if (created >= weekStart) signupsWeek++;
    if (created >= monthStart) {
      signupsMonth++;
      if (cat !== "basic" && d.comp !== true) {
        const key = cat === "family" && typeof d.familyId === "string" ? `f:${d.familyId}` : u.uid;
        if (isPayingStatus(d.subscriptionStatus)) signupPaying.add(key);
        else if (d.subscriptionStatus === "trialing") signupTrialing.add(key);
      }
    }
  }

  // ---------- 3) Activity, from the activity log (humans, not us) ----------
  const actSnap = await db.collection("activityLog")
    .where("atMs", ">=", monthStart)
    .select("kind", "count", "uid", "ua", "country", "isBot", "atMs")
    .get();
  const act = { today: 0, week: 0, month: 0 };
  const peopleToday = new Set<string>();
  const peopleWeek = new Set<string>();
  for (const doc of actSnap.docs) {
    const x = doc.data() as { kind?: string; count?: number; uid?: string | null; ua?: string | null; country?: string | null; isBot?: boolean; atMs?: number };
    if (x.isBot || x.kind === "image") continue;
    if (x.uid && (internal.has(x.uid) || internal.has(x.uid.split("_")[0]))) continue;
    const n = Number(x.count ?? 1);
    const at = x.atMs ?? 0;
    const who = x.uid || `anon:${x.country ?? ""}:${x.ua ?? ""}`;
    act.month += n;
    if (at >= weekStart) { act.week += n; peopleWeek.add(who); }
    if (at >= todayStart) { act.today += n; peopleToday.add(who); }
  }

  // ---------- 4) Conversion funnel, 30 days ----------
  // Anonymous = distinct IPs that searched without an account. Paying =
  // of the people who signed up in the window, how many pay now (never more
  // than the signups, unlike the old "any paid account seen this month").
  const anonUsageSnap = await db
    .collection("anonUsage")
    .where("date", ">=", new Date(monthStart).toISOString().slice(0, 10))
    .get();
  const distinctIps = new Set<string>();
  for (const doc of anonUsageSnap.docs) {
    const d = doc.data();
    distinctIps.add((d.ip as string) || doc.id.split("_")[0]);
  }
  const anonsMonth = distinctIps.size;
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

  const funnel = {
    anonymousMonth: anonsMonth,
    signedUpMonth: signupsMonth,
    paidMonth: signupPaying.size,
    trialingMonth: signupTrialing.size,
    anonToSignup: pct(signupsMonth, anonsMonth),
    signupToPaid: pct(signupPaying.size, signupsMonth),
  };

  return NextResponse.json({
    generatedAt: new Date(now).toISOString(),
    users: {
      total: counted.length,
      byCategory,
      signupsToday,
      signupsWeek,
      signupsMonth,
    },
    revenue: {
      // Money triplet (spec §3.1): current MRR (active + past_due),
      // potential MRR from trials, net-new MRR this month.
      mrrUsd: rev.mrrUsd,
      arrUsd: rev.arrUsd,
      atRiskMrrUsd: rev.atRiskMrrUsd,
      trialingMrrUsd: rev.trialingMrrUsd,
      trialingArrUsd: rev.trialingArrUsd,
      trialingCardedCount: rev.trialingCardedCount,
      trialingCardlessCount: rev.trialingCardlessCount,
      totalMrrUsd: rev.totalMrrUsd,
      totalArrUsd: rev.totalArrUsd,
      newMrrUsd: rev.newMrrUsd,
      churnedMrrUsd: rev.churnedMrrUsd,
      netNewMrrUsd: rev.netNewMrrUsd,
      payingSubscriptions: rev.activePayingCount,
      payingCustomers: rev.activePayingCustomers,
      // Kept for the Strategy page, which reads this name.
      activeSubscriptions: rev.activePayingCustomers,
      newCustomersThisMonth: rev.newCustomersThisMonth,
      churnedCustomersThisMonth: rev.churnedCustomersThisMonth,
      trialingSubscriptions: rev.trialingCount,
      payingByTier: rev.payingByTier,
      trialingByTier: rev.trialingByTier,
    },
    // Three decision metrics (spec §13): trial→paid, ARPU, CAC payback.
    decision: {
      arpuUsd: rev.arpuUsd,
      monthlyChurnPct: rev.monthlyChurnPct,
      trialConversionPct: rev.trialConversionPct,
      trialResolvedCount: rev.trialResolvedCount,
      cacUsd: rev.cacUsd,
      grossMargin: rev.grossMargin,
      cacPaybackMonths: rev.cacPaybackMonths,
    },
    // Operational alerts (spec §3.6) — only rendered when a counter > 0.
    alerts: {
      // Every subscription with a payment problem (past_due, unpaid,
      // incomplete), so the count matches the list under it.
      paymentProblemCount: rev.atRisk.length,
      pastDueCount: rev.pastDueCount,
      scheduledCancelCount: rev.scheduledCancelCount,
      endedThisWeekCount: rev.endedThisWeekCount,
      unmappedPriceCount: rev.unmappedPriceCount,
      unmappedPriceIds: rev.unmappedPriceIds,
      atRisk: rev.atRisk.map((s) => ({
        email: s.email,
        tier: s.tier,
        monthlyUsd: s.monthlyUsd,
        currency: s.currency,
        status: s.status,
      })),
      // Who is behind each chip (opened inline on the Overview).
      lists: { ...buildAttentionLists(rev, look), appUpgrade: await buildAppUpgradeList(getAdminDb()).catch(() => []) },
    },
    businessTz: rev.businessTz,
    activity: {
      searchesToday: act.today,
      searchesWeek: act.week,
      searchesMonth: act.month,
      peopleToday: peopleToday.size,
      peopleWeek: peopleWeek.size,
    },
    funnel,
  });
}
