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
  /** One short line per blank, in the UI language: why the answer fits.
   *  Written by the blind check (contextCheckMessages), not by the writer. */
  why: string[];
  /** Set on a story that lives in the story store (`contextStories`). */
  id?: string;
};

export const CONTEXT_ROUNDS = 3;
/** Most stories the writer makes: spares, since the blind check drops some
 *  (5 short ones in Kids Mode, 4 longer ones otherwise, to keep the wait short). */
export const CONTEXT_WRITE = CONTEXT_ROUNDS + 2;

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

export function contextMessages(words: string[], lang: string, kids: boolean) {
  const L = langName(lang);
  const blanks = kids ? 2 : 3;
  const needed = blanks * CONTEXT_ROUNDS;
  const reader = kids ? "children aged 6 to 9" : "learners aged 10 and up (often children)";
  const length = kids ? "exactly 2 short, simple sentences" : "3 or 4 sentences";
  const count = kids ? CONTEXT_WRITE : CONTEXT_WRITE - 1;
  const system = `You write a reading game for ${reader}. Return JSON only.

Write ${count} different short stories in ${L}. Each story is ${length} and has exactly ${blanks} blanks. Write the whole story with the answers in it, and put each answer inside double square brackets, like this: She [[stumbled]] on a stone. Every story has exactly ${blanks} words in double square brackets, no more and no fewer.
The answer of every blank is one of the practice words below, in the form the sentence needs (a past tense, a plural, an ending). The story is natural, correct ${L}: change the form of the word whenever the grammar needs it, never bend the sentence around the given form. Inside one story every blank has a different practice word. Spread the practice words over the stories (with ${needed} or more words, use each one once), but never force a word into a story where it does not sit naturally: skip that word.
Use for the blanks only words whose meaning a reader can work out from a story. Leave out numbers, names of people, places or brands, greetings and small grammar words (like "the", "of", "את", "של"), and build the stories from the other words. The brackets hold the whole word with its endings, never part of a word.
The answer of a blank never appears anywhere else in its story, outside its brackets.
Each story makes only one answer right for each blank, and the clues are spread over the whole story, so the reader has to read all of it, not only the sentence with the blank.
Before you finish a story, read it the way the child will: answers hidden, the whole word bar in front of you. The clue must point to the answer, never away from it (a coat goes with a cold morning, so a coat is never a clue for "warm"). If a reader who does not already know the answer could pick another word from the bar, rewrite the story.

For each story give 4 distractors in ${L}. A good distractor has the same part of speech and form as one of the blanks, so it would sound fine if you read only that one sentence, but a clue in another sentence of the story makes it clearly wrong (for "stumbled" in a story where she almost fell: "jumped" or "danced"). A distractor is a word of the same kind with a different meaning, never a synonym of an answer, and it fits no blank once the whole story is read. When you are not sure a distractor is wrong, choose another one.

Content is safe and kind for children: everyday life, school, family, animals, nature, play. No violence, fear, romance, brands or real people; use simple invented first names. Never use long dashes (— or –).

JSON shape:
{"stories":[{"text":"the story with each answer in [[double brackets]]","base":["the practice word of the 1st bracket, as given in the list","..."],"distractors":["d1","d2","d3","d4"]}]}`;
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

/** Letters only, for comparing word forms: no vowel marks, Hebrew final
 *  letters and Arabic letter variants folded to one shape. */
function fold(s: string): string {
  return norm(s)
    .replace(/[\u0591-\u05C7\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[ךםןףץ]/g, (c) => ({ "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" })[c] ?? c)
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[^\p{L}\p{M}]/gu, "");
}

/** True when `answer` is a form of the practice word `base` ("served" of
 *  "serve", "בהתמדה" of "התמדה", "مكتوب" of "كتب"): the base's letters show
 *  in order inside the answer, one may be missing on longer words. Stops the
 *  writer from swapping in a word of its own ("נזהרו" claimed as "ירא"). */
function isFormOf(answer: string, base: string, lang: string): boolean {
  const a = fold(answer);
  const b = fold(base);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  let at = 0;
  let missing = 0;
  for (const ch of b) {
    const k = a.indexOf(ch, at);
    if (k < 0) { missing++; continue; }
    at = k + 1;
  }
  return missing <= (b.length >= 4 || NO_SPACES.has(lang) ? 1 : 0);
}

/** Checks one story from the model; null when it is broken. */
function cleanStory(raw: unknown, words: string[], lang: string): ContextRound | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as { text?: unknown; base?: unknown; distractors?: unknown };
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
  const baseIn = arr(o.base);
  if (answers.length < 2 || answers.length > 3) return null;
  if (segments.length !== answers.length + 1) return null;
  if (answers.some((a) => !a)) return null;
  if (new Set(answers.map(norm)).size !== answers.length) return null;
  // A blank that holds only part of a word ("[[אל]]יה") reads as a broken word.
  if (!NO_SPACES.has(lang) && segments.slice(1).some((s) => /^[\p{L}\p{M}]/u.test(s))) return null;
  // Up to 4 distractors: the blind check removes any that also fit a blank.
  const seen = new Set(answers.map(norm));
  const distractors = arr(o.distractors).filter((d) => {
    const k = norm(d);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 4);
  if (distractors.length < 2) return null;
  const options = [...answers, ...distractors];
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
  // Every blank practices one of the child's words, never a word the writer chose.
  if (base.some((b, i) => !sent.has(norm(b)) || !isFormOf(answers[i], b, lang))) return null;
  return { segments, answers, base, options: shuffle(options), why: [] };
}

/** The writer's JSON → the stories that pass the shape checks (up to
 *  CONTEXT_WRITE), still without "why": the blind check comes next. */
export function parseContextRounds(content: string, words: string[], lang: string): ContextRound[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { return []; }
  const stories = (parsed as { stories?: unknown })?.stories;
  if (!Array.isArray(stories)) return [];
  return stories
    .map((s) => cleanStory(s, words, lang))
    .filter((r): r is ContextRound => r !== null)
    .slice(0, CONTEXT_WRITE);
}

/**
 * The writer's JSON as it is still being written (2026-11-12, Gadi: the child
 * waited about 20 s for all the stories before the first one showed). Feed it
 * the text as it streams in; it gives back each story the moment its closing
 * brace arrives, already through the shape checks, so the blind check of the
 * first story can start while the writer is still on the second.
 */
export function contextStoryScanner(words: string[], lang: string): { push: (chunk: string) => ContextRound[] } {
  let text = "";
  let at = 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;
  let taken = 0;
  return {
    push(chunk: string): ContextRound[] {
      text += chunk;
      const out: ContextRound[] = [];
      for (; at < text.length; at++) {
        const ch = text[at];
        if (inString) {
          if (escaped) escaped = false;
          else if (ch === "\\") escaped = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') inString = true;
        else if (ch === "{") {
          depth++;
          // Depth 1 is the whole answer, depth 2 is one story.
          if (depth === 2) start = at;
        } else if (ch === "}") {
          if (depth === 2 && start >= 0) {
            let raw: unknown = null;
            try { raw = JSON.parse(text.slice(start, at + 1)); } catch { /* a broken story is skipped */ }
            const r = taken < CONTEXT_WRITE ? cleanStory(raw, words, lang) : null;
            if (r) { taken++; out.push(r); }
            start = -1;
          }
          depth--;
        }
      }
      return out;
    },
  };
}

/**
 * The blind check (2026-11-09, after a parent's report: "Mia put on her coat
 * because the morning was [warm]", with "cold" marked wrong). A second call
 * gets each story with its blanks numbered and its word bar, but not the
 * answers, and solves it like a child would. It also writes the "why" from
 * the clue it used, so the explanation names a real clue in the story.
 */
export function contextCheckMessages(rounds: ContextRound[], lang: string, ui: string, kids: boolean) {
  const L = langName(lang);
  const U = langName(ui);
  const reader = kids ? "children aged 6 to 9" : "learners aged 10 and up (often children)";
  const heb = ui === "he" ? "\nThe \"why\" lines are in Hebrew. Tell about the people in the story in the third person; only when a line speaks to the reader, use the plural (אתם), never the singular." : "";
  const system = `You check a reading game for ${reader} before a child sees it. Return JSON only.

Each story below is in ${L} and has numbered blanks ([1], [2], ...). Under it is its word bar: every word the child can put in a blank. The game says each blank has exactly one right word in the bar.

Solve each story as a careful reader who has never seen it: read the whole story, then choose for each blank the word from the bar that fits best.
Then list for each blank in "alsoFits" every OTHER word in the bar that would also make a correct, sensible story in that blank, even if it is less likely. Be strict: when nothing in the story rules a word out, it also fits (in "Tom ate a [1] apple" with "red" and "green" in the bar, both fit). A word that breaks the grammar of the sentence does not fit.
Set "storyOk" to false when the story itself would confuse a child: it does not make sense, has a language mistake, or uses a word from the bar in a wrong or strange way once the right words are in. Otherwise set it to true.
For each blank write "why": one short, simple sentence in ${U} for the child, that names the clue in the story and how it leads to the word you chose, for example: "cold fits because Mia put on her coat, and we wear a coat when it is cold". Quote the word as it is written in the bar. The "why" talks only about this word: it never names another word or says that another word could also fit. Never write a "why" that only repeats the story or says that the story says so. Never use long dashes.${heb}

JSON shape, one entry per story in order, one entry per blank in order:
{"stories":[{"storyOk":true,"blanks":[{"pick":"a word from the bar","alsoFits":[],"why":"..."}]}]}`;
  const user = rounds
    .map((r, i) => {
      let text = r.segments[0];
      r.answers.forEach((_, j) => { text += `[${j + 1}]` + r.segments[j + 1]; });
      return `Story ${i + 1}: ${text}\nWord bar: ${r.options.join(", ")}`;
    })
    .join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

const unquote = (s: string) => s.replace(/^["'“”„«»‘’]+|["'“”„«»‘’.,!?;:]+$/g, "").trim();

/** Keeps only the stories the blind reader found sound and solved exactly
 *  (its pick is the answer for every blank, and no other answer also fits a
 *  blank), with its "why" lines attached. A distractor it says also fits a
 *  blank leaves the word bar; a story needs 2 distractors left to play. */
export function applyContextCheck(rounds: ContextRound[], content: string): ContextRound[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { return []; }
  const stories = (parsed as { stories?: unknown })?.stories;
  if (!Array.isArray(stories)) return [];
  const out: ContextRound[] = [];
  rounds.forEach((r, i) => {
    const st = stories[i] as { blanks?: unknown; storyOk?: unknown } | undefined;
    if (st?.storyOk !== true) return;
    const blanks = st.blanks;
    if (!Array.isArray(blanks) || blanks.length !== r.answers.length) return;
    const bar = new Set(r.options.map(norm));
    const answers = r.answers.map(norm);
    const story = norm(r.segments.map((seg, k) => seg + (r.answers[k] ?? "")).join(""));
    const alsoFit = new Set<string>();
    const why: string[] = [];
    for (let j = 0; j < answers.length; j++) {
      const b = (blanks[j] ?? {}) as { pick?: unknown; alsoFits?: unknown; why?: unknown };
      if (norm(unquote(clean(b.pick, 60))) !== answers[j]) return;
      const also = (Array.isArray(b.alsoFits) ? b.alsoFits : [])
        .map((x) => norm(unquote(clean(x, 60))))
        .filter((x) => x && x !== answers[j] && bar.has(x));
      if (also.some((x) => answers.includes(x))) return;
      also.forEach((x) => alsoFit.add(x));
      const w = clean(b.why, 200);
      if (!w) return;
      // A quoted word must be an answer or come from the story: a "why"
      // that brings in an outside word ("London could fit too") confuses.
      for (const m of w.matchAll(/["“”„«»]([^"“”„«»]{1,40})["“”„«»]/g)) {
        const q = norm(m[1]);
        if (!answers.includes(q) && !story.includes(q)) return;
      }
      why.push(w);
    }
    const distractors = r.options.filter((o) => !answers.includes(norm(o)) && !alsoFit.has(norm(o)));
    if (distractors.length < 2) return;
    out.push({ ...r, options: shuffle([...r.answers, ...distractors.slice(0, 2)]), why });
  });
  return out;
}

/*
 * The story store (2026-11-12, Gadi: even with streaming the first story took
 * 15 to 31 s, so the game now starts from stories written and checked ahead).
 * One Firestore doc per checked story in `contextStories`. A story fits a
 * child when every word it practices is in the child's pool, so it carries one
 * key per practice word, "lang|ui|kids|word": the language, the UI language of
 * its "why" lines and Kids Mode sit inside the key, and one array-contains-any
 * query on `keys` finds the candidates with the automatic single-field index
 * (no composite index to deploy).
 */
export const CONTEXT_STORE = "contextStories";
/** Most pool words the route looks up: 3 queries of 30 keys (Firestore's limit per query). */
export const CONTEXT_POOL_MAX = 90;

export function storyKey(lang: string, ui: string, kids: boolean, word: string): string {
  return `${lang}|${ui}|${kids ? 1 : 0}|${norm(word)}`;
}

/** A short hash without node:crypto, since this file also loads in the browser. */
function hash32x2(str: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

/** The doc of one checked story: the same text for the same reader is the same doc. */
export function storyDoc(r: ContextRound, lang: string, ui: string, kids: boolean, src: "seed" | "live") {
  const text = r.segments.map((seg, i) => seg + (r.answers[i] ?? "")).join("");
  const sig = `v1|${lang}|${ui}|${kids ? 1 : 0}|${norm(text)}`;
  const id = hash32x2(sig, 1) + hash32x2(sig, 2);
  const base = [...new Set(r.base.map(norm))];
  const round = { segments: r.segments, answers: r.answers, base: r.base, options: r.options, why: r.why };
  return { id, data: { v: 1, lang, ui, kids, base, keys: base.map((b) => storyKey(lang, ui, kids, b)), round, src, at: new Date().toISOString() } };
}

/** A stored doc back to a round; null when it is not a whole story. */
export function storedRound(id: string, data: unknown): ContextRound | null {
  const r = (data as { round?: Partial<ContextRound> } | undefined)?.round;
  if (!r) return null;
  const strs = (x: unknown): x is string[] => Array.isArray(x) && x.every((v) => typeof v === "string" && v !== "");
  const { segments, answers, base, options, why } = r;
  if (!Array.isArray(segments) || !segments.every((v) => typeof v === "string")) return null;
  if (!strs(answers) || !strs(base) || !strs(options) || !strs(why)) return null;
  if (answers.length < 2 || segments.length !== answers.length + 1) return null;
  if (base.length !== answers.length || why.length !== answers.length || options.length < answers.length + 2) return null;
  return { segments, answers, base, options, why, id };
}

/**
 * The stories of one game out of the stored candidates: every practice word is
 * in the child's pool, and no word is practiced twice in a game. Stories the
 * child has not played come first, the ones on the session's `prefer` words
 * (the newest notebook words) before the others. When the child has played
 * them all, the one played longest ago still comes back alone, so the game
 * opens at once while new stories are written (`seen` runs oldest to newest).
 */
export function pickStories(cands: ContextRound[], pool: string[], prefer: string[], seen: string[], want: number): ContextRound[] {
  const inPool = new Set(pool.map(norm));
  const liked = new Set(prefer.map(norm));
  const ids = new Set<string>();
  const usable = cands.filter((r) => {
    if (!r.id || ids.has(r.id) || !r.base.every((b) => inPool.has(norm(b)))) return false;
    ids.add(r.id);
    return true;
  });
  const seenAt = new Map(seen.map((id, i) => [id, i]));
  const score = (r: ContextRound) => r.base.filter((b) => liked.has(norm(b))).length;
  const fresh = shuffle(usable.filter((r) => !seenAt.has(r.id as string))).sort((a, b) => score(b) - score(a));
  const used = new Set<string>();
  const out: ContextRound[] = [];
  for (const r of fresh) {
    if (out.length >= want) break;
    const b = r.base.map(norm);
    if (b.some((w) => used.has(w))) continue;
    b.forEach((w) => used.add(w));
    out.push(r);
  }
  if (!out.length && want > 0) {
    const old = usable.sort((a, b) => (seenAt.get(a.id as string) ?? 0) - (seenAt.get(b.id as string) ?? 0))[0];
    if (old) out.push(old);
  }
  return out;
}
