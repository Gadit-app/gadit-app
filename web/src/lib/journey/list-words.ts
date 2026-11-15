import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { isNotFoundMeaning } from "@/lib/not-a-word";

/**
 * The school's words in the fortress (Gadi 2026-11-15; the AI review called
 * it the feature a parent tells another parent about).
 *
 * A child, a parent or a teacher already types this week's words into a list
 * in Homework ("My practice", users/{uid}/dictationSets, custom lists). Those
 * words now also wait in the fortress: the newest lists first, a list of the
 * last three weeks only, so last term's words do not come back.
 *
 * What the question shows:
 *   - a pair (apple / תפוח): the foreign word, with the other side as its meaning;
 *   - one word on both sides (a Hebrew spelling list): the meaning we already
 *     hold for that word in the dictionary cache. Nothing is generated; a word
 *     we hold no definition for is simply not asked.
 */

export type ListWord = { id: string; word: string; language: string; meaning: string };

const FRESH_MS = 21 * 24 * 60 * 60 * 1000;
const MAX_LISTS = 3;
const key = (w: string) => w.trim().toLowerCase();
const isHebrew = (w: string) => /[א-ת]/.test(w);

export async function nextListWords(uid: string, ui: string, haveIds: Set<string>, haveWords: Iterable<string>, need: number): Promise<ListWord[]> {
  if (need <= 0) return [];
  const db = getAdminDb();
  const snap = await db.collection("users").doc(uid).collection("dictationSets").where("custom", "==", true).get();
  const cutoff = new Date(Date.now() - FRESH_MS).toISOString();
  const lists = snap.docs
    .map((d) => ({ id: d.id, at: String(d.get("lastPracticedAt") || d.get("createdAt") || ""), words: (d.get("words") ?? []) as Array<{ en?: unknown; he?: unknown }> }))
    .filter((l) => l.at >= cutoff && Array.isArray(l.words))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX_LISTS);

  const seen = new Set<string>();
  for (const w of haveWords) seen.add(key(w));
  const out: ListWord[] = [];
  const bare: Array<{ id: string; word: string }> = [];
  for (const l of lists) {
    l.words.forEach((p, n) => {
      const en = typeof p.en === "string" ? p.en.trim() : "", he = typeof p.he === "string" ? p.he.trim() : "";
      const id = `list-${l.id}-${n}`;
      if (!en || !he || haveIds.has(id)) return;
      if (key(en) !== key(he)) {
        // A pair: the word that is NOT in the language of the platform is the one being learned.
        const [word, meaning] = (ui === "he") === isHebrew(en) ? [he, en] : [en, he];
        if (seen.has(key(word))) return;
        seen.add(key(word));
        out.push({ id, word, language: isHebrew(word) ? "he" : "en", meaning });
      } else if (!seen.has(key(en))) {
        seen.add(key(en));
        bare.push({ id, word: en });
      }
    });
  }

  // One word on both sides: its meaning from the dictionary cache (the simple text first).
  for (let i = 0; i < bare.length && out.length < need * 2; i += 60) {
    const part = bare.slice(i, i + 60);
    const refs = part.flatMap((b) => [`auto2_${ui}_kids_${key(b.word)}`, `auto2_${ui}_base_${key(b.word)}`]).map((x) => db.collection("cache").doc(x));
    const got = await db.getAll(...refs, { fieldMask: [new FieldPath("meanings")] });
    part.forEach((b, k) => {
      for (const s of [got[k * 2], got[k * 2 + 1]]) {
        const m = (s?.get("meanings") as Array<{ meaning?: unknown; kidsExplanation?: { explanation?: unknown } }> | undefined)?.[0];
        const simple = typeof m?.kidsExplanation?.explanation === "string" ? m.kidsExplanation.explanation.trim() : "";
        const meaning = simple || (typeof m?.meaning === "string" ? m.meaning.trim() : "");
        if (meaning && !isNotFoundMeaning(meaning)) { out.push({ id: b.id, word: b.word, language: isHebrew(b.word) ? "he" : "en", meaning }); return; }
      }
    });
  }
  return out.slice(0, need);
}
