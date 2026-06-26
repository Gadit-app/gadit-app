import { NextRequest, NextResponse } from "next/server";
import { HE_DRIP, EN_DRIP, buildUnsubUrl } from "@/lib/email-drip/registry";
import { sendDripEmail } from "@/lib/email-drip/send";

/**
 * Admin tool — fire all 5 Hebrew drip mails to a single recipient
 * for preview. Used to spot-check copy and rendering before any
 * real users are exposed to the sequence.
 *
 * USAGE:
 *   GET /api/admin/email-test?secret=$ADMIN_SECRET
 *     → sends all 5 to gadibenlavi@gmail.com (the default)
 *
 *   GET /api/admin/email-test?secret=$ADMIN_SECRET&to=other@example.com
 *     → sends all 5 to the given address
 *
 *   GET /api/admin/email-test?secret=$ADMIN_SECRET&key=welcome-he
 *     → sends only the named mail
 *
 *   Optional &name=דנה to test the {name} interpolation; defaults
 *   to a generic "היי" greeting.
 *
 * No drip-sent flags are written and no Firestore state is touched.
 */

export const maxDuration = 30;

const DEFAULT_TO = "gadibenlavi@gmail.com";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured, refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const to = (req.nextUrl.searchParams.get("to") || DEFAULT_TO).trim();
  const onlyKey = req.nextUrl.searchParams.get("key") || "";
  const langParam = (req.nextUrl.searchParams.get("lang") || "he").toLowerCase();
  const name = req.nextUrl.searchParams.get("name") || undefined;

  // Default to Hebrew set; ?lang=en switches to the English mails.
  // A direct ?key=<key> override searches across both sets so a single
  // mail can be previewed by its unique key without needing &lang too.
  const baseSet = langParam === "en" ? EN_DRIP : HE_DRIP;
  const allKnown = [...HE_DRIP, ...EN_DRIP];
  const targets = onlyKey
    ? allKnown.filter((m) => m.key === onlyKey)
    : baseSet;

  if (targets.length === 0) {
    return NextResponse.json(
      { error: `unknown mail key: ${onlyKey}` },
      { status: 400 },
    );
  }

  // Synthetic uid so the unsubscribe link in the preview is real but
  // belongs to a non-existent user — the unsubscribe endpoint will
  // happily write to that uid, but nobody will care.
  const previewUid = "preview-test";

  const results: Array<{
    key: string;
    subject: string;
    status: "sent" | "failed";
    messageId?: string;
    reason?: string;
  }> = [];

  for (const mail of targets) {
    const built = mail.build({
      displayName: name,
      unsubscribeUrl: buildUnsubUrl(previewUid),
    });
    const sent = await sendDripEmail({
      to,
      subject: `[TEST · day ${mail.dayOffset}] ${built.subject}`,
      html: built.html,
    });
    if (sent.ok) {
      results.push({ key: mail.key, subject: built.subject, status: "sent", messageId: sent.id });
    } else {
      results.push({ key: mail.key, subject: built.subject, status: "failed", reason: sent.reason });
    }
    // Stagger sends slightly to avoid Resend's rate-limit window
    // when firing 5 in a row.
    await new Promise((r) => setTimeout(r, 250));
  }

  return NextResponse.json({
    to,
    sentCount: results.filter((r) => r.status === "sent").length,
    failedCount: results.filter((r) => r.status === "failed").length,
    results,
  });
}
