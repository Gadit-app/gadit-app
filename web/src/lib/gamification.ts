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

/** Thresholds for each rank. Ranks grow on the child's *understood* words once
 *  the comprehension ledger is wired (LLM council 2026-08: reward understanding,
 *  not raw searches); until then rankFor is metric-agnostic and takes whatever
 *  count the caller passes (currently distinct words). Re-searching the same
 *  word never inflates a rank. */
export const RANKS: { key: RankKey; min: number }[] = [
  { key: "scout", min: 0 },
  { key: "explorer", min: 10 },
  { key: "tracker", min: 30 },
  { key: "ranger", min: 75 },
  { key: "guide", min: 150 },
  { key: "master", min: 300 },
  { key: "champion", min: 450 },
  { key: "sage", min: 650 },
  { key: "virtuoso", min: 900 },
  { key: "legend", min: 1200 },
  { key: "wizard", min: 1600 },
  { key: "grandmaster", min: 2200 },
];

/**
 * Points model for the unlock economy (LLM council 2026-08, approved by Gadi).
 * Comprehension is a MULTIPLIER, not a gate: looking a word up earns a little,
 * proving you understood it (a correct quiz/game on that word) earns a lot.
 * Points buy NEW cosmetics; the 5 existing skins stay free. Parent/Yooniz
 * "gift points" live in a SEPARATE, capped wallet (see GIFT_WEEKLY_CAP) and
 * never count toward ranks or the parent dashboard's mastery metric.
 */
export const POINTS = { seen: 1, understood: 10 } as const;
/** Weekly ceiling on parent/Yooniz gift points, so bonuses stay a treat and
 *  can't launder raw-count into the earned economy. */
export const GIFT_WEEKLY_CAP = 50;

/**
 * Gift-store prices, in GIFT points (the separate parent/Yooniz wallet — never
 * ranks). Single source of truth so both the client picker (@/lib/appearance
 * reads these) and the server buy endpoint agree. Keyed by ThemeId. A skin
 * listed here is buyable; the 5 original skins are free and never appear.
 */
export const SKIN_PRICES: Record<string, number> = {
  sunset: 15, aurora: 20, cosmos: 25, lava: 30, // dual-path: also earnable by rank
  rainbow: 35, royal: 40,                        // store-exclusive
};

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
 * Rank is driven by EARNED POINTS, not raw word count (kids gamification v2,
 * council 2026-08): every saved word is worth POINTS.seen, and proving you
 * understood it (a passed quiz/game, tracked by `understood` on the notebook
 * doc) adds POINTS.understood. So comprehension is a multiplier on rank
 * progress, not a gate. `understoodCount` is how many of these words are
 * understood; pass 0 (the default) for surfaces that don't yet track it and
 * ranks fall back to one point per word. Streak + weekly goal stay on raw
 * activity dates, unchanged.
 */
export function computeGamification(
  addedAtIsoDates: string[],
  nowMs: number,
  todayStr: string,
  understoodCount = 0,
): { distinct: number; understood: number; points: number; rank: RankInfo; streak: number; weekly: number; weeklyGoal: number } {
  const distinct = addedAtIsoDates.length;
  const understood = Math.max(0, Math.min(distinct, understoodCount));
  const points = distinct * POINTS.seen + understood * POINTS.understood;
  const localDates = addedAtIsoDates.map(toLocalDateStr).filter(Boolean);
  return {
    distinct,
    understood,
    points,
    rank: rankFor(points),
    streak: computeStreak(localDates, todayStr),
    weekly: weeklyCount(addedAtIsoDates, nowMs),
    weeklyGoal: computeGoal(addedAtIsoDates, nowMs),
  };
}
