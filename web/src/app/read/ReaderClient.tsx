"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { ReaderText } from "@/components/design/ReaderText";
import { distinctWordCount, wordKey } from "@/lib/tokenize-words";
import type { Lang } from "@/lib/i18n";

/**
 * /read — the Reader. Paste or photograph a passage; Gadit lays it out as
 * tappable words; the reader goes word by word, opening meanings, and each
 * word gets a green check. Progress is per-text and persisted locally so a
 * refresh keeps it.
 *
 * Access: paid tiers (the OCR call costs money) — same gate as the other AI
 * tools. Reviewed words also flow through the normal look-up path, so they
 * still land in the notebook / vocabulary history.
 */

function fontBody(lang: Lang): string {
  if (lang === "he") return "var(--wb-he)";
  if (lang === "ar") return "var(--wb-ar)";
  if (lang === "ja") return "var(--wb-jp)";
  if (lang === "hi") return "var(--wb-hi)";
  return "var(--wb-sans)";
}

function hashText(t: string): string {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function copy(lang: Lang) {
  const en = {
    title: "Read a text",
    sub: "Paste a text or photograph a page. Gadit turns every word into a tap, so you can go word by word and reveal all its meanings.",
    placeholder: "Paste your text here…",
    load: "Open text",
    photo: "Photo, image or PDF",
    reading: "Reading the file…",
    ocrError: "We couldn't read that file. Try a clearer photo, or a PDF / image with readable text.",
    newText: "New text",
    progress: (a: number, b: number) => `${a} of ${b} words`,
    doneAll: "Nice work. You went over every word.",
    hint: "Tap any word to see its meanings. Words you've opened turn green.",
    loginTitle: "Sign in to read a text",
    loginBtn: "Sign in",
    upgradeTitle: "Reading a text is a paid feature",
    upgradeBtn: "See plans",
    loading: "Loading…",
  };
  const he: typeof en = {
    title: "קריאת טקסט",
    sub: "להדביק טקסט או לצלם עמוד. גדית הופך כל מילה ללחיצה, ואפשר לעבור מילה-מילה ולגלות את כל המשמעויות שלה.",
    placeholder: "להדביק כאן את הטקסט…",
    load: "לפתוח את הטקסט",
    photo: "צילום, תמונה או PDF",
    reading: "קורא את הקובץ…",
    ocrError: "לא הצלחנו לקרוא את הקובץ. כדאי צילום ברור יותר, או PDF/תמונה עם טקסט קריא.",
    newText: "טקסט חדש",
    progress: (a: number, b: number) => `${a} מתוך ${b} מילים`,
    doneAll: "כל הכבוד. עברת על כל המילים.",
    hint: "לוחצים על כל מילה כדי לראות את המשמעויות. מילים שפתחת נצבעות בירוק.",
    loginTitle: "צריך להתחבר כדי לקרוא טקסט",
    loginBtn: "התחברות",
    upgradeTitle: "קריאת טקסט היא תכונה בתשלום",
    upgradeBtn: "לצפייה במסלולים",
    loading: "טוען…",
  };
  return lang === "he" ? he : en;
}

export function ReaderClient() {
  const { user, plan, loading: authLoading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const t = copy(lang);

  const [draft, setDraft] = useState("");
  const [text, setText] = useState("");
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [ocrState, setOcrState] = useState<"idle" | "reading" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const total = useMemo(() => (text ? distinctWordCount(text) : 0), [text]);
  const storageKey = useMemo(() => (text ? `gadit-reader-${hashText(text)}` : ""), [text]);

  // Load persisted progress when a text is opened.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      setReviewed(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch { setReviewed(new Set()); }
  }, [storageKey]);

  function markReviewed(word: string) {
    const key = wordKey(word);
    setReviewed((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      }
      return next;
    });
  }

  function openText() {
    const v = draft.trim();
    if (v) setText(v);
  }

  function resetText() {
    setText("");
    setDraft("");
    setReviewed(new Set());
    setOcrState("idle");
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    setOcrState("reading");
    try {
      const idToken = await user.getIdToken();
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { text?: string };
      if (res.ok && j.text && j.text.trim()) {
        setDraft(j.text);
        setText(j.text.trim());
        setOcrState("idle");
      } else {
        setOcrState("error");
      }
    } catch {
      setOcrState("error");
    }
  }

  const allDone = total > 0 && reviewed.size >= total;

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <div className="wb-shell-actions">{user ? <WbUserMenu /> : null}</div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 96px", fontFamily: fontBody(lang) }}>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px,4.5vw,36px)", fontWeight: 800, color: "var(--ink,#20272E)" }}>
          {t.title}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 16.5, lineHeight: 1.55, color: "var(--ink-muted,#6B7280)", maxWidth: "56ch" }}>
          {t.sub}
        </p>

        {authLoading ? (
          <div style={{ color: "var(--ink-muted,#6B7280)" }}>{t.loading}</div>
        ) : !user ? (
          <Gate title={t.loginTitle} btn={t.loginBtn} onClick={() => promptLogin?.()} />
        ) : plan === "basic" ? (
          <Gate title={t.upgradeTitle} btn={t.upgradeBtn} href={href("/pricing")} />
        ) : !text ? (
          // Input state: paste or photograph.
          <div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t.placeholder}
              dir={dir}
              rows={8}
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--hairline,#E5E7EB)", fontSize: 16, lineHeight: 1.6, fontFamily: "inherit", background: "var(--card,#fff)", color: "var(--ink,#20272E)", resize: "vertical", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
              <button
                type="button"
                onClick={openText}
                disabled={!draft.trim()}
                style={{ background: "var(--teal,#0EA5A5)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: draft.trim() ? "pointer" : "default", opacity: draft.trim() ? 1 : 0.5, fontFamily: "inherit" }}
              >
                {t.load}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={ocrState === "reading"}
                style={{ background: "transparent", color: "var(--ink,#20272E)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                {ocrState === "reading" ? t.reading : `📷 ${t.photo}`}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onPhoto} style={{ display: "none" }} />
            </div>
            {ocrState === "error" && (
              <p style={{ marginTop: 12, color: "#B91C1C", fontSize: 14 }}>{t.ocrError}</p>
            )}
          </div>
        ) : (
          // Reading state.
          <div>
            {/* Sticky progress bar */}
            <div style={{ position: "sticky", top: 8, zIndex: 20, background: "var(--paper,#F9FAFB)", paddingBottom: 12, marginBottom: 16, borderBottom: "1px solid var(--hairline,#E5E7EB)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: allDone ? "#16A34A" : "var(--ink,#20272E)" }}>
                  {allDone ? t.doneAll : t.progress(reviewed.size, total)}
                </span>
                <button type="button" onClick={resetText} style={{ background: "none", border: "none", color: "var(--teal-deep,#0E7490)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                  {t.newText}
                </button>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "var(--hairline,#E5E7EB)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total ? Math.round((reviewed.size / total) * 100) : 0}%`, background: allDone ? "#16A34A" : "var(--teal,#0EA5A5)", borderRadius: 999, transition: "width 0.25s" }} />
              </div>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--ink-muted,#9CA3AF)" }}>{t.hint}</p>
            <ReaderText text={text} reviewed={reviewed} onReview={markReviewed} />
          </div>
        )}
      </main>
    </div>
  );
}

function Gate({ title, btn, onClick, href }: { title: string; btn: string; onClick?: () => void; href?: string }) {
  const inner = (
    <span style={{ display: "inline-block", background: "var(--teal,#0EA5A5)", color: "#fff", borderRadius: 12, padding: "11px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
      {btn}
    </span>
  );
  return (
    <div style={{ background: "var(--card,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16, padding: 26 }}>
      <p style={{ margin: "0 0 16px", fontSize: 16, color: "var(--ink,#20272E)" }}>{title}</p>
      {href ? <Link href={href}>{inner}</Link> : <span onClick={onClick}>{inner}</span>}
    </div>
  );
}
