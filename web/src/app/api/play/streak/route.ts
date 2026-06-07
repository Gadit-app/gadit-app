import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyUserAndGetPlan } from "@/lib/firebase-admin";

/**
 * Play-streak sync — cross-device persistence for the Word Games
 * streak counter (was LocalStorage-only in V1).
 *
 * Storage: users/{uid}/stats/play
 *   {
 *     current: number          consecutive days including today
 *     best: number             all-time max
 *     lastPlayedYmd: string    "YYYY-MM-DD" in UTC
 *     totalSessions: number    every finish counted
 *     updatedAt: ISO string
 *   }
 *
 * GET   /api/play/streak              return the stored stats
 * POST  /api/play/streak              record a session finish
 *
 * Streak rule (same as the client lib):
 *   - same UTC day as lastPlayedYmd       → current unchanged
 *   - exactly +1 day from lastPlayedYmd   → current +1
 *   - otherwise                           → current resets to 1
 *
 * Tier: any signed-in user can call. The /play UI itself gates to
 * Deep, but this endpoint stays open so a downgraded Deep→Clear
 * user doesn't lose their stat history when they re-upgrade later.
 */

type StreakDoc = {
  current?: number;
  best?: number;
  lastPlayedYmd?: string;
  totalSessions?: number;
  updatedAt?: string;
};

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  if (!a || !b) return Infinity;
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}

const empty: Required<StreakDoc> = {
  current: 0,
  best: 0,
  lastPlayedYmd: "",
  totalSessions: 0,
  updatedAt: "",
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }
    const db = getAdminDb();
    const snap = await db
      .collection("users")
      .doc(userInfo.userId)
      .collection("stats")
      .doc("play")
      .get();
    const data = (snap.data() as StreakDoc | undefined) ?? {};
    return NextResponse.json({ ...empty, ...data });
  } catch (err) {
    console.error("[play/streak] GET failed:", err);
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const userInfo = await verifyUserAndGetPlan(idToken);
    if (!userInfo) {
      return NextResponse.json({ error: "login_required" }, { status: 401 });
    }

    // The client also sends its local snapshot so we can reconcile —
    // a user who played offline yesterday and online today shouldn't
    // lose that streak because the device's last write was older.
    const body = await req.json().catch(() => ({}));
    const localCurrent = typeof body?.localCurrent === "number" ? body.localCurrent : 0;
    const localBest = typeof body?.localBest === "number" ? body.localBest : 0;

    const db = getAdminDb();
    const ref = db
      .collection("users")
      .doc(userInfo.userId)
      .collection("stats")
      .doc("play");

    const today = ymd(new Date());
    const snap = await ref.get();
    const prev = (snap.data() as StreakDoc | undefined) ?? {};
    const prevYmd = prev.lastPlayedYmd ?? "";
    const prevCurrent = prev.current ?? 0;
    const prevBest = prev.best ?? 0;
    const prevTotal = prev.totalSessions ?? 0;

    let current: number;
    if (prevYmd === today) {
      current = prevCurrent;
    } else {
      const gap = daysBetween(prevYmd, today);
      current = gap === 1 ? prevCurrent + 1 : 1;
    }

    // Reconcile with the client's local copy. If their device ran
    // ahead while offline (LocalStorage), trust whichever is higher.
    current = Math.max(current, localCurrent);
    const best = Math.max(prevBest, current, localBest);

    const updatedAt = new Date().toISOString();
    const next: Required<StreakDoc> = {
      current,
      best,
      lastPlayedYmd: today,
      totalSessions: prevTotal + 1,
      updatedAt,
    };
    await ref.set(next);
    return NextResponse.json(next);
  } catch (err) {
    console.error("[play/streak] POST failed:", err);
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 },
    );
  }
}
