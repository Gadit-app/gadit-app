// @ts-nocheck — dev-only script, run via tsx (not part of the Next build).
/**
 * mini-vs-4o.mts — quality + cost comparison for the define engine.
 *
 * For each of the top real search words, generate a definition with BOTH
 * gpt-4o and gpt-4o-mini, using the PRODUCTION system prompt + structured
 * schema (read verbatim from the route) and the PRODUCTION quality guard
 * (isDegenerate). Reports how often mini passes the guard, the token/cost
 * delta, and saves both definitions side by side so Gadi can judge quality.
 *
 * Zero production changes. Reads OPENAI_API_KEY + ADMIN_SECRET from
 * web/.env.local; pulls the top words from the live /api/admin/searches.
 *
 * Run:  cd web && npx tsx scripts/mini-vs-4o.mts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { isDegenerate } from "../src/lib/define-guard.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");

// ---- env ----
function parseEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let raw = "";
  try { raw = readFileSync(path, "utf8"); } catch { return out; }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}
const env = parseEnv(join(WEB, ".env.local"));
const OPENAI_API_KEY = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
const ADMIN_SECRET = env.ADMIN_SECRET || process.env.ADMIN_SECRET || "";
if (!OPENAI_API_KEY) { console.error("Missing OPENAI_API_KEY in web/.env.local"); process.exit(1); }

// ---- extract the PRODUCTION prompt + schema from the route (as text) ----
const routeSrc = readFileSync(join(WEB, "src/app/api/define/route.ts"), "utf8");

function extractTemplate(name: string): string {
  const start = routeSrc.indexOf("const " + name + " = `");
  if (start < 0) throw new Error("prompt not found: " + name);
  const open = routeSrc.indexOf("`", start) + 1;
  const close = routeSrc.indexOf("`", open);
  return routeSrc.slice(open, close);
}
function extractObject(name: string): unknown {
  const start = routeSrc.indexOf("const " + name + " = {");
  if (start < 0) throw new Error("object not found: " + name);
  let i = routeSrc.indexOf("{", start);
  let depth = 0;
  for (let j = i; j < routeSrc.length; j++) {
    const c = routeSrc[j];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { const text = routeSrc.slice(i, j + 1); return (0, eval)("(" + text + ")"); } }
  }
  throw new Error("unbalanced object: " + name);
}
const SYSTEM_PROMPT = extractTemplate("SYSTEM_PROMPT");
const RESPONSE_SCHEMA = extractObject("RESPONSE_SCHEMA");
const STRUCTURED_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: { name: "gadit_word_result", strict: true, schema: RESPONSE_SCHEMA },
};
console.log(`[prompt] SYSTEM_PROMPT ${SYSTEM_PROMPT.length} chars; schema keys: ${Object.keys(RESPONSE_SCHEMA as object).join(",")}`);

// ---- UI language names (mirror of the route's UI_LANG_NAMES, subset) ----
const LANG_NAME: Record<string, string> = {
  he: "Hebrew", en: "English", ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese",
  fr: "French", de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese",
  hi: "Hindi", am: "Amharic", uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian",
  id: "Indonesian", nl: "Dutch", el: "Greek", zu: "Zulu", vi: "Vietnamese", fil: "Filipino",
  af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese",
  ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
};

// ---- pick top real (word, lang) pairs ----
const N = Number(process.env.N) || 30;
async function topWords(): Promise<Array<{ word: string; lang: string; count: number }>> {
  const res = await fetch(`https://www.gadit.app/api/admin/searches?secret=${encodeURIComponent(ADMIN_SECRET)}&limit=50`);
  if (!res.ok) throw new Error("searches endpoint " + res.status);
  const data = await res.json() as { byLang: Record<string, Array<{ word: string; count: number }>> };
  const flat: Array<{ word: string; lang: string; count: number }> = [];
  for (const [lang, rows] of Object.entries(data.byLang || {})) {
    if (!LANG_NAME[lang]) continue;
    for (const r of rows) flat.push({ word: r.word, lang, count: r.count });
  }
  flat.sort((a, b) => b.count - a.count);
  // De-dupe identical (word,lang), keep the strongest, take N.
  const seen = new Set<string>();
  const picked: Array<{ word: string; lang: string; count: number }> = [];
  for (const r of flat) {
    const k = r.lang + "|" + r.word.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    picked.push(r);
    if (picked.length >= N) break;
  }
  return picked;
}

// ---- one define call ----
const PRICE = { "gpt-4o": { in: 2.5, out: 10 }, "gpt-4o-mini": { in: 0.15, out: 0.6 } } as const;
async function fetchWithRetry(body: string, tries = 3): Promise<Response> {
  let lastErr = "";
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body,
      });
      if (res.ok || res.status === 400) return res; // 400 = real request error, don't retry
      lastErr = `${res.status}`;
    } catch (e) {
      lastErr = String(e);
    }
    await new Promise(r => setTimeout(r, 800 * (i + 1)));
  }
  throw new Error("fetch failed after retries: " + lastErr);
}
async function define(model: keyof typeof PRICE, word: string, lang: string) {
  const uiLangName = LANG_NAME[lang] || "English";
  const userContent = `Word: ${word}\nUser's UI language (RESPOND ENTIRELY in this language, meaning text, example sentences, etymology fields, kidsExplanation, idiom meanings. Headword + original-script forms stay native): ${uiLangName}`;
  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetchWithRetry(JSON.stringify({
      model, temperature: 0.2, response_format: STRUCTURED_RESPONSE_FORMAT,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userContent }],
    }));
  } catch (e) {
    return { ok: false as const, err: String(e), ms: Date.now() - t0 };
  }
  const ms = Date.now() - t0;
  if (!res.ok) return { ok: false as const, err: `${res.status} ${(await res.text()).slice(0, 160)}`, ms };
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const usage = data.usage || {};
  const cost = ((usage.prompt_tokens || 0) * PRICE[model].in + (usage.completion_tokens || 0) * PRICE[model].out) / 1e6;
  let parsed: any = null; let parseErr = "";
  try { parsed = JSON.parse(content); } catch (e) { parseErr = String(e); }
  const verdict = parsed ? isDegenerate(parsed, word) : { degenerate: true, reason: "parse_failed: " + parseErr };
  return { ok: true as const, ms, cost, tokensIn: usage.prompt_tokens || 0, tokensOut: usage.completion_tokens || 0, parsed, verdict };
}

// ---- run ----
const words = await topWords();
console.log(`[words] testing ${words.length} real (word, lang) pairs\n`);

type Row = { word: string; lang: string; count: number;
  four: Awaited<ReturnType<typeof define>>; mini: Awaited<ReturnType<typeof define>>; };
const rows: Row[] = [];
let miniPass = 0, fourPass = 0, costFour = 0, costMini = 0;

for (const w of words) {
  const [four, mini] = await Promise.all([define("gpt-4o", w.word, w.lang), define("gpt-4o-mini", w.word, w.lang)]);
  rows.push({ ...w, four, mini });
  const fP = four.ok && !four.verdict.degenerate;
  const mP = mini.ok && !mini.verdict.degenerate;
  if (fP) fourPass++;
  if (mP) miniPass++;
  if (four.ok) costFour += four.cost;
  if (mini.ok) costMini += mini.cost;
  const fMean = four.ok ? (four.parsed?.meanings?.[0]?.meaning ?? "").slice(0, 60) : four.err;
  const mMean = mini.ok ? (mini.parsed?.meanings?.[0]?.meaning ?? "").slice(0, 60) : mini.err;
  console.log(`${mP ? "PASS" : "FAIL"} mini | ${fP ? "pass" : "FAIL"} 4o | ${w.lang} ${w.word}`);
  if (!mP && mini.ok) console.log(`     mini rejected: ${mini.verdict.reason}`);
  void fMean; void mMean;
}

const savingsPct = costFour > 0 ? Math.round((1 - costMini / costFour) * 100) : 0;
console.log(`\n===== SUMMARY (${rows.length} words) =====`);
console.log(`gpt-4o     passes guard: ${fourPass}/${rows.length}   cost $${costFour.toFixed(4)}`);
console.log(`gpt-4o-mini passes guard: ${miniPass}/${rows.length}   cost $${costMini.toFixed(4)}   (${savingsPct}% cheaper)`);
console.log(`mini agreement with 4o (both pass): ${rows.filter(r => r.four.ok && r.mini.ok && !r.four.verdict.degenerate && !r.mini.verdict.degenerate).length}/${rows.length}`);

const out = { generatedAt: new Date().toISOString(), n: rows.length, fourPass, miniPass, costFour, costMini, savingsPct,
  rows: rows.map(r => ({ word: r.word, lang: r.lang, count: r.count,
    four: r.four.ok ? { pass: !r.four.verdict.degenerate, reason: r.four.verdict.degenerate ? r.four.verdict.reason : "", meaning: r.four.parsed?.meanings?.[0]?.meaning ?? "", meaningsCount: r.four.parsed?.meanings?.length ?? 0, cost: r.four.cost, tokensIn: r.four.tokensIn, tokensOut: r.four.tokensOut } : { error: r.four.err },
    mini: r.mini.ok ? { pass: !r.mini.verdict.degenerate, reason: r.mini.verdict.degenerate ? r.mini.verdict.reason : "", meaning: r.mini.parsed?.meanings?.[0]?.meaning ?? "", meaningsCount: r.mini.parsed?.meanings?.length ?? 0, cost: r.mini.cost, tokensIn: r.mini.tokensIn, tokensOut: r.mini.tokensOut } : { error: r.mini.err } })) };
const outPath = join(WEB, "scripts", "mini-vs-4o-results.json");
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nresults → ${outPath}`);
