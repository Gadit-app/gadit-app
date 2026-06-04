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

const SUPPORTED_LANGS = new Set(["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first || !SUPPORTED_LANGS.has(first)) {
    return NextResponse.next();
  }

  const remainder = segments.slice(1).join("/");
  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = remainder ? `/${remainder}` : "/";

  // Pass the lang as a request header so layout's generateMetadata
  // can read it during SSR — important for OG-image / og:description
  // generation when a social-card crawler fetches a /he/… URL with
  // no cookie. Cookie is also set for the user's subsequent
  // (in-browser) requests so the client-side LangProvider picks it up.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-gadit-lang", first);

  const res = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  res.cookies.set("gadit-lang", first, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  return res;
}

export const config = {
  // Skip Next internals, the API, static assets, and any file with an
  // extension (favicon.ico, robots.txt, etc.) so this middleware only
  // runs on user-facing page routes.
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
