/**
 * The niqqud door of מילים פולשות (Gadi 2026-11-25, design doc
 * 2026-11-25-niqqud-door-design.md): the vowel signs, the 11 stations and how
 * one call is built. A sign is named at the top; signs, syllables or pictured
 * words fall, and the child catches those that carry it.
 *
 * Sound first, then name: at the five sound stations kamatz and patah are the
 * same answer (and so are tsere and segol, shuruk and kubutz); only at the
 * name stations does the twin sign become the impostor.
 *
 * Pure and with no imports, so web/scripts/check-niqqud.mjs runs it as is.
 */

export type SignId =
  | "kamatz" | "patah" | "tsere" | "segol" | "hiriqMale" | "hiriqHaser"
  | "holamMale" | "holamHaser" | "shuruk" | "kubutz" | "shva";

/** `mark` is what follows a letter; `name` is spoken (the spelling of GameVowelSteps). */
export const SIGNS: Record<SignId, { mark: string; name: string }> = {
  kamatz: { mark: "ָ", name: "קָמָץ" },
  patah: { mark: "ַ", name: "פַּתָּח" },
  tsere: { mark: "ֵ", name: "צֵירֵי" },
  segol: { mark: "ֶ", name: "סֶגּוֹל" },
  hiriqMale: { mark: "ִי", name: "חִירִיק" },
  hiriqHaser: { mark: "ִ", name: "חִירִיק" },
  holamMale: { mark: "וֹ", name: "חוֹלָם" },
  holamHaser: { mark: "ֹ", name: "חוֹלָם" },
  shuruk: { mark: "וּ", name: "שׁוּרוּק" },
  kubutz: { mark: "ֻ", name: "קֻבּוּץ" },
  shva: { mark: "ְ", name: "שְׁוָא" },
};

/** What each sign says on its own: the five vowel sounds (recorded for GameLetterSounds), and shva's name. */
const SOUND_OF: Record<SignId, string> = {
  kamatz: "אָ", patah: "אָ", hiriqMale: "אִי", hiriqHaser: "אִי", holamMale: "אוֹ", holamHaser: "אוֹ",
  shuruk: "אוּ", kubutz: "אוּ", tsere: "אֶ", segol: "אֶ", shva: "שְׁוָא",
};

/** The letters of GameVowelSteps: clear at the start of a syllable, and its checked recordings exist for them. */
export const NQ_LETTERS = ["מ", "ל", "נ", "ס", "ר", "שׁ", "ז", "ד", "ג", "ט", "ק", "בּ", "תּ"];

/**
 * One kind of call. `top` is shown, `hear` is spoken; `ok` is true at the sign
 * and letter stages, `okWords` at the word stage; `by` says whether an item
 * speaks its sound or its sign's name; `heavy` is a sign that makes at least
 * half of the impostors.
 */
export type CallTpl = { top: SignId[]; ok: SignId[]; okWords: SignId[]; imps: SignId[]; hear: string; by: "sound" | "name"; heavy?: SignId };
export type Station = { id: string; n: number; calls: CallTpl[] };

const MAIN: SignId[] = ["kamatz", "patah", "hiriqHaser", "holamMale", "shuruk", "kubutz", "tsere", "segol"];
const sound = (ok: SignId[], okWords: SignId[], hear: string): CallTpl => ({
  top: ok, ok, okWords, hear, by: "sound",
  imps: MAIN.filter((s) => !ok.some((o) => SOUND_OF[o] === SOUND_OF[s])),
});
const named = (a: SignId, b: SignId): CallTpl[] => [
  { top: [a], ok: [a], okWords: [a], imps: [b], hear: SIGNS[a].name, by: "name" },
  { top: [b], ok: [b], okWords: [b], imps: [a], hear: SIGNS[b].name, by: "name" },
];

export const STATIONS: Station[] = [
  { id: "s-a", n: 1, calls: [sound(["kamatz", "patah"], ["kamatz", "patah"], "אָ")] },
  { id: "s-i", n: 2, calls: [sound(["hiriqHaser"], ["hiriqHaser", "hiriqMale"], "אִי")] },
  { id: "s-o", n: 3, calls: [sound(["holamMale"], ["holamMale"], "אוֹ")] },
  { id: "s-u", n: 4, calls: [sound(["shuruk", "kubutz"], ["shuruk", "kubutz"], "אוּ")] },
  { id: "s-e", n: 5, calls: [sound(["tsere", "segol"], ["tsere", "segol"], "אֶ")] },
  { id: "n-a", n: 6, calls: named("kamatz", "patah") },
  { id: "n-e", n: 7, calls: named("tsere", "segol") },
  { id: "n-u", n: 8, calls: named("shuruk", "kubutz") },
  { id: "x-o", n: 9, calls: [{ top: ["holamHaser", "holamMale"], ok: ["holamHaser", "holamMale"], okWords: ["holamHaser", "holamMale"], imps: ["shuruk", "kamatz", "patah", "hiriqHaser", "tsere", "segol"], hear: "אוֹ", by: "sound", heavy: "shuruk" }] },
  { id: "x-i", n: 10, calls: [{ top: ["hiriqHaser", "hiriqMale"], ok: ["hiriqHaser", "hiriqMale"], okWords: ["hiriqHaser", "hiriqMale"], imps: ["tsere", "segol"], hear: "אִי", by: "sound" }] },
  { id: "x-sh", n: 11, calls: [{ top: ["shva"], ok: ["shva"], okWords: ["shva"], imps: ["tsere"], hear: "שְׁוָא", by: "name" }] },
];

export type NqWord = { w: string; g: SignId; p: string };
export type NqItem = { key: string; sign: SignId; ok: boolean; stage: 1 | 2 | 3; text: string; say: string; p?: string };

/** A sign on its own: on a dotted circle, except the ones written with a vav. */
export function signAlone(s: SignId): string {
  if (s === "holamMale" || s === "shuruk") return SIGNS[s].mark;
  return "◌" + SIGNS[s].mark;
}

/** A letter with a sign, and what is sent to /api/tts for it (GameVowelSteps' rules, so its recordings play). */
export function syllable(letter: string, s: SignId): { text: string; say: string } {
  const text = letter + SIGNS[s].mark;
  if (s === "shva") return { text, say: SIGNS.shva.name };
  if (s === "hiriqHaser" || s === "hiriqMale") return { text, say: letter + "ִי" };
  if (s === "kubutz") return { text, say: letter + "וּ" };
  if (s === "holamHaser") return { text, say: letter + "וֹ" };
  return { text, say: text };
}

const POINT = /[֑-ׇ]/;
/** The vowel sign of a word's first letter (dagesh and the shin/sin dots ignored). */
export function firstSign(w: string): SignId | null {
  const ch = [...w];
  const marks: string[] = [];
  let i = 1;
  while (i < ch.length && POINT.test(ch[i])) marks.push(ch[i++]);
  const next = ch[i], after = ch[i + 1];
  if (marks.includes("ָ")) return "kamatz";
  if (marks.includes("ַ")) return "patah";
  if (marks.includes("ֵ")) return "tsere";
  if (marks.includes("ֶ")) return "segol";
  if (marks.includes("ִ")) return next === "י" ? "hiriqMale" : "hiriqHaser";
  if (marks.includes("ֹ") || marks.includes("ֺ")) return "holamHaser";
  if (marks.includes("ֻ")) return "kubutz";
  if (marks.includes("ְ")) return "shva";
  if (next === "ו" && after === "ֹ") return "holamMale";
  if (next === "ו" && after === "ּ") return "shuruk";
  return null;
}

function shuffle<T>(a: T[], rnd: () => number): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const pick = <T,>(a: T[], rnd: () => number): T => a[Math.floor(rnd() * a.length)];

/** Impostor signs for `n` items: a call's `heavy` sign makes at least half of them. */
function impSigns(tpl: CallTpl, n: number, rnd: () => number): SignId[] {
  const out: SignId[] = [];
  for (let i = 0; i < n; i++) out.push(tpl.heavy && i < Math.ceil(n / 2) ? tpl.heavy : pick(tpl.imps, rnd));
  return out;
}

/**
 * One call of a round: the call's template, 3 true items and the impostors the
 * door draws from. Stage 1 = the sign alone (the same sign may fall three
 * times; the impostor pool repeats the heavy sign to weight it), stage 2 =
 * a letter with the sign (three different letters, and the same letters come
 * back as impostors with another sign), stage 3 = a pictured word (`words`
 * already holds only words with a picture).
 */
export function buildCall(st: Station, callIndex: number, stage: 1 | 2 | 3, words: NqWord[], rnd: () => number = Math.random): { tpl: CallTpl; trues: NqItem[]; imps: NqItem[] } {
  const tpl = st.calls[callIndex % st.calls.length];
  const speak = (s: SignId) => (tpl.by === "name" ? SIGNS[s].name : SOUND_OF[s]);
  let trues: NqItem[] = [];
  let imps: NqItem[] = [];

  if (stage === 1) {
    const order = shuffle(tpl.ok, rnd);
    trues = [0, 1, 2].map((i) => {
      const s = order[i % order.length];
      return { key: `t${i}`, sign: s, ok: true, stage, text: signAlone(s), say: tpl.hear };
    });
    const pool: SignId[] = [...tpl.imps];
    if (tpl.heavy) while (pool.filter((s) => s === tpl.heavy).length * 2 < pool.length) pool.push(tpl.heavy);
    imps = pool.map((s, i) => ({ key: `i${i}`, sign: s, ok: false, stage, text: signAlone(s), say: speak(s) }));
  } else if (stage === 2) {
    const letters = shuffle(NQ_LETTERS, rnd);
    const mine = letters.slice(0, 3);
    trues = mine.map((l, i) => {
      const s = pick(tpl.ok, rnd);
      return { key: `t${i}`, sign: s, ok: true, stage, ...syllable(l, s) };
    });
    const signs = impSigns(tpl, 6, rnd);
    const theirs = [...mine, ...letters.slice(3, 6)];
    imps = theirs.map((l, i) => ({ key: `i${i}`, sign: signs[i], ok: false, stage, ...syllable(l, signs[i]) }));
  } else {
    const ok = new Set(tpl.okWords);
    const usedPics = new Set<string>();
    const take = (list: NqWord[], n: number, tag: string, isOk: boolean): NqItem[] => {
      const got: NqItem[] = [];
      for (const x of shuffle(list, rnd)) {
        if (got.length >= n) break;
        if (usedPics.has(x.p)) continue;
        usedPics.add(x.p);
        got.push({ key: `${tag}${got.length}`, sign: x.g, ok: isOk, stage, text: x.w, say: x.w, p: x.p });
      }
      return got;
    };
    trues = take(words.filter((x) => ok.has(x.g)), 3, "t", true);
    const impWords = words.filter((x) => tpl.imps.includes(x.g));
    if (tpl.heavy) {
      imps = [...take(impWords.filter((x) => x.g === tpl.heavy), 3, "h", false), ...take(impWords.filter((x) => x.g !== tpl.heavy), 3, "i", false)];
    } else {
      imps = take(impWords, 6, "i", false);
    }
  }
  return { tpl, trues, imps };
}
