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

/* ------------------------------------------------------------------------
 * English, Spanish and Arabic word pages (council round 2, 2026-11-17,
 * Gadi delegated the approval). The Hebrew function above is untouched and
 * must stay byte-identical (its December measurement).
 *
 *   {prefix}{meaning}{separator}{ending}
 *   "Meaning of clay: A natural earthy material that is plastic when wet,
 *    consisting essentially of hydrated silicates of aluminum. With examples
 *    and word origin."
 *   "Significado de easy: algo que no requiere mucho esfuerzo o dificultad
 *    para hacer o entender. Con ejemplos en inglés y en español."
 *
 * Rules: a count only for a word in the page's language and only from 2
 * meanings; the ending names only what the page holds and is never cut;
 * at most 160 characters; the meaning is whole, else whole sentences, else
 * cut at a comma, else at a word with "…".
 * ---------------------------------------------------------------------- */
type IntlCopy = {
  prefix: (w: string, count: string) => string;
  count: (n: number) => string;
  items: { examples: string; idioms: string; origin: string };
  list: (items: string[]) => string;
  bothLanguages?: string;
};
const INTL: Record<string, IntlCopy> = {
  en: {
    prefix: (w, c) => `Meaning of ${w}${c}: `,
    count: (n) => (n === 2 ? " (two meanings)" : ` (${n} meanings)`),
    items: { examples: "examples", idioms: "idioms", origin: "word origin" },
    list: (it) => `With ${it.length === 1 ? it[0] : `${it.slice(0, -1).join(", ")} and ${it[it.length - 1]}`}.`,
  },
  es: {
    prefix: (w, c) => `Significado de ${w}${c}: `,
    count: (n) => (n === 2 ? " (dos significados)" : ` (${n} significados)`),
    items: { examples: "ejemplos", idioms: "modismos", origin: "el origen de la palabra" },
    list: (it) => `Con ${it.length === 1 ? it[0] : `${it.slice(0, -1).join(", ")} y ${it[it.length - 1]}`}.`,
    bothLanguages: "Con ejemplos en inglés y en español.",
  },
  ar: {
    prefix: (w, c) => `معنى كلمة ${w}${c}: `,
    count: (n) => (n === 2 ? " (معنيان)" : n <= 10 ? ` (${n} معانٍ)` : ` (${n} معنى)`),
    items: { examples: "أمثلة", idioms: "تعابير اصطلاحية", origin: "أصل الكلمة" },
    list: (it) => `مع ${it.join(" و")}.`,
    bothLanguages: "مع أمثلة بالإنجليزية والعربية.",
  },
};

const TRAILING = /[\s.,;:…،؛]+$/;

/** Spanish: lower-case the first letter unless the first word has another capital ("ONU"). */
function lowerFirst(s: string): string {
  const first = s.split(/\s/)[0] ?? "";
  if (/\p{Lu}/u.test(first.slice(1))) return s;
  return s.charAt(0).toLocaleLowerCase("es") + s.slice(1);
}

/** The meaning fitted into `room`: [text, separator]. Separator ". ", " " (after ?!؟) or "… ". */
function fitIntl(m: string, room: number): [string, string] | null {
  const sepFor = (t: string) => (/[?!؟]$/.test(t) ? " " : ". ");
  if (m.length <= room) return [m, sepFor(m)];
  // Whole leading sentences.
  let best = "";
  for (let i = 0; i < m.length - 1; i++) {
    if (/[.?!؟]/.test(m[i]) && m[i + 1] === " " && i + 1 <= room) best = m.slice(0, i + 1);
  }
  if (best) {
    const t = best.replace(/\.$/, "");
    return [t, sepFor(t)];
  }
  // A comma (or semicolon) that falls in the second half of the room.
  let cut = -1;
  for (const mark of [", ", "; ", "، ", "؛ "]) {
    let i = m.indexOf(mark);
    while (i !== -1) {
      if (i >= room / 2 && i <= room) cut = Math.max(cut, i);
      i = m.indexOf(mark, i + 1);
    }
  }
  if (cut > 0) return [m.slice(0, cut).replace(TRAILING, ""), ". "];
  // A word.
  const sp = m.lastIndexOf(" ", room - 1);
  if (sp <= 0) return null;
  return [m.slice(0, sp).replace(TRAILING, ""), "… "];
}

export function wordDescriptionIntl(lang: string, word: string, result: Result | null): string | null {
  const c = INTL[lang];
  if (!c || !result) return null;
  const meanings = (Array.isArray(result.meanings) ? result.meanings : []) as Meaning[];
  let m = typeof meanings[0]?.meaning === "string" ? meanings[0].meaning.trim().replace(TRAILING, "") : "";
  if (!m) return null;
  if (lang === "es") m = lowerFirst(m);

  const foreign = isForeignWord(lang, result);
  const n = meanings.length;
  const hasExamples = meanings.some((x) => len(x.examples) > 0);
  const hasIdioms = len(result.generalIdioms) > 0 || meanings.some((x) => len(x.idioms) > 0);
  const ety = result.etymology as { historyNote?: unknown; sourceLanguage?: unknown } | null | undefined;
  const hasOrigin = !!ety && [ety.historyNote, ety.sourceLanguage].some((v) => typeof v === "string" && v.trim().length > 0);
  const both =
    foreign &&
    !!c.bothLanguages &&
    typeof result.language === "string" &&
    result.language.trim().toLowerCase().startsWith("english") &&
    meanings.some((x) => len(x.examplesEn) > 0) &&
    hasExamples;
  const items = [hasExamples && c.items.examples, hasIdioms && c.items.idioms, hasOrigin && c.items.origin].filter(Boolean) as string[];
  const ending = both ? c.bothLanguages! : items.length ? c.list(items) : "";

  let count = !foreign && n >= 2 ? c.count(n) : "";
  let prefix = c.prefix(word, count);
  let room = MAX - prefix.length - 2 - ending.length;
  if (room < 40 && count) {
    count = "";
    prefix = c.prefix(word, count);
    room = MAX - prefix.length - 2 - ending.length;
  }
  if (room < 20) return null;
  const fitted = fitIntl(m, room);
  if (!fitted) return null;
  const [text, sep] = fitted;
  if (!ending) return prefix + text + (sep === "… " ? "…" : sep === " " ? "" : ".");
  return prefix + text + sep + ending;
}
