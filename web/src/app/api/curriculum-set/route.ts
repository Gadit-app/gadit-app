import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requestVerifiedSchool } from "@/lib/school-identity";
import { getCurriculumSetDoc } from "@/lib/curriculum-sets";
import { catalogOfTopic, topicLevel } from "@/lib/curriculum-catalog";
import { cleanLevels, cleanCurriculum, curriculumAllows } from "@/lib/school-levels";
import { isPilotTopicId } from "@/lib/pilot-topics";
import { pilotAllows } from "@/lib/pilot-access";
import { isSchoolSetId } from "@/lib/school-set-ids";
import { getSchoolSetDoc, completeSchoolSetDefs, requestSchool } from "@/lib/school-sets";

/**
 * GET /api/curriculum-set?id=cur-xxxxxxxxxx   (Bearer: a school account)
 * → { set: WordSet, defs: {word: definition} }
 * The key-word set of one curriculum topic, cached in Firestore
 * curriculumSets/{id}. Open only to a school whose levels include the
 * topic's level (Gadi 2026-10-04: an elementary school gets elementary).
 */
export const runtime = "nodejs";
export const maxDuration = 45;

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  // A school's own set (2026-10-17): only a member of that school, from its
  // stored words (never generated). Other schools get a 404.
  if (isSchoolSetId(id)) {
    const who = await requestSchool(req);
    if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
    if (!who.schoolId) return NextResponse.json({ error: "schools_only" }, { status: 403 });
    const found = await getSchoolSetDoc(id);
    if (!found || found.schoolId !== who.schoolId) return NextResponse.json({ error: "not_found" }, { status: 404 });
    // Definitions a failed save left out are written now (at most once in 10 minutes).
    const own = await completeSchoolSetDefs(found);
    return NextResponse.json({ set: own.set, defs: own.defs }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const catalog = catalogOfTopic(id);
  const level = topicLevel(id);
  if (!catalog || !level) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // The account's VERIFIED school (lib/school-identity.ts), never users/{uid}.schoolId alone.
  const who = await requestVerifiedSchool(req);
  if (!who) return NextResponse.json({ error: "login_required" }, { status: 401 });
  const schoolId = who.schoolId;
  if (!schoolId) return NextResponse.json({ error: "schools_only" }, { status: 403 });
  // A pilot unit (Gemara phase B): only the schools on its allow-list, and only
  // from its imported document (never generated). Others see no such unit.
  if (isPilotTopicId(id)) {
    if (!pilotAllows(id, schoolId)) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const doc = await getCurriculumSetDoc(id);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc, { headers: { "Cache-Control": "private, max-age=60" } });
  }
  const sd = (await getAdminDb().collection("schools").doc(schoolId).get()).data() ?? {};
  const levels = cleanLevels(sd.levels);
  if (!curriculumAllows(cleanCurriculum(sd.curriculum, levels), catalog)) return NextResponse.json({ error: "curriculum_not_open" }, { status: 403 });
  if (!levels.includes(level)) return NextResponse.json({ error: "level_not_open", levels }, { status: 403 });

  try {
    const doc = await getCurriculumSetDoc(id, true);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 80) }, { status: 502 });
  }
}
