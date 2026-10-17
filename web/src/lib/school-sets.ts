import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { registerWordSet, type WordSet } from "@/lib/word-sets";
import {
  SCHOOL_SET_PREFIX, SCHOOL_SET_MAX_SETS, SCHOOL_SET_MAX_WORDS, SCHOOL_SET_TITLE_MAX,
  isSchoolSetId, cleanSetWords, setLangOf,
} from "@/lib/school-set-ids";

/**
 * A school's own word sets, server side (Gadi 2026-10-17). One document per
 * set in schoolSets/{id} (Admin SDK only; no client rule opens it):
 *   { schoolId, set: WordSet, defs: {}, createdBy, createdAt, updatedAt }
 * `set` has the same shape as a curriculum unit's, so getCurriculumSetDoc and
 * loadWordSet hand it to the projector, the set picture, the examples and the
 * class quiz unchanged. A custom set has no per-set definitions: the
 * projector falls back to the word's dictionary definition, as for any word
 * without a curated one.
 *
 * Only members of the school (users/{uid}.schoolId) read or change its sets;
 * every route that takes a set id checks it (schoolSetGate, via pilotGate).
 */

const COL = "schoolSets";

export type SchoolSetDoc = { set: WordSet; defs: Record<string, string>; schoolId: string; updatedAt?: string };
export type SchoolSetRow = WordSet & { updatedAt: string };

function readDoc(id: string, raw: Record<string, unknown> | undefined): SchoolSetDoc | null {
  const s = raw?.set as Partial<WordSet> | undefined;
  const schoolId = typeof raw?.schoolId === "string" ? raw.schoolId : "";
  if (!s || !schoolId) return null;
  const words = cleanSetWords(s.words);
  if (!words.length) return null;
  const set: WordSet = {
    id,
    subject: "",
    title: typeof s.title === "string" ? s.title : "",
    lang: typeof s.lang === "string" && s.lang ? s.lang : setLangOf(words),
    words,
  };
  return { set, defs: {}, schoolId, updatedAt: typeof raw?.updatedAt === "string" ? raw.updatedAt : "" };
}

/** One school set by id, registered so getWordSet / classroomDef see it.
 *  No access check here: the routes check the school (schoolSetGate). */
export async function getSchoolSetDoc(id: string): Promise<SchoolSetDoc | null> {
  if (!isSchoolSetId(id)) return null;
  const snap = await getAdminDb().collection(COL).doc(id).get();
  const doc = snap.exists ? readDoc(id, snap.data()) : null;
  if (doc) registerWordSet(doc.set, doc.defs);
  return doc;
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

/** The school's sets, newest first. */
export async function listSchoolSets(schoolId: string): Promise<SchoolSetRow[]> {
  const snap = await getAdminDb().collection(COL).where("schoolId", "==", schoolId).get();
  const rows: Array<{ row: SchoolSetRow; at: string }> = [];
  for (const d of snap.docs) {
    const doc = readDoc(d.id, d.data());
    const at = d.get("createdAt");
    if (doc) rows.push({ row: { ...doc.set, updatedAt: doc.updatedAt ?? "" }, at: typeof at === "string" ? at : "" });
  }
  return rows.sort((a, b) => b.at.localeCompare(a.at)).map((r) => r.row);
}

export class SchoolSetError extends Error {
  constructor(public code: "no_title" | "no_words" | "too_many_words" | "too_many_sets" | "not_found", public status = 400) {
    super(code);
  }
}

function checkWords(raw: unknown): string[] {
  const words = cleanSetWords(raw);
  if (!words.length) throw new SchoolSetError("no_words");
  if (words.length > SCHOOL_SET_MAX_WORDS) throw new SchoolSetError("too_many_words");
  return words;
}

export async function createSchoolSet(schoolId: string, uid: string, title: unknown, words: unknown): Promise<SchoolSetRow> {
  const t = cleanSetTitle(title);
  if (!t) throw new SchoolSetError("no_title");
  const list = checkWords(words);
  const db = getAdminDb();
  const count = (await db.collection(COL).where("schoolId", "==", schoolId).count().get()).data().count;
  if (count >= SCHOOL_SET_MAX_SETS) throw new SchoolSetError("too_many_sets", 409);
  const id = SCHOOL_SET_PREFIX + crypto.randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  const set: WordSet = { id, subject: "", title: t, lang: setLangOf(list), words: list };
  await db.collection(COL).doc(id).set({ schoolId, set, defs: {}, createdBy: uid, createdAt: now, updatedAt: now });
  registerWordSet(set, {});
  return { ...set, updatedAt: now };
}

/** Rename a set and/or replace its words (only within its own school). */
export async function updateSchoolSet(id: string, schoolId: string, patch: { title?: unknown; words?: unknown }): Promise<SchoolSetRow> {
  const ref = getAdminDb().collection(COL).doc(id);
  const cur = isSchoolSetId(id) ? readDoc(id, (await ref.get()).data()) : null;
  if (!cur || cur.schoolId !== schoolId) throw new SchoolSetError("not_found", 404);
  const title = patch.title === undefined ? cur.set.title : cleanSetTitle(patch.title);
  if (!title) throw new SchoolSetError("no_title");
  const words = patch.words === undefined ? cur.set.words : checkWords(patch.words);
  const now = new Date().toISOString();
  const set: WordSet = { id, subject: "", title, lang: setLangOf(words), words };
  await ref.set({ set, updatedAt: now }, { merge: true });
  registerWordSet(set, {});
  return { ...set, updatedAt: now };
}

export async function deleteSchoolSet(id: string, schoolId: string): Promise<void> {
  const ref = getAdminDb().collection(COL).doc(id);
  const snap = isSchoolSetId(id) ? await ref.get() : null;
  if (!snap?.exists || snap.get("schoolId") !== schoolId) throw new SchoolSetError("not_found", 404);
  await ref.delete();
}
