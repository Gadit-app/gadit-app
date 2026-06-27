import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeClassCode } from "@/lib/school";

/**
 * GET /api/classroom/lookup?code=XYZ123
 *
 * Public endpoint, no auth. A kid landing on /c/<CODE> calls this to
 * resolve the code into a school + classroom + display info (school
 * name + logo) so the kid view can brand itself appropriately.
 *
 * Why public: kids don't have accounts. The whole point of the Schools
 * SKU is that a kid types a word on the classroom computer and never
 * logs in. Their identifier is the class code, which is treated like a
 * Kahoot room code — not secret, not sensitive, just a routing key.
 *
 * Response:
 *   { schoolId, classroomId, schoolName, schoolLogoUrl, classroomName }
 *   404 if the code doesn't exist
 *   400 if the code is malformed
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("code") ?? "";
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ error: "bad_code" }, { status: 400 });
  }

  const db = getAdminDb();
  const codeSnap = await db.collection("classroomCodes").doc(code).get();
  if (!codeSnap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const codeData = codeSnap.data() as { schoolId: string; classroomId: string };

  const [schoolSnap, classroomSnap] = await Promise.all([
    db.collection("schools").doc(codeData.schoolId).get(),
    db
      .collection("schools")
      .doc(codeData.schoolId)
      .collection("classrooms")
      .doc(codeData.classroomId)
      .get(),
  ]);

  if (!schoolSnap.exists || !classroomSnap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const school = schoolSnap.data() as { name?: string; logoUrl?: string | null };
  const classroom = classroomSnap.data() as { name?: string };

  return NextResponse.json({
    schoolId: codeData.schoolId,
    classroomId: codeData.classroomId,
    schoolName: school.name ?? "",
    schoolLogoUrl: school.logoUrl ?? null,
    classroomName: classroom.name ?? "",
  });
}
