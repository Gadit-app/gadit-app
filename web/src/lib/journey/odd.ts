import { getAdminDb } from "@/lib/firebase-admin";

/**
 * "Odd one out" questions of the journey (Gadi approved the sample
 * 2026-11-14). A question belongs to a level card: the card's word, two
 * more words of the same school unit and one word of a far subject. Built
 * and checked once by scripts/journey-odd-build.ts and kept in Firestore
 * journeyOdd/{unitId}: { qs: [{ w, options, odd }] }. Nothing is generated
 * while a child plays; a card with no checked question is simply asked in
 * the other formats.
 */
export type OddQuestion = { options: string[]; odd: string };

/** The unit of a level card ("lvl-<unit id>-<place>"), or null for a notebook card. */
function unitOf(cardId: string): string | null {
  const m = /^lvl-(.+)-\d+$/.exec(cardId);
  return m ? m[1] : null;
}

/** The checked question of each of these cards that has one, by card id. */
export async function oddQuestions(cards: Array<{ id: string; word: string }>): Promise<Map<string, OddQuestion>> {
  const out = new Map<string, OddQuestion>();
  const units = [...new Set(cards.map((c) => unitOf(c.id)).filter((u): u is string => !!u))];
  if (!units.length) return out;
  try {
    const db = getAdminDb();
    const snaps = await db.getAll(...units.map((u) => db.collection("journeyOdd").doc(u)));
    const byUnit = new Map<string, Array<{ w?: unknown; options?: unknown; odd?: unknown }>>();
    for (const s of snaps) { const qs = s.get("qs") as unknown; if (Array.isArray(qs)) byUnit.set(s.id, qs); }
    for (const c of cards) {
      const u = unitOf(c.id);
      const q = u ? byUnit.get(u)?.find((x) => x.w === c.word) : undefined;
      if (!q || !Array.isArray(q.options) || typeof q.odd !== "string") continue;
      const options = q.options.filter((o): o is string => typeof o === "string");
      if (options.length === 4 && options.includes(q.odd) && options.includes(c.word) && q.odd !== c.word) out.set(c.id, { options, odd: q.odd });
    }
  } catch (e) {
    console.warn("journey: odd questions not read", String(e));
  }
  return out;
}
