"use client";

/**
 * GameResult — shared end-of-session screen for every game.
 *
 * Shows a big score badge with a tone-appropriate headline (perfect /
 * great / good / keep going), the list of words the user missed (so
 * they can review), and two CTAs: play again or back to the menu.
 *
 * Streak update happens on mount — completing ANY game counts toward
 * the daily streak, regardless of score.
 */

import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { recordPlay } from "@/lib/play-streak";
import { dirForLang } from "@/lib/play-engine";
import type { PlayT } from "./GameQuiz";

export type GameResultData = {
  title: string;
  score: number;
  total: number;
  /** Words the user got wrong, shown as a study list. Optional, some
   *  games (speed) skip it because there's no "wrong" per se. */
  missed?: Array<{ word: string; meaning: string }>;
  /** Custom headline override (Speed game uses this for "X words!"). */
  headline?: string;
};

export function GameResult({
  data,
  onExit,
  onReplay,
  lang,
  t,
}: {
  data: GameResultData;
  onExit: () => void;
  onReplay: () => void;
  lang: string;
  t: PlayT;
}) {
  const { user } = useAuth();
  useEffect(() => {
    recordPlay(user);
    // user is intentionally omitted from deps — we only want to record
    // once on mount; if auth pops in mid-result-screen we'd otherwise
    // double-record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = data.total > 0 ? data.score / data.total : 0;
  // Perfect score gets the BRAND headline — "Now you Gad it!" — in
  // Latin script in every UI language, with "Gad it" styled exactly
  // like the wordmark. It's a brand element like the logo, not a
  // translatable string: Gadi 2026-07-03 killed the Hebrew
  // transliteration ("GAD-ת את זה") as nonsensical. dir=ltr pins the
  // exclamation mark to the correct side on RTL pages.
  let headline: ReactNode = data.headline;
  if (!headline) {
    if (pct >= 1) {
      headline = (
        <span className="wb-play-result-gadit" dir="ltr" lang="en">
          Now you Gad&nbsp;<span className="wb-play-result-gadit-it">it</span>!
        </span>
      );
    } else if (pct >= 0.8) headline = t.resultGreat;
    else if (pct >= 0.5) headline = t.resultGood;
    else headline = t.resultKeepGoing;
  }

  return (
    <div className="wb-play-stage wb-play-result" lang={lang} dir={dirForLang(lang)}>
      <div className="wb-play-result-headline">{headline}</div>
      <div className="wb-play-result-score">
        <span className="wb-play-result-score-num">{data.score}</span>
        {data.total > 0 && (
          <span className="wb-play-result-score-denom">/{data.total}</span>
        )}
      </div>
      <div className="wb-play-result-sub">{data.title}</div>

      {data.missed && data.missed.length > 0 && (
        <div className="wb-play-result-missed">
          <div className="wb-play-result-missed-label">{t.resultYouMissed}</div>
          <ul className="wb-play-result-missed-list">
            {data.missed.map((m, i) => (
              <li key={i}>
                <span className="wb-play-result-missed-word">{m.word}</span>
                <span className="wb-play-result-missed-sep">·</span>
                <span className="wb-play-result-missed-mean">{m.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="wb-play-result-actions">
        <button type="button" className="wb-play-cta-primary" onClick={onReplay}>
          {t.resultPlayAgain}
        </button>
        <button type="button" className="wb-play-cta-ghost" onClick={onExit}>
          {t.resultBackToGames}
        </button>
      </div>
    </div>
  );
}
