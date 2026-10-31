/**
 * Letters for the world game (Word Trail, Gadi 2026-10-30).
 *
 * A word is split into the letters the child picks at each fork. The wrong
 * doors carry letters that are easy to confuse with the right one (they look
 * or sound alike), so every fork is a real spelling decision.
 */

export type SpellLang = "en" | "he";

const NIQQUD = /[֑-ׇ]/g;

/** The word as the child spells it: lower case, no vowel points. */
export function spellForm(word: string, lang: SpellLang): string {
  const w = word.trim().normalize("NFC");
  return lang === "he" ? w.replace(NIQQUD, "") : w.toLowerCase();
}

/** A word the trail can spell: one word, letters only, 2 to 8 letters. */
export function spellable(word: string, lang: SpellLang): boolean {
  const w = spellForm(word, lang);
  const ok = lang === "he" ? /^[א-ת]{2,7}$/.test(w) : /^[a-z]{2,8}$/.test(w);
  return ok;
}

export function lettersOf(word: string, lang: SpellLang): string[] {
  return Array.from(spellForm(word, lang));
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
  const confuse = (lang === "he" ? HE_CONFUSE : EN_CONFUSE)[right] ?? "";
  const pool = lang === "he" ? HE_ALPHABET : EN_ALPHABET;
  const base = HE_FINAL[right] ?? right;
  const out: string[] = [];
  for (const c of shuffle(Array.from(confuse))) {
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
  const k = lang === "he" ? key : key.toLowerCase();
  if (k === letter) return true;
  return lang === "he" && HE_FINAL[letter] === k;
}
