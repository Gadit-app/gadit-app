/**
 * A school's own word sets (Gadi 2026-10-17): the teacher names a set and
 * adds words (typed, from a photographed book page, or by topic), and the set
 * opens on the projector exactly like a ready set.
 *
 * Shared by the browser and the server (no Firebase here). The ids start with
 * "cur-", so every curriculum code path (isCurriculumSetId, loadWordSet,
 * /api/curriculum-set, the word page's set loader) accepts them as is; the
 * "cur-sch-" part never collides with a catalog id. Stored in Firestore
 * schoolSets/{id} (lib/school-sets.ts, server only).
 */

import { LANGUAGES } from "@/lib/i18n";

export const SCHOOL_SET_PREFIX = "cur-sch-";
export const SCHOOL_SET_MAX_WORDS = 40;
export const SCHOOL_SET_MAX_SETS = 100;
export const SCHOOL_SET_TITLE_MAX = 60;
const WORD_MAX = 40;

/** A school set's level (Gadi 2026-10-17): it sets the picture style, the
 *  definitions' wording, the examples and the class quiz. */
export type SchoolSetLevel = "elementary" | "secondary";
export const SCHOOL_SET_LEVELS: SchoolSetLevel[] = ["elementary", "secondary"];
export const cleanSetLevel = (v: unknown): SchoolSetLevel => (v === "secondary" ? "secondary" : "elementary");
/** Catalog levels taught at middle or high school age (the teen picture style). */
const TEEN_LEVELS = new Set(["middle", "high", "senior", "secondary"]);
export const isTeenLevel = (l: string | null | undefined): boolean => !!l && TEEN_LEVELS.has(l);
/** The level a new set starts on: the school's own when all its levels are
 *  of one kind, else elementary. */
export function defaultSetLevel(schoolLevels: string[]): SchoolSetLevel {
  return schoolLevels.length > 0 && schoolLevels.every((l) => TEEN_LEVELS.has(l)) ? "secondary" : "elementary";
}
/** The level as the set's grade line: shown on the projector and read by the
 *  class quiz prompt ("activities for <grade> students"). */
export function schoolSetGrade(level: SchoolSetLevel, lang: string): string {
  const sec = level === "secondary";
  if (lang === "he") return sec ? "חטיבת ביניים ותיכון" : "בית ספר יסודי";
  if (lang === "ar") return sec ? "المرحلتان الإعداديّة والثانويّة" : "المرحلة الابتدائيّة";
  return sec ? "Middle and high school" : "Primary school";
}

/** The set's language as the teacher chose it (any UI language), else the
 *  one its words' script points to. */
const SET_LANGS = new Set<string>(LANGUAGES.map((l) => l.code));
export function cleanSetLang(v: unknown, words: string[]): string {
  return typeof v === "string" && SET_LANGS.has(v) ? v : setLangOf(words);
}

const ID_RE = /^cur-sch-[a-z0-9]{16,32}$/;
export const isSchoolSetId = (id: string | null | undefined): boolean => !!id && ID_RE.test(id);

/** Hebrew niqqud and cantillation, Arabic tashkeel and tatweel: words are
 *  stored bare, like every curriculum word (niqqud is added on the projector). */
const MARKS = /[֑-ׇֽֿׁׂׅׄ]|[ً-ٰٟـ]/g;

/** One word as it is stored: trimmed, without list markers or end
 *  punctuation, marks removed. Empty when it is not a word. */
export function cleanSetWord(raw: string): string {
  let w = String(raw ?? "").normalize("NFC").replace(MARKS, "");
  // List markers: "1.", "2)", "(3)", "-", "*", "•", "א." at the start.
  w = w.replace(/^\s*(?:[-*•·▪◦]+|\(?\d{1,3}[.)]|[א-ת][.)])\s+/u, "");
  w = w.replace(/\s+/g, " ").trim();
  w = w.replace(/^["'“”„«»]+/u, "").replace(/[.,;:!?،؛…"'“”„«»]+$/u, "").trim();
  if (!w || w.length > WORD_MAX || !/\p{L}/u.test(w)) return "";
  return w;
}

const key = (w: string) => w.toLocaleLowerCase();

/** A list of words, cleaned and without repeats (first spelling kept). */
export function cleanSetWords(list: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of Array.isArray(list) ? list : []) {
    const w = cleanSetWord(typeof x === "string" ? x : "");
    if (!w || seen.has(key(w))) continue;
    seen.add(key(w));
    out.push(w);
  }
  return out;
}

/** Pasted text to words: one per line (commas, semicolons and tabs split too). */
export function splitSetWords(text: string): string[] {
  return cleanSetWords(String(text ?? "").split(/\r?\n|[,;،؛\t]/));
}

/** A set's language from its words' script: it sets the language of the
 *  examples, the quiz and the picture prompt. Latin script is English. */
export function setLangOf(words: string[]): string {
  const s = words.join(" ");
  const n = (re: RegExp) => (s.match(re) ?? []).length;
  const counts: Array<[string, number]> = [
    ["he", n(/[א-ת]/g)],
    [/[پچژگ]/.test(s) ? "fa" : "ar", n(/[؀-ۿ]/g)],
    [/[іїєґ]/i.test(s) ? "uk" : "ru", n(/[Ѐ-ӿ]/g)],
    ["el", n(/[Ͱ-Ͽ]/g)],
    ["hi", n(/[ऀ-ॿ]/g)],
    ["bn", n(/[ঀ-৿]/g)],
    ["am", n(/[ሀ-፿]/g)],
    ["th", n(/[฀-๿]/g)],
    ["ko", n(/[가-힯]/g)],
    ["ja", n(/[぀-ヿ]/g)],
    ["zh-CN", n(/[一-鿿]/g)],
    ["en", n(/[A-Za-zÀ-ɏ]/g)],
  ];
  const best = counts.reduce((a, b) => (b[1] > a[1] ? b : a));
  // Chinese characters with kana are Japanese.
  if (best[0] === "zh-CN" && counts.find((c) => c[0] === "ja")![1] > 0) return "ja";
  return best[1] > 0 ? best[0] : "en";
}
