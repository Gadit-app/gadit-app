/**
 * Search-result title of a word page (SEO plan item 5, Gadi 2026-10-06).
 *
 * Two shapes, in the page's own language:
 *   - the word is in the page's language:   "{w}: meaning, definitions and examples | Gadit"
 *   - the word is in another language, with a short stored translation:
 *                                           "{w} in English: {t}, meaning and examples | Gadit"
 * Rules: at most 60 characters, so the longest wording is tried first and the
 * next ones drop "examples", then "meaning"; "| Gadit" always stays. The
 * translation is only the common meaning, up to 25 characters; with none, the
 * same-language shape is used. The language name is always in the page's
 * language ("in English" on the English page, "בעברית" on the Hebrew page).
 *
 * All 33 languages approved by Gadi (he/en/es here, the other 30 in
 * word-title-i18n.json, with his fixes for el/hi/ja/ko/tr). In the smaller
 * languages a stored translation is used only once verified
 * (titleTranslationOk, set by scripts/seo/verify-title-translations.mjs);
 * otherwise the title has no translation.
 */
import OTHER_TITLES from "./word-title-i18n.json";

type Tpl = { same: string[]; foreign: string[] };

// {w} = the word, {t} = translation. Longest first.
const BASE_TITLES: Record<string, Tpl> = {
  he: {
    same: ["{w}: פירוש, משמעויות ודוגמאות", "{w}: פירוש ומשמעויות", "{w}: משמעויות"],
    foreign: ["{w} בעברית: {t}, פירוש ודוגמאות", "{w} בעברית: {t}, פירוש", "{w} בעברית: {t}"],
  },
  en: {
    same: ["{w}: meaning, definitions and examples", "{w}: meaning and definitions", "{w}: definitions"],
    foreign: ["{w} in English: {t}, meaning and examples", "{w} in English: {t}, meaning", "{w} in English: {t}"],
  },
  es: {
    same: ["{w}: significado, definiciones y ejemplos", "{w}: significado y definiciones", "{w}: definiciones"],
    foreign: ["{w} en español: {t}, significado y ejemplos", "{w} en español: {t}, significado", "{w} en español: {t}"],
  },
};

const TITLES: Record<string, Tpl> = { ...(OTHER_TITLES as Record<string, Tpl>), ...BASE_TITLES };

/** Languages whose stored translations need a verified flag before a title uses them. */
const VERIFY_TRANSLATION = new Set(["zu", "am", "sw", "af", "fil"]);

/** The English name the definition engine stores in `language`, per UI language. */
const ENGLISH_NAME: Record<string, string> = {
  he: "Hebrew", en: "English", ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French",
  de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic",
  uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek",
  zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Chinese",
  "zh-TW": "Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

const SUFFIX = " | Gadit";
const MAX = 60;

/** The common meaning only: the first item of the stored gloss, up to 25 chars. */
function shortTranslation(t: unknown): string {
  if (typeof t !== "string") return "";
  const first = t.split(/[,;/|(\n]/)[0].trim();
  return first.length > 0 && first.length <= 25 ? first : "";
}

export function wordTitle(
  lang: string,
  word: string,
  result: { language?: unknown; translation?: unknown; titleTranslationOk?: unknown } | null,
): string {
  const tpl = TITLES[lang];
  if (!tpl || !result) return `${word}, Gadit`;
  const wordLang = typeof result.language === "string" ? result.language.trim().toLowerCase() : "";
  const pageLang = (ENGLISH_NAME[lang] ?? "").toLowerCase();
  const foreign = !!wordLang && wordLang !== "unknown" && !!pageLang && !wordLang.startsWith(pageLang);
  const trusted = !VERIFY_TRANSLATION.has(lang) || result.titleTranslationOk === true;
  const t = foreign && trusted ? shortTranslation(result.translation) : "";
  const variants = t ? tpl.foreign : tpl.same;
  const fill = (v: string) => v.split("{w}").join(word).split("{t}").join(t) + SUFFIX;
  const pick = (() => {
    for (const v of variants) {
      const s = fill(v);
      if (s.length <= MAX) return s;
    }
    return fill(variants[variants.length - 1]);
  })();
  // A template placeholder must never reach the page (Gadi 2026-10-06).
  return /\{[wt]\}|\{word\}/.test(pick.replace(word, "")) ? `${word}, Gadit` : pick;
}
