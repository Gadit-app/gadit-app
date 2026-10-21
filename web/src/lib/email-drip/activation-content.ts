import { renderEmailHtmlV2, mdLiteToHtml, applyName, type EmailContent } from "./render";

/**
 * Activation emails (Gadi 2026-10-21, the subscriber-health plan): they push
 * a subscriber to USE Gadit, one concrete step and one button each. They
 * never mention pausing, refunds or cancelling (that lives only in the
 * cancel flow). Code defaults in Hebrew and English; the admin email editor
 * (series "Activation") edits them, a saved override in emailTemplates/{key}
 * wins, and a language with no translation gets the English email.
 *
 * Automatic (cron, while emailConfig/activation.enabled is true):
 *   act-first-word-*  trial day 1, nobody in the account searched a word yet
 *   act-first-word-2  trial day 3, still no search
 *   act-add-child     a Family account 48 hours in with no child profile
 * Manual (admin send, chosen people): act-return-* to quiet subscribers.
 * Placeholders: {שם}/{name} first name. The button link is set by the sender
 * (the search page, or "add a child" for a Family without one).
 */

type Mail = { subject: string; body: string; cta: string; next: string };

export type ActivationKey =
  | "act-first-word-family"
  | "act-first-word-indiv"
  | "act-first-word-2"
  | "act-add-child"
  | "act-return-family"
  | "act-return-indiv";

export type ActivationTarget = "search" | "add-child";

const BY_LANG: Record<"he" | "en", Record<ActivationKey, Mail>> = {
  he: {
    "act-first-word-family": {
      subject: "המילה הראשונה של הילדים ב-Gadit",
      body: `היי {שם},

הדרך הכי טובה להתחיל: לשבת עם הילד חמש דקות ולחפש יחד מילה אחת שהוא פגש היום, בספר, בשיעורי הבית או בשיחה.

- מקלידים את המילה בחיפוש
- רואים הסבר בגובה של הילד, עם תמונה לכל משמעות
- שומרים אותה במחברת, ומשם היא נכנסת למשחקים שלו

מילה אחת היום, והילד כבר מתחיל לבנות אוצר מילים משלו.`,
      cta: "לחפש את המילה הראשונה",
      next: "צריכים עזרה? אפשר פשוט להשיב למייל הזה.",
    },
    "act-first-word-indiv": {
      subject: "המילה הראשונה שלכם ב-Gadit",
      body: `היי {שם},

הדרך הכי טובה להתחיל: לחפש מילה אחת שפגשתם היום, בספר, בעבודה או בשיחה.

- כל המשמעויות שלה, עם תמונה לכל משמעות
- מאיפה היא הגיעה לשפה
- שומרים אותה במחברת ומתרגלים אותה במשחקים קצרים

מילה אחת היום, ואוצר המילים שלכם כבר מתחיל לגדול.`,
      cta: "לחפש את המילה הראשונה",
      next: "צריכים עזרה? אפשר פשוט להשיב למייל הזה.",
    },
    "act-first-word-2": {
      subject: "מילה אחת, חמש דקות",
      body: `היי {שם},

הנה רעיון קטן להיום: בוחרים מילה אחת מהספר, משיעורי הבית או מהחדשות, ומחפשים אותה ב-Gadit.

תוך דקה רואים את כל המשמעויות שלה, עם תמונה ודוגמאות, והיא נשמרת במחברת לתרגול.

ככה בונים אוצר מילים: מילה אחת בכל פעם.`,
      cta: "לחפש מילה עכשיו",
      next: "צריכים עזרה? אפשר פשוט להשיב למייל הזה.",
    },
    "act-add-child": {
      subject: "עוד צעד אחד: להוסיף את הילד",
      body: `היי {שם},

Gadit Family בנוי סביב הילדים, ועדיין לא הוספתם ילד לחשבון. זה לוקח דקה:

- כותבים את השם של הילד ובוחרים לו דמות
- מחברים לו מכשיר משלו בלי סיסמה, או משתמשים במצב ילדים במכשיר שלכם
- מהרגע הזה כל מילה שהוא מחפש נשמרת אצלו, ואתם רואים את ההתקדמות בלוח ההורים`,
      cta: "להוספת ילד",
      next: "צריכים עזרה? אפשר פשוט להשיב למייל הזה.",
    },
    "act-return-family": {
      subject: "הכנו לכם התחלה קצרה ב-Gadit",
      body: `היי {שם},

רצינו לוודא שהילדים מקבלים מ-Gadit את כל מה שהוא יכול לתת. הנה שלושה צעדים קצרים להתחיל כבר השבוע:

- מוסיפים ילד לחשבון, אם עוד לא הוספתם (דקה אחת)
- מחפשים יחד מילה אחת מהספר או משיעורי הבית
- פותחים את המשחקים, שבנויים מהמילים שהילד שמר`,
      cta: "להתחיל עכשיו",
      next: "רוצים שנראה לכם איך זה עובד? השיבו למייל הזה ונקבע שיחה קצרה של 10 דקות.",
    },
    "act-return-indiv": {
      subject: "הכנו לכם התחלה קצרה ב-Gadit",
      body: `היי {שם},

רצינו לוודא שאתם מקבלים מ-Gadit את כל מה שהוא יכול לתת. הנה שלושה צעדים קצרים להתחיל כבר השבוע:

- מחפשים מילה אחת שפגשתם היום
- שומרים אותה במחברת
- מתרגלים את המילים שלכם במשחקים קצרים`,
      cta: "לחפש מילה",
      next: "רוצים שנראה לכם איך זה עובד? השיבו למייל הזה ונקבע שיחה קצרה של 10 דקות.",
    },
  },
  en: {
    "act-first-word-family": {
      subject: "Your kids' first word on Gadit",
      body: `Hi {name},

The best way to start: sit with your child for five minutes and look up one word they met today, in a book, in homework or in conversation.

- Type the word in the search
- See an explanation at your child's level, with a picture for every meaning
- Save it to the notebook, and from there it goes into their games

One word today, and your child is already building a vocabulary of their own.`,
      cta: "Look up the first word",
      next: "Need help? Just reply to this email.",
    },
    "act-first-word-indiv": {
      subject: "Your first word on Gadit",
      body: `Hi {name},

The best way to start: look up one word you met today, in a book, at work or in conversation.

- Every meaning of it, with a picture for each one
- Where the word came from
- Save it to your notebook and practise it in short games

One word today, and your vocabulary is already growing.`,
      cta: "Look up the first word",
      next: "Need help? Just reply to this email.",
    },
    "act-first-word-2": {
      subject: "One word, five minutes",
      body: `Hi {name},

A small idea for today: pick one word from a book, from homework or from the news, and look it up on Gadit.

In a minute you see every meaning of it, with a picture and examples, and it is saved to the notebook for practice.

That is how a vocabulary grows: one word at a time.`,
      cta: "Look up a word now",
      next: "Need help? Just reply to this email.",
    },
    "act-add-child": {
      subject: "One more step: add your child",
      body: `Hi {name},

Gadit Family is built around your kids, and no child has been added to the account yet. It takes a minute:

- Type your child's name and pick a character
- Connect a device of their own with no password, or use Kids Mode on your device
- From then on every word they look up is saved for them, and you see the progress on the parent dashboard`,
      cta: "Add a child",
      next: "Need help? Just reply to this email.",
    },
    "act-return-family": {
      subject: "A short start on Gadit, made for you",
      body: `Hi {name},

We want to make sure your kids get everything Gadit can give them. Here are three short steps to start this week:

- Add a child to the account, if you haven't yet (one minute)
- Look up one word together from a book or homework
- Open the games, which are made from the words your child saved`,
      cta: "Start now",
      next: "Want us to show you how it works? Reply to this email and we'll set up a short 10-minute call.",
    },
    "act-return-indiv": {
      subject: "A short start on Gadit, made for you",
      body: `Hi {name},

We want to make sure you get everything Gadit can give you. Here are three short steps to start this week:

- Look up one word you met today
- Save it to your notebook
- Practise your words in short games`,
      cta: "Look up a word",
      next: "Want us to show you how it works? Reply to this email and we'll set up a short 10-minute call.",
    },
  },
};

export const ACTIVATION_META: { key: ActivationKey; label: string; labelHe: string; hours: number }[] = [
  { key: "act-first-word-family", label: "First word · Family · trial day 1", labelHe: "המילה הראשונה · Family · יום 1 בניסיון", hours: 24 },
  { key: "act-first-word-indiv", label: "First word · Individual · trial day 1", labelHe: "המילה הראשונה · Individual · יום 1 בניסיון", hours: 24 },
  { key: "act-first-word-2", label: "First word again · trial day 3", labelHe: "המילה הראשונה, שוב · יום 3 בניסיון", hours: 72 },
  { key: "act-add-child", label: "Add a child · after 48 hours", labelHe: "הוסיפו ילד · אחרי 48 שעות", hours: 48 },
  { key: "act-return-family", label: "Quiet subscriber · Family (manual)", labelHe: "מנוי שקט · Family (ידני)", hours: 0 },
  { key: "act-return-indiv", label: "Quiet subscriber · Individual (manual)", labelHe: "מנוי שקט · Individual (ידני)", hours: 0 },
];

function toContent(m: Mail): EmailContent {
  return { subject: m.subject, heading: "", body: m.body, ctaText: m.cta, next: m.next, closing: "", helpText: "" };
}

export const ACTIVATION_CONTENT = Object.fromEntries(
  ACTIVATION_META.map((m) => [m.key, { he: toContent(BY_LANG.he[m.key]), en: toContent(BY_LANG.en[m.key]) }]),
) as Record<ActivationKey, { he: EmailContent; en: EmailContent }>;

export function isActivationKey(key: string | null | undefined): key is ActivationKey {
  return !!key && key in BY_LANG.he;
}

/** Where the button goes, in the person's language, tagged for analytics. */
export function activationUrl(lang: string, target: ActivationTarget, key: ActivationKey): string {
  const base = lang === "en" ? "https://www.gadit.app" : `https://www.gadit.app/${lang || "en"}`;
  const path = target === "add-child" ? "/family/add" : "/";
  return `${base}${path}?utm_source=activation&utm_medium=email&utm_campaign=activation&utm_content=${key}`;
}

export function renderActivationMail(
  c: EmailContent,
  opts: { lang: string; linkLang?: string; key: ActivationKey; target: ActivationTarget; firstName: string | null; unsubscribeUrl: string },
): { subject: string; html: string } {
  const fill = (s: string) => applyName(s, opts.firstName);
  // The "- " lines render as an ordered list in mdLite; these are bullets.
  const bodyHtml = mdLiteToHtml(opts.lang, fill(c.body)).replace(/<ol /g, "<ul ").replace(/<\/ol>/g, "</ul>");
  const base = opts.lang === "en" ? "https://www.gadit.app" : `https://www.gadit.app/${opts.lang}`;
  return {
    subject: fill(c.subject),
    html: renderEmailHtmlV2({
      he: opts.lang === "he",
      lang: opts.lang,
      bodyHtml,
      ctaText: c.ctaText,
      ctaUrl: activationUrl(opts.linkLang ?? opts.lang, opts.target, opts.key),
      next: fill(c.next ?? ""),
      closing: c.closing,
      signature: c.signature,
      helpText: c.helpText,
      helpUrl: `${base}/help`,
      unsubscribeUrl: opts.unsubscribeUrl,
    }),
  };
}

/** The editor's preview and test send: a sample name, the natural button. */
export function sampleActivationMail(key: ActivationKey, lang: string, c: EmailContent): { subject: string; html: string } {
  return renderActivationMail(c, {
    lang, key, target: key === "act-add-child" ? "add-child" : "search",
    firstName: lang === "he" ? "דנה" : "Dana", unsubscribeUrl: "https://www.gadit.app/",
  });
}
