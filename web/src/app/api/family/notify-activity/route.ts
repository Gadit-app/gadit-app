import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { kidOf, recordKidActivity } from "@/lib/kid-activity";
import { practiceDayFrom, recordPracticeDay } from "@/lib/practice-days";
import { recordPractice } from "@/lib/rank-points";

/**
 * Called by the client when a CHILD finishes a learning ACTIVITY that isn't a
 * plain word lookup: a dictation, a "Say it" session, and since 2026-10-12
 * (Gadi: "everything the child does and finished") a lesson, a game,
 * "listen and pick" and reading a text. In daily mode it waits for the
 * end-of-day summary (notified: false), in instant mode it goes out now. Records it to the family activity feed and, in instant mode, sends
 * the parent a push + email so they feel they see everything the child learns
 * (Gadi 2026-09-19). Mirrors notify-search: non-kids / non-family are a silent
 * no-op, and any error is swallowed so it never disrupts the child's flow.
 *
 * Since 2026-10-21 every finished activity is also a COMPLETED PRACTICE for
 * the rank, for anyone signed in (a kid's own uid, an adult's own uid):
 * 10 points, at most 10 practices a local day (lib/rank-points.ts).
 *
 *   POST { kind: "spell" | "say" | "pick" | "lesson" | "game" | "read", label, score?, total?, day? }
 *   → { ok, practice?: { counted } }
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

    const body = (await req.json().catch(() => null)) as
      | { kind?: string; label?: string; score?: number; total?: number; day?: string }
      | null;
    const KINDS = ["spell", "say", "pick", "lesson", "game", "read"] as const;
    const kind = (KINDS as readonly string[]).includes(body?.kind ?? "") ? (body!.kind as (typeof KINDS)[number]) : null;
    const label = (body?.label ?? "").toString().trim().slice(0, 120);
    if (!kind) return NextResponse.json({ ok: true, skipped: "bad_kind" });
    const score = typeof body?.score === "number" ? Math.max(0, Math.floor(body.score)) : undefined;
    const total = typeof body?.total === "number" ? Math.max(0, Math.floor(body.total)) : undefined;

    // A practice day for the streak and a completed practice for the rank,
    // for anyone signed in.
    const day = practiceDayFrom(body?.day);
    await recordPracticeDay(uid, day).catch(() => {});
    const practice = await recordPractice(uid, day).catch(() => ({ counted: false }));

    const kid = await kidOf(uid);
    if (!kid) return NextResponse.json({ ok: true, practice, skipped: "not_kid" });
    await recordKidActivity(kid, kind, { label, score, total });

    return NextResponse.json({ ok: true, practice });
  } catch (e) {
    console.error("[notify-activity] error:", e);
    return NextResponse.json({ ok: true, skipped: "error" });
  }
}
