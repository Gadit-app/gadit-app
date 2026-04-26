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
        paddingBlockStart: "clamp(56px, 9vw, 110px)",
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
  const { lang } = useLang();
  const { mo, yr } = periodSuffixes(lang);

  const showYearly = billing === "yearly" && tier.priceYearly;
  const price = showYearly ? tier.priceYearly! : tier.priceMonthly;
  const period = tier.priceMonthly === "$0" ? "" : showYearly ? yr : mo;
  const subPrice = showYearly ? tier.equivalent : null;

  return (
    <div
      className="relative h-full"
      style={{
        borderRadius: 22,
        padding: "clamp(26px, 3vw, 34px) clamp(24px, 2.6vw, 30px) clamp(28px, 3vw, 30px)",
        background: tier.highlight
          ? "linear-gradient(180deg, oklch(0.24 0.07 260 / 0.9), oklch(0.18 0.06 265 / 0.9))"
          : "oklch(0.20 0.05 265 / 0.55)",
        boxShadow: tier.highlight
          ? "inset 0 0 0 1.5px oklch(0.72 0.19 245 / 0.65), 0 0 0 6px oklch(0.72 0.19 245 / 0.08), 0 24px 48px -16px oklch(0.5 0.2 250 / 0.5)"
          : "inset 0 0 0 1px oklch(1 0 0 / 0.08), 0 8px 22px -10px oklch(0.08 0.08 260 / 0.35)",
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
            color: "oklch(0.18 0.06 265)",
            padding: "5px 11px",
            borderRadius: 999,
            background:
              "linear-gradient(180deg, oklch(0.88 0.1 245), oklch(0.78 0.16 245))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.5), 0 4px 12px oklch(0.5 0.2 250 / 0.4)",
          }}
        >
          {tier.badge}
        </div>
      )}

      <div className="flex items-baseline justify-between mb-1">
        <div
          className="gd-font-sans-ui font-semibold"
          style={{ fontSize: 16, color: "oklch(0.96 0.008 265)" }}
        >
          {tier.name}
        </div>
        <span
          className="gd-font-sans-ui italic"
          style={{ fontSize: 12, color: "oklch(0.72 0.05 245)" }}
        >
          {tier.tagline}
        </span>
      </div>
      <p
        className="gd-font-sans-ui mt-3"
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "oklch(0.78 0.02 265)",
        }}
      >
        {tier.pitch}
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span
          className="gd-font-display"
          style={{
            fontSize: 48,
            lineHeight: 1,
            color: "oklch(0.97 0.008 265)",
            fontVariationSettings: '"opsz" 96',
            letterSpacing: "-0.025em",
            fontWeight: 400,
          }}
        >
          {price}
        </span>
        {period && (
          <span
            className="gd-font-sans-ui"
            style={{ fontSize: 14, color: "oklch(0.62 0.02 265)" }}
          >
            {period}
          </span>
        )}
      </div>
      {subPrice && (
        <div
          className="gd-font-sans-ui mt-1"
          style={{ fontSize: 11.5, color: "oklch(0.55 0.02 265)" }}
        >
          {subPrice}
        </div>
      )}

      <button
        type="button"
        onClick={tier.onCta}
        className="w-full mt-6 gd-font-sans-ui font-medium"
        style={{
          fontSize: 13.5,
          padding: "12px 18px",
          borderRadius: 12,
          ...(tier.highlight
            ? {
                color: "white",
                background:
                  "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                boxShadow:
                  "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
              }
            : {
                color: "oklch(0.95 0.01 265)",
                background: "oklch(1 0 0 / 0.06)",
                boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.14)",
              }),
        }}
      >
        {showYearly ? tier.ctaYearly : tier.cta}
      </button>

      {tier.trust && (
        <div
          className="mt-3 gd-font-sans-ui text-center"
          style={{ fontSize: 11.5, color: "oklch(0.6 0.02 265)" }}
        >
          {tier.trust}
        </div>
      )}

      <ul className="mt-7 space-y-3">
        {tier.features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 gd-font-sans-ui"
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: "oklch(0.85 0.015 265)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                color: "oklch(0.82 0.1 245)",
                marginTop: 4,
                flexShrink: 0,
              }}
            >
              <path
                d="M3 7.5l2.5 2.5L11 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PricingTiers ────────────────────────────────────────────────
function PricingTiers({ billing }: { billing: Billing }) {
  const { lang } = useLang();
  const { promptLogin } = useAuth();

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
      onCta: () => promptLogin(v2(lang, "tierBasicCta")),
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
      onCta: () => promptLogin(v2(lang, "tierClearCta")),
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
      onCta: () => promptLogin(v2(lang, "tierDeepCta")),
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
