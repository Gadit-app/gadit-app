"use client";

/**
 * GameShadeSlider — synonym intensity ordering game.
 *
 * Five synonyms are shown scrambled. Player taps them in order from
 * MILDEST to MOST INTENSE. Each tap appends to a ladder being built.
 * Tap a placed card to take it back.
 *
 * Auto-checks when 5 are placed. Each correct position scores 1.
 * The reveal shows the canonical ordering with mistakes highlighted.
 *
 * Custom UX rather than the multi-choice shell because ordering is
 * a fundamentally different mechanic. Curated content.
 */

import { useState, useEffect, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickShadeSliderRounds,
  type ShadeSliderRound,
} from "@/lib/play-content/shade-slider";

type RuntimeRound = {
  axis: string;
  /** Canonical ordering, mildest → strongest. */
  canonical: [string, string, string, string, string];
  /** Display order (scrambled). The player picks from this pool. */
  pool: string[];
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickShadeSliderRounds(SESSION_SIZE.shade, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      let pool = shuffle(r.ladder.slice());
      let attempts = 0;
      while (pool.join("|") === r.ladder.join("|") && attempts < 5) {
        pool = shuffle(r.ladder.slice());
        attempts++;
      }
      return {
        axis: r.axis,
        canonical: r.ladder,
        pool,
        story: r.story,
      };
    }),
  };
}

export function GameShadeSlider({
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
  /** Order the player has placed so far, mildest → strongest. */
  const [placed, setPlaced] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<RuntimeRound[]>([]);
  const [done, setDone] = useState(false);
  /** True after 5 cards placed — we lock the board and reveal. */
  const [revealed, setRevealed] = useState(false);

  const r = rounds[idx];

  // When the board fills (5 placed), lock the board and score.
  // Player taps Next when ready to move on.
  useEffect(() => {
    if (placed.length !== 5 || revealed) return;
    setRevealed(true);
    let roundScore = 0;
    placed.forEach((w, i) => {
      if (w === r.canonical[i]) roundScore++;
    });
    setScore((s) => s + roundScore);
    if (roundScore < 3) {
      setMissed((m) => [...m, r]);
    }
  }, [placed, revealed, r]);

  function advance() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPlaced([]);
      setRevealed(false);
    }
  }

  function takeFromPool(word: string) {
    if (revealed) return;
    if (placed.includes(word)) return;
    setPlaced((prev) => [...prev, word]);
  }

  function returnToPool(word: string) {
    if (revealed) return;
    setPlaced((prev) => prev.filter((w) => w !== word));
  }

  if (done) {
    const data: GameResultData = {
      title: t.shadeTitle,
      score,
      total: rounds.length * 5,
      missed: missed.map((rr) => ({
        word: rr.axis,
        meaning: rr.canonical.join(" → ") + ". " + rr.story,
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

  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.shadeTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question wb-play-question-shade">
        <div className="wb-play-question-eyebrow">{t.shadePrompt}</div>
        <div className="wb-play-shade-axis" lang={contentLang} dir={contentDir}>
          {r.axis}
        </div>
        <div className="wb-play-shade-axis-labels">
          <span>{t.shadeMild}</span>
          <span className="wb-play-shade-arrow" aria-hidden="true">→</span>
          <span>{t.shadeStrong}</span>
        </div>
      </div>
      {/* Ladder being built */}
      <ol className="wb-play-shade-ladder">
        {[0, 1, 2, 3, 4].map((slot) => {
          const word = placed[slot];
          if (!word) {
            return (
              <li key={slot} className="wb-play-shade-slot is-empty">
                <span className="wb-play-shade-slot-num">{slot + 1}</span>
              </li>
            );
          }
          const isCorrect = revealed && word === r.canonical[slot];
          const isWrong = revealed && word !== r.canonical[slot];
          let cls = "wb-play-shade-slot is-filled";
          if (isCorrect) cls += " is-correct";
          if (isWrong) cls += " is-wrong";
          return (
            <li key={slot} className={cls}>
              <span className="wb-play-shade-slot-num">{slot + 1}</span>
              <button
                type="button"
                className="wb-play-shade-slot-word"
                onClick={() => returnToPool(word)}
                disabled={revealed}
                lang={contentLang}
                dir={contentDir}
              >
                {word}
              </button>
            </li>
          );
        })}
      </ol>
      {/* Card pool */}
      <div className="wb-play-shade-pool">
        {r.pool.map((word) => {
          const isUsed = placed.includes(word);
          let cls = "wb-play-shade-card";
          if (isUsed) cls += " is-used";
          return (
            <button
              key={word}
              type="button"
              className={cls}
              onClick={() => takeFromPool(word)}
              disabled={isUsed || revealed}
              lang={contentLang}
              dir={contentDir}
            >
              {word}
            </button>
          );
        })}
      </div>
      {revealed && (
        <>
          <div className="wb-play-shade-canonical" lang={contentLang} dir={contentDir}>
            <span className="wb-play-question-eyebrow">{t.shadeReveal}</span>
            <div className="wb-play-shade-canonical-row">
              {r.canonical.map((w, i) => (
                <span key={i} className="wb-play-shade-canonical-word">
                  {w}
                  {i < 4 && <span className="wb-play-shade-canonical-sep">→</span>}
                </span>
              ))}
            </div>
          </div>
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
