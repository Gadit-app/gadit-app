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
 *
 * Played inside a word world (Gadi 2026-11-01: "every game with graphics
 * like the worlds"): the child's newest world is the backdrop, the story
 * hangs on a parchment sign, the words are stones on the ground, and the
 * child's avatar stands by and reacts.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/lib/game-sfx";
import { NiqqudToggle, useNiqqud } from "@/lib/niqqud-display";
import { useAuth } from "@/lib/auth-context";
import type { PlayWord } from "@/lib/play-engine";
import { dirForLang, sample, shuffle, wordLangOf } from "@/lib/play-engine";
import type { ContextRound } from "@/lib/context-game";
import { GameResult } from "./GameResult";
import { reportAnswer } from "@/lib/learn/report";
import type { PlayT } from "./GameQuiz";
import { QText } from "./QText";
import { TTSButton } from "@/components/design/TTSButton";
import { WaitText } from "@/components/WaitText";
import { ctxCopy, type CtxCopy } from "./context-detective-i18n";
import { SfxToggle } from "@/components/SfxToggle";
import { avatarUrl } from "@/lib/family";
import { WORLDS, WORLD_ORDER, isWorldId, worldArt, wordsToOpen, type WorldId } from "@/lib/world/worlds";

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
type Mood = "idle" | "happy" | "oops";

/** The child's newest open world (the backdrop), jungle until we know. */
function useNewestWorld(): WorldId {
  const { user } = useAuth();
  const [id, setId] = useState<WorldId>("jungle");
  useEffect(() => {
    if (!user) return;
    let alive = true;
    void (async () => {
      try {
        const r = await fetch("/api/world", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        const j = r.ok ? ((await r.json()) as { worlds?: Record<string, { items?: unknown[] }> }) : null;
        const counts: Record<string, number> = {};
        for (const [k, v] of Object.entries(j?.worlds ?? {})) counts[k] = Array.isArray(v.items) ? v.items.length : 0;
        const k = [...WORLD_ORDER].reverse().find((w) => isWorldId(w) && wordsToOpen(w, counts) === 0);
        if (alive && k && isWorldId(k)) setId(k);
      } catch { /* jungle */ }
    })();
    return () => { alive = false; };
  }, [user]);
  return id;
}

/** The scene: world backdrop, round buttons on top, the avatar by the sign. */
export function CtxWorld({ worldId, onExit, exitLabel, progress, score, mood, children }: {
  worldId: WorldId; onExit: () => void; exitLabel: string; progress?: string; score?: number; mood: Mood; children: React.ReactNode;
}) {
  const { avatarId, avatarPhotoUrl } = useAuth();
  const av = avatarUrl(avatarId) ?? avatarPhotoUrl ?? null;
  return (
    <div className="ctx-world" style={{ backgroundImage: `url(${worldArt(WORLDS[worldId], "clearing")})` }}>
      <div className="ctx-hud">
        <div className="ctx-hud-side">
          <button type="button" className="ctx-round" onClick={onExit} aria-label={exitLabel}>✕</button>
          <SfxToggle className="ctx-round" />
          <NiqqudToggle />
        </div>
        {progress ? <span className="ctx-pill">{progress}{score != null ? <> · ⭐ {score}</> : null}</span> : null}
      </div>
      <div className="ctx-scroll">
        <div className="ctx-col">{children}</div>
      </div>
      <div className={`ctx-avatar is-${mood}`} aria-hidden="true">
        {av ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={av} alt="" />
        ) : <span>🙂</span>}
      </div>
    </div>
  );
}

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
  const worldId = useNewestWorld();
  const [mood, setMood] = useState<Mood>("idle");

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
      <CtxWorld worldId={worldId} onExit={onExit} exitLabel={t.resultBackToGames} mood="idle">
        <div className="ctx-sign ctx-state">
          {!ready ? (
            <div className="ctx-loading"><WaitText text={c.loading} live /></div>
          ) : (
            <>
              <div className="ctx-error" role="alert">
                {(pick.words.length < 2 ? c.tooFew : c.error).split("\n").map((line, i) => <div key={i}>{line}</div>)}
              </div>
              {pick.words.length >= 2 && (
                <button type="button" className="ctx-btn" onClick={() => setSession((n) => n + 1)}>{c.retry}</button>
              )}
              <button type="button" className="ctx-btn is-ghost" onClick={onExit}>{t.resultBackToGames}</button>
            </>
          )}
        </div>
        <style>{CTX_CSS}</style>
      </CtxWorld>
    );
  }

  const last = idx + 1 >= rounds.length;
  return (
    <CtxWorld worldId={worldId} onExit={onExit} exitLabel={t.resultBackToGames} progress={`${c.title} · ${idx + 1}/${rounds.length}`} score={score} mood={mood}>
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
          setMood(oks.every(Boolean) ? "happy" : "oops");
          const wrong = r.base.filter((_, i) => !oks[i]);
          if (wrong.length) setMissed((m) => [...m, ...wrong.filter((w) => !m.some((x) => same(x, w)))]);
        }}
        onNext={() => { setMood("idle"); if (last) setDone(true); else setIdx((n) => n + 1); }}
      />
      <style>{CTX_CSS}</style>
    </CtxWorld>
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
  const { nq } = useNiqqud();
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
      <div className="ctx-sign ctx-card">
        <div className="ctx-eyebrow"><QText text={c.prompt} /></div>
        <div className="ctx-story" dir={dir} lang={wordLang}>
          {round.segments.map((seg, i) => (
            <span key={i}>
              <QText text={nq(seg)} skip={round.options} context={context} wordLang={wordLang} />
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
                        <s className="ctx-blank-chosen">{f !== null ? nq(round.options[f]) : ""}</s>
                        <span className="ctx-blank-fix">{nq(round.answers[i])}</span>
                      </>
                    ) : f !== null ? nq(round.options[f]) : <span className="ctx-blank-num" aria-hidden="true">{i + 1}</span>}
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
                  {nq(opt)}
                </button>
              );
            })}
          </div>
          <button type="button" className="ctx-btn ctx-check" onClick={check} disabled={!allFilled}>
            {c.check}
          </button>
        </>
      )}

      {checked && (
        <div className="ctx-reveal ctx-sign" role="status">
          <div className={`ctx-sum${oks.every(Boolean) ? " is-all" : ""}`}>
            {fill(c.score, { n: oks.filter(Boolean).length, m: n })}
          </div>
          <ul className="ctx-why">
            {round.answers.map((a, i) => (
              <li key={i} className={oks[i] ? "is-right" : "is-wrong"}>
                <span className="ctx-why-mark" aria-hidden="true">{oks[i] ? "✓" : "✗"}</span>
                <span className="ctx-why-body">
                  <span className="ctx-why-word" dir={dir} lang={wordLang}>{nq(a)}</span>
                  {!oks[i] && fills[i] !== null && (
                    <span className="ctx-why-chose">{c.youChose} <span dir={dir} lang={wordLang}>{nq(round.options[fills[i] as number])}</span></span>
                  )}
                  <span className="ctx-why-text" dir="auto"><QText text={nq(round.why[i])} /></span>
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
          <button type="button" className="ctx-btn" onClick={onNext}>{nextLabel}</button>
        </div>
      )}
    </>
  );
}

export const CTX_CSS = `
.ctx-world { position: fixed; inset: 0; z-index: 60; background-color: #bfe3d0; background-size: cover; background-position: center; display: grid; grid-template-rows: auto 1fr; color: #2b1d0e; -webkit-tap-highlight-color: transparent; }
.ctx-world::before { content: ""; position: absolute; inset: 0; background: linear-gradient(#0000 55%, #0003); pointer-events: none; }
.ctx-hud { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: calc(env(safe-area-inset-top, 0px) + 12px) 14px 6px; }
.ctx-hud-side { display: flex; gap: 8px; }
.ctx-round { width: 44px; height: 44px; flex: 0 0 44px; border-radius: 50%; border: 0; background: #fffe; box-shadow: 0 2px 8px #0002; font-size: 20px; display: grid; place-items: center; cursor: pointer; color: #14202b; }
.ctx-pill { background: #fffe; border-radius: 999px; padding: 8px 14px; font-weight: 800; box-shadow: 0 2px 8px #0002; white-space: nowrap; font-size: 15px; color: #14202b; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ctx-scroll { position: relative; z-index: 1; overflow-y: auto; padding: 8px 16px calc(env(safe-area-inset-bottom, 0px) + 110px); }
.ctx-col { max-width: 640px; margin: 0 auto; display: grid; gap: 16px; }
/* the story hangs on a parchment sign in a wooden frame */
.ctx-sign { position: relative; background: linear-gradient(#fdf4dc, #f6e5bd); border: 7px solid #8a5a2b; border-radius: 20px; box-shadow: 0 0 0 3px #5e3a17, 0 14px 30px #0006, inset 0 0 30px #c99a5a55; padding: 20px 18px; }
.ctx-sign::before, .ctx-sign::after { content: ""; position: absolute; top: 8px; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #d9b98a, #5e3a17); }
.ctx-sign::before { inset-inline-start: 8px; }
.ctx-sign::after { inset-inline-end: 8px; }
.ctx-card { text-align: start; }
.ctx-eyebrow { text-align: center; font-size: 14px; line-height: 1.45; font-weight: 700; color: #7a5326; margin-bottom: 6px; }
.ctx-story { text-align: start; font-family: var(--wb-font-display); font-size: clamp(18px, 4.6vw, 22px); line-height: 2.05; color: #2b1d0e; }
.ctx-blank { display: inline-flex; align-items: center; justify-content: center; gap: 6px; vertical-align: baseline; min-width: 84px; min-height: 44px; margin: 2px 3px; padding: 0 12px; border-radius: 12px; border: 2px dashed #a8773f; background: #fff8e6; color: #7a4a14; font: inherit; font-weight: 800; line-height: 1.2; cursor: pointer; transition: background 160ms, border-color 160ms, box-shadow 160ms; }
.ctx-blank.is-glued { margin-inline-end: 0; }
.ctx-blank.is-filled { border-style: solid; background: #fff; }
.ctx-blank.is-selected { border-style: solid; border-color: #f2b705; background: #fff3c4; box-shadow: 0 0 0 4px #ffd23f88; color: #6b4e00; }
.ctx-blank.is-right { border-style: solid; border-color: #2f9e44; background: #e3f7e6; color: #1f6b2f; cursor: default; }
.ctx-blank.is-wrong { border-style: solid; border-color: #e03131; background: #ffe8e8; color: #b42318; cursor: default; }
.ctx-blank-num { font-size: 13px; font-weight: 800; opacity: 0.55; }
.ctx-blank-chosen { font-weight: 600; opacity: 0.8; }
.ctx-blank-fix { color: #1f6b2f; }
/* the words are stones on the ground */
.ctx-bar { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 4px; }
.ctx-chip { min-height: 52px; min-width: 70px; padding: 0 20px; border-radius: 22px 18px 24px 16px; border: 0; background: radial-gradient(120% 90% at 30% 25%, #f4f1ea, #cfc8b8 70%, #a9a190); color: #2b2418; font: inherit; font-size: 18px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 0 #7d7565, 0 9px 14px #0005; transition: transform 140ms; }
.ctx-chip:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 2px 0 #7d7565, 0 4px 8px #0005; }
.ctx-chip.is-used { background: #0002; color: transparent; box-shadow: inset 0 3px 6px #0004; cursor: default; }
.ctx-btn { justify-self: center; min-height: 52px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; padding: 12px 30px; cursor: pointer; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
.ctx-btn.is-ghost { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset; }
.ctx-check:disabled { opacity: 0.55; cursor: default; }
.ctx-reveal { display: grid; gap: 12px; }
.ctx-sum { text-align: center; font-weight: 800; font-size: 18px; color: #b45309; }
.ctx-sum.is-all { color: #1f6b2f; }
.ctx-why { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.ctx-why li { display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border-radius: 14px; background: #fffdf6; border: 2px solid #e8d3a8; }
.ctx-why li.is-right { border-color: #8fd19e; }
.ctx-why li.is-wrong { border-color: #f1a1a1; }
.ctx-why-mark { flex: none; width: 26px; height: 26px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; background: #2f9e44; }
.ctx-why li.is-wrong .ctx-why-mark { background: #e03131; }
.ctx-why-body { display: grid; gap: 3px; min-width: 0; }
.ctx-why-word { font-weight: 800; font-size: 16px; color: #2b1d0e; }
.ctx-why-chose { font-size: 13px; color: #b42318; }
.ctx-why-text { font-size: 15px; line-height: 1.5; color: #2b1d0e; }
.ctx-listen { display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; color: #7a5326; }
.ctx-state { display: grid; gap: 14px; justify-items: center; text-align: center; padding: 36px 18px; margin-top: 12vh; }
.ctx-loading { font-size: 18px; font-weight: 800; color: #2b1d0e; }
.ctx-error { display: grid; gap: 4px; font-size: 16px; line-height: 1.5; color: #2b1d0e; }
/* the child's avatar stands on the ground by the sign and reacts */
.ctx-avatar { position: absolute; z-index: 2; inset-inline-start: 14px; bottom: calc(env(safe-area-inset-bottom, 0px) + 14px); width: clamp(64px, 18vw, 92px); aspect-ratio: 1; border-radius: 50%; border: 4px solid #fff; background: #fff; box-shadow: 0 6px 14px #0004; overflow: hidden; display: grid; place-items: center; font-size: 40px; pointer-events: none; }
.ctx-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ctx-avatar.is-happy { animation: ctx-jump .55s ease-out 3; }
.ctx-avatar.is-oops { animation: ctx-tilt 1.2s ease-in-out 1; }
@keyframes ctx-jump { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-26px) scale(1.06); } }
@keyframes ctx-tilt { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-10deg); } 60% { transform: rotate(8deg); } }
@media (prefers-reduced-motion: reduce) { .ctx-avatar.is-happy, .ctx-avatar.is-oops { animation: none; } }
`;
