/**
 * trace-letters — helpers for the homework "trace it" canvas (Gadi 2026-10-18):
 *  - where each English print letter starts, so the canvas can draw a small
 *    start dot with an arrow showing the first stroke's direction;
 *  - the joined (cursive) school handwriting font, loaded only when chosen;
 *  - the print/cursive switch labels in every UI language.
 */

/** The two English handwriting fonts, self-hosted and loaded only when a
 *  child traces an English word:
 *  - print: Andika (SIL, OFL), a font made for learning to read and write, with
 *    the handwritten one-story "a" and "g" instead of the computer ones;
 *  - cursive: joined US school handwriting (Playwrite US Trad, OFL). */
export const PRINT_FAMILY = "Gadit Print";
export const CURSIVE_FAMILY = "Gadit Cursive";
const FONT_FILES: Record<string, { url: string; weight: string }> = {
  [PRINT_FAMILY]: { url: "/fonts/andika-latin-700.woff2", weight: "700" },
  [CURSIVE_FAMILY]: { url: "/fonts/playwrite-us-trad-400.woff2", weight: "400" },
};
const fontReady: Record<string, Promise<boolean> | undefined> = {};
export function loadTraceFont(family: string): Promise<boolean> {
  if (typeof window === "undefined" || typeof FontFace === "undefined") return Promise.resolve(false);
  const f = FONT_FILES[family];
  if (!f) return Promise.resolve(false);
  if (!fontReady[family]) {
    fontReady[family] = (async () => {
      try {
        const face = new FontFace(family, `url(${f.url}) format('woff2')`, { weight: f.weight });
        await face.load();
        document.fonts.add(face);
        return true;
      } catch {
        fontReady[family] = undefined; // try again next time
        return false;
      }
    })();
  }
  return fontReady[family]!;
}

/** Plain English letters only (the start-point table covers a-z, A-Z). */
export const isLatinWord = (w: string) => /^[A-Za-z][A-Za-z '’-]*$/.test(w.trim());

/** Start point of a letter: fx = share of the letter's ink width from its left
 *  edge; from = measure down from the letter's top ("top") or from the
 *  x-height line ("x"); dy = how far down, in x-heights; ang = direction of the
 *  first stroke in degrees (0 right, 90 down, 180 left). */
type Start = { fx: number; from: "top" | "x"; dy: number; ang: number };
const s = (fx: number, from: "top" | "x", dy: number, ang: number): Start => ({ fx, from, dy, ang });
const DOWN = 90;
const ROUND = 200; // round letters start at the top right and go left (counterclockwise)

const STARTS: Record<string, Start> = {
  a: s(0.85, "x", 0.15, ROUND), b: s(0.12, "top", 0.05, DOWN), c: s(0.85, "x", 0.15, ROUND),
  d: s(0.7, "x", 0.12, ROUND), e: s(0.1, "x", 0.55, 0), f: s(0.85, "top", 0.1, ROUND),
  g: s(0.85, "x", 0.15, ROUND), h: s(0.12, "top", 0.05, DOWN), i: s(0.5, "x", 0.05, DOWN),
  j: s(0.7, "x", 0.05, DOWN), k: s(0.12, "top", 0.05, DOWN), l: s(0.5, "top", 0.05, DOWN),
  m: s(0.1, "x", 0.05, DOWN), n: s(0.1, "x", 0.05, DOWN), o: s(0.6, "x", 0.05, 190),
  p: s(0.12, "x", 0.05, DOWN), q: s(0.85, "x", 0.15, ROUND), r: s(0.12, "x", 0.05, DOWN),
  s: s(0.85, "x", 0.15, ROUND), t: s(0.45, "top", 0.05, DOWN), u: s(0.1, "x", 0.05, DOWN),
  v: s(0.06, "x", 0.05, 65), w: s(0.05, "x", 0.05, 70), x: s(0.08, "x", 0.05, 50),
  y: s(0.08, "x", 0.05, 65), z: s(0.08, "x", 0.05, 0),
  A: s(0.5, "top", 0.03, 115), B: s(0.1, "top", 0.05, DOWN), C: s(0.85, "top", 0.15, ROUND),
  D: s(0.1, "top", 0.05, DOWN), E: s(0.1, "top", 0.05, DOWN), F: s(0.1, "top", 0.05, DOWN),
  G: s(0.85, "top", 0.15, ROUND), H: s(0.1, "top", 0.05, DOWN), I: s(0.5, "top", 0.05, DOWN),
  J: s(0.75, "top", 0.05, DOWN), K: s(0.1, "top", 0.05, DOWN), L: s(0.1, "top", 0.05, DOWN),
  M: s(0.1, "top", 0.05, DOWN), N: s(0.1, "top", 0.05, DOWN), O: s(0.55, "top", 0.03, 190),
  P: s(0.1, "top", 0.05, DOWN), Q: s(0.55, "top", 0.03, 190), R: s(0.1, "top", 0.05, DOWN),
  S: s(0.85, "top", 0.15, ROUND), T: s(0.5, "top", 0.05, DOWN), U: s(0.1, "top", 0.05, DOWN),
  V: s(0.05, "top", 0.05, 70), W: s(0.05, "top", 0.05, 70), X: s(0.08, "top", 0.05, 55),
  Y: s(0.08, "top", 0.05, 55), Z: s(0.08, "top", 0.05, 0),
};

const ARROW_COLOR = "#E8735A";

/** A small dot at (x, y) with a short arrow in direction `ang`. */
export function drawStartArrow(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, size: number) {
  const r = Math.max(2.5, Math.min(4.5, size * 0.045));
  const len = Math.max(10, size * 0.2);
  const a = (ang * Math.PI) / 180;
  const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
  const head = Math.max(4, len * 0.38);
  ctx.save();
  ctx.fillStyle = ARROW_COLOR;
  ctx.strokeStyle = ARROW_COLOR;
  ctx.lineWidth = Math.max(1.6, size * 0.022);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - Math.cos(a - 0.5) * head, ey - Math.sin(a - 0.5) * head);
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - Math.cos(a + 0.5) * head, ey - Math.sin(a + 0.5) * head);
  ctx.stroke();
  ctx.restore();
}

/** Draws the start arrow of one print letter that was drawn with fillText at
 *  (x, baseline) in the context's current font. No-op for other characters. */
export function drawLetterStart(ctx: CanvasRenderingContext2D, ch: string, x: number, baseline: number, size: number) {
  const st = STARTS[ch];
  if (!st) return;
  const m = ctx.measureText(ch);
  const left = x - m.actualBoundingBoxLeft;
  const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const xh = ctx.measureText("x").actualBoundingBoxAscent;
  const top = st.from === "top" ? baseline - m.actualBoundingBoxAscent : baseline - xh;
  drawStartArrow(ctx, left + st.fx * width, top + st.dy * xh, st.ang, size);
}

/** Where a joined (cursive) word starts: most cursive letters begin with a
 *  lead-in stroke rising from the baseline, so we look for the first letter's
 *  leftmost ink and show the start dot there, pointing up and right. Letters
 *  whose leftmost ink is not near the baseline (the round a, c, d, g, o, q and
 *  capitals) get no arrow rather than a wrong one. */
export function drawCursiveStart(ctx: CanvasRenderingContext2D, word: string, x: number, baseline: number, size: number) {
  const ch = word.trim()[0];
  if (!ch || !/[a-z]/.test(ch)) return;
  const pad = Math.ceil(size * 0.5);
  const W = Math.ceil(size * 1.5) + pad * 2, H = Math.ceil(size * 2) + pad;
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const o = off.getContext("2d", { willReadFrequently: true });
  if (!o) return;
  o.font = ctx.font;
  o.textBaseline = "alphabetic";
  o.fillStyle = "#000";
  const by = Math.ceil(size * 1.3);
  o.fillText(ch, pad, by);
  const data = o.getImageData(0, 0, W, H).data;
  for (let cx = 0; cx < W; cx++) {
    let sum = 0, n = 0;
    for (let cy = 0; cy < H; cy++) if (data[(cy * W + cx) * 4 + 3] > 128) { sum += cy; n++; }
    if (!n) continue;
    const xh = ctx.measureText("x").actualBoundingBoxAscent;
    const dy = by - sum / n; // height of the leftmost ink above the baseline
    if (dy > xh * 0.25 || dy < -xh * 0.15) return; // not a lead-in rising from the baseline
    drawStartArrow(ctx, x + (cx - pad), baseline - dy, -40, size);
    return;
  }
}

/** Labels of the print/cursive switch (English handwriting styles). */
export const TRACE_STYLE_COPY: Record<string, { print: string; cursive: string }> = {
  en: { print: "Print", cursive: "Cursive" },
  he: { print: "דפוס", cursive: "כתב מחובר" },
  ar: { print: "حروف منفصلة", cursive: "خط متصل" },
  ru: { print: "Печатные", cursive: "Прописные" },
  es: { print: "Imprenta", cursive: "Cursiva" },
  pt: { print: "Bastão", cursive: "Cursiva" },
  fr: { print: "Script", cursive: "Cursive" },
  de: { print: "Druckschrift", cursive: "Schreibschrift" },
  cs: { print: "Tiskací", cursive: "Psací" },
  sk: { print: "Paličkové", cursive: "Písané" },
  it: { print: "Stampatello", cursive: "Corsivo" },
  ja: { print: "ブロック体", cursive: "筆記体" },
  hi: { print: "प्रिंट", cursive: "कर्सिव" },
  am: { print: "ተለያይቶ", cursive: "ተያይዞ" },
  uk: { print: "Друковані", cursive: "Писані" },
  tr: { print: "Ayrı harfler", cursive: "Bitişik yazı" },
  pl: { print: "Drukowane", cursive: "Pisane" },
  fa: { print: "حروف جدا", cursive: "خط پیوسته" },
  id: { print: "Huruf cetak", cursive: "Huruf sambung" },
  nl: { print: "Blokletters", cursive: "Schrijfletters" },
  el: { print: "Τυπογραφικά", cursive: "Καλλιγραφικά" },
  zu: { print: "Ezihlukene", cursive: "Ezixhumene" },
  vi: { print: "Chữ in", cursive: "Chữ viết liền" },
  fil: { print: "Magkahiwalay", cursive: "Kabit-kabit" },
  af: { print: "Drukskrif", cursive: "Lopende skrif" },
  sw: { print: "Herufi tenga", cursive: "Mwandiko wa kuunganisha" },
  "zh-CN": { print: "印刷体", cursive: "连写体" },
  "zh-TW": { print: "印刷體", cursive: "連寫體" },
  ko: { print: "인쇄체", cursive: "필기체" },
  th: { print: "ตัวพิมพ์", cursive: "ตัวเขียน" },
  bn: { print: "ছাপা অক্ষর", cursive: "টানা হাতের লেখা" },
  da: { print: "Blokbogstaver", cursive: "Sammenhængende skrift" },
  hu: { print: "Nyomtatott", cursive: "Folyóírás" },
  xh: { print: "Abahlukeneyo", cursive: "Odityanisiweyo" },
  nso: { print: "Tše arogilego", cursive: "Tše kopanego" },
  tn: { print: "Tse di kgaoganeng", cursive: "Tse di kopaneng" },
  st: { print: "Tse arohaneng", cursive: "Tse kopaneng" },
  ts: { print: "Leswi hambaneke", cursive: "Leswi hlanganeke" },
  ss: { print: "Letehlukene", cursive: "Letihlanganisiwe" },
  ve: { print: "Dzo fhambanaho", cursive: "Dzo ṱanganaho" },
  nr: { print: "Ezihlukeneko", cursive: "Ezihlangeneko" },
};
export const traceStyleCopy = (lang: string) => TRACE_STYLE_COPY[lang] ?? TRACE_STYLE_COPY.en;
