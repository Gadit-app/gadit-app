import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Admin analytics — historic word list reconstructed from the `cache`
 * collection. Used to populate the all-time picture for searches made
 * BEFORE the wordSearches counter shipped (2026-06-18).
 *
 * Cache doc IDs come in two shapes:
 *   auto2_<lang>_<tier>_<word>
 *   ctx2_<lang>_<tier>_<word>_<ctx-up-to-60-chars>
 *
 * We extract (lang, word) per doc, dedupe per language, and return
 * an alphabetical list. No counts — cache writes one doc per unique
 * (word, lang, tier, ctx); subsequent searches just hit the cache and
 * never bump the doc, so we have no popularity signal here, only the
 * raw set of words anyone has ever asked for.
 *
 * USAGE:
 *   GET /api/admin/searches/historic?secret=$ADMIN_SECRET
 *
 * Returns:
 *   {
 *     totals: { totalDocs, parsedDocs, byLang: { he: count, en: count, ... } }
 *     byLang: { he: ["שלום", ...], en: ["hello", ...], ... }
 *   }
 */

export const maxDuration = 60;

const KEY_RE = /^(auto2|ctx2)_([a-z]+)_([a-z]+)_(.+)$/;

function parseCacheKey(id: string): { lang: string; word: string } | null {
  const m = id.match(KEY_RE);
  if (!m) return null;
  const [, kind, lang, , rest] = m;
  let word = rest;
  if (kind === "ctx2") {
    const ix = rest.indexOf("_");
    if (ix !== -1) word = rest.slice(0, ix);
  }
  return { lang, word };
}

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

  const db = getAdminDb();
  const snap = await db.collection("cache").get();

  const grouped = new Map<string, Set<string>>();
  let parsed = 0;
  for (const doc of snap.docs) {
    const k = parseCacheKey(doc.id);
    if (!k) continue;
    parsed++;
    if (!grouped.has(k.lang)) grouped.set(k.lang, new Set());
    grouped.get(k.lang)!.add(k.word);
  }

  const byLang: Record<string, string[]> = {};
  const langCounts: Record<string, number> = {};
  for (const [lang, words] of grouped.entries()) {
    const sorted = [...words].sort();
    byLang[lang] = sorted;
    langCounts[lang] = sorted.length;
  }

  return NextResponse.json({
    totals: {
      totalDocs: snap.size,
      parsedDocs: parsed,
      byLang: langCounts,
    },
    byLang,
  });
}
