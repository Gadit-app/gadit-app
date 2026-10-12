/**
 * Learning mode copy (Gadi 2026-10-11). Only the app languages that have a
 * language to learn get the card (he, ar, ru, en); Hebrew speaks to the
 * reader in the plural; no dashes.
 */
export type LearnCopy = {
  question: string; questionSub: string; notNow: string; reopen: string;
  english: string; hebrew: string; beta: string; stop: string;
  readsQ: (lang: string) => string; readsSub: string; reads: { no: string; little: string; yes: string };
  learning: (lang: string) => string; learningSub: string; change: string;
  /** The simple course card (Gadi 2026-10-12, the council): sub, "continue", "change language". */
  simpleSub: string; cont: string; changeLang: string;
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
  question: "איזו שפה לומדים?",
  questionSub: "בחרו את השפה, ונכין שיעורים ותרגול ברמה המתאימה.",
  notNow: "לא עכשיו", reopen: "ללמוד שפה דרך המשחקים",
  english: "אנגלית", hebrew: "עברית", beta: "בטא", stop: "בלי, רק לשחק",
  readsQ: (l) => `כבר קוראים ב${l}?`,
  readsSub: "ככה נדע אם להתחיל מתמונות וקול, או גם מקריאה.",
  reads: { no: "עוד לא", little: "קצת", yes: "כן" },
  learning: (l) => `לומדים ${l}`,
  learningSub: "השיעורים כאן מותאמים לרמה, עם תרגום, תמונה וקול.",
  simpleSub: "מילים חדשות ומשפטים", cont: "המשיכו", changeLang: "שינוי שפה",
  change: "לשנות",
  learnedWeek: "מילים נלמדו השבוע",
  reinforce: "מילים לחיזוק",
  listReady: (d) => (d ? `מוכנות למבחן ב-${fmt(d, "he-IL")}` : "מילים מהרשימה מוכנות"),
  listAdd: "רשימת מילים למבחן",
  listReplace: "רשימה חדשה",
  listClear: "לסיים את הרשימה",
  listTitle: "רשימת המילים למבחן",
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
  question: "Which language are you learning?",
  questionSub: "Pick it, and we will prepare lessons and practice at the right level.",
  notNow: "Not now", reopen: "Learn a language through the games",
  english: "English", hebrew: "Hebrew", beta: "beta", stop: "Nothing, just play",
  readsQ: (l) => `Do you already read ${l}?`,
  readsSub: "So we know whether to start with pictures and sound, or with reading too.",
  reads: { no: "Not yet", little: "A little", yes: "Yes" },
  learning: (l) => `Learning ${l}`,
  learningSub: "The lessons here match the level, with a translation, a picture and sound.",
  simpleSub: "New words and sentences", cont: "Continue", changeLang: "Change language",
  change: "Change",
  learnedWeek: "words learned this week",
  reinforce: "words to practise again",
  listReady: (d) => (d ? `ready for the test on ${fmt(d, "en-GB")}` : "list words ready"),
  listAdd: "Word list for a test",
  listReplace: "New list",
  listClear: "Finish this list",
  listTitle: "Word list for a test",
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
  question: "أيّ لغة تتعلّمون؟",
  questionSub: "اختاروها، وسنحضّر دروسًا وتدريبًا بالمستوى المناسب.",
  notNow: "ليس الآن", reopen: "تعلّم لغة من خلال الألعاب",
  english: "الإنجليزية", hebrew: "العبرية", beta: "تجريبي", stop: "لا شيء، فقط نلعب",
  readsQ: (l) => `هل تقرؤون ${l} الآن؟`,
  readsSub: "هكذا نعرف هل نبدأ بالصور والصوت، أم بالقراءة أيضًا.",
  reads: { no: "ليس بعد", little: "قليلًا", yes: "نعم" },
  learning: (l) => `نتعلّم ${l}`,
  learningSub: "الدروس هنا تناسب المستوى، مع ترجمة وصورة وصوت.",
  simpleSub: "كلمات جديدة وجمل", cont: "تابعوا", changeLang: "تغيير اللغة",
  change: "تغيير",
  learnedWeek: "كلمات تعلّمناها هذا الأسبوع",
  reinforce: "كلمات للتمرين من جديد",
  listReady: (d) => (d ? `جاهزة لاختبار ${fmt(d, "ar")}` : "كلمات من القائمة جاهزة"),
  listAdd: "قائمة كلمات للامتحان",
  listReplace: "قائمة جديدة",
  listClear: "إنهاء القائمة",
  listTitle: "قائمة الكلمات للامتحان",
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
  question: "Какой язык учишь?",
  questionSub: "Выбери его, и мы подготовим уроки и практику нужного уровня.",
  notNow: "Не сейчас", reopen: "Учить язык через игры",
  english: "английский", hebrew: "иврит", beta: "бета", stop: "Ничего, просто играть",
  readsQ: (l) => `Ты уже читаешь: ${l}?`,
  readsSub: "Так мы поймём, начинать с картинок и звука или сразу с чтения.",
  reads: { no: "Ещё нет", little: "Немного", yes: "Да" },
  learning: (l) => `Учим ${l}`,
  learningSub: "Уроки здесь подстроены под уровень: с переводом, картинкой и звуком.",
  simpleSub: "Новые слова и предложения", cont: "Продолжить", changeLang: "Сменить язык",
  change: "Изменить",
  learnedWeek: "слов выучено за неделю",
  reinforce: "слов повторить",
  listReady: (d) => (d ? `готово к проверочной ${fmt(d, "ru-RU")}` : "слов из списка готово"),
  listAdd: "Список слов к контрольной",
  listReplace: "Новый список",
  listClear: "Закончить список",
  listTitle: "Список слов к контрольной",
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
