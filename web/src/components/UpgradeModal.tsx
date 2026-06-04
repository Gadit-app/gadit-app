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

export type UpgradeTier = "clear" | "deep";
export type UpgradeFeature =
  | "image" | "kids" | "compose"   // Clear
  | "quiz" | "compare";            // Deep
export type UpgradeTrigger = { feature: UpgradeFeature; tier: UpgradeTier };

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr";

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
      quiz: "חידונים מותאמים אישית",
      compare: "משחקי מילים",
    },
    featureBlurbs: {
      image: "AI מצייר תמונה ייחודית לכל מילה — מבינים את המילה גם דרך הראייה.",
      kids: "הסבר פשוט שכל ילד מבין, עם דוגמאות מהחיים שלו.",
      compose: "כותבים משפט משלכם עם המילה, מקבלים משוב מיידי וגרסה משופרת.",
      quiz: "חידון אישי שעוקב אחרי המילים שלמדתם ועוזר לזכור אותן לטווח ארוך.",
      compare: "משחקי מילים מותאמים שמחזקים את הזיכרון תוך כדי הנאה.",
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
      quiz: "Personalized quizzes",
      compare: "Word games",
    },
    featureBlurbs: {
      image: "AI draws a unique image for every word — understand it visually, not just textually.",
      kids: "A simple explanation any child gets, with examples from their world.",
      compose: "Write your own sentence with the word and get instant feedback plus a polished version.",
      quiz: "A personal quiz that tracks what you've learned and helps you remember it long-term.",
      compare: "Personalized word games that strengthen memory while you have fun.",
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
      quiz: "اختبارات مخصصة",
      compare: "ألعاب كلمات",
    },
    featureBlurbs: {
      image: "يرسم الذكاء الاصطناعي صورة فريدة لكل كلمة — افهمها بصريًا.",
      kids: "شرح بسيط يفهمه كل طفل، مع أمثلة من عالمه.",
      compose: "اكتب جملتك مع الكلمة واحصل على ملاحظات فورية ونسخة محسّنة.",
      quiz: "اختبار شخصي يتتبع ما تعلمته ويساعدك على تذكره طويلًا.",
      compare: "ألعاب كلمات مخصصة تقوّي الذاكرة بمتعة.",
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
      quiz: "Персональные викторины",
      compare: "Игры со словами",
    },
    featureBlurbs: {
      image: "ИИ рисует уникальную картинку для каждого слова — понимайте визуально.",
      kids: "Простое объяснение, которое поймёт любой ребёнок, с примерами из его мира.",
      compose: "Напишите свою фразу и получите мгновенный отзыв и улучшенный вариант.",
      quiz: "Персональная викторина, отслеживающая выученное и помогающая запомнить надолго.",
      compare: "Персональные игры со словами укрепляют память с удовольствием.",
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
      quiz: "Pruebas personalizadas",
      compare: "Juegos de palabras",
    },
    featureBlurbs: {
      image: "La IA dibuja una imagen única para cada palabra — compréndela visualmente.",
      kids: "Una explicación simple que cualquier niño entiende, con ejemplos de su mundo.",
      compose: "Escribe tu propia frase con la palabra y recibe feedback inmediato más una versión pulida.",
      quiz: "Una prueba personal que rastrea lo aprendido y te ayuda a recordarlo a largo plazo.",
      compare: "Juegos de palabras personalizados que fortalecen la memoria mientras te diviertes.",
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
      quiz: "Quizzes personalizados",
      compare: "Jogos com palavras",
    },
    featureBlurbs: {
      image: "A IA desenha uma imagem única para cada palavra — entenda visualmente.",
      kids: "Uma explicação simples que qualquer criança entende, com exemplos do mundo dela.",
      compose: "Escreva sua própria frase com a palavra e receba feedback instantâneo e uma versão polida.",
      quiz: "Um quiz pessoal que acompanha o que você aprendeu e ajuda a lembrar a longo prazo.",
      compare: "Jogos com palavras personalizados que fortalecem a memória com diversão.",
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
      quiz: "Quiz personnalisés",
      compare: "Jeux de mots",
    },
    featureBlurbs: {
      image: "L'IA dessine une image unique pour chaque mot — comprenez-le visuellement.",
      kids: "Une explication simple que tout enfant comprend, avec des exemples de son monde.",
      compose: "Écrivez votre propre phrase avec le mot et recevez un retour instantané et une version améliorée.",
      quiz: "Un quiz personnel qui suit ce que vous avez appris et vous aide à le retenir longtemps.",
      compare: "Des jeux de mots personnalisés qui renforcent la mémoire avec plaisir.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "est une fonction Clear", deep: "est une fonction Deep" },
    pricePerMonth: { clear: "2,99 $ / mois", deep: "4,99 $ / mois" },
    trialNote: "14 jours gratuits · annulez à tout moment",
    primaryCta: "Essayez 14 jours gratuits",
    secondaryCta: "Peut-être plus tard",
    closeAria: "Fermer",
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
            onClose();
            router.push("/pricing");
          }}
        >
          {c.primaryCta}
        </button>

        <button
          type="button"
          className="wb-upgrade-secondary"
          onClick={onClose}
        >
          {c.secondaryCta}
        </button>
      </div>
    </div>
  );
}
