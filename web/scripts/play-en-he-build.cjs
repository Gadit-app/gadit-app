// English words for the games of a Hebrew-speaking child (Gadi 2026-11-15):
// the Ministry of Education Band I word sets (scripts/curriculum-en/band-sets.json,
// about 700 words in topic sets) each get ONE Hebrew translation that fits the
// topic, then a second, blind pass keeps only pairs it judges correct.
// Output: src/lib/play-content/en-he-band1.json  [{ topic, part, words: [[en, he], ...] }]
//
//   node scripts/play-en-he-build.cjs 1      -> the first set only (cost measurement)
//   node scripts/play-en-he-build.cjs        -> every set
// Reads OPENAI_API_KEY from .env.local at run time and never prints it. Cap: 2 dollars.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const KEY = (/^OPENAI_API_KEY=(.*)$/m.exec(fs.readFileSync(path.join(root, ".env.local"), "utf8")) || [])[1].trim().replace(/^"|"$/g, "");
const sets = require("./curriculum-en/band-sets.json").band1;
const LIMIT = Number(process.argv[2] || 0) || sets.length;
let usd = 0;

async function ask(system, user) {
  for (let t = 0; t < 3; t++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-5.4", temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      });
      const j = await res.json();
      const u = j.usage; const c = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
      usd += ((u.prompt_tokens - c) * 2.5 + c * 0.25 + u.completion_tokens * 15) / 1e6;
      return JSON.parse(j.choices[0].message.content);
    } catch (e) { if (t === 2) return null; }
  }
}

const TRANSLATE = 'You write a first English dictionary for Hebrew-speaking children in Israel, grades 1 to 6. For each English word of the given topic give ONE Hebrew translation: the everyday Hebrew word a child knows, in the sense that fits the topic (in the topic "animals", "fly" is the insect), one to three words, no niqqud, no explanation, no slash or alternatives. A verb is given in the infinitive (לרוץ), a noun in the singular unless the English is plural, an adjective in the masculine singular. Return JSON: {"items":[{"en":string,"he":string}]} with every word, in the same order.';
const CHECK = 'You check a first English-Hebrew dictionary for Israeli children. For each pair, judge blind whether the Hebrew is a correct, natural, everyday translation of the English word for a child, with no spelling mistake. The topic is only a hint for the sense. Return JSON: {"items":[{"en":string,"ok":boolean}]} with every pair.';

(async () => {
  const out = []; let asked = 0, kept = 0; const dropped = [];
  const todo = sets.slice(0, LIMIT);
  let next = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (next < todo.length && usd < 2) {
      const idx = next++; const s = todo[idx];
      const tr = await ask(TRANSLATE, JSON.stringify({ topic: s.topic, words: s.words }));
      const pairs = ((tr && tr.items) || []).filter((p) => p && typeof p.en === "string" && typeof p.he === "string" && s.words.includes(p.en) && /[א-ת]/.test(p.he) && !/[A-Za-z/]/.test(p.he));
      const ck = await ask(CHECK, JSON.stringify({ topic: s.topic, pairs: pairs.map((p) => ({ en: p.en, he: p.he })) }));
      const ok = new Set(((ck && ck.items) || []).filter((x) => x && x.ok === true).map((x) => x.en));
      const good = pairs.filter((p) => ok.has(p.en));
      asked += s.words.length; kept += good.length;
      for (const w of s.words) if (!good.some((p) => p.en === w)) dropped.push(`${s.topic}: ${w}${pairs.find((p) => p.en === w) ? " -> " + pairs.find((p) => p.en === w).he : ""}`);
      out[idx] = { topic: s.topic, part: s.part, words: good.map((p) => [p.en, p.he.trim()]) };
    }
  }));
  const done = out.filter(Boolean);
  if (LIMIT === sets.length) fs.writeFileSync(path.join(root, "src/lib/play-content/en-he-band1.json"), JSON.stringify(done.filter((s) => s.words.length >= 4)) + "\n");
  console.log(JSON.stringify({ sets: done.length, asked, kept, dropped: dropped.length, usd: Number(usd.toFixed(4)) }));
  console.log("sample:", JSON.stringify(done[0]));
  console.log("dropped:", dropped.slice(0, 40).join(" | "));
})();
