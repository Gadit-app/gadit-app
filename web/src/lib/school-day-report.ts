import type { Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";

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
 *
 * The pieces shared with the monthly school report (lib/school-month-report.ts)
 * live here too: the calendar day in a timezone, a school's timezone, which
 * accounts belong to a school, a classroom's searches and the projections.
 */

export const IL_TZ = "Asia/Jerusalem";

/** The calendar date "YYYY-MM-DD" of a moment in an IANA timezone. */
export function tzDay(ms: number, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
}

export function ilDay(ms: number): string {
  return tzDay(ms, IL_TZ);
}

/** A school's timezone, as the daily school digest reads it: the school
 *  hours' timezone, else the principal's browser timezone, else South Africa
 *  for a CAPS school, else Israel. */
export function schoolTimezone(s: { activeHours?: { timezone?: string } | null; timezone?: string | null; curriculum?: string | null }): string {
  return s.activeHours?.timezone || s.timezone || (s.curriculum?.startsWith("za-") ? "Africa/Johannesburg" : "") || IL_TZ;
}

/** Hour (0-23) and Y-M-D in a given IANA timezone at a moment (default now);
 *  an unknown timezone reads as Israel. */
export function localParts(tz: string, ms = Date.now()): { hour: number; dateKey: string } {
  try {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, hour12: false, hour: "2-digit", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(ms));
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    let hour = parseInt(get("hour"), 10);
    if (hour === 24) hour = 0;
    return { hour, dateKey: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: IL_TZ, hour12: false, hour: "2-digit", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(ms));
    const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
    return { hour: parseInt(get("hour"), 10) % 24, dateKey: `${get("year")}-${get("month")}-${get("day")}` };
  }
}

/**
 * Who belongs to which school (the owner's uid is the school id). Another
 * account counts only when the server lists it (schoolMembers/{uid}, see
 * lib/school-identity.ts) and its own schoolId agrees: a schoolId an account
 * wrote itself never puts its words in another school's report.
 */
export async function schoolAccountUids(db: Firestore, schoolIds: string[]): Promise<Map<string, string>> {
  const uidToSchool = new Map<string, string>();
  for (const id of schoolIds) uidToSchool.set(id, id);
  const ids = new Set(schoolIds);
  const listed = schoolIds.length === 1
    ? await db.collection("schoolMembers").where("schoolId", "==", schoolIds[0]).get()
    : await db.collection("schoolMembers").get();
  for (const m of listed.docs) {
    const sid = m.get("schoolId");
    if (typeof sid !== "string" || !ids.has(sid)) continue;
    if ((await db.collection("users").doc(m.id).get()).get("schoolId") === sid) uidToSchool.set(m.id, sid);
  }
  return uidToSchool;
}

export type ClassSearch = { classroomId: string; word: unknown; atMs: number; via: string };

/** Every class-code search (and, in a one-class school, every school-account
 *  lookup copied there, via "school_account") of these classrooms between
 *  two ISO times. */
export async function classroomSearches(classrooms: QueryDocumentSnapshot[], isoFrom: string, isoTo: string): Promise<ClassSearch[]> {
  const out: ClassSearch[] = [];
  await Promise.all(classrooms.map(async (c) => {
    const snap = await c.ref.collection("searches").where("at", ">=", isoFrom).where("at", "<", isoTo).get();
    for (const r of snap.docs) out.push({ classroomId: c.id, word: r.get("word"), atMs: Date.parse(String(r.get("at"))), via: String(r.get("via") ?? "") });
  }));
  return out;
}

/** Projection rows: kind "word" is a projected word, anything else a class
 *  activity (quiz / game) with its unit title. */
export function splitProjections(docs: QueryDocumentSnapshot[]): { projectedWords: string[]; activities: Array<{ kind: string; title: string }> } {
  const projectedWords: string[] = [];
  const activities: Array<{ kind: string; title: string }> = [];
  for (const p of docs) {
    const kind = String(p.get("kind") ?? "");
    if (kind === "word") projectedWords.push(String(p.get("word") ?? ""));
    else activities.push({ kind, title: String(p.get("title") || p.get("word") || "") });
  }
  return { projectedWords, activities };
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

  const uidToSchool = await schoolAccountUids(db, schools.map((s) => s.id));

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
      // One row is one lookup: `count` also grows when the word page
      // reloads, so summing it overstated use (Gadi's digest, 2026-10-22).
      add(a.get("word"));
    }

    const [classrooms, projections, owner] = await Promise.all([
      s.ref.collection("classrooms").get(),
      s.ref.collection("projections").where("day", "==", day).get(),
      db.collection("users").doc(s.id).get(),
    ]);
    const searches = await classroomSearches(classrooms.docs, new Date(dayStart).toISOString(), new Date(dayEnd).toISOString());
    // A one-class school's own-account lookups are copied into that class
    // ("school_account") and are already counted above from activityLog.
    for (const r of searches) if (ilDay(r.atMs) === day && r.via !== "school_account") add(r.word);

    const { projectedWords, activities } = splitProjections(projections.docs);

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
