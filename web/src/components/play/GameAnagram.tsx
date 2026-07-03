"use client";

/**
 * GameAnagram — unscramble letters to form the word, given the meaning
 * as a hint.
 *
 * Letters are shown as tappable tiles in the scramble tray; tapping a
 * tile moves it to the answer slot. Tapping a tile in the answer slot
 * sends it back. Reset clears, Submit checks. Auto-checks when the
 * answer slot is full.
 */

import { useState, useEffect, useMemo } from "react";
import type { PlayWord, AnagramRound } from "@/lib/play-engine";
import { buildAnagramRounds, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";

type TileState = {
  letter: string;
  /** -1 means "in tray (not yet placed)"; ≥0 is the answer slot index. */
  slot: number;
  /** Stable id so React doesn't lose tile identity when reordering. */
  id: string;
};

export function GameAnagram({
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
  const rounds = useMemo(
    () => buildAnagramRounds(pool, SESSION_SIZE.anagram),
    [pool],
  );
  const [roundIdx, setRoundIdx] = useState(0);
  // Defensive: if buildAnagramRounds returned an empty pool (which the
  // menu's word-count gate should prevent, but Firestore can race with
  // navigation), seed with an empty tile list. Audit 2026-07-03.
  const [tiles, setTiles] = useState<TileState[]>(() =>
    rounds[0]
      ? rounds[0].scrambled.map((l, i) => ({ letter: l, slot: -1, id: `t-${i}` }))
      : [],
  );
  const [resultState, setResultState] = useState<"none" | "correct" | "wrong">("none");
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<AnagramRound[]>([]);
  const [done, setDone] = useState(false);

  // When we move to a new round, reseed tiles from the new scramble.
  useEffect(() => {
    if (roundIdx >= rounds.length) return;
    setTiles(
      rounds[roundIdx].scrambled.map((l, i) => ({ letter: l, slot: -1, id: `t-${roundIdx}-${i}` })),
    );
    setResultState("none");
  }, [roundIdx, rounds]);

  const word = rounds[roundIdx];
  const targetLen = word ? Array.from(word.word.word).length : 0;

  // Place a tray tile into the next open slot.
  function placeTile(tile: TileState) {
    if (resultState !== "none") return;
    if (tile.slot >= 0) return;
    const usedSlots = new Set(tiles.filter((t) => t.slot >= 0).map((t) => t.slot));
    let nextSlot = -1;
    for (let i = 0; i < targetLen; i++) {
      if (!usedSlots.has(i)) { nextSlot = i; break; }
    }
    if (nextSlot < 0) return;
    setTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, slot: nextSlot } : t)),
    );
  }

  // Pull a placed tile back to the tray.
  function unplaceTile(tile: TileState) {
    if (resultState !== "none") return;
    setTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, slot: -1 } : t)),
    );
  }

  // Auto-check when slot is full.
  useEffect(() => {
    if (resultState !== "none") return;
    if (!word) return;
    const placed = tiles.filter((t) => t.slot >= 0).sort((a, b) => a.slot - b.slot);
    if (placed.length !== targetLen) return;
    const guess = placed.map((t) => t.letter).join("");
    if (guess.toLowerCase() === word.word.word.toLowerCase()) {
      setResultState("correct");
      setScore((s) => s + 1);
    } else {
      setResultState("wrong");
      setMissed((m) => [...m, word]);
    }
  }, [tiles, word, targetLen, resultState]);

  function advance() {
    if (roundIdx + 1 >= rounds.length) setDone(true);
    else setRoundIdx((n) => n + 1);
  }

  function reset() {
    if (resultState !== "none") return;
    setTiles((prev) => prev.map((t) => ({ ...t, slot: -1 })));
  }

  if (done) {
    return (
      <GameResult
        data={{
          title: t.anagramTitle,
          score,
          total: rounds.length,
          missed: missed.map((q) => ({ word: q.word.word, meaning: q.word.meaning })),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  if (!word) return null;

  const slotsRow = Array.from({ length: targetLen }, (_, i) => {
    const tile = tiles.find((t) => t.slot === i);
    return { i, tile };
  });
  const tray = tiles.filter((t) => t.slot < 0);

  return (
    <div className="wb-play-stage">
      <PlayHeader title={t.anagramTitle} progress={`${roundIdx + 1}/${rounds.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.anagramPrompt}</div>
        <div className="wb-play-anagram-hint">
          <span className="wb-play-anagram-hint-label">{t.anagramHint}</span>
          <span className="wb-play-anagram-hint-text">{word.word.meaning}</span>
        </div>
      </div>
      <div className={`wb-play-anagram-slots is-${resultState}`}>
        {slotsRow.map(({ i, tile }) => (
          <button
            key={i}
            type="button"
            className={`wb-play-anagram-slot ${tile ? "is-filled" : ""}`}
            onClick={() => tile && unplaceTile(tile)}
            disabled={!tile || resultState !== "none"}
            aria-label={`Slot ${i + 1}`}
          >
            {tile?.letter ?? ""}
          </button>
        ))}
      </div>
      <div className="wb-play-anagram-tray">
        {tray.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className="wb-play-anagram-tile"
            onClick={() => placeTile(tile)}
            disabled={resultState !== "none"}
          >
            {tile.letter}
          </button>
        ))}
      </div>
      <button type="button" className="wb-play-anagram-reset" onClick={reset} disabled={resultState !== "none"}>
        {t.anagramReset}
      </button>
      {resultState !== "none" && (
        <button type="button" className="wb-play-next" onClick={advance}>
          {roundIdx + 1 >= rounds.length ? t.playFinish : t.playNext}
        </button>
      )}
    </div>
  );
}
