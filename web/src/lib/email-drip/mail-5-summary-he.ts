import { layoutHe } from "./layout-he";

/**
 * Mail 5: Summary + upgrade invite + partner program (day 14).
 * Source: EMAIL_SEQUENCE_HE.md mail 15, lightly tightened: the
 * conversion email at the natural decision point.
 * Updated 2026-10-19: team voice, plural address, the current Individual
 * feature list, and one line about Family for parents.
 */
export function summaryHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">בשבועיים האחרונים למדנו להכיר את הצדדים השונים של מילה. את כל המשמעויות שלה, ואת ההיסטוריה שלה.</p>
    <p style="margin:0 0 16px;">לצד זה, הכרנו את היכולות שהופכות את Gadit לכלי שיכול להעמיק את ההבנה: מצב ילדים, ותמונה לכל משמעות.</p>
    <p style="margin:0 0 16px;">חלק מהיכולות פתוחות לכל משתמש. בחשבון החינמי יש 10 חיפושים ביום, ומחברת של עד 30 מילים.</p>
    <p style="margin:0 0 16px;">השאר נפתחות במסלול <strong>Individual</strong>: חיפושים ללא הגבלה, תמונה לכל משמעות, מחברת שבה כל מילה נשמרת עם תרגול חכם, משחקים וחידונים, &ldquo;כל מילה&rdquo; (מצלמים דף ולוחצים על כל מילה), &ldquo;תגיד את זה&rdquo; לתרגול הגייה, וחיבור משפט עם משוב. אם Gadit הפכה לחלק מהיומיום שלכם, אלה היכולות שעושות את ההבדל.</p>
    <p style="margin:0 0 16px;">יש לכם ילדים בבית? מסלול <a href="https://www.gadit.app/he/families?utm_source=email&amp;utm_medium=drip&amp;utm_campaign=summary" style="color:#0EA5A5;text-decoration:underline;">Family</a> מתאים לעד 5 ילדים, עם מצב ילדים ולוח הורה.</p>
    <p style="margin:0 0 16px;">ויש לנו גם תוכנית שותפים: לינק אישי שמזכה אתכם בעמלה על כל מי שנרשם ומשלם דרכו. דרך נוחה לחלוק עם חברים, וגם להרוויח בדרך.</p>
  `;

  const signature = `
    <p style="margin:0;">שלכם,</p>
    <p style="margin:0 0 14px;">הצוות של Gadit</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.6;">נ.ב. תמיד נשמח לשמוע על יכולות חדשות שהייתם רוצים לראות ב-Gadit. אפשר פשוט להשיב למייל הזה.</p>
  `;

  return {
    subject: "שבועיים, מילה אחת",
    preheader: "סיכום המסע, ושתי דרכים להמשיך מכאן.",
    html: layoutHe({
      preheader: "סיכום המסע, ושתי דרכים להמשיך מכאן.",
      bodyHtml,
      ctaText: "להכיר את Individual",
      ctaUrl: "https://www.gadit.app/he/pricing?utm_source=email&utm_medium=drip&utm_campaign=summary",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
