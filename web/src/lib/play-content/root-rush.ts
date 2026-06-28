/**
 * Root Rush — multi-select etymology game content.
 *
 * Each round shows a Latin/Greek root + its meaning, then 6 word tiles.
 * Three tiles contain the root; three are visual lookalikes that don't.
 * Player taps the 3 that belong to the root family.
 *
 * The 3 correct words must all be GENUINE descendants of the root. The
 * 3 distractors should LOOK plausible — share a first syllable or
 * vague vibe — but actually come from a different root. False trail
 * is the whole game.
 *
 * Why curated: getting the etymology right requires authoritative
 * sources. Generating it via LLM hallucinates ("scribble" → SCRIB?
 * Actually it does share — but it's harder to verify confidently).
 */

export type RootRushRound = {
  /** The root in display form, e.g. "SPECT". */
  root: string;
  /** Origin language label, e.g. "Latin" or "Greek". */
  origin: string;
  /** What the root means in plain English. */
  meaning: string;
  /** Six words. First 3 are correct, last 3 are distractors.
   *  Display order is randomised per session. */
  correct: [string, string, string];
  distractors: [string, string, string];
  /** Reveal line shown after the round. ≤180 chars. Highlights the
   *  trickiest distractor or a memorable point about the root. */
  story: string;
};

export const ROOT_RUSH_ROUNDS: RootRushRound[] = [
  {
    root: "SPECT",
    origin: "Latin",
    meaning: "to look, to see",
    correct: ["inspect", "spectator", "prospect"],
    distractors: ["special", "speed", "speak"],
    story: "Once you spot SPECT you'll see it everywhere: inspect (look in), prospect (look forward), spectator (watcher). Beware special and speak — different roots.",
  },
  {
    root: "SCRIB / SCRIPT",
    origin: "Latin",
    meaning: "to write",
    correct: ["describe", "scripture", "manuscript"],
    distractors: ["scrap", "screen", "scream"],
    story: "From Latin scribere. Manuscript = manu (hand) + script (written) = hand-written. The 'scr' tricks you, but scrap, screen and scream all come from elsewhere.",
  },
  {
    root: "PORT",
    origin: "Latin",
    meaning: "to carry",
    correct: ["transport", "import", "portable"],
    distractors: ["portrait", "porch", "porridge"],
    story: "From portare (to carry). Transport = carry across; import = carry in. Portrait LOOKS like it fits but comes from a different Latin word — protrahere (to draw forth).",
  },
  {
    root: "TELE",
    origin: "Greek",
    meaning: "far, distant",
    correct: ["television", "telescope", "telegraph"],
    distractors: ["temple", "temper", "tempo"],
    story: "Greek tele = far. Telescope = far-seer, telegraph = far-writer, television = far-vision. The TEMP family is from Latin tempus (time) — completely unrelated.",
  },
  {
    root: "AQUA",
    origin: "Latin",
    meaning: "water",
    correct: ["aquarium", "aqueduct", "aquatic"],
    distractors: ["acquire", "acrobat", "accent"],
    story: "Latin aqua = water. Aqueduct = water-leader (carries water). Acquire LOOKS like a match but it's ad + quaerere (to seek toward) — different family altogether.",
  },
  {
    root: "BIO",
    origin: "Greek",
    meaning: "life",
    correct: ["biology", "biography", "antibiotic"],
    distractors: ["bingo", "biscuit", "binary"],
    story: "Greek bios = life. Biology = study of life. Antibiotic = against life (kills bacteria). Biscuit is from Latin bis coctus = twice-cooked. Tricky 'bi' start.",
  },
  {
    root: "ASTRO / ASTER",
    origin: "Greek",
    meaning: "star",
    correct: ["astronaut", "astronomy", "asterisk"],
    distractors: ["asthma", "astray", "astonish"],
    story: "Greek aster = star. Astronaut = star-sailor (literally). Asterisk = little star. Astonish actually comes from Latin tonare (thunder) — different cosmic source.",
  },
  {
    root: "GEO",
    origin: "Greek",
    meaning: "earth, land",
    correct: ["geology", "geography", "geometry"],
    distractors: ["gentle", "generous", "genuine"],
    story: "Greek ge = earth. Geography = writing about earth. Geometry = measuring the earth. The GEN words come from Latin gens (clan, kin) — different origin entirely.",
  },
  {
    root: "AUDI",
    origin: "Latin",
    meaning: "to hear",
    correct: ["audio", "audience", "auditorium"],
    distractors: ["author", "auction", "August"],
    story: "Latin audire = to hear. An audience is literally 'those who hear'. Author comes from auctor (originator) — totally different. August is from Augustus the emperor.",
  },
  {
    root: "MAN / MANU",
    origin: "Latin",
    meaning: "hand",
    correct: ["manual", "manuscript", "manipulate"],
    distractors: ["mansion", "manner", "mango"],
    story: "Latin manus = hand. Manuscript = handwritten. Manipulate = handle. Mansion is from manere (to remain), and mango is from Tamil mankay. Hands off.",
  },
  {
    root: "GRAPH",
    origin: "Greek",
    meaning: "to write, to draw",
    correct: ["photograph", "autograph", "telegraph"],
    distractors: ["grape", "gravity", "grass"],
    story: "Greek graphein = to write. Photograph = writing with light. Autograph = self-written. The GR distractors are all unrelated — gravity is from Latin gravis (heavy).",
  },
  {
    root: "PHONE",
    origin: "Greek",
    meaning: "sound, voice",
    correct: ["telephone", "microphone", "symphony"],
    distractors: ["phantom", "photo", "physical"],
    story: "Greek phone = sound. Symphony = sounding together. The PH- distractors are all from different Greek words: phantom (appear), photo (light), physical (nature).",
  },
  {
    root: "ANTHRO",
    origin: "Greek",
    meaning: "human, person",
    correct: ["anthropology", "misanthrope", "philanthropy"],
    distractors: ["anchor", "antique", "ankle"],
    story: "Greek anthropos = human. Philanthropy = love of humans; misanthrope = hater of humans. The AN- distractors are wildly unrelated lookalikes.",
  },
  {
    root: "CRED",
    origin: "Latin",
    meaning: "to believe",
    correct: ["credit", "incredible", "credentials"],
    distractors: ["create", "crew", "creek"],
    story: "Latin credere = to believe. Credit = trust extended. Incredible = unbelievable. Credentials = things that make you believable. CREATE comes from creare instead.",
  },
];

export function pickRootRushRounds(count: number): RootRushRound[] {
  const shuffled = ROOT_RUSH_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
