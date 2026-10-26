// German (Swiss, Lehrplan 21) key words for the six subjects of /subjects
// (Gadi 2026-10-26, for a family in Switzerland). Input: the topic list from
// the approved sample (6 subjects x younger/older). Output: the two static
// files lib/subject-words.ts reads.
//   node scripts/curriculum-de/build_de.mjs <de-sample.json>
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const sample = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const SUBJ = { mathematics: "Mathematik", chemistry: "Chemie", physics: "Physik", biology: "Biologie", history: "Geschichte", geography: "Geografie" };
const SUBJ_HE = { mathematics: "מתמטיקה", chemistry: "כימיה", physics: "פיזיקה", biology: "ביולוגיה", history: "היסטוריה", geography: "גאוגרפיה" };
const SUBJ_EN = { mathematics: "Mathematics", chemistry: "Chemistry", physics: "Physics", biology: "Biology", history: "History", geography: "Geography" };
const LEVELS = { younger: "Primarschule, 5. und 6. Klasse (Zyklus 2)", older: "Sekundarstufe I, 7. bis 9. Klasse (Zyklus 3), auch erste Gymnasialjahre" };
const SYS = "Du kennst den Lehrplan 21 der Deutschschweiz und die Schulbücher der Volksschule genau. Antworte nur mit JSON.";
const usage = { in: 0, out: 0 };
const idOf = (t) => "cur-de-" + crypto.createHash("sha1").update(`${t.s}|${t.l}|${t.t}`).digest("hex").slice(0, 10);

async function words(t) {
  const user = `Fach: ${SUBJ[t.s]}. Stufe: ${LEVELS[t.l]}. Thema: "${t.t}".
Wähle 10 bis 12 Schlüsselwörter: die Fachbegriffe, die in diesem Thema unterrichtet werden und die ein Kind verstehen muss, um den Unterricht zu verstehen.
Regeln:
- Nur echte Begriffe dieses Themas, vom einfachen zum anspruchsvollen, keine allgemeinen Wörter, keine Doppelungen.
- Grundform wie im Wörterbuch (Nomen mit Artikel nur, wenn üblich: lieber "Atom" als "das Atom"). Ein Begriff aus mehreren Wörtern bleibt ganz.
- Zu jedem Begriff eine Definition: ein oder zwei Sätze (bis 160 Zeichen), die nur seine Bedeutung in diesem Thema erklären, einfach und klar für diese Stufe.
- Schweizer Rechtschreibung (ss statt ß). Keine langen Gedankenstriche. Allgemein formuliert, ohne das Kind anzusprechen.
Gib zurück: {"words":[{"w":"","d":""}]}`;
  for (let a = 0; a < 3; a++) {
    try {
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 180000);
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: SYS }, { role: "user", content: user }] }),
      });
      clearTimeout(timer);
      const j = await r.json();
      usage.in += j.usage?.prompt_tokens ?? 0; usage.out += j.usage?.completion_tokens ?? 0;
      const rows = (JSON.parse(j.choices[0].message.content).words ?? [])
        .map((x) => ({ w: String(x.w ?? "").trim(), d: String(x.d ?? "").trim().replace(/[–—]/g, ",").replace(/ß/g, "ss") }))
        .filter((x) => x.w && x.d);
      const seen = new Set(); const out = [];
      for (const x of rows) { const k = x.w.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(x); } }
      if (out.length >= 5) return out.slice(0, 12);
    } catch (e) { console.log("retry", t.t, String(e).slice(0, 80)); }
  }
  return null;
}

const topics = sample.topics.map((t, i) => ({ ...t, o: i }));
const done = new Map(sample.sample.filter((t) => t.words?.length >= 5).map((t) => [`${t.s}|${t.l}|${t.t}`, t.words]));
const todo = topics.filter((t) => !done.has(`${t.s}|${t.l}|${t.t}`));
for (let i = 0; i < todo.length; i += 6) {
  await Promise.all(todo.slice(i, i + 6).map(async (t) => { const w = await words(t); if (w) done.set(`${t.s}|${t.l}|${t.t}`, w); else console.log("FAILED", t.s, t.l, t.t); }));
  console.log(`${Math.min(i + 6, todo.length)}/${todo.length}`);
}
const catalog = { subjects: Object.keys(SUBJ).map((k) => ({ key: k, de: SUBJ[k], en: SUBJ_EN[k], he: SUBJ_HE[k] })), topics: {} };
const sets = {};
let n = 0;
for (const t of topics) {
  const w = done.get(`${t.s}|${t.l}|${t.t}`); if (!w) continue;
  const id = idOf(t);
  catalog.topics[String(n++)] = { id, s: t.s, l: t.l, t: t.t.replace(/ß/g, "ss"), o: t.o };
  sets[id] = { words: w.map((x) => x.w), defs: Object.fromEntries(w.map((x) => [x.w, x.d])) };
}
const LIB = path.join(HERE, "../../src/lib/");
fs.writeFileSync(LIB + "curriculum-catalog-de.json", JSON.stringify(catalog, null, 1));
fs.writeFileSync(LIB + "curriculum-sets-de.json", JSON.stringify(sets, null, 1));
console.log("topics", n, "words", Object.values(sets).reduce((a, s) => a + s.words.length, 0), "cost $" + ((usage.in * 2.5 + usage.out * 15) / 1e6).toFixed(3));
