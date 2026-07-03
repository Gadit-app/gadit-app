"use client";

/**
 * GameMemory — classic memory: flip cards, match word↔meaning pairs.
 *
 * 4 pairs = 8 cards. Two flipped at a time. Matched pairs stay revealed
 * with a green tint; mismatched flip back after ~700ms. Counts moves
 * (every 2-card flip = 1 move) and finishes when all matched.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import type { PlayWord, MemoryCard } from "@/lib/play-engine";
import { buildMemoryDeck, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";

export function GameMemory({
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
  const deck = useMemo(
    () => buildMemoryDeck(pool, SESSION_SIZE.memory),
    [pool],
  );
  // Derive the pair count from the actual deck: buildMemoryDeck dedups
  // duplicate words/meanings, so it can legitimately return fewer than
  // SESSION_SIZE.memory pairs. Comparing against the constant would
  // leave the done screen unreachable. QA 2026-07-03.
  const totalPairs = deck.length / 2;
  // ids of cards currently face up but not yet matched
  const [flipped, setFlipped] = useState<string[]>([]);
  // pairKeys that have been matched (stay face up)
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);

  // Completion watcher — a plain effect on matched.length instead of a
  // setTimeout inside the setMatched updater. Updater functions must
  // stay pure (StrictMode replays them); effects are the sanctioned
  // place for side effects. QA 2026-07-03.
  useEffect(() => {
    if (done || totalPairs === 0) return;
    if (matched.length !== totalPairs) return;
    const id = window.setTimeout(() => setDone(true), 600);
    return () => window.clearTimeout(id);
  }, [matched.length, totalPairs, done]);

  function tryFlip(card: MemoryCard) {
    if (lockRef.current) return;
    if (flipped.includes(card.id)) return;
    if (matched.includes(card.pairKey)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [aId, bId] = next;
      const a = deck.find((c) => c.id === aId)!;
      const b = deck.find((c) => c.id === bId)!;
      if (a.pairKey === b.pairKey) {
        setMatched((m) => [...m, a.pairKey]);
        setFlipped([]);
      } else {
        // Give the user enough time to actually read both cards before
        // they close — 800ms felt rushed in the beta. ~1.4s for two
        // short labels is the standard for this kind of memory game.
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 1400);
      }
    }
  }

  if (done) {
    // For memory the "score" is just moves, lower is better.
    // We pass score=pairs and headline=moves-info for clarity.
    return (
      <GameResult
        data={{
          title: t.memoryTitle,
          score: totalPairs,
          total: totalPairs,
          headline: t.memoryMoves(moves),
        }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  return (
    <div className="wb-play-stage">
      <PlayHeader title={t.memoryTitle} progress={`${matched.length}/${totalPairs}`} score={moves} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.memoryFlipPrompt}</div>
      </div>
      <div className="wb-play-memory-grid">
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.pairKey);
          const open = isFlipped || isMatched;
          return (
            <button
              key={card.id}
              type="button"
              className={`wb-play-memcard ${open ? "is-open" : ""} ${isMatched ? "is-matched" : ""} wb-play-memcard-${card.kind}`}
              onClick={() => tryFlip(card)}
              disabled={isMatched}
            >
              <span className="wb-play-memcard-back" aria-hidden={open}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6.5C4 5.7 4.7 5 5.5 5H10v14H5.5C4.7 19 4 18.3 4 17.5V6.5Z" />
                  <path d="M20 6.5C20 5.7 19.3 5 18.5 5H14v14h4.5C19.3 19 20 18.3 20 17.5V6.5Z" />
                </svg>
              </span>
              <span className="wb-play-memcard-face" aria-hidden={!open}>
                <span className="wb-play-memcard-facetext" dir="auto">{card.text}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
