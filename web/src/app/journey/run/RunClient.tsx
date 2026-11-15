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
import { startHall, type HallHandle } from "./hall";
import type { Look } from "@/lib/journey/shop";
import { BuildTiles, Lesson, Say, PARTS_CSS } from "../parts";

type Copy = {
  title: string; demo: string; holds: (name: string, n: number) => string; goFree: string; how: string; go: string;
  sparks: string; place: (p: number, of: number) => string; left: string; right: string; jump: string; exit: string;
  arrived: (name: string) => string; whichMeaning: string; whichWord: string; whichOdd: string; whichSense: string; senseYes: string; senseNo: string; whichBuild: string; hear: string; lesson: string; second: string; newToday: string; freed: string; held: (name: string) => string;
  nextWord: string; openGate: string; opened: string; freedCount: (n: number, of: number) => string; nextFort: string; backIndex: string;
  stillHolds: (name: string, n: number) => string; waitTomorrow: string; alsoNow: (names: string) => string;
  earlierToday: (names: string) => string; worldToday: (n: number) => string;
  tomorrow: string; pickRoad: string; picked: (name: string) => string; roads: string[]; ownWord: string; map: string;
  noneToday: string; fewWords: string; signIn: string; loading: string; failed: string; retry: string;
  monsters: string[]; sample: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "הדרך למבצר", demo: "משחק לדוגמה. הרצים האחרים הם דמויות לדוגמה, לא ילדים אמיתיים",
    holds: (name, n) => (n === 1 ? `${name} מחזיקה מילה אחת במבצר` : `${name} מחזיקה ${n} מילים במבצר`), goFree: "רוצו אל המבצר ושחררו אותן",
    how: "מזיזים את הדמות ימינה ושמאלה, קופצים מעל המכשולים ואוספים ניצוצות", go: "רצים",
    sparks: "ניצוצות", place: (p, of) => `מקום ${p} מתוך ${of}`, left: "שמאלה", right: "ימינה", jump: "קפיצה", exit: "יציאה",
    arrived: (name) => `הגעתם למבצר של ${name}`, whichMeaning: "מה הפירוש של המילה?", whichWord: "איזו מילה מתאימה לפירוש?", whichOdd: "איזו מילה יוצאת דופן?", whichSense: "המשפט הזה הגיוני?", senseYes: "הגיוני", senseNo: "לא הגיוני", whichBuild: "הרכיבו את המילה שמתאימה לפירוש", hear: "להאזנה", lesson: "כך זה נכון", second: "עוד ניסיון אחד למילה שנשארה בכלוב", newToday: "המילים החדשות שמחכות במבצר היום",
    freed: "המילה שוחררה", held: (name) => `${name} עוד מחזיקה את המילה. היא תחכה לכם מחר, ולא איבדתם כלום`,
    nextWord: "למילה הבאה", openGate: "פותחים את המבצר", opened: "המבצר נפתח", freedCount: (n, of) => `שחררתם ${n} מתוך ${of} מילים`,
    nextFort: "למבצר הבא", backIndex: "חזרה לאינדקס",
    stillHolds: (name, n) => (n === 1 ? `${name} עוד מחזיקה מילה אחת` : `${name} עוד מחזיקה ${n} מילים`), waitTomorrow: "הן יחכו לכם מחר במבצר הזה, ולא איבדתם כלום", alsoNow: (names) => `גם רצים עכשיו אל המבצר שלהם: ${names}`,
    earlierToday: (names) => `מוקדם יותר היום רצו כאן: ${names}`, worldToday: (n) => `היום ילדים שחררו יחד ${n.toLocaleString("he")} מילים`,
    tomorrow: "במבצר הבא מחכה מפלצת חדשה", pickRoad: "באיזו דרך רצים אליה?", picked: (name) => `בחרתם: ${name}`, roads: ["דרך היער", "דרך המדבר", "דרך הקרח"],
    ownWord: "את המילה הזאת חיפשתם בעצמכם", map: "🗺️ המפה שלי",
    noneToday: "המילים של היום כבר שוחררו. המבצר הבא ייפתח מחר", fewWords: "כשיהיו לכם שלוש מילים, המבצר הראשון ייפתח",
    signIn: "כדי לרוץ אל המבצר צריך להתחבר", loading: "מכינים את הדרך", failed: "הדרך לא נטענה", retry: "לנסות שוב",
    monsters: ["גרגרנית", "נחרנית", "קפצוצית"], sample: "דמות לדוגמה",
  },
  en: {
    title: "The road to the fortress", demo: "A sample game. The other runners are sample figures, not real children",
    holds: (name, n) => (n === 1 ? `${name} keeps one word in the fortress` : `${name} keeps ${n} words in the fortress`), goFree: "Run to the fortress and set them free",
    how: "Move the runner left and right, jump over the blocks and collect sparks", go: "Run",
    sparks: "Sparks", place: (p, of) => `Place ${p} of ${of}`, left: "Left", right: "Right", jump: "Jump", exit: "Exit",
    arrived: (name) => `You reached the fortress of ${name}`, whichMeaning: "What does the word mean?", whichWord: "Which word fits the meaning?", whichOdd: "Which word does not belong?", whichSense: "Does this sentence make sense?", senseYes: "It makes sense", senseNo: "It does not", whichBuild: "Build the word that fits the meaning", hear: "Listen", lesson: "This is the right one", second: "One more try for a word still in its cage", newToday: "The new words that wait in the fortress today",
    freed: "The word is free", held: (name) => `${name} still keeps this word. It waits for you tomorrow, and nothing was lost`,
    nextWord: "Next word", openGate: "Open the fortress", opened: "The fortress is open", freedCount: (n, of) => `You freed ${n} of ${of} words`,
    nextFort: "To the next fortress", backIndex: "Back to the index",
    stillHolds: (name, n) => (n === 1 ? `${name} still keeps one word` : `${name} still keeps ${n} words`), waitTomorrow: "They wait for you tomorrow in this fortress, and nothing was lost", alsoNow: (names) => `Also running to their own fortress now: ${names}`,
    earlierToday: (names) => `Earlier today these ran here: ${names}`, worldToday: (n) => `Today children freed ${n.toLocaleString("en")} words together`,
    tomorrow: "A new monster waits in the next fortress", pickRoad: "Which road will you take to it?", picked: (name) => `You chose: ${name}`, roads: ["The forest road", "The desert road", "The ice road"],
    ownWord: "You looked this word up yourself", map: "🗺️ My map",
    noneToday: "Today's words are already free. The next fortress opens tomorrow", fewWords: "The first fortress opens once you have three words",
    signIn: "Sign in to run to the fortress", loading: "Getting the road ready", failed: "The road did not load", retry: "Try again",
    monsters: ["Gobbler", "Snorer", "Hopper"], sample: "Sample runner",
  },
};

export const MONSTER_COLORS = ["#8b5cf6", "#f97316", "#14b8a6"];
/** The names of the three monsters, in the language of the platform. */
export const monsterNames = (lang: string): string[] => (COPY[lang] ?? COPY.en).monsters;
/** The names of the three roads. */
export const roadNames = (lang: string): string[] => (COPY[lang] ?? COPY.en).roads;

/** A funny monster, never a scary one. Three shapes, one per fortress in turn. */
export function Monster({ kind, sad, shadow }: { kind: number; sad: boolean; shadow?: boolean }) {
  const k = kind % 3;
  const fill = MONSTER_COLORS[k];
  return (
    <svg className={`run-monster${shadow ? " is-shadow" : ""}`} viewBox="0 0 200 190" role="img" aria-hidden="true">
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

  const [realData, setData] = useState<Data | null>(null);
  const demoSet = useMemo(() => demoData(lang), [lang]);
  const data = demo ? demoSet : realData;
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
  const [fading, setFading] = useState(false);
  // The second round (Gadi 2026-11-15): a word the child missed is explained
  // and asked once more at the end, in another format. A right answer there
  // opens its cage, so the fortress can open today; it gives no star and no
  // coins, and the word still comes back tomorrow.
  const [retry, setRetry] = useState<Array<{ q: Question; i: number }> | null>(null);
  const [retryAt, setRetryAt] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runRef = useRef<RunHandle | null>(null);
  // Inside the fortress: the 3D hall behind the questions (run/hall.ts). When
  // it cannot start (no WebGL), the flat room with the drawn monster stays.
  // The landscape of each fortress: the road the child chose for it (kept on
  // the server), else the three landscapes in turn.
  const [picks, setPicks] = useState<Record<string, number>>({});
  const roadOf = (s: number): number => picks[String(s)] ?? data?.roads?.[String(s)] ?? s % THEMES.length;
  const themeIdx = roadOf(stage);
  const pickRoad = (t: number) => {
    sfx.tap();
    setPicks((p) => ({ ...p, [String(stage + 1)]: t }));
    if (user && !demo) void user.getIdToken().then((tk) => fetch("/api/journey", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }, body: JSON.stringify({ road: t, forStage: stage + 1 }) })).catch(() => undefined);
  };
  const hallCanvas = useRef<HTMLCanvasElement | null>(null);
  const hallRef = useRef<HallHandle | null>(null);
  const [hallOn, setHallOn] = useState(false);
  const shown = useRef({ part: -1, place: 0 });
  const touch = useRef<{ x: number; y: number } | null>(null);

  const stageKey = user ? `gadit-journey-stage:${user.uid}` : "";
  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}&ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      const got = (await res.json()) as Data;
      setData(got);
      // The fortress number is kept on the server; a number saved in this
      // browser before 2026-11-15 is carried over once if it is further on.
      let local = 0;
      try { local = Number(window.localStorage.getItem(`gadit-journey-stage:${user.uid}`)) || 0; } catch { /* the first fortress */ }
      setStage(Math.max(got.stage ?? 0, local));
      setState("ready");
    } catch { setState("failed"); }
  }, [user, lang]);
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const questions = useMemo(() => {
    if (!data) return [];
    const byId = new Map(data.cards.map((x) => [x.id, x]));
    // The sample game: every fortress keeps other words.
    const todays: Data["todays"] = demo
      ? Array.from({ length: 6 }, (_, i) => ({ id: data.cards[(stage * 6 + i) % data.cards.length].id, format: i % 3 === 2 ? "build" : i % 2 ? "word" : "meaning" }))
      : data.todays;
    return todays.map((t) => { const card = byId.get(t.id); return card ? makeQuestion(card, t.format, data.cards, forChild, t.odd, t.sense) : null; }).filter((q): q is Question => !!q);
  }, [data, forChild, demo, stage]);

  const monster = c.monsters[stage % c.monsters.length];
  // The words of today that the child never opened: they are shown with their
  // meaning before the run and stand on signs along the road, so a word is
  // met before it is asked (the AI review: "the game tests but never teaches").
  // (The sample game shows its first three words this way, so the sample looks like the real thing.)
  const fresh = useMemo(() => (demo ? questions.slice(0, 3).map((x) => x.card) : questions.map((x) => x.card).filter((x) => !x.known && x.stars === 0).slice(0, 6)), [questions, demo]);
  // Other players who are on the road right now, anywhere (/api/journey/now):
  // a first name and a look, nothing more. They run beside the child; there is
  // no place in a race against them, no helping and no way to reach them.
  const [others, setOthers] = useState<Array<{ name: string; look: Look }>>([]);
  const [earlier, setEarlier] = useState<string[]>([]);
  const seeOthers = useCallback(async () => {
    if (!user || demo) return;
    try {
      const res = await fetch("/api/journey/now", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      const d = (await res.json()) as { others?: Array<{ name: string; look: Look }>; earlier?: string[] };
      if (Array.isArray(d.others)) setOthers(d.others);
      if (Array.isArray(d.earlier)) setEarlier(d.earlier);
    } catch { /* the road is simply quiet */ }
  }, [user, demo]);
  useEffect(() => { const id = window.setTimeout(() => { void seeOthers(); }, 0); return () => window.clearTimeout(id); }, [seeOthers]);
  const rivals = useMemo(
    () => (demo ? [{ name: `${c.sample} 1`, shirt: 0xe11d48 }, { name: `${c.sample} 2`, shirt: 0x7c3aed }] : others.map((o) => ({ name: o.name, shirt: 0x7c3aed, look: o.look }))),
    [demo, c.sample, others],
  );

  const begin = () => {
    sfx.tap();
    void seeOthers();
    setQueue(questions); setAt(0); setPicked(null); setResult(null); setMarks([]); setRetry(null); setRetryAt(0);
    setSparks(0); setPlace(1); setPart(0); setFading(false); shown.current = { part: -1, place: 0 };
    setPhase("run");
  };

  // The 3D run lives only while the run is on screen.
  useEffect(() => {
    if (phase !== "run" || !canvasRef.current) return;
    let gone = false;
    void startRun(canvasRef.current, {
      theme: themeIdx,
      look: data?.shop?.look,
      signs: fresh.map((x) => x.word),
      rivals,
      onSparks: setSparks,
      onSpark: () => sfx.tick(),
      onStumble: () => sfx.whoosh(),
      onJump: () => sfx.jump(),
      onProgress: (p, pl) => {
        const pct = Math.round(p * 100);
        if (pct !== shown.current.part) { shown.current.part = pct; setPart(pct); }
        if (pl !== shown.current.place) { shown.current.place = pl; setPlace(pl); }
      },
      onGate: () => { sfx.unlock(); setFading(true); },
      onArrive: (r) => { setPlace(r.place); setSparks(r.sparks); setFading(false); setPhase("fort"); },
    }).then((h) => { if (gone) h.dispose(); else runRef.current = h; }).catch(() => { if (!gone) setPhase("fort"); });
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); runRef.current?.steer(-1); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); runRef.current?.steer(1); }
      if (e.key === "ArrowUp" || e.key === " " || e.key === "w" || e.key === "W") { e.preventDefault(); runRef.current?.jump(); }
    };
    window.addEventListener("keydown", key);
    return () => { gone = true; window.removeEventListener("keydown", key); runRef.current?.dispose(); runRef.current = null; };
  }, [phase, stage, rivals, fresh]);

  const q = retry ? retry[retryAt]?.q ?? null : queue[at] ?? null;
  // The cage in the hall that the question on screen belongs to.
  const nowIdx = retry ? retry[retryAt]?.i ?? 0 : at;

  // The hall lives from the moment the runner is inside until the child leaves the fortress.
  const inside = phase === "fort" || phase === "open";
  const look = data?.shop?.look;
  const cagesN = queue.length;
  useEffect(() => {
    if (!inside || !hallCanvas.current || cagesN === 0) return;
    let gone = false;
    void startHall(hallCanvas.current, { theme: themeIdx, look, own: queue.map((x) => !demo && !x.card.id.startsWith("lvl-")), total: cagesN, monster: stage, monsterColor: parseInt(MONSTER_COLORS[stage % 3].slice(1), 16), rtl: dir === "rtl" })
      .then((h) => { if (gone) { h.dispose(); return; } hallRef.current = h; setHallOn(true); })
      .catch(() => undefined);
    return () => { gone = true; hallRef.current?.dispose(); hallRef.current = null; setHallOn(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the hall is built once per fortress
  }, [inside, stage, themeIdx, look, cagesN, dir]);
  // What happens in the hall follows the answers.
  useEffect(() => { if (hallOn) hallRef.current?.now(nowIdx); }, [hallOn, nowIdx]);
  useEffect(() => {
    if (!hallOn || !hallRef.current) return;
    marks.forEach((ok, i) => { if (ok) hallRef.current?.free(i); else hallRef.current?.hold(i); });
    if (phase === "open" && marks.length > 0 && marks.every(Boolean)) hallRef.current.open();
  }, [hallOn, marks, phase]);

  async function choose(opt: CardView) {
    if (!q || picked) return;
    setPicked(opt.id);
    const right = opt.id === q.card.id;
    if (right) sfx.correct(); else sfx.wrong();
    let r: Result;
    if (retry) {
      // The second round is kept on this screen only: no star, no coins.
      setResult({ correct: right, event: "practice", frameUp: null, card: q.card, coinsUp: 0 });
      if (right) { const i = retry[retryAt].i; setMarks((m) => m.map((v, k) => (k === i ? true : v))); }
      return;
    }
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
    if (retry) { if (retryAt + 1 < retry.length) { setRetryAt(retryAt + 1); return; } }
    else {
      if (at + 1 < queue.length) { setAt(at + 1); return; }
      // One more try for every word that stayed in its cage, asked another way.
      const missed = marks.map((ok, i) => (ok ? -1 : i)).filter((i) => i >= 0);
      const again = missed
        .map((i) => { const first = queue[i]; const other = makeQuestion(first.card, first.format === "meaning" ? "word" : "meaning", data?.cards ?? [], forChild); return other ? { q: other, i } : null; })
        .filter((x): x is { q: Question; i: number } => !!x);
      if (again.length) { setRetry(again); setRetryAt(0); return; }
    }
    // The fortress opens only when every word of the day was freed; a word
    // the monster still keeps waits in the same fortress tomorrow.
    if (marks.every(Boolean)) {
      sfx.win();
      if (stageKey) { try { window.localStorage.setItem(stageKey, String(stage + 1)); } catch { /* the stage is kept for this visit only */ } }
      if (user && !demo) {
        void user.getIdToken().then((t) => fetch("/api/journey", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` }, body: JSON.stringify({ stage: stage + 1 }) })).catch(() => undefined);
      }
    }
    setPhase("open");
  };
  const nextFort = () => { sfx.tap(); setStage(stage + 1); setPhase("intro"); };

  const freedN = marks.filter(Boolean).length;
  const ready = (user || demo) && data && state === "ready";

  if (phase === "run") {
    return (
      <div className="run-stage" dir={dir}>
        <style>{RUN_CSS}</style>
        <canvas ref={canvasRef} className="run-canvas" onPointerDown={(e) => { touch.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => {
            // A swipe up is a jump; a tap moves to the side that was tapped.
            const t = touch.current; touch.current = null;
            if (!t) return;
            const dx = e.clientX - t.x, dy = e.clientY - t.y;
            if (dy < -36 && Math.abs(dy) > Math.abs(dx)) runRef.current?.jump();
            else if (Math.abs(dx) > 36) runRef.current?.steer(dx < 0 ? -1 : 1);
            else runRef.current?.steer(e.clientX < window.innerWidth / 2 ? -1 : 1);
          }} />
        <div className="run-hud">
          <span className="run-chip is-sparks"><b>✦</b> {sparks}</span>
          {demo && rivals.length > 0 && <span className="run-chip">{c.place(place, rivals.length + 1)}</span>}
          <button type="button" className="run-chip is-exit" onClick={() => setPhase("intro")}>{c.exit}</button>
        </div>
        <div className="run-bar" aria-hidden="true"><i style={{ width: `${part}%` }} /></div>
        <div className={`run-fade${fading ? " is-on" : ""}`} aria-hidden="true" />
        <div className="run-keys" dir="ltr">
          <button type="button" aria-label={c.left} onClick={() => runRef.current?.steer(-1)}>‹</button>
          <button type="button" className="is-jump" aria-label={c.jump} onClick={() => runRef.current?.jump()}>{c.jump}</button>
          <button type="button" aria-label={c.right} onClick={() => runRef.current?.steer(1)}>›</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`wordbook jrn run-room is-t${themeIdx}${phase === "intro" ? " is-out" : ""}${hallOn ? " has-hall" : ""}`} dir={dir}>
      <style>{JRN_CSS + PARTS_CSS + RUN_CSS}</style>
      {inside && <canvas ref={hallCanvas} className={`run-hall${hallOn ? " is-on" : ""}`} aria-hidden="true" />}
      {phase !== "intro" && <><i className="run-torch is-a" aria-hidden="true" /><i className="run-torch is-b" aria-hidden="true" /></>}
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
                {fresh.length > 0 && (
                  <div className="run-fresh">
                    <div className="jrn-small">{c.newToday}</div>
                    {fresh.map((x) => (
                      <div key={x.id} className="run-fresh-row" dir="auto"><b>{x.word}</b> <Say text={x.word} label={c.hear} /> <span>{shortMeaning(x.meaning)}</span></div>
                    ))}
                  </div>
                )}
                <p className="jrn-small">{c.how}</p>
                {!demo && others.length > 0 && <p className="jrn-small run-also">{c.alsoNow(others.map((o) => o.name).join(", "))}</p>}
                {!demo && others.length === 0 && earlier.length > 0 && <p className="jrn-small run-also">{c.earlierToday(earlier.join(", "))}</p>}
                {!demo && (data?.world?.freedToday ?? 0) >= 10 && <p className="jrn-small run-also">{c.worldToday(data!.world!.freedToday)}</p>}
                <button type="button" className="jrn-btn" onClick={begin}>{c.go}</button>
                {!demo && <Link className="jrn-btn is-ghost" href="/journey/shop">{lang === "he" ? "🛍️ לחנות" : "🛍️ To the shop"}</Link>}
                {!demo && <Link className="jrn-btn is-ghost" href="/journey/map">{c.map}</Link>}
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
            {!hallOn && <Monster kind={stage} sad={!!result?.correct} />}
            <div className="jrn-step">{c.arrived(monster)}</div>
            <div className="run-cages" aria-hidden="true">
              {queue.map((x, i) => <i key={x.card.id} className={`${i < marks.length ? (marks[i] ? "is-free" : "is-held") : ""}${i === nowIdx ? " is-now" : ""}`} />)}
            </div>
            {retry && <div className="jrn-small run-second">{c.second}</div>}
            {!demo && !q.card.id.startsWith("lvl-") && <div className="jrn-small run-own">{c.ownWord}</div>}
            <div className="jrn-ask">{q.format === "build" ? c.whichBuild : q.format === "sense" ? c.whichSense : q.format === "odd" ? c.whichOdd : q.format === "meaning" ? c.whichMeaning : c.whichWord}</div>
            {q.format !== "odd" && (
              <div className="jrn-prompt-row">
                <div className={`jrn-prompt${q.format === "meaning" ? " is-word" : ""}`} dir="auto">{q.format === "sense" ? q.sentence : q.format === "meaning" ? q.card.word : shortMeaning(q.card.meaning)}</div>
                <Say text={q.format === "sense" ? q.sentence ?? "" : q.format === "meaning" ? q.card.word : shortMeaning(q.card.meaning)} label={c.hear} />
              </div>
            )}
            {q.format === "build" && <BuildTiles key={q.card.id} word={q.card.word} extra={forChild ? 0 : 2} disabled={!!picked} onDone={(right) => void choose({ ...q.card, id: right ? q.card.id : `${q.card.id}#x` })} />}
            <div className="jrn-options">
              {q.options.map((o) => {
                const isRight = !!picked && o.id === q.card.id;
                const isWrong = picked === o.id && o.id !== q.card.id;
                return (
                  <button key={o.id} type="button" className={`jrn-option${q.format !== "meaning" ? " is-word" : ""}${isRight ? " is-right" : ""}${isWrong ? " is-other" : ""}`} onClick={() => void choose(o)} aria-disabled={!!picked || undefined} dir="auto">
                    {q.format === "sense" ? (o.word === "yes" ? c.senseYes : c.senseNo) : q.format === "meaning" ? shortMeaning(o.meaning) : o.word}
                  </button>
                );
              })}
            </div>
            {result && (
              <div className="jrn-result">
                <div className={`jrn-result-line${result.correct ? " is-good" : ""}`}>{result.correct ? c.freed : c.held(monster)}</div>
                {!result.correct && <Lesson word={q.card.word} meaning={shortMeaning(q.card.meaning)} title={c.lesson} hear={c.hear} />}
                {result.coinsUp > 0 && <div className="jrn-coinup">+{result.coinsUp}</div>}
                <button type="button" className="jrn-btn" onClick={next}>{(retry ? retryAt + 1 < retry.length : at + 1 < queue.length || marks.some((ok) => !ok)) ? c.nextWord : c.openGate}</button>
              </div>
            )}
          </section>
        )}

        {ready && phase === "open" && (
          <section className="jrn-play">
            {!hallOn && <Monster kind={stage} sad={freedN === queue.length} />}
            <h1 className="jrn-title">{freedN === queue.length ? c.opened : c.stillHolds(monster, queue.length - freedN)}</h1>
            <div className="jrn-ask">{freedN === queue.length ? c.freedCount(freedN, queue.length) : `${c.freedCount(freedN, queue.length)}. ${c.waitTomorrow}`}</div>
            <div className="run-sum">
              <span className="run-chip is-sparks"><b>✦</b> {sparks} {c.sparks}</span>
              {demo && rivals.length > 0 && <span className="run-chip">{c.place(place, rivals.length + 1)}</span>}
            </div>
            {freedN === queue.length && (
              <div className="run-roads">
                <Monster kind={stage + 1} sad={false} shadow />
                <div className="jrn-note">{c.tomorrow}</div>
                <div className="jrn-small">{picks[String(stage + 1)] !== undefined ? c.picked(c.roads[picks[String(stage + 1)]]) : c.pickRoad}</div>
                <div className="run-road-row">
                  {[0, 1, 2].filter((t) => t !== themeIdx).map((t) => (
                    <button key={t} type="button" className={`run-road${picks[String(stage + 1)] === t ? " is-on" : ""}`} onClick={() => pickRoad(t)}>
                      <i style={{ background: `linear-gradient(${THEMES[t].skyTop} 0%, ${THEMES[t].sky} 56%, #${THEMES[t].ground.toString(16).padStart(6, "0")} 56%)` }} />
                      {c.roads[t]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {demo
              ? <button type="button" className="jrn-btn" onClick={nextFort}>{c.nextFort}</button>
              : <><Link className="jrn-btn" href="/journey/map">{c.map}</Link><Link className="jrn-btn is-ghost" href="/journey">{c.backIndex}</Link></>}
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
.run-keys button.is-jump { width: auto; min-width: 120px; padding: 0 26px; border-radius: 999px; font-size: 22px; align-self: end; height: 64px; }
.run-room { min-height: 100dvh; --j-ink: #14202b; --j-soft: #47586a; --j-surface: #fffdf5; --j-line: #e2d6b8; --wall: #7d8a99; --trim: #d9534f; --sky: #bfe8ff; --land: #7cc46a;
  background-color: var(--wall);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='.2' stroke-width='3'%3E%3Cpath d='M0 1.5h96M0 33.5h96M24 0v32M72 0v32M0 32v32M48 32v32M96 32v32'/%3E%3C/g%3E%3C/svg%3E"); }
.run-room.is-t1 { --wall: #c08a5c; --trim: #6b3fa0; --sky: #ffe2b0; --land: #e8c07a; }
.run-room.is-t2 { --wall: #7fa9cc; --trim: #2f6fb0; --sky: #d8f1ff; --land: #f2fbff; }
.run-room:not(.is-out) { background-image: radial-gradient(ellipse at 50% 28%, rgba(255,214,120,.28) 0, transparent 46%), radial-gradient(ellipse at 50% 40%, transparent 42%, rgba(0,0,0,.5) 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='64'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='.2' stroke-width='3'%3E%3Cpath d='M0 1.5h96M0 33.5h96M24 0v32M72 0v32M0 32v32M48 32v32M96 32v32'/%3E%3C/g%3E%3C/svg%3E"); animation: run-in .7s ease-out; }
@keyframes run-in { from { filter: brightness(.25); } to { filter: none; } }
.run-fade { position: absolute; inset: 0; background: #120d0a; opacity: 0; pointer-events: none; transition: opacity 1.3s ease-in .25s; }
.run-fade.is-on { opacity: 1; }
.run-torch { position: fixed; top: 20%; width: 16px; height: 86px; border-radius: 6px; background: linear-gradient(#3a2a1c 0 100%); display: none; }
.run-torch.is-a { inset-inline-start: max(16px, calc(50% - 560px)); }
.run-torch.is-b { inset-inline-end: max(16px, calc(50% - 560px)); }
.run-torch::before { content: ""; position: absolute; left: 50%; bottom: 100%; width: 44px; height: 62px; margin-left: -22px; border-radius: 50% 50% 46% 46% / 64% 64% 36% 36%; background: radial-gradient(ellipse at 50% 78%, #fff3b0 0 22%, #ffb020 46%, #f0541a 74%, transparent 76%); transform-origin: 50% 100%; animation: run-flame .5s ease-in-out infinite alternate; }
.run-torch::after { content: ""; position: absolute; left: 50%; bottom: 60%; width: 260px; height: 260px; margin: 0 0 0 -130px; border-radius: 50%; background: radial-gradient(circle, rgba(255,190,90,.35), transparent 68%); pointer-events: none; }
@keyframes run-flame { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(.9, 1.12) rotate(3deg); } }
@media (min-width: 1040px) { .run-torch { display: block; } }
@media (prefers-reduced-motion: reduce) { .run-torch::before, .run-room:not(.is-out) { animation: none; } }
.run-room.is-out { background-image: linear-gradient(var(--sky) 0 58%, var(--land) 58% 100%); }
.run-fresh { display: grid; gap: 8px; justify-items: center; width: 100%; max-width: 560px; padding: 12px 14px; border-radius: 16px; background: #f0faf9; box-shadow: 0 0 0 2px #bfe3e0 inset; }
.run-fresh-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 16px; line-height: 1.5; }
.run-fresh-row b { font-size: 20px; }
.run-second { font-weight: 700; color: #7a5a00; background: #fff8e1; padding: 4px 14px; border-radius: 999px; }
.run-hall { position: fixed; inset: 0 0 auto 0; width: 100%; height: 46dvh; display: block; opacity: 0; transition: opacity .5s ease; z-index: 0; pointer-events: none; }
.run-hall.is-on { opacity: 1; }
.run-room.has-hall .jrn-wrap { position: relative; z-index: 1; padding-top: calc(46dvh - 36px); }
.run-room.has-hall .run-torch { display: none; }
@media (prefers-reduced-motion: reduce) { .run-hall { transition: none; } }
.run-room .jrn-play { background: #fffdf5; border: 5px solid var(--trim); box-shadow: 0 10px 0 rgba(0,0,0,.22); }
.run-room .jrn-option { background: #fff; }
.run-monster { width: min(190px, 46vw); height: auto; }
.run-monster.is-shadow { filter: brightness(0); opacity: .45; width: min(120px, 30vw); }
.run-roads { display: grid; gap: 10px; justify-items: center; width: 100%; }
.run-road-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.run-road { display: grid; gap: 6px; justify-items: center; padding: 8px 8px 10px; border: 0; border-radius: 16px; background: #fff; font: inherit; font-weight: 700; font-size: 15px; color: #14202b; cursor: pointer; box-shadow: 0 0 0 2px #e2d6b8 inset; }
.run-road i { display: block; width: 132px; height: 74px; border-radius: 10px; }
.run-road.is-on { box-shadow: 0 0 0 3px #0a7472 inset; }
.run-own { font-weight: 700; color: #7a5a00; background: #fff3c4; padding: 3px 12px; border-radius: 999px; }
.run-cages { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; direction: ltr; }
.run-cages i { width: 22px; height: 28px; border-radius: 6px; background: #eef2f6; box-shadow: 0 0 0 2px #b8c4d0 inset; }
.run-cages i.is-now { box-shadow: 0 0 0 3px #0a7472 inset; }
.run-cages i.is-free { background: #dcfce7; box-shadow: 0 0 0 2px #4ade80 inset; }
.run-cages i.is-held { background: #ede9fe; box-shadow: 0 0 0 2px #a78bfa inset; }
.run-sum { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.run-sum .run-chip { background: #fff3c4; color: #6b4a00; }
a.jrn-btn { display: inline-grid; place-items: center; text-decoration: none; }
`;
