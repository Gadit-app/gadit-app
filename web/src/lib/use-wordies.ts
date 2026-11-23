"use client";

import { useEffect, useState } from "react";
import { getAuth, type User } from "firebase/auth";

/**
 * Wordies: the one currency of Gadit (Gadi 2026-11-20, invented by Osher and
 * Dean). Today it is the journey's coins under their new name, 1 to 1: the
 * worth of the words the child knows plus the journey's bonuses, less what
 * was spent in the shop. The balance is computed on the server
 * (GET /api/journey?balance=1) and never written by the browser.
 *
 * Kept for a minute per visit; a screen that already knows the balance (the
 * shop, the cards) hands it over with setWordies so the chip never lags.
 *
 * The kept number belongs to one profile (Gadi 2026-11-23): after switching
 * to Dean and back, the parent's chip showed Dean's 15. It is stored with the
 * uid, read only for the same uid, and the hook forgets it when the profile
 * changes.
 */
const KEY = "gadit-wordies";
const TTL_MS = 60 * 1000;
const EVENT = "gadit-wordies";

type Kept = { at: number; n: number; uid?: string };

function readCache(uid: string): number | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(KEY) || "null") as Kept | null;
    return c && c.uid === uid && Date.now() - c.at <= TTL_MS && typeof c.n === "number" ? c.n : null;
  } catch { return null; }
}

/** The signed-in profile at the moment of the call (a screen hands over the
 *  balance of whoever is playing). */
function currentUid(): string | undefined {
  try { return getAuth().currentUser?.uid; } catch { return undefined; }
}

/** A screen that just learned the balance tells every chip on the page. */
export function setWordies(n: number, uid?: string) {
  if (!Number.isFinite(n)) return;
  const v = Math.max(0, Math.floor(n));
  const who = uid ?? currentUid();
  if (!who) return;
  try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), n: v, uid: who } satisfies Kept)); } catch { /* this visit only */ }
  try { window.dispatchEvent(new CustomEvent(EVENT, { detail: { n: v, uid: who } })); } catch { /* no window */ }
}

export function useWordies(user: User | null | undefined, enabled = true): number | null {
  const uid = user?.uid ?? null;
  // The number and the profile it belongs to, so another profile never shows it.
  const [kept, setKept] = useState<{ uid: string; n: number } | null>(null);
  useEffect(() => {
    if (!user || !enabled) return;
    let off = false;
    const me = user.uid;
    const onSet = (e: Event) => {
      const d = (e as CustomEvent<{ n: number; uid: string }>).detail;
      if (d && typeof d.n === "number" && d.uid === me) setKept({ uid: me, n: d.n });
    };
    window.addEventListener(EVENT, onSet);
    (async () => {
      const cached = readCache(me);
      if (cached !== null) { setKept({ uid: me, n: cached }); return; }
      try {
        const r = await fetch("/api/journey?balance=1", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (!r.ok) return;
        const j = (await r.json()) as { wordies?: number };
        if (off || typeof j.wordies !== "number") return;
        setWordies(j.wordies, me);
        setKept({ uid: me, n: Math.max(0, Math.floor(j.wordies)) });
      } catch { /* the chip is a nice-to-have */ }
    })();
    return () => { off = true; window.removeEventListener(EVENT, onSet); };
  }, [user, enabled]);
  return kept && kept.uid === uid ? kept.n : null;
}
