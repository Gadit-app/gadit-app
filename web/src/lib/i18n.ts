import EN_T from "./i18n-t/en";
import { makePack } from "./lang-pack";

export type Lang = "en" | "he" | "ar" | "ru" | "es" | "pt" | "fr" | "de" | "cs" | "sk" | "it" | "ja" | "hi" | "am" | "uk" | "tr" | "pl" | "fa" | "id" | "nl" | "el" | "zu" | "vi" | "fil" | "af" | "sw" | "zh-CN" | "zh-TW" | "ko" | "th" | "bn" | "da" | "hu" | "xh" | "nso" | "tn" | "st" | "ts" | "ss" | "ve" | "nr";

/**
 * The single source of truth for every supported UI language. `flag`
 * is an ISO 3166-1 alpha-2 country code (lowercase) — we render it as
 * an actual flag image via flagcdn.com because Windows/Linux's default
 * fonts strip regional-indicator emojis down to letter-pair fallbacks
 * (real users see "IL" / "GB" instead of 🇮🇱 / 🇬🇧). flagcdn.com serves
 * SVG/PNG flag art consistently across every platform, no font dance.
 * Arabic falls back to Saudi, Portuguese to Portugal — a pragmatic
 * regional choice we can split later if we add variants.
 */
export const LANGUAGES: { code: Lang; label: string; dir: "ltr" | "rtl"; flag: string }[] = [
  { code: "en", label: "English",   dir: "ltr", flag: "gb" },
  { code: "he", label: "עברית",      dir: "rtl", flag: "il" },
  { code: "ar", label: "العربية",    dir: "rtl", flag: "sa" },
  { code: "ru", label: "Русский",   dir: "ltr", flag: "ru" },
  { code: "es", label: "Español",   dir: "ltr", flag: "es" },
  { code: "pt", label: "Português", dir: "ltr", flag: "pt" },
  { code: "fr", label: "Français",  dir: "ltr", flag: "fr" },
  { code: "de", label: "Deutsch",   dir: "ltr", flag: "de" },
  { code: "cs", label: "Čeština",   dir: "ltr", flag: "cz" },
  { code: "sk", label: "Slovenčina", dir: "ltr", flag: "sk" },
  { code: "it", label: "Italiano",  dir: "ltr", flag: "it" },
  { code: "ja", label: "日本語",      dir: "ltr", flag: "jp" },
  { code: "hi", label: "हिन्दी",       dir: "ltr", flag: "in" },
  { code: "am", label: "አማርኛ",      dir: "ltr", flag: "et" },
  { code: "uk", label: "Українська", dir: "ltr", flag: "ua" },
  { code: "tr", label: "Türkçe",    dir: "ltr", flag: "tr" },
  { code: "pl", label: "Polski",    dir: "ltr", flag: "pl" },
  { code: "fa", label: "فارسی",      dir: "rtl", flag: "ir" },
  { code: "id", label: "Indonesia", dir: "ltr", flag: "id" },
  { code: "nl", label: "Nederlands", dir: "ltr", flag: "nl" },
  { code: "el", label: "Ελληνικά", dir: "ltr", flag: "gr" },
  { code: "zu", label: "isiZulu", dir: "ltr", flag: "za" },
  { code: "vi", label: "Tiếng Việt", dir: "ltr", flag: "vn" },
  { code: "fil", label: "Filipino", dir: "ltr", flag: "ph" },
  { code: "af", label: "Afrikaans", dir: "ltr", flag: "za" },
  { code: "sw", label: "Kiswahili", dir: "ltr", flag: "tz" },
  { code: "zh-CN", label: "简体中文", dir: "ltr", flag: "cn" },
  { code: "zh-TW", label: "繁體中文", dir: "ltr", flag: "tw" },
  { code: "ko", label: "한국어", dir: "ltr", flag: "kr" },
  { code: "th", label: "ไทย", dir: "ltr", flag: "th" },
  { code: "bn", label: "বাংলা", dir: "ltr", flag: "bd" },
  { code: "da", label: "Dansk", dir: "ltr", flag: "dk" },
  { code: "hu", label: "Magyar", dir: "ltr", flag: "hu" },
  { code: "xh", label: "isiXhosa", dir: "ltr", flag: "za" },
  { code: "nso", label: "Sepedi", dir: "ltr", flag: "za" },
  { code: "tn", label: "Setswana", dir: "ltr", flag: "za" },
  { code: "st", label: "Sesotho", dir: "ltr", flag: "za" },
  { code: "ts", label: "Xitsonga", dir: "ltr", flag: "za" },
  { code: "ss", label: "siSwati", dir: "ltr", flag: "za" },
  { code: "ve", label: "Tshivenḓa", dir: "ltr", flag: "za" },
  { code: "nr", label: "isiNdebele", dir: "ltr", flag: "za" },
];

/** Stable CDN that returns a small PNG flag for an ISO country code. */
export function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/40x30/${countryCode}.png`;
}
export function flagUrl2x(countryCode: string): string {
  return `https://flagcdn.com/80x60/${countryCode}.png`;
}

export function getLangDir(lang: Lang) {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

/**
 * The name of a language, written in the VIEWER's language (Gadi 2026-09-19:
 * "when a list of languages is shown, show it in the user's language" — a
 * Hebrew user should read יפנית/סינית, not 日本語/中文). Uses the browser's
 * CLDR data via Intl.DisplayNames, which is authoritative and covers all our
 * UI languages. Falls back to the language's own native label (LANGUAGES) if
 * DisplayNames is unavailable (very old browsers) or returns nothing.
 *
 * Our zh-CN / zh-TW codes are region tags; mapping them to the script tags
 * zh-Hans / zh-Hant makes DisplayNames say "Simplified / Traditional Chinese"
 * rather than "Chinese (China) / (Taiwan)".
 */
const DISPLAY_CODE: Record<string, string> = { "zh-CN": "zh-Hans", "zh-TW": "zh-Hant" };
/** Viewer languages whose names the server (Node, full ICU) knows but browsers do
 *  not (Chrome has no xh/nso/tn/st... data): the server would write "IsiXhosa" and
 *  the browser "isiXhosa", a hydration mismatch (React #418, 2026-10-16). For these
 *  viewers names always come from our own labels, the same on both sides. */
const NO_BROWSER_NAMES = new Set(["xh", "nso", "tn", "st", "ts", "ss", "ve", "nr"]);
export function langNameIn(code: string, viewerLang: string): string {
  if (NO_BROWSER_NAMES.has(viewerLang)) {
    if (code.startsWith("@")) return code === "@za" ? "South Africa" : code.slice(1).toUpperCase();
    return LANGUAGES.find((l) => l.code === code)?.label ?? code;
  }
  // A regional group row of the pickers ("@za", lang-groups.ts): the country's name.
  if (code.startsWith("@")) {
    const region = code.slice(1).toUpperCase();
    try {
      const dn = new Intl.DisplayNames([viewerLang], { type: "region" });
      if (dn.resolvedOptions().locale.toLowerCase().startsWith(viewerLang.toLowerCase().split("-")[0])) {
        const name = dn.of(region);
        if (name && name !== region) return name;
      }
    } catch { /* fall through */ }
    return region === "ZA" ? "South Africa" : region;
  }
  const native = LANGUAGES.find((l) => l.code === code)?.label ?? code;
  try {
    const dn = new Intl.DisplayNames([viewerLang], { type: "language" });
    // No locale data for the viewer's language (e.g. Sesotho, Venda): the
    // browser silently answers in its OWN language. Use the native label then.
    if (!dn.resolvedOptions().locale.toLowerCase().startsWith(viewerLang.toLowerCase().split("-")[0])) return native;
    const name = dn.of(DISPLAY_CODE[code] ?? code);
    if (name && name.toLowerCase() !== code.toLowerCase()) return name;
  } catch {
    /* Intl.DisplayNames unsupported — fall back to the native label. */
  }
  return native;
}

export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const full = navigator.language?.toLowerCase() ?? "";
  // Filipino/Tagalog: browsers report "fil-PH" or "tl-PH"; the 2-char slice
  // ("fi"/"tl") is ambiguous, so match the full tag before the slice ladder.
  if (full.startsWith("fil") || full.startsWith("tl")) return "fil";
  // Sepedi has a 3-letter code, lost by the 2-char slice below.
  if (full.startsWith("nso")) return "nso";
  // Chinese: split Traditional (Taiwan/Hong Kong/Macau/Hant) from Simplified
  // (everything else) off the full tag, since the 2-char slice loses region.
  if (full.startsWith("zh")) {
    if (full.includes("tw") || full.includes("hk") || full.includes("mo") || full.includes("hant")) return "zh-TW";
    return "zh-CN";
  }
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  if (lang === "he" || lang === "iw") return "he";
  if (lang === "ar") return "ar";
  if (lang === "ru") return "ru";
  if (lang === "es") return "es";
  if (lang === "pt") return "pt";
  if (lang === "fr") return "fr";
  if (lang === "de") return "de";
  if (lang === "cs") return "cs";
  if (lang === "sk") return "sk";
  if (lang === "it") return "it";
  if (lang === "ja") return "ja";
  if (lang === "hi") return "hi";
  if (lang === "am") return "am";
  if (lang === "uk") return "uk";
  if (lang === "tr") return "tr";
  if (lang === "pl") return "pl";
  if (lang === "fa") return "fa";
  if (lang === "id") return "id";
  if (lang === "nl") return "nl";
  if (lang === "el") return "el";
  if (lang === "zu") return "zu";
  if (lang === "vi") return "vi";
  if (lang === "af") return "af";
  if (lang === "sw") return "sw";
  if (lang === "ko") return "ko";
  if (lang === "th") return "th";
  if (lang === "bn") return "bn";
  if (lang === "da") return "da";
  if (lang === "hu") return "hu";
  if (lang === "xh") return "xh";
  if (lang === "tn") return "tn";
  if (lang === "st") return "st";
  if (lang === "ts") return "ts";
  if (lang === "ss") return "ss";
  if (lang === "ve") return "ve";
  if (lang === "nr") return "nr";
  return "en";
}

/** Core UI text, one file per language in lib/i18n-t/ (2026-10-31). */
export type TStrings = {
  // Home
  tagline: string;
  slogan: string;
  placeholder: string[];
  chips: string[];
  explainBtn: string;
  tryLabel: string;
  notJust: string;
  // Multi-definition flow
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
  accountTrialBadge: string;
  accountTrialNote: string;
  pricingTrialCta: string;
  pricingTrialDisclaimer: string;
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
  quizStart: string;
  quizLoading: string;
  quizQuestionOf: string;
  quizCorrect: string;
  quizWrong: string;
  quizNext: string;
  quizFinish: string;
  quizScore: string;
  quizTryAgain: string;
  quizClose: string;
  quizError: string;
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
  upsellCompose: string;
  upsellBtn: string;
  // Auth
  login: string;
  logout: string;
  welcomeBack: string;
  createAccount: string;
  orSeparator: string;
  signInToSearch: string;
  dailyLimitReached: string;
  dailyLimitBody: string;
  dailyLimitCta: string;
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
  compareWordsFeature: string;
  wordNotebookFeature: string;
  srPracticeFeature: string;
  // Error reporting
  reportButton: string;
  reportTitle: string;
  reportSubtitle: string;
  reportPickAtLeastOne: string;
  reportDetailsLabel: string;
  reportDetailsPlaceholder: string;
  reportSubmit: string;
  reportSubmitting: string;
  reportCancel: string;
  reportThankYou: string;
  reportThankYouText: string;
  reportCatDefinition: string;
  reportCatEtymology: string;
  reportCatExample: string;
  reportCatKids: string;
  reportCatIdioms: string;
  reportCatImage: string;
  reportCatQuiz: string;
  reportCatCompose: string;
  reportCatCompare: string;
  reportCatOther: string;
  // Admin dashboard
  adminReportsTitle: string;
  adminLoggedInAs: string;
  adminCountsLine: string;
  adminTabOpen: string;
  adminTabReviewed: string;
  adminTabFixed: string;
  adminTabWontfix: string;
  adminTabAll: string;
  adminLoading: string;
  adminNoReports: string;
  adminWordLabel: string;
  adminAnonymous: string;
  adminMarkOpen: string;
  adminMarkReviewed: string;
  adminMarkFixed: string;
  adminMarkWontfix: string;
  adminShowContext: string;
  adminHideContext: string;
  adminOpenPage: string;
  adminPleaseSignIn: string;
  adminForbidden: string;
  adminCountsTotalLabel: string;
  adminCountsOpenLabel: string;
  adminCountsReviewedLabel: string;
  adminCountsFixedLabel: string;
  adminCountsWontfixLabel: string;
  // Basic-tier upsell shown beneath each definition
  basicUpgradeHint: string;
  basicUpgradeCta: string;
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
  // Feature: Word comparison (Deep)
  compareTitle: string;
  compareSubtitle: string;
  compareWordAPlaceholder: string;
  compareWordBPlaceholder: string;
  compareBtn: string;
  compareLoading: string;
  compareKeyDifference: string;
  compareExamples: string;
  compareCommonMistake: string;
  compareNotRealWord: string;
  compareDifferentLanguages: string;
  compareSameWord: string;
  compareErrorGeneric: string;
  compareDeepOnly: string;
  // Feature: Word notebook (Deep)
  notebookTitle: string;
  notebookEmpty: string;
  notebookEmptyHint: string;
  notebookSaveBtn: string;
  notebookSaved: string;
  notebookRemoveBtn: string;
  notebookSavedAt: string;
  notebookOpen: string;
  notebookDeepOnly: string;
  // Feature: Spaced Repetition review (Deep)
  reviewBtn: string;
  reviewBadgeDue: string;
  reviewTitle: string;
  reviewNoneToday: string;
  reviewShowMeaning: string;
  reviewKnewIt: string;
  reviewDidntKnow: string;
  reviewProgress: string;
  reviewDone: string;
  reviewDoneText: string;
  reviewBack: string;
};

/** The loaded languages. Use T[lang] as before; a language that is not loaded yet reads English. */
export const T_PACK = makePack<TStrings>({ en: EN_T }, {
  "he": () => import("./i18n-t/he"),
  "ar": () => import("./i18n-t/ar"),
  "ru": () => import("./i18n-t/ru"),
  "es": () => import("./i18n-t/es"),
  "pt": () => import("./i18n-t/pt"),
  "fr": () => import("./i18n-t/fr"),
  "de": () => import("./i18n-t/de"),
  "cs": () => import("./i18n-t/cs"),
  "sk": () => import("./i18n-t/sk"),
  "it": () => import("./i18n-t/it"),
  "ja": () => import("./i18n-t/ja"),
  "hi": () => import("./i18n-t/hi"),
  "am": () => import("./i18n-t/am"),
  "uk": () => import("./i18n-t/uk"),
  "tr": () => import("./i18n-t/tr"),
  "pl": () => import("./i18n-t/pl"),
  "fa": () => import("./i18n-t/fa"),
  "id": () => import("./i18n-t/id"),
  "nl": () => import("./i18n-t/nl"),
  "el": () => import("./i18n-t/el"),
  "zu": () => import("./i18n-t/zu"),
  "vi": () => import("./i18n-t/vi"),
  "fil": () => import("./i18n-t/fil"),
  "af": () => import("./i18n-t/af"),
  "sw": () => import("./i18n-t/sw"),
  "zh-CN": () => import("./i18n-t/zh-CN"),
  "zh-TW": () => import("./i18n-t/zh-TW"),
  "ko": () => import("./i18n-t/ko"),
  "th": () => import("./i18n-t/th"),
  "bn": () => import("./i18n-t/bn"),
  "da": () => import("./i18n-t/da"),
  "hu": () => import("./i18n-t/hu"),
  "xh": () => import("./i18n-t/xh"),
  "nso": () => import("./i18n-t/nso"),
  "tn": () => import("./i18n-t/tn"),
  "st": () => import("./i18n-t/st"),
  "ts": () => import("./i18n-t/ts"),
  "ss": () => import("./i18n-t/ss"),
  "ve": () => import("./i18n-t/ve"),
  "nr": () => import("./i18n-t/nr"),
});

export const T: Record<Lang, TStrings> = new Proxy({} as Record<Lang, TStrings>, {
  get: (_t, l) => (typeof l === "string" && T_PACK.data[l]) || EN_T,
  has: () => true,
});
