/**
 * Game testers (Gadi 2026-11-02: his sons Osher and Din test new games).
 * A tester has users/{uid}.tester = true: they see games before everyone
 * else and a small feedback button inside them (fixed choices, no typing).
 */

export const TESTER_KINDS = ["fun", "boring", "hard", "easy", "bug", "idea"] as const;
export type TesterKind = (typeof TESTER_KINDS)[number];

export const TESTER_EMOJI: Record<TesterKind, string> = {
  fun: "😍", boring: "😴", hard: "😵", easy: "🥱", bug: "🐞", idea: "💡",
};

type TesterCopy = { badge: string; title: string; thanks: string; close: string; kinds: Record<TesterKind, string> };

const HE: TesterCopy = {
  badge: "בודק משחקים",
  title: "מה דעתכם על המשחק?",
  thanks: "תודה! ההערה נשלחה לצוות",
  close: "סגירה",
  kinds: { fun: "כיף", boring: "משעמם", hard: "קשה מדי", easy: "קל מדי", bug: "יש באג", idea: "יש לי רעיון" },
};
const EN: TesterCopy = {
  badge: "Game tester",
  title: "What do you think of this game?",
  thanks: "Thanks! The team got your note",
  close: "Close",
  kinds: { fun: "Fun", boring: "Boring", hard: "Too hard", easy: "Too easy", bug: "Found a bug", idea: "I have an idea" },
};

/** Testers are a small group for now: Hebrew, else English. */
export const testerCopy = (lang: string): TesterCopy => (lang === "he" ? HE : EN);
