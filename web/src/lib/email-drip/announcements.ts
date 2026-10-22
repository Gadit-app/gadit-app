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
  audience: "family" | "paying" | "individual";
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
    // Reading check (2026-10-21 launch, 18fa83e3 + c7dc8325), Family
    // version. Wording weighed from seven assistants (Gadi 2026-10-22): the
    // problem first, then how, what happens, the child alone, and where last.
    id: "2026-10-reading-check",
    audience: "family",
    // The homework reading (Gadi 2026-10-22), not the general reader.
    ctaPath: "/read?from=homework",
    he: { subject: "חדש ב-Gadit: בודקים שהילד הבין את מה שקרא", heading: "", body: "היי {שם},\n\nחדש ב-Gadit: **בדיקת הבנה אחרי קריאה**.\n\nהילד קורא, לוחץ על כל מילה שלא ברורה לו, ובסוף Gadit בודק שהוא באמת הבין.\n\n## איך זה עובד\n1. מצלמים עמוד מהספר או מהחוברת, או מדביקים טקסט.\n2. הילד קורא, ולוחץ על כל מילה שלא ברורה לו. הפירוש נפתח מיד (במילה משפה אחרת מופיע גם התרגום).\n3. בסוף הוא לוחץ **\"בדיקת הבנה של מילים\"**.\n\n## מה קורה בבדיקה\nGadit שואל את הילד על המילים שהוא לחץ עליהן, ועל עוד כמה מילים קשות מהטקסט.\n\nלא מה המילה אומרת באופן כללי, אלא **בהקשר של המשפט שהוא קרא בטקסט**.\n\nאחר כך מגיעות 3 עד 5 שאלות קצרות על מה שהוא קרא.\n\nהמילים שלא היו ברורות לו נשמרות במחברת שלו, ונכנסות לתרגול ולמשחקים.\n\n## הילד יכול לעשות את זה לבד\nכשהוא מסיים קריאה משיעורי הבית, מגיעה אליכם הודעה.\n\nרוצים הפעם רק לקרוא, בלי בדיקה? לוחצים **\"סיימנו לקרוא\"**, והקריאה נשמרת כרגיל.\n\n## איפה זה נמצא\n**אצל הילד** (בפרופיל של הילד, או כשמצב ילדים פועל):\n1. בתפריט העליון לוחצים על **שיעורי בית**.\n2. בוחרים **קוראים טקסט**.\n\n**אצלכם, ההורים:**\n1. בתפריט העליון לוחצים על **תרגולים**.\n2. בוחרים **קריאה עם בדיקת הבנה**.\n\n**ובכל פרופיל:** אפשר גם ללחוץ על **כל מילה** בתפריט העליון.", ctaText: "לנסות עכשיו", next: "יש שאלה? פשוט עונים למייל הזה, אנחנו כאן.", closing: "", signature: "גדי והצוות של Gadit" },
    en: { subject: "New in Gadit: check your child understood what they read", heading: "", body: "Hi {name},\n\nNew in Gadit: **a comprehension check after reading**.\n\nYour child reads, taps any word that isn't clear, and at the end Gadit checks they really understood.\n\n## How it works\n1. Photograph a page from a book or workbook, or paste a text.\n2. Your child reads, and taps any word that isn't clear. The meaning opens right away, and a word from another language also shows its translation.\n3. At the end they tap **\"Let's check I understood the words\"**.\n\n## What happens in the check\nGadit asks your child about the words they tapped, and a few more hard words from the text.\n\nNot what the word means in general, but **what it means here, in this sentence**.\n\nThen come 3 to 5 short questions about what they read.\n\nThe words that weren't clear are saved to their notebook, and go into practice and games.\n\n## A child can do it alone\nWhen your child finishes a reading from homework, you get a message.\n\nJust want to read this time, without a check? Tap **\"Done reading\"**, and the reading is saved as usual.\n\n## Where to find it\n**For your child** (on the child's profile, or while Kids Mode is on):\n1. In the top menu, tap **Homework**.\n2. Choose **Reading a text**.\n\n**For you, the parents:**\n1. In the top menu, tap **Practice**.\n2. Choose **Reading comprehension**.\n\n**On any profile:** you can also tap **Every Word** in the top menu.", ctaText: "Try it now", next: "Any question? Just reply to this email, we're here.", closing: "", signature: "Gadi and the Gadit team" },
  },
  {
    // The same launch for Individual subscribers on deep: Practice (2026-10-22).
    id: "2026-10-reading-check-indiv",
    audience: "individual",
    // Grown-ups: straight into Every Word, where the check runs (Gadi 2026-10-22).
    ctaPath: "/read",
    he: { subject: "חדש ב-Gadit: בודקים שהבנתם את מה שקראתם", heading: "", body: "היי {שם},\n\nחדש ב-Gadit: **בדיקת הבנה אחרי קריאה**.\n\nקוראים טקסט, לוחצים על כל מילה שלא מובנת כמו שצריך, ובסוף Gadit בודק שבאמת הבנתם.\n\n## איך זה עובד\n1. מצלמים עמוד מספר, ממאמר או מכל מסמך, או מדביקים טקסט.\n2. קוראים, ולוחצים על כל מילה שלא ברורה. הפירוש נפתח מיד (במילה משפה אחרת מופיע גם התרגום).\n3. בסוף לוחצים **\"בדיקת הבנה של מילים\"**.\n\n## מה קורה בבדיקה\nGadit שואל על המילים שלחצתם עליהן, ועל עוד כמה מילים קשות מהטקסט.\n\nלא מה המילה אומרת באופן כללי, אלא **בהקשר של המשפט שקראתם בטקסט**.\n\nאחר כך מגיעות 3 עד 5 שאלות קצרות על מה שקראתם.\n\nהמילים שלא היו ברורות נשמרות במחברת שלכם, ונכנסות לתרגול ולמשחקים.\n\nרוצים הפעם רק לקרוא, בלי בדיקה? לוחצים **\"סיימנו לקרוא\"**, והקריאה נשמרת כרגיל.\n\n## איפה זה נמצא\n1. בתפריט העליון לוחצים על **תרגולים**.\n2. בוחרים **קריאה עם בדיקת הבנה**.\n\nאפשר גם ללחוץ על **כל מילה** בתפריט העליון.\n\nב**תרגולים** מחכים לכם עוד שלושה תרגולים: הכנה למבחן, הכתבה ולימוד שפה.", ctaText: "לנסות עכשיו", next: "יש שאלה? פשוט עונים למייל הזה, אנחנו כאן.", closing: "", signature: "גדי והצוות של Gadit" },
    en: { subject: "New in Gadit: check you understood what you read", heading: "", body: "Hi {name},\n\nNew in Gadit: **a comprehension check after reading**.\n\nRead, tap any word that isn't clear, and at the end Gadit checks you really understood.\n\n## How it works\n1. Photograph a page from a book, an article or any document, or paste a text.\n2. Read, and tap any word that isn't clear. The meaning opens right away, and a word from another language also shows its translation.\n3. At the end, tap **\"Let's check I understood the words\"**.\n\n## What happens in the check\nGadit asks about the words you tapped, and a few more hard words from the text.\n\nNot what the word means in general, but **what it means here, in this sentence**.\n\nThen come 3 to 5 short questions about what you read.\n\nThe words that weren't clear are saved to your notebook, and go into practice and games.\n\nJust want to read this time, without a check? Tap **\"Done reading\"**, and the reading is saved as usual.\n\n## Where to find it\n1. In the top menu, tap **Practice**.\n2. Choose **Reading comprehension**.\n\nYou can also tap **Every Word** in the top menu.\n\nThree more practices are waiting in **Practice**: test prep, dictation and learning a language.", ctaText: "Try it now", next: "Any question? Just reply to this email, we're here.", closing: "", signature: "Gadi and the Gadit team" },
  },
];
