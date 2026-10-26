import fs from "node:fs";
import path from "node:path";
import { getAdminDb } from "@/lib/firebase-admin";
import { CUR_TOPICS, zaTopic } from "@/lib/curriculum-catalog";
import { getCurriculumSetDoc } from "@/lib/curriculum-sets";
import za from "@/lib/curriculum-catalog-za.json";

/**
 * "Key words by subject" (מילות מפתח במקצועות, Gadi 2026-10-26): a page for
 * Family and Individual subscribers that shows a school topic's key words,
 * each with only the meaning that fits the subject. It reuses the curriculum
 * sets as they are and never generates one:
 *   he: the Israeli catalog, words in Firestore curriculumSets/{id}
 *   en: the South African catalog, built-in words or a Firestore override
 *   de: curriculum-catalog-de.json + curriculum-sets-de.json (read from disk
 *       when present, so the build never depends on them), or a Firestore
 *       override like the South African ones
 * A further language is one more entry in CATALOGS below.
 *
 * Elementary first (Gadi 2026-10-26: many mothers buy Gadit for children in
 * elementary school): the subject cards depend on the level. "younger" has
 * the subjects of elementary school (arithmetic, geometry, science, the home
 * language...), "older" the six secondary subjects plus geometry. Each card
 * is a key, a label, an icon and the rule that picks its topics; a topic
 * belongs to exactly one card, and the card's label is the subject name the
 * word page receives.
 *
 * Read-only. Nothing here touches a school, its quotas, digests or reports.
 * Only catalog ids of these cards' topics are ever served; a school's own set
 * ("cur-sch-") or any other id is not in the allowed list.
 */

export type SubjectsLang = "he" | "en" | "de";
export type SubjectAge = "younger" | "older";

export type SubjectTopic = { id: string; title: string; age: SubjectAge };
/** One subject card of one level. The same key can appear once per level
 *  ("mathematics" is חשבון for younger and מתמטיקה for older). */
export type SubjectEntry = { key: string; age: SubjectAge; name: string; icon: string; topics: SubjectTopic[] };
export type SubjectsCatalog = { lang: SubjectsLang; subjects: SubjectEntry[] };
export type SubjectWord = { w: string; d: string };
export type SubjectTopicWords = { id: string; subject: string; subjectName: string; icon: string; title: string; age: SubjectAge; words: SubjectWord[] };

/** A subject card: key, label and icon (public/subjects/<icon>.webp). */
type Card = { key: string; name: string; icon: string };
type Row = SubjectTopic & { card: string; sort: number[] };
type Catalog = {
  /** id prefix of this catalog's topics */
  prefix: string;
  /** The cards of each level, in the order they are shown. */
  cards: Record<SubjectAge, Card[]>;
  rows: () => Row[];
  /** Ids that have words, before any Firestore check. null = check Firestore. */
  builtInIds: (() => Set<string>) | null;
  /** The words of one topic. */
  words: (id: string) => Promise<Array<{ w: string; d: string }> | null>;
};

const card = (key: string, name: string, icon = key): Card => ({ key, name, icon });
// Geometry has no icon of its own: it uses the math field icon (calculator and ruler), so it differs from arithmetic.
const GEO_ICON = "cat-math";

// ── Hebrew: the Israeli catalog ──────────────────────────────────────────
const HE_GRADE: Record<string, number> = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, יא: 11, יב: 12 };
function heGrades(g: string): [number, number] {
  const s = (g || "").trim();
  if (!s || s.includes("גן")) return [0, 0];
  const [a, b] = s.split("-").map((x) => HE_GRADE[x.trim()] ?? 99);
  return [a, b ?? a];
}
const HE_LEVEL_RANK: Record<string, number> = { gan: 0, elementary: 1, middle: 2, high: 3 };
const ageOfHe = (l: string): SubjectAge | null => (l === "gan" || l === "elementary" ? "younger" : l === "middle" || l === "high" ? "older" : null);
const HE_CARDS: Record<SubjectAge, Card[]> = {
  younger: [
    card("mathematics", "חשבון"),
    card("geometry", "גאומטריה", GEO_ICON),
    card("science-and-technology", "מדעים"),
    card("hebrew", "עברית"),
    card("english", "אנגלית"),
    card("homeland-society-and-civics", "מולדת"),
    card("geography", "גאוגרפיה"),
    card("bible", "תנ\"ך"),
    card("history", "היסטוריה"),
  ],
  older: [
    card("mathematics", "מתמטיקה"),
    card("geometry", "גאומטריה", GEO_ICON),
    card("chemistry", "כימיה"),
    card("physics", "פיזיקה"),
    card("biology", "ביולוגיה"),
    card("history", "היסטוריה"),
    card("geography", "גאוגרפיה"),
  ],
};
/** The geometry topics of mathematics, by their catalog titles. */
const HE_GEOMETRY = new Set([
  // gan + elementary
  "צורות גאומטריות בסיסיות ותחושה מרחבית", "מצולעים ומשולשים", "זוויות", "מרובעים", "היקף ושטח",
  "מעגל ועיגול", "גופים: נפח ושטח פנים", "סימטריה",
  // middle + high
  "זוויות וישרים מקבילים", "משולשים: סוגים ותכונות", "חפיפת משולשים", "משולש שווה שוקיים ודלתון",
  "מרובעים: מקבילית, מלבן, מעוין וטרפז", "משפט פיתגורס", "דמיון משולשים", "מעגל: היקף ושטח",
  "גופים במרחב: נפח ושטח פנים", "גאומטריה אוקלידית: משולשים ומעגל", "גאומטריה אנליטית",
]);

function heRows(): Row[] {
  const rows: Row[] = [];
  CUR_TOPICS.forEach((t, i) => {
    const age = ageOfHe(t.l);
    if (!age) return;
    const key = t.s === "mathematics" && HE_GEOMETRY.has(t.t.trim()) ? "geometry" : t.s;
    if (!HE_CARDS[age].some((c) => c.key === key)) return;
    const [g1, g2] = heGrades(t.g);
    rows.push({ id: t.id, title: t.t, age, card: key, sort: [HE_LEVEL_RANK[t.l] ?? 9, g1, g2, i] });
  });
  return rows;
}

// ── English: South Africa ────────────────────────────────────────────────
// younger = Intermediate Phase (gr 4-6), older = Senior Phase (gr 7-9).
// Geometry is the "Space and Shape" / "Shape and Space" strand of mathematics.
// Older natural sciences split by strand; "Planet Earth and Beyond" belongs
// to none of the cards. Younger natural sciences stay ONE card.
const ZA_STRAND: Record<string, string> = {
  "matter & materials": "chemistry", "matter and materials": "chemistry",
  "energy & change": "physics", "energy and change": "physics",
  "life & living": "biology", "life and living": "biology",
};
const isZaGeometry = (strand: string | undefined) => /^(space and shape|shape and space)( \(geometry\))?$/i.test((strand ?? "").trim());
const EN_CARDS: Record<SubjectAge, Card[]> = {
  younger: [
    card("mathematics", "Math"),
    card("geometry", "Geometry", GEO_ICON),
    card("natural-sciences-technology", "Natural Sciences"),
    card("english-home-language", "English"),
    card("life-skills", "Life Skills"),
    card("geography", "Geography"),
    card("history", "History"),
  ],
  older: [
    card("mathematics", "Mathematics"),
    card("geometry", "Geometry", GEO_ICON),
    card("chemistry", "Chemistry"),
    card("physics", "Physics"),
    card("biology", "Biology"),
    card("history", "History"),
    card("geography", "Geography"),
  ],
};
function zaCardOf(s: string, strand: string | undefined, age: SubjectAge): string | null {
  if (s === "mathematics") return isZaGeometry(strand) ? "geometry" : "mathematics";
  if (age === "older" && s === "natural-sciences") return ZA_STRAND[(strand ?? "").trim().toLowerCase()] ?? null;
  return s;
}
type ZaRow = { id: string; s: string; l: string; g: string; t: string; term?: number | null; strand?: string };
function enRows(): Row[] {
  const rows: Row[] = [];
  (za.topics as ZaRow[]).forEach((t, i) => {
    const age: SubjectAge | null = t.l === "intermediate" ? "younger" : t.l === "senior" ? "older" : null;
    if (!age) return;
    const key = zaCardOf(t.s, t.strand, age);
    if (!key || !EN_CARDS[age].some((c) => c.key === key)) return;
    rows.push({ id: t.id, title: t.t, age, card: key, sort: [age === "younger" ? 0 : 1, Number(t.g) || 99, t.term ?? 9, i] });
  });
  return rows;
}

// ── German: two optional static files ────────────────────────────────────
type DeCatalogFile = {
  subjects?: Array<{ key: string; de?: string; en?: string; he?: string; cat?: string }>;
  topics?: Record<string, { id: string; s: string; l: string; t: string; o?: number }> | Array<{ id: string; s: string; l: string; t: string; o?: number }>;
};
type SetsFile = Record<string, { words?: string[]; defs?: Record<string, string> }>;
// Younger: chemistry, physics and biology are one card, "Natur und Technik"
// (as in Lehrplan 21, Zyklus 2), and German itself is a subject.
const DE_CARDS: Record<SubjectAge, Card[]> = {
  younger: [
    card("mathematics", "Mathematik"),
    card("geometry", "Geometrie", GEO_ICON),
    card("nature-and-technology", "Natur und Technik", "science-and-technology"),
    card("german", "Deutsch", "cat-language"),
    card("geography", "Geografie"),
    card("history", "Geschichte"),
  ],
  older: [
    card("mathematics", "Mathematik"),
    card("geometry", "Geometrie", GEO_ICON),
    card("chemistry", "Chemie"),
    card("physics", "Physik"),
    card("biology", "Biologie"),
    card("history", "Geschichte"),
    card("geography", "Geografie"),
  ],
};
/** The geometry topics of mathematics, by their titles. */
const DE_GEOMETRY = new Set(["Geometrie", "Umfang und Flächeninhalt", "Geometrie in der Ebene", "Körper und Messen"]);
function deCardOf(s: string, title: string, age: SubjectAge): string {
  if (s === "mathematics") return DE_GEOMETRY.has(title.trim()) ? "geometry" : "mathematics";
  if (age === "younger" && (s === "chemistry" || s === "physics" || s === "biology")) return "nature-and-technology";
  return s;
}
// Read from disk (next.config.ts traces them into the function): a missing
// or broken file just means no German catalog, never a failed build.
function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "lib", file), "utf8")) as T;
  } catch {
    return null;
  }
}
let deCache: { cat: DeCatalogFile | null; sets: SetsFile | null } | null = null;
function deFiles() {
  if (!deCache) deCache = { cat: readJson<DeCatalogFile>("curriculum-catalog-de.json"), sets: readJson<SetsFile>("curriculum-sets-de.json") };
  return deCache;
}
function deRows(): Row[] {
  const { cat, sets } = deFiles();
  if (!cat || !sets) return [];
  const list = Array.isArray(cat.topics) ? cat.topics : Object.values(cat.topics ?? {});
  const rows: Row[] = [];
  list.forEach((t, i) => {
    if (!t || typeof t.id !== "string" || !t.id.startsWith("cur-de-") || typeof t.s !== "string") return;
    const age: SubjectAge | null = t.l === "younger" || t.l === "older" ? t.l : null;
    if (!age || !t.t) return;
    const key = deCardOf(t.s, String(t.t), age);
    if (!DE_CARDS[age].some((c) => c.key === key)) return;
    rows.push({ id: t.id, title: String(t.t), age, card: key, sort: [age === "younger" ? 0 : 1, Number(t.o ?? i), i] });
  });
  return rows;
}
function setsWords(sets: SetsFile | null, id: string) {
  const s = sets?.[id];
  if (!s?.words?.length) return null;
  return s.words.map((w) => ({ w, d: s.defs?.[w] ?? "" }));
}

/** A stored Firestore set (an admin edit), or null. */
async function firestoreWords(id: string) {
  const snap = await getAdminDb().collection("curriculumSets").doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data() as { set?: { words?: string[] }; defs?: Record<string, string>; items?: Array<{ w?: string; d?: string }> };
  if (Array.isArray(d.items) && d.items.length) return d.items.map((i) => ({ w: String(i.w ?? ""), d: String(i.d ?? "") }));
  if (!d.set?.words?.length) return null;
  return d.set.words.map((w) => ({ w, d: d.defs?.[w] ?? "" }));
}

/** Words of a catalog unit through the shared loader (Hebrew, South Africa). */
async function sharedWords(id: string) {
  // create=false: read the stored set (or the built-in South African words), never generate.
  const doc = await getCurriculumSetDoc(id, false);
  if (!doc) return null;
  return doc.items?.length ? doc.items.map((i) => ({ w: i.w, d: i.d })) : doc.set.words.map((w) => ({ w, d: doc.defs?.[w] ?? "" }));
}

const CATALOGS: Record<SubjectsLang, Catalog> = {
  he: {
    prefix: "cur-",
    cards: HE_CARDS,
    rows: heRows,
    builtInIds: null,
    words: sharedWords,
  },
  en: {
    prefix: "cur-za-",
    cards: EN_CARDS,
    rows: enRows,
    // Every South African topic has built-in words (curriculum-sets-za.json).
    builtInIds: () => new Set(enRows().filter((r) => zaTopic(r.id)).map((r) => r.id)),
    words: sharedWords,
  },
  de: {
    prefix: "cur-de-",
    cards: DE_CARDS,
    rows: deRows,
    builtInIds: () => new Set(deRows().filter((r) => setsWords(deFiles().sets, r.id)).map((r) => r.id)),
    words: async (id) => (await firestoreWords(id)) ?? setsWords(deFiles().sets, id),
  },
};

/** Languages with a catalog on this server (German only once its files exist). */
export function subjectsLangs(): SubjectsLang[] {
  return (Object.keys(CATALOGS) as SubjectsLang[]).filter((l) => staticRows(l).rows.length > 0);
}

function cardOf(lang: SubjectsLang, age: SubjectAge, key: string): Card | undefined {
  return CATALOGS[lang].cards[age].find((c) => c.key === key);
}
const iconPath = (c: Card) => `/subjects/${c.icon}.webp`;

// ── The static part: every allowed topic, in order (built once) ─────────
function bySort(a: Row, b: Row): number {
  for (let i = 0; i < Math.max(a.sort.length, b.sort.length); i++) {
    const d = (a.sort[i] ?? 0) - (b.sort[i] ?? 0);
    if (d) return d;
  }
  return 0;
}
const STATIC: Partial<Record<SubjectsLang, { rows: Row[]; byId: Map<string, Row> }>> = {};
function staticRows(lang: SubjectsLang) {
  let s = STATIC[lang];
  if (!s) {
    const rows = CATALOGS[lang].rows().sort(bySort);
    s = { rows, byId: new Map(rows.map((r) => [r.id, r])) };
    STATIC[lang] = s;
  }
  return s;
}

/** Is this id one of the topics this page may show in this language? */
export function allowedTopic(lang: SubjectsLang, id: string): boolean {
  // Never a school's own set, whatever its id looks like.
  if (!id.startsWith(CATALOGS[lang].prefix) || id.startsWith("cur-sch-")) return false;
  return staticRows(lang).byId.has(id);
}

// ── Which topics have words (cached a few minutes) ──────────────────────
// A Hebrew topic has words only once a school opened it (Firestore). We never
// generate one here, so a topic with no stored words is not listed.
const AVAIL_TTL_MS = 10 * 60 * 1000;
const avail: Partial<Record<SubjectsLang, { at: number; ids: Set<string> }>> = {};

async function availableIds(lang: SubjectsLang): Promise<Set<string>> {
  const hit = avail[lang];
  if (hit && Date.now() - hit.at < AVAIL_TTL_MS) return hit.ids;
  const cat = CATALOGS[lang];
  let ids: Set<string>;
  if (cat.builtInIds) {
    ids = cat.builtInIds();
  } else {
    ids = new Set<string>();
    const db = getAdminDb();
    const refs = staticRows(lang).rows.map((r) => db.collection("curriculumSets").doc(r.id));
    for (let i = 0; i < refs.length; i += 300) {
      const snaps = await db.getAll(...refs.slice(i, i + 300), { fieldMask: ["set.words"] });
      for (const s of snaps) {
        const words = s.exists ? s.get("set.words") : undefined;
        if (Array.isArray(words) && words.length > 0) ids.add(s.id);
      }
    }
  }
  avail[lang] = { at: Date.now(), ids };
  return ids;
}

/** The subject cards of both levels (younger first), each with its topics
 *  that have words, in that language. A card with no topics is left out. */
export async function subjectsCatalog(lang: SubjectsLang): Promise<SubjectsCatalog> {
  const ids = await availableIds(lang);
  const rows = staticRows(lang).rows;
  const subjects: SubjectEntry[] = [];
  for (const age of ["younger", "older"] as const) {
    for (const c of CATALOGS[lang].cards[age]) {
      const topics = rows.filter((r) => r.age === age && r.card === c.key && ids.has(r.id)).map(({ id, title, age: a }) => ({ id, title, age: a }));
      if (topics.length) subjects.push({ key: c.key, age, name: c.name, icon: iconPath(c), topics });
    }
  }
  return { lang, subjects };
}

/** One topic's key words with their subject definitions, always read fresh
 *  (an admin may have edited them). Null when not allowed or no words. */
export async function subjectTopicWords(lang: SubjectsLang, id: string): Promise<SubjectTopicWords | null> {
  if (!allowedTopic(lang, id)) return null;
  const row = staticRows(lang).byId.get(id);
  if (!row) return null;
  const c = cardOf(lang, row.age, row.card);
  if (!c) return null;
  const pairs = await CATALOGS[lang].words(id);
  if (!pairs) return null;
  const seen = new Set<string>();
  const words: SubjectWord[] = [];
  for (const p of pairs) {
    const w = String(p.w ?? "").trim();
    const d = String(p.d ?? "").replace(/\s*[–—]\s*/g, ", ").trim();
    const k = `${w}\n${d}`;
    if (!w || !d || seen.has(k)) continue;
    seen.add(k);
    words.push({ w, d });
  }
  if (!words.length) return null;
  return { id, subject: c.key, subjectName: c.name, icon: iconPath(c), title: row.title, age: row.age, words };
}
