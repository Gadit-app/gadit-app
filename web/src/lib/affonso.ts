"use client";

/**
 * Affonso affiliate pixel helpers (kept free of React so auth-context can use them).
 *
 * Scope (Gadi 2026-11-10): the pixel runs ONLY on Gadit's landing pages, never
 * across the whole site and never on a child's screen. Affonso is used only for
 * the few signups that come through its affiliate marketplace; the in-house
 * partner program (RefCapture) is separate.
 *
 * - Landing pages: the same acquisition scope as the other pixels (lib/ad-scope.ts).
 * - A visitor who lands anywhere with an affiliate parameter (?via= / ?ref=)
 *   also loads it, so the referral cookie is set where the link points.
 * - At signup, the pixel is loaded only if that visitor already carries the
 *   Affonso referral cookie. No cookie, nothing is sent to Affonso.
 */

export const AFFONSO_PROGRAM_ID = "cmq3oz349000p11r2lloq0xb2";

/** True when this browser arrived through an Affonso affiliate link (cookie set by the pixel). */
export function hasAffonsoReferral(): boolean {
  try {
    return /(?:^|;\s*)affonso_referral=/.test(document.cookie);
  } catch {
    return false;
  }
}

/** True when the current URL carries an affiliate parameter. */
export function arrivedWithAffiliateParam(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    return q.has("via") || q.has("ref");
  } catch {
    return false;
  }
}

/** Injects the pixel once (first-party delivery through the /r/* rewrites). */
export function ensureAffonsoPixel(): void {
  try {
    if (document.querySelector("script[data-affonso]")) return;
    const s = document.createElement("script");
    s.src = "/r/pixel.js";
    s.async = true;
    s.setAttribute("data-affonso", AFFONSO_PROGRAM_ID);
    s.setAttribute("data-cookie_duration", "60");
    s.setAttribute("data-api-base", "/r");
    document.body.appendChild(s);
  } catch {
    // tracking must never break a user flow
  }
}
