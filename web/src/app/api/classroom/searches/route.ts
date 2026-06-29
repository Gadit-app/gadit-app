import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeClassCode } from "@/lib/school";

/**
 * GET /api/classroom/searches?code=XYZ123
 *
 * Public, no auth — same Kahoot-style trust model as the rest of the
 * /c/<CODE> surface. The classroom code is the routing key; anyone
 * holding it can see what the class has looked up. That matches the
 * teacher's expectations and lets the kid view show its own class
 * notebook without dragging in Firebase auth.
 *
 * Returns the most recent 200 searches (the dashboard limit), each:
 *   { word, language, studentName?, createdAt }
 *
 * The client paginates/filters by student name locally because the
 * list is small enough to ship in one round trip and a filter that
 * touches Firestore would force more reads with no UX upside.
 */

const MAX_SEARCHES = 200;

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

  const snap = await db
    .collection("schools")
    .doc(codeData.schoolId)
    .collection("classrooms")
    .doc(codeData.classroomId)
    .collection("searches")
    .orderBy("createdAt", "desc")
    .limit(MAX_SEARCHES)
    .get();

  type SearchDoc = {
    word: string;
    language?: string;
    studentName?: string;
    createdAt?: string;
  };

  const searches = snap.docs.map((d) => {
    const data = d.data() as SearchDoc;
    return {
      word: data.word ?? "",
      language: data.language ?? "",
      studentName: data.studentName ?? "",
      createdAt: data.createdAt ?? "",
    };
  });

  return NextResponse.json({ searches });
}
