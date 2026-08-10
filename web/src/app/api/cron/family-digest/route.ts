import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { notifyOwnerDigest } from "@/lib/family-notify";

/**
 * Daily digest for families on "daily" notification mode. Runs from a
 * Vercel cron once a day. For each family that enabled notifications in
 * daily mode, it collects every kidSearches doc not yet reported
 * (notified == false), sends the owner one push + email summary, and
 * marks those docs notified so the next run starts clean.
 *
 * Auth: Vercel cron sends `Authorization: Bearer <CRON_SECRET>`. For a
 * manual run, pass `?secret=<ADMIN_SECRET>&dryRun=1`.
 */

export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  const qsSecret = req.nextUrl.searchParams.get("secret");
  if (qsSecret && qsSecret === process.env.ADMIN_SECRET) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const db = getAdminDb();

  // Single-field query on the nested flag (no composite index needed);
  // filter mode in code.
  const fams = await db.collection("families").where("notifyPrefs.enabled", "==", true).get();

  let families = 0;
  let digestsSent = 0;
  let searches = 0;

  for (const fam of fams.docs) {
    const prefs = fam.data()?.notifyPrefs as { mode?: string } | undefined;
    if (prefs?.mode !== "daily") continue;
    families++;

    const pending = await fam.ref
      .collection("kidSearches")
      .where("notified", "==", false)
      .get();
    if (pending.empty) continue;

    const items = pending.docs.map((d) => {
      const x = d.data() as { kidName?: string; word?: string };
      return { kidName: x.kidName || "Your child", word: x.word || "" };
    });
    searches += items.length;

    if (!dryRun) {
      await notifyOwnerDigest(fam.id, items);
      // Mark reported (chunk to stay under the 500-write batch cap).
      for (let i = 0; i < pending.docs.length; i += 450) {
        const batch = db.batch();
        for (const d of pending.docs.slice(i, i + 450)) batch.update(d.ref, { notified: true });
        await batch.commit();
      }
    }
    digestsSent++;
  }

  return NextResponse.json({ ok: true, dryRun, families, digestsSent, searches });
}
