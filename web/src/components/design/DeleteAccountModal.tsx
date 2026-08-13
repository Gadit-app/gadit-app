"use client";

import { useState } from "react";
import type { User } from "firebase/auth";

/**
 * Delete-account exit survey (Gadi 2026-08-13). Before deleting, the user
 * picks a reason (optional) + can leave a note, then types their email to
 * confirm (the accidental-delete guard). Reason + note are stored in the
 * deletionLog and emailed to Gadi, so every departure gives churn feedback.
 */

type Lang = string;

const COPY: Record<string, {
  title: string; sub: string; why: string; notePlaceholder: string;
  confirmLabel: string; cancel: string; del: string; deleting: string;
  failed: string;
}> = {
  en: {
    title: "Before you go",
    sub: "Deleting your account cancels any subscription and erases your saved words. This can't be undone.",
    why: "Why are you leaving? (optional)",
    notePlaceholder: "Anything you'd like to tell us? (optional)",
    confirmLabel: "Type your email to confirm:",
    cancel: "Keep my account",
    del: "Delete my account",
    deleting: "Deleting…",
    failed: "Deletion failed. Please try again or email support@gadit.app.",
  },
  he: {
    title: "לפני שעוזבים",
    sub: "מחיקת החשבון מבטלת כל מנוי ומוחקת את המילים ששמרת. אי אפשר לשחזר.",
    why: "למה בחרת לעזוב? (לא חובה)",
    notePlaceholder: "משהו שתרצה לספר לנו? (לא חובה)",
    confirmLabel: "כדי לאשר, הקלד/י את המייל שלך:",
    cancel: "להשאיר את החשבון",
    del: "למחוק את החשבון",
    deleting: "מוחק…",
    failed: "המחיקה נכשלה. נסו שוב או פנו ל-support@gadit.app.",
  },
  ar: {
    title: "قبل أن تغادر",
    sub: "حذف الحساب يُلغي أي اشتراك ويمحو كلماتك المحفوظة. لا يمكن التراجع.",
    why: "لماذا تغادر؟ (اختياري)",
    notePlaceholder: "هل تودّ إخبارنا بشيء؟ (اختياري)",
    confirmLabel: "للتأكيد، اكتب بريدك الإلكتروني:",
    cancel: "الإبقاء على حسابي",
    del: "حذف حسابي",
    deleting: "جارٍ الحذف…",
    failed: "فشل الحذف. حاول مجددًا أو راسل support@gadit.app.",
  },
  ru: {
    title: "Перед уходом",
    sub: "Удаление аккаунта отменяет подписку и стирает сохранённые слова. Отменить нельзя.",
    why: "Почему вы уходите? (необязательно)",
    notePlaceholder: "Хотите что-то нам сказать? (необязательно)",
    confirmLabel: "Для подтверждения введите свой email:",
    cancel: "Оставить аккаунт",
    del: "Удалить аккаунт",
    deleting: "Удаление…",
    failed: "Не удалось удалить. Попробуйте снова или напишите на support@gadit.app.",
  },
};

// Reason value stored (English, canonical) + localized labels for display.
const REASONS: Array<Record<string, string>> = [
  { en: "I don't need it right now", he: "אני לא צריך/ה את זה כרגע", ar: "لا أحتاجه الآن", ru: "Сейчас мне это не нужно" },
  { en: "I didn't use it enough", he: "לא השתמשתי בזה מספיק", ar: "لم أستخدمه بما يكفي", ru: "Мало пользовался(лась)" },
  { en: "Too expensive for me", he: "יקר מדי בשבילי", ar: "غالٍ جدًا بالنسبة لي", ru: "Слишком дорого" },
  { en: "It was confusing / hard to use", he: "היה מבלבל / קשה להשתמש", ar: "كان مربكًا / صعب الاستخدام", ru: "Запутанно / сложно" },
  { en: "I found another solution", he: "מצאתי פתרון אחר", ar: "وجدت حلاً آخر", ru: "Нашёл(ла) другое решение" },
];

export function DeleteAccountModal({
  user,
  lang,
  dir,
  onClose,
  onDeleted,
}: {
  user: User;
  lang: Lang;
  dir: "rtl" | "ltr";
  onClose: () => void;
  onDeleted: () => void;
}) {
  const c = COPY[lang] ?? COPY.en;
  const label = (r: Record<string, string>) => r[lang] ?? r.en;
  const acctEmail = (user.email ?? "").trim();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const emailOk = !!acctEmail && typed.trim().toLowerCase() === acctEmail.toLowerCase();

  async function doDelete() {
    if (!emailOk || busy) return;
    setBusy(true);
    setErr("");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: acctEmail, reason: reason || null, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        setErr(c.failed);
        setBusy(false);
        return;
      }
      onDeleted();
    } catch {
      setErr(c.failed);
      setBusy(false);
    }
  }

  const radioRow: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
    borderRadius: 10, border: "1px solid rgba(17,24,39,0.12)", cursor: "pointer",
    fontSize: 14, color: "#374151", fontFamily: "inherit",
  };

  return (
    <div
      onClick={() => !busy && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        dir={dir}
        style={{ background: "#fff", borderRadius: 18, padding: "24px 22px", width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 70px rgba(17,24,39,0.3)", textAlign: dir === "rtl" ? "right" : "left" }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#111827" }}>{c.title}</h3>
        <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.5, color: "#6b7280" }}>{c.sub}</p>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>{c.why}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {REASONS.map((r) => {
            const val = r.en;
            const active = reason === val;
            return (
              <label key={val} style={{ ...radioRow, borderColor: active ? "#0EA5A5" : "rgba(17,24,39,0.12)", background: active ? "rgba(14,165,165,0.06)" : "#fff" }}>
                <input type="radio" name="del-reason" checked={active} onChange={() => setReason(val)} style={{ accentColor: "#0EA5A5", width: 16, height: 16, flexShrink: 0 }} />
                <span>{label(r)}</span>
              </label>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={c.notePlaceholder}
          rows={3}
          maxLength={1000}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(17,24,39,0.18)", fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: 18 }}
        />

        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>{c.confirmLabel}</div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6, direction: "ltr", textAlign: dir === "rtl" ? "right" : "left" }}>{acctEmail}</div>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={acctEmail}
          dir="ltr"
          autoComplete="off"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${typed && !emailOk ? "#EF4444" : "rgba(17,24,39,0.18)"}`, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 18 }}
        />

        {err && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ flex: 1, padding: "12px", borderRadius: 11, border: "1px solid rgba(17,24,39,0.18)", background: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: "#111827" }}
          >
            {c.cancel}
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={!emailOk || busy}
            style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: emailOk && !busy ? "#DC2626" : "#FCA5A5", color: "#fff", fontWeight: 800, fontSize: 14, cursor: emailOk && !busy ? "pointer" : "default", fontFamily: "inherit" }}
          >
            {busy ? c.deleting : c.del}
          </button>
        </div>
      </div>
    </div>
  );
}
