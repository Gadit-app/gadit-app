/**
 * Coach access (Gadi 2026-08-22): a parent grants a children's coach revocable
 * access to a SPECIFIC child's profile, so the coach can enter that profile
 * during a lesson and add words to the notebook. Full switch-in (the coach
 * signs into the child's profile like a parent switching profiles), gated by
 * a coachGrant and revocable by the parent at any time.
 *
 * Grants live in a top-level `coachGrants` collection so a coach can be found
 * across families by their email. Access is by verified email: the parent
 * grants to an email, and whoever signs in with that email sees the student.
 */
import { isInternalEmail, isPayingStatus } from "@/lib/internal-accounts";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export type CoachGrant = {
  id: string;
  coachEmail: string;   // lowercased, trimmed
  familyId: string;
  memberId: string;
  memberName: string;
  grantedBy: string;    // owner uid (= familyId)
  createdAt: string;
  revoked: boolean;
  revokedAt?: string;
};

/** Verify a coach's Firebase ID token → their uid + verified lowercased email. */
export async function verifyCoach(idToken: string | null): Promise<{ uid: string; email: string } | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = (decoded.email || "").toLowerCase().trim();
    if (!email) return null;
    return { uid: decoded.uid, email };
  } catch {
    return null;
  }
}

/** Verify the caller OWNS a family (owner uid === family id). Only the owner
 *  manages coach grants. Returns the familyId, or null. */
export async function resolveOwner(idToken: string | null): Promise<{ familyId: string } | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const famSnap = await db.collection("families").doc(decoded.uid).get();
    if (!famSnap.exists) return null; // caller is not a family owner
    return { familyId: decoded.uid };
  } catch {
    return null;
  }
}

/**
 * A coach must be a paying subscriber (Gadi 2026-10-12: "no coach uses
 * Gadit for free to coach students"): their own Individual or Family plan
 * (active, past_due or trialing), a parent inside a paying family, a gifted
 * (comp) account, or one of ours. Coaches tell parents to buy Gadit and
 * parents bring their coaches in, so it markets both ways.
 */
export async function coachHasPlan(uid: string, email: string): Promise<boolean> {
  if (isInternalEmail(email)) return true;
  const db = getAdminDb();
  const d = (await db.collection("users").doc(uid).get()).data() as Record<string, unknown> | undefined;
  if (!d) return false;
  if (d.comp === true) return true;
  const live = (s: unknown) => isPayingStatus(s) || s === "trialing";
  if ((d.plan === "clear" || d.plan === "deep") && live(d.subscriptionStatus)) return true;
  if (typeof d.familyId === "string" && d.familyId && d.familyRole !== "kid" && d.familyId !== uid) {
    const o = (await db.collection("users").doc(d.familyId).get()).data() as Record<string, unknown> | undefined;
    if (o && (o.comp === true || live(o.subscriptionStatus))) return true;
  }
  return false;
}

export function bearer(req: { headers: { get(name: string): string | null } }): string | null {
  const h = req.headers.get("authorization") || "";
  return h.toLowerCase().startsWith("bearer ") ? h.slice(7).trim() : null;
}
