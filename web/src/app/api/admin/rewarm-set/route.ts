import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { WORD_SETS, getWordSet } from "@/lib/word-sets";

/**
 * Admin: bust the cached images for a word set (or every set), so they
 * regenerate with the improved image pipeline (English visual brief). The
 * imageCache doc stores `word`, so we delete every cached image for each
 * word in the set regardless of meaning / language / kids-mode. After
 * running this, walk the set once in present mode and each word
 * regenerates a fresh, on-topic picture (then caches).
 *
 * USAGE: GET /api/admin/rewarm-set?secret=$ADMIN_SECRET&set=<setId|all>
 */
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if (secret !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const setId = req.nextUrl.searchParams.get("set") ?? "all";
  const targetSets =
    setId === "all"
      ? WORD_SETS
      : (getWordSet(setId) ? [getWordSet(setId)!] : []);
  if (targetSets.length === 0) {
    return NextResponse.json({ error: "set_not_found", setId }, { status: 404 });
  }

  const words = Array.from(new Set(targetSets.flatMap((s) => s.words)));
  const db = getAdminDb();
  let deletedImages = 0;
  const perWord: Record<string, number> = {};

  for (const w of words) {
    const snap = await db.collection("imageCache").where("word", "==", w).get();
    perWord[w] = snap.size;
    if (snap.empty) continue;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deletedImages += snap.size;
  }

  return NextResponse.json({
    ok: true,
    set: setId,
    sets: targetSets.length,
    words: words.length,
    deletedImages,
    perWord,
    next: "Open the set in present mode to regenerate fresh images (they cache on first view).",
  });
}
