/**
 * Syllables of a vowelized (niqqud) Hebrew word, the way a first reader
 * sounds a word out: סַבְתָא → סַבְ · תָא, יַלְדָּה → יַלְ · דָּה, אֲנִי → אֲ · נִי.
 *
 * For the "Reading in syllables" game (Gadi 2026-11-11, for a child who knows
 * every letter and vowel sign but cannot yet blend them into a word). The
 * rules are the classroom ones, not the grammarian's:
 *   - every vowel sign (including the hataf vowels) opens a syllable;
 *   - a shva at the start of a word, or right after another shva, is sounded
 *     and stands as its own unit (בְּ · רֵ · כָה); a shva after a vowel closes
 *     the syllable (יַלְ · דָּה);
 *   - the vowel letters stay with their vowel: וֹ, וּ, a יִ/ֵי/ֶי pair, and a
 *     silent א/ה/ע/י at the end of a word (סַבְתָא, תּוֹדָה, גָּבוֹהַּ);
 *   - the final letters close the syllable they follow.
 * Dagesh forte is not doubled (a child reads גִּינָה as גִּי · נָה).
 */

const LETTER = /[א-ת]/;
const MARK = /[֑-ׇ]/;
const VOWEL_MARKS = /[ֱ-ׇֻ]/; // hataf segol … kubutz, kamatz katan
const SHVA = "ְ";
const DAGESH = "ּ";
const HOLAM = /[ֹֺ]/;
const FINAL_LETTERS = new Set(["ך", "ם", "ן", "ף", "ץ"]);
const SILENT_AT_END = new Set(["א", "ה", "ע", "י", "ו"]);

type Unit = { letter: string; marks: string; vowel: boolean; shva: boolean; text: string };

/** The letters of `word`, each with the signs written on it. */
function units(word: string): Unit[] {
  const out: Unit[] = [];
  for (const ch of word.normalize("NFC")) {
    if (LETTER.test(ch)) out.push({ letter: ch, marks: "", vowel: false, shva: false, text: ch });
    else if (MARK.test(ch) && out.length) { const u = out[out.length - 1]; u.marks += ch; u.text += ch; }
    // anything else (punctuation, geresh) is dropped from the sound-out
  }
  for (const u of out) {
    u.vowel = VOWEL_MARKS.test(u.marks);
    u.shva = !u.vowel && u.marks.includes(SHVA);
  }
  return out;
}

/** A ו that is only a vowel sign for the letter before it (וֹ, וּ). */
function isVavVowel(u: Unit): boolean {
  if (u.letter !== "ו" || u.vowel) return false;
  return HOLAM.test(u.marks) || u.marks.includes(DAGESH);
}

/**
 * The syllables of one vowelized word (no spaces). A word without any vowel
 * sign comes back whole: there is nothing to sound out.
 */
export function syllabify(word: string): string[] {
  const us = units(word.trim());
  if (!us.length || !us.some((u) => u.vowel || isVavVowel(u))) return us.length ? [us.map((u) => u.text).join("")] : [];
  type Syl = { text: string; hasVowel: boolean; closed: boolean };
  const syls: Syl[] = [];
  let cur: Syl | null = null;
  const open = (u: Unit, hasVowel: boolean): Syl => { const s: Syl = { text: u.text, hasVowel, closed: false }; syls.push(s); return s; };
  const attach = (s: Syl, u: Unit) => { s.text += u.text; };

  for (let i = 0; i < us.length; i++) {
    const u = us[i];
    const last = i === us.length - 1;
    if (isVavVowel(u)) {
      // וֹ / וּ: the vowel of the letter before it, or a syllable of its own (וּמַה).
      if (cur && !cur.hasVowel) { attach(cur, u); cur.hasVowel = true; }
      else cur = open(u, true);
      continue;
    }
    if (u.vowel) {
      if (cur && !cur.hasVowel) { attach(cur, u); cur.hasVowel = true; } // a letter with no sign before it (אוֹ…)
      else cur = open(u, true);
      continue;
    }
    if (u.shva) {
      if (!cur) { cur = open(u, true); continue; }                    // sounded shva at the start: בְּ
      if (cur.hasVowel && !cur.closed) { attach(cur, u); cur.closed = true; continue; } // closes: יַלְ
      cur = open(u, true);                                            // a second shva in a row is sounded
      continue;
    }
    // No sign on the letter.
    const silentEnd = last && SILENT_AT_END.has(u.letter);
    // NFC puts the dagesh after the vowel sign, so look anywhere in the marks.
    const mater = u.letter === "י" && !!cur && cur.hasVowel && /[ִ-ָ]/.test(us[i - 1]?.marks ?? "");
    if (cur && (silentEnd || mater || FINAL_LETTERS.has(u.letter) || last)) { attach(cur, u); if (!silentEnd && !mater) cur.closed = true; continue; }
    if (cur && cur.hasVowel && !cur.closed && !us[i + 1]?.vowel && !isVavVowel(us[i + 1] ?? u)) { attach(cur, u); cur.closed = true; continue; }
    // A consonant that starts the next syllable (its vowel is on the next letter, e.g. a vav letter).
    if (cur && !cur.hasVowel) { attach(cur, u); continue; }
    cur = open(u, false);
  }
  // A trailing unit without a vowel (e.g. a final cluster) belongs to the syllable before it.
  const out: string[] = [];
  for (const s of syls) {
    if (!s.hasVowel && out.length) out[out.length - 1] += s.text;
    else out.push(s.text);
  }
  return out;
}

/**
 * How hard a word is to sound out, 1 (two open syllables) to 5, from its
 * syllables: more syllables and closed syllables (a letter after the vowel)
 * make it harder.
 */
export function readingLevel(syllables: string[]): 1 | 2 | 3 | 4 | 5 {
  const n = syllables.length;
  const closed = syllables.filter((s) => {
    const us = units(s);
    const lastU = us[us.length - 1];
    return !!lastU && !lastU.vowel && !isVavVowel(lastU) && !(us.length > 1 && SILENT_AT_END.has(lastU.letter) && !FINAL_LETTERS.has(lastU.letter));
  }).length;
  if (n <= 2) return closed ? 2 : 1;
  if (n === 3) return closed ? 4 : 3;
  return 5;
}
