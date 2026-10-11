import { emailHeaderHtml, EMAIL_BG, EMAIL_CARD_MAX } from "@/lib/email-brand";
import BILLING_I18N from "@/lib/billing-email-i18n.json";
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

/** The email's language (Gadi 2026-10-11, all 33): Hebrew by the rule above,
 *  otherwise the user's UI language when we have copy for it, else English. */
export function dunningLang(
  user: { uiLang?: unknown; country?: unknown },
  invoice: { currency?: string | null; country?: string | null },
): string {
  if (dunningIsHebrew(user, invoice)) return "he";
  const l = typeof user.uiLang === "string" ? user.uiLang : "";
  return l && l in COPY ? l : "en";
}

type DunningCopy = (typeof BILLING_I18N)["en"]["dunning"];
const COPY = BILLING_I18N as Record<string, { dunning: DunningCopy }>;
const RTL = new Set(["he", "ar", "fa"]);

export function buildDunningEmail(opts: {
  lang: string;
  url: string;
  kind: "first" | "reminder";
  /** Whole days of access left (reminder only). */
  daysLeft?: number;
}): { subject: string; html: string } {
  const { url, kind } = opts;
  const days = Math.max(1, opts.daysLeft ?? 2);
  const first = kind === "first";
  const c = (COPY[opts.lang] ?? COPY.en).dunning;
  const n = (x: string) => x.replace("{days}", String(days));
  const t = {
    subject: first ? c.subjectFirst : days === 1 ? c.subjectReminderOne : n(c.subjectReminder),
    h1: first ? c.h1First : c.h1Reminder,
    p1: first ? c.p1First : c.p1Reminder,
    p2: first ? c.p2First : days === 1 ? c.p2ReminderOne : n(c.p2Reminder),
    cta: c.cta,
    foot: c.foot,
    sign: c.sign,
    dir: RTL.has(opts.lang) ? "rtl" : "ltr",
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
