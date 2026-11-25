"use client";

/**
 * The falling engine of מילים פולשות, shared by its two doors (words and
 * niqqud, Gadi 2026-11-25): the sky, the cards on parachutes, the avatar with
 * its net, catching, the impostor's flip and the crash into the meadow. It
 * does not know what falls: the door hands it the next drop, is told of every
 * catch and every true card that lands, and says when its call is over.
 *
 * Plain DOM, one requestAnimationFrame loop through refs (moved here from the
 * words door unchanged): React renders only when a card is born, caught or
 * leaves. The pace moves a little with accuracy: faster after a catch, slower
 * after an impostor or a missed true card.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { sfx } from "@/lib/game-sfx";

const NET = "/catch/fireflies/net.webp";
/** The parachute's height over an item's width (the svg is 100 x 62 at 92% width, less its overlap). */
const CHUTE = 0.52;
const PACE_MIN = 0.88, PACE_MAX = 1.15;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** One falling card. `face` and `back` are drawn at the card's size; `data` is the door's own. */
export type Drop<T> = { kind: "true" | "imp"; face: (size: number) => ReactNode; back: (size: number) => ReactNode; isPic: boolean; data: T };
type Item<T> = { key: number; drop: Drop<T>; hue: number; state: "fall" | "caught" | "flip" | "crash" };
type Motion = { x: number; y: number; vy: number; amp: number; ph: number; t: number; end?: number };

export function FallStage<T>({ fallS, next, onCatch, onLand, done, avatar, hud, tip, tipAlert }: {
  /** Seconds for a fall at pace 1 (the door's base time × the chosen speed). */
  fallS: number;
  /** The next card to drop, or null to look again in a moment (a picture still on its way). */
  next: (live: Drop<T>[]) => Drop<T> | null;
  /** A card reached the net: "caught" (it flies up), "flip" (an impostor shows its back) or "gone" (removed at once). */
  onCatch: (d: Drop<T>) => "caught" | "flip" | "gone";
  /** A true card reached the ground (impostors crash by themselves). */
  onLand: (d: Drop<T>) => void;
  /** Read every frame: once true, nothing more falls or is caught, and the falling impostors crash. */
  done: () => boolean;
  avatar: string;
  hud: ReactNode;
  tip: ReactNode;
  tipAlert: boolean;
}) {
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
    const S = clamp(Math.min(W * 0.27, H * 0.17), 84, 140);
    const A = clamp(Math.min(W * 0.2, H * 0.13), 70, 104); // the avatar
    const ground = H - 14;
    return { W, H, S, A, ground, top: Math.max(120, H * 0.17), maxOn: W < 600 ? 3 : 4 };
  }, [size]);
  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  // The door's callbacks, always the latest, without restarting the loop.
  const cb = useRef({ next, onCatch, onLand, done, fallS });
  useEffect(() => { cb.current = { next, onCatch, onLand, done, fallS }; });

  const [items, setItems] = useState<Item<T>[]>([]);
  const itemsRef = useRef<Item<T>[]>([]);
  const motion = useRef(new Map<number, Motion>());
  const els = useRef(new Map<number, HTMLDivElement>());
  const avatarEl = useRef<HTMLDivElement>(null);
  const ax = useRef(195);
  const targetX = useRef(195);
  const nextKey = useRef(1);
  const spawnIn = useRef(0.6);
  const pace = useRef(1);
  const over = useRef(false);

  useEffect(() => { ax.current = targetX.current = geo.W / 2; }, [geo.W]);

  const commit = useCallback((list: Item<T>[]) => { itemsRef.current = list; setItems(list); }, []);
  const fallNow = useCallback(() => cb.current.fallS / pace.current, []);

  /** Drops one card if the door has one now; false = try again in a moment. */
  const spawn = useCallback((): boolean => {
    const g = geoRef.current;
    const live = itemsRef.current.filter((i) => i.state === "fall");
    const drop = cb.current.next(live.map((i) => i.drop));
    if (!drop) return false;
    // a free column, away from what is still near the top
    let x = rnd(g.S * 0.6, g.W - g.S * 0.6);
    for (let k = 0; k < 8; k++) {
      const clash = live.some((i) => { const m = motion.current.get(i.key); return m && m.y < g.S * 1.6 && Math.abs(m.x - x) < g.S * 1.15; });
      if (!clash) break;
      x = rnd(g.S * 0.6, g.W - g.S * 0.6);
    }
    const key = nextKey.current++;
    motion.current.set(key, { x, y: -g.S * 1.6, vy: (g.ground + g.S * 0.1) / fallNow(), amp: rnd(6, 16), ph: rnd(0, 6.28), t: 0 });
    commit([...itemsRef.current, { key, drop, hue: Math.floor(rnd(0, 360)), state: "fall" }]);
    return true;
  }, [commit, fallNow]);

  const remove = useCallback((key: number) => {
    motion.current.delete(key);
    els.current.delete(key);
    commit(itemsRef.current.filter((i) => i.key !== key));
  }, [commit]);

  const catchIt = useCallback((it: Item<T>) => {
    const how = cb.current.onCatch(it.drop);
    if (how === "gone") { remove(it.key); return; }
    if (how === "caught") {
      pace.current = clamp(pace.current * 1.05, PACE_MIN, PACE_MAX);
      commit(itemsRef.current.map((x) => (x.key === it.key ? { ...x, state: "caught" as const } : x)));
      setTimeout(() => remove(it.key), 650);
    } else {
      pace.current = clamp(pace.current * 0.9, PACE_MIN, PACE_MAX);
      const m = motion.current.get(it.key);
      if (m) m.vy = -260;
      commit(itemsRef.current.map((x) => (x.key === it.key ? { ...x, state: "flip" as const } : x)));
      setTimeout(() => remove(it.key), 1700);
    }
  }, [commit, remove]);

  /* the loop */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = geoRef.current;
      // the avatar follows the finger or the mouse
      ax.current += (targetX.current - ax.current) * Math.min(1, dt * 16);
      if (avatarEl.current) avatarEl.current.style.transform = `translate3d(${ax.current - g.A / 2}px,0,0)`;
      // the door's call just ended: the impostors still falling crash
      if (!over.current && cb.current.done()) {
        over.current = true;
        commit(itemsRef.current.map((i) => (i.state === "fall" && i.drop.kind === "imp" ? { ...i, state: "crash" as const } : i)));
      }
      if (!over.current) {
        spawnIn.current -= dt;
        const live = itemsRef.current.filter((i) => i.state === "fall").length;
        // nothing ready to fall yet (a picture still on its way): look again in a moment
        if (spawnIn.current <= 0 && live < g.maxOn) spawnIn.current = spawn() ? (fallNow() / g.maxOn) * rnd(0.8, 1.2) : 0.25;
      }
      // the net hangs above the avatar; an item's card sits under its parachute (CHUTE of its width)
      const netTop = g.H - 18 - g.A - g.S * 0.35;
      const netBottom = g.H - 18 - g.A * 0.35;
      const gone: number[] = [];
      let crashed: number[] = [];
      for (const it of itemsRef.current) {
        const m = motion.current.get(it.key);
        if (!m) continue;
        m.t += dt;
        if (it.state === "fall") {
          m.y += m.vy * dt;
          const cx = m.x + Math.sin(m.t * 1.4 + m.ph) * m.amp;
          const cardTop = m.y + g.S * CHUTE;
          const bottom = cardTop + g.S;
          if (!cb.current.done() && bottom >= netTop && cardTop <= netBottom && Math.abs(cx - ax.current) <= g.S * 0.45 + g.A * 0.35) {
            catchIt(it);
          } else if (bottom >= g.ground) {
            if (it.drop.kind === "true") {
              // a true card that lands is the door's to count
              pace.current = clamp(pace.current * 0.93, PACE_MIN, PACE_MAX);
              gone.push(it.key);
              cb.current.onLand(it.drop);
            } else {
              // an impostor that lands crashes into the meadow
              sfx.tap();
              crashed = [...crashed, it.key];
            }
          }
          const el = els.current.get(it.key);
          if (el) el.style.transform = `translate3d(${cx - g.S / 2}px,${m.y}px,0)`;
        } else if (it.state === "flip") {
          m.vy += 700 * dt;
          m.y += m.vy * dt * 0.5;
          const el = els.current.get(it.key);
          if (el) el.style.transform = `translate3d(${m.x - g.S / 2}px,${m.y}px,0)`;
        } else if (it.state === "crash") {
          if (m.end === undefined) m.end = m.t + 0.55;
          if (m.t > m.end) gone.push(it.key);
        }
      }
      if (crashed.length) commit(itemsRef.current.map((x) => (crashed.includes(x.key) ? { ...x, state: "crash" as const } : x)));
      for (const k of gone) remove(k);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spawn, remove, catchIt, commit, fallNow]);

  const move = (e: RPointerEvent) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    targetX.current = clamp(e.clientX - r.left, geo.A / 2, geo.W - geo.A / 2);
  };

  return (
    <div className="iv-stage" ref={rootRef} onPointerDown={move} onPointerMove={move}>
      {items.map((it) => (
        <div
          key={it.key}
          ref={(el) => { if (el) els.current.set(it.key, el); else els.current.delete(it.key); }}
          className={`iv-item is-${it.state}${it.drop.isPic ? " is-pic" : " is-gloss"}`}
          style={{ width: geo.S, ["--hue" as string]: it.hue } as CSSProperties}
        >
          <svg className="iv-chute" viewBox="0 0 100 62" aria-hidden="true">
            <path d="M4 34 C4 8 96 8 96 34 C84 27 72 27 61 34 C50 27 39 27 28 34 C17 27 12 28 4 34 Z" className="iv-canopy" />
            <path d="M6 34 L44 61 M33 33 L46 61 M67 33 L54 61 M94 34 L56 61" className="iv-lines" />
          </svg>
          <div className="iv-card" style={{ height: geo.S }}>
            <div className="iv-face">{it.drop.face(geo.S)}</div>
            <div className="iv-back">{it.drop.back(geo.S)}</div>
          </div>
          {it.state === "crash" ? <span className="iv-poof" aria-hidden="true" /> : null}
        </div>
      ))}

      <div className="iv-catcher" ref={avatarEl} style={{ width: geo.A, height: geo.A }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="iv-avatar" src={avatar} alt="" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="iv-net" src={NET} alt="" draggable={false} />
      </div>

      {hud}
      <div className={`iv-tip${tipAlert ? " is-alert" : ""}`}>{tip}</div>
    </div>
  );
}
