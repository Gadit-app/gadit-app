"use client";

/**
 * IndexedDB-backed offline storage for word results.
 *
 * Why IDB and not the Service Worker cache: SW cache is good for static
 * assets, but Gadit's /api/define is a Server-Sent Events stream. Caching
 * SSE responses and replaying them is fiddly and brittle. IDB stores the
 * final word-result JSON directly, keyed by (lang, word), so reading it
 * back is just a get(key) — no stream replay needed.
 *
 * Used by: WordClient (write on every successful render, read on load
 * before any network attempt). When the user is offline AND the word is
 * in IDB, the page renders without ever pinging the network.
 *
 * Tier policy: only Clear/Deep users write to / read from IDB. Basic users
 * see no offline behavior — that's a paid feature. The gate lives in
 * WordClient (the caller), not in this module, so the API stays simple.
 *
 * Quota: browsers typically allow up to ~50% of disk for IDB but throttle
 * earlier on small devices. Each word result is ~3–8 KB of JSON. 2,000
 * words ≈ ~10 MB, comfortably below any threshold. We don't actively prune
 * for V1; will revisit if anyone hits a limit.
 */

const DB_NAME = "gadit-offline";
const DB_VERSION = 1;
const STORE_WORDS = "words";

export type CachedWordResult = {
  /** Composite key: `${lang}:${word.toLowerCase()}`. Stored as the
   *  IDB primary key for direct lookup. */
  key: string;
  /** The user's UI language at time of caching — used to scope a
   *  per-lang cache so "love" defined in English ≠ "love" defined in
   *  Spanish. */
  lang: string;
  /** The word as the user searched it (preserves original casing for
   *  display; the key is lowercased for lookup). */
  word: string;
  /** Full word-result JSON. Shape mirrors WordResult in
   *  components/design/result.tsx. */
  result: unknown;
  /** When this entry was first written. Used to age out entries if
   *  we ever add a max-age policy. */
  savedAt: number;
  /** Last time this entry was opened — used to surface a recent-list
   *  in the offline study UI. */
  lastViewedAt: number;
  /** Was this word explicitly "downloaded for study", or did it just
   *  get auto-cached from a normal view? Marked items survive any
   *  future auto-prune logic. */
  pinned: boolean;
};

function isSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_WORDS)) {
        const store = db.createObjectStore(STORE_WORDS, { keyPath: "key" });
        store.createIndex("by_savedAt", "savedAt", { unique: false });
        store.createIndex("by_lastViewedAt", "lastViewedAt", { unique: false });
        store.createIndex("by_lang", "lang", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function makeKey(lang: string, word: string): string {
  return `${lang}:${word.trim().toLowerCase()}`;
}

/**
 * Look up a previously-cached word. Returns null if not cached or if
 * IDB isn't available (private browsing, very old browser).
 *
 * Read path is fire-and-forget safe: any IDB error resolves to null so
 * the caller falls through to a normal network fetch.
 */
export async function getCachedWord(
  lang: string,
  word: string,
): Promise<CachedWordResult | null> {
  if (!isSupported()) return null;
  try {
    const db = await openDB();
    return await new Promise<CachedWordResult | null>((resolve) => {
      const tx = db.transaction(STORE_WORDS, "readonly");
      const store = tx.objectStore(STORE_WORDS);
      const req = store.get(makeKey(lang, word));
      req.onsuccess = () => resolve((req.result as CachedWordResult) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Write a word result to IDB. Updates lastViewedAt on every call so the
 * recently-viewed UI stays fresh, but preserves savedAt and pinned status
 * from any existing entry.
 */
export async function setCachedWord(
  lang: string,
  word: string,
  result: unknown,
  opts: { pinned?: boolean } = {},
): Promise<void> {
  if (!isSupported()) return;
  try {
    const db = await openDB();
    const existing = await getCachedWord(lang, word);
    const now = Date.now();
    const entry: CachedWordResult = {
      key: makeKey(lang, word),
      lang,
      word,
      result,
      savedAt: existing?.savedAt ?? now,
      lastViewedAt: now,
      pinned: opts.pinned ?? existing?.pinned ?? false,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_WORDS, "readwrite");
      const store = tx.objectStore(STORE_WORDS);
      const req = store.put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("[offline-db] setCachedWord failed:", e);
  }
}

/**
 * Toggle the "pinned" flag — used by the "download for offline study"
 * button. Pinned entries are protected from any future auto-prune.
 */
export async function setPinned(
  lang: string,
  word: string,
  pinned: boolean,
): Promise<void> {
  if (!isSupported()) return;
  const existing = await getCachedWord(lang, word);
  if (!existing) return;
  await setCachedWord(lang, word, existing.result, { pinned });
}

/**
 * Drop a single entry. Used by the "remove from offline" affordance.
 */
export async function removeCachedWord(lang: string, word: string): Promise<void> {
  if (!isSupported()) return;
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_WORDS, "readwrite");
      const store = tx.objectStore(STORE_WORDS);
      const req = store.delete(makeKey(lang, word));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("[offline-db] removeCachedWord failed:", e);
  }
}

/**
 * List the N most-recently-viewed cached entries — drives the offline
 * "your downloaded words" view. Ordered newest first.
 */
export async function listRecentCached(limit = 200): Promise<CachedWordResult[]> {
  if (!isSupported()) return [];
  try {
    const db = await openDB();
    return await new Promise<CachedWordResult[]>((resolve) => {
      const out: CachedWordResult[] = [];
      const tx = db.transaction(STORE_WORDS, "readonly");
      const store = tx.objectStore(STORE_WORDS);
      const index = store.index("by_lastViewedAt");
      // openCursor "prev" → descending: newest first.
      const cursorReq = index.openCursor(null, "prev");
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor || out.length >= limit) {
          resolve(out);
          return;
        }
        out.push(cursor.value as CachedWordResult);
        cursor.continue();
      };
      cursorReq.onerror = () => resolve(out);
    });
  } catch {
    return [];
  }
}

/**
 * Cheap summary for the Account / Notebook UIs: how many words does the
 * user have available offline?
 */
export async function countCached(): Promise<number> {
  if (!isSupported()) return 0;
  try {
    const db = await openDB();
    return await new Promise<number>((resolve) => {
      const tx = db.transaction(STORE_WORDS, "readonly");
      const store = tx.objectStore(STORE_WORDS);
      const req = store.count();
      req.onsuccess = () => resolve(Number(req.result ?? 0));
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
