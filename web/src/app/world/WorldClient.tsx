"use client";

/**
 * The world game, first world: the jungle (Gadi 2026-10-30).
 *
 * A side-view trail. The child's word hides as empty slots; at every fork
 * there are doors, each with a letter, and the child picks the door with the
 * NEXT letter (a real spelling decision: the wrong doors carry look-alike or
 * sound-alike letters). A wrong door opens on a funny animal ("That's k!")
 * and costs nothing; after two wrong tries the right door glows. Things along
 * the way hide stars. At the gate the child spells the whole word from
 * memory. Then a curtain of leaves closes and opens on the child's own
 * jungle clearing, where the word now lives (its picture).
 *
 * Words come from the learning engine (/api/learn: due words first, the
 * school list, then new words at the child's level), and the result goes
 * back to it, so the trail is also the review system. A finished word counts
 * as a completed practice (skins) and tells the parent.
 *
 * Plain DOM + CSS transforms (no game engine): the trail is linear, text in
 * 41 languages and right-to-left come for free, and it stays light on cheap
 * phones. Hebrew words walk right to left, in reading direction.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { avatarUrl } from "@/lib/family";
import { learnTargets } from "@/lib/learn/targets";
import { notifyActivity } from "@/lib/notify-activity-client";
import { TTSButton } from "@/components/design/TTSButton";
import { WORLDS, worldArt, type WorldDef, type WorldId } from "@/lib/world/worlds";
import { forkLetters, gateTiles, keyMatches, lettersOf, spellable, spellForm, type SpellLang } from "@/lib/world/letters";
import { worldCopy, type WorldCopy } from "@/lib/world/world-i18n";

export type TrailWord = { raw: string; w: string; nq?: string; t: string; pic: string; lang: SpellLang };
type WorldItem = { w: string; lang: string; t: string; pic: string | null; at: number };
type LearnPoolItem = { w: string; t: string; nq?: string; en?: string };

/** Keeps a Latin word or letter in its place inside right-to-left text. */
const iso = (s: string) => `⁨${s}⁩`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const hashOf = (s: string) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- little sounds (no files) ---------- */
let actx: AudioContext | null = null;
function tone(freqs: number[], dur = 0.12, type: OscillatorType = "triangle", slide = 0) {
  try {
    actx = actx ?? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx!.createOscillator();
      const g = actx!.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t0 + i * dur);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t0 + (i + 1) * dur);
      g.gain.setValueAtTime(0.0001, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
      o.connect(g).connect(actx!.destination);
      o.start(t0 + i * dur);
      o.stop(t0 + (i + 1) * dur + 0.02);
    });
  } catch { /* sound is optional */ }
}
const sfx = {
  right: () => tone([660, 880], 0.1),
  wrong: () => tone([300], 0.32, "sine", -180),
  star: () => tone([988, 1318], 0.08, "sine"),
  gate: () => tone([523, 659, 784, 1046], 0.13),
};

/* ---------- words ---------- */
async function loadWords(token: string, ui: string): Promise<{ words: TrailWord[]; reads: string | null }> {
  const get = async (q: string) => {
    const r = await fetch(`/api/learn?ui=${encodeURIComponent(ui)}${q}`, { headers: { Authorization: `Bearer ${token}` } });
    return r.ok ? ((await r.json()) as { profile?: { lang?: SpellLang | null; reads?: string | null }; pool?: LearnPoolItem[] }) : null;
  };
  let j = await get("");
  let lang = j?.profile?.lang ?? null;
  if (!lang || !j?.pool?.length) {
    lang = learnTargets(ui)[0] as SpellLang;
    j = await get(`&lang=${lang}`);
  }
  const l = lang as SpellLang;
  const words = (j?.pool ?? [])
    .filter((x) => spellable(x.w, l))
    .map((x) => ({ raw: x.w, w: spellForm(x.w, l), nq: x.nq, t: x.t, pic: l === "en" ? x.w : (x.en ?? ""), lang: l }));
  return { words, reads: j?.profile?.reads ?? null };
}

async function fetchPics(token: string, words: string[], generate: boolean): Promise<Record<string, string>> {
  const list = [...new Set(words.filter(Boolean))];
  if (!list.length) return {};
  try {
    const r = await fetch("/api/play/images", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ words: list, generate }),
    });
    return r.ok ? (((await r.json()) as { images?: Record<string, string> }).images ?? {}) : {};
  } catch { return {}; }
}

/* ---------- the curtain ---------- */
function Curtain({ world, open, children, onTap }: { world: WorldDef; open: boolean; children?: React.ReactNode; onTap?: () => void }) {
  const img = `url(${worldArt(world, "curtain")})`;
  return (
    <div className={`wt-curtain${open ? " is-open" : ""}`} onClick={onTap} aria-hidden={open}>
      <div className="wt-curtain-half is-l" style={{ backgroundImage: img }} />
      <div className="wt-curtain-half is-r" style={{ backgroundImage: img }} />
      {!open && children ? <div className="wt-curtain-body">{children}</div> : null}
    </div>
  );
}

/* ---------- the trail ---------- */
type TrailResult = { wrongs: number; gateFirstTry: boolean; stars: number };

function Trail({ word, world, c, avatar, doors, started, pic, onDone, onExit }: {
  word: TrailWord; world: WorldDef; c: WorldCopy; avatar: string | null; doors: number; started: boolean; pic: string | null;
  onDone: (r: TrailResult) => void; onExit: () => void;
}) {
  const rtl = word.lang === "he";
  const audioLang = word.lang === "he" ? "he-IL" : "en-US";
  const letters = useMemo(() => lettersOf(word.w, word.lang), [word]);
  const forks = useMemo(() => letters.map((l) => forkLetters(l, word.lang, doors)), [letters, word.lang, doors]);
  const spots = useMemo(() => {
    const h = hashOf(word.w);
    return letters.map((_, i) => ({ kind: world.spots[(h + i) % world.spots.length], star: ((h >> (i + 3)) & 3) !== 0 }));
  }, [letters, word.w, world.spots]);

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
    const doorH = clamp(Math.min(H * 0.27, W * (doors >= 3 ? 0.33 : 0.42)), 110, 240);
    const doorW = doorH * world.doorAspect;
    const avatarS = clamp(H * 0.12, 62, 104);
    const seg = clamp(W * 0.95, 380, 860);
    const p0 = W * 0.38;
    const forkX = (i: number) => p0 + i * seg + seg * 0.7;
    const doorX = (i: number, j: number) => forkX(i) + (j - (doors - 1) / 2) * doorW * 1.14;
    const waitX = (i: number) => doorX(i, 0) - doorW * 0.95;
    const spotX = (i: number) => p0 + i * seg + seg * 0.22;
    const gateW = clamp(W * 0.6, 230, 420);
    const gateX = p0 + letters.length * seg + seg * 0.45;
    const len = gateX + W * 0.7;
    return { W, H, groundH, doorH, doorW, avatarS, seg, forkX, doorX, waitX, spotX, gateW, gateX, len, speed: Math.max(300, W * 0.55) };
  }, [size, doors, letters.length, world.doorAspect]);

  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  /* walking: refs + one animation loop, no re-render per frame */
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
      const cam = clamp(posRef.current - g.W * 0.16, 0, Math.max(0, g.len - g.W));
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

  const [fork, setFork] = useState(0);
  const [phase, setPhase] = useState<"walk" | "gate" | "open">("walk");
  const [tried, setTried] = useState<Set<string>>(() => new Set());
  const [opened, setOpened] = useState<Record<number, number>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ i: number; j: number; animal: string } | null>(null);
  const [found, setFound] = useState<Record<number, "star" | "fly">>({});
  const [stars, setStars] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const busy = useRef(false);
  const wrongs = useRef(0);
  const gateFirstTry = useRef(true);

  useEffect(() => {
    if (!started) return;
    walkTo(geoRef.current.waitX(0));
  }, [started, walkTo]);

  const tryDoor = useCallback((i: number, j: number) => {
    if (!started || busy.current || phase !== "walk" || i !== fork || opened[i] !== undefined) return;
    if (tried.has(`${i}:${j}`)) return;
    busy.current = true;
    const g = geoRef.current;
    const letter = forks[i][j];
    const right = letter === letters[i];
    walkTo(g.doorX(i, j) - g.doorW * 0.42, () => {
      if (right) {
        sfx.right();
        setOpened((o) => ({ ...o, [i]: j }));
        setTimeout(() => {
          const last = i === letters.length - 1;
          walkTo(last ? g.gateX - g.gateW * 0.62 : g.waitX(i + 1), () => {
            busy.current = false;
            if (last) setPhase("gate");
          });
          setFork(i + 1);
        }, 420);
      } else {
        sfx.wrong();
        wrongs.current += 1;
        setShake(`${i}:${j}`);
        setWrong({ i, j, animal: world.animals[(hashOf(word.w) + wrongs.current) % world.animals.length] });
        setTried((s) => new Set(s).add(`${i}:${j}`));
        setTimeout(() => {
          setWrong(null);
          setShake(null);
          walkTo(g.waitX(i), () => { busy.current = false; });
        }, 1400);
      }
    });
  }, [started, phase, fork, opened, tried, forks, letters, walkTo, world.animals, word.w]);

  const openSpot = useCallback((i: number) => {
    if (found[i]) return;
    const s = spots[i];
    setFound((f) => ({ ...f, [i]: s.star ? "star" : "fly" }));
    if (s.star) {
      sfx.star();
      setStars((n) => n + 1);
      setToast(c.foundStar);
      setTimeout(() => setToast(null), 1300);
    }
  }, [found, spots, c.foundStar]);

  /* the gate: spell the word from memory */
  const tiles = useMemo(() => gateTiles(word.w, word.lang), [word]);
  const [typed, setTyped] = useState<number[]>([]);
  const [reveal, setReveal] = useState(false);
  const check = useCallback((idxs: number[]) => {
    const guess = idxs.map((k) => tiles[k]).join("");
    if (guess === word.w) {
      sfx.gate();
      setPhase("open");
      const g = geoRef.current;
      setTimeout(() => walkTo(g.gateX + g.gateW * 0.1), 500);
      setTimeout(() => onDone({ wrongs: wrongs.current, gateFirstTry: gateFirstTry.current, stars }), 1500);
    } else {
      sfx.wrong();
      gateFirstTry.current = false;
      setReveal(true);
      setTimeout(() => { setReveal(false); setTyped([]); }, 2200);
    }
  }, [tiles, word.w, walkTo, onDone, stars]);
  const addTile = useCallback((k: number) => {
    if (phase !== "gate" || reveal || typed.includes(k) || typed.length >= letters.length) return;
    const next = [...typed, k];
    setTyped(next);
    if (next.length === letters.length) setTimeout(() => check(next), 250);
  }, [phase, reveal, typed, letters.length, check]);

  /* keyboard: a letter picks its door, or its tile at the gate */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || e.metaKey || e.ctrlKey || e.altKey) return;
      if (phase === "walk") {
        const j = (forks[fork] ?? []).findIndex((l, jj) => keyMatches(e.key, l, word.lang) && !tried.has(`${fork}:${jj}`));
        if (j >= 0) tryDoor(fork, j);
      } else if (phase === "gate") {
        if (e.key === "Backspace") { setTyped((t) => t.slice(0, -1)); return; }
        const k = tiles.findIndex((l, kk) => keyMatches(e.key, l, word.lang) && !typed.includes(kk));
        if (k >= 0) addTile(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, phase, forks, fork, tried, tryDoor, tiles, typed, addTile, word.lang]);

  const side = rtl ? "right" : "left";
  const at = (x: number, w: number) => ({ [side]: `${x - w / 2}px` });
  const bottomOf = (f: number) => `${geo.groundH * f}px`;
  const shown = (i: number) => (phase === "walk" ? i < fork : true);

  return (
    <div className="wt-stage" ref={rootRef} style={{ background: world.sky }}>
      <div className="wt-far" ref={farRef} style={{ backgroundImage: `url(${worldArt(world, "bg-far")})`, bottom: geo.groundH * 0.9 }} />
      <div className="wt-mid" ref={midRef} style={{ backgroundImage: `url(${worldArt(world, "bg-mid")})`, bottom: geo.groundH * 0.72 }} />
      <div className="wt-ground" style={{ height: geo.groundH, background: `linear-gradient(${world.ground[0]}, ${world.ground[1]})`, boxShadow: `inset 0 10px 0 ${world.edge[0]}, inset 0 14px 0 ${world.edge[1]}` }} />

      <div className="wt-track" ref={trackRef} style={{ width: geo.len, [side]: 0 }}>
        {spots.map((s, i) => {
          const w = clamp(geo.H * 0.17, 80, 150);
          return (
            <button key={`s${i}`} type="button" className={`wt-spot${found[i] ? " is-found" : ""}`} style={{ ...at(geo.spotX(i), w), width: w, bottom: bottomOf(0.78) }} onClick={() => openSpot(i)} aria-label="?">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={worldArt(world, s.kind)} alt="" draggable={false} />
              {found[i] ? <span className={`wt-spot-pop${found[i] === "star" ? "" : " is-fly"}`}>{found[i] === "star" ? "⭐" : "🦋"}</span> : null}
            </button>
          );
        })}

        {forks.map((ls, i) => ls.map((l, j) => {
          const key = `${i}:${j}`;
          const isOpen = opened[i] === j;
          const isTried = tried.has(key);
          const glow = i === fork && phase === "walk" && !isOpen && l === letters[i] && [...tried].filter((k) => k.startsWith(`${i}:`)).length >= 2;
          const cls = ["wt-door", isOpen && "is-open", isTried && "is-tried", glow && "is-glow", shake === key && "is-shake", i === fork && phase === "walk" && started && "is-next"].filter(Boolean).join(" ");
          return (
            <button key={key} type="button" className={cls} style={{ ...at(geo.doorX(i, j), geo.doorW), width: geo.doorW, bottom: bottomOf(0.42) }} onClick={() => tryDoor(i, j)} aria-label={l} disabled={i !== fork || isOpen}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={worldArt(world, "door")} alt="" draggable={false} />
              <span className="wt-door-letter" style={{ fontSize: geo.doorH * 0.17, top: `${world.plaqueY}%`, color: world.letterColor }}>{l}</span>
            </button>
          );
        }))}

        {wrong ? (
          <div className="wt-animal" style={{ ...at(geo.doorX(wrong.i, wrong.j), geo.doorW * 1.3), width: geo.doorW * 1.3, bottom: geo.groundH * 0.42 + geo.doorH * 0.55 }}>
            <div className="wt-bubble">{c.thats(iso(forks[wrong.i][wrong.j]))}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={worldArt(world, wrong.animal)} alt="" draggable={false} />
          </div>
        ) : null}

        <div className={`wt-gate${phase === "open" ? " is-open" : ""}`} style={{ ...at(geo.gateX, geo.gateW), width: geo.gateW, bottom: bottomOf(0.4) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={worldArt(world, "gate")} alt="" draggable={false} />
          {phase === "open" ? <span className="wt-gate-burst" aria-hidden="true">✨</span> : null}
        </div>

        <div className="wt-avatar" ref={avatarRef} style={{ width: geo.avatarS, height: geo.avatarS, bottom: bottomOf(0.22) }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" draggable={false} />
          ) : <span>🧒</span>}
        </div>
      </div>

      <div className="wt-hud">
        <button type="button" className="wt-round" onClick={onExit} aria-label={c.back}>✕</button>
        <div className="wt-slots" dir={rtl ? "rtl" : "ltr"}>
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="wt-slots-pic" src={pic} alt="" />
          ) : null}
          {letters.map((l, i) => {
            const fromGate = phase !== "walk" ? (reveal ? l : (tiles[typed[i]] ?? (phase === "open" ? l : ""))) : "";
            const ch = phase === "walk" ? (shown(i) ? l : "") : fromGate;
            return <span key={i} className={`wt-slot${ch ? " is-filled" : ""}${reveal ? " is-reveal" : ""}`}>{ch}</span>;
          })}
        </div>
        <span className="wt-round wt-tts"><TTSButton text={word.w} audioLang={audioLang} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} /></span>
        <span className="wt-stars">⭐ {stars}</span>
      </div>

      {started && phase === "walk" ? <div className="wt-tip">{c.pick}</div> : null}
      {toast ? <div className="wt-toast">{toast}</div> : null}

      {phase === "gate" ? (
        <div className="wt-gatepanel">
          <strong className="wt-gate-title">{reveal ? c.almost : c.gate}</strong>
          <div className="wt-tiles" dir={rtl ? "rtl" : "ltr"}>
            {tiles.map((l, k) => (
              <button key={k} type="button" className="wt-tile" disabled={typed.includes(k) || reveal} onClick={() => addTile(k)}>{l}</button>
            ))}
          </div>
          <div className="wt-gate-row">
            <button type="button" className="wt-btn is-ghost" onClick={() => setTyped((t) => t.slice(0, -1))} disabled={!typed.length || reveal}>{c.erase}</button>
            <span className="wt-gate-hint">{c.orType}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- the child's world (the clearing) ---------- */
function Clearing({ world, c, items, fresh, onNext, onBack, ui }: {
  world: WorldDef; c: WorldCopy; items: WorldItem[]; fresh: string | null; onNext: () => void; onBack: () => void; ui: string;
}) {
  const { user } = useAuth();
  const [pics, setPics] = useState<Record<string, string>>({});
  useEffect(() => {
    const need = items.filter((x) => !x.pic).map((x) => x.lang === "en" ? x.w : "").filter(Boolean);
    if (!user || !need.length) return;
    let alive = true;
    (async () => {
      const got = await fetchPics(await user.getIdToken(), need, false);
      if (alive) setPics(got);
    })();
    return () => { alive = false; };
  }, [items, user]);
  const n = items.length;
  const inArea = n % world.areaSize;
  const newArea = !!fresh && inArea === 0 && n > 0;
  const freshItem = fresh ? items.find((x) => `${x.lang}:${x.w}` === fresh) : null;
  const scale = n > 24 ? 0.7 : n > 12 ? 0.85 : 1;
  return (
    <div className="wt-clearing" style={{ backgroundImage: `url(${worldArt(world, "clearing")})` }} dir={ui === "he" || ui === "ar" || ui === "fa" ? "rtl" : "ltr"}>
      <div className="wt-clearing-head">
        <strong>{c.worlds[world.id].my}</strong>
        <span>{c.worlds[world.id].wordsIn(n)}</span>
      </div>
      <div className="wt-meadow">
        {n === 0 ? <div className="wt-empty">{c.worlds[world.id].empty}</div> : null}
        {items.map((x) => {
          const h = hashOf(`${x.lang}:${x.w}`);
          const isFresh = fresh === `${x.lang}:${x.w}`;
          const src = x.pic || pics[x.w] || null;
          return (
            <div key={`${x.lang}:${x.w}`} className={`wt-friend${isFresh ? " is-fresh" : ""}`} style={{ left: `${6 + (h % 82)}%`, top: `${8 + ((h >>> 8) % 70)}%`, transform: `translate(-50%,-50%) scale(${isFresh ? 1.25 : scale})` }}>
              <span className="wt-friend-pic">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" loading="lazy" />
                ) : <span aria-hidden="true">🌱</span>}
              </span>
              <span className="wt-friend-name" dir={x.lang === "he" ? "rtl" : "ltr"}>{x.w}</span>
            </div>
          );
        })}
      </div>
      <div className="wt-clearing-foot">
        {freshItem ? <div className="wt-arrived">{newArea ? c.worlds[world.id].newArea : c.worlds[world.id].arrived(iso(freshItem.w))}</div> : null}
        {!newArea ? <div className="wt-area">{c.toArea(world.areaSize - inArea)}</div> : null}
        <div className="wt-row">
          <button type="button" className="wt-btn" onClick={onNext}>{c.next}</button>
          <button type="button" className="wt-btn is-ghost" onClick={onBack}>🗺️ {c.mapTitle}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- the page ---------- */
export function WorldClient({ worldId = "jungle", demo }: { worldId?: WorldId; demo?: TrailWord[] }) {
  const world = WORLDS[worldId];
  const { user, plan, planReady, loading, promptLogin, avatarId, avatarPhotoUrl } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = worldCopy(lang);
  const wn = c.worlds[world.id];

  useEffect(() => {
    if (demo || loading) return;
    if (!user) { promptLogin(wn.title); return; }
    if (!planReady) return;
    if (plan === "basic" || plan === "clear") router.replace(href("/pricing"));
  }, [demo, loading, planReady, user, plan, promptLogin, router, href, wn.title]);

  const [queue, setQueue] = useState<TrailWord[] | null>(null);
  const [reads, setReads] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pics, setPics] = useState<Record<string, string>>({});
  const [items, setItems] = useState<WorldItem[]>([]);
  const [phase, setPhase] = useState<"door" | "intro" | "trail" | "closing" | "clearing">("door");
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const introSay = useRef<HTMLSpanElement>(null);

  const load = useCallback(async () => {
    if (demo) { setQueue(demo); setIdx(0); return; }
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const [{ words, reads: r }, worldRes] = await Promise.all([
        loadWords(token, lang),
        fetch("/api/world", { headers: { Authorization: `Bearer ${token}` } }).then((x) => (x.ok ? x.json() : null)).catch(() => null),
      ]);
      const w = (worldRes as { worlds?: Record<string, { items?: WorldItem[] }> } | null)?.worlds?.[worldId]?.items ?? [];
      setItems(w);
      setReads(r);
      setQueue(words);
      setIdx(0);
      setFailed(!words.length);
      const got = await fetchPics(token, words.slice(0, 8).map((x) => x.pic), true);
      setPics((p) => ({ ...p, ...got }));
    } catch { setFailed(true); }
  }, [demo, user, lang, worldId]);
  useEffect(() => {
    if (!demo && (loading || !user || !planReady || plan === "basic" || plan === "clear")) return;
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [demo, loading, user, planReady, plan, load]);

  const word = queue?.[idx] ?? null;
  const doors = reads === "yes" ? 3 : reads === "no" || reads === "little" ? 2 : (word && lettersOf(word.w, word.lang).length >= 5 ? 3 : 2);
  const avatar = avatarUrl(avatarId) ?? avatarPhotoUrl ?? null;

  // The intro says the word by itself.
  useEffect(() => {
    if (phase !== "intro") return;
    const tm = setTimeout(() => introSay.current?.querySelector("button")?.click(), 500);
    return () => clearTimeout(tm);
  }, [phase, idx]);

  const enter = () => {
    if (!word) return;
    setCurtainOpen(true);
    setPhase("intro");
  };

  const finish = useCallback(async (r: TrailResult) => {
    if (!word || (!user && !demo)) return;
    setCurtainOpen(false);
    setPhase("closing");
    const ok = r.gateFirstTry && r.wrongs <= 1;
    const total = lettersOf(word.w, word.lang).length;
    const key = `${word.lang}:${word.w}`;
    const pic = pics[word.pic] ?? null;
    if (demo || !user) {
      setItems((cur) => (cur.some((x) => x.w === word.w && x.lang === word.lang) ? cur : [...cur, { w: word.w, lang: word.lang, t: word.t, pic, at: Date.now() }]));
    } else try {
      const token = await user.getIdToken();
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      fetch("/api/learn", { method: "POST", headers, body: JSON.stringify({ action: "results", lang: word.lang, results: [{ w: word.raw, ok }] }) }).catch(() => undefined);
      void notifyActivity(user, { kind: "game", label: `${wn.title} · ${word.w}`, score: Math.max(0, total - r.wrongs), total });
      const res = await fetch("/api/world", { method: "POST", headers, body: JSON.stringify({ world: worldId, w: word.w, lang: word.lang, t: word.t, pic, stars: r.stars }) });
      if (res.ok) {
        setItems((cur) => (cur.some((x) => x.w === word.w && x.lang === word.lang) ? cur : [...cur, { w: word.w, lang: word.lang, t: word.t, pic, at: Date.now() }]));
      }
    } catch { /* the world still opens */ }
    setFresh(key);
    setTimeout(() => { setPhase("clearing"); setCurtainOpen(true); }, 900);
  }, [demo, user, word, pics, wn.title, worldId]);

  const next = useCallback(async () => {
    setFresh(null);
    const n = idx + 1;
    if (queue && n < queue.length) {
      setIdx(n);
      setRound((x) => x + 1);
      setPhase("intro");
      if (user) {
        const ahead = queue.slice(n, n + 4).map((x) => x.pic).filter((p) => p && !pics[p]);
        if (ahead.length) {
          const got = await fetchPics(await user.getIdToken(), ahead, true);
          setPics((p) => ({ ...p, ...got }));
        }
      }
    } else {
      setQueue(null);
      setPhase("intro");
      setRound((x) => x + 1);
      await load();
    }
  }, [idx, queue, user, pics, load]);

  const exit = () => router.push(href("/world"));

  return (
    <div className="wt-root">
      <style>{CSS}</style>
      {word && (phase === "intro" || phase === "trail" || phase === "closing") ? (
        <Trail
          key={`${round}:${word.lang}:${word.w}`}
          word={word}
          world={world}
          c={c}
          avatar={avatar}
          doors={doors}
          started={phase === "trail"}
          pic={pics[word.pic] ?? null}
          onDone={finish}
          onExit={exit}
        />
      ) : null}

      {phase === "clearing" ? <Clearing world={world} c={c} items={items} fresh={fresh} onNext={next} onBack={exit} ui={lang} /> : null}

      {word && phase === "intro" ? (
        <div className="wt-intro-wrap">
          <div className="wt-intro">
            <span className="wt-intro-label">{c.yourWord}</span>
            {pics[word.pic] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="wt-intro-pic" src={pics[word.pic]} alt="" />
            ) : null}
            <strong className="wt-intro-word" dir={word.lang === "he" ? "rtl" : "ltr"}>{word.nq || word.w}</strong>
            {word.t ? <span className="wt-intro-t">{word.t}</span> : null}
            <span ref={introSay} className="wt-intro-say">
              <TTSButton text={word.w} audioLang={word.lang === "he" ? "he-IL" : "en-US"} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} />
            </span>
            <button type="button" className="wt-btn" onClick={() => setPhase("trail")}>{c.go}</button>
          </div>
        </div>
      ) : null}

      {!queue && !failed && phase !== "clearing" ? <div className="wt-loading">{c.loading}</div> : null}
      {failed && phase !== "clearing" ? (
        <div className="wt-loading">
          <p>{c.noWords}</p>
          <button type="button" className="wt-btn" onClick={exit}>{c.back}</button>
        </div>
      ) : null}

      <Curtain world={world} open={curtainOpen} onTap={phase === "door" ? enter : undefined}>
        {phase === "door" ? (
          <div className="wt-door-title">
            <strong>{wn.title}</strong>
            <button type="button" className="wt-btn is-big" disabled={!word} onClick={(e) => { e.stopPropagation(); enter(); }}>{word ? wn.enter : c.loading}</button>
            <button type="button" className="wt-link" onClick={(e) => { e.stopPropagation(); exit(); }}>{c.back}</button>
          </div>
        ) : null}
      </Curtain>
    </div>
  );
}

const CSS = `
.wt-root{position:fixed;inset:0;z-index:60;overflow:hidden;background:#bfe3d0;color:#14202b;-webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.wt-stage{position:absolute;inset:0;overflow:hidden}
.wt-far{position:absolute;left:0;right:0;top:0;background-repeat:repeat-x;background-size:auto 100%;background-position-y:bottom}
.wt-mid{position:absolute;left:0;right:0;height:46%;background-repeat:repeat-x;background-size:auto 100%;background-position-y:bottom;pointer-events:none}
.wt-ground{position:absolute;left:0;right:0;bottom:0}
.wt-ground::after{content:"";position:absolute;inset:18px 0 0;background:radial-gradient(circle at 20% 40%,#0000 0 6px,#0000 7px),radial-gradient(#b8986455 2px,#0000 3px) 0 0/46px 30px;opacity:.9}
.wt-track{position:absolute;top:0;bottom:0;will-change:transform}
.wt-spot,.wt-door{position:absolute;border:0;background:none;padding:0;cursor:pointer}
.wt-spot img,.wt-door img,.wt-gate img,.wt-animal img{width:100%;display:block;pointer-events:none}
.wt-spot{transition:transform .2s}
.wt-spot:active{transform:scale(.96)}
.wt-spot.is-found{animation:wt-wiggle .5s}
.wt-spot-pop{position:absolute;left:50%;top:0;font-size:34px;transform:translate(-50%,-10%);animation:wt-rise 1.2s ease-out forwards}
.wt-spot-pop.is-fly{animation:wt-fly 1.6s ease-out forwards}
.wt-door{transition:opacity .3s,transform .3s,filter .3s}
.wt-door:disabled{cursor:default}
.wt-door-letter{position:absolute;left:50%;top:47%;transform:translate(-50%,-52%);font-weight:800;line-height:1;color:#3b2a14;text-shadow:0 1px 0 #fff9;pointer-events:none;font-family:inherit}
.wt-door.is-next{animation:wt-breathe 1.8s ease-in-out infinite}
.wt-door.is-tried{opacity:.45;filter:grayscale(.6)}
.wt-door.is-open{opacity:.35;transform:translateY(6px) scale(.96)}
.wt-door.is-open .wt-door-letter{color:#0a7a3d;animation:wt-up .6s ease-out forwards}
.wt-door.is-glow img{filter:drop-shadow(0 0 10px #ffe066) drop-shadow(0 0 22px #ffd23f)}
.wt-door.is-shake{animation:wt-shake .45s}
.wt-animal{position:absolute;display:grid;justify-items:center;gap:4px;animation:wt-popin .35s cubic-bezier(.2,1.6,.4,1);pointer-events:none;z-index:3}
.wt-animal img{width:70%}
.wt-bubble{background:#fff;border-radius:16px;padding:6px 14px;font-weight:800;font-size:22px;box-shadow:0 4px 14px #0003;white-space:nowrap}
.wt-gate{position:absolute;transition:transform .8s,opacity .8s,filter .8s}
.wt-gate.is-open{transform:scale(1.1);opacity:0;filter:brightness(1.8)}
.wt-gate-burst{position:absolute;left:50%;top:40%;font-size:64px;transform:translate(-50%,-50%);animation:wt-burst .9s ease-out}
.wt-avatar{position:absolute;border-radius:50%;border:4px solid #fff;background:#fff;box-shadow:0 6px 14px #0004;overflow:hidden;display:grid;place-items:center;font-size:40px;z-index:2}
.wt-avatar img{width:100%;height:100%;object-fit:cover}
.wt-avatar.is-walking{animation:wt-bob .32s ease-in-out infinite alternate}
.wt-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;right:10px;display:flex;align-items:center;gap:8px;z-index:5}
.wt-round{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0002;font-size:20px;display:grid;place-items:center;cursor:pointer;color:#14202b}
.wt-tts-btn{width:44px;height:44px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#0a7472}
.wt-tts-btn svg{width:24px;height:24px}
.wt-slots{flex:1 1 auto;min-width:0;display:flex;justify-content:center;align-items:center;gap:5px;background:#fffffff0;border-radius:18px;padding:6px 10px;box-shadow:0 2px 10px #0002;overflow:hidden}
.wt-slots-pic{width:40px;height:40px;border-radius:10px;object-fit:cover;margin-inline-end:4px}
.wt-slot{width:clamp(24px,7vw,36px);height:42px;border-bottom:4px solid #0a7472;font-size:clamp(22px,6vw,30px);font-weight:800;display:grid;place-items:center}
.wt-slot.is-filled{animation:wt-pop .35s}
.wt-slot.is-reveal{color:#c2410c;border-color:#c2410c}
.wt-stars{background:#fffe;border-radius:999px;padding:8px 12px;font-weight:800;box-shadow:0 2px 8px #0002;white-space:nowrap}
.wt-tip,.wt-toast{position:absolute;left:50%;transform:translateX(-50%);background:#fffffff2;border-radius:999px;padding:10px 18px;font-weight:700;font-size:17px;box-shadow:0 4px 14px #0003;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;z-index:4}
.wt-tip{top:calc(env(safe-area-inset-top,0px) + 66px)}
.wt-toast{top:calc(env(safe-area-inset-top,0px) + 116px);animation:wt-popin .3s}
.wt-gatepanel{position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 64px);z-index:6;display:grid;gap:10px;justify-items:center;padding:14px 14px 12px;background:#fffffff2;border-radius:24px;box-shadow:0 8px 24px #0003;animation:wt-popin .35s ease-out;max-width:560px;margin-inline:auto}
.wt-gate-title{font-size:19px;text-align:center}
.wt-tiles{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:520px}
.wt-tile{width:50px;height:54px;border-radius:14px;border:0;background:#f8d66d;color:#3b2a14;font-size:28px;font-weight:800;box-shadow:0 4px 0 #c99a2e;cursor:pointer;font-family:inherit}
.wt-tile:active{transform:translateY(3px);box-shadow:0 1px 0 #c99a2e}
.wt-tile:disabled{opacity:.25;cursor:default}
.wt-gate-row,.wt-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center}
.wt-gate-hint{color:#5f6b73;font-size:14px}
.wt-btn{border:0;border-radius:999px;background:#0a7472;color:#fff;font:inherit;font-weight:800;font-size:18px;padding:12px 26px;cursor:pointer;box-shadow:0 4px 0 #075452}
.wt-btn:disabled{opacity:.5}
.wt-btn.is-ghost{background:#fff;color:#0a7472;box-shadow:0 0 0 2px #0a7472 inset}
.wt-btn.is-big{font-size:22px;padding:16px 34px}
.wt-link{border:0;background:none;color:#fff;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;text-shadow:0 1px 4px #000a}
.wt-curtain{position:absolute;inset:0;z-index:20;pointer-events:auto}
.wt-curtain.is-open{pointer-events:none}
.wt-curtain-half{position:absolute;top:0;bottom:0;width:51%;background-size:cover;background-position:center;transition:transform 1.1s cubic-bezier(.7,0,.25,1);box-shadow:0 0 30px #0007}
.wt-curtain-half.is-l{left:0}
.wt-curtain-half.is-r{right:0;transform:scaleX(-1)}
.wt-curtain.is-open .wt-curtain-half.is-l{transform:translateX(-102%)}
.wt-curtain.is-open .wt-curtain-half.is-r{transform:scaleX(-1) translateX(-102%)}
.wt-curtain-body{position:absolute;inset:0;display:grid;place-items:center;padding:16px}
.wt-door-title{display:grid;gap:18px;justify-items:center;text-align:center;background:#00000059;padding:22px 26px;border-radius:28px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.wt-door-title strong{font-size:clamp(34px,9vw,58px);color:#fff;text-shadow:0 3px 0 #1f5130,0 6px 18px #000a;line-height:1.1}
.wt-intro-wrap{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:16px;background:#0003}
.wt-intro{display:grid;gap:12px;justify-items:center;text-align:center;background:#fff;border-radius:28px;padding:22px 26px;box-shadow:0 14px 40px #0005;max-width:360px;width:100%;animation:wt-popin .35s cubic-bezier(.2,1.4,.4,1)}
.wt-intro-label{color:#5f6b73;font-weight:700}
.wt-intro-pic{width:150px;height:150px;border-radius:22px;object-fit:cover}
.wt-intro-word{font-size:44px;line-height:1.1}
.wt-intro-t{color:#5f6b73;font-size:18px}
.wt-loading{position:absolute;inset:0;z-index:7;display:grid;place-items:center;align-content:center;gap:14px;font-weight:700;font-size:18px;color:#1f5130;text-align:center;padding:16px}
.wt-clearing{position:absolute;inset:0;background-size:cover;background-position:center;display:grid;grid-template-rows:auto 1fr auto}
.wt-clearing-head{margin:calc(env(safe-area-inset-top,0px) + 12px) 16px 0;justify-self:center;background:#fffffff0;border-radius:999px;padding:8px 18px;display:flex;gap:12px;align-items:baseline;box-shadow:0 2px 10px #0002}
.wt-clearing-head strong{font-size:20px}
.wt-clearing-head span{color:#5f6b73;font-size:14px}
.wt-meadow{position:relative;margin:10px 16px}
.wt-empty{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#fffe;border-radius:16px;padding:10px 16px;font-weight:700;text-align:center}
.wt-friend{position:absolute;display:grid;justify-items:center;gap:2px;transition:transform .5s}
.wt-friend-pic{width:clamp(58px,15vw,84px);height:clamp(58px,15vw,84px);border-radius:50%;border:4px solid #fff;background:#fff;box-shadow:0 6px 14px #0004;overflow:hidden;display:grid;place-items:center;font-size:32px}
.wt-friend-pic img{width:100%;height:100%;object-fit:cover}
.wt-friend-name{background:#fffe;border-radius:999px;padding:1px 8px;font-weight:800;font-size:13px}
.wt-friend.is-fresh{z-index:2;animation:wt-drop .8s cubic-bezier(.2,1.5,.4,1)}
.wt-friend.is-fresh .wt-friend-pic{box-shadow:0 0 0 4px #ffd23f,0 0 30px #ffd23f}
.wt-clearing-foot{display:grid;gap:10px;justify-items:center;padding:12px 16px calc(18px + env(safe-area-inset-bottom,0px))}
.wt-arrived{background:#fff;border-radius:18px;padding:10px 18px;font-weight:800;font-size:19px;text-align:center;box-shadow:0 4px 14px #0003;animation:wt-popin .4s}
.wt-area{background:#fffd;border-radius:999px;padding:6px 14px;font-weight:700;font-size:14px}
@keyframes wt-bob{from{transform:translateY(0) rotate(-3deg)}to{transform:translateY(-8px) rotate(3deg)}}
@keyframes wt-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes wt-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes wt-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@keyframes wt-rise{0%{opacity:0;transform:translate(-50%,10%) scale(.5)}30%{opacity:1;transform:translate(-50%,-60%) scale(1.2)}100%{opacity:0;transform:translate(-50%,-220%) scale(1)}}
@keyframes wt-fly{0%{opacity:0;transform:translate(-50%,0)}20%{opacity:1}100%{opacity:0;transform:translate(60px,-260px) rotate(20deg)}}
@keyframes wt-up{to{transform:translate(-50%,-260%) scale(1.4);opacity:0}}
@keyframes wt-popin{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes wt-pop{0%{transform:scale(.4)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes wt-burst{from{transform:translate(-50%,-50%) scale(.3);opacity:1}to{transform:translate(-50%,-50%) scale(3);opacity:0}}
@keyframes wt-slide{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes wt-drop{0%{transform:translate(-50%,-260%) scale(.4);opacity:0}100%{transform:translate(-50%,-50%) scale(1.25);opacity:1}}
@media (prefers-reduced-motion:reduce){.wt-root *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
