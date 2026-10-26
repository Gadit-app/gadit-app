// Some generated German came back with ae/oe/ue instead of ä/ö/ü ("Brueche").
// Send only those topics back to restore the umlauts, changing nothing else.
//   node scripts/curriculum-de/fix_umlauts.mjs
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const LIB = path.join(HERE, "../../src/lib/");
const cat = JSON.parse(fs.readFileSync(LIB + "curriculum-catalog-de.json", "utf8"));
const sets = JSON.parse(fs.readFileSync(LIB + "curriculum-sets-de.json", "utf8"));
const suspect = (x) => /ae|oe|ue/i.test(x);
const usage = { in: 0, out: 0 };
const topics = Object.values(cat.topics).filter((t) => suspect(t.t) || sets[t.id].words.some(suspect) || Object.values(sets[t.id].defs).some(suspect));
console.log("topics to check:", topics.length);
for (const t of topics) {
  const s = sets[t.id];
  const item = { title: t.t, words: s.words.map((w) => ({ w, d: s.defs[w] })) };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [
      { role: "system", content: "You correct German spelling. Return JSON only." },
      { role: "user", content: `Some words below wrongly use ae, oe or ue in place of the umlauts ä, ö, ü (for example "Brueche" should be "Brüche", "Verhaeltnis" should be "Verhältnis"). Restore the umlauts ONLY where German spelling requires them. Keep words where ue/ae/oe is correct (Feuer, Quelle, aktuell, Poesie, Mauer, neue). Keep "ss" (Swiss spelling, never ß). Change nothing else at all: same words, same order, same punctuation. Return the same JSON shape.\n\n${JSON.stringify(item)}` },
    ] }),
  });
  const j = await r.json();
  usage.in += j.usage?.prompt_tokens ?? 0; usage.out += j.usage?.completion_tokens ?? 0;
  const o = JSON.parse(j.choices[0].message.content);
  if (!o.title || !Array.isArray(o.words) || o.words.length !== s.words.length) { console.log("skip (shape)", t.t); continue; }
  const strip = (x) => String(x).replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");
  // Safety: only umlaut changes are accepted, letter for letter.
  const same = (a, b) => strip(a) === strip(b);
  if (!same(o.title, t.t) || o.words.some((x, i) => !same(x.w, item.words[i].w) || !same(x.d, item.words[i].d))) { console.log("skip (changed more than umlauts)", t.t); continue; }
  const words = o.words.map((x) => x.w.replace(/ß/g, "ss"));
  sets[t.id] = { words, defs: Object.fromEntries(o.words.map((x) => [x.w.replace(/ß/g, "ss"), x.d.replace(/ß/g, "ss")])) };
  if (o.title !== t.t) console.log(t.t, "->", o.title);
  t.t = o.title.replace(/ß/g, "ss");
}
fs.writeFileSync(LIB + "curriculum-catalog-de.json", JSON.stringify(cat, null, 1));
fs.writeFileSync(LIB + "curriculum-sets-de.json", JSON.stringify(sets, null, 1));
console.log("cost $" + ((usage.in * 2.5 + usage.out * 15) / 1e6).toFixed(3));
