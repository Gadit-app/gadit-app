import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");

const match = envText.match(/^FIREBASE_SERVICE_ACCOUNT='([^]+?)'\s*$/m);
if (!match) {
  console.error("FIREBASE_SERVICE_ACCOUNT not found in .env.local");
  process.exit(1);
}

const sa = JSON.parse(match[1]);
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();

const snap = await db.collection("cache").get();
console.log("Found", snap.size, "cached entries");
for (const doc of snap.docs) {
  console.log("  deleting:", doc.id);
  await doc.ref.delete();
}
console.log("Cache cleared!");
process.exit(0);
