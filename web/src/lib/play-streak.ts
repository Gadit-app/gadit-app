"use client";

/**
 * Daily streak tracker for Word Games.
 *
 * LocalStorage-backed for V1 — per-device, no Firestore. Cross-device
 * sync can be added later by mirroring to /users/{uid}/playStats. For
 * a beta this is enough to get the dopamine loop running.
 *
 * Streak rule: playing on consecutive UTC dates extends the streak.
 * Skipping a day resets it to 1 on the next play. Playing multiple
 * times in one day keeps the streak unchanged.
 */

const KEY = "gadit-play-streak";

export type PlayStreak = {
  current: number;       // consecutive days including today (0 if never played)
  best: number;          // all-time max
  lastPlayedYmd: string; // "YYYY-MM-DD" in UTC, or ""
  totalSessions: number;
};

const empty: PlayStreak = {
  current: 0,
  best: 0,
  lastPlayedYmd: "",
  totalSessions: 0,
};

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}

export function getStreak(): PlayStreak {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as PlayStreak;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

/** Call this whenever the user FINISHES a game session (any of the five). */
export function recordPlay(): PlayStreak {
  if (typeof window === "undefined") return empty;
  const today = ymd(new Date());
  const prev = getStreak();
  let current = prev.current;
  if (prev.lastPlayedYmd === today) {
    // Already played today — keep streak, just bump session count.
  } else {
    const gap = daysBetween(prev.lastPlayedYmd, today);
    if (gap === 1) current = prev.current + 1;
    else current = 1; // reset (or first time)
  }
  const next: PlayStreak = {
    current,
    best: Math.max(prev.best, current),
    lastPlayedYmd: today,
    totalSessions: prev.totalSessions + 1,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* quota — ignore */ }
  return next;
}
