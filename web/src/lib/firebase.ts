import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app, auth, emulatorBuild } from "./firebase-auth";

// Auth lives in firebase-auth.ts (no Firestore), so pages that only need
// sign-in don't download the database SDK. This module adds Firestore.
export { auth };
export const db = getFirestore(app);

// Local tests against the Firebase emulators (Gemara phase A, 2026-10-15):
// only in a dev build started with NEXT_PUBLIC_GADIT_EMULATORS=1, so a test
// browser never signs in to, reads from or writes to the live project. A
// LOCAL production preview (Gemara phase B) may opt in at BUILD time with
// NEXT_PUBLIC_GADIT_LOCAL_PREVIEW=1 as well; both variables are inlined by the
// build, and a normal build (Vercel sets neither) contains none of this code.
if (emulatorBuild && process.env.NEXT_PUBLIC_GADIT_EMULATORS === "1" && typeof window !== "undefined") {
  const w = window as unknown as { __gaditEmu?: boolean };
  if (!w.__gaditEmu) {
    w.__gaditEmu = true;
    connectFirestoreEmulator(db, "127.0.0.1", 8085);
  }
}
export default app;
