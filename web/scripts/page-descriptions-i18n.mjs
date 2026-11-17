// Translates the Google descriptions (and the two legal-page titles) of the app
// pages from the approved Hebrew into every other UI language
// (Gadi 2026-11-17, SEO audit; the Hebrew text was approved by the council).
// Source and output: src/lib/page-descriptions-i18n.json, keyed by language.
// Only languages missing a key are sent. Each language gets its own families
// page description as a register sample (tu or polite plural, as the site
// already speaks there). Texts that come back too long get a shortening pass.
//   node scripts/page-descriptions-i18n.mjs        (MAX_BATCHES=1 for a sample)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const OUT = path.join(HERE, "../src/lib/page-descriptions-i18n.json");
const data = JSON.parse(fs.readFileSync(OUT, "utf8"));
const SRC = data.he;
const KEYS = Object.keys(SRC);

const i18n = fs.readFileSync(path.join(HERE, "../src/lib/i18n.ts"), "utf8");
const LANGS = [...i18n.matchAll(/\{\s*code:\s*"([^"]+)",\s*label:\s*"([^"]+)"/g)].map((m) => ({ code: m[1], label: m[2] }));
const fam = fs.readFileSync(path.join(HERE, "../src/app/families/page.tsx"), "utf8");
const famDesc = Object.fromEntries([...fam.matchAll(/^\s*"?([a-zA-Z-]+)"?: \{ title: "[^"]*", description: "([^"]*)" \}/gm)].map((m) => [m[1], m[2]]));

const todo = LANGS.filter((l) => l.code !== "he" && KEYS.some((k) => !data[l.code]?.[k]) && (!process.env.ONLY || process.env.ONLY.split(",").includes(l.code)));
if (!todo.length) {
  console.log("nothing to do");
  process.exit(0);
}

// Dashes, the word AI in the languages we know it in, a Hebrew letter, the
// brand in Hebrew letters.
const FORBIDDEN = /[–—]|\bA\.?I\.?\b|\bIA\b|\bKI\b|\bYZ\b|ИИ|ШІ|الذكاء الاصطناعي|هوش مصنوعی|人工智能|人工知能|인공지능|[Yy]apay [Zz]eka|[Kk]ecerdasan [Bb]uatan|[Kk]ünstliche|[Aa]rtificial|בינה מלאכותית|גדית|[֐-׿]/;
const gaditCount = (s) => (s.match(/Gadit/g) ?? []).length;
const clean = (k, v) => !!v && !FORBIDDEN.test(v) && gaditCount(v) === gaditCount(SRC[k]);
const fits = (k, v) => [...v].length <= (/Title$/.test(k) ? 60 : 175);

async function chat(user) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({
          model: "gpt-5.4",
          reasoning_effort: "low",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You are a professional localizer for a children's education product. Return JSON only." },
            { role: "user", content: user },
          ],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 300));
      return { got: JSON.parse(j.choices?.[0]?.message?.content ?? "{}"), usage: j.usage ?? {} };
    } catch (e) {
      if (attempt >= 3) throw e;
      console.log("retry", attempt, String(e).slice(0, 80));
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

const translatePrompt = (batch) => `These are short texts for the Gadit website (a family vocabulary app: every meaning of a word, examples, origin, Kids Mode, a parent dashboard). Keys ending in "Title" are browser/Google page titles; the others are the Google search descriptions shown under a result.
Translate each Hebrew text into each language below. Rules:
- Keep the meaning and every fact; do not add claims, prices, numbers or features.
- "Gadit" stays exactly "Gadit" in Latin letters, the same number of times as in the Hebrew. Plan names Basic, Individual, Family stay in Latin letters too.
- Never use the words AI or artificial intelligence in any language.
- No em dash or en dash characters.
- Brand voice: the team ("we"), warm, clear, no hype.
- Address the reader the way the sample sentence of that language does (it is our families page description there): same register (informal or polite), natural for that language.
- Descriptions stay short: at most 155 characters, never over 170 (CJK about 80). If the language runs long, choose shorter wording; keep the first sentence whole.
- Titles follow the pattern "<page name>, Gadit", with the comma the language uses (Arabic and Persian "،").
Return JSON: { "<code>": { "<key>": "<text>" } } for exactly these codes and keys.

HEBREW SOURCE:
${JSON.stringify(SRC, null, 1)}

LANGUAGES (code, name, register sample):
${batch.map((l) => `${l.code} (${l.label}): ${famDesc[l.code] ?? "(no sample: use the usual friendly register)"}`).join("\n")}`;

const shortenPrompt = (part) => `Each text below is a Google search description for the Gadit website, in its own language (the id starts with the language code). It is too long. Rewrite each one in the same language to at most 150 characters: shorter wording, the same register, the same facts, the first sentence kept. Keep "Gadit" and the plan names Basic, Individual, Family in Latin letters. No em or en dashes, never the word AI.
Return JSON: { "<id>": "<shorter text>" }.

${JSON.stringify(part, null, 1)}`;

const MAX_BATCHES = Number(process.env.MAX_BATCHES || 99);
let tin = 0, tout = 0, ok = 0;
const tooLong = [];
const bad = [];
const save = () => fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + "\n");

for (let i = 0; i < todo.length && i < MAX_BATCHES; i += 1) {
  const batch = todo.slice(i, i + 1);
  const { got, usage } = await chat(translatePrompt(batch));
  tin += usage.prompt_tokens ?? 0;
  tout += usage.completion_tokens ?? 0;
  for (const l of batch) {
    const row = { ...(data[l.code] ?? {}) };
    for (const k of KEYS) {
      if (row[k]) continue;
      const v = String(got[l.code]?.[k] ?? "").trim();
      if (!clean(k, v)) bad.push(`${l.code}.${k}: ${v}`);
      else if (!fits(k, v)) tooLong.push({ id: `${l.code}.${k}`, text: v });
      else { row[k] = v; ok++; }
    }
    data[l.code] = row;
  }
  save();
  console.log(`batch ${i + 1}: ${batch.map((l) => l.code).join(" ")}`);
}

for (let i = 0; i < tooLong.length; i += 20) {
  const part = tooLong.slice(i, i + 20);
  const { got, usage } = await chat(shortenPrompt(part));
  tin += usage.prompt_tokens ?? 0;
  tout += usage.completion_tokens ?? 0;
  for (const { id } of part) {
    const cut = id.lastIndexOf(".");
    const code = id.slice(0, cut), k = id.slice(cut + 1);
    const v = String(got[id] ?? "").trim();
    if (clean(k, v) && fits(k, v)) { data[code][k] = v; ok++; }
    else bad.push(`${id} (${[...v].length}): ${v}`);
  }
  save();
}

for (const b of bad) console.log("BAD", b);
const usd = (tin * 2.5 + tout * 15) / 1e6;
console.log(`ok ${ok}, shortened pass ${tooLong.length}, bad ${bad.length}; tokens in ${tin} out ${tout}, about $${usd.toFixed(3)}`);
