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
    title: "Gadit, להבין מילים עד הסוף",
    text: "כלי חדש שעוזר להבין כל מילה באמת. כל המשמעויות, דוגמאות, ניבים, ומקור המילה. חינמי להתחיל, שדרוג בעלות מאוד נמוכה. שווה לנסות:",
    shareLabel: "שתפו את Gadit",
    copiedLabel: "הקישור הועתק",
  },
  en: {
    title: "Gadit, Understand words to the end",
    text: "A new tool that helps you really understand every word. All the meanings, examples, idioms, and where the word comes from. Free to start, very low-cost upgrade. Worth a try:",
    shareLabel: "Share Gadit",
    copiedLabel: "Link copied",
  },
  ar: {
    title: "Gadit, لفهم الكلمات حتى النهاية",
    text: "أداة جديدة تساعدك على فهم كل كلمة حقًا. كل المعاني، أمثلة، تعابير، وأصل الكلمة. مجاني للبدء، ترقية بتكلفة منخفضة جدًا. تستحق التجربة:",
    shareLabel: "شارك Gadit",
    copiedLabel: "تم نسخ الرابط",
  },
  ru: {
    title: "Gadit, Понять слова до конца",
    text: "Новый инструмент, который помогает по-настоящему понять каждое слово. Все значения, примеры, идиомы и происхождение слова. Бесплатно для начала, апгрейд по очень низкой цене. Стоит попробовать:",
    shareLabel: "Поделиться Gadit",
    copiedLabel: "Ссылка скопирована",
  },
  es: {
    title: "Gadit, Entender las palabras hasta el final",
    text: "Una nueva herramienta que te ayuda a entender de verdad cada palabra. Todos los significados, ejemplos, modismos y el origen de la palabra. Gratis para empezar, upgrade a muy bajo costo. Vale la pena probar:",
    shareLabel: "Compartir Gadit",
    copiedLabel: "Enlace copiado",
  },
  pt: {
    title: "Gadit, Entender as palavras até o fim",
    text: "Uma nova ferramenta que ajuda a entender de verdade cada palavra. Todos os significados, exemplos, expressões idiomáticas e a origem da palavra. Grátis para começar, upgrade com custo muito baixo. Vale a pena experimentar:",
    shareLabel: "Compartilhar Gadit",
    copiedLabel: "Link copiado",
  },
  fr: {
    title: "Gadit, Comprendre les mots jusqu'au bout",
    text: "Un nouvel outil qui aide à vraiment comprendre chaque mot. Tous les sens, exemples, expressions et l'origine du mot. Gratuit pour commencer, mise à niveau à très bas prix. Ça vaut le coup d'essayer :",
    shareLabel: "Partager Gadit",
    copiedLabel: "Lien copié",
  },
  de: {
    title: "Gadit, Wörter bis zum Ende verstehen",
    text: "Ein neues Tool, das dir hilft, jedes Wort wirklich zu verstehen. Alle Bedeutungen, Beispiele, Redewendungen und die Herkunft des Wortes. Kostenlos zum Starten, Upgrade zu sehr günstigen Preisen. Einen Versuch wert:",
    shareLabel: "Gadit teilen",
    copiedLabel: "Link kopiert",
  },
  cs: {
    title: "Gadit, Pochopit slova do konce",
    text: "Nový nástroj, který vám pomůže opravdu pochopit každé slovo. Všechny významy, příklady, idiomy a původ slova. Zdarma na začátek, vylepšení za velmi nízkou cenu. Stojí za vyzkoušení:",
    shareLabel: "Sdílet Gadit",
    copiedLabel: "Odkaz zkopírován",
  },
  sk: {
    title: "Gadit, Pochopiť slová do konca",
    text: "Nový nástroj, ktorý vám pomôže naozaj pochopiť každé slovo. Všetky významy, príklady, idiómy a pôvod slova. Zadarmo na začiatok, vylepšenie za veľmi nízku cenu. Stojí za vyskúšanie:",
    shareLabel: "Zdieľať Gadit",
    copiedLabel: "Odkaz skopírovaný",
  },
  it: {
    title: "Gadit, Capire le parole fino in fondo",
    text: "Un nuovo strumento che aiuta a capire davvero ogni parola. Tutti i significati, esempi, modi di dire e l'origine della parola. Gratis per iniziare, upgrade a costo molto basso. Vale la pena provarlo:",
    shareLabel: "Condividi Gadit",
    copiedLabel: "Link copiato",
  },
  ja: {
    title: "Gadit, 言葉を最後まで理解する",
    text: "すべての言葉を本当に理解できる新しいツール。すべての意味、例文、イディオム、語源まで。無料で始められて、有料プランも非常に手頃。試す価値があります:",
    shareLabel: "Gaditをシェア",
    copiedLabel: "リンクをコピーしました",
  },
};
