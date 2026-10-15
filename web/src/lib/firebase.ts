import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Local tests against the Firebase emulators (Gemara phase A, 2026-10-15):
// only in a dev build started with NEXT_PUBLIC_GADIT_EMULATORS=1, so a test
// browser never signs in to, reads from or writes to the live project. A
// LOCAL production preview (Gemara phase B) may opt in at BUILD time with
// NEXT_PUBLIC_GADIT_LOCAL_PREVIEW=1 as well; both variables are inlined by the
// build, and a normal build (Vercel sets neither) contains none of this code.
const emulatorBuild = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_GADIT_LOCAL_PREVIEW === "1";
if (emulatorBuild && process.env.NEXT_PUBLIC_GADIT_EMULATORS === "1" && typeof window !== "undefined") {
  const w = window as unknown as { __gaditEmu?: boolean };
  if (!w.__gaditEmu) {
    w.__gaditEmu = true;
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8085);
  }
}
export default app;
