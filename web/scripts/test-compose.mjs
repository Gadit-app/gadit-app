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
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });

const userRecord = await admin.auth().getUserByEmail("gadibenlavi@gmail.com");
const customToken = await admin.auth().createCustomToken(userRecord.uid);
const apiKey = getEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
const ex = await fetch(
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  }
);
const { idToken } = await ex.json();

const tests = [
  {
    label: "PERFECT (correct meaning + grammar)",
    word: "קרן",
    meaning: "אלומת אור דקה הנובעת ממקור אור",
    sentence: "קרן השמש האירה את החדר בבוקר",
  },
  {
    label: "INCORRECT (wrong meaning — money fund)",
    word: "קרן",
    meaning: "אלומת אור דקה הנובעת ממקור אור",
    sentence: "השקעתי את כל הכסף שלי בקרן נאמנות",
  },
  {
    label: "ALMOST (right meaning, awkward)",
    word: "קרן",
    meaning: "אלומת אור דקה הנובעת ממקור אור",
    sentence: "ראיתי קרן",
  },
];

for (const test of tests) {
  console.log(`\n=== ${test.label} ===`);
  console.log(`sentence: "${test.sentence}"`);
  const res = await fetch("http://localhost:3000/api/check-sentence", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      word: test.word,
      meaning: test.meaning,
      sentence: test.sentence,
      uiLang: "he",
    }),
  });
  const data = await res.json();
  console.log("status:", data.status);
  console.log("message:", data.message);
  if (data.suggestion) console.log("suggestion:", data.suggestion);
}
process.exit(0);
