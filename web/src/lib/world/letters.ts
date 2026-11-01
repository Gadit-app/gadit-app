/**
 * Letters for the world game (Word Trail, Gadi 2026-10-30).
 *
 * A word is split into the letters the child picks at each fork. The wrong
 * doors carry letters that are easy to confuse with the right one (they look
 * or sound alike), so every fork is a real spelling decision.
 *
 * Any alphabet (Gadi 2026-11-01: a child spells in their own language too).
 * A "letter" is one grapheme as the eye sees it (Hindi क्ष, Thai เ, Korean
 * 한), so the tiles never split a joined sign. English and Hebrew keep their
 * hand-made confusion tables; other languages get their alphabet from the
 * server (every grapheme of that language's word bank) and confuse letters
 * that share a base (é è e) or a small look/sound table.
 */

export type SpellLang = string;

/** Languages a child cannot spell letter by letter (characters, not letters). */
export const NO_SPELL_LANGS = new Set(["zh-CN", "zh-TW", "ja"]);
export const RTL_SPELL = new Set(["he", "ar", "fa"]);

const NIQQUD = /[֑-ׇ]/g;
const TASHKEEL = /[ً-ْٰـ]/g;

/** The word as the child spells it: lower case, no vowel points. */
export function spellForm(word: string, lang: SpellLang): string {
  const w = word.trim().normalize("NFC");
  if (lang === "he") return w.replace(NIQQUD, "");
  if (lang === "ar" || lang === "fa") return w.replace(TASHKEEL, "");
  try { return w.toLocaleLowerCase(lang); } catch { return w.toLowerCase(); }
}

const seg = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

/** The letters of a word, one grapheme each. */
export function lettersOf(word: string, lang: SpellLang): string[] {
  const w = spellForm(word, lang);
  if (lang === "en" || lang === "he" || !seg) return Array.from(w);
  return Array.from(seg.segment(w), (s) => s.segment);
}

/** A word the trail can spell: one word, letters only, 2 to 8 letters. */
export function spellable(word: string, lang: SpellLang): boolean {
  if (NO_SPELL_LANGS.has(lang)) return false;
  const w = spellForm(word, lang);
  if (lang === "he") return /^[א-ת]{2,7}$/.test(w);
  if (lang === "en") return /^[a-z]{2,8}$/.test(w);
  if (!/^[\p{L}\p{M}]+$/u.test(w)) return false;
  const n = lettersOf(w, lang).length;
  return n >= 2 && n <= 8;
}

const EN_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const HE_ALPHABET = "אבגדהוזחטיכלמנסעפצקרשת".split("");
const HE_FINAL: Record<string, string> = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

/** Letters a child mixes up with each letter (look-alike or sound-alike). */
const EN_CONFUSE: Record<string, string> = {
  a: "eou", b: "dp", c: "ks", d: "bt", e: "ai", f: "vt", g: "jq", h: "nk", i: "ey", j: "gi",
  k: "ch", l: "it", m: "nw", n: "mh", o: "au", p: "bq", q: "pg", r: "ln", s: "cz", t: "df",
  u: "ov", v: "fw", w: "vm", x: "zk", y: "ij", z: "sx",
};
const HE_CONFUSE: Record<string, string> = {
  א: "עה", ב: "כו", ג: "זנ", ד: "רך", ה: "חא", ו: "זי", ז: "וג", ח: "הכ", ט: "ת", י: "ו",
  כ: "קבח", ך: "דר", ל: "ן", מ: "נם", ם: "סמ", נ: "מג", ן: "וז", ס: "שם", ע: "א", פ: "בף",
  ף: "ךפ", צ: "זס", ץ: "ןצ", ק: "כ", ר: "ד", ש: "ס", ת: "ט",
};
/** Other scripts: the classic mix-ups of children who write them. */
const SCRIPT_CONFUSE: Record<string, string> = {
  // Cyrillic
  е: "ёиэ", ё: "ео", и: "йые", й: "иы", ш: "щж", щ: "шч", ь: "ъы", ъ: "ь", о: "аё", а: "оя",
  з: "сэ", с: "зц", т: "дп", д: "тб", б: "пв", п: "бт", ж: "шз", ц: "сч", ч: "щц", ы: "иь",
  э: "ея", я: "аю", ю: "уя", у: "юо", і: "иї", ї: "ій", є: "еэ", г: "ґх", ґ: "г",
  // Greek
  ο: "ωυ", ω: "ο", η: "ιυ", ι: "ηυ", υ: "ιη", ε: "αη", ά: "αό", έ: "εή", ή: "ηί", ί: "ιή",
  ό: "οώ", ώ: "ωό", ύ: "υί", σ: "ςζ", ς: "σ", ζ: "σξ", ξ: "ζχ", ν: "μυ", μ: "ν", π: "τ", τ: "π",
  // Arabic and Persian
  ت: "طث", ط: "تظ", س: "صث", ص: "سض", ذ: "زظد", ز: "ذظ", ظ: "ذزض", ض: "دص", د: "ضذ",
  ه: "ةح", ة: "هت", ح: "هخج", خ: "حغ", ا: "أإآ", أ: "اإ", إ: "اأ", ق: "كغ", ك: "قگ",
  ث: "تس", ع: "غأ", غ: "عق", ى: "ي", ي: "ىئ", و: "ؤ", ب: "پت", پ: "ب", ج: "چح", چ: "ج",
};

/** Alphabets of the other languages, sent by the server with the words. */
const ALPHABETS = new Map<string, string[]>();
export function registerAlphabet(lang: SpellLang, letters: string[]): void {
  if (letters.length) ALPHABETS.set(lang, letters);
}

function alphabetOf(lang: SpellLang): string[] {
  if (lang === "he") return HE_ALPHABET;
  if (lang === "en") return EN_ALPHABET;
  return ALPHABETS.get(lang) ?? EN_ALPHABET;
}

/** A letter without its accents (é → e), for languages with diacritics. */
const baseOf = (l: string) => l.normalize("NFD").replace(/\p{M}+/gu, "");

function confusables(right: string, lang: SpellLang): string[] {
  if (lang === "he") return Array.from(HE_CONFUSE[right] ?? "");
  if (lang === "en") return Array.from(EN_CONFUSE[right] ?? "");
  const pool = alphabetOf(lang);
  const out: string[] = [];
  // The same letter with other accents first (é è ê e): the real decision.
  const b = baseOf(right);
  // (Korean syllables decompose into jamo that render as the same syllable: skip.)
  // (Hindi ल्ली strips to two letters "लल": not a letter, skip.)
  if (b && b.normalize("NFC") !== right && lettersOf(b, lang).length === 1) out.push(b);
  for (const l of pool) if (l !== right && baseOf(l) === b) out.push(l);
  for (const l of Array.from(SCRIPT_CONFUSE[right] ?? "")) if (pool.includes(l)) out.push(l);
  for (const l of Array.from(EN_CONFUSE[b] ?? "")) if (pool.includes(l)) out.push(l);
  return out;
}

function shuffle<T>(a: T[]): T[] {
  const out = a.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `n` wrong letters for a fork whose right letter is `right`. */
export function decoysFor(right: string, lang: SpellLang, n: number): string[] {
  const pool = alphabetOf(lang);
  const base = HE_FINAL[right] ?? right;
  const out: string[] = [];
  for (const c of shuffle(confusables(right, lang))) {
    if (out.length < n && c !== right && c !== base && !out.includes(c)) out.push(c);
  }
  for (const c of shuffle(pool)) {
    if (out.length >= n) break;
    if (c !== right && c !== base && !out.includes(c)) out.push(c);
  }
  return out;
}

/** The door order at one fork: the right letter among its decoys. */
export function forkLetters(right: string, lang: SpellLang, doors: number): string[] {
  return shuffle([right, ...decoysFor(right, lang, doors - 1)]);
}

/** Tiles for spelling the whole word at the gate: its letters plus a few decoys. */
export function gateTiles(word: string, lang: SpellLang, extra = 3): string[] {
  const letters = lettersOf(word, lang);
  const extras: string[] = [];
  for (const l of shuffle(letters)) {
    if (extras.length >= extra) break;
    const d = decoysFor(l, lang, 1)[0];
    if (d && !letters.includes(d) && !extras.includes(d)) extras.push(d);
  }
  return shuffle([...letters, ...extras]);
}

/** Whether a typed key matches a letter (Hebrew finals accept their base key). */
export function keyMatches(key: string, letter: string, lang: SpellLang): boolean {
  let k = key;
  if (lang !== "he") { try { k = key.toLocaleLowerCase(lang); } catch { k = key.toLowerCase(); } }
  if (k === letter) return true;
  return lang === "he" && HE_FINAL[letter] === k;
}

/** Every distinct letter of a word list, most common first (a language's alphabet). */
export function alphabetFrom(words: string[], lang: SpellLang, max = 48): string[] {
  const n = new Map<string, number>();
  for (const w of words) for (const l of lettersOf(w, lang)) n.set(l, (n.get(l) ?? 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([l]) => l);
}
