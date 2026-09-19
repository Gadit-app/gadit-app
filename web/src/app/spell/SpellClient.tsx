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

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { TTSButton } from "@/components/design/TTSButton";
import { DICTATION_SETS, type DictationSet, type WordPair } from "@/lib/dictation-sets";

type Dir = "he2en" | "en2he";
type Dict = Record<string, string>;
const pick = (d: Dict, lang: string) => d[lang] ?? d.en;

const T = {
  title: { en: "Spelling practice", he: "תרגול הכתבה" },
  sub: { en: "Practice your school spelling words. The app reads a word, you write it.", he: "מתרגלים את מילות ההכתבה מבית הספר. האפליקציה מקריאה מילה, ואתם כותבים אותה." },
  pickCat: { en: "Pick a topic", he: "בחרו נושא" },
  dirLabel: { en: "Direction", he: "כיוון" },
  he2en: { en: "Hebrew → English", he: "עברית ← אנגלית" },
  en2he: { en: "English → Hebrew", he: "אנגלית ← עברית" },
  writeEn: { en: "Write in English", he: "כתבו באנגלית" },
  writeHe: { en: "Write in Hebrew", he: "כתבו בעברית" },
  check: { en: "Check", he: "בדיקה" },
  next: { en: "Next", he: "הבא" },
  correct: { en: "Correct!", he: "נכון!" },
  almost: { en: "Not quite. The correct spelling:", he: "לא בדיוק. הכתיב הנכון:" },
  listen: { en: "Listen", he: "האזנה" },
  back: { en: "Back", he: "חזרה" },
  again: { en: "Practice again", he: "לתרגל שוב" },
  doneTitle: { en: "Great work!", he: "כל הכבוד!" },
  doneBody: { en: "{a} of {b} right on the first try.", he: "{a} מתוך {b} נכון בפעם הראשונה." },
  retryMisses: { en: "Now let's fix the ones you missed.", he: "עכשיו נתקן את אלה שטעיתם בהם." },
  loginTitle: { en: "Sign in to practice", he: "התחברו כדי לתרגל" },
  progress: { en: "{a} / {b}", he: "{a} / {b}" },
  createTitle: { en: "Create your own set", he: "יצירת סט משלך" },
  createSub: { en: "Type any topic and get 10 words to practice.", he: "הקלידו נושא וקבלו 10 מילים לתרגול." },
  topicPlaceholder: { en: "A topic, e.g. aliens", he: "נושא, למשל חייזרים" },
  generate: { en: "Create set", he: "יצירת סט" },
  creating: { en: "Creating…", he: "יוצר…" },
  unsafe: { en: "Let's pick a different topic 🙂", he: "בואו נבחר נושא אחר 🙂" },
  createErr: { en: "Could not create that. Try another topic.", he: "לא הצלחנו. נסו נושא אחר." },
  modeType: { en: "Type it", he: "הקלדה" },
  modeTrace: { en: "Trace it", he: "כתיבה ביד" },
  traceHint: { en: "Trace the word with your finger", he: "עקבו על המילה עם האצבע" },
  clear: { en: "Clear", he: "ניקוי" },
};
const t = (k: keyof typeof T, lang: string) => pick(T[k], lang);
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

// Kid-friendly, GENDER-NEUTRAL celebrations shown on finishing (Gadi 2026-09-19:
// avoid gendered 2nd-person verbs; use interjections + neutral phrases). One is
// picked at random each time.
const CELEBRATIONS: Record<string, string[]> = {
  he: [
    "אליפות! 🏆", "מושלם! ⭐", "כל הכבוד! 👏", "פצצה! 💥", "וואו, איזה יופי!",
    "אין על זה! 🔥", "מדהים! 🤩", "סחתיין! 💪", "ברמות! 🚀", "עשר מתוך עשר! 🎯",
    "פשוט מלכות! 👑", "חבל על הזמן! 😍",
  ],
  en: [
    "Awesome! 🏆", "Perfect! ⭐", "Way to go! 👏", "Boom! 💥", "Amazing! 🤩",
    "Nailed it! 🎯", "You crushed it! 🔥", "Superstar! 🌟", "Incredible! 🚀", "10 out of 10!",
  ],
};
function randomCelebration(lang: string): string {
  const arr = CELEBRATIONS[lang] ?? CELEBRATIONS.en;
  return arr[Math.floor(Math.random() * arr.length)];
}

const TEAL = "#0EA5A5";
function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
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
  const { user } = useAuth();

  const [qdir, setQdir] = useState<Dir>("he2en");
  const [mode, setMode] = useState<"type" | "trace">("type");
  const [set, setSet] = useState<DictationSet | null>(null);
  const [queue, setQueue] = useState<WordPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [misses, setMisses] = useState<WordPair[]>([]);
  const [wrongEver, setWrongEver] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [phase, setPhase] = useState<"pick" | "quiz" | "done">("pick");
  const [celebration, setCelebration] = useState("");
  const [topic, setTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ topic: tp, uiLang: lang }),
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

  const promptOf = (w: WordPair) => (qdir === "he2en" ? w.he : w.en);
  const answerOf = (w: WordPair) => (qdir === "he2en" ? w.en : w.he);
  const answerLang = qdir === "he2en" ? "en" : "he";
  const promptLang = qdir === "he2en" ? "he" : "en";

  const current = queue[idx] ?? null;
  const total = set?.words.length ?? 0;

  function start(s: DictationSet) {
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
      setCelebration(randomCelebration(lang));
      setPhase("done");
    }
  }

  // Letter-level highlight of the correct answer vs what the kid typed.
  function AnswerDiff({ answer, typedVal }: { answer: string; typedVal: string }) {
    const a = answer.split("");
    const ty = typedVal.trim();
    return (
      <span dir={answerLang === "he" ? "rtl" : "ltr"} style={{ fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
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
            {/* Direction toggle */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0 6px" }}>
              {(["he2en", "en2he"] as Dir[]).map((d) => (
                <button key={d} type="button" onClick={() => setQdir(d)}
                  style={{
                    flex: 1, padding: "11px 10px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer",
                    border: "1px solid", borderColor: qdir === d ? TEAL : "var(--hairline,#E5E7EB)",
                    background: qdir === d ? TEAL : "var(--surface,#fff)", color: qdir === d ? "#fff" : "var(--ink,#0B1220)",
                  }}>
                  {t(d, lang)}
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
                  dir="auto"
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

            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--teal-deep,#0A7472)", margin: "22px 0 12px" }}>{t("pickCat", lang)}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {DICTATION_SETS.map((s) => (
                <button key={s.id} type="button" onClick={() => start(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: dir === "rtl" ? "right" : "left",
                    background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 15,
                    padding: "14px 15px", cursor: "pointer", fontFamily: "inherit",
                  }}>
                  <span style={{ width: 40, height: 40, flex: "none", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 20, background: TEAL + "1A" }}>{s.icon}</span>
                  <span>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--ink,#0B1220)" }}>{lang === "he" ? s.titleHe : s.titleEn}</span>
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
                <span dir={promptLang === "he" ? "rtl" : "ltr"} style={{ fontSize: 30, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{promptOf(current)}</span>
                <TTSButton text={promptOf(current)} audioLang={promptLang} ariaLabel={t("listen", lang)} />
              </div>

              {mode === "type" ? (
                <>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted,#9CA3AF)", marginTop: 14 }}>
                    {answerLang === "en" ? t("writeEn", lang) : t("writeHe", lang)}
                  </div>
                  <input
                    ref={inputRef}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { result ? next() : check(); } }}
                    dir={answerLang === "he" ? "rtl" : "ltr"}
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
                  <TraceCanvas key={promptOf(current) + ":" + idx} word={answerOf(current)} rtl={answerLang === "he"} clearLabel={t("clear", lang)} />
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
            <div style={{ fontSize: 46 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink,#0B1220)", margin: "8px 0 6px" }}>{celebration || t("doneTitle", lang)}</h2>
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
