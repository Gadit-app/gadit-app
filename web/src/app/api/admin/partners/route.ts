/**
 * Admin — partner (affiliate) program management, for /admin/partners.
 *
 *   GET   → list every partner with aggregated earnings by currency
 *           (pending / released / paid) plus the payable balance owed.
 *   PATCH → one action on one partner:
 *             promote  → founder tier      demote  → standard tier
 *             suspend  → status suspended  activate → status active
 *             markPaid → stamp paidAt on every currently-released
 *                        commission (the monthly payout action)
 *
 * Auth: ADMIN_SECRET via ?secret= (identical to the other admin routes;
 * there is no verifyAdmin helper in this project). No `runtime` export.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { Partner, Commission, commissionState, PartnerTier } from "@/lib/partners";

export const maxDuration = 60;

type Bucket = { pending: number; released: number; paid: number };

function gate(req: NextRequest): NextResponse | null {
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
  return null;
}

export async function GET(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  const db = getAdminDb();
  const snap = await db.collection("partners").get();
  const now = Date.now();

  const partners = await Promise.all(
    snap.docs.map(async (d) => {
      const p = { id: d.id, ...(d.data() as Omit<Partner, "id">) };
      const commSnap = await d.ref.collection("commissions").get();
      const earnings: Record<string, Bucket> = {};
      const payingUids = new Set<string>();
      for (const cd of commSnap.docs) {
        const c = cd.data() as Commission;
        payingUids.add(c.referredUid);
        const cur = (c.currency || "usd").toLowerCase();
        const b = (earnings[cur] ??= { pending: 0, released: 0, paid: 0 });
        b[commissionState(c, now)] += c.amount || 0;
      }
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        email: p.email,
        tier: p.tier,
        status: p.status,
        clicks: p.clicks || 0,
        signups: p.signups || 0,
        payingCustomers: payingUids.size,
        commissionCount: commSnap.size,
        earnings, // owed = each currency's `released`
        dashboardUrl: `https://www.gadit.app/partner/dashboard?t=${p.dashboardToken}`,
        createdAt: p.createdAt,
      };
    }),
  );

  partners.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ partners });
}

export async function PATCH(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  let body: { partnerId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const { partnerId, action } = body;
  if (!partnerId || !action) {
    return NextResponse.json({ error: "missing partnerId or action" }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection("partners").doc(partnerId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "partner_not_found" }, { status: 404 });

  if (action === "promote" || action === "demote") {
    const tier: PartnerTier = action === "promote" ? "founder" : "standard";
    await ref.update({ tier });
    return NextResponse.json({ ok: true, tier });
  }

  if (action === "suspend" || action === "activate") {
    const status = action === "suspend" ? "suspended" : "active";
    await ref.update({ status });
    return NextResponse.json({ ok: true, status });
  }

  if (action === "markPaid") {
    const now = Date.now();
    const commSnap = await ref.collection("commissions").get();
    const batch = db.batch();
    let count = 0;
    const paidByCurrency: Record<string, number> = {};
    for (const cd of commSnap.docs) {
      const c = cd.data() as Commission;
      if (commissionState(c, now) === "released") {
        batch.update(cd.ref, { paidAt: now });
        count++;
        const cur = (c.currency || "usd").toLowerCase();
        paidByCurrency[cur] = (paidByCurrency[cur] || 0) + (c.amount || 0);
      }
    }
    if (count > 0) await batch.commit();
    return NextResponse.json({ ok: true, count, paidByCurrency });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
