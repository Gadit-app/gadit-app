import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf-8");
function getEnv(key) {
  const m =
    envText.match(new RegExp(`^${key}='([^]+?)'\\s*$`, "m")) ||
    envText.match(new RegExp(`^${key}="([^]+?)"\\s*$`, "m")) ||
    envText.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

const sa = JSON.parse(getEnv("FIREBASE_SERVICE_ACCOUNT"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });

const email = process.argv[2] || "gadibenlavi@gmail.com";
const word = process.argv[3] || "קרן";
const meaning = process.argv[4] || "אלומת אור דקה הנובעת ממקור אור";
const uiLang = process.argv[5] || "he";

const userRecord = await admin.auth().getUserByEmail(email);
const customToken = await admin.auth().createCustomToken(userRecord.uid);

const apiKey = getEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
const exchangeRes = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  }
);
const exchangeData = await exchangeRes.json();
const idToken = exchangeData.idToken;

console.log(`Generating image for "${word}" meaning "${meaning.slice(0, 60)}..."`);
const start = Date.now();
const res = await fetch("http://localhost:3000/api/generate-image", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({ word, meaning, uiLang }),
});
const elapsed = Date.now() - start;
const data = await res.json();
console.log(`Status: ${res.status}, took ${(elapsed / 1000).toFixed(1)}s`);
console.log("Response:", JSON.stringify(data, null, 2));
process.exit(0);
