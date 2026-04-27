"use client";

/**
 * Error boundary for /word/[word] route.
 *
 * Beta tester reported a "This page couldn't load" Edge error on
 * /word/הילה — likely a transient JS bundle fetch failure (Edge
 * shows that screen when the document or a critical resource fails
 * mid-load). Without an error boundary, the user is stranded on the
 * browser's generic error page with no path back into the app.
 *
 * This component is the Next 16 standard error boundary: it gets
 * the thrown error + a `reset` function that re-runs the segment.
 * We render a friendly "something went wrong" card with a retry
 * button and a homepage escape hatch — same dark stage + warm
 * paper card as the rest of the product so the user feels like
 * they're still inside Gadit, not on a foreign error page.
 */

import { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";

const COPY: Record<
  string,
  { title: string; body: string; retry: string; home: string }
> = {
  en: {
    title: "Something went wrong",
    body: "We couldn't load this word. It might be a temporary glitch — please try again.",
    retry: "Try again",
    home: "Back home",
  },
  he: {
    title: "משהו השתבש",
    body: "לא הצלחנו לטעון את המילה הזאת. ייתכן שזו תקלה זמנית — אנא נסו שוב.",
    retry: "נסו שוב",
    home: "חזרה לדף הבית",
  },
  ar: {
    title: "حدث خطأ ما",
    body: "تعذر تحميل هذه الكلمة. قد يكون خللًا مؤقتًا — حاول مرة أخرى من فضلك.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الصفحة الرئيسية",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "Не удалось загрузить это слово. Возможно, это временный сбой — попробуйте ещё раз.",
    retry: "Попробовать снова",
    home: "Вернуться на главную",
  },
  es: {
    title: "Algo salió mal",
    body: "No pudimos cargar esta palabra. Puede ser un problema temporal — por favor inténtalo de nuevo.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  pt: {
    title: "Algo deu errado",
    body: "Não conseguimos carregar essa palavra. Pode ser uma falha temporária — tente novamente.",
    retry: "Tentar de novo",
    home: "Voltar ao início",
  },
  fr: {
    title: "Une erreur s'est produite",
    body: "Nous n'avons pas pu charger ce mot. Il s'agit peut-être d'un problème temporaire — veuillez réessayer.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
};

export default function WordError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang, dir } = useLang();
  const c = COPY[lang] ?? COPY.en;

  useEffect(() => {
    // Surface to the browser console for triage; in production this
    // also reaches Vercel logs through the runtime error pipe.
    console.error("/word/[word] error boundary tripped:", error);
    // Telemetry: each trip is a real failed user interaction. The
    // message + digest land in Vercel Analytics so spikes are visible.
    track("word_error_boundary", {
      message: error.message?.slice(0, 200) ?? "",
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div className="gd-stage" style={{ minHeight: "100vh" }} dir={dir}>
      <div className="gd-stars" />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 560,
          margin: "0 auto",
          padding: "clamp(60px, 10vw, 120px) 24px",
          textAlign: "center",
        }}
      >
        <div
          className="gd-card"
          style={{ padding: "clamp(32px, 4vw, 48px)" }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "oklch(0.95 0.04 60)",
              color: "oklch(0.55 0.16 60)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2v9m0 4v.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
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
              fontSize: "clamp(24px, 3vw, 30px)",
              color: "var(--gd-ink-900)",
              marginBottom: 8,
              ...(lang !== "he" && lang !== "ar"
                ? { fontVariationSettings: '"opsz" 36', fontStyle: "italic" }
                : {}),
            }}
          >
            {c.title}
          </h1>
          <p
            className="gd-font-sans-ui"
            style={{
              fontSize: 14.5,
              color: "var(--gd-ink-700)",
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            {c.body}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={reset}
              className="gd-font-sans-ui font-medium"
              style={{
                fontSize: 14,
                padding: "11px 22px",
                borderRadius: 12,
                color: "white",
                background:
                  "linear-gradient(180deg, oklch(0.78 0.17 245), oklch(0.62 0.2 250))",
                boxShadow:
                  "0 0 0 1px oklch(0.5 0.2 250 / 0.55), 0 8px 22px oklch(0.5 0.2 250 / 0.4)",
              }}
            >
              {c.retry}
            </button>
            <Link
              href="/"
              className="gd-font-sans-ui font-medium"
              style={{
                fontSize: 14,
                padding: "11px 22px",
                borderRadius: 12,
                color: "var(--gd-ink-900)",
                background: "oklch(0 0 0 / 0.04)",
                boxShadow: "inset 0 0 0 1px oklch(0.85 0.005 265)",
              }}
            >
              {c.home}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
