"use client";

/**
 * GameFalseFriends — binary cognate-or-trap game.
 *
 * Shows a foreign word + its language flag + an English "twin" it
 * looks like. Player picks TRUE (real cognate) or FALSE (trap). The
 * reveal tells the actual story.
 *
 * Mix is roughly 60/40 false-to-real so the game stays unpredictable.
 * Curated content, not notebook-driven.
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, dirForLang } from "@/lib/play-engine";
import {
  pickFalseFriendsRounds,
  type FalseFriendsRound,
} from "@/lib/play-content/false-friends";

export function GameFalseFriends({
  onExit,
  lang,
  t,
}: {
  onExit: () => void;
  lang: string;
  t: PlayT;
}) {
  const built = useMemo(
    () => pickFalseFriendsRounds(SESSION_SIZE.friends, lang),
    [lang],
  );
  const rounds = built.rounds;
  const contentLang = built.contentLang;
  const contentDir = dirForLang(contentLang);
  const [idx, setIdx] = useState(0);
  /** Picked: 0 = TRUE button, 1 = FALSE button, null = not yet. */
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<FalseFriendsRound[]>([]);
  const [done, setDone] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  function pick(buttonIdx: number) {
    if (picked !== null) return;
    setPicked(buttonIdx);
    const r = rounds[idx];
    // Button 0 = TRUE (real cognate). Button 1 = FALSE (trap).
    const userSaysReal = buttonIdx === 0;
    if (userSaysReal === r.isReal) {
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
    }, 2100);
  }

  if (done) {
    const data: GameResultData = {
      title: t.friendsTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: `${r.foreignWord} (${r.foreignLang})`,
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
  // Reveal styling: which button is "correct" depends on r.isReal.
  // Button 0 = TRUE → correct if isReal. Button 1 = FALSE → correct if !isReal.
  const correctButton = r.isReal ? 0 : 1;

  return (
    <div className="wb-play-stage">
      <PlayHeader
        title={t.friendsTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.friendsPrompt}</div>
        <div className="wb-play-friends-card">
          <div className="wb-play-friends-foreign">
            <img
              className="wb-play-friends-flag"
              src={`https://flagcdn.com/64x48/${r.foreignFlag}.png`}
              srcSet={`https://flagcdn.com/128x96/${r.foreignFlag}.png 2x`}
              alt=""
              loading="lazy"
              width="32"
              height="24"
            />
            <div className="wb-play-friends-foreign-text">
              {/* The foreign word is ALWAYS Latin-script (embarazada, Gift,
                  fabrik...) so we force LTR regardless of content lang. */}
              <div className="wb-play-friends-word" dir="ltr">{r.foreignWord}</div>
              <div className="wb-play-friends-lang">{r.foreignLang}</div>
            </div>
          </div>
          <div className="wb-play-friends-arrow" aria-hidden="true">≈</div>
          <div className="wb-play-friends-english" lang={contentLang} dir={contentDir}>
            {r.englishTwin}
          </div>
        </div>
      </div>
      <div className="wb-play-options wb-play-options-pair">
        {[0, 1].map((i) => {
          const isCorrect = i === correctButton;
          const isPicked = i === picked;
          let cls = "wb-play-option wb-play-option-binary";
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
              {i === 0 ? t.friendsTrue : t.friendsFalse}
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
