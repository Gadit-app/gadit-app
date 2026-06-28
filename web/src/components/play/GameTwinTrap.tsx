"use client";

/**
 * GameTwinTrap — confusable word pairs.
 *
 * Each round shows a sentence with a blank and two near-identical
 * options. Pick the right one; the reveal explains the difference.
 *
 * Curated content, not notebook-driven. Always available — no minimum
 * vocabulary needed.
 *
 * After each answer: ~1500ms reveal (the explain line is the whole point
 * of the game; users need a beat to read it) → auto-advance.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickTwinTrapRounds,
  type TwinTrapRound,
} from "@/lib/play-content/twin-trap";

type RuntimeRound = {
  sentence: string;
  /** Display order, randomised per round so the correct answer isn't
   *  always in the same slot. */
  displayed: [string, string];
  /** Which displayed slot (0 or 1) holds the correct option. */
  correctIdx: 0 | 1;
  explain: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickTwinTrapRounds(SESSION_SIZE.twin, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctWord = r.options[r.correctIdx];
      const wrongWord = r.options[r.correctIdx === 0 ? 1 : 0];
      const [a, b] = shuffle([correctWord, wrongWord]) as [string, string];
      return {
        sentence: r.sentence,
        displayed: [a, b],
        correctIdx: a === correctWord ? 0 : 1,
        explain: r.explain,
      };
    }),
  };
}

export function GameTwinTrap({
  onExit,
  lang,
  t,
}: {
  onExit: () => void;
  lang: string;
  t: PlayT;
}) {
  const built = useMemo(() => buildRuntimeRounds(lang), [lang]);
  const rounds = built.rounds;
  const contentLang = built.contentLang;
  const contentDir = dirForLang(contentLang);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<TwinTrapRound[]>([]);
  const [done, setDone] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const r = rounds[idx];
    if (i === r.correctIdx) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [
        ...m,
        {
          sentence: r.sentence,
          options: [r.displayed[0], r.displayed[1]],
          correctIdx: r.correctIdx,
          explain: r.explain,
        },
      ]);
    }
    // Longer reveal than Quiz (900ms) because the explanation line is
    // the load-bearing piece of the game — the whole point is the
    // tiny moment of clarity. Don't rush the reveal.
    advanceTimer.current = window.setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true);
      } else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 1700);
  }

  if (done) {
    const data: GameResultData = {
      title: t.twinTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.options[r.correctIdx],
        meaning: r.explain,
      })),
    };
    return (
      <GameResult
        data={data}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  const r = rounds[idx];
  // Sentence-with-blank, split around the ____ token so we can style
  // the blank as a visible underline rather than literal underscores.
  const parts = r.sentence.split("____");

  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.twinTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.twinPrompt}</div>
        <div
          className="wb-play-prompt wb-play-prompt-sentence"
          lang={contentLang}
          dir={contentDir}
        >
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="wb-play-blank" aria-label="blank" />
              )}
            </span>
          ))}
        </div>
      </div>
      <div className="wb-play-options wb-play-options-pair">
        {r.displayed.map((opt, i) => {
          const isCorrect = i === r.correctIdx;
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
              lang="en"
              dir="ltr"
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="wb-play-explain" lang={contentLang} dir={contentDir}>
          {r.explain}
        </div>
      )}
    </div>
  );
}
