"use client";

/**
 * Skin effects (Gadi 2026-10-30, from Hila Halfon's son: "every skin should
 * have its own power"). When a child wearing a skin saves a new word or
 * finishes a practice, the skin "does something" on screen: the space crew
 * launches a rocket, wizards burst sparkles, street style floats music
 * notes, ninjas dash across in smoke, game day bounces a ball, wild hoodies
 * leave paw prints. Gold skins play a bigger, golden version.
 *
 * Purely visual: never changes a score or a result. Fires on the
 * "gadit:skin-fx" window event (playSkinFx below), kids wearing a skin only,
 * and stays still for prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { lookById, type LookDef, type LookSet } from "@/lib/looks";
import { SKIN_FX_EVENT as EVENT, type SkinFxKind } from "@/lib/skin-fx";

type Motion = "rise" | "burst" | "dash" | "bounce" | "walk";
const MOTION: Record<LookSet, Motion> = {
  space: "rise", magic: "burst", street: "rise", ninja: "dash", sport: "bounce", hoodie: "walk",
};
/** The main emoji per skin, and the small trail emoji per set. */
const LEAD: Record<string, string> = {
  "look-space-1": "🚀", "look-space-2": "🚀", "look-space-3": "🛸", "look-space-4": "🌌",
  "look-magic-1": "✨", "look-magic-2": "🦉", "look-magic-3": "🪄", "look-magic-4": "📖",
  "look-street-1": "🎧", "look-street-2": "🎵", "look-street-3": "🎶", "look-street-4": "💿",
  "look-ninja-1": "🥷", "look-ninja-2": "🥷", "look-ninja-3": "⚡", "look-ninja-4": "🐉",
  "look-sport-1": "⚽", "look-sport-2": "🏀", "look-sport-3": "👟", "look-sport-4": "🏆",
  "look-hoodie-1": "🦊", "look-hoodie-2": "🐼", "look-hoodie-3": "🩷", "look-hoodie-4": "🔥",
};
const TRAIL: Record<LookSet, string[]> = {
  space: ["✦", "⭐", "✧"], magic: ["✨", "⭐", "💫"], street: ["🎵", "🎶", "✨"],
  ninja: ["💨", "💨", "✦"], sport: ["🎉", "✨", "⭐"], hoodie: ["🐾", "🐾", "✨"],
};

function spawn(layer: HTMLElement, text: string, size: number, x: number, y: number, frames: Keyframe[], ms: number, delay = 0) {
  const el = document.createElement("span");
  el.textContent = text;
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:${size}px;line-height:1;pointer-events:none;will-change:transform,opacity;opacity:0;`;
  layer.appendChild(el);
  const a = el.animate(frames, { duration: ms, delay, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" });
  a.onfinish = () => el.remove();
}

/** Plays one effect on a layer (exported for previews). */
export function play(layer: HTMLElement, look: LookDef, kind: SkinFxKind) {
  const W = window.innerWidth, H = window.innerHeight;
  const gold = look.tier === 4;
  const big = kind === "practice";
  const n = (big ? 10 : 5) * (gold ? 2 : 1);
  const lead = LEAD[look.id] ?? "✨";
  const trail = TRAIL[look.set];
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  const pick = () => trail[Math.floor(Math.random() * trail.length)];
  const leadSize = big ? 64 : 46;

  if (gold) {
    const glow = document.createElement("div");
    glow.style.cssText = "position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 55%, rgba(251,191,36,.38), rgba(251,191,36,0) 60%);opacity:0;";
    layer.appendChild(glow);
    glow.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 1400, fill: "forwards" }).onfinish = () => glow.remove();
  }

  switch (MOTION[look.set]) {
    case "rise": {
      const x0 = W / 2 - leadSize / 2;
      spawn(layer, lead, leadSize, x0, H, [
        { transform: "translate(0,0) rotate(-8deg)", opacity: 1 },
        { transform: `translate(${r(-30, 30)}px,${-H * 0.55}px) rotate(6deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${r(-40, 40)}px,${-H - 120}px) rotate(0deg)`, opacity: 0 },
      ], 1500);
      for (let i = 0; i < n; i++) {
        const x = look.set === "street" ? r(W * 0.15, W * 0.85) : x0 + r(-50, 50);
        spawn(layer, pick(), r(18, 30), x, H - 20, [
          { transform: "translate(0,0) scale(.6)", opacity: 0 },
          { transform: `translate(${r(-30, 30)}px,${-r(H * 0.25, H * 0.7)}px) scale(1)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${r(-60, 60)}px,${-r(H * 0.6, H * 0.95)}px) scale(.8)`, opacity: 0 },
        ], r(1100, 1700), i * 60);
      }
      break;
    }
    case "burst": {
      const cx = W / 2, cy = H / 2;
      spawn(layer, lead, leadSize, cx - leadSize / 2, cy - leadSize / 2, [
        { transform: "scale(.3) rotate(-20deg)", opacity: 0 },
        { transform: "scale(1.15) rotate(8deg)", opacity: 1, offset: 0.3 },
        { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.7 },
        { transform: "scale(1.4)", opacity: 0 },
      ], 1300);
      for (let i = 0; i < n * 1.6; i++) {
        const ang = (i / (n * 1.6)) * Math.PI * 2 + r(-0.2, 0.2);
        const dist = r(110, Math.min(W, H) * 0.42);
        spawn(layer, pick(), r(16, 28), cx - 10, cy - 10, [
          { transform: "translate(0,0) scale(.4)", opacity: 0 },
          { transform: `translate(${Math.cos(ang) * dist * 0.7}px,${Math.sin(ang) * dist * 0.7}px) scale(1.1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(.7)`, opacity: 0 },
        ], r(900, 1400), 80);
      }
      break;
    }
    case "dash": {
      const y = H * 0.45;
      spawn(layer, lead, leadSize, -leadSize, y, [
        { transform: "translate(0,0) skewX(-12deg)", opacity: 1 },
        { transform: `translate(${W * 0.5}px,-20px) skewX(-12deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${W + leadSize * 2}px,0) skewX(-12deg)`, opacity: 1 },
      ], 900);
      for (let i = 0; i < n; i++) {
        const x = (i / n) * W;
        spawn(layer, pick(), r(26, 40), x, y + r(-10, 30), [
          { transform: "scale(.4)", opacity: 0 },
          { transform: "scale(1.2)", opacity: 0.9, offset: 0.3 },
          { transform: `scale(1.6) translateY(-20px)`, opacity: 0 },
        ], 900, (i / n) * 800);
      }
      break;
    }
    case "bounce": {
      const y0 = H * 0.7;
      spawn(layer, lead, leadSize, -leadSize, y0, [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${W * 0.25}px,${-H * 0.3}px) rotate(180deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${W * 0.45}px,0) rotate(360deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${W * 0.65}px,${-H * 0.18}px) rotate(540deg)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${W * 0.8}px,0) rotate(720deg)`, opacity: 1, offset: 0.8 },
        { transform: `translate(${W + leadSize * 2}px,${-H * 0.08}px) rotate(900deg)`, opacity: 1 },
      ], 1600);
      for (let i = 0; i < n; i++) {
        spawn(layer, pick(), r(16, 28), r(W * 0.1, W * 0.9), -30, [
          { transform: "translateY(0) rotate(0)", opacity: 0 },
          { transform: `translateY(${H * 0.3}px) rotate(${r(-90, 90)}deg)`, opacity: 1, offset: 0.3 },
          { transform: `translateY(${H * r(0.7, 1)}px) rotate(${r(-200, 200)}deg)`, opacity: 0 },
        ], r(1300, 1900), r(200, 700));
      }
      break;
    }
    case "walk": {
      const steps = big ? 8 : 5;
      const y = H * 0.62;
      for (let i = 0; i < steps * (gold ? 1.5 : 1); i++) {
        const x = (i + 0.5) * (W / (steps * (gold ? 1.5 : 1)));
        spawn(layer, "🐾", 30, x - 15, y + (i % 2 ? -24 : 10), [
          { transform: "scale(.4) rotate(90deg)", opacity: 0 },
          { transform: "scale(1) rotate(90deg)", opacity: 1, offset: 0.2 },
          { transform: "scale(1) rotate(90deg)", opacity: 1, offset: 0.7 },
          { transform: "scale(.9) rotate(90deg)", opacity: 0 },
        ], 1300, i * 110);
      }
      spawn(layer, lead, leadSize, W / 2 - leadSize / 2, y - leadSize - 30, [
        { transform: "translateY(30px) scale(.5)", opacity: 0 },
        { transform: "translateY(-10px) scale(1.1)", opacity: 1, offset: 0.35 },
        { transform: "translateY(0) scale(1)", opacity: 1, offset: 0.75 },
        { transform: "translateY(-30px) scale(1)", opacity: 0 },
      ], 1500, steps * 60);
      break;
    }
  }
}

export function SkinFx() {
  const { familyRole, avatarId } = useAuth();
  const layerRef = useRef<HTMLDivElement | null>(null);
  const lookRef = useRef<LookDef | null>(null);
  const kidRef = useRef(false);
  const lastRef = useRef(0);

  useEffect(() => {
    lookRef.current = lookById(avatarId);
    kidRef.current = familyRole === "kid";
  }, [avatarId, familyRole]);

  useEffect(() => {
    const onFx = (e: Event) => {
      const look = lookRef.current;
      const layer = layerRef.current;
      if (!look || !layer || !kidRef.current) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const now = Date.now();
      if (now - lastRef.current < 1200) return; // one at a time
      lastRef.current = now;
      const kind = (e as CustomEvent<{ kind?: SkinFxKind }>).detail?.kind === "word" ? "word" : "practice";
      try { play(layer, look, kind); } catch { /* an effect never breaks the page */ }
    };
    window.addEventListener(EVENT, onFx);
    return () => window.removeEventListener(EVENT, onFx);
  }, []);

  return <div ref={layerRef} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 400, pointerEvents: "none", overflow: "hidden" }} />;
}
