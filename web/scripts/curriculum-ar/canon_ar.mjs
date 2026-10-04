// Step B (Arabic): map the raw subject names to canonical subjects, reusing
// the Hebrew catalog's subject keys wherever it is the same subject (so the
// icons and the shared structure carry over). Output: canon.json
import fs from "fs";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const recs = JSON.parse(fs.readFileSync(HERE + "records.json", "utf8"));
const he = JSON.parse(fs.readFileSync(HERE + "../../src/lib/curriculum-catalog.json", "utf8"));
const count = {};
for (const r of recs) {
  const k = `${r.subject_he} | ${r.subject_ar}`;
  count[k] = (count[k] || 0) + 1;
}
const raw = Object.keys(count).sort();
const existing = he.subjects.map((s) => `${s.key}: ${s.he} [${s.cat}]`).join("\n");
const cats = he.categories.map((c) => `${c.key}: ${c.he}`).join("\n");
const user = `Raw subject names collected for the ARAB STATE education system in Israel ("Hebrew name | Arabic name" and how many topic records each has):
${raw.map((n) => `${n} (${count[n]})`).join("\n")}

The existing Hebrew-system catalog subjects (key: Hebrew name [category key]):
${existing}

Categories (key: Hebrew name):
${cats}

Build the canonical subject list for the Arab state system:
- Merge synonyms and variants into one subject ("שפה ערבית", "ערבית", "ערבית שפת אם" are one subject; "אמנויות", "אמנות חזותית" one subject).
- When a subject is the same as an existing Hebrew-system subject (mathematics, english, biology, physics, chemistry, geography, civics, computer science, biotechnology, music, PE...), reuse its EXACT key and category.
- Subjects unique to Arab education get a new english kebab key: arabic-language (Arabic as mother tongue, language and literature), hebrew-second-language, islam, christianity, history-arab (history as taught in Arab education), and others as needed. Unique religion subjects use a new category key "religion" (name "דת ומורשת"). Arabic language goes in category "language", Hebrew as a second language in "foreign-languages".
- "Hebrew" in Arab schools is ALWAYS Hebrew as a second language, never the Hebrew-system "hebrew" subject.
- Drop names that are not subjects (summaries, notes).
- For every subject give: key, name_he (as teachers say it in Hebrew), name_ar (as it appears in Arab-sector curricula, standard Arabic), category, reuse (true if the key is an existing Hebrew-system key), aliases (the exact raw "Hebrew | Arabic" strings from the list above). Every raw name must appear in exactly one subject's aliases or in "dropped".

Return JSON only: {"subjects":[{"key":"","name_he":"","name_ar":"","category":"","reuse":true,"aliases":[""]}],"dropped":[""]}`;
const r = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ model: "gpt-4o", temperature: 0.1, response_format: { type: "json_object" }, messages: [
    { role: "system", content: "You organize the Israeli school curriculum for a vocabulary app. Hebrew and Arabic output in standard spelling, no long dashes. Return JSON only." },
    { role: "user", content: user }] }),
});
const j = await r.json();
if (!r.ok) { console.log(JSON.stringify(j).slice(0, 400)); process.exit(1); }
const out = JSON.parse(j.choices[0].message.content);
const mapped = new Set(out.subjects.flatMap((s) => s.aliases).concat(out.dropped || []));
const missing = raw.filter((n) => !mapped.has(n));
fs.writeFileSync(HERE + "canon.json", JSON.stringify(out, null, 1));
console.log("canonical", out.subjects.length, "reuse", out.subjects.filter((s) => s.reuse).length, "dropped", (out.dropped || []).length, "unmapped", missing.length, missing);
console.log("cost $", ((j.usage.prompt_tokens * 2.5 + j.usage.completion_tokens * 10) / 1e6).toFixed(3));
for (const s of out.subjects) console.log(s.key, "|", s.name_he, "|", s.name_ar, "|", s.category, s.reuse ? "" : "NEW");
