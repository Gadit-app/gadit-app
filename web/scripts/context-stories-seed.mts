// @ts-nocheck — dev-only script, run with plain node (not part of the Next build).
/**
 * context-stories-seed.mts: writes Context Detective stories ahead of time
 * into the story store (`contextStories`), so the game starts at once.
 * (2026-11-12, Gadi: the child waited 15 to 31 s for the first story. Gadi's
 * rule: measure the cost on a small sample before any bulk run, so the run
 * needs a size (--per or --limit), stops at --budget dollars, and prints
 * tokens, dollars, pass rates and seconds.)
 *
 * It uses the route's own prompts, model and checks (src/lib/context-game.ts):
 * one writer call makes 4 or 5 stories on a handful of the pool's words, then
 * every story is solved blind once per UI language (the check also writes the
 * "why" lines in that language). Only the stories that pass are saved.
 *
 * The quality gate (2026-11-12, Gadi, after the first sample saved "היא ילדה
 * חברה", weak Hebrew that the blind check let through): a stored story is
 * served again and again, so here, and only here, each story is first read by
 * a strict native-speaker editor and dropped on any doubt. The live route does
 * not have this gate.
 *
 * Which words: the game's built-in pool is the curated one
 * (src/lib/play-content/curated-play-words.ts), which PlayClient adds to every
 * child's notebook words: Hebrew words for a Hebrew UI, English words for any
 * other UI, a kids list and an older list. The lesson banks (src/lib/learn)
 * do not reach this game today; --source=bank is there for when they do.
 *
 *   node scripts/context-stories-seed.mts --per=40 --budget=10
 *   node scripts/context-stories-seed.mts --per=15 --combos=he:he:1,he:he:0 --budget=2
 *   node scripts/context-stories-seed.mts --limit=6 --dry          (nothing saved)
 *   node scripts/context-stories-seed.mts --gate-existing          (re-read the seed stories, delete the weak ones)
 *
 * --per=N      fill every combination (words language, UI language, kids) up to
 *              N stories, counting the ones already in the store (so it resumes)
 * --limit=N    stop after N stories saved in this run
 * --budget=D   hard stop once this run has spent D dollars (default 1)
 * --spent=D    dollars spent in earlier runs, added to the printed total only
 * --combos     lang:ui+ui:kids, comma separated (default: the 4 curated pools)
 * --source     curated (default) | bank
 * --dry        call the model, save and delete nothing
 *
 * Needs the Firebase service account at C:\Users\gadib\.secrets\gadit-firebase-sa.json
 * and OPENAI_API_KEY in web/.env.local (read at runtime, never printed).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { applyContextCheck, contextCheckMessages, contextMessages, langName, parseContextRounds, storyDoc, CONTEXT_STORE } from "../src/lib/context-game.ts";
import { getCuratedPlayPool } from "../src/lib/play-content/curated-play-words.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const env = fs.readFileSync(path.join(HERE, "../.env.local"), "utf8");
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
if (!KEY) { console.error("OPENAI_API_KEY is missing in web/.env.local"); process.exit(1); }

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const GATE_EXISTING = process.argv.includes("--gate-existing");
const PER = Number(arg("per") ?? 0);
const LIMIT = Number(arg("limit") ?? (PER ? 1e9 : 0));
if (!GATE_EXISTING && !(PER >= 1) && !(LIMIT >= 1)) { console.error("--per=N or --limit=N is required (measure a small sample before a bulk run)"); process.exit(1); }
const BUDGET = Number(arg("budget") ?? 1);
const SPENT = Number(arg("spent") ?? 0);
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

type Kind = "writer" | "gate" | "check";
const zero = () => ({ in: 0, cachedIn: 0, out: 0, ms: 0, calls: 0 });
const tally = zero();
const parts: Record<Kind, ReturnType<typeof zero>> = { writer: zero(), gate: zero(), check: zero() };
const cost = (t: { in: number; cachedIn: number; out: number }) =>
  ((t.in - t.cachedIn) * PRICE.in + t.cachedIn * PRICE.cachedIn + t.out * PRICE.out) / 1_000_000;
const money = () => `$${cost(tally).toFixed(3)} this run, $${(SPENT + cost(tally)).toFixed(3)} in all`;

class BudgetStop extends Error {}

async function chat(messages: { role: string; content: string }[], temperature: number, kind: Kind): Promise<string> {
  // The hard stop: no call starts once the run has spent its budget.
  if (cost(tally) >= BUDGET) throw new BudgetStop();
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

/** The story as the child sees it once solved, the answers in [[brackets]]. */
const solved = (r: { segments: string[]; answers: string[] }) => r.segments.map((s, i) => s + (r.answers[i] ? `[[${r.answers[i]}]]` : "")).join("");

/** The quality gate: a strict editor reads the solved story. Any "no", any
 *  doubt, any answer that cannot be read: the story is dropped. */
async function gate(r: { segments: string[]; answers: string[] }, lang: string, kids: boolean): Promise<{ ok: boolean; problem: string }> {
  const L = langName(lang);
  const reader = kids ? "children aged 6 to 9" : "learners aged 10 and up (often children)";
  const system = `You are a strict editor and a native speaker of ${L}, who edits printed reading books for ${reader}. Return JSON only.

Below is a very short story in ${L}. The words in [[double brackets]] are the words a child will fill in; read the story with them in place.
Judge the story as it stands, exactly as written. Answer each question with true only when you are sure; on any doubt or hesitation answer false.
- "natural": every sentence is natural ${L} that a good native writer would write for this reader. False for phrasing that sounds translated, stiff or odd, for an unusual word pairing, and for a sentence a native teacher would stop and rephrase.
- "grammar": no mistake of grammar or usage anywhere: agreement of gender and number, tense, prepositions, word order, spelling.
- "blanks": one true or false per bracket, in order. True only when the bracketed word, in exactly this form, is the right part of speech for its place and the sentence around it reads correctly and naturally with it. False when a noun stands where an adjective or a verb is needed (or the other way round), when the form is wrong, or when another form of the word is what a native speaker would say there.
- "sense": the story makes sense as a whole and its sentences belong together.
- "safe": the content is safe and kind for young children.
- "problem": when anything above is false, the faulty words and what is wrong with them, in a few English words; otherwise "".

JSON shape: {"natural":true,"grammar":true,"blanks":[true,true],"sense":true,"safe":true,"problem":""}`;
  let v: any;
  try { v = JSON.parse(await chat([{ role: "system", content: system }, { role: "user", content: solved(r) }], 0, "gate")); } catch (e) {
    if (e instanceof BudgetStop) throw e;
    return { ok: false, problem: "no verdict" };
  }
  const blanksOk = Array.isArray(v?.blanks) && v.blanks.length === r.answers.length && v.blanks.every((b: unknown) => b === true);
  const ok = v?.natural === true && v?.grammar === true && v?.sense === true && v?.safe === true && blanksOk;
  return { ok, problem: ok ? "" : String(v?.problem ?? "").slice(0, 160) || "rejected" };
}

// firebase-admin sits in the workspace root's node_modules.
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("C:/Users/gadib/.secrets/gadit-firebase-sa.json")) });
const db: FirebaseFirestore.Firestore = admin.firestore();
const col = db.collection(CONTEXT_STORE);
const started = Date.now();

function closing(extra: string[] = []) {
  console.log("\n--- measurements ---");
  console.log(`model ${MODEL}${DRY ? " (dry run: nothing saved or deleted)" : ""}`);
  extra.forEach((x) => console.log(x));
  for (const k of ["writer", "gate", "check"] as const) {
    const p = parts[k];
    if (p.calls) console.log(`${k}: ${p.calls} calls, in ${p.in} (cached ${p.cachedIn}), out ${p.out}, $${cost(p).toFixed(4)}, ${(p.ms / 1000 / p.calls).toFixed(1)} s per call`);
  }
  console.log(`total: ${tally.calls} calls, in ${tally.in}, out ${tally.out}, ${money()}, wall clock ${((Date.now() - started) / 1000).toFixed(0)} s`);
}

if (GATE_EXISTING) {
  // Only the stories this script wrote: the ones from live play are not ours to judge here.
  const snap = await col.where("src", "==", "seed").get();
  // The same story in three UI languages is read once.
  const verdicts = new Map<string, { ok: boolean; problem: string }>();
  let kept = 0;
  const gone: string[] = [];
  try {
    for (const d of snap.docs) {
      const x = d.data();
      const text = solved(x.round);
      const k = `${x.lang}|${x.kids ? 1 : 0}|${text}`;
      if (!verdicts.has(k)) verdicts.set(k, await gate(x.round, x.lang, x.kids === true));
      const v = verdicts.get(k)!;
      if (v.ok) { kept++; continue; }
      if (!DRY) await d.ref.delete();
      gone.push(`[${x.lang}/${x.ui}/${x.kids ? "kids" : "older"}] ${text}\n     why it failed: ${v.problem}`);
    }
  } catch (e) { if (!(e instanceof BudgetStop)) throw e; console.log("BUDGET STOP"); }
  console.log(`seed stories read: ${snap.size}, kept ${kept}, ${DRY ? "would delete" : "deleted"} ${gone.length}`);
  gone.forEach((g) => console.log(g));
  closing();
  process.exit(0);
}

const shuffled = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
// The same dozen words over many calls drift to the same scene; a few places
// named in the request keep the stories apart.
const PLACES = ["the kitchen", "a garden", "the beach", "a bus ride", "the library", "a market", "a farm", "a rainy day at home", "a birthday", "sports day", "the zoo", "a camping trip", "a school play", "the playground", "grandma's house", "a walk in the forest", "a science class", "a picnic", "a snowy morning", "a visit to the doctor", "a bike ride", "a music lesson", "the swimming pool", "a train station"];

type Stat = { written: number; gated: number; passedGate: number; checks: number; saved: number; have: Record<string, number>; dry: number; dropped: boolean };
const stats = new Map<Group, Stat>();
const tagOf = (g: Group) => `${g.lang}|${g.uis.join("+")}|${g.kids ? "kids" : "older"}`;
const used = new Map<string, number>(); // how often a word already has a story: the rare ones go first
for (const g of groups) stats.set(g, { written: 0, gated: 0, passedGate: 0, checks: 0, saved: 0, have: Object.fromEntries(g.uis.map((u) => [u, 0])), dry: 0, dropped: false });
// What the store already holds counts toward --per, so a run that stopped can go on.
for (const d of (await col.select("lang", "ui", "kids", "base").get()).docs) {
  const x = d.data();
  const g = groups.find((q) => q.lang === x.lang && q.kids === (x.kids === true) && q.uis.includes(x.ui));
  if (!g) continue;
  stats.get(g)!.have[x.ui]++;
  for (const b of x.base ?? []) used.set(`${tagOf(g)}|${b}`, (used.get(`${tagOf(g)}|${b}`) ?? 0) + 1 / g.uis.length);
}
const need = (g: Group) => (PER ? Math.max(0, ...g.uis.map((u) => PER - stats.get(g)!.have[u])) : 1);
console.log("in the store now:", groups.map((g) => `${tagOf(g)} ${JSON.stringify(stats.get(g)!.have)}`).join("  "));

let saved = 0;
const samples: string[] = [];
const rejects: string[] = [];
let stop = "";
// A small --limit still visits every group; a bulk run never feels this cap.
const share = PER ? 1e9 : Math.ceil(LIMIT / groups.length);
// Eight writer calls in a row with nothing saved: this combination does not work, leave it.
const DRY_SPELL = 8;

try {
  for (let turn = 0; saved < LIMIT; turn++) {
    const open = groups.filter((g) => !stats.get(g)!.dropped && need(g) > 0);
    if (!open.length) { stop = "every combination is full or was left"; break; }
    // --per: the combination that is furthest behind goes next; --limit: round robin.
    const g = PER ? open.sort((a, b) => need(b) - need(a))[0] : open[turn % open.length];
    const st = stats.get(g)!;
    const tag = tagOf(g);
    const pool = await poolOf(g);
    if (pool.length < 2) { console.log(tag, "no words, left"); st.dropped = true; continue; }
    // A third of the words are the ones with the fewest stories, the rest are any words:
    // only the rare ones, call after call, were the words that are hard to put in
    // a story, and the Hebrew kids run went six calls without one saved story.
    const n = g.kids ? 6 : 9;
    const rare = shuffled(pool).sort((a, b) => Math.round(used.get(`${tag}|${a}`) ?? 0) - Math.round(used.get(`${tag}|${b}`) ?? 0)).slice(0, Math.ceil(n / 3));
    const words = shuffled([...rare, ...shuffled(pool.filter((w) => !rare.includes(w))).slice(0, n - rare.length)]);
    const msgs = contextMessages(words, g.lang, g.kids);
    msgs[1].content += `\nSet each story somewhere else, for example: ${shuffled(PLACES).slice(0, 5).join(", ")}.`;
    let stories = [];
    try {
      stories = parseContextRounds(await chat(msgs, 0.5, "writer"), words, g.lang);
    } catch (e) {
      if (e instanceof BudgetStop) throw e;
      console.log(tag, "writer failed:", String(e).slice(0, 80));
    }
    st.written += stories.length;
    let got = 0;
    for (const story of stories) {
      if (saved >= LIMIT || got >= share) break;
      const uis = g.uis.filter((u) => !PER || st.have[u] < PER);
      if (!uis.length) break;
      st.gated++;
      const verdict = await gate(story, g.lang, g.kids);
      if (!verdict.ok) { if (rejects.length < 60) rejects.push(`[${tag}] ${solved(story)}  <- ${verdict.problem}`); continue; }
      st.passedGate++;
      const results = await Promise.all(uis.map(async (ui) => {
        try {
          const ok = applyContextCheck([story], await chat(contextCheckMessages([story], g.lang, ui, g.kids), 0, "check"));
          return { ui, round: ok[0] ?? null, cut: false };
        } catch (e) { return { ui, round: null, cut: e instanceof BudgetStop }; }
      }));
      for (const { ui, round, cut } of results) {
        if (cut) continue;
        st.checks++;
        if (!round) continue;
        const doc = storyDoc(round, g.lang, ui, g.kids, "seed");
        if (!DRY) await col.doc(doc.id).set(doc.data);
        saved++; got++; st.saved++; st.have[ui]++;
        round.base.forEach((b) => used.set(`${tag}|${b}`, (used.get(`${tag}|${b}`) ?? 0) + 1 / g.uis.length));
        if (samples.length < 12) samples.push(`[${g.lang}/${ui}/${g.kids ? "kids" : "older"}] ${solved(round)}\n     bar: ${round.options.join(", ")}\n     why: ${round.why.join(" | ")}`);
      }
      if (results.some((r) => r.cut)) throw new BudgetStop();
    }
    st.dry = got ? 0 : st.dry + 1;
    if (st.dry >= DRY_SPELL) { st.dropped = true; console.log(tag, `LEFT: ${DRY_SPELL} writer calls in a row with nothing saved`); }
    console.log(new Date().toISOString().slice(11, 19), tag, `written ${stories.length}, saved ${got}, now ${JSON.stringify(st.have)}, spent ${money()}`);
  }
  if (!stop) stop = "--limit reached";
} catch (e) {
  if (!(e instanceof BudgetStop)) throw e;
  stop = `BUDGET STOP at $${BUDGET}`;
}

console.log("\n--- a few saved stories ---");
samples.forEach((s) => console.log(s));
console.log("\n--- dropped by the quality gate ---");
rejects.forEach((s) => console.log(s));
const lines = [`stopped: ${stop}`, `saved in this run: ${saved}`];
for (const [g, st] of stats) {
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "n/a");
  lines.push(`  ${tagOf(g)}: written ${st.written}, quality gate ${st.passedGate}/${st.gated} (${pct(st.passedGate, st.gated)}), blind check ${st.saved}/${st.checks} (${pct(st.saved, st.checks)}), saved ${st.saved}, in the store ${JSON.stringify(st.have)}${st.dropped ? "  LEFT" : ""}`);
}
if (saved) lines.push(`per saved story: $${(cost(tally) / saved).toFixed(4)}, ${((Date.now() - started) / 1000 / saved).toFixed(1)} s`);
closing(lines);
process.exit(0);
