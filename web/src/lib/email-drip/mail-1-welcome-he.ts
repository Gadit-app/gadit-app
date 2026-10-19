import { layoutHe } from "./layout-he";

/**
 * Mail 1: Welcome (sent on day 0, immediately after signup).
 * Source: EMAIL_SEQUENCE_HE.md mail 1, lightly tightened.
 * Updated 2026-10-19: team voice (no first person singular), plural address,
 * current free-account facts (10 searches a day, notebook of up to 30 words).
 */
export function welcomeHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">ברוכים הבאים ל-Gadit, ותודה שנרשמתם.</p>
    <p style="margin:0 0 16px;">Gadit הוא מילון עם מטרה אחת: להבין מילה עד הסוף. לא רק הגדרה, אלא גם כל המשמעויות, דוגמאות חיות, ניבים ומקור המילה.</p>
    <p style="margin:0 0 16px;">בחשבון החינמי שלכם יש 10 חיפושים ביום, ומחברת שבה נשמרות עד 30 מילים.</p>
    <p style="margin:0 0 16px;">כשתופסים מילה במלואה, הרעיון שמאחוריה מתבהר, ואיתו הדרך לחשוב, ללמוד ולקבל החלטות.</p>
    <p style="margin:0 0 16px;">Gadit היא פלטפורמה חיה שממשיכה לגדול. אם נתקלתם בטעות בהגדרה, בדוגמה או בכל חלק אחר, יש כפתור דיווח שכדאי ללחוץ עליו. הצוות שלנו קורא הכול ומתקן.</p>
    <p style="margin:0 0 16px;">אז שנתחיל?</p>
  `;

  const signature = `
    <p style="margin:0;">שלכם,</p>
    <p style="margin:0;">הצוות של Gadit</p>
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
