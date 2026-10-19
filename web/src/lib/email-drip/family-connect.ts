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
1. נכנסים ל["בני המשפחה"](/family?tab=members). אם הילד עוד לא ברשימה, לוחצים "הוספת בן משפחה" וממלאים שם, גיל וצבע.
2. ליד הילד לוחצים "חיבור מכשיר".
3. בטלפון או בטאבלט של הילד סורקים את קוד ה-QR, או נכנסים ל-[gadit.app/join](https://www.gadit.app/join) ומקלידים את הקוד בן 6 הספרות.

אין לילד מכשיר משלו? ב["בני המשפחה"](/family?tab=members) לוחצים "מסך משותף לילדים", מוסרים לו את המכשיר, והוא לוחץ על עצמו.
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
1. Open ["Family members"](/family?tab=members). If your child isn't on the list yet, tap "Add a family member" and fill in a name, age and colour.
2. Next to your child, tap "Pair device".
3. On your child's phone or tablet, scan the QR code, or go to [gadit.app/join](https://www.gadit.app/join) and type the 6-digit code.

No device of their own? In ["Family members"](/family?tab=members) tap "Shared kids screen", hand them the device, and they tap their own name.
From then on your child looks up words, practises and plays, and you see it all on the parent dashboard.

Stuck? Just reply to this email and we'll help.`,
    ctaText: "Connect your child",
    next: "",
  },
};
