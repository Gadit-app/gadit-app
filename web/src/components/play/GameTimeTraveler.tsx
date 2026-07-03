"use client";

/**
 * GameTimeTraveler — etymology meaning-shift game.
 *
 * Each round shows what a word USED to mean (often surprising —
 * "nice" once meant "stupid") and three modern words. Player picks the
 * modern word whose meaning drifted from that older sense.
 *
 * The reveal is the whole point: each round ends with a tiny story
 * about how the meaning shifted over centuries. Curated content, not
 * notebook-driven. Always available.
 *
 * Reveal is held ~2200ms — even slower than Twin Trap because the
 * story line is longer and the "wait what?!" moment needs to land.
 */

import { useState, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickTimeTravelerRounds,
  type TimeTravelerRound,
} from "@/lib/play-content/time-traveler";

type RuntimeRound = {
  oldMeaning: string;
  era: string;
  displayed: [string, string, string];
  correctIdx: 0 | 1 | 2;
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickTimeTravelerRounds(SESSION_SIZE.time, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctWord = r.options[r.correctIdx];
      const [a, b, c] = shuffle(r.options.slice()) as [string, string, string];
      const displayed: [string, string, string] = [a, b, c];
      const correctIdx = displayed.indexOf(correctWord) as 0 | 1 | 2;
      return {
        oldMeaning: r.oldMeaning,
        era: r.era,
        displayed,
        correctIdx,
        story: r.story,
      };
    }),
  };
}

export function GameTimeTraveler({
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
      title: t.timeTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.displayed[r.correctIdx],
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
  // Defensive: never render off an undefined round. QA 2026-07-03.
  if (!r) return null;
  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.timeTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.timePrompt}</div>
        <div className="wb-play-era">{r.era}</div>
        <div className="wb-play-old-meaning" lang={contentLang} dir={contentDir}>
          &ldquo;{r.oldMeaning}&rdquo;
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
              lang={contentLang}
              dir={contentDir}
            >
              {opt}
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
