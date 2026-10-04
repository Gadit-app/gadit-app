import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { getCurriculumSetDoc } from "@/lib/curriculum-sets";
import { curTopic } from "@/lib/curriculum-catalog";
import { cleanLevels } from "@/lib/school-levels";

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
  const topic = curTopic(id);
  if (!topic) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const h = req.headers.get("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return NextResponse.json({ error: "login_required" }, { status: 401 });
  let schoolId = "";
  try {
    const { uid } = await getAdminAuth().verifyIdToken(token);
    schoolId = ((await getAdminDb().collection("users").doc(uid).get()).data()?.schoolId as string) || "";
  } catch {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  if (!schoolId) return NextResponse.json({ error: "schools_only" }, { status: 403 });
  const levels = cleanLevels((await getAdminDb().collection("schools").doc(schoolId).get()).data()?.levels);
  if (!levels.includes(topic.l)) return NextResponse.json({ error: "level_not_open", levels }, { status: 403 });

  try {
    const doc = await getCurriculumSetDoc(id, true);
    if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(doc, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (e) {
    return NextResponse.json({ error: String(e).slice(0, 80) }, { status: 502 });
  }
}
