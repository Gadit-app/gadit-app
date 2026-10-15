import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { WORD_SETS, type WordSet } from "@/lib/word-sets";
import { loadWordSet } from "@/lib/curriculum-sets";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { classroomStyle } from "@/lib/classroom-image";

/**
 * Admin: bust the cached CLASSROOM images for a word set (or every set), so
 * they regenerate in the current house style. Only the projector's own
 * namespace is touched, imageCache/img_cls2_<style>_<lang>_<hash> (written by
 * lib/classroom-image.ts), for the set's style and language. Users' own word
 * pictures and Kids Mode pictures (other key prefixes) are never deleted.
 * After running this, walk the set in present mode (or run warm-set) and each
 * word draws a fresh picture (then caches).
 *
 * USAGE: GET /api/admin/rewarm-set?secret=$ADMIN_SECRET&set=<setId|all>
 * A curriculum set id (cur-*) works too.
 */
export const maxDuration = 60;

const BATCH = 400;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const setId = req.nextUrl.searchParams.get("set") ?? "all";
  // A pilot unit holds approved, imported content only; its pictures are never wiped here.
  if (isPilotTopicId(setId)) return NextResponse.json({ error: "pilot_managed" }, { status: 403 });
  let targetSets: WordSet[];
  if (setId === "all") targetSets = WORD_SETS;
  else {
    const one = await loadWordSet(setId);
    targetSets = one ? [one] : [];
  }
  if (targetSets.length === 0) {
    return NextResponse.json({ error: "set_not_found", setId }, { status: 404 });
  }

  // word -> the classroom key prefixes it may live under (style + language).
  const prefixes = new Map<string, Set<string>>();
  for (const s of targetSets) {
    const p = `img_cls2_${classroomStyle(s)}_${s.lang}_`;
    for (const w of s.words) {
      if (!prefixes.has(w)) prefixes.set(w, new Set());
      prefixes.get(w)!.add(p);
    }
  }

  const db = getAdminDb();
  let deletedImages = 0;
  const perWord: Record<string, number> = {};
  let batch = db.batch();
  let n = 0;

  for (const [w, pre] of prefixes) {
    const snap = await db.collection("imageCache").where("word", "==", w).get();
    // A locked (approved) picture (Gemara phase A, contentLocked) is never deleted here.
    const hits = snap.docs.filter((d) => [...pre].some((p) => d.id.startsWith(p)) && d.get("contentLocked") !== true);
    perWord[w] = hits.length;
    for (const d of hits) {
      batch.delete(d.ref);
      n++;
      deletedImages++;
      if (n >= BATCH) { await batch.commit(); batch = db.batch(); n = 0; }
    }
  }
  if (n > 0) await batch.commit();

  return NextResponse.json({
    ok: true,
    set: setId,
    sets: targetSets.length,
    words: prefixes.size,
    deletedImages,
    perWord,
    next: "Open the set in present mode (or run warm-set) to draw fresh images; they cache on first view.",
  });
}
