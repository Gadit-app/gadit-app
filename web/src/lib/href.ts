"use client";

import { useLang } from "./lang-context";
import type { Lang } from "./i18n";

/**
 * useHref — turn a logical app path ("/pricing", "/features", "/word/dream")
 * into a URL that carries the user's current language prefix, when one
 * is needed.
 *
 * Strategy:
 *   - English (en) is the canonical / brand-default surface. Root URLs
 *     stay clean: gadit.app, gadit.app/pricing, gadit.app/features.
 *   - Every other supported language gets a prefix: /he/pricing,
 *     /de/features, /cs/word/sen, etc. — so the URL itself carries the
 *     language and is shareable.
 *
 * Without this hook, every <Link href="/pricing"> across the codebase
 * silently drops the language prefix on navigation, leaving the user
 * with a URL that contradicts the UI (Hebrew interface but no /he in
 * the path). The cookie keeps the UI right, but a shared link from
 * that page lands the recipient in their browser-default language
 * instead of the language the sharer was actually browsing.
 *
 * Usage:
 *   const href = useHref();
 *   <Link href={href("/pricing")}>Pricing</Link>
 *
 * Caller passes the "/pricing" path; the hook adds "/he", "/de", etc.
 * for non-English users. English users get the original path unchanged.
 */
export function useHref() {
  const { lang } = useLang();
  return (path: string) => buildHref(lang, path);
}

/**
 * Pure variant for non-React contexts (route handlers, sitemap generation,
 * tests). Caller supplies the lang explicitly.
 */
export function buildHref(lang: Lang, path: string): string {
  // English is the canonical default — no prefix.
  if (lang === "en") return path;

  // Defensive: if the caller already added a lang prefix (e.g. the user
  // wrote href("/he/pricing"), or middleware-rewritten paths leaked in),
  // strip it before re-applying so we don't end up with /he/de/pricing.
  const SUPPORTED = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs"];
  const segs = path.split("/").filter(Boolean);
  if (segs[0] && SUPPORTED.includes(segs[0])) segs.shift();

  const cleanPath = "/" + segs.join("/");
  // For the home route, return "/he" rather than "/he/" — Next prefers
  // the no-trailing-slash form and middleware accepts both.
  return cleanPath === "/" ? `/${lang}` : `/${lang}${cleanPath}`;
}
