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

export type ThemeId =
  | "light"
  | "dark"
  | "space"
  | "ocean"
  | "candy"
  | "jungle"
  | "neon";

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
}

export const THEMES: ThemeMeta[] = [
  { id: "light", kind: "adult", emoji: "☀️", dark: false, swatch: ["#F4F5F8", "#FFFFFF", "#0EA5A5"],
    name: { he: "בהיר", en: "Light", ar: "فاتح", ru: "Светлая" } },
  { id: "dark", kind: "adult", emoji: "🌙", dark: true, swatch: ["#0F1622", "#1B2432", "#2DD4BF"],
    name: { he: "כהה", en: "Dark", ar: "داكن", ru: "Тёмная" } },
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
];

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
