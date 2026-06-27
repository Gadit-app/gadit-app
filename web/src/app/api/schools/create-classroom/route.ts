import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { generateClassCode } from "@/lib/school";

/**
 * POST /api/schools/create-classroom
 *
 * Owner-only endpoint. Creates a new classroom under the caller's school
 * with a globally-unique 6-character code. The code is also written to a
 * top-level `classroomCodes/{code}` lookup doc so `/c/<CODE>` (kid view)
 * can resolve a code to a school+classroom without scanning every school.
 *
 * Why server-side and not client-side:
 *   1. The code must be UNIQUE across ALL schools — a client-side write
 *      race could create two classrooms with the same code in different
 *      schools, and the lookup would resolve to whichever wrote last.
 *      Server-side we retry on collision until we find a free code.
 *   2. The lookup doc + classroom doc must be created in one atomic
 *      transaction. Client SDK rules can't enforce "you may write the
 *      lookup doc ONLY IF you also wrote the classroom doc" cleanly.
 *
 * Body: { name?: string }
 * Response: { id, code }
 */

export async function POST(req: NextRequest) {
  // Auth
  const authHeader = req.headers.get("Authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  const userId = decoded.uid;

  const db = getAdminDb();

  // Verify the caller actually owns a Schools subscription. The webhook
  // writes users/{uid}.schoolId === uid on Schools checkout, so we just
  // check that field. Anyone else (including a Family owner or a Deep
  // individual) gets a 403.
  const userSnap = await db.collection("users").doc(userId).get();
  const userData = userSnap.data();
  if (!userData?.schoolId || userData.schoolId !== userId) {
    return NextResponse.json({ error: "schools_subscription_required" }, { status: 403 });
  }
  const schoolSnap = await db.collection("schools").doc(userId).get();
  if (!schoolSnap.exists) {
    // The school doc should exist if schoolId is set, but the webhook
    // might still be in flight on the very first request after checkout.
    return NextResponse.json({ error: "school_not_ready" }, { status: 503 });
  }

  // Parse body
  let body: { name?: string } = {};
  try {
    body = (await req.json()) as { name?: string };
  } catch {
    // empty body is fine — name is optional
  }
  const name = (body.name ?? "").trim().slice(0, 60);

  // Generate a unique code. Try up to 8 times; the alphabet has 30^6 =
  // 729M combinations, so collisions are astronomically rare even at
  // tens of millions of classrooms. The retry loop is purely defensive.
  let code: string | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generateClassCode();
    const taken = await db.collection("classroomCodes").doc(candidate).get();
    if (!taken.exists) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    return NextResponse.json({ error: "code_generation_failed" }, { status: 500 });
  }

  // Atomic write: classroom doc + lookup doc together.
  const classroomRef = db.collection("schools").doc(userId).collection("classrooms").doc();
  const codeRef = db.collection("classroomCodes").doc(code);

  await db.runTransaction(async (tx) => {
    tx.set(classroomRef, {
      code,
      name,
      grade: null,
      teacherName: null,
      searchCount: 0,
      createdAt: new Date().toISOString(),
    });
    tx.set(codeRef, {
      schoolId: userId,
      classroomId: classroomRef.id,
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ id: classroomRef.id, code });
}
