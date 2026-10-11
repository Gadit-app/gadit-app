/**
 * Learning mode copy (Gadi 2026-10-11). Only the app languages that have a
 * language to learn get the card (he, ar, ru, en); Hebrew speaks to the
 * reader in the plural; no dashes.
 */
export type LearnCopy = {
  question: string; questionSub: string;
  english: string; hebrew: string; beta: string; stop: string;
  readsQ: (lang: string) => string; readsSub: string; reads: { no: string; little: string; yes: string };
  learning: (lang: string) => string; learningSub: string; change: string;
  learnedWeek: string; reinforce: string; listReady: (testDate: string | null) => string;
  listAdd: string; listReplace: string; listClear: string;
  listTitle: string; listSub: (lang: string) => string; listPlaceholder: string;
  photo: string; reading: string; checkWords: string; photoFail: string;
  testDate: string; listSave: string; listTooFew: string; cancel: string; error: string;
};

const fmt = (d: string, locale: string) => {
  try { return new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "numeric" }); } catch { return d; }
};

const he: LearnCopy = {
  question: "מה לומדים עכשיו?",
  questionSub: "המשחקים יתאימו את עצמם למילים שלומדים, והממשק נשאר בעברית.",
  english: "אנגלית", hebrew: "עברית", beta: "בטא", stop: "בלי, רק לשחק",
  readsQ: (l) => `כבר קוראים ב${l}?`,
  readsSub: "ככה נדע אם להתחיל מתמונות וקול, או גם מקריאה.",
  reads: { no: "עוד לא", little: "קצת", yes: "כן" },
  learning: (l) => `לומדים ${l}`,
  learningSub: "כל המשחקים למטה משחקים עכשיו על המילים האלה, עם תרגום, תמונה וקול.",
  change: "לשנות",
  learnedWeek: "מילים נלמדו השבוע",
  reinforce: "מילים לחיזוק",
  listReady: (d) => (d ? `מוכנות למבחן ב-${fmt(d, "he-IL")}` : "מילים מהרשימה מוכנות"),
  listAdd: "רשימת המילים מבית הספר",
  listReplace: "רשימה חדשה מבית הספר",
  listClear: "לסיים את הרשימה",
  listTitle: "רשימת המילים מבית הספר",
  listSub: (l) => `הדביקו את המילים ב${l}, אחת בכל שורה, או צלמו את הדף. אפשר גם "מילה - תרגום".`,
  listPlaceholder: "apple\nschool\nfriend",
  photo: "צילום הרשימה",
  reading: "קוראים את התמונה…",
  checkWords: "בדקו שהמילים נכונות, ואפשר לתקן.",
  photoFail: "לא הצלחנו לקרוא את התמונה. נסו צילום חד יותר, או הקלידו את המילים.",
  testDate: "תאריך המבחן (לא חובה)",
  listSave: "לשחק על הרשימה",
  listTooFew: "צריך לפחות שתי מילים.",
  cancel: "ביטול",
  error: "משהו השתבש. נסו שוב.",
};

const en: LearnCopy = {
  question: "What are you learning now?",
  questionSub: "The games adapt to the words you're learning, and the app stays in English.",
  english: "English", hebrew: "Hebrew", beta: "beta", stop: "Nothing, just play",
  readsQ: (l) => `Do you already read ${l}?`,
  readsSub: "So we know whether to start with pictures and sound, or with reading too.",
  reads: { no: "Not yet", little: "A little", yes: "Yes" },
  learning: (l) => `Learning ${l}`,
  learningSub: "All the games below now play on these words, with a translation, a picture and sound.",
  change: "Change",
  learnedWeek: "words learned this week",
  reinforce: "words to practise again",
  listReady: (d) => (d ? `ready for the test on ${fmt(d, "en-GB")}` : "list words ready"),
  listAdd: "Word list from school",
  listReplace: "New list from school",
  listClear: "Finish this list",
  listTitle: "Word list from school",
  listSub: (l) => `Paste the ${l} words, one per line, or photograph the page. "word - translation" works too.`,
  listPlaceholder: "שולחן\nספר\nחבר",
  photo: "Photograph the list",
  reading: "Reading the photo…",
  checkWords: "Check the words are right; you can fix them.",
  photoFail: "We couldn't read the photo. Try a sharper one, or type the words.",
  testDate: "Test date (optional)",
  listSave: "Play on this list",
  listTooFew: "Add at least two words.",
  cancel: "Cancel",
  error: "Something went wrong. Try again.",
};

const ar: LearnCopy = {
  question: "ماذا تتعلّمون الآن؟",
  questionSub: "تتكيّف الألعاب مع الكلمات التي تتعلّمونها، وتبقى الواجهة بالعربية.",
  english: "الإنجليزية", hebrew: "العبرية", beta: "تجريبي", stop: "لا شيء، فقط نلعب",
  readsQ: (l) => `هل تقرؤون ${l} الآن؟`,
  readsSub: "هكذا نعرف هل نبدأ بالصور والصوت، أم بالقراءة أيضًا.",
  reads: { no: "ليس بعد", little: "قليلًا", yes: "نعم" },
  learning: (l) => `نتعلّم ${l}`,
  learningSub: "كل الألعاب أدناه تلعب الآن بهذه الكلمات، مع ترجمة وصورة وصوت.",
  change: "تغيير",
  learnedWeek: "كلمات تعلّمناها هذا الأسبوع",
  reinforce: "كلمات للتمرين من جديد",
  listReady: (d) => (d ? `جاهزة لاختبار ${fmt(d, "ar")}` : "كلمات من القائمة جاهزة"),
  listAdd: "قائمة الكلمات من المدرسة",
  listReplace: "قائمة جديدة من المدرسة",
  listClear: "إنهاء القائمة",
  listTitle: "قائمة الكلمات من المدرسة",
  listSub: (l) => `الصقوا كلمات ${l}، كلمة في كل سطر، أو صوّروا الصفحة. يمكن أيضًا "كلمة - ترجمة".`,
  listPlaceholder: "apple\nschool\nfriend",
  photo: "تصوير القائمة",
  reading: "نقرأ الصورة…",
  checkWords: "تأكّدوا أن الكلمات صحيحة، ويمكن تصحيحها.",
  photoFail: "لم نستطع قراءة الصورة. جرّبوا صورة أوضح، أو اكتبوا الكلمات.",
  testDate: "تاريخ الاختبار (اختياري)",
  listSave: "نلعب على القائمة",
  listTooFew: "أضيفوا كلمتين على الأقل.",
  cancel: "إلغاء",
  error: "حدث خطأ. حاولوا مرة أخرى.",
};

const ru: LearnCopy = {
  question: "Что ты сейчас учишь?",
  questionSub: "Игры подстроятся под слова, которые ты учишь, а приложение останется на русском.",
  english: "английский", hebrew: "иврит", beta: "бета", stop: "Ничего, просто играть",
  readsQ: (l) => `Ты уже читаешь: ${l}?`,
  readsSub: "Так мы поймём, начинать с картинок и звука или сразу с чтения.",
  reads: { no: "Ещё нет", little: "Немного", yes: "Да" },
  learning: (l) => `Учим ${l}`,
  learningSub: "Все игры ниже теперь идут на этих словах, с переводом, картинкой и звуком.",
  change: "Изменить",
  learnedWeek: "слов выучено за неделю",
  reinforce: "слов повторить",
  listReady: (d) => (d ? `готово к проверочной ${fmt(d, "ru-RU")}` : "слов из списка готово"),
  listAdd: "Список слов из школы",
  listReplace: "Новый список из школы",
  listClear: "Закончить список",
  listTitle: "Список слов из школы",
  listSub: (l) => `Вставь слова (${l}), по одному в строке, или сфотографируй страницу. Можно и «слово - перевод».`,
  listPlaceholder: "apple\nschool\nfriend",
  photo: "Сфотографировать список",
  reading: "Читаем фото…",
  checkWords: "Проверь, что слова правильные, их можно исправить.",
  photoFail: "Не получилось прочитать фото. Попробуй сделать его чётче или впиши слова.",
  testDate: "Дата проверочной (не обязательно)",
  listSave: "Играть на этом списке",
  listTooFew: "Нужно хотя бы два слова.",
  cancel: "Отмена",
  error: "Что-то пошло не так. Попробуй ещё раз.",
};

const COPY: Record<string, LearnCopy> = { he, en, ar, ru };
export function learnCopy(lang: string): LearnCopy {
  return COPY[lang] ?? en;
}
