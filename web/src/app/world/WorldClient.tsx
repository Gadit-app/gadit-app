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

import { WaitText } from "@/components/WaitText";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { avatarUrl } from "@/lib/family";
import { learnTargets } from "@/lib/learn/targets";
import { notifyActivity } from "@/lib/notify-activity-client";
import { TTSButton } from "@/components/design/TTSButton";
import { SfxToggle } from "@/components/SfxToggle";
import { sfx } from "@/lib/game-sfx";
import { DECOR_COST, decorKinds, WORLDS, worldArt, type WorldDef, type WorldId } from "@/lib/world/worlds";
import { forkLetters, gateTiles, keyMatches, lettersOf, registerAlphabet, spellable, spellForm, RTL_SPELL, type SpellLang } from "@/lib/world/letters";
import { isBankSpell, readSpellChoice } from "@/lib/world/spell-choice";
import { Glyph } from "./Glyph";
import { friendsCopy } from "@/lib/world/friends-i18n";
import { worldCopy, type WorldCopy } from "@/lib/world/world-i18n";
import { worldGoal } from "@/lib/world/world-goal-i18n";

/** native: a word from the world's own bank, any language (results go to /api/world/words). */
export type TrailWord = { raw: string; w: string; nq?: string; t: string; pic: string; lang: SpellLang; native?: boolean; gift?: { id: string; from: string } };
/** x, y: where the child put the word in the clearing (% of the meadow), once they have moved one. */
export type Decor = { id: string; kind: string; at: number; x?: number; y?: number };
export type WorldItem = { w: string; lang: string; t: string; pic: string | null; at: number; x?: number; y?: number; from?: string };
type LearnPoolItem = { w: string; t: string; nq?: string; en?: string };

/** Keeps a Latin word or letter in its place inside right-to-left text. */
const iso = (s: string) => `⁨${s}⁩`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const hashOf = (s: string) => { let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619); } return h >>> 0; };

/* sounds: the shared kit in lib/game-sfx.ts (2026-10-31) */

/* ---------- words ---------- */
export async function loadWords(token: string, ui: string, choice: string | null): Promise<{ words: TrailWord[]; reads: string | null }> {
  // Any language with letters (Gadi 2026-11-01): the world's own word track.
  if (choice && isBankSpell(ui, choice)) {
    const r = await fetch(`/api/world/words?lang=${encodeURIComponent(choice)}&ui=${encodeURIComponent(ui)}`, { headers: { Authorization: `Bearer ${token}` } });
    const j = r.ok ? ((await r.json()) as { pool?: LearnPoolItem[]; alphabet?: string[]; reads?: string | null }) : null;
    registerAlphabet(choice, j?.alphabet ?? []);
    const words = (j?.pool ?? [])
      .filter((x) => spellable(x.w, choice))
      .map((x) => ({ raw: x.w, w: spellForm(x.w, choice), nq: x.nq, t: x.t ?? "", pic: x.en ?? "", lang: choice, native: true }));
    return { words, reads: j?.reads ?? null };
  }
  const get = async (q: string) => {
    const r = await fetch(`/api/learn?ui=${encodeURIComponent(ui)}${q}`, { headers: { Authorization: `Bearer ${token}` } });
    return r.ok ? ((await r.json()) as { profile?: { lang?: SpellLang | null; reads?: string | null }; pool?: LearnPoolItem[] }) : null;
  };
  let j = await get(choice ? `&lang=${choice}` : "");
  let lang = choice ?? j?.profile?.lang ?? null;
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

export async function fetchPics(token: string, words: string[], generate: boolean): Promise<Record<string, string>> {
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
      {/* One picture split down the middle: closed, the halves meet as one image. */}
      <div className="wt-curtain-half is-l"><div className="wt-curtain-img" style={{ backgroundImage: img }} /></div>
      <div className="wt-curtain-half is-r"><div className="wt-curtain-img" style={{ backgroundImage: img }} /></div>
      {!open && children ? <div className="wt-curtain-body">{children}</div> : null}
    </div>
  );
}

/* ---------- the trail ---------- */
type TrailResult = { wrongs: number; gateFirstTry: boolean; stars: number; portal?: boolean };

function Trail({ word, world, c, avatar, doors, started, pic, onDone, onExit }: {
  word: TrailWord; world: WorldDef; c: WorldCopy; avatar: string | null; doors: number; started: boolean; pic: string | null;
  onDone: (r: TrailResult) => void; onExit: () => void;
}) {
  const rtl = RTL_SPELL.has(word.lang);
  const audioLang = word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang;
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
    const avatarS = clamp(Math.min(H * 0.1, W * (doors >= 3 ? 0.17 : 0.2)), 58, 96);
    /* the doors stand in the middle of the screen, with room on their left
       for the avatar (it stands a little in front of the first door): the
       group never gets wider than that leaves */
    const lead = doors >= 3 ? 0.2 : 0.35;
    const gap = doors >= 3 ? 1.05 : 1.14;
    const span = gap * (doors - 1) + 1;
    const fitW = (W - avatarS * (2 * lead + 1) - 12) / span;
    const wantH = clamp(Math.min(H * 0.27, W * (doors >= 3 ? 0.33 : 0.42)), 110, 240);
    const doorW = Math.min(wantH * world.doorAspect, fitW);
    const doorH = doorW / world.doorAspect;
    const groupW = doorW * span;
    const seg = clamp(W * 0.95, 380, 860);
    const p0 = W * 0.38;
    const forkX = (i: number) => p0 + i * seg + seg * 0.7;
    const doorX = (i: number, j: number) => forkX(i) + (j - (doors - 1) / 2) * doorW * gap;
    const waitX = (i: number) => forkX(i) - groupW / 2 - avatarS * lead;
    /* camera: screen-left = avatar - camOff, so at a fork the doors are centred */
    const camOff = Math.max(avatarS / 2 + 6, W / 2 - groupW / 2 - avatarS * lead);
    const spotX = (i: number) => p0 + i * seg + seg * 0.22;
    const gateW = clamp(W * 0.6, 230, 420);
    const gateX = p0 + letters.length * seg + seg * 0.45;
    const len = gateX + W * 0.7;
    return { W, H, groundH, doorH, doorW, avatarS, seg, forkX, doorX, waitX, camOff, spotX, gateW, gateX, len, speed: Math.max(390, W * 0.7) /* 2026-11-01: ~1.3x faster than at launch (1.6x was too fast) */ };
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
  /* the fork the camera holds still on (-1 = follow the avatar) */
  const camForkRef = useRef(0);
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
      const lf = camForkRef.current;
      const follow = posRef.current - g.camOff;
      const cam = clamp(lf >= 0 ? Math.min(follow, g.waitX(lf) - g.camOff) : follow, 0, Math.max(0, g.len - g.W));
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
  const toastTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
        sfx.correct();
        setOpened((o) => ({ ...o, [i]: j }));
        setTimeout(() => {
          const last = i === letters.length - 1;
          camForkRef.current = last ? -1 : i + 1;
          walkTo(last ? g.gateX - g.gateW * 0.62 : g.waitX(i + 1), () => {
            busy.current = false;
            if (last) setPhase("gate");
          });
          setFork(i + 1);
        }, 340);
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
      // One message at a time: a second star restarts the timer.
      clearTimeout(toastTm.current);
      toastTm.current = setTimeout(() => setToast(null), 1300);
    }
  }, [found, spots, c.foundStar]);

  /* the gate: spell the word from memory */
  const tiles = useMemo(() => gateTiles(word.w, word.lang), [word]);
  const [typed, setTyped] = useState<number[]>([]);
  const [reveal, setReveal] = useState(false);
  /* Spelled right: the doors open, the child walks in, and the next area
     spreads out from the doorway (Gadi 2026-11-01: "the gate never opens"). */
  const [gateOpen, setGateOpen] = useState(false);
  const [entering, setEntering] = useState(false);
  const [portal, setPortal] = useState<{ x: number; y: number } | null>(null);
  const wayRef = useRef<HTMLDivElement>(null);
  const check = useCallback((idxs: number[]) => {
    const guess = idxs.map((k) => tiles[k]).join("");
    if (guess === word.w) {
      sfx.magic();
      setPhase("open");
      const g = geoRef.current;
      setTimeout(() => { setGateOpen(true); sfx.unlock(); }, 350);
      setTimeout(() => walkTo(g.gateX, () => {
        setEntering(true);
        sfx.whoosh();
        setTimeout(() => {
          const w = wayRef.current?.getBoundingClientRect();
          const st = rootRef.current?.getBoundingClientRect();
          setPortal(w && st ? { x: w.left + w.width / 2 - st.left, y: w.top + w.height / 2 - st.top } : { x: g.W / 2, y: g.H / 2 });
          setTimeout(() => onDone({ wrongs: wrongs.current, gateFirstTry: gateFirstTry.current, stars, portal: true }), 950);
        }, 500);
      }), 1300);
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
    sfx.letter(next.length - 1);
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
  const gd = world.gate;
  const dw = gd.x1 - gd.x0;
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
              <span className="wt-door-letter" style={{ fontSize: Math.min(geo.doorW * 0.27, geo.doorH * 0.22), top: `${world.plaqueY}%`, color: world.letterColor }}><Glyph ch={l} /></span>
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

        <div className={`wt-gate${gateOpen ? " is-open" : ""}${gd.shape === "round" ? " is-round" : ""}`} style={{ ...at(geo.gateX, geo.gateW), width: geo.gateW, bottom: bottomOf(0.4) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={worldArt(world, "gate")} alt="" draggable={false} />
          {/* The doorway: what lies beyond, and the two door leaves cut from the
              same picture, so closed they look exactly like the drawing. */}
          <div ref={wayRef} className="wt-gate-way" style={{ left: `${gd.x0}%`, top: `${gd.y0}%`, width: `${dw}%`, height: `${gd.y1 - gd.y0}%`, borderRadius: gd.shape === "round" ? "50%" : `50% 50% 0 0 / ${gd.arch}% ${gd.arch}% 0 0` }}>
            <div className="wt-gate-beyond" style={{ backgroundImage: `url(${worldArt(world, "clearing")})` }} />
            {[0, 1].map((k) => (
              <div key={k} className={`wt-gate-leaf ${k ? "is-r" : "is-l"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={worldArt(world, "gate")} alt="" draggable={false} style={{ width: `${10000 / (dw / 2)}%`, left: `${(-(gd.x0 + k * dw / 2) * 100) / (dw / 2)}%`, top: `${(-gd.y0 * 100) / (gd.y1 - gd.y0)}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className={`wt-avatar${entering ? " is-entering" : ""}`} ref={avatarRef} style={{ width: geo.avatarS, height: geo.avatarS, bottom: bottomOf(0.22) }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" draggable={false} />
          ) : (
            // No picture of their own yet: a character in the game's own style, never an emoji.
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/avatars/look-hoodie-1.webp" alt="" draggable={false} />
          )}
        </div>
      </div>

      {portal ? <div className="wt-portal" style={{ backgroundImage: `url(${worldArt(world, "clearing")})`, ["--px" as string]: `${portal.x}px`, ["--py" as string]: `${portal.y}px` }} /> : null}

      <div className="wt-hud">
        <div className="wt-hud-side">
          <button type="button" className="wt-round" onClick={onExit} aria-label={c.back}>✕</button>
          <SfxToggle className="wt-round" />
        </div>
        <div className="wt-slots" dir={rtl ? "rtl" : "ltr"}>
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="wt-slots-pic" src={pic} alt="" />
          ) : null}
          {/* Hear the word: it sits on the word itself, so it is clear what it reads. */}
          <span className="wt-slots-say"><TTSButton text={word.native ? word.raw : word.w} audioLang={audioLang} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} /></span>
          {letters.map((l, i) => {
            const fromGate = phase !== "walk" ? (reveal ? l : (tiles[typed[i]] ?? (phase === "open" ? l : ""))) : "";
            const ch = phase === "walk" ? (shown(i) ? l : "") : fromGate;
            return <span key={i} className={`wt-slot${ch ? " is-filled" : ""}${reveal ? " is-reveal" : ""}`}>{ch ? <Glyph ch={ch} /> : null}</span>;
          })}
        </div>
        <div className="wt-hud-side is-end">
          <span className="wt-stars">⭐ {stars}</span>
        </div>
      </div>

      {started && phase === "walk" ? <div className="wt-tip">{c.pick}</div> : null}
      {toast ? <div className="wt-toast">{toast}<small>{c.starUse}</small></div> : null}

      {phase === "gate" ? (
        <div className="wt-gatepanel">
          <strong className="wt-gate-title">{reveal ? c.almost : c.gate}</strong>
          <div className="wt-tiles" dir={rtl ? "rtl" : "ltr"}>
            {tiles.map((l, k) => (
              <button key={k} type="button" className="wt-tile" disabled={typed.includes(k) || reveal} onClick={() => addTile(k)}><Glyph ch={l} /></button>
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
type Pt = { x: number; y: number };
const itemKey = (x: WorldItem) => `${x.lang}:${x.w}`;

/** Where every word stands in the meadow, in px (Gadi 2026-11-01: never on
 *  top of each other unless the meadow is full). Words the child placed keep
 *  their spot if it is free; the rest start at their own spot (from a hash)
 *  and move to the nearest free one. */
function layoutMeadow(items: WorldItem[], W: number, H: number, fw: number, fh: number): { pos: Record<string, Pt>; full: boolean } {
  const out: Record<string, Pt> = {};
  let full = false;
  if (W < fw || H < fh) return { pos: out, full: true };
  const minX = fw / 2, maxX = W - fw / 2, minY = fh / 2, maxY = H - fh / 2;
  const clampPt = (p: Pt): Pt => ({ x: clamp(p.x, minX, maxX), y: clamp(p.y, minY, maxY) });
  const placed: Pt[] = [];
  const grid = meadowGrid(W, H, fw, fh);
  const want = (x: WorldItem): Pt => {
    if (x.x != null && x.y != null) return clampPt({ x: (x.x / 100) * W, y: (x.y / 100) * H });
    const h = hashOf(itemKey(x));
    return clampPt({ x: ((6 + (h % 88)) / 100) * W, y: ((8 + ((h >>> 8) % 80)) / 100) * H });
  };
  // The child's own placements first, then the rest by arrival.
  const order = [...items.filter((x) => x.x != null), ...items.filter((x) => x.x == null)];
  for (const it of order) {
    const p = want(it);
    const f = nearestFree(p, placed, grid, fw, fh);
    if (!f) full = true;
    const q = f ?? p;
    out[itemKey(it)] = q;
    placed.push(q);
  }
  return { pos: out, full };
}

function meadowGrid(W: number, H: number, fw: number, fh: number): Pt[] {
  const step = Math.max(12, Math.min(fw, fh) / 3);
  const grid: Pt[] = [];
  for (let y = fh / 2; y <= H - fh / 2 + 0.5; y += step) for (let x = fw / 2; x <= W - fw / 2 + 0.5; x += step) grid.push({ x, y });
  return grid;
}

/** `p` if no word is there, else the closest spot with room; null when the meadow is full. */
function nearestFree(p: Pt, placed: Pt[], grid: Pt[], fw: number, fh: number): Pt | null {
  const free = (a: Pt) => placed.every((q) => Math.abs(q.x - a.x) >= fw || Math.abs(q.y - a.y) >= fh);
  if (free(p)) return p;
  let best: Pt | null = null, bd = Infinity;
  for (const g of grid) {
    const d = (g.x - p.x) ** 2 + (g.y - p.y) ** 2;
    if (d < bd && free(g)) { bd = d; best = g; }
  }
  return best;
}

/** visit: a friend's world (Gadi 2026-11-01), read only: their title, no dragging, our own footer. */
export function Clearing({ world, c, items: words, fresh, onNext, onBack, ui, onLayout, visit, bank, onBuy }: {
  world: WorldDef; c: WorldCopy; items: WorldItem[]; fresh: string | null; onNext: () => void; onBack: () => void; ui: string;
  onLayout: (pos: Record<string, Pt>, size: { w: number; h: number }) => void;
  visit?: { title: string; foot: React.ReactNode };
  /** Stars to spend in this world and the decorations bought (Gadi 2026-11-01). */
  bank?: { left: number; decor: Decor[] };
  onBuy?: (kind: string) => Promise<boolean>;
}) {
  const { user } = useAuth();
  const [pics, setPics] = useState<Record<string, string>>({});
  useEffect(() => {
    const need = words.filter((x) => !x.pic).map((x) => x.lang === "en" ? x.w : "").filter(Boolean);
    if (!user || !need.length) return;
    let alive = true;
    (async () => {
      const got = await fetchPics(await user.getIdToken(), need, false);
      if (alive) setPics(got);
    })();
    return () => { alive = false; };
  }, [words, user]);
  // The words, then the decorations: one meadow, laid out and dragged together.
  const decor = bank?.decor;
  const items = useMemo(() => [
    ...words,
    ...(decor ?? []).map((d): WorldItem => ({ w: d.id, lang: "decor", t: d.kind, pic: worldArt(world, d.kind), at: d.at, x: d.x, y: d.y })),
  ], [words, decor, world]);
  const n = words.length;
  const [shop, setShop] = useState(false);
  const [buying, setBuying] = useState(false);
  const inArea = n % world.areaSize;
  const newArea = !!fresh && inArea === 0 && n > 0;
  const freshItem = fresh ? items.find((x) => `${x.lang}:${x.w}` === fresh) : null;
  // The word arrives in the child's world: a fanfare, or a level-up when a new area opens.
  useEffect(() => {
    if (!fresh) return;
    const tm = setTimeout(() => (newArea ? sfx.unlock() : sfx.win()), 650);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fresh]);

  const meadowRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = meadowRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // A word's footprint: its picture (as in the CSS) plus its name under it.
  // The words get smaller as the meadow fills, so they overlap only when even
  // the smallest size has no room left.
  const vw = typeof window !== "undefined" ? window.innerWidth : 390;
  const { scale, fw, fh, layout } = useMemo(() => {
    const base = clamp(vw * 0.15, 58, 84);
    let last = null as null | { scale: number; fw: number; fh: number; layout: Record<string, Pt> };
    for (const sc of [1, 0.85, 0.72, 0.6, 0.5]) {
      const pic = base * sc;
      const w = pic * 1.2 + 6, h = pic + 26 * sc;
      const r = layoutMeadow(items, box.w, box.h, w, h);
      last = { scale: sc, fw: w, fh: h, layout: r.pos };
      if (!r.full) break;
    }
    return last!;
  }, [items, box.w, box.h, vw]);

  // Drag a word anywhere, with the mouse or a finger (Gadi 2026-11-01).
  type Drag = { k: string; x: number; y: number; ox: number; oy: number; moved: boolean };
  const [drag, setDrag] = useState<Drag | null>(null);
  // The meadow is the dragged word's parent (no ref read while rendering).
  const local = (e: React.PointerEvent) => {
    const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onDown = (e: React.PointerEvent, k: string) => {
    if (visit) return;
    const at = layout[k];
    if (!at) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    setDrag({ k, x: at.x, y: at.y, ox: p.x - at.x, oy: p.y - at.y, moved: false });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = local(e);
    const x = clamp(p.x - drag.ox, fw / 2, box.w - fw / 2), y = clamp(p.y - drag.oy, fh / 2, box.h - fh / 2);
    setDrag({ ...drag, x, y, moved: drag.moved || Math.hypot(x - drag.x, y - drag.y) > 3 });
  };
  const onUp = () => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    if (!d.moved) return;
    // Dropped on another word: the nearest spot with room instead.
    const placed = items.filter((x) => itemKey(x) !== d.k).map((x) => layout[itemKey(x)]).filter(Boolean);
    const spot = nearestFree({ x: d.x, y: d.y }, placed, meadowGrid(box.w, box.h, fw, fh), fw, fh) ?? { x: d.x, y: d.y };
    // Keep the whole meadow as it is now, so no other word moves later.
    onLayout({ ...layout, [d.k]: spot }, box);
    sfx.tap();
  };

  return (
    <div className="wt-clearing" style={{ backgroundImage: `url(${worldArt(world, "clearing")})` }} dir={ui === "he" || ui === "ar" || ui === "fa" ? "rtl" : "ltr"}>
      <div className="wt-clearing-head">
        <strong>{visit ? visit.title : c.worlds[world.id].my}</strong>
        <span>{c.worlds[world.id].wordsIn(n)}</span>
      </div>
      <div className="wt-meadow" ref={meadowRef}>
        {n === 0 ? <div className="wt-empty">{c.worlds[world.id].empty}</div> : null}
        {box.w > 0 ? items.map((x) => {
          const k = itemKey(x);
          const isFresh = fresh === k;
          const isDrag = drag?.k === k;
          const at = isDrag ? drag : layout[k];
          if (!at) return null;
          const src = x.pic || pics[x.w] || null;
          return (
            <div
              key={k}
              className={`wt-friend${x.lang === "decor" ? " is-decor" : ""}${isFresh ? " is-fresh" : ""}${isDrag ? " is-drag" : ""}`}
              style={{ left: at.x, top: at.y, transform: `translate(-50%,-50%) scale(${isDrag ? scale * 1.12 : isFresh ? 1.25 : scale})` }}
              onPointerDown={(e) => onDown(e, k)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              {x.lang === "decor" ? (
                // A decoration: the picture alone, no frame and no name.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src ?? ""} alt="" draggable={false} />
              ) : (
                <>
                  <span className="wt-friend-pic">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" loading="lazy" draggable={false} />
                    ) : <span aria-hidden="true">🌱</span>}
                  </span>
                  <span className="wt-friend-name" dir={RTL_SPELL.has(x.lang) ? "rtl" : "ltr"}>{x.w}</span>
                </>
              )}
              {x.from ? <span className="wt-friend-gift" title={x.from} aria-hidden="true">🎁</span> : null}
            </div>
          );
        }) : null}
      </div>
      {shop && bank && onBuy ? (
        <div className="wt-shop-wrap" onClick={() => setShop(false)}>
          <div className="wt-shop" role="dialog" aria-label={c.decorTitle} onClick={(e) => e.stopPropagation()}>
            <strong className="wt-shop-title">{c.decorTitle}</strong>
            <span className="wt-shop-sub">{c.decorHave.replace("{n}", String(bank.left))} · {c.decorCost.replace("{n}", String(DECOR_COST))}</span>
            <div className="wt-shop-grid">
              {decorKinds(world).map((kind) => {
                const can = bank.left >= DECOR_COST && !buying;
                return (
                  <button
                    key={kind}
                    type="button"
                    className="wt-shop-item"
                    disabled={!can}
                    onClick={async () => {
                      setBuying(true);
                      const ok = await onBuy(kind);
                      setBuying(false);
                      if (ok) { sfx.magic(); setShop(false); }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={worldArt(world, kind)} alt="" draggable={false} />
                    <span>⭐ {DECOR_COST}</span>
                  </button>
                );
              })}
            </div>
            {bank.left < DECOR_COST ? <p className="wt-shop-need">{c.decorNeed}</p> : null}
            <button type="button" className="wt-btn is-ghost" onClick={() => setShop(false)}>{c.back}</button>
          </div>
        </div>
      ) : null}
      {visit ? <div className="wt-clearing-foot">{visit.foot}</div> : <div className="wt-clearing-foot">
        {freshItem ? <div className="wt-arrived">{newArea ? c.worlds[world.id].newArea : c.worlds[world.id].arrived(iso(freshItem.w))}</div> : null}
        {!newArea ? <div className="wt-area">{c.toArea(world.areaSize - inArea)}</div> : null}
        {bank && onBuy ? (
          <button type="button" className="wt-decor-btn" onClick={() => { sfx.tap(); setShop(true); }}>
            <span className="wt-decor-stars">⭐ {bank.left}</span>
            <span>🎨 {c.decorate}</span>
          </button>
        ) : null}
        <div className="wt-row">
          <button type="button" className="wt-btn" onClick={onNext}>{c.next}</button>
          <button type="button" className="wt-btn is-ghost" onClick={onBack}>🗺️ {c.mapTitle}</button>
        </div>
      </div>}
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
  const [bank, setBank] = useState<{ stars: number; spent: number; decor: Decor[] }>({ stars: 0, spent: 0, decor: [] });
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
        loadWords(token, lang, readSpellChoice(user.uid, lang)),
        fetch("/api/world", { headers: { Authorization: `Bearer ${token}` } }).then((x) => (x.ok ? x.json() : null)).catch(() => null),
      ]);
      const w = (worldRes as { worlds?: Record<string, { items?: WorldItem[] }> } | null)?.worlds?.[worldId]?.items ?? [];
      // A friend's gift (Gadi 2026-11-01): spelled first, then it lives here.
      const giftId = new URLSearchParams(window.location.search).get("gift");
      if (giftId) {
        const fj = await fetch("/api/friends", { headers: { Authorization: `Bearer ${token}` } }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
        const g = (fj as { gifts?: Array<{ id: string; fromName: string; w: string; lang: string; t: string; pic: string | null }> } | null)?.gifts?.find((x) => x.id === giftId);
        if (g && spellable(g.w, g.lang)) {
          if (g.lang !== "en" && g.lang !== "he") {
            const aj = await fetch(`/api/world/words?lang=${encodeURIComponent(g.lang)}&ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${token}` } }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
            registerAlphabet(g.lang, (aj as { alphabet?: string[] } | null)?.alphabet ?? []);
          }
          const key = `gift:${g.id}`;
          if (g.pic) setPics((p) => ({ ...p, [key]: g.pic! }));
          words.unshift({ raw: g.w, w: spellForm(g.w, g.lang), t: g.t, pic: g.pic ? key : "", lang: g.lang, native: isBankSpell(lang, g.lang), gift: { id: g.id, from: g.fromName } });
        }
      }
      setItems(w);
      const ws = (worldRes as { worlds?: Record<string, { stars?: number; spent?: number; decor?: Decor[] }> } | null)?.worlds?.[worldId];
      setBank({ stars: ws?.stars ?? 0, spent: ws?.spent ?? 0, decor: ws?.decor ?? [] });
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
    sfx.whoosh();
    setCurtainOpen(true);
    setPhase("intro");
  };

  const finish = useCallback(async (r: TrailResult) => {
    if (!word || (!user && !demo)) return;
    // Through the gate, the new area is already on screen: no curtain.
    if (!r.portal) setCurtainOpen(false);
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
      if (word.native) fetch("/api/world/words", { method: "POST", headers, body: JSON.stringify({ lang: word.lang, results: [{ w: word.raw, ok }] }) }).catch(() => undefined);
      else fetch("/api/learn", { method: "POST", headers, body: JSON.stringify({ action: "results", lang: word.lang, results: [{ w: word.raw, ok }] }) }).catch(() => undefined);
      void notifyActivity(user, { kind: "game", label: `${wn.title} · ${word.w}`, score: Math.max(0, total - r.wrongs), total });
      const res = await fetch("/api/world", { method: "POST", headers, body: JSON.stringify({ world: worldId, w: word.w, lang: word.lang, t: word.t, pic, stars: r.stars }) });
      if (res.ok) setBank((b) => ({ ...b, stars: b.stars + Math.max(0, Math.min(20, r.stars)) }));
      if (res.ok) {
        setItems((cur) => (cur.some((x) => x.w === word.w && x.lang === word.lang) ? cur : [...cur, { w: word.w, lang: word.lang, t: word.t, pic, at: Date.now() }]));
      }
      if (word.gift) {
        const gift = word.gift;
        await fetch("/api/friends", { method: "POST", headers, body: JSON.stringify({ action: "open", id: gift.id, world: worldId }) }).catch(() => undefined);
        setItems((cur) => cur.map((x) => (x.w === word.w && x.lang === word.lang ? { ...x, from: gift.from } : x)));
        try { window.history.replaceState(null, "", window.location.pathname); } catch { /* fine */ }
      }
    } catch { /* the world still opens */ }
    setFresh(key);
    if (r.portal) { setPhase("clearing"); setCurtainOpen(true); }
    else setTimeout(() => { setPhase("clearing"); setCurtainOpen(true); sfx.whoosh(); }, 900);
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
  // A decoration bought with stars (Gadi 2026-11-01).
  const buy = useCallback(async (kind: string): Promise<boolean> => {
    if (demo || !user) {
      if (bank.stars - bank.spent < DECOR_COST) return false;
      setBank((b) => ({ ...b, spent: b.spent + DECOR_COST, decor: [...b.decor, { id: Math.random().toString(36).slice(2, 10), kind, at: Date.now() }] }));
      return true;
    }
    try {
      const r = await fetch("/api/world", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ action: "buy", world: worldId, kind }),
      });
      if (!r.ok) return false;
      const j = (await r.json()) as { decor: Decor; stars: number; spent: number };
      setBank((b) => ({ stars: j.stars, spent: j.spent, decor: [...b.decor, j.decor] }));
      return true;
    } catch { return false; }
  }, [demo, user, worldId, bank.stars, bank.spent]);

  // The child moved a word in the clearing: keep every word where it stands now.
  const saveLayout = useCallback((pos: Record<string, Pt>, size: { w: number; h: number }) => {
    const pct = (v: number, n: number) => Math.round((v / Math.max(1, n)) * 1000) / 10;
    setItems((cur) => cur.map((x) => { const p = pos[itemKey(x)]; return p ? { ...x, x: pct(p.x, size.w), y: pct(p.y, size.h) } : x; }));
    setBank((b) => ({ ...b, decor: b.decor.map((d) => { const p = pos[`decor:${d.id}`]; return p ? { ...d, x: pct(p.x, size.w), y: pct(p.y, size.h) } : d; }) }));
    if (demo || !user) return;
    const list = Object.entries(pos).map(([k, p]) => { const i = k.indexOf(":"); return { lang: k.slice(0, i), w: k.slice(i + 1), x: pct(p.x, size.w), y: pct(p.y, size.h) }; });
    void user.getIdToken().then((token) => fetch("/api/world", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "layout", world: worldId, items: list }),
    })).catch(() => undefined);
  }, [demo, user, worldId]);

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

      {phase === "clearing" ? <Clearing world={world} c={c} items={items} fresh={fresh} onNext={next} onBack={exit} ui={lang} onLayout={saveLayout} bank={{ left: Math.max(0, bank.stars - bank.spent), decor: bank.decor }} onBuy={buy} /> : null}

      {word && phase === "intro" ? (
        <div className="wt-intro-wrap">
          <div className="wt-intro">
            <span className="wt-intro-label">{word.gift ? `🎁 ${friendsCopy(lang).giftFrom(word.gift.from)}` : c.yourWord}</span>
            {pics[word.pic] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="wt-intro-pic" src={pics[word.pic]} alt="" />
            ) : null}
            <strong className="wt-intro-word" dir={RTL_SPELL.has(word.lang) ? "rtl" : "ltr"}>{word.nq || (word.native ? word.raw : word.w)}</strong>
            {word.t ? <span className="wt-intro-t">{word.t}</span> : null}
            <span ref={introSay} className="wt-intro-say">
              <TTSButton text={word.native ? word.raw : word.w} audioLang={word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang} ariaLabel={c.hear} className="wt-tts-btn" rate={0.85} />
            </span>
            <div className="wt-intro-goal">
              {worldGoal(lang, word.nq || (word.native ? word.raw : word.w)).map((line, i) => <p key={i}>{line}</p>)}
            </div>
            <button type="button" className="wt-btn" onClick={() => setPhase("trail")}>{c.go}</button>
          </div>
        </div>
      ) : null}

      {!queue && !failed && phase !== "clearing" ? <div className="wt-loading"><WaitText text={c.loading} live /></div> : null}
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
            <button type="button" className="wt-btn is-big" disabled={!word} onClick={(e) => { e.stopPropagation(); enter(); }}>{word ? wn.enter : <WaitText text={c.loading} />}</button>
            <button type="button" className="wt-link" onClick={(e) => { e.stopPropagation(); exit(); }}>{c.back}</button>
          </div>
        ) : null}
      </Curtain>
    </div>
  );
}

export const CSS = `
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
.wt-door-letter{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);font-weight:800;line-height:1;color:#3b2a14;text-shadow:0 1px 0 #fff9;pointer-events:none;font-family:inherit}
.wt-door.is-next{animation:wt-breathe 1.8s ease-in-out infinite}
.wt-door.is-tried{opacity:.45;filter:grayscale(.6)}
.wt-door.is-open{opacity:.35;transform:translateY(6px) scale(.96)}
.wt-door.is-open .wt-door-letter{color:#0a7a3d;animation:wt-up .6s ease-out forwards}
.wt-door.is-glow img{filter:drop-shadow(0 0 10px #ffe066) drop-shadow(0 0 22px #ffd23f)}
.wt-door.is-shake{animation:wt-shake .45s}
.wt-animal{position:absolute;display:grid;justify-items:center;gap:4px;animation:wt-popin .35s cubic-bezier(.2,1.6,.4,1);pointer-events:none;z-index:3}
.wt-animal img{width:70%}
.wt-bubble{background:#fff;border-radius:16px;padding:6px 14px;font-weight:800;font-size:22px;box-shadow:0 4px 14px #0003;white-space:nowrap}
.wt-gate{position:absolute}
.wt-gate-way{position:absolute;overflow:hidden;perspective:700px}
.wt-gate-beyond{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity .3s}
.wt-gate-beyond::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 60%,#fffbe0 0%,#fff6c055 35%,transparent 70%);animation:wt-glow 1.4s ease-in-out infinite alternate}
.wt-gate.is-open .wt-gate-beyond{opacity:1}
.wt-gate-leaf{position:absolute;top:0;bottom:0;width:50%;overflow:hidden;transition:transform 1.1s cubic-bezier(.5,0,.2,1),filter 1.1s}
.wt-gate-leaf.is-l{left:0;transform-origin:left center}
.wt-gate-leaf.is-r{right:0;transform-origin:right center}
.wt-gate .wt-gate-leaf img{position:absolute;max-width:none;height:auto}
.wt-gate.is-open .wt-gate-leaf{filter:brightness(.7)}
.wt-gate.is-open .wt-gate-leaf.is-l{transform:rotateY(78deg)}
.wt-gate.is-open .wt-gate-leaf.is-r{transform:rotateY(-78deg)}
.wt-gate.is-round.is-open .wt-gate-leaf.is-l{transform:translateX(-100%)}
.wt-gate.is-round.is-open .wt-gate-leaf.is-r{transform:translateX(100%)}
@keyframes wt-glow{from{opacity:.55}to{opacity:1}}
.wt-avatar.is-entering{transition:transform .55s ease-in,opacity .55s ease-in;transform:translateY(-40%) scale(.4);opacity:0}
.wt-portal{position:absolute;inset:0;z-index:8;background-size:cover;background-position:center;animation:wt-portal .9s cubic-bezier(.6,0,.3,1) forwards}
@keyframes wt-portal{from{clip-path:circle(0px at var(--px) var(--py))}to{clip-path:circle(150vmax at var(--px) var(--py))}}
.wt-avatar{position:absolute;border-radius:50%;border:4px solid #fff;background:#fff;box-shadow:0 6px 14px #0004;overflow:hidden;display:grid;place-items:center;font-size:40px;z-index:2}
.wt-avatar img{width:100%;height:100%;object-fit:cover}
.wt-avatar.is-walking{animation:wt-bob .29s ease-in-out infinite alternate}
/* three columns: the word bar sits in the middle of the screen, over the doors, whatever the side buttons take */
.wt-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;right:10px;display:grid;grid-template-columns:1fr minmax(0,560px) 1fr;align-items:center;gap:8px;z-index:5}
.wt-hud-side{display:flex;align-items:center;gap:8px;min-width:96px}
.wt-hud-side.is-end{justify-content:flex-end}
.wt-round{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0002;font-size:20px;display:grid;place-items:center;cursor:pointer;color:#14202b}
.wt-tts-btn{width:44px;height:44px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#0a7472}
.wt-tts-btn svg{width:24px;height:24px}
.wt-slots-say .wt-tts-btn{width:34px;height:34px}
.wt-slots-say{display:grid;place-items:center;flex:0 0 auto}
.wt-intro-goal{display:grid;gap:2px;text-align:center;color:#3d4a52;font-size:15px;line-height:1.4;max-width:300px}
.wt-intro-goal p{margin:0}
.wt-intro-goal p:first-child{font-weight:800;color:#14202b}
.wt-slots{min-width:0;display:flex;justify-content:center;align-items:center;gap:5px;background:#fffffff0;border-radius:18px;padding:6px 10px;box-shadow:0 2px 10px #0002;overflow:hidden}
.wt-slots-pic{width:40px;height:40px;border-radius:10px;object-fit:cover;margin-inline-end:4px}
.wt-slot{width:clamp(24px,7vw,36px);height:42px;border-bottom:4px solid #0a7472;font-size:clamp(22px,6vw,30px);font-weight:800;display:grid;place-items:center}
.wt-slot.is-filled{animation:wt-pop .35s}
.wt-slot.is-reveal{color:#c2410c;border-color:#c2410c}
.wt-stars{background:#fffe;border-radius:999px;padding:8px 12px;font-weight:800;box-shadow:0 2px 8px #0002;white-space:nowrap}
.wt-tip,.wt-toast{position:absolute;left:50%;transform:translateX(-50%);background:#fffffff2;border-radius:999px;padding:10px 18px;font-weight:700;font-size:17px;box-shadow:0 4px 14px #0003;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;z-index:4}
.wt-toast{display:grid;justify-items:center;border-radius:22px;text-align:center}
.wt-toast small{font-size:13px;font-weight:600;color:#5f6b73;white-space:normal}
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
@media (hover:none){.wt-gate-hint{display:none}}
.wt-btn{border:0;border-radius:999px;background:#0a7472;color:#fff;font:inherit;font-weight:800;font-size:18px;padding:12px 26px;cursor:pointer;box-shadow:0 4px 0 #075452}
.wt-btn:disabled{opacity:.5}
.wt-btn.is-ghost{background:#fff;color:#0a7472;box-shadow:0 0 0 2px #0a7472 inset}
.wt-btn.is-big{font-size:22px;padding:16px 34px}
.wt-link{border:0;background:none;color:#fff;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;text-shadow:0 1px 4px #000a}
.wt-curtain{position:absolute;inset:0;z-index:20;pointer-events:auto}
.wt-curtain.is-open{pointer-events:none}
.wt-curtain-half{position:absolute;top:0;bottom:0;width:50%;overflow:hidden;transition:transform 1.1s cubic-bezier(.7,0,.25,1),box-shadow .4s}
.wt-curtain-half.is-l{left:0;width:calc(50% + 1px)}
.wt-curtain-half.is-r{right:0}
.wt-curtain-img{position:absolute;top:0;bottom:0;width:200%;background-size:cover;background-position:center top}
.wt-curtain-half.is-l .wt-curtain-img{left:0;width:calc(200% - 2px)}
.wt-curtain-half.is-r .wt-curtain-img{right:0}
.wt-curtain.is-open .wt-curtain-half{box-shadow:0 0 30px #0007}
.wt-curtain.is-open .wt-curtain-half.is-l{transform:translateX(-102%)}
.wt-curtain.is-open .wt-curtain-half.is-r{transform:translateX(102%)}
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
.wt-friend{position:absolute;display:grid;justify-items:center;gap:2px;transition:transform .5s,left .35s,top .35s;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
.wt-friend.is-drag{transition:transform .15s;z-index:5;cursor:grabbing}
.wt-friend.is-drag .wt-friend-pic{box-shadow:0 14px 28px #0006}
.wt-friend-pic{width:clamp(58px,15vw,84px);height:clamp(58px,15vw,84px);border-radius:50%;border:4px solid #fff;background:#fff;box-shadow:0 6px 14px #0004;overflow:hidden;display:grid;place-items:center;font-size:32px}
.wt-friend-pic img{width:100%;height:100%;object-fit:cover}
.wt-friend.is-decor{display:block}
.wt-friend.is-decor img{width:clamp(70px,18vw,104px);height:auto;filter:drop-shadow(0 6px 8px #0005);display:block}
.wt-decor-btn{display:inline-flex;align-items:center;gap:10px;border:0;border-radius:999px;background:#fff;color:#14202b;font:inherit;font-weight:800;font-size:16px;padding:8px 18px 8px 8px;box-shadow:0 4px 0 #0002,0 6px 14px #0003;cursor:pointer}
.wt-decor-stars{background:#ffd23f;color:#6b4e00;border-radius:999px;padding:6px 12px}
.wt-shop-wrap{position:absolute;inset:0;z-index:20;background:#0007;display:grid;align-items:end;justify-items:center}
.wt-shop{width:min(560px,100%);max-height:80%;overflow:auto;background:#fff;color:#14202b;border-radius:24px 24px 0 0;padding:18px 16px calc(18px + env(safe-area-inset-bottom,0px));display:grid;gap:12px;justify-items:center;text-align:center}
.wt-shop-title{font-size:21px}
.wt-shop-sub{font-size:14px;color:#5f6b73}
.wt-shop-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%}
.wt-shop-item{display:grid;justify-items:center;gap:4px;padding:10px 6px;border:2px solid #e3ecea;border-radius:18px;background:#f7fbfa;font:inherit;font-weight:800;font-size:14px;cursor:pointer}
.wt-shop-item img{width:72px;height:72px;object-fit:contain}
.wt-shop-item:disabled{opacity:.45;cursor:default}
.wt-shop-item:not(:disabled):active{transform:scale(.96)}
.wt-shop-need{margin:0;font-size:14px;color:#b45309}
.wt-friend-gift{position:absolute;top:-6px;inset-inline-end:-6px;font-size:20px;filter:drop-shadow(0 2px 2px #0005)}
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

@keyframes wt-slide{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes wt-drop{0%{transform:translate(-50%,-260%) scale(.4);opacity:0}100%{transform:translate(-50%,-50%) scale(1.25);opacity:1}}
@media (prefers-reduced-motion:reduce){.wt-root *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
