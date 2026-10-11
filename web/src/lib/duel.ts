/**
 * Word Duel (Gadi 2026-10-11): two players answer the same questions at the
 * same time, a parent against a kid, two kids, or two players matched online.
 *
 * This file is shared by the server (/api/duel) and the client, so it holds
 * no Firebase code. The timeline is DERIVED, never stored: from the start
 * time and the time each answer arrived, `timeline()` says which round is
 * running, when it ends and when the next one starts. The server and both
 * screens therefore always agree, and a round ends early once both players
 * have answered.
 *
 * Safety by design: players matched online never see a name, only a playful
 * nickname and an illustrated avatar; there is no chat and no free text, and
 * the questions of an online match come from our own curated word sets.
 */

import { DICTATION_SETS } from "@/lib/dictation-sets";

export const DUEL_ROUNDS = 8;
export const ROUND_MS = 15_000;
export const REVEAL_MS = 2_500;
export const COUNTDOWN_MS = 3_500;
/** A room nobody joined, or a finished one, is gone after this. */
export const DUEL_TTL_MS = 60 * 60_000;

export type DuelQuestion = { prompt: string; options: string[]; correctIdx: number };
export type DuelMode = "invite" | "online" | "ghost";
export type Seat = "a" | "b";
export type DuelAnswer = { choice: number; at: number } | null;
/** A recorded or computer opponent: its answer for each round and how long it took. */
export type ScriptStep = { choice: number; ms: number };

export type DuelPlayerPublic = {
  name: string;
  avatar: string | null; // illustrated avatar id (see lib/family AVATARS), never a photo
  kind: "person" | "ghost" | "bot";
};

/** Points for one answer: 100 for a right answer plus up to 50 for speed. */
export function roundPoints(correct: boolean, ms: number): number {
  if (!correct) return 0;
  const left = Math.max(0, Math.min(1, 1 - ms / ROUND_MS));
  return 100 + Math.round(50 * left);
}

export type Phase =
  | { kind: "waiting" }
  | { kind: "countdown"; until: number }
  | { kind: "round"; round: number; startedAt: number; endsAt: number }
  | { kind: "reveal"; round: number; startedAt: number; nextAt: number }
  | { kind: "done" };

/** A computer or recorded opponent never keeps a person waiting (Gadi
 *  2026-10-11: the bot felt slow): once the person answered, its answer
 *  arrives within this much. Its points still come from its own time. */
export const SCRIPT_CATCHUP_MS = 700;

/** When a scripted seat's answer shows (null = not yet decided). */
export function scriptedAt(
  seat: Seat,
  r: number,
  start: number,
  answers: Record<Seat, DuelAnswer[]>,
  scripts: Partial<Record<Seat, ScriptStep[]>>,
): number | null {
  const sc = scripts[seat]?.[r];
  if (!sc) return null;
  const other: Seat = seat === "a" ? "b" : "a";
  const oa = scripts[other] ? null : answers[other]?.[r]?.at ?? null;
  const own = sc.ms < ROUND_MS ? start + sc.ms : null;
  if (oa == null) return own;
  return own == null ? oa + SCRIPT_CATCHUP_MS : Math.min(own, oa + SCRIPT_CATCHUP_MS);
}

/** When each seat answered round r, as absolute ms (null = not yet / never). */
function answeredAt(
  r: number,
  start: number,
  answers: Record<Seat, DuelAnswer[]>,
  scripts: Partial<Record<Seat, ScriptStep[]>>,
): Record<Seat, number | null> {
  const out: Record<Seat, number | null> = { a: null, b: null };
  for (const s of ["a", "b"] as Seat[]) {
    if (scripts[s]?.[r]) out[s] = scriptedAt(s, r, start, answers, scripts);
    else out[s] = answers[s]?.[r]?.at ?? null;
  }
  return out;
}

/**
 * Where the game stands at `now`, plus the start time of every round played
 * so far (needed to score answers by speed).
 */
export function timeline(
  startAt: number | null,
  total: number,
  answers: Record<Seat, DuelAnswer[]>,
  scripts: Partial<Record<Seat, ScriptStep[]>>,
  now: number,
): { phase: Phase; starts: number[] } {
  const starts: number[] = [];
  if (!startAt) return { phase: { kind: "waiting" }, starts };
  if (now < startAt) return { phase: { kind: "countdown", until: startAt }, starts };
  let start = startAt;
  for (let r = 0; r < total; r++) {
    starts.push(start);
    const at = answeredAt(r, start, answers, scripts);
    const hardEnd = start + ROUND_MS;
    // Ends early once both have answered (answers after the hard end don't count).
    const both = at.a != null && at.b != null && at.a <= hardEnd && at.b <= hardEnd ? Math.max(at.a, at.b) : null;
    // A round that ended early still waits until the last answer arrived at
    // the server; a future answer time (a computer opponent's) is not yet.
    const endsAt = both != null && both <= now ? both : hardEnd;
    if (now < endsAt) return { phase: { kind: "round", round: r, startedAt: start, endsAt }, starts };
    const nextAt = endsAt + REVEAL_MS;
    if (now < nextAt) return { phase: { kind: "reveal", round: r, startedAt: start, nextAt }, starts };
    start = nextAt;
  }
  return { phase: { kind: "done" }, starts };
}

/** The choice and points of one seat in a finished (or running) round. */
export function seatResult(
  seat: Seat,
  r: number,
  q: DuelQuestion,
  start: number,
  answers: Record<Seat, DuelAnswer[]>,
  scripts: Partial<Record<Seat, ScriptStep[]>>,
  now: number,
): { choice: number | null; points: number } {
  const sc = scripts[seat]?.[r];
  if (sc) {
    const at = scriptedAt(seat, r, start, answers, scripts);
    if (sc.ms >= ROUND_MS || sc.choice < 0 || at == null || at > now) return { choice: null, points: 0 };
    return { choice: sc.choice, points: roundPoints(sc.choice === q.correctIdx, sc.ms) };
  }
  const a = answers[seat]?.[r];
  if (!a || a.at > start + ROUND_MS) return { choice: null, points: 0 };
  return { choice: a.choice, points: roundPoints(a.choice === q.correctIdx, a.at - start) };
}

/** The view one player's screen gets from GET /api/duel. */
export type DuelView = {
  code: string;
  mode: DuelMode;
  you: Seat;
  players: { a: DuelPlayerPublic; b: DuelPlayerPublic | null };
  scores: Record<Seat, number>;
  total: number;
  phase: Phase;
  serverNow: number;
  /** The running or revealed question (the next ones are never sent). */
  question: (Omit<DuelQuestion, "correctIdx"> & { correctIdx?: number }) | null;
  /** In a round: who already answered (not what). */
  answered: Record<Seat, boolean>;
  /** In the reveal: what each chose and earned. */
  reveal?: { correctIdx: number; a: { choice: number | null; points: number }; b: { choice: number | null; points: number } };
  /** At the end: every round, for the recap. */
  recap?: Array<{ prompt: string; answer: string; a: number | null; b: number | null; correctIdx: number; aText?: string | null; bText?: string | null; aPoints?: number; bPoints?: number }>;
  /** "Play again" with the same opponent: the new room, and whether I asked. */
  rematch?: { code: string; mine: boolean };
  /** This room is a rematch (waiting means: for the other player to say yes). */
  rematchOf?: boolean;
};

/** One row of the wins table. */
export type DuelStatRow = { name: string; avatar: string | null; wins: number; losses: number; ties: number; games: number; isMe: boolean };
/** My record against one opponent. */
export type DuelVsRow = { name: string; avatar: string | null; kind: "person" | "ghost" | "bot"; w: number; l: number; t: number; at: number };

/** Six-digit room code, easy to read out loud. */
export function newDuelCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Check questions a host sends (an invite duel on the host's own words). */
export function cleanQuestions(raw: unknown): DuelQuestion[] | null {
  if (!Array.isArray(raw)) return null;
  const out: DuelQuestion[] = [];
  for (const q of raw.slice(0, 12)) {
    const prompt = typeof q?.prompt === "string" ? q.prompt.trim().slice(0, 300) : "";
    const opts = Array.isArray(q?.options) ? q.options.filter((o: unknown) => typeof o === "string").map((o: string) => o.trim().slice(0, 300)) : [];
    const ci = Number(q?.correctIdx);
    if (!prompt || opts.length < 2 || opts.length > 4 || !Number.isInteger(ci) || ci < 0 || ci >= opts.length) continue;
    if (opts.some((o: string) => !o)) continue;
    out.push({ prompt, options: opts, correctIdx: ci });
  }
  return out.length >= 3 ? out : null;
}

/** A computer opponent: right about 70% of the time, 3 to 9 seconds a round. */
export function botScript(questions: DuelQuestion[]): ScriptStep[] {
  return questions.map((q) => {
    const right = Math.random() < 0.7;
    const wrong = q.options.map((_, i) => i).filter((i) => i !== q.correctIdx);
    const choice = right || !wrong.length ? q.correctIdx : wrong[Math.floor(Math.random() * wrong.length)];
    return { choice, ms: 3000 + Math.floor(Math.random() * 6000) };
  });
}

const NICK_ANIMALS = [
  ["ינשוף", "Owl"], ["שועל", "Fox"], ["דולפין", "Dolphin"], ["פנדה", "Panda"], ["נמר", "Tiger"],
  ["צב", "Turtle"], ["פינגווין", "Penguin"], ["קואלה", "Koala"], ["זאב", "Wolf"], ["ג'ירפה", "Giraffe"],
];
const NICK_COLORS = [
  ["כחול", "Blue"], ["סגול", "Purple"], ["ירוק", "Green"], ["כתום", "Orange"], ["זהוב", "Golden"],
  ["כסוף", "Silver"], ["אדום", "Red"], ["טורקיז", "Teal"],
];

/** A playful nickname for an opponent matched online, stable per player. */
export function nicknameFor(seed: string, lang: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const an = NICK_ANIMALS[h % NICK_ANIMALS.length];
  const co = NICK_COLORS[Math.floor(h / NICK_ANIMALS.length) % NICK_COLORS.length];
  return lang === "he" ? `${an[0]} ${co[0]}` : `${co[1]} ${an[1]}`;
}

// ─── Questions from our curated word sets (online matches) ──────────

export function shuffleDuel<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

/** English ↔ Hebrew word questions from the built-in topics (kid-safe). */
export function topicQuestions(topicId?: string): DuelQuestion[] {
  const sets = topicId ? DICTATION_SETS.filter((s) => s.id === topicId) : DICTATION_SETS;
  const pairs = shuffleDuel(sets.flatMap((s) => s.words.map((w) => ({ ...w, set: s.id }))));
  const all = DICTATION_SETS.flatMap((s) => s.words.map((w) => ({ ...w, set: s.id })));
  const out: DuelQuestion[] = [];
  const used = new Set<string>();
  for (const p of pairs) {
    if (out.length >= DUEL_ROUNDS) break;
    if (used.has(p.en)) continue;
    used.add(p.en);
    const toHe = Math.random() < 0.5;
    // Distractors from the same topic first, so the answer isn't obvious.
    const near = shuffleDuel(all.filter((o) => o.en !== p.en && o.set === p.set));
    const far = shuffleDuel(all.filter((o) => o.en !== p.en && o.set !== p.set));
    const pick = toHe ? (o: typeof p) => o.he : (o: typeof p) => o.en;
    const opts: string[] = [];
    for (const o of [...near, ...far]) {
      const v = pick(o);
      if (v !== pick(p) && !opts.includes(v)) opts.push(v);
      if (opts.length >= 3) break;
    }
    const options = shuffleDuel([pick(p), ...opts]);
    out.push({ prompt: toHe ? p.en : p.he, options, correctIdx: options.indexOf(pick(p)) });
  }
  return out;
}

