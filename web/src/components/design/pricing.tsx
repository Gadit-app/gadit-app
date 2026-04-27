"use client";

/**
 * V2 Pricing page components — Screen 3 from the redesign pass.
 *
 * Layout (top to bottom):
 *   <PricingHero />              centered tagline + monthly/yearly toggle
 *   <PricingTiers billing/>      3 tier cards, Clear highlighted
 *   <TrustStrip />               4 reassurances on small cards
 *   <FAQ />                      5-question accordion
 *
 * State note: billing (monthly/yearly) is owned by the page-level
 * client component and threaded down. We don't push it to the URL
 * because the tier strip is a teaser elsewhere — this is the only
 * place it matters.
 *
 * Tier features are stored as ¶-delimited strings in the i18n table
 * (so each tier is one entry, not seven). We split on ¶ at render time.
 */

import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import type { Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { Eyebrow } from "./primitives";

type Billing = "monthly" | "yearly";

type Script = "latin" | "he" | "ar";

function scriptFor(lang: string): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}

function displayFontFor(script: Script): string {
  if (script === "he") return "gd-font-he";
  if (script === "ar") return "gd-font-ar";
  return "gd-font-display";
}

function periodSuffixes(lang: Lang): { mo: string; yr: string } {
  if (lang === "he") return { mo: "/חודש", yr: "/שנה" };
  if (lang === "ar") return { mo: "/شهر", yr: "/سنة" };
  return { mo: "/mo", yr: "/yr" };
}

// ─── PricingHero ─────────────────────────────────────────────────
// Centered headline + subline + monthly/yearly toggle (with the
// "Save 17%" pip animating in when yearly is selected).
function PricingHero({
  billing,
  setBilling,
}: {
  billing: Billing;
  setBilling: (b: Billing) => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const titleFont = displayFontFor(script);

  return (
    <section
      style={{
        // The original 9vw cap pushed the headline halfway down a 32"
        // monitor at 100% zoom, leaving the toggle just barely visible.
        // Cap is now 56px so the hero stays in the first viewport-third
        // on any reasonable display.
        paddingBlockStart: "clamp(32px, 5vw, 56px)",
        paddingBlockEnd: "clamp(24px, 4vw, 40px)",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h1
          className={titleFont}
          style={{
            fontSize: "clamp(36px, 5.5vw, 60px)",
            lineHeight: 1.1,
            color: "oklch(0.97 0.008 265)",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 96',
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }
              : {}),
          }}
        >
          {v2(lang, "pricingPageHeadline")}
        </h1>
        <p
          className="gd-font-sans-ui mx-auto"
          style={{
            marginTop: 20,
            fontSize: "clamp(15.5px, 1.6vw, 18px)",
            lineHeight: 1.55,
            color: "oklch(0.78 0.02 265)",
            maxWidth: 560,
          }}
        >
          {v2(lang, "pricingPageSubline")}
        </p>

        <div className="mt-10 inline-flex items-center gap-3">
          <div
            className="relative inline-flex"
            style={{
              padding: 4,
              borderRadius: 999,
              background: "oklch(0.18 0.05 265 / 0.7)",
              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.08)",
            }}
          >
            {(
              [
                ["monthly", v2(lang, "billingMonthly")],
                ["yearly", v2(lang, "billingYearly")],
              ] as const
            ).map(([key, label]) => {
              const active = billing === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBilling(key)}
                  className="gd-font-sans-ui font-medium relative transition-all"
                  style={{
                    fontSize: 13,
                    padding: "8px 18px",
                    borderRadius: 999,
                    color: active ? "white" : "oklch(0.7 0.02 265)",
                    background: active
                      ? "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))"
                      : "transparent",
                    boxShadow: active
                      ? "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 4px 14px oklch(0.5 0.2 250 / 0.35)"
                      : "none",
                  }}
                  aria-pressed={active}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {billing === "yearly" && (
            <span
              className="gd-font-sans-ui inline-flex items-center gap-1.5"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "oklch(0.82 0.1 245)",
                padding: "5px 11px",
                borderRadius: 999,
                background: "oklch(0.72 0.19 245 / 0.12)",
                boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)",
              }}
            >
              <span className="gd-tier-dot" />
              {v2(lang, "billingSave17")}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Single tier card ────────────────────────────────────────────
type TierData = {
  name: string;
  tagline: string;
  pitch: string;
  priceMonthly: string;
  priceYearly: string | null;
  equivalent: string; // when yearly, shown as sub-line ("equivalent to $X/mo")
  badge: string | null;
  highlight: boolean;
  cta: string;
  ctaYearly: string;
  trust: string | null;
  features: string[];
  onCta: () => void;
};

function TierCard({
  billing,
  tier,
}: {
  billing: Billing;
  tier: TierData;
}) {
  const { lang, dir } = useLang();
  const script = scriptFor(lang);
  const { mo, yr } = periodSuffixes(lang);

  const showYearly = billing === "yearly" && tier.priceYearly;
  const price = showYearly ? tier.priceYearly! : tier.priceMonthly;
  const period = tier.priceMonthly === "$0" ? "" : showYearly ? yr : mo;
  const subPrice = showYearly ? tier.equivalent : null;

  // Price font: Fraunces is gorgeous in Latin but reads ugly when the
  // surrounding numerals (e.g. "$2.99") are next to Hebrew/Arabic
  // characters. Switch to Rubik / Noto Naskh Arabic in those locales,
  // bumped to weight 600 so the number still feels confident.
  const priceFontClass =
    script === "he"
      ? "gd-font-he"
      : script === "ar"
        ? "gd-font-ar"
        : "gd-font-display";
  const priceFontStyle: React.CSSProperties =
    script === "latin"
      ? {
          fontVariationSettings: '"opsz" 96',
          letterSpacing: "-0.025em",
          fontWeight: 400,
        }
      : { fontWeight: 600, letterSpacing: "-0.01em" };

  // Color ramp depending on whether this card uses the inverted
  // (navy) treatment or the normal (paper) treatment. Defining once
  // here so every text element below can pick the right token without
  // a per-line conditional.
  const inverted = tier.highlight;
  const colorTitle = inverted ? "white" : "var(--gd-ink-900)";
  const colorBody = inverted ? "oklch(1 0 0 / 0.85)" : "var(--gd-ink-700)";
  const colorMuted = inverted ? "oklch(1 0 0 / 0.65)" : "var(--gd-ink-500)";
  const colorFaint = inverted ? "oklch(1 0 0 / 0.55)" : "var(--gd-ink-400)";
  const colorAccent = inverted ? "oklch(0.85 0.1 245)" : "oklch(0.5 0.18 250)";

  return (
    <div
      // Restore document direction inside each card so RTL flows
      // naturally; outer grid is dir="ltr" for universal price order.
      dir={dir}
      className={`relative h-full flex flex-col ${tier.highlight ? "gd-tier-popular" : ""}`}
      style={{
        // INVERTED CONTRAST for the highlighted tier (Clear).
        // Beta review: with 3 paper cards on navy, the only thing
        // distinguishing the "most popular" card was a thin blue ring
        // and a flag. The eye saw three identical cards. Now the
        // highlighted card flips to a navy gradient with white text —
        // it's *physically* a different card, not just decorated. The
        // outer two stay warm paper. Conversion-card hierarchy gets
        // immediate at-a-glance, which is the whole point of pricing
        // tier strips.
        borderRadius: 20,
        padding: "clamp(28px, 3vw, 36px) clamp(24px, 2.6vw, 30px) clamp(28px, 3vw, 32px)",
        zIndex: tier.highlight ? 1 : 0,
        ...(tier.highlight
          ? {
              // Highlighted: deep navy gradient, white text, electric
              // outer ring. Reads like a premium brand statement
              // instead of a mid-grade upgrade prompt.
              background:
                "linear-gradient(180deg, oklch(0.22 0.06 265) 0%, oklch(0.16 0.05 265) 100%)",
              color: "white",
              boxShadow:
                "0 0 0 1px oklch(0.72 0.19 245 / 0.4), " +
                "0 0 0 6px oklch(0.72 0.19 245 / 0.08), " +
                "0 28px 60px -20px oklch(0.5 0.2 250 / 0.5), " +
                "0 8px 22px -10px oklch(0.08 0.08 260 / 0.5)",
            }
          : {
              // Non-highlighted: warm paper card.
              background: "var(--gd-paper-50)",
              color: "var(--gd-ink-900)",
              boxShadow:
                "0 1px 0 0 oklch(1 0 0 / 0.04) inset, " +
                "0 0 0 1px oklch(1 0 0 / 0.06), " +
                "0 24px 60px -24px oklch(0.08 0.08 260 / 0.6), " +
                "0 8px 22px -10px oklch(0.08 0.08 260 / 0.5)",
            }),
      }}
    >
      {tier.badge && (
        <div
          className="absolute gd-font-sans-ui"
          style={{
            top: -12,
            insetInlineStart: 24,
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "white",
            padding: "5px 11px",
            borderRadius: 999,
            background:
              "linear-gradient(180deg, oklch(0.62 0.2 250), oklch(0.5 0.22 252))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.5), 0 4px 12px oklch(0.5 0.2 250 / 0.4)",
          }}
        >
          {tier.badge}
        </div>
      )}

      {/*
        Layout: name+tagline → pitch → price → CTA → trust → features.
        The price stays directly under the tier name (per design intent),
        and the FEATURES list is what flexes to fill any leftover height.
        That keeps the CTAs vertically aligned across all three cards
        even though Clear has a trust microcopy line that the others
        don't — the trust line sits in a flex-shrink-0 wrapper above
        the divider, so the price/CTA block above it has identical
        height across cards.
       */}
      {/* Tier name + tagline — centered.
          Inline `textAlign: "center"` + `dir="ltr"` for the brand row:
          Tailwind's `text-center` was being overridden by an ancestor's
          dir="rtl" + start-aligned cascade on certain mobile browsers,
          leaving "Free", "Clear", "Deep" hugging the start edge of the
          card. Inline style + an explicit dir on the wrapper forces
          centering regardless of the cascade. */}
      <div style={{ textAlign: "center" }}>
        {/* Tier name is the dominant brand element on the card —
            larger than the price (which is just a number). The tier
            name is what the user remembers. Was 22px → now ~38px,
            using the display serif so it carries the same weight as
            other display headers on the site. */}
        <div
          className="gd-font-display"
          style={{
            fontSize: "clamp(32px, 3.6vw, 40px)",
            lineHeight: 1,
            color: colorTitle,
            fontVariationSettings: '"opsz" 60',
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          {tier.name}
        </div>
        <div
          className="gd-font-sans-ui italic mt-2"
          style={{ fontSize: 13, color: colorAccent }}
        >
          {tier.tagline}
        </div>
      </div>
      {/* Pitch — centered, 2-line min-height so price row aligns
          across all three cards. */}
      <p
        className="gd-font-sans-ui mt-3"
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: colorMuted,
          minHeight: "calc(13.5px * 1.5 * 2)",
          textAlign: "center",
        }}
      >
        {tier.pitch}
      </p>

      {/* Price — centered, supporting role under the tier name. */}
      <div className="mt-6 flex items-baseline justify-center gap-1.5">
        <span
          className={priceFontClass}
          style={{
            fontSize: 36,
            lineHeight: 1,
            color: colorTitle,
            ...priceFontStyle,
          }}
        >
          {price}
        </span>
        {period && (
          <span
            className="gd-font-sans-ui"
            style={{ fontSize: 14, color: colorMuted }}
          >
            {period}
          </span>
        )}
      </div>
      {subPrice && (
        <div
          className="gd-font-sans-ui mt-1 text-center"
          style={{ fontSize: 11.5, color: colorFaint }}
        >
          {subPrice}
        </div>
      )}

      {/* Features list — visually CENTERED inside the card.
          The card itself uses textAlign:center for the brand row,
          tagline, pitch, and price; the features should sit in the
          same centered column. We achieve that by wrapping the <ul>
          in a centering flex parent and giving the <ul> a max-width
          that matches the rest of the centered content. Inside each
          <li>, the row is still a flex (icon then text) so the check
          leads the line on the right in RTL and the left in LTR
          naturally — but the BLOCK itself is centered in the card.
          flex-1 lets it grow vertically so the CTA below pins at the
          same Y across all three tiers. */}
      <div className="mt-7 flex-1 flex justify-center">
      <ul className="space-y-3" style={{ width: "fit-content" }}>
        {tier.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 gd-font-sans-ui"
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: colorBody,
              textAlign: "start",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                color: colorAccent,
                marginTop: 4,
                flexShrink: 0,
              }}
            >
              <path
                d="M3 7.5l2.5 2.5L11 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      </div>

      {/* CTA — anchors to the bottom of the card (features above use
          flex-1, so this row sits at the same Y across all three). */}
      <button
        type="button"
        onClick={tier.onCta}
        className="w-full mt-5 gd-font-sans-ui font-medium transition-transform hover:translate-y-[-1px]"
        style={{
          fontSize: 13.5,
          padding: "12px 18px",
          borderRadius: 12,
          ...(inverted
            ? {
                color: "white",
                background:
                  "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                boxShadow:
                  "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
              }
            : {
                color: "var(--gd-ink-900)",
                background: "oklch(0 0 0 / 0.04)",
                boxShadow: "inset 0 0 0 1px oklch(0.85 0.005 265)",
              }),
        }}
      >
        {showYearly ? tier.ctaYearly : tier.cta}
      </button>
      <div
        className="mt-3 gd-font-sans-ui text-center"
        style={{
          fontSize: 11.5,
          color: colorMuted,
          minHeight: 18,
        }}
      >
        {tier.trust ?? " "}
      </div>

    </div>
  );
}

// ─── PricingTiers ────────────────────────────────────────────────
// Stripe price IDs are public env vars (NEXT_PUBLIC_*) so the
// browser can name the right SKU when calling /api/create-checkout.
// The server still verifies the priceId against its own env vars
// before creating the session, so a tampered client can't pay for a
// different price.
const PRICE_CLEAR_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const PRICE_CLEAR_YEARLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY ?? "";
const PRICE_DEEP_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? "";
const PRICE_DEEP_YEARLY =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY ?? "";

export function PricingTiers({ billing }: { billing: Billing }) {
  const { lang } = useLang();
  const { promptLogin } = useAuth();

  // Common: kick off Stripe Checkout for the given priceId. Used by
  // both the Clear and Deep CTAs. promptLogin handles the "needs to
  // sign in first" path automatically — if the user is already
  // signed in, the modal is skipped and onSuccess fires immediately.
  async function startCheckout(priceId: string, freshUser: { getIdToken: () => Promise<string> }) {
    if (!priceId) {
      console.error("Missing Stripe priceId — env var not set");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    try {
      const idToken = await freshUser.getIdToken();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // 403 with email_not_verified: surface a friendly nudge, not
      // the same generic "could not open checkout" line. The user
      // needs a different action (check inbox), not a retry.
      if (res.status === 403 && data.error === "email_not_verified") {
        window.alert(
          lang === "he"
            ? "כדי לרכוש מנוי, יש לאמת את כתובת המייל. שלחנו לכם קישור אימות בהרשמה — בדקו את תיבת הדואר (וגם תיקיית הספאם)."
            : lang === "ar"
              ? "للاشتراك، يلزم تأكيد البريد الإلكتروني. أرسلنا لك رابط التأكيد عند التسجيل — افحص بريدك الوارد (وأيضًا مجلد البريد العشوائي)."
              : "Please verify your email before subscribing. We sent you a verification link when you signed up — check your inbox (and spam folder)."
        );
        return;
      }
      console.error("Checkout failed:", { status: res.status, body: data });
      window.alert(
        lang === "he"
          ? "לא הצלחנו לפתוח את עמוד התשלום. נסו שוב."
          : lang === "ar"
            ? "تعذر فتح صفحة الدفع. حاول مرة أخرى."
            : "Could not open the checkout page. Please try again."
      );
    } catch (err) {
      console.error("Checkout request failed:", err);
    }
  }

  function clickClear() {
    const priceId =
      billing === "yearly" ? PRICE_CLEAR_YEARLY : PRICE_CLEAR_MONTHLY;
    promptLogin({
      reason: v2(lang, "tierClearCta"),
      mode: "signup",
      onSuccess: (u) => startCheckout(priceId, u),
    });
  }

  function clickDeep() {
    const priceId =
      billing === "yearly" ? PRICE_DEEP_YEARLY : PRICE_DEEP_MONTHLY;
    promptLogin({
      reason: v2(lang, "tierDeepCta"),
      mode: "signup",
      onSuccess: (u) => startCheckout(priceId, u),
    });
  }

  function clickBasic() {
    // Basic is free — sign-up just gets them an account, then we
    // bounce them to the homepage to start searching.
    promptLogin({
      reason: v2(lang, "tierBasicCta"),
      mode: "signup",
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  }

  const tiers: TierData[] = [
    {
      name: "Basic",
      tagline: v2(lang, "tierBasicTagline"),
      pitch: v2(lang, "tierBasicPitch"),
      priceMonthly: "$0",
      priceYearly: null,
      equivalent: v2(lang, "basicEquivalent"),
      badge: null,
      highlight: false,
      cta: v2(lang, "tierBasicCta"),
      ctaYearly: v2(lang, "tierBasicCta"),
      trust: null,
      features: v2(lang, "tierBasicFeatures").split("¶"),
      onCta: clickBasic,
    },
    {
      name: "Clear",
      tagline: v2(lang, "tierClearTagline"),
      pitch: v2(lang, "tierClearPitch"),
      priceMonthly: "$2.99",
      priceYearly: "$29.99",
      equivalent: v2(lang, "clearEquivalent"),
      badge: v2(lang, "tierClearBadge"),
      highlight: true,
      cta: v2(lang, "tierClearCta"),
      ctaYearly: v2(lang, "tierClearCtaYearly"),
      trust: v2(lang, "tierClearTrust"),
      features: v2(lang, "tierClearFeatures").split("¶"),
      onCta: clickClear,
    },
    {
      name: "Deep",
      tagline: v2(lang, "tierDeepTagline"),
      pitch: v2(lang, "tierDeepPitch"),
      priceMonthly: "$4.99",
      priceYearly: "$49.99",
      equivalent: v2(lang, "deepEquivalent"),
      badge: null,
      highlight: false,
      cta: v2(lang, "tierDeepCta"),
      ctaYearly: v2(lang, "tierDeepCta"),
      trust: null,
      features: v2(lang, "tierDeepFeatures").split("¶"),
      onCta: clickDeep,
    },
  ];

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding:
          "clamp(24px, 2vw, 40px) clamp(16px, 3vw, 24px) clamp(24px, 4vw, 40px)",
      }}
    >
      {/* Tier order follows document direction:
          - LTR (en, ru, es, pt, fr): Basic | Clear | Deep (cheap → expensive)
          - RTL (he, ar):              Basic | Clear | Deep right-to-left,
                                       which means Basic on the visual right
                                       (where reading STARTS in RTL) — same
                                       logical order, mirrored physically.
          The original force-LTR was a misread of the convention; on RTL
          pages the cheap-to-expensive axis flows right-to-left like all
          other content, and beta tester confirmed Basic should lead on
          the right edge in Hebrew. */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {tiers.map((tier) => (
          <TierCard key={tier.name} billing={billing} tier={tier} />
        ))}
      </div>
    </section>
  );
}

// ─── TrustStrip ──────────────────────────────────────────────────
function TrustStrip() {
  const { lang } = useLang();
  const items = [
    v2(lang, "trustStripCancel"),
    v2(lang, "trustStripMoneyBack"),
    v2(lang, "trustStripDataYours"),
    v2(lang, "trustStripNoAds"),
  ];

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding:
          "clamp(24px, 4vw, 36px) clamp(16px, 3vw, 24px) clamp(30px, 5vw, 50px)",
      }}
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 gd-font-sans-ui"
            style={{
              fontSize: 12.5,
              lineHeight: 1.45,
              color: "oklch(0.72 0.02 265)",
              padding: "14px 16px",
              borderRadius: 12,
              background: "oklch(1 0 0 / 0.025)",
              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.05)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                color: "oklch(0.72 0.1 245)",
                marginTop: 2,
                flexShrink: 0,
              }}
            >
              <path
                d="M7 1.5l1.5 4.5h4.5l-3.5 2.5 1.3 4.5L7 10.5l-3.8 2.5 1.3-4.5L1 6h4.5L7 1.5z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────
function FAQ() {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const titleFont = displayFontFor(script);

  const items: Array<[string, string]> = [
    [v2(lang, "faqQ1"), v2(lang, "faqA1")],
    [v2(lang, "faqQ2"), v2(lang, "faqA2")],
    [v2(lang, "faqQ3"), v2(lang, "faqA3")],
    [v2(lang, "faqQ4"), v2(lang, "faqA4")],
    [v2(lang, "faqQ5"), v2(lang, "faqA5")],
  ];

  // Index of the open question (-1 means all collapsed). First open by default.
  const [open, setOpen] = useState<number>(0);

  return (
    <section
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding:
          "clamp(30px, 6vw, 70px) clamp(16px, 3vw, 24px) clamp(40px, 7vw, 80px)",
      }}
    >
      <div className="text-center mb-8">
        <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
          {v2(lang, "faqEyebrow")}
        </Eyebrow>
        <div
          className={titleFont}
          style={{
            fontSize: "clamp(24px, 3.2vw, 32px)",
            color: "oklch(0.95 0.008 265)",
            marginTop: 6,
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 48',
                  fontStyle: "italic",
                }
              : {}),
          }}
        >
          {v2(lang, "faqHeadline")}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="text-start w-full"
              style={{
                background: "oklch(0.20 0.05 265 / 0.55)",
                borderRadius: 14,
                padding: "clamp(16px, 2vw, 20px) clamp(18px, 2.4vw, 24px)",
                boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.07)",
                cursor: "pointer",
              }}
              aria-expanded={isOpen}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="gd-font-sans-ui font-medium"
                  style={{
                    fontSize: "clamp(14.5px, 1.5vw, 15.5px)",
                    color: "oklch(0.95 0.008 265)",
                  }}
                >
                  {q}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    color: "oklch(0.7 0.05 245)",
                    flexShrink: 0,
                    marginTop: 4,
                    transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                    transition: "transform .2s",
                  }}
                  aria-hidden="true"
                >
                  <path
                    d="M7 2v10M2 7h10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {isOpen && (
                <p
                  className={`mt-3 gd-font-sans-ui ${
                    isRtl ? "gd-rtl-body" : ""
                  }`}
                  style={{
                    fontSize: "clamp(13.5px, 1.4vw, 14.5px)",
                    lineHeight: 1.6,
                    color: "oklch(0.78 0.02 265)",
                  }}
                >
                  {a}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── HomePricingTeaser ──────────────────────────────────────────
// Compact pricing block for the homepage: section eyebrow + headline,
// then the same TierCards as /pricing (so the CTA wiring, layout,
// and copy are identical), then a short link to the full page.
// We deliberately don't include the monthly/yearly toggle here —
// the homepage teaser is one decision (start free? subscribe?), not
// a full pricing comparison.
export function HomePricingTeaser() {
  const { lang } = useLang();
  const script: Script = lang === "he" ? "he" : lang === "ar" ? "ar" : "latin";
  const titleFont = displayFontFor(script);

  return (
    <section
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding:
          "clamp(50px, 8vw, 100px) clamp(16px, 3vw, 24px) clamp(40px, 6vw, 80px)",
      }}
    >
      {/* Centered section header — same convention as ValueProps. */}
      <div className="mb-12 text-center">
        <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
          {v2(lang, "pricingEyebrow")}
        </Eyebrow>
        <div
          className={titleFont}
          style={{
            fontSize: "clamp(34px, 4.4vw, 52px)",
            lineHeight: 1.12,
            color: "white",
            marginTop: 12,
            maxWidth: 820,
            marginInline: "auto",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 96',
                  fontStyle: "italic",
                }
              : {}),
          }}
        >
          {v2(lang, "pricingTeaserTitle")}
        </div>
      </div>

      <PricingTiers billing="monthly" />
    </section>
  );
}

// ─── PricingPage (composition) ───────────────────────────────────
export function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <>
      <PricingHero billing={billing} setBilling={setBilling} />
      <PricingTiers billing={billing} />
      <TrustStrip />
      <FAQ />
    </>
  );
}
