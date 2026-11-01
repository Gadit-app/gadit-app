/**
 * Context Detective (2026-11-01): the prompt and the server-side checks for
 * the "sentence completion v2" game. A short story with 2 or 3 blanks, the
 * child's own practice words as the answers, plus 2 distractors that fit the
 * grammar of a blank but not the meaning of the whole story.
 *
 * No imports on purpose: the route uses it, and so does the cost-sample
 * script (plain `node` with type stripping).
 */

export type ContextRound = {
  /** The text between the blanks: segments.length === answers.length + 1. */
  segments: string[];
  /** The right word for each blank, as it appears in the word bar. */
  answers: string[];
  /** The practice word each blank practices (its dictionary form). */
  base: string[];
  /** answers + 2 distractors, shuffled. */
  options: string[];
  /** One short line per blank, in the UI language: why the answer fits. */
  why: string[];
};

export const CONTEXT_ROUNDS = 3;

const LANG_NAME: Record<string, string> = {
  he: "Hebrew", en: "English", ar: "Arabic", ru: "Russian", es: "Spanish", pt: "Portuguese", fr: "French",
  de: "German", cs: "Czech", sk: "Slovak", it: "Italian", ja: "Japanese", hi: "Hindi", am: "Amharic",
  uk: "Ukrainian", tr: "Turkish", pl: "Polish", fa: "Persian", id: "Indonesian", nl: "Dutch", el: "Greek",
  zu: "Zulu (isiZulu)", vi: "Vietnamese", fil: "Filipino", af: "Afrikaans", sw: "Swahili", "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese", ko: "Korean", th: "Thai", bn: "Bengali", da: "Danish", hu: "Hungarian",
  xh: "Xhosa (isiXhosa)", nso: "Northern Sotho (Sepedi)", tn: "Tswana (Setswana)", st: "Southern Sotho (Sesotho)",
  ts: "Tsonga (Xitsonga)", ss: "Swati (siSwati)", ve: "Venda (Tshivenda)", nr: "South Ndebele (isiNdebele)",
};

export function langName(code: string): string {
  if (LANG_NAME[code]) return LANG_NAME[code];
  try { return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code; } catch { return code; }
}

/** Languages written without spaces between words: the "answer is already
 *  in the story" check is a plain substring test there. */
const NO_SPACES = new Set(["ja", "zh-CN", "zh-TW", "th"]);

export function contextMessages(words: string[], lang: string, ui: string, kids: boolean) {
  const L = langName(lang);
  const U = langName(ui);
  const blanks = kids ? 2 : 3;
  const needed = blanks * CONTEXT_ROUNDS;
  const reader = kids ? "children aged 6 to 9" : "learners aged 10 and up (often children)";
  const length = kids ? "exactly 2 short, simple sentences" : "3 or 4 sentences";
  const heb = ui === "he" ? "\nThe explanations are in Hebrew: when they speak to the reader, use the plural (אתם), never the singular." : "";
  const system = `You write a reading game for ${reader}. Return JSON only.

Write ${CONTEXT_ROUNDS} different short stories in ${L}. Each story is ${length} and has exactly ${blanks} blanks. Write the whole story with the answers in it, and put each answer inside double square brackets, like this: She [[stumbled]] on a stone. Every story has exactly ${blanks} words in double square brackets, no more and no fewer.
The answer of every blank is one of the practice words below, in the form the sentence needs (a past tense, a plural, an ending). The story is natural, correct ${L}: change the form of the word whenever the grammar needs it, never bend the sentence around the given form. Inside one story every blank has a different practice word. Use each practice word once in the whole game when there are at least ${needed} words; only when there are fewer may a word come back in another story.
The answer of a blank never appears anywhere else in its story, outside its brackets.
Each story makes only one answer right for each blank, and the clues are spread over the whole story, so the reader has to read all of it, not only the sentence with the blank.

For each story give 2 distractors in ${L}. A good distractor has the same part of speech and form as one of the blanks, so it would sound fine if you read only that one sentence, but a clue in another sentence of the story makes it clearly wrong (for "stumbled" in a story where she almost fell: "jumped" or "danced"). A distractor is a word of the same kind with a different meaning, never a synonym of an answer, and it fits no blank once the whole story is read.

For each blank give "why": one short sentence in ${U} that tells the reader why the answer fits, pointing at the clue in the story, for example: "stumbled fits because she almost fell". Quote the answer as it is written in the story.${heb}

Content is safe and kind for children: everyday life, school, family, animals, nature, play. No violence, fear, romance, brands or real people; use simple invented first names. Never use long dashes (— or –).

JSON shape:
{"stories":[{"text":"the story with each answer in [[double brackets]]","base":["the practice word of the 1st bracket, as given in the list","..."],"distractors":["d1","d2"],"why":["why for the 1st bracket","why for the 2nd bracket"]}]}`;
  const user = `Practice words (${L}): ${words.join(", ")}`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

const clean = (s: unknown, max = 400) =>
  String(s ?? "").replace(/[–—]/g, ",").replace(/\s+/g, " ").trim().slice(0, max);

const norm = (s: string) => s.normalize("NFC").toLowerCase().trim();

function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when `answer` already shows in the story text (the blank would be free). */
function appearsIn(text: string, answer: string, lang: string): boolean {
  const t = norm(text);
  const a = norm(answer);
  if (!a) return true;
  if (NO_SPACES.has(lang)) return t.includes(a);
  return new RegExp(`(?<![\\p{L}\\p{M}])${escapeRe(a)}(?![\\p{L}\\p{M}])`, "u").test(t);
}

/** Checks one story from the model; null when it is broken. */
function cleanStory(raw: unknown, words: string[], lang: string): ContextRound | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as { text?: unknown; base?: unknown; distractors?: unknown; why?: unknown };
  const text = clean(o.text, 900);
  // The story comes whole, each answer in [[double brackets]]: the brackets
  // become the blanks, so the text and its answers can never disagree.
  const parts = text.split(/\[\[([^\]]*)\]\]/);
  const segments = parts.filter((_, i) => i % 2 === 0).map((s, i, all) => {
    // Keep the spaces next to a blank; trim only the story's two ends.
    if (i === 0) return s.replace(/^\s+/, "");
    if (i === all.length - 1) return s.replace(/\s+$/, "");
    return s;
  });
  const answers = parts.filter((_, i) => i % 2 === 1).map((a) => a.trim());
  if (segments.some((s) => /\[\[|\]\]|_{3,}/.test(s))) return null;
  const arr = (x: unknown) => (Array.isArray(x) ? x.map((v) => clean(v, 60)) : []);
  const distractors = arr(o.distractors);
  const why = (Array.isArray(o.why) ? o.why : []).map((v) => clean(v, 200).replace(/\[\[|\]\]/g, ""));
  const baseIn = arr(o.base);
  if (answers.length < 2 || answers.length > 3) return null;
  if (segments.length !== answers.length + 1) return null;
  if (distractors.length < 2 || why.length !== answers.length) return null;
  if (answers.some((a) => !a) || why.some((w) => !w)) return null;
  const options = [...answers, ...distractors.slice(0, 2)];
  if (options.some((x) => !x)) return null;
  if (new Set(options.map(norm)).size !== options.length) return null;
  const joined = segments.join(" ");
  if (answers.some((a) => appearsIn(joined, a, lang))) return null;
  // The practice word of each blank: the model's own "base" when it is one
  // of the words we sent, else the sent word the answer starts with, else
  // the answer itself.
  const sent = new Map(words.map((w) => [norm(w), w]));
  const base = answers.map((a, i) => {
    const b = sent.get(norm(baseIn[i] ?? ""));
    if (b) return b;
    const direct = sent.get(norm(a));
    if (direct) return direct;
    const pre = words.find((w) => norm(a).startsWith(norm(w)) || norm(w).startsWith(norm(a)));
    return pre ?? a;
  });
  return { segments, answers, base, options: shuffle(options), why };
}

/** The model's JSON → the rounds that pass every check. */
export function parseContextRounds(content: string, words: string[], lang: string): ContextRound[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { return []; }
  const stories = (parsed as { stories?: unknown })?.stories;
  if (!Array.isArray(stories)) return [];
  return stories
    .map((s) => cleanStory(s, words, lang))
    .filter((r): r is ContextRound => r !== null)
    .slice(0, CONTEXT_ROUNDS);
}
