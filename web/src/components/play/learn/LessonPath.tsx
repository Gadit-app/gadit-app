"use client";

/**
 * A lesson from photographed workbook pages (Gadi 2026-10-11, Ziv's English
 * unit on the family). The workbook's own ladder, one game per rung:
 * meet the words, word and meaning, fill the workbook's sentences, true or
 * false, he/she/it (when the unit practices it), build a sentence.
 * A step without enough material is skipped.
 */
import { useEffect, useMemo, useState } from "react";
import type { PlayWord } from "@/lib/play-engine";
import type { PlayT } from "../GameQuiz";
import { GameFlashcards } from "../GameFlashcards";
import { GameQuiz } from "../GameQuiz";
import { GameFillBlank } from "../GameFillBlank";
import { GameTrueFalse } from "../GameTrueFalse";
import { GamePronoun } from "./GamePronoun";
import { GameSentenceBuilder } from "./GameSentenceBuilder";
import { GameReading } from "./GameReading";
import { setLessonNext } from "@/lib/lesson-flow";
import { lessonCopy } from "./lesson-i18n";
// The banks themselves, not bankFor: the fill-in step needs only the words
// and topics, and bankFor would pull every UI language's translations into
// the client bundle (2026-10-18).
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";

export type Lesson = {
  /** A built-in lesson's id (a photographed one has none). */
  id?: string;
  topic: string;
  items: Array<{ w: string; t: string; nq?: string; en?: string }>;
  sentences: string[];
  pronouns: Array<{ phrase: string; answer: string }>;
  reading?: { title: string; text: string; checks: Array<{ s: string; yes: boolean }> } | null;
};

type StepId = "cards" | "match" | "fill" | "truefalse" | "reading" | "pronoun" | "build";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function LessonPath({ lesson, learnLang, lang, t, onExit, onDone }: {
  lesson: Lesson;
  /** The language being learned ("en" or "he"). */
  learnLang: string;
  /** The UI language. */
  lang: string;
  t: PlayT;
  onExit: () => void;
  /** Called once when the last step ends. */
  onDone?: () => void;
}) {
  const c = lessonCopy(lang);
  const audioLang = learnLang === "he" ? "he-IL" : "en-US";
  // The lesson's words as game words, each with the workbook sentences that use it.
  const pool = useMemo<PlayWord[]>(() => lesson.items.map((x) => {
    const re = new RegExp(`(^|[^\\p{L}])${escapeRe(x.w)}($|[^\\p{L}])`, "iu");
    return {
      word: x.w,
      meaning: x.t,
      examples: lesson.sentences.filter((s) => re.test(s)),
      language: learnLang === "he" ? "Hebrew" : "English",
      uiLang: lang,
      ...(x.en ? { picWord: x.en } : {}),
    };
  }), [lesson, learnLang, lang]);

  // Wrong options for the fill-in step: words of the same language from OTHER
  // topics, so only one option can fit the sentence (2026-10-17).
  const otherWords = useMemo(() => {
    const bank: Array<{ w: string; topic: string }> = learnLang === "he" ? HEBREW_BANK : ENGLISH_BANK;
    const mine = new Set(lesson.items.map((x) => x.w));
    const topics = new Set(bank.filter((b) => mine.has(b.w)).map((b) => b.topic));
    return bank.filter((b) => !mine.has(b.w) && !topics.has(b.topic) && !/\s/.test(b.w)).map((b) => b.w);
  }, [lesson, learnLang]);

  const steps = useMemo<StepId[]>(() => {
    const out: StepId[] = ["cards", "match"];
    if (pool.filter((p) => p.examples.length > 0).length >= 4) out.push("fill");
    out.push("truefalse");
    if (lesson.reading && lesson.reading.checks.length >= 3) out.push("reading");
    if (lesson.pronouns.length >= 4) out.push("pronoun");
    if (lesson.sentences.length >= 4) out.push("build");
    return out;
  }, [pool, lesson]);

  const [i, setI] = useState(0);
  const done = i >= steps.length;
  useEffect(() => { if (done) onDone?.(); }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  // The results screen of each game offers the next step.
  useEffect(() => {
    setLessonNext(!done && i + 1 < steps.length ? c.next(c.steps[steps[i + 1]]) : !done ? c.doneTitle : null);
    return () => setLessonNext(null);
  }, [i, done, steps, c]);

  if (done) {
    return (
      <div className="wb-play-stage" style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 56 }} aria-hidden="true">🎉</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "10px 0 6px", color: "var(--wb-ink)" }}>{c.doneTitle}</h2>
        <p style={{ color: "var(--wb-ink-soft)", fontSize: 16, maxWidth: 420, margin: "0 auto 22px", lineHeight: 1.6 }}>{c.doneBody}</p>
        <button type="button" className="wb-play-cta-primary" onClick={onExit}>{c.back}</button>
      </div>
    );
  }

  const step = steps[i];
  const next = () => setI((x) => x + 1);
  const props = { pool, onExit: next, lang, t };
  return (
    <div>
      <div className="wb-lesson-steps" role="list" aria-label={c.title(lesson.topic)}>
        <span className="wb-lesson-step-label">{c.stepOf(i + 1, steps.length)} · {c.steps[step]}</span>
        <span className="wb-lesson-dots" aria-hidden="true">
          {steps.map((s, k) => <span key={s} className={k < i ? "is-done" : k === i ? "is-on" : ""} />)}
        </span>
        <button type="button" className="wb-lesson-close" onClick={onExit} aria-label={c.back}>×</button>
      </div>
      <style>{LESSON_CSS}</style>
      <div key={step}>
        {step === "cards" && <GameFlashcards {...props} mode="meanings" skipPicker />}
        {step === "match" && <GameQuiz {...props} />}
        {step === "fill" && <GameFillBlank {...props} distractorWords={otherWords} />}
        {step === "truefalse" && <GameTrueFalse {...props} />}
        {step === "reading" && lesson.reading && <GameReading reading={lesson.reading} onExit={next} lang={lang} t={t} audioLang={audioLang} dirText={learnLang === "he" ? "rtl" : "ltr"} />}
        {step === "pronoun" && <GamePronoun items={lesson.pronouns} onExit={next} lang={lang} t={t} audioLang={audioLang} />}
        {step === "build" && <GameSentenceBuilder sentences={lesson.sentences} onExit={next} lang={lang} t={t} audioLang={audioLang} />}
      </div>
    </div>
  );
}

const LESSON_CSS = `
.wb-lesson-steps { display: flex; align-items: center; gap: 12px; max-width: 720px; margin: 12px auto 0; padding: 8px 16px; }
.wb-lesson-step-label { font-size: 14px; font-weight: 700; color: var(--wb-ink, #0f172a); }
.wb-lesson-dots { display: inline-flex; gap: 6px; margin-inline-start: auto; }
.wb-lesson-dots span { width: 10px; height: 10px; border-radius: 50%; background: var(--wb-border, #D1D5DB); }
.wb-lesson-dots span.is-done { background: #10B981; }
.wb-lesson-dots span.is-on { background: var(--accent, #0EA5A5); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #0EA5A5) 30%, transparent); }
.wb-lesson-close { font: inherit; font-size: 22px; line-height: 1; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--wb-border, #D1D5DB); background: var(--surface, #fff); color: var(--wb-ink, #0f172a); cursor: pointer; }
`;
