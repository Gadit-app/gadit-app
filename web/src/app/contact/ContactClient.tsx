"use client";

import { useLang } from "@/lib/lang-context";
import { MarketingHeader } from "@/components/design/MarketingHeader";
import { HomeFooter } from "@/components/design/home";

const SUPPORT_EMAIL = "support@gadit.app";

const COPY: Record<
  string,
  { eyebrow: string; heading: string; body: string; cta: string; sla: string }
> = {
  en: {
    eyebrow: "Contact",
    heading: "Need help?",
    body: "Email us — we read every message and reply within a few business days.",
    cta: "Email support",
    sla: "Typical response time: 1–3 business days.",
  },
  he: {
    eyebrow: "צור קשר",
    heading: "צריכים עזרה?",
    body: "שלחו לנו מייל — אנחנו קוראים כל הודעה ועונים תוך מספר ימי עסקים.",
    cta: "שליחת מייל לתמיכה",
    sla: "זמן תגובה אופייני: 1–3 ימי עסקים.",
  },
  ar: {
    eyebrow: "اتصل بنا",
    heading: "بحاجة إلى مساعدة؟",
    body: "راسلنا عبر البريد الإلكتروني — نقرأ كل رسالة ونرد خلال أيام عمل قليلة.",
    cta: "مراسلة الدعم",
    sla: "وقت الاستجابة المعتاد: 1–3 أيام عمل.",
  },
  ru: {
    eyebrow: "Связь",
    heading: "Нужна помощь?",
    body: "Напишите нам — мы читаем каждое сообщение и отвечаем в течение нескольких рабочих дней.",
    cta: "Написать в поддержку",
    sla: "Обычное время ответа: 1–3 рабочих дня.",
  },
  es: {
    eyebrow: "Contacto",
    heading: "¿Necesitas ayuda?",
    body: "Escríbenos — leemos cada mensaje y respondemos en pocos días hábiles.",
    cta: "Escribir a soporte",
    sla: "Tiempo de respuesta habitual: 1–3 días hábiles.",
  },
  pt: {
    eyebrow: "Contato",
    heading: "Precisa de ajuda?",
    body: "Mande um e-mail — a gente lê cada mensagem e responde em alguns dias úteis.",
    cta: "Enviar e-mail ao suporte",
    sla: "Tempo de resposta típico: 1–3 dias úteis.",
  },
  fr: {
    eyebrow: "Contact",
    heading: "Besoin d'aide ?",
    body: "Écrivez-nous — nous lisons chaque message et répondons sous quelques jours ouvrés.",
    cta: "Contacter le support",
    sla: "Délai de réponse habituel : 1 à 3 jours ouvrés.",
  },
};

export function ContactClient() {
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;
  const isRtl = dir === "rtl";

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <MarketingHeader />
        <main
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "clamp(48px, 8vw, 96px) clamp(20px, 3vw, 32px)",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          <div
            className="gd-card"
            style={{
              padding: "clamp(32px, 4vw, 48px)",
              textAlign: "center",
            }}
          >
            <div
              className="gd-font-sans-ui mb-2"
              style={{
                fontSize: 11.5,
                color: "oklch(0.5 0.18 250)",
                letterSpacing: "0.16em",
                textTransform:
                  lang !== "he" && lang !== "ar" ? "uppercase" : "none",
                fontWeight: 600,
              }}
            >
              {c.eyebrow}
            </div>
            <h1
              className={
                lang === "he"
                  ? "gd-font-he"
                  : lang === "ar"
                    ? "gd-font-ar"
                    : "gd-font-display"
              }
              style={{
                fontSize: "clamp(28px, 3.6vw, 40px)",
                color: "var(--gd-ink-900)",
                marginBottom: 12,
                ...(lang !== "he" && lang !== "ar"
                  ? {
                      fontVariationSettings: '"opsz" 60',
                      fontStyle: "italic",
                      fontWeight: 400,
                    }
                  : {}),
              }}
            >
              {c.heading}
            </h1>
            <p
              className="gd-font-sans-ui"
              style={{
                fontSize: 15,
                color: "var(--gd-ink-700)",
                lineHeight: 1.55,
                maxWidth: "44ch",
                margin: "0 auto 24px",
              }}
            >
              {c.body}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="gd-font-sans-ui font-medium inline-block"
              style={{
                padding: "13px 26px",
                borderRadius: 12,
                fontSize: 14.5,
                color: "white",
                background:
                  "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                boxShadow:
                  "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
              }}
            >
              {c.cta}
            </a>
            <p
              className="gd-font-sans-ui mt-4"
              style={{ fontSize: 12, color: "var(--gd-ink-500)" }}
            >
              {c.sla}
            </p>
            <p
              className="gd-font-sans-ui mt-1"
              style={{ fontSize: 12, color: "var(--gd-ink-500)" }}
              dir="ltr"
            >
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{ color: "oklch(0.5 0.18 250)" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </main>
        <HomeFooter />
      </div>
    </div>
  );
}
