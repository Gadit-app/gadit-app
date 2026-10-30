/**
 * Kids gamification for the Family plan (Gadi 2026-08-12).
 *
 * Three loops, all computed from data that already exists — the child's
 * notebook (one doc per distinct word, each with an `addedAt` ISO date):
 *   1. Daily streak  — consecutive days the child discovered a new word,
 *      FORGIVING: a single missed day never breaks it (two in a row does),
 *      and the streak stays "alive" if the last activity was today or
 *      yesterday. Child-safe: no punishment/anxiety for one skipped day.
 *   2. Weekly goal   — distinct new words in the last 7 days vs a target.
 *   3. Explorer rank — points (new words + completed practice) map to a
 *      named rank that never goes down (see computeGamification).
 *
 * This module is PURE (no i18n, no I/O) so both the client notebook page
 * and the server family-progress endpoint can share it. Each surface maps
 * the returned rank key to a localized label with its own copy.
 */

// Weekly goal bounds. The goal is ADAPTIVE (see computeGoal): it meets each
// child at their own recent pace rather than a one-size-fits-all number, so a
// 6-year-old and a 13-year-old both get "achievable but slightly stretchy"
// with no parent/kid config (LLM council 2026-08-19). Floor kills a
// meaningless "1", ceiling kills a crushing "40".
export const WEEKLY_GOAL_FLOOR = 5;
export const WEEKLY_GOAL_CEIL = 15;

export type RankKey =
  | "scout" | "explorer" | "tracker" | "ranger" | "guide" | "master"
  // Long-tail tiers past "Word Master" so the game sustains for months, not
  // weeks (Gadi 2026-08: the old ladder ended at 300 and ran out too fast).
  | "champion" | "sage" | "virtuoso" | "legend" | "wizard" | "grandmaster";

/** Thresholds for each rank, in distinct WORDS (Gadi 2026-10-30: one number
 *  next to the rank, the same one the family leaderboard counts). Completed
 *  practice no longer moves the rank; it unlocks avatar looks instead (see
 *  lib/looks.ts). A rank once reached is never lost (users/{uid}.rankFloor,
 *  see lib/rank-points.ts). */
export const RANKS: { key: RankKey; min: number }[] = [
  { key: "scout", min: 0 },
  { key: "explorer", min: 10 },
  { key: "tracker", min: 25 },
  { key: "ranger", min: 50 },
  { key: "guide", min: 90 },
  { key: "master", min: 140 },
  { key: "champion", min: 200 },
  { key: "sage", min: 280 },
  { key: "virtuoso", min: 380 },
  { key: "legend", min: 500 },
  { key: "wizard", min: 650 },
  { key: "grandmaster", min: 850 },
];

/**
 * Since 2026-10-30 (Gadi) the rank counts distinct notebook words only.
 * COMPLETED PRACTICE (a finished dictation, "say it", listen-and-pick, lesson,
 * game, reading check, word-page quiz or word game, reported through
 * /api/family/notify-activity) unlocks avatar looks (lib/looks.ts), at most
 * PRACTICE_DAILY_CAP practices per local day so nobody can farm it. Yooniz
 * "gift points" live in a SEPARATE, capped wallet (GIFT_WEEKLY_CAP) and never
 * count toward ranks.
 */
export const POINTS = { seen: 1, practice: 10 } as const;
/** Completed practices that count per user per local day. */
export const PRACTICE_DAILY_CAP = 10;

/** Practices that count, from users/{uid}.practiceCount ({ "YYYY-MM-DD": n }),
 *  each day capped at PRACTICE_DAILY_CAP. */
export function countedPractices(counts: unknown): number {
  if (!counts || typeof counts !== "object") return 0;
  let n = 0;
  for (const [day, v] of Object.entries(counts as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || typeof v !== "number" || !Number.isFinite(v)) continue;
    n += Math.max(0, Math.min(PRACTICE_DAILY_CAP, Math.floor(v)));
  }
  return n;
}

/** The rank metric: distinct words only since 2026-10-30. `practices` is
 *  kept in the signature for callers, and now drives avatar looks instead. */
export function rankPoints(words: number, _practices = 0): number {
  void _practices;
  return Math.max(0, words);
}

export function isRankKey(v: unknown): v is RankKey {
  return typeof v === "string" && RANKS.some((r) => r.key === v);
}

/** Index of a rank key in RANKS, -1 for anything else. */
export function rankIndexOf(key: unknown): number {
  return RANKS.findIndex((r) => r.key === key);
}

/** Weekly ceiling on Yooniz gift points (/api/yooniz/gift), so bonuses stay a
 *  treat and can't launder raw-count into the earned economy. */
export const GIFT_WEEKLY_CAP = 50;

export type RankInfo = {
  key: RankKey;
  index: number;        // 0..RANKS.length-1
  min: number;          // threshold of the current rank
  next: number | null;  // threshold of the next rank, or null at the top
  /** 0..1 progress from this rank's min to the next rank's min. 1 at the top. */
  progress: number;
};

/** The rank for a points total. `floor` is the highest rank ever reached
 *  (users/{uid}.rankFloor): the rank shown is never below it, so nobody goes
 *  down when the thresholds or the points model change. */
export function rankFor(points: number, floor?: RankKey | null): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].min) idx = i;
  }
  const floorIdx = rankIndexOf(floor);
  if (floorIdx > idx) idx = floorIdx;
  const cur = RANKS[idx];
  const nextThreshold = idx < RANKS.length - 1 ? RANKS[idx + 1].min : null;
  const progress =
    nextThreshold === null
      ? 1
      : Math.max(0, Math.min(1, (points - cur.min) / (nextThreshold - cur.min)));
  return { key: cur.key, index: idx, min: cur.min, next: nextThreshold, progress };
}

/** Local 'YYYY-MM-DD' for an ISO/date string, in the runtime's timezone. */
export function toLocalDateStr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Forgiving current streak (in days) from a set of active local-date strings.
 * `todayStr` is the child's local "today". Alive if the most recent activity
 * was today or yesterday; a single missed day inside the run is bridged, two
 * consecutive missed days end it. Returns 0 when the streak has lapsed.
 */
export function computeStreak(activeDates: Iterable<string>, todayStr: string): number {
  const set = new Set<string>();
  for (const d of activeDates) if (d) set.add(d);
  if (set.size === 0) return 0;

  const yesterday = dayBefore(todayStr);
  // Lapsed: neither today nor yesterday active → the one allowed miss (today)
  // plus a missed yesterday means it's broken.
  if (!set.has(todayStr) && !set.has(yesterday)) return 0;

  let count = 0;
  let cursor = todayStr;
  let consecutiveMisses = 0;
  // Walk back day by day. Stop after two misses in a row.
  // Guard the loop with a generous cap (10 years) so a bad date can't spin it.
  for (let i = 0; i < 3700; i++) {
    if (set.has(cursor)) {
      count++;
      consecutiveMisses = 0;
    } else {
      // Don't count today-not-yet-active as a "miss" that breaks things:
      // if it's the very first step and today isn't active, we've already
      // confirmed yesterday is (alive check above), so treat today as a
      // free grace step rather than a strike.
      if (!(i === 0 && cursor === todayStr)) {
        consecutiveMisses++;
        if (consecutiveMisses >= 2) break;
      }
    }
    cursor = dayBefore(cursor);
  }
  return count;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Local start-of-week (Sunday 00:00) for a timestamp. The goal is anchored
 *  to week boundaries so it stays frozen for the whole week rather than
 *  shifting under the child as they add words (council: don't move the bar
 *  while they watch it). */
function startOfWeekMs(nowMs: number): number {
  const d = new Date(nowMs);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  return d.getTime();
}

function countInWindow(isoDates: string[], startMs: number, endMs: number): number {
  let n = 0;
  for (const iso of isoDates) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t >= startMs && t < endMs) n++;
  }
  return n;
}

/** Distinct new words added since the start of the CURRENT week (Sunday) —
 *  the child's progress this week, matched to the frozen weekly goal. */
export function weeklyCount(isoDates: string[], nowMs: number): number {
  return countInWindow(isoDates, startOfWeekMs(nowMs), nowMs + 1);
}

/**
 * ADAPTIVE weekly goal (LLM council 2026-08-19). The product owns the number
 * — not the parent (a parent-set quota turns "the child's own progress" into
 * pressure) and not the kid (a 7-year-old can't calibrate; a 12-year-old
 * games it). Instead it's computed from the child's OWN recent pace:
 *   base = max(last complete week, avg of the 3 weeks before it)
 *   goal = clamp(round(base * 1.1), 5, 15)
 * A good week nudges the target up gently (×1.1); a slow week never spikes it
 * (the max()), so the pressure stays off. New kids (< 14 days of data) get the
 * floor. Pure function of the same notebook dates — no stored config, no
 * migration, frozen for the week (past weeks don't change mid-week).
 */
export function computeGoal(isoDates: string[], nowMs: number): number {
  let earliest = Infinity;
  for (const iso of isoDates) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t < earliest) earliest = t;
  }
  if (!Number.isFinite(earliest) || nowMs - earliest < 14 * 24 * 60 * 60 * 1000) {
    return WEEKLY_GOAL_FLOOR;
  }
  const ws = startOfWeekMs(nowMs);
  const lastWeek = countInWindow(isoDates, ws - WEEK_MS, ws);
  const prev3Avg = countInWindow(isoDates, ws - 4 * WEEK_MS, ws - WEEK_MS) / 3;
  const base = Math.max(lastWeek, prev3Avg);
  return Math.max(WEEKLY_GOAL_FLOOR, Math.min(WEEKLY_GOAL_CEIL, Math.round(base * 1.1)));
}

/**
 * Everything a surface needs, computed from a list of notebook addedAt dates.
 *
 * Rank is driven by POINTS (Gadi 2026-10-21): one per distinct notebook word
 * plus POINTS.practice per counted completed practice (`practices`, already
 * capped per day, see countedPractices). The server is the source of truth
 * for `practices` and `rankFloor` (lib/rank-points.ts, /api/rank); a client
 * that has not loaded them yet passes 0 / null. Streak + weekly goal stay on
 * raw activity dates, unchanged.
 */
export function computeGamification(
  addedAtIsoDates: string[],
  nowMs: number,
  todayStr: string,
  opts: {
    /** Counted completed practices (server: countedPractices). */
    practices?: number;
    /** Local days with a finished game, lesson, dictation, reading or "say
     *  it" (users/{uid}.practiceDays). One streak = days practised (Gadi
     *  2026-10-12). */
    practiceDays?: string[];
    /** Highest rank ever reached (users/{uid}.rankFloor). */
    rankFloor?: RankKey | null;
    /** Distinct words when the caller knows a better count than the dates
     *  list (the server's full notebook vs a client's first page). */
    words?: number;
  } = {},
): { distinct: number; practices: number; points: number; rank: RankInfo; streak: number; weekly: number; weeklyGoal: number } {
  const distinct = typeof opts.words === "number" ? Math.max(0, opts.words) : addedAtIsoDates.length;
  const practices = Math.max(0, opts.practices ?? 0);
  const points = rankPoints(distinct, practices);
  const localDates = addedAtIsoDates.map(toLocalDateStr).filter(Boolean);
  return {
    distinct,
    practices,
    points,
    rank: rankFor(points, opts.rankFloor),
    streak: computeStreak([...localDates, ...(opts.practiceDays ?? [])], todayStr),
    weekly: weeklyCount(addedAtIsoDates, nowMs),
    weeklyGoal: computeGoal(addedAtIsoDates, nowMs),
  };
}
