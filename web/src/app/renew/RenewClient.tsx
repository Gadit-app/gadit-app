"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { getLangDir } from "@/lib/i18n";

/**
 * /renew — a stable link for a customer whose subscription ended after
 * failed charges (or whose card needs updating). Signed-in: POST /api/renew
 * and follow its redirect (open invoice, or a no-trial Checkout for the same
 * plan on the same account). Signed-out: ask to sign in first, so the payment
 * lands on the EXISTING account instead of a new one. Gadi 2026-09-28.
 */

type Copy = {
  title: string;
  working: string;
  signIn: string;
  signInBody: string;
  active: string;
  toHome: string;
  none: string;
  seePlans: string;
  error: string;
  retry: string;
};

const COPY: Record<string, Copy> = {
  en: {
    title: "Renew your Gadit subscription",
    working: "Taking you to secure payment…",
    signIn: "Sign in",
    signInBody: "Sign in with the account you used before, so everything you saved stays in one place.",
    active: "Your subscription is active. Nothing to update.",
    toHome: "Back to Gadit",
    none: "We could not find a previous subscription on this account.",
    seePlans: "See plans",
    error: "Something went wrong. Please try again in a moment.",
    retry: "Try again",
  },
  he: {
    title: "חידוש המנוי ל-Gadit",
    working: "מעבירים אותך לתשלום מאובטח…",
    signIn: "כניסה לחשבון",
    signInBody: "כדאי להיכנס עם החשבון הקיים, כדי שכל מה ששמרת יישאר במקום אחד.",
    active: "המנוי שלך פעיל. אין מה לעדכן.",
    toHome: "חזרה ל-Gadit",
    none: "לא מצאנו מנוי קודם בחשבון הזה.",
    seePlans: "לתוכניות",
    error: "משהו השתבש. אפשר לנסות שוב בעוד רגע.",
    retry: "לנסות שוב",
  },
  ar: {
    title: "تجديد اشتراكك في Gadit",
    working: "ننقلك إلى الدفع الآمن…",
    signIn: "تسجيل الدخول",
    signInBody: "سجّل الدخول بالحساب الذي استخدمته من قبل، ليبقى كل ما حفظته في مكان واحد.",
    active: "اشتراكك فعّال. لا حاجة لأي تحديث.",
    toHome: "العودة إلى Gadit",
    none: "لم نجد اشتراكًا سابقًا في هذا الحساب.",
    seePlans: "عرض الخطط",
    error: "حدث خطأ ما. حاول مرة أخرى بعد لحظة.",
    retry: "حاول مرة أخرى",
  },
  ru: {
    title: "Продление подписки Gadit",
    working: "Переходим к безопасной оплате…",
    signIn: "Войти",
    signInBody: "Войдите в аккаунт, которым пользовались раньше, чтобы всё сохранённое осталось в одном месте.",
    active: "Ваша подписка активна. Обновлять ничего не нужно.",
    toHome: "Вернуться в Gadit",
    none: "Мы не нашли прежней подписки в этом аккаунте.",
    seePlans: "Посмотреть тарифы",
    error: "Что-то пошло не так. Попробуйте ещё раз через минуту.",
    retry: "Попробовать снова",
  },
};

type Phase = "loading" | "need-auth" | "working" | "active" | "none" | "error";

export function RenewClient() {
  const { user, loading, promptLogin } = useAuth();
  const { lang } = useLang();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;
  const [phase, setPhase] = useState<Phase>("loading");
  const startedRef = useRef(false);

  const run = async () => {
    if (!user) return;
    setPhase("working");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ lang }),
      });
      const j = (await res.json().catch(() => ({}))) as { status?: string; url?: string };
      if (res.ok && j.status === "redirect" && j.url) {
        window.location.href = j.url;
        return;
      }
      if (res.ok && j.status === "active") return setPhase("active");
      if (res.ok && j.status === "none") return setPhase("none");
      setPhase("error");
    } catch {
      setPhase("error");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPhase("need-auth");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const btn: React.CSSProperties = {
    display: "inline-block", background: "#0EA5A5", color: "#fff", border: 0, borderRadius: 999,
    padding: "12px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none",
  };

  return (
    <main dir={getLangDir(lang)} style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 16px" }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>{t.title}</h1>
        {(phase === "loading" || phase === "working") && <p style={{ margin: 0, color: "#5C6270" }}>{t.working}</p>}
        {phase === "need-auth" && (
          <>
            <p style={{ margin: 0, color: "#5C6270", lineHeight: 1.6 }}>{t.signInBody}</p>
            <button type="button" style={btn} onClick={() => promptLogin({ mode: "signin", reason: "renew" })}>{t.signIn}</button>
          </>
        )}
        {phase === "active" && (
          <>
            <p style={{ margin: 0 }}>{t.active}</p>
            <Link href={href("/")} style={btn}>{t.toHome}</Link>
          </>
        )}
        {phase === "none" && (
          <>
            <p style={{ margin: 0 }}>{t.none}</p>
            <Link href={href("/families")} style={btn}>{t.seePlans}</Link>
          </>
        )}
        {phase === "error" && (
          <>
            <p style={{ margin: 0 }}>{t.error}</p>
            <button type="button" style={btn} onClick={() => void run()}>{t.retry}</button>
          </>
        )}
      </div>
    </main>
  );
}
