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

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  async rewrites() {
    return AFFONSO_REWRITES;
  },
};

export default nextConfig;
