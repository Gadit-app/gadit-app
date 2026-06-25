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
    <p style="margin:0 0 16px;">זו ההודעה האחרונה ברצף הזה.</p>
    <p style="margin:0 0 16px;">לאורך שבועיים הכרנו את כל הפנים של מילה, את ההיסטוריה שלה, את מצב הילדים, ואת היכולת ליצור עבורה תמונה.</p>
    <p style="margin:0 0 16px;">חלק מהיכולות פתוחות לכל משתמש, וחלק נפתחות במסלולים Clear ו-Deep. שם יש חיפושים בלי הגבלה, תמונות מתוך המילון, חיבור משפט, השוואת מילים ותרגול חכם. אם Gadit הפכה לחלק מהיומיום, אלה היכולות שעושות את ההבדל.</p>
    <p style="margin:0 0 16px;">ולמנויי Clear ו-Deep יש גם לינק אישי שמזכה אותך בעמלה על כל מי שנרשם דרכו. דרך נוחה לחלוק עם חברים, וגם להרוויח בדרך.</p>
  `;

  const signature = `
    <p style="margin:0;">שלך,</p>
    <p style="margin:0 0 4px;">גדי</p>
    <p style="margin:0 0 14px;color:#6B7280;font-size:14px;">מייסד, Gadit</p>
    <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.6;">נ.ב. תמיד אשמח לשמוע על פיצ'רים חדשים שהיית רוצה לראות באפליקציה. אפשר פשוט להגיב למייל הזה.</p>
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
