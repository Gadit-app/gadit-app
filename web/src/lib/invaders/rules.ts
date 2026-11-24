/** The impostor rules of The Invading Words, with no data in them, so the game page can use them. */

export const senseRef = (w: string, id: string) => `${w}:${id}`;

/** The letters without vowel points or cantillation. */
export const plainHe = (s: string) => s.replace(/[֑-ׇ]/g, "");

/**
 * A written form read in more than one way is one game word per reading
 * (Gadi 2026-11-24: לֶחֶם and לָחַם, סֵפֶר and סַפָּר...). Such a word's id is
 * its vowelled form and `pk` is the written form it shares: its pictures
 * are keyed on it, and readings of one written form never fall as each
 * other's impostors (a child who hears "lechem" and sees לחם is not wrong to
 * think of fighting).
 */
export const baseOf = (word: { w: string; pk?: string }) => word.pk ?? plainHe(word.w);

/** What may never fall as an impostor while `target` is the word: whole words and single meanings ("w" or "w:id"). */
export function blockedFor(no: string[][], target: string): Set<string> {
  const out = new Set<string>();
  for (const pair of no) {
    if (pair.length !== 2) continue;
    const [a, b] = pair;
    if (a.split(":")[0] === target) out.add(b);
    if (b.split(":")[0] === target) out.add(a);
  }
  return out;
}

export const isBlocked = (blocked: Set<string>, w: string, id: string) => blocked.has(w) || blocked.has(senseRef(w, id));
