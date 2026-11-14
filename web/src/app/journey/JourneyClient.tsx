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
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { sfx } from "@/lib/game-sfx";

type Frame = "plain" | "silver" | "gold" | "rainbow" | "diamond";
const FRAMES: Frame[] = ["plain", "silver", "gold", "rainbow", "diamond"];
type CardView = { id: string; word: string; language: string; meaning: string; foundDay: string; stars: number; known: boolean; frame: Frame; dueDay: string; due: boolean };
type Data = {
  today: string; dailyMax: number; usedToday: number; starsToKnow: number; cards: CardView[];
  todays: Array<{ id: string; format: string | null }>; coins: number; frameCoins: Record<Frame, number>;
  summary: { index: number; started: number; fresh: number };
};
type Result = { correct: boolean; event: "practice" | "star" | "known" | "kept" | "again"; frameUp: Frame | null; card: CardView; coinsUp: number };
type Question = { card: CardView; format: "meaning" | "word"; options: CardView[] };

type Copy = {
  title: string; count: (n: number, of: number) => string; coins: string; signIn: string; loading: string; failed: string; retry: string;
  todayTitle: string; todayCount: (n: number) => string; start: string; doneToday: string; fewWords: string; noWords: string;
  whichMeaning: string; whichWord: string; next: string; finish: string; of: (n: number, of: number) => string;
  star: (n: number, of: number) => string; known: string; kept: string; again: string; practice: string; frameUp: (f: string) => string; coinsUp: (n: number) => string;
  frames: Record<Frame, string>; sections: { index: string; started: string; fresh: string };
  opensTomorrow: string; ready: string; found: (d: string) => string; back: string; worth: (n: number) => string; top: string; demo: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "האינדקס שלי", count: (n, of) => `${n} מתוך ${of} מילים באינדקס`, coins: "מטבעות", signIn: "כדי לראות את האינדקס צריך להתחבר",
    loading: "פותחים את האינדקס", failed: "האינדקס לא נטען", retry: "לנסות שוב",
    todayTitle: "הקלפים של היום", todayCount: (n) => (n === 1 ? "קלף אחד מחכה" : `${n} קלפים מחכים`), start: "מתחילים",
    doneToday: "סיימתם להיום. הקלפים הבאים מחכים למחר", fewWords: "כשיהיו לכם שלוש מילים, הקלפים ייפתחו", noWords: "כל מילה שתחפשו ב-Gadit תהפוך כאן לקלף",
    whichMeaning: "מה הפירוש של המילה?", whichWord: "איזו מילה מתאימה לפירוש?", next: "לקלף הבא", finish: "חזרה לאינדקס", of: (n, of) => `${n} מתוך ${of}`,
    star: (n, of) => `כוכב ${n} מתוך ${of}`, known: "המילה נכנסה לאינדקס", kept: "זכרתם", again: "הקלף חוזר מחר. לא איבדתם כלום", practice: "תרגול",
    frameUp: (f) => `מסגרת חדשה: ${f}`, coinsUp: (n) => `+${n} מטבעות`,
    frames: { plain: "רגילה", silver: "כסף", gold: "זהב", rainbow: "קשת", diamond: "יהלום" },
    sections: { index: "באינדקס", started: "בדרך לאינדקס", fresh: "קלפים סגורים" },
    opensTomorrow: "נפתח מחר", ready: "מוכן לפתיחה", found: (d) => `נמצאה ב-${d}`, back: "חזרה", worth: (n) => `שווה ${n} מטבעות`, top: "המסגרת הכי גבוהה: יהלום", demo: "אינדקס לדוגמה, כך הוא נראה אחרי כמה חודשים",
  },
  en: {
    title: "My index", count: (n, of) => `${n} of ${of} words in the index`, coins: "coins", signIn: "Sign in to see your index",
    loading: "Opening the index", failed: "The index did not load", retry: "Try again",
    todayTitle: "Today's cards", todayCount: (n) => (n === 1 ? "One card is waiting" : `${n} cards are waiting`), start: "Start",
    doneToday: "Done for today. The next cards wait for tomorrow", fewWords: "The cards open once you have three words", noWords: "Every word you look up in Gadit becomes a card here",
    whichMeaning: "What does the word mean?", whichWord: "Which word fits the meaning?", next: "Next card", finish: "Back to the index", of: (n, of) => `${n} of ${of}`,
    star: (n, of) => `Star ${n} of ${of}`, known: "The word is in your index", kept: "You remembered", again: "The card comes back tomorrow. Nothing was lost", practice: "Practice",
    frameUp: (f) => `New frame: ${f}`, coinsUp: (n) => `+${n} coins`,
    frames: { plain: "Plain", silver: "Silver", gold: "Gold", rainbow: "Rainbow", diamond: "Diamond" },
    sections: { index: "In the index", started: "On the way to the index", fresh: "Closed cards" },
    opensTomorrow: "Opens tomorrow", ready: "Ready to open", found: (d) => `Found on ${d}`, back: "Back", worth: (n) => `Worth ${n} coins`, top: "The highest frame: Diamond", demo: "A sample index, as it looks after a few months",
  },
};

const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const zone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { return "UTC"; } };
const niceDay = (d: string, lang: string) => { try { return new Date(d + "T12:00:00Z").toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" }); } catch { return d; } };

/** The script a text is mostly written in (its first letter decides). */
function scriptOf(text: string): string {
  const ch = text.match(/\p{L}/u)?.[0] ?? "";
  for (const sc of ["Hebrew", "Arabic", "Cyrillic", "Latin", "Greek", "Devanagari", "Thai", "Han", "Hiragana", "Katakana", "Hangul", "Bengali", "Ethiopic"]) {
    if (new RegExp(String.raw`\p{Script=` + sc + "}", "u").test(ch)) return sc;
  }
  return "other";
}

/** The question of one card: the card and two others that differ from it in both the word and the meaning. */
function makeQuestion(card: CardView, format: string | null, all: CardView[]): Question | null {
  const others = shuffle(all.filter((c) => c.id !== card.id && c.word !== card.word && c.meaning !== card.meaning));
  // The three answers are written in one script: a meaning in another
  // language gives the answer away (Gadi 2026-11-14). Among those, words of
  // the card's own language come first.
  const asked = format === "word" ? card.word : card.meaning;
  const alike = others.filter((c) => scriptOf(format === "word" ? c.word : c.meaning) === scriptOf(asked));
  const same = alike.filter((c) => c.language === card.language);
  const picks: CardView[] = [];
  for (const c of [...same, ...alike, ...others]) {
    if (picks.length === 2) break;
    if (!picks.some((p) => p.id === c.id || p.word === c.word || p.meaning === c.meaning)) picks.push(c);
  }
  if (picks.length < 2) return null;
  return { card, format: format === "word" ? "word" : "meaning", options: shuffle([card, ...picks]) };
}

/** A sample index for ?demo=1: what a child's collection looks like after a few months. Nothing is read or saved. */
function demoData(): Data {
  const W: Array<[string, string, number, Frame | null]> = [
    ["שורש", "החלק של הצמח שנמצא באדמה ושותה ממנה מים", 3, "diamond"], ["מסע", "דרך ארוכה שעוברים ממקום למקום", 3, "rainbow"],
    ["אומץ", "הכוח לעשות דבר גם כשמפחדים", 3, "gold"], ["מפה", "ציור של מקום שמראה איפה כל דבר נמצא", 3, "gold"],
    ["נדיב", "מי שנותן לאחרים בשמחה", 3, "silver"], ["סקרן", "מי שרוצה לדעת ולגלות עוד", 3, "silver"], ["גשר", "דרך שבנויה מעל נהר או כביש", 3, "silver"],
    ["זריחה", "הרגע בבוקר שבו השמש עולה", 3, "plain"], ["מצפן", "כלי שמראה איפה הצפון", 3, "plain"], ["להתמיד", "להמשיך לעשות דבר שוב ושוב בלי לוותר", 3, "plain"],
    ["הרפתקה", "משהו מרגש וחדש שקורה לנו", 2, null], ["שביל", "דרך צרה שהולכים בה ברגל", 2, null], ["עקבות", "הסימנים שנשארים על האדמה אחרי שהולכים", 1, null], ["מערה", "חלל גדול בתוך הר או סלע", 1, null],
    ["אוצר", "דברים יקרים ששמורים במקום נסתר", 0, null], ["מגדלור", "מגדל עם אור שמראה לספינות את הדרך", 0, null], ["צוק", "סלע גבוה ותלול", 0, null], ["נווה", "מקום ירוק עם מים באמצע המדבר", 0, null],
  ];
  const today = "2026-11-14";
  const cards: CardView[] = W.map(([word, meaning, stars, frame], i) => ({
    id: "demo" + i, word, language: "Hebrew", meaning, foundDay: "2026-0" + (1 + (i % 9)) + "-1" + (i % 9),
    stars, known: !!frame, frame: frame ?? "plain", dueDay: i % 3 === 0 || !frame ? today : "2027-01-01", due: (i % 3 === 0 || !frame) && i !== 17,
  }));
  const frameCoins: Record<Frame, number> = { plain: 10, silver: 30, gold: 70, rainbow: 150, diamond: 310 };
  const todays = [10, 11, 12, 3, 6, 14, 15, 16].map((i, n) => ({ id: "demo" + i, format: n % 2 ? "word" : "meaning" }));
  return {
    today, dailyMax: 8, usedToday: 0, starsToKnow: 3, cards, todays, frameCoins,
    coins: cards.reduce((n, x) => n + (x.known ? frameCoins[x.frame] : 0), 0),
    summary: { index: cards.filter((x) => x.known).length, started: cards.filter((x) => !x.known && x.stars > 0).length, fresh: cards.filter((x) => !x.known && x.stars === 0).length },
  };
}
/** What an answer would do, for the sample index only (the real rules are the scheduler's, on the server). */
function demoResult(q: Question, right: boolean): Result {
  const card = q.card;
  if (!right) return { correct: false, event: "again", frameUp: null, card, coinsUp: 0 };
  if (card.known) { const up = FRAMES[Math.min(FRAMES.length - 1, FRAMES.indexOf(card.frame) + 1)]; return { correct: true, event: "kept", frameUp: up !== card.frame ? up : null, card: { ...card, frame: up }, coinsUp: up !== card.frame ? 20 : 0 }; }
  const stars = card.stars + 1;
  return { correct: true, event: stars >= 3 ? "known" : "star", frameUp: null, card: { ...card, stars, known: stars >= 3 }, coinsUp: stars >= 3 ? 10 : 0 };
}

export function JourneyClient({ demo = false }: { demo?: boolean }) {
  const { user: realUser, loading: authLoading } = useAuth();
  const user = demo ? null : realUser;
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const [data, setData] = useState<Data | null>(() => (demo ? demoData() : null));
  const [state, setState] = useState<"loading" | "ready" | "failed">(demo ? "ready" : "loading");
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/journey?tz=${encodeURIComponent(zone())}`, { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
      if (!res.ok) throw new Error(String(res.status));
      setData((await res.json()) as Data);
      setState("ready");
    } catch { setState("failed"); }
  }, [user]);
  // The first load: the state is set only after the answer arrives.
  useEffect(() => { const id = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(id); }, [load]);

  const byId = useMemo(() => new Map((data?.cards ?? []).map((x) => [x.id, x])), [data]);
  const questions = useMemo(() => {
    if (!data) return [];
    return data.todays.map((t) => { const card = byId.get(t.id); return card ? makeQuestion(card, t.format, data.cards) : null; }).filter((q): q is Question => !!q);
  }, [data, byId]);

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

  return (
    <div className="wordbook jrn" dir={dir}>
      <style>{JRN_CSS}</style>
      <div className="jrn-wrap">
        {!demo && !authLoading && !user && <p className="jrn-note">{c.signIn}</p>}
        {user && state === "loading" && !data && <p className="jrn-note">{c.loading}…</p>}
        {user && state === "failed" && (
          <p className="jrn-note">{c.failed} <button type="button" className="jrn-btn is-ghost" onClick={() => { setState("loading"); void load(); }}>{c.retry}</button></p>
        )}

        {(user || demo) && data && q && (
          <section className="jrn-play" aria-live="polite">
            <div className="jrn-step">{c.of(at + 1, queue!.length)}</div>
            <div className="jrn-ask">{q.format === "meaning" ? c.whichMeaning : c.whichWord}</div>
            <div className={`jrn-prompt${q.format === "meaning" ? " is-word" : ""}`} dir="auto">{q.format === "meaning" ? q.card.word : q.card.meaning}</div>
            <div className="jrn-options">
              {q.options.map((o) => {
                const isRight = !!picked && o.id === q.card.id;
                const isWrong = picked === o.id && o.id !== q.card.id;
                return (
                  <button key={o.id} type="button" className={`jrn-option${q.format === "word" ? " is-word" : ""}${isRight ? " is-right" : ""}${isWrong ? " is-other" : ""}`} onClick={() => void choose(o)} aria-disabled={!!picked || undefined} dir="auto">
                    {q.format === "meaning" ? o.meaning : o.word}
                  </button>
                );
              })}
            </div>
            {result && (
              <div className="jrn-result">
                <div className={`jrn-result-line${result.correct ? " is-good" : ""}`}>{resultLine(result)}</div>
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
            <header className="jrn-head">
              <h1 className="jrn-title">{c.title}</h1>
              {demo && <div className="jrn-demo">{c.demo}</div>}
              <div className="jrn-count">{c.count(data.summary.index, total)}</div>
              <div className="jrn-coins" title={c.coins}><span aria-hidden="true">●</span> {data.coins} {c.coins}</div>
            </header>

            <section className="jrn-today">
              <h2 className="jrn-h2">{c.todayTitle}</h2>
              {total === 0 ? <p className="jrn-note">{c.noWords}</p>
                : questions.length > 0 ? (<><p className="jrn-note">{c.todayCount(questions.length)}</p><button type="button" className="jrn-btn" onClick={start}>{c.start}</button></>)
                : total < 3 ? <p className="jrn-note">{c.fewWords}</p>
                : <p className="jrn-note">{c.doneToday}</p>}
            </section>

            {(["index", "started", "fresh"] as const).map((g) => groups[g].length > 0 && (
              <section key={g} className="jrn-group">
                <h2 className="jrn-h2">{c.sections[g]} <span className="jrn-n">{groups[g].length}</span></h2>
                <div className="jrn-grid">
                  {groups[g].map((card) => g === "fresh" ? (
                    <div key={card.id} className="jrn-card is-closed">
                      <span className="jrn-q" aria-hidden="true">?</span>
                      <span className="jrn-small">{card.due ? c.ready : c.opensTomorrow}</span>
                    </div>
                  ) : (
                    <button key={card.id} type="button" className={`jrn-card is-${card.known ? card.frame : "started"}${open === card.id ? " is-open" : ""}`} onClick={() => setOpen(open === card.id ? null : card.id)} aria-expanded={open === card.id}>
                      <span className="jrn-word" dir="auto">{card.word}</span>
                      {card.known ? <Tiers frame={card.frame} label={c.frames[card.frame]} /> : <Stars n={card.stars} of={data.starsToKnow} />}
                      {open === card.id && (
                        <span className="jrn-more">
                          <span className="jrn-meaning" dir="auto">{card.meaning}</span>
                          <span className="jrn-small">{c.found(niceDay(card.foundDay, lang))}</span>
                          {card.known && <span className="jrn-small">{c.worth(data.frameCoins[card.frame])}</span>}
                          {card.known && card.frame !== "diamond" && <span className="jrn-small">{c.top}</span>}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
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

const JRN_CSS = `
.jrn { --j-ink: var(--wb-ink, #14202b); --j-soft: var(--wb-ink-soft, #47586a); --j-surface: var(--surface, #fff); --j-line: var(--wb-border, #dfe5ea); --j-teal: #0a7472; }
.jrn-wrap { max-width: 920px; margin-inline: auto; padding: 20px 16px 56px; display: grid; gap: 22px; color: var(--j-ink); }
.jrn-head { display: grid; gap: 8px; justify-items: center; text-align: center; }
.jrn-title { font-size: clamp(26px, 6vw, 36px); font-weight: 800; margin: 0; text-wrap: balance; }
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
