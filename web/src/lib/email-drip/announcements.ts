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
  {
    // Reading check (2026-10-21 launch, 18fa83e3 + c7dc8325): for every
    // paying subscriber, since /read is in every paid plan.
    id: "2026-10-reading-check",
    audience: "paying",
    ctaPath: "/read",
    he: C(
      "חדש ב-Gadit: בודקים שהבנו את מה שקראנו",
      `היי {שם},

הוספנו ל-Gadit דרך חדשה לקרוא: **בדיקת הבנה אחרי הקריאה**.

## איך זה עובד
1. פותחים את **קריאה**, ומצלמים עמוד מהספר או מהחוברת, או מדביקים טקסט.
2. קוראים, ולוחצים על כל מילה שלא ברורה. הפירוש נפתח מיד, ובמילה משפה אחרת מופיע גם התרגום.
3. בסוף לוחצים **"בואו נבדוק שהבנו את המילים"**.

## מה הבדיקה עושה
Gadit שואל על המילים שלחצתם עליהן ועל עוד כמה מילים קשות מהטקסט: מה פירוש המילה כאן, במשפט הזה.
אחר כך מגיעות 3 עד 5 שאלות קצרות על מה שקראתם.
המילים שלא היו ברורות נשמרות במחברת, ונכנסות לתרגול ולמשחקים.

**לילדים:** הבדיקה בנויה כך שהילד יכול לעשות אותה לבד. כשהוא מסיים קריאה משיעורי הבית, מגיעה אליכם הודעה.

לא רוצים בדיקה עכשיו? לוחצים "סיימנו לקרוא", והקריאה נשמרת כרגיל.`,
      "לקריאה",
    ),
    en: C(
      "New in Gadit: check you understood what you read",
      `Hi {name},

We added a new way to read in Gadit: **a comprehension check after reading**.

## How it works
1. Open **Read**, and photograph a page from a book or workbook, or paste a text.
2. Read, and tap any word that isn't clear. The meaning opens right away, and a word from another language also shows its translation.
3. At the end, tap **"Let's check I understood the words"**.

## What the check does
Gadit asks about the words you tapped and a few more hard words from the text: what does the word mean here, in this sentence.
Then come 3 to 5 short questions about what you read.
The words that weren't clear are saved to the notebook, and go into practice and games.

**For kids:** the check is built so a child can do it alone. When your child finishes a reading from homework, you get a message.

Not in the mood for a check? Tap "Done reading", and the reading is saved as usual.`,
      "Open Read",
    ),
  },
];
