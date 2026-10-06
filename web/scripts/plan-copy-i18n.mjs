// Translates PLAN_COPY (src/lib/plan-copy.ts, en + he written by hand) into
// every other UI language and writes src/lib/plan-copy-i18n.json. Only keys
// missing from a language (or changed in English, tracked by a hash) are
// translated again. Gadi 2026-10-06.
//   node scripts/plan-copy-i18n.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { featureNames } from "./ui-feature-names.mjs";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const src = fs.readFileSync(path.join(HERE, "../src/lib/plan-copy.ts"), "utf8").replace(/\r\n/g, "\n");
// Pull the en / he object literals out of the TS file.
function block(name) {
  const m = src.match(new RegExp(`\\n  ${name}: \\{([\\s\\S]*?)\\n  \\},`));
  const out = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^\s+(\w+): "((?:[^"\\]|\\.)*)",?$/);
    if (mm) out[mm[1]] = JSON.parse(`"${mm[2]}"`);
  }
  return out;
}
const EN = block("en");
const HE = block("he");
const LANGS = { ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French", de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian" };
const OUT = path.join(HERE, "../src/lib/plan-copy-i18n.json");
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
out._hash = out._hash ?? {};

const vars = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
function bad(k, t) {
  if (typeof t !== "string" || !t.trim()) return "empty";
  if (vars(t) !== vars(EN[k])) return "placeholders";
  if (/[–—]/.test(t)) return "long dash";
  if (/[֐-׿]/.test(t)) return "hebrew letters";
  for (const brand of ["Gadit", "Individual", "Family", "Basic"]) if (EN[k].includes(brand) && !t.includes(brand)) return `lost ${brand}`;
  return null;
}

for (const [code, name] of Object.entries(LANGS)) {
  const cur = out[code] ?? {};
  const todo = Object.keys(EN).filter((k) => !cur[k] || out._hash[k] !== hash(EN[k]));
  if (!todo.length) continue;
  const items = Object.fromEntries(todo.map((k) => [k, EN[k]]));
  const user = `Translate these short UI strings of Gadit (a vocabulary app for families and learners) from English into ${name} (${code}). Keep {placeholders} exactly. Keep the plan names Gadit, Individual, Family, Basic, Schools in Latin letters, never translated. The app's own feature names in ${name} are listed below: whenever a string mentions one of these features, use exactly that name (Kids Mode is the mode behind the switch named there; write it naturally, e.g. the word for kids plus the word for mode). Address the user in the friendly singular form that app UIs use in ${name}. No long dashes. Natural and short, the way a native product writer would put it. Return JSON with the same keys, each value a plain translated string.

Feature names: ${JSON.stringify(featureNames(code))}

Strings:
${JSON.stringify(items, null, 1)}`;
  let done = false;
  for (let a = 0; a < 3 && !done; a++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a professional software localizer. Return JSON only." }, { role: "user", content: user }] }),
      });
      const j = await r.json();
      const o = JSON.parse(j.choices[0].message.content);
      const errs = todo.map((k) => [k, bad(k, o[k])]).filter(([, e]) => e);
      if (errs.length) { console.log(code, "retry", JSON.stringify(errs)); continue; }
      for (const k of todo) cur[k] = o[k];
      out[code] = cur; done = true;
    } catch (e) { console.log(code, "error", String(e).slice(0, 120)); }
  }
  console.log(code, done ? `ok (${todo.length})` : "FAILED");
}
for (const k of Object.keys(EN)) out._hash[k] = hash(EN[k]);
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
