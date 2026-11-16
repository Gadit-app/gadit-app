/**
 * Built-in words for Context Detective in Kids Mode (Gadi 2026-11-16: the
 * stories came back again and again, because a child with few words of their
 * own played only the 12 curated words of lib/play-content/curated-play-words.ts).
 *
 * 60 words a language, from the lesson banks (src/lib/learn: levels 1 and 2,
 * single words, 16 topics in turn, none of the curated 12). The game adds them
 * after the child’s own words of the story language, and their stories are
 * written ahead into the story store (scripts/context-stories-seed.mts
 * --source=kids60), so the game opens at once.
 *
 * No imports: the seed script reads this file with plain node.
 */
export const CONTEXT_KIDS_WORDS: Record<string, string[]> = {
  he: ["כלב", "לחם", "בית", "ספר", "שמש", "ללכת", "אמא", "ראש", "חולצה", "גשם", "מכונית", "שמח", "גדול", "כדור", "גן", "רופא", "חתול", "מים", "דלת", "עיפרון", "ירח", "לאכול", "אבא", "יד", "מכנסיים", "ענן", "אוטובוס", "עצוב", "קטן", "בובה", "חנות", "שוטר", "ציפור", "חלב", "חלון", "עט", "כוכב", "לשתות", "אח", "רגל", "נעליים", "רוח", "אופניים", "כועס", "חם", "משחק", "רחוב", "כבאי", "דג", "תפוח", "שולחן", "מחברת", "עץ", "לישון", "אחות", "עין", "כובע", "שלג", "רכבת", "עייף"],
  en: ["dog", "bread", "house", "book", "tree", "go", "mother", "head", "shirt", "sun", "car", "happy", "big", "ball", "park", "football", "doctor", "cat", "milk", "door", "pen", "flower", "run", "father", "eye", "pants", "rain", "bus", "sad", "small", "doll", "zoo", "bird", "apple", "bed", "pencil", "sea", "jump", "sister", "ear", "dress", "cloud", "bike", "hungry", "long", "toy", "shop", "fish", "banana", "room", "bag", "moon", "eat", "brother", "nose", "shoes", "wind", "train", "tired", "short"],
};
