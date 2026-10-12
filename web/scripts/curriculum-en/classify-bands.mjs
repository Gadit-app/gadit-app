// Label each MoE Band word with one child topic, then split each topic into
// sets of about 10 in code (Gadi 2026-10-12, option 1). Prints the real cost.
// Usage: node classify-bands.mjs <bands comma list> [--model gpt-4o-mini] [--write <name>]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const bands = (process.argv[2] || "pre-1").split(",");
const mi = process.argv.indexOf("--model"); const model = mi > 0 ? process.argv[mi + 1] : "gpt-4o-mini";
const wi = process.argv.indexOf("--write"); const name = wi > 0 ? process.argv[wi + 1] : null;
const PRICE = { "gpt-4o-mini": [0.15, 0.6], "gpt-4o": [2.5, 10] }[model];
const TOPICS = ["animals", "food and drink", "family and people", "body", "clothes", "home and furniture", "school", "colours", "numbers", "time and days", "weather and nature", "places in town", "transport", "sports and games", "feelings", "jobs", "actions", "describing words", "shapes and sizes", "other"];
const all = JSON.parse(readFileSync(new URL("./moe-bands.json", import.meta.url), "utf8"));
const CONTENT = /^(n|v|adj|adv|cardinal number|ordinal number)\b/i;
const words = [...new Set(all.filter((x) => bands.includes(x.band) && CONTENT.test(x.pos.trim()) && /^[a-z][a-z' -]*$/i.test(x.w.trim()) && x.w.trim().split(" ").length <= 2).map((x) => x.w.trim().toLowerCase()))];
console.log(bands.join("+"), "content words:", words.length, "model", model);
let cost = 0; const label = {};
for (let i = 0; i < words.length; i += 150) {
  const chunk = words.slice(i, i + 150);
  const prompt = `Label each English word (from a children's school word list) with exactly one topic from this list: ${TOPICS.join(", ")}. Use "actions" for verbs, "describing words" for adjectives that fit no other topic, "other" only when nothing fits. Return JSON {"labels":{"<word>":"<topic>"}} with every word.\n\nWords: ${chunk.join(", ")}`;
  const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` }, body: JSON.stringify({ model, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }) });
  const j = await r.json();
  cost += (j.usage.prompt_tokens * PRICE[0] + j.usage.completion_tokens * PRICE[1]) / 1e6;
  Object.assign(label, JSON.parse(j.choices[0].message.content).labels ?? {});
}
const byTopic = {};
for (const w of words) { const t = TOPICS.includes(label[w]) ? label[w] : "other"; (byTopic[t] ??= []).push(w); }
const sets = [];
for (const t of TOPICS) {
  const ws = byTopic[t]; if (!ws || ws.length < 4 || t === "other") continue;
  const n = Math.max(1, Math.round(ws.length / 10));
  const size = Math.ceil(ws.length / n);
  for (let k = 0; k < n; k++) { const part = ws.slice(k * size, (k + 1) * size); if (part.length >= 4) sets.push({ topic: t, part: n > 1 ? k + 1 : 0, words: part }); }
}
console.log("labelled", Object.keys(label).length, "| other:", (byTopic.other ?? []).length, "| sets:", sets.length, "| cost $" + cost.toFixed(4));
for (const t of TOPICS) if (byTopic[t]) console.log(" ", t, byTopic[t].length, ":", byTopic[t].slice(0, 14).join(", "));
if (name) {
  const out = new URL("./band-sets.json", import.meta.url);
  const prev = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
  prev[name] = sets; writeFileSync(out, JSON.stringify(prev, null, 1)); console.log("written", name);
}
