import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeClassCode } from "@/lib/school";

/**
 * POST /api/classroom/log-search
 *
 * Public endpoint, no auth. A kid in /c/<CODE> searches a word; the kid
 * view fires this in the background to record what the classroom is
 * looking up. The teacher view at /classroom/<id> reads back these logs
 * to surface "what did my class look up today."
 *
 * NO PERSONAL DATA is stored. We log:
 *   - the word
 *   - the UI language
 *   - the timestamp
 * That's it. No userId, no IP, no device fingerprint, no name. The
 * Schools SKU's entire privacy story rests on never knowing which child
 * searched which word — only that "this classroom" did, in aggregate.
 *
 * Body: { code: string, word: string, lang?: string }
 * Response: { ok: true }  (or 4xx on validation failure)
 */

export async function POST(req: NextRequest) {
  let body: { code?: string; word?: string; lang?: string } = {};
  try {
    body = (await req.json()) as { code?: string; word?: string; lang?: string };
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const code = normalizeClassCode(body.code ?? "");
  const word = (body.word ?? "").trim().slice(0, 120);
  const lang = (body.lang ?? "en").slice(0, 5);
  if (!code) {
    return NextResponse.json({ error: "bad_code" }, { status: 400 });
  }
  if (!word) {
    return NextResponse.json({ error: "no_word" }, { status: 400 });
  }

  const db = getAdminDb();
  const codeSnap = await db.collection("classroomCodes").doc(code).get();
  if (!codeSnap.exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { schoolId, classroomId } = codeSnap.data() as {
    schoolId: string;
    classroomId: string;
  };

  const classroomRef = db
    .collection("schools")
    .doc(schoolId)
    .collection("classrooms")
    .doc(classroomId);

  // Two writes: append the search log + bump the running counter on
  // the classroom doc so /schools can show "37 words" without an
  // aggregation query. FieldValue.increment is atomic so concurrent
  // searches from multiple devices in the same classroom don't race.
  await Promise.all([
    classroomRef.collection("searches").add({
      word,
      lang,
      at: new Date().toISOString(),
    }),
    classroomRef.set({ searchCount: FieldValue.increment(1) }, { merge: true }),
  ]);

  return NextResponse.json({ ok: true });
}
