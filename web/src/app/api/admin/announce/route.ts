/**
 * Send a "what's new" email (lib/email-drip/announcements.ts) to every
 * subscriber, once each (Gadi 2026-10-12). Admin only.
 *
 *   GET ?secret=…&id=2026-10-homework              → dry run: who would get it, in which language
 *   GET ?secret=…&id=…&to=someone@example.com      → one test send to that address (Hebrew unless &lang=en / &lang=de / any translated language)
 *   GET ?secret=…&id=…&send=1                       → the real send; skips anyone who already got it
 *
 * Audience: see Announcement.audience (family, individual, paying, basic);
 * never our own accounts, never an unsubscribed or suppressed address; an
 * announcement limited to some languages (`langs`) skips everyone else
 * ("skip_lang"). Sends are scheduled, so they wait out Shabbat. The same loop
 * runs on its own once an announcement is approved (api/cron/announcements).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { ANNOUNCEMENTS } from "@/lib/email-drip/announcements";
import { buildAnnouncementMail, announcementContent, runAnnouncement } from "@/lib/email-drip/announce-send";
import { sendDripEmail } from "@/lib/email-drip/send";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (!process.env.ADMIN_SECRET || q.get("secret") !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const a = ANNOUNCEMENTS.find((x) => x.id === q.get("id"));
  if (!a) return NextResponse.json({ error: "unknown_id", ids: ANNOUNCEMENTS.map((x) => x.id) }, { status: 404 });

  // One test send, to the address given (Hebrew unless another language
  // this announcement has is asked for).
  const to = q.get("to");
  if (to) {
    const asked = q.get("lang") || "he";
    const lang = announcementContent(a, asked).lang;
    const mail = buildAnnouncementMail(a, lang, "test", null);
    const r = await sendDripEmail({ to, subject: mail.subject, html: mail.html });
    return NextResponse.json({ test: true, to, lang, ...r });
  }

  const send = q.get("send") === "1";
  // Stop starting new sends shortly before the function's time limit; the
  // rest is reported "pending" and a second send=1 picks it up.
  const res = await runAnnouncement(getAdminDb(), getAdminAuth(), a, { send, deadline: send ? Date.now() + 270_000 : undefined });
  const c = (s: string) => res.counts[s] ?? 0;
  return NextResponse.json({
    id: a.id,
    send,
    audience: a.audience,
    langs: a.langs ?? null,
    approved: a.approved ?? false,
    sendAt: a.sendAt ?? null,
    total: res.rows.length,
    wouldSend: c("would_send"),
    sent: c("sent"),
    already: c("already"),
    skipLang: c("skip_lang"),
    skipIos: c("skip_ios"),
    skipSeries: c("skip_series"),
    failed: c("failed"),
    pending: c("pending"),
    byLang: res.byLang,
    rows: res.rows.map(({ email, lang, status }) => ({ email, lang, status })),
  });
}
