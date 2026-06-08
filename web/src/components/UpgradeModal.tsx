"use client";

/**
 * UpgradeModal — contextual paywall that opens in-place when a Basic
 * user taps a Clear-tier or Deep-tier feature (image / kids / compose
 * tabs for Clear; quiz / compare tabs for Deep).
 *
 * Replaces the previous "silent router.push('/pricing')" flow that
 * dumped the user on the pricing page with no context. Now they get:
 *   · Which feature they tried (named explicitly)
 *   · Which tier unlocks it, with tier badge + colour
 *   · A 1-sentence blurb on what they'd actually get
 *   · Price + free-trial trust signal
 *   · Primary CTA → /pricing (page already optimized for conversion)
 *   · Secondary "maybe later" → close, stay on the result page
 *
 * Wired into the meaning-card tab row via the existing onUpgrade
 * callback (signature widened in result.tsx to pass tab + tier).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";

export type UpgradeTier = "clear" | "deep";
export type UpgradeFeature =
  | "image" | "kids" | "compose" | "notebook"   // Clear
  | "quiz" | "compare";                         // Deep
export type UpgradeTrigger = { feature: UpgradeFeature; tier: UpgradeTier };

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "it" | "ja";

interface Copy {
  featureNames: Record<UpgradeFeature, string>;
  featureBlurbs: Record<UpgradeFeature, string>;
  tierLabels: { clear: string; deep: string };
  tierIs: { clear: string; deep: string };      // "is a Clear feature"
  pricePerMonth: { clear: string; deep: string };
  trialNote: string;
  primaryCta: string;
  secondaryCta: string;
  closeAria: string;
}

const COPY: Record<Lang, Copy> = {
  he: {
    featureNames: {
      image: "המחשת המילה בתמונה",
      kids: "הסבר לילדים",
      compose: "חיבור משפט וקבלת משוב",
      notebook: "מחברת מילים אישית",
      quiz: "חידונים מותאמים אישית",
      compare: "משחקי מילים",
    },
    featureBlurbs: {
      image: "יצירת תמונה ייחודית לכל מילה.",
      kids: "הסבר פשוט שכל ילד מבין עם דוגמאות מהחיים שלו.",
      compose: "חברו משפט משלכם עם המילה וקבלו משוב מיידי בגרסה משופרת.",
      notebook: "אספו את המילים שלמדתם למחברת אישית דיגיטלית שזמינה לכם בכל מקום.",
      quiz: "חידון אישי שעוזר לכם להטמיע את המילה ולזכור אותה לטווח הארוך.",
      compare: "משחקי מילים מותאמים שמטמיעים את המילה בזיכרון תוך כדי הנאה.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "פיצ'ר של מנוי Clear", deep: "פיצ'ר של מנוי Deep" },
    pricePerMonth: { clear: "$2.99 לחודש", deep: "$4.99 לחודש" },
    trialNote: "14 יום חינם · ביטול בכל רגע",
    primaryCta: "נסו 14 יום חינם",
    secondaryCta: "אולי בפעם אחרת",
    closeAria: "סגור",
  },
  en: {
    featureNames: {
      image: "Illustrate the word",
      kids: "Kids' explanation",
      compose: "Compose a sentence and get feedback",
      notebook: "Personal word notebook",
      quiz: "Personalized quizzes",
      compare: "Word games",
    },
    featureBlurbs: {
      image: "A unique image generated for every word.",
      kids: "A simple explanation any child gets with examples from their world.",
      compose: "Write your own sentence with the word and get instant feedback in a polished version.",
      notebook: "Collect the words you've learned into a personal digital notebook, available to you anywhere.",
      quiz: "A personal quiz that helps you embed each word and remember it long-term.",
      compare: "Personalized word games that embed each word in memory while you have fun.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "is a Clear feature", deep: "is a Deep feature" },
    pricePerMonth: { clear: "$2.99 / month", deep: "$4.99 / month" },
    trialNote: "14 days free · cancel any time",
    primaryCta: "Try 14 days free",
    secondaryCta: "Maybe later",
    closeAria: "Close",
  },
  ar: {
    featureNames: {
      image: "تصوير الكلمة",
      kids: "شرح للأطفال",
      compose: "اكتب جملة واحصل على ملاحظات",
      notebook: "دفتر كلمات شخصي",
      quiz: "اختبارات مخصصة",
      compare: "ألعاب كلمات",
    },
    featureBlurbs: {
      image: "صورة فريدة لكل كلمة.",
      kids: "شرح بسيط يفهمه كل طفل مع أمثلة من عالمه.",
      compose: "اكتب جملتك مع الكلمة وتلقَّ ملاحظات فورية في نسخة محسّنة.",
      notebook: "اجمع الكلمات التي تعلمتها في دفتر شخصي رقمي متاح لك في أي مكان.",
      quiz: "اختبار شخصي يساعدك على ترسيخ الكلمة وتذكرها على المدى الطويل.",
      compare: "ألعاب كلمات مخصصة ترسّخ الكلمة في الذاكرة بمتعة.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "ميزة في باقة Clear", deep: "ميزة في باقة Deep" },
    pricePerMonth: { clear: "2.99 دولار / شهر", deep: "4.99 دولار / شهر" },
    trialNote: "14 يومًا مجانًا · ألغِ في أي وقت",
    primaryCta: "جرّب 14 يومًا مجانًا",
    secondaryCta: "ربما لاحقًا",
    closeAria: "إغلاق",
  },
  ru: {
    featureNames: {
      image: "Иллюстрация слова",
      kids: "Объяснение для детей",
      compose: "Составить фразу и получить отзыв",
      notebook: "Личная тетрадь слов",
      quiz: "Персональные викторины",
      compare: "Игры со словами",
    },
    featureBlurbs: {
      image: "Уникальная картинка для каждого слова.",
      kids: "Простое объяснение, которое поймёт любой ребёнок, с примерами из его мира.",
      compose: "Напишите свою фразу со словом и получите мгновенный отзыв в улучшенной версии.",
      notebook: "Собирайте выученные слова в личную цифровую тетрадь, доступную где угодно.",
      quiz: "Персональный квиз, который помогает закрепить слово и запомнить его надолго.",
      compare: "Персональные игры со словами, которые закрепляют слово в памяти, пока вы развлекаетесь.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "функция тарифа Clear", deep: "функция тарифа Deep" },
    pricePerMonth: { clear: "$2.99 / мес", deep: "$4.99 / мес" },
    trialNote: "14 дней бесплатно · отмена в любое время",
    primaryCta: "Пробовать 14 дней",
    secondaryCta: "Может быть позже",
    closeAria: "Закрыть",
  },
  es: {
    featureNames: {
      image: "Ilustrar la palabra",
      kids: "Explicación para niños",
      compose: "Componer una frase y recibir feedback",
      notebook: "Cuaderno personal de palabras",
      quiz: "Pruebas personalizadas",
      compare: "Juegos de palabras",
    },
    featureBlurbs: {
      image: "Una imagen única para cada palabra.",
      kids: "Una explicación simple que cualquier niño entiende con ejemplos de su mundo.",
      compose: "Escribe tu propia frase con la palabra y recibe feedback inmediato en una versión pulida.",
      notebook: "Reúne las palabras que has aprendido en un cuaderno digital personal, disponible donde sea.",
      quiz: "Un quiz personal que te ayuda a interiorizar la palabra y recordarla a largo plazo.",
      compare: "Juegos de palabras personalizados que fijan la palabra en la memoria mientras te diviertes.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "es una función Clear", deep: "es una función Deep" },
    pricePerMonth: { clear: "$2.99 / mes", deep: "$4.99 / mes" },
    trialNote: "14 días gratis · cancela cuando quieras",
    primaryCta: "Prueba 14 días gratis",
    secondaryCta: "Quizás más tarde",
    closeAria: "Cerrar",
  },
  pt: {
    featureNames: {
      image: "Ilustrar a palavra",
      kids: "Explicação para crianças",
      compose: "Compor uma frase e receber feedback",
      notebook: "Caderno pessoal de palavras",
      quiz: "Quizzes personalizados",
      compare: "Jogos com palavras",
    },
    featureBlurbs: {
      image: "Uma imagem única para cada palavra.",
      kids: "Uma explicação simples que qualquer criança entende com exemplos do mundo dela.",
      compose: "Escreva sua própria frase com a palavra e receba feedback instantâneo em uma versão polida.",
      notebook: "Reúna as palavras que você aprendeu em um caderno digital pessoal, disponível em qualquer lugar.",
      quiz: "Um quiz pessoal que ajuda você a fixar a palavra e lembrá-la a longo prazo.",
      compare: "Jogos com palavras personalizados que fixam a palavra na memória enquanto você se diverte.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "é um recurso Clear", deep: "é um recurso Deep" },
    pricePerMonth: { clear: "$2.99 / mês", deep: "$4.99 / mês" },
    trialNote: "14 dias grátis · cancele quando quiser",
    primaryCta: "Experimente 14 dias grátis",
    secondaryCta: "Talvez mais tarde",
    closeAria: "Fechar",
  },
  fr: {
    featureNames: {
      image: "Illustrer le mot",
      kids: "Explication pour enfants",
      compose: "Composer une phrase et recevoir un retour",
      notebook: "Carnet personnel de mots",
      quiz: "Quiz personnalisés",
      compare: "Jeux de mots",
    },
    featureBlurbs: {
      image: "Une image unique pour chaque mot.",
      kids: "Une explication simple que tout enfant comprend avec des exemples de son monde.",
      compose: "Écrivez votre propre phrase avec le mot et recevez un retour instantané dans une version améliorée.",
      notebook: "Rassemblez les mots que vous avez appris dans un carnet numérique personnel, disponible partout.",
      quiz: "Un quiz personnel qui vous aide à ancrer le mot et à le retenir à long terme.",
      compare: "Des jeux de mots personnalisés qui ancrent le mot dans la mémoire tout en s'amusant.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "est une fonction Clear", deep: "est une fonction Deep" },
    pricePerMonth: { clear: "2,99 $ / mois", deep: "4,99 $ / mois" },
    trialNote: "14 jours gratuits · annulez à tout moment",
    primaryCta: "Essayez 14 jours gratuits",
    secondaryCta: "Peut-être plus tard",
    closeAria: "Fermer",
  },
  de: {
    featureNames: {
      image: "Wort als Bild",
      kids: "Erklärung für Kinder",
      compose: "Satz schreiben und Feedback erhalten",
      notebook: "Persönliches Wörter-Notizbuch",
      quiz: "Personalisierte Quizze",
      compare: "Wortspiele",
    },
    featureBlurbs: {
      image: "Ein einzigartiges Bild für jedes Wort.",
      kids: "Eine einfache Erklärung, die jedes Kind versteht, mit Beispielen aus seiner Welt.",
      compose: "Schreibe deinen eigenen Satz mit dem Wort und erhalte sofort Feedback in einer verbesserten Version.",
      notebook: "Sammle die Wörter, die du gelernt hast, in einem persönlichen digitalen Notizbuch, das dir überall zur Verfügung steht.",
      quiz: "Ein persönliches Quiz, das dir hilft, jedes Wort fest zu verankern und es langfristig zu behalten.",
      compare: "Personalisierte Wortspiele, die jedes Wort spielerisch im Gedächtnis verankern.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "ist eine Clear-Funktion", deep: "ist eine Deep-Funktion" },
    pricePerMonth: { clear: "2,99 $ / Monat", deep: "4,99 $ / Monat" },
    trialNote: "14 Tage kostenlos · jederzeit kündbar",
    primaryCta: "14 Tage kostenlos testen",
    secondaryCta: "Vielleicht später",
    closeAria: "Schließen",
  },
  cs: {
    featureNames: {
      image: "Slovo jako obrázek",
      kids: "Vysvětlení pro děti",
      compose: "Napiš větu a získej zpětnou vazbu",
      notebook: "Osobní sešit slov",
      quiz: "Personalizované kvízy",
      compare: "Slovní hry",
    },
    featureBlurbs: {
      image: "Unikátní obrázek pro každé slovo.",
      kids: "Jednoduché vysvětlení, kterému rozumí každé dítě, s příklady z jeho světa.",
      compose: "Napiš svou vlastní větu se slovem a získej okamžitou zpětnou vazbu ve vylepšené verzi.",
      notebook: "Sbírej slova, která ses naučil, do osobního digitálního sešitu, který máš k dispozici kdekoli.",
      quiz: "Osobní kvíz, který ti pomáhá ukotvit slovo a zapamatovat si ho dlouhodobě.",
      compare: "Personalizované slovní hry, které ti slova zakotví v paměti, zatímco se bavíš.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "je funkce balíčku Clear", deep: "je funkce balíčku Deep" },
    pricePerMonth: { clear: "$2,99 / měsíc", deep: "$4,99 / měsíc" },
    trialNote: "14 dní zdarma · zrušíš kdykoli",
    primaryCta: "Vyzkoušej 14 dní zdarma",
    secondaryCta: "Možná jindy",
    closeAria: "Zavřít",
  },
  it: {
    featureNames: {
      image: "La parola come immagine",
      kids: "Spiegazione per bambini",
      compose: "Scrivi una frase e ricevi feedback",
      notebook: "Quaderno personale di parole",
      quiz: "Quiz personalizzati",
      compare: "Giochi di parole",
    },
    featureBlurbs: {
      image: "Un'immagine unica per ogni parola.",
      kids: "Una spiegazione semplice che ogni bambino capisce, con esempi del suo mondo.",
      compose: "Scrivi la tua frase con la parola e ricevi un feedback immediato nella versione potenziata.",
      notebook: "Raccogli le parole imparate in un quaderno digitale personale, disponibile ovunque.",
      quiz: "Un quiz personale che ti aiuta a fissare la parola e ricordarla a lungo.",
      compare: "Giochi di parole personalizzati che ti fanno memorizzare divertendoti.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "è una funzione del piano Clear", deep: "è una funzione del piano Deep" },
    pricePerMonth: { clear: "$2,99 / mese", deep: "$4,99 / mese" },
    trialNote: "14 giorni gratis · cancella quando vuoi",
    primaryCta: "Prova 14 giorni gratis",
    secondaryCta: "Forse più tardi",
    closeAria: "Chiudi",
  },
  ja: {
    featureNames: {
      image: "単語をイメージで",
      kids: "子ども向け説明",
      compose: "文を書いてフィードバックをもらう",
      notebook: "あなただけの単語ノート",
      quiz: "パーソナライズドクイズ",
      compare: "ワードゲーム",
    },
    featureBlurbs: {
      image: "それぞれの単語にユニークな画像を。",
      kids: "どの子でも理解できる、シンプルで身近な例を使った説明。",
      compose: "自分で文を書くと、強化版で即座にフィードバックがもらえます。",
      notebook: "学んだ単語をどこからでも開ける、あなただけのデジタルノートに集めましょう。",
      quiz: "単語をしっかり定着させ、長く覚えておくためのあなた専用クイズ。",
      compare: "楽しみながら単語を記憶に焼きつける、パーソナライズドなワードゲーム。",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "はClearプランの機能です", deep: "はDeepプランの機能です" },
    pricePerMonth: { clear: "月額 $2.99", deep: "月額 $4.99" },
    trialNote: "14日間無料 · いつでもキャンセル可",
    primaryCta: "14日間無料で試す",
    secondaryCta: "また今度",
    closeAria: "閉じる",
  },
};

export function UpgradeModal({
  trigger,
  lang,
  dir,
  onClose,
}: {
  trigger: UpgradeTrigger | null;
  lang: Lang;
  dir: "ltr" | "rtl";
  onClose: () => void;
}) {
  const router = useRouter();

  // ESC closes
  useEffect(() => {
    if (!trigger) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [trigger, onClose]);

  // Fire an analytics event the moment the modal opens — one event
  // per unique (feature, tier) pair the user attempts. This is the
  // top of the upgrade funnel: every "upgrade_prompt_shown" represents
  // a Basic user who tried a paid feature. Compare to
  // "upgrade_prompt_clicked" (cta tapped) and the downstream Stripe
  // checkout completion to compute conversion rate.
  useEffect(() => {
    if (!trigger) return;
    track("upgrade_prompt_shown", {
      feature: trigger.feature,
      tier: trigger.tier,
      lang,
    });
  }, [trigger, lang]);

  if (!trigger) return null;

  const c = COPY[lang] ?? COPY.en;
  const { feature, tier } = trigger;
  const featureName = c.featureNames[feature];
  const blurb = c.featureBlurbs[feature];
  const tierLabel = c.tierLabels[tier];
  const tierIs = c.tierIs[tier];
  const price = c.pricePerMonth[tier];

  return (
    <div
      className="wordbook wb-upgrade-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      <div
        className={`wb-upgrade-card wb-upgrade-card-${tier}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="wb-upgrade-close"
          onClick={onClose}
          aria-label={c.closeAria}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="wb-upgrade-tier">
          <span className={`wb-upgrade-tier-badge wb-upgrade-tier-badge-${tier}`}>
            {tierLabel}
          </span>
          <span className="wb-upgrade-tier-is">{tierIs}</span>
        </div>

        <h2 className="wb-upgrade-feature">{featureName}</h2>
        <p className="wb-upgrade-blurb">{blurb}</p>

        <div className="wb-upgrade-price">
          <strong>{price}</strong>
          <span className="wb-upgrade-trial">{c.trialNote}</span>
        </div>

        <button
          type="button"
          className={`wb-upgrade-cta wb-upgrade-cta-${tier}`}
          onClick={() => {
            track("upgrade_prompt_clicked", { feature, tier, lang });
            onClose();
            router.push("/pricing");
          }}
        >
          {c.primaryCta}
        </button>

        <button
          type="button"
          className="wb-upgrade-secondary"
          onClick={() => {
            track("upgrade_prompt_dismissed", { feature, tier, lang });
            onClose();
          }}
        >
          {c.secondaryCta}
        </button>
      </div>
    </div>
  );
}
