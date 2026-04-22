// Tests the /api/define endpoint as a paid user by creating a custom token
// for gadibenlavi@gmail.com and exchanging it for an ID token.
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
const uiLang = process.argv[4] || "he";
const baseUrl = process.argv[5] || "http://localhost:3000";

const userRecord = await admin.auth().getUserByEmail(email);
const customToken = await admin.auth().createCustomToken(userRecord.uid);

// Exchange custom token → ID token via REST
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

if (!idToken) {
  console.error("Failed to exchange custom token:", exchangeData);
  process.exit(1);
}

console.log(`Got ID token for ${email}, length=${idToken.length}`);
console.log(`Calling ${baseUrl}/api/define with word="${word}" uiLang=${uiLang}\n`);

const res = await fetch(`${baseUrl}/api/define`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({ word, uiLang }),
});

if (!res.ok) {
  console.error("HTTP", res.status, await res.text());
  process.exit(1);
}

// SSE stream
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";
let finalResult = null;
let deltaCount = 0;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("data:")) continue;
    const data = t.slice(5).trim();
    if (!data) continue;
    try {
      const event = JSON.parse(data);
      if (event.type === "delta") deltaCount++;
      else if (event.type === "done") finalResult = event.result;
      else if (event.type === "error") {
        console.error("Stream error:", event.message);
        process.exit(1);
      }
    } catch {}
  }
}

console.log(`Received ${deltaCount} delta events`);
console.log(`\n=== FINAL RESULT ===`);
console.log(`word: ${finalResult.word}`);
console.log(`meanings: ${finalResult.meanings.length}`);
for (let i = 0; i < finalResult.meanings.length; i++) {
  const m = finalResult.meanings[i];
  console.log(`\nMeaning ${i + 1}: ${m.meaning.slice(0, 80)}`);
  console.log(`  has kidsExplanation: ${!!m.kidsExplanation}`);
  if (m.kidsExplanation) {
    console.log(`  kids.intro: ${m.kidsExplanation.intro}`);
    console.log(`  kids.explanation: ${m.kidsExplanation.explanation?.slice(0, 80)}`);
    console.log(`  kids.examples count: ${m.kidsExplanation.examples?.length}`);
  }
}

process.exit(0);
