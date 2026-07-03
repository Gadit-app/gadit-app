"use client";

/**
 * GameFillBlank — pick the word that completes an example sentence.
 *
 * Uses real example sentences from the user's IDB cache (so this game
 * is only available when at least 4 notebook entries have hydrated
 * examples). The word is blanked out with ____ and the user picks from
 * 4 word options.
 */

import { useState, useMemo } from "react";
import type { PlayWord, FillBlankQuestion } from "@/lib/play-engine";
import { buildFillBlankQuestions, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";

export function GameFillBlank({
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
    () => buildFillBlankQuestions(pool, SESSION_SIZE.fillblank),
    [pool],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<FillBlankQuestion[]>([]);
  const [done, setDone] = useState(false);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    if (i === q.correctIdx) setScore((s) => s + 1);
    else setMissed((m) => [...m, q]);
  }

  function advance() {
    if (idx + 1 >= questions.length) setDone(true);
    else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  }

  if (done) {
    return (
      <GameResult
        data={{
          title: t.fillblankTitle,
          score,
          total: questions.length,
          missed: missed.map((q) => ({ word: q.word.word, meaning: q.word.meaning })),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  const q = questions[idx];
  // Defensive: the builder drops incoherent rounds (sentence script ≠
  // word script, missing distractors) and can return fewer than asked.
  if (!q) return null;
  // Split the sentence so we can highlight the blank.
  const parts = q.sentence.split("____");
  return (
    <div className="wb-play-stage">
      <PlayHeader title={t.fillblankTitle} progress={`${idx + 1}/${questions.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.fillblankPrompt}</div>
        {/* dir=auto: the carrier sentence is in the WORD's language,
            which can differ from the UI language. */}
        <div className="wb-play-sentence" dir="auto">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className={`wb-play-blank ${picked !== null ? "is-revealed" : ""}`}>
                  {picked !== null ? q.word.word : ""}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div className="wb-play-options">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIdx;
          const isPicked = i === picked;
          let cls = "wb-play-option wb-play-option-compact";
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
              dir="auto"
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <button type="button" className="wb-play-next" onClick={advance}>
          {idx + 1 >= questions.length ? t.playFinish : t.playNext}
        </button>
      )}
    </div>
  );
}
