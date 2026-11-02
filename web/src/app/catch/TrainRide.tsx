"use client";

/**
 * The city train (Gadi 2026-11-02), the catch game's second scene. The child
 * rides a tram through a cozy city; at every station two letter signs go by,
 * one on the far side of the track and one on the near platform. One carries
 * the NEXT letter of the word, the other a look-alike. Tap the right sign
 * before it passes; a missed one comes again at the next station. A wrong
 * sign falls over and the conductor cat or a pigeon says "That's k!"; after
 * two wrong taps on a letter the right signs glow.
 *
 * The train stays still and the city scrolls past it (one seamless mirrored
 * strip). Right-to-left words ride the other way. One animation loop moves the
 * city and the signs through refs; React renders only when a sign comes,
 * goes or is tapped. Same contract as the fireflies: onDone(wrongs).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { decoysFor, keyMatches, lettersOf, RTL_SPELL } from "@/lib/world/letters";
import { Glyph } from "../world/Glyph";
import type { TrailWord } from "../world/WorldClient";
import type { CatchCopy } from "./catch-i18n";
import { CatchHud } from "./CatchHud";

export const TRAIN_ART = "/catch/train";
const iso = (s: string) => `⁨${s}⁩`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* the train picture (640x313 after trim): its round window, in % of the picture */
const WIN = { x0: 16.1, x1: 33.6, y0: 30.4, y1: 65.8 };
const TRAIN_ASPECT = 640 / 313;
/* the sign picture (770x1332): a round plate on a pole; the plate's centre */
const SIGN_ASPECT = 770 / 1332;
const PLATE_Y = 28.9;

type Sign = { id: number; letter: string; side: "far" | "near"; state: "go" | "hit" | "miss" | "spent" };

export function TrainRide({ word, c, level, avatar, pic, onDone, onExit }: {
  word: TrailWord; c: CatchCopy; level: number; avatar: string; pic: string | null;
  onDone: (wrongs: number) => void; onExit: () => void;
}) {
  const rtl = RTL_SPELL.has(word.lang);
  const letters = useMemo(() => lettersOf(word.w, word.lang), [word]);

  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 740 });
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const geo = useMemo(() => {
    const W = size.w, H = size.h;
    const tw = clamp(Math.min(W * 0.72, H * 0.62 * TRAIN_ASPECT), 260, 560);
    const th = tw / TRAIN_ASPECT;
    const trainBottom = H * 0.8;
    const trainTop = trainBottom - th;
    const nearW = clamp(Math.min(W * 0.27, H - trainBottom - 14), 84, 140);
    const farW = clamp(W * 0.24, 84, 130);
    // A station passes every few seconds: a little sooner every word.
    const cross = clamp(5.2 - level * 0.3, 3.2, 5.2);
    return {
      W, H, tw, th, trainBottom, trainTop, trainX: W * 0.05, nearW, farW,
      farTop: trainTop - 8 - farW, nearTop: trainBottom + 6,
      speed: (W + nearW * 2) / cross, gap: cross * 0.55, tile: H * 3,
    };
  }, [size, level]);
  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [signs, setSigns] = useState<Sign[]>([]);
  const signsRef = useRef<Sign[]>([]);
  const xs = useRef(new Map<number, number>());
  const els = useRef(new Map<number, HTMLButtonElement>());
  const bgRef = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const nextId = useRef(1);
  const stationIn = useRef(0.4);
  const doneRef = useRef(false);
  const wrongs = useRef(0);
  const [miss, setMiss] = useState(0);
  const [peek, setPeek] = useState<{ letter: string; who: "cat" | "pigeon" } | null>(null);
  const peekTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const commit = (list: Sign[]) => { signsRef.current = list; setSigns(list); };

  const station = useCallback(() => {
    const g = geoRef.current;
    const target = letters[stepRef.current];
    if (!target) return;
    const decoy = decoysFor(target, word.lang, 1)[0] ?? target;
    const rightFar = Math.random() < 0.5;
    const a = nextId.current++, b = nextId.current++;
    // Both signs of a station stand at the same spot, ahead of the train.
    const x = g.W + 10;
    xs.current.set(a, x);
    xs.current.set(b, x + g.nearW * 0.35);
    commit([
      ...signsRef.current,
      { id: a, letter: rightFar ? target : decoy, side: "far", state: "go" },
      { id: b, letter: rightFar ? decoy : target, side: "near", state: "go" },
    ]);
  }, [letters, word.lang]);

  const remove = useCallback((id: number) => {
    xs.current.delete(id);
    els.current.delete(id);
    commit(signsRef.current.filter((s) => s.id !== id));
  }, []);

  /* the loop: the city and the signs slide toward the back of the train */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = geoRef.current;
      const v = doneRef.current ? g.speed * 0.35 : g.speed;
      scroll.current = (scroll.current + v * dt) % g.tile;
      if (bgRef.current) bgRef.current.style.backgroundPositionX = `${rtl ? scroll.current : -scroll.current}px`;
      if (!doneRef.current) {
        stationIn.current -= dt;
        if (stationIn.current <= 0) { station(); stationIn.current = g.gap; }
      }
      const gone: number[] = [];
      for (const s of signsRef.current) {
        const x0 = xs.current.get(s.id);
        if (x0 === undefined) continue;
        const x = x0 - v * dt;
        xs.current.set(s.id, x);
        const w = s.side === "far" ? g.farW : g.nearW;
        if (x < -w - 10) gone.push(s.id);
        const el = els.current.get(s.id);
        if (el) el.style.transform = `translate3d(${rtl ? g.W - x - w : x}px,0,0)`;
      }
      for (const id of gone) remove(id);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rtl, station, remove]);

  const tap = useCallback((id: number) => {
    if (doneRef.current) return;
    const s = signsRef.current.find((x) => x.id === id);
    if (!s || s.state !== "go") return;
    const target = letters[stepRef.current];
    if (s.letter === target) {
      sfx.letter(stepRef.current);
      // The rest of what is on screen is spent: the next station brings the next letter.
      commit(signsRef.current.map((x) => (x.id === id ? { ...x, state: "hit" } : x.state === "go" ? { ...x, state: "spent" } : x)));
      setTimeout(() => remove(id), 600);
      const n = stepRef.current + 1;
      stepRef.current = n;
      setStep(n);
      setMiss(0);
      stationIn.current = Math.min(stationIn.current, 0.7);
      if (n >= letters.length) {
        doneRef.current = true;
        setTimeout(() => sfx.magic(), 250);
        setTimeout(() => onDone(wrongs.current), 1600);
      } else {
        sfx.correct();
      }
    } else {
      sfx.wrong();
      wrongs.current += 1;
      setMiss((x) => x + 1);
      commit(signsRef.current.map((x) => (x.id === id ? { ...x, state: "miss" } : x)));
      setTimeout(() => remove(id), 700);
      setPeek({ letter: s.letter, who: wrongs.current % 2 ? "cat" : "pigeon" });
      clearTimeout(peekTm.current);
      peekTm.current = setTimeout(() => setPeek(null), 1400);
    }
  }, [letters, onDone, remove]);

  /* keyboard: a letter taps the sign carrying it */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const live = signsRef.current.filter((s) => s.state === "go");
      const target = letters[stepRef.current];
      const hit = live.find((s) => s.letter === target && keyMatches(e.key, s.letter, word.lang)) ?? live.find((s) => keyMatches(e.key, s.letter, word.lang));
      if (hit) tap(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [letters, tap, word.lang]);

  const target = letters[step];
  const side = rtl ? "right" : "left";
  const winW = ((WIN.x1 - WIN.x0) / 100) * geo.tw;

  return (
    <div className="ct-stage tr-stage" ref={rootRef}>
      <div className="tr-city" ref={bgRef} style={{ backgroundImage: `url(${TRAIN_ART}/bg-loop.webp)` }} />

      {signs.map((s) => {
        const w = s.side === "far" ? geo.farW : geo.nearW;
        return (
          <button
            key={s.id}
            type="button"
            ref={(el) => { if (el) els.current.set(s.id, el); else els.current.delete(s.id); }}
            className={`tr-sign is-${s.side} is-${s.state}${miss >= 2 && s.state === "go" && s.letter === target ? " is-glow" : ""}`}
            style={{ width: w, height: w / SIGN_ASPECT, top: s.side === "far" ? geo.farTop : geo.nearTop }}
            onPointerDown={(e) => { e.preventDefault(); tap(s.id); }}
            aria-label={s.letter}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${TRAIN_ART}/sign.webp`} alt="" draggable={false} />
            <span className="tr-sign-letter" style={{ top: `${PLATE_Y}%`, fontSize: w * 0.44 }}><Glyph ch={s.letter} /></span>
          </button>
        );
      })}

      <div className={`tr-train${rtl ? " is-rtl" : ""}`} style={{ width: geo.tw, height: geo.th, top: geo.trainTop, [side]: geo.trainX }}>
        {/* The child rides in the round window (behind the picture, seen through the hole). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tr-rider" src={avatar} alt="" draggable={false} style={{ left: `${WIN.x0 - 1}%`, top: `${WIN.y0 - 1}%`, width: winW * 1.08, height: winW * 1.08 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tr-train-img" src={`${TRAIN_ART}/train.webp`} alt="" draggable={false} />
      </div>

      {peek ? (
        <div className={`ct-peek tr-peek${rtl ? " is-rtl" : ""}`}>
          <div className="ct-bubble">{c.thats(iso(peek.letter))}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${TRAIN_ART}/${peek.who}.webp`} alt="" draggable={false} />
        </div>
      ) : null}

      <CatchHud word={word} letters={letters} step={step} pic={pic} c={c} game="catch-train" onExit={onExit} />
    </div>
  );
}

export const TRAIN_CSS = `
.tr-stage{background:#f8d9b4}
.tr-city{position:absolute;inset:0;background-repeat:repeat-x;background-size:auto 100%;background-position-y:bottom;will-change:background-position}
.tr-sign{position:absolute;left:0;border:0;background:none;padding:0;cursor:pointer;will-change:transform;touch-action:none}
.tr-sign.is-far{z-index:1}
.tr-sign.is-near{z-index:3}
.tr-sign img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;filter:drop-shadow(0 6px 8px #0004)}
.tr-sign-letter{position:absolute;left:50%;transform:translate(-50%,-50%);font-weight:900;line-height:1;color:#7a2e1c;pointer-events:none;font-family:inherit}
.tr-sign.is-glow img{filter:drop-shadow(0 0 10px #fff) drop-shadow(0 0 24px #ffe066) drop-shadow(0 0 38px #ffd23f)}
.tr-sign.is-glow .tr-sign-letter{animation:ct-throb .7s ease-in-out infinite alternate}
.tr-sign.is-hit,.tr-sign.is-miss,.tr-sign.is-spent{pointer-events:none}
.tr-sign.is-hit img,.tr-sign.is-hit .tr-sign-letter{animation:tr-hit .55s ease-out forwards}
.tr-sign.is-miss img,.tr-sign.is-miss .tr-sign-letter{transform-origin:50% 100%;animation:tr-fall .7s ease-in forwards}
.tr-sign.is-spent{opacity:.45;filter:grayscale(.5);transition:opacity .3s}
.tr-train{position:absolute;z-index:2;animation:tr-bob .42s ease-in-out infinite alternate}
.tr-train.is-rtl{transform:scaleX(-1)}
.tr-train.is-rtl .tr-rider{transform:scaleX(-1)}
.tr-train-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
.tr-rider{position:absolute;border-radius:50%;object-fit:cover;background:#fff}
.tr-peek{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 120px);right:8px;left:auto}
.tr-peek.is-rtl{right:auto;left:8px}
@keyframes tr-bob{from{margin-top:0}to{margin-top:-3px}}
@keyframes tr-hit{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(.3) translateY(-120px);opacity:0}}
@keyframes tr-fall{0%{transform:rotate(0)}25%{transform:rotate(-12deg)}100%{transform:rotate(80deg) translateY(30px);opacity:0}}
`;
