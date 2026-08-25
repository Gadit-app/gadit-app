import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/schools/merge  { sourceId, targetId }
 *
 * Consolidates two school records for the same real school (e.g. two Gadit
 * accounts at greenwarth.co.za) into one. Every classroom under SOURCE, with
 * its full searches log, is copied into TARGET; the classroomCodes that route
 * to those classrooms are repointed at TARGET (so existing kid codes keep
 * working, no re-share needed); then SOURCE is recursively deleted and its
 * owner user is detached.
 *
 * Pick TARGET = the account you want to keep (the one holding the active
 * subscription). Billing is untouched either way. Admin-gated, irreversible.
 */

export const maxDuration = 60;

const ADMIN_EMAILS = new Set(["gadibenlavi@gmail.com"]);

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
  let repointedCodes = 0;

  for (const cls of srcClassrooms.docs) {
    const tgtClsRef = tgtRef.collection("classrooms").doc(cls.id);
    // Copy the classroom doc itself (name, code, colorIndex, searchCount).
    await tgtClsRef.set(cls.data(), { merge: true });
    movedClassrooms++;

    // Copy its searches in batches (Firestore batch cap is 500).
    const searchesSnap = await cls.ref.collection("searches").get();
    let batch = db.batch();
    let n = 0;
    for (const s of searchesSnap.docs) {
      batch.set(tgtClsRef.collection("searches").doc(s.id), s.data());
      n++;
      movedSearches++;
      if (n >= 400) { await batch.commit(); batch = db.batch(); n = 0; }
    }
    if (n > 0) await batch.commit();

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

  // Delete the source school entirely and detach its owner user.
  await db.recursiveDelete(srcRef);
  await db.collection("users").doc(sourceId).set({ schoolId: FieldValue.delete() }, { merge: true }).catch(() => {});

  return NextResponse.json({ ok: true, movedClassrooms, movedSearches, repointedCodes });
}
