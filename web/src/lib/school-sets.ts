import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import type { DocumentReference, WriteBatch } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { registerWordSet, type WordSet } from "@/lib/word-sets";
import { hardCapReached } from "@/lib/ai-budget";
import { writeSetDefs } from "@/lib/school-set-defs";
import {
  SCHOOL_SET_PREFIX, SCHOOL_SET_MAX_SETS, SCHOOL_SET_MAX_WORDS, SCHOOL_SET_TITLE_MAX,
  isSchoolSetId, cleanSetWords, setLangOf, cleanSetLevel, cleanSetLang, schoolSetGrade, type SchoolSetLevel,
} from "@/lib/school-set-ids";

/**
 * A school's own word sets, server side (Gadi 2026-10-17). One document per
 * set in schoolSets/{id} (Admin SDK only; no client rule opens it):
 *   { schoolId, set: WordSet (with level), defs: {word: definition},
 *     defsTriedAt?, createdBy, createdAt, updatedAt }
 * `set` has the same shape as a curriculum unit's, so getCurriculumSetDoc and
 * loadWordSet hand it to the projector, the set picture, the examples and the
 * class quiz unchanged.
 *
 * Definitions: every word gets its own definition in the sense of the set
 * (lib/school-set-defs.ts), written when the set is saved, only for words that
 * have none (a level change rewrites them all), each checked by a second
 * opinion before it is kept (a definition that fails twice is left out for
 * a later try). When that fails the set is
 * saved anyway, and the next open of the set (its list on /sets, or the
 * projector loading it) tries again, at most once in 10 minutes. The
 * dictionary definition is only the last resort.
 *
 * The level ("elementary" / "secondary") sets the picture style
 * (classroomStyle), the definitions' wording, the examples and the class quiz
 * (through set.grade, derived from the level).
 *
 * Only members of the school (users/{uid}.schoolId) read or change its sets;
 * every route that takes a set id checks it (schoolSetGate, via pilotGate).
 */

const COL = "schoolSets";
const RETRY_MS = 10 * 60 * 1000;

export type SchoolSetDoc = { set: WordSet; defs: Record<string, string>; schoolId: string; updatedAt?: string; defsTriedAt?: string };
export type SchoolSetRow = WordSet & { updatedAt: string; defs: Record<string, string> };

function readDoc(id: string, raw: Record<string, unknown> | undefined): SchoolSetDoc | null {
  const s = raw?.set as Partial<WordSet> | undefined;
  const schoolId = typeof raw?.schoolId === "string" ? raw.schoolId : "";
  if (!s || !schoolId) return null;
  const words = cleanSetWords(s.words);
  if (!words.length) return null;
  const lang = typeof s.lang === "string" && s.lang ? s.lang : setLangOf(words);
  const level = cleanSetLevel(s.level);
  const set: WordSet = { id, subject: "", title: typeof s.title === "string" ? s.title : "", grade: schoolSetGrade(level, lang), lang, words, level };
  const stored = (raw?.defs && typeof raw.defs === "object" ? raw.defs : {}) as Record<string, unknown>;
  const defs: Record<string, string> = {};
  for (const w of words) if (typeof stored[w] === "string" && stored[w]) defs[w] = stored[w] as string;
  return {
    set, defs, schoolId,
    updatedAt: typeof raw?.updatedAt === "string" ? raw.updatedAt : "",
    defsTriedAt: typeof raw?.defsTriedAt === "string" ? raw.defsTriedAt : undefined,
  };
}

const missingDefs = (d: SchoolSetDoc) => d.set.words.filter((w) => !d.defs[w]);

/** Write the missing definitions of a set (one call). Never throws: on any
 *  failure the set keeps what it has, and defsTriedAt holds off the next try. */
async function fillDefs(doc: SchoolSetDoc, budgetMs = 85_000): Promise<SchoolSetDoc> {
  const missing = missingDefs(doc);
  if (!missing.length) return doc;
  const ref = getAdminDb().collection(COL).doc(doc.set.id);
  const now = new Date().toISOString();
  try {
    // Marked first, so two requests opening the same set do not both write.
    await ref.set({ defsTriedAt: now }, { merge: true });
    if (await hardCapReached()) return doc;
    // Written, checked by a second opinion, the flagged ones rewritten once;
    // whatever still fails is left out for a later try.
    const out = await writeSetDefs(missing, doc.set.title, cleanSetLevel(doc.set.level), doc.set.lang, budgetMs);
    if (out.dropped.length) console.warn("[school-sets] definitions held back after review:", out.dropped.length);
    const defs = { ...doc.defs, ...out.defs };
    // Field paths, so a word with a dot or a slash is still one key.
    await ref.update({ defs, defsAt: new Date().toISOString() });
    return { ...doc, defs, defsTriedAt: now };
  } catch (e) {
    console.warn("[school-sets] definitions not written:", String(e).slice(0, 120));
    return { ...doc, defsTriedAt: now };
  }
}
const mayRetry = (d: SchoolSetDoc) => missingDefs(d).length > 0 && (!d.defsTriedAt || Date.now() - Date.parse(d.defsTriedAt) > RETRY_MS);

/** One school set by id, registered so getWordSet / classroomDef see it.
 *  No access check here: the routes check the school (schoolSetGate). */
export async function getSchoolSetDoc(id: string): Promise<SchoolSetDoc | null> {
  if (!isSchoolSetId(id)) return null;
  const snap = await getAdminDb().collection(COL).doc(id).get();
  const doc = snap.exists ? readDoc(id, snap.data()) : null;
  if (doc) registerWordSet(doc.set, doc.defs);
  return doc;
}

/** The projector's load of a set its school opened: definitions a failed
 *  save left out are written now (at most once in 10 minutes). */
export async function completeSchoolSetDefs(doc: SchoolSetDoc): Promise<SchoolSetDoc> {
  if (!mayRetry(doc)) return doc;
  // The projector waits for this: a short budget (the route allows 45 seconds).
  const out = await fillDefs(doc, 35_000);
  registerWordSet(out.set, out.defs);
  return out;
}

/** The signed-in user and their school ("" when not a school), or null. */
export async function requestSchool(req: Request): Promise<{ uid: string; schoolId: string } | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try {
    const { uid } = await getAdminAuth().verifyIdToken(token);
    const schoolId = (await getAdminDb().collection("users").doc(uid).get()).get("schoolId");
    return { uid, schoolId: typeof schoolId === "string" ? schoolId : "" };
  } catch {
    return null;
  }
}

/**
 * The gate of every route that takes a set id, for a school's own set: a
 * signed-in member of that school (401 without a login, else 404, as if the
 * set did not exist). Any other set id passes untouched (null).
 */
export async function schoolSetGate(req: Request, setId: string | null | undefined): Promise<NextResponse | null> {
  if (!isSchoolSetId(setId)) return null;
  const who = await requestSchool(req);
  if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const snap = await getAdminDb().collection(COL).doc(setId as string).get();
  if (!who.schoolId || !snap.exists || snap.get("schoolId") !== who.schoolId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return null;
}

/** A set's title as stored: one line, no long dashes, at most 60 characters. */
export function cleanSetTitle(t: unknown): string {
  return String(t ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+/g, " ").trim().slice(0, SCHOOL_SET_TITLE_MAX);
}

const rowOf = (d: SchoolSetDoc): SchoolSetRow => ({ ...d.set, updatedAt: d.updatedAt ?? "", defs: d.defs });

/** The school's sets, newest first, with their definitions. One set whose
 *  definitions failed earlier gets them now (a short budget). */
export async function listSchoolSets(schoolId: string): Promise<SchoolSetRow[]> {
  const snap = await getAdminDb().collection(COL).where("schoolId", "==", schoolId).get();
  const rows: Array<{ doc: SchoolSetDoc; at: string }> = [];
  for (const d of snap.docs) {
    const doc = readDoc(d.id, d.data());
    const at = d.get("createdAt");
    if (doc) rows.push({ doc, at: typeof at === "string" ? at : "" });
  }
  rows.sort((a, b) => b.at.localeCompare(a.at));
  let retries = 0;
  for (const r of rows) {
    if (retries < 1 && mayRetry(r.doc)) {
      retries++;
      r.doc = await fillDefs(r.doc, 40_000);
    }
    registerWordSet(r.doc.set, r.doc.defs);
  }
  return rows.map((r) => rowOf(r.doc));
}

/** The level a new set starts on, from the school's levels. */
export async function schoolLevels(schoolId: string): Promise<string[]> {
  const v = (await getAdminDb().collection("schools").doc(schoolId).get()).get("levels");
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export class SchoolSetError extends Error {
  code: "no_title" | "no_words" | "too_many_words" | "too_many_sets" | "not_found";
  status: number;
  constructor(code: SchoolSetError["code"], status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function checkWords(raw: unknown): string[] {
  const words = cleanSetWords(raw);
  if (!words.length) throw new SchoolSetError("no_words");
  if (words.length > SCHOOL_SET_MAX_WORDS) throw new SchoolSetError("too_many_words");
  return words;
}

export async function createSchoolSet(schoolId: string, uid: string, title: unknown, words: unknown, level: unknown, lang?: unknown): Promise<SchoolSetRow> {
  const t = cleanSetTitle(title);
  if (!t) throw new SchoolSetError("no_title");
  const list = checkWords(words);
  const db = getAdminDb();
  const count = (await db.collection(COL).where("schoolId", "==", schoolId).count().get()).data().count;
  if (count >= SCHOOL_SET_MAX_SETS) throw new SchoolSetError("too_many_sets", 409);
  const id = SCHOOL_SET_PREFIX + crypto.randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  const lv: SchoolSetLevel = cleanSetLevel(level);
  // The language the teacher chose, else the one the words' script points to.
  const set: WordSet = { id, subject: "", title: t, lang: cleanSetLang(lang, list), words: list, level: lv };
  await db.collection(COL).doc(id).set({ schoolId, set, defs: {}, createdBy: uid, createdAt: now, updatedAt: now });
  // The definitions are written now; a failure leaves them for the next open.
  const doc = await fillDefs({ set: { ...set, grade: schoolSetGrade(lv, set.lang) }, defs: {}, schoolId, updatedAt: now });
  registerWordSet(doc.set, doc.defs);
  return rowOf(doc);
}

/** Rename a set, replace its words, change its level or its language (only
 *  within its own school). Definitions of unchanged words are kept; a new
 *  level or language rewrites them all. */
export async function updateSchoolSet(id: string, schoolId: string, patch: { title?: unknown; words?: unknown; level?: unknown; lang?: unknown }): Promise<SchoolSetRow> {
  const ref = getAdminDb().collection(COL).doc(id);
  const cur = isSchoolSetId(id) ? readDoc(id, (await ref.get()).data()) : null;
  if (!cur || cur.schoolId !== schoolId) throw new SchoolSetError("not_found", 404);
  const title = patch.title === undefined ? cur.set.title : cleanSetTitle(patch.title);
  if (!title) throw new SchoolSetError("no_title");
  const words = patch.words === undefined ? cur.set.words : checkWords(patch.words);
  const level = patch.level === undefined ? cleanSetLevel(cur.set.level) : cleanSetLevel(patch.level);
  const lang = patch.lang === undefined ? cur.set.lang : cleanSetLang(patch.lang, words);
  const keep = level === cleanSetLevel(cur.set.level) && lang === cur.set.lang;
  const defs: Record<string, string> = {};
  if (keep) for (const w of words) if (cur.defs[w]) defs[w] = cur.defs[w];
  const now = new Date().toISOString();
  const set: WordSet = { id, subject: "", title, lang, words, level };
  // `defs` is written whole (not merged), so a removed word's definition goes with it.
  await ref.update({ set, defs, updatedAt: now, defsTriedAt: null });
  const doc = await fillDefs({ set: { ...set, grade: schoolSetGrade(level, set.lang) }, defs, schoolId, updatedAt: now });
  registerWordSet(doc.set, doc.defs);
  return rowOf(doc);
}

export async function deleteSchoolSet(id: string, schoolId: string): Promise<void> {
  const ref = getAdminDb().collection(COL).doc(id);
  const snap = isSchoolSetId(id) ? await ref.get() : null;
  if (!snap?.exists || snap.get("schoolId") !== schoolId) throw new SchoolSetError("not_found", 404);
  await ref.delete();
}

/** Writes in batches of 400 (Firestore's cap is 500 per batch). */
async function inBatches(refs: DocumentReference[], op: (b: WriteBatch, r: DocumentReference) => void): Promise<void> {
  const db = getAdminDb();
  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    for (const r of refs.slice(i, i + 400)) op(batch, r);
    await batch.commit();
  }
}

/** A school removed from /admin/schools: its own sets go with it (only
 *  that school's). Idempotent: a second run finds nothing. */
export async function deleteSchoolSetsOf(schoolId: string): Promise<number> {
  if (!schoolId) return 0;
  const snap = await getAdminDb().collection(COL).where("schoolId", "==", schoolId).select().get();
  await inBatches(snap.docs.map((d) => d.ref), (b, r) => b.delete(r));
  return snap.size;
}

/** Two school records merged (/api/admin/schools/merge): the source's sets
 *  move to the target. Ids stay the same, so projector links keep working.
 *  Idempotent: a second run finds nothing to move. The target may end up
 *  above the 100-set limit, which only stops new sets. */
export async function moveSchoolSets(sourceId: string, targetId: string): Promise<number> {
  if (!sourceId || !targetId || sourceId === targetId) return 0;
  const snap = await getAdminDb().collection(COL).where("schoolId", "==", sourceId).select().get();
  const now = new Date().toISOString();
  await inBatches(snap.docs.map((d) => d.ref), (b, r) => b.update(r, { schoolId: targetId, movedFrom: sourceId, updatedAt: now }));
  return snap.size;
}
