/**
 * The 3-tier Schools USD pricing, created 2026-08-15 in Stripe under
 * product "Gadit Schools" (prod_UmbRMt53Eitoes). Gadi raised the old
 * flat $69 / $149 to a proper by-student-count ladder ($97 / $297 /
 * $497), yearly = 10x monthly (two months free).
 *
 * Stripe price IDs are PUBLIC — they ship in the client bundle — so
 * hardcoding them here is safe and gives every surface (/pricing,
 * /checkout, /schools, the webhook, admin revenue) one source of truth
 * without needing six new Vercel env vars.
 *
 * The OLD prices are deliberately NOT listed here. They stay wired via
 * the STRIPE_PRICE_SCHOOLS_* env vars in the webhook / create-checkout,
 * so any grandfathered school (e.g. Greenworth on the old $69) keeps
 * provisioning correctly on renewal. New self-serve checkouts use the
 * tiers below.
 */

export type SchoolsTierKey = "s" | "m" | "l";

export interface SchoolsTier {
  key: SchoolsTierKey;
  monthly: string; // Stripe price id
  yearly: string; // Stripe price id
  maxStudents: number;
  usdMonthly: string;
  usdYearly: string;
  /** ≈ per-month figure shown on the yearly toggle (yearly / 12, rounded). */
  usdYearlyPerMonth: string;
}

export const SCHOOLS_TIERS: Record<SchoolsTierKey, SchoolsTier> = {
  s: {
    key: "s",
    monthly: "price_1U4k8QRprLKxF6OiIw9hsTAm",
    yearly: "price_1U4k8RRprLKxF6OiYrUdVKf0",
    maxStudents: 100,
    usdMonthly: "$97",
    usdYearly: "$970",
    usdYearlyPerMonth: "$81",
  },
  m: {
    key: "m",
    monthly: "price_1U4k8RRprLKxF6OibDiQWyLb",
    yearly: "price_1U4k8SRprLKxF6Oiz7ERqnlO",
    maxStudents: 500,
    usdMonthly: "$297",
    usdYearly: "$2,970",
    usdYearlyPerMonth: "$247",
  },
  l: {
    key: "l",
    monthly: "price_1U4k8TRprLKxF6OiWyJM5noK",
    yearly: "price_1U4k8URprLKxF6Oi1g6Mv9rA",
    maxStudents: 1000,
    usdMonthly: "$497",
    usdYearly: "$4,970",
    usdYearlyPerMonth: "$414",
  },
};

export const SCHOOLS_TIER_LIST: SchoolsTier[] = [
  SCHOOLS_TIERS.s,
  SCHOOLS_TIERS.m,
  SCHOOLS_TIERS.l,
];

/** All 6 new Schools price IDs (monthly + yearly across the 3 tiers). */
export const NEW_SCHOOLS_PRICE_IDS: string[] = SCHOOLS_TIER_LIST.flatMap((t) => [
  t.monthly,
  t.yearly,
]);

/** The 3 yearly IDs, for billing-cycle detection in the webhook. */
export const NEW_SCHOOLS_YEARLY_IDS: string[] = SCHOOLS_TIER_LIST.map((t) => t.yearly);

export function isNewSchoolsPrice(priceId: string | null | undefined): boolean {
  return !!priceId && NEW_SCHOOLS_PRICE_IDS.includes(priceId);
}

/** "up to N students" for a tier header, one template instead of a per-tier
 *  ternary. Native for the languages listed, English fallback for the rest
 *  (matches the he+en-primary pattern used across the Schools surfaces). */
export function studentsUpTo(n: number, lang: string): string {
  switch (lang) {
    case "he": return `עד ${n} תלמידים`;
    case "ar": return `حتى ${n} طالب`;
    case "ru": return `до ${n} учеников`;
    case "es": return `hasta ${n} alumnos`;
    case "pt": return `até ${n} alunos`;
    case "fr": return `jusqu'à ${n} élèves`;
    case "de": return `bis ${n} Schüler`;
    case "cs": return `až ${n} studentů`;
    case "sk": return `až ${n} študentov`;
    case "it": return `fino a ${n} studenti`;
    case "ja": return `最大${n}人の生徒`;
    case "hi": return `${n} छात्रों तक`;
    default: return `up to ${n} students`;
  }
}

/** Resolve the tier a new-schools price belongs to (or null). */
export function schoolsTierForPrice(priceId: string | null | undefined): SchoolsTier | null {
  if (!priceId) return null;
  return SCHOOLS_TIER_LIST.find((t) => t.monthly === priceId || t.yearly === priceId) ?? null;
}
