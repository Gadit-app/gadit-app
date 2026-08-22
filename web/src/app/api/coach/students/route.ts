/**
 * Coach-side: the students this coach can access.
 *   GET → { students: [{ grantId, familyId, memberId, memberName, avatarPhotoUrl, avatarId, colorIndex }] }
 * Auth: Firebase ID token; matched to grants by the caller's verified email.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyCoach, bearer } from "@/lib/coach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const coach = await verifyCoach(bearer(req));
  if (!coach) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getAdminDb();
  const snap = await db
    .collection("coachGrants")
    .where("coachEmail", "==", coach.email)
    .where("revoked", "==", false)
    .get();

  const students = await Promise.all(
    snap.docs.map(async (d) => {
      const g = d.data() as { familyId: string; memberId: string; memberName: string };
      let avatarPhotoUrl = "", avatarId = "", colorIndex = 0, name = g.memberName || "";
      try {
        const mSnap = await db.collection("families").doc(g.familyId).collection("members").doc(g.memberId).get();
        if (mSnap.exists) {
          const m = mSnap.data() as { name?: string; avatarPhotoUrl?: string; avatarId?: string; colorIndex?: number };
          name = m.name || name;
          avatarPhotoUrl = m.avatarPhotoUrl || "";
          avatarId = m.avatarId || "";
          colorIndex = m.colorIndex ?? 0;
        }
      } catch { /* member read best-effort */ }
      return { grantId: d.id, familyId: g.familyId, memberId: g.memberId, memberName: name, avatarPhotoUrl, avatarId, colorIndex };
    }),
  );
  students.sort((a, b) => a.memberName.localeCompare(b.memberName));
  return NextResponse.json({ students });
}
