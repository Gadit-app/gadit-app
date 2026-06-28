"use client";

/**
 * GameMeaningLens — polysemy disambiguation game.
 *
 * Shows a polysemous word in a specific sentence. Player picks which
 * of 4 meanings the sentence is using. Same word, four senses, one is
 * correct here.
 *
 * Standard multi-choice, reuses PlayHeader + GameResult.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickMeaningLensRounds,
  type MeaningLensRound,
} from "@/lib/play-content/meaning-lens";

type RuntimeRound = {
  word: string;
  sentence: string;
  displayed: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickMeaningLensRounds(SESSION_SIZE.lens, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctOption = r.options[r.correctIdx];
      const order = shuffle(r.options.slice()) as string[];
      const [a, b, c, d] = order;
      const displayed: [string, string, string, string] = [a, b, c, d];
      return {
        word: r.word,
        sentence: r.sentence,
        displayed,
        correctIdx: displayed.indexOf(correctOption) as 0 | 1 | 2 | 3,
        story: r.story,
      };
    }),
  };
}

export function GameMeaningLens({
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
  const [missed, setMissed] = useState<MeaningLensRound[]>([]);
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
          word: r.word,
          sentence: r.sentence,
          options: [r.displayed[0], r.displayed[1], r.displayed[2], r.displayed[3]],
          correctIdx: r.correctIdx,
          story: r.story,
        },
      ]);
    }
    advanceTimer.current = window.setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        setDone(true);
      } else {
        setIdx((n) => n + 1);
        setPicked(null);
      }
    }, 2300);
  }

  if (done) {
    const data: GameResultData = {
      title: t.lensTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.word,
        meaning: r.story,
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
  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.lensTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.lensPrompt}</div>
        <div className="wb-play-lens-word" lang={contentLang} dir={contentDir}>
          {r.word}
        </div>
        <div className="wb-play-lens-sentence" lang={contentLang} dir={contentDir}>
          {r.sentence}
        </div>
      </div>
      <div className="wb-play-options">
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
          {r.story}
        </div>
      )}
    </div>
  );
}
