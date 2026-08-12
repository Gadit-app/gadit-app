"use client";

import { useEffect, useRef } from "react";

/**
 * Kids celebration (Gadi 2026-08-12, from the moms' Zoom feedback):
 * fireworks burst across the screen the moment a child hits a milestone
 * (rank up, weekly goal complete, or a streak milestone). Self-contained
 * canvas — no library, offline-safe, and it respects reduced-motion.
 *
 * Fires whenever `runId` increases to a new positive value; the caller
 * bumps runId when it detects a fresh achievement (see KidsGameHeader).
 */

const COLORS = ["#F59E0B", "#0EA5A5", "#7C3AED", "#EC4899", "#10B981", "#3B82F6", "#EF4444"];

export function KidsCelebration({ runId }: { runId: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (runId <= 0) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
    let parts: Particle[] = [];

    const burst = (cx: number, cy: number) => {
      const n = 44;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const sp = 2.2 + Math.random() * 4.2;
        parts.push({
          x: cx, y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          color: COLORS[(i + Math.floor(Math.random() * COLORS.length)) % COLORS.length],
          size: 2 + Math.random() * 3,
        });
      }
    };

    // A few staggered bursts across the upper half of the screen.
    const spots: Array<[number, number]> = [
      [w * 0.28, h * 0.34],
      [w * 0.72, h * 0.30],
      [w * 0.50, h * 0.44],
      [w * 0.40, h * 0.26],
    ];
    const timers = spots.map(([x, y], i) => window.setTimeout(() => burst(x, y), i * 220));

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += 0.09;       // gravity
        p.vx *= 0.99;       // drag
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      parts = parts.filter((p) => p.life > 0 && p.y < h + 20);
      if (performance.now() - start < 2600 || parts.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      ctx.clearRect(0, 0, w, h);
    };
  }, [runId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
    />
  );
}
