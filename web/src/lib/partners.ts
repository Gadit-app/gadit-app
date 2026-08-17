/**
 * Partner (affiliate) program — shared types + helpers.
 *
 * This is Gadit's in-house affiliate system, modelled on the one Gadi
 * runs on Yooniz (which works without a third party). It lives ALONGSIDE
 * the existing Affonso integration for now (Gadi 2026-07-30): Affonso
 * keeps its reserved `/r/*` prefix and its `/affiliates` surface; this
 * native system uses `/p/<code>` referral links and the `/partners`
 * marketing page, so the two never collide.
 *
 * Model (mirrors Yooniz):
 *   - Standard partner: 25% recurring in year one, 10% for life after.
 *   - Founder partner:   30% recurring in year one, 10% for life after.
 *   - Open to anyone (no Gadit subscription required to join).
 *   - Commission accrues on every ACTUAL payment a referred customer
 *     makes (Stripe invoice.payment_succeeded), so churn self-corrects:
 *     a customer who cancels after 4 months earned the partner 4 months.
 *   - Each commission is held 30 days before it's payable, then paid
 *     manually once a month (admin marks it paid). No auto-payout.
 *
 * Data model (Firestore):
 *   partners/{partnerId}                       the partner record
 *   partners/{partnerId}/commissions/{invoiceId}   one per paid invoice
 *   users/{uid}.referredBy / referredPartnerId / referredAt   attribution
 */

export type PartnerTier = "standard" | "founder";

export type PartnerStatus = "active" | "suspended";

export interface Partner {
  id: string;              // doc id (random)
  code: string;            // the referral code that appears in /p/<code>
  name: string;
  email: string;
  tier: PartnerTier;       // display badge, DERIVED from rateYearOne (see tierFor)
  // Explicit per-partner rates (like Yooniz). These — not the tier — drive
  // the money. Defaults 0.25 / 0.10; a founder is simply someone whose
  // rateYearOne Gadi set to 0.30. Stored as fractions (0.25 = 25%).
  rateYearOne: number;
  rateLifetime: number;
  status: PartnerStatus;
  dashboardToken: string;  // secret that opens /partner/dashboard (no password)
  lang?: string | null;    // the partner's language — every email we send them
                           // (welcome, future payout notices) renders in it.
                           // Set at creation; defaults to "en" if unknown.
  audience?: string | null; // free-text "where's your audience" from signup
  clicks: number;          // referral-link hits
  signups: number;         // referred accounts created
  ownerUid?: string | null; // set if the partner also has a Gadit account
  createdAt: string;
}

/** Program defaults for a self-signup partner. */
export const DEFAULT_RATE_YEAR_ONE = 0.25;
export const DEFAULT_RATE_LIFETIME = 0.1;
/** What "founder" means when Gadi promotes someone. */
export const FOUNDER_RATE_YEAR_ONE = 0.3;

/** Badge label derived from the year-one rate — anyone at 30%+ is a
 *  "founder", everyone else is "standard". Keeps the badge honest even
 *  when Gadi types a custom rate. */
export function tierFor(rateYearOne: number): PartnerTier {
  return rateYearOne >= FOUNDER_RATE_YEAR_ONE ? "founder" : "standard";
}

/** Derived commission state — computed on read from timestamps, so no
 *  cron is needed to flip pending → released. "paid" is the only stored
 *  transition (an explicit admin action). */
export type CommissionState = "pending" | "released" | "paid";

export interface Commission {
  invoiceId: string;       // doc id — dedupes Stripe webhook retries
  referredUid: string;
  gross: number;           // the customer's payment, in the currency's minor units
  amount: number;          // the partner's cut (gross * rate), minor units
  currency: string;        // e.g. "ils", "usd"
  rate: number;            // 0.25 | 0.30 | 0.10
  yearOne: boolean;        // was this within the referred customer's first year
  createdAt: number;       // ms epoch
  releaseAt: number;       // ms epoch — payable after this
  paidAt?: number | null;  // ms epoch once an admin marks it paid
}

/** Commissions are held this long before they become payable. */
export const COMMISSION_HOLD_MS = 30 * 24 * 60 * 60 * 1000;

/** "Year one" window from the moment a customer was referred. */
export const YEAR_ONE_MS = 365 * 24 * 60 * 60 * 1000;

/** Minimum accrued (payable) balance before a payout is due, in the
 *  partner's main currency's minor units. Mirrors Yooniz's $50 floor. */
export const PAYOUT_MINIMUM_MINOR = 5000;

/** Cookie that carries the referring partner's id from the /p/<code>
 *  landing until the visitor creates an account. 60-day attribution
 *  window (matches the Yooniz promise that late signups still count). */
export const REFERRAL_COOKIE = "gadit_ref";
export const REFERRAL_TTL_DAYS = 60;

/** Commission rate for a tier, given whether the payment falls in the
 *  customer's first year. */
export function rateFor(tier: PartnerTier, yearOne: boolean): number {
  if (!yearOne) return 0.1;
  return tier === "founder" ? 0.3 : 0.25;
}

/** Derive the payout state of a commission at a given moment. */
export function commissionState(c: Pick<Commission, "paidAt" | "releaseAt">, now: number): CommissionState {
  if (c.paidAt) return "paid";
  return now >= c.releaseAt ? "released" : "pending";
}

/** Unambiguous 6-char code (no 0/O/1/I/L) so partners can dictate it
 *  by phone without confusion. */
export function generatePartnerCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Long opaque token for password-less dashboard access. */
export function generateDashboardToken(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 40; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
