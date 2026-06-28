/**
 * Twin Trap — confusable word pairs curated content.
 *
 * Each round shows a sentence with one word missing and two confusable
 * options. Pick the right one. Reveal explains the difference.
 *
 * Why curated: confusables are a closed set of well-known pairs. Generating
 * them at runtime via OpenAI would (a) cost money per play, (b) risk
 * inconsistent quality, (c) sometimes invent fake pairs. Curated content
 * stays sharp.
 *
 * Content is English-only for now. The UI chrome (header, buttons,
 * "correct!"/"wrong" feedback) is localized per UI lang via PlayT, but
 * the sentences and explanations are English because the words being
 * learned are English. Matches Gadit's general "EN content, localized
 * chrome" pattern.
 */

export type TwinTrapRound = {
  /** The sentence with `____` where one of the two options goes. */
  sentence: string;
  /** Always two options. The order shown is randomised per round. */
  options: [string, string];
  /** Index 0 or 1 — which option is the correct one. */
  correctIdx: 0 | 1;
  /** One-sentence explanation shown on reveal. ≤120 chars. */
  explain: string;
};

/** Picked for: (a) frequency in real adult/teen writing, (b) genuine
 *  confusion (not just spelling typos), (c) clear contrast in meaning.
 *  Order randomised at runtime — sequence here is purely for our editing
 *  convenience, NOT presented to the player. */
export const TWIN_TRAP_ROUNDS: TwinTrapRound[] = [
  // ─── Effect / Affect — the classic ──────────────────────────
  {
    sentence: "The new medicine had a strange ____ on me.",
    options: ["effect", "affect"],
    correctIdx: 0,
    explain: "Effect is the noun (a result). Affect is the verb (to influence).",
  },
  {
    sentence: "How will this decision ____ our plans?",
    options: ["effect", "affect"],
    correctIdx: 1,
    explain: "Affect = verb (to act on). Effect = noun (the result).",
  },

  // ─── Their / There / They're — pick any two per round ──────
  {
    sentence: "I think ____ going to be late.",
    options: ["their", "they're"],
    correctIdx: 1,
    explain: "They're = they are. Their = belonging to them.",
  },
  {
    sentence: "Have you seen ____ new car?",
    options: ["their", "there"],
    correctIdx: 0,
    explain: "Their shows possession. There is a place or filler word.",
  },
  {
    sentence: "Look over ____ by the door.",
    options: ["there", "their"],
    correctIdx: 0,
    explain: "There points to a place. Their belongs to someone.",
  },

  // ─── Its / It's ────────────────────────────────────────────
  {
    sentence: "The dog wagged ____ tail happily.",
    options: ["its", "it's"],
    correctIdx: 0,
    explain: "Its = belonging to it. It's = it is (always with the apostrophe).",
  },
  {
    sentence: "____ been raining all morning.",
    options: ["its", "it's"],
    correctIdx: 1,
    explain: "It's = it has / it is. Its (no apostrophe) means belonging to it.",
  },

  // ─── Your / You're ─────────────────────────────────────────
  {
    sentence: "I love ____ new haircut.",
    options: ["your", "you're"],
    correctIdx: 0,
    explain: "Your = belonging to you. You're = you are.",
  },
  {
    sentence: "____ going to love this movie.",
    options: ["your", "you're"],
    correctIdx: 1,
    explain: "You're = you are. Your shows what belongs to you.",
  },

  // ─── Then / Than ───────────────────────────────────────────
  {
    sentence: "She is taller ____ her brother.",
    options: ["then", "than"],
    correctIdx: 1,
    explain: "Than is for comparison. Then is about time or sequence.",
  },
  {
    sentence: "First we eat, ____ we go to the park.",
    options: ["then", "than"],
    correctIdx: 0,
    explain: "Then = next in time. Than = used to compare.",
  },

  // ─── Lose / Loose ──────────────────────────────────────────
  {
    sentence: "Be careful, you might ____ your keys.",
    options: ["lose", "loose"],
    correctIdx: 0,
    explain: "Lose = misplace (verb). Loose = not tight (adjective).",
  },
  {
    sentence: "This shirt is way too ____ on me.",
    options: ["lose", "loose"],
    correctIdx: 1,
    explain: "Loose rhymes with goose: not tight. Lose rhymes with news: to misplace.",
  },

  // ─── Accept / Except ───────────────────────────────────────
  {
    sentence: "I'll happily ____ your offer.",
    options: ["accept", "except"],
    correctIdx: 0,
    explain: "Accept = take willingly. Except = leave out / besides.",
  },
  {
    sentence: "Everyone came ____ Sara.",
    options: ["accept", "except"],
    correctIdx: 1,
    explain: "Except = excluding. Accept = receive or agree to.",
  },

  // ─── Principle / Principal ─────────────────────────────────
  {
    sentence: "Lying goes against my ____.",
    options: ["principles", "principals"],
    correctIdx: 0,
    explain: "Principle = a rule or belief. Principal = the head of a school (your pal!).",
  },
  {
    sentence: "The ____ greeted parents at the gate.",
    options: ["principle", "principal"],
    correctIdx: 1,
    explain: "Principal = the head person. Principle = a guiding rule.",
  },

  // ─── Complement / Compliment ───────────────────────────────
  {
    sentence: "She gave me a lovely ____ on my dress.",
    options: ["complement", "compliment"],
    correctIdx: 1,
    explain: "Compliment with i = nice thing said. Complement with e = something that completes.",
  },
  {
    sentence: "The wine is a perfect ____ to this meal.",
    options: ["complement", "compliment"],
    correctIdx: 0,
    explain: "Complement = completes / pairs well. Compliment = praise.",
  },

  // ─── Stationary / Stationery ───────────────────────────────
  {
    sentence: "The bus stayed ____ at the red light.",
    options: ["stationary", "stationery"],
    correctIdx: 0,
    explain: "Stationary with A = not moving. Stationery with E = paper goods (think E for envelope).",
  },
  {
    sentence: "I bought new ____ for my desk.",
    options: ["stationary", "stationery"],
    correctIdx: 1,
    explain: "Stationery (with E for envelopes) is the paper stuff. Stationary means standing still.",
  },

  // ─── Fewer / Less ──────────────────────────────────────────
  {
    sentence: "This lane is for shoppers with 10 items or ____.",
    options: ["fewer", "less"],
    correctIdx: 0,
    explain: "Fewer for things you can count. Less for things you can't (less time, less water).",
  },
  {
    sentence: "We have ____ time than I thought.",
    options: ["fewer", "less"],
    correctIdx: 1,
    explain: "Less is for uncountable things. Fewer for countable (fewer minutes, less time).",
  },

  // ─── Farther / Further ─────────────────────────────────────
  {
    sentence: "How much ____ until we get there?",
    options: ["farther", "further"],
    correctIdx: 0,
    explain: "Farther = physical distance. Further = abstract / more (further discussion).",
  },
  {
    sentence: "We need to discuss this ____ tomorrow.",
    options: ["farther", "further"],
    correctIdx: 1,
    explain: "Further is for figurative or additional. Farther is for actual distance.",
  },

  // ─── Imply / Infer ─────────────────────────────────────────
  {
    sentence: "Are you trying to ____ that I'm wrong?",
    options: ["imply", "infer"],
    correctIdx: 0,
    explain: "The speaker implies (hints). The listener infers (concludes).",
  },
  {
    sentence: "From her tone, I ____ she was annoyed.",
    options: ["imply", "infer"],
    correctIdx: 1,
    explain: "Infer = figure out from clues. Imply = hint without saying.",
  },

  // ─── Disinterested / Uninterested ──────────────────────────
  {
    sentence: "A good judge must remain ____.",
    options: ["disinterested", "uninterested"],
    correctIdx: 0,
    explain: "Disinterested = impartial (no stake). Uninterested = bored, not caring.",
  },
  {
    sentence: "He looked completely ____ in the lecture.",
    options: ["disinterested", "uninterested"],
    correctIdx: 1,
    explain: "Uninterested = doesn't care. Disinterested = neutral, unbiased.",
  },

  // ─── Discreet / Discrete ───────────────────────────────────
  {
    sentence: "She gave me a ____ nod from across the room.",
    options: ["discreet", "discrete"],
    correctIdx: 0,
    explain: "Discreet = careful, subtle. Discrete = separate, distinct.",
  },
  {
    sentence: "Break the project into ____ stages.",
    options: ["discreet", "discrete"],
    correctIdx: 1,
    explain: "Discrete = separate parts. Discreet = quietly tactful.",
  },

  // ─── Lay / Lie ─────────────────────────────────────────────
  {
    sentence: "I need to ____ down for a few minutes.",
    options: ["lay", "lie"],
    correctIdx: 1,
    explain: "Lie = recline yourself. Lay = put something else down (lay the book on the table).",
  },
  {
    sentence: "Please ____ the baby in the crib.",
    options: ["lay", "lie"],
    correctIdx: 0,
    explain: "Lay needs an object (lay something). Lie is what you do yourself.",
  },

  // ─── Who / Whom ────────────────────────────────────────────
  {
    sentence: "____ should I ask about the schedule?",
    options: ["who", "whom"],
    correctIdx: 1,
    explain: "Whom is the object (ask whom). Who is the subject (who asked?). Trick: if you'd answer 'him', use whom.",
  },
  {
    sentence: "____ left the door open?",
    options: ["who", "whom"],
    correctIdx: 0,
    explain: "Who is the subject doing the action. Whom is the object receiving it.",
  },

  // ─── Less common but classic ───────────────────────────────
  {
    sentence: "Please don't ____ the rules this time.",
    options: ["break", "brake"],
    correctIdx: 0,
    explain: "Break = damage / violate. Brake = the thing that stops a vehicle.",
  },
  {
    sentence: "He had to ____ hard to avoid the cat.",
    options: ["break", "brake"],
    correctIdx: 1,
    explain: "Brake = stop a vehicle. Break = damage or pause.",
  },

  {
    sentence: "Walk down the ____ until you see the chapel.",
    options: ["aisle", "isle"],
    correctIdx: 0,
    explain: "Aisle = walkway in a building. Isle = a small island.",
  },
  {
    sentence: "We sailed past a tiny green ____.",
    options: ["aisle", "isle"],
    correctIdx: 1,
    explain: "Isle = island. Aisle = the path between rows of seats.",
  },

  {
    sentence: "The chef carefully ____ the soup.",
    options: ["poured", "pored"],
    correctIdx: 0,
    explain: "Poured = the liquid action. Pored = studied closely (pored over a book).",
  },
  {
    sentence: "She ____ over the manuscript for hours.",
    options: ["poured", "pored"],
    correctIdx: 1,
    explain: "Pored over = examined carefully. Poured = the liquid one.",
  },
];

/** Pick N random rounds from the curated set. Used per session.
 *  Caller is responsible for randomising the displayed option order. */
export function pickTwinTrapRounds(count: number): TwinTrapRound[] {
  const shuffled = TWIN_TRAP_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
