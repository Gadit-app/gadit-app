"use client";

/**
 * "Reading in syllables" (Gadi 2026-11-11, for Shirli's son, 9: he knows
 * every letter and vowel sign but cannot yet blend them into a word, and is
 * already afraid of reading). One word at a time from the Hebrew bank, with
 * its picture. Three steps, none of which can be failed:
 *
 *   1. Listen: the word's syllables are stones. Tapping a stone sounds it;
 *      tapping them in order lights the whole word, which is then read aloud
 *      and its picture appears.
 *   2. Build: the word is heard; the child picks the next syllable from two
 *      stones. A wrong stone is sounded too, then the right one, and nothing
 *      turns red.
 *   3. Read: the word with its syllables faintly marked. The child reads it
 *      out loud, then taps to hear it and decides for themselves.
 *
 * Six words a session, from two open syllables up, with a level per profile
 * that climbs one step each finished session. Audio is the app's Hebrew
 * voice (/api/tts, Gemini Aoede, cached per string) with Web Speech as the
 * free fallback.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import { shuffle } from "@/lib/play-engine";
import { HEBREW_BANK } from "@/lib/learn/hebrew-bank";
import { readingLevel, syllabify } from "@/lib/hebrew-syllables";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";

const WORDS_PER_SESSION = 6;
const LEVEL_KEY = "gadit-syllables-level";

type Copy = {
  title: string; desc: string;
  listen: string; listenHint: string; build: string; buildHint: string; read: string; readHint: string;
  hear: string; heardMe: string; yesRead: string; again: string; next: string; finish: string;
  done: string; step: (n: number, of: number) => string; level: (n: number) => string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "קוראים בהברות", desc: "מילה אחת, הברה אחרי הברה: שומעים, בונים, וקוראים לבד",
    listen: "שומעים", listenHint: "לוחצים על האבנים לפי הסדר ושומעים כל הברה",
    build: "בונים", buildHint: "שמעו את המילה. איזו הברה באה עכשיו?",
    read: "קוראים", readHint: "קראו את המילה בקול. אחר כך לחצו ושמעו",
    hear: "לשמוע שוב", heardMe: "קראתי, עכשיו תשמיעו לי", yesRead: "קראתי נכון", again: "עוד פעם מההתחלה",
    next: "למילה הבאה", finish: "סיימנו", done: "קראתם {n} מילים לבד",
    step: (n, of) => `מילה ${n} מתוך ${of}`, level: (n) => `רמה ${n}`,
  },
  en: {
    title: "Syllable Reader", desc: "One word, syllable by syllable: listen, build, then read it yourself",
    listen: "Listen", listenHint: "Tap the stones in order and hear each syllable",
    build: "Build", buildHint: "Hear the word. Which syllable comes next?",
    read: "Read", readHint: "Read the word out loud, then tap to hear it",
    hear: "Hear it again", heardMe: "I read it, now play it", yesRead: "I read it right", again: "Once more from the start",
    next: "Next word", finish: "Done", done: "You read {n} words by yourself",
    step: (n, of) => `Word ${n} of ${of}`, level: (n) => `Level ${n}`,
  },
  ar: {
    title: "القراءة بالمقاطع", desc: "كلمة واحدة، مقطعًا بعد مقطع: نسمع، نبني، ثم نقرأ وحدنا",
    listen: "نسمع", listenHint: "اضغط على الحجارة بالترتيب واسمع كل مقطع",
    build: "نبني", buildHint: "اسمع الكلمة. أي مقطع يأتي الآن؟",
    read: "نقرأ", readHint: "اقرأ الكلمة بصوت عالٍ، ثم اضغط لتسمعها",
    hear: "اسمع مرة أخرى", heardMe: "قرأتها، شغّلها الآن", yesRead: "قرأتها صحيحة", again: "مرة أخرى من البداية",
    next: "الكلمة التالية", finish: "انتهينا", done: "قرأت {n} كلمات وحدك",
    step: (n, of) => `الكلمة ${n} من ${of}`, level: (n) => `المستوى ${n}`,
  },
  ru: {
    title: "Читаем по слогам", desc: "Одно слово, слог за слогом: слушаем, собираем, читаем сами",
    listen: "Слушаем", listenHint: "Нажимай на камни по порядку и слушай каждый слог",
    build: "Собираем", buildHint: "Послушай слово. Какой слог следующий?",
    read: "Читаем", readHint: "Прочитай слово вслух, потом нажми и послушай",
    hear: "Послушать ещё раз", heardMe: "Я прочитал, теперь включи", yesRead: "Я прочитал правильно", again: "Ещё раз сначала",
    next: "Следующее слово", finish: "Готово", done: "Ты сам прочитал {n} слов",
    step: (n, of) => `Слово ${n} из ${of}`, level: (n) => `Уровень ${n}`,
  },
};
export const syllablesCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

type Item = { w: string; nq: string; en: string; syl: string[]; level: number };

/** The bank words a child can sound out: one word, two syllables or more, with a picture word. */
function bankItems(): Item[] {
  const out: Item[] = [];
  for (const x of HEBREW_BANK) {
    if (!x.nq || /[\s-]/.test(x.nq) || !x.en) continue;
    const syl = syllabify(x.nq);
    if (syl.length < 2) continue;
    out.push({ w: x.w, nq: x.nq, en: x.en, syl, level: readingLevel(syl) });
  }
  return out;
}

/** A session: six words at the child's level (a few from the level below), easiest first. */
function pickSession(items: Item[], level: number): Item[] {
  const at = shuffle(items.filter((x) => x.level === level));
  const below = shuffle(items.filter((x) => x.level === level - 1));
  const picked = [...at.slice(0, WORDS_PER_SESSION - 2), ...below.slice(0, 2)];
  if (picked.length < WORDS_PER_SESSION) picked.push(...shuffle(items.filter((x) => !picked.includes(x))).slice(0, WORDS_PER_SESSION - picked.length));
  return picked.slice(0, WORDS_PER_SESSION).sort((a, b) => a.level - b.level || a.syl.length - b.syl.length);
}

const readLevel = (uid: string | undefined): number => {
  try { const n = Number(localStorage.getItem(`${LEVEL_KEY}:${uid ?? "anon"}`)); return n >= 1 && n <= 5 ? n : 1; } catch { return 1; }
};
const writeLevel = (uid: string | undefined, n: number) => { try { localStorage.setItem(`${LEVEL_KEY}:${uid ?? "anon"}`, String(n)); } catch { /* this visit only */ } };

/**
 * Hebrew speech for short strings: the app's voice when the account has it,
 * else the device's. Each string is fetched once per visit.
 */
function useSpeech() {
  const { user } = useAuth();
  const cache = useRef(new Map<string, Promise<string | null>>());
  const current = useRef<HTMLAudioElement | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const fetchUrl = useCallback((text: string): Promise<string | null> => {
    const hit = cache.current.get(text);
    if (hit) return hit;
    const p = (async () => {
      if (!user) return null;
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ text, lang: "he" }),
        });
        if (!res.ok) return null;
        return URL.createObjectURL(await res.blob());
      } catch { return null; }
    })();
    cache.current.set(text, p);
    return p;
  }, [user]);

  const stop = useCallback(() => {
    if (current.current) { current.current.pause(); current.current = null; }
    try { window.speechSynthesis?.cancel(); } catch { /* no engine */ }
    setSpeaking(null);
  }, []);

  /** Speaks `text` and resolves when it ends. */
  const speak = useCallback(async (text: string) => {
    stop();
    setSpeaking(text);
    const url = await fetchUrl(text);
    // Never wait on a sound that does not end (a device voice with no Hebrew,
    // a blocked autoplay): the game moves on after a short while regardless.
    await new Promise<void>((resolve) => {
      const tm = setTimeout(resolve, url ? 6000 : 2500);
      const done = () => { clearTimeout(tm); resolve(); };
      if (url) {
        const a = new Audio(url);
        current.current = a;
        a.onended = done;
        a.onerror = done;
        a.play().catch(done);
        return;
      }
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "he-IL"; u.rate = 0.8;
        u.onend = done; u.onerror = done;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch { done(); }
    });
    setSpeaking((s) => (s === text ? null : s));
  }, [fetchUrl, stop]);

  const warm = useCallback((texts: string[]) => { for (const t of texts) void fetchUrl(t); }, [fetchUrl]);
  useEffect(() => () => stop(), [stop]);
  return { speak, stop, warm, speaking };
}

export function GameSyllables({ onExit, lang, t }: { onExit: () => void; lang: string; t: PlayT }) {
  const c = syllablesCopy(lang);
  const { user } = useAuth();
  const items = useMemo(bankItems, []);
  const [level] = useState(() => readLevel(user?.uid));
  const [seed, setSeed] = useState(0);
  const session = useMemo(() => pickSession(items, level), [items, level, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pics, setPics] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const speech = useSpeech();
  const word = session[idx];

  // The pictures of the session's words (house style, already drawn).
  useEffect(() => {
    if (!user || !session.length) return;
    let alive = true;
    void (async () => {
      try {
        const r = await fetch("/api/play/images", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ words: session.map((x) => x.en), pick: true }),
        });
        const got = r.ok ? (((await r.json()) as { images?: Record<string, string> }).images ?? {}) : {};
        if (!alive) return;
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(got)) out[k.toLowerCase()] = v;
        setPics(out);
      } catch { /* words without pictures still play */ }
    })();
    return () => { alive = false; };
  }, [user, session]);

  // The next word's sounds are fetched while this one plays.
  useEffect(() => {
    const w = session[idx]; const n = session[idx + 1];
    if (w) speech.warm([...w.syl, w.nq]);
    if (n) speech.warm([...n.syl, n.nq]);
  }, [idx, session, speech]);

  const finishWord = () => {
    if (idx + 1 >= session.length) {
      writeLevel(user?.uid, Math.min(5, level + 1));
      setDone(true);
    } else { setIdx((i) => i + 1); setStep(1); }
  };

  if (done) {
    return (
      <GameResult
        data={{ title: c.title, score: session.length, total: session.length, headline: c.done.replace("{n}", String(session.length)) }}
        onExit={onExit}
        onReplay={() => { setSeed((s) => s + 1); setIdx(0); setStep(1); setDone(false); }}
        lang={lang}
        t={t}
      />
    );
  }
  if (!word) return null;
  const pic = pics[word.en.toLowerCase()];
  const stepLabel = step === 1 ? c.listen : step === 2 ? c.build : c.read;
  return (
    <div className="wb-play-stage syl">
      <style>{SYL_CSS}</style>
      <PlayHeader title={`${c.title} · ${stepLabel}`} progress={c.step(idx + 1, session.length)} onExit={onExit} t={t} />
      <div className="wb-play-question syl-q">
        <div className="syl-steps" aria-hidden="true">
          {[1, 2, 3].map((n) => <span key={n} className={n < step ? "is-done" : n === step ? "is-on" : ""} />)}
        </div>
        <div className="wb-play-question-eyebrow">{step === 1 ? c.listenHint : step === 2 ? c.buildHint : c.readHint}</div>
        {step === 1 && <StepListen key={`l${idx}`} word={word} pic={pic} c={c} speech={speech} onDone={() => setStep(2)} />}
        {step === 2 && <StepBuild key={`b${idx}`} word={word} others={session.filter((x) => x !== word)} pic={pic} c={c} speech={speech} onDone={() => setStep(3)} />}
        {step === 3 && <StepRead key={`r${idx}`} word={word} pic={pic} c={c} speech={speech} last={idx + 1 >= session.length} onAgain={() => setStep(1)} onDone={finishWord} />}
      </div>
    </div>
  );
}

type Speech = ReturnType<typeof useSpeech>;

function Stone({ text, state, onTap, speaking }: { text: string; state: "idle" | "next" | "lit" | "dim"; onTap?: () => void; speaking: boolean }) {
  return (
    <button type="button" className={`syl-stone is-${state}${speaking ? " is-speaking" : ""}`} onClick={onTap} disabled={!onTap} lang="he" dir="rtl">
      {text}
    </button>
  );
}

function Picture({ pic, nq, shown }: { pic?: string; nq: string; shown: boolean }) {
  if (!pic) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`syl-pic${shown ? " is-shown" : ""}`} src={pic} alt={nq} width={200} height={200} draggable={false} />;
}

/** Step 1: tap the stones in order; each sounds; then the whole word and its picture. */
function StepListen({ word, pic, c, speech, onDone }: { word: Item; pic?: string; c: Copy; speech: Speech; onDone: () => void }) {
  const [lit, setLit] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const busy = useRef(false);
  const tap = async (i: string, k: number) => {
    if (busy.current) return;
    busy.current = true;
    sfx.tap();
    await speech.speak(i);
    if (k === lit) {
      const n = lit + 1;
      setLit(n);
      if (n === word.syl.length) {
        await speech.speak(word.nq);
        setRevealed(true);
        sfx.magic();
      }
    }
    busy.current = false;
  };
  return (
    <>
      <div className="syl-stones" dir="rtl">
        {word.syl.map((s, k) => (
          <Stone key={k} text={s} speaking={speech.speaking === s} state={k < lit ? "lit" : k === lit ? "next" : "idle"} onTap={() => void tap(s, k)} />
        ))}
      </div>
      <div className="syl-reveal">
        <Picture pic={pic} nq={word.nq} shown={revealed} />
        {revealed && (
          <>
            <div className="syl-word" lang="he" dir="rtl">{word.nq}</div>
            <div className="syl-row">
              <button type="button" className="syl-btn is-ghost" onClick={() => void speech.speak(word.nq)}>{c.hear}</button>
              <button type="button" className="syl-btn" onClick={onDone}>{c.build} ←</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** Step 2: hear the word, then pick each next syllable out of two. */
function StepBuild({ word, others, pic, c, speech, onDone }: { word: Item; others: Item[]; pic?: string; c: Copy; speech: Speech; onDone: () => void }) {
  const [placed, setPlaced] = useState(0);
  const [complete, setComplete] = useState(false);
  const busy = useRef(false);
  // The two stones for each slot: the right syllable and one from another word of the session.
  const choices = useMemo(() => {
    const pool = others.flatMap((x) => x.syl).filter((s) => !word.syl.includes(s));
    return word.syl.map((s, k) => {
      const d = pool.length ? pool[(k * 7 + word.nq.length) % pool.length] : word.syl[(k + 1) % word.syl.length];
      return shuffle([s, d]);
    });
  }, [word, others]);
  useEffect(() => { const tm = setTimeout(() => void speech.speak(word.nq), 400); return () => clearTimeout(tm); }, [word, speech]);
  const pick = async (s: string) => {
    if (busy.current || complete) return;
    busy.current = true;
    const want = word.syl[placed];
    await speech.speak(s);
    if (s === want) {
      sfx.correct();
      const n = placed + 1;
      setPlaced(n);
      if (n === word.syl.length) { await speech.speak(word.nq); setComplete(true); sfx.magic(); }
    } else {
      // Not red, not a buzzer: the right syllable is simply heard right after.
      await speech.speak(want);
    }
    busy.current = false;
  };
  return (
    <>
      <div className="syl-row syl-row-top">
        <button type="button" className="syl-btn is-ghost" onClick={() => void speech.speak(word.nq)}>🔊 {c.hear}</button>
      </div>
      <div className="syl-stones syl-built" dir="rtl">
        {word.syl.map((s, k) => (
          <Stone key={k} text={k < placed ? s : "…"} speaking={speech.speaking === s && k < placed} state={k < placed ? "lit" : k === placed ? "next" : "idle"} />
        ))}
      </div>
      {!complete && placed < word.syl.length && (
        <div className="syl-stones syl-choices" dir="rtl">
          {choices[placed].map((s) => <Stone key={s} text={s} speaking={speech.speaking === s} state="idle" onTap={() => void pick(s)} />)}
        </div>
      )}
      <div className="syl-reveal">
        <Picture pic={pic} nq={word.nq} shown={complete} />
        {complete && (
          <div className="syl-row">
            <button type="button" className="syl-btn" onClick={onDone}>{c.read} ←</button>
          </div>
        )}
      </div>
    </>
  );
}

/** Step 3: read it out loud, then hear it and decide. */
function StepRead({ word, pic, c, speech, last, onAgain, onDone }: { word: Item; pic?: string; c: Copy; speech: Speech; last: boolean; onAgain: () => void; onDone: () => void }) {
  const [heard, setHeard] = useState(false);
  return (
    <>
      <div className="syl-word syl-word-big" lang="he" dir="rtl">
        {word.syl.map((s, k) => <span key={k} className="syl-part">{s}</span>)}
      </div>
      <Picture pic={pic} nq={word.nq} shown={heard} />
      {!heard ? (
        <div className="syl-row">
          <button type="button" className="syl-btn" onClick={() => { void speech.speak(word.nq).then(() => setHeard(true)); }}>🔊 {c.heardMe}</button>
        </div>
      ) : (
        <div className="syl-row">
          <button type="button" className="syl-btn is-ghost" onClick={onAgain}>{c.again}</button>
          <button type="button" className="syl-btn" onClick={() => { sfx.correct(); onDone(); }}>{c.yesRead} · {last ? c.finish : c.next}</button>
        </div>
      )}
    </>
  );
}

const SYL_CSS = `
.syl .syl-q { display: grid; gap: 14px; justify-items: center; }
.syl-steps { display: inline-flex; gap: 8px; }
.syl-steps span { width: 12px; height: 12px; border-radius: 50%; background: #d7d2c6; }
.syl-steps span.is-done { background: #10B981; }
.syl-steps span.is-on { background: var(--accent, #0EA5A5); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent, #0EA5A5) 30%, transparent); }
.syl-stones { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px; margin-top: 6px; }
.syl-choices { margin-top: 10px; padding-top: 14px; border-top: 2px dashed #d7d2c6; width: 100%; }
/* a syllable is a stone on the ground, like the words in Context Detective */
.syl-stone { min-width: 88px; min-height: 72px; padding: 0 22px; border: 0; border-radius: 26px 20px 28px 18px; font-family: var(--wb-font-display, inherit); font-size: clamp(30px, 8vw, 40px); font-weight: 800; line-height: 1; color: #2b2418; cursor: pointer;
  background: radial-gradient(120% 90% at 30% 25%, #f4f1ea, #cfc8b8 70%, #a9a190); box-shadow: 0 6px 0 #7d7565, 0 10px 16px #0005; transition: transform 140ms, filter 140ms; }
.syl-stone:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #7d7565, 0 4px 8px #0005; }
.syl-stone:disabled { cursor: default; }
.syl-stone.is-next { box-shadow: 0 6px 0 #7d7565, 0 10px 16px #0005, 0 0 0 5px #ffd23f99; }
.syl-stone.is-lit { background: radial-gradient(120% 90% at 30% 25%, #d9f7e6, #8fd19e 70%, #4caf7a); color: #0f3d24; box-shadow: 0 6px 0 #2f7a4a, 0 10px 16px #0005; }
.syl-stone.is-speaking { filter: brightness(1.12); transform: translateY(-3px) scale(1.04); }
.syl-reveal { display: grid; justify-items: center; gap: 12px; min-height: 40px; }
.syl-pic { width: clamp(140px, 40vw, 200px); height: auto; border-radius: 22px; box-shadow: 0 10px 24px #0004; opacity: 0; transform: scale(0.85); transition: opacity 400ms, transform 400ms; }
.syl-pic.is-shown { opacity: 1; transform: scale(1); }
.syl-word { font-family: var(--wb-font-display, inherit); font-size: clamp(34px, 9vw, 48px); font-weight: 800; color: var(--wb-ink, #0f172a); line-height: 1.3; }
.syl-word-big { font-size: clamp(44px, 12vw, 64px); display: flex; gap: 0.18em; padding: 10px 18px; }
.syl-part { position: relative; }
.syl-part + .syl-part::before { content: "·"; position: absolute; inset-inline-start: -0.2em; top: 0.1em; font-size: 0.5em; color: #b8b0a0; }
.syl-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.syl-row-top { margin-bottom: 4px; }
.syl-btn { min-height: 52px; padding: 12px 26px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
.syl-btn.is-ghost { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset; }
@media (prefers-reduced-motion: reduce) { .syl-pic, .syl-stone { transition: none; } }
`;
