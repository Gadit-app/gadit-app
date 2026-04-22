import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase-admin";

const BASE = "https://www.gadit.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/pricing`, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Pull every cached word — those are the words our system already understands
  // and rendered for at least one user. Best signal of "real, useful pages".
  let wordEntries: MetadataRoute.Sitemap = [];
  try {
    const snap = await getAdminDb().collection("cache").select("word").limit(5000).get();
    const seen = new Set<string>();
    for (const doc of snap.docs) {
      const word = (doc.data().word as string | undefined)?.trim();
      if (!word || seen.has(word)) continue;
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
