/**
 * dictation-sets — curated, curriculum-grounded word sets for the spelling /
 * dictation trainer (/spell). Themes and words follow the Israeli Ministry of
 * Education elementary "Band 1" essentials and standard EFL young-learner topics
 * (colors, numbers, family, animals, body, food, clothes, weather...), so a kid
 * can practice ALONE without a parent typing the teacher's list. Each entry is a
 * Hebrew/English pair; the trainer quizzes either direction. Answers are the
 * common, expected spellings a teacher would accept. Gadi 2026-09-19.
 *
 * A parent (or kid) can still create a CUSTOM set by pasting the teacher's exact
 * words; that path is separate. These built-in sets are the default.
 *
 * Note: WordPair.he is the NON-ENGLISH side — the learner's own language, which
 * is Hebrew for the built-in sets but can be any language for generated sets.
 */
import { CATEGORY_TITLES_EXTRA } from "@/lib/spell-i18n";

export type WordPair = { en: string; he: string };
export type DictationSet = {
  id: string;
  icon: string;
  titleEn: string;
  titleHe: string;
  words: WordPair[];
};

export const DICTATION_SETS: DictationSet[] = [
  {
    id: "colors", icon: "🎨", titleEn: "Colors", titleHe: "צבעים",
    words: [
      { en: "red", he: "אדום" }, { en: "blue", he: "כחול" }, { en: "green", he: "ירוק" },
      { en: "yellow", he: "צהוב" }, { en: "black", he: "שחור" }, { en: "white", he: "לבן" },
      { en: "orange", he: "כתום" }, { en: "purple", he: "סגול" }, { en: "pink", he: "ורוד" },
      { en: "brown", he: "חום" }, { en: "gray", he: "אפור" },
    ],
  },
  {
    id: "numbers", icon: "🔢", titleEn: "Numbers", titleHe: "מספרים",
    words: [
      { en: "one", he: "אחת" }, { en: "two", he: "שתיים" }, { en: "three", he: "שלוש" },
      { en: "four", he: "ארבע" }, { en: "five", he: "חמש" }, { en: "six", he: "שש" },
      { en: "seven", he: "שבע" }, { en: "eight", he: "שמונה" }, { en: "nine", he: "תשע" },
      { en: "ten", he: "עשר" }, { en: "eleven", he: "אחת עשרה" }, { en: "twelve", he: "שתים עשרה" },
    ],
  },
  {
    id: "family", icon: "👪", titleEn: "Family", titleHe: "משפחה",
    words: [
      { en: "mother", he: "אמא" }, { en: "father", he: "אבא" }, { en: "brother", he: "אח" },
      { en: "sister", he: "אחות" }, { en: "grandmother", he: "סבתא" }, { en: "grandfather", he: "סבא" },
      { en: "baby", he: "תינוק" }, { en: "son", he: "בן" }, { en: "daughter", he: "בת" },
      { en: "family", he: "משפחה" },
    ],
  },
  {
    id: "animals", icon: "🐾", titleEn: "Animals", titleHe: "חיות",
    words: [
      { en: "dog", he: "כלב" }, { en: "cat", he: "חתול" }, { en: "bird", he: "ציפור" },
      { en: "fish", he: "דג" }, { en: "cow", he: "פרה" }, { en: "horse", he: "סוס" },
      { en: "lion", he: "אריה" }, { en: "elephant", he: "פיל" }, { en: "monkey", he: "קוף" },
      { en: "rabbit", he: "ארנב" }, { en: "bear", he: "דוב" }, { en: "duck", he: "ברווז" },
    ],
  },
  {
    id: "body", icon: "🧍", titleEn: "Body", titleHe: "איברי הגוף",
    words: [
      { en: "head", he: "ראש" }, { en: "hand", he: "יד" }, { en: "eye", he: "עין" },
      { en: "ear", he: "אוזן" }, { en: "nose", he: "אף" }, { en: "mouth", he: "פה" },
      { en: "leg", he: "רגל" }, { en: "hair", he: "שיער" }, { en: "finger", he: "אצבע" },
      { en: "tooth", he: "שן" },
    ],
  },
  {
    id: "food", icon: "🍎", titleEn: "Food", titleHe: "אוכל",
    words: [
      { en: "bread", he: "לחם" }, { en: "milk", he: "חלב" }, { en: "water", he: "מים" },
      { en: "apple", he: "תפוח" }, { en: "banana", he: "בננה" }, { en: "egg", he: "ביצה" },
      { en: "cheese", he: "גבינה" }, { en: "cake", he: "עוגה" }, { en: "rice", he: "אורז" },
      { en: "meat", he: "בשר" },
    ],
  },
  {
    id: "clothes", icon: "👕", titleEn: "Clothes", titleHe: "בגדים",
    words: [
      { en: "shirt", he: "חולצה" }, { en: "pants", he: "מכנסיים" }, { en: "dress", he: "שמלה" },
      { en: "hat", he: "כובע" }, { en: "shoes", he: "נעליים" }, { en: "socks", he: "גרביים" },
      { en: "coat", he: "מעיל" }, { en: "skirt", he: "חצאית" },
    ],
  },
  {
    id: "weather", icon: "🌦️", titleEn: "Weather", titleHe: "מזג אוויר",
    words: [
      { en: "sun", he: "שמש" }, { en: "rain", he: "גשם" }, { en: "cloud", he: "ענן" },
      { en: "wind", he: "רוח" }, { en: "snow", he: "שלג" }, { en: "hot", he: "חם" },
      { en: "cold", he: "קר" }, { en: "storm", he: "סערה" },
    ],
  },
  {
    id: "days", icon: "📅", titleEn: "Days & Months", titleHe: "ימים וחודשים",
    words: [
      { en: "Sunday", he: "יום ראשון" }, { en: "Monday", he: "יום שני" }, { en: "Tuesday", he: "יום שלישי" },
      { en: "Wednesday", he: "יום רביעי" }, { en: "Thursday", he: "יום חמישי" }, { en: "Friday", he: "יום שישי" },
      { en: "Saturday", he: "שבת" }, { en: "day", he: "יום" }, { en: "week", he: "שבוע" }, { en: "month", he: "חודש" },
    ],
  },
  {
    id: "verbs", icon: "🏃", titleEn: "Action verbs", titleHe: "פעלים",
    words: [
      { en: "go", he: "ללכת" }, { en: "run", he: "לרוץ" }, { en: "jump", he: "לקפוץ" },
      { en: "eat", he: "לאכול" }, { en: "drink", he: "לשתות" }, { en: "read", he: "לקרוא" },
      { en: "write", he: "לכתוב" }, { en: "play", he: "לשחק" }, { en: "sleep", he: "לישון" }, { en: "sit", he: "לשבת" },
    ],
  },
];

export function getSet(id: string | null | undefined): DictationSet | null {
  if (!id) return null;
  return DICTATION_SETS.find((s) => s.id === id) ?? null;
}

/**
 * Localized category titles shown on the pick screen, so a Spanish/Arabic/… kid
 * doesn't see English or Hebrew category names (Gadi 2026-09-19). Keyed by
 * category id → language → title. en/he are seeded here; the rest are appended
 * from the localization batch. Missing langs fall back to English in getCatTitle.
 */
export const CATEGORY_TITLES: Record<string, Record<string, string>> = {
  colors:  { en: "Colors", he: "צבעים" },
  numbers: { en: "Numbers", he: "מספרים" },
  family:  { en: "Family", he: "משפחה" },
  animals: { en: "Animals", he: "חיות" },
  body:    { en: "Body", he: "איברי הגוף" },
  food:    { en: "Food", he: "אוכל" },
  clothes: { en: "Clothes", he: "בגדים" },
  weather: { en: "Weather", he: "מזג אוויר" },
  days:    { en: "Days & Months", he: "ימים וחודשים" },
  verbs:   { en: "Action verbs", he: "פעלים" },
};

export function getCatTitle(id: string, lang: string): string {
  const m = CATEGORY_TITLES[id];
  if (!m) return id;
  return m[lang] ?? CATEGORY_TITLES_EXTRA[lang]?.[id] ?? m.en ?? id;
}
