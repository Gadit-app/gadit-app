import { getAdminDb } from "@/lib/firebase-admin";

/**
 * "Does this sentence make sense?", the journey's fourth question (the
 * second sample, approved by Gadi 2026-11-15). A question belongs to a level
 * card. Every word has up to two checked sentences, built once by
 * scripts/journey-sense-build.ts and kept in Firestore
 * journeySense/{unitId}: { qs: { [word]: { good?, bad? } } }:
 *   good: a natural sentence in which the word is used in its meaning;
 *   bad:  the right sentence of ANOTHER word with this word planted in its
 *         place, so only a child who knows the word sees it does not belong.
 * Nothing is generated while a child plays; a card with no checked sentence
 * is simply asked in the other formats.
 */
export type SenseQuestion = { text: string; sensible: boolean };

function unitOf(cardId: string): string | null {
  const m = /^lvl-(.+)-\d+$/.exec(cardId);
  return m ? m[1] : null;
}

/** A steady coin for a card on a day: the same sentence all day, maybe the other one tomorrow. */
function coin(key: string): boolean {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 2 === 0;
}

/** One checked sentence for each of these cards that has one, by card id. */
export async function senseQuestions(cards: Array<{ id: string; word: string }>, day: string): Promise<Map<string, SenseQuestion>> {
  const out = new Map<string, SenseQuestion>();
  const units = [...new Set(cards.map((c) => unitOf(c.id)).filter((u): u is string => !!u))];
  if (!units.length) return out;
  try {
    const db = getAdminDb();
    const snaps = await db.getAll(...units.map((u) => db.collection("journeySense").doc(u)));
    const byUnit = new Map<string, Record<string, { good?: unknown; bad?: unknown }>>();
    for (const s of snaps) { const qs = s.get("qs") as unknown; if (qs && typeof qs === "object") byUnit.set(s.id, qs as Record<string, { good?: unknown; bad?: unknown }>); }
    for (const c of cards) {
      const u = unitOf(c.id);
      const q = u ? byUnit.get(u)?.[c.word] : undefined;
      if (!q) continue;
      const good = typeof q.good === "string" && q.good.trim() ? q.good.trim() : "";
      const bad = typeof q.bad === "string" && q.bad.trim() ? q.bad.trim() : "";
      if (!good && !bad) continue;
      const sensible = good && bad ? coin(`${day}|${c.id}`) : !!good;
      out.set(c.id, { text: sensible ? good : bad, sensible });
    }
  } catch (e) {
    console.warn("journey: sense questions not read", String(e));
  }
  return out;
}
