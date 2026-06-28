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
  | "root";     // Root Rush: tap the 3 words that share a Latin/Greek root

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
};

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

  return hydrated;
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

export function buildQuizQuestions(
  pool: PlayWord[],
  count: number,
): QuizQuestion[] {
  const targets = sample(pool, count);
  return targets.map((target): QuizQuestion => {
    // Alternate direction so users practice both ways within one session.
    const promptKind: "word" | "meaning" = Math.random() < 0.5 ? "word" : "meaning";
    const distractorField = promptKind === "word" ? "meaning" : "word";
    const distractors = sample(
      pool.filter((p) => p.word !== target.word),
      3,
    ).map((p) => p[distractorField as keyof PlayWord] as string);
    const correct =
      promptKind === "word" ? target.meaning : target.word;
    const options = shuffle([correct, ...distractors]);
    return {
      prompt: promptKind === "word" ? target.word : target.meaning,
      promptKind,
      options,
      correctIdx: options.indexOf(correct),
      word: target,
    };
  });
}

// ─── Fill the blank ─────────────────────────────────────────────

export type FillBlankQuestion = {
  sentence: string; // example with the word replaced by ___
  options: string[];
  correctIdx: number;
  word: PlayWord;
};

const BLANK_TOKEN = "____";

/** Replace the word (and common inflected variants) in a sentence with
 *  the blank token. Falls back to appending the blank if we can't find
 *  the word — not pretty but never breaks the game. */
function blankOut(sentence: string, word: string): string {
  if (!word) return sentence;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Unicode-aware word-boundaries don't exist universally; we wrap in
  // optional non-letter chars instead. \p{L} covers Hebrew, Arabic, Cyrillic.
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "iu");
  if (re.test(sentence)) return sentence.replace(re, BLANK_TOKEN);
  return `${sentence} ${BLANK_TOKEN}`;
}

export function buildFillBlankQuestions(
  pool: PlayWord[],
  count: number,
): FillBlankQuestion[] {
  const withExamples = pool.filter((p) => p.examples.length > 0);
  const targets = sample(withExamples, count);
  return targets.map((target): FillBlankQuestion => {
    const example = pickOne(target.examples);
    const distractors = sample(
      pool.filter((p) => p.word !== target.word),
      3,
    ).map((p) => p.word);
    const options = shuffle([target.word, ...distractors]);
    return {
      sentence: blankOut(example, target.word),
      options,
      correctIdx: options.indexOf(target.word),
      word: target,
    };
  });
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
  const chosen = sample(pool, pairs);
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
  // Filter: at least 3 letters, not too long (10+ is brutal as anagram).
  const usable = pool.filter((p) => {
    const letters = splitLetters(p.word);
    return letters.length >= 3 && letters.length <= 9;
  });
  const targets = sample(usable.length >= count ? usable : pool, count);
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
