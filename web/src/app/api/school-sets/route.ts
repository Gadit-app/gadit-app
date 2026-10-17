import { NextRequest, NextResponse } from "next/server";
import { SCHOOL_SET_MAX_SETS, SCHOOL_SET_MAX_WORDS } from "@/lib/school-set-ids";
import {
  requestSchool, listSchoolSets, createSchoolSet, updateSchoolSet, deleteSchoolSet, SchoolSetError,
} from "@/lib/school-sets";

/**
 * A school's own word sets (Gadi 2026-10-17), for the "Our sets" section of
 * /sets. Bearer: a member of the school (users/{uid}.schoolId).
 *
 *   GET                              → { sets: WordSet[], maxWords, maxSets }  (newest first)
 *   POST   { title, words: string[] } → { set }   (409 too_many_sets at 100)
 *   PATCH  { id, title?, words? }     → { set }   rename and/or replace the words
 *   DELETE ?id=<id>                   → { ok }
 *
 * Words are trimmed and de-duplicated; 1 to 40 per set. The set opens on the
 * projector like any unit: /word/<first word>?present=1&set=<id>.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

async function school(req: NextRequest) {
  const who = await requestSchool(req);
  if (!who) return { error: NextResponse.json({ error: "login_required" }, { status: 401 }) };
  if (!who.schoolId) return { error: NextResponse.json({ error: "not_a_school" }, { status: 403 }) };
  return { who };
}

function fail(e: unknown) {
  if (e instanceof SchoolSetError) return NextResponse.json({ error: e.code, maxWords: SCHOOL_SET_MAX_WORDS, maxSets: SCHOOL_SET_MAX_SETS }, { status: e.status });
  console.error("[school-sets]", e);
  return NextResponse.json({ error: "internal_error" }, { status: 500 });
}

export async function GET(req: NextRequest) {
  const s = await school(req);
  if (s.error) return s.error;
  try {
    const sets = await listSchoolSets(s.who.schoolId);
    return NextResponse.json({ sets, maxWords: SCHOOL_SET_MAX_WORDS, maxSets: SCHOOL_SET_MAX_SETS }, { headers: NO_STORE });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  const s = await school(req);
  if (s.error) return s.error;
  const b = (await req.json().catch(() => ({}))) as { title?: unknown; words?: unknown };
  try {
    return NextResponse.json({ set: await createSchoolSet(s.who.schoolId, s.who.uid, b.title, b.words) }, { headers: NO_STORE });
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: NextRequest) {
  const s = await school(req);
  if (s.error) return s.error;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; title?: unknown; words?: unknown };
  try {
    const set = await updateSchoolSet(typeof b.id === "string" ? b.id : "", s.who.schoolId, { title: b.title, words: b.words });
    return NextResponse.json({ set }, { headers: NO_STORE });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: NextRequest) {
  const s = await school(req);
  if (s.error) return s.error;
  try {
    await deleteSchoolSet((req.nextUrl.searchParams.get("id") ?? "").trim(), s.who.schoolId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
