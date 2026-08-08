"use client";

/**
 * School registration / order form (Gadi 2026-08-08). No checkout: a school
 * fills this, we store it + email Gadi, and he opens the school account and
 * sends the tax invoice. Payment is annual, by bank transfer / PO.
 */

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

type Copy = {
  dir: "rtl" | "ltr";
  back: string;
  title: string;
  sub: string;
  schoolName: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  size: string;
  sizes: { v: string; label: string }[];
  notes: string;
  optional: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  errorMsg: string;
  bankTitle: string;
  bankBody: string;
};

const COPY: Record<string, Copy> = {
  he: {
    dir: "rtl",
    back: "חזרה לדף בתי הספר",
    title: "הרשמת בית ספר",
    sub: "משאירים פרטים, ואנחנו פותחים את בית הספר עם שם משתמש וסיסמה ושולחים חשבונית מס. התשלום שנתי, בהעברה בנקאית או בהזמנת רכש.",
    schoolName: "שם בית הספר",
    contactName: "איש קשר",
    role: "תפקיד",
    email: "אימייל",
    phone: "טלפון",
    city: "עיר",
    size: "גודל בית הספר",
    sizes: [
      { v: "s", label: "עד 100 תלמידים" },
      { v: "m", label: "101-500 תלמידים" },
      { v: "l", label: "501-1,000 תלמידים" },
      { v: "xl", label: "יותר מ-1,000 תלמידים" },
    ],
    notes: "הערות",
    optional: "לא חובה",
    submit: "שליחת הרשמה",
    sending: "שולח...",
    successTitle: "קיבלנו את ההרשמה 🎉",
    successBody: "נפתח את בית הספר ונשלח פרטי כניסה וחשבונית מס תוך יום עסקים. אפשר לשלם בהעברה בנקאית או בהזמנת רכש.",
    errorMsg: "משהו השתבש. נסו שוב, או כתבו לנו ל-support@gadit.app.",
    bankTitle: "פרטי תשלום",
    bankBody: "לביא טכנולוגיות למידה והדרכה בע״מ · בנק לאומי (10) · סניף 855 · חשבון 41850031",
  },
  en: {
    dir: "ltr",
    back: "Back to Schools",
    title: "Register your school",
    sub: "Leave your details and we open your school with a username and password and send a tax invoice. Payment is annual, by bank transfer or purchase order.",
    schoolName: "School name",
    contactName: "Contact name",
    role: "Role",
    email: "Email",
    phone: "Phone",
    city: "City",
    size: "School size",
    sizes: [
      { v: "s", label: "Up to 100 students" },
      { v: "m", label: "101-500 students" },
      { v: "l", label: "501-1,000 students" },
      { v: "xl", label: "More than 1,000 students" },
    ],
    notes: "Notes",
    optional: "optional",
    submit: "Send registration",
    sending: "Sending...",
    successTitle: "Registration received 🎉",
    successBody: "We will open your school and send login details and a tax invoice within one business day. Pay by bank transfer or purchase order.",
    errorMsg: "Something went wrong. Please try again, or write to support@gadit.app.",
    bankTitle: "Payment details",
    bankBody: "Lavi Learning & Training Technologies Ltd · Bank Leumi (10) · Branch 855 · Account 41850031",
  },
};

export function SchoolOrderClient() {
  const { lang } = useLang();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;

  const [form, setForm] = useState({
    schoolName: "",
    contactName: "",
    role: "",
    email: "",
    phone: "",
    city: "",
    size: "",
    notes: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/schools/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lang }),
      });
      if (!res.ok) throw new Error("bad status");
      setState("done");
    } catch {
      setState("error");
    }
  }

  const labelStyle: React.CSSProperties = { fontSize: 13.5, fontWeight: 600, color: "#44403C", marginBottom: 6, display: "block" };
  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: 15, padding: "11px 13px", borderRadius: 10,
    border: "1px solid #D6D3D1", background: "#fff", color: "#1C1917", fontFamily: "inherit",
  };

  return (
    <div className="wordbook" dir={c.dir} style={{ minHeight: "100dvh", background: "#F5F5F4", padding: "clamp(20px, 5vw, 56px) 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <Link href={href("/schools")} style={{ fontSize: 13.5, color: "#0EA5A5", textDecoration: "none", fontWeight: 600 }}>
          {c.dir === "rtl" ? "→ " : "← "}{c.back}
        </Link>

        {state === "done" ? (
          <div style={{ background: "#fff", border: "1px solid #E3E6EA", borderRadius: 16, padding: "32px 26px", marginTop: 20, textAlign: "center", boxShadow: "0 8px 30px -14px rgba(16,24,40,0.15)" }}>
            <div style={{ fontFamily: "var(--wb-serif)", fontSize: 26, fontWeight: 700, color: "#1C1917", marginBottom: 12 }}>{c.successTitle}</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#44403C", margin: "0 auto", maxWidth: 420 }}>{c.successBody}</p>
            <div style={{ marginTop: 22, padding: "14px 16px", background: "#FAFAF9", border: "1px solid #E7E5E4", borderRadius: 12, fontSize: 13, color: "#57534E", lineHeight: 1.7 }}>
              <strong>{c.bankTitle}</strong><br />{c.bankBody}
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "var(--wb-serif)", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 700, color: "#1C1917", margin: "18px 0 10px" }}>{c.title}</h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#57534E", marginBottom: 24 }}>{c.sub}</p>

            <form onSubmit={submit} style={{ background: "#fff", border: "1px solid #E3E6EA", borderRadius: 16, padding: "24px 22px", display: "grid", gap: 16, boxShadow: "0 8px 30px -16px rgba(16,24,40,0.12)" }}>
              <div>
                <label style={labelStyle}>{c.schoolName} *</label>
                <input required style={inputStyle} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>{c.contactName} *</label>
                  <input required style={inputStyle} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>{c.role} <span style={{ color: "#A8A29E", fontWeight: 400 }}>({c.optional})</span></label>
                  <input style={inputStyle} value={form.role} onChange={(e) => set("role", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>{c.email} *</label>
                  <input required type="email" dir="ltr" style={inputStyle} value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>{c.phone} <span style={{ color: "#A8A29E", fontWeight: 400 }}>({c.optional})</span></label>
                  <input type="tel" dir="ltr" style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>{c.city} <span style={{ color: "#A8A29E", fontWeight: 400 }}>({c.optional})</span></label>
                  <input style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>{c.size}</label>
                  <select style={inputStyle} value={form.size} onChange={(e) => set("size", e.target.value)}>
                    <option value="">—</option>
                    {c.sizes.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{c.notes} <span style={{ color: "#A8A29E", fontWeight: 400 }}>({c.optional})</span></label>
                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </div>

              {state === "error" && (
                <div style={{ fontSize: 13.5, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>{c.errorMsg}</div>
              )}

              <button
                type="submit"
                disabled={state === "sending"}
                style={{
                  background: state === "sending" ? "#5EA7A7" : "#0EA5A5",
                  color: "#fff", fontSize: 16, fontWeight: 700, border: "none",
                  padding: "13px 20px", borderRadius: 12, cursor: state === "sending" ? "default" : "pointer",
                }}
              >
                {state === "sending" ? c.sending : c.submit}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
