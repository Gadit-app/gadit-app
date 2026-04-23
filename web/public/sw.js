// Gadit service worker — minimal, install-friendly.
// Strategy:
//   - Static assets (icons, manifest, fonts via google): cache-first.
//   - HTML pages: network-first, fall back to cache (and finally to /offline.html).
//   - Everything else (API/dynamic): network only — never cache user data.

const CACHE_VERSION = "gadit-v2";
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
