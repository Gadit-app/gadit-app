/**
 * POST /api/schools/order
 *
 * A school registers to order Gadit (Gadi 2026-08-08). Israeli schools buy
 * a full year up front by bank transfer / purchase order against a tax
 * invoice, NOT by card, so there is no checkout here: the school fills a
 * short form, we store it as a pending order and email Gadi, and he opens
 * the school account (username + one-time code) and sends the invoice.
 *
 * Body: { schoolName, contactName, role?, email, phone?, city?, size?, notes?, lang? }
 * Response: { ok: true }
 */
import { REFERRAL_COOKIE } from "@/lib/partners";
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { getAdminDb } from "@/lib/firebase-admin";

export const maxDuration = 30;

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const SIZE_LABELS: Record<string, string> = {
  s: "עד 100 תלמידים",
  m: "101-500 תלמידים",
  l: "501-1,000 תלמידים",
  xl: "יותר מ-1,000 תלמידים",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const schoolName = clean(body?.schoolName, 160);
    const contactName = clean(body?.contactName, 120);
    const role = clean(body?.role, 80);
    const email = clean(body?.email, 200).toLowerCase();
    const phone = clean(body?.phone, 40);
    const city = clean(body?.city, 80);
    const size = clean(body?.size, 4);
    const notes = clean(body?.notes, 1000);
    const grade = clean(body?.grade, 40);
    const schoolType = clean(body?.schoolType, 24);
    const lang = clean(body?.lang, 8) || "he";
    // "pilot" = free 30-day pilot for one grade; "order" = straight order (Gadi 2026-10-08).
    const kind = body?.kind === "order" ? "order" : "pilot";

    if (!schoolName || !contactName || !isEmail(email)) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    // The partner whose link brought this school (the 60-day referral
    // cookie), so the partner's share can be booked when the school pays by
    // bank transfer (Gadi 2026-10-18).
    let partner: { id: string; code: string; name: string } | null = null;
    const refId = req.cookies.get(REFERRAL_COOKIE)?.value;
    if (refId && /^[A-Za-z0-9_-]{1,64}$/.test(refId)) {
      try {
        const ps = await getAdminDb().collection("partners").doc(refId).get();
        const pd = ps.data();
        if (ps.exists && pd?.status !== "suspended") partner = { id: ps.id, code: String(pd?.code ?? ""), name: String(pd?.name ?? "") };
      } catch { /* the order still goes through */ }
    }

    const order = {
      schoolName,
      contactName,
      role: role || null,
      email,
      phone: phone || null,
      city: city || null,
      size: size || null,
      sizeLabel: SIZE_LABELS[size] || null,
      grade: grade || null,
      schoolType: schoolType || null,
      notes: notes || null,
      lang,
      kind,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      partnerId: partner?.id ?? null,
      partnerCode: partner?.code ?? null,
    };

    try {
      await getAdminDb().collection("schoolOrders").add(order);
    } catch (e) {
      // Never lose the lead on a Firestore hiccup — the email below is the
      // real notification; the doc is a backup ledger.
      console.error("[/api/schools/order] firestore write failed:", e);
    }

    // Notify Gadi so he can open the school + send the invoice.
    try {
      const resendKey = process.env.RESEND_API_KEY;
      const notifyTo = process.env.NOTIFY_EMAIL;
      if (resendKey && notifyTo) {
        const esc = (s: string) => s.replace(/</g, "&lt;");
        await sendMail({
          from: "Gadit <notify@gadit.app>",
          to: notifyTo,
          replyTo: email,
          subject: kind === "pilot" ? `🏫 Pilot request: ${schoolName}` : `🏫 New school order: ${schoolName}`,
          html: `<p>${kind === "pilot" ? "A school asked for a FREE 30-day pilot (one grade, up to 3 classes). Book the summary meeting for day 25 when you set it up." : "A school registered to order Gadit Schools."}</p>
<p><b>School:</b> ${esc(schoolName)}<br/>
<b>Contact:</b> ${esc(contactName)}${role ? ` (${esc(role)})` : ""}<br/>
<b>Email:</b> ${esc(email)}<br/>
<b>Phone:</b> ${esc(phone || "(none)")}<br/>
<b>City:</b> ${esc(city || "(none)")}<br/>
<b>Size (participating grades):</b> ${esc(SIZE_LABELS[size] || size || "(none)")}<br/>
<b>Start grade:</b> ${esc(grade || "(none)")}<br/>
<b>School type:</b> ${esc(schoolType || "(none)")}<br/>
<b>Notes:</b> ${esc(notes || "(none)")}</p>
${partner ? `<p><b>Came through partner:</b> ${esc(partner.name)} (${esc(partner.code)}). When the school pays, book the partner's share: /admin/partners, "Manual commission".</p>` : ""}
<p>Next: open the school account + one-time code, and send the tax invoice.</p>`,
        });
      }
    } catch (e) {
      console.error("[/api/schools/order] notify email failed:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/schools/order] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
