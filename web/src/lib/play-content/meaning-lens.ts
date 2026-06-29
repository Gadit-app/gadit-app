/**
 * Meaning Lens — polysemy disambiguation game content.
 *
 * Each round shows a polysemous word (one with multiple distinct
 * meanings) in a specific sentence. The player picks which meaning the
 * sentence is using. Same word, four meanings, one is correct here.
 *
 * Text-only V1. V2 will add AI-generated images for each meaning
 * (the original "Meaning Lens" pitch). The text version still teaches
 * the core skill: spotting which sense of a word a sentence selects.
 *
 * Why it matters: polysemy is the single biggest gap between fluent
 * and native-feeling English. "Bat" has nothing to do with "bat" — but
 * a native speaker never confuses them, because context locks the sense.
 */

export type MeaningLensRound = {
  /** The polysemous word — same across all four options. */
  word: string;
  /** The sentence using the word in ONE of its senses. */
  sentence: string;
  /** Four meaning-glosses. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the meaning actually used in the sentence. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal explaining the disambiguation cue in the sentence. ≤180 chars. */
  story: string;
};

const MEANING_LENS_ROUNDS_EN: MeaningLensRound[] = [
  {
    word: "bat",
    sentence: "She swung the bat hard at the curveball.",
    options: [
      "a flying nocturnal mammal",
      "a wooden stick used in baseball",
      "an old word for an eyelash flicker",
      "a brick of pressed clay",
    ],
    correctIdx: 1,
    story: "Verb 'swung' + 'curveball' locks it as the sports tool. Same letters as the animal, but the contexts never overlap. That's polysemy doing its job.",
  },
  {
    word: "bank",
    sentence: "They sat on the grassy bank watching the river flow.",
    options: [
      "a financial institution",
      "a tilt of an aircraft in flight",
      "the rising edge of a river",
      "a row of stored objects (a bank of computers)",
    ],
    correctIdx: 2,
    story: "'Grassy' + 'river flow' fixes the geographic sense. English uses bank for both money and rivers from totally separate roots that converged in spelling.",
  },
  {
    word: "spring",
    sentence: "The spring in the chair finally snapped after years of use.",
    options: [
      "the season after winter",
      "a coiled metal device",
      "to leap upward suddenly",
      "a natural water source",
    ],
    correctIdx: 1,
    story: "'In the chair' + 'snapped' locks the mechanical sense. All four meanings share an Old English root meaning to leap or burst forth — water, season, spring, all leaping.",
  },
  {
    word: "spring",
    sentence: "We hiked all the way to the spring to fill our bottles.",
    options: [
      "the season after winter",
      "a coiled metal device",
      "to leap upward suddenly",
      "a natural water source",
    ],
    correctIdx: 3,
    story: "'Fill our bottles' fixes the water sense. Same word, totally different referent. The sentence does all the disambiguation work, instantly.",
  },
  {
    word: "match",
    sentence: "This blue scarf doesn't match your jacket.",
    options: [
      "a small stick used to start fires",
      "a sports contest",
      "to be visually compatible",
      "an arranged partnership",
    ],
    correctIdx: 2,
    story: "'Scarf' + 'doesn't match' + 'jacket' fixes the aesthetic sense. Fashion English is full of polysemous verbs that change role with every noun.",
  },
  {
    word: "letter",
    sentence: "The letter 'Q' is rarely used in English without a 'u'.",
    options: [
      "a written or printed message",
      "a single character of an alphabet",
      "a permission to act (a letter of credit)",
      "an academic emblem on clothing",
    ],
    correctIdx: 1,
    story: "Quoting 'Q' and 'u' is the giveaway — those are characters, not envelope content. English uses the same word for both for historical reasons.",
  },
  {
    word: "ring",
    sentence: "The boxer entered the ring to thunderous applause.",
    options: [
      "a circle of metal worn on a finger",
      "a square mat for combat sports",
      "to make a bell sound",
      "a group of people up to something secret",
    ],
    correctIdx: 1,
    story: "'Boxer' + 'entered' locks the arena sense. Funny etymological joke: boxing rings are always SQUARE. The word survived the shape change.",
  },
  {
    word: "fly",
    sentence: "There's a fly buzzing around the kitchen.",
    options: [
      "to travel through the air",
      "a small insect with wings",
      "the front opening of trousers",
      "clever or stylish (informal slang)",
    ],
    correctIdx: 1,
    story: "'Buzzing' is the lock — only insects do that. The verb 'fly' and the noun 'fly' (insect) share a deep ancestor; the others are later add-ons.",
  },
  {
    word: "light",
    sentence: "This backpack is much lighter than it looks.",
    options: [
      "illumination from a source",
      "low in weight",
      "pale in colour",
      "free from worry (light-hearted)",
    ],
    correctIdx: 1,
    story: "'Backpack' + comparative 'lighter than' fixes weight. English bundled weight, brightness, and colour into one word — they come from two separate Old English roots that fused.",
  },
  {
    word: "head",
    sentence: "The CEO heads the company's strategy team.",
    options: [
      "the upper body part containing the brain",
      "the top of something (the head of the bed)",
      "to be in charge of something",
      "the foam on a glass of beer",
    ],
    correctIdx: 2,
    story: "Verb-form 'heads' + 'company' + 'team' fixes leadership. From the body-part meaning English derives 'leader' (the leading head) — same metaphor as Spanish jefe.",
  },
  {
    word: "trunk",
    sentence: "We loaded the suitcases into the trunk and drove off.",
    options: [
      "an elephant's long nose",
      "the main stem of a tree",
      "a large storage chest",
      "the cargo space of a car",
    ],
    correctIdx: 3,
    story: "'Suitcases' + 'drove off' = American car-cargo sense. British English uses 'boot'. All four trunk meanings (elephant, tree, chest, car) share the idea of a central container.",
  },
  {
    word: "scale",
    sentence: "You'll need to scale the diagram to fit the page.",
    options: [
      "a graded series of measurements",
      "the hard plates on a fish or reptile",
      "a device for weighing things",
      "to resize while keeping proportions",
    ],
    correctIdx: 3,
    story: "Verb 'scale' + 'fit the page' fixes the resize sense. The same word in 'scale a mountain' means to climb — yet another sense English just packed in.",
  },
  {
    word: "race",
    sentence: "Her heart began to race as the deadline approached.",
    options: [
      "a competition of speed",
      "a major group of human ancestry",
      "to move very fast or beat fast",
      "a strong current of water",
    ],
    correctIdx: 2,
    story: "'Heart began to' + 'deadline' fixes the speeding sense. The verb-noun ambiguity is everywhere in English — context picks the role in milliseconds.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew has surprisingly rich polysemy. The 3-letter root system
// means that one written form can carry 4-5 distinct senses depending
// on context. עין = eye, spring, sight, opinion. ספר = book, count,
// border. The game teaches context locks meaning, instantly.
const MEANING_LENS_ROUNDS_HE: MeaningLensRound[] = [
  {
    word: "עין",
    sentence: "מי שתיית האדמה זרמו מן העין שבמדבר.",
    options: [
      "איבר הראייה",
      "מעיין מים",
      "מבט או השקפה",
      "טבעת על הצוואר",
    ],
    correctIdx: 1,
    story: "'מי' + 'אדמה' + 'במדבר' = מקור מים. עין במקרא היא גם איבר וגם מעיין — שני שורשים שהתאחדו במילה אחת.",
  },
  {
    word: "ספר",
    sentence: "קראתי ספר מרתק כל הלילה.",
    options: [
      "פעולת ספירה",
      "אזור גבול",
      "אובייקט עם דפים לקריאה",
      "סופר או סופרת",
    ],
    correctIdx: 2,
    story: "'קראתי' + 'כל הלילה' = פעילות קריאה. ספר באותיות זהות הוא ספרא (קצב), ספירה, וגם גבול ('עיר הספר').",
  },
  {
    word: "ספר",
    sentence: "הגענו לעיר הספר ליד הגבול הצפוני.",
    options: [
      "אובייקט עם דפים לקריאה",
      "פעולת ספירה",
      "אזור גבול של מדינה",
      "סופר שמייצר ספרות",
    ],
    correctIdx: 2,
    story: "'עיר' + 'גבול' = רמז מפורש. עיר הספר = יישוב על קצה הארץ, מהשורש ס.פ.ר. שמשמעו גבול / קץ. תנ\"כי.",
  },
  {
    word: "אדם",
    sentence: "אדם הראשון נברא ביום השישי.",
    options: [
      "צבע אדמדם",
      "שם אדם פרטי במקרא",
      "כל אדם, מין האנושות",
      "שטח חקלאי",
    ],
    correctIdx: 1,
    story: "'הראשון' + 'נברא' מפנה לשם הפרטי. עברית עתיקה השתמשה ב'אדם' גם לכל אדם וגם לראשון בפרט. הפרשנות משתנה.",
  },
  {
    word: "ים",
    sentence: "ים של אנשים הגיע לכנס.",
    options: [
      "גוף מים גדול",
      "כיוון מערב במקרא",
      "ריבוי עצום של משהו",
      "כלי גדול במקדש",
    ],
    correctIdx: 2,
    story: "'אנשים' + 'הגיע לכנס' מפנה למטאפורה. 'ים של' = כמות גדולה מאוד. ביטוי שגרתי, בלי גוף מים אמיתי.",
  },
  {
    word: "חיים",
    sentence: "החיים שלי השתנו אחרי המסע ההוא.",
    options: [
      "מצב היפך מהמוות",
      "שם משפחה",
      "אופן ההתנהלות והחוויה",
      "פרק זמן ביולוגי",
    ],
    correctIdx: 2,
    story: "'שלי' + 'השתנו אחרי' = החוויה האישית. בעברית 'חיים' הוא גם זמן ביולוגי וגם אופן ההוויה. הקונטקסט מבדיל.",
  },
  {
    word: "פנים",
    sentence: "פני הספר היו מקושטים בזהב.",
    options: [
      "הצד הקדמי של הראש",
      "כיוון, פנייה",
      "החלק החיצוני של חפץ",
      "התוכן הפנימי",
    ],
    correctIdx: 2,
    story: "'פני' = הצד החיצוני של הספר. פנים מקראי הוא גם פני אדם, גם פני שמיים, וגם פני הספר. כיסוי חיצון, לא חזית.",
  },
  {
    word: "פנים",
    sentence: "המורה ראה את פני התלמיד והבין שיש בעיה.",
    options: [
      "הצד החיצון של חפץ",
      "ביטוי הפנים של אדם",
      "תוכן פנימי",
      "כיוון מסוים",
    ],
    correctIdx: 1,
    story: "'תלמיד' + 'הבין שיש בעיה' מצביע על קריאת הבעת פנים. כאן פנים = הפן הרגשי שנראה על הראש.",
  },
  {
    word: "רוח",
    sentence: "רוח חזקה נשבה מן הים.",
    options: [
      "תנועת אוויר באטמוספירה",
      "נשמה או רוחניות",
      "חלק רביעי של מצפן",
      "אופי או טמפרמנט",
    ],
    correctIdx: 0,
    story: "'נשבה' + 'מן הים' = תנועת אוויר. אבל 'רוח' עברית מכילה את כל ארבע המשמעויות. הקונטקסט עושה את העבודה.",
  },
  {
    word: "רוח",
    sentence: "רוח הצעירים בארץ עברה דרמטית מאז.",
    options: [
      "תנועת אוויר",
      "ההלך הרוח הקולקטיבי, אופי",
      "המוות והנשמה שעוזבת",
      "כיוון רוחב",
    ],
    correctIdx: 1,
    story: "'הצעירים בארץ' + 'מאז' = הקולקטיב הרוחני. בעברית 'רוח' = נטייה כללית של תקופה. פושטת בכל השפות.",
  },
  {
    word: "לב",
    sentence: "לב העיר מלא בקפה והומה אדם.",
    options: [
      "האיבר השואב דם",
      "המרכז של מקום",
      "ההרגשה, האהבה",
      "הסבלנות והאומץ",
    ],
    correctIdx: 1,
    story: "'העיר' + 'מלא בקפה' = המרכז העירוני. כל המשמעויות של לב מקיימות מטאפורה: מרכז של דבר, מקור החיים.",
  },
  {
    word: "אבן",
    sentence: "באר זו היא אבן יסוד של הקהילה.",
    options: [
      "סלע קטן",
      "תכשיט יקר",
      "יסוד או בסיס מטאפורי",
      "אבן דרך באומנות",
    ],
    correctIdx: 2,
    story: "'באר זו' + 'יסוד של הקהילה' = מטאפורה. אבן יסוד = הבסיס המכונן. ביטוי מקראי-תלמודי שעבר לבניין אזרחי מודרני.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic is rich in polysemy. عين alone means eye, spring, spy, essence,
// opinion. The 3-letter root system means one written form can carry
// 4-5 distinct senses, locked only by context. Each round shows how
// fluent readers disambiguate instantly.
const MEANING_LENS_ROUNDS_AR: MeaningLensRound[] = [
  {
    word: "عَين",
    sentence: "شربنا من ماء العَين الباردة في الجبل.",
    options: [
      "العضو الذي نَرى به",
      "نَبع ماء عَذب",
      "جاسوس أو رَقيب",
      "ذات الشيء أو نفسه",
    ],
    correctIdx: 1,
    story: "ماء + باردة + جبل = نبع ماء طبيعي. عَين في العربية تجمع خمسة معانٍ على الأقلّ. السياق يحسم في لحظة.",
  },
  {
    word: "عَين",
    sentence: "كان الجاسوس عَينًا للحكومة في البلدة.",
    options: [
      "جاسوس أو مُراقِب",
      "العضو البصري",
      "نَبع ماء",
      "كنز ذهبي",
    ],
    correctIdx: 0,
    story: "جاسوس + الحكومة + البلدة = الرَقيب. هذا المعنى موجود منذ ما قبل الإسلام. عَين = من يُرسل ليرى ويُبلّغ.",
  },
  {
    word: "بَيت",
    sentence: "أعجبني بَيت الشعر الأول من قصيدته.",
    options: [
      "المسكن الذي يعيش فيه الإنسان",
      "وَحدة من القصيدة",
      "صندوق الخزانة",
      "بَيت العَنكبوت",
    ],
    correctIdx: 1,
    story: "الشعر + الأول + قصيدته = وحدة شعرية. بَيت الشعر مصطلح أساسي في العَروض. أصل المعنى من بيت الخيمة الذي يأوي.",
  },
  {
    word: "شَعر",
    sentence: "قرأتُ شَعرَ المتنبّي حتى الفجر.",
    options: [
      "ما يَنبت على رأس الإنسان",
      "إحساس أو وَعي",
      "الفنّ الأدبي المنظوم",
      "نوع من الحيوانات",
    ],
    correctIdx: 2,
    story: "المتنبّي + الفجر + قرأت = شعر أدبي. كلمة شَعر تكتب بنفس الحروف للمعنى الفيزيائي (شَعر الرأس) والأدبي.",
  },
  {
    word: "ضَرَب",
    sentence: "الأستاذ ضَرَب لنا مثلًا عن أهمية الصبر.",
    options: [
      "صَفَع أو أوقع ضربة",
      "أوضح أو قدّم",
      "غَنّى أو عَزَف",
      "ابتعد ورحل",
    ],
    correctIdx: 1,
    story: "الأستاذ + مثلًا + أهمية الصبر = قدّم/أوضح. ضرب المثل = أعطى مثالًا. معنى مجازي بعيد عن الضرب الجسدي.",
  },
  {
    word: "يَد",
    sentence: "هذا الأمر بيدِك أنت وليس بيد غيرك.",
    options: [
      "العضو الذي نمسك به",
      "السيطرة أو القدرة",
      "مساعدة وعون",
      "كُمّ القميص",
    ],
    correctIdx: 1,
    story: "الأمر + بيدِك + ليس بيد غيرك = القرار في سُلطتك. اليد رمز قديم للسلطة في كثير من اللغات السامية.",
  },
  {
    word: "رَأس",
    sentence: "وَصَلنا إلى رَأس الجَبل بعد ساعات من التَسلّق.",
    options: [
      "العضو فوق الجسم",
      "أعلى نقطة من مكان",
      "القائد أو الزعيم",
      "أول الشيء",
    ],
    correctIdx: 1,
    story: "الجبل + التسلّق + ساعات = القمّة. رأس الشيء = أعلاه أو أقصاه. هذا المعنى المجازي قديم قِدَم اللغة نفسها.",
  },
  {
    word: "خَطّ",
    sentence: "كان خَطّ المعلّمة جميلًا واضحًا في الكتب.",
    options: [
      "علامة مستقيمة",
      "أسلوب الكتابة اليدوي",
      "اتجاه أو طريق",
      "رِسالة أو كتاب",
    ],
    correctIdx: 1,
    story: "المعلّمة + جميلًا + الكتب = أسلوب الكتابة. خَطّ الإنسان = صورة كتابته. مَن جميل خَطّه يكتب بخطّ جميل.",
  },
  {
    word: "وَجه",
    sentence: "هذا وَجه آخر للقصّة لم نسمعه من قبل.",
    options: [
      "الجبهة من رأس الإنسان",
      "جانب أو زاوية نظر",
      "اتّجاه أو مَقصِد",
      "الجزء العلوي من شيء",
    ],
    correctIdx: 1,
    story: "آخر + للقصّة + لم نسمعه = زاوية مختلفة. وَجه القصّة = روايتها من زاوية معيّنة. مجاز شائع في العربية اليومية.",
  },
  {
    word: "رُوح",
    sentence: "هَبَطت رُوح جديدة على الفريق هذا الموسم.",
    options: [
      "النفَس أو الحَياة",
      "كائن غير مرئي",
      "النَشاط والحماسة",
      "العَطر أو الرائحة",
    ],
    correctIdx: 2,
    story: "هبطت + الفريق + الموسم = الحماسة الجَماعية. رُوح الفريق ليست النَفَس الحرفي بل الطاقة المشتركة بين اللاعبين.",
  },
];

const ROUNDS_BY_LANG: Record<string, MeaningLensRound[]> = {
  en: MEANING_LENS_ROUNDS_EN,
  he: MEANING_LENS_ROUNDS_HE,
  ar: MEANING_LENS_ROUNDS_AR,
};

export function pickMeaningLensRounds(
  count: number,
  lang: string = "en",
): { rounds: MeaningLensRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
