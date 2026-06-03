import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { isDegenerate, wordFromCacheKey } from "@/lib/define-guard";

/**
 * One-shot cache backfill sweep — removes every cached word-result
 * document that fails the current isDegenerate() guard. Designed for
 * the post-launch-fix cleanup so users never hit a corrupted entry
 * from before the guard existed.
 *
 * USAGE:
 *   GET /api/admin/cleanup-cache?secret=$ADMIN_SECRET
 *   GET /api/admin/cleanup-cache?secret=$ADMIN_SECRET&dryRun=1   ← report-only, no deletes
 *   GET /api/admin/cleanup-cache?secret=$ADMIN_SECRET&limit=500  ← cap docs scanned this call
 *
 * Auth: ADMIN_SECRET env var. Set it in Vercel and include via
 * `?secret=…`. If the env var isn't set, the endpoint refuses to run
 * (so we never expose unauthenticated cache deletes by accident).
 *
 * Response shape:
 *   {
 *     dryRun: bool,
 *     scanned: N,
 *     deleted: N,
 *     kept:    N,
 *     unparseable: N,
 *     samples: [{ id, reason }, …],     ← first 10 rejected for log/debug
 *     reasonCounts: { ... }
 *   }
 *
 * Vercel function timeout is bumped to 5 minutes (300s) since a full
 * cache sweep across thousands of entries can take a while.
 */

export const maxDuration = 300;

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

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(5000, parseInt(limitParam, 10))) : 5000;

  const db = getAdminDb();
  const snap = await db.collection("cache").limit(limit).get();

  let scanned = 0;
  let deleted = 0;
  let kept = 0;
  let unparseable = 0;
  const samples: Array<{ id: string; reason: string }> = [];
  const reasonCounts: Record<string, number> = {};

  // Batch deletes in groups of 400 — Firestore limit is 500 per
  // batch; 400 leaves a safety margin.
  let batch = db.batch();
  let batchCount = 0;
  async function flushBatch() {
    if (batchCount === 0) return;
    if (!dryRun) {
      await batch.commit();
    }
    batch = db.batch();
    batchCount = 0;
  }

  for (const doc of snap.docs) {
    scanned++;
    const id = doc.id;
    const data = doc.data();

    // Skip non-result docs gracefully — anything in the cache
    // collection that isn't a word-result shape just stays.
    if (!data || typeof data !== "object") {
      unparseable++;
      continue;
    }

    // Derive the input word from the doc id so the wrong-script
    // check has the original input. If we used data.word, a
    // mojibake'd echoed word would pass the script check on itself.
    const inputWord = wordFromCacheKey(id) ?? "";

    const verdict = isDegenerate(data, inputWord);
    if (verdict.degenerate) {
      deleted++;
      reasonCounts[verdict.reason] = (reasonCounts[verdict.reason] ?? 0) + 1;
      if (samples.length < 10) samples.push({ id, reason: verdict.reason });
      batch.delete(doc.ref);
      batchCount++;
      if (batchCount >= 400) await flushBatch();
    } else {
      kept++;
    }
  }

  await flushBatch();

  return NextResponse.json({
    dryRun,
    scanned,
    deleted,
    kept,
    unparseable,
    samples,
    reasonCounts,
    hint: scanned === limit
      ? `Hit the limit of ${limit}. Re-run to process the rest.`
      : `Swept every cache doc.`,
  });
}
