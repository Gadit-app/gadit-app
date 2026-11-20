"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";

/**
 * Wordies: the one currency of Gadit (Gadi 2026-11-20, invented by Osher and
 * Dean). Today it is the journey's coins under their new name, 1 to 1: the
 * worth of the words the child knows plus the journey's bonuses, less what
 * was spent in the shop. The balance is computed on the server
 * (GET /api/journey?balance=1) and never written by the browser.
 *
 * Kept for a minute per visit; a screen that already knows the balance (the
 * shop, the cards) hands it over with setWordies so the chip never lags.
 */
const KEY = "gadit-wordies";
const TTL_MS = 60 * 1000;
const EVENT = "gadit-wordies";

function readCache(): number | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null") as { at: number; n: number } | null;
    return c && Date.now() - c.at <= TTL_MS && typeof c.n === "number" ? c.n : null;
  } catch { return null; }
}

/** A screen that just learned the balance tells every chip on the page. */
export function setWordies(n: number) {
  if (!Number.isFinite(n)) return;
  const v = Math.max(0, Math.floor(n));
  try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), n: v })); } catch { /* this visit only */ }
  try { window.dispatchEvent(new CustomEvent(EVENT, { detail: v })); } catch { /* no window */ }
}

export function useWordies(user: User | null | undefined, enabled = true): number | null {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!user || !enabled) return;
    let off = false;
    const onSet = (e: Event) => { const d = (e as CustomEvent<number>).detail; if (typeof d === "number") setN(d); };
    window.addEventListener(EVENT, onSet);
    (async () => {
      const cached = readCache();
      if (cached !== null) { setN(cached); return; }
      try {
        const r = await fetch("/api/journey?balance=1", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!r.ok) return;
        const j = (await r.json()) as { wordies?: number };
        if (off || typeof j.wordies !== "number") return;
        setWordies(j.wordies);
        setN(Math.max(0, Math.floor(j.wordies)));
      } catch { /* the chip is a nice-to-have */ }
    })();
    return () => { off = true; window.removeEventListener(EVENT, onSet); };
  }, [user, enabled]);
  return n;
}
