/**
 * Shade Slider — synonym intensity ordering game content.
 *
 * Each round shows 5 near-synonyms scrambled. The player taps them in
 * order from mildest to most intense. Teaches the thing learners crave
 * most: nuance. The difference between "content" and "ecstatic".
 *
 * Order is canonical: index 0 = mildest, index 4 = most intense.
 */

export type ShadeSliderRound = {
  /** What is being graded — for the prompt eyebrow.
   *  e.g. "happiness", "anger", "size". Plain English. */
  axis: string;
  /** Five synonyms in CANONICAL order: 0 = mildest, 4 = strongest.
   *  Displayed scrambled to the player. */
  ladder: [string, string, string, string, string];
  /** Reveal line shown after the round. ≤180 chars. */
  story: string;
};

const SHADE_SLIDER_ROUNDS_EN: ShadeSliderRound[] = [
  {
    axis: "happiness",
    ladder: ["content", "pleased", "glad", "joyful", "ecstatic"],
    story: "Content is quiet satisfaction. Ecstatic is overflowing. The ladder between them is what makes writing land.",
  },
  {
    axis: "anger",
    ladder: ["annoyed", "irritated", "angry", "furious", "livid"],
    story: "Annoyed wears off in minutes. Livid leaves a mark. Picking the right rung makes the difference between a complaint and a scene.",
  },
  {
    axis: "sadness",
    ladder: ["down", "glum", "sad", "miserable", "devastated"],
    story: "Down is having a low day. Devastated is a life event. Knowing where you are on the ladder is half of telling someone you need help.",
  },
  {
    axis: "hunger",
    ladder: ["peckish", "hungry", "starving", "famished", "ravenous"],
    story: "Peckish is a snack will do. Ravenous is eat the menu. English packs surprisingly precise calibration for one biological state.",
  },
  {
    axis: "tiredness",
    ladder: ["drowsy", "tired", "exhausted", "drained", "spent"],
    story: "Drowsy = couch nap. Spent = ran out of fuel. The ladder doubles as a self-check — where am I really at right now?",
  },
  {
    axis: "size (large)",
    ladder: ["sizable", "big", "large", "huge", "enormous"],
    story: "All five mean 'bigger than average', but writers and salespeople pick carefully. Enormous makes you imagine; big makes you nod.",
  },
  {
    axis: "size (small)",
    ladder: ["small", "tiny", "minute", "miniscule", "microscopic"],
    story: "Small fits in a hand. Microscopic needs a lens. The ladder is finer at the bottom because tiny things have lots of varieties.",
  },
  {
    axis: "heat",
    ladder: ["warm", "hot", "boiling", "scorching", "blistering"],
    story: "Warm invites you in. Blistering makes you reconsider going outside. Weather forecasters earn their salaries picking the right rung.",
  },
  {
    axis: "cold",
    ladder: ["cool", "chilly", "cold", "freezing", "arctic"],
    story: "Cool is welcome on a hot day. Arctic is the kind of cold that hurts. Five rungs because we need them — humans care a lot about cold.",
  },
  {
    axis: "beauty",
    ladder: ["cute", "pretty", "beautiful", "gorgeous", "stunning"],
    story: "Cute is friendly. Stunning stops the room. The ladder is also a register — choose by occasion, not just intensity.",
  },
  {
    axis: "intelligence",
    ladder: ["clever", "smart", "bright", "brilliant", "genius"],
    story: "Clever solves the puzzle. Genius designs new puzzles. The middle rungs (smart, bright) are the most contested compliments.",
  },
  {
    axis: "speed (fast)",
    ladder: ["quick", "fast", "speedy", "rapid", "blazing"],
    story: "Quick is short. Blazing is sustained. Sportscasters and tech demos burn through this ladder faster than any other.",
  },
  {
    axis: "fear",
    ladder: ["nervous", "worried", "scared", "terrified", "petrified"],
    story: "Nervous is butterflies. Petrified is locked in place. Literally — petrified means turned to stone. The ladder doubles as a body cue.",
  },
  {
    axis: "surprise",
    ladder: ["surprised", "astonished", "amazed", "stunned", "flabbergasted"],
    story: "Surprised raises an eyebrow. Flabbergasted means actual jaw-drop. English borrows from Latin, Greek, and pure 1700s nonsense.",
  },
  {
    axis: "quality (good)",
    ladder: ["fine", "good", "great", "excellent", "outstanding"],
    story: "Fine is acceptable. Outstanding wins awards. School report cards live entirely on this ladder, ranked carefully by anxious teachers.",
  },
  {
    axis: "quality (bad)",
    ladder: ["subpar", "bad", "terrible", "awful", "horrendous"],
    story: "Subpar means below average. Horrendous means I need to go lie down. Movie reviewers depend on the lower rungs.",
  },
  {
    axis: "wetness",
    ladder: ["damp", "wet", "soaked", "drenched", "saturated"],
    story: "Damp is towel territory. Saturated cannot hold another drop. Each rung is calibrated to one notch more water than the last.",
  },
  {
    axis: "dirtiness",
    ladder: ["grubby", "dirty", "filthy", "grimy", "squalid"],
    story: "Grubby is kid-hands. Squalid is a public health concern. The middle rungs blur — say filthy or grimy and you'll spark a debate.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew has rich synonym ladders. Same as English, the magic is in
// the gradient — שמח is one notch, מתפעם is at the peak. Each ladder
// teaches register and intensity together.
const SHADE_SLIDER_ROUNDS_HE: ShadeSliderRound[] = [
  {
    axis: "שמחה",
    ladder: ["מרוצה", "שמח", "צוהל", "מאושר", "מתפעם"],
    story: "מרוצה זה מרוצה. מתפעם זה גופני, חיצוני, על-גדותיו. ההפרש בין רמות זה ההפרש בין סיפור חיים לאירוע אחד.",
  },
  {
    axis: "כעס",
    ladder: ["מצוברח", "רגוז", "כועס", "זועם", "משתולל"],
    story: "מצוברח זה לרגע. משתולל זה אופציה לאשפוז. עברית עשירה במונחי כעס כי תרבות המקרא תיעדה אותם בקפידה.",
  },
  {
    axis: "צער",
    ladder: ["עצוב", "מצוברח", "מדוכא", "אומלל", "שבור"],
    story: "עצוב זה רגש שבא והולך. שבור זה שלמות שאיבדה את התפר. עברית מכבדת את הצער בלא מעט רמות.",
  },
  {
    axis: "רעב",
    ladder: ["חצי שבע", "רעב", "רעב מאוד", "גווע", "מורעב"],
    story: "מורעב הוא רעב כרוני, מצב גוף ולא תחושה. גווע זה תקופת רעב או רגע פיזיולוגי. עברית מבדילה ביניהם.",
  },
  {
    axis: "עייפות",
    ladder: ["מנומנם", "עייף", "מותש", "תשוש", "שבור"],
    story: "מנומנם זה מעט שינה חסרה. שבור זה הגוף נכנע. בכל רגע אנחנו על אחת מהמדרגות, אבל לא תמיד שמים לב.",
  },
  {
    axis: "גודל (גדול)",
    ladder: ["לא קטן", "גדול", "ענק", "עצום", "מפלצתי"],
    story: "כל המילים כאן אומרות 'גדול מהרגיל'. מפלצתי כבר רומז שזה גדול עד כדי הפרעה. הסקלה הזו מעוצבת על-ידי המעצב.",
  },
  {
    axis: "חום",
    ladder: ["נעים", "חם", "לוהט", "רותח", "מתלקח"],
    story: "נעים זה רעיון של חוף. מתלקח כבר במצב סכנת בריאות. המילים האלה גם פיזיות גם מטאפוריות (וויכוח לוהט/רותח).",
  },
  {
    axis: "קור",
    ladder: ["צונן", "קריר", "קר", "קופא", "מקפיא"],
    story: "צונן זה משקה. מקפיא זה כפור. הזוג קר/קופא הוא הקלאסי, אבל קופא יותר אישי (אני קופא), מקפיא חיצוני (מזג אוויר).",
  },
  {
    axis: "יופי",
    ladder: ["נחמד", "יפה", "יפהפה", "מהמם", "עוצר נשימה"],
    story: "נחמד זה מחמאה זהירה. עוצר נשימה זה תיאור פיזיולוגי שהמילה הפכה להיות שגרתית. ככל שעולים, הקומפלימנט הופך לתיאור.",
  },
  {
    axis: "תבונה",
    ladder: ["נבון", "חכם", "מבריק", "גאון", "גאון על-טבעי"],
    story: "נבון זה בעל שיקול דעת. גאון על-טבעי זה דרישת שלום ליצירתיות אכזרית. עברית מאפשרת ניואנסים עדינים.",
  },
  {
    axis: "מהירות",
    ladder: ["מתון", "מהיר", "זריז", "דוהר", "מהיר ברק"],
    story: "מתון זה איטי במכוון. מהיר ברק זה מילה מעלה רף. במציאות אנחנו רוב הזמן בין מהיר לזריז ולא יודעים מאיפה הקצב עולה.",
  },
  {
    axis: "פחד",
    ladder: ["מחושש", "מודאג", "מפחד", "מבועת", "משותק"],
    story: "מחושש זה בלב. משותק זה בגוף — פחד עוצר את היכולת להזיז שריר. עברית מקראית הכירה את הקשת הזו היטב.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic synonym ladders. Each axis has 5 words from soft to intense.
// MSA registers vary: راضٍ is gentle, مغمور بالفرح is poetic. Each
// ladder teaches register as much as intensity.
const SHADE_SLIDER_ROUNDS_AR: ShadeSliderRound[] = [
  {
    axis: "الفرح",
    ladder: ["راضٍ", "مسرور", "فرحان", "مبتهج", "نشوان"],
    story: "راضٍ تعبير هادئ. نشوان تعبير غامر، شبه شعريّ. السلّم بين الرضى والنشوة يصف عمق التجربة العاطفية.",
  },
  {
    axis: "الغضب",
    ladder: ["منزعج", "غاضب", "ساخط", "ثائر", "هائج"],
    story: "منزعج خفيف. هائج يصف من فقد السيطرة. اللغة العربية تميّز بدقّة بين درجات الغضب الإنساني.",
  },
  {
    axis: "الحزن",
    ladder: ["مهموم", "حزين", "كئيب", "بائس", "محطّم"],
    story: "مهموم يفكّر بشيء. محطّم انكسرت روحه. السلّم يصف رحلة من الانشغال إلى الانهيار النفسي.",
  },
  {
    axis: "الجوع",
    ladder: ["شَهيّ", "جائع", "جوعان", "ضارب من الجوع", "مَيت من الجوع"],
    story: "شَهيّ ملمح للأكل. مَيت من الجوع مبالغة معروفة. العربية تمتلك تدرّجًا غنيًّا لحالة بيولوجية واحدة.",
  },
  {
    axis: "التعب",
    ladder: ["نَعِس", "متعب", "مُنهَك", "مَكدود", "مُحطَّم"],
    story: "نَعِس يحتاج قيلولة. مُحطَّم يحتاج راحة طويلة. السلّم يساعدك على معرفة أين أنت من نفسك الآن.",
  },
  {
    axis: "الحجم الكبير",
    ladder: ["لا بأس به", "كبير", "ضخم", "هائل", "خرافي"],
    story: "لا بأس به أكبر من المتوسط. خرافي يتجاوز الوصف. كلّ درجة تعكس مدى انطباع المتكلّم.",
  },
  {
    axis: "الحرارة",
    ladder: ["دافئ", "حار", "حارق", "كاوٍ", "ملتهب"],
    story: "دافئ مريح. ملتهب خطر. اللغة العربية، لغة الصحراء، تمتلك معجمًا غنيًّا لدرجات الحرارة.",
  },
  {
    axis: "البرودة",
    ladder: ["بارد", "قارس", "متجمّد", "جليديّ", "قطبيّ"],
    story: "بارد عادي. قطبيّ يصف برد القطب الشمالي. كلمات قويّة من لغة لم تعرف الجليد كثيرًا قبل العصر الحديث.",
  },
  {
    axis: "الجمال",
    ladder: ["لطيف", "جميل", "بهيّ", "فاتن", "خلّاب"],
    story: "لطيف مديح متواضع. خلّاب يأخذ الأنفاس. السلّم الذي يفصل بين المجاملة العابرة والإعجاب الحقيقي.",
  },
  {
    axis: "الذكاء",
    ladder: ["فطن", "ذكي", "بارع", "لامع", "عبقري"],
    story: "فطن يلتقط الأمور بسرعة. عبقري يبتكر ما لم يُبتكَر. السلّم لا يقيس فقط الذكاء بل الإبداع.",
  },
];

const ROUNDS_BY_LANG: Record<string, ShadeSliderRound[]> = {
  en: SHADE_SLIDER_ROUNDS_EN,
  he: SHADE_SLIDER_ROUNDS_HE,
  ar: SHADE_SLIDER_ROUNDS_AR,
};

export function pickShadeSliderRounds(
  count: number,
  lang: string = "en",
): { rounds: ShadeSliderRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
