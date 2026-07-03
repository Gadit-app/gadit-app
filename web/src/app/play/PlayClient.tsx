"use client";

/**
 * /play — Word Games hub.
 *
 * Page states:
 *   1. "loading"   — fetching notebook + hydrating cache
 *   2. "menu"      — 5 game tiles; insufficient-words games are disabled
 *   3. "playing"   — one of the five game components owns the screen
 *
 * Game finish is handled by each game component itself (renders
 * GameResult, which calls back to onExit → returns here to "menu").
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { useHref } from "@/lib/href";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { useKidsMode } from "@/lib/use-kids-mode";
import {
  loadPlayWords,
  hydrateExamples,
  MIN_WORDS_FOR_GAME,
  type GameId,
  type PlayWord,
} from "@/lib/play-engine";
import { getStreak, syncFromServer } from "@/lib/play-streak";
import { GameQuiz, type PlayT } from "@/components/play/GameQuiz";
import { GameFillBlank } from "@/components/play/GameFillBlank";
import { GameMemory } from "@/components/play/GameMemory";
import { GameAnagram } from "@/components/play/GameAnagram";
import { GameSpeed } from "@/components/play/GameSpeed";
import { GameTwinTrap } from "@/components/play/GameTwinTrap";
import { GameTimeTraveler } from "@/components/play/GameTimeTraveler";
import { GameWordPassport } from "@/components/play/GameWordPassport";
import { GameFalseFriends } from "@/components/play/GameFalseFriends";
import { GameRootRush } from "@/components/play/GameRootRush";
import { GameShadeSlider } from "@/components/play/GameShadeSlider";
import { GameBuildAWord } from "@/components/play/GameBuildAWord";
import { GameIdiomDecoder } from "@/components/play/GameIdiomDecoder";
import { GameMeaningLens } from "@/components/play/GameMeaningLens";
import { GameEtymologyArtist } from "@/components/play/GameEtymologyArtist";

const LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "cs", label: "Čeština", flag: "cz" },
  { code: "sk", label: "Slovenčina", flag: "sk" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "hi", label: "हिन्दी", flag: "in" },
] as const;

// Kids Mode banner copy — this card sits at the top of the games menu
// and makes Kids Mode discoverable to parents who otherwise wouldn't
// notice the small toggle in the search bar. Round 1 ships EN + HE
// verbatim; other languages fall back to English until native review.
type KidsBannerCopy = {
  offTitle: string;
  offDesc: string;
  offCTA: string;
  onTitle: string;
  onDesc: string;
  onCTA: string;
  gateTitle: string;
  gateDesc: string;
  gateCTA: string;
};
const KIDS_BANNER_COPY: Record<string, KidsBannerCopy> = {
  he: {
    offTitle: "משחקים עם ילד?",
    offDesc: "הפעל מצב ילדים כדי לראות משחקים ושפה שמתאימים לגילאי 6-12.",
    offCTA: "הפעל מצב ילדים",
    onTitle: "✓ מצב ילדים פועל",
    onDesc: "מציגים כרגע רק את המשחקים המתאימים לילדים.",
    onCTA: "כבה",
    gateTitle: "משחקים עם ילד?",
    gateDesc: "מצב ילדים זמין למנויים בתכניות Clear ו-Deep.",
    gateCTA: "צפה בתכניות",
  },
  en: {
    offTitle: "Playing with a child?",
    offDesc: "Turn on Kids Mode to see games and language tuned for ages 6–12.",
    offCTA: "Turn on Kids Mode",
    onTitle: "✓ Kids Mode is on",
    onDesc: "Showing only the games we picked for younger players.",
    onCTA: "Turn off",
    gateTitle: "Playing with a child?",
    gateDesc: "Kids Mode is available on the Clear and Deep plans.",
    gateCTA: "See plans",
  },
  ar: {
    offTitle: "تلعب مع طفل؟",
    offDesc: "فعّل وضع الأطفال لرؤية ألعاب ولغة مناسبة لأعمار 6-12.",
    offCTA: "فعّل وضع الأطفال",
    onTitle: "✓ وضع الأطفال مفعّل",
    onDesc: "نعرض فقط الألعاب المناسبة للأطفال الأصغر سنًا.",
    onCTA: "إيقاف",
    gateTitle: "تلعب مع طفل؟",
    gateDesc: "وضع الأطفال متاح في خطتي Clear و Deep.",
    gateCTA: "شاهد الخطط",
  },
  ru: {
    offTitle: "Играете с ребёнком?",
    offDesc: "Включите детский режим — увидите игры и язык для возраста 6-12.",
    offCTA: "Включить детский режим",
    onTitle: "✓ Детский режим включён",
    onDesc: "Показываем только игры, подобранные для младших игроков.",
    onCTA: "Выключить",
    gateTitle: "Играете с ребёнком?",
    gateDesc: "Детский режим доступен в тарифах Clear и Deep.",
    gateCTA: "Смотреть тарифы",
  },
  es: {
    offTitle: "¿Juegas con un niño?",
    offDesc: "Activa el modo niños para ver juegos y lenguaje para 6-12 años.",
    offCTA: "Activar modo niños",
    onTitle: "✓ Modo niños activado",
    onDesc: "Mostramos solo los juegos elegidos para los más pequeños.",
    onCTA: "Desactivar",
    gateTitle: "¿Juegas con un niño?",
    gateDesc: "El modo niños está disponible en los planes Clear y Deep.",
    gateCTA: "Ver planes",
  },
  pt: {
    offTitle: "Jogando com uma criança?",
    offDesc: "Ative o modo crianças para ver jogos e linguagem para 6-12 anos.",
    offCTA: "Ativar modo crianças",
    onTitle: "✓ Modo crianças ativado",
    onDesc: "Mostrando apenas os jogos que escolhemos para os mais novos.",
    onCTA: "Desativar",
    gateTitle: "Jogando com uma criança?",
    gateDesc: "O modo crianças está nos planos Clear e Deep.",
    gateCTA: "Ver planos",
  },
  fr: {
    offTitle: "Vous jouez avec un enfant ?",
    offDesc: "Activez le mode enfants pour des jeux et un langage adaptés aux 6-12 ans.",
    offCTA: "Activer le mode enfants",
    onTitle: "✓ Mode enfants activé",
    onDesc: "Nous n'affichons que les jeux choisis pour les plus jeunes.",
    onCTA: "Désactiver",
    gateTitle: "Vous jouez avec un enfant ?",
    gateDesc: "Le mode enfants est disponible dans les formules Clear et Deep.",
    gateCTA: "Voir les formules",
  },
  de: {
    offTitle: "Spielst du mit einem Kind?",
    offDesc: "Aktiviere den Kinder-Modus für Spiele und Sprache für 6- bis 12-Jährige.",
    offCTA: "Kinder-Modus aktivieren",
    onTitle: "✓ Kinder-Modus aktiv",
    onDesc: "Wir zeigen nur die für jüngere Spieler ausgewählten Spiele.",
    onCTA: "Deaktivieren",
    gateTitle: "Spielst du mit einem Kind?",
    gateDesc: "Der Kinder-Modus ist in den Clear- und Deep-Plänen enthalten.",
    gateCTA: "Pläne ansehen",
  },
  cs: {
    offTitle: "Hraješ s dítětem?",
    offDesc: "Zapni Dětský režim — uvidíš hry a jazyk pro věk 6–12.",
    offCTA: "Zapnout Dětský režim",
    onTitle: "✓ Dětský režim je zapnutý",
    onDesc: "Zobrazujeme jen hry vybrané pro mladší hráče.",
    onCTA: "Vypnout",
    gateTitle: "Hraješ s dítětem?",
    gateDesc: "Dětský režim je součástí tarifů Clear a Deep.",
    gateCTA: "Zobrazit tarify",
  },
  sk: {
    offTitle: "Hráš s dieťaťom?",
    offDesc: "Zapni Detský režim — uvidíš hry a jazyk pre vek 6–12.",
    offCTA: "Zapnúť Detský režim",
    onTitle: "✓ Detský režim je zapnutý",
    onDesc: "Zobrazujeme len hry vybrané pre mladších hráčov.",
    onCTA: "Vypnúť",
    gateTitle: "Hráš s dieťaťom?",
    gateDesc: "Detský režim je súčasťou plánov Clear a Deep.",
    gateCTA: "Zobraziť plány",
  },
  hi: {
    offTitle: "बच्चे के साथ खेल रहे हैं?",
    offDesc: "6-12 वर्ष के लिए उपयुक्त गेम और भाषा देखने के लिए Kids Mode चालू करें।",
    offCTA: "Kids Mode चालू करें",
    onTitle: "✓ Kids Mode चालू है",
    onDesc: "छोटे खिलाड़ियों के लिए चुने गए गेम दिखा रहे हैं।",
    onCTA: "बंद करें",
    gateTitle: "बच्चे के साथ खेल रहे हैं?",
    gateDesc: "Kids Mode Clear और Deep प्लान में उपलब्ध है।",
    gateCTA: "प्लान देखें",
  },
};

// Localized strings — kept inline rather than added to i18n-v2 to keep
// the games self-contained and easy to ship. Will be migrated into
// V2Strings if anything else needs them.
const COPY: Record<string, PlayT> = {
  he: {
    menuTitle: "משחקי מילים",
    menuLede: "חיזוק האוצר שלך בכיף · בלי קליקים מיותרים",
    streakOne: "יום אחד ברצף",
    streakMany: (n) => `${n} ימים ברצף`,
    bestEver: (n) => `שיא אישי: ${n}`,
    notEnoughWords: "צריך עוד קצת מילים כדי להתחיל",
    notEnoughHint: "שמור 4 מילים במחברת ונחזור הנה.",
    goNotebook: "פתיחת המחברת",
    comingSoon: "בקרוב",
    quizTitle: "חידון הגדרות",
    quizDesc: "מילה והגדרה, מצא את ההתאמה הנכונה",
    fillblankTitle: "השלם את המשפט",
    fillblankDesc: "המילה החסרה במשפט, מי היא?",
    memoryTitle: "משחק זיכרון",
    memoryDesc: "התאם זוגות של מילה והגדרה",
    anagramTitle: "ערבול אותיות",
    anagramDesc: "סדר את האותיות לפי הרמז",
    speedTitle: "חידון מהיר",
    speedDesc: "כמה מילים תזהה ב-60 שניות?",
    twinTitle: "מלכודת תאומים",
    twinDesc: "effect או affect? lay או lie?",
    twinPrompt: "בחר את המילה המתאימה",
    timeTitle: "מסע בזמן",
    timeDesc: "מה המילה הזו הייתה אומרת פעם?",
    timePrompt: "פעם זו הייתה המשמעות:",
    passportTitle: "דרכון מילים",
    passportDesc: "מאיזו שפה הגיעה המילה?",
    passportPrompt: "מאיפה המילה הזו במקור?",
    friendsTitle: "חברים מזויפים",
    friendsDesc: "מילה אמיתית או מלכודת בין-לשונית?",
    friendsPrompt: "האם המילים האלה אומרות אותו דבר?",
    friendsTrue: "אמיתי",
    friendsFalse: "מלכודת",
    rootTitle: "ציד שורשים",
    rootDesc: "מצא 3 מילים שצמחו מאותו שורש",
    rootPrompt: "השורש הזה ילד שלוש מילים מודרניות",
    rootProgress: (n) => n === 0 ? "מצא 3 מילים" : n === 3 ? "כל השלוש נמצאו!" : `${n}/3 נמצאו`,
    shadeTitle: "סולם עוצמה",
    shadeDesc: "סדר 5 מילים מעדין לעוצמתי",
    shadePrompt: "מהמתון לחזק ביותר. לחץ לפי הסדר.",
    shadeMild: "מתון",
    shadeStrong: "חזק",
    shadeReveal: "הסדר הנכון",
    buildTitle: "בנה מילה",
    buildDesc: "הרכב מילה מקידומת, שורש וסיומת",
    buildPrompt: "בנה את המילה שמתאימה לרמז",
    idiomTitle: "מפענח ניבים",
    idiomDesc: "תיאור מילולי של ניב, מה הוא באמת אומר?",
    idiomPrompt: "אם נקח את הניב מילולית. מה הוא באמת אומר?",
    lensTitle: "עדשת משמעות",
    lensDesc: "אותה מילה, ארבע משמעויות, איזו במשפט?",
    lensPrompt: "באיזו משמעות המילה משמשת כאן?",
    artistTitle: "אמן אטימולוגיה",
    artistDesc: "תרגום מילולי של שורש עתיק. מה המילה המודרנית?",
    artistPrompt: "השורש העתיק הזה נתן לנו איזו מילה מודרנית?",
    catNotebook: "מהמחברת שלך",
    catOrigin: "מקור והיסטוריה",
    catPrecision: "דיוק במילים",
    catStructure: "מבנה ומשמעות",
    exit: "סגירה",
    quizPromptWord: "מה המשמעות של המילה",
    quizPromptMeaning: "איזו מילה מתאימה להגדרה",
    fillblankPrompt: "השלם את המילה החסרה",
    anagramPrompt: "סדר את האותיות",
    anagramHint: "רמז:",
    anagramSubmit: "בדיקה",
    anagramReset: "איפוס",
    speedReady: "מוכן?",
    speedGo: "צא!",
    speedSeconds: (n) => n === 1 ? "מילה אחת!" : `${n} מילים!`,
    memoryFlipPrompt: "התאם כל מילה עם ההגדרה שלה, הפוך 2 קלפים בכל פעם",
    memoryMoves: (n) => n === 1 ? "מהלך אחד" : `${n} מהלכים`,
    resultPerfect: "GAD-ת את זה!",
    resultGreat: "נהדר!",
    resultGood: "יפה.",
    resultKeepGoing: "ממשיכים להתאמן.",
    resultYouMissed: "מילים לחזרה",
    resultPlayAgain: "שחק שוב",
    resultBackToGames: "חזרה למשחקים",
    resultFinalScore: (s) => `${s} נקודות`,
    playNext: "הבא",
    playFinish: "סיום",
  },
  en: {
    menuTitle: "Word Games",
    menuLede: "Sharpen your vocabulary · five quick modes",
    streakOne: "1-day streak",
    streakMany: (n) => `${n}-day streak`,
    bestEver: (n) => `Best: ${n}`,
    notEnoughWords: "You need a few more words first",
    notEnoughHint: "Save 4 words to your notebook and come back.",
    goNotebook: "Open my notebook",
    comingSoon: "Soon",
    quizTitle: "Definition Quiz",
    quizDesc: "Match the word to its meaning",
    fillblankTitle: "Fill the Blank",
    fillblankDesc: "Find the missing word in the sentence",
    memoryTitle: "Memory Match",
    memoryDesc: "Pair every word with its meaning",
    anagramTitle: "Letter Scramble",
    anagramDesc: "Unscramble the word from the hint",
    speedTitle: "Speed Round",
    speedDesc: "How many words can you nail in 60 seconds?",
    twinTitle: "Twin Trap",
    twinDesc: "Effect or affect? Lay or lie?",
    twinPrompt: "Pick the right word",
    timeTitle: "Time Traveler",
    timeDesc: "What did this word USED to mean?",
    timePrompt: "Centuries ago, this word meant:",
    passportTitle: "Word Passport",
    passportDesc: "Guess where the word was born",
    passportPrompt: "Which language did this word come from?",
    friendsTitle: "False Friends",
    friendsDesc: "Real cognate or cross-language trap?",
    friendsPrompt: "Do these two words mean the same thing?",
    friendsTrue: "Real twin",
    friendsFalse: "Trap",
    rootTitle: "Root Rush",
    rootDesc: "Find the 3 words from this ancient root",
    rootPrompt: "This root grew into three modern words. Find them.",
    rootProgress: (n) => n === 0 ? "Find 3 words" : n === 3 ? "All three found!" : `${n}/3 found`,
    shadeTitle: "Shade Slider",
    shadeDesc: "Order 5 words from mildest to strongest",
    shadePrompt: "Tap the cards in order, mildest first.",
    shadeMild: "Mild",
    shadeStrong: "Intense",
    shadeReveal: "Correct order",
    buildTitle: "Build-a-Word",
    buildDesc: "Snap together a word from prefix + root + suffix",
    buildPrompt: "Build the word that matches the clue",
    idiomTitle: "Idiom Decoder",
    idiomDesc: "The literal scene. What does it really mean?",
    idiomPrompt: "If we took this idiom at face value... what does it actually mean?",
    lensTitle: "Meaning Lens",
    lensDesc: "Same word, four meanings. Which one fits?",
    lensPrompt: "Which sense of this word does the sentence use?",
    artistTitle: "Etymology Artist",
    artistDesc: "Literal translation of an ancient root. Modern word?",
    artistPrompt: "Which modern English word grew from this ancient root?",
    catNotebook: "From your notebook",
    catOrigin: "Origin & History",
    catPrecision: "Precision & Confusables",
    catStructure: "Structure & Sense",
    exit: "Close",
    quizPromptWord: "What does this word mean?",
    quizPromptMeaning: "Which word fits this meaning?",
    fillblankPrompt: "Pick the missing word",
    anagramPrompt: "Unscramble the letters",
    anagramHint: "Hint:",
    anagramSubmit: "Check",
    anagramReset: "Reset",
    speedReady: "Get ready",
    speedGo: "Go!",
    speedSeconds: (n) => n === 1 ? "1 word!" : `${n} words!`,
    memoryFlipPrompt: "Match each word with its meaning, flip 2 cards at a time",
    memoryMoves: (n) => n === 1 ? "1 move" : `${n} moves`,
    resultPerfect: "You GADed it!",
    resultGreat: "Great job!",
    resultGood: "Nice work.",
    resultKeepGoing: "Keep practicing.",
    resultYouMissed: "Words to review",
    resultPlayAgain: "Play again",
    resultBackToGames: "Back to games",
    resultFinalScore: (s) => `${s} points`,
    playNext: "Next",
    playFinish: "Finish",
  },
  ar: {
    menuTitle: "ألعاب الكلمات",
    menuLede: "اشحذ مفرداتك · خمسة أوضاع سريعة",
    streakOne: "يوم واحد متواصل",
    streakMany: (n) => `${n} أيام متواصلة`,
    bestEver: (n) => `الأفضل: ${n}`,
    notEnoughWords: "أنت بحاجة لمزيد من الكلمات أولاً",
    notEnoughHint: "احفظ 4 كلمات في دفترك ثم عُد.",
    goNotebook: "افتح دفتري",
    comingSoon: "قريباً",
    quizTitle: "اختبار التعريفات",
    quizDesc: "اختر المعنى الصحيح للكلمة",
    fillblankTitle: "املأ الفراغ",
    fillblankDesc: "اعثر على الكلمة المفقودة في الجملة",
    memoryTitle: "لعبة الذاكرة",
    memoryDesc: "اقرن كل كلمة بمعناها",
    anagramTitle: "ترتيب الحروف",
    anagramDesc: "رتب الحروف من خلال التلميح",
    speedTitle: "الجولة السريعة",
    speedDesc: "كم كلمة تعرف خلال 60 ثانية؟",
    twinTitle: "فخ التوائم",
    twinDesc: "كلمتان متشابهتان — أيهما الصواب؟",
    twinPrompt: "اختر الكلمة المناسبة",
    timeTitle: "السفر عبر الزمن",
    timeDesc: "ماذا كانت هذه الكلمة تعني قبل قرون؟",
    timePrompt: "قبل قرون، كانت هذه الكلمة تعني:",
    passportTitle: "جواز سفر الكلمات",
    passportDesc: "خمن من أي لغة جاءت الكلمة",
    passportPrompt: "من أي لغة جاءت هذه الكلمة؟",
    friendsTitle: "أصدقاء كاذبون",
    friendsDesc: "تطابق حقيقي أم فخ بين اللغات؟",
    friendsPrompt: "هل الكلمتان تعنيان نفس الشيء؟",
    friendsTrue: "توأم حقيقي",
    friendsFalse: "فخ",
    rootTitle: "صيد الجذور",
    rootDesc: "اعثر على ٣ كلمات من جذر واحد",
    rootPrompt: "هذا الجذر أنجب ثلاث كلمات حديثة. اعثر عليها.",
    rootProgress: (n) => n === 0 ? "اعثر على ٣ كلمات" : n === 3 ? "وجدت الثلاثة!" : `${n}/3`,
    shadeTitle: "منزلق الشدة",
    shadeDesc: "رتب ٥ كلمات من اللطيف إلى الأقوى",
    shadePrompt: "اضغط البطاقات بالترتيب من اللطيف",
    shadeMild: "لطيف",
    shadeStrong: "شديد",
    shadeReveal: "الترتيب الصحيح",
    buildTitle: "ابنِ كلمة",
    buildDesc: "ركّب كلمة من بادئة وجذر ولاحقة",
    buildPrompt: "ابنِ الكلمة المطابقة للتلميح",
    idiomTitle: "فك التعابير",
    idiomDesc: "المشهد الحرفي. ما المعنى الحقيقي؟",
    idiomPrompt: "إذا أخذنا التعبير حرفياً، ماذا يعني فعلاً؟",
    lensTitle: "عدسة المعنى",
    lensDesc: "نفس الكلمة، أربع معاني. أيها يناسب؟",
    lensPrompt: "بأي معنى تستخدم الكلمة هنا؟",
    artistTitle: "فنان الاشتقاق",
    artistDesc: "ترجمة حرفية لجذر قديم. الكلمة الحديثة؟",
    artistPrompt: "أي كلمة إنجليزية حديثة نمت من هذا الجذر القديم؟",
    catNotebook: "من دفترك",
    catOrigin: "الأصل والتاريخ",
    catPrecision: "الدقة في الكلمات",
    catStructure: "البنية والمعنى",
    exit: "إغلاق",
    quizPromptWord: "ما معنى هذه الكلمة؟",
    quizPromptMeaning: "أي كلمة تطابق هذا المعنى؟",
    fillblankPrompt: "اختر الكلمة المفقودة",
    anagramPrompt: "رتب الحروف",
    anagramHint: "تلميح:",
    anagramSubmit: "تحقق",
    anagramReset: "إعادة",
    speedReady: "استعد",
    speedGo: "هيا!",
    speedSeconds: (n) => `${n} كلمة!`,
    memoryFlipPrompt: "اربط كل كلمة بمعناها, اقلب بطاقتين في كل مرة",
    memoryMoves: (n) => `${n} حركة`,
    resultPerfect: "مثالي!",
    resultGreat: "أحسنت!",
    resultGood: "عمل جيد.",
    resultKeepGoing: "استمر بالتمرين.",
    resultYouMissed: "كلمات للمراجعة",
    resultPlayAgain: "العب مرة أخرى",
    resultBackToGames: "العودة للألعاب",
    resultFinalScore: (s) => `${s} نقطة`,
    playNext: "التالي",
    playFinish: "إنهاء",
  },
  ru: {
    menuTitle: "Игры со словами",
    menuLede: "Отточи словарный запас · пять быстрых режимов",
    streakOne: "1 день подряд",
    streakMany: (n) => `${n} дней подряд`,
    bestEver: (n) => `Рекорд: ${n}`,
    notEnoughWords: "Сначала нужно больше слов",
    notEnoughHint: "Сохрани 4 слова в тетрадь и возвращайся.",
    goNotebook: "Открыть тетрадь",
    comingSoon: "Скоро",
    quizTitle: "Викторина определений",
    quizDesc: "Подбери слово к значению",
    fillblankTitle: "Заполни пропуск",
    fillblankDesc: "Найди пропущенное слово в предложении",
    memoryTitle: "Игра памяти",
    memoryDesc: "Сопоставь каждое слово с значением",
    anagramTitle: "Анаграмма",
    anagramDesc: "Собери слово по подсказке",
    speedTitle: "Спринт",
    speedDesc: "Сколько слов узнаешь за 60 секунд?",
    twinTitle: "Двойная ловушка",
    twinDesc: "Слова-близнецы — какое верное?",
    twinPrompt: "Выбери правильное слово",
    timeTitle: "Машина времени",
    timeDesc: "Что это слово значило раньше?",
    timePrompt: "Когда-то это слово значило:",
    passportTitle: "Паспорт слова",
    passportDesc: "Угадай язык происхождения слова",
    passportPrompt: "Из какого языка пришло это слово?",
    friendsTitle: "Ложные друзья",
    friendsDesc: "Настоящее родство или языковая ловушка?",
    friendsPrompt: "Эти два слова значат одно и то же?",
    friendsTrue: "Настоящий брат",
    friendsFalse: "Ловушка",
    rootTitle: "Охота за корнями",
    rootDesc: "Найди 3 слова с одним корнем",
    rootPrompt: "От этого корня выросли три современных слова. Найди их.",
    rootProgress: (n) => n === 0 ? "Найди 3 слова" : n === 3 ? "Все три!" : `${n}/3`,
    shadeTitle: "Шкала оттенков",
    shadeDesc: "Расположи 5 слов от слабого к сильному",
    shadePrompt: "Нажимай карточки по порядку, от слабого",
    shadeMild: "Мягко",
    shadeStrong: "Сильно",
    shadeReveal: "Правильный порядок",
    buildTitle: "Собери слово",
    buildDesc: "Собери слово из приставки, корня и суффикса",
    buildPrompt: "Собери слово, подходящее к подсказке",
    idiomTitle: "Декодер идиом",
    idiomDesc: "Буквальная сцена. Что значит на самом деле?",
    idiomPrompt: "Если понимать идиому буквально, что она значит?",
    lensTitle: "Линза смысла",
    lensDesc: "Одно слово, четыре смысла. Какой подходит?",
    lensPrompt: "В каком значении использовано слово здесь?",
    artistTitle: "Этимолог-художник",
    artistDesc: "Буквальный перевод древнего корня. Современное слово?",
    artistPrompt: "Какое современное слово выросло из этого корня?",
    catNotebook: "Из твоего блокнота",
    catOrigin: "Происхождение и история",
    catPrecision: "Точность в словах",
    catStructure: "Структура и смысл",
    exit: "Закрыть",
    quizPromptWord: "Что означает это слово?",
    quizPromptMeaning: "Какое слово подходит?",
    fillblankPrompt: "Выбери пропущенное слово",
    anagramPrompt: "Собери буквы",
    anagramHint: "Подсказка:",
    anagramSubmit: "Проверить",
    anagramReset: "Сброс",
    speedReady: "Готов?",
    speedGo: "Старт!",
    speedSeconds: (n) => `${n} слов!`,
    memoryFlipPrompt: "Сопоставь слово с значением, переворачивай по 2 карты",
    memoryMoves: (n) => `${n} ходов`,
    resultPerfect: "Идеально!",
    resultGreat: "Отлично!",
    resultGood: "Хорошо.",
    resultKeepGoing: "Продолжаем тренировку.",
    resultYouMissed: "Слова для повторения",
    resultPlayAgain: "Ещё раз",
    resultBackToGames: "К играм",
    resultFinalScore: (s) => `${s} очков`,
    playNext: "Далее",
    playFinish: "Готово",
  },
  es: {
    menuTitle: "Juegos de Palabras",
    menuLede: "Afila tu vocabulario · cinco modos rápidos",
    streakOne: "1 día seguido",
    streakMany: (n) => `${n} días seguidos`,
    bestEver: (n) => `Récord: ${n}`,
    notEnoughWords: "Necesitas más palabras primero",
    notEnoughHint: "Guarda 4 palabras en tu cuaderno y vuelve.",
    goNotebook: "Abrir mi cuaderno",
    comingSoon: "Próximamente",
    quizTitle: "Quiz de Definiciones",
    quizDesc: "Empareja la palabra con su significado",
    fillblankTitle: "Completa la Frase",
    fillblankDesc: "Encuentra la palabra que falta",
    memoryTitle: "Memoria",
    memoryDesc: "Empareja cada palabra con su significado",
    anagramTitle: "Anagramas",
    anagramDesc: "Ordena las letras con la pista",
    speedTitle: "Ronda Rápida",
    speedDesc: "¿Cuántas palabras en 60 segundos?",
    twinTitle: "Trampa Gemela",
    twinDesc: "Palabras casi gemelas — ¿cuál es la correcta?",
    twinPrompt: "Elige la palabra correcta",
    timeTitle: "Viajero del Tiempo",
    timeDesc: "¿Qué significaba esta palabra hace siglos?",
    timePrompt: "Hace siglos, esta palabra significaba:",
    passportTitle: "Pasaporte de Palabras",
    passportDesc: "Adivina de qué idioma nació la palabra",
    passportPrompt: "¿De qué idioma viene esta palabra?",
    friendsTitle: "Falsos Amigos",
    friendsDesc: "¿Cognado real o trampa entre lenguas?",
    friendsPrompt: "¿Estas dos palabras significan lo mismo?",
    friendsTrue: "Gemelo real",
    friendsFalse: "Trampa",
    rootTitle: "Caza de Raíces",
    rootDesc: "Encuentra 3 palabras de la misma raíz",
    rootPrompt: "Esta raíz dio tres palabras modernas. Encuéntralas.",
    rootProgress: (n) => n === 0 ? "Encuentra 3" : n === 3 ? "¡Las tres!" : `${n}/3`,
    shadeTitle: "Escala de Intensidad",
    shadeDesc: "Ordena 5 palabras de suave a intensa",
    shadePrompt: "Toca las cartas en orden, de la más suave",
    shadeMild: "Suave",
    shadeStrong: "Intenso",
    shadeReveal: "Orden correcto",
    buildTitle: "Construye una Palabra",
    buildDesc: "Arma una palabra con prefijo, raíz y sufijo",
    buildPrompt: "Construye la palabra que coincide con la pista",
    idiomTitle: "Decodificador de Modismos",
    idiomDesc: "La escena literal. ¿Qué significa de verdad?",
    idiomPrompt: "Si tomamos el modismo al pie de la letra, ¿qué significa?",
    lensTitle: "Lente de Significado",
    lensDesc: "Misma palabra, cuatro sentidos. ¿Cuál encaja?",
    lensPrompt: "¿En qué sentido se usa la palabra aquí?",
    artistTitle: "Artista Etimológico",
    artistDesc: "Traducción literal de una raíz antigua. ¿Palabra moderna?",
    artistPrompt: "¿Qué palabra moderna nació de esta raíz antigua?",
    catNotebook: "De tu cuaderno",
    catOrigin: "Origen e Historia",
    catPrecision: "Precisión y Trampas",
    catStructure: "Estructura y Sentido",
    exit: "Cerrar",
    quizPromptWord: "¿Qué significa esta palabra?",
    quizPromptMeaning: "¿Qué palabra encaja?",
    fillblankPrompt: "Elige la palabra que falta",
    anagramPrompt: "Ordena las letras",
    anagramHint: "Pista:",
    anagramSubmit: "Comprobar",
    anagramReset: "Reiniciar",
    speedReady: "Prepárate",
    speedGo: "¡Ya!",
    speedSeconds: (n) => `¡${n} palabras!`,
    memoryFlipPrompt: "Empareja cada palabra con su significado, voltea 2 cartas",
    memoryMoves: (n) => `${n} movimientos`,
    resultPerfect: "¡Perfecto!",
    resultGreat: "¡Muy bien!",
    resultGood: "Buen trabajo.",
    resultKeepGoing: "Sigue practicando.",
    resultYouMissed: "Palabras para repasar",
    resultPlayAgain: "Jugar de nuevo",
    resultBackToGames: "Volver a juegos",
    resultFinalScore: (s) => `${s} puntos`,
    playNext: "Siguiente",
    playFinish: "Terminar",
  },
  pt: {
    menuTitle: "Jogos de Palavras",
    menuLede: "Afie seu vocabulário · cinco modos rápidos",
    streakOne: "1 dia seguido",
    streakMany: (n) => `${n} dias seguidos`,
    bestEver: (n) => `Recorde: ${n}`,
    notEnoughWords: "Você precisa de mais palavras primeiro",
    notEnoughHint: "Salve 4 palavras no caderno e volte.",
    goNotebook: "Abrir caderno",
    comingSoon: "Em breve",
    quizTitle: "Quiz de Definições",
    quizDesc: "Combine a palavra ao significado",
    fillblankTitle: "Complete a Frase",
    fillblankDesc: "Encontre a palavra que falta",
    memoryTitle: "Memória",
    memoryDesc: "Combine cada palavra ao significado",
    anagramTitle: "Anagramas",
    anagramDesc: "Ordene as letras com a dica",
    speedTitle: "Rodada Rápida",
    speedDesc: "Quantas palavras em 60 segundos?",
    twinTitle: "Armadilha Gêmea",
    twinDesc: "Palavras quase iguais — qual é a certa?",
    twinPrompt: "Escolha a palavra certa",
    timeTitle: "Viajante do Tempo",
    timeDesc: "O que essa palavra significava há séculos?",
    timePrompt: "Há séculos, esta palavra significava:",
    passportTitle: "Passaporte de Palavras",
    passportDesc: "Adivinhe de que idioma nasceu a palavra",
    passportPrompt: "De que idioma veio essa palavra?",
    friendsTitle: "Falsos Amigos",
    friendsDesc: "Cognato real ou armadilha entre línguas?",
    friendsPrompt: "Essas duas palavras significam o mesmo?",
    friendsTrue: "Gêmeo real",
    friendsFalse: "Armadilha",
    rootTitle: "Caça às Raízes",
    rootDesc: "Encontre 3 palavras da mesma raiz",
    rootPrompt: "Esta raiz deu três palavras modernas. Encontre-as.",
    rootProgress: (n) => n === 0 ? "Encontre 3" : n === 3 ? "Todas as três!" : `${n}/3`,
    shadeTitle: "Escala de Intensidade",
    shadeDesc: "Ordene 5 palavras de suave a intensa",
    shadePrompt: "Toque as cartas em ordem, da mais suave",
    shadeMild: "Suave",
    shadeStrong: "Intenso",
    shadeReveal: "Ordem correta",
    buildTitle: "Construa uma Palavra",
    buildDesc: "Monte uma palavra com prefixo, raiz e sufixo",
    buildPrompt: "Construa a palavra que combina com a pista",
    idiomTitle: "Decodificador de Expressões",
    idiomDesc: "A cena literal. O que realmente significa?",
    idiomPrompt: "Se levarmos a expressão ao pé da letra, o que ela quer dizer?",
    lensTitle: "Lente de Significado",
    lensDesc: "Mesma palavra, quatro sentidos. Qual cabe?",
    lensPrompt: "Em que sentido a palavra é usada aqui?",
    artistTitle: "Artista da Etimologia",
    artistDesc: "Tradução literal de uma raiz antiga. Palavra moderna?",
    artistPrompt: "Que palavra moderna nasceu desta raiz antiga?",
    catNotebook: "Do seu caderno",
    catOrigin: "Origem e História",
    catPrecision: "Precisão e Armadilhas",
    catStructure: "Estrutura e Sentido",
    exit: "Fechar",
    quizPromptWord: "O que esta palavra significa?",
    quizPromptMeaning: "Qual palavra encaixa?",
    fillblankPrompt: "Escolha a palavra que falta",
    anagramPrompt: "Ordene as letras",
    anagramHint: "Dica:",
    anagramSubmit: "Conferir",
    anagramReset: "Reiniciar",
    speedReady: "Prepare-se",
    speedGo: "Vai!",
    speedSeconds: (n) => `${n} palavras!`,
    memoryFlipPrompt: "Combine cada palavra ao significado, vire 2 cartas",
    memoryMoves: (n) => `${n} jogadas`,
    resultPerfect: "Perfeito!",
    resultGreat: "Ótimo!",
    resultGood: "Bom trabalho.",
    resultKeepGoing: "Continue praticando.",
    resultYouMissed: "Palavras para revisar",
    resultPlayAgain: "Jogar de novo",
    resultBackToGames: "Voltar aos jogos",
    resultFinalScore: (s) => `${s} pontos`,
    playNext: "Próxima",
    playFinish: "Terminar",
  },
  fr: {
    menuTitle: "Jeux de Mots",
    menuLede: "Affûtez votre vocabulaire · cinq modes rapides",
    streakOne: "1 jour d'affilée",
    streakMany: (n) => `${n} jours d'affilée`,
    bestEver: (n) => `Record : ${n}`,
    notEnoughWords: "Il vous faut d'abord plus de mots",
    notEnoughHint: "Enregistrez 4 mots dans votre carnet et revenez.",
    goNotebook: "Ouvrir mon carnet",
    comingSoon: "Bientôt",
    quizTitle: "Quiz de Définitions",
    quizDesc: "Associez le mot à son sens",
    fillblankTitle: "Complétez la Phrase",
    fillblankDesc: "Trouvez le mot manquant",
    memoryTitle: "Mémoire",
    memoryDesc: "Associez chaque mot à son sens",
    anagramTitle: "Anagrammes",
    anagramDesc: "Remettez les lettres dans l'ordre",
    speedTitle: "Manche Éclair",
    speedDesc: "Combien de mots en 60 secondes ?",
    twinTitle: "Piège Jumeau",
    twinDesc: "Deux mots presque identiques. Lequel ?",
    twinPrompt: "Choisis le bon mot",
    timeTitle: "Voyageur du Temps",
    timeDesc: "Que voulait dire ce mot autrefois ?",
    timePrompt: "Autrefois, ce mot signifiait :",
    passportTitle: "Passeport des Mots",
    passportDesc: "Devine la langue d'origine du mot",
    passportPrompt: "De quelle langue vient ce mot ?",
    friendsTitle: "Faux Amis",
    friendsDesc: "Vrai cognat ou piège entre langues ?",
    friendsPrompt: "Ces deux mots veulent-ils dire la même chose ?",
    friendsTrue: "Vrai jumeau",
    friendsFalse: "Piège",
    rootTitle: "Chasse aux Racines",
    rootDesc: "Trouve 3 mots issus de la même racine",
    rootPrompt: "Cette racine a donné trois mots modernes. Trouve-les.",
    rootProgress: (n) => n === 0 ? "Trouve 3 mots" : n === 3 ? "Les trois !" : `${n}/3`,
    shadeTitle: "Curseur d'Intensité",
    shadeDesc: "Range 5 mots du plus doux au plus intense",
    shadePrompt: "Touche les cartes dans l'ordre, du plus doux",
    shadeMild: "Doux",
    shadeStrong: "Intense",
    shadeReveal: "Bon ordre",
    buildTitle: "Construis un Mot",
    buildDesc: "Assemble un mot avec préfixe, racine et suffixe",
    buildPrompt: "Construis le mot qui correspond à l'indice",
    idiomTitle: "Décodeur d'Expressions",
    idiomDesc: "La scène littérale. Que veut dire l'expression ?",
    idiomPrompt: "Si on prend l'expression au pied de la lettre, que veut-elle dire ?",
    lensTitle: "Lentille de Sens",
    lensDesc: "Même mot, quatre sens. Lequel convient ?",
    lensPrompt: "Dans quel sens le mot est-il utilisé ici ?",
    artistTitle: "Artiste d'Étymologie",
    artistDesc: "Traduction littérale d'une racine ancienne. Mot moderne ?",
    artistPrompt: "Quel mot moderne est né de cette racine ancienne ?",
    catNotebook: "Depuis ton cahier",
    catOrigin: "Origine et Histoire",
    catPrecision: "Précision et Pièges",
    catStructure: "Structure et Sens",
    exit: "Fermer",
    quizPromptWord: "Que signifie ce mot ?",
    quizPromptMeaning: "Quel mot convient ?",
    fillblankPrompt: "Choisissez le mot manquant",
    anagramPrompt: "Remettez les lettres",
    anagramHint: "Indice :",
    anagramSubmit: "Vérifier",
    anagramReset: "Réinitialiser",
    speedReady: "Prêt ?",
    speedGo: "Go !",
    speedSeconds: (n) => `${n} mots !`,
    memoryFlipPrompt: "Associez chaque mot à son sens, retournez 2 cartes",
    memoryMoves: (n) => `${n} coups`,
    resultPerfect: "Parfait !",
    resultGreat: "Excellent !",
    resultGood: "Bien joué.",
    resultKeepGoing: "Continuez à pratiquer.",
    resultYouMissed: "Mots à revoir",
    resultPlayAgain: "Rejouer",
    resultBackToGames: "Retour aux jeux",
    resultFinalScore: (s) => `${s} points`,
    playNext: "Suivant",
    playFinish: "Terminer",
  },
  de: {
    menuTitle: "Wortspiele",
    menuLede: "Schärfe deinen Wortschatz · fünf schnelle Modi",
    streakOne: "1 Tag in Folge",
    streakMany: (n) => `${n} Tage in Folge`,
    bestEver: (n) => `Bestwert: ${n}`,
    notEnoughWords: "Du brauchst erst ein paar Wörter mehr",
    notEnoughHint: "Speichere 4 Wörter im Notizbuch und komm zurück.",
    goNotebook: "Notizbuch öffnen",
    comingSoon: "Bald",
    quizTitle: "Definitions-Quiz",
    quizDesc: "Verbinde Wort mit Bedeutung",
    fillblankTitle: "Lücke füllen",
    fillblankDesc: "Finde das fehlende Wort",
    memoryTitle: "Memory",
    memoryDesc: "Verbinde jedes Wort mit seiner Bedeutung",
    anagramTitle: "Buchstaben-Scramble",
    anagramDesc: "Ordne die Buchstaben mit dem Hinweis",
    speedTitle: "Speed-Runde",
    speedDesc: "Wie viele Wörter in 60 Sekunden?",
    twinTitle: "Zwillingsfalle",
    twinDesc: "Zwei fast gleiche Wörter. Welches ist richtig?",
    twinPrompt: "Wähle das richtige Wort",
    timeTitle: "Zeitreisender",
    timeDesc: "Was bedeutete dieses Wort einst?",
    timePrompt: "Vor Jahrhunderten bedeutete dieses Wort:",
    passportTitle: "Wort-Pass",
    passportDesc: "Errate die Ursprungssprache des Wortes",
    passportPrompt: "Aus welcher Sprache stammt dieses Wort?",
    friendsTitle: "Falsche Freunde",
    friendsDesc: "Echter Verwandter oder Sprachfalle?",
    friendsPrompt: "Bedeuten diese zwei Wörter dasselbe?",
    friendsTrue: "Echter Zwilling",
    friendsFalse: "Falle",
    rootTitle: "Wurzeljagd",
    rootDesc: "Finde 3 Wörter aus derselben Wurzel",
    rootPrompt: "Diese Wurzel gab drei moderne Wörter. Finde sie.",
    rootProgress: (n) => n === 0 ? "Finde 3" : n === 3 ? "Alle drei!" : `${n}/3`,
    shadeTitle: "Intensitätsskala",
    shadeDesc: "Sortiere 5 Wörter von mild zu stark",
    shadePrompt: "Tippe die Karten in der richtigen Reihenfolge",
    shadeMild: "Mild",
    shadeStrong: "Intensiv",
    shadeReveal: "Richtige Reihenfolge",
    buildTitle: "Wort-Baukasten",
    buildDesc: "Setze ein Wort aus Vorsilbe, Stamm und Endung zusammen",
    buildPrompt: "Baue das Wort, das zum Hinweis passt",
    idiomTitle: "Redewendungs-Decoder",
    idiomDesc: "Die wörtliche Szene. Was meint sie wirklich?",
    idiomPrompt: "Wörtlich genommen, was bedeutet die Redewendung wirklich?",
    lensTitle: "Bedeutungslinse",
    lensDesc: "Selbes Wort, vier Bedeutungen. Welche passt?",
    lensPrompt: "In welcher Bedeutung wird das Wort hier benutzt?",
    artistTitle: "Etymologie-Künstler",
    artistDesc: "Wörtliche Übersetzung einer alten Wurzel. Modernes Wort?",
    artistPrompt: "Welches moderne Wort ist aus dieser alten Wurzel gewachsen?",
    catNotebook: "Aus deinem Heft",
    catOrigin: "Ursprung und Geschichte",
    catPrecision: "Präzision und Fallen",
    catStructure: "Struktur und Sinn",
    exit: "Schließen",
    quizPromptWord: "Was bedeutet dieses Wort?",
    quizPromptMeaning: "Welches Wort passt?",
    fillblankPrompt: "Wähle das fehlende Wort",
    anagramPrompt: "Ordne die Buchstaben",
    anagramHint: "Hinweis:",
    anagramSubmit: "Prüfen",
    anagramReset: "Zurücksetzen",
    speedReady: "Bereit?",
    speedGo: "Los!",
    speedSeconds: (n) => `${n} Wörter!`,
    memoryFlipPrompt: "Verbinde Wort mit Bedeutung, dreh 2 Karten",
    memoryMoves: (n) => `${n} Züge`,
    resultPerfect: "Perfekt!",
    resultGreat: "Klasse!",
    resultGood: "Gut gemacht.",
    resultKeepGoing: "Weiter üben.",
    resultYouMissed: "Wörter zum Wiederholen",
    resultPlayAgain: "Nochmal spielen",
    resultBackToGames: "Zurück zu den Spielen",
    resultFinalScore: (s) => `${s} Punkte`,
    playNext: "Weiter",
    playFinish: "Fertig",
  },
  cs: {
    menuTitle: "Slovní hry",
    menuLede: "Vybrus si slovní zásobu · pět rychlých módů",
    streakOne: "1 den v řadě",
    streakMany: (n) => `${n} dní v řadě`,
    bestEver: (n) => `Rekord: ${n}`,
    notEnoughWords: "Nejdřív budeš potřebovat víc slov",
    notEnoughHint: "Ulož si 4 slova do sešitu a vrať se.",
    goNotebook: "Otevřít sešit",
    comingSoon: "Brzy",
    quizTitle: "Kvíz definic",
    quizDesc: "Spoj slovo s jeho významem",
    fillblankTitle: "Doplň větu",
    fillblankDesc: "Najdi chybějící slovo",
    memoryTitle: "Pexeso",
    memoryDesc: "Spáruj každé slovo s významem",
    anagramTitle: "Přesmyčky",
    anagramDesc: "Sestav slovo podle nápovědy",
    speedTitle: "Rychlé kolo",
    speedDesc: "Kolik slov za 60 sekund?",
    twinTitle: "Dvojitá past",
    twinDesc: "Skoro stejná slova. Které je správné?",
    twinPrompt: "Vyber správné slovo",
    timeTitle: "Cestovatel časem",
    timeDesc: "Co to slovo znamenalo před staletími?",
    timePrompt: "Před staletími toto slovo znamenalo:",
    passportTitle: "Pas slov",
    passportDesc: "Uhodni jazyk původu slova",
    passportPrompt: "Z jakého jazyka pochází toto slovo?",
    friendsTitle: "Falešní přátelé",
    friendsDesc: "Skutečný příbuzný nebo jazyková past?",
    friendsPrompt: "Znamenají tato dvě slova totéž?",
    friendsTrue: "Skutečné dvojče",
    friendsFalse: "Past",
    rootTitle: "Hon na kořeny",
    rootDesc: "Najdi 3 slova ze stejného kořene",
    rootPrompt: "Tento kořen dal tři moderní slova. Najdi je.",
    rootProgress: (n) => n === 0 ? "Najdi 3" : n === 3 ? "Všechna tři!" : `${n}/3`,
    shadeTitle: "Stupnice intenzity",
    shadeDesc: "Seřaď 5 slov od mírného po silné",
    shadePrompt: "Klepej na karty v pořadí, od nejmírnějšího",
    shadeMild: "Mírné",
    shadeStrong: "Silné",
    shadeReveal: "Správné pořadí",
    buildTitle: "Postav slovo",
    buildDesc: "Slož slovo z předpony, kořene a přípony",
    buildPrompt: "Postav slovo odpovídající nápovědě",
    idiomTitle: "Dekodér frází",
    idiomDesc: "Doslovná scéna. Co to skutečně znamená?",
    idiomPrompt: "Kdybychom vzali frázi doslova, co skutečně znamená?",
    lensTitle: "Čočka významu",
    lensDesc: "Stejné slovo, čtyři významy. Který sedí?",
    lensPrompt: "V jakém významu je slovo použito zde?",
    artistTitle: "Etymologický umělec",
    artistDesc: "Doslovný překlad starého kořene. Moderní slovo?",
    artistPrompt: "Jaké moderní slovo vyrostlo z tohoto starého kořene?",
    catNotebook: "Z tvého sešitu",
    catOrigin: "Původ a historie",
    catPrecision: "Přesnost a pasti",
    catStructure: "Stavba a význam",
    exit: "Zavřít",
    quizPromptWord: "Co znamená toto slovo?",
    quizPromptMeaning: "Které slovo sedí?",
    fillblankPrompt: "Vyber chybějící slovo",
    anagramPrompt: "Seřaď písmena",
    anagramHint: "Nápověda:",
    anagramSubmit: "Zkontrolovat",
    anagramReset: "Reset",
    speedReady: "Připraven?",
    speedGo: "Start!",
    speedSeconds: (n) => `${n} slov!`,
    memoryFlipPrompt: "Spáruj slovo s významem, otoč 2 karty",
    memoryMoves: (n) => `${n} tahů`,
    resultPerfect: "Dokonalé!",
    resultGreat: "Skvělé!",
    resultGood: "Hezky.",
    resultKeepGoing: "Trénuj dál.",
    resultYouMissed: "Slova k opakování",
    resultPlayAgain: "Hrát znovu",
    resultBackToGames: "Zpět ke hrám",
    resultFinalScore: (s) => `${s} bodů`,
    playNext: "Další",
    playFinish: "Dokončit",
  },
  sk: {
    menuTitle: "Slovné hry",
    menuLede: "Vybrús si slovnú zásobu · päť rýchlych módov",
    streakOne: "1 deň v rade",
    streakMany: (n) => `${n} dní v rade`,
    bestEver: (n) => `Rekord: ${n}`,
    notEnoughWords: "Najprv budeš potrebovať viac slov",
    notEnoughHint: "Ulož si 4 slová do zošita a vráť sa.",
    goNotebook: "Otvoriť zošit",
    comingSoon: "Čoskoro",
    quizTitle: "Kvíz definícií",
    quizDesc: "Spoj slovo s jeho významom",
    fillblankTitle: "Doplň vetu",
    fillblankDesc: "Nájdi chýbajúce slovo",
    memoryTitle: "Pexeso",
    memoryDesc: "Spáruj každé slovo s významom",
    anagramTitle: "Presmyčky",
    anagramDesc: "Zostav slovo podľa pomôcky",
    speedTitle: "Rýchle kolo",
    speedDesc: "Koľko slov za 60 sekúnd?",
    twinTitle: "Dvojitá pasca",
    twinDesc: "Takmer rovnaké slová. Ktoré je správne?",
    twinPrompt: "Vyber správne slovo",
    timeTitle: "Cestovateľ časom",
    timeDesc: "Čo toto slovo znamenalo pred storočiami?",
    timePrompt: "Pred storočiami toto slovo znamenalo:",
    passportTitle: "Pas slov",
    passportDesc: "Uhádni jazyk pôvodu slova",
    passportPrompt: "Z akého jazyka pochádza toto slovo?",
    friendsTitle: "Falošní priatelia",
    friendsDesc: "Skutočný príbuzný alebo jazyková pasca?",
    friendsPrompt: "Znamenajú tieto dve slová to isté?",
    friendsTrue: "Skutočné dvojča",
    friendsFalse: "Pasca",
    rootTitle: "Lov koreňov",
    rootDesc: "Nájdi 3 slová z toho istého koreňa",
    rootPrompt: "Tento koreň dal tri moderné slová. Nájdi ich.",
    rootProgress: (n) => n === 0 ? "Nájdi 3" : n === 3 ? "Všetky tri!" : `${n}/3`,
    shadeTitle: "Stupnica intenzity",
    shadeDesc: "Zoraď 5 slov od jemného po silné",
    shadePrompt: "Klepkaj na karty v poradí, od najjemnejšieho",
    shadeMild: "Jemné",
    shadeStrong: "Silné",
    shadeReveal: "Správne poradie",
    buildTitle: "Postav slovo",
    buildDesc: "Zlož slovo z predpony, koreňa a prípony",
    buildPrompt: "Postav slovo zodpovedajúce nápovede",
    idiomTitle: "Dekodér fráz",
    idiomDesc: "Doslovná scéna. Čo to skutočne znamená?",
    idiomPrompt: "Keby sme vzali frázu doslova, čo skutočne znamená?",
    lensTitle: "Šošovka významu",
    lensDesc: "To isté slovo, štyri významy. Ktorý sedí?",
    lensPrompt: "V akom význame je slovo použité tu?",
    artistTitle: "Etymologický umelec",
    artistDesc: "Doslovný preklad starého koreňa. Moderné slovo?",
    artistPrompt: "Aké moderné slovo vyrástlo z tohto starého koreňa?",
    catNotebook: "Z tvojho zošita",
    catOrigin: "Pôvod a história",
    catPrecision: "Presnosť a pasce",
    catStructure: "Stavba a význam",
    exit: "Zavrieť",
    quizPromptWord: "Čo znamená toto slovo?",
    quizPromptMeaning: "Ktoré slovo sedí?",
    fillblankPrompt: "Vyber chýbajúce slovo",
    anagramPrompt: "Usporiadaj písmená",
    anagramHint: "Pomôcka:",
    anagramSubmit: "Skontrolovať",
    anagramReset: "Reset",
    speedReady: "Pripravený?",
    speedGo: "Štart!",
    speedSeconds: (n) => `${n} slov!`,
    memoryFlipPrompt: "Spáruj slovo s významom, otoč 2 karty",
    memoryMoves: (n) => `${n} ťahov`,
    resultPerfect: "Dokonalé!",
    resultGreat: "Skvelé!",
    resultGood: "Pekne.",
    resultKeepGoing: "Trénuj ďalej.",
    resultYouMissed: "Slová na opakovanie",
    resultPlayAgain: "Hrať znova",
    resultBackToGames: "Späť ku hrám",
    resultFinalScore: (s) => `${s} bodov`,
    playNext: "Ďalej",
    playFinish: "Dokončiť",
  },
  hi: {
    menuTitle: "शब्द खेल",
    menuLede: "अपनी शब्दावली पैनी करें · पाँच तेज़ खेल",
    streakOne: "1 दिन का सिलसिला",
    streakMany: (n) => `${n} दिनों का सिलसिला`,
    bestEver: (n) => `सर्वश्रेष्ठ: ${n}`,
    notEnoughWords: "पहले कुछ और शब्द चाहिए",
    notEnoughHint: "अपनी नोटबुक में 4 शब्द सहेजें और वापस आएँ।",
    goNotebook: "मेरी नोटबुक खोलें",
    comingSoon: "जल्द",
    quizTitle: "परिभाषा क्विज़",
    quizDesc: "शब्द को उसके अर्थ से मिलाएँ",
    fillblankTitle: "ख़ाली भरें",
    fillblankDesc: "वाक्य में लापता शब्द ढूँढें",
    memoryTitle: "मेमोरी मैच",
    memoryDesc: "हर शब्द को उसके अर्थ से जोड़ें",
    anagramTitle: "अक्षर पहेली",
    anagramDesc: "संकेत से शब्द बनाएँ",
    speedTitle: "तेज़ राउंड",
    speedDesc: "60 सेकंड में कितने शब्द?",
    twinTitle: "जुड़वां जाल",
    twinDesc: "लगभग समान शब्द. कौन सा सही है?",
    twinPrompt: "सही शब्द चुनें",
    timeTitle: "समय यात्री",
    timeDesc: "सदियों पहले इस शब्द का क्या मतलब था?",
    timePrompt: "सदियों पहले इस शब्द का मतलब था:",
    passportTitle: "शब्द पासपोर्ट",
    passportDesc: "अनुमान लगाएँ कि शब्द किस भाषा से आया",
    passportPrompt: "यह शब्द किस भाषा से आया है?",
    friendsTitle: "झूठे दोस्त",
    friendsDesc: "सच्चा रिश्ता या भाषाओं के बीच जाल?",
    friendsPrompt: "क्या ये दोनों शब्द एक ही चीज़ कहते हैं?",
    friendsTrue: "सच्चा जुड़वां",
    friendsFalse: "जाल",
    rootTitle: "जड़ शिकार",
    rootDesc: "एक ही जड़ के 3 शब्द ढूंढें",
    rootPrompt: "इस जड़ से तीन आधुनिक शब्द निकले. उन्हें ढूंढें.",
    rootProgress: (n) => n === 0 ? "3 शब्द ढूंढें" : n === 3 ? "तीनों मिले!" : `${n}/3`,
    shadeTitle: "तीव्रता स्लाइडर",
    shadeDesc: "5 शब्दों को हल्के से तीव्र तक क्रम में रखें",
    shadePrompt: "कार्ड्स को क्रम से टैप करें, हल्के से शुरू करें",
    shadeMild: "हल्का",
    shadeStrong: "तीव्र",
    shadeReveal: "सही क्रम",
    buildTitle: "शब्द बनाएँ",
    buildDesc: "उपसर्ग, मूल और प्रत्यय से शब्द बनाएँ",
    buildPrompt: "संकेत से मेल खाता शब्द बनाएँ",
    idiomTitle: "मुहावरा डिकोडर",
    idiomDesc: "शाब्दिक दृश्य. असली मतलब क्या है?",
    idiomPrompt: "अगर मुहावरे को शाब्दिक रूप से लें, तो असली अर्थ क्या है?",
    lensTitle: "अर्थ लेंस",
    lensDesc: "एक ही शब्द, चार अर्थ. कौन फिट है?",
    lensPrompt: "यहाँ शब्द किस अर्थ में प्रयोग हुआ है?",
    artistTitle: "व्युत्पत्ति कलाकार",
    artistDesc: "प्राचीन मूल का शाब्दिक अनुवाद. आधुनिक शब्द?",
    artistPrompt: "इस प्राचीन मूल से कौन सा आधुनिक शब्द निकला?",
    catNotebook: "आपकी नोटबुक से",
    catOrigin: "उत्पत्ति और इतिहास",
    catPrecision: "सटीकता और जाल",
    catStructure: "संरचना और अर्थ",
    exit: "बंद करें",
    quizPromptWord: "इस शब्द का क्या अर्थ है?",
    quizPromptMeaning: "कौन सा शब्द इस अर्थ से मेल खाता है?",
    fillblankPrompt: "लापता शब्द चुनें",
    anagramPrompt: "अक्षर पुनः क्रमित करें",
    anagramHint: "संकेत:",
    anagramSubmit: "जाँचें",
    anagramReset: "रीसेट",
    speedReady: "तैयार",
    speedGo: "शुरू!",
    speedSeconds: (n) => n === 1 ? "1 शब्द!" : `${n} शब्द!`,
    memoryFlipPrompt: "हर शब्द को उसके अर्थ से मिलाएँ, एक बार में 2 कार्ड पलटें",
    memoryMoves: (n) => n === 1 ? "1 चाल" : `${n} चालें`,
    resultPerfect: "आपने इसे GAD कर दिया!",
    resultGreat: "शानदार!",
    resultGood: "बढ़िया।",
    resultKeepGoing: "अभ्यास जारी रखें।",
    resultYouMissed: "दोहराने के लिए शब्द",
    resultPlayAgain: "फिर से खेलें",
    resultBackToGames: "खेलों पर वापस",
    resultFinalScore: (s) => `${s} अंक`,
    playNext: "अगला",
    playFinish: "समाप्त",
  },
};

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlayPage() {
  const { user, plan, loading, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const href = useHref();
  const t = COPY[lang] ?? COPY.en;

  type Stage = { kind: "menu" } | { kind: "playing"; game: GameId };
  const [stage, setStage] = useState<Stage>({ kind: "menu" });
  const [pool, setPool] = useState<PlayWord[] | null>(null);
  const [fetchError, setFetchError] = useState<string>("");
  const [streak, setStreak] = useState(() => getStreak());
  // Kids Mode filters the games menu to only the 9 games we've curated
  // for younger players: the 5 notebook games (auto-adapt from the
  // child's own vocabulary) + Etymology Artist, Idiom Decoder, Meaning
  // Lens, and Twin Trap (which each ship a kid-friendly content pool).
  // The 6 remaining curated games — Time Traveler, Word Passport,
  // False Friends, Root Rush, Shade Slider, Build A Word — are hidden
  // because their content is genuinely too advanced (etymology roots,
  // cross-language cognates, historical meaning shifts). Gadi 2026-06-29.
  const [kidsMode, setKidsMode] = useKidsMode();
  const isPaid = plan === "clear" || plan === "deep";

  // Auth + tier gate — Deep only.
  //
  // The redirect uses explicit "basic" / "clear" checks (not `plan !== "deep"`)
  // because plan can be undefined for a tick after route navigation while
  // the auth context is rehydrating — `!== "deep"` would bounce a Deep
  // user straight to /pricing in that window. Match Notebook's pattern.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      promptLogin(t.menuTitle);
      return;
    }
    if (plan === "basic" || plan === "clear") {
      router.replace(href("/pricing"));
    }
  }, [loading, user, plan, t.menuTitle, promptLogin, router, href]);

  // Load notebook + hydrate from IDB.
  //
  // Two-stage hydration: (1) sync from IDB so the menu can paint with
  // whatever the user has cached locally; (2) async top-up from the
  // Firestore popular-words cache via /api/quick-define so the Fill-blank
  // game eventually unlocks for users whose notebook came from the
  // popular pack. Stage 2 mutates pool when it returns — fill-blank
  // disabled state in the menu flips to enabled with no user action.
  useEffect(() => {
    if (loading || !user) return;
    if (plan === "basic" || plan === "clear") return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const words = await loadPlayWords(idToken, lang);
        if (cancelled) return;
        setPool(words);
        // Stage 2: fill in missing examples from Firestore cache.
        // Read-only, no OpenAI calls. Runs after first paint.
        const hydrated = await hydrateExamples(words);
        if (!cancelled) setPool(hydrated);
      } catch (e) {
        if (!cancelled) setFetchError(String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [loading, user, plan, lang]);

  // Refresh streak when returning to menu (after a game finishes).
  // Local read is synchronous + instant; the Firestore sync runs in
  // the background and updates state again if the cross-device value
  // is higher than what this device has.
  useEffect(() => {
    if (stage.kind !== "menu") return;
    setStreak(getStreak());
    if (user) {
      syncFromServer(user).then(setStreak).catch(() => undefined);
    }
  }, [stage.kind, user]);

  const poolWithExamples = useMemo(
    () => (pool ?? []).filter((p) => p.examples.length > 0).length,
    [pool],
  );

  // Game catalogue — grouped on the menu by category. Order within
  // each category matters: notebook games go first (familiar), then
  // origin/history (the etymology hook), then precision (single-pick
  // multi-choice fast games), then structure (the build/lens/idiom
  // assembly-style games). Each game has a single `category` that
  // drives which section it renders under on the menu.
  type GameCategory = "notebook" | "origin" | "precision" | "structure";
  const games: Array<{
    id: GameId;
    title: string;
    desc: string;
    enabled: boolean;
    icon: React.ReactNode;
    accent: string;
    category: GameCategory;
    /** True if this game has a kid-appropriate content pool AND its
     *  mechanic is understandable to a 6-12 year old. When Kids Mode
     *  is on, the menu shows only these games. */
    kidsFriendly?: boolean;
  }> = [
    {
      id: "quiz",
      title: t.quizTitle,
      desc: t.quizDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.quiz,
      accent: "teal",
      category: "notebook",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
          <path d="M12 17v.01" />
        </svg>
      ),
    },
    {
      id: "fillblank",
      title: t.fillblankTitle,
      desc: t.fillblankDesc,
      enabled: poolWithExamples >= MIN_WORDS_FOR_GAME.fillblank,
      accent: "indigo",
      category: "notebook",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h7" />
          <path d="M4 12h16" />
          <path d="M4 17h11" />
        </svg>
      ),
    },
    {
      id: "memory",
      title: t.memoryTitle,
      desc: t.memoryDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.memory,
      accent: "purple",
      category: "notebook",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "anagram",
      title: t.anagramTitle,
      desc: t.anagramDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.anagram,
      accent: "amber",
      category: "notebook",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h6" />
          <path d="m17 14 4 4-4 4" />
        </svg>
      ),
    },
    {
      id: "speed",
      title: t.speedTitle,
      desc: t.speedDesc,
      enabled: (pool?.length ?? 0) >= MIN_WORDS_FOR_GAME.speed,
      accent: "rose",
      category: "notebook",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      ),
    },
    // ─── Curated-content games (always enabled, no notebook needed) ──
    {
      id: "twin",
      title: t.twinTitle,
      desc: t.twinDesc,
      enabled: true,
      accent: "sky",
      category: "precision",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="12" r="4" />
          <circle cx="16" cy="12" r="4" />
        </svg>
      ),
    },
    {
      id: "time",
      title: t.timeTitle,
      desc: t.timeDesc,
      enabled: true,
      accent: "emerald",
      category: "origin",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
    {
      id: "passport",
      title: t.passportTitle,
      desc: t.passportDesc,
      enabled: true,
      accent: "violet",
      category: "origin",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
      ),
    },
    {
      id: "friends",
      title: t.friendsTitle,
      desc: t.friendsDesc,
      enabled: true,
      accent: "coral",
      category: "precision",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12c2.2 0 4-2 4-4.5S11.2 3 9 3 5 5 5 7.5 6.8 12 9 12Z" />
          <path d="M15 21c2.2 0 4-2 4-4.5S17.2 12 15 12s-4 2-4 4.5S12.8 21 15 21Z" />
        </svg>
      ),
    },
    {
      id: "root",
      title: t.rootTitle,
      desc: t.rootDesc,
      enabled: true,
      accent: "lime",
      category: "origin",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M12 13c-3-2-6-2-9 0" />
          <path d="M12 13c3-2 6-2 9 0" />
          <path d="M12 21c-2-1-4-1-6 0" />
          <path d="M12 21c2-1 4-1 6 0" />
        </svg>
      ),
    },
    {
      id: "shade",
      title: t.shadeTitle,
      desc: t.shadeDesc,
      enabled: true,
      accent: "amber",
      category: "precision",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18" />
          <path d="M5 14l3-4 4 6 4-9 3 7" />
        </svg>
      ),
    },
    {
      id: "build",
      title: t.buildTitle,
      desc: t.buildDesc,
      enabled: true,
      accent: "indigo",
      category: "structure",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="9" width="5" height="6" rx="1.5" />
          <rect x="9.5" y="9" width="5" height="6" rx="1.5" />
          <rect x="16" y="9" width="5" height="6" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "idiom",
      title: t.idiomTitle,
      desc: t.idiomDesc,
      enabled: true,
      accent: "fuchsia",
      category: "structure",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      id: "lens",
      title: t.lensTitle,
      desc: t.lensDesc,
      enabled: true,
      accent: "cyan",
      category: "structure",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      ),
    },
    {
      id: "artist",
      title: t.artistTitle,
      desc: t.artistDesc,
      enabled: true,
      accent: "pink",
      category: "origin",
      kidsFriendly: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6m0 0 3-3m-3 3-3-3" />
          <path d="M5 14a7 7 0 0 0 14 0" />
          <path d="M12 21v-7" />
        </svg>
      ),
    },
  ];

  // ─── Active game stage ─────────────────────────────────────────
  // Curated games (twin, time) don't depend on the notebook pool, so they
  // render even when pool is still null. Notebook games gate on `pool` to
  // avoid passing undefined to their builders.
  if (stage.kind === "playing") {
    const exit = () => setStage({ kind: "menu" });
    const curatedProps = { onExit: exit, lang, t };
    if (stage.game === "twin") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameTwinTrap {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "time") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameTimeTraveler {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "passport") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameWordPassport {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "friends") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameFalseFriends {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "root") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameRootRush {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "shade") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameShadeSlider {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "build") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameBuildAWord {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "idiom") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameIdiomDecoder {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "lens") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameMeaningLens {...curatedProps} />
        </div>
      );
    }
    if (stage.game === "artist") {
      return (
        <div className="wordbook wb-play-page" dir={dir}>
          <GameEtymologyArtist {...curatedProps} />
        </div>
      );
    }
    if (!pool) return null;
    const props = { pool, onExit: exit, lang, t };
    return (
      <div className="wordbook wb-play-page" dir={dir}>
        {stage.game === "quiz" && <GameQuiz {...props} />}
        {stage.game === "fillblank" && <GameFillBlank {...props} />}
        {stage.game === "memory" && <GameMemory {...props} />}
        {stage.game === "anagram" && <GameAnagram {...props} />}
        {stage.game === "speed" && <GameSpeed {...props} />}
      </div>
    );
  }

  // ─── Menu stage ────────────────────────────────────────────────
  return (
    <div className="wordbook wb-shell-page wb-play-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link
            href={href("/")}
            className="wb-shell-navlink wb-shell-navlink-icon"
            aria-label={v2(lang, "navSearch")}
            title={v2(lang, "navSearch")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink">
            {v2(lang, "navFeatures")}
          </Link>
          <Link href={href("/notebook")} className="wb-shell-navlink">
            {v2(lang, "navNotebook")}
          </Link>
          <Link href={href("/play")} className="wb-shell-navlink is-active">
            {v2(lang, "navPlay")}
          </Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">
            {v2(lang, "navPricing")}
          </Link>
          <Link href={href("/affiliates")} className="wb-shell-navlink">
            {v2(lang, "navAffiliates")}
          </Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? <WbUserMenu /> : null}
        </div>
        {/* Mobile identity cluster — 2026-06-19 redesign. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
        </div>
      </header>

      <main className="wb-play-main">
        <div className="wb-play-hero">
          <h1 className="wb-play-title">{t.menuTitle}</h1>
          <p className="wb-play-lede">{t.menuLede}</p>
          {streak.current > 0 && (
            <div className="wb-play-streak">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M13 2c1 3-1 4-1 6 0 2 2 3 2 5 0 3-2 4-2 7 0 1 1 2 1 2s-7-1-7-7c0-2 1-3 1-5 0-3-2-4-2-6 0 0 4 1 5 4 1-2 2-4 3-6Z" />
              </svg>
              <span>
                {streak.current === 1 ? t.streakOne : t.streakMany(streak.current)}
              </span>
              {streak.best > streak.current && (
                <span className="wb-play-streak-best">{t.bestEver(streak.best)}</span>
              )}
            </div>
          )}
        </div>

        {pool === null && !fetchError && (
          <div className="wb-play-loading">…</div>
        )}

        {fetchError && (
          <div className="wb-play-error">{fetchError}</div>
        )}

        {pool && pool.length < 4 && (
          <div className="wb-play-empty">
            <div className="wb-play-empty-title">{t.notEnoughWords}</div>
            <p className="wb-play-empty-hint">{t.notEnoughHint}</p>
            <Link href={href("/notebook")} className="wb-play-empty-cta">
              {t.goNotebook}
            </Link>
          </div>
        )}

        {/* Kids Mode banner — sits above the games sections so a parent
            handing the device to a 6-12 year old sees the toggle
            immediately. Three states: paid user with Kids Mode off
            (invite), paid user with Kids Mode on (confirmation), and
            unpaid user (gentle upsell). Non-signed-in and Basic-plan
            users see the gate state; only Clear/Deep can actually
            switch the mode. Gadi 2026-06-29 tablet audit fix. */}
        {(() => {
          const bannerCopy = KIDS_BANNER_COPY[lang] ?? KIDS_BANNER_COPY.en;
          if (!isPaid) {
            return (
              <div className="wb-play-kids-banner is-gate" dir={dir}>
                <div className="wb-play-kids-banner-icon" aria-hidden="true">🧒</div>
                <div className="wb-play-kids-banner-text">
                  <div className="wb-play-kids-banner-title">{bannerCopy.gateTitle}</div>
                  <div className="wb-play-kids-banner-desc">{bannerCopy.gateDesc}</div>
                </div>
                <Link href={href("/pricing")} className="wb-play-kids-banner-cta">
                  {bannerCopy.gateCTA}
                </Link>
              </div>
            );
          }
          if (kidsMode) {
            return (
              <div className="wb-play-kids-banner is-on" dir={dir}>
                <div className="wb-play-kids-banner-icon" aria-hidden="true">🧒</div>
                <div className="wb-play-kids-banner-text">
                  <div className="wb-play-kids-banner-title">{bannerCopy.onTitle}</div>
                  <div className="wb-play-kids-banner-desc">{bannerCopy.onDesc}</div>
                </div>
                <button
                  type="button"
                  className="wb-play-kids-banner-cta is-ghost"
                  onClick={() => setKidsMode(false)}
                >
                  {bannerCopy.onCTA}
                </button>
              </div>
            );
          }
          return (
            <div className="wb-play-kids-banner" dir={dir}>
              <div className="wb-play-kids-banner-icon" aria-hidden="true">🧒</div>
              <div className="wb-play-kids-banner-text">
                <div className="wb-play-kids-banner-title">{bannerCopy.offTitle}</div>
                <div className="wb-play-kids-banner-desc">{bannerCopy.offDesc}</div>
              </div>
              <button
                type="button"
                className="wb-play-kids-banner-cta"
                onClick={() => {
                  // Defensive second gate: the button is already only
                  // rendered when isPaid, but explicit check inside the
                  // handler blocks any theoretical race between plan
                  // change and click. Audit 2026-07-03.
                  if (!isPaid) return;
                  setKidsMode(true);
                }}
              >
                {bannerCopy.offCTA}
              </button>
            </div>
          );
        })()}

        {/* Games rendered as grouped grids by category. We render each
            category as its own grid so the section heading sits cleanly
            above its games. Notebook games hide entirely when the user
            doesn't have 4+ words; the other three categories are
            curated-content and always show. */}
        {(() => {
          const sections: Array<{ id: GameCategory; label: string }> = [
            { id: "notebook", label: t.catNotebook },
            { id: "origin", label: t.catOrigin },
            { id: "precision", label: t.catPrecision },
            { id: "structure", label: t.catStructure },
          ];
          const hasEnoughForNotebook = (pool?.length ?? 0) >= 4;
          return sections.map((section) => {
            // When Kids Mode is on, filter to games we've curated for
            // younger players. The 5 notebook games always qualify
            // (auto-adapt from the child's own vocabulary); the 4
            // curated games with kids content join them.
            const sectionGames = games.filter(
              (g) => g.category === section.id && (!kidsMode || g.kidsFriendly),
            );
            if (sectionGames.length === 0) return null;
            // Hide the notebook section entirely when the user doesn't
            // have enough words yet — the "not enough words" empty state
            // above already handles that case.
            if (section.id === "notebook" && !hasEnoughForNotebook) return null;
            return (
              <section key={section.id} className="wb-play-section">
                <h2 className="wb-play-section-heading">{section.label}</h2>
                <ul className="wb-play-grid">
                  {sectionGames.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        className={`wb-play-card wb-play-card-${g.accent} ${g.enabled ? "" : "is-disabled"}`}
                        onClick={() => g.enabled && setStage({ kind: "playing", game: g.id })}
                        disabled={!g.enabled}
                      >
                        <span className="wb-play-card-icon">{g.icon}</span>
                        <span className="wb-play-card-text">
                          <span className="wb-play-card-title">{g.title}</span>
                          <span className="wb-play-card-desc">{g.desc}</span>
                        </span>
                        {!g.enabled && (
                          <span className="wb-play-card-locked">{t.comingSoon}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          });
        })()}
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "navPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}
