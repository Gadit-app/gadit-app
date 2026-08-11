"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminContext } from "../admin-context";

type Content = { subject: string; heading: string; body: string; ctaText: string };
type LangBlock = { content: Content; overridden: boolean };
type EmailRow = { key: string; label: string; dayOffset: number };

const EMPTY: Content = { subject: "", heading: "", body: "", ctaText: "" };

export function AdminEmailEditorClient() {
  const { secret, lang: adminLang } = useAdminContext();
  const he = adminLang === "he";

  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [key, setKey] = useState<string>("");
  const [tab, setTab] = useState<"he" | "en">("he");
  const [data, setData] = useState<{ he: LangBlock; en: LangBlock } | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const api = `/api/admin/email-templates?secret=${encodeURIComponent(secret)}`;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(api);
        const d = await r.json();
        setEmails(d.emails ?? []);
        if (d.emails?.[0]) setKey(d.emails[0].key);
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  const loadKey = useCallback(async (k: string) => {
    setPreview(""); setStatus("");
    try {
      const r = await fetch(`${api}&key=${encodeURIComponent(k)}`);
      const d = await r.json();
      setData({ he: d.he, en: d.en });
    } catch { setData(null); }
  }, [api]);

  useEffect(() => { if (key) loadKey(key); }, [key, loadKey]);

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
    const d = await post("preview", { content });
    if (d?.html) setPreview(d.html);
  }
  async function doSave() {
    const d = await post("save", { content });
    if (d?.saved) { setStatus(he ? "נשמר ✓" : "Saved ✓"); loadKey(key); }
    else setStatus(he ? "שגיאה בשמירה" : "Save failed");
  }
  async function doReset() {
    if (!window.confirm(he ? "לשחזר את הטקסט המקורי לשפה הזו?" : "Reset this language to the default text?")) return;
    const d = await post("reset");
    if (d?.reset) { setStatus(he ? "שוחזר לברירת מחדל ✓" : "Reset to default ✓"); loadKey(key); }
  }

  const dir = he ? "rtl" : "ltr";
  const fieldDir = tab === "he" ? "rtl" : "ltr";
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#6B7280", margin: "14px 0 4px", display: "block" };
  const input: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div dir={dir} style={{ padding: "8px 4px 40px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{he ? "עריכת מיילים" : "Email editor"}</h1>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 16px" }}>
        {he
          ? "עריכת סדרת המיילים של Family. שינויים נשמרים ודורסים את ברירת המחדל. ## לכותרת, שורות עם 1. או - לצעדים, **מודגש**."
          : "Edit the Family email series. Changes override the default. Use ## for a heading, lines starting 1. or - for steps, **bold**."}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {emails.map((e) => (
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

      {data && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {(["he", "en"] as const).map((l) => (
              <button key={l} type="button" onClick={() => { setTab(l); setPreview(""); }}
                style={{
                  padding: "5px 16px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                  border: "none", background: tab === l ? "#0EA5A5" : "#F3F4F6", color: tab === l ? "#fff" : "#374151",
                }}>
                {l === "he" ? "עברית" : "English"}{cur && ((l === "he" ? data.he.overridden : data.en.overridden) ? " •" : "")}
              </button>
            ))}
            <span style={{ marginInlineStart: "auto", fontSize: 12, color: cur?.overridden ? "#0EA5A5" : "#9CA3AF", alignSelf: "center" }}>
              {cur?.overridden ? (he ? "מותאם אישית" : "customised") : (he ? "ברירת מחדל" : "default")}
            </span>
          </div>

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

          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={doPreview} disabled={busy}
              style={{ padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", border: "1.5px solid #0EA5A5", background: "#fff", color: "#0E7490" }}>
              {he ? "תצוגה מקדימה" : "Preview"}
            </button>
            <button type="button" onClick={doSave} disabled={busy}
              style={{ padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: "inherit", border: "none", background: "#0EA5A5", color: "#fff" }}>
              {he ? "שמירה" : "Save"}
            </button>
            <button type="button" onClick={doReset} disabled={busy || !cur?.overridden}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: cur?.overridden ? "pointer" : "default", fontWeight: 600, fontSize: 13, fontFamily: "inherit", border: "1px solid #E5E7EB", background: "#fff", color: cur?.overridden ? "#B45309" : "#D1D5DB" }}>
              {he ? "שחזור לברירת מחדל" : "Reset to default"}
            </button>
            {status && <span style={{ fontSize: 13, fontWeight: 600, color: "#0EA5A5" }}>{status}</span>}
          </div>

          {preview && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 6 }}>{he ? "תצוגה מקדימה" : "Preview"}</div>
              <iframe title="preview" srcDoc={preview} style={{ width: "100%", maxWidth: 560, height: 620, border: "1px solid #E5E7EB", borderRadius: 12, background: "#F9FAFB" }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
