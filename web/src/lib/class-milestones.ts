/**
 * Class dictionary milestones (Gadi 2026-10-03). A class (or a school's
 * own account on the class computer) collects DIFFERENT words: every new
 * word looked up in class counts once, whoever looked it up (a kid at the
 * class computer, the teacher explaining a word in front of everyone, a
 * word-set lesson). When the count lands on a threshold, the screen that
 * crossed it celebrates and that kid tells the class.
 *
 * Shared by the server (counting) and the client (labels), no server deps.
 */

export const CLASS_THRESHOLDS = [50, 100, 200, 300, 400, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

type RankName = { he: string; en: string };
const RANK_NAMES: RankName[] = [
  { he: "צעדים ראשונים", en: "First Steps" },
  { he: "מועדון המאה", en: "The 100 Club" },
  { he: "חוקרי מילים", en: "Word Explorers" },
  { he: "בוני מילים", en: "Word Builders" },
  { he: "אלופי הסקרנות", en: "Curiosity Champions" },
  { he: "מועדון ה־500", en: "The 500 Club" },
  { he: "אדריכלי מילים", en: "Word Architects" },
  { he: "מועדון האלף", en: "The 1,000 Club" },
  { he: "שומרי המילים", en: "Word Keepers" },
  { he: "אלופי המילים", en: "Word Masters" },
  { he: "מגדלור המילים", en: "Word Lighthouse" },
  { he: "מועדון ה־3,000", en: "The 3,000 Club" },
  { he: "ענקי המילים", en: "Word Giants" },
  { he: "אגדת המילים", en: "Word Legends" },
];

export function rankNameAt(index: number, lang: string): string {
  const r = RANK_NAMES[Math.min(Math.max(index, 0), RANK_NAMES.length - 1)];
  return lang === "he" ? r.he : r.en;
}

/** Next threshold above `count` (null past the last one). */
export function nextThreshold(count: number): number | null {
  return CLASS_THRESHOLDS.find((t) => t > count) ?? null;
}

/** Index of the rank reached at `count` (-1 before the first threshold). */
export function rankIndexFor(count: number): number {
  let idx = -1;
  CLASS_THRESHOLDS.forEach((t, i) => { if (count >= t) idx = i; });
  return idx;
}

/** Same word, however it was typed: trimmed, lowercased, Hebrew/Arabic
 *  vowel points dropped, inner spaces collapsed. */
export function normalizeClassWord(word: string): string {
  return word
    .normalize("NFKC")
    .replace(/[֑-ׇً-ٰٟ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export type ClassScope = "class" | "school";

const COPY = {
  he: {
    label: { class: "הכיתה שלנו", school: "בית הספר שלנו" },
    words: (n: number) => `${n.toLocaleString("he-IL")} מילים`,
    toNext: (n: number) => `עוד ${n.toLocaleString("he-IL")} לדרגה הבאה`,
    wow: (scope: ClassScope, n: number) => `וואו! ${scope === "class" ? "הכיתה שלנו הגיעה" : "בית הספר שלנו הגיע"} ל־${n.toLocaleString("he-IL")} מילים שונות!`,
    rank: (name: string) => `דרגה חדשה: ${name}`,
    tell: "ספרו לכל הכיתה 🎉",
    close: "המשך",
  },
  en: {
    label: { class: "Our class", school: "Our school" },
    words: (n: number) => `${n.toLocaleString("en-US")} words`,
    toNext: (n: number) => `${n.toLocaleString("en-US")} more to the next rank`,
    wow: (scope: ClassScope, n: number) => `Wow! ${scope === "class" ? "Our class" : "Our school"} reached ${n.toLocaleString("en-US")} different words!`,
    rank: (name: string) => `New rank: ${name}`,
    tell: "Tell the whole class 🎉",
    close: "Continue",
  },
};

export function classCopy(lang: string) {
  return lang === "he" ? COPY.he : COPY.en;
}
