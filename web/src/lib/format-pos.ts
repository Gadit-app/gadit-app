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
  uk: {}, tr: {}, pl: {}, fa: {}, id: {},
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
