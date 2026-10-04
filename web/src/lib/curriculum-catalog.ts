import data from "./curriculum-catalog.json";
import za from "./curriculum-catalog-za.json";
import arCat from "./curriculum-catalog-ar.json";
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
// built from the official DBE documents in scripts/curriculum-za/; "il-ar"
// is Israel's Arab state education (Arabic, RTL), merged in
// scripts/curriculum-ar/ from several research answers.
export type CatalogId = "il-he" | "il-ar" | "za-caps";
export type ViewLevel = { key: string; name: string; short: string };
export type ViewCategory = { key: string; name: string };
export type ViewSubject = { key: string; name: string; cat: string; dati?: number };
export type ViewTopic = { id: string; s: string; l: string; t: string; g: string; term?: number | null };
export type CatalogView = {
  id: CatalogId;
  ui: "he" | "ar" | "en";
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

// Arab state education: same level keys as the Hebrew catalog, grades kept
// as Hebrew letters in the data (א to יב) and shown as numbers in Arabic.
export type ArTopic = { id: string; s: string; l: string; t: string; th: string; g: string; n: number; o: number };
const AR_TOPICS = arCat.topics as ArTopic[];
const AR_BY_ID = new Map(AR_TOPICS.map((t) => [t.id, t]));
const HE_GRADE: Record<string, number> = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, יא: 11, יב: 12 };
export function arGradeLabel(g: string): string {
  const s = (g || "").trim();
  if (!s) return "";
  if (s.includes("גן")) return "الروضة";
  const [a, b] = s.split("-").map((x) => HE_GRADE[x.trim()]);
  if (a && b) return `الصفوف ${a} إلى ${b}`;
  return a ? `الصف ${a}` : "";
}

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
  "il-ar": {
    id: "il-ar",
    ui: "ar",
    dir: "rtl",
    defaultLevel: "elementary",
    levels: arCat.levels.map((l) => ({ key: l.key, name: l.ar, short: l.ar })),
    categories: arCat.categories.map((c) => ({ key: c.key, name: c.ar })),
    subjects: arCat.subjects.map((s) => ({ key: s.key, name: s.ar, cat: s.cat })),
    topics: AR_TOPICS,
    gradeLabel: arGradeLabel,
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
  if (id.startsWith("cur-ar-")) return AR_BY_ID.has(id) ? "il-ar" : undefined;
  return curTopic(id) ? "il-he" : undefined;
}
/** A South African CAPS unit by id (server: words live in curriculum-sets-za.json). */
export const zaTopic = (id: string) => ZA_BY_ID.get(id);
export const zaSubjectName = (key: string) => za.subjects.find((s) => s.key === key)?.en ?? key;
/** The level of any curriculum topic, in its own catalog's level keys. */
export const topicLevel = (id: string) => (ZA_BY_ID.get(id) ?? AR_BY_ID.get(id) ?? curTopic(id))?.l;
/** An Arab state education unit by id, and its subject. */
export const arTopic = (id: string) => AR_BY_ID.get(id);
export const arSubject = (key: string) => arCat.subjects.find((s) => s.key === key);
export const arLevel = (key: string) => arCat.levels.find((l) => l.key === key);
