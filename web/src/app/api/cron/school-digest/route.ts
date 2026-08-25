import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";

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
 */

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  return !!qs && qs === process.env.ADMIN_SECRET;
}

const DEFAULT_HOUR = 15;
const DEFAULT_TZ = "Asia/Jerusalem";

// Hour (0-23) and Y-M-D in a given IANA timezone, right now.
function localParts(tz: string): { hour: number; dateKey: string } {
  try {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, hour12: false, hour: "2-digit", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    let hour = parseInt(get("hour"), 10);
    if (hour === 24) hour = 0;
    return { hour, dateKey: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: DEFAULT_TZ, hour12: false, hour: "2-digit", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    return { hour: parseInt(get("hour"), 10) % 24, dateKey: `${get("year")}-${get("month")}-${get("day")}` };
  }
}

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
    await new Resend(key).emails.send({ from: "Gadit <notify@gadit.app>", to, subject: `Gadit · ${name}: ${total} word${total === 1 ? "" : "s"} today`, html });
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

  for (const schoolDoc of schoolsSnap.docs) {
    const s = schoolDoc.data() as {
      name?: string; contactEmail?: string | null;
      dailyDigest?: { enabled?: boolean; hour?: number };
      activeHours?: { timezone?: string };
      lastDigestDate?: string;
    };
    if (s.dailyDigest?.enabled === false) continue; // opt-out only
    const hour = typeof s.dailyDigest?.hour === "number" ? s.dailyDigest.hour : DEFAULT_HOUR;
    const tz = s.activeHours?.timezone || DEFAULT_TZ;
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

  return NextResponse.json({ ok: true, dryRun, force, checked, sent, totalWords });
}
