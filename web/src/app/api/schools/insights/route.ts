import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { computeClassroomInsights, type RawSearch } from "@/lib/classroom-insights";

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

const PER_CLASSROOM_WINDOW = 200;

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
  const classroomsSnap = await db
    .collection("schools")
    .doc(ownerUid)
    .collection("classrooms")
    .get();

  const classroomDocs = classroomsSnap.docs;

  // Read each classroom's recent searches in parallel.
  const perClassroom = await Promise.all(
    classroomDocs.map(async (doc) => {
      const data = doc.data() as { name?: string; code?: string; searchCount?: number; colorIndex?: number };
      const searchesSnap = await doc.ref
        .collection("searches")
        .orderBy("at", "desc")
        .limit(PER_CLASSROOM_WINDOW)
        .get();
      const raw: RawSearch[] = searchesSnap.docs.map((s) => {
        const sd = s.data() as { word?: string; lang?: string; studentName?: string };
        return { word: sd.word ?? "", lang: sd.lang, studentName: sd.studentName };
      });
      const insights = computeClassroomInsights(raw, { topWordsLimit: 5 });
      return {
        id: doc.id,
        name: data.name ?? "",
        code: data.code ?? "",
        colorIndex: data.colorIndex ?? 0,
        totalAllTime: data.searchCount ?? 0,
        sampleSize: insights.sampleSize,
        topLanguage: insights.languages[0]?.lang ?? "",
        raw,
      };
    }),
  );

  // School-wide aggregation: pour every classroom's sampled searches into
  // one helper call for a building-level language map + stuck words.
  const allRaw: RawSearch[] = perClassroom.flatMap((c) => c.raw);
  const schoolInsights = computeClassroomInsights(allRaw, { topWordsLimit: 15, studentsLimit: 0 });

  const totalAllTime = perClassroom.reduce((sum, c) => sum + c.totalAllTime, 0);

  // Rank classrooms by all-time activity for the Overview list. Strip the
  // raw searches from the response (they were only needed for aggregation).
  const classrooms = perClassroom
    .map(({ raw: _raw, ...rest }) => rest)
    .sort((a, b) => b.totalAllTime - a.totalAllTime);

  return NextResponse.json({
    totalAllTime,
    classroomCount: classroomDocs.length,
    languages: schoolInsights.languages,
    topWords: schoolInsights.topWords,
    sampleSize: schoolInsights.sampleSize,
    classrooms,
  });
}
