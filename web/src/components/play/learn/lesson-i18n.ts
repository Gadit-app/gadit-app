/**
 * Copy for a workbook lesson and its two games (Gadi 2026-10-11). Learning
 * mode exists in he/en/ar/ru, so these four; Hebrew speaks to the reader in
 * the plural; no dashes.
 */
export type LessonCopy = {
  photoBtn: string; photoSub: string; reading: string; building: string; fail: string;
  title: (topic: string) => string; meta: (words: number) => string; start: string;
  steps: { cards: string; match: string; fill: string; truefalse: string; reading: string; pronoun: string; build: string };
  stepOf: (i: number, n: number) => string; next: (step: string) => string;
  doneTitle: string; doneBody: string; back: string;
  buildTitle: string; buildPrompt: string; buildRight: string; buildWrong: string; nextBtn: string; clear: string;
  pronounTitle: string; pronounPrompt: string;
  readingTitle: string; readingAsk: string; yes: string; no: string;
  nextLesson: string; allLessons: string; hideLessons: string; startBtn: string; loading: string;
};

const he: LessonCopy = {
  photoBtn: "שיעור מעמודי החוברת",
  photoSub: "צלמו עמוד אחד או כמה עמודים מהיחידה, ונבנה מהם שיעור לפי הסדר של החוברת.",
  reading: "קוראים את העמודים…",
  building: "בונים את השיעור…",
  fail: "לא הצלחנו לבנות שיעור מהתמונות. נסו צילום חד יותר.",
  title: (t) => `שיעור: ${t}`,
  meta: (n) => `${n} מילים, שלב אחר שלב לפי הסדר של החוברת`,
  start: "להתחיל את השיעור",
  steps: { cards: "מכירים את המילים", match: "מילה ומשמעות", fill: "משלימים משפט", truefalse: "נכון או לא", reading: "קוראים ועונים", pronoun: "הוא, היא או זה", build: "בונים משפט" },
  stepOf: (i, n) => `שלב ${i} מתוך ${n}`,
  next: (s) => `לשלב הבא: ${s}`,
  doneTitle: "סיימתם את השיעור!",
  doneBody: "עברתם על כל המילים של היחידה. המילים שהיו קשות יחזרו במשחקים הבאים.",
  back: "חזרה למשחקים",
  buildTitle: "בונים משפט",
  buildPrompt: "לחצו על המילים לפי הסדר הנכון",
  buildRight: "מעולה!",
  buildWrong: "המשפט הנכון:",
  nextBtn: "הבא",
  clear: "מחיקה",
  pronounTitle: "הוא, היא או זה",
  pronounPrompt: "איזו מילה מתאימה במקום:",
  readingTitle: "קוראים ועונים", readingAsk: "נכון או לא נכון?", yes: "נכון", no: "לא נכון",
  nextLesson: "השיעור הבא", allLessons: "כל השיעורים", hideLessons: "להסתיר את השיעורים", startBtn: "מתחילים", loading: "מכינים את השיעור…",
};
const en: LessonCopy = {
  photoBtn: "A lesson from workbook pages",
  photoSub: "Take a photo of one or more pages of the unit, and we'll build a lesson in the workbook's order.",
  reading: "Reading the pages…",
  building: "Building the lesson…",
  fail: "We couldn't build a lesson from the photos. Try a sharper one.",
  title: (t) => `Lesson: ${t}`,
  meta: (n) => `${n} words, step by step in the workbook's order`,
  start: "Start the lesson",
  steps: { cards: "Meet the words", match: "Word and meaning", fill: "Fill the sentence", truefalse: "True or false", reading: "Read and answer", pronoun: "He, she or it", build: "Build a sentence" },
  stepOf: (i, n) => `Step ${i} of ${n}`,
  next: (s) => `Next step: ${s}`,
  doneTitle: "Lesson complete!",
  doneBody: "You went over all the unit's words. The hard ones will come back in the next games.",
  back: "Back to games",
  buildTitle: "Build a sentence",
  buildPrompt: "Tap the words in the right order",
  buildRight: "Great!",
  buildWrong: "The right sentence:",
  nextBtn: "Next",
  clear: "Clear",
  pronounTitle: "He, she or it",
  pronounPrompt: "Which word can replace:",
  readingTitle: "Read and answer", readingAsk: "True or false?", yes: "True", no: "False",
  nextLesson: "Next lesson", allLessons: "All lessons", hideLessons: "Hide lessons", startBtn: "Start", loading: "Getting the lesson ready…",
};
const ar: LessonCopy = {
  photoBtn: "درس من صفحات الكراسة",
  photoSub: "صوّروا صفحة أو أكثر من الوحدة، وسنبني منها درسًا بترتيب الكراسة.",
  reading: "نقرأ الصفحات…",
  building: "نبني الدرس…",
  fail: "لم نتمكن من بناء درس من الصور. جرّبوا صورة أوضح.",
  title: (t) => `درس: ${t}`,
  meta: (n) => `${n} كلمة، خطوة بخطوة بترتيب الكراسة`,
  start: "ابدأوا الدرس",
  steps: { cards: "نتعرّف على الكلمات", match: "كلمة ومعنى", fill: "نكمل الجملة", truefalse: "صح أم خطأ", reading: "نقرأ ونجيب", pronoun: "هو أو هي أو هذا", build: "نبني جملة" },
  stepOf: (i, n) => `المرحلة ${i} من ${n}`,
  next: (s) => `المرحلة التالية: ${s}`,
  doneTitle: "أنهيتم الدرس!",
  doneBody: "راجعتم كل كلمات الوحدة. الكلمات الصعبة ستعود في الألعاب القادمة.",
  back: "العودة إلى الألعاب",
  buildTitle: "نبني جملة",
  buildPrompt: "اضغطوا على الكلمات بالترتيب الصحيح",
  buildRight: "ممتاز!",
  buildWrong: "الجملة الصحيحة:",
  nextBtn: "التالي",
  clear: "مسح",
  pronounTitle: "هو أو هي أو هذا",
  pronounPrompt: "أي كلمة تأتي بدل:",
  readingTitle: "نقرأ ونجيب", readingAsk: "صح أم خطأ؟", yes: "صح", no: "خطأ",
  nextLesson: "الدرس التالي", allLessons: "كل الدروس", hideLessons: "إخفاء الدروس", startBtn: "ابدأوا", loading: "نجهّز الدرس…",
};
const ru: LessonCopy = {
  photoBtn: "Урок по страницам тетради",
  photoSub: "Сфотографируй одну или несколько страниц раздела, и мы соберём урок в порядке тетради.",
  reading: "Читаем страницы…",
  building: "Собираем урок…",
  fail: "Не получилось собрать урок по фото. Попробуй снимок почётче.",
  title: (t) => `Урок: ${t}`,
  meta: (n) => `Слов: ${n}, шаг за шагом в порядке тетради`,
  start: "Начать урок",
  steps: { cards: "Знакомимся со словами", match: "Слово и значение", fill: "Дополни предложение", truefalse: "Правда или нет", reading: "Читаем и отвечаем", pronoun: "He, she или it", build: "Собери предложение" },
  stepOf: (i, n) => `Шаг ${i} из ${n}`,
  next: (s) => `Следующий шаг: ${s}`,
  doneTitle: "Урок пройден!",
  doneBody: "Ты прошёл все слова раздела. Трудные слова вернутся в следующих играх.",
  back: "К играм",
  buildTitle: "Собери предложение",
  buildPrompt: "Нажимай на слова в правильном порядке",
  buildRight: "Отлично!",
  buildWrong: "Правильное предложение:",
  nextBtn: "Дальше",
  clear: "Очистить",
  pronounTitle: "He, she или it",
  pronounPrompt: "Какое слово заменит:",
  readingTitle: "Читаем и отвечаем", readingAsk: "Правда или нет?", yes: "Правда", no: "Неправда",
  nextLesson: "Следующий урок", allLessons: "Все уроки", hideLessons: "Скрыть уроки", startBtn: "Начать", loading: "Готовим урок…",
};

const COPY: Record<string, LessonCopy> = { he, en, ar, ru };
export function lessonCopy(lang: string): LessonCopy {
  return COPY[lang] ?? en;
}
