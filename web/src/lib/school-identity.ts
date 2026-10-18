import "server-only";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/**
 * The school a signed-in account belongs to, checked on the server
 * (2026-10-18). users/{uid}.schoolId alone is not proof: until the
 * firestore.rules change of the same day, any browser could write its own
 * users doc, so anyone could put another school's id there and be served as
 * that school (its Gemara units, its own sets, its projector log and class
 * dictionary, its levels).
 *
 * An account belongs to school S only when users/{uid}.schoolId is S AND:
 *  - S is the account's own uid: the school's owner. A school's id is its
 *    owner's uid (the Schools checkout writes schoolId = uid, and only that
 *    uid can sign in as it, admin "Enter dashboard" included). A user can only
 *    ever name their OWN uid this way, never another school.
 *  - or a server-only record schoolMembers/{uid} says S, and schools/{S}
 *    exists. That collection is closed to every browser (no rule opens it)
 *    and only the Admin SDK writes it. No flow writes it today: it is where a
 *    second account of a school (a teacher login) goes, added by Gadi.
 * Anything else: "" (no school). Routes treat "" as "not a school", exactly
 * as before for an account without the field.
 */
export async function verifiedSchoolId(uid: string, userSchoolId?: unknown): Promise<string> {
  if (!uid) return "";
  const db = getAdminDb();
  const sid = userSchoolId !== undefined ? userSchoolId : (await db.collection("users").doc(uid).get()).get("schoolId");
  if (typeof sid !== "string" || !sid) return "";
  if (sid === uid) return sid;
  const [member, school] = await Promise.all([
    db.collection("schoolMembers").doc(uid).get(),
    db.collection("schools").doc(sid).get(),
  ]);
  return member.exists && member.get("schoolId") === sid && school.exists ? sid : "";
}

/** The signed-in user (Bearer token) and their verified school ("" when
 *  none), or null without a valid token. */
export async function requestVerifiedSchool(req: Request): Promise<{ uid: string; schoolId: string; impersonating: boolean } | null> {
  const h = req.headers.get("Authorization") || "";
  const token = h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : "";
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, schoolId: await verifiedSchoolId(decoded.uid), impersonating: decoded.adminImpersonation === true };
  } catch {
    return null;
  }
}
