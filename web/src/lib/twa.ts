"use client";

/**
 * Trusted Web Activity (Android Play Store wrapper) helpers.
 *
 * The TWA is the same PWA in a full-screen Android shell. To stay on the
 * "reader app" model (no Google Play Billing, no 15-30% cut, 100% on
 * Stripe), PAYMENT must happen in an external browser, not inside the
 * app. Daily use is in-app; the checkout button opens a browser tab.
 *
 * Detection: on the TWA's first load Chrome sets document.referrer to
 * "android-app://com.gadit.app". We persist that in localStorage so it
 * survives later navigations where the referrer changes.
 */

const TWA_KEY = "gadit_twa";
const TWA_PKG = "android-app://com.gadit.app";

/** Call once on app load. Persists a flag if we were launched by the TWA. */
export function markTwaIfDetected(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(TWA_KEY) === "1") return;
    const ref = document.referrer || "";
    if (ref.startsWith(TWA_PKG) || ref.startsWith("android-app://")) {
      localStorage.setItem(TWA_KEY, "1");
    }
  } catch {
    /* private mode / blocked */
  }
}

/** True when running inside the Gadit Android TWA. */
export function isTwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TWA_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Open a URL in the external browser (a Chrome Custom Tab from inside the
 * TWA). Used for the payment flow so the purchase is browser-based, which
 * keeps us compliant and off Play Billing. Absolute URL recommended.
 */
export function openInBrowser(url: string): void {
  if (typeof window === "undefined") return;
  const abs = url.startsWith("http") ? url : `https://www.gadit.app${url.startsWith("/") ? "" : "/"}${url}`;
  window.open(abs, "_blank", "noopener,noreferrer");
}
