/* Screen 1 — Content data (all three artboards share).
   Separate from components so we can swap words per artboard without
   touching rendering.
*/

const DATA_EN = {
  word: 'dream',
  language: 'English',
  langCode: 'EN',
  ipa: '/driːm/',
  pos: 'noun, verb',
  meanings: [
    {
      n: 1, pos: 'noun',
      definition: 'A series of thoughts, images, or sensations occurring in a person\'s mind during sleep.',
      examples: [
        'I had a strange dream last night about flying over a forest of glass.',
        'She often dreams about her childhood summers by the lake.',
        'In his dream, the road stretched on forever and the sun never set.',
      ],
      idioms: [
        { phrase: 'in your dreams', meaning: 'Used to express the unlikelihood of something.' },
        { phrase: 'sweet dreams', meaning: 'A parting wish at bedtime.' },
      ],
    },
    {
      n: 2, pos: 'noun',
      definition: 'A cherished aspiration, ambition, or ideal — something deeply wished for.',
      examples: [
        'It had been her lifelong dream to study the stars from a mountain observatory.',
        'The team chased the dream of building something that outlived them.',
      ],
      idioms: [
        { phrase: 'dream big', meaning: 'To be ambitious and aim for extraordinary outcomes.' },
      ],
    },
    {
      n: 3, pos: 'verb',
      definition: 'To contemplate the possibility of something; to imagine it as real.',
      examples: [
        'She never dreamed the letter would arrive so soon.',
        'I used to dream of a small bookshop by the sea.',
      ],
    },
  ],
  etymology: {
    origin: 'From Old English drēam, meaning "joy, music, or mirth" — a word that once had no connection to sleep at all. The modern sense emerged in Middle English around the 13th century, likely influenced by Old Norse draumr and Middle Dutch droom.',
    historyNote: 'The Old English drēam meant joy or music — not sleep-visions. For centuries, the English simply had no word for what we dream at night. The meaning shifted sometime in the 1200s, possibly carried in by Norse settlers whose draumr already meant "vision during sleep."',
    timeline: [
      { era: 'Proto-Germanic', form: '*draugmaz', gloss: 'deception, phantom' },
      { era: 'Old English', form: 'drēam', gloss: 'joy, music' },
      { era: 'Middle English', form: 'dreem', gloss: 'sleep vision' },
      { era: 'Modern', form: 'dream', gloss: 'vision · ambition' },
    ],
  },
  kids: {
    intro: 'A dream is like a little movie your mind plays while you\'re sleeping. You didn\'t choose it, it just shows up — sometimes about your day, sometimes about things that never happened.',
    bullets: [
      'Sometimes dreams are funny or silly.',
      'Sometimes they can feel scary, but they can\'t hurt you.',
      'When you wake up, they usually float away.',
    ],
  },
  idioms: [
    { phrase: 'a dream come true', meaning: 'Something long hoped for that has actually happened.' },
    { phrase: 'beyond your wildest dreams', meaning: 'Far better than you ever imagined.' },
    { phrase: 'dream big', meaning: 'Aim for ambitious, extraordinary goals.' },
    { phrase: 'living the dream', meaning: 'Experiencing a life one has deeply wished for.' },
  ],
};

const DATA_HE = {
  word: 'חלום',
  language: 'עברית',
  langCode: 'HE',
  ipa: null,
  pos: 'שם עצם',
  meanings: [
    {
      n: 1, pos: 'שם עצם',
      definition: 'רצף של דימויים, מחשבות ותחושות שמופיעים בתודעה בזמן השינה.',
      examples: [
        'הוא התעורר מחלום מוזר על עיר שצפה מעל הים.',
        'היא לא הצליחה להיזכר בחלום שלה מהלילה.',
        'בחלום שלו הוא שוב הלך ברחוב של הילדות.',
      ],
      idioms: [
        { phrase: 'חלום באספמיה', meaning: 'משאלה שאין לה סיכוי להתגשם.' },
        { phrase: 'חלומות פז', meaning: 'איחול ללילה טוב ורגוע.' },
      ],
    },
    {
      n: 2, pos: 'שם עצם',
      definition: 'שאיפה יקרה, תקווה עמוקה — משהו שאדם מייחל לו במשך שנים.',
      examples: [
        'הקמת הספרייה הקטנה הייתה חלום חייה.',
        'הם רדפו אחרי חלום שנראה גדול מהם.',
      ],
      idioms: [
        { phrase: 'לחלום בגדול', meaning: 'לשאוף לדברים יוצאי דופן.' },
      ],
    },
  ],
  etymology: {
    origin: 'מן השורש השמי חל״ם, המשותף לעברית, לארמית ולערבית. בעברית המקראית מופיעה המילה בספר בראשית, בחלום יוסף — אחד מן החלומות הראשונים שתועדו בספרות העולמית.',
    historyNote: 'בעברית המקראית, חלום לא היה רק תופעה אישית אלא ערוץ לנבואה. חלומות יוסף ודניאל נתפסו כמסרים אלוהיים שטעונים פענוח, לא כזיכרונות של הלילה.',
    timeline: [
      { era: 'שמית קדומה', form: '*ḥlm', gloss: 'חלם, חזה' },
      { era: 'מקראית', form: 'חֲלוֹם', gloss: 'חזון, נבואה' },
      { era: 'ימי הביניים', form: 'חלום', gloss: 'דמיון לילה' },
      { era: 'מודרנית', form: 'חלום', gloss: 'חזון · שאיפה' },
    ],
  },
  kids: {
    intro: 'חלום הוא כמו סרט קטן שהראש שלך ממציא בזמן שאתה ישן. אתה לא בוחר מה יראו בו — הוא פשוט מגיע.',
    bullets: [
      'לפעמים חלומות מצחיקים.',
      'לפעמים הם מפחידים, אבל הם לא יכולים לפגוע בך.',
      'כשמתעוררים, הם בדרך כלל מתפוגגים.',
    ],
  },
  idioms: [
    { phrase: 'חלום שהתגשם', meaning: 'משאלה גדולה שהפכה למציאות.' },
    { phrase: 'חלום באספמיה', meaning: 'משהו שאינו אפשרי להשגה.' },
    { phrase: 'לחלום בגדול', meaning: 'לשאוף להישגים יוצאי דופן.' },
    { phrase: 'חלומות פז', meaning: 'איחול ללילה שקט ונעים.' },
  ],
};

const DATA_AR = {
  word: 'حُلم',
  language: 'العربية',
  langCode: 'AR',
  ipa: null,
  pos: 'اسم',
  meanings: [
    {
      n: 1, pos: 'اسم',
      definition: 'سلسلة من الصور والأفكار والمشاعر التي تمر في الذهن أثناء النوم.',
      examples: [
        'رأى في حلمه مدينةً تطفو فوق البحر.',
        'استيقظت ولم تتذكّر حلمها.',
        'كان الحلم واضحًا كأنه ذكرى قديمة.',
      ],
      idioms: [
        { phrase: 'أحلام سعيدة', meaning: 'تمنّيات بليلة طيبة وهادئة.' },
      ],
    },
    {
      n: 2, pos: 'اسم',
      definition: 'أمنية عزيزة أو طموح بعيد يسعى إليه المرء طويلًا.',
      examples: [
        'كان بناء المدرسة حلم حياتها.',
        'لاحقوا حلمًا أكبر منهم بكثير.',
      ],
    },
  ],
  etymology: {
    origin: 'من الجذر السامي ح ل م، المشترك بين العربية والعبرية والآرامية. وقد ورد في القرآن الكريم وفي الشعر الجاهلي بالمعنيين معًا: رؤيا الليل والأناة الراسخة.',
    historyNote: 'في العربية الكلاسيكية، «الحِلْم» بكسر الحاء يعني الأناة ورجاحة العقل — لا رؤيا النوم. الشاعر يمدح ممدوحه بأنه «ذو حِلْمٍ» أي ذو صبرٍ عظيم، وتلك صلة قديمة بين النضج والرؤيا.',
    timeline: [
      { era: 'سامية قديمة', form: '*ḥlm', gloss: 'حَلَمَ، رأى' },
      { era: 'جاهلية', form: 'حِلْم', gloss: 'أناة، حكمة' },
      { era: 'كلاسيكية', form: 'حُلْم', gloss: 'رؤيا النوم' },
      { era: 'حديثة', form: 'حُلم', gloss: 'رؤيا · طموح' },
    ],
  },
  kids: {
    intro: 'الحلم مثل فيلم صغير يصنعه ذهنك وأنت نائم. أنت لا تختاره — إنه يأتي وحده.',
    bullets: [
      'بعض الأحلام مضحكة.',
      'بعضها مخيف، لكنه لا يستطيع أن يؤذيك.',
      'حين تستيقظ، تذهب الأحلام غالبًا.',
    ],
  },
  idioms: [
    { phrase: 'حلم تحقّق', meaning: 'أمنية طال انتظارها وقد صارت حقيقة.' },
    { phrase: 'أحلام اليقظة', meaning: 'تخيّلات في ساعات الصحو.' },
    { phrase: 'في عالم الأحلام', meaning: 'بعيد عن الواقع.' },
    { phrase: 'أحلام سعيدة', meaning: 'تمنّي ليلة هادئة للنائم.' },
  ],
};

Object.assign(window, { DATA_EN, DATA_HE, DATA_AR });
