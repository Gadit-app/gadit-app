import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";
import { emailHeaderHtml, EMAIL_BG } from "@/lib/email-brand";

/**
 * Daily digest email to Gadi: engine (OpenAI) spend + subscription state.
 *
 * OpenAI does NOT expose the remaining credit balance via API, so this reports
 * what we CAN measure reliably: yesterday's spend and the 7-day trend from our
 * own aiUsage rollups (lib/ai-cost.ts), plus the live subscription picture from
 * Stripe (MRR, paying customers, trials, failed renewals). The 429 outage alert
 * (lib/engine-alert.ts) covers the "balance ran out" case separately.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Manual run: GET /api/cron/daily-digest?secret=$ADMIN_SECRET
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Bucket = { cost?: number; calls?: number };
type DayDoc = { day: string; totalCost?: number; adminCost?: number; totalCalls?: number; features?: Record<string, Bucket> };

function dayKey(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function usd(n: number): string {
  return "$" + (n >= 1 ? n.toFixed(2) : n.toFixed(3));
}

const FEATURE_HE: Record<string, string> = {
  define: "הגדרה מלאה", define_context: "הגדרה לפי הקשר", define_retry: "ניסיון חוזר",
  reader_word_tap: "מילה בקורא", quick_define_miss: "תצוגה מקדימה", reader_sentence: "משפט בקורא",
  image: "תמונה", image_kids: "תמונה (ילדים)", image_brief: "תיאור תמונה",
  tashkeel_arabic: "ניקוד ערבי", backfill_gloss: "השלמת תרגום",
  word_idioms: "ניבים וצירופים", word_question: "שאלות על מילה", passage_words: "מילים חשובות בקטע",
  spell_set: "תרגול הכתבה", spell_set_list: "רשימת הכתבה", etymology_fallback: "מקור המילה",
  kids: "הסבר לילדים", notebook: "מחברת", tts: "הקראה",
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const qsecret = req.nextUrl.searchParams.get("secret");
  const ok =
    (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) ||
    (process.env.ADMIN_SECRET && qsecret === process.env.ADMIN_SECRET);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getAdminDb();

  // --- Engine spend (our aiUsage rollups) ---
  let yesterdayCost = 0, sevenDayCost = 0, yesterdayAdmin = 0, routineDaily = 0;
  let topFeatures: Array<[string, number]> = [];
  try {
    const snap = await db.collection("aiUsage").orderBy("day", "desc").limit(8).get();
    const docs = snap.docs.map((d) => d.data() as DayDoc);
    const yKey = dayKey(-1);
    const yDoc = docs.find((d) => d.day === yKey);
    yesterdayCost = yDoc?.totalCost ?? 0;
    yesterdayAdmin = yDoc?.adminCost ?? 0;
    // 7-day total = the 7 most recent days excluding today (partial).
    const week = docs.filter((d) => d.day !== dayKey(0)).slice(0, 7);
    sevenDayCost = week.reduce((s, d) => s + (d.totalCost ?? 0), 0);
    // The forecast is ROUTINE use only (Gadi 2026-10-07: one SEO warm-up day
    // of $138 turned into a $799 monthly forecast). Admin runs and bulk jobs
    // (adminCost) are left out, and the median day is used, so a single
    // one-off spike does not move it.
    const routine = week.map((d) => Math.max(0, (d.totalCost ?? 0) - (d.adminCost ?? 0))).sort((a, b) => a - b);
    routineDaily = routine.length ? routine[Math.floor(routine.length / 2)] : 0;
    if (yDoc?.features) {
      topFeatures = Object.entries(yDoc.features)
        .map(([k, v]) => [k, v.cost ?? 0] as [string, number])
        .sort((a, b) => b[1] - a[1]).slice(0, 4);
    }
  } catch { /* engine data best-effort */ }
  const projMonthly = routineDaily * 30;

  // --- Subscription state (Stripe, live) ---
  let rev: Awaited<ReturnType<typeof summarizeStripeRevenue>> | null = null;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    rev = await summarizeStripeRevenue(stripe);
  } catch { /* revenue best-effort */ }

  // ---- Email layout (Gadi 2026-10-02: easier to scan, a framed card with
  // clear section headings and big numbers, not one block of text). ----
  const num = (v: string) => `<span dir="ltr" style="unicode-bidi:isolate;">${v}</span>`;
  const tile = (label: string, value: string, opts: { big?: boolean; color?: string } = {}) =>
    `<td width="33%" style="padding:4px;vertical-align:top;">
      <div style="background:#F6FAF9;border:1px solid #E3ECE9;border-radius:12px;padding:12px 10px;text-align:center;">
        <div style="font-size:12px;color:#6B7280;margin:0 0 4px;">${label}</div>
        <div style="font-size:${opts.big ? 22 : 19}px;font-weight:700;color:${opts.color ?? "#0B1220"};line-height:1.2;">${value}</div>
      </div>
    </td>`;
  const section = (title: string, sub: string, inner: string) =>
    `<div style="margin:0 0 18px;border:1px solid #E3ECE9;border-radius:14px;overflow:hidden;">
      <div style="background:#E8F5F3;padding:11px 16px;border-bottom:1px solid #D6EAE6;">
        <span style="font-size:16px;font-weight:700;color:#0B6E6E;">${title}</span>
        <span style="font-size:12px;color:#5A7F7B;margin-right:6px;">${sub}</span>
      </div>
      <div style="padding:12px 12px 14px;">${inner}</div>
    </div>`;

  const featureRows = topFeatures.map(([k, c], i) =>
    `<tr><td style="padding:7px 4px;color:#374151;font-size:14px;${i ? "border-top:1px solid #EEF2F1;" : ""}">${FEATURE_HE[k] ?? k}</td>
     <td style="padding:7px 4px;font-weight:700;font-size:14px;text-align:left;${i ? "border-top:1px solid #EEF2F1;" : ""}">${num(usd(c))}</td></tr>`
  ).join("");

  const engineInner = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
      ${tile("אתמול", num(usd(yesterdayCost)), { big: true })}
      ${tile("7 ימים", num(usd(sevenDayCost)))}
      ${tile("תחזית לחודש", `${num(usd(projMonthly))}<div style="font-size:11.5px;font-weight:500;color:#6B7280;margin-top:2px;">לפי שימוש רגיל</div>`)}
    </tr></table>
    ${yesterdayAdmin >= 0.01 ? `<div style="margin:10px 4px 0;font-size:13px;color:#8A5A00;">מתוך אתמול, הרצות מנהל חד פעמיות: <b>${num(usd(yesterdayAdmin))}</b>. הן לא נכללות בתחזית.</div>` : ""}
    ${featureRows ? `<div style="margin:14px 4px 0;font-size:12.5px;font-weight:700;color:#6B7280;">לפי כלי (אתמול)</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:4px 0 0;">${featureRows}</table>` : ""}
    <div style="margin:12px 4px 0;font-size:12px;color:#8A9693;line-height:1.5;">יתרת הקרדיט לא זמינה אוטומטית. אם היא נגמרת, תגיע התראה נפרדת.</div>`;

  const failed = rev?.pastDueCount ?? 0;
  const subsInner = rev ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>
      ${tile("הכנסה חודשית", num(usd(rev.mrrUsd)), { big: true, color: "#0B6E6E" })}
      ${tile("לקוחות משלמים", num(String(rev.activePayingCustomers)))}
      ${tile("בניסיון", `${num(String(rev.trialingCount))}<div style="font-size:11.5px;font-weight:500;color:#6B7280;margin-top:2px;">${rev.trialingCardedCount} עם כרטיס</div>`)}
    </tr></table>
    <div style="margin:10px 4px 0;font-size:13px;color:#6B7280;">הכנסה שנתית צפויה: <b style="color:#0B1220;">${num(usd(rev.arrUsd))}</b></div>
    <div style="margin:12px 4px 0;padding:10px 12px;border-radius:10px;font-size:14px;font-weight:700;${failed
      ? "background:#FEF2F2;border:1px solid #FCD4D4;color:#B91C1C;"
      : "background:#ECFDF5;border:1px solid #CDEFE0;color:#0E7A52;"}">
      ${failed
        ? `תשלומים שנכשלו: ${num(String(failed))} · ${num(usd(rev.atRiskMrrUsd))} לחודש בסיכון`
        : "אין תשלומים שנכשלו"}
    </div>` : `<div style="font-size:14px;color:#B45309;padding:4px;">לא ניתן היה למשוך את נתוני המנויים הבוקר.</div>`;

  const dateHe = new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const btn = (href: string, label: string) =>
    `<a href="${href}" style="display:inline-block;margin:4px;padding:8px 14px;border-radius:999px;background:#F1F6F5;border:1px solid #DCE7E4;color:#0B6E6E;font-size:13px;font-weight:700;text-decoration:none;">${label}</a>`;

  const html = `<!DOCTYPE html><html dir="rtl"><body style="margin:0;padding:24px 10px;background:${EMAIL_BG};font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111827;">
  <div dir="rtl" style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E1EAE7;overflow:hidden;text-align:right;">
    ${emailHeaderHtml()}
    <div style="padding:22px 24px 8px;">
      <div style="font-size:22px;font-weight:700;color:#0B1220;margin:0 0 2px;">דוח יומי</div>
      <div style="font-size:13px;color:#6B7280;margin:0 0 18px;">${dateHe}</div>
      ${section("עלות המנוע", "OpenAI", engineInner)}
      ${section("מצב מנויים", "Stripe", subsInner)}
      <div style="text-align:center;margin:4px 0 18px;">
        ${btn("https://www.gadit.app/admin", "סקירת אדמין")}${btn("https://www.gadit.app/admin/ai-costs", "עלויות מנוע")}${btn("https://www.gadit.app/admin/activity", "לוג פעילות")}
      </div>
    </div>
  </div>
</body></html>`;

  // --- Send ---
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: false, error: "no_resend_key", yesterdayCost, sevenDayCost });
  const to = process.env.ALERT_EMAIL || "gadi@gadit.app";
  try {
    await sendMail({
      from: "Gadit <notify@gadit.app>",
      to,
      replyTo: "gadi@gadit.app",
      subject: `Gadit · דוח יומי · מנוע ${usd(yesterdayCost)} אתמול${rev ? ` · ${usd(rev.mrrUsd)} MRR` : ""}`,
      html,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "send_failed", details: String(e) }, { status: 502 });
  }

  return NextResponse.json({ ok: true, to, yesterdayCost, sevenDayCost, projMonthly, mrr: rev?.mrrUsd ?? null });
}
