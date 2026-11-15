// Sample for the journey's fourth question, "does this sentence make sense?"
// (Gadi 2026-11-15). For a word of the grade the engine writes two short
// sentences with the word: one where it is used in its meaning, and one that
// is grammatical but makes no sense because the word is used as if it meant
// something else. A second, blind call judges every sentence alone; a word is
// kept only when both judgements match what was intended and both are clear.
//
//   FIREBASE_SERVICE_ACCOUNT=... npx tsx --env-file=.env.local scripts/journey-sense-sample.ts
// Prints the kept questions as JSON and the cost. Nothing is written to the database.
import { nextLevelWords } from "../src/lib/journey/level-words";
import { writeFileSync } from "fs";

const KEY = process.env.OPENAI_API_KEY as string;
let usd = 0;
async function ask(system: string, user: string): Promise<{ items?: unknown[] } | null> {
  for (let t = 0; t < 3; t++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: "gpt-5.4", temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      });
      const j = await res.json();
      const u = j.usage; const c = u.prompt_tokens_details?.cached_tokens || 0;
      usd += ((u.prompt_tokens - c) * 2.5 + c * 0.25 + u.completion_tokens * 15) / 1e6;
      return JSON.parse(j.choices[0].message.content);
    } catch { if (t === 2) return null; }
  }
  return null;
}

const WRITE = (lang: string, grade: number) => `You write questions for a children's vocabulary game, for grade ${grade}, in ${lang === "he" ? "Hebrew" : "English"}. For each word (with its meaning) write two short sentences, 6 to 12 words, in simple language a child of that grade reads easily, each containing the word itself (an inflected form is fine). "good": the word is used correctly, in the given meaning, in an everyday situation. "bad": a grammatical sentence that makes no sense, because the word is used as if it were a different kind of thing (for example a place that is eaten, a number that is worn). The bad sentence must be clearly absurd to a child, not merely false or unusual, not scary and not rude. Never explain the word inside a sentence. Return JSON: {"items":[{"i":number,"good":string,"bad":string}]}.`;
const JUDGE = `You judge single sentences for a children's vocabulary game. For each sentence, alone, decide whether it makes sense: could it describe something real or ordinary, with every word used in a proper meaning? "sense": true or false. "clear": true only when a child would decide the same without hesitating. Return JSON: {"items":[{"i":number,"sense":boolean,"clear":boolean}]}.`;

type W = { word: string; meaning: string; lang: string; grade: number };

(async () => {
  const plan: Array<[string, number, number]> = [["he", 1, 6], ["he", 2, 6], ["he", 3, 6], ["he", 4, 6], ["he", 5, 6], ["he", 6, 6], ["en", 4, 5], ["en", 5, 5], ["en", 6, 5], ["en", 7, 5]];
  const out: Array<W & { good: string; bad: string }> = []; let asked = 0;
  for (const [lang, grade, n] of plan) {
    const all = await nextLevelWords(lang, grade, new Set(), [], 60);
    // Spread over the list, so the sample is not the first unit only.
    const step = Math.max(1, Math.floor(all.length / n));
    const words: W[] = all.filter((_, i) => i % step === 0).slice(0, n).map((w) => ({ word: w.word, meaning: w.meaning, lang, grade }));
    asked += words.length;
    const wr = await ask(WRITE(lang, grade), JSON.stringify(words.map((w, i) => ({ i, word: w.word, meaning: w.meaning }))));
    const pairs = ((wr?.items ?? []) as Array<{ i: number; good: string; bad: string }>).filter((p) => words[p.i] && p.good && p.bad);
    // Blind: every sentence alone, shuffled, with no word and no label.
    const flat = pairs.flatMap((p) => [{ k: `${p.i}g`, s: p.good }, { k: `${p.i}b`, s: p.bad }]).sort((a, b) => (a.s < b.s ? -1 : 1));
    const jd = await ask(JUDGE, JSON.stringify(flat.map((f, i) => ({ i, sentence: f.s }))));
    const verdict = new Map<string, { sense: boolean; clear: boolean }>();
    for (const it of (jd?.items ?? []) as Array<{ i: number; sense: boolean; clear: boolean }>) if (flat[it.i]) verdict.set(flat[it.i].k, it);
    for (const p of pairs) {
      const g = verdict.get(`${p.i}g`), b = verdict.get(`${p.i}b`);
      if (g?.sense === true && g.clear && b?.sense === false && b.clear) out.push({ ...words[p.i], good: p.good, bad: p.bad });
    }
  }
  writeFileSync(process.argv[2] || "sense-sample.json", JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ asked, kept: out.length, usd: Number(usd.toFixed(4)) }));
  process.exit(0);
})();
