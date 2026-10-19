import { layoutHe } from "./layout-he";

/**
 * Mail 4: Kids Mode + picture (day 9). Combines source mails 9 and 12
 * into a single "tools that make a hard word easy to grasp" angle.
 * Parent-centric copy because parents are the strongest reader segment.
 * Updated 2026-10-19: team voice, plural address, and the current plan
 * facts (Kids Mode is a Family tool; a picture for every meaning comes with
 * Individual and Family).
 */
export function visualHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">אחת הבקשות שחזרו אלינו הכי הרבה הייתה פשוטה. ילד שואל מה המילה הזאת אומרת, וההגדרה הרשמית מסובכת מדי בשבילו.</p>
    <p style="margin:0 0 16px;">לכן יש ב-Gadit מצב ילדים. מפעילים אותו, וכל מילה מוסברת בשפה של ילד בגיל חמש עד עשר. אותו עומק, בלי המילים הגדולות.</p>
    <p style="margin:0 0 16px;">ניקח את רוח. במצב הרגיל היא תוסבר בכמה רבדים. במצב ילדים היא תהפוך למשהו שילד תופס מיד, כמו האוויר שמרגישים על הפנים כשרצים.</p>
    <p style="margin:0 0 16px;">וזה לא רק לילדים. לפעמים, כשמילה ממש קשה, ההסבר הפשוט הוא בדיוק מה שגם מבוגרים צריכים כדי לתפוס אותה.</p>
    <p style="margin:0 0 16px;">בנוסף למצב ילדים, יש ב-Gadit גם תמונה לכל משמעות, שנותנת לילד המחשה מלאה של המילה. כך ההבנה נתפסת מהר יותר ונשארת יותר זמן.</p>
    <p style="margin:0 0 16px;">מצב ילדים כלול במסלול Family, שבנוי למשפחות עם ילדים. תמונה לכל משמעות כלולה גם במסלול Individual.</p>
    <p style="margin:0 0 16px;">אם יש ילד בסביבה, כדאי לשבת איתו דקה, להפעיל את מצב הילדים, לחפש מילה יחד ולהסתכל על התמונה שלה. ככה נראה הרגע שבו ההבנה מושגת בקלות.</p>
  `;

  const signature = `
    <p style="margin:0;">שלכם,</p>
    <p style="margin:0;">הצוות של Gadit</p>
  `;

  return {
    subject: "מילה בגובה העיניים",
    preheader: "מצב ילדים: כל מילה מוסברת בשפה של ילד, בלי לוותר על העומק.",
    html: layoutHe({
      preheader: "מצב ילדים: כל מילה מוסברת בשפה של ילד, בלי לוותר על העומק.",
      bodyHtml,
      ctaText: "להכיר את מצב הילדים",
      ctaUrl: "https://www.gadit.app/he/families?utm_source=email&utm_medium=drip&utm_campaign=visual",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
