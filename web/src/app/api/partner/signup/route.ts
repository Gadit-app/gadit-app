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
 * re-sends the code) instead of minting a duplicate. Self-signup partners
 * start on the default rates (25% / 10%); founder rates are set by hand in
 * /admin/partners.
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPartnerWelcome } from "@/lib/partner-email";
import {
  generatePartnerCode,
  generateDashboardToken,
  DEFAULT_RATE_YEAR_ONE,
  DEFAULT_RATE_LIFETIME,
  Partner,
} from "@/lib/partners";

export const maxDuration = 30;

const SITE = "https://www.gadit.app";

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
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
      await sendPartnerWelcome(p, lang);
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
      rateYearOne: DEFAULT_RATE_YEAR_ONE,
      rateLifetime: DEFAULT_RATE_LIFETIME,
      status: "active",
      dashboardToken,
      audience: audience || null,
      clicks: 0,
      signups: 0,
      ownerUid: null,
      createdAt: new Date().toISOString(),
    };
    await db.collection("partners").add(doc);

    await sendPartnerWelcome({ code, name, email, dashboardToken, rateYearOne: doc.rateYearOne, rateLifetime: doc.rateLifetime }, lang);

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
