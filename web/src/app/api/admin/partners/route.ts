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
import { sendPartnerWelcome } from "@/lib/partner-email";
import {
  Partner,
  Commission,
  commissionState,
  tierFor,
  generateDashboardToken,
  DEFAULT_RATE_YEAR_ONE,
  DEFAULT_RATE_LIFETIME,
  FOUNDER_RATE_YEAR_ONE,
} from "@/lib/partners";

export const maxDuration = 60;

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Read a percentage from the request (e.g. 25) into a fraction (0.25),
 *  clamped to a sane 0–100 range. Returns null if absent/invalid. */
function pctToRate(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  if (!isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n) / 100;
}

type Bucket = { pending: number; released: number; paid: number };

// Sequential REF numbers, Yooniz-style: 100, 101, 102… A counter doc
// (partnerConfig/refCounter.next) is the source of truth; claiming is done
// in a transaction so two simultaneous creates can never collide on a
// number.
const REF_START = 100;
type DB = ReturnType<typeof getAdminDb>;

async function peekNextRef(db: DB): Promise<number> {
  const snap = await db.collection("partnerConfig").doc("refCounter").get();
  const n = snap.data()?.next;
  return typeof n === "number" && n >= REF_START ? n : REF_START;
}

async function claimNextRef(db: DB): Promise<string> {
  const ref = db.collection("partnerConfig").doc("refCounter");
  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.data()?.next;
    const n = typeof cur === "number" && cur >= REF_START ? cur : REF_START;
    tx.set(ref, { next: n + 1 }, { merge: true });
    return n;
  });
  return String(claimed);
}

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
        tier: tierFor(p.rateYearOne ?? DEFAULT_RATE_YEAR_ONE),
        rateYearOne: p.rateYearOne ?? DEFAULT_RATE_YEAR_ONE,
        rateLifetime: p.rateLifetime ?? DEFAULT_RATE_LIFETIME,
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
  const nextRef = await peekNextRef(db);
  return NextResponse.json({ partners, nextRef });
}

export async function POST(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  let body: {
    name?: string; email?: string; code?: string;
    rateYearOne?: number | string; rateLifetime?: number | string;
    sendEmail?: boolean; lang?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!isEmail(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

  const rateYearOne = pctToRate(body.rateYearOne) ?? DEFAULT_RATE_YEAR_ONE;
  const rateLifetime = pctToRate(body.rateLifetime) ?? DEFAULT_RATE_LIFETIME;

  const db = getAdminDb();

  // No duplicate partner per email.
  const dup = await db.collection("partners").where("email", "==", email).limit(1).get();
  if (!dup.empty) return NextResponse.json({ error: "email_exists" }, { status: 409 });

  // Custom REF (uppercased) or the next sequential number from the counter.
  let code = (body.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (code) {
    const clash = await db.collection("partners").where("code", "==", code).limit(1).get();
    if (!clash.empty) return NextResponse.json({ error: "code_exists" }, { status: 409 });
  } else {
    // Claim sequential numbers until we land on a free one (a custom code
    // could have squatted a future number).
    for (let i = 0; i < 8; i++) {
      const cand = await claimNextRef(db);
      const clash = await db.collection("partners").where("code", "==", cand).limit(1).get();
      if (clash.empty) { code = cand; break; }
    }
  }
  if (!code) return NextResponse.json({ error: "code_generation_failed" }, { status: 500 });

  const dashboardToken = generateDashboardToken();
  const doc: Omit<Partner, "id"> = {
    code,
    name,
    email,
    tier: tierFor(rateYearOne),
    rateYearOne,
    rateLifetime,
    status: "active",
    dashboardToken,
    audience: null,
    clicks: 0,
    signups: 0,
    ownerUid: null,
    createdAt: new Date().toISOString(),
  };
  const ref = await db.collection("partners").add(doc);

  if (body.sendEmail) {
    await sendPartnerWelcome(
      { code, name, email, dashboardToken, rateYearOne, rateLifetime },
      body.lang === "he" ? "he" : "en",
    );
  }

  return NextResponse.json({ ok: true, id: ref.id, code });
}

export async function PATCH(req: NextRequest) {
  const denied = gate(req);
  if (denied) return denied;

  let body: {
    partnerId?: string; action?: string;
    rateYearOne?: number | string; rateLifetime?: number | string; lang?: string;
  };
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
    const rateYearOne = action === "promote" ? FOUNDER_RATE_YEAR_ONE : DEFAULT_RATE_YEAR_ONE;
    await ref.update({ rateYearOne, tier: tierFor(rateYearOne) });
    return NextResponse.json({ ok: true, tier: tierFor(rateYearOne) });
  }

  // Set explicit rates (percentages) on a partner.
  if (action === "setRates") {
    const rateYearOne = pctToRate(body.rateYearOne);
    const rateLifetime = pctToRate(body.rateLifetime);
    if (rateYearOne === null && rateLifetime === null) {
      return NextResponse.json({ error: "no valid rates" }, { status: 400 });
    }
    const upd: Record<string, unknown> = {};
    if (rateYearOne !== null) { upd.rateYearOne = rateYearOne; upd.tier = tierFor(rateYearOne); }
    if (rateLifetime !== null) upd.rateLifetime = rateLifetime;
    await ref.update(upd);
    return NextResponse.json({ ok: true });
  }

  // Re-send the welcome email (link + code + dashboard).
  if (action === "resendEmail") {
    const p = snap.data() as Omit<Partner, "id">;
    await sendPartnerWelcome(
      { code: p.code, name: p.name, email: p.email, dashboardToken: p.dashboardToken, rateYearOne: p.rateYearOne, rateLifetime: p.rateLifetime },
      body.lang === "he" ? "he" : "en",
    );
    return NextResponse.json({ ok: true });
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
