/**
 * Hebrew sound-alike guard (Gadi 2026-10-13: "שאון" came back with a second
 * meaning of "שעון", a clock). Hebrew has letters that sound the same today
 * (א/ע/ה, ח/כ, ט/ת, ק/כ, ס/ש, ו/ב), and the model sometimes adds the meaning
 * of the OTHER spelling. A meaning is dropped when none of its examples uses
 * the typed spelling, but one of them uses a sound-alike spelling instead.
 * It never empties the list, and it only touches Hebrew headwords.
 */

const GROUPS = ["אעה", "חכ", "טת", "קכ", "סש", "וב"];
const FINAL: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };

/** No niqqud, final letters as regular ones. */
function norm(s: string): string {
  return (s || "").normalize("NFD").replace(/[\u0591-\u05C7]/g, "").replace(/[ךםןףץ]/g, (c) => FINAL[c] ?? c);
}

/** Every spelling one sound-alike letter away from the word. */
function soundAlikes(w: string): string[] {
  const out = new Set<string>();
  const chars = Array.from(w);
  chars.forEach((ch, i) => {
    for (const g of GROUPS) {
      if (!g.includes(ch)) continue;
      for (const other of g) {
        if (other === ch) continue;
        const v = [...chars.slice(0, i), other, ...chars.slice(i + 1)].join("");
        if (v !== w) out.add(v);
      }
    }
  });
  return [...out];
}

type Meaning = { examples?: unknown };

/** Returns the result with sound-alike meanings removed (or unchanged). */
export function dropSoundAlikeMeanings<T>(result: T, word: string): T {
  const r = result as unknown as { meanings?: Meaning[]; multiplemeanings?: boolean };
  const w = norm(String(word || "").trim());
  if (!Array.isArray(r?.meanings) || r.meanings.length < 2 || !/[\u05D0-\u05EA]/.test(w) || w.length < 2 || /\s/.test(w)) return result;
  const alikes = soundAlikes(w);
  if (!alikes.length) return result;
  const keep = r.meanings.filter((m) => {
    const ex = Array.isArray(m?.examples) ? (m.examples as unknown[]).map((x) => norm(String(x ?? ""))).filter(Boolean) : [];
    if (!ex.length) return true;
    const usesWord = ex.some((e) => e.includes(w));
    if (usesWord) return true;
    const usesAlike = ex.some((e) => alikes.some((a) => e.includes(a)));
    return !usesAlike;
  });
  if (keep.length === r.meanings.length || keep.length === 0) return result;
  console.warn(`[define] dropped ${r.meanings.length - keep.length} sound-alike meaning(s) for "${word}"`);
  return { ...(r as object), meanings: keep, multiplemeanings: keep.length > 1 ? r.multiplemeanings : false } as unknown as T;
}
