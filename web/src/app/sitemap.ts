import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";

const BASE = "https://www.gadit.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/features`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/schools`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/partners`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
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
      wordEntries.push({
        url: `${BASE}/word/${encodeURIComponent(word)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch (e) {
    console.error("sitemap word enumeration failed:", e);
    wordEntries = [];
  }

  return [...staticEntries, ...wordEntries];
}
