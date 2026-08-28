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
 * SHIPPING STATE: usd only is LIVE. Everyone sees USD (zero behaviour change).
 * The engine is fully wired so adding a market is pure data.
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
  // Approx per-month figure shown under the yearly price.
  clearYearlyPerMo: string;
  deepYearlyPerMo: string;
  // Numeric major-unit amounts, for analytics / the Meta pixel (currency-aware).
  n: {
    clearMonthly: number; clearYearly: number;
    deepMonthly: number; deepYearly: number;
    familyMonthly: number; familyYearly: number;
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
    clearYearlyPerMo: "$2.49",
    deepYearlyPerMo: "$4.16",
    n: { clearMonthly: 2.99, clearYearly: 29.99, deepMonthly: 4.99, deepYearly: 49.99, familyMonthly: 5.99, familyYearly: 59 },
  },
  // Add currencies here as markets go live, e.g.:
  // eur: { currency: "eur", symbol: "€", clearMonthly: "€2.99", ... },
};

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
