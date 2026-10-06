// Mark which public word pages (base cache docs) are good enough to be linked,
// listed in the sitemap and indexed (Gadi 2026-10-06: the all-words hub showed
// gibberish like "puzhyhch" and private first names that anonymous visitors
// had typed). Sets indexOk true/false on every auto2_<lang>_base_<word> doc
// that has no verdict yet:
//   true  = passes the shape check, the language check (a real word or common
//           phrase; not a name, private, sensitive or junk) and the spelling check
//   false = anything else; the page then is noindex and is not linked.
//   node scripts/seo/vet-index-words.mjs [--recheck]
// Needs GOOGLE_APPLICATION_CREDENTIALS (runtime only) and OPENAI_API_KEY in .env.local.
import admin from "firebase-admin";
import { looksLikeWord, classify, spellCheck } from "./word-checks.mjs";

const RECHECK = process.argv.includes("--recheck");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
const FP = admin.firestore.FieldPath;

const snap = await db.collection("cache").where(FP.documentId(), ">=", "auto2_").where(FP.documentId(), "<", "auto2`").select("language", "indexOk").get();
const docs = [];
for (const d of snap.docs) {
  const m = d.id.match(/^auto2_(.+?)_base_(.+)$/);
  if (!m) continue;
  if (!RECHECK && typeof d.get("indexOk") === "boolean") continue;
  docs.push({ ref: d.ref, lang: m[1], word: m[2], wordLanguage: d.get("language") || "" });
}
console.log("to check", docs.length);

const verdict = new Map(); // word -> true/false (same word, same verdict in every UI language)
const pending = [];
for (const c of docs) {
  if (verdict.has(c.word)) continue;
  if (looksLikeWord(c.word)) verdict.set(c.word, false);
  else { verdict.set(c.word, null); pending.push(c); }
}
for (let i = 0; i < pending.length; i += 30) {
  const batch = pending.slice(i, i + 30);
  const labels = await classify(batch);
  batch.forEach((c, k) => { if (!["word", "idiom", "phrase"].includes(labels[k])) verdict.set(c.word, false); });
}
const left = pending.filter((c) => verdict.get(c.word) === null);
for (let i = 0; i < left.length; i += 30) {
  const batch = left.slice(i, i + 30);
  const labels = await spellCheck(batch);
  batch.forEach((c, k) => verdict.set(c.word, labels[k] === "ok"));
}

let ok = 0, no = 0;
const writer = db.bulkWriter();
for (const c of docs) {
  const v = verdict.get(c.word) === true;
  v ? ok++ : no++;
  writer.set(c.ref, { indexOk: v }, { merge: true });
}
await writer.close();
console.log(`indexOk true=${ok} false=${no}`);
process.exit(0);
