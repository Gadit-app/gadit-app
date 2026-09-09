import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin — the most-searched words, from the `wordSearches` counters.
 * Feeds the top-words re-generation script (regenerates popular cached
 * words so they pick up new schema fields like `opposite`).
 *
 * GET /api/admin/top-words?secret=$ADMIN_SECRET&n=500[&lang=he][&minCount=2]
 *   → { words: [{ word, lang, count }, ...] }  (highest count first)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const n = Math.min(2000, Math.max(1, Number(req.nextUrl.searchParams.get("n")) || 500));
  const lang = req.nextUrl.searchParams.get("lang")?.trim() || "";
  const minCount = Math.max(1, Number(req.nextUrl.searchParams.get("minCount")) || 1);

  try {
    const q = getAdminDb().collection("wordSearches").orderBy("count", "desc").limit(n * (lang ? 4 : 1));
    const snap = await q.get();
    let rows = snap.docs.map((d) => d.data() as { word?: string; lang?: string; count?: number });
    rows = rows.filter((r) => r.word && r.lang && (r.count ?? 0) >= minCount);
    if (lang) rows = rows.filter((r) => r.lang === lang);
    rows = rows.slice(0, n);
    return NextResponse.json({
      count: rows.length,
      words: rows.map((r) => ({ word: r.word, lang: r.lang, count: r.count ?? 0 })),
    });
  } catch (e) {
    return NextResponse.json({ error: "read_failed", details: String(e) }, { status: 500 });
  }
}
