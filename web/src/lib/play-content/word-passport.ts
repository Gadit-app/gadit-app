/**
 * Word Passport — origin language game content.
 *
 * Each round shows a familiar English word and four candidate origin
 * languages. Pick the language the word actually came from. The reveal
 * is a one-line origin story — these are genuinely surprising
 * (e.g. "ketchup" is Hokkien Chinese).
 *
 * Hits Gadit's etymology + multilingual edges in one game. Particularly
 * delightful for our Hebrew/Arabic markets where many "English" words
 * have hidden roots in those languages.
 */

/** ISO country code for flagcdn.com. Picked the country most associated
 *  with the LANGUAGE origin, not the modern speakers. "Arabic" maps to
 *  Saudi (sa) flag rather than e.g. Egypt because that's how flagcdn
 *  expects the lookup. */
export type OriginCountry =
  | "sa"   // Arabic
  | "in"   // Hindi / Sanskrit
  | "cn"   // Chinese (any dialect)
  | "jp"   // Japanese
  | "de"   // German
  | "fr"   // French
  | "es"   // Spanish
  | "it"   // Italian
  | "nl"   // Dutch
  | "ru"   // Russian
  | "cz"   // Czech
  | "ir"   // Persian
  | "tr"   // Turkish
  | "gr"   // Greek
  | "va"   // Latin (Vatican is the closest flag)
  | "no"   // Norse / Norwegian
  | "is"   // Icelandic
  | "mx"   // Nahuatl (Mexico)
  | "au"   // Aboriginal Australian
  | "ke"   // Swahili
  | "ng"   // West African languages
  | "ca";  // Inuit / Algonquian (Canada)

/** Per-language flag labels. We look up by contentLang first, then
 *  fall back to English. Hebrew/Arabic/Russian players see native
 *  language names; everyone else gets English. */
const LANG_LABEL_EN: Record<OriginCountry, string> = {
  sa: "Arabic",
  in: "Hindi / Sanskrit",
  cn: "Chinese",
  jp: "Japanese",
  de: "German",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
  ru: "Russian",
  cz: "Czech",
  ir: "Persian",
  tr: "Turkish",
  gr: "Greek",
  va: "Latin",
  no: "Old Norse",
  is: "Icelandic",
  mx: "Nahuatl (Aztec)",
  au: "Aboriginal Australian",
  ke: "Swahili",
  ng: "West African",
  ca: "Inuit / Algonquian",
};

const LANG_LABEL_HE: Record<OriginCountry, string> = {
  sa: "ערבית",
  in: "הינדית / סנסקריט",
  cn: "סינית",
  jp: "יפנית",
  de: "גרמנית",
  fr: "צרפתית",
  es: "ספרדית",
  it: "איטלקית",
  nl: "הולנדית",
  ru: "רוסית",
  cz: "צ׳כית",
  ir: "פרסית",
  tr: "טורקית",
  gr: "יוונית",
  va: "לטינית",
  no: "נורדית עתיקה",
  is: "איסלנדית",
  mx: "נחואטל (אצטקית)",
  au: "אבוריג׳ינית",
  ke: "סוואהילי",
  ng: "מערב אפריקאית",
  ca: "אינואיט / אלגונקווין",
};

const LANG_LABEL_AR: Record<OriginCountry, string> = {
  sa: "العربية",
  in: "الهندية / السنسكريتية",
  cn: "الصينية",
  jp: "اليابانية",
  de: "الألمانية",
  fr: "الفرنسية",
  es: "الإسبانية",
  it: "الإيطالية",
  nl: "الهولندية",
  ru: "الروسية",
  cz: "التشيكية",
  ir: "الفارسية",
  tr: "التركية",
  gr: "اليونانية",
  va: "اللاتينية",
  no: "الإسكندنافية القديمة",
  is: "الأيسلندية",
  mx: "الناهواتل (الأزتكية)",
  au: "لغات أبوريجين أستراليا",
  ke: "السواحيلية",
  ng: "لغات غرب أفريقيا",
  ca: "الإنويت / الألغونكوية",
};

const LANG_LABEL_BY_CONTENT_LANG: Record<string, Record<OriginCountry, string>> = {
  en: LANG_LABEL_EN,
  he: LANG_LABEL_HE,
  ar: LANG_LABEL_AR,
};

export function getLangLabel(country: OriginCountry, contentLang: string): string {
  const map = LANG_LABEL_BY_CONTENT_LANG[contentLang] ?? LANG_LABEL_EN;
  return map[country];
}

// Kept for backwards-compat with the original API. Defaults to English.
export const LANG_LABEL = LANG_LABEL_EN;

export type WordPassportRound = {
  /** The English word being shown. */
  word: string;
  /** Four candidate origins. Order randomised per session. */
  options: [OriginCountry, OriginCountry, OriginCountry, OriginCountry];
  /** Index 0-3 of the correct origin. */
  correctIdx: 0 | 1 | 2 | 3;
  /** One-line origin story shown on reveal. ≤160 chars. */
  story: string;
};

const WORD_PASSPORT_ROUNDS_EN: WordPassportRound[] = [
  {
    word: "alcohol",
    options: ["sa", "va", "fr", "gr"],
    correctIdx: 0,
    story: "From Arabic al-kohl. Originally a fine eye-darkening powder used by Cleopatra. The 'distilled spirit' meaning came much later.",
  },
  {
    word: "shampoo",
    options: ["in", "fr", "jp", "ir"],
    correctIdx: 0,
    story: "From Hindi chāmpo (massage). British colonists in India loved their head massages and brought the word, and the practice, home.",
  },
  {
    word: "ketchup",
    options: ["va", "cn", "de", "es"],
    correctIdx: 1,
    story: "From Hokkien Chinese kê-tsiap, originally a fermented fish sauce. Tomatoes joined later, in 1812 Philadelphia.",
  },
  {
    word: "robot",
    options: ["va", "ru", "cz", "de"],
    correctIdx: 2,
    story: "Czech writer Karel Čapek coined it in his 1920 play R.U.R., from robota (forced labour). Most invented words flop. This one took over.",
  },
  {
    word: "sugar",
    options: ["va", "sa", "in", "gr"],
    correctIdx: 1,
    story: "From Arabic sukkar, ultimately Sanskrit sharkara (grit / gravel). The crystals literally looked like coarse sand to early traders.",
  },
  {
    word: "algebra",
    options: ["gr", "sa", "va", "ir"],
    correctIdx: 1,
    story: "From Arabic al-jabr (restoring broken parts). Coined by mathematician al-Khwarizmi in 820 AD. His name also gave us 'algorithm'.",
  },
  {
    word: "tsunami",
    options: ["jp", "cn", "ke", "in"],
    correctIdx: 0,
    story: "Japanese tsu (harbour) + nami (wave). The 'harbour wave' was named because sailors at sea felt nothing — the wave only towered at the shore.",
  },
  {
    word: "karaoke",
    options: ["cn", "jp", "in", "ir"],
    correctIdx: 1,
    story: "Japanese kara (empty) + oke (orchestra). Invented in 1971 in Kobe when a singer needed backing tracks for a gig and a drummer rigged a tape player.",
  },
  {
    word: "boomerang",
    options: ["au", "in", "ng", "ke"],
    correctIdx: 0,
    story: "From the Dharug language of Australian Aborigines (Sydney region). Adopted into English in 1825. The throwing technique is much older.",
  },
  {
    word: "chocolate",
    options: ["es", "mx", "fr", "va"],
    correctIdx: 1,
    story: "From Nahuatl xocolātl, the bitter cacao-water drink the Aztecs gave to Cortés in 1519. Spanish added sugar. The rest is history.",
  },
  {
    word: "safari",
    options: ["ng", "ke", "sa", "in"],
    correctIdx: 1,
    story: "From Swahili safari (journey), itself from Arabic. Originally any trip, not necessarily to watch animals.",
  },
  {
    word: "kindergarten",
    options: ["nl", "de", "no", "cz"],
    correctIdx: 1,
    story: "German kinder (children) + garten (garden). Friedrich Fröbel opened the first one in 1837 to teach via play, not drill. The name stuck globally.",
  },
  {
    word: "iceberg",
    options: ["no", "is", "nl", "de"],
    correctIdx: 2,
    story: "From Dutch ijsberg (ice mountain). Borrowed in the 1700s, well before the Titanic made the word famous.",
  },
  {
    word: "tycoon",
    options: ["cn", "jp", "ir", "in"],
    correctIdx: 1,
    story: "From Japanese taikun (great prince). Brought back by Commodore Perry's 1853 mission. Lincoln's secretaries jokingly called him 'the Tycoon'.",
  },
  {
    word: "pajamas",
    options: ["fr", "in", "ir", "sa"],
    correctIdx: 2,
    story: "Persian pae (leg) + jameh (garment). British colonists in India saw loose night trousers and shipped both the garment and the word home.",
  },
  {
    word: "checkmate",
    options: ["fr", "ir", "in", "sa"],
    correctIdx: 1,
    story: "Persian shah mat — 'the king is dead'. Chess and the phrase travelled together through Arabic, then into medieval Europe.",
  },
  {
    word: "hurricane",
    options: ["fr", "es", "mx", "ca"],
    correctIdx: 2,
    story: "From Taíno (Caribbean) Huracán, the god of storms. The Spanish heard the name during the 1494 voyages and carried it into European languages.",
  },
  {
    word: "loot",
    options: ["sa", "in", "de", "no"],
    correctIdx: 1,
    story: "From Hindi lūṭ (plunder). British soldiers brought it back from India in the 18th century. Now baked into every video game vocabulary.",
  },
  {
    word: "schadenfreude",
    options: ["de", "nl", "no", "cz"],
    correctIdx: 0,
    story: "German schaden (harm) + freude (joy). The pleasure you feel at someone else's misfortune. English borrowed it whole because no native word fit so well.",
  },
  {
    word: "guru",
    options: ["jp", "in", "ir", "ke"],
    correctIdx: 1,
    story: "Sanskrit guru — 'heavy, weighty'. A teacher whose words carried weight. Adopted into English in the 1600s, exploded in usage in the 1960s.",
  },
  {
    word: "kayak",
    options: ["no", "ca", "ru", "au"],
    correctIdx: 1,
    story: "From Inuit qajaq. Engineered over thousands of years for hunting in icy seas — light, narrow, sealed against waves. Borrowed into English from Greenlandic.",
  },
  {
    word: "cookie",
    options: ["de", "nl", "fr", "no"],
    correctIdx: 1,
    story: "From Dutch koekje (little cake). Dutch settlers brought the word — and the snack — to New Amsterdam, the colony that became New York.",
  },
  {
    word: "magazine",
    options: ["fr", "sa", "va", "ir"],
    correctIdx: 1,
    story: "From Arabic makhzan (storehouse). Was a warehouse, then a military ammo store, then a 'storehouse of information' — the periodical sense.",
  },
  {
    word: "yacht",
    options: ["nl", "de", "no", "is"],
    correctIdx: 0,
    story: "From Dutch jacht (hunt) — a 'jachtschip' was a fast hunting ship the Dutch used to chase pirates. Charles II got one and the elite copied him.",
  },
  {
    word: "bungalow",
    options: ["sa", "in", "ir", "tr"],
    correctIdx: 1,
    story: "From Hindi bangla (of Bengal). British colonial architects copied the low, wide Bengali farmhouse and the name travelled wherever they did.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew is full of loanwords — Greek (the Hellenistic period),
// Aramaic (Talmud), Arabic (Andalusia, the medieval rabbis), German
// (Yiddish via Eastern Europe), and modern Anglo-American. Each
// round reveals the surprising origin of a word people use daily.
const WORD_PASSPORT_ROUNDS_HE: WordPassportRound[] = [
  {
    word: "סנדל",
    options: ["gr", "sa", "va", "ir"],
    correctIdx: 0,
    story: "מיוונית sandalion (סנדל קל). נכנסה לעברית דרך הלשון המקראית והתלמודית, מתקופת הכיבוש היווני של ארץ ישראל.",
  },
  {
    word: "אכסניה",
    options: ["va", "gr", "fr", "de"],
    correctIdx: 1,
    story: "מיוונית xenia (הכנסת אורחים). המילה התלמודית 'אכסניה' שמרה את המשמעות של מקום אירוח אורחים שבאו ממרחק.",
  },
  {
    word: "פרוזדור",
    options: ["va", "gr", "ir", "sa"],
    correctIdx: 0,
    story: "מלטינית prosdorium (קדם-מבוא). הגיעה לעברית מהיוונית בתקופה התלמודית, נושאת איתה תרבות הכניסה הרומית.",
  },
  {
    word: "כיסא",
    options: ["sa", "va", "gr", "ir"],
    correctIdx: 0,
    story: "מאכדית kussu, דרך הארמית כורסיא. נדדה אל הערבית (כורסי) ובחזרה אל העברית. שתי שפות אחיות, מילה אחת.",
  },
  {
    word: "תפוז",
    options: ["sa", "ir", "in", "it"],
    correctIdx: 2,
    story: "מהינדי / סנסקריט naranga, דרך הפרסית והערבית (نارنج). 'תפוז' = תפוח־זהב, חידוש עברי שעוטף שורש הודי עתיק.",
  },
  {
    word: "תאטרון",
    options: ["gr", "va", "fr", "it"],
    correctIdx: 0,
    story: "מיוונית theatron (מקום ראייה). נכנסה לעברית התלמודית בתקופת בית שני, חזרה דרך הצרפתית לעברית המודרנית.",
  },
  {
    word: "פיג'מה",
    options: ["fr", "ir", "in", "tr"],
    correctIdx: 1,
    story: "מפרסית pae jameh (בגד-רגל). דרך הינדית והאנגלית הקולוניאלית הגיעה לעברית של ראשית המאה ה-20.",
  },
  {
    word: "מטריה",
    options: ["va", "gr", "fr", "it"],
    correctIdx: 1,
    story: "מיוונית matron (אם), במשמעות 'אם כל הצללים'. נדדה למילה הצרפתית-עברית. הצל הוא ה'אמא' של ההגנה מגשם.",
  },
  {
    word: "אטליז",
    options: ["va", "gr", "de", "it"],
    correctIdx: 2,
    story: "מאיטלקית atlante (אטלנט הנושא משא) דרך לאדינו. ביוון העתיקה איש האטלנט שחט בעלי חיים בכניסה למקדש.",
  },
  {
    word: "אדיוט",
    options: ["va", "gr", "ru", "de"],
    correctIdx: 1,
    story: "מיוונית idiotes (אדם פרטי, שאינו פוליטיקאי). הפך לעלבון רק בעת החדשה. המקור היה ניטרלי לגמרי.",
  },
  {
    word: "טלפון",
    options: ["va", "gr", "fr", "de"],
    correctIdx: 1,
    story: "מיוונית tele (רחוק) + phone (קול). מהמצאת 1876 של אלכסנדר גרהם בל. השם נשאר זהה בכל השפות.",
  },
  {
    word: "אנציקלופדיה",
    options: ["va", "gr", "fr", "it"],
    correctIdx: 1,
    story: "מיוונית enkyklios paideia (חינוך מקיף). אבל גם הצרפתית קיבעה את המילה במאה ה-18. דרך כפולה לעברית.",
  },
  {
    word: "כורסה",
    options: ["sa", "ir", "tr", "ru"],
    correctIdx: 2,
    story: "מהטורקית koltuk (משענת זרוע), דרך השפות הסלאביות וביידיש. הגיעה לעברית עם עליות מזרח אירופה.",
  },
  {
    word: "ז'קט",
    options: ["fr", "it", "de", "ru"],
    correctIdx: 0,
    story: "מצרפתית jaquette, מתקופת לואי ה-15. דרך הכובע 'ז'אק' שלבשו האיכרים בשם זה. אצולת הלבוש הצרפתית באה לעברית.",
  },
  {
    word: "אבטיח",
    options: ["sa", "va", "gr", "ir"],
    correctIdx: 0,
    story: "מערבית בִּטֵּ'יחַ (פרי הקיץ). הגיעה לעברית התלמודית דרך הסחר הערבי. אל״ף בתחילה היא חידוש עברי.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic absorbed words from Persian (the great cultural neighbour),
// Turkish (the Ottoman administrative legacy), Greek and Latin (science
// and philosophy), and modern European languages. Each round reveals
// a daily word's hidden journey.
const WORD_PASSPORT_ROUNDS_AR: WordPassportRound[] = [
  {
    word: "بَنَفسج",
    options: ["ir", "gr", "sa", "in"],
    correctIdx: 0,
    story: "من الفارسية بَنَفشَه. دخلت العربية في العصر العبّاسي عبر التبادل الثقافي مع بلاد فارس. اسم الزهرة لم يتغيّر.",
  },
  {
    word: "بُرْتُقال",
    options: ["ir", "it", "es", "gr"],
    correctIdx: 1,
    story: "من Portogallo الإيطالية، اسم البلد البرتغال. كان البرتغاليون أول من جلب البرتقال الحلو من الصين عبر طريق التجارة.",
  },
  {
    word: "كَنَبة",
    options: ["fr", "tr", "ir", "gr"],
    correctIdx: 1,
    story: "من التركية kanepe، التي أخذتها من الفرنسية canapé. دخلت العربية مع العصر العثماني وأثاث المنازل الأوروبي.",
  },
  {
    word: "خِيار",
    options: ["sa", "ir", "tr", "gr"],
    correctIdx: 1,
    story: "من الفارسية خِيار (الاسم نفسه). يدلّ في الفارسية على الخضار المعروف. عبر طريق التجارة الفارسي.",
  },
  {
    word: "شَطرَنج",
    options: ["in", "ir", "cn", "gr"],
    correctIdx: 1,
    story: "من الفارسية چترنگ، وأصلها السنسكريتية تشاتورانغا (الأربعة الأركان). لعبة هندية الأصل وصلت العرب عبر الفُرس.",
  },
  {
    word: "تِلِفون",
    options: ["va", "gr", "fr", "de"],
    correctIdx: 1,
    story: "من اليونانية tele (بعيد) + phone (صوت). اخترعه ألكسندر غراهام بيل عام 1876، واسمه ظلّ كما هو في كلّ اللغات.",
  },
  {
    word: "فَلسَفة",
    options: ["va", "gr", "ir", "in"],
    correctIdx: 1,
    story: "من اليونانية philosophía (حُبّ الحِكمة). دخلت العربية في العصر العبّاسي مع ترجمات بيت الحكمة في بغداد.",
  },
  {
    word: "ديوان",
    options: ["sa", "ir", "tr", "in"],
    correctIdx: 1,
    story: "من الفارسية دیوان. كانت تعني السجلّ الإداري لدى الفرس. أخذها العرب لتعني مجموعة الشعر أو مجلس الحكم.",
  },
  {
    word: "بَنطَلون",
    options: ["fr", "it", "de", "tr"],
    correctIdx: 0,
    story: "من الفرنسية pantalon. دخلت العربية في القرن التاسع عشر مع الموضة الأوروبية. الاسم الأصلي شخصية كوميديا إيطالية.",
  },
  {
    word: "قَهوة",
    options: ["sa", "ir", "ke", "in"],
    correctIdx: 0,
    story: "أصلها عربيّ من الجذر ق.هـ.و. (يُذهب الشهية للنوم). البنّ من إثيوبيا (عبر اليمن)، لكن الاسم عربي خالص.",
  },
  {
    word: "نَرجِس",
    options: ["ir", "gr", "sa", "in"],
    correctIdx: 1,
    story: "من اليونانية نَركيسوس (شخصية الميثولوجيا اليونانية). دخلت العربية في العصر العبّاسي مع شعر الورد والطبيعة.",
  },
  {
    word: "كِتاب",
    options: ["sa", "ir", "gr", "va"],
    correctIdx: 0,
    story: "كلمة عربية خالصة من الجذر ك.ت.ب. صدّرتها العربية إلى الفارسية والتركية والأوردية. لا تقع في فخّ الاقتراض.",
  },
];

// ─── Per-language router ───────────────────────────────────────
const ROUNDS_BY_LANG: Record<string, WordPassportRound[]> = {
  en: WORD_PASSPORT_ROUNDS_EN,
  he: WORD_PASSPORT_ROUNDS_HE,
  ar: WORD_PASSPORT_ROUNDS_AR,
};

export function pickWordPassportRounds(
  count: number,
  lang: string = "en",
): { rounds: WordPassportRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
