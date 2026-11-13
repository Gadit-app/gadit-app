/**
 * School grades and the six shelves of the games area (Gadi 2026-11-13).
 *
 * A parent thinks in grades, so a child's profile carries a grade. The games
 * area has only about thirty games, so it is arranged in six bands, not
 * thirteen single grades (the council, 2026-11-13: thirteen shelves of two or
 * three games read as an empty shop).
 *
 * Grade is how a parent searches; level is what the child needs. A child in
 * 2nd grade who cannot read vowel signs yet needs the first band, so a parent
 * can set the games level apart from the grade. The child never sees a grade
 * or a band name, only "my games".
 *
 * THE TABLE BELOW IS THE ONE PLACE that says which game fits which band.
 */

export const BANDS = ["pre1", "g12", "g34", "g56", "mid", "high"] as const;
export type Band = (typeof BANDS)[number];
export const isBand = (v: unknown): v is Band => typeof v === "string" && (BANDS as readonly string[]).includes(v);

/** Grade 0 is "not in 1st grade yet"; 1 to 12 are the school grades. */
export const MAX_GRADE = 12;
export function cleanGrade(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 0 && n <= MAX_GRADE ? Math.floor(n) : null;
}
export function bandOfGrade(grade: number): Band {
  if (grade <= 0) return "pre1";
  if (grade <= 2) return "g12";
  if (grade <= 4) return "g34";
  if (grade <= 6) return "g56";
  if (grade <= 9) return "mid";
  return "high";
}
/** The grade a child of this age is usually in (6 years old = 1st grade). */
export function gradeFromAge(age: number | null | undefined): number | null {
  if (typeof age !== "number" || !Number.isFinite(age) || age <= 0) return null;
  return Math.max(0, Math.min(MAX_GRADE, Math.floor(age) - 6));
}

// The school year begins in January south of the equator (South Africa,
// Australia, most of South America) and in September elsewhere. The
// device's time zone is enough to tell which.
const SOUTH = /^(Africa\/(Johannesburg|Maseru|Mbabane|Gaborone|Windhoek|Harare|Maputo|Lusaka|Blantyre)|Australia\/|Pacific\/(Auckland|Fiji)|America\/(Sao_Paulo|Argentina|Buenos_Aires|Santiago|Montevideo|Asuncion|La_Paz|Lima))/;
export function southernSchoolYear(timeZone?: string): boolean {
  let tz = timeZone;
  if (!tz) { try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { tz = ""; } }
  return SOUTH.test(tz ?? "");
}
function schoolYearOf(d: Date, south: boolean): number {
  return south || d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
}
/** The grade today: the saved grade, moved up once for every school year that
 *  began since the parent set it. */
export function gradeNow(grade: number, setAt: string | null | undefined, south = southernSchoolYear(), now = new Date()): number {
  const at = setAt ? new Date(setAt) : null;
  if (!at || Number.isNaN(at.getTime())) return grade;
  return Math.max(0, Math.min(MAX_GRADE, grade + Math.max(0, schoolYearOf(now, south) - schoolYearOf(at, south))));
}

/** A member doc's games band: the level a parent set, else the grade, else the age. */
export function bandOfMember(m: { level?: unknown; grade?: unknown; gradeSetAt?: unknown; age?: unknown } | null | undefined): Band | null {
  if (!m) return null;
  if (isBand(m.level)) return m.level;
  const g = cleanGrade(m.grade);
  if (g !== null) return bandOfGrade(gradeNow(g, typeof m.gradeSetAt === "string" ? m.gradeSetAt : null));
  const fromAge = gradeFromAge(Number(m.age));
  return fromAge === null ? null : bandOfGrade(fromAge);
}

const range = (from: Band, to: Band): Band[] => BANDS.slice(BANDS.indexOf(from), BANDS.indexOf(to) + 1);

/**
 * Which bands each game fits. Keys are the game ids of the games area, plus
 * the four cards that are not in the catalog (world, catch, catch-fair, duel).
 * A first reading by the team; change a line here and the shelves follow.
 */
export const GAME_BANDS: Record<string, Band[]> = {
  // first readers (Hebrew letters and vowel signs)
  vowels: range("pre1", "g12"),
  wheel: range("pre1", "g12"),
  syllables: range("pre1", "g12"),
  catch: range("pre1", "g34"),
  "catch-fair": range("pre1", "g34"),
  // the child's own words
  memory: range("g12", "g34"),
  flashcards: range("g12", "g56"),
  wordsearch: range("g12", "g56"),
  world: range("g12", "g56"),
  flashdefs: range("g34", "mid"),
  truefalse: range("g34", "mid"),
  anagram: range("g34", "mid"),
  speed: range("g34", "mid"),
  context: range("g34", "mid"),
  build: range("g34", "mid"),
  lens: range("g34", "mid"),
  duel: range("g34", "high"),
  quiz: range("g34", "high"),
  fillblank: range("g34", "high"),
  crossword: range("g34", "high"),
  // precision, origins and structure
  arrowword: range("g56", "high"),
  twin: range("g56", "high"),
  root: range("g56", "high"),
  shade: range("g56", "high"),
  idiom: range("g56", "high"),
  time: range("g56", "high"),
  passport: range("g56", "high"),
  artist: range("g56", "high"),
  friends: range("mid", "high"),
};

export type Shelf = "fit" | "warm" | "challenge" | "more";
export const SHELVES: Shelf[] = ["fit", "warm", "challenge", "more"];
/** Where a game sits for a child of this band. Nothing is ever hidden: a game
 *  far from the band goes to "more". A game with no line in the table fits. */
export function shelfOf(gameId: string, band: Band): Shelf {
  const fits = GAME_BANDS[gameId];
  if (!fits || fits.includes(band)) return "fit";
  const at = BANDS.indexOf(band);
  const lo = BANDS.indexOf(fits[0]), hi = BANDS.indexOf(fits[fits.length - 1]);
  if (hi === at - 1) return "warm";
  if (lo === at + 1) return "challenge";
  return "more";
}

type BandCopy = {
  bands: Record<Band, string>;
  mine: string; fits: (band: string) => string; warm: string; challenge: string; more: string;
  showFor: string; all: string;
  gradeLabel: string; notYet: string; grade: (n: number) => string; noGrade: string;
  levelLabel: string; levelByGrade: string; levelHint: string;
};
const HE_GRADES = ["", "א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ז'", "ח'", "ט'", "י'", "י\"א", "י\"ב"];
const COPY: Record<string, BandCopy> = {
  he: {
    bands: { pre1: "הכנה לכיתה א'", g12: "כיתות א' עד ב'", g34: "כיתות ג' עד ד'", g56: "כיתות ה' עד ו'", mid: "חטיבת ביניים", high: "תיכון" },
    mine: "המשחקים שלי", fits: (b) => `מתאים ל${b}`, warm: "חימום", challenge: "אתגר", more: "עוד משחקים",
    showFor: "משחקים לפי כיתה", all: "הכול",
    gradeLabel: "כיתה", notYet: "עוד לא בכיתה א'", grade: (n) => `כיתה ${HE_GRADES[n]}`, noGrade: "לא נבחרה",
    levelLabel: "רמת המשחקים", levelByGrade: "לפי הכיתה",
    levelHint: "אפשר לבחור רמה אחרת מהכיתה. הילד רואה רק \"המשחקים שלי\", בלי שם של כיתה",
  },
  en: {
    bands: { pre1: "Ready for 1st grade", g12: "Grades 1 to 2", g34: "Grades 3 to 4", g56: "Grades 5 to 6", mid: "Middle school", high: "High school" },
    mine: "My games", fits: (b) => `Fits: ${b}`, warm: "Warm-up", challenge: "Challenge", more: "More games",
    showFor: "Games by grade", all: "All",
    gradeLabel: "Grade", notYet: "Not in 1st grade yet", grade: (n) => `Grade ${n}`, noGrade: "Not chosen",
    levelLabel: "Games level", levelByGrade: "By the grade",
    levelHint: "You can choose a level that differs from the grade. The child sees only \"My games\", never a grade name",
  },
  ar: {
    bands: { pre1: "تحضير للصف الأول", g12: "الصفان الأول والثاني", g34: "الصفان الثالث والرابع", g56: "الصفان الخامس والسادس", mid: "المرحلة الإعدادية", high: "المرحلة الثانوية" },
    mine: "ألعابي", fits: (b) => `مناسب لـ: ${b}`, warm: "إحماء", challenge: "تحدٍّ", more: "ألعاب أخرى",
    showFor: "ألعاب حسب الصف", all: "الكل",
    gradeLabel: "الصف", notYet: "ليس في الصف الأول بعد", grade: (n) => `الصف ${n}`, noGrade: "لم يُختر",
    levelLabel: "مستوى الألعاب", levelByGrade: "حسب الصف",
    levelHint: "يمكن اختيار مستوى يختلف عن الصف. الطفل يرى فقط \"ألعابي\" بلا اسم صف",
  },
  ru: {
    bands: { pre1: "Подготовка к 1 классу", g12: "1 и 2 классы", g34: "3 и 4 классы", g56: "5 и 6 классы", mid: "Средняя школа", high: "Старшая школа" },
    mine: "Мои игры", fits: (b) => `Подходит: ${b}`, warm: "Разминка", challenge: "Вызов", more: "Другие игры",
    showFor: "Игры по классам", all: "Все",
    gradeLabel: "Класс", notYet: "Ещё не в 1 классе", grade: (n) => `${n} класс`, noGrade: "Не выбран",
    levelLabel: "Уровень игр", levelByGrade: "По классу",
    levelHint: "Можно выбрать уровень, который отличается от класса. Ребёнок видит только «Мои игры», без названия класса",
  },
};
export const bandCopy = (lang: string): BandCopy => COPY[lang] ?? COPY.en;
export const gradeName = (lang: string, grade: number): string => (grade <= 0 ? bandCopy(lang).notYet : bandCopy(lang).grade(grade));
