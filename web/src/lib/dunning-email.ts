import { emailHeaderHtml, EMAIL_BG, EMAIL_CARD_MAX } from "@/lib/email-brand";
/**
 * Failed-renewal ("dunning") emails, shared by the Stripe webhook (first
 * email, on invoice.payment_failed) and the daily grace cron (one reminder on
 * day 5 of the 7-day grace window). Stripe's own failed-payment email is OFF
 * (Gadi 2026-09-30), so these are the only ones the customer gets.
 *
 * The button links to the invoice's hosted page: the customer pays the open
 * invoice with a new card on the spot, and because every live subscription has
 * payment_settings.save_default_payment_method = "on_subscription", that card
 * becomes the subscription's card for future renewals too.
 */

/** Hebrew for a Hebrew-UI user, a shekel invoice, or (UI language unknown) an
 *  Israeli account; English for everyone else. */
export function dunningIsHebrew(
  user: { uiLang?: unknown; country?: unknown },
  invoice: { currency?: string | null; country?: string | null },
): boolean {
  return (
    user.uiLang === "he" ||
    invoice.currency === "ils" ||
    (!user.uiLang && (user.country === "IL" || invoice.country === "IL"))
  );
}

export function buildDunningEmail(opts: {
  he: boolean;
  url: string;
  kind: "first" | "reminder";
  /** Whole days of access left (reminder only). */
  daysLeft?: number;
}): { subject: string; html: string } {
  const { he, url, kind } = opts;
  const days = Math.max(1, opts.daysLeft ?? 2);
  const first = kind === "first";

  const t = he
    ? {
        subject: first
          ? "החיוב לא עבר. יש לך 7 ימים לעדכן כרטיס"
          : `תזכורת: נשארו ${days} ימים לעדכן את הכרטיס`,
        h1: first ? "החיוב על המנוי לא עבר" : "הכרטיס עדיין לא עודכן",
        p1: first
          ? "ניסינו לחדש את המנוי שלך ב-Gadit והחיוב לא עבר, כנראה הכרטיס נדחה או פג תוקף."
          : "החיוב על המנוי שלך ב-Gadit עדיין לא עבר.",
        p2: first
          ? "<b>הגישה שלך נשמרת ל-7 ימים.</b> עדכון הכרטיס לוקח פחות מדקה, והכל ממשיך כרגיל, בלי לאבד את המחברות וההתקדמות של הילדים."
          : `<b>בעוד ${days} ימים הגישה יורדת למסלול החינמי.</b> עדכון הכרטיס לוקח פחות מדקה, והמחברות וההתקדמות של הילדים נשמרות.`,
        cta: "עדכון כרטיס",
        foot: "אם כבר עדכנת, אפשר להתעלם מהמייל הזה. אם משהו לא ברור, אפשר פשוט להשיב למייל ואנחנו כאן.",
        sign: "צוות Gadit",
        dir: "rtl",
      }
    : {
        subject: first
          ? "Your payment didn't go through. You have 7 days to update your card"
          : `Reminder: ${days} ${days === 1 ? "day" : "days"} left to update your card`,
        h1: first ? "Your subscription payment didn't go through" : "Your card still needs updating",
        p1: first
          ? "We tried to renew your Gadit subscription and the charge didn't go through, most likely a declined or expired card."
          : "The payment for your Gadit subscription still hasn't gone through.",
        p2: first
          ? "<b>Your access stays on for 7 days.</b> Updating your card takes less than a minute, and everything continues as usual, without losing your children's notebooks and progress."
          : `<b>In ${days} ${days === 1 ? "day" : "days"} your access moves to the free plan.</b> Updating your card takes less than a minute, and your children's notebooks and progress are kept.`,
        cta: "Update card",
        foot: "If you already updated it, you can ignore this email. If anything isn't clear, just reply and we're here.",
        sign: "The Gadit team",
        dir: "ltr",
      };

  const html = `
        <div style="margin:0;padding:28px 12px;background:${EMAIL_BG};">
        <div dir="${t.dir}" style="font-family:Rubik,Arial,sans-serif;max-width:${EMAIL_CARD_MAX}px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E1EAE7;overflow:hidden;color:#1f2937;line-height:1.7;">
          ${emailHeaderHtml()}
          <div style="padding:28px 36px 26px;font-size:16px;">
          <h1 style="font-size:20px;font-weight:700;color:#0B1220;margin:0 0 12px;">${t.h1}</h1>
          <p style="margin:0 0 12px;">${t.p1}</p>
          <p style="margin:0 0 18px;">${t.p2}</p>
          <p style="margin:0 0 22px;">
            <a href="${url}" style="display:inline-block;background:#0EA5A5;color:#fff;font-weight:800;font-size:16px;text-decoration:none;padding:14px 30px;border-radius:12px;">${t.cta}</a>
          </p>
          <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">${t.foot}</p>
          <p style="margin:14px 0 0;color:#9ca3af;font-size:13px;">${t.sign}</p>
          </div>
        </div>
        </div>`;
  return { subject: t.subject, html };
}
