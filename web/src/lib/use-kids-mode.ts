"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * useKidsMode — persistent "render every definition in a kid-friendly
 * way" toggle. Persisted in localStorage so it survives navigation
 * and tabs; a parent toggles it on once at the start of a session and
 * every search after that returns kids-mode content.
 *
 * Gating (Basic vs Clear+) is enforced by the caller — this hook just
 * tracks the boolean. The /api/define route, which knows the user's
 * plan from the Firebase token, decides whether to honor the flag in
 * cache lookups and prompt construction.
 */

const KEY = "gadit-kids-mode";

// Cross-tab + cross-component sync. Plain localStorage updates don't
// fire 'storage' events on the tab that made the change; we dispatch
// a custom event so every mounted useKidsMode receives the new value.
const EVENT_NAME = "gadit-kids-mode-change";

// Kids Mode is a Family tool (Gadi 2026-10-06). The auth provider closes this
// gate for a signed-in account without it (the Individual plan, free
// accounts), so a stored "on" never renders kids content for them. Signed-out
// visitors (a class code on the classroom computer) are not gated here.
let gateClosed = false;
export function setKidsModeGate(closed: boolean) {
  if (gateClosed === closed) return;
  gateClosed = closed;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NAME));
}

export function useKidsMode(): [boolean, (next: boolean) => void] {
  // Lazy initializer reads localStorage synchronously, so the very first render
  // already has the real value — no OFF-then-ON flash on kids-mode surfaces
  // (Gadi 2026-08-27). SSR returns false; the client hydrates with the real one.
  const [on, setOn] = useState<boolean>(() => readKidsMode() && !gateClosed);

  // Re-sync on mount + listen for cross-tab and same-tab updates.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOn(window.localStorage.getItem(KEY) === "1" && !gateClosed);
    const onChange = () => {
      setOn(window.localStorage.getItem(KEY) === "1" && !gateClosed);
    };
    window.addEventListener("storage", onChange);
    window.addEventListener(EVENT_NAME, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(EVENT_NAME, onChange);
    };
  }, []);

  const set = useCallback((next: boolean) => {
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return [on, set];
}

/**
 * Synchronous reader for places that need the current value outside a
 * React render (e.g. before issuing an API call). Returns false on the
 * server to keep the prompt deterministic during SSR — the client
 * re-renders with the real value after hydration.
 */
export function readKidsMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

/**
 * When a child is in their own personal area, Kids Mode is the DEFAULT
 * (Gadi 2026-09-19: "Kids Mode is the default when a family member who is
 * not mom or dad enters"). It turns ON on EVERY entry into a child's profile
 * (Gadi 2026-10-04: it used to fire once per browser session, so a second
 * switch to the same child, after the parent turned it off, stayed off).
 * Inside one visit the child can still switch to the regular view, and a
 * reload keeps that choice. Back to a grown-up's profile, Kids Mode returns
 * to what that grown-up had before the child came in.
 */
const CURRENT_KID = "gadit-kids-current-kid";
const BEFORE_KID = "gadit-kids-before-kid";
export function syncKidsModeForProfile(uid: string, isKid: boolean): void {
  if (typeof window === "undefined" || !uid) return;
  let current: string | null = null;
  try { current = window.sessionStorage.getItem(CURRENT_KID); } catch { /* blocked */ }
  if (isKid) {
    if (current === uid) return; // same visit (a reload): keep the child's own choice
    try {
      // Coming from a grown-up: remember their setting to restore later.
      if (!current) window.sessionStorage.setItem(BEFORE_KID, readKidsMode() ? "1" : "0");
      window.sessionStorage.setItem(CURRENT_KID, uid);
    } catch { /* blocked: still default ON */ }
    window.localStorage.setItem(KEY, "1");
    window.dispatchEvent(new Event(EVENT_NAME));
    return;
  }
  if (!current) return; // a grown-up who never left their profile: untouched
  let before = "0";
  try {
    before = window.sessionStorage.getItem(BEFORE_KID) ?? "0";
    window.sessionStorage.removeItem(CURRENT_KID);
    window.sessionStorage.removeItem(BEFORE_KID);
  } catch { /* blocked */ }
  if (before === "1") window.localStorage.setItem(KEY, "1");
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}
