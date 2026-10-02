import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebase-admin";
import { isShabbatIL } from "@/lib/shabbat";

/**
 * One door for outgoing email, with the Shabbat rule built in (Gadi
 * 2026-10-01/02): during Shabbat (lib/shabbat.ts) a message is not sent; it
 * is parked in Firestore `deferredEmails` and the flush cron sends it after
 * Shabbat ends, so nothing is lost. Applies to customer emails AND the
 * notices to Gadi. The one exception is a parent's own word alerts
 * (lib/family-notify.ts), which go out when the child searches, by the
 * parent's choice.
 *
 * Returns the same { data, error } shape as Resend so call sites keep their
 * error handling.
 */

export type MailMsg = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

type MailResult = {
  data: { id: string } | null;
  error: { message: string } | null;
  deferred?: boolean;
};

async function sendNow(key: string, msg: MailMsg): Promise<MailResult> {
  const r = await new Resend(key).emails.send({
    from: msg.from,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
  });
  return {
    data: r.data ? { id: r.data.id } : null,
    error: r.error ? { message: r.error.message } : null,
  };
}

export async function sendMail(msg: MailMsg): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { data: null, error: { message: "RESEND_API_KEY not configured" } };
  if (isShabbatIL()) {
    try {
      const ref = await getAdminDb().collection("deferredEmails").add({
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        replyTo: msg.replyTo ?? null,
        createdAt: Date.now(),
        sentAt: null,
      });
      return { data: { id: `deferred:${ref.id}` }, error: null, deferred: true };
    } catch (e) {
      return { data: null, error: { message: `defer_failed: ${String(e)}` } };
    }
  }
  return sendNow(key, msg);
}

/** Send everything parked during Shabbat (oldest first). Called by the
 *  flush cron right after Shabbat ends; a no-op while Shabbat is still on. */
export async function flushDeferredMail(limit = 200): Promise<{ sent: number; failed: number; skipped?: string }> {
  if (isShabbatIL()) return { sent: 0, failed: 0, skipped: "shabbat" };
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: 0, skipped: "no_resend_key" };
  const db = getAdminDb();
  const snap = await db.collection("deferredEmails").where("sentAt", "==", null).limit(limit).get();
  const docs = snap.docs.sort((a, b) => (a.get("createdAt") ?? 0) - (b.get("createdAt") ?? 0));
  let sent = 0, failed = 0;
  for (const d of docs) {
    const m = d.data() as MailMsg & { replyTo: string | null };
    try {
      const r = await sendNow(key, { from: m.from, to: m.to, subject: m.subject, html: m.html, replyTo: m.replyTo ?? undefined });
      if (r.error) {
        failed++;
        await d.ref.set({ lastError: r.error.message, tries: (d.get("tries") ?? 0) + 1 }, { merge: true });
      } else {
        sent++;
        await d.ref.set({ sentAt: Date.now(), messageId: r.data?.id ?? null }, { merge: true });
      }
    } catch (e) {
      failed++;
      await d.ref.set({ lastError: String(e), tries: (d.get("tries") ?? 0) + 1 }, { merge: true });
    }
  }
  return { sent, failed };
}
