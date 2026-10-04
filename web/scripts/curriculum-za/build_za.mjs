// Step B (South Africa): per (subject, grade), merge the extracted CAPS topics
// into clean units and give each unit 8-12 key words with a simple in-lesson
// definition, grounded in the concepts the CAPS text lists.
// Output: units-merged.json {"<subjectKey>|<grade>": [{topic, term, strand, words:[{w,d}]}]}
import fs from "fs";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const raw = Object.values(JSON.parse(fs.readFileSync(HERE + "units.json", "utf8"))).flat();
// CAPS subject -> catalog subject key (keys shared with the Hebrew catalog keep its icons)
function subjectKey(u) {
  const s = u.subject, st = (u.strand || "").toLowerCase();
  if (s.startsWith("Social Sciences")) return /geog/.test(st) || /geog/i.test(u.topic) ? "geography" : "history";
  return {
    "Mathematics": "mathematics",
    "Natural Sciences and Technology": "natural-sciences-technology",
    "Natural Sciences": "natural-sciences",
    "Technology": "technology",
    "Economic and Management Sciences": "economic-management-sciences",
    "Life Skills": "life-skills",
    "Life Orientation": "life-orientation",
    "Creative Arts": "creative-arts",
    "English Home Language": "english-home-language",
  }[s];
}
const groups = {};
for (const u of raw) {
  const g = Number(u.grade);
  if (!(g >= 4 && g <= 9) || !u.topic) continue;
  const k = subjectKey(u);
  if (!k) continue;
  (groups[`${k}|${g}`] ||= []).push(u);
}
const OUT = HERE + "units-merged.json";
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
let cost = 0;
async function run(gk) {
  if (done[gk]) return;
  const [key, grade] = gk.split("|");
  const list = groups[gk].map((u, i) => `${i + 1}. [term ${u.term ?? "?"}] ${u.strand ? u.strand + " / " : ""}${u.topic}: ${(u.concepts || []).join(", ")}`).join("\n");
  const user = `South African CAPS, ${groups[gk][0].subject}, Grade ${grade}. These topics were extracted from the official CAPS document (term, strand / topic: the concepts the CAPS text lists):
${list}

Build the clean list of teaching units for this subject in Grade ${grade}, so a teacher can project each unit's key words to the class.
Rules:
- Merge duplicates and near-duplicates into one unit. Keep the CAPS topic names (short, as teachers know them), in teaching order (term 1 to 4).
- Drop items that are not taught content (assessment tasks, projects with no content, skills lists).
- For each unit choose 8 to 12 KEY WORDS a Grade ${grade} learner must understand in that unit. Prefer the concepts CAPS lists; add a missing core term only when the unit clearly needs it. Single words or short terms, singular, lowercase unless a proper noun.
- For each key word write ONE definition (one or two short sentences, max 160 characters) of its meaning IN THIS UNIT, in simple English a Grade ${grade} learner in South Africa understands. No long dashes.
Return JSON only: {"units":[{"topic":"","term":1,"strand":"","words":[{"w":"","d":""}]}]}`;
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0.2, response_format: { type: "json_object" }, messages: [
          { role: "system", content: "You are an expert South African CAPS curriculum teacher who writes classroom vocabulary. Return JSON only." },
          { role: "user", content: user }] }),
      });
      const k = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(k).slice(0, 200));
      cost += (k.usage.prompt_tokens * 2.5 + k.usage.completion_tokens * 10) / 1e6;
      done[gk] = JSON.parse(k.choices[0].message.content).units || [];
      return;
    } catch (e) { if (a === 2) console.log("FAIL", gk, String(e).slice(0, 120)); }
  }
}
const keys = Object.keys(groups);
let i = 0, n = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < keys.length) { await run(keys[i++]); if (++n % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(done)); console.log(n, "/", keys.length); } }
}));
fs.writeFileSync(OUT, JSON.stringify(done));
const units = Object.values(done).flat();
console.log("groups", Object.keys(done).length, "units", units.length, "words", units.reduce((a, u) => a + (u.words || []).length, 0), "cost $", cost.toFixed(2));
