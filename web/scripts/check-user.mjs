import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");

const match = envText.match(/^FIREBASE_SERVICE_ACCOUNT='([^]+?)'\s*$/m);
const sa = JSON.parse(match[1]);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const auth = admin.auth();
const db = admin.firestore();

const email = process.argv[2];
if (!email) { console.error("Usage: check-user.mjs <email>"); process.exit(1); }

const userRecord = await auth.getUserByEmail(email);
console.log(`\nFirebase Auth:`);
console.log(`  uid: ${userRecord.uid}`);
console.log(`  email: ${userRecord.email}`);
console.log(`  created: ${userRecord.metadata.creationTime}`);
console.log(`  lastSignIn: ${userRecord.metadata.lastSignInTime}`);

const doc = await db.collection("users").doc(userRecord.uid).get();
console.log(`\nFirestore users/${userRecord.uid}:`);
if (doc.exists) {
  console.log(JSON.stringify(doc.data(), null, 2));
} else {
  console.log("  (document does not exist)");
}

process.exit(0);
