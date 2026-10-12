/**
 * The "connect your child" rescue (Gadi 2026-10-12): 14 of the 18 paying
 * families that never looked up a word had never connected a child. From
 * day 2 of the family series, a family with no child connected gets this one
 * short email (one step), once; a family with a child connected never does.
 * Hebrew and English; other languages read the English.
 */
import type { EmailContent } from "./render";
import type { FamilyEmailMeta } from "./family-content";

export const CONNECT_KEY = "fam2-connect";

export const CONNECT_META: FamilyEmailMeta = { key: CONNECT_KEY, label: "Family · Connect your child (rescue)", dayOffset: 2, ctaUrlTab: "?tab=members", ctaPath: "/family", v2: true };

export const CONNECT_CONTENT: { he: EmailContent; en: EmailContent } = {
  he: {
    subject: "היי {שם}, נשאר צעד אחד: לחבר את הילד",
    heading: "",
    body: `היי {שם},

ראינו שעוד לא חיברתם ילד ל-Gadit.
זה הצעד היחיד שחסר, והוא לוקח דקה.

## איך מחברים
1. נכנסים ל["בני המשפחה"](/family?tab=members) ולוחצים "הוספת בן משפחה".
2. כותבים את שם הילד, ומקבלים קישור חיבור.
3. פותחים את הקישור בטלפון או בטאבלט של הילד, וזהו.

אפשר גם בלי מכשיר נפרד: מדליקים את מצב ילדים בטלפון שלכם, והילד משתמש בו.
מהרגע הזה הילד מחפש מילים, מתרגל ומשחק, ואתם רואים הכל בלוח ההורים.

נתקעתם? פשוט עונים למייל הזה, ואנחנו עוזרים.`,
    ctaText: "לחיבור הילד",
    next: "",
  },
  en: {
    subject: "Hi {name}, one step left: connect your child",
    heading: "",
    body: `Hi {name},

We noticed you haven't connected a child to Gadit yet.
It's the only step missing, and it takes a minute.

## How to connect
1. Open ["Family"](/family?tab=members) and tap "Add a family member".
2. Type your child's name, and you get a connect link.
3. Open the link on your child's phone or tablet, and that's it.

No separate device? Turn on Kids Mode on your own phone, and your child uses it.
From then on your child looks up words, practises and plays, and you see it all on the parent board.

Stuck? Just reply to this email and we'll help.`,
    ctaText: "Connect your child",
    next: "",
  },
};
