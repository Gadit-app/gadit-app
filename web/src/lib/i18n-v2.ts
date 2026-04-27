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
  // Signed-in primary navigation (in MarketingHeader)
  navSearch: string;
  navCompare: string;
  navNotebook: string;
  navPricing: string;

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
  basicEquivalent: string; // empty for free tier — kept for symmetry
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
  loginOrSeparator: string;
  loginEmailLabel: string;
  loginPasswordLabel: string;
  loginEmailPlaceholder: string;
  loginPasswordPlaceholder: string;
  loginSubmitSignIn: string;
  loginSubmitSignUp: string;
  loginSwitchToSignUp: string;
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
  quizTitleTemplate: Template1; // word → "[word] — quiz"
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
  /** template: "127 words explored" — number is the only arg.
   *  Kept for backward compat; new layouts prefer the split
   *  numeral + notebookWordsExplored label pair. */
  notebookCounterTemplate: Template1;
  /** Plain label that follows a giant numeral, e.g. "words explored"
   *  rendered under "127". Used in the Notebook hero counter. */
  notebookWordsExplored: string;
  notebookPracticeNow: string;
  /** template: "5 due today" — number is the only arg */
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
  /** template: "Word 2 of 5" — index, total */
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
  /** template: "Next review: Tomorrow (3 words due)" — tomorrow text, count */
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
  /** template: "Lena's space" — first name */
  accountNamedSpaceTemplate: Template1;
  // Plan section
  accountPlanLabel: string;
  accountOnPlanFree: string;
  accountNoActiveSubscription: string;
  accountChooseAPlan: string;
  /** template: "14-day trial · 6 days remaining" — days */
  accountTrialBadgeTemplate: Template1;
  /** template: "Renews Apr 26, 2026" — date string */
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
}

const en: V2Strings = {
  homeHeadlineLine1: "Understand",
  homeHeadlineLine2: "to the end.",
  homeSubline:
    "A dictionary that meets you in context — meanings, origins, idioms, and a vivid image, in 7 languages.",

  searchPlaceholderHome: "Type or dictate a word",
  voiceInputTitle: "Dictate a word",
  addContext: "Add context",
  explain: "Explain",
  contextHint:
    "Reading something? Paste the sentence to disambiguate meaning.",
  tryLabel: "Try",

  valuePropsEyebrow: "What Gadit does differently",
  valuePropsTitle: "More than a definition — a way to live with a word.",
  valueProp1Eyebrow: "Context-aware",
  valueProp1Title: "The right meaning, every time",
  valueProp1Body:
    "Paste a sentence — Gadit picks the sense that fits, not just the most common one.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "A vivid image, just for this word",
  valueProp2Body:
    "Generated for each entry. A visual anchor for how a word feels — not a stock photo.",
  valueProp3Eyebrow: "Etymology",
  valueProp3Title: "A history note, not a Wikipedia dump",
  valueProp3Body:
    "Where the word came from, told as a paragraph — the kind a curious friend would write.",
  valueProp4Eyebrow: "7 languages",
  valueProp4Title: "Hebrew & Arabic, fully native",
  valueProp4Body:
    "Real RTL, real fonts, real idioms — not a translated UI bolted on.",

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
  footerContact: "Contact",
  footerTagline: "A smart dictionary for 7 languages. Built for real reading.",
  footerLanguagesNote: "7 languages",

  signIn: "Sign in",
  navSearch: "Search",
  navCompare: "Compare",
  navNotebook: "Notebook",
  navPricing: "Pricing",

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
  trustStripDataYours: "Your data is yours — export anytime",
  trustStripNoAds: "No ads, no third-party tracking",

  faqEyebrow: "FAQ",
  faqHeadline: "Questions, answered",
  faqQ1: "Can I switch plans?",
  faqA1:
    "Yes, upgrade or downgrade anytime. Proration is handled automatically — you only pay the difference.",
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
  loginOrSeparator: "or",
  loginEmailLabel: "Email",
  loginPasswordLabel: "Password",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Sign in",
  loginSubmitSignUp: "Create account",
  loginSwitchToSignUp: "Don't have an account? Sign up",
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
  quizTitleTemplate: (w) => `${w} — quiz`,
  quizQuestionNofM: (n, m) => `Question ${n} of ${m}`,
  quizSubmit: "Submit",
  quizNext: "Next question",
  quizFinish: "Finish",
  quizYesCorrect: "Yes — correct",
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
    "affect vs effect, אומנות vs אמנות, principle vs principal — the words that catch even native speakers.",
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
    "These two words seem to be in different languages — try a matched pair.",
  compareErrSameWord: "These look like the same word — try two different ones.",
  compareErrGeneric: "Compare unavailable right now.",

  // Notebook (Screen 8)
  notebookEyebrow: "Notebook",
  notebookTitle: "Your universe of words",
  notebookSubtitle:
    "Every word you've explored — kept, organized, growing.",
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
  reportEyebrow: "Report an issue",
  reportTitle: "What's wrong?",
  reportTellMore: "Tell us more",
  reportTellMorePh: "Optional. The more specific, the faster we can fix it.",
  reportSend: "Send report",
  reportSending: "Sending…",
  reportThanks: "Thanks — we got it.",
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
  saveToNotebookHint: "Return to it later — organized, searchable.",
  generateImage: "Generate image",
  generatingImage: "Generating…",
  generateImageHint: "A vivid AI-made visual, just for this word.",
  composeSentence: "Compose a sentence",
  composeSentenceHint: "Write your own — Gadit reviews for tone and fit.",
  practiceWord: "Practice this word",
  practiceWordHint: "A short quiz tuned to how you learn.",
  unlockWithClear: "Unlock with Clear",
  upgradeToClear: "Upgrade to Clear",
  softWallAnonTitle: "You've used your free searches",
  softWallAnonBody:
    "Sign up free to keep searching — 20 words a day, your notebook saved across devices, and the rest of Gadit unlocked.",
  softWallSignupCta: "Sign up — it's free",
  softWallBasicTitle: "You've reached today's limit",
  softWallBasicBody:
    "Free accounts get 20 searches per day. The limit resets tomorrow — or upgrade to Clear for unlimited searches plus images, kids mode, and grammar feedback.",
  softBannerSearchesLeft: (n) =>
    Number(n) === 1
      ? "1 free search left today — sign up free to get 20 a day."
      : `${n} free searches left today — sign up free to get 20 a day.`,
  clearUnlocksThis: "Clear unlocks this",
  visualizeThisWord: "Visualize",
  visualBlurb:
    "One vivid image, generated by Gadit — a visual anchor for how this word feels.",
  visualBlurbLocked:
    "Generate a vivid, one-of-a-kind image for this word — understanding through sight.",
  reportLabel: "Report",
};

const he: V2Strings = {
  homeHeadlineLine1: "להבין",
  homeHeadlineLine2: "עד הסוף.",
  homeSubline:
    "מילון שמבין הקשר — משמעויות, מקור, ביטויים ותמונה חיה, ב־7 שפות.",

  searchPlaceholderHome: "הקלידו או הכתיבו מילה",
  voiceInputTitle: "הכתבת מילה",
  addContext: "הוסיפו הקשר",
  explain: "הסבר",
  contextHint:
    "קוראים משהו? הדביקו את המשפט שהמילה מופיעה בו — Gadit יבחר את המשמעות הנכונה.",
  tryLabel: "נסו",

  valuePropsEyebrow: "מה Gadit עושה אחרת",
  valuePropsTitle: "יותר מהגדרה — דרך לחיות עם המילה.",
  valueProp1Eyebrow: "מודע להקשר",
  valueProp1Title: "המשמעות הנכונה, בכל פעם",
  valueProp1Body:
    "הדביקו משפט — Gadit יבחר את המשמעות שמתאימה, לא רק את הנפוצה.",
  valueProp2Eyebrow: "ויזואלי",
  valueProp2Title: "תמונה חיה, במיוחד למילה הזו",
  valueProp2Body:
    "נוצרת לכל ערך. עוגן ויזואלי לתחושת המילה — לא תמונת סטוק.",
  valueProp3Eyebrow: "אטימולוגיה",
  valueProp3Title: "הערה היסטורית, לא ויקיפדיה",
  valueProp3Body:
    "מאיפה המילה הגיעה, מסופר כפסקה — כמו שחבר סקרן היה כותב.",
  valueProp4Eyebrow: "7 שפות",
  valueProp4Title: "עברית וערבית כשפות אם",
  valueProp4Body:
    "RTL אמיתי, גופנים אמיתיים, ביטויים אמיתיים — לא ממשק מתורגם.",

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
  footerContact: "צור קשר",
  footerTagline: "מילון חכם ל־7 שפות. בנוי לקריאה אמיתית.",
  footerLanguagesNote: "7 שפות",

  signIn: "התחברות",
  navSearch: "חיפוש",
  navCompare: "השוואה",
  navNotebook: "מחברת",
  navPricing: "תמחור",

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
    "20 חיפושי מילים ביום¶כל המשמעויות (לא רק העיקרית)¶3 דוגמאות לכל משמעות¶אטימולוגיה ומקור המילה¶נדרשת התחברות",

  tierClearTagline: "לראות",
  tierClearPitch: "החיו את המילים — תמונות, הסבר לילדים ומשוב.",
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
  trustStripDataYours: "הנתונים שלכם — ייצוא מתי שתרצו",
  trustStripNoAds: "ללא פרסומות וללא מעקב צד ג׳",

  faqEyebrow: "שאלות שכיחות",
  faqHeadline: "שאלות, תשובות.",
  faqQ1: "אפשר להחליף תוכנית?",
  faqA1:
    "כן, אפשר לשדרג או לרדת בכל עת. החיוב היחסי מטופל אוטומטית — תשלמו רק את ההפרש.",
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
  loginOrSeparator: "או",
  loginEmailLabel: "אימייל",
  loginPasswordLabel: "סיסמה",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "התחברות",
  loginSubmitSignUp: "צרו חשבון",
  loginSwitchToSignUp: "אין חשבון? הירשמו",
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
  quizTitleTemplate: (w) => `${w} — תרגול`,
  quizQuestionNofM: (n, m) => `שאלה ${n} מתוך ${m}`,
  quizSubmit: "בדיקה",
  quizNext: "שאלה הבאה",
  quizFinish: "סיום",
  quizYesCorrect: "נכון — כל הכבוד",
  quizNotQuite: "לא לגמרי",
  quizLoading: "מכינים שאלון…",
  quizFinalScoreTemplate: (c, t) => `ענית נכון על ${c} מתוך ${t}.`,
  quizPracticeAnotherWord: "תרגול מילה נוספת",
  quizBackToWord: "חזרה למילה",
  quizReviewMistakes: "סקירת הטעויות",

  // Compare Page (Screen 7)
  compareEyebrow: "השוואה",
  compareTitle: "הבחינו בין מילים דומות",
  compareSubtitle:
    "אומנות מול אמנות, affect מול effect — המילים שמבלבלות אפילו דוברים שוטפים.",
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
    "שתי המילים נראות בשפות שונות — נסו זוג תואם.",
  compareErrSameWord:
    "אלו נראות כאותה מילה — נסו שתי מילים שונות.",
  compareErrGeneric: "ההשוואה אינה זמינה כרגע.",

  // Notebook (Screen 8)
  notebookEyebrow: "מחברת",
  notebookTitle: "יקום המילים שלכם",
  notebookSubtitle:
    "כל מילה שלמדתם — נשמרת, מאורגנת, גדלה.",
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
  reportEyebrow: "דיווח על בעיה",
  reportTitle: "מה לא בסדר?",
  reportTellMore: "ספרו עוד",
  reportTellMorePh: "אופציונלי. ככל שמפורט יותר, כך נתקן מהר יותר.",
  reportSend: "שליחת דיווח",
  reportSending: "שולחים…",
  reportThanks: "תודה — קיבלנו.",
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
  saveToNotebookHint: "חזרו אליה אחר־כך — מאורגנת וזמינה לחיפוש.",
  generateImage: "צרו תמונה",
  generatingImage: "יוצרים…",
  generateImageHint: "תמונה חיה שנוצרת ב־AI, במיוחד למילה הזו.",
  composeSentence: "חברו משפט",
  composeSentenceHint: "כתבו משלכם — Gadit ייתן משוב על טון והקשר.",
  practiceWord: "תרגלו את המילה",
  practiceWordHint: "שאלון קצר שמותאם לאופן הלמידה שלכם.",
  unlockWithClear: "פתחו עם Clear",
  upgradeToClear: "שדרגו ל־Clear",
  softWallAnonTitle: "ניצלתם את החיפושים החינמיים",
  softWallAnonBody:
    "הירשמו חינם כדי להמשיך — 20 מילים ביום, מחברת אישית שנשמרת בין מכשירים, וכל שאר Gadit פתוח.",
  softWallSignupCta: "הרשמה חינם",
  softWallBasicTitle: "הגעתם למכסה היומית",
  softWallBasicBody:
    "חשבון חינם כולל 20 חיפושים ביום. המכסה מתאפסת מחר — או שדרגו ל־Clear לחיפושים ללא הגבלה, תמונות, מצב ילדים ומשוב על משפטים.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "נשאר חיפוש חינמי אחד היום — הרשמה חינם נותנת 20 ביום."
      : `נשארו ${num} חיפושים חינמיים היום — הרשמה חינם נותנת 20 ביום.`;
  },
  clearUnlocksThis: "נפתח עם Clear",
  visualizeThisWord: "ראו את",
  visualBlurb:
    "תמונה אחת חיה, שנוצרה על־ידי Gadit — עוגן ויזואלי לתחושת המילה.",
  visualBlurbLocked:
    "צרו תמונה ייחודית למילה — הבנה דרך הראייה.",
  reportLabel: "דיווח",
};

const ar: V2Strings = {
  homeHeadlineLine1: "افهم",
  homeHeadlineLine2: "حتى النهاية.",
  homeSubline:
    "قاموس يفهم السياق — معانٍ وأصول وتعابير وصورة حيّة، بسبع لغات.",

  searchPlaceholderHome: "اكتب أو أملِ كلمة",
  voiceInputTitle: "إملاء كلمة",
  addContext: "أضف السياق",
  explain: "اشرح",
  contextHint: "تقرأ نصًّا؟ ألصق الجملة ليختار Gadit المعنى الأنسب.",
  tryLabel: "جرّب",

  valuePropsEyebrow: "ما الذي يفعله Gadit بشكل مختلف",
  valuePropsTitle: "أكثر من تعريف — طريقة للعيش مع الكلمة.",
  valueProp1Eyebrow: "مدرك للسياق",
  valueProp1Title: "المعنى الصحيح في كل مرة",
  valueProp1Body:
    "ألصق الجملة — يختار Gadit المعنى الملائم لا الأكثر شيوعًا.",
  valueProp2Eyebrow: "بصري",
  valueProp2Title: "صورة حيّة لهذه الكلمة",
  valueProp2Body:
    "تُنشَأ لكل مدخل. مرساة بصرية لشعور الكلمة — لا صورة جاهزة.",
  valueProp3Eyebrow: "الأصل",
  valueProp3Title: "ملاحظة تاريخية، لا مدخل ويكيبيديا",
  valueProp3Body:
    "من أين أتت الكلمة، يُروى كفقرة — كما يكتب صديق فضولي.",
  valueProp4Eyebrow: "7 لغات",
  valueProp4Title: "العربية والعبرية، بكامل أصالتهما",
  valueProp4Body:
    "RTL حقيقي، خطوط حقيقية، تعابير حقيقية — لا واجهة مترجمة.",

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
  footerContact: "تواصل",
  footerTagline: "قاموس ذكي بسبع لغات. مبنيّ للقراءة الحقيقية.",
  footerLanguagesNote: "7 لغات",

  signIn: "تسجيل الدخول",
  navSearch: "بحث",
  navCompare: "مقارنة",
  navNotebook: "الدفتر",
  navPricing: "الأسعار",

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
  trustStripDataYours: "بياناتك ملكك — تُصدَّر متى شئت",
  trustStripNoAds: "لا إعلانات ولا تتبّع طرف ثالث",

  faqEyebrow: "أسئلة شائعة",
  faqHeadline: "إجابات على الأسئلة",
  faqQ1: "هل يمكنني تغيير الخطة؟",
  faqA1:
    "نعم، ارتقِ أو انزل في أي وقت. يُحسَب الفرق آليًّا — تدفع الفارق فقط.",
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
  loginOrSeparator: "أو",
  loginEmailLabel: "البريد الإلكتروني",
  loginPasswordLabel: "كلمة المرور",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "تسجيل الدخول",
  loginSubmitSignUp: "أنشئ الحساب",
  loginSwitchToSignUp: "ليس لديك حساب؟ أنشئ واحدًا",
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
  quizTitleTemplate: (w) => `${w} — اختبار`,
  quizQuestionNofM: (n, m) => `السؤال ${n} من ${m}`,
  quizSubmit: "تحقّق",
  quizNext: "السؤال التالي",
  quizFinish: "إنهاء",
  quizYesCorrect: "صحيح — أحسنت",
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
    "ضلّ مقابل ظلّ، affect مقابل effect — الكلمات التي تخدع حتى الناطقين الأصليين.",
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
    "الكلمتان تبدوان من لغتين مختلفتين — جرّب زوجًا متوافقًا.",
  compareErrSameWord:
    "تبدوان كأنهما الكلمة نفسها — جرّب كلمتين مختلفتين.",
  compareErrGeneric: "المقارنة غير متاحة الآن.",

  // Notebook (Screen 8)
  notebookEyebrow: "الدفتر",
  notebookTitle: "عالمُك من الكلمات",
  notebookSubtitle:
    "كل كلمة استكشفتها — تُحفَظ وتُنظَّم، ومع الوقت تتسع مكتبتك.",
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
  reportEyebrow: "الإبلاغ عن مشكلة",
  reportTitle: "ما الخطأ؟",
  reportTellMore: "أخبرنا أكثر",
  reportTellMorePh: "اختياري. كلما زادت التفاصيل، أسرعنا في الإصلاح.",
  reportSend: "إرسال البلاغ",
  reportSending: "جاري الإرسال…",
  reportThanks: "شكرًا — وصلنا.",
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
  saveToNotebookHint: "عُد إليها لاحقًا — منظَّمة وقابلة للبحث.",
  generateImage: "أنشئ صورة",
  generatingImage: "جارٍ الإنشاء…",
  generateImageHint:
    "صورة بصرية حيّة من الذكاء الاصطناعي، لهذه الكلمة فقط.",
  composeSentence: "اكتب جملة",
  composeSentenceHint: "اكتب جملتك — يراجعها Gadit للنبرة والملاءمة.",
  practiceWord: "تدرَّب على هذه الكلمة",
  practiceWordHint: "اختبار قصير على مقاس تعلُّمك.",
  unlockWithClear: "افتح بـ Clear",
  upgradeToClear: "ارتقِ إلى Clear",
  softWallAnonTitle: "استنفدت عمليات البحث المجانية",
  softWallAnonBody:
    "اشترك مجانًا للمتابعة — 20 كلمة يوميًا، دفتر شخصي محفوظ بين الأجهزة، وبقية Gadit مفتوح.",
  softWallSignupCta: "اشتراك مجاني",
  softWallBasicTitle: "وصلت إلى الحد اليومي",
  softWallBasicBody:
    "الحساب المجاني يشمل 20 بحثًا في اليوم. يُعاد تعيين الحد غدًا — أو ارتقِ إلى Clear لبحث بلا حدود مع الصور وشرح الأطفال والمراجعة.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    if (num === 1) return "بقي بحث مجاني واحد اليوم — الاشتراك المجاني يمنحك 20 يوميًا.";
    if (num === 2) return "بقي بحثان مجانيان اليوم — الاشتراك المجاني يمنحك 20 يوميًا.";
    return `بقيت ${num} عمليات بحث مجانية اليوم — الاشتراك المجاني يمنحك 20 يوميًا.`;
  },
  clearUnlocksThis: "تفتحها Clear",
  visualizeThisWord: "تخيّل",
  visualBlurb: "صورة واحدة حيّة من Gadit — مرساة بصرية لشعور الكلمة.",
  visualBlurbLocked: "أنشئ صورة فريدة لهذه الكلمة — الفهم عبر النظر.",
  reportLabel: "إبلاغ",
};

// Russian — formal "вы" register throughout (B2C SaaS convention).
const ru: Partial<V2Strings> = {
  homeHeadlineLine1: "Понимать",
  homeHeadlineLine2: "до конца.",
  homeSubline:
    "Словарь, который улавливает контекст — значения, происхождение, идиомы и живой образ, на 7 языках.",

  searchPlaceholderHome: "Введите или продиктуйте слово",
  voiceInputTitle: "Продиктовать слово",
  addContext: "Добавить контекст",
  explain: "Объяснить",
  contextHint:
    "Что-то читаете? Вставьте предложение — мы выберем нужное значение.",
  tryLabel: "Попробуйте",

  valuePropsEyebrow: "Чем Gadit отличается",
  valuePropsTitle: "Больше, чем определение — это способ жить со словом.",
  valueProp1Eyebrow: "Контекст",
  valueProp1Title: "Нужное значение, каждый раз",
  valueProp1Body:
    "Вставьте предложение — Gadit выберет тот смысл, что подходит, а не самый частый.",
  valueProp2Eyebrow: "Образ",
  valueProp2Title: "Живая картинка для каждого слова",
  valueProp2Body:
    "Создаётся для каждого запроса. Визуальный якорь — а не сток-фото.",
  valueProp3Eyebrow: "Этимология",
  valueProp3Title: "Краткая история, а не статья из Википедии",
  valueProp3Body:
    "Откуда пришло слово — рассказано как абзац, без сухих фактов.",
  valueProp4Eyebrow: "7 языков",
  valueProp4Title: "Иврит и арабский — как родные",
  valueProp4Body:
    "Настоящий RTL, настоящие шрифты, настоящие идиомы — а не переведённый интерфейс.",

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
  footerContact: "Связаться",
  footerTagline: "Умный словарь на 7 языках. Создан для настоящего чтения.",
  footerLanguagesNote: "7 языков",

  signIn: "Войти",
  navSearch: "Поиск",
  navCompare: "Сравнить",
  navNotebook: "Тетрадь",
  navPricing: "Тарифы",

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
    "Оживите слова — картинками, детским режимом и обратной связью.",
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
    "Всё из Clear¶Тренировки и тесты¶Личная тетрадь слов¶Умная практика — словарь, который остаётся с вами¶Различение похожих слов¶Картинка к каждому слову (100 в месяц)",

  basicEquivalent: "",
  clearEquivalent: "В среднем $2,50 в месяц",
  deepEquivalent: "В среднем $4,17 в месяц",

  trustStripCancel: "Отмена в любое время через портал Stripe",
  trustStripMoneyBack: "Возврат денег за 14 дней при первой покупке",
  trustStripDataYours: "Ваши данные — ваши, экспорт в любой момент",
  trustStripNoAds: "Без рекламы и сторонних трекеров",

  faqEyebrow: "Вопросы",
  faqHeadline: "Ответы на главные вопросы",
  faqQ1: "Можно сменить тариф?",
  faqA1:
    "Да, повышение или понижение в любое время. Перерасчёт автоматический — вы платите только разницу.",
  faqQ2: "Что если я отменю?",
  faqA2:
    "Доступ сохраняется до конца оплаченного периода, потом возвращаетесь на Basic. Данные не теряются.",
  faqQ3: "Пробный действительно бесплатный?",
  faqA3:
    "Да. Карта нужна для защиты от злоупотреблений, но списание происходит только на 15-й день. Отмените раньше — ничего не платите.",
  faqQ4: "Почему три тарифа?",
  faqA4:
    "Разным людям нужна разная глубина. Лучше встретить вас там, где вы есть, чем продавать один универсальный план.",
  faqQ5: "Безопасны ли детские объяснения?",
  faqA5:
    "Да. Они генерируются ИИ с теми же правилами безопасности, что и взрослый контент. Контент создаётся не пользователями.",

  loginWelcomeBack: "Войти",
  loginCreateAccount: "Создайте аккаунт",
  loginContinueWithGoogle: "Продолжить с Google",
  loginOrSeparator: "или",
  loginEmailLabel: "Эл. почта",
  loginPasswordLabel: "Пароль",
  loginEmailPlaceholder: "you@example.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Войти",
  loginSubmitSignUp: "Создать аккаунт",
  loginSwitchToSignUp: "Нет аккаунта? Зарегистрируйтесь",
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
    "Используйте слово в предложении — получите разбор грамматики, тона и уместности.",
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
  quizTitleTemplate: (w) => `${w} — тест`,
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
    "одеть vs надеть, affect vs effect — слова, на которых ошибаются даже носители.",
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
    "Эти слова, кажется, на разных языках — попробуйте пару из одного языка.",
  compareErrSameWord: "Это одно и то же слово — попробуйте два разных.",
  compareErrGeneric: "Сравнение временно недоступно.",

  notebookEyebrow: "Тетрадь",
  notebookTitle: "Ваша вселенная слов",
  notebookSubtitle:
    "Каждое слово, которое вы исследовали — сохраняется, упорядочивается, растёт со временем.",
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

  reportEyebrow: "Сообщить о проблеме",
  reportTitle: "Что не так?",
  reportTellMore: "Расскажите подробнее",
  reportTellMorePh: "По желанию. Чем конкретнее, тем быстрее исправим.",
  reportSend: "Отправить",
  reportSending: "Отправляем…",
  reportThanks: "Спасибо — получили.",
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
  saveToNotebookHint: "Вернётесь позже — упорядочено и с поиском.",
  generateImage: "Создать картинку",
  generatingImage: "Создаём…",
  generateImageHint: "Живая картинка от ИИ — для этого слова.",
  composeSentence: "Составить предложение",
  composeSentenceHint:
    "Напишите своё — Gadit разберёт тон и уместность.",
  practiceWord: "Тренировать слово",
  practiceWordHint: "Короткий тест под ваш стиль.",
  unlockWithClear: "Открыть в Clear",
  upgradeToClear: "Перейти на Clear",
  softWallAnonTitle: "Вы использовали бесплатные поиски",
  softWallAnonBody:
    "Зарегистрируйтесь бесплатно, чтобы продолжить — 20 слов в день, личная тетрадь между устройствами и весь остальной Gadit открыт.",
  softWallSignupCta: "Бесплатная регистрация",
  softWallBasicTitle: "Дневной лимит достигнут",
  softWallBasicBody:
    "Бесплатный аккаунт даёт 20 поисков в день. Лимит обновится завтра — или перейдите на Clear для безлимитных поисков, картинок, детского режима и разбора предложений.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    const word =
      num === 1 ? "поиск" : num >= 2 && num <= 4 ? "поиска" : "поисков";
    return `Осталось ${num} бесплатных ${word} сегодня — регистрация бесплатна и даёт 20 в день.`;
  },
  clearUnlocksThis: "Доступно в Clear",
  visualizeThisWord: "Увидеть",
  visualBlurb:
    "Одна живая картинка от Gadit — визуальный якорь для этого слова.",
  visualBlurbLocked:
    "Создайте уникальную картинку для этого слова — понимание через образ.",
  reportLabel: "Сообщить",
};

// Spanish — neutral Latin American, "tú" register.
const es: Partial<V2Strings> = {
  homeHeadlineLine1: "Entiende",
  homeHeadlineLine2: "hasta el final.",
  homeSubline:
    "Un diccionario que entiende el contexto — significados, origen, expresiones e imagen viva, en 7 idiomas.",

  searchPlaceholderHome: "Escribe o dicta una palabra",
  voiceInputTitle: "Dictar una palabra",
  addContext: "Agregar contexto",
  explain: "Explicar",
  contextHint:
    "¿Estás leyendo algo? Pega la oración y elegimos el significado correcto.",
  tryLabel: "Prueba",

  valuePropsEyebrow: "Lo que Gadit hace diferente",
  valuePropsTitle: "Más que una definición — una forma de vivir con la palabra.",
  valueProp1Eyebrow: "Con contexto",
  valueProp1Title: "El significado correcto, siempre",
  valueProp1Body:
    "Pega una oración — Gadit elige el sentido que encaja, no el más común.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "Una imagen viva, solo para esta palabra",
  valueProp2Body:
    "Generada para cada entrada. Un ancla visual — no una foto de stock.",
  valueProp3Eyebrow: "Etimología",
  valueProp3Title: "Una nota de origen, no un volcado de Wikipedia",
  valueProp3Body:
    "De dónde viene la palabra, contado como un párrafo — el que escribiría un amigo curioso.",
  valueProp4Eyebrow: "7 idiomas",
  valueProp4Title: "Hebreo y árabe, totalmente nativos",
  valueProp4Body:
    "RTL real, fuentes reales, modismos reales — no una interfaz traducida a la fuerza.",

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
  footerContact: "Contacto",
  footerTagline: "Un diccionario inteligente para 7 idiomas. Hecho para lectura real.",
  footerLanguagesNote: "7 idiomas",

  signIn: "Iniciar sesión",
  navSearch: "Buscar",
  navCompare: "Comparar",
  navNotebook: "Cuaderno",
  navPricing: "Precios",

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
    "Dale vida a las palabras — imágenes, modo niños y feedback.",
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
  trustStripDataYours: "Tus datos son tuyos — exporta cuando quieras",
  trustStripNoAds: "Sin publicidad ni rastreo de terceros",

  faqEyebrow: "Preguntas frecuentes",
  faqHeadline: "Preguntas, respondidas",
  faqQ1: "¿Puedo cambiar de plan?",
  faqA1:
    "Sí, puedes subir o bajar de plan en cualquier momento. El prorrateo es automático — solo pagas la diferencia.",
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
  loginOrSeparator: "o",
  loginEmailLabel: "Correo electrónico",
  loginPasswordLabel: "Contraseña",
  loginEmailPlaceholder: "tu@ejemplo.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Iniciar sesión",
  loginSubmitSignUp: "Crear cuenta",
  loginSwitchToSignUp: "¿No tienes cuenta? Regístrate",
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
  quizTitleTemplate: (w) => `${w} — examen`,
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
    "haber vs a ver, affect vs effect — palabras que confunden incluso a hablantes nativos.",
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
    "Estas palabras parecen estar en idiomas distintos — prueba con un par del mismo idioma.",
  compareErrSameWord: "Parecen ser la misma palabra — prueba con dos distintas.",
  compareErrGeneric: "Comparación no disponible ahora.",

  notebookEyebrow: "Cuaderno",
  notebookTitle: "Tu universo de palabras",
  notebookSubtitle:
    "Cada palabra que has explorado — guardada, organizada, creciendo.",
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

  reportEyebrow: "Reportar un problema",
  reportTitle: "¿Qué está mal?",
  reportTellMore: "Cuéntanos más",
  reportTellMorePh: "Opcional. Cuanto más específico, más rápido lo arreglamos.",
  reportSend: "Enviar reporte",
  reportSending: "Enviando…",
  reportThanks: "Gracias — lo recibimos.",
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
  saveToNotebookHint: "Vuelve después — organizado y con búsqueda.",
  generateImage: "Generar imagen",
  generatingImage: "Generando…",
  generateImageHint: "Una imagen viva hecha con IA, para esta palabra.",
  composeSentence: "Componer una oración",
  composeSentenceHint:
    "Escribe la tuya — Gadit revisa el tono y el encaje.",
  practiceWord: "Practicar esta palabra",
  practiceWordHint: "Una prueba corta a tu medida.",
  unlockWithClear: "Desbloquea con Clear",
  upgradeToClear: "Pasa a Clear",
  softWallAnonTitle: "Usaste tus búsquedas gratis",
  softWallAnonBody:
    "Regístrate gratis para seguir — 20 palabras por día, tu cuaderno guardado entre dispositivos y el resto de Gadit desbloqueado.",
  softWallSignupCta: "Regístrate gratis",
  softWallBasicTitle: "Alcanzaste el límite del día",
  softWallBasicBody:
    "Las cuentas gratis tienen 20 búsquedas por día. El límite se reinicia mañana — o pasa a Clear para búsquedas ilimitadas, imágenes, modo niños y feedback en oraciones.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Te queda 1 búsqueda gratis hoy — regístrate gratis para tener 20 al día."
      : `Te quedan ${num} búsquedas gratis hoy — regístrate gratis para tener 20 al día.`;
  },
  clearUnlocksThis: "Disponible en Clear",
  visualizeThisWord: "Visualiza",
  visualBlurb:
    "Una imagen viva, generada por Gadit — un ancla visual para esta palabra.",
  visualBlurbLocked:
    "Crea una imagen única para esta palabra — entender por la vista.",
  reportLabel: "Reportar",
};

// Portuguese — Brazilian, "você" register.
const pt: Partial<V2Strings> = {
  homeHeadlineLine1: "Entenda",
  homeHeadlineLine2: "até o fim.",
  homeSubline:
    "Um dicionário que entende o contexto — significados, origem, expressões e imagem viva, em 7 idiomas.",

  searchPlaceholderHome: "Digite ou dite uma palavra",
  voiceInputTitle: "Ditar uma palavra",
  addContext: "Adicionar contexto",
  explain: "Explicar",
  contextHint:
    "Lendo algo? Cole a frase e a gente escolhe o significado certo.",
  tryLabel: "Experimente",

  valuePropsEyebrow: "O que o Gadit faz diferente",
  valuePropsTitle: "Mais que uma definição — um jeito de viver com a palavra.",
  valueProp1Eyebrow: "Com contexto",
  valueProp1Title: "O significado certo, sempre",
  valueProp1Body:
    "Cole uma frase — o Gadit escolhe o sentido que se encaixa, não só o mais comum.",
  valueProp2Eyebrow: "Visual",
  valueProp2Title: "Uma imagem viva, só pra esta palavra",
  valueProp2Body:
    "Gerada pra cada entrada. Uma âncora visual — não foto de banco.",
  valueProp3Eyebrow: "Etimologia",
  valueProp3Title: "Uma nota histórica, não despejo de Wikipédia",
  valueProp3Body:
    "De onde a palavra veio, contado em parágrafo — do jeito que um amigo curioso escreveria.",
  valueProp4Eyebrow: "7 idiomas",
  valueProp4Title: "Hebraico e árabe, totalmente nativos",
  valueProp4Body:
    "RTL real, fontes reais, expressões reais — não interface traduzida na pressa.",

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
  footerContact: "Contato",
  footerTagline: "Um dicionário inteligente em 7 idiomas. Feito pra leitura de verdade.",
  footerLanguagesNote: "7 idiomas",

  signIn: "Entrar",
  navSearch: "Pesquisar",
  navCompare: "Comparar",
  navNotebook: "Caderno",
  navPricing: "Preços",

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
    "Dê vida às palavras — imagens, modo crianças e feedback.",
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
  trustStripDataYours: "Seus dados são seus — exporte quando quiser",
  trustStripNoAds: "Sem anúncios, sem rastreamento de terceiros",

  faqEyebrow: "Perguntas frequentes",
  faqHeadline: "Perguntas, respondidas",
  faqQ1: "Posso trocar de plano?",
  faqA1:
    "Sim, faça upgrade ou downgrade quando quiser. O ajuste proporcional é automático — você só paga a diferença.",
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
  loginOrSeparator: "ou",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Senha",
  loginEmailPlaceholder: "voce@exemplo.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Entrar",
  loginSubmitSignUp: "Criar conta",
  loginSwitchToSignUp: "Não tem conta? Cadastre-se",
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
  quizTitleTemplate: (w) => `${w} — quiz`,
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
    "mau vs mal, affect vs effect — palavras que confundem até nativos.",
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
    "Estas palavras parecem estar em idiomas diferentes — tente um par no mesmo idioma.",
  compareErrSameWord: "Parecem ser a mesma palavra — tente duas diferentes.",
  compareErrGeneric: "Comparação indisponível agora.",

  notebookEyebrow: "Caderno",
  notebookTitle: "Seu universo de palavras",
  notebookSubtitle:
    "Cada palavra que você explorou — guardada, organizada, crescendo.",
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

  reportEyebrow: "Reportar problema",
  reportTitle: "O que está errado?",
  reportTellMore: "Conte mais",
  reportTellMorePh: "Opcional. Quanto mais específico, mais rápido a gente conserta.",
  reportSend: "Enviar",
  reportSending: "Enviando…",
  reportThanks: "Valeu — recebemos.",
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
  saveToNotebookHint: "Volte depois — organizado e com busca.",
  generateImage: "Gerar imagem",
  generatingImage: "Gerando…",
  generateImageHint: "Uma imagem viva feita por IA, pra esta palavra.",
  composeSentence: "Compor uma frase",
  composeSentenceHint:
    "Escreva a sua — o Gadit revisa o tom e o encaixe.",
  practiceWord: "Praticar esta palavra",
  practiceWordHint: "Um quiz curto adaptado a você.",
  unlockWithClear: "Desbloqueie com Clear",
  upgradeToClear: "Passe pro Clear",
  softWallAnonTitle: "Você usou suas buscas grátis",
  softWallAnonBody:
    "Cadastre-se grátis pra continuar — 20 palavras por dia, seu caderno salvo entre dispositivos e o resto do Gadit liberado.",
  softWallSignupCta: "Cadastrar grátis",
  softWallBasicTitle: "Você atingiu o limite de hoje",
  softWallBasicBody:
    "Contas grátis têm 20 buscas por dia. O limite reinicia amanhã — ou passe pro Clear pra ter buscas ilimitadas, imagens, modo crianças e feedback de frases.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Sobra 1 busca grátis hoje — cadastre-se grátis pra ter 20 por dia."
      : `Sobram ${num} buscas grátis hoje — cadastre-se grátis pra ter 20 por dia.`;
  },
  clearUnlocksThis: "Disponível no Clear",
  visualizeThisWord: "Visualizar",
  visualBlurb:
    "Uma imagem viva, gerada pelo Gadit — uma âncora visual pra esta palavra.",
  visualBlurbLocked:
    "Crie uma imagem única pra esta palavra — entender pelo olhar.",
  reportLabel: "Reportar",
};

// French — formal "vous" register, neutral (FR + QC).
const fr: Partial<V2Strings> = {
  homeHeadlineLine1: "Comprendre",
  homeHeadlineLine2: "jusqu'au bout.",
  homeSubline:
    "Un dictionnaire qui saisit le contexte — sens, origines, expressions et image vivante, en 7 langues.",

  searchPlaceholderHome: "Tapez ou dictez un mot",
  voiceInputTitle: "Dicter un mot",
  addContext: "Ajouter du contexte",
  explain: "Expliquer",
  contextHint:
    "Vous lisez quelque chose ? Collez la phrase et nous choisissons le bon sens.",
  tryLabel: "Essayez",

  valuePropsEyebrow: "Ce que Gadit fait différemment",
  valuePropsTitle: "Plus qu'une définition — une façon de vivre avec le mot.",
  valueProp1Eyebrow: "Contextuel",
  valueProp1Title: "Le bon sens, à chaque fois",
  valueProp1Body:
    "Collez une phrase — Gadit choisit le sens qui convient, pas seulement le plus courant.",
  valueProp2Eyebrow: "Visuel",
  valueProp2Title: "Une image vivante, juste pour ce mot",
  valueProp2Body:
    "Générée pour chaque entrée. Un ancrage visuel — pas une photo de banque d'images.",
  valueProp3Eyebrow: "Étymologie",
  valueProp3Title: "Une note d'origine, pas un copier-coller de Wikipédia",
  valueProp3Body:
    "D'où vient le mot, raconté en un paragraphe — comme un ami curieux l'écrirait.",
  valueProp4Eyebrow: "7 langues",
  valueProp4Title: "Hébreu et arabe, vraiment natifs",
  valueProp4Body:
    "Vrai RTL, vraies polices, vraies expressions — pas une interface traduite à la va-vite.",

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
  footerContact: "Contact",
  footerTagline: "Un dictionnaire intelligent en 7 langues. Conçu pour vraiment lire.",
  footerLanguagesNote: "7 langues",

  signIn: "Se connecter",
  navSearch: "Rechercher",
  navCompare: "Comparer",
  navNotebook: "Carnet",
  navPricing: "Tarifs",

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
    "Donnez vie aux mots — images, mode enfants et retours.",
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
  trustStripDataYours: "Vos données vous appartiennent — exportables à tout moment",
  trustStripNoAds: "Pas de pub, pas de pistage tiers",

  faqEyebrow: "Questions fréquentes",
  faqHeadline: "Questions, réponses",
  faqQ1: "Puis-je changer de plan ?",
  faqA1:
    "Oui, vous pouvez monter ou descendre à tout moment. Le calcul au prorata est automatique — vous ne payez que la différence.",
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
  loginOrSeparator: "ou",
  loginEmailLabel: "E-mail",
  loginPasswordLabel: "Mot de passe",
  loginEmailPlaceholder: "vous@exemple.com",
  loginPasswordPlaceholder: "••••••••",
  loginSubmitSignIn: "Se connecter",
  loginSubmitSignUp: "Créer un compte",
  loginSwitchToSignUp: "Pas de compte ? Inscrivez-vous",
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
  quizTitleTemplate: (w) => `${w} — quiz`,
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
    "a vs à, affect vs effect — les mots qui piègent même les locuteurs natifs.",
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
    "Ces deux mots semblent être dans des langues différentes — essayez une paire dans la même langue.",
  compareErrSameWord: "On dirait le même mot — essayez deux mots différents.",
  compareErrGeneric: "Comparaison indisponible pour le moment.",

  notebookEyebrow: "Carnet",
  notebookTitle: "Votre univers de mots",
  notebookSubtitle:
    "Chaque mot exploré — gardé, organisé, qui s'enrichit.",
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

  reportEyebrow: "Signaler un problème",
  reportTitle: "Qu'est-ce qui ne va pas ?",
  reportTellMore: "Dites-en plus",
  reportTellMorePh: "Facultatif. Plus c'est précis, plus vite on corrige.",
  reportSend: "Envoyer",
  reportSending: "Envoi…",
  reportThanks: "Merci — bien reçu.",
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
  saveToNotebookHint: "Vous y revenez plus tard — organisé et cherchable.",
  generateImage: "Générer une image",
  generatingImage: "Génération…",
  generateImageHint: "Une image vivante par IA, juste pour ce mot.",
  composeSentence: "Composer une phrase",
  composeSentenceHint:
    "Écrivez la vôtre — Gadit relit le ton et l'emploi.",
  practiceWord: "Pratiquer ce mot",
  practiceWordHint: "Un quiz court adapté à vous.",
  unlockWithClear: "Débloquer avec Clear",
  upgradeToClear: "Passer à Clear",
  softWallAnonTitle: "Vous avez utilisé vos recherches gratuites",
  softWallAnonBody:
    "Inscrivez-vous gratuitement pour continuer — 20 mots par jour, votre carnet partagé entre appareils, et le reste de Gadit débloqué.",
  softWallSignupCta: "Inscription gratuite",
  softWallBasicTitle: "Vous avez atteint la limite du jour",
  softWallBasicBody:
    "Les comptes gratuits ont 20 recherches par jour. La limite se réinitialise demain — ou passez à Clear pour des recherches illimitées, des images, le mode enfants et les retours sur phrases.",
  softBannerSearchesLeft: (n) => {
    const num = Number(n);
    return num === 1
      ? "Il vous reste 1 recherche gratuite aujourd'hui — inscription gratuite pour 20 par jour."
      : `Il vous reste ${num} recherches gratuites aujourd'hui — inscription gratuite pour 20 par jour.`;
  },
  clearUnlocksThis: "Disponible dans Clear",
  visualizeThisWord: "Voir",
  visualBlurb:
    "Une image vivante, générée par Gadit — un ancrage visuel pour ce mot.",
  visualBlurbLocked:
    "Créez une image unique pour ce mot — comprendre par l'image.",
  reportLabel: "Signaler",
};

const TABLES: Record<Lang, Partial<V2Strings>> = {
  en,
  he,
  ar,
  ru,
  es,
  pt,
  fr,
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
