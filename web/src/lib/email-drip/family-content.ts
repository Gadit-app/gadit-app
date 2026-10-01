import type { EmailContent } from "./render";

/**
 * Single source of truth for the editable Family onboarding emails.
 * Content is markdown-lite (see render.ts) so the admin editor and the
 * code defaults share one format. A saved override in Firestore
 * (emailTemplates/{key}) replaces the default here per language.
 *
 * v2, rebuilt 2026-09-28 (Gadi) on the Yooniz onboarding rules:
 *   - one email = one topic, never repeated; ordered by importance
 *     (setup, then habit, then the extra tools);
 *   - daily for the first week, then spreading out (days below);
 *   - every email: "היי {שם}," greeting, why it matters, a bold heading per
 *     part (what it is before how), "איך עושים את זה, שלב אחר שלב:" steps,
 *     an optional "טיפ מהשטח", ONE button to the exact screen (or none),
 *     a bridge line to the next email ("מחר..." when it comes the next day,
 *     "במייל הבא..." otherwise; none on the last), then the fixed closing
 *     and the team signature (added by renderEmailHtmlV2);
 *   - we speak as a team, no dashes, no questions to the reader, no promises
 *     the product doesn't keep; button and screen names quoted exactly as
 *     the app shows them. {שם} / {name} = the parent's first name.
 * Keys are new (fam2-*): families already mid-way through the old series
 * continue from their current day without a backlog (STALE_DAYS in the cron).
 */

export const EMAIL_BASE = "https://www.gadit.app";

export type FamilyEmailMeta = {
  key: string;
  label: string; // admin list label
  dayOffset: number;
  ctaUrlTab: string; // appended to the CTA path
  ctaPath?: string; // feature page for the CTA (default "/family"), e.g. "/read"
  eyebrow?: { he: string; en: string };
  foot?: { he: string; en: string };
  /** Yooniz-style layout (renderEmailHtmlV2): greeting in the body, bridge
   *  line to the next email, team signature, no eyebrow/foot. */
  v2?: boolean;
};

const M = (key: string, label: string, dayOffset: number, ctaPath = "/family", ctaUrlTab = ""): FamilyEmailMeta => ({
  key,
  label,
  dayOffset,
  ctaPath,
  ctaUrlTab,
  v2: true,
});

export const FAMILY_META: FamilyEmailMeta[] = [
  M("fam2-start", "Family · 1 · Getting started (install, members, devices)", 0, "/family", "?tab=members"),
  M("fam2-word", "Family · 2 · Understand a word all the way", 1, "/"),
  M("fam2-kids", "Family · 3 · Kids Mode", 2, "/"),
  M("fam2-notebook", "Family · 4 · The notebook", 3, "/notebook"),
  M("fam2-read", "Family · 5 · Every Word (a whole page)", 4, "/read"),
  M("fam2-context", "Family · 6 · The right meaning from the sentence", 5, "/"),
  M("fam2-games", "Family · 7 · Word games", 6, "/play"),
  M("fam2-help", "Family · 8 · Help and guides", 7, "/help"),
  M("fam2-spell", "Family · 9 · School dictation practice", 8, "/spell"),
  M("fam2-say", "Family · 10 · Say it", 10, "/say"),
  M("fam2-dashboard", "Family · 11 · Parent board", 11, "/family"),
  M("fam2-alerts", "Family · 12 · Word alerts", 13, "/family", "?tab=settings"),
  M("fam2-ranks", "Family · 13 · Ranks, streaks, skins", 15),
  M("fam2-questions", "Family · 14 · Questions about a word", 17, "/"),
  M("fam2-idioms", "Family · 15 · Idioms and expressions", 19, "/"),
  M("fam2-languages", "Family · 16 · Any word, explained in your language", 21),
  M("fam2-coach", "Family · 17 · Private teacher or coach", 24, "/family", "?tab=settings"),
  M("fam2-safe", "Family · 18 · A closed, safe place (last)", 30, "/family"),
];

const C = (subject: string, body: string, ctaText: string, next: string): EmailContent => ({
  subject,
  heading: "",
  body,
  ctaText,
  next,
});

export const FAMILY_CONTENT: Record<string, { he: EmailContent; en: EmailContent }> = {
  "fam2-start": {
    he: C(
      "היי {שם}, ככה מתחילים עם Gadit",
      `היי {שם},

איזה כיף שהצטרפת ל-Gadit 🎉

ל-Gadit שתי מטרות:

1. לעזור לילד להבין כל מילה עד הסוף, ולבנות אוצר מילים שגדל מילה אחרי מילה.
2. לתת להורה לראות מה הילד לומד, ולעזור בדיוק איפה שצריך.

אלה הצעדים הראשונים שלך:

## הוספת Gadit למסך הבית בטלפון

**משתמשי אנדרואיד:**

1. נכנסים ל[חנות Google Play](https://play.google.com/store/apps/details?id=com.gadit.app).
2. מורידים את האפליקציה.
3. מתחברים עם חשבון Google או עם המייל והסיסמה שיצרת.

**משתמשי אייפון:**

1. נכנסים דרך Safari לכתובת: https://www.gadit.app/he
2. לוחצים על כפתור השיתוף.
3. לוחצים על "הוסף למסך הבית".

## הוספת בני המשפחה
1. נכנסים ל[אזור המשפחה, ללשונית "בני המשפחה"](/family?tab=members).
2. לוחצים על "הוספת בן משפחה".
3. בוחרים אבא, אמא, בן או בת, וממלאים שם, גיל וצבע.
4. לוחצים על "הוסף למשפחה", ובן המשפחה מתווסף מיד.

מומלץ להוסיף גם את ההורה השני, אם זה רלוונטי למשפחה שלכם.

## חיבור המכשירים של הילדים
1. ב[אזור המשפחה, בלשונית "בני המשפחה"](/family?tab=members), לוחצים על "חיבור מכשיר" ליד הילד.
2. נפתח חלון עם שתי אפשרויות: קוד QR, או קישור וקוד בן 6 ספרות.
3. מהמכשיר של הילד סורקים את קוד ה-QR, או נכנסים ל-[gadit.app/join](https://www.gadit.app/join) ומקלידים את הקוד.
4. זהו. הילד נכנס לאזור האישי שלו, עם המחברת שלו, בלי גישה להגדרות שלך.

חוזרים על אותם צעדים לכל ילד.

## אין לילד טלפון או טאבלט משלו?
אפשר להשתמש במכשיר אחד לכל המשפחה:

1. ב[אזור המשפחה, בלשונית "בני המשפחה"](/family?tab=members), לוחצים על "מסך משותף לילדים".
2. מוסרים את המכשיר לילד. במסך "מי משתמש עכשיו?" הוא לוחץ על עצמו.
3. כשהוא מסיים, לוחצים על "יציאה".`,
      "להוספת הילד הראשון",
      "מחר נדבר על הלב של Gadit: איך מבינים מילה עד הסוף.",
    ),
    en: C(
      "Hi {name}, here's how to get started with Gadit",
      `Hi {name},

So glad you joined Gadit 🎉

Gadit has two goals:

1. Help your child understand every word all the way through, and build a vocabulary that grows word by word.
2. Let you see what your child is learning, so you can help exactly where it's needed.

These are your first steps:

## Add Gadit to your phone's home screen

**Android:**

1. Open [Google Play](https://play.google.com/store/apps/details?id=com.gadit.app).
2. Download the app.
3. Sign in with Google, or with the email and password you created.

**iPhone:**

1. Open this address in Safari: https://www.gadit.app
2. Tap the Share button.
3. Tap "Add to Home Screen".

## Add your family members
1. Open [your family area, on the "Family" tab](/family?tab=members).
2. Tap "Add a family member".
3. Choose Dad, Mom, son or daughter, and fill in a name, age and color.
4. Tap "Add to family", and they're added right away.

It's a good idea to add the other parent too, if that fits your family.

## Connect your children's devices
1. In [your family area, on the "Family" tab](/family?tab=members), tap "Pair device" next to your child.
2. A window opens with two options: a QR code, or a link and a 6-digit code.
3. On your child's device, scan the QR code, or go to [gadit.app/join](https://www.gadit.app/join) and type the code.
4. That's it. Your child lands in their own space, with their own notebook, and no access to your settings.

Repeat the same steps for each child.

## No phone or tablet of their own?
One device can work for the whole family:

1. In [your family area, on the "Family" tab](/family?tab=members), tap "Shared kids screen".
2. Hand the device to your child. On the "Who's using?" screen they tap themselves.
3. When they're done, tap "Exit".`,
      "Add your first child",
      "Tomorrow we'll look at the heart of Gadit: understanding a word all the way through.",
    ),
  },

  "fam2-word": {
    he: C(
      "היי {שם}, ככה מבינים מילה עד הסוף",
      `היי {שם},

הלב של Gadit הוא להבין מילה אחת עד הסוף. כל המשמעויות שלה, דוגמאות, תמונה, והסיפור של מאיפה היא הגיעה. מילה שמבינים ככה נשארת.

## מה מקבלים על כל מילה
**הגדרות:** כל המשמעויות של המילה, עם דוגמאות לכל משמעות.

**תמונה:** תמונה שעוזרת לראות את המשמעות.

**מקור המילה:** מאיפה המילה הגיעה ואיך היא השתנתה בדרך.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל[דף הבית של Gadit](/).
2. מקלידים מילה בתיבה "הקלידו מילה".
3. עוברים על "הגדרות", על התמונה ועל "מקור המילה".
4. מתחת לכל משמעות יש כפתורים כמו "חידון" ו"חברו משפט", כדי לתרגל אותה מיד.

**טיפ מהשטח:** לבחור יחד עם הילד מילה אחת מהשיעורים של היום ולחפש אותה. חמש דקות, ומילה חדשה נשארת.`,
      "לחיפוש מילה",
      "מחר נדבר על מצב ילדים: הסבר פשוט ותמונה לכל משמעות.",
    ),
    en: C(
      "Hi {name}, here's how to understand a word all the way through",
      `Hi {name},

The heart of Gadit is understanding one word all the way through. All its meanings, examples, a picture, and the story of where it came from. A word understood like this stays.

## What you get for every word
**Definitions:** every meaning of the word, with examples for each one.

**Visual:** a picture that helps you see the meaning.

**Word Origin:** where the word came from and how it changed along the way.

## How to do it, step by step:
1. Open the [Gadit home page](/).
2. Type a word in the "Type a word" box.
3. Go through "Definitions", the picture and "Word Origin".
4. Under each meaning there are buttons like "Quiz" and "Compose a sentence", to practice it right away.

**A tip from other families:** pick one word from today's lessons together with your child and look it up. Five minutes, and a new word stays.`,
      "Look up a word",
      "Tomorrow we'll look at Kids Mode: a simple explanation and a picture for every meaning.",
    ),
  },

  "fam2-kids": {
    he: C(
      "היי {שם}, ככה כל מילה מוסברת בשפה של ילדים",
      `היי {שם},

הגדרה רגילה נכתבת למבוגרים. ילד צריך הסבר אחר, כמו שהורה היה מסביר לו.

## מצב ילדים
כשמצב ילדים פועל, כל הגדרה נכתבת בשביל ילד: מילים פשוטות, דוגמאות מהעולם שלו, ותמונה לכל משמעות שמופיעה לבד.

בפרופיל של ילד, מצב ילדים פועל כברירת מחדל בכל פעם שפותחים את Gadit.

## איך עושים את זה, שלב אחר שלב:
1. ב[תיבת החיפוש בדף הבית](/), ליד המיקרופון, יש מתג "ילדים".
2. מדליקים אותו, ומחפשים מילה.
3. ההסבר והתמונות מגיעים בשפה של ילדים.
4. רוצים את ההגדרה המלאה? מכבים את המתג ומחפשים שוב.

**טיפ מהשטח:** לחפש את אותה מילה פעם במצב ילדים ופעם בלי. ככה רואים איך הילד מבין אותה, ואיך מבוגר מבין אותה.`,
      "לחיפוש מילה במצב ילדים",
      "מחר נדבר על המחברת, המקום שבו כל מילה נשמרת.",
    ),
    en: C(
      "Hi {name}, here's how every word gets explained for kids",
      `Hi {name},

A regular definition is written for adults. A child needs a different explanation, the way a parent would explain it.

## Kids Mode
With Kids Mode on, every definition is written for a child: simple words, examples from their world, and a picture for every meaning that appears on its own.

On a child's profile, Kids Mode is on by default every time Gadit opens.

## How to do it, step by step:
1. In the [search box on the home page](/), next to the microphone, there's a "Kids" switch.
2. Turn it on and look up a word.
3. The explanation and the pictures come in kids' language.
4. Want the full definition? Turn the switch off and search again.

**A tip from other families:** look up the same word once with Kids Mode and once without. You'll see how a child understands it, and how an adult does.`,
      "Search in Kids Mode",
      "Tomorrow we'll look at the notebook, where every word is saved.",
    ),
  },

  "fam2-notebook": {
    he: C(
      "היי {שם}, כל מילה שהילד מחפש נשמרת",
      `היי {שם},

מילה שחוזרים אליה היא מילה שנשארת. בשביל זה לכל ילד יש מחברת משלו.

## המחברת
כל מילה שהילד מחפש נשמרת במחברת שלו אוטומטית, בלי ללחוץ על כלום. אצל הילד המחברת נקראת "אוצר המילים שלי".

כשיש מילים בכמה שפות, מופיע למעלה סינון לפי שפה.

## איך עושים את זה, שלב אחר שלב:
1. הילד נכנס ל["אוצר המילים"](/notebook) מהתפריט.
2. רואים את כל המילים שחיפש, מסודרות לפי שפה.
3. לוחצים על מילה כדי לחזור לדף שלה.

**טיפ מהשטח:** פעם בשבוע לעבור יחד על המחברת ולבחור שלוש מילים לחזור עליהן. זה לוקח דקה.`,
      "למחברת",
      "מחר נדבר על כל מילה: איך מבינים דף שלם מתוך הספר.",
    ),
    en: C(
      "Hi {name}, every word your child looks up is saved",
      `Hi {name},

A word you come back to is a word that stays. That's why every child has a notebook of their own.

## The notebook
Every word your child looks up is saved to their notebook automatically, without tapping anything. For your child, the notebook is called "My words".

When there are words in more than one language, a language filter appears at the top.

## How to do it, step by step:
1. Your child opens ["My words"](/notebook) from the menu.
2. They see every word they looked up, grouped by language.
3. Tap a word to go back to its page.

**A tip from other families:** once a week, go through the notebook together and pick three words to revisit. It takes a minute.`,
      "Open the notebook",
      "Tomorrow we'll look at Every Word: understanding a whole page from a book.",
    ),
  },

  "fam2-read": {
    he: C(
      "היי {שם}, ככה מבינים דף שלם מתוך הספר",
      `היי {שם},

בשיעורי הבית ובספר, המילים לא מגיעות אחת אחת. הן מגיעות בדף שלם. בשביל זה יש את כל מילה.

## כל מילה
מצלמים או מדביקים טקסט, ו-Gadit פותח אותו כך שאפשר ללחוץ על כל מילה ולקבל את המשמעות שלה. המילים הקשות מסומנות בצבע, ומילה שכבר פתחו הופכת לירוקה.

אפשר גם להבין משפט שלם: בסוף כל משפט יש סימן קטן, ולחיצה עליו פותחת "מה המשפט הזה אומר".

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["כל מילה"](/read) מהתפריט.
2. לוחצים על "לצלם עמוד" ומצלמים את הדף, או מדביקים טקסט בתיבה.
3. לוחצים על "לפתוח את הטקסט".
4. לוחצים על כל מילה לא מוכרת. בחלון שנפתח יש גם "פתח הגדרה מלאה".

**טיפ מהשטח:** לפני שהילד קורא פרק, לפתוח את "המילים החשובות בקטע" ולעבור עליהן יחד. הקריאה אחרי זה הרבה יותר קלה.`,
      "לכל מילה",
      "מחר נדבר על איך מקבלים את המשמעות הנכונה לפי המשפט.",
    ),
    en: C(
      "Hi {name}, here's how to understand a whole page from a book",
      `Hi {name},

In homework and books, words don't come one at a time. They come as a whole page. That's what Every Word is for.

## Every Word
Photograph or paste a text, and Gadit opens it so you can tap any word and get its meaning. Hard words are highlighted, and a word you've already opened turns green.

You can understand a whole sentence too: at the end of every sentence there's a small icon, and tapping it opens "What this sentence means".

## How to do it, step by step:
1. Open ["Every Word"](/read) from the menu.
2. Tap "Photograph with camera" and take a picture of the page, or paste text into the box.
3. Tap "Open text".
4. Tap any unfamiliar word. The window that opens also has "Open full definition".

**A tip from other families:** before your child reads a chapter, open "Key words in this text" and go over them together. The reading that follows is much easier.`,
      "Open Every Word",
      "Tomorrow we'll look at getting the right meaning from the sentence.",
    ),
  },

  "fam2-context": {
    he: C(
      "היי {שם}, ככה מקבלים את המשמעות הנכונה לפי המשפט",
      `היי {שם},

להרבה מילים יש כמה משמעויות. המשפט שבו המילה הופיעה הוא מה שקובע איזו מהן נכונה עכשיו.

## מצב הקשר
כותבים את המשפט שבו המילה הופיעה, ו-Gadit בוחר את המשמעות שמתאימה למשפט הזה. במקום רשימה של משמעויות, מקבלים הגדרה אחת מדויקת.

## איך עושים את זה, שלב אחר שלב:
1. ב[דף הבית](/) מקלידים את המילה בתיבה "הקלידו מילה".
2. בתיבה שמתחת כותבים את המשפט שבו המילה מופיעה.
3. מחפשים.
4. מקבלים את המשמעות שמתאימה בדיוק למשפט.

**טיפ מהשטח:** מילים כמו "bank" או "עין" הן הדוגמה הכי טובה. אותה מילה, שני משפטים, שתי משמעויות.`,
      "לחיפוש עם משפט",
      "מחר נדבר על משחקים שנבנים מהמילים של הילד.",
    ),
    en: C(
      "Hi {name}, here's how to get the right meaning from the sentence",
      `Hi {name},

Many words have more than one meaning. The sentence the word appeared in decides which one is right, right now.

## Context mode
Type the sentence the word appeared in, and Gadit picks the meaning that fits that sentence. Instead of a list of meanings, you get one precise definition.

## How to do it, step by step:
1. On the [home page](/), type the word in the "Type a word" box.
2. In the box below it, type the sentence where the word appears.
3. Search.
4. You get the meaning that fits the sentence exactly.

**A tip from other families:** words like "bank" or "bat" are the best example. Same word, two sentences, two meanings.`,
      "Search with a sentence",
      "Tomorrow we'll look at games built from your child's own words.",
    ),
  },

  "fam2-games": {
    he: C(
      "היי {שם}, משחקים שנבנים מהמילים של הילד",
      `היי {שם},

כדי שמילה תישאר, צריך לפגוש אותה שוב. משחק הוא הדרך הכי קלה לעשות את זה בלי שזה ירגיש כמו שיעורי בית.

## משחקי מילים
המשחקים נבנים מהמילים שהילד עצמו חיפש ונשמרו במחברת שלו. יש חידונים, משחק זיכרון, ערבול אותיות, השלמת משפט ועוד. במצב ילדים מופיעים רק המשחקים שמתאימים לילדים.

כדי להתחיל, צריך לפחות 4 מילים במחברת.

## איך עושים את זה, שלב אחר שלב:
1. הילד נכנס ל["משחקים"](/play) מהתפריט.
2. בוחר משחק מהרשימה.
3. משחק עם המילים שלו.

**טיפ מהשטח:** משחק אחד אחרי שיעורי הבית, חמש דקות. זה מספיק כדי שהמילים של השבוע יישארו.`,
      "למשחקי המילים",
      "מחר נדבר על העזרה שיש לך בכל שלב.",
    ),
    en: C(
      "Hi {name}, games built from your child's own words",
      `Hi {name},

For a word to stay, you need to meet it again. A game is the easiest way to do that without it feeling like homework.

## Word Games
The games are built from the words your child looked up and saved in their notebook. There are quizzes, Memory Match, Letter Scramble, Fill the Blank and more. In Kids Mode, only the games that suit kids appear.

To start, the notebook needs at least 4 words.

## How to do it, step by step:
1. Your child opens ["Play"](/play) from the menu.
2. They pick a game from the list.
3. They play with their own words.

**A tip from other families:** one game after homework, five minutes. That's enough for the week's words to stay.`,
      "Open Word Games",
      "Tomorrow we'll look at the help you have at every step.",
    ),
  },

  "fam2-help": {
    he: C(
      "היי {שם}, ככה מקבלים עזרה בכל שלב",
      `היי {שם},

כל כלי חדש לוקח רגע ללמוד. בשביל זה הכנו הדרכות קצרות, ואנחנו זמינים לכל שאלה.

## ההדרכות
בדף "הדרכות" יש מדריכים קצרים שמראים על המסך עצמו איך עושים כל דבר: איך מחפשים מילה, איך מחברים מכשיר, איך מפעילים התראות ועוד. הם מסודרים לפי נושאים: "מתחילים", "משפחה והתקנה", "כלים ללמידה" ו"חשבון".

בחלק מהמסכים יש גם סימן שאלה קטן, שפותח את המדריך של אותו מסך.

## איך עושים את זה, שלב אחר שלב:
1. פותחים את תפריט החשבון.
2. לוחצים על ["הדרכות"](/help).
3. בוחרים את המדריך שמתאים.
4. לא מצאת תשובה? אפשר פשוט להשיב למייל הזה, והוא מגיע אלינו.`,
      "להדרכות",
      "מחר נדבר על תרגול ההכתבה של בית הספר.",
    ),
    en: C(
      "Hi {name}, here's how to get help at every step",
      `Hi {name},

Every new tool takes a moment to learn. That's why we made short guides, and we're here for any question.

## Guides
The "Guides" page has short walkthroughs that show you, on the screen itself, how to do each thing: how to look up a word, how to pair a device, how to turn on alerts and more. They're organized by topic: "Getting started", "Family & install", "Learning tools" and "Account".

Some screens also have a small question mark that opens the guide for that screen.

## How to do it, step by step:
1. Open the account menu.
2. Tap ["Guides"](/help).
3. Choose the guide you need.
4. Didn't find the answer? Just reply to this email and it reaches us.`,
      "Open the guides",
      "Tomorrow we'll look at practicing for school dictations.",
    ),
  },

  "fam2-spell": {
    he: C(
      "היי {שם}, ככה מתכוננים להכתבה של בית הספר",
      `היי {שם},

הרבה ילדים מקבלים כל שבוע רשימת מילים להכתבה. בהכתבה אין "כמעט". צריך לכתוב כל מילה בדיוק.

## תרגול הכתבה
מדביקים את הרשימה של המורה, ו-Gadit מקריא כל מילה בקול. הילד כותב, ומקבל תשובה מיד. מילה שטעה בה חוזרת בסוף, עד שהיא נכונה.

אפשר לתרגל בשני הכיוונים: לשמוע מילה ולכתוב אותה באנגלית, או לכתוב אותה בשפה שלכם. ואפשר להקליד או לכתוב ביד על המסך.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["הכתבה"](/spell) מהתפריט.
2. לוחצים על "הדבקת רשימה משלך" ומדביקים את המילים, מילה בכל שורה (עד 20).
3. לוחצים על "יצירת סט".
4. בוחרים כיוון, והילד מתחיל לכתוב.
5. כשהילד מסיים, מגיעה אליך הודעה עם התוצאה.

**טיפ מהשטח:** שני תרגולים קצרים במהלך השבוע עובדים יותר טוב מתרגול אחד ארוך ערב לפני ההכתבה. כל תרגול נשמר ב"הכתבות" במחברת, עם הכפתור "לתרגל שוב".`,
      "לתרגול הכתבה",
      "במייל הבא נדבר על תגיד את זה: לשמוע משפט, ואז להגיד אותו בעצמך.",
    ),
    en: C(
      "Hi {name}, here's how to prepare for school dictations",
      `Hi {name},

Many children get a weekly list of words for a dictation. In a dictation there's no "almost". Every word has to be written exactly.

## Spelling practice
Paste the teacher's list, and Gadit reads each word out loud. Your child writes it and gets an answer right away. A word they missed comes back at the end, until it's right.

You can practice in both directions: hear a word and write it in English, or write it in your own language. And your child can type or write by hand on the screen.

## How to do it, step by step:
1. Open ["Spelling"](/spell) from the menu.
2. Tap "Paste your own list" and paste the words, one per line (up to 20).
3. Tap "Create set".
4. Choose a direction, and your child starts writing.
5. When your child finishes, you get a message with the result.

**A tip from other families:** two short practices during the week work better than one long one the night before. Every practice is saved under "Dictations" in the notebook, with a "Practice again" button.`,
      "Open Spelling practice",
      "In the next email we'll look at Say it: hearing a sentence, then saying it yourself.",
    ),
  },

  "fam2-say": {
    he: C(
      "היי {שם}, ככה מתרגלים להגיד משפט בשפה חדשה",
      `היי {שם},

לדעת מילה זה חצי מהדרך. החצי השני הוא להגיד אותה בקול, בביטחון.

## תגיד את זה
כותבים משפט ובוחרים את השפה שלומדים. Gadit מראה איך אומרים אותו בשפה הזאת ומקריא אותו בקול. אחר כך הילד אומר את המשפט בעצמו, ומקבל ציון של 1 עד 5 כוכבים על ההגייה.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["תגיד את זה"](/say) מהתפריט.
2. כותבים משפט ובוחרים את השפה שלומדים.
3. לוחצים על "תגיד את זה" ומקשיבים.
4. לוחצים על "תרגול הגייה", אומרים את המשפט, ומקבלים כוכבים.
5. גם כאן מגיעה אליך הודעה כשהילד מתרגל.

**טיפ מהשטח:** להתחיל ממשפט שהילד צריך באמת, למשל משהו שרוצים להגיד למורה או לחבר. משפט אמיתי נשאר הרבה יותר מהר.`,
      "לתגיד את זה",
      "מחר נדבר על לוח ההורה, שבו רואים את אוצר המילים גדל.",
    ),
    en: C(
      "Hi {name}, here's how to practice saying a sentence in a new language",
      `Hi {name},

Knowing a word is half the way. The other half is saying it out loud, with confidence.

## Say it
Type a sentence and choose the language you're learning. Gadit shows how to say it in that language and reads it out loud. Then your child says the sentence themselves and gets 1 to 5 stars for pronunciation.

## How to do it, step by step:
1. Open ["Say it"](/say) from the menu.
2. Type a sentence and choose the language you're learning.
3. Tap "Say it" and listen.
4. Tap "Practice saying it", say the sentence, and get stars.
5. Here too, you get a message when your child practices.

**A tip from other families:** start with a sentence your child actually needs, like something to say to a teacher or a friend. A real sentence stays much faster.`,
      "Open Say it",
      "Tomorrow we'll look at the parent board, where you watch the vocabulary grow.",
    ),
  },

  "fam2-dashboard": {
    he: C(
      "היי {שם}, ככה רואים את אוצר המילים של הילד גדל",
      `היי {שם},

קשה לדעת מה ילד באמת לומד. בלוח ההורה רואים את זה, מילה אחרי מילה.

## לוח ההורה
בלשונית "דף הבית" ב[אזור המשפחה](/family) יש סיכום של כל המשפחה: כמה מילים יש במחברות, וכמה מילים חדשות נוספו השבוע.

לכל ילד יש כרטיס משלו: כמה מילים במחברת, רצף הימים, הדרגה, כמה מילים נוספו השבוע, והמילים האחרונות שחיפש.

## איך עושים את זה, שלב אחר שלב:
1. פותחים את תפריט החשבון ולוחצים על ["המשפחה שלי"](/family).
2. בלשונית "דף הבית" רואים את הסיכום.
3. עוברים על הכרטיס של כל ילד.
4. ב"חיפושים אחרונים" רואים את המילים האחרונות שחיפשו בבית.

**טיפ מהשטח:** לבחור מילה אחת מהכרטיס של הילד ולשאול אותו עליה בארוחת הערב. ילד שמסביר מילה להורה, זוכר אותה.`,
      "למשפחה שלי",
      "במייל הבא נדבר על התראות: איך יודעים מה מסקרן את הילד.",
    ),
    en: C(
      "Hi {name}, here's how to watch your child's vocabulary grow",
      `Hi {name},

It's hard to know what a child is really learning. On the parent board you see it, word by word.

## The parent board
On the "Home" tab of [your family area](/family) there's a summary for the whole family: how many words are in the notebooks, and how many new words were added this week.

Each child has their own card: words in the notebook, their day streak, their rank, how many words were added this week, and the latest words they looked up.

## How to do it, step by step:
1. Open the account menu and tap ["My family"](/family).
2. On the "Home" tab, see the summary.
3. Go through each child's card.
4. Under "Recent lookups" you see the latest words looked up at home.

**A tip from other families:** pick one word from your child's card and ask them about it at dinner. A child who explains a word to a parent remembers it.`,
      "Open My family",
      "In the next email we'll look at alerts: knowing what sparks your child's curiosity.",
    ),
  },

  "fam2-alerts": {
    he: C(
      "היי {שם}, ככה יודעים מה מסקרן את הילד",
      `היי {שם},

כל מילה שילד מחפש היא שאלה שהייתה לו בראש. התראות על מילים נותנות לך לראות את השאלות האלה.

## התראות על מילים
כשההתראות פועלות, מגיעה אליך הודעה כשהילד מחפש מילה. אפשר לבחור לקבל הודעה על כל מילה, או סיכום אחד ביום. ההודעות מגיעות במייל, ובטלפון גם כהתראה על המסך כשזה אפשרי.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל[לשונית "הגדרות" באזור המשפחה](/family?tab=settings).
2. בחלק "התראות על מילים" מדליקים את "הודיעו לי כשהילד מחפש מילה".
3. בוחרים "כל מילה" או "סיכום יומי".
4. רוצים התראה גם על המסך של הטלפון? פותחים את Gadit בטלפון ולוחצים על "הפעל התראות במכשיר הזה".

**טיפ מהשטח:** "סיכום יומי" מתאים לרוב המשפחות. הודעה אחת בערב, עם כל המילים של היום.`,
      "להגדרות ההתראות",
      "במייל הבא נדבר על מה שמחזיר את הילד ל-Gadit כל יום.",
    ),
    en: C(
      "Hi {name}, here's how to know what sparks your child's curiosity",
      `Hi {name},

Every word a child looks up is a question they had in mind. Word alerts let you see those questions.

## Word alerts
With alerts on, you get a message when your child looks up a word. You can choose a message for every word, or one summary a day. Messages arrive by email, and on your phone as a banner when possible.

## How to do it, step by step:
1. Open the [Settings tab in your family area](/family?tab=settings).
2. Under "Word alerts", turn on "Notify me when my child looks up a word".
3. Choose "Every word" or "Daily summary".
4. Want a banner on your phone too? Open Gadit on your phone and tap "Turn on alerts on this device".

**A tip from other families:** "Daily summary" suits most families. One message in the evening, with all of the day's words.`,
      "Open alert settings",
      "In the next email we'll look at what brings your child back to Gadit every day.",
    ),
  },

  "fam2-ranks": {
    he: C(
      "היי {שם}, מה מחזיר את הילד ל-Gadit כל יום",
      `היי {שם},

הרגל נבנה מהתקדמות שרואים. בשביל זה לכל ילד יש נקודות, דרגות, רצף ימים ויעד שבועי.

## דרגות, רצף וסקינים
הילד רואה את ההתקדמות שלו מתחת לחיפוש ב[דף הבית](/) ובראש [המחברת](/notebook): "רצף ימים", "יעד שבועי" ו"הדרגה שלך".

היעד השבועי מתחיל מ-5 מילים חדשות, ומתאים את עצמו לקצב של הילד. יש 12 דרגות, וחלק מהן פותחות סקינים חדשים, עיצובים שהילד בוחר ל-Gadit שלו.

## איך זה עובד, שלב אחר שלב:
1. כל מילה שנשמרת במחברת שווה נקודה אחת.
2. מילה שהילד מוכיח שהבין, בחידון או במשחק, שווה 10 נקודות.
3. הנקודות מעלות את הילד בדרגות.
4. בדרגות מסוימות נפתח סקין חדש.

אין מה להגדיר. הכול עובד לבד מהיום הראשון.

**טיפ מהשטח:** לשים לב לרצף הימים בכרטיס של הילד ב[לוח ההורה](/family), ולהגיד לו מילה טובה כשהוא שומר עליו.`,
      "",
      "במייל הבא נדבר על השאלות שאפשר לשאול על כל מילה.",
    ),
    en: C(
      "Hi {name}, what brings your child back to Gadit every day",
      `Hi {name},

A habit is built from progress you can see. That's why every child has points, ranks, a day streak and a weekly goal.

## Ranks, streaks and skins
Your child sees their progress under the search on the [home page](/) and at the top of [the notebook](/notebook): their streak, their weekly goal and their rank.

The weekly goal starts at 5 new words and adjusts itself to your child's pace. There are 12 ranks, and some of them unlock new skins, designs your child picks for their own Gadit.

## How it works, step by step:
1. Every word saved to the notebook is worth one point.
2. A word your child proves they understand, in a quiz or a game, is worth 10 points.
3. Points move your child up the ranks.
4. Certain ranks unlock a new skin.

There's nothing to set up. It all works on its own from day one.

**A tip from other families:** keep an eye on the streak on your child's card in the [parent board](/family), and say something kind when they keep it going.`,
      "",
      "In the next email we'll look at the questions you can ask about any word.",
    ),
  },

  "fam2-questions": {
    he: C(
      "היי {שם}, ככה שואלים שאלה על מילה",
      `היי {שם},

לפעמים ההגדרה לא מספיקה, ורוצים לדעת עוד: מה ההפך, איך לא לטעות, ואיך לזכור.

## שאלות על מילה
בדף של כל מילה יש את החלק "יש לך שאלה על המילה הזאת?", עם כפתורים מוכנים:

1. "הפכים"
2. "מילים דומות במשמעות"
3. "מילים מאותו שורש"
4. "טעויות נפוצות"
5. "איך לזכור את המילה"

## איך עושים את זה, שלב אחר שלב:
1. [מחפשים מילה](/).
2. גוללים ל"יש לך שאלה על המילה הזאת?".
3. לוחצים על השאלה שמעניינת, והתשובה מופיעה מיד.

**טיפ מהשטח:** "איך לזכור את המילה" עוזר במיוחד לפני מבחן או הכתבה.`,
      "לחיפוש מילה",
      "במייל הבא נדבר על ביטויים שלא מבינים רק מהמילים.",
    ),
    en: C(
      "Hi {name}, here's how to ask a question about a word",
      `Hi {name},

Sometimes the definition isn't enough, and you want to know more: what the opposite is, how not to get it wrong, and how to remember it.

## Questions about a word
Every word's page has the section "Have a question about this word?", with ready-made buttons:

1. "Opposites"
2. "Similar words"
3. "Word family"
4. "Common mistakes"
5. "How to remember it"

## How to do it, step by step:
1. [Look up a word](/).
2. Scroll to "Have a question about this word?".
3. Tap the question you're curious about, and the answer appears right away.

**A tip from other families:** "How to remember it" helps most before a test or a dictation.`,
      "Look up a word",
      "In the next email we'll look at expressions you can't understand from the words alone.",
    ),
  },

  "fam2-idioms": {
    he: C(
      "היי {שם}, ביטויים שלא מבינים רק מהמילים",
      `היי {שם},

יש ביטויים שכל מילה בהם מוכרת, ובכל זאת המשמעות לא ברורה. "לשבור את הראש" לא קשור לראש שבור.

## ניבים וצירופים
בדף של מילה מופיע החלק "ניבים וצירופים": הביטויים שהמילה מופיעה בהם, ומה כל ביטוי אומר. במצב ילדים ההסבר של כל ביטוי כתוב בשפה של ילדים, וליד כל ביטוי יש כפתור השמעה.

## איך עושים את זה, שלב אחר שלב:
1. [מחפשים מילה](/).
2. גוללים ל"ניבים וצירופים".
3. קוראים את הביטוי ואת ההסבר שלו.
4. לוחצים על כפתור ההשמעה כדי לשמוע איך אומרים אותו.

**טיפ מהשטח:** ביטויים באנגלית הם הדבר הכי קשה לילד שלומד אנגלית. מילים כמו "break", "hand" ו"head" פותחות הרבה ביטויים.`,
      "לחיפוש מילה",
      "במייל הבא נדבר על מילים בכל שפה, עם הסבר בשפה שלך.",
    ),
    en: C(
      "Hi {name}, expressions you can't understand from the words alone",
      `Hi {name},

Some expressions are made of words you know, and still the meaning isn't clear. "Break a leg" has nothing to do with a broken leg.

## Idioms & expressions
A word's page has the section "Idioms & expressions": the expressions the word appears in, and what each one means. In Kids Mode, each explanation is written for kids, and every expression has a listen button.

## How to do it, step by step:
1. [Look up a word](/).
2. Scroll to "Idioms & expressions".
3. Read the expression and its explanation.
4. Tap the listen button to hear how it's said.

**A tip from other families:** words like "break", "hand" and "head" open up many expressions.`,
      "Look up a word",
      "In the next email we'll look at words in any language, explained in yours.",
    ),
  },

  "fam2-languages": {
    he: C(
      "היי {שם}, מילים בכל שפה, הסבר בשפה שלך",
      `היי {שם},

בהרבה בתים מדברים יותר משפה אחת. ילד לומד אנגלית בבית הספר, הורה מדבר בשפה אחרת, והמילה צריכה להיות מובנת לשניהם.

## 33 שפות
ב-Gadit אפשר לחפש מילה בכל שפה. ההסבר תמיד נכתב בשפת הממשק שבחרת, ואם השפות שונות, מופיע גם תרגום של מילה אחת. Gadit עובד ב-33 שפות.

## איך עושים את זה, שלב אחר שלב:
1. בוחרים את שפת הממשק: במחשב, בכפתור השפה בשורה העליונה. בטלפון, בתפריט.
2. [מחפשים מילה](/) בכל שפה, למשל מילה באנגלית משיעורי הבית.
3. ההסבר מגיע בשפה שבחרת.

כל אחד במשפחה יכול לבחור את השפה שלו במכשיר שלו.

**טיפ מהשטח:** הורה שאנגלית היא לא השפה שלו יכול לחפש את המילים משיעורי הבית של הילד ולקבל הסבר בשפה של הבית. ככה אפשר לעזור גם במילים שלא הכרת.`,
      "",
      "במייל הבא נדבר על מורה פרטי או מאמן שעובד עם הילד בתוך Gadit.",
    ),
    en: C(
      "Hi {name}, words in any language, explained in yours",
      `Hi {name},

Many homes speak more than one language. A child learns English at school, a parent speaks another language, and the word needs to make sense to both.

## 33 languages
In Gadit you can look up a word in any language. The explanation is always written in the interface language you chose, and when the languages differ, a one-word translation appears too. Gadit works in 33 languages.

## How to do it, step by step:
1. Choose the interface language: on a computer, with the language button in the top bar. On a phone, in the menu.
2. [Look up a word](/) in any language, for example an English word from homework.
3. The explanation comes in the language you chose.

Everyone in the family can choose their own language on their own device.

**A tip from other families:** a parent whose first language isn't English can look up the words from their child's homework and get an explanation in the language of the home. That way you can help even with words you didn't know.`,
      "",
      "In the next email we'll look at a private teacher or coach working with your child inside Gadit.",
    ),
  },

  "fam2-coach": {
    he: C(
      "היי {שם}, ככה מורה פרטי עובד עם הילד בתוך Gadit",
      `היי {שם},

אם לילד יש מורה פרטי, מאמן או מורה לאנגלית, אפשר לתת לו לעבוד עם המילים של הילד בתוך Gadit.

## מאמן או מורה פרטי
נותנים למורה גישה לפרופיל של ילד אחד בלבד, לפי המייל שלו. המורה רואה את המחברת של הילד ויכול להוסיף לה מילים במהלך השיעור. את שאר המשפחה הוא לא רואה, ואפשר לבטל את הגישה בכל רגע.

המורה צריך חשבון Gadit משלו.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל[לשונית "הגדרות" באזור המשפחה](/family?tab=settings).
2. בחלק "מאמן או מורה פרטי" כותבים את האימייל של המאמן.
3. בוחרים ב"איזה ילד?".
4. לוחצים על "הענקת גישה".
5. רוצים להפסיק? לוחצים על "ביטול", והגישה נסגרת מיד.

אצל המורה, הילד מופיע ב"התלמידים שלך", ולחיצה על "כניסה" פותחת את הפרופיל שלו.`,
      "להגדרות המשפחה",
      "במייל הבא נסכם את כל מה שיש לכם ב-Gadit, ואיך הכול נשאר בטוח.",
    ),
    en: C(
      "Hi {name}, here's how a private teacher works with your child in Gadit",
      `Hi {name},

If your child has a private teacher, a coach or an English tutor, you can let them work with your child's words inside Gadit.

## Coach or private teacher
You give the teacher access to one child's profile only, by their email. The teacher sees the child's notebook and can add words to it during the lesson. They don't see the rest of your family, and you can revoke access at any moment.

The teacher needs their own Gadit account.

## How to do it, step by step:
1. Open the [Settings tab in your family area](/family?tab=settings).
2. Under "Coach or private teacher", type the coach's email.
3. Choose which child.
4. Tap "Grant access".
5. Want to stop? Tap "Revoke", and access closes right away.

On the teacher's side, your child appears under "Your students", and tapping "Enter" opens their profile.`,
      "Open family settings",
      "In the next email we'll sum up everything you have in Gadit, and how it all stays safe.",
    ),
  },

  "fam2-safe": {
    he: C(
      "היי {שם}, מקום סגור ובטוח למילים של הילד",
      `היי {שם},

עבר חודש מאז שהצטרפת. זה הזמן לסכם את כל מה שיש לכם ב-Gadit, ואיך הכול נשאר בטוח.

## מקום סגור לגמרי
ב-Gadit אין צ'אט פתוח, אין פיד, אין פרסומות ואין קישורים החוצה. הילד פוגש רק מילים, הסברים ותרגול. ההורה רואה מה הילד חיפש, ומחליט מי עוד מקבל גישה.

## כל הכלים שלכם, במקום אחד
1. [חיפוש מילה](/) עד הסוף, והסבר בשפה של ילדים.
2. [מחברת אישית](/notebook) לכל ילד.
3. [כל מילה](/read): דף שלם מתוך הספר.
4. [משחקי מילים](/play) מהמילים של הילד.
5. [תרגול הכתבה](/spell) ו[תגיד את זה](/say).
6. [לוח ההורה](/family) ו[התראות על מילים](/family?tab=settings).
7. 33 שפות, ו[גישה למורה פרטי](/family?tab=settings).

אוצר המילים של הילד ממשיך לגדול, מילה אחרי מילה.`,
      "למשפחה שלי",
      "",
    ),
    en: C(
      "Hi {name}, a closed, safe place for your child's words",
      `Hi {name},

It's been a month since you joined. Time to sum up everything you have in Gadit, and how it all stays safe.

## A completely closed place
Gadit has no open chat, no feed, no ads and no links out. Your child meets only words, explanations and practice. You see what your child looked up, and you decide who else gets access.

## All your tools, in one place
1. [Understanding a word](/) all the way through, and explanations for kids.
2. A [personal notebook](/notebook) for every child.
3. [Every Word](/read): a whole page from a book.
4. [Word games](/play) from your child's own words.
5. [Spelling practice](/spell) and [Say it](/say).
6. The [parent board](/family) and [word alerts](/family?tab=settings).
7. 33 languages, and [access for a private teacher](/family?tab=settings).

Your child's vocabulary keeps growing, word by word.`,
      "Open My family",
      "",
    ),
  },
};
