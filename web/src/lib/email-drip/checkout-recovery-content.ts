import { renderEmailHtmlV2, mdLiteToHtml, applyName, type EmailContent } from "./render";
import { PRICE_DISPLAY } from "@/lib/pricing-currency";
import { isIndividualPriceId, INDIVIDUAL_MONTHLY, INDIVIDUAL_YEARLY } from "@/lib/individual-prices";
import { planCopy } from "@/lib/plan-copy";
import { EMAIL_I18N } from "./i18n";

/**
 * Copy of the abandoned-checkout recovery emails (Gadi 2026-10-21): three
 * mails to someone who opened /checkout and never entered a card. These are
 * the CODE DEFAULTS in Hebrew and English; every other UI language has a
 * code translation in i18n/<lang>.json (2026-10-22, translated from Gadi's
 * edited Hebrew in emailTemplates/rec-*.he). The admin email editor (series
 * "Checkout recovery") edits them per language; a saved override in
 * emailTemplates/{key} wins (email-templates-store.ts), then the code
 * translation, then English. The cron sends the effective content, so
 * whatever is saved in the editor is what goes out.
 *
 * Body is the markdown-lite of the drip emails (render.ts): blank line = new
 * paragraph, "- " lines = a list (shown here as bullets), **bold**.
 * Placeholders (shown literally in the editor, filled by the sender):
 * {שם}/{name} first name (drops cleanly when unknown), {plan} the plan name
 * ("Gadit Family"), {price} the price after the trial ("₪19.90 לחודש"). A
 * line holding {price} is removed when the price is unknown (legacy plans).
 * The button always links to the person's own checkout (recoveryCheckoutUrl);
 * only its text is editable.
 *
 * Facts used (verified in code 2026-10-21): 14-day trial with no charge
 * today (subscribe/route.ts), a billing reminder email before the trial
 * ends (trial-reminder.ts, sent 24 to 72 hours before), cancel from the
 * account page. Only E1 names the 14 days: a resumed checkout keeps the
 * original trial end, so on day 3 fewer than 14 days are left.
 */

export type RecoveryStep = 1 | 2 | 3;
export type RecoveryPlan = "family" | "individual" | "other";

type Mail = { subject: string; body: string; cta: string; next: string; signature?: string };
type LangContent = {
  e1: Mail;
  /** E2 tells what the plan gives: the Family version speaks about the kids. */
  e2Family: Mail;
  e2Individual: Mail;
  e3: Mail;
};

const BY_LANG: Record<"he" | "en", LangContent> = {
  he: {
    e1: {
      subject: "שמרנו לכם את המקום ב-Gadit",
      body: `היי {שם},

התחלתם להירשם ל-{plan} ועצרתם רגע לפני הסוף. שמרנו לכם הכל, ואפשר להמשיך בדיוק מאיפה שעצרתם.

- 14 ימים חינם, והיום לא יורד מכם שום תשלום
- אחרי תקופת הניסיון: {price}
- לפני שתקופת הניסיון נגמרת נשלח לכם תזכורת במייל
- אפשר לבטל בכל רגע מדף החשבון, בשתי לחיצות`,
      cta: "להשלמת ההרשמה",
      next: "משהו לא ברור? אפשר פשוט להשיב למייל הזה ונעזור.",
    },
    e2Family: {
      subject: "מה הילדים שלכם מקבלים ב-Gadit",
      body: `היי {שם},

רצינו לספר לכם בקצרה מה מחכה לילדים שלכם. כל מילה שהם פוגשים, בספר, בשיעורי הבית או בשיחה, הופכת למילה שהם באמת מבינים.

- הסבר בגובה של הילד, עם תמונה לכל משמעות
- משחקים ותרגול מהמילים שלהם עצמם
- לוח הורים שמראה לכם את ההתקדמות של כל ילד

ההרשמה שלכם ל-{plan} שמורה, וחסר רק הצעד האחרון.`,
      cta: "להשלמת ההרשמה",
      next: "היום לא יורד שום תשלום, ואפשר לבטל בכל רגע מדף החשבון.",
    },
    e2Individual: {
      subject: "מה מחכה לכם ב-Gadit",
      body: `היי {שם},

רצינו לספר לכם בקצרה מה מחכה לכם. כל מילה שאתם פוגשים, בספר, בעבודה או בשיחה, הופכת למילה שאתם באמת מבינים.

- כל המשמעויות של המילה, עם תמונה לכל משמעות
- משחקים ותרגול מהמילים שלכם עצמכם
- מחברת מילים אישית ששומרת את כל מה שלמדתם

ההרשמה שלכם ל-{plan} שמורה, וחסר רק הצעד האחרון.`,
      cta: "להשלמת ההרשמה",
      next: "היום לא יורד שום תשלום, ואפשר לבטל בכל רגע מדף החשבון.",
    },
    e3: {
      subject: "משהו הפריע? ספרו לנו",
      body: `היי {שם},

ההרשמה שלכם ל-{plan} עדיין שמורה. אם משהו הפריע, פשוט השיבו למייל הזה ונעזור.`,
      cta: "להשלמת ההרשמה",
      next: "",
      signature: "צוות Gadit",
    },
  },
  en: {
    e1: {
      subject: "We saved your spot at Gadit",
      body: `Hi {name},

You started signing up for {plan} and stopped just before the end.

We saved everything for you, and you can pick up right where you left off.

- 14 days free, and nothing is charged today
- After the trial: {price}
- We'll email you a reminder before the trial ends
- Cancel anytime from your account page, in two clicks`,
      cta: "Finish signing up",
      next: "Anything unclear? Just reply to this email and we'll help.",
    },
    e2Family: {
      subject: "What your kids get with Gadit",
      body: `Hi {name},

We wanted to tell you briefly what is waiting for your kids at Gadit:

Every word they meet, in a book, in homework or in conversation, becomes a word they truly understand.

- An explanation at your child's level, with a picture for every meaning
- Games and practice made from their own words
- Help with homework
- A parent dashboard that shows you each child's progress

Your {plan} signup is saved, and only the last step is left.`,
      cta: "Finish signing up",
      next: "Nothing is charged today, and you can cancel anytime from your account page.",
    },
    e2Individual: {
      subject: "What is waiting for you at Gadit",
      body: `Hi {name},

We wanted to tell you briefly what is waiting for you at Gadit:

Every word, in a book, at work or in conversation, becomes a word you understand all the way.

- Every meaning of the word, with a picture for each one
- Games and practice made from your own words
- A personal word notebook that keeps everything you learned

Your {plan} signup is saved, and only the last step is left.`,
      cta: "Finish signing up",
      next: "Nothing is charged today, and you can cancel anytime from your account page.",
    },
    e3: {
      subject: "Did something get in the way? Tell us",
      body: `Hi {name},

Your {plan} signup is still saved.

If something is holding you back, just reply to this email and we'll help.`,
      cta: "Finish signing up",
      next: "",
      signature: "The Gadit team",
    },
  },
};

/** Editor / store keys, one per email. E2 has a Family and an Individual
 *  version (the Family one speaks about the kids). */
export type RecoveryKey = "rec-e1" | "rec-e2-family" | "rec-e2-indiv" | "rec-e3";
const FIELD: Record<RecoveryKey, keyof LangContent> = { "rec-e1": "e1", "rec-e2-family": "e2Family", "rec-e2-indiv": "e2Individual", "rec-e3": "e3" };

/** Rows of the editor's "Checkout recovery" series. hours = when it goes out. */
export const RECOVERY_META: { key: RecoveryKey; label: string; labelHe: string; hours: number; step: RecoveryStep; plan?: RecoveryPlan }[] = [
  { key: "rec-e1", label: "E1 · after 1 hour", labelHe: "מייל 1 · אחרי שעה", hours: 1, step: 1 },
  { key: "rec-e2-family", label: "E2 Family · after 24 hours", labelHe: "מייל 2 Family · אחרי 24 שעות", hours: 24, step: 2, plan: "family" },
  { key: "rec-e2-indiv", label: "E2 Individual · after 24 hours", labelHe: "מייל 2 Individual · אחרי 24 שעות", hours: 24, step: 2, plan: "individual" },
  { key: "rec-e3", label: "E3 · after 72 hours", labelHe: "מייל 3 · אחרי 72 שעות", hours: 72, step: 3 },
];

function toContent(m: Mail): EmailContent {
  return {
    subject: m.subject,
    heading: "",
    body: m.body,
    ctaText: m.cta,
    next: m.next,
    // The reply line already invites questions; no second closing line.
    closing: "",
    ...(m.signature ? { signature: m.signature } : {}),
    helpText: "",
  };
}

/** Code defaults in the editor's shape (he + en), keyed like the store. */
export const RECOVERY_CONTENT = Object.fromEntries(
  RECOVERY_META.map((m) => [m.key, { he: toContent(BY_LANG.he[FIELD[m.key]]), en: toContent(BY_LANG.en[FIELD[m.key]]) }]),
) as Record<RecoveryKey, { he: EmailContent; en: EmailContent }>;

/** Code translations into every other UI language (i18n/<lang>.json, made
 *  2026-10-22 from Gadi's edited Hebrew), keyed like the store: key → lang. */
export const RECOVERY_I18N = Object.fromEntries(
  RECOVERY_META.map((m) => [
    m.key,
    Object.fromEntries(
      Object.entries(EMAIL_I18N).flatMap(([lang, t]) => (t.recovery[m.key] ? [[lang, toContent(t.recovery[m.key])]] : [])),
    ),
  ]),
) as Record<RecoveryKey, Partial<Record<string, EmailContent>>>;

export function isRecoveryKey(key: string | null | undefined): key is RecoveryKey {
  return !!key && key in FIELD;
}

/** Which email of the series a person gets at a step. */
export function recoveryKeyFor(step: RecoveryStep, plan: RecoveryPlan): RecoveryKey {
  return step === 1 ? "rec-e1" : step === 3 ? "rec-e3" : plan === "family" ? "rec-e2-family" : "rec-e2-indiv";
}

/** "family" / "individual" / "other" (legacy Clear or Deep) from a price id. */
export function recoveryPlanOf(priceId: string): RecoveryPlan {
  if (priceId && (priceId === process.env.STRIPE_PRICE_FAMILY_MONTHLY || priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY)) return "family";
  if (isIndividualPriceId(priceId)) return "individual";
  return "other";
}

export function recoveryPlanName(plan: RecoveryPlan): string {
  return plan === "family" ? "Gadit Family" : plan === "individual" ? "Gadit Individual" : "Gadit";
}

/** Price after the trial, in the currency the subscription was created in
 *  (Hebrew checkouts are billed in shekels), with the cycle word in the
 *  email's language. Null for legacy plans. */
export function recoveryPriceLine(priceId: string, currency: string, lang: string): string | null {
  const plan = recoveryPlanOf(priceId);
  if (plan === "other") return null;
  const yearly = priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY || priceId === INDIVIDUAL_YEARLY;
  const ils = currency.toLowerCase() === "ils";
  // A local currency block (R in South Africa, 2026-10-24).
  const local = !ils && currency.toLowerCase() !== "usd" ? PRICE_DISPLAY[currency.toLowerCase()] : undefined;
  const amount = local
    ? plan === "family"
      ? yearly ? local.familyYearly : local.familyMonthly
      : yearly ? local.individualYearly : local.individualMonthly
    : plan === "family"
      ? yearly ? (ils ? "₪199" : "$59") : (ils ? "₪19.90" : "$5.99")
      : yearly ? (ils ? "₪149" : "$39.99") : (ils ? "₪14.90" : "$3.99");
  return `${amount} ${planCopy(lang, yearly ? "remCycleYear" : "remCycleMonth")}`;
}

/** The link in every recovery email: straight back to the same plan's
 *  checkout, in the buyer's language, on the purchase host. Revisiting
 *  /checkout reuses the card-less subscription for the same price. */
export function recoveryCheckoutUrl(lang: string, priceId: string, step: RecoveryStep | "banner"): string {
  const content = step === "banner" ? "banner" : `e${step}`;
  const medium = step === "banner" ? "site" : "email";
  return `https://gadit.app/${lang || "en"}/checkout?price=${encodeURIComponent(priceId)}&utm_source=recovery&utm_medium=${medium}&utm_campaign=checkout_recovery&utm_content=${content}`;
}

/**
 * Render one recovery email from its (effective) content. `lang` is the
 * language the content is in (sets direction); `linkLang` the buyer's own
 * language for the checkout link. Used by the cron, and by the editor's
 * preview and test send with sample values.
 */
export function renderRecoveryMail(
  c: EmailContent,
  opts: { lang: string; linkLang?: string; step: RecoveryStep; priceId: string; currency: string; firstName: string | null; unsubscribeUrl: string },
): { subject: string; html: string } {
  const plan = recoveryPlanOf(opts.priceId);
  const price = recoveryPriceLine(opts.priceId, opts.currency, opts.lang);
  const fill = (s: string) => {
    const out = applyName(s, opts.firstName).replace(/\{plan\}/g, recoveryPlanName(plan));
    return price ? out.replace(/\{price\}/g, price) : out.split("\n").filter((l) => !l.includes("{price}")).join("\n");
  };
  // The "- " lines render as an ordered list in mdLite; these are bullets.
  const bodyHtml = mdLiteToHtml(opts.lang, fill(c.body)).replace(/<ol /g, "<ul ").replace(/<\/ol>/g, "</ul>");
  const base = opts.lang === "en" ? "https://www.gadit.app" : `https://www.gadit.app/${opts.lang}`;
  return {
    subject: fill(c.subject),
    html: renderEmailHtmlV2({
      he: opts.lang === "he",
      lang: opts.lang,
      bodyHtml,
      ctaText: c.ctaText,
      ctaUrl: recoveryCheckoutUrl(opts.linkLang ?? opts.lang, opts.priceId, opts.step),
      next: fill(c.next ?? ""),
      closing: c.closing,
      signature: c.signature,
      helpText: c.helpText,
      helpUrl: `${base}/help`,
      unsubscribeUrl: opts.unsubscribeUrl,
    }),
  };
}

/** Sample values for the editor's preview and test send: Family monthly
 *  (Individual monthly for the Individual E2), in shekels for Hebrew. */
export function sampleRecoveryMail(key: RecoveryKey, lang: string, c: EmailContent): { subject: string; html: string } {
  const meta = RECOVERY_META.find((m) => m.key === key)!;
  const priceId = meta.plan === "individual" ? INDIVIDUAL_MONTHLY : (process.env.STRIPE_PRICE_FAMILY_MONTHLY ?? "price_1TtwJfRprLKxF6OiXHbu2cae");
  return renderRecoveryMail(c, {
    lang, step: meta.step, priceId, currency: lang === "he" ? "ils" : "usd",
    firstName: lang === "he" ? "דנה" : "Dana", unsubscribeUrl: "https://www.gadit.app/",
  });
}
