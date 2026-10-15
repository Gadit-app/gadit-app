/**
 * A unit that holds its older words and new meanings together (Gemara phase
 * C, 2026-10-15). Pure: no app imports beyond the word normalizer, so a
 * script or a test can run it.
 *
 * Rules (Gadi: adding a meaning never hides, replaces or deletes an older
 * word without an explicit decision):
 *   - the unit's stored word list sets the order, and every word stays;
 *   - a meaning with `after: <word>` comes right after that word;
 *   - a meaning with `replaces: <word>` takes that word's place, and only then
 *     is the word not shown (an explicit decision in the content file);
 *   - a meaning with neither, or whose word is not in the unit, comes at the end;
 *   - several meanings of one word (תנא) come one after another.
 * Every older word gets a stable position id (`wordIds`, else derived from the
 * word), used for the address and the counters, never as a content key: its
 * picture, examples and quiz stay keyed on the word, byte for byte as before.
 */
import { normSetWord, type SetItem } from "@/lib/word-sets";

/** A stable 6-digit position id for an older word, from the word itself. */
export function legacyWordId(word: string, sense = 1): string {
  let h = 0x811c9dc5;
  for (const ch of normSetWord(word)) {
    h ^= ch.codePointAt(0) as number;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `gmw-${String(h % 1000000).padStart(6, "0")}-s${sense}`;
}

export function mergeMixed(
  words: string[],
  defs: Record<string, string>,
  items: SetItem[],
  wordIds: Record<string, string> = {},
): { entries: SetItem[]; problems: string[] } {
  const problems: string[] = [];
  const present = new Set(words.map(normSetWord));
  const replaced = new Map<string, SetItem[]>();
  const after = new Map<string, SetItem[]>();
  const tail: SetItem[] = [];
  for (const it of items) {
    const r = it.replaces ? normSetWord(it.replaces) : "";
    const a = it.after ? normSetWord(it.after) : "";
    if (r && present.has(r)) { replaced.set(r, [...(replaced.get(r) ?? []), it]); continue; }
    if (a && present.has(a)) { after.set(a, [...(after.get(a) ?? []), it]); continue; }
    if (r || a) problems.push(`${it.m}: ${r ? "replaces" : "after"} "${it.replaces ?? it.after}" is not a word of this unit; placed at the end`);
    tail.push(it);
  }
  const used = new Set(items.map((i) => i.m));
  const idFor = (w: string) => {
    const given = wordIds[w] ?? wordIds[normSetWord(w)];
    let id = given || legacyWordId(w);
    for (let s = 2; used.has(id); s++) id = id.replace(/-s\d+$/, `-s${s}`);
    used.add(id);
    return id;
  };
  const entries: SetItem[] = [];
  const placed = new Set<string>();
  for (const w of words) {
    const n = normSetWord(w);
    const rep = replaced.get(n);
    if (rep) {
      // The word's place goes to its replacement, then whatever comes after it.
      if (!placed.has(n)) entries.push(...rep, ...(after.get(n) ?? []));
    } else {
      entries.push({ m: idFor(w), w, d: defs[w] ?? "", k: "word" });
      if (!placed.has(n)) entries.push(...(after.get(n) ?? []));
    }
    placed.add(n);
  }
  entries.push(...tail);
  return { entries, problems };
}
