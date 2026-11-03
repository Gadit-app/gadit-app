// English example sentences for English words on other languages' word pages
// (Gadi 2026-11-03, after the Search Console read: Hebrew searchers type
// "certain תרגום", and the Hebrew page of "certain" had no English sentence).
//
// For every public cache doc auto2_<lang>_base_<word> whose word is English
// (language "English", lang not en, indexOk not false) and that has no
// examplesEn yet, gpt-5.4-mini writes 2 short English sentences per sense,
// stored on the meaning as examplesEn. A sense with no natural everyday use
// gets none. A sentence that does not contain the word is dropped.
//
//   node scripts/seo/english-examples.mjs --limit 10            -> dry run, prints, writes nothing
//   node scripts/seo/english-examples.mjs --apply --langs he,es,ar --max-usd 4
//   node scripts/seo/english-examples.mjs --apply --langs he --words certain,rear   -> only these
//
// Measured 2026-11-03 on 10 Hebrew pages: $0.00076 per word.
// Needs GOOGLE_APPLICATION_CREDENTIALS (service account, runtime only) and
// OPENAI_API_KEY in .env.local.
import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const APPLY = process.argv.includes("--apply");
const LIMIT = Number(arg("--limit", APPLY ? "100000" : "10"));
const LANGS = arg("--langs", "he,es,ar").split(",");
const MAX_USD = Number(arg("--max-usd", "4"));
const ONLY = arg("--words", "") ? new Set(arg("--words", "").split(",")) : null;
const MODEL = "gpt-5.4-mini";
const PRICE = { in: 0.75, out: 4.5 }; // $ per 1M tokens (lib/ai-cost.ts)

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

/** The word (or a form of it: guided, points) appears in the sentence. */
function usesWord(sentence, word) {
  const w = word.toLowerCase();
  const s = sentence.toLowerCase();
  if (s.includes(w)) return true;
  const stem = w.length > 4 ? w.slice(0, w.length - 2) : w.slice(0, 3);
  return s.split(/[^a-z'-]+/).some((t) => t.startsWith(stem));
}

async function sentencesFor(word, meanings) {
  const senses = meanings.map((m, i) => `${i + 1}. (${m.pos || ""}) ${m.meaning}`).join("\n");
  const prompt =
    `English word: "${word}". Its senses, explained in another language:\n${senses}\n\n` +
    `For each sense, write 2 short, natural English example sentences that use "${word}" in exactly that sense. ` +
    `Everyday language a 12-year-old understands, 6 to 14 words each, correct modern English, no names of real people. ` +
    `If a sense is not used that way in modern everyday English, return an empty list for it. ` +
    `Return JSON: {"senses":[["sentence","sentence"], ...]} with one list per sense, in the same order.`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 200));
  const u = j.usage ?? {};
  const cost = ((u.prompt_tokens ?? 0) * PRICE.in + (u.completion_tokens ?? 0) * PRICE.out) / 1e6;
  const list = JSON.parse(j.choices[0].message.content).senses;
  if (!Array.isArray(list) || list.length !== meanings.length) throw new Error("sense count mismatch");
  const clean = list.map((xs) =>
    (Array.isArray(xs) ? xs : [])
      .filter((s) => typeof s === "string" && s.length >= 12 && s.length <= 140 && usesWord(s, word))
      .slice(0, 2),
  );
  return { clean, cost };
}

const docs = [];
const snap = await db.collection("cache").where("language", "==", "English").get();
for (const lang of LANGS) {
  for (const d of snap.docs) {
    if (!d.id.startsWith(`auto2_${lang}_base_`)) continue;
    const data = d.data();
    if (ONLY && !ONLY.has(d.id.slice(`auto2_${lang}_base_`.length))) continue;
    if (data.indexOk === false || !Array.isArray(data.meanings) || !data.meanings.length) continue;
    if (data.meanings.some((m) => Array.isArray(m.examplesEn))) continue;
    docs.push({ ref: d.ref, word: d.id.slice(`auto2_${lang}_base_`.length), meanings: data.meanings });
  }
  if (docs.length >= LIMIT) break;
}
const todo = docs.slice(0, LIMIT);
console.log(`${todo.length} pages to do (${APPLY ? "APPLY" : "dry run"})`);

let spent = 0, done = 0, failed = 0, skippedSenses = 0;
let i = 0;
async function worker() {
  while (i < todo.length && spent < MAX_USD) {
    const t = todo[i++];
    try {
      const { clean, cost } = await sentencesFor(t.word, t.meanings);
      spent += cost;
      skippedSenses += clean.filter((x) => !x.length).length;
      if (APPLY) {
        const meanings = t.meanings.map((m, k) => ({ ...m, examplesEn: clean[k] }));
        await t.ref.update({ meanings });
      } else {
        console.log(t.word, JSON.stringify(clean));
      }
      done++;
      if (done % 100 === 0) console.log(`${done}/${todo.length} $${spent.toFixed(3)}`);
    } catch (e) {
      failed++;
      console.warn(t.word, String(e).slice(0, 160));
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(JSON.stringify({ done, failed, skippedSenses, usd: spent.toFixed(4), stoppedAtCap: spent >= MAX_USD }));
process.exit(0);
