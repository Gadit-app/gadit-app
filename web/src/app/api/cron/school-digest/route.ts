import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import { getAdminDb } from "@/lib/firebase-admin";
import { localParts, schoolTimezone } from "@/lib/school-day-report";
import { prevMonthKey, schoolMonthlyReportEnabled, sendSchoolMonthReport } from "@/lib/school-month-report";

/**
 * Daily school summary. Runs hourly from a Vercel cron; each school fires once
 * a day at its chosen local hour (default 15:00) with every word its students
 * looked up that day. Opt-OUT: on by default the moment a school signs up
 * (a missing dailyDigest, or dailyDigest.enabled !== false, counts as on).
 *
 * A `lastDigestDate` guard (the school's local Y-M-D) makes it idempotent so a
 * double cron run in the same hour never sends twice.
 *
 * Auth: Vercel cron `Authorization: Bearer <CRON_SECRET>`, or a manual run with
 * `?secret=<ADMIN_SECRET>&dryRun=1` (and optional `&force=1` to ignore the
 * hour/already-sent guards for testing).
 *
 * The same run sends the MONTHLY school report (lib/school-month-report.ts):
 * on the 1st of the month (school's local date), at the school's digest hour,
 * about the month that just ended, once per school per month (ledger
 * schools/{id}.monthlyReportSent = "YYYY-MM"), only while
 * emailConfig/schoolMonthlyReport.enabled === true. It does not depend on the
 * daily digest being on, and `force` never sends it (use the admin preview,
 * /api/admin/school-month-report-preview, to test). A dry run lists who would
 * get it on this run without sending or writing anything.
 */

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  return !!qs && qs === process.env.ADMIN_SECRET;
}

const DEFAULT_HOUR = 15;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

async function sendDigestEmail(to: string, schoolName: string, words: { word: string; count: number }[], students: string[], total: number) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const name = schoolName || "your school";
  const chips = words
    .map((w) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:6px 12px;border-radius:999px;background:#ECFEFF;border:1px solid #A5F3F0;color:#0E7490;font-size:14px;font-weight:600">${esc(w.word)}${w.count > 1 ? ` <b style="color:#0EA5A5">${w.count}</b>` : ""}</span>`)
    .join("");
  const studentLine = students.length
    ? `<p style="margin:0 0 14px;font-size:13px;color:#78716c">${students.length} student${students.length === 1 ? "" : "s"} active today: ${esc(students.slice(0, 12).join(", "))}${students.length > 12 ? "…" : ""}</p>`
    : "";
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1c1917">
    <div style="font-size:20px;font-weight:800;margin-bottom:2px">Gad<span style="color:#0EA5A5;font-style:italic">it</span></div>
    <p style="margin:0 0 4px;font-size:15px;color:#57534e">Today at <b>${esc(name)}</b></p>
    <p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#0EA5A5">${total} word${total === 1 ? "" : "s"} looked up</p>
    ${studentLine}
    <div>${chips || '<span style="color:#a8a29e;font-size:14px">No lookups today.</span>'}</div>
    <div style="margin-top:22px;font-size:12px;color:#a8a29e">You can turn this daily summary off in your Gadit school settings.</div>
  </div>`;
  try {
    await sendMail({ scheduled: true, from: "Gadit <notify@gadit.app>", to, subject: `Gadit · ${name}: ${total} word${total === 1 ? "" : "s"} today`, html });
  } catch (e) {
    console.error("[school-digest] email error:", e);
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const force = req.nextUrl.searchParams.get("force") === "1";
  const db = getAdminDb();

  const schoolsSnap = await db.collection("schools").get();
  let checked = 0, sent = 0, totalWords = 0;
  const monthlyOn = await schoolMonthlyReportEnabled(db);
  const monthly: Array<{ school: string; month: string; result: string }> = [];

  for (const schoolDoc of schoolsSnap.docs) {
    const s = schoolDoc.data() as {
      name?: string; contactEmail?: string | null;
      dailyDigest?: { enabled?: boolean; hour?: number };
      activeHours?: { timezone?: string };
      curriculum?: string;
      timezone?: string;
      lastDigestDate?: string;
      monthlyReportSent?: string;
    };

    // Monthly report: the 1st of the month at the digest hour, demo schools never.
    if (monthlyOn && (s as { isDemo?: boolean }).isDemo !== true) {
      const mHour = typeof s.dailyDigest?.hour === "number" ? s.dailyDigest.hour : DEFAULT_HOUR;
      const { hour: mNow, dateKey: mDate } = localParts(schoolTimezone(s));
      const month = prevMonthKey(mDate.slice(0, 7));
      if (mDate.endsWith("-01") && mNow === mHour && s.monthlyReportSent !== month) {
        if (dryRun) {
          monthly.push({ school: schoolDoc.id, month, result: "due (dry run)" });
        } else {
          try {
            const r = await sendSchoolMonthReport(db, schoolDoc, month);
            monthly.push({ school: schoolDoc.id, month, result: r.ok ? (r.sent ? "sent" : `skipped: ${r.reason}`) : `failed: ${r.reason}` });
          } catch (e) {
            console.error("[school-digest] monthly report error:", e);
            monthly.push({ school: schoolDoc.id, month, result: `failed: ${String(e)}` });
          }
        }
      }
    }

    if (s.dailyDigest?.enabled === false) continue; // opt-out only
    // A demo school never gets the digest (Gadi 2026-10-17: they were mailing @gadit.app every day).
    if ((s as { isDemo?: boolean }).isDemo) continue;
    const hour = typeof s.dailyDigest?.hour === "number" ? s.dailyDigest.hour : DEFAULT_HOUR;
    const tz = schoolTimezone(s);
    const { hour: nowHour, dateKey } = localParts(tz);
    if (!force && nowHour !== hour) continue;
    if (!force && s.lastDigestDate === dateKey) continue; // already sent today
    checked++;

    // Every classroom search from the last 24h (ISO strings sort lexically).
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const wordCounts = new Map<string, number>();
    const studentSet = new Set<string>();
    let total = 0;
    const classes = await schoolDoc.ref.collection("classrooms").get();
    for (const cls of classes.docs) {
      const searches = await cls.ref.collection("searches").where("at", ">=", cutoff).get();
      for (const d of searches.docs) {
        const x = d.data() as { word?: string; studentName?: string };
        const w = (x.word ?? "").trim();
        if (!w) continue;
        total++;
        wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
        const sn = (x.studentName ?? "").trim();
        if (sn) studentSet.add(sn);
      }
    }

    if (!dryRun) await db.collection("schools").doc(schoolDoc.id).set({ lastDigestDate: dateKey }, { merge: true });
    if (total === 0) continue; // nothing to report; don't spam

    const words = [...wordCounts.entries()].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 60);
    if (!dryRun && s.contactEmail) await sendDigestEmail(s.contactEmail, s.name ?? "", words, [...studentSet], total);
    sent++;
    totalWords += total;
  }

  return NextResponse.json({ ok: true, dryRun, force, checked, sent, totalWords, monthly: { switch: monthlyOn ? "on" : "off", results: monthly } });
}
