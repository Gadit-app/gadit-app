"use client";

/**
 * GameBuildAWord — morphology assembly game.
 *
 * Shown a clue ("not able to be broken"), the player taps morpheme
 * tiles from a pool to build the target word. The tiles snap into the
 * next empty slot. Tap a placed tile to send it back to the pool.
 *
 * The pool has more tiles than needed — including visible-similar
 * morphemes (un- vs in-, -able vs -ible). The player must pick the
 * right ones, in the right order.
 *
 * Auto-validates when all correct-length slots are filled. Curated
 * content; no notebook dependency.
 */

import { useState, useEffect, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickBuildAWordRounds,
  type BuildAWordRound,
} from "@/lib/play-content/build-a-word";

type RuntimeRound = {
  target: string;
  clue: string;
  correct: string[];
  pool: string[];
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickBuildAWordRounds(SESSION_SIZE.build, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => ({
      target: r.target,
      clue: r.clue,
      correct: r.correct,
      pool: shuffle(r.pool.slice()),
      story: r.story,
    })),
  };
}

export function GameBuildAWord({
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
  /** Morphemes the player has placed in order. */
  const [placed, setPlaced] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<RuntimeRound[]>([]);
  const [done, setDone] = useState(false);
  /** True once we lock the build and reveal correctness. */
  const [revealed, setRevealed] = useState(false);

  const r = rounds[idx];
  const slotCount = r.correct.length;

  // Auto-validate when player has placed exactly the right number of tiles.
  // No auto-advance — player taps Next when ready.
  useEffect(() => {
    if (placed.length !== slotCount || revealed) return;
    setRevealed(true);
    const isCorrect = placed.join("") === r.correct.join("");
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setMissed((m) => [...m, r]);
    }
  }, [placed, revealed, r, slotCount]);

  function advance() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setPlaced([]);
      setRevealed(false);
    }
  }

  function takeFromPool(morpheme: string) {
    if (revealed) return;
    if (placed.includes(morpheme)) return;
    if (placed.length >= slotCount) return;
    setPlaced((prev) => [...prev, morpheme]);
  }

  function returnToPool(slot: number) {
    if (revealed) return;
    setPlaced((prev) => prev.filter((_, i) => i !== slot));
  }

  if (done) {
    const data: GameResultData = {
      title: t.buildTitle,
      score,
      total: rounds.length,
      missed: missed.map((rr) => ({
        word: rr.target,
        meaning: rr.correct.join(" + ") + ". " + rr.story,
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

  const builtWord = placed.join("");
  const isCorrect = revealed && builtWord === r.correct.join("");

  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.buildTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question wb-play-question-build">
        <div className="wb-play-question-eyebrow">{t.buildPrompt}</div>
        <div className="wb-play-build-clue" lang={contentLang} dir={contentDir}>
          &ldquo;{r.clue}&rdquo;
        </div>
      </div>
      {/* Slot row */}
      <div className="wb-play-build-slots">
        {Array.from({ length: slotCount }).map((_, slot) => {
          const morpheme = placed[slot];
          if (!morpheme) {
            return (
              <div key={slot} className="wb-play-build-slot is-empty">
                <span className="wb-play-build-slot-placeholder">_</span>
              </div>
            );
          }
          let cls = "wb-play-build-slot is-filled";
          if (revealed) {
            cls += isCorrect ? " is-correct" : " is-wrong";
          }
          return (
            <button
              key={slot}
              type="button"
              className={cls}
              onClick={() => returnToPool(slot)}
              disabled={revealed}
              lang={contentLang}
              dir={contentDir}
            >
              {morpheme}
              {slot < slotCount - 1 && (
                <span className="wb-play-build-plus" aria-hidden="true">+</span>
              )}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={`wb-play-build-result ${isCorrect ? "is-correct" : "is-wrong"}`} lang={contentLang} dir={contentDir}>
          {builtWord === r.target ? r.target : `${builtWord} ≠ ${r.target}`}
        </div>
      )}
      {/* Morpheme pool */}
      <div className="wb-play-build-pool">
        {r.pool.map((morpheme) => {
          const isUsed = placed.includes(morpheme);
          let cls = "wb-play-build-tile";
          if (isUsed) cls += " is-used";
          return (
            <button
              key={morpheme}
              type="button"
              className={cls}
              onClick={() => takeFromPool(morpheme)}
              disabled={isUsed || revealed}
              lang={contentLang}
              dir={contentDir}
            >
              {morpheme}
            </button>
          );
        })}
      </div>
      {revealed && (
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
