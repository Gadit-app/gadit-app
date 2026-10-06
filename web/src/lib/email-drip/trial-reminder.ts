import Stripe from "stripe";
import { planCopy } from "@/lib/plan-copy";
import { isIndividualPriceId } from "@/lib/individual-prices";
import { renderEmailHtmlV2, mdLiteToHtml, applyName } from "./render";
import { EMAIL_BASE } from "./family-content";

/**
 * Billing reminder two days before a free trial turns into a charge (Gadi
 * 2026-10-06, after the 7-assistant council and the Google Play trial
 * disclosure rules): the exact date, amount and plan, and how to cancel.
 * A transactional email, so it goes out even to someone who left the
 * marketing emails. Once per trial (users.trialReminderFor = trialEnd).
 *
 * The daily cron calls it for every trialing subscriber. Its window is 24 to
 * 72 hours before the trial ends, so the first weekday run inside it sends
 * (the cron skips Shabbat) and the reminder never arrives with less than a
 * day to spare.
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const H = 3600_000;

export function trialReminderDue(d: FirebaseFirestore.DocumentData, now: number): boolean {
  if (d.subscriptionStatus !== "trialing") return false;
  if (d.schoolId) return false; // schools buy by order form and tax invoice
  const end = typeof d.trialEnd === "number" ? d.trialEnd * 1000 : NaN;
  if (!Number.isFinite(end)) return false;
  if (d.trialReminderFor === d.trialEnd) return false;
  const left = end - now;
  return left > 24 * H && left <= 72 * H;
}

function planName(d: FirebaseFirestore.DocumentData): string {
  if (d.familyId) return "Gadit Family";
  if (isIndividualPriceId(d.priceId)) return "Gadit Individual";
  return d.plan === "clear" ? "Gadit Clear" : "Gadit Deep";
}

/** Amount and cycle of the subscriber's price, in the currency they pay
 *  (Hebrew accounts are billed in shekels through the price's ILS option). */
async function priceLine(priceId: string, lang: string): Promise<{ amount: string; cycle: string } | null> {
  try {
    const p = await stripe.prices.retrieve(priceId, { expand: ["currency_options"] });
    const ils = lang === "he" ? p.currency_options?.ils?.unit_amount : null;
    const cents = ils ?? p.unit_amount;
    if (cents == null) return null;
    const currency = ils != null ? "ILS" : p.currency.toUpperCase();
    const locale = lang === "he" ? "he-IL" : lang;
    let amount: string;
    try {
      amount = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
    } catch {
      amount = `${(cents / 100).toFixed(2)} ${currency}`;
    }
    const cycle = planCopy(lang, p.recurring?.interval === "year" ? "remCycleYear" : "remCycleMonth");
    return { amount, cycle };
  } catch {
    return null;
  }
}

function formatDate(ms: number, lang: string): string {
  const locale = lang === "he" ? "he-IL" : lang;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric", timeZone: lang === "he" ? "Asia/Jerusalem" : "UTC" };
  try { return new Intl.DateTimeFormat(locale, opts).format(new Date(ms)); } catch { return new Date(ms).toISOString().slice(0, 10); }
}

export async function buildTrialReminder(
  d: FirebaseFirestore.DocumentData,
  lang: string,
  firstName: string | null,
): Promise<{ subject: string; html: string } | null> {
  if (typeof d.priceId !== "string") return null;
  const pl = await priceLine(d.priceId, lang);
  if (!pl) return null;
  const date = formatDate(d.trialEnd * 1000, lang);
  const fill = (s: string) =>
    applyName(s, firstName).replace(/\{date\}/g, date).replace(/\{amount\}/g, pl.amount).replace(/\{cycle\}/g, pl.cycle).replace(/\{plan\}/g, planName(d));
  const base = lang === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${lang}`;
  return {
    subject: fill(planCopy(lang, "remSubject")),
    html: renderEmailHtmlV2({
      he: lang === "he",
      lang,
      bodyHtml: mdLiteToHtml(lang, fill(planCopy(lang, "remBody"))),
      ctaText: planCopy(lang, "remCta"),
      ctaUrl: `${base}/account`,
      next: "",
      helpUrl: `${base}/help`,
      // A billing notice, not marketing: no unsubscribe line.
      unsubscribeUrl: "",
    }),
  };
}

/** The same email with sample values, for the admin preview. */
export function sampleTrialReminder(lang: string): { subject: string; html: string } {
  const he = lang === "he";
  const date = formatDate(Date.now() + 2 * 24 * H, lang);
  const fill = (s: string) =>
    applyName(s, he ? "דנה" : "Dana")
      .replace(/\{date\}/g, date)
      .replace(/\{amount\}/g, he ? "‏14.90 ₪" : "$3.99")
      .replace(/\{cycle\}/g, planCopy(lang, "remCycleMonth"))
      .replace(/\{plan\}/g, "Gadit Individual");
  const base = lang === "en" ? EMAIL_BASE : `${EMAIL_BASE}/${lang}`;
  return {
    subject: fill(planCopy(lang, "remSubject")),
    html: renderEmailHtmlV2({ he, lang, bodyHtml: mdLiteToHtml(lang, fill(planCopy(lang, "remBody"))), ctaText: planCopy(lang, "remCta"), ctaUrl: `${base}/account`, next: "", helpUrl: `${base}/help`, unsubscribeUrl: "" }),
  };
}
