/**
 * Shared word tokenizer — splits a string into tappable "word" tokens and
 * plain "other" tokens (whitespace, punctuation), script-aware and RTL-safe.
 *
 * Extracted from TappableText so the Reader (/read) and any tap-any-word
 * surface use the exact same splitting rules. \p{L}=letters (any script),
 * \p{N}=numbers. Single-character and pure-digit runs are demoted to "other"
 * so we don't make every "a"/"1"/Hebrew prefix letter tappable.
 */

/** What /api/ocr writes in place of a word it could not read in a photo (it
 *  never guesses one). Not letters, so it is never a tappable word; the
 *  Reader shows it as a highlighted "?" (Gadi 2026-10-26). */
export const UNSURE_MARK = "⟦?⟧";

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

// Chinese, Japanese, Thai, Lao, Khmer and Burmese write without spaces, so a
// whole sentence came back as one "word" and no single word could be tapped
// (2026-10-23). Those runs are split with the browser's own dictionary-based
// word segmenter. A one-character Chinese word (书 = book) stays tappable;
// a lone kana or Thai character does not.
const NO_SPACE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;
const HAN = /\p{Script=Han}/u;
const segmenters = new Map<string, Intl.Segmenter | null>();
function segmenterFor(word: string): Intl.Segmenter | null {
  const loc = /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word) ? "ja"
    : /\p{Script=Thai}/u.test(word) ? "th"
    : /\p{Script=Lao}/u.test(word) ? "lo"
    : /\p{Script=Khmer}/u.test(word) ? "km"
    : /\p{Script=Myanmar}/u.test(word) ? "my" : "zh";
  if (!segmenters.has(loc)) {
    let sg: Intl.Segmenter | null = null;
    try { if (typeof Intl !== "undefined" && "Segmenter" in Intl) sg = new Intl.Segmenter(loc, { granularity: "word" }); } catch { sg = null; }
    segmenters.set(loc, sg);
  }
  return segmenters.get(loc) ?? null;
}
function pushSegmented(out: WordToken[], run: string) {
  const sg = segmenterFor(run);
  if (!sg) { out.push({ type: run.length >= 2 ? "word" : "other", value: run }); return; }
  for (const seg of sg.segment(run)) {
    const v = seg.segment;
    const tappable = seg.isWordLike && /\p{L}/u.test(v) && (v.length >= 2 || HAN.test(v));
    out.push({ type: tappable ? "word" : "other", value: v });
  }
}

export function tokenizeWords(text: string): WordToken[] {
  const out: WordToken[] = [];
  // \p{M} keeps combining marks (Hebrew niqqud, Arabic tashkeel, Indic matras)
  // ATTACHED to their base letter, so a vowelized word stays one tappable token
  // instead of fragmenting into single letters + marks.
  // Numbers are plain text, never dropped (Gadi 2026-10-18: "3 כפול 4 שווה 12"
  // showed as "כפול שווה" because a bare number matched no group).
  const re = /([\p{L}][\p{L}\p{N}\p{M}'’\-]*)|([\s]+)|([^\p{L}\p{M}\s]+)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const word = m[1];
    if (word) {
      if (NO_SPACE_SCRIPT.test(word)) { pushSegmented(out, word); continue; }
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
