"use client";

/**
 * Inline school registration form, embedded directly in the Hebrew schools
 * landing (Gadi 2026-08-08: no separate page). No checkout — the school
 * registers, we store it + email Gadi, and he opens the account and sends a
 * tax invoice. Payment is annual, by bank transfer / PO. Hebrew only.
 */

import { useEffect, useState } from "react";
import { Lines } from "../families/RealScreens";

// Students in the PARTICIPATING grades, not the whole school (Gadi 2026-10-08).
const SIZES = [
  { v: "s", label: "עד 100 תלמידים" },
  { v: "m", label: "101 עד 500 תלמידים" },
  { v: "l", label: "501 עד 1,000 תלמידים" },
  { v: "xl", label: "יותר מ-1,000 תלמידים" },
];

export function SchoolOrderForm() {
  const [form, setForm] = useState({
    schoolName: "", contactName: "", role: "", email: "", phone: "", city: "", size: "", grade: "", schoolType: "", notes: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  // A free 30-day pilot for one grade (default) or a straight order / quote
  // (Gadi 2026-10-08). The page's CTAs preselect it.
  const [kind, setKind] = useState<"pilot" | "order">("pilot");
  useEffect(() => {
    const on = (e: Event) => setKind((e as CustomEvent).detail === "order" ? "order" : "pilot");
    window.addEventListener("gadit-school-order-kind", on);
    return () => window.removeEventListener("gadit-school-order-kind", on);
  }, []);

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
        body: JSON.stringify({ ...form, kind, lang: "he" }),
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
          {kind === "pilot" ? "קיבלנו את הבקשה לפיילוט 🎉" : "קיבלנו את ההרשמה 🎉"}
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#44403C", margin: 0 }}>
          <Lines text={kind === "pilot"
            ? "נחזור אליכם תוך יום עסקים לתיאום הפיילוט ולקביעת פגישת הסיכום. הפיילוט חינם ל-30 יום, לשכבה אחת."
            : "נפתח את בית הספר ונשלח פרטי כניסה וחשבונית מס תוך יום עסקים. אפשר לשלם בהעברה בנקאית או בהזמנת רכש."} />
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} dir="rtl" style={{ display: "grid", gap: 13, marginTop: 14, textAlign: "start" }}>
      <div role="radiogroup" aria-label="סוג הבקשה" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {([["pilot", "פיילוט חינם ל-30 יום"], ["order", "הזמנה והצעת מחיר"]] as const).map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={kind === v}
            onClick={() => setKind(v)}
            style={{
              flex: "1 1 160px", padding: "10px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, cursor: "pointer",
              border: kind === v ? "2px solid #0EA5A5" : "1px solid #D6D3D1", background: kind === v ? "#E8F6F6" : "#fff", color: "#1C1917",
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <div>
        <label style={label}>שם בית הספר *</label>
        <input required style={input} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>שם מלא *</label>
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
          <label style={label}>טלפון לתיאום בוואטסאפ {opt}</label>
          <input type="tel" dir="ltr" style={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>עיר {opt}</label>
          <input style={input} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label style={label}>מספר התלמידים בשכבות המשתתפות</label>
          <select style={input} value={form.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">בחירה</option>
            {SIZES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>באיזו שכבה תרצו להתחיל? {opt}</label>
          <input style={input} value={form.grade} placeholder="למשל: ז׳" onChange={(e) => set("grade", e.target.value)} />
        </div>
        <div>
          <label style={label}>סוג בית הספר {opt}</label>
          <select style={input} value={form.schoolType} onChange={(e) => set("schoolType", e.target.value)}>
            <option value="">בחירה</option>
            <option value="state">ממלכתי</option>
            <option value="state-religious">ממלכתי דתי</option>
            <option value="arab">ערבי</option>
            <option value="other">אחר</option>
          </select>
        </div>
      </div>
      <div>
        <label style={label}>הערות {opt}</label>
        <textarea rows={2} style={{ ...input, resize: "vertical" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      {state === "error" && (
        <div style={{ fontSize: 13, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "9px 11px" }}>
          <Lines text="משהו השתבש. אפשר לנסות שוב, או לכתוב לנו ל-support@gadit.app." />
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
        {state === "sending" ? "שולחים..." : kind === "pilot" ? "שלחו בקשה לפיילוט" : "שלחו הזמנה"}
      </button>
    </form>
  );
}
