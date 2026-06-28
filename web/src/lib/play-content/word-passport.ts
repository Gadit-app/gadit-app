/**
 * Word Passport — origin language game content.
 *
 * Each round shows a familiar English word and four candidate origin
 * languages. Pick the language the word actually came from. The reveal
 * is a one-line origin story — these are genuinely surprising
 * (e.g. "ketchup" is Hokkien Chinese).
 *
 * Hits Gadit's etymology + multilingual edges in one game. Particularly
 * delightful for our Hebrew/Arabic markets where many "English" words
 * have hidden roots in those languages.
 */

/** ISO country code for flagcdn.com. Picked the country most associated
 *  with the LANGUAGE origin, not the modern speakers. "Arabic" maps to
 *  Saudi (sa) flag rather than e.g. Egypt because that's how flagcdn
 *  expects the lookup. */
export type OriginCountry =
  | "sa"   // Arabic
  | "in"   // Hindi / Sanskrit
  | "cn"   // Chinese (any dialect)
  | "jp"   // Japanese
  | "de"   // German
  | "fr"   // French
  | "es"   // Spanish
  | "it"   // Italian
  | "nl"   // Dutch
  | "ru"   // Russian
  | "cz"   // Czech
  | "ir"   // Persian
  | "tr"   // Turkish
  | "gr"   // Greek
  | "va"   // Latin (Vatican is the closest flag)
  | "no"   // Norse / Norwegian
  | "is"   // Icelandic
  | "mx"   // Nahuatl (Mexico)
  | "au"   // Aboriginal Australian
  | "ke"   // Swahili
  | "ng"   // West African languages
  | "ca";  // Inuit / Algonquian (Canada)

/** Human-readable language name shown to the player. */
export const LANG_LABEL: Record<OriginCountry, string> = {
  sa: "Arabic",
  in: "Hindi / Sanskrit",
  cn: "Chinese",
  jp: "Japanese",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  cz: "Czech",
  ir: "Persian",
  tr: "Turkish",
  gr: "Greek",
  va: "Latin",
  no: "Old Norse",
  is: "Icelandic",
  mx: "Nahuatl (Aztec)",
  au: "Aboriginal Australian",
  ke: "Swahili",
  ng: "West African",
  ca: "Inuit / Algonquian",
};

export type WordPassportRound = {
  /** The English word being shown. */
  word: string;
  /** Four candidate origins. Order randomised per session. */
  options: [OriginCountry, OriginCountry, OriginCountry, OriginCountry];
  /** Index 0-3 of the correct origin. */
  correctIdx: 0 | 1 | 2 | 3;
  /** One-line origin story shown on reveal. ≤160 chars. */
  story: string;
};

export const WORD_PASSPORT_ROUNDS: WordPassportRound[] = [
  {
    word: "alcohol",
    options: ["sa", "va", "fr", "gr"],
    correctIdx: 0,
    story: "From Arabic al-kohl. Originally a fine eye-darkening powder used by Cleopatra. The 'distilled spirit' meaning came much later.",
  },
  {
    word: "shampoo",
    options: ["in", "fr", "jp", "ir"],
    correctIdx: 0,
    story: "From Hindi chāmpo (massage). British colonists in India loved their head massages and brought the word, and the practice, home.",
  },
  {
    word: "ketchup",
    options: ["va", "cn", "de", "es"],
    correctIdx: 1,
    story: "From Hokkien Chinese kê-tsiap, originally a fermented fish sauce. Tomatoes joined later, in 1812 Philadelphia.",
  },
  {
    word: "robot",
    options: ["va", "ru", "cz", "de"],
    correctIdx: 2,
    story: "Czech writer Karel Čapek coined it in his 1920 play R.U.R., from robota (forced labour). Most invented words flop. This one took over.",
  },
  {
    word: "sugar",
    options: ["va", "sa", "in", "gr"],
    correctIdx: 1,
    story: "From Arabic sukkar, ultimately Sanskrit sharkara (grit / gravel). The crystals literally looked like coarse sand to early traders.",
  },
  {
    word: "algebra",
    options: ["gr", "sa", "va", "ir"],
    correctIdx: 1,
    story: "From Arabic al-jabr (restoring broken parts). Coined by mathematician al-Khwarizmi in 820 AD. His name also gave us 'algorithm'.",
  },
  {
    word: "tsunami",
    options: ["jp", "cn", "ke", "in"],
    correctIdx: 0,
    story: "Japanese tsu (harbour) + nami (wave). The 'harbour wave' was named because sailors at sea felt nothing — the wave only towered at the shore.",
  },
  {
    word: "karaoke",
    options: ["cn", "jp", "in", "ir"],
    correctIdx: 1,
    story: "Japanese kara (empty) + oke (orchestra). Invented in 1971 in Kobe when a singer needed backing tracks for a gig and a drummer rigged a tape player.",
  },
  {
    word: "boomerang",
    options: ["au", "in", "ng", "ke"],
    correctIdx: 0,
    story: "From the Dharug language of Australian Aborigines (Sydney region). Adopted into English in 1825. The throwing technique is much older.",
  },
  {
    word: "chocolate",
    options: ["es", "mx", "fr", "va"],
    correctIdx: 1,
    story: "From Nahuatl xocolātl, the bitter cacao-water drink the Aztecs gave to Cortés in 1519. Spanish added sugar. The rest is history.",
  },
  {
    word: "safari",
    options: ["ng", "ke", "sa", "in"],
    correctIdx: 1,
    story: "From Swahili safari (journey), itself from Arabic. Originally any trip, not necessarily to watch animals.",
  },
  {
    word: "kindergarten",
    options: ["nl", "de", "no", "cz"],
    correctIdx: 1,
    story: "German kinder (children) + garten (garden). Friedrich Fröbel opened the first one in 1837 to teach via play, not drill. The name stuck globally.",
  },
  {
    word: "iceberg",
    options: ["no", "is", "nl", "de"],
    correctIdx: 2,
    story: "From Dutch ijsberg (ice mountain). Borrowed in the 1700s, well before the Titanic made the word famous.",
  },
  {
    word: "tycoon",
    options: ["cn", "jp", "ir", "in"],
    correctIdx: 1,
    story: "From Japanese taikun (great prince). Brought back by Commodore Perry's 1853 mission. Lincoln's secretaries jokingly called him 'the Tycoon'.",
  },
  {
    word: "pajamas",
    options: ["fr", "in", "ir", "sa"],
    correctIdx: 2,
    story: "Persian pae (leg) + jameh (garment). British colonists in India saw loose night trousers and shipped both the garment and the word home.",
  },
  {
    word: "checkmate",
    options: ["fr", "ir", "in", "sa"],
    correctIdx: 1,
    story: "Persian shah mat — 'the king is dead'. Chess and the phrase travelled together through Arabic, then into medieval Europe.",
  },
  {
    word: "hurricane",
    options: ["fr", "es", "mx", "ca"],
    correctIdx: 2,
    story: "From Taíno (Caribbean) Huracán, the god of storms. The Spanish heard the name during the 1494 voyages and carried it into European languages.",
  },
  {
    word: "loot",
    options: ["sa", "in", "de", "no"],
    correctIdx: 1,
    story: "From Hindi lūṭ (plunder). British soldiers brought it back from India in the 18th century. Now baked into every video game vocabulary.",
  },
  {
    word: "schadenfreude",
    options: ["de", "nl", "no", "cz"],
    correctIdx: 0,
    story: "German schaden (harm) + freude (joy). The pleasure you feel at someone else's misfortune. English borrowed it whole because no native word fit so well.",
  },
  {
    word: "guru",
    options: ["jp", "in", "ir", "ke"],
    correctIdx: 1,
    story: "Sanskrit guru — 'heavy, weighty'. A teacher whose words carried weight. Adopted into English in the 1600s, exploded in usage in the 1960s.",
  },
  {
    word: "kayak",
    options: ["no", "ca", "ru", "au"],
    correctIdx: 1,
    story: "From Inuit qajaq. Engineered over thousands of years for hunting in icy seas — light, narrow, sealed against waves. Borrowed into English from Greenlandic.",
  },
  {
    word: "cookie",
    options: ["de", "nl", "fr", "no"],
    correctIdx: 1,
    story: "From Dutch koekje (little cake). Dutch settlers brought the word — and the snack — to New Amsterdam, the colony that became New York.",
  },
  {
    word: "magazine",
    options: ["fr", "sa", "va", "ir"],
    correctIdx: 1,
    story: "From Arabic makhzan (storehouse). Was a warehouse, then a military ammo store, then a 'storehouse of information' — the periodical sense.",
  },
  {
    word: "yacht",
    options: ["nl", "de", "no", "is"],
    correctIdx: 0,
    story: "From Dutch jacht (hunt) — a 'jachtschip' was a fast hunting ship the Dutch used to chase pirates. Charles II got one and the elite copied him.",
  },
  {
    word: "bungalow",
    options: ["sa", "in", "ir", "tr"],
    correctIdx: 1,
    story: "From Hindi bangla (of Bengal). British colonial architects copied the low, wide Bengali farmhouse and the name travelled wherever they did.",
  },
];

export function pickWordPassportRounds(count: number): WordPassportRound[] {
  const shuffled = WORD_PASSPORT_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
