import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { notifyOwnerInstant } from "@/lib/family-notify";

/**
 * Called by the client right after a CHILD successfully looks up a word.
 * If the caller is a kid in a family, we:
 *   1. record the search at families/{familyId}/kidSearches/{autoId}
 *      (this doubles as the parent activity feed + the daily-digest source)
 *   2. if the family enabled notifications in "instant" mode, send the
 *      parent a push + email right now.
 * In "daily" mode we only record; the cron (family-digest) sends the
 * end-of-day summary. Disabled families still record nothing extra than
 * the log (cheap, and lets a parent flip the toggle on and immediately
 * see today's activity if we later surface it).
 *
 * Non-kids and non-family users are a silent no-op — this endpoint is
 * safe to call on every search.
 */

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) return NextResponse.json({ ok: true, skipped: "no_auth" });

    let uid: string;
    try {
      uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
    } catch {
      return NextResponse.json({ ok: true, skipped: "bad_token" });
    }

    const body = (await req.json().catch(() => null)) as { word?: string; language?: string } | null;
    const word = (body?.word ?? "").toString().trim();
    if (!word || word.length > 120) return NextResponse.json({ ok: true, skipped: "no_word" });

    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(uid).get();
    const u = userDoc.data() as
      | { familyRole?: string; familyId?: string; memberId?: string }
      | undefined;
    if (!u || u.familyRole !== "kid" || !u.familyId) {
      return NextResponse.json({ ok: true, skipped: "not_kid" });
    }

    const ownerUid = u.familyId; // family doc id === owner uid

    // Kid display name from the member doc (fall back to a generic label).
    let kidName = "Your child";
    if (u.memberId) {
      const member = await db
        .collection("families")
        .doc(ownerUid)
        .collection("members")
        .doc(u.memberId)
        .get();
      const mn = member.data()?.name;
      if (typeof mn === "string" && mn.trim()) kidName = mn.trim();
    }

    const nowIso = new Date().toISOString();
    // Record for the activity feed / digest.
    await db
      .collection("families")
      .doc(ownerUid)
      .collection("kidSearches")
      .add({
        word,
        language: (body?.language ?? "").toString().slice(0, 40),
        memberId: u.memberId ?? null,
        kidName,
        at: nowIso,
        notified: false,
      });

    const prefs = (
      await db.collection("families").doc(ownerUid).get()
    ).data()?.notifyPrefs as { enabled?: boolean; mode?: string } | undefined;

    if (prefs?.enabled && prefs.mode !== "daily") {
      // Instant mode (default when enabled): notify right away.
      await notifyOwnerInstant(ownerUid, kidName, word);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notify-search] error:", e);
    // Never surface an error to the search flow — this is best-effort.
    return NextResponse.json({ ok: true, skipped: "error" });
  }
}
