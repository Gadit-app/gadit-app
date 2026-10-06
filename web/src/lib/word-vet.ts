import { logAiUsage, usageFrom } from "@/lib/ai-cost";

/**
 * Word-quality checks for public word pages, server-side twin of
 * scripts/seo/word-checks.mjs (Gadi 2026-10-06). A word is "index ok" when it
 * looks like a word, a language check calls it a real dictionary word or
 * common phrase (not a personal name, private information, a sensitive term or
 * junk), and a spelling check finds it spelled correctly. Costs are logged as
 * admin spend, so the daily admin cap (lib/ai-budget.ts) also covers this.
 */

export function looksLikeWord(w: string): boolean {
  if (w.length < 2 || w.length > 30) return false;
  if (/\d/.test(w)) return false;
  if (/https?:|www\.|@|\//.test(w)) return false;
  if (/[<>{}[\]()=+*_#~^|\\]/.test(w)) return false;
  const letters = Array.from(w).filter((ch) => /\p{L}/u.test(ch)).length;
  if (letters / w.length < 0.7) return false;
  return w.split(/\s+/).length <= 3;
}

type Item = { word: string; language: string };

async function ask(model: string, system: string, items: Item[], feature: string): Promise<string[]> {
  const list = items.map((c, i) => `${i + 1}. ${c.word} (${c.language || "?"})`).join("\n");
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: list },
        ],
      }),
    });
    const j = await res.json();
    const u = usageFrom(j);
    void logAiUsage({ feature, model, tokensIn: u.tokensIn, tokensOut: u.tokensOut, plan: "admin", admin: true });
    const map = JSON.parse(j.choices?.[0]?.message?.content ?? "{}") as Record<string, string>;
    return items.map((_, i) => String(map[String(i + 1)] ?? "unknown").toLowerCase());
  } catch {
    return items.map(() => "unknown");
  }
}

const CLASSIFY =
  'You vet search terms before they are published as public dictionary pages. For each numbered term return one label: ' +
  '"word" = a real dictionary word, idiom or common phrase in its language (including well-known places, brands and famous names that appear in dictionaries); ' +
  '"name" = a personal first name, surname or nickname of a private person; ' +
  '"private" = anything that looks like personal information; ' +
  '"junk" = gibberish or not a real term; ' +
  '"misspelled" = a misspelling of a real word, even a close one; ' +
  '"sensitive" = sexual, drug, graphic-violence or hate terms that a learning brand for children should not publish as a page. ' +
  'Reply as JSON mapping each number to its label, e.g. {"1": "word", "2": "name"}.';

const SPELL =
  'For each numbered term, say whether it is spelled exactly as a standard dictionary would spell it in its language (inflected forms and real phrases are fine). Missing, extra or wrong letters mean "misspelled". Reply as JSON mapping each number to "ok" or "misspelled".';

/** One verdict per item, in order. */
export async function vetWords(items: Item[]): Promise<boolean[]> {
  const verdict: (boolean | null)[] = items.map((c) => (looksLikeWord(c.word) ? null : false));
  const toClassify = items.map((c, i) => ({ c, i })).filter((x) => verdict[x.i] === null);
  const batches = <T,>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, k) => arr.slice(k * n, k * n + n));

  await Promise.all(
    batches(toClassify, 30).map(async (b) => {
      const labels = await ask("gpt-4o-mini", CLASSIFY, b.map((x) => x.c), "seo_vet");
      b.forEach((x, k) => { if (!["word", "idiom", "phrase"].includes(labels[k])) verdict[x.i] = false; });
    }),
  );
  const toSpell = items.map((c, i) => ({ c, i })).filter((x) => verdict[x.i] === null);
  await Promise.all(
    batches(toSpell, 30).map(async (b) => {
      const labels = await ask("gpt-4o", SPELL, b.map((x) => x.c), "seo_vet");
      b.forEach((x, k) => { verdict[x.i] = labels[k] === "ok"; });
    }),
  );
  return verdict.map((v) => v === true);
}
