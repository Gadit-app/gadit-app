// Curated themed vocabulary sets for schools (Gadi 2026-08-05, schools
// council). A teacher opens a set and steps through the words in present
// mode on the classroom screen; each word runs through Gadit's normal
// define + picture engine. Plain data file (no CMS yet) so it is easy to
// edit and extend. Elementary (יסודי) subjects, Israeli curriculum.

export type WordSet = {
  id: string;
  subject: string;
  title: string;
  grade?: string;
  lang: string;
  words: string[];
};

export const SET_SUBJECTS: { key: string; he: string }[] = [
  { key: "language", he: "שפה ועברית" },
  { key: "math", he: "חשבון" },
  { key: "english", he: "אנגלית" },
  { key: "geography", he: "גיאוגרפיה ומולדת" },
  { key: "history", he: "היסטוריה" },
  { key: "torah", he: "תורה ותנ״ך" },
  { key: "science", he: "מדע וטבע" },
];

export const WORD_SETS: WordSet[] = [
{ id: "lang-chelkey-hadibur", subject: "language", title: "חלקי הדיבר", grade: "ג-ו", lang: "he", words: ["שם עצם", "שם תואר", "פועל", "שם פועל", "מילת יחס", "מילת חיבור", "כינוי גוף", "כינוי רמז", "תואר הפועל", "שם מספר", "מילת שאלה", "שם פרטי"] },
{ id: "lang-dikduk-velashon", subject: "language", title: "דקדוק ולשון", grade: "ד-ו", lang: "he", words: ["שורש", "משקל", "בניין", "גזרה", "זכר", "נקבה", "יחיד", "רבים", "זמן עבר", "זמן הווה", "זמן עתיד", "נטייה", "מין", "גוף"] },
{ id: "lang-simaney-pisuk", subject: "language", title: "סימני פיסוק", grade: "ב-ד", lang: "he", words: ["נקודה", "פסיק", "סימן שאלה", "סימן קריאה", "נקודתיים", "מירכאות", "נקודה ופסיק", "מקף", "סוגריים", "שלוש נקודות"] },
{ id: "lang-havanat-hanikra", subject: "language", title: "הבנת הנקרא", grade: "ג-ו", lang: "he", words: ["רעיון מרכזי", "כותרת", "פסקה", "נושא", "פרט", "מסקנה", "הסבר", "כותרת משנה", "רצף", "מילת מפתח", "משמעות", "הקשר"] },
{ id: "lang-sifrut-vesipur", subject: "language", title: "ספרות וסיפור", grade: "ג-ו", lang: "he", words: ["עלילה", "גיבור", "דמות", "מספר", "שיא", "פתיחה", "סיום", "מוסר השכל", "משל", "אגדה", "בית", "חרוז", "דימוי", "עלילה משנית"] },
{ id: "lang-nirdafot-vahafachim", subject: "language", title: "מילים נרדפות והפכים", grade: "ב-ה", lang: "he", words: ["מילים נרדפות", "מילים הפכיות", "ניגוד", "משמעות", "מילה בודדה", "צירוף מילים", "ביטוי", "פתגם", "משפחת מילים", "מילה כללית", "מילה מדויקת"] },
{ id: "math-mispar-ve-erech-hamakom", subject: "math", title: "מספרים וערך המקום", grade: "א-ד", lang: "he", words: ["מספר", "ספרה", "יחידות", "עשרות", "מאות", "אלפים", "ערך המקום", "מספר זוגי", "מספר אי זוגי", "סדר עולה", "סדר יורד", "עיגול מספרים", "ציר המספרים"] },
{ id: "math-arba-hapeulot", subject: "math", title: "ארבע פעולות החשבון", grade: "א-ו", lang: "he", words: ["חיבור", "חיסור", "כפל", "חילוק", "סכום", "הפרש", "מכפלה", "מנה", "שארית", "פעולה הפוכה", "לוח הכפל", "מספר חסר", "סוגריים"] },
{ id: "math-shvarim", subject: "math", title: "שברים", grade: "ג-ו", lang: "he", words: ["שבר", "מונה", "מכנה", "שבר יסודי", "שבר עשרוני", "שלם", "חצי", "שליש", "רבע", "שברים שווים", "מכנה משותף", "צמצום", "הרחבה", "שבר מדומה"] },
{ id: "math-geometria-ve-tzurot", subject: "math", title: "גיאומטריה וצורות", grade: "א-ו", lang: "he", words: ["מצולע", "משולש", "מרובע", "ריבוע", "מלבן", "עיגול", "מעגל", "זווית", "צלע", "קדקוד", "אלכסון", "היקף", "שטח", "סימטריה"] },
{ id: "math-medidot", subject: "math", title: "מדידות", grade: "ב-ו", lang: "he", words: ["אורך", "משקל", "נפח", "מטר", "סנטימטר", "מילימטר", "קילומטר", "קילוגרם", "גרם", "ליטר", "מיליליטר", "יחידת מידה", "סרגל", "מאזניים"] },
{ id: "math-zman-ve-kesef", subject: "math", title: "זמן וכסף", grade: "א-ד", lang: "he", words: ["שעה", "דקה", "שנייה", "לוח שנה", "יממה", "שבוע", "חודש", "שנה", "עונש", "שקל", "אגורה", "עודף", "מטבע", "שטר"] },
{ id: "english-colors", subject: "english", title: "Colors", grade: "ג-ו", lang: "en", words: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "white", "gray"] },
{ id: "english-numbers", subject: "english", title: "Numbers", grade: "ג-ו", lang: "en", words: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"] },
{ id: "english-family", subject: "english", title: "Family", grade: "ג-ו", lang: "en", words: ["mother", "father", "sister", "brother", "baby", "grandmother", "grandfather", "aunt", "uncle", "cousin"] },
{ id: "english-animals", subject: "english", title: "Animals", grade: "ג-ו", lang: "en", words: ["dog", "cat", "cow", "horse", "sheep", "bird", "fish", "lion", "elephant", "monkey", "rabbit", "duck"] },
{ id: "english-food", subject: "english", title: "Food", grade: "ג-ו", lang: "en", words: ["bread", "milk", "apple", "banana", "egg", "cheese", "rice", "water", "cake", "meat", "orange"] },
{ id: "english-classroom", subject: "english", title: "The Classroom", grade: "ג-ו", lang: "en", words: ["book", "pen", "pencil", "desk", "chair", "board", "bag", "ruler", "eraser", "teacher", "window", "door"] },
{ id: "english-body", subject: "english", title: "The Body", grade: "ג-ו", lang: "en", words: ["head", "hand", "leg", "foot", "eye", "ear", "nose", "mouth", "arm", "hair", "finger"] },
{ id: "geography-map-and-symbols", subject: "geography", title: "המפה וסמליה", grade: "ג-ו", lang: "he", words: ["מפה", "קנה מידה", "מקרא", "סמל", "גבול", "צבע גובה", "מפת דרכים", "מפה פיזית", "מפה מדינית", "רשת קווים", "כותרת המפה"] },
{ id: "geography-landforms", subject: "geography", title: "צורות נוף", grade: "ג-ו", lang: "he", words: ["הר", "גבעה", "עמק", "מישור", "רמה", "בקעה", "מדבר", "צוק", "מכתש", "עמק נחל", "רכס", "מדרון"] },
{ id: "geography-water-bodies", subject: "geography", title: "מקווי מים", grade: "ג-ו", lang: "he", words: ["ים", "אגם", "נחל", "נהר", "מפרץ", "מעיין", "ואדי", "מאגר", "בריכת מים", "אוקיינוס", "מפל מים", "תעלה"] },
{ id: "geography-climate-weather", subject: "geography", title: "אקלים ומזג אוויר", grade: "ג-ו", lang: "he", words: ["אקלים", "מזג אוויר", "טמפרטורה", "משקעים", "גשם", "עונות השנה", "לחות", "רוח", "ענן", "יובש", "שלג", "טמפרטורה ממוצעת"] },
{ id: "geography-directions-orientation", subject: "geography", title: "כיוונים והתמצאות", grade: "ג-ו", lang: "he", words: ["מצפן", "צפון", "דרום", "מזרח", "מערב", "כיוון", "התמצאות", "אופק", "שושנת הרוחות", "קו רוחב", "קו אורך", "נקודת ציון"] },
{ id: "geography-settlement-types-israel", subject: "geography", title: "יישובים בישראל", grade: "ג-ו", lang: "he", words: ["עיר", "כפר", "מושב", "קיבוץ", "עיירה", "יישוב עירוני", "יישוב כפרי", "בירה", "פרבר", "מרכז העיר", "שכונה"] },
{ id: "history-basic-concepts", subject: "history", title: "מושגי יסוד בהיסטוריה", grade: "ד-ו", lang: "he", words: ["היסטוריה", "עבר", "הווה", "עתיד", "אירוע", "תקופה", "זיכרון", "מסורת", "שינוי", "רצף", "סיבה", "תוצאה", "חוקר"] },
{ id: "history-timeline", subject: "history", title: "ציר הזמן", grade: "ד-ו", lang: "he", words: ["ציר זמן", "שנה", "עשור", "מאה", "אלף שנים", "לוח שנה", "לפני הספירה", "לספירה", "תקופה", "עידן", "כרונולוגיה", "רצף זמן"] },
{ id: "history-ancient-life", subject: "history", title: "חיים בעת העתיקה", grade: "ד-ו", lang: "he", words: ["עת עתיקה", "חקלאות", "ציד", "כלי אבן", "כלי חרס", "מסחר", "כפר", "עיר", "חומה", "מקדש", "אומן", "שבט", "משפחה", "קהילה"] },
{ id: "history-sources", subject: "history", title: "מקורות היסטוריים", grade: "ד-ו", lang: "he", words: ["מקור היסטורי", "ממצא", "עדות", "ארכיאולוג", "חפירה", "כתובת", "מגילה", "תעודה", "עתיקה", "עדות בכתב", "עדות בעל פה", "מוזיאון", "שחזור"] },
{ id: "history-government-society", subject: "history", title: "שלטון וחברה", grade: "ד-ו", lang: "he", words: ["שלטון", "מנהיג", "מלך", "שושלת", "ממלכה", "אימפריה", "חברה", "מעמד", "חוק", "אזרח", "עם", "כתר", "כס מלכות", "מועצה"] },
{ id: "torah-hamisha-humshei-torah", subject: "torah", title: "חמישה חומשי תורה", grade: "ג-ו", lang: "he", words: ["בראשית", "שמות", "ויקרא", "במדבר", "דברים", "חומש", "ספר תורה", "פרשת השבוע", "תורה", "יריעה"] },
{ id: "torah-musgey-yesod-bamikra", subject: "torah", title: "מושגי יסוד במקרא", grade: "ג-ו", lang: "he", words: ["ברית", "מצווה", "נביא", "נבואה", "כהן", "לוי", "אבות", "שבטים", "עם ישראל", "ארץ ישראל", "אמונה", "תפילה"] },
{ id: "torah-hamishkan-vekelav", subject: "torah", title: "המשכן וכליו", grade: "ד-ו", lang: "he", words: ["משכן", "מזבח", "מנורה", "ארון", "שולחן", "כפורת", "כרובים", "פרוכת", "יריעה", "קטורת", "בגדי כהונה", "כיור"] },
{ id: "torah-hagim-umoadim-batorah", subject: "torah", title: "חגים ומועדים בתורה", grade: "ב-ו", lang: "he", words: ["שבת", "פסח", "שבועות", "סוכות", "ראש השנה", "יום כיפור", "מצה", "שופר", "מועד", "חג", "ביכורים", "עומר"] },
{ id: "torah-arachim-umitzvot", subject: "torah", title: "ערכים ומצוות", grade: "ב-ו", lang: "he", words: ["צדקה", "כיבוד הורים", "חסד", "אמת", "שלום", "צדק", "רחמים", "הכנסת אורחים", "עשרת הדיברות", "מצווה", "ואהבת לרעך", "ענווה"] },
{ id: "torah-mivne-hatekst-hamikrai", subject: "torah", title: "מבנה הטקסט המקראי", grade: "ד-ו", lang: "he", words: ["פרק", "פסוק", "פרשה", "פרשת השבוע", "טעמים", "ניקוד", "כתיב", "מגילה", "הפטרה", "פרשה פתוחה", "פרשה סתומה", "מסורה"] },
{ id: "science-guf-haadam", subject: "science", title: "גוף האדם", grade: "ג-ו", lang: "he", words: ["שלד", "עצם", "שריר", "ריאות", "נשימה", "לב", "דם", "מוח", "עצב", "קיבה", "עיכול", "מפרק"] },
{ id: "science-baalei-chaim", subject: "science", title: "בעלי חיים", grade: "א-ד", lang: "he", words: ["יונקים", "עופות", "זוחלים", "דוחיים", "דגים", "חרקים", "טורף", "נטרף", "בית גידול", "הסוואה", "נדידה", "טורף על"] },
{ id: "science-olam-hatzomeach", subject: "science", title: "עולם הצומח", grade: "ב-ה", lang: "he", words: ["שורש", "גבעול", "עלה", "פרח", "פרי", "זרע", "נביטה", "פוטוסינתזה", "אבקה", "האבקה", "עלה כותרת", "צמח"] },
{ id: "science-matzavei-tzvira", subject: "science", title: "מצבי צבירה", grade: "ג-ו", lang: "he", words: ["מוצק", "נוזל", "גז", "התכה", "קפיאה", "התאדות", "אֵדוי", "עיבוי", "המסה", "רתיחה", "טמפרטורה", "חום"] },
{ id: "science-mezeg-avir-onot", subject: "science", title: "מזג אוויר ועונות", grade: "א-ד", lang: "he", words: ["גשם", "ענן", "רוח", "טמפרטורה", "לחות", "שלג", "עונות השנה", "אביב", "קיץ", "סתיו", "חורף", "טפטרה"] },
{ id: "science-kochot-energia", subject: "science", title: "כוחות ואנרגיה בסיסי", grade: "ד-ו", lang: "he", words: ["כוח", "כבידה", "חיכוך", "משיכה", "דחיפה", "אנרגיה", "תנועה", "מהירות", "מגנט", "משקל", "מנוף", "אנרגיה חשמלית"] },
{ id: "science-sviva-machzorim", subject: "science", title: "הסביבה ומחזורים בטבע", grade: "ד-ו", lang: "he", words: ["מחזור המים", "מערכת אקולוגית", "שרשרת מזון", "מיחזור", "זיהום", "משאבי טבע", "אנרגיה מתחדשת", "מגוון ביולוגי", "מחזור החומרים", "פסולת", "שימור", "בית גידול"] },
];

export function getWordSet(id: string): WordSet | undefined {
  return WORD_SETS.find((s) => s.id === id);
}
export function subjectLabel(key: string): string {
  return SET_SUBJECTS.find((s) => s.key === key)?.he ?? key;
}
export function setsBySubject(): { key: string; he: string; sets: WordSet[] }[] {
  return SET_SUBJECTS
    .map((s) => ({ ...s, sets: WORD_SETS.filter((w) => w.subject === s.key) }))
    .filter((g) => g.sets.length > 0);
}
