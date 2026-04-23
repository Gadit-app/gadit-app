import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Spaced Repetition for the word notebook (Deep tier).
 *
 * GET  /api/notebook/review
 *   Returns words whose nextReviewAt <= now, oldest-due first, capped at 20.
 *
 * POST /api/notebook/review
 *   Body: { id: string, result: "correct" | "incorrect" }
 *   Updates the word's interval and next review date using a simplified SM-2:
 *     - correct  → intervalDays = clamp(intervalDays * 2, 1, 90), then schedule
 *     - incorrect → intervalDays = 1, then schedule
 *   nextReviewAt = now + intervalDays
 *
 * The cap at 90 days is intentional — past that, the word is practically learned
 * and reviewing every 6 months is overkill for a casual dictionary user.
 */

const MAX_INTERVAL_DAYS = 90;

function addDays(iso: string | Date, days: number): string {
  const base = typeof iso === "string" ? new Date(iso) : iso;
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return next.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "deep" },
        { status: 402 }
      );
    }

    const db = getAdminDb();
    const now = new Date().toISOString();

    const snap = await db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook")
      .where("nextReviewAt", "<=", now)
      .orderBy("nextReviewAt", "asc")
      .limit(20)
      .get();

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ items, dueCount: items.length });
  } catch (err) {
    console.error("review GET error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, result } = await req.json();
    if (!id || (result !== "correct" && result !== "incorrect")) {
      return NextResponse.json(
        { error: "id and result (correct|incorrect) required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (userInfo.plan !== "deep") {
      return NextResponse.json(
        { error: "upgrade_required", requiredPlan: "deep" },
        { status: 402 }
      );
    }

    const db = getAdminDb();
    const ref = db
      .collection("users")
      .doc(userInfo.userId)
      .collection("notebook")
      .doc(id);

    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "word_not_found" }, { status: 404 });
    }
    const data = snap.data() ?? {};
    const currentInterval = typeof data.intervalDays === "number" ? data.intervalDays : 1;
    const timesReviewed = typeof data.timesReviewed === "number" ? data.timesReviewed : 0;
    const timesCorrect = typeof data.timesCorrect === "number" ? data.timesCorrect : 0;

    const newInterval =
      result === "correct"
        ? Math.min(MAX_INTERVAL_DAYS, Math.max(1, currentInterval * 2))
        : 1;

    await ref.update({
      intervalDays: newInterval,
      nextReviewAt: addDays(new Date(), newInterval),
      timesReviewed: timesReviewed + 1,
      timesCorrect: timesCorrect + (result === "correct" ? 1 : 0),
      lastReviewedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      newIntervalDays: newInterval,
      nextReviewAt: addDays(new Date(), newInterval),
    });
  } catch (err) {
    console.error("review POST error:", err);
    return NextResponse.json(
      { error: "internal_error", details: String(err) },
      { status: 500 }
    );
  }
}
