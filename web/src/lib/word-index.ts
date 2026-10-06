import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Per-language index of the words that have a public definition (a base
 * cache doc, auto2_<lang>_base_<word>), for links between word pages and the
 * "all words" hub (SEO plan item 6, Gadi 2026-10-06). Word pages were orphans:
 * search engines could reach them only through the sitemap.
 *
 * One field-masked read per language, kept in memory for an hour per server
 * instance.
 */

const TTL = 60 * 60 * 1000;
const memo = new Map<string, { at: number; words: string[] }>();

export async function wordIndex(lang: string): Promise<string[]> {
  const hit = memo.get(lang);
  if (hit && Date.now() - hit.at < TTL) return hit.words;
  const prefix = `auto2_${lang}_base_`;
  try {
    const snap = await getAdminDb()
      .collection("cache")
      .where(FieldPath.documentId(), ">=", prefix)
      .where(FieldPath.documentId(), "<", `${prefix}`)
      .select()
      .get();
    const words = snap.docs
      .map((d) => d.id.slice(prefix.length))
      .filter((w) => w.length >= 2 && w.length <= 40 && !/https?:|www\.|@|\/|\d/.test(w))
      .sort((a, b) => a.localeCompare(b, lang));
    memo.set(lang, { at: Date.now(), words });
    return words;
  } catch (e) {
    console.error("word index read failed:", e);
    return hit?.words ?? [];
  }
}

/** Up to n words next to this one in the language's alphabetical index. */
export async function neighbourWords(lang: string, word: string, n = 12): Promise<string[]> {
  const words = await wordIndex(lang);
  if (!words.length) return [];
  const w = word.toLowerCase().trim();
  let i = words.findIndex((x) => x.localeCompare(w, lang) >= 0);
  if (i < 0) i = words.length;
  const start = Math.max(0, Math.min(i - Math.floor(n / 2), words.length - n - 1));
  return words.slice(start, start + n + 1).filter((x) => x !== w).slice(0, n);
}
