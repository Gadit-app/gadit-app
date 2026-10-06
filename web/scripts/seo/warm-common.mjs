// SEO trial (Gadi 2026-10-06, plan item 7): pre-generate public definitions
// for the most common English words in three UI languages (he, es, ar), so
// their word pages carry real content for search engines. Capped by the
// approval: 2,000 words x 3 languages, about $30. Do not widen without Gadi.
//
//   node scripts/seo/warm-common.mjs list <freq-list.txt> <out.json>   build + vet the word list
//   node scripts/seo/warm-common.mjs run <list.json> [--limit N]       generate (resumable)
//
// "run" calls the live /api/define with the admin refresh header, which
// skips the quota, is not counted as a search, and writes the anonymous
// (public) cache doc auto2_<lang>_base_<word>. Words that already have that
// doc are skipped. Needs ADMIN_SECRET and OPENAI_API_KEY in .env.local and
// GOOGLE_APPLICATION_CREDENTIALS (runtime only).
import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const LANGS = ["he", "es", "ar"];
const TARGET = 2000;
const [, , cmd, a1, a2] = process.argv;

const STOP = new Set(("the of and to in for is on that by this with you it not or be are from at as your all have new more an was we will can us about if my has but our one other do no they he up may what which their out use any there see only so his when here who web also now help get pm view online first am been would how were me some these its like than find back top had just over into two any com www html").split(" "));

async function vet(words) {
  const KEY = get("OPENAI_API_KEY");
  const keep = [];
  for (let i = 0; i < words.length; i += 100) {
    const batch = words.slice(i, i + 100);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Each numbered token comes from a web word-frequency list. Keep it ("keep") only if it is an ordinary English dictionary word a learner might look up. Drop ("drop") abbreviations, brand or company names, place names, personal names, web or tech jargon (html, url, login), units, and sexual or offensive words. Reply as JSON mapping each number to "keep" or "drop".' },
          { role: "user", content: batch.map((w, k) => `${k + 1}. ${w}`).join("\n") },
        ],
      }),
    });
    const j = await res.json();
    let map = {};
    try { map = JSON.parse(j.choices[0].message.content); } catch {}
    batch.forEach((w, k) => { if (String(map[String(k + 1)] ?? "").toLowerCase() === "keep") keep.push(w); });
    if (keep.length >= TARGET) break;
  }
  return keep.slice(0, TARGET);
}

if (cmd === "list") {
  const raw = fs.readFileSync(a1, "utf8").split(/\r?\n/).map((w) => w.trim().toLowerCase());
  const all = new Set(raw);
  // A plural whose singular is also on the list is the same dictionary entry.
  const plural = (w) =>
    (w.endsWith("ies") && all.has(w.slice(0, -3) + "y")) ||
    (w.endsWith("es") && all.has(w.slice(0, -2))) ||
    (w.endsWith("s") && !w.endsWith("ss") && all.has(w.slice(0, -1)));
  const cands = raw.filter((w) => /^[a-z]{4,}$/.test(w) && !STOP.has(w) && !plural(w));
  const list = await vet(cands);
  fs.writeFileSync(a2, JSON.stringify(list));
  console.log("candidates", cands.length, "kept", list.length);
  process.exit(0);
}

if (cmd === "run") {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = admin.firestore();
  const SECRET = get("ADMIN_SECRET");
  const words = JSON.parse(fs.readFileSync(a1, "utf8"));
  const li = process.argv.indexOf("--limit");
  const limit = li > 0 ? Number(process.argv[li + 1]) : Infinity;
  const jobs = [];
  for (const lang of LANGS) {
    const refs = words.map((w) => db.collection("cache").doc(`auto2_${lang}_base_${w}`));
    for (let i = 0; i < refs.length; i += 300) {
      const snaps = await db.getAll(...refs.slice(i, i + 300), { fieldMask: ["word"] });
      snaps.forEach((s, k) => { if (!s.exists) jobs.push({ lang, word: words[i + k] }); });
    }
  }
  const todo = jobs.slice(0, limit);
  console.log("to generate", todo.length, "of", words.length * LANGS.length);
  let done = 0, failed = 0, idx = 0;
  // The site's daily admin cap (lib/ai-budget.ts) answers 429; out of credit
  // or the hard cap answers 503. Either one stops the whole run at once.
  let stop = "";
  async function one(job) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("https://www.gadit.app/api/define", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gadit-refresh": SECRET,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36 GaditWarmup",
          },
          body: JSON.stringify({ word: job.word, uiLang: job.lang }),
        });
        const text = await res.text();
        if (res.status === 429 || res.status === 503) { stop = `server said ${res.status}: ${text.slice(0, 80)}`; return false; }
        if (res.ok && text.includes('"type":"done"')) return true;
      } catch {}
    }
    return false;
  }
  async function worker() {
    while (idx < todo.length && !stop) {
      const job = todo[idx++];
      if (await one(job)) done++; else { failed++; console.log("fail", job.lang, job.word); }
      if ((done + failed) % 100 === 0) console.log(`progress ${done + failed}/${todo.length} ok=${done} fail=${failed}`);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`finished ok=${done} fail=${failed}${stop ? ` STOPPED: ${stop}` : ""}`);
  process.exit(0);
}
console.log("usage: list <freq.txt> <out.json> | run <list.json> [--limit N]");
