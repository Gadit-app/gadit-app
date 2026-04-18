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
  pricing: string;
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
  // Homepage sections
  heroHeadline: string;
  heroSubline: string;
  heroSupport: string;
  heroLangs: string;
  demoSectionTitle: string;
  demoWord: string;
  demoDefinition: string;
  demoExample: string;
  demoInsight: string;
  demoInsightLabel: string;
  howItWorksTitle: string;
  howStep1Title: string;
  howStep1Desc: string;
  howStep2Title: string;
  howStep2Desc: string;
  howStep3Title: string;
  howStep3Desc: string;
  howCta: string;
  featuresTitle: string;
  feat1: string;
  feat2: string;
  feat3: string;
  feat4: string;
  feat5: string;
  feat6: string;
  feat7: string;
  feat8: string;
  whoTitle: string;
  who1: string;
  who2: string;
  who3: string;
  who4: string;
  who5: string;
  whyTitle: string;
  whyCopy: string;
  whyBullet1: string;
  whyBullet2: string;
  whyBullet3: string;
  pricingTeaserTitle: string;
  pricingTeaserText: string;
  viewPricing: string;
  finalCtaTitle: string;
  finalCtaText: string;
  startUnderstandingFree: string;
  footerTagline: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  navHowItWorks: string;
  navFeatures: string;
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
    pricing: "Pricing",
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
    heroHeadline: "Understand any word instantly",
    heroSubline: "Gadit explains words simply, clearly, and deeply — in your own language.",
    heroSupport: "Not a dictionary. A way to understand.",
    heroLangs: "Available in English · עברית · العربية · Русский",
    demoSectionTitle: "See how Gadit works",
    demoWord: "ephemeral",
    demoDefinition: "Lasting for only a short time; quickly fading or disappearing.",
    demoExample: "\"The beauty of cherry blossoms is ephemeral — here for a week, then gone.\"",
    demoInsight: "From Greek ephḗmeros — 'lasting only a day' (epi- 'on' + hēmera 'day'). Used in philosophy, art, and poetry to describe the bittersweet nature of things that don't last.",
    demoInsightLabel: "Deeper insight",
    howItWorksTitle: "How it works",
    howStep1Title: "Type any word or sentence",
    howStep1Desc: "Search a single word, or paste a full sentence when context matters.",
    howStep2Title: "Get instant clarity",
    howStep2Desc: "See a simple explanation right away, with examples that make meaning easy to grasp.",
    howStep3Title: "Go deeper if you want",
    howStep3Desc: "Explore all meanings, kid-friendly explanation, etymology, and more.",
    howCta: "Try Gadit now",
    featuresTitle: "What you can do with Gadit",
    feat1: "Multiple meanings, clearly separated",
    feat2: "Real examples in context",
    feat3: "Kid-friendly explanation",
    feat4: "Context understanding",
    feat5: "Word relationships",
    feat6: "Origin & etymology",
    feat7: "Use the word yourself",
    feat8: "Built for daily use",
    whoTitle: "Who Gadit is for",
    who1: "Students",
    who2: "Parents",
    who3: "Teachers",
    who4: "Language learners",
    who5: "Curious minds",
    whyTitle: "Why Gadit feels different",
    whyCopy: "Most tools give you definitions. Gadit helps you understand.",
    whyBullet1: "Not just a definition",
    whyBullet2: "Not just a translation",
    whyBullet3: "Built for understanding",
    pricingTeaserTitle: "Start free. Go deeper from $1.99.",
    pricingTeaserText: "Use Gadit every day for free, then upgrade only if you want unlimited access and deeper tools.",
    viewPricing: "View pricing",
    finalCtaTitle: "Try Gadit for free",
    finalCtaText: "Type a word, paste a sentence, and see how clear language can feel.",
    startUnderstandingFree: "Start understanding",
    footerTagline: "Gadit — Every word, understood.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact",
    navHowItWorks: "How it works",
    navFeatures: "Features",
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
    pricing: "תמחור",
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
    heroHeadline: "הבן כל מילה מיד",
    heroSubline: "Gadit מסביר מילים בפשטות, בבהירות ובעומק — בשפה שלך.",
    heroSupport: "לא מילון. דרך להבין.",
    heroLangs: "זמין בעברית · English · العربية · Русский",
    demoSectionTitle: "ראה איך Gadit עובד",
    demoWord: "ephemeral",
    demoDefinition: "דבר שנמשך זמן קצר בלבד; שנעלם מהר.",
    demoExample: "\"יופי פרחי הדובדבן הוא ephemeral — כאן שבוע, ואז נעלם.\"",
    demoInsight: "מהיוונית ephḗmeros — 'שנמשך יום אחד בלבד'. משמש בפילוסופיה, אמנות ושירה לתאר את הטבע המר-מתוק של דברים שאינם מתמידים.",
    demoInsightLabel: "תובנה מעמיקה",
    howItWorksTitle: "איך זה עובד",
    howStep1Title: "הקלד כל מילה או משפט",
    howStep1Desc: "חפש מילה בודדת, או הדבק משפט שלם כשההקשר חשוב.",
    howStep2Title: "קבל בהירות מיידית",
    howStep2Desc: "ראה הסבר פשוט מיד, עם דוגמאות שמקלות על ההבנה.",
    howStep3Title: "העמק אם תרצה",
    howStep3Desc: "חקור את כל המשמעויות, הסבר לילדים, אטימולוגיה, ועוד.",
    howCta: "נסה את Gadit עכשיו",
    featuresTitle: "מה אפשר לעשות עם Gadit",
    feat1: "משמעויות מרובות, מופרדות בבהירות",
    feat2: "דוגמאות אמיתיות בהקשר",
    feat3: "הסבר ידידותי לילדים",
    feat4: "הבנת הקשר",
    feat5: "קשרים בין מילים",
    feat6: "מקור ואטימולוגיה",
    feat7: "השתמש במילה בעצמך",
    feat8: "בנוי לשימוש יומיומי",
    whoTitle: "למי Gadit מתאים",
    who1: "תלמידים",
    who2: "הורים",
    who3: "מורים",
    who4: "לומדי שפות",
    who5: "נפשות סקרניות",
    whyTitle: "למה Gadit מרגיש שונה",
    whyCopy: "רוב הכלים נותנים לך הגדרות. Gadit עוזר לך להבין.",
    whyBullet1: "לא רק הגדרה",
    whyBullet2: "לא רק תרגום",
    whyBullet3: "בנוי להבנה",
    pricingTeaserTitle: "התחל בחינם. העמק מ-$1.99.",
    pricingTeaserText: "השתמש ב-Gadit כל יום בחינם, ושדרג רק אם תרצה גישה ללא הגבלה וכלים מעמיקים.",
    viewPricing: "ראה תמחור",
    finalCtaTitle: "נסה את Gadit בחינם",
    finalCtaText: "הקלד מילה, הדבק משפט, וראה כמה ברורה יכולה להיות השפה.",
    startUnderstandingFree: "התחל להבין",
    footerTagline: "Gadit — כל מילה, מובנת.",
    footerPrivacy: "מדיניות פרטיות",
    footerTerms: "תנאי שימוש",
    footerContact: "צור קשר",
    navHowItWorks: "איך זה עובד",
    navFeatures: "פיצ'רים",
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
    pricing: "الأسعار",
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
    heroHeadline: "افهم أي كلمة على الفور",
    heroSubline: "Gadit يشرح الكلمات ببساطة ووضوح وعمق — بلغتك.",
    heroSupport: "ليس قاموساً. طريقة للفهم.",
    heroLangs: "متاح بـ العربية · English · עברית · Русский",
    demoSectionTitle: "اكتشف كيف يعمل Gadit",
    demoWord: "ephemeral",
    demoDefinition: "شيء يدوم وقتاً قصيراً فقط؛ يتلاشى بسرعة.",
    demoExample: "\"جمال أزهار الكرز ephemeral — هنا لأسبوع ثم يختفي.\"",
    demoInsight: "من اليونانية ephḗmeros — 'يدوم يوماً واحداً فقط'. يُستخدم في الفلسفة والفن والشعر لوصف الطبيعة المُرّة-الحلوة للأشياء العابرة.",
    demoInsightLabel: "رؤية أعمق",
    howItWorksTitle: "كيف يعمل",
    howStep1Title: "اكتب أي كلمة أو جملة",
    howStep1Desc: "ابحث عن كلمة واحدة، أو الصق جملة كاملة عندما يهم السياق.",
    howStep2Title: "احصل على وضوح فوري",
    howStep2Desc: "اطلع على شرح بسيط فوراً، مع أمثلة تسهّل فهم المعنى.",
    howStep3Title: "تعمق إذا أردت",
    howStep3Desc: "استكشف جميع المعاني، وشرح للأطفال، وأصل الكلمة، والمزيد.",
    howCta: "جرب Gadit الآن",
    featuresTitle: "ما يمكنك فعله مع Gadit",
    feat1: "معاني متعددة، مفصولة بوضوح",
    feat2: "أمثلة حقيقية في السياق",
    feat3: "شرح ودود للأطفال",
    feat4: "فهم السياق",
    feat5: "العلاقات بين الكلمات",
    feat6: "الأصل والاشتقاق",
    feat7: "استخدم الكلمة بنفسك",
    feat8: "مبني للاستخدام اليومي",
    whoTitle: "لمن Gadit مناسب",
    who1: "الطلاب",
    who2: "الآباء",
    who3: "المعلمون",
    who4: "متعلمو اللغات",
    who5: "العقول الفضولية",
    whyTitle: "لماذا Gadit يشعر بالاختلاف",
    whyCopy: "معظم الأدوات تعطيك تعريفات. Gadit يساعدك على الفهم.",
    whyBullet1: "ليس مجرد تعريف",
    whyBullet2: "ليس مجرد ترجمة",
    whyBullet3: "مبني للفهم",
    pricingTeaserTitle: "ابدأ مجاناً. تعمق من 1.99$.",
    pricingTeaserText: "استخدم Gadit يومياً مجاناً، ثم قم بالترقية فقط إذا أردت وصولاً غير محدود وأدوات أعمق.",
    viewPricing: "عرض الأسعار",
    finalCtaTitle: "جرب Gadit مجاناً",
    finalCtaText: "اكتب كلمة، الصق جملة، واكتشف كم يمكن أن تكون اللغة واضحة.",
    startUnderstandingFree: "ابدأ الفهم",
    footerTagline: "Gadit — كل كلمة، مفهومة.",
    footerPrivacy: "سياسة الخصوصية",
    footerTerms: "شروط الاستخدام",
    footerContact: "اتصل بنا",
    navHowItWorks: "كيف يعمل",
    navFeatures: "المميزات",
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
    pricing: "Цены",
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
    heroHeadline: "Понимай любое слово мгновенно",
    heroSubline: "Gadit объясняет слова просто, ясно и глубоко — на твоём языке.",
    heroSupport: "Не словарь. Способ понять.",
    heroLangs: "Доступно на Русский · English · עברית · العربية",
    demoSectionTitle: "Посмотри как работает Gadit",
    demoWord: "ephemeral",
    demoDefinition: "То, что длится очень недолго; быстро исчезающее.",
    demoExample: "«Красота цветущей сакуры ephemeral — здесь неделю, потом исчезает.»",
    demoInsight: "От греческого ephḗmeros — «длящийся один день». Используется в философии, искусстве и поэзии для описания горько-сладкой природы вещей, которые не длятся.",
    demoInsightLabel: "Более глубокое понимание",
    howItWorksTitle: "Как это работает",
    howStep1Title: "Введи любое слово или предложение",
    howStep1Desc: "Ищи одно слово или вставь целое предложение, когда важен контекст.",
    howStep2Title: "Получи мгновенную ясность",
    howStep2Desc: "Сразу увидишь простое объяснение с примерами, которые помогают понять смысл.",
    howStep3Title: "Углубись если хочешь",
    howStep3Desc: "Изучи все значения, объяснение для детей, этимологию и многое другое.",
    howCta: "Попробуй Gadit сейчас",
    featuresTitle: "Что ты можешь делать с Gadit",
    feat1: "Несколько значений, чётко разделённых",
    feat2: "Реальные примеры в контексте",
    feat3: "Объяснение для детей",
    feat4: "Понимание контекста",
    feat5: "Связи между словами",
    feat6: "Происхождение и этимология",
    feat7: "Используй слово сам",
    feat8: "Создан для ежедневного использования",
    whoTitle: "Для кого Gadit",
    who1: "Студенты",
    who2: "Родители",
    who3: "Учителя",
    who4: "Изучающие языки",
    who5: "Любопытные умы",
    whyTitle: "Почему Gadit ощущается иначе",
    whyCopy: "Большинство инструментов дают определения. Gadit помогает понять.",
    whyBullet1: "Не просто определение",
    whyBullet2: "Не просто перевод",
    whyBullet3: "Создан для понимания",
    pricingTeaserTitle: "Начни бесплатно. Углубляйся от $1.99.",
    pricingTeaserText: "Используй Gadit каждый день бесплатно, затем обновись если хочешь безлимитный доступ и более глубокие инструменты.",
    viewPricing: "Посмотреть тарифы",
    finalCtaTitle: "Попробуй Gadit бесплатно",
    finalCtaText: "Введи слово, вставь предложение и почувствуй насколько ясным может быть язык.",
    startUnderstandingFree: "Начать понимать",
    footerTagline: "Gadit — Каждое слово понято.",
    footerPrivacy: "Политика конфиденциальности",
    footerTerms: "Условия использования",
    footerContact: "Контакты",
    navHowItWorks: "Как это работает",
    navFeatures: "Функции",
  },
};
