import MORE from "./plan-copy-i18n.json";

/**
 * Copy for the new plan structure (Gadi 2026-10-06): Free, Individual,
 * Family. Hebrew and English are written here; the other UI languages come
 * from plan-copy-i18n.json (scripts/plan-copy-i18n.mjs), English fallback.
 * {n} / {max} / {price} are filled by planCopy().
 */
export const PLAN_COPY = {
  en: {
    nbFreeCount: "{n} of {max} words in your free notebook",
    nbFreeFull: "Your free notebook is full ({max} words). With Individual, every word you look up is saved.",
    nbFreeCta: "See Individual",
    prHead: "For you and your family",
    prBasicSub: "For one person",
    prIndSub: "For one person, every tool",
    prFamSub: "Up to 5 children, plus parents",
    prBasicCta: "Start free",
    prTrialCta: "Try 14 days free",
    prFamBadge: "Best for families",
    prYearlyPerMonth: "About {price} a month",
    prRowSearches: "Word lookups",
    prSearchesBasic: "10 a day",
    prUnlimited: "Unlimited",
    prRowCore: "Every meaning, examples, idioms and the word's origin",
    prRowNotebook: "Word notebook",
    prNotebookBasic: "Up to 30 words",
    prRowImages: "A picture for every meaning",
    prRowContext: "The right meaning from a sentence",
    prRowRead: "Every Word: photograph a page, tap any word",
    prRowSay: "Say it: pronunciation practice with a score",
    prRowCompose: "Compose a sentence and get feedback",
    prRowPractice: "Smart practice, games and quizzes",
    prRowCompare: "Compare similar words",
    prRowKids: "Kids Mode: simple explanations for children",
    prRowChildren: "Up to 5 children, each with their own space",
    prRowParent: "Parent board and an alert for every word",
    prRowDictation: "School dictation practice",
    modalIsInd: "Part of the Individual plan",
    modalIsFam: "Part of the Family plan",
    modalPerMonth: "{price} a month",
    wallAnonBody: "A quick free sign-up opens up to 10 lookups a day, with every meaning, examples, idioms and the word's origin.",
    wallBasicBody: "A free account includes 10 lookups a day. The limit resets tomorrow, or try Individual for unlimited lookups, pictures and every learning tool.",
    wallCta: "See Individual",
    sayPaidBody: "Say it is part of the Individual, Family and Schools plans.",
    kidsGate: "Kids Mode is part of the Family plan.",
    audTitle: "Who is Gadit for?",
    audSub: "So we can show you what fits.",
    audMe: "For me",
    audChild: "For my child",
    audClass: "For a class or a school",
    audSkip: "Skip",
    famSingleChild: "Just one learner at home? Individual is {price} a month. For a little more, Family adds up to 5 children.",
  },
  he: {
    nbFreeCount: "{n} מתוך {max} מילים במחברת החינמית",
    nbFreeFull: "המחברת החינמית מלאה ({max} מילים). ב-Individual כל מילה שמחפשים נשמרת.",
    nbFreeCta: "להכיר את Individual",
    prHead: "לך ולמשפחה",
    prBasicSub: "לאדם אחד",
    prIndSub: "לאדם אחד, כל הכלים",
    prFamSub: "עד 5 ילדים, וגם ההורים",
    prBasicCta: "להתחיל בחינם",
    prTrialCta: "14 יום ניסיון חינם",
    prFamBadge: "הכי מתאים למשפחות",
    prYearlyPerMonth: "כ-{price} לחודש",
    prRowSearches: "חיפושי מילים",
    prSearchesBasic: "10 ביום",
    prUnlimited: "ללא הגבלה",
    prRowCore: "כל המשמעויות, דוגמאות, ניבים ומקור המילה",
    prRowNotebook: "מחברת מילים",
    prNotebookBasic: "עד 30 מילים",
    prRowImages: "תמונה לכל משמעות",
    prRowContext: "המשמעות הנכונה לפי המשפט",
    prRowRead: "כל מילה: מצלמים דף ולוחצים על כל מילה",
    prRowSay: "תגיד את זה: תרגול הגייה עם ציון",
    prRowCompose: "חברו משפט וקבלו משוב",
    prRowPractice: "תרגול חכם, משחקים וחידונים",
    prRowCompare: "השוואת מילים דומות",
    prRowKids: "מצב ילדים: הסבר פשוט לילדים",
    prRowChildren: "עד 5 ילדים, לכל אחד אזור משלו",
    prRowParent: "לוח הורה והתראה על כל מילה",
    prRowDictation: "תרגול הכתבה של בית הספר",
    modalIsInd: "חלק מ-Individual",
    modalIsFam: "חלק מ-Family",
    modalPerMonth: "{price} לחודש",
    wallAnonBody: "הרשמה מהירה בחינם פותחת עד 10 חיפושים ביום, עם כל המשמעויות, דוגמאות, ניבים ומקור המילה.",
    wallBasicBody: "חשבון חינמי כולל 10 חיפושים ביום. המכסה מתאפסת מחר, או שאפשר לנסות את Individual: חיפושים ללא הגבלה, תמונות וכל כלי הלימוד.",
    wallCta: "להכיר את Individual",
    sayPaidBody: "תגיד את זה כלול ב-Individual, ב-Family ובמנוי לבתי ספר.",
    kidsGate: "מצב ילדים כלול במנוי Family.",
    audTitle: "בשביל מי Gadit?",
    audSub: "כדי שנוכל להראות לך את מה שמתאים.",
    audMe: "בשבילי",
    audChild: "בשביל הילד שלי",
    audClass: "לכיתה או לבית ספר",
    audSkip: "דילוג",
    famSingleChild: "יש בבית לומד אחד? Individual עולה {price} לחודש. בעוד קצת, Family מצרף עד 5 ילדים.",
  },
};

export type PlanCopyKey = keyof typeof PLAN_COPY.en;
const OTHER = MORE as Record<string, Partial<Record<PlanCopyKey, string>>>;

export function planCopy(lang: string, key: PlanCopyKey, vars: Record<string, string | number> = {}): string {
  const base =
    (lang === "he" ? PLAN_COPY.he[key] : lang === "en" ? PLAN_COPY.en[key] : OTHER[lang]?.[key]) ?? PLAN_COPY.en[key];
  return base.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Free accounts keep up to this many words in the notebook. */
export const FREE_NOTEBOOK_MAX = 30;
