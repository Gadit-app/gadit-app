"use client";

/**
 * Display-only niqqud (Hebrew) / tashkeel (Arabic) for the games.
 *
 * Games keep their logic on the plain text; only what's SHOWN passes through
 * `nq(text)`. Missing strings are batched to /api/niqqud (server-cached) and
 * the component re-renders when they land; until then the plain text shows.
 * The on/off preference is shared with the word page toggle, so a child
 * who reads with niqqud gets it in games too. From a parent's request
 * (Shelly), Gadi 2026-10-01. Since 2026-11-11 it is kept PER PROFILE and
 * starts ON for a child aged 8 or under (grades 1-2), from the age the
 * parent gave when adding them (readNiqqudPref / writeNiqqudPref).
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const VOWELIZABLE = /[֐-׿؀-ۿ]/;
/** The one shared device key before Nov 2026 (every profile on the device shared it). */
const LEGACY_KEY = "gadit-niqqud";
const keyFor = (uid: string | null | undefined) => (uid ? `gadit-niqqud:${uid}` : LEGACY_KEY);
/** Niqqud starts on for a child this age or younger (grades 1-2). */
export const NIQQUD_DEFAULT_MAX_AGE = 8;

/** The profile's niqqud preference: its own saved choice first, else on for
 *  a young child, else the device's old shared setting. */
export function readNiqqudPref(uid: string | null | undefined, age: number | null | undefined): boolean {
  try {
    if (typeof window === "undefined") return false;
    const own = uid ? localStorage.getItem(keyFor(uid)) : null;
    if (own === "1" || own === "0") return own === "1";
    if (typeof age === "number" && age > 0 && age <= NIQQUD_DEFAULT_MAX_AGE) return true;
    return localStorage.getItem(LEGACY_KEY) === "1";
  } catch { return false; }
}
export function writeNiqqudPref(uid: string | null | undefined, on: boolean) {
  try { localStorage.setItem(keyFor(uid), on ? "1" : "0"); } catch { /* this visit only */ }
}

type Ctx = { available: boolean; lang: string; on: boolean; toggle: () => void; nq: (s: string) => string };
const NiqqudCtx = createContext<Ctx>({ available: false, lang: "he", on: false, toggle: () => {}, nq: (s) => s });

export function useNiqqud() {
  return useContext(NiqqudCtx);
}

export function NiqqudProvider({ available, lang, children }: { available: boolean; lang: string; children: React.ReactNode }) {
  const { user, memberAge } = useAuth();
  // Lazy read: the provider only mounts once a game starts (client-side),
  // so there's no server render to mismatch.
  const [on, setOn] = useState(() => readNiqqudPref(user?.uid, memberAge));
  // The profile (or its age) can land after the first paint: read again.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-reads the stored preference
    setOn(readNiqqudPref(user?.uid, memberAge));
  }, [user?.uid, memberAge]);
  const [map, setMap] = useState<Record<string, string>>({});
  const pending = useRef<Set<string>>(new Set());
  const requested = useRef<Set<string>>(new Set());
  const timer = useRef<number | null>(null);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      writeNiqqudPref(user?.uid, next);
      return next;
    });
  }, [user?.uid]);

  const flush = useCallback(async () => {
    timer.current = null;
    const batch = Array.from(pending.current);
    pending.current.clear();
    if (!batch.length || !user) return;
    let idToken: string;
    try { idToken = await user.getIdToken(); } catch { return; }
    for (let i = 0; i < batch.length; i += 40) {
      const texts = batch.slice(i, i + 40);
      try {
        const res = await fetch("/api/niqqud", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ texts }),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as { niqqud?: string[] };
        const out = data.niqqud ?? [];
        if (out.length !== texts.length) continue;
        setMap((m) => {
          const next = { ...m };
          texts.forEach((tx, k) => { next[tx] = out[k] ?? tx; });
          return next;
        });
      } catch { /* service down → plain text */ }
    }
  }, [user]);

  const active = available && on;
  const nq = useCallback(
    (s: string) => {
      if (!active || !s || !VOWELIZABLE.test(s)) return s;
      const hit = map[s];
      if (hit !== undefined) return hit;
      if (!requested.current.has(s)) {
        requested.current.add(s);
        pending.current.add(s);
        if (timer.current === null) timer.current = window.setTimeout(() => { void flush(); }, 30);
      }
      return s;
    },
    [active, map, flush],
  );

  return (
    <NiqqudCtx.Provider value={{ available: available && !!user, lang, on, toggle, nq }}>
      {children}
    </NiqqudCtx.Provider>
  );
}

/** Small on/off chip, same look as the word page's niqqud toggle. */
export function NiqqudToggle() {
  const { available, lang, on, toggle } = useNiqqud();
  if (!available) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="wb-play-niqqud"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999,
        font: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
        border: on ? "1.5px solid #0EA5A5" : "1px solid var(--rule, #E4EAE8)",
        background: on ? "color-mix(in srgb, #0EA5A5 12%, transparent)" : "var(--surface, #fff)",
        color: on ? "#0B8A8A" : "var(--ink-soft, #3F4856)",
      }}
    >
      {on && <span aria-hidden="true">✓</span>}
      {lang === "ar" ? "تشكيل" : "ניקוד"}
    </button>
  );
}
