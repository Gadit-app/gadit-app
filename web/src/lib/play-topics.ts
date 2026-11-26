/**
 * The games area by what a child learns (Gadi 2026-11-26): six topics, each
 * with a heading and one line that says what is learnt, and a row of tabs at
 * the top that shows one topic at a time. The topics replace the old headings
 * ("from your notebook", "my games", "warm-up" and so on), which said where
 * the words came from or how hard a game was, not what it teaches.
 *
 * THE TABLE BELOW IS THE ONE PLACE that says which game sits in which topic.
 * Keys are the game ids of the games area, plus the four cards that are not
 * in the catalog (world, catch, catch-fair, duel).
 */
import others from "./play-topics-langs.json";

export const TOPICS = ["letters", "meaning", "sentence", "spelling", "similar", "origins"] as const;
export type Topic = (typeof TOPICS)[number];
export const isTopic = (v: unknown): v is Topic => typeof v === "string" && (TOPICS as readonly string[]).includes(v);

const GAME_TOPIC: Record<string, Topic> = {
  // letters and vowel signs (Hebrew first readers)
  letterpairs: "letters", letters: "letters", vowels: "letters", syllables: "letters", wheel: "letters",
  // a word and its meaning
  world: "meaning", duel: "meaning", flashcards: "meaning", flashdefs: "meaning", memory: "meaning",
  quiz: "meaning", truefalse: "meaning", speed: "meaning",
  // words in a sentence
  fillblank: "sentence", context: "sentence", lens: "sentence", idiom: "sentence",
  // spelling
  catch: "spelling", "catch-fair": "spelling", wordsearch: "spelling", crossword: "spelling",
  arrowword: "spelling", anagram: "spelling",
  // similar words
  twin: "similar", friends: "similar", shade: "similar",
  // where words come from
  root: "origins", build: "origins", passport: "origins", time: "origins", artist: "origins",
};
/** A game with no line in the table sits with the word-and-meaning games. */
export const topicOf = (gameId: string): Topic => GAME_TOPIC[gameId] ?? "meaning";

type TopicCopy = Record<Topic, [title: string, sub: string]>;
const COPY: Record<string, TopicCopy> = {
  he: {
    letters: ["אותיות וניקוד", "מכירים את האותיות, הצלילים וסימני הניקוד, וקוראים הברות"],
    meaning: ["מילה ופירושה", "לומדים מה כל מילה אומרת וזוכרים אותה"],
    sentence: ["מילים בתוך משפט", "בוחרים את המילה ואת המשמעות שמתאימות למשפט"],
    spelling: ["איות וכתיב", "בונים את המילה אות אחרי אות"],
    similar: ["מילים דומות ומתבלבלות", "מבחינים בין מילים קרובות ובוחרים את המדויקת"],
    origins: ["מאיפה המילים באות", "שורשים, חלקי מילה והשפות שמהן הגיעו המילים"],
  },
  en: {
    letters: ["Letters and vowel signs", "Meet the letters, their sounds and the vowel signs, and read syllables"],
    meaning: ["A word and its meaning", "Learn what each word means and remember it"],
    sentence: ["Words in a sentence", "Pick the word and the meaning that fit the sentence"],
    spelling: ["Spelling", "Build the word letter by letter"],
    similar: ["Similar words that get mixed up", "Tell close words apart and pick the exact one"],
    origins: ["Where words come from", "Roots, word parts and the languages words came from"],
  },
  ...(others as unknown as Record<string, TopicCopy>),
};
/** The first tab, which shows every topic. */
const ALL: Record<string, string> = {
  he: "הכול", en: "All", ar: "الكل", ru: "Все", es: "Todo", pt: "Tudo", fr: "Tout", de: "Alle", cs: "Vše", sk: "Všetko",
  it: "Tutto", ja: "すべて", hi: "सभी", am: "ሁሉም", uk: "Усі", tr: "Tümü", pl: "Wszystko", fa: "همه", id: "Semua", nl: "Alles",
  el: "Όλα", zu: "Konke", vi: "Tất cả", fil: "Lahat", af: "Alles", sw: "Zote", "zh-CN": "全部", "zh-TW": "全部", ko: "전체",
  th: "ทั้งหมด", bn: "সব", da: "Alle", hu: "Mind", xh: "Zonke", nso: "Ka moka", tn: "Tsotlhe", st: "Tsohle", ts: "Hinkwaswo",
  ss: "Konkhe", ve: "Zwoṱhe", nr: "Koke",
};
export const allTopicsLabel = (lang: string): string => ALL[lang] ?? ALL.en;

export function topicCopy(lang: string): TopicCopy {
  const c = COPY[lang];
  return c && TOPICS.every((t) => Array.isArray(c[t]) && c[t].length === 2) ? c : COPY.en;
}
