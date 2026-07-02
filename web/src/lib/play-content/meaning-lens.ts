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

// ─── Russian content ───────────────────────────────────────────
// Russian has remarkable polysemy. КЛЮЧ alone means key, spring,
// and treble clef. Each round shows how context locks one meaning
// out of several — the skill native speakers use unconsciously.
const MEANING_LENS_ROUNDS_RU: MeaningLensRound[] = [
  {
    word: "ключ",
    sentence: "Я нашёл ключ от входной двери в кармане.",
    options: [
      "источник воды в скале",
      "металлический предмет для замка",
      "музыкальный знак",
      "решение задачи",
    ],
    correctIdx: 1,
    story: "Слова «дверь» и «карман» сразу указывают на ключ-замок. Русский «ключ» имеет минимум пять значений, но контекст всегда выбирает одно.",
  },
  {
    word: "ключ",
    sentence: "Туристы остановились у горного ключа, чтобы набрать воды.",
    options: [
      "источник воды",
      "предмет для замка",
      "музыкальный знак",
      "решение задачи",
    ],
    correctIdx: 0,
    story: "Слова «горный» и «вода» переключают значение на источник. Тот же набор букв, но семантика расходится полностью.",
  },
  {
    word: "лук",
    sentence: "Робин Гуд натянул лук и прицелился в яблоко.",
    options: [
      "оружие для стрельбы стрелами",
      "острый овощ для салата",
      "поза в йоге",
      "часть здания",
    ],
    correctIdx: 0,
    story: "«Натянул» и «прицелился» однозначно указывают на оружие. Омонимы лук-овощ и лук-оружие пришли из разных корней.",
  },
  {
    word: "коса",
    sentence: "У девушки была длинная русая коса до пояса.",
    options: [
      "инструмент для скашивания травы",
      "сплетение волос",
      "узкая береговая полоса",
      "географическое название",
    ],
    correctIdx: 1,
    story: "«Длинная», «русая», «до пояса» — все слова о причёске. Русский язык даёт одной форме три разных значения с разной этимологией.",
  },
  {
    word: "замок",
    sentence: "Туристы посетили старинный средневековый замок.",
    options: [
      "укреплённое здание феодала",
      "механизм для запирания двери",
      "застёжка на одежде",
      "часть фортепиано",
    ],
    correctIdx: 0,
    story: "«Старинный» и «средневековый» сразу выбирают замок-крепость. Если бы было «замок щёлкнул» — пришлось бы выбрать замок-механизм.",
  },
  {
    word: "брак",
    sentence: "Их брак длился двадцать пять счастливых лет.",
    options: [
      "семейный союз",
      "дефект изделия",
      "недостаток в работе",
      "товар с изъяном",
    ],
    correctIdx: 0,
    story: "«Счастливых лет» указывает на семейный союз. «Брак на заводе» был бы значением «дефект». Любопытно, что оба слова — омонимы из разных корней.",
  },
  {
    word: "язык",
    sentence: "Английский язык открывает множество возможностей.",
    options: [
      "орган во рту человека",
      "система коммуникации народа",
      "пленный или информатор",
      "часть колокола",
    ],
    correctIdx: 1,
    story: "«Английский» сразу выбирает значение «языковая система». Без определения слово оставляет четыре варианта прочтения.",
  },
  {
    word: "стол",
    sentence: "Ему прописали диетический стол № 5 для печени.",
    options: [
      "мебельный предмет с ножками",
      "режим питания",
      "рабочее место чиновника",
      "общественное собрание",
    ],
    correctIdx: 1,
    story: "«Диетический» и «№ 5» однозначно говорят о медицинской диете. Слово «стол» в русском прошло путь от мебели к меню к режиму питания.",
  },
  {
    word: "мир",
    sentence: "Все люди мира мечтают о счастье и здоровье.",
    options: [
      "отсутствие войны",
      "вся планета и люди на ней",
      "социальная среда",
      "вселенная",
    ],
    correctIdx: 1,
    story: "«Все люди» сразу указывают на планетарное значение. Лев Толстой написал «Войну и мир», где «мир» имеет оба значения сразу — одна из лучших игр слов в литературе.",
  },
  {
    word: "свет",
    sentence: "В этот вечер собрался весь высший свет Москвы.",
    options: [
      "электромагнитное излучение",
      "аристократия и элита",
      "часть мира",
      "огонь костра",
    ],
    correctIdx: 1,
    story: "«Высший» и «Москвы» переключают значение на аристократическое общество. В Пушкинских временах «свет» означало именно элиту — без других пояснений.",
  },
];

// ─── Kids content ──────────────────────────────────────────────
// Polysemy the 6-12 crowd meets in real life — bark, bat, trunk,
// spring. Sentences are simple, options are concrete, and the reveal
// explains the trick to spotting which meaning the sentence is using.
const MEANING_LENS_ROUNDS_KIDS_EN: MeaningLensRound[] = [
  {
    word: "bark",
    sentence: "The dog started to bark loudly at the mailman.",
    options: [
      "the outer covering of a tree",
      "the loud sound a dog makes",
      "a small sailing boat",
      "a hard shell of a fruit",
    ],
    correctIdx: 1,
    story: "Look at the word 'dog' right before 'bark'. That's your cue — only the dog meaning of bark fits with a dog making a loud noise at someone.",
  },
  {
    word: "bat",
    sentence: "A tiny bat flew out of the dark cave right at sunset.",
    options: [
      "a wooden stick used in baseball",
      "a black eye mask",
      "a small flying animal",
      "to hit something quickly",
    ],
    correctIdx: 2,
    story: "The words 'flew' and 'cave' unlock it. Baseball bats don't fly and don't live in caves. Only the animal bat fits both clues at once.",
  },
  {
    word: "trunk",
    sentence: "The elephant lifted the peanut with its long trunk.",
    options: [
      "the box at the back of a car",
      "a large wooden storage chest",
      "the long nose of an elephant",
      "the main part of a tree",
    ],
    correctIdx: 2,
    story: "'Elephant' is your key. English uses trunk for four different things — a car boot, a chest, a tree, and an elephant's nose — but only one fits an elephant lifting a peanut.",
  },
  {
    word: "star",
    sentence: "She saw a shooting star cross the sky just before midnight.",
    options: [
      "a famous singer or actor",
      "a shape with five or six points",
      "a bright dot in the night sky",
      "a top rank in a game",
    ],
    correctIdx: 2,
    story: "'Sky' and 'midnight' are the giveaway. A famous singer doesn't 'shoot' across the sky. Only the sky-star meaning works with a shooting star at night.",
  },
  {
    word: "spring",
    sentence: "The flowers begin to bloom in early spring.",
    options: [
      "to jump up suddenly",
      "the season after winter",
      "a coiled metal wire",
      "a small stream of water",
    ],
    correctIdx: 1,
    story: "'Flowers begin to bloom' plants the clue. Metal wires don't have blooming seasons — only the time-of-year meaning of spring lands here.",
  },
  {
    word: "match",
    sentence: "Dad struck a match to light the birthday candles.",
    options: [
      "two things that go together",
      "a football or tennis game",
      "a short wooden fire stick",
      "to be equal in a race",
    ],
    correctIdx: 2,
    story: "'Struck' plus 'light the candles' is the combo. You strike a match to make fire; you don't strike a football game. The word 'candles' locks the fire-stick meaning.",
  },
  {
    word: "cool",
    sentence: "The lemonade was really cool after playing outside.",
    options: [
      "at a low but nice temperature",
      "very impressive or awesome",
      "calm and unbothered",
      "quiet and reserved",
    ],
    correctIdx: 0,
    story: "'Lemonade' after playing outside — that's a temperature clue. An 'awesome' drink is possible but the sentence is really about how it felt to drink something cold on a warm day.",
  },
  {
    word: "fair",
    sentence: "The whole family went to the fair for cotton candy and rides.",
    options: [
      "just and equal to everyone",
      "a big outdoor event with rides",
      "light-coloured hair or skin",
      "average — not good and not bad",
    ],
    correctIdx: 1,
    story: "'Cotton candy and rides' can only happen at one kind of fair — the outdoor event kind. The other meanings of fair don't have rides.",
  },
  {
    word: "watch",
    sentence: "Grandpa gave me a shiny watch for my tenth birthday.",
    options: [
      "to look at something carefully",
      "a small clock you wear on your wrist",
      "a group of guards on duty",
      "to keep an eye on a baby",
    ],
    correctIdx: 1,
    story: "'Gave me a shiny' is the tell. You can't give someone the act of looking. Only the wrist-clock meaning fits a birthday gift you can hold.",
  },
  {
    word: "bank",
    sentence: "We sat on the grassy bank and watched the river flow.",
    options: [
      "a place that keeps your money safe",
      "a row of switches on a machine",
      "the ground next to a river",
      "to depend on someone completely",
    ],
    correctIdx: 2,
    story: "'Grassy' and 'watched the river flow' point straight at the ground meaning. Money banks aren't grassy, and switches don't sit next to rivers.",
  },
];

const MEANING_LENS_ROUNDS_KIDS_HE: MeaningLensRound[] = [
  {
    word: "עין",
    sentence: "מהעין הקטנה בהר יצאו מים קרים וזכים.",
    options: [
      "האיבר שרואים בו",
      "מעיין קטן של מים",
      "אות בעברית עתיקה",
      "בור עמוק באדמה",
    ],
    correctIdx: 1,
    story: "המילה \"מים\" ו\"הר\" הם המפתח. מהעיניים של אנשים לא יוצאים מים זכים מההר. רק המשמעות של מעיין מים מתאימה למה שמתואר.",
  },
  {
    word: "רגל",
    sentence: "בחג הרגל כל המשפחה נסעה לסבתא.",
    options: [
      "החלק שהולכים איתו",
      "חג יהודי מיוחד",
      "קטע של שולחן",
      "יחידה של צבא",
    ],
    correctIdx: 1,
    story: "המילה \"חג\" לפני רגל היא הרמז. שלוש פעמים בשנה בתנ\"ך יש \"חג רגל\" — פסח, שבועות וסוכות. השם בא מהמצווה לעלות ברגל לירושלים.",
  },
  {
    word: "כוכב",
    sentence: "בלילה בהיר אפשר לראות אלפי כוכבים בשמיים.",
    options: [
      "שחקן מפורסם",
      "נקודה זוהרת בשמיים",
      "צורה עם חמש קצוות",
      "חייל טוב מאוד",
    ],
    correctIdx: 1,
    story: "\"בלילה\" ו\"בשמיים\" קובעים את זה. שחקן מפורסם לא נראה בשמיים בלילה. רק המשמעות של כוכב אמיתי בשמיים מתאימה.",
  },
  {
    word: "פרח",
    sentence: "בגינה של סבתא פרח יפה עם עלים אדומים.",
    options: [
      "צמח עם עלי כותרת צבעוניים",
      "ילד או ילדה צעירים",
      "מישהו שרק התחיל בעבודה",
      "לצאת החוצה",
    ],
    correctIdx: 0,
    story: "המילים \"בגינה\" ו\"עלים אדומים\" ברורות. גינה של סבתא לא מגדלים ילדים או עובדים חדשים — רק פרחים אמיתיים עם עלים.",
  },
  {
    word: "אור",
    sentence: "הדליק את האור בחדר לפני שנכנס.",
    options: [
      "הבוקר, הזמן שלפני הצהריים",
      "שם של ילד או ילדה",
      "מנורה או תאורה בחדר",
      "אנרגיה שרואים איתה",
    ],
    correctIdx: 2,
    story: "\"הדליק\" ו\"בחדר\" מובילים למשמעות של מנורה. בוקר לא מדליקים ואי אפשר להדליק שם של ילד. רק תאורה בחדר מתאימה.",
  },
  {
    word: "לב",
    sentence: "הלב שלה פעם חזק כשראתה את המבחן.",
    options: [
      "האיבר שמזרים דם בגוף",
      "המרכז של משהו",
      "אומץ ורצון",
      "אמצע של פרי",
    ],
    correctIdx: 0,
    story: "\"פעם חזק\" זה תיאור של פעימות הלב. המילה \"מבחן\" מזכירה התרגשות — וכשמתרגשים, הלב באמת פועם חזק. זו המשמעות הפיזית של לב.",
  },
  {
    word: "יד",
    sentence: "הוא הרים את היד וסימן לחבר שלו.",
    options: [
      "אחד משני האיברים לתפוס בהם",
      "אנדרטה, מבנה זיכרון",
      "כוח או שליטה",
      "מקום או צד",
    ],
    correctIdx: 0,
    story: "\"הרים\" ו\"סימן\" יחד רומזים על תנועה פיזית של איבר בגוף. אנדרטה לא מרימים כדי לסמן, וכוח לא מסמנים ככה.",
  },
  {
    word: "בית",
    sentence: "אחרי בית הראשון של השיר הצטרפה כל הכיתה.",
    options: [
      "המקום שגרים בו",
      "חלק אחד של שיר או פזמון",
      "משפחה, קרובים",
      "מבנה של פסוקים",
    ],
    correctIdx: 1,
    story: "המילה \"שיר\" קובעת את המשמעות. שיר בנוי מבתים ופזמונים — אין לו כניסה או מטבח. הרמז השני הוא \"אחרי הראשון\" — בבית לא סופרים ככה.",
  },
  {
    word: "קר",
    sentence: "בחוץ קר, אל תשכח סוודר.",
    options: [
      "טמפרטורה נמוכה",
      "אדם ללא רגשות",
      "צבע בין לבן לאפור",
      "בלי חום או התלהבות",
    ],
    correctIdx: 0,
    story: "המילים \"בחוץ\" ו\"סוודר\" הן הרמז. בחוץ יכולה להיות טמפרטורה, אבל לא רגשות של אדם. סוודר משתמשים בו רק כשהטמפרטורה נמוכה.",
  },
  {
    word: "כלב",
    sentence: "כלב הים שוחה מהר במים הקרים של האנטארקטיקה.",
    options: [
      "חיה של הבית שנובחת",
      "יונק ים עם פרווה",
      "מכשיר לתפוס דגים",
      "אדם שלא נחמד",
    ],
    correctIdx: 1,
    story: "\"של הים\" משנה את המשמעות לגמרי. כלב ים זו לא חיית מחמד — זו חיה שחיה במים הקרים. שם מטעה כי היא לא באמת מוצאת של כלב.",
  },
];

const ROUNDS_BY_LANG: Record<string, MeaningLensRound[]> = {
  en: MEANING_LENS_ROUNDS_EN,
  he: MEANING_LENS_ROUNDS_HE,
  ar: MEANING_LENS_ROUNDS_AR,
  ru: MEANING_LENS_ROUNDS_RU,
};

const ROUNDS_BY_LANG_KIDS: Record<string, MeaningLensRound[]> = {
  en: MEANING_LENS_ROUNDS_KIDS_EN,
  he: MEANING_LENS_ROUNDS_KIDS_HE,
};

export function pickMeaningLensRounds(
  count: number,
  lang: string = "en",
  kids: boolean = false,
): { rounds: MeaningLensRound[]; contentLang: string } {
  if (kids) {
    const kidsLang = ROUNDS_BY_LANG_KIDS[lang] ? lang : "en";
    const kidsPool = ROUNDS_BY_LANG_KIDS[kidsLang];
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
