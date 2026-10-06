"use client";

import { readKidsMode } from "./use-kids-mode";

/**
 * GA4 helpers shared by the GoogleAnalytics component and lib/track.ts (kept
 * free of React and auth imports so track.ts, which auth-context imports, has
 * no import cycle). Kid-safety policy: see components/GoogleAnalytics.tsx.
 */

export const GA_ID = "G-28987K226D";
const DISABLE_KEY = `ga-disable-${GA_ID}`;

const KID_PATH = /^\/(?:[a-z]{2,3}(?:-[A-Z]{2})?\/)?(?:c|kids|spell)(?:\/|$)/;
export function isKidPath(path: string): boolean {
  return KID_PATH.test(path);
}

// Module-level so non-React callers (lib/track.ts, the history guard) can ask.
let roleIsKid = false;
export function setGaRoleIsKid(kid: boolean) {
  roleIsKid = kid;
}

/** True when a GA hit may be sent right now (never for a child). */
export function gaAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !roleIsKid && !readKidsMode() && !isKidPath(window.location.pathname);
  } catch {
    return false;
  }
}

type GtagFn = (...args: unknown[]) => void;

/** Send a GA4 event; silently dropped in a kid context or before GA loads. */
export function gaEvent(name: string, params?: Record<string, unknown>) {
  try {
    if (!gaAllowed()) return;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (gtag) gtag("event", name, params ?? {});
  } catch {
    // analytics must never break a user flow
  }
}

/** The GA client id from the _ga cookie ("GA1.1.<id>"), for server-side hits. */
export function gaClientId(): string | null {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function setGaDisabled(off: boolean) {
  (window as unknown as Record<string, unknown>)[DISABLE_KEY] = off;
}

let guardInstalled = false;
export function installGaHistoryGuard() {
  if (guardInstalled || typeof window === "undefined") return;
  guardInstalled = true;
  const wrap = (fn: History["pushState"]) =>
    function (this: History, ...args: Parameters<History["pushState"]>) {
      const r = fn.apply(this, args);
      try { setGaDisabled(!gaAllowed()); } catch {}
      return r;
    };
  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener("popstate", () => { try { setGaDisabled(!gaAllowed()); } catch {} });
}

