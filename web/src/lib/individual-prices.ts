/**
 * Gadit Individual (Gadi 2026-10-06, after the 7-assistant council): one
 * plan for one person with every learning tool, replacing Clear and Deep
 * for new buyers. $3.99 / $39.99, and in shekels ₪14.90 / ₪149 (an ILS
 * currency_option on the same prices). Stripe product prod_VOGm31Q6tfL88t.
 *
 * It provisions plan "deep" (every tool). The child-facing tools (Kids Mode,
 * dictation practice, child profiles, the parent board) belong to Family.
 * Existing Clear and Deep subscribers keep their prices (grandfathered).
 * Stripe price IDs are public, so they live here like the Schools tiers.
 */
export const INDIVIDUAL_MONTHLY = "price_1UNUEtRprLKxF6OiwgeDZzy6";
export const INDIVIDUAL_YEARLY = "price_1UNUEtRprLKxF6OiBx1F54bW";
export const INDIVIDUAL_PRICE_IDS = [INDIVIDUAL_MONTHLY, INDIVIDUAL_YEARLY];

export const INDIVIDUAL_DISPLAY = {
  usdMonthly: "$3.99",
  usdYearly: "$39.99",
  usdYearlyPerMonth: "$3.33",
  ilsMonthly: "₪14.90",
  ilsYearly: "₪149",
  ilsYearlyPerMonth: "₪12.42",
};

export function isIndividualPriceId(priceId: string | null | undefined): boolean {
  return !!priceId && INDIVIDUAL_PRICE_IDS.includes(priceId);
}
