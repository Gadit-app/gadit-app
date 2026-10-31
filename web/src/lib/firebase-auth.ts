import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

/**
 * The Firebase app and Auth only, without Firestore (2026-10-31): screens on
 * every page (sign-in bridges) import this, so the 166KB database SDK loads
 * only where a screen really reads the database (lib/firebase.ts).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Local emulator tests only (see lib/firebase.ts): a normal build contains none of this.
export const emulatorBuild = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_GADIT_LOCAL_PREVIEW === "1";
if (emulatorBuild && process.env.NEXT_PUBLIC_GADIT_EMULATORS === "1" && typeof window !== "undefined") {
  const w = window as unknown as { __gaditEmuAuth?: boolean };
  if (!w.__gaditEmuAuth) {
    w.__gaditEmuAuth = true;
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
}
