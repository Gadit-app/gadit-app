import type { Metadata } from "next";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase-admin";
import type { WordResult } from "@/components/design/result";
import { WordClient } from "./WordClient";

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

const ALL_LANGS = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am"];

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
      return data as unknown as WordResult;
    } catch (e) {
      console.error("word preload cache read failed:", e);
      return null;
    }
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ word: string }>;
}): Promise<Metadata> {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
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
    : `Meanings, examples, etymology, and idioms for "${decoded}", in 14 languages.`;
  return {
    title: `${decoded}, Gadit`,
    description,
    alternates: {
      canonical: `https://www.gadit.app/word/${encodeURIComponent(decoded)}`,
    },
  };
}

export default async function WordRoute({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);
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
