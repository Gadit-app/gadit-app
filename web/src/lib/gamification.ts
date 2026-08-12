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
 *   3. Explorer rank — distinct words collected maps to a named rank.
 *
 * This module is PURE (no i18n, no I/O) so both the client notebook page
 * and the server family-progress endpoint can share it. Each surface maps
 * the returned rank key to a localized label with its own copy.
 */

export const WEEKLY_GOAL = 8;

export type RankKey = "scout" | "explorer" | "tracker" | "ranger" | "guide" | "master";

/** Distinct-word thresholds for each rank. Ranks grow on DISTINCT words, so
 *  re-searching the same word never inflates them. */
export const RANKS: { key: RankKey; min: number }[] = [
  { key: "scout", min: 0 },
  { key: "explorer", min: 10 },
  { key: "tracker", min: 30 },
  { key: "ranger", min: 75 },
  { key: "guide", min: 150 },
  { key: "master", min: 300 },
];

export type RankInfo = {
  key: RankKey;
  index: number;        // 0..RANKS.length-1
  min: number;          // threshold of the current rank
  next: number | null;  // threshold of the next rank, or null at the top
  /** 0..1 progress from this rank's min to the next rank's min. 1 at the top. */
  progress: number;
};

export function rankFor(distinct: number): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (distinct >= RANKS[i].min) idx = i;
  }
  const cur = RANKS[idx];
  const nextThreshold = idx < RANKS.length - 1 ? RANKS[idx + 1].min : null;
  const progress =
    nextThreshold === null
      ? 1
      : Math.max(0, Math.min(1, (distinct - cur.min) / (nextThreshold - cur.min)));
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

/** Distinct new words added within the last 7 days (rolling). */
export function weeklyCount(isoDates: string[], nowMs: number): number {
  const cutoff = nowMs - 7 * 24 * 60 * 60 * 1000;
  let n = 0;
  for (const iso of isoDates) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t >= cutoff) n++;
  }
  return n;
}

/** Everything a surface needs, computed from a list of notebook addedAt dates. */
export function computeGamification(
  addedAtIsoDates: string[],
  nowMs: number,
  todayStr: string,
): { distinct: number; rank: RankInfo; streak: number; weekly: number; weeklyGoal: number } {
  const distinct = addedAtIsoDates.length;
  const localDates = addedAtIsoDates.map(toLocalDateStr).filter(Boolean);
  return {
    distinct,
    rank: rankFor(distinct),
    streak: computeStreak(localDates, todayStr),
    weekly: weeklyCount(addedAtIsoDates, nowMs),
    weeklyGoal: WEEKLY_GOAL,
  };
}
