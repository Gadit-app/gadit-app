"use client";

/**
 * The roller coaster (Gadi 2026-11-02), the catch game's second scene. The
 * child rides a coaster seen from the front seat, down hills and around
 * curves, through snow, jungle or space. Pairs of letter signs come up, one
 * on each side of the track: one holds the NEXT letter of the word, the other
 * a look-alike. Tap the right one before it passes; a missed pair comes again
 * further on. A wrong sign falls away and the world's character says
 * "That's k!"; after two wrong taps on a letter the right signs glow.
 *
 * Pseudo-3D on one canvas (the classic segment projection of old racing
 * games): the track is a loop of segments whose curve and height are sums of
 * sines, so it never ends and never seams. One animation loop draws the sky,
 * the ground, the rails, the scenery and the signs; React renders only the
 * top bar, the character and the car. Same contract as the fireflies:
 * onDone(wrongs).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { decoysFor, keyMatches, lettersOf, RTL_SPELL } from "@/lib/world/letters";
import { inkOffset } from "../world/Glyph";
import type { TrailWord } from "../world/WorldClient";
import type { CatchCopy } from "./catch-i18n";
import { CatchHud } from "./CatchHud";

export type CoasterWorld = "snow" | "jungle" | "space";
export const COASTER_WORLDS: CoasterWorld[] = ["snow", "jungle", "space"];
export const COASTER_ART = "/catch/coaster";

type WorldLook = {
  props: { name: string; aspect: number; h: number }[];
  /** the blank round plate on the letter sign, in fractions of the picture */
  holder: { aspect: number; cx: number; cy: number; r: number };
  ground: [string, string]; fog: string; rail: string; tie: string; spine: string; car: string; ink: string;
};
const LOOK: Record<CoasterWorld, WorldLook> = {
  snow: {
    props: [{ name: "pine", aspect: 0.54, h: 3300 }, { name: "icerock", aspect: 0.66, h: 1300 }],
    holder: { aspect: 0.622, cx: 0.498, cy: 0.398, r: 0.41 },
    ground: ["#f4f8fd", "#dce7f5"], fog: "#e3ecf7", rail: "#7fe0ee", tie: "#2b3a55", spine: "#b9cce4", car: "#e0475b", ink: "#123a5c",
  },
  jungle: {
    props: [{ name: "palm", aspect: 0.583, h: 3500 }, { name: "leaves", aspect: 0.757, h: 1300 }],
    holder: { aspect: 0.55, cx: 0.496, cy: 0.365, r: 0.405 },
    ground: ["#74c654", "#66b848"], fog: "#a9dcc0", rail: "#ffd166", tie: "#5a3a1e", spine: "#8a5a2b", car: "#f08a24", ink: "#2f3d14",
  },
  space: {
    props: [{ name: "crystal", aspect: 0.686, h: 1500 }, { name: "beacon", aspect: 0.462, h: 1900 }],
    holder: { aspect: 0.585, cx: 0.498, cy: 0.414, r: 0.394 },
    ground: ["#3d2c72", "#342563"], fog: "#3b3080", rail: "#7cf3ff", tie: "#1f1640", spine: "#9d7cff", car: "#7c3aed", ink: "#2a1c5c",
  },
};

/* the track */
const SEG = 200;          // segment length
const N = 2400;           // segments in the loop
const ROAD = 1000;        // half the track width
const CAM_H = 1150;       // camera height above the track
const DEPTH = 0.84;       // 1 / tan(fov / 2), fov about 100°
const DRAW = 170;         // segments drawn ahead
const SIGN_H = 2400;      // a letter sign's height (world units)
const SIGN_OFF = 1.2;     // how far beside the track the signs stand (in ROAD)
const RAIL = 0.3;         // the rails' half gauge (in ROAD)

type Seg = { i: number; y1: number; y2: number; curve: number };
function buildTrack(seed: number): Seg[] {
  const r = (k: number) => ((Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  // a dip or a climb every few seconds, and a bend every few more
  const hill = (i: number) =>
    2200 * Math.sin((2 * Math.PI * i * 15) / N + r(1) * 6) +
    600 * Math.sin((2 * Math.PI * i * 34) / N + r(2) * 6) +
    3000 * Math.sin((2 * Math.PI * i * 4) / N + r(3) * 6);
  const curve = (i: number) =>
    6 * Math.sin((2 * Math.PI * i * 11) / N + r(4) * 6) +
    3.5 * Math.sin((2 * Math.PI * i * 26) / N + r(5) * 6);
  const out: Seg[] = [];
  for (let i = 0; i < N; i++) out.push({ i, y1: hill(i), y2: hill(i + 1), curve: curve(i) });
  return out;
}

type Sprite = { seg: number; off: number; kind: "prop"; img: number };
type Sign = { id: number; seg: number; off: number; letter: string; state: "go" | "hit" | "miss" | "spent"; t: number };
type Drawn = { id: number; letter: string; x: number; y: number; w: number; h: number };

const loadImg = (src: string) => { const im = new Image(); im.src = src; return im; };

export function CoasterRide({ world, word, c, level, avatar, pic, onDone, onExit }: {
  world: CoasterWorld; word: TrailWord; c: CatchCopy; level: number; avatar: string; pic: string | null;
  onDone: (wrongs: number) => void; onExit: () => void;
}) {
  const look = LOOK[world];
  const rtl = RTL_SPELL.has(word.lang);
  const letters = useMemo(() => lettersOf(word.w, word.lang), [word]);
  const lettersRef = useRef(letters);
  useEffect(() => { lettersRef.current = letters; }, [letters]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const track = useMemo(() => buildTrack(world === "snow" ? 1 : world === "jungle" ? 2 : 3), [world]);
  const art = useMemo(() => ({
    pano: loadImg(`${COASTER_ART}/${world}/pano.webp`),
    holder: loadImg(`${COASTER_ART}/${world}/holder.webp`),
    props: look.props.map((p) => loadImg(`${COASTER_ART}/${world}/${p.name}.webp`)),
  }), [world, look]);
  // Scenery along both sides, the same every ride in a world.
  const scenery = useMemo(() => {
    const out: Sprite[] = [];
    for (let i = 0; i < N; i += 3) {
      const h = Math.sin(i * 91.7) * 10000;
      const f = h - Math.floor(h);
      if (f < 0.25) continue;
      const side = (i / 3) % 2 ? 1 : -1;
      out.push({ seg: i, off: side * (1.9 + f * 2.4), kind: "prop", img: f > 0.62 ? 0 : 1 });
    }
    return out;
  }, []);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const wrongs = useRef(0);
  const missOnLetter = useRef(0);
  const [peek, setPeek] = useState<string | null>(null);
  const peekTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const doneRef = useRef(false);

  // ride state (refs, no re-render per frame)
  const pos = useRef(0);
  const bgX = useRef(0);
  // how fast the sky slides on a bend, eased so it never jumps (Gadi 2026-11-02: the clouds raced)
  const bgV = useRef(0);
  // the camera height and the speed follow the track softly (Gadi 2026-11-02: it shook)
  const camYs = useRef<number | null>(null);
  const vS = useRef<number | null>(null);
  const signs = useRef<Sign[]>([]);
  const drawn = useRef<Drawn[]>([]);
  const nextId = useRef(1);
  const spawnAt = useRef(90); // segments ahead for the next pair
  const pending = useRef(true);
  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; }, [level]);

  const baseSeg = () => Math.floor(pos.current / SEG);

  const spawnPair = useCallback((ahead: number) => {
    const target = lettersRef.current[stepRef.current];
    if (!target) return;
    const decoy = decoysFor(target, word.lang, 1)[0] ?? target;
    const left = Math.random() < 0.5;
    const seg = baseSeg() + ahead;
    const mk = (letter: string, off: number): Sign => ({ id: nextId.current++, seg, off, letter, state: "go", t: 0 });
    signs.current = [...signs.current.filter((s) => s.state === "go" || s.t < 0.6), mk(left ? target : decoy, -SIGN_OFF), mk(left ? decoy : target, SIGN_OFF)];
    pending.current = false;
  }, [word.lang]);

  /* the loop */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const fam = getComputedStyle(cv).fontFamily || "system-ui, sans-serif";
    const fit = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cv);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const quad = (x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, col: string) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1); ctx.lineTo(x2 - w2, y2); ctx.lineTo(x2 + w2, y2); ctx.lineTo(x1 + w1, y1);
      ctx.closePath(); ctx.fill();
    };
    const mix = (hex: string, fogHex: string, t: number) => {
      const p = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
      const a = p(hex), b = p(fogHex);
      return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(",")})`;
    };

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const W = cv.width, H = cv.height;
      const scale = W / cv.getBoundingClientRect().width || 1;
      const horizon = H * 0.44;
      // one unit for x and y, so the world keeps its shape on a tall phone and a wide screen
      const U = Math.min(W, H * 0.75) / 2;

      // speed: gentle, a little faster each word, faster downhill
      const b0 = baseSeg();
      const cur = track[((b0 % N) + N) % N];
      const slope = (cur.y2 - cur.y1) / SEG;
      const base = (24 + Math.min(14, levelRef.current * 2)) * SEG;
      // the ride eases off while a pair of signs comes close, so small hands have time
      let near = Infinity;
      for (const s of signs.current) if (s.state === "go") near = Math.min(near, s.seg - b0);
      const ease = near === Infinity ? 1 : 0.55 + 0.45 * Math.max(0, Math.min(1, (near - 8) / 34));
      const vWant = base * ease * (1 + Math.max(-0.22, Math.min(0.4, -slope * 2.2)));
      vS.current = vS.current == null ? vWant : vS.current + (vWant - vS.current) * Math.min(1, dt * 2.5);
      const v = vS.current;
      pos.current += v * dt;
      const bgWant = cur.curve * v * 0.0000022; // a sharp bend slides the sky about a tenth of the screen a second
      bgV.current += (bgWant - bgV.current) * Math.min(1, dt * 1.5);
      bgX.current += bgV.current * dt;

      // pairs of signs
      if (!doneRef.current) {
        if (pending.current) spawnPair(spawnAt.current);
        for (const s of signs.current) {
          if (s.state !== "go") s.t += dt;
          else if (s.seg < baseSeg() + 1) { s.state = "spent"; s.t = 0; pending.current = true; spawnAt.current = 70; }
        }
        signs.current = signs.current.filter((s) => s.state === "go" || s.t < 0.7);
        if (!signs.current.some((s) => s.state === "go") && !pending.current) pending.current = true;
      }

      /* sky: the panorama loop, sliding on curves and a touch with the hills */
      const camYWant = lerp(cur.y1, cur.y2, (pos.current % SEG) / SEG) + CAM_H;
      camYs.current = camYs.current == null ? camYWant : camYs.current + (camYWant - camYs.current) * Math.min(1, dt * 6);
      const camY = camYs.current;
      ctx.fillStyle = look.fog;
      ctx.fillRect(0, 0, W, H);
      const pano = art.pano;
      if (pano.complete && pano.naturalWidth) {
        const ph = H * 0.9;
        const pw = ph * (pano.naturalWidth / pano.naturalHeight);
        const py = horizon - ph * 0.5 + Math.max(-H * 0.05, Math.min(H * 0.05, (camY - 2500) * -0.00003 * H));
        let px = -((((bgX.current * W) % pw) + pw) % pw);
        for (; px < W; px += pw) ctx.drawImage(pano, px, py, pw, ph);
      }

      /* the track, near to far, with the classic "max y" clip */
      const baseI = baseSeg();
      const pct = (pos.current % SEG) / SEG;
      let maxy = H;
      let x = 0;
      const c0 = track[((baseI % N) + N) % N].curve;
      let dx = -(c0 * pct);
      // without this the near track and signs jump sideways each time a segment passes
      const xFix = c0 * pct * pct;
      const proj: { x1: number; y1: number; w1: number; x2: number; y2: number; w2: number; s1: number; clip: number; ok: boolean }[] = [];
      for (let n = 0; n < DRAW; n++) {
        const gi = baseI + n;
        const sg = track[((gi % N) + N) % N];
        const z1 = gi * SEG - pos.current, z2 = (gi + 1) * SEG - pos.current;
        const camX = -x - xFix, camX2 = -x - dx - xFix;
        const s1 = DEPTH / Math.max(1, z1), s2 = DEPTH / Math.max(1, z2);
        const X1 = W / 2 + s1 * camX * U, Y1 = horizon - s1 * (sg.y1 - camY) * U, W1 = s1 * ROAD * U;
        const X2 = W / 2 + s2 * camX2 * U, Y2 = horizon - s2 * (sg.y2 - camY) * U, W2 = s2 * ROAD * U;
        x += dx; dx += sg.curve;
        const ok = !(z1 <= DEPTH * 10 || Y2 >= Y1 || Y2 >= maxy);
        proj.push({ x1: X1, y1: Y1, w1: W1, x2: X2, y2: Y2, w2: W2, s1, clip: maxy, ok });
        if (!ok) continue;
        const fog = Math.min(1, Math.pow(n / DRAW, 1.6) * 1.1);
        const alt = Math.floor(gi / 3) % 2;
        // ground across the whole screen
        ctx.fillStyle = mix(look.ground[alt], look.fog, fog);
        ctx.fillRect(0, Y2, W, Y1 - Y2 + 1);
        // spine, ties, rails
        quad(X1, Y1, W1 * RAIL * 0.22, X2, Y2, W2 * RAIL * 0.22, mix(look.spine, look.fog, fog));
        if (gi % 2 === 0) quad(X1, Y1, W1 * RAIL * 1.25, X2, Y2, W2 * RAIL * 1.25, mix(look.tie, look.fog, fog));
        const rw1 = Math.max(1, W1 * RAIL * 0.13), rw2 = Math.max(1, W2 * RAIL * 0.13);
        quad(X1 - W1 * RAIL, Y1, rw1, X2 - W2 * RAIL, Y2, rw2, mix(look.rail, look.fog, fog));
        quad(X1 + W1 * RAIL, Y1, rw1, X2 + W2 * RAIL, Y2, rw2, mix(look.rail, look.fog, fog));
        maxy = Y2;
      }

      /* scenery and signs, far to near */
      const hits: Drawn[] = [];
      const target = lettersRef.current[stepRef.current];
      const glow = missOnLetter.current >= 2;
      for (let n = DRAW - 1; n >= 0; n--) {
        const p = proj[n];
        if (!p || p.s1 <= 0) continue;
        const gi = baseI + n;
        const li = ((gi % N) + N) % N;
        const fade = n > DRAW * 0.8 ? 1 - (n - DRAW * 0.8) / (DRAW * 0.2) : 1;
        // scenery (several per segment index step)
        for (let k = 0; k < scenery.length; k++) {
          const sp = scenery[k];
          if (sp.seg !== li) continue;
          const im = art.props[sp.img];
          if (!im.complete || !im.naturalWidth) continue;
          const pr = look.props[sp.img];
          const h = p.s1 * pr.h * U;
          const w = h * pr.aspect;
          const sx = p.x1 + p.s1 * sp.off * ROAD * U - w / 2;
          const sy = p.y1 - h;
          if (sy > p.clip) continue;
          ctx.save();
          ctx.globalAlpha = fade;
          ctx.beginPath(); ctx.rect(0, 0, W, p.clip); ctx.clip();
          ctx.drawImage(im, sx, sy, w, h);
          ctx.restore();
        }
        for (const s of signs.current) {
          if (s.seg !== gi) continue;
          const im = art.holder;
          const hd = look.holder;
          let h = p.s1 * SIGN_H * U;
          let w = h * hd.aspect;
          let sx = p.x1 + p.s1 * s.off * ROAD * U - w / 2;
          let sy = p.y1 - h;
          let alpha = fade, rot = 0;
          if (s.state === "hit") { const k = 1 + s.t * 1.4; sx -= (w * k - w) / 2; sy -= (h * k - h) / 2; w *= k; h *= k; alpha = Math.max(0, 1 - s.t / 0.5); }
          if (s.state === "miss") { rot = (s.off < 0 ? -1 : 1) * s.t * 2.2; sy += s.t * s.t * H * 0.8; alpha = Math.max(0, 1 - s.t / 0.7); }
          if (s.state === "spent") alpha = Math.max(0, 1 - s.t / 0.4) * 0.6;
          if (alpha <= 0) continue;
          ctx.save();
          ctx.globalAlpha = alpha;
          if (s.state === "go") { ctx.beginPath(); ctx.rect(0, 0, W, p.clip); ctx.clip(); }
          const cx = sx + w / 2, cy = sy + h * hd.cy;
          ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
          const lit = s.state === "go" && glow && s.letter === target;
          if (lit) { ctx.shadowColor = "#ffe066"; ctx.shadowBlur = Math.max(18, w * 0.35); }
          if (im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, w, h);
          ctx.shadowBlur = 0;
          // the letter, centred by its ink on the plate
          const fs = w * hd.r * 1.25;
          if (fs > 3) {
            const off = inkOffset(s.letter, fam, "900");
            ctx.font = `900 ${fs}px ${fam}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = lit ? "#b45309" : look.ink;
            ctx.fillText(s.letter, sx + w * hd.cx + off.dx * fs, sy + h * hd.cy + off.dy * fs * 0.6);
          }
          ctx.restore();
          if (s.state === "go" && h > 18) hits.push({ id: s.id, letter: s.letter, x: sx / scale, y: sy / scale, w: w / scale, h: (h * (hd.cy + hd.r)) / scale });
        }
      }
      drawn.current = hits;
      // where the signs are on screen (read by the test harness; invisible)
      (cv as unknown as { __signs?: Drawn[] }).__signs = hits;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [track, art, look, scenery, spawnPair]);

  const resolve = useCallback((id: number) => {
    if (doneRef.current) return;
    const s = signs.current.find((x) => x.id === id);
    if (!s || s.state !== "go") return;
    const target = lettersRef.current[stepRef.current];
    if (s.letter === target) {
      s.state = "hit"; s.t = 0;
      for (const o of signs.current) if (o !== s && o.state === "go") { o.state = "spent"; o.t = 0; }
      sfx.letter(stepRef.current);
      const n = stepRef.current + 1;
      stepRef.current = n;
      setStep(n);
      missOnLetter.current = 0;
      if (n >= lettersRef.current.length) {
        doneRef.current = true;
        setTimeout(() => sfx.magic(), 250);
        setTimeout(() => onDone(wrongs.current), 1500);
      } else {
        sfx.correct();
        pending.current = true;
        spawnAt.current = 55;
      }
    } else {
      sfx.wrong();
      wrongs.current += 1;
      missOnLetter.current += 1;
      s.state = "miss"; s.t = 0;
      setPeek(s.letter);
      clearTimeout(peekTm.current);
      peekTm.current = setTimeout(() => setPeek(null), 1400);
    }
  }, [onDone]);

  const onPointer = (e: React.PointerEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = e.clientX - r.left, py = e.clientY - r.top;
    // generous for small fingers: any sign within 28px counts, and the one
    // nearest the finger wins (two small signs far ahead can sit close)
    let best: Drawn | null = null, bestD = Infinity;
    for (const d of drawn.current) {
      const pad = Math.max(28, d.w * 0.25);
      const ddx = Math.max(d.x - px, 0, px - (d.x + d.w)), ddy = Math.max(d.y - py, 0, py - (d.y + d.h));
      const dist = Math.hypot(ddx, ddy);
      if (dist <= pad && (dist < bestD || (dist === bestD && best && d.w > best.w))) { best = d; bestD = dist; }
    }
    if (best) resolve(best.id);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const live = signs.current.filter((s) => s.state === "go" && drawn.current.some((d) => d.id === s.id));
      const target = lettersRef.current[stepRef.current];
      const hit = live.find((s) => s.letter === target && keyMatches(e.key, s.letter, word.lang)) ?? live.find((s) => keyMatches(e.key, s.letter, word.lang));
      if (hit) resolve(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resolve, word.lang]);

  return (
    <div className="ct-stage cs-stage">
      <canvas ref={canvasRef} className="cs-canvas" onPointerDown={onPointer} />
      <div className="cs-car" style={{ ["--car" as string]: look.car }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cs-avatar" src={avatar} alt="" draggable={false} />
      </div>
      {peek ? (
        <div className={`ct-peek cs-peek${rtl ? " is-rtl" : ""}`}>
          <div className="ct-bubble">{c.thats(`⁨${peek}⁩`)}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${COASTER_ART}/${world}/char.webp`} alt="" draggable={false} />
        </div>
      ) : null}
      <CatchHud word={word} letters={letters} step={step} pic={pic} c={c} game={`catch-coaster-${world}`} onExit={onExit} />
    </div>
  );
}

export const COASTER_CSS = `
.cs-stage{touch-action:none}
.cs-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.cs-car{position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:min(78vw,420px);height:clamp(74px,13vh,110px);background:linear-gradient(180deg,color-mix(in srgb,var(--car) 82%,#fff) 0%,var(--car) 55%,color-mix(in srgb,var(--car) 70%,#000) 100%);border-radius:50% 50% 0 0/80% 80% 0 0;box-shadow:inset 0 6px 0 #fff5,0 -4px 18px #0003;pointer-events:none;padding-bottom:env(safe-area-inset-bottom,0px)}
.cs-avatar{position:absolute;left:50%;top:-34%;transform:translateX(-50%);width:clamp(64px,17vw,88px);height:clamp(64px,17vw,88px);border-radius:50%;border:4px solid #fff;background:#fff;object-fit:cover;box-shadow:0 6px 18px #0006}
.cs-peek{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 116px);right:8px;left:auto}
.cs-peek.is-rtl{right:auto;left:8px}
`;
