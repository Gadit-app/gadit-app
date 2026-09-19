"use client";

/**
 * /spell — the spelling / dictation trainer. A kid practices ALONE (like "Say
 * it"): pick a category, pick a direction (Hebrew->English or English->Hebrew),
 * the app reads each word aloud (TTS, like a teacher dictating) and the kid types
 * the answer. Exact spelling only, with letter-level feedback, and it re-quizzes
 * the misses until they are clean. Built-in curriculum categories mean no parent
 * has to set anything up. Gadi 2026-09-19 (from Ziv's daughter's school
 * dictations). Finger-trace mode is a planned phase 2.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { TTSButton } from "@/components/design/TTSButton";
import { KidsCelebration } from "@/components/design/KidsCelebration";
import { LANGUAGES } from "@/lib/i18n";
import { DICTATION_SETS, getCatTitle, type DictationSet, type WordPair } from "@/lib/dictation-sets";
import { SPELL_T_EXTRA, CELEBRATIONS_EXTRA } from "@/lib/spell-i18n";

// Internal direction ids: "he2en" = native → English, "en2he" = English →
// native. The "he" in the name is legacy — the non-English side is the
// learner's OWN language, not necessarily Hebrew.
type Dir = "he2en" | "en2he";
const RTL_SET = new Set(["he", "ar", "fa"]);
const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code;

// Language-major so translated languages can be appended verbatim from the
// localization batch (Gadi 2026-09-19). en is the fallback for any missing key.
type SpellKey =
  | "title" | "sub" | "pickCat" | "writeEn" | "writeNative" | "check" | "next"
  | "correct" | "almost" | "listen" | "back" | "again" | "doneTitle" | "doneBody"
  | "retryMisses" | "loginTitle" | "createTitle" | "createSub" | "topicPlaceholder"
  | "generate" | "creating" | "unsafe" | "createErr" | "modeType" | "modeTrace"
  | "traceHint" | "clear" | "pasteTitle" | "pasteSub" | "pastePlaceholder"
  | "pasteBtn" | "yourDictations" | "practiceAgain" | "correctWord" | "allFilter";
const SPELL_STRINGS: Record<string, Record<SpellKey, string>> = {
  en: {
    title: "Spelling practice",
    sub: "Practice your school spelling words. The app reads a word, you write it.",
    pickCat: "Pick a topic",
    writeEn: "Write in English",
    writeNative: "Write in {lang}",
    check: "Check", next: "Next", correct: "Correct!",
    almost: "Not quite. The correct spelling:",
    listen: "Listen", back: "Back", again: "Practice again",
    doneTitle: "Great work!",
    doneBody: "{a} of {b} right on the first try.",
    retryMisses: "Now let's fix the ones you missed.",
    loginTitle: "Sign in to practice",
    createTitle: "Create your own set",
    createSub: "Type any topic and get 10 words to practice.",
    topicPlaceholder: "A topic, e.g. aliens",
    generate: "Create set", creating: "Creating…",
    unsafe: "Let's pick a different topic 🙂",
    createErr: "Could not create that. Try another topic.",
    modeType: "Type it", modeTrace: "Trace it",
    traceHint: "Trace the word with your finger", clear: "Clear",
    pasteTitle: "Paste your own list",
    pasteSub: "One word per line, in your language or English.",
    pastePlaceholder: "yellow\ndog\nteacher", pasteBtn: "Create set",
    yourDictations: "Your dictations", practiceAgain: "Practice again",
    correctWord: "correct", allFilter: "All",
  },
  he: {
    title: "תרגול הכתבה",
    sub: "מתרגלים את מילות ההכתבה מבית הספר. האפליקציה מקריאה מילה, ואתם כותבים אותה.",
    pickCat: "בחרו נושא",
    writeEn: "כתבו באנגלית",
    writeNative: "כתבו ב{lang}",
    check: "בדיקה", next: "הבא", correct: "נכון!",
    almost: "לא בדיוק. הכתיב הנכון:",
    listen: "האזנה", back: "חזרה", again: "לתרגל שוב",
    doneTitle: "כל הכבוד!",
    doneBody: "{a} מתוך {b} נכון בפעם הראשונה.",
    retryMisses: "עכשיו נתקן את אלה שטעיתם בהם.",
    loginTitle: "התחברו כדי לתרגל",
    createTitle: "יצירת סט משלך",
    createSub: "הקלידו נושא וקבלו 10 מילים לתרגול.",
    topicPlaceholder: "נושא, למשל חייזרים",
    generate: "יצירת סט", creating: "יוצר…",
    unsafe: "בואו נבחר נושא אחר 🙂",
    createErr: "לא הצלחנו. נסו נושא אחר.",
    modeType: "הקלדה", modeTrace: "כתיבה ביד",
    traceHint: "עקבו על המילה עם האצבע", clear: "ניקוי",
    pasteTitle: "הדבקת רשימה משלך",
    pasteSub: "מילה בכל שורה, בשפה שלכם או באנגלית.",
    pastePlaceholder: "צהוב\nכלב\nמורה", pasteBtn: "יצירת סט",
    yourDictations: "התרגולים שלך", practiceAgain: "לתרגל שוב",
    correctWord: "נכון", allFilter: "הכול",
  },
};
const t = (k: SpellKey, lang: string): string =>
  SPELL_STRINGS[lang]?.[k] ?? SPELL_T_EXTRA[lang]?.[k] ?? SPELL_STRINGS.en[k] ?? k;
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

// Kid-friendly, GENDER-NEUTRAL celebrations shown on finishing (Gadi 2026-09-19:
// avoid gendered 2nd-person verbs; use interjections + neutral phrases). One is
// picked at random each time.
// Kept deliberately SIMPLE and clear for young kids (Gadi 2026-09-19: no slang
// that could confuse, e.g. "חבל על הזמן" a child could read literally). All
// gender-neutral (no 2nd-person gendered verbs).
const CELEBRATIONS: Record<string, string[]> = {
  he: [
    "אליפות! 🏆", "מושלם! ⭐", "כל הכבוד! 👏", "מדהים! 🤩", "פצצה! 💥",
    "וואו, איזה יופי!", "עשר מתוך עשר! 🎯", "יופי של עבודה! 💪", "נהדר! 🌟", "פשוט מעולה!",
  ],
  en: [
    "Awesome! 🏆", "Perfect! ⭐", "Well done! 👏", "Amazing! 🤩", "Great job! 💪",
    "Wonderful! 🌟", "10 out of 10! 🎯", "Fantastic! ✨", "Brilliant! 💡", "Super work!",
  ],
};
function randomCelebration(lang: string): string {
  const arr = CELEBRATIONS[lang] ?? CELEBRATIONS_EXTRA[lang] ?? CELEBRATIONS.en;
  return arr[Math.floor(Math.random() * arr.length)];
}

const TEAL = "#0EA5A5";
function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
// Stable id for a custom (topic/list) set, so re-practicing upserts one doc.
function hashWords(words: WordPair[]): string {
  const s = words.map((w) => w.en.toLowerCase()).join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "custom_" + h.toString(36);
}

/** Finger-tracing canvas: the word is drawn in faint simple print (non-cursive)
 *  as a guide, and the child traces over it with a finger. Writing practice, no
 *  grading — the type mode is the test. Gadi 2026-09-19. */
function TraceCanvas({ word, rtl, clearLabel }: { word: string; rtl: boolean; clearLabel: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  function guide() {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth || 300;
    const h = c.clientHeight || 150;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // faint baseline
    ctx.strokeStyle = "#EEF2F3";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(12, h * 0.80); ctx.lineTo(w - 12, h * 0.80); ctx.stroke();

    // Draw the word letter-by-letter with a GENEROUS gap so a finger has room
    // between letters (Gadi 2026-09-19). Bigger letters, too. Per-letter draw
    // also lets us honor RTL (Hebrew answers) by laying out right-to-left.
    const letters = Array.from(word);
    const GAP = 0.42; // gap as a fraction of the font size
    let size = Math.min(h * 0.74, 96); // bigger than before
    const setFont = () => { ctx.font = `700 ${size}px "Rubik", system-ui, sans-serif`; };
    const totalW = () => {
      setFont();
      let s = 0;
      for (const ch of letters) s += ctx.measureText(ch).width;
      return s + GAP * size * Math.max(0, letters.length - 1);
    };
    while (totalW() > w - 24 && size > 16) size -= 2;
    setFont();
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = "#CFD8E0";
    const gap = GAP * size;
    const tw = totalW();
    const y = h * 0.80;
    if (rtl) {
      let x = (w + tw) / 2; // right edge
      for (const ch of letters) {
        const cw = ctx.measureText(ch).width;
        x -= cw;
        ctx.fillText(ch, x, y);
        x -= gap;
      }
    } else {
      let x = (w - tw) / 2; // left edge
      for (const ch of letters) {
        ctx.fillText(ch, x, y);
        x += ctx.measureText(ch).width + gap;
      }
    }
  }

  useEffect(() => { guide(); /* redraw on word change */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);
  useEffect(() => {
    const onR = () => guide();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function xy(e: React.PointerEvent) {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function down(e: React.PointerEvent) { drawing.current = true; last.current = xy(e); ref.current?.setPointerCapture(e.pointerId); }
  function move(e: React.PointerEvent) {
    if (!drawing.current || !last.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = xy(e);
    ctx.strokeStyle = TEAL; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  }
  function up() { drawing.current = false; last.current = null; }

  return (
    <div>
      <canvas
        ref={ref}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ width: "100%", height: 150, touchAction: "none", borderRadius: 12, background: "#fff", border: "1px solid var(--hairline,#E5E7EB)", display: "block", cursor: "crosshair" }}
      />
      <button type="button" onClick={guide} style={{ marginTop: 8, background: "none", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 9, padding: "6px 14px", fontSize: 13, color: "var(--ink-muted,#6B7280)", cursor: "pointer" }}>
        ↺ {clearLabel}
      </button>
    </div>
  );
}

export function SpellClient() {
  const { lang, dir } = useLang();
  const href = useHref();
  const { user, plan, planReady } = useAuth();
  // Dictation is a Family / Deep feature only (Gadi 2026-09-19): NOT Clear,
  // NOT Basic. Family and standalone Deep both store plan === "deep".
  const hasAccess = plan === "deep";

  // The non-English side of every pair = the learner's own language. English
  // UI users have no obvious "other" language, so they practice Hebrew (the
  // feature's original market). Gadi 2026-09-19: make dictation work in every
  // language, not only Hebrew↔English.
  const nativeLang = lang === "en" ? "he" : lang;
  const nativeName = langLabel(nativeLang);
  const englishName = langLabel("en");
  const arrow = dir === "rtl" ? "←" : "→";
  const dirText = (d: Dir) => (d === "he2en" ? `${nativeName} ${arrow} ${englishName}` : `${englishName} ${arrow} ${nativeName}`);
  // The set's display title: he UI → Hebrew title; en UI → English title; any
  // other UI → the localized title we stored in titleHe when generating.
  const setTitle = (s: DictationSet) => (lang === "he" || nativeLang !== "he" ? s.titleHe : s.titleEn);

  const [qdir, setQdir] = useState<Dir>("he2en");
  const [mode, setMode] = useState<"type" | "trace">("type");
  const [set, setSet] = useState<DictationSet | null>(null);
  const setIdRef = useRef<string>("");
  const [queue, setQueue] = useState<WordPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [misses, setMisses] = useState<WordPair[]>([]);
  const [wrongEver, setWrongEver] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [phase, setPhase] = useState<"pick" | "quiz" | "done">("pick");
  const [celebration, setCelebration] = useState("");
  // Bumped on a successful finish → fires the full-screen confetti burst
  // (same KidsCelebration used on rank-up), Gadi 2026-09-19.
  const [celebrateId, setCelebrateId] = useState(0);
  // Previously practiced sets, to re-practice a whole series (esp. missed
  // words). Shown at the top of the pick screen. Gadi 2026-09-19.
  const [history, setHistory] = useState<Array<{
    setId: string; title: string; icon: string; direction?: string;
    timesPracticed?: number; lastScore?: number; lastTotal?: number;
  }>>([]);
  const [topic, setTopic] = useState("");
  const [listText, setListText] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function createFromList() {
    const lt = listText.trim();
    if (lt.length < 2 || creating || !user) return;
    setCreating(true);
    setCreateMsg("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/spell-set", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ list: lt, uiLang: lang, nativeLang }),
      });
      const data = (await res.json().catch(() => ({}))) as { safe?: boolean; title?: string; words?: WordPair[] };
      if (!res.ok || !data.safe || !Array.isArray(data.words) || data.words.length < 2) {
        setCreateMsg(data.safe === false ? t("unsafe", lang) : t("createErr", lang));
        return;
      }
      start({ id: "custom", icon: "📝", titleEn: data.title || "My list", titleHe: data.title || "הרשימה שלי", words: data.words });
      setListText("");
    } catch {
      setCreateMsg(t("createErr", lang));
    } finally {
      setCreating(false);
    }
  }

  async function createSet() {
    const tp = topic.trim();
    if (tp.length < 2 || creating || !user) return;
    setCreating(true);
    setCreateMsg("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/spell-set", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ topic: tp, uiLang: lang, nativeLang }),
      });
      const data = (await res.json().catch(() => ({}))) as { safe?: boolean; title?: string; words?: WordPair[] };
      if (!res.ok || !data.safe || !Array.isArray(data.words) || data.words.length < 3) {
        setCreateMsg(data.safe === false ? t("unsafe", lang) : t("createErr", lang));
        return;
      }
      start({ id: "custom", icon: "✨", titleEn: data.title || tp, titleHe: data.title || tp, words: data.words });
      setTopic("");
    } catch {
      setCreateMsg(t("createErr", lang));
    } finally {
      setCreating(false);
    }
  }

  // Start a curated category. The built-in sets are Hebrew↔English, so for a
  // learner whose language isn't Hebrew we generate the SAME topic in their
  // language on the fly (cached server-side per language). Gadi 2026-09-19.
  const [loadingCat, setLoadingCat] = useState<string>("");
  async function startCategory(s: DictationSet) {
    if (nativeLang === "he") { start(s); return; }
    if (!user || loadingCat) return;
    setLoadingCat(s.id);
    setCreateMsg("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/spell-set", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ topic: s.titleEn, uiLang: lang, nativeLang }),
      });
      const data = (await res.json().catch(() => ({}))) as { safe?: boolean; title?: string; words?: WordPair[] };
      if (!res.ok || !data.safe || !Array.isArray(data.words) || data.words.length < 3) {
        setCreateMsg(t("createErr", lang));
        return;
      }
      // Keep the curated icon + stable id so re-practice + history line up.
      start({ id: s.id, icon: s.icon, titleEn: s.titleEn, titleHe: data.title || s.titleEn, words: data.words });
    } catch {
      setCreateMsg(t("createErr", lang));
    } finally {
      setLoadingCat("");
    }
  }

  // Save the practiced set to the kid's notebook ("Dictations" section) so they
  // can come back and re-practice it. Fire-and-forget.
  async function saveSet() {
    if (!user || !set || !setIdRef.current) return;
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/dictation-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          setId: setIdRef.current,
          title: setTitle(set),
          icon: set.icon,
          direction: qdir,
          words: set.words,
          score: set.words.length - wrongEver.size,
          total: set.words.length,
        }),
      });
      void loadHistory();
    } catch { /* non-blocking */ }
  }

  // Tell the parent the child finished a dictation (push + email if enabled).
  // Silent no-op for non-kids — the endpoint decides. Gadi 2026-09-19.
  async function notifyParentDictation() {
    if (!user || !set) return;
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/family/notify-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          kind: "spell",
          label: setTitle(set),
          score: set.words.length - wrongEver.size,
          total: set.words.length,
        }),
      });
    } catch { /* best-effort */ }
  }

  // Open a previously practiced set from the history list.
  async function openSaved(setId: string) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/dictation-sets?id=" + encodeURIComponent(setId), { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) return;
      const data = (await res.json()) as { set?: { setId?: string; title?: string; icon?: string; direction?: string; words?: WordPair[] } };
      const sv = data.set;
      if (sv && Array.isArray(sv.words) && sv.words.length >= 2) {
        if (sv.direction === "he2en" || sv.direction === "en2he") setQdir(sv.direction);
        start({ id: sv.setId || setId, icon: sv.icon || "📝", titleEn: sv.title || "", titleHe: sv.title || "", words: sv.words });
      }
    } catch { /* ignore */ }
  }

  // Load the kid's practiced-sets history for the pick screen.
  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/dictation-sets", { headers: { Authorization: `Bearer ${idToken}` } });
      if (!res.ok) return;
      const data = (await res.json()) as { sets?: typeof history };
      if (Array.isArray(data.sets)) setHistory(data.sets);
    } catch { /* best-effort */ }
  }, [user]);
  useEffect(() => { void loadHistory(); }, [loadHistory]);

  // Deep link: /spell?set=<id> re-opens a saved set to practice again.
  useEffect(() => {
    if (!user) return;
    let id = "";
    try { id = new URLSearchParams(window.location.search).get("set") || ""; } catch { /* ignore */ }
    if (!id) return;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/dictation-sets?id=" + encodeURIComponent(id), { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { set?: { setId?: string; title?: string; icon?: string; direction?: string; words?: WordPair[] } };
        const sv = data.set;
        if (sv && Array.isArray(sv.words) && sv.words.length >= 2) {
          if (sv.direction === "he2en" || sv.direction === "en2he") setQdir(sv.direction);
          start({ id: sv.setId || id, icon: sv.icon || "📝", titleEn: sv.title || "", titleHe: sv.title || "", words: sv.words });
        }
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // The "he" slot holds the native-language word (see WordPair note).
  const promptOf = (w: WordPair) => (qdir === "he2en" ? w.he : w.en);
  const answerOf = (w: WordPair) => (qdir === "he2en" ? w.en : w.he);
  const answerLang = qdir === "he2en" ? "en" : nativeLang;
  const promptLang = qdir === "he2en" ? nativeLang : "en";
  const answerRtl = RTL_SET.has(answerLang);
  const promptRtl = RTL_SET.has(promptLang);

  const current = queue[idx] ?? null;
  const total = set?.words.length ?? 0;

  function start(s: DictationSet) {
    setIdRef.current = s.id === "custom" ? hashWords(s.words) : s.id;
    const shuffled = [...s.words].sort(() => Math.random() - 0.5);
    setSet(s);
    setQueue(shuffled);
    setIdx(0);
    setMisses([]);
    setWrongEver(new Set());
    setTyped("");
    setResult(null);
    setPhase("quiz");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function check() {
    if (!current || result) return;
    const ok = norm(typed) === norm(answerOf(current));
    if (ok) {
      setResult("correct");
    } else {
      setResult("wrong");
      setMisses((m) => [...m, current]);
      setWrongEver((s) => new Set(s).add(promptOf(current) + "|" + answerOf(current)));
    }
  }

  function next() {
    setResult(null);
    setTyped("");
    if (idx + 1 < queue.length) {
      setIdx(idx + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    // End of this pass. Re-quiz the misses, or finish.
    if (misses.length > 0) {
      setQueue(misses);
      setMisses([]);
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      void saveSet();
      setCelebration(randomCelebration(lang));
      setCelebrateId((n) => n + 1);
      setPhase("done");
      void notifyParentDictation();
    }
  }

  // Letter-level highlight of the correct answer vs what the kid typed.
  function AnswerDiff({ answer, typedVal }: { answer: string; typedVal: string }) {
    const a = answer.split("");
    const ty = typedVal.trim();
    return (
      <span dir={answerRtl ? "rtl" : "ltr"} style={{ fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
        {a.map((ch, i) => {
          const wrong = norm(ty[i] ?? "") !== norm(ch);
          return (
            <span key={i} style={{ color: wrong ? "#B91C1C" : TEAL, textDecoration: wrong ? "underline" : "none" }}>{ch}</span>
          );
        })}
      </span>
    );
  }

  const page: CSSProperties = { minHeight: "100dvh", background: "var(--paper,#F2F6F4)", fontFamily: '"Rubik", system-ui, sans-serif' };
  const wrap: CSSProperties = { maxWidth: 640, margin: "0 auto", padding: "18px 16px 72px" };

  if (!user) {
    return (
      <div dir={dir} style={page}>
        <div style={wrap}>
          <Link href={href("/")} style={{ fontSize: 13, color: "var(--ink-muted,#6B7280)", textDecoration: "none" }}>{dir === "rtl" ? "→" : "←"} Gadit</Link>
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{t("loginTitle", lang)}</h1>
          </div>
        </div>
      </div>
    );
  }

  // Family / Deep only. Wait for the plan to resolve (planReady) so a paying
  // subscriber never sees the gate flash, then send non-Deep users to pricing.
  if (planReady && !hasAccess) {
    return (
      <div dir={dir} style={page}>
        <div style={wrap}>
          <Link href={href("/")} style={{ fontSize: 13, color: "var(--ink-muted,#6B7280)", textDecoration: "none" }}>{dir === "rtl" ? "→" : "←"} Gadit</Link>
          <div style={{ textAlign: "center", marginTop: 70 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink,#0B1220)", marginBottom: 8 }}>{t("title", lang)}</h1>
            <p style={{ fontSize: 15, color: "var(--ink-muted,#6B7280)", maxWidth: "42ch", margin: "0 auto 20px" }}>
              {lang === "he"
                ? "תרגול ההכתבה זמין למנויי Family. שדרגו כדי לתרגל."
                : "Dictation practice is available on the Family plan. Upgrade to practice."}
            </p>
            <Link href={href("/pricing")} style={{ display: "inline-block", padding: "12px 24px", borderRadius: 12, background: TEAL, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
              {lang === "he" ? "לתוכניות" : "See plans"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} style={page}>
      <div style={wrap}>
        <Link href={href("/")} style={{ fontSize: 13, color: "var(--ink-muted,#6B7280)", textDecoration: "none" }}>{dir === "rtl" ? "→" : "←"} Gadit</Link>

        <header style={{ padding: "16px 0 6px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "var(--ink,#0B1220)", display: "flex", alignItems: "center", gap: 10 }}>
            <span>✍️</span>{t("title", lang)}
          </h1>
          {phase === "pick" && <p style={{ fontSize: 14.5, color: "var(--ink-muted,#6B7280)", margin: "8px 0 0", maxWidth: "52ch" }}>{t("sub", lang)}</p>}
        </header>

        {phase === "pick" && (
          <>
            {/* Your dictations — re-practice a whole series (esp. missed words) */}
            {history.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--teal-deep,#0A7472)", margin: "0 0 10px" }}>
                  {t("yourDictations", lang)}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((h) => (
                    <button key={h.setId} type="button" onClick={() => openSaved(h.setId)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, textAlign: dir === "rtl" ? "right" : "left",
                        background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 13,
                        padding: "11px 13px", cursor: "pointer", fontFamily: "inherit",
                      }}>
                      <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, display: "grid", placeItems: "center", fontSize: 18, background: TEAL + "1A" }}>{h.icon || "✏️"}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: "var(--ink,#0B1220)" }}>{h.title}</span>
                        {typeof h.lastScore === "number" && typeof h.lastTotal === "number" && (
                          <span style={{ display: "block", fontSize: 12, color: "var(--ink-muted,#6B7280)" }}>
                            <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{h.lastScore}/{h.lastTotal}</span>{" "}
                            {t("correctWord", lang)}
                          </span>
                        )}
                      </span>
                      <span style={{ flex: "none", fontSize: 13, fontWeight: 700, color: TEAL }}>
                        {t("practiceAgain", lang)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direction toggle */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0 6px" }}>
              {(["he2en", "en2he"] as Dir[]).map((d) => (
                <button key={d} type="button" onClick={() => setQdir(d)}
                  style={{
                    flex: 1, padding: "11px 10px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    border: "1px solid", borderColor: qdir === d ? TEAL : "var(--hairline,#E5E7EB)",
                    background: qdir === d ? TEAL : "var(--surface,#fff)", color: qdir === d ? "#fff" : "var(--ink,#0B1220)",
                  }}>
                  {dirText(d)}
                </button>
              ))}
            </div>

            {/* Practice mode toggle: type the word, or trace it with a finger */}
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              {(["type", "trace"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "9px 10px", borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                    border: "1px solid", borderColor: mode === m ? "var(--teal-deep,#0A7472)" : "var(--hairline,#E5E7EB)",
                    background: mode === m ? "#0A7472" : "var(--surface,#fff)", color: mode === m ? "#fff" : "var(--ink,#0B1220)",
                  }}>
                  {m === "type" ? "⌨️ " : "✍️ "}{t(m === "type" ? "modeType" : "modeTrace", lang)}
                </button>
              ))}
            </div>

            {/* Create your own set — kid types a topic, Gadit generates 10 words */}
            <div style={{ marginTop: 20, background: "var(--surface,#fff)", border: `1px solid ${TEAL}55`, borderRadius: 16, padding: "16px 16px 14px", boxShadow: `0 6px 18px ${TEAL}12` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: TEAL + "1A", display: "grid", placeItems: "center", fontSize: 18 }}>✨</span>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{t("createTitle", lang)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted,#6B7280)" }}>{t("createSub", lang)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); setCreateMsg(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") createSet(); }}
                  placeholder={t("topicPlaceholder", lang)}
                  dir={dir === "rtl" ? "rtl" : "auto"}
                  maxLength={40}
                  style={{ flex: 1, minWidth: 0, padding: "11px 13px", fontSize: 15, borderRadius: 11, border: "1px solid var(--hairline,#E5E7EB)", outline: "none", background: "var(--paper,#F9FAFB)", color: "var(--ink,#0B1220)" }}
                />
                <button type="button" onClick={createSet} disabled={creating || topic.trim().length < 2}
                  style={{ flex: "none", padding: "11px 16px", borderRadius: 11, border: "none", background: TEAL, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: creating || topic.trim().length < 2 ? 0.6 : 1 }}>
                  {creating ? t("creating", lang) : t("generate", lang)}
                </button>
              </div>
              {createMsg && <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-muted,#6B7280)" }}>{createMsg}</div>}
            </div>

            {/* Paste your own list — one word per line, HE or EN, any source */}
            <div style={{ marginTop: 12, background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16, padding: "16px 16px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: "#EEF2F3", display: "grid", placeItems: "center", fontSize: 18 }}>📝</span>
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{t("pasteTitle", lang)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted,#6B7280)" }}>{t("pasteSub", lang)}</div>
                </div>
              </div>
              <textarea
                value={listText}
                onChange={(e) => { setListText(e.target.value); setCreateMsg(""); }}
                placeholder={t("pastePlaceholder", lang)}
                dir={dir === "rtl" ? "rtl" : "auto"}
                rows={4}
                maxLength={800}
                style={{ width: "100%", padding: "11px 13px", fontSize: 15, borderRadius: 11, border: "1px solid var(--hairline,#E5E7EB)", outline: "none", background: "var(--paper,#F9FAFB)", color: "var(--ink,#0B1220)", resize: "vertical", lineHeight: 1.6 }}
              />
              <button type="button" onClick={createFromList} disabled={creating || listText.trim().length < 2}
                style={{ marginTop: 8, padding: "10px 18px", borderRadius: 11, border: "none", background: TEAL, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: creating || listText.trim().length < 2 ? 0.6 : 1 }}>
                {creating ? t("creating", lang) : t("pasteBtn", lang)}
              </button>
            </div>

            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--teal-deep,#0A7472)", margin: "22px 0 12px" }}>{t("pickCat", lang)}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {DICTATION_SETS.map((s) => (
                <button key={s.id} type="button" onClick={() => startCategory(s)} disabled={!!loadingCat}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: dir === "rtl" ? "right" : "left",
                    background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 15,
                    padding: "14px 15px", cursor: loadingCat ? "default" : "pointer", fontFamily: "inherit",
                    opacity: loadingCat && loadingCat !== s.id ? 0.5 : 1,
                  }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 20, background: TEAL + "1A" }}>{loadingCat === s.id ? "⏳" : s.icon}</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink,#0B1220)" }}>{getCatTitle(s.id, lang)}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--ink-muted,#6B7280)" }}>{s.words.length} {lang === "he" ? "מילים" : "words"}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === "quiz" && current && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12.5, color: "var(--ink-muted,#6B7280)", fontWeight: 600, marginBottom: 10 }}>
              <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block" }}>{idx + 1} / {queue.length}</span>
            </div>

            {/* Prompt word + speaker (reads it aloud like a teacher dictating) */}
            <div style={{ background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 18, padding: "26px 20px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span dir={promptRtl ? "rtl" : "ltr"} style={{ fontSize: 30, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{promptOf(current)}</span>
                <TTSButton text={promptOf(current)} audioLang={promptLang} ariaLabel={t("listen", lang)} />
              </div>

              {mode === "type" ? (
                <>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted,#9CA3AF)", marginTop: 14 }}>
                    {answerLang === "en" ? t("writeEn", lang) : fmt(t("writeNative", lang), { lang: nativeName })}
                  </div>
                  <input
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { result ? next() : check(); } }}
                    dir={answerRtl ? "rtl" : "ltr"}
                    autoCapitalize="off" autoCorrect="off" spellCheck={false}
                    disabled={result === "correct"}
                    style={{
                      width: "100%", marginTop: 8, padding: "12px 14px", fontSize: 22, fontWeight: 700, textAlign: "center",
                      borderRadius: 12, border: "2px solid", outline: "none",
                      borderColor: result === "correct" ? TEAL : result === "wrong" ? "#FCA5A5" : "var(--hairline,#E5E7EB)",
                      background: result === "correct" ? "#ECFDF5" : "var(--paper,#F9FAFB)", color: "var(--ink,#0B1220)",
                    }}
                  />

                  {/* Feedback */}
                  {result === "correct" && (
                    <div style={{ marginTop: 14, fontSize: 16, fontWeight: 800, color: TEAL }}>✓ {t("correct", lang)}</div>
                  )}
                  {result === "wrong" && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13.5, color: "#B91C1C", marginBottom: 6 }}>{t("almost", lang)}</div>
                      <AnswerDiff answer={answerOf(current)} typedVal={typed} />
                    </div>
                  )}

                  <button type="button" onClick={() => (result ? next() : check())}
                    style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {result ? t("next", lang) : t("check", lang)}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted,#9CA3AF)", margin: "14px 0 8px" }}>{t("traceHint", lang)}</div>
                  <TraceCanvas key={promptOf(current) + ":" + idx} word={answerOf(current)} rtl={answerRtl} clearLabel={t("clear", lang)} />
                  <button type="button" onClick={next}
                    style={{ marginTop: 16, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {t("next", lang)}
                  </button>
                </>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button type="button" onClick={() => setPhase("pick")} style={{ background: "none", border: "none", color: "var(--ink-muted,#6B7280)", fontSize: 13, cursor: "pointer" }}>{t("back", lang)}</button>
            </div>
          </div>
        )}

        {phase === "done" && set && (
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <KidsCelebration runId={celebrateId} />
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--ink,#0B1220)", margin: "8px 0 6px" }}>{celebration || t("doneTitle", lang)}</h2>
            <p style={{ fontSize: 15, color: "var(--ink-muted,#6B7280)" }}>{fmt(t("doneBody", lang), { a: total - wrongEver.size, b: total })}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              <button type="button" onClick={() => start(set)} style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{t("again", lang)}</button>
              <button type="button" onClick={() => setPhase("pick")} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid var(--hairline,#E5E7EB)", background: "transparent", color: "var(--ink,#0B1220)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{t("back", lang)}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
