"use client";

/**
 * A short reading text with yes/no checks (Gadi 2026-10-11, the "My Family"
 * page of Ziv's workbook). The text stays on screen, every word tappable,
 * with a read-aloud; the checks come one at a time under it.
 */
import { useState } from "react";
import { PlayHeader, type PlayT } from "../GameQuiz";
import { GameResult } from "../GameResult";
import { TTSButton } from "@/components/design/TTSButton";
import { QText } from "../QText";
import { lessonCopy } from "./lesson-i18n";

export function GameReading({ reading, onExit, lang, t, audioLang, dirText }: {
  reading: { title: string; text: string; checks: Array<{ s: string; yes: boolean }> };
  onExit: () => void;
  lang: string;
  t: PlayT;
  audioLang: string;
  /** Direction of the text (rtl for Hebrew). */
  dirText: "rtl" | "ltr";
}) {
  const c = lessonCopy(lang);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const checks = reading.checks;

  if (idx >= checks.length) {
    return (
      <GameResult
        data={{ title: c.readingTitle, score, total: checks.length }}
        onExit={onExit}
        onReplay={() => { setIdx(0); setAnswer(null); setScore(0); setRound((r) => r + 1); }}
        lang={lang}
        t={t}
      />
    );
  }
  const ch = checks[idx];
  const pick = (v: boolean) => {
    if (answer !== null) return;
    setAnswer(v);
    if (v === ch.yes) setScore((s) => s + 1);
    setTimeout(() => { setIdx((i) => i + 1); setAnswer(null); }, v === ch.yes ? 900 : 1600);
  };

  return (
    <div className="wb-play-stage" key={round}>
      <PlayHeader title={c.readingTitle} progress={`${idx + 1}/${checks.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question" style={{ textAlign: "start" }}>
        <div className="wb-play-question-eyebrow" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span><QText text={reading.title} wordLang={audioLang} /></span>
          <TTSButton text={reading.text} audioLang={audioLang} useOpenAI ariaLabel={reading.title} className="wb-word-act-icon wb-play-speak" />
        </div>
        <p className="wb-play-sentence" dir={dirText} lang={audioLang} style={{ margin: "10px 0 0", lineHeight: 1.8 }}>
          <QText text={reading.text} />
        </p>
      </div>
      <div className="wb-play-question" style={{ marginTop: 14 }}>
        <div className="wb-play-question-eyebrow">{c.readingAsk}</div>
        <div className="wb-play-prompt wb-play-prompt-sentence" dir={dirText} lang={audioLang}><QText text={ch.s} wordLang={audioLang} /></div>
      </div>
      <div className="wb-play-options wb-play-options-pair">
        {[true, false].map((v) => {
          let cls = "wb-play-option";
          if (answer !== null) {
            if (v === ch.yes) cls += " is-correct";
            else if (v === answer) cls += " is-wrong";
            else cls += " is-dimmed";
          }
          return (
            <button key={String(v)} type="button" className={cls} onClick={() => pick(v)} disabled={answer !== null} style={{ textAlign: "center", fontWeight: 700 }}>
              {v ? c.yes : c.no}
            </button>
          );
        })}
      </div>
    </div>
  );
}
