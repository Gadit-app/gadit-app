// Adds `searches` ("{n} searches": how many times the class looked a word up) to every
// language of src/lib/class-milestones-i18n.json (Gadi 2026-11-16: the class page shows
// the class's searches next to its different words). One call, all languages.
//   node scripts/class-milestones-searches-i18n.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const OUT = path.join(HERE, "../src/lib/class-milestones-i18n.json");
const data = JSON.parse(fs.readFileSync(OUT, "utf8"));
const codes = Object.keys(data).filter((c) => !String(data[c].searches ?? "").includes("{n}"));
if (!codes.length) {
  console.log("nothing to do");
  process.exit(0);
}
const examples = Object.fromEntries(codes.map((c) => [c, { words: data[c].words, reached: data[c].reached }]));
const user = `A children's classroom dictionary shows the class how many times its pupils looked a word up, next to how many different words they looked up. English: "{n} searches" (e.g. "757 searches"), shown beside "{n} different words".
Write that short counter in each language below. Keep {n} exactly, write it the way the existing strings of the same language write their counters (given for each language), a plural form that fits large numbers, no long dashes.
Return JSON: { "<code>": "<counter>" } for exactly these codes.

${JSON.stringify(examples)}`;
const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({
    model: "gpt-5.4",
    reasoning_effort: "low",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a professional localizer for a children's education product. Return JSON only." },
      { role: "user", content: user },
    ],
  }),
});
const j = await r.json();
const got = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");
let n = 0;
const LONG_DASH = /[–—]/;
const HEBREW = /[֐-׿]/;
for (const c of codes) {
  const v = String(got[c] ?? "");
  if (!v.includes("{n}") || LONG_DASH.test(v) || HEBREW.test(v)) {
    console.log("BAD", c, v);
    continue;
  }
  data[c].searches = v;
  n++;
}
fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
const u = j.usage ?? {};
const usd = ((u.prompt_tokens ?? 0) * 2.5 + (u.completion_tokens ?? 0) * 15) / 1e6;
console.log(`added ${n} of ${codes.length}; tokens in ${u.prompt_tokens} out ${u.completion_tokens}, about $${usd.toFixed(4)}`);
