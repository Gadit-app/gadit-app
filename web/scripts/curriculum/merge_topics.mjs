// Step B: per (subject, level) merge duplicate topics across sources.
// Output: merged.json { subjects:[{key,name,category,stream,levels:{<level>:[{title,grades,sources:[...],official}]}}] }
import fs from "fs";
const HERE = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(HERE + "../../.env.local", "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1].trim().replace(/^["']|["']$/g, "");
const recs = JSON.parse(fs.readFileSync(HERE + "records.json", "utf8"));
const canon = JSON.parse(fs.readFileSync(HERE + "canon2.json", "utf8"));
const OUT = HERE + "merged.json";
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const groups = {};
for (const r of recs) {
  const k = canon.alias[r.subject];
  if (!k) continue;
  (groups[`${k}|${r.level}`] ||= []).push(r);
}
const subj = Object.fromEntries(canon.subjects.map((s) => [s.key, s]));
let cost = 0;
async function run(gk) {
  if (done[gk]) return;
  const [key, level] = gk.split("|");
  const s = subj[key];
  const lines = groups[gk].map((r, i) => `${i + 1}. [${r.ai}${r.official ? ", רשמי" : ""}] ${r.title} (${r.grades})`).join("\n");
  const user = `מקצוע: ${s.name}. שכבה: ${level}.
אלה נושאים שאספנו מכמה מקורות (בסוגריים המרובעים: שם המקור, ו"רשמי" אם יש קישור לתוכנית לימודים רשמית; בסוף: הכיתות):
${lines}

בנה רשימה נקייה של יחידות לימוד במקצוע הזה בשכבה הזו, כדי לבנות לכל אחת קבוצת מילות מפתח.
כללים:
- מזג נושאים כפולים או כמעט כפולים לנושא אחד.
- העדף יחידות הוראה ספציפיות. נושא כללי שמכסה נושאים ספציפיים שכבר ברשימה, השמט אותו.
- השמט פריטים שאינם תוכן לימודי עם אוצר מילים, כמו "מבחן בעל פה", "פרויקט גמר", "בגרות", "תיק עבודות", "עבודת חקר", אלא אם יש בהם תוכן ממשי.
- שם הנושא בעברית תקנית, קצר וברור למורה (עד 60 תווים), בלי מקפים ארוכים.
- grades: טווח הכיתות המקובל (למשל "ג-ד"), בשכבת גן כתוב "גן".
- sources: רשימת שמות המקורות (כפי שמופיעים בסוגריים) שהזכירו את הנושא או נושא שמוזג לתוכו. official: true אם אחד מהם סומן "רשמי".
- סדר את הנושאים לפי סדר ההוראה המקובל (מהכיתה הנמוכה לגבוהה).
החזר JSON בלבד: {"topics":[{"title":"","grades":"","sources":[""],"official":false}]}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0.1, response_format: { type: "json_object" }, messages: [{ role: "system", content: "אתה מומחה לתוכניות הלימודים של משרד החינוך בישראל. החזר JSON בלבד." }, { role: "user", content: user }] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 200));
      cost += (j.usage.prompt_tokens * 2.5 + j.usage.completion_tokens * 10) / 1e6;
      done[gk] = JSON.parse(j.choices[0].message.content).topics || [];
      return;
    } catch (e) { if (attempt === 2) console.log("FAIL", gk, String(e).slice(0, 120)); }
  }
}
const keys = Object.keys(groups);
let i = 0, n = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < keys.length) { const k = keys[i++]; await run(k); if (++n % 20 === 0) { fs.writeFileSync(OUT, JSON.stringify(done)); console.log(n, "/", keys.length); } }
}));
fs.writeFileSync(OUT, JSON.stringify(done));
const total = Object.values(done).reduce((a, t) => a + t.length, 0);
console.log("groups", Object.keys(done).length, "/", keys.length, "topics", total, "cost $", cost.toFixed(2));
