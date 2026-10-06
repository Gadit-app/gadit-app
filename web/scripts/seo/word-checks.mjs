// Shared word-quality checks for the SEO scripts (shape, language, spelling).
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const env = fs.readFileSync(path.join(HERE, "../../.env.local"), "utf8");
// Running cost of every call made through these checks (USD), from the
// usage OpenAI returns: gpt-4o-mini $0.15/$0.60 and gpt-4o $2.50/$10 per 1M tokens.
export const spend = { usd: 0 };
const PRICE = { "gpt-4o-mini": [0.15, 0.6], "gpt-4o": [2.5, 10] };
function addUsage(model, j) {
  const u = j && j.usage; const p = PRICE[model];
  if (u && p) spend.usd += (u.prompt_tokens * p[0] + u.completion_tokens * p[1]) / 1e6;
}
const KEY = (env.match(/^OPENAI_API_KEY=(.*)$/m)?.[1] ?? "").trim().replace(/^["']|["']$/g, "");

export function looksLikeWord(w) {
  if (w.length < 2 || w.length > 30) return "length";
  if (/\d/.test(w)) return "digits";
  if (/https?:|www\.|@|\//.test(w)) return "url_or_email";
  if (/[<>{}[\]()=+*_#~^|\\]/.test(w)) return "code_chars";
  const letters = Array.from(w).filter((ch) => /\p{L}/u.test(ch)).length;
  if (letters / w.length < 0.7) return "not_letters";
  if (w.split(/\s+/).length > 3) return "too_many_words";
  return null;
}

export async function classify(batch) {
  const list = batch.map((c, i) => `${i + 1}. ${c.word} (${c.wordLanguage || "?"})`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You vet search terms before they are published as public dictionary pages. For each numbered term return one label: " +
            '"word" = a real dictionary word, idiom or common phrase in its language (including well-known places, brands and famous names that appear in dictionaries); ' +
            '"name" = a personal first name, surname or nickname of a private person; ' +
            '"private" = anything that looks like personal information (an address, a username, an ID, a private nickname); ' +
            '"junk" = gibberish or not a real term; ' +
            '"misspelled" = a misspelling of a real word, even a close one (receipe, sacreligiuos, a Hebrew word with a wrong or missing letter); judge the spelling in the term own language; ' +
            '"sensitive" = sexual, drug, graphic-violence or hate terms that a learning brand for children should not publish as a page. ' +
            'Reply as JSON mapping each number to its label, e.g. {"1": "word", "2": "name"}.',
        },
        { role: "user", content: list },
      ],
    }),
  });
  const j = await res.json();
  addUsage("gpt-4o-mini", j);
  try {
    const obj = JSON.parse(j.choices[0].message.content);
    const map = obj.labels && typeof obj.labels === "object" ? obj.labels : obj;
    return batch.map((_, i) => String(map[String(i + 1)] ?? "unknown").toLowerCase());
  } catch {
    return batch.map(() => "unknown");
  }
}

export async function spellCheck(batch) {
  const list = batch.map((c, i) => `${i + 1}. ${c.word} (${c.wordLanguage || "?"})`).join("\n");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'For each numbered term, say whether it is spelled exactly as a standard dictionary would spell it in its language (inflected forms and real phrases are fine). Missing, extra or wrong letters mean "misspelled". Reply as JSON mapping each number to "ok" or "misspelled".' },
        { role: "user", content: list },
      ],
    }),
  });
  const j = await res.json();
  addUsage("gpt-4o", j);
  try {
    const map = JSON.parse(j.choices[0].message.content);
    return batch.map((_, i) => String(map[String(i + 1)] ?? "unknown").toLowerCase());
  } catch {
    return batch.map(() => "unknown");
  }
}
