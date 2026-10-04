import data from "./curriculum-catalog.json";
import za from "./curriculum-catalog-za.json";
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

// ── Several national curricula (Gadi 2026-10-04) ──────────────────────────
// A school picks its curriculum once (schools/{sid}.curriculum); the /sets
// browser shows that catalog in its own UI language. "il-he" is the Israeli
// catalog above; "za-caps" is South Africa's CAPS (grades 4-9, English),
// built from the official DBE documents in scripts/curriculum-za/.
export type CatalogId = "il-he" | "za-caps";
export type ViewLevel = { key: string; name: string; short: string };
export type ViewCategory = { key: string; name: string };
export type ViewSubject = { key: string; name: string; cat: string; dati?: number };
export type ViewTopic = { id: string; s: string; l: string; t: string; g: string; term?: number | null };
export type CatalogView = {
  id: CatalogId;
  ui: "he" | "en";
  dir: "rtl" | "ltr";
  defaultLevel: string;
  levels: ViewLevel[];
  categories: ViewCategory[];
  subjects: ViewSubject[];
  topics: ViewTopic[];
  gradeLabel: (g: string) => string;
};

type ZaTopic = { id: string; s: string; l: string; g: string; t: string; term?: number | null; strand?: string };
const ZA_TOPICS = za.topics as ZaTopic[];
const ZA_BY_ID = new Map(ZA_TOPICS.map((t) => [t.id, t]));

const VIEWS: Record<CatalogId, CatalogView> = {
  "il-he": {
    id: "il-he",
    ui: "he",
    dir: "rtl",
    defaultLevel: "elementary",
    levels: CUR_LEVELS.map((l) => ({ key: l.key, name: l.he, short: l.key === "middle" ? "חטיבה" : l.he })),
    categories: CUR_CATEGORIES.map((c) => ({ key: c.key, name: c.he })),
    subjects: CUR_SUBJECTS.map((s) => ({ key: s.key, name: s.he, cat: s.cat, dati: s.dati })),
    topics: CUR_TOPICS,
    gradeLabel,
  },
  "za-caps": {
    id: "za-caps",
    ui: "en",
    dir: "ltr",
    defaultLevel: "intermediate",
    levels: za.levels.map((l) => ({ key: l.key, name: l.en, short: l.en.replace(/ Phase.*/, "") })),
    categories: za.categories.map((c) => ({ key: c.key, name: c.en })),
    subjects: za.subjects.map((s) => ({ key: s.key, name: s.en, cat: s.cat })),
    topics: ZA_TOPICS,
    gradeLabel: (g: string) => (g ? `Grade ${g}` : ""),
  },
};
export const CATALOG_IDS = Object.keys(VIEWS) as CatalogId[];
export const catalogView = (id: CatalogId) => VIEWS[id];

/** Which catalog a curriculum topic id belongs to. */
export function catalogOfTopic(id: string): CatalogId | undefined {
  if (id.startsWith("cur-za-")) return ZA_BY_ID.has(id) ? "za-caps" : undefined;
  return curTopic(id) ? "il-he" : undefined;
}
/** A South African CAPS unit by id (server: words live in curriculum-sets-za.json). */
export const zaTopic = (id: string) => ZA_BY_ID.get(id);
export const zaSubjectName = (key: string) => za.subjects.find((s) => s.key === key)?.en ?? key;
/** The level of any curriculum topic, in its own catalog's level keys. */
export const topicLevel = (id: string) => (ZA_BY_ID.get(id) ?? curTopic(id))?.l;
