import { createHash } from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPartnerWelcome } from "@/lib/partner-email";
import {
  generatePartnerCode,
  generateDashboardToken,
  FOUNDER_RATE_YEAR_ONE,
  DEFAULT_RATE_LIFETIME,
  Partner,
} from "@/lib/partners";

/**
 * Every new subscriber becomes a partner (Gadi 2026-10-16: "everyone who signs
 * up, a college director or any student, gets the partner link directly").
 * Called once a Family or Individual subscription first activates (trial with a
 * card included). Same founder terms as the one-off bootstrap of 2026-08-17
 * (30% year one, 10% for life), welcome e-mail in the customer's UI language.
 *
 * Idempotent: a customer who is already a partner (same e-mail, or a partner
 * doc owned by this uid) is skipped, and a lock doc per e-mail stops two
 * webhook deliveries from creating two partners. Never throws: provisioning
 * must not depend on it.
 */
/** OFF (Gadi 2026-10-16): the partner link goes only to the college's coach-track
 *  students, not to every subscriber. Stays off until that audience is identified. */
const AUTO_ENROLL_ENABLED = false;

export async function autoEnrollPartner(uid: string, email: string | null): Promise<void> {
  if (!AUTO_ENROLL_ENABLED) return;
  try {
    const mail = (email ?? "").trim().toLowerCase();
    if (!mail || !mail.includes("@")) return;
    const db = getAdminDb();
    const [byEmail, byOwner] = await Promise.all([
      db.collection("partners").where("email", "==", mail).limit(1).get(),
      db.collection("partners").where("ownerUid", "==", uid).limit(1).get(),
    ]);
    if (!byEmail.empty || !byOwner.empty) return;
    // Partners created by hand may keep the e-mail's original casing.
    if (email && email.trim() !== mail) {
      const asTyped = await db.collection("partners").where("email", "==", email.trim()).limit(1).get();
      if (!asTyped.empty) return;
    }
    const lock = db.collection("partnerAutoEnroll").doc(createHash("sha256").update(mail).digest("hex").slice(0, 32));
    try {
      await lock.create({ uid, at: new Date().toISOString() });
    } catch {
      return; // another delivery is enrolling this customer
    }

    const user = (await db.collection("users").doc(uid).get()).data() ?? {};
    const name = String(user.displayName || user.name || mail.split("@")[0]);
    const lang = typeof user.uiLang === "string" && user.uiLang ? user.uiLang : "he";

    let code = "";
    for (let i = 0; i < 6 && !code; i++) {
      const candidate = generatePartnerCode();
      const clash = await db.collection("partners").where("code", "==", candidate).limit(1).get();
      if (clash.empty) code = candidate;
    }
    if (!code) { await lock.delete().catch(() => {}); return; }

    const dashboardToken = generateDashboardToken();
    const doc: Omit<Partner, "id"> = {
      code,
      name,
      email: mail,
      tier: "founder",
      rateYearOne: FOUNDER_RATE_YEAR_ONE,
      rateLifetime: DEFAULT_RATE_LIFETIME,
      status: "active",
      dashboardToken,
      lang,
      audience: "Subscriber (auto-enrolled founder on activation)",
      clicks: 0,
      signups: 0,
      ownerUid: uid,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("partners").add(doc);
    await lock.set({ partnerId: ref.id }, { merge: true });
    await sendPartnerWelcome({ code, name, email: mail, dashboardToken, rateYearOne: doc.rateYearOne, rateLifetime: doc.rateLifetime }, lang);
  } catch (e) {
    console.warn("[partner-auto] enroll failed (non-blocking):", e);
  }
}
