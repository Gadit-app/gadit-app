// @ts-nocheck — dev-only script, run with plain node (not part of the Next build).
/**
 * context-stories-seed.mts: writes Context Detective stories ahead of time
 * into the story store (`contextStories`), so the game starts at once.
 * (2026-11-12, Gadi: the child waited 15 to 31 s for the first story. Gadi's
 * rule: measure the cost on a small sample before any bulk run, so --limit is
 * required and the run prints tokens, dollars, pass rate and seconds.)
 *
 * It uses the route's own prompts, model and checks (src/lib/context-game.ts):
 * one writer call makes 4 or 5 stories on a handful of the pool's words, then
 * every story is solved blind once per UI language (the check also writes the
 * "why" lines in that language). Only the stories that pass are saved.
 *
 * Which words: the game's built-in pool is the curated one
 * (src/lib/play-content/curated-play-words.ts), which PlayClient adds to every
 * child's notebook words: Hebrew words for a Hebrew UI, English words for any
 * other UI, a kids list and an older list. The lesson banks (src/lib/learn)
 * do not reach this game today; --source=bank is there for when they do.
 *
 *   node scripts/context-stories-seed.mts --limit=12
 *   node scripts/context-stories-seed.mts --limit=40 --combos=he:he:1,en:en+ar+ru:0
 *   node scripts/context-stories-seed.mts --limit=6 --dry          (nothing saved)
 *
 * --limit=N    stop after N saved stories (a story in 3 UI languages counts 3)
 * --combos     lang:ui+ui:kids, comma separated (default: the 4 curated pools)
 * --source     curated (default) | bank
 * --dry        call the model, save nothing
 *
 * Needs the Firebase service account at C:\Users\gadib\.secrets\gadit-firebase-sa.json
 * and OPENAI_API_KEY in web/.env.local (read at runtime, never printed).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { applyContextCheck, contextCheckMessages, contextMessages, parseContextRounds, storyDoc, CONTEXT_STORE } from "../src/lib/context-game.ts";
import { getCuratedPlayPool } from "../src/lib/play-content/curated-play-words.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
if (!KEY) { console.error("OPENAI_API_KEY is missing in web/.env.local"); process.exit(1); }

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const LIMIT = Number(arg("limit"));
if (!Number.isFinite(LIMIT) || LIMIT < 1) { console.error("--limit=N is required (measure a small sample before a bulk run)"); process.exit(1); }
const DRY = process.argv.includes("--dry");
const SOURCE = arg("source") ?? "curated";

// The model and the list prices of the route (src/lib/ai-cost.ts: TEXT_MODEL_FAST,
// PRICING, CACHED_IN). USD per 1,000,000 tokens.
const MODEL = "gpt-5.4";
const PRICE = { in: 2.5, cachedIn: 0.25, out: 15 };

type Group = { lang: string; uis: string[]; kids: boolean };
// The pairs the game really asks for with built-in words: a Hebrew UI plays the
// Hebrew pool; every other UI plays the English pool, and the "why" lines come
// in the UI language (en, ar, ru here; the other UI languages fill in from live play).
const DEFAULT = "he:he:1,he:he:0,en:en+ar+ru:1,en:en+ar+ru:0";
const groups: Group[] = (arg("combos") ?? DEFAULT).split(",").map((c) => {
  const [lang, uis, kids] = c.split(":");
  return { lang, uis: uis.split("+"), kids: kids === "1" };
});

async function poolOf(g: Group): Promise<string[]> {
  if (SOURCE === "bank") {
    // Kids Mode takes the first levels, the older reader the upper ones.
    const fits = (d: number) => (g.kids ? d <= 3 : d >= 3);
    if (g.lang === "he") return (await import("../src/lib/learn/hebrew-bank.ts")).HEBREW_BANK.filter((x) => fits(x.d)).map((x) => x.w);
    if (g.lang === "en") return (await import("../src/lib/learn/english-bank.ts")).ENGLISH_BANK.filter((x) => fits(x.d)).map((x) => x.w);
    return [];
  }
  // The curated pool is chosen by UI language: "he" gives Hebrew words, anything else English.
  return getCuratedPlayPool(g.lang === "he" ? "he" : "en", g.kids).map((p) => p.word);
}

const tally = { calls: 0, in: 0, cachedIn: 0, out: 0 };
const cost = (t: { in: number; cachedIn: number; out: number }) =>
  ((t.in - t.cachedIn) * PRICE.in + t.cachedIn * PRICE.cachedIn + t.out * PRICE.out) / 1_000_000;
const parts = { writer: { in: 0, cachedIn: 0, out: 0, ms: 0, calls: 0 }, check: { in: 0, cachedIn: 0, out: 0, ms: 0, calls: 0 } };

async function chat(messages: { role: string; content: string }[], temperature: number, kind: "writer" | "check"): Promise<string> {
  const t0 = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(90_000),
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, temperature, max_completion_tokens: 3000, response_format: { type: "json_object" }, messages }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const u = data.usage ?? {};
  const add = { in: u.prompt_tokens ?? 0, cachedIn: u.prompt_tokens_details?.cached_tokens ?? 0, out: u.completion_tokens ?? 0 };
  for (const t of [tally, parts[kind]]) { t.in += add.in; t.cachedIn += add.cachedIn; t.out += add.out; t.calls++; }
  parts[kind].ms += Date.now() - t0;
  return String(data.choices?.[0]?.message?.content ?? "");
}

let db: FirebaseFirestore.Firestore | null = null;
if (!DRY) {
  // firebase-admin sits in the workspace root's node_modules.
  const admin = require("firebase-admin");
  admin.initializeApp({ credential: admin.credential.cert(require("C:/Users/gadib/.secrets/gadit-firebase-sa.json")) });
  db = admin.firestore();
}

const shuffled = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
const started = Date.now();
let written = 0;   // stories the writer made that passed the shape checks
let checks = 0;    // story x UI language blind checks
let saved = 0;     // checks that passed, i.e. story docs
const perGroup = new Map<string, { checks: number; saved: number }>();
const used = new Map<string, number>(); // how often a word already has a story: the rare ones go first
const samples: string[] = [];
// A small --limit still visits every group; a bulk --limit never feels this cap.
const share = Math.ceil(LIMIT / groups.length);

for (let turn = 0; saved < LIMIT && turn < LIMIT * 3 + groups.length; turn++) {
  const g = groups[turn % groups.length];
  const tag = `${g.lang}|${g.uis.join("+")}|${g.kids ? "kids" : "older"}`;
  const pool = await poolOf(g);
  if (pool.length < 2) { console.log(tag, "no words, skipped"); continue; }
  const words = shuffled(pool).sort((a, b) => (used.get(`${tag}|${a}`) ?? 0) - (used.get(`${tag}|${b}`) ?? 0)).slice(0, g.kids ? 6 : 9);
  let stories = [];
  try {
    stories = parseContextRounds(await chat(contextMessages(words, g.lang, g.kids), 0.5, "writer"), words, g.lang);
  } catch (e) { console.log(tag, "writer failed:", String(e).slice(0, 80)); continue; }
  written += stories.length;
  let got = 0;
  for (const story of stories) {
    if (saved >= LIMIT || got >= share) break;
    const results = await Promise.all(g.uis.map(async (ui) => {
      try {
        const ok = applyContextCheck([story], await chat(contextCheckMessages([story], g.lang, ui, g.kids), 0, "check"));
        return { ui, round: ok[0] ?? null };
      } catch { return { ui, round: null }; }
    }));
    for (const { ui, round } of results) {
      checks++;
      const pg = perGroup.get(tag) ?? { checks: 0, saved: 0 };
      pg.checks++;
      if (round) {
        const doc = storyDoc(round, g.lang, ui, g.kids, "seed");
        if (db) await db.collection(CONTEXT_STORE).doc(doc.id).set(doc.data);
        saved++; got++; pg.saved++;
        round.base.forEach((b) => used.set(`${tag}|${b}`, (used.get(`${tag}|${b}`) ?? 0) + 1));
        if (samples.length < 40) samples.push(`[${g.lang}/${ui}/${g.kids ? "kids" : "older"}] ${round.segments.map((s, i) => s + (round.answers[i] ? `[${round.answers[i]}]` : "")).join("")}\n     bar: ${round.options.join(", ")}\n     why: ${round.why.join(" | ")}`);
      }
      perGroup.set(tag, pg);
    }
  }
  console.log(new Date().toISOString().slice(11, 19), tag, "written", stories.length, "saved so far", saved);
}

const secs = (Date.now() - started) / 1000;
const total = cost(tally);
console.log("\n--- stories ---");
samples.forEach((s) => console.log(s));
console.log("\n--- measurements ---");
console.log(`model ${MODEL}${DRY ? " (dry run: nothing saved)" : ""}`);
console.log(`stories written (after shape checks): ${written}`);
console.log(`blind checks (story x UI language): ${checks}, passed and saved: ${saved} (${checks ? Math.round((saved / checks) * 100) : 0}%)`);
for (const [tag, pg] of perGroup) console.log(`  ${tag}: ${pg.saved}/${pg.checks}`);
for (const k of ["writer", "check"] as const) {
  const p = parts[k];
  console.log(`${k}: ${p.calls} calls, in ${p.in} (cached ${p.cachedIn}), out ${p.out}, $${cost(p).toFixed(4)}, ${(p.ms / 1000 / Math.max(1, p.calls)).toFixed(1)} s per call`);
}
console.log(`total: ${tally.calls} calls, in ${tally.in}, out ${tally.out}, $${total.toFixed(4)}`);
console.log(`per saved story: $${saved ? (total / saved).toFixed(4) : "n/a"}, ${saved ? (secs / saved).toFixed(1) : "n/a"} s (wall clock ${secs.toFixed(0)} s)`);
process.exit(0);
