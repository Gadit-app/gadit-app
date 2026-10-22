"use client";

/**
 * "Listen and pick the picture" inside a lesson, for a child who doesn't
 * read the language yet ("not yet" to "do they already read it?",
 * 2026-10-22). The Homework picture game's round: the word plays by itself,
 * three pictures, no text; the same pictures (one per English word, shared by
 * everyone) and the same rule that only one picture of a round may fit
 * (lib/picture-pick.ts). Only pictures that already exist are used: the
 * lesson's word cards ask for the missing ones to be drawn, so they arrive
 * while the child plays and join the game. A word missed comes back once.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { WaitText } from "@/components/WaitText";
import { TTSButton } from "@/components/design/TTSButton";
import { useAuth } from "@/lib/auth-context";
import { reportAnswer } from "@/lib/learn/report";
import { lessonPicDistractors, PIC_ANCHORS } from "@/lib/picture-pick";
import { picCopy } from "@/lib/picture-pick-i18n";
import { ENGLISH_BANK } from "@/lib/learn/english-bank";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { GameResult } from "../GameResult";
import { PlayHeader, type PlayT } from "../GameQuiz";
import { QText } from "../QText";
import { learnCopy } from "./learn-i18n";
import { learnExtraCopy } from "./learn-extra-i18n";

type Item = { w: string; t: string; nq?: string; en?: string };
/** One round: the word, its picture and the round's three pictures, fixed when it joins. */
type Round = { item: Item; pic: string; opts: string[]; repeat: boolean };

const norm = (s: string) => s.trim().toLowerCase();
/** A stable order per round, so the pictures don't jump while more arrive. */
function seededShuffle<T>(xs: T[], salt: string): T[] {
  const h = (s: string) => { let x = 2166136261; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return x >>> 0; };
  return xs.map((x, i) => ({ x, k: h(salt + i) })).sort((a, b) => a.k - b.k).map((o) => o.x);
}
/** Look the pictures up again while the cards' drawings come in. */
const POLLS_MS = [0, 12_000, 30_000];

export function GamePicturePick({ items, learnLang, lang, t, title, onExit }: {
  items: Item[];
  /** "en" or "he": the language heard. */
  learnLang: string;
  lang: string;
  t: PlayT;
  title: string;
  onExit: () => void;
}) {
  const { user } = useAuth();
  const pc = picCopy(lang);
  const lc = learnCopy(lang);
  const xc = learnExtraCopy(lang);
  const audioLang = learnLang === "he" ? "he-IL" : "en-US";
  // The picture of each word is its English one (a Hebrew word's `en`).
  const picWord = (x: Item) => norm(learnLang === "en" ? x.w : x.en ?? "");
  const words = useMemo(() => items.filter((x) => picWord(x)), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  // English words of each word's own topic: never the other picture of its round.
  const sameTopic = useMemo(() => {
    const topicOf = new Map<string, string>();
    for (const b of ENGLISH_BANK) topicOf.set(norm(b.w), b.topic);
    for (const b of HEBREW_BANK) if (b.en && !topicOf.has(norm(b.en))) topicOf.set(norm(b.en), b.topic);
    const byTopic = new Map<string, Set<string>>();
    for (const [w, tp] of topicOf) { const s = byTopic.get(tp) ?? new Set<string>(); s.add(w); byTopic.set(tp, s); }
    return (w: string) => byTopic.get(topicOf.get(w) ?? "") ?? new Set<string>();
  }, []);

  const [pics, setPics] = useState<Record<string, string>>({});
  const [pollsLeft, setPollsLeft] = useState(POLLS_MS.length);
  const [queue, setQueue] = useState<Round[]>([]);
  const queued = useRef(new Set<string>());
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Item[]>([]);
  const hearRef = useRef<HTMLSpanElement>(null);

  // The lesson's pictures and the anchors' (another topic's single things).
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const ask = [...new Set([...words.map(picWord), ...PIC_ANCHORS])];
    const timers = POLLS_MS.map((ms) => setTimeout(async () => {
      try {
        const r = await fetch("/api/play/images", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ words: ask, pick: true }),
        });
        const got = r.ok ? (((await r.json()) as { images?: Record<string, string> }).images ?? {}) : {};
        if (alive) {
          for (const u of Object.values(got)) { try { new Image().src = u; } catch { /* shown when needed */ } }
          setPics((prev) => { const out = { ...prev }; for (const [w, u] of Object.entries(got)) out[norm(w)] = u; return out; });
        }
      } catch { /* the next look-up tries again */ }
      if (alive) setPollsLeft((n) => n - 1);
    }, ms));
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [user, words]); // eslint-disable-line react-hooks/exhaustive-deps

  // A word joins the game once its picture and two safe others are there.
  useEffect(() => {
    const have = Object.keys(pics);
    const ready: Round[] = [];
    for (const x of words) {
      const k = picWord(x);
      if (queued.current.has(k) || !pics[k]) continue;
      const others = lessonPicDistractors(k, have.filter((w) => pics[w] !== pics[k]), k, sameTopic(k));
      if (others.length < 2) continue;
      queued.current.add(k);
      ready.push({ item: x, pic: k, opts: seededShuffle([k, ...others], k), repeat: false });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- words join as their pictures land
    if (ready.length) setQueue((q) => [...q, ...seededShuffle(ready, String(q.length))]);
  }, [pics, words, sameTopic]); // eslint-disable-line react-hooks/exhaustive-deps

  const round = queue[idx];
  const options = round?.opts ?? [];

  // The word plays by itself on every new round.
  useEffect(() => {
    if (!round) return;
    const tm = setTimeout(() => hearRef.current?.querySelector("button")?.click(), 350);
    return () => clearTimeout(tm);
  }, [round, idx]);

  const next = () => { setPicked(null); setResult(null); setIdx((i) => i + 1); };
  const choose = (o: string) => {
    if (!round || result) return;
    setPicked(o);
    const ok = o === round.pic;
    if (!round.repeat) {
      reportAnswer(round.item.w, ok);
      if (ok) setScore((s) => s + 1);
      else setMissed((m) => [...m, round.item]);
    }
    // A word missed comes back once at the end.
    if (!ok && !round.repeat) setQueue((q) => [...q, { ...round, repeat: true }]);
    setResult(ok ? "right" : "wrong");
    if (ok) setTimeout(next, 1300);
  };

  const firstTries = queue.filter((r) => !r.repeat).length;
  const waiting = pollsLeft > 0;

  if (!round) {
    // Every round played: the result.
    if (queue.length > 0 && idx >= queue.length && !waiting) {
      return (
        <GameResult
          data={{ title, score, total: firstTries, missed: missed.map((x) => ({ word: x.nq || x.w, meaning: x.t })) }}
          onExit={onExit}
          onReplay={() => { setIdx(0); setScore(0); setMissed([]); setQueue((q) => q.filter((r) => !r.repeat)); }}
          lang={lang}
          t={t}
        />
      );
    }
    return (
      <div className="wb-play-stage">
        <PlayHeader title={title} progress="" score={score} onExit={onExit} t={t} />
        <div className="wb-pic-prep" style={{ marginTop: 24 }} role="status">
          {waiting ? (
            <>
              <span aria-hidden className="wb-pic-prep-ico">🖼️</span>
              <span><WaitText text={pc.prep} /></span>
              <span className="wb-pic-bar is-busy" aria-hidden><span style={{ width: `${Math.round(((POLLS_MS.length - pollsLeft + 1) / (POLLS_MS.length + 1)) * 100)}%` }} /></span>
            </>
          ) : (
            <>
              <span>{xc.picFew}</span>
              <button type="button" className="wb-learn-simple-go" style={{ maxWidth: 320 }} onClick={onExit}>{lc.cont}</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const shown = round.item.nq || round.item.w;
  return (
    <div className="wb-play-stage">
      <PlayHeader title={title} progress={`${Math.min(idx + 1, queue.length)}/${queue.length}`} score={score} onExit={onExit} t={t} />
      <div className="wb-pick" style={{ marginTop: 18 }}>
        <span ref={hearRef} className="wb-spell-hear">
          <TTSButton key={`${idx}-${round.item.w}`} text={shown} audioLang={audioLang} ariaLabel={pc.name} rate={0.7} />
        </span>
        <div className="wb-pic-opts" dir="ltr">
          {options.map((o, i) => {
            const right = !!result && o === round.pic;
            const wrong = result === "wrong" && picked === o;
            return (
              <button key={o} type="button" disabled={!!result} onClick={() => choose(o)} aria-label={String(i + 1)}
                className={`wb-pic-opt${right ? " is-right" : ""}${wrong ? " is-wrong" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pics[o]} alt="" width={240} height={240} draggable={false} />
              </button>
            );
          })}
        </div>
        {/* After the answer, the word and its meaning for whoever sits next to the child. */}
        {result && (
          <div style={{ textAlign: "center", display: "grid", gap: 4 }}>
            <b dir={learnLang === "he" ? "rtl" : "ltr"} style={{ fontSize: 24, color: "var(--ink, #0B1220)" }}>{result === "right" ? "✓ " : ""}{shown}</b>
            <span style={{ fontSize: 16, color: "var(--ink-soft, #4B5563)" }}><QText text={round.item.t} /></span>
          </div>
        )}
        {result === "wrong" && <button type="button" className="wb-learn-simple-go" onClick={next}>{lc.cont}</button>}
      </div>
    </div>
  );
}
