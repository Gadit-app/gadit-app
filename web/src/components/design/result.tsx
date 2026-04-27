"use client";

/**
 * V2 Result Screen components — Screen 1 from the redesign pass.
 *
 * Composition (top → bottom on the dark navy stage):
 *   <WordHeader />     word title + language chip + Save/Share
 *   <ImageSlot />      reserved hero slot (empty CTA / locked / filled)
 *   <MeaningCard />×N  numbered meaning + 3 examples + per-meaning idioms
 *   <EtymologyCard />  origin + historyNote pull-quote
 *   <KidsCard />       only when paid, no Report flag (children-facing)
 *   <IdiomsCard />     general idioms across all meanings
 *   <TakeItFurther />  4-up tier-gated actions
 *
 * Defensive against missing API fields:
 *   - pos / ipa / timeline aren't currently returned by /api/define.
 *     Components that use them check truthiness and skip if absent.
 *     When the API gains those fields the UI fills in automatically.
 *   - kidsExplanation is per-meaning in the schema; for the V2 screen
 *     we surface it ONCE at result level (using the first meaning's
 *     kids data), since the design treats it as the word's voice for
 *     children, not a per-meaning toggle.
 */

import type { ReactNode } from "react";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import type { Lang } from "@/lib/i18n";
import {
  Eyebrow,
  KidsGlyph,
  LockGlyph,
  MeaningBadge,
  ReportFlag,
  TierBadge,
} from "./primitives";

// ─── Types matching the live /api/define schema ────────────────
export type Plan = "basic" | "clear" | "deep";

export interface KidsExplanation {
  intro?: string;
  explanation: string;
  examples: string[];
}

export interface Idiom {
  phrase: string;
  meaning: string;
}

export interface Meaning {
  meaning: string;
  examples: string[];
  pos?: string; // not currently returned; future-proofed
  kidsExplanation?: KidsExplanation;
  idioms?: Idiom[];
}

export interface Etymology {
  sourceLanguage: string;
  originalWord: string;
  breakdown: string;
  originalMeaning: string;
  historyNote?: string;
}

export interface WordResult {
  word: string;
  language: string;
  meanings: Meaning[];
  etymology: Etymology | string;
  generalIdioms?: Idiom[];
  ipa?: string; // future-proofed
}

// ─── Helpers ───────────────────────────────────────────────────
type Script = "latin" | "he" | "ar";

function scriptFor(lang: Lang): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}

function bodyFontClass(script: Script): string {
  if (script === "he") return "gd-font-he gd-rtl-body";
  if (script === "ar") return "gd-font-ar gd-rtl-body";
  return "gd-font-display";
}

function titleFontClass(script: Script): string {
  if (script === "he") return "gd-font-he gd-rtl-title";
  if (script === "ar") return "gd-font-ar gd-rtl-title";
  return "gd-font-display";
}

function langCodeFor(lang: Lang): string {
  return lang.toUpperCase();
}

// Some meanings come back with idioms in the meaning text itself.
// We keep them separate because the design treats per-meaning idioms
// as a sub-block.

// ─── IconButton (Save / Share — note: NO Listen, no TTS yet) ──
function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 gd-font-sans-ui transition-colors hover:bg-[oklch(0.9_0.012_85)]"
      style={{
        fontSize: 12,
        color: "var(--gd-ink-700)",
        padding: "7px 11px",
        borderRadius: 10,
        background: "oklch(0.94 0.012 85)",
        boxShadow: "inset 0 0 0 1px oklch(0.86 0.014 85)",
      }}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

// ─── WordHeader ────────────────────────────────────────────────
export function WordHeader({
  word,
  language,
  pos,
  ipa,
  onSave,
  onShare,
}: {
  word: string;
  language: string;
  pos?: string;
  ipa?: string;
  onSave?: () => void;
  onShare?: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const tFont = titleFontClass(script);

  // Hide the language eyebrow when the word's language matches the
  // UI language — beta tester rightly flagged "HE · HEBREW" on a
  // Hebrew page is pure noise. The eyebrow only earns its keep when
  // the word is in a DIFFERENT language than the UI (e.g. a Hebrew-
  // speaking user looking up "ephemeral" should see "ENGLISH" so
  // they know what they're getting). For same-language searches we
  // suppress it entirely, plus the "HE · HEBREW" code suffix —
  // either both show or neither.
  const uiLanguageNames: Record<string, string[]> = {
    en: ["english"],
    he: ["hebrew", "עברית"],
    ar: ["arabic", "العربية"],
    ru: ["russian", "русский"],
    es: ["spanish", "español"],
    pt: ["portuguese", "português"],
    fr: ["french", "français"],
  };
  const matchesUiLang = (() => {
    const langName = (language || "").toLowerCase().trim();
    if (!langName) return true; // empty = don't show
    return (uiLanguageNames[lang] ?? []).some((n) => langName.includes(n));
  })();
  const showLangEyebrow = !matchesUiLang;

  // Header card — much tighter than before. Word title was up to
  // 88px display serif, eating ~40% of viewport height on its own.
  // Now capped at 44px so the word lives in a calm, room-of-breath
  // header instead of dominating the first viewport.
  return (
    // Inner content set to dir={dir} explicitly so flex flows
    // start→end naturally — avoiding the flex-row-reverse trap that
    // was double-flipping items in RTL. The `text-start` utility on
    // the word column then aligns the title to the start edge
    // (right in he/ar, left in en/ru/es/pt/fr) without an explicit
    // conditional.
    <div
      className="gd-card"
      style={{ padding: "clamp(18px, 2.4vw, 26px) clamp(20px, 2.6vw, 32px)" }}
      dir={dir}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        {/* Word column — start side, vertically centered against the
            action buttons across from it. */}
        <div className="flex-1 min-w-0" style={{ textAlign: "start" }}>
          {/* Eyebrow only when the word's language differs from UI —
              for HE-on-HE searches we suppress it entirely. POS (when
              present) lives on its own here too. */}
          {(showLangEyebrow || pos) && (
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {showLangEyebrow && <Eyebrow>{language}</Eyebrow>}
              {showLangEyebrow && pos && (
                <span style={{ color: "var(--gd-ink-300)" }}>·</span>
              )}
              {pos && (
                <span
                  className="gd-font-sans-ui italic"
                  style={{ fontSize: 11, color: "var(--gd-ink-500)" }}
                >
                  {pos}
                </span>
              )}
            </div>
          )}
          <h1
            className={tFont}
            style={{
              // Down from clamp(30-56px) — the word is the page
              // subject, not the page banner. 28-44px reads cleanly
              // and lets the buttons align comfortably across from
              // it without dwarfing them.
              fontSize: "clamp(28px, 3.6vw, 44px)",
              lineHeight: 1.02,
              color: "var(--gd-ink-900)",
              letterSpacing: script === "latin" ? "-0.025em" : 0,
              fontWeight: 400,
              overflowWrap: "anywhere",
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 72', fontStyle: "italic" }
                : {}),
            }}
          >
            {word}
          </h1>
          {ipa && (
            <div
              className="mt-1.5 gd-font-sans-ui"
              style={{ fontSize: 13, color: "var(--gd-ink-500)" }}
            >
              {ipa}
            </div>
          )}
        </div>
        {/* Action column — end side (left in RTL, right in LTR).
            justify-between on the parent already pins this to the
            opposite edge from the word column. flex-shrink-0 so the
            buttons don't get squeezed when the word is long. */}
        <div className="flex flex-row md:flex-col items-start md:items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <IconButton label={v2(lang, "saveToNotebook")} onClick={onSave}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 2h7v10l-3.5-2.5L3.5 12V2z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
            {/* Real share icon — the previous SVG was an upload arrow
                ("export → up"), which read as "download" to beta
                testers. This one is the iOS-style share glyph: a
                box with an arrow leaving the top, which is the
                universal "send/share" affordance. */}
            <IconButton label="Share" onClick={onShare}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="11" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="11" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M4.3 6.3l5.4-2.6M4.3 7.7l5.4 2.6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ImageSlot ─────────────────────────────────────────────────
// Three states. `state` is derived from plan + whether an image url
// already exists. Caller is responsible for the API call to generate.
export function ImageSlot({
  state,
  word,
  imageUrl,
  generating = false,
  onGenerate,
  onUpgrade,
  onRegenerate,
  onSaveImage,
}: {
  state: "empty-clear" | "empty-locked" | "filled";
  word: string;
  imageUrl?: string;
  generating?: boolean;
  onGenerate?: () => void;
  onUpgrade?: () => void;
  onRegenerate?: () => void;
  onSaveImage?: () => void;
}) {
  const { lang } = useLang();
  const script = scriptFor(lang);

  // Filled state — show the generated image
  if (state === "filled" && imageUrl) {
    return (
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 20,
          aspectRatio: "4 / 3",
          maxHeight: 420,
        }}
      >
        <img
          src={imageUrl}
          alt={word}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-3 end-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            className="gd-mobile-flat inline-flex items-center gap-1.5 gd-font-sans-ui"
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 11,
              color: "white",
              background: "oklch(0 0 0 / 0.45)",
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.15)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6a4 4 0 1 0 1-2.7M3 1v3h3"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            {v2(lang, "regenerate" as never) || "Regenerate"}
          </button>
          <button
            type="button"
            onClick={onSaveImage}
            className="gd-mobile-flat inline-flex items-center gap-1.5 gd-font-sans-ui"
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 11,
              color: "white",
              background: "oklch(0 0 0 / 0.45)",
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.15)",
            }}
          >
            {v2(lang, "saveToNotebook")}
          </button>
        </div>
      </div>
    );
  }

  // Empty states — locked (Basic) shows an Upgrade CTA; clear (Clear/Deep)
  // shows a single Generate button. No headline, no decorative ovals,
  // no descriptive blurb — the button is enough on its own.
  const locked = state === "empty-locked";
  return (
    <div
      className="flex items-center justify-center"
      style={{
        padding: "20px 24px",
        borderRadius: 16,
        background: "oklch(0 0 0 / 0.02)",
        boxShadow: "inset 0 0 0 1px oklch(0.86 0.014 85)",
      }}
    >
      {locked ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="inline-flex items-center gap-2 gd-font-sans-ui font-medium"
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            fontSize: 13,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 24px oklch(0.5 0.2 250 / 0.35)",
          }}
        >
          <LockGlyph size={12} />
          {v2(lang, "upgradeToClear")}
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="gd-font-sans-ui font-medium"
          style={{
            padding: "11px 22px",
            borderRadius: 999,
            fontSize: 13,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 24px oklch(0.5 0.2 250 / 0.35)",
            opacity: generating ? 0.7 : 1,
            cursor: generating ? "wait" : "pointer",
          }}
        >
          {generating
            ? v2(lang, "generatingImage")
            : v2(lang, "generateImage")}
        </button>
      )}
    </div>
  );
}

// ─── MeaningCard ───────────────────────────────────────────────
export function MeaningCard({
  n,
  meaning,
  onReport,
}: {
  n: number;
  meaning: Meaning;
  onReport?: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const bFont = bodyFontClass(script);

  return (
    // MeaningCard — denser. Meaning text was 22-26px, examples 15-17;
    // shrunk one tier so 3-4 meanings fit in the same scroll the
    // previous version showed 2 in.
    <div
      className="gd-card relative"
      style={{ padding: "clamp(20px, 2.4vw, 26px) clamp(22px, 2.6vw, 30px)" }}
    >
      <div className="flex items-start gap-3">
        <MeaningBadge n={n} />
        <div className="flex-1 min-w-0">
          {meaning.pos && (
            <div className="mb-1.5">
              <span
                className="gd-font-sans-ui italic tracking-wide"
                style={{ fontSize: 10.5, color: "var(--gd-ink-500)" }}
              >
                {meaning.pos}
              </span>
            </div>
          )}
          <p
            className={bFont}
            style={{
              fontSize: "clamp(17px, 1.8vw, 20px)",
              lineHeight: 1.4,
              color: "var(--gd-ink-900)",
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 28' }
                : {}),
            }}
          >
            {meaning.meaning ?? ""}
          </p>

          <ul className="mt-3 space-y-1.5">
            {(meaning.examples ?? []).map((ex, i) => (
              <li key={i} className="flex gap-2.5">
                <span
                  style={{
                    color: "oklch(0.72 0.19 245)",
                    fontSize: 17,
                    lineHeight: "22px",
                    flexShrink: 0,
                  }}
                >
                  ·
                </span>
                <span
                  className={bFont}
                  style={{
                    fontSize: "clamp(13.5px, 1.4vw, 14.5px)",
                    lineHeight: 1.55,
                    fontStyle: script === "latin" ? "italic" : "normal",
                    color: "var(--gd-ink-700)",
                  }}
                >
                  {ex}
                </span>
              </li>
            ))}
          </ul>

          {meaning.idioms && meaning.idioms.length > 0 && (
            <div
              className="mt-6 pt-5"
              style={{ borderTop: "1px solid oklch(0.9 0.012 85)" }}
            >
              <Eyebrow className="mb-3">
                {v2(lang, "idiomsWithMeaning")}
              </Eyebrow>
              <ul className="space-y-2">
                {meaning.idioms.map((idm, i) => (
                  <li
                    key={i}
                    className={`flex items-baseline gap-3 flex-wrap `}
                  >
                    <span
                      className="gd-font-display italic"
                      style={{
                        fontSize: "clamp(14.5px, 1.5vw, 16px)",
                        color: "var(--gd-ink-900)",
                        fontWeight: 500,
                      }}
                    >
                      &ldquo;{idm.phrase}&rdquo;
                    </span>
                    <span style={{ color: "var(--gd-ink-300)" }}>—</span>
                    <span
                      className={bFont}
                      style={{
                        fontSize: "clamp(13.5px, 1.4vw, 15px)",
                        color: "var(--gd-ink-500)",
                      }}
                    >
                      {idm.meaning}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 end-4">
        <ReportFlag tooltip={v2(lang, "reportLabel")} onClick={onReport} />
      </div>
    </div>
  );
}

// ─── EtymologyCard ─────────────────────────────────────────────
export function EtymologyCard({
  etymology,
  onReport,
}: {
  etymology: Etymology | string;
  onReport?: () => void;
}) {
  const { lang } = useLang();

  // The legacy API can return etymology as a string OR an object.
  // Normalize: if string, treat it as the origin paragraph and skip
  // the historyNote pull-quote.
  const isStructured = typeof etymology === "object" && etymology !== null;
  const origin = isStructured
    ? (etymology.originalMeaning ||
        [
          etymology.sourceLanguage,
          etymology.originalWord,
          etymology.breakdown,
        ]
          .filter(Boolean)
          .join(" · "))
    : etymology;
  const historyNote = isStructured ? etymology.historyNote : undefined;

  return (
    <div
      className="gd-card relative"
      style={{
        padding:
          "clamp(26px, 3vw, 34px) clamp(24px, 3vw, 40px) clamp(32px, 3.5vw, 40px)",
      }}
    >
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <Eyebrow>{v2(lang, "origin")}</Eyebrow>
      </div>

      <p
        className="gd-font-display"
        style={{
          fontSize: "clamp(17px, 1.8vw, 19px)",
          lineHeight: 1.55,
          color: "var(--gd-ink-700)",
          fontVariationSettings: '"opsz" 20',
        }}
      >
        {origin}
      </p>

      {historyNote && (
        <div
          className="my-6 py-6 relative"
          style={{
            borderTop: "1px solid oklch(0.88 0.012 85)",
            borderBottom: "1px solid oklch(0.88 0.012 85)",
          }}
        >
          <div
            className="absolute top-6 h-6 rounded-full"
            style={{
              insetInlineStart: 0,
              width: 3,
              background: "oklch(0.72 0.19 245)",
              boxShadow: "0 0 8px oklch(0.72 0.19 245 / 0.5)",
            }}
          />
          <div className="ps-5">
            <Eyebrow className="mb-2">{v2(lang, "historyNote")}</Eyebrow>
            <blockquote
              className="gd-font-display italic"
              style={{
                fontSize: "clamp(19px, 2.2vw, 23px)",
                lineHeight: 1.45,
                color: "var(--gd-ink-900)",
                fontVariationSettings: '"opsz" 40',
              }}
            >
              {historyNote}
            </blockquote>
          </div>
        </div>
      )}

      {isStructured && etymology.sourceLanguage && (
        <div
          className="mt-2 gd-font-sans-ui"
          style={{ fontSize: 12, color: "var(--gd-ink-500)" }}
        >
          {etymology.sourceLanguage}
          {etymology.originalWord && (
            <>
              {" · "}
              <em>{etymology.originalWord}</em>
            </>
          )}
          {etymology.breakdown && (
            <>
              {" · "}
              {etymology.breakdown}
            </>
          )}
        </div>
      )}

      <div className="absolute bottom-4 end-4">
        <ReportFlag tooltip={v2(lang, "reportLabel")} onClick={onReport} />
      </div>
    </div>
  );
}

// ─── KidsCard ──────────────────────────────────────────────────
// Warm amber surface with the inline-start edge accent. NO Report flag
// per UX review — children-facing surfaces shouldn't carry one.
export function KidsCard({
  kids,
  locked = false,
  onUpgrade,
}: {
  kids: KidsExplanation;
  locked?: boolean;
  onUpgrade?: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const bFont = bodyFontClass(script);

  return (
    <div
      className={`gd-card-kids relative ${locked ? "gd-locked" : ""}`}
      style={{
        padding:
          "clamp(26px, 3vw, 34px) clamp(24px, 3vw, 40px) clamp(32px, 3.5vw, 40px)",
        ...(locked ? { filter: "saturate(0.4)" } : {}),
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          top: 32,
          bottom: 32,
          insetInlineStart: 0,
          width: 3,
          background: "oklch(0.78 0.12 75)",
          boxShadow: "0 0 10px oklch(0.78 0.12 75 / 0.5)",
        }}
      />
      <div className={`flex items-baseline gap-3 mb-4 ps-2 flex-wrap `}>
        <KidsGlyph size={20} />
        <Eyebrow style={{ color: "var(--gd-amber-ink)" }}>
          {v2(lang, "forKids")}
        </Eyebrow>
        {locked && (
          <>
            <span style={{ color: "oklch(0.75 0.05 70)" }}>·</span>
            <span
              className="gd-font-sans-ui font-semibold inline-flex items-center gap-1"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "oklch(0.55 0.1 65)",
              }}
            >
              <LockGlyph size={11} /> Clear
            </span>
          </>
        )}
      </div>

      <div className="ps-2">
        <p
          className={bFont}
          style={{
            fontSize: "clamp(19px, 2.2vw, 22px)",
            lineHeight: 1.45,
            color: "oklch(0.32 0.04 55)",
            ...(script === "latin"
              ? { fontVariationSettings: '"opsz" 24' }
              : {}),
          }}
        >
          {kids.explanation}
        </p>

        {kids.examples && kids.examples.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {kids.examples.map((b, i) => (
              <li
                key={i}
                className={`flex gap-3 `}
              >
                <span
                  style={{
                    color: "oklch(0.78 0.12 75)",
                    fontSize: 18,
                    lineHeight: "22px",
                    flexShrink: 0,
                  }}
                >
                  ✦
                </span>
                <span
                  className={bFont}
                  style={{
                    fontSize: "clamp(15px, 1.6vw, 16.5px)",
                    lineHeight: 1.55,
                    color: "oklch(0.38 0.05 55)",
                  }}
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {locked && (
        <button
          type="button"
          onClick={onUpgrade}
          className="gd-lock-badge absolute inline-flex items-center gap-1.5 gd-font-sans-ui font-medium"
          style={{
            top: 24,
            insetInlineEnd: 24,
            padding: "7px 13px",
            borderRadius: 999,
            fontSize: 11.5,
            color: "oklch(0.4 0.12 245)",
            background: "oklch(1 0 0 / 0.85)",
            backdropFilter: "blur(6px)",
            boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.4)",
          }}
        >
          {v2(lang, "unlockWithClear")}
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 6h6m0 0L6 3m3 3L6 9"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      {/* No ReportFlag here — children-facing surfaces don't carry one */}
    </div>
  );
}

// ─── IdiomsCard ────────────────────────────────────────────────
export function IdiomsCard({
  idioms,
  onReport,
}: {
  idioms: Idiom[];
  onReport?: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const bFont = bodyFontClass(script);

  if (!idioms || idioms.length === 0) return null;

  return (
    <div
      className="gd-card relative"
      style={{
        padding:
          "clamp(26px, 3vw, 30px) clamp(24px, 3vw, 40px) clamp(32px, 3.5vw, 34px)",
      }}
    >
      <Eyebrow className="mb-4">{v2(lang, "commonExpressions")}</Eyebrow>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {idioms.map((it, i) => (
          <div
            key={i}
            className={`flex items-baseline gap-3 flex-wrap `}
            style={{
              borderBottom:
                i < idioms.length - (idioms.length > 2 ? 2 : 1)
                  ? "1px solid oklch(0.93 0.012 85)"
                  : "none",
              paddingBottom:
                i < idioms.length - (idioms.length > 2 ? 2 : 1) ? 14 : 0,
            }}
          >
            <span
              className="gd-font-display italic"
              style={{
                fontSize: "clamp(15px, 1.6vw, 17px)",
                color: "var(--gd-ink-900)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              &ldquo;{it.phrase}&rdquo;
            </span>
            <span
              className={bFont}
              style={{
                fontSize: "clamp(13.5px, 1.4vw, 14.5px)",
                color: "var(--gd-ink-500)",
                lineHeight: 1.45,
              }}
            >
              {it.meaning}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-3">
        <ReportFlag tooltip={v2(lang, "reportLabel")} onClick={onReport} />
      </div>
    </div>
  );
}

// ─── TakeItFurther ─────────────────────────────────────────────
type ActionDef = {
  id: "save" | "image" | "compose" | "practice";
  labelKey: keyof import("@/lib/i18n-v2").V2Strings;
  hintKey: keyof import("@/lib/i18n-v2").V2Strings;
  tier: Plan;
  icon: ReactNode;
};

const ACTIONS: ActionDef[] = [
  {
    id: "save",
    labelKey: "saveToNotebook",
    hintKey: "saveToNotebookHint",
    tier: "basic",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path
          d="M6 3.5h10v15l-5-3.5-5 3.5v-15z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "image",
    labelKey: "generateImage",
    hintKey: "generateImageHint",
    tier: "clear",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect
          x="3"
          y="4"
          width="16"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <circle cx="8" cy="9" r="1.3" fill="currentColor" />
        <path
          d="M3 14l4-3 5 4 4-3 3 2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "compose",
    labelKey: "composeSentence",
    hintKey: "composeSentenceHint",
    tier: "clear",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path
          d="M4 17.5V15l9-9 2.5 2.5-9 9H4zM13 6l2.5 2.5M15 4l3 3-1.5 1.5-3-3L15 4z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "practice",
    labelKey: "practiceWord",
    hintKey: "practiceWordHint",
    tier: "deep",
    icon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M8.5 10.8l2 2 3.5-4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const TIER_RANK: Record<Plan, number> = { basic: 0, clear: 1, deep: 2 };

export function TakeItFurther({
  word,
  plan,
  onAction,
}: {
  word: string;
  plan: Plan;
  onAction?: (id: ActionDef["id"]) => void;
}) {
  const { lang } = useLang();
  const script = scriptFor(lang);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 px-1 flex-wrap gap-2">
        <div>
          <Eyebrow style={{ color: "oklch(0.82 0.008 265)" }}>
            {v2(lang, "takeItFurther")}
          </Eyebrow>
          <div
            className={
              script === "latin"
                ? "gd-font-display"
                : script === "he"
                  ? "gd-font-he"
                  : "gd-font-ar"
            }
            style={{
              marginTop: 4,
              fontSize: "clamp(20px, 2.4vw, 24px)",
              color: "oklch(0.95 0.008 265)",
              ...(script === "latin"
                ? {
                    fontVariationSettings: '"opsz" 32',
                    fontStyle: "italic",
                  }
                : {}),
            }}
          >
            {v2(lang, "doMoreWith", word)}
          </div>
        </div>
      </div>
      {/* Single column below 480px so the action tiles' inner content
          (38px icon + label + hint + locked badge) doesn't overflow
          the 140px minHeight in cramped 2-col mobile layout. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((a) => {
          const locked = TIER_RANK[a.tier] > TIER_RANK[plan];
          return (
            <ActionTile
              key={a.id}
              action={a}
              locked={locked}
              onClick={() => onAction?.(a.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ActionTile({
  action,
  locked,
  onClick,
}: {
  action: ActionDef;
  locked: boolean;
  onClick?: () => void;
}) {
  const { lang } = useLang();
  const tierLabel = action.tier === "deep" ? "Deep" : action.tier === "clear" ? "Clear" : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`gd-mobile-flat relative overflow-hidden text-start transition-transform hover:scale-[1.01] ${
        locked ? "gd-locked" : ""
      }`}
      style={{
        borderRadius: 16,
        padding: "clamp(16px, 2vw, 20px) clamp(14px, 1.8vw, 18px) clamp(14px, 1.6vw, 16px)",
        minHeight: 140,
        background: "oklch(0.22 0.05 265 / 0.7)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "inset 0 0 0 1px oklch(1 0 0 / 0.08), 0 4px 18px oklch(0.08 0.08 260 / 0.4)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="inline-flex items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "oklch(0.72 0.19 245 / 0.12)",
            color: "oklch(0.82 0.15 245)",
            boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.3)",
          }}
        >
          {action.icon}
        </div>
        {tierLabel && action.tier !== "basic" && (
          <TierBadge tier={action.tier} small />
        )}
      </div>
      <div
        className="mt-4 gd-font-sans-ui font-medium"
        style={{ fontSize: 15, color: "oklch(0.97 0.008 265)" }}
      >
        {v2(lang, action.labelKey)}
      </div>
      <div
        className="mt-1 gd-font-sans-ui"
        style={{
          fontSize: 12.5,
          lineHeight: 1.45,
          color: "oklch(0.72 0.02 265)",
        }}
      >
        {v2(lang, action.hintKey)}
      </div>
      {locked && tierLabel && (
        <div
          className="gd-lock-badge absolute inline-flex items-center gap-1 gd-font-sans-ui"
          style={{
            bottom: 12,
            insetInlineEnd: 12,
            fontSize: 10.5,
            color: "oklch(0.82 0.1 245)",
            padding: "3px 8px",
            borderRadius: 999,
            background: "oklch(0.15 0.06 265 / 0.8)",
            boxShadow: "inset 0 0 0 1px oklch(0.72 0.19 245 / 0.35)",
          }}
        >
          <LockGlyph size={10} /> {tierLabel}
        </div>
      )}
    </button>
  );
}

// ─── ResultView (composition) ──────────────────────────────────
// Glues the screen together. Stream-friendly: renders whatever fields
// are present in `result` and skips what's missing, so a partially-streamed
// SSE payload still produces a clean layout.
export function ResultView({
  result,
  plan,
  imageUrl,
  imageGenerating = false,
  onSave,
  onShare,
  onGenerate,
  onUpgrade,
  onRegenerate,
  onSaveImage,
  onAction,
  onReport,
}: {
  result: WordResult;
  plan: Plan;
  imageUrl?: string;
  imageGenerating?: boolean;
  onSave?: () => void;
  onShare?: () => void;
  onGenerate?: () => void;
  onUpgrade?: () => void;
  onRegenerate?: () => void;
  onSaveImage?: () => void;
  onAction?: (id: ActionDef["id"]) => void;
  onReport?: (section: string) => void;
}) {
  const imageState: "empty-clear" | "empty-locked" | "filled" = imageUrl
    ? "filled"
    : plan === "basic"
      ? "empty-locked"
      : "empty-clear";

  // Find the first meaning that has kids data — for the V2 design,
  // we surface kids ONCE for the whole word, not per meaning.
  const kidsMeaning = result.meanings.find((m) => m.kidsExplanation);
  const kidsAvailable = !!kidsMeaning;

  return (
    // Order is deliberate: definitions first (what every visitor came
    // for), kids explanation second (still text, still in-flow for
    // anyone who came with a child), THEN the image (visual flourish
    // — you've already understood the word, here's the picture).
    // Idioms + etymology + take-it-further trail behind for users
    // who want to go deeper. Beta tester rightly flagged that the old
    // order (image right under the title) was front-loading the
    // visual flair and forcing readers to scroll past it to reach
    // what they actually came for.
    <div className="flex flex-col gap-5">
      <WordHeader
        word={result.word}
        language={result.language}
        ipa={result.ipa}
        onSave={onSave}
        onShare={onShare}
      />

      {result.meanings.map((m, i) => (
        <MeaningCard
          key={i}
          n={i + 1}
          meaning={m}
          onReport={() => onReport?.(`meaning-${i + 1}`)}
        />
      ))}

      {kidsAvailable && kidsMeaning?.kidsExplanation && (
        <KidsCard
          kids={kidsMeaning.kidsExplanation}
          locked={plan === "basic"}
          onUpgrade={onUpgrade}
        />
      )}

      <ImageSlot
        state={imageState}
        word={result.word}
        imageUrl={imageUrl}
        generating={imageGenerating}
        onGenerate={onGenerate}
        onUpgrade={onUpgrade}
        onRegenerate={onRegenerate}
        onSaveImage={onSaveImage}
      />

      {result.generalIdioms && result.generalIdioms.length > 0 && (
        <IdiomsCard
          idioms={result.generalIdioms}
          onReport={() => onReport?.("idioms")}
        />
      )}

      {result.etymology && (
        <EtymologyCard
          etymology={result.etymology}
          onReport={() => onReport?.("etymology")}
        />
      )}

      <TakeItFurther
        word={result.word}
        plan={plan}
        onAction={onAction}
      />
    </div>
  );
}
