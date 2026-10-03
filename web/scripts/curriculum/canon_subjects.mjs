// Step A: map the 227 raw subject names to canonical subjects + categories.
import fs from "fs";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const recs = JSON.parse(fs.readFileSync(HERE + "records.json", "utf8"));
const count = {};
for (const r of recs) count[r.subject] = (count[r.subject] || 0) + 1;
const names = Object.keys(count).sort();
const sys = "You organize the Israeli school curriculum (Hebrew-language state and state-religious systems) for a vocabulary app. Hebrew output, standard spelling, no long dashes. Return JSON only.";
const user = `Here are ${names.length} raw subject names collected from several sources (with how many topic records each has):
${names.map((n) => `${n} (${count[n]})`).join("\n")}

Build a clean canonical list of school SUBJECTS. Rules:
- Merge synonyms and spelling variants (גאוגרפיה/גיאוגרפיה, "X מוגבר", "X לבגרות", "X (מגמה)") into one subject.
- Keep separate subjects only where the curriculum truly differs by stream: e.g. "תנ"ך" and "תנ"ך (ממ"ד)" may stay separate; "היסטוריה" and "היסטוריה (ממ"ד)" may stay separate. Do not split otherwise.
- Merge umbrella names into their real subject (e.g. "מדעי החברה" topics go to פסיכולוגיה/סוציולוגיה/כלכלה, use the closest single subject).
- Drop names that are not subjects (summaries, notes).
- Assign every canonical subject one CATEGORY from exactly this list: "שפה וספרות", "שפות זרות", "מתמטיקה", "מדעים", "יהדות ומורשת", "היסטוריה, חברה ואזרחות", "גאוגרפיה וסביבה", "מדעי החברה", "מחשבים וטכנולוגיה", "הנדסה ומגמות טכנולוגיות", "מגמות מקצועיות", "אמנויות", "גוף, בריאות וכישורי חיים", "גיל הרך".
- Give each subject a short english kebab "key", the Hebrew "name" as teachers say it, "stream": "שניהם" | "ממלכתי" | "ממ\"ד", and "aliases": the exact raw names (from the list above) that map to it. Every raw name must appear in exactly one subject's aliases, or in "dropped".

Return: {"subjects":[{"key":"","name":"","category":"","stream":"","aliases":[""]}],"dropped":[""]}`;
const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ model: "gpt-4o", temperature: 0.1, response_format: { type: "json_object" }, messages: [{ role: "system", content: sys }, { role: "user", content: user }] }),
});
const j = await r.json();
if (!r.ok) { console.log(JSON.stringify(j).slice(0, 400)); process.exit(1); }
const out = JSON.parse(j.choices[0].message.content);
const mapped = new Set(out.subjects.flatMap((s) => s.aliases).concat(out.dropped || []));
const missing = names.filter((n) => !mapped.has(n));
fs.writeFileSync(HERE + "canon.json", JSON.stringify(out, null, 1));
console.log("canonical", out.subjects.length, "dropped", (out.dropped || []).length, "unmapped", missing.length, missing.slice(0, 30));
console.log("cost $", ((j.usage.prompt_tokens * 2.5 + j.usage.completion_tokens * 10) / 1e6).toFixed(3));
const byCat = {};
for (const s of out.subjects) (byCat[s.category] ||= []).push(s.name);
for (const [c, v] of Object.entries(byCat)) console.log(c, "|", v.length, "|", v.join(", "));
