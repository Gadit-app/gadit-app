/**
 * Word-search (תפזורת) grids, Hebrew or English (Gadi 2026-11-11, an idea
 * that started with Osher wanting to do a crossword).
 *
 * Words are hidden in straight lines; in Hebrew a word reads right to left,
 * so its "forward" directions run leftwards. Words may share a letter where
 * they cross. The rest of the grid is filled with letters that look like the
 * words' own, so a hidden word does not stand out.
 */

export type Cell = [row: number, col: number];
export type PlacedWord = { word: string; cells: Cell[] };
export type WordSearch = { size: number; grid: string[][]; placed: PlacedWord[] };

const HEBREW_LETTERS = "אבגדהוזחטיכלמנסעפצקרשת".split("");
const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NIQQUD = /[֑-ׇ]/g;

/** The letters of a word as grid cells: no vowel signs, no spaces, English in capitals. */
export function gridLetters(word: string, rtl: boolean): string[] {
  const w = rtl ? word.normalize("NFC").replace(NIQQUD, "") : word.toUpperCase();
  return [...w].filter((ch) => (rtl ? /[א-ת]/ : /[A-Z]/).test(ch));
}

/** Reading-direction steps: [dRow, dCol]. Hebrew reads leftwards. */
function directions(rtl: boolean, backwards: boolean): Cell[] {
  const across = rtl ? -1 : 1;
  const fwd: Cell[] = [[0, across], [1, 0], [1, across]];
  if (!backwards) return fwd;
  return [...fwd, [0, -across], [-1, 0], [-1, -across], [1, -across], [-1, across]];
}

const rnd = (n: number) => Math.floor(Math.random() * n);

/**
 * Hides as many of `words` as fit (longest first) in a size×size grid.
 * `words` are plain strings; letters are taken with gridLetters(). Returns
 * the grid and where each hidden word is; words that did not fit are left out.
 */
export function makeWordSearch(words: string[], size: number, opts: { rtl: boolean; backwards: boolean }): WordSearch {
  const dirs = directions(opts.rtl, opts.backwards);
  const grid: string[][] = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const placed: PlacedWord[] = [];
  const items = words
    .map((w) => ({ word: w, letters: gridLetters(w, opts.rtl) }))
    .filter((x) => x.letters.length >= 2 && x.letters.length <= size)
    .sort((a, b) => b.letters.length - a.letters.length);

  for (const it of items) {
    let done = false;
    for (let attempt = 0; attempt < 200 && !done; attempt++) {
      const [dr, dc] = dirs[rnd(dirs.length)];
      const n = it.letters.length;
      const r0 = rnd(size), c0 = rnd(size);
      const rEnd = r0 + dr * (n - 1), cEnd = c0 + dc * (n - 1);
      if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
      const cells: Cell[] = [];
      let ok = true, overlaps = 0;
      for (let k = 0; k < n; k++) {
        const r = r0 + dr * k, c = c0 + dc * k;
        const cur = grid[r][c];
        if (cur && cur !== it.letters[k]) { ok = false; break; }
        if (cur) overlaps++;
        cells.push([r, c]);
      }
      if (!ok || overlaps === n) continue; // a word fully on top of another is not hidden
      for (let k = 0; k < n; k++) grid[cells[k][0]][cells[k][1]] = it.letters[k];
      placed.push({ word: it.word, cells });
      done = true;
    }
  }
  // Fill: mostly the words' own letters, with the alphabet mixed in.
  const alphabet = opts.rtl ? HEBREW_LETTERS : ENGLISH_LETTERS;
  const own = placed.flatMap((p) => gridLetters(p.word, opts.rtl)).filter((ch) => !/[ךםןףץ]/.test(ch));
  const pool = [...own, ...own, ...alphabet];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = pool[rnd(pool.length)];
  return { size, grid, placed };
}

/** The straight line of cells from a to b, or null when they are not aligned. */
export function lineBetween(a: Cell, b: Cell): Cell[] | null {
  const dr = Math.sign(b[0] - a[0]), dc = Math.sign(b[1] - a[1]);
  const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
  if (dr !== 0 && dc !== 0 && Math.abs(b[0] - a[0]) !== Math.abs(b[1] - a[1])) return null;
  const out: Cell[] = [];
  for (let k = 0; k <= len; k++) out.push([a[0] + dr * k, a[1] + dc * k]);
  return out;
}

const key = (cells: Cell[]) => cells.map((c) => `${c[0]},${c[1]}`).join("|");

/** The hidden word whose cells are exactly this line (either way round), or null. */
export function matchLine(cells: Cell[], placed: PlacedWord[]): PlacedWord | null {
  const k = key(cells), kr = key(cells.slice().reverse());
  return placed.find((p) => { const pk = key(p.cells); return pk === k || pk === kr; }) ?? null;
}
