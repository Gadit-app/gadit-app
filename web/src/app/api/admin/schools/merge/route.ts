import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type CollectionReference, type Firestore, type WriteBatch } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/schools/merge  { sourceId, targetId }
 *
 * Consolidates two school records for the same real school (e.g. two Gadit
 * accounts at greenwarth.co.za) into one. Every classroom under SOURCE, with
 * its full searches log and class dictionary (dictWords), is copied into
 * TARGET; the classroomCodes that route to those classrooms are repointed at
 * TARGET (so existing kid codes keep working, no re-share needed). The
 * school-level class dictionary (dictWords + uniqueWordCount), the projector
 * log (projections, counts added on the same day|kind|set|word) and the
 * dashboard checklist (a step done in either school stays done) move too.
 * Then SOURCE is recursively deleted and its owner user is detached.
 *
 * Pick TARGET = the account you want to keep (the one holding the active
 * subscription). Billing is untouched either way. Admin-gated, irreversible.
 */

export const maxDuration = 60;

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);
const BATCH = 400;

async function requireAdmin(req: NextRequest): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return { ok: false, response: NextResponse.json({ error: "login_required" }, { status: 401 }) };
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    if (!ADMIN_EMAILS.has(decoded.email ?? "")) return { ok: false, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
    return { ok: true };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "invalid_token" }, { status: 401 }) };
  }
}

/** Runs write ops in batches of BATCH (Firestore's cap is 500 per batch). */
async function writeChunked(db: Firestore, ops: Array<(b: WriteBatch) => void>): Promise<void> {
  for (let i = 0; i < ops.length; i += BATCH) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + BATCH)) op(batch);
    await batch.commit();
  }
}

/** Copies a dictWords collection into another, keeping the target's entry
 *  when both have the word. Returns { added: words new to the target,
 *  srcSize: words in the source }. */
async function mergeDictWords(db: Firestore, src: CollectionReference, tgt: CollectionReference): Promise<{ added: number; srcSize: number }> {
  const [srcSnap, tgtSnap] = await Promise.all([src.get(), tgt.select().get()]);
  const have = new Set(tgtSnap.docs.map((d) => d.id));
  const fresh = srcSnap.docs.filter((d) => !have.has(d.id));
  await writeChunked(db, fresh.map((d) => (b) => { b.set(tgt.doc(d.id), d.data()); }));
  return { added: fresh.length, srcSize: srcSnap.size };
}

function earliest(a: unknown, b: unknown): string | undefined {
  return [a, b].filter((v): v is string => typeof v === "string" && !!v).sort()[0];
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  let body: { sourceId?: string; targetId?: string } = {};
  try { body = (await req.json()) as { sourceId?: string; targetId?: string }; } catch { /* handled below */ }
  const sourceId = (body.sourceId ?? "").trim();
  const targetId = (body.targetId ?? "").trim();
  if (!sourceId || !targetId) return NextResponse.json({ error: "missing_ids" }, { status: 400 });
  if (sourceId === targetId) return NextResponse.json({ error: "same_school" }, { status: 400 });

  const db = getAdminDb();
  const srcRef = db.collection("schools").doc(sourceId);
  const tgtRef = db.collection("schools").doc(targetId);
  const [srcSnap, tgtSnap] = await Promise.all([srcRef.get(), tgtRef.get()]);
  if (!srcSnap.exists) return NextResponse.json({ error: "source_not_found" }, { status: 404 });
  if (!tgtSnap.exists) return NextResponse.json({ error: "target_not_found" }, { status: 404 });

  const srcClassrooms = await srcRef.collection("classrooms").get();
  let movedClassrooms = 0;
  let movedSearches = 0;
  let movedClassWords = 0;
  let repointedCodes = 0;

  for (const cls of srcClassrooms.docs) {
    const tgtClsRef = tgtRef.collection("classrooms").doc(cls.id);
    const tgtClsSnap = await tgtClsRef.get();
    // Copy the classroom doc itself (name, code, colorIndex, searchCount).
    // Its uniqueWordCount is set below from the merged dictionary.
    const clsData = { ...(cls.data() as Record<string, unknown>) };
    const srcClsCount = Number(clsData.uniqueWordCount ?? 0);
    delete clsData.uniqueWordCount;
    await tgtClsRef.set(clsData, { merge: true });
    movedClassrooms++;

    // Copy its searches in batches of 400.
    const searchesSnap = await cls.ref.collection("searches").get();
    await writeChunked(db, searchesSnap.docs.map((s) => (b) => { b.set(tgtClsRef.collection("searches").doc(s.id), s.data()); }));
    movedSearches += searchesSnap.size;

    // Its class dictionary: words new to the target classroom are added and
    // counted; an older class with a count but no word docs keeps its count.
    const dict = await mergeDictWords(db, cls.ref.collection("dictWords"), tgtClsRef.collection("dictWords"));
    movedClassWords += dict.added;
    const base = tgtClsSnap.exists ? Number(tgtClsSnap.get("uniqueWordCount") ?? 0) : 0;
    const clsCount = base + (dict.srcSize > 0 ? dict.added : srcClsCount);
    if (clsCount > 0) await tgtClsRef.set({ uniqueWordCount: clsCount }, { merge: true });

    // Repoint the classroom's code doc(s) at the target school.
    const code = (cls.data() as { code?: string }).code;
    if (code) {
      const codeRef = db.collection("classroomCodes").doc(code);
      const codeSnap = await codeRef.get();
      if (codeSnap.exists) { await codeRef.set({ schoolId: targetId }, { merge: true }); repointedCodes++; }
    }
  }

  // Any classroomCodes still pointing at the source (defensive) → target.
  const strayCodes = await db.collection("classroomCodes").where("schoolId", "==", sourceId).get();
  for (const c of strayCodes.docs) { await c.ref.set({ schoolId: targetId }, { merge: true }); repointedCodes++; }

  // School-level class dictionary. Words new to the target are copied and
  // added to its uniqueWordCount; a source with a count but no word docs
  // (older data) adds its count as is.
  const srcData = srcSnap.data() as { uniqueWordCount?: number; checklist?: Record<string, unknown> };
  const tgtData = tgtSnap.data() as { uniqueWordCount?: number; checklist?: Record<string, unknown> };
  const schoolDict = await mergeDictWords(db, srcRef.collection("dictWords"), tgtRef.collection("dictWords"));
  const addedUniqueWords = schoolDict.srcSize > 0 ? schoolDict.added : Number(srcData.uniqueWordCount ?? 0);

  // Projector log: the same doc id means the same day|kind|set|word, so the
  // counts add up; otherwise the source doc is copied as is.
  const [srcProj, tgtProj] = await Promise.all([
    srcRef.collection("projections").get(),
    tgtRef.collection("projections").get(),
  ]);
  const tgtProjById = new Map(tgtProj.docs.map((d) => [d.id, d.data()]));
  await writeChunked(db, srcProj.docs.map((d) => (b) => {
    const ref = tgtRef.collection("projections").doc(d.id);
    const data = d.data();
    const cur = tgtProjById.get(d.id);
    if (!cur) { b.set(ref, data); return; }
    const lastAt = [cur.lastAt, data.lastAt].filter((v): v is string => typeof v === "string").sort().pop();
    b.set(ref, { count: FieldValue.increment(Number(data.count ?? 0)), ...(lastAt ? { lastAt } : {}) }, { merge: true });
  }));

  // Checklist: a step done in either school stays done (earliest time kept).
  const steps = new Set([...Object.keys(srcData.checklist ?? {}), ...Object.keys(tgtData.checklist ?? {})]);
  const checklist: Record<string, string> = {};
  for (const k of steps) {
    const v = earliest(srcData.checklist?.[k], tgtData.checklist?.[k]);
    if (v) checklist[k] = v;
  }
  const patch: Record<string, unknown> = {};
  if (addedUniqueWords > 0) patch.uniqueWordCount = FieldValue.increment(addedUniqueWords);
  if (Object.keys(checklist).length) patch.checklist = checklist;
  if (Object.keys(patch).length) await tgtRef.set(patch, { merge: true });

  // Delete the source school entirely and detach its owner user.
  await db.recursiveDelete(srcRef);
  await db.collection("users").doc(sourceId).set({ schoolId: FieldValue.delete() }, { merge: true }).catch(() => {});

  return NextResponse.json({
    ok: true,
    movedClassrooms,
    movedSearches,
    repointedCodes,
    movedClassWords,
    movedSchoolWords: schoolDict.added,
    addedUniqueWords,
    movedProjections: srcProj.size,
  });
}
