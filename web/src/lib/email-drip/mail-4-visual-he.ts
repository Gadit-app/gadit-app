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
    <p style="margin:0 0 16px;">אחת הבקשות שחזרו אליי הכי הרבה הייתה פשוטה. ילד שואל מה המילה הזאת אומרת, וההגדרה הרשמית מסובכת מדי בשבילו.</p>
    <p style="margin:0 0 16px;">לכן יש ב-Gadit מצב ילדים. מפעילים אותו, וכל מילה מוסברת בשפה של ילד בגיל חמש עד עשר. אותו עומק, בלי המילים הגדולות.</p>
    <p style="margin:0 0 16px;">ניקח את רוח. במצב הרגיל היא תוסבר בכמה רבדים. במצב ילדים היא תהפוך למשהו שילד תופס מיד, כמו האוויר שמרגישים על הפנים כשרצים.</p>
    <p style="margin:0 0 16px;">וזה לא רק לילדים. לפעמים, כשמילה ממש קשה, ההסבר הפשוט הוא בדיוק מה שגם מבוגרים צריכים כדי לתפוס אותה.</p>
    <p style="margin:0 0 16px;">בנוסף למצב ילדים, יש ב-Gadit גם אפשרות ליצירת תמונה שנותנת המחשה מלאה לילד על המילה. כך ההבנה נתפסת מהר יותר ונשארת יותר זמן.</p>
    <p style="margin:0 0 16px;">אם יש ילד בסביבה, כדאי לשבת איתו דקה, להפעיל את מצב הילדים, לחפש מילה יחד וליצור עבורה תמונה. ככה נראה הרגע שבו ההבנה מושגת בקלות.</p>
  `;

  const signature = `
    <p style="margin:0;">שלך,</p>
    <p style="margin:0;">גדי</p>
  `;

  return {
    subject: "מילה בגובה העיניים",
    preheader: "מצב ילדים: כל מילה מוסברת בשפה של ילד, בלי לוותר על העומק.",
    html: layoutHe({
      preheader: "מצב ילדים: כל מילה מוסברת בשפה של ילד, בלי לוותר על העומק.",
      bodyHtml,
      ctaText: "להפעיל את מצב הילדים",
      ctaUrl: "https://www.gadit.app/he?kids=1&utm_source=email&utm_medium=drip&utm_campaign=visual",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
