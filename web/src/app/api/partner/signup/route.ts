/**
 * POST /api/partner/signup
 *
 * Join the partner (affiliate) program. Open to anyone — no Gadit
 * subscription or login required (Gadi 2026-07-30, mirroring Yooniz).
 *
 * Body: { name, email, audience?, lang? }
 * Response: { code, dashboardUrl }  (also emailed to the applicant)
 *
 * Idempotent by email: applying twice returns the SAME partner (and
 * re-sends the code) instead of minting a duplicate. Every applicant is
 * created as a `standard` tier partner; founder status is granted by hand
 * in /admin/partners.
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  generatePartnerCode,
  generateDashboardToken,
  Partner,
} from "@/lib/partners";

export const maxDuration = 30;

const SITE = "https://www.gadit.app";

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function sendWelcome(
  partner: Pick<Partner, "code" | "name" | "email" | "dashboardToken">,
  lang: string,
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const link = `${SITE}/p/${partner.code}`;
  const dash = `${SITE}/partner/dashboard?t=${partner.dashboardToken}`;
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
    <p style="margin:0 0 20px;">שתפו את הקישור. על כל מי שיירשם וישלם דרכו, תקבלו 25% עמלה חוזרת בשנה הראשונה, ו-10% לכל החיים.</p>
  `;
  const enBody = `
    <p style="margin:0 0 16px;">Hi ${partner.name || ""},</p>
    <p style="margin:0 0 16px;">Welcome to the Gadit Partner Program. Here's your personal link:</p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Your link</p>
    <p style="margin:0 0 20px;"><a href="${link}" style="font-size:18px;font-weight:700;color:#0EA5A5;">${link}</a></p>
    <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Your partner code</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:2px;">${partner.code}</p>
    <p style="margin:0 0 20px;">Share your link. For everyone who signs up and pays through it, you earn 25% recurring commission in year one, and 10% for life.</p>
  `;
  const cta = he ? "פתיחת האזור האישי" : "Open your dashboard";
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
      <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;">${he ? "שמרו את הקישור הזה — הוא הכניסה הפרטית לאזור שלכם, בלי סיסמה." : "Keep this link — it's your private, password-less way back into your dashboard."}</p>
    </div>
  </div>
</body></html>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Gadit <notify@gadit.app>",
      to: partner.email,
      subject,
      html,
    });
  } catch (e) {
    console.warn("[partner/signup] welcome email failed (non-blocking):", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
    const audience = typeof body?.audience === "string" ? body.audience.trim().slice(0, 500) : "";
    const lang = typeof body?.lang === "string" ? body.lang : "en";

    if (!isEmail(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const db = getAdminDb();

    // Idempotent by email — return the existing partner instead of a dup.
    const existing = await db
      .collection("partners")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (!existing.empty) {
      const p = { id: existing.docs[0].id, ...(existing.docs[0].data() as Omit<Partner, "id">) };
      await sendWelcome(p, lang);
      return NextResponse.json({
        code: p.code,
        dashboardUrl: `${SITE}/partner/dashboard?t=${p.dashboardToken}`,
        existing: true,
      });
    }

    // Mint a unique code (retry on the vanishing chance of collision).
    let code = "";
    for (let i = 0; i < 6; i++) {
      const candidate = generatePartnerCode();
      const clash = await db.collection("partners").where("code", "==", candidate).limit(1).get();
      if (clash.empty) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return NextResponse.json({ error: "code_generation_failed" }, { status: 500 });
    }

    const dashboardToken = generateDashboardToken();
    const doc: Omit<Partner, "id"> = {
      code,
      name,
      email,
      tier: "standard",
      status: "active",
      dashboardToken,
      audience: audience || null,
      clicks: 0,
      signups: 0,
      ownerUid: null,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("partners").add(doc);

    await sendWelcome({ code, name, email, dashboardToken }, lang);

    // Tell Gadi a partner joined (reuse the notify address).
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const notifyTo = process.env.NOTIFY_EMAIL;
      if (resendKey && notifyTo) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Gadit <notify@gadit.app>",
          to: notifyTo,
          subject: `🤝 New partner: ${name || email}`,
          html: `<p>New Gadit partner joined.</p><p><b>Name:</b> ${name || "(none)"}<br/><b>Email:</b> ${email}<br/><b>Code:</b> ${code}<br/><b>Audience:</b> ${(audience || "(none)").replace(/</g, "&lt;")}</p>`,
        });
      }
    } catch { /* non-blocking */ }

    return NextResponse.json({
      code,
      dashboardUrl: `${SITE}/partner/dashboard?t=${dashboardToken}`,
    });
  } catch (err) {
    console.error("[/api/partner/signup] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
