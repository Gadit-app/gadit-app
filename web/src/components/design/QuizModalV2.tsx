"use client";

/**
 * QuizModalV2 — Screen 6 from the redesign pass.
 *
 * Deep-tier feature. Opens from "Practice this word" in Take it
 * further on the result page. Pulls 4 mixed-type questions from
 * /api/quiz, walks the user through them one at a time with reveal +
 * explanation after each submit, and shows a final score screen.
 *
 * Schema reconciliation:
 * - API returns { questions: [{ type, prompt, options, correctIndex,
 *   explanation }] } — we render directly, no transformation needed.
 * - Question types A/B/C/D map to four prompt families. We display
 *   `prompt` straight (it's authored per-question by the model);
 *   no separate Type A "Which of these…" intro is needed since the
 *   model writes the full prompt.
 * - Single `explanation` string is shown after submit, regardless of
 *   correct/wrong. This is simpler than maintaining two strings and
 *   matches the model's actual output.
 *
 * Selected-state visuals match Claude Design's spec exactly: idle /
 * selected (electric-blue ring) / correct (green tint) / wrong (red
 * tint) / dim (post-reveal, non-correct, non-wrong).
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { Eyebrow } from "./primitives";

interface QuizQuestion {
  type: "A" | "B" | "C" | "D";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
}

type OptionState = "idle" | "selected" | "correct" | "wrong" | "dim";

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

// ─── Single option pill ────────────────────────────────────────
function QuizOption({
  text,
  state,
  onClick,
}: {
  text: string;
  state: OptionState;
  onClick?: () => void;
}) {
  const { lang, dir } = useLang();
  const isHe = lang === "he";
  const isAr = lang === "ar";
  const isRtl = dir === "rtl";

  const bodyFont = isHe
    ? "gd-font-he gd-rtl-body"
    : isAr
      ? "gd-font-ar gd-rtl-body"
      : "gd-font-display";

  const styles = {
    idle: {
      background: "oklch(0.98 0.01 80)",
      ring: "inset 0 0 0 1px oklch(0 0 0 / 0.08)",
      color: "var(--gd-ink-900)",
      opacity: 1,
    },
    selected: {
      background: "oklch(0.98 0.01 80)",
      ring: "inset 0 0 0 1.5px oklch(0.72 0.19 245 / 0.65), 0 0 0 5px oklch(0.72 0.19 245 / 0.1)",
      color: "var(--gd-ink-900)",
      opacity: 1,
    },
    correct: {
      background: "oklch(0.96 0.04 150 / 0.7)",
      ring: "inset 0 0 0 1.5px oklch(0.55 0.18 150 / 0.55)",
      color: "var(--gd-ink-900)",
      opacity: 1,
    },
    wrong: {
      background: "oklch(0.96 0.04 35 / 0.6)",
      ring: "inset 0 0 0 1.5px oklch(0.58 0.2 35 / 0.5)",
      color: "var(--gd-ink-900)",
      opacity: 1,
    },
    dim: {
      background: "oklch(0.97 0.01 80 / 0.6)",
      ring: "inset 0 0 0 1px oklch(0 0 0 / 0.06)",
      color: "var(--gd-ink-500)",
      opacity: 0.55,
    },
  }[state];

  const interactive = state === "idle" || state === "selected";

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={`flex items-start gap-3 ${isRtl ? "flex-row-reverse text-right" : ""} w-full transition-all`}
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        background: styles.background,
        boxShadow: styles.ring,
        opacity: styles.opacity,
        cursor: interactive ? "pointer" : "default",
      }}
      aria-pressed={state === "selected"}
    >
      <div
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          flexShrink: 0,
          marginTop: 1,
          background:
            state === "correct"
              ? "oklch(0.55 0.18 150)"
              : state === "wrong"
                ? "oklch(0.58 0.2 35)"
                : state === "selected"
                  ? "oklch(0.72 0.19 245)"
                  : "transparent",
          boxShadow:
            state === "idle" || state === "dim"
              ? "inset 0 0 0 1.5px oklch(0 0 0 / 0.18)"
              : state === "selected"
                ? "0 0 0 4px oklch(0.72 0.19 245 / 0.18)"
                : "none",
          color: "white",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {state === "correct" && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5l2.5 2.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {state === "wrong" && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2l6 6M8 2l-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
        {state === "selected" && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "white",
            }}
          />
        )}
      </div>
      <div
        className={bodyFont}
        style={{
          flex: 1,
          fontSize: "clamp(15px, 1.6vw, 16px)",
          lineHeight: 1.5,
          color: styles.color,
          textAlign: isRtl ? "right" : "left",
          ...(!isHe && !isAr
            ? { fontVariationSettings: '"opsz" 22' }
            : {}),
        }}
      >
        {text}
      </div>
    </button>
  );
}

// ─── Final score screen ───────────────────────────────────────
function QuizFinal({
  correct,
  total,
  missedSummaries,
  onPracticeAnother,
  onBackToWord,
}: {
  correct: number;
  total: number;
  missedSummaries: Array<{ n: number; summary: string }>;
  onPracticeAnother: () => void;
  onBackToWord: () => void;
}) {
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const isHe = lang === "he";
  const isAr = lang === "ar";

  return (
    <div style={{ textAlign: "center", paddingBlock: 30 }}>
      <Eyebrow style={{ color: "oklch(0.5 0.18 250)" }}>
        {v2(lang, "quizEyebrow")}
      </Eyebrow>
      <div
        className="gd-font-display"
        style={{
          marginTop: 12,
          fontSize: "clamp(100px, 14vw, 144px)",
          lineHeight: 1,
          color: "var(--gd-ink-900)",
          fontVariationSettings: '"opsz" 144',
          letterSpacing: "-0.04em",
          fontWeight: 400,
        }}
      >
        <span style={{ color: "oklch(0.5 0.18 250)" }}>{correct}</span>
        <span style={{ color: "var(--gd-ink-300)", margin: "0 0.05em" }}>
          /
        </span>
        <span>{total}</span>
      </div>
      <p
        className={
          isHe
            ? "gd-font-he"
            : isAr
              ? "gd-font-ar"
              : "gd-font-display"
        }
        style={{
          marginTop: 12,
          fontSize: "clamp(17px, 1.8vw, 19px)",
          color: "var(--gd-ink-700)",
          ...(!isHe && !isAr
            ? {
                fontVariationSettings: '"opsz" 24',
                fontStyle: "italic",
              }
            : {}),
        }}
      >
        {v2(lang, "quizFinalScoreTemplate", correct, total)}
      </p>

      {missedSummaries.length > 0 && (
        <details
          className="mt-6 mx-auto"
          style={{
            maxWidth: 420,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <summary
            className="gd-font-sans-ui cursor-pointer"
            style={{ fontSize: 13, color: "oklch(0.5 0.18 250)" }}
          >
            {v2(lang, "quizReviewMistakes")}
          </summary>
          <ul className="mt-3 space-y-2 gd-font-sans-ui">
            {missedSummaries.map((m, i) => (
              <li
                key={i}
                className="flex items-start gap-2"
                style={{
                  fontSize: 13,
                  color: "var(--gd-ink-700)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "oklch(0.58 0.2 35)" }}>·</span>
                <span>
                  Q{m.n}: {m.summary}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div
        className={`mt-7 flex items-center justify-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <button
          type="button"
          onClick={onPracticeAnother}
          className="gd-font-sans-ui font-medium"
          style={{
            fontSize: 14,
            padding: "12px 20px",
            borderRadius: 12,
            color: "white",
            background:
              "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
          }}
        >
          {v2(lang, "quizPracticeAnotherWord")}
        </button>
        <button
          type="button"
          onClick={onBackToWord}
          className="gd-font-sans-ui"
          style={{
            fontSize: 14,
            padding: "12px 20px",
            borderRadius: 12,
            color: "var(--gd-ink-700)",
            background: "oklch(0 0 0 / 0.04)",
            boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 0.08)",
          }}
        >
          {v2(lang, "quizBackToWord")}
        </button>
      </div>
    </div>
  );
}

// ─── QuizModalV2 ──────────────────────────────────────────────
export function QuizModalV2({
  open,
  onClose,
  word,
  meaning,
}: {
  open: boolean;
  onClose: () => void;
  word: string;
  meaning: string;
}) {
  const { user, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const isRtl = dir === "rtl";
  const isHe = lang === "he";
  const isAr = lang === "ar";

  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  // Tracks which questions the user got right (after revealing each)
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  // Reset every time we open from scratch
  useEffect(() => {
    if (open) {
      setQuestions(null);
      setLoading(false);
      setErrorMsg("");
      setQIndex(0);
      setSelectedIdx(null);
      setRevealed(false);
      setResults([]);
      setDone(false);
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

  const fetchQuiz = useCallback(async () => {
    if (!user) {
      promptLogin(v2(lang, "quizEyebrow"));
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ word, meaning, uiLang: lang }),
      });
      if (!res.ok) {
        if (res.status === 402) {
          window.location.assign("/pricing");
          return;
        }
        setErrorMsg("Quiz unavailable right now.");
        return;
      }
      const data = (await res.json()) as QuizResponse;
      if (!data.questions || data.questions.length === 0) {
        setErrorMsg("No questions returned.");
        return;
      }
      setQuestions(data.questions.slice(0, 4));
    } catch {
      setErrorMsg("Quiz unavailable right now.");
    } finally {
      setLoading(false);
    }
  }, [user, lang, word, meaning, promptLogin]);

  // Kick off the fetch when modal opens
  useEffect(() => {
    if (open && !questions && !loading && !errorMsg) {
      fetchQuiz();
    }
  }, [open, questions, loading, errorMsg, fetchQuiz]);

  if (!open) return null;

  const currentQuestion = questions ? questions[qIndex] : null;
  const isLast = questions ? qIndex === questions.length - 1 : false;
  const submitDisabled = !revealed && selectedIdx === null;
  const submitLabel = !revealed
    ? v2(lang, "quizSubmit")
    : isLast
      ? v2(lang, "quizFinish")
      : v2(lang, "quizNext");

  function handleSubmit() {
    if (!currentQuestion) return;
    if (!revealed) {
      // Reveal the answer
      const correct = selectedIdx === currentQuestion.correctIndex;
      setResults((r) => [...r, correct]);
      setRevealed(true);
    } else {
      // Advance to next question or finish
      if (isLast) {
        setDone(true);
      } else {
        setQIndex((i) => i + 1);
        setSelectedIdx(null);
        setRevealed(false);
      }
    }
  }

  const titleFont = isHe
    ? "gd-font-he"
    : isAr
      ? "gd-font-ar"
      : "gd-font-display";

  // Build the title parts to italicize the word
  const titleStr = v2(lang, "quizTitleTemplate", word);
  const titleParts = titleStr.split(word);

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
          padding: "clamp(22px, 3vw, 30px) clamp(22px, 3vw, 36px) clamp(26px, 3vw, 32px)",
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
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* === Final score state === */}
        {done && questions && (
          <QuizFinal
            correct={results.filter(Boolean).length}
            total={questions.length}
            missedSummaries={questions
              .map((q, i) => ({
                n: i + 1,
                summary: q.prompt,
                missed: !results[i],
              }))
              .filter((m) => m.missed)
              .map(({ n, summary }) => ({ n, summary }))}
            onPracticeAnother={() => {
              window.location.assign("/");
            }}
            onBackToWord={onClose}
          />
        )}

        {/* === Loading state === */}
        {!done && loading && !questions && (
          <div
            className="flex items-center justify-center gd-font-sans-ui"
            style={{
              padding: "60px 20px",
              fontSize: 14,
              color: "var(--gd-ink-500)",
            }}
          >
            <Spinner />
            <span style={{ marginInlineStart: 12 }}>
              {v2(lang, "quizLoading")}
            </span>
          </div>
        )}

        {/* === Error state === */}
        {!done && errorMsg && (
          <div
            className="gd-font-sans-ui text-center"
            style={{
              padding: "40px 20px",
              fontSize: 14,
              color: "var(--gd-ink-700)",
            }}
          >
            <p>{errorMsg}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 gd-font-sans-ui"
              style={{
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 10,
                color: "var(--gd-ink-700)",
                background: "oklch(0 0 0 / 0.04)",
                boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 0.08)",
              }}
            >
              {v2(lang, "quizBackToWord")}
            </button>
          </div>
        )}

        {/* === Question state === */}
        {!done && currentQuestion && (
          <>
            {/* Header row: eyebrow+title vs progress */}
            <div
              className={`flex items-start ${isRtl ? "flex-row-reverse" : ""} justify-between gap-3`}
            >
              <div>
                <Eyebrow style={{ color: "oklch(0.5 0.18 250)" }}>
                  {v2(lang, "quizEyebrow")}
                </Eyebrow>
                <h2
                  className={`mt-1.5 ${titleFont}`}
                  style={{
                    fontSize: "clamp(22px, 2.4vw, 26px)",
                    lineHeight: 1.2,
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
              </div>
              {/* Progress + segmented pips */}
              <div
                className={isRtl ? "text-left" : "text-right"}
                style={{ paddingTop: 4 }}
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
                  {v2(
                    lang,
                    "quizQuestionNofM",
                    qIndex + 1,
                    questions?.length ?? 4
                  )}
                </div>
                <div
                  className={`mt-2 flex items-center gap-1.5 ${isRtl ? "justify-start" : "justify-end"}`}
                >
                  {Array.from({
                    length: questions?.length ?? 4,
                  }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === qIndex ? 14 : 6,
                        height: 6,
                        borderRadius: 999,
                        background:
                          i < qIndex
                            ? "oklch(0.5 0.18 250 / 0.7)"
                            : i === qIndex
                              ? "oklch(0.5 0.18 250)"
                              : "oklch(0 0 0 / 0.12)",
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="my-5"
              style={{ height: 1, background: "oklch(0 0 0 / 0.07)" }}
            />

            {/* Question prompt */}
            <div
              className={titleFont}
              style={{
                fontSize: "clamp(19px, 2vw, 22px)",
                lineHeight: 1.35,
                color: "var(--gd-ink-900)",
                ...(!isHe && !isAr
                  ? {
                      fontVariationSettings: '"opsz" 28',
                      fontWeight: 400,
                    }
                  : {}),
              }}
            >
              {currentQuestion.prompt}
            </div>

            {/* Options */}
            <div className="mt-5 grid gap-2.5">
              {currentQuestion.options.map((opt, i) => {
                let state: OptionState = "idle";
                if (!revealed && selectedIdx === i) state = "selected";
                if (revealed) {
                  if (i === currentQuestion.correctIndex) state = "correct";
                  else if (selectedIdx === i) state = "wrong";
                  else state = "dim";
                }
                return (
                  <QuizOption
                    key={i}
                    text={opt}
                    state={state}
                    onClick={() => !revealed && setSelectedIdx(i)}
                  />
                );
              })}
            </div>

            {/* Reveal explanation */}
            {revealed && (
              <div
                className="mt-5"
                style={{
                  background:
                    selectedIdx === currentQuestion.correctIndex
                      ? "oklch(0.96 0.04 150 / 0.5)"
                      : "oklch(0.96 0.04 80 / 0.7)",
                  borderInlineStart:
                    selectedIdx === currentQuestion.correctIndex
                      ? "3px solid oklch(0.55 0.18 150 / 0.7)"
                      : "3px solid oklch(0.78 0.13 75 / 0.8)",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div
                  className="gd-font-sans-ui font-semibold"
                  style={{
                    fontSize: 12.5,
                    color: "var(--gd-ink-700)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedIdx === currentQuestion.correctIndex
                    ? v2(lang, "quizYesCorrect")
                    : v2(lang, "quizNotQuite")}
                </div>
                <p
                  className={`mt-1.5 ${isRtl ? "gd-rtl-body" : ""}`}
                  style={{
                    fontSize: "clamp(13.5px, 1.4vw, 14.5px)",
                    lineHeight: 1.55,
                    color: "var(--gd-ink-900)",
                  }}
                >
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Submit */}
            <div
              className={`mt-6 flex items-center ${isRtl ? "justify-start" : "justify-end"}`}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="gd-font-sans-ui font-medium"
                style={{
                  fontSize: 14,
                  padding: "12px 22px",
                  borderRadius: 12,
                  background: submitDisabled
                    ? "oklch(0 0 0 / 0.06)"
                    : "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                  color: submitDisabled ? "var(--gd-ink-400)" : "white",
                  boxShadow: submitDisabled
                    ? "inset 0 0 0 1px oklch(0 0 0 / 0.08)"
                    : "0 0 0 1px oklch(0.5 0.2 250 / 0.6), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
                  cursor: submitDisabled ? "not-allowed" : "pointer",
                }}
              >
                {submitLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
