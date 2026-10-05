// Translates the class-dictionary chip, the milestone overlay and the rank
// names into every UI language (Gadi 2026-10-06: a student who picks Russian
// saw "Your class: 501 words" in English). Writes src/lib/class-milestones-i18n.json.
//   node scripts/class-milestones-i18n.mjs
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const LANGS = { ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian" };
const SRC = {
  labelClass: "Your class", labelSchool: "Your school",
  words: "{n} words", toNext: "{n} more to the next rank",
  wowClass: "Wow! Your class reached a new rank!", wowSchool: "Wow! Your school reached a new rank!",
  reached: "{n} different words", rank: "New rank: {name}", tell: "Tell the whole class 🎉", close: "Continue",
  ranks: ["First Steps", "The 100 Club", "Word Explorers", "Word Builders", "Curiosity Champions", "The 500 Club", "Word Architects", "The 1,000 Club", "Word Hunters", "Word Keepers", "World Discoverers", "Word Masters", "Word Lighthouse", "The 3,000 Club", "Treasure Keepers", "Word Giants", "Language Stars", "Word Legends"],
};
const OUT = path.join(HERE, "../src/lib/class-milestones-i18n.json");
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

function valid(o) {
  const keys = Object.keys(SRC);
  if (!o || keys.some((k) => !(k in o))) return "missing key";
  for (const k of ["words", "toNext", "reached"]) if (!String(o[k]).includes("{n}")) return `${k} lost {n}`;
  if (!String(o.rank).includes("{name}")) return "rank lost {name}";
  if (!Array.isArray(o.ranks) || o.ranks.length !== 18) return "ranks length";
  if (JSON.stringify(o).match(/[–—]/)) return "long dash";
  if (/[֐-׿]/.test(JSON.stringify(o))) return "hebrew letters";
  return null;
}
for (const [code, name] of Object.entries(LANGS)) {
  if (out[code] && !valid(out[code])) continue;
  const user = `Translate this JSON for a children's classroom vocabulary app into ${name} (${code}). It addresses the whole class (plural "you"). Keep the placeholders {n} and {name} exactly. Keep the emoji. Rank names are short, warm, kid-friendly titles a class earns (keep the numbers in "The 100 Club" style names). No long dashes. Return the same JSON keys.\n\n${JSON.stringify(SRC)}`;
  let ok = false;
  for (let a = 0; a < 3 && !ok; a++) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a professional localizer for a children's education product. Return JSON only." }, { role: "user", content: user }] }),
    });
    const j = await r.json();
    try {
      const o = JSON.parse(j.choices[0].message.content);
      const bad = valid(o);
      if (bad) { console.log(code, "retry:", bad); continue; }
      out[code] = o; ok = true;
    } catch (e) { console.log(code, "error", String(e).slice(0, 100), JSON.stringify(j).slice(0, 120)); }
  }
  console.log(code, ok ? "ok" : "FAILED", ok ? out[code].toNext : "");
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
