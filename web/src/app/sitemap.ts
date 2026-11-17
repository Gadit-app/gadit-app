import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { LANGUAGES } from "@/lib/i18n";

const BASE = "https://www.gadit.app";

// Rebuilt at most once a day (one Firestore read of the cache index).
export const revalidate = 86400;
const ALL_LANGS: string[] = LANGUAGES.map((l) => l.code);

/** URL for a path in a given UI language. English is the unprefixed canonical
 *  surface (mirrors buildHref); every other language gets a /<lang> prefix.
 *  The homepage is the bare prefix with no trailing slash, the same URL as the
 *  page's own canonical ("/he/" redirects to "/he"). */
function langUrl(path: string, l: string): string {
  const rest = path === "/" ? "" : path;
  return l === "en" ? `${BASE}${rest || "/"}` : `${BASE}/${l}${rest}`;
}

/** hreflang alternates for a multilingual path — declares every language
 *  variant so Google indexes each in its own market instead of treating the
 *  non-English pages as duplicates of the English one. The pages already send
 *  matching self-canonical + hreflang tags (see word/[word] generateMetadata);
 *  listing them here lets crawlers discover all 33 variants from the sitemap
 *  rather than one language at a time. */
function alternatesFor(path: string): { languages: Record<string, string> } {
  return {
    languages: {
      ...Object.fromEntries(ALL_LANGS.map((l) => [l, langUrl(path, l)])),
      "x-default": langUrl(path, "en"),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages. The consumer-facing ones are localized into every UI
  // language, so they carry hreflang alternates; the legal pages stay
  // English-only. Each language version is its own entry (Gadi 2026-11-17,
  // SEO audit): with only the English URL listed, Google had never heard of
  // /he/families or /he/individuals ("URL is unknown to Google").
  const localizedStatic: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/families", changeFrequency: "monthly", priority: 0.9 },
    { path: "/individuals", changeFrequency: "monthly", priority: 0.8 },
    { path: "/features", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
    { path: "/schools", changeFrequency: "monthly", priority: 0.7 },
    { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
    { path: "/words", changeFrequency: "weekly", priority: 0.6 },
    { path: "/help", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  ];
  // The /words hub lists a language's own words: in a language with only a
  // handful of them it is a near-empty page, so it is listed only from
  // WORDS_HUB_MIN words up (every language if the word list failed).
  const WORDS_HUB_MIN = 30;
  const wordsPerLang = new Map<string, number>();
  const staticEntries = (): MetadataRoute.Sitemap => [
    ...localizedStatic.flatMap((s) => {
      const alternates = alternatesFor(s.path);
      const langs =
        s.path === "/words" && wordsPerLang.size > 0
          ? ALL_LANGS.filter((l) => (wordsPerLang.get(l) ?? 0) >= WORDS_HUB_MIN)
          : ALL_LANGS;
      return langs.map((l) => ({
        url: langUrl(s.path, l),
        changeFrequency: s.changeFrequency,
        priority: s.priority,
        alternates,
      }));
    }),
    { url: `${BASE}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  // Pull every cached word — those are the words our system already understands
  // and rendered for at least one user. Best signal of "real, useful pages".
  //
  // Junk filter (GSC "Soft 404" report, 2026-07-03 email): the cache
  // holds every string a user ever submitted, including typos, pasted
  // URLs, numbers, and 50-char gibberish. Those render a "couldn't
  // define" state that Google rightly classifies as a soft 404 and
  // they drag the whole sitemap's credibility down. Keep only strings
  // that look like words or short phrases.
  const looksLikeWord = (w: string): boolean => {
    if (w.length < 2 || w.length > 40) return false;
    if (/https?:|www\.|@|\//.test(w)) return false;      // URLs, emails, paths
    if (/^\d+$/.test(w)) return false;                    // pure numbers
    if (/[<>{}[\]()=+*_#~^|\\]/.test(w)) return false;    // code/markup chars
    const letters = Array.from(w).filter((ch) => /\p{L}/u.test(ch)).length;
    if (letters / w.length < 0.6) return false;           // mostly non-letters
    if (w.split(/\s+/).length > 4) return false;          // whole sentences
    return true;
  };

  // Word pages: ONLY (language, word) pairs that really serve a definition,
  // i.e. have a public cache doc auto2_<lang>_base_<word> (the same doc the
  // word page server-renders; without it the page is noindex). Gadi
  // 2026-10-06: the old list re-emitted every cached word in all 33 languages,
  // ~104k URLs of which ~92% were noindex empty pages. Each pair is listed
  // once under its own language, lowercased, with hreflang only between the
  // languages that exist for that word.
  let wordEntries: MetadataRoute.Sitemap = [];
  try {
    const FieldPath = (await import("firebase-admin/firestore")).FieldPath;
    const snap = await getAdminDb()
      .collection("cache")
      .where(FieldPath.documentId(), ">=", "auto2_")
      .where(FieldPath.documentId(), "<", "auto2`")
      .select("indexOk")
      .get();
    const langSet = new Set(ALL_LANGS);
    const byWord = new Map<string, string[]>();
    for (const doc of snap.docs) {
      const m = doc.id.match(/^auto2_(.+?)_base_(.+)$/);
      // Only words vetted as real (indexOk): no gibberish or private names.
      if (!m || !langSet.has(m[1]) || doc.get("indexOk") !== true) continue;
      const word = m[2].trim().toLowerCase();
      if (!looksLikeWord(word)) continue;
      const langs = byWord.get(word) ?? [];
      if (!langs.includes(m[1])) langs.push(m[1]);
      byWord.set(word, langs);
    }
    for (const [word, langs] of byWord) {
      const path = `/word/${encodeURIComponent(word)}`;
      const alternates =
        langs.length > 1
          ? {
              languages: {
                ...Object.fromEntries(langs.map((l) => [l, langUrl(path, l)])),
                ...(langs.includes("en") ? { "x-default": langUrl(path, "en") } : {}),
              },
            }
          : undefined;
      for (const l of langs) {
        wordsPerLang.set(l, (wordsPerLang.get(l) ?? 0) + 1);
        wordEntries.push({
          url: langUrl(path, l),
          changeFrequency: "monthly",
          priority: 0.6,
          ...(alternates ? { alternates } : {}),
        });
      }
    }
  } catch (e) {
    console.error("sitemap word enumeration failed:", e);
    wordEntries = [];
    wordsPerLang.clear();
  }

  return [...staticEntries(), ...wordEntries];
}
