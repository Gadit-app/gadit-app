import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { autoSendBlocked, dueAnnouncements, runDueAnnouncements } from "@/lib/email-drip/announce-auto";
import { runAnnouncement } from "@/lib/email-drip/announce-send";

/**
 * Automatic "what's new" sends (lib/email-drip/announce-auto.ts). Vercel
 * Cron hits this every hour at minute 5 (vercel.json); a pass sends every
 * announcement with approved: true whose sendAt has passed, once per user,
 * and finishes the announcement for good when everyone was reached. No pass
 * starts on Shabbat or between 21:00 and 07:00 Israel time.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Manual: GET ?secret=$ADMIN_SECRET&dryRun=1 → what is due and who would get
 * it (reads only); without dryRun it runs a real pass.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const qsecret = req.nextUrl.searchParams.get("secret");
  const ok =
    (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) ||
    (process.env.ADMIN_SECRET && qsecret === process.env.ADMIN_SECRET);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const now = Date.now();
  if (req.nextUrl.searchParams.get("dryRun") === "1") {
    const due = dueAnnouncements(now);
    const out = [];
    for (const a of due) {
      const r = await runAnnouncement(getAdminDb(), getAdminAuth(), a, { send: false });
      out.push({ id: a.id, counts: r.counts, byLang: r.byLang });
    }
    return NextResponse.json({ dryRun: true, blocked: autoSendBlocked(new Date(now)), due: out });
  }

  // Leave room under maxDuration for listing the users and the final writes.
  const r = await runDueAnnouncements(getAdminDb(), getAdminAuth(), { now, budgetMs: 230_000 });
  if (r.blocked) console.log(`[announcements] no pass: ${r.blocked}`);
  return NextResponse.json({ ok: true, ...r });
}
