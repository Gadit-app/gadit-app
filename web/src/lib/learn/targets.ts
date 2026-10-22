import type { LearnLang } from "./engine";

/** Which languages a kid can learn, by the language of the app. English
 *  is open to every UI language but English itself (Gadi 2026-10-18);
 *  Hebrew as a second language stays with Arabic, Russian and English.
 *  Its own file (2026-10-22) so the family dashboard can use it without
 *  pulling the word banks into the page. */
export function learnTargets(uiLang: string): LearnLang[] {
  if (uiLang === "ar" || uiLang === "ru") return ["en", "he"];
  if (uiLang === "en") return ["he"];
  return ["en"];
}
