"use client";

/**
 * Appearance / skin system (Gadi 2026-08-16).
 *
 * One global "theme" per device, applied as `data-theme` on <html>, that
 * swaps a set of CSS custom properties (see the `[data-theme]` blocks in
 * globals.css). Two audiences share the same mechanism:
 *   - Adults pick a plain LIGHT or DARK look.
 *   - Kids pick a playful SKIN (Space / Ocean / Candy / Jungle / Neon), the
 *     way they pick a Roblox skin — the whole kids area re-colours.
 *
 * Persistence is localStorage with a same-tab custom event (localStorage
 * writes don't fire `storage` on the originating tab), mirroring
 * use-kids-mode. A tiny inline script in layout applies the attribute
 * before first paint so there is no flash of the wrong theme.
 */

import { useCallback, useEffect, useState } from "react";
import { SKIN_PRICES } from "@/lib/gamification";

export type ThemeId =
  | "light"
  | "dark"
  | "space"
  | "ocean"
  | "candy"
  | "jungle"
  | "neon"
  | "sunset"
  | "aurora"
  | "cosmos"
  | "lava"
  | "rainbow"
  | "royal";

export interface ThemeMeta {
  id: ThemeId;
  kind: "adult" | "kid";
  emoji: string;
  /** 3 preview dots for the picker: [background, surface/accent, accent2]. */
  swatch: [string, string, string];
  /** Whether this theme paints a dark ground (affects picker contrast). */
  dark: boolean;
  /** Native name; he/en/ar/ru provided, English fallback for the rest. */
  name: Record<string, string>;
  /** Kids gamification v2 (unlock economy): the rank INDEX a child must reach
   *  for this skin to unlock. Absent = free from the start. Earned rank (not
   *  gift points) drives this, so it can't be faked. The 5 original skins stay
   *  free forever; only these new ones are earned. */
  unlockAtRank?: number;
  /** Kids gamification v2 (gift store): the price in GIFT points to buy this
   *  skin. Gift points come from a parent (in-app reward) or Yooniz, live in a
   *  separate capped wallet, and NEVER touch ranks. A skin with a price is
   *  buyable in the store; one that ALSO has unlockAtRank is dual-path (earn it
   *  by climbing, OR let a parent gift-buy it early). Absent = not for sale. */
  price?: number;
}

export const THEMES: ThemeMeta[] = [
  { id: "light", kind: "adult", emoji: "☀️", dark: false, swatch: ["#F4F5F8", "#FFFFFF", "#0EA5A5"],
    name: { he: "בהיר", en: "Light", ar: "فاتح", ru: "Светлая" } },
  { id: "dark", kind: "adult", emoji: "🌙", dark: true, swatch: ["#0F1622", "#1B2432", "#2DD4BF"],
    name: { he: "כהה", en: "Dark", ar: "داكن", ru: "Тёمная" } },
  // The 5 original skins — always free.
  { id: "space", kind: "kid", emoji: "🚀", dark: true, swatch: ["#0B1030", "#7C3AED", "#22D3EE"],
    name: { he: "חלל", en: "Space", ar: "الفضاء", ru: "Космос" } },
  { id: "ocean", kind: "kid", emoji: "🌊", dark: true, swatch: ["#062A3A", "#0EA5A5", "#38BDF8"],
    name: { he: "אוקיינוס", en: "Ocean", ar: "محيط", ru: "Океан" } },
  { id: "candy", kind: "kid", emoji: "🍭", dark: false, swatch: ["#FCEAF6", "#EC4899", "#A855F7"],
    name: { he: "ממתקים", en: "Candy", ar: "حلوى", ru: "Конфеты" } },
  { id: "jungle", kind: "kid", emoji: "🌴", dark: true, swatch: ["#06301F", "#22C55E", "#F59E0B"],
    name: { he: "ג'ונגל", en: "Jungle", ar: "غابة", ru: "Джунгли" } },
  { id: "neon", kind: "kid", emoji: "⚡", dark: true, swatch: ["#0A0A14", "#A3E635", "#F472B6"],
    name: { he: "ניאון", en: "Neon", ar: "نيون", ru: "Неон" } },
  // Unlockable skins — DUAL PATH: earned by climbing ranks (free, can't be
  // faked) OR gift-bought early with parent/Yooniz gift points (a treat).
  // Prices come from SKIN_PRICES (injected below) so client + server agree.
  { id: "sunset", kind: "kid", emoji: "🌅", dark: true, unlockAtRank: 1, swatch: ["#1f0a2e", "#FB923C", "#F472B6"],
    name: { he: "שקיעה", en: "Sunset", ar: "غروب", ru: "Закат" } },
  { id: "aurora", kind: "kid", emoji: "🌌", dark: true, unlockAtRank: 3, swatch: ["#04121f", "#2DD4BF", "#A855F7"],
    name: { he: "זוהר", en: "Aurora", ar: "شفق", ru: "Сияние" } },
  { id: "cosmos", kind: "kid", emoji: "🪐", dark: true, unlockAtRank: 5, swatch: ["#0a0a2e", "#818CF8", "#E879F9"],
    name: { he: "קוסמוס", en: "Cosmos", ar: "كون", ru: "Вселенная" } },
  { id: "lava", kind: "kid", emoji: "🌋", dark: true, unlockAtRank: 7, swatch: ["#1a0a0a", "#F97316", "#EF4444"],
    name: { he: "לבה", en: "Lava", ar: "حمم", ru: "Лава" } },
  // Store-EXCLUSIVE skins — no rank path; only a parent gift can unlock them,
  // so the store always has something to buy even for a top-rank child.
  { id: "rainbow", kind: "kid", emoji: "🌈", dark: false, swatch: ["#FFF4FB", "#F472B6", "#38BDF8"],
    name: { he: "קשת", en: "Rainbow", ar: "قوس قزح", ru: "Радуга" } },
  { id: "royal", kind: "kid", emoji: "👑", dark: true, swatch: ["#12102A", "#FBBF24", "#A855F7"],
    name: { he: "מלכותי", en: "Royal", ar: "ملكي", ru: "Королевский" } },
];

// Inject store prices from the single source of truth (server + client agree).
for (const t of THEMES) if (SKIN_PRICES[t.id] != null) t.price = SKIN_PRICES[t.id];

/** Skins that can be bought in the gift store (have a price), cheapest first. */
export const STORE_THEMES = THEMES.filter((t) => t.price != null).sort((a, b) => a.price! - b.price!);

export const KID_THEMES = THEMES.filter((t) => t.kind === "kid");
export const ADULT_THEMES = THEMES.filter((t) => t.kind === "adult");

const VALID = new Set(THEMES.map((t) => t.id));
const KEY = "gadit-theme";
const EVENT = "gadit-theme-change";
const DEFAULT: ThemeId = "light";

export function themeName(t: ThemeMeta, lang: string): string {
  return t.name[lang] ?? t.name.en;
}

export function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT;
  const v = window.localStorage.getItem(KEY);
  return v && VALID.has(v as ThemeId) ? (v as ThemeId) : DEFAULT;
}

export function applyThemeAttr(id: ThemeId): void {
  if (typeof document === "undefined") return;
  if (id === DEFAULT) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", id);
}

/** Read + write the current theme, kept in sync across tabs and components. */
export function useTheme(): [ThemeId, (id: ThemeId) => void] {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT);

  useEffect(() => {
    const cur = readTheme();
    setTheme(cur);
    applyThemeAttr(cur);
    const onChange = () => {
      const t = readTheme();
      setTheme(t);
      applyThemeAttr(t);
    };
    window.addEventListener("storage", onChange);
    window.addEventListener(EVENT, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(EVENT, onChange);
    };
  }, []);

  const set = useCallback((id: ThemeId) => {
    if (typeof window === "undefined" || !VALID.has(id)) return;
    window.localStorage.setItem(KEY, id);
    applyThemeAttr(id);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [theme, set];
}
