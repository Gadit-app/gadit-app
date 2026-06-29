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
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { v2 } from "@/lib/i18n-v2";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { StartFreeCTA } from "@/components/StartFreeCTA";

// Same languages as HomeClient — duplicated rather than refactored so
// the topbar on /schools mirrors the homepage exactly without coupling
// the two files.
const LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "cs", label: "Čeština", flag: "cz" },
  { code: "sk", label: "Slovenčina", flag: "sk" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "hi", label: "हिन्दी", flag: "in" },
] as const;

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
          {LANGS.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={l.code === lang} className={l.code === lang ? "is-active" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type T = {
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
    heroH1: "See every word your class doesn't understand.",
    heroSub: "Students search any word. You see what they searched. No student accounts, no IT setup, no parent complaints.",
    heroCta: "Start 14-day free trial",
    heroPriceChip: "From $69 / month",
    heroTrust: "Self-serve. Cancel anytime.",
    probTag: "The Problem",
    probH2: "A student who doesn't understand a word can't understand the sentence.",
    probBody1: "A student misses one word. They don't raise their hand. They think they roughly understand. The teacher moves on. Five words later, the paragraph is blurry. Five paragraphs later, the lesson is lost.",
    probBody2: "Most students who fall behind aren't unintelligent. They have a stack of words they never fully understood. Every new word built on those compounds the gap. The cause is invisible to the teacher.",
    probCallout1Title: "The compounding gap",
    probCallout1Body: "Unlearned words build an invisible barrier to every future lesson.",
    probCallout2Title: "The time drain",
    probCallout2Body: "Teachers lose 5–10 minutes per lesson on definitions.",
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
    priceH2: "Simple. Below the procurement threshold.",
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
      "Student UI in 13 languages",
      "14-day free trial",
    ],
    priceCta: "Start 14-day free trial",
    priceLarger: "Need more than 500 students? Contact us about district plans.",
    faqTag: "FAQ",
    faqH2: "Questions principals ask before they trial.",
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
        a: "Classroom codes are bound to the school's active hours (default Sunday–Thursday 7:30–15:00, configurable). Outside that window the code gives basic dictionary access but no extended features. This prevents the school code from becoming a free 24/7 substitute for the Family tier.",
      },
      {
        q: "What if my school has more than 500 students?",
        a: "Use Schools Large ($149/month, up to 500 students) for any school under 500. For 500+ students or multi-site districts, contact us for a custom plan that fits your school's structure.",
      },
      {
        q: "How does Gadit explain a word? Is it just a translation?",
        a: "Gadit is not a translation dictionary. Gadit defines and explains words. For each word it gives every meaning, three example sentences per meaning, etymology, and a context-aware mode where students paste the sentence and Gadit picks the right meaning. The student's UI is in their language, but the explanation depth is the same in every UI language.",
      },
    ],
    finalH2: "Stop the silent failure mode.",
    finalBody: "Give your teachers the tool to see exactly what their class doesn't understand. The trial takes 2 minutes to start. No IT, no procurement, no parent forms.",
    finalCta: "Start 14-day free trial",
    finalNote: "No credit card required for the trial. Cancel anytime.",
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
    heroH1: "ראו כל מילה שהכיתה לא מבינה.",
    heroSub: "התלמידים מחפשים מילים. אתם רואים מה הם חיפשו. בלי חשבונות לתלמידים, בלי הקמה של IT, בלי תלונות הורים.",
    heroCta: "התחילו 14 ימי ניסיון חינם",
    heroPriceChip: "מ-$69 לחודש",
    heroTrust: "Self-serve. בטלו בכל רגע.",
    probTag: "הבעיה",
    probH2: "תלמיד שלא מבין מילה לא יכול להבין את המשפט.",
    probBody1: "תלמיד מפספס מילה. לא מרים את היד. חושב שהוא בערך מבין. המורה ממשיכה הלאה. חמש מילים אחר כך, הפסקה מטושטשת. חמש פסקאות אחר כך, השיעור אבוד.",
    probBody2: "רוב התלמידים שנופלים מאחור אינם פחות חכמים. יש להם ערימה של מילים שלא הבינו עד הסוף. כל מילה חדשה שמתבססת על הערימה מגדילה את הפער. הסיבה בלתי נראית למורה.",
    probCallout1Title: "פער שמתעצם",
    probCallout1Body: "מילים שלא הובנו בונות חומה בלתי נראית לכל שיעור עתידי.",
    probCallout2Title: "זמן שהולך לאיבוד",
    probCallout2Body: "מורים מאבדים 5–10 דקות בכל שיעור על הסברי מילים.",
    probCallout3Title: "הניתוק השקט",
    probCallout3Body: "תלמידים מתנתקים כשפסקה מכילה יותר מדי מילים לא מוכרות.",
    howTag: "איך זה עובד",
    howH2: "הקמה ב-2 דקות. בלי IT.",
    howSub: "אותו דפוס של קוד-כיתה חסר חיכוך שכבר עובד במשחקי חידון, רק לשם הבנת מילים.",
    howStep1Title: "צרו קוד כיתה",
    howStep1Body: "המנהל או רכז השכבה יוצרים כיתה בדשבורד. המערכת מייצרת קוד בן 6 תווים. מדפיסים על מדבקה ומדביקים על מחשב הכיתה.",
    howStep2Title: "תלמידים מצטרפים בלי חשבון",
    howStep2Body: "התלמידים נכנסים ל-gadit.app/c/CODE בכל דפדפן, בוחרים את השם שלהם מהרשימה (קליק אחד), ומתחילים להקליד מילים. בלי התקנה, בלי מייל, בלי סיסמה.",
    howStep3Title: "המורה רואה מה הכיתה חיפשה",
    howStep3Body: "כל חיפוש נכנס לדשבורד, מתוייג עם שם התלמיד. אתם רואים מה כל תלמיד חיפש, מתי, ועם אילו מילים הכיתה כולה התקשתה.",
    teacherTag: "מבט המורה",
    teacherH2: "הדשבורד שחיכיתם לו.",
    teacherSub: "לא מדדי engagement מעורפלים. מילים ספציפיות, תלמידים ספציפיים, רגעים ספציפיים.",
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
    privPoint4: "COPPA, GDPR-K, וחוק הגנת הפרטיות הישראלי טופלו בנוחות.",
    privKahoot: "הצטרפות פשוטה כמו במשחק חידון. נבנה להבנת מילים ולנראות למורה.",
    priceTag: "מחירים",
    priceH2: "פשוט. מתחת לסף הרכש.",
    priceSub: "Self-serve דרך Stripe. בלי שיחות מכירה, בלי דמואים, בלי הזמנות רכש.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "עד 100 תלמידים",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "עד 500 תלמידים",
    priceIncludesTitle: "שתי התוכניות כוללות",
    priceIncludes: [
      "כיתות ללא הגבלה",
      "דשבורד מורה מלא",
      "רשימת בחירת שם תלמיד",
      "קודי כיתה תחומים בזמן",
      "ממשק תלמיד ב-13 שפות",
      "14 ימי ניסיון חינם",
    ],
    priceCta: "התחילו 14 ימי ניסיון חינם",
    priceLarger: "יותר מ-500 תלמידים? צרו קשר על תוכנית מותאמת.",
    faqTag: "שאלות נפוצות",
    faqH2: "מה מנהלים שואלים לפני שמתחילים ניסיון.",
    faq: [
      {
        q: "אם אין לוגינים, איך אדע איזה תלמיד חיפש מה?",
        a: "המורה טוענת מראש רשימה של שמות פרטיים בדשבורד. כשהתלמיד נכנס לכתובת הכיתה, הוא בוחר את השם שלו בקליק אחד. כל חיפוש מתוייג לאותו שם. בלי מייל, בלי סיסמה, בלי שום מידע אישי.",
      },
      {
        q: "האם זה תואם COPPA? אקבל תלונת הורים?",
        a: "כן. Gadit לא אוסף שום מידע אישי על תלמידים. בלי יצירת חשבון, בלי איסוף מייל, בלי תאריכי לידה, בלי תעודות. אין נתונים שאפשר לעשות בהם שימוש לרעה. הארכיטקטורה עומדת בנוחות בדרישות COPPA, GDPR-K, וחוק הגנת הפרטיות הישראלי.",
      },
      {
        q: "האם תלמידים צריכים להתקין אפליקציה?",
        a: "לא. כל דפדפן עובד. התלמידים נכנסים ל-gadit.app/c/CODE על מחשב הכיתה (או על כל מכשיר עם דפדפן). בלי חנות אפליקציות, בלי IT.",
      },
      {
        q: "האם צריך התקנת IT או SSO?",
        a: "לא. המנהל או רכז השכבה יוצרים כיתה בשתי דקות ומשתפים את הקוד עם המורים. ה-IT לא מעורב בשום שלב.",
      },
      {
        q: "מה הדשבורד באמת מראה?",
        a: "חיפושי המילים של כל תלמיד עם חותמת זמן, המילים שהכיתה חיפשה הכי הרבה השבוע, ודפוסים של חיפושים חוזרים שמסמנים הבנה שברירית. נתוני הבנה אמיתיים של הכיתה, לא מדדי engagement מעורפלים.",
      },
      {
        q: "האם זה עובד מחוץ לשעות הלימודים?",
        a: "קודי כיתה תחומים לשעות הפעילות של בית הספר (ברירת מחדל א–ה 7:30–15:00, ניתן להגדיר). מחוץ לחלון הזה הקוד נותן גישה למילון בסיסי בלבד. זה מונע מהקוד של בית הספר להפוך לתחליף חינמי של תוכנית Family ב-24/7.",
      },
      {
        q: "מה אם בית הספר שלי מעל 500 תלמידים?",
        a: "השתמשו ב-Schools Large ($149 לחודש, עד 500 תלמידים) לכל בית ספר מתחת ל-500. ל-500+ תלמידים או רשתות בתי ספר, צרו קשר לתוכנית מותאמת.",
      },
      {
        q: "איך Gadit מסביר מילה? זה תרגום?",
        a: "Gadit הוא לא מילון תרגום. Gadit מגדיר ומסביר מילים. לכל מילה הוא נותן את כל המשמעויות, שלושה משפטי דוגמה לכל משמעות, אטימולוגיה, ומצב הקשרי שבו התלמיד מדביק את המשפט ו-Gadit בוחר את המשמעות הנכונה. ממשק התלמיד בשפה שלו, אבל עומק ההסבר זהה בכל ממשק.",
      },
    ],
    finalH2: "עצרו את כשל הלמידה השקט.",
    finalBody: "תנו למורים שלכם את הכלי לראות בדיוק מה הכיתה לא מבינה. הניסיון מתחיל ב-2 דקות. בלי IT, בלי רכש, בלי טפסי הורים.",
    finalCta: "התחילו 14 ימי ניסיון חינם",
    finalNote: "אין צורך בכרטיס אשראי לניסיון. בטלו בכל רגע.",
    mockupRoster: "רשימת כיתה, 22 תלמידים",
    mockupSearches: "הכי מחופשים השבוע",
    mockupStudent1: "מאיה חיפשה פוטוסינתזה",
    mockupStudent2: "יוסי חיפש מיטוכונדריה ×2",
    mockupStudent3: "נועה חיפשה דמוקרטיה",
    mockupWordExample: "פוטוסינתזה",
    mockupExampleDef: "תהליך שבו צמחים ירוקים משתמשים באור השמש להפיכת מים ופחמן דו-חמצני למזון.",
    mockupExampleEx: "הפוטוסינתזה מתרחשת בעיקר בעלים של הצמח.",
  },

  // ─── Russian ──────────────────────────────────────────────────
  ru: {
    heroH1: "Видеть каждое слово, которое класс не понимает.",
    heroSub: "Ученики ищут любое слово. Вы видите, что они искали. Без аккаунтов для учеников, без настройки IT, без жалоб от родителей.",
    heroCta: "Начать 14-дневный пробный период",
    heroPriceChip: "От $69 в месяц",
    heroTrust: "Самообслуживание. Отмена в любой момент.",
    probTag: "Проблема",
    probH2: "Ученик, не понимающий слово, не может понять предложение.",
    probBody1: "Ученик не знает одно слово. Он не поднимает руку. Думает, что примерно понимает. Учитель идёт дальше. Через пять слов абзац уже размытый. Через пять абзацев урок потерян.",
    probBody2: "Большинство учеников, отстающих в учёбе, не глупые. У них накопилась стопка слов, которые они так и не поняли до конца. Каждое новое слово, опирающееся на эту стопку, увеличивает разрыв. Учитель не видит причины.",
    probCallout1Title: "Растущий разрыв",
    probCallout1Body: "Невыученные слова строят невидимую стену для каждого будущего урока.",
    probCallout2Title: "Утечка времени",
    probCallout2Body: "Учителя теряют 5–10 минут на каждом уроке, объясняя слова.",
    probCallout3Title: "Тихий отрыв",
    probCallout3Body: "Ученики отключаются, когда в абзаце слишком много незнакомых слов.",
    howTag: "Как это работает",
    howH2: "Настройка за 2 минуты. Без IT.",
    howSub: "Тот же беспроблемный шаблон классного кода, который уже работает в викторинах, только для понимания слов.",
    howStep1Title: "Создайте код класса",
    howStep1Body: "Директор или координатор класса создаёт класс в панели управления. Система выдаёт код из 6 символов. Распечатайте его наклейкой для классного компьютера.",
    howStep2Title: "Ученики входят без аккаунтов",
    howStep2Body: "Ученики заходят на gadit.app/c/CODE в любом браузере, выбирают своё имя из списка (один клик) и начинают вводить слова. Без установки приложения, без email, без пароля.",
    howStep3Title: "Учитель видит, что искал класс",
    howStep3Body: "Каждый поиск попадает в панель управления с именем ученика. Вы видите, что искал каждый ученик, когда и какие слова вызвали трудности у всего класса.",
    teacherTag: "Взгляд учителя",
    teacherH2: "Панель управления, которую вы ждали.",
    teacherSub: "Не размытые показатели вовлечённости. Конкретные слова, конкретные ученики, конкретные моменты.",
    teacherB1: "История поиска каждого ученика с отметками времени",
    teacherB2: "Самые искомые слова класса за неделю",
    teacherB3: "Повторные поиски, сигнализирующие о шатком понимании",
    teacherB4: "Фильтр по дате, ученику или слову",
    privTag: "Приватность в архитектуре",
    privH2: "Полная видимость для учителей. Ноль риска данных для школы.",
    privSub: "Мы не собираем личные данные учеников. Не потому что хорошо их прячем, а потому что вообще их не собираем. Архитектура — это и есть соответствие требованиям.",
    privPoint1: "Без аккаунтов учеников. Без email, без паролей, без удостоверений.",
    privPoint2: "Никакая личная информация не покидает школу. Поиски помечаются только именем из списка.",
    privPoint3: "Коды классов работают только в школьное время. Настраивается для каждой школы.",
    privPoint4: "COPPA, GDPR-K и израильский закон о защите детей соблюдаются с запасом.",
    privKahoot: "Подключаются так же легко, как к классной викторине. Построено для понимания слов и видимости для учителя.",
    priceTag: "Цены",
    priceH2: "Просто. Ниже порога закупок.",
    priceSub: "Самообслуживание через Stripe. Без звонков от продавцов, без демонстраций, без счетов на оплату.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "До 100 учеников",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "До 500 учеников",
    priceIncludesTitle: "Оба тарифа включают",
    priceIncludes: [
      "Неограниченное число классов",
      "Полная панель учителя",
      "Список выбора имени ученика",
      "Коды классов, привязанные к расписанию",
      "Интерфейс ученика на 13 языках",
      "14-дневный пробный период",
    ],
    priceCta: "Начать 14-дневный пробный период",
    priceLarger: "Больше 500 учеников? Свяжитесь с нами для тарифа района.",
    faqTag: "Вопросы и ответы",
    faqH2: "Что директора спрашивают перед пробным периодом.",
    faq: [
      {
        q: "Если нет логинов, как я узнаю, какой ученик что искал?",
        a: "Учитель заранее загружает список имён в панель. Когда ученик заходит на URL класса, он выбирает своё имя одним кликом. Каждый поиск помечается этим именем. Без email, без пароля, без личных данных.",
      },
      {
        q: "Это безопасно по COPPA? Не получу ли жалобу от родителей?",
        a: "Да. Gadit вообще не собирает личных данных учеников. Без создания аккаунтов, без email, без дат рождения, без удостоверений. Данных, которыми можно злоупотребить, просто нет. Архитектура с запасом соответствует COPPA, GDPR-K и израильскому закону о защите детей.",
      },
      {
        q: "Нужно ли ученикам устанавливать приложение?",
        a: "Нет. Подойдёт любой браузер. Ученики заходят на gadit.app/c/CODE с классного компьютера (или с любого устройства с браузером). Без магазина приложений, без участия IT.",
      },
      {
        q: "Нужна ли настройка IT или SSO?",
        a: "Нет. Директор или координатор класса создаёт класс за две минуты и делится кодом с учителями. IT не задействован ни на одном этапе.",
      },
      {
        q: "Что именно показывает панель управления?",
        a: "Поиски слов каждого ученика с отметками времени, слова, которые класс искал чаще всего за неделю, и шаблоны повторных поисков, сигнализирующие о шатком понимании. Реальные данные о понимании класса, а не размытые показатели вовлечённости.",
      },
      {
        q: "Можно ли использовать вне школьных часов?",
        a: "Коды классов привязаны к школьному расписанию (по умолчанию воскресенье–четверг 7:30–15:00, настраивается). Вне этого окна код даёт базовый доступ к словарю, но без расширенных функций. Это предотвращает превращение школьного кода в бесплатную замену тарифа Family на 24/7.",
      },
      {
        q: "Что если в моей школе больше 500 учеников?",
        a: "Используйте Schools Large ($149 в месяц, до 500 учеников) для любой школы меньше 500. Для 500+ учеников или многоплощадочных районов свяжитесь с нами для индивидуального плана.",
      },
      {
        q: "Как Gadit объясняет слово? Это просто перевод?",
        a: "Gadit не словарь переводов. Gadit определяет и объясняет слова. Для каждого слова он даёт все значения, три примера предложений на каждое значение, этимологию и контекстный режим, в котором ученик вставляет предложение, а Gadit выбирает правильное значение. Интерфейс ученика на его языке, но глубина объяснения одинакова на любом языке.",
      },
    ],
    finalH2: "Остановите тихий провал.",
    finalBody: "Дайте учителям инструмент, чтобы видеть, что именно их класс не понимает. Пробный период начинается за 2 минуты. Без IT, без закупок, без родительских форм.",
    finalCta: "Начать 14-дневный пробный период",
    finalNote: "Кредитная карта не нужна для пробного периода. Отмена в любой момент.",
    mockupRoster: "Список класса, 22 ученика",
    mockupSearches: "Самые искомые за неделю",
    mockupStudent1: "Майя искала «фотосинтез»",
    mockupStudent2: "Йоси искал «митохондрия» ×2",
    mockupStudent3: "Ноа искала «демократия»",
    mockupWordExample: "фотосинтез",
    mockupExampleDef: "Процесс, в котором зелёные растения используют солнечный свет для превращения воды и углекислого газа в пищу.",
    mockupExampleEx: "Фотосинтез происходит в основном в листьях растения.",
  },

  // ─── Arabic (MSA) ─────────────────────────────────────────────
  ar: {
    heroH1: "اكتشف كل كلمة لا يفهمها صفّك.",
    heroSub: "الطلاب يبحثون عن أي كلمة. وأنت ترى ما بحثوا عنه. لا حسابات للطلاب، لا إعداد لتقنية المعلومات، لا شكاوى من أولياء الأمور.",
    heroCta: "ابدأ التجربة المجانية لـ 14 يومًا",
    heroPriceChip: "ابتداءً من 69 دولارًا شهريًا",
    heroTrust: "خدمة ذاتية. ألغِ في أي وقت.",
    probTag: "المشكلة",
    probH2: "طالب لا يفهم كلمة لا يستطيع فهم الجملة.",
    probBody1: "الطالب يفوّت كلمة واحدة. لا يرفع يده. يظنّ أنه يفهم تقريبًا. تنتقل المعلمة إلى التالي. بعد خمس كلمات تصبح الفقرة ضبابية. بعد خمس فقرات يضيع الدرس.",
    probBody2: "معظم الطلاب الذين يتأخّرون ليسوا أقلّ ذكاءً. لديهم كومة من الكلمات التي لم يفهموها تمامًا. كل كلمة جديدة تُبنى على هذه الكومة تُكبّر الفجوة. السبب غير مرئيّ للمعلّم.",
    probCallout1Title: "فجوة تتراكم",
    probCallout1Body: "الكلمات غير المفهومة تبني حاجزًا غير مرئي لكل درس قادم.",
    probCallout2Title: "هدر الوقت",
    probCallout2Body: "المعلمون يفقدون 5 إلى 10 دقائق من كل درس على شرح الكلمات.",
    probCallout3Title: "الانفصال الصامت",
    probCallout3Body: "الطلاب ينفصلون عن الدرس عندما تحتوي الفقرة على كلمات كثيرة غير مألوفة.",
    howTag: "كيف يعمل",
    howH2: "إعداد في دقيقتين. بلا تقنية معلومات.",
    howSub: "نفس نمط كود الصفّ الخالي من الاحتكاك الذي يعمل في ألعاب المسابقات، مبنيًا لفهم الكلمات.",
    howStep1Title: "أنشئ كود الصف",
    howStep1Body: "المدير أو منسّق الصف ينشئ صفًّا في لوحة التحكم. يُنتج النظام كودًا من 6 أحرف. اطبعوه ملصقًا على حاسوب الصف.",
    howStep2Title: "الطلاب ينضمّون بلا حسابات",
    howStep2Body: "الطلاب يدخلون gadit.app/c/CODE من أي متصفح، يختارون اسمهم من القائمة بنقرة واحدة، ويبدؤون بكتابة الكلمات. بلا تطبيق، بلا بريد إلكتروني، بلا كلمة مرور.",
    howStep3Title: "المعلم يرى ماذا بحث الصف",
    howStep3Body: "كل بحث يصل إلى لوحة التحكم مع اسم الطالب. ترى ما بحث عنه كل طالب، ومتى، وأي كلمات صعبت على الصف بأكمله.",
    teacherTag: "نظرة المعلم",
    teacherH2: "لوحة التحكم التي طال انتظارها.",
    teacherSub: "ليست مؤشرات تفاعل ضبابية. كلمات محدّدة، طلاب محدّدون، لحظات محدّدة.",
    teacherB1: "تاريخ البحث لكل طالب مع طوابع زمنية",
    teacherB2: "الكلمات الأكثر بحثًا في الصف هذا الأسبوع",
    teacherB3: "عمليات بحث متكرّرة تشير إلى فهم هشّ",
    teacherB4: "تصفية حسب التاريخ أو الطالب أو الكلمة",
    privTag: "خصوصية مبنية في الهندسة",
    privH2: "رؤية كاملة للمعلمين. صفر مخاطر بيانات للمدرسة.",
    privSub: "نحن لا نجمع أي بيانات شخصية للطلاب. ليس لأننا نخفيها جيدًا، بل لأننا لا نجمعها أصلاً. الهندسة هي الامتثال.",
    privPoint1: "بلا حسابات طلاب. لا بريد، لا كلمات مرور، لا هويات.",
    privPoint2: "لا تخرج معلومات شخصية من المدرسة. الأبحاث تُوسم باسم القائمة فقط.",
    privPoint3: "أكواد الصفوف تعمل فقط خلال ساعات المدرسة. قابلة للضبط لكل مدرسة.",
    privPoint4: "COPPA، GDPR-K، وقانون الخصوصية الإسرائيلي للطلاب مغطّاة براحة.",
    privKahoot: "الانضمام سهل كلعبة مسابقة صفّية. مبني لفهم الكلمات ولرؤية المعلم.",
    priceTag: "الأسعار",
    priceH2: "بسيط. تحت عتبة المشتريات.",
    priceSub: "خدمة ذاتية عبر Stripe. لا مكالمات مبيعات، لا عروض، لا أوامر شراء.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "حتى 100 طالب",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "حتى 500 طالب",
    priceIncludesTitle: "الخطتان تشملان",
    priceIncludes: [
      "صفوف بلا حدود",
      "لوحة معلم كاملة",
      "قائمة اختيار أسماء الطلاب",
      "أكواد صفوف مقيّدة بالوقت",
      "واجهة طالب بـ 13 لغة",
      "تجربة مجانية لـ 14 يومًا",
    ],
    priceCta: "ابدأ التجربة المجانية لـ 14 يومًا",
    priceLarger: "أكثر من 500 طالب؟ تواصل معنا لخطة منطقة.",
    faqTag: "أسئلة شائعة",
    faqH2: "ما يسأله المديرون قبل بدء التجربة.",
    faq: [
      {
        q: "إذا لم يكن هناك تسجيل دخول، كيف أعرف أي طالب بحث عن ماذا؟",
        a: "المعلم يحمّل مسبقًا قائمة أسماء في اللوحة. عندما يدخل الطالب رابط الصف، يختار اسمه بنقرة واحدة. كل بحث يُوسم بهذا الاسم. بلا بريد، بلا كلمة مرور، بلا أي معلومات شخصية.",
      },
      {
        q: "هل هذا متوافق مع COPPA؟ هل سأتلقّى شكوى من ولي أمر؟",
        a: "نعم. Gadit لا يجمع أي معلومات شخصية للطلاب على الإطلاق. لا إنشاء حسابات، لا جمع بريد، لا تواريخ ميلاد، لا هويات. لا توجد بيانات يمكن إساءة استخدامها. الهندسة تتجاوز براحة متطلبات COPPA وGDPR-K وقانون الخصوصية الإسرائيلي.",
      },
      {
        q: "هل يحتاج الطلاب لتثبيت تطبيق؟",
        a: "لا. أي متصفح يعمل. الطلاب يدخلون gadit.app/c/CODE على حاسوب الصف (أو على أي جهاز بمتصفح). بلا متجر تطبيقات، بلا مشاركة من تقنية المعلومات.",
      },
      {
        q: "هل يتطلب إعداد تقنية المعلومات أو SSO؟",
        a: "لا. المدير أو منسّق الصف ينشئ الصف في دقيقتين ويشارك الكود مع المعلمين. تقنية المعلومات غير معنيّة في أي خطوة.",
      },
      {
        q: "ماذا تُظهر لوحة التحكم فعلاً؟",
        a: "أبحاث الكلمات لكل طالب مع طوابع زمنية، الكلمات التي بحث عنها الصف أكثر خلال الأسبوع، وأنماط الأبحاث المتكرّرة التي تدلّ على فهم هشّ. بيانات فهم حقيقية للصف، لا مؤشرات تفاعل ضبابية.",
      },
      {
        q: "هل يمكن استخدامه خارج ساعات المدرسة؟",
        a: "أكواد الصفوف مقيّدة بساعات المدرسة الفعّالة (افتراضيًا الأحد–الخميس 7:30–15:00، قابلة للضبط). خارج هذه النافذة يعطي الكود وصولاً قاموسيًا أساسيًا فقط. هذا يمنع تحوّل كود المدرسة إلى بديل مجاني لخطة Family على مدار اليوم.",
      },
      {
        q: "ماذا لو كانت مدرستي أكثر من 500 طالب؟",
        a: "استخدم Schools Large (149 دولارًا شهريًا، حتى 500 طالب) لأي مدرسة دون 500. لـ 500+ طالب أو شبكات متعدّدة المواقع، تواصل معنا لخطة مخصّصة.",
      },
      {
        q: "كيف يشرح Gadit كلمة؟ هل هو ترجمة فقط؟",
        a: "Gadit ليس قاموس ترجمة. Gadit يعرّف ويشرح الكلمات. لكل كلمة يعطي كل معانيها، ثلاث جمل أمثلة لكل معنى، اشتقاق الكلمة، ووضعًا سياقيًّا حيث يلصق الطالب الجملة ويختار Gadit المعنى الصحيح. واجهة الطالب بلغته، لكن عمق الشرح متساوٍ في كل لغة.",
      },
    ],
    finalH2: "أوقف الفشل الصامت.",
    finalBody: "أعطِ معلميك الأداة لرؤية ما لا يفهمه صفّهم بالضبط. تبدأ التجربة في دقيقتين. بلا تقنية معلومات، بلا مشتريات، بلا نماذج لأولياء الأمور.",
    finalCta: "ابدأ التجربة المجانية لـ 14 يومًا",
    finalNote: "لا حاجة لبطاقة ائتمان للتجربة. ألغِ في أي وقت.",
    mockupRoster: "قائمة الصف، 22 طالبًا",
    mockupSearches: "الأكثر بحثًا هذا الأسبوع",
    mockupStudent1: "مايا بحثت عن «التركيب الضوئي»",
    mockupStudent2: "يوسي بحث عن «الميتوكوندريا» ×2",
    mockupStudent3: "نوعا بحثت عن «الديمقراطية»",
    mockupWordExample: "التركيب الضوئي",
    mockupExampleDef: "العملية التي تستخدم فيها النباتات الخضراء ضوء الشمس لتحويل الماء وثاني أكسيد الكربون إلى غذاء.",
    mockupExampleEx: "يحدث التركيب الضوئي بشكل أساسي في أوراق النبات.",
  },

  // ─── Czech ────────────────────────────────────────────────────
  cs: {
    heroH1: "Vidět každé slovo, kterému vaše třída nerozumí.",
    heroSub: "Žáci hledají jakékoliv slovo. Vy vidíte, co hledali. Bez žákovských účtů, bez IT nastavení, bez stížností rodičů.",
    heroCta: "Začít 14denní zkušební období",
    heroPriceChip: "Od $69 měsíčně",
    heroTrust: "Samoobsluha. Zrušení kdykoli.",
    probTag: "Problém",
    probH2: "Žák, který nerozumí slovu, nemůže rozumět větě.",
    probBody1: "Žák minul jedno slovo. Nezvedne ruku. Myslí si, že tomu zhruba rozumí. Učitel jde dál. Po pěti slovech je odstavec rozmazaný. Po pěti odstavcích je lekce ztracená.",
    probBody2: "Většina žáků, kteří zaostávají, nejsou méně inteligentní. Mají hromadu slov, kterým nikdy úplně neporozuměli. Každé nové slovo postavené na této hromadě prohlubuje propast. Příčina je pro učitele neviditelná.",
    probCallout1Title: "Narůstající propast",
    probCallout1Body: "Nenaučená slova staví neviditelnou zeď pro každou budoucí lekci.",
    probCallout2Title: "Ztráta času",
    probCallout2Body: "Učitelé ztrácejí 5 až 10 minut z každé lekce vysvětlováním slov.",
    probCallout3Title: "Tiché odpojení",
    probCallout3Body: "Žáci se odpojí, když odstavec obsahuje příliš mnoho neznámých slov.",
    howTag: "Jak to funguje",
    howH2: "Nastavení za 2 minuty. Bez IT.",
    howSub: "Stejný bezproblémový vzor třídního kódu, který už funguje u kvízových her, jen pro porozumění slovům.",
    howStep1Title: "Vytvořte kód třídy",
    howStep1Body: "Ředitel nebo koordinátor ročníku vytvoří třídu v panelu. Systém vygeneruje kód o 6 znacích. Vytiskněte ho jako nálepku pro třídní počítač.",
    howStep2Title: "Žáci se připojí bez účtů",
    howStep2Body: "Žáci navštíví gadit.app/c/CODE v jakémkoli prohlížeči, vyberou si své jméno ze seznamu (jeden klik) a začnou psát slova. Bez instalace aplikace, bez e-mailu, bez hesla.",
    howStep3Title: "Učitelé vidí, co třída hledala",
    howStep3Body: "Každé vyhledávání se zobrazí v panelu se jménem žáka. Vidíte, co každý žák hledal, kdy, a se kterými slovy měla potíže celá třída.",
    teacherTag: "Pohled učitele",
    teacherH2: "Panel, na který jste čekali.",
    teacherSub: "Žádné vágní metriky zapojení. Konkrétní slova, konkrétní žáci, konkrétní okamžiky.",
    teacherB1: "Historie hledání každého žáka s časovými razítky",
    teacherB2: "Nejhledanější slova třídy tento týden",
    teacherB3: "Opakovaná hledání signalizující křehké porozumění",
    teacherB4: "Filtrování podle data, žáka nebo slova",
    privTag: "Soukromí v architektuře",
    privH2: "Plná viditelnost pro učitele. Nulové riziko dat pro školu.",
    privSub: "Neshromažďujeme žádné osobní údaje žáků. Ne proto, že je dobře skrýváme, ale proto, že je vůbec neshromažďujeme. Architektura je dodržování předpisů.",
    privPoint1: "Bez žákovských účtů. Bez e-mailů, bez hesel, bez identifikátorů.",
    privPoint2: "Žádné osobní informace neopouštějí školu. Vyhledávání jsou označena pouze jménem ze seznamu.",
    privPoint3: "Třídní kódy fungují jen ve školních hodinách. Nastavitelné pro každou školu.",
    privPoint4: "COPPA, GDPR-K a izraelský zákon o ochraně dětí jsou pokryty s rezervou.",
    privKahoot: "Připojení jednoduché jako u třídního kvízu. Postaveno pro porozumění slovům a viditelnost pro učitele.",
    priceTag: "Ceny",
    priceH2: "Jednoduše. Pod prahem schvalování.",
    priceSub: "Samoobsluha přes Stripe. Bez prodejních hovorů, bez ukázek, bez objednávek.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Až 100 žáků",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Až 500 žáků",
    priceIncludesTitle: "Oba tarify obsahují",
    priceIncludes: [
      "Neomezený počet tříd",
      "Plný panel učitele",
      "Seznam výběru jména žáka",
      "Třídní kódy vázané na čas",
      "Žákovské rozhraní ve 13 jazycích",
      "14denní zkušební období",
    ],
    priceCta: "Začít 14denní zkušební období",
    priceLarger: "Více než 500 žáků? Kontaktujte nás ohledně okresního plánu.",
    faqTag: "Časté dotazy",
    faqH2: "Otázky, které ředitelé kladou před zkouškou.",
    faq: [
      {
        q: "Když nejsou přihlášení, jak poznám, který žák co hledal?",
        a: "Učitel předem nahraje seznam jmen do panelu. Když žák navštíví URL třídy, vybere si své jméno jedním kliknutím. Každé vyhledávání je označeno tímto jménem. Bez e-mailu, bez hesla, bez osobních údajů.",
      },
      {
        q: "Je to v souladu s COPPA? Dostanu stížnost od rodičů?",
        a: "Ano. Gadit vůbec neshromažďuje osobní údaje žáků. Bez zakládání účtů, bez sběru e-mailů, bez data narození, bez identifikátorů. Nejsou žádná data, která by se dala zneužít. Architektura s rezervou splňuje COPPA, GDPR-K i izraelský zákon o ochraně dětí.",
      },
      {
        q: "Musí žáci instalovat aplikaci?",
        a: "Ne. Funguje jakýkoli prohlížeč. Žáci navštíví gadit.app/c/CODE na třídním počítači (nebo na jakémkoli zařízení s prohlížečem). Bez obchodu s aplikacemi, bez IT.",
      },
      {
        q: "Vyžaduje to nastavení IT nebo SSO?",
        a: "Ne. Ředitel nebo koordinátor ročníku vytvoří třídu za dvě minuty a sdílí kód s učiteli. IT se nezúčastní žádného kroku.",
      },
      {
        q: "Co panel skutečně ukazuje?",
        a: "Hledání slov každého žáka s časovými razítky, slova, která třída hledala nejčastěji tento týden, a vzory opakovaných hledání signalizující křehké porozumění. Skutečná data o porozumění třídy, ne vágní metriky zapojení.",
      },
      {
        q: "Lze to použít mimo školní hodiny?",
        a: "Třídní kódy jsou vázány na aktivní hodiny školy (výchozí neděle–čtvrtek 7:30–15:00, nastavitelné). Mimo toto okno dává kód pouze základní přístup ke slovníku. To zabraňuje, aby se školní kód stal volnou náhradou tarifu Family 24 hodin denně.",
      },
      {
        q: "Co když má moje škola více než 500 žáků?",
        a: "Použijte Schools Large ($149 měsíčně, až 500 žáků) pro jakoukoli školu pod 500. Pro 500+ žáků nebo víceokresní sítě nás kontaktujte ohledně plánu na míru.",
      },
      {
        q: "Jak Gadit vysvětluje slovo? Je to jen překlad?",
        a: "Gadit není překladový slovník. Gadit definuje a vysvětluje slova. Pro každé slovo dává všechny významy, tři ukázkové věty na každý význam, etymologii a kontextový režim, ve kterém žák vloží větu a Gadit vybere správný význam. Rozhraní žáka v jeho jazyce, ale hloubka vysvětlení je stejná v každém jazyce.",
      },
    ],
    finalH2: "Zastavte tiché selhání.",
    finalBody: "Dejte svým učitelům nástroj, aby viděli, čemu přesně jejich třída nerozumí. Zkouška začne za 2 minuty. Bez IT, bez schvalování, bez formulářů pro rodiče.",
    finalCta: "Začít 14denní zkušební období",
    finalNote: "Pro zkoušku není potřeba platební karta. Zrušení kdykoli.",
    mockupRoster: "Seznam třídy, 22 žáků",
    mockupSearches: "Nejhledanější tento týden",
    mockupStudent1: "Maja hledala „fotosyntéza\"",
    mockupStudent2: "Jossi hledal „mitochondrie\" ×2",
    mockupStudent3: "Noa hledala „demokracie\"",
    mockupWordExample: "fotosyntéza",
    mockupExampleDef: "Proces, ve kterém zelené rostliny využívají sluneční světlo k přeměně vody a oxidu uhličitého na potravu.",
    mockupExampleEx: "Fotosyntéza probíhá hlavně v listech rostliny.",
  },

  // ─── Slovak ───────────────────────────────────────────────────
  sk: {
    heroH1: "Vidieť každé slovo, ktorému vaša trieda nerozumie.",
    heroSub: "Žiaci hľadajú akékoľvek slovo. Vy vidíte, čo hľadali. Bez žiackych účtov, bez IT nastavenia, bez sťažností rodičov.",
    heroCta: "Začať 14-dňovú skúšobnú dobu",
    heroPriceChip: "Od $69 mesačne",
    heroTrust: "Samoobsluha. Zrušenie kedykoľvek.",
    probTag: "Problém",
    probH2: "Žiak, ktorý nerozumie slovu, nedokáže rozumieť vete.",
    probBody1: "Žiak nevie jedno slovo. Nezdvíha ruku. Myslí si, že tomu zhruba rozumie. Učiteľ pokračuje. Po piatich slovách je odsek rozmazaný. Po piatich odsekoch je lekcia stratená.",
    probBody2: "Väčšina žiakov, ktorí zaostávajú, nie sú menej inteligentní. Majú kopu slov, ktorým nikdy úplne neporozumeli. Každé nové slovo postavené na tejto kope prehlbuje priepasť. Príčina je pre učiteľa neviditeľná.",
    probCallout1Title: "Narastajúca priepasť",
    probCallout1Body: "Nenaučené slová stavajú neviditeľnú stenu pre každú budúcu lekciu.",
    probCallout2Title: "Strata času",
    probCallout2Body: "Učitelia strácajú 5 až 10 minút z každej hodiny vysvetľovaním slov.",
    probCallout3Title: "Tiché odpojenie",
    probCallout3Body: "Žiaci sa odpoja, keď odsek obsahuje priveľa neznámych slov.",
    howTag: "Ako to funguje",
    howH2: "Nastavenie za 2 minúty. Bez IT.",
    howSub: "Rovnaký bezproblémový vzor triedneho kódu, ktorý už funguje pri kvízových hrách, len pre porozumenie slovám.",
    howStep1Title: "Vytvorte kód triedy",
    howStep1Body: "Riaditeľ alebo koordinátor ročníka vytvorí triedu v paneli. Systém vygeneruje kód zo 6 znakov. Vytlačte ho ako nálepku pre triedny počítač.",
    howStep2Title: "Žiaci sa pripoja bez účtov",
    howStep2Body: "Žiaci navštívia gadit.app/c/CODE v akomkoľvek prehliadači, vyberú si svoje meno zo zoznamu (jeden klik) a začnú písať slová. Bez inštalácie aplikácie, bez e-mailu, bez hesla.",
    howStep3Title: "Učitelia vidia, čo trieda hľadala",
    howStep3Body: "Každé vyhľadávanie sa zobrazí v paneli s menom žiaka. Vidíte, čo každý žiak hľadal, kedy, a s ktorými slovami mala problémy celá trieda.",
    teacherTag: "Pohľad učiteľa",
    teacherH2: "Panel, na ktorý ste čakali.",
    teacherSub: "Žiadne vágne metriky zapojenia. Konkrétne slová, konkrétni žiaci, konkrétne okamihy.",
    teacherB1: "História hľadania každého žiaka s časovými značkami",
    teacherB2: "Najhľadanejšie slová triedy tento týždeň",
    teacherB3: "Opakované hľadania signalizujúce krehké porozumenie",
    teacherB4: "Filtrovanie podľa dátumu, žiaka alebo slova",
    privTag: "Súkromie v architektúre",
    privH2: "Plná viditeľnosť pre učiteľov. Nulové riziko údajov pre školu.",
    privSub: "Nezhromažďujeme žiadne osobné údaje žiakov. Nie preto, že ich dobre skrývame, ale preto, že ich vôbec nezhromažďujeme. Architektúra je dodržiavanie predpisov.",
    privPoint1: "Bez žiackych účtov. Bez e-mailov, bez hesiel, bez identifikátorov.",
    privPoint2: "Žiadne osobné informácie neopúšťajú školu. Hľadania sú označené iba menom zo zoznamu.",
    privPoint3: "Triedne kódy fungujú len v školských hodinách. Nastaviteľné pre každú školu.",
    privPoint4: "COPPA, GDPR-K a izraelský zákon o ochrane detí sú pokryté s rezervou.",
    privKahoot: "Pripojenie jednoduché ako pri triednom kvíze. Postavené pre porozumenie slovám a viditeľnosť pre učiteľa.",
    priceTag: "Ceny",
    priceH2: "Jednoducho. Pod prahom schvaľovania.",
    priceSub: "Samoobsluha cez Stripe. Bez predajných hovorov, bez ukážok, bez objednávok.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Až 100 žiakov",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Až 500 žiakov",
    priceIncludesTitle: "Oba tarify obsahujú",
    priceIncludes: [
      "Neobmedzený počet tried",
      "Plný panel učiteľa",
      "Zoznam výberu mena žiaka",
      "Triedne kódy viazané na čas",
      "Žiacke rozhranie v 13 jazykoch",
      "14-dňová skúšobná doba",
    ],
    priceCta: "Začať 14-dňovú skúšobnú dobu",
    priceLarger: "Viac ako 500 žiakov? Kontaktujte nás ohľadom okresného plánu.",
    faqTag: "Časté otázky",
    faqH2: "Otázky, ktoré riaditelia kladú pred skúškou.",
    faq: [
      {
        q: "Keď nie sú prihlásenia, ako spoznám, ktorý žiak čo hľadal?",
        a: "Učiteľ vopred nahrá zoznam mien do panela. Keď žiak navštívi URL triedy, vyberie si svoje meno jedným klikom. Každé hľadanie je označené týmto menom. Bez e-mailu, bez hesla, bez osobných údajov.",
      },
      {
        q: "Je to v súlade s COPPA? Dostanem sťažnosť od rodičov?",
        a: "Áno. Gadit vôbec nezhromažďuje osobné údaje žiakov. Bez zakladania účtov, bez zberu e-mailov, bez dátumov narodenia, bez identifikátorov. Nie sú žiadne údaje, ktoré by sa dali zneužiť. Architektúra s rezervou spĺňa COPPA, GDPR-K aj izraelský zákon o ochrane detí.",
      },
      {
        q: "Musia žiaci inštalovať aplikáciu?",
        a: "Nie. Funguje akýkoľvek prehliadač. Žiaci navštívia gadit.app/c/CODE na triednom počítači (alebo na akomkoľvek zariadení s prehliadačom). Bez obchodu s aplikáciami, bez IT.",
      },
      {
        q: "Vyžaduje to nastavenie IT alebo SSO?",
        a: "Nie. Riaditeľ alebo koordinátor ročníka vytvorí triedu za dve minúty a zdieľa kód s učiteľmi. IT sa nezúčastní žiadneho kroku.",
      },
      {
        q: "Čo panel skutočne ukazuje?",
        a: "Hľadania slov každého žiaka s časovými značkami, slová, ktoré trieda hľadala najčastejšie tento týždeň, a vzory opakovaných hľadaní signalizujúce krehké porozumenie. Skutočné údaje o porozumení triedy, nie vágne metriky zapojenia.",
      },
      {
        q: "Dá sa to použiť mimo školských hodín?",
        a: "Triedne kódy sú viazané na aktívne hodiny školy (predvolene nedeľa–štvrtok 7:30–15:00, nastaviteľné). Mimo tohto okna dáva kód iba základný prístup k slovníku. To zabraňuje, aby sa školský kód stal voľnou náhradou tarifu Family 24 hodín denne.",
      },
      {
        q: "Čo ak má moja škola viac ako 500 žiakov?",
        a: "Použite Schools Large ($149 mesačne, až 500 žiakov) pre akúkoľvek školu pod 500. Pre 500+ žiakov alebo viacokresné siete nás kontaktujte ohľadom plánu na mieru.",
      },
      {
        q: "Ako Gadit vysvetľuje slovo? Je to len preklad?",
        a: "Gadit nie je prekladový slovník. Gadit definuje a vysvetľuje slová. Pre každé slovo dáva všetky významy, tri ukážkové vety na každý význam, etymológiu a kontextový režim, v ktorom žiak vloží vetu a Gadit vyberie správny význam. Rozhranie žiaka v jeho jazyku, ale hĺbka vysvetlenia je rovnaká v každom jazyku.",
      },
    ],
    finalH2: "Zastavte tiché zlyhanie.",
    finalBody: "Dajte svojim učiteľom nástroj, aby videli, čomu presne ich trieda nerozumie. Skúška sa začne za 2 minúty. Bez IT, bez schvaľovania, bez formulárov pre rodičov.",
    finalCta: "Začať 14-dňovú skúšobnú dobu",
    finalNote: "Pre skúšku nie je potrebná platobná karta. Zrušenie kedykoľvek.",
    mockupRoster: "Zoznam triedy, 22 žiakov",
    mockupSearches: "Najhľadanejšie tento týždeň",
    mockupStudent1: "Maja hľadala „fotosyntéza\"",
    mockupStudent2: "Jossi hľadal „mitochondrie\" ×2",
    mockupStudent3: "Noa hľadala „demokracia\"",
    mockupWordExample: "fotosyntéza",
    mockupExampleDef: "Proces, v ktorom zelené rastliny využívajú slnečné svetlo na premenu vody a oxidu uhličitého na potravu.",
    mockupExampleEx: "Fotosyntéza prebieha hlavne v listoch rastliny.",
  },
};

export function SchoolsLandingClient() {
  const { user, plan, schoolId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const t = COPY[lang] ?? COPY.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close mobile menu on outside-click + Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Auto-redirect for school owners REMOVED (2026-06-29): Gadi wants
  // school owners to be able to see the landing too, e.g. for QA or to
  // share the URL with a colleague. The "Schools" link in the main
  // topbar is now smart on its own (HomeClient routes school owners
  // straight to /schools/manage), so direct visitors to /schools who
  // are school owners are intentional and should see the page.
  void router; // keep router available for future use without lint complaint

  return (
    <div className="wordbook wb-shell-page wb-schools-landing" dir={dir}>
      {/* Full Gadit topbar — identical to the homepage so brand chrome
          stays consistent across surfaces. "Schools" is highlighted as
          the active page. Smart routing: for users who already own a
          schools subscription, the Schools link points at their
          dashboard so they don't get bounced from the marketing copy. */}
      <header className={`wb-shell-topbar ${menuOpen ? "is-menu-open" : ""}`}>
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href("/")} className="wb-shell-navlink wb-shell-navlink-icon" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink">{v2(lang, "navFeatures") || "Features"}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          )}
          <Link
            href={href(schoolId ? "/schools/manage" : "/schools")}
            className="wb-shell-navlink is-active"
          >
            Schools
          </Link>
          <Link href={href("/pricing")} className="wb-shell-navlink">{v2(lang, "navPricing") || "Pricing"}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/affiliates")} className="wb-shell-navlink">{v2(lang, "navAffiliates")}</Link>
          )}
        </nav>
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
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
                Sign in
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
              url="https://www.gadit.app/"
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
          <button
            ref={burgerRef}
            type="button"
            className="wb-shell-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
            <Link href={href("/features")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navFeatures") || "Features"}
            </Link>
            <Link href={href(schoolId ? "/schools/manage" : "/schools")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              Schools
            </Link>
            <Link href={href("/pricing")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {v2(lang, "navPricing") || "Pricing"}
            </Link>
            <div className="wb-shell-mobile-menu-sep" />
            {user ? (
              <Link href={href("/account")} onClick={() => setMenuOpen(false)}>
                {(user.email?.[0] || "G").toUpperCase()} · {user.email ?? "Account"}
              </Link>
            ) : (
              <button type="button" onClick={() => { setMenuOpen(false); promptLogin({ mode: "signin" }); }}>
                Sign in
              </button>
            )}
          </div>
        )}
      </header>

      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <span className="wb-schools-pricechip">{t.heroPriceChip}</span>
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">{t.heroSub}</p>
          <div className="wb-schools-hero-actions">
            <Link href={href("/pricing")} className="wb-schools-cta">
              {t.heroCta}
            </Link>
            <span className="wb-schools-hero-trust">{t.heroTrust}</span>
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
                <div className="wb-schools-mockup-example-label">{lang === "he" ? "דוגמה" : "Example"}</div>
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
              <div className="wb-schools-step-num">Step 1</div>
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
              <div className="wb-schools-step-num">Step 2</div>
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
              <div className="wb-schools-step-num">Step 3</div>
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
                <div className="wb-schools-mockup-title">/schools/manage — Class 7B</div>
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
      <section className="wb-schools-section wb-schools-pricing">
        <div className="wb-schools-section-inner">
          <span className="wb-schools-tag">{t.priceTag}</span>
          <h2 className="wb-schools-h2">{t.priceH2}</h2>
          <p className="wb-schools-section-sub">{t.priceSub}</p>
          <div className="wb-schools-price-grid">
            <div className="wb-schools-price-card">
              <div className="wb-schools-price-name">{t.priceSmallName}</div>
              <div className="wb-schools-price-amount">
                <span className="wb-schools-price-amount-num" dir="ltr">{t.priceSmallAmount}</span>
                <span className="wb-schools-price-amount-period">/ month</span>
              </div>
              <div className="wb-schools-price-students">{t.priceSmallStudents}</div>
              <Link href={href("/pricing")} className="wb-schools-cta wb-schools-cta-block">
                {t.priceCta}
              </Link>
            </div>
            <div className="wb-schools-price-card wb-schools-price-card-large">
              <div className="wb-schools-price-name">{t.priceLargeName}</div>
              <div className="wb-schools-price-amount">
                <span className="wb-schools-price-amount-num" dir="ltr">{t.priceLargeAmount}</span>
                <span className="wb-schools-price-amount-period">/ month</span>
              </div>
              <div className="wb-schools-price-students">{t.priceLargeStudents}</div>
              <Link href={href("/pricing")} className="wb-schools-cta wb-schools-cta-block">
                {t.priceCta}
              </Link>
            </div>
          </div>
          <div className="wb-schools-includes">
            <div className="wb-schools-includes-title">{t.priceIncludesTitle}</div>
            <div className="wb-schools-includes-list">
              {t.priceIncludes.map((line) => (
                <div key={line} className="wb-schools-includes-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="wb-schools-price-larger">{t.priceLarger}</p>
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
          <Link href={href("/pricing")} className="wb-schools-cta wb-schools-cta-big">
            {t.finalCta}
          </Link>
          <div className="wb-schools-final-note">{t.finalNote}</div>
        </div>
      </section>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>Pricing</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
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
