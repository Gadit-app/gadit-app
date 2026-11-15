/**
 * Builds the journey's fourth question, "does this sentence make sense?"
 * (the second sample, approved by Gadi 2026-11-15).
 *
 * Every word of a grade is a HOST once and a PLANT once. For a host the engine
 * writes one natural sentence that depends on the word; then the same sentence
 * with the host replaced by a word of a far school subject (the plant). The
 * right sentence is kept for the host ("makes sense"), the planted one for the
 * plant ("does not"), so a child must know the planted word to answer.
 *
 * A second, blind call judges every sentence alone: sense, clear, grammar.
 * A sentence is kept only when the verdict matches what was intended, is clear
 * and the grammar is right.
 *
 * Kept in Firestore journeySense/{unitId}: { qs: { [word]: { good?, bad? } } }.
 *
 * Run from web/:
 *   FIREBASE_SERVICE_ACCOUNT="$(cat <key file>)" npx tsx --env-file=.env.local scripts/journey-sense-build.ts en:4-9
 *   add --measure to stop after the first 10 words and print the cost.
 */
import { CUR_TOPICS, zaTopic } from "@/lib/curriculum-catalog";
import zaSets from "@/lib/curriculum-sets-za.json";
import { getAdminDb } from "@/lib/firebase-admin";
import { levelUnits } from "@/lib/journey/level-words";

const MODEL = "gpt-5.4";
const CAP_USD = 6;
const KEY = process.env.OPENAI_API_KEY as string;
let usd = 0;

async function ask(system: string, user: string): Promise<{ items?: unknown[] } | null> {
  for (let t = 0; t < 3; t++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      });
      const j = await res.json();
      const u = j.usage; const c = u.prompt_tokens_details?.cached_tokens || 0;
      usd += ((u.prompt_tokens - c) * 2.5 + c * 0.25 + u.completion_tokens * 15) / 1e6;
      return JSON.parse(j.choices[0].message.content);
    } catch { if (t === 2) return null; }
  }
  return null;
}

const FAMILY: Record<string, string> = {
  hebrew: "lang", literature: "lang", "english-home-language": "lang",
  mathematics: "math",
  "science-and-technology": "nature", geography: "nature", "natural-sciences-technology": "nature", "natural-sciences": "nature",
  "homeland-society-and-civics": "society", history: "society", "life-skills": "society",
};

type Word = { unit: string; subject: string; word: string; meaning: string };

async function wordsOf(ui: string, grade: number): Promise<Word[]> {
  const ids = levelUnits(ui, grade).slice(0, 24);
  const out: Word[] = [];
  if (ui === "en") {
    for (const id of ids) {
      const t = zaTopic(id) as { s: string } | undefined; const u = (zaSets as Record<string, { words: string[]; defs?: Record<string, string> }>)[id];
      if (t && u) for (const w of u.words) if (u.defs?.[w]) out.push({ unit: id, subject: t.s, word: w, meaning: u.defs[w] });
    }
    return out;
  }
  const db = getAdminDb();
  const snaps = await db.getAll(...ids.map((id) => db.collection("curriculumSets").doc(id)));
  for (const s of snaps) {
    const t = CUR_TOPICS.find((x) => x.id === s.id);
    const words = s.get("set.words") as string[] | undefined; const defs = (s.get("defs") ?? {}) as Record<string, string>;
    if (t && Array.isArray(words)) for (const w of words) if (typeof w === "string" && defs[w]) out.push({ unit: s.id, subject: t.s, word: w, meaning: String(defs[w]) });
  }
  return out;
}

const WRITE = (lang: string, grade: number) => `You write questions for a children's vocabulary game, for grade ${grade}, in ${lang === "he" ? "Hebrew" : "English"}. Each item has a "host" word with its meaning and a "plant" word with its meaning, from another school subject.
1. "good": one natural sentence, 7 to 13 words, in simple language a child of that grade reads easily, in which the host word is used correctly in its meaning. The sentence must depend on the host: with another word in its place it would stop making sense. Use the host itself (an inflected form is fine). Never explain the word.
2. "bad": the SAME sentence with the host replaced by the plant word, changing nothing else except the inflection and agreement the grammar needs. The result must be fully grammatical, read like a normal sentence, and make no sense to someone who knows what the plant word means. It must not be funny by itself, not scary and not rude. Never turn a noun into a verb or invent a word form. If the plant cannot stand in that place grammatically, write a different "good" sentence in which it can; if none works, return "bad": "".
Return JSON: {"items":[{"i":number,"good":string,"bad":string}]}.`;
const JUDGE = `You judge single sentences for a children's vocabulary game. For each sentence, alone: "sense": does it make sense, with every word used in a proper meaning, so that it could describe something real? "clear": true only when someone who knows the words would decide the same without hesitating. "grammar": true only when the sentence is fully grammatical and every word is a real word form. Return JSON: {"items":[{"i":number,"sense":boolean,"clear":boolean,"grammar":boolean}]}.`;

(async () => {
  const measure = process.argv.includes("--measure");
  const specs = process.argv.slice(2).filter((a) => /^[a-z]{2}:\d+-\d+$/.test(a));
  const db = getAdminDb();
  let asked = 0, goodKept = 0, badKept = 0;
  for (const spec of specs) {
    const [ui, range] = spec.split(":"); const [from, to] = range.split("-").map(Number);
    const doneWords = new Set<string>();
    for (let grade = from; grade <= to; grade++) {
      const all = (await wordsOf(ui, grade)).filter((w) => !doneWords.has(w.word.toLowerCase()));
      // Each word once (a word of two units is asked in the first).
      const uniq: Word[] = []; const seen = new Set<string>();
      for (const w of all) { const k = w.word.toLowerCase(); if (!seen.has(k)) { seen.add(k); uniq.push(w); } }
      // A plant for every host: a word of another family, each word planted once.
      const pool = [...uniq].sort(() => Math.random() - 0.5); const used = new Set<number>();
      const pairs: Array<{ host: Word; plant: Word }> = [];
      for (const host of uniq) {
        const j = pool.findIndex((p, k) => !used.has(k) && FAMILY[p.subject] && FAMILY[host.subject] && FAMILY[p.subject] !== FAMILY[host.subject]);
        if (j < 0) continue;
        used.add(j); pairs.push({ host, plant: pool[j] });
      }
      const store = new Map<string, Record<string, { good?: string; bad?: string }>>();
      const put = (w: Word, k: "good" | "bad", text: string) => { const u = store.get(w.unit) ?? {}; u[w.word] = { ...(u[w.word] ?? {}), [k]: text }; store.set(w.unit, u); };
      const todo = measure ? pairs.slice(0, 10) : pairs;
      let next = 0;
      await Promise.all(Array.from({ length: 5 }, async () => {
        while (next < todo.length && usd < CAP_USD) {
          const part = todo.slice(next, next + 10); next += 10;
          const wr = await ask(WRITE(ui, grade), JSON.stringify(part.map((p, i) => ({ i, host: p.host.word, hostMeaning: p.host.meaning, plant: p.plant.word, plantMeaning: p.plant.meaning }))));
          const got = ((wr?.items ?? []) as Array<{ i: number; good: string; bad: string }>).filter((x) => part[x.i] && x.good);
          const flat = got.flatMap((x) => [{ k: `${x.i}g`, s: x.good }, ...(x.bad ? [{ k: `${x.i}b`, s: x.bad }] : [])]).sort((a, b) => (a.s < b.s ? -1 : 1));
          const jd = await ask(JUDGE, JSON.stringify(flat.map((f, i) => ({ i, sentence: f.s }))));
          const v = new Map<string, { sense: boolean; clear: boolean; grammar: boolean }>();
          for (const it of (jd?.items ?? []) as Array<{ i: number; sense: boolean; clear: boolean; grammar: boolean }>) if (flat[it.i]) v.set(flat[it.i].k, it);
          asked += part.length;
          for (const x of got) {
            const g = v.get(`${x.i}g`), b = v.get(`${x.i}b`);
            if (g?.sense === true && g.clear && g.grammar) { put(part[x.i].host, "good", x.good); goodKept++; }
            // The planted sentence is kept only together with its right one: it is the same sentence.
            if (g?.sense === true && g.clear && g.grammar && x.bad && b?.sense === false && b.clear && b.grammar) { put(part[x.i].plant, "bad", x.bad); badKept++; }
          }
        }
      }));
      if (!measure) {
        const writer = db.bulkWriter();
        for (const [unit, qs] of store) writer.set(db.collection("journeySense").doc(unit), { qs, lang: ui, at: new Date().toISOString() }, { merge: true });
        await writer.close();
      }
      for (const w of uniq) doneWords.add(w.word.toLowerCase());
      console.log(`${ui} grade ${grade} | words ${uniq.length} asked ${asked} | sensible kept ${goodKept} planted kept ${badKept} | spent $${usd.toFixed(3)}`);
      if (measure) { process.exit(0); }
    }
  }
  process.exit(0);
})();
