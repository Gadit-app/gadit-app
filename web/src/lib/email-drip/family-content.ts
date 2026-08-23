import type { EmailContent } from "./render";

/**
 * Single source of truth for the editable Family onboarding emails.
 * Content is markdown-lite (see render.ts) so the admin editor and the
 * code defaults share one format. A saved override in Firestore
 * (emailTemplates/{key}) replaces the default here per language.
 *
 * Rebuilt 2026-08-23 (Gadi) into a full 8-email series that walks a new
 * Family parent through everything we've built, ordered most-important-first:
 * setup -> Kids Mode -> notebook & games -> parent board -> alerts ->
 * gamification -> rewards -> safety & extras. he + en; the 33-language
 * expansion of this series is a follow-up.
 */

export const EMAIL_BASE = "https://www.gadit.app";

export type FamilyEmailMeta = {
  key: string;
  label: string; // admin list label
  dayOffset: number;
  ctaUrlTab: string; // appended to /family
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
    key: "fam-kids-mode",
    label: "Family · 2 · Kids Mode",
    dayOffset: 2,
    ctaUrlTab: "",
    eyebrow: { he: "החוויה של הילד", en: "The child's experience" },
    foot: { he: "והמילון המלא פתוח גם לך, בכל רגע.", en: "And the full dictionary is open to you too, any time." },
  },
  {
    key: "fam-notebook",
    label: "Family · 3 · Notebook & games",
    dayOffset: 4,
    ctaUrlTab: "",
    eyebrow: { he: "מה שגורם למילה להישאר", en: "What makes a word stick" },
    foot: { he: "מילה שמתרגלים היא מילה שנשארת.", en: "A word you practice is a word that stays." },
  },
  {
    key: "fam-dashboard",
    label: "Family · 4 · Parent board",
    dayOffset: 6,
    ctaUrlTab: "",
    eyebrow: { he: "מה שאין לאף אחד אחר", en: "What no one else has" },
    foot: { he: "כיף לראות את אוצר המילים גדל שבוע אחרי שבוע.", en: "Enjoy watching the vocabulary grow, week after week." },
  },
  {
    key: "fam-alerts",
    label: "Family · 5 · Word alerts",
    dayOffset: 8,
    ctaUrlTab: "?tab=settings",
    eyebrow: { he: "חלון לסקרנות של הילד", en: "A window into your child's curiosity" },
    foot: { he: "אפשר לכבות בכל רגע, ולבחור בין מיידי לסיכום יומי.", en: "You can turn it off any time, and switch between instant and a daily summary." },
  },
  {
    key: "fam-gamification",
    label: "Family · 6 · Ranks, streaks, skins",
    dayOffset: 10,
    ctaUrlTab: "",
    eyebrow: { he: "מה שמחזיר את הילד", en: "What brings your child back" },
    foot: { he: "כל מילה שמבינים היא נקודה קדימה.", en: "Every word understood is a point forward." },
  },
  {
    key: "fam-rewards",
    label: "Family · 7 · Rewards",
    dayOffset: 12,
    ctaUrlTab: "?tab=settings",
    eyebrow: { he: "הרגע שבו ראית מה עשה", en: "The moment you saw what they did" },
    foot: { he: "פרס קטן ברגע הנכון שווה הרבה.", en: "A small reward at the right moment goes a long way." },
  },
  {
    key: "fam-more",
    label: "Family · 8 · Safety, coach & more",
    dayOffset: 14,
    ctaUrlTab: "?tab=settings",
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

  "fam-notebook": {
    he: {
      subject: "המחברת והמשחקים: מה שגורם למילה להישאר",
      heading: "המחברת, התרגול והמשחקים",
      ctaText: "לראות את המחברת",
      body: `להבין מילה פעם אחת זה יפה. מה שגורם לה להישאר זה מה שקורה אחר כך.

## המחברת
כל מילה שהילד מחפש נשמרת אוטומטית ל**מחברת** האישית שלו, מסודרת לפי שפות. אוסף חי שגדל, שאפשר לחזור אליו בכל רגע.

## תרגול ומשחקים
מעל המחברת יש **חידונים ומשחקי מילים** קצרים על המילים שהילד כבר פגש. בדיוק הדבר שהופך מילה שראו פעם למילה שבאמת נשארת בראש.

## הבנה, לא רק חיפוש
כאן נמצא הלב: הילד מקבל נקודות לא רק על חיפוש מילה, אלא על **הבנה** שלה, כשהוא עונה נכון בחידון או במשחק. ככה התרגול הופך משיעורי בית לדבר שכיף לחזור אליו.

שווה לפתוח עם הילד את המחברת, לבחור מילה, ולשחק סבב אחד.`,
    },
    en: {
      subject: "The notebook and games: what makes a word stick",
      heading: "The notebook, practice and games",
      ctaText: "See the notebook",
      body: `Understanding a word once is lovely. What makes it stick is what happens next.

## The notebook
Every word the child looks up is saved automatically to their personal **notebook**, sorted by language. A living collection that grows, and that they can return to any time.

## Practice and games
On top of the notebook there are short **quizzes and word games** on the words the child has already met. Exactly the thing that turns a word seen once into a word that truly stays.

## Understanding, not just searching
Here's the heart of it: the child earns points not just for looking a word up, but for **understanding** it, by answering correctly in a quiz or a game. That turns practice from homework into something they enjoy coming back to.

It's worth opening the notebook with your child, picking a word, and playing one round.`,
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
This is what turns Gadit from just another app into something you're part of. You see where your child is curious, what they're working on, and when they're truly making progress. And at the right moment, you can reward them for it.

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
ככל שהילד מתקדם, נפתחים לו **סקינים** חדשים, עיצובים שמשנים את כל המראה של האזור שלו. זה הפרס שהוא רודף אחריו, וזה מה שהופך למידה למשחק.

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
As the child progresses, new **skins** unlock, designs that change the whole look of their space. That's the reward they chase, and it's what turns learning into a game.

It's worth opening the ranks screen with your child and seeing how close the next skin is.`,
    },
  },

  "fam-rewards": {
    he: {
      subject: "פרסים: לתגמל את הילד על מה שהוא עשה",
      heading: "פרסים",
      ctaText: "לתת פרס",
      body: `יש רגעים שבהם הילד עושה משהו טוב, ומתחשק לך להגיד לו "ראיתי". עכשיו אפשר, במקום.

## איך זה עובד
בלוח ההורים, ליד כל ילד, יש **פרסים**. כשילד מגיע להישג, רצף יפה או שבוע חזק, אפשר לשלוח לו נקודות מתנה בהקשה אחת.

## מה הילד עושה איתן
הילד מוציא את הנקודות ב**חנות** על עיצובים חדשים שהוא בוחר. יש שני מסלולים לכל עיצוב: להרוויח אותו בטיפוס דרגות, או לקבל אותו כפרס ממך. שתי דרכים, אותה שמחה.

## למה זה חשוב
המערכת מתגמלת את המסע הארוך לבד. הפרגון שלך מתגמל את **הרגע**. ילד מעריך "ההורה שלי שם לב" הרבה יותר מכל פתיחה אוטומטית. זו נקודת חיבור קטנה שנשארת.

שווה להיכנס להגדרות המשפחה ולראות איך נותנים פרס.`,
    },
    en: {
      subject: "Rewards: celebrate what your child actually did",
      heading: "Rewards",
      ctaText: "Give a reward",
      body: `There are moments when your child does something great, and you want to tell them "I saw that". Now you can, on the spot.

## How it works
In the parent board, next to each child, there are **rewards**. When a child hits an achievement, a nice streak or a strong week, you send them gift points with a single tap.

## What the child does with them
The child spends the points in the **store** on new designs they choose. Every design has two paths: earn it by climbing ranks, or receive it as a reward from you. Two ways, the same joy.

## Why it matters
The system rewards the long journey on its own. You reward the **moment**. A child values "my parent noticed" far more than any automatic unlock. It's a small point of connection that stays.

It's worth going into your family settings to see how to give a reward.`,
    },
  },

  "fam-more": {
    he: {
      subject: "בטיחות, מאמן ועוד: הכול מוכן",
      heading: "בטוח, שלך, והכול מוכן",
      ctaText: "להגדרות המשפחה",
      body: `הגענו לסוף הסיור. נשארו כמה דברים שכדאי להכיר, וכולם עניין של שקט נפשי.

## מרחב סגור ובטוח
אין פרסומות, אין הודעות מזרים, אין צ'אט פתוח, ואין מסחר בנתונים. כל ילד מאחורי קוד קצר משלו. רק ילד ומילים.

## מאמן או מורה
אפשר להזמין מורה או מאמן לגישה **מבוקרת** לפרופיל של ילד מסוים, כדי שיוסיף מילים במהלך שיעור. הגישה שלך לתת ולבטל בכל רגע.

## מכשיר משותף ועוזר קולי
במסך משותף בבית, כל ילד נכנס לפרופיל שלו במגע אחד. ולמי שמעדיף לדבר, יש **עוזר קולי**: לשאול בקול "גדית, מה זה..." ולקבל תשובה, בלי להקליד.

זהו. עברנו על כל המנוי. הכול מוכן, וכל הכלים כאן. תודה שהצטרפת למשפחת Gadit.`,
    },
    en: {
      subject: "Safety, a coach and more: you're all set",
      heading: "Safe, yours, and ready",
      ctaText: "Family settings",
      body: `We've reached the end of the tour. A few things are left worth knowing, and they're all about peace of mind.

## A closed, safe space
No ads, no messages from strangers, no open chat, and no data trading. Each child sits behind their own short code. Just a child and words.

## A coach or teacher
You can invite a teacher or coach for **controlled** access to a specific child's profile, so they can add words during a lesson. It's yours to grant and to revoke at any time.

## Shared device and voice assistant
On a shared screen at home, each child enters their own profile with a single tap. And for anyone who prefers to speak, there's a **voice assistant**: ask out loud "Gadit, what is..." and get an answer, without typing.

That's it. We've been through the whole subscription. You're ready, and all the tools are here. Thank you for joining the Gadit family.`,
    },
  },
};
