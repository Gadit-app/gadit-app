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
    // Only pass title + url, NOT text. When text is passed, WhatsApp
    // (and Telegram, Messenger, etc.) show it as a separate message
    // line above the URL — which then duplicates the og:description
    // that already appears inside the rich preview card. Passing
    // only title + url lets the destination app generate the rich
    // card on its own from our OG meta and show no redundant text.
    //
    // We still accept a `text` prop for callers that explicitly want
    // it (e.g. per-word share that may need a custom blurb), but for
    // the app-wide topbar share, ShareButton renders with text=""
    // by convention.
    const data: ShareData = text
      ? { title, text, url }
      : { title, url };
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
  de: {
    title: "Gadit — Intelligentes digitales Wörterbuch",
    text: "Ich habe ein neues digitales Wörterbuch entdeckt, das Wörter erklärt und für jede Definition Beispiele zeigt, dazu Redewendungen und Ausdrücke sowie die Herkunft jedes Wortes. Kostenlos, mit sehr günstigen Upgrade-Optionen. Einen Versuch wert:",
    shareLabel: "Gadit teilen",
    copiedLabel: "Link kopiert",
  },
  cs: {
    title: "Gadit — Chytrý digitální slovník",
    text: "Objevil jsem nový digitální slovník, který vysvětluje slova a ukazuje příklady pro každou definici, idiomy a fráze, a také původ každého slova a odkud pochází. Zdarma s velmi levnými možnostmi vylepšení. Stojí za vyzkoušení:",
    shareLabel: "Sdílet Gadit",
    copiedLabel: "Odkaz zkopírován",
  },
};
