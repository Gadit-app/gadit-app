import { getAdminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";

/**
 * OpenAI spend guard (Gadi 2026-10-06, after an SEO warm-up run spent ~$134 in
 * one afternoon and emptied the prepaid credit, which stopped the engine for
 * everyone). Three lines, all per UTC day, read from the aiUsage telemetry:
 *
 *   ADMIN CAP   (AI_ADMIN_DAILY_CAP_USD, default $5): admin refreshes and bulk
 *               warm-ups (x-gadit-refresh) stop with 429 once admin spend for
 *               the day reaches it. No script can run away again.
 *   ALERT       (AI_DAILY_ALERT_USD, default $15): one email to NOTIFY_EMAIL the
 *               first time the day's total passes it.
 *   HARD STOP   (AI_DAILY_HARD_CAP_USD, default $60): above it, new generations
 *               for non-paying visitors stop (cached words still load);
 *               paying subscribers are always served.
 *
 * Normal days are $1 to $2, so none of these touch regular use.
 */

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};
export const ADMIN_DAILY_CAP = num(process.env.AI_ADMIN_DAILY_CAP_USD, 5);
export const DAILY_ALERT = num(process.env.AI_DAILY_ALERT_USD, 15);
export const DAILY_HARD_CAP = num(process.env.AI_DAILY_HARD_CAP_USD, 60);

const dayKey = () => new Date().toISOString().slice(0, 10);

// Short in-memory cache so a burst of requests does not read Firestore each time.
let cached: { at: number; day: string; total: number; admin: number } | null = null;

export async function todaySpend(): Promise<{ total: number; admin: number }> {
  const day = dayKey();
  if (cached && cached.day === day && Date.now() - cached.at < 20_000) return cached;
  try {
    const snap = await getAdminDb().collection("aiUsage").doc(day).get();
    const total = Number(snap.get("totalCost") ?? 0) || 0;
    const admin = Number(snap.get("adminCost") ?? 0) || 0;
    cached = { at: Date.now(), day, total, admin };
    return cached;
  } catch {
    return { total: cached?.day === day ? cached.total : 0, admin: cached?.day === day ? cached.admin : 0 };
  }
}

export async function adminBudgetExceeded(): Promise<boolean> {
  return (await todaySpend()).admin >= ADMIN_DAILY_CAP;
}

export async function hardCapReached(): Promise<boolean> {
  return (await todaySpend()).total >= DAILY_HARD_CAP;
}

/** After a cost is logged: email once per day when the total passes the alert line. */
export async function maybeAlertSpend(): Promise<void> {
  try {
    const db = getAdminDb();
    const ref = db.collection("aiUsage").doc(dayKey());
    const fire = await db.runTransaction(async (tx) => {
      const s = await tx.get(ref);
      const total = Number(s.get("totalCost") ?? 0) || 0;
      if (total < DAILY_ALERT || s.get("alertSentAt")) return null;
      tx.set(ref, { alertSentAt: new Date().toISOString() }, { merge: true });
      return { total, admin: Number(s.get("adminCost") ?? 0) || 0 };
    });
    const to = process.env.NOTIFY_EMAIL;
    if (!fire || !to) return;
    await sendMail({
      from: "Gadit <notify@gadit.app>",
      to,
      subject: `התראת עלות: ${fire.total.toFixed(2)}$ על OpenAI היום`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7">
<p>ההוצאה על OpenAI היום עברה ${DAILY_ALERT}$: כרגע ${fire.total.toFixed(2)}$.</p>
<p>מתוכה הרצות מנהל: ${fire.admin.toFixed(2)}$ (התקרה שלהן ${ADMIN_DAILY_CAP}$ ביום).</p>
<p>ביום רגיל ההוצאה היא 1$ עד 2$. הפירוט לפי פיצ'ר ב-<a href="https://www.gadit.app/admin/ai-costs">/admin/ai-costs</a>.</p>
<p>מעל ${DAILY_HARD_CAP}$ ביום נעצרות הגדרות חדשות למשתמשים שלא משלמים, ומנויים ממשיכים לקבל שירות.</p>
</div>`,
    });
  } catch {
    // best-effort
  }
}
