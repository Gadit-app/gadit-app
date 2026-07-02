/**
 * Twin Trap — confusable word pairs curated content.
 *
 * Each round shows a sentence with one word missing and two confusable
 * options. Pick the right one. Reveal explains the difference.
 *
 * Per-language content: this game is fundamentally about the language
 * the player is learning, so each UI language gets its own native
 * confusable set. Hebrew speakers see Hebrew confusables (של/שאל),
 * Arabic speakers see Arabic confusables, etc. If we don't have content
 * for a UI language, we fall back to English (better than nothing).
 *
 * Why curated: confusables are a closed set of well-known pairs.
 * Generating them at runtime via OpenAI would (a) cost money per play,
 * (b) risk inconsistent quality, (c) sometimes invent fake pairs.
 */

export type TwinTrapRound = {
  /** The sentence with `____` where one of the two options goes. */
  sentence: string;
  /** Always two options. The order shown is randomised per round. */
  options: [string, string];
  /** Index 0 or 1 — which option is the correct one. */
  correctIdx: 0 | 1;
  /** One-sentence explanation shown on reveal. ≤120 chars. */
  explain: string;
};

// ─── English content ───────────────────────────────────────────
const TWIN_TRAP_ROUNDS_EN: TwinTrapRound[] = [
  // ─── Effect / Affect — the classic ──────────────────────────
  {
    sentence: "The new medicine had a strange ____ on me.",
    options: ["effect", "affect"],
    correctIdx: 0,
    explain: "Effect is the noun (a result). Affect is the verb (to influence).",
  },
  {
    sentence: "How will this decision ____ our plans?",
    options: ["effect", "affect"],
    correctIdx: 1,
    explain: "Affect = verb (to act on). Effect = noun (the result).",
  },

  // ─── Their / There / They're — pick any two per round ──────
  {
    sentence: "I think ____ going to be late.",
    options: ["their", "they're"],
    correctIdx: 1,
    explain: "They're = they are. Their = belonging to them.",
  },
  {
    sentence: "Have you seen ____ new car?",
    options: ["their", "there"],
    correctIdx: 0,
    explain: "Their shows possession. There is a place or filler word.",
  },
  {
    sentence: "Look over ____ by the door.",
    options: ["there", "their"],
    correctIdx: 0,
    explain: "There points to a place. Their belongs to someone.",
  },

  // ─── Its / It's ────────────────────────────────────────────
  {
    sentence: "The dog wagged ____ tail happily.",
    options: ["its", "it's"],
    correctIdx: 0,
    explain: "Its = belonging to it. It's = it is (always with the apostrophe).",
  },
  {
    sentence: "____ been raining all morning.",
    options: ["its", "it's"],
    correctIdx: 1,
    explain: "It's = it has / it is. Its (no apostrophe) means belonging to it.",
  },

  // ─── Your / You're ─────────────────────────────────────────
  {
    sentence: "I love ____ new haircut.",
    options: ["your", "you're"],
    correctIdx: 0,
    explain: "Your = belonging to you. You're = you are.",
  },
  {
    sentence: "____ going to love this movie.",
    options: ["your", "you're"],
    correctIdx: 1,
    explain: "You're = you are. Your shows what belongs to you.",
  },

  // ─── Then / Than ───────────────────────────────────────────
  {
    sentence: "She is taller ____ her brother.",
    options: ["then", "than"],
    correctIdx: 1,
    explain: "Than is for comparison. Then is about time or sequence.",
  },
  {
    sentence: "First we eat, ____ we go to the park.",
    options: ["then", "than"],
    correctIdx: 0,
    explain: "Then = next in time. Than = used to compare.",
  },

  // ─── Lose / Loose ──────────────────────────────────────────
  {
    sentence: "Be careful, you might ____ your keys.",
    options: ["lose", "loose"],
    correctIdx: 0,
    explain: "Lose = misplace (verb). Loose = not tight (adjective).",
  },
  {
    sentence: "This shirt is way too ____ on me.",
    options: ["lose", "loose"],
    correctIdx: 1,
    explain: "Loose rhymes with goose: not tight. Lose rhymes with news: to misplace.",
  },

  // ─── Accept / Except ───────────────────────────────────────
  {
    sentence: "I'll happily ____ your offer.",
    options: ["accept", "except"],
    correctIdx: 0,
    explain: "Accept = take willingly. Except = leave out / besides.",
  },
  {
    sentence: "Everyone came ____ Sara.",
    options: ["accept", "except"],
    correctIdx: 1,
    explain: "Except = excluding. Accept = receive or agree to.",
  },

  // ─── Principle / Principal ─────────────────────────────────
  {
    sentence: "Lying goes against my ____.",
    options: ["principles", "principals"],
    correctIdx: 0,
    explain: "Principle = a rule or belief. Principal = the head of a school (your pal!).",
  },
  {
    sentence: "The ____ greeted parents at the gate.",
    options: ["principle", "principal"],
    correctIdx: 1,
    explain: "Principal = the head person. Principle = a guiding rule.",
  },

  // ─── Complement / Compliment ───────────────────────────────
  {
    sentence: "She gave me a lovely ____ on my dress.",
    options: ["complement", "compliment"],
    correctIdx: 1,
    explain: "Compliment with i = nice thing said. Complement with e = something that completes.",
  },
  {
    sentence: "The wine is a perfect ____ to this meal.",
    options: ["complement", "compliment"],
    correctIdx: 0,
    explain: "Complement = completes / pairs well. Compliment = praise.",
  },

  // ─── Stationary / Stationery ───────────────────────────────
  {
    sentence: "The bus stayed ____ at the red light.",
    options: ["stationary", "stationery"],
    correctIdx: 0,
    explain: "Stationary with A = not moving. Stationery with E = paper goods (think E for envelope).",
  },
  {
    sentence: "I bought new ____ for my desk.",
    options: ["stationary", "stationery"],
    correctIdx: 1,
    explain: "Stationery (with E for envelopes) is the paper stuff. Stationary means standing still.",
  },

  // ─── Fewer / Less ──────────────────────────────────────────
  {
    sentence: "This lane is for shoppers with 10 items or ____.",
    options: ["fewer", "less"],
    correctIdx: 0,
    explain: "Fewer for things you can count. Less for things you can't (less time, less water).",
  },
  {
    sentence: "We have ____ time than I thought.",
    options: ["fewer", "less"],
    correctIdx: 1,
    explain: "Less is for uncountable things. Fewer for countable (fewer minutes, less time).",
  },

  // ─── Farther / Further ─────────────────────────────────────
  {
    sentence: "How much ____ until we get there?",
    options: ["farther", "further"],
    correctIdx: 0,
    explain: "Farther = physical distance. Further = abstract / more (further discussion).",
  },
  {
    sentence: "We need to discuss this ____ tomorrow.",
    options: ["farther", "further"],
    correctIdx: 1,
    explain: "Further is for figurative or additional. Farther is for actual distance.",
  },

  // ─── Imply / Infer ─────────────────────────────────────────
  {
    sentence: "Are you trying to ____ that I'm wrong?",
    options: ["imply", "infer"],
    correctIdx: 0,
    explain: "The speaker implies (hints). The listener infers (concludes).",
  },
  {
    sentence: "From her tone, I ____ she was annoyed.",
    options: ["imply", "infer"],
    correctIdx: 1,
    explain: "Infer = figure out from clues. Imply = hint without saying.",
  },

  // ─── Disinterested / Uninterested ──────────────────────────
  {
    sentence: "A good judge must remain ____.",
    options: ["disinterested", "uninterested"],
    correctIdx: 0,
    explain: "Disinterested = impartial (no stake). Uninterested = bored, not caring.",
  },
  {
    sentence: "He looked completely ____ in the lecture.",
    options: ["disinterested", "uninterested"],
    correctIdx: 1,
    explain: "Uninterested = doesn't care. Disinterested = neutral, unbiased.",
  },

  // ─── Discreet / Discrete ───────────────────────────────────
  {
    sentence: "She gave me a ____ nod from across the room.",
    options: ["discreet", "discrete"],
    correctIdx: 0,
    explain: "Discreet = careful, subtle. Discrete = separate, distinct.",
  },
  {
    sentence: "Break the project into ____ stages.",
    options: ["discreet", "discrete"],
    correctIdx: 1,
    explain: "Discrete = separate parts. Discreet = quietly tactful.",
  },

  // ─── Lay / Lie ─────────────────────────────────────────────
  {
    sentence: "I need to ____ down for a few minutes.",
    options: ["lay", "lie"],
    correctIdx: 1,
    explain: "Lie = recline yourself. Lay = put something else down (lay the book on the table).",
  },
  {
    sentence: "Please ____ the baby in the crib.",
    options: ["lay", "lie"],
    correctIdx: 0,
    explain: "Lay needs an object (lay something). Lie is what you do yourself.",
  },

  // ─── Who / Whom ────────────────────────────────────────────
  {
    sentence: "____ should I ask about the schedule?",
    options: ["who", "whom"],
    correctIdx: 1,
    explain: "Whom is the object (ask whom). Who is the subject (who asked?). Trick: if you'd answer 'him', use whom.",
  },
  {
    sentence: "____ left the door open?",
    options: ["who", "whom"],
    correctIdx: 0,
    explain: "Who is the subject doing the action. Whom is the object receiving it.",
  },

  // ─── Less common but classic ───────────────────────────────
  {
    sentence: "Please don't ____ the rules this time.",
    options: ["break", "brake"],
    correctIdx: 0,
    explain: "Break = damage / violate. Brake = the thing that stops a vehicle.",
  },
  {
    sentence: "He had to ____ hard to avoid the cat.",
    options: ["break", "brake"],
    correctIdx: 1,
    explain: "Brake = stop a vehicle. Break = damage or pause.",
  },

  {
    sentence: "Walk down the ____ until you see the chapel.",
    options: ["aisle", "isle"],
    correctIdx: 0,
    explain: "Aisle = walkway in a building. Isle = a small island.",
  },
  {
    sentence: "We sailed past a tiny green ____.",
    options: ["aisle", "isle"],
    correctIdx: 1,
    explain: "Isle = island. Aisle = the path between rows of seats.",
  },

  {
    sentence: "The chef carefully ____ the soup.",
    options: ["poured", "pored"],
    correctIdx: 0,
    explain: "Poured = the liquid action. Pored = studied closely (pored over a book).",
  },
  {
    sentence: "She ____ over the manuscript for hours.",
    options: ["poured", "pored"],
    correctIdx: 1,
    explain: "Pored over = examined carefully. Poured = the liquid one.",
  },
];

/** Pick N random rounds from the curated set. Used per session.
 *  Caller is responsible for randomising the displayed option order. */
// ─── Hebrew content ────────────────────────────────────────────
// Hebrew confusables: word pairs that native and advanced Hebrew
// speakers actually mix up. Focus is on (a) grammatical pairs that
// differ by one letter (של/שאל), (b) gender/number agreement
// (אחד/אחת, שני/שתי), (c) homophones that change meaning entirely.
const TWIN_TRAP_ROUNDS_HE: TwinTrapRound[] = [
  {
    sentence: "הספר הזה הוא ____ אבא שלי.",
    options: ["של", "שאל"],
    correctIdx: 0,
    explain: "של מציין שייכות. שאל הוא פועל בעבר (לבקש מידע).",
  },
  {
    sentence: "הוא ____ אותי מתי החתונה.",
    options: ["של", "שאל"],
    correctIdx: 1,
    explain: "שאל = הציג שאלה. של = שייכות.",
  },
  {
    sentence: "____ תרצה, נצא לטיול.",
    options: ["עם", "אם"],
    correctIdx: 1,
    explain: "אם פותח תנאי. עם הוא מילת יחס שמחברת לאדם או דבר.",
  },
  {
    sentence: "אני בא ____ דניאל לסרט.",
    options: ["עם", "אם"],
    correctIdx: 0,
    explain: "עם = ביחד עם. אם = תנאי או אמא.",
  },
  {
    sentence: "יש לי ילד ____ ויפה.",
    options: ["אחד", "אחת"],
    correctIdx: 0,
    explain: "אחד מתאים לזכר. ילדה אחת — לנקבה.",
  },
  {
    sentence: "יש לי ילדה ____ ויפה.",
    options: ["אחד", "אחת"],
    correctIdx: 1,
    explain: "אחת לנקבה, אחד לזכר. ההתאמה במין היא יסוד הדקדוק העברי.",
  },
  {
    sentence: "ראיתי ____ ילדים במגרש.",
    options: ["שני", "שתי"],
    correctIdx: 0,
    explain: "שני לזכר רבים. שתי לנקבה רבות. ההפרש הוא רק במין.",
  },
  {
    sentence: "פגשתי ____ נשים נחמדות.",
    options: ["שני", "שתי"],
    correctIdx: 1,
    explain: "שתי לנקבה. שני לזכר. כמו שני אחים מול שתי אחיות.",
  },
  {
    sentence: "יש על השולחן ____ ספרים.",
    options: ["שני", "שניים"],
    correctIdx: 0,
    explain: "שני בא לפני שם עצם (תואר מספר). שניים עומד לבד.",
  },
  {
    sentence: "כמה ילדים יש לכם? יש לנו ____.",
    options: ["שני", "שניים"],
    correctIdx: 1,
    explain: "שניים בא ללא שם עצם. אם היה ספר עצם היה הופך לשני.",
  },
  {
    sentence: "הוא ____ הביתה אחרי העבודה.",
    options: ["בא", "בה"],
    correctIdx: 0,
    explain: "בא = פועל הגעה. בה = מילת יחס (ב+ה), כמו בה תלינו תקווה.",
  },
  {
    sentence: "תלינו ב____ תקווה רבה.",
    options: ["בא", "בה"],
    correctIdx: 1,
    explain: "בה = בתוכה (ב + נטיית הגוף). בא = פועל ההגעה.",
  },
  {
    sentence: "תן ____ את הספר, בבקשה.",
    options: ["לי", "שלי"],
    correctIdx: 0,
    explain: "לי = אל אני. שלי = שייך לי. תן לי מול הספר שלי.",
  },
  {
    sentence: "הספר הזה הוא ____, אל תיקח.",
    options: ["לי", "שלי"],
    correctIdx: 1,
    explain: "שלי מציין בעלות. לי הוא מילת יחס שמכוונת אליי.",
  },
  {
    sentence: "____ הוא הגיע, התחלנו לאכול.",
    options: ["אז", "אש"],
    correctIdx: 0,
    explain: "אז = ציר זמן (אחר כך). אש = להבה. שתי מילים שונות לחלוטין.",
  },
  {
    sentence: "ב____ ירוקה ניזון הצמח.",
    options: ["אז", "אש"],
    correctIdx: 1,
    explain: "אש = להבה / חום. אז = מילת זמן (אז־אחרי כן). אל תתבלבל באותיות הדומות.",
  },
  {
    sentence: "ראיתי את הסרט ____ הוא נגמר.",
    options: ["לפני", "בפני"],
    correctIdx: 0,
    explain: "לפני = קודם בזמן. בפני = מול אדם או בנוכחות.",
  },
  {
    sentence: "עמדתי ____ קהל גדול והתרגשתי.",
    options: ["לפני", "בפני"],
    correctIdx: 1,
    explain: "בפני = מול / בנוכחות. לפני = קודם. שניהם נכונים אבל בהקשרים שונים.",
  },
  {
    sentence: "אני לא יודע, ולא ____ דווקא.",
    options: ["לא", "לאו"],
    correctIdx: 1,
    explain: "לאו דווקא = ביטוי קבוע. לא לבד מציין שלילה פשוטה.",
  },
  {
    sentence: "אבל לא ____ עליתי לבד, אלא עם חבר.",
    options: ["דווקא", "לאו דווקא"],
    correctIdx: 0,
    explain: "דווקא מחזק את ההפך. לאו דווקא מרכך טענה קודמת. הקשר משפטי שונה.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Modern Standard Arabic confusables. Focuses on (a) prepositional
// confusions (إلى/على, بعد/بعض), (b) homophone traps (شيء/سيء,
// مال/ماء), (c) particles that learners blur (إنّ/أنّ, متى/حتى).
const TWIN_TRAP_ROUNDS_AR: TwinTrapRound[] = [
  {
    sentence: "ذهبتُ ____ المدرسة في الصباح.",
    options: ["إلى", "على"],
    correctIdx: 0,
    explain: "إلى تشير إلى الاتجاه. على تشير إلى الموقع فوق شيء.",
  },
  {
    sentence: "وضعتُ الكتاب ____ الطاولة.",
    options: ["إلى", "على"],
    correctIdx: 1,
    explain: "على تعني فوق سطح. إلى تعني الانتقال نحو غاية.",
  },
  {
    sentence: "____ الناس يفضّلون القراءة في المساء.",
    options: ["بعد", "بعض"],
    correctIdx: 1,
    explain: "بعض = جزء من مجموع. بعد = ظرف للزمن أو المكان اللاحق.",
  },
  {
    sentence: "وصل القطار ____ ساعةٍ من الانتظار.",
    options: ["بعد", "بعض"],
    correctIdx: 0,
    explain: "بعد ظرف زمان. بعض اسم للجزء. التشابه في الكتابة يخدع الكثيرين.",
  },
  {
    sentence: "____ ستأتي إلى الحفلة؟",
    options: ["متى", "حتى"],
    correctIdx: 0,
    explain: "متى أداة استفهام عن الزمن. حتى حرف جر يعني الغاية أو الانتهاء.",
  },
  {
    sentence: "سننتظركم ____ المساء.",
    options: ["متى", "حتى"],
    correctIdx: 1,
    explain: "حتى تدل على نهاية مدة. متى تسأل عن الزمن.",
  },
  {
    sentence: "هذا ____ جميل يستحق المشاهدة.",
    options: ["شيء", "سيء"],
    correctIdx: 0,
    explain: "شيء = أيّ موجود. سيء = صفة سلبية. الفرق همزة.",
  },
  {
    sentence: "كان الفيلم ____ ولم يعجبني.",
    options: ["شيء", "سيء"],
    correctIdx: 1,
    explain: "سيء صفة الذمّ. شيء اسم محايد. الهمزة الواحدة تغيّر المعنى.",
  },
  {
    sentence: "اشتريتُ كأسًا من ____ البارد.",
    options: ["مال", "ماء"],
    correctIdx: 1,
    explain: "ماء = السائل. مال = النقود. اختلاف الهمزة عن اللام يقلب المعنى.",
  },
  {
    sentence: "لا تنفق كل ____ في يومٍ واحد.",
    options: ["مال", "ماء"],
    correctIdx: 0,
    explain: "مال يعني الثروة والنقود. ماء يعني السائل. اللام بدل الهمزة.",
  },
  {
    sentence: "قال المعلم ____ الجو جميل اليوم.",
    options: ["إنّ", "أنّ"],
    correctIdx: 0,
    explain: "إنّ تأتي في بداية الجملة، خاصة بعد قال. أنّ تأتي بعد أفعال أخرى.",
  },
  {
    sentence: "أعتقدُ ____ الامتحان سيكون سهلاً.",
    options: ["إنّ", "أنّ"],
    correctIdx: 1,
    explain: "أنّ بعد أفعال القلوب (أعتقد، أظن). إنّ بعد القول.",
  },
  {
    sentence: "أحبّ ____ الناس الطيبين.",
    options: ["كل", "كلّ"],
    correctIdx: 1,
    explain: "كلّ بالشدّة تعني جميع. كل بدونها فعل من فعل (تَعِبَ).",
  },
  {
    sentence: "____ الكتاب مكتوبٌ بخط جميل.",
    options: ["هذا", "هاذا"],
    correctIdx: 0,
    explain: "هذا الصواب. هاذا بألف خطأ شائع. اسم الإشارة بدون مد.",
  },
  {
    sentence: "الطالب ____ نجح بتفوق.",
    options: ["الذي", "اللذي"],
    correctIdx: 0,
    explain: "الذي بلام واحدة هو الصواب. اللذي بلامين خطأ إملائي.",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Russian confusables that natives AND learners trip on:
// (a) prefix/preposition pairs (одеть/надеть, занять/одолжить),
// (b) grammatical traps (тся/ться), (c) similar-sound words with
// totally different meanings (зачем/зачем-то, никогда/некогда).
const TWIN_TRAP_ROUNDS_RU: TwinTrapRound[] = [
  {
    sentence: "Утром мама помогла мне ____ свитер.",
    options: ["одеть", "надеть"],
    correctIdx: 1,
    explain: "Надеть — одежду на себя. Одеть — кого-то другого. Помнят так: надеть надежду, одеть Надежду.",
  },
  {
    sentence: "Мама должна ____ маленького брата быстро.",
    options: ["одеть", "надеть"],
    correctIdx: 0,
    explain: "Одеть — другого человека. Надеть — вещь на себя. Самая частая ошибка в русском языке.",
  },
  {
    sentence: "Можно ____ у тебя сто рублей до зарплаты?",
    options: ["занять", "одолжить"],
    correctIdx: 0,
    explain: "Занять — взять у другого. Одолжить — дать другому. Часто путают именно эту пару.",
  },
  {
    sentence: "Не мог бы ты ____ мне свой словарь?",
    options: ["занять", "одолжить"],
    correctIdx: 1,
    explain: "Одолжить — дать другому в долг. Занять — взять у другого. Запомните по адресату действия.",
  },
  {
    sentence: "Он спросил, ____ ли я знаком с этим автором.",
    options: ["вообще", "в общем"],
    correctIdx: 0,
    explain: "Вообще — наречие («совсем», «в принципе»). В общем — оборот для подведения итога.",
  },
  {
    sentence: "____, нам пора заканчивать обсуждение.",
    options: ["Вообще", "В общем"],
    correctIdx: 1,
    explain: "В общем — для итога или резюме. Вообще — указание на принцип или полноту.",
  },
  {
    sentence: "Мне ____ заниматься, я очень занят на работе.",
    options: ["никогда", "некогда"],
    correctIdx: 1,
    explain: "Некогда — нет времени. Никогда — ни разу, ни в какой момент. Разные части речи.",
  },
  {
    sentence: "Я ____ не был в Париже, очень хочу поехать.",
    options: ["никогда", "некогда"],
    correctIdx: 0,
    explain: "Никогда — отрицание во времени. Некогда — отсутствие времени для действия.",
  },
  {
    sentence: "Он ____ пишет, что забыл словари дома.",
    options: ["мне", "ко мне"],
    correctIdx: 0,
    explain: "Мне (дательный без предлога) — кому пишет. Ко мне — направление движения.",
  },
  {
    sentence: "Завтра друзья придут ____ в гости.",
    options: ["мне", "ко мне"],
    correctIdx: 1,
    explain: "Ко мне — куда придут. Мне — кому действие. Предлог меняет смысл.",
  },
  {
    sentence: "Я хочу, ____ ты пришёл вовремя.",
    options: ["что", "чтобы"],
    correctIdx: 1,
    explain: "Чтобы — союз цели или желания. Что — относительное местоимение или союз факта.",
  },
  {
    sentence: "Расскажи мне, ____ случилось вчера.",
    options: ["что", "чтобы"],
    correctIdx: 0,
    explain: "Что — для уточняющего вопроса о факте. Чтобы — для цели или желания.",
  },
  {
    sentence: "Этот ученик ____ умный, ____ и трудолюбивый.",
    options: ["тоже", "также"],
    correctIdx: 1,
    explain: "Также — дополнение в перечислении. Тоже — присоединение к уже сказанному, обычно с глаголом.",
  },
  {
    sentence: "Мой брат любит читать, и я ____ читаю каждый день.",
    options: ["тоже", "также"],
    correctIdx: 0,
    explain: "Тоже — то же самое делает другой субъект. Также — добавление к перечислению.",
  },
  {
    sentence: "Мне очень нравит____ читать русскую литературу.",
    options: ["ся", "ться"],
    correctIdx: 0,
    explain: "Нравится — что делает? — без ь. Нравиться (что делать?) — с ь. Классический тест русского правописания.",
  },
];

// ─── Kids content ──────────────────────────────────────────────
// Word pairs kids genuinely mix up at 6-12 — homophones and simple
// spelling traps rather than adult grammar edges (who/whom, comprise
// /compose). Sentences pulled from school and home life.
const TWIN_TRAP_ROUNDS_KIDS_EN: TwinTrapRound[] = [
  {
    sentence: "I want to eat ____ pizza slice.",
    options: ["their", "there"],
    correctIdx: 1,
    explain: "There points to a place. Their means belongs to them. Pizza slice is a thing, not a place — but here 'there' is short for 'over there'.",
  },
  {
    sentence: "The children took ____ backpacks to school.",
    options: ["their", "there"],
    correctIdx: 0,
    explain: "The backpacks belong to the children — that's whose. 'Their' means 'belonging to them'. 'There' would mean a place.",
  },
  {
    sentence: "You have ____ hide when we play tag.",
    options: ["too", "to"],
    correctIdx: 1,
    explain: "'To hide' is a whole action, like 'to run' or 'to eat'. 'Too' means also or very much. Actions get 'to' with one o.",
  },
  {
    sentence: "The soup is ____ hot to drink right now.",
    options: ["too", "to"],
    correctIdx: 0,
    explain: "'Too hot' means more hot than we want. 'Too' with two o's is like extra. 'To' with one o would be an action.",
  },
  {
    sentence: "Can I have a ____ of that cake?",
    options: ["piece", "peace"],
    correctIdx: 0,
    explain: "A piece is a part of something you can hold or eat. Peace means quiet or no war. Both sound the same — cake gives us the food clue.",
  },
  {
    sentence: "After the loud storm, the forest went back to ____.",
    options: ["piece", "peace"],
    correctIdx: 1,
    explain: "Peace is a quiet, calm feeling. Piece is a chunk of something. The forest is calm now, not a chunk of cake.",
  },
  {
    sentence: "I ____ the ball straight into the goal!",
    options: ["through", "threw"],
    correctIdx: 1,
    explain: "'Threw' is the past of 'throw' — what your arm did. 'Through' means going in and out the other side. Both sound the same but do very different jobs.",
  },
  {
    sentence: "The little rabbit ran ____ the tunnel.",
    options: ["through", "threw"],
    correctIdx: 0,
    explain: "'Through' means from one side to the other. 'Threw' is the past of throwing. Rabbits run, they don't throw themselves.",
  },
  {
    sentence: "____ time to brush your teeth!",
    options: ["It's", "Its"],
    correctIdx: 0,
    explain: "'It's' is short for 'it is'. 'Its' shows ownership like 'his' or 'her'. Only 'it is time' makes sense here.",
  },
  {
    sentence: "The turtle pulled ____ head inside its shell.",
    options: ["It's", "Its"],
    correctIdx: 1,
    explain: "The head belongs to the turtle — that's 'its' with no apostrophe. 'It's' would mean 'it is', which doesn't fit here.",
  },
];

const TWIN_TRAP_ROUNDS_KIDS_HE: TwinTrapRound[] = [
  {
    sentence: "אני אוהב ____ הבית שלי.",
    options: ["את", "אט"],
    correctIdx: 0,
    explain: "\"את\" מציין מה אני אוהב. \"אט\" זה לאט. הבית זה משהו שאני אוהב, אז המילה שמצביעה עליו זה \"את\".",
  },
  {
    sentence: "התינוק הולך ____ לאט.",
    options: ["את", "אט"],
    correctIdx: 1,
    explain: "\"אט\" זה מילה נרדפת ללאט. \"אט אט\" זה בעצם לאט לאט. \"את\" זו מילה שמציגה מושא — לא מתאימה כאן.",
  },
  {
    sentence: "____ מגיע לבית הספר?",
    options: ["מה", "מי"],
    correctIdx: 1,
    explain: "\"מי\" שואל על אדם. \"מה\" שואל על חפץ או פעולה. לבית הספר מגיעים אנשים, אז שואלים \"מי\".",
  },
  {
    sentence: "____ יש היום לארוחת צהריים?",
    options: ["מה", "מי"],
    correctIdx: 0,
    explain: "\"מה\" שואל על דבר — אוכל, חפץ, פעולה. \"מי\" שואל רק על בני אדם. אוכל זה \"מה\".",
  },
  {
    sentence: "אמא ____ לי לישון מוקדם.",
    options: ["אמרה", "עמרה"],
    correctIdx: 0,
    explain: "\"אמרה\" מהשורש אמ\"ר, לדבר. \"עמרה\" זה שם עצם (עומר של דגן). כשמישהו מדבר משתמשים ב\"אמר\" עם א'.",
  },
  {
    sentence: "אני יודע ____ הטלפון שלך.",
    options: ["מספר", "משפר"],
    correctIdx: 0,
    explain: "\"מספר\" זה ספרה או קוד. \"משפר\" זה מהשורש שפ\"ר, לעשות משהו טוב יותר. טלפון יש לו מספר, לא משפר.",
  },
  {
    sentence: "החתול קפץ ____ העץ.",
    options: ["על", "אל"],
    correctIdx: 0,
    explain: "\"על\" מציין למעלה — החתול הגיע לגובה על העץ. \"אל\" מציין כיוון — לכיוון העץ. פה החתול כבר על העץ.",
  },
  {
    sentence: "רץ מהר ____ ההורים שלי!",
    options: ["על", "אל"],
    correctIdx: 1,
    explain: "\"אל\" מציין כיוון של תנועה — רץ לכיוון ההורים. \"על\" מציין מיקום למעלה. פה זו תנועה, אז \"אל\".",
  },
  {
    sentence: "התפוח נופל ____ העץ אל האדמה.",
    options: ["מן", "מי"],
    correctIdx: 0,
    explain: "\"מן\" זה מ- ארוך, מציין מוצא: התפוח בא מהעץ. \"מי\" שואל על בן אדם. מקור התפוח זה מהעץ, אז \"מן\".",
  },
  {
    sentence: "____ נתן לך את המתנה הזאת?",
    options: ["מן", "מי"],
    correctIdx: 1,
    explain: "\"מי\" שואל על אדם. \"מן\" זה מ- ארוך למוצא. שואלים על מי שנתן — אדם — אז \"מי\".",
  },
];

// ─── Per-language router ───────────────────────────────────────
const ROUNDS_BY_LANG: Record<string, TwinTrapRound[]> = {
  en: TWIN_TRAP_ROUNDS_EN,
  he: TWIN_TRAP_ROUNDS_HE,
  ar: TWIN_TRAP_ROUNDS_AR,
  ru: TWIN_TRAP_ROUNDS_RU,
};

const ROUNDS_BY_LANG_KIDS: Record<string, TwinTrapRound[]> = {
  en: TWIN_TRAP_ROUNDS_KIDS_EN,
  he: TWIN_TRAP_ROUNDS_KIDS_HE,
};

export function pickTwinTrapRounds(
  count: number,
  lang: string = "en",
  kids: boolean = false,
): { rounds: TwinTrapRound[]; contentLang: string } {
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
  // Fall back to English if we don't have content for this UI lang yet.
  // Other locales will join over the next few weeks; until then a Russian
  // user gets English Twin Trap which is still useful for English learners.
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
