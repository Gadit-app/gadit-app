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
  },
};
function copy(lang: Lang): Copy {
  return COPY[lang] ?? COPY.en!;
}
function dirOf(code: string): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === code)?.dir ?? "ltr";
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

  useEffect(() => { setSourceLang(lang); }, [lang]);

  const autoPlayedRef = useRef<string>("");

  const submit = useCallback(async () => {
    if (!user || !text.trim() || busy) return;
    setBusy(true); setError(""); setResult(null);
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
            color: "var(--wb-ink, #14181F)", opacity: 0.55, fontSize: 22, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ×
        </button>
      )}

      <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, margin: "0 0 8px", textWrap: "balance", paddingInlineEnd: onClose ? 32 : 0 }}>{t.title}</h1>
      <p style={{ fontSize: 15, opacity: 0.7, margin: "0 0 22px" }}>{t.sub}</p>

      {!user ? (
        <div style={{ background: "var(--wb-card, #fff)", border: "1px solid var(--wb-border, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{t.loginTitle}</div>
          <div style={{ fontSize: 15, opacity: 0.7, marginBottom: 18 }}>{t.loginBody}</div>
          <a href={href("/")} style={{ display: "inline-block", background: "#0EA5A5", color: "#fff", fontWeight: 700, padding: "12px 24px", borderRadius: 999, textDecoration: "none" }}>{t.loginCta}</a>
        </div>
      ) : !paid ? (
        <div style={{ background: "var(--wb-card, #fff)", border: "1px solid var(--wb-border, #E7E7E2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
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
                padding: "14px 16px 48px", borderRadius: 14, border: "1px solid var(--wb-border, #E7E7E2)",
                background: "var(--wb-card, #fff)", color: "inherit", resize: "vertical", fontFamily: "inherit",
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
            <div style={{ marginTop: 26, background: "var(--wb-card, #fff)", border: "1px solid var(--wb-border, #E7E7E2)", borderRadius: 18, padding: "22px 22px 24px" }}>
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
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--wb-border, #E7E7E2)", fontSize: 14, opacity: 0.8 }}>
                  <span style={{ fontWeight: 700 }}>{t.tip}: </span>{result.tip}
                </div>
              )}
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
        padding: "10px 12px", borderRadius: 12, border: "1px solid var(--wb-border, #E7E7E2)",
        background: "var(--wb-card, #fff)", color: "inherit", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {options.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
