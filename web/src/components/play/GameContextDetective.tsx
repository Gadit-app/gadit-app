"use client";

/**
 * GameContextDetective (2026-11-01): sentence completion v2.
 *
 * A short story with 2 (Kids Mode) or 3 blanks. The word bar under it holds
 * the answers, which are the child's own practice words, plus 2 distractors
 * that fit the grammar of a blank but not the meaning of the whole story,
 * so the child has to read all of it. The first empty blank is selected;
 * a tap on a word puts it there, a tap on a filled blank sends its word
 * back. "Check" marks each blank and explains it in the UI language, then
 * the finished story is read aloud. 3 stories per session.
 *
 * The stories come from /api/play/context (one call, cached per word set).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { useAuth } from "@/lib/auth-context";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang, sample, shuffle, wordLangOf } from "@/lib/play-engine";
import type { ContextRound } from "@/lib/context-game";
import { GameResult } from "./GameResult";
import { reportAnswer } from "@/lib/learn/report";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { QText } from "./QText";
import { TTSButton } from "@/components/design/TTSButton";
import { WaitText } from "@/components/WaitText";
import { ctxCopy, type CtxCopy } from "./context-detective-i18n";

const fill = (tpl: string, v: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

const same = (a: string, b: string) => a.normalize("NFC").trim().toLowerCase() === b.normalize("NFC").trim().toLowerCase();

/** The words for one session: the language with the most words in the pool
 *  (the UI language wins a tie), then a random handful of its words. */
function pickWords(pool: PlayWord[], ui: string, kids: boolean): { words: string[]; wordLang: string } {
  const groups = new Map<string, string[]>();
  for (const p of pool) {
    const w = p.word.trim();
    if (!w || w.split(/\s+/).length > 3) continue;
    const l = wordLangOf(p);
    const g = groups.get(l) ?? [];
    if (!g.some((x) => same(x, w))) g.push(w);
    groups.set(l, g);
  }
  let best = "";
  let bestN = 0;
  for (const [l, g] of groups) {
    if (g.length > bestN || (g.length === bestN && l === ui)) { best = l; bestN = g.length; }
  }
  // Newest words come first in the pool: lean on them, mixed with a few others.
  const g = groups.get(best) ?? [];
  const n = kids ? 6 : 9;
  const fresh = g.slice(0, Math.min(g.length, n * 2));
  return { words: sample(fresh, n), wordLang: best || ui };
}

type Load = { session: number; rounds?: ContextRound[]; error?: boolean };

export function GameContextDetective({
  pool,
  onExit,
  lang,
  t,
  kids = false,
}: {
  pool: PlayWord[];
  onExit: () => void;
  lang: string;
  t: PlayT;
  /** Kids Mode: 2 short sentences and 2 blanks per story. */
  kids?: boolean;
}) {
  const c = ctxCopy(lang);
  const { user } = useAuth();
  const [startPool] = useState(pool);
  const [session, setSession] = useState(0);
  const pick = useMemo(() => pickWords(startPool, lang, kids), [startPool, lang, kids, session]); // eslint-disable-line react-hooks/exhaustive-deps
  const [load, setLoad] = useState<Load | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const s = session;
    void (async () => {
      try {
        if (pick.words.length < 2) throw new Error("too_few");
        const r = await fetch("/api/play/context", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ words: pick.words, lang: pick.wordLang, ui: lang, kids }),
        });
        const j = (await r.json()) as { rounds?: ContextRound[] };
        if (!r.ok || !Array.isArray(j.rounds) || !j.rounds.length) throw new Error("no_rounds");
        // A cached set comes back in the same order: shuffle the word bar each time.
        const rounds = j.rounds.map((x) => ({ ...x, options: shuffle(x.options) }));
        if (alive) setLoad({ session: s, rounds });
      } catch {
        if (alive) setLoad({ session: s, error: true });
      }
    })();
    return () => { alive = false; };
  }, [user, session, pick, lang, kids]);

  function restart() {
    setIdx(0); setScore(0); setTotal(0); setMissed([]); setDone(false);
    setSession((n) => n + 1);
  }

  const ready = load && load.session === session ? load : null;
  const rounds = ready?.rounds ?? [];

  if (done) {
    const meaningOf = (w: string) => startPool.find((p) => same(p.word, w))?.meaning ?? "";
    return (
      <GameResult
        data={{ title: c.title, score, total, missed: missed.map((w) => ({ word: w, meaning: meaningOf(w) })) }}
        onExit={onExit}
        onReplay={restart}
        lang={lang}
        t={t}
      />
    );
  }

  if (!ready || ready.error || !rounds[idx]) {
    return (
      <div className="wb-play-stage">
        <PlayHeader title={c.title} onExit={onExit} t={t} />
        <div className="wb-play-question ctx-state">
          {!ready ? (
            <div className="ctx-loading"><WaitText text={c.loading} live /></div>
          ) : (
            <>
              <div className="ctx-error" role="alert">
                {(pick.words.length < 2 ? c.tooFew : c.error).split("\n").map((line, i) => <div key={i}>{line}</div>)}
              </div>
              {pick.words.length >= 2 && (
                <button type="button" className="wb-play-next" onClick={() => setSession((n) => n + 1)}>{c.retry}</button>
              )}
              <button type="button" className="wb-play-cta-ghost ctx-back" onClick={onExit}>{t.resultBackToGames}</button>
            </>
          )}
        </div>
        <style>{CTX_CSS}</style>
      </div>
    );
  }

  const last = idx + 1 >= rounds.length;
  return (
    <div className="wb-play-stage">
      <PlayHeader title={c.title} progress={`${idx + 1}/${rounds.length}`} score={score} onExit={onExit} t={t} />
      <ContextStory
        key={`${session}-${idx}`}
        round={rounds[idx]}
        wordLang={pick.wordLang}
        c={c}
        nextLabel={last ? t.playFinish : t.playNext}
        onChecked={(oks) => {
          const r = rounds[idx];
          setScore((n) => n + oks.filter(Boolean).length);
          setTotal((n) => n + oks.length);
          const wrong = r.base.filter((_, i) => !oks[i]);
          if (wrong.length) setMissed((m) => [...m, ...wrong.filter((w) => !m.some((x) => same(x, w)))]);
        }}
        onNext={() => { if (last) setDone(true); else setIdx((n) => n + 1); }}
      />
      <style>{CTX_CSS}</style>
    </div>
  );
}

/** One story: the blanks, the word bar, Check, and the explanations. */
export function ContextStory({
  round,
  wordLang,
  c,
  nextLabel,
  onChecked,
  onNext,
  initialFills,
  initialChecked = false,
}: {
  round: ContextRound;
  wordLang: string;
  c: CtxCopy;
  nextLabel: string;
  onChecked: (oks: boolean[]) => void;
  onNext: () => void;
  /** Preview/testing only: start with these option indexes in the blanks. */
  initialFills?: Array<number | null>;
  initialChecked?: boolean;
}) {
  const n = round.answers.length;
  const [fills, setFills] = useState<Array<number | null>>(() => initialFills ?? round.answers.map(() => null));
  const [sel, setSel] = useState<number | null>(() => {
    const f = initialFills ?? [];
    const i = round.answers.findIndex((_, k) => f[k] == null);
    return i < 0 ? null : i;
  });
  const [checked, setChecked] = useState(initialChecked);
  const ttsRef = useRef<HTMLSpanElement>(null);
  const dir = dirForLang(wordLang);
  const used = new Set(fills.filter((x): x is number => x !== null));
  const allFilled = fills.every((x) => x !== null);
  const oks = fills.map((x, i) => x !== null && same(round.options[x], round.answers[i]));
  const fullText = round.segments.map((s, i) => s + (i < n ? round.answers[i] : "")).join("");
  const context = round.segments.join(" ___ ");

  // After Check: the finished story is read aloud (the speaker stays to replay it).
  useEffect(() => {
    if (!checked || initialChecked) return;
    const b = ttsRef.current?.querySelector("button");
    if (b) b.click();
  }, [checked, initialChecked]);

  function nextEmpty(f: Array<number | null>, from: number): number | null {
    for (let k = 1; k <= n; k++) {
      const i = (from + k) % n;
      if (f[i] === null) return i;
    }
    return null;
  }

  function tapWord(oi: number) {
    if (checked || used.has(oi)) return;
    const target = sel ?? fills.findIndex((x) => x === null);
    if (target === null || target < 0) return;
    sfx.tap();
    const f = fills.slice();
    f[target] = oi; // a word already there goes back to the bar
    setFills(f);
    setSel(nextEmpty(f, target));
  }

  function tapBlank(bi: number) {
    if (checked) return;
    if (fills[bi] !== null) {
      sfx.tap();
      const f = fills.slice();
      f[bi] = null;
      setFills(f);
    }
    setSel(bi);
  }

  function check() {
    if (!allFilled || checked) return;
    setChecked(true);
    setSel(null);
    round.base.forEach((w, i) => reportAnswer(w, oks[i]));
    if (oks.every(Boolean)) sfx.correct(); else sfx.wrong();
    onChecked(oks);
  }

  return (
    <>
      <div className="wb-play-question ctx-card">
        <div className="wb-play-question-eyebrow"><QText text={c.prompt} /></div>
        <div className="ctx-story" dir={dir} lang={wordLang}>
          {round.segments.map((seg, i) => (
            <span key={i}>
              <QText text={seg} skip={round.options} context={context} wordLang={wordLang} />
              {i < n && (() => {
                const f = fills[i];
                let cls = "ctx-blank";
                if (checked) cls += oks[i] ? " is-right" : " is-wrong";
                else if (f !== null) cls += " is-filled";
                if (!checked && sel === i) cls += " is-selected";
                // Punctuation right after a blank sits against it ("curious.", "סקרן.").
                if (/^[.,!?;:،؟)»”]/.test(round.segments[i + 1] ?? "")) cls += " is-glued";
                return (
                  <button
                    type="button"
                    className={cls}
                    onClick={() => tapBlank(i)}
                    aria-label={fill(c.blank, { n: i + 1 })}
                    aria-pressed={!checked && sel === i}
                    aria-disabled={checked || undefined}
                  >
                    {checked && !oks[i] ? (
                      <>
                        <s className="ctx-blank-chosen">{f !== null ? round.options[f] : ""}</s>
                        <span className="ctx-blank-fix">{round.answers[i]}</span>
                      </>
                    ) : f !== null ? round.options[f] : <span className="ctx-blank-num" aria-hidden="true">{i + 1}</span>}
                  </button>
                );
              })()}
            </span>
          ))}
        </div>
      </div>

      {!checked && (
        <>
          <div className="ctx-bar" dir={dir} lang={wordLang}>
            {round.options.map((opt, oi) => {
              const isUsed = used.has(oi);
              return (
                <button
                  key={oi}
                  type="button"
                  className={`ctx-chip${isUsed ? " is-used" : ""}`}
                  onClick={() => tapWord(oi)}
                  disabled={isUsed}
                  aria-hidden={isUsed || undefined}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button type="button" className="wb-play-next ctx-check" onClick={check} disabled={!allFilled}>
            {c.check}
          </button>
        </>
      )}

      {checked && (
        <div className="ctx-reveal" role="status">
          <div className={`ctx-sum${oks.every(Boolean) ? " is-all" : ""}`}>
            {fill(c.score, { n: oks.filter(Boolean).length, m: n })}
          </div>
          <ul className="ctx-why">
            {round.answers.map((a, i) => (
              <li key={i} className={oks[i] ? "is-right" : "is-wrong"}>
                <span className="ctx-why-mark" aria-hidden="true">{oks[i] ? "✓" : "✗"}</span>
                <span className="ctx-why-body">
                  <span className="ctx-why-word" dir={dir} lang={wordLang}>{a}</span>
                  {!oks[i] && fills[i] !== null && (
                    <span className="ctx-why-chose">{c.youChose} <span dir={dir} lang={wordLang}>{round.options[fills[i] as number]}</span></span>
                  )}
                  <span className="ctx-why-text" dir="auto"><QText text={round.why[i]} /></span>
                </span>
              </li>
            ))}
          </ul>
          <div className="ctx-listen">
            <span ref={ttsRef}>
              <TTSButton text={fullText} audioLang={wordLang} useOpenAI ariaLabel={c.listen} className="wb-word-act-icon wb-play-speak" />
            </span>
            <span>{c.listen}</span>
          </div>
          <button type="button" className="wb-play-next" onClick={onNext}>{nextLabel}</button>
        </div>
      )}
    </>
  );
}

export const CTX_CSS = `
.ctx-card { text-align: start; padding: 22px 18px; }
.ctx-card .wb-play-question-eyebrow { text-align: center; text-transform: none; letter-spacing: 0; font-size: 14px; line-height: 1.45; }
.ctx-story { text-align: start; font-family: var(--wb-font-display); font-size: clamp(18px, 4.6vw, 22px); line-height: 2.05; color: var(--wb-ink, #1f2937); }
.ctx-blank { display: inline-flex; align-items: center; justify-content: center; gap: 6px; vertical-align: baseline; min-width: 84px; min-height: 44px; margin: 2px 3px; padding: 0 12px; border-radius: 10px; border: 2px dashed rgba(79, 70, 229, 0.45); background: rgba(79, 70, 229, 0.06); color: rgb(67, 56, 202); font: inherit; font-weight: 700; line-height: 1.2; cursor: pointer; transition: background 160ms, border-color 160ms, box-shadow 160ms; }
.ctx-blank.is-glued { margin-inline-end: 0; }
.ctx-blank.is-filled { border-style: solid; background: rgba(79, 70, 229, 0.10); }
.ctx-blank.is-selected { border-style: solid; border-color: #0EA5A5; background: rgba(14, 165, 165, 0.10); box-shadow: 0 0 0 3px rgba(14, 165, 165, 0.22); color: #0b6f6f; }
.ctx-blank.is-right { border-style: solid; border-color: rgba(16, 185, 129, 0.6); background: rgba(16, 185, 129, 0.12); color: #047857; cursor: default; }
.ctx-blank.is-wrong { border-style: solid; border-color: rgba(225, 29, 72, 0.5); background: rgba(225, 29, 72, 0.08); color: rgb(190, 18, 60); cursor: default; }
.ctx-blank-num { font-size: 13px; font-weight: 700; opacity: 0.55; }
.ctx-blank-chosen { font-weight: 600; opacity: 0.8; }
.ctx-blank-fix { color: #047857; }
.ctx-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 16px; }
.ctx-chip { min-height: 48px; min-width: 64px; padding: 0 18px; border-radius: 999px; border: 1.5px solid var(--wb-border, #d1d5db); background: var(--surface, #fff); color: var(--wb-ink, #1f2937); font: inherit; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 0 rgba(15, 23, 42, 0.06); transition: transform 140ms, border-color 160ms, background 160ms; }
.ctx-chip:hover:not(:disabled) { border-color: rgba(14, 165, 165, 0.55); background: rgba(14, 165, 165, 0.05); }
.ctx-chip:active:not(:disabled) { transform: scale(0.96); }
.ctx-chip.is-used { border-style: dashed; color: transparent; background: transparent; box-shadow: none; cursor: default; }
.ctx-check:disabled { opacity: 0.4; cursor: default; box-shadow: none; }
.ctx-reveal { margin-top: 16px; display: grid; gap: 12px; }
.ctx-sum { text-align: center; font-weight: 800; font-size: 17px; color: #b45309; }
.ctx-sum.is-all { color: #0b7d7d; }
.ctx-why { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ctx-why li { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--wb-border, #e5e7eb); background: var(--surface, #fff); }
.ctx-why li.is-right { border-color: rgba(16, 185, 129, 0.35); }
.ctx-why li.is-wrong { border-color: rgba(225, 29, 72, 0.35); }
.ctx-why-mark { flex: none; width: 24px; height: 24px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; background: #10b981; }
.ctx-why li.is-wrong .ctx-why-mark { background: #e11d48; }
.ctx-why-body { display: grid; gap: 3px; min-width: 0; }
.ctx-why-word { font-weight: 800; font-size: 16px; color: var(--wb-ink, #1f2937); }
.ctx-why-chose { font-size: 13px; color: rgb(190, 18, 60); }
.ctx-why-text { font-size: 15px; line-height: 1.5; color: var(--wb-ink, #1f2937); }
.ctx-listen { display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; color: var(--wb-ink-soft, #4b5563); }
.ctx-state { display: grid; gap: 14px; justify-items: center; text-align: center; padding: 36px 18px; }
.ctx-loading { font-size: 17px; font-weight: 700; color: var(--wb-ink, #1f2937); }
.ctx-error { display: grid; gap: 4px; font-size: 16px; line-height: 1.5; color: var(--wb-ink, #1f2937); }
.ctx-state .wb-play-next { margin: 0; }
.ctx-back { min-height: 44px; }
`;
