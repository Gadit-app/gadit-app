/**
 * The Invading Words: what a child knows, per meaning (Gadi 2026-11-24, the
 * council's rules). Pure, so the route and a check script share it.
 *
 *  - met:   caught once. One catch is never "known".
 *  - known: caught on 2 different days, with 2 different clues (picture 1,
 *           picture 2, the written gloss), and no impostor caught for that
 *           word since: an impostor catch starts the not-yet-known meanings
 *           of the word again.
 *  - Wordies only for learning: a meaning met for the first time (1), a
 *    meaning that becomes known (2), a missed meaning caught later (1), and
 *    the first time all the meanings of a word are caught in one round (2).
 *    Playing a word again gives score, not Wordies.
 */

export type Clue = "p1" | "p2" | "g";
export const CLUES: Clue[] = ["p1", "p2", "g"];
export type SenseEvent = { id: string; r: "caught" | "missed"; c: Clue };

/** One meaning of one word, for one child. */
export type SenseState = {
  /** The day it was first caught. */
  m: string | null;
  /** The days it was caught on (since the last impostor catch), the last few. */
  d: string[];
  /** The clues it was caught with (since the last impostor catch). */
  c: Clue[];
  /** The day it became known. */
  k: string | null;
  /** Times it fell past uncaught; a later catch pays once and clears it. */
  x: number;
};

export type WordState = { s: Record<string, SenseState>; cleared: string | null; mistakes: number };

export const emptySense = (): SenseState => ({ m: null, d: [], c: [], k: null, x: 0 });

const DAY = /^\d{4}-\d{2}-\d{2}$/;
export function cleanSense(v: unknown): SenseState {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const day = (x: unknown) => (typeof x === "string" && DAY.test(x) ? x : null);
  return {
    m: day(o.m),
    d: Array.isArray(o.d) ? o.d.map(day).filter((x): x is string => !!x).slice(-5) : [],
    c: Array.isArray(o.c) ? o.c.filter((x): x is Clue => (CLUES as unknown[]).includes(x)) : [],
    k: day(o.k),
    x: typeof o.x === "number" && o.x > 0 ? Math.min(99, Math.floor(o.x)) : 0,
  };
}

export const WORDIES = { met: 1, known: 2, missedCaught: 1, cleared: 2 } as const;

/**
 * One round of one word: `events` (each true meaning caught or missed, with
 * the clue it fell as), `mistakes` (impostors caught), `ids` (the meanings in
 * play this round). Returns the new state and what was earned.
 */
export function applyRound(prev: WordState, ids: string[], events: SenseEvent[], mistakes: number, today: string) {
  const s: Record<string, SenseState> = {};
  for (const [k, v] of Object.entries(prev.s)) s[k] = cleanSense(v);
  let wordies = 0;
  const met: string[] = [];
  const known: string[] = [];
  // An impostor caught: the meanings not known yet start again.
  if (mistakes > 0) for (const st of Object.values(s)) if (!st.k) { st.d = []; st.c = []; }
  const caught = new Set<string>();
  for (const e of events) {
    if (!ids.includes(e.id)) continue;
    const st = s[e.id] ?? (s[e.id] = emptySense());
    if (e.r === "missed") { st.x += 1; continue; }
    if (caught.has(e.id)) continue;
    caught.add(e.id);
    if (!st.m) { st.m = today; wordies += WORDIES.met; met.push(e.id); }
    if (st.x > 0) { wordies += WORDIES.missedCaught; st.x = 0; }
    if (mistakes > 0) continue; // a round with an impostor caught never counts toward known
    if (!st.d.includes(today)) st.d = [...st.d, today].slice(-5);
    if (!st.c.includes(e.c)) st.c = [...st.c, e.c];
    if (!st.k && st.d.length >= 2 && st.c.length >= 2) { st.k = today; wordies += WORDIES.known; known.push(e.id); }
  }
  let cleared = prev.cleared;
  if (!cleared && ids.length > 0 && ids.every((id) => caught.has(id))) { cleared = today; wordies += WORDIES.cleared; }
  return { state: { s, cleared, mistakes: prev.mistakes + mistakes } as WordState, wordies, met, known };
}
