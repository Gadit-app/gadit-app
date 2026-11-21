import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | null = null;

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0];
    return adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env var is missing. Generate a service account key in Firebase Console → Project Settings → Service Accounts, and paste the full JSON as this env var in Vercel."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  }

  adminApp = initializeApp({
    credential: cert(parsed),
    projectId: parsed.project_id,
    storageBucket: `${parsed.project_id}.firebasestorage.app`,
  });
  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

// ── Coach sessions end when the parent revokes the grant ────────────────
// A coach inside a child's profile holds a token for the CHILD's uid, with the
// claims `coach: true` and `grantId`. Revoking the grant used to stop only a
// NEW entry (/api/coach/enter): a coach who was already inside stayed inside
// until they signed out (found 2026-11-21). Signing the uid out is not an
// option, it is the child's own account. So every token check asks whether the
// grant behind a coach token is still live. The answer is remembered for a few
// seconds, so a coaching session costs one extra read now and then, and a
// revoke takes effect within that time. Ordinary tokens are not touched.
const COACH_LIVE_TTL_MS = 15_000;
const coachLive = new Map<string, { ok: boolean; at: number }>();

// A decoded token's custom claims: coach, grantId, coachEmail, familyId, memberId.
type CoachClaims = Record<string, unknown>;

/** True for an ordinary token. For a coach token: true only while its grant
 *  exists, is not revoked and still names this coach, family and child. A
 *  coach token from before 2026-11-21 has no grantId and is treated as ended:
 *  the coach enters again from /coach with one tap. */
export async function coachSessionLive(claims: CoachClaims): Promise<boolean> {
  if (claims.coach !== true) return true;
  const grantId = typeof claims.grantId === "string" ? claims.grantId : "";
  if (!grantId) return false;
  const hit = coachLive.get(grantId);
  if (hit && Date.now() - hit.at < COACH_LIVE_TTL_MS) return hit.ok;
  const snap = await getAdminDb().collection("coachGrants").doc(grantId).get();
  const g = snap.data() as { revoked?: boolean; coachEmail?: string; familyId?: string; memberId?: string } | undefined;
  const ok = !!g
    && g.revoked !== true
    && g.coachEmail === claims.coachEmail
    && g.familyId === claims.familyId
    && g.memberId === claims.memberId;
  if (coachLive.size > 500) coachLive.clear();
  coachLive.set(grantId, { ok, at: Date.now() });
  return ok;
}

/** Drop the remembered answer for a grant (called on revoke). */
export function forgetCoachSession(grantId: string) {
  coachLive.delete(grantId);
}

/** The error a token check throws for a coach whose access was revoked. */
export const COACH_SESSION_ENDED = "coach_session_ended";

let guardedAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (guardedAuth) return guardedAuth;
  const auth = getAuth(getAdminApp());
  // Every route verifies tokens through this object, so the coach check sits
  // here once instead of in each of the routes.
  guardedAuth = new Proxy(auth, {
    get(target, prop) {
      if (prop === "verifyIdToken") {
        return async (idToken: string, checkRevoked?: boolean) => {
          const decoded = await target.verifyIdToken(idToken, checkRevoked);
          if (!(await coachSessionLive(decoded))) throw new Error(COACH_SESSION_ENDED);
          return decoded;
        };
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
  return guardedAuth;
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}

export function getDefaultBucket() {
  // Explicit bucket name ensures Storage works even if the app was initialized
  // in a previous call without storageBucket set (e.g. hot reload).
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) throw new Error("FIREBASE_SERVICE_ACCOUNT not set");
  const projectId = JSON.parse(sa).project_id;
  return getAdminStorage().bucket(`${projectId}.firebasestorage.app`);
}

export type UserPlan = "basic" | "clear" | "deep";

export async function verifyUserAndGetPlan(idToken: string | undefined | null): Promise<{
  userId: string;
  plan: UserPlan;
  /** Gadi inside a school's dashboard from the admin ("Enter dashboard"):
   *  his activity must not be recorded as the school's. */
  impersonating?: boolean;
} | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userId = decoded.uid;
    const userDoc = await getAdminDb().collection("users").doc(userId).get();
    const plan = (userDoc.data()?.plan as UserPlan) || "basic";
    return { userId, plan, impersonating: decoded.adminImpersonation === true };
  } catch (e) {
    console.error("verifyUserAndGetPlan failed:", e);
    return null;
  }
}
