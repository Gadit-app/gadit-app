// Which curriculum and which school levels a school's word sets open to
// (Gadi 2026-10-04): an elementary school gets the elementary units, a high
// school the high school units, a South African school the CAPS catalog,
// and so on. Stored on schools/{sid}.curriculum + schools/{sid}.levels;
// chosen once by the school, changed only from /admin/schools.
//   curriculum "il-he"   Israeli catalog (Hebrew)
//   curriculum "il-ar"   Israel, Arab state education (Arabic)
//   curriculum "za-caps" South Africa CAPS (English)
//   curriculum "all"     every catalog (Gadi's own school, for demos)
//   curriculum "legacy"  the old hand-made sets only (Greenwarth for now)

export type Curriculum = "il-he" | "il-ar" | "za-caps" | "all" | "legacy";
export type SchoolType = { key: string; curriculum: Curriculum; he: string; en: string; ar?: string; levels: string[] };

export const SCHOOL_TYPES: SchoolType[] = [
  { key: "gan", curriculum: "il-he", he: "גן ילדים", en: "Kindergarten", levels: ["gan"] },
  { key: "elementary", curriculum: "il-he", he: "בית ספר יסודי (א עד ו)", en: "Elementary school (grades 1 to 6)", levels: ["elementary"] },
  { key: "middle", curriculum: "il-he", he: "חטיבת ביניים (ז עד ט)", en: "Middle school (grades 7 to 9)", levels: ["middle"] },
  { key: "high", curriculum: "il-he", he: "תיכון (י עד יב)", en: "High school (grades 10 to 12)", levels: ["high"] },
  { key: "six-year", curriculum: "il-he", he: "שש־שנתי (ז עד יב)", en: "Six-year school (grades 7 to 12)", levels: ["middle", "high"] },
  { key: "eight-year", curriculum: "il-he", he: "בית ספר א עד ח", en: "Grades 1 to 8", levels: ["elementary", "middle"] },
  { key: "ar-gan", curriculum: "il-ar", he: "חינוך ערבי: גן ילדים", en: "Arab education: kindergarten", ar: "روضة أطفال", levels: ["gan"] },
  { key: "ar-elementary", curriculum: "il-ar", he: "חינוך ערבי: בית ספר יסודי (א עד ו)", en: "Arab education: elementary (grades 1 to 6)", ar: "مدرسة ابتدائيّة (الصفوف 1 إلى 6)", levels: ["elementary"] },
  { key: "ar-middle", curriculum: "il-ar", he: "חינוך ערבי: חטיבת ביניים (ז עד ט)", en: "Arab education: middle school (grades 7 to 9)", ar: "مدرسة إعداديّة (الصفوف 7 إلى 9)", levels: ["middle"] },
  { key: "ar-high", curriculum: "il-ar", he: "חינוך ערבי: תיכון (י עד יב)", en: "Arab education: high school (grades 10 to 12)", ar: "مدرسة ثانويّة (الصفوف 10 إلى 12)", levels: ["high"] },
  { key: "ar-six-year", curriculum: "il-ar", he: "חינוך ערבי: שש־שנתי (ז עד יב)", en: "Arab education: six-year school (grades 7 to 12)", ar: "مدرسة إعداديّة وثانويّة (الصفوف 7 إلى 12)", levels: ["middle", "high"] },
  { key: "ar-eight-year", curriculum: "il-ar", he: "חינוך ערבי: א עד ח", en: "Arab education: grades 1 to 8", ar: "مدرسة للصفوف 1 إلى 8", levels: ["elementary", "middle"] },
  { key: "za-primary", curriculum: "za-caps", he: "דרום אפריקה: בית ספר יסודי (עד כיתה 7)", en: "Primary school (Grades 4 to 7)", levels: ["intermediate", "senior"] },
  { key: "za-high", curriculum: "za-caps", he: "דרום אפריקה: תיכון (מכיתה 8)", en: "High school (Grades 8 and 9)", levels: ["senior"] },
  { key: "za-combined", curriculum: "za-caps", he: "דרום אפריקה: בית ספר משולב", en: "Combined school (Grades 4 to 9)", levels: ["intermediate", "senior"] },
  { key: "all", curriculum: "all", he: "כל התוכניות וכל השכבות", en: "Every curriculum, all levels", levels: ["gan", "elementary", "middle", "high", "intermediate", "senior"] },
];

export const CURRICULA: Array<{ key: Exclude<Curriculum, "all" | "legacy">; he: string; en: string; ar: string }> = [
  { key: "il-he", he: "ישראל, תוכנית הלימודים בעברית", en: "Israel, Hebrew curriculum", ar: "إسرائيل، المنهاج بالعبريّة" },
  { key: "il-ar", he: "ישראל, החינוך הערבי הממלכתי", en: "Israel, Arab state education", ar: "إسرائيل، التعليم العربيّ الرسميّ" },
  { key: "za-caps", he: "דרום אפריקה, CAPS", en: "South Africa, CAPS", ar: "جنوب أفريقيا، CAPS" },
];

const VALID = new Set(["gan", "elementary", "middle", "high", "intermediate", "senior"]);
export function cleanLevels(v: unknown): string[] {
  return Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && VALID.has(x)))] : [];
}
/** A stored curriculum, with old schools (levels but no curriculum) read as Israeli. */
export function cleanCurriculum(v: unknown, levels: string[]): Curriculum | "" {
  if (v === "il-he" || v === "il-ar" || v === "za-caps" || v === "all" || v === "legacy") return v;
  return levels.length ? "il-he" : "";
}
export function schoolTypeOf(levels: string[], curriculum?: string): SchoolType | undefined {
  const k = [...levels].sort().join(",");
  return SCHOOL_TYPES.find((t) => (!curriculum || t.curriculum === curriculum) && [...t.levels].sort().join(",") === k);
}
/** May a school with this curriculum open a topic from that catalog? */
export const curriculumAllows = (school: string, catalog: string) => school === "all" || school === catalog;
