import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";
import { LANGUAGES } from "@/lib/i18n";

const BASE = "https://www.gadit.app";
const ALL_LANGS: string[] = LANGUAGES.map((l) => l.code);

/** URL for a path in a given UI language. English is the unprefixed canonical
 *  surface (mirrors buildHref); every other language gets a /<lang> prefix. */
function langUrl(path: string, l: string): string {
  return l === "en" ? `${BASE}${path}` : `${BASE}/${l}${path}`;
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
  // Static pages. The consumer-facing ones are localized into all 33 languages,
  // so they carry hreflang alternates; the legal pages stay English-only.
  const localizedStatic: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/features", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
    { path: "/schools", changeFrequency: "monthly", priority: 0.7 },
    { path: "/partners", changeFrequency: "monthly", priority: 0.5 },
  ];
  const staticEntries: MetadataRoute.Sitemap = [
    ...localizedStatic.map((s) => ({
      url: langUrl(s.path, "en"),
      changeFrequency: s.changeFrequency,
      priority: s.priority,
      alternates: alternatesFor(s.path),
    })),
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

  let wordEntries: MetadataRoute.Sitemap = [];
  try {
    const snap = await getAdminDb().collection("cache").select("word").limit(5000).get();
    const seen = new Set<string>();
    for (const doc of snap.docs) {
      const word = (doc.data().word as string | undefined)?.trim();
      if (!word || seen.has(word) || !looksLikeWord(word)) continue;
      seen.add(word);
      const path = `/word/${encodeURIComponent(word)}`;
      wordEntries.push({
        url: langUrl(path, "en"),
        changeFrequency: "monthly",
        priority: 0.6,
        // Each word page exists in all 33 languages and is self-canonical per
        // language; declare the alternates so every market's version is found.
        alternates: alternatesFor(path),
      });
    }
  } catch (e) {
    console.error("sitemap word enumeration failed:", e);
    wordEntries = [];
  }

  return [...staticEntries, ...wordEntries];
}
