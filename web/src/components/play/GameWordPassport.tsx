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

import { useState, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickWordPassportRounds,
  getLangLabel,
  type OriginCountry,
} from "@/lib/play-content/word-passport";

type RuntimeRound = {
  word: string;
  displayed: [OriginCountry, OriginCountry, OriginCountry, OriginCountry];
  correctIdx: 0 | 1 | 2 | 3;
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickWordPassportRounds(SESSION_SIZE.passport, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
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
    }),
  };
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
  const built = useMemo(() => buildRuntimeRounds(lang), [lang]);
  const rounds = built.rounds;
  const contentLang = built.contentLang;
  const contentDir = dirForLang(contentLang);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<RuntimeRound[]>([]);
  const [done, setDone] = useState(false);

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    const r = rounds[idx];
    if (i === r.correctIdx) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [...m, r]);
    }
  }

  function advance() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPicked(null);
    }
  }

  if (done) {
    const data: GameResultData = {
      title: t.passportTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.word,
        meaning: `${getLangLabel(r.displayed[r.correctIdx], contentLang)} — ${r.story}`,
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
  // Defensive: never render off an undefined round. QA 2026-07-03.
  if (!r) return null;
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
        <div className="wb-play-prompt wb-play-prompt-word" lang={contentLang} dir={contentDir}>
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
              <span lang={contentLang} dir={contentDir}>{getLangLabel(country, contentLang)}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <>
          <div className="wb-play-explain" lang={contentLang} dir={contentDir}>
            {r.story}
          </div>
          <button type="button" className="wb-play-next" onClick={advance}>
            {idx + 1 >= rounds.length ? t.playFinish : t.playNext}
          </button>
        </>
      )}
    </div>
  );
}
