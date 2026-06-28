"use client";

/**
 * GameWordPassport — guess the origin language of an English word.
 *
 * Shows a word ("ketchup") and 4 candidate origin languages with their
 * flags. Pick the right one. The reveal is a one-line origin story —
 * often genuinely surprising.
 *
 * Reuses PlayHeader + GameResult. Curated content, not notebook-driven.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle } from "@/lib/play-engine";
import {
  pickWordPassportRounds,
  LANG_LABEL,
  type OriginCountry,
  type WordPassportRound,
} from "@/lib/play-content/word-passport";

type RuntimeRound = {
  word: string;
  displayed: [OriginCountry, OriginCountry, OriginCountry, OriginCountry];
  correctIdx: 0 | 1 | 2 | 3;
  story: string;
};

function buildRuntimeRounds(): RuntimeRound[] {
  return pickWordPassportRounds(SESSION_SIZE.passport).map((r): RuntimeRound => {
    const correctCountry = r.options[r.correctIdx];
    const order = shuffle(r.options.slice()) as OriginCountry[];
    const [a, b, c, d] = order;
    const displayed: [OriginCountry, OriginCountry, OriginCountry, OriginCountry] = [a, b, c, d];
    return {
      word: r.word,
      displayed,
      correctIdx: displayed.indexOf(correctCountry) as 0 | 1 | 2 | 3,
      story: r.story,
    };
  });
}

export function GameWordPassport({
  onExit,
  lang,
  t,
}: {
  onExit: () => void;
  lang: string;
  t: PlayT;
}) {
  const rounds = useMemo(buildRuntimeRounds, []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<RuntimeRound[]>([]);
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
      setMissed((m) => [...m, r]);
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
      title: t.passportTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.word,
        meaning: `${LANG_LABEL[r.displayed[r.correctIdx]]} — ${r.story}`,
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
        title={t.passportTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.passportPrompt}</div>
        <div className="wb-play-prompt wb-play-prompt-word" lang="en" dir="ltr">
          {r.word}
        </div>
      </div>
      <div className="wb-play-options wb-play-options-passport">
        {r.displayed.map((country, i) => {
          const isCorrect = i === r.correctIdx;
          const isPicked = i === picked;
          let cls = "wb-play-option wb-play-option-flag";
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
              <img
                className="wb-play-option-flagimg"
                src={`https://flagcdn.com/64x48/${country}.png`}
                srcSet={`https://flagcdn.com/128x96/${country}.png 2x`}
                alt=""
                loading="lazy"
                width="32"
                height="24"
              />
              <span lang="en" dir="ltr">{LANG_LABEL[country]}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="wb-play-explain" lang="en" dir="ltr">
          {r.story}
        </div>
      )}
    </div>
  );
}
