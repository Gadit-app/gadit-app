import { layoutHe } from "./layout-he";

/**
 * Mail 5 — Summary + upgrade invite + affiliate (day 14).
 * Source: EMAIL_SEQUENCE_HE.md mail 15, lightly tightened — the
 * conversion email at the natural decision point.
 */
export function summaryHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">בפעם האחרונה ברצף הזה. שבועיים, כמה יכולות, ומילה אחת בכל פעם.</p>
    <p style="margin:0 0 16px;">הכרנו את כל הפנים של מילה. את ההיסטוריה שלה. את מצב הילדים, ואת הדרך הוויזואלית להבין אותה. הכול התחיל ממילה אחת, רוח, ומהרעיון הפשוט שמילה מובנת עד הסוף משנה את האופן שבו רואים את העולם.</p>
    <p style="margin:0 0 16px;">חלק מהיכולות שעלו פתוחות לכל אחד. חלק נפתחות במסלולים Clear ו-Deep. שם יש חיפושים בלי הגבלה, מצב ילדים, תמונות, חיבור משפט, תרגול חכם והשוואת מילים. אם Gadit הפכה לחלק מהיומיום, כדאי להכיר אותם.</p>
    <p style="margin:0 0 16px;">ועוד דבר. אם Gadit עוזרת, אולי היא תעזור גם למישהו אחר. למנויי Clear ו-Deep יש לינק אישי. כל מי שנרשם דרכו מזכה את בעל הלינק בעמלה. שיתוף של משהו אהוב, וזה חוזר בחזרה.</p>
    <p style="margin:0 0 16px;">תודה על הליווי עד כאן. מכאן הדרך פתוחה.</p>
  `;

  const signature = `
    <p style="margin:0;">שלך,</p>
    <p style="margin:0;">גדי</p>
    <p style="margin:0;color:#6B7280;font-size:14px;">מייסד, Gadit</p>
  `;

  return {
    subject: "שבועיים, מילה אחת",
    preheader: "סיכום המסע, ושתי דרכים להמשיך מכאן.",
    html: layoutHe({
      preheader: "סיכום המסע, ושתי דרכים להמשיך מכאן.",
      bodyHtml,
      ctaText: "להכיר את Clear ו-Deep",
      ctaUrl: "https://www.gadit.app/he/pricing?utm_source=email&utm_medium=drip&utm_campaign=summary",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
