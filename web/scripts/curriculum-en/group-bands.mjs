// Group the MoE Band words into child-friendly topic sets of 8-12 words
// (Gadi 2026-10-12, option 1). Usage: node group-bands.mjs <band> [--write]
// band: pre-1 | 1-core1 | 1-core2 | 2-core1 | 2-core2. Prints the real cost.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const band = process.argv[2] || "pre-1";
const all = JSON.parse(readFileSync(new URL("./moe-bands.json", import.meta.url), "utf8"));
const CONTENT = /^(n|v|adj|adv|n, v|v, n|cardinal number|ordinal number|n, adj|adj, n)$/i;
const words = [...new Set(all.filter((x) => x.band === band && CONTENT.test(x.pos.trim()) && /^[a-z][a-z' -]*$/i.test(x.w.trim()) && x.w.trim().split(" ").length <= 2).map((x) => x.w.trim().toLowerCase()))];
console.log(band, "content words:", words.length);
const prompt = `These are English words from the Israeli Ministry of Education list "${band}" for children. Group ALL of them into topic sets a child understands (animals, food, family, school things, actions, feelings, places, time, colours, numbers, describing words, and so on). Each set has 8 to 12 words; a word goes in exactly one set; keep every word exactly as given. Give each set a short English title (1 to 3 words) and one emoji. Return JSON {"sets":[{"title":"","icon":"","words":[]}]}.\n\nWords: ${words.join(", ")}`;
const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
});
const j = await r.json();
const u = j.usage; const cost = (u.prompt_tokens * 0.15 + u.completion_tokens * 0.6) / 1e6;
const sets = JSON.parse(j.choices[0].message.content).sets;
const used = new Set(sets.flatMap((s) => s.words.map((w) => w.toLowerCase())));
console.log("sets:", sets.length, "words placed:", used.size, "of", words.length, "missing:", words.filter((w) => !used.has(w)).slice(0, 15).join(", "));
console.log("tokens", u.prompt_tokens, u.completion_tokens, "cost $" + cost.toFixed(4));
for (const s of sets) console.log(" ", s.icon, s.title, "(" + s.words.length + "):", s.words.join(", "));
if (process.argv.includes("--write")) {
  const out = new URL("./band-sets.json", import.meta.url);
  const prev = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
  prev[band] = sets;
  writeFileSync(out, JSON.stringify(prev, null, 1));
  console.log("written");
}
