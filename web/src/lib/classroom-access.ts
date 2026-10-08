import { getAdminDb } from "@/lib/firebase-admin";
import { DEFAULT_SCHOOL_HOURS, isClassroomInSession, normalizeClassCode, studentCodesOff, type ActiveHours } from "@/lib/school";

/**
 * A student's class code, checked on the server (Gadi 2026-10-05). Students
 * have no accounts, so before this every in-class lookup was "anonymous":
 * 2 new words a day per IP, and a whole school sits behind one IP, so the
 * class hit the sign-up wall after two words. A valid code of a school whose
 * owner account is active now unlocks the lookup like the school's own plan.
 * `inSession` says whether it is inside the school's active hours right now.
 * Memoized per server instance for a few minutes (codes change rarely).
 */
export type ClassroomAccess = { code: string; schoolId: string; classroomId: string; inSession: boolean };

type Entry = { schoolId: string; classroomId: string; activeHours?: ActiveHours } | null;
const memo = new Map<string, { at: number; v: Entry }>();
const TTL_MS = 5 * 60_000;

export async function classroomAccess(raw: unknown): Promise<ClassroomAccess | null> {
  if (typeof raw !== "string" || !raw) return null;
  const code = normalizeClassCode(raw);
  if (!code) return null;
  let hit = memo.get(code);
  if (!hit || Date.now() - hit.at > TTL_MS) {
    let v: Entry = null;
    try {
      const db = getAdminDb();
      const c = await db.collection("classroomCodes").doc(code).get();
      if (c.exists) {
        const { schoolId, classroomId } = c.data() as { schoolId: string; classroomId: string };
        const [school, owner] = await Promise.all([
          db.collection("schools").doc(schoolId).get(),
          db.collection("users").doc(schoolId).get(),
        ]);
        const o = (owner.data() ?? {}) as { plan?: string; schoolId?: string; subscriptionStatus?: string };
        const active = o.plan === "deep" && o.schoolId === schoolId && o.subscriptionStatus !== "canceled";
        // Israeli schools are teacher-only: their codes unlock nothing.
        const curriculum = (school.data() as { curriculum?: string } | undefined)?.curriculum;
        if (school.exists && active && !studentCodesOff(curriculum)) {
          v = { schoolId, classroomId, activeHours: (school.data() as { activeHours?: ActiveHours }).activeHours };
        }
      }
    } catch (e) {
      console.error("[classroom-access]", e);
      return null;
    }
    hit = { at: Date.now(), v };
    memo.set(code, hit);
  }
  if (!hit.v) return null;
  return {
    code,
    schoolId: hit.v.schoolId,
    classroomId: hit.v.classroomId,
    inSession: isClassroomInSession(new Date(), hit.v.activeHours ?? DEFAULT_SCHOOL_HOURS),
  };
}
