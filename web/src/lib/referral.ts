/**
 * Member-gets-member customer referral loop (Yooniz-style), distinct from the
 * PARTNER/affiliate program (lib/partners.ts). Every signed-in user gets a
 * personal invite link; when a friend signs up through it and later pays, the
 * referrer earns a reward.
 *
 * v1 scope (2026-08-26, pre-launch): the acquisition mechanic + tracking only.
 * Signup and payment are ATTRIBUTED and counted, and a reward is recorded as
 * "owed" for the admin to grant. Deliberately NO billing-path changes (no
 * coupons, no trial tweaks) so the loop cannot destabilise the Sept 1 launch.
 * Automated payout is a post-launch v2.
 */

/** Attribution cookie carrying the referrer's code (NOT the partner cookie). */
export const REFERRAL_USER_COOKIE = "gadit_uref";
/** Same 60-day window as the partner cookie. */
export const REFERRAL_USER_TTL_DAYS = 60;

// Unambiguous alphabet: no 0/O/1/I/L so a code read aloud or typed can't be
// mistyped into someone else's link.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 6;

/** Generate a short, shareable, human-safe referral code. Server-side only
 *  (uses Math.random, which is fine outside the workflow sandbox). */
export function generateReferralCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** The public invite URL for a code. */
export function inviteUrl(code: string): string {
  return `https://www.gadit.app/invite/${code}`;
}
