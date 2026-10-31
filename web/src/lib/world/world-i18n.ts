/**
 * Copy for the world game (Gadi 2026-10-30). Kid-facing: Hebrew speaks to
 * the reader in the plural; no dashes anywhere; "Gadit" stays Latin.
 */

import { MORE_WORLD_COPY } from "./world-i18n-more";

/** Every world Gadi approved, built or not yet (names are shown on the map). */
export type WorldKey = "jungle" | "space" | "castle" | "ninja" | "stadium" | "forest" | "city";

export type WorldNames = {
  /** "Jungle World" */
  title: string;
  /** Button on the closed curtain: "Enter the jungle" */
  enter: string;
  /** Header of the child's own place: "My jungle" */
  my: string;
  /** "New in your jungle: {word}" */
  arrived: (word: string) => string;
  /** "A new area of the jungle is open!" */
  newArea: string;
  /** "3 words in the jungle" */
  wordsIn: (n: number) => string;
  /** Empty place: "The words you spell will live here" */
  empty: string;
};

export type WorldCopy = {
  cardDesc: string;
  yourWord: string;
  go: string;
  pick: string;
  thats: (letter: string) => string;
  gate: string;
  check: string;
  erase: string;
  almost: string;
  toArea: (n: number) => string;
  next: string;
  back: string;
  stars: string;
  hear: string;
  loading: string;
  noWords: string;
  skip: string;
  foundStar: string;
  orType: string;
  /** The map of worlds. */
  mapTitle: string;
  mapSub: string;
  /** A locked world on the map: "Spell 3 more words in Jungle World to open it" */
  locked: (n: number, prevTitle: string) => string;
  /** A world that is not built yet. */
  soon: string;
  play: string;
  worlds: Record<WorldKey, WorldNames>;
};

const en: WorldCopy = {
  cardDesc: "Pick the right letter at every door and open the gate",
  yourWord: "Your word",
  go: "Let's go",
  pick: "Which letter comes next? Pick a door",
  thats: (l) => `That's ${l}!`,
  gate: "The gate! Spell the word from memory",
  check: "Check",
  erase: "Erase",
  almost: "Almost! Here's the word. Try again",
  toArea: (n) => (n === 1 ? "1 more word to a new area" : `${n} more words to a new area`),
  next: "Next word",
  back: "Back to games",
  stars: "stars",
  hear: "Listen",
  loading: "Getting the trail ready",
  noWords: "We couldn't find words for the trail. Try again in a moment",
  skip: "Skip",
  foundStar: "You found a star!",
  orType: "You can also type it",
  mapTitle: "Word Worlds",
  mapSub: "Every word you spell comes to live in your world",
  locked: (n, prev) => (n === 1 ? `Spell 1 more word in ${prev} to open it` : `Spell ${n} more words in ${prev} to open it`),
  soon: "Coming soon",
  play: "Play",
  worlds: {
    jungle: { title: "Jungle World", enter: "Enter the jungle", my: "My jungle", arrived: (w) => `New in your jungle: ${w}`, newArea: "A new area of the jungle is open!", wordsIn: (n) => (n === 1 ? "1 word in the jungle" : `${n} words in the jungle`), empty: "The words you spell will live here" },
    space: { title: "Space Station", enter: "Enter the station", my: "My space station", arrived: (w) => `New on your station: ${w}`, newArea: "A new part of the station is open!", wordsIn: (n) => (n === 1 ? "1 word on the station" : `${n} words on the station`), empty: "The words you spell will live here" },
    castle: { title: "Magic Castle", enter: "Enter the castle", my: "My castle", arrived: (w) => `New in your castle: ${w}`, newArea: "A new hall of the castle is open!", wordsIn: (n) => (n === 1 ? "1 word in the castle" : `${n} words in the castle`), empty: "The words you spell will live here" },
    ninja: { title: "Ninja Village", enter: "Enter the village", my: "My ninja village", arrived: (w) => `New in your village: ${w}`, newArea: "A new part of the village is open!", wordsIn: (n) => (n === 1 ? "1 word in the village" : `${n} words in the village`), empty: "The words you spell will live here" },
    stadium: { title: "Stadium", enter: "Enter the stadium", my: "My stadium", arrived: (w) => `New in your stadium: ${w}`, newArea: "A new field is open!", wordsIn: (n) => (n === 1 ? "1 word in the stadium" : `${n} words in the stadium`), empty: "The words you spell will live here" },
    forest: { title: "Magic Forest", enter: "Enter the forest", my: "My forest", arrived: (w) => `New in your forest: ${w}`, newArea: "A new part of the forest is open!", wordsIn: (n) => (n === 1 ? "1 word in the forest" : `${n} words in the forest`), empty: "The words you spell will live here" },
    city: { title: "City at Night", enter: "Enter the city", my: "My city", arrived: (w) => `New in your city: ${w}`, newArea: "A new street is open!", wordsIn: (n) => (n === 1 ? "1 word in the city" : `${n} words in the city`), empty: "The words you spell will live here" },
  },
};

const heWords = (n: number, where: string) => (n === 1 ? `מילה אחת ${where}` : `${n} מילים ${where}`);
const he: WorldCopy = {
  cardDesc: "בוחרים את האות הנכונה בכל דלת ופותחים את השער",
  yourWord: "המילה שלכם",
  go: "יוצאים לדרך",
  pick: "איזו אות באה עכשיו? בחרו דלת",
  thats: (l) => `זו ${l}!`,
  gate: "השער! כתבו את המילה מהזיכרון",
  check: "לבדוק",
  erase: "מחיקה",
  almost: "כמעט! הנה המילה. נסו שוב",
  toArea: (n) => (n === 1 ? "עוד מילה אחת לאזור חדש" : `עוד ${n} מילים לאזור חדש`),
  next: "למילה הבאה",
  back: "חזרה למשחקים",
  stars: "כוכבים",
  hear: "להקשיב",
  loading: "מכינים את המסלול",
  noWords: "לא מצאנו מילים למסלול. נסו שוב עוד רגע",
  skip: "דילוג",
  foundStar: "מצאתם כוכב!",
  orType: "אפשר גם להקליד",
  mapTitle: "עולמות המילים",
  mapSub: "כל מילה שתאייתו באה לגור בעולם שלכם",
  locked: (n, prev) => (n === 1 ? `עוד מילה אחת ב${prev} כדי לפתוח` : `עוד ${n} מילים ב${prev} כדי לפתוח`),
  soon: "בקרוב",
  play: "לשחק",
  worlds: {
    jungle: { title: "עולם הג'ונגל", enter: "נכנסים לג'ונגל", my: "הג'ונגל שלי", arrived: (w) => `חדש בג'ונגל שלכם: ${w}`, newArea: "נפתח אזור חדש בג'ונגל!", wordsIn: (n) => heWords(n, "בג'ונגל"), empty: "כאן יגורו המילים שתאייתו" },
    space: { title: "תחנת החלל", enter: "נכנסים לתחנה", my: "תחנת החלל שלי", arrived: (w) => `חדש בתחנה שלכם: ${w}`, newArea: "נפתח חלק חדש בתחנה!", wordsIn: (n) => heWords(n, "בתחנה"), empty: "כאן יגורו המילים שתאייתו" },
    castle: { title: "טירת הקסמים", enter: "נכנסים לטירה", my: "הטירה שלי", arrived: (w) => `חדש בטירה שלכם: ${w}`, newArea: "נפתח אולם חדש בטירה!", wordsIn: (n) => heWords(n, "בטירה"), empty: "כאן יגורו המילים שתאייתו" },
    ninja: { title: "כפר הנינג'ות", enter: "נכנסים לכפר", my: "כפר הנינג'ות שלי", arrived: (w) => `חדש בכפר שלכם: ${w}`, newArea: "נפתח חלק חדש בכפר!", wordsIn: (n) => heWords(n, "בכפר"), empty: "כאן יגורו המילים שתאייתו" },
    stadium: { title: "האצטדיון", enter: "נכנסים לאצטדיון", my: "האצטדיון שלי", arrived: (w) => `חדש באצטדיון שלכם: ${w}`, newArea: "נפתח מגרש חדש!", wordsIn: (n) => heWords(n, "באצטדיון"), empty: "כאן יגורו המילים שתאייתו" },
    forest: { title: "היער הקסום", enter: "נכנסים ליער", my: "היער שלי", arrived: (w) => `חדש ביער שלכם: ${w}`, newArea: "נפתח חלק חדש ביער!", wordsIn: (n) => heWords(n, "ביער"), empty: "כאן יגורו המילים שתאייתו" },
    city: { title: "העיר בלילה", enter: "נכנסים לעיר", my: "העיר שלי", arrived: (w) => `חדש בעיר שלכם: ${w}`, newArea: "נפתח רחוב חדש!", wordsIn: (n) => heWords(n, "בעיר"), empty: "כאן יגורו המילים שתאייתו" },
  },
};

const COPY: Record<string, WorldCopy> = { ...MORE_WORLD_COPY, en, he };

export function worldCopy(lang: string): WorldCopy {
  return COPY[lang] ?? en;
}
