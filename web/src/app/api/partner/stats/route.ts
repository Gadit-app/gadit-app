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
import { Partner, Commission, commissionState } from "@/lib/partners";

export const maxDuration = 30;

type Bucket = { pending: number; released: number; paid: number };

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

    for (const d of commSnap.docs) {
      const c = d.data() as Commission;
      commissionCount++;
      payingUids.add(c.referredUid);
      const cur = (c.currency || "usd").toLowerCase();
      const b = (byCurrency[cur] ??= { pending: 0, released: 0, paid: 0 });
      b[commissionState(c, now)] += c.amount || 0;
    }

    return NextResponse.json({
      name: partner.name,
      code: partner.code,
      tier: partner.tier,
      status: partner.status,
      link: `https://www.gadit.app/p/${partner.code}`,
      clicks: partner.clicks || 0,
      signups: partner.signups || 0,
      payingCustomers: payingUids.size,
      commissionCount,
      earnings: byCurrency, // { ils: {pending,released,paid}, usd: {...} }
    });
  } catch (err) {
    console.error("[/api/partner/stats] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
