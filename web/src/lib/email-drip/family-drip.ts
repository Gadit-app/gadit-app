/**
 * Family onboarding email series. Fires AFTER a Family subscription
 * activates (keyed on the user doc's `familyActivatedAt`), separate from
 * the general signup drip. Three emails walk a new Family parent through
 * the setup: connect the kids, turn on alerts, and how it all works.
 *
 * Day 0 is the "welcome" email sent live from the webhook
 * (sendFamilyWelcome). This sequence covers days 1-3.
 *
 * Localised he / en (matches the rest of the drip system); everything
 * else falls back to English. No em-dashes; Hebrew is gender-neutral
 * singular (fits a father or a mother).
 */

export type FamilyDripMail = {
  key: string;
  dayOffset: number;
  build(opts: { he: boolean; unsubscribeUrl: string }): { subject: string; html: string };
};

const BASE = "https://www.gadit.app";

function shell(
  he: boolean,
  parts: { eyebrow: string; heading: string; bodyHtml: string; ctaText: string; ctaUrl: string; foot: string; unsubscribeUrl: string },
): string {
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";
  // dir is repeated on every block because Gmail drops it from <html>/<body>.
  return `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div dir="${dir}" style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #E5E7EB;overflow:hidden;text-align:${align};">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:26px 24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;" dir="ltr">GADIT FAMILY</div>
      <div dir="${dir}" style="text-align:${align};font-size:22px;font-weight:700;margin-top:6px;">${parts.heading}</div>
    </div>
    <div dir="${dir}" style="padding:24px;text-align:${align};">
      <div dir="${dir}" style="text-align:${align};font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#0EA5A5;margin:0 0 10px;">${parts.eyebrow}</div>
      ${parts.bodyHtml}
      <div style="text-align:center;margin-top:22px;">
        <a href="${parts.ctaUrl}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:650;font-size:15px;">${parts.ctaText}</a>
      </div>
      <p dir="${dir}" style="text-align:${align};font-size:13px;color:#6B7280;line-height:1.5;margin:22px 0 0;">${parts.foot}</p>
      <p dir="${dir}" style="text-align:${align};font-size:11px;color:#B4B4B4;margin:16px 0 0;"><a href="${parts.unsubscribeUrl}" style="color:#B4B4B4;">${he ? "להסרה מרשימת התפוצה" : "Unsubscribe"}</a></p>
    </div>
  </div>
</body></html>`;
}

// dir + text-align go on EACH paragraph, not just the container: Gmail
// strips dir off <html>/<body>, so without this Hebrew paragraphs fall back
// to LTR and sentence-final periods land on the wrong (right) side.
const p = (he: boolean, html: string) =>
  `<p dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:15px;line-height:1.7;margin:0 0 14px;color:#374151;">${html}</p>`;

// Section heading inside the body.
const h = (he: boolean, text: string) =>
  `<div dir="${he ? "rtl" : "ltr"}" style="text-align:${he ? "right" : "left"};font-size:16px;font-weight:800;color:#1C1917;margin:20px 0 8px;">${text}</div>`;

// Numbered steps (1, 2, 3). RTL-safe (padding + dir per element, Gmail-proof).
const steps = (he: boolean, items: string[]) =>
  `<ol dir="${he ? "rtl" : "ltr"}" style="margin:0 0 14px;padding-${he ? "right" : "left"}:22px;text-align:${he ? "right" : "left"};font-size:15px;line-height:1.75;color:#374151;">` +
  items.map((it) => `<li style="margin-bottom:7px;">${it}</li>`).join("") +
  `</ol>`;

// ── Email 1 (day 1): connect the kids + switching between users ──
function connectKids({ he, unsubscribeUrl }: { he: boolean; unsubscribeUrl: string }) {
  const link = (he ? `${BASE}/he/family` : `${BASE}/family`) + "?tab=members";
  if (he) {
    return {
      subject: "צעד 1: לחבר את הילדים ל-Gadit",
      html: shell(true, {
        eyebrow: "הקמה, צעד 1 מתוך 3",
        heading: "לחבר את הילדים",
        unsubscribeUrl,
        bodyHtml:
          p(true, 'ב-<span dir="ltr">Gadit Family</span> כל ילד מחפש מילים במכשיר שלו, וההורה רואה את כל ההתקדמות במקום אחד.') +
          p(true, "לוח בקרה אחד מרכז את כל הילדים יחד: מה כל אחד למד וכמה מילים נוספו השבוע.") +
          h(true, "איך מחברים ילד") +
          steps(true, [
            "בלוח הבקרה של המשפחה נכנסים ל<b>בני המשפחה</b> ומוסיפים ילד עם שם.",
            "לוחצים <b>חיבור מכשיר</b> ומקבלים קוד קצר.",
            'במכשיר של הילד (טלפון, טאבלט או מחשב) פותחים את <span dir="ltr">Gadit</span> ומזינים את הקוד. בלי סיסמה ובלי אימייל לילד.',
          ]) +
          p(true, "המכשיר מחובר, והמילים שהילד מחפש מתחילות להופיע בלוח הבקרה.") +
          h(true, "מעבר בין משתמשים") +
          p(true, "בכל מכשיר אפשר להחליף פרופיל, כך שגם אם שני ילדים חולקים טאבלט, כל אחד רואה את המילים והמשחקים שלו."),
        ctaText: "לחבר את הילדים",
        ctaUrl: link,
        foot: "יש שאלה? אפשר פשוט להשיב למייל הזה.",
      }),
    };
  }
  return {
    subject: "Step 1: connect your kids to Gadit",
    html: shell(false, {
      eyebrow: "Setup, step 1 of 3",
      heading: "Connect your kids",
      unsubscribeUrl,
      bodyHtml:
        p(false, "In Gadit Family, every child looks words up on their own device, and the parent sees all the progress in one place.") +
        p(false, "One dashboard brings all the kids together: what each has learned and how many words were added this week.") +
        h(false, "How to connect a child") +
        steps(false, [
          "In the family dashboard open <b>Family</b> and add a child with a name.",
          "Tap <b>Connect device</b> and you get a short code.",
          "On the child's device (phone, tablet or computer) open Gadit and enter the code. No password, no email for the child.",
        ]) +
        p(false, "The device is linked, and the words they look up start showing on the dashboard.") +
        h(false, "Switching between users") +
        p(false, "Any device can switch profile, so even if two kids share one tablet, each sees their own words and games."),
      ctaText: "Connect your kids",
      ctaUrl: link,
      foot: "Have a question? Just reply to this email.",
    }),
  };
}

// ── Email 2 (day 2): turn on alerts ──
function turnOnAlerts({ he, unsubscribeUrl }: { he: boolean; unsubscribeUrl: string }) {
  const link = (he ? `${BASE}/he/family` : `${BASE}/family`) + "?tab=settings";
  if (he) {
    return {
      subject: "צעד 2: לקבל התראה כשהילד מחפש מילה",
      html: shell(true, {
        eyebrow: "הקמה, צעד 2 מתוך 3",
        heading: "להפעיל התראות",
        unsubscribeUrl,
        bodyHtml:
          p(true, "אפשר לקבל התראה בכל פעם שילד מחפש מילה במילון, עם המילה עצמה. זו דרך שקטה לראות מה מסקרן את הילד ובמה הוא מתקשה.") +
          h(true, "איך מפעילים") +
          steps(true, [
            "בלוח הבקרה של המשפחה נכנסים ל<b>הגדרות</b>.",
            "מדליקים את <b>התראות על מילים</b>.",
            "בוחרים בין התראה על כל מילה לבין סיכום אחד בסוף היום.",
          ]) +
          p(true, 'ההתראה מגיעה למייל תמיד, וגם כבאנר לטלפון. כדי לקבל את הבאנר בטלפון, פותחים את <span dir="ltr">Gadit</span> מהמסך הבית ולוחצים <b>הפעל התראות במכשיר הזה</b>. כל מכשיר צריך הפעלה פעם אחת.'),
        ctaText: "להפעיל התראות",
        ctaUrl: link,
        foot: "אפשר לכבות בכל רגע, ולבחור בין מיידי לסיכום יומי בכל זמן.",
      }),
    };
  }
  return {
    subject: "Step 2: get an alert when your child looks up a word",
    html: shell(false, {
      eyebrow: "Setup, step 2 of 3",
      heading: "Turn on alerts",
      unsubscribeUrl,
      bodyHtml:
        p(false, "You can get an alert every time a child looks up a word, with the word itself. It's a quiet window into what they're curious about and where they struggle.") +
        h(false, "How to turn it on") +
        steps(false, [
          "In the family dashboard open <b>Settings</b>.",
          "Switch on <b>Word alerts</b>.",
          "Choose between an alert for every word or one summary at the end of the day.",
        ]) +
        p(false, "Alerts always arrive by email, and as a phone banner too. To get the banner on your phone, open Gadit from the home screen and tap <b>Turn on alerts on this device</b>. Each device needs turning on once."),
      ctaText: "Turn on alerts",
      ctaUrl: link,
      foot: "You can turn it off any time, and switch between instant and a daily summary whenever you like.",
    }),
  };
}

// ── Email 3 (day 3): how it all works + the notebook ──
function howItWorks({ he, unsubscribeUrl }: { he: boolean; unsubscribeUrl: string }) {
  const link = he ? `${BASE}/he/family` : `${BASE}/family`;
  if (he) {
    return {
      subject: "צעד 3: איך הכל עובד, ואיפה רואים מה הילד לומד",
      html: shell(true, {
        eyebrow: "הקמה, צעד 3 מתוך 3",
        heading: "איך הכל עובד",
        unsubscribeUrl,
        bodyHtml:
          p(true, 'הנה כל המסע במשפט אחד: הילד נתקל במילה שלא מובנת, מחפש אותה ב-<span dir="ltr">Gadit</span>, ומקבל את כל המשמעויות, דוגמאות, ותמונה שמסבירה, בשפה שלו.') +
          h(true, "כל מילה נשמרת לבד") +
          p(true, "כל מילה שהילד מחפש נשמרת אוטומטית למחברת שלו. הילד לא צריך ללחוץ על כלום, ואוסף המילים גדל מעצמו.") +
          h(true, "איפה רואים את ההתקדמות") +
          p(true, 'בלוח הבקרה של המשפחה, בעמוד הראשי. לכל ילד יש כרטיס עם מספר המילים שלמד, כמה נוספו השבוע, והמילים האחרונות שחיפש. יש גם פיד של חיפושים אחרונים עם השעה. ככה <span dir="ltr">Gadit</span> הופך ממילון ל<b>תעודה חיה</b> של אוצר המילים של הילד.') +
          p(true, 'זה בדיוק ההבדל בין <span dir="ltr">Gadit</span> ל-<span dir="ltr">ChatGPT</span>: שיחה נעלמת, ואילו <span dir="ltr">Gadit</span> נאגר ומראה את הגדילה.'),
        ctaText: "לראות את ההתקדמות",
        ctaUrl: link,
        foot: "כיף לראות את אוצר המילים של הילד גדל שבוע אחרי שבוע.",
      }),
    };
  }
  return {
    subject: "Step 3: how it all works, and where you see what your child learns",
    html: shell(false, {
      eyebrow: "Setup, step 3 of 3",
      heading: "How it all works",
      unsubscribeUrl,
      bodyHtml:
        p(false, "Here's the whole journey in one line: your child hits a word they don't get, looks it up in Gadit, and gets all its meanings, examples and a picture that explains it, in their language.") +
        h(false, "Every word saves itself") +
        p(false, "Every word your child looks up is saved to their notebook automatically. They never have to tap a thing, and their word collection just grows.") +
        h(false, "Where you see the progress") +
        p(false, "The family dashboard home page. Each child has a card with how many words they've learned, how many were added this week, and their most recent lookups. There's also a live feed of recent searches with the time. That's how Gadit turns from a dictionary into a <b>living report card</b> of your child's vocabulary.") +
        p(false, "That's the difference between Gadit and ChatGPT: a conversation vanishes, Gadit accumulates and shows the growth."),
      ctaText: "See the progress",
      ctaUrl: link,
      foot: "Enjoy watching your child's vocabulary grow, week after week.",
    }),
  };
}

export const FAMILY_DRIP: FamilyDripMail[] = [
  { key: "fam-connect", dayOffset: 1, build: connectKids },
  { key: "fam-alerts", dayOffset: 2, build: turnOnAlerts },
  { key: "fam-how", dayOffset: 3, build: howItWorks },
];
