"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { isRankKey, type RankKey } from "@/lib/gamification";

/**
 * The signed-in user's rank as the SERVER computes it (GET /api/rank, see
 * lib/rank-points): words, completed practices, points, rank floor and the
 * practice days for the streak. Every rank surface (kids header, grown-up
 * rank card, top badge, skin picker) reads this, so they all agree. Cached
 * for a few minutes per visit; notifyActivity drops the cache after a
 * practice so the next surface shows the new points.
 */
export type ServerRank = {
  words: number;
  practices: number;
  points: number;
  rankIndex: number;
  rankFloor: RankKey | null;
  days: string[];
};

const KEY = "gadit-rank-state";
const TTL_MS = 3 * 60 * 1000;

function readCache(): ServerRank | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null") as ({ at: number } & ServerRank) | null;
    if (!c || Date.now() - c.at > TTL_MS) return null;
    return { words: c.words, practices: c.practices, points: c.points, rankIndex: c.rankIndex, rankFloor: c.rankFloor, days: c.days };
  } catch { return null; }
}

export function useServerRank(user: User | null | undefined, enabled = true): ServerRank | null {
  const [state, setState] = useState<ServerRank | null>(() => (typeof window === "undefined" ? null : readCache()));
  useEffect(() => {
    if (!user || !enabled) return;
    let off = false;
    (async () => {
      const cached = readCache();
      if (cached) { if (!off) setState(cached); return; }
      try {
        const r = await fetch("/api/rank", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!r.ok) return;
        const j = (await r.json()) as Partial<ServerRank>;
        const next: ServerRank = {
          words: typeof j.words === "number" ? j.words : 0,
          practices: typeof j.practices === "number" ? j.practices : 0,
          points: typeof j.points === "number" ? j.points : 0,
          rankIndex: typeof j.rankIndex === "number" ? j.rankIndex : 0,
          rankFloor: isRankKey(j.rankFloor) ? j.rankFloor : null,
          days: Array.isArray(j.days) ? j.days.filter((d): d is string => typeof d === "string") : [],
        };
        if (off) return;
        setState(next);
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), ...next }));
          // The skin picker's unlock check reads this one.
          sessionStorage.setItem("gadit-kid-rankindex", String(next.rankIndex));
        } catch { /* this visit only */ }
      } catch { /* the rank is a nice-to-have; local words still show */ }
    })();
    return () => { off = true; };
  }, [user, enabled]);
  return state;
}
