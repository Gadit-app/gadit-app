import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { buildHealthReport, type HealthReport } from "@/lib/admin-health";

/**
 * Admin tool: subscriber health (Gadi 2026-10-21). Every paying or trialing
 * subscriber (a family counted once, owner plus members) in four segments by
 * last usage: active (7 days), fading (8 to 30), dormant (30+), never used.
 * Logic in lib/admin-health.ts. Read only.
 *
 * The report is kept in memory for 10 minutes (one activityLog scan over 60
 * days plus a notebook count per account is heavy); &fresh=1 rebuilds it.
 *
 * USAGE: GET /api/admin/health?secret=$ADMIN_SECRET[&fresh=1]
 */

export const maxDuration = 60;

const TTL_MS = 10 * 60_000;
let cache: { at: number; data: HealthReport } | null = null;
let inflight: Promise<HealthReport> | null = null;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const fresh = req.nextUrl.searchParams.get("fresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json({ ...cache.data, cached: true });
  }

  try {
    if (!inflight) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      inflight = buildHealthReport(getAdminDb(), getAdminAuth(), stripe).finally(() => { inflight = null; });
    }
    const data = await inflight;
    cache = { at: Date.now(), data };
    return NextResponse.json({ ...data, cached: false });
  } catch (e) {
    return NextResponse.json({ error: "health_failed", details: String(e).slice(0, 300) }, { status: 500 });
  }
}
