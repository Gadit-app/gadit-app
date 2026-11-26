/**
 * The niqqud door of מילים פולשות: what a child has passed, and the Wordies
 * (Gadi 2026-11-25, part 2 of the design). Pure and with no imports, so the
 * route and web/scripts/check-niqqud.mjs share it; station and sign ids are
 * plain strings here.
 *
 *  - A round is 5 calls; 4 clean calls pass the stage (clean = every true
 *    item caught and no impostor caught).
 *  - The stages of a station open in order, and a station opens once the one
 *    before it has passed all 3 stages. The admin and testers may jump.
 *  - Wordies: 2 the first time a stage passes, 3 more when a station is
 *    done, 1 for a fully clean round (5 of 5) up to 5 a day; replays pay 0.
 *  - A round is counted once: its id is remembered, so a resend (a save that
 *    failed, a double tap, a second tab) changes nothing.
 */

export type NqState = {
  /** Per station, how many stages passed (0 to 3). */
  st: Record<string, number>;
  /** Per station, the day it was done. */
  done: Record<string, string>;
  /** Per sign, times caught right, and the signs caught instead of it. */
  signs: Record<string, { ok: number; mix: Record<string, number> }>;
  /** The clean rounds paid today. */
  clean: { day: string; n: number };
  /** The last rounds counted. */
  rids: string[];
};
/** One call: clean or not, the signs of the true items caught, and [the call's sign, the impostor sign caught]. */
export type NqCall = { clean: boolean; ok: string[]; mix: [string, string][] };
export type NqRound = { rid: string; station: string; stage: 1 | 2 | 3; calls: NqCall[] };

export const NQ = { calls: 5, pass: 4, cleanPerDay: 5, wordies: { stage: 2, station: 3, clean: 1 } } as const;
const KEEP_RIDS = 20;
const MAX_COUNT = 99999;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const emptyNq = (): NqState => ({ st: {}, done: {}, signs: {}, clean: { day: "", n: 0 }, rids: [] });

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const count = (v: unknown): number => (typeof v === "number" && v > 0 ? Math.min(MAX_COUNT, Math.floor(v)) : 0);

/** A saved state made safe: unknown stations and signs dropped, numbers clamped. */
export function cleanNq(raw: unknown, stationIds: string[], signIds: string[]): NqState {
  const o = obj(raw);
  const out = emptyNq();
  for (const [k, v] of Object.entries(obj(o.st))) if (stationIds.includes(k)) { const n = Math.min(3, count(v)); if (n) out.st[k] = n; }
  for (const [k, v] of Object.entries(obj(o.done))) if (stationIds.includes(k) && typeof v === "string" && DAY.test(v)) out.done[k] = v;
  for (const [k, v] of Object.entries(obj(o.signs))) {
    if (!signIds.includes(k)) continue;
    const x = obj(v);
    const mix: Record<string, number> = {};
    for (const [m, n] of Object.entries(obj(x.mix))) if (signIds.includes(m) && count(n)) mix[m] = count(n);
    out.signs[k] = { ok: count(x.ok), mix };
  }
  const c = obj(o.clean);
  if (typeof c.day === "string" && DAY.test(c.day)) out.clean = { day: c.day, n: Math.min(NQ.cleanPerDay, count(c.n)) };
  if (Array.isArray(o.rids)) out.rids = o.rids.filter((x): x is string => typeof x === "string").slice(-KEEP_RIDS);
  return out;
}

/** May this stage of this station be played (by a child who cannot jump)? */
export function unlocked(s: NqState, order: string[], station: string, stage: number): boolean {
  const i = order.indexOf(station);
  if (i < 0 || stage < 1 || stage > 3) return false;
  if (i > 0 && (s.st[order[i - 1]] ?? 0) < 3) return false;
  return stage <= (s.st[station] ?? 0) + 1;
}

const copy = (s: NqState): NqState => ({
  st: { ...s.st },
  done: { ...s.done },
  signs: Object.fromEntries(Object.entries(s.signs).map(([k, v]) => [k, { ok: v.ok, mix: { ...v.mix } }])),
  clean: { ...s.clean },
  rids: [...s.rids],
});

export function applyNqRound(prev: NqState, r: NqRound, order: string[], today: string, canJump: boolean) {
  const none = { state: prev, counted: false, passed: false, firstPass: false, stationDone: false, wordies: 0 };
  if (prev.rids.includes(r.rid)) return none;
  if (r.calls.length !== NQ.calls) return none;
  if (!order.includes(r.station)) return none;
  if (!canJump && !unlocked(prev, order, r.station, r.stage)) return none;

  const s = copy(prev);
  s.rids = [...s.rids, r.rid].slice(-KEEP_RIDS);
  for (const c of r.calls) {
    for (const sign of c.ok) {
      const x = (s.signs[sign] ??= { ok: 0, mix: {} });
      x.ok = Math.min(MAX_COUNT, x.ok + 1);
    }
    for (const [want, got] of c.mix) {
      const x = (s.signs[want] ??= { ok: 0, mix: {} });
      x.mix[got] = Math.min(MAX_COUNT, (x.mix[got] ?? 0) + 1);
    }
  }
  const cleanCalls = r.calls.filter((c) => c.clean).length;
  const passed = cleanCalls >= NQ.pass;
  let wordies = 0;
  let firstPass = false;
  let stationDone = false;
  if (passed && r.stage > (s.st[r.station] ?? 0)) {
    s.st[r.station] = r.stage;
    firstPass = true;
    wordies += NQ.wordies.stage;
    if (r.stage === 3 && !s.done[r.station]) {
      s.done[r.station] = today;
      stationDone = true;
      wordies += NQ.wordies.station;
    }
  }
  if (cleanCalls === NQ.calls) {
    // only a later day opens the count again: the day comes from the device's time zone,
    // and a device that jumps back and forth between zones must not reset it
    if (today > s.clean.day) s.clean = { day: today, n: 0 };
    if (s.clean.n < NQ.cleanPerDay) { s.clean.n += 1; wordies += NQ.wordies.clean; }
  }
  return { state: s, counted: true, passed, firstPass, stationDone, wordies };
}
