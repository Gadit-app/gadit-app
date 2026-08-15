"use client";

/**
 * CompareV2 — Screen 7 from the redesign pass.
 *
 * Deep-tier feature at /compare. Two-input form on the navy stage,
 * AI comparison rendered on a warm-paper card with four sections:
 *   1. Side-by-side definitions
 *   2. The difference (electric-blue start-edge pull-quote)
 *   3. Examples (two columns)
 *   4. Common mistake (amber card, lower visual weight than the Kids
 *      card on Screen 1)
 *
 * Schema reconciliation:
 * - API returns wordA / wordB / summaryA / summaryB / exampleA /
 *   exampleB / keyDifference / commonMistake / error / invalidWord.
 *   The Screen 7 mockup spec'd word1Definition / word2Definition /
 *   theDifference / examples1[] / examples2[] / word1Pos / word2Pos.
 *   We map: summary→definition, keyDifference→theDifference, single
 *   example string per side, no POS field.
 * - Errors: not_a_real_word / different_languages / same_word — each
 *   maps to its own translated error block above the inputs (matching
 *   the spec).
 *
 * Tier gating handled by the page wrapper, not this component.
 */

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Eyebrow } from "./primitives";

type Script = "latin" | "he" | "ar";
function scriptFor(lang: string): Script {
  if (lang === "he") return "he";
  if (lang === "ar") return "ar";
  return "latin";
}

interface CompareApiResponse {
  language?: string;
  wordA?: string;
  wordB?: string;
  summaryA?: string;
  summaryB?: string;
  keyDifference?: string;
  exampleA?: string;
  exampleB?: string;
  commonMistake?: string;
  error?: "not_a_real_word" | "different_languages" | "same_word";
  invalidWord?: string;
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "gd-spin 0.8s linear infinite" }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="20 30"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

// ─── Empty placeholder ────────────────────────────────────────
function CompareEmpty() {
  const { lang } = useLang();
  const script = scriptFor(lang);
  const fontFamily =
    script === "he" ? "var(--wb-he)" : script === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "clamp(40px, 8vw, 64px) clamp(24px, 4vw, 32px)",
        background: "rgba(16,24,40,0.02)",
        boxShadow: "inset 0 0 0 1px var(--rule, #E2E5EA)",
        textAlign: "center",
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        style={{
          color: "var(--ink-muted, #6B7280)",
          margin: "0 auto",
          opacity: 0.7,
        }}
      >
        <circle cx="13" cy="13" r="6" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="23" cy="23" r="6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <p
        className="mt-4"
        style={{
          fontFamily,
          fontSize: "clamp(17px, 1.8vw, 19px)",
          color: "var(--ink-muted, #6B7280)",
          ...(script === "latin"
            ? {
                fontVariationSettings: '"opsz" 24',
                fontStyle: "italic",
              }
            : {}),
        }}
      >
        {v2(lang, "compareEmpty")}
      </p>
    </div>
  );
}

// ─── Error block ──────────────────────────────────────────────
function CompareError({ errorKey }: { errorKey: string }) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "clamp(18px, 2vw, 22px) clamp(18px, 2.4vw, 24px)",
        background: "oklch(0.96 0.035 30)",
        boxShadow: "inset 0 0 0 1px oklch(0.8 0.1 30 / 0.5)",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        flexDirection: isRtl ? "row-reverse" : "row",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "oklch(0.65 0.2 35 / 0.9)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "white",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 3v5M7 10.5v0.01"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 14.5,
          lineHeight: 1.5,
          color: "oklch(0.4 0.12 30)",
        }}
      >
        {v2(lang, errorKey as never)}
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────
function CompareResult({
  word1,
  word2,
  data,
}: {
  word1: string;
  word2: string;
  data: CompareApiResponse;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const wordFontFamily =
    script === "he" ? "var(--wb-he)" : script === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
  const bodyFontFamily =
    script === "he" ? "var(--wb-he)" : script === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
  const bodyRtl = script === "he" || script === "ar" ? "gd-rtl-body" : "";

  function WordCol({ word, def }: { word: string; def: string }) {
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: wordFontFamily,
            fontSize: "clamp(38px, 5vw, 52px)",
            lineHeight: 1.05,
            color: "#0EA5A5",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 96',
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  fontStyle: "italic",
                }
              : {}),
          }}
        >
          {word}
        </h3>
        <p
          className={`mt-3 ${bodyRtl}`}
          style={{
            fontFamily: bodyFontFamily,
            fontSize: "clamp(15.5px, 1.7vw, 16.5px)",
            lineHeight: 1.5,
            color: "var(--ink, #0B1220)",
            ...(script === "latin"
              ? { fontVariationSettings: '"opsz" 22' }
              : {}),
          }}
        >
          {def}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--rule, #E2E5EA)",
        borderRadius: 16,
        boxShadow: "0 8px 24px -12px rgba(16,24,40,0.12)",
        padding: "clamp(24px, 3vw, 36px) clamp(22px, 3vw, 40px)",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {/* 1. Side-by-side definitions */}
      <div
        className={`flex flex-col md:flex-row gap-7 md:gap-12 ${isRtl ? "md:flex-row-reverse" : ""}`}
      >
        <WordCol word={data.wordA ?? word1} def={data.summaryA ?? ""} />
        <div
          className="hidden md:block"
          style={{
            width: 1,
            background: "oklch(0 0 0 / 0.08)",
            alignSelf: "stretch",
          }}
        />
        <WordCol word={data.wordB ?? word2} def={data.summaryB ?? ""} />
      </div>

      <div
        className="my-8"
        style={{ height: 1, background: "oklch(0 0 0 / 0.08)" }}
      />

      {/* 2. The difference (blue-bar pull-quote) */}
      {data.keyDifference && (
        <div
          style={{
            borderInlineStart: "3px solid #0EA5A5",
            paddingInlineStart: "clamp(16px, 2vw, 20px)",
          }}
        >
          <Eyebrow style={{ color: "#0EA5A5" }}>
            {v2(lang, "compareDifferenceLabel")}
          </Eyebrow>
          <p
            className={`mt-2 ${bodyRtl}`}
            style={{
              fontFamily: bodyFontFamily,
              fontSize: "clamp(17px, 1.9vw, 19px)",
              lineHeight: 1.5,
              color: "var(--ink, #0B1220)",
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 28' }
                : {}),
            }}
          >
            {data.keyDifference}
          </p>
        </div>
      )}

      {/* 3. Examples, single example per side from this API. We render
         them as a 2-col grid even though there's one each, to keep the
         visual rhythm of "left = word A / right = word B". */}
      {(data.exampleA || data.exampleB) && (
        <div className="mt-8">
          <Eyebrow>{v2(lang, "compareExamplesLabel")}</Eyebrow>
          <div className="mt-3 grid gap-x-10 gap-y-3 grid-cols-1 md:grid-cols-2">
            {data.exampleA && (
              <p
                className={bodyRtl}
                style={{
                  fontFamily: bodyFontFamily,
                  fontSize: "clamp(15px, 1.6vw, 16px)",
                  lineHeight: 1.5,
                  color: "var(--ink-soft, #3F4856)",
                  fontStyle: script === "latin" ? "italic" : "normal",
                  ...(script === "latin"
                    ? { fontVariationSettings: '"opsz" 22' }
                    : {}),
                }}
              >
                &ldquo;{data.exampleA}&rdquo;
              </p>
            )}
            {data.exampleB && (
              <p
                className={bodyRtl}
                style={{
                  fontFamily: bodyFontFamily,
                  fontSize: "clamp(15px, 1.6vw, 16px)",
                  lineHeight: 1.5,
                  color: "var(--ink-soft, #3F4856)",
                  fontStyle: script === "latin" ? "italic" : "normal",
                  ...(script === "latin"
                    ? { fontVariationSettings: '"opsz" 22' }
                    : {}),
                }}
              >
                &ldquo;{data.exampleB}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Common mistake (amber card) */}
      {data.commonMistake && (
        <div
          className="mt-8"
          style={{
            borderRadius: 14,
            padding: "clamp(16px, 2vw, 20px) clamp(18px, 2.4vw, 22px)",
            background: "oklch(0.97 0.05 80)",
            boxShadow: "inset 0 0 0 1px oklch(0.85 0.09 75 / 0.55)",
          }}
        >
          <Eyebrow style={{ color: "oklch(0.55 0.13 60)" }}>
            {v2(lang, "compareCommonMistakeLabel")}
          </Eyebrow>
          <p
            className={`mt-1.5 ${bodyRtl}`}
            style={{
              fontFamily: bodyFontFamily,
              fontSize: "clamp(14.5px, 1.5vw, 15.5px)",
              lineHeight: 1.55,
              color: "oklch(0.32 0.06 60)",
              ...(script === "latin"
                ? { fontVariationSettings: '"opsz" 22' }
                : {}),
            }}
          >
            {data.commonMistake}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export function CompareV2() {
  const { user, plan, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const titleFontFamily =
    script === "he" ? "var(--wb-he)" : script === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
  const wordFontFamily =
    script === "he" ? "var(--wb-he)" : script === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";

  const [word1, setWord1] = useState("");
  const [word2, setWord2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareApiResponse | null>(null);
  const [errorKey, setErrorKey] = useState<string>("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    const w1 = word1.trim();
    const w2 = word2.trim();
    if (!w1 || !w2) return;

    if (!user) {
      promptLogin(v2(lang, "compareCta"));
      return;
    }
    if (plan !== "deep") {
      window.location.assign("/pricing");
      return;
    }

    setLoading(true);
    setResult(null);
    setErrorKey("");

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/compare-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          wordA: w1,
          wordB: w2,
          uiLang: lang,
        }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          window.location.assign("/pricing");
          return;
        }
        setErrorKey("compareErrGeneric");
        return;
      }
      const data = (await res.json()) as CompareApiResponse;
      if (data.error) {
        const errMap: Record<string, string> = {
          not_a_real_word: "compareErrNotARealWord",
          different_languages: "compareErrDifferentLanguages",
          same_word: "compareErrSameWord",
        };
        setErrorKey(errMap[data.error] ?? "compareErrGeneric");
        return;
      }
      setResult(data);
    } catch {
      setErrorKey("compareErrGeneric");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        paddingInline: "clamp(16px, 3vw, 28px)",
        paddingBlockEnd: 60,
      }}
    >
      {/* Hero */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          paddingBlockStart: "clamp(32px, 6vw, 64px)",
          textAlign: isRtl ? "right" : "left",
        }}
      >
        <Eyebrow style={{ color: "#0EA5A5" }}>
          {v2(lang, "compareEyebrow")}
        </Eyebrow>
        <h1
          style={{
            fontFamily: titleFontFamily,
            marginTop: 8,
            fontSize: "clamp(36px, 5.5vw, 56px)",
            lineHeight: 1.05,
            color: "var(--ink, #0B1220)",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 144, "SOFT" 80',
                  fontWeight: 400,
                  letterSpacing: "-0.025em",
                }
              : {}),
          }}
        >
          {v2(lang, "compareTitle")}
        </h1>
        <p
          className="mt-4"
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: "clamp(15px, 1.6vw, 17px)",
            lineHeight: 1.55,
            color: "var(--ink-soft, #3F4856)",
            maxWidth: 720,
          }}
        >
          {v2(lang, "compareSubtitle")}
        </p>
      </div>

      {/* Inputs */}
      <form
        onSubmit={handleCompare}
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          marginBlockStart: "clamp(28px, 4vw, 44px)",
        }}
        noValidate
      >
        <div
          className={`flex flex-col md:flex-row md:items-end gap-3 md:gap-4 ${isRtl ? "md:flex-row-reverse" : ""}`}
        >
          {/* Field 1 */}
          <div className="flex-1" style={{ minWidth: 0 }}>
            <label
              className="block mb-2"
              style={{
                fontFamily: "var(--wb-sans)",
                fontSize: 11,
                color: "var(--ink-muted, #6B7280)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {v2(lang, "compareWord1Label")}
            </label>
            <div
              style={{
                background: "var(--surface, #fff)",
                borderRadius: 14,
                padding: 5,
                boxShadow: "inset 0 0 0 1px var(--rule, #E2E5EA)",
              }}
            >
              <input
                dir={isRtl ? "rtl" : "ltr"}
                disabled={loading}
                value={word1}
                onChange={(e) => setWord1(e.target.value)}
                placeholder={v2(lang, "compareWord1Placeholder")}
                className="w-full bg-transparent outline-none"
                style={{
                  fontFamily: wordFontFamily,
                  color: "var(--ink, #0B1220)",
                  fontSize: "clamp(22px, 2.4vw, 28px)",
                  padding: "14px 18px",
                  fontStyle: script === "latin" ? "italic" : "normal",
                  letterSpacing: script === "latin" ? "-0.01em" : 0,
                  ...(script === "latin"
                    ? { fontVariationSettings: '"opsz" 48' }
                    : {}),
                  opacity: loading ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          {/* Hairline divider — only on desktop */}
          <div
            className="hidden md:block"
            style={{
              width: 38,
              height: 1,
              marginBottom: 26,
              flexShrink: 0,
              background: "var(--rule, #E2E5EA)",
            }}
          />

          {/* Field 2 */}
          <div className="flex-1" style={{ minWidth: 0 }}>
            <label
              className="block mb-2"
              style={{
                fontFamily: "var(--wb-sans)",
                fontSize: 11,
                color: "var(--ink-muted, #6B7280)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {v2(lang, "compareWord2Label")}
            </label>
            <div
              style={{
                background: "var(--surface, #fff)",
                borderRadius: 14,
                padding: 5,
                boxShadow: "inset 0 0 0 1px var(--rule, #E2E5EA)",
              }}
            >
              <input
                dir={isRtl ? "rtl" : "ltr"}
                disabled={loading}
                value={word2}
                onChange={(e) => setWord2(e.target.value)}
                placeholder={v2(lang, "compareWord2Placeholder")}
                className="w-full bg-transparent outline-none"
                style={{
                  fontFamily: wordFontFamily,
                  color: "var(--ink, #0B1220)",
                  fontSize: "clamp(22px, 2.4vw, 28px)",
                  padding: "14px 18px",
                  fontStyle: script === "latin" ? "italic" : "normal",
                  letterSpacing: script === "latin" ? "-0.01em" : 0,
                  ...(script === "latin"
                    ? { fontVariationSettings: '"opsz" 48' }
                    : {}),
                  opacity: loading ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-medium w-full md:w-auto"
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 14,
              padding: "16px 26px",
              borderRadius: 14,
              background: loading ? "rgba(14,165,165,0.5)" : "#0EA5A5",
              color: "white",
              boxShadow: loading ? "none" : "0 8px 22px rgba(14,165,165,0.35)",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading && <Spinner />}
            {loading ? v2(lang, "compareLoading") : v2(lang, "compareCta")}
          </button>
        </div>
      </form>

      {/* Result area */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          marginBlockStart: "clamp(28px, 4vw, 40px)",
        }}
      >
        {!result && !errorKey && <CompareEmpty />}
        {errorKey && (
          <div
            style={{
              maxWidth: 720,
              margin: isRtl ? "0 0 0 auto" : "0 auto 0 0",
            }}
          >
            <CompareError errorKey={errorKey} />
          </div>
        )}
        {result && !errorKey && (
          <CompareResult word1={word1} word2={word2} data={result} />
        )}
      </div>
    </div>
  );
}
