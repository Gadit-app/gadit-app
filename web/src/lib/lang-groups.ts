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
 */
import { useMemo, useSyncExternalStore } from "react";
import { LANGUAGES, type Lang } from "@/lib/i18n";

/** `label` is the group's own name, shown like a language's native label (pickers that show only labels read it). */
export type LangGroup = { code: string; region: string; flag: string; label: string; codes: Lang[] };
export const LANG_GROUPS: LangGroup[] = [
  { code: "@za", region: "ZA", flag: "za", label: "South Africa", codes: ["af", "zu", "xh", "nso", "tn", "st", "ts", "ss", "ve", "nr"] },
];
export const groupOf = (code: string): LangGroup | undefined => LANG_GROUPS.find((g) => g.code === code || (g.codes as string[]).includes(code));

type Row = (typeof LANGUAGES)[number] & { group?: boolean };

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

/** The picker's rows: the main languages, and each group row followed by its languages when open. */
export function useLangRows(lang: string): Row[] {
  const f = useSyncExternalStore(subscribe, () => flips, () => EMPTY);
  return useMemo(() => {
    const grouped = new Set(LANG_GROUPS.flatMap((g) => g.codes as string[]));
    const main: Row[] = LANGUAGES.filter((l) => !grouped.has(l.code));
    let top: Row[] = [];
    let end: Row[] = [];
    for (const g of LANG_GROUPS) {
      // A group near the viewer starts open, at the top; elsewhere closed, at the end.
      const near = (g.codes as string[]).includes(lang) || inRegion(g);
      const open = near !== ((f[g.code] ?? 0) % 2 === 1);
      const members = g.codes.map((c) => LANGUAGES.find((l) => l.code === c)).filter(Boolean) as Row[];
      const head: Row = { code: g.code as Lang, label: `${g.label} (${members.length})`, dir: "ltr", flag: g.flag, group: true };
      const block = [head, ...(open ? members : [])];
      if (near) top = [...top, ...block]; else end = [...end, ...block];
    }
    return [...top, ...main, ...end];
  }, [lang, f]);
}
