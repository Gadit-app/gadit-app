// Translate the family email series from the final Hebrew into every UI
// language (Gadi 2026-10-05). Source = each email's effective Hebrew in the
// editor; the site's own button and tab names come from ui-glossary.mjs, so a
// translated email quotes the label exactly as the site shows it.
//
//   node scripts/family-emails/translate.mjs --langs=ar,ru [--keys=fam2-word] [--save] [--with-en]
// Without --save it only writes out/translations.json for review. With --save
// each checked translation is saved as that language's version in the editor.
// ADMIN_SECRET and OPENAI_API_KEY are read from web/.env.local at runtime.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const SECRET = get("ADMIN_SECRET"), KEY = get("OPENAI_API_KEY");
const API = `https://www.gadit.app/api/admin/email-templates?secret=${encodeURIComponent(SECRET)}`;
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const ALL = ["ar","ru","es","pt","fr","de","cs","sk","it","ja","hi","am","uk","tr","pl","fa","id","nl","el","zu","vi","fil","af","sw","zh-CN","zh-TW","ko","th","bn","da","hu"];
const LANGS = arg("langs") ? arg("langs").split(",") : [...(process.argv.includes("--with-en") ? ["en"] : []), ...ALL];
const SAVE = process.argv.includes("--save");
const NAME = new Intl.DisplayNames(["en"], { type: "language" });
const OUT = path.join(HERE, "out");
fs.mkdirSync(OUT, { recursive: true });

// 1. The Hebrew source, straight from the editor.
const list = await (await fetch(API)).json();
const keys = arg("keys") ? arg("keys").split(",") : list.emails.map((e) => e.key);
const he = {};
for (const k of keys) he[k] = (await (await fetch(`${API}&key=${k}`)).json()).he.content;
fs.writeFileSync(path.join(OUT, "he-source.json"), JSON.stringify(he, null, 1));

// 2. The site's UI labels in every language.
execFileSync(process.execPath, [path.join(HERE, "ui-glossary.mjs"), path.join(OUT, "he-source.json"), path.join(OUT, "glossary.json")], { stdio: "inherit" });
const glossary = JSON.parse(fs.readFileSync(path.join(OUT, "glossary.json"), "utf8"));

const FIELDS = ["subject", "body", "ctaText", "next", "closing", "signature", "helpText"];
const SYS = `You localize the onboarding emails of Gadit, a family vocabulary app for children, from Hebrew. Write as a native speaker writing to parents: warm, plain, short sentences, natural rather than literal. The emails speak as the team ("we"), never "I".
Hard rules:
- Keep the markup exactly: "## " headings, numbered steps "1. ", "**bold**", links [text](/path) with the /path unchanged, blank lines between paragraphs, one sentence per line where the source has it.
- "{שם}" becomes "{name}".
- Gadit stays in Latin letters. Never write the word AI or artificial intelligence.
- No long dashes (no — or –). Use commas or periods.
- When the source quotes a button, tab or screen name, use the exact label from the glossary for that language. Labels not in the glossary: translate naturally.
- Examples of Hebrew words with several meanings (like a word in a tip) must be replaced by a natural example in the target language that shows the same idea, not translated word by word.
Return JSON only, with the same fields as the input.`;

function check(src, t, lang) {
  const errs = [];
  for (const f of FIELDS) if (typeof src[f] === "string" && src[f].trim() && !(typeof t[f] === "string" && t[f].trim())) errs.push(`missing ${f}`);
  const all = FIELDS.map((f) => t[f] ?? "").join("\n");
  if (/[֐-׿]/.test(all)) errs.push("hebrew letters left");
  if (/[—–]/.test(all)) errs.push("long dash");
  if (/\{שם\}/.test(src.subject + src.body) && !/\{name\}/.test((t.subject ?? "") + (t.body ?? ""))) errs.push("{name} missing");
  const links = (s) => [...(s ?? "").matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]).sort().join(" ");
  if (links(src.body) !== links(t.body)) errs.push("links changed");
  const count = (s, re) => ((s ?? "").match(re) ?? []).length;
  if (count(src.body, /^## /gm) !== count(t.body, /^## /gm)) errs.push("headings changed");
  if (count(src.body, /^\s*\d+\.\s/gm) !== count(t.body, /^\s*\d+\.\s/gm)) errs.push("steps changed");
  if (!/Gadit/.test(t.signature ?? "Gadit")) errs.push("signature without Gadit");
  return errs;
}

async function translate(key, lang) {
  const src = he[key];
  const g = Object.fromEntries(Object.entries(glossary).filter(([, v]) => v[lang]).map(([k, v]) => [k, v[lang]]));
  const input = Object.fromEntries(FIELDS.filter((f) => typeof src[f] === "string").map((f) => [f, src[f]]));
  let last = [];
  for (let a = 0; a < 3; a++) {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: "gpt-5.4", reasoning_effort: "low", response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: `Target language: ${NAME.of(lang)} (${lang}), in its own script.\nGlossary of the site's labels in ${NAME.of(lang)} (Hebrew label → label on the site):\n${JSON.stringify(g, null, 0)}\n${last.length ? `Your previous answer failed these checks, fix them: ${last.join("; ")}\n` : ""}\nEmail (JSON):\n${JSON.stringify(input)}` },
        ],
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(`${key}/${lang}: ${JSON.stringify(j).slice(0, 200)}`);
    const t = JSON.parse(j.choices[0].message.content);
    last = check(src, t, lang);
    if (!last.length) return { ...t, heading: "" };
  }
  throw new Error(`${key}/${lang}: ${last.join("; ")}`);
}

const out = fs.existsSync(path.join(OUT, "translations.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "translations.json"), "utf8")) : {};
const jobs = keys.flatMap((k) => LANGS.map((l) => [k, l]));
let done = 0, failed = [];
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < jobs.length) {
    const [k, l] = jobs[i++];
    try {
      const t = await translate(k, l);
      (out[k] ||= {})[l] = t;
      if (SAVE) {
        const r = await (await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", key: k, lang: l, content: t }) })).json();
        if (!r.saved) throw new Error(`${k}/${l}: save failed`);
      }
      done++;
    } catch (e) { failed.push(String(e.message ?? e)); }
    if ((done + failed.length) % 20 === 0) console.log("progress", done, "ok", failed.length, "failed");
  }
}));
fs.writeFileSync(path.join(OUT, "translations.json"), JSON.stringify(out, null, 1));
console.log(`done ${done}, failed ${failed.length}${SAVE ? ", saved to the editor" : " (dry run, nothing saved)"}`);
if (failed.length) console.log(failed.join("\n"));
