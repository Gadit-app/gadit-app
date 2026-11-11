/**
 * Crossword (תשבץ) layouts (Gadi 2026-11-11, Osher's idea). A small, dense
 * grid where every word crosses another, built from the child's own words.
 *
 * Coordinates are in READING order: `col` grows along the direction the
 * language reads (for Hebrew, towards the left), so the layout does not care
 * about the script; the renderer flips the grid for right-to-left.
 *
 * The layout is greedy with restarts: the longest word goes first, every
 * next word is tried at every crossing with a letter already on the grid,
 * scored by crossings and compactness, and the best of several shuffled
 * attempts wins (most words placed, then the smallest box).
 */

import { gridLetters } from "./word-search";

export type Dir = "across" | "down";
export type Entry = { word: string; letters: string[]; row: number; col: number; dir: Dir; number: number };
export type Crossword = { rows: number; cols: number; cells: (string | null)[][]; entries: Entry[] };

type Placed = { word: string; letters: string[]; row: number; col: number; dir: Dir };

const SPAN = 40; // working canvas; the result is cropped
const rnd = (n: number) => Math.floor(Math.random() * n);

function layout(words: { word: string; letters: string[] }[]): Placed[] {
  const g = new Map<string, string>(); // "r,c" → letter
  const at = (r: number, c: number) => g.get(`${r},${c}`);
  const placed: Placed[] = [];
  const put = (p: Placed) => { placed.push(p); p.letters.forEach((ch, k) => g.set(p.dir === "across" ? `${p.row},${p.col + k}` : `${p.row + k},${p.col}`, ch)); };

  /** Can `letters` sit at (row,col,dir)? Returns the number of crossings, or -1. */
  const fits = (letters: string[], row: number, col: number, dir: Dir): number => {
    const n = letters.length;
    const dr = dir === "down" ? 1 : 0, dc = dir === "across" ? 1 : 0;
    const endR = row + dr * (n - 1), endC = col + dc * (n - 1);
    if (row < 0 || col < 0 || endR >= SPAN || endC >= SPAN) return -1;
    // the cell before the start and after the end must be empty
    if (at(row - dr, col - dc) || at(endR + dr, endC + dc)) return -1;
    let cross = 0;
    for (let k = 0; k < n; k++) {
      const r = row + dr * k, c = col + dc * k;
      const cur = at(r, c);
      if (cur) {
        if (cur !== letters[k]) return -1;
        cross++;
      } else {
        // a free cell must not touch another word sideways (it would form junk words)
        if (dir === "across" ? at(r - 1, c) || at(r + 1, c) : at(r, c - 1) || at(r, c + 1)) return -1;
      }
    }
    return cross;
  };

  const first = words[0];
  put({ word: first.word, letters: first.letters, row: SPAN >> 1, col: (SPAN >> 1) - (first.letters.length >> 1), dir: "across" });
  for (const w of words.slice(1)) {
    let best: { p: Placed; score: number } | null = null;
    for (const p of placed) {
      const dir: Dir = p.dir === "across" ? "down" : "across";
      for (let i = 0; i < p.letters.length; i++) {
        for (let k = 0; k < w.letters.length; k++) {
          if (p.letters[i] !== w.letters[k]) continue;
          const row = p.dir === "across" ? p.row - k : p.row + i;
          const col = p.dir === "across" ? p.col + i : p.col - k;
          const cross = fits(w.letters, row, col, dir);
          if (cross < 0) continue;
          // prefer more crossings and staying near the middle of the canvas
          const score = cross * 10 - Math.abs(row - (SPAN >> 1)) - Math.abs(col - (SPAN >> 1)) + rnd(3);
          if (!best || score > best.score) best = { p: { word: w.word, letters: w.letters, row, col, dir }, score };
        }
      }
    }
    if (best) put(best.p);
  }
  return placed;
}

/**
 * The best crossword for `words` (plain strings): as many of them as cross
 * into one connected grid, cropped and numbered. Words that could not be
 * crossed in are left out; `maxSide` caps the grid's width and height.
 */
export function makeCrossword(words: string[], opts: { rtl: boolean; maxSide: number; attempts?: number }): Crossword {
  const items = words.map((w) => ({ word: w, letters: gridLetters(w, opts.rtl) })).filter((x) => x.letters.length >= 2 && x.letters.length <= opts.maxSide);
  if (!items.length) return { rows: 0, cols: 0, cells: [], entries: [] };
  let bestPlaced: Placed[] = [];
  let bestArea = Infinity;
  const attempts = opts.attempts ?? 40;
  for (let a = 0; a < attempts; a++) {
    // longest first, the rest shuffled a little differently each time
    const sorted = items.slice().sort((x, y) => y.letters.length - x.letters.length + (rnd(3) - 1));
    // words that would push the box past the cap are dropped from this attempt
    const placed = trimTo(layout(sorted), opts.maxSide);
    const box = bounds(placed);
    const area = box.h * box.w;
    if (placed.length > bestPlaced.length || (placed.length === bestPlaced.length && area < bestArea)) { bestPlaced = placed; bestArea = area; }
  }
  return finish(bestPlaced);
}

function bounds(placed: Placed[]) {
  let r0 = Infinity, c0 = Infinity, r1 = -Infinity, c1 = -Infinity;
  for (const p of placed) {
    const er = p.dir === "down" ? p.row + p.letters.length - 1 : p.row;
    const ec = p.dir === "across" ? p.col + p.letters.length - 1 : p.col;
    r0 = Math.min(r0, p.row); c0 = Math.min(c0, p.col); r1 = Math.max(r1, er); c1 = Math.max(c1, ec);
  }
  return { r0, c0, r1, c1, h: r1 - r0 + 1, w: c1 - c0 + 1 };
}

/** Keep the first word and every later word that stays inside a maxSide box around it. */
function trimTo(placed: Placed[], maxSide: number): Placed[] {
  const out: Placed[] = [];
  for (const p of placed) {
    const b = bounds([...out, p]);
    if (b.h <= maxSide && b.w <= maxSide) out.push(p);
  }
  return out;
}

function finish(placed: Placed[]): Crossword {
  const b = bounds(placed);
  const rows = b.h, cols = b.w;
  const cells: (string | null)[][] = Array.from({ length: rows }, () => Array<string | null>(cols).fill(null));
  const shifted = placed.map((p) => ({ ...p, row: p.row - b.r0, col: p.col - b.c0 }));
  for (const p of shifted) p.letters.forEach((ch, k) => { if (p.dir === "across") cells[p.row][p.col + k] = ch; else cells[p.row + k][p.col] = ch; });
  // Numbers: reading order, one number per start cell (shared by an across and a down entry).
  const numberAt = new Map<string, number>();
  let n = 0;
  const starts = shifted.map((p) => `${p.row},${p.col}`);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = `${r},${c}`; if (starts.includes(k) && !numberAt.has(k)) numberAt.set(k, ++n); }
  const entries: Entry[] = shifted.map((p) => ({ word: p.word, letters: p.letters, row: p.row, col: p.col, dir: p.dir, number: numberAt.get(`${p.row},${p.col}`)! }))
    .sort((x, y) => x.number - y.number || (x.dir === "across" ? -1 : 1));
  return { rows, cols, cells, entries };
}
