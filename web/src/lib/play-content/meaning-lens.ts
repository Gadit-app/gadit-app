/**
 * Meaning Lens — polysemy disambiguation game content.
 *
 * Each round shows a polysemous word (one with multiple distinct
 * meanings) in a specific sentence. The player picks which meaning the
 * sentence is using. Same word, four meanings, one is correct here.
 *
 * Text-only V1. V2 will add AI-generated images for each meaning
 * (the original "Meaning Lens" pitch). The text version still teaches
 * the core skill: spotting which sense of a word a sentence selects.
 *
 * Why it matters: polysemy is the single biggest gap between fluent
 * and native-feeling English. "Bat" has nothing to do with "bat" — but
 * a native speaker never confuses them, because context locks the sense.
 */

export type MeaningLensRound = {
  /** The polysemous word — same across all four options. */
  word: string;
  /** The sentence using the word in ONE of its senses. */
  sentence: string;
  /** Four meaning-glosses. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the meaning actually used in the sentence. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal explaining the disambiguation cue in the sentence. ≤180 chars. */
  story: string;
};

export const MEANING_LENS_ROUNDS: MeaningLensRound[] = [
  {
    word: "bat",
    sentence: "She swung the bat hard at the curveball.",
    options: [
      "a flying nocturnal mammal",
      "a wooden stick used in baseball",
      "an old word for an eyelash flicker",
      "a brick of pressed clay",
    ],
    correctIdx: 1,
    story: "Verb 'swung' + 'curveball' locks it as the sports tool. Same letters as the animal, but the contexts never overlap. That's polysemy doing its job.",
  },
  {
    word: "bank",
    sentence: "They sat on the grassy bank watching the river flow.",
    options: [
      "a financial institution",
      "a tilt of an aircraft in flight",
      "the rising edge of a river",
      "a row of stored objects (a bank of computers)",
    ],
    correctIdx: 2,
    story: "'Grassy' + 'river flow' fixes the geographic sense. English uses bank for both money and rivers from totally separate roots that converged in spelling.",
  },
  {
    word: "spring",
    sentence: "The spring in the chair finally snapped after years of use.",
    options: [
      "the season after winter",
      "a coiled metal device",
      "to leap upward suddenly",
      "a natural water source",
    ],
    correctIdx: 1,
    story: "'In the chair' + 'snapped' locks the mechanical sense. All four meanings share an Old English root meaning to leap or burst forth — water, season, spring, all leaping.",
  },
  {
    word: "spring",
    sentence: "We hiked all the way to the spring to fill our bottles.",
    options: [
      "the season after winter",
      "a coiled metal device",
      "to leap upward suddenly",
      "a natural water source",
    ],
    correctIdx: 3,
    story: "'Fill our bottles' fixes the water sense. Same word, totally different referent. The sentence does all the disambiguation work, instantly.",
  },
  {
    word: "match",
    sentence: "This blue scarf doesn't match your jacket.",
    options: [
      "a small stick used to start fires",
      "a sports contest",
      "to be visually compatible",
      "an arranged partnership",
    ],
    correctIdx: 2,
    story: "'Scarf' + 'doesn't match' + 'jacket' fixes the aesthetic sense. Fashion English is full of polysemous verbs that change role with every noun.",
  },
  {
    word: "letter",
    sentence: "The letter 'Q' is rarely used in English without a 'u'.",
    options: [
      "a written or printed message",
      "a single character of an alphabet",
      "a permission to act (a letter of credit)",
      "an academic emblem on clothing",
    ],
    correctIdx: 1,
    story: "Quoting 'Q' and 'u' is the giveaway — those are characters, not envelope content. English uses the same word for both for historical reasons.",
  },
  {
    word: "ring",
    sentence: "The boxer entered the ring to thunderous applause.",
    options: [
      "a circle of metal worn on a finger",
      "a square mat for combat sports",
      "to make a bell sound",
      "a group of people up to something secret",
    ],
    correctIdx: 1,
    story: "'Boxer' + 'entered' locks the arena sense. Funny etymological joke: boxing rings are always SQUARE. The word survived the shape change.",
  },
  {
    word: "fly",
    sentence: "There's a fly buzzing around the kitchen.",
    options: [
      "to travel through the air",
      "a small insect with wings",
      "the front opening of trousers",
      "clever or stylish (informal slang)",
    ],
    correctIdx: 1,
    story: "'Buzzing' is the lock — only insects do that. The verb 'fly' and the noun 'fly' (insect) share a deep ancestor; the others are later add-ons.",
  },
  {
    word: "light",
    sentence: "This backpack is much lighter than it looks.",
    options: [
      "illumination from a source",
      "low in weight",
      "pale in colour",
      "free from worry (light-hearted)",
    ],
    correctIdx: 1,
    story: "'Backpack' + comparative 'lighter than' fixes weight. English bundled weight, brightness, and colour into one word — they come from two separate Old English roots that fused.",
  },
  {
    word: "head",
    sentence: "The CEO heads the company's strategy team.",
    options: [
      "the upper body part containing the brain",
      "the top of something (the head of the bed)",
      "to be in charge of something",
      "the foam on a glass of beer",
    ],
    correctIdx: 2,
    story: "Verb-form 'heads' + 'company' + 'team' fixes leadership. From the body-part meaning English derives 'leader' (the leading head) — same metaphor as Spanish jefe.",
  },
  {
    word: "trunk",
    sentence: "We loaded the suitcases into the trunk and drove off.",
    options: [
      "an elephant's long nose",
      "the main stem of a tree",
      "a large storage chest",
      "the cargo space of a car",
    ],
    correctIdx: 3,
    story: "'Suitcases' + 'drove off' = American car-cargo sense. British English uses 'boot'. All four trunk meanings (elephant, tree, chest, car) share the idea of a central container.",
  },
  {
    word: "scale",
    sentence: "You'll need to scale the diagram to fit the page.",
    options: [
      "a graded series of measurements",
      "the hard plates on a fish or reptile",
      "a device for weighing things",
      "to resize while keeping proportions",
    ],
    correctIdx: 3,
    story: "Verb 'scale' + 'fit the page' fixes the resize sense. The same word in 'scale a mountain' means to climb — yet another sense English just packed in.",
  },
  {
    word: "race",
    sentence: "Her heart began to race as the deadline approached.",
    options: [
      "a competition of speed",
      "a major group of human ancestry",
      "to move very fast or beat fast",
      "a strong current of water",
    ],
    correctIdx: 2,
    story: "'Heart began to' + 'deadline' fixes the speeding sense. The verb-noun ambiguity is everywhere in English — context picks the role in milliseconds.",
  },
];

export function pickMeaningLensRounds(count: number): MeaningLensRound[] {
  const shuffled = MEANING_LENS_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
