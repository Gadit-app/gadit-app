"use client";

/**
 * The Invading Words (מילים פולשות, Gadi 2026-11-24; the council chose the
 * game, Gadi named it). A word stays still at the top and is spoken. Its true
 * meanings fall from the sky on little parachutes, and so do impostors:
 * meanings of other words in the same disguise. The child moves the avatar
 * with the finger or the mouse and catches, with the net, every true meaning.
 * A caught impostor drops its disguise and says which word it really is; an
 * uncaught impostor crashes into the meadow; a missed true meaning comes back
 * once.
 *
 * By grade: before grade 3 only pictures (and only the meanings that can be
 * drawn); grades 3-4 pictures, or the short gloss for what cannot be drawn;
 * grade 5 and up mostly glosses, and faster. The pace follows the child's
 * accuracy. Each meaning has two pictures, so the child learns the meaning,
 * not one picture; the clue the child has not caught it with yet comes first.
 *
 * The server keeps the progress per meaning and pays Wordies only for
 * learning (lib/invaders/progress.ts). Plain DOM, one requestAnimationFrame
 * loop through refs, like Letter Catch; React renders only when an item is
 * born, caught or leaves.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { WaitText } from "@/components/WaitText";
import { TTSButton } from "@/components/design/TTSButton";
import { SfxToggle } from "@/components/SfxToggle";
import { TesterButton } from "@/components/TesterButton";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { avatarUrl } from "@/lib/family";
import { notifyActivity } from "@/lib/notify-activity-client";
import { sfx } from "@/lib/game-sfx";
import { setTesterGame } from "@/lib/tester";
import type { Band } from "@/lib/grade-bands";
import { blockedFor, isBlocked } from "@/lib/invaders/rules";
import type { Clue, SenseEvent, WordState } from "@/lib/invaders/progress";
import { invCopy, type InvCopy } from "./inv-i18n";

const ROUND = 5;
const NET = "/catch/fireflies/net.webp";
/** The parachute's height over an item's width (the svg is 100 x 62 at 92% width, less its overlap). */
const CHUTE = 0.52;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

type ApiSense = { id: string; g: string; pics: string[] };
type ApiWord = { w: string; t: string; s: ApiSense[] };
export type ApiData = { lang: string; scene: Record<string, string>; no: string[][]; words: ApiWord[]; progress: Record<string, WordState> };

type Mode = "pics" | "mixed" | "words";
const modeOf = (b: Band | null): Mode => (b === "pre1" || b === "g12" ? "pics" : b === "g34" || !b ? "mixed" : "words");
/** Seconds from the top of the sky to the meadow, before the pace. */
const FALL_S: Record<Mode, number> = { pics: 8, mixed: 6.8, words: 5.8 };

type Planned = { s: ApiSense; clue: Clue };
type Plan = { word: ApiWord; senses: Planned[] };
const picOf = (s: ApiSense, clue: Clue) => (clue === "p1" ? s.pics[0] : clue === "p2" ? s.pics[1] ?? s.pics[0] : undefined);

/** The meanings of a word that play in this mode, each with the clue it falls as. */
function planWord(word: ApiWord, mode: Mode, st: WordState | undefined): Plan | null {
  const senses: Planned[] = [];
  for (const s of word.s) {
    const drawn: Clue[] = (["p1", "p2"] as Clue[]).filter((_, i) => !!s.pics[i]);
    if (mode === "pics" && !drawn.length) continue;
    const options: Clue[] = mode === "pics" ? drawn : [...drawn, "g"];
    // the clue this meaning was not caught with yet comes first ("known" needs two)
    const used = st?.s[s.id]?.c ?? [];
    const fresh = options.filter((c) => !used.includes(c));
    const pool = fresh.length ? fresh : options;
    let clue = pick(pool);
    const pics = pool.filter((c) => c !== "g");
    if (mode === "mixed" && pics.length && Math.random() < 0.7) clue = pick(pics);
    if (mode === "words" && pool.includes("g") && Math.random() < 0.6) clue = "g";
    senses.push({ s, clue });
  }
  return senses.length ? { word, senses } : null;
}

/** Missed meanings first, then words not fully known, then new ones, the known last. */
function orderWords(d: ApiData, mode: Mode): ApiWord[] {
  const rank = (w: ApiWord) => {
    const st = d.progress[w.w];
    if (!st) return 2;
    const vals = w.s.map((s) => st.s[s.id]);
    if (vals.some((v) => v && v.x > 0)) return 0;
    if (vals.some((v) => !v || !v.k)) return 1;
    return 3;
  };
  const list = shuffle(d.words.filter((w) => planWord(w, mode, d.progress[w.w]))).sort((a, b) => rank(a) - rank(b));
  // A new player's first word shows the idea: a word with more than one meaning.
  if (!Object.keys(d.progress).length) {
    const i = list.findIndex((w) => (planWord(w, mode, undefined)?.senses.length ?? 0) >= 2);
    if (i > 0) list.unshift(...list.splice(i, 1));
  }
  return list;
}

type Decoy = { w: string; s: ApiSense };
/** Impostors for a word: meanings of words of another topic that are not ruled out. */
function decoysFor(d: ApiData, target: ApiWord, mode: Mode): Decoy[] {
  const blocked = blockedFor(d.no, target.w);
  const out: Decoy[] = [];
  for (const w of d.words) {
    if (w.t === target.t || w.w === target.w) continue;
    for (const s of w.s) {
      if (isBlocked(blocked, w.w, s.id)) continue;
      if (mode === "pics" && !s.pics.length) continue;
      out.push({ w: w.w, s });
    }
  }
  return out;
}

type Item = { key: number; kind: "true" | "imp"; w: string; id: string; clue: Clue; pic?: string; g: string; hue: number; state: "fall" | "caught" | "flip" | "crash" };
type Motion = { x: number; y: number; vy: number; amp: number; ph: number; t: number; end?: number };
export type WordResult = { events: SenseEvent[]; mistakes: number; caught: string[]; lost: string[] };

/* ---------- one word: the sky ---------- */
function Sky({ plan, decoys, mode, avatar, imp, c, onDone, onExit }: {
  plan: Plan; decoys: Decoy[]; mode: Mode; avatar: string; imp: string | null; c: InvCopy;
  onDone: (r: WordResult) => void; onExit: () => void;
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

  const [items, setItems] = useState<Item[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const motion = useRef(new Map<number, Motion>());
  const els = useRef(new Map<number, HTMLDivElement>());
  const avatarEl = useRef<HTMLDivElement>(null);
  const ax = useRef(195);
  const targetX = useRef(195);
  const nextKey = useRef(1);
  const spawnIn = useRef(0.6);
  const sinceTrue = useRef(1);
  const pace = useRef(1);
  const queue = useRef<string[]>(shuffle(plan.senses.map((p) => p.s.id)));
  const misses = useRef(new Map<string, number>());
  const caught = useRef(new Set<string>());
  const lost = useRef(new Set<string>());
  const events = useRef<SenseEvent[]>([]);
  const mistakes = useRef(0);
  const doneRef = useRef(false);
  const [filled, setFilled] = useState<string[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const tipTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const byId = useMemo(() => new Map(plan.senses.map((p) => [p.s.id, p])), [plan]);

  useEffect(() => { ax.current = targetX.current = geo.W / 2; }, [geo.W]);
  useEffect(() => () => clearTimeout(tipTm.current), []);

  const commit = (list: Item[]) => { itemsRef.current = list; setItems(list); };

  const spawn = useCallback(() => {
    const g = geoRef.current;
    const live = itemsRef.current.filter((i) => i.state === "fall");
    const trueLive = live.filter((i) => i.kind === "true").length;
    const free = queue.current.filter((id) => !live.some((i) => i.kind === "true" && i.id === id));
    const room = trueLive < (mode === "pics" ? 1 : 2);
    let item: Omit<Item, "key" | "hue" | "state">;
    if (free.length && room && (sinceTrue.current >= 2 || Math.random() < 0.45)) {
      const id = free[0];
      queue.current = queue.current.filter((x) => x !== id);
      const p = byId.get(id)!;
      item = { kind: "true", w: plan.word.w, id, clue: p.clue, pic: picOf(p.s, p.clue), g: p.s.g };
      sinceTrue.current = 0;
    } else if (decoys.length) {
      const onScreen = new Set(live.map((i) => `${i.w}:${i.id}`));
      const pool = decoys.filter((d) => !onScreen.has(`${d.w}:${d.s.id}`));
      const d = pick(pool.length ? pool : decoys);
      const pics: Clue[] = (["p1", "p2"] as Clue[]).filter((_, i) => !!d.s.pics[i]);
      const usePic = pics.length && (mode === "pics" || (mode === "mixed" ? Math.random() < 0.7 : Math.random() < 0.4));
      const clue: Clue = usePic ? pick(pics) : "g";
      item = { kind: "imp", w: d.w, id: d.s.id, clue, pic: picOf(d.s, clue), g: d.s.g };
      sinceTrue.current += 1;
    } else return;
    // a free column, away from what is still near the top
    let x = rnd(g.S * 0.6, g.W - g.S * 0.6);
    for (let k = 0; k < 8; k++) {
      const clash = live.some((i) => { const m = motion.current.get(i.key); return m && m.y < g.S * 1.6 && Math.abs(m.x - x) < g.S * 1.15; });
      if (!clash) break;
      x = rnd(g.S * 0.6, g.W - g.S * 0.6);
    }
    const key = nextKey.current++;
    const fall = FALL_S[mode] / pace.current;
    motion.current.set(key, { x, y: -g.S * 1.6, vy: (g.ground + g.S * 0.1) / fall, amp: rnd(6, 16), ph: rnd(0, 6.28), t: 0 });
    commit([...itemsRef.current, { ...item, key, hue: Math.floor(rnd(0, 360)), state: "fall" }]);
  }, [byId, decoys, mode, plan.word.w]);

  const remove = useCallback((key: number) => {
    motion.current.delete(key);
    els.current.delete(key);
    commit(itemsRef.current.filter((i) => i.key !== key));
  }, []);

  const say = (text: string) => {
    clearTimeout(tipTm.current);
    setTip(text);
    tipTm.current = setTimeout(() => setTip(null), 1700);
  };

  const finishIfDone = useCallback(() => {
    if (doneRef.current) return;
    if (caught.current.size + lost.current.size < plan.senses.length) return;
    doneRef.current = true;
    commit(itemsRef.current.map((i) => (i.state === "fall" && i.kind === "imp" ? { ...i, state: "crash" as const } : i)));
    setTimeout(() => (caught.current.size === plan.senses.length ? sfx.magic() : sfx.star()), 200);
    setTimeout(() => onDone({ events: events.current, mistakes: mistakes.current, caught: [...caught.current], lost: [...lost.current] }), 1300);
  }, [onDone, plan.senses.length]);

  const catchIt = useCallback((it: Item) => {
    if (it.kind === "true") {
      if (caught.current.has(it.id)) { remove(it.key); return; }
      caught.current.add(it.id);
      events.current.push({ id: it.id, r: "caught", c: it.clue });
      sfx.letter(caught.current.size - 1);
      setTimeout(() => sfx.correct(), 90);
      pace.current = clamp(pace.current * 1.05, 0.8, 1.45);
      setFilled((f) => [...f, it.id]);
      commit(itemsRef.current.map((x) => (x.key === it.key ? { ...x, state: "caught" as const } : x)));
      setTimeout(() => remove(it.key), 650);
      finishIfDone();
    } else {
      mistakes.current += 1;
      sfx.wrong();
      pace.current = clamp(pace.current * 0.9, 0.8, 1.45);
      say(c.impostor(it.w));
      const m = motion.current.get(it.key);
      if (m) m.vy = -260;
      commit(itemsRef.current.map((x) => (x.key === it.key ? { ...x, state: "flip" as const } : x)));
      setTimeout(() => remove(it.key), 1700);
    }
  }, [c, finishIfDone, remove]);

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
      if (!doneRef.current) {
        spawnIn.current -= dt;
        const live = itemsRef.current.filter((i) => i.state === "fall").length;
        if (spawnIn.current <= 0 && live < g.maxOn) { spawn(); spawnIn.current = (FALL_S[mode] / pace.current / g.maxOn) * rnd(0.8, 1.2); }
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
          if (!doneRef.current && bottom >= netTop && cardTop <= netBottom && Math.abs(cx - ax.current) <= g.S * 0.45 + g.A * 0.35) {
            catchIt(it);
          } else if (bottom >= g.ground) {
            if (it.kind === "true") {
              // a true meaning that lands is missed; it comes back once
              const n = (misses.current.get(it.id) ?? 0) + 1;
              misses.current.set(it.id, n);
              events.current.push({ id: it.id, r: "missed", c: it.clue });
              if (n >= 2) lost.current.add(it.id); else queue.current.push(it.id);
              pace.current = clamp(pace.current * 0.93, 0.8, 1.45);
              gone.push(it.key);
              finishIfDone();
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
  }, [spawn, remove, catchIt, finishIfDone, mode]);

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
          className={`iv-item is-${it.state}${it.pic ? " is-pic" : " is-gloss"}`}
          style={{ width: geo.S, ["--hue" as string]: it.hue } as CSSProperties}
        >
          <svg className="iv-chute" viewBox="0 0 100 62" aria-hidden="true">
            <path d="M4 34 C4 8 96 8 96 34 C84 27 72 27 61 34 C50 27 39 27 28 34 C17 27 12 28 4 34 Z" className="iv-canopy" />
            <path d="M6 34 L44 61 M33 33 L46 61 M67 33 L54 61 M94 34 L56 61" className="iv-lines" />
          </svg>
          <div className="iv-card" style={{ height: geo.S }}>
            <div className="iv-face">
              {it.pic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.pic} alt="" draggable={false} />
              ) : (
                <span className="iv-gloss" style={{ fontSize: clamp(geo.S * 0.15, 14, 19) }}>{it.g}</span>
              )}
            </div>
            <div className="iv-back">
              {imp ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imp} alt="" draggable={false} />
              ) : <span className="iv-imp-face" aria-hidden="true">😜</span>}
              <b dir="auto">{it.w}</b>
            </div>
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

      <div className="iv-hud">
        <div className="iv-hud-side">
          <button type="button" className="iv-round" onClick={onExit} aria-label={c.back}>✕</button>
          <SfxToggle className="iv-round" />
        </div>
        <div className="iv-word" dir="rtl">
          <span className="iv-say"><TTSButton text={plan.word.w} audioLang="he-IL" ariaLabel={c.hear} className="iv-tts" rate={0.85} useOpenAI /></span>
          <strong>{plan.word.w}</strong>
          <span className="iv-slots">
            {plan.senses.map((p) => {
              const got = filled.includes(p.s.id);
              const pic = got ? picOf(p.s, p.clue) : undefined;
              return (
                <span key={p.s.id} className={`iv-slot${got ? " is-on" : ""}`}>
                  {pic ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pic} alt="" />
                  ) : got ? "✓" : null}
                </span>
              );
            })}
          </span>
        </div>
        <div className="iv-hud-side is-end">
          <TesterButton game="invaders" word={plan.word.w} className="iv-round" />
        </div>
      </div>
      <div className={`iv-tip${tip ? " is-alert" : ""}`}>{tip ?? c.tip(plan.word.w)}</div>
    </div>
  );
}

/* ---------- the page ---------- */
/** `demo`: words given straight to the page (a local check of the screen), no sign-in and nothing saved. */
export function InvadersClient({ demo }: { demo?: ApiData } = {}) {
  const { user, planReady, loading, promptLogin, avatarId, avatarPhotoUrl, memberBand } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = invCopy(lang);
  const dir = lang === "he" || lang === "ar" || lang === "fa" ? "rtl" : "ltr";
  const mode = modeOf(memberBand);

  useEffect(() => {
    if (demo || loading) return;
    if (!user) promptLogin(c.title);
  }, [demo, loading, user, promptLogin, c.title]);

  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<"not_open" | "failed" | null>(null);
  const [queue, setQueue] = useState<ApiWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"door" | "intro" | "play" | "result" | "summary">("door");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [result, setResult] = useState<(WordResult & { wordies: number; known: string[] }) | null>(null);
  const [done, setDone] = useState(0);
  const [newToday, setNewToday] = useState(0);
  const [round, setRound] = useState(0);
  const introSay = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!demo && (loading || !user || !planReady || lang !== "he")) return;
    let alive = true;
    (async () => {
      if (demo) { setData(demo); setQueue(orderWords(demo, mode)); setIdx(0); return; }
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const r = await fetch(`/api/invaders?lang=${lang}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!alive) return;
        if (r.status === 403) { setError("not_open"); return; }
        if (!r.ok) { setError("failed"); return; }
        const d = (await r.json()) as ApiData;
        if (!alive) return;
        setData(d);
        setQueue(orderWords(d, mode));
        setIdx(0);
      } catch { if (alive) setError("failed"); }
    })();
    return () => { alive = false; };
  }, [demo, loading, user, planReady, lang, mode]);

  const word = queue[idx] ?? null;
  const avatar = avatarUrl(avatarId) ?? avatarPhotoUrl ?? "/avatars/look-hoodie-1.webp";
  const decoys = useMemo(() => (data && plan ? decoysFor(data, plan.word, mode) : []), [data, plan, mode]);

  // the pictures of the next words load ahead
  useEffect(() => {
    if (!data) return;
    for (const w of queue.slice(idx, idx + 2)) for (const s of w.s) for (const p of s.pics) { const im = new Image(); im.src = p; }
    if (data.scene.imp) { const im = new Image(); im.src = data.scene.imp; }
  }, [data, queue, idx]);

  useEffect(() => { setTesterGame("invaders", phase === "door" ? undefined : word?.w); }, [phase, word]);
  useEffect(() => () => setTesterGame(""), []);

  useEffect(() => {
    if (phase !== "intro") return;
    const tm = setTimeout(() => introSay.current?.querySelector("button")?.click(), 500);
    return () => clearTimeout(tm);
  }, [phase, idx]);

  const openWord = (i: number) => {
    const w = queue[i];
    if (!w || !data) return;
    setIdx(i);
    setPlan(planWord(w, mode, data.progress[w.w]));
    setResult(null);
    setPhase("intro");
  };

  const finish = useCallback(async (r: WordResult) => {
    if (!plan || !data) return;
    setResult({ ...r, wordies: 0, known: [] });
    setPhase("result");
    if (demo || !user) return;
    try {
      const token = await user.getIdToken();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/invaders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang: data.lang, w: plan.word.w, ids: plan.senses.map((p) => p.s.id), events: r.events, mistakes: r.mistakes, tz }),
      });
      if (res.ok) {
        const j = (await res.json()) as { wordies: number; met: string[]; known: string[]; state: WordState };
        setResult((x) => (x ? { ...x, wordies: j.wordies, known: j.known } : x));
        setNewToday((n) => n + j.met.length);
        setData((d) => (d ? { ...d, progress: { ...d.progress, [plan.word.w]: j.state } } : d));
        if (j.wordies > 0) setTimeout(() => sfx.star(), 400);
      }
      void notifyActivity(user, { kind: "game", label: `${c.title} · ${plan.word.w}`, score: r.caught.length, total: plan.senses.length });
    } catch { /* the game goes on */ }
  }, [plan, user, data, c.title, demo]);

  const next = () => {
    const n = done + 1;
    setDone(n);
    if (n % ROUND === 0) { sfx.win(); setPhase("summary"); return; }
    if (idx + 1 < queue.length) openWord(idx + 1);
    else if (data) { const q = orderWords(data, mode); setQueue(q); setIdx(0); setPlan(planWord(q[0], mode, data.progress[q[0].w])); setPhase("intro"); }
  };
  const more = () => {
    setRound((x) => x + 1);
    setNewToday(0);
    if (idx + 1 < queue.length) openWord(idx + 1);
    else if (data) { const q = orderWords(data, mode); setQueue(q); setIdx(0); setPlan(planWord(q[0], mode, data.progress[q[0].w])); setPhase("intro"); }
  };
  const exit = () => router.push(href("/play"));
  const toDoor = () => { sfx.whoosh(); setPhase("door"); };

  const bg = data?.scene.bg;
  const rootStyle = bg ? { backgroundImage: `url(${bg})` } : undefined;

  return (
    <div className="iv-root" style={rootStyle}>
      <style>{CSS}</style>

      {plan && phase === "play" ? (
        <Sky key={`${round}:${idx}:${plan.word.w}`} plan={plan} decoys={decoys} mode={mode} avatar={avatar} imp={data?.scene.imp ?? null} c={c} onDone={finish} onExit={toDoor} />
      ) : null}

      {plan && phase === "intro" ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={toDoor} aria-label={c.back}>✕</button>
          <div className="iv-card-big">
            <span className="iv-label">{c.yourWord((done % ROUND) + 1, ROUND)}</span>
            <strong className="iv-big-word" dir="rtl">{plan.word.w}</strong>
            <span ref={introSay}><TTSButton text={plan.word.w} audioLang="he-IL" ariaLabel={c.hear} className="iv-tts" rate={0.85} useOpenAI /></span>
            <p className="iv-goal">{c.goal(plan.senses.length)}</p>
            <button type="button" className="iv-btn" onClick={() => { sfx.whoosh(); setPhase("play"); }}>{c.go}</button>
          </div>
        </div>
      ) : null}

      {plan && result && phase === "result" ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={toDoor} aria-label={c.back}>✕</button>
          <div className="iv-card-big">
            <strong className="iv-big-word is-small" dir="rtl">{plan.word.w}</strong>
            <span className="iv-title">{result.caught.length === plan.senses.length ? c.allFound : c.someFound(result.caught.length, plan.senses.length)}</span>
            <ul className="iv-senses">
              {plan.senses.map((p) => {
                const ok = result.caught.includes(p.s.id);
                const pic = p.s.pics[0];
                return (
                  <li key={p.s.id} className={ok ? "is-ok" : "is-miss"}>
                    {pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pic} alt="" />
                    ) : <span className="iv-sense-dot" aria-hidden="true">{ok ? "✓" : "?"}</span>}
                    <span className="iv-sense-text">
                      <b>{p.s.g}</b>
                      {!ok ? <small>{c.missed}</small> : result.known.includes(p.s.id) ? <small className="is-known">{c.knownNow}</small> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
            {result.wordies > 0 ? <span className="iv-wordies">{c.wordies(result.wordies)}</span> : null}
            <button type="button" className="iv-btn" onClick={next}>{c.next}</button>
          </div>
        </div>
      ) : null}

      {phase === "summary" ? (
        <div className="iv-wrap" dir={dir}>
          <button type="button" className="iv-round iv-x" onClick={toDoor} aria-label={c.back}>✕</button>
          <div className="iv-card-big">
            <strong className="iv-title is-big">{c.roundDone}</strong>
            <p className="iv-goal">{newToday > 0 ? c.newToday(newToday) : c.newTodayNone}</p>
            <div className="iv-row">
              <button type="button" className="iv-btn" onClick={more}>{c.more}</button>
              <button type="button" className="iv-btn is-ghost" onClick={exit}>{c.back}</button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "door" ? (
        <div className="iv-wrap is-door" dir={dir}>
          <div className="iv-card-big">
            {data?.scene.imp ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="iv-door-imp" src={data.scene.imp} alt="" />
            ) : null}
            <strong className="iv-title is-big">{c.title}</strong>
            <p className="iv-goal">{c.sub}</p>
            {lang !== "he" && !demo ? <p className="iv-note">{c.otherLang}</p>
              : error === "not_open" ? <p className="iv-note">{c.notOpen}</p>
              : error === "failed" || (data && !queue.length) ? <p className="iv-note">{c.noWords}</p>
              : !word ? <span className="iv-note"><WaitText text={c.loading} /></span>
              : <button type="button" className="iv-btn" onClick={() => { sfx.whoosh(); openWord(idx); }}>{c.start}</button>}
            <button type="button" className="iv-link" onClick={exit}>{c.back}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const CSS = `
.iv-root{position:fixed;inset:0;z-index:60;overflow:hidden;background:linear-gradient(180deg,#9fdcf0 0%,#cdeef5 45%,#ffe3c8 78%,#9bd58a 78%,#7cc46c 100%) center bottom/cover no-repeat;color:#14202b;-webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.iv-stage{position:absolute;inset:0;overflow:hidden;cursor:default;touch-action:none}
.iv-item{position:absolute;left:0;top:0;will-change:transform;pointer-events:none;display:grid;justify-items:center}
.iv-chute{width:92%;height:auto;margin-bottom:-6px;filter:drop-shadow(0 3px 4px #0002)}
.iv-canopy{fill:hsl(var(--hue) 80% 66%);stroke:#fff;stroke-width:2}
.iv-lines{stroke:#ffffffcc;stroke-width:1.6;fill:none}
.iv-card{position:relative;width:100%;perspective:600px}
.iv-face,.iv-back{position:absolute;inset:0;border-radius:22px;backface-visibility:hidden;-webkit-backface-visibility:hidden;transition:transform .45s cubic-bezier(.3,1.4,.5,1)}
.iv-face{background:#fff;border:4px solid hsl(var(--hue) 75% 70%);box-shadow:0 8px 18px #0003;overflow:hidden;display:grid;place-items:center}
.iv-face img{width:100%;height:100%;object-fit:cover;display:block}
.iv-gloss{padding:8px 10px;font-weight:800;line-height:1.25;text-align:center;color:#2a2350}
.iv-item.is-gloss .iv-face{background:#fff8e6}
.iv-back{background:#7c3aed;border:4px solid #c4b5fd;transform:rotateY(180deg);display:grid;place-items:center;align-content:center;gap:2px;color:#fff;box-shadow:0 8px 18px #0004}
.iv-back img{width:72%;height:auto;mix-blend-mode:multiply;background:#fff;border-radius:50%}
.iv-back b{font-size:20px;font-weight:900}
.iv-imp-face{font-size:44px}
.iv-item.is-flip .iv-face{transform:rotateY(180deg)}
.iv-item.is-flip .iv-back{transform:rotateY(0)}
.iv-item.is-flip .iv-chute{opacity:0;transition:opacity .2s}
.iv-item.is-caught .iv-card,.iv-item.is-caught .iv-chute{animation:iv-caught .6s ease-in forwards}
.iv-item.is-crash .iv-card,.iv-item.is-crash .iv-chute{animation:iv-crash .5s ease-in forwards}
.iv-poof{position:absolute;left:50%;bottom:-10px;width:120%;height:40px;transform:translateX(-50%);background:radial-gradient(closest-side,#fff9,#fff0);animation:iv-poof .5s ease-out forwards}
.iv-catcher{position:absolute;left:0;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:3;will-change:transform;pointer-events:none}
.iv-avatar{width:100%;height:100%;border-radius:50%;border:4px solid #fff;background:#fff;object-fit:cover;box-shadow:0 6px 18px #0006}
.iv-net{position:absolute;width:86%;left:50%;top:-58%;transform:translateX(-50%) rotate(-8deg);filter:drop-shadow(0 4px 6px #0005)}
.iv-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;right:10px;display:grid;grid-template-columns:1fr minmax(0,560px) 1fr;align-items:center;gap:8px;z-index:5}
.iv-hud-side{display:flex;align-items:center;gap:8px;min-width:96px}
.iv-hud-side.is-end{justify-content:flex-end}
.iv-round{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0003;font-size:20px;display:grid;place-items:center;cursor:pointer;color:#14202b}
.iv-word{min-width:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 10px;background:#fff8e6;border-radius:20px;padding:6px 14px;box-shadow:0 2px 12px #0003}
.iv-word strong{font-size:clamp(26px,7vw,36px);font-weight:900;line-height:1.1}
.iv-tts{width:40px;height:40px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#4338ca}
.iv-tts svg{width:24px;height:24px}
.iv-slots{display:flex;gap:5px}
.iv-slot{width:30px;height:30px;border-radius:50%;border:3px dashed #c7d2fe;display:grid;place-items:center;overflow:hidden;font-weight:900;color:#16a34a;background:#fff}
.iv-slot.is-on{border:3px solid #22c55e;animation:iv-pop .35s}
.iv-slot img{width:100%;height:100%;object-fit:cover}
.iv-tip{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 72px);transform:translateX(-50%);background:#ffffffe8;border-radius:999px;padding:8px 16px;font-weight:700;font-size:16px;box-shadow:0 4px 14px #0003;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;z-index:4}
.iv-tip.is-alert{background:#7c3aed;color:#fff;animation:iv-pop .3s}
.iv-wrap{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:16px;background:#1b2a4a55;overflow-y:auto}
.iv-wrap.is-door{background:#1b2a4a33}
.iv-x{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);inset-inline-start:10px;z-index:2}
.iv-card-big{display:grid;gap:12px;justify-items:center;text-align:center;background:#fff;border-radius:28px;padding:22px 24px;box-shadow:0 14px 40px #0006;max-width:420px;width:100%;animation:iv-popin .35s cubic-bezier(.2,1.4,.4,1)}
.iv-label{color:#5f6b73;font-weight:700}
.iv-big-word{font-size:56px;font-weight:900;line-height:1.1}
.iv-big-word.is-small{font-size:40px}
.iv-title{font-weight:900;font-size:20px}
.iv-title.is-big{font-size:28px}
.iv-goal{margin:0;color:#3b4a56;font-size:17px;line-height:1.45}
.iv-note{color:#5f6b73;font-weight:700}
.iv-door-imp{width:120px;height:auto;border-radius:50%}
.iv-btn{border:0;border-radius:999px;background:#7c3aed;color:#fff;font:inherit;font-weight:900;font-size:19px;padding:12px 30px;cursor:pointer;box-shadow:0 6px 16px #7c3aed55}
.iv-btn.is-ghost{background:#eef2f6;color:#14202b;box-shadow:none}
.iv-link{border:0;background:none;font:inherit;color:#5f6b73;font-weight:700;cursor:pointer;text-decoration:underline}
.iv-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.iv-senses{list-style:none;margin:0;padding:0;display:grid;gap:8px;width:100%}
.iv-senses li{display:flex;align-items:center;gap:12px;padding:6px;border-radius:16px;background:#f0fdf4;text-align:start}
.iv-senses li.is-miss{background:#fff7ed}
.iv-senses img{width:56px;height:56px;border-radius:12px;object-fit:cover;flex:0 0 56px}
.iv-sense-dot{width:56px;height:56px;flex:0 0 56px;border-radius:12px;background:#fff;display:grid;place-items:center;font-weight:900;font-size:22px;color:#7c3aed}
.iv-sense-text{display:grid;gap:2px;min-width:0}
.iv-sense-text b{font-size:17px}
.iv-sense-text small{color:#9a3412;font-weight:700}
.iv-sense-text small.is-known{color:#15803d}
.iv-wordies{background:#fff3c4;color:#5b3a00;border-radius:999px;padding:4px 14px;font-weight:900}
@keyframes iv-caught{to{transform:translateY(-40px) scale(.2);opacity:0}}
@keyframes iv-crash{60%{transform:scaleY(.6) scaleX(1.15)}to{transform:scale(.4);opacity:0}}
@keyframes iv-poof{from{opacity:1;transform:translateX(-50%) scale(.6)}to{opacity:0;transform:translateX(-50%) scale(1.4)}}
@keyframes iv-pop{50%{transform:scale(1.15)}}
@keyframes iv-popin{from{transform:scale(.85);opacity:0}}
@media (max-width:560px){.iv-hud{grid-template-columns:auto minmax(0,1fr) auto}.iv-hud-side{min-width:0}.iv-word{padding:4px 10px;gap:6px}.iv-slot{width:24px;height:24px}}
`;
