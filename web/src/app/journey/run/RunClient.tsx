"use client";

/**
 * The run to the fortress (the journey, Gadi 2026-11-14).
 *
 * A monster keeps today's words in a fortress. The child runs to it (the
 * character always runs forward, the child steers left and right) and then
 * frees the words one by one by answering their cards. The run is only for
 * fun and for the race; the words are the same eight cards of the day that
 * the index page offers, and every answer goes through the same scheduler.
 * A wrong answer takes nothing away: the monster keeps that word until
 * tomorrow. Every fortress has its own landscape and its own monster.
 *
 * Not linked from the navigation yet: a first version to look at.
 * /journey/run?demo=1 is a sample run; the other runners there are sample
 * figures, never real children.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";
import { useKidsMode } from "@/lib/use-kids-mode";
import { demoData, demoResult, makeQuestion, shortMeaning, zone, JRN_CSS, type CardView, type Data, type Question, type Result } from "../JourneyClient";
import { startRun, THEMES, type RunHandle } from "./engine";

type Copy = {
  title: string; demo: string; holds: (name: string, n: number) => string; goFree: string; how: string; go: string;
  sparks: string; place: (p: number, of: number) => string; left: string; right: string; exit: string;
  arrived: (name: string) => string; whichMeaning: string; whichWord: string; freed: string; held: (name: string) => string;
  nextWord: string; openGate: string; opened: string; freedCount: (n: number, of: number) => string; nextFort: string; backIndex: string;
  noneToday: string; fewWords: string; signIn: string; loading: string; failed: string; retry: string;
  monsters: string[]; sample: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "הדרך למבצר", demo: "משחק לדוגמה. הרצים האחרים הם דמויות לדוגמה, לא ילדים אמיתיים",
    holds: (name, n) => (n === 1 ? `${name} מחזיקה מילה אחת במבצר` : `${name} מחזיקה ${n} מילים במבצר`), goFree: "רוצו אל המבצר ושחררו אותן",
    how: "מזיזים את הדמות ימינה ושמאלה, אוספים ניצוצות ועוקפים את המכשולים", go: "רצים",
    sparks: "ניצוצות", place: (p, of) => `מקום ${p} מתוך ${of}`, left: "שמאלה", right: "ימינה", exit: "יציאה",
    arrived: (name) => `הגעתם למבצר של ${name}`, whichMeaning: "מה הפירוש של המילה?", whichWord: "איזו מילה מתאימה לפירוש?",
    freed: "המילה שוחררה", held: (name) => `${name} עוד מחזיקה את המילה. היא תחכה לכם מחר, ולא איבדתם כלום`,
    nextWord: "למילה הבאה", openGate: "פותחים את המבצר", opened: "המבצר נפתח", freedCount: (n, of) => `שחררתם ${n} מתוך ${of} מילים`,
    nextFort: "למבצר הבא", backIndex: "חזרה לאינדקס",
    noneToday: "המילים של היום כבר שוחררו. המבצר הבא ייפתח מחר", fewWords: "כשיהיו לכם שלוש מילים, המבצר הראשון ייפתח",
    signIn: "כדי לרוץ אל המבצר צריך להתחבר", loading: "מכינים את הדרך", failed: "הדרך לא נטענה", retry: "לנסות שוב",
    monsters: ["גרגרנית", "נחרנית", "קפצוצית"], sample: "דמות לדוגמה",
  },
  en: {
    title: "The road to the fortress", demo: "A sample game. The other runners are sample figures, not real children",
    holds: (name, n) => (n === 1 ? `${name} keeps one word in the fortress` : `${name} keeps ${n} words in the fortress`), goFree: "Run to the fortress and set them free",
    how: "Move the runner left and right, collect sparks and go around the blocks", go: "Run",
    sparks: "Sparks", place: (p, of) => `Place ${p} of ${of}`, left: "Left", right: "Right", exit: "Exit",
    arrived: (name) => `You reached the fortress of ${name}`, whichMeaning: "What does the word mean?", whichWord: "Which word fits the meaning?",
    freed: "The word is free", held: (name) => `${name} still keeps this word. It waits for you tomorrow, and nothing was lost`,
    nextWord: "Next word", openGate: "Open the fortress", opened: "The fortress is open", freedCount: (n, of) => `You freed ${n} of ${of} words`,
    nextFort: "To the next fortress", backIndex: "Back to the index",
    noneToday: "Today's words are already free. The next fortress opens tomorrow", fewWords: "The first fortress opens once you have three words",
    signIn: "Sign in to run to the fortress", loading: "Getting the road ready", failed: "The road did not load", retry: "Try again",
    monsters: ["Gobbler", "Snorer", "Hopper"], sample: "Sample runner",
  },
};

const MONSTER_COLORS = ["#8b5cf6", "#f97316", "#14b8a6"];

/** A funny monster, never a scary one. Three shapes, one per fortress in turn. */
function Monster({ kind, sad }: { kind: number; sad: boolean }) {
  const k = kind % 3;
  const fill = MONSTER_COLORS[k];
  return (
    <svg className="run-monster" viewBox="0 0 200 190" role="img" aria-hidden="true">
      {k === 0 && <><path d="M62 44 L50 12 L80 34 Z" fill="#fde68a" /><path d="M138 44 L150 12 L120 34 Z" fill="#fde68a" /></>}
      {k === 2 && <><path d="M80 40 Q70 10 62 8" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" /><circle cx="62" cy="8" r="8" fill="#fde68a" /><path d="M120 40 Q130 10 138 8" stroke={fill} strokeWidth="6" fill="none" strokeLinecap="round" /><circle cx="138" cy="8" r="8" fill="#fde68a" /></>}
      <path d={k === 2 ? "M60 180 Q40 100 62 52 Q100 14 138 52 Q160 100 140 180 Q120 168 100 180 Q80 168 60 180 Z" : "M30 176 Q10 96 48 52 Q100 6 152 52 Q190 96 170 176 Q146 160 124 176 Q100 160 76 176 Q54 160 30 176 Z"} fill={fill} />
      {k === 1 ? (
        <><circle cx="100" cy="86" r="30" fill="#fff" /><circle cx="100" cy={sad ? 94 : 88} r="13" fill="#14202b" /></>
      ) : (
        <><circle cx="74" cy="84" r="19" fill="#fff" /><circle cx="126" cy="84" r="19" fill="#fff" /><circle cx="76" cy={sad ? 91 : 86} r="8" fill="#14202b" /><circle cx="124" cy={sad ? 91 : 86} r="8" fill="#14202b" /></>
      )}
      {sad
        ? <path d="M74 142 Q100 124 126 142" stroke="#14202b" strokeWidth="6" fill="none" strokeLinecap="round" />
        : <><path d="M66 128 Q100 160 134 128 Z" fill="#14202b" /><path d="M84 130 L90 141 L96 130 Z M104 130 L110 141 L116 130 Z" fill="#fff" /></>}
    </svg>
  );
}

export function RunClient({ demo = false }: { demo?: boolean }) {
  const { user: realUser, loading: authLoading, familyRole } = useAuth();
  const [kidsMode] = useKidsMode();
  const forChild = familyRole === "kid" || kidsMode;
  const user = demo ? null : realUser;
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;

  const [data, setData] = useState<Data | null>(() => (demo ? demoData() : null));
  const [state, setState] = useState<"loading" | "ready" | "failed">(demo ? "ready" : "loading");
  const [phase, setPhase] = useState<"intro" | "run" | "fort" | "open">("intro");
  const [stage, setStage] = useState(0);
  const [sparks, setSparks] = useState(0);
  const [place, setPlace] = useState(1);
  const [part, setPart] = useState(0);
  const [queue, setQueue] = useState<Question[]>([]);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runRef = useRef<RunHandle | null>(null);
  const shown = useRef({ part: -1, place: 0 });

  const stageKey = user ? `gadit-journey-stage:${user.uid}` : "";
  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Data);
      try { setStage(Number(window.localStorage.getItem(`gadit-journey-stage:${user.uid}`)) || 0); } catch { /* the first fortress */ }
      setState("ready");
    } catch { setState("failed"); }
  }, [user]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const questions = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.cards.map((x) => [x.id, x]));
    return data.todays.map((t) => { const card = byId.get(t.id); return card ? makeQuestion(card, t.format, data.cards, forChild) : null; }).filter((q): q is Question => !!q);
  }, [data, forChild]);

  const monster = c.monsters[stage % c.monsters.length];
  const rivals = useMemo(() => (demo ? [{ name: `${c.sample} 1`, shirt: 0xe11d48 }, { name: `${c.sample} 2`, shirt: 0x7c3aed }] : []), [demo, c.sample]);

  const begin = () => {
    sfx.tap();
    setQueue(questions); setAt(0); setPicked(null); setResult(null); setMarks([]);
    setSparks(0); setPlace(1); setPart(0); shown.current = { part: -1, place: 0 };
    setPhase("run");
  };

  // The 3D run lives only while the run is on screen.
  useEffect(() => {
    if (phase !== "run" || !canvasRef.current) return;
    let gone = false;
    void startRun(canvasRef.current, {
      theme: stage % THEMES.length,
      rivals,
      onSparks: setSparks,
      onSpark: () => sfx.tick(),
      onStumble: () => sfx.whoosh(),
      onProgress: (p, pl) => {
        const pct = Math.round(p * 100);
        if (pct !== shown.current.part) { shown.current.part = pct; setPart(pct); }
        if (pl !== shown.current.place) { shown.current.place = pl; setPlace(pl); }
      },
      onArrive: (r) => { setPlace(r.place); setSparks(r.sparks); sfx.unlock(); setPhase("fort"); },
    }).then((h) => { if (gone) h.dispose(); else runRef.current = h; }).catch(() => { if (!gone) setPhase("fort"); });
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); runRef.current?.steer(-1); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); runRef.current?.steer(1); }
    };
    window.addEventListener("keydown", key);
    return () => { gone = true; window.removeEventListener("keydown", key); runRef.current?.dispose(); runRef.current = null; };
  }, [phase, stage, rivals]);

  const q = queue[at] ?? null;

  async function choose(opt: CardView) {
    if (!q || picked) return;
    setPicked(opt.id);
    const right = opt.id === q.card.id;
    if (right) sfx.correct(); else sfx.wrong();
    let r: Result;
    if (demo || !user) r = demoResult(q, right);
    else {
      try {
        const res = await fetch("/api/journey", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ id: q.card.id, choice: opt.id, format: q.format, tz: zone() }),
        });
        if (!res.ok) throw new Error(String(res.status));
        r = (await res.json()) as Result;
      } catch {
        r = { correct: right, event: "practice", frameUp: null, card: q.card, coinsUp: 0 };
      }
    }
    setResult(r);
    setMarks((m) => [...m, r.correct]);
  }

  const next = () => {
    sfx.tap();
    setPicked(null); setResult(null);
    if (at + 1 < queue.length) { setAt(at + 1); return; }
    sfx.win();
    if (stageKey) { try { window.localStorage.setItem(stageKey, String(stage + 1)); } catch { /* the stage is kept for this visit only */ } }
    setPhase("open");
  };
  const nextFort = () => { sfx.tap(); setStage(stage + 1); setData(demoData()); setPhase("intro"); };

  const freedN = marks.filter(Boolean).length;
  const ready = (user || demo) && data && state === "ready";

  if (phase === "run") {
    return (
      <div className="run-stage" dir={dir}>
        <style>{RUN_CSS}</style>
        <canvas ref={canvasRef} className="run-canvas" onPointerDown={(e) => runRef.current?.steer(e.clientX < window.innerWidth / 2 ? -1 : 1)} />
        <div className="run-hud">
          <span className="run-chip is-sparks"><b>✦</b> {sparks}</span>
          {rivals.length > 0 && <span className="run-chip">{c.place(place, rivals.length + 1)}</span>}
          <button type="button" className="run-chip is-exit" onClick={() => setPhase("intro")}>{c.exit}</button>
        </div>
        <div className="run-bar" aria-hidden="true"><i style={{ width: `${part}%` }} /></div>
        <div className="run-keys" dir="ltr">
          <button type="button" aria-label={c.left} onClick={() => runRef.current?.steer(-1)}>‹</button>
          <button type="button" aria-label={c.right} onClick={() => runRef.current?.steer(1)}>›</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wordbook jrn" dir={dir}>
      <style>{JRN_CSS + RUN_CSS}</style>
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && !data && <p className="jrn-note">{c.loading}…</p>}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}

        {ready && phase === "intro" && (
          <section className="jrn-play">
            <h1 className="jrn-title">{c.title}</h1>
            {demo && <span className="jrn-demo">{c.demo}</span>}
            {questions.length > 0 ? (
              <>
                <Monster kind={stage} sad={false} />
                <div className="jrn-ask">{c.holds(monster, questions.length)}</div>
                <p className="jrn-note">{c.goFree}</p>
                <p className="jrn-small">{c.how}</p>
                <button type="button" className="jrn-btn" onClick={begin}>{c.go}</button>
              </>
            ) : (
              <>
                <Monster kind={stage} sad />
                <p className="jrn-note">{data.cards.length < 3 ? c.fewWords : c.noneToday}</p>
                <Link className="jrn-btn" href="/journey">{c.backIndex}</Link>
              </>
            )}
          </section>
        )}

        {ready && phase === "fort" && q && (
          <section className="jrn-play" aria-live="polite">
            <Monster kind={stage} sad={!!result?.correct} />
            <div className="jrn-step">{c.arrived(monster)}</div>
            <div className="run-cages" aria-hidden="true">
              {queue.map((x, i) => <i key={x.card.id} className={i < marks.length ? (marks[i] ? "is-free" : "is-held") : i === at ? "is-now" : ""} />)}
            </div>
            <div className="jrn-ask">{q.format === "meaning" ? c.whichMeaning : c.whichWord}</div>
            <div className={`jrn-prompt${q.format === "meaning" ? " is-word" : ""}`} dir="auto">{q.format === "meaning" ? q.card.word : shortMeaning(q.card.meaning)}</div>
            <div className="jrn-options">
              {q.options.map((o) => {
                const isRight = !!picked && o.id === q.card.id;
                const isWrong = picked === o.id && o.id !== q.card.id;
                return (
                  <button key={o.id} type="button" className={`jrn-option${q.format === "word" ? " is-word" : ""}${isRight ? " is-right" : ""}${isWrong ? " is-other" : ""}`} onClick={() => void choose(o)} aria-disabled={!!picked || undefined} dir="auto">
                    {q.format === "meaning" ? shortMeaning(o.meaning) : o.word}
                  </button>
                );
              })}
            </div>
            {result && (
              <div className="jrn-result">
                <div className={`jrn-result-line${result.correct ? " is-good" : ""}`}>{result.correct ? c.freed : c.held(monster)}</div>
                {result.coinsUp > 0 && <div className="jrn-coinup">+{result.coinsUp}</div>}
                <button type="button" className="jrn-btn" onClick={next}>{at + 1 < queue.length ? c.nextWord : c.openGate}</button>
              </div>
            )}
          </section>
        )}

        {ready && phase === "open" && (
          <section className="jrn-play">
            <Monster kind={stage} sad />
            <h1 className="jrn-title">{c.opened}</h1>
            <div className="jrn-ask">{c.freedCount(freedN, queue.length)}</div>
            <div className="run-sum">
              <span className="run-chip is-sparks"><b>✦</b> {sparks} {c.sparks}</span>
              {rivals.length > 0 && <span className="run-chip">{c.place(place, rivals.length + 1)}</span>}
            </div>
            {demo
              ? <button type="button" className="jrn-btn" onClick={nextFort}>{c.nextFort}</button>
              : <Link className="jrn-btn" href="/journey">{c.backIndex}</Link>}
          </section>
        )}
      </div>
    </div>
  );
}

const RUN_CSS = `
.run-stage { position: fixed; inset: 0; background: #bfe8ff; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; }
.run-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.run-hud { position: absolute; inset-inline: 0; top: calc(env(safe-area-inset-top, 0px) + 12px); display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; padding-inline: 16px; pointer-events: none; }
.run-chip { display: inline-flex; gap: 6px; align-items: center; min-height: 40px; padding: 6px 16px; border: 0; border-radius: 999px; background: rgba(255,255,255,.92); color: #14202b; font: inherit; font-weight: 800; font-size: 17px; font-variant-numeric: tabular-nums; }
.run-chip.is-sparks b { color: #e0a100; }
.run-chip.is-exit { pointer-events: auto; cursor: pointer; background: rgba(20,32,43,.72); color: #fff; }
.run-bar { position: absolute; inset-inline: 16px; top: calc(env(safe-area-inset-top, 0px) + 62px); height: 8px; border-radius: 999px; background: rgba(255,255,255,.55); overflow: hidden; direction: ltr; }
.run-bar i { display: block; height: 100%; background: #0a7472; border-radius: 999px; }
.run-keys { position: absolute; inset-inline: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 18px); display: flex; justify-content: space-between; pointer-events: none; }
.run-keys button { pointer-events: auto; width: 84px; height: 84px; border: 0; border-radius: 50%; background: rgba(255,255,255,.9); color: #0a7472; font-size: 56px; font-weight: 800; line-height: 1; cursor: pointer; box-shadow: 0 5px 0 rgba(10,116,114,.45); display: grid; place-items: center; padding: 0 0 8px; }
.run-keys button:active { transform: translateY(3px); box-shadow: 0 2px 0 rgba(10,116,114,.45); }
.run-monster { width: min(190px, 46vw); height: auto; }
.run-cages { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; direction: ltr; }
.run-cages i { width: 22px; height: 28px; border-radius: 6px; background: #eef2f6; box-shadow: 0 0 0 2px #b8c4d0 inset; }
.run-cages i.is-now { box-shadow: 0 0 0 3px #0a7472 inset; }
.run-cages i.is-free { background: #dcfce7; box-shadow: 0 0 0 2px #4ade80 inset; }
.run-cages i.is-held { background: #ede9fe; box-shadow: 0 0 0 2px #a78bfa inset; }
.run-sum { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.run-sum .run-chip { background: #fff3c4; color: #6b4a00; }
a.jrn-btn { display: inline-grid; place-items: center; text-decoration: none; }
`;
