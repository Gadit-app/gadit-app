"use client";

/**
 * Crossword, תשבץ (Gadi 2026-11-11, Osher's idea). The child's practice
 * words crossing each other in a small grid, Hebrew (read right to left) or
 * English, with their meanings as clues and, when the word has one, its
 * picture. Letters come from an on-screen keyboard of the word's language, so
 * no device keyboard switching. An entry turns green by itself when all its
 * letters are right; a wrong entry only shakes and keeps the letters, so the
 * child can fix them. Hint fills one letter. Kids Mode: 5 words in a 7×7;
 * grown-ups: 8 words in a 10×10. The UI language's bank fills in when the
 * notebook has too few single words.
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang } from "@/lib/play-engine";
import { makeCrossword, type Entry } from "@/lib/puzzles/crossword";
import { useNiqqud } from "@/lib/niqqud-display";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { QText } from "./QText";
import { LEVEL_CSS, LevelChip, LevelChooser, clueCandidates, clueItems, clueSettings, levelCopy, useCluePics, usePuzzleLevel, type ClueItem, type PuzzleLevel } from "./puzzle-levels";
import { WaitText } from "@/components/WaitText";

type Copy = { title: string; desc: string; across: string; down: string; hint: string; done: string; solved: (n: number, of: number) => string; tapCell: string; picClue: string };
const COPY: Record<string, Copy> = {
  he: { title: "תשבצים", desc: "המילים שלכם משתלבות זו בזו. ההגדרה היא המשמעות, ולפעמים תמונה", across: "מאוזן", down: "מאונך", hint: "רמז", done: "פתרתם את התשבץ", solved: (n, of) => `${n} מתוך ${of}`, tapCell: "לוחצים על משבצת כדי לראות את ההגדרה", picClue: "מה רואים בתמונה?" },
  en: { title: "Crosswords", desc: "Your words cross each other. The clue is the meaning, sometimes a picture", across: "Across", down: "Down", hint: "Hint", done: "You solved the crossword", solved: (n, of) => `${n} of ${of}`, tapCell: "Tap a square to see its clue", picClue: "What is in the picture?" },
  ar: { title: "الكلمات المتقاطعة", desc: "كلماتك تتقاطع. التعريف هو المعنى، وأحيانًا صورة", across: "أفقي", down: "عمودي", hint: "تلميح", done: "حللت الكلمات المتقاطعة", solved: (n, of) => `${n} من ${of}`, tapCell: "اضغط على مربع لترى التعريف", picClue: "ماذا ترى في الصورة؟" },
  ru: { title: "Кроссворд", desc: "Твои слова пересекаются. Подсказка — значение, иногда картинка", across: "По горизонтали", down: "По вертикали", hint: "Подсказка", done: "Ты решил кроссворд", solved: (n, of) => `${n} из ${of}`, tapCell: "Нажми на клетку, чтобы увидеть подсказку", picClue: "Что на картинке?" },
};
export const crosswordCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

const FINAL: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const base = (ch: string) => FINAL[ch] ?? ch.toUpperCase();
const HE_KEYS = ["קראטופ", "שדגכעיחל", "זסבהנמצת"];
const EN_KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];


const cellKey = (r: number, c: number) => `${r},${c}`;
const cellsOf = (e: Entry) => e.letters.map((_, k) => (e.dir === "across" ? cellKey(e.row, e.col + k) : cellKey(e.row + k, e.col)));

export function GameCrossword(props: { pool: PlayWord[]; onExit: () => void; lang: string; t: PlayT }) {
  const lv = usePuzzleLevel();
  if (!lv.level) return <LevelChooser title={crosswordCopy(props.lang).title} kind="clue" suggested={lv.suggested} onPick={lv.choose} onExit={props.onExit} lang={props.lang} t={props.t} />;
  return <CrosswordBoard key={lv.level} {...props} level={lv.level} kids={lv.kids} onLevel={lv.reopen} />;
}

const EMPTY = makeCrossword([], { rtl: false, maxSide: 4 });

function CrosswordBoard({ pool, onExit, lang, t, level, kids, onLevel }: { pool: PlayWord[]; onExit: () => void; lang: string; t: PlayT; level: PuzzleLevel; kids: boolean; onLevel: () => void }) {
  const c = crosswordCopy(lang);
  const lc = levelCopy(lang);
  const { user } = useAuth();
  const { nq } = useNiqqud();
  const set = useMemo(() => clueSettings(level, kids, 12), [level, kids]);
  const [seed, setSeed] = useState(0);
  const [startPool] = useState(pool);
  // More words than the grid needs; their pictures are looked up first, so a word with nothing to show is never placed.
  const cands = useMemo(() => clueCandidates(startPool, lang, level, set), [startPool, lang, level, set, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const { pics, ready } = useCluePics(user, cands);
  const puzzle = useMemo(() => {
    if (!ready) return { cw: EMPTY, rtl: lang === "he", byWord: new Map<string, ClueItem>() };
    const items = clueItems(cands, pics, level, set.n);
    const rtl = (items[0]?.lang ?? (lang === "he" ? "he" : "en")) === "he";
    const cw = makeCrossword(items.map((x) => x.word), { rtl, maxSide: set.maxSide });
    const byWord = new Map(items.map((x) => [x.word, x]));
    return { cw, rtl, byWord };
  }, [ready, cands, pics, level, set, lang]);
  const { cw, rtl } = puzzle;
  const [stage, setStage] = useState<Map<string, number>>(new Map()); // word → hints asked for it
  const [hintsUsed, setHintsUsed] = useState(0);
  const [typed, setTyped] = useState<Map<string, string>>(new Map());
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState(0); // entry index
  const [cursor, setCursor] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const wordLang = rtl ? "he" : "en";

  // the first entry starts selected, cursor on its first cell
  useEffect(() => { const e = cw.entries[0]; if (e) { setSel(0); setCursor(cellsOf(e)[0]); } }, [cw]);

  const entry = cw.entries[sel];
  const entryCells = entry ? cellsOf(entry) : [];
  const lockedCells = useMemo(() => { const s = new Set<string>(); for (const e of cw.entries) if (solved.has(e.word)) for (const k of cellsOf(e)) s.add(k); return s; }, [cw, solved]);

  /** The letter shown in a cell: the right one once any entry through it is solved, else what was typed. */
  const shown = (r: number, cc: number) => lockedCells.has(cellKey(r, cc)) ? cw.cells[r][cc] ?? "" : typed.get(cellKey(r, cc)) ?? "";

  const tapCell = (r: number, cc: number) => {
    const k = cellKey(r, cc);
    const here = cw.entries.map((e, i) => ({ e, i })).filter((x) => cellsOf(x.e).includes(k));
    if (!here.length) return;
    // tapping inside the selected entry again switches to the crossing entry
    const cur = here.find((x) => x.i === sel);
    const next = cur && here.length > 1 ? here.find((x) => x.i !== sel)! : (cur ?? here[0]);
    setSel(next.i); setCursor(k); sfx.tap();
  };

  const checkEntry = (e: Entry, letters: Map<string, string>) => {
    const ks = cellsOf(e);
    if (ks.some((k) => !lockedCells.has(k) && !letters.get(k))) return;
    const ok = ks.every((k, i) => lockedCells.has(k) || base(letters.get(k) ?? "") === base(e.letters[i]));
    if (ok) {
      sfx.correct();
      // Solving a word locks its cells, and that can complete a crossing word whose
      // other letters were already right: it counts as solved too (it used to stay
      // open forever, and the result screen never came).
      const ns = new Set(solved); ns.add(e.word);
      const nl = new Set<string>();
      for (let grew = true; grew;) {
        grew = false; nl.clear();
        for (const x of cw.entries) if (ns.has(x.word)) for (const k of cellsOf(x)) nl.add(k);
        for (const x of cw.entries) if (!ns.has(x.word) && cellsOf(x).every((k, i) => nl.has(k) || base(letters.get(k) ?? "") === base(x.letters[i]))) { ns.add(x.word); grew = true; }
      }
      setSolved(ns);
      // on to the next unsolved entry, on a cell that can still be typed in
      const idx = cw.entries.findIndex((x) => !ns.has(x.word));
      if (idx >= 0) { setSel(idx); setCursor(cellsOf(cw.entries[idx]).find((k) => !nl.has(k)) ?? null); }
    } else {
      sfx.wrong();
      setShake(e.word); setTimeout(() => setShake(null), 500);
    }
  };

  const type = (ch: string) => {
    if (!entry || !cursor || lockedCells.has(cursor)) return;
    const next = new Map(typed); next.set(cursor, ch);
    setTyped(next);
    const i = entryCells.indexOf(cursor);
    const after = entryCells.slice(i + 1).find((k) => !lockedCells.has(k) && !next.get(k)) ?? entryCells.slice(i + 1).find((k) => !lockedCells.has(k)) ?? null;
    setCursor(after ?? cursor);
    checkEntry(entry, next);
  };
  const backspace = () => {
    if (!entry || !cursor) return;
    const next = new Map(typed);
    if (next.get(cursor) && !lockedCells.has(cursor)) next.delete(cursor);
    else { const i = entryCells.indexOf(cursor); const prev = entryCells.slice(0, i).reverse().find((k) => !lockedCells.has(k)); if (prev) { next.delete(prev); setCursor(prev); } }
    setTyped(next);
  };
  const hint = () => {
    if (!entry) return;
    // Staged: 1 = the first letter; 2 = the picture, or a sentence with the word left out; then a letter a press.
    const n = (stage.get(entry.word) ?? 0) + 1;
    setStage((m) => new Map(m).set(entry.word, n));
    setHintsUsed((h) => h + 1);
    const it = puzzle.byWord.get(entry.word);
    const hiddenPic = level === "hard" && !!it?.clue && !!it?.pic && !!pics[it.pic.toLowerCase()];
    if (n === 2 && (hiddenPic || it?.example)) { sfx.tick(); return; }
    const ks = cellsOf(entry);
    const wrong = (x: string, i: number) => !lockedCells.has(x) && base(typed.get(x) ?? "") !== base(entry.letters[i]);
    const k = n === 1 ? ks.find(wrong) : (cursor && wrong(cursor, ks.indexOf(cursor))) ? cursor : ks.find(wrong);
    if (!k) return;
    const next = new Map(typed); next.set(k, entry.letters[ks.indexOf(k)]);
    setTyped(next); sfx.tick();
    checkEntry(entry, next);
  };

  const total = cw.entries.length;
  if (total > 0 && solved.size === total) {
    return <GameResult data={{ title: c.title, score: total, total, headline: c.done, note: lc.hints(hintsUsed) }} onExit={onExit} onReplay={() => { setTyped(new Map()); setSolved(new Set()); setStage(new Map()); setHintsUsed(0); setSeed((s) => s + 1); }} lang={lang} t={t} />;
  }
  if (!ready) return (
    <div className="wb-play-stage cw">
      <style>{CW_CSS + LEVEL_CSS}</style>
      <PlayHeader title={c.title} onExit={onExit} t={t} />
      <div className="pz-wait" dir={dirForLang(lang)}><WaitText text={lc.building} live /></div>
    </div>
  );
  if (!entry) return null;
  const item = puzzle.byWord.get(entry.word);
  const picUrl = item?.pic ? pics[item.pic.toLowerCase()] : undefined;
  const asked = stage.get(entry.word) ?? 0;
  // Easy: the picture IS the clue. Medium: the picture sits with the clue. Hard: the picture is the second hint.
  const pic = picUrl && (level !== "hard" || !item?.clue || asked >= 2) ? picUrl : undefined;
  const sentence = asked >= 2 && !(level === "hard" && item?.clue && picUrl) ? item?.example : undefined;
  const keys = rtl ? HE_KEYS : EN_KEYS;
  return (
    <div className="wb-play-stage cw">
      <style>{CW_CSS + LEVEL_CSS}</style>
      <PlayHeader title={c.title} progress={c.solved(solved.size, total)} onExit={onExit} t={t} />
      <div className="wb-play-question cw-q">
        <LevelChip level={level} onChange={onLevel} lang={lang} />
        <div className={`cw-clue${level === "easy" && pic ? " is-pic-first" : ""}`} dir={dirForLang(lang)}>
          <span className="cw-clue-num">{entry.number} {entry.dir === "across" ? c.across : c.down} · {entry.letters.length}</span>
          {item?.clue ? <span className="cw-clue-text"><QText text={nq(item.clue)} skip={[entry.word]} /></span> : <span className="cw-clue-text">{pic ? c.picClue : c.tapCell}</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {pic && <img className="cw-clue-pic" src={pic} alt="" width={120} height={120} draggable={false} />}
          {sentence && <span className="pz-hintbox" lang={wordLang} dir={dirForLang(wordLang)}><small dir={dirForLang(lang)}>{lc.sentence}</small>{nq(sentence)}</span>}
        </div>
        <div className="cw-grid" dir={rtl ? "rtl" : "ltr"} lang={wordLang} style={{ gridTemplateColumns: `repeat(${cw.cols}, minmax(0, 1fr))`, ["--cols" as string]: cw.cols }}>
          {cw.cells.map((row, r) => row.map((ch, cc) => {
            const k = cellKey(r, cc);
            if (ch === null) return <span key={k} className="cw-void" />;
            const num = cw.entries.find((e) => e.row === r && e.col === cc)?.number;
            const inEntry = entryCells.includes(k);
            const cls = `cw-cell${inEntry ? " is-entry" : ""}${cursor === k ? " is-cursor" : ""}${lockedCells.has(k) ? " is-solved" : ""}${shake && cellsOf(entry).includes(k) && shake === entry.word ? " is-shake" : ""}`;
            return (
              <button key={k} type="button" className={cls} onClick={() => tapCell(r, cc)}>
                {num && <i className="cw-num">{num}</i>}
                <span>{shown(r, cc)}</span>
              </button>
            );
          }))}
        </div>
        <div className="cw-keys" dir={rtl ? "rtl" : "ltr"} lang={wordLang}>
          {keys.map((row, i) => (
            <div key={i} className="cw-keyrow">
              {[...row].map((ch) => <button key={ch} type="button" className="cw-key" onClick={() => type(ch)}>{ch}</button>)}
              {i === keys.length - 1 && <button type="button" className="cw-key is-wide" onClick={backspace} aria-label="backspace">⌫</button>}
            </div>
          ))}
          <div className="cw-keyrow"><button type="button" className="cw-key is-hint" onClick={hint}>💡 {c.hint}</button></div>
        </div>
      </div>
    </div>
  );
}

const CW_CSS = `
/* On a phone the board is as wide as the panel lets it be: sized in vw it was wider than the panel and its far side was cut off. */
.cw .cw-q { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; justify-items: center; }
html body .wordbook .wst .cw-q { padding-inline: 10px; }
.cw-clue { display: grid; justify-items: center; gap: 6px; text-align: center; max-width: 52ch; }
.cw-clue-num { font-size: 13px; font-weight: 800; color: #0a7472; letter-spacing: 0.02em; }
.cw-clue-text { font-size: 18px; line-height: 1.5; color: #14202b; font-weight: 600; }
.cw-clue.is-pic-first .cw-clue-pic { order: -1; width: 150px; height: 150px; }
.cw-clue.is-pic-first .cw-clue-text { font-size: 15px; font-weight: 600; color: #374151; }
.cw-clue-pic { width: 120px; height: 120px; border-radius: 16px; box-shadow: 0 8px 18px #0003; object-fit: cover; }
.cw-grid { display: grid; gap: 3px; width: min(100%, 460px); padding: 8px; border-radius: 16px; background: #e9e3d4; box-shadow: inset 0 2px 8px #0002; }
.cw-void { aspect-ratio: 1; }
.cw-cell { position: relative; aspect-ratio: 1; min-width: 0; min-height: 0; display: grid; place-items: center; padding: 0; border: 0; border-radius: 7px; background: #fffdf6; font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: clamp(14px, calc(60vw / var(--cols)), 28px); color: #2b2418; line-height: 1; cursor: pointer; box-shadow: 0 1px 0 #0001; }
.cw-cell.is-entry { background: #fff3c4; }
.cw-cell.is-cursor { outline: 3px solid #f2b705; outline-offset: -3px; }
.cw-cell.is-solved { background: #d1fae5; color: #065f46; }
.cw-cell.is-shake { animation: cw-shake 0.45s; }
@keyframes cw-shake { 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
.cw-num { position: absolute; top: 2px; inset-inline-start: 4px; font-style: normal; font-size: 9px; font-weight: 700; color: #7a5326; line-height: 1; }
.cw-keys { display: grid; gap: 6px; width: min(100%, 520px); }
.cw-key { min-width: 0; }
.cw-keyrow { display: flex; justify-content: center; gap: 5px; }
.cw-key { flex: 1 1 0; max-width: 46px; min-height: 44px; border: 0; border-radius: 9px; background: #fff; box-shadow: 0 2px 0 #0002; font: inherit; font-weight: 700; font-size: 19px; color: #14202b; cursor: pointer; }
.cw-key:active { transform: translateY(1px); box-shadow: none; }
.cw-key.is-wide { max-width: 70px; }
.cw-key.is-hint { flex: 0 0 auto; max-width: none; padding: 0 18px; background: transparent; box-shadow: none; border: 1.5px solid #0a7472; color: #0a7472; border-radius: 999px; }
@media (prefers-reduced-motion: reduce) { .cw-cell.is-shake { animation: none; } }
`;
