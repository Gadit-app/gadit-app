"use client";

/**
 * play-engine — shared logic for the five Word Games.
 *
 * Data source: notebook entries hydrated with the offline IDB cache.
 * Notebook gives us (word, language, short meaning); IDB gives us full
 * meanings + examples. Games that need examples (fill-blank) only run
 * on entries we managed to hydrate.
 *
 * Anti-OpenAI: every game generates its questions client-side from
 * already-paid-for data. Zero per-play API cost.
 */

import { getCachedWord } from "@/lib/offline-db";
import type { WordResult } from "@/components/design/result";

export type GameId =
  | "quiz"
  | "fillblank"
  | "memory"
  | "anagram"
  | "speed"
  // ─── Curated-content games (no notebook dependency) ─────────
  // These run on hand-picked content from web/src/lib/play-content/
  // rather than the user's notebook. Always enabled — never gated on
  // pool size — because the content ships with the app.
  | "twin"      // Twin Trap: confusable word pairs (effect/affect, lay/lie)
  | "time"      // Time Traveler: pick the modern word whose meaning has drifted
  | "passport"  // Word Passport: guess the origin language of an English word
  | "friends"   // False Friends: real cognate or cross-language trap?
  | "root"      // Root Rush: tap the 3 words that share a Latin/Greek root
  | "shade"     // Shade Slider: order 5 synonyms from mildest to strongest
  | "build"     // Build-a-Word: assemble prefix+root+suffix to match a clue
  | "idiom"     // Idiom Decoder: literal description → real idiom meaning
  | "lens"      // Meaning Lens: pick which sense a sentence uses
  | "artist";   // Etymology Artist: literal root translation → modern word

/** One entry the engine can build games from. `examples` is only present
 *  when we found a full IDB cache hit. */
export type PlayWord = {
  word: string;
  language: string;
  meaning: string;
  examples: string[];
  uiLang: string; // the UI lang the word was cached under, for IDB lookups
};

/** Notebook list shape returned by GET /api/notebook. */
type NotebookItem = {
  word: string;
  language: string;
  meaning: string;
};

/** Minimum entries needed per game for the menu to enable them.
 *  Curated-content games (twin, time) use 0 — they ship with their own
 *  content and don't depend on the notebook. */
export const MIN_WORDS_FOR_GAME: Record<GameId, number> = {
  quiz: 4,
  fillblank: 4, // and we need examples, checked separately
  memory: 4,
  anagram: 1,
  speed: 4,
  twin: 0,
  time: 0,
  passport: 0,
  friends: 0,
  root: 0,
  shade: 0,
  build: 0,
  idiom: 0,
  lens: 0,
  artist: 0,
};

/** How many rounds per session. Curated games pick from their content
 *  pool; notebook games scale down if the pool is smaller. */
export const SESSION_SIZE: Record<GameId, number> = {
  quiz: 5,
  fillblank: 5,
  memory: 4, // 4 pairs = 8 cards
  anagram: 5,
  speed: 999, // continuous until timer
  twin: 8,   // 8 confusable rounds keeps the session under 2 minutes
  time: 6,   // 6 etymology shifts; each reveal slows the pace naturally
  passport: 6, // 6 origin guesses; each reveal is a story
  friends: 7,  // 7 binary picks; faster mechanic so we can fit more
  root: 5,     // 5 root families; each round = 3 correct + revealed distractors
  shade: 5,    // 5 ladders; ordering 5 cards each is slower than tap-once games
  build: 6,    // 6 morpheme assemblies; reveal-then-advance loop
  idiom: 6,    // 6 idioms; the literal description is the reveal hook
  lens: 6,     // 6 polysemy disambiguations; standard 4-choice
  artist: 6,   // 6 literal-translations; standard 4-choice
};

// ─── Direction helpers for per-language curated content ─────────

/** Returns the text direction for content rendered in the given language.
 *  Used by the curated games so Hebrew/Arabic rounds render RTL while
 *  Latin-script rounds render LTR. Components pass the `contentLang`
 *  (returned from each picker) here, not the UI lang — they only differ
 *  when we fall back to English content. */
export function dirForLang(lang: string): "rtl" | "ltr" {
  return lang === "he" || lang === "ar" ? "rtl" : "ltr";
}

// ─── Random utilities ──────────────────────────────────────────

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Hydrate notebook entries with IDB ──────────────────────────

/**
 * Load notebook + hydrate each entry with the offline cache.
 *
 * Returns the pool with `examples: []` for entries we couldn't hydrate;
 * fill-blank filters those out at game start. A second pass via
 * `hydrateExamples` can fill in some of those gaps from the Firestore
 * popular-words cache without ever calling OpenAI.
 */
export async function loadPlayWords(
  idToken: string,
  uiLang: string,
): Promise<PlayWord[]> {
  const res = await fetch("/api/notebook", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error(`notebook fetch failed: ${res.status}`);
  const data = (await res.json()) as { items: NotebookItem[] };
  const items = data.items ?? [];

  const hydrated = await Promise.all(
    items.map(async (it): Promise<PlayWord> => {
      const cached = await getCachedWord(uiLang, it.word);
      const result = cached?.result as WordResult | undefined;
      const allExamples = (result?.meanings ?? [])
        .flatMap((m) => m.examples ?? [])
        .filter((s) => typeof s === "string" && s.trim().length > 4);
      return {
        word: it.word,
        language: it.language,
        meaning: it.meaning,
        examples: allExamples,
        uiLang,
      };
    }),
  );

  // Entries with an empty word or meaning can't participate in any
  // game — drop them at the source instead of guarding every builder.
  // QA 2026-07-03.
  return hydrated.filter((p) => p.word.trim().length > 0 && p.meaning.trim().length > 0);
}

/**
 * Second-pass hydration via /api/quick-define for entries that didn't
 * have a local IDB cache hit. This is the main path that unlocks the
 * Fill-the-blank game for users who came via the popular-words pack
 * (their entries are in Firestore cache but never made it into IDB).
 *
 * - Read-only call against the Firestore `cache` collection — no OpenAI.
 * - Capped at TARGET hydrated entries so we don't fan out 500 calls for
 *   a freshly-loaded popular pack.
 * - Skips entries that already have examples.
 * - Best-effort: any individual fetch failure just leaves that entry
 *   alone; the surrounding game logic already handles examples=[].
 *
 * Call site: PlayClient kicks this off after the first paint so the
 * menu shows immediately, then fill-blank unlocks when the pool updates.
 */
const TARGET_HYDRATED = 16;

export async function hydrateExamples(pool: PlayWord[]): Promise<PlayWord[]> {
  const alreadyHydrated = pool.filter((p) => p.examples.length > 0).length;
  if (alreadyHydrated >= TARGET_HYDRATED) return pool;
  const needed = TARGET_HYDRATED - alreadyHydrated;

  const missing = pool.filter((p) => p.examples.length === 0).slice(0, needed * 2);
  if (missing.length === 0) return pool;

  const wordToExample = new Map<string, string>();
  const CHUNK = 8;
  for (let i = 0; i < missing.length && wordToExample.size < needed; i += CHUNK) {
    const slice = missing.slice(i, i + CHUNK);
    const results = await Promise.all(
      slice.map(async (w) => {
        try {
          const url = `/api/quick-define?word=${encodeURIComponent(w.word)}&lang=${encodeURIComponent(w.uiLang)}`;
          const res = await fetch(url);
          if (!res.ok) return null;
          const data = (await res.json()) as { example?: string };
          const ex = typeof data.example === "string" ? data.example.trim() : "";
          return ex.length > 4 ? { word: w.word, example: ex } : null;
        } catch {
          return null;
        }
      }),
    );
    results.filter(Boolean).forEach((r) => wordToExample.set(r!.word, r!.example));
  }

  if (wordToExample.size === 0) return pool;
  return pool.map((p) => {
    if (p.examples.length > 0) return p;
    const ex = wordToExample.get(p.word);
    return ex ? { ...p, examples: [ex] } : p;
  });
}

// ─── Quiz: definition match (bidirectional) ─────────────────────

export type QuizQuestion = {
  prompt: string; // either the word (→ pick meaning) or the meaning (→ pick word)
  promptKind: "word" | "meaning";
  options: string[]; // 4 strings, one is correct
  correctIdx: number;
  word: PlayWord; // for the "you missed these" recap
};

/**
 * Script family of the first alphabetic character in a string. Used to
 * filter distractors so a Hebrew notebook target never gets an English
 * distractor mixed into its answer options (which would let a player
 * eliminate wrong answers on script alone). Gadi 2026-06-29 on his
 * mixed-language notebook: word "דרך" showed one option in English.
 */
type Script = "hebrew" | "arabic" | "cyrillic" | "devanagari" | "cjk" | "latin" | "unknown";

function scriptOfChar(c: number): Script | null {
  if (c >= 0x0590 && c <= 0x05FF) return "hebrew";
  if ((c >= 0x0600 && c <= 0x06FF) || (c >= 0xFB50 && c <= 0xFDFF) || (c >= 0xFE70 && c <= 0xFEFF)) return "arabic";
  if (c >= 0x0400 && c <= 0x04FF) return "cyrillic";
  if (c >= 0x0900 && c <= 0x097F) return "devanagari";
  if ((c >= 0x3040 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF) || (c >= 0x4E00 && c <= 0x9FFF)) return "cjk";
  // Latin: basic Latin letters + Latin Supplement + Extended A/B
  // (covers phonetic marks, IPA symbols, historical Latin-derived
  // scripts). 0x0250–0x02AF was missing in v1 and let words with
  // phonetic marks classify as unknown, which then leaked past the
  // distractor script filter. Audit 2026-07-03.
  if (
    (c >= 0x0041 && c <= 0x005A) ||
    (c >= 0x0061 && c <= 0x007A) ||
    (c >= 0x00C0 && c <= 0x024F) ||
    (c >= 0x0250 && c <= 0x02AF) ||
    (c >= 0x1E00 && c <= 0x1EFF)
  ) return "latin";
  return null;
}

/** Script of the FIRST alphabetic character. Right for single words. */
function scriptOf(s: string): Script {
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c === undefined) continue;
    const sc = scriptOfChar(c);
    if (sc) return sc;
  }
  return "unknown";
}

/** DOMINANT script of a whole string — counts every letter and returns
 *  the script with the most. Right for sentences, where the first word
 *  can be a Latin brand name inside an otherwise-Hebrew sentence (or
 *  vice versa). Used to keep Fill-Blank carrier sentences in the same
 *  language as the word being blanked. QA 2026-07-03. */
function dominantScriptOf(s: string): Script {
  const counts = new Map<Script, number>();
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c === undefined) continue;
    const sc = scriptOfChar(c);
    if (sc) counts.set(sc, (counts.get(sc) ?? 0) + 1);
  }
  let best: Script = "unknown";
  let bestCount = 0;
  for (const [sc, n] of counts) {
    if (n > bestCount) { best = sc; bestCount = n; }
  }
  return best;
}

export function buildQuizQuestions(
  pool: PlayWord[],
  count: number,
): QuizQuestion[] {
  // Only pick target words that have at least one same-script
  // neighbour. A one-word-in-Hebrew-and-everything-else-English notebook
  // shouldn't produce a Hebrew round with zero Hebrew distractors.
  const wordScriptCounts = new Map<string, number>();
  const meaningScriptCounts = new Map<string, number>();
  for (const p of pool) {
    const ws = scriptOf(p.word);
    const ms = scriptOf(p.meaning);
    wordScriptCounts.set(ws, (wordScriptCounts.get(ws) ?? 0) + 1);
    meaningScriptCounts.set(ms, (meaningScriptCounts.get(ms) ?? 0) + 1);
  }
  const eligible = pool.filter((p) => {
    const ws = wordScriptCounts.get(scriptOf(p.word)) ?? 0;
    const ms = meaningScriptCounts.get(scriptOf(p.meaning)) ?? 0;
    // ws/ms includes the target itself, so need ≥2 for at least one
    // same-script neighbour to serve as distractor.
    return ws >= 2 && ms >= 2;
  });
  const targetSource = eligible.length >= Math.min(count, 2) ? eligible : pool;
  // Oversample: rounds that end up with fewer than 2 options are
  // dropped below, so grab extras to keep the session at `count`
  // when the pool allows. QA 2026-07-03.
  const targets = sample(targetSource, count * 2);
  const questions: QuizQuestion[] = [];
  for (const target of targets) {
    if (questions.length >= count) break;
    const q = buildOneQuizQuestion(pool, target);
    if (q) questions.push(q);
  }
  return questions;
}

function buildOneQuizQuestion(pool: PlayWord[], target: PlayWord): QuizQuestion | null {
  // Alternate direction so users practice both ways within one session.
  const promptKind: "word" | "meaning" = Math.random() < 0.5 ? "word" : "meaning";
  const distractorField = promptKind === "word" ? "meaning" : "word";
  const correct =
    promptKind === "word" ? target.meaning : target.word;
  const targetScript = scriptOf(correct);
  // Only use distractors written in the same script as the correct
  // answer — otherwise a Hebrew answer with an English distractor is
  // trivially unpickable and breaks the game. Gadi 2026-06-29.
  const candidates = pool.filter((p) => p.word !== target.word);
  const sameScriptCandidates = candidates.filter(
    (p) => scriptOf(p[distractorField as keyof PlayWord] as string) === targetScript,
  );
  // Dedup by the distractor STRING (not the PlayWord object) so a
  // notebook with two entries that share a meaning ("run" and
  // "sprint" both meaning "to move fast") never produces a round
  // with duplicate visible options. Also dedup against the correct
  // answer itself. Audit 2026-07-03.
  const seen = new Set<string>([correct]);
  const uniqueSameScript: string[] = [];
  for (const p of sameScriptCandidates) {
    const v = p[distractorField as keyof PlayWord] as string;
    if (!seen.has(v)) {
      seen.add(v);
      uniqueSameScript.push(v);
    }
  }
  const desiredDistractors = Math.min(3, uniqueSameScript.length);
  // One-button rounds teach nothing — drop the round instead.
  // The caller oversamples targets to compensate. QA 2026-07-03.
  if (desiredDistractors < 1) return null;
  const distractors = sample(uniqueSameScript, desiredDistractors);
  const options = shuffle([correct, ...distractors]);
  return {
    prompt: promptKind === "word" ? target.word : target.meaning,
    promptKind,
    options,
    correctIdx: options.indexOf(correct),
    word: target,
  };
}

// ─── Fill the blank ─────────────────────────────────────────────

export type FillBlankQuestion = {
  sentence: string; // example with the word replaced by ___
  options: string[];
  correctIdx: number;
  word: PlayWord;
};

const BLANK_TOKEN = "____";

function wordRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Unicode-aware word-boundaries don't exist universally; we wrap in
  // optional non-letter chars instead. \p{L} covers Hebrew, Arabic, Cyrillic.
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu");
}

/**
 * Examples this word can actually play Fill-Blank with. Two hard rules,
 * both from Gadi's 2026-07-03 screenshot ("The company celebrated the
 * ____ of its latest smartphone" with Hebrew options):
 *
 *  1. The sentence must CONTAIN the word — otherwise the blank was
 *     appended at the end, which reads as broken.
 *  2. The sentence minus the word must be predominantly the SAME script
 *     as the word. The define API can produce English carrier sentences
 *     for a Hebrew headword (examples localized to the UI language);
 *     an English sentence with four Hebrew options is not a usable round.
 */
export function usableFillBlankExamples(p: PlayWord): string[] {
  const wordScript = scriptOf(p.word);
  if (wordScript === "unknown") return [];
  const re = wordRegex(p.word);
  return p.examples.filter((ex) => {
    if (!re.test(ex)) return false;
    const carrier = ex.replace(re, " ");
    return dominantScriptOf(carrier) === wordScript;
  });
}

/** Replace the word in a sentence with the blank token. Callers pass
 *  examples pre-vetted by usableFillBlankExamples, so the fallback
 *  append should never fire — kept as a belt-and-braces guard. */
function blankOut(sentence: string, word: string): string {
  if (!word) return sentence;
  const re = wordRegex(word);
  if (re.test(sentence)) return sentence.replace(re, BLANK_TOKEN);
  return `${sentence} ${BLANK_TOKEN}`;
}

export function buildFillBlankQuestions(
  pool: PlayWord[],
  count: number,
): FillBlankQuestion[] {
  const withExamples = pool.filter((p) => usableFillBlankExamples(p).length > 0);
  // Oversample: some targets may produce degenerate rounds (fewer than
  // 2 options) and get dropped below — grab extras so the session still
  // reaches `count` when the pool allows it.
  const targets = sample(withExamples, count * 2);
  const questions: FillBlankQuestion[] = [];
  for (const target of targets) {
    if (questions.length >= count) break;
    const example = pickOne(usableFillBlankExamples(target));
    // Same script-matching guardrail as Quiz — a Hebrew target word
    // must not offer English distractor words.
    const targetScript = scriptOf(target.word);
    const candidates = pool.filter((p) => p.word !== target.word);
    const sameScriptCandidates = candidates.filter(
      (p) => scriptOf(p.word) === targetScript,
    );
    // Dedup by word string so duplicate notebook entries (rare but
    // possible) never render as duplicate options. Audit 2026-07-03.
    const seen = new Set<string>([target.word]);
    const uniqueSameScript: string[] = [];
    for (const p of sameScriptCandidates) {
      if (!seen.has(p.word)) {
        seen.add(p.word);
        uniqueSameScript.push(p.word);
      }
    }
    const desiredDistractors = Math.min(3, uniqueSameScript.length);
    // A round with a single button teaches nothing — drop it rather
    // than render it. QA 2026-07-03.
    if (desiredDistractors < 1) continue;
    const distractors = sample(uniqueSameScript, desiredDistractors);
    const options = shuffle([target.word, ...distractors]);
    questions.push({
      sentence: blankOut(example, target.word),
      options,
      correctIdx: options.indexOf(target.word),
      word: target,
    });
  }
  return questions;
}

// ─── Memory pairs ───────────────────────────────────────────────

export type MemoryCard = {
  id: string; // unique per card
  pairKey: string; // shared by the two cards of a pair
  kind: "word" | "meaning";
  text: string;
  word: PlayWord;
};

export function buildMemoryDeck(
  pool: PlayWord[],
  pairs: number,
): MemoryCard[] {
  // Dedup by word AND by meaning text before sampling: two entries
  // with the same visible meaning would put two identical-looking
  // cards on the board that belong to different pairs — an unguessable
  // round. QA 2026-07-03.
  const seenWord = new Set<string>();
  const seenMeaning = new Set<string>();
  const unique = pool.filter((p) => {
    const w = p.word.trim().toLowerCase();
    const m = p.meaning.trim().toLowerCase();
    if (!w || !m || seenWord.has(w) || seenMeaning.has(m)) return false;
    seenWord.add(w);
    seenMeaning.add(m);
    return true;
  });
  const chosen = sample(unique, pairs);
  const cards: MemoryCard[] = [];
  chosen.forEach((w, i) => {
    cards.push({ id: `w-${i}`, pairKey: `p-${i}`, kind: "word", text: w.word, word: w });
    cards.push({ id: `m-${i}`, pairKey: `p-${i}`, kind: "meaning", text: w.meaning, word: w });
  });
  return shuffle(cards);
}

// ─── Anagram (scramble letters) ─────────────────────────────────

export type AnagramRound = {
  scrambled: string[]; // array of single letters / glyphs
  word: PlayWord;
};

/** Split into grapheme-ish units. For Latin/Cyrillic each char is its own
 *  letter; for Hebrew/Arabic this also works because we ignore the niqqud
 *  level — we work with the letters as encoded. */
function splitLetters(word: string): string[] {
  return Array.from(word.trim());
}

export function buildAnagramRounds(
  pool: PlayWord[],
  count: number,
): AnagramRound[] {
  // Single-token words only: a multi-word entry ("תפוח אדמה") would
  // turn its space into an invisible, unplaceable tile and make the
  // round unsolvable. QA 2026-07-03.
  const singleToken = pool.filter((p) => !/\s/.test(p.word.trim()));
  // Filter: at least 3 letters, not too long (10+ is brutal as anagram).
  const usable = singleToken.filter((p) => {
    const letters = splitLetters(p.word);
    return letters.length >= 3 && letters.length <= 9;
  });
  // Fallback relaxes the length rule but never the single-token rule.
  const targets = sample(usable.length >= count ? usable : singleToken, count);
  return targets.map((target): AnagramRound => {
    let letters = splitLetters(target.word);
    // Shuffle until different from the original (so easy 3-letter words
    // aren't accidentally solved by the scramble itself).
    let attempts = 0;
    let scrambled = shuffle(letters);
    while (scrambled.join("") === letters.join("") && attempts < 5) {
      scrambled = shuffle(letters);
      attempts++;
    }
    return { scrambled, word: target };
  });
}

// ─── Speed round ────────────────────────────────────────────────

/** Speed reuses Quiz questions; we just generate a deep deck of them and
 *  cycle. 60-second timer drives the session length, not question count. */
export function buildSpeedDeck(pool: PlayWord[]): QuizQuestion[] {
  // Generate enough for a fast player: assume ~3 seconds per question
  // worst-case, so 30 should hold them for the whole minute.
  const N = Math.min(30, pool.length * 3);
  return buildQuizQuestions(pool, N);
}
