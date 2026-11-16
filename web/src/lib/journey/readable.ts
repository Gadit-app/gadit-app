/**
 * Is a card's meaning written in the language of the screen? (Gadi 2026-11-16:
 * an English speaker whose account holds Hebrew lookups must meet English
 * only.) A notebook card keeps the meaning as it was written at the lookup,
 * in the screen language of that moment, and the language of a meaning is not
 * stored, so it is read from its letters: the script most of them belong to.
 * A card whose meaning is in another script waits aside (never deleted) and
 * comes back when the screen is in that language again. A foreign word with a
 * meaning in the screen's language stays: that is learning a language.
 */

const SCRIPTS: Array<[string, RegExp]> = [
  ["hebrew", /\p{Script=Hebrew}/gu],
  ["arabic", /\p{Script=Arabic}/gu],
  ["cyrillic", /\p{Script=Cyrillic}/gu],
  ["greek", /\p{Script=Greek}/gu],
  ["cjk", /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu],
  ["devanagari", /\p{Script=Devanagari}/gu],
  ["thai", /\p{Script=Thai}/gu],
  ["latin", /\p{Script=Latin}/gu],
];

/** The script most letters of a text are written in, or null for a text with no letters. */
export function scriptOfText(text: string): string | null {
  let best: string | null = null, most = 0;
  for (const [name, re] of SCRIPTS) {
    const n = (text.match(re) ?? []).length;
    if (n > most) { most = n; best = name; }
  }
  return best;
}

const UI_SCRIPT: Record<string, string> = {
  he: "hebrew", ar: "arabic", fa: "arabic", ur: "arabic",
  ru: "cyrillic", uk: "cyrillic", bg: "cyrillic", sr: "cyrillic",
  el: "greek", zh: "cjk", ja: "cjk", ko: "cjk", hi: "devanagari", th: "thai",
};
const LATIN = new Set(["en", "es", "fr", "de", "it", "pt", "nl", "pl", "tr", "sv", "da", "no", "nb", "fi", "cs", "sk", "sl", "hr", "ro", "hu", "id", "ms", "vi", "af", "sw", "zu", "ca", "lt", "lv", "et", "tl"]);

/**
 * Languages that share the Latin letters are told apart by their small
 * words: a French meaning ("Un établissement où les enfants...") is written
 * in the same letters as an English one. Only the languages of this list are
 * guessed; a meaning with too few of these words counts as readable.
 */
const SMALL_WORDS: Record<string, string[]> = {
  en: ["the", "of", "to", "and", "or", "is", "that", "for", "with", "by", "on", "it", "used", "something", "someone", "which", "from", "are", "be", "an", "when", "who"],
  fr: ["le", "les", "une", "des", "du", "et", "ou", "est", "qui", "pour", "dans", "avec", "sur", "par", "au", "aux", "où", "quelque", "être", "chose"],
  es: ["el", "los", "las", "una", "del", "y", "que", "para", "con", "por", "es", "se", "al", "algo", "cuando", "como"],
  de: ["der", "die", "das", "ein", "eine", "einer", "und", "oder", "ist", "mit", "von", "zu", "für", "auf", "im", "dem", "des", "sich", "etwas"],
  it: ["il", "lo", "gli", "di", "della", "che", "per", "con", "è", "si", "qualcosa", "quando", "come", "uno"],
  pt: ["os", "um", "uma", "do", "da", "dos", "das", "ou", "que", "para", "com", "em", "por", "é", "algo", "quando"],
  nl: ["het", "een", "en", "van", "dat", "met", "voor", "op", "te", "die", "iets", "wordt"],
};

/** The language of a Latin-script text by its small words, or null when it cannot be told. */
export function latinLanguageOf(text: string): string | null {
  const words = text.toLowerCase().match(/\p{L}+/gu) ?? [];
  let best: string | null = null, most = 0, second = 0;
  for (const [lang, list] of Object.entries(SMALL_WORDS)) {
    const set = new Set(list);
    const n = words.filter((w) => set.has(w)).length;
    if (n > most) { second = most; most = n; best = lang; } else if (n > second) second = n;
  }
  return most >= 2 && most > second ? best : null;
}

/** True when a meaning can be read on a screen in `ui`. A screen language we cannot place shows everything. */
export function readableIn(meaning: string, ui: string): boolean {
  const lang = (ui || "").slice(0, 2).toLowerCase();
  const want = UI_SCRIPT[lang] ?? (LATIN.has(lang) ? "latin" : null);
  if (!want) return true;
  const got = scriptOfText(meaning);
  if (got === null) return true;
  if (got !== want) return false;
  // Latin letters: another language of the list, clearly, is not this screen's.
  if (want === "latin" && SMALL_WORDS[lang]) {
    const guess = latinLanguageOf(meaning);
    return guess === null || guess === lang;
  }
  return true;
}
