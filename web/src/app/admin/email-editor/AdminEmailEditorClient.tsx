"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

type Content = { subject: string; heading: string; body: string; ctaText: string };
type LangBlock = { content: Content; overridden: boolean };
type EmailRow = { key: string; label: string; dayOffset: number };
type RoMail = { subject: string; html: string };

const EMPTY: Content = { subject: "", heading: "", body: "", ctaText: "" };
const TEST_TO_KEY = "gadit_admin_test_to";

export function AdminEmailEditorClient() {
  const { secret, lang: adminLang } = useAdminContext();
  const he = adminLang === "he";

  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [signup, setSignup] = useState<EmailRow[]>([]);
  const [series, setSeries] = useState<"family" | "signup">("family");
  const [key, setKey] = useState<string>("");
  const [tab, setTab] = useState<"he" | "en">("he");
  const [data, setData] = useState<{ he: LangBlock; en: LangBlock } | null>(null);
  const [ro, setRo] = useState<RoMail | null>(null); // read-only signup render
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [testTo, setTestTo] = useState<string>("");

  const api = `/api/admin/email-templates?secret=${encodeURIComponent(secret)}`;
  const isSignup = series === "signup";

  useEffect(() => {
    try { setTestTo(localStorage.getItem(TEST_TO_KEY) || ""); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(api);
        const d = await r.json();
        setEmails(d.emails ?? []);
        setSignup(d.signup ?? []);
        if (d.emails?.[0]) setKey(d.emails[0].key);
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  const loadKey = useCallback(async (k: string, forSeries: "family" | "signup", forTab: "he" | "en") => {
    setPreview(""); setStatus("");
    try {
      if (forSeries === "signup") {
        const r = await fetch(`${api}&key=${encodeURIComponent(k)}&lang=${forTab}`);
        const d = await r.json();
        setData(null);
        setRo(d?.readonly ? { subject: d.subject, html: d.html } : null);
      } else {
        const r = await fetch(`${api}&key=${encodeURIComponent(k)}`);
        const d = await r.json();
        setRo(null);
        setData({ he: d.he, en: d.en });
      }
    } catch { setData(null); setRo(null); }
  }, [api]);

  useEffect(() => { if (key) loadKey(key, series, tab); }, [key, series, tab, loadKey]);

  function pickSeries(s: "family" | "signup") {
    if (s === series) return;
    setSeries(s);
    const first = (s === "signup" ? signup : emails)[0];
    setKey(first?.key ?? "");
    setPreview(""); setStatus("");
  }

  const cur = data ? data[tab] : null;
  const content = cur?.content ?? EMPTY;

  function setField(f: keyof Content, v: string) {
    if (!data) return;
    setData({ ...data, [tab]: { ...data[tab], content: { ...data[tab].content, [f]: v } } });
    setPreview("");
  }

  async function post(action: string, extra: Record<string, unknown> = {}) {
    setBusy(true); setStatus("");
    try {
      const r = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, key, lang: tab, ...extra }),
      });
      const d = await r.json();
      setBusy(false);
      return d;
    } catch { setBusy(false); return null; }
  }

  async function doPreview() {
    const d = await post("preview", isSignup ? {} : { content });
    if (d?.html) setPreview(d.html);
  }
  async function doSave() {
    const d = await post("save", { content });
    if (d?.saved) { setStatus(he ? "נשמר ✓" : "Saved ✓"); loadKey(key, series, tab); }
    else setStatus(he ? "שגיאה בשמירה" : "Save failed");
  }
  async function doReset() {
    if (!window.confirm(he ? "לשחזר את הטקסט המקורי לשפה הזו?" : "Reset this language to the default text?")) return;
    const d = await post("reset");
    if (d?.reset) { setStatus(he ? "שוחזר לברירת מחדל ✓" : "Reset to default ✓"); loadKey(key, series, tab); }
  }
  async function doTest() {
    const to = testTo.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) { setStatus(he ? "הזן אימייל תקין" : "Enter a valid email"); return; }
    try { localStorage.setItem(TEST_TO_KEY, to); } catch { /* ignore */ }
    const d = await post("test", isSignup ? { to } : { to, content });
    if (d?.sent) setStatus(he ? `נשלח מייל בדיקה ל-${to} ✓` : `Test sent to ${to} ✓`);
    else setStatus(he ? `שליחה נכשלה${d?.reason ? ": " + d.reason : ""}` : `Send failed${d?.reason ? ": " + d.reason : ""}`);
  }

  const dir = he ? "rtl" : "ltr";
  const fieldDir = tab === "he" ? "rtl" : "ltr";
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#6B7280", margin: "14px 0 4px", display: "block" };
  const input: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };
  const list = isSignup ? signup : emails;
  const previewHtml = preview || (isSignup ? ro?.html ?? "" : "");

  return (
    <div dir={dir} style={{ padding: "8px 4px 40px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{he ? "עריכת מיילים" : "Email editor"}</h1>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 12px" }}>
        {he
          ? "עריכת סדרת המיילים של Family. שינויים נשמרים ודורסים את ברירת המחדל. ## לכותרת, שורות עם 1. או - לצעדים, **מודגש**. סדרת ההרשמה לצפייה ובדיקה בלבד (עריכה בקוד)."
          : "Edit the Family email series. Changes override the default. Use ## for a heading, 1. or - for steps, **bold**. The signup series is view + test only (edited in code)."}
      </p>

      {/* Series switch */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["family", "signup"] as const).map((s) => (
          <button key={s} type="button" onClick={() => pickSeries(s)}
            style={{
              padding: "6px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              border: "none", background: series === s ? "#0EA5A5" : "#F3F4F6", color: series === s ? "#fff" : "#374151",
            }}>
            {s === "family" ? (he ? "סדרת משפחה" : "Family series") : (he ? "סדרת הרשמה" : "Signup series")}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {list.map((e) => (
          <button key={e.key} type="button" onClick={() => setKey(e.key)}
            style={{
              padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              border: `1.5px solid ${key === e.key ? "#0EA5A5" : "#E5E7EB"}`,
              background: key === e.key ? "rgba(14,165,165,0.08)" : "#fff",
              color: key === e.key ? "#0E7490" : "#374151",
            }}>
            {e.label}
          </button>
        ))}
      </div>

      {/* Language tabs (both series) */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {(["he", "en"] as const).map((l) => (
          <button key={l} type="button" onClick={() => { setTab(l); setPreview(""); }}
            style={{
              padding: "5px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              border: "none", background: tab === l ? "#0EA5A5" : "#F3F4F6", color: tab === l ? "#fff" : "#374151",
            }}>
            {l === "he" ? "עברית" : "English"}{!isSignup && data && ((l === "he" ? data.he.overridden : data.en.overridden) ? " •" : "")}
          </button>
        ))}
        {!isSignup && (
          <span style={{ marginInlineStart: "auto", fontSize: 12, color: cur?.overridden ? "#0EA5A5" : "#9CA3AF", alignSelf: "center" }}>
            {cur?.overridden ? (he ? "מותאם אישית" : "customised") : (he ? "ברירת מחדל" : "default")}
          </span>
        )}
      </div>

      {/* Editable fields — family only */}
      {!isSignup && data && (
        <div dir={fieldDir}>
          <label style={label}>{he ? "נושא המייל" : "Subject"}</label>
          <input style={input} value={content.subject} onChange={(e) => setField("subject", e.target.value)} />
          <label style={label}>{he ? "כותרת ראשית" : "Heading"}</label>
          <input style={input} value={content.heading} onChange={(e) => setField("heading", e.target.value)} />
          <label style={label}>{he ? "גוף המייל" : "Body"}</label>
          <textarea style={{ ...input, minHeight: 240, lineHeight: 1.6, resize: "vertical" }} value={content.body} onChange={(e) => setField("body", e.target.value)} />
          <label style={label}>{he ? "טקסט הכפתור" : "Button text"}</label>
          <input style={{ ...input, maxWidth: 320 }} value={content.ctaText} onChange={(e) => setField("ctaText", e.target.value)} />
        </div>
      )}

      {/* Read-only subject line — signup */}
      {isSignup && ro && (
        <div dir={fieldDir} style={{ marginTop: 4 }}>
          <label style={label}>{he ? "נושא המייל" : "Subject"}</label>
          <div style={{ ...input, background: "#F9FAFB", color: "#374151" }}>{ro.subject}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" onClick={doPreview} disabled={busy}
          style={{ padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", border: "1.5px solid #0EA5A5", background: "#fff", color: "#0E7490" }}>
          {he ? "תצוגה מקדימה" : "Preview"}
        </button>
        {!isSignup && (
          <>
            <button type="button" onClick={doSave} disabled={busy}
              style={{ padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", border: "none", background: "#0EA5A5", color: "#fff" }}>
              {he ? "שמירה" : "Save"}
            </button>
            <button type="button" onClick={doReset} disabled={busy || !cur?.overridden}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: cur?.overridden ? "pointer" : "default", fontWeight: 600, fontSize: 13, fontFamily: "inherit", border: "1px solid #E5E7EB", background: "#fff", color: cur?.overridden ? "#B45309" : "#D1D5DB" }}>
              {he ? "שחזור לברירת מחדל" : "Reset to default"}
            </button>
          </>
        )}
      </div>

      {/* Send-test row */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)}
          placeholder={he ? "אימייל לבדיקה" : "Test email address"} dir="ltr"
          style={{ ...input, maxWidth: 260 }}
        />
        <button type="button" onClick={doTest} disabled={busy}
          style={{ padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", border: "1.5px solid #7C3AED", background: "#fff", color: "#6D28D9" }}>
          {he ? `שלח בדיקה (${tab === "he" ? "עברית" : "אנגלית"})` : `Send test (${tab.toUpperCase()})`}
        </button>
        {status && <span style={{ fontSize: 13, fontWeight: 600, color: "#0EA5A5" }}>{status}</span>}
      </div>

      {previewHtml && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6 }}>{he ? "תצוגה מקדימה" : "Preview"}</div>
          <iframe title="preview" srcDoc={previewHtml} style={{ width: "100%", maxWidth: 560, height: 620, border: "1px solid #E5E7EB", borderRadius: 12, background: "#F9FAFB" }} />
        </div>
      )}
    </div>
  );
}
