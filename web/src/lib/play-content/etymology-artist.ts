/**
 * Etymology Artist — literal root meaning → modern word game content.
 *
 * Each round shows the LITERAL translation of a word's ancient root —
 * "river horse", "star sailor", "lion's tooth" — and four modern
 * English words. Pick the one whose origin matches the literal phrase.
 *
 * Text-only V1. V2 will replace the literal phrase with an AI-generated
 * image of the literal scene (the original "Etymology Artist" pitch).
 * The literal phrases alone are already surprising — half the players
 * never realized hippopotamus literally means river horse in Greek.
 */

export type EtymologyArtistRound = {
  /** Literal translation of the root. Often surprising or absurd. */
  literal: string;
  /** Origin language(s) for the root. */
  origin: string;
  /** Four modern English candidates. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the correct modern word. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal expanding on the etymology. ≤180 chars. */
  story: string;
};

const ETYMOLOGY_ARTIST_ROUNDS_EN: EtymologyArtistRound[] = [
  {
    literal: "river horse",
    origin: "Greek hippos + potamos",
    options: ["hippopotamus", "rhinoceros", "manatee", "platypus"],
    correctIdx: 0,
    story: "Ancient Greeks saw the chunky riverine grazer and called it the obvious thing: a horse-of-the-river. The Romans borrowed the Greek directly.",
  },
  {
    literal: "star sailor",
    origin: "Greek astron + nautes",
    options: ["pilot", "captain", "astronaut", "navigator"],
    correctIdx: 2,
    story: "Coined in 1929, decades before space travel was practical. The Greeks gave us sailors, the 20th century gave us new oceans.",
  },
  {
    literal: "lion's tooth",
    origin: "French dent de lion",
    options: ["thistle", "dandelion", "marigold", "buttercup"],
    correctIdx: 1,
    story: "Medieval French herbalists noticed the jagged leaf edges and named the flower for them. The English just kept the French pronunciation.",
  },
  {
    literal: "bad star",
    origin: "Italian dis + astro",
    options: ["disaster", "catastrophe", "calamity", "tragedy"],
    correctIdx: 0,
    story: "From Renaissance astrology. A misfortune was caused by an unfavourable star position. The science is out; the word is forever.",
  },
  {
    literal: "flesh-eater",
    origin: "Greek sarx + phagein",
    options: ["sarcophagus", "carnivore", "vulture", "predator"],
    correctIdx: 0,
    story: "Greek stone coffins were thought to literally consume the body inside. The word kept the gruesome metaphor even as the practice changed.",
  },
  {
    literal: "to make alive",
    origin: "Latin vivificare",
    options: ["motivate", "rejuvenate", "vivify", "energize"],
    correctIdx: 2,
    story: "Latin vivus (alive) + facere (make). Most -ify verbs in English are 'make this' (clarify = make clear, justify = make just). Vivify = make alive.",
  },
  {
    literal: "empty orchestra",
    origin: "Japanese kara + ōkesutora",
    options: ["karaoke", "anime", "manga", "kabuki"],
    correctIdx: 0,
    story: "Born in 1971 Kobe, Japan. A drummer rigged a tape player to replace a missing band. 'Orchestra' was already a Japanese loanword from English.",
  },
  {
    literal: "no place",
    origin: "Greek ou + topos",
    options: ["utopia", "dystopia", "exodus", "atlas"],
    correctIdx: 0,
    story: "Thomas More coined utopia in 1516 for his ideal fictional society — literally 'no place'. He was being clever: it's perfect because it cannot exist.",
  },
  {
    literal: "self moving",
    origin: "Greek autos + Latin mobilis",
    options: ["bicycle", "automobile", "locomotive", "scooter"],
    correctIdx: 1,
    story: "Coined 1875, before cars were common. Auto- means self (any motion, any context); mobile means moving. The horse no longer needed.",
  },
  {
    literal: "knowing nothing",
    origin: "Latin nescius",
    options: ["nice", "naive", "ignorant", "innocent"],
    correctIdx: 0,
    story: "Latin nescius (not knowing). It drifted from 'foolish' to 'shy' to 'precise' to 'pleasant' over 500 years. Nice has had a wild career.",
  },
  {
    literal: "fear of strangers",
    origin: "Greek xenos + phobos",
    options: ["agoraphobia", "claustrophobia", "xenophobia", "acrophobia"],
    correctIdx: 2,
    story: "Greek xenos = stranger / foreigner / guest (the same word covered all three). The fear-of-strangers sense came in modern psychology, 1880s.",
  },
  {
    literal: "the worship of bread",
    origin: "Greek artos + latreia",
    options: ["artolatry", "iconolatry", "idolatry", "bibliolatry"],
    correctIdx: 0,
    story: "Real word, used (rarely) in medieval church disputes about Communion. -latry as a suffix attaches to anything: artolatry (bread), bibliolatry (books).",
  },
  {
    literal: "lover of harmony",
    origin: "Greek philos + harmonia",
    options: ["philanthropist", "philharmonic", "philosopher", "telephone"],
    correctIdx: 1,
    story: "Greek philos = loving. Philharmonic = loving harmony / music. Philosopher = loving wisdom. Philanthropist = loving humans. Phil- is everywhere.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew etymology surprises even native speakers. Words from Greek,
// Latin, Persian, Arabic — but also pure Hebrew compounds whose
// literal meaning is hidden under everyday use. Each round reveals
// a small archaeological discovery in the language.
const ETYMOLOGY_ARTIST_ROUNDS_HE: EtymologyArtistRound[] = [
  {
    literal: "סוס נהר",
    origin: "יוונית hippos + potamos",
    options: ["היפופוטם", "תנין", "סוסי ים", "תמסח"],
    correctIdx: 0,
    story: "היוונים העתיקים ראו את הבהמה השמנה במים, וקראו לו 'סוס נהר'. השם נדבק בלי שינוי דרך הלטינית עד לעברית.",
  },
  {
    literal: "איש ים",
    origin: "ערבית/ארמית mallāḥ",
    options: ["שיוט", "מלח (איש ים)", "אונייה", "ספן"],
    correctIdx: 1,
    story: "מַלָּח היא מילה שמית עתיקה ל'ספן' או 'איש ים'; אין קשר ל'מלאך הים'.",
  },
  {
    literal: "על שם אמריגו",
    origin: "לטינית חדשה, על שם אמריגו וספוצ'י",
    options: ["דרום", "אמריקה", "אוסטרליה", "אוצר"],
    correctIdx: 1,
    story: "השם אמריקה נטבע בלטינית החדשה על שם אמריגו וספוצ'י. אין קשר ל'ארץ זהב'.",
  },
  {
    literal: "מקום כביסה",
    origin: "עברית, מן השורש כ־ב־ס",
    options: ["מכבסה", "סבון", "מטליות", "תליות"],
    correctIdx: 0,
    story: "מכבסה נגזרה מן השורש העברי כ־ב־ס: מקום שעוסקים בו בכביסה.",
  },
  {
    literal: "ימאי הכוכבים",
    origin: "יוונית astron + nautes",
    options: ["אסטרונאוט", "אסטרונום", "אאוטו-פיילוט", "טייס"],
    correctIdx: 0,
    story: "אסטרון = כוכב, נאוטס = מלח. 'מלח של כוכבים'. נטבע ב-1929, שנים לפני שיגור אדם לחלל. החזון קדם להמצאה.",
  },
  {
    literal: "מתפתל",
    origin: "עברית מקראית",
    options: ["לווייתן", "כריש", "תמנון", "דולפין"],
    correctIdx: 0,
    story: "לווייתן הוא יצור ימי מקראי ענק. המילה עברית עתיקה, וכנראה קשורה לפיתול או לליפוף.",
  },
  {
    literal: "כיסא של המלך",
    origin: "אכדית kussu",
    options: ["כס המלוכה", "כסא", "מלכודת", "מלצר"],
    correctIdx: 0,
    story: "כיסא = שורש אכדי kussu. 'כס מלכות' = ביטוי קלאסי לכסא ההגמוני. נכנס לעברית מהשפות השמיות.",
  },
  {
    literal: "מי ששונה בעל־פה",
    origin: "ארמית תנא (לחזור)",
    options: ["תנא", "סופר", "פילוסוף", "רב"],
    correctIdx: 0,
    story: "תנא = מי שמכיר על-פה את המסורת ושנה אותה לתלמידיו. השורש הארמי שׁנ״י = לחזור, ללמד שוב ושוב.",
  },
  {
    literal: "שיטפון",
    origin: "אכדית abubu",
    options: ["מבול", "סופה", "גשם", "ים"],
    correctIdx: 0,
    story: "מבול נכנס מהמיתוס המסופוטמי. abubu האכדי = מבול אסון. נכנס לעברית כשם פרטי לאירוע ההיסטורי-מיתי של נח.",
  },
  {
    literal: "אוהב מילים",
    origin: "יוונית philos + logos",
    options: ["פילוסוף", "פילולוג", "פילנתרופ", "פילגש"],
    correctIdx: 1,
    story: "מן היוונית philos (אוהב) + logos (מילה, דיבור). פילולוג הוא חוקר לשון וטקסטים.",
  },
  {
    literal: "סופג",
    origin: "ארמית ספג",
    options: ["ספוג", "סמרטוט", "סדק", "טפיל"],
    correctIdx: 0,
    story: "ספג בארמית ובעברית = קלט נוזלים. 'ספוג' הוא דבר שסופג, ורק אחר כך שימש גם לשם בעל החיים הימי.",
  },
  {
    literal: "אוכל הכל",
    origin: "לטינית omni + vorare",
    options: ["טבעוני", "צמחוני", "אוכל-כל", "צרכן"],
    correctIdx: 2,
    story: "omni = הכול, vorare = לבלוע. מכאן omnivore, ובעברית 'אוכל־כל'.",
  },
  {
    literal: "הים של שלמה",
    origin: "עברית, על שם ספרו של רבי שלמה לוריא",
    options: ["ים-בני", "ים-תלמיד", "ים-של-שלמה", "תלמיד-חכם"],
    correctIdx: 2,
    story: "'ים של שלמה' הוא ספר הלכה של רבי שלמה לוריא. השם רומז לשפע ולעומק, וגם ל'ים של שלמה' שבמקדש.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic etymology offers surprises in two directions: foreign loans
// whose literal meaning is hidden (شطرنج = four corners in Sanskrit),
// and native Arabic compounds whose root meaning is forgotten under
// daily use (مفتاح = the thing that opens).
const ETYMOLOGY_ARTIST_ROUNDS_AR: EtymologyArtistRound[] = [
  {
    literal: "الأركان الأربعة",
    origin: "السنسكريتية تشاتورانغا",
    options: ["شطرنج", "نَرد", "بَطاقة", "ميدالية"],
    correctIdx: 0,
    story: "تشاتورانغا = الأركان الأربعة (الفيلة، الخيل، العَربات، المُشاة). دخلت العربية عبر الفارسية وصارت شطرنج.",
  },
  {
    literal: "ما يَفتح",
    origin: "العربية فَتَح",
    options: ["باب", "مفتاح", "نافذة", "قُفل"],
    correctIdx: 1,
    story: "من الجذر ف.ت.ح على وزن مِفعال للأداة. مفتاح حرفيًّا = الشيء الذي به نَفتح. اللغة العربية تَكشف هندستها.",
  },
  {
    literal: "حُبّ الحِكمة",
    origin: "اليونانية philos + sophia",
    options: ["فَلسَفة", "حِكمة", "عِلم", "بَلاغة"],
    correctIdx: 0,
    story: "philos = حبّ، sophia = حكمة. الفيلسوف حرفيًّا = محبّ الحكمة. دخلت العربية عبر ترجمات بيت الحكمة العبّاسي.",
  },
  {
    literal: "موضع النُّزول",
    origin: "العربية مَنزَل",
    options: ["دار", "منزل", "قَصر", "غُرفة"],
    correctIdx: 1,
    story: "منزل من ن.ز.ل = موضع النزول. حرفيًّا = المكان الذي يَنزل فيه الناس بعد سفرٍ أو يومٍ طويل. مفهوم البَدَوي.",
  },
  {
    literal: "آلة التبريد بالثلج",
    origin: "العربية ثَلج",
    options: ["مكيّف", "مِروَحة", "ثلّاجة", "بَرّاد"],
    correctIdx: 2,
    story: "ثَلّاجة من الفعل أَثلَجَ (جَعل باردًا كالثلج). الاسم مُعَدّ في القرن العشرين بالعربية الفصحى الحديثة.",
  },
  {
    literal: "البَحر العَميق",
    origin: "العربية قَاموس",
    options: ["قاموس", "مَوسوعة", "خَريطة", "أطلس"],
    correctIdx: 0,
    story: "قاموس كلمة عربية قديمة تعني البحر العميق أو المحيط. ثم اشتهر بها معجم الفيروزآبادي «القاموس المحيط»، فصار الاسم يُطلق على المعجم.",
  },
  {
    literal: "حامِل السَّماء",
    origin: "اليونانية Άτλας",
    options: ["جُغرافيا", "خَريطة", "أطلس", "مِنطاد"],
    correctIdx: 2,
    story: "أطلس اسمُ العملاق الإغريقي الذي كان يحمل قُبّة السماء. وفي القرن السادس عشر اختاره جيرارد ميركاتور عنوانًا لكتاب خرائطه.",
  },
  {
    literal: "نَجم البَحر",
    origin: "العربية نَجم + بَحر",
    options: ["نَجمة البَحر", "قِنديل البحر", "حورية", "صَدف"],
    correctIdx: 0,
    story: "تركيب عربي خالص: نجم + بحر، أي الكائن البحري ذو الشكل النجمي. كثير من الترجمات العلمية اعتمدت هذا النمط.",
  },
  {
    literal: "بَيت الحِكمة",
    origin: "العربية بَيت + حِكمة",
    options: ["مَكتبة", "مَدرسة", "بَيت الحِكمة", "جامِعة"],
    correctIdx: 2,
    story: "بيت الحكمة كان من أعظم المؤسسات العلمية في العصر العباسي، وازدهر في عهد المأمون، وكان مركزًا للترجمة والبحث.",
  },
  {
    literal: "ما يُقدَّم للضيف",
    origin: "العربية ضَيافة",
    options: ["مأدبة", "حَفلة", "ضِيافة", "كَرَم"],
    correctIdx: 2,
    story: "ضِيافة من ض.ي.ف = استقبال الضيف. أصبحت تَشمل كل ما يُقدّم للزائر من طعام وراحة. قيمة عربيّة جوهريّة.",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Russian etymology offers two kinds of surprises: native Slavic
// compounds whose literal meaning has been forgotten (подушка =
// "under the ear"), and foreign loanwords whose original meaning
// is hidden under everyday Russian use.
const ETYMOLOGY_ARTIST_ROUNDS_RU: EtymologyArtistRound[] = [
  {
    literal: "под ухо",
    origin: "русское «под» + «ухо»",
    options: ["подушка", "подносок", "подъезд", "подвал"],
    correctIdx: 0,
    story: "Подушка буквально — то, что кладут под ухо. Когда люди спали на лавках, подкладывали маленький мешочек с травой или пухом под голову. Слово сохранило корень «ухо».",
  },
  {
    literal: "маленькое око",
    origin: "праславянское око",
    options: ["окно", "оковы", "окраина", "осколок"],
    correctIdx: 0,
    story: "Окно — уменьшительная форма от «око» (глаз). Дом смотрит на мир сквозь маленькие глаза. Самые ранние окна в избах действительно были крошечными.",
  },
  {
    literal: "звёздный моряк",
    origin: "греческое astron + nautes",
    options: ["астроном", "космонавт", "астронавт", "пилот"],
    correctIdx: 2,
    story: "Слово образовано от греческих корней astron «звезда» и nautes «моряк». Так в англоязычной традиции стали называть космических путешественников.",
  },
  {
    literal: "сам летает",
    origin: "русское «сам» + «летать»",
    options: ["самолёт", "самокат", "самовар", "паровоз"],
    correctIdx: 0,
    story: "Самолёт — буквально «сам летает». Слово появилось задолго до авиации — так называли быстро ходящие челноки. Только в 20 веке прижилось за летательным аппаратом.",
  },
  {
    literal: "под солнцем",
    origin: "русское «под» + «солнце»",
    options: ["подсолнух", "подоконник", "подвал", "подъезд"],
    correctIdx: 0,
    story: "Подсолнух буквально «под солнцем» — цветок, поворачивающийся за солнцем. Растение пришло из Америки, но русское имя описывает его поведение точно.",
  },
  {
    literal: "досуг для учёбы",
    origin: "греческое scholé",
    options: ["школа", "лекторий", "академия", "колледж"],
    correctIdx: 0,
    story: "Греческое scholé означало свободное время. Античные греки считали, что учёба возможна только тогда, когда не нужно работать. Школа — досуг с учебной целью.",
  },
  {
    literal: "быстроногий",
    origin: "латинское velox + pedis",
    options: ["велосипед", "автомобиль", "мотоцикл", "самокат"],
    correctIdx: 0,
    story: "Велосипед буквально «быстроногий». Двухколёсное чудо XIX века назвали латинскими корнями — «velox» (быстрый) и «pedis» (нога). Имя прижилось во многих языках.",
  },
  {
    literal: "ездить на чём-то",
    origin: "праславянское ездити",
    options: ["поход", "ездок", "поездка", "выезд"],
    correctIdx: 2,
    story: "Слово «поездка» связано с глаголом «ездить»: так называют путь или путешествие на транспорте. Приставка «по-» оформляет отдельный случай действия.",
  },
  {
    literal: "тот, кто учит",
    origin: "русское учить + суффикс деятеля",
    options: ["учитель", "ученик", "учебник", "училище"],
    correctIdx: 0,
    story: "Учитель — буквально «тот, кто учит». Суффикс «тель» — универсальный маркер деятеля в русском. Писатель пишет, водитель водит, учитель учит.",
  },
  {
    literal: "холодит",
    origin: "русское холод",
    options: ["холодильник", "морозильник", "термос", "кондиционер"],
    correctIdx: 0,
    story: "Холодильник — буквально «тот, кто холодит». Слово создано в 20 веке вместе с прибором. Простая описательность — характерная черта советского технического словаря.",
  },
];

// ─── Kids content ──────────────────────────────────────────────
// Vocabulary a 6-12 year old actually meets — butterfly, dinosaur,
// pineapple. Etymology stays honest (the game's magic is real
// history) but the words and reveal are pitched for a curious child,
// not an adult reader. English + Hebrew for launch; other languages
// fall back to English kids content, and if even that pool isn't
// big enough for a session, we fall back to the adult pool.
const ETYMOLOGY_ARTIST_ROUNDS_KIDS_EN: EtymologyArtistRound[] = [
  {
    literal: "butter fly",
    origin: "Old English butere + fleoge",
    options: ["butterfly", "dragonfly", "bumblebee", "grasshopper"],
    correctIdx: 0,
    story: "No one knows for sure why English says butterfly. One old idea is that yellow butterflies looked the color of butter, and the name later spread.",
  },
  {
    literal: "terrible lizard",
    origin: "Greek deinos + sauros",
    options: ["dinosaur", "crocodile", "dragon", "alligator"],
    correctIdx: 0,
    story: "A British scientist made up this word in 1841. He wanted a name big enough for the giant bones he was finding. Greek gave him deinos (scary) and sauros (lizard).",
  },
  {
    literal: "apple of a pine tree",
    origin: "Middle English pine + appel",
    options: ["pineapple", "acorn", "coconut", "kiwi"],
    correctIdx: 0,
    story: "Explorers found the spiky fruit in South America and thought it looked exactly like a pine cone. Back in Europe apples were the word for any round fruit, so: pine + apple.",
  },
  {
    literal: "break the fast",
    origin: "Old English brecan + fæstan",
    options: ["breakfast", "brunch", "picnic", "dessert"],
    correctIdx: 0,
    story: "All night while you sleep, you're fasting — not eating. Your first meal in the morning breaks that fast. That's why English still calls it break-fast.",
  },
  {
    literal: "sun flower",
    origin: "English sun + flower",
    options: ["sunflower", "daisy", "rose", "tulip"],
    correctIdx: 0,
    story: "Sunflowers actually turn their yellow faces to follow the sun across the sky when they're young. Almost every language on Earth calls it the sun-flower.",
  },
  {
    literal: "spiral wing",
    origin: "Greek helix + pteron",
    options: ["helicopter", "airplane", "drone", "kite"],
    correctIdx: 0,
    story: "The blades spin in a spiral to lift the machine straight up. A French inventor gave it the Greek name in 1861, forty years before anyone actually built a working one.",
  },
  {
    literal: "jelly fish",
    origin: "Middle English gelee + fyshe",
    options: ["jellyfish", "octopus", "starfish", "seahorse"],
    correctIdx: 0,
    story: "Squishy, wobbly, see-through — jellyfish feel exactly like jelly. English sailors named them centuries ago even though jellyfish aren't actually fish at all.",
  },
  {
    literal: "river horse",
    origin: "Greek hippos + potamos",
    options: ["hippopotamus", "rhinoceros", "elephant", "walrus"],
    correctIdx: 0,
    story: "The ancient Greeks saw the huge animal splashing in African rivers and made up the perfect name: horse (hippos) of the river (potamos). Say it out loud — it's actually two Greek words.",
  },
  {
    literal: "milky way",
    origin: "Latin via + lactea",
    options: ["Milky Way", "Sun", "Moon", "Orion"],
    correctIdx: 0,
    story: "The band of stars looked like spilled milk across the night sky. Every ancient language noticed the same thing — Greek called it galaxias (from gala = milk), which is why we say galaxy today.",
  },
  {
    literal: "hot dog",
    origin: "American English 1890s slang",
    options: ["hot dog", "hamburger", "pretzel", "popcorn"],
    correctIdx: 0,
    story: "Hot dog grew from old jokes that cheap sausages contained dog meat. The joke wasn't true, but the funny name stuck for the sausage in a bun.",
  },
];

const ETYMOLOGY_ARTIST_ROUNDS_KIDS_HE: EtymologyArtistRound[] = [
  {
    literal: "לטאה מפחידה",
    origin: "יוונית deinos + sauros",
    options: ["דינוזאור", "תנין", "דרקון", "לטאה"],
    correctIdx: 0,
    story: "מדען בריטי המציא את המילה בשנת 1841. הוא ראה את העצמות הענקיות ורצה שם שיתאים לגודל: לטאה (סאורוס) מפחידה (דיינוס) ביוונית.",
  },
  {
    literal: "רחוק-קול",
    origin: "יוונית tele + phone",
    options: ["טלפון", "רדיו", "מיקרופון", "רמקול"],
    correctIdx: 0,
    story: "טלה ביוונית זה רחוק (כמו טלסקופ שרואה רחוק), ופונה זה קול. טלפון = קול שמגיע ממרחק. פשוט וקסום כשחושבים על זה.",
  },
  {
    literal: "כדור של רגל",
    origin: "עברית מודרנית",
    options: ["כדורגל", "כדורסל", "טניס", "בייסבול"],
    correctIdx: 0,
    story: "כשהמשחק הגיע לישראל בתחילת המאה ה-20, הוועד ללשון העברית הרכיב את השם משתי מילים פשוטות: כדור + רגל. אותו רעיון כמו football באנגלית.",
  },
  {
    literal: "תפוח של האדמה",
    origin: "עברית מודרנית",
    options: ["תפוח אדמה", "אבטיח", "מלפפון", "פלפל"],
    correctIdx: 0,
    story: "בעברית קראו לירק העגול תפוח, כי הוא עגול כמו תפוח. הוא גדל באדמה, אז: תפוח-אדמה. בצרפתית גם קוראים לו pomme de terre, אותו רעיון בדיוק.",
  },
  {
    literal: "גלגל שנע",
    origin: "עברית מודרנית",
    options: ["אופנוע", "אופניים", "מכונית", "רכבת"],
    correctIdx: 0,
    story: "אופן זו מילה עברית עתיקה לגלגל (כמו \"אופני מרכבה\" בתנ\"ך). כשהמציאו את האופניים הממונעים, שילבו: אופן (גלגל) + נוע (תנועה). המילה נטבעה בשנות ה-30.",
  },
  {
    literal: "העיר המבורג",
    origin: "גרמנית — שם עיר",
    options: ["המבורגר", "פיצה", "פלאפל", "שווארמה"],
    correctIdx: 0,
    story: "מהגרים מהעיר המבורג בגרמניה הביאו לאמריקה מנת בשר טחון. באמריקה קראו לזה \"סטייק מהמבורג\" ובקיצור: המבורגר. השם היה תמיד של העיר.",
  },
  {
    literal: "משהו שמקרר",
    origin: "עברית מודרנית",
    options: ["מקרר", "פמוט", "טוסטר", "כירה"],
    correctIdx: 0,
    story: "מהמילה קור. כמו שמסמר \"מסמר\" ומעיל \"מעיל\", מקרר \"מקרר\" — כלי שעושה את הפעולה. המילה נטבעה בעברית ב-1937 כשהמוצר החדש נכנס לבתים.",
  },
  {
    literal: "רחוק-להסתכל",
    origin: "יוונית tele + skopein",
    options: ["טלסקופ", "מיקרוסקופ", "משקפת", "משקפיים"],
    correctIdx: 0,
    story: "טלה ביוונית זה רחוק, וסקופין זה להסתכל. גלילאו לא המציא את המילה — הוא רק היה הראשון שהשתמש בטלסקופ כדי להסתכל בכוכבים בשנת 1610.",
  },
  {
    literal: "אהוב",
    origin: "עברית מקראית",
    options: ["אחיין", "דוד", "בן-דוד", "אח גדול"],
    correctIdx: 1,
    story: "המילה דוד בתנ\"ך התחילה כתואר של חיבה — כמו יקירי. עם הזמן הפכה למילה ספציפית לאח של אמא או של אבא. \"דודי\" בשיר השירים לא היה קרוב משפחה, זה היה אהוב.",
  },
  {
    literal: "מים שיורדים מהעננים",
    origin: "עברית מקראית",
    options: ["גשם", "שלג", "ברד", "טל"],
    correctIdx: 0,
    story: "גשם היא מילה עברית עתיקה מהתנ\"ך. בניגוד לטל, שהוא טיפות קטנות שמופיעות בלילה, הגשם יורד מהעננים בטיפות גדולות שאפשר להרגיש.",
  },
];

const ROUNDS_BY_LANG: Record<string, EtymologyArtistRound[]> = {
  en: ETYMOLOGY_ARTIST_ROUNDS_EN,
  he: ETYMOLOGY_ARTIST_ROUNDS_HE,
  ar: ETYMOLOGY_ARTIST_ROUNDS_AR,
  ru: ETYMOLOGY_ARTIST_ROUNDS_RU,
};

const ROUNDS_BY_LANG_KIDS: Record<string, EtymologyArtistRound[]> = {
  en: ETYMOLOGY_ARTIST_ROUNDS_KIDS_EN,
  he: ETYMOLOGY_ARTIST_ROUNDS_KIDS_HE,
};

/**
 * Pick `count` rounds. When kids=true, we prefer kids content for the
 * requested lang, fall back to English kids content, and only fall
 * back to adult content if the kids pool is missing entirely — that
 * way a 6-year-old never sees "necromancy" mid-game because we ran
 * out of curated kids rounds.
 */

/** Content for a language that ships as a file (Gadi 2026-10-11: native
 *  rounds for the 29 languages beyond he/en/ar/ru, loaded on the play page
 *  by lib/play-content/remote.ts). */
export function registerEtymologyArtistRounds(lang: string, rounds: EtymologyArtistRound[], kids?: EtymologyArtistRound[]): void {
  if (rounds.length) ROUNDS_BY_LANG[lang] = rounds;
  if (kids?.length) ROUNDS_BY_LANG_KIDS[lang] = kids;
}

export function pickEtymologyArtistRounds(
  count: number,
  lang: string = "en",
  kids: boolean = false,
): { rounds: EtymologyArtistRound[]; contentLang: string } {
  if (kids) {
    // A language with its own content but no kids set plays the regular
    // set in its own language, never English (Gadi 2026-10-11: ar, ru).
    const kidsLang = ROUNDS_BY_LANG_KIDS[lang] ? lang : ROUNDS_BY_LANG[lang] ? "" : "en";
    const kidsPool = kidsLang ? ROUNDS_BY_LANG_KIDS[kidsLang] : undefined;
    if (kidsPool && kidsPool.length > 0) {
      const shuffled = kidsPool.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { rounds: shuffled.slice(0, count), contentLang: kidsLang };
    }
  }
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
