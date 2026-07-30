import "server-only";
import { Resend } from "resend";
import { Partner } from "./partners";

/**
 * Partner-facing emails. Server-only (pulls in Resend), so this lives
 * apart from lib/partners.ts, which is safe to import from client
 * components.
 */

const SITE = "https://www.gadit.app";

/**
 * The "welcome / here's your link" email a partner gets the moment they
 * join (self-signup) or are created by an admin. Includes the referral
 * link, the code, and the password-less dashboard link. Percentages come
 * from the partner's own stored rates, so a founder's email says 30%.
 * Non-blocking: swallows its own errors.
 */
export async function sendPartnerWelcome(
  partner: Pick<Partner, "code" | "name" | "email" | "dashboardToken" | "rateYearOne" | "rateLifetime">,
  lang: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const link = `${SITE}/p/${partner.code}`;
  const dash = `${SITE}/partner/dashboard?t=${partner.dashboardToken}`;
  const y1 = Math.round((partner.rateYearOne ?? 0.25) * 100);
  const life = Math.round((partner.rateLifetime ?? 0.1) * 100);
  const he = lang === "he";

  const subject = he
    ? `הצטרפת לתוכנית השותפים של Gadit 🎉`
    : `You're in — Gadit Partner Program 🎉`;
  const heBody = `
    <p style="margin:0 0 16px;">היי ${partner.name || ""},</p>
    <p style="margin:0 0 16px;">ברוכים הבאים לתוכנית השותפים של Gadit. הנה הקישור האישי שלכם:</p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">הקישור שלכם</p>
    <p style="margin:0 0 20px;"><a href="${link}" style="font-size:18px;font-weight:700;color:#0EA5A5;">${link}</a></p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">קוד השותף שלכם</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:2px;">${partner.code}</p>
    <p style="margin:0 0 20px;">שתפו את הקישור. על כל מי שיירשם וישלם דרכו, תקבלו ${y1}% עמלה חוזרת בשנה הראשונה, ו-${life}% לכל החיים.</p>
  `;
  const enBody = `
    <p style="margin:0 0 16px;">Hi ${partner.name || ""},</p>
    <p style="margin:0 0 16px;">Welcome to the Gadit Partner Program. Here's your personal link:</p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Your link</p>
    <p style="margin:0 0 20px;"><a href="${link}" style="font-size:18px;font-weight:700;color:#0EA5A5;">${link}</a></p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Your partner code</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:2px;">${partner.code}</p>
    <p style="margin:0 0 20px;">Share your link. For everyone who signs up and pays through it, you earn ${y1}% recurring commission in year one, and ${life}% for life.</p>
  `;
  const cta = he ? "פתיחת האזור האישי" : "Open your dashboard";
  const foot = he
    ? "שמרו את הקישור הזה — הוא הכניסה הפרטית לאזור שלכם, בלי סיסמה."
    : "Keep this link — it's your private, password-less way back into your dashboard.";
  const html = `<!DOCTYPE html><html dir="${he ? "rtl" : "ltr"}"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#F9FAFB;color:#111827;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0EA5A5,#0E7490);padding:24px;color:#fff;">
      <div style="font-size:13px;font-weight:600;letter-spacing:1px;opacity:.85;">GADIT</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">${he ? "שותף חדש" : "Partner"}</div>
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.6;">
      ${he ? heBody : enBody}
      <div style="margin-top:8px;text-align:center;">
        <a href="${dash}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:11px 26px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">${cta}</a>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;">${foot}</p>
    </div>
  </div>
</body></html>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({ from: "Gadit <notify@gadit.app>", to: partner.email, subject, html });
  } catch (e) {
    console.warn("[partner-email] welcome send failed (non-blocking):", e);
  }
}
