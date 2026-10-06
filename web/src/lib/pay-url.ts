/**
 * Links that lead to a purchase (pricing, a plan page, checkout, account
 * upgrade) go to https://gadit.app, NOT www: the Play app claims only
 * www.gadit.app, so on a phone with the app installed a www link opens the
 * app, where nothing may be sold. The bare domain always opens in the browser
 * and serves just the purchase pages (see middleware.ts). Gadi 2026-10-06.
 */
export const PAY_ORIGIN = "https://gadit.app";

/** Absolute purchase URL, e.g. payUrl("/he/families"). */
export function payUrl(path: string): string {
  return PAY_ORIGIN + (path.startsWith("/") ? path : `/${path}`);
}

const PAY_ROUTES = new Set(["pricing", "checkout", "families", "individuals", "schools", "renew", "account"]);
const LANG_SEG = /^[a-z]{2,3}(?:-[A-Z]{2})?$/;

/** A www.gadit.app link to a purchase page, moved to the purchase host; any
 *  other URL is returned unchanged. Used by the email renderer for every link. */
export function payifyUrl(url: string): string {
  const m = url.match(/^https:\/\/www\.gadit\.app(\/[^?#]*)?([?#].*)?$/);
  if (!m) return url;
  const segs = (m[1] || "/").split("/").filter(Boolean);
  const first = segs[0] && LANG_SEG.test(segs[0]) ? segs[1] : segs[0];
  return first && PAY_ROUTES.has(first) ? PAY_ORIGIN + (m[1] || "") + (m[2] || "") : url;
}
