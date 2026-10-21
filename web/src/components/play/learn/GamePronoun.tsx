"use client";

/**
 * "He, she or it" (Gadi 2026-10-11, from Ziv's workbook: Mark / Choose /
 * Complete). A phrase from the child's own unit ("My grandmother"); pick the
 * pronoun that replaces it.
 */
import { useMemo, useState } from "react";
import { shuffle } from "@/lib/play-engine";
import { PlayHeader, type PlayT } from "../GameQuiz";
import { GameResult } from "../GameResult";
import { TTSButton } from "@/components/design/TTSButton";
import { lessonCopy } from "./lesson-i18n";
import { QText } from "@/components/play/QText";

export function GamePronoun({ items, onExit, lang, t, audioLang }: {
  items: Array<{ phrase: string; answer: string }>;
  onExit: () => void;
  lang: string;
  t: PlayT;
  audioLang: string;
}) {
  const c = lessonCopy(lang);
  const [seed, setSeed] = useState(0);
  const rounds = useMemo(() => shuffle(items).slice(0, 8), [items, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  // The choices: the pronouns this unit uses, at least He / She / It.
  // Hebrew lessons pick from הוא / היא / הם / הן, English ones from He, She, It, They.
  const hebrew = items.some((x) => /[֐-׿]/.test(x.answer));
  const options = useMemo(() => {
    if (hebrew) {
      const used = new Set(["הוא", "היא", "הם", ...items.map((x) => x.answer)]);
      return ["הוא", "היא", "הם", "הן"].filter((p) => used.has(p));
    }
    const used = new Set(["He", "She", "It", ...items.map((x) => x.answer)]);
    return ["I", "You", "He", "She", "It", "We", "They"].filter((p) => used.has(p));
  }, [items, hebrew]);
  const textDir = hebrew ? "rtl" : "ltr";
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Array<{ word: string; meaning: string }>>([]);

  if (idx >= rounds.length) {
    return (
      <GameResult
        data={{ title: c.pronounTitle, score, total: rounds.length, missed }}
        onExit={onExit}
        onReplay={() => { setSeed((x) => x + 1); setIdx(0); setPicked(null); setScore(0); setMissed([]); }}
        lang={lang}
        t={t}
      />
    );
  }
  const r = rounds[idx];
  const pick = (p: string) => {
    if (picked) return;
    setPicked(p);
    if (p === r.answer) setScore((s) => s + 1);
    else setMissed((m) => [...m, { word: r.phrase, meaning: r.answer }]);
    // New buttons for every question (key holds idx), and the tapped one loses
    // focus: on a tablet the previous answer looked still pressed (Shiloh, 2026-10-17).
    setTimeout(() => { (document.activeElement as HTMLElement | null)?.blur?.(); setIdx((i) => i + 1); setPicked(null); }, p === r.answer ? 900 : 1600);
  };

  return (
    <div className="wb-play-stage">
      <PlayHeader title={c.pronounTitle} progress={`${idx + 1}/${rounds.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question">
        <div className="wb-play-question-eyebrow">{c.pronounPrompt}</div>
        <div className="wb-play-prompt wb-play-prompt-word" dir={textDir} lang={audioLang}>
          <span><QText text={r.phrase} wordLang={audioLang} /></span>
          <TTSButton text={r.phrase} audioLang={audioLang} useOpenAI ariaLabel={r.phrase} className="wb-word-act-icon wb-play-speak" />
        </div>
      </div>
      <div className="wb-play-options wb-play-options-pair" dir={textDir}>
        {options.map((p) => {
          let cls = "wb-play-option";
          if (picked) {
            if (p === r.answer) cls += " is-correct";
            else if (p === picked) cls += " is-wrong";
            else cls += " is-dimmed";
          }
          return (
            <button key={`${idx}-${p}`} type="button" className={cls} onClick={() => pick(p)} disabled={!!picked} style={{ textAlign: "center", fontSize: 20, fontWeight: 700 }}>
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
