/**
 * Per-app admin dashboard config (spec §5, 2026-08-17).
 *
 * The locked admin spec is shared between Yooniz and Gadit; the ONLY
 * allowed differences are the wordmark, the reporting currency, and the
 * price catalog (tier mapping). Everything else is identical. This file is
 * Gadit's instance of that config.
 *
 * Source of truth for money is Stripe Live (reader model, no IAP). Tier
 * mapping is by PRICE ID (never nickname / product name / price amount,
 * which drift) — see admin-revenue.ts, which layers env-var price ids +
 * the schools ladder + a product-name fallback and flags anything it can't
 * value as "unmapped" rather than silently counting it as 0.
 */

export type AppKey = "yooniz" | "gadit";
export type ReportingCurrency = "ILS" | "USD";
export type BreakdownMode = "interval" | "tier";

export type AdminDashboardConfig = {
  appKey: AppKey;
  wordmark: { text: string; alt: string };
  reportingCurrency: ReportingCurrency;
  fxRatesAsOf: string;          // date the locked FX table was set
  breakdownMode: BreakdownMode; // Gadit shows tiers, not billing interval
  paymentSource: "stripe";
};

export const ADMIN_CONFIG: AdminDashboardConfig = {
  appKey: "gadit",
  wordmark: { text: "Gadit", alt: "Gadit" },
  reportingCurrency: "USD",
  fxRatesAsOf: "2026-08-17",
  breakdownMode: "tier",
  paymentSource: "stripe",
};

/**
 * Declared business timezone for all month / MTD cuts (spec §14: one
 * declared TZ, never raw UTC). Gadi operates from Israel, so month
 * boundaries anchor to Jerusalem even though the reporting currency is USD.
 */
export const BUSINESS_TZ = "Asia/Jerusalem";

/**
 * CAC payback inputs (spec §13.3). CAC is a manual input (from spend ÷ new
 * customers); default to Gadi's ~$500/mo budget assumption until wired to
 * the campaigns data. Override without a redeploy via env vars.
 */
export const CAC_USD = Number(process.env.MARKETING_CAC_USD ?? "") || 25;
export const GROSS_MARGIN = Number(process.env.GROSS_MARGIN ?? "") || 0.85;

/**
 * AA-safe design tokens for the admin (spec §1). The 28px KPI values use
 * these darker variants; the brighter hues (#0EA5A5 / #F59E0B / #7C3AED)
 * are for bars / icons / charts only, never the big number.
 */
export const TOKENS = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  rule: "#E5E7EB",
  ink: "#111827",
  inkSoft: "#6B7280",
  inkFaint: "#9CA3AF",
  // AA-safe value colors
  teal: "#0F766E",
  amber: "#B45309",
  purple: "#6D28D9",
  danger: "#DC2626",
  // Bright accents (bars / icons only)
  tealBright: "#0EA5A5",
  amberBright: "#F59E0B",
  purpleBright: "#7C3AED",
} as const;
