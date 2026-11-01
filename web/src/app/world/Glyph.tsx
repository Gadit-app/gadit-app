"use client";

/**
 * A letter centred by its ink, not by its text box (Gadi 2026-11-01: the
 * Hebrew letters sat off-centre on the door plaques). Every script puts its
 * letters at a different height inside the line (Hebrew has no descenders,
 * Hindi hangs from a top line, Thai stacks marks), so the glyph is measured
 * on a canvas in the same font and shifted until the middle of what you see
 * is the middle of the box. Rendered as a 1em-high block: centre the block
 * and the letter is centred.
 */
import { useLayoutEffect, useRef, useState } from "react";

const cache = new Map<string, { dx: number; dy: number }>();
let ctx: CanvasRenderingContext2D | null | undefined;

/** How far (in em) to move the letter so its ink sits in the middle of a 1em box. */
export function inkOffset(text: string, family: string, weight: string): { dx: number; dy: number } {
  const key = `${weight}|${family}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (ctx === undefined) ctx = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  if (!ctx) return { dx: 0, dy: 0 };
  const S = 100;
  ctx.font = `${weight} ${S}px ${family}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.direction = "ltr";
  const m = ctx.measureText(text);
  const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
  if (!(fa > 0) || !(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent > 0)) return { dx: 0, dy: 0 };
  // line-height 1: the font's ascent+descent sits centred in the 1em line.
  const baseline = (S - (fa + fd)) / 2 + fa;
  const inkCy = baseline + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
  const inkCx = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const out = { dx: (m.width / 2 - inkCx) / S, dy: (S / 2 - inkCy) / S };
  cache.set(key, out);
  return out;
}

export function Glyph({ ch, className }: { ch: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [off, setOff] = useState<{ dx: number; dy: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !ch) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      return inkOffset(ch, cs.fontFamily, cs.fontWeight);
    };
    let alive = true;
    // The page font may still be loading: measure again once it has.
    const ready = document.fonts?.ready;
    if (ready && document.fonts.status !== "loaded") {
      ready.then(() => { if (alive) setOff(measure()); });
    } else {
      queueMicrotask(() => { if (alive) setOff(measure()); });
    }
    return () => { alive = false; };
  }, [ch]);
  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: "block",
        lineHeight: 1,
        textAlign: "center",
        transform: off ? `translate(${off.dx.toFixed(3)}em, ${off.dy.toFixed(3)}em)` : undefined,
        visibility: off || !ch ? undefined : "hidden",
      }}
    >
      {ch}
    </span>
  );
}
