import { Resend } from "resend";

/**
 * Thin Resend wrapper used by the drip cron + the welcome hook in
 * /api/notify-signup. Centralised so all drip emails share the same
 * from address, reply-to and error handling.
 */

const FROM = "Gadi <gadi@gadit.app>";
const REPLY_TO = "gadi@gadit.app";

export async function sendDripEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true; id?: string } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }
  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
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
