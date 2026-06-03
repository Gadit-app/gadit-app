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

export function isDegenerate(result: unknown, inputWord: string): GuardResult {
  if (!result || typeof result !== "object") {
    return { degenerate: true, reason: "result is not an object" };
  }
  const fr = result as {
    word?: unknown;
    meanings?: Array<{ meaning?: unknown; examples?: unknown }>;
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
    const ws = fr.word;
    const mojibakeCount = (ws.match(MOJIBAKE_CHARS) ?? []).length;
    if (ws.length > 0 && mojibakeCount / ws.length > 0.4) {
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

  return { degenerate: false };
}

/**
 * Extract the input word from a cache document id.
 *
 * Key formats produced by /api/define/route.ts:
 *   - "auto_<lang>_<tier>_<word>"
 *   - "ctx_<lang>_<tier>_<word>_<sentenceSnippet>"
 *
 * The word always sits at index 3 (zero-based) after splitting on "_".
 * Returns null for any key that doesn't follow the expected shape.
 */
export function wordFromCacheKey(key: string): string | null {
  const parts = key.split("_");
  if (parts[0] !== "auto" && parts[0] !== "ctx") return null;
  if (parts.length < 4) return null;
  const word = parts[3];
  return word && word.length > 0 ? word : null;
}
