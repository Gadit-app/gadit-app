import { NextRequest, NextResponse } from "next/server";
import { flushDeferredMail } from "@/lib/mail";

/**
 * Sends the emails that were parked during Shabbat (lib/mail.ts). Runs on
 * Saturday night after Shabbat ends, plus a daily safety run.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Manual run: GET /api/cron/flush-deferred-mail?secret=$ADMIN_SECRET
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const qsecret = req.nextUrl.searchParams.get("secret");
  const ok =
    (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) ||
    (process.env.ADMIN_SECRET && qsecret === process.env.ADMIN_SECRET);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await flushDeferredMail();
  return NextResponse.json({ ok: true, ...r });
}
