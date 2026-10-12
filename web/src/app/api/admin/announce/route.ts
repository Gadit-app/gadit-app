/**
 * Send a "what's new" email (lib/email-drip/announcements.ts) to every
 * subscriber, once each (Gadi 2026-10-12). Admin only.
 *
 *   GET ?secret=…&id=2026-10-homework              → dry run: who would get it, in which language
 *   GET ?secret=…&id=…&to=someone@example.com      → one test send to that address (Hebrew unless &lang=en)
 *   GET ?secret=…&id=…&send=1                       → the real send; skips anyone who already got it
 *
 * Audience "family": the owners of a Family subscription (active, past_due
 * or trialing), never our own accounts, never an unsubscribed or suppressed
 * address. Sends are scheduled, so they wait out Shabbat.
 */
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { ANNOUNCEMENTS } from "@/lib/email-drip/announcements";
import { renderFamilyMail } from "@/lib/email-drip/family-drip";
import { buildUnsubUrl } from "@/lib/email-drip/registry";
import { sendDripEmail } from "@/lib/email-drip/send";
import { isInternalEmail, isPayingStatus } from "@/lib/internal-accounts";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (!process.env.ADMIN_SECRET || q.get("secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const a = ANNOUNCEMENTS.find((x) => x.id === q.get("id"));
  if (!a) return NextResponse.json({ error: "unknown_id", ids: ANNOUNCEMENTS.map((x) => x.id) }, { status: 404 });
  const meta = { key: `announce-${a.id}`, label: a.id, dayOffset: 0, ctaUrlTab: "", ctaPath: a.ctaPath, v2: true };
  const build = (lang: string, uid: string, firstName: string | null) => {
    const content = lang === "he" ? a.he : a.t?.[lang] ?? a.en;
    const use = lang === "he" || a.t?.[lang] ? lang : "en";
    return renderFamilyMail(meta, use, content, { unsubscribeUrl: buildUnsubUrl(uid), firstName });
  };

  // One test send, to the address given.
  const to = q.get("to");
  if (to) {
    const mail = build(q.get("lang") === "en" ? "en" : "he", "test", null);
    const r = await sendDripEmail({ to, subject: mail.subject, html: mail.html });
    return NextResponse.json({ test: true, to, ...r });
  }

  const db = getAdminDb();
  const snap = await db.collection("users").get();
  const send = q.get("send") === "1";
  const out: Array<{ email: string; lang: string; status: string }> = [];
  for (const doc of snap.docs) {
    const d = doc.data() as Record<string, unknown>;
    const status = d.subscriptionStatus;
    const subscriber = isPayingStatus(status) || status === "trialing";
    if (!subscriber) continue;
    if (a.audience === "family" && d.familyId !== doc.id) continue;
    if (d.dripUnsubscribed === true || d.emailSuppressed === true) continue;
    let email = typeof d.email === "string" ? d.email : null;
    let name = typeof d.displayName === "string" ? d.displayName : "";
    try { const u = await getAdminAuth().getUser(doc.id); email = u.email ?? email; name = name || u.displayName || ""; } catch { /* doc values */ }
    if (!email || isInternalEmail(email)) continue;
    const sent = (d.announcementsSent as Record<string, unknown> | undefined)?.[a.id];
    const lang = typeof d.uiLang === "string" && d.uiLang ? d.uiLang : d.dripLang === "he" || d.country === "IL" ? "he" : "en";
    if (sent) { out.push({ email, lang, status: "already" }); continue; }
    if (!send) { out.push({ email, lang, status: "would_send" }); continue; }
    const mail = build(lang, doc.id, name.split(/\s+/)[0] || null);
    const r = await sendDripEmail({ to: email, subject: mail.subject, html: mail.html, scheduled: true });
    if (r.ok) await doc.ref.set({ announcementsSent: { [a.id]: FieldValue.serverTimestamp() } }, { merge: true });
    out.push({ email, lang, status: r.ok ? "sent" : `failed: ${r.reason}` });
  }
  const count = (s: string) => out.filter((x) => x.status === s).length;
  return NextResponse.json({ id: a.id, send, total: out.length, wouldSend: count("would_send"), sent: count("sent"), already: count("already"), rows: out });
}
