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
 * Build the logical /word path for a search term, handling URL "dot-segments".
 *
 * A path segment that is only dots ("." or "..") is a URL dot-segment: the
 * browser strips it before the request AND Vercel normalizes it (even
 * percent-encoded as %2E → 404), so /word/[word] never receives it and the
 * user lands on a 404 (Gadi 2026-08-15, searched "."). Carry an all-dots term
 * through a ?q= query on a placeholder segment instead; the /word route reads
 * `q` in preference to the path param. Every other symbol ("#", "/", "%", "-")
 * survives encodeURIComponent as a normal path segment, so it stays in the path.
 *
 * `extra` is optional extra query (e.g. "cls=ABC" or "ctx=..."), WITHOUT a
 * leading "?"/"&"; it is chained correctly for both path and query forms.
 * Wrap the result in useHref()/buildHref() to add the language prefix.
 */
export function wordPath(word: string, extra?: string): string {
  const trimmed = word.trim();
  const extraClean = extra ? extra.replace(/^[?&]+/, "") : "";
  if (/^\.+$/.test(trimmed)) {
    return `/word/_?q=${encodeURIComponent(trimmed)}${extraClean ? `&${extraClean}` : ""}`;
  }
  return `/word/${encodeURIComponent(trimmed)}${extraClean ? `?${extraClean}` : ""}`;
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
  const SUPPORTED = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am"];
  const segs = path.split("/").filter(Boolean);
  if (segs[0] && SUPPORTED.includes(segs[0])) segs.shift();

  const cleanPath = "/" + segs.join("/");
  // For the home route, return "/he" rather than "/he/" — Next prefers
  // the no-trailing-slash form and middleware accepts both.
  return cleanPath === "/" ? `/${lang}` : `/${lang}${cleanPath}`;
}
