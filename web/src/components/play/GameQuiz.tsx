"use client";

/**
 * GameQuiz — definition-match multiple choice.
 *
 * Each round shows either a word (pick its meaning) or a meaning (pick
 * its word). Mixed direction within one 5-question session so users
 * practice both recall and recognition.
 *
 * After each answer: ~900ms reveal (correct/wrong tinting) → auto-advance.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import type { PlayWord, QuizQuestion } from "@/lib/play-engine";
import { buildQuizQuestions, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import type { GameResultData } from "./GameResult";

export function GameQuiz({
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
  const questions = useMemo(
    () => buildQuizQuestions(pool, SESSION_SIZE.quiz),
    [pool],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<QuizQuestion[]>([]);
  const [done, setDone] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    if (i === q.correctIdx) setScore((s) => s + 1);
    else setMissed((m) => [...m, q]);
    advanceTimer.current = window.setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 900);
  }

  if (done) {
    const data: GameResultData = {
      title: t.quizTitle,
      score,
      total: questions.length,
      missed: missed.map((q) => ({ word: q.word.word, meaning: q.word.meaning })),
    };
    return <GameResult data={data} onExit={onExit} onReplay={() => location.reload()} lang={lang} t={t} />;
  }

  const q = questions[idx];
  return (
    <div className="wb-play-stage">
      <PlayHeader title={t.quizTitle} progress={`${idx + 1}/${questions.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">
          {q.promptKind === "word" ? t.quizPromptWord : t.quizPromptMeaning}
        </div>
        <div className={`wb-play-prompt wb-play-prompt-${q.promptKind}`} lang={q.promptKind === "word" ? undefined : lang}>
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

// ─── Shared little header ──────────────────────────────────────
export function PlayHeader({
  title,
  progress,
  score,
  timeLeft,
  onExit,
  t,
}: {
  title: string;
  progress?: string;
  score?: number;
  timeLeft?: number;
  onExit: () => void;
  t: PlayT;
}) {
  return (
    <div className="wb-play-header">
      <button type="button" className="wb-play-exit" onClick={onExit} aria-label={t.exit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="wb-play-header-title">{title}</div>
      <div className="wb-play-header-meta">
        {progress && <span className="wb-play-progress">{progress}</span>}
        {typeof timeLeft === "number" && (
          <span className={`wb-play-timer ${timeLeft <= 10 ? "is-urgent" : ""}`}>
            {timeLeft}s
          </span>
        )}
        {typeof score === "number" && <span className="wb-play-score">{score}</span>}
      </div>
    </div>
  );
}

// Inline type — also used by sibling games. Defined here once and imported
// where needed. Avoids a separate copy file just for a strings interface.
export type PlayT = {
  // Menu
  menuTitle: string;
  menuLede: string;
  streakOne: string;
  streakMany: (n: number) => string;
  bestEver: (n: number) => string;
  notEnoughWords: string;
  notEnoughHint: string;
  goNotebook: string;
  comingSoon: string;
  // Game names
  quizTitle: string;
  quizDesc: string;
  fillblankTitle: string;
  fillblankDesc: string;
  memoryTitle: string;
  memoryDesc: string;
  anagramTitle: string;
  anagramDesc: string;
  speedTitle: string;
  speedDesc: string;
  twinTitle: string;
  twinDesc: string;
  twinPrompt: string;
  timeTitle: string;
  timeDesc: string;
  timePrompt: string;
  passportTitle: string;
  passportDesc: string;
  passportPrompt: string;
  friendsTitle: string;
  friendsDesc: string;
  friendsPrompt: string;
  friendsTrue: string;
  friendsFalse: string;
  rootTitle: string;
  rootDesc: string;
  rootPrompt: string;
  rootProgress: (found: number) => string;
  shadeTitle: string;
  shadeDesc: string;
  shadePrompt: string;
  shadeMild: string;
  shadeStrong: string;
  shadeReveal: string;
  buildTitle: string;
  buildDesc: string;
  buildPrompt: string;
  idiomTitle: string;
  idiomDesc: string;
  idiomPrompt: string;
  lensTitle: string;
  lensDesc: string;
  lensPrompt: string;
  artistTitle: string;
  artistDesc: string;
  artistPrompt: string;
  // Game UI
  exit: string;
  quizPromptWord: string;
  quizPromptMeaning: string;
  fillblankPrompt: string;
  anagramPrompt: string;
  anagramHint: string;
  anagramSubmit: string;
  anagramReset: string;
  speedReady: string;
  speedGo: string;
  speedSeconds: (n: number) => string;
  memoryFlipPrompt: string;
  memoryMoves: (n: number) => string;
  // Result
  resultPerfect: string;
  resultGreat: string;
  resultGood: string;
  resultKeepGoing: string;
  resultYouMissed: string;
  resultPlayAgain: string;
  resultBackToGames: string;
  resultFinalScore: (s: number) => string;
};
