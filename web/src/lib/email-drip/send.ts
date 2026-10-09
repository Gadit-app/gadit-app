import { sendMail } from "@/lib/mail";

/**
 * Thin Resend wrapper used by the drip cron + the welcome hook in
 * /api/notify-signup. Centralised so all drip emails share the same
 * from address, reply-to and error handling.
 */

// Sender NAME is the brand, not the founder — subscribers should see
// "Gadit" in their inbox list and build recognition with the product
// (Gadi 2026-07-11). Replies still land in Gadi's personal mailbox
// via reply-to, so the conversation stays human when someone answers.
const FROM = "Gadit <gadi@gadit.app>";
const REPLY_TO = "gadi@gadit.app";

export async function sendDripEmail(opts: {
  to: string;
  subject: string;
  html: string;
  /** The drip cron's own sends: they wait out Shabbat. A welcome that
   *  follows a signup leaves it unset and goes out at once. */
  scheduled?: boolean;
}): Promise<{ ok: true; id?: string } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }
  try {
    // Through the shared door; only scheduled sends wait out Shabbat.
    const result = await sendMail({
      scheduled: opts.scheduled,
      from: FROM,
      replyTo: REPLY_TO,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (result.error) {
      return { ok: false, reason: `resend: ${result.error.message}` };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    return { ok: false, reason: `throw: ${String(err)}` };
  }
}
