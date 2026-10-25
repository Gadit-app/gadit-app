import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isIosAppUA } from "@/lib/native-app";
import { buildPlayUpgrade } from "@/lib/email-drip/play-upgrade";
import { buildUnsubUrl } from "@/lib/email-drip/registry";
import { sendDripEmail } from "@/lib/email-drip/send";
import { sendMail } from "@/lib/mail";
import { isInternalEmail } from "@/lib/internal-accounts";

/**
 * A free user inside an app tapped something locked (Gadi 2026-10-25: Shani
 * spent ten days on Basic in the Play app without finding how to upgrade).
 *
 * Nothing may be sold in the apps, so the app shows nothing about buying.
 * Instead, outside the app:
 *  - Play (Android): the one "upgrade on the website" email goes out NOW,
 *    instead of waiting a day (lib/email-drip/play-upgrade.ts), once.
 *  - iOS app: no email (Apple 3.1.3: in-app behaviour may not be used to
 *    steer someone to buy outside the app); only recorded.
 *  - Gadi gets one alert per person, and the admin "needs attention" list
 *    shows them (api/admin/overview/attention.ts).
 *
 * POST { feature } with the user's ID token. Always answers { ok: true }.
 */

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  let uid = "", email = "", name = "";
  try {
    const t = await getAdminAuth().verifyIdToken(idToken);
    uid = t.uid; email = (t.email || "").toLowerCase();
    if (!email) return NextResponse.json({ ok: true }); // a child's device: the parent decides
    name = typeof t.name === "string" ? t.name : "";
  } catch { return NextResponse.json({ ok: true }); }

  const ios = isIosAppUA(req.headers.get("user-agent"));
  const play = !ios && req.cookies.get("gadit_play")?.value === "1";
  if (!ios && !play) return NextResponse.json({ ok: true });

  let feature = "";
  try { const b = (await req.json()) as { feature?: unknown }; feature = typeof b.feature === "string" ? b.feature.slice(0, 40) : ""; } catch { /* no body */ }

  const db = getAdminDb();
  const ref = db.collection("users").doc(uid);
  const d = (await ref.get()).data() ?? {};
  const paying = d.subscriptionStatus === "active" || d.subscriptionStatus === "trialing" || d.subscriptionStatus === "past_due";
  if (paying || d.familyId || d.schoolId || isInternalEmail(email)) return NextResponse.json({ ok: true });

  const now = Date.now();
  await ref.set({
    appUpgradeIntent: {
      count: FieldValue.increment(1),
      lastAt: now,
      ...(d.appUpgradeIntent?.firstAt ? {} : { firstAt: now }),
      platform: ios ? "ios" : "play",
      ...(feature ? { features: FieldValue.arrayUnion(feature) } : {}),
    },
    ...(play ? { playUser: true, playLastSeenAt: now, ...(d.playFirstSeenAt ? {} : { playFirstSeenAt: now }) } : {}),
  }, { merge: true });

  // Play: the upgrade email right away (once), unless they opted out.
  let emailed = false;
  if (play && !d.playUpgradeSentAt && d.emailSuppressed !== true && d.dripUnsubscribed !== true) {
    const lang = typeof d.uiLang === "string" && d.uiLang ? d.uiLang : "he";
    const built = buildPlayUpgrade(lang, name.split(/\s+/)[0] || null, buildUnsubUrl(uid));
    const r = await sendDripEmail({ to: email, subject: built.subject, html: built.html }).catch(() => ({ ok: false }));
    if (r.ok) { emailed = true; await ref.set({ playUpgradeSentAt: FieldValue.serverTimestamp(), playUpgradeTrigger: "intent" }, { merge: true }); }
  }

  // Gadi: one alert per person.
  if (!d.appIntentNotifiedAt && process.env.NOTIFY_EMAIL) {
    await ref.set({ appIntentNotifiedAt: now }, { merge: true });
    const where = ios ? "אפליקציית האייפון" : "אפליקציית Google Play";
    const note = ios
      ? "באייפון לא שולחים לו הצעת קנייה (כללי Apple). אפשר לעזור לו רק אם הוא פונה אלינו."
      : emailed ? "נשלח לו עכשיו המייל \"שדרוג באתר\" עם קישור." : (d.playUpgradeSentAt ? "המייל \"שדרוג באתר\" כבר נשלח אליו קודם." : "המייל לא נשלח (ביטל הרשמה למיילים).");
    void sendMail({
      from: "Gadit <notify@gadit.app>",
      to: process.env.NOTIFY_EMAIL,
      subject: `🔒 ניסה לשדרג מתוך האפליקציה: ${name || email}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
<p><b>${(name || "").replace(/</g, "&lt;")}</b> (${email}) בתוכנית החינמית, ב${where}, לחץ על משהו נעול${feature ? ` (${feature})` : ""}.</p>
<p>${note}</p>
<p>הרשימה המלאה: <a href="https://www.gadit.app/admin">לוח הבקרה, דורש טיפול</a>.</p>
</div>`,
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
