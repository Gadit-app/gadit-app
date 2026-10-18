import type { Firestore } from "firebase-admin/firestore";

/**
 * One Israel day of every school's use, for the morning digest to Gadi
 * (2026-10-14: "a daily report on every school in the program and the words
 * it looked up that day, straight to my email").
 *
 * Three sources, because a school looks words up in three ways:
 *   - its own signed-in account (the projector, the class computer): rows in
 *     `activityLog` whose uid belongs to the school (users/{uid}.schoolId);
 *   - kids on a class code (/c/<CODE>): schools/{id}/classrooms/{c}/searches;
 *   - the teacher projecting a word set: schools/{id}/projections (day field),
 *     where kind "word" is a projected word and "quiz" / "game" an activity.
 * Gadi's own visits through "Enter dashboard" are never logged, so they do not
 * show here. Demo schools are left out.
 */

export function ilDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

export type SchoolDay = {
  id: string;
  name: string;
  internal: boolean;
  lookups: number;
  words: Array<{ word: string; count: number }>;
  projectedWords: string[];
  activities: Array<{ kind: string; title: string }>;
};

export async function schoolDayReport(db: Firestore, day: string, isInternal: (email: string | null | undefined) => boolean): Promise<SchoolDay[]> {
  const schoolsSnap = await db.collection("schools").get();
  const schools = schoolsSnap.docs.filter((d) => d.get("isDemo") !== true);
  if (!schools.length) return [];

  // Who belongs to which school (the owner's uid is the school id). Another
  // account counts only when the server lists it (schoolMembers/{uid}, see
  // lib/school-identity.ts) and its own schoolId agrees: a schoolId an account
  // wrote itself never puts its words in another school's report.
  const uidToSchool = new Map<string, string>();
  for (const s of schools) uidToSchool.set(s.id, s.id);
  const listed = await db.collection("schoolMembers").get();
  for (const m of listed.docs) {
    const sid = m.get("schoolId");
    if (typeof sid !== "string" || !schools.some((s) => s.id === sid)) continue;
    if ((await db.collection("users").doc(m.id).get()).get("schoolId") === sid) uidToSchool.set(m.id, sid);
  }

  // The day's window with a margin; rows are then matched by their Israel day.
  const dayStart = Date.parse(`${day}T00:00:00Z`) - 4 * 3600_000;
  const dayEnd = dayStart + 32 * 3600_000;
  const actSnap = await db.collection("activityLog").where("atMs", ">=", dayStart).where("atMs", "<", dayEnd).select("uid", "word", "kind", "atMs", "count").get();

  const out: SchoolDay[] = [];
  for (const s of schools) {
    const counts = new Map<string, number>();
    let lookups = 0;
    const add = (w: unknown, n = 1) => {
      const word = String(w ?? "").trim();
      if (!word) return;
      counts.set(word, (counts.get(word) ?? 0) + n);
      lookups += n;
    };
    for (const a of actSnap.docs) {
      if (a.get("kind") !== "word") continue;
      const uid = a.get("uid");
      if (typeof uid !== "string" || uidToSchool.get(uid) !== s.id) continue;
      if (ilDay(Number(a.get("atMs"))) !== day) continue;
      add(a.get("word"), Math.max(1, Number(a.get("count") ?? 1)));
    }

    const [classrooms, projections, owner] = await Promise.all([
      s.ref.collection("classrooms").get(),
      s.ref.collection("projections").where("day", "==", day).get(),
      db.collection("users").doc(s.id).get(),
    ]);
    const isoFrom = new Date(dayStart).toISOString();
    const isoTo = new Date(dayEnd).toISOString();
    await Promise.all(classrooms.docs.map(async (c) => {
      const snap = await c.ref.collection("searches").where("at", ">=", isoFrom).where("at", "<", isoTo).get();
      for (const r of snap.docs) if (ilDay(Date.parse(String(r.get("at")))) === day) add(r.get("word"));
    }));

    const projectedWords: string[] = [];
    const activities: SchoolDay["activities"] = [];
    for (const p of projections.docs) {
      const kind = String(p.get("kind") ?? "");
      if (kind === "word") projectedWords.push(String(p.get("word") ?? ""));
      else activities.push({ kind, title: String(p.get("title") || p.get("word") || "") });
    }

    const email = (owner.get("email") as string | undefined) ?? (s.get("contactEmail") as string | undefined) ?? null;
    out.push({
      id: s.id,
      name: String(s.get("name") ?? "").trim() || s.id,
      internal: isInternal(email) || isInternal(s.get("contactEmail") as string | undefined),
      lookups,
      words: [...counts.entries()].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word)),
      projectedWords: [...new Set(projectedWords.filter(Boolean))],
      activities,
    });
  }
  // Real schools first, the busiest on top.
  return out.sort((a, b) => Number(a.internal) - Number(b.internal) || b.lookups + b.projectedWords.length - (a.lookups + a.projectedWords.length));
}
