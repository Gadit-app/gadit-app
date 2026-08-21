import type { Metadata } from "next";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase-admin";
import type { WordResult } from "@/components/design/result";
import { WordClient } from "./WordClient";
import { LANGUAGES } from "@/lib/i18n";
import { sanitizeDegenerateEtymology } from "@/lib/define-guard";

/**
 * /word/[word] — result screen.
 *
 * Server component resolves the dynamic param (Next 16 makes params a
 * Promise) and hands it to the client, which manages the SSE streaming
 * and renders the result with all attached modals (Compose / Quiz /
 * Report).
 *
 * Indexable: search engines reach individual dictionary URLs and find
 * them useful long-tail traffic ("affect vs effect", "ephemeral
 * meaning Hebrew", etc.). Each /word/X is a publicly viewable page.
 * Pre-launch, this is the single biggest distribution lever we have
 * besides word of mouth.
 *
 * SERVER PRELOAD (launch SEO fix, 2026-07-04): the page previously
 * rendered an empty shell and let the client fetch /api/define, which
 * meters anonymous traffic at 5 searches/day per IP. Googlebot crawls
 * hundreds of word URLs from the same IP range, hit the meter, and saw
 * a quota wall instead of content — GSC classified real words like
 * "domesticated" as Soft 404 (86 pages in the 2026-07-03 report).
 * Now the server reads the SAME Firestore cache the API serves from
 * (anonymous "base" tier, resolved UI language) and passes the result
 * to WordClient, which renders it instantly with no API call. Crawlers
 * get full HTML; anonymous humans get an instant page that doesn't
 * burn their quota. Cache misses and signed-in users keep the exact
 * client flow they had before.
 */

const ALL_LANGS: string[] = LANGUAGES.map((l) => l.code);

/** Next.js already URL-decodes route params, so params.word for /word/%25
 *  arrives as "%". Running decodeURIComponent on that throws "URI malformed"
 *  and trips the error boundary — which is exactly what happened when a user
 *  searched the "%" symbol (Gadi 2026-08-15). Decode defensively: a single
 *  bare "%" or any half-encoded sequence falls back to the raw param, which
 *  is the real word/symbol to define. */
function safeDecodeWord(w: string): string {
  try {
    return decodeURIComponent(w);
  } catch {
    return w;
  }
}

/** The word to define. A `q` query param wins over the path segment: it
 *  carries "dot-segment" searches ("." / "..") that the browser and Vercel
 *  strip out of the path (see wordPath() in lib/href). Otherwise use the
 *  path param. */
async function resolveWord(
  params: Promise<{ word: string }>,
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>,
): Promise<string> {
  const sp = await searchParams;
  const q = Array.isArray(sp?.q) ? sp.q[0] : sp?.q;
  if (typeof q === "string" && q.trim()) return safeDecodeWord(q);
  const { word } = await params;
  return safeDecodeWord(word);
}

/** Resolve the request's UI language exactly like the root layout:
 *  middleware header (URL prefix) → cookie → English. */
async function resolveLang(): Promise<string> {
  const headersList = await headers();
  const cookieStore = await cookies();
  const headerLang = headersList.get("x-gadit-lang");
  const cookieLang = cookieStore.get("gadit-lang")?.value;
  if (headerLang && ALL_LANGS.includes(headerLang)) return headerLang;
  if (cookieLang && ALL_LANGS.includes(cookieLang)) return cookieLang;
  return "en";
}

/** Firestore cache lookup, deduped per request via React cache() so
 *  generateMetadata and the route component share one read. Key format
 *  mirrors /api/define's anonymous path: auto2_<lang>_base_<word>. */
const getPreloadedResult = cache(
  async (word: string, lang: string): Promise<WordResult | null> => {
    try {
      const key = `auto2_${lang}_base_${word.toLowerCase().trim()}`;
      const snap = await getAdminDb().collection("cache").doc(key).get();
      if (!snap.exists) return null;
      const data = snap.data() as Record<string, unknown> | undefined;
      // Same sanity bar the API applies before serving a cache hit:
      // a result with no meanings is not worth preloading.
      if (!data || !Array.isArray(data.meanings) || data.meanings.length === 0) {
        return null;
      }
      // The client /api/define read path runs every cache hit through the
      // degenerate-output guard, but this SSR preload used to hand the raw
      // cache doc straight to render — so a legacy entry with clean
      // meanings but a garbled etymology block (the German "חלום" origin
      // card Gadi hit 2026-08-08) got server-rendered mojibake to both
      // users and Googlebot. Blank any garbled etymology field before
      // serving; OriginCard drops the whole card when every field is empty.
      return sanitizeDegenerateEtymology(data) as unknown as WordResult;
    } catch (e) {
      console.error("word preload cache read failed:", e);
      return null;
    }
  },
);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ word: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const decoded = await resolveWord(params, searchParams);
  const lang = await resolveLang();
  const preloaded = await getPreloadedResult(decoded, lang);
  // When we have the real definition, the meta description is the
  // actual first meaning — far better SERP snippet than the generic
  // boilerplate, and unique per page (Google demotes duplicated
  // descriptions).
  const firstMeaning =
    (preloaded?.meanings?.[0] as { meaning?: string } | undefined)?.meaning?.trim() ?? "";
  const description = firstMeaning
    ? `${decoded}: ${firstMeaning.slice(0, 150)}${firstMeaning.length > 150 ? "…" : ""}`
    : `Meanings, examples, etymology, and idioms for "${decoded}", in 30+ languages.`;

  // Per-language self-canonical + hreflang (GSC fix, 2026-07-19).
  // Previously every language variant canonicalized to the English
  // /word/X, so Google flagged the Hebrew/Arabic/etc. pages as
  // "Duplicate, Google chose a different canonical" and refused to
  // index them in their own markets. Now each language page is
  // canonical to ITSELF and declares hreflang alternates for all
  // languages, so Google indexes each language version for its market.
  // The current language comes from the ACTUAL requested URL prefix
  // (x-gadit-path, set by middleware) — NOT the cookie — so a cookied
  // Hebrew user landing on the unprefixed /word/X still yields the
  // English canonical for that URL.
  const headersList = await headers();
  const rawPath = headersList.get("x-gadit-path") || `/word/${encodeURIComponent(decoded)}`;
  const trimmed = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  const firstSeg = trimmed.split("/").filter(Boolean)[0];
  const urlLang = firstSeg && ALL_LANGS.includes(firstSeg) ? firstSeg : "en";
  const wordEnc = encodeURIComponent(decoded);
  const BASE = "https://www.gadit.app";
  const urlForLang = (l: string) =>
    l === "en" ? `${BASE}/word/${wordEnc}` : `${BASE}/${l}/word/${wordEnc}`;

  return {
    title: `${decoded}, Gadit`,
    description,
    alternates: {
      canonical: urlForLang(urlLang),
      languages: {
        ...Object.fromEntries(ALL_LANGS.map((l) => [l, urlForLang(l)])),
        "x-default": urlForLang("en"),
      },
    },
  };
}

export default async function WordRoute({
  params,
  searchParams,
}: {
  params: Promise<{ word: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const decoded = await resolveWord(params, searchParams);
  const lang = await resolveLang();
  const preloaded = await getPreloadedResult(decoded, lang);
  return (
    <WordClient
      initialWord={decoded}
      initialResult={preloaded}
      preloadLang={lang}
    />
  );
}
