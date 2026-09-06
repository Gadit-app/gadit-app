/**
 * engine-alert.ts — email Gadi the moment the definition engine goes down,
 * so an outage never again surfaces from a worried customer first.
 *
 * Trigger: the define route's "both models failed" path (the exact state
 * that shows users "Our definition engine is temporarily unavailable").
 * The usual root cause is an OpenAI billing/credit issue (a 429
 * credit_balance_exhausted, e.g. a declined auto-reload), not a code bug.
 *
 * Deduped to at most one email per 30 minutes via a single Firestore doc,
 * so a burst of failed requests can't spam the inbox. Entirely best-effort:
 * any failure here is swallowed and never affects the user request.
 */
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";

const COOLDOWN_MS = 30 * 60 * 1000;

export async function alertEngineDown(info: {
  source: string;
  status?: number;
  detail?: string;
}): Promise<void> {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    const db = getAdminDb();
    const ref = db.collection("ops").doc("engineAlert");
    const now = Date.now();

    // Dedupe within the cooldown window. Claim the slot BEFORE sending so
    // two concurrent failures don't both send.
    const snap = await ref.get();
    const last = snap.exists ? (snap.data()?.lastSentAtMs as number | undefined) ?? 0 : 0;
    if (now - last < COOLDOWN_MS) return;
    await ref.set(
      {
        lastSentAtMs: now,
        lastSource: info.source,
        lastStatus: info.status ?? null,
        lastDetail: (info.detail ?? "").slice(0, 300),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const to = process.env.ALERT_EMAIL || "gadi@gadit.app";
    const is429 = info.status === 429;
    const time = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

    const cause = is429
      ? "הסיבה הסבירה: בעיית קרדיט או חיוב ב-OpenAI (יתרה שלילית או טעינה אוטומטית שנדחתה). היכנס ל-OpenAI Billing, לחץ Buy credits, וודא שהכרטיס תקף."
      : "הסיבה יכולה להיות תקלת קרדיט/חיוב ב-OpenAI או תקלה זמנית אצלם. בדוק את היתרה ב-OpenAI Billing ואת סטטוס השירות.";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;direction:rtl;text-align:right;max-width:520px;margin:0 auto;color:#111827">
        <h2 style="color:#B91C1C;font-size:19px;margin:0 0 10px">⚠️ מנוע ההגדרות של Gadit לא זמין</h2>
        <p style="font-size:15px;line-height:1.6;margin:0 0 12px">
          קריאות ל-OpenAI נכשלות כרגע, ומשתמשים עלולים לראות "מנוע ההגדרות אינו זמין כרגע".
        </p>
        <table style="font-size:14px;color:#374151;border-collapse:collapse;margin:0 0 14px">
          <tr><td style="padding:3px 8px 3px 0;color:#6B7280">זמן</td><td style="padding:3px 0">${time}</td></tr>
          <tr><td style="padding:3px 8px 3px 0;color:#6B7280">מקור</td><td style="padding:3px 0">${info.source}</td></tr>
          <tr><td style="padding:3px 8px 3px 0;color:#6B7280">קוד</td><td style="padding:3px 0">${info.status ?? "לא ידוע"}</td></tr>
        </table>
        <p style="font-size:14px;line-height:1.6;background:#FEF2F2;border:1px solid #FBD5D5;border-radius:8px;padding:12px 14px;margin:0 0 14px">
          ${cause}
        </p>
        <p style="font-size:13px;color:#6B7280;margin:0 0 4px">
          <a href="https://platform.openai.com/settings/organization/billing/overview" style="color:#0EA5A5">OpenAI Billing</a>
          &nbsp;·&nbsp;
          <a href="https://platform.openai.com/usage" style="color:#0EA5A5">Usage</a>
          &nbsp;·&nbsp;
          <a href="https://www.gadit.app/admin/ai-costs" style="color:#0EA5A5">עלויות מנוע (אדמין)</a>
        </p>
        <p style="font-size:12px;color:#9CA3AF;margin:14px 0 0">
          התראה אחת לכל 30 דקות לכל היותר. נשלח אוטומטית מ-Gadit.
        </p>
      </div>`;

    await new Resend(resendKey).emails.send({
      from: "Gadit <notify@gadit.app>",
      to,
      replyTo: "gadi@gadit.app",
      subject: is429
        ? "⚠️ מנוע גדית לא זמין - כנראה קרדיט/חיוב ב-OpenAI"
        : "⚠️ מנוע גדית לא זמין - נדרשת בדיקה",
      html,
    });
  } catch {
    // Best-effort alerting. Never let it affect the request that triggered it.
  }
}
