/** The impostor rules of The Invading Words, with no data in them, so the game page can use them. */

export const senseRef = (w: string, id: string) => `${w}:${id}`;

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
