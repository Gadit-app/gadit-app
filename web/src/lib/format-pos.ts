import type { Lang } from "./i18n";

/**
 * Translate the English `pos` value the model returns (noun / verb /
 * adjective / etc.) into the user's UI language, for display in the
 * grammar badge next to each meaning when Grammar Mode is on.
 *
 * Falls back to the raw value if we don't recognise the key, so a model
 * answer like "ger." or a phrase still renders something rather than
 * disappearing. Keeps abbreviations short — these sit inline as a
 * compact pill above the definition.
 */

type PosKey =
  | "noun" | "verb" | "adjective" | "adverb"
  | "preposition" | "conjunction" | "pronoun"
  | "interjection" | "determiner" | "article"
  | "auxiliary" | "particle" | "numeral"
  | "proper noun" | "phrase" | "idiom";

const TABLE: Record<Lang, Partial<Record<PosKey, string>>> = {
  uk: {
    "noun": "іменник", "verb": "дієслово", "adjective": "прикметник", "adverb": "прислівник",
    "preposition": "прийменник", "conjunction": "сполучник", "pronoun": "займенник",
    "interjection": "вигук", "determiner": "детермінатив", "article": "артикль",
    "auxiliary": "допоміжне дієслово", "particle": "частка", "numeral": "числівник",
    "proper noun": "власна назва", "phrase": "словосполучення", "idiom": "ідіома",
  },
  tr: {
    "noun": "isim", "verb": "fiil", "adjective": "sıfat", "adverb": "zarf",
    "preposition": "edat", "conjunction": "bağlaç", "pronoun": "zamir",
    "interjection": "ünlem", "determiner": "belirteç", "article": "tanımlık",
    "auxiliary": "yardımcı fiil", "particle": "ilgeç", "numeral": "sayı sözcüğü",
    "proper noun": "özel isim", "phrase": "öbek", "idiom": "deyim",
  },
  pl: {
    "noun": "rzeczownik", "verb": "czasownik", "adjective": "przymiotnik", "adverb": "przysłówek",
    "preposition": "przyimek", "conjunction": "spójnik", "pronoun": "zaimek",
    "interjection": "wykrzyknik", "determiner": "określnik", "article": "rodzajnik",
    "auxiliary": "czasownik posiłkowy", "particle": "partykuła", "numeral": "liczebnik",
    "proper noun": "nazwa własna", "phrase": "wyrażenie", "idiom": "idiom",
  },
  fa: {
    "noun": "اسم", "verb": "فعل", "adjective": "صفت", "adverb": "قید",
    "preposition": "حرف اضافه", "conjunction": "حرف ربط", "pronoun": "ضمیر",
    "interjection": "حرف ندا", "determiner": "معرف", "article": "حرف تعریف",
    "auxiliary": "فعل کمکی", "particle": "ادات", "numeral": "عدد",
    "proper noun": "اسم خاص", "phrase": "عبارت", "idiom": "اصطلاح",
  },
  id: {
    "noun": "kata benda", "verb": "kata kerja", "adjective": "kata sifat", "adverb": "kata keterangan",
    "preposition": "kata depan", "conjunction": "kata sambung", "pronoun": "kata ganti",
    "interjection": "kata seru", "determiner": "kata sandang penunjuk", "article": "kata sandang",
    "auxiliary": "kata bantu", "particle": "partikel", "numeral": "kata bilangan",
    "proper noun": "kata benda khusus", "phrase": "frasa", "idiom": "idiom",
  },
  nl: {
    "noun": "zelfstandig naamwoord", "verb": "werkwoord", "adjective": "bijvoeglijk naamwoord", "adverb": "bijwoord",
    "preposition": "voorzetsel", "conjunction": "voegwoord", "pronoun": "voornaamwoord",
    "interjection": "tussenwerpsel", "determiner": "bepaler", "article": "lidwoord",
    "auxiliary": "hulpwerkwoord", "particle": "partikel", "numeral": "telwoord",
    "proper noun": "eigennaam", "phrase": "uitdrukking", "idiom": "zegswijze",
  },
  el: {
    "noun": "ουσιαστικό", "verb": "ρήμα", "adjective": "επίθετο", "adverb": "επίρρημα",
    "preposition": "πρόθεση", "conjunction": "σύνδεσμος", "pronoun": "αντωνυμία",
    "interjection": "επιφώνημα", "determiner": "προσδιοριστής", "article": "άρθρο",
    "auxiliary": "βοηθητικό ρήμα", "particle": "μόριο", "numeral": "αριθμητικό",
    "proper noun": "κύριο όνομα", "phrase": "φράση", "idiom": "ιδιωματισμός",
  },
  zu: {
    "noun": "ibizo", "verb": "isenzo", "adjective": "isiphawulo", "adverb": "isandiso",
    "preposition": "isihlanganisi", "conjunction": "isihlanganiso", "pronoun": "isabizwana",
    "interjection": "isibabazo", "determiner": "isibaluli", "article": "isikhombisi",
    "auxiliary": "isenzo elisizayo", "particle": "isakhi", "numeral": "isibalo",
    "proper noun": "ibizoqho", "phrase": "umshwana", "idiom": "isisho",
  },
  en: {
    "noun": "noun", "verb": "verb", "adjective": "adjective", "adverb": "adverb",
    "preposition": "preposition", "conjunction": "conjunction", "pronoun": "pronoun",
    "interjection": "interjection", "determiner": "determiner", "article": "article",
    "auxiliary": "auxiliary", "particle": "particle", "numeral": "numeral",
    "proper noun": "proper noun", "phrase": "phrase", "idiom": "idiom",
  },
  he: {
    "noun": "שם עצם", "verb": "פועל", "adjective": "תואר", "adverb": "תואר הפועל",
    "preposition": "מילת יחס", "conjunction": "מילת חיבור", "pronoun": "כינוי",
    "interjection": "מילת קריאה", "determiner": "מילת ייחוד", "article": "ה' הידיעה",
    "auxiliary": "פועל עזר", "particle": "מילית", "numeral": "שם מספר",
    "proper noun": "שם פרטי", "phrase": "ביטוי", "idiom": "ניב",
  },
  ar: {
    "noun": "اسم", "verb": "فعل", "adjective": "صفة", "adverb": "ظرف",
    "preposition": "حرف جر", "conjunction": "حرف عطف", "pronoun": "ضمير",
    "interjection": "تعجب", "determiner": "محدد", "article": "أداة تعريف",
    "auxiliary": "فعل مساعد", "particle": "أداة", "numeral": "عدد",
    "proper noun": "اسم علم", "phrase": "عبارة", "idiom": "مصطلح",
  },
  ru: {
    "noun": "сущ.", "verb": "глагол", "adjective": "прил.", "adverb": "нареч.",
    "preposition": "предлог", "conjunction": "союз", "pronoun": "местоим.",
    "interjection": "междом.", "determiner": "детерм.", "article": "артикль",
    "auxiliary": "вспом. глаг.", "particle": "частица", "numeral": "числит.",
    "proper noun": "имя собств.", "phrase": "фраза", "idiom": "идиома",
  },
  es: {
    "noun": "sustantivo", "verb": "verbo", "adjective": "adjetivo", "adverb": "adverbio",
    "preposition": "preposición", "conjunction": "conjunción", "pronoun": "pronombre",
    "interjection": "interjección", "determiner": "determinante", "article": "artículo",
    "auxiliary": "auxiliar", "particle": "partícula", "numeral": "numeral",
    "proper noun": "nombre propio", "phrase": "frase", "idiom": "modismo",
  },
  pt: {
    "noun": "substantivo", "verb": "verbo", "adjective": "adjetivo", "adverb": "advérbio",
    "preposition": "preposição", "conjunction": "conjunção", "pronoun": "pronome",
    "interjection": "interjeição", "determiner": "determinante", "article": "artigo",
    "auxiliary": "auxiliar", "particle": "partícula", "numeral": "numeral",
    "proper noun": "nome próprio", "phrase": "frase", "idiom": "expressão",
  },
  fr: {
    "noun": "nom", "verb": "verbe", "adjective": "adjectif", "adverb": "adverbe",
    "preposition": "préposition", "conjunction": "conjonction", "pronoun": "pronom",
    "interjection": "interjection", "determiner": "déterminant", "article": "article",
    "auxiliary": "auxiliaire", "particle": "particule", "numeral": "numéral",
    "proper noun": "nom propre", "phrase": "locution", "idiom": "idiome",
  },
  de: {
    "noun": "Substantiv", "verb": "Verb", "adjective": "Adjektiv", "adverb": "Adverb",
    "preposition": "Präposition", "conjunction": "Konjunktion", "pronoun": "Pronomen",
    "interjection": "Interjektion", "determiner": "Determinator", "article": "Artikel",
    "auxiliary": "Hilfsverb", "particle": "Partikel", "numeral": "Numerale",
    "proper noun": "Eigenname", "phrase": "Phrase", "idiom": "Redewendung",
  },
  cs: {
    "noun": "podst. jm.", "verb": "sloveso", "adjective": "příd. jm.", "adverb": "příslovce",
    "preposition": "předložka", "conjunction": "spojka", "pronoun": "zájmeno",
    "interjection": "citoslovce", "determiner": "determinátor", "article": "člen",
    "auxiliary": "pom. sloveso", "particle": "částice", "numeral": "číslovka",
    "proper noun": "vlastní jm.", "phrase": "fráze", "idiom": "idiom",
  },
  sk: {
    "noun": "podst. m.", "verb": "sloveso", "adjective": "príd. m.", "adverb": "príslovka",
    "preposition": "predložka", "conjunction": "spojka", "pronoun": "zámeno",
    "interjection": "citoslovce", "determiner": "determinátor", "article": "člen",
    "auxiliary": "pom. sloveso", "particle": "častica", "numeral": "číslovka",
    "proper noun": "vlastné m.", "phrase": "fráza", "idiom": "idióm",
  },
  it: {
    "noun": "sostantivo", "verb": "verbo", "adjective": "aggettivo", "adverb": "avverbio",
    "preposition": "preposizione", "conjunction": "congiunzione", "pronoun": "pronome",
    "interjection": "interiezione", "determiner": "determinante", "article": "articolo",
    "auxiliary": "ausiliare", "particle": "particella", "numeral": "numerale",
    "proper noun": "nome proprio", "phrase": "frase", "idiom": "modo di dire",
  },
  ja: {
    "noun": "名詞", "verb": "動詞", "adjective": "形容詞", "adverb": "副詞",
    "preposition": "前置詞", "conjunction": "接続詞", "pronoun": "代名詞",
    "interjection": "感動詞", "determiner": "限定詞", "article": "冠詞",
    "auxiliary": "助動詞", "particle": "助詞", "numeral": "数詞",
    "proper noun": "固有名詞", "phrase": "句", "idiom": "慣用句",
  },
  hi: {
    "noun": "संज्ञा", "verb": "क्रिया", "adjective": "विशेषण", "adverb": "क्रिया-विशेषण",
    "preposition": "पूर्वसर्ग", "conjunction": "संयोजक", "pronoun": "सर्वनाम",
    "interjection": "विस्मयादिबोधक", "determiner": "निर्धारक", "article": "उपपद",
    "auxiliary": "सहायक क्रिया", "particle": "अव्यय", "numeral": "अंक",
    "proper noun": "व्यक्तिवाचक संज्ञा", "phrase": "पदबंध", "idiom": "मुहावरा",
  },
  am: {
    "noun": "ስም", "verb": "ግሥ", "adjective": "ቅጽል", "adverb": "ተውሳከ ግሥ",
    "preposition": "መስተዋድድ", "conjunction": "መስተጻምር", "pronoun": "ተውላጠ ስም",
    "interjection": "ቃለ አጋኖ", "determiner": "አመልካች", "article": "መስተኣምር",
    "auxiliary": "ረዳት ግሥ", "particle": "ንኡስ ቃል", "numeral": "ቁጥር",
    "proper noun": "የተጸውዖ ስም", "phrase": "ሐረግ", "idiom": "ፈሊጥ",
  },
  vi: {
    "noun": "danh từ", "verb": "động từ", "adjective": "tính từ", "adverb": "trạng từ",
    "preposition": "giới từ", "conjunction": "liên từ", "pronoun": "đại từ",
    "interjection": "thán từ", "determiner": "từ hạn định", "article": "mạo từ",
    "auxiliary": "trợ động từ", "particle": "tiểu từ", "numeral": "số từ",
    "proper noun": "danh từ riêng", "phrase": "cụm từ", "idiom": "thành ngữ",
  },
  fil: {
    "noun": "pangngalan", "verb": "pandiwa", "adjective": "pang-uri", "adverb": "pang-abay",
    "preposition": "pang-ukol", "conjunction": "pangatnig", "pronoun": "panghalip",
    "interjection": "pandamdam", "determiner": "pantukoy", "article": "pantukoy",
    "auxiliary": "pantulong na pandiwa", "particle": "kataga", "numeral": "pambilang",
    "proper noun": "pangngalang pantangi", "phrase": "parirala", "idiom": "idyoma",
  },
  af: {
    "noun": "selfstandige naamwoord", "verb": "werkwoord", "adjective": "byvoeglike naamwoord", "adverb": "bywoord",
    "preposition": "voorsetsel", "conjunction": "voegwoord", "pronoun": "voornaamwoord",
    "interjection": "tussenwerpsel", "determiner": "bepaler", "article": "lidwoord",
    "auxiliary": "hulpwerkwoord", "particle": "partikel", "numeral": "telwoord",
    "proper noun": "eienaam", "phrase": "frase", "idiom": "idioom",
  },
  sw: {
    "noun": "nomino", "verb": "kitenzi", "adjective": "kivumishi", "adverb": "kielezi",
    "preposition": "kihusishi", "conjunction": "kiunganishi", "pronoun": "kiwakilishi",
    "interjection": "kihisishi", "determiner": "kibainishi", "article": "kioanishi",
    "auxiliary": "kitenzi kisaidizi", "particle": "chembe", "numeral": "kihesabu",
    "proper noun": "nomino ya pekee", "phrase": "kifungu", "idiom": "nahau",
  },
  "zh-CN": {
    "noun": "名词", "verb": "动词", "adjective": "形容词", "adverb": "副词",
    "preposition": "介词", "conjunction": "连词", "pronoun": "代词",
    "interjection": "叹词", "determiner": "限定词", "article": "冠词",
    "auxiliary": "助动词", "particle": "助词", "numeral": "数词",
    "proper noun": "专有名词", "phrase": "短语", "idiom": "习语",
  },
  "zh-TW": {
    "noun": "名詞", "verb": "動詞", "adjective": "形容詞", "adverb": "副詞",
    "preposition": "介詞", "conjunction": "連接詞", "pronoun": "代名詞",
    "interjection": "感嘆詞", "determiner": "限定詞", "article": "冠詞",
    "auxiliary": "助動詞", "particle": "助詞", "numeral": "數詞",
    "proper noun": "專有名詞", "phrase": "片語", "idiom": "慣用語",
  },
  ko: {
    "noun": "명사", "verb": "동사", "adjective": "형용사", "adverb": "부사",
    "preposition": "전치사", "conjunction": "접속사", "pronoun": "대명사",
    "interjection": "감탄사", "determiner": "한정사", "article": "관사",
    "auxiliary": "조동사", "particle": "조사", "numeral": "수사",
    "proper noun": "고유명사", "phrase": "구", "idiom": "관용구",
  },
  th: {
    "noun": "คำนาม", "verb": "คำกริยา", "adjective": "คำคุณศัพท์", "adverb": "คำวิเศษณ์",
    "preposition": "คำบุพบท", "conjunction": "คำสันธาน", "pronoun": "คำสรรพนาม",
    "interjection": "คำอุทาน", "determiner": "คำกำหนด", "article": "คำนำหน้านาม",
    "auxiliary": "คำกริยาช่วย", "particle": "คำอนุภาค", "numeral": "คำบอกจำนวน",
    "proper noun": "คำวิสามานยนาม", "phrase": "วลี", "idiom": "สำนวน",
  },
  bn: {
    "noun": "বিশেষ্য", "verb": "ক্রিয়া", "adjective": "বিশেষণ", "adverb": "ক্রিয়া-বিশেষণ",
    "preposition": "পদান্বয়ী অব্যয়", "conjunction": "সংযোজক অব্যয়", "pronoun": "সর্বনাম",
    "interjection": "আবেগসূচক অব্যয়", "determiner": "নির্ধারক", "article": "নির্দেশক",
    "auxiliary": "সহায়ক ক্রিয়া", "particle": "অনুসর্গ", "numeral": "সংখ্যাবাচক",
    "proper noun": "নামবাচক বিশেষ্য", "phrase": "বাক্যাংশ", "idiom": "বাগধারা",
  },
};

export function formatPos(pos: string | null | undefined, lang: Lang): string {
  if (!pos) return "";
  const key = pos.trim().toLowerCase();
  const table = TABLE[lang] ?? TABLE.en;
  const hit = table[key as PosKey];
  if (hit) return hit;
  // Multi-POS lines like "noun, verb" — translate each segment.
  if (key.includes(",") || key.includes("/")) {
    return key
      .split(/[,/]/)
      .map((s) => formatPos(s.trim(), lang) || s.trim())
      .filter(Boolean)
      .join(", ");
  }
  // Unknown abbreviation or phrasing — show as-is rather than blank.
  return pos.trim();
}
