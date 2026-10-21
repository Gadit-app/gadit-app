import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getRankState } from "@/lib/rank-points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET → the signed-in user's rank, computed on the server (lib/rank-points):
 *   { words, practices, points, rankKey, rankIndex, rankFloor, days }
 * `days` are the practice days for the streak (was /api/practice-days). Every
 * rank surface in the app reads this, so they all agree. Raises the stored
 * rank floor when a higher rank is reached.
 */
export async function GET(req: NextRequest) {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid = "";
  try {
    uid = (await getAdminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  try {
    const s = await getRankState(uid);
    return NextResponse.json(
      {
        words: s.words,
        practices: s.practices,
        points: s.points,
        rankKey: s.rank.key,
        rankIndex: s.rank.index,
        rankFloor: s.rankFloor,
        days: s.practiceDays,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    console.error("[rank] error:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
