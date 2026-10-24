import type { PriceBlock } from "@/lib/pricing-currency";
/**
 * Shared helpers for the real-screens landing pages in every language
 * (Gadi 2026-10-17): Individuals, Families and Schools were built in Hebrew
 * first; every other language gets the same page from its own copy file
 * (app/<page>/i18n/<lang>.ts), loaded on the server so a visitor downloads
 * only their own language.
 *
 * Prices follow the site rule: Hebrew shows shekels, every other language
 * shows US dollars (lib/pricing-currency.ts: USD is the live currency).
 * Copy strings carry placeholders, filled here: {monthly}, {yearly},
 * {familyMonthly}, {familyYearly}.
 */
import { INDIVIDUAL_DISPLAY } from "@/lib/individual-prices";

export const LANDING_RTL = new Set(["he", "ar", "fa"]);
export const landingDir = (lang: string): "rtl" | "ltr" => (LANDING_RTL.has(lang) ? "rtl" : "ltr");

/** Languages whose own app screens are captured for all three landing pages
 *  (public/{fam,ind,sch}/screens/<lang>/, the same 27 names as en). Native
 *  screens per language (Gadi 2026-10-22); a language not listed yet shows
 *  the English screens. */
export const NATIVE_SCREEN_LANGS: ReadonlySet<string> = new Set([
  "he", "es", "fr", "ru", "af", "am", "ar", "bn", "cs", "da", "de", "el", "fa", "fil", "hi", "hu", "id", "it", "ja", "ko",
  "nl", "nr", "nso", "pl", "pt", "sk", "ss", "st", "sw", "th", "tn", "tr", "ts", "uk", "ve", "vi", "xh", "zh-CN", "zh-TW", "zu",
]);

/** The screens shown on a page: the page's own language when its screens are
 *  captured, otherwise the English app. */
export const screensLang = (lang: string) => (NATIVE_SCREEN_LANGS.has(lang) ? lang : "en");

/** The font stack of a language (the same stacks as globals.css). */
export function landingFont(lang: string): string {
  switch (lang) {
    case "he": return "var(--font-rubik), 'Rubik', 'Heebo', system-ui, sans-serif";
    case "ar": return "var(--font-cairo), 'Cairo', system-ui, sans-serif";
    case "fa": return "var(--font-arabic), 'Noto Naskh Arabic', var(--font-cairo), 'Cairo', system-ui, sans-serif";
    case "ja": return "var(--font-noto-jp), 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', system-ui, sans-serif";
    case "hi": return "var(--font-noto-hi), 'Noto Sans Devanagari', 'Mangal', 'Kohinoor Devanagari', system-ui, sans-serif";
    case "am": return "var(--font-noto-am), 'Noto Sans Ethiopic', 'Nyala', 'Ebrima', 'Kefa', system-ui, sans-serif";
    case "zh-CN": return "var(--font-noto-sc), 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif";
    case "zh-TW": return "var(--font-noto-tc), 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif";
    case "ko": return "var(--font-noto-kr), 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif";
    case "th": return "var(--font-noto-th), 'Noto Sans Thai', 'Leelawadee UI', 'Thonburi', system-ui, sans-serif";
    case "bn": return "var(--font-noto-bn), 'Noto Sans Bengali', 'Vrinda', 'Shonar Bangla', system-ui, sans-serif";
    default: return "var(--font-inter), 'Inter', system-ui, sans-serif";
  }
}

/** The consumer prices a page shows: Hebrew in shekels; otherwise the visitor's
 *  country block from usePricing() (USD, or R in South Africa, 2026-10-24). */
export function landingPrices(lang: string, px?: PriceBlock) {
  const he = lang === "he";
  if (!he && px && px.currency !== "usd") {
    const fmt = (n: number) => `${px.symbol}${Number.isInteger(n) ? n : n.toFixed(2)}`;
    return {
      monthly: px.individualMonthly,
      yearly: px.individualYearly,
      familyMonthly: px.familyMonthly,
      familyYearly: px.familyYearly,
      familyUnder: fmt(Math.ceil(px.n.familyYearly / 12)),
      familySave: fmt(Math.round((px.n.familyMonthly * 12 - px.n.familyYearly) * 100) / 100),
    };
  }
  return {
    monthly: he ? INDIVIDUAL_DISPLAY.ilsMonthly : INDIVIDUAL_DISPLAY.usdMonthly,
    yearly: he ? INDIVIDUAL_DISPLAY.ilsYearly : INDIVIDUAL_DISPLAY.usdYearly,
    familyMonthly: he ? "₪19.90" : "$5.99",
    familyYearly: he ? "₪199" : "$59",
    // "less than X a month" on the yearly plan, and the yearly saving.
    familyUnder: he ? "₪17" : "$5",
    familySave: he ? "₪39.80" : "$12.88",
  };
}

/** Fills every string inside a copy object (arrays and nested objects too). */
export function fillDeep<T>(v: T, vars: Record<string, string>): T {
  if (typeof v === "string") return fill(v, vars) as T;
  if (Array.isArray(v)) return v.map((x) => fillDeep(x, vars)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fillDeep(x, vars)])) as T;
  return v;
}

/** Fills {name} placeholders. */
export function fill(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
