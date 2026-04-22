import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let adminApp: App | null = null;

function getAdminApp(): App {
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
  });
  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export type UserPlan = "basic" | "clear" | "deep";

export async function verifyUserAndGetPlan(idToken: string | undefined | null): Promise<{
  userId: string;
  plan: UserPlan;
} | null> {
  if (!idToken) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userId = decoded.uid;
    const userDoc = await getAdminDb().collection("users").doc(userId).get();
    const plan = (userDoc.data()?.plan as UserPlan) || "basic";
    return { userId, plan };
  } catch (e) {
    console.error("verifyUserAndGetPlan failed:", e);
    return null;
  }
}
