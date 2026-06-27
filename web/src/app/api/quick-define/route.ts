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
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi",
]);

const UI_LANG_NAMES: Record<string, string> = {
  he: "Hebrew",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  cs: "Czech",
  sk: "Slovak",
  it: "Italian",
  ja: "Japanese",
  hi: "Hindi",
};

// On-the-fly micro-definition for popovers when the cache misses.
// Uses gpt-4o-mini (cheap, fast) and asks for nothing more than a
// short meaning + a one-sentence example. Capped to ~80 tokens out
// per call. The result is NOT written back to the main /api/define
// cache — that cache demands a full schema (etymology, idioms, kids
// explanation, etc.) and this stripped reply would corrupt it.
// Future improvement: a separate "preview" cache collection.
async function generatePreview(
  word: string,
  langCode: string,
): Promise<{ meaning: string; example: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const langName = UI_LANG_NAMES[langCode] ?? "English";
  const systemPrompt = `You are a fast dictionary. For the given word, return STRICT JSON: {"meaning":"15-25 word definition","example":"one short sentence using the word"}. Write BOTH fields in ${langName}. Keep the word itself in its original script if multilingual. No markdown, no extra keys, no preamble.`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Word: ${word}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 160,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { meaning?: string; example?: string };
    return {
      meaning: typeof parsed.meaning === "string" ? parsed.meaning : "",
      example: typeof parsed.example === "string" ? parsed.example : "",
    };
  } catch (e) {
    console.warn("[quick-define] live generation failed:", e);
    return null;
  }
}

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
  //   `auto2_<lang>_<tier>_<word>`  (no context sentence)
  //   `ctx2_<lang>_<tier>_<word>_<snippet>`  (with context sentence)
  // We only check the auto2_ family, base tier — that's the most general
  // result, identical for free and paid users at first-meaning level.
  //
  // Prefix moved from auto_ to auto2_ on 2026-06-07 in lockstep with
  // /api/define to invalidate cross-language wrong-language entries.
  // While the auto2_ cache is filling up popovers will return 404 for
  // recently-defined words; the WordPopover gracefully falls back to
  // routing through /api/define for the full result, so the UX
  // degradation is one extra click, not a broken state.
  const key = `auto2_${lang}_base_${word.toLowerCase()}`;

  try {
    const snap = await getAdminDb().collection("cache").doc(key).get();
    if (!snap.exists) {
      // Cache miss: fall through to a cheap on-the-fly micro-definition
      // so the popover never shows up empty. Earlier this returned 404
      // and the popover surfaced an awkward "Tap below to see the full
      // definition" — a real user (Eyal, June 2026) read it as a bug
      // because the popover was supposed to BE the definition. The
      // generated reply is intentionally short (no etymology, idioms,
      // examples > 1) — anyone wanting depth taps "Open full".
      const preview = await generatePreview(word, lang);
      if (preview && (preview.meaning || preview.example)) {
        return NextResponse.json(
          {
            word,
            language: "",
            meaning: preview.meaning,
            example: preview.example,
            hasMore: false,
            generated: true,
          },
          { headers: { "Cache-Control": "public, max-age=300" } },
        );
      }
      return NextResponse.json(
        { error: "not_cached" },
        {
          status: 404,
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
