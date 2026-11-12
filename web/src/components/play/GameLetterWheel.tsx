"use client";

/**
 * "The Letter Wheel" (Gadi 2026-11-12; Shirli and her son made one out of
 * paper and filmed it): an outer wheel of letters and an inner wheel of vowel
 * signs. A tap spins them against each other, they stop on a letter and a
 * sign, and the child says the syllable out loud.
 *
 * With a microphone (paid plans) the game listens and tells which of the five
 * vowels it heard (/api/play/say-vowel). Nothing turns red: a different vowel
 * plays the right sound and the child says it once more. Without a microphone
 * (no permission, a free plan, an old browser) the child says it, taps to hear
 * it, and decides for themselves, like the last step of Reading in syllables.
 *
 * The sounds are the app's Hebrew voice, recorded and checked ahead of time
 * for every letter and sign on the wheels.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useSpeech } from "./GameSyllables";

const ROUNDS = 10;

type Vowel = "a" | "e" | "i" | "o" | "u";
// The outer wheel. ב, כ, פ and ת carry their dagesh and ש its dot, the way a
// first reader meets them at the start of a word.
const LETTERS = ["א", "בּ", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כּ", "ל", "מ", "נ", "ס", "ע", "פּ", "צ", "ק", "ר", "שׁ", "תּ"];
// The inner wheel: eight signs, five sounds.
const SIGNS: Array<{ mark: string; show: string; v: Vowel; draw: string }> = [
  { mark: "ָ", show: "\u00A0ָ", v: "a", draw: "kamatz" },
  { mark: "ַ", show: "\u00A0ַ", v: "a", draw: "patah" },
  { mark: "ֵ", show: "\u00A0ֵ", v: "e", draw: "tsere" },
  { mark: "ֶ", show: "\u00A0ֶ", v: "e", draw: "segol" },
  { mark: "ִ", show: "\u00A0ִ", v: "i", draw: "hirik" },
  { mark: "וֹ", show: "וֹ", v: "o", draw: "holam" },
  { mark: "וּ", show: "וּ", v: "u", draw: "shuruk" },
  { mark: "ֻ", show: "\u00A0ֻ", v: "u", draw: "kubutz" },
];
// ו followed by וֹ or וּ is not a syllable a child reads.
const valid = (l: number, s: number) => !(LETTERS[l] === "ו" && SIGNS[s].mark.length === 2);

/**
 * A sign that sits under a letter, drawn under an empty letter box the way it
 * is taught. Drawn, not typed: a vowel mark with no letter is shown by the
 * browser on a dotted circle, tiny and off-centre.
 */
function SignGlyph({ v }: { v: string }) {
  const dot = (x: number, y: number) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="currentColor" stroke="none" />;
  return (
    <svg className="lwh-glyph" viewBox="0 0 40 46" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="22" height="22" rx="4" strokeWidth="2" opacity="0.5" />
      {v === "patah" && <path d="M11 35h18" />}
      {v === "kamatz" && <path d="M11 33h18M20 33v8" />}
      {v === "tsere" && [dot(14, 35), dot(26, 35)]}
      {v === "segol" && [dot(13, 33), dot(27, 33), dot(20, 41)]}
      {v === "hirik" && dot(20, 35)}
      {v === "kubutz" && [dot(12, 32), dot(20, 37), dot(28, 42)]}
    </svg>
  );
}

type Copy = {
  title: string; desc: string; spin: string; sayIt: string; listening: string; checking: string;
  right: string; other: string; notHeard: string; tryAgain: string; hearIt: string; iSaidIt: string; saidRight: string; oneMore: string;
  next: string; finish: string; done: string; round: (n: number, of: number) => string; micOff: string; useMic: string; micOn: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "שבשבת האותיות", desc: "מסובבים את הגלגלים, ואומרים בקול את האות עם הניקוד",
    spin: "מסובבים", sayIt: "אמרו בקול", listening: "מקשיבים לכם", checking: "רגע, שומעים",
    right: "נכון מאוד", other: "שמענו צליל אחר. הקשיבו ואמרו שוב", notHeard: "לא שמענו. אמרו שוב, קרוב למכשיר",
    tryAgain: "אומרים שוב", hearIt: "לשמוע", iSaidIt: "אמרתי, עכשיו תשמיעו לי", saidRight: "אמרתי נכון", oneMore: "עוד פעם",
    next: "לסיבוב הבא", finish: "סיימנו", done: "קראתם {n} צירופים נכון",
    round: (n, of) => `סיבוב ${n} מתוך ${of}`, micOff: "אמרו בקול, ואז שמעו ובדקו בעצמכם", useMic: "לשחק עם מיקרופון", micOn: "המיקרופון פועל. לחצו כדי לכבות",
  },
  en: {
    title: "The Letter Wheel", desc: "Spin the wheels and say the letter with its vowel out loud",
    spin: "Spin", sayIt: "Say it out loud", listening: "Listening", checking: "One moment",
    right: "Exactly right", other: "We heard another sound. Listen, then say it again", notHeard: "We did not hear you. Say it again, close to the device",
    tryAgain: "Say it again", hearIt: "Hear it", iSaidIt: "I said it, now play it", saidRight: "I said it right", oneMore: "Once more",
    next: "Next spin", finish: "Done", done: "You read {n} right",
    round: (n, of) => `Spin ${n} of ${of}`, micOff: "Say it out loud, then listen and check yourself", useMic: "Play with the microphone", micOn: "The microphone is on. Tap to turn it off",
  },
};
export const letterWheelCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

/**
 * One short recording that ends by itself: it waits for a voice, and stops
 * about half a second after the voice does (or after 4 seconds). The stream is
 * opened once and kept for the whole game, so the browser asks only once.
 */
function useEar() {
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const live = useRef<{ stop: () => void } | null>(null);
  const [level, setLevel] = useState(0);

  const open = useCallback(async (): Promise<boolean> => {
    if (stream.current) return true;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return false;
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      return true;
    } catch { return false; }
  }, []);

  const close = useCallback(() => {
    live.current?.stop(); live.current = null;
    stream.current?.getTracks().forEach((tr) => tr.stop()); stream.current = null;
    void ctx.current?.close().catch(() => {}); ctx.current = null;
  }, []);
  useEffect(() => close, [close]);

  /** Resolves with the clip, or null when no voice came or the recording was cancelled. */
  const listen = useCallback((): Promise<Blob | null> => {
    const s = stream.current;
    if (!s) return Promise.resolve(null);
    return new Promise((resolve) => {
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported?.(m)) ?? "";
      let rec: MediaRecorder;
      try { rec = new MediaRecorder(s, mime ? { mimeType: mime } : undefined); } catch { resolve(null); return; }
      const chunks: Blob[] = [];
      let voiced = false, cancelled = false, quietSince = 0, raf = 0;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!ctx.current) ctx.current = new AC();
      void ctx.current.resume().catch(() => {});
      const src = ctx.current.createMediaStreamSource(s);
      const an = ctx.current.createAnalyser(); an.fftSize = 1024;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      const end = () => { cancelAnimationFrame(raf); clearTimeout(cap); try { src.disconnect(); } catch { /* gone */ } if (rec.state !== "inactive") rec.stop(); };
      const cap = setTimeout(end, 4000);
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        setLevel(Math.min(1, rms * 6));
        const now = performance.now();
        if (rms > 0.045) { voiced = true; quietSince = 0; }
        else if (voiced) { if (!quietSince) quietSince = now; else if (now - quietSince > 550) { end(); return; } }
        raf = requestAnimationFrame(tick);
      };
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => { live.current = null; setLevel(0); resolve(cancelled || !voiced || !chunks.length ? null : new Blob(chunks, { type: rec.mimeType || mime || "audio/webm" })); };
      live.current = { stop: () => { cancelled = true; end(); } };
      rec.start();
      raf = requestAnimationFrame(tick);
    });
  }, []);

  const cancel = useCallback(() => { live.current?.stop(); }, []);
  return { open, close, listen, cancel, level };
}

type Phase = "ready" | "spinning" | "say" | "listening" | "checking" | "right" | "other" | "silent" | "self" | "selfHeard";
const MODE_KEY = "gadit-wheel-mic";

export function GameLetterWheel({ onExit, lang, t }: { onExit: () => void; lang: string; t: PlayT }) {
  const c = letterWheelCopy(lang);
  const { user, plan } = useAuth();
  const paid = plan === "clear" || plan === "deep";
  const { speak, stop: stopSpeech } = useSpeech();
  const { open: openEar, close: closeEar, listen, cancel: cancelEar, level } = useEar();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [land, setLand] = useState<{ l: number; s: number } | null>(null);
  const [rot, setRot] = useState({ outer: 0, inner: 0 });
  // The microphone is used when the plan has it and the child did not turn it off
  // (the game is opened by a tap, so reading the saved choice here is safe).
  const [micWanted, setMic] = useState(() => { try { return localStorage.getItem(MODE_KEY) !== "off"; } catch { return true; } });
  const mic = paid && micWanted;
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);


  const syllable = land ? LETTERS[land.l] + SIGNS[land.s].mark : "";
  const want: Vowel = land ? SIGNS[land.s].v : "a";
  // What the voice is asked to say, where the written syllable comes out wrong
  // (each checked against the recordings, 2026-11-12): a lone hirik is clipped
  // ("d" for דִ), so it is said with its yod; a kubutz with no letter after it is
  // read as another vowel, so it is said as the shuruk it sounds like; and צֶ
  // came back silent five times, so it is said as צֵ, the same sound.
  const sayText = ((): string => {
    if (!land) return "";
    const letter = LETTERS[land.l], mark = SIGNS[land.s].mark;
    if (mark === "ִ") return `${syllable}י`;
    if (mark === "ֻ" && letter !== "ו") return `${letter}וּ`;
    if (letter === "צ" && mark === "ֶ") return `${letter}ֵ`;
    return syllable;
  })();

  const hear = async () => {
    setPhase("listening");
    const clip = await listen();
    if (!alive.current) return;
    if (!clip || !user) { setPhase("silent"); return; }
    setPhase("checking");
    try {
      const fd = new FormData(); fd.append("audio", clip); fd.append("want", want);
      const r = await fetch("/api/play/say-vowel", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` }, body: fd });
      if (!alive.current) return;
      if (!r.ok) { setMic(false); setPhase("self"); return; } // no ear right now: the child checks themselves
      const j = (await r.json()) as { ok?: boolean; vowel?: Vowel | null };
      if (j.ok) {
        setScore((n) => n + 1);
        setPhase("right"); sfx.correct();
        void speak(sayText);
      } else if (!j.vowel) {
        setPhase("silent");
      } else {
        setMisses((n) => n + 1);
        setPhase("other");
        void speak(sayText);
      }
    } catch { if (alive.current) { setMic(false); setPhase("self"); } }
  };

  const spin = async () => {
    if (phase === "spinning") return;
    stopSpeech();
    let l = 0, s = 0;
    do { l = Math.floor(Math.random() * LETTERS.length); s = Math.floor(Math.random() * SIGNS.length); } while (!valid(l, s) || (land && l === land.l));
    setMisses(0);
    setPhase("spinning");
    sfx.tap();
    // The wheels turn against each other and stop with the chosen slices under the pointer.
    setRot((r) => {
      const toO = (-l * 360) / LETTERS.length, toI = (-s * 360) / SIGNS.length;
      const fwd = (from: number, to: number) => from + 1080 + ((((to - from) % 360) + 360) % 360);
      const back = (from: number, to: number) => from - 1080 - ((((from - to) % 360) + 360) % 360);
      return { outer: fwd(r.outer, toO), inner: back(r.inner, toI) };
    });
    let useMic = mic;
    if (useMic) { useMic = await openEar(); if (!useMic) setMic(false); }
    await new Promise((res) => setTimeout(res, 2700));
    if (!alive.current) return;
    setLand({ l, s });
    sfx.magic();
    setPhase(useMic ? "say" : "self");
  };

  // Listening starts by itself, half a second after the syllable shows.
  const hearRef = useRef(hear);
  useEffect(() => { hearRef.current = hear; });
  useEffect(() => {
    if (phase !== "say") return;
    const tm = setTimeout(() => void hearRef.current(), 500);
    return () => clearTimeout(tm);
  }, [phase]);

  const next = () => {
    cancelEar(); stopSpeech();
    if (round + 1 >= ROUNDS) { setDone(true); return; }
    setRound((n) => n + 1); setPhase("ready");
  };
  const again = () => { stopSpeech(); setPhase("say"); };
  const toggleMic = async () => {
    if (mic) {
      cancelEar(); closeEar(); setMic(false);
      try { localStorage.setItem(MODE_KEY, "off"); } catch { /* this visit */ }
      if (land && phase !== "ready" && phase !== "spinning") setPhase("self");
      return;
    }
    if (await openEar()) {
      setMic(true);
      try { localStorage.removeItem(MODE_KEY); } catch { /* this visit */ }
      if (land && (phase === "self" || phase === "selfHeard")) setPhase("say");
    }
  };

  const outerLabels = useMemo(() => LETTERS.map((ch, i) => ({ ch, a: (i * 360) / LETTERS.length })), []);
  const innerLabels = useMemo(() => SIGNS.map((g, i) => ({ g, a: (i * 360) / SIGNS.length })), []);

  if (done) {
    return (
      <GameResult
        data={{ title: c.title, score, total: ROUNDS, headline: c.done.replace("{n}", String(score)) }}
        onExit={onExit}
        onReplay={() => { setRound(0); setScore(0); setLand(null); setPhase("ready"); setDone(false); }}
        lang={lang}
        t={t}
      />
    );
  }

  const shown = !!land && phase !== "ready" && phase !== "spinning";
  const last = round + 1 >= ROUNDS;
  return (
    <div className="wb-play-stage lwh">
      <style>{LWH_CSS}</style>
      <PlayHeader title={c.title} progress={c.round(round + 1, ROUNDS)} score={score} onExit={onExit} t={t} />
      <div className="wb-play-question lwh-q">
        <div className="lwh-wheel" aria-hidden="true">
          <div className="lwh-pointer" />
          <div className="lwh-ring lwh-outer" style={{ transform: `rotate(${rot.outer}deg)` }}>
            {outerLabels.map(({ ch, a }, i) => (
              <span key={i} className={`lwh-slot${shown && land?.l === i ? " is-on" : ""}`} style={{ transform: `rotate(${a}deg) translateY(calc(var(--lwh-r) * -0.82))` }} lang="he">{ch}</span>
            ))}
          </div>
          <div className="lwh-ring lwh-inner" style={{ transform: `rotate(${rot.inner}deg)` }}>
            {innerLabels.map(({ g, a }, i) => (
              <span key={i} className={`lwh-slot lwh-sign${shown && land?.s === i ? " is-on" : ""}`} style={{ transform: `rotate(${a}deg) translateY(calc(var(--lwh-r) * -0.435))` }} lang="he">{g.mark.length === 1 ? <SignGlyph v={g.draw} /> : g.show}</span>
            ))}
          </div>
          <div className="lwh-hub" />
        </div>

        <div className="lwh-under">
          {!shown ? (
            <button type="button" className="lwh-btn lwh-spin" onClick={() => void spin()} disabled={phase === "spinning"}>{c.spin}</button>
          ) : (
            <>
              <div className={`lwh-syl is-${phase}`} lang="he" dir="rtl">{syllable}</div>
              {(phase === "say" || phase === "listening") && (
                <div className="lwh-note"><span className="lwh-mic" style={{ ["--lv" as string]: String(level) }}>🎤</span> {phase === "say" ? c.sayIt : c.listening}</div>
              )}
              {phase === "checking" && <div className="lwh-note">{c.checking}</div>}
              {phase === "right" && (
                <>
                  <div className="lwh-note is-good">{c.right}</div>
                  <div className="lwh-row"><button type="button" className="lwh-btn" onClick={next}>{last ? c.finish : c.next}</button></div>
                </>
              )}
              {phase === "other" && (
                <>
                  <div className="lwh-note">{c.other}</div>
                  <div className="lwh-row">
                    <button type="button" className="lwh-btn is-ghost" onClick={() => void speak(sayText)}>🔊 {c.hearIt}</button>
                    {misses < 2
                      ? <button type="button" className="lwh-btn" onClick={again}>🎤 {c.tryAgain}</button>
                      : <button type="button" className="lwh-btn" onClick={next}>{last ? c.finish : c.next}</button>}
                  </div>
                </>
              )}
              {phase === "silent" && (
                <>
                  <div className="lwh-note">{c.notHeard}</div>
                  <div className="lwh-row">
                    <button type="button" className="lwh-btn" onClick={again}>🎤 {c.tryAgain}</button>
                    <button type="button" className="lwh-btn is-ghost" onClick={() => setPhase("self")}>{c.iSaidIt}</button>
                  </div>
                </>
              )}
              {phase === "self" && (
                <>
                  <div className="lwh-note">{c.micOff}</div>
                  <div className="lwh-row"><button type="button" className="lwh-btn" onClick={() => { void speak(sayText).then(() => { if (alive.current) setPhase("selfHeard"); }); }}>🔊 {c.iSaidIt}</button></div>
                </>
              )}
              {phase === "selfHeard" && (
                <div className="lwh-row">
                  <button type="button" className="lwh-btn is-ghost" onClick={() => void speak(sayText)}>🔊 {c.oneMore}</button>
                  <button type="button" className="lwh-btn" onClick={() => { sfx.correct(); setScore((n) => n + 1); next(); }}>{c.saidRight}</button>
                  <button type="button" className="lwh-btn is-ghost" onClick={next}>{last ? c.finish : c.next}</button>
                </div>
              )}
            </>
          )}
        </div>
        {paid && (
          <button type="button" className="lwh-mode" onClick={() => void toggleMic()}>🎤 {mic ? c.micOn : c.useMic}</button>
        )}
      </div>
    </div>
  );
}

const LWH_CSS = `
.lwh .lwh-q { display: grid; gap: 14px; justify-items: center; }
.lwh-wheel { --lwh-r: min(40vw, 170px); position: relative; width: calc(var(--lwh-r) * 2); height: calc(var(--lwh-r) * 2); margin-top: 18px; }
.lwh-ring { position: absolute; border-radius: 50%; transition: transform 2600ms cubic-bezier(0.12, 0.72, 0.1, 1); }
.lwh-outer { inset: 0; background: repeating-conic-gradient(from -8.1818deg, #fff3c9 0 16.3636deg, #ffe08a 16.3636deg 32.7272deg); box-shadow: 0 0 0 6px #c2410c, 0 10px 24px #0006, inset 0 0 0 2px #fff8; }
.lwh-inner { inset: calc(var(--lwh-r) * 0.36); background: repeating-conic-gradient(from -22.5deg, #d9f3ff 0 45deg, #a9defa 45deg 90deg); box-shadow: 0 0 0 5px #0369a1, 0 4px 12px #0005; }
.lwh-slot { position: absolute; left: 50%; top: 50%; width: 0; height: 0; display: grid; place-items: center; font-family: var(--wb-font-display, inherit); font-weight: 800; font-size: calc(var(--lwh-r) * 0.17); line-height: 1; color: #3b2a12; white-space: nowrap; }
.lwh-sign { font-size: calc(var(--lwh-r) * 0.2); color: #0c3a5a; }
.lwh-glyph { width: 1.2em; height: 1.38em; display: block; }
.lwh-slot.is-on { color: #b91c1c; }
.lwh-hub { position: absolute; left: 50%; top: 50%; width: calc(var(--lwh-r) * 0.2); height: calc(var(--lwh-r) * 0.2); margin: calc(var(--lwh-r) * -0.1); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff, #f59e0b 60%, #b45309); box-shadow: 0 3px 8px #0006; }
.lwh-pointer { position: absolute; left: 50%; top: -18px; z-index: 2; width: 0; height: 0; margin-left: -13px; border-left: 13px solid transparent; border-right: 13px solid transparent; border-top: 26px solid #dc2626; filter: drop-shadow(0 3px 3px #0006); }
.lwh-under { display: grid; justify-items: center; gap: 10px; min-height: 170px; align-content: start; }
.lwh-syl { font-family: var(--wb-font-display, inherit); font-size: clamp(64px, 20vw, 96px); font-weight: 800; line-height: 1.5; color: #14202b; padding: 0 28px; border-radius: 24px; background: #fff; box-shadow: 0 0 0 3px #e7dfc8 inset; }
.lwh-syl.is-right { background: #dcfce7; box-shadow: 0 0 0 3px #4ade80 inset; }
.lwh-note { font-size: 18px; font-weight: 700; color: #14202b; text-align: center; display: inline-flex; align-items: center; gap: 8px; }
.lwh-note.is-good { color: #166534; }
.lwh-mic { display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: #fee2e2; box-shadow: 0 0 0 calc(var(--lv, 0) * 14px) #fca5a566; transition: box-shadow 80ms; }
.lwh-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.lwh-btn { min-height: 52px; padding: 12px 26px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
.lwh-btn.is-ghost { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset; }
.lwh-btn:disabled { opacity: 0.6; cursor: default; }
.lwh-spin { font-size: 22px; padding: 14px 38px; background: #c2410c; box-shadow: 0 4px 0 #7c2d12, 0 8px 16px #0004; }
.lwh-mode { border: 0; background: transparent; color: #0a5c5a; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: underline; }
@media (prefers-reduced-motion: reduce) { .lwh-ring { transition-duration: 300ms; } }
`;
