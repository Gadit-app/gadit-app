import { CUR_TOPICS, zaTopic } from "@/lib/curriculum-catalog";
import zaCatalog from "@/lib/curriculum-catalog-za.json";
import zaSets from "@/lib/curriculum-sets-za.json";
import { getAdminDb } from "@/lib/firebase-admin";
import { cleanGrade, gradeFromAge, gradeNow, isBand, type Band } from "@/lib/grade-bands";

/**
 * Words of the child's school grade for the journey (Gadi 2026-11-14: the
 * words a fortress keeps must not depend on the notebook alone).
 *
 * The source is the curriculum units we already hold, each with its words
 * and their short definitions: the Israeli catalog for the Hebrew interface
 * (curriculumSets/{id} in Firestore, never generated here) and South
 * Africa's CAPS for the English interface (grades 4 to 9, built in). So a
 * level word costs nothing, and its meaning is written in the language of
 * the platform. Other interface languages have no source yet and get none.
 */

export type LevelWord = { id: string; word: string; language: string; meaning: string };

// Subjects whose terms a child meets in class, in the order they are mixed.
const HE_SUBJECTS = ["hebrew", "science-and-technology", "geography", "homeland-society-and-civics", "history", "mathematics", "literature"];
const ZA_SUBJECTS = ["english-home-language", "natural-sciences-technology", "natural-sciences", "geography", "history", "life-skills", "mathematics"];

const HE_GRADE: Record<string, number> = { "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10, "יא": 11, "יב": 12 };
/** "ג-ה" gives [3, 5]; "ד" gives [4, 4]; anything else gives null. */
function heRange(g: string): [number, number] | null {
  const parts = (g || "").split("-").map((p) => HE_GRADE[p.trim()]);
  if (!parts.length || parts.some((p) => !p)) return null;
  return [parts[0], parts[parts.length - 1]];
}

// A level a parent set by hand stands for the middle grade of its band.
const BAND_GRADE: Record<Band, number> = { pre1: 0, g12: 1, g34: 3, g56: 5, mid: 8, high: 11 };

/** The school grade of a family member (0 = not in 1st grade yet), or null when nothing says. */
export function gradeOfMember(m: { level?: unknown; grade?: unknown; gradeSetAt?: unknown; age?: unknown } | null | undefined): number | null {
  if (!m) return null;
  if (isBand(m.level)) return BAND_GRADE[m.level];
  const g = cleanGrade(m.grade);
  if (g !== null) return gradeNow(g, typeof m.gradeSetAt === "string" ? m.gradeSetAt : null);
  return gradeFromAge(Number(m.age));
}

/** One list out of several, taking one from each in turn. */
function roundRobin<T>(lists: T[][]): T[] {
  const out: T[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}

/** The units of a grade in the language of the interface, subjects mixed. */
export function levelUnits(ui: string, grade: number): string[] {
  if (grade < 1) return [];
  if (ui === "he") {
    return roundRobin(HE_SUBJECTS.map((s) =>
      CUR_TOPICS
        .map((t) => ({ t, r: heRange(t.g) }))
        .filter((x) => x.t.s === s && x.r && x.r[0] <= grade && grade <= x.r[1])
        // A unit written for this grade alone comes before one written for a span of grades.
        .sort((a, b) => (a.r![1] - a.r![0]) - (b.r![1] - b.r![0]) || a.t.n - b.t.n || a.t.o - b.t.o)
        .map((x) => x.t.id)));
  }
  if (ui === "en") {
    // CAPS begins in grade 4: a 3rd grader gets its first units, a younger child none.
    if (grade < 3) return [];
    const g = String(Math.min(9, Math.max(4, grade)));
    const topics = (zaCatalog as { topics: Array<{ id: string; s: string; g: string }> }).topics;
    return roundRobin(ZA_SUBJECTS.map((s) => topics.filter((t) => t.s === s && t.g === g).map((t) => t.id)));
  }
  return [];
}

type UnitWords = { words: string[]; defs: Record<string, string> };
async function readUnits(ids: string[]): Promise<Map<string, UnitWords>> {
  const out = new Map<string, UnitWords>();
  const fromDb: string[] = [];
  for (const id of ids) {
    if (zaTopic(id)) { const w = (zaSets as Record<string, UnitWords>)[id]; if (w) out.set(id, w); } else fromDb.push(id);
  }
  if (fromDb.length) {
    const db = getAdminDb();
    const snaps = await db.getAll(...fromDb.map((id) => db.collection("curriculumSets").doc(id)));
    for (const s of snaps) {
      const words = s.get("set.words") as unknown, defs = s.get("defs") as unknown;
      if (Array.isArray(words) && defs && typeof defs === "object") out.set(s.id, { words: words.filter((w): w is string => typeof w === "string"), defs: defs as Record<string, string> });
    }
  }
  return out;
}

const UNITS_PER_READ = 6;
const MAX_UNITS = 24;
const key = (w: string) => w.normalize("NFC").replace(/[֑-ׇ]/g, "").trim().toLowerCase();

/**
 * The next `need` words of the grade that the child has no card for yet.
 * `haveIds` are the ids of the child's cards and `haveWords` their words, so
 * a word of the notebook never comes back as a level word.
 */
export async function nextLevelWords(ui: string, grade: number, haveIds: Set<string>, haveWords: Iterable<string>, need: number): Promise<LevelWord[]> {
  const out: LevelWord[] = [];
  if (need <= 0) return out;
  const units = levelUnits(ui, grade).slice(0, MAX_UNITS);
  const seen = new Set<string>();
  for (const w of haveWords) seen.add(key(w));
  for (let i = 0; i < units.length && out.length < need; i += UNITS_PER_READ) {
    const chunk = units.slice(i, i + UNITS_PER_READ);
    const read = await readUnits(chunk);
    // One word from each unit in turn, so a day's words come from several subjects.
    const rows = roundRobin(chunk.map((id) => {
      const u = read.get(id);
      return (u?.words ?? []).map((word, n) => ({ id: `lvl-${id}-${n}`, word, meaning: String(u!.defs[word] ?? "").trim() }));
    }));
    for (const r of rows) {
      if (out.length >= need) break;
      const k = key(r.word);
      if (!k || !r.meaning || haveIds.has(r.id) || seen.has(k)) continue;
      seen.add(k);
      out.push({ id: r.id, word: r.word.trim(), language: ui, meaning: r.meaning });
    }
  }
  return out;
}
