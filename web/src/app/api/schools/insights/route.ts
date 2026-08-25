import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { computeSchoolInsights } from "@/lib/school-insights";

/**
 * GET /api/schools/insights — the principal's school-wide roll-up.
 *
 * Owner-only (schoolId === uid). For each classroom it reads a recent
 * window of searches, aggregates them with the SAME shared helper the
 * teacher views use, and returns:
 *   - school totals (all-time lookups summed from each classroom's
 *     searchCount + a sampled window for the breakdowns),
 *   - a school-wide language map + stuck words,
 *   - a per-classroom summary (name, code, total, sample size, top
 *     language) so the Overview can list classrooms ranked by activity.
 *
 * The council's unit of measurement is the class; this simply rolls the
 * class-level signal up to the school so a principal sees the whole
 * building at a glance and can justify the spend upward.
 */

export const maxDuration = 30;

async function requireOwner(idToken: string | null): Promise<string | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    if (userSnap.data()?.schoolId !== decoded.uid) return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const ownerUid = await requireOwner(idToken);
  if (!ownerUid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const data = await computeSchoolInsights(db, ownerUid);
  return NextResponse.json(data);
}
