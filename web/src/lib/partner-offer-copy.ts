/**
 * partner-offer-copy — the partner offer stated in MONEY, not percentages
 * (Gadi 2026-10-18, after the council): what one paying family is worth, the
 * earned tier (5 paying customers raise the share after year one to 15% for
 * life) and the first paying customer bonus. Used by the partner dashboard,
 * the public /partners page and the partner welcome e-mail.
 *
 * Tokens: {y1} {after} {after15} money; {n} the tier threshold; {k} paying
 * customers so far; {bonus} the bonus amount; {date} the bonus deadline.
 */
import { EARNED_LIFETIME_RATE, EARNED_TIER_PAYING, FIRST_SALE_BONUS_MINOR, FIRST_SALE_BONUS_UNTIL } from "@/lib/partners";
import { PARTNER_OFFER_I18N } from "@/lib/partner-offer-i18n";

export type OfferKey =
  | "offerTitle" | "perFamily" | "tierGoal" | "tierProgress" | "tierReached"
  | "bonusLine" | "bonusEarned" | "publicTier" | "publicBonus";

const BASE: Record<"en" | "he", Record<OfferKey, string>> = {
  en: {
    offerTitle: "What it's worth to you, in money",
    perFamily: "Every family that pays through you: about {y1} in the first year, then about {after} every year after that.",
    tierGoal: "Bring {n} paying customers and it becomes about {after15} every year (15% for life).",
    tierProgress: "{k} of {n} paying customers",
    tierReached: "You have {n} paying customers: after the first year you now earn 15% for life.",
    bonusLine: "Your first paying customer by {date}: a {bonus} bonus on top.",
    bonusEarned: "You earned the {bonus} first customer bonus.",
    publicTier: "Bring {n} paying customers and your share after the first year rises to 15% for life.",
    publicBonus: "Your first paying customer by {date} also earns you a {bonus} bonus.",
  },
  he: {
    offerTitle: "מה זה שווה לכם, בכסף",
    perFamily: "כל משפחה שמשלמת דרככם: בערך {y1} בשנה הראשונה, ואחר כך בערך {after} בכל שנה.",
    tierGoal: "ב-{n} לקוחות משלמים זה עולה לבערך {after15} בכל שנה (15% לכל החיים).",
    tierProgress: "{k} מתוך {n} לקוחות משלמים",
    tierReached: "הגעתם ל-{n} לקוחות משלמים: מהשנה השנייה אתם מקבלים 15% לכל החיים.",
    bonusLine: "הלקוח המשלם הראשון שלכם עד {date}: בונוס של {bonus} בנוסף.",
    bonusEarned: "קיבלתם את בונוס הלקוח הראשון, {bonus}.",
    publicTier: "הבאתם {n} לקוחות משלמים? העמלה אחרי השנה הראשונה עולה ל-15% לכל החיים.",
    publicBonus: "והלקוח המשלם הראשון שלכם עד {date} מביא לכם גם בונוס של {bonus}.",
  },
};

export function offerCopy(lang: string): Record<OfferKey, string> {
  const own = (BASE as Record<string, Record<OfferKey, string>>)[lang] ?? PARTNER_OFFER_I18N[lang];
  return { ...BASE.en, ...(own ?? {}) };
}

/** Shekels for Hebrew, dollars for everyone else (like the calculator). */
export const offerCurrency = (lang: string): "ILS" | "USD" => (lang === "he" ? "ILS" : "USD");

const FAMILY_MONTHLY = { ILS: 19.9, USD: 5.99 } as const;

function money(v: number, cur: "ILS" | "USD", lang: string) {
  const n = Math.round(v);
  try {
    return new Intl.NumberFormat(lang === "he" ? "he-IL" : lang, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
  } catch {
    return (cur === "ILS" ? "₪" : "$") + n;
  }
}

/** Fills every token for this partner's rates, in this language. */
export function offerValues(lang: string, rateYearOne: number, rateLifetime: number, paying = 0) {
  const cur = offerCurrency(lang);
  const year = FAMILY_MONTHLY[cur] * 12;
  let date: string;
  try {
    date = new Intl.DateTimeFormat(lang, { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Jerusalem" }).format(new Date(FIRST_SALE_BONUS_UNTIL));
  } catch {
    date = "31.12.2026";
  }
  return {
    y1: money(year * rateYearOne, cur, lang),
    after: money(year * rateLifetime, cur, lang),
    after15: money(year * Math.max(rateLifetime, EARNED_LIFETIME_RATE), cur, lang),
    n: String(EARNED_TIER_PAYING),
    k: String(paying),
    bonus: money((cur === "ILS" ? FIRST_SALE_BONUS_MINOR.ils : FIRST_SALE_BONUS_MINOR.usd) / 100, cur, lang),
    date,
  };
}

export function fillOffer(s: string, v: Record<string, string>) {
  return s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
}
