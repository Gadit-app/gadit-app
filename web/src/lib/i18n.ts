export type Lang = "en" | "he" | "ar" | "ru";

export const LANGUAGES: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "he", label: "עברית", dir: "rtl" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "ru", label: "Русский", dir: "ltr" },
];

export function getLangDir(lang: Lang) {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  if (lang === "he" || lang === "iw") return "he";
  if (lang === "ar") return "ar";
  if (lang === "ru") return "ru";
  return "en";
}

export const T: Record<Lang, {
  // Home
  tagline: string;
  slogan: string;
  placeholder: string[];
  explainBtn: string;
  tryLabel: string;
  notJust: string;
  // Result UI
  understandMore: string;
  goDeeper: string;
  moreExamples: string;
  forKids: string;
  opposite: string;
  confusable: string;
  register: string;
  frequency: string;
  wordFamily: string;
  origin: string;
  useThisWord: string;
  makeItYours: string;
  sentencePlaceholder: string;
  checkBtn: string;
  checking: string;
  searchAnother: string;
  perfect: string;
  almost: string;
  notQuite: string;
  wordMastered: string;
  // Auth
  login: string;
  logout: string;
  welcomeBack: string;
  createAccount: string;
  continueWithGoogle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  noAccount: string;
  haveAccount: string;
  signUp: string;
  logIn: string;
  // Pricing
  pricingHeadline: string;
  pricingSubline: string;
  monthly: string;
  yearly: string;
  yearlyBadge: string;
  billedYearly: string;
  mostPopular: string;
  mostPeopleChoose: string;
  cancelAnytime: string;
  startFree: string;
  startUnderstanding: string;
  startUnderstandingFully: string;
  unlockDeep: string;
  // Plan descriptions
  basicDesc: string;
  clearDesc: string;
  deepDesc: string;
  // Features
  searchesPerDay: string;
  fullDefinition: string;
  examples: string;
  forKidsFeature: string;
  basicEtymology: string;
  allLanguages: string;
  unlimitedSearches: string;
  allBasicFeatures: string;
  oppositeConfusable: string;
  registerFrequency: string;
  wordFamilyFeature: string;
  historyFavorites: string;
  quizMode: string;
  useThisWordFeature: string;
  aiImages: string;
  wordCollections: string;
  wordOfDay: string;
  advancedInsights: string;
  everythingInClear: string;
}> = {
  en: {
    tagline: "Every word, understood.",
    slogan: 'Not <em>just</em> a dictionary. A way to understand.',
    placeholder: ['Type a word or sentence…', 'Try "שלום"', 'Try "banco"', 'Try "amor"', 'Try "bank"', 'Try "مرحبا"'],
    explainBtn: "Explain",
    tryLabel: "Try:",
    notJust: "Not <em>just</em> a dictionary. A way to understand.",
    understandMore: "Understand more ↓",
    goDeeper: "Go deeper ↓",
    moreExamples: "More examples",
    forKids: "Explain like I'm 10",
    opposite: "Opposite",
    confusable: "Don't confuse with",
    register: "Register",
    frequency: "Frequency",
    wordFamily: "Word family",
    origin: "Origin",
    useThisWord: "✍️ Use this word",
    makeItYours: "Make it yours",
    sentencePlaceholder: 'Use "{word}" in your own sentence',
    checkBtn: "Check my sentence",
    checking: "Checking…",
    searchAnother: "← Search another word",
    perfect: "Perfect",
    almost: "Almost",
    notQuite: "Not quite",
    wordMastered: "Word mastered ✓",
    login: "Log in",
    logout: "Log out",
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    continueWithGoogle: "Continue with Google",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    noAccount: "No account?",
    haveAccount: "Already have one?",
    signUp: "Sign up",
    logIn: "Log in",
    pricingHeadline: "Understand any word.\nChoose how deep you go.",
    pricingSubline: "Understand for free. Go deeper when you're ready.",
    monthly: "Monthly",
    yearly: "Yearly",
    yearlyBadge: "Save 33% — 2 months free",
    billedYearly: "Billed",
    mostPopular: "Most popular",
    mostPeopleChoose: "Most people choose this",
    cancelAnytime: "Cancel anytime. No hidden fees. Secure payments by Stripe.",
    startFree: "Start free",
    startUnderstanding: "Start understanding",
    startUnderstandingFully: "Start understanding fully",
    unlockDeep: "Unlock Deep",
    basicDesc: "Start understanding words for free",
    clearDesc: "Everything you need to fully understand any word",
    deepDesc: "Go beyond understanding — into mastery",
    searchesPerDay: "20 searches per day",
    fullDefinition: "Full definition",
    examples: "Examples",
    forKidsFeature: "For Kids explanation",
    basicEtymology: "Basic etymology",
    allLanguages: "All 10 languages",
    unlimitedSearches: "Unlimited searches",
    allBasicFeatures: "All Basic features",
    oppositeConfusable: "Opposite & Confusable",
    registerFrequency: "Register & Frequency",
    wordFamilyFeature: "Word family",
    historyFavorites: "History & Favorites",
    quizMode: "Quiz mode",
    useThisWordFeature: "Use this word + AI feedback",
    aiImages: "AI word images",
    wordCollections: "Word collections",
    wordOfDay: "Word of the Day (personal)",
    advancedInsights: "Advanced insights",
    everythingInClear: "Everything in Clear",
  },
  he: {
    tagline: "כל מילה, מובנת.",
    slogan: "לא <em>רק</em> מילון. דרך להבין.",
    placeholder: ['הקלד מילה או משפט…', 'נסה "set"', 'נסה "banco"', 'נסה "ephemeral"', 'נסה "bank"', 'נסה "مرحبا"'],
    explainBtn: "הסבר",
    tryLabel: "נסה:",
    notJust: "לא <em>רק</em> מילון. דרך להבין.",
    understandMore: "הבן יותר ↓",
    goDeeper: "העמק ↓",
    moreExamples: "עוד דוגמאות",
    forKids: "הסבר לילדים",
    opposite: "הפך",
    confusable: "לא להתבלבל עם",
    register: "רישום",
    frequency: "תדירות",
    wordFamily: "משפחת המילה",
    origin: "מקור המילה",
    useThisWord: "✍️ השתמש במילה",
    makeItYours: "תעשה את זה שלך",
    sentencePlaceholder: 'השתמש ב"{word}" במשפט משלך',
    checkBtn: "בדוק את המשפט שלי",
    checking: "בודק…",
    searchAnother: "חפש מילה אחרת →",
    perfect: "מושלם",
    almost: "כמעט",
    notQuite: "לא מדויק",
    wordMastered: "המילה נרכשה ✓",
    login: "התחבר",
    logout: "התנתק",
    welcomeBack: "ברוך שובך",
    createAccount: "צור חשבון",
    continueWithGoogle: "המשך עם Google",
    emailPlaceholder: "אימייל",
    passwordPlaceholder: "סיסמה",
    noAccount: "אין חשבון?",
    haveAccount: "יש לך חשבון?",
    signUp: "הירשם",
    logIn: "התחבר",
    pricingHeadline: "הבן כל מילה.\nבחר עד כמה עמוק.",
    pricingSubline: "התחל בחינם. תעמיק כשתהיה מוכן.",
    monthly: "חודשי",
    yearly: "שנתי",
    yearlyBadge: "חסוך 33% — 2 חודשים חינם",
    billedYearly: "מחויב",
    mostPopular: "הכי פופולרי",
    mostPeopleChoose: "רוב האנשים בוחרים בזה",
    cancelAnytime: "ביטול בכל עת. ללא עמלות נסתרות. תשלום מאובטח דרך Stripe.",
    startFree: "התחל בחינם",
    startUnderstanding: "התחל להבין",
    startUnderstandingFully: "התחל להבין לגמרי",
    unlockDeep: "פתח Deep",
    basicDesc: "התחל להבין מילים בחינם",
    clearDesc: "כל מה שצריך כדי להבין כל מילה לגמרי",
    deepDesc: "מעבר להבנה — לשליטה מלאה",
    searchesPerDay: "20 חיפושים ביום",
    fullDefinition: "הגדרה מלאה",
    examples: "דוגמאות",
    forKidsFeature: "הסבר לילדים",
    basicEtymology: "אטימולוגיה בסיסית",
    allLanguages: "כל 10 השפות",
    unlimitedSearches: "חיפושים ללא הגבלה",
    allBasicFeatures: "כל פיצ'רי Basic",
    oppositeConfusable: "הפך ומילים מבלבלות",
    registerFrequency: "רישום ותדירות",
    wordFamilyFeature: "משפחת המילה",
    historyFavorites: "היסטוריה ומועדפים",
    quizMode: "מצב חידון",
    useThisWordFeature: "השתמש במילה + פידבק AI",
    aiImages: "תמונות AI למילה",
    wordCollections: "אוספי מילים",
    wordOfDay: "מילת היום (אישית)",
    advancedInsights: "תובנות מתקדמות",
    everythingInClear: "כל מה שיש ב-Clear",
  },
  ar: {
    tagline: "كل كلمة، مفهومة.",
    slogan: "ليس <em>مجرد</em> قاموس. طريقة للفهم.",
    placeholder: ['اكتب كلمة أو جملة…', 'جرب "set"', 'جرب "banco"', 'جرب "שלום"', 'جرب "bank"', 'جرب "ephemeral"'],
    explainBtn: "اشرح",
    tryLabel: "جرب:",
    notJust: "ليس <em>مجرد</em> قاموس. طريقة للفهم.",
    understandMore: "↓ فهم أكثر",
    goDeeper: "↓ تعمق أكثر",
    moreExamples: "مزيد من الأمثلة",
    forKids: "شرح للأطفال",
    opposite: "المعاكس",
    confusable: "لا تخلط مع",
    register: "المستوى اللغوي",
    frequency: "التكرار",
    wordFamily: "عائلة الكلمة",
    origin: "أصل الكلمة",
    useThisWord: "✍️ استخدم هذه الكلمة",
    makeItYours: "اجعلها لك",
    sentencePlaceholder: 'استخدم "{word}" في جملتك الخاصة',
    checkBtn: "تحقق من جملتي",
    checking: "جارٍ التحقق…",
    searchAnother: "ابحث عن كلمة أخرى →",
    perfect: "ممتاز",
    almost: "تقريباً",
    notQuite: "ليس تماماً",
    wordMastered: "تم إتقان الكلمة ✓",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    welcomeBack: "مرحباً بعودتك",
    createAccount: "إنشاء حساب",
    continueWithGoogle: "المتابعة مع Google",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    signUp: "إنشاء حساب",
    logIn: "تسجيل الدخول",
    pricingHeadline: "افهم أي كلمة.\naختر مدى العمق.",
    pricingSubline: "ابدأ مجاناً. تعمق عندما تكون مستعداً.",
    monthly: "شهري",
    yearly: "سنوي",
    yearlyBadge: "وفر 33% — شهران مجاناً",
    billedYearly: "يُفوتر",
    mostPopular: "الأكثر شعبية",
    mostPeopleChoose: "معظم الناس يختارون هذا",
    cancelAnytime: "إلغاء في أي وقت. بدون رسوم خفية. دفع آمن عبر Stripe.",
    startFree: "ابدأ مجاناً",
    startUnderstanding: "ابدأ الفهم",
    startUnderstandingFully: "ابدأ الفهم الكامل",
    unlockDeep: "افتح Deep",
    basicDesc: "ابدأ فهم الكلمات مجاناً",
    clearDesc: "كل ما تحتاجه لفهم أي كلمة بالكامل",
    deepDesc: "تجاوز الفهم — نحو الإتقان",
    searchesPerDay: "20 بحثاً يومياً",
    fullDefinition: "تعريف كامل",
    examples: "أمثلة",
    forKidsFeature: "شرح للأطفال",
    basicEtymology: "أصل الكلمة الأساسي",
    allLanguages: "جميع اللغات العشر",
    unlimitedSearches: "بحث غير محدود",
    allBasicFeatures: "جميع مميزات Basic",
    oppositeConfusable: "المعاكس والكلمات المشابهة",
    registerFrequency: "المستوى والتكرار",
    wordFamilyFeature: "عائلة الكلمة",
    historyFavorites: "السجل والمفضلة",
    quizMode: "وضع الاختبار",
    useThisWordFeature: "استخدم الكلمة + تغذية راجعة AI",
    aiImages: "صور AI للكلمة",
    wordCollections: "مجموعات الكلمات",
    wordOfDay: "كلمة اليوم (شخصية)",
    advancedInsights: "رؤى متقدمة",
    everythingInClear: "كل شيء في Clear",
  },
  ru: {
    tagline: "Каждое слово — понято.",
    slogan: "Не <em>просто</em> словарь. Способ понять.",
    placeholder: ['Введите слово или предложение…', 'Попробуй "שלום"', 'Попробуй "banco"', 'Попробуй "amor"', 'Попробуй "bank"', 'Попробуй "مرحبا"'],
    explainBtn: "Объяснить",
    tryLabel: "Попробуй:",
    notJust: "Не <em>просто</em> словарь. Способ понять.",
    understandMore: "Подробнее ↓",
    goDeeper: "Глубже ↓",
    moreExamples: "Ещё примеры",
    forKids: "Объясни как ребёнку",
    opposite: "Антоним",
    confusable: "Не путать с",
    register: "Регистр",
    frequency: "Частотность",
    wordFamily: "Семья слов",
    origin: "Происхождение",
    useThisWord: "✍️ Используй это слово",
    makeItYours: "Сделай своим",
    sentencePlaceholder: 'Используй "{word}" в своём предложении',
    checkBtn: "Проверить моё предложение",
    checking: "Проверяем…",
    searchAnother: "← Найти другое слово",
    perfect: "Отлично",
    almost: "Почти",
    notQuite: "Не совсем",
    wordMastered: "Слово усвоено ✓",
    login: "Войти",
    logout: "Выйти",
    welcomeBack: "С возвращением",
    createAccount: "Создать аккаунт",
    continueWithGoogle: "Продолжить с Google",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Пароль",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    signUp: "Зарегистрироваться",
    logIn: "Войти",
    pricingHeadline: "Понимай любое слово.\nВыбери глубину.",
    pricingSubline: "Начни бесплатно. Углубляйся когда будешь готов.",
    monthly: "Ежемесячно",
    yearly: "Ежегодно",
    yearlyBadge: "Скидка 33% — 2 месяца бесплатно",
    billedYearly: "Оплата",
    mostPopular: "Самый популярный",
    mostPeopleChoose: "Большинство выбирают это",
    cancelAnytime: "Отмена в любое время. Без скрытых платежей. Безопасная оплата через Stripe.",
    startFree: "Начать бесплатно",
    startUnderstanding: "Начать понимать",
    startUnderstandingFully: "Понимать полностью",
    unlockDeep: "Открыть Deep",
    basicDesc: "Начни понимать слова бесплатно",
    clearDesc: "Всё что нужно для полного понимания любого слова",
    deepDesc: "За пределами понимания — к мастерству",
    searchesPerDay: "20 поисков в день",
    fullDefinition: "Полное определение",
    examples: "Примеры",
    forKidsFeature: "Объяснение для детей",
    basicEtymology: "Базовая этимология",
    allLanguages: "Все 10 языков",
    unlimitedSearches: "Безлимитный поиск",
    allBasicFeatures: "Все функции Basic",
    oppositeConfusable: "Антонимы и похожие слова",
    registerFrequency: "Регистр и частотность",
    wordFamilyFeature: "Семья слов",
    historyFavorites: "История и избранное",
    quizMode: "Режим викторины",
    useThisWordFeature: "Используй слово + обратная связь AI",
    aiImages: "AI-изображения слова",
    wordCollections: "Коллекции слов",
    wordOfDay: "Слово дня (персональное)",
    advancedInsights: "Расширенный анализ",
    everythingInClear: "Всё из Clear",
  },
};
