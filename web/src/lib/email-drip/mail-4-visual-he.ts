import { layoutHe } from "./layout-he";

/**
 * Mail 4 — Kids mode + image (day 9). Combines source mails 9 and 12
 * into a single "tools that make a hard word easy to grasp" angle.
 * Parent-centric copy because it's Gadi's strongest reader segment.
 */
export function visualHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">לפעמים מילה צריכה שתי דרכים להיכנס.</p>
    <p style="margin:0 0 16px;">אחת הבקשות שחזרו אליי הכי הרבה הייתה פשוטה. ילד שואל מה המילה הזאת אומרת, וההגדרה הרשמית מסובכת מדי בשבילו. לכן יש ב-Gadit מצב ילדים. מפעילים אותו, וכל מילה מוסברת בשפה של ילד בגיל חמש עד עשר. אותו עומק, בלי המילים הגדולות.</p>
    <p style="margin:0 0 16px;">ניקח את רוח. במצב הרגיל היא תוסבר בכמה רבדים. במצב ילדים היא תהפוך למשהו שילד תופס מיד, כמו האוויר שמרגישים על הפנים כשרצים.</p>
    <p style="margin:0 0 16px;">וזה לא רק לילדים. לפעמים, כשמילה ממש קשה, ההסבר הפשוט הוא בדיוק מה שגם מבוגרים צריכים כדי לתפוס אותה.</p>
    <p style="margin:0 0 16px;">לצד מצב ילדים, יש ב-Gadit עוד ערוץ של הבנה: תמונה אוטומטית. למילים שקשה לדמיין, מופיעה תמונה לצד ההגדרה. שני ערוצים מקבילים שמגיעים לאותו מקום, וההבנה נתפסת מהר יותר ונשארת יותר זמן.</p>
    <p style="margin:0 0 16px;">אם יש ילד בסביבה, כדאי לשבת איתו דקה, להפעיל את המצב הזה, ולחפש מילה יחד. ככה נראה הרגע שבו הבנה נכנסת בקלות.</p>
  `;

  const signature = `<p style="margin:0;">גדי</p>`;

  return {
    subject: "מילה בגובה העיניים",
    preheader: "מצב ילדים ותמונה אוטומטית. שני ערוצים שמקלים על מילה קשה.",
    html: layoutHe({
      preheader: "מצב ילדים ותמונה אוטומטית. שני ערוצים שמקלים על מילה קשה.",
      bodyHtml,
      ctaText: "להפעיל את מצב הילדים",
      ctaUrl: "https://www.gadit.app/he?kids=1&utm_source=email&utm_medium=drip&utm_campaign=visual",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
