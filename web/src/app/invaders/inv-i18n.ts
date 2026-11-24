/**
 * The Invading Words: screen texts. Hebrew first (the words are Hebrew in
 * this first step); English for a tester whose screen is in English. The
 * other languages come when the game opens to everyone.
 * Hebrew speaks to the children in the plural (Gadi's rule).
 */
export type InvCopy = {
  title: string;
  sub: string;
  start: string;
  loading: string;
  notOpen: string;
  noWords: string;
  otherLang: string;
  yourWord: (i: number, n: number) => string;
  goal: (n: number) => string;
  go: string;
  tip: (w: string) => string;
  impostor: (w: string) => string;
  allFound: string;
  someFound: (k: number, n: number) => string;
  missed: string;
  knownNow: string;
  wordies: (n: number) => string;
  next: string;
  more: string;
  back: string;
  hear: string;
  roundDone: string;
  newToday: (n: number) => string;
  newTodayNone: string;
};

const iso = (s: string) => `⁨${s}⁩`;

/** Hebrew counts meanings (feminine) in words, not digits: "את שתי המשמעויות", "את כל שלוש המשמעויות". */
const HE_COUNT = ["", "אחת", "שתי", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר"];
const heGoal = (n: number) =>
  n === 1
    ? "תפסו את המשמעות שלה, והיזהרו מהמתחזות"
    : n === 2
      ? "תפסו את שתי המשמעויות שלה, והיזהרו מהמתחזות"
      : `תפסו את כל ${HE_COUNT[n] ?? n} המשמעויות שלה, והיזהרו מהמתחזות`;

const HE: InvCopy = {
  title: "מילים פולשות",
  sub: "מילים מתחפשות נופלות מהשמיים. תפסו רק את המשמעויות האמיתיות של המילה.",
  start: "מתחילים",
  loading: "טוענים מילים",
  notOpen: "המשחק הזה עוד בבנייה, ובינתיים פתוח רק לבודקים.",
  noWords: "אין עדיין מילים למשחק הזה.",
  otherLang: "בינתיים המשחק הזה בעברית בלבד.",
  yourWord: (i, n) => `מילה ${i} מתוך ${n}`,
  goal: heGoal,
  go: "קדימה",
  tip: (w) => `תפסו את המשמעויות של ${iso(w)}`,
  impostor: (w) => `מתחזה! זו המילה ${iso(w)}`,
  allFound: "תפסתם את כל המשמעויות!",
  someFound: (k, n) => `תפסתם ${k} מתוך ${n} משמעויות`,
  missed: "עוד נחזור אליה",
  knownNow: "עכשיו אתם יודעים אותה",
  wordies: (n) => `+${n} Wordies`,
  next: "למילה הבאה",
  more: "עוד מילים",
  back: "חזרה למשחקים",
  hear: "השמיעו את המילה",
  roundDone: "סיבוב שלם!",
  newToday: (n) => (n === 1 ? "היום הכרתם משמעות חדשה אחת" : `היום הכרתם ${n} משמעויות חדשות`),
  newTodayNone: "היום חזרתם על משמעויות שכבר הכרתם",
};

const EN: InvCopy = {
  title: "The Impostor Words",
  sub: "Words in disguise fall from the sky. Catch only the real meanings of the word.",
  start: "Start",
  loading: "Loading words",
  notOpen: "This game is still being built and is open to testers only.",
  noWords: "There are no words for this game yet.",
  otherLang: "For now this game is in Hebrew only.",
  yourWord: (i, n) => `Word ${i} of ${n}`,
  goal: (n) => (n === 1 ? "Catch its meaning and watch out for impostors" : `Catch all ${n} of its meanings and watch out for impostors`),
  go: "Go",
  tip: (w) => `Catch the meanings of ${iso(w)}`,
  impostor: (w) => `Impostor! That's the word ${iso(w)}`,
  allFound: "You caught every meaning!",
  someFound: (k, n) => `You caught ${k} of ${n} meanings`,
  missed: "We'll come back to it",
  knownNow: "Now you know it",
  wordies: (n) => `+${n} Wordies`,
  next: "Next word",
  more: "More words",
  back: "Back to games",
  hear: "Hear the word",
  roundDone: "Round complete!",
  newToday: (n) => (n === 1 ? "Today you met one new meaning" : `Today you met ${n} new meanings`),
  newTodayNone: "Today you practised meanings you already knew",
};

export const invCopy = (lang: string): InvCopy => (lang === "he" ? HE : EN);
