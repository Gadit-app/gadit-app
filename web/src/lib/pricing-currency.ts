/**
 * Multi-country currency engine (Yooniz model, 2026-08-28).
 *
 * We control the display currency ourselves with FIXED per-currency amounts,
 * and NEVER let Stripe Adaptive Pricing FX-convert the cart — because then the
 * offer page (fixed currency) wouldn't match the cart (converted currency),
 * which is exactly what Google Play rejected. Instead: one source of truth maps
 * country -> currency -> a fixed price block, used for BOTH the displayed price
 * and the Stripe `currency` we pin on checkout, so page == cart, always.
 *
 * SHIPPING STATE: usd + zar (South Africa, 2026-10-24, Gadi approved R69/R690
 * Family and R49/R490 Individual). Hebrew UI keeps ILS by language.
 *
 * OPERATIONAL CONTRACT to add a currency (do BOTH together, same amounts):
 *   1. Add `currency_options` for it on every Stripe Price (monthly + yearly,
 *      every tier) AND on the discount coupon.
 *   2. Add its block to PRICE_DISPLAY below (rounded amounts you choose — these
 *      can be PPP-adjusted, they are NOT FX conversions).
 * A currency that is mapped in COUNTRY_CURRENCY but has no PRICE_DISPLAY block
 * stays inert and falls back to usd — see the critical guard in
 * currencyForCountry(): returning a currency with no Stripe currency_option
 * makes Checkout 400.
 */

export type PriceCurrency = string; // "usd" | "eur" | "ils" | ...

export type PriceBlock = {
  currency: PriceCurrency;
  symbol: string;
  // Consumer-tier display strings (what the pricing page renders).
  clearMonthly: string;
  clearYearly: string;
  deepMonthly: string;
  deepYearly: string;
  familyMonthly: string;
  familyYearly: string;
  individualMonthly: string;
  individualYearly: string;
  // Approx per-month figure shown under the yearly price.
  clearYearlyPerMo: string;
  deepYearlyPerMo: string;
  familyYearlyPerMo: string;
  individualYearlyPerMo: string;
  // Numeric major-unit amounts, for analytics / the Meta pixel (currency-aware).
  n: {
    clearMonthly: number; clearYearly: number;
    deepMonthly: number; deepYearly: number;
    familyMonthly: number; familyYearly: number;
    individualMonthly: number; individualYearly: number;
  };
};

// LIVE currencies only. Start with usd; add more per the operational contract.
export const PRICE_DISPLAY: Record<string, PriceBlock> = {
  usd: {
    currency: "usd",
    symbol: "$",
    clearMonthly: "$2.99",
    clearYearly: "$29.99",
    deepMonthly: "$4.99",
    deepYearly: "$49.99",
    familyMonthly: "$5.99",
    familyYearly: "$59",
    individualMonthly: "$3.99",
    individualYearly: "$39.99",
    clearYearlyPerMo: "$2.49",
    deepYearlyPerMo: "$4.16",
    familyYearlyPerMo: "$4.92",
    individualYearlyPerMo: "$3.33",
    n: { clearMonthly: 2.99, clearYearly: 29.99, deepMonthly: 4.99, deepYearly: 49.99, familyMonthly: 5.99, familyYearly: 59, individualMonthly: 3.99, individualYearly: 39.99 },
  },
  // South Africa (PPP, about 0.7 of FX, like Yooniz's R89). Only Individual and
  // Family carry a zar currency_option; the legacy Clear/Deep fields repeat USD
  // because those prices stay USD-only (chargeCurrency never pins zar on them).
  zar: {
    currency: "zar",
    symbol: "R",
    clearMonthly: "$2.99",
    clearYearly: "$29.99",
    deepMonthly: "$4.99",
    deepYearly: "$49.99",
    familyMonthly: "R69",
    familyYearly: "R690",
    individualMonthly: "R49",
    individualYearly: "R490",
    clearYearlyPerMo: "$2.49",
    deepYearlyPerMo: "$4.16",
    familyYearlyPerMo: "R57.50",
    individualYearlyPerMo: "R40.83",
    n: { clearMonthly: 2.99, clearYearly: 29.99, deepMonthly: 4.99, deepYearly: 49.99, familyMonthly: 69, familyYearly: 690, individualMonthly: 49, individualYearly: 490 },
  },
};

/** The prices that carry the local currency_options (Individual + Family).
 *  Every other price (Schools, legacy Clear/Deep) is USD (+ ILS) only, so a
 *  local currency must never be pinned on them: Stripe would answer 400. */
export const LOCALIZED_PRICE_IDS = new Set<string>([
  "price_1UNUEtRprLKxF6OiwgeDZzy6", // Individual monthly
  "price_1UNUEtRprLKxF6OiBx1F54bW", // Individual yearly
  "price_1TtwJfRprLKxF6OiXHbu2cae", // Family monthly
  "price_1TtwJgRprLKxF6OiIU47RCSC", // Family yearly
  ...[process.env.STRIPE_PRICE_FAMILY_MONTHLY, process.env.STRIPE_PRICE_FAMILY_YEARLY].filter((x): x is string => !!x),
]);

/**
 * The currency to pin on a Stripe charge, or undefined for the price's default
 * USD. Hebrew UI pays in shekels (every paid price has an ILS option); otherwise
 * the country's currency, but only on a localized price.
 */
export function chargeCurrency(country: string | null | undefined, priceId: string, lang?: string): string | undefined {
  if (lang === "he") return "ils";
  const cur = currencyForCountry(country);
  if (cur === "usd" || !LOCALIZED_PRICE_IDS.has(priceId)) return undefined;
  return cur;
}

// Generous country -> currency map. Listing a currency here does NOT activate
// it; it only takes effect once that currency has a PRICE_DISPLAY block (and a
// matching Stripe currency_option). Safe to pre-list future markets.
export const COUNTRY_CURRENCY: Record<string, string> = {
  // Eurozone
  AT: "eur", BE: "eur", CY: "eur", DE: "eur", EE: "eur", ES: "eur", FI: "eur",
  FR: "eur", GR: "eur", HR: "eur", IE: "eur", IT: "eur", LT: "eur", LU: "eur",
  LV: "eur", MT: "eur", NL: "eur", PT: "eur", SI: "eur", SK: "eur",
  // Other priority markets (add blocks + Stripe options to activate)
  GB: "gbp",
  IL: "ils",
  ZA: "zar",
  BR: "brl", IN: "inr", PH: "php", MX: "mxn", ID: "idr", TR: "try",
  CA: "cad", AU: "aud", JP: "jpy", CH: "chf", PL: "pln", SE: "sek",
  // everything else -> usd via fallback
};

const USD = PRICE_DISPLAY.usd;

/**
 * The Stripe currency to charge for a country. CRITICAL: only ever returns a
 * currency that has a live PRICE_DISPLAY block, because pinning a currency
 * with no Stripe currency_option makes Checkout return 400. Everything else
 * (and unknown/missing country) falls back to usd.
 */
export function currencyForCountry(country: string | null | undefined): string {
  const c = (country || "").toUpperCase();
  const mapped = COUNTRY_CURRENCY[c];
  if (mapped && PRICE_DISPLAY[mapped]) return mapped;
  return "usd";
}

/** The display block for a country (fixed amounts), falling back to usd. */
export function displayForCountry(country: string | null | undefined): PriceBlock {
  return PRICE_DISPLAY[currencyForCountry(country)] ?? USD;
}
