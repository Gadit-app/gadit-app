"use client";

import { GaditIcon } from "@/components/design/GaditIcon";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { LearnItem, LearnLang, Reads } from "@/lib/learn/engine";
import { learnCopy } from "./learn-i18n";
import { lessonCopy } from "./lesson-i18n";
import type { Lesson } from "./LessonPath";

/**
 * "What are you learning now?" on /play (Gadi 2026-10-11; the council's
 * verdict the same day): pick English, or Hebrew as a second language,
 * answer whether the child already reads it, and the games use those
 * words. No level is ever shown: the games find it word by word. The
 * school's word list, with its test date, is the main action.
 */
export type LearnState = {
  lang: LearnLang | null;
  reads: Reads | null;
  pool: LearnItem[];
  stats: { learnedTotal: number; learnedWeek: number; reinforce: number; list: { total: number; ready: number; testDate: string | null } | null } | null;
  /** A lesson built from workbook pages, while its list is active. */
  lesson: Lesson | null;
  /** The built-in lessons, and which one comes next. */
  lessons: { list: Array<{ id: string; topic: string; title: string; icon: string; d: number; done: boolean }>; next: string | null } | null;
};

export function LearnCard({ lang, dir, refreshKey, onState, onLesson, simple, tile }: {
  /** Homework's Learning words grid (2026-10-19): list items of the tiles' grid. */
  tile?: boolean;
  lang: string;
  /** Homework's course card (Gadi 2026-10-12, the council): the title, the
   *  next lesson, one button and "all lessons". No stats, no list, no
   *  workbook button (those live in "add homework" and the test section). */
  simple?: boolean;
  dir: "rtl" | "ltr";
  /** Bump to reload the next words (after a game). */
  refreshKey: number;
  onState: (s: LearnState) => void;
  /** Open the workbook lesson (Gadi 2026-10-11). */
  onLesson?: (lesson: Lesson) => void;
}) {
  const { user } = useAuth();
  const t = learnCopy(lang);
  const lc = lessonCopy(lang);
  const pagesRef = useRef<HTMLInputElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [targets, setTargets] = useState<LearnLang[]>([]);
  const [state, setState] = useState<LearnState | null>(null);
  const [step, setStep] = useState<"view" | "pick" | "reads" | "list">("view");
  const [choice, setChoice] = useState<LearnLang | null>(null);
  const [text, setText] = useState("");
  const [testDate, setTestDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // "Not now" folds the question into one small link (Gadi 2026-10-11: a
  // child who just wants to play in their own language). Per device.
  const HIDE_KEY = "gadit-learn-hidden";
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setHidden(localStorage.getItem(HIDE_KEY) === "1"); } catch { /* shown */ } }, []);
  const hide = (v: boolean) => { setHidden(v); try { if (v) localStorage.setItem(HIDE_KEY, "1"); else localStorage.removeItem(HIDE_KEY); } catch { /* this visit only */ } };
  const onStateRef = useRef(onState);
  onStateRef.current = onState;

  const auth = useCallback(async () => ({ Authorization: `Bearer ${await user!.getIdToken()}` }), [user]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const r = await fetch(`/api/learn?ui=${encodeURIComponent(lang)}`, { headers: await auth(), cache: "no-store" });
      const j = await r.json();
      if (!r.ok) return;
      setTargets(j.targets ?? []);
      const s: LearnState = { lang: j.profile?.lang ?? null, reads: j.profile?.reads ?? null, pool: j.pool ?? [], stats: j.stats ?? null, lesson: j.lesson ?? null, lessons: j.lessons ?? null };
      setState(s);
      onStateRef.current(s);
    } catch { /* the card stays as it was */ }
  }, [user, lang, auth]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const post = async (body: object) => {
    const r = await fetch("/api/learn", { method: "POST", headers: { "Content-Type": "application/json", ...(await auth()) }, body: JSON.stringify({ ui: lang, ...body }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(String(j.error ?? r.status));
    return j;
  };

  const setup = async (l: LearnLang | null, reads: Reads) => {
    setBusy(true);
    try { await post({ action: "setup", lang: l, reads }); setStep("view"); await load(); }
    catch { setMsg(t.error); } finally { setBusy(false); }
  };

  const saveList = async () => {
    if (!state?.lang) return;
    setBusy(true); setMsg("");
    try {
      await post({ action: "list", lang: state.lang, text, testDate: testDate || null });
      setText(""); setTestDate(""); setStep("view");
      await load();
    } catch (e) {
      setMsg(e instanceof Error && e.message === "too_few_words" ? t.listTooFew : t.error);
    } finally { setBusy(false); }
  };

  const photo = async (file: File) => {
    setBusy(true); setMsg(t.reading);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch("/api/ocr", { method: "POST", headers: await auth(), body: fd });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.text) { setText((x) => (x ? `${x}\n` : "") + String(j.text)); setMsg(t.checkWords); }
      else setMsg(t.photoFail);
    } catch { setMsg(t.photoFail); } finally { setBusy(false); }
  };

  // Workbook pages to a lesson: read every page, then one call builds the
  // words, the sentences and the grammar point (Gadi 2026-10-11).
  const pages = async (files: FileList) => {
    if (!state?.lang) return;
    setBusy(true); setMsg(lc.reading);
    try {
      let all = "";
      for (const f of Array.from(files).slice(0, 6)) {
        const fd = new FormData();
        fd.append("image", f);
        const r = await fetch("/api/ocr", { method: "POST", headers: await auth(), body: fd });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.text) all += `\n${String(j.text)}`;
      }
      if (all.trim().length < 20) { setMsg(lc.fail); return; }
      setMsg(lc.building);
      await post({ action: "unit", lang: state.lang, text: all, testDate: testDate || null });
      setText(""); setTestDate(""); setStep("view"); setMsg("");
      await load();
    } catch { setMsg(lc.fail); } finally { setBusy(false); }
  };

  // A built-in lesson: fetch its words and content, then play it.
  const openLesson = async (id: string) => {
    if (!state?.lang || !onLesson) return;
    setBusy(true); setMsg(lc.loading);
    try {
      const r = await fetch(`/api/learn?ui=${encodeURIComponent(lang)}&lang=${state.lang}&lesson=${encodeURIComponent(id)}`, { headers: await auth(), cache: "no-store" });
      const j = await r.json();
      if (r.ok && j.lesson) { setMsg(""); onLesson(j.lesson as Lesson); } else setMsg(t.error);
    } catch { setMsg(t.error); } finally { setBusy(false); }
  };

  if (!targets.length || !state) return null;
  const name = (l: LearnLang) => (l === "en" ? t.english : t.hebrew);

  const pickCard = () => (
      <section className="wb-learn-card is-slim" dir={dir}>
        <span className="wb-learn-icon" aria-hidden="true">🎒</span>
        <div className="wb-learn-text">
          <b>{t.question}</b>
          <span>{t.questionSub}</span>
        </div>
        <div className="wb-learn-chips" role="radiogroup" aria-label={t.question}>
          {targets.map((l) => (
            <button key={l} type="button" role="radio" aria-checked={state.lang === l} className={`wb-learn-chip${state.lang === l ? " is-on" : ""}`}
              onClick={() => { setChoice(l); setStep("reads"); }}>
              {name(l)}{l === "he" ? <small>{t.beta}</small> : null}
            </button>
          ))}
          {state.lang ? (
            <button type="button" className="wb-learn-chip is-soft" disabled={busy} onClick={() => void setup(null, state.reads ?? "little")}>{t.stop}</button>
          ) : (
            <button type="button" className="wb-learn-chip is-soft" onClick={() => { if (tile) setStep("view"); else hide(true); }}>{t.notNow}</button>
          )}
        </div>
      </section>
  );
  // Does the child already read the language? (decides pictures and sound first)
  const readsCard = (c: LearnLang) => (
      <section className="wb-learn-card" dir={dir}>
        <div className="wb-learn-head">
          <span className="wb-learn-icon" aria-hidden="true">📖</span>
          <div className="wb-learn-text">
            <b>{t.readsQ(name(c))}</b>
            <span>{t.readsSub}</span>
          </div>
        </div>
        <div className="wb-learn-chips">
          {(["no", "little", "yes"] as Reads[]).map((r) => (
            <button key={r} type="button" className="wb-learn-chip" disabled={busy} onClick={() => void setup(c, r)}>{t.reads[r]}</button>
          ))}
        </div>
      </section>
  );

  // Homework's Learning words tiles (Gadi 2026-10-19): one tile like the
  // games' tiles (the next lesson on it, a tap opens it), and whatever
  // opens from it (choosing the language, all the lessons) on a full row
  // under the tiles. Rendered as list items of the tiles' grid.
  // All lessons, one tile per topic (Gadi 2026-10-19: chips, then numbered
  // circles per part, both read as a mess). Every tile the same size: the
  // topic's icon, its name and a progress bar. A tap opens the topic's next
  // part (its first when all are done); the parts themselves are not shown.
  const lessonTopics = (list: NonNullable<LearnState["lessons"]>["list"], nextId: string | null) => {
    const groups: Array<{ key: string; label: string; icon: string; items: typeof list }> = [];
    for (const l of list) {
      const label = l.title.replace(/\s*\d+$/, "");
      const key = l.topic || label;
      let g = groups.find((x) => x.key === key);
      if (!g) { g = { key, label, icon: l.icon, items: [] }; groups.push(g); }
      g.items.push(l);
    }
    return (
      <div className="wb-learn-topics">
        {groups.map((g) => {
          const done = g.items.filter((l) => l.done).length;
          const all = done === g.items.length;
          const target = g.items.find((l) => !l.done) ?? g.items[0];
          const isNext = g.items.some((l) => l.id === nextId);
          return (
            <button key={g.key} type="button" disabled={busy} onClick={() => void openLesson(target.id)}
              className={`wb-learn-topic${all ? " is-done" : ""}${isNext ? " is-next" : ""}`}>
              {all && <span className="wb-learn-topic-check" aria-hidden="true">✓</span>}
              <span className="wb-learn-topic-ico" aria-hidden="true">{g.icon}</span>
              <span className="wb-learn-topic-name">{g.label}</span>
              <span className="wb-learn-topic-bar" aria-hidden="true"><span style={{ width: `${Math.round((done / g.items.length) * 100)}%` }} /></span>
              <span className="wb-learn-topic-n" dir="ltr">{done}/{g.items.length}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (tile) {
    const L = state.lessons;
    const next = state.lang ? L?.list.find((l) => l.id === L.next) ?? L?.list[0] : undefined;
    const panel = step === "pick" ? pickCard() : step === "reads" && choice ? readsCard(choice) : null;
    return (
      <>
        <li>
          <button type="button" className="wb-play-card has-cover wb-play-cat-notebook" disabled={busy} aria-busy={busy || undefined}
            onClick={() => { if (next && onLesson) void openLesson(next.id); else setStep(step === "pick" ? "view" : "pick"); }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="wb-play-card-cover" src="/play/hw-lessons.webp" alt="" width={720} height={480} />
            <span className="wb-play-card-text">
              <span className="wb-play-card-title">{state.lang ? t.learning(name(state.lang)) : t.question}</span>
              <span className="wb-play-card-desc">{next ? <>{lc.nextLesson}: {next.icon} {next.title}</> : state.lang ? t.simpleSub : t.questionSub}</span>
            </span>
          </button>
        </li>
        {(panel || (state.lang && L && L.list.length > 0) || (busy && msg)) && (
          <li className="wb-hw-tile-row">
            {panel}
            {!panel && state.lang && L && L.list.length > 0 && (
              <button type="button" className="wb-learn-simple-link" onClick={() => setShowAll((v) => !v)}>{showAll ? lc.hideLessons : lc.allLessons}</button>
            )}
            {!panel && showAll && L && (
              <>
                {lessonTopics(L.list, L.next)}
                <button type="button" className="wb-learn-simple-link is-quiet" onClick={() => setStep("pick")}>{t.changeLang}</button>
              </>
            )}
            {busy && msg && <p className="wb-learn-msg">{msg}</p>}
          </li>
        )}
      </>
    );
  }

  // Choosing what to learn: one quiet row, since most players just want to
  // play (Gadi 2026-10-11: the big card pulled the eye from Kids Mode and
  // Word Duel, and read like the notebook's language filter).
  if (!state.lang && step === "view" && hidden) {
    return (
      <button type="button" className="wb-learn-reopen" dir={dir} onClick={() => hide(false)}>
        <span aria-hidden="true">🎒</span> {t.reopen}
      </button>
    );
  }
  if (step === "pick" || (!state.lang && step === "view")) return pickCard();
  if (step === "reads" && choice) return readsCard(choice);

  // This week's school list.
  if (step === "list" && state.lang) {
    return (
      <section className="wb-learn-card" dir={dir}>
        <div className="wb-learn-head">
          <span className="wb-learn-icon" aria-hidden="true">📝</span>
          <div className="wb-learn-text">
            <b>{t.listTitle}</b>
            <span>{t.listSub(name(state.lang))}</span>
          </div>
        </div>
        <textarea id="learn-list" className="wb-learn-text-area" dir="auto" rows={5} value={text} placeholder={t.listPlaceholder} onChange={(e) => setText(e.target.value)} />
        <div className="wb-learn-row">
          <button type="button" className="wb-learn-chip" disabled={busy} onClick={() => fileRef.current?.click()}>📷 {t.photo}</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void photo(f); e.target.value = ""; }} />
          <button type="button" className="wb-learn-chip" disabled={busy} onClick={() => pagesRef.current?.click()}><GaditIcon name="workbook" size={24} /> {lc.photoBtn}</button>
          <input ref={pagesRef} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = e.target.files; if (f?.length) void pages(f); e.target.value = ""; }} />
          <label className="wb-learn-date">
            <span>{t.testDate}</span>
            <input id="learn-test-date" type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </label>
        </div>
        {msg && <p className="wb-learn-msg">{msg}</p>}
        <div className="wb-learn-row">
          <button type="button" className="wb-learn-btn" disabled={busy || text.trim().length < 3} onClick={() => void saveList()}>{t.listSave}</button>
          <button type="button" className="wb-learn-chip is-soft" onClick={() => { setStep("view"); setMsg(""); }}>{t.cancel}</button>
        </div>
      </section>
    );
  }

  // Homework's simple course card.
  if (simple && state.lang) {
    const L = state.lessons;
    const next = L?.list.find((l) => l.id === L.next) ?? L?.list[0];
    const started = !!L?.list.some((l) => l.done);
    return (
      <section className="wb-learn-simple" dir={dir}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wb-learn-simple-cover" src="/play/hw-lessons.webp" alt="" width={720} height={480} />
        <div className="wb-learn-simple-head">
          <div className="wb-learn-text">
            <b>{t.learning(name(state.lang))}{state.lang === "he" ? <small className="wb-learn-beta">{t.beta}</small> : null}</b>
            <span>{t.simpleSub}</span>
          </div>
        </div>
        {next && onLesson && (
          <>
            <div className="wb-learn-simple-next"><span>{lc.nextLesson}:</span> <b>{next.icon} {next.title}</b></div>
            <button type="button" className="wb-learn-simple-go" disabled={busy} onClick={() => void openLesson(next.id)}>{started ? t.cont : lc.startBtn}</button>
          </>
        )}
        <button type="button" className="wb-learn-simple-link" onClick={() => setShowAll((v) => !v)}>{showAll ? lc.hideLessons : lc.allLessons}</button>
        {showAll && L && (
          <>
            {lessonTopics(L.list, L.next)}
            <button type="button" className="wb-learn-simple-link is-quiet" onClick={() => setStep("pick")}>{t.changeLang}</button>
          </>
        )}
        {busy && msg && <p className="wb-learn-msg">{msg}</p>}
      </section>
    );
  }

  // Learning: what's going on, and the school list.
  const s = state.stats;
  return (
    <section className="wb-learn-card is-on" dir={dir}>
      <div className="wb-learn-head">
        <span className="wb-learn-icon" aria-hidden="true">🎒</span>
        <div className="wb-learn-text">
          <b>{t.learning(name(state.lang!))}{state.lang === "he" ? <small className="wb-learn-beta">{t.beta}</small> : null}</b>
          <span>{t.learningSub}</span>
        </div>
        <button type="button" className="wb-learn-chip is-soft" onClick={() => setStep("pick")}>{t.change}</button>
      </div>
      {s && (
        <div className="wb-learn-stats">
          <span><b>{s.learnedWeek}</b> {t.learnedWeek}</span>
          <span><b>{s.reinforce}</b> {t.reinforce}</span>
          {s.list && <span className="is-list"><b>{s.list.ready}/{s.list.total}</b> {t.listReady(s.list.testDate)}</span>}
        </div>
      )}
      {state.lessons && state.lessons.list.length > 0 && onLesson && (() => {
        const next = state.lessons.list.find((l) => l.id === state.lessons!.next);
        return (
          <div className="wb-learn-lessons">
            {next && (
              <div className="wb-learn-lesson">
                <div className="wb-learn-text">
                  <span>{lc.nextLesson}</span>
                  <b>{next.icon} {next.title}</b>
                </div>
                <button type="button" className="wb-learn-btn" disabled={busy} onClick={() => void openLesson(next.id)}>{lc.startBtn}</button>
              </div>
            )}
            <button type="button" className="wb-learn-chip is-soft" onClick={() => setShowAll((v) => !v)}>{showAll ? lc.hideLessons : lc.allLessons}</button>
            {showAll && lessonTopics(state.lessons.list, state.lessons!.next)}
          </div>
        );
      })()}
      {state.lesson && onLesson && (
        <div className="wb-learn-lesson">
          <div className="wb-learn-text">
            <b>📘 {lc.title(state.lesson.topic)}</b>
            <span>{lc.meta(state.lesson.items.length)}</span>
          </div>
          <button type="button" className="wb-learn-btn" onClick={() => onLesson(state.lesson!)}>{lc.start}</button>
        </div>
      )}
      <div className="wb-learn-row">
        {/* Workbook pages straight from the card (Gadi 2026-10-11: it was
            three steps deep, inside the school-list screen). */}
        <button type="button" className="wb-learn-btn" disabled={busy} onClick={() => pagesRef.current?.click()}><GaditIcon name="workbook" size={24} /> {lc.photoBtn}</button>
        <input ref={pagesRef} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = e.target.files; if (f?.length) void pages(f); e.target.value = ""; }} />
        <button type="button" className="wb-learn-chip" onClick={() => { setStep("list"); setMsg(""); }}>📝 {s?.list ? t.listReplace : t.listAdd}</button>
        {s?.list && <button type="button" className="wb-learn-chip is-soft" disabled={busy} onClick={async () => { setBusy(true); try { await post({ action: "clearList" }); await load(); } finally { setBusy(false); } }}>{t.listClear}</button>}
      </div>
      {busy && msg && <p className="wb-learn-msg">{msg}</p>}
      {!busy && msg && step === "view" && <p className="wb-learn-msg">{msg}</p>}
    </section>
  );
}
