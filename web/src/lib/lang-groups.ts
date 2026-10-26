/**
 * Regional groups in the language pickers (Gadi 2026-10-16). The 10 South
 * African languages other than English sit under one "South Africa" row, so
 * the main list stays short for the rest of the world. The row opens the
 * group in place; it starts open, and at the top, for a viewer whose UI
 * language is in the group or whose browser reports a South African locale.
 *
 * Every picker renders `useLangRows(lang)` instead of LANGUAGES and calls
 * `toggleLangGroup(code)` first in its click handler: a group row returns
 * true (opened or closed), a language returns false and the picker goes on
 * as before. A group row's code starts with "@"; langNameIn() names it.
 *
 * Order (Gadi 2026-10-26, "the list isn't alphabetical"): the current
 * language first, then every other language A to Z by its name in the
 * VIEWER's language. A group sits in that order by its own name (closed),
 * or right after the current language when it is near the viewer (open);
 * its languages are A to Z too. `useLangRows(lang, query)` with a search
 * query returns the matching languages only, flat (no group row).
 */
import { useMemo, useSyncExternalStore } from "react";
import { LANGUAGES, langNameIn, type Lang } from "@/lib/i18n";

/** `label` is the group's own name, shown like a language's native label (pickers that show only labels read it). */
export type LangGroup = { code: string; region: string; flag: string; label: string; codes: Lang[] };
export const LANG_GROUPS: LangGroup[] = [
  { code: "@za", region: "ZA", flag: "za", label: "South Africa", codes: ["af", "zu", "xh", "nso", "tn", "st", "ts", "ss", "ve", "nr"] },
];
export const groupOf = (code: string): LangGroup | undefined => LANG_GROUPS.find((g) => g.code === code || (g.codes as string[]).includes(code));

export type LangRow = (typeof LANGUAGES)[number] & { group?: boolean };
type Row = LangRow;

// Each group row's taps; odd = the viewer flipped it from its starting state.
let flips: Record<string, number> = {};
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const EMPTY: Record<string, number> = {};

/** A browser that reports a South African locale (en-ZA, af, zu...). */
function inRegion(g: LangGroup): boolean {
  if (typeof navigator === "undefined") return false;
  const tags = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((t) => String(t).toLowerCase());
  return tags.some((t) => t.endsWith("-" + g.region.toLowerCase()) || (g.codes as string[]).includes(t.split("-")[0]) || t.startsWith("nso"));
}

/** Open a group row, or close it. False for a language code. */
export function toggleLangGroup(code: string): boolean {
  if (!code.startsWith("@")) return false;
  flips = { ...flips, [code]: (flips[code] ?? 0) + 1 };
  listeners.forEach((fn) => fn());
  return true;
}

/** A to Z in the viewer's language (Intl.Collator; the default locale when it has no data for it). */
function collatorFor(lang: string): Intl.Collator {
  try { return new Intl.Collator([lang], { sensitivity: "base", numeric: true }); } catch { return new Intl.Collator(); }
}

/**
 * Other names people type for a language (search only). Lower case is not
 * needed; matching folds case and accents. English names and the codes are
 * added automatically.
 */
const ALIASES: Partial<Record<Lang, string[]>> = {
  en: ["Anglit", "Inglés", "Anglais", "Englisch"],
  he: ["Ivrit", "Hebrew"],
  ar: ["Arabi", "Arabic"],
  fa: ["Farsi", "Parsi", "פארסי"],
  fil: ["Tagalog", "Pilipino", "טגלוג"],
  "zh-CN": ["Mandarin", "Chinese", "Simplified", "中文", "汉语", "普通话", "מנדרינית"],
  "zh-TW": ["Mandarin", "Chinese", "Traditional", "中文", "國語", "華語", "מנדרינית"],
  ja: ["Nihongo"],
  ko: ["Hangul", "Hangugeo"],
  bn: ["Bangla"],
  id: ["Bahasa", "Bahasa Indonesia"],
  nl: ["Dutch", "Flemish", "Vlaams"],
  el: ["Greek", "Hellenic"],
  pt: ["Brasil", "Brazilian"],
  es: ["Castellano"],
  sw: ["Swahili", "Kiswahili"],
  zu: ["isiZulu", "Zulu"],
  xh: ["isiXhosa", "Xhosa"],
  st: ["Sesotho", "Sotho", "Southern Sotho"],
  tn: ["Setswana", "Tswana"],
  nso: ["Sepedi", "Pedi", "Northern Sotho", "Sesotho sa Leboa"],
  ts: ["Xitsonga", "Tsonga", "Shangaan"],
  ss: ["siSwati", "Swati", "Swazi"],
  ve: ["Tshivenda", "Venda"],
  nr: ["isiNdebele", "Ndebele", "South Ndebele"],
};

/**
 * Fold a string for matching: no case, no accents (Latin, Greek, Cyrillic),
 * no Hebrew points or Arabic vowel marks, Arabic letter variants merged, and
 * every punctuation run a single space. Indic and Thai vowel signs are kept
 * (they are letters there, not accents).
 */
export function foldLangText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-֑ͯ-ׇً-ٰٟ]/g, "")
    .toLowerCase()
    .replace(/ı/g, "i").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ø/g, "o").replace(/ß/g, "ss")
    .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .trim();
}

// Scripts written without spaces between words: a match may start anywhere.
const NO_SPACE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u;

/** 0: the viewer's name starts with the query; 1: a word of any name does; 2: inside a no-space script; -1: no match. */
function matchRank(fields: string[], q: string): number {
  const anywhere = NO_SPACE_SCRIPT.test(q);
  let best = -1;
  fields.forEach((raw, i) => {
    const f = foldLangText(raw);
    if (!f) return;
    let r = -1;
    if (f.startsWith(q)) r = i === 0 ? 0 : 1;
    else if ((" " + f).includes(" " + q)) r = 1;
    else if (anywhere && f.includes(q)) r = 2;
    if (r >= 0 && (best < 0 || r < best)) best = r;
  });
  return best;
}

/** Every name a language answers to in a search, the viewer's own name first. */
function searchFields(code: Lang, label: string, lang: string): string[] {
  return [langNameIn(code, lang), label, langNameIn(code, "en"), ...(ALIASES[code] ?? [])];
}

/** The languages matching a search, flat (no group rows), best match first, then A to Z. */
export function searchLangs(lang: string, query: string): Row[] {
  const q = foldLangText(query);
  if (!q) return [];
  const coll = collatorFor(lang);
  const scored: { row: Row; rank: number; name: string }[] = [];
  for (const l of LANGUAGES) {
    let rank = matchRank(searchFields(l.code, l.label, lang), q);
    // The code itself: "he", "zu", "zh-cn" (exact, or the start of it from two letters).
    const c = l.code.toLowerCase();
    if (c === q || (q.length >= 2 && foldLangText(c).startsWith(q))) rank = rank < 0 ? 1 : Math.min(rank, 1);
    // The group's name ("South Africa", "דרום אפריקה") brings in all of its languages.
    if (rank < 0) {
      const g = groupOf(l.code);
      if (g && matchRank([langNameIn(g.code, lang), g.label], q) >= 0) rank = 3;
    }
    if (rank >= 0) scored.push({ row: l, rank, name: langNameIn(l.code, lang) });
  }
  scored.sort((a, b) => a.rank - b.rank || coll.compare(a.name, b.name));
  return scored.map((s) => s.row);
}

/** The picker's rows: the current language, then A to Z, each group row followed by its languages when open. With a query: the matches only. */
export function useLangRows(lang: string, query = ""): Row[] {
  const f = useSyncExternalStore(subscribe, () => flips, () => EMPTY);
  const searching = query.trim() !== "";
  const rows = useMemo(() => {
    const coll = collatorFor(lang);
    const byName = (a: Row, b: Row) => coll.compare(langNameIn(a.code, lang), langNameIn(b.code, lang));
    const grouped = new Set(LANG_GROUPS.flatMap((g) => g.codes as string[]));
    const current = LANGUAGES.find((l) => l.code === lang);
    // Sorted entries: a language is one row; a group is its head plus (open) its languages.
    const entries: { name: string; rows: Row[] }[] = [];
    const top: Row[] = current ? [current] : [];
    for (const l of LANGUAGES) {
      if (l.code === lang || grouped.has(l.code)) continue;
      entries.push({ name: langNameIn(l.code, lang), rows: [l] });
    }
    for (const g of LANG_GROUPS) {
      // A group near the viewer starts open, at the top; elsewhere closed, in its A to Z place.
      const near = (g.codes as string[]).includes(lang) || inRegion(g);
      const open = near !== ((f[g.code] ?? 0) % 2 === 1);
      const all = g.codes.map((c) => LANGUAGES.find((l) => l.code === c)).filter(Boolean) as Row[];
      // The current language is already first; it is not listed twice.
      const members = all.filter((l) => l.code !== lang).sort(byName);
      const head: Row = { code: g.code as Lang, label: `${g.label} (${all.length})`, dir: "ltr", flag: g.flag, group: true };
      const block = [head, ...(open ? members : [])];
      if (near) top.push(...block);
      else entries.push({ name: langNameIn(g.code, lang), rows: block });
    }
    entries.sort((a, b) => coll.compare(a.name, b.name));
    return [...top, ...entries.flatMap((e) => e.rows)];
  }, [lang, f]);
  const found = useMemo(() => (searching ? searchLangs(lang, query) : null), [searching, lang, query]);
  return found ?? rows;
}
