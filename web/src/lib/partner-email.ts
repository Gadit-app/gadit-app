import "server-only";
import { Resend } from "resend";
import { getAdminDb } from "./firebase-admin";
import { Partner } from "./partners";

/**
 * Partner-facing emails. Server-only (pulls in Resend + firebase-admin),
 * so this lives apart from lib/partners.ts, which is safe to import from
 * client components.
 *
 * The welcome ("opening") email is EDITABLE by an admin: the subject,
 * intro paragraph, and share line are stored in Firestore at
 * partnerConfig/welcomeEmail (per language) and edited from
 * /admin/partners. The functional blocks — the referral link, the code,
 * and the dashboard button — are always injected and cannot be removed,
 * so a bad edit can never produce a useless email.
 *
 * Editable text supports placeholders: {name}, {rateYearOne},
 * {rateLifetime}.
 */

const SITE = "https://www.gadit.app";

export type WelcomeLangConfig = { subject: string; intro: string; shareLine: string };
export type WelcomeConfig = { he: WelcomeLangConfig; en: WelcomeLangConfig };

export const DEFAULT_WELCOME_CONFIG: WelcomeConfig = {
  he: {
    subject: "הצטרפת לתוכנית השותפים של Gadit 🎉",
    intro: "היי {name}, ברוכים הבאים לתוכנית השותפים של Gadit. הנה הקישור האישי שלכם:",
    shareLine: "שתפו את הקישור. על כל מי שיירשם וישלם דרכו, תקבלו {rateYearOne}% עמלה חוזרת בשנה הראשונה, ו-{rateLifetime}% לכל החיים.",
  },
  en: {
    subject: "You're in — Gadit Partner Program 🎉",
    intro: "Hi {name}, welcome to the Gadit Partner Program. Here's your personal link:",
    shareLine: "Share your link. For everyone who signs up and pays through it, you earn {rateYearOne}% recurring commission in year one, and {rateLifetime}% for life.",
  },
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function applyVars(s: string, v: { name: string; y1: number; life: number }): string {
  return esc(s)
    .replace(/\{name\}/g, esc(v.name || ""))
    .replace(/\{rateYearOne\}/g, String(v.y1))
    .replace(/\{rateLifetime\}/g, String(v.life));
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
  const y1 = Math.round((partner.rateYearOne ?? 0.25) * 100);
  const life = Math.round((partner.rateLifetime ?? 0.1) * 100);
  const vars = { name: partner.name, y1, life };
  const link = `${SITE}/p/${partner.code}`;
  const dash = `${SITE}/partner/dashboard?t=${partner.dashboardToken}`;
  const linkLabel = he ? "הקישור שלכם" : "Your link";
  const codeLabel = he ? "קוד השותף שלכם" : "Your partner code";
  const cta = he ? "פתיחת האזור האישי" : "Open your dashboard";
  const foot = he
    ? "שמרו את הקישור הזה — הוא הכניסה הפרטית לאזור שלכם, בלי סיסמה."
    : "Keep this link — it's your private, password-less way back into your dashboard.";

  const subject = applyVars(c.subject, vars).replace(/&amp;/g, "&"); // subject is plain text
  const html = `<!DOCTYPE html><html dir="${he ? "rtl" : "ltr"}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">${he ? "שותף חדש" : "Partner"}</div>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 16px;">${applyVars(c.intro, vars)}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">${linkLabel}</p>
      <p style="margin:0 0 20px;"><a href="${link}" style="font-size:18px;font-weight:700;color:#0EA5A5;">${link}</a></p>
      <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">${codeLabel}</p>
      <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:2px;">${partner.code}</p>
      <p style="margin:0 0 20px;">${applyVars(c.shareLine, vars)}</p>
      <div style="margin-top:8px;text-align:center;">
        <a href="${dash}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:11px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">${cta}</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;">${foot}</p>
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

/**
 * The welcome / "here's your link" email. Reads the editable config, then
 * sends. Non-blocking: swallows its own errors.
 */
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
