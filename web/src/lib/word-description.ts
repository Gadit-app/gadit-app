/**
 * Search-result description of a word page (SEO step 2, wording approved by
 * Gadi 2026-11-15 after the council review).
 *
 * Opens with the form people search, gives the first meaning, ends with what
 * the page really holds. Hebrew pages only; every other language keeps the
 * plain "{word}: {first meaning}" until its wording is approved.
 *
 *   Hebrew word:   "פירוש המילה מרגליות: {meaning} עם דוגמאות ומקור המילה."
 *   many meanings: "פירוש המילה ציר (8 משמעויות): {meaning} עם דוגמאות, ניבים ומקור המילה."
 *   foreign word:  "enhance בעברית: {meaning} עם דוגמאות באנגלית ובעברית."
 *
 * Rules: at most 160 characters; the count comes before the meaning (a
 * searcher of a word with many senses must see at once that the page holds
 * them all); the meaning is cut at the end of a sentence, never the ending;
 * the ending names only what exists on this page.
 */
import { isForeignWord } from "./word-title";

type Meaning = { meaning?: unknown; examples?: unknown; examplesEn?: unknown; idioms?: unknown };
type Result = {
  language?: unknown;
  meanings?: unknown;
  generalIdioms?: unknown;
  etymology?: unknown;
};

const MAX = 160;
const len = (v: unknown) => (Array.isArray(v) ? v.length : 0);

/** The meaning, whole when it fits; else whole sentences; else cut at a comma or a word. */
function fit(text: string, room: number): string {
  const whole = /[.!?]$/.test(text) ? text : `${text}.`;
  if (whole.length <= room) return whole;
  const sentences = whole.match(/[^.!?]+[.!?]+/g) ?? [whole];
  let out = "";
  for (const s of sentences) {
    const next = (out ? `${out} ` : "") + s.trim();
    if (next.length > room) break;
    out = next;
  }
  if (out) return out;
  const head = whole.slice(0, room - 1);
  const comma = head.lastIndexOf(", ");
  if (comma > room * 0.5) return `${head.slice(0, comma)}.`;
  const space = head.lastIndexOf(" ");
  return `${head.slice(0, space > 0 ? space : head.length)}…`;
}

export function wordDescription(lang: string, word: string, result: Result | null): string | null {
  if (lang !== "he" || !result) return null;
  const meanings = (Array.isArray(result.meanings) ? result.meanings : []) as Meaning[];
  const first = typeof meanings[0]?.meaning === "string" ? meanings[0].meaning.trim() : "";
  if (!first) return null;

  const foreign = isForeignWord(lang, result);
  const n = meanings.length;
  const count = n >= 3 ? ` (${n} משמעויות)` : n === 2 ? " (שתי משמעויות)" : "";
  const prefix = foreign
    ? `${word} בעברית${count}: `
    : `${/\s/.test(word) ? "פירוש הביטוי" : "פירוש המילה"} ${word}${count}: `;

  // The ending: only what this page shows.
  const hasExamples = meanings.some((m) => len(m.examples) > 0);
  const hasEnglish =
    foreign &&
    typeof result.language === "string" &&
    result.language.trim().toLowerCase().startsWith("english") &&
    meanings.some((m) => len(m.examplesEn) > 0);
  const hasIdioms = len(result.generalIdioms) > 0 || meanings.some((m) => len(m.idioms) > 0);
  const ety = result.etymology as { historyNote?: unknown; sourceLanguage?: unknown } | null | undefined;
  const hasOrigin = !!ety && [ety.historyNote, ety.sourceLanguage].some((v) => typeof v === "string" && v.trim().length > 0);
  const parts = [
    hasEnglish ? "דוגמאות באנגלית ובעברית" : hasExamples ? "דוגמאות" : "",
    hasIdioms ? "ניבים" : "",
    hasOrigin && !hasEnglish ? "מקור המילה" : "",
  ].filter(Boolean);
  const tail =
    parts.length === 0 ? "" : ` עם ${parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} ו${parts[parts.length - 1]}`}.`;

  return prefix + fit(first, MAX - prefix.length - tail.length) + tail;
}
