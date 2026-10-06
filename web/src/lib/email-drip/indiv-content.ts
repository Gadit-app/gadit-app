import type { EmailContent } from "./render";
import type { FamilyEmailMeta } from "./family-content";

/**
 * Onboarding series for individual Clear and Deep subscribers (Gadi
 * 2026-10-06), on the same rules as the Family series (family-content.ts):
 * one email = one tool and one small task, the first word on day 0, the
 * daily tools in the first week, the subscriber's own numbers before the
 * 14-day trial ends. Same markdown-lite, same editor, same renderer.
 *
 * Plans: an email lists the plans it goes to (Deep-only tools never reach a
 * Clear subscriber). Inside one email, [[clear]]...[[/clear]] and
 * [[deep]]...[[/deep]] keep a line for that plan only (body and bridge line).
 * {מספרים} / {numbers} = the subscriber's own notebook numbers at send time.
 *
 * Not sent to anyone until Gadi approves (INDIV_SERIES_LIVE).
 */

export const INDIV_SERIES_LIVE = false;

export type IndivPlan = "clear" | "deep";
export type IndivEmailMeta = FamilyEmailMeta & { plans: IndivPlan[] };

const M = (key: string, label: string, dayOffset: number, ctaPath: string, plans: IndivPlan[] = ["clear", "deep"]): IndivEmailMeta => ({
  key,
  label,
  dayOffset,
  ctaPath,
  ctaUrlTab: "",
  v2: true,
  plans,
});

export const INDIV_META: IndivEmailMeta[] = [
  M("ind-start", "Clear/Deep · 1 · Getting started, first word", 0, "/"),
  M("ind-word", "Clear/Deep · 2 · Understand a word all the way", 1, "/"),
  M("ind-notebook", "Clear/Deep · 3 · The notebook", 2, "/notebook"),
  M("ind-context", "Clear/Deep · 4 · The right meaning from the sentence", 3, "/"),
  M("ind-read", "Clear/Deep · 5 · Every Word (a whole page)", 4, "/read"),
  M("ind-compose", "Clear/Deep · 6 · Compose a sentence, get feedback", 5, "/"),
  M("ind-say", "Clear/Deep · 7 · Say it", 6, "/say"),
  M("ind-practice", "Deep · 8 · Smart practice, games, compare words", 7, "/notebook", ["deep"]),
  M("ind-progress", "Clear/Deep · 9 · Your first two weeks in numbers", 10, "/notebook"),
  M("ind-questions", "Clear/Deep · 10 · Questions about a word, idioms", 12, "/"),
  M("ind-languages", "Clear/Deep · 11 · Any word, explained in your language", 15, "/"),
  M("ind-month", "Clear/Deep · 12 · Everything you have, and the next month (last)", 24, "/"),
];

export const INDIV_LABEL_HE: Record<string, string> = {
  "ind-start": "1 · התחלה, מילה ראשונה",
  "ind-word": "2 · להבין מילה עד הסוף",
  "ind-notebook": "3 · המחברת",
  "ind-context": "4 · המשמעות הנכונה לפי המשפט",
  "ind-read": "5 · כל מילה (דף שלם)",
  "ind-compose": "6 · חברו משפט ומשוב",
  "ind-say": "7 · תגיד את זה",
  "ind-practice": "8 · Deep בלבד: תרגול חכם, משחקים, השוואה",
  "ind-progress": "9 · השבועיים הראשונים במספרים",
  "ind-questions": "10 · שאלות על מילה, ניבים וצירופים",
  "ind-languages": "11 · כל מילה, הסבר בשפה שלך",
  "ind-month": "12 · כל מה שיש לך, והחודש הבא (אחרון)",
};

const C = (subject: string, body: string, ctaText: string, next: string): EmailContent => ({
  subject,
  heading: "",
  body,
  ctaText,
  next,
});

const HOME_SCREEN_HE = `## הוספת Gadit למסך הבית בטלפון

**משתמשי אנדרואיד:**

1. נכנסים ל[חנות Google Play](https://play.google.com/store/apps/details?id=com.gadit.app).
2. מורידים את האפליקציה.
3. מתחברים עם חשבון Google או עם המייל והסיסמה שיצרת.

**משתמשי אייפון:**

1. נכנסים דרך Safari לכתובת: https://www.gadit.app/he
2. לוחצים על כפתור השיתוף.
3. לוחצים על "הוסף למסך הבית".`;

const HOME_SCREEN_EN = `## Add Gadit to your phone's home screen

**Android:**

1. Open [Google Play](https://play.google.com/store/apps/details?id=com.gadit.app).
2. Download the app.
3. Sign in with Google, or with the email and password you created.

**iPhone:**

1. Open this address in Safari: https://www.gadit.app
2. Tap the Share button.
3. Tap "Add to Home Screen".`;

export const INDIV_CONTENT: Record<string, { he: EmailContent; en: EmailContent }> = {
  "ind-start": {
    he: C(
      "היי {שם}, ככה מתחילים עם Gadit",
      `היי {שם},

איזה כיף שהצטרפת ל-Gadit 🎉

ל-Gadit מטרה אחת: להבין כל מילה עד הסוף.
מילה שמבינים עד הסוף נשארת, ואוצר המילים גדל מילה אחרי מילה.

בשבועיים הקרובים יגיע מייל קצר כמעט כל יום.
בכל מייל כלי אחד, ומשימה קטנה אחת של כמה דקות.

${HOME_SCREEN_HE}

## המילה הראשונה
1. נכנסים ל[דף הבית של Gadit](/).
2. מקלידים בתיבה "הקלידו מילה" מילה אחת שפגשת היום: בעבודה, בלימודים, בספר או בחדשות. אפשר בכל שפה.
3. קוראים את כל המשמעויות שלה, ולא רק את הראשונה.
4. המילה נשמרת לבד במחברת שלך.

**טיפ מהשטח:**
כדאי להתחיל ממילה שעד היום רק ניחשת את המשמעות שלה.
דווקא שם מגלים הכי הרבה.`,
      "לחיפוש המילה הראשונה",
      "מחר נדבר על הלב של Gadit: איך מבינים מילה עד הסוף.",
    ),
    en: C(
      "Hi {name}, here's how to get started with Gadit",
      `Hi {name},

So glad you joined Gadit 🎉

Gadit has one goal: to understand every word all the way through.
A word understood like this stays, and your vocabulary grows word by word.

Over the next two weeks a short email will arrive almost every day.
Each one has one tool, and one small task that takes a few minutes.

${HOME_SCREEN_EN}

## Your first word
1. Open the [Gadit home page](/).
2. In the "Type a word" box, type one word you came across today: at work, in your studies, in a book or in the news. Any language works.
3. Read all its meanings, not just the first one.
4. The word is saved to your notebook on its own.

**A tip from other users:**
Start with a word whose meaning you have only ever guessed.
That's where you discover the most.`,
      "Look up your first word",
      "Tomorrow we'll look at the heart of Gadit: understanding a word all the way through.",
    ),
  },

  "ind-word": {
    he: C(
      "היי {שם}, ככה מבינים מילה עד הסוף",
      `היי {שם},

להבין את כל המילים בטקסט זה כמו להשיג את כל החלקים בפאזל.
כשחסר חלק אחד, לא רואים את התמונה כולה.

מילה אחת שלא הבנו עד הסוף יכולה לשנות את המשמעות של משפט שלם, של מייל מהעבודה או של שאלה במבחן.

הלב של Gadit הוא להבין כל מילה עד הסוף.

## מה מקבלים בכל מילה
**הגדרות:** כל המשמעויות של המילה, ולא רק הראשונה.

**דוגמאות:** משפטי דוגמה לכל משמעות.

**תמונה:** תמונה שעוזרת לראות את המשמעות.

**מקור המילה:** מאיפה המילה הגיעה ואיך היא השתנתה בדרך.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל[דף הבית של Gadit](/).
2. מקלידים מילה בתיבה "הקלידו מילה".
3. עוברים על "הגדרות", על התמונה ועל "מקור המילה".
4. רוצים תמונה למשמעות מסוימת? לוחצים על "צרו תמונה".

## הסבר פשוט, כשצריך
ב[תיבת החיפוש בדף הבית](/), ליד המיקרופון, יש מתג "ילדים".
כשמדליקים אותו, ההגדרה נכתבת במילים פשוטות ועם דוגמאות מהחיים.
זה עוזר גם למבוגרים, במיוחד במילים מקצועיות ובשפה שעוד לומדים.

**טיפ מהשטח:**
"מקור המילה" הוא הדרך הכי טובה לזכור מילה.
מילה שיודעים מאיפה היא הגיעה, קשה לשכוח.`,
      "לחיפוש מילה",
      "מחר נדבר על המחברת: המקום שבו כל מילה שחיפשת נשמרת.",
    ),
    en: C(
      "Hi {name}, here's how to understand a word all the way through",
      `Hi {name},

Understanding every word in a text is like having every piece of a puzzle.
When one piece is missing, you can't see the whole picture.

One word you didn't fully understand can change the meaning of a whole sentence, a work email or an exam question.

The heart of Gadit is understanding every word all the way through.

## What you get for every word
**Definitions:** every meaning of the word, not just the first one.

**Examples:** example sentences for each meaning.

**Visual:** a picture that helps you see the meaning.

**Word Origin:** where the word came from and how it changed along the way.

## How to do it, step by step:
1. Open the [Gadit home page](/).
2. Type a word in the "Type a word" box.
3. Go through "Definitions", the picture and "Word Origin".
4. Want a picture for a particular meaning? Tap "Generate image".

## A simple explanation, when you need one
In the [search box on the home page](/), next to the microphone, there's a "Kids" switch.
Turn it on and the definition is written in simple words, with examples from everyday life.
It helps adults too, especially with professional terms and a language you're still learning.

**A tip from other users:**
"Word Origin" is the best way to remember a word.
A word whose origin you know is hard to forget.`,
      "Look up a word",
      "Tomorrow we'll look at the notebook: the place where every word you look up is saved.",
    ),
  },

  "ind-notebook": {
    he: C(
      "היי {שם}, כל מילה שחיפשת נשמרת במחברת שלך",
      `היי {שם},

אוצר המילים של אדם יכול לעשות הבדל ענק ביכולת שלו להצליח בחיים.

כל מילה שמחפשים ב-Gadit נכנסת אוטומטית למחברת המילים שלך, עם כל המידע עליה.
ככה אוצר המילים שלך נבנה במקום אחד, ואפשר לחזור לכל מילה מתי שרוצים.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["מחברת"](/notebook) מהתפריט.
2. רואים את כל המילים שחיפשת.
3. לוחצים על מילה כדי לפתוח שוב את ההסבר שלה.
[[deep]]4. לוחצים על "תרגול עכשיו" כדי לתרגל את המילים שלך. על זה נרחיב בעוד כמה ימים.
[[/deep]]

**מומלץ:**
פעם בשבוע לעבור על המחברת ולבחור שלוש מילים.
לנסות להסביר כל אחת במילים שלך, בלי להציץ.
מילה שקשה להסביר, שווה לפתוח שוב.`,
      "למחברת שלי",
      "מחר נדבר על מילה עם כמה משמעויות, ואיך מקבלים את המשמעות הנכונה לפי המשפט.",
    ),
    en: C(
      "Hi {name}, every word you look up is saved to your notebook",
      `Hi {name},

A person's vocabulary can make a huge difference to how well they do in life.

Every word you look up on Gadit goes into your word notebook automatically, with everything about it.
That way your vocabulary is built in one place, and you can go back to any word whenever you like.

## How to do it, step by step:
1. Open ["Notebook"](/notebook) from the menu.
2. You'll see every word you've looked up.
3. Tap a word to open its explanation again.
[[deep]]4. Tap "Practice now" to practice your words. We'll go into this in a few days.
[[/deep]]

**Recommended:**
Once a week, go through the notebook and pick three words.
Try to explain each one in your own words, without peeking.
A word that's hard to explain is worth opening again.`,
      "Open my notebook",
      "Tomorrow we'll look at words with several meanings, and how to get the right one from the sentence.",
    ),
  },

  "ind-context": {
    he: C(
      "היי {שם}, ככה מקבלים את המשמעות הנכונה לפי המשפט",
      `היי {שם},

להרבה מילים יש כמה משמעויות.

המשפט שבו המילה הופיעה הוא מה שקובע איזו מהן נכונה.

## המשמעות לפי המשפט
כותבים את המשפט שבו המילה הופיעה, ו-Gadit בוחר את המשמעות שמתאימה למשפט הזה.

במקום רשימה של משמעויות, מקבלים הגדרה אחת מדויקת.

## איך עושים את זה, שלב אחר שלב:
1. ב[דף הבית](/) מקלידים את המילה בתיבה "הקלידו מילה".
2. בתיבה שמתחת כותבים את המשפט שבו המילה מופיעה.
3. מקבלים את המשמעות שמתאימה בדיוק למשפט.

**בעבודה ובלימודים:**
כשמילה במסמך או בשאלה יכולה להיות כמה דברים, מדביקים את כל המשפט בתיבת המשפט.
ככה מקבלים את המשמעות שהכותב התכוון אליה, ולא משמעות אחרת.

**טיפ מהשטח:**
כדאי לנסות עם מילה שיש לה כמה משמעויות, למשל "קרן".
במשפט "לקרנף יש קרן גדולה על האף" מקבלים את הקרן של בעל החיים.
במשפט "קרן שמש נכנסה דרך החלון" מקבלים קרן של אור.
אותה מילה, שני משפטים, שתי משמעויות.`,
      "לחיפוש עם משפט",
      "מחר נדבר על כל מילה: איך מבינים דף שלם, מילה אחרי מילה.",
    ),
    en: C(
      "Hi {name}, here's how to get the right meaning from the sentence",
      `Hi {name},

Many words have more than one meaning.

The sentence the word appeared in is what decides which one is right.

## The meaning from the sentence
Type the sentence the word appeared in, and Gadit picks the meaning that fits that sentence.

Instead of a list of meanings, you get one precise definition.

## How to do it, step by step:
1. On the [home page](/), type the word in the "Type a word" box.
2. In the box below it, type the sentence where the word appears.
3. You get the meaning that fits the sentence exactly.

**At work and in your studies:**
When a word in a document or a question could mean several things, paste the whole sentence into the sentence box.
That way you get the meaning the writer had in mind, not a different one.

**A tip from other users:**
Try it with a word that has several meanings, for example "bank".
In "We sat on the bank of the river" you get the side of a river.
In "I opened an account at the bank" you get the place that keeps money.
One word, two sentences, two meanings.`,
      "Search with a sentence",
      "Tomorrow we'll look at Every Word: how to understand a whole page, word by word.",
    ),
  },

  "ind-read": {
    he: C(
      "היי {שם}, ככה מבינים בקלות דף שלם",
      `היי {שם},

בספרים, במאמרים ובמסמכים, המילים לא מגיעות אחת אחת. הן מגיעות בדף שלם.

בשביל זה בנינו את **כל מילה**.

מצלמים או מדביקים את הטקסט, ו-Gadit פותח אותו כך שאפשר ללחוץ על כל מילה ולקבל את המשמעות שלה.

המילים הקשות מסומנות בצבע, ומילה שכבר בדקנו את המשמעות שלה הופכת לירוקה.

אפשר גם להבין משפט שלם:
בסוף כל משפט יש סימן קטן, ולחיצה עליו פותחת את "מה המשפט הזה אומר".

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["כל מילה"](/read) מהתפריט.
2. לוחצים על "לצלם עמוד" ומצלמים את הדף, או מדביקים טקסט בתיבה.
3. לוחצים על "לפתוח את הטקסט".
4. לוחצים על כל מילה לא מוכרת. בחלון שנפתח יש גם "פתח הגדרה מלאה".

**בעבודה ובלימודים:**
מאמר מקצועי, חוזה או מייל ארוך בשפה אחרת?
מדביקים את הטקסט, ומבינים כל מילה בו בלי לצאת מהדף.

**טיפ מהשטח:**
לפני שקוראים פרק או מאמר, פותחים את "המילים החשובות בקטע" ועוברים עליהן קודם.
הקריאה אחרי זה הרבה יותר קלה ומהירה.`,
      "לכל מילה",
      "מחר נדבר על הצעד הבא אחרי שמבינים מילה: להשתמש בה במשפט משלך.",
    ),
    en: C(
      "Hi {name}, here's how to understand a whole page with ease",
      `Hi {name},

In books, articles and documents, words don't come one at a time. They come as a whole page.

That's why we built **Every Word**.

Photograph or paste the text, and Gadit opens it so you can tap any word and get its meaning.

Hard words are highlighted, and a word whose meaning you've already checked turns green.

You can also understand a whole sentence:
at the end of every sentence there's a small mark, and tapping it opens "What this sentence means".

## How to do it, step by step:
1. Open ["Every Word"](/read) from the menu.
2. Tap "Photograph with camera" and take a picture, or paste text into the box.
3. Tap "Open text".
4. Tap any unfamiliar word. The window that opens also has "Open full definition".

**At work and in your studies:**
A professional article, a contract or a long email in another language?
Paste the text and understand every word in it without leaving the page.

**A tip from other users:**
Before you read a chapter or an article, open "Key words in this passage" and go over them first.
The reading afterwards is much easier and faster.`,
      "Open Every Word",
      "Tomorrow we'll look at the next step after understanding a word: using it in a sentence of your own.",
    ),
  },

  "ind-compose": {
    he: C(
      "היי {שם}, מילה שמבינים, משתמשים בה במשפט משלך",
      `היי {שם},

להבין מילה זה הצעד הראשון.
מילה באמת נשארת כשמשתמשים בה בעצמך.

## חברו משפט
מתחת לכל משמעות יש כפתור "חברו משפט".
כותבים משפט משלך עם המילה, ו-Gadit בודק אותו ונותן משוב מיד: על הדקדוק, על הטון, ועל ההתאמה של המילה למשפט.

## איך עושים את זה, שלב אחר שלב:
1. [מחפשים מילה](/).
2. מתחת למשמעות שרוצים לתרגל, לוחצים על "חברו משפט".
3. כותבים משפט משלך, ולוחצים על "בדיקת המשפט".
4. מקבלים "מצוין", "כמעט שם" או "לא מדויק", ולפעמים גם "ניסוח מומלץ".
5. כדי לנסות שוב, לוחצים על "ננסה משפט נוסף".

**טיפ מהשטח:**
לכתוב משפט על משהו שקרה לך באמת היום.
משפט אישי נזכר הרבה יותר מהר ממשפט כללי.`,
      "לחיפוש מילה",
      "מחר נדבר על תגיד את זה: איך לומדים להגיד משפט בשפה חדשה, בקול.",
    ),
    en: C(
      "Hi {name}, a word you understand, used in a sentence of your own",
      `Hi {name},

Understanding a word is the first step.
A word really stays when you use it yourself.

## Compose a sentence
Under every meaning there's a "Compose a sentence" button.
Write a sentence of your own with the word, and Gadit checks it and gives feedback right away: on the grammar, the tone, and how well the word fits the sentence.

## How to do it, step by step:
1. [Look up a word](/).
2. Under the meaning you want to practice, tap "Compose a sentence".
3. Write a sentence of your own and tap "Check sentence".
4. You get "Perfect", "Almost there" or "Not quite", and sometimes a "Suggested rewrite" too.
5. To try again, tap "Try another sentence".

**A tip from other users:**
Write a sentence about something that really happened to you today.
A personal sentence is remembered much faster than a general one.`,
      "Look up a word",
      "Tomorrow we'll look at Say it: how to learn to say a sentence in a new language, out loud.",
    ),
  },

  "ind-say": {
    he: C(
      "היי {שם}, ככה לומדים לדבר בשפה חדשה, משפט אחרי משפט",
      `היי {שם},

לדעת מילה זה חצי מהדרך. החצי השני הוא להגיד אותה בקול, בביטחון.

הרבה אנשים מבינים שפה, אבל נתקעים כשצריך לדבר.
כדי לדבר בשפה חדשה, צריך לשמוע אותה, להגיד אותה בקול, ולדעת מה כבר נשמע טוב ומה עוד לא.
זה בדיוק מה ש"תגיד את זה" עושה, בכל שפה שלומדים.

## תגיד את זה
כותבים משפט ובוחרים את השפה שלומדים. Gadit מראה איך אומרים אותו בשפה הזאת ומקריא אותו בקול. אחר כך אומרים את המשפט בעצמך, ומקבלים ציון של 1 עד 5 כוכבים על ההגייה.

## למה זה עובד
שומעים איך המשפט נשמע באמת, ולא רק איך הוא כתוב.
אומרים אותו בקול ומקבלים משוב מיד, בלי לחץ ובלי קהל.
כל ניסיון נוסף מעלה את הכוכבים, וככה נבנה הביטחון לדבר.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["תגיד את זה"](/say) מהתפריט.
2. כותבים משפט ובוחרים את השפה שלומדים.
3. לוחצים על "תגיד את זה" ומקשיבים.
4. לוחצים על "תרגול הגייה", אומרים את המשפט, ומקבלים כוכבים.

**טיפ מהשטח:**
להתחיל ממשפט שבאמת צריך: משהו לפגישה, לשיחת טלפון או לטיול הבא.
משפט אמיתי נשאר הרבה יותר מהר.`,
      "לתגיד את זה",
      "[[deep]]מחר נדבר על התרגול: איך המילים שלך נשארות לאורך זמן.[[/deep]][[clear]]במייל הבא נראה מה כבר בנית בשבועיים הראשונים.[[/clear]]",
    ),
    en: C(
      "Hi {name}, here's how to learn to speak a new language, sentence by sentence",
      `Hi {name},

Knowing a word is half the way. The other half is saying it out loud, with confidence.

Many people understand a language but get stuck when they need to speak.
To speak a new language you need to hear it, say it out loud, and know what already sounds right and what doesn't yet.
That's exactly what "Say it" does, in any language you're learning.

## Say it
Type a sentence and choose the language you're learning. Gadit shows how to say it in that language and reads it out loud. Then you say the sentence yourself and get a score of 1 to 5 stars for pronunciation.

## Why it works
You hear how the sentence really sounds, not just how it's written.
You say it out loud and get feedback right away, with no pressure and no audience.
Every new try raises the stars, and that's how the confidence to speak is built.

## How to do it, step by step:
1. Open ["Say it"](/say) from the menu.
2. Type a sentence and choose the language you're learning.
3. Tap "Say it" and listen.
4. Tap "Practice saying it", say the sentence, and get your stars.

**A tip from other users:**
Start with a sentence you actually need: something for a meeting, a phone call or your next trip.
A real sentence stays much faster.`,
      "Open Say it",
      "[[deep]]Tomorrow we'll look at practice: how your words stay with you over time.[[/deep]][[clear]]In the next email we'll see what you've already built in your first two weeks.[[/clear]]",
    ),
  },

  "ind-practice": {
    he: C(
      "היי {שם}, ככה המילים שלך נשארות לאורך זמן",
      `היי {שם},

מילה שחיפשנו פעם אחת נשכחת מהר.
מילה שחוזרים אליה בזמן הנכון נשארת.

ב-Deep יש שלושה כלים בשביל זה.

## תרגול חכם
במחברת יש כפתור "תרגול עכשיו".
Gadit מציג מילה מהמחברת שלך, ונזכרים מה היא אומרת לפני שפותחים את ההסבר.
לוחצים על "ידעתי" או על "שכחתי", ו-Gadit קובע מתי להחזיר אותה: מילה ששכחת תחזור מהר, ומילה שידעת תחזור בעוד כמה ימים.

## משחקים וחידונים
ב["משחקים"](/play) יש משחקים שנבנים מהמילים שבמחברת שלך: חידונים, משחק זיכרון, ערבול אותיות, השלמת משפט ועוד.
כדי להתחיל, צריך לפחות 4 מילים במחברת.
ובכל מילה, מתחת להגדרה, יש גם כפתור "חידון" לתרגול מהיר של אותה מילה.

## השוואת מילים
מילים דומות מבלבלות גם דוברים שוטפים, למשל affect ו-effect באנגלית.
ב["השוואה"](/compare) כותבים שתי מילים, ומקבלים את ההבדל ביניהן, דוגמאות וטעות נפוצה.

## איך עושים את זה, שלב אחר שלב:
1. נכנסים ל["מחברת"](/notebook) ולוחצים על "תרגול עכשיו".
2. עוברים על המילים, ולוחצים "ידעתי" או "שכחתי".
3. בסוף לוחצים על "סיימתי להיום", או נכנסים ל["משחקים"](/play) למשחק אחד.

**טיפ מהשטח:**
חמש דקות ביום, באותה שעה, עדיפות על שעה פעם בשבוע.`,
      "לתרגול עכשיו",
      "במייל הבא נראה מה כבר בנית בשבועיים הראשונים.",
    ),
    en: C(
      "Hi {name}, here's how your words stay with you over time",
      `Hi {name},

A word you looked up once is soon forgotten.
A word you come back to at the right time stays.

Deep has three tools for this.

## Smart practice
The notebook has a "Practice now" button.
Gadit shows a word from your notebook, and you recall what it means before opening the explanation.
Tap "I knew it" or "I forgot", and Gadit decides when to bring it back: a word you forgot returns soon, and a word you knew returns in a few days.

## Games and quizzes
In ["Games"](/play) there are games built from the words in your notebook: quizzes, a memory game, letter scramble, fill in the sentence and more.
You need at least 4 words in your notebook to start.
And for every word, under the definition, there's also a "Quiz" button for a quick practice of that word.

## Compare words
Similar words confuse even fluent speakers, for example affect and effect.
In ["Compare"](/compare) type two words, and get the difference between them, examples and a common mistake.

## How to do it, step by step:
1. Open ["Notebook"](/notebook) and tap "Practice now".
2. Go through the words and tap "I knew it" or "I forgot".
3. At the end tap "Done for today", or open ["Games"](/play) for one game.

**A tip from other users:**
Five minutes a day, at the same time, beats an hour once a week.`,
      "Practice now",
      "In the next email we'll see what you've already built in your first two weeks.",
    ),
  },

  "ind-progress": {
    he: C(
      "היי {שם}, כמעט שבועיים עם Gadit, הנה מה שכבר בנית",
      `היי {שם},

עברו כמעט שבועיים מאז שהצטרפת ל-Gadit.
זה הזמן לראות מה כבר בנית.

## מה קרה בשבועיים האלה
{מספרים}

## איך ממשיכים מכאן
1. פותחים את ה["מחברת"](/notebook) ובוחרים מילה אחת שכבר חיפשת.
2. מנסים להסביר אותה במילים שלך, בלי להציץ.
3. מחפשים מילה חדשה אחת מהיום.

**טיפ מהשטח:** מילה אחת ביום מספיקה. ככה אוצר המילים גדל, מילה אחרי מילה.`,
      "למחברת שלי",
      "במייל הבא נדבר על השאלות שאפשר לשאול על כל מילה, ועל ביטויים שלא מבינים רק מהמילים.",
    ),
    en: C(
      "Hi {name}, almost two weeks on Gadit, here's what you've built",
      `Hi {name},

Almost two weeks have passed since you joined Gadit.
It's a good moment to see what you've already built.

## What happened in these two weeks
{numbers}

## How to keep going
1. Open your ["Notebook"](/notebook) and pick one word you've already looked up.
2. Try to explain it in your own words, without peeking.
3. Look up one new word from today.

**A tip from other users:** one word a day is enough. That's how a vocabulary grows, word by word.`,
      "Open my notebook",
      "In the next email we'll look at the questions you can ask about any word, and at expressions you can't understand from the words alone.",
    ),
  },

  "ind-questions": {
    he: C(
      "היי {שם}, שאלות על כל מילה, וביטויים שלא מבינים רק מהמילים",
      `היי {שם},

לפעמים ההגדרה לא מספיקה, ורוצים לדעת עוד: מה ההפך, איך לא לטעות, ואיך לזכור.

ויש ביטויים שכל מילה בהם מוכרת, ובכל זאת המשמעות לא ברורה.

לדוגמה: "לשבור את הראש" לא קשור לראש שבור.

## שאלות על מילה
בעמוד של כל מילה יש שאלה בחלק התחתון: "יש לך שאלה על המילה הזאת?", עם כפתורים מוכנים:

1. "הפכים"
2. "מילים דומות במשמעות"
3. "מילים מאותו שורש"
4. "טעויות נפוצות"
5. "איך לזכור את המילה"

## ניבים וצירופים
בדף של מילה מופיע החלק "ניבים וצירופים": הביטויים שהמילה מופיעה בהם, ומה כל ביטוי אומר. ליד כל ביטוי יש כפתור השמעה.

## איך עושים את זה, שלב אחר שלב:
1. [מחפשים מילה](/).
2. גוללים ל"יש לך שאלה על המילה הזאת?".
3. לוחצים על השאלה שמעניינת, והתשובה מופיעה מיד.
4. גוללים ל"ניבים וצירופים", וקוראים את הביטוי ואת ההסבר שלו.
5. לוחצים על כפתור ההשמעה כדי לשמוע איך אומרים אותו.

**טיפ מהשטח:**
"איך לזכור את המילה" עוזר במיוחד לפני מבחן, ראיון עבודה או מצגת.

**טיפ מהשטח:**
ביטויים הם החלק הכי קשה בשפה חדשה.
מילים פשוטות כמו "break", "hand" ו-"head" באנגלית פותחות הרבה ביטויים.`,
      "לחיפוש מילה",
      "במייל הבא נדבר על מילים בכל שפה, עם הסבר בשפה שלך.",
    ),
    en: C(
      "Hi {name}, questions about any word, and expressions you can't get from the words alone",
      `Hi {name},

Sometimes the definition isn't enough, and you want to know more: what's the opposite, how not to get it wrong, and how to remember it.

And there are expressions where you know every word, and the meaning still isn't clear.

For example: "break the ice" has nothing to do with ice.

## Questions about a word
On every word's page there's a question near the bottom: "Have a question about this word?", with ready-made buttons:

1. "Opposites"
2. "Similar words"
3. "Word family"
4. "Common mistakes"
5. "How to remember it"

## Idioms and phrases
A word's page has an "Idioms & expressions" section: the expressions the word appears in, and what each one means. Each expression has a play button.

## How to do it, step by step:
1. [Look up a word](/).
2. Scroll to "Have a question about this word?".
3. Tap the question you're curious about, and the answer appears right away.
4. Scroll to "Idioms & expressions", and read the expression and its explanation.
5. Tap the play button to hear how it's said.

**A tip from other users:**
"How to remember it" helps most before an exam, a job interview or a presentation.

**A tip from other users:**
Expressions are the hardest part of a new language.
Simple words like "break", "hand" and "head" open up a lot of them.`,
      "Look up a word",
      "In the next email we'll look at words in any language, explained in your language.",
    ),
  },

  "ind-languages": {
    he: C(
      "היי {שם}, מילים בכל שפה, הסבר בשפה שלך",
      `היי {שם},

הרבה פעמים המילה שצריך להבין היא בשפה אחרת: במייל מהעבודה, במאמר, בסדרה או בשפה שלומדים.

## 33 שפות
ב-Gadit אפשר לחפש מילה בכל שפה. ההסבר תמיד נכתב בשפת הממשק שבחרת, ואם השפות שונות, מופיע גם תרגום של מילה אחת. Gadit עובד ב-33 שפות.

## איך עושים את זה, שלב אחר שלב:
1. בוחרים את שפת הממשק: במחשב, בכפתור השפה בשורה העליונה. בטלפון, בתפריט.
2. [מחפשים מילה](/) בכל שפה, למשל מילה באנגלית ממייל של העבודה.
3. ההסבר מגיע בשפה שבחרת.

**טיפ מהשטח:**
מי שלומד שפה חדשה יכול לחפש בה מילים ולקבל את ההסבר בשפה שלו.
ככה מבינים את המילה עד הסוף, עם כל המשמעויות והדוגמאות, ולא רק מילה אחת מקבילה.`,
      "לחיפוש מילה בכל שפה",
      "במייל הבא נסכם את כל מה שיש לך ב-Gadit, ואיך ממשיכים מכאן.",
    ),
    en: C(
      "Hi {name}, words in any language, explained in yours",
      `Hi {name},

Often the word you need to understand is in another language: in a work email, an article, a series, or a language you're learning.

## 33 languages
On Gadit you can look up a word in any language. The explanation is always written in the interface language you chose, and when the languages differ, a one-word translation appears too. Gadit works in 33 languages.

## How to do it, step by step:
1. Choose the interface language: on a computer, with the language button in the top bar. On a phone, in the menu.
2. [Look up a word](/) in any language, for example a word from a work email.
3. The explanation arrives in the language you chose.

**A tip from other users:**
If you're learning a new language, look up words in it and get the explanation in your own.
That way you understand the word all the way through, with every meaning and example, not just one matching word.`,
      "Look up a word in any language",
      "In the next email we'll sum up everything you have on Gadit, and how to keep going from here.",
    ),
  },

  "ind-month": {
    he: C(
      "היי {שם}, כל מה שיש לך ב-Gadit, ואיך ממשיכים",
      `היי {שם},

עבר כמעט חודש מאז שהצטרפת.
זה הזמן לסכם את כל מה שיש לך ב-Gadit.

## כל הכלים, במקום אחד
1. [חיפוש מילה](/) עד הסוף: כל המשמעויות, תמונה ומקור המילה.
2. המשמעות הנכונה לפי המשפט.
3. [מחברת](/notebook) עם כל המילים שחיפשת.
4. [כל מילה](/read): דף שלם, מילה אחרי מילה.
5. "חברו משפט", עם משוב על המשפט שלך.
6. [תגיד את זה](/say): משפט בשפה חדשה, בקול.
7. 33 שפות, והסבר בשפה שלך.
[[deep]]8. [תרגול חכם](/notebook), [משחקים](/play) ו[השוואת מילים](/compare).
[[/deep]]

## החודש הבא
לא צריך להשתמש בכל הכלים.
מספיק שניים או שלושה שעובדים טוב בשבילך, והופכים להרגל.
השבוע אפשר לבחור יעד קטן אחד, למשל חמש מילים חדשות.

[[clear]]**לתרגול המילים לאורך זמן:**
ב-Deep יש גם תרגול חכם מהמחברת, משחקים וחידונים מהמילים שלך, והשוואת מילים דומות.

[[/clear]]אוצר המילים שלך ממשיך לגדול, מילה אחרי מילה.`,
      "לחיפוש מילה",
      "",
    ),
    en: C(
      "Hi {name}, everything you have on Gadit, and how to keep going",
      `Hi {name},

It's been almost a month since you joined.
A good moment to sum up everything you have on Gadit.

## All the tools, in one place
1. [Look up a word](/) all the way through: every meaning, a picture and the word's origin.
2. The right meaning from the sentence.
3. A [notebook](/notebook) with every word you've looked up.
4. [Every Word](/read): a whole page, word by word.
5. "Compose a sentence", with feedback on your sentence.
6. [Say it](/say): a sentence in a new language, out loud.
7. 33 languages, and explanations in your language.
[[deep]]8. [Smart practice](/notebook), [games](/play) and [comparing words](/compare).
[[/deep]]

## The next month
You don't need to use every tool.
Two or three that work well for you, and become a habit, are enough.
This week you can pick one small goal, for example five new words.

[[clear]]**To practice your words over time:**
Deep also has smart practice from your notebook, games and quizzes from your words, and a comparison of similar words.

[[/clear]]Your vocabulary keeps growing, word by word.`,
      "Look up a word",
      "",
    ),
  },
};

/** Keep the [[clear]]/[[deep]] parts for this plan, drop the other. Without
 *  a plan (the editor preview of "both"), the markers are removed and both
 *  parts stay so the whole text can be reviewed. */
export function forPlan(text: string, plan?: IndivPlan): string {
  return text.replace(/\[\[(clear|deep)\]\]([\s\S]*?)\[\[\/\1\]\]\n?/g, (_m, p: string, inner: string) =>
    !plan || p === plan ? inner : "",
  );
}
