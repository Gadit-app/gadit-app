import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { summarizeStripeRevenue } from "@/lib/admin-revenue";

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
type DayDoc = { day: string; totalCost?: number; totalCalls?: number; features?: Record<string, Bucket> };

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
  let yesterdayCost = 0, sevenDayCost = 0;
  let topFeatures: Array<[string, number]> = [];
  try {
    const snap = await db.collection("aiUsage").orderBy("day", "desc").limit(8).get();
    const docs = snap.docs.map((d) => d.data() as DayDoc);
    const yKey = dayKey(-1);
    const yDoc = docs.find((d) => d.day === yKey);
    yesterdayCost = yDoc?.totalCost ?? 0;
    // 7-day total = the 7 most recent days excluding today (partial).
    sevenDayCost = docs.filter((d) => d.day !== dayKey(0)).slice(0, 7).reduce((s, d) => s + (d.totalCost ?? 0), 0);
    if (yDoc?.features) {
      topFeatures = Object.entries(yDoc.features)
        .map(([k, v]) => [k, v.cost ?? 0] as [string, number])
        .sort((a, b) => b[1] - a[1]).slice(0, 4);
    }
  } catch { /* engine data best-effort */ }
  const projMonthly = (sevenDayCost / 7) * 30;

  // --- Subscription state (Stripe, live) ---
  let rev: Awaited<ReturnType<typeof summarizeStripeRevenue>> | null = null;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    rev = await summarizeStripeRevenue(stripe);
  } catch { /* revenue best-effort */ }

  const featureRows = topFeatures.map(([k, c]) =>
    `<tr><td style="padding:3px 10px 3px 0;color:#374151">${FEATURE_HE[k] ?? k}</td><td style="padding:3px 0;font-weight:700">${usd(c)}</td></tr>`
  ).join("");

  const subBlock = rev ? `
    <table style="font-size:14px;color:#374151;border-collapse:collapse;margin:4px 0 0">
      <tr><td style="padding:3px 12px 3px 0;color:#6B7280">MRR</td><td style="padding:3px 0;font-weight:700">${usd(rev.mrrUsd)}/חודש · ${usd(rev.arrUsd)}/שנה</td></tr>
      <tr><td style="padding:3px 12px 3px 0;color:#6B7280">לקוחות משלמים</td><td style="padding:3px 0;font-weight:700">${rev.activePayingCustomers}</td></tr>
      <tr><td style="padding:3px 12px 3px 0;color:#6B7280">בניסיון</td><td style="padding:3px 0">${rev.trialingCount} (${rev.trialingCardedCount} עם כרטיס)</td></tr>
      <tr><td style="padding:3px 12px 3px 0;color:#6B7280">תשלומים שנכשלו</td><td style="padding:3px 0;color:${rev.pastDueCount ? "#B91C1C" : "#0E7A52"};font-weight:700">${rev.pastDueCount} (${usd(rev.atRiskMrrUsd)}/חודש בסיכון)</td></tr>
    </table>` : `<p style="font-size:13px;color:#B45309">לא ניתן היה למשוך נתוני מנויים מ-Stripe הבוקר.</p>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right;max-width:540px;margin:0 auto;color:#111827">
      <h2 style="font-size:19px;margin:0 0 4px">Gadit · דוח יומי</h2>
      <p style="font-size:13px;color:#6B7280;margin:0 0 16px">${dayKey(0)} (שעון UTC)</p>

      <h3 style="font-size:15px;color:#0B8A8A;margin:16px 0 6px">עלות המנוע (OpenAI)</h3>
      <table style="font-size:14px;color:#374151;border-collapse:collapse">
        <tr><td style="padding:3px 12px 3px 0;color:#6B7280">אתמול</td><td style="padding:3px 0;font-weight:700;font-size:16px">${usd(yesterdayCost)}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#6B7280">7 ימים</td><td style="padding:3px 0;font-weight:700">${usd(sevenDayCost)}</td></tr>
        <tr><td style="padding:3px 12px 3px 0;color:#6B7280">תחזית חודשית</td><td style="padding:3px 0">${usd(projMonthly)}</td></tr>
      </table>
      ${featureRows ? `<p style="font-size:12.5px;color:#6B7280;margin:10px 0 2px">לפי פיצ'ר (אתמול):</p><table style="font-size:13px;border-collapse:collapse">${featureRows}</table>` : ""}
      <p style="font-size:12px;color:#9CA3AF;margin:10px 0 0;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:8px 10px">
        יתרת הקרדיט של OpenAI לא זמינה דרך API. אם היתרה נגמרת, תגיע התראת 429 נפרדת. טעינות מופיעות במיילים של OpenAI.
      </p>

      <h3 style="font-size:15px;color:#0B8A8A;margin:22px 0 6px">מצב מנויים (Stripe)</h3>
      ${subBlock}

      <p style="font-size:13px;color:#6B7280;margin:20px 0 0">
        <a href="https://www.gadit.app/admin/ai-costs" style="color:#0EA5A5">עלויות מנוע</a> ·
        <a href="https://www.gadit.app/admin" style="color:#0EA5A5">סקירת אדמין</a> ·
        <a href="https://www.gadit.app/admin/activity" style="color:#0EA5A5">לוג פעילות</a>
      </p>
    </div>`;

  // --- Send ---
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ ok: false, error: "no_resend_key", yesterdayCost, sevenDayCost });
  const to = process.env.ALERT_EMAIL || "gadi@gadit.app";
  try {
    await new Resend(resendKey).emails.send({
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
