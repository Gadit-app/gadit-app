/**
 * Classroom insights — pure aggregation over a classroom's search log.
 *
 * Gadi 2026-08-03, after the council: the value a school buys is
 * COMPREHENSION made visible, at the CLASS level (not a per-student
 * ranking). This turns the raw /c/<CODE> search log
 * ({ word, lang, studentName? }) into the three things a teacher/principal
 * can act on:
 *   - languages: which languages the class actually learns in (the
 *     un-fakeable "home-language map" — `lang` is the language the meaning
 *     was delivered in, i.e. the student's own language).
 *   - topWords: the words the class keeps looking up, so a teacher can
 *     pre-teach them ("stuck words").
 *   - students: a PRIVATE support signal — who is looking up the most,
 *     framed as "may need extra attention", shown only when the teacher
 *     opted into a named roster. Never a public leaderboard.
 *
 * Pure and dependency-free so both the principal-authed classroom view and
 * any future teacher-by-code view can share it, and so it's trivially
 * testable.
 */

export interface RawSearch {
  word: string;
  lang?: string;
  studentName?: string;
}

export interface WordCount {
  word: string;
  count: number;
}

export interface LangCount {
  lang: string;
  count: number;
  pct: number; // 0..100, share of the sample
}

export interface StudentCount {
  name: string;
  count: number;
}

export interface ClassroomInsights {
  /** Number of searches actually aggregated (the loaded window). */
  sampleSize: number;
  topWords: WordCount[];
  languages: LangCount[];
  students: StudentCount[];
  /** Fraction 0..1 of the sample that carried a student name. Lets the UI
   *  decide whether the per-student signal is meaningful yet. */
  namedShare: number;
}

/** Human labels for the language codes Gadit's UI supports. Falls back to
 *  the raw code (uppercased) for anything unmapped. */
export const CLASSROOM_LANG_LABEL: Record<string, string> = {
  he: "עברית",
  en: "English",
  ar: "العربية",
  ru: "Русский",
  am: "አማርኛ",
  hi: "हिन्दी",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ja: "日本語",
  cs: "Čeština",
  sk: "Slovenčina",
};

export function classroomLangLabel(code: string): string {
  return CLASSROOM_LANG_LABEL[code] ?? (code ? code.toUpperCase() : "?");
}

export function computeClassroomInsights(
  searches: RawSearch[],
  opts: { topWordsLimit?: number; studentsLimit?: number } = {},
): ClassroomInsights {
  const topWordsLimit = opts.topWordsLimit ?? 10;
  const studentsLimit = opts.studentsLimit ?? 6;

  // Words: group case-insensitively (so "Dog" and "dog" are one), but keep
  // the first-seen surface form for display.
  const wordCounts = new Map<string, { display: string; count: number }>();
  const langCounts = new Map<string, number>();
  const studentCounts = new Map<string, number>();
  let named = 0;

  for (const s of searches) {
    const word = (s.word ?? "").trim();
    if (word) {
      const key = word.toLowerCase();
      const existing = wordCounts.get(key);
      if (existing) existing.count += 1;
      else wordCounts.set(key, { display: word, count: 1 });
    }

    const lang = (s.lang ?? "").trim();
    if (lang) langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1);

    const name = (s.studentName ?? "").trim();
    if (name) {
      named += 1;
      studentCounts.set(name, (studentCounts.get(name) ?? 0) + 1);
    }
  }

  const sampleSize = searches.length;

  const topWords: WordCount[] = [...wordCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, topWordsLimit)
    .map((w) => ({ word: w.display, count: w.count }));

  const langTotal = [...langCounts.values()].reduce((a, b) => a + b, 0) || 1;
  const languages: LangCount[] = [...langCounts.entries()]
    .map(([lang, count]) => ({ lang, count, pct: Math.round((count / langTotal) * 100) }))
    .sort((a, b) => b.count - a.count);

  const students: StudentCount[] = [...studentCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, studentsLimit);

  return {
    sampleSize,
    topWords,
    languages,
    students,
    namedShare: sampleSize > 0 ? named / sampleSize : 0,
  };
}
