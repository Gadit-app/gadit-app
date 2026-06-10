/**
 * Shared degenerate-output guard for word-result JSON.
 *
 * Used by:
 *   - /api/define/route.ts  — live generation + cache-read validation
 *   - /api/admin/cleanup-cache/route.ts — one-shot backfill sweep
 *
 * Keep the heuristics in ONE place so the production runtime and the
 * cleanup script can't drift apart and disagree on what "degenerate"
 * means.
 */

export type GuardResult =
  | { degenerate: false }
  | { degenerate: true; reason: string };

const MOJIBAKE_CHARS = /[×™©¨‘’]/g;
const HEBREW_RX   = /[֐-׿]/;
const ARABIC_RX   = /[؀-ۿ]/;
const CYRILLIC_RX = /[Ѐ-ӿ]/;

// Hebrew cantillation / niqqud / punctuation block — these are valid
// Unicode characters used in Torah & poetic Hebrew, but when GPT
// degenerates on a Hebrew etymology it sometimes emits strings made
// almost entirely of these instead of real words. Same shape, different
// mojibake-like signature than the cp1252 one above.
const HEBREW_DECORATIVE_RX = /[֑-ֽֿׁ-ׇ׳״]/g;

// Heuristic: a text is degenerate if fewer than 20% of its non-space
// characters are actual letters in *any* script. This catches the
// "screen of punctuation" failure mode (the one in Gadi's screenshot
// where 'שפה / חלקי מילה / משמעות מקורית / רקע' were all rendered as
// dense streams of cantillation marks and quote symbols).
function isPunctuationSoup(text: string): boolean {
  if (typeof text !== "string") return false;
  const stripped = text.replace(/\s+/g, "");
  if (stripped.length < 12) return false; // too short to judge
  // \p{L} = any kind of letter from any language (Unicode property).
  const letterCount = (stripped.match(/\p{L}/gu) ?? []).length;
  return letterCount / stripped.length < 0.2;
}

// Helper — scan a string for either of the two mojibake signatures we
// know about (cp1252 misdecode + Hebrew-decorative spam) above a
// density threshold.
function hasMojibakeDensity(text: string, threshold = 0.4): boolean {
  if (typeof text !== "string" || text.length === 0) return false;
  const cp1252Count = (text.match(MOJIBAKE_CHARS) ?? []).length;
  if (cp1252Count / text.length > threshold) return true;
  const decorCount = (text.match(HEBREW_DECORATIVE_RX) ?? []).length;
  if (decorCount / text.length > threshold) return true;
  return false;
}

// gpt-4o's Hebrew degeneration often emits ASCII apostrophes (')
// and double-quotes (") interleaved with Hebrew geresh (׳) and
// gershayim (״). Real Hebrew letters get sprinkled between them just
// often enough that the overall letter ratio sits in the 25–30% band,
// which slips past both isPunctuationSoup (< 20%) and
// hasMojibakeDensity (Hebrew-block decorative > 40% — and ASCII
// quotes aren't in that block). The June 10 2026 "יסולא" lookup
// shipped a sourceLanguage field literally rendering as
// 'ע'״ֹב׳״רֹ׳״ת' ׳״ת׳״״׳״ת׳״ׁ"... before this check existed.
//
// A legit Hebrew etymology with biblical citations does use gershayim
// (e.g. "כ\"ח, י\"ז" for chapter and verse numbers) and quoted phrases,
// but the natural density of those marks is well under 15%. Real
// sourceLanguage values (עברית / English / Greek) carry zero. So
// 15% is a safe trip line for any etymology subfield.
const QUOTE_SCATTER_RX = /['"׳״]/g;
function hasQuoteScatter(text: string, threshold = 0.15): boolean {
  if (typeof text !== "string" || text.length < 8) return false;
  const count = (text.match(QUOTE_SCATTER_RX) ?? []).length;
  return count / text.length > threshold;
}

export function isDegenerate(result: unknown, inputWord: string): GuardResult {
  if (!result || typeof result !== "object") {
    return { degenerate: true, reason: "result is not an object" };
  }
  const fr = result as {
    word?: unknown;
    meanings?: Array<{ meaning?: unknown; examples?: unknown }>;
    etymology?: {
      sourceLanguage?: unknown;
      originalWord?: unknown;
      breakdown?: unknown;
      originalMeaning?: unknown;
      historyNote?: unknown;
    };
  };
  const meanings = Array.isArray(fr.meanings) ? fr.meanings : [];

  // (1) Repetition loop — any single example longer than 600 chars
  for (const m of meanings) {
    const exs = Array.isArray(m?.examples) ? m.examples : [];
    for (const ex of exs) {
      if (typeof ex === "string" && ex.length > 600) {
        return { degenerate: true, reason: "example exceeds 600 chars" };
      }
    }
  }

  // (2) Mojibake on the echoed word — UTF-8 bytes mis-decoded as cp1252
  if (typeof fr.word === "string") {
    if (hasMojibakeDensity(fr.word)) {
      return { degenerate: true, reason: "echoed word is mostly mojibake chars" };
    }
  }

  // (3) Wrong-script for non-Latin inputs
  const scriptForInput =
    HEBREW_RX.test(inputWord)   ? { name: "Hebrew",   rx: HEBREW_RX }   :
    ARABIC_RX.test(inputWord)   ? { name: "Arabic",   rx: ARABIC_RX }   :
    CYRILLIC_RX.test(inputWord) ? { name: "Cyrillic", rx: CYRILLIC_RX } :
    null;
  if (scriptForInput && meanings.length > 0) {
    const anyHit = meanings.some((m) =>
      typeof m?.meaning === "string" && scriptForInput.rx.test(m.meaning),
    );
    if (!anyHit) {
      return {
        degenerate: true,
        reason: `input was ${scriptForInput.name} but no definition has ${scriptForInput.name} chars`,
      };
    }
  }

  // (4) Etymology fields — these aren't validated in the legacy guard but
  // a recent gpt-4o failure mode emits the etymology block as dense
  // streams of cantillation marks / quote symbols with zero real letters.
  // Check all five etymology fields for either mojibake density or
  // "punctuation soup".
  //
  // historyNote was missing from this list until June 10 2026 — Gadi
  // and his wife saw the "רקע" field (= historyNote in the schema)
  // rendered as cantillation-mark soup for the idiom "יסולא בפז" while
  // every other field on the page was fine. The guard had been blind
  // to historyNote, so the bad response not only reached the user but
  // got cached for future requests. Including it here lets the guard
  // both reject fresh generations and discard infected cache entries.
  if (fr.etymology && typeof fr.etymology === "object") {
    const fields = ["sourceLanguage", "originalWord", "breakdown", "originalMeaning", "historyNote"] as const;
    for (const f of fields) {
      const raw = (fr.etymology as Record<string, unknown>)[f];
      if (typeof raw !== "string" || raw.length === 0) continue;
      if (hasMojibakeDensity(raw)) {
        return { degenerate: true, reason: `etymology.${f} is mojibake` };
      }
      if (isPunctuationSoup(raw)) {
        return { degenerate: true, reason: `etymology.${f} is punctuation soup (no real letters)` };
      }
      if (hasQuoteScatter(raw)) {
        return { degenerate: true, reason: `etymology.${f} has ASCII quote / geresh scatter pattern` };
      }
      // Belt-and-suspenders for sourceLanguage specifically. The value
      // is always a short clean language name like "Hebrew", "Old
      // English", "עברית", "ערבית קלאסית", "ארמית / יוונית". It NEVER
      // contains apostrophes, double-quotes, Hebrew geresh, or Hebrew
      // gershayim in valid output. So a single one of those characters
      // in sourceLanguage is degenerate by definition, no density
      // threshold needed.
      if (f === "sourceLanguage" && /['"׳״]/.test(raw)) {
        return {
          degenerate: true,
          reason: `etymology.sourceLanguage contains a quote / geresh character (never valid for a language name)`,
        };
      }
      // Three-letters-with-marks-between pattern: A character class
      // letter, one or more mark characters (quote / geresh / niqqud),
      // another letter, more marks, a third letter. Real Hebrew never
      // produces this shape outside extremely unusual abbreviations.
      // Biblical citations like כ"ח cluster their gershayim (letter +
      // mark + letter, one pair) rather than scattering them between
      // every letter (letter + mark + letter + mark + letter).
      if (/[\p{L}](?:['"׳״ֱ-ׇ])+[\p{L}](?:['"׳״ֱ-ׇ])+[\p{L}]/u.test(raw)) {
        return {
          degenerate: true,
          reason: `etymology.${f} has interspersed letter-mark-letter-mark-letter pattern`,
        };
      }
    }
  }

  return { degenerate: false };
}

/**
 * Extract the input word from a cache document id.
 *
 * Key formats produced by /api/define/route.ts (current and legacy):
 *   - "auto2_<lang>_<tier>_<word>"            current
 *   - "ctx2_<lang>_<tier>_<word>_<snippet>"   current
 *   - "auto_<lang>_<tier>_<word>"             legacy pre-2026-06-07
 *   - "ctx_<lang>_<tier>_<word>_<snippet>"    legacy pre-2026-06-07
 *
 * Admin cleanup runs on the full collection — both prefix families
 * still sit in Firestore until the legacy entries age out. The word
 * always sits at index 3 (zero-based) after splitting on "_". Returns
 * null for any key that doesn't follow the expected shape.
 */
export function wordFromCacheKey(key: string): string | null {
  const parts = key.split("_");
  const head = parts[0];
  if (head !== "auto" && head !== "ctx" && head !== "auto2" && head !== "ctx2") return null;
  if (parts.length < 4) return null;
  const word = parts[3];
  return word && word.length > 0 ? word : null;
}
