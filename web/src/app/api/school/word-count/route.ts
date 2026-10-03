import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { normalizeClassCode } from "@/lib/school";
import { CLASS_THRESHOLDS, nextThreshold, normalizeClassWord, rankIndexFor, type ClassScope } from "@/lib/class-milestones";

/**
 * Class dictionary counter (Gadi 2026-10-03): DIFFERENT words a class has
 * looked up, with milestone celebrations.
 *
 * Two places a class looks words up:
 *   - a kid on /c/<CODE> (cls in the body): counts for that classroom AND
 *     for the whole school;
 *   - the school's own signed-in account on the class computer or the
 *     teacher's projector (Bearer token, users/{uid}.schoolId): counts for
 *     the school. (Greenwarth's kids search this way.)
 *
 * Each word counts once per counter (dictWords/{hash of the normalized
 * word}). The request whose new word lands exactly on a threshold gets
 * `milestone`, so only the screen that crossed it celebrates. No personal
 * data: just the word.
 *
 * POST { word, cls? }  → { count, next, scope, milestone? }
 * GET  ?cls=CODE (or Bearer) → { count, next, scope }
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Target = { ref: DocumentReference; scope: ClassScope };

async function resolveTargets(req: NextRequest, cls: string): Promise<{ display: Target; extra: Target[] } | null> {
  const db = getAdminDb();
  const code = cls ? normalizeClassCode(cls) : null;
  if (code) {
    const snap = await db.collection("classroomCodes").doc(code).get();
    if (!snap.exists) return null;
    const { schoolId, classroomId } = snap.data() as { schoolId: string; classroomId: string };
    const schoolRef = db.collection("schools").doc(schoolId);
    return {
      display: { ref: schoolRef.collection("classrooms").doc(classroomId), scope: "class" },
      extra: [{ ref: schoolRef, scope: "school" }],
    };
  }
  const authHeader = req.headers.get("authorization") || "";
  const idToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (!idToken) return null;
  let uid: string;
  try { uid = (await getAdminAuth().verifyIdToken(idToken)).uid; } catch { return null; }
  const user = await db.collection("users").doc(uid).get();
  const schoolId = user.get("schoolId");
  if (typeof schoolId !== "string" || !schoolId) return null;
  const schoolRef = db.collection("schools").doc(schoolId);
  // A school with a single classroom is, for the kids, "our class".
  const classes = await schoolRef.collection("classrooms").count().get();
  return { display: { ref: schoolRef, scope: classes.data().count <= 1 ? "class" : "school" }, extra: [] };
}

async function addWord(t: Target, wordId: string, word: string): Promise<{ count: number; isNew: boolean }> {
  const db = getAdminDb();
  return db.runTransaction(async (tx) => {
    const wRef = t.ref.collection("dictWords").doc(wordId);
    const [wSnap, cSnap] = await Promise.all([tx.get(wRef), tx.get(t.ref)]);
    const cur = Number(cSnap.get("uniqueWordCount") ?? 0);
    if (wSnap.exists) return { count: cur, isNew: false };
    tx.set(wRef, { word, firstAt: new Date().toISOString() });
    tx.set(t.ref, { uniqueWordCount: FieldValue.increment(1) }, { merge: true });
    return { count: cur + 1, isNew: true };
  });
}

export async function POST(req: NextRequest) {
  let body: { word?: string; cls?: string } = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_body" }, { status: 400 }); }
  const word = normalizeClassWord(String(body.word ?? "").slice(0, 120));
  if (!word) return NextResponse.json({ error: "no_word" }, { status: 400 });
  const targets = await resolveTargets(req, String(body.cls ?? ""));
  if (!targets) return NextResponse.json({ error: "not_school" }, { status: 404 });

  const wordId = crypto.createHash("sha1").update(word).digest("hex");
  const [main] = await Promise.all([
    addWord(targets.display, wordId, word),
    ...targets.extra.map((t) => addWord(t, wordId, word)),
  ]);
  const hit = main.isNew && CLASS_THRESHOLDS.includes(main.count);
  return NextResponse.json({
    count: main.count,
    next: nextThreshold(main.count),
    scope: targets.display.scope,
    ...(hit ? { milestone: { count: main.count, rankIndex: rankIndexFor(main.count) } } : {}),
  });
}

export async function GET(req: NextRequest) {
  const targets = await resolveTargets(req, req.nextUrl.searchParams.get("cls") ?? "");
  if (!targets) return NextResponse.json({ error: "not_school" }, { status: 404 });
  const snap = await targets.display.ref.get();
  const count = Number(snap.get("uniqueWordCount") ?? 0);
  return NextResponse.json({ count, next: nextThreshold(count), scope: targets.display.scope });
}
