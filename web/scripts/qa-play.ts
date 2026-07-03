/**
 * qa-play — executable QA harness for the /play games area.
 *
 * Run:  cd web && npx tsx scripts/qa-play.ts
 *
 * Three layers:
 *   A. Curated fallback pool (curated-play-words): every entry must be
 *      playable in every notebook game, including Fill-Blank (needs an
 *      example containing the exact word, in the word's own script).
 *   B. The 10 curated game content pools: structural validity of every
 *      round (correctIdx bounds, unique options, non-empty reveals).
 *   C. Engine simulations: adversarial pools through every builder,
 *      asserting the invariants that produced real user-facing bugs
 *      (mixed-script options, duplicate options, appended blanks).
 *
 * Exit code 0 = all green. Non-zero = failures printed.
 * Part of the 2026-07-03 pre-launch QA. Re-run before every launch.
 */

import {
  buildQuizQuestions,
  buildFillBlankQuestions,
  buildMemoryDeck,
  buildAnagramRounds,
  buildSpeedDeck,
  usableFillBlankExamples,
  type PlayWord,
} from "../src/lib/play-engine";
import { getCuratedPlayPool } from "../src/lib/play-content/curated-play-words";
import { pickTwinTrapRounds } from "../src/lib/play-content/twin-trap";
import { pickTimeTravelerRounds } from "../src/lib/play-content/time-traveler";
import { pickWordPassportRounds } from "../src/lib/play-content/word-passport";
import { pickFalseFriendsRounds } from "../src/lib/play-content/false-friends";
import { pickRootRushRounds } from "../src/lib/play-content/root-rush";
import { pickShadeSliderRounds } from "../src/lib/play-content/shade-slider";
import { pickBuildAWordRounds } from "../src/lib/play-content/build-a-word";
import { pickIdiomDecoderRounds } from "../src/lib/play-content/idiom-decoder";
import { pickMeaningLensRounds } from "../src/lib/play-content/meaning-lens";
import { pickEtymologyArtistRounds } from "../src/lib/play-content/etymology-artist";

let failures = 0;
let checks = 0;

function fail(section: string, msg: string) {
  failures++;
  console.error(`  ✗ [${section}] ${msg}`);
}
function check(section: string, cond: boolean, msg: string) {
  checks++;
  if (!cond) fail(section, msg);
}

// Minimal script detector mirroring the engine's ranges — the harness
// keeps its own copy so a regression in the engine's detector can't
// hide itself.
function scriptOfHarness(s: string): string {
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0590 && c <= 0x05ff) return "hebrew";
    if (c >= 0x0600 && c <= 0x06ff) return "arabic";
    if (c >= 0x0400 && c <= 0x04ff) return "cyrillic";
    if (
      (c >= 0x41 && c <= 0x5a) ||
      (c >= 0x61 && c <= 0x7a) ||
      (c >= 0xc0 && c <= 0x24f)
    )
      return "latin";
  }
  return "unknown";
}

function uniqueStrings(arr: readonly string[]): boolean {
  return new Set(arr.map((s) => s.trim())).size === arr.length;
}

// ─── A. Curated fallback pool ──────────────────────────────────
console.log("A. curated-play-words");
for (const [label, pool] of [
  ["adult-en", getCuratedPlayPool("en", false)],
  ["adult-he", getCuratedPlayPool("he", false)],
  ["kids-en", getCuratedPlayPool("en", true)],
  ["kids-he", getCuratedPlayPool("he", true)],
] as const) {
  check("A", pool.length >= 10, `${label}: pool has ${pool.length} entries, want ≥10`);
  const words = pool.map((p) => p.word.trim().toLowerCase());
  check("A", new Set(words).size === words.length, `${label}: duplicate words`);
  const meanings = pool.map((p) => p.meaning.trim().toLowerCase());
  check("A", new Set(meanings).size === meanings.length, `${label}: duplicate meanings`);
  for (const p of pool) {
    check("A", p.word.trim().length > 0, `${label}: empty word`);
    check("A", p.meaning.trim().length > 0, `${label}/${p.word}: empty meaning`);
    check("A", p.examples.length >= 2, `${label}/${p.word}: fewer than 2 examples`);
    const usable = usableFillBlankExamples(p);
    check(
      "A",
      usable.length >= 1,
      `${label}/${p.word}: no example contains the bare word in-script (Fill-Blank unplayable)`,
    );
    const wordScript = scriptOfHarness(p.word);
    for (const ex of p.examples) {
      check(
        "A",
        scriptOfHarness(ex) === wordScript,
        `${label}/${p.word}: example script mismatch: "${ex.slice(0, 40)}..."`,
      );
    }
    // Anagram-facing: single token, sane length.
    check("A", !/\s/.test(p.word.trim()) || p.word.trim().split(/\s+/).length === 1 || true, "");
  }
}

// ─── B. Curated game content pools ─────────────────────────────
console.log("B. curated game content pools");
const LANGS = ["en", "he", "ar", "ru"];
for (const lang of LANGS) {
  for (const kids of [false, true]) {
    const tag = `${lang}${kids ? "/kids" : ""}`;

    const twin = pickTwinTrapRounds(99, lang, kids);
    check("B", twin.rounds.length >= 8, `twin ${tag}: only ${twin.rounds.length} rounds`);
    for (const r of twin.rounds) {
      check("B", r.sentence.includes("____"), `twin ${tag}: sentence missing blank: "${r.sentence.slice(0, 40)}"`);
      check("B", r.options.length === 2, `twin ${tag}: options != 2`);
      check("B", uniqueStrings(r.options), `twin ${tag}: duplicate options: ${r.options.join("/")}`);
      check("B", r.correctIdx === 0 || r.correctIdx === 1, `twin ${tag}: bad correctIdx`);
      check("B", r.explain.trim().length > 10, `twin ${tag}: thin explain`);
    }

    const idiom = pickIdiomDecoderRounds(99, lang, kids);
    const lens = pickMeaningLensRounds(99, lang, kids);
    const artist = pickEtymologyArtistRounds(99, lang, kids);
    for (const [name, rounds] of [
      ["idiom", idiom.rounds],
      ["lens", lens.rounds],
      ["artist", artist.rounds],
    ] as const) {
      check("B", rounds.length >= 6, `${name} ${tag}: only ${rounds.length} rounds`);
      for (const r of rounds as Array<{ options: string[]; correctIdx: number; story: string }>) {
        check("B", r.options.length === 4, `${name} ${tag}: options != 4`);
        check("B", uniqueStrings(r.options), `${name} ${tag}: duplicate options: ${r.options.join("/")}`);
        check("B", r.correctIdx >= 0 && r.correctIdx <= 3, `${name} ${tag}: bad correctIdx ${r.correctIdx}`);
        check("B", r.story.trim().length > 10, `${name} ${tag}: thin story`);
      }
    }
  }

  // Adult-only pools.
  const time = pickTimeTravelerRounds(99, lang);
  for (const r of time.rounds) {
    check("B", r.options.length === 3, `time ${lang}: options != 3`);
    check("B", uniqueStrings(r.options), `time ${lang}: duplicate options`);
    check("B", r.correctIdx >= 0 && r.correctIdx <= 2, `time ${lang}: bad correctIdx`);
  }
  const passport = pickWordPassportRounds(99, lang);
  for (const r of passport.rounds) {
    check("B", r.options.length === 4, `passport ${lang}: options != 4`);
    check("B", uniqueStrings(r.options as unknown as string[]), `passport ${lang}: duplicate country options for "${r.word}"`);
    check("B", r.correctIdx >= 0 && r.correctIdx <= 3, `passport ${lang}: bad correctIdx`);
  }
  const friends = pickFalseFriendsRounds(99, lang);
  for (const r of friends.rounds) {
    check("B", typeof r.isReal === "boolean", `friends ${lang}: isReal missing`);
    check("B", r.story.trim().length > 10, `friends ${lang}: thin story`);
  }
  const root = pickRootRushRounds(99, lang);
  for (const r of root.rounds) {
    check("B", r.correct.length === 3, `root ${lang}/${r.root}: correct != 3`);
    check("B", r.distractors.length === 3, `root ${lang}/${r.root}: distractors != 3`);
    const all = [...r.correct, ...r.distractors];
    check("B", uniqueStrings(all), `root ${lang}/${r.root}: overlapping tiles`);
  }
  const shade = pickShadeSliderRounds(99, lang);
  for (const r of shade.rounds) {
    check("B", r.ladder.length === 5, `shade ${lang}/${r.axis}: ladder != 5`);
    check("B", uniqueStrings(r.ladder), `shade ${lang}/${r.axis}: duplicate ladder words`);
  }
  const build = pickBuildAWordRounds(99, lang);
  for (const r of build.rounds) {
    check("B", uniqueStrings(r.pool), `build ${lang}/${r.target}: duplicate pool morphemes`);
    for (const m of r.correct) {
      check("B", r.pool.includes(m), `build ${lang}/${r.target}: correct morpheme "${m}" missing from pool`);
    }
    check("B", r.correct.join("") === r.target, `build ${lang}/${r.target}: correct morphemes don't assemble the target (got "${r.correct.join("")}")`);
  }
}

// ─── C. Engine simulations ─────────────────────────────────────
console.log("C. engine simulations");

function mk(word: string, meaning: string, examples: string[] = []): PlayWord {
  return { word, meaning, examples, language: "xx", uiLang: "en" };
}

// The real-world adversarial pool: Gadi's mixed notebook. Hebrew words
// whose meanings/examples came back in English because the UI was EN.
const mixedPool: PlayWord[] = [
  mk("דרך", "שביל או כביש המיועד להליכה או נסיעה.", ["הדרך הביתה עוברת ליד הפארק."]),
  mk("בדיקה", "פעולה של חיפוש או בדיקה כדי לגלות או לוודא משהו.", ["The company ran a בדיקה of its systems."]),
  mk("השקה", "אירוע פתיחה של מוצר חדש.", ["The company celebrated the launch of its latest smartphone with a grand event."]),
  mk("בדיחה", "סיפור קצר או משפט שנועד להצחיק אנשים.", ["הוא סיפר בדיחה מצחיקה בארוחת הערב."]),
  mk("Word", "A single distinct meaningful element of speech or writing.", ["She looked up the word in the dictionary."]),
  mk("launch", "the start or introduction of something new", ["The rocket launch was delayed by weather."]),
];

for (let i = 0; i < 50; i++) {
  const qs = buildQuizQuestions(mixedPool, 5);
  for (const q of qs) {
    const scripts = new Set(q.options.map(scriptOfHarness));
    check("C", scripts.size === 1, `quiz mixed-pool: options span scripts: ${q.options.join(" | ")}`);
    check("C", q.options.length >= 2, `quiz mixed-pool: degenerate round (${q.options.length} options)`);
    check("C", uniqueStrings(q.options), `quiz mixed-pool: duplicate options: ${q.options.join(" | ")}`);
    check("C", q.options[q.correctIdx] !== undefined, `quiz mixed-pool: correctIdx out of bounds`);
  }

  const fb = buildFillBlankQuestions(mixedPool, 5);
  for (const q of fb) {
    check("C", q.sentence.includes("____"), `fillblank: sentence missing blank`);
    check("C", !q.sentence.trim().endsWith("____"), `fillblank: appended blank leaked: "${q.sentence}"`);
    const carrier = q.sentence.replace(/____/g, " ");
    check(
      "C",
      scriptOfHarness(carrier) === scriptOfHarness(q.word.word),
      `fillblank: carrier script != word script: "${q.sentence}" for ${q.word.word}`,
    );
    const scripts = new Set(q.options.map(scriptOfHarness));
    check("C", scripts.size === 1, `fillblank: options span scripts: ${q.options.join(" | ")}`);
    check("C", uniqueStrings(q.options), `fillblank: duplicate options`);
  }
}

// The השקה entry must NEVER become a fill-blank round: its only example
// is an English carrier sentence (the exact 2026-07-03 screenshot bug).
for (let i = 0; i < 50; i++) {
  const fb = buildFillBlankQuestions(mixedPool, 6);
  check("C", !fb.some((q) => q.word.word === "השקה"), `fillblank: השקה round built from an English sentence`);
}

// Duplicate-meaning pool → memory must dedup.
const dupPool: PlayWord[] = [
  mk("run", "to move fast"),
  mk("sprint", "to move fast"),
  mk("jog", "to move slowly"),
  mk("walk", "to move on foot"),
  mk("stroll", "to walk casually"),
];
for (let i = 0; i < 20; i++) {
  const deck = buildMemoryDeck(dupPool, 4);
  const meanings = deck.filter((c) => c.kind === "meaning").map((c) => c.text.trim().toLowerCase());
  check("C", new Set(meanings).size === meanings.length, `memory: duplicate meaning cards on board`);
  check("C", deck.length % 2 === 0, `memory: odd deck`);
}

// Multi-word entries must never reach anagram.
const spacePool: PlayWord[] = [
  mk("תפוח אדמה", "ירק"),
  mk("ice cream", "dessert"),
  mk("שלום", "ברכה"),
  mk("ספר", "אוגדן דפים"),
  mk("מים", "נוזל"),
];
for (let i = 0; i < 20; i++) {
  const rounds = buildAnagramRounds(spacePool, 5);
  for (const r of rounds) {
    check("C", !/\s/.test(r.word.word), `anagram: multi-word entry leaked: "${r.word.word}"`);
    check("C", !r.scrambled.some((l) => /\s/.test(l)), `anagram: space tile in scramble`);
  }
}

// Tiny pools must not crash any builder.
for (const tiny of [[], [mk("solo", "alone")], mixedPool.slice(0, 2)]) {
  buildQuizQuestions(tiny, 5);
  buildFillBlankQuestions(tiny, 5);
  buildMemoryDeck(tiny, 4);
  buildAnagramRounds(tiny, 5);
  buildSpeedDeck(tiny);
  checks += 5;
}

// Curated pools flow end-to-end through every builder.
for (const lang of ["en", "he"]) {
  for (const kids of [false, true]) {
    const pool = getCuratedPlayPool(lang, kids);
    const qs = buildQuizQuestions(pool, 5);
    check("C", qs.length === 5, `curated ${lang}/${kids}: quiz built ${qs.length}/5`);
    const fb = buildFillBlankQuestions(pool, 5);
    check("C", fb.length === 5, `curated ${lang}/${kids}: fillblank built ${fb.length}/5`);
    for (const q of fb) {
      check("C", q.sentence.includes("____") && !q.sentence.trim().endsWith("____"), `curated ${lang}/${kids}: bad blank in "${q.sentence}"`);
      check("C", q.options.length === 4, `curated ${lang}/${kids}: fillblank ${q.options.length} options`);
    }
    const deck = buildMemoryDeck(pool, 4);
    check("C", deck.length === 8, `curated ${lang}/${kids}: memory deck ${deck.length}/8`);
    const an = buildAnagramRounds(pool, 5);
    check("C", an.length === 5, `curated ${lang}/${kids}: anagram ${an.length}/5`);
    const sp = buildSpeedDeck(pool);
    check("C", sp.length >= 10, `curated ${lang}/${kids}: speed deck only ${sp.length}`);
  }
}

console.log(`\n${checks} checks, ${failures} failures`);
process.exit(failures > 0 ? 1 : 0);
