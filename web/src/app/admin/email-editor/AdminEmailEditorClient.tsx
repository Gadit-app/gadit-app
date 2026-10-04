"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminContext } from "../admin-context";
import { FAMILY_LANGS, RTL_LANGS } from "@/lib/email-drip/family-i18n";

type Content = { subject: string; heading: string; body: string; ctaText: string; next?: string; closing?: string; signature?: string; helpText?: string };
type LangBlock = { content: Content; overridden: boolean; translated?: boolean };
// The family series in every UI language (Gadi 2026-10-05): Hebrew and
// English as tabs, the other 31 from a picker.
const OTHER_LANGS = FAMILY_LANGS.filter((l) => l !== "he" && l !== "en");
function langName(code: string, inLang: string): string {
  try { return new Intl.DisplayNames([inLang], { type: "language" }).of(code) ?? code; } catch { return code; }
}
type EmailRow = { key: string; label: string; labelHe?: string; dayOffset: number };
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
  const [tab, setTab] = useState<string>("he");
  const [data, setData] = useState<Record<string, LangBlock> | null>(null);
  const [ro, setRo] = useState<RoMail | null>(null); // read-only signup render
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
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
        // Test sends go to Gadi's own inbox by default (server env, never in
        // this public repo); the field stays editable.
        if (d.defaultTestTo) setTestTo((v) => v || d.defaultTestTo);
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  const loadKey = useCallback(async (k: string, forSeries: "family" | "signup", forTab: string, keepStatus = false) => {
    setPreview("");
    if (!keepStatus) { setStatus(""); setSaveMsg(null); }
    try {
      if (forSeries === "signup") {
        const r = await fetch(`${api}&key=${encodeURIComponent(k)}&lang=${forTab}`);
        const d = await r.json();
        setData(null);
        setRo(d?.readonly ? { subject: d.subject, html: d.html } : null);
      } else {
        const r = await fetch(`${api}&key=${encodeURIComponent(k)}&lang=${encodeURIComponent(forTab)}`);
        const d = await r.json();
        setRo(null);
        setData({ he: d.he, en: d.en, ...(d[forTab] ? { [forTab]: d[forTab] } : {}) });
      }
    } catch { setData(null); setRo(null); }
  }, [api]);

  useEffect(() => { if (key) loadKey(key, series, tab); }, [key, series, tab, loadKey]);

  function pickSeries(s: "family" | "signup") {
    if (s === series) return;
    setSeries(s);
    if (s === "signup" && tab !== "he" && tab !== "en") setTab("he"); // the signup series is he/en only
    const first = (s === "signup" ? signup : emails)[0];
    setKey(first?.key ?? "");
    setPreview(""); setStatus("");
  }

  const cur = data ? data[tab] ?? null : null;
  const content = cur?.content ?? EMPTY;

  // Bold button (Gadi 2026-10-04): wraps the selected text in **...**,
  // the email's bold syntax, so nobody has to remember it.
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  function makeBold() {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: a, selectionEnd: b, value } = ta;
    const sel = value.slice(a, b).trim() ? value.slice(a, b) : "";
    const next = value.slice(0, a) + "**" + sel + "**" + value.slice(b);
    setField("body", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(a + 2, a + 2 + sel.length);
    });
  }

  function setField(f: keyof Content, v: string) {
    if (!data) return;
    setSaveMsg(null); // an edit after saving: the "saved" note no longer applies
    if (!data[tab]) return;
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
    setSaveMsg({ ok: true, text: he ? "שומר..." : "Saving..." });
    const d = await post("save", { content });
    // The note sits next to the button and survives the reload that follows
    // (it used to be wiped by it, so a save looked like nothing happened).
    if (d?.saved) {
      const t = new Date().toLocaleTimeString(he ? "he-IL" : "en-US", { hour: "2-digit", minute: "2-digit" });
      setSaveMsg({ ok: true, text: he ? `נשמר ✓ (${t})` : `Saved ✓ (${t})` });
      loadKey(key, series, tab, true);
    } else setSaveMsg({ ok: false, text: he ? "השמירה נכשלה, כדאי לנסות שוב" : "Save failed, please try again" });
  }
  async function doReset() {
    if (!window.confirm(he ? "לשחזר את הטקסט המקורי לשפה הזו?" : "Reset this language to the default text?")) return;
    const d = await post("reset");
    if (d?.reset) { setSaveMsg({ ok: true, text: he ? "שוחזר לברירת מחדל ✓" : "Reset to default ✓" }); loadKey(key, series, tab, true); }
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
  const fieldDir = RTL_LANGS.has(tab) ? "rtl" : "ltr";
  const isOther = tab !== "he" && tab !== "en";
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "#6B7280", margin: "14px 0 4px", display: "block" };
  const input: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" };
  const list = isSignup ? signup : emails;
  const previewHtml = preview || (isSignup ? ro?.html ?? "" : "");

  return (
    <div dir={dir} style={{ padding: "8px 4px 40px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{he ? "עריכת מיילים" : "Email editor"}</h1>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 12px" }}>
        {he
          ? "עריכת סדרת המיילים של Family. שינויים נשמרים ודורסים את ברירת המחדל. ## לכותרת, שורות עם 1. או - לצעדים, **מודגש**, [טקסט](/family?tab=members) לקישור למסך באתר. סדרת ההרשמה לצפייה ובדיקה בלבד (עריכה בקוד)."
          : "Edit the Family email series. Changes override the default. Use ## for a heading, 1. or - for steps, **bold**, [text](/family?tab=members) for a link to a screen. The signup series is view + test only (edited in code)."}
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
            {he && e.labelHe ? e.labelHe : e.label}
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
            {l === "he" ? "עברית" : "English"}{!isSignup && data && (data[l]?.overridden ? " •" : "")}
          </button>
        ))}
        {!isSignup && (
          <select
            value={isOther ? tab : ""}
            onChange={(e) => { if (e.target.value) { setTab(e.target.value); setPreview(""); } }}
            aria-label={he ? "שפה אחרת" : "Other language"}
            style={{ padding: "5px 10px", borderRadius: 999, fontSize: 13, fontWeight: 700, fontFamily: "inherit", border: "none", cursor: "pointer", background: isOther ? "#0EA5A5" : "#F3F4F6", color: isOther ? "#fff" : "#374151" }}
          >
            <option value="">{he ? "שפה אחרת..." : "Other language..."}</option>
            {OTHER_LANGS.map((l) => <option key={l} value={l}>{langName(l, he ? "he" : "en")}</option>)}
          </select>
        )}
        {!isSignup && (
          <span style={{ marginInlineStart: "auto", fontSize: 12, color: cur?.overridden ? "#0EA5A5" : "#9CA3AF", alignSelf: "center" }}>
            {isOther
              ? cur?.translated ? (he ? "מתורגם" : "translated") : (he ? "עוד לא תורגם: מוצג הנוסח באנגלית, והמשפחות בשפה הזו מקבלות אותו באנגלית" : "not translated yet: showing the English email, which these families receive")
              : cur?.overridden ? (he ? "מותאם אישית" : "customised") : (he ? "ברירת מחדל" : "default")}
          </span>
        )}
      </div>

      {/* Editable fields — family only */}
      {!isSignup && data && (
        <div dir={fieldDir}>
          <label style={label}>{he ? "נושא המייל" : "Subject"}</label>
          <input style={input} value={content.subject} onChange={(e) => setField("subject", e.target.value)} />
          {/* The v2 family emails don't render a heading (greeting + body only),
              so the field is hidden; an empty heading stays empty on save. */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <label style={label}>{he ? "גוף המייל" : "Body"}</label>
            <button
              type="button"
              onClick={makeBold}
              title={he ? "מסמנים טקסט ולוחצים כדי להדגיש" : "Select text and click to make it bold"}
              style={{ marginBottom: 6, padding: "5px 12px", borderRadius: 8, border: "1px solid #CBD5D1", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13.5, fontFamily: "inherit" }}
            >
              {he ? "B מודגש" : "B Bold"}
            </button>
          </div>
          <textarea ref={bodyRef} style={{ ...input, minHeight: 560, lineHeight: 1.6, resize: "vertical" }} value={content.body} onChange={(e) => setField("body", e.target.value)} />
          <label style={label}>{he ? "טקסט הכפתור" : "Button text"}</label>
          <input style={{ ...input, maxWidth: 320 }} value={content.ctaText} onChange={(e) => setField("ctaText", e.target.value)} />
          <label style={label}>{he ? "משפט המשך למייל הבא (מתחת לכפתור)" : "Bridge line to the next email (under the button)"}</label>
          <input style={input} value={content.next ?? ""} onChange={(e) => setField("next", e.target.value)} />
          <label style={label}>{he ? "משפט סיום (לפני החתימה)" : "Closing line (before the signature)"}</label>
          <input style={input} value={content.closing ?? ""} onChange={(e) => setField("closing", e.target.value)} />
          <label style={label}>{he ? "חתימה" : "Signature"}</label>
          <input style={{ ...input, maxWidth: 320 }} value={content.signature ?? ""} onChange={(e) => setField("signature", e.target.value)} />
          <label style={label}>{he ? "טקסט הקישור להדרכות (בסוף המייל)" : "Guides link text (end of the email)"}</label>
          <input style={{ ...input, maxWidth: 320 }} value={content.helpText ?? ""} onChange={(e) => setField("helpText", e.target.value)} />
          <p style={{ fontSize: 12.5, color: "#6B7280", margin: "6px 0 0" }}>{he ? "שדה שמרוקנים לגמרי יורד מהמייל." : "A field left empty is removed from the email."}</p>
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
            {saveMsg && (
              <span role="status" style={{ fontSize: 14, fontWeight: 700, color: saveMsg.ok ? "#0B8A8A" : "#DC2626" }}>{saveMsg.text}</span>
            )}
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
