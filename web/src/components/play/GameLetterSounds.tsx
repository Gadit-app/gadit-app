"use client";

/**
 * "The letter and its sound" (Gadi approved 2026-11-16): the first two steps
 * of "first steps in reading", below "The sound of the vowel signs"
 * (GameVowelSteps), for a child who knows the letters only more or less.
 *
 * Step 1, "What is it?": the four words a teacher uses (אות, צליל, ניקוד,
 * תנועה), each shown and heard, then six short taps: where is the letter,
 * where is the vowel sign.
 * Step 2, four groups of letters: each letter with an anchor word and its
 * picture (a voice cannot say a lone consonant, so the word carries the
 * sound). The child hears a word and finds the letter it starts with. Letters
 * that sound the same today (א/ע, ט/תּ, כּ/ק) are never in one round.
 *
 * Nothing turns red, as in the vowel steps: a different choice plays the word
 * of the letter that was tapped, then the word that was asked, and the right
 * tile glows. The step is kept on the account (/api/play/first-steps), so a
 * coach who enters the child's profile on another device finds it.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { sfx } from "@/lib/game-sfx";
import { GameResult } from "./GameResult";
import { PlayHeader, type PlayT } from "./GameQuiz";
import { useSpeech } from "./GameSyllables";
import { VST_CSS } from "./GameVowelSteps";

type Anchor = { l: string; word: string; pic: string; emoji: string };
/** Easy, continuous sounds first; the silent and look-alike-sound letters last. */
const GROUPS: Anchor[][] = [
  [
    { l: "מ", word: "מִטָּה", pic: "bed", emoji: "🛏️" },
    { l: "ל", word: "לִימוֹן", pic: "lemon", emoji: "🍋" },
    { l: "ס", word: "סוּס", pic: "horse", emoji: "🐴" },
    { l: "ר", word: "רַכֶּבֶת", pic: "train", emoji: "🚆" },
    { l: "נ", word: "נֵר", pic: "candle", emoji: "🕯️" },
  ],
  [
    { l: "בּ", word: "בָּנָנָה", pic: "banana", emoji: "🍌" },
    { l: "ד", word: "דָּג", pic: "fish", emoji: "🐟" },
    { l: "ג", word: "גָּמָל", pic: "camel", emoji: "🐫" },
    { l: "ז", word: "זֶבְּרָה", pic: "zebra", emoji: "🦓" },
    { l: "פּ", word: "פִּיל", pic: "elephant", emoji: "🐘" },
  ],
  [
    { l: "שׁ", word: "שֶׁמֶשׁ", pic: "sun", emoji: "☀️" },
    { l: "תּ", word: "תּוּת", pic: "strawberry", emoji: "🍓" },
    { l: "כּ", word: "כֶּלֶב", pic: "dog", emoji: "🐶" },
    { l: "צ", word: "צָב", pic: "turtle", emoji: "🐢" },
    { l: "ח", word: "חָתוּל", pic: "cat", emoji: "🐱" },
  ],
  [
    { l: "א", word: "אַרְיֵה", pic: "lion", emoji: "🦁" },
    { l: "ע", word: "עֵץ", pic: "tree", emoji: "🌳" },
    { l: "ה", word: "הַר", pic: "mountain", emoji: "⛰️" },
    { l: "י", word: "יָד", pic: "hand", emoji: "✋" },
    { l: "ו", word: "וֶרֶד", pic: "rose", emoji: "🌹" },
    { l: "ט", word: "טֶלֶפוֹן", pic: "phone", emoji: "📞" },
    { l: "ק", word: "קוֹף", pic: "monkey", emoji: "🐵" },
  ],
];
/** Letters a child cannot tell apart by ear today: never together in a round. */
const SAME_SOUND = [["א", "ע"], ["ט", "תּ"], ["כּ", "ק"]];
const alike = (a: string, b: string) => a === b || SAME_SOUND.some((s) => s.includes(a) && s.includes(b));
const STEPS = GROUPS.length + 1; // 0 = the words, 1..4 = the letter groups
const LISTEN_ROUNDS = 8;
const PASS = 6;
const WORD_ROUNDS = 6;
const WORD_PASS = 5;
const MARKS = ["ַ", "ָ", "ִ", "ֵ", "ֶ", "ֻ"];
const DOT = "◌";
const VOWEL_SOUNDS = ["אָ", "אִי", "אוֹ", "אוּ", "אֶ"];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/** The first letter of a word with its marks, and the rest. */
const splitFirst = (w: string): [string, string] => { const m = w.match(/^[א-ת][֑-ׇ]*/); return m ? [m[0], w.slice(m[0].length)] : ["", w]; };

type LRound = { target: Anchor; options: Anchor[] };
function makeRound(group: number, lastL: string): LRound {
  const pool = GROUPS.slice(0, group + 1).flat();
  const mine = GROUPS[group];
  // Mostly the new letters, now and then one met before.
  const from = Math.random() < 0.7 ? mine : pool;
  const target = pick(from.filter((a) => a.l !== lastL));
  const ok = pool.filter((a) => !alike(a.l, target.l));
  const near = [...shuffle(ok.filter((a) => mine.includes(a))), ...shuffle(ok.filter((a) => !mine.includes(a)))];
  const others: Anchor[] = [];
  for (const a of near) { if (others.length < 2 && !others.some((o) => alike(o.l, a.l))) others.push(a); }
  return { target, options: shuffle([target, ...others]) };
}

type WTile = { key: string; show: string; kind: "letter" | "mark" };
type WRound = { ask: "letter" | "mark"; options: WTile[] };
function makeWordRounds(): WRound[] {
  const letters = shuffle(GROUPS.flat().map((a) => a.l.replace(/[֑-ׇ]/g, "")));
  return Array.from({ length: WORD_ROUNDS }, (_, i) => {
    const ask: "letter" | "mark" = i % 2 === 0 ? "letter" : "mark";
    const marks = shuffle(MARKS);
    const ls = [letters[(i * 2) % letters.length], letters[(i * 2 + 1) % letters.length]];
    const tiles: WTile[] = ask === "letter"
      ? [{ key: "l0", show: ls[0], kind: "letter" }, { key: "m0", show: DOT + marks[0], kind: "mark" }, { key: "m1", show: DOT + marks[1], kind: "mark" }]
      : [{ key: "m0", show: DOT + marks[0], kind: "mark" }, { key: "l0", show: ls[0], kind: "letter" }, { key: "l1", show: ls[1], kind: "letter" }];
    return { ask, options: shuffle(tiles) };
  });
}

/** One word of step 1: shown big (show), or as a sum (letter + sign = syllable), or heard (hear), or the five vowels. */
type Concept = { word: string; line: string; show?: string; sum?: true; hear?: string; vowels?: boolean };
type Copy = {
  title: string; desc: string; wordsChip: string; begin: string; tapToHear: string;
  concepts: Concept[]; whereLetter: string; whereMark: string; notThis: (kind: "letter" | "mark") => string;
  groupLine: string; whichFirst: string; hearAgain: string; wasOther: (w: string) => string; right: string;
  round: (n: number, of: number) => string; wordsDone: string; passed: string; passedAll: string; again: string;
};
const COPY: Record<string, Copy> = {
  he: {
    title: "האות והצליל", desc: "מה זה אות, צליל וניקוד, ואיזה צליל משמיעה כל אות",
    wordsChip: "מה זה?", begin: "מתחילים", tapToHear: "לחצו כדי לשמוע",
    concepts: [
      { word: "אוֹת", line: "אות היא סימן שכותבים. מאותיות בונים מילים.", show: "שׁ" },
      { word: "צְלִיל", line: "צליל הוא מה שהאוזן שומעת. כשאומרים בָּנָנָה, הצליל הראשון הוא של האות בּ.", hear: "בָּנָנָה" },
      { word: "נִקּוּד", line: "ניקוד הוא הנקודות והקווים הקטנים ליד האות. הם אומרים איך להגיד אותה.", sum: true },
      { word: "תְּנוּעָה", line: "תנועה היא הצליל שהניקוד נותן לאות: אָ, אִי, אוֹ, אוּ, אֶ.", vowels: true },
    ],
    whereLetter: "איפה האות?", whereMark: "איפה הניקוד?",
    notThis: (k) => (k === "letter" ? "זאת אות. חפשו את הניקוד" : "זה ניקוד. חפשו את האות"),
    groupLine: "לכל אות יש מילה שמתחילה בה. לחצו על כרטיס כדי לשמוע",
    whichFirst: "הקשיבו. באיזו אות מתחילה המילה?", hearAgain: "לשמוע שוב",
    wasOther: (w) => `זאת האות של ${w}. הקשיבו שוב ומצאו`, right: "נכון מאוד",
    round: (n, of) => `מילה ${n} מתוך ${of}`,
    wordsDone: "יפה מאוד! עכשיו מכירים את המילים. עוברים לאותיות",
    passed: "יפה מאוד! עוברים לקבוצה הבאה", passedAll: "אתם מכירים את כל האותיות! הצעד הבא: הצליל של הניקוד",
    again: "עוד סיבוב אחד, והאותיות יישבו טוב",
  },
  en: {
    title: "The Letter and Its Sound", desc: "What a letter, a sound and a vowel sign are, and the sound of each Hebrew letter",
    wordsChip: "What is it?", begin: "Start", tapToHear: "Tap to hear",
    concepts: [
      { word: "אוֹת", line: "A letter is a sign we write. Words are built from letters.", show: "שׁ" },
      { word: "צְלִיל", line: "A sound is what the ear hears. In בָּנָנָה, the first sound is the letter בּ.", hear: "בָּנָנָה" },
      { word: "נִקּוּד", line: "Niqqud is the small dots and lines next to a letter. They tell how to say it.", sum: true },
      { word: "תְּנוּעָה", line: "A vowel is the sound the niqqud gives the letter: אָ, אִי, אוֹ, אוּ, אֶ.", vowels: true },
    ],
    whereLetter: "Where is the letter?", whereMark: "Where is the vowel sign?",
    notThis: (k) => (k === "letter" ? "This is a letter. Find the vowel sign" : "This is a vowel sign. Find the letter"),
    groupLine: "Every letter has a word that starts with it. Tap a card to hear it",
    whichFirst: "Listen. Which letter does the word start with?", hearAgain: "Hear it again",
    wasOther: (w) => `That is the letter of ${w}. Listen again and find it`, right: "Well done",
    round: (n, of) => `Word ${n} of ${of}`,
    wordsDone: "Well done! You know the words now. On to the letters",
    passed: "Well done! On to the next group", passedAll: "You know all the letters! Next step: the sound of the vowel signs",
    again: "One more round, and the letters will settle in",
  },
};
export function letterSoundsCopy(lang: string): Copy { return COPY[lang] ?? COPY.en; }

type Saved = { step: number; known?: Record<string, boolean> };
const localKey = (uid: string) => `gadit-letter-sounds:${uid}`;
const cleanStep = (n: unknown) => (typeof n === "number" && n >= 0 && n < STEPS ? Math.floor(n) : 0);
const stepKey = (s: number) => (s === 0 ? "words" : `g${s}`);

type Screen = "loading" | "intro" | "words" | "listen" | "done";

export function GameLetterSounds({ onExit, lang, t }: { onExit: () => void; lang: string; t: PlayT }) {
  const c = letterSoundsCopy(lang);
  const { user } = useAuth();
  const { speak, stop } = useSpeech();
  const [at, setScreen] = useState<Screen>("loading");
  const screen: Screen = !user && at === "loading" ? "intro" : at;
  const [step, setStep] = useState(0);
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<LRound | null>(null);
  const [wRounds, setWRounds] = useState<WRound[]>([]);
  const [mark, setMark] = useState<{ right?: string; other?: string }>({});
  const [missed, setMissed] = useState(false);
  const [passedNow, setPassedNow] = useState(false);
  const [pics, setPics] = useState<Record<string, string>>({});
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  // Where this child is: this device at once, then the account.
  useEffect(() => {
    if (!user) return;
    let off = false;
    let local: Saved | null = null;
    try { local = JSON.parse(localStorage.getItem(localKey(user.uid)) ?? "null") as Saved | null; } catch { /* first visit */ }
    void (async () => {
      let saved = local;
      try {
        const r = await fetch("/api/play/first-steps", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
        if (r.ok) { const j = (await r.json()) as { letters?: Saved | null }; if (j.letters) saved = j.letters; }
      } catch { /* this device's copy */ }
      if (off) return;
      if (saved) { setStep(cleanStep(saved.step)); setKnown(saved.known ?? {}); }
      setScreen("intro");
    })();
    return () => { off = true; };
  }, [user]);

  // The anchor pictures: the house-style ones already drawn for the picture game.
  useEffect(() => {
    if (!user) return;
    let off = false;
    void (async () => {
      try {
        const r = await fetch("/api/play/images", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
          body: JSON.stringify({ words: GROUPS.flat().map((a) => a.pic), pick: true }),
        });
        const got = r.ok ? (((await r.json()) as { images?: Record<string, string> }).images ?? {}) : {};
        if (!off) setPics(Object.fromEntries(Object.entries(got).map(([w, u]) => [w.toLowerCase(), u])));
      } catch { /* the emoji stays */ }
    })();
    return () => { off = true; };
  }, [user]);

  const save = useCallback((s: Saved) => {
    if (!user) return;
    try { localStorage.setItem(localKey(user.uid), JSON.stringify(s)); } catch { /* this visit */ }
    void (async () => {
      try {
        await fetch("/api/play/first-steps", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ letters: s }) });
      } catch { /* kept on this device */ }
    })();
  }, [user]);

  const picOf = (a: Anchor) => pics[a.pic];
  const pic = (a: Anchor, big?: boolean) => (
    picOf(a)
      // eslint-disable-next-line @next/next/no-img-element
      ? <img className={`lts-pic${big ? " is-big" : ""}`} src={picOf(a)} alt="" width={big ? 160 : 96} height={big ? 160 : 96} draggable={false} />
      : <span className={`lts-emoji${big ? " is-big" : ""}`} aria-hidden="true">{a.emoji}</span>
  );

  const openStep = (s: number) => { stop(); setStep(s); setScreen("intro"); };
  const begin = () => {
    stop(); sfx.tap();
    setN(0); setScore(0); setPassedNow(false); setMark({}); setMissed(false);
    if (step === 0) { setWRounds(makeWordRounds()); setScreen("words"); return; }
    const r = makeRound(step - 1, "");
    setRound(r);
    setScreen("listen");
    void speak(r.target.word);
  };

  const finish = (sc: number) => {
    stop();
    const passed = step === 0 ? sc >= WORD_PASS : sc >= PASS;
    setPassedNow(passed);
    if (passed) {
      const nk = { ...known, [stepKey(step)]: true };
      setKnown(nk);
      save({ step: Math.min(step + 1, STEPS - 1), known: nk });
    }
    setScreen("done");
  };

  // Step 1: where is the letter / the vowel sign.
  const chooseWord = (o: WTile) => {
    const r = wRounds[n];
    if (!r || busy.current) return;
    if (o.kind === r.ask) {
      busy.current = true;
      sfx.correct();
      const sc = missed ? score : score + 1;
      setScore(sc);
      setMark({ right: o.key });
      setTimeout(() => {
        if (!alive.current) return;
        busy.current = false;
        setMark({}); setMissed(false);
        if (n + 1 >= wRounds.length) finish(sc); else setN(n + 1);
      }, 900);
      return;
    }
    setMissed(true); setMark({ other: o.key });
  };

  // Step 2: which letter does the word start with.
  const choose = async (o: Anchor) => {
    if (!round || busy.current) return;
    if (o.l === round.target.l) {
      busy.current = true;
      stop(); sfx.correct();
      const sc = missed ? score : score + 1;
      setScore(sc);
      setMark({ right: o.l });
      setTimeout(() => {
        if (!alive.current) return;
        busy.current = false;
        if (n + 1 >= LISTEN_ROUNDS) { finish(sc); return; }
        setN(n + 1);
        const r = makeRound(step - 1, round.target.l);
        setRound(r); setMark({}); setMissed(false);
        void speak(r.target.word);
      }, 1500);
      return;
    }
    // Not red: the word of the letter tapped, then the word asked.
    busy.current = true;
    setMissed(true); setMark({ other: o.l });
    const heard = await speak(o.word);
    if (heard && alive.current) await speak(round.target.word);
    busy.current = false;
  };

  const chips = (
    <div className="vst-chips" role="tablist">
      {Array.from({ length: STEPS }, (_, i) => (
        <button key={i} type="button" role="tab" aria-selected={i === step} className={`vst-chip lts-chip${i === step ? " is-on" : ""}${known[stepKey(i)] ? " is-known" : ""}`} onClick={() => openStep(i)} lang="he">
          {i === 0 ? c.wordsChip : GROUPS[i - 1].map((a) => a.l).join(" ")}
        </button>
      ))}
    </div>
  );

  if (screen === "done") {
    const allDone = passedNow && step === STEPS - 1;
    return (
      <GameResult
        data={{ title: c.title, score, total: step === 0 ? WORD_ROUNDS : LISTEN_ROUNDS, headline: allDone ? c.passedAll : passedNow ? (step === 0 ? c.wordsDone : c.passed) : c.again }}
        onExit={onExit}
        onReplay={() => {
          if (passedNow && !allDone) setStep((s) => Math.min(s + 1, STEPS - 1));
          setScreen("intro");
        }}
        lang={lang}
        t={t}
      />
    );
  }

  const wr = wRounds[n];
  const progress = screen === "listen" ? c.round(n + 1, LISTEN_ROUNDS) : screen === "words" ? c.round(n + 1, WORD_ROUNDS) : undefined;
  return (
    <div className="wb-play-stage vst lts">
      <style>{VST_CSS + LTS_CSS}</style>
      <PlayHeader title={c.title} progress={progress} score={screen === "listen" || screen === "words" ? score : undefined} onExit={onExit} t={t} />
      <div className="wb-play-question vst-q">
        {screen === "loading" && <div className="vst-note">…</div>}

        {screen === "intro" && step === 0 && (
          <>
            {chips}
            <div className="lts-concepts">
              {c.concepts.map((k) => (
                <div key={k.word} className="lts-concept">
                  <button type="button" className="lts-concept-word" onClick={() => void speak(k.word)} lang="he" dir="rtl">{k.word}</button>
                  {k.show && <button type="button" className="lts-concept-show" onClick={() => void speak(k.word)} lang="he" dir="rtl">{k.show}</button>}
                  {k.sum && <button type="button" className="lts-concept-show" onClick={() => void speak("בָּ")} lang="he" dir="rtl"><span>ב</span><span className="lts-plus">+</span><span>{DOT}ָ</span><span className="lts-plus">=</span><span>בָּ</span></button>}
                  {k.hear && <button type="button" className="vst-ear lts-ear" onClick={() => void speak(k.hear!)} aria-label={c.tapToHear}>🔊</button>}
                  {k.vowels && (
                    <div className="vst-row lts-vowels">
                      {VOWEL_SOUNDS.map((v) => <button key={v} type="button" className="vst-chip" onClick={() => void speak(v)} lang="he">{v}</button>)}
                    </div>
                  )}
                  <button type="button" className="lts-concept-line" onClick={() => void speak(k.line)} lang={lang === "he" ? "he" : undefined}>{k.line}</button>
                </div>
              ))}
            </div>
            <div className="vst-note">🔊 {c.tapToHear}</div>
            <div className="vst-row"><button type="button" className="vst-btn" onClick={begin}>{c.begin}</button></div>
          </>
        )}

        {screen === "intro" && step > 0 && (
          <>
            {chips}
            <div className="vst-h">{c.groupLine}</div>
            <div className="lts-cards">
              {GROUPS[step - 1].map((a) => {
                const [first, rest] = splitFirst(a.word);
                return (
                  <button key={a.l} type="button" className="lts-card" onClick={() => void speak(a.word)}>
                    <span className="lts-letter" lang="he" dir="rtl">{a.l}</span>
                    {pic(a)}
                    <span className="lts-word" lang="he" dir="rtl"><b>{first}</b>{rest}</span>
                  </button>
                );
              })}
            </div>
            <div className="vst-row"><button type="button" className="vst-btn" onClick={begin}>{c.begin}</button></div>
          </>
        )}

        {screen === "words" && wr && (
          <>
            <div className="vst-h">{wr.ask === "letter" ? c.whereLetter : c.whereMark}</div>
            <div className="vst-row">
              {wr.options.map((o) => (
                <button key={o.key} type="button" className={`vst-tile${mark.right === o.key ? " is-right" : ""}${mark.other === o.key ? " is-other" : ""}${missed && !mark.right && o.kind === wr.ask ? " is-hint" : ""}`} onClick={() => chooseWord(o)} lang="he" dir="rtl">
                  {o.show}
                </button>
              ))}
            </div>
            <div className="vst-note" aria-live="polite">
              {mark.right ? <span className="is-good">{c.right}</span> : mark.other ? c.notThis(wr.ask === "letter" ? "mark" : "letter") : " "}
            </div>
          </>
        )}

        {screen === "listen" && round && (
          <>
            <div className="vst-h">{c.whichFirst}</div>
            {mark.right ? (
              <div className="lts-reveal">
                {pic(round.target, true)}
                <span className="lts-word is-big" lang="he" dir="rtl"><b>{splitFirst(round.target.word)[0]}</b>{splitFirst(round.target.word)[1]}</span>
              </div>
            ) : (
              <button type="button" className="vst-ear" onClick={() => void speak(round.target.word)} aria-label={c.hearAgain}>🔊</button>
            )}
            <div className="vst-row">
              {round.options.map((o) => (
                <button
                  key={o.l}
                  type="button"
                  className={`vst-tile${mark.right === o.l ? " is-right" : ""}${mark.other === o.l ? " is-other" : ""}${missed && !mark.right && o.l === round.target.l ? " is-hint" : ""}`}
                  onClick={() => void choose(o)}
                  lang="he"
                  dir="rtl"
                >
                  {o.l}
                </button>
              ))}
            </div>
            <div className="vst-note" aria-live="polite">
              {mark.right ? <span className="is-good">{c.right}</span>
                : mark.other ? c.wasOther(round.options.find((o) => o.l === mark.other)?.word ?? "")
                : " "}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const LTS_CSS = `
.lts .lts-chip { font-size: 20px; letter-spacing: .08em; }
.lts-concepts { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 12px; width: min(760px, 100%); }
.lts-concept { display: grid; gap: 8px; justify-items: center; align-content: start; padding: 14px 14px 16px; border-radius: 22px; background: #fff; box-shadow: 0 0 0 3px #e7dfc8 inset, 0 6px 14px #0002; }
.lts-concept-word { border: 0; background: transparent; cursor: pointer; font-family: var(--wb-font-display, inherit); font-size: clamp(30px, 8vw, 40px); font-weight: 800; color: #0a5c5a; line-height: 1.4; }
.lts-concept-show { display: inline-flex; align-items: center; gap: 8px; border: 0; background: #fff8dc; border-radius: 16px; padding: 2px 16px; cursor: pointer; font-family: var(--wb-font-display, inherit); font-size: clamp(40px, 11vw, 56px); font-weight: 800; color: #14202b; line-height: 1.5; }
.lts-plus { font-size: .6em; color: #47586a; }
.lts-ear { width: 64px; height: 64px; font-size: 30px; }
.lts-vowels .vst-chip { font-size: 22px; }
.lts-concept-line { border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 16px; line-height: 1.6; color: #14202b; text-align: center; }
.lts-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 12px; width: min(760px, 100%); }
.lts-card { display: grid; gap: 4px; justify-items: center; padding: 10px 8px 12px; border: 0; border-radius: 22px; background: #fff; color: #14202b; font: inherit; cursor: pointer; box-shadow: 0 0 0 3px #e7dfc8 inset, 0 6px 0 #d9cfae; }
.lts-card:active { transform: translateY(3px); }
.lts-letter { font-family: var(--wb-font-display, inherit); font-size: 52px; font-weight: 800; line-height: 1.3; color: #0a5c5a; }
.lts-pic { width: 96px; height: 96px; object-fit: contain; border-radius: 14px; }
.lts-pic.is-big { width: 160px; height: 160px; }
.lts-emoji { font-size: 64px; line-height: 96px; height: 96px; }
.lts-emoji.is-big { font-size: 110px; line-height: 160px; height: 160px; }
.lts-word { font-family: var(--wb-font-display, inherit); font-size: 26px; font-weight: 700; line-height: 1.6; color: #14202b; }
.lts-word b { color: #c2410c; font-weight: 800; }
.lts-word.is-big { font-size: clamp(34px, 9vw, 46px); }
.lts-reveal { display: grid; gap: 4px; justify-items: center; }
`;
