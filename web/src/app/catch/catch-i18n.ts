/**
 * Letter Fireflies copy (Gadi 2026-11-02). Testers only for now: Hebrew and
 * English; every other language reads English until the game opens to all.
 */
export type CatchCopy = {
  title: string; sub: string; start: string; loading: string; noWords: string; back: string; hear: string;
  yourWord: (n: number, of: number) => string; goal: string; go: string;
  catchNext: string; caughtAll: string; thats: (l: string) => string;
  jarFull: string; more: string; cardDesc: string;
  /* the scenes (Gadi 2026-11-02: fireflies, and the city train) */
  gameTitle: string; pickScene: string; sceneFireflies: string; sceneTrain: string;
  trainSub: string; trainGoal: string; trainFull: string;
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
  sceneTrain: "רכבת העיר",
  trainSub: "בכל תחנה עוברות שתי אותיות",
  trainGoal: "בכל תחנה עוברים שני שלטים. לוחצים על השלט עם האות הבאה במילה",
  trainFull: "הגעתם לתחנה האחרונה!",
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
  sceneTrain: "City Train",
  trainSub: "At every station, two letters go by",
  trainGoal: "Two signs pass at every station. Tap the sign with the next letter of the word",
  trainFull: "You reached the last station!",
};

export const catchCopy = (lang: string): CatchCopy => (lang === "he" ? HE : EN);
