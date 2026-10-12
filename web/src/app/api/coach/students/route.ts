/**
 * Coach-side: the students this coach can access.
 *   GET → { students: [{ grantId, familyId, memberId, memberName, avatarPhotoUrl, avatarId, colorIndex }] }
 * Auth: Firebase ID token; matched to grants by the caller's verified email.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyCoach, bearer, coachHasPlan, familyIsPaying } from "@/lib/coach";
import { isParentRole, type MemberRole } from "@/lib/family";

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

  const paying = new Map<string, Promise<boolean>>();
  const rows = await Promise.all(
    snap.docs.map(async (d) => {
      const g = d.data() as { familyId: string; memberId: string; memberName: string };
      let avatarPhotoUrl = "", avatarId = "", colorIndex = 0, name = g.memberName || "", parent = false;
      try {
        const mSnap = await db.collection("families").doc(g.familyId).collection("members").doc(g.memberId).get();
        if (mSnap.exists) {
          const m = mSnap.data() as { name?: string; avatarPhotoUrl?: string; avatarId?: string; colorIndex?: number; role?: MemberRole };
          name = m.name || name;
          parent = !!m.role && isParentRole(m.role);
          avatarPhotoUrl = m.avatarPhotoUrl || "";
          avatarId = m.avatarId || "";
          colorIndex = m.colorIndex ?? 0;
        }
      } catch { /* member read best-effort */ }
      if (!paying.has(g.familyId)) paying.set(g.familyId, familyIsPaying(g.familyId));
      const inactive = !(await paying.get(g.familyId));
      return parent ? null : { grantId: d.id, familyId: g.familyId, memberId: g.memberId, memberName: name, avatarPhotoUrl, avatarId, colorIndex, inactive };
    }),
  );
  // Children only (a coach never enters a parent's profile).
  const students = rows.filter((r): r is NonNullable<typeof r> => r !== null);
  students.sort((a, b) => a.memberName.localeCompare(b.memberName));
  // The list shows, but entering a profile needs a paid plan.
  const needsPlan = students.length > 0 && !(await coachHasPlan(coach.uid, coach.email));
  return NextResponse.json({ students, needsPlan });
}
