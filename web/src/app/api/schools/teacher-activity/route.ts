import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { SET_SUBJECTS } from "@/lib/word-sets";

/**
 * GET /api/schools/teacher-activity  (school account only)
 *
 * The principal dashboard built from what teachers project (Gadi
 * 2026-10-10), for Israeli schools where student codes are off. Reads the
 * last 120 days of schools/{id}/projections and returns totals, an 8-week
 * timeline, subjects, words projected on more than one day, and the
 * recent lessons (a unit on a day).
 */
export const maxDuration = 30;

type Row = { kind: string; word: string; setId: string; subject?: string; title?: string; grade?: string; day: string; count?: number };

const subjectName = (s: string) => SET_SUBJECTS.find((x) => x.key === s)?.he ?? s;

function weekStart(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // Sunday, the Israeli school week
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let uid: string;
  try { uid = (await getAdminAuth().verifyIdToken(idToken)).uid; } catch { return NextResponse.json({ error: "invalid_token" }, { status: 401 }); }
  const db = getAdminDb();
  if ((await db.collection("users").doc(uid).get()).get("schoolId") !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const school = db.collection("schools").doc(uid);
  const since = new Date(Date.now() - 120 * 86_400_000).toISOString().slice(0, 10);
  const [snap, sdoc] = await Promise.all([
    school.collection("projections").where("day", ">=", since).limit(8000).get(),
    school.get(),
  ]);
  const rows = snap.docs.map((d) => d.data() as Row);

  const words = rows.filter((r) => r.kind === "word");
  const activities = rows.filter((r) => r.kind !== "word");
  const today = new Date().toISOString().slice(0, 10);
  const thisWeek = weekStart(today);

  // Lessons: a unit shown on a day.
  const lessons = new Map<string, { day: string; setId: string; title: string; subject: string; grade: string; words: Set<string>; quizzes: number }>();
  for (const r of rows) {
    const k = `${r.day}|${r.setId}`;
    const l = lessons.get(k) ?? { day: r.day, setId: r.setId, title: r.title ?? "", subject: subjectName(r.subject ?? ""), grade: r.grade ?? "", words: new Set<string>(), quizzes: 0 };
    if (r.kind === "word") l.words.add(r.word);
    else l.quizzes += 1;
    lessons.set(k, l);
  }
  const lessonList = [...lessons.values()].sort((a, b) => b.day.localeCompare(a.day));

  // 8 weeks, oldest first.
  const weeks: { week: string; words: number; lessons: number; activities: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(`${thisWeek}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7 * i);
    weeks.push({ week: d.toISOString().slice(0, 10), words: 0, lessons: 0, activities: 0 });
  }
  const wIdx = new Map(weeks.map((w, i) => [w.week, i]));
  for (const r of words) { const i = wIdx.get(weekStart(r.day)); if (i !== undefined) weeks[i].words += 1; }
  for (const r of activities) { const i = wIdx.get(weekStart(r.day)); if (i !== undefined) weeks[i].activities += 1; }
  for (const l of lessonList) { const i = wIdx.get(weekStart(l.day)); if (i !== undefined) weeks[i].lessons += 1; }

  // Subjects by lessons.
  const subj = new Map<string, { subject: string; lessons: number; words: Set<string> }>();
  for (const l of lessonList) {
    const s = subj.get(l.subject) ?? { subject: l.subject || "—", lessons: 0, words: new Set<string>() };
    s.lessons += 1;
    for (const w of l.words) s.words.add(w);
    subj.set(l.subject, s);
  }

  // Words projected on more than one day (the class came back to them).
  const daysByWord = new Map<string, Set<string>>();
  for (const r of words) { const s = daysByWord.get(r.word) ?? new Set<string>(); s.add(r.day); daysByWord.set(r.word, s); }
  const repeated = [...daysByWord.entries()].filter(([, s]) => s.size > 1).map(([word, s]) => ({ word, days: s.size })).sort((a, b) => b.days - a.days).slice(0, 20);

  return NextResponse.json({
    totals: {
      dictionary: Number(sdoc.get("uniqueWordCount") ?? 0),
      wordsShown: new Set(words.map((r) => r.word)).size,
      lessons: lessonList.length,
      lessonsThisWeek: lessonList.filter((l) => weekStart(l.day) === thisWeek).length,
      activities: activities.length,
    },
    weeks,
    subjects: [...subj.values()].map((s) => ({ subject: s.subject, lessons: s.lessons, words: s.words.size })).sort((a, b) => b.lessons - a.lessons),
    repeated,
    recent: lessonList.slice(0, 12).map((l) => ({ day: l.day, title: l.title, subject: l.subject, grade: l.grade, words: l.words.size, quizzes: l.quizzes })),
  });
}
