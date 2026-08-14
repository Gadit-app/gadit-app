import type { NextConfig } from "next";
import path from "node:path";

/**
 * First-party Affonso proxy.
 *
 * Without this, the Affonso pixel and embedded dashboard load from
 * `cdn.affonso.io` / `affonso.io`, which are on the block lists of
 * uBlock Origin, Brave Shields, Safari Private Browsing and the
 * standard Firefox Tracking Protection. Affiliates lose referral
 * attribution and the embedded dashboard fails to render for any
 * visitor with default privacy settings.
 *
 * Routing every Affonso request through gadit.app makes the browser
 * see only first-party traffic, so blockers don't fire. Setup per
 * https://affonso.io/help/installation-guides/overview/first-party-delivery
 *
 * Reserved path prefix: /r/  (must not collide with any app route).
 * The Affonso pixel's `data-api-base="/r"` attribute (set in
 * layout.tsx) tells the script to call /r/track and /r/signups,
 * matching the rewrites below.
 */
const AFFONSO_REWRITES = [
  // Pixel script + its psl dependency.
  { source: "/r/pixel.js",   destination: "https://cdn.affonso.io/js/pixel.min.js" },
  { source: "/r/psl.min.js", destination: "https://cdn.affonso.io/js/psl.min.js" },
  // Tracking API endpoints the pixel calls.
  { source: "/r/track",   destination: "https://api.affonso.io/v1/track" },
  { source: "/r/signups", destination: "https://api.affonso.io/v1/signups" },
  // Embedded dashboard iframe and anything Affonso fetches under it.
  { source: "/r/embed/:path*", destination: "https://affonso.io/embed/:path*" },
];

/**
 * Firebase Auth same-origin proxy.
 *
 * Firebase's default authDomain is `gadit-app.firebaseapp.com`, a
 * DIFFERENT origin from www.gadit.app. Google sign-in via redirect then
 * bounces through firebaseapp.com, which breaks in two ways: (1) browsers
 * blocking third-party cookies, and (2) once the Android TWA is installed
 * and verifies gadit.app, Android hijacks the OAuth return to www.gadit.app
 * into the app, so sign-in fails both inside the TWA and in mobile Chrome
 * while the TWA is installed (Gadi confirmed 2026-08-15: uninstalling the
 * TWA fixed web login).
 *
 * These rewrites serve Firebase's auth handler from www.gadit.app itself
 * (same origin), per Firebase's "authenticate with a custom domain" guide.
 * They are INERT until NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is flipped to
 * www.gadit.app — with the default firebaseapp.com authDomain nothing calls
 * www.gadit.app/__/auth, so adding them changes no current behaviour.
 * Activation (env flip) must be tested carefully: desktop first, then TWA.
 */
const FIREBASE_AUTH_REWRITES = [
  { source: "/__/auth/:path*", destination: "https://gadit-app.firebaseapp.com/__/auth/:path*" },
  { source: "/__/firebase/:path*", destination: "https://gadit-app.firebaseapp.com/__/firebase/:path*" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  // Build id baked into the client bundle so the running app can tell when
  // a newer deploy exists and reload itself (see AutoUpdater + /api/version).
  // On Vercel this is the commit SHA, unique per deploy.
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
  },
  async rewrites() {
    return [...AFFONSO_REWRITES, ...FIREBASE_AUTH_REWRITES];
  },
};

export default nextConfig;
