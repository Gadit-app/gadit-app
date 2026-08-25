import type { Firestore } from "firebase-admin/firestore";
import { computeClassroomInsights, type RawSearch } from "@/lib/classroom-insights";

/**
 * School-wide roll-up used by BOTH the principal's own endpoint
 * (/api/schools/insights) and the admin cross-school view
 * (/api/admin/schools?schoolId=). For each classroom it reads a recent window
 * of searches, aggregates via the shared classroom helper, and returns school
 * totals, a language map + stuck words, a per-classroom summary, and a
 * per-student list including the words each student looked up.
 *
 * Extracted 2026-08-25 so admin can see any school exactly as its principal
 * does, without duplicating the aggregation.
 */

const PER_CLASSROOM_WINDOW = 200;

export type SchoolInsights = Awaited<ReturnType<typeof computeSchoolInsights>>;

export async function computeSchoolInsights(db: Firestore, schoolId: string) {
  const classroomsSnap = await db
    .collection("schools")
    .doc(schoolId)
    .collection("classrooms")
    .get();
  const classroomDocs = classroomsSnap.docs;

  const perClassroom = await Promise.all(
    classroomDocs.map(async (doc) => {
      const data = doc.data() as { name?: string; code?: string; searchCount?: number; colorIndex?: number };
      const searchesSnap = await doc.ref.collection("searches").orderBy("at", "desc").limit(PER_CLASSROOM_WINDOW).get();
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

  const allRaw: RawSearch[] = perClassroom.flatMap((c) => c.raw);
  const schoolInsights = computeClassroomInsights(allRaw, { topWordsLimit: 15, studentsLimit: 0 });

  const students = perClassroom
    .flatMap((cls) => {
      const counts = new Map<string, { count: number; langs: Map<string, number>; words: Map<string, number> }>();
      for (const s of cls.raw) {
        const name = (s.studentName ?? "").trim();
        if (!name) continue;
        const e = counts.get(name) ?? { count: 0, langs: new Map<string, number>(), words: new Map<string, number>() };
        e.count += 1;
        const lg = (s.lang ?? "").trim();
        if (lg) e.langs.set(lg, (e.langs.get(lg) ?? 0) + 1);
        const w = (s.word ?? "").trim();
        if (w) e.words.set(w, (e.words.get(w) ?? 0) + 1);
        counts.set(name, e);
      }
      return [...counts.entries()].map(([name, e]) => ({
        name,
        classroomId: cls.id,
        classroomName: cls.name,
        code: cls.code,
        colorIndex: cls.colorIndex,
        count: e.count,
        topLanguage: [...e.langs.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
        words: [...e.words.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([word, count]) => ({ word, count })),
      }));
    })
    .sort((a, b) => b.count - a.count);

  const totalAllTime = perClassroom.reduce((sum, c) => sum + c.totalAllTime, 0);
  const classrooms = perClassroom.map(({ raw: _raw, ...rest }) => rest).sort((a, b) => b.totalAllTime - a.totalAllTime);

  return {
    totalAllTime,
    classroomCount: classroomDocs.length,
    languages: schoolInsights.languages,
    topWords: schoolInsights.topWords,
    sampleSize: schoolInsights.sampleSize,
    classrooms,
    students,
  };
}
