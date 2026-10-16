import { createHash } from "node:crypto";
import Stripe from "stripe";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { sendPartnerWelcome } from "@/lib/partner-email";
import { isCollegeGrad } from "@/lib/college-grads";
import {
  generatePartnerCode,
  generateDashboardToken,
  FOUNDER_RATE_YEAR_ONE,
  DEFAULT_RATE_LIFETIME,
  Partner,
} from "@/lib/partners";

/**
 * Coach-track graduates of the college become founder partners automatically
 * (Gadi 2026-10-16): 30% of every payment in year one, then 10% of every
 * payment for life, renewals included. Checked at signup and again when the
 * customer starts paying. A graduate is matched by the hash of the e-mail or
 * of the last 9 phone digits against the college's list (lib/college-grads).
 * Everyone else is NOT enrolled: the partner link is for the college's
 * coach-track people only.
 *
 * Idempotent: a customer who is already a partner (same e-mail, or a partner
 * doc owned by this uid) is skipped, and a lock doc per e-mail stops two
 * deliveries from creating two partners. Never throws: signup and
 * provisioning must not depend on it.
 */

/** Every phone we may know for this user: the auth record, the user doc and
 *  the Stripe customer. Read only to hash them for the graduate check. */
async function knownPhones(uid: string, user: Record<string, unknown>, extra: (string | null | undefined)[]): Promise<string[]> {
  const out = new Set<string>();
  const add = (v: unknown) => { if (typeof v === "string" && v.trim()) out.add(v); };
  extra.forEach(add);
  add(user.phone); add(user.phoneNumber);
  try { add((await getAdminAuth().getUser(uid)).phoneNumber); } catch { /* no auth record */ }
  const cust = typeof user.stripeCustomerId === "string" ? user.stripeCustomerId : null;
  if (cust && process.env.STRIPE_SECRET_KEY) {
    try {
      const c = await new Stripe(process.env.STRIPE_SECRET_KEY).customers.retrieve(cust);
      if (!("deleted" in c && c.deleted)) add((c as Stripe.Customer).phone);
    } catch { /* customer unreadable: e-mail match still applies */ }
  }
  return [...out];
}

export async function autoEnrollPartner(uid: string, email: string | null, phones: (string | null | undefined)[] = []): Promise<void> {
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
    const user = (await db.collection("users").doc(uid).get()).data() ?? {};
    // Only coach-track graduates. null = the college list is unreachable right
    // now: skip quietly, the next signup or payment event checks again.
    if ((await isCollegeGrad(mail, await knownPhones(uid, user, phones))) !== true) return;

    const lock = db.collection("partnerAutoEnroll").doc(createHash("sha256").update(mail).digest("hex").slice(0, 32));
    try {
      await lock.create({ uid, at: new Date().toISOString() });
    } catch {
      return; // another delivery is enrolling this customer
    }

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
      audience: "College coach-track graduate (auto-enrolled founder)",
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
