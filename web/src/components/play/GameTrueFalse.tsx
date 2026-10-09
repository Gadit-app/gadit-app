"use client";

/**
 * True or false (Gadi 2026-10-09, the 8th notebook game): a word and a
 * meaning; is this meaning the word's own? Half the rounds show the real
 * meaning, half a meaning of another notebook word in the same script.
 * After the answer the word's real meaning is shown, so a "false" round
 * still teaches it. One tap per round: quick enough for young kids.
 */

import { useMemo, useState } from "react";
import type { PlayWord, TrueFalseRound } from "@/lib/play-engine";
import { buildTrueFalseRounds, SESSION_SIZE } from "@/lib/play-engine";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useNiqqud } from "@/lib/niqqud-display";

type TfCopy = { title: string; desc: string; ask: string; yes: string; no: string; right: string; wrong: string; real: string };

export const TF_COPY: Record<string, TfCopy> = {
  he: { title: "נכון או לא?", desc: "מילה והסבר. האם ההסבר שייך למילה?", ask: "האם זה מה שהמילה אומרת?", yes: "נכון", no: "לא נכון", right: "צדקתם!", wrong: "לא הפעם.", real: "המשמעות של המילה:" },
  en: { title: "True or false?", desc: "A word and a meaning. Does the meaning belong to the word?", ask: "Is this what the word means?", yes: "True", no: "False", right: "You got it!", wrong: "Not this time.", real: "What the word means:" },
  ar: { title: "صح أم خطأ؟", desc: "كلمة وشرح. هل الشرح يخص الكلمة؟", ask: "هل هذا ما تعنيه الكلمة؟", yes: "صح", no: "خطأ", right: "أحسنت!", wrong: "ليس هذه المرة.", real: "معنى الكلمة:" },
  ru: { title: "Верно или нет?", desc: "Слово и значение. Подходит ли значение к слову?", ask: "Это значение этого слова?", yes: "Верно", no: "Неверно", right: "Правильно!", wrong: "Не в этот раз.", real: "Что значит слово:" },
  es: { title: "¿Verdadero o falso?", desc: "Una palabra y un significado. ¿El significado es de esa palabra?", ask: "¿Es esto lo que significa la palabra?", yes: "Verdadero", no: "Falso", right: "¡Correcto!", wrong: "Esta vez no.", real: "Lo que significa la palabra:" },
};

export function tfCopy(lang: string): TfCopy {
  return TF_COPY[lang] ?? TF_COPY.en;
}

export function GameTrueFalse({ pool, onExit, lang, t }: { pool: PlayWord[]; onExit: () => void; lang: string; t: PlayT }) {
  const c = tfCopy(lang);
  const { nq } = useNiqqud(); // display-only vowel points
  const [startPool] = useState(pool);
  const rounds = useMemo(() => buildTrueFalseRounds(startPool, SESSION_SIZE.truefalse), [startPool]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<TrueFalseRound[]>([]);

  const r = rounds[idx];
  if (!r) {
    return (
      <GameResult
        data={{ title: c.title, score, total: rounds.length, missed: missed.map((m) => ({ word: m.word.word, meaning: m.word.meaning })) }}
        onExit={onExit}
        onReplay={() => location.reload()}
        lang={lang}
        t={t}
      />
    );
  }

  function pick(v: boolean) {
    if (answer !== null || !r) return;
    setAnswer(v);
    if (v === r.isTrue) setScore((s) => s + 1);
    else setMissed((m) => [...m, r]);
  }

  const correct = answer !== null && answer === r.isTrue;
  return (
    <div className="wb-play-stage">
      <PlayHeader title={c.title} progress={`${idx + 1}/${rounds.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{c.ask}</div>
        <div className="wb-play-prompt wb-play-prompt-word" lang={lang} dir="auto">{nq(r.word.word)}</div>
        <div className="wb-tf-meaning" dir="auto">{nq(r.shown)}</div>
      </div>
      <div className="wb-tf-actions">
        {[true, false].map((v) => {
          let cls = `wb-play-option wb-tf-btn ${v ? "wb-tf-yes" : "wb-tf-no"}`;
          if (answer !== null) {
            if (v === r.isTrue) cls += " is-correct";
            else if (v === answer) cls += " is-wrong";
            else cls += " is-dimmed";
          }
          return (
            <button key={String(v)} type="button" className={cls} onClick={() => pick(v)} disabled={answer !== null}>
              {v ? c.yes : c.no}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <div className="wb-tf-reveal" role="status">
          <div className={correct ? "wb-tf-right" : "wb-tf-wrong"}>{correct ? c.right : c.wrong}</div>
          {!r.isTrue && (
            <div className="wb-tf-real" dir="auto">
              <span>{c.real}</span> {nq(r.word.meaning)}
            </div>
          )}
          <button type="button" className="wb-play-next" onClick={() => { setAnswer(null); setIdx((n) => n + 1); }}>
            {idx + 1 >= rounds.length ? t.playFinish : t.playNext}
          </button>
        </div>
      )}
      <style>{TF_CSS}</style>
    </div>
  );
}

const TF_CSS = `
.wb-tf-meaning { margin-top: 14px; font-size: clamp(17px, 4.4vw, 21px); font-weight: 600; line-height: 1.55; color: var(--wb-ink, #1f2937); }
.wb-tf-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
.wb-tf-btn { justify-content: center; text-align: center; font-size: 18px; font-weight: 700; }
.wb-tf-reveal { display: grid; gap: 10px; justify-items: center; margin-top: 16px; text-align: center; }
.wb-tf-right { font-weight: 800; color: #0b7d7d; font-size: 17px; }
.wb-tf-wrong { font-weight: 800; color: #b45309; font-size: 17px; }
.wb-tf-real { font-size: 15px; line-height: 1.55; color: var(--wb-ink, #1f2937); max-width: 52ch; }
.wb-tf-real span { font-weight: 700; color: #6D28D9; }
`;
