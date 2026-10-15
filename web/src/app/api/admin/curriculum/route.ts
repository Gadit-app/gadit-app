import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getCurriculumSetDoc, saveCurriculumSet, regenerateCurriculumSet } from "@/lib/curriculum-sets";
import { adminBudgetExceeded } from "@/lib/ai-budget";

/**
 * Admin API behind /admin/curriculum (Gadi 2026-10-04): edit the key words
 * and in-lesson definitions of any curriculum unit.
 *
 * GET  ?secret=&id=cur-…        → { set, defs, editedAt }   (generates if missing)
 * GET  ?secret=&ready=1         → { ids: [...] } units that already have words
 * POST ?secret=  { id, rows:[{w,d}] }        → save (a locked unit needs force:true)
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
    // Opening a unit that was never generated writes it (gpt-5.4), an admin
    // run under the admin daily cap.
    const doc = (await getCurriculumSetDoc(id)) ?? ((await adminBudgetExceeded()) ? null : await getCurriculumSetDoc(id, true, true));
    if (!doc) return NextResponse.json({ error: (await adminBudgetExceeded()) ? "admin_budget" : "not_found" }, { status: 404 });
    const snap = await getAdminDb().collection("curriculumSets").doc(id).get();
    return NextResponse.json({ ...doc, editedAt: snap.get("editedAt") ?? null });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 120) }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const unauth = auth(req);
  if (unauth) return unauth;
  const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string; rows?: Array<{ w: string; d: string }>; force?: boolean };
  const id = body.id ?? "";
  try {
    if (body.action === "regen" && (await adminBudgetExceeded())) return NextResponse.json({ error: "admin_budget" }, { status: 429 });
    const doc = body.action === "regen" ? await regenerateCurriculumSet(id) : await saveCurriculumSet(id, body.rows ?? [], { force: body.force === true });
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e) {
    // Approved content (Gemara phase A): a locked unit, or one whose meanings are managed by script.
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "locked" || msg === "items_managed") return NextResponse.json({ error: msg }, { status: 409 });
    return NextResponse.json({ error: String(e).slice(0, 120) }, { status: 400 });
  }
}
