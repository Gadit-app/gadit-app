import { NextResponse, type NextRequest } from "next/server";

/**
 * Language-prefixed URL routing.
 *
 * Visiting /he, /he/pricing, /en/word/dream, etc. behaves like:
 *   1. Set the gadit-lang cookie to the prefix language (so server +
 *      client lang resolution agree from the very first paint)
 *   2. Rewrite internally to the URL without the prefix — so all
 *      Next.js routing (app/(routes)/...) keeps working unchanged,
 *      no new app/[lang]/ segment needed.
 * The browser's address bar still shows /he/pricing so the link is
 * shareable: another user clicking it lands in Hebrew on the same page.
 *
 * For visits without a prefix (/pricing, /word/X, /), the middleware
 * is a no-op — language resolution falls back to the existing
 * cookie / localStorage / browser-locale logic in LangProvider.
 */

const SUPPORTED_LANGS = new Set(["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am", "uk", "tr", "pl", "fa", "id", "nl", "el", "zu", "vi", "fil", "af", "sw", "zh-CN", "zh-TW", "ko", "th", "bn", "da", "hu"]);

// ── Google Play "consumption-only" mode ─────────────────────────────
// The Play-distributed TWA must not offer or lead to any purchase, or it
// violates Google Play's Payments/Subscriptions policy (there is no
// reader-app exemption on Google Play). So the Play build launches at
// www.gadit.app/?src=play; from then on we treat that session as Play mode
// (sticky cookie), block every purchase surface server-side, and hide the
// purchase CTAs. The plain web (no marker) keeps selling via Stripe with the
// free trial, untouched — Gadit is web-first, the app is convenience only.
const PLAY_COOKIE = "gadit_play";
// Consumer purchase surfaces that must not exist inside the Play app.
const BLOCKED_IN_PLAY = new Set(["pricing", "checkout", "families", "individuals", "schools"]);

function detectPlay(req: NextRequest): boolean {
  if (req.nextUrl.searchParams.get("src") === "play") return true;
  if ((req.headers.get("referer") || "").startsWith("android-app://")) return true;
  return req.cookies.get(PLAY_COOKIE)?.value === "1";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Malformed paths — a stray backslash (crawlers hit "/individuals\" =
  // "/individuals%5C") or a bad percent-escape — throw downstream in
  // URL/metadata construction and surface as 5xx (Vercel anomaly alert
  // 2026-08-20). Bounce them to a clean 404 before they reach any page.
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  if (decodedPath.includes("\\")) {
    return new NextResponse(null, { status: 404 });
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // Play mode: sticky cookie + block purchase surfaces server-side (never a
  // client-only hide — the price must not exist in the HTML the reviewer gets).
  const playMode = detectPlay(req);
  if (playMode) {
    const langPrefixed = !!first && SUPPORTED_LANGS.has(first);
    const routeFirst = langPrefixed ? segments[1] : first;
    if (routeFirst && BLOCKED_IN_PLAY.has(routeFirst)) {
      const home = req.nextUrl.clone();
      home.pathname = langPrefixed ? `/${first}` : "/";
      home.search = "";
      const redirect = NextResponse.redirect(home);
      redirect.cookies.set(PLAY_COOKIE, "1", { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
      return redirect;
    }
  }

  if (!first || !SUPPORTED_LANGS.has(first)) {
    // No lang prefix — still forward the original path so the layout's
    // generateMetadata can emit a correct per-page canonical URL.
    // Before this, every page inherited canonical=homepage from the
    // root layout and Google refused to index anything but the
    // homepage ("Alternate page with proper canonical tag", GSC email
    // 2026-07-03). Launch SEO fix 2026-07-04.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-gadit-path", pathname);
    if (playMode) requestHeaders.set("x-gadit-play", "1");
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    if (playMode) res.cookies.set(PLAY_COOKIE, "1", { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
    return res;
  }

  const remainder = segments.slice(1).join("/");
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = remainder ? `/${remainder}` : "/";

  // Pass the lang as a request header so layout's generateMetadata
  // can read it during SSR — important for OG-image / og:description
  // generation when a social-card crawler fetches a /he/… URL with
  // no cookie. Cookie is also set for the user's subsequent
  // (in-browser) requests so the client-side LangProvider picks it up.
  // x-gadit-path carries the ORIGINAL prefixed path (/he/pricing) for
  // per-page canonical + hreflang generation in the layout.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-gadit-lang", first);
  requestHeaders.set("x-gadit-path", pathname);
  if (playMode) requestHeaders.set("x-gadit-play", "1");

  const res = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  res.cookies.set("gadit-lang", first, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  if (playMode) res.cookies.set(PLAY_COOKIE, "1", { maxAge: 60 * 60 * 24 * 365, sameSite: "lax", path: "/" });
  return res;
}

export const config = {
  // Skip Next internals, the API, static assets, and any file with an
  // extension (favicon.ico, robots.txt, etc.) so this middleware only
  // runs on user-facing page routes.
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
