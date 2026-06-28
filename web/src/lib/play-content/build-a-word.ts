/**
 * Build-a-Word — morphology game content.
 *
 * Each round shows a meaning ("not able to be broken") and a pool of
 * morpheme tiles. Player taps tiles in order: prefix → root → suffix
 * (some rounds skip prefix or suffix). The slots fill, the word forms.
 *
 * It's spelling-bee, but with structure — kids assemble words rather
 * than recall them. Far less anxiety, much more retention.
 *
 * Distractor tiles are visible-similar morphemes from different roots
 * (un- vs in-; -able vs -ible). They feel like real choices.
 */

export type BuildAWordRound = {
  /** The target English word. Used to validate the build. */
  target: string;
  /** Plain-English clue. ≤80 chars. */
  clue: string;
  /** Ordered correct morpheme sequence to build the target. */
  correct: string[];
  /** All tiles in the pool — correct + distractors. Display order is
   *  randomised per session. */
  pool: string[];
  /** Reveal explaining the build. ≤180 chars. */
  story: string;
};

export const BUILD_A_WORD_ROUNDS: BuildAWordRound[] = [
  {
    target: "unbreakable",
    clue: "not able to be broken",
    correct: ["un", "break", "able"],
    pool: ["un", "re", "break", "vis", "able", "ful"],
    story: "un- (not) + break (the action) + -able (capable of). English builds layered meaning by stacking morphemes.",
  },
  {
    target: "rewritable",
    clue: "able to be written again",
    correct: ["re", "writ", "able"],
    pool: ["re", "un", "writ", "spect", "able", "ful"],
    story: "re- (again) + writ (write, from Latin scribere) + -able (capable of). Three pieces, infinite combinations.",
  },
  {
    target: "invisible",
    clue: "not able to be seen",
    correct: ["in", "vis", "ible"],
    pool: ["in", "un", "vis", "aud", "ible", "able"],
    story: "in- (not) + vis (see, from Latin videre) + -ible (the Latin twin of -able). Same job, Latin-y feel.",
  },
  {
    target: "preview",
    clue: "to look at before",
    correct: ["pre", "view"],
    pool: ["pre", "re", "view", "spect", "post", "ist"],
    story: "pre- (before) + view (look). Two pieces, but the meaning is precise: not just to look — to look ahead of the moment.",
  },
  {
    target: "predict",
    clue: "to say something before it happens",
    correct: ["pre", "dict"],
    pool: ["pre", "post", "dict", "vis", "tion", "able"],
    story: "pre- (before) + dict (say, from Latin dicere). To say something before — a prediction. Contradict shares the dict.",
  },
  {
    target: "telephone",
    clue: "a device for sound at a distance",
    correct: ["tele", "phone"],
    pool: ["tele", "auto", "phone", "graph", "scope", "vision"],
    story: "tele- (far) + phone (sound). The Greek roots gave us a perfect coinage when Bell needed a name in 1876.",
  },
  {
    target: "biography",
    clue: "writing about a person's life",
    correct: ["bio", "graph", "y"],
    pool: ["bio", "auto", "graph", "phone", "y", "ist"],
    story: "bio- (life) + graph (write) + -y (nominalizer). Greek + Greek + suffix. Add auto- for autobiography (self-life-writing).",
  },
  {
    target: "uncomfortable",
    clue: "not at ease",
    correct: ["un", "comfort", "able"],
    pool: ["un", "re", "comfort", "spect", "able", "ful"],
    story: "un- (not) + comfort (ease) + -able. Notice English happily stacks negatives — un- can sit on top of any -able adjective.",
  },
  {
    target: "international",
    clue: "between or among nations",
    correct: ["inter", "nation", "al"],
    pool: ["inter", "intra", "nation", "port", "al", "ist"],
    story: "inter- (between) + nation + -al (relating to). Intra- means within (intramural); inter- means between. Two letters, very different worlds.",
  },
  {
    target: "submarine",
    clue: "underwater vessel",
    correct: ["sub", "marine"],
    pool: ["sub", "super", "marine", "terra", "ist", "tion"],
    story: "sub- (under) + marine (of the sea, from Latin mare). Sub-conscious, sub-way, sub-marine. Under everywhere.",
  },
  {
    target: "antibody",
    clue: "a protein that fights against invaders",
    correct: ["anti", "body"],
    pool: ["anti", "pro", "body", "graph", "ist", "tion"],
    story: "anti- (against) + body. Direct and concrete. Pro- would mean for, supporting — pro-biotic vs. anti-biotic.",
  },
  {
    target: "microscope",
    clue: "a device to see very small things",
    correct: ["micro", "scope"],
    pool: ["micro", "tele", "scope", "phone", "graph", "ist"],
    story: "micro- (small) + scope (see, from Greek skopein). Telescope is far-see; microscope is small-see. Same family, different jobs.",
  },
  {
    target: "transport",
    clue: "to carry across",
    correct: ["trans", "port"],
    pool: ["trans", "im", "port", "spect", "tion", "ist"],
    story: "trans- (across) + port (carry). Import = carry in; export = carry out; transport = carry across. The port family is huge.",
  },
  {
    target: "republic",
    clue: "a public matter — government by the people",
    correct: ["re", "public"],
    pool: ["re", "anti", "public", "private", "an", "ist"],
    story: "Latin res publica = 'the public thing'. Public from populus (people). The opposite of a private matter run by one ruler.",
  },
  {
    target: "antisocial",
    clue: "against being with people",
    correct: ["anti", "soci", "al"],
    pool: ["anti", "pro", "soci", "nation", "al", "ist"],
    story: "anti- (against) + soci (companion, from Latin socius) + -al. Pro-social is the optimistic twin. Same root in both directions.",
  },
];

export function pickBuildAWordRounds(count: number): BuildAWordRound[] {
  const shuffled = BUILD_A_WORD_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
