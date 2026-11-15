import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Deletes the help assistant's records past their expireAt (2026-11-15):
 * helpLogs after 180 days, helpChatRate after 3 days. Firestore's own TTL
 * would do it, but turning TTL on needs a permission the service account
 * does not have, so this nightly job does the same. Vercel Cron sends
 * Authorization: Bearer <CRON_SECRET>; a manual run takes ?secret=ADMIN_SECRET.
 */

export const maxDuration = 60;

function authorise(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  const adminSecret = process.env.ADMIN_SECRET;
  return !!adminSecret && req.nextUrl.searchParams.get("secret") === adminSecret;
}

export async function GET(req: NextRequest) {
  if (!authorise(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getAdminDb();
  const now = new Date();
  const out: Record<string, number> = {};
  for (const name of ["helpLogs", "helpChatRate"]) {
    let gone = 0;
    for (let round = 0; round < 10; round++) {
      const snap = await db.collection(name).where("expireAt", "<", now).limit(400).get();
      if (snap.empty) break;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      gone += snap.size;
    }
    out[name] = gone;
  }
  return NextResponse.json({ ok: true, deleted: out });
}
