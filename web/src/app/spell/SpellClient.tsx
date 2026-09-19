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

import { useRef, useState, type CSSProperties } from "react";
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
};
const t = (k: keyof typeof T, lang: string) => pick(T[k], lang);
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

const TEAL = "#0EA5A5";
function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function SpellClient() {
  const { lang, dir } = useLang();
  const href = useHref();
  const { user } = useAuth();

  const [qdir, setQdir] = useState<Dir>("he2en");
  const [set, setSet] = useState<DictationSet | null>(null);
  const [queue, setQueue] = useState<WordPair[]>([]);
  const [idx, setIdx] = useState(0);
  const [misses, setMisses] = useState<WordPair[]>([]);
  const [wrongEver, setWrongEver] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<null | "correct" | "wrong">(null);
  const [phase, setPhase] = useState<"pick" | "quiz" | "done">("pick");
  const inputRef = useRef<HTMLInputElement>(null);

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

            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--teal-deep,#0A7472)", margin: "20px 0 12px" }}>{t("pickCat", lang)}</h2>
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
              {fmt(t("progress", lang), { a: idx + 1, b: queue.length })}
            </div>

            {/* Prompt word + speaker (reads it aloud like a teacher dictating) */}
            <div style={{ background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 18, padding: "26px 20px", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span dir={promptLang === "he" ? "rtl" : "ltr"} style={{ fontSize: 30, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{promptOf(current)}</span>
                <TTSButton text={promptOf(current)} audioLang={promptLang} ariaLabel={t("listen", lang)} />
              </div>

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
            </div>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button type="button" onClick={() => setPhase("pick")} style={{ background: "none", border: "none", color: "var(--ink-muted,#6B7280)", fontSize: 13, cursor: "pointer" }}>{t("back", lang)}</button>
            </div>
          </div>
        )}

        {phase === "done" && set && (
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <div style={{ fontSize: 46 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink,#0B1220)", margin: "8px 0 6px" }}>{t("doneTitle", lang)}</h2>
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
