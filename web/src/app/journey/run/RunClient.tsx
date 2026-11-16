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
import { demoData, demoResult, makeQuestion, maskedMeaning, shortMeaning, zone, JRN_CSS, type CardView, type Data, type Question, type Result } from "../JourneyClient";
import { startRun, THEMES, type RunHandle } from "./engine";
import { startHall, type HallHandle } from "./hall";
import { startIntro, type IntroHandle } from "./intro";
import type { Look } from "@/lib/journey/shop";
import { BuildTiles, Lesson, Say, PARTS_CSS } from "../parts";
import { WaitText } from "@/components/WaitText";

type Copy = {
  title: string; demo: string; holds: (name: string, n: number) => string; goFree: string; how: string; go: string;
  sparks: string; place: (p: number, of: number) => string; left: string; right: string; jump: string; exit: string; hintTouch: string; hintMouse: string;
  arrived: (name: string) => string; whichMeaning: string; whichWord: string; whichOdd: string; whichSense: string; senseYes: string; senseNo: string; whichBuild: string; hear: string; lesson: string; second: string; newToday: string; freed: string; held: (name: string) => string;
  nextWord: string; openGate: string; opened: string; freedCount: (n: number, of: number) => string; nextFort: string; backIndex: string;
  stillHolds: (name: string, n: number) => string; waitTomorrow: string; alsoNow: (names: string) => string;
  earlierToday: (names: string) => string; worldToday: (n: number) => string;
  tomorrow: string; pickRoad: string; picked: (name: string) => string; roads: string[]; ownWord: string; listWord: string; map: string; shopTile: string; mapTile: string; coinsN: (n: number) => string; fortN: (n: number) => string;
  noneToday: string; fewWords: string; signIn: string; loading: string; failed: string; retry: string;
  monsters: string[]; sample: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "הדרך למבצר", demo: "משחק לדוגמה. הרצים האחרים הם דמויות לדוגמה, לא ילדים אמיתיים",
    holds: (name, n) => (n === 1 ? `${name} מחזיקה מילה אחת במבצר` : `${name} מחזיקה ${n} מילים במבצר`), goFree: "רוצו אל המבצר ושחררו אותן",
    how: "מזיזים את הדמות ימינה ושמאלה, קופצים מעל המכשולים ואוספים ניצוצות", go: "רצים",
    sparks: "ניצוצות", place: (p, of) => `מקום ${p} מתוך ${of}`, left: "שמאלה", right: "ימינה", jump: "קפיצה", exit: "יציאה",
    hintTouch: "מחליקים ימינה ושמאלה כדי לזוז, ולמעלה כדי לקפוץ", hintMouse: "מזיזים את העכבר ימינה ושמאלה, ולוחצים כדי לקפוץ",
    arrived: (name) => `הגעתם למבצר של ${name}`, whichMeaning: "מה הפירוש של המילה?", whichWord: "איזו מילה מתאימה לפירוש?", whichOdd: "איזו מילה יוצאת דופן?", whichSense: "המשפט הזה הגיוני?", senseYes: "הגיוני", senseNo: "לא הגיוני", whichBuild: "הרכיבו את המילה שמתאימה לפירוש", hear: "להאזנה", lesson: "כך זה נכון", second: "עוד ניסיון אחד למילה שנשארה בכלוב", newToday: "המילים החדשות שמחכות במבצר היום",
    freed: "המילה שוחררה", held: (name) => `${name} עוד מחזיקה את המילה. היא תחכה לכם מחר, ולא איבדתם כלום`,
    nextWord: "למילה הבאה", openGate: "פותחים את המבצר", opened: "המבצר נפתח", freedCount: (n, of) => `שחררתם ${n} מתוך ${of} מילים`,
    nextFort: "למבצר הבא", backIndex: "חזרה לקלפים שלי",
    stillHolds: (name, n) => (n === 1 ? `${name} עוד מחזיקה מילה אחת` : `${name} עוד מחזיקה ${n} מילים`), waitTomorrow: "הן יחכו לכם מחר במבצר הזה, ולא איבדתם כלום", alsoNow: (names) => `גם רצים עכשיו אל המבצר שלהם: ${names}`,
    earlierToday: (names) => `מוקדם יותר היום רצו כאן: ${names}`, worldToday: (n) => `היום ילדים שחררו יחד ${n.toLocaleString("he")} מילים`,
    tomorrow: "במבצר הבא מחכה מפלצת חדשה", pickRoad: "באיזו דרך רצים אליה?", picked: (name) => `בחרתם: ${name}`, roads: ["דרך היער", "דרך המדבר", "דרך הקרח"],
    ownWord: "את המילה הזאת חיפשתם בעצמכם", listWord: "מילה מהרשימה שלכם", shopTile: "החנות", mapTile: "המפה שלי", coinsN: (n) => `${n} מטבעות`, fortN: (n) => `מבצר ${n}`, map: "🗺️ המפה שלי",
    noneToday: "המילים של היום כבר שוחררו. המבצר הבא ייפתח מחר", fewWords: "כשיהיו לכם שלוש מילים, המבצר הראשון ייפתח",
    signIn: "כדי לרוץ אל המבצר צריך להתחבר", loading: "מכינים את הדרך", failed: "הדרך לא נטענה", retry: "לנסות שוב",
    monsters: ["גרגרנית", "נחרנית", "קפצוצית"], sample: "דמות לדוגמה",
  },
  en: {
    title: "The road to the fortress", demo: "A sample game. The other runners are sample figures, not real children",
    holds: (name, n) => (n === 1 ? `${name} keeps one word in the fortress` : `${name} keeps ${n} words in the fortress`), goFree: "Run to the fortress and set them free",
    how: "Move the runner left and right, jump over the blocks and collect sparks", go: "Run",
    sparks: "Sparks", place: (p, of) => `Place ${p} of ${of}`, left: "Left", right: "Right", jump: "Jump", exit: "Exit",
    hintTouch: "Swipe left and right to move, and up to jump", hintMouse: "Move the mouse left and right, and click to jump",
    arrived: (name) => `You reached the fortress of ${name}`, whichMeaning: "What does the word mean?", whichWord: "Which word fits the meaning?", whichOdd: "Which word does not belong?", whichSense: "Does this sentence make sense?", senseYes: "It makes sense", senseNo: "It does not", whichBuild: "Build the word that fits the meaning", hear: "Listen", lesson: "This is the right one", second: "One more try for a word still in its cage", newToday: "The new words that wait in the fortress today",
    freed: "The word is free", held: (name) => `${name} still keeps this word. It waits for you tomorrow, and nothing was lost`,
    nextWord: "Next word", openGate: "Open the fortress", opened: "The fortress is open", freedCount: (n, of) => `You freed ${n} of ${of} words`,
    nextFort: "To the next fortress", backIndex: "Back to my cards",
    stillHolds: (name, n) => (n === 1 ? `${name} still keeps one word` : `${name} still keeps ${n} words`), waitTomorrow: "They wait for you tomorrow in this fortress, and nothing was lost", alsoNow: (names) => `Also running to their own fortress now: ${names}`,
    earlierToday: (names) => `Earlier today these ran here: ${names}`, worldToday: (n) => `Today children freed ${n.toLocaleString("en")} words together`,
    tomorrow: "A new monster waits in the next fortress", pickRoad: "Which road will you take to it?", picked: (name) => `You chose: ${name}`, roads: ["The forest road", "The desert road", "The ice road"],
    ownWord: "You looked this word up yourself", listWord: "A word from your list", shopTile: "The shop", mapTile: "My map", coinsN: (n) => `${n} coins`, fortN: (n) => `Fortress ${n}`, map: "🗺️ My map",
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

/**
 * While the road is made ready (Gadi 2026-11-16: "not just two colours on the
 * screen that have nothing to do with the game"): the fortress at the end of a
 * winding path, a dotted line marching towards it and sparks along the way, in
 * the colours of today's road.
 */
function RoadLoading({ text, kind }: { text: string; kind: number }) {
  return (
    <div className="run-loading" role="status">
      <p className="run-loading-text"><WaitText text={text} live /></p>
      <div className="run-loading-scene" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="run-loading-fort" src={`/journey/thumbs/fortress${(kind % 3) + 1}.webp`} alt="" width={180} height={180} />
        <svg className="run-loading-road" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path className="rl-road" d="M120 300 C 140 250, 240 236, 206 186 C 186 156, 194 132, 196 112 L 204 112 C 206 132, 214 156, 226 186 C 262 238, 282 262, 280 300 Z" />
          <path className="rl-line" d="M200 300 C 204 256, 236 230, 216 186 C 202 156, 200 134, 200 116" />
        </svg>
        <i className="rl-spark is-1">✦</i><i className="rl-spark is-2">✦</i><i className="rl-spark is-3">✦</i><i className="rl-spark is-4">✦</i>
      </div>
    </div>
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
  // The opening screen: the fortress of today in 3D behind the card (run/intro.ts).
  const introCanvas = useRef<HTMLCanvasElement | null>(null);
  const [introOn, setIntroOn] = useState(false);
  // The question card must fit on the screen under the hall (Gadi 2026-11-15:
  // "the bottom of the frame goes down, raise it"). The card's height is kept
  // in --card-h on the room, and the hall takes only the height that is left.
  const roomRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const [hallOn, setHallOn] = useState(false);
  const shown = useRef({ part: -1, place: 0 });
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [mouse, setMouse] = useState(false);

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
      ? Array.from({ length: 6 }, (_, i) => ({ id: data.cards[(stage * 6 + i) % data.cards.length].id, format: i % 3 === 2 ? "build" : "word" }))
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
    setMouse(typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
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
  const atIntro = phase === "intro" && !!data;
  useEffect(() => {
    if (!atIntro || !introCanvas.current) return;
    let gone = false, h: IntroHandle | null = null;
    void startIntro(introCanvas.current, { theme: themeIdx, monster: stage, rtl: dir === "rtl" })
      .then((x) => { if (gone) { x.dispose(); return; } h = x; setIntroOn(true); })
      .catch(() => undefined);
    return () => { gone = true; h?.dispose(); setIntroOn(false); };
  }, [atIntro, themeIdx, stage, dir]);
  // Keep the card's height on the room, so the hall shrinks to leave the card on screen.
  useEffect(() => {
    const card = cardRef.current, room = roomRef.current;
    if (!(inside || phase === "intro") || !card || !room) return;
    const set = () => room.style.setProperty("--card-h", `${Math.ceil(card.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(card);
    return () => ro.disconnect();
  }, [inside, phase, at, retryAt, retry]);
  // After an answer, the button to go on is brought into view.
  useEffect(() => {
    if (result) cardRef.current?.querySelector(".jrn-result .jrn-btn")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [result]);
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
        .map((i) => { const first = queue[i]; const other = makeQuestion(first.card, first.format === "build" ? "word" : "build", data?.cards ?? [], forChild); return other ? { q: other, i } : null; })
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
        {/* No buttons on the screen (Gadi's son, 2026-11-16: "the arrows and the
            jump are not needed, no game works like that today"). A phone: swipe
            to the side to move, swipe up to jump, a tap moves to the side that
            was tapped. A computer: the runner follows the mouse, a click jumps.
            The arrow keys and the space bar still work. */}
        <canvas ref={canvasRef} className="run-canvas"
          onPointerDown={(e) => { touch.current = { x: e.clientX, y: e.clientY }; }}
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const w = window.innerWidth;
            runRef.current?.lane(e.clientX < w / 3 ? 0 : e.clientX > (w * 2) / 3 ? 2 : 1);
          }}
          onPointerUp={(e) => {
            const t = touch.current; touch.current = null;
            if (!t) return;
            const dx = e.clientX - t.x, dy = e.clientY - t.y;
            if (dy < -36 && Math.abs(dy) > Math.abs(dx)) runRef.current?.jump();
            else if (e.pointerType === "mouse") runRef.current?.jump();
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
        <div className="run-hint" aria-live="polite">{mouse ? c.hintMouse : c.hintTouch}</div>
      </div>
    );
  }

  return (
    <div ref={roomRef} className={`wordbook jrn run-room is-t${themeIdx}${phase === "intro" ? " is-out" : ""}${hallOn ? " has-hall" : ""}${introOn && phase === "intro" ? " has-intro" : ""}`} dir={dir}>
      {atIntro && <canvas ref={introCanvas} className={`run-intro${introOn ? " is-on" : ""}`} aria-hidden="true" />}
      <style>{JRN_CSS + PARTS_CSS + RUN_CSS}</style>
      {inside && <canvas ref={hallCanvas} className={`run-hall${hallOn ? " is-on" : ""}`} aria-hidden="true" />}
      {/* The arrival line stands on the red carpet, a little above the card (Gadi 2026-11-16). */}
      {hallOn && phase === "fort" && <div className="run-hall-title">{c.arrived(monster)}</div>}
      {phase !== "intro" && <><i className="run-torch is-a" aria-hidden="true" /><i className="run-torch is-b" aria-hidden="true" /></>}
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && !data && <RoadLoading text={c.loading} kind={stage} />}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}

        {ready && phase === "intro" && (
          <section ref={cardRef} className="jrn-play run-intro-card">
            {/* The way back at the top (Gadi 2026-11-15). */}
            <div className="run-intro-top">
              <Link className="jrn-back" href={demo ? "/journey?demo=1" : "/journey"}><span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {c.backIndex}</Link>
              {demo && <span className="jrn-demo">{c.demo}</span>}
            </div>
            <h1 className="jrn-title">{c.title}</h1>
            {questions.length > 0 ? (
              <>
                {!introOn && <Monster kind={stage} sad={false} />}
                <div className="run-intro-lead"><b>{c.holds(monster, questions.length)}</b><span>{c.goFree}</span></div>
                {fresh.length > 0 && (
                  // The new words in a table: the word and its speaker in one column,
                  // the meaning in the other, each on one line (Gadi 2026-11-15).
                  <div className="run-fresh">
                    <div className="run-fresh-head">{c.newToday}</div>
                    <table className="run-fresh-table">
                      <tbody>
                        {fresh.map((x) => (
                          <tr key={x.id}>
                            <th scope="row"><span className="run-fresh-word"><bdi>{x.word}</bdi><Say text={x.word} label={c.hear} /></span></th>
                            <td title={shortMeaning(x.meaning)}><bdi>{shortMeaning(x.meaning)}</bdi></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="jrn-small">{c.how}</p>
                {!demo && others.length > 0 && <p className="jrn-small run-also">{c.alsoNow(others.map((o) => o.name).join(", "))}</p>}
                {!demo && others.length === 0 && earlier.length > 0 && <p className="jrn-small run-also">{c.earlierToday(earlier.join(", "))}</p>}
                {!demo && (data?.world?.freedToday ?? 0) >= 10 && <p className="jrn-small run-also">{c.worldToday(data!.world!.freedToday)}</p>}
                <button type="button" className="jrn-btn run-go" onClick={begin}>{c.go} <span aria-hidden="true">{dir === "rtl" ? "◀" : "▶"}</span></button>
                <div className="run-tiles">
                  <Link className="run-tile" href={demo ? "/journey/shop?demo=1" : "/journey/shop"}>
                    <span className="run-tile-icon" aria-hidden="true">🛍️</span>
                    <span className="run-tile-text"><b>{c.shopTile}</b><small>{c.coinsN(Math.max(0, (data?.coins ?? 0) - (data?.shop?.spent ?? 0)))}</small></span>
                  </Link>
                  <Link className="run-tile" href={demo ? "/journey/map?demo=1" : "/journey/map"}>
                    <span className="run-tile-icon" aria-hidden="true">🗺️</span>
                    <span className="run-tile-text"><b>{c.mapTile}</b><small>{c.fortN(stage + 1)}</small></span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {!introOn && <Monster kind={stage} sad />}
                <p className="jrn-note">{data.cards.length < 3 ? c.fewWords : c.noneToday}</p>
                <Link className="jrn-btn" href="/journey">{c.backIndex}</Link>
              </>
            )}
          </section>
        )}

        {ready && phase === "fort" && q && (
          <section ref={cardRef} className="jrn-play run-q" aria-live="polite">
            {/* Gadi 2026-11-16 ("a bit too much for the eye"): no arrival line,
                no "you looked this word up" chip, and the row of cages only when
                the hall (which hangs its own cages) is not drawn. */}
            {!hallOn && <Monster kind={stage} sad={!!result?.correct} />}
            {!hallOn && <div className="jrn-step">{c.arrived(monster)}</div>}
            {!hallOn && (
              <div className="run-cages" aria-hidden="true">
                {queue.map((x, i) => <i key={x.card.id} className={`${i < marks.length ? (marks[i] ? "is-free" : "is-held") : ""}${i === nowIdx ? " is-now" : ""}`} />)}
              </div>
            )}
            {retry && <div className="jrn-small run-second">{c.second}</div>}
            <div className="run-askbox">
              <div className="jrn-ask">{q.format === "build" ? c.whichBuild : q.format === "sense" ? c.whichSense : q.format === "odd" ? c.whichOdd : q.format === "meaning" ? c.whichMeaning : c.whichWord}</div>
              {q.format !== "odd" && (
                <div className="jrn-prompt-row">
                  <div className={`jrn-prompt${q.format === "meaning" ? " is-word" : ""}`} dir="auto">{q.format === "sense" ? q.sentence : q.format === "meaning" ? q.card.word : maskedMeaning(q.card)}</div>
                  <Say text={q.format === "sense" ? q.sentence ?? "" : q.format === "meaning" ? q.card.word : maskedMeaning(q.card)} label={c.hear} />
                </div>
              )}
            </div>
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
          <section ref={cardRef} className="jrn-play">
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
.run-hint { position: absolute; inset-inline: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 28px); width: fit-content; max-width: calc(100% - 32px); margin-inline: auto; padding: 10px 18px; border-radius: 999px; background: rgba(20,32,43,.62); color: #fff; font-weight: 700; font-size: 16px; line-height: 1.4; text-align: center; pointer-events: none; opacity: 0; animation: run-hint 5s ease .6s forwards; }
@keyframes run-hint { 0% { opacity: 0; transform: translateY(8px); } 12%, 82% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .run-hint { animation: none; opacity: 1; } }
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
/* The open air before the 3D scene: a sky that warms towards the horizon and soft
   hills in the colours of today's road, never two flat halves (Gadi 2026-11-16). */
.run-room.is-out { background-image:
  radial-gradient(130% 55% at 50% 108%, color-mix(in srgb, var(--land) 88%, #000 10%) 0 60%, transparent 61%),
  radial-gradient(75% 38% at 12% 74%, color-mix(in srgb, var(--land) 80%, #fff 20%) 0 58%, transparent 59%),
  radial-gradient(80% 40% at 90% 76%, var(--land) 0 58%, transparent 59%),
  linear-gradient(180deg, color-mix(in srgb, var(--sky) 70%, #5aa9ff 30%) 0%, var(--sky) 40%, #fff3d6 66%); }
.run-loading { min-height: calc(100dvh - 40px); display: grid; grid-template-rows: auto minmax(0, 1fr); justify-items: center; align-content: stretch; gap: 8px; padding-top: 12vh; }
.run-loading-text { margin: 0; font-size: clamp(20px, 3vw, 26px); font-weight: 800; color: #14404a; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
.run-loading-scene { position: relative; width: min(460px, 92vw); height: min(56dvh, 460px); align-self: end; }
.run-loading-fort { position: absolute; z-index: 1; top: 0; left: 50%; height: 44%; width: auto; max-width: 70%; object-fit: contain; transform: translateX(-50%); filter: drop-shadow(0 10px 14px rgba(0,0,0,.18)); animation: rl-float 3.2s ease-in-out infinite; }
/* The road fills the scene; its far end (y 112 of 300) tucks under the fortress gate. */
.run-loading-road { position: absolute; inset: 0; width: 100%; height: 100%; }
.rl-road { fill: #e2c48c; stroke: #c9a15a; stroke-width: 3; }
.rl-line { fill: none; stroke: #fff; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 10 14; animation: rl-march 1s linear infinite; }
.rl-spark { position: absolute; font-style: normal; color: #f5b400; font-size: 22px; text-shadow: 0 0 8px rgba(255,200,40,.8); animation: rl-twinkle 1.6s ease-in-out infinite; }
.rl-spark.is-1 { left: 30%; bottom: 14%; }
.rl-spark.is-2 { left: 64%; bottom: 26%; animation-delay: .4s; }
.rl-spark.is-3 { left: 40%; bottom: 44%; animation-delay: .8s; font-size: 18px; }
.rl-spark.is-4 { left: 57%; bottom: 55%; animation-delay: 1.2s; font-size: 15px; }
@keyframes rl-march { to { stroke-dashoffset: 24; } }
@keyframes rl-twinkle { 0%, 100% { opacity: .2; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes rl-float { 50% { transform: translateX(-50%) translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .rl-line, .rl-spark, .run-loading-fort { animation: none; } .rl-spark { opacity: .9; } }
.run-fresh { display: grid; gap: 6px; width: 100%; max-width: 560px; padding: 10px 14px 8px; border-radius: 16px; background: #f0faf9; box-shadow: 0 0 0 2px #bfe3e0 inset; }
.run-fresh-head { font-size: 13px; font-weight: 700; color: #47586a; text-align: center; }
.run-fresh-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.run-fresh-table tr + tr { border-top: 1px solid #d6ecea; }
.run-fresh-table th { width: 38%; padding: 4px 0; text-align: start; font-weight: 800; font-size: 17px; white-space: nowrap; overflow: hidden; }
.run-fresh-word { display: inline-flex; align-items: center; gap: 6px; max-width: 100%; }
.run-fresh-word bdi { overflow: hidden; text-overflow: ellipsis; }
.run-fresh-table td { padding: 4px 0; padding-inline-start: 10px; text-align: start; font-size: 15px; color: #33424f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.run-fresh-table .jrn-say { width: 30px; height: 30px; flex: none; }
.run-fresh-table .jrn-say svg { width: 17px; height: 17px; }
/* The opening screen: the 3D fortress behind, the card on the reading side. */
.run-intro { position: fixed; inset: 0; width: 100%; height: 100dvh; display: block; opacity: 0; transition: opacity .6s ease; z-index: 0; pointer-events: none; }
.run-intro.is-on { opacity: 1; }
.run-room.has-intro .jrn-wrap { position: relative; z-index: 1; max-width: none; min-height: 100dvh; padding: 14px 4vw; display: flex; align-items: center; justify-content: flex-start; }
.run-room.has-intro .run-intro-card { width: min(470px, 100%); background: rgba(255,253,245,.93); border: 1px solid rgba(255,255,255,.7); border-radius: 26px; box-shadow: 0 24px 60px rgba(20,24,40,.35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.run-intro-card { gap: 10px; padding: 14px 18px 16px; }
.run-intro-top { width: 100%; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.run-intro-card .jrn-title { font-size: clamp(24px, 4vw, 32px); }
.run-intro-lead { display: grid; gap: 2px; font-size: 16px; line-height: 1.45; color: #33424f; }
.run-intro-lead b { font-size: 17px; color: #14202b; }
.run-go { width: 100%; max-width: 360px; min-height: 54px; font-size: 20px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; }
.run-tiles { width: 100%; max-width: 360px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.run-tile { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 16px; background: #fff; color: #14202b; text-decoration: none; box-shadow: 0 0 0 2px #e2d6b8 inset; min-width: 0; }
.run-tile:hover { box-shadow: 0 0 0 2px #0a7472 inset; }
.run-tile-icon { font-size: 26px; line-height: 1; }
.run-tile-text { display: grid; text-align: start; min-width: 0; }
.run-tile-text b { font-size: 15px; }
.run-tile-text small { font-size: 12.5px; color: #47586a; font-variant-numeric: tabular-nums; }
@media (max-width: 759px) {
  .run-room { --intro-h: clamp(130px, calc(100dvh - var(--card-h, 520px) - 12px), 40dvh); }
  .run-room.has-intro .jrn-wrap { padding: calc(var(--intro-h) - 18px) 12px 10px; align-items: flex-start; justify-content: center; }
  .run-room.has-intro .run-intro-card { width: 100%; }
  .run-intro { height: var(--intro-h); }
}
.run-fresh-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; font-size: 16px; line-height: 1.5; }
.run-fresh-row b { font-size: 20px; }
.run-second { font-weight: 700; color: #7a5a00; background: #fff8e1; padding: 4px 14px; border-radius: 999px; }
/* The hall takes the height the question card leaves free, between 120px and 46% of the screen. */
.run-room { --hall-h: clamp(120px, calc(100dvh - var(--card-h, 460px) - 18px), 46dvh); }
.run-hall { position: fixed; inset: 0 0 auto 0; width: 100%; height: var(--hall-h); display: block; opacity: 0; transition: opacity .5s ease, height .25s ease; z-index: 0; pointer-events: none; }
.run-hall.is-on { opacity: 1; }
.run-room.has-hall .jrn-wrap { position: relative; z-index: 1; padding-top: calc(var(--hall-h) - 18px); padding-bottom: 10px; gap: 10px; }
.run-room.has-hall .jrn-play { gap: 10px; padding: 14px 16px 16px; }
.run-room.has-hall .jrn-prompt.is-word { font-size: clamp(30px, 7vw, 44px); line-height: 1.2; }
.run-room.has-hall .jrn-option { min-height: 48px; padding: 9px 16px; }
.run-room.has-hall .jrn-options { gap: 8px; }
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
/* The question in the fortress (Gadi 2026-11-16): no white sheet over the
   hall, so its colours stay around the question; the definition sits in one
   bubble and the four words are coloured tiles, two by two. */
.run-room .jrn-play.run-q { background: none; border: 0; box-shadow: none; padding: 4px 0 12px; gap: 10px; width: min(560px, 100%); margin-inline: auto; }
.run-q .run-askbox { width: 100%; display: grid; gap: 4px; justify-items: center; background: #fffdf5; border: 0; border-radius: 20px; padding: 10px 16px 12px; box-shadow: 0 10px 28px rgba(0,0,0,.28); }
.run-q .jrn-ask { color: #6b5a3a; font-size: 15px; font-weight: 700; }
.run-hall-title { position: fixed; z-index: 1; top: calc(var(--hall-h) - 66px); inset-inline: 16px; text-align: center; pointer-events: none; color: #fff; font-weight: 800; font-size: clamp(16px, 2.2vw, 20px); text-shadow: 0 2px 8px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.5); }
.run-q .jrn-prompt-row { width: 100%; flex-wrap: nowrap; }
.run-q .jrn-prompt { font-size: 18px; line-height: 1.5; color: #14202b; min-width: 0; }
.run-q .jrn-prompt.is-word { font-size: clamp(28px, 7vw, 40px); }
.run-room .run-q .jrn-options { grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; }
.run-room .run-q .jrn-option { --tile: #f97316; --tile-d: #c2410c; min-height: 64px; padding: 8px 10px; border-radius: 18px; background: var(--tile); color: #fff; font-size: clamp(19px, 5.4vw, 26px); font-weight: 800; line-height: 1.25; text-shadow: 0 1px 2px rgba(0,0,0,.25); box-shadow: 0 5px 0 var(--tile-d); overflow-wrap: anywhere; }
.run-room .run-q .jrn-option:nth-child(2) { --tile: #8b5cf6; --tile-d: #6d28d9; }
.run-room .run-q .jrn-option:nth-child(3) { --tile: #0ea5a5; --tile-d: #0b7a7a; }
.run-room .run-q .jrn-option:nth-child(4) { --tile: #ec4899; --tile-d: #be185d; }
.run-room .run-q .jrn-option:not([aria-disabled]):active { transform: translateY(3px); box-shadow: 0 2px 0 var(--tile-d); }
.run-room .run-q .jrn-option[aria-disabled="true"] { opacity: .5; }
.run-room .run-q .jrn-option.is-right { --tile: #22c55e; --tile-d: #15803d; opacity: 1; box-shadow: 0 5px 0 var(--tile-d), 0 0 0 4px #fff inset; }
.run-room .run-q .jrn-option.is-other { --tile: #94a3b8; --tile-d: #64748b; opacity: 1; }
.run-q .jrn-result { width: 100%; background: #fffdf5; border-radius: 20px; padding: 12px 14px; box-shadow: 0 6px 0 rgba(0,0,0,.22); }
.run-cages { display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: center; direction: ltr; }
.run-cages i { width: 22px; height: 28px; border-radius: 6px; background: #eef2f6; box-shadow: 0 0 0 2px #b8c4d0 inset; }
.run-cages i.is-now { box-shadow: 0 0 0 3px #0a7472 inset; }
.run-cages i.is-free { background: #dcfce7; box-shadow: 0 0 0 2px #4ade80 inset; }
.run-cages i.is-held { background: #ede9fe; box-shadow: 0 0 0 2px #a78bfa inset; }
.run-sum { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.run-sum .run-chip { background: #fff3c4; color: #6b4a00; }
a.jrn-btn { display: inline-grid; place-items: center; text-decoration: none; }
`;
