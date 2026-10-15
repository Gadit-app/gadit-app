"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { KidsCelebration } from "@/components/design/KidsCelebration";
import { TTSButton } from "@/components/design/TTSButton";
import { ClassProgressChip, type ClassProgress } from "@/components/design/ClassMilestone";
import type { WordSet, SetItem, SetDiagram } from "@/lib/word-sets";
import { NiqqudProvider, NiqqudToggle, useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";
import { isPilotTopicId } from "@/lib/pilot-topics";

/**
 * The teacher's projector screen for a word-set word (Gadi 2026-10-03:
 * "the highest, most premium level"). Full screen, readable from the back
 * row: the word, its curriculum definition and its picture are always on
 * screen, and three big buttons open whole-class activities:
 *   - Examples: sentences revealed one at a time, the word highlighted;
 *   - Class quiz: 3 questions, 4 big answer tiles the teacher taps for
 *     the class;
 *   - Class game: "true or false" statements against a 10-second ring.
 * The teacher plays with the whole class until the word is understood;
 * a full score ends in fireworks. Activities come from /api/class-activity
 * (generated once per curriculum word, cached).
 */

type QuizItem = { q: string; options: string[]; answer: number; explain: string };
type GameItem = { s: string; t: boolean; explain: string };
type Activity = { quiz: QuizItem[]; game: GameItem[] };
/** The class activity handed in directly (content review preview). */
export type ClassroomActivity = Activity;
type Panel = null | "examples" | "quiz" | "game" | "diagram";
/** A Gemara quote approved by the expert, stored with its meaning (phase B). */
export type ClassroomQuote = { text: string; tractate: string; daf: string; amud: string };

const COPY = {
  he: {
    wordOf: (i: number, n: number) => `מילה ${i} מתוך ${n}`,
    examples: "דוגמאות", quiz: "חידון לכיתה", game: "משחק לכיתה",
    nextExample: "הדוגמה הבאה",
    learnEx: "דוגמה ללימוד", fromGemara: "מן הגמרא",
    diagram: "תרשים", diagramTag: "תרשים ללימוד",
    source: (q: ClassroomQuote) => `מסכת ${q.tractate} דף ${q.daf} עמוד ${q.amud}`,
    question: (i: number, n: number) => `שאלה ${i} מתוך ${n}`,
    statement: (i: number, n: number) => `משפט ${i} מתוך ${n}`,
    nextQ: "השאלה הבאה", nextS: "המשפט הבא", toSummary: "לסיכום",
    tf: "נכון או לא נכון?", yes: "נכון", no: "לא נכון",
    timeUp: "הזמן נגמר. מה אתם אומרים?",
    correct: "נכון!", wrong: "לא בדיוק",
    score: (s: number, t: number) => `עניתם נכון על ${s} מתוך ${t}`,
    great: "כל הכבוד! הבנתם את המילה",
    almost: "כמעט! בואו נעבור על המילה שוב",
    again: "שוב", nextWord: "למילה הבאה", done: "סיום", close: "סגירה",
    preparing: "מכינים את הפעילות...",
    failed: "לא הצלחנו להכין את הפעילות.", retry: "לנסות שוב",
    preparingPic: "מכינים תמונה...",
    search: "חיפוש במילון", searchPh: "מילה לפירוש מול הכיתה",
    exit: "יציאה ממצב הצגה", prev: "המילה הקודמת", next: "המילה הבאה", listen: "השמעה",
    letters: ["א", "ב", "ג", "ד"],
  },
  en: {
    wordOf: (i: number, n: number) => `Word ${i} of ${n}`,
    examples: "Examples", quiz: "Class quiz", game: "Class game",
    nextExample: "Next example",
    learnEx: "Learning example", fromGemara: "From the Gemara",
    diagram: "Diagram", diagramTag: "Learning diagram",
    source: (q: ClassroomQuote) => `Tractate ${q.tractate}, daf ${q.daf}, amud ${q.amud}`,
    question: (i: number, n: number) => `Question ${i} of ${n}`,
    statement: (i: number, n: number) => `Statement ${i} of ${n}`,
    nextQ: "Next question", nextS: "Next statement", toSummary: "See results",
    tf: "True or false?", yes: "True", no: "False",
    timeUp: "Time's up. What do you say?",
    correct: "Correct!", wrong: "Not quite",
    score: (s: number, t: number) => `You got ${s} of ${t} right`,
    great: "Well done! You understood the word",
    almost: "Almost! Let's go over the word again",
    again: "Again", nextWord: "Next word", done: "Done", close: "Close",
    preparing: "Preparing the activity...",
    failed: "We couldn't prepare the activity.", retry: "Try again",
    preparingPic: "Preparing a picture...",
    search: "Dictionary", searchPh: "A word to explain to the class",
    exit: "Exit present mode", prev: "Previous word", next: "Next word", listen: "Listen",
    letters: ["A", "B", "C", "D"],
  },
  ar: {
    wordOf: (i: number, n: number) => `كلمة ${i} من ${n}`,
    examples: "أمثلة", quiz: "اختبار للصف", game: "لعبة للصف",
    nextExample: "المثال التالي",
    learnEx: "مثال تعليمي", fromGemara: "من الغمارا",
    diagram: "مخطط", diagramTag: "مخطط تعليمي",
    source: (q: ClassroomQuote) => `مسيخت ${q.tractate}، ورقة ${q.daf}، صفحة ${q.amud}`,
    question: (i: number, n: number) => `سؤال ${i} من ${n}`,
    statement: (i: number, n: number) => `جملة ${i} من ${n}`,
    nextQ: "السؤال التالي", nextS: "الجملة التالية", toSummary: "إلى النتيجة",
    tf: "صحيح أم خطأ؟", yes: "صحيح", no: "خطأ",
    timeUp: "انتهى الوقت. ما رأيكم؟",
    correct: "صحيح!", wrong: "ليس تمامًا",
    score: (s: number, t: number) => `أجبتم إجابة صحيحة عن ${s} من ${t}`,
    great: "أحسنتم! فهمتم الكلمة",
    almost: "اقتربتم! لنراجع الكلمة مرة أخرى",
    again: "مرة أخرى", nextWord: "الكلمة التالية", done: "إنهاء", close: "إغلاق",
    preparing: "نحضّر النشاط...",
    failed: "لم نتمكن من تحضير النشاط.", retry: "حاول مرة أخرى",
    preparingPic: "نحضّر صورة...",
    search: "بحث في القاموس", searchPh: "كلمة لشرحها أمام الصف",
    exit: "الخروج من وضع العرض", prev: "الكلمة السابقة", next: "الكلمة التالية", listen: "استماع",
    letters: ["أ", "ب", "ج", "د"],
  },
};

// Niqqud and tashkeel marks, so the word is still found in a voweled example.
const MARKS = "\u0591-\u05C7\u064B-\u065F\u0670";
function Highlight({ text, word }: { text: string; word: string }) {
  const w = word.trim().replace(new RegExp(`[${MARKS}]`, "g"), "");
  if (!w) return <>{text}</>;
  const pat = [...w].map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(`[${MARKS}]*`);
  const parts = text.split(new RegExp(`(${pat}[${MARKS}]*)`));
  if (parts.length < 2) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <mark key={i} className="cs-mark">{p}</mark> : <span key={i}>{p}</span>))}
    </>
  );
}

type StageProps = {
  word: string;
  definition: string;
  imageUrl: string | null;
  imageGenerating: boolean;
  examples: string[];
  /** An approved Gemara quote of this meaning, shown apart from our examples. */
  quote?: ClassroomQuote | null;
  set: WordSet;
  idx: number;
  /** A unit that lists meanings (Gemara phase A): position and links by meaning id. */
  items?: SetItem[];
  m?: string;
  lang: string;
  onNavigate: (w: string, m?: string) => void;
  onExit: () => void;
  onSearch: (q: string) => void;
  progress?: ClassProgress | null;
  /** Content review (2026-10-15): the activity comes in with the props; the
   *  stage asks the server for nothing and reports no projection. */
  preview?: Activity;
};

/** Hebrew and Arabic sets get a niqqud / tashkeel switch the teacher
 *  turns on or off for the class (Gadi 2026-10-04). Display only. */
export function ClassroomStage(props: StageProps) {
  const l = props.set.lang || props.lang;
  return (
    <NiqqudProvider available={l === "he" || l === "ar"} lang={l === "ar" ? "ar" : "he"}>
      <StageInner {...props} />
    </NiqqudProvider>
  );
}

function StageInner({
  word, definition, imageUrl, imageGenerating, examples, quote, set, idx, items, m, lang, onNavigate, onExit, onSearch, progress, preview,
}: {
  word: string;
  definition: string;
  imageUrl: string | null;
  imageGenerating: boolean;
  examples: string[];
  quote?: ClassroomQuote | null;
  set: WordSet;
  idx: number;
  items?: SetItem[];
  m?: string;
  lang: string;
  onNavigate: (w: string, m?: string) => void;
  onExit: () => void;
  onSearch: (q: string) => void;
  progress?: ClassProgress | null;
  preview?: Activity;
}) {
  const L = (set.lang || lang) === "he" ? "he" : (set.lang || lang) === "ar" ? "ar" : "en";
  const he = L === "he";
  const c = COPY[L];
  const dir = L === "en" ? "ltr" : "rtl";
  const { nq } = useNiqqud();
  const total = set.words.length;
  const hasPrev = idx > 0, hasNext = idx < total - 1;

  const [panel, setPanel] = useState<Panel>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [actState, setActState] = useState<"loading" | "ready" | "error">("loading");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  // A pilot unit (Gemara phase B) asks with the teacher's token; every other
  // unit asks exactly as before, without one.
  const pilot = isPilotTopicId(set.id);
  const { user: authUser } = useAuth();
  const pilotUser = pilot ? authUser : null;
  const loadActivity = useCallback(async () => {
    if (preview) { setActivity(preview); setActState("ready"); return; }
    setActState("loading");
    try {
      const p = new URLSearchParams({ set: set.id, word, meaning: definition });
      if (m) p.set("m", m);
      const headers: Record<string, string> = {};
      if (pilotUser) headers.Authorization = `Bearer ${await pilotUser.getIdToken()}`;
      const r = await fetch(`/api/class-activity?${p.toString()}`, pilot ? { headers } : undefined);
      // A pilot meaning whose quiz and game are not approved yet: nothing to run.
      if (pilot && r.status === 404) { setActivity({ quiz: [], game: [] }); setActState("ready"); return; }
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as Activity;
      setActivity(d);
      setActState("ready");
    } catch {
      setActState("error");
    }
  }, [set.id, word, definition, m, pilot, pilotUser, preview]);

  // Prepare the activities as soon as the word is on screen, so the
  // buttons open instantly when the teacher taps them.
  useEffect(() => {
    let alive = true;
    void (async () => { if (alive) await loadActivity(); })();
    return () => { alive = false; };
  }, [loadActivity]);

  // While a panel is open, the arrow keys must not page the word set.
  useEffect(() => {
    document.body.dataset.classPanel = panel ? "open" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && panel) setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.dataset.classPanel = ""; };
  }, [panel]);

  // An approved teaching diagram of this meaning (Gemara pilot): one more
  // button, a full-width 16:9 panel. Meanings without one are unchanged.
  const diagram = m ? items?.find((i) => i.m === m)?.dg : undefined;

  // Step by position: by meaning when the unit lists meanings, else by word.
  const goTo = (i: number) => {
    const it = items?.[i];
    setPanel(null);
    if (it) onNavigate(it.w, it.m);
    else if (set.words[i] !== undefined) onNavigate(set.words[i]);
  };

  // What the teacher projects feeds the principal dashboard (Gadi
  // 2026-10-10): each word shown, and each class quiz or game opened. The
  // server counts one per school, day, kind, set and word, and the first
  // quiz or game also ticks the dashboard checklist.
  const { user } = useAuth();
  const report = useCallback((kind: "word" | "quiz" | "game") => {
    if (!user || preview) return;
    void user.getIdToken().then((t) => fetch("/api/schools/projection", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ kind, word, setId: set.id, subject: set.subject, title: set.title, grade: set.grade ?? "", ...(m ? { m } : {}) }),
    })).catch(() => {});
  }, [user, word, set.id, set.subject, set.title, set.grade, m, preview]);
  useEffect(() => { report("word"); }, [word, set.id, user, m]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (panel === "quiz" || panel === "game") report(panel);
  }, [panel]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cs-root" dir={dir} lang={L}>
      <style>{CSS}</style>
      <div className="cs-glow" aria-hidden="true" />

      {/* Top bar: set + position + tools */}
      <header className="cs-top">
        <div className="cs-set">
          <span className="cs-set-title">{set.title}</span>
          {set.grade && <span className="cs-chip">{set.grade}</span>}
        </div>
        <nav className="cs-dots" aria-label={c.wordOf(idx + 1, total)}>
          {set.words.map((w, i) => (
            <button
              key={w + i}
              type="button"
              className={`cs-dot${i === idx ? " is-on" : ""}${i < idx ? " is-past" : ""}`}
              aria-label={w}
              aria-current={i === idx ? "step" : undefined}
              title={w}
              onClick={() => i !== idx && goTo(i)}
            />
          ))}
          <span className="cs-pos">{c.wordOf(idx + 1, total)}</span>
        </nav>
        <div className="cs-tools">
          <NiqqudToggle />
          {searchOpen ? (
            <form
              className="cs-search"
              onSubmit={(e) => { e.preventDefault(); const v = q.trim(); if (v) onSearch(v); }}
            >
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPh} aria-label={c.search} dir="auto" />
              <button type="submit" aria-label={c.search}><SearchIcon /></button>
            </form>
          ) : (
            <button type="button" className="cs-tool" onClick={() => setSearchOpen(true)}><SearchIcon /> {c.search}</button>
          )}
          <button type="button" className="cs-tool cs-icon" onClick={onExit} aria-label={c.exit} title={c.exit}><XIcon /></button>
        </div>
      </header>

      {progress && <div className="cs-progress"><ClassProgressChip progress={progress} lang={L} /></div>}

      {/* The word */}
      <main className={`cs-main${!imageUrl && !imageGenerating ? " no-pic" : ""}`}>
        <section className="cs-text">
          <div className="cs-word-row">
            <h1 className="cs-word">{nq(word)}</h1>
            <TTSButton text={word} audioLang={L} useOpenAI ariaLabel={c.listen} className="cs-tts" />
          </div>
          <p className="cs-def">{nq(definition)}</p>
        </section>
        {(imageUrl || imageGenerating) && (
          <figure className="cs-pic">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={word} />
            ) : (
              <div className="cs-pic-wait" aria-busy="true"><span className="cs-spin" />{c.preparingPic}</div>
            )}
          </figure>
        )}
      </main>

      {/* Actions */}
      <div className="cs-actions">
        <button type="button" className="cs-act cs-act-ex" onClick={() => setPanel("examples")} disabled={!examples.length && !quote}>
          <ListIcon /> {c.examples}
        </button>
        {diagram && (
          <button type="button" className="cs-act cs-act-ex" onClick={() => setPanel("diagram")}>
            <DiagramIcon /> {c.diagram}
          </button>
        )}
        <button type="button" className="cs-act cs-act-quiz" onClick={() => setPanel("quiz")} disabled={actState === "ready" && !!activity && !activity.quiz.length}>
          <QuizIcon /> {c.quiz}
        </button>
        <button type="button" className="cs-act cs-act-game" onClick={() => setPanel("game")} disabled={actState === "ready" && !!activity && !activity.game.length}>
          <GameIcon /> {c.game}
        </button>
      </div>

      {/* Word-set navigation */}
      <button type="button" className="cs-nav cs-nav-prev" onClick={() => hasPrev && goTo(idx - 1)} disabled={!hasPrev} aria-label={c.prev}><Chevron back /></button>
      <button type="button" className="cs-nav cs-nav-next" onClick={() => hasNext && goTo(idx + 1)} disabled={!hasNext} aria-label={c.next}><Chevron /></button>

      {panel && (
        <div className={`cs-overlay${panel === "diagram" ? " is-wide" : ""}`} role="dialog" aria-modal="true">
          <button type="button" className="cs-close" onClick={() => setPanel(null)} aria-label={c.close}><XIcon /></button>
          {panel === "diagram" && diagram && <DiagramPanel dg={diagram} c={c} />}
          {panel === "examples" && <ExamplesPanel examples={examples} quote={quote ?? null} labeled={!!items?.length} word={word} c={c} />}
          {(panel === "quiz" || panel === "game") && actState !== "ready" && (
            <div className="cs-card cs-center">
              {actState === "loading" ? (
                <><span className="cs-spin big" /><div className="cs-muted">{c.preparing}</div></>
              ) : (
                <><div className="cs-muted">{c.failed}</div><button type="button" className="cs-btn" onClick={() => void loadActivity()}>{c.retry}</button></>
              )}
            </div>
          )}
          {panel === "quiz" && actState === "ready" && activity && (
            <QuizPanel key={`q-${word}${m ?? ""}`} items={activity.quiz} c={c} onNextWord={hasNext ? () => goTo(idx + 1) : undefined} onDone={() => setPanel(null)} />
          )}
          {panel === "game" && actState === "ready" && activity && (
            <GamePanel key={`g-${word}${m ?? ""}`} items={activity.game} c={c} onNextWord={hasNext ? () => goTo(idx + 1) : undefined} onDone={() => setPanel(null)} />
          )}
        </div>
      )}
    </div>
  );
}

type C = typeof COPY.he;

/** Our examples, and (a unit that lists meanings, Gemara) a label on each of them
 *  plus the approved Gemara quote as its own card with its source. A unit
 *  without meanings renders exactly as before. */
function ExamplesPanel({ examples, quote, labeled, word, c }: { examples: string[]; quote: ClassroomQuote | null; labeled: boolean; word: string; c: C }) {
  const { nq } = useNiqqud();
  const list = examples.slice(0, 3);
  const steps = list.length + (quote ? 1 : 0);
  const [shown, setShown] = useState(1);
  return (
    <div className="cs-card cs-ex">
      <div className="cs-eyebrow">{c.examples}</div>
      <ol className="cs-ex-list">
        {list.slice(0, shown).map((ex, i) => (
          <li key={i} className="cs-ex-item"><span className="cs-ex-n">{i + 1}</span><span>{labeled && <span className="cs-ex-tag">{c.learnEx}</span>}<Highlight text={nq(ex)} word={word} /></span></li>
        ))}
      </ol>
      {quote && shown > list.length && (
        <figure className="cs-quote">
          <span className="cs-quote-tag">{c.fromGemara}</span>
          <blockquote className="cs-quote-text"><Highlight text={nq(quote.text)} word={word} /></blockquote>
          <figcaption className="cs-quote-src">{c.source(quote)}</figcaption>
        </figure>
      )}
      {shown < steps && (
        <button type="button" className="cs-btn" onClick={() => setShown((n) => n + 1)}>{c.nextExample}</button>
      )}
    </div>
  );
}

/** A teaching diagram on a 16:9 board that fills the projector (Gemara pilot,
 *  ורמינהו). Sizes follow the board's width, so it reads the same from the
 *  back row on any screen. Our own wording, tagged as a learning diagram:
 *  no quote and no source line ever appear on it. In RTL the first source
 *  sits on the right. */
function DiagramPanel({ dg, c }: { dg: SetDiagram; c: C }) {
  const { nq } = useNiqqud();
  return (
    <div className="cs-dg" data-layout={dg.layout}>
      <span className="cs-dg-tag">{c.diagramTag}</span>
      <h2 className="cs-dg-title">{nq(dg.title)}</h2>
      <p className="cs-dg-sub">{nq(dg.sub)}</p>
      <div className="cs-dg-row">
        <div className="cs-dg-card" data-side="a">
          <span className="cs-dg-pill">{nq(dg.a.label)}</span>
          {dg.a.small && <span className="cs-dg-small">{nq(dg.a.small)}</span>}
          <span className="cs-dg-body">{nq(dg.a.text)}</span>
        </div>
        <div className="cs-dg-clash">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg>
          <span>{nq(dg.clash)}</span>
        </div>
        <div className="cs-dg-card" data-side="b">
          <span className="cs-dg-pill">{nq(dg.b.label)}</span>
          {dg.b.small && <span className="cs-dg-small">{nq(dg.b.small)}</span>}
          <span className="cs-dg-body">{nq(dg.b.text)}</span>
        </div>
      </div>
      <DownArrow />
      <div className="cs-dg-q"><b>{nq(dg.question.label)}:</b> {nq(dg.question.text)}</div>
      <DownArrow />
      <div className="cs-dg-next"><b>{nq(dg.next.label)}:</b> {nq(dg.next.text)}</div>
      {dg.note && <div className="cs-dg-note">{nq(dg.note)}</div>}
    </div>
  );
}
function DownArrow() {
  return <svg className="cs-dg-arrow" viewBox="0 0 24 24" {...S} strokeWidth={2.6} aria-hidden="true"><path d="M12 4v16M5 13l7 7 7-7" /></svg>;
}

function Summary({ score, total, c, onAgain, onNextWord, onDone }: {
  score: number; total: number; c: C; onAgain: () => void; onNextWord?: () => void; onDone: () => void;
}) {
  const great = score >= total - (total >= 5 ? 1 : 0);
  return (
    <div className="cs-card cs-center cs-summary">
      {great && <KidsCelebration runId={1} />}
      <div className={`cs-ring${great ? " is-great" : ""}`} style={{ ["--p" as string]: `${total ? Math.round((score / total) * 100) : 0}%` }}><span>{score}/{total}</span></div>
      <div className="cs-sum-title">{great ? c.great : c.almost}</div>
      <div className="cs-muted">{c.score(score, total)}</div>
      <div className="cs-row">
        <button type="button" className="cs-btn ghost" onClick={onAgain}>{c.again}</button>
        {onNextWord ? (
          <button type="button" className="cs-btn" onClick={onNextWord}>{c.nextWord}</button>
        ) : (
          <button type="button" className="cs-btn" onClick={onDone}>{c.done}</button>
        )}
      </div>
    </div>
  );
}

function QuizPanel({ items, c, onNextWord, onDone }: { items: QuizItem[]; c: C; onNextWord?: () => void; onDone: () => void }) {
  const { nq } = useNiqqud();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const it = items[i];
  if (over || !it) {
    return <Summary score={score} total={items.length} c={c} onAgain={() => { setI(0); setPicked(null); setScore(0); setOver(false); }} onNextWord={onNextWord} onDone={onDone} />;
  }
  const pick = (k: number) => { if (picked !== null) return; setPicked(k); if (k === it.answer) setScore((s) => s + 1); };
  const last = i === items.length - 1;
  return (
    <div className="cs-card cs-quiz">
      <div className="cs-eyebrow">{c.quiz} · {c.question(i + 1, items.length)}</div>
      <div className="cs-q">{nq(it.q)}</div>
      <div className="cs-tiles">
        {it.options.map((o, k) => {
          const state = picked === null ? "" : k === it.answer ? " is-right" : k === picked ? " is-wrong" : " is-dim";
          return (
            <button key={k} type="button" className={`cs-tile t${k}${state}`} onClick={() => pick(k)} disabled={picked !== null}>
              <span className="cs-letter">{c.letters[k]}</span><span className="cs-tile-text">{nq(o)}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="cs-reveal">
          <span className={`cs-verdict${picked === it.answer ? " ok" : " no"}`}>{picked === it.answer ? c.correct : c.wrong}</span>
          <span className="cs-explain">{nq(it.explain)}</span>
          <button type="button" className="cs-btn" onClick={() => { if (last) setOver(true); else { setI(i + 1); setPicked(null); } }}>{last ? c.toSummary : c.nextQ}</button>
        </div>
      )}
    </div>
  );
}

const GAME_SECONDS = 10;

function GamePanel({ items, c, onNextWord, onDone }: { items: GameItem[]; c: C; onNextWord?: () => void; onDone: () => void }) {
  const { nq } = useNiqqud();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [left, setLeft] = useState(GAME_SECONDS);
  useEffect(() => {
    if (picked !== null || over) return;
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [i, picked, over]);
  const it = items[i];
  const pct = useMemo(() => (left / GAME_SECONDS) * 100, [left]);
  if (over || !it) {
    return <Summary score={score} total={items.length} c={c} onAgain={() => { setI(0); setPicked(null); setScore(0); setOver(false); setLeft(GAME_SECONDS); }} onNextWord={onNextWord} onDone={onDone} />;
  }
  const pick = (v: boolean) => { if (picked !== null) return; setPicked(v); if (v === it.t) setScore((s) => s + 1); };
  const last = i === items.length - 1;
  return (
    <div className="cs-card cs-game">
      <div className="cs-game-head">
        <div className="cs-eyebrow">{c.tf} · {c.statement(i + 1, items.length)}</div>
        <div className="cs-timer" style={{ ["--p" as string]: `${pct}%` }} aria-label={`${left}`}><span>{left}</span></div>
      </div>
      <div className="cs-q cs-statement">{nq(it.s)}</div>
      {picked === null && left === 0 && <div className="cs-muted cs-timeup">{c.timeUp}</div>}
      <div className="cs-tf">
        <button type="button" className={`cs-tf-btn yes${picked === null ? "" : it.t ? " is-right" : picked ? " is-wrong" : " is-dim"}`} onClick={() => pick(true)} disabled={picked !== null}>
          <CheckIcon /> {c.yes}
        </button>
        <button type="button" className={`cs-tf-btn no${picked === null ? "" : !it.t ? " is-right" : !picked ? " is-wrong" : " is-dim"}`} onClick={() => pick(false)} disabled={picked !== null}>
          <XIcon /> {c.no}
        </button>
      </div>
      {picked !== null && (
        <div className="cs-reveal">
          <span className={`cs-verdict${picked === it.t ? " ok" : " no"}`}>{picked === it.t ? c.correct : c.wrong}</span>
          <span className="cs-explain">{nq(it.explain)}</span>
          <button type="button" className="cs-btn" onClick={() => { if (last) setOver(true); else { setI(i + 1); setPicked(null); setLeft(GAME_SECONDS); } }}>{last ? c.toSummary : c.nextS}</button>
        </div>
      )}
    </div>
  );
}

/* ── icons ─────────────────────────────────────────────── */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function SearchIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>; }
function XIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" {...S}><path d="M18 6 6 18M6 6l12 12" /></svg>; }
function CheckIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S} strokeWidth={2.6}><path d="M20 6 9 17l-5-5" /></svg>; }
function ListIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>; }
function QuizIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.8-2.7 2.4-2.7 4" /><path d="M12 17.6v.01" /></svg>; }
function DiagramIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><rect x="2.5" y="3.5" width="7" height="6" rx="1.5" /><rect x="14.5" y="3.5" width="7" height="6" rx="1.5" /><rect x="6.5" y="15" width="11" height="5.5" rx="1.5" /><path d="M6 9.5v2.5h12V9.5M12 12v3" /></svg>; }
function GameIcon() { return <svg width="26" height="26" viewBox="0 0 24 24" {...S}><rect x="2.5" y="7" width="19" height="11" rx="5.5" /><path d="M7.5 10.5v4M5.5 12.5h4" /><path d="M15.5 12h.01M18 14h.01" /></svg>; }
function Chevron({ back }: { back?: boolean }) {
  // In RTL the "next" arrow points left; the button sits on the left edge.
  return <svg width="34" height="34" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d={back ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} /></svg>;
}

/* ── styles (projector: light, big, calm) ─────────────── */
const CSS = `
.cs-root{--ink:#0B1220;--soft:#475569;--teal:#0EA5A5;--deep:#0B6E6E;--line:#E2EAE8;--paper:#FFFFFF;
  position:fixed;inset:0;z-index:60;overflow:hidden;background:linear-gradient(180deg,#F5FAF9 0%,#FFFFFF 70%);color:var(--ink);
  display:grid;grid-template-rows:auto auto 1fr auto;padding:clamp(14px,2.2vh,26px) clamp(18px,3vw,48px) clamp(16px,3vh,34px);}
.cs-glow{position:absolute;inset:-20% -10% auto auto;width:60vw;height:60vw;border-radius:50%;
  background:radial-gradient(circle,rgba(14,165,165,.13),rgba(14,165,165,0) 62%);pointer-events:none}
.cs-top{grid-row:1;position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
.cs-set{display:flex;align-items:center;gap:10px;min-width:0}
.cs-set-title{font-weight:700;font-size:clamp(15px,1.25vw,20px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cs-chip{font-size:13px;font-weight:600;color:var(--deep);background:#E3F4F2;border-radius:999px;padding:3px 10px;white-space:nowrap}
.cs-dots{display:flex;align-items:center;gap:7px}
.cs-dot{width:11px;height:11px;border-radius:99px;border:0;padding:0;background:#D5E1DE;cursor:pointer;transition:width .25s ease,background .25s ease}
.cs-dot.is-past{background:#8FD3CE}
.cs-dot.is-on{width:30px;background:var(--teal)}
.cs-dot:focus-visible,.cs-tool:focus-visible,.cs-act:focus-visible,.cs-btn:focus-visible,.cs-tile:focus-visible,.cs-tf-btn:focus-visible,.cs-nav:focus-visible,.cs-close:focus-visible{outline:3px solid #0EA5A5;outline-offset:3px}
.cs-pos{margin-inline-start:8px;font-size:14px;font-weight:600;color:var(--soft);white-space:nowrap}
.cs-tools{display:flex;justify-content:flex-end;align-items:center;gap:10px}
.cs-tool{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.85);
  color:var(--deep);font:inherit;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px -6px rgba(15,40,50,.3)}
.cs-tool.cs-icon{width:44px;padding:0;justify-content:center;color:#64748B}
.cs-search{display:flex;align-items:center;height:44px;border:1.5px solid var(--teal);border-radius:999px;background:#fff;overflow:hidden;box-shadow:0 6px 18px -10px rgba(14,165,165,.6)}
.cs-search input{border:0;outline:0;font:inherit;font-size:16px;padding:0 16px;width:min(300px,30vw);background:transparent;color:var(--ink)}
.cs-search button{border:0;background:var(--teal);color:#fff;height:100%;width:48px;display:grid;place-items:center;cursor:pointer}
.cs-progress{grid-row:2;display:flex;justify-content:center;margin-top:10px;position:relative}
.cs-main{grid-row:3;position:relative;display:grid;grid-template-columns:minmax(0,auto) auto;justify-content:center;align-items:center;gap:clamp(28px,4.5vw,80px);
  padding:clamp(10px,2vh,24px) clamp(48px,6vw,110px);min-height:0}
.cs-main.no-pic{grid-template-columns:minmax(0,1fr);text-align:center;justify-items:center}
.cs-text{min-width:0}
.cs-word-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cs-main.no-pic .cs-word-row{justify-content:center}
.cs-word{margin:0;font-size:clamp(52px,min(8.2vw,14vh),140px);line-height:1.02;font-weight:800;letter-spacing:-.01em;color:var(--deep);text-wrap:balance}
.cs-tts{width:56px;height:56px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--teal);display:inline-grid;place-items:center;cursor:pointer;
  box-shadow:0 6px 18px -10px rgba(14,165,165,.55);flex-shrink:0}
.cs-tts svg{width:26px;height:26px}
.cs-def{margin:clamp(14px,2.6vh,28px) 0 0;font-size:clamp(22px,min(2.5vw,4.4vh),42px);line-height:1.45;font-weight:600;color:#1E293B;max-width:30ch;text-wrap:pretty}
.cs-main.no-pic .cs-def{max-width:36ch}
.cs-pic{margin:0;justify-self:center;width:min(42vw,52vh,560px);aspect-ratio:1/1;border-radius:32px;overflow:hidden;background:#fff;
  box-shadow:0 30px 60px -28px rgba(15,50,60,.38),0 0 0 10px #fff,0 0 0 11px var(--line)}
.cs-pic img{width:100%;height:100%;object-fit:cover;display:block}
.cs-pic-wait{height:100%;display:grid;place-items:center;align-content:center;gap:14px;color:#94A3B8;font-size:16px;
  background:linear-gradient(110deg,#F1F5F4 30%,#FAFCFB 50%,#F1F5F4 70%);background-size:200% 100%;animation:cs-sheen 1.6s linear infinite}
@keyframes cs-sheen{to{background-position:-200% 0}}
.cs-actions{grid-row:4;position:relative;display:flex;justify-content:center;gap:clamp(12px,1.6vw,22px);flex-wrap:wrap}
.cs-act{display:inline-flex;align-items:center;gap:12px;height:clamp(58px,8vh,76px);padding:0 clamp(22px,2.4vw,38px);border-radius:999px;border:0;cursor:pointer;
  font:inherit;font-size:clamp(18px,1.7vw,25px);font-weight:700;color:#fff;transition:transform .15s ease,box-shadow .2s ease}
.cs-act:hover{transform:translateY(-2px)}
.cs-act:active{transform:translateY(0) scale(.98)}
.cs-act:disabled{opacity:.45;cursor:default;transform:none}
.cs-act-ex{background:#fff;color:var(--deep);border:2px solid #BFE5E1;box-shadow:0 14px 30px -18px rgba(14,165,165,.6)}
.cs-act-quiz{background:linear-gradient(135deg,#14B8B0,#0B7F84);box-shadow:0 16px 34px -16px rgba(14,140,150,.85)}
.cs-act-game{background:linear-gradient(135deg,#8B5CF6,#6D28D9);box-shadow:0 16px 34px -16px rgba(109,40,217,.8)}
.cs-nav{position:absolute;top:50%;transform:translateY(-50%);width:clamp(52px,4.4vw,68px);height:clamp(52px,4.4vw,68px);border-radius:999px;border:1px solid var(--line);
  background:rgba(255,255,255,.92);color:var(--deep);display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 26px -14px rgba(15,50,60,.45);z-index:2}
.cs-nav:disabled{opacity:.3;cursor:default}
.cs-root[dir="rtl"] .cs-nav-prev{right:clamp(10px,1.4vw,24px)} .cs-root[dir="rtl"] .cs-nav-next{left:clamp(10px,1.4vw,24px)}
.cs-root[dir="ltr"] .cs-nav-prev{left:clamp(10px,1.4vw,24px)} .cs-root[dir="ltr"] .cs-nav-next{right:clamp(10px,1.4vw,24px)}
.cs-root[dir="ltr"] .cs-nav svg{transform:scaleX(-1)}
.cs-overlay{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:clamp(16px,4vh,48px) clamp(16px,5vw,80px);
  background:rgba(240,247,246,.86);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:cs-in .22s ease}
@keyframes cs-in{from{opacity:0}to{opacity:1}}
.cs-close{position:absolute;top:clamp(14px,2.2vh,26px);inset-inline-end:clamp(18px,3vw,48px);width:52px;height:52px;border-radius:999px;border:1px solid var(--line);
  background:#fff;color:#64748B;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 18px -10px rgba(15,40,50,.4)}
.cs-card{width:min(1100px,100%);max-height:100%;overflow:auto;background:var(--paper);border-radius:36px;border:1px solid var(--line);
  box-shadow:0 40px 90px -40px rgba(15,50,60,.45);padding:clamp(26px,4.4vh,52px) clamp(26px,3.6vw,60px);animation:cs-pop .28s cubic-bezier(.2,.9,.3,1.2)}
@keyframes cs-pop{from{transform:translateY(14px) scale(.98);opacity:0}to{transform:none;opacity:1}}
.cs-center{display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px}
.cs-eyebrow{font-size:clamp(14px,1.2vw,18px);font-weight:700;letter-spacing:.02em;color:var(--teal);margin-bottom:clamp(12px,2vh,22px)}
.cs-muted{color:var(--soft);font-size:clamp(16px,1.4vw,22px)}
.cs-ex-list{list-style:none;margin:0 0 26px;padding:0;display:grid;gap:clamp(14px,2.4vh,26px)}
.cs-ex-item{display:flex;gap:18px;align-items:baseline;font-size:clamp(24px,2.6vw,42px);line-height:1.45;font-weight:500;animation:cs-pop .3s ease}
.cs-ex-tag{display:block;width:max-content;font-size:clamp(12px,1vw,15px);font-weight:700;color:#0E7490;background:#E3F4F2;border-radius:999px;padding:2px 12px;margin-bottom:6px}
.cs-quote{margin:0 0 26px;padding:clamp(18px,2.6vh,28px) clamp(20px,2.4vw,34px);border-radius:24px;background:#FFF7E6;border-inline-start:6px solid #F3B544;animation:cs-pop .3s ease}
.cs-quote-tag{display:inline-block;font-size:clamp(12px,1vw,15px);font-weight:800;color:#92400E;background:#FDE7B5;border-radius:999px;padding:2px 12px;margin-bottom:10px}
.cs-quote-text{margin:0;font-family:"Frank Ruhl Libre","David Libre",Georgia,serif;font-size:clamp(26px,2.8vw,44px);line-height:1.5;font-weight:600;color:var(--deep)}
.cs-quote-src{margin-top:10px;font-size:clamp(14px,1.3vw,19px);font-weight:700;color:#92400E}
.cs-ex-n{flex-shrink:0;width:1.5em;height:1.5em;border-radius:999px;background:#E3F4F2;color:var(--deep);font-weight:800;font-size:.7em;display:grid;place-items:center;transform:translateY(-.12em)}
.cs-mark{background:linear-gradient(transparent 58%,#B9EDE7 58%);color:var(--deep);font-weight:800;padding:0 .08em}
.cs-q{font-size:clamp(26px,2.8vw,46px);line-height:1.3;font-weight:700;margin-bottom:clamp(18px,3.4vh,36px);text-wrap:balance}
.cs-tiles{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,1.6vw,20px)}
.cs-tile{display:flex;align-items:center;gap:16px;min-height:clamp(78px,11vh,112px);padding:14px 20px;border-radius:22px;border:2px solid transparent;cursor:pointer;
  font:inherit;font-size:clamp(20px,1.9vw,30px);font-weight:600;text-align:start;color:var(--ink);transition:transform .15s ease,opacity .2s ease,background .2s ease}
.cs-tile:hover:not(:disabled){transform:translateY(-2px)}
.cs-tile.t0{background:#E6F7F5;border-color:#B5E6E0} .cs-tile.t1{background:#F1ECFE;border-color:#D8CBFB}
.cs-tile.t2{background:#FEF3E2;border-color:#F8D9A8} .cs-tile.t3{background:#E7F0FD;border-color:#BCD3F7}
.cs-letter{flex-shrink:0;width:48px;height:48px;border-radius:14px;background:#fff;display:grid;place-items:center;font-weight:800;font-size:22px;color:var(--deep);box-shadow:0 2px 8px -4px rgba(0,0,0,.2)}
.cs-tile.is-right{background:#DCFCE7;border-color:#22C55E;transform:scale(1.02)}
.cs-tile.is-right .cs-letter{background:#16A34A;color:#fff}
.cs-tile.is-wrong{background:#FEE2E2;border-color:#EF4444}
.cs-tile.is-wrong .cs-letter{background:#DC2626;color:#fff}
.cs-tile.is-dim{opacity:.45}
.cs-reveal{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:clamp(18px,3vh,30px);padding-top:clamp(16px,2.6vh,24px);border-top:1px solid var(--line)}
.cs-verdict{font-weight:800;font-size:clamp(22px,2vw,30px)} .cs-verdict.ok{color:#15803D} .cs-verdict.no{color:#B91C1C}
.cs-explain{flex:1 1 320px;font-size:clamp(18px,1.6vw,24px);color:#334155;line-height:1.45}
.cs-btn{height:clamp(54px,7vh,66px);padding:0 clamp(24px,2.4vw,36px);border-radius:999px;border:0;background:var(--teal);color:#fff;font:inherit;
  font-size:clamp(18px,1.6vw,23px);font-weight:700;cursor:pointer;box-shadow:0 12px 26px -14px rgba(14,140,150,.9)}
.cs-btn.ghost{background:#fff;color:var(--deep);border:2px solid #BFE5E1;box-shadow:none}
.cs-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.cs-game-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.cs-game-head .cs-eyebrow{margin:0}
.cs-timer{--p:100%;width:76px;height:76px;border-radius:999px;display:grid;place-items:center;flex-shrink:0;
  background:conic-gradient(var(--teal) var(--p),#E2EAE8 0);transition:background .9s linear}
.cs-timer span{width:62px;height:62px;border-radius:999px;background:#fff;display:grid;place-items:center;font-size:28px;font-weight:800;color:var(--deep)}
.cs-statement{margin-top:clamp(14px,2.4vh,26px)}
.cs-timeup{margin:-8px 0 18px}
.cs-tf{display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,2vw,26px)}
.cs-tf-btn{display:inline-flex;align-items:center;justify-content:center;gap:14px;height:clamp(96px,15vh,150px);border-radius:28px;border:0;cursor:pointer;
  font:inherit;font-size:clamp(28px,3vw,48px);font-weight:800;color:#fff;transition:transform .15s ease,opacity .2s ease,box-shadow .2s ease}
.cs-tf-btn svg{width:clamp(30px,3vw,46px);height:clamp(30px,3vw,46px)}
.cs-tf-btn.yes{background:linear-gradient(135deg,#22C55E,#15803D);box-shadow:0 18px 36px -18px rgba(21,128,61,.9)}
.cs-tf-btn.no{background:linear-gradient(135deg,#F87171,#DC2626);box-shadow:0 18px 36px -18px rgba(220,38,38,.9)}
.cs-tf-btn:hover:not(:disabled){transform:translateY(-3px)}
.cs-tf-btn.is-right{outline:6px solid #FDE047;outline-offset:4px}
.cs-tf-btn.is-wrong{opacity:.6}
.cs-tf-btn.is-dim{opacity:.35}
.cs-summary{gap:14px}
.cs-ring{--p:100%;width:clamp(130px,16vh,180px);height:clamp(130px,16vh,180px);border-radius:999px;display:grid;place-items:center;background:conic-gradient(#F59E0B var(--p),#E2EAE8 0)}
.cs-ring.is-great{background:conic-gradient(#0EA5A5 var(--p),#E2EAE8 0)}
.cs-ring span{width:82%;height:82%;border-radius:999px;background:#fff;display:grid;place-items:center;font-size:clamp(34px,4vw,54px);font-weight:800;color:var(--deep)}
.cs-sum-title{font-size:clamp(28px,3vw,46px);font-weight:800;text-wrap:balance}
.cs-spin{width:26px;height:26px;border-radius:999px;border:3px solid #D5E1DE;border-top-color:var(--teal);animation:cs-rot .9s linear infinite;display:inline-block}
.cs-spin.big{width:54px;height:54px;border-width:5px}
@keyframes cs-rot{to{transform:rotate(360deg)}}
.cs-overlay.is-wide{padding:clamp(10px,2.4vh,28px) clamp(10px,1.6vw,28px)}
.cs-overlay.is-wide .cs-close{z-index:2}
.cs-dg{container-type:inline-size;position:relative;width:min(100%,calc((100vh - 2 * clamp(10px,2.4vh,28px)) * 16 / 9));aspect-ratio:16/9;max-height:100%;
  background:#FBFAF7;border-radius:clamp(18px,1.6vw,32px);border:1px solid var(--line);box-shadow:0 40px 90px -40px rgba(15,50,60,.45);
  padding:2.4cqw 5cqw 2.2cqw;display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:1.05cqw;color:#0F3D3E;overflow:hidden;animation:cs-pop .28s cubic-bezier(.2,.9,.3,1.2)}
.cs-dg-tag{position:absolute;top:1.6cqw;inset-inline-start:2cqw;font-size:1.4cqw;font-weight:700;color:#0E7490;background:#E3F4F2;border-radius:999px;padding:.3cqw 1.1cqw}
.cs-dg-title{margin:0;text-align:center;font-size:5.2cqw;line-height:1.05;font-weight:800;color:var(--teal)}
.cs-dg-sub{margin:0 auto;text-align:center;font-size:2.05cqw;line-height:1.35;font-weight:500;max-width:70cqw;text-wrap:balance}
.cs-dg-row{display:grid;grid-template-columns:1fr 13cqw 1fr;align-items:center;gap:1.6cqw;margin-top:.6cqw}
.cs-dg-card{background:#fff;border-radius:1.6cqw;padding:1.5cqw 2cqw;border:.14cqw solid #E3F4F2;box-shadow:0 1cqw 2.4cqw -1.3cqw rgba(15,61,62,.45);display:flex;flex-direction:column;align-items:flex-start;gap:.5cqw}
.cs-dg-pill{background:var(--teal);color:#fff;font-weight:800;font-size:1.6cqw;padding:.35cqw 1.3cqw;border-radius:999px}
.cs-dg-small{color:#5B6472;font-size:1.5cqw;font-weight:500}
.cs-dg-body{font-size:3cqw;font-weight:700;line-height:1.25}
.cs-dg-clash{display:flex;flex-direction:column;align-items:center;gap:.4cqw;color:#E0705F;font-weight:800;font-size:1.6cqw;text-align:center;line-height:1.2}
.cs-dg-clash svg{width:5.4cqw;height:5.4cqw;filter:drop-shadow(0 .4cqw .7cqw rgba(240,138,126,.45))}
.cs-dg-arrow{width:2.6cqw;height:2.6cqw;color:var(--teal);margin:-.3cqw auto}
.cs-dg-q{background:#CDEFE8;border-radius:1.5cqw;padding:1.15cqw 2cqw;text-align:center;font-size:2.4cqw;font-weight:700;line-height:1.3}
.cs-dg-q b{color:#0B6E6E}
.cs-dg-next{border:.2cqw dashed #F3B544;background:#FFF8EA;border-radius:1.5cqw;padding:1cqw 2cqw;text-align:center;font-size:2.1cqw;font-weight:600;line-height:1.3}
.cs-dg-next b{color:#B45309}
.cs-dg-note{text-align:center;color:#5B6472;font-size:1.5cqw;font-weight:500;margin-top:.3cqw}
@media (max-width:820px){.cs-main{grid-template-columns:1fr;text-align:center;justify-items:center;padding:0 56px}.cs-word-row{justify-content:center}.cs-pic{width:min(70vw,34vh)}
  .cs-top{grid-template-columns:1fr auto}.cs-dots{display:none}.cs-tiles,.cs-tf{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.cs-root *{animation:none!important;transition:none!important}}
`;
