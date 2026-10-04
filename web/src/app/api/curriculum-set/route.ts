import { NextRequest, NextResponse } from "next/server";
import { getCurriculumSetDoc } from "@/lib/curriculum-sets";

/**
 * GET /api/curriculum-set?id=cur-xxxxxxxxxx
 * → { set: WordSet, defs: {word: definition} }
 * The key-word set of one curriculum topic, generated once on first open
 * and cached in Firestore curriculumSets/{id}. Only catalog ids are valid.
 */
export const runtime = "nodejs";
export const maxDuration = 45;

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  try {
    const doc = await getCurriculumSetDoc(id, true);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 80) }, { status: 502 });
  }
}
