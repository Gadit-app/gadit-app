// Vet paid-tier definitions for the public word pages (SEO plan item 2,
// Gadi 2026-10-06). READ-ONLY by default: writes a report, changes nothing.
//   node scripts/seo/vet-public-words.mjs            -> report only
//   node scripts/seo/vet-public-words.mjs --apply    -> copy approved docs to base
// Needs GOOGLE_APPLICATION_CREDENTIALS (service account, runtime only) and
// OPENAI_API_KEY in .env.local.
//
// A paid definition (cache doc auto2_<lang>_kids_<word>) becomes public only
// if ALL of these hold:
//   1. It looks like a word: 2 to 30 characters, at most 3 words, no digits,
//      no @ / URL / code characters, mostly letters.
//   2. A language check says it is a dictionary word or common phrase, not a
//      personal name, not private information, not gibberish, and spelled
//      correctly (a misspelling is blocked even when it is close).
//   3. No child searched it: never in the activity log under a kid account or
//      a school (classroom) account, never in a kid's notebook.
//   4. Its search history is known: at least one logged search by an adult
//      account (older searches, before the log existed, stay private).
//   5. The definition itself is complete (has meanings and a language).
//   6. The language check also blocks sensitive terms (sexual, drugs, graphic
//      violence, hate), since Gadit is a children's learning brand.
// Nothing about who searched is ever copied: the public doc is the definition
// only (same fields as a free-tier doc).
import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const APPLY = process.argv.includes("--apply");
// --loose: skip rule 4 (allow words whose searches predate the activity log).
const LOOSE = process.argv.includes("--loose");
const OUT = process.env.VET_OUT || path.join(HERE, "vet-report.json");

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
const FP = admin.firestore.FieldPath;

function looksLikeWord(w) {
  if (w.length < 2 || w.length > 30) return "length";
  if (/\d/.test(w)) return "digits";
  if (/https?:|www\.|@|\//.test(w)) return "url_or_email";
  if (/[<>{}[\]()=+*_#~^|\\]/.test(w)) return "code_chars";
  const letters = Array.from(w).filter((ch) => /\p{L}/u.test(ch)).length;
  if (letters / w.length < 0.7) return "not_letters";
  if (w.split(/\s+/).length > 3) return "too_many_words";
  return null;
}

async function classify(batch) {
  const list = batch.map((c, i) => `${i + 1}. ${c.word} (${c.wordLanguage || "?"})`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You vet search terms before they are published as public dictionary pages. For each numbered term return one label: " +
            '"word" = a real dictionary word, idiom or common phrase in its language (including well-known places, brands and famous names that appear in dictionaries); ' +
            '"name" = a personal first name, surname or nickname of a private person; ' +
            '"private" = anything that looks like personal information (an address, a username, an ID, a private nickname); ' +
            '"junk" = gibberish or not a real term; ' +
            '"misspelled" = a misspelling of a real word, even a close one (receipe, sacreligiuos, a Hebrew word with a wrong or missing letter); judge the spelling in the term own language; ' +
            '"sensitive" = sexual, drug, graphic-violence or hate terms that a learning brand for children should not publish as a page. ' +
            'Reply as JSON mapping each number to its label, e.g. {"1": "word", "2": "name"}.',
        },
        { role: "user", content: list },
      ],
    }),
  });
  const j = await res.json();
  try {
    const obj = JSON.parse(j.choices[0].message.content);
    const map = obj.labels && typeof obj.labels === "object" ? obj.labels : obj;
    return batch.map((_, i) => String(map[String(i + 1)] ?? "unknown").toLowerCase());
  } catch {
    return batch.map(() => "unknown");
  }
}

// --- data ---
const kidSnap = await db.collection("users").where("familyRole", "==", "kid").select().get();
const kidUids = new Set(kidSnap.docs.map((d) => d.id));
const schoolSnap = await db.collection("users").where("schoolId", "!=", null).select("schoolId").get();
const schoolUids = new Set(schoolSnap.docs.flatMap((d) => [d.id, d.get("schoolId")]).filter(Boolean));

const childWords = new Set();
const adultWords = new Set();
const al = await db.collection("activityLog").select("uid", "word", "kind").get();
for (const d of al.docs) {
  if (d.get("kind") !== "word") continue;
  const w = String(d.get("word") || "").trim().toLowerCase();
  const uid = d.get("uid");
  if (!w) continue;
  if (uid && (kidUids.has(uid) || schoolUids.has(uid))) childWords.add(w);
  else if (uid) adultWords.add(w);
}
for (const uid of kidUids) {
  const nb = await db.collection("users").doc(uid).collection("notebook").select("word").get();
  for (const d of nb.docs) childWords.add(String(d.get("word") || "").trim().toLowerCase());
}

const snap = await db.collection("cache").where(FP.documentId(), ">=", "auto2_").where(FP.documentId(), "<", "auto2`").get();
const ids = new Set(snap.docs.map((d) => d.id));
const cands = [];
for (const d of snap.docs) {
  const m = d.id.match(/^auto2_(.+?)_kids_(.+)$/);
  if (!m) continue;
  const [, lang, word] = m;
  if (ids.has(`auto2_${lang}_base_${word}`)) continue; // already public
  const data = d.data();
  cands.push({ id: d.id, lang, word, wordLanguage: data.language || "", meanings: Array.isArray(data.meanings) ? data.meanings.length : 0, data });
}

// Rules 1, 3, 4, 5 first (free), then the language check on what is left.
for (const c of cands) {
  const shape = looksLikeWord(c.word);
  if (shape) c.block = `shape:${shape}`;
  else if (!c.meanings || !c.wordLanguage) c.block = "incomplete_definition";
  else if (childWords.has(c.word)) c.block = "searched_by_child_or_class";
  else if (!adultWords.has(c.word) && !LOOSE) c.block = "no_known_search_history";
}
const toCheck = [];
const seen = new Map();
for (const c of cands) if (!c.block && !seen.has(c.word)) { seen.set(c.word, null); toCheck.push(c); }
for (let i = 0; i < toCheck.length; i += 30) {
  const batch = toCheck.slice(i, i + 30);
  const labels = await classify(batch);
  batch.forEach((c, k) => seen.set(c.word, labels[k]));
}
for (const c of cands) {
  if (c.block) continue;
  const label = seen.get(c.word);
  if (label !== "word" && label !== "idiom" && label !== "phrase") c.block = `language_check:${label}`;
}

// Second spelling pass, stronger model, only on what passed so far (the first
// pass let Hebrew misspellings such as a missing letter through).
async function spellCheck(batch) {
  const list = batch.map((c, i) => `${i + 1}. ${c.word} (${c.wordLanguage || "?"})`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'For each numbered term, say whether it is spelled exactly as a standard dictionary would spell it in its language (inflected forms and real phrases are fine). Missing, extra or wrong letters mean "misspelled". Reply as JSON mapping each number to "ok" or "misspelled".' },
        { role: "user", content: list },
      ],
    }),
  });
  const j = await res.json();
  try {
    const map = JSON.parse(j.choices[0].message.content);
    return batch.map((_, i) => String(map[String(i + 1)] ?? "unknown").toLowerCase());
  } catch {
    return batch.map(() => "unknown");
  }
}
{
  const left = cands.filter((c) => !c.block);
  for (let i = 0; i < left.length; i += 30) {
    const batch = left.slice(i, i + 30);
    const labels = await spellCheck(batch);
    batch.forEach((c, k) => { if (labels[k] !== "ok") c.block = `language_check:spelling_${labels[k]}`; });
  }
}

const pass = cands.filter((c) => !c.block);
const blocked = cands.filter((c) => c.block);
const reasons = {};
for (const c of blocked) reasons[c.block] = (reasons[c.block] || 0) + 1;
const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const report = {
  candidates: cands.length,
  pass: pass.length,
  blocked: blocked.length,
  reasons,
  samplePass: pick(pass, 20).map((c) => ({ lang: c.lang, word: c.word })),
  allPass: pass.map((c) => `${c.lang}:${c.word}`),
  allLanguageBlocked: blocked.filter((c) => c.block.startsWith("language_check")).map((c) => `${c.lang}:${c.word} [${c.block.slice(15)}]`),
  sampleBlocked: pick(blocked, 20).map((c) => ({ lang: c.lang, word: c.word, reason: c.block })),
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ candidates: report.candidates, pass: report.pass, blocked: report.blocked, reasons }, null, 1));

if (APPLY) {
  let n = 0;
  for (const c of pass) {
    const { cachedAt, ...def } = c.data;
    await db.collection("cache").doc(`auto2_${c.lang}_base_${c.word}`).set({ ...def, cachedAt: cachedAt ?? Date.now(), publishedFromPaid: true }, { merge: false });
    n++;
  }
  console.log("published", n);
}
process.exit(0);
