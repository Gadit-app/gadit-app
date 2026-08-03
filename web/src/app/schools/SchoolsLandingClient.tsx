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
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
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
    heroH1: "Every student understands the lesson.",
    heroSub: "Any hard word, in any of 14 languages, explained on the spot.",
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
      "Student UI in 14 languages",
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
    heroH1: "כל תלמיד מבין את השיעור.",
    heroSub: "כל מילה קשה, ב-14 שפות, מוסברת מיד.",
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
      "ממשק תלמיד ב-14 שפות",
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
    heroH1: "Каждый ученик понимает урок.",
    heroSub: "Любое трудное слово, на любом из 14 языков, объяснено сразу.",
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
      "Интерфейс ученика на 14 языках",
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
    heroH1: "كل طالب يفهم الدرس.",
    heroSub: "أي كلمة صعبة، بأي من 14 لغة، تُشرح في الحال.",
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
      "واجهة طالب بـ 14 لغة",
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
    heroH1: "Každý žák rozumí učivu.",
    heroSub: "Každé těžké slovo, v kterémkoli ze 14 jazyků, hned vysvětlené.",
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
      "Žákovské rozhraní ve 14 jazycích",
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
    heroH1: "Každý žiak rozumie učivu.",
    heroSub: "Každé ťažké slovo, v ktoromkoľvek zo 14 jazykov, hneď vysvetlené.",
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
      "Žiacke rozhranie v 14 jazykoch",
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

  // ─── Hindi ────────────────────────────────────────────────────
  hi: {
    heroH1: "हर छात्र पाठ समझता है।",
    heroSub: "कोई भी कठिन शब्द, 14 में से किसी भी भाषा में, तुरंत समझाया गया।",
    heroCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    heroPriceChip: "$69 / माह से",
    heroTrust: "स्वयं-सेवा। कभी भी रद्द करें।",
    probTag: "समस्या",
    probH2: "जो छात्र शब्द को नहीं समझता वह वाक्य को नहीं समझ सकता।",
    probBody1: "एक छात्र एक शब्द चूकता है। हाथ नहीं उठाता। सोचता है कि वह लगभग समझता है। शिक्षक आगे बढ़ जाते हैं। पाँच शब्दों के बाद, अनुच्छेद धुंधला हो जाता है। पाँच अनुच्छेदों के बाद, पाठ खो जाता है।",
    probBody2: "अधिकांश छात्र जो पीछे रह जाते हैं वे कम बुद्धिमान नहीं हैं। उनके पास शब्दों का एक ढेर है जिन्हें उन्होंने कभी पूरी तरह नहीं समझा। हर नया शब्द जो उस ढेर पर बनता है, खाई को बढ़ाता है। शिक्षक के लिए कारण अदृश्य है।",
    probCallout1Title: "बढ़ती खाई",
    probCallout1Body: "अनसीखे शब्द हर भविष्य के पाठ के लिए एक अदृश्य दीवार बनाते हैं।",
    probCallout2Title: "समय की हानि",
    probCallout2Body: "शिक्षक हर पाठ में शब्दों को समझाने पर 5 से 10 मिनट खो देते हैं।",
    probCallout3Title: "मूक वियोग",
    probCallout3Body: "जब अनुच्छेद में बहुत सारे अपरिचित शब्द होते हैं तो छात्र ध्यान देना बंद कर देते हैं।",
    howTag: "यह कैसे काम करता है",
    howH2: "2 मिनट में सेटअप। कोई IT नहीं।",
    howSub: "वही बिना-रुकावट का कक्षा-कोड पैटर्न जो पहले से क्विज़ गेम्स में काम करता है, शब्द समझ के लिए बनाया गया।",
    howStep1Title: "कक्षा कोड बनाएँ",
    howStep1Body: "प्रधानाचार्य या कक्षा समन्वयक डैशबोर्ड में एक कक्षा बनाते हैं। सिस्टम 6 अक्षरों का कोड जनरेट करता है। कक्षा के कंप्यूटर के लिए स्टिकर के रूप में प्रिंट करें।",
    howStep2Title: "छात्र बिना खाते के जुड़ते हैं",
    howStep2Body: "छात्र किसी भी ब्राउज़र में gadit.app/c/CODE पर जाते हैं, सूची से अपना नाम चुनते हैं (एक क्लिक), और शब्द टाइप करना शुरू करते हैं। न ऐप इंस्टॉल, न ईमेल, न पासवर्ड।",
    howStep3Title: "शिक्षक देखते हैं कि कक्षा ने क्या खोजा",
    howStep3Body: "हर खोज छात्र के नाम के साथ डैशबोर्ड में आती है। आप देखते हैं कि हर छात्र ने क्या खोजा, कब, और किन शब्दों से पूरी कक्षा ने संघर्ष किया।",
    teacherTag: "शिक्षक का दृश्य",
    teacherH2: "वह डैशबोर्ड जिसका आप इंतज़ार कर रहे थे।",
    teacherSub: "अस्पष्ट जुड़ाव मेट्रिक्स नहीं। विशिष्ट शब्द, विशिष्ट छात्र, विशिष्ट क्षण।",
    teacherB1: "हर छात्र का खोज इतिहास समय-चिह्न के साथ",
    teacherB2: "इस सप्ताह कक्षा द्वारा सबसे ज़्यादा खोजे गए शब्द",
    teacherB3: "बार-बार खोज जो नाज़ुक समझ का संकेत देती है",
    teacherB4: "तिथि, छात्र या शब्द के अनुसार फ़िल्टर",
    privTag: "वास्तुकला में गोपनीयता",
    privH2: "शिक्षकों के लिए पूर्ण दृश्यता। स्कूल के लिए शून्य डेटा जोखिम।",
    privSub: "हम छात्रों का कोई व्यक्तिगत डेटा एकत्र नहीं करते। इसलिए नहीं कि हम इसे अच्छी तरह छिपाते हैं, बल्कि इसलिए कि हम इसे एकत्र ही नहीं करते। वास्तुकला ही अनुपालन है।",
    privPoint1: "कोई छात्र खाते नहीं। न ईमेल, न पासवर्ड, न पहचानकर्ता।",
    privPoint2: "कोई व्यक्तिगत जानकारी स्कूल से बाहर नहीं जाती। खोजें केवल सूची के नाम से चिह्नित होती हैं।",
    privPoint3: "कक्षा कोड केवल स्कूल के समय में काम करते हैं। हर स्कूल के लिए कॉन्फ़िगर करने योग्य।",
    privPoint4: "COPPA, GDPR-K, और इज़राइली छात्र गोपनीयता कानून आराम से पूरे होते हैं।",
    privKahoot: "कक्षा क्विज़ गेम की तरह आसानी से जुड़ते हैं। शब्द समझ और शिक्षक दृश्यता के लिए बनाया गया।",
    priceTag: "कीमत",
    priceH2: "सरल। खरीद-सीमा से नीचे।",
    priceSub: "Stripe के माध्यम से स्वयं-सेवा। बिक्री कॉल नहीं, डेमो नहीं, खरीद आदेश नहीं।",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "100 छात्रों तक",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "500 छात्रों तक",
    priceIncludesTitle: "दोनों योजनाओं में शामिल",
    priceIncludes: [
      "असीमित कक्षाएँ",
      "पूर्ण शिक्षक डैशबोर्ड",
      "छात्र नाम चयन सूची",
      "समय-बद्ध कक्षा कोड",
      "14 भाषाओं में छात्र इंटरफ़ेस",
      "14 दिन का मुफ्त ट्रायल",
    ],
    priceCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    priceLarger: "500 से अधिक छात्र? ज़िला योजना के लिए संपर्क करें।",
    faqTag: "अक्सर पूछे जाने वाले प्रश्न",
    faqH2: "प्रधानाचार्य ट्रायल से पहले क्या पूछते हैं।",
    faq: [
      {
        q: "अगर लॉगिन नहीं है, तो मुझे कैसे पता चलेगा कि किस छात्र ने क्या खोजा?",
        a: "शिक्षक डैशबोर्ड में पहले नामों की सूची लोड करते हैं। जब छात्र कक्षा URL पर जाता है, तो वह एक क्लिक से अपना नाम चुनता है। हर खोज उस नाम से चिह्नित होती है। न ईमेल, न पासवर्ड, न कोई व्यक्तिगत डेटा।",
      },
      {
        q: "क्या यह COPPA-सुरक्षित है? क्या मुझे अभिभावक की शिकायत मिलेगी?",
        a: "हाँ। Gadit छात्रों की कोई व्यक्तिगत जानकारी बिल्कुल भी एकत्र नहीं करता। न खाता निर्माण, न ईमेल संग्रह, न जन्मतिथि, न पहचानकर्ता। दुरुपयोग के लिए कोई डेटा नहीं है। वास्तुकला आराम से COPPA, GDPR-K, और इज़राइली छात्र गोपनीयता कानून को पार करती है।",
      },
      {
        q: "क्या छात्रों को ऐप इंस्टॉल करना होगा?",
        a: "नहीं। कोई भी ब्राउज़र काम करता है। छात्र कक्षा के कंप्यूटर पर (या ब्राउज़र वाले किसी भी डिवाइस पर) gadit.app/c/CODE पर जाते हैं। न ऐप स्टोर, न IT की भागीदारी।",
      },
      {
        q: "क्या इसे IT या SSO सेटअप की आवश्यकता है?",
        a: "नहीं। प्रधानाचार्य या कक्षा समन्वयक दो मिनट में कक्षा बनाते हैं और शिक्षकों के साथ कोड साझा करते हैं। IT किसी भी कदम पर शामिल नहीं है।",
      },
      {
        q: "डैशबोर्ड वास्तव में क्या दिखाता है?",
        a: "हर छात्र की शब्द खोजें समय-चिह्नों के साथ, इस सप्ताह कक्षा ने सबसे ज़्यादा कौन से शब्द खोजे, और बार-बार होने वाली खोजों के पैटर्न जो नाज़ुक समझ का संकेत देते हैं। वास्तविक कक्षा समझ डेटा, अस्पष्ट जुड़ाव मेट्रिक्स नहीं।",
      },
      {
        q: "क्या इसका उपयोग स्कूल समय के बाहर किया जा सकता है?",
        a: "कक्षा कोड स्कूल के सक्रिय घंटों से बंधे हैं (डिफ़ॉल्ट रूप से रविवार से गुरुवार 7:30 से 15:00, कॉन्फ़िगर करने योग्य)। इस विंडो के बाहर कोड केवल बेसिक डिक्शनरी एक्सेस देता है। यह स्कूल कोड को Family प्लान के 24/7 मुफ्त विकल्प बनने से रोकता है।",
      },
      {
        q: "अगर मेरे स्कूल में 500 से अधिक छात्र हैं तो क्या?",
        a: "500 से कम के किसी भी स्कूल के लिए Schools Large ($149 / माह, 500 छात्रों तक) का उपयोग करें। 500 से अधिक छात्रों या बहु-साइट ज़िलों के लिए, कस्टम योजना के लिए संपर्क करें।",
      },
      {
        q: "Gadit एक शब्द को कैसे समझाता है? क्या यह सिर्फ अनुवाद है?",
        a: "Gadit अनुवाद शब्दकोश नहीं है। Gadit शब्दों को परिभाषित और समझाता है। हर शब्द के लिए वह सभी अर्थ देता है, हर अर्थ के लिए तीन उदाहरण वाक्य, व्युत्पत्ति, और एक संदर्भ मोड जहाँ छात्र वाक्य चिपकाते हैं और Gadit सही अर्थ चुनता है। छात्र का इंटरफ़ेस उनकी भाषा में है, लेकिन व्याख्या की गहराई हर भाषा में समान है।",
      },
    ],
    finalH2: "मूक विफलता मोड को रोकें।",
    finalBody: "अपने शिक्षकों को वह उपकरण दें जिससे वे ठीक से देख सकें कि उनकी कक्षा क्या नहीं समझती। ट्रायल 2 मिनट में शुरू होता है। न IT, न खरीद, न अभिभावक फॉर्म।",
    finalCta: "14 दिन का मुफ्त ट्रायल शुरू करें",
    finalNote: "ट्रायल के लिए क्रेडिट कार्ड की आवश्यकता नहीं। कभी भी रद्द करें।",
    mockupRoster: "कक्षा सूची, 22 छात्र",
    mockupSearches: "इस सप्ताह सबसे ज़्यादा खोजे गए",
    mockupStudent1: "माया ने 'प्रकाशसंश्लेषण' खोजा",
    mockupStudent2: "योसी ने 'माइटोकॉन्ड्रिया' ×2 खोजा",
    mockupStudent3: "नोआ ने 'लोकतंत्र' खोजा",
    mockupWordExample: "प्रकाशसंश्लेषण",
    mockupExampleDef: "वह प्रक्रिया जिससे हरे पौधे सूरज की रोशनी का उपयोग पानी और कार्बन डाइऑक्साइड को भोजन में बदलने के लिए करते हैं।",
    mockupExampleEx: "प्रकाशसंश्लेषण मुख्य रूप से पौधे की पत्तियों में होता है।",
  },

  // ─── Amharic ──────────────────────────────────────────────────
  am: {
    heroH1: "እያንዳንዱ ተማሪ ትምህርቱን ይረዳል።",
    heroSub: "ማንኛውም አስቸጋሪ ቃል፣ ከ14 ቋንቋዎች በአንዱ፣ ወዲያውኑ ይብራራል።",
    heroCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    heroPriceChip: "ከ $69 / ወር ጀምሮ",
    heroTrust: "በራስ አገልግሎት። በማንኛውም ጊዜ ይሰርዙ።",
    probTag: "ችግሩ",
    probH2: "ቃሉን ያልተረዳ ተማሪ ዓረፍተ ነገሩን ሊረዳ አይችልም።",
    probBody1: "አንድ ተማሪ አንድ ቃል ያመልጠዋል። እጁን አያነሳም። በግምት እንደገባው ያስባል። መምህሩ ይቀጥላል። ከአምስት ቃላት በኋላ አንቀጹ ይደበዝዛል። ከአምስት አንቀጾች በኋላ ትምህርቱ ይጠፋል።",
    probBody2: "ወደኋላ የሚቀሩ አብዛኞቹ ተማሪዎች የማሰብ ችሎታ ያነሳቸው አይደሉም። ሙሉ በሙሉ ያልተረዷቸው ቃላት ክምር አላቸው። በዚያ ክምር ላይ የሚገነባ እያንዳንዱ አዲስ ቃል ክፍተቱን ያሰፋዋል። ለመምህሩ ግን ምክንያቱ አይታይም።",
    probCallout1Title: "እያደገ የሚሄድ ክፍተት",
    probCallout1Body: "ያልተማሩ ቃላት ለእያንዳንዱ የወደፊት ትምህርት የማይታይ ግድግዳ ይገነባሉ።",
    probCallout2Title: "የጠፋ ጊዜ",
    probCallout2Body: "መምህራን በእያንዳንዱ ትምህርት ቃላትን በማብራራት ከ 5 እስከ 10 ደቂቃ ያጣሉ።",
    probCallout3Title: "ጸጥተኛ መነጠል",
    probCallout3Body: "አንቀጹ ብዙ የማይታወቁ ቃላት ሲይዝ ተማሪዎች ትኩረት መስጠት ያቆማሉ።",
    howTag: "እንዴት እንደሚሠራ",
    howH2: "በ 2 ደቂቃ ዝግጅት። IT አያስፈልግም።",
    howSub: "በኩዊዝ ጨዋታዎች ውስጥ አስቀድሞ የሚሠራው ያለ እንቅፋት የክፍል ኮድ ዘዴ፣ ለቃላት መረዳት ተገንብቶ።",
    howStep1Title: "የክፍል ኮድ ይፍጠሩ",
    howStep1Body: "ርዕሰ መምህሩ ወይም የክፍል አስተባባሪው በዳሽቦርዱ ውስጥ ክፍል ይፈጥራሉ። ሲስተሙ ባለ 6 ቁምፊ ኮድ ያመነጫል። ለክፍሉ ኮምፒውተር እንደ ተለጣፊ ያትሙት።",
    howStep2Title: "ተማሪዎች ያለ መለያ ይቀላቀላሉ",
    howStep2Body: "ተማሪዎች በማንኛውም አሳሽ ወደ gadit.app/c/CODE ይሄዳሉ፣ ከዝርዝሩ ስማቸውን ይመርጣሉ (አንድ ጠቅታ)፣ እና ቃላት መተየብ ይጀምራሉ። መተግበሪያ መጫን የለም፣ ኢሜይል የለም፣ የይለፍ ቃል የለም።",
    howStep3Title: "መምህራን ክፍሉ ምን እንደፈለገ ያያሉ",
    howStep3Body: "እያንዳንዱ ፍለጋ ከተማሪው ስም ጋር ወደ ዳሽቦርዱ ይገባል። እያንዳንዱ ተማሪ ምን እንደፈለገ፣ መቼ እንደፈለገ፣ እና ክፍሉ በሙሉ በየትኞቹ ቃላት እንደተቸገረ ያያሉ።",
    teacherTag: "የመምህሩ እይታ",
    teacherH2: "ሲጠብቁት የነበረው ዳሽቦርድ።",
    teacherSub: "ግልጽ ያልሆኑ የተሳትፎ መለኪያዎች አይደሉም። የተወሰኑ ቃላት፣ የተወሰኑ ተማሪዎች፣ የተወሰኑ ቅጽበቶች።",
    teacherB1: "የእያንዳንዱ ተማሪ የፍለጋ ታሪክ ከጊዜ ማህተም ጋር",
    teacherB2: "በዚህ ሳምንት ክፍሉ በብዛት የፈለጋቸው ቃላት",
    teacherB3: "ደካማ መረዳትን የሚጠቁሙ ተደጋጋሚ ፍለጋዎች",
    teacherB4: "በቀን፣ በተማሪ ወይም በቃል ማጣራት",
    privTag: "ግላዊነት በአወቃቀሩ ውስጥ",
    privH2: "ለመምህራን ሙሉ ታይነት። ለትምህርት ቤቱ ዜሮ የውሂብ ስጋት።",
    privSub: "ስለ ተማሪዎች ምንም የግል ውሂብ አንሰበስብም። በደንብ ስለምንደብቀው አይደለም፣ ጭራሽ ስለማንሰበስበው ነው። አወቃቀሩ ራሱ ተገዢነት ነው።",
    privPoint1: "የተማሪ መለያዎች የሉም። ኢሜይል የለም፣ የይለፍ ቃል የለም፣ መለያ ምልክት የለም።",
    privPoint2: "ምንም የግል መረጃ ከትምህርት ቤቱ አይወጣም። ፍለጋዎች በዝርዝሩ ስም ብቻ ይመዘገባሉ።",
    privPoint3: "የክፍል ኮዶች የሚሠሩት በትምህርት ሰዓት ብቻ ነው። ለእያንዳንዱ ትምህርት ቤት ማስተካከል ይቻላል።",
    privPoint4: "COPPA፣ GDPR-K እና የእስራኤል የተማሪ ግላዊነት ሕግ በሰፊ ልዩነት ይሟላሉ።",
    privKahoot: "እንደ ክፍል የኩዊዝ ጨዋታ በቀላሉ ይቀላቀላሉ። ለቃላት መረዳት እና ለመምህር ታይነት ተገንብቶ።",
    priceTag: "ዋጋ",
    priceH2: "ቀላል። ከግዢ ፈቃድ ገደብ በታች።",
    priceSub: "በ Stripe በኩል በራስ አገልግሎት። የሽያጭ ጥሪ የለም፣ ዴሞ የለም፣ የግዢ ትእዛዝ የለም።",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "እስከ 100 ተማሪዎች",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "እስከ 500 ተማሪዎች",
    priceIncludesTitle: "በሁለቱም ዕቅዶች የተካተተ",
    priceIncludes: [
      "ያልተገደቡ ክፍሎች",
      "ሙሉ የመምህር ዳሽቦርድ",
      "የተማሪ ስም መምረጫ ዝርዝር",
      "በሰዓት የተገደቡ የክፍል ኮዶች",
      "የተማሪ ገጽታ በ 14 ቋንቋዎች",
      "የ 14 ቀን ነጻ ሙከራ",
    ],
    priceCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    priceLarger: "ከ 500 በላይ ተማሪዎች? ለዲስትሪክት ዕቅድ ያግኙን።",
    faqTag: "ተደጋጋሚ ጥያቄዎች",
    faqH2: "ርዕሰ መምህራን ከሙከራው በፊት የሚጠይቁት።",
    faq: [
      {
        q: "መግቢያ ከሌለ የትኛው ተማሪ ምን እንደፈለገ እንዴት አውቃለሁ?",
        a: "መምህራን በዳሽቦርዱ ውስጥ የመጀመሪያ ስሞችን ዝርዝር ይጭናሉ። ተማሪው ወደ ክፍሉ URL ሲገባ በአንድ ጠቅታ ስሙን ይመርጣል። እያንዳንዱ ፍለጋ በዚያ ስም ይመዘገባል። ኢሜይል የለም፣ የይለፍ ቃል የለም፣ ምንም የግል ውሂብ የለም።",
      },
      {
        q: "ይህ ከ COPPA አንጻር ደህንነቱ የተጠበቀ ነው? ከወላጆች ቅሬታ ይደርሰኛል?",
        a: "አዎ። Gadit ስለ ተማሪዎች ምንም ዓይነት የግል መረጃ ጭራሽ አይሰበስብም። መለያ መፍጠር የለም፣ ኢሜይል መሰብሰብ የለም፣ የልደት ቀን የለም፣ መለያ ምልክት የለም። ለአላግባብ አጠቃቀም የሚሆን ውሂብ የለም። አወቃቀሩ COPPA፣ GDPR-K እና የእስራኤልን የተማሪ ግላዊነት ሕግ በሰፊ ልዩነት ያልፋል።",
      },
      {
        q: "ተማሪዎች መተግበሪያ መጫን አለባቸው?",
        a: "አይ። ማንኛውም አሳሽ ይሠራል። ተማሪዎች በክፍሉ ኮምፒውተር ላይ (ወይም አሳሽ ባለው ማንኛውም መሣሪያ) ወደ gadit.app/c/CODE ይሄዳሉ። የመተግበሪያ መደብር የለም፣ የ IT ተሳትፎ የለም።",
      },
      {
        q: "IT ወይም የ SSO ዝግጅት ያስፈልገዋል?",
        a: "አይ። ርዕሰ መምህሩ ወይም የክፍል አስተባባሪው በሁለት ደቂቃ ውስጥ ክፍሎችን ፈጥረው ኮዶቹን ለመምህራን ያካፍላሉ። IT በየትኛውም ደረጃ አይሳተፍም።",
      },
      {
        q: "ዳሽቦርዱ በትክክል ምን ያሳያል?",
        a: "የእያንዳንዱ ተማሪ የቃላት ፍለጋዎች ከጊዜ ማህተም ጋር፣ በዚህ ሳምንት ክፍሉ በብዛት የፈለጋቸው ቃላት፣ እና ደካማ መረዳትን የሚጠቁሙ የተደጋጋሚ ፍለጋ ቅጦች። እውነተኛ የክፍል የመረዳት ውሂብ፣ ግልጽ ያልሆኑ የተሳትፎ መለኪያዎች አይደሉም።",
      },
      {
        q: "ከትምህርት ሰዓት ውጭ መጠቀም ይቻላል?",
        a: "የክፍል ኮዶች ከትምህርት ቤቱ ንቁ ሰዓታት ጋር የተያያዙ ናቸው (በነባሪ ከእሁድ እስከ ሐሙስ ከ 7:30 እስከ 15:00፣ ማስተካከል ይቻላል)። ከዚህ ጊዜ ውጭ ኮዱ መሠረታዊ የመዝገበ ቃላት መዳረሻ ብቻ ይሰጣል። ይህ የትምህርት ቤቱ ኮድ ለ Family ዕቅድ የ 24/7 ነጻ አማራጭ እንዳይሆን ይከላከላል።",
      },
      {
        q: "ትምህርት ቤቴ ከ 500 በላይ ተማሪዎች ካሉትስ?",
        a: "ከ 500 በታች ለሆነ ማንኛውም ትምህርት ቤት Schools Large ($149 / ወር፣ እስከ 500 ተማሪዎች) ይጠቀሙ። ከ 500 በላይ ተማሪዎች ወይም ባለብዙ ቅርንጫፍ ዲስትሪክቶች ከሆነ ለብጁ ዕቅድ ያግኙን።",
      },
      {
        q: "Gadit ቃልን እንዴት ያብራራል? ትርጉም ብቻ ነው?",
        a: "Gadit የትርጉም መዝገበ ቃላት አይደለም። Gadit ለቃላት ትርጓሜ ይሰጣል እና ያብራራል። ለእያንዳንዱ ቃል ሁሉንም ትርጉሞች፣ ለእያንዳንዱ ትርጉም ሦስት የምሳሌ ዓረፍተ ነገሮች፣ ሥርወ ቃል፣ እና ተማሪው ዓረፍተ ነገር ለጥፎ Gadit ትክክለኛውን ትርጉም የሚመርጥበት የአውድ ሁነታ ይሰጣል። የተማሪው ገጽታ በራሱ ቋንቋ ነው፣ የማብራሪያው ጥልቀት ግን በሁሉም ቋንቋ አንድ ነው።",
      },
    ],
    finalH2: "ጸጥተኛውን የውድቀት ሁኔታ ያስቁሙ።",
    finalBody: "መምህራንዎ ክፍላቸው ያልገባውን በትክክል የሚያዩበትን መሣሪያ ይስጧቸው። ሙከራው በ 2 ደቂቃ ይጀምራል። IT የለም፣ ግዢ የለም፣ የወላጅ ቅጽ የለም።",
    finalCta: "የ 14 ቀን ነጻ ሙከራ ይጀምሩ",
    finalNote: "ለሙከራው ክሬዲት ካርድ አያስፈልግም። በማንኛውም ጊዜ ይሰርዙ።",
    mockupRoster: "የክፍል ዝርዝር፣ 22 ተማሪዎች",
    mockupSearches: "በዚህ ሳምንት በብዛት የተፈለጉ",
    mockupStudent1: "ማያ 'ፎቶሲንተሲስ' ፈለገች",
    mockupStudent2: "ዮሲ 'ማይቶኮንድሪያ' ×2 ፈለገ",
    mockupStudent3: "ኖአ 'ዲሞክራሲ' ፈለገች",
    mockupWordExample: "ፎቶሲንተሲስ",
    mockupExampleDef: "አረንጓዴ ተክሎች የፀሐይ ብርሃንን ተጠቅመው ውሃን እና ካርቦን ዳይኦክሳይድን ወደ ምግብ የሚቀይሩበት ሂደት።",
    mockupExampleEx: "ፎቶሲንተሲስ በዋናነት በተክሉ ቅጠሎች ውስጥ ይከናወናል።",
  },

  // ─── Spanish ──────────────────────────────────────────────────
  es: {
    heroH1: "Cada estudiante entiende la lección.",
    heroSub: "Cualquier palabra difícil, en cualquiera de 14 idiomas, explicada al instante.",
    heroCta: "Comenzar prueba gratuita de 14 días",
    heroPriceChip: "Desde $69 al mes",
    heroTrust: "Autoservicio. Cancele cuando quiera.",
    probTag: "El problema",
    probH2: "Un estudiante que no entiende una palabra no puede entender la oración.",
    probBody1: "Un estudiante se pierde una palabra. No levanta la mano. Cree que entiende más o menos. La maestra sigue adelante. Cinco palabras después, el párrafo se vuelve borroso. Cinco párrafos después, la lección está perdida.",
    probBody2: "La mayoría de los estudiantes que se quedan atrás no son menos inteligentes. Tienen una pila de palabras que nunca entendieron del todo. Cada palabra nueva construida sobre esa pila aumenta la brecha. La causa es invisible para el docente.",
    probCallout1Title: "La brecha que crece",
    probCallout1Body: "Las palabras no aprendidas construyen un muro invisible para cada lección futura.",
    probCallout2Title: "El tiempo perdido",
    probCallout2Body: "Los docentes pierden de 5 a 10 minutos por lección explicando palabras.",
    probCallout3Title: "La desconexión silenciosa",
    probCallout3Body: "Los estudiantes se desconectan cuando un párrafo tiene demasiadas palabras desconocidas.",
    howTag: "Cómo funciona",
    howH2: "Configuración en 2 minutos. Sin IT.",
    howSub: "El mismo patrón de código de aula sin fricciones que ya funciona en juegos de preguntas, construido para la comprensión de palabras.",
    howStep1Title: "Cree un código de aula",
    howStep1Body: "El director o coordinador de grado crea un aula en el panel. El sistema genera un código de 6 caracteres. Imprímalo como adhesivo para la computadora del aula.",
    howStep2Title: "Los estudiantes se unen sin cuentas",
    howStep2Body: "Los estudiantes visitan gadit.app/c/CODE en cualquier navegador, eligen su nombre de la lista (un clic) y empiezan a buscar palabras. Sin instalar aplicación, sin email, sin contraseña.",
    howStep3Title: "Los docentes ven qué buscó el aula",
    howStep3Body: "Cada búsqueda llega al panel con el nombre del estudiante. Usted ve qué buscó cada estudiante, cuándo, y con qué palabras luchó toda el aula.",
    teacherTag: "La vista del docente",
    teacherH2: "El panel que estaba esperando.",
    teacherSub: "No son métricas vagas de participación. Palabras específicas, estudiantes específicos, momentos específicos.",
    teacherB1: "Historial de búsqueda por estudiante con marcas de tiempo",
    teacherB2: "Palabras más buscadas por el aula esta semana",
    teacherB3: "Búsquedas repetidas que indican comprensión frágil",
    teacherB4: "Filtrar por fecha, estudiante o palabra",
    privTag: "Privacidad en la arquitectura",
    privH2: "Visibilidad total para los docentes. Cero riesgo de datos para la escuela.",
    privSub: "No recopilamos ningún dato personal de los estudiantes. No porque los escondamos bien, sino porque no los recopilamos en absoluto. La arquitectura es el cumplimiento.",
    privPoint1: "Sin cuentas de estudiantes. Sin emails, sin contraseñas, sin identificadores.",
    privPoint2: "Ninguna información personal sale de la escuela. Las búsquedas se etiquetan solo con el nombre de la lista.",
    privPoint3: "Los códigos de aula funcionan solo en horario escolar. Configurable por escuela.",
    privPoint4: "COPPA, GDPR-K y la ley israelí de privacidad estudiantil se cumplen con holgura.",
    privKahoot: "Conexión tan simple como un juego de preguntas del aula. Construido para la comprensión de palabras y la visibilidad del docente.",
    priceTag: "Precios",
    priceH2: "Simple. Por debajo del umbral de compras.",
    priceSub: "Autoservicio a través de Stripe. Sin llamadas de ventas, sin demostraciones, sin órdenes de compra.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Hasta 100 estudiantes",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Hasta 500 estudiantes",
    priceIncludesTitle: "Ambos planes incluyen",
    priceIncludes: [
      "Aulas ilimitadas",
      "Panel docente completo",
      "Lista de selección de nombre del estudiante",
      "Códigos de aula con horario",
      "Interfaz del estudiante en 14 idiomas",
      "Prueba gratuita de 14 días",
    ],
    priceCta: "Comenzar prueba gratuita de 14 días",
    priceLarger: "¿Más de 500 estudiantes? Contáctenos para un plan de distrito.",
    faqTag: "Preguntas frecuentes",
    faqH2: "Lo que los directores preguntan antes de la prueba.",
    faq: [
      {
        q: "Si no hay logins, ¿cómo sé qué estudiante buscó qué?",
        a: "El docente carga una lista de nombres en el panel. Cuando un estudiante visita la URL del aula, elige su nombre con un clic. Cada búsqueda se etiqueta con ese nombre. Sin email, sin contraseña, sin datos personales.",
      },
      {
        q: "¿Es seguro según COPPA? ¿Recibiré una queja de los padres?",
        a: "Sí. Gadit no recopila ninguna información personal de estudiantes. Sin crear cuentas, sin recopilar emails, sin fechas de nacimiento, sin identificadores. No hay datos que puedan ser mal usados. La arquitectura cumple con holgura COPPA, GDPR-K y la ley israelí de privacidad estudiantil.",
      },
      {
        q: "¿Los estudiantes necesitan instalar una aplicación?",
        a: "No. Cualquier navegador funciona. Los estudiantes visitan gadit.app/c/CODE en la computadora del aula (o cualquier dispositivo con navegador). Sin tienda de aplicaciones, sin IT involucrado.",
      },
      {
        q: "¿Requiere configuración de IT o SSO?",
        a: "No. El director o coordinador de grado crea el aula en dos minutos y comparte el código con los docentes. IT no participa en ningún paso.",
      },
      {
        q: "¿Qué muestra el panel realmente?",
        a: "Búsquedas de palabras por estudiante con marcas de tiempo, las palabras que el aula buscó más esta semana, y patrones de búsquedas repetidas que indican comprensión frágil. Datos reales de comprensión del aula, no métricas vagas de participación.",
      },
      {
        q: "¿Se puede usar fuera del horario escolar?",
        a: "Los códigos de aula están vinculados a las horas activas de la escuela (predeterminado domingo a jueves de 7:30 a 15:00, configurable). Fuera de esa ventana el código da acceso básico al diccionario. Esto evita que el código escolar se convierta en un sustituto gratuito 24/7 del plan Family.",
      },
      {
        q: "¿Qué pasa si mi escuela tiene más de 500 estudiantes?",
        a: "Use Schools Large ($149 al mes, hasta 500 estudiantes) para cualquier escuela menor a 500. Para más de 500 estudiantes o redes con varias sedes, contáctenos para un plan personalizado.",
      },
      {
        q: "¿Cómo explica Gadit una palabra? ¿Es solo traducción?",
        a: "Gadit no es un diccionario de traducción. Gadit define y explica palabras. Para cada palabra da todos los significados, tres oraciones de ejemplo por significado, etimología, y un modo de contexto donde el estudiante pega la oración y Gadit elige el significado correcto. La interfaz del estudiante está en su idioma, pero la profundidad de la explicación es la misma en cualquier idioma.",
      },
    ],
    finalH2: "Detenga el modo de fallo silencioso.",
    finalBody: "Dé a sus docentes la herramienta para ver exactamente qué no entiende su aula. La prueba comienza en 2 minutos. Sin IT, sin compras, sin formularios de padres.",
    finalCta: "Comenzar prueba gratuita de 14 días",
    finalNote: "No se requiere tarjeta de crédito para la prueba. Cancele cuando quiera.",
    mockupRoster: "Lista del aula, 22 estudiantes",
    mockupSearches: "Las más buscadas esta semana",
    mockupStudent1: "Maya buscó «fotosíntesis»",
    mockupStudent2: "Yossi buscó «mitocondria» ×2",
    mockupStudent3: "Noa buscó «democracia»",
    mockupWordExample: "fotosíntesis",
    mockupExampleDef: "Proceso por el cual las plantas verdes usan la luz solar para convertir agua y dióxido de carbono en alimento.",
    mockupExampleEx: "La fotosíntesis ocurre principalmente en las hojas de la planta.",
  },

  // ─── Portuguese (Brazilian) ───────────────────────────────────
  pt: {
    heroH1: "Cada aluno entende a aula.",
    heroSub: "Qualquer palavra difícil, em qualquer um dos 14 idiomas, explicada na hora.",
    heroCta: "Iniciar teste gratuito de 14 dias",
    heroPriceChip: "A partir de $69 por mês",
    heroTrust: "Autoatendimento. Cancele a qualquer momento.",
    probTag: "O problema",
    probH2: "Um aluno que não entende uma palavra não consegue entender a frase.",
    probBody1: "Um aluno perde uma palavra. Não levanta a mão. Pensa que entende mais ou menos. A professora segue em frente. Cinco palavras depois, o parágrafo fica embaçado. Cinco parágrafos depois, a lição está perdida.",
    probBody2: "A maioria dos alunos que ficam para trás não é menos inteligente. Eles têm uma pilha de palavras que nunca entenderam por completo. Cada palavra nova construída sobre essa pilha aumenta a lacuna. A causa é invisível para o professor.",
    probCallout1Title: "A lacuna que cresce",
    probCallout1Body: "Palavras não aprendidas constroem um muro invisível para cada lição futura.",
    probCallout2Title: "O tempo perdido",
    probCallout2Body: "Os professores perdem de 5 a 10 minutos por aula explicando palavras.",
    probCallout3Title: "A desconexão silenciosa",
    probCallout3Body: "Os alunos se desconectam quando um parágrafo tem palavras desconhecidas demais.",
    howTag: "Como funciona",
    howH2: "Configuração em 2 minutos. Sem TI.",
    howSub: "O mesmo padrão sem fricções de código de sala que já funciona em jogos de quiz, construído para a compreensão de palavras.",
    howStep1Title: "Crie um código de sala",
    howStep1Body: "O diretor ou coordenador de série cria uma sala no painel. O sistema gera um código de 6 caracteres. Imprima como adesivo para o computador da sala.",
    howStep2Title: "Alunos entram sem contas",
    howStep2Body: "Os alunos visitam gadit.app/c/CODE em qualquer navegador, escolhem o nome da lista (um clique) e começam a digitar palavras. Sem instalar aplicativo, sem email, sem senha.",
    howStep3Title: "Professores veem o que a turma buscou",
    howStep3Body: "Cada busca chega ao painel com o nome do aluno. Você vê o que cada aluno pesquisou, quando, e com quais palavras a turma toda lutou.",
    teacherTag: "A visão do professor",
    teacherH2: "O painel que você estava esperando.",
    teacherSub: "Não são métricas vagas de engajamento. Palavras específicas, alunos específicos, momentos específicos.",
    teacherB1: "Histórico de busca por aluno com carimbo de hora",
    teacherB2: "Palavras mais buscadas pela turma esta semana",
    teacherB3: "Buscas repetidas que indicam compreensão frágil",
    teacherB4: "Filtre por data, aluno ou palavra",
    privTag: "Privacidade na arquitetura",
    privH2: "Visibilidade total para professores. Zero risco de dados para a escola.",
    privSub: "Não coletamos nenhum dado pessoal de alunos. Não porque os escondemos bem, mas porque não os coletamos. A arquitetura é a conformidade.",
    privPoint1: "Sem contas de aluno. Sem emails, sem senhas, sem identificadores.",
    privPoint2: "Nenhuma informação pessoal sai da escola. As buscas são marcadas apenas pelo nome da lista.",
    privPoint3: "Códigos de sala funcionam só em horário escolar. Configurável por escola.",
    privPoint4: "COPPA, GDPR-K e a lei israelense de privacidade estudantil são cumpridos com folga.",
    privKahoot: "Conexão tão simples quanto um jogo de quiz em sala. Construído para a compreensão de palavras e visibilidade do professor.",
    priceTag: "Preços",
    priceH2: "Simples. Abaixo do limite de compras.",
    priceSub: "Autoatendimento via Stripe. Sem ligações de venda, sem demonstrações, sem ordens de compra.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Até 100 alunos",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Até 500 alunos",
    priceIncludesTitle: "Ambos os planos incluem",
    priceIncludes: [
      "Salas ilimitadas",
      "Painel completo do professor",
      "Lista de seleção de nome do aluno",
      "Códigos de sala vinculados ao horário",
      "Interface do aluno em 14 idiomas",
      "Teste gratuito de 14 dias",
    ],
    priceCta: "Iniciar teste gratuito de 14 dias",
    priceLarger: "Mais de 500 alunos? Entre em contato para um plano distrital.",
    faqTag: "Perguntas frequentes",
    faqH2: "O que os diretores perguntam antes do teste.",
    faq: [
      {
        q: "Se não há logins, como sei qual aluno buscou o quê?",
        a: "O professor carrega uma lista de nomes no painel. Quando o aluno visita a URL da sala, escolhe seu nome com um clique. Cada busca é marcada com esse nome. Sem email, sem senha, sem dados pessoais.",
      },
      {
        q: "Isso é seguro segundo COPPA? Vou receber uma reclamação dos pais?",
        a: "Sim. Gadit não coleta nenhuma informação pessoal de alunos. Sem criação de contas, sem coleta de email, sem datas de nascimento, sem identificadores. Não há dados que possam ser mal usados. A arquitetura cumpre com folga COPPA, GDPR-K e a lei israelense de privacidade estudantil.",
      },
      {
        q: "Os alunos precisam instalar um aplicativo?",
        a: "Não. Qualquer navegador funciona. Os alunos visitam gadit.app/c/CODE no computador da sala (ou qualquer dispositivo com navegador). Sem loja de aplicativos, sem envolvimento de TI.",
      },
      {
        q: "Requer configuração de TI ou SSO?",
        a: "Não. O diretor ou coordenador de série cria a sala em dois minutos e compartilha o código com os professores. TI não participa de nenhum passo.",
      },
      {
        q: "O que o painel realmente mostra?",
        a: "Buscas de palavras por aluno com carimbos de hora, as palavras que a turma buscou mais esta semana, e padrões de buscas repetidas que indicam compreensão frágil. Dados reais de compreensão da turma, não métricas vagas de engajamento.",
      },
      {
        q: "Pode ser usado fora do horário escolar?",
        a: "Os códigos de sala estão vinculados às horas ativas da escola (padrão domingo a quinta de 7:30 às 15:00, configurável). Fora dessa janela o código dá acesso básico ao dicionário. Isso evita que o código escolar se torne um substituto gratuito 24/7 do plano Family.",
      },
      {
        q: "E se minha escola tem mais de 500 alunos?",
        a: "Use Schools Large ($149 por mês, até 500 alunos) para qualquer escola menor que 500. Para mais de 500 alunos ou redes com várias unidades, entre em contato para um plano personalizado.",
      },
      {
        q: "Como Gadit explica uma palavra? É só tradução?",
        a: "Gadit não é um dicionário de tradução. Gadit define e explica palavras. Para cada palavra dá todos os significados, três frases de exemplo por significado, etimologia, e um modo de contexto onde o aluno cola a frase e Gadit escolhe o significado correto. A interface do aluno está em sua língua, mas a profundidade da explicação é a mesma em qualquer língua.",
      },
    ],
    finalH2: "Pare o modo de falha silenciosa.",
    finalBody: "Dê a seus professores a ferramenta para ver exatamente o que sua turma não entende. O teste começa em 2 minutos. Sem TI, sem compras, sem formulários de pais.",
    finalCta: "Iniciar teste gratuito de 14 dias",
    finalNote: "Não é preciso cartão de crédito para o teste. Cancele a qualquer momento.",
    mockupRoster: "Lista da sala, 22 alunos",
    mockupSearches: "Mais buscadas esta semana",
    mockupStudent1: "Maya buscou «fotossíntese»",
    mockupStudent2: "Yossi buscou «mitocôndria» ×2",
    mockupStudent3: "Noa buscou «democracia»",
    mockupWordExample: "fotossíntese",
    mockupExampleDef: "Processo pelo qual as plantas verdes usam a luz solar para converter água e dióxido de carbono em alimento.",
    mockupExampleEx: "A fotossíntese ocorre principalmente nas folhas da planta.",
  },

  // ─── French ──────────────────────────────────────────────────
  fr: {
    heroH1: "Chaque élève comprend la leçon.",
    heroSub: "Chaque mot difficile, dans l'une des 14 langues, expliqué aussitôt.",
    heroCta: "Commencer l'essai gratuit de 14 jours",
    heroPriceChip: "À partir de $69 par mois",
    heroTrust: "Libre-service. Annulez à tout moment.",
    probTag: "Le problème",
    probH2: "Un élève qui ne comprend pas un mot ne peut pas comprendre la phrase.",
    probBody1: "Un élève manque un mot. Il ne lève pas la main. Il pense qu'il comprend à peu près. L'enseignant continue. Cinq mots plus tard, le paragraphe devient flou. Cinq paragraphes plus tard, la leçon est perdue.",
    probBody2: "La plupart des élèves qui prennent du retard ne sont pas moins intelligents. Ils ont une pile de mots qu'ils n'ont jamais entièrement compris. Chaque nouveau mot construit sur cette pile creuse l'écart. La cause est invisible pour l'enseignant.",
    probCallout1Title: "L'écart qui grandit",
    probCallout1Body: "Les mots non appris construisent un mur invisible pour chaque leçon future.",
    probCallout2Title: "Le temps perdu",
    probCallout2Body: "Les enseignants perdent 5 à 10 minutes par leçon à expliquer des mots.",
    probCallout3Title: "Le décrochage silencieux",
    probCallout3Body: "Les élèves décrochent quand un paragraphe contient trop de mots inconnus.",
    howTag: "Comment ça marche",
    howH2: "Installation en 2 minutes. Sans informatique.",
    howSub: "Le même modèle de code de classe sans friction qui fonctionne déjà pour les jeux de quiz, conçu pour la compréhension des mots.",
    howStep1Title: "Créez un code de classe",
    howStep1Body: "Le directeur ou le coordinateur de niveau crée une classe dans le tableau de bord. Le système génère un code à 6 caractères. Imprimez-le comme autocollant pour l'ordinateur de la classe.",
    howStep2Title: "Les élèves rejoignent sans compte",
    howStep2Body: "Les élèves visitent gadit.app/c/CODE dans n'importe quel navigateur, choisissent leur nom dans la liste (un clic) et commencent à taper des mots. Sans installation d'application, sans email, sans mot de passe.",
    howStep3Title: "Les enseignants voient ce que la classe a cherché",
    howStep3Body: "Chaque recherche arrive dans le tableau avec le nom de l'élève. Vous voyez ce que chaque élève a cherché, quand, et avec quels mots toute la classe a eu du mal.",
    teacherTag: "La vue de l'enseignant",
    teacherH2: "Le tableau de bord que vous attendiez.",
    teacherSub: "Pas des métriques d'engagement vagues. Des mots précis, des élèves précis, des moments précis.",
    teacherB1: "Historique de recherche par élève avec horodatage",
    teacherB2: "Mots les plus cherchés par la classe cette semaine",
    teacherB3: "Recherches répétées qui signalent une compréhension fragile",
    teacherB4: "Filtrer par date, élève ou mot",
    privTag: "Confidentialité dans l'architecture",
    privH2: "Visibilité totale pour les enseignants. Zéro risque de données pour l'école.",
    privSub: "Nous ne collectons aucune donnée personnelle des élèves. Pas parce que nous les cachons bien, mais parce que nous ne les collectons pas du tout. L'architecture est la conformité.",
    privPoint1: "Pas de comptes d'élèves. Pas d'emails, pas de mots de passe, pas d'identifiants.",
    privPoint2: "Aucune information personnelle ne quitte l'école. Les recherches sont taguées seulement avec le nom de la liste.",
    privPoint3: "Les codes de classe ne fonctionnent que pendant les heures d'école. Configurable par école.",
    privPoint4: "COPPA, GDPR-K et la loi israélienne sur la confidentialité des élèves sont respectés avec marge.",
    privKahoot: "Connexion aussi simple qu'un jeu de quiz en classe. Conçu pour la compréhension des mots et la visibilité de l'enseignant.",
    priceTag: "Tarifs",
    priceH2: "Simple. Sous le seuil d'achat.",
    priceSub: "Libre-service via Stripe. Pas d'appels commerciaux, pas de démos, pas de bons de commande.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Jusqu'à 100 élèves",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Jusqu'à 500 élèves",
    priceIncludesTitle: "Les deux forfaits comprennent",
    priceIncludes: [
      "Classes illimitées",
      "Tableau de bord enseignant complet",
      "Liste de sélection du nom de l'élève",
      "Codes de classe liés à l'horaire",
      "Interface élève en 14 langues",
      "Essai gratuit de 14 jours",
    ],
    priceCta: "Commencer l'essai gratuit de 14 jours",
    priceLarger: "Plus de 500 élèves ? Contactez-nous pour un plan de district.",
    faqTag: "Questions fréquentes",
    faqH2: "Ce que les directeurs demandent avant l'essai.",
    faq: [
      {
        q: "S'il n'y a pas de connexion, comment savoir quel élève a cherché quoi ?",
        a: "L'enseignant charge à l'avance une liste de noms dans le tableau. Quand un élève visite l'URL de la classe, il choisit son nom en un clic. Chaque recherche est taguée avec ce nom. Sans email, sans mot de passe, sans données personnelles.",
      },
      {
        q: "Est-ce conforme à COPPA ? Vais-je recevoir une plainte des parents ?",
        a: "Oui. Gadit ne collecte aucune information personnelle des élèves. Pas de création de comptes, pas de collecte d'emails, pas de dates de naissance, pas d'identifiants. Il n'y a aucune donnée pouvant être détournée. L'architecture dépasse confortablement COPPA, GDPR-K et la loi israélienne sur la confidentialité des élèves.",
      },
      {
        q: "Les élèves doivent-ils installer une application ?",
        a: "Non. N'importe quel navigateur fonctionne. Les élèves visitent gadit.app/c/CODE sur l'ordinateur de la classe (ou n'importe quel appareil avec un navigateur). Pas d'app store, pas d'implication informatique.",
      },
      {
        q: "Faut-il une installation informatique ou SSO ?",
        a: "Non. Le directeur ou le coordinateur de niveau crée la classe en deux minutes et partage le code avec les enseignants. L'informatique n'est impliquée à aucune étape.",
      },
      {
        q: "Que montre vraiment le tableau de bord ?",
        a: "Les recherches de mots de chaque élève avec horodatage, les mots que la classe a cherchés le plus cette semaine, et les motifs de recherches répétées qui signalent une compréhension fragile. Données réelles de compréhension de la classe, pas des métriques d'engagement vagues.",
      },
      {
        q: "Peut-on l'utiliser en dehors des heures d'école ?",
        a: "Les codes de classe sont liés aux heures actives de l'école (par défaut dimanche à jeudi 7h30 à 15h, configurable). En dehors de cette fenêtre, le code donne un accès dictionnaire de base. Cela empêche le code école de devenir un substitut gratuit 24h/24 du plan Family.",
      },
      {
        q: "Et si mon école a plus de 500 élèves ?",
        a: "Utilisez Schools Large ($149 par mois, jusqu'à 500 élèves) pour toute école de moins de 500. Pour plus de 500 élèves ou réseaux multi-sites, contactez-nous pour un plan personnalisé.",
      },
      {
        q: "Comment Gadit explique-t-il un mot ? Est-ce juste de la traduction ?",
        a: "Gadit n'est pas un dictionnaire de traduction. Gadit définit et explique les mots. Pour chaque mot il donne tous les sens, trois phrases d'exemple par sens, l'étymologie, et un mode contextuel où l'élève colle la phrase et Gadit choisit le bon sens. L'interface élève est dans sa langue, mais la profondeur de l'explication est la même dans toutes les langues.",
      },
    ],
    finalH2: "Arrêtez le mode d'échec silencieux.",
    finalBody: "Donnez à vos enseignants l'outil pour voir exactement ce que leur classe ne comprend pas. L'essai commence en 2 minutes. Sans informatique, sans achats, sans formulaires pour les parents.",
    finalCta: "Commencer l'essai gratuit de 14 jours",
    finalNote: "Pas de carte de crédit requise pour l'essai. Annulez à tout moment.",
    mockupRoster: "Liste de classe, 22 élèves",
    mockupSearches: "Les plus cherchés cette semaine",
    mockupStudent1: "Maya a cherché «photosynthèse»",
    mockupStudent2: "Yossi a cherché «mitochondrie» ×2",
    mockupStudent3: "Noa a cherché «démocratie»",
    mockupWordExample: "photosynthèse",
    mockupExampleDef: "Processus par lequel les plantes vertes utilisent la lumière du soleil pour convertir l'eau et le dioxyde de carbone en nourriture.",
    mockupExampleEx: "La photosynthèse se produit principalement dans les feuilles de la plante.",
  },

  // ─── German ──────────────────────────────────────────────────
  de: {
    heroH1: "Jeder Schüler versteht den Unterricht.",
    heroSub: "Jedes schwierige Wort, in einer von 14 Sprachen, sofort erklärt.",
    heroCta: "14 Tage kostenlos testen",
    heroPriceChip: "Ab $69 pro Monat",
    heroTrust: "Selbstbedienung. Jederzeit kündbar.",
    probTag: "Das Problem",
    probH2: "Ein Schüler, der ein Wort nicht versteht, kann den Satz nicht verstehen.",
    probBody1: "Ein Schüler verpasst ein Wort. Er hebt nicht die Hand. Er denkt, er versteht es ungefähr. Der Lehrer geht weiter. Fünf Wörter später wird der Absatz unscharf. Fünf Absätze später ist die Stunde verloren.",
    probBody2: "Die meisten Schüler, die zurückbleiben, sind nicht weniger intelligent. Sie haben einen Stapel von Wörtern, die sie nie ganz verstanden haben. Jedes neue Wort, das auf diesem Stapel aufbaut, vergrößert die Lücke. Die Ursache ist für den Lehrer unsichtbar.",
    probCallout1Title: "Die wachsende Lücke",
    probCallout1Body: "Nicht gelernte Wörter bauen eine unsichtbare Mauer für jede zukünftige Stunde.",
    probCallout2Title: "Verlorene Zeit",
    probCallout2Body: "Lehrer verlieren 5 bis 10 Minuten pro Stunde mit Worterklärungen.",
    probCallout3Title: "Stiller Ausstieg",
    probCallout3Body: "Schüler steigen aus, wenn ein Absatz zu viele unbekannte Wörter enthält.",
    howTag: "So funktioniert es",
    howH2: "Einrichtung in 2 Minuten. Ohne IT.",
    howSub: "Das gleiche reibungslose Klassencode-Muster, das schon bei Quizspielen funktioniert, gebaut für Wortverständnis.",
    howStep1Title: "Erstellen Sie einen Klassencode",
    howStep1Body: "Der Direktor oder Stufenkoordinator erstellt eine Klasse im Dashboard. Das System erzeugt einen Code mit 6 Zeichen. Drucken Sie ihn als Aufkleber für den Klassencomputer.",
    howStep2Title: "Schüler treten ohne Konten bei",
    howStep2Body: "Schüler besuchen gadit.app/c/CODE in jedem Browser, wählen ihren Namen aus der Liste (ein Klick) und beginnen, Wörter einzugeben. Keine App-Installation, keine E-Mail, kein Passwort.",
    howStep3Title: "Lehrer sehen, was die Klasse gesucht hat",
    howStep3Body: "Jede Suche landet im Dashboard mit dem Schülernamen. Sie sehen, was jeder Schüler gesucht hat, wann, und mit welchen Wörtern die ganze Klasse Schwierigkeiten hatte.",
    teacherTag: "Die Lehreransicht",
    teacherH2: "Das Dashboard, auf das Sie gewartet haben.",
    teacherSub: "Keine vagen Engagement-Metriken. Konkrete Wörter, konkrete Schüler, konkrete Momente.",
    teacherB1: "Suchverlauf pro Schüler mit Zeitstempeln",
    teacherB2: "Meistgesuchte Wörter der Klasse diese Woche",
    teacherB3: "Wiederholte Suchen, die brüchiges Verständnis signalisieren",
    teacherB4: "Filtern nach Datum, Schüler oder Wort",
    privTag: "Datenschutz in der Architektur",
    privH2: "Volle Sichtbarkeit für Lehrer. Null Datenrisiko für die Schule.",
    privSub: "Wir sammeln keine personenbezogenen Schülerdaten. Nicht weil wir sie gut verstecken, sondern weil wir sie gar nicht sammeln. Die Architektur ist die Compliance.",
    privPoint1: "Keine Schülerkonten. Keine E-Mails, keine Passwörter, keine Kennungen.",
    privPoint2: "Keine persönlichen Informationen verlassen die Schule. Suchen sind nur mit dem Namen aus der Liste markiert.",
    privPoint3: "Klassencodes funktionieren nur während der Schulzeiten. Pro Schule konfigurierbar.",
    privPoint4: "COPPA, GDPR-K und das israelische Schülerdatenschutzgesetz werden mit Reserve erfüllt.",
    privKahoot: "Beitritt so einfach wie bei einem Klassenquiz. Gebaut für Wortverständnis und Lehrersichtbarkeit.",
    priceTag: "Preise",
    priceH2: "Einfach. Unter der Beschaffungsschwelle.",
    priceSub: "Selbstbedienung über Stripe. Keine Vertriebsanrufe, keine Demos, keine Bestellaufträge.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Bis zu 100 Schüler",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Bis zu 500 Schüler",
    priceIncludesTitle: "Beide Tarife enthalten",
    priceIncludes: [
      "Unbegrenzte Klassen",
      "Vollständiges Lehrer-Dashboard",
      "Schüler-Namensauswahlliste",
      "Zeitgebundene Klassencodes",
      "Schüler-Oberfläche in 14 Sprachen",
      "14 Tage kostenlose Testphase",
    ],
    priceCta: "14 Tage kostenlos testen",
    priceLarger: "Mehr als 500 Schüler? Kontaktieren Sie uns für einen Bezirksplan.",
    faqTag: "Häufige Fragen",
    faqH2: "Was Direktoren vor der Testphase fragen.",
    faq: [
      {
        q: "Wenn es keine Logins gibt, wie weiß ich, welcher Schüler was gesucht hat?",
        a: "Der Lehrer lädt vorab eine Namensliste ins Dashboard. Wenn ein Schüler die Klassen-URL besucht, wählt er seinen Namen mit einem Klick. Jede Suche ist mit diesem Namen markiert. Ohne E-Mail, ohne Passwort, ohne persönliche Daten.",
      },
      {
        q: "Ist das COPPA-konform? Bekomme ich eine Elternbeschwerde?",
        a: "Ja. Gadit sammelt überhaupt keine persönlichen Schülerdaten. Keine Kontoerstellung, keine E-Mail-Sammlung, keine Geburtsdaten, keine Kennungen. Es gibt keine Daten, die missbraucht werden könnten. Die Architektur übertrifft COPPA, GDPR-K und das israelische Schülerdatenschutzgesetz mit Reserve.",
      },
      {
        q: "Müssen Schüler eine App installieren?",
        a: "Nein. Jeder Browser funktioniert. Schüler besuchen gadit.app/c/CODE auf dem Klassencomputer (oder jedem Gerät mit Browser). Kein App Store, keine IT-Beteiligung.",
      },
      {
        q: "Erfordert es IT-Einrichtung oder SSO?",
        a: "Nein. Der Direktor oder Stufenkoordinator erstellt die Klasse in zwei Minuten und teilt den Code mit den Lehrern. IT ist in keinem Schritt beteiligt.",
      },
      {
        q: "Was zeigt das Dashboard wirklich?",
        a: "Wortsuchen jedes Schülers mit Zeitstempeln, die Wörter, die die Klasse diese Woche am häufigsten gesucht hat, und Muster wiederholter Suchen, die brüchiges Verständnis signalisieren. Echte Klassenverständnisdaten, keine vagen Engagement-Metriken.",
      },
      {
        q: "Kann es außerhalb der Schulzeiten genutzt werden?",
        a: "Klassencodes sind an die aktiven Schulzeiten gebunden (standardmäßig Sonntag bis Donnerstag 7:30 bis 15:00, konfigurierbar). Außerhalb dieses Fensters bietet der Code nur Basis-Wörterbuchzugriff. Das verhindert, dass der Schulcode zu einem kostenlosen 24/7-Ersatz für den Family-Tarif wird.",
      },
      {
        q: "Was, wenn meine Schule mehr als 500 Schüler hat?",
        a: "Verwenden Sie Schools Large ($149 pro Monat, bis zu 500 Schüler) für jede Schule unter 500. Für mehr als 500 Schüler oder Mehrstandortnetzwerke kontaktieren Sie uns für einen maßgeschneiderten Plan.",
      },
      {
        q: "Wie erklärt Gadit ein Wort? Ist das nur Übersetzung?",
        a: "Gadit ist kein Übersetzungswörterbuch. Gadit definiert und erklärt Wörter. Für jedes Wort gibt es alle Bedeutungen, drei Beispielsätze pro Bedeutung, Etymologie und einen Kontextmodus, in dem der Schüler den Satz einfügt und Gadit die richtige Bedeutung wählt. Die Schüleroberfläche ist in seiner Sprache, aber die Erklärungstiefe ist in jeder Sprache gleich.",
      },
    ],
    finalH2: "Stoppen Sie den stillen Ausfall.",
    finalBody: "Geben Sie Ihren Lehrern das Werkzeug, um genau zu sehen, was ihre Klasse nicht versteht. Die Testphase startet in 2 Minuten. Ohne IT, ohne Beschaffung, ohne Elternformulare.",
    finalCta: "14 Tage kostenlos testen",
    finalNote: "Für die Testphase ist keine Kreditkarte erforderlich. Jederzeit kündbar.",
    mockupRoster: "Klassenliste, 22 Schüler",
    mockupSearches: "Meistgesucht diese Woche",
    mockupStudent1: "Maja hat „Photosynthese\" gesucht",
    mockupStudent2: "Jossi hat „Mitochondrium\" ×2 gesucht",
    mockupStudent3: "Noa hat „Demokratie\" gesucht",
    mockupWordExample: "Photosynthese",
    mockupExampleDef: "Der Prozess, bei dem grüne Pflanzen Sonnenlicht nutzen, um Wasser und Kohlendioxid in Nahrung umzuwandeln.",
    mockupExampleEx: "Photosynthese findet hauptsächlich in den Blättern der Pflanze statt.",
  },

  // ─── Italian ──────────────────────────────────────────────────
  it: {
    heroH1: "Ogni studente capisce la lezione.",
    heroSub: "Ogni parola difficile, in una delle 14 lingue, spiegata all'istante.",
    heroCta: "Inizia la prova gratuita di 14 giorni",
    heroPriceChip: "Da $69 al mese",
    heroTrust: "Self-service. Annulla quando vuoi.",
    probTag: "Il problema",
    probH2: "Uno studente che non capisce una parola non può capire la frase.",
    probBody1: "Uno studente perde una parola. Non alza la mano. Pensa di capire più o meno. L'insegnante va avanti. Cinque parole dopo, il paragrafo diventa sfocato. Cinque paragrafi dopo, la lezione è persa.",
    probBody2: "La maggior parte degli studenti che restano indietro non è meno intelligente. Hanno una pila di parole che non hanno mai capito del tutto. Ogni parola nuova costruita su quella pila aumenta il divario. La causa è invisibile all'insegnante.",
    probCallout1Title: "Il divario che cresce",
    probCallout1Body: "Le parole non imparate costruiscono un muro invisibile per ogni lezione futura.",
    probCallout2Title: "Il tempo perso",
    probCallout2Body: "Gli insegnanti perdono dai 5 ai 10 minuti per lezione a spiegare parole.",
    probCallout3Title: "Il distacco silenzioso",
    probCallout3Body: "Gli studenti si disconnettono quando un paragrafo contiene troppe parole sconosciute.",
    howTag: "Come funziona",
    howH2: "Configurazione in 2 minuti. Senza IT.",
    howSub: "Lo stesso modello di codice classe senza attriti che già funziona nei giochi di quiz, costruito per la comprensione delle parole.",
    howStep1Title: "Crea un codice classe",
    howStep1Body: "Il direttore o il coordinatore di anno crea una classe nella dashboard. Il sistema genera un codice di 6 caratteri. Stampalo come adesivo per il computer della classe.",
    howStep2Title: "Gli studenti entrano senza account",
    howStep2Body: "Gli studenti visitano gadit.app/c/CODE in qualsiasi browser, scelgono il loro nome dall'elenco (un clic) e iniziano a digitare parole. Nessuna installazione di app, nessuna email, nessuna password.",
    howStep3Title: "Gli insegnanti vedono cosa ha cercato la classe",
    howStep3Body: "Ogni ricerca arriva nella dashboard con il nome dello studente. Vedi cosa ha cercato ogni studente, quando, e con quali parole tutta la classe ha avuto difficoltà.",
    teacherTag: "La vista dell'insegnante",
    teacherH2: "La dashboard che stavi aspettando.",
    teacherSub: "Non metriche vaghe di coinvolgimento. Parole specifiche, studenti specifici, momenti specifici.",
    teacherB1: "Cronologia di ricerca per studente con timestamp",
    teacherB2: "Parole più cercate dalla classe questa settimana",
    teacherB3: "Ricerche ripetute che segnalano comprensione fragile",
    teacherB4: "Filtra per data, studente o parola",
    privTag: "Privacy nell'architettura",
    privH2: "Visibilità totale per gli insegnanti. Zero rischio dati per la scuola.",
    privSub: "Non raccogliamo nessun dato personale degli studenti. Non perché li nascondiamo bene, ma perché non li raccogliamo affatto. L'architettura è la conformità.",
    privPoint1: "Nessun account studente. Niente email, niente password, niente identificatori.",
    privPoint2: "Nessuna informazione personale lascia la scuola. Le ricerche sono etichettate solo con il nome dall'elenco.",
    privPoint3: "I codici classe funzionano solo durante l'orario scolastico. Configurabile per ogni scuola.",
    privPoint4: "COPPA, GDPR-K e la legge israeliana sulla privacy degli studenti sono soddisfatti con margine.",
    privKahoot: "Accesso semplice come un quiz in classe. Costruito per la comprensione delle parole e la visibilità dell'insegnante.",
    priceTag: "Prezzi",
    priceH2: "Semplice. Sotto la soglia di acquisto.",
    priceSub: "Self-service tramite Stripe. Nessuna chiamata di vendita, nessuna demo, nessun ordine d'acquisto.",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "Fino a 100 studenti",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "Fino a 500 studenti",
    priceIncludesTitle: "Entrambi i piani includono",
    priceIncludes: [
      "Classi illimitate",
      "Dashboard insegnante completa",
      "Elenco di selezione del nome dello studente",
      "Codici classe vincolati all'orario",
      "Interfaccia studente in 14 lingue",
      "Prova gratuita di 14 giorni",
    ],
    priceCta: "Inizia la prova gratuita di 14 giorni",
    priceLarger: "Più di 500 studenti? Contattaci per un piano distrettuale.",
    faqTag: "Domande frequenti",
    faqH2: "Cosa chiedono i direttori prima della prova.",
    faq: [
      {
        q: "Se non ci sono login, come faccio a sapere quale studente ha cercato cosa?",
        a: "L'insegnante carica in anticipo un elenco di nomi nella dashboard. Quando uno studente visita l'URL della classe, sceglie il suo nome con un clic. Ogni ricerca è etichettata con quel nome. Niente email, niente password, niente dati personali.",
      },
      {
        q: "È sicuro secondo COPPA? Riceverò un reclamo dai genitori?",
        a: "Sì. Gadit non raccoglie alcuna informazione personale degli studenti. Niente creazione di account, niente raccolta di email, niente date di nascita, niente identificatori. Non ci sono dati che possono essere abusati. L'architettura supera con margine COPPA, GDPR-K e la legge israeliana sulla privacy degli studenti.",
      },
      {
        q: "Gli studenti devono installare un'app?",
        a: "No. Qualsiasi browser funziona. Gli studenti visitano gadit.app/c/CODE sul computer della classe (o qualsiasi dispositivo con browser). Niente app store, nessun coinvolgimento dell'IT.",
      },
      {
        q: "Richiede configurazione IT o SSO?",
        a: "No. Il direttore o il coordinatore di anno crea la classe in due minuti e condivide il codice con gli insegnanti. L'IT non è coinvolto in nessun passaggio.",
      },
      {
        q: "Cosa mostra davvero la dashboard?",
        a: "Ricerche di parole di ogni studente con timestamp, le parole che la classe ha cercato più questa settimana, e schemi di ricerche ripetute che segnalano comprensione fragile. Dati reali di comprensione della classe, non metriche vaghe di coinvolgimento.",
      },
      {
        q: "Può essere usato fuori dall'orario scolastico?",
        a: "I codici classe sono vincolati alle ore attive della scuola (predefinito da domenica a giovedì 7:30 a 15:00, configurabile). Fuori da quella finestra il codice dà accesso al dizionario di base. Questo impedisce che il codice scolastico diventi un sostituto gratuito 24 ore su 24 del piano Family.",
      },
      {
        q: "E se la mia scuola ha più di 500 studenti?",
        a: "Usa Schools Large ($149 al mese, fino a 500 studenti) per qualsiasi scuola sotto i 500. Per più di 500 studenti o reti con più sedi, contattaci per un piano personalizzato.",
      },
      {
        q: "Come spiega Gadit una parola? È solo traduzione?",
        a: "Gadit non è un dizionario di traduzione. Gadit definisce e spiega le parole. Per ogni parola dà tutti i significati, tre frasi di esempio per significato, etimologia, e una modalità di contesto in cui lo studente incolla la frase e Gadit sceglie il significato corretto. L'interfaccia dello studente è nella sua lingua, ma la profondità della spiegazione è la stessa in ogni lingua.",
      },
    ],
    finalH2: "Ferma la modalità di fallimento silenzioso.",
    finalBody: "Dai ai tuoi insegnanti lo strumento per vedere esattamente cosa la classe non capisce. La prova inizia in 2 minuti. Senza IT, senza acquisti, senza moduli per i genitori.",
    finalCta: "Inizia la prova gratuita di 14 giorni",
    finalNote: "Nessuna carta di credito richiesta per la prova. Annulla quando vuoi.",
    mockupRoster: "Elenco classe, 22 studenti",
    mockupSearches: "Più cercate questa settimana",
    mockupStudent1: "Maya ha cercato «fotosintesi»",
    mockupStudent2: "Yossi ha cercato «mitocondrio» ×2",
    mockupStudent3: "Noa ha cercato «democrazia»",
    mockupWordExample: "fotosintesi",
    mockupExampleDef: "Processo con cui le piante verdi usano la luce del sole per trasformare acqua e anidride carbonica in cibo.",
    mockupExampleEx: "La fotosintesi avviene principalmente nelle foglie della pianta.",
  },

  // ─── Japanese ────────────────────────────────────────────────
  ja: {
    heroH1: "すべての生徒が授業を理解する。",
    heroSub: "どんな難しい単語も、14の言語のいずれかで、その場で説明。",
    heroCta: "14日間の無料トライアルを開始",
    heroPriceChip: "$69 / 月から",
    heroTrust: "セルフサービス。いつでもキャンセル可能。",
    probTag: "課題",
    probH2: "単語を理解していない生徒は文を理解できません。",
    probBody1: "生徒が一つの単語を見逃します。手を挙げません。だいたい分かっていると思っています。教師は先へ進みます。五つの単語の後、段落はぼやけてきます。五つの段落の後、授業は失われます。",
    probBody2: "遅れる生徒のほとんどは知能が低いわけではありません。完全には理解していない単語の山を持っているのです。その山の上に積み上がる新しい単語が、すべて差を広げます。原因は教師には見えません。",
    probCallout1Title: "広がるギャップ",
    probCallout1Body: "学ばれなかった単語は、未来のすべての授業に対する見えない壁を築きます。",
    probCallout2Title: "失われる時間",
    probCallout2Body: "教師は1授業ごとに5〜10分を単語の説明に費やしています。",
    probCallout3Title: "静かな脱落",
    probCallout3Body: "段落に未知の単語が多すぎると、生徒は集中力を失います。",
    howTag: "仕組み",
    howH2: "2分で設定完了。ITは不要。",
    howSub: "クイズゲームですでに機能している摩擦のないクラスコードのパターンを、単語理解のために構築しました。",
    howStep1Title: "クラスコードを作成",
    howStep1Body: "校長または学年主任がダッシュボードでクラスを作成します。システムが6文字のコードを生成します。教室のコンピュータ用のステッカーとして印刷してください。",
    howStep2Title: "生徒はアカウントなしで参加",
    howStep2Body: "生徒は任意のブラウザで gadit.app/c/CODE にアクセスし、リストから自分の名前を選び(ワンクリック)、単語の入力を始めます。アプリのインストール不要、メール不要、パスワード不要。",
    howStep3Title: "教師はクラスが検索したものを確認",
    howStep3Body: "すべての検索が生徒の名前とともにダッシュボードに表示されます。各生徒が何を、いつ検索したか、クラス全体がどの単語に苦労したかがわかります。",
    teacherTag: "教師ビュー",
    teacherH2: "あなたが待っていたダッシュボード。",
    teacherSub: "曖昧なエンゲージメント指標ではありません。具体的な単語、具体的な生徒、具体的な瞬間です。",
    teacherB1: "タイムスタンプ付きの生徒ごとの検索履歴",
    teacherB2: "今週クラスが最も検索した単語",
    teacherB3: "脆弱な理解を示す繰り返しの検索",
    teacherB4: "日付、生徒、単語でフィルタ",
    privTag: "アーキテクチャに組み込まれたプライバシー",
    privH2: "教師には完全な可視性。学校にはゼロのデータリスク。",
    privSub: "生徒の個人データを一切収集しません。上手に隠しているからではなく、そもそも収集していないからです。アーキテクチャがそのままコンプライアンスです。",
    privPoint1: "生徒アカウントなし。メールなし、パスワードなし、識別子なし。",
    privPoint2: "学校から個人情報は出ません。検索はリストの名前でのみタグ付けされます。",
    privPoint3: "クラスコードは学校時間内のみ機能します。学校ごとに設定可能。",
    privPoint4: "COPPA、GDPR-K、イスラエルの生徒プライバシー法をすべて余裕でクリア。",
    privKahoot: "教室のクイズゲームのように簡単に参加できます。単語理解と教師の可視性のために構築されています。",
    priceTag: "料金",
    priceH2: "シンプル。決裁基準額未満。",
    priceSub: "Stripeによるセルフサービス。営業電話なし、デモなし、発注書なし。",
    priceSmallName: "Schools",
    priceSmallAmount: "$69",
    priceSmallStudents: "生徒100人まで",
    priceLargeName: "Schools Large",
    priceLargeAmount: "$149",
    priceLargeStudents: "生徒500人まで",
    priceIncludesTitle: "両プランに含まれるもの",
    priceIncludes: [
      "クラス数無制限",
      "教師ダッシュボード一式",
      "生徒名選択リスト",
      "時間制限付きクラスコード",
      "14言語の生徒インターフェース",
      "14日間の無料トライアル",
    ],
    priceCta: "14日間の無料トライアルを開始",
    priceLarger: "500人を超える生徒は?学区プランについてお問い合わせください。",
    faqTag: "よくある質問",
    faqH2: "校長がトライアル前に聞くこと。",
    faq: [
      {
        q: "ログインがない場合、どの生徒が何を検索したかをどう知るのですか?",
        a: "教師はダッシュボードに名前のリストを事前に読み込みます。生徒がクラスのURLにアクセスすると、ワンクリックで自分の名前を選びます。各検索がその名前でタグ付けされます。メールなし、パスワードなし、個人データなし。",
      },
      {
        q: "COPPAに準拠していますか?保護者から苦情が来ますか?",
        a: "はい。Gaditは生徒の個人情報を一切収集しません。アカウント作成なし、メール収集なし、生年月日なし、識別子なし。悪用できるデータが存在しません。アーキテクチャはCOPPA、GDPR-K、イスラエルの生徒プライバシー法を余裕で上回ります。",
      },
      {
        q: "生徒はアプリをインストールする必要がありますか?",
        a: "いいえ。どのブラウザでも動作します。生徒は教室のコンピュータ(またはブラウザのある任意のデバイス)で gadit.app/c/CODE にアクセスします。アプリストア不要、IT関与不要。",
      },
      {
        q: "IT設定やSSOは必要ですか?",
        a: "いいえ。校長または学年主任が2分でクラスを作成し、教師とコードを共有します。ITはどの段階にも関与しません。",
      },
      {
        q: "ダッシュボードは実際に何を表示しますか?",
        a: "各生徒の単語検索とタイムスタンプ、クラスが今週最も検索した単語、そして脆弱な理解を示す繰り返し検索のパターン。曖昧なエンゲージメント指標ではなく、本物のクラス理解データです。",
      },
      {
        q: "学校時間外に使用できますか?",
        a: "クラスコードは学校の活動時間に紐付けられています(デフォルトは日曜から木曜の7:30から15:00、設定可能)。その時間外ではコードは基本辞書アクセスのみを提供します。これにより、学校コードがFamilyプランの24時間無料代替品になることを防ぎます。",
      },
      {
        q: "学校に500人を超える生徒がいる場合は?",
        a: "500人未満の学校にはSchools Large($149/月、生徒500人まで)をご利用ください。500人を超える生徒や複数拠点のネットワークについては、カスタムプランについてお問い合わせください。",
      },
      {
        q: "Gaditはどのように単語を説明しますか?ただの翻訳ですか?",
        a: "Gaditは翻訳辞書ではありません。Gaditは単語を定義し説明します。各単語について、すべての意味、意味ごとに3つの例文、語源、そして生徒が文を貼り付けるとGaditが正しい意味を選ぶコンテキストモードを提供します。生徒のインターフェースは自国語ですが、説明の深さはどの言語でも同じです。",
      },
    ],
    finalH2: "静かな失敗を止めましょう。",
    finalBody: "クラスが何を理解していないかを正確に見るためのツールを教師に提供してください。トライアルは2分で開始できます。IT不要、購買手続き不要、保護者向け書類不要。",
    finalCta: "14日間の無料トライアルを開始",
    finalNote: "トライアルにクレジットカードは不要。いつでもキャンセル可能。",
    mockupRoster: "クラス名簿、生徒22人",
    mockupSearches: "今週の検索上位",
    mockupStudent1: "マヤが「光合成」を検索",
    mockupStudent2: "ヨッシが「ミトコンドリア」×2を検索",
    mockupStudent3: "ノアが「民主主義」を検索",
    mockupWordExample: "光合成",
    mockupExampleDef: "緑色の植物が太陽光を使って水と二酸化炭素を栄養に変えるプロセス。",
    mockupExampleEx: "光合成は主に植物の葉で起こります。",
  },
};

const PRICE_SCHOOLS_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_MONTHLY ?? "";
const PRICE_SCHOOLS_LARGE_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOOLS_LARGE_MONTHLY ?? "";

/**
 * Cross-language flagship section copy. Rendered from its own object so the
 * 14 main `T` dicts stay untouched; he/en/ar/ru are native, everything else
 * falls back to English (Gadi's he+en-primary pattern). The one goal is
 * comprehension of the material; cross-language is the strongest tool for
 * it, NOT the whole identity — so the copy frames it as "for every student
 * who hits a hard word", with multilingual students as the sharpest case.
 */
type XLang = {
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
    note: "This is not only for new immigrants. It is for every student who hits a hard word, in any of 14 languages. The goal is understanding the material; this is the strongest tool for it.",
  },
  he: {
    tag: "חוצה שפות",
    h2: "ומה קורה כשהמילה בשפה שהתלמיד עדיין לא שולט בה?",
    body1: "ילד קורא את החומר בשפת ההוראה, אבל עדיין חושב ברוסית, באמהרית או בערבית. הוא נתקל במילה שאינו מכיר, לא מרים יד, וטובע בשקט בזמן שהכיתה ממשיכה הלאה.",
    body2: "ב-Gadit אותו תלמיד מחפש את המילה ומקבל את המשמעות המלאה בשפה שלו, וממשיך לקרוא את השיעור. מחסום ההבנה נעלם בהקשה אחת.",
    keyline: "התלמידים הרב-לשוניים שלך מפסיקים לפגר בכל מקצוע אחר, כי סוף סוף הם מצליחים לקרוא את החומר.",
    demoWordLabel: "בשיעור כתוב",
    demoMeaningLabel: "התלמיד מבין",
    note: "זה לא רק לעולים חדשים. זה לכל תלמיד שנתקל במילה קשה, בכל אחת מ-14 שפות. המטרה היא הבנת החומר, וזה הכלי החזק ביותר עבורה.",
  },
  ar: {
    tag: "عبر اللغات",
    h2: "وماذا لو كانت الكلمة بلغة لم يتقنها الطالب بعد؟",
    body1: "يقرأ الطفل الدرس بلغة التدريس لكنه لا يزال يفكر بالروسية أو الأمهرية أو العربية. يصادف كلمة لا يعرفها، لا يرفع يده، ويغرق بصمت بينما يمضي الصف قدمًا.",
    body2: "في Gadit يبحث ذلك الطالب عن الكلمة فيحصل على معناها الكامل بلغته، ثم يواصل قراءة الدرس. يختفي حاجز الفهم بنقرة واحدة.",
    keyline: "طلابك متعددو اللغات يتوقفون عن التأخر في كل مادة أخرى، لأنهم أخيرًا يستطيعون قراءة المحتوى.",
    demoWordLabel: "الدرس يقول",
    demoMeaningLabel: "الطالب يفهم",
    note: "هذا ليس للقادمين الجدد فقط. إنه لكل طالب يصادف كلمة صعبة، بأي من 14 لغة. الهدف هو فهم المحتوى، وهذه أقوى أداة لذلك.",
  },
  ru: {
    tag: "Между языками",
    h2: "А если слово на языке, которым ученик ещё не владеет?",
    body1: "Ребёнок читает урок на языке обучения, но всё ещё думает по-русски, на амхарском или арабском. Он встречает незнакомое слово, не поднимает руку и молча тонет, пока класс движется дальше.",
    body2: "В Gadit этот ученик ищет слово и получает полное значение на своём языке, а затем продолжает читать урок. Барьер понимания исчезает одним касанием.",
    keyline: "Ваши многоязычные ученики перестают отставать по всем другим предметам, потому что наконец могут читать материал.",
    demoWordLabel: "В уроке написано",
    demoMeaningLabel: "Ученик понимает",
    note: "Это не только для новых репатриантов. Это для каждого ученика, который встречает трудное слово, на любом из 14 языков. Цель — понимание материала, и это самый сильный инструмент для этого.",
  },
};

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

export function SchoolsLandingClient({ standalone = false }: { standalone?: boolean } = {}) {
  const { user, schoolId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const t = COPY[lang] ?? COPY.en;
  const xt = XLANG[lang] ?? XLANG.en;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Every "Start 14-day free trial" CTA opens the payment page DIRECTLY
  // instead of detouring through /pricing — Gadi 2026-07-08: a principal
  // who already clicked "start trial" on the schools page shouldn't be
  // dropped on a general pricing page to hunt for the button again.
  // Since 2026-07-12 that payment page is the in-app /checkout (Payment
  // Element, user's own language) rather than hosted Stripe Checkout.
  // Anonymous visitors get the signup modal first, then flow straight
  // into checkout (same pattern as PricingClient). checkout_started
  // fires inside /checkout (no duplicates).
  function startCheckout(priceId: string) {
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
  }
  function clickTrial(priceId: string) {
    // Existing school owners don't need a second subscription — send
    // them to their dashboard instead of a duplicate checkout.
    if (user && schoolId === user.uid) {
      router.push(href("/schools/manage"));
      return;
    }
    promptLogin({ mode: "signup", onSuccess: () => startCheckout(priceId) });
  }
  // Hero + final CTAs don't name a plan, so sending them straight to a
  // specific checkout would silently pick the $69 tier for the user.
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
    he: { text: "המנוי Schools פעיל אצלך.", cta: "מעבר לדשבורד ←" },
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
          <WbShellBurger active="schools" />
        </div>
      </header>
      )}
      {standalone && (
        <div style={{ position: "fixed", top: 12, insetInlineEnd: 12, zIndex: 50 }}>
          <LangSwitcher variant="muted" />
        </div>
      )}

      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="wb-schools-hero">
        <div className="wb-schools-hero-text">
          <span className="wb-schools-pricechip">{t.heroPriceChip}</span>
          <h1 className="wb-schools-h1">{t.heroH1}</h1>
          <p className="wb-schools-sub">{t.heroSub}</p>
          <div className="wb-schools-hero-actions">
            <button type="button" className="wb-schools-cta" onClick={scrollToPricing}>
              {t.heroCta}
            </button>
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
              {lang === "he" ? "ועוד 11 שפות" : lang === "ar" ? "و11 لغة أخرى" : lang === "ru" ? "и ещё 11 языков" : "+ 11 more languages"}
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
      <section id="schools-pricing" className="wb-schools-section wb-schools-pricing">
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
              <button type="button" className="wb-schools-cta wb-schools-cta-block" onClick={() => clickTrial(PRICE_SCHOOLS_MONTHLY)}>
                {t.priceCta}
              </button>
            </div>
            <div className="wb-schools-price-card wb-schools-price-card-large">
              <div className="wb-schools-price-name">{t.priceLargeName}</div>
              <div className="wb-schools-price-amount">
                <span className="wb-schools-price-amount-num" dir="ltr">{t.priceLargeAmount}</span>
                <span className="wb-schools-price-amount-period">/ month</span>
              </div>
              <div className="wb-schools-price-students">{t.priceLargeStudents}</div>
              <button type="button" className="wb-schools-cta wb-schools-cta-block" onClick={() => clickTrial(PRICE_SCHOOLS_LARGE_MONTHLY)}>
                {t.priceCta}
              </button>
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
          <button type="button" className="wb-schools-cta wb-schools-cta-big" onClick={scrollToPricing}>
            {t.finalCta}
          </button>
          <div className="wb-schools-final-note">{t.finalNote}</div>
        </div>
      </section>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/pricing")}>Pricing</Link>
        <span>·</span>
        <Link href={href("/privacy")}>{v2(lang, "footerPrivacy")}</Link>
        <span>·</span>
        <Link href={href("/terms")}>{v2(lang, "footerTerms")}</Link>
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
