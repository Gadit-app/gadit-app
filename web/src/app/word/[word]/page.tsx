import type { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { getAdminDb } from "@/lib/firebase-admin";
import type { WordResult } from "@/components/design/result";
import { WordClient } from "./WordClient";
import { LANGUAGES } from "@/lib/i18n";
import { sanitizeDegenerateEtymology } from "@/lib/define-guard";
import { wordTitle } from "@/lib/word-title";
import { WordLinks } from "./WordLinks";

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

/** The UI languages that have a public definition of this word (a base cache
 *  doc), so hreflang points only at pages that really show it. One batched
 *  read, field-masked to a single small field. */
const getLangsWithDefinition = cache(async (word: string): Promise<string[]> => {
  try {
    const db = getAdminDb();
    const w = word.toLowerCase().trim();
    const refs = ALL_LANGS.map((l) => db.collection("cache").doc(`auto2_${l}_base_${w}`));
    const snaps = await db.getAll(...refs, { fieldMask: ["indexOk"] });
    return ALL_LANGS.filter((_, i) => snaps[i]?.exists && snaps[i].get("indexOk") !== false);
  } catch (e) {
    console.error("word hreflang lookup failed:", e);
    return [];
  }
});

export async function generateMetadata(
  {
    params,
    searchParams,
  }: {
    params: Promise<{ word: string }>;
    searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
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
  // Lowercase: the definition is stored lowercased, so /word/Water and
  // /word/water are one page (middleware 301s mixed case to lowercase).
  const wordEnc = encodeURIComponent(decoded.toLowerCase());
  const BASE = "https://www.gadit.app";
  const urlForLang = (l: string) =>
    l === "en" ? `${BASE}/word/${wordEnc}` : `${BASE}/${l}/word/${wordEnc}`;

  // hreflang only between languages that really show this word (SEO plan,
  // Gadi 2026-10-06); a noindex page declares none.
  const langs = preloaded ? await getLangsWithDefinition(decoded) : [];
  const canonical = urlForLang(urlLang);
  const prevOg = (await parent).openGraph;
  // Localized search title (lib/word-title.ts); "{word}, Gadit" without a
  // definition or in a language whose wording is not approved yet.
  const title = wordTitle(lang, decoded, preloaded as unknown as { language?: unknown; translation?: unknown; titleTranslationOk?: unknown } | null);

  return {
    title,
    description,
    // Without a saved definition the page has nothing to show a crawler (it
    // is not generated for bots), so Google must not index an empty card.
    // A word vetted as gibberish or a private name (indexOk false) is
    // served but not indexed.
    ...(preloaded && (preloaded as { indexOk?: unknown }).indexOk !== false ? {} : { robots: { index: false, follow: true } }),
    alternates: {
      canonical,
      ...(langs.length > 1
        ? {
            languages: {
              ...Object.fromEntries(langs.map((l) => [l, urlForLang(l)])),
              ...(langs.includes("en") ? { "x-default": urlForLang("en") } : {}),
            },
          }
        : {}),
    },
    // og:url = the canonical, og:title = the word (the layout's were the
    // generic site ones); keep the site image.
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Gadit",
      type: "website",
      ...(prevOg?.images ? { images: prevOg.images } : {}),
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
  // Structured data for a page that shows a real definition: the word as a
  // DefinedTerm in Gadit's term set (helps search and answer engines read it).
  const firstMeaning =
    (preloaded?.meanings?.[0] as { meaning?: string } | undefined)?.meaning?.trim() ?? "";
  const ld = preloaded && firstMeaning
    ? {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: decoded,
        description: firstMeaning,
        inLanguage: lang,
        url: `https://www.gadit.app${lang === "en" ? "" : `/${lang}`}/word/${encodeURIComponent(decoded.toLowerCase())}`,
        inDefinedTermSet: { "@type": "DefinedTermSet", name: "Gadit", url: "https://www.gadit.app" },
      }
    : null;
  return (
    <>
    {ld && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, String.fromCharCode(92) + "u003c") }}
      />
    )}
    <WordClient
      initialWord={decoded}
      initialResult={preloaded}
      preloadLang={lang}
    />
    {preloaded && <WordLinks lang={lang} word={decoded} langs={await getLangsWithDefinition(decoded)} />}
    </>
  );
}
