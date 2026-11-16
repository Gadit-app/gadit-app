/**
 * The level of the words a profile meets beyond its own lookups (Gadi
 * 2026-11-16: "according to what he knows, and not only the notebook").
 *
 * A level is a school grade of the curriculum we hold in the screen's
 * language (lib/journey/level-words.ts: Hebrew grades 1 to 12, English CAPS
 * grades 4 to 9). It starts at the profile's grade when a parent set one (or
 * an age), else at grade 5 (a grown-up, a school's shared account, a child
 * with no grade), and moves by the FIRST answer to each word of the level,
 * the moment the profile meets it: of the last 8, seven or eight right means
 * the words are already known (a grade up), three or fewer means they are too
 * hard (a grade down). The count starts again after every move. A parent who
 * sets a different grade starts the ladder again from it.
 *
 * Stored per screen language in users/{uid}/journey/state as
 * levels.<ui> = { g, from, log }. Pure functions, no storage.
 */

export type Level = { g: number; from: number | null; log: boolean[] };

export const LEVEL_START = 5;
export const LEVEL_WINDOW = 8;
export const LEVEL_UP_AT = 7;
export const LEVEL_DOWN_AT = 3;

/** The grades a ladder moves between, by screen language. */
const RANGE: Record<string, [number, number]> = { he: [1, 12], en: [4, 9] };
/** A child younger than this grade gets no words of the level in this language (no fitting words). */
const YOUNGEST: Record<string, number> = { he: 1, en: 3 };

const clamp = (g: number, r: [number, number]) => Math.min(r[1], Math.max(r[0], g));

/** A stored level, or null when it does not read as one. */
export function cleanLevel(v: unknown): Level | null {
  if (!v || typeof v !== "object") return null;
  const o = v as { g?: unknown; from?: unknown; log?: unknown };
  if (typeof o.g !== "number" || !Number.isFinite(o.g)) return null;
  const from = typeof o.from === "number" && Number.isFinite(o.from) ? Math.floor(o.from) : null;
  const log = Array.isArray(o.log) ? o.log.filter((x): x is boolean => typeof x === "boolean").slice(-LEVEL_WINDOW) : [];
  return { g: Math.floor(o.g), from, log };
}

/**
 * The level to use now: the stored one, or a fresh start when there is none
 * or the grade it started from changed. null: no words of the level for this
 * screen language (no curriculum held for it, or a child too young for it).
 */
export function currentLevel(ui: string, stored: unknown, grade: number | null): Level | null {
  const r = RANGE[ui];
  if (!r) return null;
  if (grade !== null && grade < YOUNGEST[ui]) return null;
  const s = cleanLevel(stored);
  if (s && s.from === grade) return { ...s, g: clamp(s.g, r) };
  return { g: clamp(grade ?? LEVEL_START, r), from: grade, log: [] };
}

/** The level after the first answer to one of its words. */
export function afterFirstAnswer(ui: string, lv: Level, correct: boolean): Level {
  const r = RANGE[ui];
  if (!r) return lv;
  const log = [...lv.log, correct].slice(-LEVEL_WINDOW);
  if (log.length < LEVEL_WINDOW) return { ...lv, log };
  const right = log.filter(Boolean).length;
  if (right >= LEVEL_UP_AT && lv.g < r[1]) return { ...lv, g: lv.g + 1, log: [] };
  if (right <= LEVEL_DOWN_AT && lv.g > r[0]) return { ...lv, g: lv.g - 1, log: [] };
  return { ...lv, log };
}
