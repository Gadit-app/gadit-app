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
const auth = admin.auth();
const db = admin.firestore();

const email = process.argv[2];
const plan = process.argv[3] || "clear";

if (!email) {
  console.error("Usage: node set-user-plan.mjs <email> [plan]");
  process.exit(1);
}

try {
  const userRecord = await auth.getUserByEmail(email);
  console.log(`Found user: ${userRecord.email} (${userRecord.uid})`);

  await db.collection("users").doc(userRecord.uid).set(
    {
      plan,
      email: userRecord.email,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`✓ Set plan="${plan}" for ${userRecord.email}`);
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}

process.exit(0);
