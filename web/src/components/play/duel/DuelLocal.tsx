"use client";

import { DuelPrompt, duelOpt } from "./DuelPrompt";
import { useEffect, useRef, useState } from "react";
import { ROUND_MS, roundPoints, type DuelQuestion } from "@/lib/duel";
import { duelCopy } from "./duel-i18n";
import { DUEL_CSS } from "./duel-css";

/**
 * Word Duel on one device (a parent and a kid on the same phone): each
 * question is answered by player 1, the device is passed, player 2 answers
 * the same question, then both answers are shown. Nothing leaves the device.
 */
type Step =
  | { kind: "names" }
  | { kind: "pass"; round: number; who: 0 | 1 }
  | { kind: "ask"; round: number; who: 0 | 1; startedAt: number }
  | { kind: "reveal"; round: number }
  | { kind: "done" };

export function DuelLocal({ questions, lang, dir, onExit, defaultNames }: {
  questions: DuelQuestion[];
  lang: string;
  dir: "rtl" | "ltr";
  onExit: () => void;
  defaultNames?: [string, string];
}) {
  const t = duelCopy(lang);
  const [names, setNames] = useState<[string, string]>(defaultNames ?? ["", ""]);
  const [step, setStep] = useState<Step>({ kind: "names" });
  const [answers, setAnswers] = useState<Array<[ { choice: number | null; points: number } | null, { choice: number | null; points: number } | null ]>>(
    () => questions.map(() => [null, null]),
  );
  const [, setTick] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = (i: 0 | 1) => names[i].trim() || (i === 0 ? t.localP1 : t.localP2);

  useEffect(() => {
    const i = setInterval(() => setTick((n) => n + 1), 100);
    return () => clearInterval(i);
  }, []);

  const record = (round: number, who: 0 | 1, choice: number | null, startedAt: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const q = questions[round];
    const ms = Date.now() - startedAt;
    const points = choice == null ? 0 : roundPoints(choice === q.correctIdx, ms);
    setAnswers((prev) => prev.map((a, r) => (r === round ? (who === 0 ? [{ choice, points }, a[1]] : [a[0], { choice, points }]) : a)));
    setStep(who === 0 ? { kind: "pass", round, who: 1 } : { kind: "reveal", round });
  };

  // Time's up for whoever is answering.
  useEffect(() => {
    if (step.kind !== "ask") return;
    const s = step;
    timeoutRef.current = setTimeout(() => record(s.round, s.who, null, s.startedAt), ROUND_MS);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const total = (i: 0 | 1) => answers.reduce((s, a) => s + (a[i]?.points ?? 0), 0);

  return (
    <div className="duel" dir={dir}>
      <style>{DUEL_CSS}</style>
      <div className="duel-top">
        <button type="button" className="duel-link" onClick={onExit}>{t.back}</button>
        <span className="duel-title">{t.title}</span>
      </div>

      {step.kind === "names" && (
        <div className="duel-card">
          <h2 className="duel-h">{t.localWho}</h2>
          <div className="duel-names">
            {[0, 1].map((i) => (
              <input key={i} id={`duel-name-${i}`} dir={dir} value={names[i]} maxLength={20} placeholder={i === 0 ? t.localP1 : t.localP2}
                onChange={(e) => setNames((n) => (i === 0 ? [e.target.value, n[1]] : [n[0], e.target.value]))} />
            ))}
          </div>
          <div className="duel-row">
            <button type="button" className="duel-btn" onClick={() => setStep({ kind: "pass", round: 0, who: 0 })}>{t.localStart}</button>
          </div>
        </div>
      )}

      {step.kind === "pass" && (
        <button type="button" className="duel-pass" onClick={() => setStep({ kind: "ask", round: step.round, who: step.who, startedAt: Date.now() })}>
          <div>
            <div className="duel-progress">{t.round(step.round + 1, questions.length)}</div>
            <b>{step.who === 1 || step.round > 0 ? t.passTo(label(step.who)) : t.turnOf(label(step.who))}</b>
            <p className="duel-sub">{t.readyTap}</p>
          </div>
        </button>
      )}

      {step.kind === "ask" && (
        <div className="duel-card">
          <div className="duel-progress">{t.turnOf(label(step.who))} · {t.round(step.round + 1, questions.length)}</div>
          <div className="duel-timer"><span style={{ width: `${Math.max(0, 100 - ((Date.now() - step.startedAt) / ROUND_MS) * 100)}%` }} /></div>
          <DuelPrompt prompt={questions[step.round].prompt} options={questions[step.round].options} />
          <div className="duel-options">
            {questions[step.round].options.map((o, i) => (
              <button key={i} type="button" className="duel-opt" dir="auto" onClick={() => record(step.round, step.who, i, step.startedAt)}>{duelOpt(o)}</button>
            ))}
          </div>
        </div>
      )}

      {step.kind === "reveal" && (
        <div className="duel-card">
          <div className="duel-board">
            {[0, 1].map((i) => (
              <div key={i} className={`duel-chip${i === 0 ? " is-me" : ""}`} style={{ gridColumn: i === 0 ? 1 : 3 }}>
                <span className="duel-face is-glyph">{(label(i as 0 | 1)[0] ?? "?").toUpperCase()}</span>
                <div className="duel-chip-text"><span className="duel-chip-name" dir="auto">{label(i as 0 | 1)}</span>
                  <span className="duel-chip-status">{answers[step.round][i]?.choice == null ? t.noAnswer : answers[step.round][i]!.points > 0 ? `${t.correct} +${answers[step.round][i]!.points}` : t.wrong}</span></div>
                <span className="duel-score">{total(i as 0 | 1)}</span>
              </div>
            ))}
            <span className="duel-vs" style={{ gridColumn: 2, gridRow: 1 }}>VS</span>
          </div>
          <DuelPrompt prompt={questions[step.round].prompt} options={questions[step.round].options} />
          <div className="duel-options">
            {questions[step.round].options.map((o, i) => (
              <div key={i} className={`duel-opt${i === questions[step.round].correctIdx ? " is-right" : ""}`} dir="auto">{duelOpt(o)}</div>
            ))}
          </div>
          <div className="duel-row">
            <button type="button" className="duel-btn" onClick={() => setStep(step.round + 1 < questions.length ? { kind: "pass", round: step.round + 1, who: 0 } : { kind: "done" })}>
              {step.round + 1 < questions.length ? t.round(step.round + 2, questions.length) : t.recapTitle}
            </button>
          </div>
        </div>
      )}

      {step.kind === "done" && (
        <div className="duel-card">
          <h2 className="duel-h duel-final">
            {total(0) === total(1) ? t.tie : `${label(total(0) > total(1) ? 0 : 1)} 🏆`}
          </h2>
          <div className="duel-board">
            {[0, 1].map((i) => (
              <div key={i} className="duel-chip" style={{ gridColumn: i === 0 ? 1 : 3 }}>
                <div className="duel-chip-text"><span className="duel-chip-name" dir="auto">{label(i as 0 | 1)}</span></div>
                <span className="duel-score">{total(i as 0 | 1)}</span>
              </div>
            ))}
            <span className="duel-vs" style={{ gridColumn: 2, gridRow: 1 }}>VS</span>
          </div>
          <div className="duel-row">
            <button type="button" className="duel-btn" onClick={() => { setAnswers(questions.map(() => [null, null])); setStep({ kind: "pass", round: 0, who: 0 }); }}>{t.playAgain}</button>
            <button type="button" className="duel-btn is-soft" onClick={onExit}>{t.backToGames}</button>
          </div>
        </div>
      )}
    </div>
  );
}
