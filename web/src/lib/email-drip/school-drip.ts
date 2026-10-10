import { renderEmailHtmlV2, mdLiteToHtml } from "./render";
import { EMAIL_BASE } from "./family-content";

/**
 * Schools pilot onboarding: seven emails over the 30-day pilot, to the
 * school account's address (Gadi approved the texts 2026-10-10). One action
 * per email, one sentence per line so the email breathes. Day 0 is the day
 * the series first meets the school (schoolSeriesStart). Saturdays are not
 * series days, like the Family series. Hebrew for Israeli curricula,
 * English for the rest.
 *
 * Written for what the product really is today: one school login that the
 * teachers share (there are no teacher accounts), and for Israeli schools no
 * student codes, so the principal's insights stay empty; the mid-pilot
 * email measures by the class dictionary instead.
 */

export const SCHOOL_SERIES_LIVE = true;
/** Only schools opened from this day on enter the series (the four schools
 *  that existed before it, demos included, don't get a pilot welcome). */
export const SCHOOL_SERIES_FROM = "2026-10-11";

type Content = { subject: string; body: string; cta: string };
export type SchoolMail = { key: string; dayOffset: number; path: string; he: Content; en: Content };

const P = (...lines: string[]) => lines.join("\n\n");

export const SCHOOL_DRIP: SchoolMail[] = [
  {
    key: "sch-welcome", dayOffset: 0, path: "/schools/manage",
    he: { subject: "ברוכים הבאים לפיילוט של Gadit", cta: "כניסה ללוח הבקרה", body: P(
      "שלום,",
      "שמחים שאתם איתנו.",
      "ב-30 הימים הקרובים נעזור לכם להכניס את Gadit לשיעורים, צעד אחר צעד.",
      "הצעד להיום הוא אחד: להיכנס ללוח הבקרה של בית הספר, ולבחור את תוכנית הלימודים ואת סוג בית הספר.",
      "אחרי זה כל המקצועות והיחידות של השכבות שלכם מוכנים להקרנה.") },
    en: { subject: "Welcome to your Gadit pilot", cta: "Open the dashboard", body: P(
      "Hi,",
      "We're glad you're with us.",
      "Over the next 30 days we'll help you bring Gadit into your lessons, one step at a time.",
      "Today there's just one step: open the school dashboard and choose your curriculum and school type.",
      "After that, every subject and unit for your grades is ready to project.") },
  },
  {
    key: "sch-first-lesson", dayOffset: 1, path: "/sets",
    he: { subject: "השיעור הראשון, בחמש דקות", cta: "לקבוצות המילים", body: P(
      "הגיע הזמן להקרין את המילים הראשונות בכיתה.",
      "פותחים את קבוצות המילים, בוחרים מקצוע ונושא, ולוחצים על \"הצגה בכיתה\".",
      "כל מילה מופיעה על המסך הגדול, עם תמונה, הגדרה שמתאימה לשיעור ודוגמאות.",
      "אפשר להשמיע אותה, ובכיתות הנמוכות להציג עם ניקוד.",
      "מומלץ להתחיל עם נושא שהכיתה לומדת השבוע.") },
    en: { subject: "Your first lesson, in five minutes", cta: "Open the word sets", body: P(
      "It's time to project the first words in class.",
      "Open the word sets, pick a subject and a topic, and tap \"Present to class\".",
      "Each word appears on the big screen, with a picture, a definition that fits the lesson, and examples.",
      "You can play it aloud too.",
      "Start with a topic the class is learning this week.") },
  },
  {
    key: "sch-teachers", dayOffset: 3, path: "/schools/manage",
    he: { subject: "מכניסים את המורים", cta: "ללוח הבקרה", body: P(
      "Gadit בבית ספר הוא כלי של המורה.",
      "התלמידים לא צריכים מכשירים או חשבונות.",
      "כל המורים בשכבות המשתתפות נכנסים עם פרטי הכניסה של בית הספר, ומקבלים גישה לכל המקצועות.",
      "כדאי להתחיל עם שניים או שלושה מורים שמלמדים השבוע נושא חדש.",
      "בקשו מהם להקרין את המילים בתחילת השיעור.",
      "כל מה שצריך בכיתה הוא מחשב ומקרן או מסך.") },
    en: { subject: "Bring your teachers in", cta: "Open the dashboard", body: P(
      "At school, Gadit is the teacher's tool.",
      "Students don't need devices or accounts.",
      "Teachers in the participating grades sign in with the school's login and get every subject.",
      "Start with two or three teachers who begin a new topic this week.",
      "Ask them to project the words at the start of the lesson.",
      "All a classroom needs is a computer and a projector or screen.") },
  },
  {
    key: "sch-quiz", dayOffset: 6, path: "/sets",
    he: { subject: "חידון ומשחק לכל הכיתה", cta: "לקבוצות המילים", body: P(
      "אחרי שהמילים הוקרנו, כדאי לבדוק שהן נקלטו.",
      "במסך ההקרנה יש שני כפתורים: \"חידון לכיתה\" עם שלוש שאלות, ו\"משחק לכיתה\" של נכון או לא נכון נגד השעון.",
      "הכיתה עונה יחד, והמסך מראה כמה תשובות נכונות היו.",
      "חמש דקות בסוף השיעור, והמילים נשארות.") },
    en: { subject: "A quiz and a game for the whole class", cta: "Open the word sets", body: P(
      "Once the words are on the board, check that they stuck.",
      "The projector screen has two buttons: \"Class quiz\" with three questions, and \"Class game\", true or false against the clock.",
      "The class answers together, and the screen shows how many they got right.",
      "Five minutes at the end of the lesson, and the words stay.") },
  },
  {
    key: "sch-dictionary", dayOffset: 10, path: "/sets",
    he: { subject: "מילון הכיתה מתמלא", cta: "לקבוצות המילים", body: P(
      "כל מילה שהוקרנה בכיתה נכנסת למילון של בית הספר.",
      "על המסך מופיע \"הכיתה שלכם: N מילים\", עם דרגה ויעד לדרגה הבאה.",
      "כשהכיתה עוברת דרגה, המסך חוגג איתה.",
      "זה רגע טוב לספר לתלמידים כמה מילים הם כבר מכירים.") },
    en: { subject: "Your class dictionary is filling up", cta: "Open the word sets", body: P(
      "Every word projected in class goes into the school's dictionary.",
      "The screen shows \"Your class: N words\", with a rank and the goal for the next one.",
      "When the class moves up a rank, the screen celebrates with them.",
      "It's a good moment to tell the students how many words they already know.") },
  },
  {
    key: "sch-halfway", dayOffset: 14, path: "/schools/manage",
    he: { subject: "חצי הדרך: איך מודדים את השיפור", cta: "ללוח הבקרה", body: P(
      "עברו שבועיים מתחילת הפיילוט.",
      "הדרך הפשוטה למדוד: כמה מילים יש במילון הכיתה, וכמה מורים כבר משתמשים.",
      "מומלץ גם לשאול שני מורים: האם התלמידים מבינים יותר את החומר, והאם הם משתמשים במילים בשיעור.",
      "ואם אפשר, הקרינו חידון על נושא שנלמד לפני שבוע, וראו מה נשאר.") },
    en: { subject: "Halfway there: how to measure the change", cta: "Open the dashboard", body: P(
      "Two weeks of the pilot are behind you.",
      "The simple measure: how many words are in the class dictionary, and how many teachers are using it.",
      "Ask two teachers too: do students understand the material better, and do they use the words in class?",
      "If you can, project a quiz on a topic taught a week ago, and see what stayed.") },
  },
  {
    key: "sch-ending", dayOffset: 25, path: "https://gadit.app/he/schools/landing#pricing",
    he: { subject: "הפיילוט מסתיים בעוד חמישה ימים", cta: "למחירים", body: P(
      "הפיילוט מתקרב לסופו, וזה הזמן לסכם.",
      "נשמח לקבוע שיחה קצרה: מה עבד, מה פחות, ואיך ממשיכים לשנת הלימודים.",
      "המחיר נקבע לפי מספר התלמידים בשכבות המשתתפות.",
      "משלמים בהעברה בנקאית, מול חשבונית מס.",
      "אפשר פשוט להשיב למייל הזה, ונחזור אליכם.") },
    en: { subject: "Your pilot ends in five days", cta: "See the plans", body: P(
      "The pilot is nearly over, and it's time to wrap up.",
      "We'd love a short call: what worked, what didn't, and how to continue for the school year.",
      "Just reply to this email and we'll get back to you.") },
  },
];

export function schoolLang(curriculum: string | undefined): "he" | "en" {
  return (curriculum ?? "").startsWith("il-") || curriculum === "all" || !curriculum ? "he" : "en";
}

export function buildSchoolMail(m: SchoolMail, lang: "he" | "en", unsubscribeUrl: string): { subject: string; html: string } {
  const c = m[lang];
  const base = lang === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${lang}`;
  let url = m.path.startsWith("http") ? m.path : `${base}${m.path}`;
  if (lang === "en" && m.key === "sch-ending") url = "https://gadit.app/schools/landing";
  return {
    subject: c.subject,
    html: renderEmailHtmlV2({
      he: lang === "he",
      lang,
      bodyHtml: mdLiteToHtml(lang, c.body),
      ctaText: c.cta,
      ctaUrl: url,
      next: "",
      helpUrl: `${base}/help`,
      unsubscribeUrl,
    }),
  };
}
