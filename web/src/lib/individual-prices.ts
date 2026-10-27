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
// Current prices (2026-10-24): same amounts in every currency as the first
// pair, except Turkey and Ukraine at ₺119/₺1,190 and ₴119/₴1,190 (Stripe cannot
// change an existing currency amount, so these are new prices). The first pair
// stays recognized for anyone already on it.
export const INDIVIDUAL_MONTHLY = "price_1UU4EQRprLKxF6OiJPaeN6l9";
export const INDIVIDUAL_YEARLY = "price_1UU4ESRprLKxF6OiLrUd8MP0";
export const INDIVIDUAL_MONTHLY_V1 = "price_1UNUEtRprLKxF6OiwgeDZzy6";
export const INDIVIDUAL_YEARLY_V1 = "price_1UNUEtRprLKxF6OiBx1F54bW";
/** The App Store product of Individual (iOS app, 2026-10-27); stored as priceId. */
export const APPLE_INDIVIDUAL_PRODUCT = "com.gadit.app.individual.monthly";
export const APPLE_INDIVIDUAL_YEARLY = "com.gadit.app.individual.yearly";
export const INDIVIDUAL_PRICE_IDS = [INDIVIDUAL_MONTHLY, INDIVIDUAL_YEARLY, INDIVIDUAL_MONTHLY_V1, INDIVIDUAL_YEARLY_V1];
export const INDIVIDUAL_YEARLY_IDS = [INDIVIDUAL_YEARLY, INDIVIDUAL_YEARLY_V1];

export const INDIVIDUAL_DISPLAY = {
  usdMonthly: "$3.99",
  usdYearly: "$39.99",
  usdYearlyPerMonth: "$3.33",
  ilsMonthly: "₪14.90",
  ilsYearly: "₪149",
  ilsYearlyPerMonth: "₪12.42",
};

export function isIndividualPriceId(priceId: string | null | undefined): boolean {
  return !!priceId && (INDIVIDUAL_PRICE_IDS.includes(priceId) || priceId === APPLE_INDIVIDUAL_PRODUCT || priceId === APPLE_INDIVIDUAL_YEARLY);
}
