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
    title: "Gadit — להבין מילים עד הסוף",
    text: "גילית מילון חכם שמסביר כל מילה בשבע שפות. שווה לנסות:",
    shareLabel: "שתפו את Gadit",
    copiedLabel: "הקישור הועתק",
  },
  en: {
    title: "Gadit — Every word, understood.",
    text: "Found a smart dictionary that explains any word in 7 languages. Try it:",
    shareLabel: "Share Gadit",
    copiedLabel: "Link copied",
  },
  ar: {
    title: "Gadit — افهم الكلمات حتى النهاية",
    text: "اكتشفت قاموسًا ذكيًا يشرح أي كلمة بـ 7 لغات. جرّبه:",
    shareLabel: "شارك Gadit",
    copiedLabel: "تم نسخ الرابط",
  },
  ru: {
    title: "Gadit — Понять слова до конца",
    text: "Нашёл умный словарь, который объясняет любое слово на 7 языках. Попробуй:",
    shareLabel: "Поделиться Gadit",
    copiedLabel: "Ссылка скопирована",
  },
  es: {
    title: "Gadit — Entender palabras hasta el final",
    text: "Encontré un diccionario inteligente que explica cualquier palabra en 7 idiomas. Pruébalo:",
    shareLabel: "Compartir Gadit",
    copiedLabel: "Enlace copiado",
  },
  pt: {
    title: "Gadit — Entender palavras até o fim",
    text: "Encontrei um dicionário inteligente que explica qualquer palavra em 7 idiomas. Experimente:",
    shareLabel: "Compartilhar Gadit",
    copiedLabel: "Link copiado",
  },
  fr: {
    title: "Gadit — Comprendre les mots jusqu'au bout",
    text: "J'ai trouvé un dictionnaire intelligent qui explique n'importe quel mot en 7 langues. Essayez :",
    shareLabel: "Partager Gadit",
    copiedLabel: "Lien copié",
  },
};
