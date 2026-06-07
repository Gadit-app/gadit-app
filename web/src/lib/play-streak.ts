"use client";

/**
 * Daily streak tracker for Word Games.
 *
 * Storage strategy: LocalStorage as the synchronous source of truth
 * (so the menu can paint instantly) + Firestore as the authoritative
 * cross-device store via /api/play/streak. The two reconcile by taking
 * MAX(local.current, remote.current) on read, so a device that ran
 * ahead while offline never gets demoted.
 *
 * Streak rule (consistent client + server):
 *   - same UTC day        → current unchanged
 *   - exactly +1 day      → current +1
 *   - otherwise           → current resets to 1
 */

import type { User } from "firebase/auth";

const KEY = "gadit-play-streak";

export type PlayStreak = {
  current: number;
  best: number;
  lastPlayedYmd: string;
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

function readLocal(): PlayStreak {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as PlayStreak) };
  } catch {
    return empty;
  }
}

function writeLocal(s: PlayStreak): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch { /* quota — ignore */ }
}

/**
 * Synchronous read — used by the menu's first paint. May be stale if
 * the user just played on another device; `syncFromServer` refreshes
 * it asynchronously.
 */
export function getStreak(): PlayStreak {
  return readLocal();
}

/**
 * Pull from Firestore and merge with the local snapshot. The merged
 * record (highest current, highest best, latest lastPlayedYmd, summed-
 * but-clamped sessions) is written back to LocalStorage for the next
 * synchronous read.
 *
 * Safe to call on every /play mount — single GET, cheap.
 */
export async function syncFromServer(user: User | null): Promise<PlayStreak> {
  if (!user) return readLocal();
  try {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/play/streak", {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) return readLocal();
    const remote = (await res.json()) as PlayStreak;
    const local = readLocal();
    const merged: PlayStreak = {
      current: Math.max(remote.current ?? 0, local.current ?? 0),
      best: Math.max(remote.best ?? 0, local.best ?? 0),
      lastPlayedYmd:
        (remote.lastPlayedYmd ?? "") > (local.lastPlayedYmd ?? "")
          ? remote.lastPlayedYmd
          : local.lastPlayedYmd,
      totalSessions: Math.max(
        remote.totalSessions ?? 0,
        local.totalSessions ?? 0,
      ),
    };
    writeLocal(merged);
    return merged;
  } catch {
    return readLocal();
  }
}

/**
 * Record a completed session. Updates LocalStorage immediately so the
 * UI feels instant, then fires the Firestore mutation in the
 * background (best-effort; offline play still counts locally and will
 * sync on the next online play).
 */
export function recordPlay(user?: User | null): PlayStreak {
  if (typeof window === "undefined") return empty;
  const today = ymd(new Date());
  const prev = readLocal();
  let current = prev.current;
  if (prev.lastPlayedYmd !== today) {
    const gap = daysBetween(prev.lastPlayedYmd, today);
    current = gap === 1 ? prev.current + 1 : 1;
  }
  const next: PlayStreak = {
    current,
    best: Math.max(prev.best, current),
    lastPlayedYmd: today,
    totalSessions: prev.totalSessions + 1,
  };
  writeLocal(next);

  // Fire-and-forget Firestore sync. We don't await — UI shouldn't
  // block on the network for a streak bump.
  if (user) {
    user
      .getIdToken()
      .then((idToken) =>
        fetch("/api/play/streak", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            localCurrent: next.current,
            localBest: next.best,
          }),
        }),
      )
      .catch(() => { /* offline — local copy is authoritative until next sync */ });
  }
  return next;
}
