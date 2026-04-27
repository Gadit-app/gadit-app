"use client";

/**
 * V2 Homepage components — Screen 2 from the redesign pass.
 *
 * Layout (top to bottom):
 *   <MarketingHeader />          (separate file — auth-aware)
 *   <HomeHero />                 hero badge + 2-line tagline + subline
 *   <HomeSearch />               big search-as-CTA + suggestion chips
 *   <ResultTease />              tiny "preview" of a result card
 *   <ValueProps />               4-up grid of differentiators
 *   <HomePricingTeaser />        3-tier strip (lives in pricing.tsx;
 *                                same TierCards as /pricing)
 *   <HomeFooter />               minimal: Product / Legal columns
 *
 * Designed against the V2 design system: gd-stage canvas, gd-card
 * surfaces, electric-blue ring motif, Fraunces for display,
 * Geist for UI, Rubik / Noto Naskh for RTL.
 *
 * All copy comes from the v2() i18n helper — no hardcoded English.
 * Performance mode (mobile + reduced-motion) is handled in globals.css.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useAuth } from "@/lib/auth-context";
import {
  Eyebrow,
  MeaningBadge,
  TierBadge,
  Wordmark,
} from "./primitives";
import { LangSwitcher } from "./LangSwitcher";
import VoiceInput from "@/components/VoiceInput";

type Script = "latin" | "he" | "ar";

function scriptFor(lang: string): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}

function fontClassFor(script: Script, latinDefault = "gd-font-display"): string {
  if (script === "he") return "gd-font-he gd-rtl-title";
  if (script === "ar") return "gd-font-ar gd-rtl-title";
  return latinDefault;
}

// ─── HomeHero ────────────────────────────────────────────────────
// Two-line tagline (line 1 = white, line 2 = electric blue italic).
// Above it: a small "Launching May 1" badge with the pulsing tier dot.
export function HomeHero() {
  const { lang, dir } = useLang();
  const script = scriptFor(lang);
  const isRtl = dir === "rtl";

  const titleFont = fontClassFor(script);

  return (
    <section
      style={{
        // Was 12vw → 120px cap, which left an enormous void above the
        // headline on a 32" monitor at 100% zoom and pushed Dream
        // (the preview) below the fold. Tightened so the hero fits in
        // the first viewport-half on any reasonable display.
        paddingBlockStart: "clamp(28px, 5vw, 56px)",
        paddingBlockEnd: "clamp(20px, 3vw, 36px)",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <div
          className="gd-font-sans-ui inline-flex items-center gap-2 mb-6"
          style={{
            fontSize: 11.5,
            // Hebrew/Arabic don't have casing; tracking is jarring on
            // those scripts (creates artificial gaps between letters).
            // Latin scripts keep the uppercase + tracked treatment.
            letterSpacing: script === "latin" ? "0.16em" : "0",
            textTransform: script === "latin" ? "uppercase" : "none",
            color: "oklch(0.85 0.05 245)",
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 999,
            background: "oklch(0.72 0.19 245 / 0.1)",
            boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)",
          }}
        >
          <span className="gd-tier-dot" />
          {v2(lang, "homeBadgeLaunching")}
        </div>

        {/* Headline is one line (was two stacked spans). The second
            phrase is still rendered in electric blue + italic for the
            Latin scripts so the eye lands on it as the resolution of
            the verb — but it's inline now so the hero takes ~half the
            vertical space it used to. Cap is also lower (was 96px,
            now 72px) to fit "Understand to the end." on a single line
            at desktop width. */}
        <h1
          className={titleFont}
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.05,
            fontWeight: 400,
            color: "oklch(0.97 0.008 265)",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 144, "SOFT" 80',
                  letterSpacing: "-0.025em",
                }
              : {}),
          }}
        >
          {v2(lang, "homeHeadlineLine1")}{" "}
          <span
            style={{
              color: "oklch(0.82 0.1 245)",
              fontStyle: script === "latin" ? "italic" : "normal",
            }}
          >
            {v2(lang, "homeHeadlineLine2")}
          </span>
        </h1>

        <p
          className="gd-font-sans-ui"
          style={{
            marginTop: 24,
            fontSize: "clamp(16px, 1.6vw, 19px)",
            lineHeight: 1.55,
            color: "oklch(0.78 0.02 265)",
            maxWidth: 620,
            marginInlineStart: 0,
          }}
        >
          {v2(lang, "homeSubline")}
        </p>
      </div>
    </section>
  );
}

// ─── HomeSearch ──────────────────────────────────────────────────
// Single Google-style search bar. Magnifying glass on the visual
// LEFT, voice input on the visual RIGHT — same physical layout as
// Google in any locale. No suggestion chips, no context hint, no
// "Try X" eyebrow — beta tester wanted a clean, unambiguous search.
// Open access: anonymous visitors get 5 searches/day before the
// soft wall.
export function HomeSearch() {
  const { lang, dir } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const isRtl = dir === "rtl";
  const [query, setQuery] = useState("");

  function go(word: string) {
    const trimmed = word.trim();
    if (!trimmed) return;
    router.push(`/word/${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit() {
    if (query.trim()) go(query);
  }

  // Bridge for VoiceInput → input field. The component handles the
  // recording/transcription itself; we just receive the text and
  // either fill the field or jump straight to the result if the
  // user already had something typed and the voice was an addition.
  function handleVoiceResult(text: string) {
    const t = text.trim();
    if (!t) return;
    setQuery(t);
    go(t);
  }

  // Voice input needs an ID token (paid tiers gated server-side);
  // for anonymous and Basic users the API still works but rate-
  // limits — we let the component decide what to surface.
  async function getIdToken(): Promise<string | null> {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }

  return (
    <section
      style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}
    >
      {/* Clean search bar — Google-style. Hard-coded `dir="ltr"` on
          the cradle so the layout stays icon-left / mic-right in any
          UI locale (Google itself does this — even on hebrew.google.com
          the magnifying glass is on the left). The INPUT element gets
          dir={dir} so the user's typing flows the right way. */}
      <div
        dir="ltr"
        className="relative"
        style={{
          background: "var(--gd-paper-50)",
          borderRadius: 999,
          boxShadow:
            "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.4), " +
            "0 0 0 6px oklch(0.72 0.19 245 / 0.08), " +
            "0 30px 60px -20px oklch(0.5 0.2 250 / 0.45)",
        }}
      >
        <div
          className="flex items-center gap-3"
          style={{ padding: "12px 18px" }}
        >
          {/* Magnifying glass — LEFT side, click submits */}
          <button
            type="button"
            onClick={handleSubmit}
            aria-label={v2(lang, "explain")}
            style={{
              flexShrink: 0,
              background: "transparent",
              padding: 6,
              cursor: "pointer",
              color: "var(--gd-ink-500)",
              display: "inline-flex",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m15 15 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          {/* Input fills the middle. dir={dir} on the input itself so
              Hebrew/Arabic text flows correctly while the cradle stays
              left-magnifier / right-mic. */}
          <input
            className="bg-transparent outline-none gd-font-sans-ui"
            style={{
              flex: "1 1 0",
              minWidth: 0,
              color: "var(--gd-ink-900)",
              // 16px floor — prevents iOS Safari from auto-zooming
              // into the input on focus.
              fontSize: "clamp(16px, 1.5vw, 18px)",
              textAlign: isRtl ? "right" : "left",
            }}
            placeholder={v2(lang, "searchPlaceholderHome")}
            dir={dir}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {/* Voice input — RIGHT side, mirrors Google's mic position.
              Always enabled (the API itself rate-limits anonymous use
              if needed). The component handles its own recording UI
              + Whisper transcription via /api/transcribe. */}
          <VoiceInput
            uiLang={lang}
            getIdToken={getIdToken}
            onResult={handleVoiceResult}
            enabled={true}
            size="sm"
            title={v2(lang, "voiceInputTitle")}
          />
        </div>
      </div>

      {/* Suggestion chips and context hint were removed per beta
          feedback — the cradle alone is the entire CTA. The hero
          headline + subline above it set context; nothing further
          below is needed. */}
    </section>
  );
}

// ─── ResultTease ─────────────────────────────────────────────────
// A tiny "what a result looks like" card under the hero — proof
// without making the user search.
export function ResultTease() {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const titleFont = fontClassFor(script);

  // Per-locale demo word so each language sees something native.
  const sample =
    lang === "he"
      ? {
          word: "חלום",
          langLabel: "עברית",
          def: "רצף של דימויים שמופיעים בתודעה בזמן השינה.",
          ex: "הוא התעורר מחלום מוזר על עיר שצפה מעל הים.",
        }
      : lang === "ar"
        ? {
            word: "حُلم",
            langLabel: "العربية",
            def: "سلسلة من الصور والأفكار تمر في الذهن أثناء النوم.",
            ex: "رأى في حلمه مدينةً تطفو فوق البحر.",
          }
        : {
            word: "dream",
            langLabel: "English",
            def: "A series of thoughts, images, or sensations occurring in the mind during sleep.",
            ex: "I had a strange dream last night about flying over a forest of glass.",
          };

  return (
    <section
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "0 24px",
        marginBlockStart: "clamp(36px, 6vw, 72px)",
      }}
    >
      <div
        className="gd-font-sans-ui mb-3 inline-flex items-center gap-2 ms-2"
        style={{
          fontSize: 11,
          color: "oklch(0.62 0.02 265)",
          letterSpacing: script === "latin" ? "0.16em" : 0,
          textTransform: script === "latin" ? "uppercase" : "none",
          fontWeight: 600,
        }}
      >
        <span className="gd-tier-dot" />
        {v2(lang, "previewLabel")}
      </div>

      <div
        className="gd-card relative"
        style={{ padding: "clamp(22px, 3vw, 32px) clamp(22px, 3vw, 36px)" }}
      >
        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
          <Eyebrow>{sample.langLabel}</Eyebrow>
          <span style={{ color: "var(--gd-ink-300)" }}>·</span>
          <span
            className="gd-font-sans-ui italic"
            style={{
              fontSize: 10.5,
              color: "var(--gd-ink-500)",
            }}
          >
            noun
          </span>
        </div>

        <div className="flex items-baseline gap-6 justify-between flex-wrap">
          <h3
            className={titleFont}
            style={{
              fontSize: "clamp(40px, 6vw, 60px)",
              color: "var(--gd-ink-900)",
              letterSpacing: script === "latin" ? "-0.025em" : 0,
              lineHeight: 1.05,
              fontWeight: 400,
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 96' }
                : {}),
            }}
          >
            {sample.word}
          </h3>
          <TierBadge tier="clear" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div
            className={`flex items-start gap-3 `}
          >
            <MeaningBadge n={1} />
            <div className="flex-1 min-w-0">
              <p
                className={
                  script === "latin"
                    ? "gd-font-display"
                    : script === "he"
                      ? "gd-font-he gd-rtl-body"
                      : "gd-font-ar gd-rtl-body"
                }
                style={{
                  fontSize: "clamp(17px, 1.7vw, 19px)",
                  lineHeight: 1.4,
                  color: "var(--gd-ink-900)",
                  ...(script === "latin"
                    ? { fontVariationSettings: '"opsz" 24' }
                    : {}),
                }}
              >
                {sample.def}
              </p>
              <p
                className={`mt-2 ${
                  script === "latin"
                    ? "gd-font-display"
                    : script === "he"
                      ? "gd-font-he gd-rtl-body"
                      : "gd-font-ar gd-rtl-body"
                }`}
                style={{
                  fontSize: "clamp(14.5px, 1.4vw, 15.5px)",
                  lineHeight: 1.55,
                  color: "var(--gd-ink-500)",
                  fontStyle: script === "latin" ? "italic" : "normal",
                }}
              >
                {sample.ex}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        {/* Was linking to /pricing — bait-and-switch: the copy
            promises "see the full result" but the click landed on a
            tier comparison instead. Now goes to the actual /word/[X]
            page so the visitor gets what was promised: all meanings,
            examples, etymology, idioms. The conversion CTAs (save to
            notebook, generate image, compose) live inside that page
            and surface naturally as the user explores. */}
        <Link
          href={`/word/${encodeURIComponent(sample.word)}`}
          className="gd-font-sans-ui inline-flex items-center gap-2 hover:text-white transition-colors"
          style={{ fontSize: 12.5, color: "oklch(0.78 0.05 245)" }}
        >
          {v2(lang, "seeFullResult")}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d={isRtl ? "M9 6H3m0 0l3 3m-3-3l3-3" : "M3 6h6m0 0L6 3m3 3L6 9"}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// ─── ValueProps ──────────────────────────────────────────────────
// 4-up grid of differentiators. Each is a labelled card on the navy
// canvas with a backdrop-blur (disabled in mobile perf mode).
export function ValueProps() {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  const props = [
    {
      eyebrow: v2(lang, "valueProp1Eyebrow"),
      title: v2(lang, "valueProp1Title"),
      body: v2(lang, "valueProp1Body"),
    },
    {
      eyebrow: v2(lang, "valueProp2Eyebrow"),
      title: v2(lang, "valueProp2Title"),
      body: v2(lang, "valueProp2Body"),
    },
    {
      eyebrow: v2(lang, "valueProp3Eyebrow"),
      title: v2(lang, "valueProp3Title"),
      body: v2(lang, "valueProp3Body"),
    },
    {
      eyebrow: v2(lang, "valueProp4Eyebrow"),
      title: v2(lang, "valueProp4Title"),
      body: v2(lang, "valueProp4Body"),
    },
  ];

  const titleFontClass =
    script === "latin"
      ? "gd-font-display"
      : script === "he"
        ? "gd-font-he"
        : "gd-font-ar";

  return (
    <section
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding:
          "clamp(64px, 10vw, 130px) clamp(16px, 3vw, 24px) clamp(30px, 5vw, 60px)",
      }}
    >
      {/* Section header — centered, larger, more presence. Landing-
          page convention is centered headers (Stripe / Linear /
          Notion all do this); right-aligned felt off-balance against
          the centered card grid below. */}
      <div className="mb-12 text-center">
        <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
          {v2(lang, "valuePropsEyebrow")}
        </Eyebrow>
        <h2
          className={titleFontClass}
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
          {v2(lang, "valuePropsTitle")}
        </h2>
      </div>

      {/* Cards now share the wordmark's electric-blue palette — same
          gradient, same ring glow — so the section reads as branded
          surface rather than the neutral navy of the page. Title and
          body are pure white for high contrast against the blue. */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 gd-mobile-flat">
        {props.map((p) => (
          <div
            key={p.eyebrow}
            className="gd-mobile-flat"
            style={{
              borderRadius: 18,
              padding: "clamp(22px, 2.6vw, 28px) clamp(22px, 2.8vw, 30px)",
              background:
                "linear-gradient(180deg, oklch(0.4 0.18 250) 0%, oklch(0.32 0.16 255) 100%)",
              boxShadow:
                "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.45), " +
                "0 0 0 4px oklch(0.72 0.19 245 / 0.06), " +
                "0 14px 36px -16px oklch(0.08 0.08 260 / 0.55)",
            }}
          >
            <Eyebrow style={{ color: "oklch(0.92 0.05 240)" }}>
              {p.eyebrow}
            </Eyebrow>
            <div
              className={titleFontClass}
              style={{
                fontSize: "clamp(21px, 2.2vw, 25px)",
                lineHeight: 1.25,
                color: "white",
                marginTop: 10,
                ...(script === "latin"
                  ? { fontVariationSettings: '"opsz" 32' }
                  : {}),
              }}
            >
              {p.title}
            </div>
            <p
              className={`mt-3 gd-font-sans-ui ${
                isRtl ? "gd-rtl-body" : ""
              }`}
              style={{
                fontSize: "clamp(14px, 1.4vw, 15px)",
                lineHeight: 1.55,
                color: "oklch(1 0 0 / 0.85)",
              }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


// ─── HomeFooter ──────────────────────────────────────────────────
// Minimal: Wordmark + tagline + 2 link columns (Product / Legal).
export function HomeFooter() {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";

  const productLinks: Array<{ label: string; href: string }> = [
    { label: v2(lang, "footerCompare"), href: "/compare" },
    { label: v2(lang, "footerNotebook"), href: "/notebook" },
    { label: v2(lang, "footerPricing"), href: "/pricing" },
  ];
  const legalLinks: Array<{ label: string; href: string }> = [
    { label: v2(lang, "footerPrivacy"), href: "/privacy" },
    { label: v2(lang, "footerTerms"), href: "/terms" },
    { label: v2(lang, "footerContact"), href: "/contact" },
  ];

  return (
    // Footer is forced to LTR layout regardless of UI locale: logo
    // anchored to the LEFT, nav columns to the RIGHT. This is the
    // dominant convention across SaaS sites (Notion, Vercel, Stripe,
    // Apple, GitHub) and gives the brand mark a stable position
    // when users switch languages mid-session — the wordmark doesn't
    // visually "jump" sides each time the locale flips. Inside each
    // nav column the link labels respect the document direction
    // (textAlign: start) so Hebrew/Arabic labels still right-align
    // within their column.
    <footer
      dir="ltr"
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding:
          "clamp(36px, 5vw, 60px) clamp(16px, 3vw, 24px) clamp(28px, 4vw, 36px)",
        borderTop: "1px solid oklch(1 0 0 / 0.06)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div style={{ maxWidth: 320 }}>
          <Wordmark />
          <p
            dir={dir}
            className="mt-3 gd-font-sans-ui"
            style={{
              fontSize: 12.5,
              color: "oklch(0.6 0.02 265)",
              lineHeight: 1.55,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {v2(lang, "footerTagline")}
          </p>
        </div>
        <div
          dir={dir}
          className="grid grid-cols-2 gap-6 md:gap-12"
          style={{ textAlign: isRtl ? "right" : "left" }}
        >
          <div>
            <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
              {v2(lang, "footerProductGroup")}
            </Eyebrow>
            <ul className="mt-3 space-y-2 gd-font-sans-ui">
              {productLinks.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="hover:text-white transition-colors"
                    style={{ fontSize: 13, color: "oklch(0.78 0.02 265)" }}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
              {v2(lang, "footerLegalGroup")}
            </Eyebrow>
            <ul className="mt-3 space-y-2 gd-font-sans-ui">
              {legalLinks.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="hover:text-white transition-colors"
                    style={{ fontSize: 13, color: "oklch(0.78 0.02 265)" }}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div
        className="mt-10 pt-6 flex items-center justify-between gap-4 flex-wrap gd-font-sans-ui"
        style={{
          fontSize: 11,
          color: "oklch(0.5 0.02 265)",
          borderTop: "1px solid oklch(1 0 0 / 0.04)",
        }}
      >
        <span>© 2026 Gadit</span>
        {/* Language picker — duplicated from the header so the user
            who scrolls past the fold without noticing the header still
            has a way to switch, and so search engines see the locale
            map at the bottom (i18n hygiene). placement="top" so the
            dropdown opens UPWARD — at the footer the panel would
            otherwise extend below the page edge and clip on mobile. */}
        <LangSwitcher variant="muted" placement="top" />
        <span>{v2(lang, "footerLanguagesNote")}</span>
      </div>
    </footer>
  );
}
