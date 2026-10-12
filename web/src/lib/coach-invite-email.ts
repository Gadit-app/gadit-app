/**
 * The email a coach gets when a parent adds them (Gadi 2026-10-12, before the
 * Zoom with the coaching course alumni): until now nobody told the coach, and
 * /coach was linked from nowhere. Who added them, which child, three steps,
 * one button to /coach. Hebrew when the parent uses Hebrew, else English.
 * Transactional: sent at once, also on Shabbat (an action the parent took).
 */
import { sendMail } from "@/lib/mail";
import { mdLiteToHtml, renderEmailHtmlV2 } from "@/lib/email-drip/render";

const BASE = "https://www.gadit.app";

export async function sendCoachInvite(opts: { to: string; parentName: string; childName: string; lang: string }): Promise<void> {
  const he = opts.lang === "he";
  const parent = opts.parentName || (he ? "הורה" : "A parent");
  const child = opts.childName || (he ? "הילד" : "their child");
  const link = `${BASE}${he ? "/he" : ""}/coach`;
  const subject = he ? `${parent} הוסיפ/ה אתכם כמאמנים של ${child} ב-Gadit` : `${parent} added you as ${child}'s coach on Gadit`;
  const body = he
    ? `שלום,

${parent} נתנ/ה לכם גישה לפרופיל של **${child}** ב-Gadit, כדי שתוכלו לעבוד עם המילים שלו/ה במהלך השיעורים.

## איך נכנסים
1. פותחים את [עמוד המאמנים](/coach).
2. נכנסים עם כתובת המייל הזו: **${opts.to}**. אם עוד אין לכם חשבון, אפשר לפתוח אחד בחינם, עם אותה כתובת.
3. לוחצים על ${child}, ונכנסים לפרופיל שלו/ה: מוסיפים מילים לאוצר המילים, מתרגלים יחד ומשחקים.

כשמסיימים, לוחצים "יציאה" בראש המסך וחוזרים לעמוד המאמנים.
ההורה יכול/ה לבטל את הגישה בכל רגע.`
    : `Hi,

${parent} gave you access to **${child}**'s profile on Gadit, so you can work with their words during your sessions.

## How to get in
1. Open the [coach page](/coach).
2. Sign in with this email address: **${opts.to}**. No account yet? You can open one for free, with the same address.
3. Tap ${child} to enter their profile: add words to the notebook, practise together and play.

When you're done, tap "Exit" at the top of the screen to return to the coach page.
The parent can remove the access at any time.`;
  const html = renderEmailHtmlV2({
    he,
    lang: he ? "he" : "en",
    bodyHtml: mdLiteToHtml(he ? "he" : "en", body.replaceAll("](/coach)", `](${link})`)),
    ctaText: he ? "לעמוד המאמנים" : "Open the coach page",
    ctaUrl: link,
    helpUrl: `${BASE}${he ? "/he" : ""}/help`,
    unsubscribeUrl: "",
  });
  await sendMail({ from: "Gadit <gadi@gadit.app>", replyTo: "gadi@gadit.app", to: opts.to, subject, html });
}
