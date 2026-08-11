import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { FAMILY_DRIP } from "@/lib/email-drip/family-drip";
import { buildUnsubUrl } from "@/lib/email-drip/registry";
import { sendDripEmail } from "@/lib/email-drip/send";

/**
 * Admin preview for the Family onboarding drip. Sends one (or all) of the
 * Family setup emails to a chosen address so we can eyeball them without
 * waiting days for the cron. Uses the recipient's stored language.
 *
 *   GET /api/admin/family-drip-test?secret=$ADMIN_SECRET&email=<to>&key=fam-connect
 *   GET ...&key=all   → sends all three, spaced by nothing (three emails)
 *
 * Also (optional) seeds familyActivatedAt N days ago so the real cron
 * picks the sequence up for that user next run:
 *   ...&seedDaysAgo=1
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: "no ADMIN_SECRET" }, { status: 503 });
  if (sp.get("secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const email = sp.get("email")?.trim();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  // Resolve the recipient's uid + language.
  let uid = "";
  let he = false;
  try {
    const rec = await getAdminAuth().getUserByEmail(email);
    uid = rec.uid;
    const doc = await getAdminDb().collection("users").doc(uid).get();
    he = (doc.data()?.uiLang as string | undefined) === "he";
  } catch {
    // Unknown user: default to English, use a stable fake uid for the unsub link.
    uid = "preview";
  }
  // Optional language override for previews (?lang=he) — the recipient's
  // stored uiLang may be stale.
  const langOverride = sp.get("lang");
  if (langOverride) he = langOverride === "he";

  const seedDaysAgo = sp.get("seedDaysAgo");
  if (seedDaysAgo && uid && uid !== "preview") {
    const days = Math.max(0, Math.min(30, parseInt(seedDaysAgo, 10) || 0));
    const iso = new Date(Date.now() - days * 86_400_000).toISOString();
    await getAdminDb().collection("users").doc(uid).set({ familyActivatedAt: iso }, { merge: true });
  }

  const key = sp.get("key") ?? "fam-connect";
  const targets = key === "all" ? FAMILY_DRIP : FAMILY_DRIP.filter((m) => m.key === key);
  if (targets.length === 0) return NextResponse.json({ error: "unknown key", keys: FAMILY_DRIP.map((m) => m.key) }, { status: 400 });

  const sent: { key: string; ok: boolean; reason?: string }[] = [];
  for (const m of targets) {
    const built = m.build({ he, unsubscribeUrl: buildUnsubUrl(uid) });
    const r = await sendDripEmail({ to: email, subject: built.subject, html: built.html });
    sent.push({ key: m.key, ok: r.ok, reason: r.ok ? undefined : r.reason });
  }

  return NextResponse.json({ email, lang: he ? "he" : "en", seeded: !!seedDaysAgo, sent });
}
