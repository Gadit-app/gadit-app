/**
 * Etymology Artist — literal root meaning → modern word game content.
 *
 * Each round shows the LITERAL translation of a word's ancient root —
 * "river horse", "star sailor", "lion's tooth" — and four modern
 * English words. Pick the one whose origin matches the literal phrase.
 *
 * Text-only V1. V2 will replace the literal phrase with an AI-generated
 * image of the literal scene (the original "Etymology Artist" pitch).
 * The literal phrases alone are already surprising — half the players
 * never realized hippopotamus literally means river horse in Greek.
 */

export type EtymologyArtistRound = {
  /** Literal translation of the root. Often surprising or absurd. */
  literal: string;
  /** Origin language(s) for the root. */
  origin: string;
  /** Four modern English candidates. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the correct modern word. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal expanding on the etymology. ≤180 chars. */
  story: string;
};

export const ETYMOLOGY_ARTIST_ROUNDS: EtymologyArtistRound[] = [
  {
    literal: "river horse",
    origin: "Greek hippos + potamos",
    options: ["hippopotamus", "rhinoceros", "manatee", "platypus"],
    correctIdx: 0,
    story: "Ancient Greeks saw the chunky riverine grazer and called it the obvious thing: a horse-of-the-river. The Romans borrowed the Greek directly.",
  },
  {
    literal: "star sailor",
    origin: "Greek astron + nautes",
    options: ["pilot", "captain", "astronaut", "navigator"],
    correctIdx: 2,
    story: "Coined in 1929, decades before space travel was practical. The Greeks gave us sailors, the 20th century gave us new oceans.",
  },
  {
    literal: "lion's tooth",
    origin: "French dent de lion",
    options: ["thistle", "dandelion", "marigold", "buttercup"],
    correctIdx: 1,
    story: "Medieval French herbalists noticed the jagged leaf edges and named the flower for them. The English just kept the French pronunciation.",
  },
  {
    literal: "bad star",
    origin: "Italian dis + astro",
    options: ["disaster", "catastrophe", "calamity", "tragedy"],
    correctIdx: 0,
    story: "From Renaissance astrology. A misfortune was caused by an unfavourable star position. The science is out; the word is forever.",
  },
  {
    literal: "flesh-eater",
    origin: "Greek sarx + phagein",
    options: ["sarcophagus", "carnivore", "vulture", "predator"],
    correctIdx: 0,
    story: "Greek stone coffins were thought to literally consume the body inside. The word kept the gruesome metaphor even as the practice changed.",
  },
  {
    literal: "to make alive",
    origin: "Latin vivificare",
    options: ["motivate", "rejuvenate", "vivify", "energize"],
    correctIdx: 2,
    story: "Latin vivus (alive) + facere (make). Most -ify verbs in English are 'make this' (clarify = make clear, justify = make just). Vivify = make alive.",
  },
  {
    literal: "empty orchestra",
    origin: "Japanese kara + ōkesutora",
    options: ["karaoke", "anime", "manga", "kabuki"],
    correctIdx: 0,
    story: "Born in 1971 Kobe, Japan. A drummer rigged a tape player to replace a missing band. 'Orchestra' was already a Japanese loanword from English.",
  },
  {
    literal: "without a place",
    origin: "Greek ou + topos",
    options: ["utopia", "dystopia", "exodus", "atlas"],
    correctIdx: 0,
    story: "Thomas More coined utopia in 1516 for his ideal fictional society — literally 'no place'. He was being clever: it's perfect because it cannot exist.",
  },
  {
    literal: "self moving",
    origin: "Greek autos + Latin mobilis",
    options: ["bicycle", "automobile", "locomotive", "scooter"],
    correctIdx: 1,
    story: "Coined 1875, before cars were common. Auto- means self (any motion, any context); mobile means moving. The horse no longer needed.",
  },
  {
    literal: "knowing nothing",
    origin: "Latin nescius",
    options: ["nice", "naive", "ignorant", "innocent"],
    correctIdx: 0,
    story: "Latin nescius (not knowing). It drifted from 'foolish' to 'shy' to 'precise' to 'pleasant' over 500 years. Nice has had a wild career.",
  },
  {
    literal: "fear of strangers",
    origin: "Greek xenos + phobos",
    options: ["agoraphobia", "claustrophobia", "xenophobia", "acrophobia"],
    correctIdx: 2,
    story: "Greek xenos = stranger / foreigner / guest (the same word covered all three). The fear-of-strangers sense came in modern psychology, 1880s.",
  },
  {
    literal: "the worship of bread",
    origin: "Greek artos + latreia",
    options: ["artolatry", "iconolatry", "idolatry", "bibliolatry"],
    correctIdx: 0,
    story: "Real word, used (rarely) in medieval church disputes about Communion. -latry as a suffix attaches to anything: artolatry (bread), bibliolatry (books).",
  },
  {
    literal: "lover of sound",
    origin: "Greek philos + phone",
    options: ["philanthropist", "philharmonic", "philosopher", "telephone"],
    correctIdx: 1,
    story: "Greek philos = lover. Philharmonic = lover of harmony / sound. Philosopher = lover of wisdom. Philanthropist = lover of humans. Phil- is everywhere.",
  },
];

export function pickEtymologyArtistRounds(count: number): EtymologyArtistRound[] {
  const shuffled = ETYMOLOGY_ARTIST_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
