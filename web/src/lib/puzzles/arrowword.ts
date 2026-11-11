/**
 * Arrowword (תשחץ) layouts (Gadi 2026-11-11, Osher's idea): a crossword whose
 * clues sit INSIDE the grid, in a shaded cell next to each word's first
 * letter, with an arrow showing which way the word runs. The way Israeli
 * newspapers print them.
 *
 * Built on the crossword layout: the grid gets one extra row on top and one
 * extra column at the reading start, so every word has room for a clue cell.
 * A word reads from the cell after its clue: an across word takes the cell
 * before its start (straight arrow) or the cell above it (an arrow that
 * turns down and along); a down word takes the cell above (straight) or the
 * cell beside it (an arrow that turns along and down). A clue cell can hold
 * two clues, split top and bottom. A word that finds no free clue cell keeps
 * its clue in the panel only.
 */

import { makeCrossword, type Dir, type Entry } from "./crossword";

export type ArrowKind = "straight" | "bent";
export type ClueSlot = { entry: number; dir: Dir; kind: ArrowKind };
export type Arrowword = {
  rows: number; cols: number;
  /** letter, or null for a cell that is not part of a word (clue cells included) */
  cells: (string | null)[][];
  entries: Entry[];
  /** "row,col" → the one or two clues written in that cell */
  clueCells: Map<string, ClueSlot[]>;
  /** entries (by index) that got no cell and show their clue in the panel only */
  panelOnly: Set<number>;
};

const key = (r: number, c: number) => `${r},${c}`;

export function makeArrowword(words: string[], opts: { rtl: boolean; maxSide: number }): Arrowword {
  const cw = makeCrossword(words, { rtl: opts.rtl, maxSide: opts.maxSide - 1 });
  const rows = cw.rows + 1, cols = cw.cols + 1;
  const cells: (string | null)[][] = Array.from({ length: rows }, () => Array<string | null>(cols).fill(null));
  for (let r = 0; r < cw.rows; r++) for (let c = 0; c < cw.cols; c++) cells[r + 1][c + 1] = cw.cells[r][c];
  const entries: Entry[] = cw.entries.map((e) => ({ ...e, row: e.row + 1, col: e.col + 1 }));
  const clueCells = new Map<string, ClueSlot[]>();
  const panelOnly = new Set<number>();
  const isLetter = (r: number, c: number) => r >= 0 && c >= 0 && r < rows && c < cols && cells[r][c] !== null;
  const order = entries.map((e, i) => i).sort((a, b) => entries[b].letters.length - entries[a].letters.length);
  for (const i of order) {
    const e = entries[i];
    const cands: Array<{ r: number; c: number; kind: ArrowKind }> = e.dir === "across"
      ? [{ r: e.row, c: e.col - 1, kind: "straight" }, { r: e.row - 1, c: e.col, kind: "bent" }]
      : [{ r: e.row - 1, c: e.col, kind: "straight" }, { r: e.row, c: e.col - 1, kind: "bent" }];
    const spot = cands.find((x) => !isLetter(x.r, x.c) && (clueCells.get(key(x.r, x.c))?.length ?? 0) < 2);
    if (!spot) { panelOnly.add(i); continue; }
    const k = key(spot.r, spot.c);
    clueCells.set(k, [...(clueCells.get(k) ?? []), { entry: i, dir: e.dir, kind: spot.kind }]);
  }
  return { rows, cols, cells, entries, clueCells, panelOnly };
}
