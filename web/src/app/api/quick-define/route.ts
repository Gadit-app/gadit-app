import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Quick-define — the lightweight popover sibling of /api/define.
 *
 * Used by the tap-any-word popover in a definition. We don't need the
 * full result (etymology, idioms, all meanings, image, kids explanation)
 * — just the headword + first meaning so the popover can render fast.
 *
 * Strategy: cache only. If the word is already in our Firestore cache,
 * return its first meaning instantly. If not, return 404 so the popover
 * can offer a 'open full definition' link that routes through the real
 * /api/define on the result page. We deliberately do NOT trigger a
 * fresh OpenAI generation here — that would let any visitor flood
 * /api/quick-define with rare words and run up our bill in a hover-y
 * UI that's supposed to feel free.
 *
 * USAGE:
 *   GET /api/quick-define?word=חלום&lang=he
 *
 * Anonymous-friendly. The endpoint is read-only on a Firestore collection
 * the user already populated by searching normally.
 *
 * Response (200):
 *   { word, language, meaning, hasMore }   ← cache hit
 * Response (404):
 *   { error: 'not_cached' }                ← caller falls back to /word/X
 */

export const maxDuration = 10;

const SUPPORTED_LANGS = new Set([
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs",
]);

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const word = (url.searchParams.get("word") ?? "").trim();
  const lang = (url.searchParams.get("lang") ?? "").trim().toLowerCase();

  if (!word) {
    return NextResponse.json({ error: "word_required" }, { status: 400 });
  }
  if (!SUPPORTED_LANGS.has(lang)) {
    return NextResponse.json({ error: "invalid_lang" }, { status: 400 });
  }

  // The main /api/define route builds cache keys as either
  //   `auto_<lang>_<tier>_<word>`  (no context sentence)
  //   `ctx_<lang>_<tier>_<word>_<snippet>`  (with context sentence)
  // We only check the auto_ family, base tier — that's the most general
  // result, identical for free and paid users at first-meaning level.
  const key = `auto_${lang}_base_${word.toLowerCase()}`;

  try {
    const snap = await getAdminDb().collection("cache").doc(key).get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "not_cached" },
        {
          status: 404,
          // 1-minute browser cache so a flicker of taps on the same word
          // doesn't re-hit Firestore for the same 404.
          headers: { "Cache-Control": "public, max-age=60" },
        },
      );
    }
    const data = snap.data() as
      | {
          word?: string;
          language?: string;
          meanings?: Array<{ meaning?: string; examples?: string[] }>;
        }
      | undefined;
    const meanings = Array.isArray(data?.meanings) ? data!.meanings : [];
    const firstMeaning =
      typeof meanings[0]?.meaning === "string" ? meanings[0].meaning : "";
    const firstExample =
      Array.isArray(meanings[0]?.examples) && typeof meanings[0]!.examples![0] === "string"
        ? meanings[0]!.examples![0]
        : "";

    return NextResponse.json(
      {
        word: data?.word ?? word,
        language: data?.language ?? "",
        meaning: firstMeaning,
        example: firstExample,
        hasMore: meanings.length > 1,
      },
      {
        // 1-hour CDN cache — quick-define is essentially a dictionary
        // lookup of an already-cached word, so the answer doesn't change
        // until the underlying cache entry does.
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    console.error("[quick-define] failed:", err);
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 },
    );
  }
}
