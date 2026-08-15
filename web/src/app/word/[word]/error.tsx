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
    body: "We couldn't load this word. It might be a temporary glitch, please try again.",
    retry: "Try again",
    home: "Back home",
  },
  zu: {
    title: "Kukhona okungahambanga kahle",
    body: "Asikwazanga ukulayisha leli gama. Kungenzeka kube yinkinga yesikhashana, sicela uzame futhi.",
    retry: "Zama futhi",
    home: "Buyela ekhaya",
  },
  el: {
    title: "Κάτι πήγε στραβά",
    body: "Δεν μπορέσαμε να φορτώσουμε αυτή τη λέξη. Ίσως είναι μια προσωρινή δυσλειτουργία, δοκίμασε ξανά.",
    retry: "Δοκίμασε ξανά",
    home: "Πίσω στην αρχική",
  },
  he: {
    title: "משהו השתבש",
    body: "לא הצלחנו לטעון את המילה הזאת. ייתכן שזו תקלה זמנית, אנא נסו שוב.",
    retry: "נסו שוב",
    home: "חזרה לדף הבית",
  },
  ar: {
    title: "حدث خطأ ما",
    body: "تعذر تحميل هذه الكلمة. قد يكون خللًا مؤقتًا, حاول مرة أخرى من فضلك.",
    retry: "حاول مرة أخرى",
    home: "العودة إلى الصفحة الرئيسية",
  },
  ru: {
    title: "Что-то пошло не так",
    body: "Не удалось загрузить это слово. Возможно, это временный сбой, попробуйте ещё раз.",
    retry: "Попробовать снова",
    home: "Вернуться на главную",
  },
  es: {
    title: "Algo salió mal",
    body: "No pudimos cargar esta palabra. Puede ser un problema temporal, por favor inténtalo de nuevo.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  pt: {
    title: "Algo deu errado",
    body: "Não conseguimos carregar essa palavra. Pode ser uma falha temporária, tente novamente.",
    retry: "Tentar de novo",
    home: "Voltar ao início",
  },
  fr: {
    title: "Une erreur s'est produite",
    body: "Nous n'avons pas pu charger ce mot. Il s'agit peut-être d'un problème temporaire, veuillez réessayer.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  hi: {
    title: "कुछ ग़लत हुआ",
    body: "हम यह शब्द लोड नहीं कर पाए। शायद कोई अस्थायी गड़बड़ी है, कृपया फिर से कोशिश करें।",
    retry: "फिर से कोशिश करें",
    home: "होम पर वापस",
  },
  am: {
    title: "የሆነ ስህተት ተፈጥሯል",
    body: "ይህን ቃል መጫን አልቻልንም። ጊዜያዊ ችግር ሊሆን ይችላል፣ እባክዎ እንደገና ይሞክሩ።",
    retry: "እንደገና ይሞክሩ",
    home: "ወደ መነሻ ገጽ",
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
  const rtlFont =
    lang === "he" ? "var(--wb-he)" : lang === "ar" || lang === "fa" ? "var(--wb-ar)" : null;
  const titleFont = rtlFont ?? "var(--wb-serif)";
  const bodyFont = rtlFont ?? "var(--wb-sans)";

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
    <div
      className="wordbook"
      dir={dir}
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--paper, #F4F5F8)",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: "var(--surface, #fff)",
          border: "1px solid var(--rule, #E2E5EA)",
          borderRadius: 20,
          padding: "clamp(32px, 5vw, 44px) clamp(24px, 4vw, 36px)",
          textAlign: "center",
          boxShadow: "0 10px 34px -14px rgba(16, 24, 40, 0.18)",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            background: "#FEF3E2",
            color: "#D97706",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: titleFont,
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 700,
            color: "var(--ink, #0B1220)",
            margin: "0 0 8px",
          }}
        >
          {c.title}
        </h1>
        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--ink-soft, #3F4856)",
            margin: "0 0 24px",
          }}
        >
          {c.body}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 700,
              padding: "11px 22px",
              borderRadius: 12,
              border: "none",
              color: "#fff",
              background: "#0EA5A5",
              cursor: "pointer",
            }}
          >
            {c.retry}
          </button>
          <Link
            href="/"
            style={{
              fontFamily: bodyFont,
              fontSize: 14,
              fontWeight: 600,
              padding: "11px 22px",
              borderRadius: 12,
              color: "var(--ink, #0B1220)",
              background: "transparent",
              border: "1px solid var(--rule, #E2E5EA)",
              textDecoration: "none",
            }}
          >
            {c.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
