"use client";

/**
 * Inline school registration form, embedded directly in the Hebrew schools
 * landing (Gadi 2026-08-08: no separate page). No checkout — the school
 * registers, we store it + email Gadi, and he opens the account and sends a
 * tax invoice. Payment is annual, by bank transfer / PO. Hebrew, and Arabic
 * for Arab schools in Israel (2026-11-09).
 */

import { WaitText } from "@/components/WaitText";
import { useEffect, useState } from "react";
import { Lines } from "../families/RealScreens";

// Students in the PARTICIPATING grades, not the whole school (Gadi 2026-10-08).
const SIZE_KEYS = ["s", "m", "l", "xl"] as const;

const F = {
  he: {
    sizes: { s: "עד 100 תלמידים", m: "101 עד 500 תלמידים", l: "501 עד 1,000 תלמידים", xl: "יותר מ-1,000 תלמידים" },
    types: [["state", "ממלכתי"], ["state-religious", "ממלכתי דתי"], ["arab", "ערבי"], ["other", "אחר"]],
    kindAria: "סוג הבקשה",
    kinds: { pilot: "פיילוט חינם ל-30 יום", order: "הזמנה והצעת מחיר" },
    school: "שם בית הספר *", name: "שם מלא *", role: "תפקיד", email: "אימייל *", phone: "טלפון לתיאום בוואטסאפ",
    city: "עיר", size: "מספר התלמידים בשכבות המשתתפות", grade: "באיזו שכבה תרצו להתחיל?", gradePh: "למשל: ז׳",
    type: "סוג בית הספר", notes: "הערות", opt: "(לא חובה)", choose: "בחירה",
    donePilot: "קיבלנו את הבקשה לפיילוט 🎉", doneOrder: "קיבלנו את ההרשמה 🎉",
    donePilotBody: "נחזור אליכם תוך יום עסקים לתיאום הפיילוט ולקביעת פגישת הסיכום. הפיילוט חינם ל-30 יום, לשכבה אחת.",
    doneOrderBody: "נפתח את בית הספר ונשלח פרטי כניסה וחשבונית מס תוך יום עסקים. אפשר לשלם בהעברה בנקאית או בהזמנת רכש.",
    error: "משהו השתבש. אפשר לנסות שוב, או לכתוב לנו ל-support@gadit.app.",
    sending: "שולחים...", sendPilot: "שלחו בקשה לפיילוט", sendOrder: "שלחו הזמנה",
  },
  ar: {
    sizes: { s: "حتى 100 طالب", m: "من 101 إلى 500 طالب", l: "من 501 إلى 1,000 طالب", xl: "أكثر من 1,000 طالب" },
    types: [["arab", "رسمي عربي"], ["druze", "درزي"], ["private", "أهلي"], ["other", "آخر"]],
    kindAria: "نوع الطلب",
    kinds: { pilot: "تجربة مجانية لمدة 30 يومًا", order: "طلب وعرض سعر" },
    school: "اسم المدرسة *", name: "الاسم الكامل *", role: "الوظيفة", email: "البريد الإلكتروني *", phone: "هاتف للتنسيق عبر واتساب",
    city: "البلدة", size: "عدد الطلاب في الطبقات المشاركة", grade: "بأي طبقة تريدون البدء؟", gradePh: "مثلًا: السابع",
    type: "نوع المدرسة", notes: "ملاحظات", opt: "(اختياري)", choose: "اختيار",
    donePilot: "استلمنا طلب التجربة 🎉", doneOrder: "استلمنا التسجيل 🎉",
    donePilotBody: "سنعود إليكم خلال يوم عمل لتنسيق التجربة وتحديد لقاء التلخيص. التجربة مجانية لمدة 30 يومًا لطبقة واحدة.",
    doneOrderBody: "سنفتح حساب المدرسة ونرسل بيانات الدخول وفاتورة ضريبية خلال يوم عمل. يمكن الدفع بتحويل بنكي أو بأمر شراء.",
    error: "حدث خطأ ما. يمكن المحاولة مرة أخرى أو الكتابة إلينا على support@gadit.app.",
    sending: "جارٍ الإرسال...", sendPilot: "أرسلوا طلب التجربة", sendOrder: "أرسلوا الطلب",
  },
};

export function SchoolOrderForm({ lang = "he" }: { lang?: "he" | "ar" }) {
  const t = F[lang];
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
        body: JSON.stringify({ ...form, kind, lang }),
      });
      if (!res.ok) throw new Error("bad status");
      setState("done");
    } catch {
      setState("error");
    }
  }

  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#44403C", marginBottom: 5, display: "block" };
  const opt = <span style={{ color: "#A8A29E", fontWeight: 400 }}>{t.opt}</span>;
  const input: React.CSSProperties = {
    width: "100%", fontSize: 15, padding: "10px 12px", borderRadius: 10,
    border: "1px solid #D6D3D1", background: "#fff", color: "#1C1917", fontFamily: "inherit",
  };

  if (state === "done") {
    return (
      <div style={{ textAlign: "center", padding: "10px 4px" }}>
        <div style={{ fontFamily: "var(--wb-serif)", fontSize: 22, fontWeight: 700, color: "#1C1917", marginBottom: 8 }}>
          {kind === "pilot" ? t.donePilot : t.doneOrder}
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#44403C", margin: 0 }}>
          <Lines text={kind === "pilot" ? t.donePilotBody : t.doneOrderBody} />
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} dir="rtl" style={{ display: "grid", gap: 13, marginTop: 14, textAlign: "start" }}>
      <div role="radiogroup" aria-label={t.kindAria} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["pilot", "order"] as const).map((v) => [v, t.kinds[v]] as const).map(([v, l]) => (
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
        <label style={label}>{t.school}</label>
        <input required style={input} value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>{t.name}</label>
          <input required style={input} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </div>
        <div>
          <label style={label}>{t.role} {opt}</label>
          <input style={input} value={form.role} onChange={(e) => set("role", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>{t.email}</label>
          <input required type="email" dir="ltr" style={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label style={label}>{t.phone} {opt}</label>
          <input type="tel" dir="ltr" style={input} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>{t.city} {opt}</label>
          <input style={input} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label style={label}>{t.size}</label>
          <select style={input} value={form.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">{t.choose}</option>
            {SIZE_KEYS.map((k) => <option key={k} value={k}>{t.sizes[k]}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={label}>{t.grade} {opt}</label>
          <input style={input} value={form.grade} placeholder={t.gradePh} onChange={(e) => set("grade", e.target.value)} />
        </div>
        <div>
          <label style={label}>{t.type} {opt}</label>
          <select style={input} value={form.schoolType} onChange={(e) => set("schoolType", e.target.value)}>
            <option value="">{t.choose}</option>
            {t.types.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={label}>{t.notes} {opt}</label>
        <textarea rows={2} style={{ ...input, resize: "vertical" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      {state === "error" && (
        <div style={{ fontSize: 13, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "9px 11px" }}>
          <Lines text={t.error} />
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
        {state === "sending" ? <WaitText text={t.sending} /> : kind === "pilot" ? t.sendPilot : t.sendOrder}
      </button>
    </form>
  );
}
