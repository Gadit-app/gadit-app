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
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

export type UpgradeTier = "clear" | "deep";
export type UpgradeFeature =
  | "image" | "kids" | "compose" | "notebook"   // Clear
  | "quiz" | "compare";                         // Deep
export type UpgradeTrigger = { feature: UpgradeFeature; tier: UpgradeTier };

/**
 * Returns true if the user dismissed the modal for THIS feature
 * within the last 24h. Callers use it to skip opening the modal so a
 * user who said "maybe later" isn't asked again on every tap that
 * same day. Gadi 2026-06-26 audit fix M5.
 */
export function isUpgradeSnoozed(feature: UpgradeFeature): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(`gadit_upgrade_snooze_${feature}`);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

type Lang = "he" | "en" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja" | "hi" | "am" | "uk" | "tr" | "pl" | "fa" | "id" | "nl" | "el" | "zu" | "vi" | "fil" | "af" | "sw" | "zh-CN" | "zh-TW" | "ko" | "th" | "bn" | "da" | "hu";

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

const COPY: Record<string, Copy> = {
  he: {
    featureNames: {
      image: "המחשת המילה בתמונה",
      kids: "הסבר לילדים",
      compose: "כתבו משפט וקבלו משוב",
      notebook: "מחברת מילים אישית",
      quiz: "חידונים מותאמים אישית",
      compare: "משחקי מילים",
    },
    featureBlurbs: {
      image: "יצירת תמונה ייחודית לכל מילה.",
      kids: "הסבר פשוט שכל ילד מבין עם דוגמאות מהחיים שלו.",
      compose: "כתבו משפט משלכם עם המילה וקבלו משוב מיידי על איך השתמשתם בה.",
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
      compose: "Write your own sentence with the word and get instant feedback on how you used it.",
      notebook: "Collect the words you've learned into a personal digital notebook, available to you anywhere.",
      quiz: "Quick quizzes that help each word stick.",
      compare: "Short games that help you remember the words you saved.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "is a Clear feature", deep: "is a Deep feature" },
    pricePerMonth: { clear: "$2.99 / month", deep: "$4.99 / month" },
    trialNote: "14 days free · cancel any time",
    primaryCta: "Try 14 days free",
    secondaryCta: "Maybe later",
    closeAria: "Close",
  },
  zu: {
    featureNames: {
      image: "Bonisa igama ngesithombe",
      kids: "Incazelo yezingane",
      compose: "Bhala umusho uthole impendulo",
      notebook: "Ibhuku lakho lamagama",
      quiz: "Ukuhlolwa okwenzelwe wena",
      compare: "Imidlalo yamagama",
    },
    featureBlurbs: {
      image: "Isithombe esikhethekile esenzelwa igama ngalinye.",
      kids: "Incazelo elula noma yiyiphi ingane eyiqondayo, enezibonelo ezivela emhlabeni wayo.",
      compose: "Bhala owakho umusho ngegama bese uthola impendulo ngokushesha ngendlela oye walisebenzisa ngayo.",
      notebook: "Qoqa amagama owafundile ebhukwini lakho ledijithali, elitholakala kuwe noma kuphi.",
      quiz: "Ukuhlolwa okusheshayo okusiza igama ngalinye ligxile.",
      compare: "Imidlalo emifushane ekusiza ukhumbule amagama owawagcinile.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "iyisici se-Clear", deep: "iyisici se-Deep" },
    pricePerMonth: { clear: "$2.99 / inyanga", deep: "$4.99 / inyanga" },
    trialNote: "Izinsuku ezingu-14 mahhala · khansela noma nini",
    primaryCta: "Zama izinsuku ezingu-14 mahhala",
    secondaryCta: "Mhlawumbe kamuva",
    closeAria: "Vala",
  },
  el: {
    featureNames: {
      image: "Εικονογράφηση της λέξης",
      kids: "Εξήγηση για παιδιά",
      compose: "Γράψε μια πρόταση και πάρε σχόλια",
      notebook: "Προσωπικό τετράδιο λέξεων",
      quiz: "Εξατομικευμένα κουίζ",
      compare: "Παιχνίδια με λέξεις",
    },
    featureBlurbs: {
      image: "Μια μοναδική εικόνα για κάθε λέξη.",
      kids: "Μια απλή εξήγηση που καταλαβαίνει κάθε παιδί, με παραδείγματα από τον κόσμο του.",
      compose: "Γράψε τη δική σου πρόταση με τη λέξη και πάρε άμεσα σχόλια για το πώς τη χρησιμοποίησες.",
      notebook: "Μάζεψε τις λέξεις που έμαθες σε ένα προσωπικό ψηφιακό τετράδιο, διαθέσιμο παντού.",
      quiz: "Σύντομα κουίζ που βοηθούν κάθε λέξη να μείνει στο μυαλό σου.",
      compare: "Σύντομα παιχνίδια που σε βοηθούν να θυμάσαι τις λέξεις που αποθήκευσες.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "είναι λειτουργία του Clear", deep: "είναι λειτουργία του Deep" },
    pricePerMonth: { clear: "$2.99 / μήνα", deep: "$4.99 / μήνα" },
    trialNote: "14 ημέρες δωρεάν · ακύρωση όποτε θες",
    primaryCta: "Δοκίμασε 14 ημέρες δωρεάν",
    secondaryCta: "Ίσως αργότερα",
    closeAria: "Κλείσιμο",
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
      compose: "اكتب جملتك مع الكلمة وتلقَّ ملاحظات فورية على طريقة استخدامك لها.",
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
      compose: "Напишите свою фразу со словом и получите мгновенный отзыв о том, как вы её использовали.",
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
      compose: "Escribe tu propia frase con la palabra y recibe feedback inmediato sobre cómo la usaste.",
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
      compose: "Escreva sua própria frase com a palavra e receba feedback instantâneo sobre como você a usou.",
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
      compose: "Écrivez votre propre phrase avec le mot et recevez un retour instantané sur la façon dont vous l'avez utilisé.",
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
      compose: "Schreibe deinen eigenen Satz mit dem Wort und erhalte sofort Feedback dazu, wie du es verwendet hast.",
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
      compose: "Napiš svou vlastní větu se slovem a získej okamžitou zpětnou vazbu na to, jak jsi slovo použil.",
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
  sk: {
    featureNames: {
      image: "Slovo ako obrázok",
      kids: "Vysvetlenie pre deti",
      compose: "Napíš vetu a získaj spätnú väzbu",
      notebook: "Osobný zošit slov",
      quiz: "Personalizované kvízy",
      compare: "Slovné hry",
    },
    featureBlurbs: {
      image: "Unikátny obrázok pre každé slovo.",
      kids: "Jednoduché vysvetlenie, ktorému rozumie každé dieťa, s príkladmi z jeho sveta.",
      compose: "Napíš svoju vlastnú vetu so slovom a získaj okamžitú spätnú väzbu na to, ako si slovo použil.",
      notebook: "Zbieraj slová, ktoré si sa naučil, do osobného digitálneho zošita, ktorý máš k dispozícii kdekoľvek.",
      quiz: "Osobný kvíz, ktorý ti pomáha ukotviť slovo a zapamätať si ho dlhodobo.",
      compare: "Personalizované slovné hry, ktoré ti slová zakotvia v pamäti, kým sa bavíš.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "je funkcia balíka Clear", deep: "je funkcia balíka Deep" },
    pricePerMonth: { clear: "$2,99 / mesiac", deep: "$4,99 / mesiac" },
    trialNote: "14 dní zadarmo · zrušíš kedykoľvek",
    primaryCta: "Vyskúšaj 14 dní zadarmo",
    secondaryCta: "Možno inokedy",
    closeAria: "Zavrieť",
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
      compose: "Scrivi la tua frase con la parola e ricevi un feedback immediato su come l'hai usata.",
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
      compose: "自分で文を書くと、その使い方について即座にフィードバックがもらえます。",
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
  hi: {
    featureNames: {
      image: "तस्वीर में शब्द",
      kids: "बच्चों के लिए समझ",
      compose: "अपना वाक्य लिखें और फ़ीडबैक पाएँ",
      notebook: "व्यक्तिगत शब्द-नोटबुक",
      quiz: "व्यक्तिगत क्विज़",
      compare: "शब्द खेल",
    },
    featureBlurbs: {
      image: "हर शब्द के लिए एक अनोखी तस्वीर।",
      kids: "हर बच्चे के लिए साफ़, सरल और जान-पहचान के उदाहरणों के साथ समझ।",
      compose: "अपना वाक्य लिखें और उसी समय फ़ीडबैक पाएँ कि शब्द का उपयोग कैसे हुआ।",
      notebook: "जो शब्द आपने सीखे हैं, उन्हें अपनी डिजिटल नोटबुक में सहेजें, कहीं भी खोलें।",
      quiz: "व्यक्तिगत क्विज़ ताकि शब्द लम्बे समय तक याद रहें।",
      compare: "मज़ेदार शब्द खेल जो शब्दों को आपकी याददाश्त में पक्का करते हैं।",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "Clear प्लान की सुविधा है", deep: "Deep प्लान की सुविधा है" },
    pricePerMonth: { clear: "$2.99/महीना", deep: "$4.99/महीना" },
    trialNote: "14 दिन मुफ्त · कभी भी रद्द करें",
    primaryCta: "14 दिन मुफ्त आज़माएँ",
    secondaryCta: "शायद बाद में",
    closeAria: "बंद करें",
  },
  am: {
    featureNames: {
      image: "ቃል በምስል",
      kids: "ለልጆች ማብራሪያ",
      compose: "የራስዎን ዓረፍተ ነገር ጽፈው አስተያየት ያግኙ",
      notebook: "የግል የቃላት ማስታወሻ ደብተር",
      quiz: "የግል ኩዊዝ",
      compare: "የቃላት ጨዋታዎች",
    },
    featureBlurbs: {
      image: "ለእያንዳንዱ ቃል ልዩ ምስል።",
      kids: "ማንኛውም ልጅ በሚረዳው ቀላል ቋንቋ እና በሚታወቁ ምሳሌዎች የቀረበ ማብራሪያ።",
      compose: "የራስዎን ዓረፍተ ነገር ይጻፉ እና ቃሉ እንዴት እንደዋለ ወዲያውኑ አስተያየት ያግኙ።",
      notebook: "የተማሯቸውን ቃላት ከየትም ቦታ በሚከፍቱት የግል ዲጂታል ማስታወሻ ደብተርዎ ውስጥ ይሰብስቡ።",
      quiz: "ቃላቱ ለረጅም ጊዜ እንዲታወሱ የተዘጋጀ የግል ኩዊዝ።",
      compare: "ቃላትን በማስታወስዎ ውስጥ የሚያጸኑ አዝናኝ የቃላት ጨዋታዎች።",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "የ Clear እቅድ አገልግሎት ነው", deep: "የ Deep እቅድ አገልግሎት ነው" },
    pricePerMonth: { clear: "$2.99 በወር", deep: "$4.99 በወር" },
    trialNote: "14 ቀን በነጻ · በማንኛውም ጊዜ መሰረዝ ይቻላል",
    primaryCta: "14 ቀን በነጻ ይሞክሩ",
    secondaryCta: "ምናልባት በኋላ",
    closeAria: "ዝጋ",
  },
  uk: {
    featureNames: {
      image: "Проілюструвати слово",
      kids: "Пояснення для дітей",
      compose: "Скласти речення й отримати відгук",
      notebook: "Особистий словник слів",
      quiz: "Персоналізовані вікторини",
      compare: "Словесні ігри",
    },
    featureBlurbs: {
      image: "Унікальне зображення, створене для кожного слова.",
      kids: "Просте пояснення, зрозуміле будь-якій дитині, з прикладами з її світу.",
      compose: "Напишіть власне речення зі словом і миттєво отримайте відгук про те, як ви його вжили.",
      notebook: "Збирайте вивчені слова в особистий цифровий словник, доступний вам будь-де.",
      quiz: "Швидкі вікторини, які допомагають запам'ятати кожне слово.",
      compare: "Короткі ігри, які допомагають запам'ятати збережені слова.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "це функція плану Clear", deep: "це функція плану Deep" },
    pricePerMonth: { clear: "$2.99 / місяць", deep: "$4.99 / місяць" },
    trialNote: "14 днів безкоштовно · скасування будь-коли",
    primaryCta: "Спробувати 14 днів безкоштовно",
    secondaryCta: "Можливо, пізніше",
    closeAria: "Закрити",
  },
  tr: {
    featureNames: {
      image: "Kelimeyi görselleştir",
      kids: "Çocuklar için açıklama",
      compose: "Bir cümle kur ve geri bildirim al",
      notebook: "Kişisel kelime defteri",
      quiz: "Kişiselleştirilmiş sınavlar",
      compare: "Kelime oyunları",
    },
    featureBlurbs: {
      image: "Her kelime için üretilen benzersiz bir görsel.",
      kids: "Her çocuğun anlayabileceği, kendi dünyasından örneklerle basit bir açıklama.",
      compose: "Kelimeyle kendi cümlenizi yazın ve onu nasıl kullandığınıza dair anında geri bildirim alın.",
      notebook: "Öğrendiğiniz kelimeleri her yerden erişebileceğiniz kişisel bir dijital deftere toplayın.",
      quiz: "Her kelimenin akılda kalmasına yardımcı olan hızlı sınavlar.",
      compare: "Kaydettiğiniz kelimeleri hatırlamanıza yardımcı olan kısa oyunlar.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "Clear planının bir özelliğidir", deep: "Deep planının bir özelliğidir" },
    pricePerMonth: { clear: "$2.99 / ay", deep: "$4.99 / ay" },
    trialNote: "14 gün ücretsiz · istediğiniz zaman iptal edin",
    primaryCta: "14 gün ücretsiz deneyin",
    secondaryCta: "Belki sonra",
    closeAria: "Kapat",
  },
  pl: {
    featureNames: {
      image: "Zilustruj słowo",
      kids: "Wyjaśnienie dla dzieci",
      compose: "Ułóż zdanie i otrzymaj informację zwrotną",
      notebook: "Osobisty notatnik słów",
      quiz: "Spersonalizowane quizy",
      compare: "Gry słowne",
    },
    featureBlurbs: {
      image: "Wyjątkowy obraz tworzony dla każdego słowa.",
      kids: "Proste wyjaśnienie zrozumiałe dla każdego dziecka, z przykładami z jego świata.",
      compose: "Napisz własne zdanie ze słowem i natychmiast otrzymaj informację zwrotną o tym, jak zostało użyte.",
      notebook: "Zbieraj poznane słowa w osobistym cyfrowym notatniku, dostępnym wszędzie.",
      quiz: "Szybkie quizy, które pomagają utrwalić każde słowo.",
      compare: "Krótkie gry, które pomagają zapamiętać zapisane słowa.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "to funkcja planu Clear", deep: "to funkcja planu Deep" },
    pricePerMonth: { clear: "$2.99 / miesiąc", deep: "$4.99 / miesiąc" },
    trialNote: "14 dni za darmo · anuluj w dowolnej chwili",
    primaryCta: "Wypróbuj 14 dni za darmo",
    secondaryCta: "Może później",
    closeAria: "Zamknij",
  },
  fa: {
    featureNames: {
      image: "تصویرسازی کلمه",
      kids: "توضیح برای کودکان",
      compose: "یک جمله بسازید و بازخورد بگیرید",
      notebook: "دفترچه واژگان شخصی",
      quiz: "آزمون‌های شخصی‌سازی‌شده",
      compare: "بازی‌های واژگانی",
    },
    featureBlurbs: {
      image: "تصویری منحصربه‌فرد که برای هر کلمه ساخته می‌شود.",
      kids: "توضیحی ساده که هر کودکی آن را درک می‌کند، همراه با مثال‌هایی از دنیای خودش.",
      compose: "جمله‌ای با کلمه بنویسید و بازخوردی فوری درباره نحوه استفاده‌تان دریافت کنید.",
      notebook: "کلماتی را که یاد گرفته‌اید در یک دفترچه دیجیتال شخصی جمع کنید که همه‌جا در دسترس شماست.",
      quiz: "آزمون‌های سریعی که به ماندگاری هر کلمه کمک می‌کنند.",
      compare: "بازی‌های کوتاهی که به یادآوری کلمات ذخیره‌شده کمک می‌کنند.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "یکی از امکانات پلن Clear است", deep: "یکی از امکانات پلن Deep است" },
    pricePerMonth: { clear: "$2.99 / ماه", deep: "$4.99 / ماه" },
    trialNote: "۱۴ روز رایگان · لغو در هر زمان",
    primaryCta: "۱۴ روز رایگان امتحان کنید",
    secondaryCta: "شاید بعداً",
    closeAria: "بستن",
  },
  id: {
    featureNames: {
      image: "Ilustrasikan kata",
      kids: "Penjelasan untuk anak",
      compose: "Susun kalimat dan dapatkan masukan",
      notebook: "Buku kata pribadi",
      quiz: "Kuis yang dipersonalisasi",
      compare: "Permainan kata",
    },
    featureBlurbs: {
      image: "Gambar unik yang dibuat untuk setiap kata.",
      kids: "Penjelasan sederhana yang dipahami setiap anak, dengan contoh dari dunia mereka.",
      compose: "Tulis kalimat Anda sendiri dengan kata itu dan dapatkan masukan instan tentang cara Anda menggunakannya.",
      notebook: "Kumpulkan kata-kata yang telah Anda pelajari ke dalam buku digital pribadi yang bisa diakses di mana saja.",
      quiz: "Kuis singkat yang membantu setiap kata melekat.",
      compare: "Permainan singkat yang membantu Anda mengingat kata-kata yang disimpan.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "adalah fitur paket Clear", deep: "adalah fitur paket Deep" },
    pricePerMonth: { clear: "$2.99 / bulan", deep: "$4.99 / bulan" },
    trialNote: "14 hari gratis · batalkan kapan saja",
    primaryCta: "Coba gratis 14 hari",
    secondaryCta: "Mungkin nanti",
    closeAria: "Tutup",
  },
  nl: {
    featureNames: {
      image: "Het woord illustreren",
      kids: "Uitleg voor kinderen",
      compose: "Een zin maken en feedback krijgen",
      notebook: "Persoonlijk woordenschrift",
      quiz: "Gepersonaliseerde quizzen",
      compare: "Woordspellen",
    },
    featureBlurbs: {
      image: "Een unieke afbeelding die voor elk woord wordt gemaakt.",
      kids: "Een eenvoudige uitleg die elk kind begrijpt, met voorbeelden uit hun eigen wereld.",
      compose: "Schrijf je eigen zin met het woord en krijg meteen feedback over hoe je het gebruikt hebt.",
      notebook: "Verzamel de woorden die je hebt geleerd in een persoonlijk digitaal schrift, overal beschikbaar.",
      quiz: "Korte quizzen die elk woord helpen beklijven.",
      compare: "Korte spellen die je helpen de opgeslagen woorden te onthouden.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "is een functie van het Clear-abonnement", deep: "is een functie van het Deep-abonnement" },
    pricePerMonth: { clear: "$2.99 / maand", deep: "$4.99 / maand" },
    trialNote: "14 dagen gratis · altijd opzegbaar",
    primaryCta: "Probeer 14 dagen gratis",
    secondaryCta: "Misschien later",
    closeAria: "Sluiten",
  },
  vi: {
    featureNames: {
      image: "Minh họa từ",
      kids: "Giải thích cho trẻ em",
      compose: "Đặt một câu và nhận phản hồi",
      notebook: "Sổ tay từ vựng cá nhân",
      quiz: "Câu đố cá nhân hóa",
      compare: "Trò chơi từ vựng",
    },
    featureBlurbs: {
      image: "Một hình ảnh độc đáo được tạo cho mỗi từ.",
      kids: "Một lời giải thích đơn giản mà bất kỳ trẻ nào cũng hiểu, với ví dụ từ thế giới của trẻ.",
      compose: "Viết câu của riêng bạn với từ đó và nhận phản hồi tức thì về cách bạn đã dùng nó.",
      notebook: "Thu thập những từ bạn đã học vào một sổ tay kỹ thuật số cá nhân, truy cập được ở bất cứ đâu.",
      quiz: "Những câu đố nhanh giúp mỗi từ được ghi nhớ.",
      compare: "Những trò chơi ngắn giúp bạn nhớ các từ đã lưu.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "là một tính năng của gói Clear", deep: "là một tính năng của gói Deep" },
    pricePerMonth: { clear: "$2.99 / tháng", deep: "$4.99 / tháng" },
    trialNote: "14 ngày miễn phí · hủy bất cứ lúc nào",
    primaryCta: "Dùng thử miễn phí 14 ngày",
    secondaryCta: "Để sau",
    closeAria: "Đóng",
  },
  fil: {
    featureNames: {
      image: "Ilarawan ang salita",
      kids: "Paliwanag para sa mga bata",
      compose: "Bumuo ng pangungusap at makakuha ng feedback",
      notebook: "Personal na kuwaderno ng mga salita",
      quiz: "Mga personalized na pagsusulit",
      compare: "Mga laro sa salita",
    },
    featureBlurbs: {
      image: "Isang natatanging larawan na ginawa para sa bawat salita.",
      kids: "Isang simpleng paliwanag na nauunawaan ng bawat bata, na may mga halimbawa mula sa kanilang mundo.",
      compose: "Sumulat ng sariling pangungusap gamit ang salita at makatanggap ng agarang feedback kung paano mo ito ginamit.",
      notebook: "Tipunin ang mga salitang natutuhan mo sa isang personal na digital na kuwaderno, na magagamit kahit saan.",
      quiz: "Mabilis na pagsusulit na tumutulong na maalala ang bawat salita.",
      compare: "Maiikling laro na tumutulong sa iyong maalala ang mga naitabing salita.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "ay isang feature ng planong Clear", deep: "ay isang feature ng planong Deep" },
    pricePerMonth: { clear: "$2.99 / buwan", deep: "$4.99 / buwan" },
    trialNote: "14 na araw libre · kanselahin anumang oras",
    primaryCta: "Subukan nang libre sa 14 na araw",
    secondaryCta: "Sa susunod na lang",
    closeAria: "Isara",
  },
  af: {
    featureNames: {
      image: "Illustreer die woord",
      kids: "Verduideliking vir kinders",
      compose: "Stel 'n sin op en kry terugvoer",
      notebook: "Persoonlike woordeboekie",
      quiz: "Persoonlike vasvrae",
      compare: "Woordspeletjies",
    },
    featureBlurbs: {
      image: "'n Unieke prent wat vir elke woord geskep word.",
      kids: "'n Eenvoudige verduideliking wat enige kind verstaan, met voorbeelde uit hul eie wêreld.",
      compose: "Skryf jou eie sin met die woord en kry dadelik terugvoer oor hoe jy dit gebruik het.",
      notebook: "Versamel die woorde wat jy geleer het in 'n persoonlike digitale boekie, oral vir jou beskikbaar.",
      quiz: "Vinnige vasvrae wat help dat elke woord vassteek.",
      compare: "Kort speletjies wat jou help om die gestoorde woorde te onthou.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "is 'n kenmerk van die Clear-plan", deep: "is 'n kenmerk van die Deep-plan" },
    pricePerMonth: { clear: "$2.99 / maand", deep: "$4.99 / maand" },
    trialNote: "14 dae gratis · kanselleer enige tyd",
    primaryCta: "Probeer 14 dae gratis",
    secondaryCta: "Miskien later",
    closeAria: "Maak toe",
  },
  sw: {
    featureNames: {
      image: "Onyesha neno kwa picha",
      kids: "Maelezo kwa watoto",
      compose: "Tunga sentensi na upate maoni",
      notebook: "Daftari la maneno la binafsi",
      quiz: "Maswali yaliyobinafsishwa",
      compare: "Michezo ya maneno",
    },
    featureBlurbs: {
      image: "Picha ya kipekee inayotengenezwa kwa kila neno.",
      kids: "Maelezo rahisi anayoyaelewa kila mtoto, yenye mifano kutoka ulimwengu wake.",
      compose: "Andika sentensi yako mwenyewe kwa neno hilo na upate maoni ya papo hapo kuhusu jinsi ulivyolitumia.",
      notebook: "Kusanya maneno uliyojifunza katika daftari la kidijitali la binafsi, linalopatikana popote.",
      quiz: "Maswali mafupi yanayosaidia kila neno kukumbukwa.",
      compare: "Michezo mifupi inayokusaidia kukumbuka maneno uliyohifadhi.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "ni kipengele cha mpango wa Clear", deep: "ni kipengele cha mpango wa Deep" },
    pricePerMonth: { clear: "$2.99 / mwezi", deep: "$4.99 / mwezi" },
    trialNote: "Siku 14 bila malipo · ghairi wakati wowote",
    primaryCta: "Jaribu siku 14 bila malipo",
    secondaryCta: "Labda baadaye",
    closeAria: "Funga",
  },
  "zh-CN": {
    featureNames: {
      image: "为单词配图",
      kids: "儿童版讲解",
      compose: "造句并获得反馈",
      notebook: "个人单词本",
      quiz: "个性化测验",
      compare: "单词游戏",
    },
    featureBlurbs: {
      image: "为每个单词生成的专属图片。",
      kids: "任何孩子都能懂的简单讲解，配有贴近他们生活的例子。",
      compose: "用这个单词写出自己的句子，即时获得关于用法的反馈。",
      notebook: "把学过的单词收进个人数字单词本，随时随地都能查看。",
      quiz: "帮助每个单词牢牢记住的快速测验。",
      compare: "帮助你记住已保存单词的小游戏。",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "是 Clear 套餐的功能", deep: "是 Deep 套餐的功能" },
    pricePerMonth: { clear: "$2.99 / 月", deep: "$4.99 / 月" },
    trialNote: "14 天免费 · 随时取消",
    primaryCta: "免费试用 14 天",
    secondaryCta: "以后再说",
    closeAria: "关闭",
  },
  "zh-TW": {
    featureNames: {
      image: "為單字配圖",
      kids: "兒童版說明",
      compose: "造句並取得回饋",
      notebook: "個人單字簿",
      quiz: "個人化測驗",
      compare: "單字遊戲",
    },
    featureBlurbs: {
      image: "為每個單字生成的專屬圖片。",
      kids: "任何孩子都能懂的簡單說明，搭配貼近他們生活的例子。",
      compose: "用這個單字寫出自己的句子，即時取得關於用法的回饋。",
      notebook: "把學過的單字收進個人數位單字簿，隨時隨地都能查看。",
      quiz: "幫助每個單字牢牢記住的快速測驗。",
      compare: "幫助你記住已儲存單字的小遊戲。",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "是 Clear 方案的功能", deep: "是 Deep 方案的功能" },
    pricePerMonth: { clear: "$2.99 / 月", deep: "$4.99 / 月" },
    trialNote: "14 天免費 · 隨時取消",
    primaryCta: "免費試用 14 天",
    secondaryCta: "改天再說",
    closeAria: "關閉",
  },
  ko: {
    featureNames: {
      image: "단어를 그림으로 표현",
      kids: "어린이를 위한 설명",
      compose: "문장을 만들고 피드백 받기",
      notebook: "나만의 단어장",
      quiz: "맞춤형 퀴즈",
      compare: "단어 게임",
    },
    featureBlurbs: {
      image: "모든 단어마다 만들어지는 고유한 이미지.",
      kids: "아이의 세계에서 가져온 예시와 함께, 어떤 아이든 이해하는 쉬운 설명.",
      compose: "그 단어로 직접 문장을 써 보고 어떻게 사용했는지 즉시 피드백을 받으세요.",
      notebook: "배운 단어를 나만의 디지털 단어장에 모아 어디서든 확인하세요.",
      quiz: "각 단어가 오래 남도록 도와주는 빠른 퀴즈.",
      compare: "저장한 단어를 기억하도록 돕는 짧은 게임.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "은(는) Clear 플랜의 기능입니다", deep: "은(는) Deep 플랜의 기능입니다" },
    pricePerMonth: { clear: "$2.99 / 월", deep: "$4.99 / 월" },
    trialNote: "14일 무료 · 언제든지 해지 가능",
    primaryCta: "14일 무료로 사용해 보기",
    secondaryCta: "나중에 하기",
    closeAria: "닫기",
  },
  th: {
    featureNames: {
      image: "วาดภาพประกอบคำ",
      kids: "คำอธิบายสำหรับเด็ก",
      compose: "แต่งประโยคและรับคำแนะนำ",
      notebook: "สมุดคำศัพท์ส่วนตัว",
      quiz: "แบบทดสอบเฉพาะตัว",
      compare: "เกมคำศัพท์",
    },
    featureBlurbs: {
      image: "ภาพที่สร้างขึ้นเฉพาะสำหรับทุกคำ",
      kids: "คำอธิบายง่าย ๆ ที่เด็กทุกคนเข้าใจได้ พร้อมตัวอย่างจากโลกของเด็กเอง",
      compose: "เขียนประโยคของคุณเองด้วยคำนั้น แล้วรับคำแนะนำทันทีเกี่ยวกับวิธีที่คุณใช้",
      notebook: "รวบรวมคำที่คุณเรียนรู้ไว้ในสมุดดิจิทัลส่วนตัว ที่ใช้ได้ทุกที่",
      quiz: "แบบทดสอบสั้น ๆ ที่ช่วยให้จำแต่ละคำได้",
      compare: "เกมสั้น ๆ ที่ช่วยให้คุณจำคำที่บันทึกไว้ได้",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "เป็นฟีเจอร์ของแพ็กเกจ Clear", deep: "เป็นฟีเจอร์ของแพ็กเกจ Deep" },
    pricePerMonth: { clear: "$2.99 / เดือน", deep: "$4.99 / เดือน" },
    trialNote: "ฟรี 14 วัน · ยกเลิกได้ทุกเมื่อ",
    primaryCta: "ทดลองใช้ฟรี 14 วัน",
    secondaryCta: "ไว้ทีหลัง",
    closeAria: "ปิด",
  },
  bn: {
    featureNames: {
      image: "শব্দটির ছবি আঁকুন",
      kids: "শিশুদের জন্য ব্যাখ্যা",
      compose: "একটি বাক্য রচনা করুন এবং মতামত পান",
      notebook: "ব্যক্তিগত শব্দ খাতা",
      quiz: "ব্যক্তিগতকৃত কুইজ",
      compare: "শব্দ খেলা",
    },
    featureBlurbs: {
      image: "প্রতিটি শব্দের জন্য তৈরি একটি অনন্য ছবি।",
      kids: "যেকোনো শিশু বোঝে এমন একটি সহজ ব্যাখ্যা, তার নিজের জগতের উদাহরণসহ।",
      compose: "শব্দটি দিয়ে নিজের একটি বাক্য লিখুন এবং আপনি কীভাবে এটি ব্যবহার করেছেন তার তাৎক্ষণিক মতামত পান।",
      notebook: "শেখা শব্দগুলো একটি ব্যক্তিগত ডিজিটাল খাতায় জমা করুন, যা সর্বত্র আপনার কাছে থাকবে।",
      quiz: "দ্রুত কুইজ যা প্রতিটি শব্দ মনে রাখতে সাহায্য করে।",
      compare: "ছোট খেলা যা আপনার সংরক্ষিত শব্দগুলো মনে রাখতে সাহায্য করে।",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "এটি Clear প্ল্যানের একটি ফিচার", deep: "এটি Deep প্ল্যানের একটি ফিচার" },
    pricePerMonth: { clear: "$2.99 / মাস", deep: "$4.99 / মাস" },
    trialNote: "১৪ দিন ফ্রি · যেকোনো সময় বাতিল করুন",
    primaryCta: "১৪ দিন ফ্রি ব্যবহার করে দেখুন",
    secondaryCta: "পরে দেখা যাবে",
    closeAria: "বন্ধ করুন",
  },
  da: {
    featureNames: {
      image: "Illustrer ordet",
      kids: "Forklaring for børn",
      compose: "Lav en sætning og få feedback",
      notebook: "Personlig ordbog",
      quiz: "Personlige quizzer",
      compare: "Ordspil",
    },
    featureBlurbs: {
      image: "Et unikt billede skabt til hvert ord.",
      kids: "En simpel forklaring, som ethvert barn forstår, med eksempler fra deres egen verden.",
      compose: "Skriv din egen sætning med ordet, og få øjeblikkelig feedback på, hvordan du brugte det.",
      notebook: "Saml de ord, du har lært, i en personlig digital notesbog, tilgængelig for dig overalt.",
      quiz: "Hurtige quizzer, der hjælper hvert ord med at sidde fast.",
      compare: "Korte spil, der hjælper dig med at huske de ord, du har gemt.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "er en funktion i Clear-abonnementet", deep: "er en funktion i Deep-abonnementet" },
    pricePerMonth: { clear: "$2.99 / måned", deep: "$4.99 / måned" },
    trialNote: "14 dage gratis · opsig når som helst",
    primaryCta: "Prøv 14 dage gratis",
    secondaryCta: "Måske senere",
    closeAria: "Luk",
  },
  hu: {
    featureNames: {
      image: "A szó illusztrálása",
      kids: "Magyarázat gyerekeknek",
      compose: "Mondat alkotása és visszajelzés",
      notebook: "Személyes szófüzet",
      quiz: "Személyre szabott kvízek",
      compare: "Szójátékok",
    },
    featureBlurbs: {
      image: "Minden szóhoz egyedi kép készül.",
      kids: "Egyszerű magyarázat, amelyet bármelyik gyerek megért, a saját világából vett példákkal.",
      compose: "Írjon saját mondatot a szóval, és azonnali visszajelzést kap arról, hogyan használta.",
      notebook: "Gyűjtse össze a megtanult szavakat egy személyes digitális füzetbe, amely bárhol elérhető.",
      quiz: "Gyors kvízek, amelyek segítenek megjegyezni minden szót.",
      compare: "Rövid játékok, amelyek segítenek megjegyezni az elmentett szavakat.",
    },
    tierLabels: { clear: "Clear", deep: "Deep" },
    tierIs: { clear: "a Clear csomag funkciója", deep: "a Deep csomag funkciója" },
    pricePerMonth: { clear: "$2.99 / hónap", deep: "$4.99 / hónap" },
    trialNote: "14 nap ingyen · bármikor lemondható",
    primaryCta: "Próbálja ki 14 napig ingyen",
    secondaryCta: "Talán később",
    closeAria: "Bezárás",
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
  const href = useHref();

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

        <div className="wb-upgrade-price gd-buy">
          <strong>{price}</strong>
          <span className="wb-upgrade-trial">{c.trialNote}</span>
        </div>

        <button
          type="button"
          className={`wb-upgrade-cta wb-upgrade-cta-${tier} gd-buy`}
          onClick={() => {
            track("upgrade_prompt_clicked", { feature, tier, lang });
            onClose();
            router.push(href("/pricing"));
          }}
        >
          {c.primaryCta}
        </button>

        <button
          type="button"
          className="wb-upgrade-secondary"
          onClick={() => {
            track("upgrade_prompt_dismissed", { feature, tier, lang });
            // 24-hour snooze: a user who dismissed within a day
            // shouldn't see the same modal again on every tap, so the
            // caller can read this flag and skip opening the modal.
            // Per-feature key so dismissing image doesn't suppress a
            // first-tap on kids. Gadi 2026-06-26 audit fix M5.
            try {
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  `gadit_upgrade_snooze_${feature}`,
                  String(Date.now()),
                );
              }
            } catch { /* ignore quota/private-mode */ }
            onClose();
          }}
        >
          {c.secondaryCta}
        </button>
      </div>
    </div>
  );
}
