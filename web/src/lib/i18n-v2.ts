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
  homeBadgeLaunching: string;
  homeHeadlineLine1: string;
  homeHeadlineLine2: string;
  homeSubline: string;

  // ── Home: search ────────────────────────────────────────────
  searchPlaceholderHome: string;
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
  /** template: "127 words explored" — number is the only arg */
  notebookCounterTemplate: Template1;
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
  generateImageHint: string;
  composeSentence: string;
  composeSentenceHint: string;
  practiceWord: string;
  practiceWordHint: string;
  unlockWithClear: string;
  upgradeToClear: string;
  clearUnlocksThis: string;
  visualizeThisWord: string;
  visualBlurb: string;
  visualBlurbLocked: string;
  reportLabel: string;
}

const en: V2Strings = {
  homeBadgeLaunching: "Launching May 1",
  homeHeadlineLine1: "Understand",
  homeHeadlineLine2: "more.",
  homeSubline:
    "A dictionary that meets you in context — meanings, origins, idioms, and a vivid image, in 7 languages.",

  searchPlaceholderHome: "Search any word — in any of 7 languages",
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
    "20 word searches per day¶All meanings (not just primary)¶3 examples per meaning¶Basic etymology — origin + history note¶Sign-in required",

  tierClearTagline: "Visualize",
  tierClearPitch:
    "Bring words to life with images, kids mode, and feedback.",
  tierClearBadge: "Most popular",
  tierClearCta: "Start 14-day free trial",
  tierClearCtaYearly: "Subscribe yearly",
  tierClearTrust: "Cancel anytime · No charge during trial",
  tierClearFeatures:
    "Everything in Basic¶Unlimited searches¶Kids explanations (child-friendly mode)¶AI-generated images (30/month)¶Compose your own sentence + grammar feedback¶Common idioms across all meanings¶Search history (last 30 days)",

  tierDeepTagline: "Practice",
  tierDeepPitch:
    "Build a personal vocabulary library that gets stronger over time.",
  tierDeepCta: "Subscribe to Deep",
  tierDeepFeatures:
    "Everything in Clear¶Practice quizzes (mixed-type, AI-generated)¶Personal notebook (Galaxy view)¶Spaced repetition (smart practice algorithm)¶Compare confusable words (affect/effect)¶AI-generated images (100/month, vs 30 in Clear)",

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
  loginWelcomeBack: "Welcome back",
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
  loginErrorWeakPassword: "Password must be at least 6 characters.",
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
  generateImageHint: "A vivid AI-made visual, just for this word.",
  composeSentence: "Compose a sentence",
  composeSentenceHint: "Write your own — Gadit reviews for tone and fit.",
  practiceWord: "Practice this word",
  practiceWordHint: "A short quiz tuned to how you learn.",
  unlockWithClear: "Unlock with Clear",
  upgradeToClear: "Upgrade to Clear",
  clearUnlocksThis: "Clear unlocks this",
  visualizeThisWord: "Visualize",
  visualBlurb:
    "One vivid image, generated by Gadit — a visual anchor for how this word feels.",
  visualBlurbLocked:
    "Generate a vivid, one-of-a-kind image for this word — understanding through sight.",
  reportLabel: "Report",
};

const he: V2Strings = {
  homeBadgeLaunching: "משיקים 1 במאי",
  homeHeadlineLine1: "להבין",
  homeHeadlineLine2: "יותר.",
  homeSubline:
    "מילון שמבין הקשר — משמעויות, מקור, ביטויים ותמונה חיה, ב־7 שפות.",

  searchPlaceholderHome: "חפשו כל מילה — באחת מ־7 שפות",
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
  valueProp4Title: "עברית וערבית, ילידיות",
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

  // Pricing page (Screen 3)
  pricingPageHeadline: "שלוש רמות. כולן עם תוכן אמיתי.",
  pricingPageSubline: "התחילו חינם. שדרגו כשהעומק מועיל לכם.",
  billingMonthly: "חודשי",
  billingYearly: "שנתי",
  billingSave17: "חסכון 17%",

  tierBasicTagline: "להבין",
  tierBasicPitch: "התחילו עם היסודות.",
  tierBasicCta: "יאללה נתחיל",
  tierBasicFeatures:
    "20 חיפושי מילים ביום¶כל המשמעויות (לא רק העיקרית)¶3 דוגמאות לכל משמעות¶אטימולוגיה בסיסית — מקור והערה היסטורית¶נדרשת התחברות",

  tierClearTagline: "לראות",
  tierClearPitch: "הביאו מילים לחיים — תמונות, הסבר לילדים ומשוב.",
  tierClearBadge: "הכי פופולרי",
  tierClearCta: "נסיון חינם ל־14 ימים",
  tierClearCtaYearly: "הרשמה שנתית",
  tierClearTrust: "ביטול בכל עת · ללא חיוב בתקופת הניסיון",
  tierClearFeatures:
    "כל מה שיש ב־Basic¶חיפושים ללא הגבלה¶הסבר לילדים (מצב ידידותי)¶יצירת תמונות AI (30 בחודש)¶חיבור משפטים עם משוב דקדוקי¶ביטויים נפוצים על פני כל המשמעויות¶היסטוריית חיפוש (30 ימים אחרונים)",

  tierDeepTagline: "לתרגל",
  tierDeepPitch: "בנו אוצר מילים אישי שמתחזק עם הזמן.",
  tierDeepCta: "הרשמה ל־Deep",
  tierDeepFeatures:
    "כל מה שיש ב־Clear¶תרגולים ומבחנים (סוגים שונים, נוצרים ב־AI)¶מחברת אישית (תצוגת גלקסיה)¶חזרה מרווחת (אלגוריתם תרגול חכם)¶השוואת מילים מתבלבלות (אומנות/אמנות)¶יצירת תמונות AI (100 בחודש, לעומת 30 ב־Clear)",

  basicEquivalent: "",
  clearEquivalent: "שווה ל־$2.50 לחודש",
  deepEquivalent: "שווה ל־$4.17 לחודש",

  trustStripCancel: "ביטול בכל עת דרך פורטל Stripe",
  trustStripMoneyBack: "החזר כספי תוך 14 ימים ברכישה ראשונה",
  trustStripDataYours: "הנתונים שלכם — ייצוא מתי שתרצו",
  trustStripNoAds: "ללא פרסומות וללא מעקב צד ג׳",

  faqEyebrow: "שאלות שכיחות",
  faqHeadline: "תשובות לשאלות נפוצות",
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
  loginWelcomeBack: "ברוכים השבים",
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
  loginErrorWeakPassword: "הסיסמה חייבת להכיל לפחות 6 תווים.",
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
  notebookTitle: "היקום שלכם של מילים",
  notebookSubtitle:
    "כל מילה שלמדתם — נשמרת, מאורגנת, גדלה.",
  notebookCounterTemplate: (n) => `${n} מילים שנלמדו`,
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
  srWordsPracticed: "מילים תרגלתם",
  srSummaryStatTemplate: (k, f) => `${k} ידעתם · ${f} לתרגול נוסף`,
  srTomorrow: "מחר",
  srNextReviewTemplate: (when, count) =>
    `התרגול הבא: ${when} (${count} מילים)`,
  srDoneForToday: "סיימתי להיום",
  srPracticeMore: "תרגול נוסף",
  srEmptyTitle: "אין מה לתרגל היום",
  srEmptyBody: "כל הכבוד. חזרו מחר.",
  srBackToNotebook: "חזרה למחברת",
  srLoading: "טוענים את התרגול…",

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
  generateImageHint: "תמונה חיה שנוצרת ב־AI, במיוחד למילה הזו.",
  composeSentence: "חברו משפט",
  composeSentenceHint: "כתבו משלכם — Gadit ייתן משוב על טון והקשר.",
  practiceWord: "תרגלו את המילה",
  practiceWordHint: "שאלון קצר שמותאם לאופן הלמידה שלכם.",
  unlockWithClear: "פתחו עם Clear",
  upgradeToClear: "שדרגו ל־Clear",
  clearUnlocksThis: "נפתח עם Clear",
  visualizeThisWord: "דמיינו",
  visualBlurb:
    "תמונה אחת חיה, שנוצרה על־ידי Gadit — עוגן ויזואלי לתחושת המילה.",
  visualBlurbLocked:
    "צרו תמונה ייחודית למילה — הבנה דרך הראייה.",
  reportLabel: "דיווח",
};

const ar: V2Strings = {
  homeBadgeLaunching: "الإطلاق في 1 مايو",
  homeHeadlineLine1: "افهم",
  homeHeadlineLine2: "أكثر.",
  homeSubline:
    "قاموس يفهم السياق — معانٍ وأصول وتعابير وصورة حيّة، بسبع لغات.",

  searchPlaceholderHome: "ابحث عن أي كلمة — بإحدى 7 لغات",
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
    "20 بحثًا في اليوم¶جميع المعاني (لا الأول وحده)¶3 أمثلة لكل معنى¶أصل أساسي — المصدر وملاحظة تاريخية¶يلزم تسجيل الدخول",

  tierClearTagline: "تخيّل",
  tierClearPitch: "أحيِ الكلمات بالصور وشرح الأطفال والمراجعة.",
  tierClearBadge: "الأكثر شيوعًا",
  tierClearCta: "تجربة 14 يومًا مجانًا",
  tierClearCtaYearly: "اشتراك سنوي",
  tierClearTrust: "ألغِ في أي وقت · بلا رسوم في فترة التجربة",
  tierClearFeatures:
    "كل ما في Basic¶بحث بلا حدود¶شرح الأطفال (وضع ملائم للصغار)¶توليد صور بالذكاء الاصطناعي (30 شهريًا)¶تأليف جملك الخاصة مع مراجعة نحوية¶تعابير شائعة عبر جميع المعاني¶سجلّ البحث (آخر 30 يومًا)",

  tierDeepTagline: "تدرَّب",
  tierDeepPitch: "ابنِ مكتبة مفردات شخصية تزداد قوّة مع الزمن.",
  tierDeepCta: "اشترك في Deep",
  tierDeepFeatures:
    "كل ما في Clear¶اختبارات تدريب (متنوعة، بالذكاء الاصطناعي)¶دفتر شخصي (تصوير المجرّة)¶مراجعة موزَّعة (خوارزمية تدريب ذكية)¶مقارنة الكلمات المتشابهة (affect/effect)¶توليد صور بالذكاء الاصطناعي (100 شهريًا، مقابل 30 في Clear)",

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
  loginWelcomeBack: "أهلًا بعودتك",
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
  loginErrorWeakPassword: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
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
    "ضادّ مقابل ظاء، affect مقابل effect — الكلمات التي تخدع حتى الناطقين الأصليين.",
  compareWord1Label: "الكلمة 1",
  compareWord2Label: "الكلمة 2",
  compareWord1Placeholder: "ضادّ",
  compareWord2Placeholder: "ظاءّ",
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
  notebookTitle: "كونك من الكلمات",
  notebookSubtitle:
    "كل كلمة استكشفتها — محفوظة، منظَّمة، تنمو.",
  notebookCounterTemplate: (n) => `${n} كلمة مستكشَفة`,
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
  srNextReviewTemplate: (when, count) =>
    `المراجعة التالية: ${when} (${count} كلمات)`,
  srDoneForToday: "اكتفيت اليوم",
  srPracticeMore: "تدريب إضافي",
  srEmptyTitle: "لا شيء للمراجعة اليوم",
  srEmptyBody: "أحسنت. عُد غدًا.",
  srBackToNotebook: "العودة إلى الدفتر",
  srLoading: "جاري تحميل التدريب…",

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
  generateImageHint:
    "صورة بصرية حيّة من الذكاء الاصطناعي، لهذه الكلمة فقط.",
  composeSentence: "اكتب جملة",
  composeSentenceHint: "اكتب جملتك — يراجعها Gadit للنبرة والملاءمة.",
  practiceWord: "تدرَّب على هذه الكلمة",
  practiceWordHint: "اختبار قصير على مقاس تعلُّمك.",
  unlockWithClear: "افتح بـ Clear",
  upgradeToClear: "ارتقِ إلى Clear",
  clearUnlocksThis: "تفتحها Clear",
  visualizeThisWord: "تخيّل",
  visualBlurb: "صورة واحدة حيّة من Gadit — مرساة بصرية لشعور الكلمة.",
  visualBlurbLocked: "أنشئ صورة فريدة لهذه الكلمة — الفهم عبر النظر.",
  reportLabel: "إبلاغ",
};

// Latin RTL-free locales — full translations come post-launch.
// For now they fall back to English via the v2() helper below, so the
// site renders in those languages without missing keys; the few labels
// that DO have native words (signIn, etc.) are translated already.
const ru: Partial<V2Strings> = {
  homeHeadlineLine1: "Понимать",
  homeHeadlineLine2: "больше.",
  signIn: "Войти",
  tryLabel: "Попробуйте",
  origin: "Происхождение",
  forKids: "Для детей",
  commonExpressions: "Распространённые выражения",
  meaningN: (n) => `Значение ${n}`,
  reportLabel: "Сообщить",
};

const es: Partial<V2Strings> = {
  homeHeadlineLine1: "Entiende",
  homeHeadlineLine2: "más.",
  signIn: "Iniciar sesión",
  tryLabel: "Prueba",
  origin: "Origen",
  forKids: "Para niños",
  commonExpressions: "Expresiones comunes",
  meaningN: (n) => `Significado ${n}`,
  reportLabel: "Reportar",
};

const pt: Partial<V2Strings> = {
  homeHeadlineLine1: "Entenda",
  homeHeadlineLine2: "mais.",
  signIn: "Entrar",
  tryLabel: "Experimente",
  origin: "Origem",
  forKids: "Para crianças",
  commonExpressions: "Expressões comuns",
  meaningN: (n) => `Significado ${n}`,
  reportLabel: "Reportar",
};

const fr: Partial<V2Strings> = {
  homeHeadlineLine1: "Comprendre",
  homeHeadlineLine2: "plus.",
  signIn: "Se connecter",
  tryLabel: "Essayez",
  origin: "Origine",
  forKids: "Pour enfants",
  commonExpressions: "Expressions courantes",
  meaningN: (n) => `Sens ${n}`,
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
