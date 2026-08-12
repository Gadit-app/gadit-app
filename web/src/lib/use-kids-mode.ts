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

export function useKidsMode(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState(false);

  // Initial read + listen for cross-tab and same-tab updates.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setOn(window.localStorage.getItem(KEY) === "1");
    const onChange = () => {
      setOn(window.localStorage.getItem(KEY) === "1");
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
 * When a child signs in with their own profile, Kids Mode should be the
 * DEFAULT (Gadi 2026-08-12) — they still get a toggle to switch to the
 * regular view. We apply the default ONCE per profile per device (tracked
 * by a per-uid marker), so after a kid deliberately turns it off it stays
 * off for them; we never force it back on every navigation.
 */
const APPLIED_PREFIX = "gadit-kids-default-applied:";
export function applyKidsModeDefaultForKid(uid: string): void {
  if (typeof window === "undefined" || !uid) return;
  const marker = APPLIED_PREFIX + uid;
  if (window.localStorage.getItem(marker) === "1") return; // already applied for this kid here
  window.localStorage.setItem(marker, "1");
  window.localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVENT_NAME));
}
