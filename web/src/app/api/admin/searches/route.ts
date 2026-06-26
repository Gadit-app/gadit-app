import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin analytics — top searched words per UI language.
 *
 * USAGE:
 *   GET /api/admin/searches?secret=$ADMIN_SECRET
 *   Optional: &limit=200          per-language cap (default 100)
 *
 * Reads `wordSearches`, which is bumped on every /api/define hit
 * (cache hits AND live generations) via lib/word-search-log.ts. Each
 * doc carries { word, lang, count, lastAt }; we group client-side
 * because the collection stays small (~ thousands of unique words
 * across all languages, all-time) and Firestore composite indexes are
 * overkill at this scale.
 *
 * Returns:
 *   {
 *     totals: { totalSearches, uniqueWords, byLang: { he: {...}, en: {...}, ... } }
 *     byLang: {
 *       he: Array<{ word, count, lastAt }>   // top N, sorted desc
 *       en: Array<{ word, count, lastAt }>
 *       ...
 *     }
 *   }
 */

export const maxDuration = 30;

type WordRow = {
  word: string;
  count: number;
  lastAt: string | null;
};

type LangStats = {
  totalSearches: number;
  uniqueWords: number;
};

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

  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get("limit") ?? "100", 10) || 100, 1),
    1000,
  );

  const db = getAdminDb();
  const snap = await db.collection("wordSearches").get();

  // Group docs by language.
  const grouped = new Map<string, WordRow[]>();
  const langStats = new Map<string, LangStats>();
  let totalSearches = 0;

  for (const doc of snap.docs) {
    const d = doc.data();
    const lang = typeof d.lang === "string" ? d.lang : null;
    const word = typeof d.word === "string" ? d.word : null;
    const count = typeof d.count === "number" ? d.count : 0;
    if (!lang || !word || count <= 0) continue;
    const lastAtRaw = d.lastAt;
    const lastAt =
      lastAtRaw && typeof lastAtRaw === "object" && "toDate" in lastAtRaw
        ? (lastAtRaw as { toDate: () => Date }).toDate().toISOString()
        : null;

    if (!grouped.has(lang)) grouped.set(lang, []);
    grouped.get(lang)!.push({ word, count, lastAt });

    if (!langStats.has(lang)) langStats.set(lang, { totalSearches: 0, uniqueWords: 0 });
    const ls = langStats.get(lang)!;
    ls.totalSearches += count;
    ls.uniqueWords += 1;
    totalSearches += count;
  }

  // Sort + truncate per language.
  const byLang: Record<string, WordRow[]> = {};
  for (const [lang, rows] of grouped.entries()) {
    rows.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    byLang[lang] = rows.slice(0, limit);
  }

  const totals = {
    totalSearches,
    uniqueWords: snap.size,
    byLang: Object.fromEntries(langStats.entries()),
  };

  return NextResponse.json({ totals, byLang });
}
