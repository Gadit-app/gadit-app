"use client";

/**
 * SayTool — the "Say it in ___" pronunciation-practice tool body.
 *
 * Shared by the /say page (SayClient) and the global SayModal so a kid can
 * open it as a window over their own skinned screen without losing their
 * theme or a way back (Gadi 2026-08-18). Renders just the tool (title, sub,
 * gates, form, result); the page / modal supply the surrounding chrome.
 * Pass `onClose` to show a close (X) button (modal use).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { TTSButton } from "@/components/design/TTSButton";
import VoiceInput from "@/components/VoiceInput";

type Copy = {
  title: string; sub: string; from: string; to: string;
  placeholder: string; button: string; loading: string;
  hearing: string; tip: string; loginTitle: string; loginBody: string;
  loginCta: string; errGeneric: string; speak: string;
  paidTitle: string; paidBody: string; paidCta: string; close: string;
  practiceTitle: string; practiceHint: string; practiceBtn: string;
  pcCorrect: string; pcClose: string; pcWrong: string; heardLabel: string;
};
const COPY: Partial<Record<Lang, Copy>> = {
  en: {
    title: "Say it in another language",
    sub: "Type a sentence, pick the language you're learning, and hear exactly how to say it.",
    from: "I'll type in", to: "Say it in",
    placeholder: "Type a sentence to practise saying…",
    button: "Say it", loading: "Translating…",
    hearing: "Here's how to say it", tip: "Pronunciation tip",
    loginTitle: "Sign in to practise",
    loginBody: "Speaking practice is part of your Gadit account.",
    loginCta: "Go to Gadit",
    errGeneric: "Something went wrong. Try again.",
    speak: "Speak instead of typing",
    paidTitle: "A paid feature",
    paidBody: "Say it is part of the Clear, Deep, Family and Schools plans.",
    paidCta: "See plans", close: "Close",
    practiceTitle: "Now you try",
    practiceHint: "Say it aloud, and I'll check your pronunciation.",
    practiceBtn: "Practice saying it",
    pcCorrect: "Spot on. That sounded right.",
    pcClose: "Almost there. Listen again and give it one more go.",
    pcWrong: "Not quite yet. Hear it again, then try once more.",
    heardLabel: "I heard",
  },
  he: {
    title: "תגיד את זה בשפה אחרת",
    sub: "מקלידים משפט, בוחרים את השפה שאתה לומד, ושומעים בדיוק איך אומרים את זה.",
    from: "אקליד ב", to: "תגיד ב",
    placeholder: "הקלד משפט לתרגול…",
    button: "תגיד את זה", loading: "מתרגם…",
    hearing: "ככה אומרים את זה", tip: "טיפ להגייה",
    loginTitle: "התחבר כדי לתרגל",
    loginBody: "תרגול דיבור הוא חלק מהחשבון שלך בגדית.",
    loginCta: "לגדית",
    errGeneric: "משהו השתבש. נסה שוב.",
    speak: "לדבר במקום להקליד",
    paidTitle: "פיצ'ר בתוכניות בתשלום",
    paidBody: "תגיד את זה זמין בתוכניות Clear, Deep, Family ו-Schools.",
    paidCta: "לתוכניות", close: "סגור",
    practiceTitle: "עכשיו תורך",
    practiceHint: "אמרו את זה בקול, ואבדוק את ההגייה.",
    practiceBtn: "תרגול הגייה",
    pcCorrect: "מדויק. נשמע נכון.",
    pcClose: "כמעט. הקשיבו שוב ונסו עוד פעם.",
    pcWrong: "עוד לא בדיוק. הקשיבו שוב, ותנסו שוב.",
    heardLabel: "שמעתי",
  },
};
function copy(lang: Lang): Copy {
  return COPY[lang] ?? COPY.en!;
}
function dirOf(code: string): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";
}

// ── Pronunciation scoring (Gadi 2026-08-25) ──────────────────────────────
// The learner speaks the target phrase; /api/transcribe (Whisper, hinted to the
// target language) returns what it heard. If the target-language recognizer
// produces the target word, the pronunciation was clear enough. Normalize both
// (case, punctuation, and Latin/Hebrew/Arabic diacritics) and compare.
function normPron(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-֑ͯ-ׇֽֿׁׂًׅׄ-ٰٟ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
function scorePron(target: string, spoken: string): "correct" | "close" | "wrong" {
  const t = normPron(target), s = normPron(spoken);
  if (!s || !t) return "wrong";
  if (t === s) return "correct";
  if (t.length >= 2 && s.length >= 2 && (t.includes(s) || s.includes(t))) {
    const ratio = Math.min(t.length, s.length) / Math.max(t.length, s.length);
    return ratio >= 0.8 ? "correct" : "close";
  }
  const sim = 1 - levenshtein(t, s) / Math.max(t.length, s.length);
  if (sim >= 0.85) return "correct";
  if (sim >= 0.6) return "close";
  return "wrong";
}

export function SayTool({ onClose }: { onClose?: () => void }) {
  const { lang, dir } = useLang();
  const { user, plan } = useAuth();
  const href = useHref();
  const t = copy(lang);
  const paid = plan === "clear" || plan === "deep";

  const [sourceLang, setSourceLang] = useState<string>(lang);
  const [targetLang, setTargetLang] = useState<string>(lang === "en" ? "es" : "en");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    translation: string; romanization: string; tip: string; targetLang: string;
  } | null>(null);
  const [pron, setPron] = useState<{ status: "correct" | "close" | "wrong"; heard: string } | null>(null);

  useEffect(() => { setSourceLang(lang); }, [lang]);

  const checkPron = useCallback((spoken: string) => {
    setResult((r) => {
      if (r) setPron({ status: scorePron(r.translation, spoken), heard: spoken });
      return r;
    });
  }, []);

  const autoPlayedRef = useRef<string>("");

  const submit = useCallback(async () => {
    if (!user || !text.trim() || busy) return;
    setBusy(true); setError(""); setResult(null); setPron(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/say", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ text: text.trim(), targetLang, sourceLang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError(t.errGeneric);
    } finally {
      setBusy(false);
    }
  }, [user, text, busy, targetLang, sourceLang, t.errGeneric]);

  useEffect(() => {
    if (!result || !user) return;
    if (plan !== "clear" && plan !== "deep") return;
    const key = `${result.targetLang}|${result.translation}`;
    if (autoPlayedRef.current === key) return;
    autoPlayedRef.current = key;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const r = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ text: result.translation, lang: result.targetLang }),
        });
        if (!r.ok) return;
        const url = URL.createObjectURL(await r.blob());
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        void audio.play();
      } catch { /* best effort */ }
    })();
  }, [result, user, plan]);

  const learnable = LANGUAGES;

  return (
    <div dir={dir} style={{ position: "relative" }}>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          title={t.close}
          style={{
            position: "absolute", insetInlineEnd: -4, top: -4, width: 36, height: 36,
            borderRadius: "50%", border: "none", cursor: "pointer", background: "transparent",
            color: "var(--ink, #14181F)", opacity: 0.55, fontSize: 22, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>
      )}

      <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, margin: "0 0 8px", textWrap: "balance", paddingInlineEnd: onClose ? 32 : 0 }}>{t.title}</h1>
      <p style={{ fontSize: 15, opacity: 0.7, margin: "0 0 22px" }}>{t.sub}</p>

      {!user ? (
        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.loginTitle}</div>
          <div style={{ fontSize: 15, opacity: 0.7, marginBottom: 18 }}>{t.loginBody}</div>
          <a href={href("/")} style={{ display: "inline-block", background: "#0EA5A5", color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>{t.loginCta}</a>
        </div>
      ) : !paid ? (
        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.paidTitle}</div>
          <div style={{ fontSize: 15, opacity: 0.7, marginBottom: 18 }}>{t.paidBody}</div>
          <a href={href("/pricing")} style={{ display: "inline-block", background: "#0EA5A5", color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>{t.paidCta}</a>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600, opacity: 0.75 }}>
              {t.from}
              <LangSelect value={sourceLang} onChange={setSourceLang} />
            </label>
            <label style={{ flex: "1 1 180px", fontSize: 13, fontWeight: 600, opacity: 0.75 }}>
              {t.to}
              <LangSelect value={targetLang} onChange={setTargetLang} options={learnable} />
            </label>
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={3}
              dir={dirOf(sourceLang)}
              maxLength={500}
              style={{
                width: "100%", boxSizing: "border-box", fontSize: 18, lineHeight: 1.45,
                padding: "14px 16px 48px", borderRadius: 14, border: "1px solid var(--rule, #E7E7E2)",
                background: "var(--surface, #fff)", color: "inherit", resize: "vertical", fontFamily: "inherit",
              }}
            />
            <div style={{ position: "absolute", bottom: 10, insetInlineEnd: 10 }}>
              <VoiceInput
                uiLang={sourceLang}
                getIdToken={async () => (user ? await user.getIdToken() : null)}
                enabled={plan === "clear" || plan === "deep"}
                title={t.speak}
                onResult={(spoken) => setText((p) => (p.trim() ? p.trim() + " " + spoken : spoken))}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy || !text.trim()}
            style={{
              marginTop: 14, width: "100%", background: busy || !text.trim() ? "#9CA3AF" : "#0EA5A5",
              color: "#fff", fontWeight: 700, fontSize: 17, padding: "14px", borderRadius: 999,
              border: "none", cursor: busy || !text.trim() ? "default" : "pointer",
            }}
          >
            {busy ? t.loading : t.button}
          </button>

          {error && <div style={{ marginTop: 16, color: "#DC2626", fontSize: 15 }}>{error}</div>}

          {result && (
            <div style={{ marginTop: 26, background: "var(--surface, #fff)", border: "1px solid var(--rule, #E7E7E2)", borderRadius: 18, padding: "22px 22px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0EA5A5", marginBottom: 12 }}>
                {t.hearing} · {LANGUAGES.find((l) => l.code === result.targetLang)?.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div dir={dirOf(result.targetLang)} style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, flex: 1 }}>
                  {result.translation}
                </div>
                <TTSButton
                  text={result.translation}
                  audioLang={result.targetLang}
                  useOpenAI={plan === "clear" || plan === "deep"}
                  ariaLabel={t.hearing}
                  className="wb-word-listen-btn"
                />
              </div>
              {result.romanization && (
                <div style={{ marginTop: 10, fontSize: 17, opacity: 0.6, fontStyle: "italic" }}>{result.romanization}</div>
              )}
              {result.tip && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--rule, #E7E7E2)", fontSize: 14, opacity: 0.8 }}>
                  <span style={{ fontWeight: 700 }}>{t.tip}: </span>{result.tip}
                </div>
              )}

              {/* Pronunciation practice: the learner says it, Gadit checks. */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--rule, #E7E7E2)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0EA5A5", marginBottom: 6 }}>{t.practiceTitle}</div>
                <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 12 }}>{t.practiceHint}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <VoiceInput
                    key={result.translation}
                    uiLang={result.targetLang}
                    getIdToken={async () => (user ? await user.getIdToken() : null)}
                    enabled={paid}
                    title={t.practiceBtn}
                    onResult={checkPron}
                  />
                  <span style={{ fontSize: 14, opacity: 0.7 }}>{t.practiceBtn}</span>
                </div>
                {pron && (() => {
                  const c = pron.status === "correct"
                    ? { bg: "rgba(16,185,129,0.1)", bd: "rgba(16,185,129,0.35)", fg: "#047857", ic: "✓", msg: t.pcCorrect }
                    : pron.status === "close"
                      ? { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.4)", fg: "#b45309", ic: "≈", msg: t.pcClose }
                      : { bg: "rgba(239,68,68,0.1)", bd: "rgba(239,68,68,0.35)", fg: "#b91c1c", ic: "↻", msg: t.pcWrong };
                  return (
                    <div style={{ marginTop: 14, borderRadius: 12, padding: "12px 14px", background: c.bg, border: `1px solid ${c.bd}` }}>
                      <div style={{ fontWeight: 700, color: c.fg, fontSize: 15 }}><span aria-hidden="true">{c.ic}</span> {c.msg}</div>
                      {pron.status !== "correct" && (
                        <div style={{ marginTop: 5, fontSize: 14, opacity: 0.85 }}>
                          {t.heardLabel}: <span dir={dirOf(result.targetLang)} style={{ fontWeight: 600 }}>{pron.heard}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LangSelect({
  value, onChange, options = LANGUAGES,
}: {
  value: string; onChange: (v: string) => void;
  options?: typeof LANGUAGES;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        display: "block", width: "100%", marginTop: 6, fontSize: 16, fontWeight: 600,
        padding: "10px 12px", borderRadius: 12, border: "1px solid var(--rule, #E7E7E2)",
        background: "var(--surface, #fff)", color: "inherit", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {options.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
