// Step A (South Africa): read the official CAPS documents (grades 4-9) and
// extract every teaching topic with grade, term and the key concepts the
// document itself lists. Output: units.json [{doc, subject, grade, term, strand, topic, concepts[]}]
import fs from "fs";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const DOCS = {
  "ip-mathematics": ["Mathematics", "4-6"],
  "ip-natural-sciences-technology": ["Natural Sciences and Technology", "4-6"],
  "ip-social-sciences": ["Social Sciences (History and Geography)", "4-6"],
  "ip-life-skills": ["Life Skills", "4-6"],
  "ip-english-hl": ["English Home Language", "4-6"],
  "sp-mathematics": ["Mathematics", "7-9"],
  "sp-natural-sciences": ["Natural Sciences", "7-9"],
  "sp-social-sciences": ["Social Sciences (History and Geography)", "7-9"],
  "sp-technology": ["Technology", "7-9"],
  "sp-ems": ["Economic and Management Sciences", "7-9"],
  "sp-life-orientation": ["Life Orientation", "7-9"],
  "sp-creative-arts": ["Creative Arts", "7-9"],
  "sp-english-hl": ["English Home Language", "7-9"],
};
const OUT = HERE + "units.json";
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const CHUNK = 45000;
const jobs = [];
for (const [doc, [subject, grades]] of Object.entries(DOCS)) {
  const t = fs.readFileSync(HERE + `caps/${doc}.raw.txt`, "utf8").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  for (let i = 0, n = 0; i < t.length; i += CHUNK, n++) jobs.push({ doc, subject, grades, part: n, text: t.slice(i, i + CHUNK + 1500) });
}
let cost = 0;
async function run(j) {
  const id = `${j.doc}#${j.part}`;
  if (done[id]) return;
  const user = `This is part ${j.part + 1} of the official South African CAPS document for ${j.subject}, Grades ${j.grades}.

Extract every TEACHING TOPIC that this part describes as content to teach in a specific grade (the content / teaching plan section: "Topic", "Content & Concepts", term plans). Ignore general aims, skills lists, assessment rules, resources lists and introductions.
For each topic return:
- grade: the grade number (4-9) the topic is taught in
- term: 1-4 if stated, else null
- strand: the strand / content area if stated (e.g. "Life and Living", "Numbers, Operations and Relationships", "History", "Geography"), else ""
- topic: the topic title as written in CAPS (short)
- concepts: up to 15 key subject words or terms that the content text for this topic actually mentions and a learner must understand (exact words from the text, singular, no sentences)
If a topic repeats across grades, return it once per grade. If this part has no teaching content, return an empty list.
Return JSON only: {"units":[{"grade":4,"term":1,"strand":"","topic":"","concepts":[""]}]}

TEXT:
${j.text}`;
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0, response_format: { type: "json_object" }, messages: [
          { role: "system", content: "You extract curriculum structure from official South African CAPS documents. Use only what the text says. Return JSON only." },
          { role: "user", content: user }] }),
      });
      const k = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(k).slice(0, 200));
      cost += (k.usage.prompt_tokens * 2.5 + k.usage.completion_tokens * 10) / 1e6;
      done[id] = (JSON.parse(k.choices[0].message.content).units || []).map((u) => ({ doc: j.doc, subject: j.subject, ...u }));
      return;
    } catch (e) { if (a === 2) console.log("FAIL", id, String(e).slice(0, 120)); }
  }
}
let i = 0, n = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < jobs.length) { await run(jobs[i++]); if (++n % 10 === 0) { fs.writeFileSync(OUT, JSON.stringify(done)); console.log(n, "/", jobs.length); } }
}));
fs.writeFileSync(OUT, JSON.stringify(done));
const all = Object.values(done).flat();
console.log("chunks", Object.keys(done).length, "/", jobs.length, "units", all.length, "cost $", cost.toFixed(2));
