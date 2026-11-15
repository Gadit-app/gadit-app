"use client";

/**
 * The index: a child's word cards (the journey, Gadi 2026-11-14).
 *
 * Every word the child met is a card. It arrives face down, earns a star on
 * each of three different days and then enters the index; from there its
 * frame grows with the longest time the child still remembered it. The page
 * shows the count, the coins the index words are worth, the cards of today
 * (eight at most) and the whole collection with what each card can still
 * become. A wrong answer takes nothing away. All the rules live in
 * lib/journey/scheduler; this page only shows them.
 *
 * Not linked from the navigation yet: a first version to look at.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildable } from "@/lib/journey/build";
import { BuildTiles, Lesson, Say, PARTS_CSS } from "./parts";
import { GaditBrand } from "@/components/BrandMark";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";
import { useKidsMode } from "@/lib/use-kids-mode";

type Frame = "plain" | "silver" | "gold" | "rainbow" | "diamond";
const FRAMES: Frame[] = ["plain", "silver", "gold", "rainbow", "diamond"];
export type CardView = { id: string; word: string; language: string; meaning: string; foundDay: string; stars: number; known: boolean; frame: Frame; dueDay: string; due: boolean };
export type Data = {
  today: string; dailyMax: number; usedToday: number; starsToKnow: number; cards: CardView[];
  todays: Array<{ id: string; format: string | null; odd?: OddQuestion; sense?: SenseQuestion }>; coins: number; frameCoins: Record<Frame, number>;
  summary: { index: number; started: number; fresh: number };
  /** The fortress the profile stands at, kept on the server. */
  stage?: number;
  /** Words freed today by all the children together. */
  world?: { freedToday: number };
  /** The landscape the child chose for a fortress, by fortress number. */
  roads?: Record<string, number>;
  /** The shop: what was bought, what the runner wears, what was spent (lib/journey/shop.ts). */
  shop?: { owned: string[]; look: Record<"shirt" | "hat" | "back" | "pet", string>; spent: number };
};
export type Result = { correct: boolean; event: "practice" | "star" | "known" | "kept" | "again"; frameUp: Frame | null; card: CardView; coinsUp: number };
/** "Odd one out": four words, three of one school unit (the card's word among them) and one that does not belong. */
export type OddQuestion = { options: string[]; odd: string };
/** "Does this sentence make sense?": one checked sentence with the card's word, and whether it makes sense. */
export type SenseQuestion = { text: string; sensible: boolean };
export type Question = { card: CardView; format: "meaning" | "word" | "odd" | "sense" | "build"; options: CardView[]; sentence?: string };

type Copy = {
  title: string; count: (n: number, of: number) => string; coins: string; signIn: string; loading: string; failed: string; retry: string;
  todayTitle: string; todayCount: (n: number) => string; start: string; doneToday: string; fewWords: string; noWords: string;
  whichMeaning: string; whichWord: string; whichOdd: string; whichSense: string; senseYes: string; senseNo: string; whichBuild: string; hear: string; lesson: string; next: string; finish: string; of: (n: number, of: number) => string;
  star: (n: number, of: number) => string; known: string; kept: string; again: string; practice: string; frameUp: (f: string) => string; coinsUp: (n: number) => string;
  frames: Record<Frame, string>; sections: { index: string; started: string; fresh: string };
  opensTomorrow: string; ready: string; found: (d: string) => string; back: string; worth: (n: number) => string; top: string; demo: string;
  run: string; plain: string; plainMain: string; fortSmall: string; waitIn: (n: number) => string; shop: string; map: string; fortN: (n: number) => string; close: string; backGames: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "הקלפים שלי", count: (n, of) => `${n} מתוך ${of} מילים כבר באוסף`, coins: "מטבעות", signIn: "כדי לראות את הקלפים צריך להתחבר",
    loading: "פותחים את הקלפים", failed: "הקלפים לא נטענו", retry: "לנסות שוב",
    todayTitle: "הקלפים של היום", todayCount: (n) => (n === 1 ? "קלף אחד מחכה" : `${n} קלפים מחכים`), start: "מתחילים",
    doneToday: "סיימתם להיום. הקלפים הבאים מחכים למחר", fewWords: "כשיהיו לכם שלוש מילים, הקלפים ייפתחו", noWords: "כל מילה שתחפשו ב-Gadit תהפוך כאן לקלף",
    whichMeaning: "מה הפירוש של המילה?", whichWord: "איזו מילה מתאימה לפירוש?", whichOdd: "איזו מילה יוצאת דופן?", whichSense: "המשפט הזה הגיוני?", senseYes: "הגיוני", senseNo: "לא הגיוני", whichBuild: "הרכיבו את המילה שמתאימה לפירוש", hear: "להאזנה", lesson: "כך זה נכון", next: "לקלף הבא", finish: "חזרה לקלפים שלי", of: (n, of) => `${n} מתוך ${of}`,
    star: (n, of) => `כוכב ${n} מתוך ${of}`, known: "המילה נכנסה לאוסף", kept: "זכרתם", again: "הקלף חוזר מחר. לא איבדתם כלום", practice: "תרגול",
    frameUp: (f) => `מסגרת חדשה: ${f}`, coinsUp: (n) => `+${n} מטבעות`,
    frames: { plain: "רגילה", silver: "כסף", gold: "זהב", rainbow: "קשת", diamond: "יהלום" },
    sections: { index: "באוסף", started: "בדרך לאוסף", fresh: "קלפים סגורים" },
    opensTomorrow: "נפתח מחר", ready: "מוכן לפתיחה", found: (d) => `נמצאה ב-${d}`, back: "חזרה", worth: (n) => `שווה ${n} מטבעות`, top: "המסגרת הכי גבוהה: יהלום", demo: "קלפים לדוגמה, כך הם נראים אחרי כמה חודשים",
    run: "רצים אל המבצר", plain: "אותן שאלות, בלי תלת מימד (למכשיר איטי)", plainMain: "מתחילים את הקלפים", fortSmall: "או רצים אל המבצר בתלת מימד", backGames: "חזרה למשחקים", waitIn: (n) => (n === 1 ? "קלף אחד מחכה לכם במבצר" : `${n} קלפים מחכים לכם במבצר`),
    shop: "החנות", map: "המפה שלי", fortN: (n) => `מבצר ${n}`, close: "סגירה",
  },
  en: {
    title: "My cards", count: (n, of) => `${n} of ${of} words in your collection`, coins: "coins", signIn: "Sign in to see your cards",
    loading: "Opening your cards", failed: "Your cards did not load", retry: "Try again",
    todayTitle: "Today's cards", todayCount: (n) => (n === 1 ? "One card is waiting" : `${n} cards are waiting`), start: "Start",
    doneToday: "Done for today. The next cards wait for tomorrow", fewWords: "The cards open once you have three words", noWords: "Every word you look up in Gadit becomes a card here",
    whichMeaning: "What does the word mean?", whichWord: "Which word fits the meaning?", whichOdd: "Which word does not belong?", whichSense: "Does this sentence make sense?", senseYes: "It makes sense", senseNo: "It does not", whichBuild: "Build the word that fits the meaning", hear: "Listen", lesson: "This is the right one", next: "Next card", finish: "Back to my cards", of: (n, of) => `${n} of ${of}`,
    star: (n, of) => `Star ${n} of ${of}`, known: "The word is in your collection", kept: "You remembered", again: "The card comes back tomorrow. Nothing was lost", practice: "Practice",
    frameUp: (f) => `New frame: ${f}`, coinsUp: (n) => `+${n} coins`,
    frames: { plain: "Plain", silver: "Silver", gold: "Gold", rainbow: "Rainbow", diamond: "Diamond" },
    sections: { index: "In the collection", started: "On the way to the collection", fresh: "Closed cards" },
    opensTomorrow: "Opens tomorrow", ready: "Ready to open", found: (d) => `Found on ${d}`, back: "Back", worth: (n) => `Worth ${n} coins`, top: "The highest frame: Diamond", demo: "Sample cards, as they look after a few months",
    run: "Run to the fortress", plain: "Same questions, without 3D (for a slow device)", plainMain: "Start the cards", fortSmall: "Or run to the fortress in 3D", backGames: "Back to games", waitIn: (n) => (n === 1 ? "One card waits for you in the fortress" : `${n} cards wait for you in the fortress`),
    shop: "The shop", map: "My map", fortN: (n) => `Fortress ${n}`, close: "Close",
  },
};

const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const zone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
const niceDay = (d: string, lang: string) => { try { return new Date(d + "T12:00:00Z").toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" }); } catch { return d; } };

/** The script a text is mostly written in (its first letter decides). */
function scriptOf(text: string): string {
  const ch = text.match(/\p{L}/u)?.[0] ?? "";
  for (const sc of ["Hebrew", "Arabic", "Cyrillic", "Latin", "Greek", "Devanagari", "Thai", "Han", "Hiragana", "Katakana", "Hangul", "Bengali", "Ethiopic"]) {
    if (new RegExp(String.raw`\p{Script=` + sc + "}", "u").test(ch)) return sc;
  }
  return "other";
}

/** A meaning as an answer: its first sentence only, so the three answers are of a like length (Gadi 2026-11-14). */
/** The meaning as a question: the word itself is hidden wherever the meaning says it
 *  ("courage is when you..."), with a Hebrew one-letter prefix kept, so the meaning
 *  never hands over the answer of "which word fits" or "build the word". */
export function maskedMeaning(card: { word: string; meaning: string }): string {
  const w = card.word.trim();
  const text = shortMeaning(card.meaning);
  if (w.length < 2) return text;
  const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const he = /[א-ת]/.test(w);
  const re = he ? new RegExp(`(^|[^\\u05D0-\\u05EA])([הובלכמש]{0,2})${esc}(?![\\u05D0-\\u05EA])`, "g") : new RegExp(`\\b${esc}\\b`, "gi");
  return he ? text.replace(re, "$1$2…") : text.replace(re, "…");
}

export function shortMeaning(meaning: string): string {
  const m = meaning.trim();
  const end = m.search(/[.!?。؟](\s|$)/u);
  const first = end > 20 ? m.slice(0, end + 1) : m;
  return first.length > 160 ? first.slice(0, 157).trimEnd() + "…" : first;
}

/** A meaning the dictionary marks as rude: never offered to a child as a wrong answer (Gadi 2026-11-14). */
const RUDE = /(?<!\p{L})(vulgar|obscene|profan\p{L}*|offensive|swear ?word|curse word|expletive|sexual\p{L}*|genital\p{L}*|excrement|feces|גס|גסה|גסים|גסות|בוטה|קללה|מגונה|וולגרי|וולגרית|מיני|מינית|вульгар\p{L}*|бранн\p{L}*|нецензур\p{L}*|بذيء|بذيئة|شتيمة|فاحش)(?!\p{L})/iu;
const isRude = (c: CardView) => RUDE.test(c.meaning);

/** The question of one card: the card and two others that differ from it in both the word and the meaning. */
export function makeQuestion(card: CardView, format: string | null, all: CardView[], forChild: boolean, odd?: OddQuestion, sense?: SenseQuestion): Question | null {
  // Does the sentence make sense: two fixed answers, "yes" then "no". The
  // right one carries the card's id, as in every other format.
  if (format === "sense" && sense && sense.text) {
    return {
      card, format: "sense", sentence: sense.text,
      options: [
        { ...card, id: sense.sensible ? card.id : `${card.id}#yes`, word: "yes", meaning: "" },
        { ...card, id: sense.sensible ? `${card.id}#no` : card.id, word: "no", meaning: "" },
      ],
    };
  }
  if (format === "sense") format = "meaning";
  // Build the word from letter tiles: no answers to choose from.
  if (format === "build" && buildable(card.word)) return { card, format: "build", options: [] };
  if (format === "build") format = "meaning";
  // Odd one out: the word that does not belong carries the card's id, so
  // "the right answer is the card" holds here as in the other formats.
  if (format === "odd" && odd && odd.options.length === 4 && odd.options.includes(odd.odd)) {
    return { card, format: "odd", options: shuffle(odd.options.map((w, i) => ({ ...card, id: w === odd.odd ? card.id : `${card.id}#${i}`, word: w, meaning: "" }))) };
  }
  if (format === "odd") format = "meaning";
  const others = shuffle(all.filter((c) => c.id !== card.id && c.word !== card.word && c.meaning !== card.meaning && !(forChild && isRude(c))));
  // The three answers are written in one script: a meaning in another
  // language gives the answer away (Gadi 2026-11-14). Among those, words of
  // the card's own language come first.
  const asked = format === "word" ? card.word : card.meaning;
  const alike = others.filter((c) => scriptOf(format === "word" ? c.word : c.meaning) === scriptOf(asked));
  const same = alike.filter((c) => c.language === card.language);
  // Answers of about the same length come first: a one-word translation
  // (a word from the child's school list) among long definitions gives itself away.
  const shown = (c: CardView) => (format === "word" ? c.word : shortMeaning(c.meaning)).length;
  const near = (c: CardView) => { const x = shown(c), y = shown(card); return x <= y * 2.2 + 4 && y <= x * 2.2 + 4; };
  const picks: CardView[] = [];
  for (const c of [...same.filter(near), ...alike.filter(near), ...same, ...alike, ...others]) {
    // Four answers, not three: a blind tap is right one time in four.
    if (picks.length === 3) break;
    if (!picks.some((p) => p.id === c.id || p.word === c.word || p.meaning === c.meaning)) picks.push(c);
  }
  if (picks.length < 2) return null;
  return { card, format: format === "word" ? "word" : "meaning", options: shuffle([card, ...picks]) };
}

/** A sample index for ?demo=1: what a child's collection looks like after a few months. Nothing is read or saved. */
/** The sample words in English: everything on the screen is in the language of the platform (Gadi 2026-11-14). */
const DEMO_EN: Array<[string, string]> = [
  ["root", "The part of a plant that grows in the ground and drinks water from it"], ["journey", "A long way that you travel from one place to another"],
  ["courage", "The strength to do something even when you are afraid"], ["map", "A drawing of a place that shows where everything is"],
  ["generous", "Happy to give to other people"], ["curious", "Wanting to know and to find out more"], ["bridge", "A road that is built over a river or another road"],
  ["sunrise", "The moment in the morning when the sun comes up"], ["compass", "A tool that shows where north is"], ["persist", "To keep doing something again and again without giving up"],
  ["adventure", "Something new and exciting that happens to us"], ["trail", "A narrow path that people walk on"], ["footprints", "The marks that stay on the ground after someone walks there"], ["cave", "A large hole inside a mountain or under the ground"],
  ["treasure", "Precious things that are kept in a hidden place"], ["lighthouse", "A tower with a light that shows ships the way"], ["cliff", "A high and steep rock"], ["oasis", "A green place with water in the middle of the desert"],
];
export function demoData(lang = "he"): Data {
  const HE: Array<[string, string, number, Frame | null]> = [
    ["שורש", "החלק של הצמח שנמצא באדמה ושותה ממנה מים", 3, "diamond"], ["מסע", "דרך ארוכה שעוברים ממקום למקום", 3, "rainbow"],
    ["אומץ", "הכוח לעשות דבר גם כשמפחדים", 3, "gold"], ["מפה", "ציור של מקום שמראה איפה כל דבר נמצא", 3, "gold"],
    ["נדיב", "מי שנותן לאחרים בשמחה", 3, "silver"], ["סקרן", "מי שרוצה לדעת ולגלות עוד", 3, "silver"], ["גשר", "דרך שבנויה מעל נהר או כביש", 3, "silver"],
    ["זריחה", "הרגע בבוקר שבו השמש עולה", 3, "plain"], ["מצפן", "כלי שמראה איפה הצפון", 3, "plain"], ["להתמיד", "להמשיך לעשות דבר שוב ושוב בלי לוותר", 3, "plain"],
    ["הרפתקה", "משהו מרגש וחדש שקורה לנו", 2, null], ["שביל", "דרך צרה שהולכים בה ברגל", 2, null], ["עקבות", "הסימנים שנשארים על האדמה אחרי שהולכים", 1, null], ["מערה", "חלל גדול בתוך הר או סלע", 1, null],
    ["אוצר", "דברים יקרים ששמורים במקום נסתר", 0, null], ["מגדלור", "מגדל עם אור שמראה לספינות את הדרך", 0, null], ["צוק", "סלע גבוה ותלול", 0, null], ["נווה", "מקום ירוק עם מים באמצע המדבר", 0, null],
  ];
  const W = lang === "he" ? HE : HE.map(([, , stars, frame], i) => [DEMO_EN[i % DEMO_EN.length][0], DEMO_EN[i % DEMO_EN.length][1], stars, frame] as [string, string, number, Frame | null]);
  const today = "2026-11-14";
  const cards: CardView[] = W.map(([word, meaning, stars, frame], i) => ({
    id: "demo" + i, word, language: lang === "he" ? "Hebrew" : "English", meaning, foundDay: "2026-0" + (1 + (i % 9)) + "-1" + (i % 9),
    stars, known: !!frame, frame: frame ?? "plain", dueDay: i % 3 === 0 || !frame ? today : "2027-01-01", due: (i % 3 === 0 || !frame) && i !== 17,
  }));
  const frameCoins: Record<Frame, number> = { plain: 10, silver: 30, gold: 70, rainbow: 150, diamond: 310 };
  const todays = [10, 11, 12, 3, 6, 14, 15, 16].map((i, n) => ({ id: "demo" + i, format: n % 2 ? "word" : "meaning" }));
  return {
    today, dailyMax: 8, usedToday: 0, starsToKnow: 3, cards, todays, frameCoins, stage: 3, roads: { "1": 2, "2": 1 },
    coins: cards.reduce((n, x) => n + (x.known ? frameCoins[x.frame] : 0), 0),
    summary: { index: cards.filter((x) => x.known).length, started: cards.filter((x) => !x.known && x.stars > 0).length, fresh: cards.filter((x) => !x.known && x.stars === 0).length },
  };
}
/** What an answer would do, for the sample index only (the real rules are the scheduler's, on the server). */
export function demoResult(q: Question, right: boolean): Result {
  const card = q.card;
  if (!right) return { correct: false, event: "again", frameUp: null, card, coinsUp: 0 };
  if (card.known) { const up = FRAMES[Math.min(FRAMES.length - 1, FRAMES.indexOf(card.frame) + 1)]; return { correct: true, event: "kept", frameUp: up !== card.frame ? up : null, card: { ...card, frame: up }, coinsUp: up !== card.frame ? 20 : 0 }; }
  const stars = card.stars + 1;
  return { correct: true, event: stars >= 3 ? "known" : "star", frameUp: null, card: { ...card, stars, known: stars >= 3 }, coinsUp: stars >= 3 ? 10 : 0 };
}

export function JourneyClient({ demo = false }: { demo?: boolean }) {
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
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}&ui=${encodeURIComponent(lang)}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Data);
      setState("ready");
    } catch { setState("failed"); }
  }, [user, lang]);
  // The first load: the state is set only after the answer arrives.
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const byId = useMemo(() => new Map((data?.cards ?? []).map((x) => [x.id, x])), [data]);
  const questions = useMemo(() => {
    if (!data) return [];
    return data.todays.map((t) => { const card = byId.get(t.id); return card ? makeQuestion(card, t.format, data.cards, forChild, t.odd, t.sense) : null; }).filter((q): q is Question => !!q);
  }, [data, byId, forChild]);

  const start = () => { sfx.tap(); setQueue(questions); setAt(0); setPicked(null); setResult(null); };
  const q = queue?.[at] ?? null;

  async function choose(opt: CardView) {
    if (!q || picked || (!user && !demo)) return;
    setPicked(opt.id);
    const right = opt.id === q.card.id;
    if (right) sfx.correct(); else sfx.wrong();
    if (demo || !user) { const r = demoResult(q, right); setResult(r); if (r.event === "known" || r.frameUp) sfx.win(); return; }
    try {
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ id: q.card.id, choice: opt.id, format: q.format, tz: zone() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as Result;
      setResult(r);
      if (r.event === "known" || r.frameUp) sfx.win();
    } catch {
      // The answer was not kept: the card stays one of today's cards.
      setResult({ correct: right, event: "practice", frameUp: null, card: q.card, coinsUp: 0 });
    }
  }
  const next = () => {
    sfx.tap();
    setPicked(null); setResult(null);
    if (queue && at + 1 < queue.length) setAt(at + 1);
    else if (demo) setQueue(null);
    else { setQueue(null); setState("loading"); void load(); }
  };

  const resultLine = (r: Result): string => {
    if (r.event === "star") return c.star(r.card.stars, data?.starsToKnow ?? 3);
    if (r.event === "known") return c.known;
    if (r.event === "kept") return c.kept;
    if (r.event === "again") return c.again;
    return c.practice;
  };

  const groups = useMemo(() => {
    const cards = data?.cards ?? [];
    const index = cards.filter((x) => x.known).sort((a, b) => FRAMES.indexOf(b.frame) - FRAMES.indexOf(a.frame) || a.word.localeCompare(b.word));
    const started = cards.filter((x) => !x.known && x.stars > 0).sort((a, b) => b.stars - a.stars || a.word.localeCompare(b.word));
    const fresh = cards.filter((x) => !x.known && x.stars === 0).sort((a, b) => (a.dueDay < b.dueDay ? -1 : a.dueDay > b.dueDay ? 1 : 0));
    return { index, started, fresh };
  }, [data]);

  const total = data?.cards.length ?? 0;
  const openCard = open ? byId.get(open) ?? null : null;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const stage = data?.stage ?? 0;
  const road = data?.roads?.[String(stage)] ?? stage % 3;
  // A device with no 3D (no WebGL) or very little memory gets the same
  // questions without 3D as the main button (the council, 2026-11-15).
  const [light, setLight] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setLight(weakDevice()), 0); return () => window.clearTimeout(id); }, []);

  return (
    <div className={`wordbook jrn${q ? "" : " idx"}`} dir={dir}>
      <style>{JRN_CSS + PARTS_CSS + IDX_CSS}</style>
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && !data && <p className="jrn-note">{c.loading}…</p>}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}

        {(user || demo) && data && q && (
          <section className="jrn-play" aria-live="polite">
            <div className="jrn-step">{c.of(at + 1, queue!.length)}</div>
            <div className="jrn-ask">{q.format === "build" ? c.whichBuild : q.format === "sense" ? c.whichSense : q.format === "odd" ? c.whichOdd : q.format === "meaning" ? c.whichMeaning : c.whichWord}</div>
            {q.format !== "odd" && (
              <div className="jrn-prompt-row">
                <div className={`jrn-prompt${q.format === "meaning" ? " is-word" : ""}`} dir="auto">{q.format === "sense" ? q.sentence : q.format === "meaning" ? q.card.word : maskedMeaning(q.card)}</div>
                <Say text={q.format === "sense" ? q.sentence ?? "" : q.format === "meaning" ? q.card.word : maskedMeaning(q.card)} label={c.hear} />
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
                <div className={`jrn-result-line${result.correct ? " is-good" : ""}`}>{resultLine(result)}</div>
                {!result.correct && <Lesson word={q.card.word} meaning={shortMeaning(q.card.meaning)} title={c.lesson} hear={c.hear} />}
                {result.event === "star" || result.event === "known" ? <Stars n={result.card.stars} of={data.starsToKnow} /> : null}
                {result.frameUp && <div className="jrn-result-line is-good">{c.frameUp(c.frames[result.frameUp])}</div>}
                {result.coinsUp > 0 && <div className="jrn-coinup">{c.coinsUp(result.coinsUp)}</div>}
                <button type="button" className="jrn-btn" onClick={next}>{at + 1 < queue!.length ? c.next : c.finish}</button>
              </div>
            )}
          </section>
        )}

        {(user || demo) && data && !q && (
          <>
            {/* The index fits one screen (Gadi 2026-11-15): a top bar, the band of
                today's cards, and the collection, which scrolls inside itself
                only when it is larger than the screen. */}
            <header className="idx-top">
              <div className="idx-backrow">
                <Link className="jrn-back idx-back" href="/play"><span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {c.backGames}</Link>
                <GaditBrand tone="dark" />
              </div>
              <div className="idx-titles">
                <h1 className="jrn-title">{c.title}</h1>
                <div className="idx-count">{c.count(data.summary.index, total)}</div>
                <div className="idx-bar" aria-hidden="true"><i style={{ width: `${total ? Math.round((data.summary.index / total) * 100) : 0}%` }} /></div>
                {demo && <div className="jrn-demo">{c.demo}</div>}
              </div>
              <div className="idx-actions">
                <span className="idx-coins" title={c.coins}><span aria-hidden="true">●</span> {Math.max(0, data.coins - (data.shop?.spent ?? 0))} {c.coins}</span>
                <Link className="idx-tile" href={demo ? "/journey/shop?demo=1" : "/journey/shop"}><span aria-hidden="true">🛍️</span> {c.shop}</Link>
                <Link className="idx-tile" href={demo ? "/journey/map?demo=1" : "/journey/map"}><span aria-hidden="true">🗺️</span> {c.map}</Link>
              </div>
            </header>

            <section className="idx-hero">
              <div className="idx-hero-art" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- small local pictures */}
                <img className="idx-fort" src={`/journey/thumbs/fortress${(road % 3) + 1}.webp`} alt="" draggable={false} />
                {/* eslint-disable-next-line @next/next/no-img-element -- small local pictures */}
                <img className="idx-mon" src={`/journey/thumbs/monster${(stage % 3) + 1}.webp`} alt="" draggable={false} />
              </div>
              <div className="idx-hero-text">
                <h2 className="idx-h2">{c.todayTitle} <span className="idx-fortn">{c.fortN(stage + 1)}</span></h2>
                <p className="idx-hero-line">{total === 0 ? c.noWords : questions.length > 0 ? c.waitIn(questions.length) : total < 3 ? c.fewWords : c.doneToday}</p>
              </div>
              {questions.length > 0 && (
                <div className="idx-hero-go">
                  {light ? (
                    <>
                      <button type="button" className="idx-run" onClick={start}>{c.plainMain} <span aria-hidden="true">{dir === "rtl" ? "◀" : "▶"}</span></button>
                      <Link className="idx-plain" href={demo ? "/journey/run?demo=1" : "/journey/run"}>{c.fortSmall}</Link>
                    </>
                  ) : (
                    <>
                      <Link className="idx-run" href={demo ? "/journey/run?demo=1" : "/journey/run"}>{c.run} <span aria-hidden="true">{dir === "rtl" ? "◀" : "▶"}</span></Link>
                      <button type="button" className="idx-plain" onClick={start}>{c.plain}</button>
                    </>
                  )}
                </div>
              )}
            </section>

            <div className="idx-shelf">
              {groups.index.length > 0 && (
                <section className="idx-group">
                  <h2 className="idx-h2">{c.sections.index} <span className="idx-n">{groups.index.length}</span></h2>
                  <div className="idx-grid">{groups.index.map((card) => <CardFace key={card.id} card={card} c={c} of={data.starsToKnow} onOpen={() => setOpen(card.id)} />)}</div>
                </section>
              )}
              {(groups.started.length > 0 || groups.fresh.length > 0) && (
                <div className={`idx-pair${groups.started.length > 0 && groups.fresh.length > 0 ? " is-two" : ""}`}>
                  {groups.started.length > 0 && (
                    <section className="idx-group">
                      <h2 className="idx-h2">{c.sections.started} <span className="idx-n">{groups.started.length}</span></h2>
                      <div className="idx-grid">{groups.started.map((card) => <CardFace key={card.id} card={card} c={c} of={data.starsToKnow} onOpen={() => setOpen(card.id)} />)}</div>
                    </section>
                  )}
                  {groups.fresh.length > 0 && (
                    <section className="idx-group">
                      <h2 className="idx-h2">{c.sections.fresh} <span className="idx-n">{groups.fresh.length}</span></h2>
                      <div className="idx-grid">
                        {groups.fresh.map((card) => (
                          <div key={card.id} className={`jrn-card is-closed${card.due ? " is-due" : ""}`}>
                            <span className="jrn-q" aria-hidden="true">?</span>
                            <span className="idx-label">{card.due ? c.ready : c.opensTomorrow}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* A card opened: the card itself, larger, above the page. */}
            {openCard && (
              <div className="idx-zoom" role="dialog" aria-modal="true" aria-label={openCard.word} onClick={() => setOpen(null)}>
                <div className={`jrn-card idx-zoom-card is-${openCard.known ? openCard.frame : "started"}`} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="idx-zoom-x" onClick={() => setOpen(null)} aria-label={c.close}>×</button>
                  <div className="idx-zoom-word"><bdi>{openCard.word}</bdi><Say text={openCard.word} label={c.hear} /></div>
                  {openCard.known ? <Tiers frame={openCard.frame} label={c.frames[openCard.frame]} /> : <Stars n={openCard.stars} of={data.starsToKnow} />}
                  <p className="idx-zoom-meaning" dir="auto">{openCard.meaning}</p>
                  <span className="jrn-small">{c.found(niceDay(openCard.foundDay, lang))}</span>
                  {openCard.known && <span className="jrn-small">{c.worth(data.frameCoins[openCard.frame])}</span>}
                  {openCard.known && openCard.frame !== "diamond" && <span className="jrn-small">{c.top}</span>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** No WebGL, or a device that reports under 2 GB of memory: the 3D run would stutter or stay blank. */
function weakDevice(): boolean {
  try {
    const cv = document.createElement("canvas");
    if (!(cv.getContext("webgl2") || cv.getContext("webgl"))) return true;
  } catch { return true; }
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof mem === "number" && mem < 2;
}

/** One card of the collection, as it lies on the shelf. */
function CardFace({ card, c, of, onOpen }: { card: CardView; c: Copy; of: number; onOpen: () => void }) {
  return (
    <button type="button" className={`jrn-card is-${card.known ? card.frame : "started"}`} onClick={onOpen}>
      <span className={`jrn-word${card.word.length >= 12 ? " is-xlong" : card.word.length >= 8 ? " is-long" : ""}`} dir="auto">{card.word}</span>
      {card.known ? <Tiers frame={card.frame} label={c.frames[card.frame]} /> : <Stars n={card.stars} of={of} />}
    </button>
  );
}

function Stars({ n, of }: { n: number; of: number }) {
  return <span className="jrn-stars" aria-label={`${n}/${of}`}>{Array.from({ length: of }, (_, i) => <i key={i} className={i < n ? "is-on" : ""} aria-hidden="true">★</i>)}</span>;
}
/** The five frames a card can reach, the reached ones lit: the ceiling is always in view. */
function Tiers({ frame, label }: { frame: Frame; label: string }) {
  const reached = FRAMES.indexOf(frame);
  return (
    <span className="jrn-tiers">
      <span className="jrn-pips" aria-hidden="true">{FRAMES.map((f, i) => <i key={f} className={`is-${f}${i <= reached ? " is-on" : ""}`} />)}</span>
      <span className="jrn-small">{label}</span>
    </span>
  );
}

/** The index (Gadi 2026-11-15: "fit in one screen at 100%, smaller, more interesting"):
 *  an album of cards on a deep shelf, the band of today's cards at the top. */
const IDX_CSS = `
.idx { min-height: 100dvh; color: #f4f1e6; background:
  radial-gradient(ellipse at 12% -10%, rgba(255,211,77,.16), transparent 45%),
  radial-gradient(ellipse at 95% 110%, rgba(56,189,248,.14), transparent 50%),
  linear-gradient(165deg, #0e2f38 0%, #123f48 50%, #0d2531 100%); }
.idx .jrn-wrap { max-width: 1180px; height: 100dvh; padding-block: 12px; display: grid; grid-template-rows: auto auto minmax(0, auto); align-content: center; gap: 14px; overflow: hidden; color: inherit; }
.idx .jrn-note { color: #d4e2e6; }
.idx-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }
.idx-backrow { flex-basis: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.idx .idx-back { min-height: 34px; padding: 4px 12px; font-size: 14px; background: rgba(255,255,255,.12); color: #e3f4f2; box-shadow: 0 0 0 1px rgba(255,255,255,.2) inset; }
.idx .idx-back:hover { background: rgba(255,255,255,.2); }
.idx-titles { display: grid; gap: 3px; min-width: 0; }
.idx .jrn-title { font-size: clamp(22px, 3.2vw, 30px); text-align: start; }
.idx-count { font-size: 14.5px; font-weight: 700; color: #cfe0e3; }
.idx-bar { width: min(260px, 60vw); height: 7px; border-radius: 999px; background: rgba(255,255,255,.14); overflow: hidden; }
.idx-bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #f5c542, #ffe08a); }
.idx .jrn-demo { justify-self: start; margin-top: 3px; padding: 2px 10px; font-size: 12px; background: rgba(224,242,254,.16); color: #cdeeff; }
.idx-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.idx-coins { display: inline-flex; gap: 6px; align-items: center; min-height: 40px; padding: 4px 14px; border-radius: 999px; background: linear-gradient(180deg, #ffe58a, #f5c542); color: #4a3300; font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; box-shadow: 0 3px 0 #b88a00; }
.idx-coins span { color: #b47d00; }
.idx-tile { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 4px 14px; border-radius: 12px; background: rgba(255,255,255,.1); color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 0 0 1px rgba(255,255,255,.22) inset; }
.idx-tile:hover { background: rgba(255,255,255,.18); }
/* Today's cards: the fortress of the road the child is on, and the way in. */
.idx-hero { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 6px 18px; padding: 10px 18px; border-radius: 20px; overflow: hidden;
  background: radial-gradient(ellipse at 18% 120%, rgba(255,190,90,.45), transparent 60%), linear-gradient(105deg, #1f5a63 0%, #23525e 45%, #3a3f6e 100%);
  box-shadow: 0 0 0 1px rgba(255,211,77,.35) inset, 0 12px 30px rgba(0,0,0,.3); }
.idx-hero-art { position: relative; width: 132px; height: 92px; }
.idx-fort { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 6px 8px rgba(0,0,0,.35)); }
.idx-mon { position: absolute; bottom: -4px; inset-inline-end: -8px; width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 3px 3px rgba(0,0,0,.4)); }
.idx-hero-text { display: grid; gap: 2px; min-width: 0; }
.idx-h2 { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; font-size: 18px; font-weight: 800; color: #fff; }
.idx-fortn { padding: 1px 9px; border-radius: 999px; background: rgba(255,211,77,.2); color: #ffe08a; font-size: 12.5px; font-weight: 800; }
.idx-hero-line { margin: 0; font-size: 15.5px; line-height: 1.45; color: #e3eef0; }
.idx-hero-go { display: grid; gap: 4px; justify-items: center; }
.idx-run { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 50px; padding: 8px 26px; border-radius: 999px; background: linear-gradient(180deg, #ffe58a, #f5c542); color: #3b2a00; font-weight: 800; font-size: 18px; text-decoration: none; box-shadow: 0 4px 0 #b88a00, 0 0 24px rgba(255,211,77,.35); white-space: nowrap; }
.idx-run:hover { filter: brightness(1.05); }
.idx-plain { border: 0; background: none; padding: 2px 6px; color: #cfe0e3; font: inherit; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
button.idx-run { border: 0; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; }
/* The collection: an album of cards. It scrolls inside itself only when larger than the screen. */
.idx-shelf { min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-color: rgba(255,255,255,.28) transparent; scrollbar-width: thin; display: grid; align-content: start; gap: 14px; padding: 4px 4px 8px; }
.idx-group { display: grid; gap: 8px; min-width: 0; align-content: start; }
.idx-n { padding: 0 8px; border-radius: 999px; background: rgba(255,255,255,.14); font-size: 13px; color: #e3eef0; }
.idx-pair { display: grid; gap: 14px 22px; }
.idx-pair.is-two { grid-template-columns: 1fr 1fr; }
.idx-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }
.idx .jrn-card { position: relative; overflow: hidden; min-height: clamp(92px, 12dvh, 118px); gap: 6px; padding: 10px 6px; border-radius: 14px; background: #fffdf7; transition: transform .15s ease, box-shadow .15s ease; }
.idx .jrn-card:is(button):hover { transform: translateY(-3px); }
.idx .jrn-word { font-size: clamp(17px, 2.3dvh, 21px); line-height: 1.25; }
.idx .jrn-word.is-long { font-size: clamp(15px, 2dvh, 18px); }
.idx .jrn-word.is-xlong { font-size: 14px; }
.idx .jrn-pips { gap: 3px; }
.idx .jrn-pips i { width: 10px; height: 10px; }
.idx .jrn-tiers .jrn-small { font-size: 11.5px; }
.idx .jrn-stars i { font-size: 17px; }
.idx .jrn-card.is-started { background: rgba(255,253,247,.94); box-shadow: none; border: 2px dashed #9fb3c2; }
.idx .jrn-card.is-silver { background: linear-gradient(160deg, #ffffff, #e2e8ee); }
.idx .jrn-card.is-gold { background: linear-gradient(160deg, #fffaea, #f7e09a); }
.idx .jrn-card.is-rainbow { background: linear-gradient(160deg, #ffffff, #f2ebff) padding-box, linear-gradient(120deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7) border-box; }
.idx .jrn-card.is-diamond { background: linear-gradient(160deg, #f2fcff, #c6ecfb); box-shadow: 0 0 0 3px #38bdf8 inset, 0 0 0 6px #e0f7ff inset, 0 0 18px rgba(56,189,248,.55); }
/* A light that passes over the high frames. */
.idx .jrn-card:is(.is-gold, .is-rainbow, .is-diamond)::after { content: ""; position: absolute; inset: -40% -60%; background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,.55) 50%, transparent 58%); transform: translateX(-60%); pointer-events: none; }
.idx .jrn-card.is-diamond::after { animation: idx-shine 4.5s ease-in-out infinite; }
@keyframes idx-shine { 0%, 55% { transform: translateX(-60%); } 100% { transform: translateX(60%); } }
/* A closed card is the back of a card: the pattern of the album and a gold question mark. */
.idx .jrn-card.is-closed { background: repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 7px, transparent 7px 14px), linear-gradient(160deg, #0b7a77, #07494a); box-shadow: 0 0 0 2px rgba(255,211,77,.55) inset; color: #fff; }
.idx .jrn-q { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; color: #ffe08a; background: rgba(0,0,0,.2); box-shadow: 0 0 0 2px rgba(255,211,77,.6) inset; }
.idx-label { font-size: 12px; line-height: 1.3; color: #e3f4f2; }
.idx .jrn-card.is-closed.is-due { box-shadow: 0 0 0 2px #ffd34d inset, 0 0 16px rgba(255,211,77,.45); }
/* The open card. */
.idx-zoom { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 16px; background: rgba(6,18,24,.62); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
.idx .jrn-card.idx-zoom-card { width: min(360px, 100%); min-height: 0; gap: 10px; padding: 26px 22px 22px; border-radius: 22px; cursor: default; box-shadow: 0 24px 60px rgba(0,0,0,.45); }
.idx .jrn-card.idx-zoom-card.is-silver { box-shadow: 0 0 0 4px #8fa0b0 inset, 0 0 0 6px #e6ebf0 inset, 0 24px 60px rgba(0,0,0,.45); }
.idx .jrn-card.idx-zoom-card.is-gold { box-shadow: 0 0 0 4px #d4a017 inset, 0 0 0 6px #fbe9a6 inset, 0 24px 60px rgba(0,0,0,.45); }
.idx .jrn-card.idx-zoom-card.is-plain { box-shadow: 0 0 0 3px #b8c4d0 inset, 0 24px 60px rgba(0,0,0,.45); }
.idx-zoom-x { position: absolute; top: 8px; inset-inline-end: 10px; width: 36px; height: 36px; border: 0; border-radius: 50%; background: rgba(0,0,0,.07); color: #14202b; font-size: 22px; line-height: 1; cursor: pointer; z-index: 1; }
.idx-zoom-word { display: inline-flex; align-items: center; gap: 10px; font-family: var(--wb-font-display, inherit); font-size: 30px; font-weight: 800; line-height: 1.3; overflow-wrap: anywhere; }
.idx-zoom-meaning { margin: 0; font-size: 16.5px; line-height: 1.6; color: #22313d; }
.idx .idx-zoom-card .jrn-pips i { width: 14px; height: 14px; }
.idx .idx-zoom-card .jrn-tiers .jrn-small { font-size: 13px; }
@media (prefers-reduced-motion: reduce) { .idx .jrn-card.is-diamond::after { animation: none; } .idx .jrn-card { transition: none; } }
/* A phone: the bar and the band stack, the cards are smaller. */
@media (max-width: 720px) {
  .idx .jrn-wrap { padding: 10px 12px; gap: 10px; }
  .idx-top { gap: 8px; }
  .idx-actions { width: 100%; }
  .idx-tile, .idx-coins { min-height: 36px; font-size: 14px; padding: 3px 11px; }
  .idx-hero { grid-template-columns: auto minmax(0, 1fr); padding: 8px 12px 10px; gap: 4px 12px; }
  .idx-hero-art { width: 92px; height: 64px; }
  .idx-mon { width: 34px; height: 34px; }
  .idx-hero-go { grid-column: 1 / -1; }
  .idx-run { width: 100%; min-height: 46px; font-size: 17px; }
  .idx-h2 { font-size: 16px; }
  .idx-hero-line { font-size: 14px; }
  .idx-pair.is-two { grid-template-columns: 1fr; }
  .idx-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; }
  .idx .jrn-card { min-height: 80px; padding: 8px 3px; gap: 5px; }
  .idx .jrn-word { font-size: 15.5px; }
  .idx .jrn-word.is-long { font-size: 13px; }
  .idx .jrn-word.is-xlong { font-size: 11.5px; }
  .idx .jrn-pips i { width: 8px; height: 8px; }
}
`;

export const JRN_CSS = `
.jrn { --j-ink: var(--wb-ink, #14202b); --j-soft: var(--wb-ink-soft, #47586a); --j-surface: var(--surface, #fff); --j-line: var(--wb-border, #dfe5ea); --j-teal: #0a7472; }
.jrn-wrap { max-width: 920px; margin-inline: auto; padding: 20px 16px 56px; display: grid; gap: 22px; color: var(--j-ink); }
.jrn-head { display: grid; gap: 8px; justify-items: center; text-align: center; }
.jrn-title { font-size: clamp(26px, 6vw, 36px); font-weight: 800; margin: 0; text-wrap: balance; }
/* The way back, always at the top of a journey screen. */
.jrn-back { justify-self: start; display: inline-flex; align-items: center; gap: 6px; min-height: 38px; padding: 6px 14px; border-radius: 999px; background: rgba(255,255,255,.85); color: var(--j-teal, #0a7472); font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 0 0 2px rgba(10,116,114,.35) inset; white-space: nowrap; }
.jrn-back:hover { background: #fff; }
.jrn-demo { padding: 4px 14px; border-radius: 999px; background: #e0f2fe; color: #075985; font-size: 14px; font-weight: 700; }
.jrn-count { font-size: 18px; font-weight: 700; color: var(--j-soft); }
.jrn-coins { display: inline-flex; gap: 6px; align-items: center; padding: 6px 16px; border-radius: 999px; background: #fff3c4; color: #6b4a00; font-weight: 800; font-size: 17px; font-variant-numeric: tabular-nums; }
.jrn-coins span { color: #e0a100; }
.jrn-h2 { font-size: 20px; font-weight: 800; margin: 0; display: flex; gap: 8px; align-items: baseline; }
.jrn-n { font-size: 15px; font-weight: 700; color: var(--j-soft); }
.jrn-note { margin: 0; font-size: 17px; line-height: 1.6; color: var(--j-soft); }
.jrn-small { font-size: 13px; line-height: 1.4; color: var(--j-soft); }
.jrn-today { display: grid; gap: 10px; justify-items: start; padding: 18px; border-radius: 20px; background: var(--j-surface); border: 1px solid var(--j-line); }
.jrn-btn { min-height: 50px; padding: 10px 28px; border: 0; border-radius: 999px; background: var(--j-teal); color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452; }
.jrn-btn.is-ghost { min-height: 40px; padding: 6px 18px; font-size: 15px; background: transparent; color: var(--j-teal); box-shadow: 0 0 0 2px var(--j-teal) inset; }
.jrn-group { display: grid; gap: 12px; }
.jrn-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); align-items: start; }
.jrn-card { display: grid; gap: 8px; justify-items: center; align-content: center; min-height: 128px; min-width: 0; padding: 14px 10px; border: 0; border-radius: 18px; background: var(--j-surface); color: var(--j-ink); font: inherit; text-align: center; cursor: pointer; box-shadow: 0 0 0 3px #b8c4d0 inset; }
.jrn-card.is-started { box-shadow: 0 0 0 2px var(--j-line) inset; }
.jrn-card.is-silver { box-shadow: 0 0 0 4px #8fa0b0 inset, 0 0 0 6px #e6ebf0 inset; }
.jrn-card.is-gold { box-shadow: 0 0 0 4px #d4a017 inset, 0 0 0 6px #fbe9a6 inset; }
.jrn-card.is-rainbow { background: linear-gradient(var(--j-surface), var(--j-surface)) padding-box, linear-gradient(120deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7) border-box; border: 4px solid transparent; box-shadow: none; }
.jrn-card.is-diamond { box-shadow: 0 0 0 4px #38bdf8 inset, 0 0 0 7px #e0f7ff inset, 0 6px 18px #38bdf855; }
.jrn-card.is-closed { cursor: default; background: linear-gradient(135deg, #0a747222, #0a747210); box-shadow: 0 0 0 2px #0a747244 inset; }
.jrn-q { font-size: 44px; font-weight: 800; color: #0a7472aa; line-height: 1; }
.jrn-word { font-family: var(--wb-font-display, inherit); font-size: 21px; font-weight: 800; line-height: 1.35; overflow-wrap: anywhere; }
.jrn-more { display: grid; gap: 6px; padding-top: 8px; border-top: 1px solid var(--j-line); width: 100%; }
.jrn-meaning { font-size: 15px; line-height: 1.5; }
.jrn-stars { display: inline-flex; gap: 3px; direction: ltr; }
.jrn-stars i { font-style: normal; font-size: 20px; line-height: 1; color: #cfd8e0; }
.jrn-stars i.is-on { color: #f5a400; }
.jrn-tiers { display: grid; gap: 4px; justify-items: center; }
.jrn-pips { display: inline-flex; gap: 4px; direction: ltr; }
.jrn-pips i { width: 14px; height: 14px; border-radius: 50%; background: transparent; box-shadow: 0 0 0 2px #b8c4d0 inset; }
.jrn-pips i.is-on.is-plain { background: #b8c4d0; }
.jrn-pips i.is-on.is-silver { background: #8fa0b0; box-shadow: none; }
.jrn-pips i.is-on.is-gold { background: #d4a017; box-shadow: none; }
.jrn-pips i.is-on.is-rainbow { background: conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444); box-shadow: none; }
.jrn-pips i.is-on.is-diamond { background: #38bdf8; box-shadow: none; }
.jrn-play { display: grid; gap: 16px; justify-items: center; text-align: center; padding: 22px 16px; border-radius: 22px; background: var(--j-surface); border: 1px solid var(--j-line); }
.jrn-step { font-size: 15px; font-weight: 700; color: var(--j-soft); font-variant-numeric: tabular-nums; }
.jrn-ask { font-size: 19px; font-weight: 700; }
.jrn-prompt { max-width: 620px; font-size: 20px; line-height: 1.6; font-weight: 600; }
.jrn-prompt.is-word { font-family: var(--wb-font-display, inherit); font-size: clamp(34px, 9vw, 52px); font-weight: 800; line-height: 1.3; }
.jrn-options { display: grid; gap: 10px; width: min(620px, 100%); }
.jrn-option { min-height: 56px; padding: 12px 18px; border: 0; border-radius: 16px; background: var(--j-surface); color: var(--j-ink); font: inherit; font-size: 17px; line-height: 1.5; cursor: pointer; box-shadow: 0 0 0 2px var(--j-line) inset, 0 3px 0 var(--j-line); }
.jrn-option.is-word { font-family: var(--wb-font-display, inherit); font-size: 24px; font-weight: 800; }
.jrn-option[aria-disabled="true"] { cursor: default; }
.jrn-option.is-right { background: #dcfce7; color: #14532d; box-shadow: 0 0 0 3px #4ade80 inset; }
.jrn-option.is-other { background: #eef2f6; color: #334155; box-shadow: 0 0 0 3px #b8c4d0 inset; }
.jrn-result { display: grid; gap: 10px; justify-items: center; }
.jrn-result-line { font-size: 20px; font-weight: 800; }
.jrn-result-line.is-good { color: #15803d; }
.jrn-result .jrn-stars i { font-size: 34px; }
.jrn-coinup { padding: 4px 14px; border-radius: 999px; background: #fff3c4; color: #6b4a00; font-weight: 800; }
`;
