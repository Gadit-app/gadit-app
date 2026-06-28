"use client";

/**
 * GameEtymologyArtist — literal-root-translation → modern word game.
 *
 * Shows the literal English translation of an ancient root ("river
 * horse", "star sailor", "lion's tooth"). Player picks which modern
 * word came from that root.
 *
 * Text-only V1 — V2 will add AI-generated images of the literal scene
 * which is the whole magic of the original concept. For now the
 * surprise of "wait, hippopotamus literally means river horse?" already
 * does most of the work.
 *
 * Reuses PlayHeader + GameResult.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickEtymologyArtistRounds,
  type EtymologyArtistRound,
} from "@/lib/play-content/etymology-artist";

type RuntimeRound = {
  literal: string;
  origin: string;
  displayed: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickEtymologyArtistRounds(SESSION_SIZE.artist, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctWord = r.options[r.correctIdx];
      const order = shuffle(r.options.slice()) as string[];
      const [a, b, c, d] = order;
      const displayed: [string, string, string, string] = [a, b, c, d];
      return {
        literal: r.literal,
        origin: r.origin,
        displayed,
        correctIdx: displayed.indexOf(correctWord) as 0 | 1 | 2 | 3,
        story: r.story,
      };
    }),
  };
}

export function GameEtymologyArtist({
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
  const [missed, setMissed] = useState<EtymologyArtistRound[]>([]);
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
          literal: r.literal,
          origin: r.origin,
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
      title: t.artistTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.options[r.correctIdx],
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
        title={t.artistTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.artistPrompt}</div>
        <div className="wb-play-artist-origin">{r.origin}</div>
        <div className="wb-play-artist-literal" lang={contentLang} dir={contentDir}>
          &ldquo;{r.literal}&rdquo;
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
