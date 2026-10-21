import { renderEmailHtmlV2, mdLiteToHtml, applyName } from "./render";
import { isIndividualPriceId, INDIVIDUAL_YEARLY } from "@/lib/individual-prices";

/**
 * Copy of the abandoned-checkout recovery emails (Gadi 2026-10-21): three
 * mails to someone who opened /checkout and never entered a card. Hebrew and
 * English are written; every other language falls back to English until its
 * table is added (one more key in RECOVERY_CONTENT, nothing else changes).
 *
 * Body is the markdown-lite of the drip emails (render.ts): blank line = new
 * paragraph, "- " lines = a list (shown here as bullets), **bold**.
 * Placeholders: {שם}/{name} first name (drops cleanly when unknown), {plan}
 * the plan name ("Gadit Family"), {price} the price after the trial. A line
 * holding {price} is removed when the price is unknown (legacy plans).
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

export const RECOVERY_CONTENT: Record<string, LangContent> = {
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

You started signing up for {plan} and stopped just before the end. We saved everything, so you can pick up right where you left off.

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

A quick word on what is waiting for your kids. Every word they meet, in a book, in homework or in conversation, becomes a word they truly understand.

- An explanation at your child's level, with a picture for every meaning
- Games and practice made from their own words
- A parent dashboard that shows you each child's progress

Your {plan} signup is saved, only the last step is left.`,
      cta: "Finish signing up",
      next: "Nothing is charged today, and you can cancel anytime from your account page.",
    },
    e2Individual: {
      subject: "What is waiting for you at Gadit",
      body: `Hi {name},

A quick word on what is waiting for you. Every word you meet, in a book, at work or in conversation, becomes a word you truly understand.

- Every meaning of the word, with a picture for each one
- Games and practice made from your own words
- A personal word notebook that keeps everything you learned

Your {plan} signup is saved, only the last step is left.`,
      cta: "Finish signing up",
      next: "Nothing is charged today, and you can cancel anytime from your account page.",
    },
    e3: {
      subject: "Did something get in the way? Tell us",
      body: `Hi {name},

Your {plan} signup is still saved. If something got in the way, just reply to this email and we'll help.`,
      cta: "Finish signing up",
      next: "",
      signature: "The Gadit team",
    },
  },
};

export function recoveryContentLang(lang: string): string {
  return RECOVERY_CONTENT[lang] ? lang : "en";
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
 *  (Hebrew checkouts are billed in shekels). Null for legacy plans. */
export function recoveryPriceLine(priceId: string, currency: string, lang: string): string | null {
  const plan = recoveryPlanOf(priceId);
  if (plan === "other") return null;
  const yearly = priceId === process.env.STRIPE_PRICE_FAMILY_YEARLY || priceId === INDIVIDUAL_YEARLY;
  const ils = currency.toLowerCase() === "ils";
  const amount =
    plan === "family"
      ? yearly ? (ils ? "₪199" : "$59") : (ils ? "₪19.90" : "$5.99")
      : yearly ? (ils ? "₪149" : "$39.99") : (ils ? "₪14.90" : "$3.99");
  const he = recoveryContentLang(lang) === "he";
  const per = yearly ? (he ? "לשנה" : "a year") : (he ? "לחודש" : "a month");
  return `${amount} ${per}`;
}

/** The link in every recovery email: straight back to the same plan's
 *  checkout, in the buyer's language, on the purchase host. Revisiting
 *  /checkout reuses the card-less subscription for the same price. */
export function recoveryCheckoutUrl(lang: string, priceId: string, step: RecoveryStep | "banner"): string {
  const content = step === "banner" ? "banner" : `e${step}`;
  const medium = step === "banner" ? "site" : "email";
  return `https://gadit.app/${lang || "en"}/checkout?price=${encodeURIComponent(priceId)}&utm_source=recovery&utm_medium=${medium}&utm_campaign=checkout_recovery&utm_content=${content}`;
}

export function buildRecoveryEmail(opts: {
  step: RecoveryStep;
  lang: string;
  priceId: string;
  currency: string;
  firstName: string | null;
  unsubscribeUrl: string;
}): { subject: string; html: string; contentLang: string } {
  const cl = recoveryContentLang(opts.lang);
  const C = RECOVERY_CONTENT[cl];
  const plan = recoveryPlanOf(opts.priceId);
  const mail = opts.step === 1 ? C.e1 : opts.step === 3 ? C.e3 : plan === "family" ? C.e2Family : C.e2Individual;
  const price = recoveryPriceLine(opts.priceId, opts.currency, cl);
  const fill = (s: string) => {
    let out = applyName(s, opts.firstName).replace(/\{plan\}/g, recoveryPlanName(plan));
    out = price ? out.replace(/\{price\}/g, price) : out.split("\n").filter((l) => !l.includes("{price}")).join("\n");
    return out;
  };
  // The "- " lines render as an ordered list in mdLite; these are bullets.
  const bodyHtml = mdLiteToHtml(cl, fill(mail.body)).replace(/<ol /g, "<ul ").replace(/<\/ol>/g, "</ul>");
  const base = cl === "en" ? "https://www.gadit.app" : `https://www.gadit.app/${cl}`;
  return {
    contentLang: cl,
    subject: fill(mail.subject),
    html: renderEmailHtmlV2({
      he: cl === "he",
      lang: cl,
      bodyHtml,
      ctaText: mail.cta,
      ctaUrl: recoveryCheckoutUrl(opts.lang, opts.priceId, opts.step),
      next: fill(mail.next),
      // The reply line already invites questions; no second closing line.
      closing: "",
      ...(mail.signature ? { signature: mail.signature } : {}),
      helpText: "",
      helpUrl: `${base}/help`,
      unsubscribeUrl: opts.unsubscribeUrl,
    }),
  };
}
