/**
 * lang-pack — text that is split into one file per language, so the browser
 * downloads only the language on screen (2026-10-31: the home page carried
 * ~940KB of text in all 41 languages).
 *
 * A pack holds the languages loaded so far. English is always loaded (it is
 * the fallback). Other languages come from their own small chunk:
 *  - in the browser, LangProvider waits for the current language before it
 *    hydrates, and loads a new one before switching to it;
 *  - on the server, lang-packs-all.ts installs every language up front for
 *    server code that renders any language (metadata, emails).
 */

import { use } from "react";

export type PackLoader<V> = () => Promise<{ default: V }>;

export interface Pack<V> {
  data: Record<string, V | undefined>;
  loaders: Record<string, PackLoader<V> | undefined>;
  pending: Record<string, Promise<void> | undefined>;
}

export function makePack<V>(data: Record<string, V>, loaders: Record<string, PackLoader<V>>): Pack<V> {
  return { data: { ...data }, loaders, pending: {} };
}

/** True when the language is loaded, or has no file of its own (reads English). */
export function packReady<V>(p: Pack<V>, lang: string): boolean {
  return p.data[lang] !== undefined || !p.loaders[lang];
}

/** Load one language. Never rejects: on a network error the text stays English and a later call retries. */
export function loadPack<V>(p: Pack<V>, lang: string): Promise<void> {
  if (packReady(p, lang)) return Promise.resolve();
  const existing = p.pending[lang];
  if (existing) return existing;
  const job = p.loaders[lang]!()
    .then((m) => { p.data[lang] = m.default; })
    .catch(() => { p.pending[lang] = undefined; });
  p.pending[lang] = job;
  return job;
}

/** Install a language that is already in memory (server side). */
export function installPack<V>(p: Pack<V>, lang: string, value: V): void {
  if (p.data[lang] === undefined) p.data[lang] = value;
}

const WAITS = new Map<string, { promise: Promise<void>; settled: boolean }>();
const PACK_IDS = new WeakMap<object, number>();
let nextPackId = 0;
const packId = (p: object) => {
  let id = PACK_IDS.get(p);
  if (id === undefined) PACK_IDS.set(p, (id = nextPackId++));
  return id;
};

/**
 * Suspend the calling component until these packs have the language. Call it
 * only from a small gate component with no hooks of its own: waiting inside a
 * component that already holds state breaks React's replay (minified error 467).
 * After one failed try (offline) it stops waiting and the text reads English,
 * so the page never hangs.
 */
export function useLangPacks(packs: Pack<unknown>[], lang: string): void {
  if (packs.every((p) => packReady(p, lang))) return;
  const key = packs.map(packId).join(",") + ":" + lang;
  let w = WAITS.get(key);
  if (!w) {
    const entry = { promise: Promise.resolve(), settled: false };
    entry.promise = Promise.all(packs.map((p) => loadPack(p, lang))).then(() => { entry.settled = true; });
    WAITS.set(key, (w = entry));
  }
  if (w.settled) return;
  use(w.promise);
}
