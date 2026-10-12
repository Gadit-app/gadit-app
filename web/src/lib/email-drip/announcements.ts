/**
 * "What's new" emails (Gadi 2026-10-12: every time we launch a feature, every
 * subscriber hears about it; people don't know Homework, dictation and the
 * rest exist). One entry per launch; /api/admin/announce sends it once per
 * subscriber, in the same layout as the series, respecting unsubscribe and
 * Shabbat (scheduled send). Hebrew and English; other languages read the
 * English until a translation is added under `t`.
 */
import type { EmailContent } from "./render";

export type Announcement = {
  id: string;
  /** Who gets it: family subscribers, or every paying subscriber. */
  audience: "family" | "paying";
  ctaPath: string;
  he: EmailContent;
  en: EmailContent;
  /** Optional translations by UI language. */
  t?: Record<string, EmailContent>;
};

const C = (subject: string, body: string, ctaText: string): EmailContent => ({ subject, heading: "", body, ctaText, next: "" });

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "2026-10-homework",
    audience: "family",
    ctaPath: "/homework",
    he: C(
      "חדש ב-Gadit: שיעורי בית",
      `היי {שם},

הוספנו ל-Gadit אזור חדש לילדים: **שיעורי בית**.
הוא מופיע בתפריט העליון אצל הילד, או כשמצב ילדים פועל.

## מוסיפים את שיעורי הבית בשנייה
מצלמים את הדף מהחוברת, מעלים תמונה או מדביקים רשימה.
מסמנים אם זו רשימת מילים, טקסט לקריאה או דפי חוברת, ובוחרים מתי המבחן.
הילד רואה מיד כרטיס "מה צריך להכין", ולוחץ "מתחילים".

## מה יש בפנים
1. **לומדים מילים:** הכתבה בעברית, באנגלית ובכל שפה (שומעים מילה וכותבים אותה), והתרגול החדש "הקשיבו ובחרו".
2. **קוראים טקסט:** מצלמים קטע קריאה, ולוחצים על כל מילה שלא ברורה.
3. **מתכוננים למבחן:** בכל מקצוע, מדביקים את המילים ומתרגלים עד היום עצמו.

**ולמי שלומד אנגלית:** שיעורים צעד אחר צעד, ומילים מוכנות לפי נושאים מתוכנית משרד החינוך ליסודי ולחטיבת הביניים.

## ואתם יודעים מה קרה
כשהילד מסיים הכתבה, שיעור או משחק, ואפילו דו-קרב בין האחים, מגיעה אליכם הודעה עם התוצאה.
בוחרים מיד או בסיכום יומי, ועל מה לקבל הודעה, ב[הגדרות של לוח ההורים](/family?tab=settings).`,
      "לשיעורי הבית",
    ),
    en: C(
      "New in Gadit: Homework",
      `Hi {name},

We added a new area for kids in Gadit: **Homework**.
It's in the top menu on your child's profile, or while Kids Mode is on.

## Add the homework in a second
Photograph the workbook page, upload a picture or paste a list.
Mark whether it's a word list, a text to read or workbook pages, and pick the test day.
Your child sees a "To do" card right away and taps "Start".

## What's inside
1. **Learning words:** dictation in your language, in English or any language (hear a word and write it), and the new "Listen and pick".
2. **Reading a text:** photograph a passage and tap any word that isn't clear.
3. **Getting ready for a test:** for any subject, paste the words and practise until the day.

**And for children learning English:** step-by-step lessons.

## And you know what happened
When your child finishes a dictation, a lesson or a game, even a duel between siblings, you get a message with the result.
Choose right away or one daily summary, and what to hear about, in the [parent board settings](/family?tab=settings).`,
      "Open Homework",
    ),
  },
];
