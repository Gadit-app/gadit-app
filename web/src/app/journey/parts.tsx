"use client";

/**
 * Pieces the two journey screens share (the index and the fortress):
 *   Say        a speaker that reads a word, a meaning or a sentence aloud;
 *   BuildTiles the recall question, the word put together from letter tiles;
 *   Lesson     what a child sees after a wrong answer: the word, its meaning
 *              and a speaker, so a miss teaches something (every one of the
 *              seven AI models that reviewed the game asked for this).
 */

import { useMemo, useState } from "react";
import { TTSButton } from "@/components/design/TTSButton";
import { lettersOf, tilesOf } from "@/lib/journey/build";

const isHebrew = (t: string) => /[א-ת]/.test(t);

/** Reads the text in its own language: Hebrew in our own voice, the rest by the device. */
export function Say({ text, label }: { text: string; label: string }) {
  if (!text.trim()) return null;
  const he = isHebrew(text);
  return <TTSButton text={text} audioLang={he ? "he-IL" : "en-US"} useOpenAI={he} ariaLabel={label} className="jrn-say" rate={0.9} />;
}

export function BuildTiles({ word, extra, disabled, onDone }: { word: string; extra: number; disabled: boolean; onDone: (right: boolean) => void }) {
  const want = useMemo(() => lettersOf(word.trim()), [word]);
  const tiles = useMemo(() => tilesOf(word, extra), [word, extra]);
  const [taken, setTaken] = useState<number[]>([]);
  const rtl = isHebrew(want[0] ?? "");

  const put = (i: number) => {
    if (disabled || taken.includes(i) || taken.length >= want.length) return;
    const next = [...taken, i];
    setTaken(next);
    if (next.length === want.length) onDone(next.map((k) => tiles[k]).join("") === want.join(""));
  };
  const back = () => { if (!disabled) setTaken(taken.slice(0, -1)); };

  return (
    <div className="jrn-build">
      <div className="jrn-slots" dir={rtl ? "rtl" : "ltr"} onClick={back} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Backspace") back(); }}>
        {want.map((_, k) => <span key={k} className={`jrn-slot${k < taken.length ? " is-full" : ""}`}>{k < taken.length ? tiles[taken[k]] : ""}</span>)}
      </div>
      <div className="jrn-tiles" dir={rtl ? "rtl" : "ltr"}>
        {tiles.map((ch, i) => (
          <button key={i} type="button" className="jrn-tile" onClick={() => put(i)} disabled={disabled || taken.includes(i)} lang={rtl ? "he" : "en"}>{ch}</button>
        ))}
      </div>
    </div>
  );
}

export function Lesson({ word, meaning, title, hear }: { word: string; meaning: string; title: string; hear: string }) {
  return (
    <div className="jrn-lesson">
      <div className="jrn-lesson-title">{title}</div>
      <div className="jrn-lesson-word" dir="auto">{word} <Say text={word} label={hear} /></div>
      <div className="jrn-lesson-meaning" dir="auto">{meaning}</div>
    </div>
  );
}

export const PARTS_CSS = `
.jrn-say { width: 40px; height: 40px; border: 0; border-radius: 50%; background: #e6f4f3; color: #0a7472; display: inline-grid; place-items: center; cursor: pointer; vertical-align: middle; }
.jrn-say svg { width: 22px; height: 22px; }
.jrn-prompt-row { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
.jrn-build { display: grid; gap: 16px; justify-items: center; width: 100%; }
.jrn-slots { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; cursor: pointer; }
.jrn-slot { width: 48px; height: 56px; border-radius: 12px; display: grid; place-items: center; font-size: 30px; font-weight: 800; background: #f1f5f9; box-shadow: 0 0 0 2px #cbd5e1 inset; }
.jrn-slot.is-full { background: #fff; box-shadow: 0 0 0 3px #0a7472 inset; }
.jrn-tiles { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; max-width: 520px; }
.jrn-tile { width: 56px; height: 60px; border: 0; border-radius: 14px; background: #fff; color: #14202b; font: inherit; font-size: 30px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 0 #cbd5e1, 0 0 0 2px #cbd5e1 inset; }
.jrn-tile:disabled { opacity: .25; cursor: default; box-shadow: 0 0 0 2px #e2e8f0 inset; }
.jrn-lesson { display: grid; gap: 6px; justify-items: center; text-align: center; padding: 14px 18px; border-radius: 16px; background: #fff8e1; box-shadow: 0 0 0 2px #f4d58a inset; max-width: 560px; }
.jrn-lesson-title { font-size: 14px; font-weight: 700; color: #7a5a00; }
.jrn-lesson-word { font-size: 26px; font-weight: 800; }
.jrn-lesson-meaning { font-size: 17px; line-height: 1.55; }
`;
