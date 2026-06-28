/**
 * False Friends — cross-language cognate trap game content.
 *
 * Each round shows a foreign word + its native language + a tempting
 * English "twin". The player decides: real cognate (means what it
 * looks like) or false friend (means something completely different).
 *
 * Massive engagement for our multilingual audience. A Spanish speaker
 * recognising "embarazada" → "pregnant" and laughing at the trap is
 * the moment that turns a player into a fan.
 *
 * Mix is intentional: ~60% false friends, ~40% real cognates. If every
 * answer were FALSE the game would become trivial.
 */

export type FalseFriendsRound = {
  foreignWord: string;
  /** ISO country code for the flag (flagcdn). Picked to match the language
   *  most commonly associated with the word (Spanish → es; German → de). */
  foreignFlag: string;
  /** Display name of the language. */
  foreignLang: string;
  /** The English word the foreign word LOOKS like it should mean. */
  englishTwin: string;
  /** True if the foreign word actually means the English twin
   *  (real cognate). False if it's a trap. */
  isReal: boolean;
  /** Short reveal explaining the actual meaning. ≤140 chars. */
  story: string;
};

export const FALSE_FRIENDS_ROUNDS: FalseFriendsRound[] = [
  {
    foreignWord: "embarazada",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "embarrassed",
    isReal: false,
    story: "It actually means 'pregnant'. Telling a Spanish speaker you're embarazada is a very different announcement than you intended.",
  },
  {
    foreignWord: "Gift",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "gift",
    isReal: false,
    story: "It means poison. A 'Geschenk' is the German word for present. Be careful what you offer.",
  },
  {
    foreignWord: "librairie",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "library",
    isReal: false,
    story: "It means bookshop. A library in French is 'bibliothèque'. The trap catches English speakers in Paris every day.",
  },
  {
    foreignWord: "familia",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "family",
    isReal: true,
    story: "Real twin. Both from Latin familia (household). Shared roots, same meaning across centuries.",
  },
  {
    foreignWord: "sensible",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "sensible",
    isReal: false,
    story: "It means sensitive, not sensible. A French 'personne sensible' is one who feels deeply, not one with good judgement.",
  },
  {
    foreignWord: "Kind",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "kind",
    isReal: false,
    story: "It means child. The German word for kind (the adjective) is 'nett'. Confusing if you compliment somebody on being 'kind'.",
  },
  {
    foreignWord: "constipado",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "constipated",
    isReal: false,
    story: "Estar constipado means to have a cold (a stuffed nose). Constipated as in English is 'estreñido'. Don't mix up your symptoms at the pharmacy.",
  },
  {
    foreignWord: "telefon",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "telephone",
    isReal: true,
    story: "Real twin. Both are 19th-century Greek-derived inventions: tele (far) + phone (sound). Same engineering, same word, two spellings.",
  },
  {
    foreignWord: "actual",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "actual",
    isReal: false,
    story: "It means current, present-day. Spanish 'actualmente' = currently, NOT actually. The English 'actually' is closer to 'realmente'.",
  },
  {
    foreignWord: "mist",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "mist",
    isReal: false,
    story: "It means manure. Yes, really. The German for mist (the foggy kind) is 'Nebel'. Imagine the misunderstanding on a country drive.",
  },
  {
    foreignWord: "preservativo",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "preservative",
    isReal: false,
    story: "It means condom. Italian for food preservative is 'conservante'. Read your supermarket labels carefully in Rome.",
  },
  {
    foreignWord: "musica",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "music",
    isReal: true,
    story: "Real twin. From Latin musica, from Greek mousike — 'the art of the Muses'. Same source word for the whole western family.",
  },
  {
    foreignWord: "carta",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "card",
    isReal: false,
    story: "Una carta in Spanish is a letter (the mail kind) or a menu. A card is 'una tarjeta'. Tricky because both come from Latin charta (paper).",
  },
  {
    foreignWord: "burro",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "burro (donkey)",
    isReal: false,
    story: "In Italian, burro is butter. In Spanish, burro is donkey. The same letters, two different farms. Both languages get the joke.",
  },
  {
    foreignWord: "fabrik",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "fabric",
    isReal: false,
    story: "Fabrik means factory. The German for fabric (cloth) is 'Stoff'. Both 'Fabrik' and 'fabric' come from Latin fabrica (workshop) — they drifted.",
  },
  {
    foreignWord: "intelligente",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "intelligent",
    isReal: true,
    story: "Real twin. From Latin intelligere (to understand). One of the cleanest borrowings — same meaning, same Latin path.",
  },
  {
    foreignWord: "chef",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "chef",
    isReal: false,
    story: "In German, Chef means boss (the person in charge). The cooking chef is 'Koch'. Both come from French chef (head). The job changed; the title travelled.",
  },
  {
    foreignWord: "sympathique",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "sympathetic",
    isReal: false,
    story: "It means nice, likeable. French 'sympathique' is a pure compliment about charm; English 'sympathetic' is about sharing pain. Romantic vs. clinical.",
  },
  {
    foreignWord: "demander",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "to demand",
    isReal: false,
    story: "It just means to ask, politely. The French for 'demand' (aggressively) is 'exiger'. The English version somehow developed an attitude.",
  },
  {
    foreignWord: "doctor",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "doctor",
    isReal: true,
    story: "Real twin. From Latin doctor (teacher). The medical sense came later in both languages. A PhD and an MD share this word for good reason.",
  },
  {
    foreignWord: "vermist",
    foreignFlag: "nl",
    foreignLang: "Dutch",
    englishTwin: "Vermist (missing)",
    isReal: true,
    story: "Real twin. Dutch vermist = missing (as in a missing person). Both derive from the same Germanic root meaning to fail to find.",
  },
  {
    foreignWord: "salir",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "to salivate / dirty",
    isReal: false,
    story: "It means to leave / exit. Looks like 'sully' or 'saliva' but is unrelated. The verb 'to dirty' in Spanish is 'ensuciar'.",
  },
  {
    foreignWord: "billion",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "billion",
    isReal: false,
    story: "In German, eine Billion = a trillion (1,000,000,000,000). A US billion is 'eine Milliarde'. A thousand-times-off mistake waiting to happen.",
  },
  {
    foreignWord: "lecture",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "lecture",
    isReal: false,
    story: "It means reading. French 'la lecture' is the act of reading; a lecture (the academic talk) is 'un cours' or 'une conférence'.",
  },
  {
    foreignWord: "auto",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "auto (car)",
    isReal: true,
    story: "Real twin. Short for Auto-mobil in both languages, from Greek auto (self) + Latin mobilis (moving). A car literally moves itself.",
  },
];

export function pickFalseFriendsRounds(count: number): FalseFriendsRound[] {
  const shuffled = FALSE_FRIENDS_ROUNDS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
