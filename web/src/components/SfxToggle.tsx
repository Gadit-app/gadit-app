"use client";

/**
 * SfxToggle: a music-note button that turns the game sounds on or off (2026-10-31).
 * The choice is kept on the device (lib/game-sfx.ts) and shared by every game.
 */

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { sfx, sfxOn, setSfxOn } from "@/lib/game-sfx";

// "Sound" in every UI language (only the button's accessible name).
const SOUND: Record<string, string> = {
  en: "Sound", he: "צליל", ar: "الصوت", ru: "Звук", es: "Sonido", pt: "Som", fr: "Son", de: "Ton", cs: "Zvuk", sk: "Zvuk",
  it: "Suono", ja: "サウンド", hi: "ध्वनि", am: "ድምፅ", uk: "Звук", tr: "Ses", pl: "Dźwięk", fa: "صدا", id: "Suara", nl: "Geluid",
  el: "Ήχος", zu: "Umsindo", vi: "Âm thanh", fil: "Tunog", af: "Klank", sw: "Sauti", "zh-CN": "声音", "zh-TW": "聲音", ko: "소리",
  th: "เสียง", bn: "শব্দ", da: "Lyd", hu: "Hang", xh: "Isandi", nso: "Modumo", tn: "Modumo", st: "Molumo", ts: "Mpfumawulo",
  ss: "Umsindvo", ve: "Mubvumo", nr: "Umsindo",
};

export function SfxToggle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { lang } = useLang();
  // Read after mount (localStorage): the server render always shows "on".
  const [on, setOn] = useState(true);
  useEffect(() => {
    const sync = () => setOn(sfxOn());
    sync();
    window.addEventListener("gadit-sfx", sync);
    return () => window.removeEventListener("gadit-sfx", sync);
  }, []);
  return (
    <button
      type="button"
      className={className}
      style={style}
      aria-label={SOUND[lang] ?? SOUND.en}
      aria-pressed={on}
      onClick={() => {
        const next = !on;
        setSfxOn(next);
        if (next) sfx.tap();
      }}
    >
      {/* A music note, not a speaker: the speaker button next to it reads the word aloud. */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block", color: on ? "#0a7472" : "#8a949b" }}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
        {on ? null : <path d="M3 3l18 18" strokeWidth="2.4" />}
      </svg>
    </button>
  );
}
