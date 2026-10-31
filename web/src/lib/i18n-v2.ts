/**
 * V2 i18n module — strings for the redesign.
 *
 * Coexists with the legacy `T` table in i18n.ts. Once V2 ships and
 * the legacy screens retire, this module's contents will be folded
 * back into the main T table.
 *
 * Why a separate file:
 * - Lets V2 components import what they need without bloating the
 *   single megafile that already powers every shipped screen.
 * - Lets us land en+he+ar fully translated and stub the rest with
 *   English fallback while iterating, without leaving the main T
 *   table half-translated mid-flight.
 * - Easy to delete when V2 is the only path.
 *
 * Usage:
 *   import { v2 } from "@/lib/i18n-v2";
 *   v2(lang, "homeHeadlineLine1");          // string
 *   v2(lang, "quizQuestionNofM", 2, 5);    // template "Question 2 of 5"
 *   v2(lang, "composeTitleTemplate", word); // template
 */

import type { Lang } from "./i18n";
import en from "./i18n-v2-packs/en";
import { makePack } from "./lang-pack";

type Template1 = (a: string | number) => string;

export interface V2Strings {
  // ── Home: hero ──────────────────────────────────────────────
  homeHeadlineLine1: string;
  homeHeadlineLine2: string;
  homeSubline: string;

  // ── Home: search ────────────────────────────────────────────
  searchPlaceholderHome: string;
  voiceInputTitle: string;
  explain: string;

  // ── Home: value props ───────────────────────────────────────
  valuePropsEyebrow: string;
  valuePropsTitle: string;
  valueProp1Eyebrow: string;
  valueProp1Title: string;
  valueProp1Body: string;
  valueProp2Eyebrow: string;
  valueProp2Title: string;
  valueProp2Body: string;
  valueProp3Eyebrow: string;
  valueProp3Title: string;
  valueProp3Body: string;
  valueProp4Eyebrow: string;
  valueProp4Title: string;
  valueProp4Body: string;

  // ── Home: result tease ──────────────────────────────────────
  previewLabel: string;
  seeFullResult: string;

  // ── Home: tier strip ────────────────────────────────────────
  pricingEyebrow: string;
  pricingTeaserTitle: string;

  // ── Home: footer ────────────────────────────────────────────
  footerProductGroup: string;
  footerLegalGroup: string;
  footerNotebook: string;
  footerPricing: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  footerTagline: string;
  footerLanguagesNote: string;

  // ── Marketing header ────────────────────────────────────────
  signIn: string;
  startFree: string;
  /** Short definition shown on the "Gad" verb stamp in the footer.
      Reads like a dictionary gloss: "to understand a word, fully". */
  verbStampDef: string;
  // Signed-in primary navigation (in MarketingHeader)
  navSearch: string;
  navNotebook: string;
  navPricing: string;
  navSchools: string;
  navFeatures: string;
  navPlay: string;
  navAffiliates: string;

  // Kids Mode toggle — a global "render every definition like a parent
  // would explain it to a child" switch. Persists in localStorage.
  // Clear/Deep only; Basic users see an UpgradeModal when they tap it.
  kidsModeLabel: string;
  kidsModeTooltipOff: string;
  kidsModeTooltipOn: string;

  // Floating welcome toast shown briefly after a brand-new signup so
  // the user has a clear "yes, your account is ready" signal instead
  // of the modal silently closing into a page that doesn't change.
  signupWelcomeTitle: string;
  signupWelcomeBody: string;

  // ── Pricing page (Screen 3) ─────────────────────────────────
  pricingPageHeadline: string;
  pricingPageSubline: string;
  billingMonthly: string;
  billingYearly: string;
  billingSave17: string;
  // tier copy
  tierBasicTagline: string;
  tierBasicPitch: string;
  tierBasicCta: string;
  tierClearTagline: string;
  tierClearPitch: string;
  tierClearBadge: string;
  tierClearCta: string;
  tierClearCtaYearly: string;
  tierClearTrust: string;
  tierDeepTagline: string;
  tierDeepPitch: string;
  tierDeepCta: string;
  // tier feature lists (joined later by ¶ delimiter; client splits)
  tierBasicFeatures: string;
  tierClearFeatures: string;
  tierDeepFeatures: string;
  // yearly subprice templates
  basicEquivalent: string; // empty for free tier, kept for symmetry
  clearEquivalent: string;
  deepEquivalent: string;
  // trust strip (4 lines)
  trustStripCancel: string;
  trustStripMoneyBack: string;
  trustStripDataYours: string;
  trustStripNoAds: string;
  // FAQ
  faqEyebrow: string;
  faqHeadline: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  faqQ5: string;
  faqA5: string;

  // ── Login Modal (Screen 4) ──────────────────────────────────
  loginWelcomeBack: string;
  loginCreateAccount: string;
  loginContinueWithGoogle: string;
  loginInAppNotice: string;
  loginOrSeparator: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  loginEmailPlaceholder: string;
  loginPasswordPlaceholder: string;
  loginSubmitSignIn: string;
  loginSubmitSignUp: string;
  loginSwitchToSignUp: string;
  loginForgotPassword: string;
  loginForgotPasswordEnterEmail: string;
  loginResetSent: string;
  loginResetError: string;
  loginSwitchToSignIn: string;
  loginShowPassword: string;
  loginHidePassword: string;
  loginCloseAria: string;
  loginSigningIn: string;
  loginCreatingAccount: string;
  // Error messages
  loginErrorWrongCredentials: string;
  loginErrorEmailInUse: string;
  loginErrorWeakPassword: string;
  // Age + terms attestation (signup only). Required to comply with
  // COPPA (US, 13+) and GDPR (EU, varies by country, 13-16). We
  // can't verify; users self-attest. The checkbox label embeds the
  // links to /terms and /privacy.
  loginAgeTermsLine: string;
  loginTermsLinkLabel: string;
  loginPrivacyLinkLabel: string;
  loginErrorAgeRequired: string;
  loginErrorInvalidEmail: string;
  loginErrorGoogleFailed: string;
  loginErrorGeneric: string;

  // ── Compose Modal (Screen 5) ────────────────────────────────
  composeEyebrow: string;
  composeTitleTemplate: Template1; // takes the word, returns "Write your own sentence with X"
  composeSubtitle: string;
  composeMeaningPickerLabel: string;
  composePlaceholder: string;
  composeSubmit: string;
  composeChecking: string;
  composeStatusPerfectLabel: string;
  composeStatusAlmostLabel: string;
  composeStatusIncorrectLabel: string;
  composeSuggestionEyebrow: string;
  composeTryAnother: string;
  composeBackToWord: string;
  composeErrorEmpty: string;
  composeErrorTooShort: string;

  // ── Quiz Modal (Screen 6) ───────────────────────────────────
  quizEyebrow: string;
  quizTitleTemplate: Template1; // word → "[word], quiz"
  quizQuestionNofM: (n: number, m: number) => string;
  quizSubmit: string;
  quizNext: string;
  quizFinish: string;
  quizYesCorrect: string;
  quizNotQuite: string;
  quizLoading: string;
  quizFinalScoreTemplate: (correct: number, total: number) => string;
  quizPracticeAnotherWord: string;
  quizBackToWord: string;
  quizReviewMistakes: string;

  // ── Notebook (Screen 8) ─────────────────────────────────────
  notebookEyebrow: string;
  notebookTitle: string;
  notebookSubtitle: string;
  /** Plain label that follows a giant numeral, e.g. "words explored"
   *  rendered under "127". Used in the Notebook hero counter. */
  notebookWordsExplored: string;
  notebookPracticeNow: string;
  notebookListView: string;
  notebookGalaxyView: string;
  notebookEmptyTitle: string;
  notebookEmptyCta: string;
  notebookRemoveAria: string;
  notebookMasteredLabel: string;
  /** template: "Saved Apr 22" or localized equivalent */
  notebookSavedOnTemplate: Template1;
  notebookLegendRecent: string;
  notebookLegendMastered: string;
  notebookLegendNeedsReview: string;

  // ── Practice / Spaced Repetition (Screen 9) ─────────────────
  srEyebrow: string;
  /** template: "Word 2 of 5", index, total */
  srWordNofMTemplate: (n: number, m: number) => string;
  srSkip: string;
  srClickToReveal: string;
  srPrimaryMeaningLabel: string;
  srExamplesLabel: string;
  srIForgot: string;
  srIKnewIt: string;
  srSchedulingHint: string;
  srWordsPracticed: string;
  /** template: "3 you knew · 2 to review again" */
  srSummaryStatTemplate: (knew: number, forgot: number) => string;
  srTomorrow: string;
  /** template: "Next review: Tomorrow (3 words due)", tomorrow text, count */
  srNextReviewTemplate: (when: string, count: number) => string;
  srDoneForToday: string;
  srPracticeMore: string;
  srEmptyTitle: string;
  srEmptyBody: string;
  srBackToNotebook: string;
  srLoading: string;

  // ── Account (Screen 10) ─────────────────────────────────────
  accountEyebrow: string;
  accountYourSpace: string;
  /** template: "Lena's space", first name */
  accountNamedSpaceTemplate: Template1;
  // Plan section
  accountPlanLabel: string;
  accountOnPlanFree: string;
  accountNoActiveSubscription: string;
  accountChooseAPlan: string;
  /** template: "14-day trial · 6 days remaining", days */
  accountTrialBadgeTemplate: Template1;
  /** template: "Renews Apr 26, 2026", date string */
  accountRenewsOnTemplate: Template1;
  accountCancelsAtPeriodEnd: string;
  accountManageBilling: string;
  accountChangePlan: string;
  accountUpgrade: string;
  /** Clear/Deep only: swap the current sub to the Family plan in place. */
  accountUpgradeToFamily: string;
  // Usage section
  accountUsageThisMonth: string;
  accountImageGeneration: string;
  accountSearches: string;
  accountLocked: string;
  accountUnlimited: string;
  accountTodaySuffix: string;
  accountNearingLimit: string;
  // Account section
  accountSectionLabel: string;
  accountEmailLabel: string;
  accountSignOut: string;
  accountDeleteAccount: string;

  // ── Report Modal (Screen 11) ────────────────────────────────
  reportEyebrow: string;
  reportTitle: string;
  reportTellMore: string;
  reportTellMorePh: string;
  reportSend: string;
  reportSending: string;
  reportThanks: string;
  reportError: string;
  // 10 category labels (keys map 1:1 to /api/report-error categories)
  reportCatIncorrectDefinition: string;
  reportCatWrongEtymology: string;
  reportCatBadExample: string;
  reportCatKidsExplanation: string;
  reportCatIdiomIssue: string;
  reportCatWrongImage: string;
  reportCatQuizWrongAnswer: string;
  reportCatComposeFeedback: string;
  reportCatCompareResult: string;
  reportCatSomethingElse: string;

  // ── Result V2: shared labels ────────────────────────────────
  generateImage: string;
  // Soft wall — shown when an anonymous visitor or basic user has hit
  // their daily quota. Two variants: anon (encourage signup, free)
  // and basic (encourage upgrade to Clear, paid).
  softWallAnonTitle: string;
  softWallSignupCta: string;
  softWallBasicTitle: string;
  reportLabel: string;

  // ── Wordbook redesign (locked April 2026) ──────────────────
  // Section eyebrows
  wordOriginEyebrow: string;
  meaningsEyebrow: string;
  idiomsEyebrow: string;
  // Word Origin structured rows
  wordOriginLanguage: string;
  wordOriginOriginallyMeant: string;
  wordOriginBackgroundLabel: string;
  wordOriginOriginalWord: string;
  wordOriginBreakdown: string;
  // Empty/loading panels on the result page
  imageGeneratingLabel: string;
  imageGeneratingHint: string;
  imageOpenFullAria: string;
  kidsComingSoon: string;
  shareDefinitionAria: string;
  // Action tile titles (single-line, no subtitles)
  actionCompose: string;
  actionCompare: string;
  // Listen / TTS
  listenToWord: string;
  // Offline pin/download
  offlineDownloadPack: string;
  offlineDownloadingPack: string;
  offlinePackHeader: string;
  offlinePackDescription: string;
  // Progress signal — "Saved · 2 days ago"
  savedAgoTemplate: Template1;
  // Aria
  shareLabel: string;
  backLabel: string;
}

/** One file per language in lib/i18n-v2-packs/ (2026-10-31); English is the fallback. */
export const V2_PACK = makePack<Partial<V2Strings>>({ en }, {
  "he": () => import("./i18n-v2-packs/he"),
  "ar": () => import("./i18n-v2-packs/ar"),
  "ru": () => import("./i18n-v2-packs/ru"),
  "es": () => import("./i18n-v2-packs/es"),
  "pt": () => import("./i18n-v2-packs/pt"),
  "fr": () => import("./i18n-v2-packs/fr"),
  "de": () => import("./i18n-v2-packs/de"),
  "cs": () => import("./i18n-v2-packs/cs"),
  "sk": () => import("./i18n-v2-packs/sk"),
  "it": () => import("./i18n-v2-packs/it"),
  "ja": () => import("./i18n-v2-packs/ja"),
  "hi": () => import("./i18n-v2-packs/hi"),
  "am": () => import("./i18n-v2-packs/am"),
  "uk": () => import("./i18n-v2-packs/uk"),
  "tr": () => import("./i18n-v2-packs/tr"),
  "pl": () => import("./i18n-v2-packs/pl"),
  "fa": () => import("./i18n-v2-packs/fa"),
  "id": () => import("./i18n-v2-packs/id"),
  "nl": () => import("./i18n-v2-packs/nl"),
  "el": () => import("./i18n-v2-packs/el"),
  "zu": () => import("./i18n-v2-packs/zu"),
  "vi": () => import("./i18n-v2-packs/vi"),
  "fil": () => import("./i18n-v2-packs/fil"),
  "af": () => import("./i18n-v2-packs/af"),
  "sw": () => import("./i18n-v2-packs/sw"),
  "zh-CN": () => import("./i18n-v2-packs/zh-CN"),
  "zh-TW": () => import("./i18n-v2-packs/zh-TW"),
  "ko": () => import("./i18n-v2-packs/ko"),
  "th": () => import("./i18n-v2-packs/th"),
  "bn": () => import("./i18n-v2-packs/bn"),
  "da": () => import("./i18n-v2-packs/da"),
  "hu": () => import("./i18n-v2-packs/hu"),
  "xh": () => import("./i18n-v2-packs/xh"),
  "nso": () => import("./i18n-v2-packs/nso"),
  "tn": () => import("./i18n-v2-packs/tn"),
  "st": () => import("./i18n-v2-packs/st"),
  "ts": () => import("./i18n-v2-packs/ts"),
  "ss": () => import("./i18n-v2-packs/ss"),
  "ve": () => import("./i18n-v2-packs/ve"),
  "nr": () => import("./i18n-v2-packs/nr"),
});


/**
 * Resolve a V2 string for a given language.
 * Falls back to English when the locale has no entry — keeps the site
 * coherent in ru/es/pt/fr while we finish translating those.
 *
 * For template entries (functions), pass the arg as the third param.
 */
export function v2<K extends keyof V2Strings>(
  lang: Lang,
  key: K,
  ...args: Array<string | number>
): string {
  const locale = V2_PACK.data[lang] ?? {};
  const val = locale[key] ?? en[key];
  if (typeof val === "function") {
    // Accept any number of args — Template1 takes one, the multi-arg
    // templates (quizQuestionNofM, quizFinalScoreTemplate) take two.
    // Function casts let us call them uniformly without losing types
    // at the consumer side.
    return (val as (...a: Array<string | number>) => string)(...args);
  }
  return val as string;
}
