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
  // Unlockable skins — earned PURELY by climbing ranks (= distinct words learned).
  // Each skin unlocks exactly when its rank milestone is reached, so the rank
  // ladder and the skins are one progression (Gadi 2026-08-27, naming council):
  //   🌅 Sunset  → Word Tracker   (rank 2, ~30 words)
  //   🌌 Aurora  → Word Guide     (rank 4, ~150)
  //   🪐 Cosmos  → Word Master    (rank 5, ~300)
  //   🌋 Lava    → Word Sage      (rank 7, ~650)
  //   🌈 Rainbow → Word Legend    (rank 9, ~1200)
  //   👑 Royal   → Word Grandmaster/קיסר המילים (rank 11, ~2200)
  // Big gaps between skins by design (long-term motivation). No gift-points path:
  // more words → higher rank → more skins. The parent gift store was removed.
  { id: "sunset", kind: "kid", emoji: "🌅", dark: true, unlockAtRank: 2, swatch: ["#1f0a2e", "#FB923C", "#F472B6"],
    name: { he: "שקיעה", en: "Sunset", ar: "غروب", ru: "Закат" } },
  { id: "aurora", kind: "kid", emoji: "🌌", dark: true, unlockAtRank: 4, swatch: ["#04121f", "#2DD4BF", "#A855F7"],
    name: { he: "זוהר", en: "Aurora", ar: "شفق", ru: "Сияние" } },
  { id: "cosmos", kind: "kid", emoji: "🪐", dark: true, unlockAtRank: 5, swatch: ["#0a0a2e", "#818CF8", "#E879F9"],
    name: { he: "קוסמוס", en: "Cosmos", ar: "كون", ru: "Вселенная" } },
  { id: "lava", kind: "kid", emoji: "🌋", dark: true, unlockAtRank: 7, swatch: ["#1a0a0a", "#F97316", "#EF4444"],
    name: { he: "לבה", en: "Lava", ar: "حمم", ru: "Лава" } },
  { id: "rainbow", kind: "kid", emoji: "🌈", dark: false, unlockAtRank: 9, swatch: ["#FFF4FB", "#F472B6", "#38BDF8"],
    name: { he: "קשת", en: "Rainbow", ar: "قوس قزح", ru: "Радуга" } },
  { id: "royal", kind: "kid", emoji: "👑", dark: true, unlockAtRank: 11, swatch: ["#12102A", "#FBBF24", "#A855F7"],
    name: { he: "מלכותי", en: "Royal", ar: "ملكي", ru: "Королевский" } },
];

// Inject store prices from the single source of truth (server + client agree).
for (const t of THEMES) if (SKIN_PRICES[t.id] != null) t.price = SKIN_PRICES[t.id];

// Native skin names for the remaining 29 UI languages (he/en/ar/ru are inline
// above). Kids see these in the store, so every language shows a real name.
const THEME_NAMES_I18N: Partial<Record<ThemeId, Record<string, string>>> = {
  light: { ar: "فاتح", ru: "Светлая", es: "Claro", pt: "Claro", fr: "Clair", de: "Hell", cs: "Světlý", sk: "Svetlý", it: "Chiaro", ja: "ライト", hi: "लाइट", am: "ብርሃን", uk: "Світла", tr: "Açık", pl: "Jasny", fa: "روشن", id: "Terang", nl: "Licht", el: "Φωτεινό", zu: "Ukukhanya", vi: "Sáng", fil: "Maliwanag", af: "Lig", sw: "Mwangaza", "zh-CN": "明亮", "zh-TW": "明亮", ko: "라이트", th: "สว่าง", bn: "আলো", da: "Lys", hu: "Világos" },
  dark: { ar: "داكن", ru: "Тёмная", es: "Oscuro", pt: "Escuro", fr: "Sombre", de: "Dunkel", cs: "Tmavý", sk: "Tmavý", it: "Scuro", ja: "ダーク", hi: "डार्क", am: "ጨለማ", uk: "Темна", tr: "Koyu", pl: "Ciemny", fa: "تیره", id: "Gelap", nl: "Donker", el: "Σκοτεινό", zu: "Okumnyama", vi: "Tối", fil: "Madilim", af: "Donker", sw: "Giza", "zh-CN": "暗黑", "zh-TW": "暗黑", ko: "다크", th: "มืด", bn: "অন্ধকার", da: "Mørk", hu: "Sötét" },
  space: { ar: "الفضاء", ru: "Космос", es: "Espacio", pt: "Espaço", fr: "Espace", de: "Weltraum", cs: "Vesmír", sk: "Vesmír", it: "Spazio", ja: "スペース", hi: "अंतरिक्ष", am: "ጠፈር", uk: "Космос", tr: "Uzay", pl: "Kosmos", fa: "فضا", id: "Antariksa", nl: "Ruimte", el: "Διάστημα", zu: "Umkhathi", vi: "Không gian", fil: "Kalawakan", af: "Ruimte", sw: "Anga", "zh-CN": "太空", "zh-TW": "太空", ko: "우주", th: "อวกาศ", bn: "মহাকাশ", da: "Rummet", hu: "Világűr" },
  ocean: { ar: "المحيط", ru: "Океан", es: "Océano", pt: "Oceano", fr: "Océan", de: "Ozean", cs: "Oceán", sk: "Oceán", it: "Oceano", ja: "オーシャン", hi: "समुद्र", am: "ውቅያኖስ", uk: "Океан", tr: "Okyanus", pl: "Ocean", fa: "اقیانوس", id: "Samudra", nl: "Oceaan", el: "Ωκεανός", zu: "Ulwandle", vi: "Đại dương", fil: "Karagatan", af: "Oseaan", sw: "Bahari", "zh-CN": "海洋", "zh-TW": "海洋", ko: "바다", th: "มหาสมุทร", bn: "সমুদ্র", da: "Havet", hu: "Óceán" },
  candy: { ar: "حلوى", ru: "Конфета", es: "Caramelo", pt: "Doce", fr: "Bonbon", de: "Bonbon", cs: "Bonbon", sk: "Cukrík", it: "Caramella", ja: "キャンディ", hi: "कैंडी", am: "ከረሜላ", uk: "Цукерки", tr: "Şeker", pl: "Cukierki", fa: "آبنبات", id: "Permen", nl: "Snoep", el: "Καραμέλα", zu: "Uswidi", vi: "Kẹo", fil: "Kendi", af: "Lekkers", sw: "Peremende", "zh-CN": "糖果", "zh-TW": "糖果", ko: "캔디", th: "ลูกอม", bn: "ক্যান্ডি", da: "Slik", hu: "Cukorka" },
  jungle: { ar: "الغابة", ru: "Джунгли", es: "Jungla", pt: "Selva", fr: "Jungle", de: "Dschungel", cs: "Džungle", sk: "Džungľa", it: "Giungla", ja: "ジャングル", hi: "जंगल", am: "ደን", uk: "Джунглі", tr: "Orman", pl: "Dżungla", fa: "جنگل", id: "Rimba", nl: "Jungle", el: "Ζούγκλα", zu: "Ihlathi", vi: "Rừng rậm", fil: "Gubat", af: "Oerwoud", sw: "Msitu", "zh-CN": "丛林", "zh-TW": "叢林", ko: "정글", th: "ป่า", bn: "জঙ্গল", da: "Junglen", hu: "Dzsungel" },
  neon: { ar: "نيون", ru: "Неон", es: "Neón", pt: "Néon", fr: "Néon", de: "Neon", cs: "Neon", sk: "Neón", it: "Neon", ja: "ネオン", hi: "नियॉन", am: "ኒዮን", uk: "Неон", tr: "Neon", pl: "Neon", fa: "نئون", id: "Neon", nl: "Neon", el: "Νέον", zu: "I-Neon", vi: "Neon", fil: "Neon", af: "Neon", sw: "Neon", "zh-CN": "霓虹", "zh-TW": "霓虹", ko: "네온", th: "นีออน", bn: "নিয়ন", da: "Neon", hu: "Neon" },
  sunset: { ar: "الغروب", ru: "Закат", es: "Atardecer", pt: "Pôr do sol", fr: "Coucher de soleil", de: "Sonnenuntergang", cs: "Západ slunce", sk: "Západ slnka", it: "Tramonto", ja: "サンセット", hi: "सूर्यास्त", am: "ጀንበር ስትጠልቅ", uk: "Захід сонця", tr: "Gün batımı", pl: "Zachód słońca", fa: "غروب", id: "Senja", nl: "Zonsondergang", el: "Ηλιοβασίλεμα", zu: "Ukushona kwelanga", vi: "Hoàng hôn", fil: "Paglubog ng Araw", af: "Sonsondergang", sw: "Machweo", "zh-CN": "日落", "zh-TW": "日落", ko: "노을", th: "พระอาทิตย์ตก", bn: "সূর্যাস্ত", da: "Solnedgang", hu: "Naplemente" },
  aurora: { ar: "الشفق", ru: "Сияние", es: "Aurora", pt: "Aurora", fr: "Aurore", de: "Polarlicht", cs: "Polární záře", sk: "Polárna žiara", it: "Aurora", ja: "オーロラ", hi: "अरोरा", am: "ኦውሮራ", uk: "Сяйво", tr: "Kutup ışığı", pl: "Zorza", fa: "شفق قطبی", id: "Aurora", nl: "Noorderlicht", el: "Σέλας", zu: "I-Aurora", vi: "Cực quang", fil: "Aurora", af: "Aurora", sw: "Aurora", "zh-CN": "极光", "zh-TW": "極光", ko: "오로라", th: "แสงเหนือ", bn: "মেরুজ্যোতি", da: "Nordlys", hu: "Sarki fény" },
  cosmos: { ar: "الكون", ru: "Вселенная", es: "Cosmos", pt: "Cosmos", fr: "Cosmos", de: "Kosmos", cs: "Kosmos", sk: "Kozmos", it: "Cosmo", ja: "コスモス", hi: "ब्रह्मांड", am: "አጽናፈ ዓለም", uk: "Всесвіт", tr: "Evren", pl: "Wszechświat", fa: "کیهان", id: "Semesta", nl: "Heelal", el: "Σύμπαν", zu: "Indawo yonke", vi: "Vũ trụ", fil: "Kosmos", af: "Kosmos", sw: "Ulimwengu", "zh-CN": "宇宙", "zh-TW": "宇宙", ko: "코스모스", th: "จักรวาล", bn: "মহাবিশ্ব", da: "Kosmos", hu: "Kozmosz" },
  lava: { ar: "الحمم", ru: "Лава", es: "Lava", pt: "Lava", fr: "Lave", de: "Lava", cs: "Láva", sk: "Láva", it: "Lava", ja: "マグマ", hi: "लावा", am: "ላቫ", uk: "Лава", tr: "Lav", pl: "Lawa", fa: "گدازه", id: "Lava", nl: "Lava", el: "Λάβα", zu: "I-Lava", vi: "Dung nham", fil: "Lava", af: "Lawa", sw: "Lava", "zh-CN": "熔岩", "zh-TW": "熔岩", ko: "용암", th: "ลาวา", bn: "লাভা", da: "Lava", hu: "Láva" },
  rainbow: { ar: "قوس قزح", ru: "Радуга", es: "Arcoíris", pt: "Arco-íris", fr: "Arc-en-ciel", de: "Regenbogen", cs: "Duha", sk: "Dúha", it: "Arcobaleno", ja: "レインボー", hi: "इंद्रधनुष", am: "ቀስተ ደመና", uk: "Веселка", tr: "Gökkuşağı", pl: "Tęcza", fa: "رنگین‌کمان", id: "Pelangi", nl: "Regenboog", el: "Ουράνιο τόξο", zu: "Uthingo", vi: "Cầu vồng", fil: "Bahaghari", af: "Reënboog", sw: "Upinde wa Mvua", "zh-CN": "彩虹", "zh-TW": "彩虹", ko: "무지개", th: "สายรุ้ง", bn: "রংধনু", da: "Regnbue", hu: "Szivárvány" },
  royal: { ar: "ملكي", ru: "Королевская", es: "Real", pt: "Real", fr: "Royal", de: "Königlich", cs: "Královský", sk: "Kráľovský", it: "Reale", ja: "ロイヤル", hi: "शाही", am: "ንጉሣዊ", uk: "Королівська", tr: "Kraliyet", pl: "Królewski", fa: "سلطنتی", id: "Kerajaan", nl: "Koninklijk", el: "Βασιλικό", zu: "Ubukhosi", vi: "Hoàng gia", fil: "Panghari", af: "Koninklik", sw: "Kifalme", "zh-CN": "皇家", "zh-TW": "皇家", ko: "로열", th: "ราชวงศ์", bn: "রাজকীয়", da: "Kongelig", hu: "Királyi" },
};
for (const t of THEMES) { const ex = THEME_NAMES_I18N[t.id]; if (ex) Object.assign(t.name, ex); }

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
