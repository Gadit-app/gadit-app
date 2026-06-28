/**
 * Idiom Decoder — literal-vs-figurative idiom game content.
 *
 * Each round shows a LITERAL description of an idiom — what the words
 * actually say if you took them at face value — and four options for
 * the real figurative meaning.
 *
 * Text-only V1. V2 will replace the literal descriptions with AI-
 * generated images of the literal scene (the original "AI Image Decoder"
 * pitch). For now the text alone is funny enough to land the joke.
 */

export type IdiomDecoderRound = {
  /** The actual idiom (revealed after the round). */
  idiom: string;
  /** Literal description of what the words SAY, not what they mean.
   *  This is the "AI image, but in text" — should be visual and slightly
   *  absurd. ≤140 chars. */
  literal: string;
  /** Four candidate figurative meanings. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the actual meaning. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal explaining the origin or surprising fact. ≤180 chars. */
  story: string;
};

export const IDIOM_DECODER_ROUNDS: IdiomDecoderRound[] = [
  {
    idiom: "spill the beans",
    literal: "Someone tips a glass jar of dried beans onto the floor. Beans bounce everywhere. They cannot be quietly put back.",
    options: [
      "accidentally reveal a secret",
      "make a mess of dinner",
      "spend all your savings",
      "leave without paying",
    ],
    correctIdx: 0,
    story: "From ancient Greek voting — beans were dropped into jars to vote yes or no. A toppled jar revealed the count too early.",
  },
  {
    idiom: "kick the bucket",
    literal: "A person stands on an upturned bucket. They kick the bucket out from under their own feet.",
    options: [
      "to die",
      "to give up on a plan",
      "to start a fight",
      "to leave a job suddenly",
    ],
    correctIdx: 0,
    story: "Disputed origin — possibly from slaughterhouses (a beam called a bucket from which animals were hung). Dark, but the phrase outlived the practice.",
  },
  {
    idiom: "let the cat out of the bag",
    literal: "A merchant unties a sack at the market. A cat leaps out and runs away. People laugh.",
    options: [
      "to escape a difficult situation",
      "to reveal a secret",
      "to start a wild adventure",
      "to make a quick decision",
    ],
    correctIdx: 1,
    story: "Medieval markets: dishonest traders sold sacks claiming a piglet inside, but really a cat. Untying revealed the fraud — and the cat fled.",
  },
  {
    idiom: "break the ice",
    literal: "Two heavy ships ram their way through a frozen river. Ice cracks and splinters in front of them.",
    options: [
      "to escape a frozen situation",
      "to fail a difficult test",
      "to start a friendly conversation",
      "to lose your temper publicly",
    ],
    correctIdx: 2,
    story: "Originally maritime: small icebreaker ships cleared paths for trade vessels. The social meaning is a polite metaphor for clearing a frozen room.",
  },
  {
    idiom: "bite the bullet",
    literal: "A soldier clamps their teeth around a real lead bullet. Their hands grip a piece of wood. They do not flinch.",
    options: [
      "to fight back unexpectedly",
      "to face something difficult head-on",
      "to refuse to give up information",
      "to make a costly mistake",
    ],
    correctIdx: 1,
    story: "From battlefield surgery before anaesthesia. Soldiers bit a lead bullet to brace against pain during operations. Acceptance, not avoidance.",
  },
  {
    idiom: "throw in the towel",
    literal: "A boxing coach hurls a white towel into the ring. The fighter slumps. The crowd understands instantly.",
    options: [
      "to start a fight",
      "to clean up a mess",
      "to ask for a pause",
      "to give up",
    ],
    correctIdx: 3,
    story: "Boxing tradition since the 1800s. A cornerman throws a towel to stop the match if the fighter cannot continue. Cleaner than throwing the fighter.",
  },
  {
    idiom: "barking up the wrong tree",
    literal: "A dog stands at the base of an oak tree, barking furiously at the leaves. The squirrel is two trees away.",
    options: [
      "to make a noise about nothing",
      "to be pursuing the wrong path",
      "to follow a stranger home",
      "to refuse to listen to advice",
    ],
    correctIdx: 1,
    story: "From 1800s American hunting. Hounds tracked prey up trees, but sometimes barked at the wrong one. Lots of effort, completely wrong target.",
  },
  {
    idiom: "piece of cake",
    literal: "A small slice of birthday cake sits on a plate. Easy to pick up. Easy to eat. Nobody is challenged.",
    options: [
      "a delicious reward",
      "a clever trick",
      "very easy",
      "an unimportant detail",
    ],
    correctIdx: 2,
    story: "Coined in 1930s American slang. From the 19th-century 'cakewalk' dance contests — easy prizes for a kind of effort that barely counted as work.",
  },
  {
    idiom: "cost an arm and a leg",
    literal: "A merchant points at a price tag. A customer reaches into their sleeve and detaches an arm. The merchant nods.",
    options: [
      "to require dangerous work",
      "to be extremely expensive",
      "to need many helpers",
      "to take a very long time",
    ],
    correctIdx: 1,
    story: "Possibly from 19th-century portrait painters charging more for full-body poses (arms and legs cost extra). The hyperbole stuck; the portraits did not.",
  },
  {
    idiom: "hit the nail on the head",
    literal: "A carpenter swings a hammer. The nail goes in straight, perfectly aligned, no bent metal, no thumb injuries.",
    options: [
      "to fix a difficult problem",
      "to start a brand new project",
      "to be exactly right about something",
      "to work quickly under pressure",
    ],
    correctIdx: 2,
    story: "Carpentry metaphor for precision. Used since at least the 1400s in English. A bent nail means rework; a clean strike means understanding.",
  },
  {
    idiom: "the ball is in your court",
    literal: "A tennis ball bounces twice on your side of the net. The other player stands still, hands on hips. Waiting.",
    options: [
      "you are about to lose",
      "you have an advantage",
      "it is your turn to act",
      "someone is angry at you",
    ],
    correctIdx: 2,
    story: "From tennis. The other side has done their part — the decision and the next move are now entirely yours. A polite way to say: well?",
  },
  {
    idiom: "under the weather",
    literal: "A sailor sits below deck during a storm. The ship pitches. Their face is the colour of an unripe banana.",
    options: [
      "feeling slightly unwell",
      "being lost at sea",
      "facing bad luck for a while",
      "hiding from authorities",
    ],
    correctIdx: 0,
    story: "Maritime origin. Seasick sailors were sent below deck (literally under the weather affecting the ship) to recover. Mild illness, no urgency.",
  },
  {
    idiom: "burn the midnight oil",
    literal: "Someone hunches over a desk past midnight. An oil lamp burns down to a stub. Papers everywhere.",
    options: [
      "to waste time on hobbies",
      "to work very late at night",
      "to celebrate a victory",
      "to argue with a partner",
    ],
    correctIdx: 1,
    story: "Pre-electricity, oil lamps were how you worked after dark. Burning the midnight oil meant working seriously late. The phrase outlived the lamps.",
  },
];

export function pickIdiomDecoderRounds(count: number): IdiomDecoderRound[] {
  const shuffled = IDIOM_DECODER_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
