"use client";

/**
 * Peeking letters (Gadi 2026-11-02, testers first). Like a Roblox obby: the
 * child is always on the trail and always moving on. At each stop three
 * things stand on the path; letters peek out from behind them for a moment
 * and duck back. The child taps the NEXT letter of the word while it peeks.
 * A wrong letter brings out a funny character ("That's k!") and costs
 * nothing; after two wrong taps on the same letter the right one peeks
 * longer and glows. A finished word rises with stars, a small card shows the
 * next word, and the walk goes on in the same world, word after word.
 *
 * Same art, words and results as the door trail (WorldClient); this is only
 * another way to walk it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TTSButton } from "@/components/design/TTSButton";
import { SfxToggle } from "@/components/SfxToggle";
import { TesterButton } from "@/components/TesterButton";
import { WaitText } from "@/components/WaitText";
import { sfx } from "@/lib/game-sfx";
import { decoysFor, keyMatches, lettersOf, RTL_SPELL } from "@/lib/world/letters";
import { worldArt, type WorldDef } from "@/lib/world/worlds";
import type { WorldCopy } from "@/lib/world/world-i18n";
import { Glyph } from "./Glyph";
import type { TrailWord } from "./WorldClient";

type PeekCopy = { start: string; tip: string; walked: (n: number) => string; next: string; go: string; gotIt: string };
const PEEK_HE: PeekCopy = {
  start: "מסלול האותיות המציצות",
  tip: "תופסים את האות הבאה כשהיא מציצה",
  walked: (n) => `מילים במסלול: ${n}`,
  next: "המילה הבאה במסלול",
  go: "ממשיכים ללכת",
  gotIt: "יש! המילה נאספה",
};
const PEEK_EN: PeekCopy = {
  start: "Peeking letters trail",
  tip: "Tap the next letter when it peeks out",
  walked: (n) => `Words on this walk: ${n}`,
  next: "Next word on the trail",
  go: "Keep walking",
  gotIt: "Got it! Word collected",
};
/** Testers only for now: Hebrew, else English. */
export const peekCopy = (lang: string): PeekCopy => (lang === "he" ? PEEK_HE : PEEK_EN);

const iso = (s: string) => `⁨${s}⁩`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hashOf = (s: string) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619); } return h >>> 0; };

type Peek = { j: number; letter: string; up: boolean; glow: boolean; n: number };

export function PeekTrail({ world, c, ui, word, pic, avatar, onWordDone, onMap, onExit }: {
  world: WorldDef; c: WorldCopy; ui: string;
  /** null while the next words load: the child waits on the trail. */
  word: TrailWord | null; pic: string | null; avatar: string | null;
  /** The word is complete: the parent saves it and moves to the next word. */
  onWordDone: (wrongs: number) => void;
  onMap: () => void; onExit: () => void;
}) {
  const pc = peekCopy(ui);
  // The trail's direction is the first word's: it never flips mid-walk.
  const [rtl] = useState(() => (word ? RTL_SPELL.has(word.lang) : ui === "he" || ui === "ar" || ui === "fa"));
  const letters = useMemo(() => (word ? lettersOf(word.w, word.lang) : []), [word]);
  const audioLang = word ? (word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang) : "en-US";

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
    const groundH = H * 0.22;
    const avatarS = clamp(Math.min(H * 0.1, W * 0.19), 58, 96);
    const gapF = 1.12;
    // The three things fill the width; the child stands in front of them.
    const fit = (W - 24) / (1 + 2 * gapF);
    const spotW = Math.min(clamp(Math.min(W * 0.3, H * 0.2), 90, 180), fit);
    const spotH = spotW * 0.85;
    const gap = spotW * gapF;
    const groupW = spotW + 2 * gap;
    const tile = spotW * 0.56;
    const seg = clamp(W * 0.95, 380, 860);
    const p0 = W * 0.38;
    const stopX = (k: number) => p0 + k * seg + seg * 0.6;
    const spotX = (k: number, j: number) => stopX(k) + (j - 1) * gap;
    const waitX = (k: number) => stopX(k);
    const camOff = W / 2;
    const spotBottom = groundH * 0.62;
    return { W, H, groundH, avatarS, spotW, spotH, gap, groupW, tile, seg, stopX, spotX, waitX, camOff, spotBottom, speed: Math.max(390, W * 0.7) };
  }, [size]);
  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  /* walking: one animation loop, refs only (as in the door trail) */
  const trackRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(geo.W * 0.18);
  const targetRef = useRef(geo.W * 0.18);
  const arriveRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = geoRef.current;
      const p = posRef.current;
      const d = targetRef.current - p;
      let moving = false;
      if (Math.abs(d) > 0.5) {
        posRef.current = p + Math.sign(d) * Math.min(Math.abs(d), g.speed * dt);
        moving = true;
      } else if (arriveRef.current) {
        const f = arriveRef.current;
        arriveRef.current = null;
        f();
      }
      const cam = Math.max(0, posRef.current - g.camOff);
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${rtl ? cam : -cam}px,0,0)`;
      const av = avatarRef.current;
      if (av) {
        av.style[rtl ? "right" : "left"] = `${posRef.current - g.avatarS / 2}px`;
        av.classList.toggle("is-walking", moving);
      }
      if (farRef.current) farRef.current.style.backgroundPositionX = `${(rtl ? 1 : -1) * cam * 0.18}px`;
      if (midRef.current) midRef.current.style.backgroundPositionX = `${(rtl ? 1 : -1) * cam * 0.55}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rtl]);
  const walkTo = useCallback((x: number, then?: () => void) => {
    targetRef.current = x;
    arriveRef.current = then ?? null;
  }, []);

  /* where we are: one stop per letter, counted over the whole walk */
  const [stop, setStop] = useState(-1);
  const stopRef = useRef(-1);
  const [phase, setPhase] = useState<"card" | "walk" | "pick" | "won">("card");
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const wrongs = useRef(0);
  const missRef = useRef(0);
  const [peek, setPeek] = useState<Peek | null>(null);
  const peekRef = useRef<Peek | null>(null);
  const [wrong, setWrong] = useState<{ j: number; letter: string; animal: string; k: number } | null>(null);
  const [walked, setWalked] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((f: () => void, ms: number) => { timers.current.push(setTimeout(f, ms)); }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);
  const setPeekBoth = useCallback((p: Peek | null) => { peekRef.current = p; setPeek(p); }, []);

  // A new word arrives (the first one, or the next after a word is done): its card.
  const wordKey = word ? `${word.lang}:${word.w}` : "";
  const [seenKey, setSeenKey] = useState(wordKey);
  if (wordKey !== seenKey) {
    setSeenKey(wordKey);
    setPhase("card");
    setStep(0);
    setPeek(null);
  }
  useEffect(() => {
    stepRef.current = 0;
    missRef.current = 0;
    wrongs.current = 0;
    peekRef.current = null;
  }, [wordKey]);

  // The card says the word by itself.
  const cardSay = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (phase !== "card" || !word) return;
    const tm = setTimeout(() => cardSay.current?.querySelector("button")?.click(), 450);
    return () => clearTimeout(tm);
  }, [phase, word]);

  const goStop = useCallback((k: number) => {
    stopRef.current = k;
    setStop(k);
    setPhase("walk");
    walkTo(geoRef.current.waitX(k), () => setPhase("pick"));
  }, [walkTo]);

  /* the peeking: one letter at a time, from behind one of the three things */
  const lastTarget = useRef(false);
  const lastJ = useRef(-1);
  const peekN = useRef(0);
  const genRef = useRef(0);
  useEffect(() => {
    if (phase !== "pick" || !word) return;
    // This stop's own timers: a caught letter ends the cycle (genRef), the
    // word's other timers (the win, the funny character) are not touched.
    const gen = ++genRef.current;
    const mine: ReturnType<typeof setTimeout>[] = [];
    const wait = (f: () => void, ms: number) => { mine.push(setTimeout(f, ms)); };
    const live = () => genRef.current === gen;
    const cycle = () => {
      if (!live()) return;
      const target = letters[stepRef.current];
      if (!target) return;
      const showTarget = !lastTarget.current || Math.random() < 0.35;
      lastTarget.current = showTarget;
      const letter = showTarget ? target : (decoysFor(target, word.lang, 3)[Math.floor(Math.random() * 3)] ?? target);
      let j = Math.floor(Math.random() * 3);
      if (j === lastJ.current) j = (j + 1 + Math.floor(Math.random() * 2)) % 3;
      lastJ.current = j;
      const helped = showTarget && missRef.current >= 2;
      const n = ++peekN.current;
      setPeekBoth({ j, letter, up: false, glow: helped, n });
      // mount low, then rise (two frames so the transition runs)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (live() && peekRef.current?.n === n) setPeekBoth({ ...peekRef.current, up: true });
      }));
      const stay = helped ? 2600 : rnd(1200, 1600);
      wait(() => {
        if (!live() || peekRef.current?.n !== n) return;
        setPeekBoth({ ...peekRef.current, up: false });
        wait(() => {
          if (!live()) return;
          if (peekRef.current?.n === n) setPeekBoth(null);
          wait(cycle, rnd(250, 550));
        }, 300);
      }, stay);
    };
    wait(cycle, 450);
    return () => { genRef.current += 1; mine.forEach(clearTimeout); };
  }, [phase, word, letters, setPeekBoth]);

  const tap = useCallback((j: number) => {
    const p = peekRef.current;
    if (phase !== "pick" || !p || !p.up || p.j !== j || !word) return;
    const target = letters[stepRef.current];
    if (p.letter === target) {
      genRef.current += 1; // this stop's peeking ends
      setPeekBoth({ ...p, up: false, glow: false });
      const n = stepRef.current + 1;
      stepRef.current = n;
      setStep(n);
      missRef.current = 0;
      lastTarget.current = false;
      if (n >= letters.length) {
        sfx.magic();
        setPhase("won");
        later(() => sfx.win(), 450);
        later(() => {
          setWalked((x) => x + 1);
          onWordDone(wrongs.current);
        }, 1800);
      } else {
        sfx.letter(n - 1);
        later(() => { setPeekBoth(null); goStop(stopRef.current + 1); }, 380);
      }
    } else {
      sfx.wrong();
      wrongs.current += 1;
      missRef.current += 1;
      setPeekBoth({ ...p, up: false });
      setWrong({ j, letter: p.letter, animal: world.animals[(hashOf(word.w) + wrongs.current) % world.animals.length], k: Date.now() });
      later(() => setWrong(null), 1300);
    }
  }, [phase, word, letters, goStop, onWordDone, world.animals, later, setPeekBoth]);

  const onDown = useCallback((e: React.PointerEvent<HTMLElement>) => { e.preventDefault(); tap(Number(e.currentTarget.dataset.j)); }, [tap]);

  /* keyboard: typing the peeking letter taps it */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !word) return;
      const p = peekRef.current;
      if (phase === "pick" && p?.up && keyMatches(e.key, p.letter, word.lang)) tap(p.j);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, word, tap]);

  const side = rtl ? "right" : "left";
  const at = (x: number, w: number) => ({ [side]: `${x - w / 2}px` });
  const stops = [stop - 1, stop, stop + 1, stop + 2].filter((k) => k >= 0);
  const kinds = (k: number) => {
    const h = hashOf(`${world.id}:${k}`);
    const s = world.spots;
    const a = h % s.length;
    return [s[a], s[(a + 1 + ((h >> 4) % (s.length - 1))) % s.length], s[(a + 2) % s.length]];
  };
  const trackLen = geo.stopX(Math.max(0, stop) + 3) + geo.W;
  const rise = geo.spotH * 0.45 + geo.tile;
  const done = step >= letters.length && letters.length > 0;

  return (
    <div className="wt-stage" ref={rootRef} style={{ background: world.sky }}>
      <style>{PK_CSS}</style>
      <div className="wt-far" ref={farRef} style={{ backgroundImage: `url(${worldArt(world, "bg-far")})`, bottom: geo.groundH * 0.9 }} />
      <div className="wt-mid" ref={midRef} style={{ backgroundImage: `url(${worldArt(world, "bg-mid")})`, bottom: geo.groundH * 0.72 }} />
      <div className="wt-ground" style={{ height: geo.groundH, background: `linear-gradient(${world.ground[0]}, ${world.ground[1]})`, boxShadow: `inset 0 10px 0 ${world.edge[0]}, inset 0 14px 0 ${world.edge[1]}` }} />

      <div className="wt-track" ref={trackRef} style={{ width: trackLen, [side]: 0 }}>
        {stops.map((k) => kinds(k).map((kind, j) => {
          const x = geo.spotX(k, j);
          const live = k === stop && phase === "pick";
          const p = live && peek?.j === j ? peek : null;
          return (
            <div key={`${k}:${j}`}>
              {/* the letter's window: it rises from behind the thing and ducks back */}
              <div className="pk-window" style={{ ...at(x, geo.tile * 1.3), width: geo.tile * 1.3, height: rise + geo.tile * 0.12, bottom: geo.spotBottom + geo.spotH * 0.55 }}>
                {p ? (
                  <button
                    type="button"
                    className={`pk-letter${p.glow ? " is-glow" : ""}`}
                    style={{ width: geo.tile, height: geo.tile, fontSize: geo.tile * 0.58, color: world.letterColor, transform: `translate(-50%, ${p.up ? -rise : 0}px)` }}
                    data-j={j}
                    onPointerDown={onDown}
                    aria-label={p.letter}
                  >
                    <Glyph ch={p.letter} />
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className={`pk-spot${live ? " is-live" : ""}`}
                style={{ ...at(x, geo.spotW), width: geo.spotW, height: geo.spotH, bottom: geo.spotBottom }}
                data-j={j}
                    onPointerDown={onDown}
                aria-label="?"
                tabIndex={-1}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={worldArt(world, kind)} alt="" draggable={false} />
              </button>
            </div>
          );
        }))}

        {wrong ? (
          <div key={wrong.k} className="wt-animal" style={{ ...at(geo.spotX(stop, wrong.j), geo.spotW * 1.3), width: geo.spotW * 1.3, bottom: geo.spotBottom + geo.spotH * 0.6 }}>
            <div className="wt-bubble">{c.thats(iso(wrong.letter))}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={worldArt(world, wrong.animal)} alt="" draggable={false} />
          </div>
        ) : null}

        <div className="wt-avatar pk-avatar" ref={avatarRef} style={{ width: geo.avatarS, height: geo.avatarS, bottom: geo.groundH * 0.06 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar ?? "/avatars/look-hoodie-1.webp"} alt="" draggable={false} />
        </div>
      </div>

      <div className="wt-hud">
        <div className="wt-hud-side">
          <button type="button" className="wt-round" onClick={onExit} aria-label={c.back}>✕</button>
          <SfxToggle className="wt-round" />
        </div>
        {word ? (
          <div className="wt-slots" dir={RTL_SPELL.has(word.lang) ? "rtl" : "ltr"}>
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="wt-slots-pic" src={pic} alt="" />
            ) : null}
            <span className="wt-slots-say"><TTSButton text={word.native ? word.raw : word.w} audioLang={audioLang} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} /></span>
            {letters.map((l, i) => (
              <span key={i} className={`wt-slot${i < step ? " is-filled" : ""}${i === step && phase !== "card" ? " pk-now" : ""}`}>{i < step ? <Glyph ch={l} /> : null}</span>
            ))}
          </div>
        ) : <div />}
        <div className="wt-hud-side is-end">
          {/* the map ends the walk; its badge counts the words of this walk */}
          <button type="button" className="wt-round pk-map" onClick={onMap} aria-label={`${c.mapTitle}. ${pc.walked(walked)}`} title={pc.walked(walked)}>
            🗺️{walked ? <span className="pk-badge">{walked}</span> : null}
          </button>
          <TesterButton game="world-peek" word={word?.w} className="wt-round" />
        </div>
      </div>

      {phase === "pick" || phase === "walk" ? <div className="wt-tip">{pc.tip}</div> : null}

      {phase === "won" && word ? (
        <div className="pk-won">
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pk-won-pic" src={pic} alt="" />
          ) : null}
          <strong dir={RTL_SPELL.has(word.lang) ? "rtl" : "ltr"}>{word.nq || (word.native ? word.raw : word.w)}</strong>
          <span>{pc.gotIt}</span>
          <i className="pk-star is-a">⭐</i><i className="pk-star is-b">⭐</i><i className="pk-star is-c">⭐</i>
        </div>
      ) : null}

      {phase === "card" && word && !done ? (
        <div className="pk-card-wrap">
          <div className="pk-card" dir={ui === "he" || ui === "ar" || ui === "fa" ? "rtl" : "ltr"}>
            <span className="wt-intro-label">{walked ? pc.next : c.yourWord}</span>
            {pic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="pk-card-pic" src={pic} alt="" />
            ) : null}
            <strong className="pk-card-word" dir={RTL_SPELL.has(word.lang) ? "rtl" : "ltr"}>{word.nq || (word.native ? word.raw : word.w)}</strong>
            {word.t ? <span className="wt-intro-t">{word.t}</span> : null}
            <span ref={cardSay}>
              <TTSButton text={word.native ? word.raw : word.w} audioLang={audioLang} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} />
            </span>
            <button type="button" className="wt-btn" onClick={() => { sfx.whoosh(); goStop(stopRef.current + 1); }}>{walked ? pc.go : c.go}</button>
          </div>
        </div>
      ) : null}

      {!word ? <div className="wt-loading"><WaitText text={c.loading} live /></div> : null}
    </div>
  );
}

const PK_CSS = `
.pk-avatar{z-index:3}
.pk-map{position:relative}
.pk-badge{position:absolute;top:-4px;inset-inline-end:-4px;min-width:20px;height:20px;border-radius:999px;background:#f59e0b;color:#fff;font-size:12px;font-weight:900;display:grid;place-items:center;padding:0 5px;box-shadow:0 1px 4px #0004}
.pk-window{position:absolute;overflow:hidden;z-index:1;pointer-events:none}
.pk-letter{position:absolute;left:50%;top:100%;border:0;border-radius:50%;background:#fffdf5;box-shadow:0 0 0 4px #ffffffaa,0 6px 14px #0005;font-weight:900;line-height:1;display:grid;place-items:center;cursor:pointer;pointer-events:auto;font-family:inherit;transition:transform .28s cubic-bezier(.3,1.5,.5,1);padding:0}
.pk-letter.is-glow{box-shadow:0 0 0 4px #ffe066,0 0 22px 8px #ffd23f,0 6px 14px #0005}
.pk-spot{position:absolute;z-index:2;border:0;background:none;padding:0;cursor:pointer;display:flex;align-items:flex-end;justify-content:center}
.pk-spot img{max-width:100%;max-height:100%;object-fit:contain;display:block;pointer-events:none;filter:drop-shadow(0 6px 6px #0003)}
.pk-spot.is-live img{animation:pk-sway 2.4s ease-in-out infinite}
.wt-slot.pk-now{border-color:#f59e0b;animation:pk-blink 1s ease-in-out infinite}
.pk-won{position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:7;display:grid;justify-items:center;gap:6px;background:#fffffff2;border-radius:26px;padding:16px 26px;box-shadow:0 12px 34px #0005;animation:pk-rise .7s cubic-bezier(.2,1.4,.4,1)}
.pk-won-pic{width:120px;height:120px;border-radius:20px;object-fit:cover}
.pk-won strong{font-size:38px;line-height:1.1}
.pk-won span{font-weight:800;color:#0a7472}
.pk-star{position:absolute;font-style:normal;font-size:30px;animation:pk-starfly 1.4s ease-out forwards}
.pk-star.is-a{left:-10px;top:10px}
.pk-star.is-b{right:-12px;top:30px;animation-delay:.15s}
.pk-star.is-c{left:45%;top:-20px;animation-delay:.3s}
.pk-card-wrap{position:absolute;inset:0;z-index:4;display:grid;place-items:center;padding:16px;background:#0002}
.pk-card{display:grid;gap:10px;justify-items:center;text-align:center;background:#fff;border-radius:26px;padding:18px 22px;box-shadow:0 14px 40px #0005;max-width:330px;width:100%;animation:wt-popin .35s cubic-bezier(.2,1.4,.4,1)}
.pk-card-pic{width:120px;height:120px;border-radius:20px;object-fit:cover}
.pk-card-word{font-size:40px;line-height:1.1}
@keyframes pk-sway{0%,100%{transform:rotate(0)}50%{transform:rotate(1.5deg)}}
@keyframes pk-blink{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes pk-rise{from{transform:translate(-50%,60px) scale(.6);opacity:0}to{transform:translate(-50%,0) scale(1);opacity:1}}
@keyframes pk-starfly{0%{opacity:0;transform:scale(.4)}30%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:translateY(-70px) scale(1)}}
`;
