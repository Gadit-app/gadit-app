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
  chips: string[];
  explainBtn: string;
  tryLabel: string;
  notJust: string;
  // Multi-meaning flow
  multiMeaningPrompt: string;
  multiMeaningOptionAll: string;
  multiMeaningOptionContext: string;
  multiMeaningContextPlaceholder: string;
  multiMeaningContextBtn: string;
  contextHint: string;
  contextPlaceholder: string;
  showAllMeaningsBtn: string;
  backToContext: string;
  wordNotFound: string;
  didYouMean: string;
  showAllMeanings: string;
  meaningLabel: string;
  contextNote: string;
  // Result UI
  definitionsLabel: string;
  examplesLabel: string;
  etymologyLabel: string;
  idiomsLabel: string;
  generalIdiomsLabel: string;
  etySourceLanguage: string;
  etyOriginalWord: string;
  etyOriginalMeaning: string;
  etyBreakdown: string;
  etyHistoryNote: string;
  generateImage: string;
  composeSentence: string;
  composeSentencePlaceholder: string;
  composeSentenceCheckBtn: string;
  composeSentenceChecking: string;
  composeStatusPerfect: string;
  composeStatusAlmost: string;
  composeStatusIncorrect: string;
  composeSuggestionLabel: string;
  composeTryAgain: string;
  // Account page
  accountTitle: string;
  accountYourPlan: string;
  accountFreePlan: string;
  accountClearPlan: string;
  accountDeepPlan: string;
  accountImagesUsage: string;
  accountImagesUsageNote: string;
  accountManageSubscription: string;
  accountUpgrade: string;
  accountSubscriptionStatus: string;
  accountStatusActive: string;
  accountStatusCanceled: string;
  accountStatusPastDue: string;
  accountSignedInAs: string;
  accountLoading: string;
  accountErrorLoading: string;
  accountNav: string;
  // Search history
  historyTitle: string;
  historyClear: string;
  historyEmpty: string;
  shareWord: string;
  shareCopied: string;
  generatingImage: string;
  imageFailed: string;
  imageLimitReached: string;
  understandMore: string;
  goDeeper: string;
  moreExamples: string;
  forKids: string;
  kidsLabel: string;
  kidsModeToggle: string;
  kidsGenerating: string;
  kidsError: string;
  kidsUpgradeNeeded: string;
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
  // Upsell
  upsellKids: string;
  upsellVisual: string;
  upsellBtn: string;
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
  comingSoon: string;
  comingSoonNote: string;
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
  perMonth: string;
  freeLabel: string;
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
  demoLang: string;
  demoDefinition: string;
  demoExamples: string[];
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
  navSearch: string;
  navHowItWorks: string;
  navFeatures: string;
}> = {
  en: {
    tagline: "Every word, understood.",
    slogan: 'Not <em>just</em> a dictionary. A way to understand.',
    placeholder: ["Type a word"],
    chips: ["ephemeral", "resilience", "ambiguous", "melancholy", "set", "serendipity"],
    explainBtn: "Explain",
    tryLabel: "Try:",
    notJust: "Not <em>just</em> a dictionary. A way to understand.",
    multiMeaningPrompt: "«{word}» has several meanings. What would you like?",
    multiMeaningOptionAll: "Show all meanings",
    multiMeaningOptionContext: "Write a sentence — get the exact meaning",
    multiMeaningContextPlaceholder: "Write a sentence using «{word}»…",
    multiMeaningContextBtn: "Find the meaning",
    contextHint: "Reading something? Paste the sentence the word appears in (optional)",
    contextPlaceholder: "The sentence where the word appears…",
    showAllMeaningsBtn: "Show all meanings",
    backToContext: "Back",
    wordNotFound: "We couldn't find “{word}” in the dictionary.",
    didYouMean: "Did you mean",
    showAllMeanings: "Show all meanings",
    meaningLabel: "Meaning",
    contextNote: "How does this meaning fit your sentence?",
    definitionsLabel: "Meanings",
    examplesLabel: "Examples",
    etymologyLabel: "Origin",
    idiomsLabel: "Idioms with this meaning",
    generalIdiomsLabel: "Common expressions",
    etySourceLanguage: "From",
    etyOriginalWord: "Original",
    etyOriginalMeaning: "Meant",
    etyBreakdown: "Parts",
    etyHistoryNote: "Background",
    generateImage: "Generate image",
    composeSentence: "Compose your own sentence",
    composeSentencePlaceholder: "Write a sentence using this meaning…",
    composeSentenceCheckBtn: "Check",
    composeSentenceChecking: "Checking…",
    composeStatusPerfect: "Perfect",
    composeStatusAlmost: "Almost there",
    composeStatusIncorrect: "Not this meaning",
    composeSuggestionLabel: "Suggested",
    composeTryAgain: "Try another sentence",
    accountTitle: "Your account",
    accountYourPlan: "Your plan",
    accountFreePlan: "Basic — Free",
    accountClearPlan: "Clear",
    accountDeepPlan: "Deep",
    accountImagesUsage: "Images this month",
    accountImagesUsageNote: "Resets on the 1st of every month",
    accountManageSubscription: "Manage subscription",
    accountUpgrade: "Upgrade",
    accountSubscriptionStatus: "Status",
    accountStatusActive: "Active",
    accountStatusCanceled: "Canceled",
    accountStatusPastDue: "Past due",
    accountSignedInAs: "Signed in as",
    accountLoading: "Loading…",
    accountErrorLoading: "Couldn't load account info. Try refreshing.",
    accountNav: "Account",
    historyTitle: "Recent searches",
    historyClear: "Clear",
    historyEmpty: "No recent searches yet",
    shareWord: "Share",
    shareCopied: "Link copied",
    generatingImage: "Creating image…",
    imageFailed: "Couldn't create image. Try again.",
    imageLimitReached: "Monthly image limit reached. Upgrade to Deep for more.",
    understandMore: "Understand more ↓",
    goDeeper: "Go deeper ↓",
    moreExamples: "More examples",
    forKids: "Explain like I'm 10",
    kidsLabel: "Kids explanation",
    kidsModeToggle: "Kids mode",
    kidsGenerating: "Creating a kid-friendly explanation...",
    kidsError: "Couldn't create the explanation. Try again.",
    kidsUpgradeNeeded: "Upgrade to Clear to unlock kid-friendly explanations →",
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
    upsellKids: "Explain it like I'm 10",
    upsellVisual: "See it visually",
    upsellBtn: "Upgrade to Clear →",
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
    comingSoon: "Coming soon",
    comingSoonNote: "Advanced features in development",
    mostPeopleChoose: "Most people choose this",
    cancelAnytime: "Cancel anytime. No hidden fees. Secure payments by Stripe.",
    startFree: "Start free",
    startUnderstanding: "Start understanding",
    startUnderstandingFully: "Start understanding fully",
    unlockDeep: "Unlock Deep",
    basicDesc: "Start understanding words — simply and clearly",
    clearDesc: "Truly understand — see and feel every word",
    deepDesc: "Make words part of your daily life",
    perMonth: "/month",
    freeLabel: "Free",
    searchesPerDay: "20 searches per day",
    fullDefinition: "Full definition",
    examples: "Examples",
    forKidsFeature: "Simple kids explanation",
    basicEtymology: "Word origin",
    allLanguages: "All 10 languages",
    unlimitedSearches: "Unlimited searches",
    allBasicFeatures: "Everything in Basic",
    oppositeConfusable: "Opposite & Confusable",
    registerFrequency: "Register & Frequency",
    wordFamilyFeature: "Word family",
    historyFavorites: "History & Favorites",
    quizMode: "Quizzes & practice",
    useThisWordFeature: "Compose your own sentence + AI feedback",
    aiImages: "Visual word images",
    wordCollections: "Word collections by topic",
    wordOfDay: "Personal word of the day",
    advancedInsights: "Ongoing learning",
    everythingInClear: "Everything in Clear",
    heroHeadline: "Understand any word instantly",
    heroSubline: "Gadit explains words simply, clearly, and deeply — in your own language.",
    heroSupport: "Not <em>just</em> a dictionary. A way to understand.",
    heroLangs: "Available in English · עברית · العربية · Русский",
    demoSectionTitle: "See how Gadit works",
    demoWord: "ephemeral",
    demoLang: "English",
    demoDefinition: "Lasting for only a short time; quickly fading or disappearing.",
    demoExamples: [
      "\"The beauty of cherry blossoms is ephemeral — here for a week, then gone.\"",
      "\"Fame can be ephemeral; what matters is the work you leave behind.\"",
      "\"Children's laughter is ephemeral, but the memory of it lasts forever.\"",
    ],
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
    navSearch: "Search",
    navHowItWorks: "How it works",
    navFeatures: "Features",
  },
  he: {
    tagline: "כל מילה, מובנת.",
    slogan: "לא <em>רק</em> מילון. דרך להבין.",
    placeholder: ["הקלד מילה"],
    chips: ["אהבה", "חופש", "קרן", "עמוס", "שלום", "תקווה"],
    explainBtn: "פרש",
    tryLabel: "נסה:",
    notJust: "לא <em>רק</em> מילון. דרך להבין באמת.",
    multiMeaningPrompt: "למילה «{word}» יש כמה משמעויות. מה תרצה?",
    multiMeaningOptionAll: "הצג את כל ההגדרות",
    multiMeaningOptionContext: "כתוב משפט — קבל את המשמעות המדויקת",
    multiMeaningContextPlaceholder: "כתוב משפט עם המילה «{word}»…",
    multiMeaningContextBtn: "מצא את המשמעות",
    contextHint: "קורא משהו? הדבק את המשפט שבו מופיעה המילה (אופציונלי)",
    contextPlaceholder: "המשפט שבו מופיעה המילה…",
    showAllMeaningsBtn: "הצג את כל המשמעויות",
    backToContext: "חזרה",
    wordNotFound: "לא מצאנו את המילה ״{word}״ במילון.",
    didYouMean: "אולי התכוונת ל",
    showAllMeanings: "הצג את כל המשמעויות",
    meaningLabel: "משמעות",
    contextNote: "איך המשמעות הזאת מתאימה למשפט שלך?",
    definitionsLabel: "משמעויות",
    examplesLabel: "דוגמאות",
    etymologyLabel: "מקור המילה",
    idiomsLabel: "ניבים עם משמעות זו",
    generalIdiomsLabel: "ביטויים נפוצים",
    etySourceLanguage: "משפה",
    etyOriginalWord: "מילה מקורית",
    etyOriginalMeaning: "משמעות מקורית",
    etyBreakdown: "חלקי מילה",
    etyHistoryNote: "רקע",
    generateImage: "צור תמונה",
    composeSentence: "חבר משפט משלך",
    composeSentencePlaceholder: "כתוב משפט עם המשמעות הזו…",
    composeSentenceCheckBtn: "בדוק",
    composeSentenceChecking: "בודק…",
    composeStatusPerfect: "מצוין",
    composeStatusAlmost: "כמעט",
    composeStatusIncorrect: "לא במשמעות הנכונה",
    composeSuggestionLabel: "הצעה",
    composeTryAgain: "נסה משפט אחר",
    accountTitle: "החשבון שלך",
    accountYourPlan: "המנוי שלך",
    accountFreePlan: "Basic — חינם",
    accountClearPlan: "Clear",
    accountDeepPlan: "Deep",
    accountImagesUsage: "תמונות החודש",
    accountImagesUsageNote: "מתאפס בכל ה-1 לחודש",
    accountManageSubscription: "ניהול מנוי",
    accountUpgrade: "שדרג",
    accountSubscriptionStatus: "סטטוס",
    accountStatusActive: "פעיל",
    accountStatusCanceled: "מבוטל",
    accountStatusPastDue: "תשלום באיחור",
    accountSignedInAs: "מחובר כ-",
    accountLoading: "טוען…",
    accountErrorLoading: "לא הצלחנו לטעון את פרטי החשבון. נסה לרענן.",
    accountNav: "החשבון שלי",
    historyTitle: "חיפושים אחרונים",
    historyClear: "נקה",
    historyEmpty: "עדיין אין חיפושים",
    shareWord: "שתף",
    shareCopied: "הקישור הועתק",
    generatingImage: "יוצר תמונה…",
    imageFailed: "לא הצלחנו ליצור תמונה. נסה שוב.",
    imageLimitReached: "הגעת למכסת התמונות החודשית. שדרג ל-Deep למכסה גדולה יותר.",
    understandMore: "הבן יותר ↓",
    goDeeper: "העמק ↓",
    moreExamples: "עוד דוגמאות",
    forKids: "הסבר לילדים",
    kidsLabel: "הסבר לילדים",
    kidsModeToggle: "מצב ילדים",
    kidsGenerating: "יוצר הסבר ידידותי לילדים…",
    kidsError: "לא הצלחנו ליצור את ההסבר. נסה שוב.",
    kidsUpgradeNeeded: "שדרג ל-Clear כדי לקבל הסברים ידידותיים לילדים ←",
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
    upsellKids: "הסבר לילדים",
    upsellVisual: "ראה את זה ויזואלית",
    upsellBtn: "שדרג ל-Clear ←",
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
    comingSoon: "בקרוב",
    comingSoonNote: "פיצ'רים מתקדמים בשלבי פיתוח",
    mostPeopleChoose: "רוב האנשים בוחרים בזה",
    cancelAnytime: "ביטול בכל עת. ללא עמלות נסתרות. תשלום מאובטח דרך Stripe.",
    startFree: "התחל בחינם",
    startUnderstanding: "התחל להבין",
    startUnderstandingFully: "התחל להבין לגמרי",
    unlockDeep: "פתח Deep",
    basicDesc: "התחל להבין מילים — פשוט וברור",
    clearDesc: "להבין באמת — לראות ולהרגיש כל מילה",
    deepDesc: "תעשה מילים חלק מהחיים שלך",
    perMonth: "לחודש",
    freeLabel: "חינם",
    searchesPerDay: "20 חיפושים ביום",
    fullDefinition: "הגדרה מלאה",
    examples: "דוגמאות",
    forKidsFeature: "הסבר פשוט לילדים",
    basicEtymology: "מקור המילה",
    allLanguages: "כל 10 השפות",
    unlimitedSearches: "חיפושים ללא הגבלה",
    allBasicFeatures: "כל מה שיש ב-Basic",
    oppositeConfusable: "הפך ומילים מבלבלות",
    registerFrequency: "רישום ותדירות",
    wordFamilyFeature: "משפחת המילה",
    historyFavorites: "היסטוריה ומועדפים",
    quizMode: "חידונים ותרגול",
    useThisWordFeature: "חבר משפט משלך + פידבק AI",
    aiImages: "תמונות ויזואליות למילה",
    wordCollections: "אוספי מילים לפי נושא",
    wordOfDay: "מילת היום האישית",
    advancedInsights: "למידה מתמשכת",
    everythingInClear: "כל מה שיש ב-Clear",
    heroHeadline: "להבין כל מילה — מיד",
    heroSubline: "Gadit מסביר מילים בפשטות, בבהירות ובעומק — בשפה שלך.",
    heroSupport: "לא <em>רק</em> מילון. דרך להבין.",
    heroLangs: "זמין בעברית · English · العربية · Русский",
    demoSectionTitle: "ראה איך Gadit עובד",
    demoWord: "רגעי",
    demoLang: "עברית",
    demoDefinition: "משהו שנמשך זמן קצר מאוד ואז נעלם — כמו רגע שחולף לפני שהספקת להחזיק בו.",
    demoExamples: [
      "\"יופי פרחי השקד הוא רגעי — שבוע אחד, ואז הוא נעלם.\"",
      "\"האושר לפעמים רגעי, אבל הזיכרון ממנו נשאר לנצח.\"",
      "\"היה רגע רגעי של שקט לפני שהילדים חזרו הביתה.\"",
    ],
    demoInsight: "מהשורש ר-ג-ע, שמשמעותו 'רגע' — יחידת הזמן הקטנה ביותר. המילה מתארת משהו שכל כולו הוא רגע אחד בלבד.",
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
    navSearch: "חיפוש",
    navHowItWorks: "איך זה עובד",
    navFeatures: "פיצ'רים",
  },
  ar: {
    tagline: "كل كلمة، مفهومة.",
    slogan: "ليس <em>مجرد</em> قاموس. طريقة للفهم.",
    placeholder: ["اكتب كلمة"],
    chips: ["حب", "حرية", "عين", "سلام", "أمل", "وقت"],
    explainBtn: "اشرح",
    tryLabel: "جرب:",
    notJust: "ليس <em>مجرد</em> قاموس. طريقة للفهم.",
    multiMeaningPrompt: "لكلمة «{word}» عدة معانٍ. ماذا تريد؟",
    multiMeaningOptionAll: "عرض جميع المعاني",
    multiMeaningOptionContext: "اكتب جملة — احصل على المعنى الدقيق",
    multiMeaningContextPlaceholder: "اكتب جملة تستخدم فيها «{word}»…",
    multiMeaningContextBtn: "ابحث عن المعنى",
    contextHint: "هل تقرأ شيئاً؟ الصق الجملة التي تظهر فيها الكلمة (اختياري)",
    contextPlaceholder: "الجملة التي تظهر فيها الكلمة…",
    showAllMeaningsBtn: "عرض جميع المعاني",
    backToContext: "رجوع",
    wordNotFound: "لم نجد كلمة ”{word}“ في القاموس.",
    didYouMean: "هل تقصد",
    showAllMeanings: "عرض جميع المعاني",
    meaningLabel: "معنى",
    contextNote: "كيف يناسب هذا المعنى جملتك؟",
    definitionsLabel: "المعاني",
    examplesLabel: "أمثلة",
    etymologyLabel: "أصل الكلمة",
    idiomsLabel: "تعابير بهذا المعنى",
    generalIdiomsLabel: "تعابير شائعة",
    etySourceLanguage: "من لغة",
    etyOriginalWord: "الكلمة الأصلية",
    etyOriginalMeaning: "المعنى الأصلي",
    etyBreakdown: "أجزاء الكلمة",
    etyHistoryNote: "خلفية",
    generateImage: "إنشاء صورة",
    composeSentence: "ألف جملتك",
    composeSentencePlaceholder: "اكتب جملة باستخدام هذا المعنى…",
    composeSentenceCheckBtn: "تحقق",
    composeSentenceChecking: "جاري التحقق…",
    composeStatusPerfect: "ممتاز",
    composeStatusAlmost: "تقريباً",
    composeStatusIncorrect: "ليس هذا المعنى",
    composeSuggestionLabel: "اقتراح",
    composeTryAgain: "جرب جملة أخرى",
    accountTitle: "حسابك",
    accountYourPlan: "اشتراكك",
    accountFreePlan: "Basic — مجاني",
    accountClearPlan: "Clear",
    accountDeepPlan: "Deep",
    accountImagesUsage: "صور هذا الشهر",
    accountImagesUsageNote: "تتم إعادة التعيين في الأول من كل شهر",
    accountManageSubscription: "إدارة الاشتراك",
    accountUpgrade: "ترقية",
    accountSubscriptionStatus: "الحالة",
    accountStatusActive: "نشط",
    accountStatusCanceled: "ملغى",
    accountStatusPastDue: "دفعة متأخرة",
    accountSignedInAs: "تسجيل الدخول باسم",
    accountLoading: "جاري التحميل…",
    accountErrorLoading: "تعذر تحميل معلومات الحساب. حاول التحديث.",
    accountNav: "حسابي",
    historyTitle: "عمليات البحث الأخيرة",
    historyClear: "مسح",
    historyEmpty: "لا توجد عمليات بحث بعد",
    shareWord: "مشاركة",
    shareCopied: "تم نسخ الرابط",
    generatingImage: "جاري إنشاء الصورة…",
    imageFailed: "تعذر إنشاء الصورة. حاول مرة أخرى.",
    imageLimitReached: "وصلت إلى الحد الشهري للصور. قم بالترقية إلى Deep للحصول على المزيد.",
    understandMore: "↓ فهم أكثر",
    goDeeper: "↓ تعمق أكثر",
    moreExamples: "مزيد من الأمثلة",
    forKids: "شرح للأطفال",
    kidsLabel: "شرح للأطفال",
    kidsModeToggle: "وضع الأطفال",
    kidsGenerating: "جاري إنشاء شرح ودود للأطفال...",
    kidsError: "تعذر إنشاء الشرح. حاول مرة أخرى.",
    kidsUpgradeNeeded: "قم بالترقية إلى Clear لفتح شروح ودودة للأطفال ←",
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
    upsellKids: "اشرح لطفل في العاشرة",
    upsellVisual: "شاهده بصرياً",
    upsellBtn: "الترقية إلى Clear ←",
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
    comingSoon: "قريباً",
    comingSoonNote: "ميزات متقدمة قيد التطوير",
    mostPeopleChoose: "معظم الناس يختارون هذا",
    cancelAnytime: "إلغاء في أي وقت. بدون رسوم خفية. دفع آمن عبر Stripe.",
    startFree: "ابدأ مجاناً",
    startUnderstanding: "ابدأ الفهم",
    startUnderstandingFully: "ابدأ الفهم الكامل",
    unlockDeep: "افتح Deep",
    basicDesc: "ابدأ فهم الكلمات — ببساطة ووضوح",
    clearDesc: "افهم حقاً — شاهد وأحسّ كل كلمة",
    deepDesc: "اجعل الكلمات جزءاً من حياتك اليومية",
    perMonth: "/شهر",
    freeLabel: "مجاناً",
    searchesPerDay: "20 بحثاً يومياً",
    fullDefinition: "تعريف كامل",
    examples: "أمثلة",
    forKidsFeature: "شرح بسيط للأطفال",
    basicEtymology: "أصل الكلمة",
    allLanguages: "جميع اللغات العشر",
    unlimitedSearches: "بحث غير محدود",
    allBasicFeatures: "كل ما في Basic",
    oppositeConfusable: "المعاكس والكلمات المشابهة",
    registerFrequency: "المستوى والتكرار",
    wordFamilyFeature: "عائلة الكلمة",
    historyFavorites: "السجل والمفضلة",
    quizMode: "اختبارات وتدريب",
    useThisWordFeature: "ألف جملتك + تغذية راجعة AI",
    aiImages: "صور بصرية للكلمة",
    wordCollections: "مجموعات كلمات حسب الموضوع",
    wordOfDay: "كلمة اليوم الشخصية",
    advancedInsights: "تعلّم مستمر",
    everythingInClear: "كل ما في Clear",
    heroHeadline: "افهم أي كلمة على الفور",
    heroSubline: "Gadit يشرح الكلمات ببساطة ووضوح وعمق — بلغتك.",
    heroSupport: "ليس <em>مجرد</em> قاموس. طريقة للفهم.",
    heroLangs: "متاح بـ العربية · English · עברית · Русский",
    demoSectionTitle: "اكتشف كيف يعمل Gadit",
    demoWord: "عابر",
    demoLang: "العربية",
    demoDefinition: "شيء يمرّ بسرعة ولا يبقى — كلحظة تمضي قبل أن تمسك بها.",
    demoExamples: [
      "\"جمال أزهار اللوز عابر — أسبوع واحد ثم يختفي.\"",
      "\"السعادة أحياناً عابرة، لكن ذكراها تبقى للأبد.\"",
      "\"كان هناك صمت عابر قبل أن يعود الأطفال إلى البيت.\"",
    ],
    demoInsight: "من الجذر ع-ب-ر، ومعناه 'العبور والمرور'. الكلمة تصف ما هو في حالة مرور دائم، لا يستقرّ ولا يثبت.",
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
    navSearch: "بحث",
    navHowItWorks: "كيف يعمل",
    navFeatures: "المميزات",
  },
  ru: {
    tagline: "Каждое слово — понято.",
    slogan: "Не <em>просто</em> словарь. Способ понять.",
    placeholder: ["Введите слово"],
    chips: ["любовь", "эфемерный", "свобода", "надежда", "время", "мир"],
    explainBtn: "Объяснить",
    tryLabel: "Попробуй:",
    notJust: "Не <em>просто</em> словарь. Способ понять.",
    multiMeaningPrompt: "У слова «{word}» несколько значений. Что ты хочешь?",
    multiMeaningOptionAll: "Показать все значения",
    multiMeaningOptionContext: "Написать предложение — получить точное значение",
    multiMeaningContextPlaceholder: "Напиши предложение со словом «{word}»…",
    multiMeaningContextBtn: "Найти значение",
    contextHint: "Читаешь что-то? Вставь предложение со словом (необязательно)",
    contextPlaceholder: "Предложение, в котором встречается слово…",
    showAllMeaningsBtn: "Показать все значения",
    backToContext: "Назад",
    wordNotFound: "Слово «{word}» не найдено в словаре.",
    didYouMean: "Возможно, вы имели в виду",
    showAllMeanings: "Показать все значения",
    meaningLabel: "Значение",
    contextNote: "Как это значение подходит к твоему предложению?",
    definitionsLabel: "Значения",
    examplesLabel: "Примеры",
    etymologyLabel: "Происхождение",
    idiomsLabel: "Идиомы с этим значением",
    generalIdiomsLabel: "Устойчивые выражения",
    etySourceLanguage: "Из языка",
    etyOriginalWord: "Исходное слово",
    etyOriginalMeaning: "Исходный смысл",
    etyBreakdown: "Части слова",
    etyHistoryNote: "Фон",
    generateImage: "Создать изображение",
    composeSentence: "Составь своё предложение",
    composeSentencePlaceholder: "Напиши предложение с этим значением…",
    composeSentenceCheckBtn: "Проверить",
    composeSentenceChecking: "Проверка…",
    composeStatusPerfect: "Отлично",
    composeStatusAlmost: "Почти",
    composeStatusIncorrect: "Не то значение",
    composeSuggestionLabel: "Совет",
    composeTryAgain: "Попробуй другое предложение",
    accountTitle: "Твой аккаунт",
    accountYourPlan: "Твой план",
    accountFreePlan: "Basic — Бесплатно",
    accountClearPlan: "Clear",
    accountDeepPlan: "Deep",
    accountImagesUsage: "Изображений в этом месяце",
    accountImagesUsageNote: "Обнуляется 1-го числа каждого месяца",
    accountManageSubscription: "Управление подпиской",
    accountUpgrade: "Улучшить",
    accountSubscriptionStatus: "Статус",
    accountStatusActive: "Активна",
    accountStatusCanceled: "Отменена",
    accountStatusPastDue: "Просрочена",
    accountSignedInAs: "Вход выполнен как",
    accountLoading: "Загрузка…",
    accountErrorLoading: "Не удалось загрузить информацию об аккаунте.",
    accountNav: "Мой аккаунт",
    historyTitle: "Недавние запросы",
    historyClear: "Очистить",
    historyEmpty: "Пока нет недавних запросов",
    shareWord: "Поделиться",
    shareCopied: "Ссылка скопирована",
    generatingImage: "Создаётся изображение…",
    imageFailed: "Не удалось создать изображение. Попробуй ещё раз.",
    imageLimitReached: "Достигнут месячный лимит изображений. Перейди на Deep для увеличения.",
    understandMore: "Подробнее ↓",
    goDeeper: "Глубже ↓",
    moreExamples: "Ещё примеры",
    forKids: "Объясни как ребёнку",
    kidsLabel: "Объяснение для детей",
    kidsModeToggle: "Режим для детей",
    kidsGenerating: "Создаётся объяснение для детей…",
    kidsError: "Не удалось создать объяснение. Попробуй ещё раз.",
    kidsUpgradeNeeded: "Перейди на Clear, чтобы открыть объяснения для детей →",
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
    upsellKids: "Объяснить как ребёнку",
    upsellVisual: "Увидеть визуально",
    upsellBtn: "Перейти на Clear →",
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
    comingSoon: "Скоро",
    comingSoonNote: "Продвинутые функции в разработке",
    mostPeopleChoose: "Большинство выбирают это",
    cancelAnytime: "Отмена в любое время. Без скрытых платежей. Безопасная оплата через Stripe.",
    startFree: "Начать бесплатно",
    startUnderstanding: "Начать понимать",
    startUnderstandingFully: "Понимать полностью",
    unlockDeep: "Открыть Deep",
    basicDesc: "Начни понимать слова — просто и ясно",
    clearDesc: "По-настоящему понять — увидеть и почувствовать каждое слово",
    deepDesc: "Сделай слова частью своей жизни",
    perMonth: "/мес",
    freeLabel: "Бесплатно",
    searchesPerDay: "20 поисков в день",
    fullDefinition: "Полное определение",
    examples: "Примеры",
    forKidsFeature: "Простое объяснение для детей",
    basicEtymology: "Происхождение слова",
    allLanguages: "Все 10 языков",
    unlimitedSearches: "Безлимитный поиск",
    allBasicFeatures: "Всё из Basic",
    oppositeConfusable: "Антонимы и похожие слова",
    registerFrequency: "Регистр и частотность",
    wordFamilyFeature: "Семья слов",
    historyFavorites: "История и избранное",
    quizMode: "Тесты и практика",
    useThisWordFeature: "Составь своё предложение + обратная связь AI",
    aiImages: "Визуальные образы слова",
    wordCollections: "Коллекции слов по темам",
    wordOfDay: "Персональное слово дня",
    advancedInsights: "Непрерывное обучение",
    everythingInClear: "Всё из Clear",
    heroHeadline: "Понимай любое слово мгновенно",
    heroSubline: "Gadit объясняет слова просто, ясно и глубоко — на твоём языке.",
    heroSupport: "Не <em>просто</em> словарь. Способ понять.",
    heroLangs: "Доступно на Русский · English · עברית · العربية",
    demoSectionTitle: "Посмотри как работает Gadit",
    demoWord: "мимолётный",
    demoLang: "Русский",
    demoDefinition: "То, что длится совсем недолго и исчезает — как момент, который уходит прежде, чем успеваешь его удержать.",
    demoExamples: [
      "«Красота цветущей сакуры мимолётна — неделя, и она исчезает.»",
      "«Счастье бывает мимолётным, но воспоминание о нём остаётся навсегда.»",
      "«Наступила мимолётная тишина, прежде чем дети вернулись домой.»",
    ],
    demoInsight: "От слова «мимо» + «лететь» — буквально «пролетающий мимо». Слово передаёт ощущение чего-то, что проносится так быстро, что едва успеваешь заметить.",
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
    navSearch: "Поиск",
    navHowItWorks: "Как это работает",
    navFeatures: "Функции",
  },
};
