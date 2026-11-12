/**
 * Games a child invented (Gadi 2026-11-12, "Invent your learning game"): the
 * card of each one says whose idea it was. A first name only, and only with
 * the parent's agreement. The key is the game id in /play ("catch" is the
 * Letter Catch card).
 */
export const GAME_INVENTORS: Record<string, { he: string; en: string }> = {
  // Osher wanted a תשחץ (2026-11-11); it became the three puzzles.
  wordsearch: { he: "אושר", en: "Osher" },
  crossword: { he: "אושר", en: "Osher" },
  arrowword: { he: "אושר", en: "Osher" },
  // Din's funfair in Letter Catch: the cans, the balloons and the darts (Gadi 2026-11-12).
  "catch-fair": { he: "דין", en: "Din" },
  // Noam and his mother Shirli made the wheel out of paper and filmed it (2026-11-12).
  wheel: { he: "נועם", en: "Noam" },
  // The dictation trainer grew out of Ziv's weekly school dictation (2026-09-19).
  spell: { he: "זיו", en: "Ziv" },
};

const BY: Record<string, (name: string) => string> = {
  he: (n) => `הרעיון של ${n}`,
  en: (n) => `${n}'s idea`,
  ar: (n) => `فكرة ${n}`,
  ru: (n) => `Идея: ${n}`,
};

/** "Osher's idea" for a game card, or null when no child invented the game. */
export function inventedBy(gameId: string, lang: string): string | null {
  const who = GAME_INVENTORS[gameId];
  if (!who) return null;
  return (BY[lang] ?? BY.en)(lang === "he" ? who.he : who.en);
}
