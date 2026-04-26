"use client";

/**
 * ReportModalV2 — Screen 11 from the redesign pass.
 *
 * Modal that opens when a user clicks any of the small flag icons
 * scattered through V2 content surfaces (Result page meaning cards,
 * Etymology, Idioms, Compose result, Quiz question, Compare result).
 *
 * Design notes:
 *   - Anonymous-OK: no email, no auth required. /api/report-error
 *     accepts both authenticated and anonymous reports.
 *   - 10 categories, multi-select. Submit disabled until ≥1 selected.
 *   - States: empty / submitting / sent (auto-closes 1.8s) / error.
 *   - Same backdrop pattern as LoginModal/Compose: 12px blur over a
 *     65%-navy scrim.
 *
 * Schema reconciliation:
 *   The component's category keys map 1:1 to the API's
 *   ReportCategory values:
 *     incorrectDefinition  → definition
 *     wrongEtymology       → etymology
 *     badExample           → example
 *     kidsExplanation      → kids_explanation
 *     idiomIssue           → idioms
 *     wrongImage           → image
 *     quizWrongAnswer      → quiz_wrong_answer
 *     composeFeedback      → compose_feedback
 *     compareResult        → compare_words
 *     somethingElse        → other
 */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
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
function fontDisplay(s: Script) {
  return s === "he" ? "gd-font-he" : s === "ar" ? "gd-font-ar" : "gd-font-display";
}

type V2Key = Parameters<typeof v2>[1];

// UI category id → API category id + i18n label key
const CATEGORIES: Array<{
  id: string;
  apiId: string;
  labelKey: V2Key;
}> = [
  { id: "incorrectDefinition", apiId: "definition", labelKey: "reportCatIncorrectDefinition" },
  { id: "wrongEtymology", apiId: "etymology", labelKey: "reportCatWrongEtymology" },
  { id: "badExample", apiId: "example", labelKey: "reportCatBadExample" },
  { id: "kidsExplanation", apiId: "kids_explanation", labelKey: "reportCatKidsExplanation" },
  { id: "idiomIssue", apiId: "idioms", labelKey: "reportCatIdiomIssue" },
  { id: "wrongImage", apiId: "image", labelKey: "reportCatWrongImage" },
  { id: "quizWrongAnswer", apiId: "quiz_wrong_answer", labelKey: "reportCatQuizWrongAnswer" },
  { id: "composeFeedback", apiId: "compose_feedback", labelKey: "reportCatComposeFeedback" },
  { id: "compareResult", apiId: "compare_words", labelKey: "reportCatCompareResult" },
  { id: "somethingElse", apiId: "other", labelKey: "reportCatSomethingElse" },
];

// Spinner reused from other V2 modals
function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: "2px solid oklch(1 0 0 / 0.4)",
        borderTopColor: "white",
        animation: "gd-spin 700ms linear infinite",
        display: "inline-block",
      }}
    />
  );
}

function ReportCheckbox({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { dir } = useLang();
  const isRtl = dir === "rtl";

  return (
    <button
      type="button"
      onClick={onClick}
      className="gd-font-sans-ui transition-all"
      style={{
        textAlign: isRtl ? "right" : "left",
        padding: "12px 14px",
        borderRadius: 12,
        background: selected ? "oklch(0.72 0.19 245 / 0.08)" : "transparent",
        boxShadow: selected
          ? "inset 0 0 0 1.5px oklch(0.5 0.18 250), 0 0 0 4px oklch(0.5 0.18 250 / 0.08)"
          : "inset 0 0 0 1px oklch(0.85 0.005 265)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexDirection: isRtl ? "row-reverse" : "row",
        cursor: "pointer",
      }}
      aria-pressed={selected}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 6,
          flexShrink: 0,
          background: selected ? "oklch(0.5 0.18 250)" : "transparent",
          boxShadow: selected
            ? "none"
            : "inset 0 0 0 1.5px oklch(0.78 0.005 265)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5l2.5 2.5L9.5 4"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        style={{
          fontSize: 13.5,
          color: "var(--gd-ink-900)",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export interface ReportContext {
  /** Optional snapshot of the rendered content, sent to the API for
   *  admin triage. Could be stringified meanings/etymology/etc. */
  contextSnapshot?: unknown;
  /** The word being viewed when the report was filed. */
  word?: string;
  /** Pre-selected categories (e.g. when the flag was on a Compose
   *  card we can pre-tick "compose_feedback"). */
  defaultCategories?: string[];
}

export function ReportModalV2({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context?: ReportContext;
}) {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle"
  );

  // Reset on open + apply defaults
  useEffect(() => {
    if (open) {
      const initial = new Set(
        (context?.defaultCategories ?? []).map((c) => {
          // Accept either UI ids or API ids in defaultCategories so callers
          // can pass whatever's natural at the call site.
          const matchingByUi = CATEGORIES.find((cat) => cat.id === c);
          if (matchingByUi) return matchingByUi.id;
          const matchingByApi = CATEGORIES.find((cat) => cat.apiId === c);
          if (matchingByApi) return matchingByApi.id;
          return c;
        })
      );
      setSelected(initial);
      setDetails("");
      setState("idle");
    }
  }, [open, context?.defaultCategories]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Auto-close after sent
  useEffect(() => {
    if (state !== "sent") return;
    const timer = setTimeout(() => onClose(), 1800);
    return () => clearTimeout(timer);
  }, [state, onClose]);

  if (!open) return null;

  const hasSelection = selected.size > 0;
  const isSubmitting = state === "submitting";
  const isSent = state === "sent";
  const hasError = state === "error";

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (!hasSelection || isSubmitting) return;
    setState("submitting");

    // Map UI ids to API category ids
    const apiCategories = Array.from(selected)
      .map((id) => CATEGORIES.find((c) => c.id === id)?.apiId)
      .filter((x): x is string => Boolean(x));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (user) {
      try {
        const idToken = await user.getIdToken();
        headers.Authorization = `Bearer ${idToken}`;
      } catch {
        // anonymous fallback
      }
    }

    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers,
        body: JSON.stringify({
          categories: apiCategories,
          details: details.trim().slice(0, 2000),
          word: context?.word,
          uiLang: lang,
          contextSnapshot: context?.contextSnapshot,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const fontTitle = fontDisplay(script);
  const cardPadding: CSSProperties = {
    padding: "clamp(28px, 4vw, 36px) clamp(24px, 4vw, 36px)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
      style={{
        background: "oklch(0.1 0.04 265 / 0.65)",
        backdropFilter: "blur(12px)",
        padding: "clamp(20px, 4vw, 60px) clamp(16px, 3vw, 40px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className="gd-card relative"
        style={{
          width: "100%",
          maxWidth: 460,
          ...cardPadding,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          aria-label={v2(lang, "loginCloseAria")}
          style={{
            position: "absolute",
            insetBlockStart: 14,
            insetInlineEnd: 14,
            width: 30,
            height: 30,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gd-ink-500)",
            background: "transparent",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {isSent ? (
          <div
            style={{
              textAlign: "center",
              paddingBlock: "clamp(36px, 6vw, 52px)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                margin: "0 auto 18px",
                background: "oklch(0.95 0.04 155)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 0 0 1.5px oklch(0.7 0.13 155 / 0.55)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M7 14.5l4.5 4.5L21 9"
                  stroke="oklch(0.5 0.14 155)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className={fontTitle}
              style={{
                fontSize: 22,
                color: "var(--gd-ink-900)",
                fontStyle: script === "latin" ? "italic" : "normal",
                ...(script === "latin"
                  ? { fontVariationSettings: '"opsz" 32', fontWeight: 400 }
                  : { fontWeight: 600 }),
              }}
            >
              {v2(lang, "reportThanks")}
            </p>
          </div>
        ) : (
          <>
            <Eyebrow style={{ color: "oklch(0.4 0.14 250)" }}>
              {v2(lang, "reportEyebrow")}
            </Eyebrow>
            <h2
              className={fontTitle}
              style={{
                fontSize: "clamp(26px, 3.4vw, 32px)",
                color: "var(--gd-ink-900)",
                marginTop: 8,
                lineHeight: 1.15,
                fontStyle: script === "latin" ? "italic" : "normal",
                ...(script === "latin"
                  ? {
                      fontVariationSettings: '"opsz" 48',
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }
                  : { fontWeight: 600 }),
              }}
            >
              {v2(lang, "reportTitle")}
            </h2>

            {/* Categories */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8,
                marginTop: 24,
              }}
              className="report-cats-grid"
            >
              {CATEGORIES.map((cat) => (
                <ReportCheckbox
                  key={cat.id}
                  label={v2(lang, cat.labelKey)}
                  selected={selected.has(cat.id)}
                  onClick={() => toggle(cat.id)}
                />
              ))}
            </div>

            {/* Textarea */}
            <div className="mt-5">
              <label
                className={`gd-font-sans-ui block mb-2 ${isRtl ? "text-right" : ""}`}
                style={{
                  fontSize: 11.5,
                  color: "var(--gd-ink-500)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {v2(lang, "reportTellMore")}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={v2(lang, "reportTellMorePh")}
                dir={isRtl ? "rtl" : "ltr"}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  minHeight: 80,
                  maxHeight: 200,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "oklch(0.98 0.005 265)",
                  boxShadow: "inset 0 0 0 1px oklch(0.85 0.005 265)",
                  fontFamily: "inherit",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "var(--gd-ink-900)",
                  resize: "vertical",
                  outline: "none",
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              />
            </div>

            {hasError && (
              <p
                className="gd-font-sans-ui mt-3"
                style={{ fontSize: 12.5, color: "oklch(0.55 0.18 25)" }}
                role="alert"
              >
                {v2(lang, "reportError")}
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasSelection || isSubmitting}
              className="gd-font-sans-ui font-medium mt-5 w-full"
              style={{
                padding: "13px 18px",
                borderRadius: 12,
                background: hasSelection
                  ? "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))"
                  : "linear-gradient(180deg, oklch(0.85 0.05 245 / 0.5), oklch(0.7 0.08 250 / 0.5))",
                color: "white",
                fontSize: 14.5,
                boxShadow: hasSelection
                  ? "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)"
                  : "none",
                opacity: hasSelection ? 1 : 0.6,
                cursor:
                  hasSelection && !isSubmitting ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? v2(lang, "reportSending") : v2(lang, "reportSend")}
            </button>
          </>
        )}
      </div>

      {/* Two-column layout above 480px viewport — inline media query
          via a tiny scoped style block since this is the only place it
          appears. */}
      <style>{`
        @media (min-width: 480px) {
          .report-cats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
