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

const LANG_LABEL_RU: Record<OriginCountry, string> = {
  sa: "арабский",
  in: "хинди / санскрит",
  cn: "китайский",
  jp: "японский",
  de: "немецкий",
  fr: "французский",
  es: "испанский",
  it: "итальянский",
  nl: "нидерландский",
  ru: "русский",
  cz: "чешский",
  ir: "персидский",
  tr: "турецкий",
  gr: "греческий",
  va: "латинский",
  no: "древнескандинавский",
  is: "исландский",
  mx: "науатль (ацтекский)",
  au: "австралийские аборигены",
  ke: "суахили",
  ng: "западноафриканский",
  ca: "инуктитут / алгонкинский",
};

const LANG_LABEL_BY_CONTENT_LANG: Record<string, Record<OriginCountry, string>> = {
  en: LANG_LABEL_EN,
  he: LANG_LABEL_HE,
  ar: LANG_LABEL_AR,
  ru: LANG_LABEL_RU,
};

/** Origin-language names for a language whose content ships as a file. */
export function registerPassportLabels(lang: string, labels: Partial<Record<OriginCountry, string>>): void {
  LANG_LABEL_BY_CONTENT_LANG[lang] = { ...LANG_LABEL_EN, ...labels };
}

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
    story: "From Arabic al-jabr (restoring broken parts). Made famous as a maths term by al-Khwarizmi around 820 AD. His name also gave us 'algorithm'.",
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
    story: "German kinder (children) + garten (garden). Friedrich Fröbel opened the first kindergarten in 1840 to teach via play, not drill. The name stuck globally.",
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
    options: ["fr", "tr", "ir", "sa"],
    correctIdx: 2,
    story: "Persian pae (leg) + jameh (garment). British colonists in India saw loose night trousers and shipped both the garment and the word home.",
  },
  {
    word: "checkmate",
    options: ["fr", "ir", "in", "sa"],
    correctIdx: 1,
    story: "Persian shah mat, 'the king is helpless'. Chess and the phrase travelled together through Arabic, then into medieval Europe.",
  },
  {
    word: "hurricane",
    options: ["fr", "es", "mx", "ca"],
    correctIdx: 1,
    story: "English borrowed it from Spanish huracán. The Spanish took the word from the Taíno people of the Caribbean during the 1490s voyages.",
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
    story: "From Inuit qajaq. Engineered over thousands of years for hunting in icy seas, light, narrow, sealed against waves. Borrowed into English from an Inuit language.",
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
    story: "מיוונית sandalion (סנדל קל). נכנסה לעברית דרך הלשון התלמודית, בתקופת ההשפעה ההלניסטית בארץ ישראל.",
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
    correctIdx: 1,
    story: "מיוונית prothyron (מבוא/פרוזדור). נכנסה לעברית בתקופה התלמודית, לציון חלל הכניסה שלפני הבית.",
  },
  {
    word: "קיוסק",
    options: ["tr", "va", "gr", "ir"],
    correctIdx: 0,
    story: "מטורקית köşk, ביתן קטן בגן, מילה שהגיעה לטורקית מהפרסית. באירופה הפכה לדוכן קטן ברחוב, ומשם הגיעה לעברית.",
  },
  {
    word: "שוקולד",
    options: ["sa", "ir", "mx", "it"],
    correctIdx: 2,
    story: "מנאוואטל, שפת האצטקים במקסיקו: xocolatl, משקה מר מפולי קקאו. הספרדים הביאו אותו לאירופה, והמילה נדדה משם לכל השפות.",
  },
  {
    word: "תאטרון",
    options: ["gr", "va", "ru", "it"],
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
    word: "קפה",
    options: ["va", "sa", "jp", "de"],
    correctIdx: 1,
    story: "מערבית قهوة (qahwa). דרך הטורקית kahve הגיע המשקה לאיטליה ולצרפת, ומשם המילה הגיעה לשפות אירופה ולעברית.",
  },
  {
    word: "אטליז",
    options: ["va", "gr", "de", "it"],
    correctIdx: 2,
    story: "מאיטלקית atlante (אטלנט הנושא משא) דרך לאדינו. ביוון העתיקה איש האטלנט שחט בעלי חיים בכניסה למקדש.",
  },
  {
    word: "אידיוט",
    options: ["va", "gr", "ru", "de"],
    correctIdx: 1,
    story: "מיוונית idiotes (אדם פרטי, שאינו פוליטיקאי). הפך לעלבון רק בעת החדשה. המקור היה ניטרלי לגמרי.",
  },
  {
    word: "טלפון",
    options: ["va", "gr", "fr", "de"],
    correctIdx: 1,
    story: "מיוונית tele (רחוק) + phone (קול). משם בינלאומי שנקבע במאה ה-19 בעקבות המצאת הטלפון.",
  },
  {
    word: "אנציקלופדיה",
    options: ["va", "gr", "ru", "it"],
    correctIdx: 1,
    story: "מיוונית enkyklios paideia (חינוך מקיף). אבל גם הצרפתית קיבעה את המילה במאה ה-18. דרך כפולה לעברית.",
  },
  {
    word: "בננה",
    options: ["sa", "ng", "in", "ru"],
    correctIdx: 1,
    story: "מאחת משפות מערב אפריקה, דרך הפורטוגזית. סוחרים פורטוגזים פגשו את הפרי באפריקה והביאו איתם גם את השם.",
  },
  {
    word: "ז'קט",
    options: ["fr", "it", "de", "ru"],
    correctIdx: 0,
    story: "מצרפתית jaquette, מן jaque, מעיל קצר של איכרים. אצולת הלבוש הצרפתית באה לעברית.",
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
    word: "فاتورة",
    options: ["ir", "it", "es", "gr"],
    correctIdx: 1,
    story: "من الإيطالية fattura، أي الحساب أو الإيصال. دخلت العربية مع تجارة الموانئ في البحر المتوسط.",
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
    story: "من اليونانية tele (بعيد) + phone (صوت). شاع الاسم حديثًا عبر اللغات الأوروبية، ومنها دخلت العربية بصيغة «تلفون».",
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
    story: "أصلها عربيّ؛ كانت «القهوة» اسمًا للخمر قديمًا، ثم صارت اسمًا للمشروب المعروف. البنّ من إثيوبيا عبر اليمن.",
  },
  {
    word: "نَرجِس",
    options: ["ir", "gr", "sa", "in"],
    correctIdx: 0,
    story: "من الفارسية نرگس، وربما ترجع أبعد من ذلك إلى اليونانية. دخلت العربية في العصر العبّاسي مع أسماء الزهور.",
  },
  {
    word: "كِتاب",
    options: ["sa", "ir", "gr", "va"],
    correctIdx: 0,
    story: "كلمة عربية خالصة من الجذر ك.ت.ب. صدّرتها العربية إلى الفارسية والتركية والأوردية. لا تقع في فخّ الاقتراض.",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Russian absorbed words from Greek (the Byzantine connection),
// French (Peter the Great and the aristocracy), German (Saxon
// traders and Catherine II), Turkic (steppe contacts), and modern
// English. Each round uncovers the migrant past of a daily word.
const WORD_PASSPORT_ROUNDS_RU: WordPassportRound[] = [
  {
    word: "галстук",
    options: ["de", "fr", "it", "tr"],
    correctIdx: 0,
    story: "От немецкого Halstuch — «шейный платок». Пришло в Россию в эпоху Петра I вместе с европейским костюмом и стало неотъемлемой частью русской одежды.",
  },
  {
    word: "картофель",
    options: ["de", "es", "fr", "it"],
    correctIdx: 0,
    story: "От немецкого Kartoffel, заимствованного из итальянского tartufolo (трюфель). Подобие формы дало картошке её имя в Германии, а оттуда — в Россию.",
  },
  {
    word: "бутерброд",
    options: ["nl", "de", "fr", "es"],
    correctIdx: 1,
    story: "От немецкого Butterbrot — «хлеб с маслом». Заимствовано в 19 веке. В немецком звучит почти так же, как в русском.",
  },
  {
    word: "сахар",
    options: ["sa", "in", "gr", "ir"],
    correctIdx: 2,
    story: "От греческого σάκχαρον/σάκχαρι, восходящего через восточные языки к санскритскому śarkarā, «гравий, крупинки».",
  },
  {
    word: "кофе",
    options: ["nl", "tr", "fr", "it"],
    correctIdx: 0,
    story: "От нидерландского koffie, восходящего через турецкое kahve к арабскому qahwa. В русский вошло в петровскую эпоху.",
  },
  {
    word: "балкон",
    options: ["it", "fr", "es", "de"],
    correctIdx: 0,
    story: "От итальянского balcone — выступ дома. Слово пришло в русский в 18 веке вместе с европейской архитектурой и итальянскими мастерами.",
  },
  {
    word: "макароны",
    options: ["it", "fr", "gr", "es"],
    correctIdx: 0,
    story: "От итальянского maccheroni. В Россию проникло в 18 веке. Название блюда сохранилось почти неизменным во многих языках мира.",
  },
  {
    word: "багаж",
    options: ["fr", "it", "de", "nl"],
    correctIdx: 0,
    story: "От французского bagage — «то, что несут в мешке». Пришло в эпоху Екатерины II, когда французский был языком русского дворянства.",
  },
  {
    word: "этаж",
    options: ["fr", "it", "de", "nl"],
    correctIdx: 0,
    story: "От французского étage — «уровень здания». Заимствовано в 18 веке вместе с многоэтажной архитектурой европейского образца.",
  },
  {
    word: "ангел",
    options: ["va", "gr", "sa", "ir"],
    correctIdx: 1,
    story: "От греческого ἄγγελος — «вестник». Пришло в русский через церковнославянский язык с принятием христианства в 988 году.",
  },
  {
    word: "лошадь",
    options: ["tr", "ir", "de", "gr"],
    correctIdx: 0,
    story: "От тюркского alasha — лошадь, особенно низкорослая. Заимствовано в эпоху татаро-монгольского ига, когда контакты со степью были постоянными.",
  },
  {
    word: "школа",
    options: ["va", "gr", "fr", "de"],
    correctIdx: 1,
    story: "От греческого scholé — «досуг», «свободное время для учёбы». Античные греки считали, что только свободный человек может учиться.",
  },
  {
    word: "шоколад",
    options: ["es", "mx", "fr", "it"],
    correctIdx: 0,
    story: "От испанского chocolate, заимствованного из ацтекского xocolātl — «горькая вода». В Россию пришло через Европу в 18 веке.",
  },
];

// ─── Per-language router ───────────────────────────────────────
const ROUNDS_BY_LANG: Record<string, WordPassportRound[]> = {
  en: WORD_PASSPORT_ROUNDS_EN,
  he: WORD_PASSPORT_ROUNDS_HE,
  ar: WORD_PASSPORT_ROUNDS_AR,
  ru: WORD_PASSPORT_ROUNDS_RU,
};


/** Content for a language that ships as a file (Gadi 2026-10-11: native
 *  rounds for the 29 languages beyond he/en/ar/ru, loaded on the play page
 *  by lib/play-content/remote.ts). */
export function registerWordPassportRounds(lang: string, rounds: WordPassportRound[], kids?: WordPassportRound[]): void {
  if (rounds.length) ROUNDS_BY_LANG[lang] = rounds;
  void kids;
}

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
