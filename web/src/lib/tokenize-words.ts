/**
 * Shared word tokenizer — splits a string into tappable "word" tokens and
 * plain "other" tokens (whitespace, punctuation), script-aware and RTL-safe.
 *
 * Extracted from TappableText so the Reader (/read) and any tap-any-word
 * surface use the exact same splitting rules. \p{L}=letters (any script),
 * \p{N}=numbers. Single-character and pure-digit runs are demoted to "other"
 * so we don't make every "a"/"1"/Hebrew prefix letter tappable.
 */

export type WordToken =
  | { type: "word"; value: string }
  | { type: "other"; value: string };

// Optional pronunciation diacritics that are NOT part of a word's identity and
// must be stripped before a cache/definition lookup: Hebrew niqqud + cantillation
// (U+0591–U+05C7) and Arabic tashkeel (U+064B–U+065F, U+0670, U+06D6–U+06ED).
// Deliberately NOT a blanket \p{M} strip — Indic matras (Devanagari etc.) ARE
// part of the word and stripping them would change the word.
const LOOKUP_DIACRITICS = /[֑-ׇً-ٰٟۖ-ۭ]/gu;

/** Remove optional Hebrew/Arabic vowel marks for lookup, keeping the base word. */
export function stripLookupDiacritics(word: string): string {
  return word.replace(LOOKUP_DIACRITICS, "");
}

export function tokenizeWords(text: string): WordToken[] {
  const out: WordToken[] = [];
  // \p{M} keeps combining marks (Hebrew niqqud, Arabic tashkeel, Indic matras)
  // ATTACHED to their base letter, so a vowelized word stays one tappable token
  // instead of fragmenting into single letters + marks.
  const re = /([\p{L}][\p{L}\p{N}\p{M}'’\-]*)|([\s]+)|([^\p{L}\p{N}\p{M}\s]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = m[1];
    if (word) {
      if (word.length >= 2) out.push({ type: "word", value: word });
      else out.push({ type: "other", value: word });
      continue;
    }
    out.push({ type: "other", value: m[2] ?? m[3] ?? "" });
  }
  return out;
}

/** Normalized key for a word — dedupes "Word" / "word" and vowelized vs plain
 *  ("מַחְבֶּרֶת" / "מחברת") so all occurrences share one reviewed state and the
 *  progress denominator counts distinct words. */
export function wordKey(word: string): string {
  return stripLookupDiacritics(word).toLowerCase();
}

/** Distinct tappable words in a text (the progress denominator). */
export function distinctWordCount(text: string): number {
  const seen = new Set<string>();
  for (const t of tokenizeWords(text)) {
    if (t.type === "word") seen.add(wordKey(t.value));
  }
  return seen.size;
}
