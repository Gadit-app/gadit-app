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
const BLOCKED_IN_PLAY = new Set(["pricing", "checkout", "families", "individuals", "schools", "renew"]);

// ── Purchase host: https://gadit.app (no www) ───────────────────────
// The Play app (TWA) claims ONLY www.gadit.app (twa/twa-manifest.json), so on
// a phone with the app installed every www link, from an email, WhatsApp or
// even Chrome, opens the app, where nothing may be sold (Gadi 2026-10-06,
// Johanna could not pay). The bare domain is not claimed: it always opens in
// the browser. So purchase links point at gadit.app (lib/pay-url.ts), which
// serves ONLY the purchase surfaces below, never in Play mode, never indexed;
// any other page on it goes back to www.
const PAY_HOST = "gadit.app";
// "auth": the emailed sign-in link and the session bridge must also work
// on this host (2026-10-10).
const PAY_ROUTES = new Set(["pricing", "checkout", "families", "individuals", "schools", "renew", "account", "auth"]);

function detectPlay(req: NextRequest): boolean {
  if (req.nextUrl.searchParams.get("src") === "play") return true;
  if ((req.headers.get("referer") || "").startsWith("android-app://")) return true;
  return req.cookies.get(PLAY_COOKIE)?.value === "1";
}

export function middleware(req: NextRequest) {
  const payHost = (req.headers.get("host") || "").split(":")[0] === PAY_HOST;
  if (payHost) {
    const segs = req.nextUrl.pathname.split("/").filter(Boolean);
    const routeFirst = segs[0] && SUPPORTED_LANGS.has(segs[0]) ? segs[1] : segs[0];
    if (!routeFirst || !PAY_ROUTES.has(routeFirst)) {
      const www = req.nextUrl.clone();
      www.host = "www.gadit.app";
      www.port = "";
      return NextResponse.redirect(www, 308);
    }
  }
  const res = route(req, payHost);
  if (payHost) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function route(req: NextRequest, payHost: boolean): NextResponse {
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

  // One URL per word: the definition is stored lowercased, so /word/Water and
  // /word/water are the same page. 301 mixed case to lowercase (SEO plan,
  // Gadi 2026-10-06) so search engines keep one version.
  {
    const wi = segments[0] === "word" ? 1 : SUPPORTED_LANGS.has(first ?? "") && segments[1] === "word" ? 2 : -1;
    if (wi > 0 && segments.length === wi + 1) {
      const raw = decodedPath.split("/").filter(Boolean)[wi];
      if (raw && raw !== raw.toLowerCase()) {
        const lower = req.nextUrl.clone();
        lower.pathname = "/" + [...segments.slice(0, wi), encodeURIComponent(raw.toLowerCase())].join("/");
        return NextResponse.redirect(lower, 301);
      }
    }
  }

  // Play mode: sticky cookie + block purchase surfaces server-side (never a
  // client-only hide — the price must not exist in the HTML the reviewer gets).
  const playMode = !payHost && detectPlay(req);
  if (playMode) {
    const langPrefixed = !!first && SUPPORTED_LANGS.has(first);
    const routeFirst = langPrefixed ? segments[1] : first;
    if (routeFirst && BLOCKED_IN_PLAY.has(routeFirst)) {
      // A link someone was SENT (WhatsApp, email) opens inside the app on a
      // phone that has it, and used to land on the home page instead (Gadi
      // 2026-10-10: shared landing pages would not open for app users). Only
      // a click inside the app itself carries a www referrer; anything else
      // came from outside, so hand it to the purchase host, which the app
      // does not claim and the phone opens in the browser. Nothing is sold
      // inside the app: in-app clicks still go home below.
      const ref = req.headers.get("referer") || "";
      if (!ref.startsWith("https://www.gadit.app")) {
        const pay = req.nextUrl.clone();
        pay.protocol = "https:";
        pay.host = PAY_HOST;
        pay.port = "";
        pay.searchParams.delete("src");
        return NextResponse.redirect(pay, 307);
      }
      const home = req.nextUrl.clone();
      home.pathname = langPrefixed ? `/${first}` : "/";
      // Remember where this request was going: a NORMAL browser tab that only
      // inherited the app's cookie clears it client-side and goes back there
      // (see the Play-mode script in layout.tsx). Inside the app it is unused.
      home.search = `?from=${encodeURIComponent(pathname + req.nextUrl.search)}`;
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
