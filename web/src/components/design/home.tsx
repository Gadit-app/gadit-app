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
 *   <TierStrip />                3-tier teaser (full pricing is /pricing)
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
            letterSpacing: "0.16em",
            textTransform: "uppercase",
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

        <h1
          className={titleFont}
          style={{
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 1.02,
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
          <span style={{ display: "block" }}>
            {v2(lang, "homeHeadlineLine1")}
          </span>
          <span
            style={{
              display: "block",
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
// The big homepage search bar — visually distinct from Screen 1's
// compact persistent search. Glowing electric-blue cradle, suggestion
// chips below. Signed-out users still see the input but submit opens
// login; signed-in users navigate straight to /word/[word].
export function HomeSearch() {
  const { lang, dir } = useLang();
  const { user, promptLogin } = useAuth();
  const router = useRouter();
  const isRtl = dir === "rtl";
  const [query, setQuery] = useState("");

  // Suggestion chips per locale — multilingual receipt by design.
  const suggestions: string[] =
    lang === "he"
      ? ["חלום", "נוסטלגיה", "ephemeral", "serendipity"]
      : lang === "ar"
        ? ["حُلم", "حنين", "ephemeral", "serendipity"]
        : ["dream", "ephemeral", "serendipity", "חלום"];

  function go(word: string) {
    const trimmed = word.trim();
    if (!trimmed) return;
    if (!user) {
      promptLogin(v2(lang, "signIn"));
      return;
    }
    router.push(`/word/${encodeURIComponent(trimmed)}`);
  }

  function handleExplain() {
    go(query || suggestions[0]);
  }

  function handleChip(s: string) {
    setQuery(s);
    go(s);
  }

  return (
    <section
      style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}
    >
      <div
        className="relative"
        style={{
          background: "oklch(1 0 0 / 0.04)",
          borderRadius: 22,
          padding: 8,
          boxShadow:
            "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.4), " +
            "0 0 0 6px oklch(0.72 0.19 245 / 0.08), " +
            "0 30px 60px -20px oklch(0.5 0.2 250 / 0.45)",
          backdropFilter: "blur(18px)",
        }}
      >
        {/* Inner cradle is warm paper (matches result cards & pricing
            tiers) so the search field reads as a confident, tactile
            CTA on the dark canvas instead of disappearing into it. */}
        <div
          className="flex items-center gap-3"
          style={{
            padding: "18px 22px",
            background: "var(--gd-paper-50)",
            borderRadius: 16,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            style={{ color: "var(--gd-electric-deep)", flexShrink: 0 }}
          >
            <circle
              cx="10"
              cy="10"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m15 15 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="flex-1 bg-transparent outline-none gd-font-sans-ui"
            style={{
              color: "var(--gd-ink-900)",
              fontSize: "clamp(16px, 1.6vw, 19px)",
            }}
            placeholder={v2(lang, "searchPlaceholderHome")}
            dir={isRtl ? "rtl" : "ltr"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleExplain();
              }
            }}
          />
          <button
            type="button"
            className="gd-font-sans-ui flex items-center gap-1.5"
            style={{
              fontSize: 12.5,
              color: "oklch(0.5 0.2 250)",
              padding: "7px 12px",
              borderRadius: 999,
              background: "oklch(0.72 0.19 245 / 0.1)",
              boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)",
            }}
            onClick={handleExplain}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 2v8M2 6h8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {v2(lang, "addContext")}
          </button>
          <button
            type="button"
            onClick={handleExplain}
            className="gd-font-sans-ui font-medium transition-transform hover:scale-[1.02]"
            style={{
              fontSize: 14,
              padding: "12px 22px",
              borderRadius: 12,
              background:
                "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
              color: "white",
              boxShadow:
                "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
            }}
          >
            {v2(lang, "explain")}
          </button>
        </div>
      </div>

      <div
        className={`mt-5 flex items-center gap-2 flex-wrap ${
          isRtl ? "justify-end" : ""
        }`}
        style={{ paddingInlineStart: 8 }}
      >
        <span
          className="gd-font-sans-ui"
          style={{
            fontSize: 11.5,
            color: "oklch(0.62 0.02 265)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {v2(lang, "tryLabel")}
        </span>
        {suggestions.map((s) => {
          const isHe = /[֐-׿]/.test(s);
          const isAr = /[؀-ۿ]/.test(s);
          const fontClass = isHe
            ? "gd-font-he"
            : isAr
              ? "gd-font-ar"
              : "gd-font-display";
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleChip(s)}
              className={`${fontClass} transition-colors hover:bg-white/10`}
              style={{
                fontSize: 14,
                fontStyle: !isHe && !isAr ? "italic" : "normal",
                color: "oklch(0.92 0.01 265)",
                padding: "5px 13px",
                borderRadius: 999,
                background: "oklch(1 0 0 / 0.05)",
                boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.1)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div
        className={`mt-3 gd-font-sans-ui ${isRtl ? "text-right" : ""}`}
        style={{
          fontSize: 12,
          color: "oklch(0.55 0.02 265)",
          paddingInlineStart: 8,
        }}
      >
        {v2(lang, "contextHint")}
      </div>
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
        className={`gd-font-sans-ui mb-3 inline-flex items-center gap-2 ${
          isRtl ? "ms-2" : "ms-2"
        }`}
        style={{
          fontSize: 11,
          color: "oklch(0.62 0.02 265)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
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
        <div className="flex items-baseline gap-3 mb-2">
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
          <div className="flex items-start gap-3">
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
        <Link
          href="/pricing"
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
      <div className={`mb-10 ${isRtl ? "text-right" : ""}`}>
        <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
          {v2(lang, "valuePropsEyebrow")}
        </Eyebrow>
        <h2
          className={titleFontClass}
          style={{
            fontSize: "clamp(28px, 3.4vw, 40px)",
            lineHeight: 1.15,
            color: "oklch(0.95 0.008 265)",
            marginTop: 8,
            maxWidth: 760,
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 60',
                  fontStyle: "italic",
                }
              : {}),
          }}
        >
          {v2(lang, "valuePropsTitle")}
        </h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 gd-mobile-flat">
        {props.map((p) => (
          <div
            key={p.eyebrow}
            className="gd-mobile-flat"
            style={{
              borderRadius: 18,
              padding: "clamp(22px, 2.6vw, 28px) clamp(22px, 2.8vw, 30px)",
              background: "oklch(0.21 0.05 265 / 0.55)",
              boxShadow:
                "inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 4px 18px oklch(0.08 0.08 260 / 0.35)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Eyebrow style={{ color: "oklch(0.82 0.1 245)" }}>
              {p.eyebrow}
            </Eyebrow>
            <div
              className={titleFontClass}
              style={{
                fontSize: "clamp(21px, 2.2vw, 25px)",
                lineHeight: 1.25,
                color: "oklch(0.96 0.008 265)",
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
                color: "oklch(0.74 0.02 265)",
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

// ─── TierStrip ───────────────────────────────────────────────────
// 3-tier teaser (full pricing comparison lives at /pricing).
// Clear is highlighted with a stronger ring; trust microcopy below.
type TierTeaser = {
  name: string;
  price: string;
  tag: string;
  bullets: string[];
  highlight?: boolean;
};

function tiersFor(lang: string): TierTeaser[] {
  // English-rooted; Stripe charges in USD across all locales, so the
  // numeric price stays the same — only the period suffix is localized.
  const periodMo =
    lang === "he" ? "/חודש" : lang === "ar" ? "/شهر" : "/mo";

  if (lang === "he") {
    return [
      {
        name: "Free",
        price: "$0",
        tag: "",
        bullets: [
          "20 חיפושים ביום",
          "כל המשמעויות",
          "3 דוגמאות לכל משמעות",
          "אטימולוגיה בסיסית",
        ],
      },
      {
        name: "Clear",
        price: "$2.99",
        tag: periodMo,
        bullets: [
          "כל מה שיש ב־Free",
          "חיפושים ללא הגבלה",
          "הסבר לילדים",
          "יצירת תמונות AI (30/חודש)",
          "חיבור משפטים ומשוב",
          "ביטויים נפוצים",
          "היסטוריית חיפושים",
        ],
        highlight: true,
      },
      {
        name: "Deep",
        price: "$4.99",
        tag: periodMo,
        bullets: [
          "כל מה שיש ב־Clear",
          "תרגול ומבחנים",
          "מחברת אישית (תצוגת גלקסיה)",
          "חזרה מדורגת",
          "השוואת מילים",
          "יצירת תמונות AI (100/חודש)",
        ],
      },
    ];
  }

  if (lang === "ar") {
    return [
      {
        name: "Free",
        price: "$0",
        tag: "",
        bullets: [
          "20 بحثًا في اليوم",
          "جميع المعاني",
          "3 أمثلة لكل معنى",
          "أصل الكلمة الأساسي",
        ],
      },
      {
        name: "Clear",
        price: "$2.99",
        tag: periodMo,
        bullets: [
          "كل ما في Free",
          "بحث بلا حدود",
          "شرح للأطفال",
          "توليد صور بالذكاء الاصطناعي (30 شهريًا)",
          "تأليف الجمل مع مراجعة",
          "تعابير شائعة",
          "سجلّ البحث",
        ],
        highlight: true,
      },
      {
        name: "Deep",
        price: "$4.99",
        tag: periodMo,
        bullets: [
          "كل ما في Clear",
          "اختبارات تدريب",
          "دفتر شخصي (تصوير المجرّة)",
          "مراجعة موزّعة",
          "مقارنة الكلمات",
          "توليد صور بالذكاء الاصطناعي (100 شهريًا)",
        ],
      },
    ];
  }

  return [
    {
      name: "Free",
      price: "$0",
      tag: "",
      bullets: [
        "20 searches per day",
        "All meanings (not just primary)",
        "3 examples per meaning",
        "Basic etymology",
      ],
    },
    {
      name: "Clear",
      price: "$2.99",
      tag: periodMo,
      bullets: [
        "Everything in Free",
        "Unlimited searches",
        "Kids explanation",
        "AI image generation (30/mo)",
        "Compose sentence with feedback",
        "Common idioms",
        "Search history",
      ],
      highlight: true,
    },
    {
      name: "Deep",
      price: "$4.99",
      tag: periodMo,
      bullets: [
        "Everything in Clear",
        "Practice quizzes",
        "Personal notebook (galaxy view)",
        "Spaced repetition",
        "Word comparisons",
        "AI image generation (100/mo)",
      ],
    },
  ];
}

export function TierStrip() {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  const tiers = tiersFor(lang);

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
          "clamp(50px, 8vw, 100px) clamp(16px, 3vw, 24px) clamp(40px, 6vw, 80px)",
      }}
    >
      <div className={`mb-8 ${isRtl ? "text-right" : ""}`}>
        <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
          {v2(lang, "pricingEyebrow")}
        </Eyebrow>
        <div
          className={titleFontClass}
          style={{
            fontSize: "clamp(26px, 3vw, 34px)",
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
          {v2(lang, "pricingTeaserTitle")}
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        {tiers.map((tier) => (
          <Link
            key={tier.name}
            href="/pricing"
            className="block transition-transform hover:translate-y-[-2px]"
            style={{
              borderRadius: 18,
              padding: "clamp(22px, 2.6vw, 28px) clamp(22px, 2.6vw, 26px)",
              background: tier.highlight
                ? "linear-gradient(180deg, oklch(0.24 0.07 260 / 0.85), oklch(0.18 0.06 265 / 0.85))"
                : "oklch(0.20 0.05 265 / 0.55)",
              boxShadow: tier.highlight
                ? "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.5), 0 0 0 4px oklch(0.72 0.19 245 / 0.06), 0 16px 36px -12px oklch(0.5 0.2 250 / 0.5)"
                : "inset 0 0 0 1px oklch(1 0 0 / 0.07), 0 4px 18px oklch(0.08 0.08 260 / 0.3)",
            }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <div
                className="gd-font-sans-ui font-semibold"
                style={{ fontSize: 15, color: "oklch(0.96 0.008 265)" }}
              >
                {tier.name}
              </div>
              {tier.highlight && <TierBadge tier="clear" small />}
            </div>
            <div
              className="gd-font-display flex items-baseline gap-1"
              style={{
                fontSize: 38,
                color: "oklch(0.97 0.008 265)",
                fontVariationSettings: '"opsz" 96',
                letterSpacing: "-0.02em",
              }}
            >
              {tier.price}
              <span
                className="gd-font-sans-ui"
                style={{ fontSize: 13, color: "oklch(0.62 0.02 265)" }}
              >
                {tier.tag}
              </span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {tier.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 gd-font-sans-ui"
                  style={{ fontSize: 13.5, color: "oklch(0.85 0.015 265)" }}
                >
                  <svg
                    width="13"
                    height="13"
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
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <div
        className={`mt-6 gd-font-sans-ui ${
          isRtl ? "text-right" : "text-center"
        }`}
        style={{
          fontSize: 12,
          color: "oklch(0.62 0.02 265)",
          letterSpacing: "0.04em",
        }}
      >
        {v2(lang, "trustMicrocopy")}
      </div>
    </section>
  );
}

// ─── HomeFooter ──────────────────────────────────────────────────
// Minimal: Wordmark + tagline + 2 link columns (Product / Legal).
export function HomeFooter() {
  const { lang } = useLang();

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
    <footer
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
            className="mt-3 gd-font-sans-ui"
            style={{
              fontSize: 12.5,
              color: "oklch(0.6 0.02 265)",
              lineHeight: 1.55,
            }}
          >
            {v2(lang, "footerTagline")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:gap-12">
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
        className="mt-10 pt-6 flex items-center justify-between gd-font-sans-ui"
        style={{
          fontSize: 11,
          color: "oklch(0.5 0.02 265)",
          borderTop: "1px solid oklch(1 0 0 / 0.04)",
        }}
      >
        <span>© 2026 Gadit</span>
        <span>{v2(lang, "footerLanguagesNote")}</span>
      </div>
    </footer>
  );
}
