"use client";

import { usePricing } from "@/lib/use-pricing";
import { Testimonials, InlineTestimonial, FAMILY_TESTIMONIALS_HE, KIDS_TESTIMONIALS_HE, PARENTS_TESTIMONIALS_HE } from "@/components/design/Testimonials";
import type { FamI18n } from "./i18n/types";
import { fillDeep, landingPrices, screensLang } from "@/lib/landing-i18n";
import { INDIVIDUAL_DISPLAY, INDIVIDUAL_MONTHLY } from "@/lib/individual-prices";
import { planCopy } from "@/lib/plan-copy";
import { REAL_COPY, REAL_CSS, PhoneShot, DeviceShot, LaptopShot, LaptopVideo, TabletShot, DESK_SHOT_LANGS, Lines, type RealTool } from "./RealScreens";
import { SubjectsScreenMock, SubjectsLines, subjectsBandCopy } from "./SubjectsShowcase";
import { subjectsBandLangFor } from "@/lib/subjects-langs";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TokushohoLink } from "@/components/legal/TokushohoLink";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import CheckoutResumeBanner from "@/components/CheckoutResumeBanner";
import { v2 } from "@/lib/i18n-v2";
import { makePack, useLangPacks, type Pack } from "@/lib/lang-pack";

/**
 * Family-plan campaign landing page, v2 (2026-07-16).
 *
 * v1 was a lean single-column pitch; Gadi reviewed it against his
 * academy sales page and asked for a full direct-response build:
 * promise hero, live demo, ONE SECTION PER FEATURE each with its own
 * product visual, alternating color blocks, comparison table, value
 * stack, guarantee, shekel pricing for Hebrew visitors (real ILS
 * billing via Stripe currency_options), repeated CTAs.
 *
 * ?v=relief|anxiety|safe still swaps the hero angle so email/ad
 * variants share one page; the angle rides on every analytics event.
 *
 * Product visuals are CSS/JSX mockups of real product surfaces (no
 * fabricated screenshots, no fake testimonials): meanings card, kids
 * mode, context picker, notebook + quiz, profiles, games, English
 * helper. The hero embeds the real GaditDemoAnimation.
 */

const PRICE_FAMILY_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY ?? "";
const PRICE_FAMILY_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ?? "";

type Angle = "vocab" | "relief" | "anxiety" | "safe";
const ANGLES: Angle[] = ["vocab", "relief", "anxiety", "safe"];

/* ────────────────────────── copy ────────────────────────── */

type FeatureCopy = { kicker: string; title: string; body: string };

export type Copy = {
  heroBadge: string;
  whatIs: string;
  ctaMicro: string;
  trustLine: string;
  credLine: string;
  credKicker: string;
  credTitle: string;
  credBody: string;
  proofTitle: string;
  proofBig: string;
  proofWords: string[];
  angles: Record<Angle, { h1: string; sub: string }>;
  heroCta: string;
  heroTrust: string;
  ownerCta: string;
  stats: string[];
  demoKicker: string;
  demoTitle: string;
  painKicker: string;
  painTitle: string;
  painBody1: string;
  painBody2: string;
  reframe: string;
  puzzleKicker: string;
  puzzleTitle: string;
  puzzleBody: string;
  puzzleBefore: string;
  puzzleAfter: string;
  puzzleLine: string;
  chainKicker: string;
  chainTitle: string;
  chainSteps: string[];
  howBlocks: Array<{ t: string; b: string }>;
  chainCost: string;
  chainTurnTitle: string;
  chainTurnBody: string;
  dashKicker: string;
  dashTitle: string;
  dashBody: string;
  dashKids: Array<{ name: string; total: number; week: number }>;
  dashWordsLabel: string;
  dashWeekLabel: string;
  featuresKicker: string;
  features: FeatureCopy[];
  midCtaTitle: string;
  midCta: string;
  compareKicker: string;
  compareTitle: string;
  compareGadit: string;
  compareOther: string;
  compareRows: Array<{ label: string; gadit: boolean; other: boolean }>;
  safeTitle: string;
  safeBody: string;
  safeLine: string;
  stackTitle: string;
  stackItems: string[];
  priceKicker: string;
  priceTitle: string;
  trialBadge: string;
  yearly: string;
  yearlyNote: string;
  priceAnchor: string;
  monthly: string;
  billedYearly: string;
  billedMonthly: string;
  yearlySave: string;
  priceCta: string;
  cancelNote: string;
  singleChild: string;
  guaranteeTitle: string;
  guaranteeBody: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  footerTerms: string;
  footerPrivacy: string;
};

const COPY: Record<string, Copy> = {
  he: {
    heroBadge: "מילון חכם שבונה את אוצר המילים של המשפחה",
    whatIs: "Gadit בונה את אוצר המילים של התלמיד, מילה אחרי מילה, עם מילון חכם וחזותי ותרגולים ייחודיים לילדים. כל מילה מקבלת הסבר בגובה העיניים של הילד, תמונה, דוגמאות, ומשחקים וחידונים שהופכים את הלמידה לחוויה אחרת.",
    ctaMicro: "",
    trustLine: "עד 5 ילדים במשפחה, כל אחד ברמה שלו",
    credLine: "מבוסס על 15 שנות ניסיון עם למעלה מ-15,000 הורים, תלמידים ואנשי חינוך",
    credKicker: "מי אנחנו",
    credTitle: "15 שנה בחינוך בכלי אחד לילד",
    credBody: "Gadit נבנה על ידי צוות עם 15 שנות ניסיון בחינוך,\nשלימד יותר מ-15,000 לומדים. את מה שראינו עובד שוב ושוב בכיתה ובבית,\nהכנסנו לתוך כלי אחד פשוט שהילד יכול להשתמש בו לבד.",
    proofTitle: "מחברת מילים · דוגמה",
    proofBig: "12 מילים חדשות השבוע",
    proofWords: ["חלום", "מרהיב", "נחוש"],
    angles: {
      vocab: {
        h1: "אוצר המילים של הילד שלכם גדל מילה אחרי מילה",
        sub: "כל מילה שהילד שואל עליה נכנסת למחברת המילים האישית שלו ב-Gadit: עם תמונה, הסבר בגובה העיניים של הילד, ותרגול קצר שמחזיר אותה עד שהיא שלו. פותחים את המחברת בסוף החודש ורואים את אוצר המילים גדל, מילה אחרי מילה.",
      },
      relief: {
        h1: "די להיות המילון הפרטי של הבית",
        sub: "מהיום, כשהילד שואל \"מה זה אומר?\", יש לו מקום אחד שבו הוא מוצא את התשובה לבד: כל המשמעויות, תמונה לכל משמעות, והסבר בגובה העיניים של הילד. בלי צ'אט פתוח ובלי פרסומות.",
      },
      anxiety: {
        h1: "הילד קורא כל מילה נכון, אבל לא באמת מבין",
        sub: "הוא לא תמיד עוצר לשאול. הוא מדלג על מילה שהוא לא מבין, ממשיך הלאה, והחומר לא נכנס. לאט לאט זה הופך לתסכול מהלימודים ולתחושה של \"אני לא מצליח\". Gadit נותן לילד מקום אחד לעצור בו, להבין באמת, ולחזור לשיעור עם המילה שלו.",
      },
      safe: {
        h1: "המסך היחיד שנותנים לילד בלי לפחד",
        sub: "לא צ'אט פתוח. לא פיד אינסופי. לא פרסומות. מקום אחד נקי שבו ילד מקליד מילה, מבין אותה עד הסוף, וחוזר לשיעורים.",
      },
    },
    heroCta: "התחילו 14 ימי ניסיון חינם",
    heroTrust: "בלי צ'אט פתוח · בלי פרסומות · ביטול בלחיצה אחת",
    ownerCta: "לאזור המשפחה שלכם",
    stats: ["יותר מ-40 שפות ממשק", "תמונה לכל משמעות", "עד 5 ילדים", "ביטול בלחיצה אחת"],
    demoKicker: "התוצאה",
    demoTitle: "הילד מבין כל מילה ואוצר המילים שלו גדל כל יום",
    painKicker: "שיעורי הבית",
    painTitle: "הילד קורא אבל לא תמיד באמת מבין",
    painBody1: "אתם דווקא שמחים כשהילד עוצר ושואל מה זה מילה. הבעיה היא כל המילים שהוא לא עוצר לשאול עליהן. הוא מדלג עליהן, ממשיך לקרוא, והחומר לא נכנס. אוצר המילים נשאר דל, וההבנה נשברת מילה אחרי מילה.",
    painBody2: "וזה נוגע בהרבה יותר מציון. ילד שלא מבין מרגיש שהוא לא מספיק טוב, מתוסכל מהלימודים, ומאבד ביטחון. וזה קורה בשקט, בלי שאף אחד יודע להצביע איפה בדיוק נשבר החוט.",
    reframe: "וזה בדיוק המקום שבו Gadit נכנס.",
    puzzleKicker: "מה קורה בראש של הילד",
    puzzleTitle: "טקסט הוא כמו פאזל\nוכל מילה היא חתיכה",
    puzzleBody: "כשילד קורא, המוח שלו מרכיב תמונה שלמה מהמילים. מספיק שלושה או ארבעה חורים, והילד כבר לא רואה את התמונה.",
    puzzleBefore: "פסקה עם מילים חסרות",
    puzzleAfter: "עם Gadit כל חתיכה במקום",
    puzzleLine: "כשכל המילים ברורות הילד רואה את התמונה השלמה",
    chainKicker: "איך זה עובד",
    chainTitle: "על כל מילה הילד מקבל את כל זה",
    chainSteps: [
      "הילד מקליד מילה שהוא לא מבין",
      "מקבל הסבר בגובה העיניים שלו, תמונה ושלוש דוגמאות",
      "המילה נשמרת במחברת האישית שלו",
      "וחוזרת בתרגול קצר, עד שהיא באמת שלו",
    ],
    howBlocks: [
      { t: "הקלדת המילה", b: "הילד מקליד כל מילה שהוא לא מבין, במצב ילדים, במקום נקי ובטוח." },
      { t: "הגדרה ברורה", b: "הסבר בגובה העיניים של הילד, בלי מילים קשות שמסבירות מילים קשות." },
      { t: "שלוש דוגמאות", b: "משפטים אמיתיים שמראים איך המילה חיה בתוך טקסט, לצד תמונה שממחישה אותה." },
      { t: "תמונה לכל משמעות", b: "תמונה עוזרת לילד לחבר בין המילה למשמעות שלה." },
      { t: "הבנת הקשר", b: "מדביקים משפט מהספר, ו-Gadit מסמן בדיוק את המשמעות שמתאימה לו." },
      { t: "מחברת אישית", b: "כל מילה שהילד חיפש נשמרת במחברת האישית שלו." },
      { t: "חידון קצר", b: "שאלה קצרה שמחזירה את המילה בדיוק כשהיא עומדת להישכח." },
      { t: "משחק", b: "לומדים תוך כדי משחק, על המילים שהילד עצמו חיפש." },
      { t: "לשמוע, וגם להגיד", b: "הילד שומע כל מילה ומתאמן להגיד אותה בקול, כך שנוח לו לדבר ולא רק לקרוא." },
    ],
    chainCost: "",
    chainTurnTitle: "וזה מה שאתם מקבלים",
    chainTurnBody: "כל מילה שהילד נתקע בה נכנסת למחברת, וחוזרת בתרגול עד שהוא מבין אותה. ואתם רואים את זה שחור על גבי לבן: כמה מילים חדשות נכנסו למחברת שלו, שבוע אחרי שבוע.",
    dashKicker: "לוח הבקרה להורה",
    dashTitle: "אתם רואים בדיוק כמה כל ילד למד",
    dashBody: "לכל ילד במשפחה יש מחברת מילים אישית שגדלה. בלוח הבקרה שלכם אתם רואים במבט אחד כמה מילים כל ילד למד, כמה נוספו השבוע, ואילו מילים אחרונות. כל כלי אחר עונה לילד ושוכח. Gadit שומר, ואתם רואים את ההתקדמות שבוע אחרי שבוע.",
    dashKids: [
      { name: "נועה", total: 47, week: 12 },
      { name: "עידו", total: 31, week: 8 },
      { name: "מאיה", total: 63, week: 15 },
    ],
    dashWordsLabel: "מילים במחברת",
    dashWeekLabel: "השבוע",
    featuresKicker: "מה יש בפנים",
    features: [
      {
        kicker: "כל המשמעויות",
        title: "מילה אחת. כל הפירושים. תמונה לכל אחד.",
        body: "למילה אחת יש הרבה פעמים כמה משמעויות שונות, ושם ילדים מתבלבלים. Gadit מציג את כולן במקום אחד, כל אחת עם שלוש דוגמאות אמיתיות ותמונה משלה, כי מוח של ילד זוכר תמונות הרבה יותר טוב ממילים.",
      },
      {
        kicker: "מצב ילדים",
        title: "הסבר בגובה העיניים של הילד",
        body: "מתג אחד, וכל ההסברים עוברים לשפה שילד בן 8 באמת מבין. בלי מילים קשות שמסבירות מילים קשות, בלי הגדרות מעגליות. פשוט להבין.",
      },
      {
        kicker: "הבנת הקשר",
        title: "מדביקים משפט ומקבלים את הפירוש הנכון",
        body: "לרוב המילים יש יותר מפירוש אחד, ושם ילדים הולכים לאיבוד. מדביקים את המשפט מהספר או מדף העבודה, ו-Gadit מסמן בדיוק איזו משמעות מתאימה להקשר הזה.",
      },
      {
        kicker: "מחברת אישית",
        title: "המילים לא בורחות",
        body: "כל מילה שהילד חיפש נשמרת במחברת האישית שלו, ותרגול קצר וחכם מחזיר אותה בדיוק כשהיא עומדת להישכח. ככה אוצר מילים באמת נבנה, מילה אחרי מילה.",
      },
      {
        kicker: "פרופיל לכל ילד",
        title: "לכל ילד המרחב שלו",
        body: "לכל ילד במשפחה פרופיל נפרד: המחברת שלו, התרגול שלו וההיסטוריה שלו. מצב ילדים מתאים את ההסבר, פשוט וברור לקטנים ומלא יותר לגדולים, ואף אחד לא דורך לאף אחד על המילים.",
      },
      {
        kicker: "משחקי מילים",
        title: "משחקי למידה על המילים של הילד",
        body: "חידונים ומשחקים קצרים שבנויים על המילים שהילד עצמו חיפש. כמה דקות של משחק, ואוצר המילים גדל בלי מאמץ.",
      },
      {
        kicker: "אנגלית",
        title: "העוזר הכי טוב לשיעורי אנגלית",
        body: "הילד מקליד מילה באנגלית ומקבל הסבר פשוט בעברית, עם תמונה ודוגמאות. בלי לנדוד בין מילון, גוגל טרנסלייט ויוטיוב. שיעורי אנגלית מפסיקים להיות מלחמה.",
      },
    ],
    midCtaTitle: "התחילו וראו איך אוצר המילים של הילד גדל יום אחרי יום",
    midCta: "התחילו 14 ימי ניסיון חינם",
    compareKicker: "ההבדל",
    compareTitle: "למה לא פשוט לחפש בגוגל או לשאול צ'אט?",
    compareGadit: "Gadit",
    compareOther: "האינטרנט הפתוח",
    compareRows: [
      { label: "עמוד אחד נקי לכל מילה", gadit: true, other: false },
      { label: "הסבר בגובה העיניים של הילד", gadit: true, other: false },
      { label: "תמונה לכל משמעות", gadit: true, other: false },
      { label: "מחברת ותרגול שנשארים", gadit: true, other: false },
      { label: "פרסומות וקישורים לכל כיוון", gadit: false, other: true },
      { label: "צ'אט פתוח בלי גבולות", gadit: false, other: true },
    ],
    safeTitle: "אזור נפרד ונקי ולא שער לשום מקום אחר",
    safeBody: "Gadit הוא מקום סגור לגמרי: אין צ'אט פתוח, אין פיד, אין פרסומות ואין קישורים החוצה. יש כאן דבר אחד לעשות: להבין מילה ולחזור ללימודים.",
    safeLine: "מסך אחד שאפשר לתת לילד בראש שקט.",
    stackTitle: "מה מקבלים במסלול המשפחתי",
    stackItems: [
      "חיפושים בלי הגבלה לכל המשפחה",
      "כל המשמעויות עם תמונה לכל משמעות",
      "מצב ילדים לקטנים והסבר מלא לגדולים",
      "מחברת אישית ותרגול חכם לכל ילד",
      "לוח בקרה להורה עם התראות על כל מה שהילד סיים",
      "שיעורי בית: הכתבה בכל שפה, שיעורים והכנה למבחן",
      "צילום דף מהספר ולחיצה על כל מילה",
      "משחקים ודו-קרב מילים בין אחים",
      "עד 5 ילדים בפרופילים נפרדים",
      "הסבר ביותר מ-40 שפות",
    ],
    priceKicker: "התמחור",
    priceTitle: "מסלול המשפחה",
    trialBadge: "14 ימי ניסיון חינם",
    yearly: "₪199 לשנה",
    yearlyNote: "פחות מ-₪17 לחודש לכל המשפחה\n(חיסכון של חודשיים לעומת חודשי)",
    priceAnchor: "פחות משיעור פרטי אחד בחודש לכל הילדים בבית",
    monthly: "₪19.90 לחודש",
    billedYearly: "שנתי",
    billedMonthly: "חודשי",
    yearlySave: "חוסכים ₪39.80",
    priceCta: "התחילו את הניסיון",
    cancelNote: "נדרש כרטיס אשראי. החיוב בשקלים, רק בתום 14 הימים. יומיים לפני כן נשלח אליכם תזכורת במייל. מבטלים בלחיצה מדף החשבון, בלי טלפון.",
    singleChild: "יש בבית תלמיד אחד? מסלול Deep ב-₪16.90 לחודש. בשלושה שקלים נוספים מצרפים עד 5 ילדים.",
    guaranteeTitle: "היעד לשבועיים: 20 מילים חדשות במחברת",
    guaranteeBody: "בלוח ההורה תראו כמה מילים נוספו, ותחליטו לפני החיוב.",
    faqTitle: "שאלות שהורים שואלים",
    faq: [
      {
        q: "מה תקבלו ב-Gadit?",
        a: "כל מילה שהילד מחפש מקבלת עמוד אחד נקי: כל המשמעויות, הסבר בגובה העיניים של הילד, שלוש דוגמאות ותמונה לכל משמעות. ומעבר לזה: מחברת אישית עם תרגול, משחקים, צילום דף, תרגול הכתבה ולוח בקרה להורה. עד 5 ילדים, במרחב סגור ובטוח.",
      },
      {
        q: "למה לא פשוט לשאול צ'אט או גוגל?",
        a: "כי אלה כלים למבוגרים. חיפוש בגוגל מחזיר פרסומות וקישורים לכל כיוון, וצ'אט פתוח הוא שיחה בלי גבולות שאף הורה לא משאיר בה ילד לבד. Gadit בנוי הפוך: עמוד אחד סגור ונקי לכל מילה, בגובה העיניים של הילד, בלי שום דרך ללכת לאיבוד.",
      },
      {
        q: "איך תדעו שהילד באמת מתקדם?",
        a: "יש לכם לוח בקרה להורה. במבט אחד רואים כמה מילים כל ילד למד, כמה נוספו השבוע ואילו מילים אחרונות. כלים אחרים עונים לילד ושוכחים. Gadit שומר כל מילה במחברת האישית של הילד, כך שאתם רואים את אוצר המילים גדל שבוע אחרי שבוע.",
      },
      {
        q: "לאילו גילים זה מתאים?",
        a: "הלב של Gadit הוא ילדים בגיל בית ספר, מכיתה א ועד תיכון. מצב ילדים מסביר בפשטות לקטנים, וההסברים המלאים משרתים גם בני נוער והורים. את החשבון פותח ההורה.",
      },
      {
        q: "איך זה עוזר בשיעורי הבית ולפני מבחן?",
        a: "מצלמים את דף שיעורי הבית, ו-Gadit מזהה אם זו רשימת מילים, טקסט לקריאה או חומר למבחן. הילד מקבל הסבר לכל מילה, מתרגל הכתבה בכל שפה, ומתכונן עד יום המבחן. מילה שטעה בה חוזרת עד שהיא נכונה.",
      },
      {
        q: "הילד עוד לא קורא טוב. זה מתאים?",
        a: "כן. כל מילה, כל הסבר וכל דוגמה אפשר לשמוע בקול, ולכל משמעות יש תמונה. לקטנים יש גם משחק הקשיבו ובחרו: שומעים מילה ובוחרים את התמונה הנכונה.",
      },
      {
        q: "איך שומרים על המוטיבציה של הילד?",
        a: "כל מילה שהילד מבין מקדמת אותו בדרגות, עם רצף ימים ויעד שבועי. יש לוח מובילים משפחתי, משחקים שנבנים מהמילים שלו, ודו-קרב מילים בין אחים.",
      },
      {
        q: "תקבלו עדכון על מה שהילד עושה?",
        a: "כן. בלוח ההורה רואים כל מילה שהילד חיפש וכל מה שסיים, ואפשר לקבל התראה בטלפון או במייל כשהוא לומד מילה חדשה. אתם בוחרים מה מעניין אתכם.",
      },
      {
        q: "זה עוזר גם באנגלית ובשפות נוספות?",
        a: "כן. אפשר לחפש מילה באנגלית ולקבל הסבר בעברית פשוטה, עם תמונה ודוגמאות. וזה עובד ביותר מ-40 שפות, כך שהילד יכול לקבל את ההסבר גם בשפה שמדברים אצלכם בבית. ובכלי תגיד את זה שומעים משפט בשפה חדשה, אומרים אותו בעצמכם ומקבלים כוכבים כשאומרים נכון.",
      },
      {
        q: "המחיר באמת בשקלים?",
        a: "כן. החיוב בשקלים, בכרטיס ישראלי רגיל, בלי עמלות המרה ובלי הפתעות: ₪199 לשנה או ₪19.90 לחודש, אחרי 14 ימי הניסיון.",
      },
      {
        q: "מה ההבדל בין חודשי לשנתי?",
        a: "זה אותו מסלול בדיוק. בשנתי משלמים ₪199 פעם בשנה וחוסכים ₪39.80 לעומת תשלום של ₪19.90 בכל חודש.",
      },
      {
        q: "כמה ילדים אפשר לחבר?",
        a: "עד 5 ילדים במנוי משפחתי אחד, לכל ילד פרופיל, מחברת ותרגול משלו.",
      },
      {
        q: "מה אם לילד אין טלפון משלו?",
        a: "אין בעיה. הילד יכול להיכנס מהטלפון או מהטאבלט שלו עם קוד QR או קוד בן 6 ספרות, בלי סיסמה. ואם יש מכשיר אחד לכל הבית, יש מסך משותף לילדים: כל ילד בוחר את עצמו ונכנס עם קוד אישי משלו.",
      },
      {
        q: "אפשר לנסות בלי להתחייב?",
        a: "כן. מתחילים 14 ימי ניסיון עם כרטיס, והחיוב הראשון יורד רק בתום הניסיון. יומיים לפני כן נשלח אליכם תזכורת במייל. מבטלים בכל רגע קודם, בלחיצה, ולא תחויבו בכלום.",
      },
      {
        q: "על אילו מכשירים זה עובד?",
        a: "בכל דפדפן, בטלפון, בטאבלט ובמחשב, בלי התקנה. באנדרואיד יש גם אפליקציה ב-Google Play.",
      },
      {
        q: "ההסברים באמת מדויקים?",
        a: "הצוות של Gadit בנה את ההסברים לפי כללים חינוכיים ברורים: הסבר בגובה העיניים, כל המשמעויות, דוגמאות ומקור המילה. בכל עמוד יש כפתור דיווח, וכל דיווח נבדק ומתוקן.",
      },
      {
        q: "איזה מידע נשמר על הילד?",
        a: "השם, הגיל והמילים שחיפש, כדי לבנות את המחברת שלו ואת לוח ההורה. לא מוכרים ולא משתפים מידע על ילדים. אפשר למחוק את החשבון ואת כל הנתונים בכל רגע.",
      },
      {
        q: "מה קורה למחברות אם מבטלים?",
        a: "המילים לא נמחקות. אם תחזרו בהמשך, הכול מחכה לכם.",
      },
    ],
    finalTitle: "התחילו היום\nוראו את אוצר המילים של הילד שלכם גדל",
    finalSub: "שבועיים חינם. ביטול בלחיצה. והילד לומד להבין מילים לבד.",
    finalCta: "התחילו 14 ימי ניסיון חינם",
    footerTerms: "תנאים",
    footerPrivacy: "פרטיות",
  },
  en: {
    heroBadge: "A visual, smart dictionary for the whole family",
    whatIs: "Gadit is a smart, visual dictionary for kids: every word gets a kid-level explanation, a picture, examples, and games and quizzes that make learning words fun. Vocabulary grows, reading comprehension improves, and your child does better at school.",
    ctaMicro: "",
    trustLine: "Up to 5 kids, each at their own level",
    credLine: "Built on 15 years of experience with more than 15,000 parents, students and educators",
    credKicker: "Who we are",
    credTitle: "15 years in education. Now in one tool for your child.",
    credBody: "Gadit was built by a team with 15 years of experience in education, that has worked with more than 15,000 parents, students and educators. What we saw work again and again, in the classroom and at home, we put into one simple tool a child can use on their own.",
    proofTitle: "Word notebook · example",
    proofBig: "12 new words this week",
    proofWords: ["dream", "vivid", "reluctant"],
    angles: {
      vocab: {
        h1: "Your child's vocabulary grows. Word by word.",
        sub: "Every word your child asks about lands in their personal word notebook in Gadit: with a picture, a kid-level explanation, and short practice that brings it back until it is theirs. Open the notebook at the end of the month and watch the vocabulary grow, word by word.",
      },
      relief: {
        h1: "Stop being the family dictionary",
        sub: "From today, when your kid asks \"what does this mean?\", they have one place to find the answer alone: every meaning, a picture for each one, and an explanation at kid level. No open chat, no ads.",
      },
      anxiety: {
        h1: "Your child reads every word right, but does not really understand",
        sub: "They do not always stop to ask. They skip a word they do not understand, keep going, and the material does not sink in. Over time it turns into frustration with school and a feeling of \"I can't do this\". Gadit gives your child one place to stop, truly understand, and get back to the lesson with the word in hand.",
      },
      safe: {
        h1: "The one screen you can hand a child without worry",
        sub: "No open chat. No endless feed. No ads. One clean place where a kid types a word, understands it fully, and goes back to homework.",
      },
    },
    heroCta: "Start your 14-day free trial",
    heroTrust: "No open chat · No ads · Cancel in one click",
    ownerCta: "Go to your family space",
    stats: ["30+ languages", "A picture per meaning", "Up to 5 kids", "Cancel in one click"],
    demoKicker: "The result",
    demoTitle: "Your child understands every word, and their vocabulary grows every day",
    painKicker: "The real pain",
    painTitle: "Your child reads, but does not always truly understand",
    painBody1: "You're actually glad when your child stops to ask what a word means. The problem is all the words they don't stop to ask about. They skip them, keep reading, and the material doesn't sink in. Vocabulary stays thin, and comprehension breaks word after word.",
    painBody2: "And it touches far more than a grade. A child who does not understand feels not good enough, gets frustrated with school, and loses confidence. And it happens silently, with nobody able to point to where the thread broke.",
    reframe: "And this is exactly where Gadit comes in.",
    puzzleKicker: "What happens in a child's head",
    puzzleTitle: "Text is a puzzle. Every word is a piece.",
    puzzleBody: "When a child reads, their mind assembles a whole picture from the words. Every word they understand is a piece that clicks into place. Every missing word is a hole in the picture. Just three or four holes, and the child no longer sees the picture, even if they sounded out every letter.",
    puzzleBefore: "A paragraph with missing words",
    puzzleAfter: "With Gadit, every piece in place",
    puzzleLine: "When every word is clear, the child sees the whole picture.",
    chainKicker: "How it works",
    chainTitle: "Everything your child gets, on every word",
    chainSteps: [
      "Your child types a word they do not understand",
      "They get an explanation at their eye level, a picture and three examples",
      "The word is saved in their personal notebook",
      "And comes back in short practice, until it is truly theirs",
    ],
    howBlocks: [
      { t: "Type the word", b: "Your child types any word they don't understand, in Kids Mode, in a clean and safe place." },
      { t: "A clear definition", b: "An explanation at the child's eye level, no hard words explaining hard words." },
      { t: "Three examples", b: "Real sentences that show how the word lives inside a text, with an image, not just a definition." },
      { t: "A picture for every meaning", b: "Because children remember what they see far better than what is written to them." },
      { t: "Context", b: "Paste a sentence from the book and Gadit marks exactly the meaning that fits it." },
      { t: "A personal notebook", b: "Every word your child looked up is saved in their notebook, and doesn't run away." },
      { t: "A short quiz", b: "A quick question that brings the word back right before it slips away." },
      { t: "A game", b: "Learning through play, on the words your child looked up themselves." },
      { t: "Hear it, and say it", b: "Your child hears any word and practices saying it out loud, so it feels natural to speak, not just to read." },
    ],
    chainCost: "",
    chainTurnTitle: "And this is what you get",
    chainTurnBody: "Every word your child got stuck on becomes a word they know, and you see it in black and white: how many words they closed, week after week. Instead of hoping something is improving, you simply watch it happen.",
    dashKicker: "The parent dashboard",
    dashTitle: "You see exactly how much each child has learned",
    dashBody: "Every child has a personal word notebook that grows. In your dashboard you see, at a glance, how many words each child has learned, how many were added this week, and their most recent words. Any other tool answers your child and forgets. Gadit remembers, and you see the progress week after week.",
    dashKids: [
      { name: "Noa", total: 47, week: 12 },
      { name: "Ido", total: 31, week: 8 },
      { name: "Maya", total: 63, week: 15 },
    ],
    dashWordsLabel: "words in notebook",
    dashWeekLabel: "this week",
    featuresKicker: "What's inside",
    features: [
      {
        kicker: "Every meaning",
        title: "One word. Every meaning. A picture for each.",
        body: "One word often has several different meanings, and that is where kids get confused. Gadit shows them all in one place, each with three real examples and its own picture, because a child's brain remembers images far better than words.",
      },
      {
        kicker: "Kids Mode",
        title: "Explanations at your child's eye level",
        body: "One switch, and every explanation turns into language an 8-year-old actually understands. No hard words explaining hard words, no circular definitions. Just understanding.",
      },
      {
        kicker: "Context",
        title: "Paste a sentence, get the right meaning",
        body: "Most words have more than one meaning, and that is where kids get lost. Paste the sentence from the book or worksheet, and Gadit marks exactly which meaning fits.",
      },
      {
        kicker: "Personal notebook",
        title: "The words don't run away",
        body: "Every word your child looks up lands in their personal notebook, and short smart practice brings it back right before it slips away. That is how vocabulary is really built, one word at a time.",
      },
      {
        kicker: "A profile per child",
        title: "Every child gets their own space",
        body: "Each child in the family gets a separate profile: their notebook, their practice, their history. Kids Mode adapts the explanation, simple and clear for the little ones and fuller for the older ones, and nobody steps on anybody's words.",
      },
      {
        kicker: "Word games",
        title: "Learning games on your child's words",
        body: "Short quizzes and games built from the words your child actually looked up. A few minutes of play, and vocabulary grows without effort.",
      },
      {
        kicker: "Second language",
        title: "The best homework helper for a second language",
        body: "Your child types a word in English and gets a simple explanation in their own language, with a picture and examples. No wandering between a dictionary, a translator and YouTube.",
      },
    ],
    midCtaTitle: "Start now, and watch your child's vocabulary grow day by day",
    midCta: "Start your 14-day free trial",
    compareKicker: "The difference",
    compareTitle: "Why not just Google it or ask a chatbot?",
    compareGadit: "Gadit",
    compareOther: "The open internet",
    compareRows: [
      { label: "One clean page per word", gadit: true, other: false },
      { label: "Explanations at kid level", gadit: true, other: false },
      { label: "A picture for every meaning", gadit: true, other: false },
      { label: "A notebook and practice that stick", gadit: true, other: false },
      { label: "Ads and links in every direction", gadit: false, other: true },
      { label: "Open-ended chat with no bounds", gadit: false, other: true },
    ],
    safeTitle: "A separate, clean zone. Not a doorway anywhere else.",
    safeBody: "Gadit is a fully closed space: no open chat, no feed, no ads, no outbound links. A child is not pulled from here into TikTok or any other app. There is one thing to do here: understand a word, and get back to studying.",
    safeLine: "One screen you can hand a child with a clear mind.",
    stackTitle: "What the Family plan includes",
    stackItems: [
      "Unlimited searches for the whole family",
      "Every meaning, with a picture for each",
      "Kids Mode for every age",
      "Sentence checking with instant feedback",
      "A personal notebook and smart practice per child",
      "Word games and quizzes",
      "Up to 5 kids with separate profiles",
      "30+ languages with full support",
    ],
    priceKicker: "Pricing",
    priceTitle: "The Family plan",
    trialBadge: "14-day free trial",
    yearly: "$59 / year",
    yearlyNote: "that is $4.92 a month for the whole family, and saves you close to two months versus paying monthly",
    priceAnchor: "Less than one private tutoring session, for a whole year, for every child at home",
    monthly: "$5.99 / month",
    billedYearly: "Yearly",
    billedMonthly: "Monthly",
    yearlySave: "-18%",
    priceCta: "Start the trial",
    cancelNote: "First charge only after the 14 days. Cancel anytime from your account page, one click.",
    singleChild: "Just one student at home? Deep is $4.99/month. For a little more you can add up to 5 kids.",
    guaranteeTitle: "Your test: two weeks",
    guaranteeBody: "Give it two weeks of real use, free. If by day 14 your child's notebook has not gathered at least 20 new words, cancel in one click and you paid nothing.",
    faqTitle: "Questions parents ask",
    faq: [
      {
        q: "What do I get with Gadit?",
        a: "Every word your child looks up gets one clean page: every meaning, a kid-level explanation (Kids Mode), three real examples, and a picture per meaning. Plus context (paste a sentence and get the right meaning), a personal word notebook with smart practice, word games and quizzes, a parent dashboard showing how much each child has learned, up to 5 kids on separate profiles, all in 30+ languages, in a closed, safe space with no open chat and no ads.",
      },
      {
        q: "Why not just ask a chatbot or Google?",
        a: "Because those are tools for adults. Google returns ads and links in every direction, and an open chatbot is a boundless conversation no parent leaves a child alone in. Gadit is built the other way around: one closed, clean page per word, at kid level, with no way to get lost.",
      },
      {
        q: "How do I know my child is actually progressing?",
        a: "You get a parent dashboard. At a glance you see how many words each child has learned, how many were added this week, and their latest words. Every other tool answers the child and forgets; Gadit saves every word in the child's personal notebook, so you watch the vocabulary grow week after week.",
      },
      {
        q: "What ages is it for?",
        a: "The heart of Gadit is school-age kids, from first grade through high school. Kids Mode explains simply for the young ones, and the full explanations serve teens and parents too. The parent opens the account.",
      },
      {
        q: "Does it help with English and other languages?",
        a: "Very much. A child can look up a word in English and get a simple explanation in their own language, with a picture and examples, exactly the helper missing at home. And it works in 30+ languages, so the child can get the explanation in the language you speak at home too.",
      },
      {
        q: "How much does it cost?",
        a: "$59 a year or $5.99 a month, after the 14-day trial. No hidden fees, and you cancel anytime in one click.",
      },
      {
        q: "How many kids can I add?",
        a: "Up to 5 kids on one Family plan, each with their own profile, notebook and practice.",
      },
      {
        q: "Can we try it without committing?",
        a: "Yes. The trial starts with a card, but the first charge happens only when the 14 days end. Cancel anytime before that, one click, and you pay nothing.",
      },
    ],
    finalTitle: "Start today, and watch the vocabulary grow",
    finalSub: "Two weeks free. One-click cancel. And a child who learns to understand words on their own.",
    finalCta: "Start your 14-day free trial",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
  },
};

/** The other languages of COPY, one file each in classic-copy/ (loaded by the page's gate). */
export const FAM_COPY_PACK = makePack<Copy>({}, {
  "uk": () => import("./classic-copy/uk"),
  "tr": () => import("./classic-copy/tr"),
  "pl": () => import("./classic-copy/pl"),
  "fa": () => import("./classic-copy/fa"),
  "id": () => import("./classic-copy/id"),
  "zu": () => import("./classic-copy/zu"),
  "xh": () => import("./classic-copy/xh"),
  "nso": () => import("./classic-copy/nso"),
  "tn": () => import("./classic-copy/tn"),
  "st": () => import("./classic-copy/st"),
  "ts": () => import("./classic-copy/ts"),
  "ss": () => import("./classic-copy/ss"),
  "ve": () => import("./classic-copy/ve"),
  "nr": () => import("./classic-copy/nr"),
  "el": () => import("./classic-copy/el"),
  "nl": () => import("./classic-copy/nl"),
  "ru": () => import("./classic-copy/ru"),
  "ar": () => import("./classic-copy/ar"),
  "es": () => import("./classic-copy/es"),
  "pt": () => import("./classic-copy/pt"),
  "fr": () => import("./classic-copy/fr"),
  "de": () => import("./classic-copy/de"),
  "cs": () => import("./classic-copy/cs"),
  "sk": () => import("./classic-copy/sk"),
  "it": () => import("./classic-copy/it"),
  "ja": () => import("./classic-copy/ja"),
  "hi": () => import("./classic-copy/hi"),
  "am": () => import("./classic-copy/am"),
  "af": () => import("./classic-copy/af"),
  "bn": () => import("./classic-copy/bn"),
  "da": () => import("./classic-copy/da"),
  "fil": () => import("./classic-copy/fil"),
  "hu": () => import("./classic-copy/hu"),
  "ko": () => import("./classic-copy/ko"),
  "sw": () => import("./classic-copy/sw"),
  "th": () => import("./classic-copy/th"),
  "vi": () => import("./classic-copy/vi"),
  "zh-CN": () => import("./classic-copy/zh-CN"),
  "zh-TW": () => import("./classic-copy/zh-TW"),
});
// (more languages moved to classic-copy/<lang>.ts, 2026-10-31)


/* ─────────────────── product mockups (per feature) ─────────────────── */

// Per-language content for the demo mockups on this page (the little
// phone/notebook/quiz illustrations). Was a pile of ar/ru/he/en inline
// ternaries, so every other language showed English example words and
// sentences. Now one map keyed by UI language; falls back to en.
export type FamMock = Record<string, string>;

const FAM_MOCK: Record<string, FamMock> = {
  en: {
    meaningsWord: "bat",
    meaning1T: "The animal that flies at night",
    meaning1Ex: "\"A bat flew out of the cave.\"",
    meaning2T: "The stick used in baseball",
    meaning2Ex: "\"She swung the bat and hit the ball.\"",
    kidsBubble: "\"Reluctant\" is when you don't really want to do something, and your feet go slow. Like walking to the dentist.",
    contextSentence: "My biggest {dream} is to be a doctor",
    contextMeaning: "The meaning here: a hope or goal you want to reach",
    notebookTitle: "Noa's notebook",
    notebookDue: "practice today",
    profile1Name: "Noa",
    profile1Grade: "2nd grade",
    profile2Name: "Ido",
    profile2Grade: "6th grade",
    profile3Name: "Maya",
    profile3Grade: "9th grade",
    gameTwinTrap: "Twin Trap",
    gameTimeTraveler: "Time Traveler",
    gameStreak: "6-day streak 🔥",
    englishWord: "reluctant",
    englishMeaningT: "Not really wanting to",
    englishMeaningEx: "\"He was reluctant to start his homework.\"",
    puzzleSentence: "The sailor was {determined} to reach the island, despite the {storm} he never {hesitated}",
    dreamWord: "dream",
    dreamPos: "noun",
    dreamMeaningFull: "images and thoughts that pass through the mind during sleep",
    dreamExample: "\"Last night I had a dream about a far journey.\"",
    dreamMeaningShort: "Images and thoughts that pass through the mind during sleep",
    dreamKidDef: "\"Dream\" is the pictures and stories that run through your head while you sleep. Sometimes happy, sometimes strange, and they fade when you wake up.",
    dreamEx1: "\"Last night I had a dream about a long journey.\"",
    dreamEx2: "\"She woke up from a scary dream.\"",
    dreamEx3: "\"His big dream is to fly to space.\"",
    kidsLabel: "Kids Mode",
    searchHint: "Type a word",
    tabMeanings: "Meanings",
    tabPicture: "Picture",
    tabNotebook: "Notebook",
    searchTagline: "The child types a word, and that is it.",
    quizQ: "What does \"dream\" mean?",
    quizRight: "Images and thoughts during sleep",
    quizWrong1: "A kind of cake",
    quizWrong2: "A musical instrument",
  },
  he: {
    meaningsWord: "עין",
    meaning1T: "אֵיבָר הראייה שבגוף",
    meaning1Ex: "\"נכנס לי גרגר חול לעין.\"",
    meaning2T: "מעיין, מקור מים הנובע מהאדמה",
    meaning2Ex: "\"מילאנו בקבוקים ממי העין הקרירים.\"",
    kidsBubble: "\"reluctant\" זה כשלא ממש בא לך לעשות משהו, והרגליים נגררות לאט. כמו ללכת לרופא שיניים.",
    contextSentence: "{החלום} הכי גדול שלי הוא להיות רופא",
    contextMeaning: "המשמעות כאן: תקווה או מטרה שרוצים להגשים",
    notebookTitle: "המחברת של נועה",
    notebookDue: "לתרגל היום",
    profile1Name: "נועה",
    profile1Grade: "כיתה ב׳",
    profile2Name: "עידו",
    profile2Grade: "כיתה ו׳",
    profile3Name: "מאיה",
    profile3Grade: "כיתה ט׳",
    gameTwinTrap: "מלכודת התאומים",
    gameTimeTraveler: "מטייל בזמן",
    gameStreak: "רצף של 6 ימים 🔥",
    englishWord: "reluctant",
    englishMeaningT: "כשלא ממש רוצים משהו",
    englishMeaningEx: "\"הוא לא ממש רצה להתחיל את שיעורי הבית.\"",
    puzzleSentence: "המלח היה {נחוש} להגיע לאי, ולמרות ה{סערה} הוא מעולם לא {היסס}",
    dreamWord: "חלום",
    dreamPos: "שם עצם",
    dreamMeaningFull: "תמונות ומחשבות שעוברות בראש בזמן השינה",
    dreamExample: "\"אתמול בלילה חלמתי חלום על מסע ארוך.\"",
    dreamMeaningShort: "תמונות ומחשבות שעוברות בראש בזמן השינה",
    dreamKidDef: "\"חלום\" הוא התמונות והסיפורים שרצים לך בראש בזמן השינה. לפעמים שמחים, לפעמים מוזרים, והם נמוגים ברגע שמתעוררים.",
    dreamEx1: "\"אתמול בלילה חלמתי חלום על מסע ארוך.\"",
    dreamEx2: "\"היא התעוררה מחלום מפחיד.\"",
    dreamEx3: "\"החלום הגדול שלו הוא לטוס לחלל.\"",
    kidsLabel: "מצב ילדים",
    searchHint: "להקליד מילה",
    tabMeanings: "משמעויות",
    tabPicture: "תמונה",
    tabNotebook: "מחברת",
    searchTagline: "הילד מקליד מילה, וזהו.",
    quizQ: "מה זה \"חלום\"?",
    quizRight: "תמונות ומחשבות בזמן השינה",
    quizWrong1: "סוג של עוגה",
    quizWrong2: "כלי נגינה",
  },
};

/** The other languages of FAM_MOCK, one file each in classic-mock/ (loaded by the page's gate). */
export const FAM_MOCK_PACK = makePack<FamMock>({}, {
  "ar": () => import("./classic-mock/ar"),
  "ru": () => import("./classic-mock/ru"),
  "es": () => import("./classic-mock/es"),
  "pt": () => import("./classic-mock/pt"),
  "fr": () => import("./classic-mock/fr"),
  "de": () => import("./classic-mock/de"),
  "cs": () => import("./classic-mock/cs"),
  "sk": () => import("./classic-mock/sk"),
  "it": () => import("./classic-mock/it"),
  "ja": () => import("./classic-mock/ja"),
  "hi": () => import("./classic-mock/hi"),
  "am": () => import("./classic-mock/am"),
  "uk": () => import("./classic-mock/uk"),
  "tr": () => import("./classic-mock/tr"),
  "pl": () => import("./classic-mock/pl"),
  "fa": () => import("./classic-mock/fa"),
  "id": () => import("./classic-mock/id"),
  "nl": () => import("./classic-mock/nl"),
  "zu": () => import("./classic-mock/zu"),
  "xh": () => import("./classic-mock/xh"),
  "nso": () => import("./classic-mock/nso"),
  "tn": () => import("./classic-mock/tn"),
  "st": () => import("./classic-mock/st"),
  "ts": () => import("./classic-mock/ts"),
  "ss": () => import("./classic-mock/ss"),
  "ve": () => import("./classic-mock/ve"),
  "nr": () => import("./classic-mock/nr"),
  "el": () => import("./classic-mock/el"),
  "vi": () => import("./classic-mock/vi"),
  "fil": () => import("./classic-mock/fil"),
  "af": () => import("./classic-mock/af"),
  "sw": () => import("./classic-mock/sw"),
  "zh-CN": () => import("./classic-mock/zh-CN"),
  "zh-TW": () => import("./classic-mock/zh-TW"),
  "ko": () => import("./classic-mock/ko"),
  "th": () => import("./classic-mock/th"),
  "bn": () => import("./classic-mock/bn"),
  "da": () => import("./classic-mock/da"),
  "hu": () => import("./classic-mock/hu"),
});

// Split a sentence that marks a word with {braces} into [before, word, after].
function splitMark(s: string): [string, string, string] {
  const m = s.match(/^(.*?)\{([^}]*)\}(.*)$/);
  return m ? [m[1], m[2], m[3]] : [s, "", ""];
}

function famMock(lang: string): FamMock {
  return FAM_MOCK[lang] ?? FAM_MOCK_PACK.data[lang] ?? FAM_MOCK.en;
}

function MockMeanings({ lang }: { lang: string }) {
  const m = famMock(lang);
  const word = m.meaningsWord;
  const m1 = { t: m.meaning1T, ex: m.meaning1Ex };
  const m2 = { t: m.meaning2T, ex: m.meaning2Ex };
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{word}</span>
      </div>
      {[m1, m2].map((m, i) => (
        <div key={i} className="fam-mock-meaning">
          <div className={`fam-mock-thumb fam-mock-thumb-${i}`}>
            {i === 0 ? <LeafIcon /> : <ArrowUpIcon />}
          </div>
          <div>
            <div className="fam-mock-meaning-t">{i + 1}. {m.t}</div>
            <div className="fam-mock-meaning-ex">{m.ex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockKids({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-toggle">
        <span className="fam-mock-toggle-pill">{m.kidsLabel}</span>
        <span className="fam-mock-toggle-on" />
      </div>
      <div className="fam-mock-bubble">
        {m.kidsBubble}
      </div>
      <Image
        src="/gad-it-character.png"
        alt=""
        width={72}
        height={72}
        className="fam-mock-char"
      />
    </div>
  );
}

function MockContext({ lang }: { lang: string }) {
  const m = famMock(lang);
  const [pre, mark, post] = splitMark(m.contextSentence);
  return (
    <div className="fam-mock">
      <div className="fam-mock-sentence">
        {pre}<mark>{mark}</mark>{post}
      </div>
      <div className="fam-mock-arrow">↓</div>
      <div className="fam-mock-picked">
        <CheckIcon color="#0EA5A5" />
        <span>{m.contextMeaning}</span>
      </div>
    </div>
  );
}

// Sample "words to look up" shown in the notebook mockup, one triplet per
// UI language, so a Dutch/French/etc. visitor never sees English example
// words. (Used to only cover ar/ru/he and fell back to English otherwise.)
const EXAMPLE_WORDS: Record<string, [string, string, string]> = {
  en: ["dream", "vivid", "reluctant"],
  he: ["חלום", "מרהיב", "נחוש"],
  ar: ["حلم", "واضح", "متردّد"],
  ru: ["мечта", "яркий", "упорный"],
  es: ["sueño", "vívido", "reacio"],
  pt: ["sonho", "vívido", "relutante"],
  fr: ["rêve", "éclatant", "réticent"],
  de: ["Traum", "lebhaft", "zögerlich"],
  cs: ["sen", "živý", "váhavý"],
  sk: ["sen", "žiarivý", "zdráhavý"],
  it: ["sogno", "vivido", "riluttante"],
  ja: ["夢", "鮮やか", "曖昧"],
  hi: ["सपना", "जीवंत", "अनिच्छुक"],
  am: ["ህልም", "ደማቅ", "እምቢተኛ"],
  uk: ["мрія", "яскравий", "нерішучий"],
  tr: ["hayal", "canlı", "isteksiz"],
  pl: ["marzenie", "żywy", "niechętny"],
  fa: ["رویا", "روشن", "مردد"],
  id: ["mimpi", "cerah", "enggan"],
  nl: ["droom", "levendig", "aarzelend"],
  zu: ["iphupho", "okugqamile", "ovilaphayo"],
  xh: ["iphupha", "ecacileyo", "ethandabuzayo"],
  nso: ["toro", "molaleng", "go dikadika"],
  tn: ["toro", "phatsimo", "tlhoafalo"],
  st: ["toro", "hlakileng", "qeaqea"],
  ts: ["norho", "vonakala", "kanakana"],
  ss: ["liphupho", "kukhanya", "kungafuni"],
  ve: ["muloro", "vhonala", "ofha"],
  nr: ["iphupho", "okukhanyako", "ukungafuni"],
  el: ["όνειρο", "ζωντανός", "διστακτικός"],
  vi: ["giấc mơ", "sống động", "ngần ngại"],
  fil: ["panaginip", "malinaw", "nag-aatubili"],
  af: ["droom", "helder", "huiwerig"],
  sw: ["ndoto", "wazi", "kusitasita"],
  "zh-CN": ["梦想", "鲜明", "犹豫"],
  "zh-TW": ["夢想", "鮮明", "猶豫"],
  ko: ["꿈", "생생한", "머뭇거리는"],
  th: ["ความฝัน", "ชัดเจน", "ลังเล"],
  bn: ["স্বপ্ন", "প্রাণবন্ত", "অনিচ্ছুক"],
  da: ["drøm", "levende", "tøvende"],
  hu: ["álom", "élénk", "vonakodó"],
};

function MockNotebook({ lang }: { lang: string }) {
  const m = famMock(lang);
  const words = EXAMPLE_WORDS[lang] ?? EXAMPLE_WORDS.en;
  return (
    <div className="fam-mock">
      <div className="fam-mock-nb-title">{m.notebookTitle}</div>
      {words.map((w, i) => (
        <div key={i} className="fam-mock-nb-row">
          <CheckIcon color={i < 2 ? "#0EA5A5" : "#d1d5db"} />
          <span>{w}</span>
          {i === 2 && <span className="fam-mock-nb-due">{m.notebookDue}</span>}
        </div>
      ))}
    </div>
  );
}

function MockProfiles({ lang }: { lang: string }) {
  const m = famMock(lang);
  const kids = [
    { n: m.profile1Name, g: m.profile1Grade, c: "#0EA5A5" },
    { n: m.profile2Name, g: m.profile2Grade, c: "#7C3AED" },
    { n: m.profile3Name, g: m.profile3Grade, c: "#D97706" },
  ];
  return (
    <div className="fam-mock fam-mock-profiles">
      {kids.map((k) => (
        <div key={k.n} className="fam-mock-profile">
          <div className="fam-mock-avatar" style={{ background: k.c }}>
            {k.n[0]}
          </div>
          <div className="fam-mock-profile-n">{k.n}</div>
          <div className="fam-mock-profile-g">{k.g}</div>
        </div>
      ))}
    </div>
  );
}

function MockGames({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    // The real game covers from /play, gently floating (Gadi 2026-10-19: more color, the new game look).
    <div className="fam-mock fam-mock-games">
      <div className="fam-mock-game fam-mock-game-a">
        <img className="fam-mock-game-img" src="/play/twin.webp" alt="" width={720} height={480} loading="lazy" decoding="async" />
        <span>{m.gameTwinTrap}</span>
      </div>
      <div className="fam-mock-game fam-mock-game-b">
        <img className="fam-mock-game-img" src="/play/time.webp" alt="" width={720} height={480} loading="lazy" decoding="async" />
        <span>{m.gameTimeTraveler}</span>
      </div>
      <div className="fam-mock-score"><span>{m.gameStreak}</span></div>
    </div>
  );
}

function MockEnglish({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.englishWord}</span>
      </div>
      <div className="fam-mock-meaning">
        <div className="fam-mock-thumb fam-mock-thumb-1">
          <PersonIcon />
        </div>
        <div>
          <div className="fam-mock-meaning-t">{m.englishMeaningT}</div>
          <div className="fam-mock-meaning-ex">{m.englishMeaningEx}</div>
        </div>
      </div>
    </div>
  );
}

/** The puzzle metaphor made concrete (Gadi 2026-07-26): the same
 *  sentence shown twice. First with its key words missing — dashed gaps
 *  a child cannot fill, so the whole meaning collapses. Then complete,
 *  every word a solid piece, and the picture is whole. Words ARE the
 *  pieces of the picture. */
function PuzzleMock({ lang, beforeLabel, afterLabel }: { lang: string; beforeLabel: string; afterLabel: string }) {
  // Tokenize into words, spaces and {hidden} words. A hidden word may be glued
  // to its neighbours (Hebrew "ה{סערה}", or space-less Japanese/Chinese/Thai
  // with several hidden words in one run), so match braces anywhere rather
  // than only whole space-separated tokens; that older rule printed the braces
  // literally in those languages (Gadi 2026-09-25).
  type Tok = string | { k: string } | { sp: true };
  const tokens: Tok[] = [];
  const src = famMock(lang).puzzleSentence;
  const pushText = (txt: string) => {
    for (const part of txt.split(/(\s+)/)) {
      if (!part) continue;
      tokens.push(/^\s+$/.test(part) ? { sp: true } : part);
    }
  };
  const re = /\{([^}]*)\}/g;
  let last = 0;
  let mt: RegExpExecArray | null;
  while ((mt = re.exec(src))) {
    if (mt.index > last) pushText(src.slice(last, mt.index));
    tokens.push({ k: mt[1] });
    last = re.lastIndex;
  }
  if (last < src.length) pushText(src.slice(last));
  return (
    <div className="fam-puzzle">
      <div className="fam-puzzle-block fam-puzzle-bad">
        <div className="fam-puzzle-cap fam-puzzle-cap-bad">{beforeLabel}</div>
        <p className="fam-puzzle-text">
          {tokens.map((t, i) => (
            <Fragment key={i}>
              {typeof t === "string" ? (
                <span className="fam-pz-word">{t}</span>
              ) : "sp" in t ? (
                " "
              ) : (
                <span className="fam-pz-gap" aria-hidden>?</span>
              )}
            </Fragment>
          ))}
        </p>
      </div>
      <div className="fam-puzzle-arrow" aria-hidden>↓</div>
      <div className="fam-puzzle-block fam-puzzle-good">
        <div className="fam-puzzle-cap fam-puzzle-cap-good">
          <CheckIcon color="#0b7d7d" />
          {afterLabel}
        </div>
        <p className="fam-puzzle-text">
          {tokens.map((t, i) => (
            <Fragment key={i}>
              {typeof t === "string" ? (
                <span className="fam-pz-word">{t}</span>
              ) : "sp" in t ? (
                " "
              ) : (
                <span className="fam-pz-fill">{t.k}</span>
              )}
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

/** A faithful mockup of the real Gadit word screen inside a phone
 *  shell. Gadi's feedback (2026-07-17): the page showed warm family
 *  scenes but never the PRODUCT as an app on a device. This is the
 *  actual UI (teal search pill, big word title, part-of-speech chip,
 *  a meaning card with its picture, Kids Mode toggle, example) so a
 *  parent sees exactly what they are buying. */
function PhoneMock({ lang }: { lang: string }) {
  const m = famMock(lang);
  const word = m.dreamWord;
  const pos = m.dreamPos;
  const meaning = m.dreamMeaningFull;
  const example = m.dreamExample;
  const kids = m.kidsLabel;
  const searchHint = m.searchHint;
  return (
    <div className="fam-phone" aria-hidden>
      <div className="fam-phone-notch" />
      <div className="fam-phone-screen">
        <div className="fam-ph-top">
          <span className="fam-ph-brand">Gad<span className="fam-ph-it">it</span></span>
          <span className="fam-ph-kids">
            <span className="fam-ph-kids-label">{kids}</span>
            <span className="fam-ph-toggle" />
          </span>
        </div>
        <div className="fam-ph-search">
          <SearchIcon />
          <span className="fam-ph-word-typed">{word}</span>
          <span className="fam-ph-hint">{searchHint}</span>
        </div>
        <div className="fam-ph-title-row">
          <span className="fam-ph-title">{word}</span>
          <span className="fam-ph-pos">{pos}</span>
        </div>
        <div className="fam-ph-card">
          <div className="fam-ph-pic">
            <MoonIcon />
            <span className="fam-ph-star fam-ph-star-1" />
            <span className="fam-ph-star fam-ph-star-2" />
            <span className="fam-ph-star fam-ph-star-3" />
          </div>
          <div className="fam-ph-meaning-row">
            <span className="fam-ph-num">1</span>
            <div>
              <div className="fam-ph-def">{meaning}</div>
              <div className="fam-ph-ex">{example}</div>
            </div>
          </div>
        </div>
        <div className="fam-ph-tabs">
          <span className="is-active">{m.tabMeanings}</span>
          <span>{m.tabPicture}</span>
          <span>{m.tabNotebook}</span>
        </div>
      </div>
    </div>
  );
}

/** Step 1 of the how-it-works flow: the child types a word. A faithful
 *  recreation of the real search screen (Kids Mode on, teal search pill
 *  with the typed word and a blinking caret). */
function MockSearch({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-toggle">
        <span className="fam-mock-toggle-pill">{m.kidsLabel}</span>
        <span className="fam-mock-toggle-on" />
      </div>
      <div className="fam-mock-search fam-mock-search-lg">
        <SearchIcon />
        <span>{m.dreamWord}</span>
        <span className="fam-mock-caret" aria-hidden />
      </div>
      <div className="fam-mock-searchhint">{m.searchTagline}</div>
    </div>
  );
}

/** Step 2 of the how-it-works flow: the meaning, shown with a PROMINENT
 *  picture (Gadi 2026-07-29 — the picture is the heart of the product and
 *  was barely visible as tiny icons before). A big illustrated card, the
 *  kid-level meaning, and an example. */
function MockPicture({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-ph-pic fam-mock-pic fam-mock-pic-real" aria-hidden>
        {/* A real Gadit kids picture of the word (Gadi 2026-10-19: more color). */}
        <Image src="/fam/dream-kids.webp" alt="" width={240} height={240} sizes="240px" />
      </div>
      <div className="fam-mock-meaning">
        <div>
          <div className="fam-mock-meaning-t">{m.dreamMeaningShort}</div>
          <div className="fam-mock-meaning-ex">{m.dreamExample}</div>
        </div>
      </div>
    </div>
  );
}

/** Definition block: the kid-level meaning, on its own. */
function MockDefinition({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-mock-bubble">{m.dreamKidDef}</div>
    </div>
  );
}

/** Examples block: three real sentences with the word. */
function MockExamples({ lang }: { lang: string }) {
  const m = famMock(lang);
  const ex = [m.dreamEx1, m.dreamEx2, m.dreamEx3];
  return (
    <div className="fam-mock">
      <div className="fam-mock-search">
        <SearchIcon /> <span>{m.dreamWord}</span>
      </div>
      <div className="fam-mock-examples">
        {ex.map((e, i) => (
          <div key={i} className="fam-mock-ex-row">
            <span className="fam-mock-ex-num">{i + 1}</span>
            <span>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Quiz block: a short practice question on its own. */
function MockQuiz({ lang }: { lang: string }) {
  const m = famMock(lang);
  return (
    <div className="fam-mock">
      <div className="fam-mock-quiz fam-mock-quiz-solo">
        <div className="fam-mock-quiz-q">{m.quizQ}</div>
        <div className="fam-mock-quiz-opt is-right">{m.quizRight}</div>
        <div className="fam-mock-quiz-opt">{m.quizWrong1}</div>
        <div className="fam-mock-quiz-opt">{m.quizWrong2}</div>
      </div>
    </div>
  );
}

/** Label under the family total in the dashboard mockup (same wording as /family). */
const FAMILY_TOTAL_LABEL: Record<string, string> = {
  fr: "mots dans les carnets de la famille",
  es: "palabras en los cuadernos de la familia",
  pt: "palavras nos cadernos da família",
  it: "parole nei quaderni della famiglia",
  de: "Wörter in den Notizbüchern der Familie",
  nl: "woorden in de notitieboekjes van het gezin",
  cs: "slov v poznámkových blocích rodiny",
  sk: "slov v poznámkových blokoch rodiny",
  uk: "слів у сімейних зошитах",
  pl: "słów w rodzinnych zeszytach",
  tr: "ailenin defterlerindeki kelime",
  ja: "家族のノートにある単語",
  hi: "परिवार की नोटबुक में शब्द",
  fa: "واژه‌ها در دفترچه‌های خانواده",
  id: "kata di buku catatan keluarga",
  am: "በቤተሰቡ ማስታወሻ ደብተሮች ውስጥ ያሉ ቃላት",
  he: "מילים במחברות המשפחה",
  en: "words in the family's notebooks",
  zu: "amagama asezincwadini zamanothi zomndeni",
  xh: "amagama asezincwadini zosapho",
  nso: "mantšu dipukung tša lapa",
  tn: "mafoko mo dibukaneng tsa lelapa",
  st: "mantswe a dibukaneng tsa lelapa",
  ts: "marito eti bukwini ta marito ta ndyangu",
  ss: "emagama lasetincwadzini temndeni",
  ve: "maipfi kha bugu dza muṱa",
  nr: "amezwi asemabhukwini wamezwi womndeni",
  el: "λέξεις στα τετράδια της οικογένειας",
  ru: "слов в тетрадях семьи",
  ar: "كلمة في دفاتر العائلة",
  vi: "từ trong sổ tay của cả gia đình",
  fil: "salita sa mga notebook ng pamilya",
  af: "woorde in die gesin se notaboeke",
  sw: "maneno katika madaftari ya familia",
  "zh-CN": "家庭单词本中的词",
  "zh-TW": "家庭單字本中的字詞",
  ko: "가족 단어장의 단어",
  th: "คำในสมุดคำศัพท์ของครอบครัว",
  bn: "পরিবারের নোটবুকে থাকা শব্দ",
  da: "ord i familiens notesbøger",
  hu: "szó a család füzeteiben",
};

const MOCKUPS = [MockMeanings, MockKids, MockContext, MockNotebook, MockProfiles, MockGames, MockEnglish];

// One block per feature, in order, each with its own real product screen
// (Gadi 2026-07-29: separate every feature so each gets its own space).
// type → definition → examples → picture → context → notebook → quiz → game.
const HOW_MOCKS = [
  MockSearch, MockDefinition, MockExamples, MockPicture,
  MockContext, MockNotebook, MockQuiz, MockGames,
];
// The 4 cards shown first on the real-screens page: definition, picture,
// notebook, quiz (council 2026-10-08); "לכל היכולות" opens all 8.

// Real illustrations (GPT, 2026-07-17, teal paper-cutout style, in
// /public/fam as compressed WebP). One per feature; the 7th (English
// homework) has no clean illustration yet (every generation leaked
// text), so it falls back to the CSS mockup. Alt text is intentionally
// empty: these are decorative, the copy carries the meaning.
const FEATURE_IMG: Array<string | null> = [
  "meanings",
  "kids-mode",
  "context",
  "notebook",
  "profiles",
  "games",
  "english",
];

/* ────────────────────────── page ────────────────────────── */

/**
 * The older copy table and the illustration text keep only Hebrew and English
 * here; every other language is its own file (classic-copy/, classic-mock/).
 * This gate loads the page's language first. No hooks of its own (see LangGate).
 */
function FamGate({ lang, children }: { lang: string; children: React.ReactNode }) {
  useLangPacks([FAM_COPY_PACK, FAM_MOCK_PACK] as Pack<unknown>[], lang);
  return children;
}

export default function FamiliesLandingClient(props: { withNav?: boolean; classic?: boolean; i18n?: FamI18n }) {
  const { lang } = useLang();
  return (
    <FamGate lang={lang}>
      <FamiliesLanding {...props} />
    </FamGate>
  );
}

function FamiliesLanding({ withNav = false, classic = false, i18n }: { withNav?: boolean; classic?: boolean; i18n?: FamI18n }) {
  const params = useSearchParams();
  const { user, familyId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const he = lang === "he";
  // Every language (2026-10-17): a page given its copy file (i18n/<lang>.ts,
  // the /families/landing-intl review page) renders the real-screens page in
  // that language, with the English screens and the language's prices.
  // The visitor's country block (R in South Africa), same as /pricing.
  const px = usePricing();
  const prices = landingPrices(lang, px);
  const c = i18n ? fillDeep(i18n.copy, prices) : ((COPY as Record<string, Copy>)[lang] ?? FAM_COPY_PACK.data[lang] ?? COPY.en);
  // Real app screens: Hebrew first (captured from the Hebrew demo family).
  // English copy is ready in REAL_COPY.en but waits for an English demo
  // family's screens; every other language keeps the illustrations.
  // `classic` = the pre-2026-09-28 illustrated page, kept at /families/landing-old.
  const real = i18n ? fillDeep(i18n.real, prices) : !classic && lang === "he" ? REAL_COPY.he : undefined;
  const shotLang = i18n ? screensLang(lang) : lang;
  // Computer + tablet screens where this language has them (Gadi 2026-11-02).
  const desk = DESK_SHOT_LANGS.has(shotLang);
  // The Subjects band: only in the languages that have the feature (he, en, de, ar).
  const subjUi = subjectsBandLangFor(lang);

  // Default angle: vocab (Gadi 2026-07-17 + council: the master promise
  // is visible vocabulary growth; the pain angles stay as variants).
  const rawAngle = params.get("v");
  const angle: Angle = ANGLES.includes(rawAngle as Angle) ? (rawAngle as Angle) : "vocab";
  const hero = c.angles[angle];

  // Default to MONTHLY (Gadi 2026-07-29): the yearly figure can scare a
  // cold visitor. Show the small monthly price first; the yearly tab wears
  // a discount badge so the saving is visible before they even click it.
  const [billing, setBilling] = useState<"yearly" | "monthly">("monthly");
  // Hebrew real-screens page shows 4 key cards first (council 2026-10-08).
  const isOwner = !!user && familyId === user.uid;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("families_lp_view", { angle, lang });
  }, [angle, lang]);

  // Craft pass (2026-07-26): sections rise in as they enter the viewport,
  // and a sticky CTA bar slides up once the hero has scrolled away so the
  // action is always one tap from the reader (CRO: repeat the CTA at every
  // decision point). Both degrade gracefully — no JS or reduced-motion
  // leaves everything visible and static.
  const rootRef = useRef<HTMLDivElement>(null);
  const heroEndRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("fam-js");
    const bands = Array.from(root.querySelectorAll<HTMLElement>(".fam-band"));
    let revealObs: IntersectionObserver | null = null;
    if (!reduce && "IntersectionObserver" in window) {
      revealObs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              revealObs?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      bands.forEach((b) => revealObs?.observe(b));
    } else {
      bands.forEach((b) => b.classList.add("is-in"));
    }
    let stickyObs: IntersectionObserver | null = null;
    const sentinel = heroEndRef.current;
    if (sentinel && "IntersectionObserver" in window) {
      stickyObs = new IntersectionObserver(
        // Only once the hero is scrolled PAST (sentinel above the viewport),
        // not at load while it is still below it (QA 2026-10-07: the bar
        // sat next to the hero CTA on first paint).
        ([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0),
        { threshold: 0 },
      );
      stickyObs.observe(sentinel);
    }
    return () => {
      revealObs?.disconnect();
      stickyObs?.disconnect();
    };
  }, []);

  function startTrial(source: string) {
    track("families_lp_cta", { angle, billing, source });
    if (isOwner) {
      window.location.href = href("/family");
      return;
    }
    const priceId = billing === "yearly" ? PRICE_FAMILY_YEARLY : PRICE_FAMILY_MONTHLY;
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    const checkoutUrl = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
    promptLogin({
      mode: "signup",
      resumeUrl: checkoutUrl,
      onSuccess: () => {
        window.location.href = checkoutUrl;
      },
    });
  }

  // One learner at home: the Individual plan (it used to send people to the
  // retired Deep price; found in QA 2026-10-07).
  function startDeep() {
    track("families_lp_cta", { angle, billing: "individual_monthly", source: "single_child" });
    const checkoutUrl = `${href("/checkout")}?price=${encodeURIComponent(INDIVIDUAL_MONTHLY)}`;
    promptLogin({
      mode: "signup",
      resumeUrl: checkoutUrl,
      onSuccess: () => {
        window.location.href = checkoutUrl;
      },
    });
  }

  const ctaLabel = isOwner ? c.ownerCta : c.heroCta;

  // One feature band (photo of a tool beside its text), reused before and
  // after the games band.
  const toolSection = (f: RealTool, i: number) => real && (
      <section key={`real-${i}`} className={`fam-band ${i % 2 === 0 ? "fam-band-cream" : "fam-band-white"}`}>
        <div className={`fam-feature ${i % 2 === 1 ? "is-flipped" : ""}`}>
          <div className="fam-feature-text">
            <div className="fam-kicker">{f.kicker}</div>
            <h2 className="fam-h2 fam-h2-start">{f.title}</h2>
            <p className="fam-body"><Lines text={f.body} /></p>
            <ul className="fam-real-points">
              {f.points.map((pt, j) => (
                <li key={j}>{pt}</li>
              ))}
            </ul>
          </div>
          <div className="fam-feature-visual">
            {f.img2 ? (
              <div className="fam-real-pair">
                <DeviceShot lang={shotLang} name={f.img} alt={real.shotAlt} />
                {!desk && <PhoneShot lang={shotLang} name={f.img2} alt={real.shotAlt} />}
              </div>
            ) : (
              <DeviceShot lang={shotLang} name={f.img} alt={real.shotAlt} />
            )}
          </div>
        </div>
      </section>
  );
  // Two sections that move with the page order (Gadi 2026-10-19).
  const painSection = (band: "white" | "cream") => (
    <section className={`fam-band fam-band-${band}`}>
      <div className="fam-section fam-center">
        <div className="fam-kicker fam-kicker-light">{c.painKicker}</div>
        {real ? (
          <>
            <h2 className="fam-h2">{real.pain.title}</h2>
            <p className="fam-pain-lead"><Lines text={real.pain.lead} /></p>
            {real.pain.paras.map((t, i) => (
              <p key={i} className="fam-body fam-body-center"><Lines text={t} /></p>
            ))}
            <p className="fam-body fam-body-center fam-body-strong"><Lines text={real.pain.strong} /></p>
            <p className="fam-reframe"><Lines text={real.pain.reframe} /></p>
          </>
        ) : (
          <>
        <h2 className="fam-h2">{c.painTitle}</h2>
        {!real && (
        <div className="fam-inline-img">
          <Image src="/fam/pain.webp" alt="" width={1200} height={900} sizes="(max-width: 760px) 92vw, 600px" />
        </div>
        )}
        <p className="fam-body fam-body-center">{c.painBody1}</p>
        <p className="fam-body fam-body-center fam-body-strong">{c.painBody2}</p>
        <p className="fam-reframe">{c.reframe}</p>
          </>
        )}
      </div>
    </section>
  );
  // Puzzle metaphor (Gadi 2026-07-26): text is a puzzle, every word a piece.
  // Missing words are holes and the child stops seeing the whole picture.
  const puzzleSection = (band: "white" | "cream" | "teal") => (
    <section className={`fam-band fam-band-${band}${band === "teal" ? " fam-puzzle-band" : ""}`}>
      <div className="fam-section fam-center">
        <div className="fam-kicker fam-kicker-light">{c.puzzleKicker}</div>
        <h2 className="fam-h2">{c.puzzleTitle.split("\n").map((t, i) => <span key={i} style={{ display: "block" }}>{t}</span>)}</h2>
        <p className="fam-body fam-body-center">{real ? <Lines text={c.puzzleBody} /> : c.puzzleBody}</p>
        <PuzzleMock lang={lang} beforeLabel={c.puzzleBefore} afterLabel={c.puzzleAfter} />
        <p className="fam-reframe">{real ? <Lines text={c.puzzleLine} /> : c.puzzleLine}</p>
      </div>
    </section>
  );
  return (
    <div dir={dir} className={`fam-page${real ? " fam-premium" : ""}`} ref={rootRef}>
      <style>{FAM_CSS + REAL_CSS}</style>

      {withNav ? (
        /* In-site version (/families): the full Gadit topbar, matching
           /schools. Wrapped in a .wordbook context because the topbar CSS
           is scoped under .wordbook — the families page is .fam-page, so
           without this wrapper the nav collapsed into an unstyled cluster
           (Gadi 2026-07-29). The wrapper only carries fonts/vars, no box. */
        <div className="wordbook wb-force-light" dir={dir}>
          <header className="wb-shell-topbar">
            <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
              Gad<span className="wb-wordmark-it">it</span>
            </Link>
            <WbShellNav active="families" />
            <div className="wb-shell-actions">
              <ShareButton
                url="https://www.gadit.app/families"
                currentPage
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
              <LangSwitcher />
              {user ? (
                <WbUserMenu />
              ) : (
                <>
                  <StartFreeCTA />
                  <button
                    type="button"
                    className="wb-shell-link"
                    onClick={() => promptLogin({ mode: "signin" })}
                  >
                    {v2(lang, "signIn")}
                  </button>
                </>
              )}
            </div>
            <div className="wb-shell-mobile-cta">
              <StartFreeCTA />
            </div>
            <div className="wb-shell-mobile-menu-cluster">
              <ShareButton
                url="https://www.gadit.app/families"
                currentPage
                title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
                text=""
                shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
                copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
              />
              <LangSwitchMobile />
              <WbShellBurger active="families" />
            </div>
          </header>
        </div>
      ) : real ? (
        /* Real-screens campaign header (Gadi 2026-09-28, after the Yooniz
           hero): logo on the start side; start button, the signed-in user's
           picture, and the language picker on the other side. */
        <header className="fam-rtop">
          <Link href={href("/")} className="fam-logo-word" style={{ fontSize: 30 }} aria-label="Gadit" dir="ltr" translate="no">
            Gad<span className="fam-logo-it">it</span>
          </Link>
          <div className="fam-rtop-end">
            <button type="button" className="fam-rtop-cta" onClick={() => startTrial("top")}>
              {isOwner ? c.ownerCta : real.topCta}
            </button>
            {user && (
              <Link href={href("/family")} className="fam-rtop-avatar" aria-label={user.displayName ?? "account"}>
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" width={36} height={36} referrerPolicy="no-referrer" />
                ) : (
                  (user.displayName ?? user.email ?? "?").trim().charAt(0).toUpperCase()
                )}
              </Link>
            )}
            <div className="fam-rtop-lang">
              <LangSwitcher variant="muted" />
            </div>
          </div>
        </header>
      ) : (
        /* Standalone campaign version (/families/landing): brand only,
           no nav, so a sent link reads as a single product page. A small
           language switcher sits in the corner so a visitor can change the
           interface language without a site nav. */
        <header className="fam-topbrand">
          <div className="fam-topbrand-lang">
            <ShareButton
              url="https://www.gadit.app/families"
              currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <LangSwitcher variant="muted" />
          </div>
          <Link href={href("/")} className="fam-logo-word" aria-label="Gadit" dir="ltr" translate="no">
            Gad<span className="fam-logo-it">it</span>
          </Link>
          <div className="fam-topbrand-tagline">{c.heroBadge}</div>
        </header>
      )}

      <main>
        <CheckoutResumeBanner />
        {/* 1 · Hero — for a COLD visitor: category first (badge),
             then the promise (h1), then a plain what-it-is line, then
             the product itself on a phone so it is instantly clear
             this is a word app, not an abstract idea. */}
        <section className={`fam-hero${real ? " fam-hero-real" : ""}`}>
          <div className="fam-hero-grid">
            <div className="fam-hero-text">
              {real && (
                <div className="fam-cred-pill">
                  <span className="fam-cred-dots" aria-hidden>
                    <i style={{ background: "#0EA5A5" }} />
                    <i style={{ background: "#F59E0B" }} />
                    <i style={{ background: "#7C3AED" }} />
                  </span>
                  {real.credPill}
                </div>
              )}
              <h1 className="fam-h1">{hero.h1}</h1>
              <p className="fam-whatis">{real ? <Lines text={c.whatIs} /> : c.whatIs}</p>
              {/* Works everywhere, like the Yooniz hero (Gadi 2026-10-19). */}
              {real?.devices && (
                <ul className="fam-devices">
                  <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="1.8" /><path d="M8 20.5h8M12 16.5v4" /></svg><span>{real.devices[0]}</span></li>
                  <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="2.5" width="17" height="19" rx="2.2" /><path d="M10.5 18.5h3" /></svg><span>{real.devices[1]}</span></li>
                  <li><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.2" /><path d="M10.5 18.5h3" /></svg><span>{real.devices[2]}</span></li>
                </ul>
              )}
              {real ? (
                <div className="fam-hero-ctas">
                  <button type="button" className="fam-cta" onClick={() => startTrial("hero")}>
                    {ctaLabel}
                  </button>
                  <a href="#fam-cards" className="fam-cta-ghost">{real.howCta}</a>
                </div>
              ) : (
                <button type="button" className="fam-cta" onClick={() => startTrial("hero")}>
                  {ctaLabel}
                </button>
              )}
              {c.ctaMicro && <div className="fam-cta-micro">{c.ctaMicro}</div>}
              {real ? (
                <ul className="fam-hero-points">
                  {real.heroPoints.map((pt, i) => (
                    <li key={i}>
                      <CheckIcon color="#0b7d7d" />
                      {pt}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="fam-trustline">{c.trustLine}</div>
              )}
            </div>
            <div className="fam-hero-visual">
              {real ? (
                desk ? (
                  <div className="fam-devices fam-devices-hero">
                    <LaptopShot lang={shotLang} name="word" alt={real.shotAlt} priority />
                    <TabletShot lang={shotLang} name="notebook" alt={real.shotAlt} priority />
                  </div>
                ) : (
                <div className="fam-real-hero">
                  <PhoneShot lang={shotLang} name="notebook" alt={real.shotAlt} priority />
                  <PhoneShot lang={shotLang} name="word" alt={real.shotAlt} priority />
                </div>
                )
              ) : (
              <div className="fam-hero-stage">
                <div className="fam-hero-panel" aria-hidden />
                <PhoneMock lang={lang} />
                <div className="fam-proof-card" aria-hidden>
                  <div className="fam-proof-head">
                    <NotebookIcon />
                    <span>{c.proofTitle}</span>
                  </div>
                  <div className="fam-proof-big">{c.proofBig}</div>
                  <div className="fam-proof-words">
                    {c.proofWords.map((w, i) => (
                      <span key={i} className="fam-proof-chip">
                        <CheckIcon color="#0EA5A5" />
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
          {!real && <div className="fam-trustbar">
            {c.stats.map((s, i) => (
              <span key={i} className="fam-trustbar-item">
                <CheckIcon color="#0b7d7d" />
                {s}
              </span>
            ))}
          </div>}
          {!real && <div className="fam-credline">{c.credLine}</div>}
        </section>
        <div ref={heroEndRef} aria-hidden className="fam-hero-sentinel" />

        {/* 2 · Pain — the REAL academic pain (Gadi 2026-07-26). Not the
             kid asking about words (that is a good thing) but the words
             they skip: comprehension quietly breaks, vocabulary stays
             thin, retrieval fails, grades slip. White band gives a clean
             break from the cream hero above. */}
        {real ? puzzleSection("teal") : painSection("white")}

        {/* Real-screens order (council 2026-10-08): the parent pays and the
             parent dashboard is the moat, so it comes right after the pain,
             then the 4 key "for every word" cards, the puzzle, and the
             immigrant-family section. Other languages keep the old order. */}
        {/* Order (Gadi 2026-10-19): the puzzle is the problem, the word cards are
            the answer, then a mother's words, the parent dashboard and why
            homework drags on. */}
        {real && (
          <>
            <section className="fam-band fam-band-white fam-cards-band" id="fam-cards">
              <div className="fam-section fam-center fam-section-wide">
                {real.cardsKicker && <div className="fam-kicker">{real.cardsKicker}</div>}
                <h2 className="fam-h2">{real.cardsTitle ?? c.chainTitle}</h2>
                <div className="fam-how-steps">
                  {HOW_MOCKS.map((_, i) => i).map((i, n) => {
                    const blk = c.howBlocks[i];
                    const Mock = HOW_MOCKS[i];
                    if (!blk || !Mock) return null;
                    return (
                      <div key={i} className="fam-how-step">
                        <div className="fam-how-step-head">
                          <span className="fam-how-num">{n + 1}</span>
                          <span className="fam-how-text">{blk.t}</span>
                        </div>
                        <div className="fam-how-visual">
                          <Mock lang={lang} />
                        </div>
                        <p className="fam-how-body">{blk.b}</p>
                      </div>
                    );
                  })}
                </div>
                {/* Just the button (Gadi 2026-10-19): the box repeated what the page already says. */}
                <div style={{ marginTop: 36, textAlign: "center" }}>
                  <button type="button" className="fam-cta" onClick={() => startTrial("chain")}>
                    {ctaLabel}
                  </button>
                </div>
              </div>
            </section>

            {lang === "he" && (
              <section className="fam-band fam-band-white">
                <div className="gt-quote-inline-band"><InlineTestimonial item={FAMILY_TESTIMONIALS_HE[0]} /></div>
              </section>
            )}

            <section className="fam-band fam-band-cream">
              <div className="fam-feature">
                <div className="fam-feature-text">
                  <div className="fam-kicker">{real.dash.kicker}</div>
                  <h2 className="fam-h2 fam-h2-start">{real.dash.title}</h2>
                  <p className="fam-body"><Lines text={real.dash.body} /></p>
                  <ul className="fam-real-points">
                    {real.dash.points.map((pt, j) => (
                      <li key={j}>{pt}</li>
                    ))}
                  </ul>
                </div>
                <div className="fam-feature-visual">
                  {desk ? (
                    <div className="fam-devices">
                      <LaptopShot lang={shotLang} name={real.dash.img} alt={real.shotAlt} />
                      {real.dash.img2 && <PhoneShot lang={shotLang} name={real.dash.img2} alt={real.shotAlt} />}
                    </div>
                  ) : (
                  <div className="fam-real-pair">
                    <PhoneShot lang={shotLang} name={real.dash.img} alt={real.shotAlt} />
                    {real.dash.img2 && <PhoneShot lang={shotLang} name={real.dash.img2} alt={real.shotAlt} />}
                  </div>
                  )}
                </div>
              </div>
            </section>


            {painSection("white")}

          </>
        )}

        {!real && puzzleSection("cream")}

        {/* Right after why homework drags on (Gadi 2026-10-19). The home-language
            section is gone: without a picture it did not explain itself. */}
        {/* Homework showcase (Gadi 2026-10-12): the three paths on one
             deep-teal band, so the page is not white card after white card. */}
        {real?.homework && (
          <section className="fam-band fam-band-hw">
            <div className="fam-hw">
              <div className="fam-hw-head">
                <div className="fam-kicker">{real.homework.kicker}</div>
                <h2 className="fam-h2">{real.homework.title.split("\n").map((t, i) => <span key={i} style={{ display: "block" }}>{t}</span>)}</h2>
                <p className="fam-body"><Lines text={real.homework.body} /></p>
              </div>
              <div className="fam-hw-row">
                <ol className="fam-hw-cards">
                  {real.homework.cards.map((cd, j) => (
                    <li key={j} className="fam-hw-card">
                      {/* No number; the icon sits right beside the title (Gadi 2026-10-19). */}
                      <div className="fam-hw-card-head">
                        <span className="fam-hw-card-icon" aria-hidden>{cd.icon}</span>
                        <div className="fam-hw-card-t">{cd.t}</div>
                      </div>
                      <p className="fam-hw-card-b"><Lines text={cd.b} /></p>
                    </li>
                  ))}
                </ol>
                <div className="fam-real-pair">
                  <DeviceShot lang={shotLang} name={real.homework.img} alt={real.shotAlt} />
                  {!desk && <PhoneShot lang={shotLang} name={real.homework.img2} alt={real.shotAlt} />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Subjects (Gadi 2026-10-26): right after homework, only where the
            feature exists (he, en, de, ar). White, between the teal homework band
            and the cream tool band. */}
        {real && subjUi && (() => {
          const sc = subjectsBandCopy(subjUi, "families");
          return (
            <section className="fam-band fam-band-white fam-subj-band">
              <div className="fam-feature">
                <div className="fam-feature-text">
                  <div className="fam-kicker">{sc.kicker}</div>
                  <h2 className="fam-h2 fam-h2-start">{sc.title}</h2>
                  <SubjectsLines copy={sc} pClass="fam-body" noteClass="fam-subj-note" />
                </div>
                <div className="fam-feature-visual">
                  <SubjectsScreenMock ui={subjUi} />
                </div>
              </div>
            </section>
          );
        })()}

        {real && real.tools.filter((t) => !t.afterGames).map((f, i) => toolSection(f, i))}

        {/* Games and sibling duels, on a warm band (Gadi 2026-10-12). */}
        {real?.games && desk && real.gamesShow && (
          <section className="fam-band fam-band-sun">
            <div className="fam-games-show">
              <Image src="/play/duel-mascot.webp" alt="" width={240} height={240} className="fam-games-mascot" />
              <div className="fam-kicker">{real.games.kicker}</div>
              <h2 className="fam-h2">{real.games.title}</h2>
              <p className="fam-body"><Lines text={real.games.body} /></p>
              <div className="fam-games-stage fam-devices">
                <LaptopVideo src={real.gamesShow.video} poster={real.gamesShow.poster} label={real.gamesShow.videoLabel} />
                <TabletShot lang={shotLang} name="play" alt={real.shotAlt} />
              </div>
              <ol className="fam-games-steps">
                {real.gamesShow.steps.map((t, j) => <li key={j}>{t}</li>)}
              </ol>
              <h3 className="fam-games-cards-title">{real.gamesShow.cardsTitle}</h3>
              <ul className="fam-games-cards">
                {real.gamesShow.cards.map((cd, j) => (
                  <li key={j}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cd.img} alt="" loading="lazy" width={360} height={240} />
                    <span>{cd.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {real?.games && !(desk && real.gamesShow) && (
          <section className="fam-band fam-band-sun">
            <div className="fam-feature">
              <div className="fam-feature-text">
                <Image src="/play/duel-mascot.webp" alt="" width={240} height={240} className="fam-games-mascot" />
                <div className="fam-kicker">{real.games.kicker}</div>
                <h2 className="fam-h2 fam-h2-start">{real.games.title}</h2>
                <p className="fam-body"><Lines text={real.games.body} /></p>
                <ul className="fam-real-points">
                  {real.games.points.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              </div>
              <div className="fam-feature-visual">
                <div className="fam-real-pair">
                  <PhoneShot lang={shotLang} name={real.games.img} alt={real.shotAlt} />
                  {real.games.img2 && <PhoneShot lang={shotLang} name={real.games.img2} alt={real.shotAlt} />}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reading on its own, after the games (Gadi 2026-10-19): two "photograph"
            sections in a row read as the same thing. */}
        {real && real.tools.filter((t) => t.afterGames).map((f, i) => toolSection(f, i + 1))}

        {/* 5 · The parent dashboard (Gadi 2026-07-18): the moat. A mockup
             of the real /family progress view so a parent sees they are
             buying visible, accumulating proof of growth that ChatGPT
             cannot give. */}
        {!real && (
        <section className="fam-band fam-band-cream">
          <div className="fam-feature">
            <div className="fam-feature-text">
              <div className="fam-kicker">{c.dashKicker}</div>
              <h2 className="fam-h2 fam-h2-start">{c.dashTitle}</h2>
              <p className="fam-body">{c.dashBody}</p>
            </div>
            <div className="fam-feature-visual">
              <div className="fam-dashmock">
                <div className="fam-dashmock-sum">
                  <div className="fam-dashmock-sumnum">141</div>
                  <div className="fam-dashmock-sumlabel">{FAMILY_TOTAL_LABEL[lang] ?? FAMILY_TOTAL_LABEL.en}</div>
                </div>
                {c.dashKids.map((k, i) => {
                  const colors = ["#0EA5A5", "#7C3AED", "#D97706"];
                  const pct = Math.min(100, Math.round((k.total / 70) * 100));
                  return (
                    <div key={i} className="fam-dashmock-row">
                      <div className="fam-dashmock-avatar" style={{ background: colors[i % 3] }}>
                        {k.name.charAt(0)}
                      </div>
                      <div className="fam-dashmock-info">
                        <div className="fam-dashmock-name">{k.name}</div>
                        <div className="fam-dashmock-bar">
                          <span style={{ width: `${pct}%`, background: colors[i % 3] }} />
                        </div>
                      </div>
                      <div className="fam-dashmock-nums">
                        <span className="fam-dashmock-total">{k.total}</span>
                        <span className="fam-dashmock-week">+{k.week} {c.dashWeekLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        )}

        {/* 4 · Features — one section per feature, alternating */}
        {!real && c.features.map((f, i) => {
          const Mock = MOCKUPS[i];
          const flip = i % 2 === 1;
          return (
            <section key={i} className={`fam-band ${i % 2 === 0 ? "fam-band-white" : "fam-band-cream"}`}>
              <div className={`fam-feature ${flip ? "is-flipped" : ""}`}>
                <div className="fam-feature-text">
                  <div className="fam-kicker">{f.kicker}</div>
                  <h2 className="fam-h2 fam-h2-start">{f.title}</h2>
                  <p className="fam-body">{f.body}</p>
                </div>
                <div className="fam-feature-visual">
                  {FEATURE_IMG[i] ? (
                    <Image
                      src={`/fam/${FEATURE_IMG[i]}.webp`}
                      alt=""
                      width={1200}
                      height={900}
                      className="fam-feature-illus"
                      sizes="(max-width: 760px) 92vw, 440px"
                    />
                  ) : (
                    <Mock lang={lang} />
                  )}
                </div>
              </div>
            </section>
          );
        })}

        {/* 5 · Mid CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center">
            <h2 className="fam-h2 fam-h2-onteal">{c.midCtaTitle}</h2>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("mid")}>
              {isOwner ? c.ownerCta : c.midCta}
            </button>
          </div>
        </section>

        {/* 6 · Comparison */}
        <section className="fam-band fam-band-white">
          <div className="fam-section">
            <div className="fam-kicker">{c.compareKicker}</div>
            <h2 className="fam-h2">{c.compareTitle}</h2>
            <div className="fam-compare">
              <div className="fam-compare-head">
                <span />
                <span className="fam-compare-brand">{c.compareGadit}</span>
                <span>{c.compareOther}</span>
              </div>
              {c.compareRows.map((r, i) => (
                <div key={i} className="fam-compare-row">
                  <span>{r.label}</span>
                  <span>{r.gadit ? <CheckIcon color="#0EA5A5" /> : <XIcon />}</span>
                  <span>{r.other ? <CheckIcon color="#b91c1c" /> : <XIcon />}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7 · Safety */}
        <section className="fam-band fam-band-purple">
          <div className="fam-section fam-center">
            <ShieldBigIcon />
            {real?.safeKicker && <div className="fam-kicker fam-kicker-light">{real.safeKicker}</div>}
            <h2 className="fam-h2">{real?.safeTitle ?? c.safeTitle}</h2>
            <div className="fam-inline-img">
              <Image src="/fam/safe.webp" alt="" width={1200} height={800} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <p className="fam-body fam-body-center">{real ? <Lines text={c.safeBody} /> : c.safeBody}</p>
            <p className="fam-safe-line">{c.safeLine}</p>
          </div>
        </section>


        {/* 8.5 · Credibility (Gadi 2026-07-28): the honest proof the page
             lacked. 15 years in education, 15,000+ parents/students/
             educators. Kept generic on purpose, no institution named, to
             respect the brand separation. Placed right before the price so
             trust is highest at the ask. */}
        {/* Real-screens page (Gadi 2026-10-19): it looked like the section under
            it, so it moved, as plain text, to right before what the plan includes. */}
        {!real && (
        <section className="fam-band fam-band-purple">
          <div className="fam-section fam-center">
            <div className="fam-kicker">{c.credKicker}</div>
            <h2 className="fam-h2">{c.credTitle}</h2>
            <p className="fam-body fam-body-center">{c.credBody}</p>
          </div>
        </section>
        )}

        {/* 8.6 · Real words from families (Gadi 2026-10-12), Hebrew page. */}
        {lang === "he" && (
          <section className="fam-band fam-band-sand">
            <div className="fam-section">
              <Testimonials kicker="מהשטח" title="מה מספרים הילדים" items={KIDS_TESTIMONIALS_HE} />
              <div className="gt-quotes-gap" />
              <Testimonials kicker="" title="מה מספרים ההורים" items={PARENTS_TESTIMONIALS_HE} />
            </div>
          </section>
        )}

        {/* Order (Gadi 2026-10-19): the five steps, then what the plan includes,
            right before the price. The steps show only their titles. */}
        {/* 4 · How it works (Gadi 2026-07-28, 5-model synthesis): the old
             negative word→sentence→paragraph chain was redundant with the
             pain + puzzle above (too much problem-piling before showing the
             product), so it is now a POSITIVE 4-step of the actual flow,
             ending in the visible-progress payoff + CTA. */}
        <section className="fam-band fam-band-white">
          <div className="fam-section fam-center fam-section-wide">
            <div className="fam-kicker" id="fam-how">{real ? real.howKicker : c.chainKicker}</div>
            <h2 className="fam-h2">{real ? real.howTitle : c.chainTitle}</h2>
            {real ? (
              <>
              <div className="fam-real-steps">
                {real.steps.map((st, i) => (
                  <div key={i} className="fam-real-step">
                    <div className="fam-real-step-text">
                      <span className="fam-real-step-num">{i + 1}</span>
                      <h3 className="fam-real-step-title">{st.t.split("\n").map((t, k) => <span key={k} style={{ display: "block" }}>{t}</span>)}</h3>
                      {st.s && <p className="fam-real-step-sub">{st.s}</p>}
                    </div>
                    <PhoneShot lang={shotLang} name={st.img} alt={real.shotAlt} />
                  </div>
                ))}
              </div>
              </>
            ) : (
            <div className="fam-how-steps">
              {c.howBlocks.map((blk, i) => {
                const Mock = HOW_MOCKS[i] ?? HOW_MOCKS[0];
                return (
                  <div key={i} className="fam-how-step">
                    <div className="fam-how-step-head">
                      <span className="fam-how-num">{i + 1}</span>
                      <span className="fam-how-text">{blk.t}</span>
                    </div>
                    <div className="fam-how-visual">
                      <Mock lang={lang} />
                    </div>
                    <p className="fam-how-body">{blk.b}</p>
                  </div>
                );
              })}
            </div>
            )}
            {!real && (
            <div className="fam-chain-turn">
              <div className="fam-chain-turn-title">{c.chainTurnTitle}</div>
              <p className="fam-chain-turn-body">{c.chainTurnBody}</p>
              <button type="button" className="fam-cta" onClick={() => startTrial("chain")}>
                {ctaLabel}
              </button>
            </div>
            )}
          </div>
        </section>

        {/* 8 · Value stack. On the real-screens page it sits right on top of the
            price card, both in the green frame (Gadi 2026-10-19: they belong together). */}
        <section className={`fam-band fam-band-cream${real ? " fam-stack-band" : ""}`}>
          <div className="fam-section">
            {real && (
              <div className="fam-cred-text">
                <p className="fam-cred-text-lead">{c.credTitle}</p>
                <p className="fam-body fam-body-center"><Lines text={c.credBody} /></p>
              </div>
            )}
            <h2 className="fam-h2">{c.stackTitle}</h2>
            <ul className="fam-list fam-stack">
              {c.stackItems.map((item, i) => (
                <li key={i}>
                  <CheckIcon color="#0EA5A5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9 · Pricing */}
        <section className={`fam-band fam-band-cream${real ? " fam-price-band" : ""}`} id="fam-pricing">
          <div className="fam-section">
            {!real && <div className="fam-kicker">{c.priceKicker}</div>}
            <div className="fam-price-card">
              <div className="fam-price-badge">{c.trialBadge}</div>
              <h2 className="fam-price-title">{c.priceTitle}</h2>

              <div className="fam-billing-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "monthly"}
                  className={billing === "monthly" ? "is-active" : ""}
                  onClick={() => setBilling("monthly")}
                >
                  {c.billedMonthly}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={billing === "yearly"}
                  className={billing === "yearly" ? "is-active" : ""}
                  onClick={() => setBilling("yearly")}
                >
                  {c.billedYearly}
                  <span className="fam-billing-save" dir={he ? undefined : "ltr"}>{c.yearlySave}</span>
                </button>
              </div>

              <div className="fam-price-amount">{billing === "yearly" ? c.yearly : c.monthly}</div>
              {billing === "yearly" && <div className="fam-price-note">{c.yearlyNote.split("\n").map((t, i) => <span key={i} style={{ display: "block" }}>{t}</span>)}</div>}
              <div className="fam-price-anchor">{c.priceAnchor}</div>

              <button type="button" className="fam-cta fam-cta-wide" onClick={() => startTrial("pricing")}>
                {isOwner ? c.ownerCta : c.priceCta}
              </button>
              <p className="fam-cancel-note"><Lines text={c.cancelNote} /></p>
            </div>

            {/* No solo-plan link on the families page (Gadi 2026-10-19: it confuses). */}
            {!isOwner && !real && (
              <button type="button" className="fam-single-link" onClick={startDeep}>
                <Lines text={planCopy(lang, "famSingleChild", { price: lang === "he" ? INDIVIDUAL_DISPLAY.ilsMonthly : INDIVIDUAL_DISPLAY.usdMonthly })} />
              </button>
            )}

            {/* Guarantee */}
            {/* No two-week goal box (Gadi 2026-10-19: unnecessary). */}
            {!real && (
              <div className="fam-guarantee">
                <ShieldIcon />
                <div>
                  <div className="fam-guarantee-t">{c.guaranteeTitle}</div>
                  <div className="fam-guarantee-b">{real ? <Lines text={c.guaranteeBody} /> : c.guaranteeBody}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 10 · FAQ */}
        <section className="fam-band fam-band-cream">
          <div className="fam-section">
            <h2 className="fam-h2">{c.faqTitle}</h2>
            <div className="fam-faq">
              {c.faq.map((f, i) => (
                <details key={i} className="fam-faq-item">
                  <summary>{f.q}</summary>
                  <p><Lines text={f.a} /></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 11 · Final CTA */}
        <section className="fam-band fam-band-teal">
          <div className="fam-section fam-center fam-final">
            <div className="fam-final-img">
              <Image src="/fam/routine.webp" alt="" width={1200} height={800} sizes="(max-width: 760px) 92vw, 560px" />
            </div>
            <h2 className="fam-h2 fam-h2-onteal">{c.finalTitle.split("\n").map((t, i) => <span key={i} style={{ display: "block" }}>{t}</span>)}</h2>
            <p className="fam-final-sub">{real ? <Lines text={c.finalSub} /> : c.finalSub}</p>
            <button type="button" className="fam-cta fam-cta-inverse" onClick={() => startTrial("final")}>
              {isOwner ? c.ownerCta : c.finalCta}
            </button>
          </div>
        </section>
      </main>

      {/* Sticky CTA — mobile only, appears once the hero scrolls away */}
      <div className={`fam-sticky ${showSticky ? "is-shown" : ""}`}>
        <div className="fam-sticky-inner">
          <span className="fam-sticky-note">{c.trialBadge}</span>
          <button type="button" className="fam-cta fam-sticky-cta" onClick={() => startTrial("sticky")}>
            {ctaLabel}
          </button>
        </div>
      </div>

      <footer className="fam-footer">
        <span>© Gadit {new Date().getFullYear()}</span>
        <Link href={href("/terms")}>{c.footerTerms}</Link>
        <Link href={href("/privacy")}>{c.footerPrivacy}</Link>
        <TokushohoLink />
      </footer>
    </div>
  );
}

/* ────────────────────────── icons ────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.4" strokeLinecap="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function ShieldBigIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ margin: "0 auto 10px", display: "block" }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4-4" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 21c0-9 4-15 14-17-1 10-6 15-14 17z" />
      <path d="M6 21c3-6 7-10 11-12" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#fff" aria-hidden style={{ opacity: 0.95 }}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
function NotebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0b7d7d" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
      <path d="M9 3v18" />
    </svg>
  );
}

/* ────────────────────────── styles ────────────────────────── */

const FAM_CSS = `
.fam-page {
  min-height: 100dvh;
  background: #f6f4ee;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}
.fam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  max-width: 1040px;
  width: 100%;
  margin: 0 auto;
}
.fam-wordmark {
  font-weight: 800;
  font-size: 22px;
  color: #1f2937;
  text-decoration: none;
  letter-spacing: -0.02em;
}
.fam-wordmark-it { color: #0EA5A5; font-style: italic; }
.fam-logo { display: inline-flex; align-items: center; line-height: 0; }
.fam-logo-icon { border-radius: 11px; display: block; }
.fam-topbrand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 26px 20px 6px;
  position: relative;
}
.fam-topbrand-lang { position: absolute; top: 14px; inset-inline-end: 16px; }
/* Matches the real Gadit wordmark from the live site: Inter, dark ink
   "Gad" + teal italic "it" (globals .wb-home-logo). */
.fam-logo-word {
  font-family: var(--font-inter), 'Inter', system-ui, sans-serif;
  font-weight: 600;
  font-size: 36px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #0B0F19;
  text-decoration: none;
  direction: ltr;
}
.fam-logo-it { color: #0EA5A5; font-style: italic; font-weight: 500; }
.fam-topbrand-tagline {
  font-weight: 700;
  font-size: 14px;
  color: #0b7d7d;
  background: rgba(14,165,165,0.09);
  border: 1px solid rgba(14,165,165,0.22);
  border-radius: 999px;
  padding: 5px 16px;
}
.fam-header-cta {
  border: 1.5px solid #0EA5A5;
  background: transparent;
  color: #0b7d7d;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-hero {
  padding: 26px 20px 30px;
  max-width: 1000px;
  margin: 0 auto;
}
.fam-hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 26px;
  align-items: center;
  text-align: center;
}
.fam-hero-visual { display: flex; justify-content: center; }
@media (min-width: 880px) {
  .fam-hero-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    text-align: start;
  }
  .fam-hero-text { order: 1; }
  .fam-hero-visual { order: 2; }
}

/* Anchored product stage: phone sits in front of a soft teal panel,
   with a notebook proof card overlapping its corner (the master
   promise made visible, per the 5-AI hero review). */
.fam-hero-stage { position: relative; display: inline-block; padding: 10px 0 34px; }
.fam-hero-panel {
  position: absolute;
  inset: 24px -6% 60px -6%;
  background:
    radial-gradient(120% 90% at 50% 30%, rgba(14,165,165,0.16), rgba(14,165,165,0.05) 60%, transparent 75%);
  border-radius: 34px;
  z-index: 0;
}
.fam-hero-stage .fam-phone { position: relative; z-index: 1; }
.fam-proof-card {
  position: absolute;
  z-index: 2;
  bottom: 8px;
  inset-inline-end: -14px;
  width: 190px;
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  box-shadow: 0 16px 36px rgba(31,41,55,0.16);
  padding: 12px 14px;
  text-align: start;
  direction: rtl;
}
.fam-proof-head {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; font-size: 12.5px; color: #0b7d7d;
}
.fam-proof-big { font-weight: 800; font-size: 17px; color: #1f2937; margin: 6px 0 8px; }
.fam-proof-words { display: flex; flex-wrap: wrap; gap: 5px; }
.fam-proof-chip {
  display: inline-flex; align-items: center; gap: 3px;
  background: rgba(14,165,165,0.09);
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11.5px; font-weight: 600; color: #374151;
}
@media (max-width: 400px) {
  .fam-proof-card { width: 150px; inset-inline-start: -6px; padding: 10px 12px; }
  .fam-proof-big { font-size: 15px; }
}
.fam-badge {
  display: inline-block;
  background: rgba(14,165,165,0.1);
  color: #0b7d7d;
  border: 1px solid rgba(14,165,165,0.25);
  font-weight: 700;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.fam-h1 {
  font-size: clamp(30px, 5.6vw, 46px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}
.fam-whatis {
  font-size: clamp(14.5px, 2.1vw, 16.5px);
  line-height: 1.6;
  color: #4b5563;
  font-weight: 400;
  margin: 0 0 20px;
  max-width: 520px;
}
.fam-hero-text .fam-whatis { margin-inline: auto; }
@media (min-width: 880px) {
  .fam-hero-text .fam-whatis { margin-inline: 0; }
}
.fam-sub {
  font-size: clamp(15px, 2.3vw, 17px);
  line-height: 1.65;
  color: #6b7280;
  margin: 0 auto 24px;
  max-width: 620px;
}
.fam-cta {
  background: #0EA5A5;
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 17px;
  padding: 15px 30px;
  border-radius: 13px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(14,165,165,0.22);
  transition: transform 160ms ease-out;
}
.fam-cta-micro { margin-top: 10px; font-size: 13px; color: #9ca3af; }
.fam-trustline { margin-top: 16px; font-size: 14px; font-weight: 600; color: #4b5563; }
.fam-cta:active { transform: scale(0.97); }
.fam-cta-wide { width: 100%; }
.fam-cta-inverse {
  background: #fff;
  color: #0b7d7d;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}
.fam-trust { margin-top: 14px; font-size: 13.5px; color: #6b7280; }
.fam-hero-img {
  margin: 28px auto 0;
  max-width: 680px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(31,41,55,0.14);
  line-height: 0;
}
.fam-hero-img img { width: 100%; height: auto; display: block; }
.fam-inline-img {
  margin: 4px auto 20px;
  max-width: 560px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgba(31,41,55,0.12);
  line-height: 0;
}
.fam-inline-img img { width: 100%; height: auto; display: block; }
.fam-feature-illus {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(31,41,55,0.12);
}
.fam-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 26px;
}
.fam-stat {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 13.5px;
  color: #374151;
}
/* Uniform band rhythm: every section gets the same generous vertical
   space, and a hairline top divider makes the boundary between two
   sections read clearly even when the two warm tones sit next to each
   other (Gadi 2026-07-26 — the hero and the block under it blurred into
   one). Teal/purple carry their own strong colour so they skip the
   hairline. */
.fam-band { padding: 62px 0; }
.fam-band-cream { background: #f6f4ee; border-top: 1px solid rgba(31,41,55,0.06); }
.fam-band-white { background: #ffffff; border-top: 1px solid rgba(31,41,55,0.06); }
.fam-band-teal { background: #0EA5A5; }
.fam-band-purple { background: rgba(124,58,237,0.07); }
.fam-band-ink { background: #fdf6ec; }
@media (max-width: 760px) {
  .fam-band { padding: 46px 0; }
}
.fam-section { max-width: 760px; margin: 0 auto; padding: 0 20px; }
.fam-center { text-align: center; }
.fam-kicker {
  text-align: center;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b7d7d;
  margin-bottom: 8px;
}
.fam-kicker-light { color: #b45309; }
.fam-h2 {
  font-size: clamp(24px, 4.4vw, 32px);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
  text-align: center;
}
.fam-h2-start { text-align: start; }
.fam-h2-onteal { color: #fff; }
.fam-body { font-size: 16.5px; line-height: 1.7; color: #374151; margin: 0 0 12px; }
.fam-body-strong { font-weight: 700; color: #1f2937; }
.fam-body-center { text-align: center; max-width: 560px; margin-inline: auto; }
.fam-reframe {
  font-size: clamp(19px, 3vw, 23px);
  font-weight: 800;
  color: #0b7d7d;
  text-align: center;
  margin: 22px 0 0;
}

/* When the chain lives inside a two-column feature (section 2), align
   the illustration to the top of the tall text column and let the
   chain fill the column instead of centering at 480px. */
.fam-feature-top { align-items: start; }
.fam-feature-text .fam-chain { margin-inline: 0; max-width: 100%; }
.fam-feature-text .fam-chain-turn { margin-inline: 0; }
@media (min-width: 761px) {
  .fam-feature-top .fam-feature-illus { position: sticky; top: 24px; }
}

/* Reading-comprehension chain */
.fam-chain {
  max-width: 480px;
  margin: 4px auto 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.fam-chain-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid rgba(217,119,6,0.18);
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 26px;
  box-shadow: 0 6px 16px rgba(31,41,55,0.05);
}
.fam-chain-num {
  width: 26px; height: 26px; flex-shrink: 0;
  border-radius: 50%;
  background: rgba(217,119,6,0.12);
  color: #b45309;
  font-weight: 800; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.fam-chain-text { font-size: 15.5px; font-weight: 600; color: #1f2937; line-height: 1.45; }
.fam-chain-arrow {
  position: absolute;
  bottom: -23px;
  inset-inline-start: 50%;
  transform: translateX(50%);
  color: #d97706;
  font-size: 18px;
  font-weight: 800;
}
.fam-chain-step:last-of-type { margin-bottom: 16px; }
.fam-chain-cost {
  text-align: center;
  font-size: clamp(18px, 2.6vw, 21px);
  font-weight: 800;
  color: #b91c1c;
  margin-top: 4px;
}
.fam-chain-turn {
  max-width: 620px;
  margin: 30px auto 0;
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 20px;
  padding: 24px 24px 26px;
  text-align: center;
  box-shadow: 0 14px 36px rgba(14,165,165,0.12);
}
.fam-chain-turn-title {
  font-size: clamp(20px, 3vw, 25px);
  font-weight: 800;
  color: #0b7d7d;
  margin-bottom: 10px;
}
.fam-chain-turn-title::before {
  content: "";
  display: block;
  width: 44px; height: 3px;
  background: #0EA5A5;
  border-radius: 999px;
  margin: 0 auto 14px;
}
.fam-chain-turn-body {
  font-size: 16px;
  line-height: 1.65;
  color: #374151;
  margin: 0 auto 18px;
  max-width: 520px;
}

/* Parent dashboard mockup (mirrors the real /family progress view) */
.fam-dashmock {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 16px 40px rgba(31,41,55,0.1);
  direction: rtl;
}
.fam-dashmock-sum {
  background: linear-gradient(140deg, rgba(14,165,165,0.12), rgba(14,165,165,0.04));
  border: 1px solid rgba(14,165,165,0.2);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.fam-dashmock-sumnum { font-size: 30px; font-weight: 800; color: #0b7d7d; line-height: 1; }
.fam-dashmock-sumlabel { font-size: 12.5px; color: #6b7280; font-weight: 600; margin-top: 2px; }
.fam-dashmock-row { display: flex; align-items: center; gap: 11px; padding: 9px 0; }
.fam-dashmock-row + .fam-dashmock-row { border-top: 1px solid rgba(31,41,55,0.06); }
.fam-dashmock-avatar {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  color: #fff; font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.fam-dashmock-info { flex: 1; min-width: 0; }
.fam-dashmock-name { font-weight: 700; font-size: 14.5px; color: #1f2937; margin-bottom: 5px; }
.fam-dashmock-bar {
  height: 7px; border-radius: 999px; background: #eef0f2; overflow: hidden;
}
.fam-dashmock-bar span { display: block; height: 100%; border-radius: 999px; }
.fam-dashmock-nums { text-align: end; flex-shrink: 0; }
.fam-dashmock-total { display: block; font-size: 20px; font-weight: 800; color: #1f2937; line-height: 1; }
.fam-dashmock-week { font-size: 11.5px; font-weight: 700; color: #6d28d9; }
/* Phone-frame product mockup */
.fam-phone-wrap { display: flex; justify-content: center; margin-top: 8px; }
.fam-phone {
  width: 300px;
  max-width: 84vw;
  background: #1f2937;
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 26px 60px rgba(31,41,55,0.32);
  position: relative;
  direction: rtl;
}
.fam-phone-notch {
  position: absolute;
  top: 12px; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 24px;
  background: #1f2937;
  border-radius: 0 0 16px 16px;
  z-index: 2;
}
.fam-phone-screen {
  background: #f6f4ee;
  border-radius: 30px;
  padding: 34px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fam-ph-top { display: flex; align-items: center; justify-content: space-between; }
.fam-ph-brand { font-weight: 800; font-size: 17px; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-it { color: #0EA5A5; font-style: italic; }
.fam-ph-kids { display: flex; align-items: center; gap: 6px; }
.fam-ph-kids-label { font-size: 11px; font-weight: 700; color: #0b7d7d; }
.fam-ph-toggle {
  width: 30px; height: 18px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-ph-toggle::after {
  content: ""; position: absolute; top: 2.5px; inset-inline-end: 2.5px;
  width: 13px; height: 13px; background: #fff; border-radius: 50%;
}
.fam-ph-search {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1.5px solid rgba(14,165,165,0.4);
  border-radius: 999px;
  padding: 10px 14px;
}
.fam-ph-word-typed { font-weight: 700; font-size: 15px; color: #1f2937; }
.fam-ph-hint { margin-inline-start: auto; font-size: 12px; color: #b8bcc4; }
.fam-ph-title-row { display: flex; align-items: baseline; gap: 10px; padding-top: 2px; }
.fam-ph-title { font-size: 30px; font-weight: 800; color: #1f2937; letter-spacing: -0.02em; }
.fam-ph-pos {
  font-size: 11.5px; font-weight: 700; color: #7C3AED;
  background: rgba(124,58,237,0.1); border-radius: 999px; padding: 3px 10px;
}
.fam-ph-card {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(31,41,55,0.06);
}
.fam-ph-pic {
  height: 92px;
  background: linear-gradient(140deg, #1e3a8a, #4c1d95);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.fam-ph-star {
  position: absolute; width: 4px; height: 4px; background: #fff; border-radius: 50%; opacity: 0.9;
}
.fam-ph-star-1 { top: 20px; inset-inline-start: 40px; }
.fam-ph-star-2 { top: 54px; inset-inline-end: 44px; width: 3px; height: 3px; }
.fam-ph-star-3 { top: 30px; inset-inline-end: 70px; width: 5px; height: 5px; }
.fam-ph-meaning-row { display: flex; gap: 10px; padding: 12px 14px; }
.fam-ph-num {
  width: 22px; height: 22px; flex-shrink: 0;
  background: rgba(14,165,165,0.12); color: #0b7d7d;
  border-radius: 50%; font-weight: 800; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.fam-ph-def { font-size: 13.5px; font-weight: 600; color: #1f2937; line-height: 1.45; }
.fam-ph-ex { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.4; }
.fam-ph-tabs { display: flex; gap: 8px; justify-content: center; padding-top: 2px; }
.fam-ph-tabs span {
  font-size: 11.5px; font-weight: 700; color: #9ca3af;
  padding: 5px 12px; border-radius: 999px;
}
.fam-ph-tabs span.is-active { background: #0EA5A5; color: #fff; }
.fam-final-img {
  margin: 0 auto 22px;
  max-width: 560px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0,0,0,0.22);
  line-height: 0;
}
.fam-final-img img { width: 100%; height: auto; display: block; }
.fam-feature {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
}
.fam-feature.is-flipped .fam-feature-text { order: 2; }
.fam-feature.is-flipped .fam-feature-visual { order: 1; }
.fam-feature-text .fam-kicker { text-align: start; }
@media (max-width: 760px) {
  .fam-feature { grid-template-columns: 1fr; gap: 20px; }
  .fam-feature.is-flipped .fam-feature-text { order: 1; }
  .fam-feature.is-flipped .fam-feature-visual { order: 2; }
}
.fam-mock {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.14);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(31,41,55,0.13), 0 2px 6px rgba(31,41,55,0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.fam-mock-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 9px 14px;
  font-weight: 700;
  font-size: 15px;
}
.fam-mock-meaning { display: flex; gap: 12px; align-items: flex-start; }
.fam-mock-thumb {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fam-mock-thumb-0 { background: linear-gradient(135deg, rgba(14,165,165,0.18), rgba(14,165,165,0.06)); }
.fam-mock-thumb-1 { background: linear-gradient(135deg, rgba(124,58,237,0.16), rgba(124,58,237,0.05)); }
.fam-mock-meaning-t { font-weight: 700; font-size: 14.5px; }
.fam-mock-meaning-ex { color: #6b7280; font-size: 13px; margin-top: 2px; }
.fam-mock-toggle { display: flex; align-items: center; gap: 10px; }
.fam-mock-toggle-pill {
  background: rgba(14,165,165,0.12);
  color: #0b7d7d;
  font-weight: 800;
  font-size: 13px;
  border-radius: 999px;
  padding: 5px 12px;
}
.fam-mock-toggle-on {
  width: 38px; height: 22px;
  background: #0EA5A5;
  border-radius: 999px;
  position: relative;
}
.fam-mock-toggle-on::after {
  content: "";
  position: absolute;
  top: 3px; inset-inline-end: 3px;
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
}
.fam-mock-bubble {
  background: #f0fdfa;
  border: 1px solid rgba(14,165,165,0.25);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.65;
}
.fam-mock-char { position: absolute; bottom: -14px; inset-inline-end: -10px; }
.fam-mock-sentence {
  font-size: 15.5px;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px 14px;
  line-height: 1.6;
}
.fam-mock-sentence mark {
  background: rgba(14,165,165,0.2);
  border-radius: 5px;
  padding: 1px 5px;
  font-weight: 800;
}
.fam-mock-arrow { text-align: center; color: #0EA5A5; font-weight: 800; }
.fam-mock-picked {
  display: flex; gap: 8px; align-items: center;
  font-weight: 700; font-size: 14px;
  background: rgba(14,165,165,0.08);
  border-radius: 12px;
  padding: 10px 12px;
}
.fam-mock-nb-title { font-weight: 800; font-size: 14.5px; }
.fam-mock-nb-row { display: flex; align-items: center; gap: 8px; font-size: 14.5px; }
.fam-mock-nb-due {
  margin-inline-start: auto;
  background: rgba(217,119,6,0.12);
  color: #b45309;
  font-weight: 700;
  font-size: 11.5px;
  border-radius: 999px;
  padding: 3px 9px;
}
.fam-mock-quiz {
  border-top: 1px dashed rgba(31,41,55,0.15);
  padding-top: 12px;
  display: flex; flex-direction: column; gap: 7px;
}
.fam-mock-quiz-q { font-weight: 700; font-size: 13.5px; }
.fam-mock-quiz-opt {
  border: 1.5px solid rgba(31,41,55,0.12);
  border-radius: 10px;
  padding: 7px 11px;
  font-size: 13px;
}
.fam-mock-quiz-opt.is-right { border-color: #0EA5A5; background: rgba(14,165,165,0.07); font-weight: 700; }
.fam-mock-profiles { flex-direction: row; justify-content: space-around; }
.fam-mock-profile { text-align: center; }
.fam-mock-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 6px;
}
.fam-mock-profile-n { font-weight: 700; font-size: 14px; }
.fam-mock-profile-g { color: #6b7280; font-size: 12px; }
.fam-mock-games { flex-direction: row; flex-wrap: wrap; }
.fam-mock-game {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  padding: 10px 8px 12px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  font-weight: 700; font-size: 13.5px; text-align: center;
  animation: famGameFloat 3.6s ease-in-out infinite;
}
.fam-mock-game-a { background: linear-gradient(160deg, rgba(14,165,165,0.16), rgba(14,165,165,0.05)); color: #0B6F6F; }
.fam-mock-game-b { background: linear-gradient(160deg, rgba(124,58,237,0.16), rgba(124,58,237,0.05)); color: #5B2BB5; animation-delay: -1.8s; }
.fam-mock-game-img { width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 12px; display: block; }
.fam-mock-score { width: 100%; display: flex; justify-content: center; }
.fam-mock-score span {
  display: inline-block;
  font-weight: 700; font-size: 13px; color: #b45309;
  background: #FFF4DE; border: 1px solid rgba(245,158,11,0.35);
  border-radius: 999px; padding: 5px 14px;
  animation: famStreakPulse 2.4s ease-in-out infinite;
}
@keyframes famGameFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes famStreakPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245,158,11,0); } 50% { transform: scale(1.04); box-shadow: 0 0 0 6px rgba(245,158,11,0.12); } }
@media (prefers-reduced-motion: reduce) { .fam-mock-game, .fam-mock-score span { animation: none; } }
.fam-compare {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 18px;
  overflow: hidden;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 10px 28px rgba(31,41,55,0.07);
}
.fam-compare-head, .fam-compare-row {
  display: grid;
  grid-template-columns: 1fr 84px 84px;
  align-items: center;
  padding: 11px 16px;
  font-size: 14px;
}
.fam-compare-head {
  background: #f9fafb;
  font-weight: 800;
  font-size: 13px;
}
.fam-compare-head span:nth-child(2), .fam-compare-head span:nth-child(3),
.fam-compare-row span:nth-child(2), .fam-compare-row span:nth-child(3) {
  text-align: center;
  display: flex; justify-content: center;
}
.fam-compare-brand { color: #0b7d7d; }
.fam-compare-row { border-top: 1px solid rgba(31,41,55,0.06); }
.fam-safe-line {
  text-align: center;
  font-weight: 800;
  color: #7C3AED;
  margin: 16px 0 0;
  font-size: 16px;
}
.fam-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
  max-width: 520px;
  margin-inline: auto;
}
.fam-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 15.5px; line-height: 1.55; }
.fam-stack {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 18px;
  padding: 22px 24px;
}
.fam-price-card {
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 22px;
  padding: 26px 24px;
  max-width: 460px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 14px 40px rgba(14,165,165,0.12);
}
.fam-price-badge {
  display: inline-block;
  background: #0EA5A5;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.fam-price-title { font-size: 24px; font-weight: 800; margin: 0 0 14px; }
.fam-billing-toggle {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 14px;
}
.fam-billing-toggle button {
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 13.5px;
  color: #6b7280;
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-billing-toggle button.is-active { background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.fam-billing-toggle button { display: inline-flex; align-items: center; gap: 6px; }
.fam-billing-save {
  background: #10B981; color: #fff;
  font-size: 11.5px; font-weight: 800;
  padding: 1px 7px; border-radius: 999px;
  line-height: 1.5;
}
/* Follow the page direction so Hebrew reads "19.90 ₪ לחודש" (number on
   the right, unit on the left) rather than the LTR "לחודש 19.90 ₪". */
.fam-price-amount { font-size: 36px; font-weight: 800; }
.fam-price-note { color: #0b7d7d; font-weight: 700; font-size: 14.5px; margin-top: 2px; margin-bottom: 8px; }
.fam-price-anchor {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  margin: 0 auto 16px;
  max-width: 320px;
  line-height: 1.45;
}
.fam-cancel-note { color: #6b7280; font-size: 12.5px; margin: 12px 0 0; line-height: 1.55; }
.fam-single-link {
  display: block;
  margin: 18px auto 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.fam-guarantee {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(124,58,237,0.06);
  border: 1px solid rgba(124,58,237,0.2);
  border-radius: 18px;
  padding: 18px 20px;
  max-width: 560px;
  margin: 26px auto 0;
}
.fam-guarantee-t { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
.fam-guarantee-b { color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-faq { display: flex; flex-direction: column; gap: 10px; }
.fam-faq-item {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 14px;
  padding: 14px 18px;
}
.fam-faq-item summary { font-weight: 700; font-size: 15.5px; cursor: pointer; list-style: none; }
.fam-faq-item summary::-webkit-details-marker { display: none; }
.fam-faq-item p { margin: 10px 0 0; color: #4b5563; font-size: 14.5px; line-height: 1.65; }
.fam-final { padding: 10px 20px; }
.fam-final-sub { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0 0 20px; }
.fam-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  padding: 22px;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid rgba(31,41,55,0.06);
}
.fam-footer a { color: #9ca3af; text-decoration: none; }

/* Puzzle metaphor: a sentence with missing pieces, then whole */
.fam-puzzle {
  max-width: 540px;
  margin: 10px auto 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fam-puzzle-block {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.1);
  border-radius: 16px;
  padding: 16px 18px 18px;
  box-shadow: 0 10px 28px rgba(31,41,55,0.08);
  text-align: start;
}
.fam-puzzle-bad { border-color: rgba(185,28,28,0.2); }
.fam-puzzle-good { border-color: rgba(14,165,165,0.32); }
.fam-puzzle-cap {
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.fam-puzzle-cap-bad { color: #b91c1c; }
.fam-puzzle-cap-good { color: #0b7d7d; }
.fam-puzzle-text {
  margin: 0;
  font-size: 16.5px;
  line-height: 2.15;
  color: #1f2937;
  font-weight: 600;
}
.fam-pz-gap {
  display: inline-block;
  min-width: 42px;
  text-align: center;
  border: 2px dashed rgba(185,28,28,0.5);
  border-radius: 8px;
  color: rgba(185,28,28,0.75);
  background: rgba(185,28,28,0.05);
  font-weight: 800;
  padding: 1px 8px;
}
.fam-pz-fill {
  display: inline-block;
  border-radius: 8px;
  background: rgba(14,165,165,0.14);
  border: 2px solid rgba(14,165,165,0.36);
  color: #0b7d7d;
  font-weight: 800;
  padding: 1px 8px;
}
.fam-puzzle-arrow {
  text-align: center;
  color: #0EA5A5;
  font-weight: 800;
  font-size: 20px;
  line-height: 1;
}

/* ─── Craft pass (2026-07-26): motion, sticky CTA, trust bar, polish ─── */
.fam-page {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
.fam-h1, .fam-h2 { text-wrap: balance; }
.fam-body, .fam-whatis, .fam-chain-turn-body, .fam-guarantee-b { text-wrap: pretty; }

/* CTA state polish: hover lift, active press, keyboard focus ring, custom
   easing (emil: ease-out with punch, exit shorter than enter). */
.fam-cta {
  transition: transform 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms ease, background-color 160ms ease;
}
.fam-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(14,165,165,0.3); background-color: #0c9a9a; }
.fam-cta:active { transform: translateY(0) scale(0.98); }
.fam-cta:focus-visible { outline: 3px solid rgba(14,165,165,0.45); outline-offset: 3px; }
.fam-cta-inverse:hover { background-color: #fff; box-shadow: 0 10px 26px rgba(0,0,0,0.22); }

/* Scroll reveal — only when JS is active, so no-JS stays fully visible. */
.fam-js .fam-band {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 640ms cubic-bezier(0.23,1,0.32,1), transform 640ms cubic-bezier(0.23,1,0.32,1);
}
.fam-js .fam-band.is-in { opacity: 1; transform: none; }

/* Hero trust bar — the honest at-a-glance credibility strip. */
.fam-trustbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 20px;
  max-width: 720px;
  margin: 24px auto 0;
  padding: 0 20px;
}
.fam-trustbar-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #4b5563;
}
.fam-hero-sentinel { height: 1px; width: 100%; }

/* Credibility line under the hero trust bar */
.fam-credline {
  max-width: 640px;
  margin: 14px auto 0;
  padding: 0 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

/* Positive "how it works" steps: teal accent instead of the amber
   problem-chain accent, since this section now shows the product flow. */
.fam-how .fam-chain-step { border-color: rgba(14,165,165,0.2); }
.fam-how .fam-chain-num { background: rgba(14,165,165,0.12); color: #0b7d7d; }
.fam-how .fam-chain-arrow { color: #0EA5A5; }

/* Sticky CTA bar (mobile) — appears after the hero scrolls out of view. */
.fam-sticky {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(31,41,55,0.1);
  box-shadow: 0 -6px 24px rgba(31,41,55,0.1);
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  transform: translateY(130%);
  transition: transform 320ms cubic-bezier(0.32,0.72,0,1);
}
.fam-sticky.is-shown { transform: none; }
.fam-sticky-inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.fam-sticky-note { font-size: 13px; font-weight: 800; color: #0b7d7d; white-space: nowrap; }
.fam-sticky-cta { padding: 12px 22px; font-size: 15px; }
@media (min-width: 900px) { .fam-sticky { display: none; } }
@media (max-width: 899px) { .fam-footer { padding-bottom: 86px; } }

@media (prefers-reduced-motion: reduce) {
  .fam-js .fam-band { opacity: 1; transform: none; transition: none; }
  .fam-sticky, .fam-cta { transition: none; }
}

/* How it works: one block per feature, each with a real product screen.
   Two rows of four on desktop; every card the same height via
   grid-auto-rows:1fr + a flex column that stretches the mock (Gadi
   2026-07-29). */
.fam-section-wide { max-width: 1140px; }
/* Subjects band (2026-10-26): the small "more subjects soon" line. */
.fam-subj-note { margin: 4px 0 0; font-size: 14.5px; font-weight: 600; color: #0b7d7d; }
/* Hebrew has no capitals: the uppercase kicker would only turn the brand into GADIT. */
html[lang="he"] .fam-subj-band .fam-kicker { text-transform: none; }
.fam-how-steps {
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: 1fr;
  gap: 26px 18px;
  text-align: start;
  margin: 10px 0 12px;
}
@media (min-width: 560px) { .fam-how-steps { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) { .fam-how-steps { grid-template-columns: repeat(4, 1fr); } }
.fam-how-step { display: flex; flex-direction: column; height: 100%; }
.fam-how-visual { flex: 1; display: flex; }
.fam-how-visual .fam-mock { flex: 1; margin: 0; }
.fam-how-body { flex-shrink: 0; }
.fam-how-step-head { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
.fam-how-num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: rgba(14,165,165,0.12); color: #0b7d7d;
  font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
.fam-how-text { font-size: 15.5px; font-weight: 700; color: #1f2937; line-height: 1.45; padding-top: 3px; }
.fam-how-visual .fam-mock { margin: 0; }
.fam-mock-search-lg { font-size: 17px; padding: 12px 16px; }
.fam-mock-caret {
  width: 2px; height: 18px; background: #0EA5A5; border-radius: 1px;
  margin-inline-start: 2px; animation: fam-caret 1s step-end infinite;
}
@keyframes fam-caret { 50% { opacity: 0; } }
.fam-mock-searchhint { font-size: 12.5px; color: #9ca3af; font-weight: 500; }
.fam-mock-pic { border-radius: 14px; height: 120px; }
.fam-mock-pic svg { width: 46px; height: 46px; }
.fam-how-body { font-size: 13.5px; color: #6b7280; line-height: 1.55; margin: 12px 0 0; }
.fam-mock-examples { display: flex; flex-direction: column; gap: 8px; }
.fam-mock-ex-row { display: flex; gap: 9px; align-items: flex-start; font-size: 13.5px; color: #374151; line-height: 1.5; }
.fam-mock-ex-num {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(14,165,165,0.1); color: #0b7d7d;
  font-weight: 800; font-size: 11px;
  display: flex; align-items: center; justify-content: center;
}
.fam-mock-quiz-solo { border-top: none; padding-top: 0; }
@media (prefers-reduced-motion: reduce) { .fam-mock-caret { animation: none; } }
`;
