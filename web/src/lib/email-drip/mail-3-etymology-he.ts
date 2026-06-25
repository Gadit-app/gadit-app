import { layoutHe } from "./layout-he";

/**
 * Mail 3 — Etymology (day 5).
 * Source: EMAIL_SEQUENCE_HE.md mail 4.
 */
export function etymologyHe(opts: { displayName?: string; unsubscribeUrl: string }) {
  const name = opts.displayName?.trim() || "";
  const greeting = name ? `היי ${name},` : "היי,";

  const bodyHtml = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">הגענו לחלק האהוב עליי, מאיפה המילה הגיעה.</p>
    <p style="margin:0 0 16px;">לכל מילה יש עבר. ולפעמים העבר הזה מסביר את ההווה שלה טוב יותר מכל הגדרה.</p>
    <p style="margin:0 0 16px;">רוח היא דוגמה יפה. השורש שלה, ר.ו.ח, הוא אחד העתיקים בשפות השמיות, ומשמעותו המקורית קשורה לנשיבה ולתנועת אוויר. הוא חי באותה צורה גם בערבית: رُوح (rūḥ) זו רוח של אדם, ו-رِيح (rīḥ) זו רוח של אוויר. בעברית הוא מופיע כבר בפסוק השני של בראשית, &ldquo;ורוח אלוהים מרחפת על פני המים&rdquo;.</p>
    <p style="margin:0 0 16px;">מהאוויר הפיזי הזה צמחה הנשימה, רוח החיים. ומהנשימה צמח משהו מופשט יותר, רוח האדם, הצד הפנימי שלו.</p>
    <p style="margin:0 0 16px;">מסע שלם בעין אחת. מהדבר הכי גשמי, אוויר שנע, עד הדבר הכי לא גשמי, רוח של אדם. הכול במילה אחת, שנשארה איתנו אלפי שנים.</p>
    <p style="margin:0 0 16px;">מי שיודע את זה לא רק זוכר את המילה טוב יותר. הוא גם מבין למה כל המשמעויות שלה קשורות זו לזו. הן לא חיות יחד במקרה.</p>
    <p style="margin:0 0 16px;">ב-Gadit, מתחת להגדרות של כל מילה יש חלק שמסביר את המקור שלה. הרקע ההיסטורי, מאיפה היא הגיעה. זה מה שהופך מילון מרשימה של הגדרות לסיפור.</p>
  `;

  const signature = `
    <p style="margin:0;">שלך,</p>
    <p style="margin:0;">גדי</p>
  `;

  return {
    subject: "מאיפה מילה באמת באה",
    preheader: "לכל מילה יש עבר, ולפעמים הוא מסביר את ההווה שלה.",
    html: layoutHe({
      preheader: "לכל מילה יש עבר, ולפעמים הוא מסביר את ההווה שלה.",
      bodyHtml,
      ctaText: "לגלות את מקור המילה הבאה",
      ctaUrl: "https://www.gadit.app/he?utm_source=email&utm_medium=drip&utm_campaign=etymology",
      unsubscribeUrl: opts.unsubscribeUrl,
      signature,
    }),
  };
}
