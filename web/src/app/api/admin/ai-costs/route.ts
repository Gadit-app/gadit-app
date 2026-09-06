import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { PRICING, IMAGE_COST } from "@/lib/ai-cost";

/**
 * Admin tool — engine (OpenAI) cost breakdown, read from the `aiUsage`
 * daily rollups written by lib/ai-cost.ts. OpenAI's own dashboard can only
 * split by model; this splits by PRODUCT FEATURE (full definition vs Reader
 * word-tap vs image vs Arabic tashkeel) so Gadi can decide what to price.
 *
 * USAGE: GET /api/admin/ai-costs?secret=$ADMIN_SECRET&days=30
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Bucket = { cost: number; calls: number; tokensIn?: number; tokensOut?: number; images?: number };
type DayDoc = {
  day: string;
  totalCost?: number;
  totalCalls?: number;
  features?: Record<string, Bucket>;
  models?: Record<string, Bucket>;
  plans?: Record<string, Bucket>;
};

function addInto(target: Record<string, Bucket>, src: Record<string, Bucket> | undefined) {
  if (!src) return;
  for (const [k, v] of Object.entries(src)) {
    const t = target[k] ?? (target[k] = { cost: 0, calls: 0, tokensIn: 0, tokensOut: 0, images: 0 });
    t.cost += v.cost ?? 0;
    t.calls += v.calls ?? 0;
    t.tokensIn = (t.tokensIn ?? 0) + (v.tokensIn ?? 0);
    t.tokensOut = (t.tokensOut ?? 0) + (v.tokensOut ?? 0);
    t.images = (t.images ?? 0) + (v.images ?? 0);
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET env var not configured, refusing to run" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));

  let docs: DayDoc[] = [];
  try {
    const snap = await getAdminDb()
      .collection("aiUsage")
      .orderBy("day", "desc")
      .limit(days)
      .get();
    docs = snap.docs.map((d) => d.data() as DayDoc);
  } catch (e) {
    return NextResponse.json({ error: "read_failed", details: String(e) }, { status: 500 });
  }

  // Window aggregates
  const features: Record<string, Bucket> = {};
  const models: Record<string, Bucket> = {};
  const plans: Record<string, Bucket> = {};
  let totalCost = 0;
  let totalCalls = 0;
  for (const d of docs) {
    totalCost += d.totalCost ?? 0;
    totalCalls += d.totalCalls ?? 0;
    addInto(features, d.features);
    addInto(models, d.models);
    addInto(plans, d.plans);
  }

  // Per-day series, oldest -> newest, for the chart.
  const series = docs
    .map((d) => ({ day: d.day, cost: d.totalCost ?? 0, calls: d.totalCalls ?? 0 }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));

  const toSorted = (m: Record<string, Bucket>) =>
    Object.entries(m)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.cost - a.cost);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    windowDays: days,
    daysWithData: docs.length,
    totalCost,
    totalCalls,
    avgPerDay: docs.length ? totalCost / docs.length : 0,
    features: toSorted(features),
    models: toSorted(models),
    plans: toSorted(plans),
    series,
    pricing: { chat: PRICING, image: IMAGE_COST },
  });
}
