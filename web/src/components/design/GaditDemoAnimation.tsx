"use client";

/**
 * GaditDemoAnimation — wide, desktop-style tour that walks visitors
 * through a real Gadit lookup, tier by tier, in their UI language.
 *
 * Architecture choice (locked after Gadi's June 9 feedback):
 *   1. Each language renders ONLY its own content — no English fallback,
 *      no language-mixing inside the frame. Showing a Hebrew visitor
 *      "ephemeral" while the UI is in עברית reads as broken.
 *   2. We pick one word per language ("dream" in every locale) so the
 *      tour structure is identical across languages but the content is
 *      always native. Dream was chosen because it carries the same
 *      duality (sleep vision / aspiration) in every culture, has rich
 *      examples and idioms in every language, and a clean etymology.
 *   3. Layout is desktop-wide (~720px) — earlier mobile-frame felt
 *      like we were hiding the product behind a phone shell.
 *
 * Scenes:
 *   basic     8.0s — search bar + word title + 2 meanings × 3 examples
 *                   + idioms + etymology (the whole Basic experience)
 *   clear     8.0s — same word + kids toggle on + kids explanation
 *                   replaces the meaning text + image preview + compose
 *                   sentence with a "Perfect ✓"
 *   deep      6.5s — quiz card with correct-answer pulse, anagram
 *                   letters, compare-two-words preview
 *
 * The partner scene was removed 2026-06-26 — /features should sell the
 * product, not the affiliate program. The Partner content + PartnerScene
 * stay in the file as dead code so we can re-enable it cheaply by adding
 * "partner" back to SCENE_ORDER if we ever want it.
 *
 * Reduced-motion freezes on the active scene with everything visible.
 * Hover pauses. Click a dot to jump.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";

type Scene = "basic" | "clear" | "deep" | "partner";

const SCENE_ORDER: Scene[] = ["basic", "clear", "deep"];
const SCENE_DURATION_MS: Record<Scene, number> = {
  basic: 8000,
  clear: 8000,
  deep: 6500,
  partner: 8500,
};

interface DemoContent {
  word: string;
  searchPlaceholder: string;
  // Basic content
  meanings: Array<{ definition: string; examples: string[] }>;
  idioms: string[];
  etymology: { from: string; original: string; meant: string };
  // Clear content
  kidsExplanation: string;
  composeSentence: string;
  composeStatus: string;
  imageDescription: string;
  // Deep content
  quizQuestion: string;
  quizOptions: string[];
  quizCorrect: number;
  anagramLetters: string;
  compareWords: string;
  compareNote: string;
  // Partner
  partnerHeroTitle: string;
  partnerHeroBody: string;
  partnerLink: string;
  partnerEarnings: string;
  partnerSubs: string;
  partnerRate: string;
  partnerStatus: string;
  // Labels — short, per-language
  l: {
    watchEyebrow: string;
    watchTitle: string;
    watchLede: string;
    tierBasic: string;
    tierClear: string;
    tierDeep: string;
    tierPartner: string;
    searchBtn: string;
    meaningsLabel: string;
    meaningN: (n: number) => string;
    examplesLabel: string;
    idiomsLabel: string;
    etymologyLabel: string;
    etyFromLabel: string;
    etyMeantLabel: string;
    kidsToggle: string;
    kidsLabel: string;
    composeLabel: string;
    imageLabel: string;
    saved: string;
    plusBasic: string;
    plusClear: string;
    quizLabel: string;
    gameLabel: string;
    compareLabel: string;
    dashTitle: string;
    linkLabel: string;
    earningsLabel: string;
    subsLabel: string;
    rateLabel: string;
  };
}

const DEMO: Record<Lang, DemoContent> = {
  en: {
    word: "dream",
    searchPlaceholder: "Type a word",
    meanings: [
      {
        definition: "Images, thoughts, and sensations occurring in the mind during sleep.",
        examples: [
          "I had a strange dream last night.",
          "She woke up from a peaceful dream.",
          "Children often dream about flying.",
        ],
      },
      {
        definition: "A cherished aspiration, ambition, or ideal.",
        examples: [
          "It was her dream to become a writer.",
          "He worked hard to make his dream a reality.",
          "Never give up on your dreams.",
        ],
      },
    ],
    idioms: ["a dream come true", "in your wildest dreams", "the American Dream"],
    etymology: {
      from: "Old English",
      original: "drēam",
      meant: "joy, music, the night-vision sense emerged in Middle English",
    },
    kidsExplanation:
      "When you sleep, your brain plays little movies in your head, those are dreams. A dream can also be something amazing you really want to happen one day.",
    composeSentence: "Her dream of becoming a doctor finally came true.",
    composeStatus: "Perfect ✓",
    imageDescription: "dream",
    quizQuestion: "Which word means \"an aspiration you hope to achieve\"?",
    quizOptions: ["thought", "dream", "fact", "memory"],
    quizCorrect: 1,
    anagramLetters: "amerd",
    compareWords: "dream vs. ambition",
    compareNote: "Both about wanting something, see the exact difference.",
    partnerHeroTitle: "Spread Gadit. Earn with us.",
    partnerHeroBody: "Love Gadit? Share your personal link with parents, students, language learners, and earn 30% on every subscription, for the first year. Hit 10 active subscribers and you unlock 10% lifetime commission on all of them.",
    partnerLink: "gadit.app/?ref=alex",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% year 1 · 10% lifetime",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Watch Gadit",
      watchTitle: "See how every word opens, tier by tier.",
      watchLede: "A live walkthrough of a real word, in your language. Hover to pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Search",
      meaningsLabel: "Meanings",
      meaningN: (n) => `Meaning ${n}`,
      examplesLabel: "Examples",
      idiomsLabel: "Idioms & expressions",
      etymologyLabel: "Word origin",
      etyFromLabel: "From",
      etyMeantLabel: "Originally meant",
      kidsToggle: "Kids mode",
      kidsLabel: "Kids explanation",
      composeLabel: "Write your sentence",
      imageLabel: "Visual",
      saved: "Saved to notebook ★",
      plusBasic: "Plus everything in Basic",
      plusClear: "Plus everything in Clear",
      quizLabel: "Quiz",
      gameLabel: "Word game",
      compareLabel: "Compare two words",
      dashTitle: "Partner dashboard",
      linkLabel: "Your personal link",
      earningsLabel: "This month",
      subsLabel: "Active subscribers",
      rateLabel: "Commission",
    },
  },
  he: {
    word: "חלום",
    searchPlaceholder: "הקלידו מילה",
    meanings: [
      {
        definition: "תמונות, מחשבות ותחושות שעולות במוח בזמן השינה.",
        examples: [
          "חלמתי חלום מוזר אתמול בלילה.",
          "היא התעוררה מחלום שליו.",
          "ילדים חולמים הרבה על תעופה.",
        ],
      },
      {
        definition: "שאיפה יקרה, חזון, מטרה אישית.",
        examples: [
          "החלום שלה היה להיות סופרת.",
          "הוא עבד קשה כדי להגשים את החלום.",
          "לעולם אל תוותר על החלומות שלך.",
        ],
      },
    ],
    idioms: ["חלום שהתגשם", "מעבר לכל החלומות", "החלום האמריקאי"],
    etymology: {
      from: "עברית מקראית",
      original: "ח־ל־ם",
      meant: "חזון, מראה ליל, שורש המופיע בסיפורי יוסף ודניאל",
    },
    kidsExplanation:
      "כשאתם ישנים בלילה, המוח שלכם מציג סרטונים קטנים בראש, אלה נקראים חלומות. חלום זה גם משהו ממש נפלא שאתם רוצים שיקרה יום אחד.",
    composeSentence: "החלום שלה להיות רופאה סוף סוף התגשם.",
    composeStatus: "מושלם ✓",
    imageDescription: "חלום",
    quizQuestion: "איזו מילה אומרת \"שאיפה שאתם רוצים להגשים\"?",
    quizOptions: ["מחשבה", "חלום", "עובדה", "זיכרון"],
    quizCorrect: 1,
    anagramLetters: "םוחל",
    compareWords: "חלום מול שאיפה",
    compareNote: "שתיהן על רצון להשיג, ראו את ההבדל המדויק.",
    partnerHeroTitle: "הפיצו את Gadit. תרוויחו איתנו.",
    partnerHeroBody: "אוהבים את Gadit? שתפו את הלינק האישי שלכם עם הורים, סטודנטים, לומדי שפות, וקבלו 30% מכל מנוי בשנה הראשונה. הגעתם ל-10 מנויים פעילים? פתחתם 10% עמלה לכל החיים על כולם.",
    partnerLink: "gadit.app/?ref=anna",
    partnerEarnings: "₪175",
    partnerSubs: "18",
    partnerRate: "30% בשנה הראשונה · 10% לכל החיים",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "צפו ב-Gadit",
      watchTitle: "ראו איך כל מילה נפתחת, מסלול אחרי מסלול.",
      watchLede: "סיור חי על מילה אמיתית, בשפה שלכם. ריחפו כדי לעצור.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "שותף",
      searchBtn: "חיפוש",
      meaningsLabel: "משמעויות",
      meaningN: (n) => `משמעות ${n}`,
      examplesLabel: "דוגמאות",
      idiomsLabel: "ניבים וצירופים",
      etymologyLabel: "מקור המילה",
      etyFromLabel: "מקור",
      etyMeantLabel: "במקור הכוונה",
      kidsToggle: "מצב ילדים",
      kidsLabel: "הסבר לילדים",
      composeLabel: "כתבו משפט משלכם",
      imageLabel: "תמונה",
      saved: "נשמר במחברת ★",
      plusBasic: "וכל מה שיש ב-Basic",
      plusClear: "וכל מה שיש ב-Clear",
      quizLabel: "חידון",
      gameLabel: "משחק מילים",
      compareLabel: "השוואת מילים",
      dashTitle: "לוח השותפים",
      linkLabel: "הלינק האישי שלכם",
      earningsLabel: "החודש",
      subsLabel: "מנויים פעילים",
      rateLabel: "עמלה",
    },
  },
  ar: {
    word: "حلم",
    searchPlaceholder: "اكتب كلمة",
    meanings: [
      {
        definition: "صور وأفكار وأحاسيس تظهر في الذهن أثناء النوم.",
        examples: [
          "رأيت حلمًا غريبًا الليلة الماضية.",
          "استيقظت من حلم هادئ.",
          "كثيرًا ما يحلم الأطفال بالطيران.",
        ],
      },
      {
        definition: "أمنية عزيزة أو طموح أو هدف بعيد.",
        examples: [
          "كان حلمها أن تصبح كاتبة.",
          "عمل بجدّ ليحقق حلمه.",
          "لا تتخلَّ أبدًا عن أحلامك.",
        ],
      },
    ],
    idioms: ["حلم تحقق", "أحلام وردية", "الحلم الأمريكي"],
    etymology: {
      from: "العربية الفصحى",
      original: "ح‐ل‐م",
      meant: "رؤيا في النوم؛ وكذلك الأناة والصبر في معنى آخر",
    },
    kidsExplanation:
      "حين تنام في الليل، يعرض دماغك أفلامًا صغيرة في رأسك, هذه تسمى أحلام. والحلم أيضًا شيء جميل جدًا تتمنى أن يتحقق يومًا ما.",
    composeSentence: "تحقق حلمها أخيرًا في أن تصبح طبيبة.",
    composeStatus: "ممتاز ✓",
    imageDescription: "حلم",
    quizQuestion: "أيُّ كلمة تعني \"أمنية تتمنى تحقيقها\"؟",
    quizOptions: ["فكرة", "حلم", "حقيقة", "ذكرى"],
    quizCorrect: 1,
    anagramLetters: "ملح",
    compareWords: "حلم مقابل طموح",
    compareNote: "كلاهما عن الرغبة في شيء, شاهد الفرق الدقيق.",
    partnerHeroTitle: "انشر Gadit. اربح معنا.",
    partnerHeroBody: "تحب Gadit؟ شارك رابطك الشخصي مع الأهل والطلاب ومتعلمي اللغات, واحصل على 30% من كل اشتراك في السنة الأولى. وعندما تصل إلى 10 مشتركين نشطين، تفتح 10% عمولة مدى الحياة على جميعهم.",
    partnerLink: "gadit.app/?ref=layla",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% السنة الأولى · 10% مدى الحياة",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "شاهد Gadit",
      watchTitle: "شاهد كيف تنفتح كل كلمة, طبقة بعد طبقة.",
      watchLede: "جولة حية على كلمة حقيقية بلغتك. مرر للإيقاف.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "شريك",
      searchBtn: "بحث",
      meaningsLabel: "المعاني",
      meaningN: (n) => `المعنى ${n}`,
      examplesLabel: "أمثلة",
      idiomsLabel: "تعابير وعبارات",
      etymologyLabel: "أصل الكلمة",
      etyFromLabel: "من",
      etyMeantLabel: "كانت تعني أصلًا",
      kidsToggle: "وضع الأطفال",
      kidsLabel: "شرح للأطفال",
      composeLabel: "اكتب جملتك",
      imageLabel: "صورة",
      saved: "حُفظ في الدفتر ★",
      plusBasic: "بالإضافة إلى كل ما في Basic",
      plusClear: "بالإضافة إلى كل ما في Clear",
      quizLabel: "اختبار",
      gameLabel: "لعبة كلمات",
      compareLabel: "قارن كلمتين",
      dashTitle: "لوحة الشريك",
      linkLabel: "رابطك الشخصي",
      earningsLabel: "هذا الشهر",
      subsLabel: "مشتركون نشطون",
      rateLabel: "عمولة",
    },
  },
  ru: {
    word: "мечта",
    searchPlaceholder: "Введите слово",
    meanings: [
      {
        definition: "Заветное желание, стремление, идеал, к которому человек стремится.",
        examples: [
          "Её мечта, стать писательницей.",
          "Он много работал, чтобы осуществить свою мечту.",
          "Никогда не отказывайся от своей мечты.",
        ],
      },
      {
        definition: "Образ чего-то желанного, рисуемый воображением (нередко далёкий от реальности).",
        examples: [
          "Это была мечта о тихой жизни у моря.",
          "Дом её мечты, небольшая хижина в горах.",
          "Он лелеял мечту о путешествии в Японию.",
        ],
      },
    ],
    idioms: ["мечта всей жизни", "мечтать не вредно", "сбылась мечта"],
    etymology: {
      from: "Старославянский",
      original: "мьчьта",
      meant: "видение, грёза, изначально связано с воображением, а не со сном",
    },
    kidsExplanation:
      "Мечта, это что-то очень-очень хорошее, чего ты сильно хочешь, чтобы случилось. Например, стать космонавтом или иметь собаку.",
    composeSentence: "Её мечта стать врачом наконец сбылась.",
    composeStatus: "Отлично ✓",
    imageDescription: "мечта",
    quizQuestion: "Какое слово означает \"заветное желание, к которому стремишься\"?",
    quizOptions: ["мысль", "мечта", "факт", "память"],
    quizCorrect: 1,
    anagramLetters: "тачме",
    compareWords: "мечта vs. цель",
    compareNote: "Обе о желаниях, посмотрите точное различие.",
    partnerHeroTitle: "Расскажите о Gadit. Зарабатывайте с нами.",
    partnerHeroBody: "Любите Gadit? Поделитесь личной ссылкой с родителями, студентами, изучающими языки, и получайте 30% с каждой подписки в течение первого года. Приведите 10 активных подписчиков, откроется 10% пожизненная комиссия на всех.",
    partnerLink: "gadit.app/?ref=ivan",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% первый год · 10% навсегда",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Посмотрите Gadit",
      watchTitle: "Как раскрывается каждое слово, уровень за уровнем.",
      watchLede: "Живая прогулка по реальному слову на вашем языке. Наведите курсор, чтобы остановить.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Партнёр",
      searchBtn: "Поиск",
      meaningsLabel: "Значения",
      meaningN: (n) => `Значение ${n}`,
      examplesLabel: "Примеры",
      idiomsLabel: "Идиомы и выражения",
      etymologyLabel: "Происхождение",
      etyFromLabel: "Из",
      etyMeantLabel: "Изначально значило",
      kidsToggle: "Детский режим",
      kidsLabel: "Объяснение для детей",
      composeLabel: "Напишите своё предложение",
      imageLabel: "Изображение",
      saved: "Сохранено в тетрадь ★",
      plusBasic: "Плюс всё из Basic",
      plusClear: "Плюс всё из Clear",
      quizLabel: "Викторина",
      gameLabel: "Игра в слова",
      compareLabel: "Сравнить два слова",
      dashTitle: "Панель партнёра",
      linkLabel: "Ваша личная ссылка",
      earningsLabel: "В этом месяце",
      subsLabel: "Активные подписчики",
      rateLabel: "Комиссия",
    },
  },
  es: {
    word: "sueño",
    searchPlaceholder: "Escribe una palabra",
    meanings: [
      {
        definition: "Imágenes, pensamientos y sensaciones que ocurren en la mente durante el sueño.",
        examples: [
          "Tuve un sueño extraño anoche.",
          "Se despertó de un sueño tranquilo.",
          "Los niños a menudo sueñan con volar.",
        ],
      },
      {
        definition: "Aspiración o ideal que se desea alcanzar.",
        examples: [
          "Su sueño era ser escritora.",
          "Trabajó duro para hacer realidad su sueño.",
          "Nunca renuncies a tus sueños.",
        ],
      },
    ],
    idioms: ["un sueño hecho realidad", "ni en sueños", "el sueño americano"],
    etymology: {
      from: "Latín",
      original: "somnium",
      meant: "visión durante el sueño, emparentado con somnus, dormir",
    },
    kidsExplanation:
      "Cuando duermes, tu cerebro proyecta pequeñas películas en tu cabeza, son los sueños. Un sueño también puede ser algo maravilloso que quieres que pase algún día.",
    composeSentence: "Su sueño de ser doctora por fin se cumplió.",
    composeStatus: "Perfecto ✓",
    imageDescription: "sueño",
    quizQuestion: "¿Qué palabra significa \"una aspiración que esperas alcanzar\"?",
    quizOptions: ["pensamiento", "sueño", "hecho", "recuerdo"],
    quizCorrect: 1,
    anagramLetters: "oñues",
    compareWords: "sueño vs. ambición",
    compareNote: "Ambos sobre desear algo, observa la diferencia exacta.",
    partnerHeroTitle: "Difunde Gadit. Gana con nosotros.",
    partnerHeroBody: "¿Te encanta Gadit? Comparte tu enlace personal con padres, estudiantes y aprendices de idiomas, y gana el 30% de cada suscripción durante el primer año. Alcanza 10 suscriptores activos y desbloqueas el 10% de comisión de por vida sobre todos ellos.",
    partnerLink: "gadit.app/?ref=maria",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% año 1 · 10% de por vida",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Mira Gadit",
      watchTitle: "Mira cómo se abre cada palabra, plan por plan.",
      watchLede: "Un recorrido en vivo de una palabra real, en tu idioma. Pasa el cursor para pausar.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Socio",
      searchBtn: "Buscar",
      meaningsLabel: "Significados",
      meaningN: (n) => `Significado ${n}`,
      examplesLabel: "Ejemplos",
      idiomsLabel: "Modismos y expresiones",
      etymologyLabel: "Origen de la palabra",
      etyFromLabel: "De",
      etyMeantLabel: "Significaba originalmente",
      kidsToggle: "Modo niños",
      kidsLabel: "Explicación para niños",
      composeLabel: "Escribe tu frase",
      imageLabel: "Imagen",
      saved: "Guardado en el cuaderno ★",
      plusBasic: "Más todo lo de Basic",
      plusClear: "Más todo lo de Clear",
      quizLabel: "Quiz",
      gameLabel: "Juego de palabras",
      compareLabel: "Compara dos palabras",
      dashTitle: "Panel de socio",
      linkLabel: "Tu enlace personal",
      earningsLabel: "Este mes",
      subsLabel: "Suscriptores activos",
      rateLabel: "Comisión",
    },
  },
  pt: {
    word: "sonho",
    searchPlaceholder: "Digite uma palavra",
    meanings: [
      {
        definition: "Imagens, pensamentos e sensações que ocorrem na mente durante o sono.",
        examples: [
          "Tive um sonho estranho ontem à noite.",
          "Ela acordou de um sonho tranquilo.",
          "Crianças muitas vezes sonham em voar.",
        ],
      },
      {
        definition: "Aspiração, ideal ou desejo profundo que se quer realizar.",
        examples: [
          "Era seu sonho tornar-se escritora.",
          "Ele trabalhou duro para realizar seu sonho.",
          "Nunca desista dos seus sonhos.",
        ],
      },
    ],
    idioms: ["um sonho realizado", "nem em sonhos", "o sonho americano"],
    etymology: {
      from: "Latim",
      original: "somnium",
      meant: "visão durante o sono, da mesma raiz que somnus, dormir",
    },
    kidsExplanation:
      "Quando você dorme, seu cérebro mostra pequenos filmes na sua cabeça, esses são os sonhos. Um sonho também pode ser algo muito legal que você quer que aconteça um dia.",
    composeSentence: "Seu sonho de ser médica finalmente se realizou.",
    composeStatus: "Perfeito ✓",
    imageDescription: "sonho",
    quizQuestion: "Qual palavra significa \"uma aspiração que você espera alcançar\"?",
    quizOptions: ["pensamento", "sonho", "fato", "memória"],
    quizCorrect: 1,
    anagramLetters: "ohnos",
    compareWords: "sonho vs. ambição",
    compareNote: "Ambos sobre querer algo, veja a diferença exata.",
    partnerHeroTitle: "Divulgue o Gadit. Ganhe com a gente.",
    partnerHeroBody: "Ama o Gadit? Compartilhe seu link pessoal com pais, estudantes e aprendizes de idiomas, e ganhe 30% de cada assinatura no primeiro ano. Chegue a 10 assinantes ativos e desbloqueie 10% de comissão vitalícia em todos eles.",
    partnerLink: "gadit.app/?ref=joao",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% ano 1 · 10% vitalício",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Veja o Gadit",
      watchTitle: "Veja como cada palavra se abre, plano a plano.",
      watchLede: "Um passeio ao vivo por uma palavra real, no seu idioma. Passe o mouse para pausar.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Parceiro",
      searchBtn: "Buscar",
      meaningsLabel: "Significados",
      meaningN: (n) => `Significado ${n}`,
      examplesLabel: "Exemplos",
      idiomsLabel: "Expressões e ditados",
      etymologyLabel: "Origem da palavra",
      etyFromLabel: "Do",
      etyMeantLabel: "Significava originalmente",
      kidsToggle: "Modo crianças",
      kidsLabel: "Explicação para crianças",
      composeLabel: "Escreva sua frase",
      imageLabel: "Imagem",
      saved: "Salvo no caderno ★",
      plusBasic: "Mais tudo do Basic",
      plusClear: "Mais tudo do Clear",
      quizLabel: "Quiz",
      gameLabel: "Jogo de palavras",
      compareLabel: "Compare duas palavras",
      dashTitle: "Painel do parceiro",
      linkLabel: "Seu link pessoal",
      earningsLabel: "Este mês",
      subsLabel: "Assinantes ativos",
      rateLabel: "Comissão",
    },
  },
  fr: {
    word: "rêve",
    searchPlaceholder: "Tapez un mot",
    meanings: [
      {
        definition: "Images, pensées et sensations qui se produisent dans l'esprit pendant le sommeil.",
        examples: [
          "J'ai fait un rêve étrange hier soir.",
          "Elle s'est réveillée d'un rêve paisible.",
          "Les enfants rêvent souvent de voler.",
        ],
      },
      {
        definition: "Aspiration profonde, idéal que l'on souhaite réaliser.",
        examples: [
          "Son rêve était de devenir écrivaine.",
          "Il a travaillé dur pour réaliser son rêve.",
          "N'abandonne jamais tes rêves.",
        ],
      },
    ],
    idioms: ["un rêve devenu réalité", "rêve éveillé", "le rêve américain"],
    etymology: {
      from: "Ancien français",
      original: "resver",
      meant: "divaguer, errer, le sens onirique apparaît au XVIIe siècle",
    },
    kidsExplanation:
      "Quand tu dors la nuit, ton cerveau passe de petits films dans ta tête, ce sont les rêves. Un rêve, c'est aussi quelque chose de merveilleux que tu veux voir arriver un jour.",
    composeSentence: "Son rêve de devenir médecin s'est enfin réalisé.",
    composeStatus: "Parfait ✓",
    imageDescription: "rêve",
    quizQuestion: "Quel mot signifie \"une aspiration que l'on espère réaliser\" ?",
    quizOptions: ["pensée", "rêve", "fait", "mémoire"],
    quizCorrect: 1,
    anagramLetters: "êver",
    compareWords: "rêve vs. ambition",
    compareNote: "Les deux concernent un désir, observez la différence précise.",
    partnerHeroTitle: "Faites connaître Gadit. Gagnez avec nous.",
    partnerHeroBody: "Vous adorez Gadit ? Partagez votre lien personnel avec parents, étudiants, apprenants de langues, et gagnez 30 % sur chaque abonnement la première année. Atteignez 10 abonnés actifs et débloquez 10 % de commission à vie sur tous.",
    partnerLink: "gadit.app/?ref=marie",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% année 1 · 10% à vie",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Regardez Gadit",
      watchTitle: "Comment chaque mot s'ouvre, palier par palier.",
      watchLede: "Une visite en direct d'un vrai mot, dans votre langue. Survolez pour mettre en pause.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partenaire",
      searchBtn: "Rechercher",
      meaningsLabel: "Significations",
      meaningN: (n) => `Sens ${n}`,
      examplesLabel: "Exemples",
      idiomsLabel: "Expressions et locutions",
      etymologyLabel: "Origine du mot",
      etyFromLabel: "Du",
      etyMeantLabel: "Signifiait à l'origine",
      kidsToggle: "Mode enfants",
      kidsLabel: "Explication pour enfants",
      composeLabel: "Écrivez votre phrase",
      imageLabel: "Image",
      saved: "Enregistré dans le carnet ★",
      plusBasic: "Plus tout de Basic",
      plusClear: "Plus tout de Clear",
      quizLabel: "Quiz",
      gameLabel: "Jeu de mots",
      compareLabel: "Comparez deux mots",
      dashTitle: "Tableau du partenaire",
      linkLabel: "Votre lien personnel",
      earningsLabel: "Ce mois-ci",
      subsLabel: "Abonnés actifs",
      rateLabel: "Commission",
    },
  },
  de: {
    word: "Traum",
    searchPlaceholder: "Wort eingeben",
    meanings: [
      {
        definition: "Bilder, Gedanken und Empfindungen, die während des Schlafs im Geist erscheinen.",
        examples: [
          "Ich hatte gestern Nacht einen seltsamen Traum.",
          "Sie wachte aus einem friedlichen Traum auf.",
          "Kinder träumen oft vom Fliegen.",
        ],
      },
      {
        definition: "Ein sehnlicher Wunsch, ein Ideal, ein Lebensziel.",
        examples: [
          "Es war ihr Traum, Schriftstellerin zu werden.",
          "Er arbeitete hart, um seinen Traum zu verwirklichen.",
          "Gib deine Träume niemals auf.",
        ],
      },
    ],
    idioms: ["ein Traum wird wahr", "nicht im Traum", "der amerikanische Traum"],
    etymology: {
      from: "Althochdeutsch",
      original: "troum",
      meant: "Trugbild, Vision im Schlaf, verwandt mit altenglisch dréam (Freude, Musik)",
    },
    kidsExplanation:
      "Wenn du nachts schläfst, spielt dein Gehirn kleine Filme in deinem Kopf ab, das sind Träume. Ein Traum kann auch etwas Wunderbares sein, das du dir für dein Leben wünschst.",
    composeSentence: "Ihr Traum, Ärztin zu werden, ging endlich in Erfüllung.",
    composeStatus: "Perfekt ✓",
    imageDescription: "Traum",
    quizQuestion: "Welches Wort bedeutet \"ein Ziel, das man erreichen möchte\"?",
    quizOptions: ["Gedanke", "Traum", "Tatsache", "Erinnerung"],
    quizCorrect: 1,
    anagramLetters: "marTu",
    compareWords: "Traum vs. Ziel",
    compareNote: "Beide drehen sich um Wünsche, sieh den genauen Unterschied.",
    partnerHeroTitle: "Verbreite Gadit. Verdiene mit uns.",
    partnerHeroBody: "Du liebst Gadit? Teile deinen persönlichen Link mit Eltern, Schülerinnen, Sprachlernenden, und verdiene im ersten Jahr 30 % auf jedes Abonnement. Erreichst du 10 aktive Abonnenten, schaltest du 10 % Lebenslang-Provision auf alle frei.",
    partnerLink: "gadit.app/?ref=lena",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% Jahr 1 · 10% lebenslang",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Schau Gadit",
      watchTitle: "Wie sich jedes Wort öffnet, Stufe für Stufe.",
      watchLede: "Eine Live-Tour durch ein echtes Wort, in deiner Sprache. Hover zum Pausieren.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Suchen",
      meaningsLabel: "Bedeutungen",
      meaningN: (n) => `Bedeutung ${n}`,
      examplesLabel: "Beispiele",
      idiomsLabel: "Redewendungen",
      etymologyLabel: "Wortherkunft",
      etyFromLabel: "Aus",
      etyMeantLabel: "Bedeutete ursprünglich",
      kidsToggle: "Kindermodus",
      kidsLabel: "Erklärung für Kinder",
      composeLabel: "Schreibe deinen Satz",
      imageLabel: "Bild",
      saved: "Im Notizbuch gespeichert ★",
      plusBasic: "Plus alles aus Basic",
      plusClear: "Plus alles aus Clear",
      quizLabel: "Quiz",
      gameLabel: "Wortspiel",
      compareLabel: "Zwei Wörter vergleichen",
      dashTitle: "Partner-Dashboard",
      linkLabel: "Dein persönlicher Link",
      earningsLabel: "Diesen Monat",
      subsLabel: "Aktive Abonnenten",
      rateLabel: "Provision",
    },
  },
  cs: {
    word: "sen",
    searchPlaceholder: "Napiš slovo",
    meanings: [
      {
        definition: "Obrazy, myšlenky a pocity, které vznikají v mysli během spánku.",
        examples: [
          "Měl jsem včera v noci podivný sen.",
          "Probudila se z klidného snu.",
          "Děti často sní o létání.",
        ],
      },
      {
        definition: "Vroucí touha, ideál nebo cíl, který si přejeme dosáhnout.",
        examples: [
          "Jejím snem bylo stát se spisovatelkou.",
          "Tvrdě pracoval, aby si splnil svůj sen.",
          "Nikdy se nevzdávej svých snů.",
        ],
      },
    ],
    idioms: ["sen, který se splnil", "ani ve snu", "americký sen"],
    etymology: {
      from: "Praslovanština",
      original: "sъnъ",
      meant: "spánek a obrazy ve spánku, společné s ruským сон a polským sen",
    },
    kidsExplanation:
      "Když v noci spíš, tvůj mozek ti v hlavě pouští krátké filmy, tomu se říká sen. Sen je taky něco moc krásného, co bys chtěl, aby se ti jednou splnilo.",
    composeSentence: "Její sen stát se lékařkou se konečně splnil.",
    composeStatus: "Skvělé ✓",
    imageDescription: "sen",
    quizQuestion: "Které slovo znamená \"přání, kterého chceš dosáhnout\"?",
    quizOptions: ["myšlenka", "sen", "fakt", "vzpomínka"],
    quizCorrect: 1,
    anagramLetters: "nse",
    compareWords: "sen vs. cíl",
    compareNote: "Obojí o touze, podívej se na přesný rozdíl.",
    partnerHeroTitle: "Šiř Gadit. Vydělávej s námi.",
    partnerHeroBody: "Miluješ Gadit? Sdílej svůj osobní odkaz s rodiči, studenty a těmi, kdo se učí jazyk, a vydělej 30 % z každého předplatného v prvním roce. Dosáhneš 10 aktivních předplatitelů a odemkneš 10 % doživotní provize na všechny.",
    partnerLink: "gadit.app/?ref=andrea",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% první rok · 10% navždy",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Podívej se na Gadit",
      watchTitle: "Jak se otevírá každé slovo, úroveň po úrovni.",
      watchLede: "Živá ukázka skutečného slova ve tvém jazyce. Najeď myší pro pauzu.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Hledat",
      meaningsLabel: "Významy",
      meaningN: (n) => `Význam ${n}`,
      examplesLabel: "Příklady",
      idiomsLabel: "Idiomy a výrazy",
      etymologyLabel: "Původ slova",
      etyFromLabel: "Z",
      etyMeantLabel: "Původně znamenalo",
      kidsToggle: "Dětský režim",
      kidsLabel: "Vysvětlení pro děti",
      composeLabel: "Napiš svou větu",
      imageLabel: "Obrázek",
      saved: "Uloženo do sešitu ★",
      plusBasic: "Plus vše z Basic",
      plusClear: "Plus vše z Clear",
      quizLabel: "Kvíz",
      gameLabel: "Slovní hra",
      compareLabel: "Porovnat dvě slova",
      dashTitle: "Přehled partnera",
      linkLabel: "Tvůj osobní odkaz",
      earningsLabel: "Tento měsíc",
      subsLabel: "Aktivní předplatitelé",
      rateLabel: "Provize",
    },
  },
  sk: {
    word: "sen",
    searchPlaceholder: "Napíš slovo",
    meanings: [
      {
        definition: "Obrazy, myšlienky a pocity, ktoré vznikajú v mysli počas spánku.",
        examples: [
          "Mal som včera v noci čudný sen.",
          "Zobudila sa z pokojného sna.",
          "Deti často snívajú o lietaní.",
        ],
      },
      {
        definition: "Hlboká túžba, ideál alebo cieľ, ktorý si želáme dosiahnuť.",
        examples: [
          "Jej snom bolo stať sa spisovateľkou.",
          "Tvrdo pracoval, aby si splnil svoj sen.",
          "Nikdy sa nevzdávaj svojich snov.",
        ],
      },
    ],
    idioms: ["sen, ktorý sa splnil", "ani vo sne", "americký sen"],
    etymology: {
      from: "Praslovančina",
      original: "sъnъ",
      meant: "spánok a obrazy v spánku, spoločné s ruským сон a poľským sen",
    },
    kidsExplanation:
      "Keď v noci spíš, tvoj mozog ti v hlave púšťa krátke filmy, to sa nazýva sen. Sen je tiež niečo veľmi pekné, čo by si chcel, aby sa ti raz splnilo.",
    composeSentence: "Jej sen stať sa lekárkou sa konečne splnil.",
    composeStatus: "Skvelé ✓",
    imageDescription: "sen",
    quizQuestion: "Ktoré slovo znamená \"prianie, ktoré chceš dosiahnuť\"?",
    quizOptions: ["myšlienka", "sen", "fakt", "spomienka"],
    quizCorrect: 1,
    anagramLetters: "nse",
    compareWords: "sen vs. cieľ",
    compareNote: "Oboje o túžbe, pozri sa na presný rozdiel.",
    partnerHeroTitle: "Šír Gadit. Zarábaj s nami.",
    partnerHeroBody: "Miluješ Gadit? Zdieľaj svoj osobný odkaz s rodičmi, študentmi a tými, ktorí sa učia jazyk, a zaroby 30 % z každého predplatného v prvom roku. Dosiahneš 10 aktívnych predplatiteľov a odomkneš 10 % doživotnú províziu na všetkých.",
    partnerLink: "gadit.app/?ref=zuzana",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% prvý rok · 10% navždy",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Pozri si Gadit",
      watchTitle: "Ako sa otvára každé slovo, úroveň za úrovňou.",
      watchLede: "Živá ukážka skutočného slova v tvojom jazyku. Nájazd myšou pre pauzu.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Hľadať",
      meaningsLabel: "Významy",
      meaningN: (n) => `Význam ${n}`,
      examplesLabel: "Príklady",
      idiomsLabel: "Idiómy a výrazy",
      etymologyLabel: "Pôvod slova",
      etyFromLabel: "Z",
      etyMeantLabel: "Pôvodne znamenalo",
      kidsToggle: "Detský režim",
      kidsLabel: "Vysvetlenie pre deti",
      composeLabel: "Napíš svoju vetu",
      imageLabel: "Obrázok",
      saved: "Uložené do zošita ★",
      plusBasic: "Plus všetko z Basic",
      plusClear: "Plus všetko z Clear",
      quizLabel: "Kvíz",
      gameLabel: "Slovná hra",
      compareLabel: "Porovnať dve slová",
      dashTitle: "Prehľad partnera",
      linkLabel: "Tvoj osobný odkaz",
      earningsLabel: "Tento mesiac",
      subsLabel: "Aktívni predplatitelia",
      rateLabel: "Provízia",
    },
  },
  it: {
    word: "sogno",
    searchPlaceholder: "Scrivi una parola",
    meanings: [
      {
        definition: "Immagini, pensieri e sensazioni che si manifestano nella mente durante il sonno.",
        examples: [
          "Ho fatto uno strano sogno la notte scorsa.",
          "Si è svegliata da un sogno tranquillo.",
          "I bambini sognano spesso di volare.",
        ],
      },
      {
        definition: "Aspirazione profonda, ideale o desiderio che si vuole realizzare.",
        examples: [
          "Il suo sogno era diventare scrittrice.",
          "Ha lavorato sodo per realizzare il suo sogno.",
          "Non rinunciare mai ai tuoi sogni.",
        ],
      },
    ],
    idioms: ["un sogno che si avvera", "nemmeno per sogno", "il sogno americano"],
    etymology: {
      from: "Latino",
      original: "somnium",
      meant: "visione nel sonno, dalla stessa radice di somnus, dormire",
    },
    kidsExplanation:
      "Quando dormi la notte, il tuo cervello ti fa vedere piccoli film nella testa, quelli sono i sogni. Un sogno può anche essere qualcosa di bellissimo che vuoi che accada un giorno.",
    composeSentence: "Il suo sogno di diventare medico si è finalmente avverato.",
    composeStatus: "Perfetto ✓",
    imageDescription: "sogno",
    quizQuestion: "Quale parola significa \"un'aspirazione che speri di realizzare\"?",
    quizOptions: ["pensiero", "sogno", "fatto", "ricordo"],
    quizCorrect: 1,
    anagramLetters: "ognso",
    compareWords: "sogno vs. ambizione",
    compareNote: "Entrambi parlano di desiderio, guarda la differenza precisa.",
    partnerHeroTitle: "Diffondi Gadit. Guadagna con noi.",
    partnerHeroBody: "Adori Gadit? Condividi il tuo link personale con genitori, studenti, chi impara una lingua, e guadagna il 30 % su ogni abbonamento nel primo anno. Raggiungi 10 abbonati attivi e sblocchi il 10 % di commissione a vita su tutti loro.",
    partnerLink: "gadit.app/?ref=luca",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "30% anno 1 · 10% a vita",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Guarda Gadit",
      watchTitle: "Come si apre ogni parola, piano per piano.",
      watchLede: "Un tour dal vivo di una vera parola, nella tua lingua. Passa il mouse per mettere in pausa.",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "Partner",
      searchBtn: "Cerca",
      meaningsLabel: "Significati",
      meaningN: (n) => `Significato ${n}`,
      examplesLabel: "Esempi",
      idiomsLabel: "Modi di dire ed espressioni",
      etymologyLabel: "Origine della parola",
      etyFromLabel: "Da",
      etyMeantLabel: "Significava originariamente",
      kidsToggle: "Modalità bambini",
      kidsLabel: "Spiegazione per bambini",
      composeLabel: "Scrivi la tua frase",
      imageLabel: "Immagine",
      saved: "Salvato nel quaderno ★",
      plusBasic: "Più tutto di Basic",
      plusClear: "Più tutto di Clear",
      quizLabel: "Quiz",
      gameLabel: "Gioco di parole",
      compareLabel: "Confronta due parole",
      dashTitle: "Dashboard partner",
      linkLabel: "Il tuo link personale",
      earningsLabel: "Questo mese",
      subsLabel: "Abbonati attivi",
      rateLabel: "Commissione",
    },
  },
  ja: {
    word: "夢",
    searchPlaceholder: "単語を入力",
    meanings: [
      {
        definition: "睡眠中に心に浮かぶ映像、考え、感覚。",
        examples: [
          "昨夜、不思議な夢を見た。",
          "彼女は穏やかな夢から目を覚ました。",
          "子どもはよく空を飛ぶ夢を見る。",
        ],
      },
      {
        definition: "心から望む将来の目標や理想。",
        examples: [
          "彼女の夢は作家になることだった。",
          "夢を実現するために懸命に働いた。",
          "決して夢をあきらめないで。",
        ],
      },
    ],
    idioms: ["夢が叶う", "夢にも思わない", "アメリカン・ドリーム"],
    etymology: {
      from: "古代日本語",
      original: "いめ",
      meant: "寝目（いめ）,  「寝ているときに見るもの」が語源。後に「願い」の意味も加わった",
    },
    kidsExplanation:
      "夜にねむると、頭の中で小さな映画みたいなものが流れるんだ。それが「夢」。夢は、いつかかなえたい大きな願いのことでもあるよ。",
    composeSentence: "彼女の医師になるという夢がついに叶った。",
    composeStatus: "完璧 ✓",
    imageDescription: "夢",
    quizQuestion: "「叶えたい願い」を意味する語はどれ?",
    quizOptions: ["考え", "夢", "事実", "記憶"],
    quizCorrect: 1,
    anagramLetters: "夢",
    compareWords: "夢 と 目標",
    compareNote: "どちらも望みについて, 正確な違いを見てみよう。",
    partnerHeroTitle: "Gadit を広めよう。一緒に稼ごう。",
    partnerHeroBody: "Gadit がお気に入りなら、あなたの個人リンクを保護者・生徒・語学学習者にシェアしてみませんか。初年度はサブスクごとに 30% の報酬。アクティブな購読者が10人になると、全員に対して 10% の生涯コミッションがアンロックされます。",
    partnerLink: "gadit.app/?ref=yuki",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "初年度30% · 永続10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit を見る",
      watchTitle: "ひとつの単語がどう開かれるか, プランごとに。",
      watchLede: "あなたの言語で、実際の単語のライブツアー。ホバーで一時停止。",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "パートナー",
      searchBtn: "検索",
      meaningsLabel: "意味",
      meaningN: (n) => `意味 ${n}`,
      examplesLabel: "例文",
      idiomsLabel: "イディオム・表現",
      etymologyLabel: "語源",
      etyFromLabel: "出典",
      etyMeantLabel: "元の意味",
      kidsToggle: "子どもモード",
      kidsLabel: "子ども向け説明",
      composeLabel: "あなたの文を書く",
      imageLabel: "ビジュアル",
      saved: "ノートに保存 ★",
      plusBasic: "Basic のすべて＋",
      plusClear: "Clear のすべて＋",
      quizLabel: "クイズ",
      gameLabel: "単語ゲーム",
      compareLabel: "2つの単語を比較",
      dashTitle: "パートナーダッシュボード",
      linkLabel: "あなたの個人リンク",
      earningsLabel: "今月",
      subsLabel: "アクティブ会員",
      rateLabel: "コミッション",
    },
  },
  hi: {
    word: "सपना",
    searchPlaceholder: "कोई शब्द लिखें",
    meanings: [
      {
        definition: "नींद के दौरान मन में आने वाली तस्वीरें, विचार और संवेदनाएँ।",
        examples: [
          "मुझे कल रात एक अजीब सपना आया।",
          "वह एक शांत सपने से जागी।",
          "बच्चे अक्सर उड़ने के सपने देखते हैं।",
        ],
      },
      {
        definition: "एक भविष्य का लक्ष्य या आदर्श जिसकी आप दिल से चाहत रखते हैं।",
        examples: [
          "उसका सपना लेखक बनने का था।",
          "उसने अपने सपने को सच करने के लिए कड़ी मेहनत की।",
          "अपने सपनों को कभी मत छोड़ो।",
        ],
      },
    ],
    idioms: ["सपना सच होना", "सपने में भी न सोचना", "अमेरिकन ड्रीम"],
    etymology: {
      from: "संस्कृत",
      original: "स्वप्न",
      meant: "स्वप्न (svapna), जिसका अर्थ है 'नींद में दिखने वाला दृश्य'। बाद में 'इच्छा' और 'महत्वाकांक्षा' का अर्थ भी जुड़ा।",
    },
    kidsExplanation:
      "जब आप सोते हैं, तो आपका दिमाग आपके सिर में छोटी फ़िल्में चलाता है, उन्हीं को सपने कहते हैं। सपना वह चीज़ भी है जिसे आप वाक़ई किसी दिन सच करना चाहते हैं।",
    composeSentence: "उसका डॉक्टर बनने का सपना आख़िरकार सच हो गया।",
    composeStatus: "एकदम सही ✓",
    imageDescription: "सपना",
    quizQuestion: "कौन सा शब्द 'एक चाहत जो आप पूरी करना चाहते हैं' का अर्थ देता है?",
    quizOptions: ["विचार", "सपना", "तथ्य", "स्मृति"],
    quizCorrect: 1,
    anagramLetters: "सपना",
    compareWords: "सपना बनाम लक्ष्य",
    compareNote: "दोनों चाहत के बारे में हैं, सटीक अंतर देखें।",
    partnerHeroTitle: "Gadit का प्रसार करें। साथ कमाएँ।",
    partnerHeroBody: "अगर आपको Gadit पसंद है, तो अपना निजी लिंक माता-पिता, छात्रों और भाषा सीखने वालों के साथ साझा करें। पहले साल हर सब्सक्रिप्शन पर 30% कमाएँ। जब आपके 10 सक्रिय सब्सक्राइबर हों, तब सब पर आजीवन 10% कमीशन अनलॉक हो जाता है।",
    partnerLink: "gadit.app/?ref=arjun",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "पहला साल 30% · आजीवन 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gadit देखें",
      watchTitle: "एक शब्द कैसे खुलता है, हर टियर के साथ।",
      watchLede: "आपकी भाषा में, असली शब्द का लाइव टूर। रोकने के लिए होवर करें।",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "पार्टनर",
      searchBtn: "खोज",
      meaningsLabel: "अर्थ",
      meaningN: (n) => `अर्थ ${n}`,
      examplesLabel: "उदाहरण",
      idiomsLabel: "मुहावरे और अभिव्यक्तियाँ",
      etymologyLabel: "उत्पत्ति",
      etyFromLabel: "स्रोत",
      etyMeantLabel: "मूल अर्थ",
      kidsToggle: "बच्चों का मोड",
      kidsLabel: "बच्चों के लिए समझ",
      composeLabel: "अपना वाक्य लिखें",
      imageLabel: "तस्वीर",
      saved: "नोटबुक में सहेजा ★",
      plusBasic: "Basic के सब कुछ +",
      plusClear: "Clear के सब कुछ +",
      quizLabel: "क्विज़",
      gameLabel: "शब्द खेल",
      compareLabel: "दो शब्दों की तुलना",
      dashTitle: "पार्टनर डैशबोर्ड",
      linkLabel: "आपका निजी लिंक",
      earningsLabel: "इस महीने",
      subsLabel: "सक्रिय सब्सक्राइबर",
      rateLabel: "कमीशन",
    },
  },
  am: {
    word: "ሕልም",
    searchPlaceholder: "ማንኛውንም ቃል ይጻፉ",
    meanings: [
      {
        definition: "በእንቅልፍ ወቅት በአእምሮ ውስጥ የሚመጡ ምስሎች፣ ሀሳቦች እና ስሜቶች።",
        examples: [
          "ትናንት ማታ እንግዳ ሕልም አየሁ።",
          "ከረጋ ሕልም ነቃች።",
          "ልጆች ብዙ ጊዜ ስለ መብረር ያልማሉ።",
        ],
      },
      {
        definition: "ከልብ የሚመኙት የወደፊት ግብ ወይም ራዕይ።",
        examples: [
          "ሕልሟ ጸሐፊ መሆን ነበር።",
          "ሕልሙን እውን ለማድረግ ጠንክሮ ሠራ።",
          "ሕልሞችዎን በፍጹም አይተዉ።",
        ],
      },
    ],
    idioms: ["ሕልም እውን ሆነ", "በሕልሜም አላስበውም", "የአሜሪካ ሕልም"],
    etymology: {
      from: "ግዕዝ",
      original: "ሐለመ",
      meant: "ሐለመ (ḥalama)፣ ትርጉሙም 'በእንቅልፍ ውስጥ ማየት'። በኋላ 'ምኞት' እና 'ራዕይ' የሚል ትርጉምም ተጨመረበት።",
    },
    kidsExplanation:
      "በሚተኙበት ጊዜ አእምሮዎ በጭንቅላትዎ ውስጥ ትንንሽ ፊልሞችን ያሳያል፣ እነዚህ ሕልሞች ይባላሉ። ሕልም ማለት አንድ ቀን በእውነት እንዲሆን የሚፈልጉት ነገርም ነው።",
    composeSentence: "ሐኪም የመሆን ሕልሟ በመጨረሻ እውን ሆነ።",
    composeStatus: "ፍጹም ✓",
    imageDescription: "ሕልም",
    quizQuestion: "'እውን ማድረግ የሚፈልጉት ምኞት' የሚል ትርጉም የሚሰጠው የትኛው ቃል ነው?",
    quizOptions: ["ሀሳብ", "ሕልም", "እውነታ", "ትውስታ"],
    quizCorrect: 1,
    anagramLetters: "ሕልም",
    compareWords: "ሕልም እና ግብ",
    compareNote: "ሁለቱም ስለ ምኞት ናቸው፣ ትክክለኛውን ልዩነት ይመልከቱ።",
    partnerHeroTitle: "Gaditን ያስፋፉ። ከእኛ ጋር ገቢ ያግኙ።",
    partnerHeroBody: "Gadit ከወደዱት፣ የግል አገናኝዎን ለወላጆች፣ ለተማሪዎች እና ቋንቋ ለሚማሩ ሰዎች ያጋሩ። በመጀመሪያው ዓመት ከእያንዳንዱ ምዝገባ 30% ያግኙ። 10 ንቁ ተመዝጋቢዎች ሲኖሩዎት፣ በሁሉም ላይ የዕድሜ ልክ 10% ኮሚሽን ይከፈታል።",
    partnerLink: "gadit.app/?ref=abebe",
    partnerEarnings: "$47.30",
    partnerSubs: "18",
    partnerRate: "የመጀመሪያ ዓመት 30% · የዕድሜ ልክ 10%",
    partnerStatus: "Active Partner ⭐",
    l: {
      watchEyebrow: "Gaditን ይመልከቱ",
      watchTitle: "አንድ ቃል እንዴት እንደሚከፈት፣ በእያንዳንዱ ደረጃ።",
      watchLede: "በእርስዎ ቋንቋ፣ የእውነተኛ ቃል የቀጥታ ጉብኝት። ለማቆም ጠቋሚውን በላዩ ላይ ያሳርፉ።",
      tierBasic: "Basic",
      tierClear: "Clear",
      tierDeep: "Deep",
      tierPartner: "አጋር",
      searchBtn: "ፈልግ",
      meaningsLabel: "ትርጉሞች",
      meaningN: (n) => `ትርጉም ${n}`,
      examplesLabel: "ምሳሌዎች",
      idiomsLabel: "ፈሊጣዊ አገላለጾች",
      etymologyLabel: "ሥርወ ቃል",
      etyFromLabel: "ምንጭ",
      etyMeantLabel: "የመጀመሪያ ትርጉም",
      kidsToggle: "የልጆች ሁነታ",
      kidsLabel: "ለልጆች ማብራሪያ",
      composeLabel: "የራስዎን ዓረፍተ ነገር ይጻፉ",
      imageLabel: "ምስል",
      saved: "በማስታወሻ ደብተር ተቀምጧል ★",
      plusBasic: "የ Basic ሁሉም ነገር +",
      plusClear: "የ Clear ሁሉም ነገር +",
      quizLabel: "ኩዊዝ",
      gameLabel: "የቃላት ጨዋታ",
      compareLabel: "ሁለት ቃላትን ማወዳደር",
      dashTitle: "የአጋር ዳሽቦርድ",
      linkLabel: "የእርስዎ የግል አገናኝ",
      earningsLabel: "በዚህ ወር",
      subsLabel: "ንቁ ተመዝጋቢዎች",
      rateLabel: "ኮሚሽን",
    },
  },
};

function pickDemo(lang: Lang): DemoContent {
  return DEMO[lang] ?? DEMO.en;
}

export function GaditDemoAnimation() {
  const { lang } = useLang();
  const d = pickDemo(lang);
  const c = d.l;
  const [scene, setScene] = useState<Scene>("basic");
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    const dur = SCENE_DURATION_MS[scene];
    timeoutRef.current = setTimeout(() => {
      const idx = SCENE_ORDER.indexOf(scene);
      setScene(SCENE_ORDER[(idx + 1) % SCENE_ORDER.length]);
    }, dur);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scene, paused]);

  return (
    <div
      className="wb-demo-anim"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Gadit feature tour"
    >
      <div className="wb-demo-anim-headstrip">
        <div className="wb-demo-anim-eyebrow">{c.watchEyebrow}</div>
        <h2 className="wb-demo-anim-title">{c.watchTitle}</h2>
        <p className="wb-demo-anim-lede">{c.watchLede}</p>
      </div>

      <div className="wb-demo-anim-frame">
        <div className="wb-demo-anim-topbar">
          <div className="wb-demo-anim-wordmark">
            Gad<span className="wb-demo-anim-wordmark-it">it</span>
          </div>
          <div className={`wb-demo-anim-tier wb-demo-anim-tier-${scene}`}>
            {scene === "basic" ? c.tierBasic :
             scene === "clear" ? c.tierClear :
             scene === "deep" ? c.tierDeep :
             c.tierPartner}
          </div>
        </div>

        {/* Search bar, always visible except on the partner scene,
            because the partner scene reframes the chrome as a dashboard
            rather than a lookup. The input shows the word "typed" so
            the visitor sees the connection between search → result. */}
        {scene !== "partner" && (
          <div className="wb-demo-anim-search">
            <input
              className="wb-demo-anim-search-input"
              value={d.word}
              readOnly
              aria-label={d.searchPlaceholder}
            />
            <button type="button" className="wb-demo-anim-search-btn" tabIndex={-1}>
              {c.searchBtn}
            </button>
          </div>
        )}

        <div className="wb-demo-anim-stage">
          {scene === "basic" && <BasicScene d={d} c={c} />}
          {scene === "clear" && <ClearScene d={d} c={c} />}
          {scene === "deep" && <DeepScene d={d} c={c} />}
          {scene === "partner" && <PartnerScene d={d} c={c} />}
        </div>

        <div className="wb-demo-anim-dots" role="tablist">
          {SCENE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scene === s}
              aria-label={
                s === "basic" ? c.tierBasic :
                s === "clear" ? c.tierClear :
                s === "deep" ? c.tierDeep :
                c.tierPartner
              }
              className={`wb-demo-anim-dot${scene === s ? " is-active" : ""}`}
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setScene(s);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scenes ─────────────────────────────────────────────────────

function BasicScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "150ms" }}>
        {c.meaningsLabel} ({d.meanings.length})
      </div>

      {d.meanings.map((m, mi) => (
        <div
          key={mi}
          className="wb-demo-anim-meaning"
          style={{ animationDelay: `${300 + mi * 250}ms` }}
        >
          <div className="wb-demo-anim-meaning-n">{c.meaningN(mi + 1)}</div>
          <div className="wb-demo-anim-meaning-body">{m.definition}</div>
          <ul className="wb-demo-anim-list">
            {m.examples.map((ex, ei) => (
              <li
                key={ei}
                className="wb-demo-anim-li"
                style={{ animationDelay: `${600 + mi * 250 + ei * 180}ms` }}
              >
                {ex}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "2400ms" }}>
        {c.idiomsLabel}
      </div>
      <div className="wb-demo-anim-idiom-row" style={{ animationDelay: "2550ms" }}>
        {d.idioms.map((idiom, i) => (
          <span key={i} className="wb-demo-anim-idiom-pill">{idiom}</span>
        ))}
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "3000ms" }}>
        {c.etymologyLabel}
      </div>
      <div className="wb-demo-anim-origin" style={{ animationDelay: "3150ms" }}>
        <div className="wb-demo-anim-origin-row">
          <span className="wb-demo-anim-origin-label">{c.etyFromLabel}</span>
          <span className="wb-demo-anim-origin-value">{d.etymology.from} · <em>{d.etymology.original}</em></span>
        </div>
        <div className="wb-demo-anim-origin-row">
          <span className="wb-demo-anim-origin-label">{c.etyMeantLabel}</span>
          <span className="wb-demo-anim-origin-value">{d.etymology.meant}</span>
        </div>
      </div>
    </div>
  );
}

function ClearScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-toggle-row" style={{ animationDelay: "200ms" }}>
        <span className="wb-demo-anim-toggle-label">{c.kidsToggle}</span>
        <span className="wb-demo-anim-toggle">
          <span className="wb-demo-anim-toggle-thumb" />
        </span>
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "600ms" }}>
        {c.kidsLabel}
      </div>
      <div className="wb-demo-anim-kids-card" style={{ animationDelay: "750ms" }}>
        {d.kidsExplanation}
      </div>

      <div className="wb-demo-anim-clear-grid">
        {/* Image preview, a gradient swatch as a stand-in for a real
            Gadit-generated illustration. We deliberately do NOT load an
            actual image: the demo card already weighs a lot and a real
            image would hurt LCP on /features. The gradient + sparkle
            reads as "AI imagery" at a glance. */}
        <div className="wb-demo-anim-image-block" style={{ animationDelay: "1300ms" }}>
          <div className="wb-demo-anim-image-frame">
            <div className="wb-demo-anim-image-sparkle">✨</div>
          </div>
          <div className="wb-demo-anim-image-meta">
            <div className="wb-demo-anim-mini-eyebrow">{c.imageLabel}</div>
            <div className="wb-demo-anim-mini-body">{d.imageDescription}</div>
          </div>
        </div>

        <div className="wb-demo-anim-compose" style={{ animationDelay: "1700ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.composeLabel}</div>
          <div className="wb-demo-anim-compose-input">{d.composeSentence}</div>
          <div className="wb-demo-anim-compose-status">{d.composeStatus}</div>
        </div>
      </div>

      <div className="wb-demo-anim-pill-row" style={{ animationDelay: "2300ms" }}>
        <div className="wb-demo-anim-pill is-success">{c.saved}</div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2700ms" }}>
        {c.plusBasic}
      </div>
    </div>
  );
}

function DeepScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      <div className="wb-demo-anim-word" style={{ animationDelay: "0ms" }}>
        {d.word}
      </div>

      <div className="wb-demo-anim-card is-deep" style={{ animationDelay: "200ms" }}>
        <div className="wb-demo-anim-label">{c.quizLabel}</div>
        <div className="wb-demo-anim-body">{d.quizQuestion}</div>
        <div className="wb-demo-anim-quiz-options">
          {d.quizOptions.map((opt, i) => (
            <span
              key={i}
              className={`wb-demo-anim-quiz-opt${i === d.quizCorrect ? " is-correct" : ""}`}
            >
              {opt}
            </span>
          ))}
        </div>
      </div>

      <div className="wb-demo-anim-deep-grid">
        <div className="wb-demo-anim-game-row" style={{ animationDelay: "1300ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.gameLabel}</div>
          <div className="wb-demo-anim-letters">
            {d.anagramLetters.split("").map((ch, i) => (
              <span key={i} className="wb-demo-anim-letter">{ch}</span>
            ))}
          </div>
        </div>

        <div className="wb-demo-anim-compare-row" style={{ animationDelay: "1700ms" }}>
          <div className="wb-demo-anim-mini-eyebrow">{c.compareLabel}</div>
          <div className="wb-demo-anim-compare-words">{d.compareWords}</div>
          <div className="wb-demo-anim-compare-body">{d.compareNote}</div>
        </div>
      </div>

      <div className="wb-demo-anim-fineprint" style={{ animationDelay: "2400ms" }}>
        {c.plusClear}
      </div>
    </div>
  );
}

function PartnerScene({ d, c }: { d: DemoContent; c: DemoContent["l"] }) {
  return (
    <div className="wb-demo-anim-scene">
      {/* Lead with the WHY before the dashboard. The earlier version
          opened straight on "Partner dashboard" which read as "wait,
          why am I looking at this?" to visitors who hadn't even heard
          of the partner program yet. Now the title + body frame it as
          an invitation; the dashboard preview comes after as proof. */}
      <div className="wb-demo-anim-partner-hero" style={{ animationDelay: "0ms" }}>
        <h3 className="wb-demo-anim-partner-hero-title">{d.partnerHeroTitle}</h3>
        <p className="wb-demo-anim-partner-hero-body">{d.partnerHeroBody}</p>
      </div>

      <div className="wb-demo-anim-section-label" style={{ animationDelay: "400ms" }}>
        {c.dashTitle}
      </div>

      <div className="wb-demo-anim-link" style={{ animationDelay: "550ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.linkLabel}</div>
        <div className="wb-demo-anim-link-value">{d.partnerLink}</div>
      </div>

      <div className="wb-demo-anim-stats">
        <div className="wb-demo-anim-stat" style={{ animationDelay: "900ms" }}>
          <div className="wb-demo-anim-stat-label">{c.earningsLabel}</div>
          <div className="wb-demo-anim-stat-value">{d.partnerEarnings}</div>
        </div>
        <div className="wb-demo-anim-stat" style={{ animationDelay: "1200ms" }}>
          <div className="wb-demo-anim-stat-label">{c.subsLabel}</div>
          <div className="wb-demo-anim-stat-value">{d.partnerSubs}</div>
        </div>
      </div>

      <div className="wb-demo-anim-rate" style={{ animationDelay: "1500ms" }}>
        <div className="wb-demo-anim-mini-eyebrow">{c.rateLabel}</div>
        <div className="wb-demo-anim-rate-value">{d.partnerRate}</div>
      </div>

      <div className="wb-demo-anim-status" style={{ animationDelay: "1900ms" }}>
        {d.partnerStatus}
      </div>
    </div>
  );
}
