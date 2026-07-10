// Gadit service worker — minimal, install-friendly.
// Strategy:
//   - Static assets (icons, manifest, fonts via google): cache-first.
//   - HTML pages: network-first, fall back to cache.
//   - /api/: never touched — word definitions are cached in IndexedDB
//     (see src/lib/offline-db.ts) which the WordClient reads on its own.
//
// The offline word lookup itself happens in the React layer, NOT here:
// when fetch('/api/define') fails, WordClient.run() falls back to the
// IDB-backed offline cache and renders from there. Service worker's
// only job is to keep the app shell installable and the page-load
// network-fallback chain.

// Bump the version to nuke client caches when a previously-served
// bundle has a bug. Gary (2026-06-29, iPhone 13 Pro / iOS 16.1.1)
// reported the search, sign-in, and burger menu all silently failing —
// classic stale-JS-in-SW symptom. v3 → v4 forces every browser to
// wipe its v3 caches and refetch fresh JS on the next visit.
// v4 → v5 (2026-06-29 evening): Gadi flagged that the script-match
// distractor fix wasn't landing on his device — the SW was serving
// the pre-fix bundle. Bump wipes it.
const CACHE_VERSION = "gadit-v19";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_URLS = [
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-192-maskable.png",
  "/icon-512-maskable.png",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((e) => console.warn("[sw] precache failed", e))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET — never cache POST/PUT/DELETE.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never touch API or webhooks — always live.
  if (url.pathname.startsWith("/api/")) return;

  // Skip cross-origin (Firebase, Stripe, OpenAI, Google fonts, etc.) — let the
  // network handle them. We only cache same-origin assets.
  if (url.origin !== self.location.origin) return;

  // Cache-first for static asset extensions.
  const isStaticAsset = /\.(png|jpe?g|svg|webp|ico|woff2?|ttf|otf|css|js|json)$/i.test(
    url.pathname
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
              return res;
            })
            .catch(() => cached)
      )
    );
    return;
  }

  // Network-first for HTML page navigations.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) =>
              cached ||
              caches
                .match("/")
                .then(
                  (root) =>
                    root ||
                    new Response(
                      "<h1>Offline</h1><p>You appear to be offline.</p>",
                      { headers: { "Content-Type": "text/html" } }
                    )
                )
          )
        )
    );
  }
});
