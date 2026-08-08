"use client";

/**
 * Inline school registration form, embedded directly in the Hebrew schools
 * landing (Gadi 2026-08-08: no separate page). No checkout — the school
 * registers, we store it + email Gadi, and he opens the account and sends a
 * tax invoice. Payment is annual, by bank transfer / PO. Hebrew only.
 */

import { useState } from "react";

const SIZES = [
  { v: "s", label: "עד 100 תלמידים" },
  { v: "m", label: "101-500 תלמידים" },
  { v: "l", label: "501-1,000 תלמידים" },
  { v: "xl", label: "יותר מ-1,000 תלמידים" },
];

export function SchoolOrderForm() {
  const [form, setForm] = useState({
    schoolName: "", contactName: "", role: "", email: "", phone: "", city: "", size: "", notes: "",
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
        body: JSON.stringify({ ...form, lang: "he" }),
      });
      if (!res.ok) throw new Error("bad status");
      setState("done");
    } catch {
      setState("error");
    }
  }

  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#44403C", marginBottom: 5, display: "block" };
  const opt = <span style={{ color: "#A8A29E", fontWeight: 400 }}>(לא חובה)</span>;
  const input: React.CSSProperties = {
    width: "100%", fontSize: 15, padding: "10px 12px", borderRadius: 10,
    border: "1px solid #D6D3D1", background: "#fff", color: "#1C1917", fontFamily: "inherit",
  };

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "10px 4px" }}>
        <div style={{ fontFamily: "var(--wb-serif)", fontSize: 22, fontWeight: 700, color: "#1C1917", marginBottom: 8 }}>
          קיבלנו את ההרשמה 🎉
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#44403C", margin: 0 }}>
          נפתח את בית הספר ונשלח פרטי כניסה וחשבונית מס תוך יום עסקים. אפשר לשלם בהעברה בנקאית או בהזמנת רכש.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} dir="rtl" style={{ display: "grid", gap: 13, marginTop: 14, textAlign: "start" }}>
      <div>
        <label style={label}>שם בית הספר *</label>
        <input required style={input} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>איש קשר *</label>
          <input required style={input} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </div>
        <div>
          <label style={label}>תפקיד {opt}</label>
          <input style={input} value={form.role} onChange={(e) => set("role", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>אימייל *</label>
          <input required type="email" dir="ltr" style={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label style={label}>טלפון {opt}</label>
          <input type="tel" dir="ltr" style={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>עיר {opt}</label>
          <input style={input} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label style={label}>גודל בית הספר</label>
          <select style={input} value={form.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">—</option>
            {SIZES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={label}>הערות {opt}</label>
        <textarea rows={2} style={{ ...input, resize: "vertical" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      {state === "error" && (
        <div style={{ fontSize: 13, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "9px 11px" }}>
          משהו השתבש. נסו שוב, או כתבו לנו ל-support@gadit.app.
        </div>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        style={{
          background: state === "sending" ? "#B98a2f" : "#CA8A04",
          color: "#fff", fontSize: 15.5, fontWeight: 700, border: "none",
          padding: "12px 20px", borderRadius: 10, cursor: state === "sending" ? "default" : "pointer",
        }}
      >
        {state === "sending" ? "שולח..." : "שליחת הרשמה"}
      </button>
    </form>
  );
}
