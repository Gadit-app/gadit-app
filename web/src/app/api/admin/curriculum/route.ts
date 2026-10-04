import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getCurriculumSetDoc, saveCurriculumSet, regenerateCurriculumSet } from "@/lib/curriculum-sets";

/**
 * Admin API behind /admin/curriculum (Gadi 2026-10-04): edit the key words
 * and in-lesson definitions of any curriculum unit.
 *
 * GET  ?secret=&id=cur-…        → { set, defs, editedAt }   (generates if missing)
 * GET  ?secret=&ready=1         → { ids: [...] } units that already have words
 * POST ?secret=  { id, rows:[{w,d}] }        → save
 * POST ?secret=  { id, action: "regen" }     → generate again from scratch
 */
export const runtime = "nodejs";
export const maxDuration = 60;

function auth(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  if ((req.nextUrl.searchParams.get("secret") ?? "") !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const unauth = auth(req);
  if (unauth) return unauth;
  if (req.nextUrl.searchParams.get("ready") === "1") {
    const snap = await getAdminDb().collection("curriculumSets").select("editedAt").get();
    return NextResponse.json({
      ids: snap.docs.map((d) => d.id),
      edited: snap.docs.filter((d) => d.get("editedAt")).map((d) => d.id),
    });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  try {
    const doc = await getCurriculumSetDoc(id, true);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const snap = await getAdminDb().collection("curriculumSets").doc(id).get();
    return NextResponse.json({ ...doc, editedAt: snap.get("editedAt") ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 120) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = auth(req);
  if (unauth) return unauth;
  const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string; rows?: Array<{ w: string; d: string }> };
  const id = body.id ?? "";
  try {
    const doc = body.action === "regen" ? await regenerateCurriculumSet(id) : await saveCurriculumSet(id, body.rows ?? []);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 120) }, { status: 400 });
  }
}
