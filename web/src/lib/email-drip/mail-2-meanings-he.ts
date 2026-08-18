import { layoutHe } from "./layout-he";

/**
 * Mail 2 — Multiple meanings + examples (day 2).
 * Source: EMAIL_SEQUENCE_HE.md mail 2.
 */
export function meaningsHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">בוא ניקח את המילה רוח, ונראה איך מילה אחת יכולה לפתוח עולם שלם.</p>
    <p style="margin:0 0 16px;">רוח היא האוויר שנע סביבנו. היא גם הנשימה, רוח החיים שבתוכנו. היא הצד הפנימי של האדם, מה שקוראים רוח האדם. היא מצב נפשי, כשאומרים שמצב הרוח טוב. היא כיוון, ארבע רוחות השמים. ולפעמים היא משהו שחומק, רוח רפאים.</p>
    <p style="margin:0 0 16px;">מילה אחת, שכבות שלא ראית בה, וכל אחת חיה בעולם משלה.</p>
    <p style="margin:0 0 16px;">ב-Gadit תמצא שלוש דוגמאות אמיתיות לכל הגדרה. משפטים שבהם המילה עובדת בפועל, לא בתיאוריה. ככה נחשפים לא רק למה שהמילה אומרת, אלא לאיך היא נשמעת כשמשתמשים בה.</p>
    <p style="margin:0 0 16px;">זה הלב של Gadit. מילה אחת, עד הסוף, על כל ההגדרות שלה.</p>
    <p style="margin:0 0 16px;">ממליץ לך לנסות את רוח, ואולי עוד מילה שנראית לך מובנת. יכול להיות שתהיה לך הפתעה.</p>
  `;

  const signature = `
    <p style="margin:0;">שלך,</p>
    <p style="margin:0 0 12px;">גדי</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.6;">נ.ב. כשמצאת משמעות מפתיעה, יש כפתור שיתוף לידה. שווה לשלוח אותה למישהו שיעריך.</p>
  `;

  return {
    subject: "מילה אחת, שכבות שלא ראית בה",
    preheader: "רוב הכלים עוצרים בהגדרה. Gadit ממשיך עד שהמילה נכנסת.",
    html: layoutHe({
      preheader: "רוב הכלים עוצרים בהגדרה. Gadit ממשיך עד שהמילה נכנסת.",
      bodyHtml,
      ctaText: 'לחפש "רוח" ולראות את כל הפנים',
      ctaUrl: "https://www.gadit.app/he/word/%D7%A8%D7%95%D7%97?utm_source=email&utm_medium=drip&utm_campaign=meanings",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
