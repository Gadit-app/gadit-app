import type { EmailContent } from "./render";

/**
 * Single source of truth for the editable Family onboarding emails.
 * Content is markdown-lite (see render.ts) so the admin editor and the
 * code defaults share one format. A saved override in Firestore
 * (emailTemplates/{key}) replaces the default here per language.
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
    key: "fam-connect",
    label: "Family · 1 · Connect kids",
    dayOffset: 1,
    ctaUrlTab: "?tab=members",
    eyebrow: { he: "הקמה, צעד 1 מתוך 3", en: "Setup, step 1 of 3" },
    foot: { he: "יש שאלה? אפשר פשוט להשיב למייל הזה.", en: "Have a question? Just reply to this email." },
  },
  {
    key: "fam-alerts",
    label: "Family · 2 · Turn on alerts",
    dayOffset: 2,
    ctaUrlTab: "?tab=settings",
    eyebrow: { he: "הקמה, צעד 2 מתוך 3", en: "Setup, step 2 of 3" },
    foot: {
      he: "אפשר לכבות בכל רגע, ולבחור בין מיידי לסיכום יומי בכל זמן.",
      en: "You can turn it off any time, and switch between instant and a daily summary whenever you like.",
    },
  },
  {
    key: "fam-how",
    label: "Family · 3 · How it works",
    dayOffset: 3,
    ctaUrlTab: "",
    eyebrow: { he: "הקמה, צעד 3 מתוך 3", en: "Setup, step 3 of 3" },
    foot: {
      he: "כיף לראות את אוצר המילים של הילד גדל שבוע אחרי שבוע.",
      en: "Enjoy watching your child's vocabulary grow, week after week.",
    },
  },
];

export const FAMILY_CONTENT: Record<string, { he: EmailContent; en: EmailContent }> = {
  "fam-connect": {
    he: {
      subject: "צעד 1: לחבר את הילדים ל-Gadit",
      heading: "לחבר את הילדים",
      ctaText: "לחבר את הילדים",
      body: `ב-Gadit Family כל ילד מחפש מילים במכשיר שלו, וההורה רואה את כל ההתקדמות במקום אחד.

לוח בקרה אחד מרכז את כל הילדים יחד: מה כל אחד למד וכמה מילים נוספו השבוע.

## איך מחברים ילד
1. בלוח הבקרה של המשפחה נכנסים ל**בני המשפחה** ומוסיפים ילד עם שם.
2. לוחצים **חיבור מכשיר** ומקבלים קוד קצר.
3. במכשיר של הילד (טלפון, טאבלט או מחשב) פותחים את Gadit ומזינים את הקוד. בלי סיסמה ובלי אימייל לילד.

המכשיר מחובר, והמילים שהילד מחפש מתחילות להופיע בלוח הבקרה.

## מעבר בין משתמשים
בכל מכשיר אפשר להחליף פרופיל, כך שגם אם שני ילדים חולקים טאבלט, כל אחד רואה את המילים והמשחקים שלו.`,
    },
    en: {
      subject: "Step 1: connect your kids to Gadit",
      heading: "Connect your kids",
      ctaText: "Connect your kids",
      body: `In Gadit Family, every child looks words up on their own device, and the parent sees all the progress in one place.

One dashboard brings all the kids together: what each has learned and how many words were added this week.

## How to connect a child
1. In the family dashboard open **Family** and add a child with a name.
2. Tap **Connect device** and you get a short code.
3. On the child's device (phone, tablet or computer) open Gadit and enter the code. No password, no email for the child.

The device is linked, and the words they look up start showing on the dashboard.

## Switching between users
Any device can switch profile, so even if two kids share one tablet, each sees their own words and games.`,
    },
  },
  "fam-alerts": {
    he: {
      subject: "צעד 2: לקבל התראה כשהילד מחפש מילה",
      heading: "להפעיל התראות",
      ctaText: "להפעיל התראות",
      body: `אפשר לקבל התראה בכל פעם שילד מחפש מילה במילון, עם המילה עצמה. זו דרך שקטה לראות מה מסקרן את הילד ובמה הוא מתקשה.

## איך מפעילים
1. בלוח הבקרה של המשפחה נכנסים ל**הגדרות**.
2. מדליקים את **התראות על מילים**.
3. בוחרים בין התראה על כל מילה לבין סיכום אחד בסוף היום.

ההתראה מגיעה למייל תמיד, וגם כבאנר לטלפון. כדי לקבל את הבאנר בטלפון, פותחים את Gadit מהמסך הבית ולוחצים **הפעל התראות במכשיר הזה**. כל מכשיר צריך הפעלה פעם אחת.`,
    },
    en: {
      subject: "Step 2: get an alert when your child looks up a word",
      heading: "Turn on alerts",
      ctaText: "Turn on alerts",
      body: `You can get an alert every time a child looks up a word, with the word itself. It's a quiet window into what they're curious about and where they struggle.

## How to turn it on
1. In the family dashboard open **Settings**.
2. Switch on **Word alerts**.
3. Choose between an alert for every word or one summary at the end of the day.

Alerts always arrive by email, and as a phone banner too. To get the banner on your phone, open Gadit from the home screen and tap **Turn on alerts on this device**. Each device needs turning on once.`,
    },
  },
  "fam-how": {
    he: {
      subject: "צעד 3: איך הכל עובד, ואיפה רואים מה הילד לומד",
      heading: "איך הכל עובד",
      ctaText: "לראות את ההתקדמות",
      body: `הנה כל המסע במשפט אחד: הילד נתקל במילה שלא מובנת, מחפש אותה ב-Gadit, ומקבל את כל המשמעויות, דוגמאות, ותמונה שמסבירה, בשפה שלו.

## כל מילה נשמרת לבד
כל מילה שהילד מחפש נשמרת אוטומטית למחברת שלו. הילד לא צריך ללחוץ על כלום, ואוסף המילים גדל מעצמו.

## איפה רואים את ההתקדמות
בלוח הבקרה של המשפחה, בעמוד הראשי. לכל ילד יש כרטיס עם מספר המילים שלמד, כמה נוספו השבוע, והמילים האחרונות שחיפש. יש גם פיד של חיפושים אחרונים עם השעה. ככה Gadit הופך ממילון ל**תעודה חיה** של אוצר המילים של הילד.

זה בדיוק ההבדל בין Gadit ל-ChatGPT: שיחה נעלמת, ואילו Gadit נאגר ומראה את הגדילה.`,
    },
    en: {
      subject: "Step 3: how it all works, and where you see what your child learns",
      heading: "How it all works",
      ctaText: "See the progress",
      body: `Here's the whole journey in one line: your child hits a word they don't get, looks it up in Gadit, and gets all its meanings, examples and a picture that explains it, in their language.

## Every word saves itself
Every word your child looks up is saved to their notebook automatically. They never have to tap a thing, and their word collection just grows.

## Where you see the progress
The family dashboard home page. Each child has a card with how many words they've learned, how many were added this week, and their most recent lookups. There's also a live feed of recent searches with the time. That's how Gadit turns from a dictionary into a **living report card** of your child's vocabulary.

That's the difference between Gadit and ChatGPT: a conversation vanishes, Gadit accumulates and shows the growth.`,
    },
  },
};
