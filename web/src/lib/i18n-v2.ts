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
  arg?: string | number
): string {
  const locale = TABLES[lang] ?? {};
  const val = locale[key] ?? en[key];
  if (typeof val === "function") {
    return (val as Template1)(arg ?? "");
  }
  return val as string;
}
