"use client";

import { readKidsMode } from "./use-kids-mode";

/**
 * Where ad and analytics pixels may run (Gadi 2026-10-25): Meta Pixel, Google
 * Analytics and TikTok Pixel load ONLY on acquisition pages, never inside the
 * logged-in app and never on a child's screen:
 *   marketing and landing pages (/families, /individuals, /schools landing,
 *   /partners, /features, /compare), /pricing, /checkout and its success page
 *   /checkout/done, and sign-in completion (/auth).
 * Never: the dictionary, games, homework, notebook, family, account, school
 * dashboards; a kid profile (role) or Kids Mode anywhere.
 * Kept free of React and auth imports (lib/track.ts and lib/ga.ts use it).
 */

const LANG = String.raw`(?:[a-z]{2,3}(?:-[A-Z]{2})?\/)?`;
const ACQUISITION = new RegExp(
  "^\/" + LANG + "(?:" +
    [
      "pricing(?:\/.*)?",
      "checkout(?:\/.*)?",
      "families(?:-v2)?(?:\/landing[\w-]*)?",
      "individuals(?:\/landing[\w-]*)?",
      "schools(?:\/landing[\w-]*)?",
      "partners",
      "features(?:\/.*)?",
      "compare(?:\/.*)?",
      "auth(?:\/.*)?",
    ].join("|") +
  ")\/?$",
);

export function isAcquisitionPath(path: string): boolean {
  return ACQUISITION.test(path);
}

/** Plan-listing pages: a visit there is a ViewContent. */
export function isPlansPath(path: string): boolean {
  return new RegExp("^\/" + LANG + "(?:pricing|families(?:-v2)?|individuals|schools)(?:\/landing[\w-]*)?\/?$").test(path);
}

let roleIsKid = false;
export function setAdsRoleIsKid(kid: boolean) {
  roleIsKid = kid;
}

/** True when a pixel or analytics hit may be sent right now. */
export function adsAllowed(path?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !roleIsKid && !readKidsMode() && isAcquisitionPath(path ?? window.location.pathname);
  } catch {
    return false;
  }
}
