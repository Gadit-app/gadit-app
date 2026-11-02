"use client";

/**
 * Letter Fireflies (Gadi 2026-11-02). The idea of Gadi's son: letters move
 * across the screen and the child catches the right one, like a fair game
 * but gentle. Fireflies drift through a summer night, each holding a glowing
 * letter; the child catches, with a net, the NEXT letter of the word. A wrong
 * firefly flutters away ("That's k!") and costs nothing; after two wrong taps
 * on the same letter, the right fireflies glow. Five words fill the jar.
 *
 * Words come from the same learning engine as Word Worlds (/api/learn, or the
 * world word bank for other languages), and results go back to it.
 * Testers only for now (users/{uid}.tester): Osher and Din test it first.
 *
 * Plain DOM: one requestAnimationFrame loop moves the fireflies through refs;
 * React renders only when a firefly is born, caught or leaves.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { decoysFor, keyMatches, lettersOf, RTL_SPELL } from "@/lib/world/letters";
import { readSpellChoice } from "@/lib/world/spell-choice";
import { Glyph } from "../world/Glyph";
import { fetchPics, loadWords, type TrailWord } from "../world/WorldClient";
import { catchCopy, type CatchCopy } from "./catch-i18n";

const ART = "/catch/fireflies";
const ROUND = 5;
const iso = (s: string) => `⁨${s}⁩`;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Fly = { id: number; letter: string; state: "fly" | "caught" | "flee" };
type Motion = { x: number; y0: number; vx: number; amp: number; freq: number; ph: number; t: number; vy: number; y: number };

/* ---------- one word: the night sky ---------- */
function Sky({ word, c, level, avatar, onDone, onExit, pic }: {
  word: TrailWord; c: CatchCopy; level: number; avatar: string; pic: string | null;
  onDone: (wrongs: number) => void; onExit: () => void;
}) {
  const rtl = RTL_SPELL.has(word.lang);
  const letters = useMemo(() => lettersOf(word.w, word.lang), [word]);
  const audioLang = word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang;

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
    const S = clamp(Math.min(W * 0.26, H * 0.17), 92, 150);
    // Crossing the screen: gentle at first, a little faster every word.
    const cross = clamp(8 - level * 0.45, 4.6, 8);
    return { W, H, S, top: Math.max(96, H * 0.16), bottom: H * 0.66 - S, speed: (W + 2 * S) / cross, maxOn: Math.min(3 + Math.floor(level / 2), 5) + (W > 900 ? 1 : 0), gap: cross / 3.2 };
  }, [size, level]);
  const geoRef = useRef(geo);
  useEffect(() => { geoRef.current = geo; }, [geo]);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [flies, setFlies] = useState<Fly[]>([]);
  const fliesRef = useRef<Fly[]>([]);
  const motion = useRef(new Map<number, Motion>());
  const els = useRef(new Map<number, HTMLButtonElement>());
  const nextId = useRef(1);
  const spawnIn = useRef(0.2);
  const doneRef = useRef(false);
  const wrongs = useRef(0);
  const [miss, setMiss] = useState(0); // wrong taps on the current letter
  const [peek, setPeek] = useState<{ letter: string; who: "owl" | "frog" } | null>(null);
  const peekTm = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [net, setNet] = useState<{ x: number; y: number; k: number } | null>(null);

  const commit = (list: Fly[]) => { fliesRef.current = list; setFlies(list); };

  const spawn = useCallback(() => {
    const g = geoRef.current;
    const target = letters[stepRef.current];
    if (!target) return;
    const live = fliesRef.current.filter((f) => f.state === "fly");
    const hasTarget = live.some((f) => f.letter === target);
    let letter = target;
    if (hasTarget) {
      const onScreen = new Set(live.map((f) => f.letter));
      const pool = decoysFor(target, word.lang, 4).filter((l) => !onScreen.has(l));
      letter = pool[0] ?? decoysFor(target, word.lang, 1)[0] ?? target;
    }
    const id = nextId.current++;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y0 = rnd(g.top, Math.max(g.top + 10, g.bottom));
    motion.current.set(id, {
      x: dir > 0 ? -g.S : g.W + g.S * 0.1, y0, y: y0,
      vx: dir * g.speed * rnd(0.85, 1.15), amp: rnd(8, 26), freq: rnd(1.2, 2.2), ph: rnd(0, 6.28), t: 0, vy: 0,
    });
    commit([...fliesRef.current, { id, letter, state: "fly" }]);
  }, [letters, word.lang]);

  const remove = useCallback((id: number) => {
    motion.current.delete(id);
    els.current.delete(id);
    commit(fliesRef.current.filter((f) => f.id !== id));
  }, []);

  /* the loop */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = geoRef.current;
      if (!doneRef.current) {
        spawnIn.current -= dt;
        const live = fliesRef.current.filter((f) => f.state === "fly").length;
        if (spawnIn.current <= 0 && live < g.maxOn) { spawn(); spawnIn.current = g.gap * rnd(0.7, 1.3); }
      }
      const gone: number[] = [];
      for (const f of fliesRef.current) {
        const m = motion.current.get(f.id);
        if (!m) continue;
        m.t += dt;
        if (f.state === "fly") {
          m.x += m.vx * dt;
          m.y = m.y0 + Math.sin(m.t * m.freq + m.ph) * m.amp;
          if ((m.vx > 0 && m.x > g.W + g.S) || (m.vx < 0 && m.x < -g.S * 1.2)) gone.push(f.id);
        } else if (f.state === "flee") {
          m.vy -= 900 * dt;
          m.x += m.vx * 1.8 * dt;
          m.y += m.vy * dt;
          if (m.y < -g.S * 1.5) gone.push(f.id);
        }
        const el = els.current.get(f.id);
        if (el) el.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
      }
      for (const id of gone) remove(id);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spawn, remove]);

  const tap = useCallback((id: number) => {
    if (doneRef.current) return;
    const f = fliesRef.current.find((x) => x.id === id);
    const m = motion.current.get(id);
    if (!f || !m || f.state !== "fly") return;
    const g = geoRef.current;
    const target = letters[stepRef.current];
    if (f.letter === target) {
      sfx.letter(stepRef.current);
      setNet({ x: m.x + g.S / 2, y: m.y + g.S * 0.55, k: id });
      commit(fliesRef.current.map((x) => (x.id === id ? { ...x, state: "caught" } : x)));
      setTimeout(() => remove(id), 650);
      setTimeout(() => setNet(null), 520);
      const n = stepRef.current + 1;
      stepRef.current = n;
      setStep(n);
      setMiss(0);
      if (n >= letters.length) {
        doneRef.current = true;
        // The other fireflies fly home.
        commit(fliesRef.current.map((x) => (x.state === "fly" ? { ...x, state: "flee" } : x)));
        setTimeout(() => sfx.magic(), 250);
        setTimeout(() => onDone(wrongs.current), 1500);
      } else {
        sfx.correct();
      }
    } else {
      sfx.wrong();
      wrongs.current += 1;
      setMiss((x) => x + 1);
      m.vy = -120;
      commit(fliesRef.current.map((x) => (x.id === id ? { ...x, state: "flee" } : x)));
      setPeek({ letter: f.letter, who: wrongs.current % 2 ? "owl" : "frog" });
      clearTimeout(peekTm.current);
      peekTm.current = setTimeout(() => setPeek(null), 1400);
    }
  }, [letters, onDone, remove]);

  /* keyboard: a letter catches a firefly carrying it */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const live = fliesRef.current.filter((f) => f.state === "fly");
      const target = letters[stepRef.current];
      const hit = live.find((f) => f.letter === target && keyMatches(e.key, f.letter, word.lang)) ?? live.find((f) => keyMatches(e.key, f.letter, word.lang));
      if (hit) tap(hit.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [letters, tap, word.lang]);

  const target = letters[step];
  const done = step >= letters.length;

  return (
    <div className="ct-stage" ref={rootRef}>
      {flies.map((f) => (
        <button
          key={f.id}
          type="button"
          ref={(el) => { if (el) els.current.set(f.id, el); else els.current.delete(f.id); }}
          className={`ct-fly is-${f.state}${miss >= 2 && f.state === "fly" && f.letter === target ? " is-glow" : ""}`}
          style={{ width: geo.S, height: geo.S }}
          onPointerDown={(e) => { e.preventDefault(); tap(f.id); }}
          aria-label={f.letter}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/firefly.webp`} alt="" draggable={false} />
          <span className="ct-fly-letter" style={{ fontSize: geo.S * 0.3 }}><Glyph ch={f.letter} /></span>
        </button>
      ))}

      {net ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={net.k} className="ct-net-swoop" src={`${ART}/net.webp`} alt="" style={{ left: net.x, top: net.y, width: geo.S * 1.1 }} />
      ) : null}

      {peek ? (
        <div className={`ct-peek is-${peek.who}`}>
          <div className="ct-bubble">{c.thats(iso(peek.letter))}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ART}/${peek.who}.webp`} alt="" draggable={false} />
        </div>
      ) : null}

      <div className="ct-catcher">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ct-avatar" src={avatar} alt="" draggable={false} />
        {!net ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ct-net-held" src={`${ART}/net.webp`} alt="" draggable={false} />
        ) : null}
      </div>

      <div className="ct-hud">
        <div className="ct-hud-side">
          <button type="button" className="ct-round" onClick={onExit} aria-label={c.back}>✕</button>
          <SfxToggle className="ct-round" />
        </div>
        <div className="ct-slots" dir={rtl ? "rtl" : "ltr"}>
          {pic ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ct-slots-pic" src={pic} alt="" />
          ) : null}
          <span className="ct-slots-say"><TTSButton text={word.native ? word.raw : word.w} audioLang={audioLang} ariaLabel={c.hear} className="ct-tts-btn" rate={0.85} /></span>
          {letters.map((l, i) => (
            <span key={i} className={`ct-slot${i < step ? " is-filled" : ""}${i === step && !done ? " is-now" : ""}`}>{i < step ? <Glyph ch={l} /> : null}</span>
          ))}
        </div>
        <div className="ct-hud-side is-end">
          <TesterButton game="catch" word={word.w} className="ct-round" />
        </div>
      </div>

      <div className="ct-tip">{done ? c.caughtAll : c.catchNext}</div>
    </div>
  );
}

/* ---------- the page ---------- */
export function CatchClient({ demo }: { demo?: TrailWord[] }) {
  const { user, planReady, loading, promptLogin, avatarId, avatarPhotoUrl, tester } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const router = useRouter();
  const c = catchCopy(lang);
  const dir = lang === "he" || lang === "ar" || lang === "fa" ? "rtl" : "ltr";

  // Testers only for now (Gadi 2026-11-02).
  useEffect(() => {
    if (demo || loading) return;
    if (!user) { promptLogin(c.title); return; }
    if (planReady && !tester) router.replace(href("/play"));
  }, [demo, loading, user, planReady, tester, promptLogin, router, href, c.title]);

  const [queue, setQueue] = useState<TrailWord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pics, setPics] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"door" | "intro" | "play" | "summary">("door");
  const [jar, setJar] = useState<TrailWord[]>([]);
  const [round, setRound] = useState(0);
  const introSay = useRef<HTMLSpanElement>(null);

  const load = useCallback(async () => {
    if (demo) { setQueue(demo); setIdx(0); return; }
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const { words } = await loadWords(token, lang, readSpellChoice(user.uid, lang));
      setQueue(words);
      setIdx(0);
      setFailed(!words.length);
      const got = await fetchPics(token, words.slice(0, ROUND + 1).map((x) => x.pic), true);
      setPics((p) => ({ ...p, ...got }));
    } catch { setFailed(true); }
  }, [demo, user, lang]);
  useEffect(() => {
    if (!demo && (loading || !user || !planReady || !tester)) return;
    let alive = true;
    (async () => { if (alive) await load(); })();
    return () => { alive = false; };
  }, [demo, loading, user, planReady, tester, load]);

  const word = queue?.[idx] ?? null;
  const avatar = avatarUrl(avatarId) ?? avatarPhotoUrl ?? "/avatars/look-hoodie-1.webp";

  useEffect(() => {
    if (phase !== "intro") return;
    const tm = setTimeout(() => introSay.current?.querySelector("button")?.click(), 500);
    return () => clearTimeout(tm);
  }, [phase, idx]);

  const finish = useCallback(async (wrongCount: number) => {
    if (!word) return;
    const filled = [...jar, word];
    setJar(filled);
    if (user && !demo) {
      try {
        const token = await user.getIdToken();
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const ok = wrongCount <= 1;
        if (word.native) fetch("/api/world/words", { method: "POST", headers, body: JSON.stringify({ lang: word.lang, results: [{ w: word.raw, ok }] }) }).catch(() => undefined);
        else fetch("/api/learn", { method: "POST", headers, body: JSON.stringify({ action: "results", lang: word.lang, results: [{ w: word.raw, ok }] }) }).catch(() => undefined);
        const total = lettersOf(word.w, word.lang).length;
        void notifyActivity(user, { kind: "game", label: `${c.title} · ${word.w}`, score: Math.max(0, total - wrongCount), total });
      } catch { /* the game goes on */ }
    }
    if (filled.length % ROUND === 0) { sfx.win(); setPhase("summary"); return; }
    const n = idx + 1;
    if (queue && n < queue.length) {
      setIdx(n);
      setPhase("intro");
      if (user) {
        const ahead = queue.slice(n, n + 3).map((x) => x.pic).filter((p) => p && !pics[p]);
        if (ahead.length) void fetchPics(await user.getIdToken(), ahead, true).then((got) => setPics((p) => ({ ...p, ...got })));
      }
    } else {
      setQueue(null);
      setPhase("intro");
      await load();
    }
  }, [word, jar, user, demo, c.title, idx, queue, pics, load]);

  const more = async () => {
    setRound((r) => r + 1);
    const n = idx + 1;
    if (queue && n < queue.length) { setIdx(n); setPhase("intro"); }
    else { setQueue(null); setPhase("intro"); await load(); }
  };

  const exit = () => router.push(href("/play"));
  const level = jar.length;
  const roundJar = jar.slice(Math.floor(Math.max(0, jar.length - 1) / ROUND) * ROUND);

  return (
    <div className="ct-root" style={{ backgroundImage: `url(${ART}/bg-tall.webp)` }}>
      <style>{CSS}</style>

      {word && phase === "play" ? (
        <Sky key={`${round}:${idx}:${word.w}`} word={word} c={c} level={level} avatar={avatar} pic={pics[word.pic] ?? null} onDone={finish} onExit={exit} />
      ) : null}

      {word && phase === "intro" ? (
        <div className="ct-card-wrap" dir={dir}>
          <div className="ct-card">
            <span className="ct-card-label">{c.yourWord(jar.length % ROUND + 1, ROUND)}</span>
            {pics[word.pic] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ct-card-pic" src={pics[word.pic]} alt="" />
            ) : null}
            <strong className="ct-card-word" dir={RTL_SPELL.has(word.lang) ? "rtl" : "ltr"}>{word.nq || (word.native ? word.raw : word.w)}</strong>
            {word.t ? <span className="ct-card-t">{word.t}</span> : null}
            <span ref={introSay}>
              <TTSButton text={word.native ? word.raw : word.w} audioLang={word.lang === "he" ? "he-IL" : word.lang === "en" ? "en-US" : word.lang} ariaLabel={c.hear} className="ct-tts-btn" rate={0.85} />
            </span>
            <p className="ct-card-goal">{c.goal}</p>
            <button type="button" className="ct-btn" onClick={() => { sfx.whoosh(); setPhase("play"); }}>{c.go}</button>
          </div>
        </div>
      ) : null}

      {phase === "summary" ? (
        <div className="ct-card-wrap" dir={dir}>
          <div className="ct-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ct-jar" src={`${ART}/jar.webp`} alt="" />
            <strong className="ct-card-title">{c.jarFull}</strong>
            <div className="ct-jar-words">
              {roundJar.map((w, i) => (
                <span key={i} className="ct-jar-word" dir={RTL_SPELL.has(w.lang) ? "rtl" : "ltr"}>
                  {pics[w.pic] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pics[w.pic]} alt="" />
                  ) : null}
                  {w.nq || (w.native ? w.raw : w.w)}
                </span>
              ))}
            </div>
            <div className="ct-row">
              <button type="button" className="ct-btn" onClick={more}>{c.more}</button>
              <button type="button" className="ct-btn is-ghost" onClick={exit}>{c.back}</button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "door" ? (
        <div className="ct-door" dir={dir} style={{ backgroundImage: `url(${ART}/curtain.webp)` }}>
          <div className="ct-door-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ct-door-fly" src={`${ART}/firefly.webp`} alt="" />
            <strong>{c.title}</strong>
            <span>{c.sub}</span>
            <button type="button" className="ct-btn is-big" disabled={!word} onClick={() => { sfx.whoosh(); setPhase("intro"); }}>{word ? c.start : <WaitText text={c.loading} />}</button>
            <button type="button" className="ct-link" onClick={exit}>{c.back}</button>
          </div>
        </div>
      ) : null}

      {phase !== "door" && !queue && !failed ? <div className="ct-loading"><WaitText text={c.loading} live /></div> : null}
      {failed ? (
        <div className="ct-loading">
          <p>{c.noWords}</p>
          <button type="button" className="ct-btn" onClick={exit}>{c.back}</button>
        </div>
      ) : null}
    </div>
  );
}

const CSS = `
.ct-root{position:fixed;inset:0;z-index:60;overflow:hidden;background:#1e1b4b center bottom/cover no-repeat;color:#14202b;-webkit-user-select:none;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
@media (min-aspect-ratio:1/1){.ct-root{background-image:url(${ART}/bg-wide.webp)!important}}
.ct-stage{position:absolute;inset:0;overflow:hidden}
.ct-fly{position:absolute;left:0;top:0;border:0;background:none;padding:0;cursor:pointer;will-change:transform;touch-action:none}
.ct-fly img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;filter:drop-shadow(0 0 14px #ffd76a99);animation:ct-flap .35s ease-in-out infinite alternate}
.ct-fly-letter{position:absolute;left:50%;top:63%;transform:translate(-50%,-50%);font-weight:900;line-height:1;color:#5a3a00;text-shadow:0 1px 0 #fff8;pointer-events:none;font-family:inherit}
.ct-fly.is-glow img{filter:drop-shadow(0 0 10px #fff) drop-shadow(0 0 26px #ffe066) drop-shadow(0 0 40px #ffd23f)}
.ct-fly.is-glow .ct-fly-letter{animation:ct-throb .7s ease-in-out infinite alternate}
.ct-fly.is-caught{pointer-events:none}
.ct-fly.is-caught img,.ct-fly.is-caught .ct-fly-letter{animation:ct-caught .6s ease-in forwards}
.ct-fly.is-flee{pointer-events:none;opacity:.85}
.ct-net-swoop{position:absolute;z-index:4;pointer-events:none;transform:translate(-30%,-60%) rotate(-30deg);animation:ct-swoop .5s ease-out forwards}
.ct-catcher{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);width:clamp(70px,20vw,96px);height:clamp(70px,20vw,96px);z-index:2}
.ct-avatar{width:100%;height:100%;border-radius:50%;border:4px solid #fff;background:#fff;object-fit:cover;box-shadow:0 6px 18px #0007}
.ct-net-held{position:absolute;width:80%;right:-48%;top:-46%;transform:rotate(18deg);pointer-events:none;filter:drop-shadow(0 4px 6px #0006)}
.ct-peek{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);width:clamp(110px,30vw,170px);display:grid;justify-items:center;gap:4px;z-index:3;animation:ct-popin .3s cubic-bezier(.2,1.6,.4,1);pointer-events:none}
.ct-peek.is-owl{left:8px}
.ct-peek.is-frog{right:8px}
.ct-peek img{width:78%}
.ct-bubble{background:#fff;border-radius:16px;padding:6px 14px;font-weight:800;font-size:21px;box-shadow:0 4px 14px #0004;white-space:nowrap}
.ct-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 10px);left:10px;right:10px;display:grid;grid-template-columns:1fr minmax(0,560px) 1fr;align-items:center;gap:8px;z-index:5}
.ct-hud-side{display:flex;align-items:center;gap:8px;min-width:96px}
.ct-hud-side.is-end{justify-content:flex-end}
.ct-round{width:44px;height:44px;flex:0 0 44px;border-radius:50%;border:0;background:#fffe;box-shadow:0 2px 8px #0003;font-size:20px;display:grid;place-items:center;cursor:pointer;color:#14202b}
.ct-tts-btn{width:44px;height:44px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#4338ca}
.ct-tts-btn svg{width:24px;height:24px}
.ct-slots-say .ct-tts-btn{width:34px;height:34px}
.ct-slots-say{display:grid;place-items:center;flex:0 0 auto}
.ct-slots{min-width:0;display:flex;justify-content:center;align-items:center;gap:5px;background:#fffffff0;border-radius:18px;padding:6px 10px;box-shadow:0 2px 12px #0004;overflow:hidden}
.ct-slots-pic{width:40px;height:40px;border-radius:10px;object-fit:cover;margin-inline-end:4px}
.ct-slot{width:clamp(24px,7vw,36px);height:42px;border-bottom:4px solid #c7d2fe;font-size:clamp(22px,6vw,30px);font-weight:800;display:grid;place-items:center}
.ct-slot.is-now{border-color:#f59e0b;animation:ct-blink 1s ease-in-out infinite}
.ct-slot.is-filled{border-color:#4338ca;color:#4338ca;animation:ct-pop .35s}
.ct-tip{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 68px);transform:translateX(-50%);background:#ffffffe8;border-radius:999px;padding:8px 16px;font-weight:700;font-size:16px;box-shadow:0 4px 14px #0004;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis;z-index:4}
.ct-card-wrap{position:absolute;inset:0;z-index:8;display:grid;place-items:center;padding:16px;background:#0b0a2a66}
.ct-card{display:grid;gap:12px;justify-items:center;text-align:center;background:#fff;border-radius:28px;padding:22px 24px;box-shadow:0 14px 40px #0007;max-width:380px;width:100%;animation:ct-popin .35s cubic-bezier(.2,1.4,.4,1)}
.ct-card-label{color:#5f6b73;font-weight:700}
.ct-card-pic{width:150px;height:150px;border-radius:22px;object-fit:cover}
.ct-card-word{font-size:44px;line-height:1.1}
.ct-card-t{color:#5f6b73;font-size:18px}
.ct-card-goal{margin:0;color:#3d4a52;font-size:15px;line-height:1.45;max-width:300px}
.ct-card-title{font-size:24px}
.ct-jar{width:120px;filter:drop-shadow(0 0 24px #ffd76a)}
.ct-jar-words{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ct-jar-word{display:inline-flex;align-items:center;gap:6px;background:#eef2ff;border-radius:999px;padding:4px 12px 4px 4px;font-weight:800}
.ct-jar-word img{width:30px;height:30px;border-radius:50%;object-fit:cover}
.ct-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.ct-btn{border:0;border-radius:999px;background:#4338ca;color:#fff;font:inherit;font-weight:800;font-size:18px;padding:12px 26px;cursor:pointer;box-shadow:0 4px 0 #312e81}
.ct-btn:disabled{opacity:.6}
.ct-btn.is-ghost{background:#fff;color:#4338ca;box-shadow:0 0 0 2px #4338ca inset}
.ct-btn.is-big{font-size:22px;padding:16px 34px}
.ct-link{border:0;background:none;color:#fff;font:inherit;font-weight:700;text-decoration:underline;cursor:pointer;text-shadow:0 1px 4px #000a}
.ct-door{position:absolute;inset:0;z-index:20;background-size:cover;background-position:center;display:grid;place-items:center;padding:16px}
.ct-door-box{display:grid;gap:14px;justify-items:center;text-align:center;background:#0000005e;padding:22px 26px;border-radius:28px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);max-width:420px}
.ct-door-box strong{font-size:clamp(32px,9vw,54px);color:#fff;text-shadow:0 3px 0 #312e81,0 6px 18px #000a;line-height:1.1}
.ct-door-box span{color:#fff;font-size:17px;font-weight:600;text-shadow:0 1px 6px #000c}
.ct-door-fly{width:120px;animation:ct-hover 1.6s ease-in-out infinite alternate;filter:drop-shadow(0 0 18px #ffd76a)}
.ct-loading{position:absolute;inset:0;z-index:7;display:grid;place-items:center;align-content:center;gap:14px;font-weight:700;font-size:18px;color:#fff;text-align:center;padding:16px;text-shadow:0 1px 6px #000a}
@keyframes ct-flap{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-4px) rotate(4deg)}}
@keyframes ct-throb{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(1.18)}}
@keyframes ct-caught{to{transform:scale(.2) translateY(60px);opacity:0}}
@keyframes ct-swoop{0%{opacity:0;transform:translate(-30%,-20%) rotate(20deg) scale(.7)}35%{opacity:1;transform:translate(-30%,-60%) rotate(-30deg) scale(1)}100%{opacity:0;transform:translate(-30%,-40%) rotate(-50deg) scale(.9)}}
@keyframes ct-popin{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes ct-pop{0%{transform:scale(.4)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ct-blink{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes ct-hover{from{transform:translateY(0)}to{transform:translateY(-12px)}}
@media (prefers-reduced-motion:reduce){.ct-root *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
