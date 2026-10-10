"use client";

/**
 * In-app "back" that behaves like the browser's Back button (Gadi 2026-10-10:
 * Back must always return to the page the user was on).
 *
 * A back control that is a plain link to a fixed page pushes a NEW history
 * entry, so the browser's Back then returns to the page the user just left
 * (A → B, tap "back" = A again, browser Back = B again: a ping-pong). Instead,
 * when the previous entry of this tab is on our own site, we step back to it
 * (router.back()), and only when there is none (the page was opened from a
 * link, an email, a new tab) do we navigate to the fallback page.
 *
 * The previous entry is read from the Navigation API (Chrome, Edge, Safari
 * 26.2+, Firefox 147+), which only lists same-origin entries of this tab.
 * Where it is missing we cannot see the previous URL, so we fall back to the
 * old behaviour (navigate to the fallback page): never worse than before.
 */

type NavEntry = { url: string | null; index: number };
type NavApi = { currentEntry: NavEntry | null; entries(): NavEntry[] };

const LANG_PREFIXES = new Set([
  "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am",
  "uk", "tr", "pl", "fa", "id", "nl", "el", "zu", "vi", "fil", "af", "sw",
  "zh-CN", "zh-TW", "ko", "th", "bn", "da", "hu",
]);

/** "/he/family/" → "/family"; the language prefix does not make a different page. */
export function logicalPath(pathname: string): string {
  const segs = pathname.split("/").filter(Boolean);
  if (segs[0] && LANG_PREFIXES.has(segs[0])) segs.shift();
  return "/" + segs.join("/");
}

/**
 * The previous entry of this tab when it is a page of this site; null when
 * there is none (first page of the tab, or the previous one is another site);
 * undefined when the browser cannot tell us.
 */
export function previousInAppUrl(): URL | null | undefined {
  if (typeof window === "undefined") return undefined;
  const nav = (window as unknown as { navigation?: NavApi }).navigation;
  const cur = nav?.currentEntry;
  if (!nav || !cur || typeof cur.index !== "number" || typeof nav.entries !== "function") return undefined;
  if (cur.index <= 0) return null;
  const prev = nav.entries()[cur.index - 1];
  if (!prev?.url) return null;
  try {
    const u = new URL(prev.url);
    return u.origin === window.location.origin ? u : null;
  } catch {
    return null;
  }
}

/**
 * Should an in-app back control step back in history instead of opening
 * `fallback`? With `fallback` given, only when the previous page IS that page
 * (a "Back to the classroom" button must not go to some other page); without
 * it, whenever the previous page is on this site.
 */
export function canStepBack(fallback?: string, match?: (prev: URL) => boolean): boolean {
  const prev = previousInAppUrl();
  if (!prev) return false;
  if (match) return match(prev);
  if (!fallback) return true;
  try {
    const want = new URL(fallback, window.location.origin);
    return samePage(prev.pathname, want.pathname);
  } catch {
    return false;
  }
}

// Decoded and case-folded (the middleware lowercases /word/<w>), trailing
// slash and language prefix ignored.
function samePage(a: string, b: string): boolean {
  const norm = (p: string) => {
    let d = p;
    try { d = decodeURIComponent(p); } catch { /* keep raw */ }
    return logicalPath(d).replace(/\/$/, "").toLowerCase();
  };
  return norm(a) === norm(b);
}

type RouterLike = { back(): void; push(href: string): void };

/** Step back when the previous page is the one we want, else open `fallback`. */
export function goBackOr(router: RouterLike, fallback: string, match?: (prev: URL) => boolean) {
  if (canStepBack(fallback, match)) router.back();
  else router.push(fallback);
}
