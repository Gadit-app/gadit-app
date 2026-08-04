import "server-only";
import { Resend } from "resend";
import { getAdminDb } from "./firebase-admin";
import { Partner } from "./partners";

/**
 * Partner-facing "opening" (welcome) email — a full 14-field template
 * modelled on the one Gadi runs on Yooniz, adapted to Gadit's product
 * (a multilingual child-safe dictionary, not a screen-time app) and to
 * Gadit's multi-currency reality. Server-only (Resend + firebase-admin),
 * so it lives apart from lib/partners.ts (safe for client imports).
 *
 * Editable from /admin/partners, stored per language in Firestore at
 * partnerConfig/welcomeEmail. The functional blocks — referral link,
 * code, dashboard button — are always injected and can't be removed, so
 * a bad edit can never produce a useless email.
 *
 * Tokens in the text fields: {name} {pctY1} {pctAfter} {year1} {code} {link}
 *  - {pctY1} / {pctAfter} come from the partner's own rates.
 *  - {year1} comes from the editable `year1Est` field (per language), so
 *    Gadi sets the currency-appropriate figure himself (₪ / $).
 */

const SITE = "https://www.gadit.app";

export type WelcomeLangConfig = {
  subject: string;
  greeting: string;
  opening: string;
  noteUnderLink: string;
  commissionLine: string;
  commissionExplain: string;
  year1Est: string;            // fills the {year1} token, per-language / per-currency
  dashboardNote: string;
  tipsHeader: string;
  tip1: string;
  tip2: string;
  tip3: string;
  closing: string;
  signatureName: string;
  signatureRole: string;
};
export type WelcomeConfig = { he: WelcomeLangConfig; en: WelcomeLangConfig };

export const WELCOME_FIELDS: (keyof WelcomeLangConfig)[] = [
  "subject", "greeting", "opening", "noteUnderLink", "commissionLine",
  "commissionExplain", "year1Est", "dashboardNote", "tipsHeader",
  "tip1", "tip2", "tip3", "closing", "signatureName", "signatureRole",
];

export const DEFAULT_WELCOME_CONFIG: WelcomeConfig = {
  he: {
    subject: "הצטרפת לתוכנית השותפים של Gadit. הנה הקישור שלך 🤝",
    greeting: "טוב שהצטרפת לתוכנית השותפים של Gadit 🤝",
    opening: "הנה כל מה שצריך כדי להתחיל. Gadit הוא מילון חכם ובטוח לילדים ב-14 שפות, עם דוגמאות, תמונות ומחברת אישית שעוזרת לילד באמת להבין מילים.",
    noteUnderLink: "כל מי שנרשם ומשלם דרכו נזקף אליך אוטומטית. הקישור לא חושף את השם שלך.",
    commissionLine: "העמלה שלך: {pctY1}% מכל תשלום בשנה הראשונה, {pctAfter}% אחריה לכל זמן שהמשפחה נשארת.",
    commissionExplain: "לדוגמה: משפחה אחת שנרשמת למנוי המשפחתי ונשארת שנה שווה לך מעל {year1}. וכל עוד המשפחה נשארת מנויה, אנחנו ב-Gadit ממשיכים לשלם לך עמלה על המנוי שלה, חודש אחרי חודש. זו לא עמלה חד-פעמית, זו הכנסה שממשיכה.",
    year1Est: "₪240",
    dashboardNote: "אפשר לראות שם קליקים, הרשמות ורווחים בזמן אמת. בלי צורך להתחבר, הלוח פרטי לך בלבד.",
    tipsHeader: "3 דברים שעוזרים להפיץ",
    tip1: "לספר על זה איפה שההורים מקשיבים לך. קבוצת וואטסאפ, פוסט, שיחה אישית.",
    tip2: "הכאב שכל הורה מכיר: ילד שנתקל במילה שהוא לא מבין ומוותר. Gadit נותן לו להבין לבד, בשפה שלו.",
    tip3: "אפשר להתחיל בחינם, אז קל להמליץ בלי מחסום.",
    closing: "כל שאלה, אפשר פשוט להשיב למייל הזה. הצוות ואני כאן.",
    signatureName: "גדי בן לביא",
    signatureRole: "מייסד Gadit",
  },
  en: {
    subject: "You're in. Here's your Gadit partner link 🤝",
    greeting: "Great to have you in the Gadit Partner Program 🤝",
    opening: "Here's everything you need to start. Gadit is a smart, child-safe dictionary in 14 languages, with examples, pictures and a personal notebook that helps a child truly understand words.",
    noteUnderLink: "Everyone who signs up and pays through it is credited to you automatically. The link never shows your name.",
    commissionLine: "Your commission: {pctY1}% of every payment in year one, {pctAfter}% after that for as long as the family stays.",
    commissionExplain: "For example, one family that joins the Family plan and stays a year is worth over {year1} to you. And for as long as that family stays subscribed, we at Gadit keep paying you a commission on their subscription, month after month. Not a one-time payout, income that continues.",
    year1Est: "$60",
    dashboardNote: "You can see clicks, signups and earnings there in real time. No login needed, the dashboard is private to you.",
    tipsHeader: "3 things that help you spread the word",
    tip1: "Mention it where parents already listen to you. A WhatsApp group, a post, a personal chat.",
    tip2: "The pain every parent knows: a child hits a word they don't understand and gives up. Gadit lets them understand on their own, in their language.",
    tip3: "There's a free way to start, so it's easy to recommend with no barrier.",
    closing: "Any question, just reply to this email. The team and I are here.",
    signatureName: "Gadi Ben Lavi",
    signatureRole: "Founder, Gadit",
  },
};

function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Vars = { name: string; pctY1: number; pctAfter: number; year1: string; code: string; link: string };

function applyVars(s: string, v: Vars): string {
  return esc(s)
    .replace(/\{name\}/g, esc(v.name || ""))
    .replace(/\{pctY1\}/g, String(v.pctY1))
    .replace(/\{pctAfter\}/g, String(v.pctAfter))
    .replace(/\{year1\}/g, esc(v.year1 || ""))
    .replace(/\{code\}/g, esc(v.code))
    .replace(/\{link\}/g, esc(v.link));
}

function applyVarsHtml(s: string, v: Vars): string {
  return applyVars(s, v).replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
}

type WelcomePartner = Pick<Partner, "code" | "name" | "email" | "dashboardToken" | "rateYearOne" | "rateLifetime">;

/** Pure builder — used both to send and to preview. */
export function buildWelcomeEmail(
  partner: WelcomePartner,
  lang: string,
  cfg: WelcomeConfig,
): { subject: string; html: string } {
  const he = lang === "he";
  const c = he ? cfg.he : cfg.en;
  const pctY1 = Math.round((partner.rateYearOne ?? 0.25) * 100);
  const pctAfter = Math.round((partner.rateLifetime ?? 0.1) * 100);
  const link = `${SITE}/?ref=${partner.code}`;
  // Per-product referral links (general Gadit, Families landing, Schools
  // landing). RefCapture attributes ?ref on any page, so a partner who
  // wants to sell Family shares the Families link directly (Gadi
  // 2026-08-05). Links match the email language; other languages are in
  // the dashboard.
  const linkPrefix = he ? "/he" : "";
  const productLinks = [
    { label: he ? "Gadit (כללי)" : "Gadit (general)", url: `${SITE}${linkPrefix}/?ref=${partner.code}` },
    { label: he ? "למשפחות" : "Families", url: `${SITE}${linkPrefix}/families/landing?ref=${partner.code}` },
    { label: he ? "לבתי ספר" : "Schools", url: `${SITE}${linkPrefix}/schools/landing?ref=${partner.code}` },
  ];
  const linksHint = he
    ? "קישור לכל מוצר. אפשר לשתף כל אחד בנפרד, בכל שפה מהאזור האישי."
    : "One link per product. Share whichever fits, in any language from your dashboard.";
  const dash = `${SITE}/partner/dashboard?t=${partner.dashboardToken}`;
  // {year1} = the PARTNER's first-year commission from one Family-plan
  // customer, NOT the customer's spend (Gadi 2026-08-02: the text says
  // "worth to YOU"). Basis: Family monthly annualized (₪19.90×12 ≈ 240,
  // $5.99×12 ≈ 72) × the partner's own year-one rate. So 25% → ₪60, a
  // founder's 30% → ₪72. Always correct per partner, per currency.
  const ils = lang === "he" || lang === "ru";
  const annualSpend = ils ? 240 : 72;
  const y1Amount = Math.round((partner.rateYearOne ?? 0.25) * annualSpend);
  const year1 = ils ? `${y1Amount} ₪` : `$${y1Amount}`;
  const vars: Vars = { name: partner.name, pctY1, pctAfter, year1, code: partner.code, link };

  const linkLabel = he ? "הקישורים שלך" : "Your links";
  const codeLabel = he ? "קוד השותף שלך" : "Your partner code";
  const cta = he ? "פתיחת האזור האישי" : "Open your dashboard";
  const t = (s: string) => applyVars(s, vars);
  const tb = (s: string) => applyVarsHtml(s, vars);
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";

  const subject = t(c.subject).replace(/&amp;/g, "&").replace(/\s*\n\s*/g, " ");

  const tips = [c.tip1, c.tip2, c.tip3].filter((x) => x && x.trim());
  const tipsHtml = tips.length
    ? `<div style="margin:22px 0 4px;font-weight:700;font-size:15px;">${t(c.tipsHeader)}</div>
       <ol style="margin:8px 0 0;padding-inline-start:20px;">${tips.map((tp) => `<li style="margin:0 0 8px;font-size:14.5px;line-height:1.6;">${tb(tp)}</li>`).join("")}</ol>`
    : "";

  const html = `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F6F8FA;color:#111827;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #EAECEF;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;text-align:${align};">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;">${t(c.greeting)}</div>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.6;text-align:${align};">
      <p style="margin:0 0 18px;">${tb(c.opening)}</p>

      <div style="font-size:13px;color:#6B7280;margin:0 0 4px;">${linkLabel}</div>
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 12px;">${linksHint}</div>
      ${productLinks.map((p) => `
      <div style="margin:0 0 12px;">
        <div style="font-size:12px;font-weight:700;color:#374151;margin:0 0 3px;">${p.label}</div>
        <a href="${p.url}" style="font-size:14px;font-weight:600;color:#0EA5A5;word-break:break-all;">${p.url}</a>
      </div>`).join("")}
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 18px;">${tb(c.noteUnderLink)}</div>

      <div style="font-size:13px;color:#6B7280;margin:0 0 6px;">${codeLabel}</div>
      <div style="font-size:22px;font-weight:800;letter-spacing:2px;margin:0 0 20px;">${esc(partner.code)}</div>

      <div style="background:rgba(14,165,165,0.08);border-radius:12px;padding:16px;margin:0 0 18px;">
        <div style="font-weight:700;margin:0 0 6px;">${tb(c.commissionLine)}</div>
        <div style="font-size:14px;color:#374151;">${tb(c.commissionExplain)}</div>
      </div>

      <div style="text-align:center;margin:20px 0 8px;">
        <a href="${dash}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">${cta}</a>
      </div>
      <div style="font-size:12.5px;color:#9CA3AF;margin:0 0 4px;text-align:center;">${tb(c.dashboardNote)}</div>

      ${tipsHtml}

      <p style="margin:24px 0 0;font-size:14.5px;">${tb(c.closing)}</p>
      <p style="margin:16px 0 0;font-size:14.5px;font-weight:700;">${t(c.signatureName)}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#6B7280;">${t(c.signatureRole)}</p>
    </div>
  </div>
</body></html>`;

  return { subject, html };
}

/** Load the (merged-with-defaults) welcome-email config from Firestore. */
export async function loadWelcomeConfig(): Promise<WelcomeConfig> {
  try {
    const snap = await getAdminDb().collection("partnerConfig").doc("welcomeEmail").get();
    const d = snap.data();
    if (!d) return DEFAULT_WELCOME_CONFIG;
    return {
      he: { ...DEFAULT_WELCOME_CONFIG.he, ...(d.he ?? {}) },
      en: { ...DEFAULT_WELCOME_CONFIG.en, ...(d.en ?? {}) },
    };
  } catch {
    return DEFAULT_WELCOME_CONFIG;
  }
}

/** The welcome / "here's your link" email. Reads the editable config, sends. */
export async function sendPartnerWelcome(partner: WelcomePartner, lang: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  try {
    const cfg = await loadWelcomeConfig();
    const { subject, html } = buildWelcomeEmail(partner, lang, cfg);
    await new Resend(resendKey).emails.send({ from: "Gadit <notify@gadit.app>", to: partner.email, subject, html });
  } catch (e) {
    console.warn("[partner-email] welcome send failed (non-blocking):", e);
  }
}
