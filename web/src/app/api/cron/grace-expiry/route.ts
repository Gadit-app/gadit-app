import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Daily grace-expiry cron. A subscription that fails to renew is kept on its
 * paid plan for a 7-day grace window (set by the webhook as `graceUntil`), so a
 * transient card decline doesn't cut off a paying customer before Stripe's
 * retries run. This cron downgrades to `basic` any user whose past_due grace
 * has passed. `subscriptionStatus` stays "past_due" so the update-card banner
 * keeps nudging them until Stripe finally cancels the subscription (which the
 * webhook turns into a clean basic + no grace).
 *
 * Idempotent: a user already on basic is skipped. A recovered payment clears
 * graceUntil (webhook), so it never fires for someone who paid.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
 * Manual dry run: GET /api/cron/grace-expiry?secret=$ADMIN_SECRET&dryRun=1
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const qsecret = req.nextUrl.searchParams.get("secret");
  const ok =
    (process.env.CRON_SECRET && bearer === process.env.CRON_SECRET) ||
    (process.env.ADMIN_SECRET && qsecret === process.env.ADMIN_SECRET);
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const db = getAdminDb();
  const now = Date.now();

  // Small set (only subs that failed to renew), so filter graceUntil in code
  // rather than needing a composite Firestore index.
  const snap = await db.collection("users").where("subscriptionStatus", "==", "past_due").get();
  const downgraded: string[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const grace = typeof d.graceUntil === "number" ? d.graceUntil : null;
    if (d.plan && d.plan !== "basic" && grace !== null && grace < now) {
      downgraded.push(doc.id);
      if (!dryRun) {
        await doc.ref.set(
          { plan: "basic", graceExpiredAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
    }
  }

  return NextResponse.json({ checked: snap.size, downgraded: downgraded.length, ids: downgraded, dryRun });
}
