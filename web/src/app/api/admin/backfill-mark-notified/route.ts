import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * One-time admin tool — mark every CURRENT user as notifiedSignup=true so
 * we don't spam Gadi with retroactive "new signup" emails when those
 * users next come back to the site.
 *
 * Run this ONCE, right after the /api/notify-signup feature ships and
 * before anyone returns. From that moment on, only genuinely new
 * signups will trigger the email (the notify endpoint's idempotency
 * flag handles it).
 *
 * USAGE:
 *   POST /api/admin/backfill-mark-notified?secret=$ADMIN_SECRET
 *   Optional: &dryRun=1
 *
 * Response: { dryRun, scanned, marked, alreadyMarked }
 */

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_SECRET env var not configured — refusing to run" },
      { status: 503 },
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";

  const auth = getAdminAuth();
  const db   = getAdminDb();

  // Enumerate every Auth user (paginated, 1000/page from Firebase Auth)
  const uids: string[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    page.users.forEach((u) => uids.push(u.uid));
    pageToken = page.pageToken;
  } while (pageToken);

  let marked = 0;
  let alreadyMarked = 0;

  // Bulk-load existing docs to count alreadyMarked correctly
  const CHUNK = 400;
  for (let i = 0; i < uids.length; i += CHUNK) {
    const slice = uids.slice(i, i + CHUNK);
    const refs = slice.map((uid) => db.collection("users").doc(uid));
    const snaps = await db.getAll(...refs);

    if (!dryRun) {
      const batch = db.batch();
      snaps.forEach((snap, idx) => {
        if (snap.exists && snap.data()?.notifiedSignup === true) {
          alreadyMarked++;
        } else {
          batch.set(
            refs[idx],
            {
              notifiedSignup: true,
              notifiedSignupAt: FieldValue.serverTimestamp(),
              notifiedSignupSource: "backfill",
            },
            { merge: true },
          );
          marked++;
        }
      });
      await batch.commit();
    } else {
      snaps.forEach((snap) => {
        if (snap.exists && snap.data()?.notifiedSignup === true) alreadyMarked++;
        else marked++;
      });
    }
  }

  return NextResponse.json({
    dryRun,
    scanned: uids.length,
    marked,
    alreadyMarked,
    hint: dryRun
      ? "Re-run without dryRun=1 to actually write."
      : "Done. Only NEW signups from this point on will trigger an email.",
  });
}
