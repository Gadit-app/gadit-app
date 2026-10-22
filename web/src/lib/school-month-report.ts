import type { Firestore, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { tzDay, schoolTimezone, schoolAccountUids, classroomSearches, splitProjections } from "@/lib/school-day-report";
import { isInternalEmail } from "@/lib/internal-accounts";
import { normalizeClassWord } from "@/lib/class-milestones";
import { curSubject, gradeLabel, catalogView, zaSubjectName, arSubject, type CatalogId } from "@/lib/curriculum-catalog";
import zaSets from "@/lib/curriculum-sets-za.json";
import { schoolLang } from "@/lib/email-drip/school-drip";
import { renderEmailHtmlV2 } from "@/lib/email-drip/render";
import { sendDripEmail } from "@/lib/email-drip/send";
import { buildUnsubUrl } from "@/lib/email-drip/registry";

/**
 * Monthly school report (Gadi approved 2026-10-22): on the 1st of every month
 * (the school's own date, at its daily digest hour) the school gets one email
 * about the month that just ended, next to the daily summary it already gets.
 *
 * Numbers, for one calendar month in the school's timezone, from the same
 * three sources as the morning report to Gadi (lib/school-day-report.ts):
 *   - the school's own signed-in accounts: `activityLog` rows (kind "word");
 *     one row is one lookup (a row is one word in a 10-minute window, its
 *     `count` also grows on page re-fetches, so it is not summed here);
 *   - kids on a class code: schools/{id}/classrooms/{c}/searches. In a school
 *     with one class, a lookup on the school account is ALSO copied there
 *     (via "school_account", /api/school/word-count), so those copies count
 *     for the class but never a second time in the totals;
 *   - the teacher on the projector: schools/{id}/projections (word / quiz /
 *     game). Their `day` is the Israel date, read as is (an hour off at most
 *     at a month's edge for a school outside Israel).
 * And the same numbers for the month before, for the comparison.
 *
 * Copy: Hebrew for Israeli curricula, English for the rest (schoolLang, as
 * the school pilot series). Never prices, pausing or cancelling.
 * Ledger: schools/{id}.monthlyReportSent = "YYYY-MM" (the month reported).
 * Switch: emailConfig/schoolMonthlyReport.enabled (off until Gadi approves).
 * A school can be left out with schools/{id}.monthlyReport.enabled === false;
 * the email's unsubscribe link (users/{schoolId}.dripUnsubscribed) also stops it.
 */

export const SCHOOL_MONTHLY_CONFIG_DOC = "emailConfig/schoolMonthlyReport";

export async function schoolMonthlyReportEnabled(db: Firestore): Promise<boolean> {
  try {
    const s = await db.doc(SCHOOL_MONTHLY_CONFIG_DOC).get();
    return s.exists && s.data()?.enabled === true;
  } catch {
    return false;
  }
}

// ── Months ─────────────────────────────────────────────────────────────

export const isMonthKey = (m: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m);

export function prevMonthKey(m: string): string {
  const y = +m.slice(0, 4), mo = +m.slice(5, 7);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
}
export function nextMonthKey(m: string): string {
  const y = +m.slice(0, 4), mo = +m.slice(5, 7);
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
}
/** UTC ms of the 1st of a month at 00:00 UTC. */
const monthStartUtc = (m: string) => Date.UTC(+m.slice(0, 4), +m.slice(5, 7) - 1, 1);

// ── Data ───────────────────────────────────────────────────────────────

export type MonthNumbers = {
  month: string;
  /** Every lookup: school accounts plus class codes (copies not counted twice). */
  lookups: number;
  distinctWords: number;
  /** Days of the month with any use (lookup or projection). */
  activeDays: number;
  /** Classrooms with at least one lookup this month, busiest first. */
  classes: Array<{ id: string; name: string; teacher: string; lookups: number }>;
  topWords: Array<{ word: string; count: number }>;
  /** Different words the teacher showed on the projector. */
  projectedWords: string[];
  /** The word sets they came from, most words first. */
  projectedSets: Array<{ setId: string; title: string; subject: string; words: number }>;
  quizzes: number;
  games: number;
};

export type SchoolMonthReport = {
  schoolId: string;
  name: string;
  curriculum: string;
  levels: string[];
  tz: string;
  lang: "he" | "en";
  /** The daily digest's recipient. */
  to: string | null;
  isDemo: boolean;
  internal: boolean;
  /** schools/{id}.monthlyReport.enabled === false, or the owner unsubscribed. */
  optedOut: boolean;
  createdMonth: string | null;
  lastSent: string | null;
  digestHour: number;
  /** The month is still running in the school's timezone (a preview). */
  partial: boolean;
  current: MonthNumbers;
  previous: MonthNumbers;
  idea: Idea | null;
  /** The "in class" and "idea for next month" sections (projected sets,
   *  class quizzes). Off per school with monthlyReport.classroomTips === false,
   *  e.g. Greenwarth: no board or projector, each child works at their own
   *  pace (Gadi 2026-10-22). */
  classroomTips: boolean;
};

type Bucket = {
  lookups: number;
  words: Map<string, { count: number; forms: Map<string, number> }>;
  days: Set<string>;
  classLookups: Map<string, number>;
  projected: Map<string, string>;
  sets: Map<string, { title: string; subject: string; words: Set<string> }>;
  quizzes: number;
  games: number;
};
const newBucket = (): Bucket => ({ lookups: 0, words: new Map(), days: new Set(), classLookups: new Map(), projected: new Map(), sets: new Map(), quizzes: 0, games: 0 });

function addWord(b: Bucket, raw: unknown) {
  const form = String(raw ?? "").trim().replace(/[.,;:!?'"’]+$/u, "");
  const key = normalizeClassWord(form);
  if (!key) return;
  const w = b.words.get(key) ?? { count: 0, forms: new Map<string, number>() };
  w.count++;
  w.forms.set(form, (w.forms.get(form) ?? 0) + 1);
  b.words.set(key, w);
  b.lookups++;
}

function createdMonthOf(v: unknown): string | null {
  const iso = typeof v === "string" ? v : (v as { toDate?: () => Date } | null)?.toDate?.()?.toISOString?.();
  return iso && /^\d{4}-\d{2}/.test(iso) ? iso.slice(0, 7) : null;
}

/** One school, one calendar month (and the month before) in its timezone. */
export async function schoolMonthReport(db: Firestore, schoolId: string, month: string, opts: { lang?: string | null; now?: number } = {}): Promise<SchoolMonthReport | null> {
  if (!isMonthKey(month)) throw new Error("bad_month");
  const sDoc = await db.collection("schools").doc(schoolId).get();
  if (!sDoc.exists) return null;
  const s = sDoc.data() as DocumentData;
  const tz = schoolTimezone(s);
  const prev = prevMonthKey(month);
  const now = opts.now ?? Date.now();

  // Both months with a margin of 14 hours either side; rows are then matched by their local date.
  const fromMs = monthStartUtc(prev) - 14 * 3600_000;
  const toMs = monthStartUtc(nextMonthKey(month)) + 14 * 3600_000;
  const buckets: Record<string, Bucket> = { [month]: newBucket(), [prev]: newBucket() };
  const bucketOf = (ms: number) => (Number.isFinite(ms) ? buckets[tzDay(ms, tz).slice(0, 7)] : undefined);

  const [uidMap, classrooms, projections, owner] = await Promise.all([
    schoolAccountUids(db, [schoolId]),
    sDoc.ref.collection("classrooms").get(),
    sDoc.ref.collection("projections").where("day", ">=", `${prev}-01`).where("day", "<=", `${month}-31`).get(),
    db.collection("users").doc(schoolId).get(),
  ]);

  // The school's own accounts. Queried by uid (no composite index), the
  // window applied here.
  const uids = [...uidMap.keys()];
  for (let i = 0; i < uids.length; i += 30) {
    const snap = await db.collection("activityLog").where("uid", "in", uids.slice(i, i + 30)).select("word", "kind", "atMs", "isBot").get();
    for (const a of snap.docs) {
      if (a.get("kind") !== "word" || a.get("isBot") === true) continue;
      const ms = Number(a.get("atMs"));
      if (!(ms >= fromMs && ms < toMs)) continue;
      const b = bucketOf(ms);
      if (!b) continue;
      addWord(b, a.get("word"));
      b.days.add(tzDay(ms, tz));
    }
  }

  // Class codes. A "school_account" row is a copy of a lookup counted above:
  // it counts for its class only.
  const searches = await classroomSearches(classrooms.docs, new Date(fromMs).toISOString(), new Date(toMs).toISOString());
  for (const r of searches) {
    const b = bucketOf(r.atMs);
    if (!b) continue;
    b.classLookups.set(r.classroomId, (b.classLookups.get(r.classroomId) ?? 0) + 1);
    b.days.add(tzDay(r.atMs, tz));
    if (r.via !== "school_account") addWord(b, r.word);
  }

  // The projector.
  for (const [m, b] of Object.entries(buckets)) {
    const rows = projections.docs.filter((p) => String(p.get("day") ?? "").slice(0, 7) === m);
    for (const p of rows) b.days.add(String(p.get("day")));
    const { projectedWords } = splitProjections(rows);
    for (const w of projectedWords) {
      const key = normalizeClassWord(w);
      if (key && !b.projected.has(key)) b.projected.set(key, w.trim());
    }
    for (const p of rows) {
      const kind = String(p.get("kind") ?? "");
      const n = Math.max(1, Number(p.get("count") ?? 1));
      if (kind === "quiz") b.quizzes += n;
      else if (kind === "game") b.games += n;
      const setId = String(p.get("setId") ?? "");
      if (!setId) continue;
      const set = b.sets.get(setId) ?? { title: String(p.get("title") ?? "").trim(), subject: String(p.get("subject") ?? "").trim(), words: new Set<string>() };
      if (!set.title) set.title = String(p.get("title") ?? "").trim();
      if (kind === "word") set.words.add(normalizeClassWord(String(p.get("word") ?? "")));
      b.sets.set(setId, set);
    }
  }

  const classInfo = new Map(classrooms.docs.map((c) => [c.id, { name: String(c.get("name") ?? "").trim(), teacher: String(c.get("teacherName") ?? "").trim() }]));
  const numbers = (m: string): MonthNumbers => {
    const b = buckets[m];
    // The spelling shown: the most frequent one, the lower-case one on a tie ("high noon", not "High noon").
    const best = (forms: Map<string, number>) =>
      [...forms.entries()].sort((x, y) => y[1] - x[1] || Number(x[0] !== x[0].toLowerCase()) - Number(y[0] !== y[0].toLowerCase()) || x[0].localeCompare(y[0]))[0][0];
    return {
      month: m,
      lookups: b.lookups,
      distinctWords: b.words.size,
      activeDays: b.days.size,
      classes: [...b.classLookups.entries()]
        .map(([id, lookups]) => ({ id, name: classInfo.get(id)?.name || "", teacher: classInfo.get(id)?.teacher || "", lookups }))
        .sort((x, y) => y.lookups - x.lookups || x.name.localeCompare(y.name)),
      topWords: [...b.words.values()]
        .map((w) => ({ word: best(w.forms), count: w.count }))
        .sort((x, y) => y.count - x.count || x.word.localeCompare(y.word))
        .slice(0, 10),
      projectedWords: [...b.projected.values()],
      projectedSets: [...b.sets.entries()]
        .map(([setId, v]) => ({ setId, title: v.title, subject: v.subject, words: v.words.size }))
        .sort((x, y) => y.words - x.words || x.title.localeCompare(y.title)),
      quizzes: b.quizzes,
      games: b.games,
    };
  };

  const current = numbers(month);
  const previous = numbers(prev);
  const curriculum = String(s.curriculum ?? "");
  const levels = Array.isArray(s.levels) ? (s.levels as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const lang: "he" | "en" = opts.lang === "he" || opts.lang === "en" ? opts.lang : schoolLang(curriculum || undefined);
  const ownerEmail = (owner.get("email") as string | undefined) ?? null;
  const to = typeof s.contactEmail === "string" && s.contactEmail.trim() ? s.contactEmail.trim() : null;
  const everProjected = new Set(projections.docs.map((p) => String(p.get("setId") ?? "")));
  const idea = await suggestIdea(db, { curriculum, levels, lang, forMonth: nextMonthKey(month), exclude: everProjected, current, previous });

  return {
    schoolId,
    name: String(s.name ?? "").trim() || schoolId,
    curriculum,
    levels,
    tz,
    lang,
    to,
    isDemo: s.isDemo === true,
    internal: isInternalEmail(ownerEmail) || isInternalEmail(to),
    optedOut: (s.monthlyReport as { enabled?: boolean } | undefined)?.enabled === false || owner.get("dripUnsubscribed") === true || owner.get("emailSuppressed") === true,
    createdMonth: createdMonthOf(s.createdAt),
    lastSent: typeof s.monthlyReportSent === "string" ? s.monthlyReportSent : null,
    digestHour: typeof s.dailyDigest?.hour === "number" ? s.dailyDigest.hour : 15,
    partial: tzDay(now, tz).slice(0, 7) <= month,
    current,
    previous,
    idea,
    classroomTips: (s.monthlyReport as { classroomTips?: boolean } | undefined)?.classroomTips !== false,
  };
}

// ── One idea for next month: a real word set from the school's curriculum ──

export type Idea = {
  setId: string;
  title: string;
  subject: string;
  grade: string;
  /** A few of the set's words, when known. */
  words: string[];
  /** Path on gadit.app (without the language prefix). */
  path: string;
  /** South African term of the suggestion, when the catalog has terms. */
  term: number | null;
};

type Cand = { id: string; s: string; l: string; g: string; t: string; th?: string; term?: number | null };

/** The subject each catalog suggests when the school has not projected yet:
 *  the language subject, since a dictionary meets it in every lesson. */
const DEFAULT_SUBJECT: Record<CatalogId, string> = { "za-caps": "english-home-language", "il-he": "hebrew", "il-ar": "arabic-language" };
/** CAPS school terms: January to March, April to June, July to September, October to December. */
const zaTermOf = (m: string) => Math.ceil(+m.slice(5, 7) / 3);
const ZA_SETS = zaSets as Record<string, { words: string[] }>;

async function suggestIdea(
  db: Firestore,
  p: { curriculum: string; levels: string[]; lang: "he" | "en"; forMonth: string; exclude: Set<string>; current: MonthNumbers; previous: MonthNumbers },
): Promise<Idea | null> {
  const cat = p.curriculum === "il-he" || p.curriculum === "il-ar" || p.curriculum === "za-caps" ? (p.curriculum as CatalogId) : null;
  if (!cat) return null;
  const view = catalogView(cat);
  const topics = view.topics as Cand[];
  const byId = new Map(topics.map((t) => [t.id, t]));

  // The subject and level the teacher projects most, else the language subject at the school's first level.
  const tally = (pick: (t: Cand) => string) => {
    const m = new Map<string, number>();
    for (const set of [...p.current.projectedSets, ...p.previous.projectedSets]) {
      const t = byId.get(set.setId);
      if (t) m.set(pick(t), (m.get(pick(t)) ?? 0) + Math.max(1, set.words));
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const levelKeys = view.levels.map((l) => l.key);
  const schoolLevels = levelKeys.filter((k) => p.levels.includes(k));
  const subject = tally((t) => t.s) ?? DEFAULT_SUBJECT[cat];
  const level = tally((t) => t.l) ?? schoolLevels[0] ?? view.defaultLevel;

  let cands = topics.filter((t) => t.s === subject && t.l === level && !p.exclude.has(t.id));
  if (!cands.length) cands = topics.filter((t) => t.s === DEFAULT_SUBJECT[cat] && t.l === level && !p.exclude.has(t.id));
  const term = cat === "za-caps" ? zaTermOf(p.forMonth) : null;
  if (term && cands.some((t) => t.term === term)) cands = cands.filter((t) => t.term === term);
  if (cat === "za-caps") cands = cands.filter((t) => ZA_SETS[t.id]?.words?.length);
  if (!cands.length) return null;

  // A unit whose key words the students already looked up comes first; else
  // a unit that moves with the calendar (the matching part of the term, or
  // the next unit each month).
  const looked = new Set([...p.current.topWords, ...p.previous.topWords].map((w) => normalizeClassWord(w.word)));
  const overlap = (t: Cand) => (ZA_SETS[t.id]?.words ?? []).filter((w) => looked.has(normalizeClassWord(w))).length;
  const scored = cands.map((t, i) => ({ t, i, o: overlap(t) })).sort((a, b) => b.o - a.o || a.i - b.i);
  let pick = scored[0].t;
  if (!scored[0].o) {
    const mo = +p.forMonth.slice(5, 7);
    const idx = term ? Math.floor((cands.length * ((mo - 1) % 3)) / 3) : (+p.forMonth.slice(0, 4) * 12 + mo) % cands.length;
    pick = cands[Math.min(idx, cands.length - 1)];
  }

  // Words: the CAPS sets are in the code; an Israeli unit's words are read
  // from its cached set when a teacher already opened it.
  let words: string[] = ZA_SETS[pick.id]?.words ?? [];
  if (!words.length) {
    try {
      const c = await db.collection("curriculumSets").doc(pick.id).get();
      const w = c.get("set.words");
      if (Array.isArray(w)) words = w.filter((x): x is string => typeof x === "string");
    } catch { /* no words shown */ }
  }

  const subjectName = cat === "za-caps" ? zaSubjectName(pick.s) : cat === "il-ar" ? arSubject(pick.s)?.he ?? pick.s : curSubject(pick.s)?.he ?? pick.s;
  const grade = cat === "za-caps" ? (pick.g ? `Grade ${pick.g}` : "") : gradeLabel(pick.g);
  const title = cat === "il-ar" && p.lang === "he" ? pick.th || pick.t : pick.t;
  return {
    setId: pick.id,
    title,
    subject: subjectName,
    grade,
    words: words.slice(0, 6),
    path: `/sets?s=${encodeURIComponent(pick.s)}&l=${encodeURIComponent(pick.l)}&t=${encodeURIComponent(pick.id)}`,
    term,
  };
}

// ── Email ──────────────────────────────────────────────────────────────

const SITE = "https://www.gadit.app";
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const monthName = (m: string, he: boolean) => (he ? MONTHS_HE : MONTHS_EN)[+m.slice(5, 7) - 1];

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}
const dirOf = (s: string): "rtl" | "ltr" => (/[֐-׿؀-ۿ]/.test(s) ? "rtl" : "ltr");
/** Escape, and in a right-to-left email keep Latin runs (a name, Gadit) in their own order. */
function textHtml(s: string, rtl: boolean): string {
  const e = esc(s);
  return rtl ? e.replace(/[A-Za-z0-9][A-Za-z0-9']*(?:[ .&/][A-Za-z0-9']+)*/g, (m) => `<span dir="ltr">${m}</span>`) : e;
}
function link(lang: "he" | "en", path: string, content: string): string {
  const base = lang === "en" ? SITE : `${SITE}/${lang}`;
  const sep = path.includes("?") ? "&" : "?";
  return `${base}${path}${sep}utm_source=school-monthly&utm_medium=email&utm_campaign=school-monthly&utm_content=${content}`;
}
const fmt = (n: number, he: boolean) => n.toLocaleString(he ? "he-IL" : "en-US");
/** Hebrew "in <name>": a hyphen before a Latin or digit start (ב-Greenwarth). */
const heIn = (name: string) => (/^ה[֐-׿]/.test(name) ? `ב${name.slice(1)}` : /^[֐-׿]/.test(name) ? `ב${name}` : `ב-${name}`);

type Copy = {
  subject: (name: string, month: string, partial: boolean) => string;
  hello: string;
  intro: (name: string, month: string, partial: boolean) => string;
  oneLine: (month: string, partial: boolean) => string;
  tiles: [string, string, string];
  inClasses: (n: number) => string;
  compare: (prev: string) => string;
  firstMonth: (month: string) => string;
  nothingBefore: (prev: string) => string;
  row: (label: string, now: number, before: number, prev: string) => string;
  labels: { lookups: string; words: string; days: string; projected: string };
  top: string;
  noWords: string;
  byClass: string;
  classRow: (name: string, teacher: string, n: number) => string;
  inClass: string;
  projected: (words: number, sets: number) => string;
  fromSets: string;
  quizzes: (q: number, g: number) => string;
  noClass: string;
  idea: (month: string) => string;
  ideaUnit: (i: Idea) => string;
  ideaWords: string;
  ideaHow: string;
  ideaLink: string;
  ideaOwn: (words: string[]) => string;
  ideaOwnLink: string;
  cta: string;
  optOut: string;
};

const EN: Copy = {
  subject: (name, month, partial) => (partial ? `${name} on Gadit: ${month} so far` : `${name} on Gadit: your ${month} report`),
  hello: "Hi,",
  intro: (name, month, partial) => (partial ? `Here is ${month} so far at ${name} on Gadit.` : `Here is ${month} at ${name} on Gadit.`),
  oneLine: (month, partial) => (partial ? `${month} so far` : `${month} in one line`),
  tiles: ["lookups", "different words", "days of use"],
  inClasses: (n) => (n === 1 ? "In 1 class." : `In ${n} classes.`),
  compare: (prev) => `Compared with ${prev}`,
  firstMonth: (month) => `${month} was your first month on Gadit, so there is nothing to compare with yet.`,
  nothingBefore: (prev) => `There was no use in ${prev} to compare with.`,
  row: (label, now, before, prev) => {
    if (now === before) return `${label}: ${fmt(now, false)}, the same as ${prev}`;
    if (!before) return `${label}: ${fmt(now, false)} (none in ${prev})`;
    return `${label}: ${fmt(now, false)}, ${now > before ? "up" : "down"} from ${fmt(before, false)} in ${prev}`;
  },
  labels: { lookups: "Lookups", words: "Different words", days: "Days of use", projected: "Words projected in class" },
  top: "The 10 most looked-up words",
  noWords: "No words were looked up this month.",
  byClass: "By class",
  classRow: (name, teacher, n) => `${name || "A class"}${teacher ? ` (${teacher})` : ""}: ${fmt(n, false)} ${n === 1 ? "lookup" : "lookups"}`,
  inClass: "In class with Gadit",
  projected: (w, s) => `Projected on the board: ${w} ${w === 1 ? "word" : "words"} from ${s} word ${s === 1 ? "set" : "sets"}.`,
  fromSets: "The sets:",
  quizzes: (q, g) => [q ? `${q} class ${q === 1 ? "quiz" : "quizzes"}` : "", g ? `${g} class ${g === 1 ? "game" : "games"}` : ""].filter(Boolean).join(" and ") + ".",
  noClass: "No word sets were projected in class this month. Opening a set on the board takes one click, and every word comes with a picture, a definition and examples.",
  idea: (month) => `An idea for ${month}`,
  ideaUnit: (i) => `${[i.grade, i.subject].filter(Boolean).join(" ")}${i.term ? `, Term ${i.term}` : ""}: ${i.title}.`,
  ideaWords: "Key words:",
  ideaHow: "Project the words at the start of the lesson, and end with the class quiz.",
  ideaLink: "Open this word set",
  ideaOwn: (w) => `Make a word set of your own from this month's top words (${w.join(", ")}) and run the class quiz on it.`,
  ideaOwnLink: "Open the word sets",
  cta: "Open the school dashboard",
  optOut: "This report comes once a month, on the 1st.",
};

const HE: Copy = {
  subject: (name, month, partial) => (partial ? `${name} ב-Gadit: ${month} עד היום` : `${name} ב-Gadit: הסיכום של ${month}`),
  hello: "שלום,",
  intro: (name, month, partial) => (partial ? `הנה ${month} עד היום ${heIn(name)}, ב-Gadit.` : `הנה הסיכום של ${month} ${heIn(name)}, ב-Gadit.`),
  oneLine: (month, partial) => (partial ? `${month} עד היום` : `${month} במבט אחד`),
  tiles: ["חיפושי מילים", "מילים שונות", "ימי שימוש"],
  inClasses: (n) => (n === 1 ? "בכיתה אחת." : `ב-${n} כיתות.`),
  compare: (prev) => `לעומת ${prev}`,
  firstMonth: (month) => `${month} היה החודש הראשון שלכם ב-Gadit, אז עוד אין למה להשוות.`,
  nothingBefore: (prev) => `ב${prev} לא היה שימוש, אז אין למה להשוות.`,
  row: (label, now, before, prev) => {
    if (now === before) return `${label}: ${fmt(now, true)}, כמו ב${prev}`;
    if (!before) return `${label}: ${fmt(now, true)} (ב${prev}: אין)`;
    return `${label}: ${fmt(now, true)}, ${now > before ? "עלייה" : "ירידה"} מ-${fmt(before, true)} ב${prev}`;
  },
  labels: { lookups: "חיפושי מילים", words: "מילים שונות", days: "ימי שימוש", projected: "מילים שהוקרנו בכיתה" },
  top: "10 המילים שחיפשו הכי הרבה",
  noWords: "החודש לא חיפשו מילים.",
  byClass: "לפי כיתה",
  classRow: (name, teacher, n) => `${name || "כיתה"}${teacher ? ` (${teacher})` : ""}: ${n === 1 ? "חיפוש אחד" : `${fmt(n, true)} חיפושים`}`,
  inClass: "מה עשיתם עם Gadit בכיתה",
  projected: (w, s) => `הקרנתם על הלוח ${w === 1 ? "מילה אחת" : `${w} מילים`} ${s === 1 ? "מקבוצת מילים אחת" : `מ-${s} קבוצות מילים`}.`,
  fromSets: "הקבוצות:",
  quizzes: (q, g) => {
    const quiz = q === 1 ? "חידון כיתתי אחד" : `${q} חידונים כיתתיים`;
    const game = g === 1 ? "משחק כיתתי אחד" : `${g} משחקים כיתתיים`;
    if (q && g) return `${quiz} ו${g === 1 ? "" : "-"}${game}.`;
    return `${q ? quiz : game}.`;
  },
  noClass: "החודש לא הקרנתם קבוצות מילים בכיתה. פתיחת קבוצה על הלוח היא לחיצה אחת, ולכל מילה יש תמונה, הגדרה ודוגמאות.",
  idea: (month) => `רעיון ל${month}`,
  ideaUnit: (i) => `${[i.subject, i.grade].filter(Boolean).join(", ")}: ${i.title}.`,
  ideaWords: "מילות המפתח:",
  ideaHow: "הקרינו את המילים בתחילת השיעור, וסיימו בחידון לכיתה.",
  ideaLink: "לקבוצת המילים",
  ideaOwn: (w) => `צרו קבוצת מילים משלכם מהמילים המובילות של החודש (${w.join(", ")}), והריצו עליה חידון לכיתה.`,
  ideaOwnLink: "לקבוצות המילים",
  cta: "ללוח הבקרה של בית הספר",
  optOut: "הסיכום הזה מגיע פעם בחודש, ב-1 לחודש.",
};

/** Pure renderer (cron and admin preview). */
export function renderSchoolMonthReport(r: SchoolMonthReport, opts: { unsubscribeUrl: string }): { subject: string; html: string; text: string } {
  const he = r.lang === "he";
  const C = he ? HE : EN;
  const dir = he ? "rtl" : "ltr";
  const align = he ? "right" : "left";
  const cur = r.current;
  const prv = r.previous;
  const month = monthName(cur.month, he);
  const prevName = monthName(prv.month, he);
  const nextName = monthName(nextMonthKey(cur.month), he);
  const t = (s: string) => textHtml(s, he);

  const P = (html: string, extra = "") => `<p dir="${dir}" style="text-align:${align};font-size:15px;line-height:1.7;margin:0 0 12px;color:#374151;${extra}">${html}</p>`;
  const H = (s: string) => `<div dir="${dir}" style="text-align:${align};font-size:17px;line-height:1.4;font-weight:700;color:#111827;margin:26px 0 10px;">${t(s)}</div>`;
  const chip = (w: string, n?: number) =>
    `<span dir="${dirOf(w)}" style="display:inline-block;background:#FFFFFF;border:1px solid #D6E4E1;border-radius:999px;padding:4px 12px;margin:0 0 7px ${he ? "7px" : "0"};${he ? "" : "margin-right:7px;"}font-size:14px;color:#1C1917;">${esc(w)}${n && n > 1 ? ` <b style="color:#0E7490;">${n}</b>` : ""}</span>`;
  const card = (inner: string) => `<div dir="${dir}" style="text-align:${align};background:#F6FAF9;border:1px solid #E1EAE7;border-radius:12px;padding:16px 18px;margin:0 0 6px;">${inner}</div>`;

  const parts: string[] = [];
  parts.push(P(t(C.hello)), P(t(C.intro(r.name, month, r.partial))));

  // 1. The month in one line.
  const tile = (n: number, label: string) =>
    `<td width="33%" style="padding:12px 6px;text-align:center;vertical-align:top;"><div style="font-size:28px;font-weight:700;color:#0E7490;line-height:1.1;">${fmt(n, he)}</div><div style="font-size:13px;color:#6B7280;margin-top:4px;">${esc(label)}</div></td>`;
  parts.push(H(C.oneLine(month, r.partial)));
  parts.push(
    `<table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6FAF9;border:1px solid #E1EAE7;border-radius:12px;margin:0 0 8px;"><tr>${tile(cur.lookups, C.tiles[0])}${tile(cur.distinctWords, C.tiles[1])}${tile(cur.activeDays, C.tiles[2])}</tr></table>`,
  );
  if (cur.classes.length) parts.push(P(t(C.inClasses(cur.classes.length)), "font-size:14px;color:#6B7280;"));

  // 2. Compared with last month.
  parts.push(H(C.compare(prevName)));
  const prevEmpty = !prv.lookups && !prv.activeDays && !prv.projectedWords.length;
  if (prevEmpty) {
    parts.push(P(t(r.createdMonth && r.createdMonth >= cur.month ? C.firstMonth(month) : C.nothingBefore(prevName))));
  } else {
    const rows = [
      C.row(C.labels.lookups, cur.lookups, prv.lookups, prevName),
      C.row(C.labels.words, cur.distinctWords, prv.distinctWords, prevName),
      C.row(C.labels.days, cur.activeDays, prv.activeDays, prevName),
    ];
    if (cur.projectedWords.length || prv.projectedWords.length) rows.push(C.row(C.labels.projected, cur.projectedWords.length, prv.projectedWords.length, prevName));
    parts.push(`<ul dir="${dir}" style="margin:0 0 8px;padding-${align}:20px;text-align:${align};font-size:15px;line-height:1.7;color:#374151;">${rows.map((x) => `<li style="margin-bottom:4px;">${t(x)}</li>`).join("")}</ul>`);
  }

  // 3. Top 10 words.
  parts.push(H(C.top));
  parts.push(cur.topWords.length ? `<div dir="${dir}" style="text-align:${align};margin:0 0 4px;">${cur.topWords.map((w) => chip(w.word, w.count)).join("")}</div>` : P(t(C.noWords)));

  // 4. By class (only with more than one class).
  if (cur.classes.length > 1) {
    parts.push(H(C.byClass));
    parts.push(`<ul dir="${dir}" style="margin:0 0 8px;padding-${align}:20px;text-align:${align};font-size:15px;line-height:1.7;color:#374151;">${cur.classes.map((c) => `<li style="margin-bottom:4px;">${t(C.classRow(c.name, c.teacher, c.lookups))}</li>`).join("")}</ul>`);
  }

  // 5. The teacher in class (skipped for a school without class projection).
  if (r.classroomTips) parts.push(H(C.inClass));
  if (!r.classroomTips) {
    /* no "in class" section */
  } else if (cur.projectedWords.length || cur.quizzes || cur.games) {
    const inner: string[] = [];
    if (cur.projectedWords.length) {
      inner.push(`<div style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 8px;">${t(C.projected(cur.projectedWords.length, Math.max(1, cur.projectedSets.filter((x) => x.words).length)))}</div>`);
      const sets = cur.projectedSets.filter((x) => x.title).slice(0, 5);
      if (sets.length) inner.push(`<div style="font-size:14px;line-height:1.7;color:#6B7280;margin:0 0 8px;">${t(C.fromSets)} ${sets.map((x) => `<span dir="${dirOf(x.title)}">${esc(x.title)}</span>`).join(" · ")}</div>`);
    }
    if (cur.quizzes || cur.games) inner.push(`<div style="font-size:15px;line-height:1.7;color:#374151;">${t(C.quizzes(cur.quizzes, cur.games))}</div>`);
    parts.push(card(inner.join("")));
  } else {
    parts.push(P(t(C.noClass)));
  }

  // 6. One idea for next month.
  if (r.classroomTips) parts.push(H(C.idea(nextName)));
  const own = cur.topWords.slice(0, 5).map((w) => w.word);
  if (!r.classroomTips) {
    /* no class idea either */
  } else if (r.idea) {
    const i = r.idea;
    const inner = [
      `<div style="font-size:15px;line-height:1.7;color:#111827;font-weight:600;margin:0 0 8px;">${t(C.ideaUnit(i))}</div>`,
      i.words.length ? `<div style="font-size:14px;color:#6B7280;margin:0 0 6px;">${esc(C.ideaWords)}</div><div style="margin:0 0 6px;">${i.words.map((w) => chip(w)).join("")}</div>` : "",
      `<div style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 8px;">${t(C.ideaHow)}</div>`,
      `<div><a href="${link(r.lang, i.path, "idea")}" style="color:#0E7490;font-weight:700;text-decoration:underline;font-size:15px;">${esc(C.ideaLink)}</a></div>`,
    ];
    parts.push(card(inner.join("")));
  } else if (own.length) {
    parts.push(card(`<div style="font-size:15px;line-height:1.7;color:#374151;margin:0 0 8px;">${t(C.ideaOwn(own))}</div><div><a href="${link(r.lang, "/sets", "idea-own")}" style="color:#0E7490;font-weight:700;text-decoration:underline;font-size:15px;">${esc(C.ideaOwnLink)}</a></div>`));
  }

  parts.push(P(t(C.optOut), "font-size:13px;color:#9CA3AF;margin-top:18px;"));

  const html = renderEmailHtmlV2({
    he,
    lang: r.lang,
    bodyHtml: parts.join(""),
    ctaText: C.cta,
    ctaUrl: link(r.lang, "/schools/manage", "dashboard"),
    next: "",
    helpUrl: `${r.lang === "en" ? SITE : `${SITE}/${r.lang}`}/help`,
    unsubscribeUrl: opts.unsubscribeUrl,
  });
  const subject = C.subject(r.name, month, r.partial);

  const line = (m: MonthNumbers) =>
    `${m.month}: lookups ${m.lookups}, distinct words ${m.distinctWords}, active days ${m.activeDays}, classes ${m.classes.map((c) => `${c.name || c.id}=${c.lookups}`).join(" ") || "none"}, projected words ${m.projectedWords.length} from ${m.projectedSets.length} sets, quizzes ${m.quizzes}, games ${m.games}`;
  const text = [
    `Subject: ${subject}`,
    `School: ${r.name} (${r.schoolId}), curriculum ${r.curriculum || "none"}, levels ${r.levels.join("+") || "none"}, tz ${r.tz}, lang ${r.lang}${r.partial ? ", month still running" : ""}`,
    line(cur),
    `top words: ${cur.topWords.map((w) => `${w.word} ${w.count}`).join(", ") || "none"}`,
    cur.projectedSets.length ? `projected sets: ${cur.projectedSets.map((x) => `${x.title || x.setId} (${x.words})`).join("; ")}` : "projected sets: none",
    `previous ${line(prv)}`,
    r.idea ? `idea: ${r.idea.grade} ${r.idea.subject}${r.idea.term ? ` term ${r.idea.term}` : ""}: ${r.idea.title} [${r.idea.setId}] words ${r.idea.words.join(", ")} -> ${r.idea.path}` : own.length ? `idea: own set from top words (${own.join(", ")})` : "idea: none",
  ].join("\n");
  return { subject, html, text };
}

// ── Sending ────────────────────────────────────────────────────────────

/** Why a school would not get its report (switch and date aside); "" when it would. */
export function schoolMonthlySkipReason(r: Pick<SchoolMonthReport, "to" | "isDemo" | "internal" | "optedOut">): string {
  if (r.isDemo) return "demo";
  if (r.internal) return "internal";
  if (!r.to) return "no_recipient";
  if (r.optedOut) return "opted_out";
  return "";
}

/** Build and send one school's report for a month (scheduled: waits out
 *  Shabbat), then mark the ledger. A month with no use at all is marked and
 *  not sent. */
export async function sendSchoolMonthReport(
  db: Firestore,
  school: QueryDocumentSnapshot,
  month: string,
): Promise<{ ok: true; sent: boolean; reason?: string } | { ok: false; reason: string }> {
  const r = await schoolMonthReport(db, school.id, month);
  if (!r) return { ok: false, reason: "no_school" };
  const skip = schoolMonthlySkipReason(r);
  if (skip) return { ok: true, sent: false, reason: skip };
  const ledger = { monthlyReportSent: month, monthlyReportAt: FieldValue.serverTimestamp() };
  if (!r.current.lookups && !r.current.activeDays && !r.current.projectedWords.length) {
    await school.ref.set({ ...ledger, monthlyReportMessageId: null }, { merge: true });
    return { ok: true, sent: false, reason: "no_use" };
  }
  const built = renderSchoolMonthReport(r, { unsubscribeUrl: buildUnsubUrl(school.id) });
  const res = await sendDripEmail({ to: r.to!, subject: built.subject, html: built.html, scheduled: true });
  if (!res.ok) return { ok: false, reason: res.reason };
  await school.ref.set({ ...ledger, monthlyReportMessageId: res.id ?? null }, { merge: true });
  return { ok: true, sent: true };
}
