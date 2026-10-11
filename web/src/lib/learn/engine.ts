/**
 * Learning mode engine (Gadi 2026-10-11, council verdict the same day):
 * a kid learning English, or Hebrew as a second language, while the app
 * stays in their own language. No level is ever shown. Every word has a
 * mastery box (spaced repetition), and one hidden difficulty pointer per
 * language decides which new words come next: up slowly after right
 * answers, down fast after mistakes, faster in the first session so the
 * games find the kid's edge within minutes. A school word list with a
 * test date overrides the bank until the test.
 *
 * Pure: no Firebase, shared by /api/learn and the client.
 */
import { ENGLISH_BANK, ENGLISH_TOPICS } from "./english-bank";
import { HEBREW_BANK, HEBREW_TOPICS } from "./hebrew-bank";

export type LearnLang = "en" | "he";
export type Reads = "no" | "little" | "yes";

/** One word to practise, ready for the games: the target word, its
 *  translation into the kid's own language, and (Hebrew) its niqqud. */
export type LearnItem = { w: string; t: string; nq?: string; d: number; topic: string; src: "bank" | "list" };

/** Mastery of one word. box 0 = new or just missed, 3+ = learned. */
export type WordState = { box: number; right: number; wrong: number; due: number; lastAt: number; learnedAt?: number; d?: number };

const DAY = 86_400_000;
/** Days until a word comes back, by box. */
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];
export const LEARNED_BOX = 3;

/** Which languages a kid can learn, by the language of the app. */
export function learnTargets(uiLang: string): LearnLang[] {
  if (uiLang === "he") return ["en"];
  if (uiLang === "ar" || uiLang === "ru") return ["en", "he"];
  if (uiLang === "en") return ["he"];
  return [];
}

/** The bank for a target language, translated into the kid's language. */
export function bankFor(lang: LearnLang, uiLang: string): LearnItem[] {
  if (lang === "en") {
    const k = uiLang === "ar" ? "ar" : uiLang === "ru" ? "ru" : "he";
    return ENGLISH_BANK.map((x) => ({ w: x.w, t: x[k], d: x.d, topic: x.topic, src: "bank" as const }));
  }
  const k = uiLang === "ar" ? "ar" : uiLang === "ru" ? "ru" : "en";
  return HEBREW_BANK.map((x) => ({ w: x.w, nq: x.nq, t: x[k], d: x.d, topic: x.topic, src: "bank" as const }));
}

export function topicsFor(lang: LearnLang) {
  return lang === "en" ? ENGLISH_TOPICS : HEBREW_TOPICS;
}

export const wordKey = (lang: LearnLang, w: string) => `${lang}_${w.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "_").slice(0, 60)}`;

/** One answer: the word's box and the hidden pointer move. */
export function applyAnswer(prev: WordState | undefined, ok: boolean, now: number, d?: number): WordState {
  const s: WordState = prev ? { ...prev } : { box: 0, right: 0, wrong: 0, due: now, lastAt: 0 };
  // Several answers on the same word within a minute (memory, a repeat
  // card) count once for the box, so a box can't jump on one sitting.
  const sameSitting = now - s.lastAt < 60_000;
  if (ok) {
    s.right += 1;
    if (!sameSitting || s.box === 0) s.box = Math.min(5, s.box + 1);
  } else {
    s.wrong += 1;
    s.box = 0;
  }
  s.due = now + INTERVAL_DAYS[s.box] * DAY;
  s.lastAt = now;
  if (s.box >= LEARNED_BOX && !s.learnedAt) s.learnedAt = now;
  if (d != null) s.d = d;
  return s;
}

/** The hidden difficulty pointer: up slowly, down fast; faster at first. */
export function movePointer(d: number, ok: boolean, answered: number, streak: number): number {
  const warm = answered < 16;
  const next = ok ? d + (warm && streak >= 2 ? 0.5 : 0.12) : d - (warm ? 0.6 : 0.35);
  return Math.max(1, Math.min(5, Math.round(next * 100) / 100));
}

/** The words for the next games: due words to reinforce first, then new
 *  words at the pointer, then a few learned words for review. A school
 *  list (until its test) takes most of the session. */
export function pickSession(
  items: LearnItem[],
  states: Record<string, WordState>,
  lang: LearnLang,
  d: number,
  now: number,
  size = 16,
  list?: LearnItem[],
): LearnItem[] {
  const key = (x: LearnItem) => wordKey(lang, x.w);
  const out: LearnItem[] = [];
  const used = new Set<string>();
  const take = (xs: LearnItem[], n: number) => {
    for (const x of xs) {
      if (out.length >= size || n <= 0) break;
      const k = key(x);
      if (used.has(k)) continue;
      used.add(k); out.push(x); n--;
    }
  };
  const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const st = (x: LearnItem) => states[key(x)];
  if (list?.length) {
    // The school's words: not yet learned first, then the rest.
    take(shuffle(list.filter((x) => (st(x)?.box ?? 0) < LEARNED_BOX)), Math.ceil(size * 0.8));
    take(shuffle(list), size);
  }
  const due = items.filter((x) => { const s = st(x); return s && s.box < 5 && s.due <= now; })
    .sort((a, b) => (st(a)!.box - st(b)!.box) || (st(a)!.due - st(b)!.due));
  take(due, Math.ceil(size * 0.5));
  const lo = Math.floor(d), hi = Math.ceil(d + 0.5);
  const fresh = shuffle(items.filter((x) => !st(x) && x.d >= lo && x.d <= hi));
  take(fresh, size);
  // Not enough new words at the pointer: the nearest ones, easier first.
  if (out.length < size) take(shuffle(items.filter((x) => !st(x))).sort((a, b) => Math.abs(a.d - d) - Math.abs(b.d - d)), size);
  if (out.length < size) take(shuffle(items.filter((x) => (st(x)?.box ?? 0) >= LEARNED_BOX)), size);
  return shuffle(out);
}

export function isLearnLang(x: unknown): x is LearnLang {
  return x === "en" || x === "he";
}
