import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf-8");
function getEnv(k) {
  const m =
    envText.match(new RegExp(`^${k}='([^]+?)'\\s*$`, "m")) ||
    envText.match(new RegExp(`^${k}="([^]+?)"\\s*$`, "m")) ||
    envText.match(new RegExp(`^${k}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

const sa = JSON.parse(getEnv("FIREBASE_SERVICE_ACCOUNT"));
admin.initializeApp({
  credential: admin.credential.cert(sa),
  projectId: sa.project_id,
  storageBucket: `${sa.project_id}.firebasestorage.app`,
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

const word = process.argv[2];
if (!word) {
  console.error("Usage: node clear-image-cache.mjs <word>  (omit word to clear ALL)");
  process.exit(1);
}

const all = word === "--all";
const snap = all
  ? await db.collection("imageCache").get()
  : await db.collection("imageCache").where("word", "==", word).get();

console.log(`Found ${snap.size} cached images${all ? "" : ` for "${word}"`}`);
for (const doc of snap.docs) {
  const data = doc.data();
  console.log(`  deleting cache: ${doc.id} (word: ${data.word})`);
  if (data.storagePath) {
    try {
      await bucket.file(data.storagePath).delete();
      console.log(`    deleted storage: ${data.storagePath}`);
    } catch (e) {
      console.log(`    storage delete failed (file may not exist): ${e.message}`);
    }
  }
  await doc.ref.delete();
}
console.log("Done");
process.exit(0);
