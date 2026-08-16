/**
 * GET /api/partner/stats?t=<dashboardToken>
 *
 * Powers the partner's own dashboard. The `t` token (emailed at signup)
 * is the only credential — there are no partner passwords. It resolves
 * to exactly one partner and exposes only that partner's numbers.
 *
 * Earnings are grouped by currency (a partner can refer both ILS and USD
 * customers) and by payout state. State is DERIVED from timestamps on
 * read (pending until 30 days pass, then released, then paid once an
 * admin marks it), so no cron is needed to advance a commission.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Partner, Commission, commissionState, PAYOUT_MINIMUM_MINOR } from "@/lib/partners";

export const maxDuration = 30;

type Bucket = { pending: number; released: number; paid: number };

/** Privacy-safe mask of a referred customer's id: never a name or email
 *  (spec §10.6) — just enough to tell rows apart. "aB••••7z". */
function maskId(uid: string): string {
  if (uid.length <= 4) return "••••";
  return `${uid.slice(0, 2)}••••${uid.slice(-2)}`;
}

/** First day of next month, ISO date — the monthly manual-payout cadence. */
function nextPayoutDate(now: number): string {
  const d = new Date(now);
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return next.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("t") || "";
    if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });

    const db = getAdminDb();
    const snap = await db
      .collection("partners")
      .where("dashboardToken", "==", token)
      .limit(1)
      .get();
    if (snap.empty) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const partner = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Partner, "id">) };

    const commSnap = await snap.docs[0].ref.collection("commissions").get();
    const now = Date.now();
    const byCurrency: Record<string, Bucket> = {};
    const payingUids = new Set<string>();
    let commissionCount = 0;

    // Per referred customer, for the "who signed up through you" table.
    type Ref = { uid: string; first: number; total: number; currency: string; released: number; paid: number; nextRelease: number };
    const byRef = new Map<string, Ref>();

    for (const d of commSnap.docs) {
      const c = d.data() as Commission;
      commissionCount++;
      payingUids.add(c.referredUid);
      const cur = (c.currency || "usd").toLowerCase();
      const b = (byCurrency[cur] ??= { pending: 0, released: 0, paid: 0 });
      const state = commissionState(c, now);
      b[state] += c.amount || 0;

      const r = byRef.get(c.referredUid) ?? { uid: c.referredUid, first: c.createdAt || now, total: 0, currency: cur, released: 0, paid: 0, nextRelease: Infinity };
      r.first = Math.min(r.first, c.createdAt || now);
      r.total += c.amount || 0;
      if (state === "released") r.released += c.amount || 0;
      if (state === "paid") r.paid += c.amount || 0;
      if (state === "pending") r.nextRelease = Math.min(r.nextRelease, c.releaseAt);
      byRef.set(c.referredUid, r);
    }

    const referrals = [...byRef.values()]
      .sort((a, b) => b.first - a.first)
      .map((r) => ({
        maskedId: maskId(r.uid),
        joinedAt: new Date(r.first).toISOString(),
        totalMinor: r.total,
        currency: r.currency,
        status: r.paid >= r.total ? "paid" : r.released > 0 ? "available" : "pending",
        availableAt: Number.isFinite(r.nextRelease) ? new Date(r.nextRelease).toISOString() : null,
      }));

    // Payout: the primary currency = the one holding the most released $.
    const primaryCur = Object.entries(byCurrency)
      .sort((a, b) => b[1].released - a[1].released)[0]?.[0] ?? "usd";
    const availableMinor = byCurrency[primaryCur]?.released ?? 0;

    return NextResponse.json({
      name: partner.name,
      code: partner.code,
      tier: partner.tier,
      rateYearOne: partner.rateYearOne ?? 0.25,
      rateLifetime: partner.rateLifetime ?? 0.1,
      status: partner.status,
      link: `https://www.gadit.app/?ref=${partner.code}`,
      clicks: partner.clicks || 0,
      signups: partner.signups || 0,
      payingCustomers: payingUids.size,
      commissionCount,
      earnings: byCurrency, // { ils: {pending,released,paid}, usd: {...} }
      referrals,
      payout: {
        minimumMinor: PAYOUT_MINIMUM_MINOR,
        currency: primaryCur,
        availableMinor,
        nextPayoutDate: nextPayoutDate(now),
      },
    });
  } catch (err) {
    console.error("[/api/partner/stats] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
