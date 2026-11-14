"use client";

/**
 * "Letter memory" (Gadi 2026-11-14, an idea sent through "Invent a game" by
 * Shani Kosta): a memory game of the Hebrew letters.
 *
 * Two stages:
 *  - print and script: a print letter and the same letter in handwriting;
 *  - regular and final: a letter and its final form (five pairs only).
 * Every card that opens says the name of its letter, so a child who does not
 * know the handwriting shape yet can still find the pair by ear and learn it.
 * Levels grow by four cards: 6, 10, 14, 18. Finishing a level opens the next.
 *
 * The handwriting is Gveret Levin (OFL), loaded only when this game opens.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useSpeech } from "./GameSyllables";

type Stage = "script" | "final";
type Kind = "print" | "script";
type PairCard = { id: string; pairKey: string; glyph: string; kind: Kind; say: string };

/** The name of each letter as the voice is asked to say it. */
const NAMES: Record<string, string> = {
  א: "אָלֶף", ב: "בֵּית", ג: "גִּימֶל", ד: "דָּלֶת", ה: "הֵא", ו: "וָו", ז: "זַיִן", ח: "חֵית", ט: "טֵית", י: "יוֹד",
  כ: "כָּף", ל: "לָמֶד", מ: "מֵם", נ: "נוּן", ס: "סָמֶךְ", ע: "עַיִן", פ: "פֵּא", צ: "צָדִי", ק: "קוֹף", ר: "רֵישׁ", ש: "שִׁין", ת: "תָּו",
  ך: "כָּף סוֹפִית", ם: "מֵם סוֹפִית", ן: "נוּן סוֹפִית", ף: "פֵּא סוֹפִית", ץ: "צָדִי סוֹפִית",
};
const LETTERS = Object.keys(NAMES);
const FINALS: Array<[string, string]> = [["כ", "ך"], ["מ", "ם"], ["נ", "ן"], ["פ", "ף"], ["צ", "ץ"]];
/** Cards per level. */
export const PAIR_LEVELS: Record<Stage, number[]> = { script: [6, 10, 14, 18], final: [6, 10] };

const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** The deck of one round: `cards` cards, every pair once, shuffled. */
export function buildPairDeck(stage: Stage, cards: number): PairCard[] {
  const pairs = Math.floor(cards / 2);
  if (stage === "final") {
    return shuffle(shuffle(FINALS).slice(0, pairs).flatMap(([a, b]) => [
      { id: a, pairKey: a, glyph: a, kind: "print" as const, say: NAMES[a] },
      { id: b, pairKey: a, glyph: b, kind: "print" as const, say: NAMES[b] },
    ]));
  }
  return shuffle(shuffle(LETTERS).slice(0, pairs).flatMap((l) => [
    { id: l + ":p", pairKey: l, glyph: l, kind: "print" as const, say: NAMES[l] },
    { id: l + ":s", pairKey: l, glyph: l, kind: "script" as const, say: NAMES[l] },
  ]));
}

const KTAV = "Gadit Ktav";
let ktavReady: Promise<boolean> | undefined;
function loadKtav(): Promise<boolean> {
  if (typeof window === "undefined" || typeof FontFace === "undefined") return Promise.resolve(false);
  if (!ktavReady) {
    ktavReady = (async () => {
      try {
        const face = new FontFace(KTAV, "url(/fonts/gveret-levin-hebrew-400.woff2) format('woff2')", { weight: "400" });
        await face.load();
        document.fonts.add(face);
        return true;
      } catch { ktavReady = undefined; return false; }
    })();
  }
  return ktavReady;
}

const KEY = "gadit-letter-pairs-v1";
type Saved = { stage: Stage; level: Record<Stage, number> };
const readSaved = (uid: string | undefined): Saved => {
  const base: Saved = { stage: "script", level: { script: 0, final: 0 } };
  try {
    const s = JSON.parse(localStorage.getItem(`${KEY}:${uid ?? "anon"}`) || "null") as Partial<Saved> | null;
    if (!s) return base;
    const stage: Stage = s.stage === "final" ? "final" : "script";
    const lv = (st: Stage) => { const n = Number(s.level?.[st]); return Number.isInteger(n) && n >= 0 && n < PAIR_LEVELS[st].length ? n : 0; };
    return { stage, level: { script: lv("script"), final: lv("final") } };
  } catch { return base; }
};
const writeSaved = (uid: string | undefined, s: Saved) => { try { localStorage.setItem(`${KEY}:${uid ?? "anon"}`, JSON.stringify(s)); } catch { /* this visit only */ } };

type Copy = {
  title: string; desc: string; choose: string;
  stages: Record<Stage, { name: string; line: string }>;
  howMany: string; cards: (n: number) => string; start: string;
  promptScript: string; promptFinal: string; noFont: string; retry: string;
  moves: (n: number) => string; next: (n: number) => string; top: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "זיכרון האותיות", desc: "מוצאים לכל אות את בת הזוג שלה: דפוס וכתב, רגילה וסופית",
    choose: "במה משחקים?",
    stages: {
      script: { name: "דפוס וכתב", line: "אות בדפוס ואותה אות בכתב" },
      final: { name: "רגילה וסופית", line: "אות ואותה אות בסוף מילה" },
    },
    howMany: "כמה קלפים?", cards: (n) => `${n} קלפים`, start: "מתחילים",
    promptScript: "הפכו שני קלפים: אות בדפוס ואותה אות בכתב",
    promptFinal: "הפכו שני קלפים: אות ואותה אות בסוף מילה",
    noFont: "אותיות הכתב לא נטענו", retry: "לנסות שוב",
    moves: (n) => `${n} מהלכים`, next: (n) => `הסיבוב הבא: ${n} קלפים`, top: "זאת הרמה הכי גבוהה",
  },
  en: {
    title: "Letter memory", desc: "Find each Hebrew letter's partner: print and script, regular and final",
    choose: "What are we playing?",
    stages: {
      script: { name: "Print and script", line: "A print letter and the same letter in handwriting" },
      final: { name: "Regular and final", line: "A letter and its form at the end of a word" },
    },
    howMany: "How many cards?", cards: (n) => `${n} cards`, start: "Start",
    promptScript: "Flip two cards: a print letter and the same letter in handwriting",
    promptFinal: "Flip two cards: a letter and its form at the end of a word",
    noFont: "The handwriting letters did not load", retry: "Try again",
    moves: (n) => `${n} moves`, next: (n) => `Next round: ${n} cards`, top: "This is the highest level",
  },
};
export const letterPairsCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

export function GameLetterPairs({ onExit, lang, t }: { onExit: () => void; lang: string; t: PlayT }) {
  const c = letterPairsCopy(lang);
  const { user } = useAuth();
  const { speak, warm } = useSpeech();
  const [saved, setSaved] = useState<Saved>(() => readSaved(user?.uid));
  const [screen, setScreen] = useState<"pick" | "play" | "done">("pick");
  const [seed, setSeed] = useState(0);
  const { stage } = saved;
  const levels = PAIR_LEVELS[stage];
  const level = Math.min(saved.level[stage], levels.length - 1);
  const deck = useMemo(() => buildPairDeck(stage, levels[level]), [stage, level, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalPairs = deck.length / 2;
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [font, setFont] = useState<"loading" | "ok" | "failed">("loading");
  const lock = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => { for (const id of timers.current) window.clearTimeout(id); }, []);

  const loadFont = () => { void loadKtav().then((ok) => setFont(ok ? "ok" : "failed")); };
  useEffect(() => { let live = true; void loadKtav().then((ok) => { if (live) setFont(ok ? "ok" : "failed"); }); return () => { live = false; }; }, []);
  // The names of the round's letters are fetched before the first flip.
  useEffect(() => { if (screen === "play") warm([...new Set(deck.map((d) => d.say))]); }, [screen, deck, warm]);

  const update = (s: Saved) => { setSaved(s); writeSaved(user?.uid, s); };
  const begin = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = []; lock.current = false;
    setFlipped([]); setMatched([]); setMoves(0); setSeed((s) => s + 1); setScreen("play");
  };

  useEffect(() => {
    if (screen !== "play" || totalPairs === 0 || matched.length !== totalPairs) return;
    const id = window.setTimeout(() => setScreen("done"), 900);
    return () => window.clearTimeout(id);
  }, [matched.length, totalPairs, screen]);

  function tryFlip(card: PairCard) {
    if (lock.current || flipped.includes(card.id) || matched.includes(card.pairKey)) return;
    const next = [...flipped, card.id];
    sfx.flip();
    void speak(card.say);
    setFlipped(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const a = deck.find((d) => d.id === next[0])!;
    if (a.pairKey === card.pairKey) {
      later(() => sfx.correct(), 650);
      setMatched((m) => [...m, a.pairKey]);
      setFlipped([]);
    } else {
      lock.current = true;
      later(() => { setFlipped([]); lock.current = false; }, 1600);
    }
  }

  if (screen === "done") {
    const hasNext = level < levels.length - 1;
    return (
      <GameResult
        data={{ title: c.title, score: totalPairs, total: totalPairs, headline: c.moves(moves), note: hasNext ? c.next(levels[level + 1]) : c.top }}
        onExit={onExit}
        onReplay={() => { if (hasNext) update({ ...saved, level: { ...saved.level, [stage]: level + 1 } }); begin(); }}
        lang={lang}
        t={t}
      />
    );
  }

  const needsFont = stage === "script";
  return (
    <div className="wb-play-stage lpr">
      <style>{LPR_CSS}</style>
      <PlayHeader title={c.title} progress={screen === "play" ? `${matched.length}/${totalPairs}` : undefined} score={screen === "play" ? moves : undefined} onExit={screen === "play" ? () => setScreen("pick") : onExit} t={t} />
      {screen === "pick" && (
        <div className="wb-play-question lpr-q">
          <div className="lpr-h">{c.choose}</div>
          <div className="lpr-row">
            {(["script", "final"] as const).map((st) => (
              <button key={st} type="button" className={`lpr-door${st === stage ? " is-on" : ""}`} aria-pressed={st === stage} onClick={() => { sfx.tap(); update({ ...saved, stage: st }); }}>
                <span className="lpr-sample" lang="he" dir="rtl" aria-hidden="true">
                  <i>{st === "script" ? "ש" : "מ"}</i>
                  <i style={st === "script" ? { fontFamily: `"${KTAV}", cursive` } : undefined}>{st === "script" ? "ש" : "ם"}</i>
                </span>
                <b>{c.stages[st].name}</b>
                <span>{c.stages[st].line}</span>
              </button>
            ))}
          </div>
          <div className="lpr-sub">{c.howMany}</div>
          <div className="lpr-row" role="radiogroup" aria-label={c.howMany}>
            {levels.map((n, i) => (
              <button key={n} type="button" role="radio" aria-checked={i === level} className={`lpr-chip${i === level ? " is-on" : ""}`} onClick={() => { sfx.tap(); update({ ...saved, level: { ...saved.level, [stage]: i } }); }}>{c.cards(n)}</button>
            ))}
          </div>
          {needsFont && font === "failed" ? (
            <div className="lpr-row">
              <span className="lpr-note">{c.noFont}</span>
              <button type="button" className="lpr-btn is-ghost" onClick={() => { setFont("loading"); loadFont(); }}>{c.retry}</button>
            </div>
          ) : (
            <button type="button" className="lpr-btn" disabled={needsFont && font !== "ok"} onClick={() => { sfx.tap(); begin(); }}>{c.start}</button>
          )}
        </div>
      )}
      {screen === "play" && (
        <>
          <div className="wb-play-question">
            <div className="wb-play-question-eyebrow">{stage === "script" ? c.promptScript : c.promptFinal}</div>
          </div>
          <div className={`lpr-grid lpr-n${deck.length}`} dir="rtl">
            {deck.map((card) => {
              const isMatched = matched.includes(card.pairKey);
              const open = isMatched || flipped.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  className={`wb-play-memcard lpr-card${open ? " is-open" : ""}${isMatched ? " is-matched" : ""}`}
                  onClick={() => { if (isMatched) void speak(card.say); else tryFlip(card); }}
                  aria-label={open ? card.say : undefined}
                >
                  <span className="wb-play-memcard-back" aria-hidden={open}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
                      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </span>
                  <span className="wb-play-memcard-face" aria-hidden={!open}>
                    <span className={`lpr-glyph is-${card.kind}`} lang="he">{card.glyph}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const LPR_CSS = `
.lpr .lpr-q { display: grid; gap: 16px; justify-items: center; text-align: center; }
.lpr-h { font-size: clamp(20px, 5vw, 26px); font-weight: 800; line-height: 1.5; }
.lpr-sub { font-size: 17px; font-weight: 700; }
.lpr-note { font-size: 17px; font-weight: 700; align-self: center; }
.lpr-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.lpr-door { display: grid; gap: 4px; justify-items: center; width: min(240px, 100%); padding: 14px 16px 16px; border: 0; border-radius: 22px; background: #fff; color: #14202b; font: inherit; cursor: pointer; box-shadow: 0 0 0 3px #e7dfc8 inset, 0 6px 14px #0002; }
.lpr-door.is-on { box-shadow: 0 0 0 4px #0a7472 inset, 0 6px 14px #0002; background: #ecfdf5; }
.lpr-door b { font-size: 20px; font-weight: 800; color: #0a5c5a; }
.lpr-door > span:last-child { font-size: 15px; line-height: 1.5; color: #47586a; }
.lpr-sample { display: flex; gap: 14px; direction: rtl; }
.lpr-sample i { font-style: normal; font-family: var(--wb-font-display, inherit); font-size: 52px; font-weight: 700; line-height: 1.4; color: #14202b; }
.lpr-chip { min-height: 48px; padding: 8px 18px; border: 0; border-radius: 999px; background: #fff; color: #14202b; font: inherit; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 0 0 2px #cfd8e0 inset; }
.lpr-chip.is-on { background: #0a7472; color: #fff; box-shadow: 0 3px 0 #075452; }
.lpr-btn { min-height: 52px; padding: 12px 30px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
.lpr-btn:disabled { opacity: .55; cursor: default; }
.lpr-btn.is-ghost { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset; }
.lpr-grid { display: grid; gap: 10px; margin-inline: auto; width: 100%; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 520px; }
.lpr-grid.lpr-n6 { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 420px; }
@media (min-width: 720px) {
  .lpr-grid.lpr-n10 { grid-template-columns: repeat(5, minmax(0, 1fr)); max-width: 640px; }
  .lpr-grid.lpr-n14 { grid-template-columns: repeat(7, minmax(0, 1fr)); max-width: 860px; }
  .lpr-grid.lpr-n18 { grid-template-columns: repeat(6, minmax(0, 1fr)); max-width: 760px; }
}
.wordbook .lpr-card .wb-play-memcard-face { padding: 4px; }
.lpr-glyph { font-size: clamp(40px, 13vw, 76px); line-height: 1.3; }
.lpr-glyph.is-print { font-family: var(--wb-font-display, inherit); font-weight: 700; }
.lpr-glyph.is-script { font-family: "${KTAV}", cursive; font-weight: 400; font-size: clamp(46px, 15vw, 88px); }
@media (min-width: 720px) { .lpr-glyph { font-size: 56px; } .lpr-glyph.is-script { font-size: 64px; } }
`;
