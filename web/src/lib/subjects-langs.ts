/**
 * Which UI languages have "Key words by subject" (/subjects). Client-safe:
 * the nav and the page use it. German appears only when its two data files
 * existed at build time (next.config.ts sets NEXT_PUBLIC_SUBJECTS_DE).
 */
export type SubjectsUiLang = "he" | "en" | "de" | "ar";
/** Languages whose landing pages show the Subjects band (Arabic has the page, not the band yet). */
export type SubjectsBandLang = "he" | "en" | "de";

export const SUBJECTS_DE_ON = process.env.NEXT_PUBLIC_SUBJECTS_DE === "1";

/** The page's content language for this UI language, or null when the page is not offered in it. */
export function subjectsLangFor(lang: string): SubjectsUiLang | null {
  if (lang === "he" || lang === "en") return lang;
  if (lang === "de" && SUBJECTS_DE_ON) return "de";
  // Arab state education catalog, words in Modern Standard Arabic (Gadi 2026-10-28).
  if (lang === "ar") return "ar";
  return null;
}

/** The landing-page Subjects band's language, or null (no band in Arabic yet). */
export function subjectsBandLangFor(lang: string): SubjectsBandLang | null {
  const l = subjectsLangFor(lang);
  return l === "ar" ? null : l;
}

/** Top-menu label. */
export const SUBJECTS_NAV: Record<SubjectsUiLang, string> = { he: "מקצועות", en: "Subjects", de: "Fächer", ar: "المواد" };
