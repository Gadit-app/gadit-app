import type { EmailContent } from "./render";

/**
 * Single source of truth for the editable Family onboarding emails.
 * Content is markdown-lite (see render.ts) so the admin editor and the
 * code defaults share one format. A saved override in Firestore
 * (emailTemplates/{key}) replaces the default here per language.
 *
 * Rebuilt 2026-08-27 (Gadi) into a full 15-email, feature-by-feature series
 * (Yooniz-style): one feature per email, ordered most-important-first, so a
 * new Family parent meets everything we've built one tool at a time:
 *   setup -> word depth -> Kids Mode -> Every Word -> tap-any-word -> Say-it
 *   -> voice assistant -> context mode -> notebook -> games -> parent board
 *   -> alerts -> ranks/skins -> coach/teacher -> safety & wrap-up.
 * he + en; the 33-language expansion of this series is a follow-up.
 *
 * NOTE: the old "rewards" email (parent gift points / skin store) was removed
 * with the gift economy (2026-08-27). Skins now unlock purely by words/rank.
 */

export const EMAIL_BASE = "https://www.gadit.app";

export type FamilyEmailMeta = {
  key: string;
  label: string; // admin list label
  dayOffset: number;
  ctaUrlTab: string; // appended to the CTA path
  ctaPath?: string; // feature page for the CTA (default "/family"), e.g. "/read"
  eyebrow: { he: string; en: string };
  foot: { he: string; en: string };
};

export const FAMILY_META: FamilyEmailMeta[] = [
  {
    key: "fam-setup",
    label: "Family · 1 · Add & connect kids",
    dayOffset: 0,
    ctaUrlTab: "?tab=members",
    eyebrow: { he: "השלב הראשון", en: "First step" },
    foot: { he: "יש שאלה? אפשר פשוט להשיב למייל הזה, אני קורא הכול.", en: "Have a question? Just reply to this email, I read everything." },
  },
  {
    key: "fam-meanings",
    label: "Family · 2 · All meanings & origin",
    dayOffset: 2,
    ctaUrlTab: "",
    ctaPath: "/",
    eyebrow: { he: "הלב של גדית", en: "The heart of Gadit" },
    foot: { he: "מילה שלמה נשארת הרבה יותר טוב מחצי מילה.", en: "A whole word stays with you far better than half a word." },
  },
  {
    key: "fam-kids-mode",
    label: "Family · 3 · Kids Mode",
    dayOffset: 4,
    ctaUrlTab: "",
    eyebrow: { he: "החוויה של הילד", en: "The child's experience" },
    foot: { he: "והמילון המלא פתוח גם לך, בכל רגע.", en: "And the full dictionary is open to you too, any time." },
  },
  {
    key: "fam-every-word",
    label: "Family · 4 · Every Word (reader)",
    dayOffset: 6,
    ctaUrlTab: "",
    ctaPath: "/read",
    eyebrow: { he: "טקסט שלם, מילה מילה", en: "A whole text, word by word" },
    foot: { he: "עמוד שלם מפסיק להיות מפחיד כשאפשר לפתוח כל מילה בו.", en: "A whole page stops being scary when every word in it opens." },
  },
  {
    key: "fam-tap-word",
    label: "Family · 5 · Tap any word",
    dayOffset: 8,
    ctaUrlTab: "",
    ctaPath: "/",
    eyebrow: { he: "בלי מבוי סתום", en: "No dead ends" },
    foot: { he: "אף מילה לא מובילה למבוי סתום.", en: "No word ever leads to a dead end." },
  },
  {
    key: "fam-say",
    label: "Family · 6 · Say-it (pronunciation)",
    dayOffset: 10,
    ctaUrlTab: "",
    ctaPath: "/say",
    eyebrow: { he: "לשמוע, ואז לומר", en: "Hear it, then say it" },
    foot: { he: "לדעת להגיד מילה נכון זה מה שנותן את הביטחון לדבר.", en: "Saying a word right is what gives the confidence to speak." },
  },
  {
    key: "fam-voice",
    label: "Family · 7 · Voice assistant",
    dayOffset: 12,
    ctaUrlTab: "",
    ctaPath: "/",
    eyebrow: { he: "בלי ידיים, בקול", en: "Hands-free, just ask" },
    foot: { he: "לפעמים פשוט יותר קל לשאול בקול.", en: "Sometimes it's just easier to ask out loud." },
  },
  {
    key: "fam-context",
    label: "Family · 8 · Context mode",
    dayOffset: 14,
    ctaUrlTab: "",
    ctaPath: "/",
    eyebrow: { he: "המשמעות הנכונה, לפי המשפט", en: "The right meaning, from the sentence" },
    foot: { he: "התשובה הנכונה כמעט תמיד נמצאת במשפט שסביב המילה.", en: "The right answer almost always lives in the sentence around the word." },
  },
  {
    key: "fam-notebook",
    label: "Family · 9 · The notebook",
    dayOffset: 16,
    ctaUrlTab: "",
    ctaPath: "/notebook",
    eyebrow: { he: "הבית של כל המילים", en: "A home for every word" },
    foot: { he: "מילה שיש לה מקום היא מילה שחוזרים אליה.", en: "A word with a home is a word you come back to." },
  },
  {
    key: "fam-games",
    label: "Family · 10 · Quizzes & games",
    dayOffset: 18,
    ctaUrlTab: "",
    ctaPath: "/play",
    eyebrow: { he: "מה שגורם למילה להישאר", en: "What makes a word stick" },
    foot: { he: "מילה שמתרגלים היא מילה שנשארת.", en: "A word you practice is a word that stays." },
  },
  {
    key: "fam-dashboard",
    label: "Family · 11 · Parent board",
    dayOffset: 20,
    ctaUrlTab: "",
    eyebrow: { he: "מה שאין לאף אחד אחר", en: "What no one else has" },
    foot: { he: "כיף לראות את אוצר המילים גדל שבוע אחרי שבוע.", en: "Enjoy watching the vocabulary grow, week after week." },
  },
  {
    key: "fam-alerts",
    label: "Family · 12 · Word alerts",
    dayOffset: 22,
    ctaUrlTab: "?tab=settings",
    eyebrow: { he: "חלון לסקרנות של הילד", en: "A window into your child's curiosity" },
    foot: { he: "אפשר לכבות בכל רגע, ולבחור בין מיידי לסיכום יומי.", en: "You can turn it off any time, and switch between instant and a daily summary." },
  },
  {
    key: "fam-gamification",
    label: "Family · 13 · Ranks, streaks, skins",
    dayOffset: 24,
    ctaUrlTab: "",
    eyebrow: { he: "מה שמחזיר את הילד", en: "What brings your child back" },
    foot: { he: "כל מילה שמבינים היא נקודה קדימה.", en: "Every word understood is a point forward." },
  },
  {
    key: "fam-coach",
    label: "Family · 14 · Coach or private teacher",
    dayOffset: 26,
    ctaUrlTab: "?tab=settings",
    eyebrow: { he: "מורה פרטי או מאמן", en: "A private teacher or coach" },
    foot: { he: "הגישה שלך לתת, ושלך לבטל, בכל רגע.", en: "The access is yours to grant, and yours to revoke, at any time." },
  },
  {
    key: "fam-more",
    label: "Family · 15 · Safety & you're all set",
    dayOffset: 28,
    ctaUrlTab: "",
    eyebrow: { he: "והכול בטוח", en: "And it's all safe" },
    foot: { he: "תודה שהצטרפת. אנחנו כאן לכל שאלה.", en: "Thank you for joining. We're here for any question." },
  },
];

export const FAMILY_CONTENT: Record<string, { he: EmailContent; en: EmailContent }> = {
  "fam-setup": {
    he: {
      subject: "השלב הראשון: להוסיף את הילדים ולחבר את המכשירים",
      heading: "נקים את המשפחה יחד",
      ctaText: "להוסיף בני משפחה",
      body: `מברך אותך על ההצטרפות ל-Gadit Family. אני שמח שהצטרפת אלינו.

לפני הכול, כדאי להקים את המשפחה, ואחרי זה כל השאר פשוט עובד. זה לוקח שתי דקות.

## איך מוסיפים ומחברים ילד
1. בלוח הבקרה של המשפחה נכנסים ל**בני המשפחה** ומוסיפים כל ילד עם שם, אווטאר וצבע משלו.
2. לוחצים **חיבור מכשיר** ומקבלים קוד קצר.
3. במכשיר של הילד, בטלפון, בטאבלט או במחשב, פותחים את Gadit ומזינים את הקוד. בלי סיסמה ובלי אימייל לילד.

זהו. המכשיר מחובר, ולכל ילד יש פרופיל משלו עם המחברת, הדרגות והעיצובים שלו.

## מכשיר משותף
אם שני ילדים חולקים טאבלט אחד, אפשר להחליף פרופיל בקלות, וכל אחד רואה רק את שלו. אפשר גם לשים קוד קצר לכל ילד כדי שלא ייכנסו בטעות אחד לשני.

בימים הקרובים אעבור איתך על כל חלק במנוי, פונקציה אחת בכל פעם. נתחיל.`,
    },
    en: {
      subject: "First step: add your kids and connect their devices",
      heading: "Let's set up your family",
      ctaText: "Add family members",
      body: `Welcome to Gadit Family. I'm glad you're here.

Before anything else, it's worth setting up your family, and then everything else just works. It takes two minutes.

## How to add and connect a child
1. In the family dashboard, open **Members** and add each child with their own name, avatar and color.
2. Tap **Connect device** to get a short code.
3. On the child's device, phone, tablet or computer, open Gadit and enter the code. No password, no email for the child.

That's it. The device is connected, and each child has their own profile with their own notebook, ranks and skins.

## A shared device
If two kids share one tablet, they can switch profiles easily, and each sees only their own. You can also set a short code for each child so they don't tap into each other's profile by mistake.

Over the next few days I'll walk you through each part of your subscription, one feature at a time. Let's begin.`,
    },
  },

  "fam-meanings": {
    he: {
      subject: "כל המשמעויות, שלוש דוגמאות, והמקור של כל מילה",
      heading: "מילה שלמה, לא חצי",
      ctaText: "לחפש מילה",
      body: `רוב המילונים נותנים לילד את המשמעות הראשונה ועוצרים. אבל הרבה מילים נושאות כמה משמעויות, וזה בדיוק מה שמבלבל.

## מה מחזירה כל מילה ב-Gadit
- **כל המשמעויות**, לא רק השכיחה. ככה מילה כמו "ערך" לא נתקעת על פירוש אחד.
- **שלוש דוגמאות** לכל משמעות, משפט שמראה איך המילה חיה בפועל.
- **המקור** של המילה, מאיפה היא הגיעה לאורך ההיסטוריה. לא פירוק שורש, אלא הסיפור של המילה.

## למה זה משנה
ילד שרואה את כל המשמעויות ואת המקור לא רק יודע מה המילה אומרת, הוא מבין למה. וזה בדיוק מה שגורם למילה להישאר.

שווה לחפש עכשיו מילה שהילד שאל עליה השבוע, ולראות כמה עומק מסתתר מאחוריה.`,
    },
    en: {
      subject: "Every meaning, three examples, and where each word comes from",
      heading: "A whole word, not half of one",
      ctaText: "Look up a word",
      body: `Most dictionaries give a child the first meaning and stop. But many words carry several meanings, and that's exactly what confuses.

## What every word returns in Gadit
- **Every meaning**, not just the common one. So a word like "run" doesn't get stuck on a single sense.
- **Three examples** per meaning, a sentence that shows how the word actually lives.
- **The origin** of the word, where it came from through history. Not a root breakdown, the story of the word.

## Why it matters
A child who sees every meaning and the origin doesn't only know what a word means, they understand why. And that's exactly what makes a word stick.

It's worth looking up a word your child asked about this week, and seeing how much depth sits behind it.`,
    },
  },

  "fam-kids-mode": {
    he: {
      subject: "מצב ילדים: הסבר לכל מילה, בגובה העיניים",
      heading: "מצב ילדים",
      ctaText: "לפתוח את גדית",
      body: `כשילד שואל מה פירוש מילה, ההגדרה הרשמית בדרך כלל מסובכת לו מדי. בשביל זה יש **מצב ילדים**.

מפעילים אותו, וכל מילה מוסברת בשפה של ילד בן חמש עד עשר. אותו עומק, בלי המילים הגדולות.

## מה יש שם
- **לחיצה על כל מילה** בהסבר פותחת גם אותה, עד הסוף, בלי מבוי סתום.
- **הקראה** של כל מילה בקול, כדי לשמוע איך אומרים אותה.
- **ניקוד** לקוראים המתחילים, כדי שגם ילד קטן יצליח לקרוא לבד.
- **33 שפות ממשק**. עולה חדש מבין את המילה בשפה שבה הוא חושב, ובונה עברית תוך כדי.

## וגם בשבילך
המילון המלא של Gadit פתוח גם לך, לא רק לילדים. כל המשמעויות, הדוגמאות והמקור של כל מילה, ברמת מבוגר. אותו כלי, לכל המשפחה.

שווה לשבת עם הילד דקה, להפעיל מצב ילדים, ולחפש יחד מילה שהוא לא מבין.`,
    },
    en: {
      subject: "Kids Mode: every word explained at eye level",
      heading: "Kids Mode",
      ctaText: "Open Gadit",
      body: `When a child asks what a word means, the official definition is usually too complicated for them. That's what **Kids Mode** is for.

Turn it on, and every word is explained in the language of a five to ten year old. The same depth, without the big words.

## What's in it
- **Tap any word** in the explanation to open that one too, all the way through, with no dead ends.
- **Read aloud** for any word, to hear how it's said.
- **Vowel points** for early readers, so even a young child can read on their own.
- **33 interface languages**. A newcomer understands the word in the language they think in, and builds the new language along the way.

## And for you too
The full Gadit dictionary is open to you, not only to the kids. Every meaning, example and origin of any word, at an adult level. The same tool, for the whole family.

It's worth sitting with your child for a minute, turning on Kids Mode, and looking up a word together that they don't understand.`,
    },
  },

  "fam-every-word": {
    he: {
      subject: "כל מילה: להדביק טקסט או לצלם עמוד, ולהבין אותו מילה מילה",
      heading: "כל מילה",
      ctaText: "לפתוח את כל מילה",
      body: `לפעמים הילד לא תקוע על מילה אחת, אלא על עמוד שלם. כתבה, שיעורי בית, דף מספר בשפה זרה. בשביל זה יש **כל מילה**.

## איך זה עובד
1. מזינים טקסט: להדביק אותו, לצלם עמוד, להעלות PDF, או לצלם את מה שמופיע על המסך.
2. הטקסט הופך לעמוד שכל מילה בו ניתנת ללחיצה.
3. לוחצים על כל מילה שלא מובנת, ומקבלים את הפירוש שלה בדיוק בהקשר של המשפט.

## מה שיפה בזה
כל מילה שהבינו מסומנת ב-✓ ירוק, והעמוד מתמלא מולך מילה אחרי מילה. הילד רואה את ההתקדמות שלו על הדף עצמו, ולא נשאר לבד מול טקסט שלם.

שווה לקחת עמוד שהילד צריך לקרוא, ולפתוח אותו יחד ב"כל מילה".`,
    },
    en: {
      subject: "Every Word: paste a text or snap a page, and understand it word by word",
      heading: "Every Word",
      ctaText: "Open Every Word",
      body: `Sometimes a child isn't stuck on one word, but on a whole page. An article, homework, a page from a book in another language. That's what **Every Word** is for.

## How it works
1. Give it a text: paste it, photograph a page, upload a PDF, or capture what's on the screen.
2. The text turns into a page where every word is tappable.
3. Tap any word that isn't clear, and get its meaning right in the context of the sentence.

## What's lovely about it
Every word understood is marked with a green ✓, and the page fills in front of you word after word. The child sees their own progress on the page itself, instead of facing a whole text alone.

It's worth taking a page your child needs to read, and opening it together in Every Word.`,
    },
  },

  "fam-tap-word": {
    he: {
      subject: "לחיצה על כל מילה, בכל מקום, בלי ללכת לאיבוד",
      heading: "כל מילה, בלחיצה",
      ctaText: "לנסות עכשיו",
      body: `קורה שההסבר של מילה מכיל מילה שגם אותה הילד לא מכיר. במקום להסתבך, פשוט לוחצים עליה.

## איך זה עובד
בכל מקום ב-Gadit, בתוך הגדרה, בתוך דוגמה, בכל טקסט, אפשר ללחוץ על כל מילה ולפתוח כרטיס פירוש קטן, בלי לאבד את המקום שבו היית.

## חזרה בקלות
בראש כל מילה שנפתחה ככה יש קישור **חזרה** למילה הקודמת, כדי שתמיד אפשר לחזור לאן שהתחלת. ילד יכול לצלול פנימה שלוש מילים ולחזור, בלי ללכת לאיבוד.

זה עיקרון פשוט שעליו בנוי כל Gadit: אף מילה לא מובילה למבוי סתום.`,
    },
    en: {
      subject: "Tap any word, anywhere, without getting lost",
      heading: "Any word, one tap",
      ctaText: "Try it now",
      body: `It happens that a word's explanation contains another word the child doesn't know either. Instead of getting tangled, just tap it.

## How it works
Anywhere in Gadit, inside a definition, inside an example, in any text, you can tap any word to open a small meaning card, without losing the place you were at.

## Easy way back
At the top of any word opened this way there's a **back** link to the previous word, so you can always return to where you started. A child can dive three words deep and come right back, without getting lost.

It's a simple principle the whole of Gadit is built on: no word ever leads to a dead end.`,
    },
  },

  "fam-say": {
    he: {
      subject: "Say-it: לשמוע איך אומרים מילה, ואז להגיד אותה ולקבל משוב",
      heading: "Say-it, כלי ההגייה",
      ctaText: "לפתוח את Say-it",
      body: `להבין מילה זה חצי מהעניין. לדעת להגיד אותה נכון זה החצי השני, במיוחד בשפה חדשה.

## איך זה עובד
1. מזינים מילה, ושומעים אותה נאמרת בהגייה נכונה, בכל אחת מ-22 השפות.
2. אחר כך תור הילד: הוא אומר את המילה בקול.
3. Gadit מקשיב, ונותן משוב מיידי: מדויק, כמעט, או עוד לא, וגם מראה מה הוא שמע.

## למה זה עוזר
עולה חדש שמבין מילה עדיין חושש להגיד אותה בקול. תרגול הגייה קצר, בלי מבוכה ובלי מורה שממתין, בונה בדיוק את הביטחון הזה.

Say-it כלול במנוי שלך. שווה לנסות עם מילה אחת עכשיו.`,
    },
    en: {
      subject: "Say-it: hear how a word is said, then say it and get feedback",
      heading: "Say-it, the pronunciation tool",
      ctaText: "Open Say-it",
      body: `Understanding a word is half of it. Knowing how to say it right is the other half, especially in a new language.

## How it works
1. Enter a word, and hear it spoken with correct pronunciation, in any of 22 languages.
2. Then it's the child's turn: they say the word out loud.
3. Gadit listens, and gives instant feedback: spot on, almost, or not yet, and shows what it heard.

## Why it helps
A newcomer who understands a word can still be shy about saying it out loud. A short bit of pronunciation practice, with no embarrassment and no teacher waiting, builds exactly that confidence.

Say-it is included in your subscription. It's worth trying with one word right now.`,
    },
  },

  "fam-voice": {
    he: {
      subject: "עוזר קולי: לשאול בקול, ולקבל תשובה בלי להקליד",
      heading: "העוזר הקולי",
      ctaText: "לנסות בקול",
      body: `לפעמים הילד באמצע משהו, והידיים תפוסות. אפשר פשוט לשאול בקול.

## איך זה עובד
אומרים "גדית" כדי להעיר את העוזר, ואז שואלים "מה זה" ואת המילה. התשובה נאמרת בקול, בלי להקליד ובלי לגעת במסך.

## מתי זה מנצח
בזמן קריאה, בזמן שיעורי בית, או פשוט כשנוח יותר לדבר מלכתוב. זה הופך את החיפוש למשהו טבעי כמו לשאול אדם שיושב לידך.

העוזר הקולי כלול במנוי. שווה לנסות עם הילד: "גדית, מה זה".`,
    },
    en: {
      subject: "Voice assistant: ask out loud, get an answer without typing",
      heading: "The voice assistant",
      ctaText: "Try it out loud",
      body: `Sometimes a child is in the middle of something and their hands are full. They can just ask out loud.

## How it works
Say "Gadit" to wake the assistant, then ask "what is" and the word. The answer is spoken back, with no typing and no touching the screen.

## When it wins
While reading, while doing homework, or simply when it's easier to speak than to type. It turns a lookup into something as natural as asking a person sitting next to you.

The voice assistant is included in your subscription. It's worth trying with your child: "Gadit, what is".`,
    },
  },

  "fam-context": {
    he: {
      subject: "מצב הקשר: להדביק את המשפט, ולקבל בדיוק את המשמעות הנכונה",
      heading: "מצב הקשר",
      ctaText: "לנסות מצב הקשר",
      body: `למילה רבת-משמעות יש בעיה אחת: לאיזו משמעות התכוונו? התשובה כמעט תמיד נמצאת במשפט שמסביבה.

## איך זה עובד
כשילד נתקל במילה שאפשר לפרש בכמה אופנים, מדביקים את המשפט שבו היא הופיעה. Gadit בוחר את המשמעות שמתאימה בדיוק להקשר הזה, במקום להציף בכל האפשרויות.

## למה זה חשוב
ככה מילה כמו "ערך" או "עבר" לא מבלבלת. הילד מקבל את הפירוש הרלוונטי למה שהוא קורא, ולא צריך לנחש איזו משמעות היא הנכונה.

שווה לנסות: לקחת משפט מהשיעור, להדביק אותו, ולראות איך המשמעות הנכונה קופצת מיד.`,
    },
    en: {
      subject: "Context mode: paste the sentence, get exactly the right meaning",
      heading: "Context mode",
      ctaText: "Try context mode",
      body: `A word with several meanings has one problem: which meaning was intended? The answer almost always lives in the sentence around it.

## How it works
When a child meets a word that can be read in more than one way, paste the sentence it appeared in. Gadit picks the meaning that fits that exact context, instead of flooding them with every option.

## Why it matters
So a word like "run" or "left" doesn't confuse. The child gets the meaning relevant to what they're reading, and doesn't have to guess which sense is right.

It's worth trying: take a sentence from the lesson, paste it in, and watch the right meaning come straight up.`,
    },
  },

  "fam-notebook": {
    he: {
      subject: "המחברת: הבית של כל מילה שהילד אסף",
      heading: "המחברת האישית",
      ctaText: "לפתוח את המחברת",
      body: `כל מילה שהילד מחפש לא נעלמת. היא נשמרת אליו.

## המחברת
כל חיפוש נכנס אוטומטית ל**מחברת** של הילד, מסודר לפי שפות. אוסף חי שגדל עם הזמן, שאפשר לחזור אליו בכל רגע ולראות כמה רחוק הגיעו.

## למה מחברת, ולא רק חיפוש
מילה שמחפשים ושוכחים לא נשארת. מילה שיש לה מקום, שחוזרים אליה, הופכת לחלק מאוצר המילים. המחברת היא הבית של כל המילים שהילד אסף בדרך.

בקרוב נראה איך הופכים את האוסף הזה למשחק. בינתיים, שווה לפתוח את המחברת ולראות מה כבר הצטבר שם.`,
    },
    en: {
      subject: "The notebook: a home for every word your child collects",
      heading: "The personal notebook",
      ctaText: "Open the notebook",
      body: `Every word the child looks up doesn't vanish. It's kept for them.

## The notebook
Every search goes automatically into the child's **notebook**, sorted by language. A living collection that grows over time, that they can return to any moment to see how far they've come.

## Why a notebook, not just a search
A word you look up and forget doesn't stay. A word that has a place, that you come back to, becomes part of your vocabulary. The notebook is the home of every word the child has collected along the way.

Soon we'll see how this collection turns into a game. For now, it's worth opening the notebook and seeing what's already gathered there.`,
    },
  },

  "fam-games": {
    he: {
      subject: "חידונים ומשחקים: מה שגורם למילה להישאר",
      heading: "תרגול ומשחקים",
      ctaText: "לשחק סבב",
      body: `אוסף מילים זה יפה. מה שגורם למילה באמת להיתקע בראש זה לתרגל אותה.

## חידונים ומשחקי מילים
על המילים שהילד כבר פגש יש **חידונים ומשחקים** קצרים. לא חומר חדש, אלא תרגול על מה שכבר ראה, בדיוק הדבר שהופך מילה מוכרת למילה שנשארת.

## הבנה שווה יותר
כאן נמצא הלב: הילד מקבל מעט נקודות על חיפוש מילה, והרבה על **הבנה** שלה, כשהוא עונה נכון. ככה התרגול מפסיק להרגיש כמו שיעורי בית, והופך למשהו שכיף לחזור אליו.

שווה לפתוח עם הילד סבב אחד של משחק על מילים שהוא כבר מכיר.`,
    },
    en: {
      subject: "Quizzes and games: what makes a word stick",
      heading: "Practice and games",
      ctaText: "Play a round",
      body: `Collecting words is lovely. What truly lodges a word in the mind is practicing it.

## Quizzes and word games
On the words the child has already met there are short **quizzes and games**. Not new material, but practice on what they've already seen, exactly the thing that turns a familiar word into a word that stays.

## Understanding is worth more
Here's the heart of it: the child earns a little for looking a word up, and a lot for **understanding** it, by answering correctly. That turns practice from homework into something they enjoy coming back to.

It's worth opening one round of a game with your child, on words they already know.`,
    },
  },

  "fam-dashboard": {
    he: {
      subject: "לוח ההורים: לראות בדיוק מה כל ילד למד",
      heading: "לוח ההורים",
      ctaText: "לפתוח את הלוח",
      body: `רוב ההורים שואלים "הבנת?" ומקבלים "כן". לוח ההורים של Gadit נותן לך תשובה אמיתית.

## מה רואים במבט אחד
- כמה מילים כל ילד למד **השבוע**, וכמה בסך הכול.
- ה**רצף** שלו, כמה ימים ברציפות הוא לומד.
- ה**מילים האחרונות** שנכנסו למחברת של כל ילד.

הכול במקום אחד, כל הילדים יחד, בלי לשאול ובלי לנחש.

## למה זה חשוב
זה מה שהופך את Gadit מעוד אפליקציה לחלק מהמסע של הילד. רואים איפה הילד סקרן, על מה הוא עובד, ומתי הוא באמת מתקדם. וברגע הנכון, אפשר לפרגן לו על זה.

שווה לפתוח את הלוח ולראות מה כבר קרה אצל כל ילד.`,
    },
    en: {
      subject: "The parent board: see exactly what each child learned",
      heading: "The parent board",
      ctaText: "Open the board",
      body: `Most parents ask "Got it?" and hear "Yeah". Gadit's parent board gives you a real answer.

## What you see at a glance
- How many words each child learned **this week**, and how many in total.
- Their **streak**, how many days in a row they've been learning.
- The **latest words** that entered each child's notebook.

All in one place, all the kids together, with no asking and no guessing.

## Why it matters
This is what turns Gadit from just another app into something you're part of. You see where your child is curious, what they're working on, and when they're truly making progress. And at the right moment, you can cheer them on for it.

It's worth opening the board and seeing what's already happened with each child.`,
    },
  },

  "fam-alerts": {
    he: {
      subject: "התראות מילים: לדעת מה מסקרן את הילד",
      heading: "התראות מילים",
      ctaText: "להפעיל התראות",
      body: `כשילד עוצר לחפש מילה, זה רגע קטן של סקרנות. אפשר להיות שם בשבילו.

## איך זה עובד
מפעילים **התראות מילים**, ובכל פעם שילד מחפש מילה חדשה, מקבלים על כך התראה. אפשר לבחור:
- **מיידי**, התראה ברגע שהילד מחפש.
- **סיכום יומי**, הודעה אחת בסוף היום עם כל המילים.

ההתראות מגיעות גם כ-Push לטלפון וגם למייל, איך שנוח לך.

## למה זה יפה
זו לא בקרה, זה חיבור. ככה יודעים על מה הילד חשב, ואפשר לפתוח על זה שיחה בערב: "ראיתי שחיפשת את המילה הזאת, מאיפה היא?".

אפשר לכבות בכל רגע, ולעבור בין מיידי לסיכום מתי שרוצים.`,
    },
    en: {
      subject: "Word alerts: know what's sparking your child's curiosity",
      heading: "Word alerts",
      ctaText: "Turn on alerts",
      body: `When a child stops to look up a word, that's a small moment of curiosity. You can be there for it.

## How it works
Turn on **word alerts**, and every time a child looks up a new word, you get a heads-up. You can choose:
- **Instant**, an alert the moment your child searches.
- **Daily summary**, one message at the end of the day with all the words.

Alerts arrive both as a push to your phone and by email, whichever suits you.

## Why it's lovely
This isn't monitoring, it's connection. You know what your child was thinking about, and you can start a conversation over it in the evening: "I saw you looked up that word, where did it come from?".

You can turn it off any time, and switch between instant and a summary whenever you like.`,
    },
  },

  "fam-gamification": {
    he: {
      subject: "דרגות, רצף וסקינים: מה שמחזיר את הילד",
      heading: "דרגות, רצף וסקינים",
      ctaText: "לראות דרגות וסקינים",
      body: `ילד לא חוזר לכלי כי הוא מועיל. הוא חוזר כי כיף לו. בשביל זה בנינו את כל שכבת המשחק.

## איך זה עובד
- כל מילה שהילד **מבין** מזכה אותו בנקודות. חיפוש שווה קצת, הבנה שווה הרבה.
- הנקודות מעלות אותו ב**דרגות**, מ"סייר" ומעלה, מסע שנמשך חודשים.
- **רצף** יומי מעודד אותו לחזור עוד יום ועוד יום, בלי לחץ, כי יום אחד שמפספסים לא שובר אותו.
- ויש **יעד שבועי** אישי שמתכייל לקצב של כל ילד.

## עיצובים
ככל שהילד מטפס בדרגות, נפתחים לו **סקינים** חדשים, עיצובים שמשנים את כל המראה של האזור שלו. אין חנות ואין קנייה, כל סקין מגיע עם ההתקדמות, בדיוק כשמגיעים לדרגה שלו. זה הפרס שהילד רודף אחריו, וזה מה שהופך למידה למשחק.

שווה לפתוח עם הילד את מסך הדרגות ולראות כמה קרוב הסקין הבא.`,
    },
    en: {
      subject: "Ranks, streaks and skins: what brings your child back",
      heading: "Ranks, streaks and skins",
      ctaText: "See ranks and skins",
      body: `A child doesn't return to a tool because it's useful. They return because it's fun. That's why we built the whole game layer.

## How it works
- Every word the child **understands** earns them points. A search is worth a little, understanding is worth a lot.
- Points raise them through **ranks**, from Scout on up, a journey that lasts months.
- A daily **streak** encourages them to come back another day, without pressure, because a single missed day never breaks it.
- And there's a personal **weekly goal** that calibrates to each child's pace.

## Skins
As the child climbs the ranks, new **skins** unlock, designs that change the whole look of their space. No store and no buying, each skin comes with progress, right when they reach its rank. That's the reward the child chases, and it's what turns learning into a game.

It's worth opening the ranks screen with your child and seeing how close the next skin is.`,
    },
  },

  "fam-coach": {
    he: {
      subject: "מורה פרטי או מאמן: גישה מבוקרת לפרופיל של הילד",
      heading: "מורה פרטי או מאמן",
      ctaText: "להגדרות המשפחה",
      body: `אם לילד יש מורה פרטי, או מאמן לשיפור מיומנויות למידה, שיש לו חשבון Gadit משלו, אפשר לצרף אותו פנימה, בשליטה מלאה שלך.

## איך זה עובד
בהגדרות המשפחה נותנים למורה או למאמן, שכבר יש לו חשבון Gadit, גישה **מבוקרת** לפרופיל של ילד מסוים, לפי אימייל. בזמן השיעור הוא יכול להוסיף מילים ישירות למחברת של הילד.

## שלך לתת, ושלך לבטל
הגישה מוגבלת לילד אחד שבחרת, ואפשר לבטל אותה בכל רגע בהקשה אחת. המורה אף פעם לא רואה את שאר המשפחה.

## למה זה יפה
ככה מה שקורה בשיעור לא הולך לאיבוד. המילים שהמורה עבר עליהן עם הילד מחכות לו במחברת, לתרגול ולחזרה.

אם יש מורה או מאמן בתמונה, שווה להיכנס ולתת לו גישה.`,
    },
    en: {
      subject: "A private teacher or coach: controlled access to your child's profile",
      heading: "A private teacher or coach",
      ctaText: "Family settings",
      body: `If your child has a private teacher, or a learning-skills coach, who has their own Gadit account, you can bring them in, fully under your control.

## How it works
In your family settings you give the teacher or coach, who already has a Gadit account, **controlled** access to a specific child's profile, by email. During a lesson they can add words straight into the child's notebook.

## Yours to grant, yours to revoke
Access is limited to the one child you choose, and you can revoke it any moment with a single tap. The teacher never sees the rest of your family.

## Why it's lovely
This way, what happens in the lesson doesn't get lost. The words the teacher went over with your child wait for them in the notebook, for practice and review.

If there's a teacher or coach in the picture, it's worth going in and giving them access.`,
    },
  },

  "fam-more": {
    he: {
      subject: "בטיחות, ומכשיר משותף: הכול מוכן",
      heading: "בטוח, שלך, והכול מוכן",
      ctaText: "להגדרות המשפחה",
      body: `הגענו לסוף הסיור. נשאר הדבר שהכי חשוב לי שתדע: המרחב הזה בטוח.

## מרחב סגור
אין פרסומות, אין הודעות מזרים, אין צ'אט פתוח, ואין מסחר בנתונים של הילד. כל ילד יושב מאחורי קוד קצר משלו. רק ילד ומילים.

## מכשיר משותף בבית
אם כמה ילדים חולקים טאבלט אחד, כל אחד נכנס לפרופיל שלו במגע אחד, ורואה רק את שלו. אפשר לשים קוד קצר לכל ילד כדי שלא ייכנסו אחד לשני.

## וזהו, הכול כאן
עברנו יחד על כל המנוי, פונקציה אחר פונקציה. כל הכלים פתוחים לך ולמשפחה. תודה שהצטרפת ל-Gadit, ואני כאן לכל שאלה, פשוט להשיב למייל הזה.`,
    },
    en: {
      subject: "Safety, and a shared device: you're all set",
      heading: "Safe, yours, and ready",
      ctaText: "Family settings",
      body: `We've reached the end of the tour. One thing is left that matters to me most that you know: this space is safe.

## A closed space
No ads, no messages from strangers, no open chat, and no trading of your child's data. Each child sits behind their own short code. Just a child and words.

## A shared device at home
If several kids share one tablet, each enters their own profile with a single tap, and sees only their own. You can set a short code for each child so they don't tap into each other's.

## And that's it, it's all here
We've been through the whole subscription together, one feature after another. Every tool is open to you and your family. Thank you for joining Gadit, and I'm here for any question, just reply to this email.`,
    },
  },
};
