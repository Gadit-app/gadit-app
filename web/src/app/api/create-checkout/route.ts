import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminAuth } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Every MONTHLY paid tier (Clear, Deep, Family) grants a 14-day trial.
// Yearly plans never get a trial — they're committing 12 months up
// front and the savings already incentivise the buy. The CTA text on
// /pricing for all three monthly tiers reads "Try 14 days free" so
// the checkout behaviour has to honour that promise.
const TRIAL_DAYS = 14;
const CLEAR_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const CLEAR_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_CLEAR_YEARLY ?? "";
const DEEP_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_DEEP_MONTHLY ?? "";
const DEEP_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_DEEP_YEARLY ?? "";
const FAMILY_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const FAMILY_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_FAMILY_YEARLY ?? "";
const SCHOOLS_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MONTHLY ?? "";
const SCHOOLS_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_YEARLY ?? "";
const SCHOOLS_MEDIUM_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_MONTHLY ?? "";
const SCHOOLS_MEDIUM_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_MEDIUM_YEARLY ?? "";
const SCHOOLS_LARGE_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ?? "";
const SCHOOLS_LARGE_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_SCHOOLS_LARGE_YEARLY ?? "";

function isFamilyPriceId(priceId: string): boolean {
  return (
    (!!FAMILY_MONTHLY_PRICE_ID && priceId === FAMILY_MONTHLY_PRICE_ID) ||
    (!!FAMILY_YEARLY_PRICE_ID && priceId === FAMILY_YEARLY_PRICE_ID)
  );
}

function isSchoolsPriceId(priceId: string): boolean {
  return (
    (!!SCHOOLS_MONTHLY_PRICE_ID && priceId === SCHOOLS_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_YEARLY_PRICE_ID && priceId === SCHOOLS_YEARLY_PRICE_ID) ||
    (!!SCHOOLS_MEDIUM_MONTHLY_PRICE_ID && priceId === SCHOOLS_MEDIUM_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_MEDIUM_YEARLY_PRICE_ID && priceId === SCHOOLS_MEDIUM_YEARLY_PRICE_ID) ||
    (!!SCHOOLS_LARGE_MONTHLY_PRICE_ID && priceId === SCHOOLS_LARGE_MONTHLY_PRICE_ID) ||
    (!!SCHOOLS_LARGE_YEARLY_PRICE_ID && priceId === SCHOOLS_LARGE_YEARLY_PRICE_ID)
  );
}

// Every paid price (monthly OR yearly) grants the 14-day trial.
// Gadi 2026-06-28 audit (pricing council) flagged the previous
// monthly-only trial as backwards: yearly plans are higher commitment
// and need MORE trust, not less. Yearly buyers now get the same 14
// days to bail before the card charges, which removes the friction
// of "should I risk $89 now or take the safer $8.99/mo." path.
const ALL_PAID_PRICE_IDS = new Set(
  [
    CLEAR_MONTHLY_PRICE_ID,
    CLEAR_YEARLY_PRICE_ID,
    DEEP_MONTHLY_PRICE_ID,
    DEEP_YEARLY_PRICE_ID,
    FAMILY_MONTHLY_PRICE_ID,
    FAMILY_YEARLY_PRICE_ID,
    SCHOOLS_MONTHLY_PRICE_ID,
    SCHOOLS_YEARLY_PRICE_ID,
    SCHOOLS_LARGE_MONTHLY_PRICE_ID,
    SCHOOLS_LARGE_YEARLY_PRICE_ID,
  ].filter(Boolean),
);

// Stripe Checkout locales we can pass straight through. Arabic and
// Hindi are not supported by Stripe Checkout — those fall back to
// "auto" (browser Accept-Language). Launch QA 2026-07-03: previously
// no locale was sent at all, so a Hebrew-UI user with an English
// browser got an English checkout page.
const STRIPE_LOCALES = new Set([
  "he", "en", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja",
]);

/** Lang prefix for return URLs — mirrors buildHref: English is the
 *  canonical unprefixed surface, every other lang gets /<lang>. */
function langPrefix(lang: string): string {
  if (!lang || lang === "en") return "";
  return `/${lang}`;
}

export async function POST(req: NextRequest) {
  try {
    const { priceId, lang: rawLang } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    const lang = typeof rawLang === "string" && /^[a-z]{2}$/.test(rawLang) ? rawLang : "en";

    // Resolve user from the verified Firebase ID token, NOT from a client-supplied
    // userId. Otherwise a malicious user could start a checkout that credits a
    // different account on webhook completion.
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    const userId = decoded.uid;
    const userEmail = decoded.email ?? undefined;

    // (Removed) Email-verification gate that was blocking checkout.
    // Firebase's default verification email goes through their generic
    // sender and is reliably classified as spam by Gmail / Outlook /
    // Seznam (Czech), so non-Google sign-ups got stuck behind a wall
    // they couldn't get past — multiple beta testers, including a
    // user in the Czech Republic trying the Clear trial, hit this and
    // never received the email. Stripe Checkout itself requires a real
    // payment instrument (card + billing address + cardholder name),
    // which is a substantially stronger 'this is a real human who can
    // be billed' check than email round-trip. The verification email
    // is still sent on signup — verified emails are still nicer for
    // password resets and receipts — but it's no longer load-bearing
    // for purchase.

    // Every paid price (Clear / Deep / Family / Schools, monthly or
    // yearly, Small or Large) grants the 14-day trial. The earlier
    // "monthly only" rule was reversed in the 2026-06-28 pricing
    // audit — see ALL_PAID_PRICE_IDS comment above.
    const grantsTrial = ALL_PAID_PRICE_IDS.has(priceId);

    const isFamily = isFamilyPriceId(priceId);
    const isSchools = isSchoolsPriceId(priceId);

    // Success URL routes the buyer to the right post-checkout home:
    //   Family   → /family?welcome=1     (parent sees the "add your kids" state)
    //   Schools  → /schools?welcome=1    (principal sees the "add your classes" state)
    //   Other    → /?success=1           (single-user checkout, lands on home)
    // Both URLs carry the user's language prefix so a Hebrew buyer
    // returns to /he/... and not the English site. Launch QA 2026-07-03.
    const prefix = langPrefix(lang);
    const successPath = isSchools
      ? `${prefix}/schools?welcome=1`
      : isFamily
        ? `${prefix}/family?welcome=1`
        : `${prefix}/?success=1`;
    const cancelPath = `${prefix}/?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      // Enable promotion codes so Gadi can ship one-off "first month free"
      // coupons to specific people (school principals, family/friend gifts,
      // launch partners) without having to manually provision their
      // accounts. Coupon codes are created in the Stripe dashboard.
      allow_promotion_codes: true,
      // Checkout page language follows the app UI language when Stripe
      // supports it; otherwise Stripe auto-detects from the browser.
      locale: (STRIPE_LOCALES.has(lang) ? lang : "auto") as NonNullable<Stripe.Checkout.Session["locale"]>,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}${successPath}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://gadit.app"}${cancelPath}`,
      metadata: {
        userId,
        ...(isFamily && { isFamily: "1" }),
        ...(isSchools && { isSchools: "1" }),
      },
      ...(grantsTrial && {
        subscription_data: {
          trial_period_days: TRIAL_DAYS,
          // If user cancels during trial → keep access until trial end (Stripe handles this).
          // If trial ends without payment method (shouldn't happen — Checkout collects card) → cancel.
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
        },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
