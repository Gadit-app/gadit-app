"use client";

import { useState } from "react";

/**
 * App-level share button for the topbar. Renders a single icon-only
 * pill matching the language switcher / avatar visual weight.
 *
 * Click behaviour:
 *   1. If the browser supports navigator.share (most mobiles + Safari
 *      desktop + Edge), opens the native OS share sheet.
 *   2. Otherwise copies the URL to the clipboard and flashes a small
 *      "Copied" toast so the user knows something happened.
 *
 * Per-page callers pass the URL + title + text they want shared; the
 * homepage / features / pricing send the gadit.app homepage so the
 * link is recipient-neutral, the /word page sends the current word
 * page so the recipient lands on the same definition.
 */
export function ShareButton({
  url,
  title,
  text,
  copiedLabel,
  shareLabel,
}: {
  url: string;
  title: string;
  text: string;
  copiedLabel: string;
  shareLabel: string;
}) {
  const [flash, setFlash] = useState(false);

  async function handleShare() {
    const data = { title, text, url };
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      try {
        await nav.share(data);
        return;
      } catch {
        // user cancelled the share sheet — silent
      }
    }
    try {
      await nav.clipboard?.writeText(url);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 1800);
    } catch {
      // clipboard blocked — silently no-op
    }
  }

  return (
    <>
      <button
        type="button"
        className="wb-shell-share"
        onClick={handleShare}
        aria-label={shareLabel}
        title={shareLabel}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
      </button>
      {flash && (
        <div className="wb-share-toast" role="status">
          {copiedLabel}
        </div>
      )}
    </>
  );
}

/** Localised default copy for the homepage share. */
export const APP_SHARE_COPY: Record<
  string,
  { title: string; text: string; shareLabel: string; copiedLabel: string }
> = {
  he: {
    title: "Gadit — מילון דיגיטלי חכם",
    text: "גיליתי מילון דיגיטלי חדש שמפרש מילים ומראה דוגמאות לכל הגדרה, ניבים וצירופי מילים וגם המקור של המילה ומאיפה היא הגיעה. זה חינמי עם אפשרויות לשדרג בעלות נמוכה מאוד. שווה לנסות:",
    shareLabel: "שתפו את Gadit",
    copiedLabel: "הקישור הועתק",
  },
  en: {
    title: "Gadit — Smart digital dictionary",
    text: "I discovered a new digital dictionary that explains words and shows examples for every definition, idioms and expressions, and the origin of each word and where it came from. It's free with very low-cost upgrade options. Worth a try:",
    shareLabel: "Share Gadit",
    copiedLabel: "Link copied",
  },
  ar: {
    title: "Gadit — قاموس رقمي ذكي",
    text: "اكتشفت قاموسًا رقميًا جديدًا يشرح الكلمات ويعرض أمثلة لكل تعريف، تعابير وعبارات، وكذلك أصل الكلمة ومن أين جاءت. مجاني مع خيارات ترقية بتكلفة منخفضة جدًا. يستحق التجربة:",
    shareLabel: "شارك Gadit",
    copiedLabel: "تم نسخ الرابط",
  },
  ru: {
    title: "Gadit — Умный цифровой словарь",
    text: "Нашёл новый цифровой словарь, который объясняет слова и показывает примеры для каждого определения, идиомы и выражения, а также происхождение слова и откуда оно взялось. Бесплатно, с очень дешёвой опцией апгрейда. Стоит попробовать:",
    shareLabel: "Поделиться Gadit",
    copiedLabel: "Ссылка скопирована",
  },
  es: {
    title: "Gadit — Diccionario digital inteligente",
    text: "Descubrí un nuevo diccionario digital que explica las palabras y muestra ejemplos para cada definición, modismos y expresiones, y también el origen de cada palabra y de dónde viene. Es gratis con opciones de actualización a muy bajo costo. Vale la pena probar:",
    shareLabel: "Compartir Gadit",
    copiedLabel: "Enlace copiado",
  },
  pt: {
    title: "Gadit — Dicionário digital inteligente",
    text: "Descobri um novo dicionário digital que explica palavras e mostra exemplos para cada definição, expressões idiomáticas, e também a origem de cada palavra e de onde ela veio. É grátis com opções de upgrade a um custo muito baixo. Vale a pena experimentar:",
    shareLabel: "Compartilhar Gadit",
    copiedLabel: "Link copiado",
  },
  fr: {
    title: "Gadit — Dictionnaire numérique intelligent",
    text: "J'ai découvert un nouveau dictionnaire numérique qui explique les mots et montre des exemples pour chaque définition, des idiomes et expressions, et aussi l'origine de chaque mot et d'où il vient. C'est gratuit avec des options de mise à niveau à très bas coût. Ça vaut le coup d'essayer :",
    shareLabel: "Partager Gadit",
    copiedLabel: "Lien copié",
  },
};
