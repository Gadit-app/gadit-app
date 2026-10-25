// Translates walkthrough text (src/lib/guide-i18n.ts, en + he written by hand)
// into every other UI language and rewrites src/lib/guide-i18n-translations.ts.
// Translates keys missing from a language, plus any keys passed on the command
// line (English text changed); drops keys that no longer exist in English.
//   node scripts/guide-i18n-translate.mjs [changedKey ...]
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SRC = path.join(HERE, "../src/lib/guide-i18n.ts");
const OUT = path.join(HERE, "../src/lib/guide-i18n-translations.ts");

// English source: every `"key": { en: "...", ... }` entry in G.
const src = fs.readFileSync(SRC, "utf8");
const EN = {};
for (const m of src.matchAll(/^\s+"([\w.-]+)": \{ en: "((?:[^"\\]|\\.)*)"/gm)) EN[m[1]] = JSON.parse(`"${m[2]}"`);

const trSrc = fs.readFileSync(OUT, "utf8");
const at = trSrc.indexOf("= {");
const head = trSrc.slice(0, at + 3);
const TR = JSON.parse(trSrc.slice(at + 2).trim().replace(/;\s*$/, "").replace(/,(\s*[}\]])/g, "$1"));

const LANGS = { ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian", xh: "Xhosa", nso: "Sepedi (Northern Sotho)", tn: "Setswana", st: "Sesotho", ts: "Xitsonga", ss: "siSwati", ve: "Tshivenda", nr: "isiNdebele (South Ndebele)" };
const changed = new Set(process.argv.slice(2));
const vars = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
function bad(k, t) {
  if (typeof t !== "string" || !t.trim()) return "empty";
  if (vars(t) !== vars(EN[k])) return "placeholders";
  if (/[–—]/.test(t)) return "long dash";
  if (/[֐-׿]/.test(t)) return "hebrew letters";
  for (const brand of ["Gadit", "Individual", "Family", "Basic"]) if (EN[k].includes(brand) && !t.includes(brand)) return `lost ${brand}`;
  return null;
}
async function one(code, name) {
  const cur = TR[code] ?? {};
  for (const k of Object.keys(cur)) if (!(k in EN)) delete cur[k];
  const todo = Object.keys(EN).filter((k) => !cur[k] || changed.has(k));
  TR[code] = cur;
  if (!todo.length) return console.log(code, "nothing to do");
  // Context for consistency: the current translations of the app's own labels.
  const glossary = Object.fromEntries(Object.entries(cur).filter(([k]) => k.startsWith("ui.")).slice(0, 60));
  const items = Object.fromEntries(todo.map((k) => [k, EN[k]]));
  const user = `Translate these strings of the in-app guides of Gadit (a vocabulary app for families and learners) from English into ${name} (${code}). Keys starting with "ui." are labels shown inside a picture of the app screen; the rest are short captions and titles. Keep {placeholders} exactly. Keep Gadit, Individual, Family, Basic and Schools in Latin letters. No long dashes. Address the reader the way app guides do in ${name}. Natural and short, like a native product writer. Use the same wording as these existing labels when a string refers to them: ${JSON.stringify(glossary)}
Return JSON with the same keys, each value a plain string.

${JSON.stringify(items, null, 1)}`;
  for (let a = 0; a < 3; a++) {
    try {
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 120000);
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a professional software localizer. Return JSON only." }, { role: "user", content: user }] }),
      });
      clearTimeout(timer);
      const j = await r.json();
      const o = JSON.parse(j.choices[0].message.content);
      const errs = todo.map((k) => [k, bad(k, o[k])]).filter(([, e]) => e);
      if (errs.length) { console.log(code, "retry", JSON.stringify(errs).slice(0, 200)); continue; }
      for (const k of todo) cur[k] = o[k];
      return console.log(code, `ok (${todo.length})`);
    } catch (e) { console.log(code, "error", String(e).slice(0, 100)); }
  }
  console.log(code, "FAILED");
}
const entries = Object.entries(LANGS);
for (let i = 0; i < entries.length; i += 8) await Promise.all(entries.slice(i, i + 8).map(([c, n]) => one(c, n)));
const body = Object.entries(TR).map(([lang, o]) => `  ${JSON.stringify(lang)}: ${JSON.stringify(o, null, 1).replace(/\n/g, "\n ")},`).join("\n");
fs.writeFileSync(OUT, `${head}\n${body}\n};\n`);
console.log("written");
