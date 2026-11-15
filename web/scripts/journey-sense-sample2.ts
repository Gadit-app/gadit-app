// Second sample for the journey's fourth question, "does this sentence make
// sense?" (Gadi 2026-11-15). The first sample's nonsense sentences repeated
// one pattern (ate it, wore it), so a child could spot the pattern without
// knowing the word. Here the wrong sentence is the RIGHT sentence of a word
// with a word of a far school subject planted in its place: only a child who
// knows the planted word sees that it does not belong.
//
// A second, blind call judges every sentence alone; a word is kept only when
// the right sentence is judged sensible, the planted one not, both clearly.
//
//   FIREBASE_SERVICE_ACCOUNT=... npx tsx --env-file=.env.local scripts/journey-sense-sample2.ts <out.json>
// Nothing is written to the database.
import { CUR_TOPICS, zaTopic } from "@/lib/curriculum-catalog";
import { nextLevelWords } from "@/lib/journey/level-words";
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

const FAMILY: Record<string, string> = {
  hebrew: "lang", literature: "lang", "english-home-language": "lang",
  mathematics: "math",
  "science-and-technology": "nature", geography: "nature", "natural-sciences-technology": "nature", "natural-sciences": "nature",
  "homeland-society-and-civics": "society", history: "society", "life-skills": "society",
};
const subjectOf = (ui: string, unitId: string): string => (ui === "en" ? (zaTopic(unitId) as { s?: string } | undefined)?.s : CUR_TOPICS.find((x) => x.id === unitId)?.s) ?? "";

const WRITE = (lang: string, grade: number) => `You write questions for a children's vocabulary game, for grade ${grade}, in ${lang === "he" ? "Hebrew" : "English"}. Each item has a word with its meaning, and a list "plant" of words from other school subjects with their meanings.
1. "good": one natural sentence, 7 to 13 words, in simple language a child of that grade reads easily, in which the word is used correctly in its meaning. The sentence must depend on the word: with another word in its place it would stop making sense. Use the word itself (an inflected form is fine). Never explain the word.
2. "bad": the SAME sentence, with the word replaced by ONE word of "plant", the one of the same part of speech, changing nothing else except the inflection the grammar needs. The result must read like a normal sentence that no longer makes sense to someone who knows what the planted word means. It must not be funny by itself, not scary and not rude. If no word of "plant" gives such a sentence, return "bad": "".
Return JSON: {"items":[{"i":number,"good":string,"bad":string,"planted":string}]}.`;
const JUDGE = `You judge single sentences for a children's vocabulary game. For each sentence, alone, decide whether it makes sense: is every word used in a proper meaning, so that the sentence could describe something real? "sense": true or false. "clear": true only when someone who knows the words would decide the same without hesitating. Return JSON: {"items":[{"i":number,"sense":boolean,"clear":boolean}]}.`;

type W = { word: string; meaning: string; subject: string };

(async () => {
  const plan: Array<[string, number, number]> = [["he", 1, 6], ["he", 2, 6], ["he", 3, 6], ["he", 4, 6], ["he", 5, 6], ["he", 6, 6], ["en", 4, 5], ["en", 5, 5], ["en", 6, 5], ["en", 7, 5]];
  const out: Array<{ lang: string; grade: number; word: string; good: string; bad: string; planted: string }> = []; let asked = 0;
  for (const [lang, grade, n] of plan) {
    const all: W[] = (await nextLevelWords(lang, grade, new Set(), [], 80)).map((w) => ({ word: w.word, meaning: w.meaning, subject: subjectOf(lang, w.id.replace(/^lvl-/, "").replace(/-\d+$/, "")) }));
    const step = Math.max(1, Math.floor(all.length / n));
    // Offset by two, so this sample does not repeat the words of the first one.
    const words = all.filter((_, i) => i % step === 2).slice(0, n);
    asked += words.length;
    const items = words.map((w, i) => ({
      i, word: w.word, meaning: w.meaning,
      plant: all.filter((x) => FAMILY[x.subject] && FAMILY[w.subject] && FAMILY[x.subject] !== FAMILY[w.subject] && x.word !== w.word).sort(() => Math.random() - 0.5).slice(0, 5).map((x) => ({ word: x.word, meaning: x.meaning })),
    }));
    const wr = await ask(WRITE(lang, grade), JSON.stringify(items));
    const pairs = ((wr?.items ?? []) as Array<{ i: number; good: string; bad: string; planted: string }>).filter((p) => words[p.i] && p.good && p.bad);
    const flat = pairs.flatMap((p) => [{ k: `${p.i}g`, s: p.good }, { k: `${p.i}b`, s: p.bad }]).sort((a, b) => (a.s < b.s ? -1 : 1));
    const jd = await ask(JUDGE, JSON.stringify(flat.map((f, i) => ({ i, sentence: f.s }))));
    const verdict = new Map<string, { sense: boolean; clear: boolean }>();
    for (const it of (jd?.items ?? []) as Array<{ i: number; sense: boolean; clear: boolean }>) if (flat[it.i]) verdict.set(flat[it.i].k, it);
    for (const p of pairs) {
      const g = verdict.get(`${p.i}g`), b = verdict.get(`${p.i}b`);
      if (g?.sense === true && g.clear && b?.sense === false && b.clear) out.push({ lang, grade, word: words[p.i].word, good: p.good, bad: p.bad, planted: p.planted });
    }
  }
  writeFileSync(process.argv[2] || "sense-sample2.json", JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ asked, kept: out.length, usd: Number(usd.toFixed(4)) }));
  process.exit(0);
})();
