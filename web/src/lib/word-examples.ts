import crypto from "node:crypto";
import { getAdminDb } from "@/lib/firebase-admin";

/**
 * Subject-appropriate example sentences for classroom / present mode.
 *
 * The general /api/define result gives three examples for the FIRST
 * meaning of a word, which drifts off-topic for polysemous curriculum
 * words: "אות" (a letter of the alphabet, in the classroom sense) was
 * getting a musical "אות" example. In a set the teacher already told us
 * the exact sense via the curated definition, so we generate examples
 * pinned to THAT meaning and cache them per (uiLang, word, meaning).
 *
 * Cheap by design: gpt-4o-mini, one call per unique (word, meaning),
 * cached in Firestore exampleCache/<key> so the classroom never pays
 * twice for the same word.
 */

const UI_LANG_NAMES: Record<string, string> = {
  he: "Hebrew",
  en: "English",
  ar: "Arabic",
  ru: "Russian",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  cs: "Czech",
  sk: "Slovak",
  it: "Italian",
  ja: "Japanese",
  hi: "Hindi",
  am: "Amharic",
  uk: "Ukrainian",
  tr: "Turkish",
  pl: "Polish",
  fa: "Persian",
  id: "Indonesian",
  nl: "Dutch",
  el: "Greek",
  zu: "Zulu",
  vi: "Vietnamese",
  fil: "Filipino",
  af: "Afrikaans",
  sw: "Swahili",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  ko: "Korean",
  th: "Thai",
  bn: "Bengali",
  da: "Danish",
  hu: "Hungarian",
};

export function uiLangName(uiLang: string): string {
  return UI_LANG_NAMES[uiLang] ?? "English";
}

/**
 * Cache key for a (uiLang, word, meaning) example set. Mirrors the
 * image cache key shape so the two stay in lockstep: same trim +
 * lowercase normalisation, sha256, 24-char slice, `ex_<lang>_` prefix.
 */
export function exampleCacheKey(word: string, meaning: string, uiLang: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${uiLang}|${word.trim().toLowerCase()}|${meaning.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 24);
  return `ex_${uiLang}_${hash}`;
}

/** Split the model's reply into up to 3 clean example lines. */
function parseExamples(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    // Strip any leading numbering / bullets the model added despite
    // being told not to ("1.", "1)", "- ", "• ").
    .map((l) => l.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 3);
}

/**
 * Pure LLM generator — three example sentences in `uiLang` using `word`
 * in EXACTLY the given `meaning`. No caching. Returns [] on any failure
 * so callers can fall back to the general define examples.
 */
export async function generateExamples(word: string, meaning: string, uiLang: string): Promise<string[]> {
  const langName = uiLangName(uiLang);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content:
              "You write short, natural example sentences for a children's educational dictionary. You stay strictly within the ONE meaning the user gives you and never drift to another sense of the word.",
          },
          {
            role: "user",
            content: `Give 3 short natural example sentences in ${langName} using the word "${word}" in EXACTLY this meaning: ${meaning}\nStay in that sense only. One sentence per line, no numbering.`,
          },
        ],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw = String(data?.choices?.[0]?.message?.content || "");
    return parseExamples(raw);
  } catch {
    return [];
  }
}

export type ExampleResult = {
  examples: string[];
  cached: boolean;
  generated: boolean;
};

/**
 * Cache-first accessor. Returns cached examples when present; otherwise
 * (when `generate` is true) generates + caches them. With `force` it
 * regenerates even on a cache hit. `generate:false` is the cheap read
 * path (e.g. the review grid) that never spends an OpenAI call.
 */
export async function getOrGenerateExamples(
  word: string,
  meaning: string,
  uiLang: string,
  opts: { generate?: boolean; force?: boolean } = {},
): Promise<ExampleResult> {
  const { generate = true, force = false } = opts;
  const db = getAdminDb();
  const key = exampleCacheKey(word, meaning, uiLang);
  const ref = db.collection("exampleCache").doc(key);

  if (!force) {
    const snap = await ref.get();
    const cached = snap.data()?.examples as string[] | undefined;
    if (Array.isArray(cached) && cached.length > 0) {
      return { examples: cached, cached: true, generated: false };
    }
  }

  if (!generate) {
    return { examples: [], cached: false, generated: false };
  }

  const examples = await generateExamples(word, meaning, uiLang);
  if (examples.length === 0) {
    return { examples: [], cached: false, generated: false };
  }

  await ref.set({
    examples,
    word,
    meaning: meaning.slice(0, 500),
    uiLang,
    createdAt: new Date().toISOString(),
  });
  return { examples, cached: false, generated: true };
}
