"use client";

/**
 * SchoolsLandingClient — public marketing landing page for the Schools
 * tier. Eight sections, council-vetted copy. See web/src/app/schools/
 * page.tsx for the architecture summary.
 *
 * Auto-redirect: school owners (users with a schoolId on their user
 * doc) who land here get bounced to /schools/manage immediately. This
 * matches what Notion/Canva/Quizlet do — same URL, different surface
 * depending on auth state. Anonymous and Basic/Clear/Deep/Family
 * users see the marketing page.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TokushohoLink } from "@/components/legal/TokushohoLink";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { v2 } from "@/lib/i18n-v2";
import { makePack, useLangPacks, type Pack } from "@/lib/lang-pack";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { LANGUAGES, langNameIn } from "@/lib/i18n";
import { toggleLangGroup } from "@/lib/lang-groups";
import { LangSearchList } from "@/components/LangSearch";
import { SchoolOrderForm } from "./SchoolOrderForm";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { SCHOOLS_TIERS, SCHOOLS_TIER_LIST, studentsUpTo, type SchoolsTierKey } from "@/lib/schools-prices";

// Same languages as HomeClient — duplicated rather than refactored so
// the topbar on /schools mirrors the homepage exactly without coupling
// the two files.
// Single source of truth: the shared LANGUAGES registry, so this switcher
// never drifts behind newly-added UI languages.
const LANGS = LANGUAGES;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[1];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button type="button" className="wb-lang-chip" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          <LangSearchList lang={lang} onPick={(c) => { setLang(c); setOpen(false); }} onClose={() => setOpen(false)}>
          {(langRows) => langRows.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={l.code === lang} className={l.code === lang ? "is-active" : ""} onClick={() => { if (toggleLangGroup(l.code)) return; setLang(l.code); setOpen(false); }}>
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" /><span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2, verticalAlign: "middle" }}><span>{langNameIn(l.code, lang)}</span>{langNameIn(l.code, lang) !== l.label && <span dir={l.dir} style={{ fontSize: 11, opacity: 0.5, unicodeBidi: "isolate" }}>{l.label}</span>}</span>
              </button>
            </li>
          ))}
          </LangSearchList>
        </ul>
      )}
    </div>
  );
}

export type T = {
  // Hero
  heroH1: string;
  heroSub: string;
  heroCta: string;
  heroPriceChip: string;
  heroTrust: string;
  // Problem
  probTag: string;
  probH2: string;
  probBody1: string;
  probBody2: string;
  probCallout1Title: string;
  probCallout1Body: string;
  probCallout2Title: string;
  probCallout2Body: string;
  probCallout3Title: string;
  probCallout3Body: string;
  // How It Works
  howTag: string;
  howH2: string;
  howSub: string;
  howStep1Title: string;
  howStep1Body: string;
  howStep2Title: string;
  howStep2Body: string;
  howStep3Title: string;
  howStep3Body: string;
  // Teacher View
  teacherTag: string;
  teacherH2: string;
  teacherSub: string;
  teacherB1: string;
  teacherB2: string;
  teacherB3: string;
  teacherB4: string;
  // Privacy
  privTag: string;
  privH2: string;
  privSub: string;
  privPoint1: string;
  privPoint2: string;
  privPoint3: string;
  privPoint4: string;
  privKahoot: string;
  // Pricing
  priceTag: string;
  priceH2: string;
  priceSub: string;
  priceSmallName: string;
  priceSmallAmount: string;
  priceSmallStudents: string;
  priceLargeName: string;
  priceLargeAmount: string;
  priceLargeStudents: string;
  priceIncludesTitle: string;
  priceIncludes: string[];
  priceCta: string;
  priceLarger: string;
  // FAQ
  faqTag: string;
  faqH2: string;
  faq: Array<{ q: string; a: string }>;
  // Final CTA
  finalH2: string;
  finalBody: string;
  finalCta: string;
  finalNote: string;
  // Mockup labels
  mockupRoster: string;
  mockupSearches: string;
  mockupStudent1: string;
  mockupStudent2: string;
  mockupStudent3: string;
  mockupWordExample: string;
  mockupExampleDef: string;
  mockupExampleEx: string;
};

const COPY: Record<string, T> = {
  en: {
    heroH1: "Every student understands the lesson.",
    heroSub: "Any hard word, in any of 30+ languages, explained on the spot.",
    heroCta: "See pricing and order",
    heroPriceChip: "From $97 / month",
    heroTrust: "Self-serve. Cancel anytime.",
    probTag: "The Problem",
    probH2: "A student who doesn't understand a word can't understand the sentence.",
    probBody1: "A student misses one word. They don't raise their hand. They think they roughly understand. The teacher moves on. Five words later, the paragraph is blurry. Five paragraphs later, the lesson is lost.",
    probBody2: "Most students who fall behind aren't unintelligent. They have a stack of words they never fully understood. Every new word built on those compounds the gap. The cause is invisible to the teacher.",
    probCallout1Title: "The compounding gap",
    probCallout1Body: "Unlearned words build an invisible barrier to every future lesson.",
    probCallout2Title: "The time drain",
    probCallout2Body: "Teachers lose 5-10 minutes per lesson on definitions.",
    probCallout3Title: "The silent dropout",
    probCallout3Body: "Students zone out when a paragraph has too many unknown words.",
    howTag: "How It Works",
    howH2: "Set up in 2 minutes. No IT.",
    howSub: "The same friction-free classroom code pattern that already works for quiz games, built for word comprehension instead.",
    howStep1Title: "Create a classroom code",
    howStep1Body: "The principal or coordinator creates a classroom in the dashboard. The system generates a 6-character code. Print it on a sticker for the classroom computer.",
    howStep2Title: "Students join, no accounts",
    howStep2Body: "Students visit gadit.app/c/CODE in any browser, pick their name from the roster (one click), and start typing words. No app install, no email, no password.",
    howStep3Title: "Teachers see what the class searched",
    howStep3Body: "Every search lands in the dashboard, tagged with the student's name. You see what each student looked up, when, and which words the class struggled with collectively.",
    teacherTag: "The Teacher View",
    teacherH2: "The dashboard you've been asking for.",
    teacherSub: "Not vague engagement metrics. Specific words, specific students, specific moments.",
    teacherB1: "Per-student search history with timestamps",
    teacherB2: "Class-wide most-searched words this week",
    teacherB3: "Repeated lookups that flag fragile understanding",
    teacherB4: "Filterable by date, student, or word",
    privTag: "Privacy by Design",
    privH2: "Total visibility for teachers. Zero data risk for schools.",
    privSub: "We collect no student PII. Not because we hide it well, because we never collect it. The architecture is the compliance.",
    privPoint1: "No student accounts. No emails, no passwords, no IDs.",
    privPoint2: "No personal data leaves the school. Searches are tagged by roster name only.",
    privPoint3: "Classroom codes work only during school hours. Configurable per school.",
    privPoint4: "COPPA, GDPR-K, and Israeli student-privacy law all comfortably handled.",
    privKahoot: "Joins as easily as a classroom quiz game. Built for word comprehension and teacher visibility.",
    priceTag: "Pricing",
    priceH2: "Annual pricing, by school size.",
    priceSub: "Self-serve via Stripe. No sales calls, no demos, no purchase orders.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Up to 100 students",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Up to 500 students",
    priceIncludesTitle: "Both plans include",
    priceIncludes: [
      "Unlimited classrooms",
      "Full teacher dashboard",
      "Student picker roster",
      "Time-bound classroom codes",
      "Student UI in 30+ languages",
      "Simple annual order, below the procurement threshold",
      "Pronunciation practice: hear and say any word",
    ],
    priceCta: "See pricing and order",
    priceLarger: "Need more than 1,000 students? Contact us about district plans.",
    faqTag: "FAQ",
    faqH2: "Questions principals ask before they order.",
    faq: [
      {
        q: "If there are no logins, how do I know which student searched what?",
        a: "The teacher pre-loads a roster of first names in the dashboard. When a student visits the classroom URL, they pick their name with one click. Every search is tagged to that name. No email, no password, no PII is collected.",
      },
      {
        q: "Is this COPPA-safe? Will I get a parent complaint?",
        a: "Yes. Gadit collects no student personal information at all. No account creation, no email collection, no birthdays, no IDs. There is no data to misuse. The architecture comfortably exceeds COPPA, GDPR-K, and Israeli student privacy law.",
      },
      {
        q: "Do students need to install an app?",
        a: "No. Any browser works. Students visit gadit.app/c/CODE on the classroom computer (or any device with a browser). No app store, no IT involvement.",
      },
      {
        q: "Does this require IT or SSO setup?",
        a: "No. A principal or grade coordinator creates the classroom in two minutes and shares the code with teachers. IT is not involved at any step.",
      },
      {
        q: "What does the dashboard actually show?",
        a: "Each student's word searches with timestamps, the words the class searched most this week, and patterns of repeated lookups that signal fragile understanding. You see the real classroom comprehension data, not vague engagement metrics.",
      },
      {
        q: "Can it be used outside class hours?",
        a: "Classroom codes are bound to the school's active hours (default Sunday-Thursday 7:30-15:00, configurable). Outside that window the code gives basic dictionary access but no extended features. This prevents the school code from becoming a free 24/7 substitute for the Family tier.",
      },
      {
        q: "What if my school has more than 500 students?",
        a: "Pick by student count: up to 100 students is $97/month, up to 500 is $297/month, and up to 1,000 is $497/month. For more than 1,000 students or multi-site districts, contact us for a custom plan.",
      },
      {
        q: "How does Gadit explain a word? Is it just a translation?",
        a: "Gadit is not a translation dictionary. Gadit defines and explains words. For each word it gives every meaning, three example sentences per meaning, etymology, and a context-aware mode where students paste the sentence and Gadit picks the right meaning. The student's UI is in their language, but the explanation depth is the same in every UI language.",
      },
    ],
    finalH2: "Stop the silent failure mode.",
    finalBody: "Give your teachers the tool to see exactly what their class doesn't understand. Getting started takes 2 minutes. No IT, no procurement, no parent forms.",
    finalCta: "See pricing and order",
    finalNote: "Pay annually by bank transfer against a tax invoice. No tender needed.",
    mockupRoster: "Class roster, 22 students",
    mockupSearches: "Most searched this week",
    mockupStudent1: "Maya searched photosynthesis",
    mockupStudent2: "Yossi searched mitochondria ×2",
    mockupStudent3: "Noa searched democracy",
    mockupWordExample: "photosynthesis",
    mockupExampleDef: "The process by which green plants use sunlight to convert water and carbon dioxide into food.",
    mockupExampleEx: "Photosynthesis takes place mostly in the leaves of the plant.",
  },
  he: {
    heroH1: "כל תלמיד מבין את השיעור.",
    heroSub: "כל מילה קשה, ב-30+ שפות, מוסברת מיד.",
    heroCta: "לפרטים ולהזמנה",
    heroPriceChip: "מ-₪3,490 לשנה",
    heroTrust: "בשירות עצמי. אפשר לבטל בכל רגע.",
    probTag: "הבעיה",
    probH2: "תלמיד שלא מבין מילה לא יכול להבין את המשפט.",
    probBody1: "תלמיד מפספס מילה. לא מרים את היד. חושב שהוא בערך מבין. המורה ממשיכה הלאה. חמש מילים אחר כך, הפסקה מטושטשת. חמש פסקאות אחר כך, השיעור אבוד.",
    probBody2: "רוב התלמידים שנופלים מאחור אינם פחות חכמים. יש להם ערימה של מילים שלא הבינו עד הסוף. כל מילה חדשה שמתבססת על הערימה מגדילה את הפער. הסיבה בלתי נראית למורה.",
    probCallout1Title: "פער שמתעצם",
    probCallout1Body: "מילים שלא הובנו בונות חומה בלתי נראית לכל שיעור עתידי.",
    probCallout2Title: "זמן שהולך לאיבוד",
    probCallout2Body: "מורים מאבדים 5 עד 10 דקות בכל שיעור על הסברי מילים.",
    probCallout3Title: "הניתוק השקט",
    probCallout3Body: "תלמידים מתנתקים כשפסקה מכילה יותר מדי מילים לא מוכרות.",
    howTag: "איך זה עובד",
    howH2: "הקמה ב-2 דקות. בלי צורך במחשוב.",
    howSub: "אותו דפוס של קוד-כיתה חסר חיכוך שכבר עובד במשחקי חידון, רק לשם הבנת מילים.",
    howStep1Title: "יצירת קוד כיתה",
    howStep1Body: "המנהל או רכז השכבה יוצרים כיתה בדשבורד. המערכת מייצרת קוד בן 6 תווים. מדפיסים על מדבקה ומדביקים על מחשב הכיתה.",
    howStep2Title: "תלמידים מצטרפים בלי חשבון",
    howStep2Body: "התלמידים נכנסים ל-gadit.app/c/CODE בכל דפדפן, בוחרים את השם שלהם מהרשימה (קליק אחד), ומתחילים להקליד מילים. בלי התקנה, בלי מייל, בלי סיסמה.",
    howStep3Title: "המורה רואה מה הכיתה חיפשה",
    howStep3Body: "כל חיפוש נכנס לדשבורד, מתוייג עם שם התלמיד. אפשר לראות מה כל תלמיד חיפש, מתי, ועם אילו מילים הכיתה כולה התקשתה.",
    teacherTag: "מבט המורה",
    teacherH2: "הדשבורד שחיכית לו.",
    teacherSub: "לא מדדי מעורבות מעורפלים. מילים ספציפיות, תלמידים ספציפיים, רגעים ספציפיים.",
    teacherB1: "היסטוריית חיפוש לכל תלמיד עם חותמת זמן",
    teacherB2: "המילים שכל הכיתה חיפשה השבוע",
    teacherB3: "חיפושים חוזרים שמסמנים הבנה שברירית",
    teacherB4: "סינון לפי תאריך, תלמיד או מילה",
    privTag: "פרטיות מובנית בארכיטקטורה",
    privH2: "שקיפות מלאה למורה. אפס סיכון נתונים לבית הספר.",
    privSub: "איננו אוספים נתונים אישיים על תלמידים. לא כי אנחנו מסתירים אותם היטב, אלא כי איננו אוספים אותם בכלל. הארכיטקטורה היא הציות.",
    privPoint1: "בלי חשבונות תלמידים. בלי מיילים, בלי סיסמאות, בלי תעודות זהות.",
    privPoint2: "שום מידע אישי לא יוצא מבית הספר. החיפושים מתויגים רק לפי שם מהרשימה.",
    privPoint3: "קודי כיתה עובדים רק בשעות בית הספר. ניתן להגדיר לכל בית ספר.",
    privPoint4: "עומד בחוק הגנת הפרטיות הישראלי ובתקני הפרטיות המחמירים בעולם.",
    privKahoot: "הצטרפות פשוטה כמו במשחק חידון. נבנה להבנת מילים ולנראות למורה.",
    priceTag: "מחירים",
    priceH2: "תוכניות ומחירים, לפי גודל בית הספר.",
    priceSub: "ממלאים טופס קצר, ואנחנו פותחים את בית הספר ושולחים חשבונית מס. תשלום שנתי בהעברה בנקאית או בהזמנת רכש.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "עד 100 תלמידים",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "עד 500 תלמידים",
    priceIncludesTitle: "כל התוכניות כוללות",
    priceIncludes: [
      "כיתות ללא הגבלה",
      "דשבורד מורה מלא",
      "רשימת בחירת שם תלמיד",
      "קודי כיתה תחומים בזמן",
      "ממשק תלמיד ב-30+ שפות",
      "הזמנה שנתית פשוטה, מתחת לסף הרכש",
      "תרגול הגייה: לשמוע כל מילה ולהגיד אותה",
    ],
    priceCta: "לפרטים ולהזמנה",
    priceLarger: "יותר מ-1,000 תלמידים? אפשר ליצור קשר לתוכנית מותאמת.",
    faqTag: "שאלות נפוצות",
    faqH2: "מה מנהלים שואלים לפני שמזמינים.",
    faq: [
      {
        q: "אם אין התחברות, איך אדע איזה תלמיד חיפש מה?",
        a: "המורה טוענת מראש רשימה של שמות פרטיים בדשבורד. כשהתלמיד נכנס לכתובת הכיתה, הוא בוחר את השם שלו בקליק אחד. כל חיפוש מתוייג לאותו שם. בלי מייל, בלי סיסמה, בלי שום מידע אישי.",
      },
      {
        q: "האם זה עומד בדרישות הפרטיות? אקבל תלונת הורים?",
        a: "כן. Gadit לא אוסף שום מידע אישי על תלמידים. בלי יצירת חשבון, בלי איסוף מייל, בלי תאריכי לידה, בלי תעודות. אין נתונים שאפשר לעשות בהם שימוש לרעה. המערכת עומדת בנוחות בחוק הגנת הפרטיות הישראלי ובתקני הפרטיות המחמירים בעולם.",
      },
      {
        q: "האם תלמידים צריכים להתקין אפליקציה?",
        a: "לא. כל דפדפן עובד. התלמידים נכנסים לכתובת הכיתה על מחשב הכיתה (או על כל מכשיר עם דפדפן). בלי חנות אפליקציות, בלי צורך במחשוב.",
      },
      {
        q: "האם צריך התקנה טכנית מסובכת?",
        a: "לא. המנהל או רכז השכבה יוצרים כיתה בשתי דקות ומשתפים את הקוד עם המורים. אין צורך במעורבות של צוות מחשוב בשום שלב.",
      },
      {
        q: "מה הדשבורד באמת מראה?",
        a: "חיפושי המילים של כל תלמיד עם חותמת זמן, המילים שהכיתה חיפשה הכי הרבה השבוע, ודפוסים של חיפושים חוזרים שמסמנים הבנה שברירית. נתוני הבנה אמיתיים של הכיתה, לא מדדי מעורבות מעורפלים.",
      },
      {
        q: "האם זה עובד מחוץ לשעות הלימודים?",
        a: "קודי כיתה תחומים לשעות הפעילות של בית הספר (ברירת מחדל א' עד ה', 7:30 עד 15:00, ניתן להגדיר). מחוץ לחלון הזה הקוד נותן גישה למילון בסיסי בלבד. זה מונע מהקוד של בית הספר להפוך לתחליף חינמי של תוכנית Family ב-24/7.",
      },
      {
        q: "מה אם בית הספר שלי מעל 1,000 תלמידים?",
        a: "שלוש חבילות לפי מספר התלמידים: עד 100 תלמידים ₪349 לחודש, עד 500 תלמידים ₪649 לחודש, ועד 1,000 תלמידים ₪949 לחודש (או ₪3,490 / ₪6,490 / ₪9,490 לשנה). מעל 1,000 תלמידים או לרשתות בתי ספר, אפשר ליצור קשר להצעת מחיר מותאמת.",
      },
      {
        q: "איך Gadit מסביר מילה? זה תרגום?",
        a: "Gadit הוא לא מילון תרגום. Gadit מגדיר ומסביר מילים. לכל מילה הוא נותן את כל המשמעויות, שלושה משפטי דוגמה לכל משמעות, אטימולוגיה, ומצב הקשרי שבו התלמיד מדביק את המשפט ו-Gadit בוחר את המשמעות הנכונה. ממשק התלמיד בשפה שלו, אבל עומק ההסבר זהה בכל ממשק.",
      },
    ],
    finalH2: "כאן נעצר כשל הלמידה השקט.",
    finalBody: "המורים שלך מקבלים את הכלי לראות בדיוק מה הכיתה לא מבינה. ההתחלה לוקחת 2 דקות. בלי מחשוב, בלי רכש מסובך, בלי טפסי הורים.",
    finalCta: "לפרטים ולהזמנה",
    finalNote: "תשלום שנתי בהעברה בנקאית מול חשבונית מס. אין צורך במכרז.",
    mockupRoster: "רשימת כיתה, 22 תלמידים",
    mockupSearches: "הכי מחופשים השבוע",
    mockupStudent1: "מאיה חיפשה פוטוסינתזה",
    mockupStudent2: "יוסי חיפש מיטוכונדריה ×2",
    mockupStudent3: "נועה חיפשה דמוקרטיה",
    mockupWordExample: "פוטוסינתזה",
    mockupExampleDef: "תהליך שבו צמחים ירוקים משתמשים באור השמש להפיכת מים ופחמן דו-חמצני למזון.",
    mockupExampleEx: "הפוטוסינתזה מתרחשת בעיקר בעלים של הצמח.",
  },
};

/** The other languages of COPY, one file each in copy/ (loaded by the page's gate). */
export const SCH_COPY_PACK = makePack<T>({}, {
  "zu": () => import("./copy/zu"),
  "xh": () => import("./copy/xh"),
  "nso": () => import("./copy/nso"),
  "tn": () => import("./copy/tn"),
  "st": () => import("./copy/st"),
  "ts": () => import("./copy/ts"),
  "ss": () => import("./copy/ss"),
  "ve": () => import("./copy/ve"),
  "nr": () => import("./copy/nr"),
  "el": () => import("./copy/el"),
  "uk": () => import("./copy/uk"),
  "tr": () => import("./copy/tr"),
  "pl": () => import("./copy/pl"),
  "fa": () => import("./copy/fa"),
  "id": () => import("./copy/id"),
  "ru": () => import("./copy/ru"),
  "nl": () => import("./copy/nl"),
  "ar": () => import("./copy/ar"),
  "cs": () => import("./copy/cs"),
  "sk": () => import("./copy/sk"),
  "hi": () => import("./copy/hi"),
  "am": () => import("./copy/am"),
  "es": () => import("./copy/es"),
  "pt": () => import("./copy/pt"),
  "fr": () => import("./copy/fr"),
  "de": () => import("./copy/de"),
  "it": () => import("./copy/it"),
  "ja": () => import("./copy/ja"),
  "vi": () => import("./copy/vi"),
  "fil": () => import("./copy/fil"),
  "af": () => import("./copy/af"),
  "sw": () => import("./copy/sw"),
  "zh-CN": () => import("./copy/zh-CN"),
  "zh-TW": () => import("./copy/zh-TW"),
  "ko": () => import("./copy/ko"),
  "th": () => import("./copy/th"),
  "bn": () => import("./copy/bn"),
  "da": () => import("./copy/da"),
  "hu": () => import("./copy/hu"),
});
// (more languages moved to copy/<lang>.ts, 2026-10-31)


/**
 * Three school-size tiers (Gadi 2026-08-04, after the pricing council).
 * Prices are in shekels — the Israeli school market is the primary
 * channel and buys in ₪ with a tax invoice; international currency
 * display is a follow-up tied to the billing-routing work. The middle
 * All three tiers are equal weight: the right one is decided by school
 * size, not preference, so there is no "recommended" tier (Gadi
 * 2026-08-04). Each price is a NEW Stripe price, so the three env vars
 * must be set once the Stripe products exist.
 */
// Annual pricing in ₪ (Gadi 2026-08-08, after the market research: Israeli
// schools buy a full year up front, by bank transfer against a tax invoice,
// not by monthly card). ×10 the old monthly = two months free.
// Hebrew ₪ tiers. Monthly-first display (Gadi 2026-08-14: show the small
// per-month number, not the scary annual sum), with a yearly option at
// ×10 the monthly = two months free. Actual payment for Israeli schools is
// still the annual bank-transfer / tax-invoice order form below.
const SCHOOL_TIERS = [
  { key: "small" as const,  monthly: 349, yearly: 3490 },
  { key: "medium" as const, monthly: 649, yearly: 6490 },
  { key: "large" as const,  monthly: 949, yearly: 9490 },
];

// Self-serve USD pricing for the international (non-Hebrew) Schools page.
// Hebrew keeps the ₪ annual bank-transfer order form (Israeli schools buy
// against a tax invoice); every other language buys by card via /checkout
// like the rest of the app. Gadi 2026-08-14: a single global USD price is
// what makes it read as a modern international platform, and monthly-first
// (with a yearly option) means a principal sees the small per-month number,
// not a scary annual sum. Amounts mirror the live Stripe SKUs.
// International USD pricing = the shared 3-tier ladder ($97/$297/$497) from
// @/lib/schools-prices, the same source /pricing uses (Gadi 2026-08-15,
// raised from the old flat $69/$149). Hebrew keeps the ₪ order form below.

/** Small labels in the classic Schools landing (2026-10-10 i18n sweep). */
const LANDING_BITS: Record<string, { step: (n: number) => string; example: string; moreLangs: string }> = {
  en: { step: (n) => `Step ${n}`, example: "Example", moreLangs: "+ 11 more languages" },
  he: { step: (n) => `שלב ${n}`, example: "דוגמה", moreLangs: "ועוד 11 שפות" },
  ar: { step: (n) => `الخطوة ${n}`, example: "مثال", moreLangs: "و11 لغة أخرى" },
  ru: { step: (n) => `Шаг ${n}`, example: "Пример", moreLangs: "и ещё 11 языков" },
  es: { step: (n) => `Paso ${n}`, example: "Ejemplo", moreLangs: "+ 11 idiomas más" },
  pt: { step: (n) => `Passo ${n}`, example: "Exemplo", moreLangs: "+ 11 outros idiomas" },
  fr: { step: (n) => `Étape ${n}`, example: "Exemple", moreLangs: "+ 11 autres langues" },
  de: { step: (n) => `Schritt ${n}`, example: "Beispiel", moreLangs: "+ 11 weitere Sprachen" },
  cs: { step: (n) => `Krok ${n}`, example: "Příklad", moreLangs: "+ 11 dalších jazyků" },
  sk: { step: (n) => `Krok ${n}`, example: "Príklad", moreLangs: "+ 11 ďalších jazykov" },
  it: { step: (n) => `Passo ${n}`, example: "Esempio", moreLangs: "+ altre 11 lingue" },
  ja: { step: (n) => `ステップ ${n}`, example: "例", moreLangs: "ほか11言語" },
  hi: { step: (n) => `चरण ${n}`, example: "उदाहरण", moreLangs: "+ 11 और भाषाएँ" },
  am: { step: (n) => `ደረጃ ${n}`, example: "ምሳሌ", moreLangs: "+ ሌሎች 11 ቋንቋዎች" },
  uk: { step: (n) => `Крок ${n}`, example: "Приклад", moreLangs: "і ще 11 мов" },
  tr: { step: (n) => `Adım ${n}`, example: "Örnek", moreLangs: "+ 11 dil daha" },
  pl: { step: (n) => `Krok ${n}`, example: "Przykład", moreLangs: "+ 11 innych języków" },
  fa: { step: (n) => `مرحله ${n}`, example: "مثال", moreLangs: "و 11 زبان دیگر" },
  id: { step: (n) => `Langkah ${n}`, example: "Contoh", moreLangs: "+ 11 bahasa lainnya" },
  nl: { step: (n) => `Stap ${n}`, example: "Voorbeeld", moreLangs: "+ 11 andere talen" },
  el: { step: (n) => `Βήμα ${n}`, example: "Παράδειγμα", moreLangs: "+ 11 ακόμη γλώσσες" },
  zu: { step: (n) => `Isinyathelo ${n}`, example: "Isibonelo", moreLangs: "+ nezinye izilimi ezingu-11" },
  xh: { step: (n) => `Inyathelo ${n}`, example: "Umzekelo", moreLangs: "+ ezinye iilwimi ezili-11" },
  nso: { step: (n) => `Kgato ya ${n}`, example: "Mohlala", moreLangs: "+ dipolelo tše dingwe tše 11" },
  tn: { step: (n) => `Kgato ${n}`, example: "Sekai", moreLangs: "+ dipuo tse dingwe di le 11" },
  st: { step: (n) => `Mohato wa ${n}`, example: "Mohlala", moreLangs: "+ dipuo tse ding tse 11" },
  ts: { step: (n) => `Goza ${n}`, example: "Xikombiso", moreLangs: "+ tindzimi tin'wana ta 11" },
  ss: { step: (n) => `Sinyatselo ${n}`, example: "Sibonelo", moreLangs: "+ tilwimi letinye leti-11" },
  ve: { step: (n) => `Tshiṱepe tsha ${n}`, example: "Tsumbo", moreLangs: "+ nyambo dziṅwe dza 11" },
  nr: { step: (n) => `Igadango ${n}`, example: "Isibonelo", moreLangs: "+ amanye amalimi ali-11" },
  vi: { step: (n) => `Bước ${n}`, example: "Ví dụ", moreLangs: "+ 11 ngôn ngữ khác" },
  fil: { step: (n) => `Hakbang ${n}`, example: "Halimbawa", moreLangs: "+ 11 pang wika" },
  af: { step: (n) => `Stap ${n}`, example: "Voorbeeld", moreLangs: "+ 11 ander tale" },
  sw: { step: (n) => `Hatua ya ${n}`, example: "Mfano", moreLangs: "+ lugha nyingine 11" },
  "zh-CN": { step: (n) => `第 ${n} 步`, example: "例句", moreLangs: "还有 11 种语言" },
  "zh-TW": { step: (n) => `第 ${n} 步`, example: "例句", moreLangs: "還有 11 種語言" },
  ko: { step: (n) => `${n}단계`, example: "예문", moreLangs: "+ 11개 언어 더" },
  th: { step: (n) => `ขั้นตอนที่ ${n}`, example: "ตัวอย่าง", moreLangs: "+ อีก 11 ภาษา" },
  bn: { step: (n) => `ধাপ ${n}`, example: "উদাহরণ", moreLangs: "+ আরও 11টি ভাষা" },
  da: { step: (n) => `Trin ${n}`, example: "Eksempel", moreLangs: "+ 11 sprog mere" },
  hu: { step: (n) => `${n}. lépés`, example: "Példa", moreLangs: "+ még 11 nyelv" },
};

type PricingUI = {
  perYear: string;
  orderCta: string;
  plusVat: string;
  netNote: string;
  tiers: { small: string; medium: string; large: string };
};
const PRICING_UI: Record<string, PricingUI> = {
  he: { perYear: "לשנה", orderCta: "לפרטים ולהזמנה",
        plusVat: "+ מע״מ", netNote: "כל המחירים אינם כוללים מע״מ.",
        tiers: { small: "עד 100 תלמידים", medium: "101 עד 500 תלמידים", large: "501 עד 1,000 תלמידים" } },
  en: { perYear: "/ year", orderCta: "Get a quote",
        plusVat: "+ VAT", netNote: "All prices exclude VAT.",
        tiers: { small: "Up to 100 students", medium: "101-500 students", large: "501-1,000 students" } },
  ar: { perYear: "سنويًا", orderCta: "لطلب عرض سعر",
        plusVat: "+ ض.ق.م", netNote: "جميع الأسعار لا تشمل ضريبة القيمة المضافة.",
        tiers: { small: "حتى 100 طالب", medium: "101-500 طالب", large: "501-1,000 طالب" } },
  ru: { perYear: "в год", orderCta: "Запросить счёт",
        plusVat: "+ НДС", netNote: "Все цены указаны без НДС.",
        tiers: { small: "до 100 учеников", medium: "101-500 учеников", large: "501-1,000 учеников" } },
};

// Labels for the international USD pricing block (non-Hebrew). Native for
// en/ar/ru; the other 30+ languages fall back to English, same he+en-primary
// pattern as PRICING_UI above. Plan names ("Schools" / "Schools Large") stay
// in English everywhere, like every other Gadit tier.
export type UsdPricingUI = {
  h2: string;
  billedMonthly: string;
  billedYearly: string;
  yearlySave: string;
  perMonth: string;
  perYear: string;
  smallName: string;
  largeName: string;
  smallStudents: string;
  largeStudents: string;
  cta: string;
  afterTrial: string;
};
const USD_PRICING_UI: Record<string, UsdPricingUI> = {
  en: { h2: "One price, every school, everywhere.",
        billedMonthly: "Monthly", billedYearly: "Yearly", yearlySave: "2 months free",
        perMonth: "/ month", perYear: "/ year",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "Up to 100 students", largeStudents: "Up to 500 students",
        cta: "Start free trial", afterTrial: "14-day free trial, cancel anytime." },
  he: { h2: "מחיר פשוט, לכל בית ספר, בכל מקום.",
        billedMonthly: "חודשי", billedYearly: "שנתי", yearlySave: "חודשיים חינם",
        perMonth: "/ חודש", perYear: "/ שנה",
        smallName: "Schools", largeName: "Schools Large",
        smallStudents: "עד 100 תלמידים", largeStudents: "עד 500 תלמידים",
        cta: "להתחיל ניסיון חינם", afterTrial: "14 יום ניסיון חינם, אפשר לבטל בכל עת." },
};

/** The other languages of USD_PRICING_UI, one file each in usd-pricing/ (loaded by the page's gate). */
export const SCH_USD_PACK = makePack<UsdPricingUI>({}, {
  "ar": () => import("./usd-pricing/ar"),
  "ru": () => import("./usd-pricing/ru"),
  "es": () => import("./usd-pricing/es"),
  "pt": () => import("./usd-pricing/pt"),
  "fr": () => import("./usd-pricing/fr"),
  "de": () => import("./usd-pricing/de"),
  "cs": () => import("./usd-pricing/cs"),
  "sk": () => import("./usd-pricing/sk"),
  "it": () => import("./usd-pricing/it"),
  "ja": () => import("./usd-pricing/ja"),
  "hi": () => import("./usd-pricing/hi"),
  "am": () => import("./usd-pricing/am"),
  "uk": () => import("./usd-pricing/uk"),
  "tr": () => import("./usd-pricing/tr"),
  "pl": () => import("./usd-pricing/pl"),
  "fa": () => import("./usd-pricing/fa"),
  "id": () => import("./usd-pricing/id"),
  "nl": () => import("./usd-pricing/nl"),
  "el": () => import("./usd-pricing/el"),
  "zu": () => import("./usd-pricing/zu"),
  "xh": () => import("./usd-pricing/xh"),
  "nso": () => import("./usd-pricing/nso"),
  "tn": () => import("./usd-pricing/tn"),
  "st": () => import("./usd-pricing/st"),
  "ts": () => import("./usd-pricing/ts"),
  "ss": () => import("./usd-pricing/ss"),
  "ve": () => import("./usd-pricing/ve"),
  "nr": () => import("./usd-pricing/nr"),
  "vi": () => import("./usd-pricing/vi"),
  "fil": () => import("./usd-pricing/fil"),
  "af": () => import("./usd-pricing/af"),
  "sw": () => import("./usd-pricing/sw"),
  "zh-CN": () => import("./usd-pricing/zh-CN"),
  "zh-TW": () => import("./usd-pricing/zh-TW"),
  "ko": () => import("./usd-pricing/ko"),
  "th": () => import("./usd-pricing/th"),
  "bn": () => import("./usd-pricing/bn"),
  "da": () => import("./usd-pricing/da"),
  "hu": () => import("./usd-pricing/hu"),
});
// (more languages moved to usd-pricing/<lang>.ts, 2026-10-31)


/**
 * Cross-language flagship section copy. Rendered from its own object so the
 * 14 main `T` dicts stay untouched; he/en/ar/ru are native, everything else
 * falls back to English (Gadi's he+en-primary pattern). The one goal is
 * comprehension of the material; cross-language is the strongest tool for
 * it, NOT the whole identity — so the copy frames it as "for every student
 * who hits a hard word", with multilingual students as the sharpest case.
 */
export type XLang = {
  tag: string;
  h2: string;
  body1: string;
  body2: string;
  keyline: string;
  demoWordLabel: string;
  demoMeaningLabel: string;
  note: string;
};
const XLANG: Record<string, XLang> = {
  en: {
    tag: "Cross-language",
    h2: "And when the word is in a language the student hasn't fully mastered?",
    body1: "A child reads the lesson in the language of instruction but still thinks in Russian, Amharic, or Arabic. They hit a word they don't know, don't raise their hand, and drown quietly while the class moves on.",
    body2: "In Gadit, that student looks the word up and gets the full meaning in their own language, then keeps reading the lesson. The comprehension barrier is gone in one tap.",
    keyline: "Your multilingual students stop falling behind in every other subject, because they can finally read the material.",
    demoWordLabel: "The lesson says",
    demoMeaningLabel: "The student understands",
    note: "This is not only for new immigrants. It is for every student who hits a hard word, in any of 30+ languages. The goal is understanding the material; this is the strongest tool for it.",
  },
  he: {
    tag: "חוצה שפות",
    h2: "ומה קורה כשהמילה בשפה שהתלמיד עדיין לא שולט בה?",
    body1: "ילד קורא את החומר בשפת ההוראה, אבל עדיין חושב ברוסית, באמהרית או בערבית. הוא נתקל במילה שאינו מכיר, לא מרים יד, וטובע בשקט בזמן שהכיתה ממשיכה הלאה.",
    body2: "ב-Gadit אותו תלמיד מחפש את המילה ומקבל את המשמעות המלאה בשפה שלו, וממשיך לקרוא את השיעור. מחסום ההבנה נעלם בהקשה אחת.",
    keyline: "התלמידים הרב-לשוניים שלך מפסיקים לפגר בכל מקצוע אחר, כי סוף סוף הם מצליחים לקרוא את החומר.",
    demoWordLabel: "בשיעור כתוב",
    demoMeaningLabel: "התלמיד מבין",
    note: "זה לא רק לעולים חדשים. זה לכל תלמיד שנתקל במילה קשה, בכל אחת מ-30+ שפות. המטרה היא הבנת החומר, וזה הכלי החזק ביותר עבורה.",
  },
};

/** The other languages of XLANG, one file each in xlang/ (loaded by the page's gate). */
export const SCH_XLANG_PACK = makePack<XLang>({}, {
  "ar": () => import("./xlang/ar"),
  "ru": () => import("./xlang/ru"),
  "es": () => import("./xlang/es"),
  "pt": () => import("./xlang/pt"),
  "fr": () => import("./xlang/fr"),
  "de": () => import("./xlang/de"),
  "cs": () => import("./xlang/cs"),
  "sk": () => import("./xlang/sk"),
  "it": () => import("./xlang/it"),
  "ja": () => import("./xlang/ja"),
  "hi": () => import("./xlang/hi"),
  "am": () => import("./xlang/am"),
  "uk": () => import("./xlang/uk"),
  "tr": () => import("./xlang/tr"),
  "pl": () => import("./xlang/pl"),
  "fa": () => import("./xlang/fa"),
  "id": () => import("./xlang/id"),
  "nl": () => import("./xlang/nl"),
  "el": () => import("./xlang/el"),
  "zu": () => import("./xlang/zu"),
  "xh": () => import("./xlang/xh"),
  "nso": () => import("./xlang/nso"),
  "tn": () => import("./xlang/tn"),
  "st": () => import("./xlang/st"),
  "ts": () => import("./xlang/ts"),
  "ss": () => import("./xlang/ss"),
  "ve": () => import("./xlang/ve"),
  "nr": () => import("./xlang/nr"),
  "vi": () => import("./xlang/vi"),
  "fil": () => import("./xlang/fil"),
  "af": () => import("./xlang/af"),
  "sw": () => import("./xlang/sw"),
  "zh-CN": () => import("./xlang/zh-CN"),
  "zh-TW": () => import("./xlang/zh-TW"),
  "ko": () => import("./xlang/ko"),
  "th": () => import("./xlang/th"),
  "bn": () => import("./xlang/bn"),
  "da": () => import("./xlang/da"),
  "hu": () => import("./xlang/hu"),
});
// (more languages moved to xlang/<lang>.ts, 2026-10-31)


// Fixed cross-language demo — same content in every UI language (like the
// teacher mockup). A word from the lesson, understood in three of the
// student's languages. Shows the superpower concretely without depending
// on the viewer's language.
const XLANG_DEMO = {
  word: "photosynthesis",
  meanings: [
    { lang: "Русский", text: "Процесс, которым растения превращают свет в пищу." },
    { lang: "العربية", text: "العملية التي تحوّل بها النباتات الضوء إلى غذاء.", dir: "rtl" as const },
    { lang: "አማርኛ", text: "ተክሎች ብርሃንን ወደ ምግብ የሚቀይሩበት ሂደት።" },
  ],
};

/**
 * The page's tables keep only Hebrew and English here; every other language is
 * its own file (copy/, xlang/, usd-pricing/). This gate loads the page's
 * language first. No hooks of its own (see LangGate).
 */
function SchGate({ lang, children }: { lang: string; children: React.ReactNode }) {
  useLangPacks([SCH_COPY_PACK, SCH_XLANG_PACK, SCH_USD_PACK] as Pack<unknown>[], lang);
  return children;
}

export function SchoolsLandingClient(props: { standalone?: boolean } = {}) {
  const { lang } = useLang();
  return (
    <SchGate lang={lang}>
      <SchoolsLanding {...props} />
    </SchGate>
  );
}

function SchoolsLanding({ standalone = false }: { standalone?: boolean } = {}) {
  const { user, schoolId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const t = COPY[lang] ?? SCH_COPY_PACK.data[lang] ?? COPY.en;
  const xt = XLANG[lang] ?? SCH_XLANG_PACK.data[lang] ?? XLANG.en;
  const pu = PRICING_UI[lang] ?? PRICING_UI.en;
  const bits = LANDING_BITS[lang] ?? LANDING_BITS.en;
  const upu = USD_PRICING_UI[lang] ?? SCH_USD_PACK.data[lang] ?? USD_PRICING_UI.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Monthly-first billing toggle for the international USD pricing (non-Hebrew).
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  // Non-Hebrew schools buy by card, self-serve, like the rest of the app:
  // pick the tier's Stripe price for the selected billing cycle, gate anon
  // users through the signup modal, then land them in /checkout (Payment
  // Element, their own language). Mirrors PricingClient.startCheckout.
  function startSchoolsCheckout(priceId: string) {
    if (!priceId) {
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
  }
  function clickSchoolsTier(tier: SchoolsTierKey) {
    const t = SCHOOLS_TIERS[tier];
    const priceId = billing === "yearly" ? t.yearly : t.monthly;
    promptLogin({ mode: "signup", onSuccess: () => startSchoolsCheckout(priceId) });
  }

  // Every "See pricing and order" CTA opens the payment page DIRECTLY
  // instead of detouring through /pricing — Gadi 2026-07-08: a principal
  // who already clicked "start trial" on the schools page shouldn't be
  // dropped on a general pricing page to hunt for the button again.
  // Since 2026-07-12 that payment page is the in-app /checkout (Payment
  // Element, user's own language) rather than hosted Stripe Checkout.
  // Anonymous visitors get the signup modal first, then flow straight
  // into checkout (same pattern as PricingClient). checkout_started
  // fires inside /checkout (no duplicates).
  // Israeli schools pay a full year up front by bank transfer against a
  // tax invoice, not by card, so the price cards scroll to the order box
  // instead of opening a checkout.
  function scrollToOrder() {
    document.getElementById("schools-order")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  // Hero + final CTAs don't name a plan, so sending them straight to a
  // specific checkout would silently pick the cheapest tier for the user.
  // Gadi 2026-07-08: scroll them to the in-page pricing section where
  // the Schools / Schools Large choice is explicit; only the two price
  // cards go directly to checkout.
  function scrollToPricing() {
    document.getElementById("schools-pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Auto-redirect for school owners REMOVED (2026-06-29): Gadi wants
  // school owners to be able to see the landing too, e.g. for QA or to
  // share the URL with a colleague. Owners who tap a trial CTA are
  // routed to their dashboard by clickTrial above.

  // Localized "you already have Schools" banner copy. Shown to logged-in
  // school owners so they have a one-click path to their dashboard
  // without losing access to the landing page itself.
  const ownerBannerCopy: Record<string, { text: string; cta: string }> = {
    en: { text: "You're on the Schools plan.", cta: "Go to my dashboard →" },
    he: { text: "מנוי בתי הספר פעיל אצלך.", cta: "מעבר ללוח הבקרה ←" },
    ar: { text: "خطة Schools نشطة لديك.", cta: "إلى لوحة التحكم ←" },
    ru: { text: "У вас активен тариф Schools.", cta: "В мою панель →" },
    cs: { text: "Máte aktivní tarif Schools.", cta: "Přejít na panel →" },
    sk: { text: "Máte aktívny tarif Schools.", cta: "Prejsť na panel →" },
    hi: { text: "आपके पास Schools प्लान सक्रिय है।", cta: "मेरे डैशबोर्ड पर जाएँ →" },
    am: { text: "የ Schools ዕቅድ ገቢር ነው።", cta: "ወደ ዳሽቦርዴ ሂድ →" },
    es: { text: "Tienes el plan Schools activo.", cta: "Ir a mi panel →" },
    pt: { text: "Você tem o plano Schools ativo.", cta: "Ir ao meu painel →" },
    fr: { text: "Vous êtes sur le plan Schools.", cta: "Aller à mon tableau de bord →" },
    de: { text: "Sie haben den Schools-Tarif aktiv.", cta: "Zum Dashboard →" },
    it: { text: "Hai il piano Schools attivo.", cta: "Vai alla mia dashboard →" },
    ja: { text: "Schoolsプランがアクティブです。", cta: "ダッシュボードへ →" },
    uk: { text: "У вас активний тариф Schools.", cta: "До моєї панелі →" },
    tr: { text: "Schools planınız etkin.", cta: "Panelime git →" },
    pl: { text: "Masz aktywny plan Schools.", cta: "Przejdź do panelu →" },
    fa: { text: "طرح Schools برای شما فعال است.", cta: "رفتن به داشبورد من ←" },
    id: { text: "Paket Schools Anda aktif.", cta: "Ke dasbor saya →" },
    nl: { text: "Je hebt het Schools-abonnement.", cta: "Naar mijn dashboard →" },
    el: { text: "Έχετε ενεργό το πρόγραμμα Schools.", cta: "Στον πίνακά μου →" },
    zu: { text: "Uhlelo lwe-Schools luyasebenza kuwe.", cta: "Iya kudeshibhodi yami →" },
  xh: { text: "Ukwisicwangciso se-Schools.", cta: "Yiya kwibhodi yam →" },
  nso: { text: "O lenaneong la Schools.", cta: "Eya letlakaleng la ka la taolo →" },
  tn: { text: "O mo leanong la Schools.", cta: "Ya kwa lebotong la me →" },
  st: { text: "O moralong wa Schools.", cta: "Eya leqepheng la ka la taolo →" },
  ts: { text: "Mi le ka pulani ya Schools.", cta: "Ya eka dashibodo ya mina →" },
  ss: { text: "Ukulihlelo le-Schools.", cta: "Hamba elibhodini lami →" },
  ve: { text: "Ni kha pulane ya Schools.", cta: "Iyani kha tshikirini tshanga →" },
  nr: { text: "Usehlelweni le-Schools.", cta: "Iya edeshibhodini yami →" },
    vi: { text: "Bạn đang dùng gói Schools.", cta: "Đến bảng điều khiển →" },
    fil: { text: "Aktibo ang Schools plan mo.", cta: "Pumunta sa dashboard ko →" },
    af: { text: "Jy is op die Schools-plan.", cta: "Gaan na my paneelbord →" },
    sw: { text: "Mpango wa Schools uko hai kwako.", cta: "Nenda kwenye dashibodi yangu →" },
    "zh-CN": { text: "你的 Schools 方案已启用。", cta: "前往我的控制台 →" },
    "zh-TW": { text: "你的 Schools 方案已啟用。", cta: "前往我的控制台 →" },
    ko: { text: "Schools 요금제를 이용 중입니다.", cta: "내 대시보드로 →" },
    th: { text: "คุณใช้แพ็กเกจ Schools อยู่", cta: "ไปที่แดชบอร์ดของฉัน →" },
    bn: { text: "আপনার Schools প্ল্যান সক্রিয় আছে।", cta: "আমার ড্যাশবোর্ডে যান →" },
    da: { text: "Du har Schools-abonnementet.", cta: "Gå til mit dashboard →" },
    hu: { text: "A Schools csomagod aktív.", cta: "Irány az irányítópult →" },
  };
  const banner = ownerBannerCopy[lang] ?? ownerBannerCopy.en;

  return (
    <div className="wordbook wb-shell-page wb-schools-landing" dir={dir}>
      {/* Owner banner — shown only to users with an active Schools sub.
          Visible just below the topbar, above the hero, so the path to
          their dashboard is one click away without forcing a redirect. */}
      {schoolId && (
        <div className="wb-schools-owner-banner">
          <span>{banner.text}</span>
          <Link href={href("/schools/manage")} className="wb-schools-owner-banner-cta">
            {banner.cta}
          </Link>
        </div>
      )}

      {/* Full Gadit topbar — identical to the homepage so brand chrome
          stays consistent across surfaces. "Schools" is highlighted as
          the active page. Smart routing: for users who already own a
          schools subscription, the Schools link points at their
          dashboard so they don't get bounced from the marketing copy. */}
      {!standalone && (
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="schools" />
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/" currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
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
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/" currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
          <LangSwitchMobile />
          <WbShellBurger active="schools" />
        </div>
      </header>
      )}
      {standalone && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 22px",
            maxWidth: 1180,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {lang === "he" ? (
            /* Hebrew shows a big centered Gadit lockup below (like the
               families page), so the corner wordmark is omitted here. */
            <span />
          ) : (
            <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
              Gad<span className="wb-wordmark-it">it</span>
            </Link>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShareButton
              url="https://www.gadit.app/schools"
              currentPage
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <LangSwitcher variant="muted" />
          </div>
        </div>
      )}

      {lang === "he" ? (
      <>
      {/* ═══════════════════════════════════════════════════════════════
          HEBREW REBUILD (2026-08-08) — principal-facing sales page.
          Two ways Gadit works in a school are shown explicitly: on the
          board for the whole class, and personally per student in their
          own language. Plus word sets and games. Branded teal/amber
          bands + real classroom images. Other languages keep the
          original mockup sections in the `else` branch below.
          Privacy / pricing / FAQ / final CTA stay shared under the
          ternary (they already read the Hebrew copy correctly).
          ═══════════════════════════════════════════════════════════ */}

      {/* Centered brand lockup at the very top, like the families page:
          the Gadit wordmark + a one-line tagline pill. */}
      <div style={{ textAlign: "center", padding: "8px 20px 0" }}>
        <Link
          href={href("/")}
          className="wb-wordmark"
          dir="ltr"
          translate="no"
          style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", display: "inline-block" }}
        >
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <div style={{ marginTop: 12 }}>
          <span className="wb-schools-tag">מילון חזותי וחכם לבתי ספר</span>
        </div>
      </div>

      {/* ─── HE 1. HERO ──────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">כל מילה קשה בשיעור נפתחת מיד. על הלוח לכל הכיתה, או אישית לכל תלמיד בשפה שלו.</p>
          <div className="wb-schools-hero-actions">
            <button type="button" className="wb-schools-cta" onClick={scrollToOrder}>
              {t.heroCta}
            </button>
          </div>
          <div className="wb-schools-hero-trust" style={{ marginTop: 14 }}>
            מ-₪349 לחודש · בלי התחברות לתלמידים · בלי התקנה
          </div>
        </div>
        <div className="wb-schools-hero-visual">
          <img src="/schools/hero.webp" alt="" loading="lazy" className="wb-schools-hero-img" />
        </div>
      </section>

      {/* ─── HE 2. THE PROBLEM ───────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-problem" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.probTag}</span>
          <h2 className="wb-schools-h2">{t.probH2}</h2>
          <p className="wb-schools-body">{t.probBody1}</p>
          <p className="wb-schools-body">{t.probBody2}</p>
          <div className="wb-schools-callout-grid">
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">01</div>
              <div className="wb-schools-callout-title">{t.probCallout1Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout1Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">02</div>
              <div className="wb-schools-callout-title">{t.probCallout2Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout2Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">03</div>
              <div className="wb-schools-callout-title">{t.probCallout3Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HE 3. ON THE BOARD, THE WHOLE CLASS ─────────────────── */}
      <section className="wb-schools-section" style={{ background: "#ECFAF9" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">על הלוח, לכל הכיתה</span>
            <h2 className="wb-schools-h2">המורה מקלידה מילה, וכל הכיתה מבינה יחד.</h2>
            <p className="wb-schools-body">
              באמצע השיעור צצה מילה שחצי מהכיתה לא מכירה. במקום לעצור ולהסביר בעל פה, המורה מקלידה אותה ב-Gadit על הלוח, והמילה נפתחת בשלבים שכולם רואים באותו רגע.
            </p>
            <ol className="wb-schools-stages">
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">1</span>המילה, גדולה וברורה על המסך</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">2</span>הסבר בגובה העיניים, בשפה שילד מבין</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">3</span>תמונה שמראה את המשמעות במבט אחד</li>
              <li className="wb-schools-stage"><span className="wb-schools-stage-num">4</span>שלושה משפטי דוגמה שמראים איך משתמשים בה</li>
            </ol>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/steps.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 4. AND PERSONALLY, IN EACH STUDENT'S LANGUAGE ─────── */}
      <section className="wb-schools-section" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-feature is-flipped">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">וגם אישית, בשפה של כל תלמיד</span>
            <h2 className="wb-schools-h2">תלמיד שחושב ברוסית, אמהרית או ערבית, מקבל את התשובה בשפה שלו.</h2>
            <p className="wb-schools-body">
              לא הכל קורה על הלוח. תלמיד שקורא את החומר בעברית אבל עדיין חושב בשפת האם נתקל במילה, לא מרים יד, וטובע בשקט. עכשיו הוא פשוט מחפש אותה לבד, במחשב הכיתה או בטלפון, ומקבל את המשמעות המלאה בשפה שלו.
            </p>
            <p className="wb-schools-body" style={{ fontWeight: 700, color: "#1C1917" }}>
              מחסום ההבנה נעלם בהקשה אחת, והתלמיד ממשיך לקרוא את השיעור עם כל השאר.
            </p>

            {/* Concrete demo: one lesson word, understood in the student's
                own language. Fixed content, UI-translated labels. */}
            <div style={{ marginTop: 22, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 16, padding: "18px 20px", maxWidth: 480 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{xt.demoWordLabel}</div>
              <div dir="ltr" style={{ fontSize: 24, fontWeight: 800, color: "#1C1917", marginBottom: 14, textAlign: "right" }}>{XLANG_DEMO.word}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{xt.demoMeaningLabel}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {XLANG_DEMO.meanings.map((m) => (
                  <div key={m.lang} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, minWidth: 64, fontSize: 13, fontWeight: 700, color: "#92400E" }}>{m.lang}</span>
                    <span dir={m.dir ?? "ltr"} style={{ fontSize: 14, color: "#44403C", lineHeight: 1.5, textAlign: m.dir === "rtl" ? "right" : "left" }}>{m.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #FEF3C7", fontSize: 12, color: "#A16207", fontWeight: 600 }}>
                ועוד 30+ שפות
              </div>
            </div>

          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/cross-personal.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 5. READY-MADE WORD SETS BY SUBJECT ───────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFBEB" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag" style={{ color: "#B45309", background: "rgba(202,138,4,0.12)" }}>מאגר מוכן</span>
            <h2 className="wb-schools-h2">רשימות מילים מוכנות לכל מקצוע.</h2>
            <p className="wb-schools-body">
              לא צריך להכין כלום מראש. לכל מקצוע ולכל שכבה מחכה רשימת מילים בנויה. המורה בוחרת נושא, והמילים החשובות של היחידה כבר שם, מוכנות להקרנה על הלוח או לתרגול אישי.
            </p>
            <div className="wb-schools-subjects">
              <span className="wb-schools-subject">מדעים</span>
              <span className="wb-schools-subject">היסטוריה</span>
              <span className="wb-schools-subject">תנ״ך</span>
              <span className="wb-schools-subject">גאוגרפיה</span>
              <span className="wb-schools-subject">אזרחות</span>
              <span className="wb-schools-subject">ספרות</span>
              <span className="wb-schools-subject">אנגלית</span>
            </div>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/word-sets.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 6. PRACTICE WITH GAMES ───────────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFFFF" }}>
        <div className="wb-schools-feature is-flipped">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">תרגול</span>
            <h2 className="wb-schools-h2">משחקים קצרים שמקבעים את המילים.</h2>
            <p className="wb-schools-body">
              מילה שהובנה פעם אחת עדיין צריכה חזרה כדי להישאר. אחרי השיעור התלמידים מתרגלים את המילים של הכיתה במשחקים קצרים, וכל מילה שחיפשו הופכת לחלק מהידע שלהם.
            </p>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/games.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>

      {/* ─── HE 7. WHAT THE PRINCIPAL GETS ───────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#ECFAF9" }}>
        <div className="wb-schools-feature">
          <div className="wb-schools-feature-text">
            <span className="wb-schools-tag">מה מקבל המנהל</span>
            <h2 className="wb-schools-h2">כלי שגורם לתלמידים באמת להבין, בלי כאב ראש תפעולי.</h2>
            <p className="wb-schools-body">
              המורים מקבלים דרך פשוטה לוודא שאף תלמיד לא נשאר מאחור בגלל מילה אחת. בלי חשבונות לתלמידים, בלי התקנה, בלי מעורבות של צוות מחשוב.
            </p>
            <ul className="wb-schools-bullets">
              <li>בלי התחברות לתלמידים, בלי סיסמאות לנהל</li>
              <li>בלי התקנה ובלי מעורבות של צוות מחשוב</li>
              <li>עובד על כל מסך: לוח חכם, מחשב או טלפון</li>
              <li>דשבורד שמראה למורה עם אילו מילים הכיתה מתקשה</li>
            </ul>
          </div>
          <div className="wb-schools-feature-visual">
            <img src="/schools/trust.webp" alt="" loading="lazy" className="wb-schools-feature-img" />
          </div>
        </div>
      </section>
      </>
      ) : (
      <>
      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">{t.heroSub}</p>
          <div className="wb-schools-hero-actions">
            <button type="button" className="wb-schools-cta" onClick={scrollToPricing}>
              {t.heroCta}
            </button>
          </div>
        </div>

        {/* Hero visual — pure CSS mockup of teacher dashboard + student dictionary view */}
        <div className="wb-schools-hero-visual" aria-hidden="true">
          <div className="wb-schools-mockup wb-schools-mockup-teacher">
            <div className="wb-schools-mockup-window">
              <div className="wb-schools-mockup-dots">
                <span /><span /><span />
              </div>
              <div className="wb-schools-mockup-title">/schools/manage</div>
            </div>
            <div className="wb-schools-mockup-body">
              <div className="wb-schools-mockup-eyebrow">{t.mockupRoster}</div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-1" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent1}</span>
                <span className="wb-schools-mockup-time">9:42</span>
              </div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-2" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent2}</span>
                <span className="wb-schools-mockup-time">10:08</span>
              </div>
              <div className="wb-schools-mockup-search-row">
                <span className="wb-schools-mockup-dot wb-schools-mockup-dot-3" />
                <span className="wb-schools-mockup-search-text">{t.mockupStudent3}</span>
                <span className="wb-schools-mockup-time">11:15</span>
              </div>
              <div className="wb-schools-mockup-eyebrow wb-schools-mockup-eyebrow-2">{t.mockupSearches}</div>
              <div className="wb-schools-mockup-bars">
                <div className="wb-schools-mockup-bar"><span style={{ width: "92%" }} />photosynthesis</div>
                <div className="wb-schools-mockup-bar"><span style={{ width: "68%" }} />mitochondria</div>
                <div className="wb-schools-mockup-bar"><span style={{ width: "44%" }} />democracy</div>
              </div>
            </div>
          </div>

          <div className="wb-schools-mockup wb-schools-mockup-student" lang={lang}>
            <div className="wb-schools-mockup-window">
              <div className="wb-schools-mockup-dots">
                <span /><span /><span />
              </div>
              <div className="wb-schools-mockup-title">gadit.app/c/XYZ123</div>
            </div>
            <div className="wb-schools-mockup-body">
              <div className="wb-schools-mockup-word">{t.mockupWordExample}</div>
              <div className="wb-schools-mockup-meaning">
                <div className="wb-schools-mockup-meaning-label">1.</div>
                <div className="wb-schools-mockup-meaning-text">{t.mockupExampleDef}</div>
              </div>
              <div className="wb-schools-mockup-example">
                <div className="wb-schools-mockup-example-label">{bits.example}</div>
                <div className="wb-schools-mockup-example-text">{t.mockupExampleEx}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THE PROBLEM ──────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-problem">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.probTag}</span>
          <h2 className="wb-schools-h2">{t.probH2}</h2>
          <p className="wb-schools-body">{t.probBody1}</p>
          <p className="wb-schools-body">{t.probBody2}</p>
          <div className="wb-schools-callout-grid">
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">01</div>
              <div className="wb-schools-callout-title">{t.probCallout1Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout1Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">02</div>
              <div className="wb-schools-callout-title">{t.probCallout2Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout2Body}</div>
            </div>
            <div className="wb-schools-callout">
              <div className="wb-schools-callout-num">03</div>
              <div className="wb-schools-callout-title">{t.probCallout3Title}</div>
              <div className="wb-schools-callout-body">{t.probCallout3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2.5 CROSS-LANGUAGE (flagship) ───────────────────────── */}
      <section className="wb-schools-section" style={{ background: "#FFFBEB" }}>
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag" style={{ color: "#B45309" }}>{xt.tag}</span>
          <h2 className="wb-schools-h2">{xt.h2}</h2>
          <p className="wb-schools-body">{xt.body1}</p>
          <p className="wb-schools-body">{xt.body2}</p>

          {/* Concrete demo: one lesson word, understood in the student's
              own language. Fixed content, UI-translated labels. */}
          <div
            style={{
              marginTop: 28,
              background: "#fff",
              border: "1px solid #FDE68A",
              borderRadius: 18,
              padding: "22px 24px",
              maxWidth: 560,
              boxShadow: "0 10px 30px -14px rgba(202,138,4,0.35)",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              {xt.demoWordLabel}
            </div>
            <div dir="ltr" style={{ fontSize: 28, fontWeight: 800, color: "#1C1917", marginBottom: 18, textAlign: dir === "rtl" ? "right" : "left" }}>
              {XLANG_DEMO.word}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              {xt.demoMeaningLabel}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {XLANG_DEMO.meanings.map((m) => (
                <div key={m.lang} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, minWidth: 74, fontSize: 13.5, fontWeight: 700, color: "#92400E" }}>{m.lang}</span>
                  <span dir={m.dir ?? "ltr"} style={{ fontSize: 14.5, color: "#44403C", lineHeight: 1.5, textAlign: m.dir === "rtl" ? "right" : "left" }}>{m.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #FEF3C7", fontSize: 12.5, color: "#A16207", fontWeight: 600 }}>
              {bits.moreLangs}
            </div>
          </div>

          <p className="wb-schools-body" style={{ marginTop: 26, fontSize: 19, fontWeight: 700, color: "#1C1917", maxWidth: 640 }}>
            {xt.keyline}
          </p>
          <p className="wb-schools-body" style={{ marginTop: 12, color: "#78716C" }}>{xt.note}</p>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-how">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.howTag}</span>
          <h2 className="wb-schools-h2">{t.howH2}</h2>
          <p className="wb-schools-section-sub">{t.howSub}</p>
          <div className="wb-schools-steps">
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <div className="wb-schools-code-chip" lang="en" dir="ltr">XYZ123</div>
              </div>
              <div className="wb-schools-step-num">{bits.step(1)}</div>
              <div className="wb-schools-step-title">{t.howStep1Title}</div>
              <div className="wb-schools-step-body">{t.howStep1Body}</div>
            </div>
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="14" width="48" height="36" rx="4" fill="#fff" stroke="#0EA5A5" strokeWidth="2" />
                  <rect x="14" y="20" width="36" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <rect x="14" y="27" width="24" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <rect x="14" y="34" width="30" height="3" rx="1.5" fill="#0EA5A5" opacity="0.3" />
                  <circle cx="32" cy="44" r="3" fill="#0EA5A5" />
                </svg>
              </div>
              <div className="wb-schools-step-num">{bits.step(2)}</div>
              <div className="wb-schools-step-title">{t.howStep2Title}</div>
              <div className="wb-schools-step-body">{t.howStep2Body}</div>
            </div>
            <div className="wb-schools-step">
              <div className="wb-schools-step-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="6" y="10" width="52" height="40" rx="4" fill="#fff" stroke="#0EA5A5" strokeWidth="2" />
                  <rect x="12" y="18" width="20" height="3" rx="1.5" fill="#0EA5A5" />
                  <rect x="12" y="26" width="36" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                  <rect x="12" y="34" width="28" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                  <rect x="12" y="42" width="32" height="3" rx="1.5" fill="#0EA5A5" opacity="0.4" />
                </svg>
              </div>
              <div className="wb-schools-step-num">{bits.step(3)}</div>
              <div className="wb-schools-step-title">{t.howStep3Title}</div>
              <div className="wb-schools-step-body">{t.howStep3Body}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. TEACHER VIEW ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-teacher">
        <div className="wb-schools-section-inner wb-schools-teacher-grid">
          <div className="wb-schools-teacher-copy">
            <span className="wb-schools-tag">{t.teacherTag}</span>
            <h2 className="wb-schools-h2">{t.teacherH2}</h2>
            <p className="wb-schools-section-sub">{t.teacherSub}</p>
            <ul className="wb-schools-bullets">
              <li>{t.teacherB1}</li>
              <li>{t.teacherB2}</li>
              <li>{t.teacherB3}</li>
              <li>{t.teacherB4}</li>
            </ul>
          </div>
          <div className="wb-schools-teacher-mockup">
            <div className="wb-schools-mockup wb-schools-mockup-big">
              <div className="wb-schools-mockup-window">
                <div className="wb-schools-mockup-dots">
                  <span /><span /><span />
                </div>
                <div className="wb-schools-mockup-title">/schools/manage · Class 7B</div>
              </div>
              <div className="wb-schools-mockup-body">
                <div className="wb-schools-mockup-eyebrow">{t.mockupSearches}</div>
                <div className="wb-schools-mockup-bars">
                  <div className="wb-schools-mockup-bar"><span style={{ width: "92%" }} />photosynthesis <em>14</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "68%" }} />mitochondria <em>9</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "55%" }} />democracy <em>7</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "40%" }} />sovereignty <em>5</em></div>
                  <div className="wb-schools-mockup-bar"><span style={{ width: "28%" }} />equilibrium <em>3</em></div>
                </div>
                <div className="wb-schools-mockup-eyebrow wb-schools-mockup-eyebrow-2">{t.mockupRoster}</div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-1" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent1}</span>
                  <span className="wb-schools-mockup-time">9:42</span>
                </div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-2" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent2}</span>
                  <span className="wb-schools-mockup-time">10:08</span>
                </div>
                <div className="wb-schools-mockup-search-row">
                  <span className="wb-schools-mockup-dot wb-schools-mockup-dot-3" />
                  <span className="wb-schools-mockup-search-text">{t.mockupStudent3}</span>
                  <span className="wb-schools-mockup-time">11:15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </>
      )}

      {/* ─── SHARED (all languages): PRIVACY / PRICING / FAQ / FINAL ─
          These four sections already render the correct per-language
          copy via `t` / `pu`, so they live outside the he/other branch
          and stay identical for every language. */}

      {/* ─── 5. PRIVACY MOAT ─────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-privacy">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.privTag}</span>
          <h2 className="wb-schools-h2">{t.privH2}</h2>
          <p className="wb-schools-section-sub">{t.privSub}</p>
          <div className="wb-schools-privacy-grid">
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="no-account" />
              <div className="wb-schools-privacy-text">{t.privPoint1}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="no-pii" />
              <div className="wb-schools-privacy-text">{t.privPoint2}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="hours" />
              <div className="wb-schools-privacy-text">{t.privPoint3}</div>
            </div>
            <div className="wb-schools-privacy-card">
              <PrivacyIcon kind="compliance" />
              <div className="wb-schools-privacy-text">{t.privPoint4}</div>
            </div>
          </div>
          <p className="wb-schools-privacy-kahoot">{t.privKahoot}</p>
        </div>
      </section>

      {/* ─── 6. PRICING ──────────────────────────────────────────── */}
      <section id="schools-pricing" className="wb-schools-section wb-schools-pricing">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.priceTag}</span>
          <h2 className="wb-schools-h2">{lang === "he" ? t.priceH2 : upu.h2}</h2>
          {lang === "he" ? (
          <>
          <style>{`
            .wordbook .wb-schools-price-grid.sl-price-grid-3 {
              max-width: 1080px;
              margin-inline: auto;
            }
            @media (min-width: 720px) {
              .wordbook .wb-schools-price-grid.sl-price-grid-3 { grid-template-columns: repeat(3, 1fr); }
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-3 .wb-schools-price-card {
              box-shadow: 0 8px 24px -10px rgba(16, 24, 40, 0.16);
              border: 1px solid #E3E6EA;
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-3 .wb-schools-price-card:hover {
              border-color: rgba(202, 138, 4, 0.5);
              box-shadow: 0 14px 34px -12px rgba(202, 138, 4, 0.28);
            }
            .wordbook .sl-price-grid-3 .wb-schools-price-card { text-align: center; }
            .wordbook .sl-price-grid-3 .wb-schools-price-amount { justify-content: center; }
            .wordbook .sl-price-grid-3 .wb-schools-price-name { text-transform: none; letter-spacing: 0; }
            .wordbook .sl-billing-toggle {
              display: flex; width: fit-content; margin: 0 auto 24px;
              background: #f1f3f5; border-radius: 999px; padding: 4px; gap: 2px;
            }
            .wordbook .sl-billing-toggle button {
              border: none; background: transparent; font-family: var(--wb-he);
              font-weight: 700; font-size: 14px; color: #64748b;
              padding: 8px 18px; border-radius: 999px; cursor: pointer;
              display: inline-flex; align-items: center; gap: 7px;
            }
            .wordbook .sl-billing-toggle button.is-active {
              background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }
            .wordbook .sl-billing-save {
              background: #10B981; color: #fff; font-size: 10.5px; font-weight: 800;
              padding: 2px 7px; border-radius: 999px; line-height: 1.5;
            }
          `}</style>
          <div className="sl-billing-toggle" role="tablist" aria-label="billing period">
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              className={billing === "monthly" ? "is-active" : ""}
              onClick={() => setBilling("monthly")}
            >
              חודשי
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "yearly"}
              className={billing === "yearly" ? "is-active" : ""}
              onClick={() => setBilling("yearly")}
            >
              שנתי
              <span className="sl-billing-save">חודשיים חינם</span>
            </button>
          </div>
          <div className="wb-schools-price-grid sl-price-grid-3">
            {SCHOOL_TIERS.map((tier) => (
              <div key={tier.key} className="wb-schools-price-card">
                <div className="wb-schools-price-name">{pu.tiers[tier.key]}</div>
                <div className="wb-schools-price-amount">
                  <span className="wb-schools-price-amount-num" dir="ltr">{`₪${(billing === "yearly" ? tier.yearly : tier.monthly).toLocaleString()}`}</span>
                  <span className="wb-schools-price-amount-vat">{pu.plusVat}</span>
                  <span className="wb-schools-price-amount-period">{billing === "yearly" ? "לשנה" : "לחודש"}</span>
                </div>
                <button type="button" className="wb-schools-cta wb-schools-cta-block" onClick={scrollToOrder}>
                  {pu.orderCta}
                </button>
              </div>
            ))}
          </div>
          <p className="wb-schools-price-net">{pu.netNote}</p>
          <style>{`
            .wordbook .wb-schools-price-amount-vat {
              font-size: 0.62em;
              font-weight: 600;
              color: #A8734B;
              margin-inline-start: 4px;
              white-space: nowrap;
            }
            .wordbook .wb-schools-price-net {
              margin: 14px auto 0;
              text-align: center;
              font-size: 13px;
              color: #78716C;
            }
          `}</style>
          </>
          ) : (
          <>
          {/* International (non-Hebrew): uniform USD, monthly-first with a
              yearly option, self-serve by card. Same billing-toggle pattern
              as the Families page. Gadi 2026-08-14. */}
          <style>{`
            .wordbook .sl-billing-toggle {
              display: flex; width: fit-content; margin: 4px auto 24px;
              background: #f1f3f5; border-radius: 999px; padding: 4px; gap: 2px;
            }
            .wordbook .sl-billing-toggle button {
              border: none; background: transparent; font-family: var(--wb-sans);
              font-weight: 700; font-size: 14px; color: #64748b;
              padding: 8px 18px; border-radius: 999px; cursor: pointer;
              display: inline-flex; align-items: center; gap: 7px;
            }
            .wordbook .sl-billing-toggle button.is-active {
              background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }
            .wordbook .sl-billing-save {
              background: #10B981; color: #fff; font-size: 10.5px; font-weight: 800;
              padding: 2px 7px; border-radius: 999px; line-height: 1.5;
            }
            .wordbook .wb-schools-price-grid.sl-price-grid-usd {
              max-width: 1080px; margin-inline: auto;
              grid-template-columns: 1fr; gap: 20px;
            }
            @media (min-width: 720px) {
              .wordbook .wb-schools-price-grid.sl-price-grid-usd { grid-template-columns: repeat(3, 1fr); }
            }
            .wordbook .sl-price-grid-usd .wb-schools-price-card { text-align: center; }
            .wordbook .sl-price-grid-usd .wb-schools-price-amount { justify-content: center; margin-block: 4px 6px; }
            .wordbook .sl-price-grid-usd .wb-schools-cta-block { margin-top: 18px; }
            .wordbook .wb-schools-price-net {
              margin: 16px auto 0; text-align: center; font-size: 13px; color: #78716C;
            }
          `}</style>
          <div className="sl-billing-toggle" role="tablist" aria-label="billing period">
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              className={billing === "monthly" ? "is-active" : ""}
              onClick={() => setBilling("monthly")}
            >
              {upu.billedMonthly}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "yearly"}
              className={billing === "yearly" ? "is-active" : ""}
              onClick={() => setBilling("yearly")}
            >
              {upu.billedYearly}
              <span className="sl-billing-save" dir="ltr">{upu.yearlySave}</span>
            </button>
          </div>
          <div className="wb-schools-price-grid sl-price-grid-usd">
            {SCHOOLS_TIER_LIST.map((tier) => (
              <div key={tier.key} className="wb-schools-price-card">
                <div className="wb-schools-price-name">{upu.smallName}</div>
                <div className="wb-schools-price-amount">
                  <span className="wb-schools-price-amount-num" dir="ltr">
                    {billing === "yearly" ? tier.usdYearly : tier.usdMonthly}
                  </span>
                  <span className="wb-schools-price-amount-period">
                    {billing === "yearly" ? upu.perYear : upu.perMonth}
                  </span>
                </div>
                <div className="wb-schools-price-students">
                  {studentsUpTo(tier.maxStudents, lang)}
                </div>
                <button
                  type="button"
                  className="wb-schools-cta wb-schools-cta-block"
                  onClick={() => clickSchoolsTier(tier.key)}
                >
                  {upu.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="wb-schools-price-net">{upu.afterTrial}</p>
          </>
          )}
          <p className="wb-schools-price-larger">{t.priceLarger}</p>
          <div className="wb-schools-includes">
            <div className="wb-schools-includes-title">{t.priceIncludesTitle}</div>
            <div className="wb-schools-includes-list">
              {t.priceIncludes.map((line) => (
                <div key={line} className="wb-schools-includes-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Israeli schools buy a full year up front by bank transfer /
              purchase order against a tax invoice, not by card. This is
              the primary (and only) payment path, Hebrew page only. */}
          {lang === "he" && (
            <div
              id="schools-order"
              style={{
                maxWidth: 640,
                margin: "26px auto 0",
                background: "#fff",
                border: "1px solid #E3E6EA",
                borderRadius: 14,
                padding: "20px 22px",
                textAlign: "start",
                boxShadow: "0 4px 16px -8px rgba(16,24,40,0.12)",
              }}
              dir="rtl"
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1C1917", marginBottom: 8 }}>
                ההרשמה פשוטה
              </div>
              <div style={{ fontSize: 14, color: "#44403C", lineHeight: 1.75 }}>
                ממלאים טופס קצר עם פרטי בית הספר, ואנחנו פותחים את בית הספר עם שם משתמש וסיסמה ושולחים חשבונית מס. התשלום שנתי בהעברה בנקאית או בהזמנת רכש.
              </div>
              <div style={{ fontSize: 14, color: "#44403C", lineHeight: 1.75, marginTop: 12 }}>
                <strong>לביא טכנולוגיות למידה והדרכה בע״מ</strong>
                <br />
                בנק לאומי (10) · סניף 855 · חשבון 41850031
              </div>
              <SchoolOrderForm />
            </div>
          )}
        </div>
      </section>

      {/* ─── 7. FAQ ─────────────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-faq">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.faqTag}</span>
          <h2 className="wb-schools-h2">{t.faqH2}</h2>
          <div className="wb-schools-faq-list">
            {t.faq.map((item, i) => (
              <button
                key={i}
                type="button"
                className={`wb-schools-faq-item ${openFaq === i ? "is-open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <div className="wb-schools-faq-q">
                  <span>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="wb-schools-faq-chevron">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                {openFaq === i && (
                  <div className="wb-schools-faq-a">{item.a}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. FINAL CTA ────────────────────────────────────────── */}
      <section className="wb-schools-section wb-schools-final">
        <div className="wb-schools-section-inner wb-schools-final-inner">
          <h2 className="wb-schools-h2 wb-schools-final-h2">{t.finalH2}</h2>
          <p className="wb-schools-final-body">{t.finalBody}</p>
          <button type="button" className="wb-schools-cta wb-schools-cta-big" onClick={scrollToPricing}>
            {t.finalCta}
          </button>
          <div className="wb-schools-final-note">{t.finalNote}</div>
        </div>
      </section>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>{v2(lang, "footerPricing")}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
        <TokushohoLink separator />
      </footer>
    </div>
  );
}

// Inline privacy icons. SVGs kept here to avoid a primitives import
// cycle and to keep the file self-contained.
function PrivacyIcon({ kind }: { kind: "no-account" | "no-pii" | "hours" | "compliance" }) {
  if (kind === "no-account") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="3.5" />
        <path d="M5 20c1-3 4-5 7-5s6 2 7 5" />
        <path d="M4 4l16 16" />
      </svg>
    );
  }
  if (kind === "no-pii") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 14h4" />
      </svg>
    );
  }
  if (kind === "hours") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4v5c0 5-4 9-8 9s-8-4-8-9V7l8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
