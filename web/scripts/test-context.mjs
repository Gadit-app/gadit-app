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

const word = process.argv[2] || "קרן";
const sentence = process.argv[3] || "הילדים חזרו מהמשחק עם קרני השמש האחרונות של היום";
const uiLang = process.argv[4] || "he";

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

const res = await fetch("http://localhost:3000/api/define", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
  body: JSON.stringify({ word, uiLang, contextSentence: sentence }),
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buf = "";
let final = null;
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += decoder.decode(value, { stream: true });
  const lines = buf.split("\n");
  buf = lines.pop() || "";
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("data:")) continue;
    const d = t.slice(5).trim();
    if (!d) continue;
    try {
      const e = JSON.parse(d);
      if (e.type === "done") final = e.result;
    } catch {}
  }
}

console.log("word:", final.word);
console.log("contextNote:", final.contextNote);
console.log("etymology:", JSON.stringify(final.etymology, null, 2));
console.log("meanings count:", final.meanings.length);
final.meanings.forEach((m, i) => {
  console.log(`  ${i + 1}: ${m.meaning}`);
  if (m.kidsExplanation) console.log("     kids:", m.kidsExplanation.explanation?.slice(0, 80));
  if (m.idioms?.length) m.idioms.forEach(id => console.log(`     idiom: "${id.phrase}" → ${id.meaning}`));
});
process.exit(0);
