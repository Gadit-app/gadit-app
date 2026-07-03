"use client";

/**
 * GameIdiomDecoder — literal-vs-figurative idiom game.
 *
 * Shows the literal interpretation of an idiom as a short description
 * (V2 will swap this for an AI image of the literal scene). Player
 * picks the actual figurative meaning from 4 options.
 *
 * Reuses PlayHeader + GameResult. Curated content.
 */

import { useState, useMemo } from "react";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { GameResult, type GameResultData } from "./GameResult";
import { SESSION_SIZE, shuffle, dirForLang } from "@/lib/play-engine";
import { readKidsMode } from "@/lib/use-kids-mode";
import {
  pickIdiomDecoderRounds,
  type IdiomDecoderRound,
} from "@/lib/play-content/idiom-decoder";

type RuntimeRound = {
  idiom: string;
  literal: string;
  displayed: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;
  story: string;
};

function buildRuntimeRounds(uiLang: string, kids: boolean): { rounds: RuntimeRound[]; contentLang: string } {
  const { rounds: source, contentLang } = pickIdiomDecoderRounds(SESSION_SIZE.idiom, uiLang, kids);
  return {
    contentLang,
    rounds: source.map((r): RuntimeRound => {
      const correctOption = r.options[r.correctIdx];
      const order = shuffle(r.options.slice()) as string[];
      const [a, b, c, d] = order;
      const displayed: [string, string, string, string] = [a, b, c, d];
      return {
        idiom: r.idiom,
        literal: r.literal,
        displayed,
        correctIdx: displayed.indexOf(correctOption) as 0 | 1 | 2 | 3,
        story: r.story,
      };
    }),
  };
}

export function GameIdiomDecoder({
  onExit,
  lang,
  t,
}: {
  onExit: () => void;
  lang: string;
  t: PlayT;
}) {
  const built = useMemo(() => buildRuntimeRounds(lang, readKidsMode()), [lang]);
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
      title: t.idiomTitle,
      score,
      total: rounds.length,
      missed: missed.map((r) => ({
        word: r.idiom,
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
        title={t.idiomTitle}
        progress={`${idx + 1}/${rounds.length}`}
        score={score}
        onExit={onExit}
        t={t}
      />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{t.idiomPrompt}</div>
        <div className="wb-play-idiom-literal" lang={contentLang} dir={contentDir}>
          {r.literal}
        </div>
        {picked !== null && (
          <div className="wb-play-idiom-reveal" lang={contentLang} dir={contentDir}>
            &ldquo;{r.idiom}&rdquo;
          </div>
        )}
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
