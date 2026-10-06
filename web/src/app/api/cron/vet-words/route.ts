import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { vetWords } from "@/lib/word-vet";
import { adminBudgetExceeded } from "@/lib/ai-budget";

/**
 * Weekly: vet the public word pages that have no verdict yet (indexOk), so
 * words people searched since the last run join the all-words hub, the links
 * between words and the sitemap, and gibberish or private names stay out
 * (Gadi 2026-10-06). Up to LIMIT docs per run, about $0.03; the daily admin
 * cap stops it before any spend if admin runs already used the day's budget.
 *   GET /api/cron/vet-words              (Vercel cron, Bearer CRON_SECRET)
 *   GET /api/cron/vet-words?secret=...&dryRun=1   (count only, no spend)
 */

export const maxDuration = 60;
const LIMIT = 150;

function authorised(req: NextRequest): boolean {
  const cron = process.env.CRON_SECRET;
  if (cron && req.headers.get("authorization") === `Bearer ${cron}`) return true;
  const admin = process.env.ADMIN_SECRET;
  return !!admin && req.nextUrl.searchParams.get("secret") === admin;
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  const db = getAdminDb();
  const snap = await db
    .collection("cache")
    .where(FieldPath.documentId(), ">=", "auto2_")
    .where(FieldPath.documentId(), "<", "auto2`")
    .select("language", "indexOk")
    .get();
  const todo = snap.docs
    .map((d) => ({ d, m: d.id.match(/^auto2_(.+?)_base_(.+)$/) }))
    .filter((x) => x.m && typeof x.d.get("indexOk") !== "boolean");
  if (dryRun || todo.length === 0) return NextResponse.json({ ok: true, unvetted: todo.length, dryRun });
  if (await adminBudgetExceeded()) return NextResponse.json({ ok: false, skipped: "admin_budget", unvetted: todo.length });

  const batch = todo.slice(0, LIMIT);
  const verdicts = await vetWords(batch.map((x) => ({ word: x.m![2], language: String(x.d.get("language") || "") })));
  const writer = db.bulkWriter();
  batch.forEach((x, i) => writer.set(x.d.ref, { indexOk: verdicts[i] }, { merge: true }));
  await writer.close();
  const ok = verdicts.filter(Boolean).length;
  return NextResponse.json({ ok: true, vetted: batch.length, indexOk: ok, blocked: batch.length - ok, left: todo.length - batch.length });
}
