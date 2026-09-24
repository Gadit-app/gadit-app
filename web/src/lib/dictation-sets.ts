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
  colors:  { en: "Colors", he: "צבעים", ar: "الألوان", ru: "Цвета", es: "Colores", pt: "Cores", fr: "Couleurs", de: "Farben", cs: "Barvy", sk: "Farby", it: "Colori", ja: "いろ", hi: "रंग", am: "ቀለሞች", uk: "Кольори", tr: "Renkler", pl: "Kolory", fa: "رنگ‌ها", id: "Warna", nl: "Kleuren", el: "Χρώματα", zu: "Imibala", vi: "Màu sắc", fil: "Mga Kulay", af: "Kleure", sw: "Rangi", "zh-CN": "颜色", "zh-TW": "顏色", ko: "색깔", th: "สี", bn: "রং", da: "Farver", hu: "Színek" },
  numbers: { en: "Numbers", he: "מספרים", ar: "الأرقام", ru: "Числа", es: "Números", pt: "Números", fr: "Nombres", de: "Zahlen", cs: "Čísla", sk: "Čísla", it: "Numeri", ja: "すうじ", hi: "संख्याएँ", am: "ቁጥሮች", uk: "Числа", tr: "Sayılar", pl: "Liczby", fa: "اعداد", id: "Angka", nl: "Getallen", el: "Αριθμοί", zu: "Izinombolo", vi: "Số đếm", fil: "Mga Numero", af: "Getalle", sw: "Nambari", "zh-CN": "数字", "zh-TW": "數字", ko: "숫자", th: "ตัวเลข", bn: "সংখ্যা", da: "Tal", hu: "Számok" },
  family:  { en: "Family", he: "משפחה", ar: "العائلة", ru: "Семья", es: "Familia", pt: "Família", fr: "Famille", de: "Familie", cs: "Rodina", sk: "Rodina", it: "Famiglia", ja: "かぞく", hi: "परिवार", am: "ቤተሰብ", uk: "Сім'я", tr: "Aile", pl: "Rodzina", fa: "خانواده", id: "Keluarga", nl: "Familie", el: "Οικογένεια", zu: "Umndeni", vi: "Gia đình", fil: "Pamilya", af: "Familie", sw: "Familia", "zh-CN": "家庭", "zh-TW": "家庭", ko: "가족", th: "ครอบครัว", bn: "পরিবার", da: "Familie", hu: "Család" },
  animals: { en: "Animals", he: "חיות", ar: "الحيوانات", ru: "Животные", es: "Animales", pt: "Animais", fr: "Animaux", de: "Tiere", cs: "Zvířata", sk: "Zvieratá", it: "Animali", ja: "どうぶつ", hi: "जानवर", am: "እንስሳት", uk: "Тварини", tr: "Hayvanlar", pl: "Zwierzęta", fa: "حیوانات", id: "Hewan", nl: "Dieren", el: "Ζώα", zu: "Izilwane", vi: "Động vật", fil: "Mga Hayop", af: "Diere", sw: "Wanyama", "zh-CN": "动物", "zh-TW": "動物", ko: "동물", th: "สัตว์", bn: "প্রাণী", da: "Dyr", hu: "Állatok" },
  body:    { en: "Body", he: "איברי הגוף", ar: "الجسم", ru: "Тело", es: "Cuerpo", pt: "Corpo", fr: "Corps", de: "Körper", cs: "Tělo", sk: "Telo", it: "Corpo", ja: "からだ", hi: "शरीर", am: "የሰውነት ክፍሎች", uk: "Тіло", tr: "Vücut", pl: "Ciało", fa: "بدن", id: "Tubuh", nl: "Lichaam", el: "Σώμα", zu: "Umzimba", vi: "Cơ thể", fil: "Katawan", af: "Liggaam", sw: "Sehemu za mwili", "zh-CN": "身体", "zh-TW": "身體", ko: "몸", th: "ร่างกาย", bn: "শরীর", da: "Krop", hu: "Test" },
  food:    { en: "Food", he: "אוכל", ar: "الطعام", ru: "Еда", es: "Comida", pt: "Comida", fr: "Nourriture", de: "Essen", cs: "Jídlo", sk: "Jedlo", it: "Cibo", ja: "たべもの", hi: "खाना", am: "ምግብ", uk: "Їжа", tr: "Yiyecek", pl: "Jedzenie", fa: "غذا", id: "Makanan", nl: "Eten", el: "Φαγητό", zu: "Ukudla", vi: "Thức ăn", fil: "Pagkain", af: "Kos", sw: "Chakula", "zh-CN": "食物", "zh-TW": "食物", ko: "음식", th: "อาหาร", bn: "খাবার", da: "Mad", hu: "Étel" },
  clothes: { en: "Clothes", he: "בגדים", ar: "الملابس", ru: "Одежда", es: "Ropa", pt: "Roupas", fr: "Vêtements", de: "Kleidung", cs: "Oblečení", sk: "Oblečenie", it: "Vestiti", ja: "ふく", hi: "कपड़े", am: "ልብስ", uk: "Одяг", tr: "Giysiler", pl: "Ubrania", fa: "لباس‌ها", id: "Pakaian", nl: "Kleding", el: "Ρούχα", zu: "Izingubo", vi: "Quần áo", fil: "Damit", af: "Klere", sw: "Nguo", "zh-CN": "衣服", "zh-TW": "衣服", ko: "옷", th: "เสื้อผ้า", bn: "পোশাক", da: "Tøj", hu: "Ruhák" },
  weather: { en: "Weather", he: "מזג אוויר", ar: "الطقس", ru: "Погода", es: "El tiempo", pt: "Tempo", fr: "Météo", de: "Wetter", cs: "Počasí", sk: "Počasie", it: "Tempo", ja: "てんき", hi: "मौसम", am: "የአየር ሁኔታ", uk: "Погода", tr: "Hava durumu", pl: "Pogoda", fa: "آب‌وهوا", id: "Cuaca", nl: "Weer", el: "Καιρός", zu: "Isimo sezulu", vi: "Thời tiết", fil: "Panahon", af: "Weer", sw: "Hali ya hewa", "zh-CN": "天气", "zh-TW": "天氣", ko: "날씨", th: "สภาพอากาศ", bn: "আবহাওয়া", da: "Vejr", hu: "Időjárás" },
  days:    { en: "Days & Months", he: "ימים וחודשים", ar: "الأيام والأشهر", ru: "Дни и месяцы", es: "Días y meses", pt: "Dias e meses", fr: "Jours et mois", de: "Tage und Monate", cs: "Dny a měsíce", sk: "Dni a mesiace", it: "Giorni e mesi", ja: "ようびとつき", hi: "दिन और महीने", am: "ቀኖችና ወራት", uk: "Дні та місяці", tr: "Günler ve aylar", pl: "Dni i miesiące", fa: "روزها و ماه‌ها", id: "Hari dan bulan", nl: "Dagen en maanden", el: "Μέρες και μήνες", zu: "Izinsuku nezinyanga", vi: "Ngày và tháng", fil: "Mga Araw at Buwan", af: "Dae en maande", sw: "Siku na miezi", "zh-CN": "星期和月份", "zh-TW": "星期和月份", ko: "요일과 달", th: "วันและเดือน", bn: "দিন ও মাস", da: "Dage og måneder", hu: "Napok és hónapok" },
  verbs:   { en: "Action verbs", he: "פעלים", ar: "أفعال الحركة", ru: "Глаголы действия", es: "Verbos de acción", pt: "Verbos de ação", fr: "Verbes d'action", de: "Tätigkeitsverben", cs: "Slovesa činnosti", sk: "Slovesá činnosti", it: "Verbi di azione", ja: "うごきのことば", hi: "क्रिया शब्द", am: "የድርጊት ግሶች", uk: "Дієслова дії", tr: "Hareket fiilleri", pl: "Czasowniki czynności", fa: "فعل‌های حرکتی", id: "Kata kerja aksi", nl: "Doe-werkwoorden", el: "Ρήματα δράσης", zu: "Izenzo", vi: "Động từ hành động", fil: "Pandiwa ng Kilos", af: "Doenwerkwoorde", sw: "Vitenzi vya vitendo", "zh-CN": "动作词", "zh-TW": "動作詞", ko: "동작 낱말", th: "คำกริยา", bn: "কাজের ক্রিয়া", da: "Handleudsagnsord", hu: "Cselekvő igék" },
};

export function getCatTitle(id: string, lang: string): string {
  const m = CATEGORY_TITLES[id];
  if (!m) return id;
  return m[lang] ?? CATEGORY_TITLES_EXTRA[lang]?.[id] ?? m.en ?? id;
}
