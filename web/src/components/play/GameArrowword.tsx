"use client";

/**
 * Arrowword, תשחץ (Gadi 2026-11-11, Osher's idea). Like the crossword, but
 * the clues sit inside the grid: a shaded cell next to each word's first
 * letter holds a short clue and an arrow showing where the word runs, the
 * way Israeli newspapers print them. The short clues are written once per
 * word by /api/play/arrow-clues (1-4 words, never the word itself) and kept;
 * until they arrive, or for words that got none, the first words of the
 * meaning stand in. Tapping a clue cell (or any letter of the word) selects
 * the word and shows the full clue and picture in the panel. Typing, the
 * on-screen keyboard, the gentle checking and the hint are the crossword's.
 */

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang, shuffle, wordLangOf } from "@/lib/play-engine";
import { readKidsMode } from "@/lib/use-kids-mode";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { gridLetters } from "@/lib/puzzles/word-search";
import type { Entry } from "@/lib/puzzles/crossword";
import { makeArrowword, type ArrowKind } from "@/lib/puzzles/arrowword";
import { useNiqqud } from "@/lib/niqqud-display";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { QText } from "./QText";

type Copy = { title: string; desc: string; hint: string; done: string; solved: (n: number, of: number) => string; picClue: string; tap: string };
const COPY: Record<string, Copy> = {
  he: { title: "תשחצים", desc: "ההגדרות בתוך הלוח, עם חץ לכיוון המילה. כמו בעיתון, עם המילים שלכם", hint: "אות", done: "פתרתם את התשחץ", solved: (n, of) => `${n} מתוך ${of}`, picClue: "מה רואים בתמונה?", tap: "לוחצים על הגדרה או על משבצת" },
  en: { title: "Arrowwords", desc: "The clues sit inside the grid, with an arrow to the word. Like a newspaper, with your words", hint: "Letter", done: "You solved the arrowword", solved: (n, of) => `${n} of ${of}`, picClue: "What is in the picture?", tap: "Tap a clue or a square" },
  ar: { title: "الكلمات المسهّمة", desc: "التعريفات داخل الشبكة، مع سهم نحو الكلمة. كما في الجريدة، بكلماتك", hint: "حرف", done: "حللت اللغز", solved: (n, of) => `${n} من ${of}`, picClue: "ماذا ترى في الصورة؟", tap: "اضغط على تعريف أو مربع" },
  ru: { title: "Сканворд", desc: "Подсказки внутри сетки, со стрелкой к слову. Как в газете, с твоими словами", hint: "Буква", done: "Ты решил сканворд", solved: (n, of) => `${n} из ${of}`, picClue: "Что на картинке?", tap: "Нажми на подсказку или клетку" },
};
export const arrowwordCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

type Item = { word: string; lang: "he" | "en"; clue: string; pic?: string };
const FINAL: Record<string, string> = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
const base = (ch: string) => FINAL[ch] ?? ch.toUpperCase();
const HE_KEYS = ["קראטופ", "שדגכעיחל", "זסבהנמצת"];
const EN_KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function shortClue(meaning: string): string {
  const m = meaning.replace(/\s+/g, " ").trim();
  const cut = m.split(/[.;:!?]|, /)[0].trim();
  const words = cut.split(" ");
  return words.length > 12 ? words.slice(0, 12).join(" ") + "…" : cut;
}
/** What fits in a clue cell: the arrowword clue, else the first words of the meaning. */
const cellClue = (short: string | undefined, clue: string) => short || clue.split(" ").slice(0, 3).join(" ");

function pickItems(pool: PlayWord[], ui: string, maxLen: number, n: number): Item[] {
  const groups = new Map<"he" | "en", Item[]>();
  for (const p of pool) {
    const w = p.word.trim();
    const l = wordLangOf(p);
    if (!/^[\p{L}֑-ׇ]+$/u.test(w) || (l !== "he" && l !== "en")) continue;
    const len = gridLetters(w, l === "he").length;
    if (len < 3 || len > maxLen) continue;
    const clue = shortClue(p.meaning ?? "");
    const pic = p.picWord ?? (l === "en" ? w : undefined);
    if (!clue && !pic) continue;
    const g = groups.get(l) ?? [];
    if (!g.some((x) => x.word.toLowerCase() === w.toLowerCase())) g.push({ word: w, lang: l, clue, pic });
    groups.set(l, g);
  }
  let best: Item[] = [];
  for (const [l, g] of groups) if (g.length > best.length || (g.length === best.length && l === ui)) best = g;
  if (best.length >= 5) return shuffle(best).slice(0, n + 4);
  const he = ui === "he";
  const bank: Item[] = he
    ? HEBREW_BANK.filter((x) => !/[\s-]/.test(x.w) && x.en).map((x) => ({ word: x.w, lang: "he" as const, clue: "", pic: x.en }))
    : ENGLISH_BANK.filter((x) => !/[\s'-]/.test(x.w)).map((x) => ({ word: x.w, lang: "en" as const, clue: ui === "ar" ? x.ar : ui === "ru" ? x.ru : "", pic: x.w }));
  const fits = bank.filter((x) => { const k = gridLetters(x.word, x.lang === "he").length; return k >= 3 && k <= maxLen; });
  return shuffle([...best, ...shuffle(fits).slice(0, n + 4)]).slice(0, n + 2);
}

const cellKey = (r: number, c: number) => `${r},${c}`;
const cellsOf = (e: Entry) => e.letters.map((_, k) => (e.dir === "across" ? cellKey(e.row, e.col + k) : cellKey(e.row + k, e.col)));

/** The arrow drawn in a clue cell: straight along or down, or turning into the word. */
function Arrow({ dir, kind, rtl }: { dir: "across" | "down"; kind: ArrowKind; rtl: boolean }) {
  const s = rtl ? -1 : 1; // across runs leftwards in Hebrew
  const head = (x: number, y: number, dx: number, dy: number) => `M${x - dx * 3 - dy * 3} ${y - dy * 3 + dx * 3} L${x} ${y} L${x - dx * 3 + dy * 3} ${y - dy * 3 - dx * 3}`;
  let d: string;
  if (dir === "across" && kind === "straight") d = `M${12 - 8 * s} 12 L${12 + 8 * s} 12 ${head(12 + 8 * s, 12, s, 0)}`;          // → along the row
  else if (dir === "down" && kind === "straight") d = `M12 4 L12 20 ${head(12, 20, 0, 1)}`;                                        // ↓ down the column
  else if (dir === "across") d = `M12 3 L12 12 L${12 + 8 * s} 12 ${head(12 + 8 * s, 12, s, 0)}`;                                   // from above: down, then along
  else d = `M${12 - 8 * s} 12 L12 12 L12 20 ${head(12, 20, 0, 1)}`;                                                                // from the side: along, then down
  return <svg className={`aw-arrow is-${dir}-${kind}`} viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}

export function GameArrowword({ pool, onExit, lang, t }: { pool: PlayWord[]; onExit: () => void; lang: string; t: PlayT }) {
  const c = arrowwordCopy(lang);
  const { user } = useAuth();
  const { nq } = useNiqqud();
  const [kids] = useState(() => readKidsMode());
  const maxSide = kids ? 9 : 13;
  const [seed, setSeed] = useState(0);
  const [startPool] = useState(pool);
  const puzzle = useMemo(() => {
    const items = pickItems(startPool, lang, kids ? 6 : maxSide - 1, kids ? 5 : 8);
    const rtl = (items[0]?.lang ?? (lang === "he" ? "he" : "en")) === "he";
    const aw = makeArrowword(items.map((x) => x.word), { rtl, maxSide });
    const byWord = new Map(items.map((x) => [x.word, x]));
    return { aw, rtl, byWord };
  }, [startPool, lang, maxSide, kids, seed]);
  const { aw, rtl } = puzzle;
  const [typed, setTyped] = useState<Map<string, string>>(new Map());
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [pics, setPics] = useState<Record<string, string>>({});
  const [short, setShort] = useState<Record<string, string>>({});
  const wordLang = rtl ? "he" : "en";

  // pictures and the short in-grid clues, both cached on the server
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const words = aw.entries.map((e) => e.word);
    const want = [...new Set(words.map((w) => puzzle.byWord.get(w)?.pic).filter((x): x is string => !!x))];
    void (async () => {
      try {
        const tok = await user.getIdToken();
        const [pr, cr] = await Promise.all([
          want.length ? fetch("/api/play/images", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ words: want }) }) : null,
          fetch("/api/play/arrow-clues", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` }, body: JSON.stringify({ words, lang: wordLang }) }),
        ]);
        if (!alive) return;
        if (pr?.ok) { const got = ((await pr.json()) as { images?: Record<string, string> }).images ?? {}; const out: Record<string, string> = {}; for (const [k, v] of Object.entries(got)) out[k.toLowerCase()] = v; setPics(out); }
        if (cr.ok) setShort(((await cr.json()) as { clues?: Record<string, string> }).clues ?? {});
      } catch { /* the meaning's first words stand in */ }
    })();
    return () => { alive = false; };
  }, [user, aw, puzzle.byWord, wordLang]);

  useEffect(() => { const e = aw.entries[0]; if (e) { setSel(0); setCursor(cellsOf(e)[0]); } }, [aw]);

  const entry = aw.entries[sel];
  const entryCells = entry ? cellsOf(entry) : [];
  const lockedCells = useMemo(() => { const s = new Set<string>(); for (const e of aw.entries) if (solved.has(e.word)) for (const k of cellsOf(e)) s.add(k); return s; }, [aw, solved]);
  const shown = (r: number, cc: number) => lockedCells.has(cellKey(r, cc)) ? aw.cells[r][cc] ?? "" : typed.get(cellKey(r, cc)) ?? "";

  const select = (i: number, k?: string) => { setSel(i); setCursor(k ?? cellsOf(aw.entries[i]).find((x) => !lockedCells.has(x)) ?? cellsOf(aw.entries[i])[0]); sfx.tap(); };
  const tapCell = (r: number, cc: number) => {
    const k = cellKey(r, cc);
    const here = aw.entries.map((e, i) => ({ e, i })).filter((x) => cellsOf(x.e).includes(k));
    if (!here.length) return;
    const cur = here.find((x) => x.i === sel);
    const next = cur && here.length > 1 ? here.find((x) => x.i !== sel)! : (cur ?? here[0]);
    select(next.i, k);
  };

  const checkEntry = (e: Entry, letters: Map<string, string>) => {
    const ks = cellsOf(e);
    if (ks.some((k) => !lockedCells.has(k) && !letters.get(k))) return;
    const ok = ks.every((k, i) => lockedCells.has(k) || base(letters.get(k) ?? "") === base(e.letters[i]));
    if (ok) {
      sfx.correct();
      setSolved((s) => { const n = new Set(s); n.add(e.word); return n; });
      const idx = aw.entries.findIndex((x, i) => i !== sel && !solved.has(x.word) && x.word !== e.word);
      if (idx >= 0) { setSel(idx); setCursor(cellsOf(aw.entries[idx]).find((k) => !lockedCells.has(k)) ?? null); }
    } else { sfx.wrong(); setShake(e.word); setTimeout(() => setShake(null), 500); }
  };
  const type = (ch: string) => {
    if (!entry || !cursor || lockedCells.has(cursor)) return;
    const next = new Map(typed); next.set(cursor, ch); setTyped(next);
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
    const ks = cellsOf(entry);
    const k = (cursor && !lockedCells.has(cursor) && base(typed.get(cursor) ?? "") !== base(entry.letters[ks.indexOf(cursor)])) ? cursor : ks.find((x, i) => !lockedCells.has(x) && base(typed.get(x) ?? "") !== base(entry.letters[i]));
    if (!k) return;
    const next = new Map(typed); next.set(k, entry.letters[ks.indexOf(k)]); setTyped(next); sfx.tick();
    checkEntry(entry, next);
  };

  const total = aw.entries.length;
  if (total > 0 && solved.size === total) {
    return <GameResult data={{ title: c.title, score: total, total, headline: c.done }} onExit={onExit} onReplay={() => { setTyped(new Map()); setSolved(new Set()); setSeed((s) => s + 1); }} lang={lang} t={t} />;
  }
  if (!entry) return null;
  const item = puzzle.byWord.get(entry.word);
  const pic = item?.pic ? pics[item.pic.toLowerCase()] : undefined;
  const keys = rtl ? HE_KEYS : EN_KEYS;
  const panelClue = short[entry.word] || item?.clue || "";
  return (
    <div className="wb-play-stage aw">
      <style>{AW_CSS}</style>
      <PlayHeader title={c.title} progress={c.solved(solved.size, total)} onExit={onExit} t={t} />
      <div className="wb-play-question aw-q">
        <div className="aw-panel" dir={dirForLang(lang)}>
          {panelClue ? <span className="aw-panel-text" lang={wordLang} dir={dirForLang(wordLang)}><QText text={nq(panelClue)} skip={[entry.word]} /></span> : <span className="aw-panel-text">{pic ? c.picClue : c.tap}</span>}
          <span className="aw-panel-len">{entry.letters.length}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {pic && <img className="aw-pic" src={pic} alt="" width={96} height={96} draggable={false} />}
        </div>
        <div className="aw-grid" dir={rtl ? "rtl" : "ltr"} lang={wordLang} style={{ gridTemplateColumns: `repeat(${aw.cols}, 1fr)`, ["--cols" as string]: aw.cols }}>
          {aw.cells.map((row, r) => row.map((ch, cc) => {
            const k = cellKey(r, cc);
            const slots = aw.clueCells.get(k);
            if (ch === null && !slots) return <span key={k} className="aw-void" />;
            if (ch === null && slots) {
              return (
                <span key={k} className={`aw-clue${slots.length > 1 ? " is-two" : ""}`}>
                  {slots.map((s) => {
                    const e = aw.entries[s.entry];
                    const it = puzzle.byWord.get(e.word);
                    const text = cellClue(short[e.word], it?.clue ?? "");
                    const on = s.entry === sel;
                    return (
                      <button key={s.entry} type="button" className={`aw-clue-part${on ? " is-on" : ""}${solved.has(e.word) ? " is-solved" : ""}`} onClick={() => select(s.entry)}>
                        <span className="aw-clue-text">{text || "🖼"}</span>
                        <Arrow dir={s.dir} kind={s.kind} rtl={rtl} />
                      </button>
                    );
                  })}
                </span>
              );
            }
            const inEntry = entryCells.includes(k);
            const cls = `aw-cell${inEntry ? " is-entry" : ""}${cursor === k ? " is-cursor" : ""}${lockedCells.has(k) ? " is-solved" : ""}${shake === entry.word && inEntry ? " is-shake" : ""}`;
            return <button key={k} type="button" className={cls} onClick={() => tapCell(r, cc)}><span>{shown(r, cc)}</span></button>;
          }))}
        </div>
        <div className="aw-keys" dir={rtl ? "rtl" : "ltr"} lang={wordLang}>
          {keys.map((row, i) => (
            <div key={i} className="aw-keyrow">
              {[...row].map((ch) => <button key={ch} type="button" className="aw-key" onClick={() => type(ch)}>{ch}</button>)}
              {i === keys.length - 1 && <button type="button" className="aw-key is-wide" onClick={backspace} aria-label="backspace">⌫</button>}
            </div>
          ))}
          <div className="aw-keyrow"><button type="button" className="aw-key is-hint" onClick={hint}>💡 {c.hint}</button></div>
        </div>
      </div>
    </div>
  );
}

const AW_CSS = `
.aw .aw-q { display: grid; gap: 12px; justify-items: center; }
.aw-panel { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; text-align: center; max-width: 56ch; min-height: 40px; }
.aw-panel-text { font-size: 18px; line-height: 1.5; font-weight: 700; color: #14202b; }
.aw-panel-len { font-size: 12px; font-weight: 800; color: #fff; background: #0a7472; border-radius: 999px; padding: 2px 8px; }
.aw-pic { width: 96px; height: 96px; border-radius: 14px; box-shadow: 0 8px 18px #0003; object-fit: cover; }
.aw-grid { display: grid; gap: 2px; width: min(94vw, 520px); padding: 6px; border-radius: 14px; background: #e9e3d4; box-shadow: inset 0 2px 8px #0002; }
.aw-void { aspect-ratio: 1; }
.aw-cell { position: relative; aspect-ratio: 1; display: grid; place-items: center; padding: 0; border: 0; border-radius: 5px; background: #fffdf6; font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: clamp(13px, calc(58vw / var(--cols)), 26px); color: #2b2418; line-height: 1; cursor: pointer; box-shadow: 0 1px 0 #0001; }
.aw-cell.is-entry { background: #fff3c4; }
.aw-cell.is-cursor { outline: 3px solid #f2b705; outline-offset: -3px; }
.aw-cell.is-solved { background: #d1fae5; color: #065f46; }
.aw-cell.is-shake { animation: aw-shake 0.45s; }
@keyframes aw-shake { 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
/* a clue cell: shaded, tiny text, the arrow in the corner nearest the word */
.aw-clue { aspect-ratio: 1; display: grid; border-radius: 5px; background: #d6ccb6; overflow: hidden; }
.aw-clue.is-two { grid-template-rows: 1fr 1fr; }
.aw-clue-part { position: relative; display: grid; place-items: center; padding: 2px 3px; border: 0; background: transparent; color: #3d2f17; cursor: pointer; min-height: 0; }
.aw-clue.is-two .aw-clue-part + .aw-clue-part { border-top: 1px solid #b9ad92; }
.aw-clue-part.is-on { background: #f2b705; }
.aw-clue-part.is-solved { color: #4f7a5d; }
.aw-clue-text { font-size: clamp(7px, calc(14vw / var(--cols)), 11px); font-weight: 700; line-height: 1.1; text-align: center; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word; }
.aw-arrow { position: absolute; bottom: 1px; inset-inline-end: 1px; opacity: 0.9; }
.aw-arrow.is-down-straight, .aw-arrow.is-across-bent { bottom: 1px; }
.aw-keys { display: grid; gap: 6px; width: min(96vw, 520px); }
.aw-keyrow { display: flex; justify-content: center; gap: 5px; }
.aw-key { flex: 1 1 0; max-width: 46px; min-height: 44px; border: 0; border-radius: 9px; background: #fff; box-shadow: 0 2px 0 #0002; font: inherit; font-weight: 700; font-size: 19px; color: #14202b; cursor: pointer; }
.aw-key:active { transform: translateY(1px); box-shadow: none; }
.aw-key.is-wide { max-width: 70px; }
.aw-key.is-hint { flex: 0 0 auto; max-width: none; padding: 0 18px; background: transparent; box-shadow: none; border: 1.5px solid #0a7472; color: #0a7472; border-radius: 999px; }
@media (prefers-reduced-motion: reduce) { .aw-cell.is-shake { animation: none; } }
`;
