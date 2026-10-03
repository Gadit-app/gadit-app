import data from "./curriculum-catalog.json";
import { WORD_SETS, type WordSet } from "./word-sets";

// The full Israeli school curriculum (Gadi 2026-10-03): every subject and
// unit from גן to תיכון, state and state-religious, merged from seven
// independent research passes (scripts/curriculum/). Each topic becomes a
// key-word set the first time a teacher opens it (lib/curriculum-sets.ts,
// cached in Firestore curriculumSets/{id}). Rebuild the JSON with
// scripts/curriculum/build_catalog.py; topic ids are stable hashes.

export type CurLevel = { key: string; he: string };
export type CurCategory = { key: string; he: string };
export type CurSubject = { key: string; he: string; cat: string; dati: number };
/** id, subject key, level key, title, grades, number of sources, official link */
export type CurTopic = { id: string; s: string; l: string; t: string; g: string; n: number; o: number };

export const CUR_LEVELS = data.levels as CurLevel[];
export const CUR_CATEGORIES = data.categories as CurCategory[];
export const CUR_SUBJECTS = data.subjects as CurSubject[];
export const CUR_TOPICS = data.topics as CurTopic[];

const SUBJECT_BY_KEY = new Map(CUR_SUBJECTS.map((s) => [s.key, s]));
const TOPIC_BY_ID = new Map(CUR_TOPICS.map((t) => [t.id, t]));

export const curSubject = (key: string) => SUBJECT_BY_KEY.get(key);
export const curTopic = (id: string) => TOPIC_BY_ID.get(id);
export const curLevelHe = (key: string) => CUR_LEVELS.find((l) => l.key === key)?.he ?? key;

export function topicsOf(subject: string, level?: string): CurTopic[] {
  return CUR_TOPICS.filter((t) => t.s === subject && (!level || t.l === level));
}

/** Image shown on a subject card (soft 3D, public/subjects/<key>.webp). */
export const subjectIcon = (key: string) => `/subjects/${key}.webp`;
export const categoryIcon = (key: string) => `/subjects/cat-${key}.webp`;

/** Human grade label: "גן", "כיתה ה", "כיתות ג-ה". */
export function gradeLabel(g: string): string {
  const s = (g || "").trim();
  if (!s || s.includes("גן")) return s || "";
  return s.includes("-") ? `כיתות ${s}` : `כיתה ${s}`;
}

// The hand-made sets (lib/word-sets.ts) live under their catalog subject
// in elementary, shown first as ready-made lessons.
const STATIC_SUBJECT: Record<string, string> = {
  language: "hebrew",
  math: "mathematics",
  english: "english",
  geography: "geography",
  history: "history",
  torah: "bible",
  science: "science-and-technology",
};
export function readySetsOf(subject: string, level: string): WordSet[] {
  if (level !== "elementary") return [];
  return WORD_SETS.filter((w) => STATIC_SUBJECT[w.subject] === subject);
}

/** Words of a foreign-language subject are in that language. */
export const SUBJECT_LANG: Record<string, string> = {
  english: "en", arabic: "ar", french: "fr", spanish: "es", russian: "ru", german: "de",
  italian: "it", chinese: "zh-CN", amharic: "am", portuguese: "pt", persian: "fa",
};
