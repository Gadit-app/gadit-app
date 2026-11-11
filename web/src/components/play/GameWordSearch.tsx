"use client";

/**
 * Word search, תפזורת (Gadi 2026-11-11; the idea started with Osher wanting
 * to do a crossword). The child's own practice words hidden in a grid, Hebrew
 * (read right to left) or English; a finger dragged along a word finds it.
 * Kids Mode: a smaller grid, words only in reading directions. Grown-ups:
 * 10×10 with words also backwards and upwards. When the notebook has too few
 * single words, the bank of the UI language fills in, so the game always
 * has a puzzle. A found word shows its meaning for a moment.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang, shuffle, wordLangOf } from "@/lib/play-engine";
import { readKidsMode } from "@/lib/use-kids-mode";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { gridLetters, lineBetween, makeWordSearch, matchLine, type Cell, type PlacedWord } from "@/lib/puzzles/word-search";
import { useNiqqud } from "@/lib/niqqud-display";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { QText } from "./QText";
import { TTSButton } from "@/components/design/TTSButton";

type Copy = { title: string; desc: string; prompt: string; found: (n: number, of: number) => string; hint: string; done: string; wordsToFind: string };
const COPY: Record<string, Copy> = {
  he: { title: "תפזורת", desc: "המילים שלכם מוסתרות בלוח. גוררים אצבע על מילה כדי למצוא אותה", prompt: "גוררים אצבע על מילה שמצאתם בלוח", found: (n, of) => `נמצאו ${n} מתוך ${of}`, hint: "רמז", done: "מצאתם את כל המילים", wordsToFind: "המילים שמסתתרות" },
  en: { title: "Word Search", desc: "Your words are hidden in the grid. Drag a finger along a word to find it", prompt: "Drag your finger along a word you spot in the grid", found: (n, of) => `Found ${n} of ${of}`, hint: "Hint", done: "You found every word", wordsToFind: "Hidden words" },
  ar: { title: "البحث عن الكلمات", desc: "كلماتك مخفية في الشبكة. اسحب إصبعك على كلمة لتجدها", prompt: "اسحب إصبعك على كلمة تراها في الشبكة", found: (n, of) => `وجدت ${n} من ${of}`, hint: "تلميح", done: "وجدت كل الكلمات", wordsToFind: "الكلمات المخفية" },
  ru: { title: "Найди слово", desc: "Твои слова спрятаны в сетке. Проведи пальцем по слову, чтобы найти его", prompt: "Проведи пальцем по слову, которое заметил в сетке", found: (n, of) => `Найдено ${n} из ${of}`, hint: "Подсказка", done: "Ты нашёл все слова", wordsToFind: "Спрятанные слова" },
};
export const wordSearchCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

type Item = { word: string; meaning: string; lang: string };

/** Single words of one language from the pool (the language with the most), else the bank. */
function pickItems(pool: PlayWord[], ui: string, maxLen: number, n: number): Item[] {
  const groups = new Map<string, Item[]>();
  for (const p of pool) {
    const w = p.word.trim();
    const l = wordLangOf(p);
    if (!/^[\p{L}֑-ׇ]+$/u.test(w) || (l !== "he" && l !== "en")) continue;
    if (gridLetters(w, l === "he").length < 3 || gridLetters(w, l === "he").length > maxLen) continue;
    const g = groups.get(l) ?? [];
    if (!g.some((x) => x.word.toLowerCase() === w.toLowerCase())) g.push({ word: w, meaning: p.meaning, lang: l });
    groups.set(l, g);
  }
  let best: Item[] = [];
  for (const [l, g] of groups) if (g.length > best.length || (g.length === best.length && l === ui)) best = g;
  if (best.length >= 5) return shuffle(best).slice(0, n);
  // The bank of the UI language (English for every other UI), child-friendly words.
  const he = ui === "he";
  const bank: Item[] = he
    ? HEBREW_BANK.filter((x) => !/[\s-]/.test(x.w)).map((x) => ({ word: x.w, meaning: "", lang: "he" }))
    : ENGLISH_BANK.filter((x) => !/[\s'-]/.test(x.w)).map((x) => ({ word: x.w, meaning: ui === "ar" ? x.ar : ui === "ru" ? x.ru : ui === "he" ? x.he : "", lang: "en" }));
  const fits = bank.filter((x) => { const k = gridLetters(x.word, x.lang === "he").length; return k >= 3 && k <= maxLen; });
  return shuffle([...best, ...shuffle(fits).slice(0, n)]).slice(0, n);
}

const COLORS = ["#0EA5A5", "#F59E0B", "#8B5CF6", "#EC4899", "#22C55E", "#3B82F6", "#EF4444", "#14B8A6", "#F97316", "#6366F1"];

export function GameWordSearch({ pool, onExit, lang, t }: { pool: PlayWord[]; onExit: () => void; lang: string; t: PlayT }) {
  const c = wordSearchCopy(lang);
  const { nq } = useNiqqud();
  const [kids] = useState(() => readKidsMode());
  const size = kids ? 8 : 10;
  const [seed, setSeed] = useState(0);
  // The pool as it was when the game opened: a notebook refresh mid-game must not redraw the grid.
  const [startPool] = useState(pool);
  const puzzle = useMemo(() => {
    const items = pickItems(startPool, lang, size, kids ? 6 : 8);
    const rtl = (items[0]?.lang ?? (lang === "he" ? "he" : "en")) === "he";
    const ws = makeWordSearch(items.map((x) => x.word), size, { rtl, backwards: !kids });
    const byWord = new Map(items.map((x) => [x.word, x]));
    return { ...ws, rtl, items: ws.placed.map((p) => byWord.get(p.word)!).filter(Boolean) };
  }, [startPool, lang, size, kids, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [found, setFound] = useState<Map<string, number>>(new Map()); // word → colour index
  const [path, setPath] = useState<Cell[]>([]);
  const [flash, setFlash] = useState<Item | null>(null);
  const [hintCell, setHintCell] = useState<Cell | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const start = useRef<Cell | null>(null);
  // The line under the finger, also kept outside React state: pointerup can
  // arrive before the last move has rendered.
  const pathRef = useRef<Cell[]>([]);
  const wordLang = puzzle.rtl ? "he" : "en";

  // Geometry from the first and last cells (the grid has padding and gaps).
  const cellAt = useCallback((x: number, y: number): Cell | null => {
    const el = gridRef.current; if (!el || el.children.length < 2) return null;
    const first = el.children[0].getBoundingClientRect();
    const last = el.children[el.children.length - 1].getBoundingClientRect();
    const stepX = (last.left - first.left) / (size - 1), stepY = (last.top - first.top) / (size - 1);
    const col = Math.floor((x - first.left) / stepX), row = Math.floor((y - first.top) / stepY);
    if (row < 0 || col < 0 || row >= size || col >= size) return null;
    return [row, col];
  }, [size]);

  const onDown = (e: React.PointerEvent) => {
    const cell = cellAt(e.clientX, e.clientY); if (!cell) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = cell; pathRef.current = [cell]; setPath([cell]); sfx.tap();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const cell = cellAt(e.clientX, e.clientY); if (!cell) return;
    const line = lineBetween(start.current, cell);
    if (line) { pathRef.current = line; setPath(line); }
  };
  const onUp = () => {
    if (!start.current) return;
    const line = pathRef.current;
    const hit = line.length >= 2 ? matchLine(line, puzzle.placed) : null;
    start.current = null; pathRef.current = []; setPath([]);
    if (!hit || found.has(hit.word)) return;
    sfx.correct();
    const idx = found.size % COLORS.length;
    setFound((m) => new Map(m).set(hit.word, idx));
    const it = puzzle.items.find((x) => x.word === hit.word) ?? null;
    setFlash(it);
  };
  useEffect(() => { if (!flash) return; const tm = setTimeout(() => setFlash(null), 3500); return () => clearTimeout(tm); }, [flash]);

  const hint = () => {
    const left = puzzle.placed.filter((p) => !found.has(p.word));
    if (!left.length) return;
    const p = left[Math.floor(Math.random() * left.length)];
    setHintCell(p.cells[0]); sfx.tick();
    setTimeout(() => setHintCell(null), 1800);
  };

  const total = puzzle.placed.length;
  if (total > 0 && found.size === total) {
    return (
      <GameResult
        data={{ title: c.title, score: total, total, headline: c.done }}
        onExit={onExit}
        onReplay={() => { setFound(new Map()); setSeed((s) => s + 1); }}
        lang={lang}
        t={t}
      />
    );
  }
  const colorOf = new Map<string, number>();
  for (const p of puzzle.placed) { const ci = found.get(p.word); if (ci !== undefined) for (const [r, cc] of p.cells) colorOf.set(`${r},${cc}`, ci); }
  const inPath = new Set(path.map(([r, cc]) => `${r},${cc}`));
  return (
    <div className="wb-play-stage ws">
      <style>{WS_CSS}</style>
      <PlayHeader title={c.title} progress={c.found(found.size, total)} onExit={onExit} t={t} />
      <div className="wb-play-question ws-q">
        <div className="wb-play-question-eyebrow">{c.prompt}</div>
        <div
          ref={gridRef}
          className="ws-grid"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          dir="ltr"
          lang={wordLang}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        >
          {puzzle.grid.map((row, r) => row.map((ch, cc) => {
            const k = `${r},${cc}`;
            const ci = colorOf.get(k);
            const cls = `ws-cell${inPath.has(k) ? " is-path" : ""}${ci !== undefined ? " is-found" : ""}${hintCell && hintCell[0] === r && hintCell[1] === cc ? " is-hint" : ""}`;
            return <span key={k} className={cls} style={ci !== undefined ? { background: COLORS[ci] } : undefined}>{ch}</span>;
          }))}
        </div>
        <div className={`ws-flash${flash ? " is-on" : ""}`} dir={dirForLang(lang)} aria-live="polite">
          {flash && (
            <>
              <b lang={wordLang} dir={dirForLang(wordLang)}>{nq(flash.word)}</b>
              <TTSButton text={flash.word} audioLang={wordLang === "he" ? "he-IL" : "en-US"} ariaLabel={flash.word} className="wb-word-act-icon wb-play-speak" rate={0.85} />
              {flash.meaning && <span><QText text={nq(flash.meaning)} /></span>}
            </>
          )}
        </div>
        <div className="ws-words" dir={dirForLang(wordLang)} lang={wordLang}>
          <span className="ws-words-label">{c.wordsToFind}:</span>
          {puzzle.items.map((it) => {
            const ci = found.get(it.word);
            return <span key={it.word} className={`ws-chip${ci !== undefined ? " is-found" : ""}`} style={ci !== undefined ? { background: COLORS[ci] } : undefined}>{nq(it.word)}</span>;
          })}
        </div>
        <button type="button" className="ws-hint" onClick={hint}>💡 {c.hint}</button>
      </div>
    </div>
  );
}

const WS_CSS = `
.ws .ws-q { display: grid; gap: 12px; justify-items: center; }
.ws-grid { display: grid; gap: 3px; width: min(92vw, 460px); aspect-ratio: 1; touch-action: none; user-select: none; -webkit-user-select: none; padding: 8px; border-radius: 16px; background: #e9e3d4; box-shadow: inset 0 2px 8px #0002; }
.ws-cell { display: grid; place-items: center; border-radius: 8px; background: #fffdf6; font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: clamp(16px, 4.2vw, 26px); color: #2b2418; line-height: 1; transition: background 120ms, transform 120ms; }
.ws-cell.is-path { background: #ffe58a; transform: scale(0.94); }
.ws-cell.is-found { color: #fff; }
.ws-cell.is-hint { animation: ws-blink 0.45s ease-in-out 4; }
@keyframes ws-blink { 50% { background: #ffd23f; transform: scale(1.1); } }
.ws-flash { min-height: 44px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 18px; color: var(--wb-ink, #0f172a); opacity: 0; transition: opacity 200ms; max-width: 60ch; text-align: center; }
.ws-flash.is-on { opacity: 1; }
.ws-flash b { font-size: 24px; }
.ws-words { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 520px; }
.ws-words-label { align-self: center; font-size: 14px; color: var(--wb-ink-soft, #6B7280); font-weight: 700; }
.ws-chip { padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid var(--wb-border, #D1D5DB); font-weight: 700; font-size: 16px; color: var(--wb-ink, #0f172a); }
.ws-chip.is-found { color: #fff; border-color: transparent; text-decoration: line-through; opacity: 0.85; }
.ws-hint { font: inherit; font-weight: 700; padding: 8px 18px; border-radius: 999px; border: 1.5px solid var(--accent, #0EA5A5); background: transparent; color: var(--accent, #0EA5A5); cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .ws-cell { transition: none; } .ws-cell.is-hint { animation: none; background: #ffd23f; } }
`;
