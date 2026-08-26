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

export function tokenizeWords(text: string): WordToken[] {
  const out: WordToken[] = [];
  const re = /([\p{L}][\p{L}\p{N}'’\-]*)|([\s]+)|([^\p{L}\p{N}\s]+)/gu;
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

/** Normalized key for a word — how we dedupe "Word" / "word" / "word." so all
 *  occurrences share one reviewed state and the progress denominator is the
 *  count of distinct words. */
export function wordKey(word: string): string {
  return word.toLowerCase();
}

/** Distinct tappable words in a text (the progress denominator). */
export function distinctWordCount(text: string): number {
  const seen = new Set<string>();
  for (const t of tokenizeWords(text)) {
    if (t.type === "word") seen.add(wordKey(t.value));
  }
  return seen.size;
}
