/**
 * Letter Fireflies copy (Gadi 2026-11-02). Testers only for now: Hebrew and
 * English; every other language reads English until the game opens to all.
 */
export type CatchCopy = {
  title: string; sub: string; start: string; loading: string; noWords: string; back: string; hear: string;
  yourWord: (n: number, of: number) => string; goal: string; go: string;
  catchNext: string; caughtAll: string; thats: (l: string) => string;
  jarFull: string; more: string; cardDesc: string;
  /* the scenes (Gadi 2026-11-02: fireflies, and a roller coaster in three worlds) */
  gameTitle: string; pickScene: string; sceneFireflies: string; sceneCoaster: string;
  coasterSub: string; coasterGoal: string; coasterFull: string; pickWorld: string;
  worlds: Record<"snow" | "jungle" | "space", string>;
  /* the funfair (Gadi 2026-11-02): three gentle stalls */
  sceneFair: string; fairSub: string; pickStall: string; fairFull: string;
  stalls: Record<"cans" | "balloons" | "target", string>;
  stallGoal: Record<"cans" | "balloons" | "target", string>;
};

const HE: CatchCopy = {
  title: "גחליליות האותיות",
  sub: "גחליליות עפות בלילה, וכל אחת מחזיקה אות",
  start: "יוצאים לתפוס",
  loading: "מעירים את הגחליליות",
  noWords: "אין כרגע מילים לתפוס",
  back: "חזרה",
  hear: "להשמיע את המילה",
  yourWord: (n, of) => `מילה ${n} מתוך ${of}`,
  goal: "תופסים ברשת את האותיות של המילה, לפי הסדר",
  go: "מתחילים",
  catchNext: "איזו אות באה עכשיו? תופסים אותה",
  caughtAll: "תפסתם את כל המילה!",
  thats: (l) => `זאת ${l}!`,
  jarFull: "הצנצנת מלאה!",
  more: "עוד סיבוב",
  cardDesc: "תופסים את האות הבאה במילה",
  gameTitle: "תופסים אותיות",
  pickScene: "איפה תופסים היום?",
  sceneFireflies: "גחליליות האותיות",
  sceneCoaster: "רכבת הרים",
  coasterSub: "נוסעים קדימה ותופסים אותיות משני הצדדים",
  coasterGoal: "בכל צד של המסילה מופיע שלט. לוחצים על השלט עם האות הבאה במילה",
  coasterFull: "איזו נסיעה! חמש מילים",
  pickWorld: "לאן נוסעים?",
  worlds: { snow: "שלג", jungle: "ג'ונגל", space: "חלל" },
  sceneFair: "לונה פארק",
  fairSub: "פוגעים באות הבאה במילה",
  pickStall: "באיזה דוכן משחקים?",
  fairFull: "איזו קליעה! חמש מילים",
  stalls: { cans: "פחיות", balloons: "בלונים", target: "מטרה" },
  stallGoal: {
    cans: "זורקים כדור על הפחית עם האות הבאה במילה",
    balloons: "יורים בועה על הבלון עם האות הבאה במילה",
    target: "יורים חץ על העיגול עם האות הבאה במילה",
  },
};
const EN: CatchCopy = {
  title: "Letter Fireflies",
  sub: "Fireflies fly through the night, each one holding a letter",
  start: "Let's catch",
  loading: "Waking the fireflies",
  noWords: "No words to catch right now",
  back: "Back",
  hear: "Hear the word",
  yourWord: (n, of) => `Word ${n} of ${of}`,
  goal: "Catch the letters of the word with your net, in order",
  go: "Start",
  catchNext: "Which letter comes next? Catch it",
  caughtAll: "You caught the whole word!",
  thats: (l) => `That's ${l}!`,
  jarFull: "The jar is full!",
  more: "One more round",
  cardDesc: "Catch the next letter of the word",
  gameTitle: "Letter Catch",
  pickScene: "Where do you want to catch today?",
  sceneFireflies: "Letter Fireflies",
  sceneCoaster: "Roller Coaster",
  coasterSub: "Ride forward and catch letters on both sides",
  coasterGoal: "A sign comes up on each side of the track. Tap the sign with the next letter of the word",
  coasterFull: "What a ride! Five words",
  pickWorld: "Where are we riding?",
  worlds: { snow: "Snow", jungle: "Jungle", space: "Space" },
  sceneFair: "Funfair",
  fairSub: "Hit the next letter of the word",
  pickStall: "Which stall do you want to play?",
  fairFull: "Great shooting! Five words",
  stalls: { cans: "Cans", balloons: "Balloons", target: "Target" },
  stallGoal: {
    cans: "Throw a ball at the can with the next letter of the word",
    balloons: "Shoot a bubble at the balloon with the next letter of the word",
    target: "Shoot an arrow at the disc with the next letter of the word",
  },
};

export const catchCopy = (lang: string): CatchCopy => (lang === "he" ? HE : EN);
