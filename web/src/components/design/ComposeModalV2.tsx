"use client";

/**
 * ComposeModalV2 — Screen 5 from the redesign pass.
 *
 * Clear+ feature. User opens it from "Compose a sentence" in the
 * Take-it-further block. They write a sentence using the word, submit,
 * and get warm/teacherly feedback from /api/check-sentence.
 *
 * Schema reconciliation note: Claude Design's mockup showed two
 * separate indicators (Grammar + Word usage). Our /api/check-sentence
 * returns a SINGLE status (perfect | almost | incorrect) with one
 * message and an optional rewrite. We render ONE feedback row whose
 * tint and check/cross icon match the status — same warm-teacherly
 * tone, simpler signal. The rewrite block (when present) keeps the
 * electric-blue start-edge bar from the mockup.
 *
 * Layout: centered modal on desktop (overlays the result page),
 * full-width inline section on mobile. ESC + backdrop click close.
 * Modal grows to fit content; if it exceeds the viewport, the WHOLE
 * modal scrolls (single scroll context) — no inner scroll pane.
 */

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Eyebrow } from "./primitives";

type Status = "perfect" | "almost" | "incorrect";

interface CheckResponse {
  status: Status;
  message: string;
  suggestion?: string;
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "gd-spin 0.7s linear infinite" }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M12 7a5 5 0 0 0-5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── FeedbackIndicator ──────────────────────────────────────────
// One indicator row tinted by status. Used inside the result card.
function FeedbackIndicator({
  status,
  message,
}: {
  status: Status;
  message: string;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const isHe = lang === "he";
  const isAr = lang === "ar";
  const bodyFont = isHe
    ? "gd-font-he gd-rtl-body"
    : isAr
      ? "gd-font-ar gd-rtl-body"
      : "gd-font-display";

  // Color & label per status
  const ok = status === "perfect";
  const partial = status === "almost";

  const labelKey: keyof import("@/lib/i18n-v2").V2Strings = ok
    ? "composeStatusPerfectLabel"
    : partial
      ? "composeStatusAlmostLabel"
      : "composeStatusIncorrectLabel";

  // green for perfect, amber for almost, red for incorrect
  const tint = ok
    ? {
        bg: "oklch(0.78 0.13 150 / 0.18)",
        ring: "oklch(0.55 0.18 150 / 0.4)",
        ic: "oklch(0.55 0.18 150)",
      }
    : partial
      ? {
          bg: "oklch(0.82 0.12 75 / 0.18)",
          ring: "oklch(0.55 0.15 65 / 0.4)",
          ic: "oklch(0.55 0.15 65)",
        }
      : {
          bg: "oklch(0.78 0.16 35 / 0.16)",
          ring: "oklch(0.58 0.2 35 / 0.4)",
          ic: "oklch(0.58 0.2 35)",
        };

  return (
    <div
      className={`flex items-start gap-3 `}
      style={{ flex: 1 }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          marginTop: 2,
          background: tint.bg,
          color: tint.ic,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `inset 0 0 0 1px ${tint.ring}`,
        }}
      >
        {ok ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5l2.5 2.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : partial ? (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1v5M5 8v.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2l6 6M8 2l-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div
          className="gd-font-sans-ui"
          style={{
            fontSize: 11.5,
            color: "var(--gd-ink-500)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {v2(lang, labelKey)}
        </div>
        <p
          className={`mt-1 ${bodyFont}`}
          style={{
            fontSize: "clamp(14.5px, 1.5vw, 15.5px)",
            lineHeight: 1.5,
            color: "var(--gd-ink-900)",
            ...(lang !== "he" && lang !== "ar"
              ? { fontVariationSettings: '"opsz" 22' }
              : {}),
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

// ─── ComposeResult — the result card, appears below textarea ────
function ComposeResult({
  result,
  onTryAnother,
  onClose,
}: {
  result: CheckResponse;
  onTryAnother: () => void;
  onClose: () => void;
}) {
  const { lang, dir } = useLang();
  const isHe = lang === "he";
  const isAr = lang === "ar";
  const isRtl = dir === "rtl";

  const rewriteFont = isHe ? "gd-font-he" : isAr ? "gd-font-ar" : "gd-font-display";

  return (
    <div
      className="mt-5"
      style={{
        background: "oklch(0.97 0.012 80 / 0.7)",
        borderRadius: 16,
        padding: "clamp(20px, 2.4vw, 22px) clamp(18px, 2.6vw, 24px)",
        boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 0.06)",
      }}
    >
      <FeedbackIndicator status={result.status} message={result.message} />

      {result.suggestion && (
        <div
          className="mt-5 pt-5"
          style={{ borderTop: "1px dashed oklch(0 0 0 / 0.1)" }}
        >
          <div
            className="gd-font-sans-ui"
            style={{
              fontSize: 11.5,
              color: "var(--gd-ink-500)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {v2(lang, "composeSuggestionEyebrow")}
          </div>
          <blockquote
            className={`mt-2 ${rewriteFont}`}
            style={{
              fontSize: "clamp(17px, 1.8vw, 19px)",
              lineHeight: 1.45,
              color: "var(--gd-ink-900)",
              fontStyle: !isHe && !isAr ? "italic" : "normal",
              borderInlineStart: "3px solid oklch(0.72 0.19 245 / 0.7)",
              paddingInlineStart: 14,
              ...(!isHe && !isAr
                ? { fontVariationSettings: '"opsz" 32' }
                : {}),
            }}
          >
            {result.suggestion}
          </blockquote>
        </div>
      )}

      <div
        className={`mt-6 flex items-center gap-3 `}
      >
        <button
          type="button"
          onClick={onTryAnother}
          className="gd-font-sans-ui font-medium"
          style={{
            fontSize: 13,
            padding: "10px 16px",
            borderRadius: 10,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.5), 0 6px 16px oklch(0.5 0.2 250 / 0.3)",
          }}
        >
          {v2(lang, "composeTryAnother")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="gd-font-sans-ui"
          style={{
            fontSize: 13,
            padding: "10px 16px",
            borderRadius: 10,
            color: "var(--gd-ink-700)",
            background: "oklch(0 0 0 / 0.04)",
            boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 0.08)",
          }}
        >
          {v2(lang, "composeBackToWord")}
        </button>
      </div>
    </div>
  );
}

// ─── ComposeModalV2 ─────────────────────────────────────────────
export function ComposeModalV2({
  open,
  onClose,
  word,
  meaning,
}: {
  open: boolean;
  onClose: () => void;
  word: string;
  /** The specific meaning the user is practicing — passed to the API
   *  so feedback evaluates the right sense, not just any usage. */
  meaning: string;
}) {
  const { user, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const isHe = lang === "he";
  const isAr = lang === "ar";

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [errorKey, setErrorKey] = useState<string>("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setDraft("");
      setBusy(false);
      setResult(null);
      setErrorKey("");
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setErrorKey("composeErrorEmpty");
      return;
    }
    if (trimmed.split(/\s+/).length < 3) {
      setErrorKey("composeErrorTooShort");
      return;
    }
    if (!user) {
      promptLogin(v2(lang, "composeSubmit"));
      return;
    }

    setBusy(true);
    setErrorKey("");
    setResult(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/check-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          word,
          meaning,
          sentence: trimmed,
          uiLang: lang,
        }),
      });
      if (!res.ok) {
        // 402 means tier-locked; the V2 surface should bounce them
        // to pricing. Other errors get the generic message.
        if (res.status === 402) {
          window.location.assign("/pricing");
          return;
        }
        setErrorKey("composeErrorEmpty"); // generic — covers wire failures
        return;
      }
      const data = (await res.json()) as CheckResponse;
      setResult(data);
    } catch {
      setErrorKey("composeErrorEmpty");
    } finally {
      setBusy(false);
    }
  }

  function handleTryAnother() {
    setResult(null);
    setDraft("");
    textareaRef.current?.focus();
  }

  const bodyFont = isHe
    ? "gd-font-he"
    : isAr
      ? "gd-font-ar"
      : "gd-font-display";

  // Title with the word italicized + electric blue
  const titleParts = v2(lang, "composeTitleTemplate", word).split(word);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{
        background: "oklch(0.12 0.04 265 / 0.55)",
        backdropFilter: "blur(14px)",
        padding: "clamp(20px, 4vw, 60px) clamp(16px, 3vw, 32px)",
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
          maxWidth: 620,
          padding: "clamp(24px, 3vw, 32px) clamp(22px, 3vw, 36px) clamp(26px, 3vw, 30px)",
          textAlign: isRtl ? "right" : "left",
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
            insetBlockStart: 8,
            insetInlineEnd: 8,
            // 44×44 hit area for mobile thumb tap.
            width: 44,
            height: 44,
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
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <Eyebrow style={{ color: "oklch(0.5 0.18 250)" }}>
          {v2(lang, "composeEyebrow")}
        </Eyebrow>

        <h2
          className={`mt-2 ${bodyFont}`}
          style={{
            fontSize: "clamp(22px, 2.6vw, 28px)",
            lineHeight: 1.25,
            color: "var(--gd-ink-900)",
            ...(!isHe && !isAr
              ? {
                  fontVariationSettings: '"opsz" 36',
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }
              : {}),
          }}
        >
          {titleParts[0]}
          <em
            style={{
              color: "oklch(0.5 0.18 250)",
              fontStyle: !isHe && !isAr ? "italic" : "normal",
              ...(!isHe && !isAr
                ? { fontVariationSettings: '"opsz" 60' }
                : {}),
            }}
          >
            {word}
          </em>
          {titleParts[1] ?? ""}
        </h2>

        <p
          className="mt-2 gd-font-sans-ui"
          style={{
            fontSize: "clamp(13.5px, 1.4vw, 14.5px)",
            lineHeight: 1.5,
            color: "var(--gd-ink-500)",
          }}
        >
          {v2(lang, "composeSubtitle")}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mt-5 relative">
            <textarea
              ref={textareaRef}
              dir={isRtl ? "rtl" : "ltr"}
              disabled={busy}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (errorKey) setErrorKey("");
              }}
              placeholder={v2(lang, "composePlaceholder")}
              className={`w-full gd-font-sans-ui outline-none ${bodyFont}`}
              style={{
                background: "oklch(0 0 0 / 0.025)",
                color: "var(--gd-ink-900)",
                fontSize: "clamp(16px, 1.7vw, 17px)",
                lineHeight: 1.55,
                padding: "14px 16px",
                borderRadius: 12,
                minHeight: 130,
                resize: "vertical",
                boxShadow: errorKey
                  ? "inset 0 0 0 1.5px oklch(0.55 0.18 28 / 0.6)"
                  : "inset 0 0 0 1px oklch(0 0 0 / 0.12)",
                opacity: busy ? 0.7 : 1,
                ...(!isHe && !isAr
                  ? { fontVariationSettings: '"opsz" 22' }
                  : {}),
              }}
            />
            {draft.length > 100 && !result && (
              <div
                className="absolute gd-font-sans-ui"
                style={{
                  insetBlockEnd: 8,
                  insetInlineEnd: 12,
                  fontSize: 11,
                  color: "var(--gd-ink-400)",
                }}
              >
                {draft.length}
              </div>
            )}
          </div>

          {errorKey && (
            <div
              className="mt-2 gd-font-sans-ui"
              style={{
                fontSize: 13,
                color: "oklch(0.55 0.18 28)",
                lineHeight: 1.4,
              }}
              role="alert"
            >
              {v2(lang, errorKey as never)}
            </div>
          )}

          <div
            className={`mt-5 flex items-center ${isRtl ? "justify-start" : "justify-end"}`}
          >
            <button
              type="submit"
              disabled={busy}
              className="gd-font-sans-ui font-medium inline-flex items-center justify-center gap-2"
              style={{
                fontSize: 14,
                padding: "12px 22px",
                borderRadius: 12,
                background: busy
                  ? "linear-gradient(180deg, oklch(0.62 0.1 245), oklch(0.5 0.12 250))"
                  : "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                color: "white",
                boxShadow:
                  "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
                opacity: busy ? 0.85 : 1,
                cursor: busy ? "default" : "pointer",
              }}
            >
              {busy && <Spinner />}
              {busy ? v2(lang, "composeChecking") : v2(lang, "composeSubmit")}
            </button>
          </div>
        </form>

        {result && (
          <ComposeResult
            result={result}
            onTryAnother={handleTryAnother}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
