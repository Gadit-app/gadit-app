import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { sendDripEmail } from "@/lib/email-drip/send";
import {
  buildWeeklyReport,
  renderWeeklyReport,
  sampleReportChildren,
  weeklyReportEligible,
  weeklyReportEnabled,
  isoWeekIL,
  isSundayIL,
} from "@/lib/email-drip/weekly-report";

/**
 * GET /api/admin/weekly-report-preview?secret=&email=<owner>&lang=he[&to=<test address>]
 *
 * The weekly parent report for one Family owner, as HTML, with that family's
 * real numbers (the same as their parent dashboard). Without `email`, a
 * sample family. `lang` overrides the owner's language (he / en; any other
 * reads the English email). With `to`, the rendered email is also sent to
 * that test address only (never to the owner), marked [TEST] in the subject.
 * Nothing is written to the owner's ledger (Gadi 2026-10-21).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const s = q.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET || s !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const lang = q.get("lang");
  const email = (q.get("email") ?? "").trim().toLowerCase();
  const to = (q.get("to") ?? "").trim();
  const db = getAdminDb();

  let subject: string;
  let html: string;
  let info: string;
  if (email) {
    let uid: string;
    let displayName = "";
    try {
      const u = await getAdminAuth().getUserByEmail(email);
      uid = u.uid;
      displayName = u.displayName?.trim() || "";
    } catch {
      return NextResponse.json({ error: "user_not_found", email }, { status: 404 });
    }
    const d = (await db.collection("users").doc(uid).get()).data() ?? {};
    const owner = d.familyId === uid ? uid : typeof d.familyId === "string" && d.familyId ? d.familyId : uid;
    const ownerDoc = owner === uid ? d : (await db.collection("users").doc(owner).get()).data() ?? {};
    const nm = displayName || (typeof ownerDoc.displayName === "string" ? ownerDoc.displayName.trim() : "");
    const built = await buildWeeklyReport({ ownerUid: owner, d: ownerDoc, firstName: nm.split(/\s+/)[0] || null, lang });
    if (!built) return NextResponse.json({ ok: false, reason: "no_child", note: "This family has no child (boy / girl), so no weekly report is sent." });
    subject = built.subject;
    html = built.html;
    const now = Date.now();
    const ownerEmail = owner === uid ? email : await getAdminAuth().getUser(owner).then((x) => x.email ?? null, () => null);
    info = [
      built.text,
      `owner=${owner === uid ? "this account" : "family owner of this member"}`,
      // Would the Sunday cron send it to the owner (status, owner, internal, unsubscribed)?
      `eligible=${weeklyReportEligible(owner, ownerEmail, ownerDoc)}`,
      `status=${String(ownerDoc.subscriptionStatus ?? "")}`,
      `week=${isoWeekIL(now)} lastSent=${String(ownerDoc.weeklyReportSent ?? "never")} sundayIL=${isSundayIL(now)}`,
      `switch=${(await weeklyReportEnabled(db)) ? "on" : "off"}`,
    ].join("\n");
  } else {
    const l = lang === "he" ? "he" : "en";
    const r = renderWeeklyReport(sampleReportChildren(l), { lang: l, firstName: l === "he" ? "דנה" : "Dana", unsubscribeUrl: "https://www.gadit.app/" });
    subject = r.subject;
    html = r.html;
    info = `${r.text}\n(sample family)`;
  }

  let sent = "";
  if (to) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: "bad_to" }, { status: 400 });
    const r = await sendDripEmail({ to, subject: `[TEST] ${subject}`, html });
    sent = r.ok ? `test sent to ${to}` : `test send failed: ${r.reason}`;
  }
  const comment = `${info}${sent ? `\n${sent}` : ""}`.replace(/--/g, "");
  return new NextResponse(`<!-- ${comment} -->\n${html}`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
