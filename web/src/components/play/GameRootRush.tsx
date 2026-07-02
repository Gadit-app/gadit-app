"use client";

/**
 * GameRootRush — multi-select etymology game.
 *
 * Each round shows a Latin/Greek root + its meaning at top. Below, 6
 * word tiles in a 3x2 grid: 3 share the root, 3 are visual lookalikes
 * from different roots. Player taps the 3 that belong.
 *
 * Mechanic: tap a tile → if correct, it locks green; if wrong, it
 * shakes and reverts. Round completes when 3 correct are found OR
 * the player has used 5 taps (cap on mistakes).
 *
 * Curated content, not notebook-driven. Heavier UX than the single-pick
 * games — feels more like a puzzle and rewards confident knowledge.
 */

import { useState, useEffect, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import {
  pickRootRushRounds,
  type RootRushRound,
} from "@/lib/play-content/root-rush";

type Tile = {
  word: string;
  /** True if this tile belongs to the root family. */
  isCorrect: boolean;
};

type RuntimeRound = {
  root: string;
  origin: string;
  meaning: string;
  tiles: Tile[];
  story: string;
};

function buildRuntimeRounds(uiLang: string): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickRootRushRounds(SESSION_SIZE.root, uiLang);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctTiles: Tile[] = r.correct.map((w) => ({ word: w, isCorrect: true }));
      const distractorTiles: Tile[] = r.distractors.map((w) => ({ word: w, isCorrect: false }));
      return {
        root: r.root,
        origin: r.origin,
        meaning: r.meaning,
        tiles: shuffle([...correctTiles, ...distractorTiles]),
        story: r.story,
      };
    }),
  };
}

/** Soft cap on taps per round. Stops a player from spamming all 6
 *  tiles to find the answer. After 5 taps the round auto-advances. */
const MAX_TAPS_PER_ROUND = 5;

export function GameRootRush({
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
  /** Indices of tiles tapped this round. Each entry: correct or wrong. */
  const [taps, setTaps] = useState<Array<{ tileIdx: number; correct: boolean }>>([]);
  /** Total score across rounds. +1 per correctly identified tile. */
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<RuntimeRound[]>([]);
  const [done, setDone] = useState(false);
  /** True once we've recorded the round outcome into missed[] — one-shot. */
  const [scored, setScored] = useState(false);

  const r = rounds[idx];
  const correctTapsSoFar = taps.filter((tap) => tap.correct).length;
  const roundOver = correctTapsSoFar >= 3 || taps.length >= MAX_TAPS_PER_ROUND;

  // Record the round's outcome once, when the round ends. No auto-advance —
  // player taps Next when ready.
  useEffect(() => {
    if (!roundOver || done || scored) return;
    if (correctTapsSoFar < 3) {
      setMissed((m) => [...m, r]);
    }
    setScored(true);
  }, [roundOver, correctTapsSoFar, r, done, scored]);

  function advance() {
    if (idx + 1 >= rounds.length) {
      setDone(true);
    } else {
      setIdx((n) => n + 1);
      setTaps([]);
      setScored(false);
    }
  }

  function tap(tileIdx: number) {
    if (roundOver) return;
    // Don't allow re-tapping the same tile.
    if (taps.some((t) => t.tileIdx === tileIdx)) return;
    const tile = r.tiles[tileIdx];
    setTaps((prev) => [...prev, { tileIdx, correct: tile.isCorrect }]);
    if (tile.isCorrect) {
      setScore((s) => s + 1);
    }
  }

  if (done) {
    const data: GameResultData = {
      title: t.rootTitle,
      score,
      total: rounds.length * 3,
      missed: missed.map((rr) => ({
        word: rr.root,
        meaning: rr.story,
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

  function tileClass(tileIdx: number): string {
    const tap = taps.find((t) => t.tileIdx === tileIdx);
    if (!tap) {
      if (roundOver) {
        // Reveal phase: show all correct tiles in green so the player
        // sees what they missed before auto-advance.
        return r.tiles[tileIdx].isCorrect
          ? "wb-play-root-tile is-correct-reveal"
          : "wb-play-root-tile is-dimmed";
      }
      return "wb-play-root-tile";
    }
    return tap.correct
      ? "wb-play-root-tile is-correct"
      : "wb-play-root-tile is-wrong";
  }

  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.rootTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question wb-play-question-root">
        <div className="wb-play-question-eyebrow">{t.rootPrompt}</div>
        <div className="wb-play-root-card">
          <div className="wb-play-root-glyph" lang={contentLang} dir={contentDir}>{r.root}</div>
          <div className="wb-play-root-origin">{r.origin}</div>
          <div className="wb-play-root-meaning" lang={contentLang} dir={contentDir}>
            &ldquo;{r.meaning}&rdquo;
          </div>
        </div>
        <div className="wb-play-root-progress">
          {t.rootProgress(correctTapsSoFar)}
        </div>
      </div>
      <div className="wb-play-root-grid">
        {r.tiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            className={tileClass(i)}
            onClick={() => tap(i)}
            disabled={roundOver || taps.some((t) => t.tileIdx === i)}
            lang={contentLang}
            dir={contentDir}
          >
            {tile.word}
          </button>
        ))}
      </div>
      {roundOver && (
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
