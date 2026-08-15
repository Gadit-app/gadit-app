"use client";

/**
 * PracticeV2 — Screen 9 from the redesign pass.
 *
 * Spaced-repetition flashcard practice. Companion to NotebookV2:
 * the "Practice now" CTA on the notebook hero routes here.
 *
 * State machine: loading → empty | front → back → next | summary
 *
 * Phases share the same wordbook card on the light surface. No flip
 * animation — just a 150ms cross-fade between front/back. Self-
 * reported recall (I knew it / I forgot), equal visual weight, only
 * the ring tint differs (green vs amber). Skip is a separate code
 * path that does NOT update the review interval.
 *
 * Schema:
 *   GET  /api/notebook/review → { items: NotebookItem[], dueCount }
 *   POST /api/notebook/review { id, result: "correct" | "incorrect" }
 *     SM-2 doubling (max 90d), reset to 1d on incorrect.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHref } from "@/lib/href";
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
  return s === "he" ? "var(--wb-he)" : s === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
}
function fontBody(s: Script) {
  return s === "he" ? "var(--wb-he)" : s === "ar" ? "var(--wb-ar)" : "var(--wb-serif)";
}
// gd-rtl-body is purely directional (font-size / line-height tuning under
// [dir="rtl"]); keep it on body copy for he/ar, drop it for latin.
function bodyDir(s: Script) {
  return s === "he" || s === "ar" ? "gd-rtl-body" : "";
}

// Wordbook white card chrome. Replaces the old cream `gd-card`.
const wbCard = {
  background: "var(--surface, #fff)",
  border: "1px solid var(--rule, #E2E5EA)",
  borderRadius: 16,
  boxShadow: "0 8px 24px -12px rgba(16,24,40,0.12)",
};

interface ReviewItem {
  id: string;
  word: string;
  language: string;
  meaning: string;
  examples?: string[]; // not always saved with the item; we render if present
  addedAt: string;
  nextReviewAt?: string;
  intervalDays?: number;
  timesReviewed?: number;
  timesCorrect?: number;
}

type Phase =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "front"; idx: number }
  | { kind: "back"; idx: number }
  | { kind: "summary" };

// ─── Front of the card ────────────────────────────────────────
function CardFront({
  entry,
  index,
  total,
  onReveal,
  onSkip,
}: {
  entry: ReviewItem;
  index: number;
  total: number;
  onReveal: () => void;
  onSkip: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  return (
    <div
      className="relative cursor-pointer sr-fade"
      onClick={onReveal}
      style={{
        ...wbCard,
        width: "100%",
        maxWidth: 720,
        padding: "clamp(40px, 6vw, 64px) clamp(28px, 4vw, 56px) clamp(32px, 4vw, 48px)",
        minHeight: "clamp(380px, 50vh, 460px)",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      {/* Top row: eyebrow · counter | skip */}
      <div
        className={`flex items-center justify-between `}
      >
        <div
          className={`flex items-center gap-2.5 `}
        >
          <Eyebrow style={{ color: "#0EA5A5" }}>
            {v2(lang, "srEyebrow")}
          </Eyebrow>
          <span style={{ color: "var(--rule, #E2E5EA)", fontSize: 11 }}>·</span>
          <span
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 11,
              color: "var(--ink-muted, #6B7280)",
              letterSpacing: "0.06em",
            }}
          >
            {v2(lang, "srWordNofMTemplate", index + 1, total)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="transition-colors hover:text-[#3F4856]"
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 12,
            color: "var(--ink-muted, #6B7280)",
            padding: "4px 8px",
          }}
        >
          {v2(lang, "srSkip")}
        </button>
      </div>

      {/* Progress pips */}
      <div
        className={`mt-5 flex items-center gap-1.5 ${isRtl ? "flex-row-reverse justify-end" : ""}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === index ? 18 : 10,
              height: 4,
              borderRadius: 999,
              background:
                i < index
                  ? "rgba(16,185,129,0.55)"
                  : i === index
                    ? "#0EA5A5"
                    : "var(--rule, #E2E5EA)",
              transition: "all 200ms",
            }}
          />
        ))}
      </div>

      {/* Center: word */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ marginBlock: "clamp(36px, 6vw, 56px)" }}
      >
        <h2
          style={{
            fontFamily: fontDisplay(script),
            // Floor lowered (was 56px) and overflowWrap added so long
            // compound words don't overflow the practice card on
            // narrow phones.
            fontSize: "clamp(40px, 9vw, 88px)",
            lineHeight: 1.05,
            color: "#0EA5A5",
            fontStyle: script === "latin" ? "italic" : "normal",
            letterSpacing: script === "latin" ? "-0.02em" : 0,
            overflowWrap: "anywhere",
            textAlign: "center",
            ...(script === "latin"
              ? {
                  fontVariationSettings: '"opsz" 144, "SOFT" 80',
                  fontWeight: 400,
                }
              : { fontWeight: 600 }),
          }}
        >
          {entry.word}
        </h2>
      </div>

      {/* Reveal hint */}
      <div
        className={`flex items-center justify-center gap-2 `}
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 12.5,
          color: "var(--ink-muted, #6B7280)",
          letterSpacing: "0.04em",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 3v8M3 7l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Use a single string for both, feature detection on touch is
            unreliable in SSR; "Click anywhere" works on touch too. */}
        {v2(lang, "srClickToReveal")}
      </div>
    </div>
  );
}

// ─── Back of the card ─────────────────────────────────────────
function CardBack({
  entry,
  index,
  total,
  onKnew,
  onForgot,
}: {
  entry: ReviewItem;
  index: number;
  total: number;
  onKnew: () => void;
  onForgot: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);

  return (
    <div
      className="relative sr-fade"
      style={{
        ...wbCard,
        width: "100%",
        maxWidth: 720,
        padding: "clamp(32px, 5vw, 52px) clamp(28px, 4vw, 56px) clamp(32px, 4vw, 44px)",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      {/* Header row */}
      <div
        className={`flex items-center gap-2.5 `}
      >
        <Eyebrow style={{ color: "#0EA5A5" }}>
          {v2(lang, "srEyebrow")}
        </Eyebrow>
        <span style={{ color: "var(--rule, #E2E5EA)", fontSize: 11 }}>·</span>
        <span
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 11,
            color: "var(--ink-muted, #6B7280)",
            letterSpacing: "0.06em",
          }}
        >
          {v2(lang, "srWordNofMTemplate", index + 1, total)}
        </span>
      </div>

      {/* Word — smaller now */}
      <h3
        style={{
          fontFamily: fontDisplay(script),
          fontSize: "clamp(32px, 4.4vw, 40px)",
          color: "#0EA5A5",
          fontStyle: script === "latin" ? "italic" : "normal",
          letterSpacing: script === "latin" ? "-0.02em" : 0,
          marginTop: 18,
          ...(script === "latin"
            ? { fontVariationSettings: '"opsz" 60', fontWeight: 400 }
            : { fontWeight: 600 }),
        }}
      >
        {entry.word}
      </h3>

      {/* Meaning */}
      <div className="mt-5">
        <div
          className={`mb-2 ${isRtl ? "text-right" : ""}`}
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-muted, #6B7280)",
            fontWeight: 600,
          }}
        >
          {v2(lang, "srPrimaryMeaningLabel")}
        </div>
        <p
          className={bodyDir(script)}
          style={{
            fontFamily: fontBody(script),
            fontSize: "clamp(19px, 2.2vw, 22px)",
            lineHeight: 1.4,
            color: "var(--ink, #0B1220)",
            ...(script === "latin"
              ? { fontVariationSettings: '"opsz" 32' }
              : {}),
          }}
        >
          {entry.meaning}
        </p>
      </div>

      {/* Examples, render only when the item carries them. The notebook
         schema doesn't always save examples; treat the list as optional. */}
      {entry.examples && entry.examples.length > 0 && (
        <div className="mt-6">
          <div
            className={`mb-2 ${isRtl ? "text-right" : ""}`}
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--ink-muted, #6B7280)",
              fontWeight: 600,
            }}
          >
            {v2(lang, "srExamplesLabel")}
          </div>
          <ul className="space-y-2">
            {entry.examples.map((ex, i) => (
              <li
                key={i}
                className={bodyDir(script)}
                style={{
                  fontFamily: fontBody(script),
                  fontSize: "clamp(14.5px, 1.6vw, 16px)",
                  lineHeight: 1.55,
                  color: "var(--ink-soft, #3F4856)",
                  fontStyle: script === "latin" ? "italic" : "normal",
                  paddingInlineStart: 14,
                  borderInlineStart: "2px solid rgba(14,165,165,0.35)",
                }}
              >
                {ex}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response buttons */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onForgot}
          className="font-medium transition-transform hover:translate-y-[-1px]"
          style={{
            fontFamily: "var(--wb-sans)",
            padding: "clamp(14px, 1.6vw, 16px) clamp(14px, 1.8vw, 18px)",
            borderRadius: 12,
            background: "oklch(0.99 0.012 75)",
            color: "oklch(0.42 0.14 75)",
            fontSize: "clamp(14.5px, 1.5vw, 15px)",
            boxShadow:
              "inset 0 0 0 1.5px oklch(0.78 0.13 75 / 0.55), 0 1px 2px oklch(0.5 0.1 75 / 0.1)",
          }}
        >
          {v2(lang, "srIForgot")}
        </button>
        <button
          type="button"
          onClick={onKnew}
          className="font-medium transition-transform hover:translate-y-[-1px]"
          style={{
            fontFamily: "var(--wb-sans)",
            padding: "clamp(14px, 1.6vw, 16px) clamp(14px, 1.8vw, 18px)",
            borderRadius: 12,
            background: "oklch(0.98 0.018 155)",
            color: "oklch(0.4 0.13 155)",
            fontSize: "clamp(14.5px, 1.5vw, 15px)",
            boxShadow:
              "inset 0 0 0 1.5px oklch(0.74 0.13 155 / 0.55), 0 1px 2px oklch(0.5 0.1 155 / 0.1)",
          }}
        >
          {v2(lang, "srIKnewIt")}
        </button>
      </div>

      {/* Scheduling hint */}
      <p
        className={`mt-3 ${isRtl ? "text-right" : "text-center"}`}
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: 11.5,
          color: "var(--ink-muted, #6B7280)",
          lineHeight: 1.5,
        }}
      >
        {v2(lang, "srSchedulingHint")}
      </p>
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────
function Summary({
  knew,
  forgot,
  onDone,
  onMore,
}: {
  knew: number;
  forgot: number;
  onDone: () => void;
  onMore?: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const script = scriptFor(lang);
  const total = knew + forgot;
  const dueCount = forgot;

  return (
    <div
      className="relative"
      style={{
        ...wbCard,
        width: "100%",
        maxWidth: 720,
        padding: "clamp(40px, 6vw, 60px) clamp(28px, 4vw, 56px) clamp(32px, 4vw, 48px)",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      <Eyebrow style={{ color: "#0EA5A5" }}>
        {v2(lang, "srEyebrow")}
      </Eyebrow>

      {/* Big number + label */}
      <div
        className={`flex items-baseline gap-3 mt-3 `}
      >
        <span
          style={{
            fontFamily: "var(--wb-serif)",
            fontSize: "clamp(88px, 14vw, 132px)",
            lineHeight: 0.95,
            color: "#0EA5A5",
            fontVariationSettings: '"opsz" 144, "SOFT" 80',
            fontWeight: 400,
            fontStyle: "italic",
            letterSpacing: "-0.03em",
          }}
        >
          {total}
        </span>
        <span
          style={{
            fontFamily: "var(--wb-sans)",
            fontSize: "clamp(17px, 1.8vw, 20px)",
            color: "var(--ink-soft, #3F4856)",
            maxWidth: 200,
            lineHeight: 1.3,
          }}
        >
          {v2(lang, "srWordsPracticed")}
        </span>
      </div>

      {/* Stat line */}
      <p
        className="mt-5"
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: "clamp(15px, 1.7vw, 17px)",
          color: "var(--ink-soft, #3F4856)",
          lineHeight: 1.5,
        }}
      >
        {v2(lang, "srSummaryStatTemplate", knew, forgot)}
      </p>

      {/* Calendar preview */}
      <div
        className="mt-7"
        style={{
          padding: "clamp(14px, 1.8vw, 16px) clamp(18px, 2.4vw, 22px)",
          borderRadius: 12,
          background: "rgba(14,165,165,0.08)",
          boxShadow: "inset 0 0 0 1px rgba(14,165,165,0.18)",
        }}
      >
        <div
          className={`flex items-center gap-3 `}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "#0EA5A5", flexShrink: 0 }}
          >
            <rect
              x="3.5"
              y="5"
              width="17"
              height="15"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M3.5 9h17M8 3v4M16 3v4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="14" r="1.6" fill="currentColor" />
          </svg>
          <p
            style={{
              fontFamily: "var(--wb-sans)",
              fontSize: "clamp(14px, 1.5vw, 15px)",
              color: "var(--ink, #0B1220)",
              lineHeight: 1.5,
            }}
          >
            {v2(
              lang,
              "srNextReviewTemplate",
              v2(lang, "srTomorrow"),
              dueCount > 0 ? dueCount : 0
            )}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-7 flex flex-col md:flex-row gap-3">
        <button
          type="button"
          onClick={onDone}
          className="font-medium"
          style={{
            fontFamily: "var(--wb-sans)",
            padding: "13px 24px",
            borderRadius: 12,
            background:
              "linear-gradient(180deg, #0EA5A5, #0b7d7d)",
            color: "white",
            fontSize: 15,
            boxShadow:
              "0 0 0 1px rgba(14,165,165,0.6), 0 8px 22px rgba(14,165,165,0.4)",
          }}
        >
          {v2(lang, "srDoneForToday")}
        </button>
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            style={{
              fontFamily: "var(--wb-sans)",
              padding: "13px 24px",
              borderRadius: 12,
              background: "transparent",
              color: "var(--ink-soft, #3F4856)",
              fontSize: 15,
              boxShadow: "inset 0 0 0 1px var(--rule, #E2E5EA)",
            }}
          >
            {v2(lang, "srPracticeMore")}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyState({ onBack }: { onBack: () => void }) {
  const { lang, dir } = useLang();
  const script = scriptFor(lang);

  return (
    <div
      className="relative"
      style={{
        ...wbCard,
        width: "100%",
        maxWidth: 720,
        padding: "clamp(50px, 8vw, 80px) clamp(28px, 4vw, 56px) clamp(40px, 6vw, 64px)",
        textAlign: "center",
      }}
      dir={dir}
    >
      <Eyebrow style={{ color: "#0EA5A5" }}>
        {v2(lang, "srEyebrow")}
      </Eyebrow>

      {/* Quiet glyph: orbit, not a star */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        style={{
          display: "block",
          margin: "32px auto 24px",
          color: "#0EA5A5",
        }}
      >
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <circle
          cx="24"
          cy="24"
          r="10"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeOpacity="0.2"
        />
      </svg>

      <h3
        style={{
          fontFamily: fontDisplay(script),
          fontSize: "clamp(28px, 3.6vw, 36px)",
          color: "var(--ink, #0B1220)",
          fontStyle: script === "latin" ? "italic" : "normal",
          letterSpacing: script === "latin" ? "-0.02em" : 0,
          ...(script === "latin"
            ? { fontVariationSettings: '"opsz" 60', fontWeight: 400 }
            : { fontWeight: 600 }),
        }}
      >
        {v2(lang, "srEmptyTitle")}
      </h3>
      <p
        className="mt-3"
        style={{
          fontFamily: "var(--wb-sans)",
          fontSize: "clamp(14.5px, 1.6vw, 16px)",
          color: "var(--ink-soft, #3F4856)",
          lineHeight: 1.5,
        }}
      >
        {v2(lang, "srEmptyBody")}
      </p>

      <button
        type="button"
        onClick={onBack}
        className="mt-8"
        style={{
          fontFamily: "var(--wb-sans)",
          padding: "13px 26px",
          borderRadius: 12,
          background: "transparent",
          color: "var(--ink, #0B1220)",
          fontSize: 15,
          fontWeight: 500,
          boxShadow: "inset 0 0 0 1px var(--rule, #E2E5EA)",
        }}
      >
        {v2(lang, "srBackToNotebook")}
      </button>
    </div>
  );
}

// ─── Main PracticeV2 ──────────────────────────────────────────
export function PracticeV2() {
  const { user } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const href = useHref();

  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [results, setResults] = useState<{
    knew: number;
    forgot: number;
  }>({ knew: 0, forgot: 0 });

  // Fetch the queue once
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        setPhase({ kind: "empty" });
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook/review", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) {
          if (res.status === 402) {
            router.push(href("/pricing"));
            return;
          }
          if (cancelled) return;
          setPhase({ kind: "empty" });
          return;
        }
        const data = (await res.json()) as {
          items: ReviewItem[];
          dueCount: number;
        };
        if (cancelled) return;
        if (!data.items || data.items.length === 0) {
          setPhase({ kind: "empty" });
          return;
        }
        setItems(data.items);
        setPhase({ kind: "front", idx: 0 });
      } catch {
        if (!cancelled) setPhase({ kind: "empty" });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const total = items?.length ?? 0;

  async function recordReview(
    id: string,
    result: "correct" | "incorrect"
  ) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/notebook/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id, result }),
      });
    } catch {
      // swallow — local tally is the user-facing source of truth, the
      // background sync isn't blocking. If this fails the word will
      // simply stay in its current SR slot.
    }
  }

  function advance() {
    if (!items) return;
    const next = phase.kind === "back" ? phase.idx + 1 : 0;
    if (next >= items.length) {
      setPhase({ kind: "summary" });
    } else {
      setPhase({ kind: "front", idx: next });
    }
  }

  function handleReveal() {
    if (phase.kind !== "front") return;
    setPhase({ kind: "back", idx: phase.idx });
  }

  function handleSkip() {
    // Skip does NOT touch the SR interval — just move on.
    if (phase.kind === "front") {
      const next = phase.idx + 1;
      if (items && next >= items.length) {
        setPhase({ kind: "summary" });
      } else {
        setPhase({ kind: "front", idx: next });
      }
    }
  }

  function handleKnew() {
    if (phase.kind !== "back" || !items) return;
    const item = items[phase.idx];
    void recordReview(item.id, "correct");
    setResults((r) => ({ ...r, knew: r.knew + 1 }));
    advance();
  }

  function handleForgot() {
    if (phase.kind !== "back" || !items) return;
    const item = items[phase.idx];
    void recordReview(item.id, "incorrect");
    setResults((r) => ({ ...r, forgot: r.forgot + 1 }));
    advance();
  }

  // Loading view
  if (phase.kind === "loading") {
    return (
      <div
        style={{
          ...wbCard,
          width: "100%",
          maxWidth: 720,
          padding: "60px 40px",
          textAlign: "center",
          opacity: 0.6,
        }}
      >
        <span
          style={{ fontFamily: "var(--wb-sans)", fontSize: 14, color: "var(--ink-muted, #6B7280)" }}
        >
          {v2(lang, "srLoading")}
        </span>
      </div>
    );
  }

  if (phase.kind === "empty") {
    return <EmptyState onBack={() => router.push("/notebook")} />;
  }

  if (phase.kind === "summary") {
    return (
      <Summary
        knew={results.knew}
        forgot={results.forgot}
        onDone={() => router.push("/notebook")}
      />
    );
  }

  if (!items) return null;
  const entry = items[phase.idx];
  if (!entry) return null;

  if (phase.kind === "front") {
    return (
      <CardFront
        entry={entry}
        index={phase.idx}
        total={total}
        onReveal={handleReveal}
        onSkip={handleSkip}
      />
    );
  }

  // back
  return (
    <CardBack
      entry={entry}
      index={phase.idx}
      total={total}
      onKnew={handleKnew}
      onForgot={handleForgot}
    />
  );
}
