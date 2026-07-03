"use client";

/**
 * GameSpeed — 60-second quiz blitz.
 *
 * Same multiple-choice mechanic as Quiz, but no per-question feedback
 * delay — instant advance. Timer drives the session length; score =
 * total correct in 60s. Wrong answers cost 1 second penalty so users
 * can't button-mash.
 *
 * Pre-roll: 3-2-1-GO countdown before the timer starts, so the first
 * question doesn't burn 2 seconds of read time.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import type { PlayWord, QuizQuestion } from "@/lib/play-engine";
import { buildSpeedDeck } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";

const DURATION = 60;
const WRONG_PENALTY = 1; // seconds

export function GameSpeed({
  pool,
  onExit,
  lang,
  t,
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
}) {
  const deck = useMemo(() => buildSpeedDeck(pool), [pool]);
  const [stage, setStage] = useState<"countdown" | "playing" | "done">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const tickRef = useRef<number | null>(null);

  // Countdown 3-2-1-GO
  useEffect(() => {
    if (stage !== "countdown") return;
    if (countdown <= 0) { setStage("playing"); return; }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => window.clearTimeout(id);
  }, [stage, countdown]);

  // Game timer
  useEffect(() => {
    if (stage !== "playing") return;
    tickRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setStage("done");
          if (tickRef.current) window.clearInterval(tickRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [stage]);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = deck[idx];
    if (i === q.correctIdx) setScore((s) => s + 1);
    else setTimeLeft((t) => Math.max(0, t - WRONG_PENALTY));
    // Quick advance — 220ms reveal then next.
    window.setTimeout(() => {
      if (idx + 1 >= deck.length) setStage("done");
      else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 220);
  }

  if (stage === "countdown") {
    return (
      <div className="wb-play-stage wb-play-countdown">
        <button type="button" className="wb-play-exit wb-play-exit-corner" onClick={onExit} aria-label={t.exit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="wb-play-countdown-eyebrow">{t.speedReady}</div>
        <div className="wb-play-countdown-num" key={countdown}>
          {countdown > 0 ? countdown : t.speedGo}
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <GameResult
        data={{
          title: t.speedTitle,
          score,
          total: 0, // no denominator, count is the metric
          headline: t.speedSeconds(score),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  const q = deck[idx];
  return (
    <div className="wb-play-stage">
      <PlayHeader title={t.speedTitle} timeLeft={timeLeft} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">
          {q.promptKind === "word" ? t.quizPromptWord : t.quizPromptMeaning}
        </div>
        <div className={`wb-play-prompt wb-play-prompt-${q.promptKind}`} lang={lang}>
          {q.prompt}
        </div>
      </div>
      <div className="wb-play-options">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIdx;
          const isPicked = i === picked;
          let cls = "wb-play-option";
          if (picked !== null) {
            if (isCorrect) cls += " is-correct";
            else if (isPicked) cls += " is-wrong";
            else cls += " is-dimmed";
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => pick(i)}
              disabled={picked !== null}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
