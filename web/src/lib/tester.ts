/**
 * Game testers (Gadi 2026-11-02: his sons Osher and Din test the games).
 * A tester has users/{uid}.tester = true: they see games before everyone
 * else, every game in Kids Mode too, and a 🧪 button in every game with
 * fixed choices and a microphone for a voice note (never typed text).
 */

export const TESTER_KINDS = ["fun", "boring", "hard", "easy", "bug", "idea", "voice"] as const;
export type TesterKind = (typeof TESTER_KINDS)[number];
/** The choices on the panel (a voice note is the microphone button). */
export const TESTER_CHOICES = ["fun", "boring", "hard", "easy", "bug", "idea"] as const;
/** These open the microphone first: a bug or an idea is best told in words,
 *  and a rating asks what would make the game better (Gadi 2026-11-10: "only
 *  four stars" is not a note without a suggestion). */
export const TESTER_SAY_FIRST = new Set<TesterKind>(["bug", "idea", "fun", "boring", "hard", "easy"]);
export const TESTER_RATINGS = new Set<TesterKind>(["fun", "boring", "hard", "easy"]);

export const TESTER_EMOJI: Record<TesterKind, string> = {
  fun: "😍", boring: "😴", hard: "😵", easy: "🥱", bug: "🐞", idea: "💡", voice: "🎤",
};

export type TesterCopy = {
  badge: string; title: string; thanks: string; close: string; heard: string;
  record: string; stop: string; sending: string; sendPlain: string; noMic: string;
  sayBug: string; sayIdea: string; sayAny: string; sayBetter: string;
  myPay: string;
  kinds: Record<TesterKind, string>;
};

const HE: TesterCopy = {
  badge: "בודק משחקים",
  title: "מה דעתכם?",
  thanks: "תודה! ההערה נשלחה",
  close: "סגירה",
  heard: "שמענו:",
  record: "🎤 להקליט",
  stop: "לעצור ולשלוח",
  sending: "שולחים",
  sendPlain: "לשלוח בלי הקלטה",
  noMic: "אין גישה למיקרופון. אפשר לשלוח בלי הקלטה",
  sayBug: "ספרו מה הבאג: מה עשיתם ומה קרה",
  sayIdea: "ספרו את הרעיון",
  sayAny: "ספרו מה רוצים להגיד",
  sayBetter: "מה היה הופך את המשחק ל-5 כוכבים? ספרו לנו",
  myPay: "💰 התשלום החודשי שלי",
  kinds: { fun: "כיף", boring: "משעמם", hard: "קשה מדי", easy: "קל מדי", bug: "יש באג", idea: "יש לי רעיון", voice: "להגיד משהו" },
};
const EN: TesterCopy = {
  badge: "Game tester",
  title: "What do you think?",
  thanks: "Thanks! Your note was sent",
  close: "Close",
  heard: "We heard:",
  record: "🎤 Record",
  stop: "Stop and send",
  sending: "Sending",
  sendPlain: "Send without recording",
  noMic: "No access to the microphone. You can send without recording",
  sayBug: "Tell us the bug: what you did and what happened",
  sayIdea: "Tell us your idea",
  sayAny: "Tell us what you want to say",
  sayBetter: "What would make this game 5 stars? Tell us",
  myPay: "💰 My monthly pay",
  kinds: { fun: "Fun", boring: "Boring", hard: "Too hard", easy: "Too easy", bug: "Found a bug", idea: "I have an idea", voice: "Say something" },
};

/** Testers are a small group for now: Hebrew, else English. */
export const testerCopy = (lang: string): TesterCopy => (lang === "he" ? HE : EN);

/* The game on screen right now, for notes sent from the floating button
   (pages without their own 🧪 set it: /play sets the game being played). */
let current: { game: string; word?: string } = { game: "" };
export const setTesterGame = (game: string, word?: string) => { current = { game, word }; };
export const testerGame = () => current;
