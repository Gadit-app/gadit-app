/**
 * Builds the "odd one out" questions of the journey (Gadi approved the
 * sample 2026-11-14). For every word of a curriculum unit: the word, two
 * more words of the same unit and one word of a unit in a FAR subject. The
 * engine then checks every question blind (it is not told the answer) and
 * only a question with one clear answer is kept.
 *
 * Kept in Firestore journeyOdd/{unitId}: { qs: [{ w, options, odd }] }.
 * Measured on 80 questions: 60% pass, $0.0003 a question.
 *
 * Run from web/ (reads the stored units, writes journeyOdd only):
 *   FIREBASE_SERVICE_ACCOUNT="$(cat <key file>)" npx tsx --env-file=.env.local scripts/journey-odd-build.ts he:1-6 en:4-7
 */
import { CUR_TOPICS, zaTopic } from "@/lib/curriculum-catalog";
import zaSets from "@/lib/curriculum-sets-za.json";
import { getAdminDb } from "@/lib/firebase-admin";
import { levelUnits } from "@/lib/journey/level-words";
import { costWithCache } from "@/lib/ai-cost";

const MODEL = "gpt-5.4";
const CAP_USD = 3;
const TRIES = 2;

type Unit = { id: string; subject: string; words: string[] };
type Q = { w: string; options: string[]; odd: string; pass?: boolean };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const FAMILY: Record<string, string> = {
  hebrew: "lang", literature: "lang", "english-home-language": "lang",
  mathematics: "math",
  "science-and-technology": "nature", geography: "nature", "natural-sciences-technology": "nature", "natural-sciences": "nature",
  "homeland-society-and-civics": "society", history: "society", "life-skills": "society",
};
const FAR = new Set(["lang|math", "math|lang", "lang|nature", "nature|lang", "lang|society", "society|lang", "math|society", "society|math"]);
const far = (a: string, b: string) => FAR.has(`${FAMILY[a]}|${FAMILY[b]}`);
const tokens = (w: string) => w.toLowerCase().split(/[\s-]+/).filter((x) => x.length > 2);

async function units(ui: string, grade: number): Promise<Unit[]> {
  const ids = levelUnits(ui, grade).slice(0, 24);
  const out: Unit[] = [];
  if (ui === "en") {
    for (const id of ids) { const t = zaTopic(id) as { s: string } | undefined; const w = (zaSets as Record<string, { words: string[] }>)[id]; if (t && w) out.push({ id, subject: t.s, words: w.words }); }
    return out;
  }
  const db = getAdminDb();
  const snaps = await db.getAll(...ids.map((id) => db.collection("curriculumSets").doc(id)));
  for (const s of snaps) {
    const t = CUR_TOPICS.find((x) => x.id === s.id);
    const words = s.get("set.words") as string[] | undefined;
    if (t && Array.isArray(words)) out.push({ id: s.id, subject: t.s, words: words.filter((w) => typeof w === "string") });
  }
  return out;
}

function candidate(a: Unit, w: string, all: Unit[]): Q | null {
  const mates = shuffle(a.words.filter((x) => x !== w && !tokens(x).some((t) => tokens(w).includes(t)))).slice(0, 2);
  if (mates.length < 2) return null;
  const used = new Set([w, ...mates].flatMap(tokens));
  for (const b of shuffle(all.filter((u) => far(a.subject, u.subject)))) {
    const odd = shuffle(b.words.slice(0, 6)).find((x) => !a.words.includes(x) && !tokens(x).some((t) => used.has(t)));
    if (odd) return { w, options: shuffle([w, ...mates, odd]), odd };
  }
  return null;
}

let spent = 0, asked = 0;
async function check(qs: Q[], lang: string): Promise<void> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0, response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `You check "odd one out" questions for school children. The words are in ${lang}. For each question, three words belong together and one does not. Return JSON {"answers":[{"n":<number>,"odd":"<the word that does not belong, copied exactly>","clear":<true only if a child of that school age would see one answer and no second word could reasonably be chosen>}]}. Be strict: if two words could each be the odd one, clear is false.` },
        { role: "user", content: qs.map((q, k) => `${k + 1}. ${q.options.join(" | ")}`).join("\n") },
      ],
    }),
  });
  if (!res.ok) throw new Error("openai_" + res.status);
  const j = (await res.json()) as { choices: Array<{ message: { content: string } }>; usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } } };
  spent += costWithCache(MODEL, j.usage?.prompt_tokens ?? 0, j.usage?.prompt_tokens_details?.cached_tokens ?? 0, j.usage?.completion_tokens ?? 0);
  asked += qs.length;
  let ans: Array<{ n: number; odd: string; clear: boolean }> = [];
  try { ans = (JSON.parse(j.choices[0].message.content) as { answers?: typeof ans }).answers ?? []; } catch { /* the whole batch fails the check */ }
  for (const a of ans) { const q = qs[a.n - 1]; if (q) q.pass = a.odd === q.odd && a.clear === true; }
}

async function inBatches(qs: Q[], lang: string) {
  const parts: Q[][] = [];
  for (let i = 0; i < qs.length; i += 10) parts.push(qs.slice(i, i + 10));
  for (let i = 0; i < parts.length; i += 4) {
    if (spent > CAP_USD) throw new Error("spend cap reached");
    await Promise.all(parts.slice(i, i + 4).map((p) => check(p, lang).catch((e) => console.warn("batch failed", String(e)))));
  }
}

(async () => {
  const db = getAdminDb();
  const done = new Set<string>();
  let kept = 0, words = 0;
  for (const arg of process.argv.slice(2)) {
    const m = /^(he|en):(\d+)-(\d+)$/.exec(arg);
    if (!m) { console.log("skip", arg); continue; }
    const ui = m[1];
    for (let g = Number(m[2]); g <= Number(m[3]); g++) {
      const us = await units(ui, g);
      const todo = us.filter((u) => !done.has(u.id));
      const good = new Map<string, Q[]>();
      let open = todo.flatMap((u) => u.words.map((w) => ({ u, w })));
      words += open.length;
      for (let t = 0; t < TRIES && open.length; t++) {
        const cands = open.map((x) => ({ x, q: candidate(x.u, x.w, us) })).filter((c): c is { x: { u: Unit; w: string }; q: Q } => !!c.q);
        await inBatches(cands.map((c) => c.q), ui === "he" ? "Hebrew" : "English");
        for (const c of cands) if (c.q.pass) good.set(c.x.u.id, [...(good.get(c.x.u.id) ?? []), { w: c.q.w, options: c.q.options, odd: c.q.odd }]);
        open = cands.filter((c) => !c.q.pass).map((c) => c.x);
      }
      for (const u of todo) {
        done.add(u.id);
        const qs = good.get(u.id) ?? [];
        kept += qs.length;
        if (qs.length) await db.collection("journeyOdd").doc(u.id).set({ qs, ui, v: 1, at: new Date().toISOString() });
      }
      console.log(ui, "grade", g, "units", todo.length, "| total words", words, "kept", kept, "asked", asked, "spent $" + spent.toFixed(3));
    }
  }
  process.exit(0);
})();
