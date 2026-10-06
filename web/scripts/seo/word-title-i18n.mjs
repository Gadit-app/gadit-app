// Translate the word-page title templates (lib/word-title.ts) into the other
// UI languages, and print 3 sample titles per language for Gadi's review.
//   node scripts/seo/word-title-i18n.mjs        -> writes src/lib/word-title-i18n.json + samples
// Nothing goes live from here: lib/word-title.ts uses a language only after it
// is added to its approved list.
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const OUT = path.join(HERE, "../../src/lib/word-title-i18n.json");

const LANGS = {
  ar: "Arabic", ru: "Russian", pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak",
  it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish",
  fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino",
  af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", ko: "Korean",
  th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

const SOURCE = {
  same: ["{w}: meaning, definitions and examples", "{w}: meaning and definitions", "{w}: definitions"],
  foreign: ["{w} in English: {t}, meaning and examples", "{w} in English: {t}, meaning", "{w} in English: {t}"],
};

const SYSTEM = `You localize search-result title templates for Gadit, a vocabulary app. Translate each template into the target language so it reads naturally as a dictionary page title in that language.
Rules:
- Keep the placeholders {w} (the word) and {t} (its translation) exactly as they are.
- "in English" means "in the language of this page": write "in <target language>" in the target language itself (for German "auf Deutsch", for French "en français", for Swahili "kwa Kiswahili").
- Keep the same structure and the same order of shortening: version 2 drops "examples", version 3 drops "meaning".
- Short, plain words a person types into a search engine. No dashes of any kind, no quotation marks, no "AI".
- Do not add "| Gadit"; it is added later.
Reply as JSON: {"same": [3 strings], "foreign": [3 strings]}.`;

async function translate(langName) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Target language: ${langName}\n${JSON.stringify(SOURCE, null, 1)}` },
      ],
    }),
  });
  const j = await res.json();
  return JSON.parse(j.choices[0].message.content);
}

function valid(t) {
  const ok = (a, needT) =>
    Array.isArray(a) && a.length === 3 &&
    a.every((s) => typeof s === "string" && s.includes("{w}") && (!needT || s.includes("{t}")) && !/[–—]| - |\bAI\b/.test(s));
  return ok(t.same, false) && ok(t.foreign, true);
}

const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
for (const [code, name] of Object.entries(LANGS)) {
  if (out[code] && valid(out[code])) continue;
  let t = null;
  for (let i = 0; i < 3 && !(t && valid(t)); i++) t = await translate(name);
  if (!t || !valid(t)) { console.log(code, "FAILED"); continue; }
  out[code] = { same: t.same, foreign: t.foreign };
  console.log(code, "ok");
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log("written", Object.keys(out).length);
