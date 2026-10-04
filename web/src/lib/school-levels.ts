// Which school levels a school's word sets open to (Gadi 2026-10-04): an
// elementary school gets the elementary units, a high school the high
// school units, and so on. Stored on schools/{sid}.levels (keys of
// CUR_LEVELS); chosen once by the school, changed only from /admin/schools.

export type SchoolType = { key: string; he: string; en: string; levels: string[] };

export const SCHOOL_TYPES: SchoolType[] = [
  { key: "gan", he: "גן ילדים", en: "Kindergarten", levels: ["gan"] },
  { key: "elementary", he: "בית ספר יסודי (א עד ו)", en: "Elementary school (grades 1 to 6)", levels: ["elementary"] },
  { key: "middle", he: "חטיבת ביניים (ז עד ט)", en: "Middle school (grades 7 to 9)", levels: ["middle"] },
  { key: "high", he: "תיכון (י עד יב)", en: "High school (grades 10 to 12)", levels: ["high"] },
  { key: "six-year", he: "שש־שנתי (ז עד יב)", en: "Six-year school (grades 7 to 12)", levels: ["middle", "high"] },
  { key: "eight-year", he: "בית ספר א עד ח", en: "Grades 1 to 8", levels: ["elementary", "middle"] },
  { key: "all", he: "כל השכבות (גן עד יב)", en: "All levels", levels: ["gan", "elementary", "middle", "high"] },
];

const VALID = new Set(["gan", "elementary", "middle", "high"]);
export function cleanLevels(v: unknown): string[] {
  return Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && VALID.has(x)))] : [];
}
export function schoolTypeOf(levels: string[]): SchoolType | undefined {
  const k = [...levels].sort().join(",");
  return SCHOOL_TYPES.find((t) => [...t.levels].sort().join(",") === k);
}
