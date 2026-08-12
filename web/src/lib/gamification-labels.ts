import type { RankKey } from "./gamification";

/**
 * Localized copy for the kids gamification widgets. Kept out of the pure
 * gamification module so that stays i/o- and i18n-free. he/en/ar/ru cover
 * the main Family markets (Hebrew-first, plus immigrant Russian/Arabic
 * households); every other UI language falls back to English for v1.
 */

export const RANK_LABELS: Record<string, Record<RankKey, string>> = {
  en: { scout: "Word Scout", explorer: "Word Explorer", tracker: "Word Tracker", ranger: "Word Ranger", guide: "Word Guide", master: "Word Master" },
  he: { scout: "מגלה מתחיל", explorer: "מגלה מילים", tracker: "חוקר מילים", ranger: "מגלה מנוסה", guide: "מדריך מילים", master: "אלוף המילים" },
  ar: { scout: "مستكشف مبتدئ", explorer: "مستكشف كلمات", tracker: "باحث كلمات", ranger: "مستكشف متمرّس", guide: "مرشد كلمات", master: "بطل الكلمات" },
  ru: { scout: "Юный искатель", explorer: "Искатель слов", tracker: "Следопыт слов", ranger: "Опытный искатель", guide: "Проводник слов", master: "Мастер слов" },
};

export function rankLabel(key: RankKey, lang: string): string {
  return (RANK_LABELS[lang] ?? RANK_LABELS.en)[key];
}

export type GameCopy = {
  streakTitle: string;
  streakDays: (n: number) => string;
  streakStart: string;
  weeklyTitle: string;
  weeklyProgress: (n: number, goal: number) => string;
  weeklyDone: string;
  rankTitle: string;
  toNext: (n: number) => string;
  topRank: string;
  collected: (n: number) => string;
};

export const GAME_COPY: Record<string, GameCopy> = {
  en: {
    streakTitle: "Streak",
    streakDays: (n) => (n === 1 ? "1 day in a row" : `${n} days in a row`),
    streakStart: "Look up a word to start a streak",
    weeklyTitle: "This week",
    weeklyProgress: (n, goal) => `${n} / ${goal} new words`,
    weeklyDone: "Weekly goal complete!",
    rankTitle: "Your rank",
    toNext: (n) => (n === 1 ? "1 more word to level up" : `${n} more words to level up`),
    topRank: "Top rank reached!",
    collected: (n) => (n === 1 ? "1 word collected" : `${n} words collected`),
  },
  he: {
    streakTitle: "רצף",
    streakDays: (n) => (n === 1 ? "יום אחד ברצף" : `${n} ימים ברצף`),
    streakStart: "חפשו מילה כדי להתחיל רצף",
    weeklyTitle: "השבוע",
    weeklyProgress: (n, goal) => `${n} / ${goal} מילים חדשות`,
    weeklyDone: "השלמת את היעד השבועי!",
    rankTitle: "הדרגה שלך",
    toNext: (n) => (n === 1 ? "עוד מילה אחת לדרגה הבאה" : `עוד ${n} מילים לדרגה הבאה`),
    topRank: "הגעת לדרגה הגבוהה ביותר!",
    collected: (n) => (n === 1 ? "מילה אחת באוסף" : `${n} מילים באוסף`),
  },
  ar: {
    streakTitle: "سلسلة",
    streakDays: (n) => (n === 1 ? "يوم واحد متتالٍ" : `${n} أيام متتالية`),
    streakStart: "ابحث عن كلمة لتبدأ سلسلة",
    weeklyTitle: "هذا الأسبوع",
    weeklyProgress: (n, goal) => `${n} / ${goal} كلمات جديدة`,
    weeklyDone: "أكملت هدف الأسبوع!",
    rankTitle: "رتبتك",
    toNext: (n) => (n === 1 ? "كلمة واحدة للترقية" : `${n} كلمات للترقية`),
    topRank: "وصلت إلى أعلى رتبة!",
    collected: (n) => (n === 1 ? "كلمة واحدة في المجموعة" : `${n} كلمات في المجموعة`),
  },
  ru: {
    streakTitle: "Серия",
    streakDays: (n) => (n === 1 ? "1 день подряд" : `${n} дней подряд`),
    streakStart: "Найдите слово, чтобы начать серию",
    weeklyTitle: "На этой неделе",
    weeklyProgress: (n, goal) => `${n} / ${goal} новых слов`,
    weeklyDone: "Цель недели выполнена!",
    rankTitle: "Ваш ранг",
    toNext: (n) => (n === 1 ? "ещё 1 слово до нового ранга" : `ещё ${n} слов(а) до нового ранга`),
    topRank: "Достигнут высший ранг!",
    collected: (n) => (n === 1 ? "1 слово собрано" : `${n} слов собрано`),
  },
};

export function gameCopy(lang: string): GameCopy {
  return GAME_COPY[lang] ?? GAME_COPY.en;
}
