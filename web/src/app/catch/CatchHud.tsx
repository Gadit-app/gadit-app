"use client";

import { TTSButton } from "@/components/design/TTSButton";
import { SfxToggle } from "@/components/SfxToggle";
import { TesterButton } from "@/components/TesterButton";
import { RTL_SPELL } from "@/lib/world/letters";
import { Glyph } from "../world/Glyph";
import type { TrailWord } from "../world/WorldClient";
import type { CatchCopy } from "./catch-i18n";

/** The top bar of every catch scene: exit, sound, the word's slots, the tester note. */
export function CatchHud({ word, letters, step, pic, c, game, onExit }: {
  word: TrailWord; letters: string[]; step: number; pic: string | null; c: CatchCopy; game: string; onExit: () => void;
}) {
  const rtl = RTL_SPELL.has(word.lang);
  const audioLang = word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang;
  const done = step >= letters.length;
  return (
    <>
      <div className="ct-hud">
        <div className="ct-hud-side">
          <button type="button" className="ct-round" onClick={onExit} aria-label={c.back}>✕</button>
          <SfxToggle className="ct-round" />
        </div>
        <div className="ct-slots" dir={rtl ? "rtl" : "ltr"}>
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ct-slots-pic" src={pic} alt="" />
          ) : null}
          <span className="ct-slots-say"><TTSButton text={word.nq || (word.native ? word.raw : word.w)} audioLang={audioLang} ariaLabel={c.hear} className="ct-tts-btn" rate={0.85} /></span>
          {letters.map((l, i) => (
            <span key={i} className={`ct-slot${i < step ? " is-filled" : ""}${i === step && !done ? " is-now" : ""}`}>{i < step ? <Glyph ch={l} /> : null}</span>
          ))}
        </div>
        <div className="ct-hud-side is-end">
          <TesterButton game={game} word={word.w} className="ct-round" />
        </div>
      </div>
      <div className="ct-tip">{done ? c.caughtAll : c.catchNext}</div>
    </>
  );
}
