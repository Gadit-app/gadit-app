import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendDripEmail } from "@/lib/email-drip/send";
import { localParts, schoolTimezone } from "@/lib/school-day-report";
import {
  isMonthKey,
  prevMonthKey,
  renderSchoolMonthReport,
  schoolMonthReport,
  schoolMonthlyReportEnabled,
  schoolMonthlySkipReason,
} from "@/lib/school-month-report";

/**
 * GET /api/admin/school-month-report-preview?secret=&school=<schoolId or contact email>[&month=YYYY-MM][&lang=he|en][&to=<test address>]
 *
 * The monthly school report for one school, as HTML, with that school's real
 * numbers. `month` defaults to the last full month in the school's timezone;
 * the running month gives "so far" numbers. `lang` overrides the school's
 * language. With `to`, the rendered email is also sent to that test address
 * only (never to the school), marked [TEST] in the subject. Nothing is
 * written to the school's ledger. A text summary sits in an HTML comment at
 * the top of the page.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const s = q.get("secret") ?? "";
  if (!process.env.ADMIN_SECRET || s !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const schoolQ = (q.get("school") ?? "").trim();
  if (!schoolQ) return NextResponse.json({ error: "school_required" }, { status: 400 });
  const lang = q.get("lang");
  const to = (q.get("to") ?? "").trim();
  const db = getAdminDb();

  let schoolId = schoolQ;
  if (schoolQ.includes("@")) {
    const hit = await db.collection("schools").where("contactEmail", "==", schoolQ).limit(1).get();
    if (hit.empty) return NextResponse.json({ error: "school_not_found", school: schoolQ }, { status: 404 });
    schoolId = hit.docs[0].id;
  }
  const sDoc = await db.collection("schools").doc(schoolId).get();
  if (!sDoc.exists) return NextResponse.json({ error: "school_not_found", school: schoolQ }, { status: 404 });

  let month = (q.get("month") ?? "").trim();
  if (!month) month = prevMonthKey(localParts(schoolTimezone(sDoc.data() ?? {})).dateKey.slice(0, 7));
  if (!isMonthKey(month)) return NextResponse.json({ error: "bad_month", month }, { status: 400 });

  const r = await schoolMonthReport(db, schoolId, month, { lang });
  if (!r) return NextResponse.json({ error: "school_not_found", school: schoolQ }, { status: 404 });
  const built = renderSchoolMonthReport(r, { unsubscribeUrl: "https://www.gadit.app/" });

  const skip = schoolMonthlySkipReason(r);
  const info = [
    built.text,
    `recipient=${r.to ?? "none"} ${skip ? `(would NOT be sent: ${skip})` : "(would be sent)"}`,
    `ledger lastSent=${r.lastSent ?? "never"} digestHour=${r.digestHour}`,
    `switch=${(await schoolMonthlyReportEnabled(db)) ? "on" : "off"}`,
  ].join("\n");

  let sent = "";
  if (to) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return NextResponse.json({ error: "bad_to" }, { status: 400 });
    const res = await sendDripEmail({ to, subject: `[TEST] ${built.subject}`, html: built.html });
    sent = res.ok ? `test sent to ${to}` : `test send failed: ${res.reason}`;
  }
  const comment = `${info}${sent ? `\n${sent}` : ""}`.replace(/--/g, "");
  return new NextResponse(`<!-- ${comment} -->\n${built.html}`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
