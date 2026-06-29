/**
 * Idiom Decoder — literal-vs-figurative idiom game content.
 *
 * Each round shows a LITERAL description of an idiom — what the words
 * actually say if you took them at face value — and four options for
 * the real figurative meaning.
 *
 * Text-only V1. V2 will replace the literal descriptions with AI-
 * generated images of the literal scene (the original "AI Image Decoder"
 * pitch). For now the text alone is funny enough to land the joke.
 */

export type IdiomDecoderRound = {
  /** The actual idiom (revealed after the round). */
  idiom: string;
  /** Literal description of what the words SAY, not what they mean.
   *  This is the "AI image, but in text" — should be visual and slightly
   *  absurd. ≤140 chars. */
  literal: string;
  /** Four candidate figurative meanings. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the actual meaning. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal explaining the origin or surprising fact. ≤180 chars. */
  story: string;
};

const IDIOM_DECODER_ROUNDS_EN: IdiomDecoderRound[] = [
  {
    idiom: "spill the beans",
    literal: "Someone tips a glass jar of dried beans onto the floor. Beans bounce everywhere. They cannot be quietly put back.",
    options: [
      "accidentally reveal a secret",
      "make a mess of dinner",
      "spend all your savings",
      "leave without paying",
    ],
    correctIdx: 0,
    story: "From ancient Greek voting — beans were dropped into jars to vote yes or no. A toppled jar revealed the count too early.",
  },
  {
    idiom: "kick the bucket",
    literal: "A person stands on an upturned bucket. They kick the bucket out from under their own feet.",
    options: [
      "to die",
      "to give up on a plan",
      "to start a fight",
      "to leave a job suddenly",
    ],
    correctIdx: 0,
    story: "Disputed origin — possibly from slaughterhouses (a beam called a bucket from which animals were hung). Dark, but the phrase outlived the practice.",
  },
  {
    idiom: "let the cat out of the bag",
    literal: "A merchant unties a sack at the market. A cat leaps out and runs away. People laugh.",
    options: [
      "to escape a difficult situation",
      "to reveal a secret",
      "to start a wild adventure",
      "to make a quick decision",
    ],
    correctIdx: 1,
    story: "Medieval markets: dishonest traders sold sacks claiming a piglet inside, but really a cat. Untying revealed the fraud — and the cat fled.",
  },
  {
    idiom: "break the ice",
    literal: "Two heavy ships ram their way through a frozen river. Ice cracks and splinters in front of them.",
    options: [
      "to escape a frozen situation",
      "to fail a difficult test",
      "to start a friendly conversation",
      "to lose your temper publicly",
    ],
    correctIdx: 2,
    story: "Originally maritime: small icebreaker ships cleared paths for trade vessels. The social meaning is a polite metaphor for clearing a frozen room.",
  },
  {
    idiom: "bite the bullet",
    literal: "A soldier clamps their teeth around a real lead bullet. Their hands grip a piece of wood. They do not flinch.",
    options: [
      "to fight back unexpectedly",
      "to face something difficult head-on",
      "to refuse to give up information",
      "to make a costly mistake",
    ],
    correctIdx: 1,
    story: "From battlefield surgery before anaesthesia. Soldiers bit a lead bullet to brace against pain during operations. Acceptance, not avoidance.",
  },
  {
    idiom: "throw in the towel",
    literal: "A boxing coach hurls a white towel into the ring. The fighter slumps. The crowd understands instantly.",
    options: [
      "to start a fight",
      "to clean up a mess",
      "to ask for a pause",
      "to give up",
    ],
    correctIdx: 3,
    story: "Boxing tradition since the 1800s. A cornerman throws a towel to stop the match if the fighter cannot continue. Cleaner than throwing the fighter.",
  },
  {
    idiom: "barking up the wrong tree",
    literal: "A dog stands at the base of an oak tree, barking furiously at the leaves. The squirrel is two trees away.",
    options: [
      "to make a noise about nothing",
      "to be pursuing the wrong path",
      "to follow a stranger home",
      "to refuse to listen to advice",
    ],
    correctIdx: 1,
    story: "From 1800s American hunting. Hounds tracked prey up trees, but sometimes barked at the wrong one. Lots of effort, completely wrong target.",
  },
  {
    idiom: "piece of cake",
    literal: "A small slice of birthday cake sits on a plate. Easy to pick up. Easy to eat. Nobody is challenged.",
    options: [
      "a delicious reward",
      "a clever trick",
      "very easy",
      "an unimportant detail",
    ],
    correctIdx: 2,
    story: "Coined in 1930s American slang. From the 19th-century 'cakewalk' dance contests — easy prizes for a kind of effort that barely counted as work.",
  },
  {
    idiom: "cost an arm and a leg",
    literal: "A merchant points at a price tag. A customer reaches into their sleeve and detaches an arm. The merchant nods.",
    options: [
      "to require dangerous work",
      "to be extremely expensive",
      "to need many helpers",
      "to take a very long time",
    ],
    correctIdx: 1,
    story: "Possibly from 19th-century portrait painters charging more for full-body poses (arms and legs cost extra). The hyperbole stuck; the portraits did not.",
  },
  {
    idiom: "hit the nail on the head",
    literal: "A carpenter swings a hammer. The nail goes in straight, perfectly aligned, no bent metal, no thumb injuries.",
    options: [
      "to fix a difficult problem",
      "to start a brand new project",
      "to be exactly right about something",
      "to work quickly under pressure",
    ],
    correctIdx: 2,
    story: "Carpentry metaphor for precision. Used since at least the 1400s in English. A bent nail means rework; a clean strike means understanding.",
  },
  {
    idiom: "the ball is in your court",
    literal: "A tennis ball bounces twice on your side of the net. The other player stands still, hands on hips. Waiting.",
    options: [
      "you are about to lose",
      "you have an advantage",
      "it is your turn to act",
      "someone is angry at you",
    ],
    correctIdx: 2,
    story: "From tennis. The other side has done their part — the decision and the next move are now entirely yours. A polite way to say: well?",
  },
  {
    idiom: "under the weather",
    literal: "A sailor sits below deck during a storm. The ship pitches. Their face is the colour of an unripe banana.",
    options: [
      "feeling slightly unwell",
      "being lost at sea",
      "facing bad luck for a while",
      "hiding from authorities",
    ],
    correctIdx: 0,
    story: "Maritime origin. Seasick sailors were sent below deck (literally under the weather affecting the ship) to recover. Mild illness, no urgency.",
  },
  {
    idiom: "burn the midnight oil",
    literal: "Someone hunches over a desk past midnight. An oil lamp burns down to a stub. Papers everywhere.",
    options: [
      "to waste time on hobbies",
      "to work very late at night",
      "to celebrate a victory",
      "to argue with a partner",
    ],
    correctIdx: 1,
    story: "Pre-electricity, oil lamps were how you worked after dark. Burning the midnight oil meant working seriously late. The phrase outlived the lamps.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew idioms cover 3,000 years — from the Tanakh through the
// Talmud to modern slang. The literal description is the funny part;
// the real meaning is often surprising even for native speakers.
const IDIOM_DECODER_ROUNDS_HE: IdiomDecoderRound[] = [
  {
    idiom: "ירד לטמיון",
    literal: "מישהו מחפש אוצר, מוצא רק קופה ריקה. המטמון שהיה שם בעבר נעלם לחלוטין.",
    options: [
      "התעשר במהירות",
      "אבד או הלך לאיבוד לגמרי",
      "מצא משהו יקר",
      "התעייף מהמסע",
    ],
    correctIdx: 1,
    story: "טמיון = מטמון או קופת מלך ביוונית-לטינית. 'ירד לטמיון' = ירד אל הקופה שכבר ריקה. הביטוי מקראי-תלמודי.",
  },
  {
    idiom: "נפל בפח",
    literal: "אדם הולך בשדה ונופל לתוך גומה עמוקה שצדים בה חיות. נשאר תקוע ומאוכזב.",
    options: [
      "מצא הזדמנות עסקית",
      "התרגל לסביבה חדשה",
      "נכנס למלכודת או נרמה",
      "הצליח אחרי מאמצים",
    ],
    correctIdx: 2,
    story: "מתוך תהלים: 'הצדיק לא יִפֹּל בפח'. פח כאן = מלכודת לציפורים. מילולית 3,000 שנה לפני 'נפל בפח' המודרני.",
  },
  {
    idiom: "שבר את הראש",
    literal: "אדם יושב מעל ספר עבה, נושך את ציפורניו, מנער את ראשו עד שצוואר כואב. שעות עוברות.",
    options: [
      "התרגז במיוחד",
      "חשב מאוד קשה על משהו",
      "אבד את ההכרה",
      "סיים תרגיל גופני",
    ],
    correctIdx: 1,
    story: "ביטוי תלמודי. גם בארמית: 'תבר רישא' (לשבור ראש = לחשוב). בעברית מודרנית עוצמת המאמץ מהדהדת מהמילה 'שבר'.",
  },
  {
    idiom: "אכל את הכובע",
    literal: "אדם תוקע את הכובע שלו לתוך הפה ולועס. סביבו אנשים מסתכלים בהפתעה.",
    options: [
      "התחרט קשה על טעות",
      "אכל ארוחה גדולה",
      "התלבש בצורה משונה",
      "התנהג בחוסר נימוס",
    ],
    correctIdx: 0,
    story: "תרגום מאנגלית 'eat one's hat', ביטוי מהמאה ה-19. בעברית מודרנית, מודה בטעות חמורה, מבטא חרטה.",
  },
  {
    idiom: "תפס את השור בקרניו",
    literal: "אדם רץ אל שור גדול וכועס, אוחז ישירות בקרניים. ללא חשש, ללא היסוס.",
    options: [
      "ברח ממצב מסוכן",
      "התעמת ישירות עם הבעיה",
      "ניסה לשכנע באמצעות שיחה",
      "התבייש להתחיל משימה",
    ],
    correctIdx: 1,
    story: "ביטוי לטיני 'tauros prendere cornibus'. בכל השפות אומר אותו דבר: מתמודד באומץ עם הקשה ביותר במצב.",
  },
  {
    idiom: "פתח דלת חדשה",
    literal: "אדם עומד מול קיר. פתאום מופיעה דלת במקום שלא הייתה. הוא פותח ונכנס למקום חדש לגמרי.",
    options: [
      "מצא הזדמנות או פתרון",
      "נכנס לבית של מישהו",
      "התחיל לבנות בית",
      "סיים פרויקט קודם",
    ],
    correctIdx: 0,
    story: "ביטוי מודרני, חידוש עברי. השתרש לאחרונה בעקבות תהליכי שינוי קריירה ויזמות בישראל של המאה ה-21.",
  },
  {
    idiom: "נגע ללב",
    literal: "מסר או מילה עוברים מהאוויר ישירות אל הלב. הלב מגיב, רוקד, מתפעם.",
    options: [
      "הזיק לבריאות",
      "עורר רגש חזק",
      "פגע פיזית",
      "גרם להתעלפות",
    ],
    correctIdx: 1,
    story: "ביטוי קלאסי, תרגום של 'touch the heart'. אבל גם בעברית עתיקה הלב היה מקור הרגש (לבי מתחמם, לבי בוכה).",
  },
  {
    idiom: "פתח את הפה",
    literal: "אדם פותח את הפה בצורה דרמטית, נראה כאילו עומד לבלוע משהו ענקי. או לדבר.",
    options: [
      "אכל ארוחה",
      "התחיל לזמר",
      "אמר משהו שלא היה צריך לומר",
      "צעק מכאב",
    ],
    correctIdx: 2,
    story: "ביטוי שלילי בעברית. 'פתח את הפה' = דיבר כשלא היה צריך. הקשור בקרוב ל'סתום את הפה'. רגיש לקונטקסט.",
  },
  {
    idiom: "טס באוויר",
    literal: "אדם רץ במהירות כל כך גדולה שרגליו לא נוגעות באדמה. הוא ממש טס כמו ציפור.",
    options: [
      "התעלף מסחרחורת",
      "רץ ונסע מהר מאוד",
      "הגיע לטיסה",
      "ראה חלום",
    ],
    correctIdx: 1,
    story: "ביטוי מודרני. בעברית המודרנית 'טס' = רץ במהירות גבוהה. גם 'טס במכונית', 'טס למסיבה' = מגיע מהר.",
  },
  {
    idiom: "אבד עליו הכלח",
    literal: "אדם זקן רואה כלי עבודה שהיה בשימוש לפני שבעים שנה. הכלי עדיין שלם אבל כבר אין מי שיכיר אותו.",
    options: [
      "נשבר ולא ניתן לתיקון",
      "התיישן, איבד מהרלוונטיות",
      "נמכר במחיר גבוה",
      "נגנב מהבית",
    ],
    correctIdx: 1,
    story: "מקראי. כלח = זקנה, יום החיים בסוף. 'אבד עליו הכלח' = הזמן עבר עליו, אינו רלוונטי. תרגום נוסטלגי לאלגנטית.",
  },
  {
    idiom: "מקרי לחלוטין",
    literal: "אדם הולך ברחוב, ופוגש בדיוק את האדם שעליו דיבר אתמול. שני הצדדים נדהמים מהמקריות הענקית.",
    options: [
      "תוצאה של תכנון",
      "אירוע צפוי מראש",
      "צירוף מקרים מיוחד",
      "תוצאה של חוקים",
    ],
    correctIdx: 2,
    story: "ביטוי שגרתי. בעברית 'מקרי' = ללא תכנון. ההפך מ'מתוכנן' או 'מכוון'. ביטוי מודרני שדגל ב'יד המקרה'.",
  },
  {
    idiom: "הרים את הראש",
    literal: "אדם שהיה מכופף שנים, פתאום מזדקף ומבליט את הראש בגאווה. הוא מסתכל לעולם בעיניים.",
    options: [
      "התעורר מהשינה",
      "התמרד נגד דיכוי",
      "התחיל לתת עצות",
      "הצליח לעלות בדרגה",
    ],
    correctIdx: 1,
    story: "מקראי וגם מודרני. 'נשא ראשו' מציין שחרור משעבוד או דיכוי. בעברית של היום: שינוי גורף במצב נחיתות.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic idioms span 1500 years — from the Jahiliyya through the
// Quran to modern colloquial expressions. The literal description is
// the funny part; the figurative meaning is often surprising.
const IDIOM_DECODER_ROUNDS_AR: IdiomDecoderRound[] = [
  {
    idiom: "ضرَب عُصفورين بحجرٍ واحد",
    literal: "شخص يرمي حجرًا واحدًا فيُصيب عُصفورين في الهواء. مهارة عالية، تخطيط دقيق، ابتسامة رضى.",
    options: [
      "حلّ مشكلتين في وقتٍ واحد",
      "ارتكب جريمة مزدوجة",
      "فقد فرصةً ذهبية",
      "حصل على هدفه بصعوبة",
    ],
    correctIdx: 0,
    story: "مثل عربي قديم منتشر في كثير من اللغات. يدلّ على الإنجاز المزدوج بجهدٍ واحد، أو الكفاءة في توفير الوقت.",
  },
  {
    idiom: "في الفم سَمَكة وفي اليد عصفور",
    literal: "إنسان يحمل عصفورًا حيًّا بإحدى يديه، فمه مفتوح يخرج منه ذيل سَمَكة. صورة غريبة لكنّها واضحة.",
    options: [
      "تَعدُّد المشاكل",
      "الواقع المتاح أفضل من المحتمل",
      "الجشع الذي يَهدم",
      "الذكاء في الصيد",
    ],
    correctIdx: 1,
    story: "النسخة العربية لمثل عالمي. عصفور في اليد خير من عشرة على الشجرة. المؤكَّد دائمًا أفضل من المحتمل.",
  },
  {
    idiom: "بلَغ السكين الحَلْق",
    literal: "شخص يحمل سكينًا إلى رقبته الخاصة، الشفرة تلامس الجلد، النفَس يحتبس. اللحظة الفاصلة.",
    options: [
      "وصل إلى حدّ لا يُحتمل",
      "بدأ معركة جديدة",
      "أصابه مرض خطير",
      "أعدّ وَجبة دسمة",
    ],
    correctIdx: 0,
    story: "تعبير قديم عن نفاد الصبر أو بلوغ الذروة المُؤلمة. يشير إلى لحظة لا يمكن تجاوزها دون انفجار.",
  },
  {
    idiom: "خرج من المولد بلا حُمَّص",
    literal: "زائر يخرج من احتفال مزدحم. الناس حوله يحملون أكياسًا مليئة بالحلوى والحُمَّص. هو وحده فارغ اليدين.",
    options: [
      "فاز بكلّ ما رغب",
      "غادر دون تحقيق هدفه",
      "ارتكب خطأ في المكان",
      "وجد ضالّته أخيرًا",
    ],
    correctIdx: 1,
    story: "مثل مصري الأصل انتشر عربيًّا. الموالد كانت احتفالات تُوزَّع فيها الحلوى. مَن لم يحصل على نصيبه عاد خائبًا.",
  },
  {
    idiom: "أحرّ من الجَمر",
    literal: "أحدهم يجلس فوق جمر مُتّقد لون أحمر. ينتظر شيئًا بفارغ الصبر، الحرارة تُؤذيه ولا يقدر على الانتقال.",
    options: [
      "غاضب جدًّا",
      "في موضع مهم",
      "ينتظر بقلق شديد",
      "يطبخ طعامًا حارًّا",
    ],
    correctIdx: 2,
    story: "تعبير قديم عن الانتظار المؤلم. الجمر رمز للحرارة المستمرّة. مَن ينتظر خبرًا يشعر بأن المقعد يحرقه.",
  },
  {
    idiom: "تحت الحزام",
    literal: "ملاكم يُسدّد ضربة إلى منطقة محظورة من جسم خصمه، تحت الحزام. الحَكَم يُشير إلى المخالفة. الجمهور يَعترض.",
    options: [
      "ضربة قويّة جدًّا",
      "هجوم غير شريف",
      "إصابة خطيرة",
      "تدريب صحيح",
    ],
    correctIdx: 1,
    story: "من قواعد الملاكمة الحديثة. الضرب تحت الحزام محرّم رياضيًّا. أُسقِطت الدلالة على أيّ كلام أو فعل غير عادل.",
  },
  {
    idiom: "ضَرَب أخماسًا في أسداس",
    literal: "شخص يحسب أرقامًا في رأسه. خمسة ضرب ستة، ثم ستة ضرب خمسة. يعود ويغيّر، يعود ويغيّر. لا يستقرّ على رأي.",
    options: [
      "أتقن الرياضيات",
      "تردّد بين قرارات مختلفة",
      "أحسن الحساب التجاري",
      "أعدّ خطّة كبيرة",
    ],
    correctIdx: 1,
    story: "مثل قديم عن التردّد والحَيرة. الأخماس والأسداس رمز للأرقام المتشابكة. مَن يَحسبها يكشف عن تشتُّت ذهني.",
  },
  {
    idiom: "ليس كلّ ما يَلمَع ذهبًا",
    literal: "شخص يَلتقط حصاةً تَلمَع تحت الشمس. ينظر إليها معتقدًا أنّها قطعة ذهب. بعد لحظة يكتشف أنّها زجاج فقط.",
    options: [
      "المظاهر قد تخدع",
      "الذهب نادر جدًّا",
      "علم الجيولوجيا صعب",
      "الشمس تُغيّر الألوان",
    ],
    correctIdx: 0,
    story: "مثل عالميّ بصيغة عربيّة. اللمعان ليس دليلًا على الجوهر. تَطلَب التَدقيق قبل اتّخاذ القرارات.",
  },
  {
    idiom: "يَدُه في القُلوب",
    literal: "إنسان يمدّ يده ويُخرج قلب رجلٍ من صدره. يدور بها، يضمّها. الرجل يبتسم لا يتألّم. صورة خياليّة.",
    options: [
      "محبوب من كلّ الناس",
      "يُحدث جروحًا عاطفية",
      "ماهر في الجراحة",
      "خبير في علم النفس",
    ],
    correctIdx: 0,
    story: "تعبير عن المحبوبيّة العميقة. مَن يَدُه في القلوب يعني أنّ الناس يَفتحون له قلوبهم طوعًا. مكانة لا تُشترى.",
  },
  {
    idiom: "زَرَع الشُّكوك",
    literal: "شخص يُسير بالحديقة ويُسقِط بذورًا صغيرة سوداء. لا أحد يَلاحظه. مع الأيّام تنبت نباتات شائكة تَخنق الأشجار.",
    options: [
      "أصبح بستانيًّا متقنًا",
      "أَوقع الناس في حيرة وريبة",
      "اكتشف مؤامرة قديمة",
      "بنى علاقات قويّة",
    ],
    correctIdx: 1,
    story: "تعبير حديث نسبيًّا. زَرع الشُّكوك = نشر الشّبهات في عقول الآخرين. النيّة عادةً سيّئة، النتيجة تفكيك العلاقات.",
  },
];

const ROUNDS_BY_LANG: Record<string, IdiomDecoderRound[]> = {
  en: IDIOM_DECODER_ROUNDS_EN,
  he: IDIOM_DECODER_ROUNDS_HE,
  ar: IDIOM_DECODER_ROUNDS_AR,
};

export function pickIdiomDecoderRounds(
  count: number,
  lang: string = "en",
): { rounds: IdiomDecoderRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
