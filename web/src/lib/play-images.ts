import { getAdminDb } from "@/lib/firebase-admin";
import { toAmerican } from "@/lib/spelling-variant";

/**
 * The cached picture of English words, read only (never draws). Shared by
 * /api/play/images (the flash cards and picture games) and the niqqud door
 * of מילים פולשות (/api/invaders?door=niqqud).
 */

/** The picture game's order: its own pictures first; older styles left out. */
function pickRank(docId: string): number {
  if (docId.startsWith("img_pick_kids_")) return 0;
  if (docId.startsWith("img_cls2_kids_")) return 1;
  return docId.startsWith("img_cls") ? 2 : 99;
}

function rank(docId: string): number {
  if (docId.startsWith("img_cls2_kids_")) return 0;
  // The Homework picture game's kids pictures are the same house style.
  if (docId.startsWith("img_cls") || docId.startsWith("img_pick_kids_")) return 1;
  if (docId.startsWith("img_kids_")) return 2;
  return 3;
}

/** { word: url } for the words that have a picture. `pick`: house-style pictures only, the picture game's own first. */
export async function lookupImages(words: string[], opts: { pick: boolean }): Promise<Record<string, string>> {
  // The cache stores the word as it was looked up; ask for it as given,
  // lowercased and in American spelling (a British "colour" in the games is
  // the bank's "color", lib/spelling-variant), then answer under the
  // caller's spelling.
  const us = (w: string) => toAmerican(w.toLowerCase());
  const variants = [...new Set(words.flatMap((w) => [w, w.toLowerCase(), us(w)]))];
  const best = new Map<string, { url: string; r: number }>();
  const db = getAdminDb();
  try {
    for (let i = 0; i < variants.length; i += 30) {
      const snap = await db.collection("imageCache").where("word", "in", variants.slice(i, i + 30)).get();
      for (const d of snap.docs) {
        const x = d.data() as { word?: string; url?: string };
        if (!x.url || !x.word) continue;
        const k = x.word.trim().toLowerCase();
        const r = opts.pick ? pickRank(d.id) : rank(d.id);
        if (r === 99) continue;
        const cur = best.get(k);
        if (!cur || r < cur.r) best.set(k, { url: x.url, r });
      }
    }
  } catch (e) {
    console.error("[play/images]", e);
  }
  const images: Record<string, string> = {};
  for (const w of words) {
    const hit = best.get(w.toLowerCase()) ?? best.get(us(w));
    if (hit) images[w] = hit.url;
  }
  return images;
}
