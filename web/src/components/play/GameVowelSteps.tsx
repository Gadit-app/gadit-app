"use client";

/**
 * "The sound of the vowel signs" (Gadi 2026-11-13, from a coach's note about a
 * girl in 2nd grade who reads every word with patah): the step below the
 * Letter Wheel. One vowel at a time, by ear first.
 *
 * Five steps, in this order: a (the one such a child already says), i, o, u,
 * e. A step opens with the signs of its vowel, their names and what they say.
 * Then the child hears a syllable and finds it among two or three that differ
 * only in the vowel; only after that they say a few out loud and check
 * themselves. The first step has one vowel only, so it asks for the letter.
 *
 * Nothing turns red. A different choice plays what was tapped and then what
 * was asked, and the child taps again. A short check (ten sounds, no feedback)
 * finds which vowels are known and puts the child on the right step. The step
 * is kept on the account (/api/play/first-steps), so a coach who enters the
 * child's profile from another device finds it.
 *
 * The sounds are the wheel's recordings: the same text is sent to /api/tts.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useSpeech } from "./GameSyllables";

type V = "a" | "i" | "o" | "u" | "e";
const ORDER: V[] = ["a", "i", "o", "u", "e"];
const MARKS: Record<V, string[]> = { a: ["ַ", "ָ"], i: ["ִ"], o: ["וֹ"], u: ["וּ", "ֻ"], e: ["ֵ", "ֶ"] };
// Letters whose sound is clear at the start of a syllable (with their dagesh
// or dot where a first reader meets them that way).
const LETTERS = ["מ", "ל", "נ", "ס", "ר", "שׁ", "ז", "ד", "ג", "ט", "ק", "בּ", "תּ"];
const LISTEN_ROUNDS = 8;
const SAY_ROUNDS = 3;
const PASS = 6;
const CHECK_ROUNDS = 10;

// What the voice is asked to say (the wheel's rules, so its checked recordings
// are the ones that play): a lone hirik is said with its yod, a kubutz as the
// shuruk it sounds like.
function sayOf(letter: string, mark: string): string {
  if (mark === "ִ") return `${letter}${mark}י`;
  if (mark === "ֻ") return `${letter}וּ`;
  return letter + mark;
}

type Syl = { key: string; text: string; say: string; v: V };
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const syl = (letter: string, v: V, mark = pick(MARKS[v])): Syl => ({ key: `${letter}|${v}`, text: letter + mark, say: sayOf(letter, mark), v });

type Round = { target: Syl; options: Syl[] };
function makeRound(step: number, lastLetter: string): Round {
  if (step === 0) {
    // One vowel so far: the ear looks for the letter.
    const mark = pick(MARKS.a);
    const ls = shuffle(LETTERS.filter((l) => l !== lastLetter)).slice(0, 3);
    const options = ls.map((l) => ({ ...syl(l, "a", mark), key: l }));
    return { target: options[0], options: shuffle(options) };
  }
  const pool = ORDER.slice(0, step + 1);
  const v = Math.random() < 0.5 ? ORDER[step] : pick(pool);
  const letter = pick(LETTERS.filter((l) => l !== lastLetter));
  const others = shuffle(pool.filter((x) => x !== v)).slice(0, pool.length === 2 ? 1 : 2);
  const target = syl(letter, v);
  return { target, options: shuffle([target, ...others.map((o) => syl(letter, o))]) };
}
function makeCheck(): Round[] {
  const vs = shuffle([...ORDER, ...ORDER]);
  let last = "";
  return vs.map((v) => {
    const letter = pick(LETTERS.filter((l) => l !== last)); last = letter;
    const target = syl(letter, v);
    return { target, options: shuffle([target, ...shuffle(ORDER.filter((x) => x !== v)).slice(0, 2).map((o) => syl(letter, o))]) };
  });
}

type Sign = { show: string; say: string; name: string; how: string };
type StepCopy = { chip: string; line: string; signs: Sign[] };
type Copy = {
  title: string; desc: string;
  startTitle: string; fromStart: string; fromStartSub: string; check: string; checkSub: string;
  niqqud: string; steps: Record<V, StepCopy>; tapToHear: string; examples: string; begin: string;
  whichLetter: string; whichOne: string; hearAgain: string; wasOther: (s: string) => string; right: string;
  sayIt: string; iSaidIt: string; saidRight: string; oneMore: string; next: string; finish: string;
  round: (n: number, of: number) => string; checkRound: (n: number, of: number) => string; checkHint: string;
  passed: string; passedAll: string; again: string;
  checkDone: string; knows: string; startsAt: string; knowsAll: string; toStep: string; explain: string; shortCheck: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "הצליל של הניקוד", desc: "לומדים מה כל סימן ניקוד אומר, תנועה אחת בכל פעם",
    startTitle: "מאיפה מתחילים?", fromStart: "מההתחלה", fromStartSub: "תנועה אחת בכל פעם, מהראשונה",
    check: "בדיקה קצרה", checkSub: "עשרה צלילים, ורואים מה כבר יודעים",
    niqqud: "ניקוד הוא הסימנים הקטנים שליד האות. הוא אומר איזה צליל משמיעים עם האות",
    steps: {
      a: { chip: "אָ", line: "שני הסימנים האלה אומרים אָ", signs: [
        { show: "אַ", say: "אַ", name: "פַּתָּח", how: "קו קטן מתחת לאות" },
        { show: "אָ", say: "אָ", name: "קָמָץ", how: "קו עם רגל קטנה מתחת לאות" },
      ] },
      i: { chip: "אִי", line: "הסימן הזה אומר אִי", signs: [
        { show: "אִ", say: "אִי", name: "חִירִיק", how: "נקודה אחת מתחת לאות" },
      ] },
      o: { chip: "אוֹ", line: "הסימן הזה אומר אוֹ", signs: [
        { show: "אוֹ", say: "אוֹ", name: "חוֹלָם", how: "האות ו עם נקודה מעליה" },
      ] },
      u: { chip: "אוּ", line: "שני הסימנים האלה אומרים אוּ", signs: [
        { show: "אוּ", say: "אוּ", name: "שׁוּרוּק", how: "האות ו עם נקודה באמצע" },
        { show: "אֻ", say: "אוּ", name: "קֻבּוּץ", how: "שלוש נקודות באלכסון מתחת לאות" },
      ] },
      e: { chip: "אֶ", line: "שני הסימנים האלה אומרים אֶ", signs: [
        { show: "אֵ", say: "אֵ", name: "צֵירֵי", how: "שתי נקודות מתחת לאות" },
        { show: "אֶ", say: "אֶ", name: "סֶגּוֹל", how: "שלוש נקודות מתחת לאות" },
      ] },
    },
    tapToHear: "לחצו על סימן כדי לשמוע אותו", examples: "ועם אותיות אחרות", begin: "מתחילים",
    whichLetter: "הקשיבו. איזו אות שמעתם?", whichOne: "הקשיבו. מה שמעתם?", hearAgain: "לשמוע שוב",
    wasOther: (s) => `זה ${s}. הקשיבו שוב ומצאו`, right: "נכון מאוד",
    sayIt: "עכשיו אתם: אמרו בקול", iSaidIt: "אמרתי, עכשיו תשמיעו לי", saidRight: "אמרתי נכון", oneMore: "עוד פעם", next: "הלאה", finish: "סיימנו",
    round: (n, of) => `צליל ${n} מתוך ${of}`, checkRound: (n, of) => `בדיקה: ${n} מתוך ${of}`, checkHint: "הקשיבו ובחרו. אין כאן נכון ולא נכון",
    passed: "יפה מאוד! עוברים לתנועה הבאה", passedAll: "אתם מכירים את כל התנועות! אפשר לעבור לשבשבת האותיות", again: "עוד סיבוב אחד, והצליל יישב טוב",
    checkDone: "זה מה שמצאנו", knows: "כבר מכירים", startsAt: "מתחילים מכאן", knowsAll: "כל חמש התנועות מוכרות. אפשר לעבור לשבשבת האותיות",
    toStep: "מתחילים", explain: "הסבר", shortCheck: "בדיקה קצרה",
  },
  en: {
    title: "The Sound of the Vowel Signs", desc: "What each Hebrew vowel sign says, one vowel at a time",
    startTitle: "Where do we start?", fromStart: "From the beginning", fromStartSub: "One vowel at a time, from the first",
    check: "A short check", checkSub: "Ten sounds, to see what is already known",
    niqqud: "Niqqud is the small signs next to a letter. It tells which sound to make with the letter",
    steps: {
      a: { chip: "אָ", line: "Both of these signs say AH", signs: [
        { show: "אַ", say: "אַ", name: "Patah", how: "a short line under the letter" },
        { show: "אָ", say: "אָ", name: "Kamatz", how: "a line with a small leg under the letter" },
      ] },
      i: { chip: "אִי", line: "This sign says EE", signs: [{ show: "אִ", say: "אִי", name: "Hirik", how: "one dot under the letter" }] },
      o: { chip: "אוֹ", line: "This sign says OH", signs: [{ show: "אוֹ", say: "אוֹ", name: "Holam", how: "the letter vav with a dot above it" }] },
      u: { chip: "אוּ", line: "Both of these signs say OO", signs: [
        { show: "אוּ", say: "אוּ", name: "Shuruk", how: "the letter vav with a dot in the middle" },
        { show: "אֻ", say: "אוּ", name: "Kubutz", how: "three slanted dots under the letter" },
      ] },
      e: { chip: "אֶ", line: "Both of these signs say EH", signs: [
        { show: "אֵ", say: "אֵ", name: "Tsere", how: "two dots under the letter" },
        { show: "אֶ", say: "אֶ", name: "Segol", how: "three dots under the letter" },
      ] },
    },
    tapToHear: "Tap a sign to hear it", examples: "And with other letters", begin: "Start",
    whichLetter: "Listen. Which letter did you hear?", whichOne: "Listen. What did you hear?", hearAgain: "Hear it again",
    wasOther: (s) => `That one is ${s}. Listen again and find it`, right: "Exactly right",
    sayIt: "Your turn: say it out loud", iSaidIt: "I said it, now play it", saidRight: "I said it right", oneMore: "Once more", next: "Next", finish: "Done",
    round: (n, of) => `Sound ${n} of ${of}`, checkRound: (n, of) => `Check: ${n} of ${of}`, checkHint: "Listen and choose. There is no right or wrong here",
    passed: "Well done! On to the next vowel", passedAll: "You know all the vowels! You can move on to the Letter Wheel", again: "One more round and the sound will settle",
    checkDone: "Here is what we found", knows: "Already known", startsAt: "We start here", knowsAll: "All five vowels are known. You can move on to the Letter Wheel",
    toStep: "Start", explain: "Explain", shortCheck: "A short check",
  },
};
export const vowelStepsCopy = (lang: string): Copy => COPY[lang] ?? COPY.en;

type Saved = { step: number; known?: Partial<Record<V, boolean>> };
const localKey = (uid: string) => `gadit-vowel-steps:${uid}`;
const cleanStep = (n: unknown) => (typeof n === "number" && n >= 0 && n < ORDER.length ? Math.floor(n) : 0);

type Screen = "loading" | "start" | "intro" | "listen" | "say" | "done" | "check" | "checkDone";

export function GameVowelSteps({ onExit, lang, t }: { onExit: () => void; lang: string; t: PlayT }) {
  const c = vowelStepsCopy(lang);
  const { user } = useAuth();
  const { speak, stop } = useSpeech();
  const [at, setScreen] = useState<Screen>("loading");
  // With no account there is nothing to load: straight to the first choice.
  const screen: Screen = !user && at === "loading" ? "start" : at;
  const [step, setStep] = useState(0);
  const [known, setKnown] = useState<Partial<Record<V, boolean>>>({});
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [mark, setMark] = useState<{ right?: string; other?: string }>({});
  const [missed, setMissed] = useState(false);
  const [heardSelf, setHeardSelf] = useState(false);
  const [passedNow, setPassedNow] = useState(false);
  const checkList = useRef<Round[]>([]);
  const checkHits = useRef<Record<V, number>>({ a: 0, i: 0, o: 0, u: 0, e: 0 });
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  // Where this child is: this device first (at once), then the account.
  useEffect(() => {
    if (!user) return;
    let off = false;
    let local: Saved | null = null;
    try { local = JSON.parse(localStorage.getItem(localKey(user.uid)) ?? "null") as Saved | null; } catch { /* first visit */ }
    void (async () => {
      let saved = local;
      try {
        const r = await fetch("/api/play/first-steps", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (r.ok) { const j = (await r.json()) as { vowels?: Saved | null }; if (j.vowels) saved = j.vowels; }
      } catch { /* this device's copy */ }
      if (off) return;
      if (saved) { setStep(cleanStep(saved.step)); setKnown(saved.known ?? {}); setScreen("intro"); }
      else setScreen("start");
    })();
    return () => { off = true; };
  }, [user]);

  const save = useCallback((s: Saved) => {
    if (!user) return;
    try { localStorage.setItem(localKey(user.uid), JSON.stringify(s)); } catch { /* this visit */ }
    void (async () => {
      try {
        await fetch("/api/play/first-steps", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ vowels: s }) });
      } catch { /* kept on this device */ }
    })();
  }, [user]);

  const deal = (s: number, last: string) => {
    const r = makeRound(s, last);
    setRound(r); setMark({}); setMissed(false); setHeardSelf(false);
    return r;
  };

  const openStep = (s: number) => { stop(); setStep(s); setScreen("intro"); };
  const begin = () => {
    stop(); sfx.tap();
    setN(0); setScore(0); setPassedNow(false);
    const r = deal(step, "");
    setScreen("listen");
    void speak(r.target.say);
  };

  const letterOf = (r: Round | null) => (r ? r.target.text[0] : "");
  const nextListen = () => {
    if (!alive.current) return;
    busy.current = false;
    if (n + 1 >= LISTEN_ROUNDS + SAY_ROUNDS) { finish(); return; }
    const toSay = n + 1 >= LISTEN_ROUNDS;
    setN(n + 1);
    const r = deal(step, letterOf(round));
    if (toSay) setScreen("say"); else void speak(r.target.say);
  };

  const finish = () => {
    stop();
    const passed = score >= PASS;
    setPassedNow(passed);
    if (passed) {
      const nk = { ...known, [ORDER[step]]: true };
      const ns = Math.min(step + 1, ORDER.length - 1);
      setKnown(nk);
      save({ step: ns, known: nk });
    }
    setScreen("done");
  };

  const choose = async (o: Syl) => {
    if (!round || busy.current) return;
    if (o.key === round.target.key) {
      busy.current = true;
      stop(); sfx.correct();
      if (!missed) setScore((x) => x + 1);
      setMark({ right: o.key });
      setTimeout(nextListen, 1100);
      return;
    }
    // Not red: what was tapped is heard, then what was asked, and the child looks again.
    busy.current = true;
    setMissed(true); setMark({ other: o.key });
    const heard = await speak(o.say);
    if (heard && alive.current) await speak(round.target.say);
    busy.current = false;
  };

  const startCheck = () => {
    stop(); sfx.tap();
    checkList.current = makeCheck();
    checkHits.current = { a: 0, i: 0, o: 0, u: 0, e: 0 };
    setN(0); setRound(checkList.current[0]); setMark({});
    setScreen("check");
    void speak(checkList.current[0].target.say);
  };
  const chooseCheck = (o: Syl) => {
    if (!round || busy.current) return;
    busy.current = true;
    stop(); sfx.tap();
    if (o.key === round.target.key) checkHits.current[round.target.v]++;
    setMark({ other: o.key }); // only "you tapped this": no right or wrong is shown
    setTimeout(() => {
      if (!alive.current) return;
      busy.current = false;
      if (n + 1 >= CHECK_ROUNDS) {
        const nk: Partial<Record<V, boolean>> = {};
        for (const v of ORDER) nk[v] = checkHits.current[v] >= 2;
        const first = ORDER.findIndex((v) => !nk[v]);
        const ns = first === -1 ? ORDER.length - 1 : first;
        setKnown(nk); setStep(ns); save({ step: ns, known: nk });
        setScreen("checkDone");
        return;
      }
      const r = checkList.current[n + 1];
      setN(n + 1); setRound(r); setMark({});
      void speak(r.target.say);
    }, 450);
  };

  const chips = (
    <div className="vst-chips" role="tablist">
      {ORDER.map((v, i) => (
        <button key={v} type="button" role="tab" aria-selected={i === step} className={`vst-chip${i === step ? " is-on" : ""}${known[v] ? " is-known" : ""}`} onClick={() => openStep(i)} lang="he">
          {c.steps[v].chip}
        </button>
      ))}
    </div>
  );

  if (screen === "done") {
    const allDone = passedNow && step === ORDER.length - 1 && ORDER.every((v) => known[v]);
    return (
      <GameResult
        data={{ title: c.title, score, total: LISTEN_ROUNDS, headline: allDone ? c.passedAll : passedNow ? c.passed : c.again }}
        onExit={onExit}
        onReplay={() => {
          // After a pass the saved step is the next one: open its explanation.
          if (passedNow && !allDone && known[ORDER[step]]) setStep((s) => Math.min(s + 1, ORDER.length - 1));
          setScreen("intro");
        }}
        lang={lang}
        t={t}
      />
    );
  }

  const stepCopy = c.steps[ORDER[step]];
  const progress = screen === "listen" || screen === "say" ? c.round(n + 1, LISTEN_ROUNDS + SAY_ROUNDS) : screen === "check" ? c.checkRound(n + 1, CHECK_ROUNDS) : undefined;
  return (
    <div className="wb-play-stage vst">
      <style>{VST_CSS}</style>
      <PlayHeader title={c.title} progress={progress} score={screen === "listen" || screen === "say" ? score : undefined} onExit={onExit} t={t} />
      <div className="wb-play-question vst-q">
        {screen === "loading" && <div className="vst-note">…</div>}

        {screen === "start" && (
          <>
            <div className="vst-h">{c.startTitle}</div>
            <div className="vst-row">
              <button type="button" className="vst-door" onClick={() => { sfx.tap(); save({ step: 0, known: {} }); setStep(0); setScreen("intro"); }}>
                <b>{c.fromStart}</b><span>{c.fromStartSub}</span>
              </button>
              <button type="button" className="vst-door" onClick={startCheck}>
                <b>{c.check}</b><span>{c.checkSub}</span>
              </button>
            </div>
          </>
        )}

        {screen === "intro" && (
          <>
            {chips}
            {step === 0 && <div className="vst-say">{c.niqqud}</div>}
            <div className="vst-h" lang="he">{stepCopy.line}</div>
            <div className="vst-row">
              {stepCopy.signs.map((s) => (
                <button key={s.show} type="button" className="vst-sign" onClick={() => void speak(s.say)}>
                  <span className="vst-big" lang="he" dir="rtl">{s.show}</span>
                  <b lang="he">{s.name}</b>
                  <span>{s.how}</span>
                </button>
              ))}
            </div>
            <div className="vst-note">🔊 {c.tapToHear}</div>
            <div className="vst-sub">{c.examples}</div>
            <div className="vst-row">
              {["מ", "ל", "ס"].map((l, i) => {
                const m = MARKS[ORDER[step]][i % MARKS[ORDER[step]].length];
                return <button key={l} type="button" className="vst-tile is-small" onClick={() => void speak(sayOf(l, m))} lang="he" dir="rtl">{l + m}</button>;
              })}
            </div>
            <div className="vst-row">
              <button type="button" className="vst-btn" onClick={begin}>{c.begin}</button>
            </div>
            <button type="button" className="vst-link" onClick={startCheck}>{c.shortCheck}</button>
          </>
        )}

        {(screen === "listen" || screen === "check") && round && (
          <>
            <div className="vst-h">{screen === "check" ? c.checkHint : step === 0 ? c.whichLetter : c.whichOne}</div>
            <button type="button" className="vst-ear" onClick={() => void speak(round.target.say)} aria-label={c.hearAgain}>🔊</button>
            <div className="vst-row">
              {round.options.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={`vst-tile${mark.right === o.key ? " is-right" : ""}${mark.other === o.key ? " is-other" : ""}${screen === "listen" && missed && !mark.right && o.key === round.target.key ? " is-hint" : ""}`}
                  onClick={() => (screen === "check" ? chooseCheck(o) : void choose(o))}
                  lang="he"
                  dir="rtl"
                >
                  {o.text}
                </button>
              ))}
            </div>
            <div className="vst-note" aria-live="polite">
              {screen === "listen" && mark.right ? <span className="is-good">{c.right}</span>
                : screen === "listen" && mark.other ? c.wasOther(round.options.find((o) => o.key === mark.other)?.text ?? "")
                : " "}
            </div>
          </>
        )}

        {screen === "say" && round && (
          <>
            <div className="vst-h">{c.sayIt}</div>
            <div className="vst-tile is-show" lang="he" dir="rtl">{round.target.text}</div>
            {!heardSelf ? (
              <div className="vst-row">
                <button type="button" className="vst-btn" onClick={() => { void speak(round.target.say).then(() => { if (alive.current) setHeardSelf(true); }); }}>🔊 {c.iSaidIt}</button>
              </div>
            ) : (
              <div className="vst-row">
                <button type="button" className="vst-btn is-ghost" onClick={() => void speak(round.target.say)}>🔊 {c.oneMore}</button>
                <button type="button" className="vst-btn" onClick={() => { sfx.correct(); nextListen(); }}>{c.saidRight}</button>
                <button type="button" className="vst-btn is-ghost" onClick={nextListen}>{n + 1 >= LISTEN_ROUNDS + SAY_ROUNDS ? c.finish : c.next}</button>
              </div>
            )}
          </>
        )}

        {screen === "checkDone" && (
          <>
            <div className="vst-h">{c.checkDone}</div>
            {ORDER.every((v) => known[v]) ? (
              <div className="vst-say">{c.knowsAll}</div>
            ) : (
              <div className="vst-found">
                <div className="vst-sub">{c.knows}</div>
                <div className="vst-row">
                  {ORDER.filter((v) => known[v]).map((v) => <span key={v} className="vst-chip is-known is-static" lang="he">{c.steps[v].chip}</span>)}
                  {!ORDER.some((v) => known[v]) && <span className="vst-note">·</span>}
                </div>
                <div className="vst-sub">{c.startsAt}</div>
                <div className="vst-row"><span className="vst-chip is-on is-static" lang="he">{stepCopy.chip}</span></div>
              </div>
            )}
            <div className="vst-row">
              <button type="button" className="vst-btn" onClick={() => setScreen("intro")}>{c.toStep}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const VST_CSS = `
.vst .vst-q { display: grid; gap: 14px; justify-items: center; text-align: center; }
.vst-h { font-size: clamp(20px, 5vw, 26px); font-weight: 800; color: #14202b; line-height: 1.5; }
.vst-sub { font-size: 16px; font-weight: 700; color: #47586a; }
.vst-say { max-width: 520px; font-size: 18px; font-weight: 600; line-height: 1.7; color: #14202b; background: #fff8dc; border-radius: 18px; padding: 12px 18px; box-shadow: 0 0 0 2px #f2dc8c inset; }
.vst-note { min-height: 28px; font-size: 18px; font-weight: 700; color: #14202b; line-height: 1.5; }
.vst-note .is-good { color: #166534; }
.vst-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.vst-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.vst-chip { min-width: 54px; min-height: 48px; padding: 4px 12px; border: 0; border-radius: 16px; background: #fff; color: #14202b; font-family: var(--wb-font-display, inherit); font-size: 26px; font-weight: 800; line-height: 1.5; cursor: pointer; box-shadow: 0 0 0 2px #d6dde4 inset; display: inline-grid; place-items: center; }
.vst-chip.is-known { background: #dcfce7; box-shadow: 0 0 0 2px #4ade80 inset; }
.vst-chip.is-on { background: #0a7472; color: #fff; box-shadow: 0 3px 0 #075452; }
.vst-chip.is-static { cursor: default; }
.vst-door { display: grid; gap: 6px; width: min(260px, 100%); min-height: 120px; align-content: center; padding: 18px; border: 0; border-radius: 22px; background: #fff; color: #14202b; font: inherit; cursor: pointer; box-shadow: 0 0 0 3px #0a7472 inset, 0 6px 14px #0002; }
.vst-door b { font-size: 22px; font-weight: 800; color: #0a5c5a; }
.vst-door span { font-size: 16px; line-height: 1.5; }
.vst-sign { display: grid; gap: 4px; justify-items: center; width: min(220px, 44vw); padding: 12px 10px 14px; border: 0; border-radius: 22px; background: #fff; color: #14202b; font: inherit; cursor: pointer; box-shadow: 0 0 0 3px #e7dfc8 inset, 0 6px 14px #0002; }
.vst-sign b { font-size: 22px; font-weight: 800; line-height: 1.6; }
.vst-sign span { font-size: 15px; line-height: 1.5; color: #47586a; }
.vst-sign .vst-big { font-family: var(--wb-font-display, inherit); font-size: clamp(64px, 18vw, 92px); font-weight: 800; line-height: 1.55; color: #14202b; }
.vst-tile { min-width: 108px; padding: 4px 22px; border: 0; border-radius: 24px; background: #fff; color: #14202b; font-family: var(--wb-font-display, inherit); font-size: clamp(60px, 17vw, 88px); font-weight: 800; line-height: 1.6; cursor: pointer; box-shadow: 0 0 0 3px #e7dfc8 inset, 0 6px 0 #d9cfae, 0 10px 18px #0003; transition: transform 120ms; }
.vst-tile:active { transform: translateY(3px); }
.vst-tile.is-small { min-width: 76px; font-size: clamp(40px, 11vw, 54px); box-shadow: 0 0 0 3px #e7dfc8 inset, 0 4px 0 #d9cfae; }
.vst-tile.is-show { cursor: default; box-shadow: 0 0 0 3px #e7dfc8 inset; }
.vst-tile.is-right { background: #dcfce7; box-shadow: 0 0 0 3px #4ade80 inset, 0 6px 0 #86efac; }
.vst-tile.is-other { background: #eef2f6; box-shadow: 0 0 0 3px #b8c4d0 inset, 0 6px 0 #cbd5df; }
.vst-tile.is-hint { animation: vst-pulse 1.1s ease-in-out infinite; }
@keyframes vst-pulse { 50% { box-shadow: 0 0 0 5px #f59e0b inset, 0 6px 0 #d9cfae, 0 10px 18px #0003; } }
.vst-ear { width: 84px; height: 84px; border: 0; border-radius: 50%; background: #c2410c; color: #fff; font-size: 38px; cursor: pointer; box-shadow: 0 5px 0 #7c2d12, 0 10px 18px #0004; }
.vst-btn { min-height: 52px; padding: 12px 26px; border: 0; border-radius: 999px; background: #0a7472; color: #fff; font: inherit; font-weight: 800; font-size: 18px; cursor: pointer; box-shadow: 0 4px 0 #075452, 0 8px 16px #0004; }
.vst-btn.is-ghost { background: #fff; color: #0a7472; box-shadow: 0 0 0 2px #0a7472 inset; }
.vst-link { border: 0; background: transparent; color: #0a5c5a; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: underline; }
.vst-found { display: grid; gap: 8px; justify-items: center; }
@media (prefers-reduced-motion: reduce) { .vst-tile.is-hint { animation: none; box-shadow: 0 0 0 5px #f59e0b inset; } }
`;
