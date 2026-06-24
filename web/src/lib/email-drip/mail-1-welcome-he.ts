import { layoutHe } from "./layout-he";

/**
 * Mail 1 — Welcome (sent on day 0, immediately after signup).
 * Source: EMAIL_SEQUENCE_HE.md mail 1, lightly tightened.
 */
export function welcomeHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">כיף שהצטרפת ל-Gadit.</p>
    <p style="margin:0 0 16px;">Gadit הוא מילון עם מטרה אחת: לפצח מילה עד הסוף. לא הגדרה של שורה אחת, ולא תרגום יבש. אלא כל המשמעויות, הניבים, מקור המילה והדרכים שבהן באמת משתמשים במילה היום.</p>
    <p style="margin:0 0 16px;">כשתופסים מילה במלואה, הרעיון שמאחוריה מתבהר, ואיתו הדרך לחשוב, ללמוד ולקבל החלטות.</p>
    <p style="margin:0 0 16px;">ניקח מילה כמו &lsquo;רוח&rsquo;. רובנו נעצרים ב&ldquo;מה שמנשב בחוץ&rdquo;, אבל יש בה הרבה יותר, ואת זה נגלה יחד בשבועות הקרובים.</p>
    <p style="margin:0 0 16px;">Gadit היא פלטפורמה חיה שממשיכה לגדול. אם נתקלת בטעות באיזושהי הגדרה, דוגמה או כל חלק אחר, יש כפתור דיווח שכדאי ללחוץ עליו. אני קורא הכול.</p>
    <p style="margin:0 0 16px;">בכל מייל מכאן נכיר יכולת אחת של Gadit. אז שנתחיל?</p>
  `;

  const signature = `
    <p style="margin:0;">גדי</p>
    <p style="margin:0;color:#6B7280;font-size:14px;">מייסד, Gadit</p>
  `;

  return {
    subject: "ברוכים הבאים ל-Gadit",
    preheader: "מילון אחד במטרה אחת. לפצח מילה עד הסוף. הנה איך מתחילים.",
    html: layoutHe({
      preheader: "מילון אחד במטרה אחת. לפצח מילה עד הסוף. הנה איך מתחילים.",
      bodyHtml,
      ctaText: "לחפש מילה ראשונה",
      ctaUrl: "https://www.gadit.app/he?utm_source=email&utm_medium=drip&utm_campaign=welcome",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
