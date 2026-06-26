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
 *   v2(lang, "meaningN", 1);                // template "Meaning 1"
 *   v2(lang, "doMoreWith", word);           // template
 */

import type { Lang } from "./i18n";

type Template1 = (a: string | number) => string;

export interface V2Strings {
  // ── Home: hero ──────────────────────────────────────────────
  homeHeadlineLine1: string;
  homeHeadlineLine2: string;
  homeSubline: string;

  // ── Home: search ────────────────────────────────────────────
  searchPlaceholderHome: string;
  voiceInputTitle: string;
  addContext: string;
  explain: string;
  contextHint: string;
  tryLabel: string;

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
  trustMicrocopy: string;

  // ── Home: footer ────────────────────────────────────────────
  footerProductGroup: string;
  footerLegalGroup: string;
  footerCompare: string;
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
  navCompare: string;
  navNotebook: string;
  navPricing: string;
  navFeatures: string;
  navPlay: string;
  navAffiliates: string;

  // Kids Mode toggle — a global "render every definition like a parent
  // would explain it to a child" switch. Persists in localStorage.
  // Clear/Deep only; Basic users see an UpgradeModal when they tap it.
  kidsModeLabel: string;
  kidsModeTooltipOff: string;
  kidsModeTooltipOn: string;
  kidsModeBasicGate: string;

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

  // ── Compare Page (Screen 7) ─────────────────────────────────
  compareEyebrow: string;
  compareTitle: string;
  compareSubtitle: string;
  compareWord1Label: string;
  compareWord2Label: string;
  compareWord1Placeholder: string;
  compareWord2Placeholder: string;
  compareCta: string;
  compareLoading: string;
  compareEmpty: string;
  compareDifferenceLabel: string;
  compareExamplesLabel: string;
  compareCommonMistakeLabel: string;
  // Error keys
  compareErrNotARealWord: string;
  compareErrDifferentLanguages: string;
  compareErrSameWord: string;
  compareErrGeneric: string;

  // ── Notebook (Screen 8) ─────────────────────────────────────
  notebookEyebrow: string;
  notebookTitle: string;
  notebookSubtitle: string;
  /** template: "127 words explored", number is the only arg.
   *  Kept for backward compat; new layouts prefer the split
   *  numeral + notebookWordsExplored label pair. */
  notebookCounterTemplate: Template1;
  /** Plain label that follows a giant numeral, e.g. "words explored"
   *  rendered under "127". Used in the Notebook hero counter. */
  notebookWordsExplored: string;
  notebookPracticeNow: string;
  /** template: "5 due today", number is the only arg */
  notebookDueTodayTemplate: Template1;
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
  srTapToReveal: string;
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
  accountChangeEmail: string;
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
  origin: string;
  historyNote: string;
  throughTime: string;
  forKids: string;
  commonExpressions: string;
  idiomsWithMeaning: string;
  meaningN: Template1;
  notJustPrimary: string;
  takeItFurther: string;
  doMoreWith: Template1;
  saveToNotebook: string;
  saveToNotebookHint: string;
  generateImage: string;
  generatingImage: string;
  generateImageHint: string;
  composeSentence: string;
  composeSentenceHint: string;
  practiceWord: string;
  practiceWordHint: string;
  unlockWithClear: string;
  upgradeToClear: string;
  clearUnlocksThis: string;
  // Soft wall — shown when an anonymous visitor or basic user has hit
  // their daily quota. Two variants: anon (encourage signup, free)
  // and basic (encourage upgrade to Clear, paid).
  softWallAnonTitle: string;
  softWallAnonBody: string;
  softWallSignupCta: string;
  softWallBasicTitle: string;
  softWallBasicBody: string;
  // Soft banner above the result on search 4-5 of a 5-search anon
  // window. Tells them the limit is approaching, encourages signup.
  softBannerSearchesLeft: (n: number) => string;
  visualizeThisWord: string;
  visualBlurb: string;
  visualBlurbLocked: string;
  reportLabel: string;

  // ── Wordbook redesign (locked April 2026) ──────────────────
  // Section eyebrows
  wordOriginEyebrow: string;
  visualEyebrow: string;
  meaningsEyebrow: string;
  takeItFurtherEyebrow: string;
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
  compareComingSoon: string;
  shareDefinitionAria: string;
  // Action tile titles (single-line, no subtitles)
  actionCompose: string;
  actionQuiz: string;
  actionCompare: string;
  actionKidsExplanation: string;
  // Word Book save states
  saveToWordBook: string;
  savedToWordBook: string;
  // Listen / TTS
  listenToWord: string;
  // Offline pin/download
  offlinePin: string;
  offlinePinned: string;
  offlinePinTitle: string;
  offlinePinnedTitle: string;
  offlineDownloadPack: string;
  offlineDownloadingPack: string;
  offlinePackHeader: string;
  offlinePackDescription: string;
  // Visual empty state
  visualEmptyLabel: string;
  generateLabel: string;
  // Progress signal — "Saved · 2 days ago"
  savedAgoTemplate: Template1;
  // Aria
  shareLabel: string;
  backLabel: string;
}

const en: V2Strings = {
  homeHeadlineLine1: "Understand",
  homeHeadlineLine2: "to the end.",
  homeSubline:
    "A dictionary that meets you in context, meanings, origins, idioms, and a vivid image, in 11 languages.",

  searchPlaceholderHome: "Type a word",
  voiceInputTitle: "Dictate a word",
  addContext: "Add context",
  explain: "Explain",
  contextHint:
    "Reading something? Paste the sentence to disambiguate meaning.",
  tryLabel: "Try",

  valuePropsEyebrow: "What Gadit does differently",
  valuePropsTitle: "More than a definition, a way to live with a word.",
  valueProp1Eyebrow: "Context-aware",
  valueProp1Title: "The right meaning, every time",
  valueProp1Body:
    "Paste a sentence, Gadit picks the sense that fits, not just the most common one.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "A vivid image, just for this word",
  valueProp2Body:
    "Generated for each entry. A visual anchor for how a word feels, not a stock photo.",
  valueProp3Eyebrow: "Etymology",
  valueProp3Title: "A history note, not a Wikipedia dump",
  valueProp3Body:
    "Where the word came from, told as a paragraph, the kind a curious friend would write.",
  valueProp4Eyebrow: "11 languages",
  valueProp4Title: "Hebrew & Arabic, fully native",
  valueProp4Body:
    "Real RTL, real fonts, real idioms, not a translated UI bolted on.",

  previewLabel: "Preview",
  seeFullResult: "See the full result",

  pricingEyebrow: "Pricing",
  pricingTeaserTitle: "Three tiers. All with real content.",
  trustMicrocopy:
    "Cancel anytime · 14-day trial on Clear monthly · No charge until trial ends",

  footerProductGroup: "Product",
  footerLegalGroup: "Legal",
  footerCompare: "Compare",
  footerNotebook: "Notebook",
  footerPricing: "Pricing",
  footerPrivacy: "Privacy",
  footerTerms: "Terms",
  footerContact: "Help",
  footerTagline: "A smart dictionary for 11 languages. Built for real reading.",
  footerLanguagesNote: "11 languages",

  signIn: "Sign in",
  startFree: "Start free",
  verbStampDef: "to understand a word, fully",
  navSearch: "Search",
  navCompare: "Compare",
  navNotebook: "Notebook",
  navPricing: "Pricing",
  navFeatures: "Features",
  navPlay: "Play",
  navAffiliates: "Affiliates",

  kidsModeLabel: "Kids",
  kidsModeTooltipOff: "Tap to explain every word like a parent would to a child.",
  kidsModeTooltipOn: "Kids mode is on, every definition will be written for a child. Tap to turn off.",
  kidsModeBasicGate: "Kids mode is a Clear feature. Upgrade to use it.",

  signupWelcomeTitle: "Welcome to Gadit!",
  signupWelcomeBody: "Your account is ready. Start by searching any word.",

  // Pricing page (Screen 3)
  pricingPageHeadline: "Three tiers. All with real content.",
  pricingPageSubline: "Start free. Upgrade when the depth helps you.",
  billingMonthly: "Monthly",
  billingYearly: "Yearly",
  billingSave17: "Save 17%",

  tierBasicTagline: "Understand",
  tierBasicPitch: "Start with the essentials.",
  tierBasicCta: "Get started",
  tierBasicFeatures:
    "20 word searches per day¶All meanings (not just primary)¶3 examples per meaning¶Etymology and origin¶Sign-in required",

  tierClearTagline: "Visualize",
  tierClearPitch:
    "Bring words to life with images, kids mode, and feedback.",
  tierClearBadge: "Most popular",
  tierClearCta: "Start 14-day free trial",
  tierClearCtaYearly: "Subscribe yearly",
  tierClearTrust: "Cancel anytime · No charge during trial",
  tierClearFeatures:
    "Everything in Basic¶Unlimited searches¶Kids explanations¶Image for every word (30/month)¶Write a sentence and get feedback¶Idioms and expressions¶Search history (last 30 days)",

  tierDeepTagline: "Practice",
  tierDeepPitch:
    "Build a personal vocabulary library that gets stronger over time.",
  tierDeepCta: "Subscribe to Deep",
  tierDeepFeatures:
    "Everything in Clear¶Practice quizzes¶Personal word notebook¶Smart practice for vocabulary that lasts¶Tell similar words apart¶Image for every word (100/month)",

  basicEquivalent: "",
  clearEquivalent: "Equivalent to $2.50/mo",
  deepEquivalent: "Equivalent to $4.17/mo",

  trustStripCancel: "Cancel anytime through Stripe portal",
  trustStripMoneyBack: "14-day money-back on first purchase",
  trustStripDataYours: "Your data is yours, export anytime",
  trustStripNoAds: "No ads, no third-party tracking",

  faqEyebrow: "FAQ",
  faqHeadline: "Questions, answered",
  faqQ1: "Can I switch plans?",
  faqA1:
    "Yes, upgrade or downgrade anytime. Proration is handled automatically, you only pay the difference.",
  faqQ2: "What happens if I cancel?",
  faqA2:
    "You keep access until the end of your billing period, then revert to Basic. No data is lost.",
  faqQ3: "Is the trial really free?",
  faqA3:
    "Yes. We require a card to prevent abuse, but you're not charged until day 15. Cancel before then = zero cost.",
  faqQ4: "Why three tiers?",
  faqA4:
    "Different users need different depth. We'd rather meet you where you are than upsell a single bloated plan.",
  faqQ5: "Are kids' explanations safe?",
  faqA5:
    "Yes. They're AI-generated with the same care as adult content, reviewed by our content rules. No user-generated child content.",

  // Login Modal (Screen 4)
  loginWelcomeBack: "Sign in",
  loginCreateAccount: "Create your account",
  loginContinueWithGoogle: "Continue with Google",
  loginInAppNotice: "Inside {app}, sign in with email below. For the Google option, open this link in your browser.",
  loginOrSeparator: "or",
  loginEmailLabel: "Email",
  loginPasswordLabel: "Password",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Sign in",
  loginSubmitSignUp: "Create account",
  loginSwitchToSignUp: "Don't have an account? Sign up",
  loginForgotPassword: "Forgot password?",
  loginForgotPasswordEnterEmail: "Enter your email above first, then tap here.",
  loginResetSent: "If an account exists for that email, a reset link is on its way.",
  loginResetError: "Couldn't send the reset email. Try again.",
  loginSwitchToSignIn: "Already have an account? Sign in",
  loginShowPassword: "Show password",
  loginHidePassword: "Hide password",
  loginCloseAria: "Close",
  loginSigningIn: "Signing in…",
  loginCreatingAccount: "Creating account…",
  loginErrorWrongCredentials: "Wrong email or password.",
  loginErrorEmailInUse: "Email already in use. Try logging in.",
  loginErrorWeakPassword: "Password must be at least 8 characters and include a letter and a number.",
  loginAgeTermsLine: "I'm 13 or older and I agree to the",
  loginTermsLinkLabel: "Terms",
  loginPrivacyLinkLabel: "Privacy Policy",
  loginErrorAgeRequired: "Please confirm you're 13 or older and agree to the Terms and Privacy Policy.",
  loginErrorInvalidEmail: "Please enter a valid email address.",
  loginErrorGoogleFailed: "Could not sign in with Google. Try again.",
  loginErrorGeneric: "Something went wrong. Try again.",

  // Compose Modal (Screen 5)
  composeEyebrow: "Compose",
  composeTitleTemplate: (w) => `Write your own sentence with ${w}`,
  composeSubtitle:
    "Use it in a sentence and get instant feedback on grammar, tone, and fit.",
  composeMeaningPickerLabel: "Pick the meaning you're practicing",
  composePlaceholder: "Type your sentence here…",
  composeSubmit: "Check sentence",
  composeChecking: "Checking…",
  composeStatusPerfectLabel: "Perfect",
  composeStatusAlmostLabel: "Almost there",
  composeStatusIncorrectLabel: "Not quite",
  composeSuggestionEyebrow: "Suggested rewrite",
  composeTryAnother: "Try another sentence",
  composeBackToWord: "Back to word",
  composeErrorEmpty: "Please write a sentence first.",
  composeErrorTooShort: "Please write at least a few words.",

  // Quiz Modal (Screen 6)
  quizEyebrow: "Practice",
  quizTitleTemplate: (w) => `${w}, quiz`,
  quizQuestionNofM: (n, m) => `Question ${n} of ${m}`,
  quizSubmit: "Submit",
  quizNext: "Next question",
  quizFinish: "Finish",
  quizYesCorrect: "Yes, correct",
  quizNotQuite: "Not quite",
  quizLoading: "Preparing your quiz…",
  quizFinalScoreTemplate: (c, t) => `You got ${c} out of ${t} correct.`,
  quizPracticeAnotherWord: "Practice another word",
  quizBackToWord: "Back to word",
  quizReviewMistakes: "Review the ones I missed",

  // Compare Page (Screen 7)
  compareEyebrow: "Compare",
  compareTitle: "Tell similar words apart",
  compareSubtitle:
    "affect vs effect, אומנות vs אמנות, principle vs principal, the words that catch even native speakers.",
  compareWord1Label: "Word 1",
  compareWord2Label: "Word 2",
  compareWord1Placeholder: "affect",
  compareWord2Placeholder: "effect",
  compareCta: "Compare",
  compareLoading: "Comparing…",
  compareEmpty: "Enter two words to compare them",
  compareDifferenceLabel: "The difference",
  compareExamplesLabel: "Examples",
  compareCommonMistakeLabel: "Common mistake",
  compareErrNotARealWord: "We don't recognize one of those words.",
  compareErrDifferentLanguages:
    "These two words seem to be in different languages, try a matched pair.",
  compareErrSameWord: "These look like the same word, try two different ones.",
  compareErrGeneric: "Compare unavailable right now.",

  // Notebook (Screen 8)
  notebookEyebrow: "Notebook",
  notebookTitle: "Your universe of words",
  notebookSubtitle:
    "Every word you've explored, kept, organized, growing.",
  notebookCounterTemplate: (n) => `${n} words explored`,
  notebookWordsExplored: "words explored",
  notebookPracticeNow: "Practice now",
  notebookDueTodayTemplate: (n) => `${n} due today`,
  notebookListView: "List",
  notebookGalaxyView: "Galaxy",
  notebookEmptyTitle: "Your notebook is empty",
  notebookEmptyCta: "Search a word to begin",
  notebookRemoveAria: "Remove",
  notebookMasteredLabel: "★ Mastered",
  notebookSavedOnTemplate: (d) => `Saved ${d}`,
  notebookLegendRecent: "Recently saved",
  notebookLegendMastered: "Mastered",
  notebookLegendNeedsReview: "Needs review",

  // Practice / Spaced Repetition (Screen 9)
  srEyebrow: "Practice",
  srWordNofMTemplate: (n, m) => `Word ${n} of ${m}`,
  srSkip: "Skip",
  srClickToReveal: "Click anywhere to reveal",
  srTapToReveal: "Tap to reveal",
  srPrimaryMeaningLabel: "Primary meaning",
  srExamplesLabel: "Examples",
  srIForgot: "I forgot",
  srIKnewIt: "I knew it",
  srSchedulingHint:
    "I knew it = next review in a few days. I forgot = back to today.",
  srWordsPracticed: "words practiced",
  srSummaryStatTemplate: (k, f) => `${k} you knew · ${f} to review again`,
  srTomorrow: "Tomorrow",
  srNextReviewTemplate: (when, count) =>
    `Next review: ${when} (${count} ${count === 1 ? "word" : "words"} due)`,
  srDoneForToday: "Done for today",
  srPracticeMore: "Practice more",
  srEmptyTitle: "Nothing to review today",
  srEmptyBody: "Well done. Come back tomorrow.",
  srBackToNotebook: "Back to notebook",
  srLoading: "Loading your practice…",

  // Account (Screen 10)
  accountEyebrow: "Account",
  accountYourSpace: "Your space",
  accountNamedSpaceTemplate: (n) => `${n}'s space`,
  accountPlanLabel: "Plan",
  accountOnPlanFree: "Free",
  accountNoActiveSubscription: "No active subscription",
  accountChooseAPlan: "Choose a plan to get started.",
  accountTrialBadgeTemplate: (d) =>
    `14-day trial · ${d} ${Number(d) === 1 ? "day" : "days"} remaining`,
  accountRenewsOnTemplate: (d) => `Renews ${d}`,
  accountCancelsAtPeriodEnd: "Cancels at the end of the billing period",
  accountManageBilling: "Manage billing",
  accountChangePlan: "Change plan",
  accountUpgrade: "Upgrade",
  accountUsageThisMonth: "Usage this month",
  accountImageGeneration: "Image generation",
  accountSearches: "Searches",
  accountLocked: "Locked",
  accountUnlimited: "unlimited",
  accountTodaySuffix: "today",
  accountNearingLimit: "Approaching this month's limit.",
  accountSectionLabel: "Account",
  accountEmailLabel: "Email",
  accountChangeEmail: "Change email",
  accountSignOut: "Sign out",
  accountDeleteAccount: "Delete account",

  // Report Modal (Screen 11)
  reportEyebrow: "Report an error",
  reportTitle: "What's wrong?",
  reportTellMore: "Tell us more",
  reportTellMorePh: "Optional. The more specific, the faster we can fix it.",
  reportSend: "Send report",
  reportSending: "Sending…",
  reportThanks: "Thanks, we got it.",
  reportError: "Could not send. Try again in a moment.",
  reportCatIncorrectDefinition: "Incorrect definition",
  reportCatWrongEtymology: "Wrong etymology",
  reportCatBadExample: "Bad example sentence",
  reportCatKidsExplanation: "Kids explanation issue",
  reportCatIdiomIssue: "Idiom issue",
  reportCatWrongImage: "Wrong image",
  reportCatQuizWrongAnswer: "Quiz: wrong answer marked",
  reportCatComposeFeedback: "Compose feedback issue",
  reportCatCompareResult: "Compare result issue",
  reportCatSomethingElse: "Something else",

  origin: "Origin",
  historyNote: "History note",
  throughTime: "Through time",
  forKids: "For kids",
  commonExpressions: "Common expressions",
  idiomsWithMeaning: "Idioms with this meaning",
  meaningN: (n) => `Meaning ${n}`,
  notJustPrimary: "Not just the primary one",
  takeItFurther: "Take it further",
  doMoreWith: (w) => `Do more with ${w}`,
  saveToNotebook: "Save to notebook",
  saveToNotebookHint: "Return to it later, organized, searchable.",
  generateImage: "Generate image",
  generatingImage: "Generating…",
  generateImageHint: "A vivid AI-made visual, just for this word.",
  composeSentence: "Compose a sentence",
  composeSentenceHint: "Write your own, Gadit reviews for tone and fit.",
  practiceWord: "Practice this word",
  practiceWordHint: "A short quiz tuned to how you learn.",
  unlockWithClear: "Unlock with Clear",
  upgradeToClear: "Upgrade to Clear",
  softWallAnonTitle: "You've used your free searches",
  softWallAnonBody:
    "Sign up free to search up to 20 words a day, with full definitions, examples, idioms and word origin.",
  softWallSignupCta: "Sign up, it's free",
  softWallBasicTitle: "You've reached today's limit",
  softWallBasicBody:
    "Free accounts get 20 searches per day. The limit resets tomorrow, or upgrade to Clear for unlimited searches plus images, kids mode, and grammar feedback.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "1 free search left today, sign up free to get 20 a day."
      : `${n} free searches left today, sign up free to get 20 a day.`,
  clearUnlocksThis: "Clear unlocks this",
  visualizeThisWord: "Visualize",
  visualBlurb:
    "One vivid image, generated by Gadit, a visual anchor for how this word feels.",
  visualBlurbLocked:
    "Generate a vivid, one-of-a-kind image for this word, understanding through sight.",
  reportLabel: "Report an error",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "Word Origin",
  idiomsEyebrow: "Idioms & expressions",
  wordOriginBackgroundLabel: "Background",
  wordOriginOriginalWord: "Original word",
  wordOriginBreakdown: "Word parts",
  imageGeneratingLabel: "Generating image…",
  imageGeneratingHint: "This usually takes 10 to 15 seconds.",
  imageOpenFullAria: "Open image full size",
  kidsComingSoon: "Kids' explanation coming soon.",
  compareComingSoon: "Word games coming soon.",
  shareDefinitionAria: "Share this definition",
  visualEyebrow: "Visual",
  meaningsEyebrow: "Definitions",
  takeItFurtherEyebrow: "Take it further",
  wordOriginLanguage: "Language",
  wordOriginOriginallyMeant: "Originally meant",
  actionCompose: "Compose a sentence",
  actionQuiz: "Quiz",
  actionCompare: "Compare words",
  actionKidsExplanation: "Kids' explanation",
  saveToWordBook: "Save to Notebook",
  savedToWordBook: "Saved to Notebook",
  listenToWord: "Listen",
  offlinePin: "Save offline",
  offlinePinned: "Saved offline",
  offlinePinTitle: "Save this word for offline study",
  offlinePinnedTitle: "Saved, available without WiFi",
  offlineDownloadPack: "Download offline pack",
  offlineDownloadingPack: "Downloading…",
  offlinePackHeader: "Offline pack",
  offlinePackDescription: "Adds the most-searched words in your language to your Notebook, and keeps them available without WiFi for offline study.",
  visualEmptyLabel: "An image will be drawn for this word",
  generateLabel: "Generate",
  savedAgoTemplate: (t) => `Saved · ${t}`,
  shareLabel: "Share",
  backLabel: "Back",
};

const he: V2Strings = {
  homeHeadlineLine1: "להבין",
  homeHeadlineLine2: "עד הסוף.",
  homeSubline:
    "מילון שמבין הקשר, הגדרות, מקור, ביטויים ותמונה חיה, ב־11 שפות.",

  searchPlaceholderHome: "הקלידו מילה",
  voiceInputTitle: "הכתבת מילה",
  addContext: "הוסיפו הקשר",
  explain: "הסבר",
  contextHint:
    "קוראים משהו? הדביקו את המשפט שהמילה מופיעה בו, Gadit יבחר את המשמעות הנכונה.",
  tryLabel: "נסו",

  valuePropsEyebrow: "מה Gadit עושה אחרת",
  valuePropsTitle: "יותר מהגדרה, דרך לחיות עם המילה.",
  valueProp1Eyebrow: "מודע להקשר",
  valueProp1Title: "המשמעות הנכונה, בכל פעם",
  valueProp1Body:
    "הדביקו משפט, Gadit יבחר את המשמעות שמתאימה, לא רק את הנפוצה.",
  valueProp2Eyebrow: "ויזואלי",
  valueProp2Title: "תמונה חיה, במיוחד למילה הזו",
  valueProp2Body:
    "נוצרת לכל ערך. עוגן ויזואלי לתחושת המילה, לא תמונת סטוק.",
  valueProp3Eyebrow: "אטימולוגיה",
  valueProp3Title: "הערה היסטורית, לא ויקיפדיה",
  valueProp3Body:
    "מאיפה המילה הגיעה, מסופר כפסקה, כמו שחבר סקרן היה כותב.",
  valueProp4Eyebrow: "11 שפות",
  valueProp4Title: "עברית וערבית כשפות אם",
  valueProp4Body:
    "RTL אמיתי, גופנים אמיתיים, ביטויים אמיתיים, לא ממשק מתורגם.",

  previewLabel: "תצוגה מקדימה",
  seeFullResult: "ראו תוצאה מלאה",

  pricingEyebrow: "תמחור",
  pricingTeaserTitle: "שלוש רמות. כולן עם תוכן אמיתי.",
  trustMicrocopy:
    "ביטול בכל עת · ניסיון 14 ימים על Clear חודשי · ללא חיוב עד סוף הניסיון",

  footerProductGroup: "מוצר",
  footerLegalGroup: "משפטי",
  footerCompare: "השוואה",
  footerNotebook: "מחברת",
  footerPricing: "תמחור",
  footerPrivacy: "פרטיות",
  footerTerms: "תנאים",
  footerContact: "עזרה",
  footerTagline: "מילון חכם ל־11 שפות. בנוי לקריאה אמיתית.",
  footerLanguagesNote: "11 שפות",

  signIn: "התחברות",
  startFree: "התחילו חינם",
  verbStampDef: "להבין מילה עד הסוף",
  navSearch: "חיפוש",
  navCompare: "השוואה",
  navNotebook: "מחברת",
  navPricing: "תמחור",
  navFeatures: "פיצ'רים",
  navPlay: "משחקים",
  navAffiliates: "שותפים",

  kidsModeLabel: "ילדים",
  kidsModeTooltipOff: "לחצו כדי שכל מילה תוסבר כמו שהורה היה מסביר לילד.",
  kidsModeTooltipOn: "מצב ילדים פעיל. כל הגדרה תיכתב לילד. לחצו לכיבוי.",
  kidsModeBasicGate: "מצב ילדים הוא פיצ'ר של Clear. שדרגו כדי להשתמש בו.",

  signupWelcomeTitle: "ברוכים הבאים ל-Gadit!",
  signupWelcomeBody: "החשבון שלכם מוכן. התחילו עם חיפוש של כל מילה.",

  // Pricing page (Screen 3)
  pricingPageHeadline: "שלוש רמות. כולן עם תוכן אמיתי.",
  pricingPageSubline: "התחילו חינם. שדרגו כשהעומק מועיל לכם.",
  billingMonthly: "חודשי",
  billingYearly: "שנתי",
  billingSave17: "חסכון 17%",

  tierBasicTagline: "להבין",
  tierBasicPitch: "התחילו עם היסודות.",
  tierBasicCta: "התחילו עכשיו",
  tierBasicFeatures:
    "20 חיפושי מילים ביום¶כל ההגדרות למילה¶דוגמאות של משפטים לפי הקשר¶ניבים וצירופי מילים¶מקור המילה",

  tierClearTagline: "לראות",
  tierClearPitch: "החיו את המילים, תמונות, הסבר לילדים ומשוב.",
  tierClearBadge: "הכי פופולרי",
  tierClearCta: "נסיון חינם ל־14 ימים",
  tierClearCtaYearly: "הרשמה שנתית",
  tierClearTrust: "ביטול בכל עת · ללא חיוב בתקופת הניסיון",
  tierClearFeatures:
    "כל מה שיש ב־Basic¶חיפושים ללא הגבלה¶הסבר לילדים¶יצירת תמונות (30 בחודש)¶חיבור משפטים וקבלת משוב¶ביטויים וצירופי מילים¶היסטוריית חיפוש (30 ימים אחרונים)",

  tierDeepTagline: "לתרגל",
  tierDeepPitch: "בנו אוצר מילים אישי שמתחזק עם הזמן.",
  tierDeepCta: "הרשמה ל־Deep",
  tierDeepFeatures:
    "כל מה שיש ב־Clear¶תרגולים ומבחנים¶מחברת מילים אישית¶תרגול חכם לאוצר מילים יציב¶הבהרת מילים דומות¶יצירת תמונות (100 בחודש)",

  basicEquivalent: "",
  clearEquivalent: "$2.50 לחודש בממוצע",
  deepEquivalent: "$4.17 לחודש בממוצע",

  trustStripCancel: "ביטול בכל עת דרך פורטל Stripe",
  trustStripMoneyBack: "החזר כספי תוך 14 ימים ברכישה ראשונה",
  trustStripDataYours: "הנתונים שלכם, ייצוא מתי שתרצו",
  trustStripNoAds: "ללא פרסומות וללא מעקב צד ג׳",

  faqEyebrow: "שאלות שכיחות",
  faqHeadline: "שאלות, תשובות.",
  faqQ1: "אפשר להחליף תוכנית?",
  faqA1:
    "כן, אפשר לשדרג או לרדת בכל עת. החיוב היחסי מטופל אוטומטית, תשלמו רק את ההפרש.",
  faqQ2: "מה קורה אם אני מבטל?",
  faqA2:
    "הגישה נשמרת עד סוף תקופת החיוב, ואז חוזרים ל־Basic. שום נתון לא הולך לאיבוד.",
  faqQ3: "הניסיון באמת חינם?",
  faqA3:
    "כן. אנחנו דורשים כרטיס כדי למנוע ניצול, אבל החיוב מתחיל רק ביום ה־15. ביטול לפני כן = אפס עלות.",
  faqQ4: "למה שלוש רמות?",
  faqA4:
    "משתמשים שונים צריכים עומק שונה. עדיף לנו לפגוש אתכם איפה שאתם מאשר למכור תוכנית אחת מנופחת.",
  faqQ5: "ההסברים לילדים בטוחים?",
  faqA5:
    "כן. הם נוצרים ב־AI באותה זהירות כמו תוכן למבוגרים, ועוברים סקירה לפי כללי התוכן שלנו. אין תוכן ילדים ממשתמשים.",

  // Login Modal (Screen 4)
  loginWelcomeBack: "התחברות",
  loginCreateAccount: "צרו חשבון",
  loginContinueWithGoogle: "המשיכו עם Google",
  loginInAppNotice: "בתוך {app} אפשר להירשם דרך אימייל למטה. כדי לקבל את אפשרות Google, פותחים את הקישור בדפדפן.",
  loginOrSeparator: "או",
  loginEmailLabel: "אימייל",
  loginPasswordLabel: "סיסמה",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "התחברות",
  loginSubmitSignUp: "צרו חשבון",
  loginSwitchToSignUp: "אין חשבון? הירשמו",
  loginForgotPassword: "שכחתם סיסמה?",
  loginForgotPasswordEnterEmail: "הקלידו את האימייל למעלה תחילה, ואז לחצו כאן.",
  loginResetSent: "אם קיים חשבון עם המייל הזה, נשלח אליו קישור לאיפוס סיסמה.",
  loginResetError: "לא הצלחנו לשלוח את מייל האיפוס. נסו שוב.",
  loginSwitchToSignIn: "כבר רשומים? התחברו",
  loginShowPassword: "הצגת סיסמה",
  loginHidePassword: "הסתרת סיסמה",
  loginCloseAria: "סגירה",
  loginSigningIn: "מתחברים…",
  loginCreatingAccount: "יוצרים חשבון…",
  loginErrorWrongCredentials: "אימייל או סיסמה שגויים.",
  loginErrorEmailInUse: "האימייל כבר בשימוש. נסו להתחבר.",
  loginErrorWeakPassword: "הסיסמה חייבת להכיל לפחות 8 תווים, אות אחת ומספר אחד.",
  loginAgeTermsLine: "אני בן/בת 13 ומעלה ומסכים/ה ל",
  loginTermsLinkLabel: "תנאים",
  loginPrivacyLinkLabel: "מדיניות פרטיות",
  loginErrorAgeRequired: "יש לאשר שאתם בני 13 ומעלה ומסכימים לתנאים ולמדיניות הפרטיות.",
  loginErrorInvalidEmail: "אנא הזינו כתובת אימייל תקינה.",
  loginErrorGoogleFailed: "ההתחברות עם Google נכשלה. נסו שוב.",
  loginErrorGeneric: "משהו השתבש. נסו שוב.",

  // Compose Modal (Screen 5)
  composeEyebrow: "כתיבה",
  composeTitleTemplate: (w) => `כתבו משפט משלכם עם ${w}`,
  composeSubtitle:
    "השתמשו במילה במשפט וקבלו משוב מיידי על דקדוק, טון, והתאמה.",
  composeMeaningPickerLabel: "בחרו את המשמעות שאתם מתאמנים עליה",
  composePlaceholder: "כתבו את המשפט שלכם כאן…",
  composeSubmit: "בדיקת המשפט",
  composeChecking: "בודק…",
  composeStatusPerfectLabel: "מצוין",
  composeStatusAlmostLabel: "כמעט שם",
  composeStatusIncorrectLabel: "לא מדויק",
  composeSuggestionEyebrow: "ניסוח מומלץ",
  composeTryAnother: "ננסה משפט נוסף",
  composeBackToWord: "חזרה למילה",
  composeErrorEmpty: "כתבו תחילה משפט.",
  composeErrorTooShort: "כתבו לפחות כמה מילים.",

  // Quiz Modal (Screen 6)
  quizEyebrow: "תרגול",
  quizTitleTemplate: (w) => `${w}, תרגול`,
  quizQuestionNofM: (n, m) => `שאלה ${n} מתוך ${m}`,
  quizSubmit: "בדיקה",
  quizNext: "שאלה הבאה",
  quizFinish: "סיום",
  quizYesCorrect: "נכון, כל הכבוד",
  quizNotQuite: "לא לגמרי",
  quizLoading: "מכינים חידון…",
  quizFinalScoreTemplate: (c, t) => `ענית נכון על ${c} מתוך ${t}.`,
  quizPracticeAnotherWord: "תרגול מילה נוספת",
  quizBackToWord: "חזרה למילה",
  quizReviewMistakes: "סקירת הטעויות",

  // Compare Page (Screen 7)
  compareEyebrow: "השוואה",
  compareTitle: "הבחינו בין מילים דומות",
  compareSubtitle:
    "אומנות מול אמנות, affect מול effect, המילים שמבלבלות אפילו דוברים שוטפים.",
  compareWord1Label: "מילה 1",
  compareWord2Label: "מילה 2",
  compareWord1Placeholder: "אומנות",
  compareWord2Placeholder: "אמנות",
  compareCta: "השוואה",
  compareLoading: "משווים…",
  compareEmpty: "הזינו שתי מילים להשוואה",
  compareDifferenceLabel: "ההבדל",
  compareExamplesLabel: "דוגמאות",
  compareCommonMistakeLabel: "טעות נפוצה",
  compareErrNotARealWord: "אחת מהמילים אינה מוכרת לנו.",
  compareErrDifferentLanguages:
    "שתי המילים נראות בשפות שונות, נסו זוג תואם.",
  compareErrSameWord:
    "אלו נראות כאותה מילה, נסו שתי מילים שונות.",
  compareErrGeneric: "ההשוואה אינה זמינה כרגע.",

  // Notebook (Screen 8)
  notebookEyebrow: "מחברת",
  notebookTitle: "יקום המילים שלכם",
  notebookSubtitle:
    "כל מילה שלמדתם, נשמרת, מאורגנת, גדלה.",
  notebookCounterTemplate: (n) => `${n} מילים שנלמדו`,
  notebookWordsExplored: "מילים שנלמדו",
  notebookPracticeNow: "תרגול עכשיו",
  notebookDueTodayTemplate: (n) => `${n} לתרגול היום`,
  notebookListView: "רשימה",
  notebookGalaxyView: "גלקסיה",
  notebookEmptyTitle: "המחברת ריקה",
  notebookEmptyCta: "חפשו מילה כדי להתחיל",
  notebookRemoveAria: "הסרה",
  notebookMasteredLabel: "★ נשלט",
  notebookSavedOnTemplate: (d) => `נשמר ב־${d}`,
  notebookLegendRecent: "נשמר לאחרונה",
  notebookLegendMastered: "נשלט",
  notebookLegendNeedsReview: "צריך תרגול",

  // Practice / Spaced Repetition (Screen 9)
  srEyebrow: "תרגול",
  srWordNofMTemplate: (n, m) => `מילה ${n} מתוך ${m}`,
  srSkip: "דילוג",
  srClickToReveal: "לחצו כדי לראות",
  srTapToReveal: "הקישו כדי לראות",
  srPrimaryMeaningLabel: "משמעות עיקרית",
  srExamplesLabel: "דוגמאות",
  srIForgot: "שכחתי",
  srIKnewIt: "ידעתי",
  srSchedulingHint:
    "ידעתי = תרגול הבא בעוד כמה ימים. שכחתי = חזרה להיום.",
  srWordsPracticed: "מילים שתרגלתם",
  srSummaryStatTemplate: (k, f) => `ידעתם ${k} · ${f} לתרגול נוסף`,
  srTomorrow: "מחר",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    return `התרגול הבא: ${when} (${n === 1 ? "מילה אחת" : `${n} מילים`})`;
  },
  srDoneForToday: "סיימתי להיום",
  srPracticeMore: "תרגול נוסף",
  srEmptyTitle: "אין מה לתרגל היום",
  srEmptyBody: "כל הכבוד. חזרו מחר.",
  srBackToNotebook: "חזרה למחברת",
  srLoading: "טוענים את התרגול…",

  // Account (Screen 10)
  accountEyebrow: "חשבון",
  accountYourSpace: "המרחב שלכם",
  accountNamedSpaceTemplate: (n) => `המרחב של ${n}`,
  accountPlanLabel: "תוכנית",
  accountOnPlanFree: "Free",
  accountNoActiveSubscription: "אין מנוי פעיל",
  accountChooseAPlan: "בחרו תוכנית כדי להתחיל.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    return `תקופת ניסיון 14 ימים · ${n === 1 ? "יום אחד" : `${n} ימים`} שנותרו`;
  },
  accountRenewsOnTemplate: (d) => `מתחדש ב־${d}`,
  accountCancelsAtPeriodEnd: "מבוטל בסוף תקופת החיוב",
  accountManageBilling: "ניהול חיוב",
  accountChangePlan: "שינוי תוכנית",
  accountUpgrade: "שדרוג",
  accountUsageThisMonth: "שימוש החודש",
  accountImageGeneration: "יצירת תמונות",
  accountSearches: "חיפושים",
  accountLocked: "נעול",
  accountUnlimited: "ללא הגבלה",
  accountTodaySuffix: "היום",
  accountNearingLimit: "מתקרבים לגבול החודשי.",
  accountSectionLabel: "חשבון",
  accountEmailLabel: "אימייל",
  accountChangeEmail: "שינוי אימייל",
  accountSignOut: "התנתקות",
  accountDeleteAccount: "מחיקת חשבון",

  // Report Modal (Screen 11)
  reportEyebrow: "דווח על שגיאה",
  reportTitle: "מה לא בסדר?",
  reportTellMore: "ספרו עוד",
  reportTellMorePh: "אופציונלי. ככל שמפורט יותר, כך נתקן מהר יותר.",
  reportSend: "שליחת דיווח",
  reportSending: "שולחים…",
  reportThanks: "תודה, קיבלנו.",
  reportError: "לא הצלחנו לשלוח. נסו שוב עוד רגע.",
  reportCatIncorrectDefinition: "הגדרה שגויה",
  reportCatWrongEtymology: "אטימולוגיה שגויה",
  reportCatBadExample: "משפט דוגמה לא טוב",
  reportCatKidsExplanation: "בעיה בהסבר לילדים",
  reportCatIdiomIssue: "בעיה בניב",
  reportCatWrongImage: "תמונה שגויה",
  reportCatQuizWrongAnswer: "תרגול: סומנה תשובה שגויה",
  reportCatComposeFeedback: "בעיה במשוב על משפט",
  reportCatCompareResult: "בעיה בהשוואה",
  reportCatSomethingElse: "משהו אחר",

  origin: "מקור",
  historyNote: "הערה היסטורית",
  throughTime: "דרך הזמן",
  forKids: "לילדים",
  commonExpressions: "ביטויים נפוצים",
  idiomsWithMeaning: "ביטויים במשמעות הזו",
  meaningN: (n) => `משמעות ${n}`,
  notJustPrimary: "לא רק הראשונה",
  takeItFurther: "להעמיק",
  doMoreWith: (w) => `עוד עם ${w}`,
  saveToNotebook: "שמירה למחברת",
  saveToNotebookHint: "חזרו אליה אחר־כך, מאורגנת וזמינה לחיפוש.",
  generateImage: "צרו תמונה",
  generatingImage: "יוצרים…",
  generateImageHint: "תמונה חיה שנוצרת ב־AI, במיוחד למילה הזו.",
  composeSentence: "חברו משפט",
  composeSentenceHint: "כתבו משלכם, Gadit ייתן משוב על טון והקשר.",
  practiceWord: "תרגלו את המילה",
  practiceWordHint: "שאלון קצר שמותאם לאופן הלמידה שלכם.",
  unlockWithClear: "פתחו עם Clear",
  upgradeToClear: "שדרגו ל־Clear",
  softWallAnonTitle: "ניצלתם את החיפושים החינמיים",
  softWallAnonBody:
    "הירשמו חינם וחפשו עד 20 מילים ביום, עם הגדרות מלאות, דוגמאות, ניבים ומקור המילה.",
  softWallSignupCta: "הרשמה חינם",
  softWallBasicTitle: "הגעתם למכסה היומית",
  softWallBasicBody:
    "חשבון חינם כולל 20 חיפושים ביום. המכסה מתאפסת מחר, או שדרגו ל־Clear לחיפושים ללא הגבלה, תמונות, מצב ילדים ומשוב על משפטים.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "נשאר חיפוש חינמי אחד היום, הרשמה חינם נותנת 20 ביום."
      : `נשארו ${num} חיפושים חינמיים היום, הרשמה חינם נותנת 20 ביום.`;
  },
  clearUnlocksThis: "נפתח עם Clear",
  visualizeThisWord: "ראו את",
  visualBlurb:
    "תמונה אחת חיה, שנוצרה על־ידי Gadit, עוגן ויזואלי לתחושת המילה.",
  visualBlurbLocked:
    "צרו תמונה ייחודית למילה, הבנה דרך הראייה.",
  reportLabel: "דווח על שגיאה",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "מקור המילה",
  idiomsEyebrow: "ניבים וצירופים",
  wordOriginBackgroundLabel: "רקע",
  wordOriginOriginalWord: "מילה מקורית",
  wordOriginBreakdown: "חלקי מילה",
  imageGeneratingLabel: "יוצר תמונה…",
  imageGeneratingHint: "זה לוקח בדרך כלל 10 עד 15 שניות.",
  imageOpenFullAria: "פתחו את התמונה בגודל מלא",
  kidsComingSoon: "הסבר לילדים יופיע כאן בקרוב.",
  compareComingSoon: "משחקי מילים בקרוב.",
  shareDefinitionAria: "שתפו הגדרה זו",
  visualEyebrow: "תמונה",
  meaningsEyebrow: "הגדרות",
  takeItFurtherEyebrow: "קחו את זה הלאה",
  wordOriginLanguage: "שפה",
  wordOriginOriginallyMeant: "משמעות מקורית",
  actionCompose: "חברו משפט",
  actionQuiz: "חידון",
  actionCompare: "השוואת מילים",
  actionKidsExplanation: "הסבר לילדים",
  saveToWordBook: "שמירה במחברת",
  savedToWordBook: "נשמר במחברת",
  listenToWord: "האזנה",
  offlinePin: "שמירה אופליין",
  offlinePinned: "נשמר אופליין",
  offlinePinTitle: "שמרו את המילה ללימוד אופליין",
  offlinePinnedTitle: "נשמר, זמין גם בלי אינטרנט",
  offlineDownloadPack: "הורדת חבילת אופליין",
  offlineDownloadingPack: "מוריד...",
  offlinePackHeader: "חבילת אופליין",
  offlinePackDescription: "מוסיף את המילים הנפוצות ביותר בשפה שלכם למחברת, וזמינות גם בלי אינטרנט ללימוד אופליין.",
  visualEmptyLabel: "תמונה תיווצר עבור המילה הזו",
  generateLabel: "צרו תמונה",
  savedAgoTemplate: (t) => `נשמר · ${t}`,
  shareLabel: "שתפו",
  backLabel: "חזרה",
};

const ar: V2Strings = {
  homeHeadlineLine1: "افهم",
  homeHeadlineLine2: "حتى النهاية.",
  homeSubline:
    "قاموس يفهم السياق, معانٍ وأصول وتعابير وصورة حيّة، بسبع لغات.",

  searchPlaceholderHome: "اكتب كلمة",
  voiceInputTitle: "إملاء كلمة",
  addContext: "أضف السياق",
  explain: "اشرح",
  contextHint: "تقرأ نصًّا؟ ألصق الجملة ليختار Gadit المعنى الأنسب.",
  tryLabel: "جرّب",

  valuePropsEyebrow: "ما الذي يفعله Gadit بشكل مختلف",
  valuePropsTitle: "أكثر من تعريف, طريقة للعيش مع الكلمة.",
  valueProp1Eyebrow: "مدرك للسياق",
  valueProp1Title: "المعنى الصحيح في كل مرة",
  valueProp1Body:
    "ألصق الجملة, يختار Gadit المعنى الملائم لا الأكثر شيوعًا.",
  valueProp2Eyebrow: "بصري",
  valueProp2Title: "صورة حيّة لهذه الكلمة",
  valueProp2Body:
    "تُنشَأ لكل مدخل. مرساة بصرية لشعور الكلمة, لا صورة جاهزة.",
  valueProp3Eyebrow: "الأصل",
  valueProp3Title: "ملاحظة تاريخية، لا مدخل ويكيبيديا",
  valueProp3Body:
    "من أين أتت الكلمة، يُروى كفقرة, كما يكتب صديق فضولي.",
  valueProp4Eyebrow: "11 لغة",
  valueProp4Title: "العربية والعبرية، بكامل أصالتهما",
  valueProp4Body:
    "RTL حقيقي، خطوط حقيقية، تعابير حقيقية, لا واجهة مترجمة.",

  previewLabel: "معاينة",
  seeFullResult: "انظر النتيجة الكاملة",

  pricingEyebrow: "الأسعار",
  pricingTeaserTitle: "ثلاث مستويات. كلّها بمحتوى حقيقي.",
  trustMicrocopy:
    "ألغِ في أي وقت · تجربة 14 يومًا على Clear الشهري · بلا رسوم حتى نهاية التجربة",

  footerProductGroup: "المنتج",
  footerLegalGroup: "قانوني",
  footerCompare: "مقارنة",
  footerNotebook: "الدفتر",
  footerPricing: "الأسعار",
  footerPrivacy: "الخصوصية",
  footerTerms: "الشروط",
  footerContact: "مساعدة",
  footerTagline: "قاموس ذكي بسبع لغات. مبنيّ للقراءة الحقيقية.",
  footerLanguagesNote: "11 لغة",

  signIn: "تسجيل الدخول",
  startFree: "ابدأ مجانًا",
  verbStampDef: "أن تفهم الكلمة حتى عمقها",
  navSearch: "بحث",
  navCompare: "مقارنة",
  navNotebook: "الدفتر",
  navPricing: "الأسعار",
  navFeatures: "المزايا",
  navPlay: "ألعاب",
  navAffiliates: "الشركاء",

  kidsModeLabel: "أطفال",
  kidsModeTooltipOff: "اضغط ليُشرح كل كلمة كما يشرحها الأب لطفله.",
  kidsModeTooltipOn: "وضع الأطفال مفعّل. كل تعريف سيُكتب لطفل. اضغط لإيقافه.",
  kidsModeBasicGate: "وضع الأطفال ميزة في Clear. ارتقِ لاستخدامها.",

  signupWelcomeTitle: "أهلاً بك في Gadit!",
  signupWelcomeBody: "حسابك جاهز. ابدأ بالبحث عن أي كلمة.",

  // Pricing page (Screen 3)
  pricingPageHeadline: "ثلاثة مستويات. كلّها بمحتوى حقيقي.",
  pricingPageSubline: "ابدأ مجانًا. ارتقِ حين يعينك العمق.",
  billingMonthly: "شهري",
  billingYearly: "سنوي",
  billingSave17: "وفّر 17%",

  tierBasicTagline: "افهم",
  tierBasicPitch: "ابدأ بالأساسيات.",
  tierBasicCta: "لنبدأ",
  tierBasicFeatures:
    "20 بحثًا في اليوم¶جميع المعاني (لا الأول وحده)¶3 أمثلة لكل معنى¶الأصل والاشتقاق¶يلزم تسجيل الدخول",

  tierClearTagline: "تخيّل",
  tierClearPitch: "أحيِ الكلمات بالصور وشرح الأطفال والمراجعة.",
  tierClearBadge: "الأكثر شعبية",
  tierClearCta: "تجربة 14 يومًا مجانًا",
  tierClearCtaYearly: "اشتراك سنوي",
  tierClearTrust: "ألغِ في أي وقت · بلا رسوم في فترة التجربة",
  tierClearFeatures:
    "كل ما في Basic¶بحث بلا حدود¶شرح للأطفال¶صورة لكل كلمة (30 شهريًا)¶اكتب جملة وتلقَّ ملاحظات¶تعابير وعبارات شائعة¶سجلّ البحث (آخر 30 يومًا)",

  tierDeepTagline: "تدرَّب",
  tierDeepPitch: "ابنِ مكتبة مفردات شخصية تزداد قوّة مع الزمن.",
  tierDeepCta: "اشترك في Deep",
  tierDeepFeatures:
    "كل ما في Clear¶اختبارات تدريب¶دفتر كلمات شخصي¶تدريب ذكي لمفردات تبقى معك¶تمييز الكلمات المتشابهة¶صورة لكل كلمة (100 شهريًا)",

  basicEquivalent: "",
  clearEquivalent: "ما يعادل $2.50 شهريًا",
  deepEquivalent: "ما يعادل $4.17 شهريًا",

  trustStripCancel: "ألغِ في أي وقت عبر بوابة Stripe",
  trustStripMoneyBack: "استرداد خلال 14 يومًا للشراء الأول",
  trustStripDataYours: "بياناتك ملكك, تُصدَّر متى شئت",
  trustStripNoAds: "لا إعلانات ولا تتبّع طرف ثالث",

  faqEyebrow: "أسئلة شائعة",
  faqHeadline: "إجابات على الأسئلة",
  faqQ1: "هل يمكنني تغيير الخطة؟",
  faqA1:
    "نعم، ارتقِ أو انزل في أي وقت. يُحسَب الفرق آليًّا, تدفع الفارق فقط.",
  faqQ2: "ماذا لو ألغيت؟",
  faqA2: "يبقى الوصول حتى نهاية فترة الفوترة، ثم تعود إلى Basic. لا تُفقَد أي بيانات.",
  faqQ3: "هل التجربة مجانية فعلًا؟",
  faqA3:
    "نعم. نطلب البطاقة لمنع الاستغلال، لكن لا تُحاسَب حتى اليوم الخامس عشر. ألغِ قبل ذلك = بلا تكلفة.",
  faqQ4: "لمَ ثلاثة مستويات؟",
  faqA4:
    "يحتاج كل مستخدم عمقًا مختلفًا. نفضّل لقاءك حيث أنت لا بيع خطة واحدة منتفخة.",
  faqQ5: "هل شرح الأطفال آمن؟",
  faqA5:
    "نعم. يُولَّد بالذكاء الاصطناعي بالعناية نفسها للبالغين، ويُراجَع وفق قواعد المحتوى لدينا. لا محتوى أطفال من المستخدمين.",

  // Login Modal (Screen 4)
  loginWelcomeBack: "تسجيل الدخول",
  loginCreateAccount: "أنشئ حسابك",
  loginContinueWithGoogle: "تابع باستخدام Google",
  loginInAppNotice: "داخل {app}، سجّل الدخول بالبريد الإلكتروني أدناه. للحصول على خيار Google، افتح الرابط في المتصفح.",
  loginOrSeparator: "أو",
  loginEmailLabel: "البريد الإلكتروني",
  loginPasswordLabel: "كلمة المرور",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "تسجيل الدخول",
  loginSubmitSignUp: "أنشئ الحساب",
  loginSwitchToSignUp: "ليس لديك حساب؟ أنشئ واحدًا",
  loginForgotPassword: "نسيت كلمة المرور؟",
  loginForgotPasswordEnterEmail: "اكتب بريدك الإلكتروني أعلاه أولًا، ثم اضغط هنا.",
  loginResetSent: "إذا كان هناك حساب بهذا البريد، فستصلك رسالة لإعادة تعيين كلمة المرور.",
  loginResetError: "تعذر إرسال بريد إعادة التعيين. حاول مرة أخرى.",
  loginSwitchToSignIn: "لديك حساب بالفعل؟ سجّل الدخول",
  loginShowPassword: "إظهار كلمة المرور",
  loginHidePassword: "إخفاء كلمة المرور",
  loginCloseAria: "إغلاق",
  loginSigningIn: "جاري تسجيل الدخول…",
  loginCreatingAccount: "جاري إنشاء الحساب…",
  loginErrorWrongCredentials: "البريد أو كلمة المرور غير صحيحة.",
  loginErrorEmailInUse: "البريد مستخدم بالفعل. حاول تسجيل الدخول.",
  loginErrorWeakPassword: "يجب أن تكون كلمة المرور 8 أحرف على الأقل، وتحتوي على حرف ورقم.",
  loginAgeTermsLine: "عمري 13 سنة أو أكثر وأوافق على",
  loginTermsLinkLabel: "الشروط",
  loginPrivacyLinkLabel: "سياسة الخصوصية",
  loginErrorAgeRequired: "يرجى تأكيد أنك تبلغ 13 عامًا أو أكثر وأنك توافق على الشروط وسياسة الخصوصية.",
  loginErrorInvalidEmail: "يُرجى إدخال بريد إلكتروني صالح.",
  loginErrorGoogleFailed: "تعذّر تسجيل الدخول عبر Google. حاول مرة أخرى.",
  loginErrorGeneric: "حدث خطأ. حاول مرة أخرى.",

  // Compose Modal (Screen 5)
  composeEyebrow: "تأليف",
  composeTitleTemplate: (w) => `اكتب جملتك الخاصة بكلمة ${w}`,
  composeSubtitle:
    "استخدمها في جملة واحصل على ملاحظات فورية حول النحو والنبرة والملاءمة.",
  composeMeaningPickerLabel: "اختر المعنى الذي تتدرّب عليه",
  composePlaceholder: "اكتب جملتك هنا…",
  composeSubmit: "تحقّق من الجملة",
  composeChecking: "جاري التحقّق…",
  composeStatusPerfectLabel: "ممتاز",
  composeStatusAlmostLabel: "قريب جدًّا",
  composeStatusIncorrectLabel: "غير مضبوط",
  composeSuggestionEyebrow: "إعادة صياغة مقترحة",
  composeTryAnother: "جرّب جملة أخرى",
  composeBackToWord: "العودة إلى الكلمة",
  composeErrorEmpty: "اكتب جملة أولًا.",
  composeErrorTooShort: "اكتب بضع كلمات على الأقل.",

  // Quiz Modal (Screen 6)
  quizEyebrow: "تدريب",
  quizTitleTemplate: (w) => `${w}, اختبار`,
  quizQuestionNofM: (n, m) => `السؤال ${n} من ${m}`,
  quizSubmit: "تحقّق",
  quizNext: "السؤال التالي",
  quizFinish: "إنهاء",
  quizYesCorrect: "صحيح, أحسنت",
  quizNotQuite: "غير مضبوط",
  quizLoading: "جاري إعداد الاختبار…",
  quizFinalScoreTemplate: (c, t) => `أجبت بشكل صحيح على ${c} من ${t}.`,
  quizPracticeAnotherWord: "تدرَّب على كلمة أخرى",
  quizBackToWord: "العودة إلى الكلمة",
  quizReviewMistakes: "مراجعة الأخطاء",

  // Compare Page (Screen 7)
  compareEyebrow: "مقارنة",
  compareTitle: "ميِّز بين الكلمات المتشابهة",
  compareSubtitle:
    "ضلّ مقابل ظلّ، affect مقابل effect, الكلمات التي تخدع حتى الناطقين الأصليين.",
  compareWord1Label: "الكلمة 1",
  compareWord2Label: "الكلمة 2",
  compareWord1Placeholder: "ضلّ",
  compareWord2Placeholder: "ظلّ",
  compareCta: "قارن",
  compareLoading: "جاري المقارنة…",
  compareEmpty: "أدخل كلمتين للمقارنة",
  compareDifferenceLabel: "الفارق",
  compareExamplesLabel: "أمثلة",
  compareCommonMistakeLabel: "خطأ شائع",
  compareErrNotARealWord: "إحدى الكلمتين غير معروفة.",
  compareErrDifferentLanguages:
    "الكلمتان تبدوان من لغتين مختلفتين, جرّب زوجًا متوافقًا.",
  compareErrSameWord:
    "تبدوان كأنهما الكلمة نفسها, جرّب كلمتين مختلفتين.",
  compareErrGeneric: "المقارنة غير متاحة الآن.",

  // Notebook (Screen 8)
  notebookEyebrow: "الدفتر",
  notebookTitle: "عالمُك من الكلمات",
  notebookSubtitle:
    "كل كلمة استكشفتها, تُحفَظ وتُنظَّم، ومع الوقت تتسع مكتبتك.",
  notebookCounterTemplate: (n) => `عدد الكلمات المستكشَفة: ${n}`,
  notebookWordsExplored: "كلمات استكشفتها",
  notebookPracticeNow: "ابدأ التدريب",
  notebookDueTodayTemplate: (n) => `${n} للمراجعة اليوم`,
  notebookListView: "قائمة",
  notebookGalaxyView: "مجرّة",
  notebookEmptyTitle: "دفترك فارغ",
  notebookEmptyCta: "ابحث عن كلمة لتبدأ",
  notebookRemoveAria: "إزالة",
  notebookMasteredLabel: "★ متقَن",
  notebookSavedOnTemplate: (d) => `حُفظ في ${d}`,
  notebookLegendRecent: "محفوظ مؤخرًا",
  notebookLegendMastered: "متقَن",
  notebookLegendNeedsReview: "يحتاج مراجعة",

  // Practice / Spaced Repetition (Screen 9)
  srEyebrow: "تدريب",
  srWordNofMTemplate: (n, m) => `الكلمة ${n} من ${m}`,
  srSkip: "تخطّي",
  srClickToReveal: "انقر لكشف المعنى",
  srTapToReveal: "اضغط لكشف المعنى",
  srPrimaryMeaningLabel: "المعنى الأساسي",
  srExamplesLabel: "أمثلة",
  srIForgot: "نسيت",
  srIKnewIt: "كنت أعرفها",
  srSchedulingHint:
    "كنت أعرفها = المراجعة التالية بعد بضعة أيام. نسيت = نعود اليوم.",
  srWordsPracticed: "كلمات تدرّبت عليها",
  srSummaryStatTemplate: (k, f) => `${k} عرفتها · ${f} للمراجعة مجددًا`,
  srTomorrow: "غدًا",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    const word =
      n === 1
        ? "كلمة واحدة"
        : n === 2
          ? "كلمتان"
          : n >= 3 && n <= 10
            ? `${n} كلمات`
            : `${n} كلمة`;
    return `المراجعة التالية: ${when} (${word})`;
  },
  srDoneForToday: "اكتفيت اليوم",
  srPracticeMore: "تدريب إضافي",
  srEmptyTitle: "لا شيء للمراجعة اليوم",
  srEmptyBody: "أحسنت. عُد غدًا.",
  srBackToNotebook: "العودة إلى الدفتر",
  srLoading: "جاري تحميل التدريب…",

  // Account (Screen 10)
  accountEyebrow: "الحساب",
  accountYourSpace: "مساحتك",
  accountNamedSpaceTemplate: (n) => `مساحة ${n}`,
  accountPlanLabel: "الخطة",
  accountOnPlanFree: "Free",
  accountNoActiveSubscription: "لا يوجد اشتراك نشط",
  accountChooseAPlan: "اختر خطة لتبدأ.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    const left =
      n === 1
        ? "يوم واحد"
        : n === 2
          ? "يومان"
          : n >= 3 && n <= 10
            ? `${n} أيام`
            : `${n} يومًا`;
    return `تجربة 14 يومًا · بقي ${left}`;
  },
  accountRenewsOnTemplate: (d) => `يتجدّد في ${d}`,
  accountCancelsAtPeriodEnd: "يُلغى في نهاية فترة الفوترة",
  accountManageBilling: "إدارة الفوترة",
  accountChangePlan: "تغيير الخطة",
  accountUpgrade: "ترقية",
  accountUsageThisMonth: "الاستخدام هذا الشهر",
  accountImageGeneration: "توليد الصور",
  accountSearches: "عمليات البحث",
  accountLocked: "مقفول",
  accountUnlimited: "بلا حدود",
  accountTodaySuffix: "اليوم",
  accountNearingLimit: "تقترب من الحد الشهري.",
  accountSectionLabel: "الحساب",
  accountEmailLabel: "البريد الإلكتروني",
  accountChangeEmail: "تغيير البريد",
  accountSignOut: "تسجيل الخروج",
  accountDeleteAccount: "حذف الحساب",

  // Report Modal (Screen 11)
  reportEyebrow: "بلّغ عن خطأ",
  reportTitle: "ما الخطأ؟",
  reportTellMore: "أخبرنا أكثر",
  reportTellMorePh: "اختياري. كلما زادت التفاصيل، أسرعنا في الإصلاح.",
  reportSend: "إرسال البلاغ",
  reportSending: "جاري الإرسال…",
  reportThanks: "شكرًا, وصلنا.",
  reportError: "تعذّر الإرسال. حاول مجددًا بعد قليل.",
  reportCatIncorrectDefinition: "تعريف غير صحيح",
  reportCatWrongEtymology: "أصل خاطئ",
  reportCatBadExample: "جملة مثال ضعيفة",
  reportCatKidsExplanation: "مشكلة في شرح الأطفال",
  reportCatIdiomIssue: "مشكلة في تعبير",
  reportCatWrongImage: "صورة غير ملائمة",
  reportCatQuizWrongAnswer: "اختبار: إجابة صحيحة وُضع عليها خطأ",
  reportCatComposeFeedback: "مشكلة في تقييم الجملة",
  reportCatCompareResult: "مشكلة في نتيجة المقارنة",
  reportCatSomethingElse: "شيء آخر",

  origin: "الأصل",
  historyNote: "ملاحظة تاريخية",
  throughTime: "عبر الزمن",
  forKids: "للأطفال",
  commonExpressions: "تعبيرات شائعة",
  idiomsWithMeaning: "تعبيرات بهذا المعنى",
  meaningN: (n) => `المعنى ${n}`,
  notJustPrimary: "ليس المعنى الأول وحده",
  takeItFurther: "تعمَّق أكثر",
  doMoreWith: (w) => `المزيد مع ${w}`,
  saveToNotebook: "احفظ في الدفتر",
  saveToNotebookHint: "عُد إليها لاحقًا, منظَّمة وقابلة للبحث.",
  generateImage: "أنشئ صورة",
  generatingImage: "جارٍ الإنشاء…",
  generateImageHint:
    "صورة بصرية حيّة من الذكاء الاصطناعي، لهذه الكلمة فقط.",
  composeSentence: "اكتب جملة",
  composeSentenceHint: "اكتب جملتك, يراجعها Gadit للنبرة والملاءمة.",
  practiceWord: "تدرَّب على هذه الكلمة",
  practiceWordHint: "اختبار قصير على مقاس تعلُّمك.",
  unlockWithClear: "افتح بـ Clear",
  upgradeToClear: "ارتقِ إلى Clear",
  softWallAnonTitle: "استنفدت عمليات البحث المجانية",
  softWallAnonBody:
    "سجّل مجانًا للبحث عن 20 كلمة يوميًا، مع تعريفات كاملة، أمثلة، تعابير، وأصل الكلمة.",
  softWallSignupCta: "اشتراك مجاني",
  softWallBasicTitle: "وصلت إلى الحد اليومي",
  softWallBasicBody:
    "الحساب المجاني يشمل 20 بحثًا في اليوم. يُعاد تعيين الحد غدًا, أو ارتقِ إلى Clear لبحث بلا حدود مع الصور وشرح الأطفال والمراجعة.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    if (num === 1) return "بقي بحث مجاني واحد اليوم, الاشتراك المجاني يمنحك 20 يوميًا.";
    if (num === 2) return "بقي بحثان مجانيان اليوم, الاشتراك المجاني يمنحك 20 يوميًا.";
    return `بقيت ${num} عمليات بحث مجانية اليوم, الاشتراك المجاني يمنحك 20 يوميًا.`;
  },
  clearUnlocksThis: "تفتحها Clear",
  visualizeThisWord: "تخيّل",
  visualBlurb: "صورة واحدة حيّة من Gadit, مرساة بصرية لشعور الكلمة.",
  visualBlurbLocked: "أنشئ صورة فريدة لهذه الكلمة, الفهم عبر النظر.",
  reportLabel: "بلّغ عن خطأ",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "أصل الكلمة",
  idiomsEyebrow: "تعابير وعبارات",
  wordOriginBackgroundLabel: "خلفية",
  wordOriginOriginalWord: "الكلمة الأصلية",
  wordOriginBreakdown: "أجزاء الكلمة",
  imageGeneratingLabel: "جارٍ إنشاء الصورة…",
  imageGeneratingHint: "يستغرق هذا عادة من 10 إلى 15 ثانية.",
  imageOpenFullAria: "افتح الصورة بالحجم الكامل",
  kidsComingSoon: "شرح للأطفال سيظهر هنا قريبًا.",
  compareComingSoon: "ألعاب الكلمات قريبًا.",
  shareDefinitionAria: "شارك هذا التعريف",
  visualEyebrow: "صورة",
  meaningsEyebrow: "تعريفات",
  takeItFurtherEyebrow: "تعمَّق أكثر",
  wordOriginLanguage: "اللغة",
  wordOriginOriginallyMeant: "المعنى الأصلي",
  actionCompose: "اكتب جملة",
  actionQuiz: "اختبار",
  actionCompare: "قارن الكلمات",
  actionKidsExplanation: "شرح للأطفال",
  saveToWordBook: "احفظ في الدفتر",
  savedToWordBook: "محفوظ في الدفتر",
  listenToWord: "استمع",
  offlinePin: "حفظ بلا إنترنت",
  offlinePinned: "محفوظ بلا إنترنت",
  offlinePinTitle: "احفظ هذه الكلمة للدراسة بلا إنترنت",
  offlinePinnedTitle: "محفوظ, متاح بلا إنترنت",
  offlineDownloadPack: "تنزيل حزمة بلا إنترنت",
  offlineDownloadingPack: "جارٍ التنزيل…",
  offlinePackHeader: "حزمة بلا إنترنت",
  offlinePackDescription: "تُضاف الكلمات الأكثر بحثًا بلغتك إلى دفترك, متاحة أيضًا بدون إنترنت للدراسة بلا واي فاي.",
  visualEmptyLabel: "ستُرسم صورة لهذه الكلمة",
  generateLabel: "أنشئ",
  savedAgoTemplate: (t) => `محفوظ · ${t}`,
  shareLabel: "مشاركة",
  backLabel: "رجوع",
};

// Russian — formal "вы" register throughout (B2C SaaS convention).
const ru: Partial<V2Strings> = {
  homeHeadlineLine1: "Понимать",
  homeHeadlineLine2: "до конца.",
  homeSubline:
    "Словарь, который улавливает контекст, значения, происхождение, идиомы и живой образ, на 7 языках.",

  searchPlaceholderHome: "Введите слово",
  voiceInputTitle: "Продиктовать слово",
  addContext: "Добавить контекст",
  explain: "Объяснить",
  contextHint:
    "Что-то читаете? Вставьте предложение, мы выберем нужное значение.",
  tryLabel: "Попробуйте",

  valuePropsEyebrow: "Чем Gadit отличается",
  valuePropsTitle: "Больше, чем определение, это способ жить со словом.",
  valueProp1Eyebrow: "Контекст",
  valueProp1Title: "Нужное значение, каждый раз",
  valueProp1Body:
    "Вставьте предложение, Gadit выберет тот смысл, что подходит, а не самый частый.",
  valueProp2Eyebrow: "Образ",
  valueProp2Title: "Живая картинка для каждого слова",
  valueProp2Body:
    "Создаётся для каждого запроса. Визуальный якорь, а не сток-фото.",
  valueProp3Eyebrow: "Этимология",
  valueProp3Title: "Краткая история, а не статья из Википедии",
  valueProp3Body:
    "Откуда пришло слово, рассказано как абзац, без сухих фактов.",
  valueProp4Eyebrow: "11 языков",
  valueProp4Title: "Иврит и арабский, как родные",
  valueProp4Body:
    "Настоящий RTL, настоящие шрифты, настоящие идиомы, а не переведённый интерфейс.",

  previewLabel: "Превью",
  seeFullResult: "Открыть полную версию",

  pricingEyebrow: "Тарифы",
  pricingTeaserTitle: "Три уровня. Все с настоящим контентом.",
  trustMicrocopy:
    "Отмена в любое время · 14 дней пробного на Clear · Без списания до конца пробного периода",

  footerProductGroup: "Продукт",
  footerLegalGroup: "Юридическое",
  footerCompare: "Сравнить",
  footerNotebook: "Тетрадь",
  footerPricing: "Тарифы",
  footerPrivacy: "Конфиденциальность",
  footerTerms: "Условия",
  footerContact: "Помощь",
  footerTagline: "Умный словарь на 7 языках. Создан для настоящего чтения.",
  footerLanguagesNote: "11 языков",

  signIn: "Войти",
  startFree: "Начать бесплатно",
  verbStampDef: "понять слово до конца",
  navSearch: "Поиск",
  navCompare: "Сравнить",
  navNotebook: "Тетрадь",
  navPricing: "Тарифы",
  navFeatures: "Возможности",
  navPlay: "Игры",
  navAffiliates: "Партнёры",

  kidsModeLabel: "Дети",
  kidsModeTooltipOff: "Нажмите, чтобы каждое слово объяснялось так, как родитель объяснил бы ребёнку.",
  kidsModeTooltipOn: "Детский режим включён. Каждое определение будет написано для ребёнка. Нажмите, чтобы выключить.",
  kidsModeBasicGate: "Детский режим, функция Clear. Перейдите на тариф, чтобы пользоваться.",

  signupWelcomeTitle: "Добро пожаловать в Gadit!",
  signupWelcomeBody: "Аккаунт готов. Начните с поиска любого слова.",

  pricingPageHeadline: "Три уровня. Все с настоящим контентом.",
  pricingPageSubline: "Начните бесплатно. Перейдите глубже, когда понадобится.",
  billingMonthly: "Ежемесячно",
  billingYearly: "Ежегодно",
  billingSave17: "Экономия 17%",

  tierBasicTagline: "Понять",
  tierBasicPitch: "Начните с основ.",
  tierBasicCta: "Начать",
  tierBasicFeatures:
    "20 поисков слов в день¶Все значения (а не только основное)¶3 примера на каждое значение¶Этимология и происхождение¶Нужен вход",

  tierClearTagline: "Увидеть",
  tierClearPitch:
    "Оживите слова, картинками, детским режимом и обратной связью.",
  tierClearBadge: "Самый популярный",
  tierClearCta: "Начать 14-дневный пробный",
  tierClearCtaYearly: "Подписаться на год",
  tierClearTrust: "Отмена в любое время · Без списаний во время пробного",
  tierClearFeatures:
    "Всё из Basic¶Поиски без ограничений¶Объяснения для детей¶Картинка к каждому слову (30 в месяц)¶Напишите своё предложение и получите отзыв¶Идиомы и устойчивые выражения¶История поисков (последние 30 дней)",

  tierDeepTagline: "Запомнить",
  tierDeepPitch:
    "Соберите личный словарь, который растёт с вами.",
  tierDeepCta: "Подписаться на Deep",
  tierDeepFeatures:
    "Всё из Clear¶Тренировки и тесты¶Личная тетрадь слов¶Умная практика, словарь, который остаётся с вами¶Различение похожих слов¶Картинка к каждому слову (100 в месяц)",

  basicEquivalent: "",
  clearEquivalent: "В среднем $2,50 в месяц",
  deepEquivalent: "В среднем $4,17 в месяц",

  trustStripCancel: "Отмена в любое время через портал Stripe",
  trustStripMoneyBack: "Возврат денег за 14 дней при первой покупке",
  trustStripDataYours: "Ваши данные, ваши, экспорт в любой момент",
  trustStripNoAds: "Без рекламы и сторонних трекеров",

  faqEyebrow: "Вопросы",
  faqHeadline: "Ответы на главные вопросы",
  faqQ1: "Можно сменить тариф?",
  faqA1:
    "Да, повышение или понижение в любое время. Перерасчёт автоматический, вы платите только разницу.",
  faqQ2: "Что если я отменю?",
  faqA2:
    "Доступ сохраняется до конца оплаченного периода, потом возвращаетесь на Basic. Данные не теряются.",
  faqQ3: "Пробный действительно бесплатный?",
  faqA3:
    "Да. Карта нужна для защиты от злоупотреблений, но списание происходит только на 15-й день. Отмените раньше, ничего не платите.",
  faqQ4: "Почему три тарифа?",
  faqA4:
    "Разным людям нужна разная глубина. Лучше встретить вас там, где вы есть, чем продавать один универсальный план.",
  faqQ5: "Безопасны ли детские объяснения?",
  faqA5:
    "Да. Они генерируются ИИ с теми же правилами безопасности, что и взрослый контент. Контент создаётся не пользователями.",

  loginWelcomeBack: "Войти",
  loginCreateAccount: "Создайте аккаунт",
  loginContinueWithGoogle: "Продолжить с Google",
  loginInAppNotice: "Внутри {app} войдите по электронной почте ниже. Для входа через Google откройте ссылку в браузере.",
  loginOrSeparator: "или",
  loginEmailLabel: "Эл. почта",
  loginPasswordLabel: "Пароль",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Войти",
  loginSubmitSignUp: "Создать аккаунт",
  loginSwitchToSignUp: "Нет аккаунта? Зарегистрируйтесь",
  loginForgotPassword: "Забыли пароль?",
  loginForgotPasswordEnterEmail: "Сначала введите email выше, потом нажмите сюда.",
  loginResetSent: "Если аккаунт с таким email существует, ссылка для сброса уже отправлена.",
  loginResetError: "Не удалось отправить письмо для сброса. Попробуйте снова.",
  loginSwitchToSignIn: "Уже есть аккаунт? Войдите",
  loginShowPassword: "Показать пароль",
  loginHidePassword: "Скрыть пароль",
  loginCloseAria: "Закрыть",
  loginSigningIn: "Входим…",
  loginCreatingAccount: "Создаём аккаунт…",
  loginErrorWrongCredentials: "Неверный email или пароль.",
  loginErrorEmailInUse: "Этот email уже используется. Попробуйте войти.",
  loginErrorWeakPassword: "Пароль должен быть не короче 8 символов и содержать букву и цифру.",
  loginAgeTermsLine: "Мне 13 лет или больше, я принимаю",
  loginTermsLinkLabel: "Условия",
  loginPrivacyLinkLabel: "Политику конфиденциальности",
  loginErrorAgeRequired: "Подтвердите, что вам 13 лет или больше и вы принимаете Условия и Политику конфиденциальности.",
  loginErrorInvalidEmail: "Введите корректный email.",
  loginErrorGoogleFailed: "Не удалось войти через Google. Попробуйте ещё раз.",
  loginErrorGeneric: "Что-то пошло не так. Попробуйте снова.",

  composeEyebrow: "Составить",
  composeTitleTemplate: (w) => `Напишите своё предложение со словом ${w}`,
  composeSubtitle:
    "Используйте слово в предложении, получите разбор грамматики, тона и уместности.",
  composeMeaningPickerLabel: "Выберите значение, которое отрабатываете",
  composePlaceholder: "Напишите предложение здесь…",
  composeSubmit: "Проверить",
  composeChecking: "Проверяем…",
  composeStatusPerfectLabel: "Отлично",
  composeStatusAlmostLabel: "Почти",
  composeStatusIncorrectLabel: "Не то значение",
  composeSuggestionEyebrow: "Предлагаемая правка",
  composeTryAnother: "Другое предложение",
  composeBackToWord: "К слову",
  composeErrorEmpty: "Сначала напишите предложение.",
  composeErrorTooShort: "Напишите хотя бы несколько слов.",

  quizEyebrow: "Тренировка",
  quizTitleTemplate: (w) => `${w}, тест`,
  quizQuestionNofM: (n, m) => `Вопрос ${n} из ${m}`,
  quizSubmit: "Ответить",
  quizNext: "Следующий",
  quizFinish: "Завершить",
  quizYesCorrect: "Верно",
  quizNotQuite: "Не совсем",
  quizLoading: "Готовим тест…",
  quizFinalScoreTemplate: (c, t) => `Правильно: ${c} из ${t}.`,
  quizPracticeAnotherWord: "Тренировать другое слово",
  quizBackToWord: "К слову",
  quizReviewMistakes: "Разобрать ошибки",

  compareEyebrow: "Сравнить",
  compareTitle: "Различайте похожие слова",
  compareSubtitle:
    "одеть vs надеть, affect vs effect, слова, на которых ошибаются даже носители.",
  compareWord1Label: "Слово 1",
  compareWord2Label: "Слово 2",
  compareWord1Placeholder: "одеть",
  compareWord2Placeholder: "надеть",
  compareCta: "Сравнить",
  compareLoading: "Сравниваем…",
  compareEmpty: "Введите два слова для сравнения",
  compareDifferenceLabel: "Разница",
  compareExamplesLabel: "Примеры",
  compareCommonMistakeLabel: "Частая ошибка",
  compareErrNotARealWord: "Одно из слов нам не знакомо.",
  compareErrDifferentLanguages:
    "Эти слова, кажется, на разных языках, попробуйте пару из одного языка.",
  compareErrSameWord: "Это одно и то же слово, попробуйте два разных.",
  compareErrGeneric: "Сравнение временно недоступно.",

  notebookEyebrow: "Тетрадь",
  notebookTitle: "Ваша вселенная слов",
  notebookSubtitle:
    "Каждое слово, которое вы исследовали, сохраняется, упорядочивается, растёт со временем.",
  notebookCounterTemplate: (n) => `Изучено слов: ${n}`,
  notebookWordsExplored: "изученных слов",
  notebookPracticeNow: "Тренироваться",
  notebookDueTodayTemplate: (n) => `${n} к повторению сегодня`,
  notebookListView: "Список",
  notebookGalaxyView: "Галактика",
  notebookEmptyTitle: "Тетрадь пока пуста",
  notebookEmptyCta: "Найдите слово, чтобы начать",
  notebookRemoveAria: "Удалить",
  notebookMasteredLabel: "★ Освоено",
  notebookSavedOnTemplate: (d) => `Сохранено ${d}`,
  notebookLegendRecent: "Недавние",
  notebookLegendMastered: "Освоено",
  notebookLegendNeedsReview: "К повторению",

  srEyebrow: "Тренировка",
  srWordNofMTemplate: (n, m) => `Слово ${n} из ${m}`,
  srSkip: "Пропустить",
  srClickToReveal: "Кликните, чтобы открыть",
  srTapToReveal: "Нажмите, чтобы открыть",
  srPrimaryMeaningLabel: "Основное значение",
  srExamplesLabel: "Примеры",
  srIForgot: "Забыл",
  srIKnewIt: "Помню",
  srSchedulingHint:
    "Помню = следующий показ через несколько дней. Забыл = вернёмся сегодня.",
  srWordsPracticed: "слов отработано",
  srSummaryStatTemplate: (k, f) => `${k} помните · ${f} к повторению`,
  srTomorrow: "Завтра",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    const word = n === 1 ? "слово" : n >= 2 && n <= 4 ? "слова" : "слов";
    return `Следующее повторение: ${when} (${n} ${word})`;
  },
  srDoneForToday: "На сегодня всё",
  srPracticeMore: "Тренироваться ещё",
  srEmptyTitle: "Сегодня нечего повторять",
  srEmptyBody: "Молодец. Возвращайтесь завтра.",
  srBackToNotebook: "В тетрадь",
  srLoading: "Загружаем тренировку…",

  accountEyebrow: "Аккаунт",
  accountYourSpace: "Ваше пространство",
  accountNamedSpaceTemplate: (n) => `Пространство ${n}`,
  accountPlanLabel: "Тариф",
  accountOnPlanFree: "Бесплатный",
  accountNoActiveSubscription: "Нет активной подписки",
  accountChooseAPlan: "Выберите тариф, чтобы начать.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    const day = n === 1 ? "день" : n >= 2 && n <= 4 ? "дня" : "дней";
    return `Пробный период 14 дней · осталось ${n} ${day}`;
  },
  accountRenewsOnTemplate: (d) => `Продлевается ${d}`,
  accountCancelsAtPeriodEnd: "Отменится в конце периода",
  accountManageBilling: "Управлять оплатой",
  accountChangePlan: "Сменить тариф",
  accountUpgrade: "Повысить",
  accountUsageThisMonth: "Использование в этом месяце",
  accountImageGeneration: "Генерация картинок",
  accountSearches: "Поиски",
  accountLocked: "Заблокировано",
  accountUnlimited: "без ограничений",
  accountTodaySuffix: "сегодня",
  accountNearingLimit: "Приближаетесь к лимиту месяца.",
  accountSectionLabel: "Аккаунт",
  accountEmailLabel: "Email",
  accountChangeEmail: "Сменить email",
  accountSignOut: "Выйти",
  accountDeleteAccount: "Удалить аккаунт",

  reportEyebrow: "Сообщить об ошибке",
  reportTitle: "Что не так?",
  reportTellMore: "Расскажите подробнее",
  reportTellMorePh: "По желанию. Чем конкретнее, тем быстрее исправим.",
  reportSend: "Отправить",
  reportSending: "Отправляем…",
  reportThanks: "Спасибо, получили.",
  reportError: "Не удалось отправить. Попробуйте ещё раз.",
  reportCatIncorrectDefinition: "Неверное определение",
  reportCatWrongEtymology: "Неверная этимология",
  reportCatBadExample: "Плохой пример",
  reportCatKidsExplanation: "Проблема с детским объяснением",
  reportCatIdiomIssue: "Проблема с идиомой",
  reportCatWrongImage: "Неверная картинка",
  reportCatQuizWrongAnswer: "Тест: неверно отмечен ответ",
  reportCatComposeFeedback: "Проблема с разбором предложения",
  reportCatCompareResult: "Проблема со сравнением",
  reportCatSomethingElse: "Другое",

  origin: "Происхождение",
  historyNote: "Историческая заметка",
  throughTime: "Сквозь время",
  forKids: "Для детей",
  commonExpressions: "Распространённые выражения",
  idiomsWithMeaning: "Идиомы с этим значением",
  meaningN: (n) => `Значение ${n}`,
  notJustPrimary: "Не только основное",
  takeItFurther: "Углубиться",
  doMoreWith: (w) => `Больше со словом ${w}`,
  saveToNotebook: "В тетрадь",
  saveToNotebookHint: "Вернётесь позже, упорядочено и с поиском.",
  generateImage: "Создать картинку",
  generatingImage: "Создаём…",
  generateImageHint: "Живая картинка от ИИ, для этого слова.",
  composeSentence: "Составить предложение",
  composeSentenceHint:
    "Напишите своё, Gadit разберёт тон и уместность.",
  practiceWord: "Тренировать слово",
  practiceWordHint: "Короткий тест под ваш стиль.",
  unlockWithClear: "Открыть в Clear",
  upgradeToClear: "Перейти на Clear",
  softWallAnonTitle: "Вы использовали бесплатные поиски",
  softWallAnonBody:
    "Зарегистрируйтесь бесплатно, чтобы искать до 20 слов в день, с полными определениями, примерами, идиомами и происхождением слова.",
  softWallSignupCta: "Бесплатная регистрация",
  softWallBasicTitle: "Дневной лимит достигнут",
  softWallBasicBody:
    "Бесплатный аккаунт даёт 20 поисков в день. Лимит обновится завтра, или перейдите на Clear для безлимитных поисков, картинок, детского режима и разбора предложений.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    const word =
      num === 1 ? "поиск" : num >= 2 && num <= 4 ? "поиска" : "поисков";
    return `Осталось ${num} бесплатных ${word} сегодня, регистрация бесплатна и даёт 20 в день.`;
  },
  clearUnlocksThis: "Доступно в Clear",
  visualizeThisWord: "Увидеть",
  visualBlurb:
    "Одна живая картинка от Gadit, визуальный якорь для этого слова.",
  visualBlurbLocked:
    "Создайте уникальную картинку для этого слова, понимание через образ.",
  reportLabel: "Сообщить об ошибке",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "Происхождение слова",
  idiomsEyebrow: "Идиомы и выражения",
  wordOriginBackgroundLabel: "Контекст",
  wordOriginOriginalWord: "Исходное слово",
  wordOriginBreakdown: "Части слова",
  imageGeneratingLabel: "Создаём изображение…",
  imageGeneratingHint: "Обычно это занимает от 10 до 15 секунд.",
  imageOpenFullAria: "Открыть изображение в полный размер",
  kidsComingSoon: "Объяснение для детей появится здесь скоро.",
  compareComingSoon: "Игры со словами, скоро.",
  shareDefinitionAria: "Поделиться этим определением",
  visualEyebrow: "Изображение",
  meaningsEyebrow: "Определения",
  takeItFurtherEyebrow: "Углубиться",
  wordOriginLanguage: "Язык",
  wordOriginOriginallyMeant: "Изначально означало",
  actionCompose: "Составить предложение",
  actionQuiz: "Викторина",
  actionCompare: "Сравнить слова",
  actionKidsExplanation: "Объяснение для детей",
  saveToWordBook: "В мою тетрадь",
  savedToWordBook: "Сохранено в тетради",
  listenToWord: "Прослушать",
  offlinePin: "Сохранить офлайн",
  offlinePinned: "Сохранено офлайн",
  offlinePinTitle: "Сохранить слово для изучения без интернета",
  offlinePinnedTitle: "Сохранено, доступно без Wi-Fi",
  offlineDownloadPack: "Скачать офлайн-пакет",
  offlineDownloadingPack: "Скачиваем…",
  offlinePackHeader: "Офлайн-пакет",
  offlinePackDescription: "Добавляет самые популярные слова вашего языка в тетрадь, и делает их доступными без интернета.",
  visualEmptyLabel: "Картинка появится для этого слова",
  generateLabel: "Создать",
  savedAgoTemplate: (t) => `Сохранено · ${t}`,
  shareLabel: "Поделиться",
  backLabel: "Назад",
};

// Spanish — neutral Latin American, "tú" register.
const es: Partial<V2Strings> = {
  homeHeadlineLine1: "Entiende",
  homeHeadlineLine2: "hasta el final.",
  homeSubline:
    "Un diccionario que entiende el contexto, significados, origen, expresiones e imagen viva, en 11 idiomas.",

  searchPlaceholderHome: "Escribe una palabra",
  voiceInputTitle: "Dictar una palabra",
  addContext: "Agregar contexto",
  explain: "Explicar",
  contextHint:
    "¿Estás leyendo algo? Pega la oración y elegimos el significado correcto.",
  tryLabel: "Prueba",

  valuePropsEyebrow: "Lo que Gadit hace diferente",
  valuePropsTitle: "Más que una definición, una forma de vivir con la palabra.",
  valueProp1Eyebrow: "Con contexto",
  valueProp1Title: "El significado correcto, siempre",
  valueProp1Body:
    "Pega una oración, Gadit elige el sentido que encaja, no el más común.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "Una imagen viva, solo para esta palabra",
  valueProp2Body:
    "Generada para cada entrada. Un ancla visual, no una foto de stock.",
  valueProp3Eyebrow: "Etimología",
  valueProp3Title: "Una nota de origen, no un volcado de Wikipedia",
  valueProp3Body:
    "De dónde viene la palabra, contado como un párrafo, el que escribiría un amigo curioso.",
  valueProp4Eyebrow: "11 idiomas",
  valueProp4Title: "Hebreo y árabe, totalmente nativos",
  valueProp4Body:
    "RTL real, fuentes reales, modismos reales, no una interfaz traducida a la fuerza.",

  previewLabel: "Vista previa",
  seeFullResult: "Ver el resultado completo",

  pricingEyebrow: "Precios",
  pricingTeaserTitle: "Tres niveles. Todos con contenido real.",
  trustMicrocopy:
    "Cancela cuando quieras · Prueba de 14 días en Clear mensual · Sin cargo hasta que termine la prueba",

  footerProductGroup: "Producto",
  footerLegalGroup: "Legal",
  footerCompare: "Comparar",
  footerNotebook: "Cuaderno",
  footerPricing: "Precios",
  footerPrivacy: "Privacidad",
  footerTerms: "Términos",
  footerContact: "Ayuda",
  footerTagline: "Un diccionario inteligente para 11 idiomas. Hecho para lectura real.",
  footerLanguagesNote: "11 idiomas",

  signIn: "Iniciar sesión",
  startFree: "Empezar gratis",
  verbStampDef: "entender una palabra hasta el fondo",
  navSearch: "Buscar",
  navCompare: "Comparar",
  navNotebook: "Cuaderno",
  navPricing: "Precios",
  navFeatures: "Funciones",
  navPlay: "Jugar",
  navAffiliates: "Afiliados",

  kidsModeLabel: "Niños",
  kidsModeTooltipOff: "Toca para que cada palabra se explique como un padre se la explicaría a un niño.",
  kidsModeTooltipOn: "Modo niños activado. Cada definición se escribirá para un niño. Toca para desactivar.",
  kidsModeBasicGate: "El modo niños es una función de Clear. Mejora para usarlo.",

  signupWelcomeTitle: "¡Bienvenido a Gadit!",
  signupWelcomeBody: "Tu cuenta está lista. Empieza buscando cualquier palabra.",

  pricingPageHeadline: "Tres niveles. Todos con contenido real.",
  pricingPageSubline: "Empieza gratis. Sube de plan cuando la profundidad te ayude.",
  billingMonthly: "Mensual",
  billingYearly: "Anual",
  billingSave17: "Ahorra 17%",

  tierBasicTagline: "Entender",
  tierBasicPitch: "Empieza con lo esencial.",
  tierBasicCta: "Empezar",
  tierBasicFeatures:
    "20 búsquedas por día¶Todos los significados (no solo el principal)¶3 ejemplos por significado¶Etimología y origen¶Requiere iniciar sesión",

  tierClearTagline: "Visualizar",
  tierClearPitch:
    "Dale vida a las palabras, imágenes, modo niños y feedback.",
  tierClearBadge: "Más popular",
  tierClearCta: "Empezar prueba gratis de 14 días",
  tierClearCtaYearly: "Suscripción anual",
  tierClearTrust: "Cancela cuando quieras · Sin cargo durante la prueba",
  tierClearFeatures:
    "Todo lo de Basic¶Búsquedas ilimitadas¶Explicaciones para niños¶Una imagen por palabra (30/mes)¶Escribe una oración y recibe feedback¶Modismos y expresiones¶Historial de búsqueda (últimos 30 días)",

  tierDeepTagline: "Practicar",
  tierDeepPitch:
    "Construye un vocabulario propio que se fortalece con el tiempo.",
  tierDeepCta: "Suscríbete a Deep",
  tierDeepFeatures:
    "Todo lo de Clear¶Pruebas y exámenes¶Cuaderno personal de palabras¶Práctica inteligente para vocabulario que perdura¶Distinguir palabras parecidas¶Una imagen por palabra (100/mes)",

  basicEquivalent: "",
  clearEquivalent: "Equivalente a $2.50/mes",
  deepEquivalent: "Equivalente a $4.17/mes",

  trustStripCancel: "Cancela cuando quieras desde el portal de Stripe",
  trustStripMoneyBack: "Devolución de 14 días en la primera compra",
  trustStripDataYours: "Tus datos son tuyos, exporta cuando quieras",
  trustStripNoAds: "Sin publicidad ni rastreo de terceros",

  faqEyebrow: "Preguntas frecuentes",
  faqHeadline: "Preguntas, respondidas",
  faqQ1: "¿Puedo cambiar de plan?",
  faqA1:
    "Sí, puedes subir o bajar de plan en cualquier momento. El prorrateo es automático, solo pagas la diferencia.",
  faqQ2: "¿Qué pasa si cancelo?",
  faqA2:
    "Mantienes acceso hasta el fin de tu período pagado, luego vuelves a Basic. No se pierden datos.",
  faqQ3: "¿La prueba es realmente gratis?",
  faqA3:
    "Sí. Pedimos tarjeta para evitar abusos, pero no se cobra hasta el día 15. Cancela antes y no pagas nada.",
  faqQ4: "¿Por qué tres niveles?",
  faqA4:
    "Cada usuario necesita una profundidad distinta. Preferimos encontrarte donde estás que vender un solo plan inflado.",
  faqQ5: "¿Las explicaciones para niños son seguras?",
  faqA5:
    "Sí. Se generan con IA con las mismas reglas de seguridad que el contenido adulto. No hay contenido infantil generado por usuarios.",

  loginWelcomeBack: "Iniciar sesión",
  loginCreateAccount: "Crea tu cuenta",
  loginContinueWithGoogle: "Continuar con Google",
  loginInAppNotice: "Dentro de {app}, inicia sesión con correo abajo. Para la opción de Google, abre el enlace en el navegador.",
  loginOrSeparator: "o",
  loginEmailLabel: "Correo electrónico",
  loginPasswordLabel: "Contraseña",
  loginEmailPlaceholder: "tu@ejemplo.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Iniciar sesión",
  loginSubmitSignUp: "Crear cuenta",
  loginSwitchToSignUp: "¿No tienes cuenta? Regístrate",
  loginForgotPassword: "¿Olvidaste tu contraseña?",
  loginForgotPasswordEnterEmail: "Escribe tu correo arriba primero, luego toca aquí.",
  loginResetSent: "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer.",
  loginResetError: "No pudimos enviar el correo. Inténtalo de nuevo.",
  loginSwitchToSignIn: "¿Ya tienes cuenta? Inicia sesión",
  loginShowPassword: "Mostrar contraseña",
  loginHidePassword: "Ocultar contraseña",
  loginCloseAria: "Cerrar",
  loginSigningIn: "Iniciando sesión…",
  loginCreatingAccount: "Creando cuenta…",
  loginErrorWrongCredentials: "Correo o contraseña incorrectos.",
  loginErrorEmailInUse: "Este correo ya está en uso. Intenta iniciar sesión.",
  loginErrorWeakPassword: "La contraseña debe tener al menos 8 caracteres e incluir una letra y un número.",
  loginAgeTermsLine: "Tengo 13 años o más y acepto los",
  loginTermsLinkLabel: "Términos",
  loginPrivacyLinkLabel: "Política de Privacidad",
  loginErrorAgeRequired: "Confirma que tienes 13 años o más y aceptas los Términos y la Política de Privacidad.",
  loginErrorInvalidEmail: "Ingresa un correo electrónico válido.",
  loginErrorGoogleFailed: "No se pudo iniciar con Google. Intenta de nuevo.",
  loginErrorGeneric: "Algo salió mal. Inténtalo de nuevo.",

  composeEyebrow: "Componer",
  composeTitleTemplate: (w) => `Escribe tu propia oración con ${w}`,
  composeSubtitle:
    "Úsala en una oración y recibe feedback al instante sobre gramática, tono y uso.",
  composeMeaningPickerLabel: "Elige el significado que estás practicando",
  composePlaceholder: "Escribe tu oración aquí…",
  composeSubmit: "Revisar",
  composeChecking: "Revisando…",
  composeStatusPerfectLabel: "Perfecto",
  composeStatusAlmostLabel: "Casi",
  composeStatusIncorrectLabel: "Otro significado",
  composeSuggestionEyebrow: "Reescritura sugerida",
  composeTryAnother: "Probar otra oración",
  composeBackToWord: "Volver a la palabra",
  composeErrorEmpty: "Primero escribe una oración.",
  composeErrorTooShort: "Escribe al menos unas palabras.",

  quizEyebrow: "Práctica",
  quizTitleTemplate: (w) => `${w}, examen`,
  quizQuestionNofM: (n, m) => `Pregunta ${n} de ${m}`,
  quizSubmit: "Enviar",
  quizNext: "Siguiente",
  quizFinish: "Terminar",
  quizYesCorrect: "Correcto",
  quizNotQuite: "No exactamente",
  quizLoading: "Preparando tu examen…",
  quizFinalScoreTemplate: (c, t) => `Acertaste ${c} de ${t}.`,
  quizPracticeAnotherWord: "Practicar otra palabra",
  quizBackToWord: "Volver a la palabra",
  quizReviewMistakes: "Repasar las que fallé",

  compareEyebrow: "Comparar",
  compareTitle: "Distingue palabras parecidas",
  compareSubtitle:
    "haber vs a ver, affect vs effect, palabras que confunden incluso a hablantes nativos.",
  compareWord1Label: "Palabra 1",
  compareWord2Label: "Palabra 2",
  compareWord1Placeholder: "haber",
  compareWord2Placeholder: "a ver",
  compareCta: "Comparar",
  compareLoading: "Comparando…",
  compareEmpty: "Ingresa dos palabras para comparar",
  compareDifferenceLabel: "La diferencia",
  compareExamplesLabel: "Ejemplos",
  compareCommonMistakeLabel: "Error común",
  compareErrNotARealWord: "No reconocemos una de esas palabras.",
  compareErrDifferentLanguages:
    "Estas palabras parecen estar en idiomas distintos, prueba con un par del mismo idioma.",
  compareErrSameWord: "Parecen ser la misma palabra, prueba con dos distintas.",
  compareErrGeneric: "Comparación no disponible ahora.",

  notebookEyebrow: "Cuaderno",
  notebookTitle: "Tu universo de palabras",
  notebookSubtitle:
    "Cada palabra que has explorado, guardada, organizada, creciendo.",
  notebookCounterTemplate: (n) => `${n} palabras exploradas`,
  notebookWordsExplored: "palabras exploradas",
  notebookPracticeNow: "Practicar ahora",
  notebookDueTodayTemplate: (n) => `${n} para repasar hoy`,
  notebookListView: "Lista",
  notebookGalaxyView: "Galaxia",
  notebookEmptyTitle: "Tu cuaderno está vacío",
  notebookEmptyCta: "Busca una palabra para empezar",
  notebookRemoveAria: "Quitar",
  notebookMasteredLabel: "★ Dominada",
  notebookSavedOnTemplate: (d) => `Guardada el ${d}`,
  notebookLegendRecent: "Recientes",
  notebookLegendMastered: "Dominadas",
  notebookLegendNeedsReview: "Para repasar",

  srEyebrow: "Práctica",
  srWordNofMTemplate: (n, m) => `Palabra ${n} de ${m}`,
  srSkip: "Saltar",
  srClickToReveal: "Haz clic para mostrar",
  srTapToReveal: "Toca para mostrar",
  srPrimaryMeaningLabel: "Significado principal",
  srExamplesLabel: "Ejemplos",
  srIForgot: "Olvidé",
  srIKnewIt: "Lo sabía",
  srSchedulingHint:
    "Lo sabía = la próxima en unos días. Olvidé = vuelve hoy.",
  srWordsPracticed: "palabras practicadas",
  srSummaryStatTemplate: (k, f) => `${k} sabías · ${f} para volver a repasar`,
  srTomorrow: "Mañana",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    return `Próximo repaso: ${when} (${n} ${n === 1 ? "palabra" : "palabras"})`;
  },
  srDoneForToday: "Listo por hoy",
  srPracticeMore: "Practicar más",
  srEmptyTitle: "Nada para repasar hoy",
  srEmptyBody: "Bien hecho. Vuelve mañana.",
  srBackToNotebook: "Volver al cuaderno",
  srLoading: "Cargando tu práctica…",

  accountEyebrow: "Cuenta",
  accountYourSpace: "Tu espacio",
  accountNamedSpaceTemplate: (n) => `El espacio de ${n}`,
  accountPlanLabel: "Plan",
  accountOnPlanFree: "Gratis",
  accountNoActiveSubscription: "Sin suscripción activa",
  accountChooseAPlan: "Elige un plan para empezar.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    return `Prueba de 14 días · ${n} ${n === 1 ? "día" : "días"} restantes`;
  },
  accountRenewsOnTemplate: (d) => `Se renueva el ${d}`,
  accountCancelsAtPeriodEnd: "Se cancela al fin del período de pago",
  accountManageBilling: "Gestionar facturación",
  accountChangePlan: "Cambiar plan",
  accountUpgrade: "Subir de plan",
  accountUsageThisMonth: "Uso este mes",
  accountImageGeneration: "Generación de imágenes",
  accountSearches: "Búsquedas",
  accountLocked: "Bloqueado",
  accountUnlimited: "ilimitadas",
  accountTodaySuffix: "hoy",
  accountNearingLimit: "Te acercas al límite del mes.",
  accountSectionLabel: "Cuenta",
  accountEmailLabel: "Correo",
  accountChangeEmail: "Cambiar correo",
  accountSignOut: "Cerrar sesión",
  accountDeleteAccount: "Eliminar cuenta",

  reportEyebrow: "Reportar un error",
  reportTitle: "¿Qué está mal?",
  reportTellMore: "Cuéntanos más",
  reportTellMorePh: "Opcional. Cuanto más específico, más rápido lo arreglamos.",
  reportSend: "Enviar reporte",
  reportSending: "Enviando…",
  reportThanks: "Gracias, lo recibimos.",
  reportError: "No se pudo enviar. Intenta en un momento.",
  reportCatIncorrectDefinition: "Definición incorrecta",
  reportCatWrongEtymology: "Etimología incorrecta",
  reportCatBadExample: "Ejemplo malo",
  reportCatKidsExplanation: "Problema con explicación para niños",
  reportCatIdiomIssue: "Problema con modismo",
  reportCatWrongImage: "Imagen incorrecta",
  reportCatQuizWrongAnswer: "Examen: respuesta marcada mal",
  reportCatComposeFeedback: "Problema con feedback de composición",
  reportCatCompareResult: "Problema con resultado de comparación",
  reportCatSomethingElse: "Otra cosa",

  origin: "Origen",
  historyNote: "Nota histórica",
  throughTime: "A través del tiempo",
  forKids: "Para niños",
  commonExpressions: "Expresiones comunes",
  idiomsWithMeaning: "Modismos con este significado",
  meaningN: (n) => `Significado ${n}`,
  notJustPrimary: "No solo el principal",
  takeItFurther: "Profundiza más",
  doMoreWith: (w) => `Haz más con ${w}`,
  saveToNotebook: "Guardar en el cuaderno",
  saveToNotebookHint: "Vuelve después, organizado y con búsqueda.",
  generateImage: "Generar imagen",
  generatingImage: "Generando…",
  generateImageHint: "Una imagen viva hecha con IA, para esta palabra.",
  composeSentence: "Componer una oración",
  composeSentenceHint:
    "Escribe la tuya, Gadit revisa el tono y el encaje.",
  practiceWord: "Practicar esta palabra",
  practiceWordHint: "Una prueba corta a tu medida.",
  unlockWithClear: "Desbloquea con Clear",
  upgradeToClear: "Pasa a Clear",
  softWallAnonTitle: "Usaste tus búsquedas gratis",
  softWallAnonBody:
    "Regístrate gratis para buscar hasta 20 palabras al día, con definiciones completas, ejemplos, expresiones y origen de la palabra.",
  softWallSignupCta: "Regístrate gratis",
  softWallBasicTitle: "Alcanzaste el límite del día",
  softWallBasicBody:
    "Las cuentas gratis tienen 20 búsquedas por día. El límite se reinicia mañana, o pasa a Clear para búsquedas ilimitadas, imágenes, modo niños y feedback en oraciones.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Te queda 1 búsqueda gratis hoy, regístrate gratis para tener 20 al día."
      : `Te quedan ${num} búsquedas gratis hoy, regístrate gratis para tener 20 al día.`;
  },
  clearUnlocksThis: "Disponible en Clear",
  visualizeThisWord: "Visualiza",
  visualBlurb:
    "Una imagen viva, generada por Gadit, un ancla visual para esta palabra.",
  visualBlurbLocked:
    "Crea una imagen única para esta palabra, entender por la vista.",
  reportLabel: "Reportar un error",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "Origen de la palabra",
  visualEyebrow: "Visual",
  meaningsEyebrow: "Definiciones",
  idiomsEyebrow: "Modismos y expresiones",
  wordOriginBackgroundLabel: "Contexto",
  wordOriginOriginalWord: "Palabra original",
  wordOriginBreakdown: "Partes de la palabra",
  imageGeneratingLabel: "Generando imagen…",
  imageGeneratingHint: "Suele tardar entre 10 y 15 segundos.",
  imageOpenFullAria: "Abrir imagen a tamaño completo",
  kidsComingSoon: "Explicación para niños llegará pronto.",
  compareComingSoon: "Juegos de palabras pronto.",
  shareDefinitionAria: "Compartir esta definición",
  takeItFurtherEyebrow: "Profundiza más",
  wordOriginLanguage: "Idioma",
  wordOriginOriginallyMeant: "Significaba originalmente",
  actionCompose: "Componer una oración",
  actionQuiz: "Cuestionario",
  actionCompare: "Comparar palabras",
  actionKidsExplanation: "Explicación para niños",
  saveToWordBook: "Guardar en el cuaderno",
  savedToWordBook: "Guardado en el cuaderno",
  listenToWord: "Escuchar",
  offlinePin: "Guardar sin conexión",
  offlinePinned: "Guardado sin conexión",
  offlinePinTitle: "Guardar esta palabra para estudiar sin conexión",
  offlinePinnedTitle: "Guardada, disponible sin WiFi",
  offlineDownloadPack: "Descargar paquete sin conexión",
  offlineDownloadingPack: "Descargando…",
  offlinePackHeader: "Paquete sin conexión",
  offlinePackDescription: "Añade las palabras más buscadas en tu idioma a tu cuaderno, y las mantiene disponibles sin WiFi para estudiar sin conexión.",
  visualEmptyLabel: "Se dibujará una imagen para esta palabra",
  generateLabel: "Generar",
  savedAgoTemplate: (t) => `Guardada · ${t}`,
  shareLabel: "Compartir",
  backLabel: "Atrás",
};

// Portuguese — Brazilian, "você" register.
const pt: Partial<V2Strings> = {
  homeHeadlineLine1: "Entenda",
  homeHeadlineLine2: "até o fim.",
  homeSubline:
    "Um dicionário que entende o contexto, significados, origem, expressões e imagem viva, em 11 idiomas.",

  searchPlaceholderHome: "Digite uma palavra",
  voiceInputTitle: "Ditar uma palavra",
  addContext: "Adicionar contexto",
  explain: "Explicar",
  contextHint:
    "Lendo algo? Cole a frase e a gente escolhe o significado certo.",
  tryLabel: "Experimente",

  valuePropsEyebrow: "O que o Gadit faz diferente",
  valuePropsTitle: "Mais que uma definição, um jeito de viver com a palavra.",
  valueProp1Eyebrow: "Com contexto",
  valueProp1Title: "O significado certo, sempre",
  valueProp1Body:
    "Cole uma frase, o Gadit escolhe o sentido que se encaixa, não só o mais comum.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "Uma imagem viva, só pra esta palavra",
  valueProp2Body:
    "Gerada pra cada entrada. Uma âncora visual, não foto de banco.",
  valueProp3Eyebrow: "Etimologia",
  valueProp3Title: "Uma nota histórica, não despejo de Wikipédia",
  valueProp3Body:
    "De onde a palavra veio, contado em parágrafo, do jeito que um amigo curioso escreveria.",
  valueProp4Eyebrow: "11 idiomas",
  valueProp4Title: "Hebraico e árabe, totalmente nativos",
  valueProp4Body:
    "RTL real, fontes reais, expressões reais, não interface traduzida na pressa.",

  previewLabel: "Prévia",
  seeFullResult: "Ver o resultado completo",

  pricingEyebrow: "Preços",
  pricingTeaserTitle: "Três níveis. Todos com conteúdo de verdade.",
  trustMicrocopy:
    "Cancele quando quiser · Teste de 14 dias no Clear mensal · Sem cobrança até o teste acabar",

  footerProductGroup: "Produto",
  footerLegalGroup: "Legal",
  footerCompare: "Comparar",
  footerNotebook: "Caderno",
  footerPricing: "Preços",
  footerPrivacy: "Privacidade",
  footerTerms: "Termos",
  footerContact: "Ajuda",
  footerTagline: "Um dicionário inteligente em 11 idiomas. Feito pra leitura de verdade.",
  footerLanguagesNote: "11 idiomas",

  signIn: "Entrar",
  startFree: "Começar grátis",
  verbStampDef: "entender uma palavra até o fim",
  navSearch: "Pesquisar",
  navCompare: "Comparar",
  navNotebook: "Caderno",
  navPricing: "Preços",
  navFeatures: "Recursos",
  navPlay: "Jogar",
  navAffiliates: "Afiliados",

  kidsModeLabel: "Crianças",
  kidsModeTooltipOff: "Toque para que cada palavra seja explicada como um pai explicaria a uma criança.",
  kidsModeTooltipOn: "Modo crianças ativado. Cada definição será escrita para uma criança. Toque para desativar.",
  kidsModeBasicGate: "O modo crianças é uma função do Clear. Faça upgrade para usar.",

  signupWelcomeTitle: "Bem-vindo ao Gadit!",
  signupWelcomeBody: "Sua conta está pronta. Comece buscando qualquer palavra.",

  pricingPageHeadline: "Três níveis. Todos com conteúdo de verdade.",
  pricingPageSubline: "Comece grátis. Faça upgrade quando a profundidade ajudar.",
  billingMonthly: "Mensal",
  billingYearly: "Anual",
  billingSave17: "Economize 17%",

  tierBasicTagline: "Entender",
  tierBasicPitch: "Comece com o essencial.",
  tierBasicCta: "Começar",
  tierBasicFeatures:
    "20 buscas por dia¶Todos os significados (não só o principal)¶3 exemplos por significado¶Etimologia e origem¶Precisa entrar",

  tierClearTagline: "Visualizar",
  tierClearPitch:
    "Dê vida às palavras, imagens, modo crianças e feedback.",
  tierClearBadge: "Mais popular",
  tierClearCta: "Começar teste grátis de 14 dias",
  tierClearCtaYearly: "Assinar anual",
  tierClearTrust: "Cancele quando quiser · Sem cobrança no teste",
  tierClearFeatures:
    "Tudo do Basic¶Buscas ilimitadas¶Explicações para crianças¶Uma imagem por palavra (30/mês)¶Escreva uma frase e receba feedback¶Expressões e locuções¶Histórico de buscas (últimos 30 dias)",

  tierDeepTagline: "Praticar",
  tierDeepPitch:
    "Construa um vocabulário pessoal que fica mais forte com o tempo.",
  tierDeepCta: "Assinar Deep",
  tierDeepFeatures:
    "Tudo do Clear¶Quizzes de prática¶Caderno pessoal de palavras¶Prática inteligente para vocabulário que dura¶Distinguir palavras parecidas¶Uma imagem por palavra (100/mês)",

  basicEquivalent: "",
  clearEquivalent: "Equivalente a $2,50/mês",
  deepEquivalent: "Equivalente a $4,17/mês",

  trustStripCancel: "Cancele quando quiser pelo portal Stripe",
  trustStripMoneyBack: "Reembolso de 14 dias na primeira compra",
  trustStripDataYours: "Seus dados são seus, exporte quando quiser",
  trustStripNoAds: "Sem anúncios, sem rastreamento de terceiros",

  faqEyebrow: "Perguntas frequentes",
  faqHeadline: "Perguntas, respondidas",
  faqQ1: "Posso trocar de plano?",
  faqA1:
    "Sim, faça upgrade ou downgrade quando quiser. O ajuste proporcional é automático, você só paga a diferença.",
  faqQ2: "O que acontece se eu cancelar?",
  faqA2:
    "Você mantém acesso até o fim do período pago, depois volta pro Basic. Nenhum dado é perdido.",
  faqQ3: "O teste é mesmo grátis?",
  faqA3:
    "Sim. A gente pede cartão pra evitar abusos, mas só cobra no dia 15. Cancele antes e não paga nada.",
  faqQ4: "Por que três níveis?",
  faqA4:
    "Cada usuário precisa de profundidade diferente. Preferimos te encontrar onde você está a vender um plano único inflado.",
  faqQ5: "As explicações para crianças são seguras?",
  faqA5:
    "Sim. São geradas por IA com as mesmas regras de segurança do conteúdo adulto. Sem conteúdo infantil gerado por usuários.",

  loginWelcomeBack: "Entrar",
  loginCreateAccount: "Crie sua conta",
  loginContinueWithGoogle: "Continuar com Google",
  loginInAppNotice: "Dentro do {app}, entre com email abaixo. Para a opção do Google, abra o link no navegador.",
  loginOrSeparator: "ou",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Senha",
  loginEmailPlaceholder: "voce@exemplo.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Entrar",
  loginSubmitSignUp: "Criar conta",
  loginSwitchToSignUp: "Não tem conta? Cadastre-se",
  loginForgotPassword: "Esqueceu a senha?",
  loginForgotPasswordEnterEmail: "Digite seu e-mail acima primeiro, depois toque aqui.",
  loginResetSent: "Se existe uma conta com esse e-mail, enviamos um link de redefinição.",
  loginResetError: "Não conseguimos enviar o e-mail. Tente novamente.",
  loginSwitchToSignIn: "Já tem conta? Entre",
  loginShowPassword: "Mostrar senha",
  loginHidePassword: "Ocultar senha",
  loginCloseAria: "Fechar",
  loginSigningIn: "Entrando…",
  loginCreatingAccount: "Criando conta…",
  loginErrorWrongCredentials: "E-mail ou senha incorretos.",
  loginErrorEmailInUse: "Este e-mail já está em uso. Tente entrar.",
  loginErrorWeakPassword: "A senha precisa ter pelo menos 8 caracteres e incluir uma letra e um número.",
  loginAgeTermsLine: "Tenho 13 anos ou mais e concordo com os",
  loginTermsLinkLabel: "Termos",
  loginPrivacyLinkLabel: "Política de Privacidade",
  loginErrorAgeRequired: "Confirme que você tem 13 anos ou mais e concorda com os Termos e a Política de Privacidade.",
  loginErrorInvalidEmail: "Digite um e-mail válido.",
  loginErrorGoogleFailed: "Não foi possível entrar com Google. Tente de novo.",
  loginErrorGeneric: "Algo deu errado. Tente de novo.",

  composeEyebrow: "Compor",
  composeTitleTemplate: (w) => `Escreva sua própria frase com ${w}`,
  composeSubtitle:
    "Use a palavra numa frase e receba feedback na hora sobre gramática, tom e encaixe.",
  composeMeaningPickerLabel: "Escolha o significado que está praticando",
  composePlaceholder: "Escreva sua frase aqui…",
  composeSubmit: "Verificar",
  composeChecking: "Verificando…",
  composeStatusPerfectLabel: "Perfeito",
  composeStatusAlmostLabel: "Quase",
  composeStatusIncorrectLabel: "Outro significado",
  composeSuggestionEyebrow: "Sugestão de reescrita",
  composeTryAnother: "Tentar outra frase",
  composeBackToWord: "Voltar à palavra",
  composeErrorEmpty: "Escreva uma frase primeiro.",
  composeErrorTooShort: "Escreva pelo menos algumas palavras.",

  quizEyebrow: "Prática",
  quizTitleTemplate: (w) => `${w}, quiz`,
  quizQuestionNofM: (n, m) => `Pergunta ${n} de ${m}`,
  quizSubmit: "Enviar",
  quizNext: "Próxima",
  quizFinish: "Finalizar",
  quizYesCorrect: "Correto",
  quizNotQuite: "Não exatamente",
  quizLoading: "Preparando seu quiz…",
  quizFinalScoreTemplate: (c, t) => `Você acertou ${c} de ${t}.`,
  quizPracticeAnotherWord: "Praticar outra palavra",
  quizBackToWord: "Voltar à palavra",
  quizReviewMistakes: "Revisar as que errei",

  compareEyebrow: "Comparar",
  compareTitle: "Diferencie palavras parecidas",
  compareSubtitle:
    "mau vs mal, affect vs effect, palavras que confundem até nativos.",
  compareWord1Label: "Palavra 1",
  compareWord2Label: "Palavra 2",
  compareWord1Placeholder: "mau",
  compareWord2Placeholder: "mal",
  compareCta: "Comparar",
  compareLoading: "Comparando…",
  compareEmpty: "Digite duas palavras para comparar",
  compareDifferenceLabel: "A diferença",
  compareExamplesLabel: "Exemplos",
  compareCommonMistakeLabel: "Erro comum",
  compareErrNotARealWord: "Não reconhecemos uma dessas palavras.",
  compareErrDifferentLanguages:
    "Estas palavras parecem estar em idiomas diferentes, tente um par no mesmo idioma.",
  compareErrSameWord: "Parecem ser a mesma palavra, tente duas diferentes.",
  compareErrGeneric: "Comparação indisponível agora.",

  notebookEyebrow: "Caderno",
  notebookTitle: "Seu universo de palavras",
  notebookSubtitle:
    "Cada palavra que você explorou, guardada, organizada, crescendo.",
  notebookCounterTemplate: (n) => `${n} palavras exploradas`,
  notebookWordsExplored: "palavras exploradas",
  notebookPracticeNow: "Praticar agora",
  notebookDueTodayTemplate: (n) => `${n} para revisar hoje`,
  notebookListView: "Lista",
  notebookGalaxyView: "Galáxia",
  notebookEmptyTitle: "Seu caderno está vazio",
  notebookEmptyCta: "Pesquise uma palavra para começar",
  notebookRemoveAria: "Remover",
  notebookMasteredLabel: "★ Dominada",
  notebookSavedOnTemplate: (d) => `Salva em ${d}`,
  notebookLegendRecent: "Recentes",
  notebookLegendMastered: "Dominadas",
  notebookLegendNeedsReview: "Para revisar",

  srEyebrow: "Prática",
  srWordNofMTemplate: (n, m) => `Palavra ${n} de ${m}`,
  srSkip: "Pular",
  srClickToReveal: "Clique para revelar",
  srTapToReveal: "Toque para revelar",
  srPrimaryMeaningLabel: "Significado principal",
  srExamplesLabel: "Exemplos",
  srIForgot: "Esqueci",
  srIKnewIt: "Sabia",
  srSchedulingHint:
    "Sabia = próxima em alguns dias. Esqueci = volta hoje.",
  srWordsPracticed: "palavras praticadas",
  srSummaryStatTemplate: (k, f) => `${k} você sabia · ${f} pra revisar`,
  srTomorrow: "Amanhã",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    return `Próxima revisão: ${when} (${n} ${n === 1 ? "palavra" : "palavras"})`;
  },
  srDoneForToday: "Por hoje é só",
  srPracticeMore: "Praticar mais",
  srEmptyTitle: "Nada pra revisar hoje",
  srEmptyBody: "Mandou bem. Volte amanhã.",
  srBackToNotebook: "Voltar ao caderno",
  srLoading: "Carregando sua prática…",

  accountEyebrow: "Conta",
  accountYourSpace: "Seu espaço",
  accountNamedSpaceTemplate: (n) => `Espaço de ${n}`,
  accountPlanLabel: "Plano",
  accountOnPlanFree: "Gratuito",
  accountNoActiveSubscription: "Sem assinatura ativa",
  accountChooseAPlan: "Escolha um plano para começar.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    return `Teste de 14 dias · ${n} ${n === 1 ? "dia" : "dias"} restantes`;
  },
  accountRenewsOnTemplate: (d) => `Renova em ${d}`,
  accountCancelsAtPeriodEnd: "Cancela no fim do período de pagamento",
  accountManageBilling: "Gerenciar faturamento",
  accountChangePlan: "Mudar plano",
  accountUpgrade: "Fazer upgrade",
  accountUsageThisMonth: "Uso neste mês",
  accountImageGeneration: "Geração de imagens",
  accountSearches: "Pesquisas",
  accountLocked: "Bloqueado",
  accountUnlimited: "ilimitadas",
  accountTodaySuffix: "hoje",
  accountNearingLimit: "Chegando ao limite do mês.",
  accountSectionLabel: "Conta",
  accountEmailLabel: "E-mail",
  accountChangeEmail: "Mudar e-mail",
  accountSignOut: "Sair",
  accountDeleteAccount: "Excluir conta",

  reportEyebrow: "Reportar erro",
  reportTitle: "O que está errado?",
  reportTellMore: "Conte mais",
  reportTellMorePh: "Opcional. Quanto mais específico, mais rápido a gente conserta.",
  reportSend: "Enviar",
  reportSending: "Enviando…",
  reportThanks: "Valeu, recebemos.",
  reportError: "Não foi possível enviar. Tente daqui a pouco.",
  reportCatIncorrectDefinition: "Definição incorreta",
  reportCatWrongEtymology: "Etimologia errada",
  reportCatBadExample: "Exemplo ruim",
  reportCatKidsExplanation: "Problema na explicação para crianças",
  reportCatIdiomIssue: "Problema com expressão",
  reportCatWrongImage: "Imagem errada",
  reportCatQuizWrongAnswer: "Quiz: resposta marcada errada",
  reportCatComposeFeedback: "Problema com feedback da composição",
  reportCatCompareResult: "Problema com resultado da comparação",
  reportCatSomethingElse: "Outra coisa",

  origin: "Origem",
  historyNote: "Nota histórica",
  throughTime: "Ao longo do tempo",
  forKids: "Para crianças",
  commonExpressions: "Expressões comuns",
  idiomsWithMeaning: "Expressões com este significado",
  meaningN: (n) => `Significado ${n}`,
  notJustPrimary: "Não só o principal",
  takeItFurther: "Vá mais a fundo",
  doMoreWith: (w) => `Faça mais com ${w}`,
  saveToNotebook: "Salvar no caderno",
  saveToNotebookHint: "Volte depois, organizado e com busca.",
  generateImage: "Gerar imagem",
  generatingImage: "Gerando…",
  generateImageHint: "Uma imagem viva feita por IA, pra esta palavra.",
  composeSentence: "Compor uma frase",
  composeSentenceHint:
    "Escreva a sua, o Gadit revisa o tom e o encaixe.",
  practiceWord: "Praticar esta palavra",
  practiceWordHint: "Um quiz curto adaptado a você.",
  unlockWithClear: "Desbloqueie com Clear",
  upgradeToClear: "Passe pro Clear",
  softWallAnonTitle: "Você usou suas buscas grátis",
  softWallAnonBody:
    "Cadastre-se grátis pra buscar até 20 palavras por dia, com definições completas, exemplos, expressões e a origem da palavra.",
  softWallSignupCta: "Cadastrar grátis",
  softWallBasicTitle: "Você atingiu o limite de hoje",
  softWallBasicBody:
    "Contas grátis têm 20 buscas por dia. O limite reinicia amanhã, ou passe pro Clear pra ter buscas ilimitadas, imagens, modo crianças e feedback de frases.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Sobra 1 busca grátis hoje, cadastre-se grátis pra ter 20 por dia."
      : `Sobram ${num} buscas grátis hoje, cadastre-se grátis pra ter 20 por dia.`;
  },
  clearUnlocksThis: "Disponível no Clear",
  visualizeThisWord: "Visualizar",
  visualBlurb:
    "Uma imagem viva, gerada pelo Gadit, uma âncora visual pra esta palavra.",
  visualBlurbLocked:
    "Crie uma imagem única pra esta palavra, entender pelo olhar.",
  reportLabel: "Reportar erro",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "Origem da palavra",
  visualEyebrow: "Visual",
  meaningsEyebrow: "Definições",
  idiomsEyebrow: "Expressões idiomáticas",
  wordOriginBackgroundLabel: "Contexto",
  wordOriginOriginalWord: "Palavra original",
  wordOriginBreakdown: "Partes da palavra",
  imageGeneratingLabel: "Gerando imagem…",
  imageGeneratingHint: "Geralmente leva de 10 a 15 segundos.",
  imageOpenFullAria: "Abrir imagem em tamanho completo",
  kidsComingSoon: "Explicação para crianças em breve.",
  compareComingSoon: "Jogos com palavras em breve.",
  shareDefinitionAria: "Compartilhar esta definição",
  takeItFurtherEyebrow: "Vá mais a fundo",
  wordOriginLanguage: "Idioma",
  wordOriginOriginallyMeant: "Significava originalmente",
  actionCompose: "Compor uma frase",
  actionQuiz: "Quiz",
  actionCompare: "Comparar palavras",
  actionKidsExplanation: "Explicação para crianças",
  saveToWordBook: "Salvar no caderno",
  savedToWordBook: "Salvo no caderno",
  listenToWord: "Ouvir",
  offlinePin: "Salvar offline",
  offlinePinned: "Salvo offline",
  offlinePinTitle: "Salvar esta palavra para estudar offline",
  offlinePinnedTitle: "Salvo, disponível sem WiFi",
  offlineDownloadPack: "Baixar pacote offline",
  offlineDownloadingPack: "Baixando…",
  offlinePackHeader: "Pacote offline",
  offlinePackDescription: "Adiciona as palavras mais buscadas no seu idioma ao seu caderno, disponíveis também sem WiFi para estudar offline.",
  visualEmptyLabel: "Uma imagem será criada para esta palavra",
  generateLabel: "Gerar",
  savedAgoTemplate: (t) => `Salva · ${t}`,
  shareLabel: "Compartilhar",
  backLabel: "Voltar",
};

// French — formal "vous" register, neutral (FR + QC).
const fr: Partial<V2Strings> = {
  homeHeadlineLine1: "Comprendre",
  homeHeadlineLine2: "jusqu'au bout.",
  homeSubline:
    "Un dictionnaire qui saisit le contexte, sens, origines, expressions et image vivante, en 11 langues.",

  searchPlaceholderHome: "Tapez un mot",
  voiceInputTitle: "Dicter un mot",
  addContext: "Ajouter du contexte",
  explain: "Expliquer",
  contextHint:
    "Vous lisez quelque chose ? Collez la phrase et nous choisissons le bon sens.",
  tryLabel: "Essayez",

  valuePropsEyebrow: "Ce que Gadit fait différemment",
  valuePropsTitle: "Plus qu'une définition, une façon de vivre avec le mot.",
  valueProp1Eyebrow: "Contextuel",
  valueProp1Title: "Le bon sens, à chaque fois",
  valueProp1Body:
    "Collez une phrase, Gadit choisit le sens qui convient, pas seulement le plus courant.",
  valueProp2Eyebrow: "Visuel",
  valueProp2Title: "Une image vivante, juste pour ce mot",
  valueProp2Body:
    "Générée pour chaque entrée. Un ancrage visuel, pas une photo de banque d'images.",
  valueProp3Eyebrow: "Étymologie",
  valueProp3Title: "Une note d'origine, pas un copier-coller de Wikipédia",
  valueProp3Body:
    "D'où vient le mot, raconté en un paragraphe, comme un ami curieux l'écrirait.",
  valueProp4Eyebrow: "11 langues",
  valueProp4Title: "Hébreu et arabe, vraiment natifs",
  valueProp4Body:
    "Vrai RTL, vraies polices, vraies expressions, pas une interface traduite à la va-vite.",

  previewLabel: "Aperçu",
  seeFullResult: "Voir le résultat complet",

  pricingEyebrow: "Tarifs",
  pricingTeaserTitle: "Trois niveaux. Tous avec du vrai contenu.",
  trustMicrocopy:
    "Annulez à tout moment · Essai 14 jours sur Clear mensuel · Sans frais jusqu'à la fin de l'essai",

  footerProductGroup: "Produit",
  footerLegalGroup: "Légal",
  footerCompare: "Comparer",
  footerNotebook: "Carnet",
  footerPricing: "Tarifs",
  footerPrivacy: "Confidentialité",
  footerTerms: "Conditions",
  footerContact: "Aide",
  footerTagline: "Un dictionnaire intelligent en 11 langues. Conçu pour vraiment lire.",
  footerLanguagesNote: "11 langues",

  signIn: "Se connecter",
  startFree: "Commencer gratuit",
  verbStampDef: "comprendre un mot jusqu'au bout",
  navSearch: "Rechercher",
  navCompare: "Comparer",
  navNotebook: "Carnet",
  navPricing: "Tarifs",
  navFeatures: "Fonctionnalités",
  navPlay: "Jeux",
  navAffiliates: "Affiliés",

  kidsModeLabel: "Enfants",
  kidsModeTooltipOff: "Touchez pour que chaque mot soit expliqué comme un parent l'expliquerait à son enfant.",
  kidsModeTooltipOn: "Mode enfants activé. Chaque définition sera écrite pour un enfant. Touchez pour désactiver.",
  kidsModeBasicGate: "Le mode enfants est une fonctionnalité de Clear. Passez au plan supérieur pour l'utiliser.",

  signupWelcomeTitle: "Bienvenue sur Gadit !",
  signupWelcomeBody: "Votre compte est prêt. Commencez en cherchant un mot.",

  pricingPageHeadline: "Trois niveaux. Tous avec du vrai contenu.",
  pricingPageSubline: "Commencez gratuitement. Passez à un plan supérieur quand la profondeur sert.",
  billingMonthly: "Mensuel",
  billingYearly: "Annuel",
  billingSave17: "Économisez 17%",

  tierBasicTagline: "Comprendre",
  tierBasicPitch: "Commencez avec l'essentiel.",
  tierBasicCta: "Commencer",
  tierBasicFeatures:
    "20 recherches par jour¶Tous les sens (pas seulement le principal)¶3 exemples par sens¶Étymologie et origine¶Connexion requise",

  tierClearTagline: "Visualiser",
  tierClearPitch:
    "Donnez vie aux mots, images, mode enfants et retours.",
  tierClearBadge: "Le plus populaire",
  tierClearCta: "Commencer l'essai 14 jours",
  tierClearCtaYearly: "Abonnement annuel",
  tierClearTrust: "Annulez à tout moment · Sans frais pendant l'essai",
  tierClearFeatures:
    "Tout ce qu'il y a dans Basic¶Recherches illimitées¶Explications pour enfants¶Une image par mot (30/mois)¶Écrivez une phrase et recevez un retour¶Expressions et locutions¶Historique de recherche (30 derniers jours)",

  tierDeepTagline: "Pratiquer",
  tierDeepPitch:
    "Construisez un vocabulaire personnel qui se renforce avec le temps.",
  tierDeepCta: "S'abonner à Deep",
  tierDeepFeatures:
    "Tout ce qu'il y a dans Clear¶Quiz d'entraînement¶Carnet personnel de mots¶Pratique intelligente pour un vocabulaire durable¶Distinguer les mots qui se ressemblent¶Une image par mot (100/mois)",

  basicEquivalent: "",
  clearEquivalent: "Équivalent à 2,50 $/mois",
  deepEquivalent: "Équivalent à 4,17 $/mois",

  trustStripCancel: "Annulez à tout moment via le portail Stripe",
  trustStripMoneyBack: "Remboursement 14 jours sur le premier achat",
  trustStripDataYours: "Vos données vous appartiennent, exportables à tout moment",
  trustStripNoAds: "Pas de pub, pas de pistage tiers",

  faqEyebrow: "Questions fréquentes",
  faqHeadline: "Questions, réponses",
  faqQ1: "Puis-je changer de plan ?",
  faqA1:
    "Oui, vous pouvez monter ou descendre à tout moment. Le calcul au prorata est automatique, vous ne payez que la différence.",
  faqQ2: "Que se passe-t-il si j'annule ?",
  faqA2:
    "Vous gardez l'accès jusqu'à la fin de la période payée, puis revenez à Basic. Aucune donnée n'est perdue.",
  faqQ3: "L'essai est-il vraiment gratuit ?",
  faqA3:
    "Oui. Une carte est demandée pour éviter les abus, mais aucun débit avant le 15e jour. Annulez avant = zéro frais.",
  faqQ4: "Pourquoi trois niveaux ?",
  faqA4:
    "Chaque utilisateur a besoin d'une profondeur différente. On préfère vous rejoindre où vous êtes plutôt que pousser un plan unique surchargé.",
  faqQ5: "Les explications pour enfants sont-elles sûres ?",
  faqA5:
    "Oui. Elles sont générées par IA avec les mêmes règles de sécurité que le contenu adulte. Aucun contenu enfant créé par les utilisateurs.",

  loginWelcomeBack: "Se connecter",
  loginCreateAccount: "Créez votre compte",
  loginContinueWithGoogle: "Continuer avec Google",
  loginInAppNotice: "Dans {app}, connectez-vous par e-mail ci-dessous. Pour l'option Google, ouvrez le lien dans le navigateur.",
  loginOrSeparator: "ou",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Mot de passe",
  loginEmailPlaceholder: "vous@exemple.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Se connecter",
  loginSubmitSignUp: "Créer un compte",
  loginSwitchToSignUp: "Pas de compte ? Inscrivez-vous",
  loginForgotPassword: "Mot de passe oublié ?",
  loginForgotPasswordEnterEmail: "Saisissez d'abord votre e-mail ci-dessus, puis touchez ici.",
  loginResetSent: "Si un compte existe pour cet e-mail, un lien de réinitialisation est en route.",
  loginResetError: "Impossible d'envoyer l'e-mail. Réessayez.",
  loginSwitchToSignIn: "Déjà un compte ? Connectez-vous",
  loginShowPassword: "Afficher le mot de passe",
  loginHidePassword: "Masquer le mot de passe",
  loginCloseAria: "Fermer",
  loginSigningIn: "Connexion…",
  loginCreatingAccount: "Création du compte…",
  loginErrorWrongCredentials: "E-mail ou mot de passe incorrect.",
  loginErrorEmailInUse: "Cet e-mail est déjà utilisé. Essayez de vous connecter.",
  loginErrorWeakPassword: "Le mot de passe doit faire au moins 8 caractères et inclure une lettre et un chiffre.",
  loginAgeTermsLine: "J'ai 13 ans ou plus et j'accepte les",
  loginTermsLinkLabel: "Conditions",
  loginPrivacyLinkLabel: "Politique de confidentialité",
  loginErrorAgeRequired: "Veuillez confirmer que vous avez 13 ans ou plus et acceptez les Conditions et la Politique de confidentialité.",
  loginErrorInvalidEmail: "Saisissez un e-mail valide.",
  loginErrorGoogleFailed: "Connexion Google impossible. Réessayez.",
  loginErrorGeneric: "Une erreur est survenue. Réessayez.",

  composeEyebrow: "Composer",
  composeTitleTemplate: (w) => `Écrivez votre propre phrase avec ${w}`,
  composeSubtitle:
    "Utilisez le mot dans une phrase et recevez un retour instantané sur la grammaire, le ton et l'emploi.",
  composeMeaningPickerLabel: "Choisissez le sens que vous travaillez",
  composePlaceholder: "Tapez votre phrase ici…",
  composeSubmit: "Vérifier",
  composeChecking: "Vérification…",
  composeStatusPerfectLabel: "Parfait",
  composeStatusAlmostLabel: "Presque",
  composeStatusIncorrectLabel: "Pas ce sens",
  composeSuggestionEyebrow: "Réécriture suggérée",
  composeTryAnother: "Essayer une autre phrase",
  composeBackToWord: "Retour au mot",
  composeErrorEmpty: "Écrivez d'abord une phrase.",
  composeErrorTooShort: "Écrivez au moins quelques mots.",

  quizEyebrow: "Pratique",
  quizTitleTemplate: (w) => `${w}, quiz`,
  quizQuestionNofM: (n, m) => `Question ${n} sur ${m}`,
  quizSubmit: "Envoyer",
  quizNext: "Suivante",
  quizFinish: "Terminer",
  quizYesCorrect: "Correct",
  quizNotQuite: "Pas tout à fait",
  quizLoading: "Préparation du quiz…",
  quizFinalScoreTemplate: (c, t) => `Vous avez ${c} sur ${t} bonnes réponses.`,
  quizPracticeAnotherWord: "Pratiquer un autre mot",
  quizBackToWord: "Retour au mot",
  quizReviewMistakes: "Revoir mes erreurs",

  compareEyebrow: "Comparer",
  compareTitle: "Distinguez les mots qui se ressemblent",
  compareSubtitle:
    "a vs à, affect vs effect, les mots qui piègent même les locuteurs natifs.",
  compareWord1Label: "Mot 1",
  compareWord2Label: "Mot 2",
  compareWord1Placeholder: "a",
  compareWord2Placeholder: "à",
  compareCta: "Comparer",
  compareLoading: "Comparaison…",
  compareEmpty: "Saisissez deux mots à comparer",
  compareDifferenceLabel: "La différence",
  compareExamplesLabel: "Exemples",
  compareCommonMistakeLabel: "Erreur fréquente",
  compareErrNotARealWord: "L'un de ces mots n'est pas reconnu.",
  compareErrDifferentLanguages:
    "Ces deux mots semblent être dans des langues différentes, essayez une paire dans la même langue.",
  compareErrSameWord: "On dirait le même mot, essayez deux mots différents.",
  compareErrGeneric: "Comparaison indisponible pour le moment.",

  notebookEyebrow: "Carnet",
  notebookTitle: "Votre univers de mots",
  notebookSubtitle:
    "Chaque mot exploré, gardé, organisé, qui s'enrichit.",
  notebookCounterTemplate: (n) => `${n} mots explorés`,
  notebookWordsExplored: "mots explorés",
  notebookPracticeNow: "Pratiquer",
  notebookDueTodayTemplate: (n) => `${n} à revoir aujourd'hui`,
  notebookListView: "Liste",
  notebookGalaxyView: "Galaxie",
  notebookEmptyTitle: "Votre carnet est vide",
  notebookEmptyCta: "Cherchez un mot pour commencer",
  notebookRemoveAria: "Retirer",
  notebookMasteredLabel: "★ Maîtrisé",
  notebookSavedOnTemplate: (d) => `Enregistré le ${d}`,
  notebookLegendRecent: "Récents",
  notebookLegendMastered: "Maîtrisés",
  notebookLegendNeedsReview: "À revoir",

  srEyebrow: "Pratique",
  srWordNofMTemplate: (n, m) => `Mot ${n} sur ${m}`,
  srSkip: "Passer",
  srClickToReveal: "Cliquez pour révéler",
  srTapToReveal: "Touchez pour révéler",
  srPrimaryMeaningLabel: "Sens principal",
  srExamplesLabel: "Exemples",
  srIForgot: "Oublié",
  srIKnewIt: "Je savais",
  srSchedulingHint:
    "Je savais = prochaine révision dans quelques jours. Oublié = retour aujourd'hui.",
  srWordsPracticed: "mots pratiqués",
  srSummaryStatTemplate: (k, f) => `${k} su · ${f} à revoir`,
  srTomorrow: "Demain",
  srNextReviewTemplate: (when, count) => {
    const n = Number(count);
    return `Prochaine révision : ${when} (${n} ${n === 1 ? "mot" : "mots"})`;
  },
  srDoneForToday: "Terminé pour aujourd'hui",
  srPracticeMore: "Continuer à pratiquer",
  srEmptyTitle: "Rien à revoir aujourd'hui",
  srEmptyBody: "Bien joué. Revenez demain.",
  srBackToNotebook: "Retour au carnet",
  srLoading: "Chargement de votre pratique…",

  accountEyebrow: "Compte",
  accountYourSpace: "Votre espace",
  accountNamedSpaceTemplate: (n) => `Espace de ${n}`,
  accountPlanLabel: "Plan",
  accountOnPlanFree: "Gratuit",
  accountNoActiveSubscription: "Aucun abonnement actif",
  accountChooseAPlan: "Choisissez un plan pour commencer.",
  accountTrialBadgeTemplate: (d) => {
    const n = Number(d);
    return `Essai 14 jours · ${n} ${n === 1 ? "jour" : "jours"} restants`;
  },
  accountRenewsOnTemplate: (d) => `Renouvelé le ${d}`,
  accountCancelsAtPeriodEnd: "Se termine à la fin de la période payée",
  accountManageBilling: "Gérer la facturation",
  accountChangePlan: "Changer de plan",
  accountUpgrade: "Mettre à niveau",
  accountUsageThisMonth: "Utilisation ce mois-ci",
  accountImageGeneration: "Génération d'images",
  accountSearches: "Recherches",
  accountLocked: "Verrouillé",
  accountUnlimited: "illimitées",
  accountTodaySuffix: "aujourd'hui",
  accountNearingLimit: "Vous approchez de la limite du mois.",
  accountSectionLabel: "Compte",
  accountEmailLabel: "E-mail",
  accountChangeEmail: "Changer d'e-mail",
  accountSignOut: "Se déconnecter",
  accountDeleteAccount: "Supprimer le compte",

  reportEyebrow: "Signaler une erreur",
  reportTitle: "Qu'est-ce qui ne va pas ?",
  reportTellMore: "Dites-en plus",
  reportTellMorePh: "Facultatif. Plus c'est précis, plus vite on corrige.",
  reportSend: "Envoyer",
  reportSending: "Envoi…",
  reportThanks: "Merci, bien reçu.",
  reportError: "L'envoi a échoué. Réessayez dans un instant.",
  reportCatIncorrectDefinition: "Définition incorrecte",
  reportCatWrongEtymology: "Étymologie erronée",
  reportCatBadExample: "Mauvais exemple",
  reportCatKidsExplanation: "Problème avec l'explication enfants",
  reportCatIdiomIssue: "Problème d'expression",
  reportCatWrongImage: "Image incorrecte",
  reportCatQuizWrongAnswer: "Quiz : mauvaise réponse marquée",
  reportCatComposeFeedback: "Problème de retour de composition",
  reportCatCompareResult: "Problème de résultat de comparaison",
  reportCatSomethingElse: "Autre chose",

  origin: "Origine",
  historyNote: "Note historique",
  throughTime: "À travers le temps",
  forKids: "Pour enfants",
  commonExpressions: "Expressions courantes",
  idiomsWithMeaning: "Expressions avec ce sens",
  meaningN: (n) => `Sens ${n}`,
  notJustPrimary: "Pas seulement le principal",
  takeItFurther: "Aller plus loin",
  doMoreWith: (w) => `Aller plus loin avec ${w}`,
  saveToNotebook: "Enregistrer dans le carnet",
  saveToNotebookHint: "Vous y revenez plus tard, organisé et cherchable.",
  generateImage: "Générer une image",
  generatingImage: "Génération…",
  generateImageHint: "Une image vivante par IA, juste pour ce mot.",
  composeSentence: "Composer une phrase",
  composeSentenceHint:
    "Écrivez la vôtre, Gadit relit le ton et l'emploi.",
  practiceWord: "Pratiquer ce mot",
  practiceWordHint: "Un quiz court adapté à vous.",
  unlockWithClear: "Débloquer avec Clear",
  upgradeToClear: "Passer à Clear",
  softWallAnonTitle: "Vous avez utilisé vos recherches gratuites",
  softWallAnonBody:
    "Inscrivez-vous gratuitement pour chercher jusqu'à 20 mots par jour, avec définitions complètes, exemples, expressions et origine du mot.",
  softWallSignupCta: "Inscription gratuite",
  softWallBasicTitle: "Vous avez atteint la limite du jour",
  softWallBasicBody:
    "Les comptes gratuits ont 20 recherches par jour. La limite se réinitialise demain, ou passez à Clear pour des recherches illimitées, des images, le mode enfants et les retours sur phrases.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Il vous reste 1 recherche gratuite aujourd'hui, inscription gratuite pour 20 par jour."
      : `Il vous reste ${num} recherches gratuites aujourd'hui, inscription gratuite pour 20 par jour.`;
  },
  clearUnlocksThis: "Disponible dans Clear",
  visualizeThisWord: "Voir",
  visualBlurb:
    "Une image vivante, générée par Gadit, un ancrage visuel pour ce mot.",
  visualBlurbLocked:
    "Créez une image unique pour ce mot, comprendre par l'image.",
  reportLabel: "Signaler une erreur",

  // ── Wordbook redesign ───────────────────────────────────────
  wordOriginEyebrow: "Origine du mot",
  visualEyebrow: "Visuel",
  meaningsEyebrow: "Définitions",
  idiomsEyebrow: "Idiomes et expressions",
  wordOriginBackgroundLabel: "Contexte",
  wordOriginOriginalWord: "Mot original",
  wordOriginBreakdown: "Parties du mot",
  imageGeneratingLabel: "Génération de l'image…",
  imageGeneratingHint: "Cela prend généralement 10 à 15 secondes.",
  imageOpenFullAria: "Ouvrir l'image en taille réelle",
  kidsComingSoon: "L'explication pour enfants arrive bientôt.",
  compareComingSoon: "Jeux de mots bientôt disponibles.",
  shareDefinitionAria: "Partager cette définition",
  takeItFurtherEyebrow: "Aller plus loin",
  wordOriginLanguage: "Langue",
  wordOriginOriginallyMeant: "Signifiait à l'origine",
  actionCompose: "Composer une phrase",
  actionQuiz: "Quiz",
  actionCompare: "Comparer les mots",
  actionKidsExplanation: "Explication pour enfants",
  saveToWordBook: "Enregistrer dans le carnet",
  savedToWordBook: "Enregistré dans le carnet",
  listenToWord: "Écouter",
  offlinePin: "Enregistrer hors ligne",
  offlinePinned: "Enregistré hors ligne",
  offlinePinTitle: "Enregistrer ce mot pour l'étudier hors ligne",
  offlinePinnedTitle: "Enregistré, disponible sans WiFi",
  offlineDownloadPack: "Télécharger le pack hors ligne",
  offlineDownloadingPack: "Téléchargement…",
  offlinePackHeader: "Pack hors ligne",
  offlinePackDescription: "Ajoute les mots les plus recherchés dans votre langue à votre carnet, disponibles aussi sans WiFi pour étudier hors ligne.",
  visualEmptyLabel: "Une image sera créée pour ce mot",
  generateLabel: "Générer",
  savedAgoTemplate: (t) => `Enregistré · ${t}`,
  shareLabel: "Partager",
  backLabel: "Retour",
};

// New languages — declared empty so v2() falls through to EN. Specific
// keys that are user-visible at launch (homepage, pricing, login,
// search, share modal) live in the per-page COPY tables and modal
// COPY records, which DO have full DE+CS translations.
// DE / CS: most strings used to live in per-page COPY tables and modal
// records (those already have full DE+CS coverage). The chrome strings
// that result.tsx pulls via v2() were left to fall back to EN — which
// looked broken on a Czech word page where the surrounding UI was
// already Czech. Translated all result-page-visible chrome here so
// 'every language shows everything in that language' actually holds.
const de: V2Strings = {
  homeHeadlineLine1: "Verstehen",
  homeHeadlineLine2: "bis zum Ende.",
  homeSubline:
    "Ein Wörterbuch, das dich im Kontext abholt: Bedeutungen, Ursprünge, Redewendungen und ein lebendiges Bild, in 11 Sprachen.",
  searchPlaceholderHome: "Tippe ein Wort",
  voiceInputTitle: "Wort diktieren",
  addContext: "Kontext hinzufügen",
  explain: "Erklären",
  contextHint: "Liest du gerade etwas? Füge den Satz ein, um die Bedeutung zu klären.",
  tryLabel: "Probier",

  valuePropsEyebrow: "Was Gadit anders macht",
  valuePropsTitle: "Mehr als eine Definition: eine Art, mit einem Wort zu leben.",
  valueProp1Eyebrow: "Kontextbewusst",
  valueProp1Title: "Die richtige Bedeutung, jedes Mal",
  valueProp1Body: "Füge einen Satz ein. Gadit wählt den passenden Sinn, nicht nur den häufigsten.",
  valueProp2Eyebrow: "Visuell",
  valueProp2Title: "Ein lebendiges Bild, nur für dieses Wort",
  valueProp2Body: "Für jeden Eintrag generiert. Ein visueller Anker für das Gefühl eines Wortes, kein Stockfoto.",
  valueProp3Eyebrow: "Etymologie",
  valueProp3Title: "Eine Hintergrundnotiz, kein Wikipedia-Abklatsch",
  valueProp3Body: "Wo das Wort herkommt, erzählt als Absatz, wie ein neugieriger Freund ihn schreiben würde.",
  valueProp4Eyebrow: "11 Sprachen",
  valueProp4Title: "Hebräisch und Arabisch, vollständig nativ",
  valueProp4Body: "Echtes RTL, echte Schriften, echte Redewendungen. Keine aufgesetzte Übersetzungs-UI.",

  previewLabel: "Vorschau",
  seeFullResult: "Vollständiges Ergebnis ansehen",

  pricingEyebrow: "Preise",
  pricingTeaserTitle: "Drei Stufen. Alle mit echten Inhalten.",
  trustMicrocopy:
    "Jederzeit kündbar · 14-Tage-Test auf Clear monatlich · Keine Abbuchung bis zum Ende des Tests",

  footerProductGroup: "Produkt",
  footerLegalGroup: "Rechtliches",
  footerCompare: "Vergleichen",
  footerNotebook: "Notizbuch",
  footerPricing: "Preise",
  footerPrivacy: "Datenschutz",
  footerTerms: "AGB",
  footerContact: "Hilfe",
  footerTagline: "Ein intelligentes Wörterbuch für 11 Sprachen. Gemacht fürs echte Lesen.",
  footerLanguagesNote: "11 Sprachen",

  signIn: "Anmelden",
  startFree: "Kostenlos starten",
  verbStampDef: "ein Wort bis zum Ende verstehen",
  navSearch: "Suche",
  navCompare: "Vergleichen",
  navNotebook: "Notizbuch",
  navPricing: "Preise",
  navFeatures: "Funktionen",
  navPlay: "Spielen",
  navAffiliates: "Affiliates",

  kidsModeLabel: "Kinder",
  kidsModeTooltipOff: "Tippe, damit jedes Wort so erklärt wird, wie ein Elternteil es einem Kind erklären würde.",
  kidsModeTooltipOn: "Kindermodus an. Jede Definition wird für ein Kind geschrieben. Tippe zum Ausschalten.",
  kidsModeBasicGate: "Kindermodus ist eine Clear-Funktion. Upgrade, um sie zu nutzen.",

  signupWelcomeTitle: "Willkommen bei Gadit!",
  signupWelcomeBody: "Dein Konto ist bereit. Such direkt ein Wort.",

  pricingPageHeadline: "Drei Stufen. Alle mit echten Inhalten.",
  pricingPageSubline: "Kostenlos starten. Upgrade, wenn die Tiefe dir hilft.",
  billingMonthly: "Monatlich",
  billingYearly: "Jährlich",
  billingSave17: "17% sparen",

  tierBasicTagline: "Verstehen",
  tierBasicPitch: "Beginne mit dem Wesentlichen.",
  tierBasicCta: "Loslegen",
  tierBasicFeatures:
    "20 Wortsuchen pro Tag¶Alle Bedeutungen (nicht nur die primäre)¶3 Beispiele pro Bedeutung¶Etymologie und Herkunft¶Anmeldung erforderlich",

  tierClearTagline: "Sichtbar machen",
  tierClearPitch: "Erwecke Wörter mit Bildern, Kindermodus und Feedback zum Leben.",
  tierClearBadge: "Am beliebtesten",
  tierClearCta: "14-tägige kostenlose Probe starten",
  tierClearCtaYearly: "Jährlich abonnieren",
  tierClearTrust: "Jederzeit kündbar · Keine Abbuchung während der Probe",
  tierClearFeatures:
    "Alles aus Basic¶Unbegrenzte Suchen¶Erklärungen für Kinder¶Bild zu jedem Wort (30/Monat)¶Schreibe einen Satz und erhalte Feedback¶Redewendungen und Ausdrücke¶Suchverlauf (letzte 30 Tage)",

  tierDeepTagline: "Üben",
  tierDeepPitch: "Baue eine persönliche Wortschatzbibliothek auf, die mit der Zeit stärker wird.",
  tierDeepCta: "Deep abonnieren",
  tierDeepFeatures:
    "Alles aus Clear¶Übungsquizze¶Persönliches Wörter-Notizbuch¶Smartes Üben für nachhaltigen Wortschatz¶Ähnliche Wörter unterscheiden¶Bild zu jedem Wort (100/Monat)",

  basicEquivalent: "",
  clearEquivalent: "Entspricht 2,50 $/Monat",
  deepEquivalent: "Entspricht 4,17 $/Monat",

  trustStripCancel: "Jederzeit über das Stripe-Portal kündbar",
  trustStripMoneyBack: "14 Tage Geld-zurück-Garantie auf den ersten Kauf",
  trustStripDataYours: "Deine Daten gehören dir, jederzeit exportierbar",
  trustStripNoAds: "Keine Werbung, kein Tracking durch Dritte",

  faqEyebrow: "FAQ",
  faqHeadline: "Fragen, beantwortet",
  faqQ1: "Kann ich den Plan wechseln?",
  faqA1: "Ja, jederzeit auf- oder abstufen. Anteilige Berechnung läuft automatisch, du zahlst nur die Differenz.",
  faqQ2: "Was passiert, wenn ich kündige?",
  faqA2: "Du behältst den Zugang bis zum Ende deines Abrechnungszeitraums, dann fällt das Konto auf Basic zurück. Keine Daten gehen verloren.",
  faqQ3: "Ist die Probe wirklich kostenlos?",
  faqA3: "Ja. Wir verlangen eine Karte, um Missbrauch zu verhindern, abgebucht wird aber erst ab Tag 15. Vorher kündigen = null Kosten.",
  faqQ4: "Warum drei Stufen?",
  faqA4: "Verschiedene Nutzer brauchen verschiedene Tiefen. Lieber dort treffen, wo du bist, als einen aufgeblähten Einheitsplan verkaufen.",
  faqQ5: "Sind Erklärungen für Kinder sicher?",
  faqA5: "Ja. Sie werden mit derselben Sorgfalt wie Inhalte für Erwachsene generiert und nach unseren Inhaltsregeln geprüft. Keine nutzergenerierten Kinderinhalte.",

  loginWelcomeBack: "Anmelden",
  loginCreateAccount: "Konto erstellen",
  loginContinueWithGoogle: "Mit Google fortfahren",
  loginInAppNotice: "In {app} unten mit E-Mail anmelden. Für die Google-Option den Link im Browser öffnen.",
  loginOrSeparator: "oder",
  loginEmailLabel: "E-Mail",
  loginPasswordLabel: "Passwort",
  loginEmailPlaceholder: "du@beispiel.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Anmelden",
  loginSubmitSignUp: "Konto erstellen",
  loginSwitchToSignUp: "Noch kein Konto? Registrieren",
  loginForgotPassword: "Passwort vergessen?",
  loginForgotPasswordEnterEmail: "Gib zuerst deine E-Mail oben ein, dann tippe hier.",
  loginResetSent: "Wenn ein Konto für diese E-Mail existiert, ist ein Reset-Link unterwegs.",
  loginResetError: "Die Reset-E-Mail konnte nicht gesendet werden. Versuche es erneut.",
  loginSwitchToSignIn: "Hast du bereits ein Konto? Anmelden",
  loginShowPassword: "Passwort anzeigen",
  loginHidePassword: "Passwort verbergen",
  loginCloseAria: "Schließen",
  loginSigningIn: "Anmeldung läuft…",
  loginCreatingAccount: "Konto wird erstellt…",
  loginErrorWrongCredentials: "Falsche E-Mail oder Passwort.",
  loginErrorEmailInUse: "E-Mail bereits in Verwendung. Versuche dich anzumelden.",
  loginErrorWeakPassword: "Das Passwort muss mindestens 8 Zeichen lang sein und Buchstabe und Zahl enthalten.",
  loginAgeTermsLine: "Ich bin 13 oder älter und stimme den",
  loginTermsLinkLabel: "AGB",
  loginPrivacyLinkLabel: "Datenschutzerklärung",
  loginErrorAgeRequired: "Bitte bestätige, dass du 13 oder älter bist und den AGB und der Datenschutzerklärung zustimmst.",
  loginErrorInvalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
  loginErrorGoogleFailed: "Anmeldung mit Google fehlgeschlagen. Versuche es erneut.",
  loginErrorGeneric: "Etwas ist schiefgelaufen. Versuche es erneut.",

  composeEyebrow: "Schreiben",
  composeTitleTemplate: (w) => `Schreibe deinen eigenen Satz mit ${w}`,
  composeSubtitle: "Nutze es in einem Satz und erhalte sofort Feedback zu Grammatik, Ton und Passung.",
  composeMeaningPickerLabel: "Wähle die Bedeutung, die du übst",
  composePlaceholder: "Tippe deinen Satz hier…",
  composeSubmit: "Satz prüfen",
  composeChecking: "Prüfe…",
  composeStatusPerfectLabel: "Perfekt",
  composeStatusAlmostLabel: "Fast geschafft",
  composeStatusIncorrectLabel: "Nicht ganz",
  composeSuggestionEyebrow: "Vorgeschlagene Umformulierung",
  composeTryAnother: "Einen anderen Satz probieren",
  composeBackToWord: "Zurück zum Wort",
  composeErrorEmpty: "Bitte schreibe zuerst einen Satz.",
  composeErrorTooShort: "Bitte schreibe mindestens ein paar Wörter.",

  quizEyebrow: "Üben",
  quizTitleTemplate: (w) => `${w}, Quiz`,
  quizQuestionNofM: (n, m) => `Frage ${n} von ${m}`,
  quizSubmit: "Senden",
  quizNext: "Nächste Frage",
  quizFinish: "Beenden",
  quizYesCorrect: "Ja, richtig",
  quizNotQuite: "Nicht ganz",
  quizLoading: "Dein Quiz wird vorbereitet…",
  quizFinalScoreTemplate: (c, t) => `Du hast ${c} von ${t} richtig.`,
  quizPracticeAnotherWord: "Ein anderes Wort üben",
  quizBackToWord: "Zurück zum Wort",
  quizReviewMistakes: "Die falschen noch einmal ansehen",

  compareEyebrow: "Vergleichen",
  compareTitle: "Ähnliche Wörter unterscheiden",
  compareSubtitle:
    "wie vs als, das vs dass, leihen vs verleihen, die Wörter, bei denen selbst Muttersprachler stolpern.",
  compareWord1Label: "Wort 1",
  compareWord2Label: "Wort 2",
  compareWord1Placeholder: "wie",
  compareWord2Placeholder: "als",
  compareCta: "Vergleichen",
  compareLoading: "Vergleiche…",
  compareEmpty: "Gib zwei Wörter ein, um sie zu vergleichen",
  compareDifferenceLabel: "Der Unterschied",
  compareExamplesLabel: "Beispiele",
  compareCommonMistakeLabel: "Häufiger Fehler",
  compareErrNotARealWord: "Wir kennen eines dieser Wörter nicht.",
  compareErrDifferentLanguages: "Diese beiden Wörter scheinen in verschiedenen Sprachen zu sein. Probier ein passendes Paar.",
  compareErrSameWord: "Das sieht nach demselben Wort aus. Probier zwei verschiedene.",
  compareErrGeneric: "Vergleich aktuell nicht verfügbar.",

  notebookEyebrow: "Notizbuch",
  notebookTitle: "Dein Wörter-Universum",
  notebookSubtitle: "Jedes Wort, das du erkundet hast, behalten, sortiert und wachsend.",
  notebookCounterTemplate: (n) => `${n} Wörter erkundet`,
  notebookWordsExplored: "Wörter erkundet",
  notebookPracticeNow: "Jetzt üben",
  notebookDueTodayTemplate: (n) => `${n} heute fällig`,
  notebookListView: "Liste",
  notebookGalaxyView: "Galaxie",
  notebookEmptyTitle: "Dein Notizbuch ist leer",
  notebookEmptyCta: "Suche ein Wort, um zu beginnen",
  notebookRemoveAria: "Entfernen",
  notebookMasteredLabel: "★ Gemeistert",
  notebookSavedOnTemplate: (d) => `Gespeichert ${d}`,
  notebookLegendRecent: "Kürzlich gespeichert",
  notebookLegendMastered: "Gemeistert",
  notebookLegendNeedsReview: "Wiederholung nötig",

  srEyebrow: "Üben",
  srWordNofMTemplate: (n, m) => `Wort ${n} von ${m}`,
  srSkip: "Überspringen",
  srClickToReveal: "Klicke irgendwo, um zu enthüllen",
  srTapToReveal: "Tippe, um zu enthüllen",
  srPrimaryMeaningLabel: "Hauptbedeutung",
  srExamplesLabel: "Beispiele",
  srIForgot: "Vergessen",
  srIKnewIt: "Wusste ich",
  srSchedulingHint: "Wusste ich = nächste Wiederholung in ein paar Tagen. Vergessen = zurück auf heute.",
  srWordsPracticed: "geübte Wörter",
  srSummaryStatTemplate: (k, f) => `${k} gewusst · ${f} nochmal wiederholen`,
  srTomorrow: "Morgen",
  srNextReviewTemplate: (when, count) =>
    `Nächste Wiederholung: ${when} (${count} ${count === 1 ? "Wort" : "Wörter"} fällig)`,
  srDoneForToday: "Für heute fertig",
  srPracticeMore: "Mehr üben",
  srEmptyTitle: "Heute nichts zu wiederholen",
  srEmptyBody: "Gut gemacht. Komm morgen wieder.",
  srBackToNotebook: "Zurück zum Notizbuch",
  srLoading: "Deine Übung wird geladen…",

  accountEyebrow: "Konto",
  accountYourSpace: "Dein Bereich",
  accountNamedSpaceTemplate: (n) => `${n}s Bereich`,
  accountPlanLabel: "Plan",
  accountOnPlanFree: "Kostenlos",
  accountNoActiveSubscription: "Kein aktives Abo",
  accountChooseAPlan: "Wähle einen Plan, um loszulegen.",
  accountTrialBadgeTemplate: (d) =>
    `14-tägige Probe · ${d} ${Number(d) === 1 ? "Tag" : "Tage"} verbleibend`,
  accountRenewsOnTemplate: (d) => `Verlängert sich ${d}`,
  accountCancelsAtPeriodEnd: "Endet zum Ende der Abrechnungsperiode",
  accountManageBilling: "Abrechnung verwalten",
  accountChangePlan: "Plan ändern",
  accountUpgrade: "Upgrade",
  accountUsageThisMonth: "Nutzung diesen Monat",
  accountImageGeneration: "Bildgenerierung",
  accountSearches: "Suchen",
  accountLocked: "Gesperrt",
  accountUnlimited: "unbegrenzt",
  accountTodaySuffix: "heute",
  accountNearingLimit: "Nähert sich dem Monatslimit.",
  accountSectionLabel: "Konto",
  accountEmailLabel: "E-Mail",
  accountChangeEmail: "E-Mail ändern",
  accountSignOut: "Abmelden",
  accountDeleteAccount: "Konto löschen",

  reportEyebrow: "Fehler melden",
  reportTitle: "Was ist falsch?",
  reportTellMore: "Erzähl uns mehr",
  reportTellMorePh: "Optional. Je konkreter, desto schneller können wir es beheben.",
  reportSend: "Meldung senden",
  reportSending: "Sende…",
  reportThanks: "Danke, wir haben es erhalten.",
  reportError: "Konnte nicht gesendet werden. Versuche es gleich nochmal.",
  reportCatIncorrectDefinition: "Falsche Definition",
  reportCatWrongEtymology: "Falsche Etymologie",
  reportCatBadExample: "Schlechter Beispielsatz",
  reportCatKidsExplanation: "Problem mit Kindererklärung",
  reportCatIdiomIssue: "Problem mit Redewendung",
  reportCatWrongImage: "Falsches Bild",
  reportCatQuizWrongAnswer: "Quiz: richtige Antwort als falsch markiert",
  reportCatComposeFeedback: "Problem mit Schreib-Feedback",
  reportCatCompareResult: "Problem mit Vergleichsergebnis",
  reportCatSomethingElse: "Etwas anderes",

  origin: "Herkunft",
  historyNote: "Geschichtsnotiz",
  throughTime: "Im Lauf der Zeit",
  forKids: "Für Kinder",
  commonExpressions: "Gängige Ausdrücke",
  idiomsWithMeaning: "Redewendungen mit dieser Bedeutung",
  meaningN: (n) => `Bedeutung ${n}`,
  notJustPrimary: "Nicht nur die primäre",
  takeItFurther: "Mach mehr daraus",
  doMoreWith: (w) => `Mehr mit ${w}`,
  saveToNotebook: "Im Notizbuch speichern",
  saveToNotebookHint: "Komm später zurück, sortiert und durchsuchbar.",
  generateImage: "Bild erstellen",
  generatingImage: "Wird erstellt…",
  generateImageHint: "Eine lebendige, KI-gemachte Visualisierung, nur für dieses Wort.",
  composeSentence: "Einen Satz schreiben",
  composeSentenceHint: "Schreib deinen eigenen, Gadit prüft Ton und Passung.",
  practiceWord: "Dieses Wort üben",
  practiceWordHint: "Ein kurzes Quiz, das auf dein Lernen abgestimmt ist.",
  unlockWithClear: "Mit Clear freischalten",
  upgradeToClear: "Auf Clear upgraden",
  softWallAnonTitle: "Du hast deine kostenlosen Suchen verbraucht",
  softWallAnonBody:
    "Registriere dich kostenlos, um bis zu 20 Wörter am Tag zu suchen, mit vollständigen Definitionen, Beispielen, Redewendungen und Wortherkunft.",
  softWallSignupCta: "Registrieren, kostenlos",
  softWallBasicTitle: "Du hast das heutige Limit erreicht",
  softWallBasicBody:
    "Kostenlose Konten haben 20 Suchen pro Tag. Das Limit setzt sich morgen zurück, oder upgrade auf Clear für unbegrenzte Suchen plus Bilder, Kindermodus und Grammatik-Feedback.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "1 kostenlose Suche heute übrig, registriere dich kostenlos für 20 am Tag."
      : `${n} kostenlose Suchen heute übrig, registriere dich kostenlos für 20 am Tag.`,
  clearUnlocksThis: "Clear schaltet das frei",
  visualizeThisWord: "Visualisieren",
  visualBlurb: "Ein lebendiges Bild, von Gadit erstellt, ein visueller Anker für das Gefühl dieses Wortes.",
  visualBlurbLocked: "Erstelle ein lebendiges, einzigartiges Bild für dieses Wort, Verstehen durchs Sehen.",
  reportLabel: "Fehler melden",

  wordOriginEyebrow: "Wortursprung",
  idiomsEyebrow: "Redewendungen & Ausdrücke",
  wordOriginBackgroundLabel: "Hintergrund",
  wordOriginOriginalWord: "Ursprüngliches Wort",
  wordOriginBreakdown: "Wortteile",
  imageGeneratingLabel: "Bild wird erstellt…",
  imageGeneratingHint: "Das dauert normalerweise 10 bis 15 Sekunden.",
  imageOpenFullAria: "Bild in voller Größe öffnen",
  kidsComingSoon: "Kindererklärung kommt bald.",
  compareComingSoon: "Wortspiele kommen bald.",
  shareDefinitionAria: "Diese Definition teilen",
  visualEyebrow: "Bild",
  meaningsEyebrow: "Definitionen",
  takeItFurtherEyebrow: "Mach mehr daraus",
  wordOriginLanguage: "Sprache",
  wordOriginOriginallyMeant: "Ursprüngliche Bedeutung",
  actionCompose: "Satz schreiben",
  actionQuiz: "Quiz",
  actionCompare: "Wörter vergleichen",
  actionKidsExplanation: "Erklärung für Kinder",
  saveToWordBook: "Im Notizbuch speichern",
  savedToWordBook: "Im Notizbuch gespeichert",
  listenToWord: "Anhören",
  offlinePin: "Offline speichern",
  offlinePinned: "Offline gespeichert",
  offlinePinTitle: "Dieses Wort offline zum Lernen speichern",
  offlinePinnedTitle: "Gespeichert, ohne WLAN verfügbar",
  offlineDownloadPack: "Offline-Paket herunterladen",
  offlineDownloadingPack: "Lädt…",
  offlinePackHeader: "Offline-Paket",
  offlinePackDescription:
    "Fügt die meistgesuchten Wörter in deiner Sprache zu deinem Notizbuch hinzu, und hält sie ohne WLAN zum Offline-Lernen bereit.",
  visualEmptyLabel: "Für dieses Wort wird ein Bild gezeichnet",
  generateLabel: "Erstellen",
  savedAgoTemplate: (t) => `Gespeichert · ${t}`,
  shareLabel: "Teilen",
  backLabel: "Zurück",
};

const cs: V2Strings = {
  homeHeadlineLine1: "Rozumět",
  homeHeadlineLine2: "až do konce.",
  homeSubline:
    "Slovník, který tě potkává v kontextu: významy, původ, idiomy a živý obraz, v 11 jazycích.",
  searchPlaceholderHome: "Napiš slovo",
  voiceInputTitle: "Nadiktovat slovo",
  addContext: "Přidat kontext",
  explain: "Vysvětlit",
  contextHint: "Něco čteš? Vlož větu, aby byl význam jasný.",
  tryLabel: "Vyzkoušej",

  valuePropsEyebrow: "Čím se Gadit liší",
  valuePropsTitle: "Víc než definice, způsob, jak se slovem žít.",
  valueProp1Eyebrow: "Vnímá kontext",
  valueProp1Title: "Správný význam, pokaždé",
  valueProp1Body: "Vlož větu. Gadit vybere ten význam, který se hodí, ne jen ten nejčastější.",
  valueProp2Eyebrow: "Vizuální",
  valueProp2Title: "Živý obraz, jen pro toto slovo",
  valueProp2Body: "Vytvořený pro každé heslo. Vizuální kotva pro to, jak slovo působí, ne stocková fotka.",
  valueProp3Eyebrow: "Etymologie",
  valueProp3Title: "Příběh, ne odstavec z Wikipedie",
  valueProp3Body: "Odkud slovo přišlo, vyprávěno jako odstavec, který by napsal zvídavý přítel.",
  valueProp4Eyebrow: "11 jazyků",
  valueProp4Title: "Hebrejština a arabština plně nativně",
  valueProp4Body: "Skutečné RTL, skutečné fonty, skutečné idiomy. Ne přilepené překladové rozhraní.",

  previewLabel: "Náhled",
  seeFullResult: "Zobrazit kompletní výsledek",

  pricingEyebrow: "Ceník",
  pricingTeaserTitle: "Tři úrovně. Všechny s opravdovým obsahem.",
  trustMicrocopy: "Zruš kdykoli · 14denní zkušební verze na Clear měsíčně · Žádné účtování do konce zkušebky",

  footerProductGroup: "Produkt",
  footerLegalGroup: "Právní",
  footerCompare: "Porovnat",
  footerNotebook: "Sešit",
  footerPricing: "Ceník",
  footerPrivacy: "Soukromí",
  footerTerms: "Podmínky",
  footerContact: "Nápověda",
  footerTagline: "Chytrý slovník pro 11 jazyků. Stavěn pro skutečné čtení.",
  footerLanguagesNote: "11 jazyků",

  signIn: "Přihlásit se",
  startFree: "Začít zdarma",
  verbStampDef: "pochopit slovo až do konce",
  navSearch: "Hledat",
  navCompare: "Porovnat",
  navNotebook: "Sešit",
  navPricing: "Ceník",
  navFeatures: "Funkce",
  navPlay: "Hrát",
  navAffiliates: "Partneři",

  kidsModeLabel: "Děti",
  kidsModeTooltipOff: "Klepni, aby každé slovo bylo vysvětleno tak, jak by ho rodič vysvětlil dítěti.",
  kidsModeTooltipOn: "Dětský režim je zapnutý. Každá definice bude napsána pro dítě. Klepni pro vypnutí.",
  kidsModeBasicGate: "Dětský režim je funkce Clearu. Přejdi na vyšší plán, abys ho mohl používat.",

  signupWelcomeTitle: "Vítej v Gaditu!",
  signupWelcomeBody: "Tvůj účet je připraven. Začni hledáním jakéhokoli slova.",

  pricingPageHeadline: "Tři úrovně. Všechny s opravdovým obsahem.",
  pricingPageSubline: "Začni zdarma. Upgraduj, když ti hloubka pomůže.",
  billingMonthly: "Měsíčně",
  billingYearly: "Ročně",
  billingSave17: "Ušetři 17 %",

  tierBasicTagline: "Pochop",
  tierBasicPitch: "Začni se základem.",
  tierBasicCta: "Začít",
  tierBasicFeatures:
    "20 vyhledávání slov denně¶Všechny významy (ne jen primární)¶3 příklady pro každý význam¶Etymologie a původ¶Vyžaduje přihlášení",

  tierClearTagline: "Vidět",
  tierClearPitch: "Oživ slova obrázky, dětským režimem a zpětnou vazbou.",
  tierClearBadge: "Nejoblíbenější",
  tierClearCta: "Začít 14denní zkušební verzi",
  tierClearCtaYearly: "Roční předplatné",
  tierClearTrust: "Zruš kdykoli · Žádné účtování během zkušebky",
  tierClearFeatures:
    "Vše z Basicu¶Neomezené vyhledávání¶Vysvětlení pro děti¶Obrázek ke každému slovu (30/měsíc)¶Napiš větu a získej zpětnou vazbu¶Idiomy a výrazy¶Historie hledání (posledních 30 dní)",

  tierDeepTagline: "Procvičovat",
  tierDeepPitch: "Vybuduj si osobní slovní knihovnu, která časem sílí.",
  tierDeepCta: "Odebírat Deep",
  tierDeepFeatures:
    "Vše z Cleara¶Cvičné kvízy¶Osobní sešit slov¶Chytré opakování pro slovní zásobu, která vydrží¶Rozlišuj podobná slova¶Obrázek ke každému slovu (100/měsíc)",

  basicEquivalent: "",
  clearEquivalent: "Odpovídá $2,50/měsíc",
  deepEquivalent: "Odpovídá $4,17/měsíc",

  trustStripCancel: "Zrušení kdykoli přes portál Stripe",
  trustStripMoneyBack: "14denní záruka vrácení peněz na první nákup",
  trustStripDataYours: "Tvá data jsou tvá, kdykoli je můžeš exportovat",
  trustStripNoAds: "Žádné reklamy, žádné sledování třetími stranami",

  faqEyebrow: "FAQ",
  faqHeadline: "Otázky, zodpovězeny",
  faqQ1: "Můžu přepnout plán?",
  faqA1: "Ano, upgrade i downgrade kdykoli. Poměrná část se vypočítá automaticky, platíš jen rozdíl.",
  faqQ2: "Co se stane, když zruším?",
  faqA2: "Přístup ti zůstane do konce fakturačního období, pak se účet vrátí na Basic. Žádná data se neztratí.",
  faqQ3: "Je zkušební verze opravdu zdarma?",
  faqA3: "Ano. Kartu vyžadujeme kvůli zneužití, ale účtujeme až od 15. dne. Zrušíš dřív = nula.",
  faqQ4: "Proč tři úrovně?",
  faqA4: "Různí uživatelé potřebují různou hloubku. Raději tě potkáme tam, kde jsi, než ti prodáme jeden přebujelý plán.",
  faqQ5: "Jsou vysvětlení pro děti bezpečná?",
  faqA5: "Ano. Generuje je AI se stejnou péčí jako obsah pro dospělé a podle našich pravidel obsahu. Žádný obsah od uživatelů určený dětem.",

  loginWelcomeBack: "Přihlásit se",
  loginCreateAccount: "Vytvořit účet",
  loginContinueWithGoogle: "Pokračovat přes Google",
  loginInAppNotice: "V aplikaci {app} se přihlaste e-mailem níže. Pro variantu Google otevřete odkaz v prohlížeči.",
  loginOrSeparator: "nebo",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Heslo",
  loginEmailPlaceholder: "ty@priklad.cz",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Přihlásit se",
  loginSubmitSignUp: "Vytvořit účet",
  loginSwitchToSignUp: "Nemáš účet? Zaregistrovat se",
  loginForgotPassword: "Zapomněl jsi heslo?",
  loginForgotPasswordEnterEmail: "Nejprve zadej e-mail výše, pak klikni sem.",
  loginResetSent: "Pokud pro tento e-mail existuje účet, odkaz na reset je na cestě.",
  loginResetError: "Nepodařilo se odeslat reset. Zkus to znovu.",
  loginSwitchToSignIn: "Už máš účet? Přihlásit se",
  loginShowPassword: "Zobrazit heslo",
  loginHidePassword: "Skrýt heslo",
  loginCloseAria: "Zavřít",
  loginSigningIn: "Přihlašuji…",
  loginCreatingAccount: "Vytvářím účet…",
  loginErrorWrongCredentials: "Špatný e-mail nebo heslo.",
  loginErrorEmailInUse: "E-mail už se používá. Zkus se přihlásit.",
  loginErrorWeakPassword: "Heslo musí mít alespoň 8 znaků a obsahovat písmeno i číslo.",
  loginAgeTermsLine: "Je mi 13 nebo víc a souhlasím s",
  loginTermsLinkLabel: "Podmínkami",
  loginPrivacyLinkLabel: "Zásadami soukromí",
  loginErrorAgeRequired: "Potvrď prosím, že je ti 13 nebo víc a souhlasíš s Podmínkami a Zásadami soukromí.",
  loginErrorInvalidEmail: "Zadej prosím platnou e-mailovou adresu.",
  loginErrorGoogleFailed: "Přihlášení přes Google selhalo. Zkus to znovu.",
  loginErrorGeneric: "Něco se pokazilo. Zkus to znovu.",

  composeEyebrow: "Napsat",
  composeTitleTemplate: (w) => `Napiš svou větu se slovem ${w}`,
  composeSubtitle: "Použij ho ve větě a získej okamžitou zpětnou vazbu na gramatiku, tón a vhodnost.",
  composeMeaningPickerLabel: "Vyber význam, který procvičuješ",
  composePlaceholder: "Napiš svou větu sem…",
  composeSubmit: "Zkontrolovat větu",
  composeChecking: "Kontroluji…",
  composeStatusPerfectLabel: "Skvělé",
  composeStatusAlmostLabel: "Skoro to máš",
  composeStatusIncorrectLabel: "Tak úplně ne",
  composeSuggestionEyebrow: "Navržená úprava",
  composeTryAnother: "Zkusit jinou větu",
  composeBackToWord: "Zpět ke slovu",
  composeErrorEmpty: "Napiš prosím nejprve větu.",
  composeErrorTooShort: "Napiš prosím alespoň pár slov.",

  quizEyebrow: "Procvičit",
  quizTitleTemplate: (w) => `${w}, kvíz`,
  quizQuestionNofM: (n, m) => `Otázka ${n} z ${m}`,
  quizSubmit: "Odeslat",
  quizNext: "Další otázka",
  quizFinish: "Dokončit",
  quizYesCorrect: "Ano, správně",
  quizNotQuite: "Skoro",
  quizLoading: "Připravuji kvíz…",
  quizFinalScoreTemplate: (c, t) => `Máš ${c} z ${t} správně.`,
  quizPracticeAnotherWord: "Procvičit jiné slovo",
  quizBackToWord: "Zpět ke slovu",
  quizReviewMistakes: "Projít ty, co jsem nedal",

  compareEyebrow: "Porovnat",
  compareTitle: "Rozliš podobná slova",
  compareSubtitle:
    "stejný vs samý, mě vs mně, princip vs principál, slova, na kterých klopýtají i rodilí mluvčí.",
  compareWord1Label: "Slovo 1",
  compareWord2Label: "Slovo 2",
  compareWord1Placeholder: "stejný",
  compareWord2Placeholder: "samý",
  compareCta: "Porovnat",
  compareLoading: "Porovnávám…",
  compareEmpty: "Zadej dvě slova k porovnání",
  compareDifferenceLabel: "Rozdíl",
  compareExamplesLabel: "Příklady",
  compareCommonMistakeLabel: "Častá chyba",
  compareErrNotARealWord: "Jedno z těch slov nepoznáváme.",
  compareErrDifferentLanguages: "Tato dvě slova jsou zřejmě v různých jazycích. Zkus odpovídající dvojici.",
  compareErrSameWord: "Vypadá to na stejné slovo. Zkus dvě odlišná.",
  compareErrGeneric: "Porovnání teď není k dispozici.",

  notebookEyebrow: "Sešit",
  notebookTitle: "Tvůj vesmír slov",
  notebookSubtitle: "Každé slovo, které jsi prozkoumal, uloženo, uspořádáno, rostoucí.",
  notebookCounterTemplate: (n) => `${n} slov prozkoumáno`,
  notebookWordsExplored: "slov prozkoumáno",
  notebookPracticeNow: "Procvičit teď",
  notebookDueTodayTemplate: (n) => `${n} dnes k opakování`,
  notebookListView: "Seznam",
  notebookGalaxyView: "Galaxie",
  notebookEmptyTitle: "Sešit je prázdný",
  notebookEmptyCta: "Začni vyhledáním slova",
  notebookRemoveAria: "Odebrat",
  notebookMasteredLabel: "★ Zvládnuto",
  notebookSavedOnTemplate: (d) => `Uloženo ${d}`,
  notebookLegendRecent: "Nedávno uloženo",
  notebookLegendMastered: "Zvládnuto",
  notebookLegendNeedsReview: "Potřebuje opakování",

  srEyebrow: "Procvičit",
  srWordNofMTemplate: (n, m) => `Slovo ${n} z ${m}`,
  srSkip: "Přeskočit",
  srClickToReveal: "Klikni kamkoli pro odhalení",
  srTapToReveal: "Klepni pro odhalení",
  srPrimaryMeaningLabel: "Hlavní význam",
  srExamplesLabel: "Příklady",
  srIForgot: "Zapomněl jsem",
  srIKnewIt: "Věděl jsem",
  srSchedulingHint: "Věděl jsem = další opakování za pár dní. Zapomněl jsem = zpět na dnes.",
  srWordsPracticed: "procvičená slova",
  srSummaryStatTemplate: (k, f) => `${k} jsi věděl · ${f} k opakování`,
  srTomorrow: "Zítra",
  srNextReviewTemplate: (when, count) =>
    `Další opakování: ${when} (${count} ${count === 1 ? "slovo" : "slov"} k procvičení)`,
  srDoneForToday: "Pro dnešek hotovo",
  srPracticeMore: "Procvičit víc",
  srEmptyTitle: "Dnes není co opakovat",
  srEmptyBody: "Dobrá práce. Vrať se zítra.",
  srBackToNotebook: "Zpět do sešitu",
  srLoading: "Načítám tvé cvičení…",

  accountEyebrow: "Účet",
  accountYourSpace: "Tvůj prostor",
  accountNamedSpaceTemplate: (n) => `Prostor uživatele ${n}`,
  accountPlanLabel: "Plán",
  accountOnPlanFree: "Zdarma",
  accountNoActiveSubscription: "Žádné aktivní předplatné",
  accountChooseAPlan: "Vyber si plán, ať můžeš začít.",
  accountTrialBadgeTemplate: (d) =>
    `14denní zkušební · zbývá ${d} ${Number(d) === 1 ? "den" : Number(d) < 5 ? "dny" : "dnů"}`,
  accountRenewsOnTemplate: (d) => `Obnovuje se ${d}`,
  accountCancelsAtPeriodEnd: "Končí na konci fakturačního období",
  accountManageBilling: "Spravovat fakturaci",
  accountChangePlan: "Změnit plán",
  accountUpgrade: "Přejít na vyšší",
  accountUsageThisMonth: "Spotřeba tento měsíc",
  accountImageGeneration: "Generování obrázků",
  accountSearches: "Vyhledávání",
  accountLocked: "Uzamčeno",
  accountUnlimited: "neomezeno",
  accountTodaySuffix: "dnes",
  accountNearingLimit: "Blížíš se k měsíčnímu limitu.",
  accountSectionLabel: "Účet",
  accountEmailLabel: "E-mail",
  accountChangeEmail: "Změnit e-mail",
  accountSignOut: "Odhlásit se",
  accountDeleteAccount: "Smazat účet",

  reportEyebrow: "Nahlásit chybu",
  reportTitle: "Co je špatně?",
  reportTellMore: "Řekni nám víc",
  reportTellMorePh: "Volitelné. Čím konkrétnější, tím rychleji to opravíme.",
  reportSend: "Odeslat hlášení",
  reportSending: "Odesílám…",
  reportThanks: "Děkujeme, máme to.",
  reportError: "Nepodařilo se odeslat. Zkus to za chvíli.",
  reportCatIncorrectDefinition: "Špatná definice",
  reportCatWrongEtymology: "Špatná etymologie",
  reportCatBadExample: "Špatný příkladová věta",
  reportCatKidsExplanation: "Problém s vysvětlením pro děti",
  reportCatIdiomIssue: "Problém s idiomem",
  reportCatWrongImage: "Špatný obrázek",
  reportCatQuizWrongAnswer: "Kvíz: správná odpověď označena jako chybná",
  reportCatComposeFeedback: "Problém se zpětnou vazbou k větě",
  reportCatCompareResult: "Problém s výsledkem porovnání",
  reportCatSomethingElse: "Něco jiného",

  origin: "Původ",
  historyNote: "Historická poznámka",
  throughTime: "V čase",
  forKids: "Pro děti",
  commonExpressions: "Běžné výrazy",
  idiomsWithMeaning: "Idiomy s tímto významem",
  meaningN: (n) => `Význam ${n}`,
  notJustPrimary: "Nejen ten primární",
  takeItFurther: "Pokračuj dál",
  doMoreWith: (w) => `Udělej víc se slovem ${w}`,
  saveToNotebook: "Uložit do sešitu",
  saveToNotebookHint: "Vrať se k tomu později, uspořádané a vyhledatelné.",
  generateImage: "Vytvořit obrázek",
  generatingImage: "Vytvářím…",
  generateImageHint: "Živý obrázek od AI, jen pro toto slovo.",
  composeSentence: "Napsat větu",
  composeSentenceHint: "Napiš svou vlastní, Gadit zkontroluje tón a vhodnost.",
  practiceWord: "Procvičit toto slovo",
  practiceWordHint: "Krátký kvíz přizpůsobený tvému učení.",
  unlockWithClear: "Odemkni s Clear",
  upgradeToClear: "Upgradovat na Clear",
  softWallAnonTitle: "Vyčerpal jsi svá hledání zdarma",
  softWallAnonBody:
    "Zaregistruj se zdarma a hledej až 20 slov denně, s úplnými definicemi, příklady, idiomy a původem slova.",
  softWallSignupCta: "Registrace zdarma",
  softWallBasicTitle: "Dosáhl jsi dnešního limitu",
  softWallBasicBody:
    "Účty zdarma mají 20 hledání denně. Limit se zítra resetuje, nebo upgraduj na Clear pro neomezené hledání plus obrázky, dětský režim a zpětnou vazbu ke gramatice.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "Dnes zbývá 1 hledání zdarma, zaregistruj se zdarma pro 20 denně."
      : `Dnes zbývá ${n} hledání zdarma, zaregistruj se zdarma pro 20 denně.`,
  clearUnlocksThis: "Clear toto odemkne",
  visualizeThisWord: "Vizualizovat",
  visualBlurb: "Jeden živý obrázek, vytvořený Gaditem, vizuální kotva pro to, jak slovo působí.",
  visualBlurbLocked: "Vytvoř živý, jedinečný obrázek pro toto slovo, porozumění zrakem.",
  reportLabel: "Nahlásit chybu",

  wordOriginEyebrow: "Původ slova",
  idiomsEyebrow: "Idiomy a výrazy",
  wordOriginBackgroundLabel: "Pozadí",
  wordOriginOriginalWord: "Původní slovo",
  wordOriginBreakdown: "Části slova",
  imageGeneratingLabel: "Vytvářím obrázek…",
  imageGeneratingHint: "Obvykle to trvá 10 až 15 sekund.",
  imageOpenFullAria: "Otevřít obrázek v plné velikosti",
  kidsComingSoon: "Vysvětlení pro děti už brzy.",
  compareComingSoon: "Slovní hry už brzy.",
  shareDefinitionAria: "Sdílet tuto definici",
  visualEyebrow: "Obraz",
  meaningsEyebrow: "Definice",
  takeItFurtherEyebrow: "Jdi dál",
  wordOriginLanguage: "Jazyk",
  wordOriginOriginallyMeant: "Původně znamenalo",
  actionCompose: "Napsat větu",
  actionQuiz: "Kvíz",
  actionCompare: "Porovnat slova",
  actionKidsExplanation: "Vysvětlení pro děti",
  saveToWordBook: "Uložit do sešitu",
  savedToWordBook: "Uloženo do sešitu",
  listenToWord: "Poslechnout",
  offlinePin: "Uložit offline",
  offlinePinned: "Uloženo offline",
  offlinePinTitle: "Uložit toto slovo pro offline studium",
  offlinePinnedTitle: "Uloženo, dostupné bez Wi-Fi",
  offlineDownloadPack: "Stáhnout offline balíček",
  offlineDownloadingPack: "Stahuji…",
  offlinePackHeader: "Offline balíček",
  offlinePackDescription:
    "Přidá nejhledanější slova ve tvém jazyce do sešitu, a udržuje je dostupná bez Wi-Fi pro offline studium.",
  visualEmptyLabel: "Pro toto slovo bude vytvořen obrázek",
  generateLabel: "Vytvořit",
  // Share / save / listen on the result page
  shareLabel: "Sdílet",
  backLabel: "Zpět",
  savedAgoTemplate: (t) => `Uloženo · ${t}`,
};

// Slovak — added June 2026 for Andrea's Czech/Slovak affiliate push.
// Mirrors the cs block structurally; vocabulary and grammar are native
// Slovak (rozumieť/zošit/cenník/hľadať/precvičovať, not Czech forms).
// Andrea's Slovak leads need to feel "this is FOR me," not a Czech
// product that almost-translates — that's the whole point of a native
// block over a cs fallback.
const sk: V2Strings = {
  homeHeadlineLine1: "Rozumieť",
  homeHeadlineLine2: "až do konca.",
  homeSubline:
    "Slovník, ktorý ťa stretáva v kontexte: významy, pôvod, idiómy a živý obraz, v 11 jazykoch.",
  searchPlaceholderHome: "Napíš slovo",
  voiceInputTitle: "Nadiktovať slovo",
  addContext: "Pridať kontext",
  explain: "Vysvetliť",
  contextHint: "Niečo čítaš? Vlož vetu, aby bol význam jasný.",
  tryLabel: "Vyskúšaj",

  valuePropsEyebrow: "Čím sa Gadit odlišuje",
  valuePropsTitle: "Viac než definícia, spôsob, ako so slovom žiť.",
  valueProp1Eyebrow: "Vníma kontext",
  valueProp1Title: "Správny význam, vždy",
  valueProp1Body: "Vlož vetu. Gadit vyberie ten význam, ktorý sa hodí, nielen ten najčastejší.",
  valueProp2Eyebrow: "Vizuálne",
  valueProp2Title: "Živý obraz, len pre toto slovo",
  valueProp2Body: "Vytvorený pre každé heslo. Vizuálna kotva pre to, ako slovo pôsobí, nie stocková fotka.",
  valueProp3Eyebrow: "Etymológia",
  valueProp3Title: "Príbeh, nie odsek z Wikipédie",
  valueProp3Body: "Odkiaľ slovo prišlo, rozprávané ako odsek, ktorý by napísal zvedavý priateľ.",
  valueProp4Eyebrow: "11 jazykov",
  valueProp4Title: "Hebrejčina a arabčina plne natívne",
  valueProp4Body: "Skutočné RTL, skutočné fonty, skutočné idiómy. Nie prilepené prekladové rozhranie.",

  previewLabel: "Náhľad",
  seeFullResult: "Zobraziť kompletný výsledok",

  pricingEyebrow: "Cenník",
  pricingTeaserTitle: "Tri úrovne. Všetky s naozajstným obsahom.",
  trustMicrocopy: "Zruš kedykoľvek · 14-dňová skúšobná verzia na Clear mesačne · Žiadne účtovanie do konca skúšky",

  footerProductGroup: "Produkt",
  footerLegalGroup: "Právne",
  footerCompare: "Porovnať",
  footerNotebook: "Zošit",
  footerPricing: "Cenník",
  footerPrivacy: "Súkromie",
  footerTerms: "Podmienky",
  footerContact: "Pomoc",
  footerTagline: "Inteligentný slovník pre 11 jazykov. Stavaný pre skutočné čítanie.",
  footerLanguagesNote: "11 jazykov",

  signIn: "Prihlásiť sa",
  startFree: "Začať zdarma",
  verbStampDef: "pochopiť slovo až do konca",
  navSearch: "Hľadať",
  navCompare: "Porovnať",
  navNotebook: "Zošit",
  navPricing: "Cenník",
  navFeatures: "Funkcie",
  navPlay: "Hrať",
  navAffiliates: "Partneri",

  kidsModeLabel: "Deti",
  kidsModeTooltipOff: "Klikni, aby každé slovo bolo vysvetlené tak, ako by ho rodič vysvetlil dieťaťu.",
  kidsModeTooltipOn: "Detský režim je zapnutý. Každá definícia bude napísaná pre dieťa. Klikni pre vypnutie.",
  kidsModeBasicGate: "Detský režim je funkcia Clearu. Prejdi na vyšší plán, aby si ho mohol používať.",

  signupWelcomeTitle: "Vitaj v Gadite!",
  signupWelcomeBody: "Tvoj účet je pripravený. Začni hľadaním akéhokoľvek slova.",

  pricingPageHeadline: "Tri úrovne. Všetky s naozajstným obsahom.",
  pricingPageSubline: "Začni zadarmo. Upgraduj, keď ti hĺbka pomôže.",
  billingMonthly: "Mesačne",
  billingYearly: "Ročne",
  billingSave17: "Ušetri 17 %",

  tierBasicTagline: "Pochop",
  tierBasicPitch: "Začni so základom.",
  tierBasicCta: "Začať",
  tierBasicFeatures:
    "20 vyhľadávaní slov denne¶Všetky významy (nielen primárny)¶3 príklady pre každý význam¶Etymológia a pôvod¶Vyžaduje prihlásenie",

  tierClearTagline: "Vidieť",
  tierClearPitch: "Oživ slová obrázkami, detským režimom a spätnou väzbou.",
  tierClearBadge: "Najobľúbenejšie",
  tierClearCta: "Začať 14-dňovú skúšobnú verziu",
  tierClearCtaYearly: "Ročné predplatné",
  tierClearTrust: "Zruš kedykoľvek · Žiadne účtovanie počas skúšky",
  tierClearFeatures:
    "Všetko zo základu¶Neobmedzené vyhľadávanie¶Vysvetlenia pre deti¶Obrázok ku každému slovu (30/mesiac)¶Napíš vetu a získaj spätnú väzbu¶Idiómy a výrazy¶História hľadania (posledných 30 dní)",

  tierDeepTagline: "Precvičovať",
  tierDeepPitch: "Vybuduj si osobnú slovnú knižnicu, ktorá časom silnie.",
  tierDeepCta: "Odoberať Deep",
  tierDeepFeatures:
    "Všetko z Clearu¶Cvičné kvízy¶Osobný zošit slov¶Inteligentné opakovanie pre slovnú zásobu, ktorá vydrží¶Rozlišuj podobné slová¶Obrázok ku každému slovu (100/mesiac)",

  basicEquivalent: "",
  clearEquivalent: "Zodpovedá $2,50/mesiac",
  deepEquivalent: "Zodpovedá $4,17/mesiac",

  trustStripCancel: "Zrušenie kedykoľvek cez portál Stripe",
  trustStripMoneyBack: "14-dňová záruka vrátenia peňazí na prvý nákup",
  trustStripDataYours: "Tvoje dáta sú tvoje, kedykoľvek ich môžeš exportovať",
  trustStripNoAds: "Žiadne reklamy, žiadne sledovanie tretími stranami",

  faqEyebrow: "FAQ",
  faqHeadline: "Otázky, zodpovedané",
  faqQ1: "Môžem prepnúť plán?",
  faqA1: "Áno, upgrade aj downgrade kedykoľvek. Pomerná časť sa vypočíta automaticky, platíš len rozdiel.",
  faqQ2: "Čo sa stane, keď zruším?",
  faqA2: "Prístup ti zostane do konca fakturačného obdobia, potom sa účet vráti na Basic. Žiadne dáta sa nestratia.",
  faqQ3: "Je skúšobná verzia naozaj zadarmo?",
  faqA3: "Áno. Kartu vyžadujeme kvôli zneužitiu, ale účtujeme až od 15. dňa. Zrušíš skôr = nula.",
  faqQ4: "Prečo tri úrovne?",
  faqA4: "Rôzni používatelia potrebujú rôznu hĺbku. Radšej ťa stretneme tam, kde si, než ti predáme jeden preplnený plán.",
  faqQ5: "Sú vysvetlenia pre deti bezpečné?",
  faqA5: "Áno. Generuje ich AI s rovnakou starostlivosťou ako obsah pre dospelých a podľa našich pravidiel obsahu. Žiadny obsah od používateľov určený deťom.",

  loginWelcomeBack: "Prihlásiť sa",
  loginCreateAccount: "Vytvoriť účet",
  loginContinueWithGoogle: "Pokračovať cez Google",
  loginInAppNotice: "V aplikácii {app} sa prihláste e-mailom nižšie. Pre možnosť Google otvorte odkaz v prehliadači.",
  loginOrSeparator: "alebo",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Heslo",
  loginEmailPlaceholder: "ty@priklad.sk",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Prihlásiť sa",
  loginSubmitSignUp: "Vytvoriť účet",
  loginSwitchToSignUp: "Nemáš účet? Zaregistrovať sa",
  loginForgotPassword: "Zabudol si heslo?",
  loginForgotPasswordEnterEmail: "Najprv zadaj e-mail vyššie, potom klikni sem.",
  loginResetSent: "Ak pre tento e-mail existuje účet, odkaz na obnovenie je na ceste.",
  loginResetError: "Nepodarilo sa odoslať obnovenie. Skús to znova.",
  loginSwitchToSignIn: "Už máš účet? Prihlásiť sa",
  loginShowPassword: "Zobraziť heslo",
  loginHidePassword: "Skryť heslo",
  loginCloseAria: "Zavrieť",
  loginSigningIn: "Prihlasujem…",
  loginCreatingAccount: "Vytváram účet…",
  loginErrorWrongCredentials: "Nesprávny e-mail alebo heslo.",
  loginErrorEmailInUse: "E-mail sa už používa. Skús sa prihlásiť.",
  loginErrorWeakPassword: "Heslo musí mať aspoň 8 znakov a obsahovať písmeno aj číslo.",
  loginAgeTermsLine: "Mám 13 alebo viac rokov a súhlasím s",
  loginTermsLinkLabel: "Podmienkami",
  loginPrivacyLinkLabel: "Zásadami ochrany súkromia",
  loginErrorAgeRequired: "Potvrď prosím, že máš 13 alebo viac rokov a súhlasíš s Podmienkami a Zásadami ochrany súkromia.",
  loginErrorInvalidEmail: "Zadaj prosím platnú e-mailovú adresu.",
  loginErrorGoogleFailed: "Prihlásenie cez Google zlyhalo. Skús to znova.",
  loginErrorGeneric: "Niečo sa pokazilo. Skús to znova.",

  composeEyebrow: "Napísať",
  composeTitleTemplate: (w) => `Napíš svoju vetu so slovom ${w}`,
  composeSubtitle: "Použi ho vo vete a získaj okamžitú spätnú väzbu na gramatiku, tón a vhodnosť.",
  composeMeaningPickerLabel: "Vyber význam, ktorý si precvičuješ",
  composePlaceholder: "Napíš svoju vetu sem…",
  composeSubmit: "Skontrolovať vetu",
  composeChecking: "Kontrolujem…",
  composeStatusPerfectLabel: "Skvelé",
  composeStatusAlmostLabel: "Skoro to máš",
  composeStatusIncorrectLabel: "Tak celkom nie",
  composeSuggestionEyebrow: "Navrhnutá úprava",
  composeTryAnother: "Skúsiť inú vetu",
  composeBackToWord: "Späť k slovu",
  composeErrorEmpty: "Napíš prosím najprv vetu.",
  composeErrorTooShort: "Napíš prosím aspoň pár slov.",

  quizEyebrow: "Precvičiť",
  quizTitleTemplate: (w) => `${w}, kvíz`,
  quizQuestionNofM: (n, m) => `Otázka ${n} z ${m}`,
  quizSubmit: "Odoslať",
  quizNext: "Ďalšia otázka",
  quizFinish: "Dokončiť",
  quizYesCorrect: "Áno, správne",
  quizNotQuite: "Takmer",
  quizLoading: "Pripravujem kvíz…",
  quizFinalScoreTemplate: (c, t) => `Máš ${c} z ${t} správne.`,
  quizPracticeAnotherWord: "Precvičiť iné slovo",
  quizBackToWord: "Späť k slovu",
  quizReviewMistakes: "Prejsť tie, čo som nedal",

  compareEyebrow: "Porovnať",
  compareTitle: "Rozlíš podobné slová",
  compareSubtitle:
    "rovnaký vs ten istý, mi vs ma, princíp vs principál, slová, na ktorých sa potknú aj rodení hovoriaci.",
  compareWord1Label: "Slovo 1",
  compareWord2Label: "Slovo 2",
  compareWord1Placeholder: "rovnaký",
  compareWord2Placeholder: "ten istý",
  compareCta: "Porovnať",
  compareLoading: "Porovnávam…",
  compareEmpty: "Zadaj dve slová na porovnanie",
  compareDifferenceLabel: "Rozdiel",
  compareExamplesLabel: "Príklady",
  compareCommonMistakeLabel: "Častá chyba",
  compareErrNotARealWord: "Jedno z tých slov nepoznáme.",
  compareErrDifferentLanguages: "Tieto dve slová sú zrejme v rôznych jazykoch. Skús zodpovedajúcu dvojicu.",
  compareErrSameWord: "Vyzerá to na rovnaké slovo. Skús dve odlišné.",
  compareErrGeneric: "Porovnanie teraz nie je k dispozícii.",

  notebookEyebrow: "Zošit",
  notebookTitle: "Tvoj vesmír slov",
  notebookSubtitle: "Každé slovo, ktoré si preskúmal, uložené, usporiadané, rastúce.",
  notebookCounterTemplate: (n) => `${n} slov preskúmaných`,
  notebookWordsExplored: "slov preskúmaných",
  notebookPracticeNow: "Precvičiť teraz",
  notebookDueTodayTemplate: (n) => `${n} dnes na opakovanie`,
  notebookListView: "Zoznam",
  notebookGalaxyView: "Galaxia",
  notebookEmptyTitle: "Zošit je prázdny",
  notebookEmptyCta: "Začni vyhľadaním slova",
  notebookRemoveAria: "Odobrať",
  notebookMasteredLabel: "★ Zvládnuté",
  notebookSavedOnTemplate: (d) => `Uložené ${d}`,
  notebookLegendRecent: "Nedávno uložené",
  notebookLegendMastered: "Zvládnuté",
  notebookLegendNeedsReview: "Potrebuje opakovanie",

  srEyebrow: "Precvičiť",
  srWordNofMTemplate: (n, m) => `Slovo ${n} z ${m}`,
  srSkip: "Preskočiť",
  srClickToReveal: "Klikni kdekoľvek pre odhalenie",
  srTapToReveal: "Ťukni pre odhalenie",
  srPrimaryMeaningLabel: "Hlavný význam",
  srExamplesLabel: "Príklady",
  srIForgot: "Zabudol som",
  srIKnewIt: "Vedel som",
  srSchedulingHint: "Vedel som = ďalšie opakovanie za pár dní. Zabudol som = späť na dnes.",
  srWordsPracticed: "precvičené slová",
  srSummaryStatTemplate: (k, f) => `${k} si vedel · ${f} na opakovanie`,
  srTomorrow: "Zajtra",
  srNextReviewTemplate: (when, count) =>
    `Ďalšie opakovanie: ${when} (${count} ${count === 1 ? "slovo" : "slov"} na precvičenie)`,
  srDoneForToday: "Pre dnešok hotovo",
  srPracticeMore: "Precvičiť viac",
  srEmptyTitle: "Dnes nie je čo opakovať",
  srEmptyBody: "Dobrá práca. Vráť sa zajtra.",
  srBackToNotebook: "Späť do zošita",
  srLoading: "Načítavam tvoje cvičenie…",

  accountEyebrow: "Účet",
  accountYourSpace: "Tvoj priestor",
  accountNamedSpaceTemplate: (n) => `Priestor používateľa ${n}`,
  accountPlanLabel: "Plán",
  accountOnPlanFree: "Zadarmo",
  accountNoActiveSubscription: "Žiadne aktívne predplatné",
  accountChooseAPlan: "Vyber si plán, aby si mohol začať.",
  accountTrialBadgeTemplate: (d) =>
    `14-dňová skúšobná · zostáva ${d} ${Number(d) === 1 ? "deň" : Number(d) < 5 ? "dni" : "dní"}`,
  accountRenewsOnTemplate: (d) => `Obnovuje sa ${d}`,
  accountCancelsAtPeriodEnd: "Končí na konci fakturačného obdobia",
  accountManageBilling: "Spravovať fakturáciu",
  accountChangePlan: "Zmeniť plán",
  accountUpgrade: "Prejsť na vyšší",
  accountUsageThisMonth: "Spotreba tento mesiac",
  accountImageGeneration: "Generovanie obrázkov",
  accountSearches: "Vyhľadávania",
  accountLocked: "Uzamknuté",
  accountUnlimited: "neobmedzene",
  accountTodaySuffix: "dnes",
  accountNearingLimit: "Blížiš sa k mesačnému limitu.",
  accountSectionLabel: "Účet",
  accountEmailLabel: "E-mail",
  accountChangeEmail: "Zmeniť e-mail",
  accountSignOut: "Odhlásiť sa",
  accountDeleteAccount: "Zmazať účet",

  reportEyebrow: "Nahlásiť chybu",
  reportTitle: "Čo je zlé?",
  reportTellMore: "Povedz nám viac",
  reportTellMorePh: "Voliteľné. Čím konkrétnejšie, tým rýchlejšie to opravíme.",
  reportSend: "Odoslať hlásenie",
  reportSending: "Odosielam…",
  reportThanks: "Ďakujeme, máme to.",
  reportError: "Nepodarilo sa odoslať. Skús to za chvíľu.",
  reportCatIncorrectDefinition: "Nesprávna definícia",
  reportCatWrongEtymology: "Nesprávna etymológia",
  reportCatBadExample: "Zlá vzorová veta",
  reportCatKidsExplanation: "Problém s vysvetlením pre deti",
  reportCatIdiomIssue: "Problém s idiómom",
  reportCatWrongImage: "Nesprávny obrázok",
  reportCatQuizWrongAnswer: "Kvíz: správna odpoveď označená ako chybná",
  reportCatComposeFeedback: "Problém so spätnou väzbou k vete",
  reportCatCompareResult: "Problém s výsledkom porovnania",
  reportCatSomethingElse: "Niečo iné",

  origin: "Pôvod",
  historyNote: "Historická poznámka",
  throughTime: "V čase",
  forKids: "Pre deti",
  commonExpressions: "Bežné výrazy",
  idiomsWithMeaning: "Idiómy s týmto významom",
  meaningN: (n) => `Význam ${n}`,
  notJustPrimary: "Nielen ten primárny",
  takeItFurther: "Pokračuj ďalej",
  doMoreWith: (w) => `Urob viac so slovom ${w}`,
  saveToNotebook: "Uložiť do zošita",
  saveToNotebookHint: "Vráť sa k tomu neskôr, usporiadané a vyhľadateľné.",
  generateImage: "Vytvoriť obrázok",
  generatingImage: "Vytváram…",
  generateImageHint: "Živý obrázok od AI, len pre toto slovo.",
  composeSentence: "Napísať vetu",
  composeSentenceHint: "Napíš svoju vlastnú, Gadit skontroluje tón a vhodnosť.",
  practiceWord: "Precvičiť toto slovo",
  practiceWordHint: "Krátky kvíz prispôsobený tvojmu učeniu.",
  unlockWithClear: "Odomkni s Clear",
  upgradeToClear: "Upgradovať na Clear",
  softWallAnonTitle: "Vyčerpal si svoje vyhľadávania zadarmo",
  softWallAnonBody:
    "Zaregistruj sa zadarmo a hľadaj až 20 slov denne, s úplnými definíciami, príkladmi, idiómami a pôvodom slova.",
  softWallSignupCta: "Registrácia zadarmo",
  softWallBasicTitle: "Dosiahol si dnešný limit",
  softWallBasicBody:
    "Účty zadarmo majú 20 vyhľadávaní denne. Limit sa zajtra resetuje, alebo upgraduj na Clear pre neobmedzené hľadanie plus obrázky, detský režim a spätnú väzbu ku gramatike.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "Dnes zostáva 1 vyhľadávanie zadarmo, zaregistruj sa zadarmo pre 20 denne."
      : `Dnes zostávajú ${n} vyhľadávania zadarmo, zaregistruj sa zadarmo pre 20 denne.`,
  clearUnlocksThis: "Clear toto odomkne",
  visualizeThisWord: "Vizualizovať",
  visualBlurb: "Jeden živý obrázok, vytvorený Gaditom, vizuálna kotva pre to, ako slovo pôsobí.",
  visualBlurbLocked: "Vytvor živý, jedinečný obrázok pre toto slovo, porozumenie zrakom.",
  reportLabel: "Nahlásiť chybu",

  wordOriginEyebrow: "Pôvod slova",
  idiomsEyebrow: "Idiómy a výrazy",
  wordOriginBackgroundLabel: "Pozadie",
  wordOriginOriginalWord: "Pôvodné slovo",
  wordOriginBreakdown: "Časti slova",
  imageGeneratingLabel: "Vytváram obrázok…",
  imageGeneratingHint: "Zvyčajne to trvá 10 až 15 sekúnd.",
  imageOpenFullAria: "Otvoriť obrázok v plnej veľkosti",
  kidsComingSoon: "Vysvetlenie pre deti už čoskoro.",
  compareComingSoon: "Slovné hry už čoskoro.",
  shareDefinitionAria: "Zdieľať túto definíciu",
  visualEyebrow: "Obraz",
  meaningsEyebrow: "Definície",
  takeItFurtherEyebrow: "Choď ďalej",
  wordOriginLanguage: "Jazyk",
  wordOriginOriginallyMeant: "Pôvodne znamenalo",
  actionCompose: "Napísať vetu",
  actionQuiz: "Kvíz",
  actionCompare: "Porovnať slová",
  actionKidsExplanation: "Vysvetlenie pre deti",
  saveToWordBook: "Uložiť do zošita",
  savedToWordBook: "Uložené do zošita",
  listenToWord: "Vypočuť",
  offlinePin: "Uložiť offline",
  offlinePinned: "Uložené offline",
  offlinePinTitle: "Uložiť toto slovo pre offline štúdium",
  offlinePinnedTitle: "Uložené, dostupné bez Wi-Fi",
  offlineDownloadPack: "Stiahnuť offline balík",
  offlineDownloadingPack: "Sťahujem…",
  offlinePackHeader: "Offline balík",
  offlinePackDescription:
    "Pridá najhľadanejšie slová v tvojom jazyku do zošita, a udržuje ich dostupné bez Wi-Fi pre offline štúdium.",
  visualEmptyLabel: "Pre toto slovo bude vytvorený obrázok",
  generateLabel: "Vytvoriť",
  shareLabel: "Zdieľať",
  backLabel: "Späť",
  savedAgoTemplate: (t) => `Uložené · ${t}`,
};

const it: Partial<V2Strings> = {
  // Homepage hero
  homeHeadlineLine1: "Capisci",
  homeHeadlineLine2: "fino in fondo.",
  homeSubline:
    "Un dizionario che ti incontra nel contesto: significati, origini, modi di dire e un'immagine vivida, in 11 lingue.",
  searchPlaceholderHome: "Scrivi una parola",
  voiceInputTitle: "Detta una parola",
  addContext: "Aggiungi contesto",
  explain: "Spiega",
  contextHint: "Stai leggendo qualcosa? Incolla la frase per chiarire il significato.",
  tryLabel: "Prova",

  // Value props (Screen 1)
  valuePropsEyebrow: "Cosa fa Gadit di diverso",
  valuePropsTitle: "Più di una definizione: un modo di vivere una parola.",
  valueProp1Eyebrow: "Sensibile al contesto",
  valueProp1Title: "Il significato giusto, ogni volta",
  valueProp1Body: "Incolla una frase. Gadit sceglie il senso che si adatta, non solo quello più comune.",
  valueProp2Eyebrow: "Visivo",
  valueProp2Title: "Un'immagine vivida, solo per questa parola",
  valueProp2Body: "Generata per ogni voce. Un'ancora visiva per come si sente una parola, non una foto stock.",
  valueProp3Eyebrow: "Etimologia",
  valueProp3Title: "Una nota storica, non un dump di Wikipedia",
  valueProp3Body: "Da dove viene la parola, raccontato come un paragrafo, come lo scriverebbe un amico curioso.",
  valueProp4Eyebrow: "11 lingue",
  valueProp4Title: "Ebraico e arabo, completamente nativi",
  valueProp4Body: "RTL vero, font veri, modi di dire veri. Non un'interfaccia tradotta posticcia.",

  previewLabel: "Anteprima",
  seeFullResult: "Vedi il risultato completo",

  pricingEyebrow: "Prezzi",
  pricingTeaserTitle: "Tre piani. Tutti con contenuti veri.",
  trustMicrocopy: "Annulla in qualsiasi momento · Prova di 14 giorni su Clear mensile · Nessun addebito fino al termine della prova",

  // Footer
  footerProductGroup: "Prodotto",
  footerLegalGroup: "Legale",
  footerCompare: "Confronta",
  footerNotebook: "Quaderno",
  footerPricing: "Prezzi",
  footerPrivacy: "Privacy",
  footerTerms: "Termini",
  footerContact: "Aiuto",
  footerTagline: "Un dizionario intelligente per 11 lingue. Costruito per la lettura vera.",
  footerLanguagesNote: "11 lingue",

  // Nav
  signIn: "Accedi",
  startFree: "Inizia gratis",
  verbStampDef: "capire una parola fino in fondo",
  navSearch: "Cerca",
  navCompare: "Confronta",
  navNotebook: "Quaderno",
  navPricing: "Prezzi",
  navFeatures: "Funzionalità",

  // Pricing page
  pricingPageHeadline: "Tre piani. Tutti con contenuti veri.",
  pricingPageSubline: "Inizia gratis. Fai upgrade quando la profondità ti aiuta.",
  billingMonthly: "Mensile",
  billingYearly: "Annuale",
  billingSave17: "Risparmi 17%",

  tierBasicTagline: "Capisci",
  tierBasicPitch: "Inizia con l'essenziale.",
  tierBasicCta: "Inizia",
  tierClearTagline: "Visualizza",
  tierClearPitch: "Porta le parole alla vita con immagini, modalità bambini e feedback.",
  tierClearBadge: "Più popolare",
  tierClearCta: "Inizia la prova gratuita di 14 giorni",
  tierClearCtaYearly: "Abbonati annuale",
  tierClearTrust: "Annulla quando vuoi · Nessun addebito durante la prova",
  tierDeepTagline: "Esercitati",
  tierDeepPitch: "Costruisci una libreria personale di vocaboli che diventa più forte nel tempo.",
  tierDeepCta: "Abbonati a Deep",

  tierBasicFeatures:
    "20 ricerche di parole al giorno¶Tutti i significati (non solo quello principale)¶3 esempi per ogni significato¶Etimologia e origine¶Accesso richiesto",
  tierClearFeatures:
    "Tutto in Basic¶Ricerche illimitate¶Spiegazioni per bambini¶Immagine per ogni parola (30/mese)¶Scrivi una frase e ricevi feedback¶Modi di dire ed espressioni¶Cronologia delle ricerche (ultimi 30 giorni)",
  tierDeepFeatures:
    "Tutto in Clear¶Quiz di pratica¶Quaderno personale di parole¶Pratica intelligente per un vocabolario duraturo¶Distingui parole simili¶Immagine per ogni parola (100/mese)",

  basicEquivalent: "",
  clearEquivalent: "Equivale a $2,50/mese",
  deepEquivalent: "Equivale a $4,17/mese",

  // Section eyebrows on the result page
  meaningsEyebrow: "Definizioni",
  idiomsEyebrow: "Modi di dire ed espressioni",
  wordOriginEyebrow: "Origine della parola",
  visualEyebrow: "Immagine",
  takeItFurtherEyebrow: "Vai oltre",
  // Word origin structured rows
  wordOriginLanguage: "Lingua",
  wordOriginOriginallyMeant: "Significato originale",
  wordOriginBackgroundLabel: "Contesto",
  wordOriginOriginalWord: "Parola originale",
  wordOriginBreakdown: "Parti della parola",
  // Meaning-level action labels
  actionCompose: "Scrivi una frase",
  actionQuiz: "Quiz",
  actionCompare: "Confronta parole",
  actionKidsExplanation: "Spiegazione per bambini",
  // Visual / image gen
  visualEmptyLabel: "Verrà generata un'immagine per questa parola",
  generateLabel: "Genera",
  imageGeneratingLabel: "Generazione dell'immagine…",
  imageGeneratingHint: "Di solito richiede dai 10 ai 15 secondi.",
  imageOpenFullAria: "Apri l'immagine a tutta grandezza",
  compareComingSoon: "I giochi di parole arrivano presto.",
  navPlay: "Giochi",
  navAffiliates: "Affiliati",

  kidsModeLabel: "Bambini",
  kidsModeTooltipOff: "Tocca per spiegare ogni parola come un genitore la spiegherebbe a un bambino.",
  kidsModeTooltipOn: "Modalità bambini attiva. Ogni definizione sarà scritta per un bambino. Tocca per disattivare.",
  kidsModeBasicGate: "La modalità bambini è una funzione di Clear. Fai upgrade per usarla.",

  signupWelcomeTitle: "Benvenuto su Gadit!",
  signupWelcomeBody: "Il tuo account è pronto. Inizia cercando una parola qualsiasi.",

  // Share / save / listen on the result page
  shareLabel: "Condividi",
  backLabel: "Indietro",
  shareDefinitionAria: "Condividi questa definizione",
  savedAgoTemplate: (t) => `Salvato · ${t}`,

  // Trust strip
  trustStripCancel: "Annulla quando vuoi tramite il portale Stripe",
  trustStripMoneyBack: "Garanzia di rimborso di 14 giorni sul primo acquisto",
  trustStripDataYours: "I tuoi dati sono tuoi, esportabili in qualsiasi momento",
  trustStripNoAds: "Nessuna pubblicità, nessun tracciamento di terze parti",

  // FAQ
  faqEyebrow: "FAQ",
  faqHeadline: "Domande, con risposta",
  faqQ1: "Posso cambiare piano?",
  faqA1: "Sì, fai upgrade o downgrade in qualsiasi momento. La proporzione è automatica, paghi solo la differenza.",
  faqQ2: "Cosa succede se annullo?",
  faqA2: "Mantieni l'accesso fino alla fine del periodo di fatturazione, poi torni a Basic. Nessun dato viene perso.",
  faqQ3: "La prova è davvero gratuita?",
  faqA3: "Sì. Chiediamo la carta per evitare abusi, ma non c'è addebito fino al giorno 15. Annulli prima = zero costo.",
  faqQ4: "Perché tre piani?",
  faqA4: "Utenti diversi hanno bisogno di profondità diverse. Preferiamo incontrarti dove sei piuttosto che venderti un unico piano gonfiato.",
  faqQ5: "Le spiegazioni per bambini sono sicure?",
  faqA5: "Sì. Sono generate dall'AI con la stessa cura dei contenuti per adulti, controllate dalle nostre regole sui contenuti. Nessun contenuto generato dagli utenti per bambini.",

  // Login modal
  loginWelcomeBack: "Accedi",
  loginCreateAccount: "Crea il tuo account",
  loginContinueWithGoogle: "Continua con Google",
  loginInAppNotice: "Dentro {app}, accedi con email qui sotto. Per l'opzione Google, apri il link nel browser.",
  loginOrSeparator: "o",
  loginEmailLabel: "Email",
  loginPasswordLabel: "Password",
  loginEmailPlaceholder: "tu@esempio.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Accedi",
  loginSubmitSignUp: "Crea account",
  loginSwitchToSignUp: "Non hai un account? Registrati",
  loginForgotPassword: "Password dimenticata?",
  loginForgotPasswordEnterEmail: "Inserisci prima la tua email sopra, poi tocca qui.",
  loginResetSent: "Se esiste un account per questa email, un link di reset è in arrivo.",
  loginResetError: "Non siamo riusciti a inviare l'email di reset. Riprova.",
  loginSwitchToSignIn: "Hai già un account? Accedi",
  loginShowPassword: "Mostra password",
  loginHidePassword: "Nascondi password",
  loginCloseAria: "Chiudi",
  loginSigningIn: "Accesso in corso…",
  loginCreatingAccount: "Creazione account…",
  loginErrorWrongCredentials: "Email o password errate.",
  loginErrorEmailInUse: "Email già in uso. Prova ad accedere.",
  loginErrorWeakPassword: "La password deve avere almeno 8 caratteri e includere una lettera e un numero.",
  loginAgeTermsLine: "Ho 13 anni o più e accetto i",
  loginTermsLinkLabel: "Termini",
  loginPrivacyLinkLabel: "Informativa sulla privacy",
  loginErrorAgeRequired: "Conferma di avere 13 anni o più e di accettare Termini e Informativa sulla privacy.",
  loginErrorInvalidEmail: "Inserisci un indirizzo email valido.",
  loginErrorGoogleFailed: "Impossibile accedere con Google. Riprova.",
  loginErrorGeneric: "Qualcosa è andato storto. Riprova.",

  // Compose modal
  composeEyebrow: "Scrivi",
  composeTitleTemplate: (w) => `Scrivi la tua frase con ${w}`,
  composeSubtitle: "Usala in una frase e ricevi un feedback immediato su grammatica, tono e adattamento.",
  composeMeaningPickerLabel: "Scegli il significato che stai esercitando",
  composePlaceholder: "Scrivi qui la tua frase…",
  composeSubmit: "Verifica la frase",
  composeChecking: "Verifica in corso…",
  composeStatusPerfectLabel: "Perfetto",
  composeStatusAlmostLabel: "Quasi",
  composeStatusIncorrectLabel: "Non proprio",
  composeSuggestionEyebrow: "Riscrittura suggerita",
  composeTryAnother: "Prova un'altra frase",
  composeBackToWord: "Torna alla parola",
  composeErrorEmpty: "Scrivi prima una frase.",
  composeErrorTooShort: "Scrivi almeno qualche parola.",

  // Quiz modal
  quizEyebrow: "Esercitati",
  quizTitleTemplate: (w) => `${w}, quiz`,
  quizQuestionNofM: (n, m) => `Domanda ${n} di ${m}`,
  quizSubmit: "Invia",
  quizNext: "Domanda successiva",
  quizFinish: "Termina",
  quizYesCorrect: "Sì, corretto",
  quizNotQuite: "Non proprio",
  quizLoading: "Preparazione del tuo quiz…",
  quizFinalScoreTemplate: (c, t) => `Hai indovinato ${c} su ${t}.`,
  quizPracticeAnotherWord: "Esercitati con un'altra parola",
  quizBackToWord: "Torna alla parola",
  quizReviewMistakes: "Rivedi quelle che ho sbagliato",

  // Compare page
  compareEyebrow: "Confronta",
  compareTitle: "Distinguere parole simili",
  compareSubtitle:
    "a vs ha, e vs è, qual è vs qual'è, le parole che fanno inciampare anche i madrelingua.",
  compareWord1Label: "Parola 1",
  compareWord2Label: "Parola 2",
  compareWord1Placeholder: "a",
  compareWord2Placeholder: "ha",
  compareCta: "Confronta",
  compareLoading: "Confronto in corso…",
  compareEmpty: "Inserisci due parole per confrontarle",
  compareDifferenceLabel: "La differenza",
  compareExamplesLabel: "Esempi",
  compareCommonMistakeLabel: "Errore comune",
  compareErrNotARealWord: "Non riconosciamo una di queste parole.",
  compareErrDifferentLanguages: "Queste due parole sembrano in lingue diverse. Prova una coppia compatibile.",
  compareErrSameWord: "Sembrano la stessa parola. Provane due diverse.",
  compareErrGeneric: "Confronto non disponibile al momento.",

  // Notebook page
  notebookEyebrow: "Quaderno",
  notebookTitle: "Il tuo universo di parole",
  notebookSubtitle: "Ogni parola che hai esplorato, conservata, organizzata, in crescita.",
  notebookCounterTemplate: (n) => `${n} parole esplorate`,
  notebookWordsExplored: "parole esplorate",
  notebookPracticeNow: "Esercitati ora",
  notebookDueTodayTemplate: (n) => `${n} da rivedere oggi`,
  notebookListView: "Lista",
  notebookGalaxyView: "Galassia",
  notebookEmptyTitle: "Il tuo quaderno è vuoto",
  notebookEmptyCta: "Cerca una parola per iniziare",
  notebookRemoveAria: "Rimuovi",
  notebookMasteredLabel: "★ Padroneggiata",
  notebookSavedOnTemplate: (d) => `Salvata ${d}`,
  notebookLegendRecent: "Salvate di recente",
  notebookLegendMastered: "Padroneggiate",
  notebookLegendNeedsReview: "Da rivedere",

  // Spaced Repetition
  srEyebrow: "Esercitati",
  srWordNofMTemplate: (n, m) => `Parola ${n} di ${m}`,
  srSkip: "Salta",
  srClickToReveal: "Clicca ovunque per scoprire",
  srTapToReveal: "Tocca per scoprire",
  srPrimaryMeaningLabel: "Significato principale",
  srExamplesLabel: "Esempi",
  srIForgot: "L'ho dimenticata",
  srIKnewIt: "La sapevo",
  srSchedulingHint: "La sapevo = prossima revisione tra qualche giorno. L'ho dimenticata = torna a oggi.",
  srWordsPracticed: "parole esercitate",
  srSummaryStatTemplate: (k, f) => `${k} sapute · ${f} da ripassare`,
  srTomorrow: "Domani",
  srNextReviewTemplate: (when, count) =>
    `Prossima revisione: ${when} (${count} ${count === 1 ? "parola" : "parole"} da rivedere)`,
  srDoneForToday: "Per oggi è tutto",
  srPracticeMore: "Esercitati ancora",
  srEmptyTitle: "Nulla da rivedere oggi",
  srEmptyBody: "Bel lavoro. Torna domani.",
  srBackToNotebook: "Torna al quaderno",
  srLoading: "Caricamento dell'esercizio…",

  // Account
  accountEyebrow: "Account",
  accountYourSpace: "Il tuo spazio",
  accountNamedSpaceTemplate: (n) => `Lo spazio di ${n}`,
  accountPlanLabel: "Piano",
  accountOnPlanFree: "Gratuito",
  accountNoActiveSubscription: "Nessun abbonamento attivo",
  accountChooseAPlan: "Scegli un piano per iniziare.",
  accountTrialBadgeTemplate: (d) =>
    `Prova di 14 giorni · ${d} ${Number(d) === 1 ? "giorno rimanente" : "giorni rimanenti"}`,
  accountRenewsOnTemplate: (d) => `Si rinnova il ${d}`,
  accountCancelsAtPeriodEnd: "Termina alla fine del periodo di fatturazione",
  accountManageBilling: "Gestisci fatturazione",
  accountChangePlan: "Cambia piano",
  accountUpgrade: "Passa a un piano superiore",
  accountUsageThisMonth: "Utilizzo questo mese",
  accountImageGeneration: "Generazione immagini",
  accountSearches: "Ricerche",
  accountLocked: "Bloccato",
  accountUnlimited: "illimitato",
  accountTodaySuffix: "oggi",
  accountNearingLimit: "Ti stai avvicinando al limite del mese.",
  accountSectionLabel: "Account",
  accountEmailLabel: "Email",
  accountChangeEmail: "Cambia email",
  accountSignOut: "Esci",
  accountDeleteAccount: "Elimina account",

  // Report modal
  reportEyebrow: "Segnala un errore",
  reportTitle: "Cosa c'è di sbagliato?",
  reportTellMore: "Raccontaci di più",
  reportTellMorePh: "Facoltativo. Più sei specifico, più rapidamente possiamo risolvere.",
  reportSend: "Invia segnalazione",
  reportSending: "Invio in corso…",
  reportThanks: "Grazie, l'abbiamo ricevuta.",
  reportError: "Non è stato possibile inviare. Riprova tra poco.",
  reportCatIncorrectDefinition: "Definizione errata",
  reportCatWrongEtymology: "Etimologia errata",
  reportCatBadExample: "Frase di esempio sbagliata",
  reportCatKidsExplanation: "Problema con la spiegazione per bambini",
  reportCatIdiomIssue: "Problema con il modo di dire",
  reportCatWrongImage: "Immagine sbagliata",
  reportCatQuizWrongAnswer: "Quiz: risposta corretta segnata come errata",
  reportCatComposeFeedback: "Problema con il feedback alla frase",
  reportCatCompareResult: "Problema con il risultato del confronto",
  reportCatSomethingElse: "Qualcos'altro",

  // Origin, history, kids
  origin: "Origine",
  historyNote: "Nota storica",
  throughTime: "Nel tempo",
  forKids: "Per bambini",
  commonExpressions: "Espressioni comuni",
  idiomsWithMeaning: "Modi di dire con questo significato",
  meaningN: (n) => `Significato ${n}`,
  notJustPrimary: "Non solo quello principale",
  takeItFurther: "Vai oltre",
  doMoreWith: (w) => `Fai di più con ${w}`,
  saveToNotebook: "Salva nel quaderno",
  saveToNotebookHint: "Tornaci più tardi, organizzato e ricercabile.",
  generateImage: "Genera immagine",
  generatingImage: "Generazione…",
  generateImageHint: "Una visualizzazione AI vivida, solo per questa parola.",
  composeSentence: "Scrivi una frase",
  composeSentenceHint: "Scrivi la tua, Gadit controlla tono e adattamento.",
  practiceWord: "Esercitati con questa parola",
  practiceWordHint: "Un breve quiz adattato al tuo modo di imparare.",
  unlockWithClear: "Sblocca con Clear",
  upgradeToClear: "Passa a Clear",
  softWallAnonTitle: "Hai usato le tue ricerche gratuite",
  softWallAnonBody:
    "Registrati gratis per cercare fino a 20 parole al giorno, con definizioni complete, esempi, modi di dire e origine della parola.",
  softWallSignupCta: "Registrati, è gratis",
  softWallBasicTitle: "Hai raggiunto il limite di oggi",
  softWallBasicBody:
    "Gli account gratuiti hanno 20 ricerche al giorno. Il limite si azzera domani, oppure passa a Clear per ricerche illimitate più immagini, modalità bambini e feedback grammaticale.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "1 ricerca gratuita rimasta oggi, registrati gratis per averne 20 al giorno."
      : `${n} ricerche gratuite rimaste oggi, registrati gratis per averne 20 al giorno.`,
  clearUnlocksThis: "Clear sblocca questo",
  visualizeThisWord: "Visualizza",
  visualBlurb: "Un'immagine vivida, generata da Gadit, un'ancora visiva per come si sente questa parola.",
  visualBlurbLocked: "Genera un'immagine vivida e unica per questa parola, comprensione attraverso la vista.",
  reportLabel: "Segnala un errore",

  // Misc result/save/listen
  kidsComingSoon: "Spiegazione per bambini in arrivo.",
  saveToWordBook: "Salva nel quaderno",
  savedToWordBook: "Salvato nel quaderno",
  listenToWord: "Ascolta",
  offlinePin: "Salva offline",
  offlinePinned: "Salvato offline",
  offlinePinTitle: "Salva questa parola per lo studio offline",
  offlinePinnedTitle: "Salvata, disponibile senza WiFi",
  offlineDownloadPack: "Scarica pacchetto offline",
  offlineDownloadingPack: "Download in corso…",
  offlinePackHeader: "Pacchetto offline",
  offlinePackDescription:
    "Aggiunge le parole più cercate nella tua lingua al tuo quaderno e le mantiene disponibili senza WiFi per lo studio offline.",
};

const ja: Partial<V2Strings> = {
  // Homepage hero
  homeHeadlineLine1: "理解する",
  homeHeadlineLine2: "最後まで。",
  homeSubline:
    "文脈の中であなたを迎える辞書。意味、語源、イディオム、そして鮮やかなイメージを、11言語で。",
  searchPlaceholderHome: "単語を入力",
  voiceInputTitle: "単語を発音する",
  addContext: "文脈を追加",
  explain: "解説する",
  contextHint: "何か読んでいますか？ 文を貼り付けると意味がはっきりします。",
  tryLabel: "例",

  // Value props (Screen 1)
  valuePropsEyebrow: "Gadit が違うところ",
  valuePropsTitle: "定義を超えて。単語と共に暮らす方法。",
  valueProp1Eyebrow: "文脈を読む",
  valueProp1Title: "毎回、ぴったりの意味を",
  valueProp1Body: "文を貼り付けてください。Gadit は最も一般的な意味ではなく、合う意味を選びます。",
  valueProp2Eyebrow: "視覚的",
  valueProp2Title: "この単語のためだけの、鮮やかな一枚",
  valueProp2Body: "各エントリーごとに生成。ストック写真ではなく、単語の感触を視覚で捉える錨。",
  valueProp3Eyebrow: "語源",
  valueProp3Title: "Wikipedia の貼り付けではなく、語られる歴史",
  valueProp3Body: "その単語がどこから来たのか、好奇心ある友人が書くような一段落で。",
  valueProp4Eyebrow: "11 言語",
  valueProp4Title: "ヘブライ語とアラビア語も完全ネイティブ",
  valueProp4Body: "本物の RTL、本物のフォント、本物のイディオム。後付けの翻訳UIではありません。",

  previewLabel: "プレビュー",
  seeFullResult: "完全な結果を見る",

  pricingEyebrow: "料金",
  pricingTeaserTitle: "3つのプラン。すべてに本物のコンテンツ。",
  trustMicrocopy: "いつでもキャンセル可能 · Clear 月額プランで14日間お試し · お試し期間中は課金なし",

  // Footer
  footerProductGroup: "プロダクト",
  footerLegalGroup: "リーガル",
  footerCompare: "比較",
  footerNotebook: "ノート",
  footerPricing: "料金",
  footerPrivacy: "プライバシー",
  footerTerms: "利用規約",
  footerContact: "ヘルプ",
  footerTagline: "11言語のためのスマートな辞書。本物の読書のために作られた。",
  footerLanguagesNote: "11 言語",

  // Nav
  signIn: "ログイン",
  startFree: "無料で始める",
  verbStampDef: "言葉を完全に理解する",
  navSearch: "検索",
  navCompare: "比較",
  navNotebook: "ノート",
  navPricing: "料金",
  navFeatures: "機能",

  // Pricing page
  pricingPageHeadline: "3つのプラン。すべてに本物のコンテンツ。",
  pricingPageSubline: "無料で始める。深さが役に立つときにアップグレード。",
  billingMonthly: "月額",
  billingYearly: "年額",
  billingSave17: "17% お得",

  tierBasicTagline: "理解する",
  tierBasicPitch: "基本から始める。",
  tierBasicCta: "始める",
  tierClearTagline: "見える化",
  tierClearPitch: "画像、子どもモード、フィードバックで単語に命を吹き込む。",
  tierClearBadge: "一番人気",
  tierClearCta: "14日間の無料お試しを始める",
  tierClearCtaYearly: "年額で登録",
  tierClearTrust: "いつでもキャンセル可 · お試し期間中は課金なし",
  tierDeepTagline: "練習する",
  tierDeepPitch: "時間とともに強くなる、あなただけの語彙ライブラリを築く。",
  tierDeepCta: "Deep に登録",

  tierBasicFeatures:
    "1日20回の単語検索¶すべての意味（主な意味だけでなく）¶意味ごとに3つの例文¶語源と起源¶ログイン必須",
  tierClearFeatures:
    "Basic のすべて¶検索無制限¶子ども向け説明¶単語ごとの画像（月30枚）¶文を書いてフィードバックを受ける¶イディオムと表現¶検索履歴（直近30日）",
  tierDeepFeatures:
    "Clear のすべて¶練習クイズ¶あなただけの単語ノート¶長く残る語彙のための賢い練習¶似た単語を見分ける¶単語ごとの画像（月100枚）",

  basicEquivalent: "",
  clearEquivalent: "月額 $2.50 相当",
  deepEquivalent: "月額 $4.17 相当",

  // Section eyebrows on the result page
  meaningsEyebrow: "意味",
  idiomsEyebrow: "イディオムと表現",
  wordOriginEyebrow: "語源",
  visualEyebrow: "イメージ",
  takeItFurtherEyebrow: "もっと深く",
  // Word origin structured rows
  wordOriginLanguage: "言語",
  wordOriginOriginallyMeant: "もともとの意味",
  wordOriginBackgroundLabel: "背景",
  wordOriginOriginalWord: "もとの単語",
  wordOriginBreakdown: "単語の構成",
  // Meaning-level action labels
  actionCompose: "文を書く",
  actionQuiz: "クイズ",
  actionCompare: "単語を比べる",
  actionKidsExplanation: "子ども向け説明",
  // Visual / image gen
  visualEmptyLabel: "この単語のイメージを生成します",
  generateLabel: "生成",
  imageGeneratingLabel: "画像を生成中…",
  imageGeneratingHint: "通常は10〜15秒ほどかかります。",
  imageOpenFullAria: "画像を全画面で開く",
  compareComingSoon: "ワードゲームは近日公開。",
  navPlay: "ゲーム",
  navAffiliates: "パートナー",

  kidsModeLabel: "子ども",
  kidsModeTooltipOff: "タップすると、すべての単語が親が子に説明するように解説されます。",
  kidsModeTooltipOn: "子どもモードがオンです。すべての定義が子ども向けに書かれます。タップでオフにできます。",
  kidsModeBasicGate: "子どもモードは Clear の機能です。アップグレードしてご利用ください。",

  signupWelcomeTitle: "Gadit へようこそ！",
  signupWelcomeBody: "アカウントが用意できました。気になる単語を検索してみましょう。",

  // Share / save / listen on the result page
  shareLabel: "シェア",
  backLabel: "戻る",
  shareDefinitionAria: "この意味をシェア",
  savedAgoTemplate: (t) => `保存済み · ${t}`,

  // Trust strip
  trustStripCancel: "Stripe ポータルからいつでもキャンセル可能",
  trustStripMoneyBack: "初回購入には14日間の返金保証",
  trustStripDataYours: "あなたのデータはあなたのもの。いつでもエクスポートできます",
  trustStripNoAds: "広告なし、第三者のトラッキングなし",

  // FAQ
  faqEyebrow: "よくある質問",
  faqHeadline: "質問にお答えします",
  faqQ1: "プランは切り替えられますか？",
  faqA1: "はい、いつでもアップグレードまたはダウングレードできます。日割り計算は自動で行われ、差額のみのお支払いです。",
  faqQ2: "キャンセルしたらどうなりますか？",
  faqA2: "請求期間の終わりまでアクセスを保ち、その後 Basic に戻ります。データは失われません。",
  faqQ3: "お試しは本当に無料ですか？",
  faqA3: "はい。不正利用を防ぐためカード情報をいただきますが、15日目まで請求はされません。それまでにキャンセル＝0円。",
  faqQ4: "なぜ3つのプラン？",
  faqA4: "ユーザーごとに必要な深さが違います。盛りだくさんの単一プランを売るよりも、あなたのいる場所で出迎えたい。",
  faqQ5: "子ども向け説明は安全ですか？",
  faqA5: "はい。大人向けコンテンツと同じ配慮で AI が生成し、コンテンツルールでチェックされます。ユーザー投稿の子ども向けコンテンツはありません。",

  // Login modal
  loginWelcomeBack: "ログイン",
  loginCreateAccount: "アカウントを作成",
  loginContinueWithGoogle: "Google で続行",
  loginInAppNotice: "{app} 内では下のメールでサインインしてください。Google サインインを使うにはリンクをブラウザで開きます。",
  loginOrSeparator: "または",
  loginEmailLabel: "メールアドレス",
  loginPasswordLabel: "パスワード",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "ログイン",
  loginSubmitSignUp: "アカウント作成",
  loginSwitchToSignUp: "アカウントをお持ちでない？ 新規登録",
  loginForgotPassword: "パスワードをお忘れですか？",
  loginForgotPasswordEnterEmail: "まず上にメールアドレスを入力し、ここをタップしてください。",
  loginResetSent: "そのメールアドレスのアカウントが存在する場合、リセットリンクをお送りしました。",
  loginResetError: "リセットメールを送信できませんでした。もう一度お試しください。",
  loginSwitchToSignIn: "すでにアカウントをお持ちですか？ ログイン",
  loginShowPassword: "パスワードを表示",
  loginHidePassword: "パスワードを隠す",
  loginCloseAria: "閉じる",
  loginSigningIn: "ログイン中…",
  loginCreatingAccount: "アカウント作成中…",
  loginErrorWrongCredentials: "メールアドレスまたはパスワードが間違っています。",
  loginErrorEmailInUse: "このメールアドレスはすでに使われています。ログインをお試しください。",
  loginErrorWeakPassword: "パスワードは8文字以上で、文字と数字を含む必要があります。",
  loginAgeTermsLine: "私は13歳以上で、",
  loginTermsLinkLabel: "利用規約",
  loginPrivacyLinkLabel: "プライバシーポリシー",
  loginErrorAgeRequired: "13歳以上であること、利用規約とプライバシーポリシーに同意することを確認してください。",
  loginErrorInvalidEmail: "有効なメールアドレスを入力してください。",
  loginErrorGoogleFailed: "Google でのログインに失敗しました。もう一度お試しください。",
  loginErrorGeneric: "問題が発生しました。もう一度お試しください。",

  // Compose modal
  composeEyebrow: "書く",
  composeTitleTemplate: (w) => `「${w}」を使って自分の文を書く`,
  composeSubtitle: "文の中で使い、文法・トーン・適切さについて即座にフィードバックを受け取れます。",
  composeMeaningPickerLabel: "練習している意味を選んでください",
  composePlaceholder: "ここに文を入力…",
  composeSubmit: "文をチェック",
  composeChecking: "チェック中…",
  composeStatusPerfectLabel: "完璧",
  composeStatusAlmostLabel: "あと少し",
  composeStatusIncorrectLabel: "ちょっと違う",
  composeSuggestionEyebrow: "推奨する書き直し",
  composeTryAnother: "別の文を試す",
  composeBackToWord: "単語に戻る",
  composeErrorEmpty: "まず文を書いてください。",
  composeErrorTooShort: "少なくとも数語を書いてください。",

  // Quiz modal
  quizEyebrow: "練習",
  quizTitleTemplate: (w) => `${w} クイズ`,
  quizQuestionNofM: (n, m) => `問題 ${n} / ${m}`,
  quizSubmit: "送信",
  quizNext: "次の問題",
  quizFinish: "終了",
  quizYesCorrect: "正解です",
  quizNotQuite: "おしい",
  quizLoading: "クイズを準備中…",
  quizFinalScoreTemplate: (c, t) => `${t} 問中 ${c} 問正解。`,
  quizPracticeAnotherWord: "別の単語を練習",
  quizBackToWord: "単語に戻る",
  quizReviewMistakes: "間違えた問題を見直す",

  // Compare page
  compareEyebrow: "比較",
  compareTitle: "似た単語を見分ける",
  compareSubtitle:
    "affect と effect、暑い と熱い、principle と principal, ネイティブでもつまずく単語。",
  compareWord1Label: "単語 1",
  compareWord2Label: "単語 2",
  compareWord1Placeholder: "affect",
  compareWord2Placeholder: "effect",
  compareCta: "比較する",
  compareLoading: "比較中…",
  compareEmpty: "比較する単語を2つ入力してください",
  compareDifferenceLabel: "違い",
  compareExamplesLabel: "例文",
  compareCommonMistakeLabel: "よくある間違い",
  compareErrNotARealWord: "いずれかの単語を認識できません。",
  compareErrDifferentLanguages: "2つの単語は異なる言語のようです。対応する組み合わせをお試しください。",
  compareErrSameWord: "同じ単語のようです。別の2語をお試しください。",
  compareErrGeneric: "現在比較を利用できません。",

  // Notebook page
  notebookEyebrow: "ノート",
  notebookTitle: "あなたの言葉の宇宙",
  notebookSubtitle: "探索したすべての単語が、保存され、整理され、育っていきます。",
  notebookCounterTemplate: (n) => `${n} 語を探索`,
  notebookWordsExplored: "語を探索",
  notebookPracticeNow: "今すぐ練習",
  notebookDueTodayTemplate: (n) => `今日 ${n} 件`,
  notebookListView: "リスト",
  notebookGalaxyView: "ギャラクシー",
  notebookEmptyTitle: "ノートは空です",
  notebookEmptyCta: "単語を検索して始めましょう",
  notebookRemoveAria: "削除",
  notebookMasteredLabel: "★ マスター",
  notebookSavedOnTemplate: (d) => `保存: ${d}`,
  notebookLegendRecent: "最近保存",
  notebookLegendMastered: "マスター済み",
  notebookLegendNeedsReview: "復習が必要",

  // Spaced Repetition
  srEyebrow: "練習",
  srWordNofMTemplate: (n, m) => `${m} 語中 ${n} 語目`,
  srSkip: "スキップ",
  srClickToReveal: "クリックで表示",
  srTapToReveal: "タップで表示",
  srPrimaryMeaningLabel: "主な意味",
  srExamplesLabel: "例文",
  srIForgot: "忘れていた",
  srIKnewIt: "知っていた",
  srSchedulingHint: "知っていた = 数日後に再復習。忘れていた = 今日に戻る。",
  srWordsPracticed: "練習した単語",
  srSummaryStatTemplate: (k, f) => `${k} 語知っていた · ${f} 語をもう一度`,
  srTomorrow: "明日",
  srNextReviewTemplate: (when, count) => `次の復習: ${when}（${count} 語）`,
  srDoneForToday: "今日はこれで終わり",
  srPracticeMore: "もっと練習",
  srEmptyTitle: "今日は復習する単語がありません",
  srEmptyBody: "お疲れさまでした。また明日。",
  srBackToNotebook: "ノートに戻る",
  srLoading: "練習を読み込み中…",

  // Account
  accountEyebrow: "アカウント",
  accountYourSpace: "あなたのスペース",
  accountNamedSpaceTemplate: (n) => `${n} さんのスペース`,
  accountPlanLabel: "プラン",
  accountOnPlanFree: "無料",
  accountNoActiveSubscription: "有効なサブスクリプションはありません",
  accountChooseAPlan: "プランを選んで始めましょう。",
  accountTrialBadgeTemplate: (d) => `14日間お試し · 残り ${d} 日`,
  accountRenewsOnTemplate: (d) => `更新日: ${d}`,
  accountCancelsAtPeriodEnd: "請求期間の終わりに終了",
  accountManageBilling: "お支払いを管理",
  accountChangePlan: "プランを変更",
  accountUpgrade: "アップグレード",
  accountUsageThisMonth: "今月の使用状況",
  accountImageGeneration: "画像生成",
  accountSearches: "検索",
  accountLocked: "ロック中",
  accountUnlimited: "無制限",
  accountTodaySuffix: "今日",
  accountNearingLimit: "今月の上限に近づいています。",
  accountSectionLabel: "アカウント",
  accountEmailLabel: "メールアドレス",
  accountChangeEmail: "メールを変更",
  accountSignOut: "ログアウト",
  accountDeleteAccount: "アカウントを削除",

  // Report modal
  reportEyebrow: "エラーを報告",
  reportTitle: "何が違いますか？",
  reportTellMore: "もっと教えてください",
  reportTellMorePh: "任意。具体的なほど早く修正できます。",
  reportSend: "報告を送信",
  reportSending: "送信中…",
  reportThanks: "ありがとうございます。受け取りました。",
  reportError: "送信できませんでした。少し後にもう一度お試しください。",
  reportCatIncorrectDefinition: "定義が間違っている",
  reportCatWrongEtymology: "語源が間違っている",
  reportCatBadExample: "例文が不適切",
  reportCatKidsExplanation: "子ども向け説明の問題",
  reportCatIdiomIssue: "イディオムの問題",
  reportCatWrongImage: "画像が違う",
  reportCatQuizWrongAnswer: "クイズ：正解が誤りとされた",
  reportCatComposeFeedback: "文へのフィードバックの問題",
  reportCatCompareResult: "比較結果の問題",
  reportCatSomethingElse: "その他",

  // Origin, history, kids, misc
  origin: "語源",
  historyNote: "歴史的背景",
  throughTime: "時代を超えて",
  forKids: "子ども向け",
  commonExpressions: "よく使われる表現",
  idiomsWithMeaning: "この意味のイディオム",
  meaningN: (n) => `意味 ${n}`,
  notJustPrimary: "主な意味だけではない",
  takeItFurther: "もっと深く",
  doMoreWith: (w) => `「${w}」でさらに学ぶ`,
  saveToNotebook: "ノートに保存",
  saveToNotebookHint: "あとで戻ってこられます。整理されて検索もできます。",
  generateImage: "画像を生成",
  generatingImage: "生成中…",
  generateImageHint: "この単語だけのために生成された、鮮やかな AI ビジュアル。",
  composeSentence: "文を書く",
  composeSentenceHint: "あなた自身の文を書くと、Gadit がトーンと適切さをチェックします。",
  practiceWord: "この単語を練習",
  practiceWordHint: "あなたの学び方に合わせた短いクイズ。",
  unlockWithClear: "Clear で解放",
  upgradeToClear: "Clear にアップグレード",
  softWallAnonTitle: "無料検索を使い切りました",
  softWallAnonBody:
    "無料登録で1日最大20語を検索できます。完全な定義、例文、イディオム、語源つき。",
  softWallSignupCta: "無料登録",
  softWallBasicTitle: "今日の上限に達しました",
  softWallBasicBody:
    "無料アカウントは1日20回検索できます。上限は明日リセットされます。または Clear にアップグレードすると、検索無制限に加え、画像、子どもモード、文法フィードバックも使えます。",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "今日の無料検索は残り1回。無料登録で1日20回に。"
      : `今日の無料検索は残り ${n} 回。無料登録で1日20回に。`,
  clearUnlocksThis: "Clear がこれを解放します",
  visualizeThisWord: "ビジュアル化",
  visualBlurb: "Gadit が生成した鮮やかな一枚。この単語の感触のための視覚的なアンカー。",
  visualBlurbLocked: "この単語のための鮮やかな唯一無二の画像を生成, 視覚で理解する。",
  reportLabel: "エラーを報告",

  // Result misc
  kidsComingSoon: "子ども向け説明は近日公開。",
  saveToWordBook: "ノートに保存",
  savedToWordBook: "ノートに保存しました",
  listenToWord: "聞く",
  offlinePin: "オフライン保存",
  offlinePinned: "オフライン保存済み",
  offlinePinTitle: "オフライン学習用にこの単語を保存",
  offlinePinnedTitle: "保存済み。Wi-Fi なしで利用可能",
  offlineDownloadPack: "オフラインパックをダウンロード",
  offlineDownloadingPack: "ダウンロード中…",
  offlinePackHeader: "オフラインパック",
  offlinePackDescription:
    "あなたの言語で最も検索されている単語をノートに追加し、Wi-Fi なしでもオフライン学習できるようにします。",
};

const TABLES: Record<Lang, Partial<V2Strings>> = {
  en,
  he,
  ar,
  ru,
  es,
  pt,
  fr,
  de,
  cs,
  sk,
  it,
  ja,
};

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
  const locale = TABLES[lang] ?? {};
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
