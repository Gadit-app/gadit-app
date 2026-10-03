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

export const CLASS_THRESHOLDS = [50, 100, 200, 300, 400, 500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

type RankName = { he: string; en: string };
const RANK_NAMES: RankName[] = [
  { he: "צעדים ראשונים", en: "First Steps" },          // 50
  { he: "מועדון המאה", en: "The 100 Club" },           // 100
  { he: "חוקרי מילים", en: "Word Explorers" },         // 200
  { he: "בוני מילים", en: "Word Builders" },           // 300
  { he: "אלופי הסקרנות", en: "Curiosity Champions" },  // 400
  { he: "מועדון ה־500", en: "The 500 Club" },          // 500
  { he: "אדריכלי מילים", en: "Word Architects" },      // 750
  { he: "מועדון האלף", en: "The 1,000 Club" },         // 1000
  { he: "ציידי מילים", en: "Word Hunters" },           // 1250
  { he: "שומרי המילים", en: "Word Keepers" },          // 1500
  { he: "מגלי עולמות", en: "World Discoverers" },      // 1750
  { he: "אלופי המילים", en: "Word Masters" },          // 2000
  { he: "מגדלור המילים", en: "Word Lighthouse" },      // 2500
  { he: "מועדון ה־3,000", en: "The 3,000 Club" },      // 3000
  { he: "שומרי האוצר", en: "Treasure Keepers" },       // 3500
  { he: "ענקי המילים", en: "Word Giants" },            // 4000
  { he: "כוכבי השפה", en: "Language Stars" },          // 4500
  { he: "אגדת המילים", en: "Word Legends" },           // 5000
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
    label: { class: "הכיתה שלכם", school: "בית הספר שלכם" },
    words: (n: number) => `${n.toLocaleString("he-IL")} מילים`,
    toNext: (n: number) => `עוד ${n.toLocaleString("he-IL")} לדרגה הבאה`,
    wow: (scope: ClassScope) => `וואו! ${scope === "class" ? "הכיתה שלכם הגיעה" : "בית הספר שלכם הגיע"} לדרגה חדשה!`,
    reached: (n: number) => `${n.toLocaleString("he-IL")} מילים שונות`,
    rank: (name: string) => `הדרגה החדשה: ${name}`,
    tell: "ספרו לכל הכיתה 🎉",
    close: "המשך",
  },
  en: {
    label: { class: "Your class", school: "Your school" },
    words: (n: number) => `${n.toLocaleString("en-US")} words`,
    toNext: (n: number) => `${n.toLocaleString("en-US")} more to the next rank`,
    wow: (scope: ClassScope) => `Wow! ${scope === "class" ? "Your class" : "Your school"} reached a new rank!`,
    reached: (n: number) => `${n.toLocaleString("en-US")} different words`,
    rank: (name: string) => `New rank: ${name}`,
    tell: "Tell the whole class 🎉",
    close: "Continue",
  },
};

export function classCopy(lang: string) {
  return lang === "he" ? COPY.he : COPY.en;
}
