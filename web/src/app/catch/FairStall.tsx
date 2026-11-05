"use client";

/**
 * The funfair (Gadi 2026-11-02), the catch game's third scene: his son's
 * "like at the fair" idea, made gentle. Three stalls:
 *  - cans: cans slide along two shelves; throw a ball at the can with the
 *    NEXT letter of the word and it tumbles off the shelf;
 *  - balloons: balloons float up the tent; a bubble cannon pops the right one
 *    into confetti;
 *  - target: a carnival wheel spins with letter discs on it; a suction-cup
 *    arrow sticks on the right disc and rides the wheel.
 * Tapping a target launches the shot from the launcher at the bottom; it
 * always flies to the tapped target (a choice game, never a physics miss).
 * A wrong target shrugs the shot off and the bear or the parrot says
 * "That's k!"; after two wrong shots on a letter the right targets glow.
 * Same contract as the fireflies and the coaster: onDone(wrongs).
 *
 * Plain DOM: one requestAnimationFrame loop moves the targets and the shot
 * through refs; React renders only when a target is born, hit or leaves.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { decoysFor, keyMatches, lettersOf, RTL_SPELL } from "@/lib/world/letters";
import { Glyph } from "../world/Glyph";
import type { TrailWord } from "../world/WorldClient";
import type { CatchCopy } from "./catch-i18n";
import { CatchHud } from "./CatchHud";

export type FairStall = "cans" | "balloons" | "target";
export const FAIR_STALLS: FairStall[] = ["cans", "balloons", "target"];
export const FAIR_ART = "/catch/fair";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const BALLOON_HUES = [0, 130, 200, 265, 320, 30];

type TState = "live" | "tried" | "hit" | "miss" | "flee" | "empty";
type T = {
  id: number; letter: string; state: TState; t: number; flip: number;
  x: number; y: number; w: number; h: number;
  /* cans: row + slot; balloons: rise + sway; target: angle offset */
  row: number; slot: number; last: number;
  vy: number; amp: number; freq: number; ph: number; x0: number; hue: number;
  ang: number;
};
type Shot = { id: number; target: number; t: number; dur: number; fx: number; fy: number; x: number; y: number; rot: number; state: "fly" | "bounce" | "stuck"; vx: number; vy: number; life: number };

export function FairRide({ stall, word, c, level, avatar, pic, onDone, onExit }: {
  stall: FairStall; word: TrailWord; c: CatchCopy; level: number; avatar: string; pic: string | null;
  onDone: (wrongs: number) => void; onExit: () => void;
}) {
  const rtl = RTL_SPELL.has(word.lang);
  const letters = useMemo(() => lettersOf(word.w, word.lang), [word]);
  const lettersRef = useRef(letters);
  useEffect(() => { lettersRef.current = letters; }, [letters]);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  const wheelEl = useRef<HTMLImageElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 844 });
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const W = size.w, H = size.h;
    const count = Math.min(3 + Math.floor(level / 2), 5);
    const speed = Math.min(1 + level * 0.08, 1.8);
    const canW = clamp(Math.min(W * 0.2, H * 0.125), 64, 118);
    const balW = clamp(Math.min(W * 0.23, H * 0.125), 74, 132);
    const R = Math.min(W * 0.44, H * 0.27, 330);
    const discW = clamp(R * 0.5, 62, 128);
    const launchW = stall === "target" ? clamp(H * 0.2, 120, 190) * 0.321 : clamp(Math.min(W * 0.27, H * 0.13), 86, 130);
    const launchH = stall === "target" ? clamp(H * 0.2, 120, 190) : launchW / (stall === "cans" ? 0.797 : 0.579);
    const ly = H - launchH * 0.62 - 10;
    return {
      W, H, count, speed, canW, canH: canW / 0.587, balW, balH: balW / 0.58, R, discW,
      shelves: [H * 0.43, H * 0.66], wheel: { x: W / 2, y: Math.max(130 + R, H * 0.42) },
      launchW, launchH, lx: W / 2, ly,
    };
  }, [size, level, stall]);
  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [items, setItems] = useState<T[]>([]);
  const bump = () => setItems(ts.current.filter((t) => t.state !== "empty"));
  const ts = useRef<T[]>([]);
  const els = useRef(new Map<number, HTMLDivElement>());
  const shot = useRef<Shot | null>(null);
  const shotEl = useRef<HTMLImageElement>(null);
  const launcherEl = useRef<HTMLImageElement>(null);
  const nextId = useRef(1);
  const doneRef = useRef(false);
  const wrongs = useRef(0);
  const [miss, setMiss] = useState(0);
  const missRef = useRef(0);
  const [peek, setPeek] = useState<{ letter: string; who: "bear" | "parrot" } | null>(null);
  const peekTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; hue: number }[]>([]);
  const spawnIn = useRef(0.1);
  const wheel = useRef({ th: 0, om: 0.6, want: 0.6, flipIn: rnd(5, 8) });
  const reassignIn = useRef(-1);

  const target = () => lettersRef.current[stepRef.current];
  const decoy = useCallback((exclude: Set<string>) => {
    const tgt = lettersRef.current[stepRef.current] ?? lettersRef.current[0];
    const pool = decoysFor(tgt, word.lang, 6).filter((l) => !exclude.has(l));
    return pool[Math.floor(Math.random() * pool.length)] ?? decoysFor(tgt, word.lang, 1)[0] ?? tgt;
  }, [word.lang]);
  const mk = (over: Partial<T>): T => ({
    id: nextId.current++, letter: "", state: "live", t: 0, flip: 0, x: 0, y: 0, w: 0, h: 0,
    row: 0, slot: 0, last: 0, vy: 0, amp: 0, freq: 0, ph: 0, x0: 0, hue: 0, ang: 0, ...over,
  });

  /* the stall's first targets */
  useEffect(() => {
    const g = geoRef.current;
    const tgt = lettersRef.current[0];
    const list: T[] = [];
    if (stall === "cans") {
      const per = clamp(Math.max(Math.ceil(g.count / 2) + 1, Math.round(g.W / (g.canW * 2.7))), 3, 7);
      const right = Math.floor(Math.random() * per * 2);
      for (let row = 0; row < 2; row++) for (let s = 0; s < per; s++) {
        list.push(mk({ row, slot: s, w: g.canW, h: g.canH, letter: row * per + s === right ? tgt : "" }));
      }
      const seen = new Set([tgt]);
      for (const t of list) if (!t.letter) { t.letter = decoy(seen); seen.add(t.letter); }
    } else if (stall === "target") {
      const n = g.count;
      const right = Math.floor(Math.random() * n);
      const seen = new Set([tgt]);
      for (let k = 0; k < n; k++) {
        const t = mk({ ang: (k / n) * Math.PI * 2, w: g.discW, h: g.discW, letter: k === right ? tgt : "" });
        if (!t.letter) { t.letter = decoy(seen); seen.add(t.letter); }
        list.push(t);
      }
    }
    ts.current = list;
    bump();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stall]);

  /* a new letter for every disc on the wheel: the next one on one of them */
  const reassignWheel = useCallback(() => {
    const tgt = lettersRef.current[stepRef.current];
    if (!tgt) return;
    const live = ts.current;
    const right = Math.floor(Math.random() * live.length);
    const seen = new Set([tgt]);
    live.forEach((t, k) => {
      t.letter = k === right ? tgt : decoy(seen);
      seen.add(t.letter);
      t.state = "live"; t.flip = 1; t.t = 0;
    });
    bump();
  }, [decoy]);

  /* make sure the needed letter is somewhere on the stall */
  const ensureTarget = useCallback(() => {
    const tgt = lettersRef.current[stepRef.current];
    if (!tgt || stall === "target") return;
    const live = ts.current.filter((t) => t.state === "live" || t.state === "tried");
    if (live.some((t) => t.letter === tgt && t.state === "live")) return;
    if (stall === "balloons") { spawnIn.current = Math.min(spawnIn.current, 0.05); return; }
    const g = geoRef.current;
    // a can off the shelf's visible part first, else one on it flips round
    const off = live.filter((t) => t.x < -t.w * 0.4 || t.x > g.W + t.w * 0.4);
    const pick = (off.length ? off : live)[Math.floor(Math.random() * (off.length || live.length))];
    if (pick) { pick.letter = tgt; pick.state = "live"; pick.flip = off.length ? 0 : 1; bump(); }
  }, [stall]);

  /* the shot arrives: right letter or not */
  const land = (id: number) => {
    const t = ts.current.find((x) => x.id === id);
    const s = shot.current;
    if (!t || !s || (t.state !== "live" && t.state !== "tried")) { if (s) { s.vx = rnd(-80, 80); s.vy = 120; s.life = 0.4; } return; }
    const g = geoRef.current;
    const tgt = target();
    if (t.letter === tgt && t.state === "live") {
      t.state = "hit"; t.t = 0;
      sfx.letter(stepRef.current);
      if (stall === "balloons") {
        const cid = nextId.current++;
        setConfetti((cs) => [...cs, { id: cid, x: t.x, y: t.y - t.h * 0.2, hue: t.hue }]);
        setTimeout(() => setConfetti((cs) => cs.filter((x) => x.id !== cid)), 1000);
        shot.current = null;
      } else if (stall === "cans") {
        s.vx = rnd(-160, 160); s.vy = -260; s.life = 0.55;
      } else {
        s.state = "stuck";
        t.state = "hit";
        reassignIn.current = 0.65;
      }
      const n = stepRef.current + 1;
      stepRef.current = n;
      setStep(n);
      missRef.current = 0;
      setMiss(0);
      if (n >= lettersRef.current.length) {
        doneRef.current = true;
        setTimeout(() => sfx.magic(), 250);
        setTimeout(() => onDoneRef.current(wrongs.current), 1500);
      } else sfx.correct();
    } else {
      sfx.wrong();
      wrongs.current += 1;
      missRef.current += 1;
      setMiss(missRef.current);
      t.state = stall === "balloons" ? "flee" : "miss"; t.t = 0;
      if (stall === "balloons") { s.vx = rnd(-60, 60); s.vy = -420; s.life = 0.5; }
      else if (stall === "cans") { s.vx = (s.x < g.W / 2 ? -1 : 1) * 140; s.vy = 160; s.life = 0.6; }
      else { s.vx = rnd(-50, 50); s.vy = 60; s.life = 0.7; }
      setPeek({ letter: t.letter, who: wrongs.current % 2 ? "bear" : "parrot" });
      clearTimeout(peekTm.current);
      peekTm.current = setTimeout(() => setPeek(null), 1400);
    }
    bump();
  };

  /* the loop */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = geoRef.current;
      let changed = false;

      if (stall === "cans") {
        phase += dt * (g.W / 9) * g.speed;
        const per = Math.max(1, ts.current.filter((t) => t.row === 0).length);
        const L = g.W + g.canW * 2.2;
        const gap = L / per;
        for (const t of ts.current) {
          const dir = t.row === 0 ? 1 : -1;
          const raw = ((phase * (t.row === 0 ? 1 : 0.85) + t.slot * gap + t.row * gap * 0.5) % L + L) % L;
          if (raw < t.last) {
            // came round the back of the shelf: a fresh can
            const seen = new Set(ts.current.filter((o) => o !== t).map((o) => o.letter));
            const tgt = lettersRef.current[stepRef.current];
            const need = tgt && !ts.current.some((o) => o !== t && o.letter === tgt && o.state === "live");
            t.letter = need ? tgt : decoy(seen);
            t.state = "live"; t.t = 0; t.flip = 0;
            changed = true;
          }
          t.last = raw;
          const left = dir > 0 ? raw - g.canW * 1.1 : g.W + g.canW * 1.1 - raw;
          if (t.state !== "hit") { t.x = left + g.canW / 2; t.y = g.shelves[t.row] - g.canH / 2; }
        }
      } else if (stall === "balloons") {
        if (!doneRef.current) {
          spawnIn.current -= dt;
          const live = ts.current.filter((t) => t.state === "live" || t.state === "tried");
          if (spawnIn.current <= 0 && live.length < g.count) {
            const tgt = lettersRef.current[stepRef.current];
            const has = live.some((t) => t.letter === tgt && t.state === "live");
            const letter = !has || Math.random() < 0.2 ? tgt : decoy(new Set(live.map((t) => t.letter)));
            const x0 = rnd(g.balW * 0.7, g.W - g.balW * 0.7);
            ts.current.push(mk({ letter, w: g.balW, h: g.balH, x0, x: x0, y: g.ly - g.launchH / 2 - g.balH * 0.25, vy: -(g.H / rnd(7, 9)) * g.speed, amp: rnd(14, 34), freq: rnd(0.8, 1.6), ph: rnd(0, 6.28), hue: BALLOON_HUES[nextId.current % BALLOON_HUES.length] }));
            spawnIn.current = rnd(0.9, 1.5) / g.speed;
            changed = true;
          }
        }
        for (const t of ts.current) {
          if (t.state === "hit") continue;
          const f = t.state === "flee" ? 2.6 : 1;
          t.y += t.vy * f * dt;
          t.ph += t.freq * dt;
          t.x = t.x0 + Math.sin(t.ph) * t.amp;
          if (t.y < -t.h * 0.6) { t.state = "empty"; changed = true; }
        }
      } else {
        const wh = wheel.current;
        wh.flipIn -= dt;
        if (wh.flipIn <= 0) { wh.want = -Math.sign(wh.want || 1) * rnd(0.5, 0.75) * g.speed; wh.flipIn = rnd(5, 8); }
        wh.om += (wh.want - wh.om) * Math.min(1, dt * 1.6);
        wh.th += wh.om * dt;
        for (const t of ts.current) {
          const a = wh.th + t.ang;
          t.x = g.wheel.x + Math.cos(a) * g.R * 0.6;
          t.y = g.wheel.y + Math.sin(a) * g.R * 0.6;
        }
        if (reassignIn.current > 0) {
          reassignIn.current -= dt;
          if (reassignIn.current <= 0) {
            reassignIn.current = -1;
            if (shot.current?.state === "stuck") shot.current = null;
            if (!doneRef.current) reassignWheel();
          }
        }
        const wEl = wheelEl.current;
        if (wEl) wEl.style.transform = `translate(-50%,-50%) rotate(${wh.th}rad)`;
      }

      /* animations of single targets */
      for (const t of ts.current) {
        t.t += dt;
        if (t.flip > 0) t.flip = Math.max(0, t.flip - dt * 3);
        const el = els.current.get(t.id);
        if (!el) continue;
        let extra = "";
        let op = 1;
        if (t.state === "hit") {
          if (stall === "cans") {
            const k = t.t;
            extra = ` translate(0px,${-240 * k + 1300 * k * k}px) rotate(${-480 * k}deg) scale(${Math.max(0.35, 1 - 0.7 * k)})`;
            op = clamp(1.4 - k * 1.6, 0, 1);
            if (k > 0.9) { t.state = "empty"; changed = true; }
          } else if (stall === "balloons") {
            extra = ` scale(${1 + t.t * 3})`;
            op = clamp(1 - t.t * 7, 0, 1);
            if (t.t > 0.2) { t.state = "empty"; changed = true; }
          }
        } else if (stall === "balloons" && t.state === "live" && t.t < 0.45) {
          extra = ` scale(${0.55 + t.t})`;
          op = t.t / 0.45;
        } else if (t.state === "miss") {
          extra = ` rotate(${Math.sin(t.t * 34) * 10 * Math.max(0, 1 - t.t * 2)}deg)`;
          if (t.t > 0.5) { t.state = stall === "target" ? "live" : "tried"; changed = true; }
        }
        if (t.flip > 0) extra += ` scaleX(${Math.abs(Math.cos(t.flip * Math.PI))})`;
        el.style.transform = `translate3d(${t.x - t.w / 2}px,${t.y - t.h / 2}px,0)${extra}`;
        el.style.opacity = String(op);
      }
      if (ts.current.some((t) => t.state === "empty" && stall === "balloons")) {
        ts.current = ts.current.filter((t) => t.state !== "empty");
        changed = true;
      }

      /* the shot */
      const s = shot.current;
      const se = shotEl.current;
      if (s && se) {
        if (s.state === "fly") {
          s.t += dt / s.dur;
          const tg = ts.current.find((x) => x.id === s.target);
          const tx = tg ? tg.x : s.x, ty = tg ? tg.y : s.y;
          const k = Math.min(1, s.t);
          const lift = stall === "target" ? g.H * 0.05 : g.H * 0.16;
          const cx = (s.fx + tx) / 2, cy = Math.min(s.fy, ty) - lift;
          const px = (1 - k) ** 2 * s.fx + 2 * (1 - k) * k * cx + k * k * tx;
          const py = (1 - k) ** 2 * s.fy + 2 * (1 - k) * k * cy + k * k * ty;
          const vx = 2 * (1 - k) * (cx - s.fx) + 2 * k * (tx - cx);
          const vy = 2 * (1 - k) * (cy - s.fy) + 2 * k * (ty - cy);
          s.x = px; s.y = py;
          s.rot = stall === "target" ? Math.atan2(vy, vx) * 180 / Math.PI + 90 : s.rot + dt * 720;
          if (s.t >= 1) { s.state = "bounce"; land(s.target); }
        } else if (s.state === "bounce") {
          s.life -= dt;
          s.vy += 1500 * dt;
          s.x += s.vx * dt; s.y += s.vy * dt;
          s.rot += dt * (stall === "target" ? 260 : 540);
          if (s.life <= 0) shot.current = null;
        } else if (s.state === "stuck") {
          const tg = ts.current.find((x) => x.id === s.target);
          if (tg) { s.x = tg.x; s.y = tg.y - g.discW * 0.28; }
        }
        const sc = s.state === "fly" ? 1 - 0.35 * Math.min(1, s.t) : 0.65;
        se.style.transform = `translate3d(${s.x}px,${s.y}px,0) translate(-50%,-50%) rotate(${s.rot}deg) scale(${sc})`;
        se.style.opacity = s.state === "bounce" ? String(clamp(s.life * 2.5, 0, 1)) : "1";
        se.style.display = "block";
      } else if (se) se.style.display = "none";

      if (changed) bump();
      if (!doneRef.current) ensureTarget();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // land is stable for the loop's life (it reads refs only)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stall, decoy, ensureTarget, reassignWheel]);

  const shoot = useCallback((id: number) => {
    if (doneRef.current) return;
    const cur = shot.current;
    if (cur && (cur.state === "fly" || (cur.state === "stuck" && reassignIn.current > 0))) return;
    const t = ts.current.find((x) => x.id === id);
    if (!t || (t.state !== "live" && t.state !== "tried")) return;
    const g = geoRef.current;
    const fy = stall === "target" ? g.ly - g.launchH * 0.35 : g.ly - g.launchH * 0.25;
    shot.current = { id: nextId.current++, target: id, t: 0, dur: stall === "target" ? 0.36 : 0.42, fx: g.lx, fy, x: g.lx, y: fy, rot: 0, state: "fly", vx: 0, vy: 0, life: 0 };
    sfx.whoosh();
    // the launcher turns a little toward the target
    const le = launcherEl.current;
    if (le && stall !== "cans") {
      const a = clamp(Math.atan2(t.x - g.lx, -(t.y - g.ly)) * 180 / Math.PI, -40, 40);
      le.style.transform = `translateX(-50%) rotate(${a}deg)`;
      setTimeout(() => { le.style.transform = "translateX(-50%)"; }, 450);
    }
  }, [stall]);

  /* keyboard: a letter shoots a target carrying it */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const g = geoRef.current;
      const live = ts.current.filter((t) => (t.state === "live" || t.state === "tried") && t.x > 0 && t.x < g.W && t.y > 0 && t.y < g.H);
      const tgt = lettersRef.current[stepRef.current];
      const hit = live.find((t) => t.letter === tgt && t.state === "live" && keyMatches(e.key, t.letter, word.lang)) ?? live.find((t) => keyMatches(e.key, t.letter, word.lang));
      if (hit) shoot(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shoot, word.lang]);

  const tgtNow = letters[step];
  const img = stall === "cans" ? "cans/can" : stall === "balloons" ? "balloons/balloon" : "target/disc";
  const plate = stall === "cans" ? { top: "51%", fs: 0.44 } : stall === "balloons" ? { top: "30%", fs: 0.42 } : { top: "50%", fs: 0.4 };
  const launcher = stall === "cans" ? "cans/basket" : stall === "balloons" ? "balloons/cannon" : "target/bow";
  const proj = stall === "cans" ? "cans/ball" : stall === "balloons" ? "balloons/bubble" : "target/arrow";
  const projW = stall === "cans" ? clamp(geo.canW * 0.55, 34, 60) : stall === "balloons" ? clamp(geo.balW * 0.6, 44, 78) : clamp(geo.discW * 0.3, 22, 36);
  const avatarSide = rtl ? "right" : "left";

  return (
    <div className={`ct-stage fr-stage is-${stall}`} ref={rootRef}>
      <div className={`fr-bg is-${stall}`} />
      {stall === "cans" ? geo.shelves.map((y, i) => (
        <div key={i} className="fr-shelf" style={{ top: y - 2 }} />
      )) : null}
      {stall === "target" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={wheelEl} className="fr-wheel" src={`${FAIR_ART}/target/wheel.webp`} alt="" draggable={false} style={{ left: geo.wheel.x, top: geo.wheel.y, width: geo.R * 2, height: geo.R * 2 }} />
      ) : null}

      {items.map((t) => (
        <div
          key={t.id}
          ref={(el) => { if (el) els.current.set(t.id, el); else els.current.delete(t.id); }}
          className={`fr-t is-${t.state}${miss >= 2 && (t.state === "live" || t.state === "tried") ? (t.letter === tgtNow && t.state === "live" ? " is-glow" : " is-dim") : ""}`}
          style={{ width: t.w, height: t.h, transform: `translate3d(${t.x - t.w / 2}px,${t.y - t.h / 2}px,0)` }}
          onPointerDown={(e) => { e.preventDefault(); shoot(t.id); }}
          role="button"
          aria-label={t.letter}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${FAIR_ART}/${img}.webp`} alt="" draggable={false} style={stall === "balloons" ? { filter: `hue-rotate(${t.hue}deg) saturate(1.15)` } : undefined} />
          <span className="fr-letter" style={{ top: plate.top, fontSize: t.w * plate.fs }}><Glyph ch={t.letter} /></span>
        </div>
      ))}

      {confetti.map((cf) => (
        <div key={cf.id} className="fr-confetti" style={{ left: cf.x, top: cf.y }}>
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ ["--a" as string]: `${(i / 14) * 360}deg`, ["--d" as string]: `${50 + (i % 3) * 22}px`, background: `hsl(${(cf.hue + i * 47) % 360} 85% 60%)` }} />
          ))}
        </div>
      ))}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={shotEl} className="fr-shot" src={`${FAIR_ART}/${proj}.webp`} alt="" draggable={false} style={{ width: projW, display: "none" }} />

      <div className="fr-base" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={launcherEl} className="fr-launcher" src={`${FAIR_ART}/${launcher}.webp`} alt="" draggable={false} style={{ width: geo.launchW, height: geo.launchH, left: geo.lx, top: geo.ly - geo.launchH / 2 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="fr-avatar" src={avatar} alt="" draggable={false} style={{ [avatarSide]: `calc(50% + ${geo.launchW / 2 + 12}px)`, top: geo.ly - 30 }} />

      {peek ? (
        <div className={`ct-peek fr-peek${rtl ? " is-rtl" : ""}`}>
          <div className="ct-bubble">{c.thats(`⁨${peek.letter}⁩`)}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${FAIR_ART}/${peek.who}.webp`} alt="" draggable={false} />
        </div>
      ) : null}

      <CatchHud word={word} letters={letters} step={step} pic={pic} c={c} game={`catch-fair-${stall}`} onExit={onExit} />
    </div>
  );
}

export const FAIR_CSS = `
.fr-stage{touch-action:none}
.fr-bg{position:absolute;inset:0;background-size:cover;background-position:center bottom}
.fr-bg.is-cans{background-image:url(${FAIR_ART}/cans/bg-tall.webp)}
.fr-bg.is-balloons{background-image:url(${FAIR_ART}/balloons/bg-tall.webp)}
.fr-bg.is-target{background-image:url(${FAIR_ART}/target/bg-tall.webp)}
@media (min-aspect-ratio:1/1){
.fr-bg.is-cans{background-image:url(${FAIR_ART}/cans/bg-wide.webp)}
.fr-bg.is-balloons{background-image:url(${FAIR_ART}/balloons/bg-wide.webp)}
.fr-bg.is-target{background-image:url(${FAIR_ART}/target/bg-wide.webp)}
}
.fr-shelf{position:absolute;left:0;right:0;height:18px;background:linear-gradient(#e24b4b 0 55%,#ffd23f 55% 75%,#b8322f 75%);box-shadow:0 8px 14px #0004}
.fr-wheel{position:absolute;transform:translate(-50%,-50%);pointer-events:none;filter:drop-shadow(0 12px 18px #0005)}
.fr-t{position:absolute;left:0;top:0;cursor:pointer;will-change:transform;touch-action:none;transform-origin:50% 90%}
.fr-stage.is-balloons .fr-t{transform-origin:50% 30%}
.fr-stage.is-target .fr-t{transform-origin:50% 50%}
.fr-t img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;filter:drop-shadow(0 6px 8px #0004)}
.fr-letter{position:absolute;left:50%;transform:translate(-50%,-50%);font-weight:900;line-height:1;color:#1d2b4a;pointer-events:none;font-family:inherit}
.fr-stage.is-target .fr-letter{color:#7a2410}
.fr-t.is-tried{opacity:.55;filter:grayscale(.5)}
.fr-t.is-glow img{filter:drop-shadow(0 0 10px #fff) drop-shadow(0 0 24px #ffe066) drop-shadow(0 0 38px #ffd23f)}
.fr-t.is-glow .fr-letter{animation:fr-throb .7s ease-in-out infinite alternate;color:#b45309}
/* the hint after two misses must be plain to see (Din 2026-11-05): a ring around the right one, the others fade */
.fr-t.is-glow::after{content:"";position:absolute;inset:-10%;border-radius:50%;border:5px solid #ffe066;box-shadow:0 0 26px #ffd23f,inset 0 0 22px #ffd23f99;animation:fr-ring .8s ease-in-out infinite alternate;pointer-events:none}
.fr-t.is-dim{opacity:.35}
@keyframes fr-ring{from{transform:scale(.9);opacity:.75}to{transform:scale(1.08);opacity:1}}
.fr-t.is-hit,.fr-t.is-flee{pointer-events:none}
.fr-stage.is-target .fr-t.is-hit img{filter:drop-shadow(0 0 12px #fff) drop-shadow(0 0 26px #7dff9b)}
.fr-shot{position:absolute;left:0;top:0;z-index:4;pointer-events:none;filter:drop-shadow(0 6px 8px #0005)}
.fr-base{position:absolute;left:0;right:0;bottom:0;height:calc(env(safe-area-inset-bottom,0px) + 22px);background:linear-gradient(#0000,#0003)}
.fr-launcher{position:absolute;transform:translateX(-50%);transform-origin:50% 85%;transition:transform .18s ease-out;pointer-events:none;object-fit:contain;filter:drop-shadow(0 8px 10px #0005);z-index:3}
.fr-avatar{position:absolute;width:clamp(58px,15vw,78px);height:clamp(58px,15vw,78px);border-radius:50%;border:4px solid #fff;background:#fff;object-fit:cover;box-shadow:0 6px 18px #0006;z-index:3}
.fr-peek{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 116px);right:8px;left:auto}
.fr-peek.is-rtl{right:auto;left:8px}
.fr-confetti{position:absolute;width:0;height:0;z-index:5;pointer-events:none}
.fr-confetti span{position:absolute;width:10px;height:14px;border-radius:3px;left:-5px;top:-7px;animation:fr-burst .9s cubic-bezier(.2,.8,.3,1) forwards}
@keyframes fr-burst{0%{transform:rotate(var(--a)) translateY(0) rotate(0);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(var(--d) * -1.6)) rotate(260deg);opacity:0}}
@keyframes fr-throb{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.18)}}
`;
