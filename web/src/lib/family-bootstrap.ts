import { getAdminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { emailHeaderHtml, EMAIL_BG, EMAIL_CARD_MAX } from "@/lib/email-brand";
import BILLING_I18N from "@/lib/billing-email-i18n.json";

// Shared by the Stripe webhook and the Apple purchase path (2026-10-27).

// Family checkout. Idempotent: re-runs no-op via merge. Owner's role is
// "mother" by default (Gadi 2026-08-16: ~99% of family sign-ups are
// mothers, so default to mother; anyone can change it on /family after).
// familyId is the owner's Firebase Auth uid (mirrors Yooniz).
export async function bootstrapFamily(ownerUid: string, plan: "monthly" | "yearly") {
  const db = getAdminDb();
  const familyRef = db.collection("families").doc(ownerUid);
  const familySnap = await familyRef.get();
  if (!familySnap.exists) {
    await familyRef.set({
      ownerUid,
      plan,
      createdAt: new Date().toISOString(),
    });
    // Owner's own member doc — they're a full user inside their own family.
    await familyRef.collection("members").doc(ownerUid).set({
      id: ownerUid,
      role: "mother",
      name: "",
      colorIndex: 0,
      isOwner: true,
      userId: ownerUid,
      createdAt: new Date().toISOString(),
    });
    console.log(`[webhook] family bootstrapped: ${ownerUid}`);
  } else {
    await familyRef.set({ plan, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

/**
 * Customer-facing Family welcome email. Sent once when a Family
 * subscription first activates (Gadi 2026-08-03), it congratulates the
 * parent and points them straight at the first-steps checklist on /family
 * (connect the second parent, connect the kids, save to the home screen).
 * Distinct from notifyPaidActivation, which is an internal alert to us.
 * Localized he/en from the user doc's uiLang. Deduped via
 * `familyWelcomeSent`. Non-blocking.
 */
/**
 * Stamp the moment a Family plan first activated, once, so the Family
 * onboarding drip (lib/email-drip/family-drip) can key its schedule off
 * it. Read-checked so re-firing webhooks don't reset the start date.
 */
export async function stampFamilyActivated(uid: string) {
  try {
    const ref = getAdminDb().collection("users").doc(uid);
    if (!(await ref.get()).data()?.familyActivatedAt) {
      await ref.set({ familyActivatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (e) {
    console.warn("[webhook] stampFamilyActivated failed:", e);
  }
}

export async function sendFamilyWelcome(uid: string, email: string | null) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey || !email) return;
    const db = getAdminDb();
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (snap.data()?.familyWelcomeSent === true) return; // once per owner

    // Every UI language (Gadi 2026-10-11); Hebrew in the plural.
    const uiLang = (snap.data()?.uiLang as string | undefined) ?? "";
    const FW = BILLING_I18N as Record<string, { familyWelcome: (typeof BILLING_I18N)["en"]["familyWelcome"] }>;
    const lang = uiLang in FW ? uiLang : "en";
    const he = lang === "he" || lang === "ar" || lang === "fa"; // right-to-left
    const base = "https://www.gadit.app";
    const link = lang === "en" ? `${base}/family` : `${base}/${lang}/family`;
    const c = FW[lang].familyWelcome;

    const dir = he ? "rtl" : "ltr";
    const align = he ? "right" : "left";
    const html = `<!DOCTYPE html><html dir="${dir}"><body style="margin:0;padding:28px 12px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:${EMAIL_BG};color:#111827;">
  <div style="max-width:${EMAIL_CARD_MAX}px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E1EAE7;overflow:hidden;text-align:${align};">
    ${emailHeaderHtml()}
    <div style="padding:30px 36px 24px;">
      <div style="font-size:22px;font-weight:700;color:#111827;margin:0 0 16px;">${c.heading}</div>
      <p style="font-size:15px;line-height:1.6;margin:0 0 18px;">${c.intro}</p>
      <ol style="margin:0 0 22px;padding-${he ? "right" : "left"}:20px;font-size:14.5px;line-height:1.7;color:#374151;">
        <li style="margin-bottom:8px;">${c.s1}</li>
        <li style="margin-bottom:8px;">${c.s2}</li>
        <li>${c.s3}</li>
      </ol>
      <div style="text-align:center;">
        <a href="${link}" style="display:inline-block;background:#0EA5A5;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:650;font-size:15px;">${c.cta}</a>
      </div>
      <p style="font-size:13px;color:#6B7280;line-height:1.5;margin:22px 0 0;">${c.foot}</p>
    </div>
  </div>
</body></html>`;

    const res = await sendMail({
      from: "Gadit <gadi@gadit.app>",
      replyTo: "gadi@gadit.app",
      to: email,
      subject: c.subject,
      html,
    });
    if (res.error) {
      console.error("[webhook] sendFamilyWelcome resend error:", res.error);
      return;
    }
    await ref.set({ familyWelcomeSent: true, familyWelcomeSentAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("[webhook] sendFamilyWelcome failed:", e);
  }
}

