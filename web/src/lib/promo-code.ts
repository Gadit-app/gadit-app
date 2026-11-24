import type Stripe from "stripe";

/**
 * Promotion codes (Gadi 2026-11-24): the payment page has no coupon field
 * any more, so a code only reaches checkout inside a link we hand out
 * (/checkout?price=...&code=CODE). A code in RETIRED stops working here
 * even while it is still active in Stripe.
 */
const RETIRED = new Set(["CCEAV"]);

/** The active Stripe promotion code id for `code`, or null when it is unknown, inactive or retired. */
export async function activePromoId(stripe: Stripe, code: unknown): Promise<string | null> {
  if (typeof code !== "string") return null;
  const c = code.trim().toUpperCase();
  if (!c || RETIRED.has(c)) return null;
  const list = await stripe.promotionCodes.list({ code: c, active: true, limit: 1 });
  return list.data[0]?.id ?? null;
}
