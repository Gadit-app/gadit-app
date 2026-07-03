/**
 * Build-a-Word — morphology game content.
 *
 * Each round shows a meaning ("not able to be broken") and a pool of
 * morpheme tiles. Player taps tiles in order: prefix → root → suffix
 * (some rounds skip prefix or suffix). The slots fill, the word forms.
 *
 * It's spelling-bee, but with structure — kids assemble words rather
 * than recall them. Far less anxiety, much more retention.
 *
 * Distractor tiles are visible-similar morphemes from different roots
 * (un- vs in-; -able vs -ible). They feel like real choices.
 */

export type BuildAWordRound = {
  /** The target English word. Used to validate the build. */
  target: string;
  /** Plain-English clue. ≤80 chars. */
  clue: string;
  /** Ordered correct morpheme sequence to build the target. */
  correct: string[];
  /** All tiles in the pool — correct + distractors. Display order is
   *  randomised per session. */
  pool: string[];
  /** Reveal explaining the build. ≤180 chars. */
  story: string;
};

const BUILD_A_WORD_ROUNDS_EN: BuildAWordRound[] = [
  {
    target: "unbreakable",
    clue: "not able to be broken",
    correct: ["un", "break", "able"],
    pool: ["un", "re", "break", "vis", "able", "ful"],
    story: "un- (not) + break (the action) + -able (capable of). English builds layered meaning by stacking morphemes.",
  },
  {
    target: "rewritable",
    clue: "able to be written again",
    correct: ["re", "writ", "able"],
    pool: ["re", "un", "writ", "spect", "able", "ful"],
    story: "re- (again) + writ (write, from Latin scribere) + -able (capable of). Three pieces, infinite combinations.",
  },
  {
    target: "invisible",
    clue: "not able to be seen",
    correct: ["in", "vis", "ible"],
    pool: ["in", "un", "vis", "aud", "ible", "able"],
    story: "in- (not) + vis (see, from Latin videre) + -ible (the Latin twin of -able). Same job, Latin-y feel.",
  },
  {
    target: "preview",
    clue: "to look at before",
    correct: ["pre", "view"],
    pool: ["pre", "re", "view", "spect", "post", "ist"],
    story: "pre- (before) + view (look). Two pieces, but the meaning is precise: not just to look — to look ahead of the moment.",
  },
  {
    target: "predict",
    clue: "to say something before it happens",
    correct: ["pre", "dict"],
    pool: ["pre", "post", "dict", "vis", "tion", "able"],
    story: "pre- (before) + dict (say, from Latin dicere). To say something before — a prediction. Contradict shares the dict.",
  },
  {
    target: "telephone",
    clue: "a device for sound at a distance",
    correct: ["tele", "phone"],
    pool: ["tele", "auto", "phone", "graph", "scope", "vision"],
    story: "tele- (far) + phone (sound). The Greek roots gave us a perfect coinage when Bell needed a name in 1876.",
  },
  {
    target: "biography",
    clue: "writing about a person's life",
    correct: ["bio", "graph", "y"],
    pool: ["bio", "auto", "graph", "phone", "y", "ist"],
    story: "bio- (life) + graph (write) + -y (nominalizer). Greek + Greek + suffix. Add auto- for autobiography (self-life-writing).",
  },
  {
    target: "uncomfortable",
    clue: "not at ease",
    correct: ["un", "comfort", "able"],
    pool: ["un", "re", "comfort", "spect", "able", "ful"],
    story: "un- (not) + comfort (ease) + -able. Notice English happily stacks negatives — un- can sit on top of any -able adjective.",
  },
  {
    target: "international",
    clue: "between or among nations",
    correct: ["inter", "nation", "al"],
    pool: ["inter", "intra", "nation", "port", "al", "ist"],
    story: "inter- (between) + nation + -al (relating to). Intra- means within (intramural); inter- means between. Two letters, very different worlds.",
  },
  {
    target: "submarine",
    clue: "underwater vessel",
    correct: ["sub", "marine"],
    pool: ["sub", "super", "marine", "terra", "ist", "tion"],
    story: "sub- (under) + marine (of the sea, from Latin mare). Sub-conscious, sub-way, sub-marine. Under everywhere.",
  },
  {
    target: "antibody",
    clue: "a protein that fights against invaders",
    correct: ["anti", "body"],
    pool: ["anti", "pro", "body", "graph", "ist", "tion"],
    story: "anti- (against) + body. Direct and concrete. Pro- would mean for, supporting — pro-biotic vs. anti-biotic.",
  },
  {
    target: "microscope",
    clue: "a device to see very small things",
    correct: ["micro", "scope"],
    pool: ["micro", "tele", "scope", "phone", "graph", "ist"],
    story: "micro- (small) + scope (see, from Greek skopein). Telescope is far-see; microscope is small-see. Same family, different jobs.",
  },
  {
    target: "transport",
    clue: "to carry across",
    correct: ["trans", "port"],
    pool: ["trans", "im", "port", "spect", "tion", "ist"],
    story: "trans- (across) + port (carry). Import = carry in; export = carry out; transport = carry across. The port family is huge.",
  },
  {
    target: "republic",
    clue: "a public matter — government by the people",
    correct: ["re", "public"],
    pool: ["re", "anti", "public", "private", "an", "ist"],
    story: "Latin res publica = 'the public thing'. Public from populus (people). The opposite of a private matter run by one ruler.",
  },
  {
    target: "antisocial",
    clue: "against being with people",
    correct: ["anti", "soci", "al"],
    pool: ["anti", "pro", "soci", "nation", "al", "ist"],
    story: "anti- (against) + soci (companion, from Latin socius) + -al. Pro-social is the optimistic twin. Same root in both directions.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew morphology is built on root + binyan/mishkal templates.
// For this game we adapted to a Hebrew-friendly model: assemble
// a word from prefix + root + suffix. Beginners learn the building
// blocks; native speakers see the structure they use unconsciously.
const BUILD_A_WORD_ROUNDS_HE: BuildAWordRound[] = [
  {
    target: "מכתב",
    clue: "כלי לתקשורת בכתב, נשלח בדואר",
    correct: ["מ", "כתב"],
    pool: ["מ", "ה", "כתב", "תב", "ים", "ות"],
    story: "מ + כתב. הקידומת 'מ' מציינת כלי או מקום שעוסקים בו (מ-קום, מ-קרר). כתב = כותב או מסר. ביחד: כלי לתקשורת.",
  },
  {
    target: "תלמיד",
    clue: "מי שלומד",
    correct: ["ת", "למ", "יד"],
    pool: ["ת", "מ", "למ", "מד", "יד", "ון"],
    story: "ת + למ + יד. משקל תַלמיד: הקידומת 'ת' מציינת את מי שעושה את הפעולה, והשורש ל.מ.ד יושב במרכז.",
  },
  {
    target: "ספריה",
    clue: "מקום שמרכז ספרים לקריאה",
    correct: ["ספר", "יה"],
    pool: ["ספר", "ה", "יה", "ות", "ית", "ים"],
    story: "ספר + יה. הסיומת '-יה' מציינת מקום (פיצוצ-יה, ספרי-ה, מאפי-ה). שורש ספר עם סיומת מקום = ספריה.",
  },
  {
    target: "סופר",
    clue: "מי שכותב ספרים",
    correct: ["סופ", "ר"],
    pool: ["סופ", "כתב", "ר", "ה", "מ", "ים"],
    story: "ס + ו + פ + ר. משקל פּוֹעֵל (החזק במלאי) מציין מי שעושה. כותב, שומר, סופר. השורש המסתורי 'ספ.ר' הוא לספור ולספר.",
  },
  {
    target: "מורה",
    clue: "מי שמלמד",
    correct: ["מ", "ור", "ה"],
    pool: ["מ", "ה", "ור", "מד", "ית", "ים"],
    story: "מ + ור + ה. השורש י.ר.ה (להורות, להראות את הדרך) במשקל מַ-ורֶה. הקידומת 'מ' מבצעת את התפקיד שהיא תמיד עושה.",
  },
  {
    target: "מנהל",
    clue: "מי שעומד בראש ארגון",
    correct: ["מ", "נהל"],
    pool: ["מ", "ה", "נהל", "מנה", "ים", "ות"],
    story: "מ + נהל. השורש נ.ה.ל. (להוביל, לכוון) במשקל מ-נהל. כמו מ-נהיג, מ-נהיגות. הקידומת מ בעברית = מבצע פעולה.",
  },
  {
    target: "ילדות",
    clue: "תקופת החיים בה אדם הוא ילד",
    correct: ["ילד", "ות"],
    pool: ["ילד", "ה", "ות", "ון", "ים", "ת"],
    story: "ילד + ות. הסיומת '-ות' מציינת תכונה מופשטת או תקופה (ילד-ות, הוֹר-ות, בְּגר-ות). השורש י.ל.ד הוא הגרעין.",
  },
  {
    target: "מסעדה",
    clue: "מקום בו אוכלים ארוחות מבושלות",
    correct: ["מ", "סעד", "ה"],
    pool: ["מ", "ה", "סעד", "אכ", "ות", "ים"],
    story: "מ + סעד + ה. השורש ס.ע.ד (לתמוך, להחזיק) מקבל את הקידומת מ (מקום) והסיומת -ה (נקבה). יחד: מקום סעודה.",
  },
  {
    target: "כתיבה",
    clue: "פעולת רישום על הנייר",
    correct: ["כתיב", "ה"],
    pool: ["כתיב", "כתב", "ה", "ון", "ים", "ות"],
    story: "כתיב + ה. השם הפעולה במשקל קְטִילָה. כתיבה, קריאה, שירה, אכילה — כולם משקל הפעלים כשם פעולה.",
  },
  {
    target: "מערכה",
    clue: "אוסף של דברים שמסודרים בסדר",
    correct: ["מ", "ערכ", "ה"],
    pool: ["מ", "ה", "ערכ", "סדר", "ים", "ות"],
    story: "מ + ערכ + ה. השורש ע.ר.כ (לסדר, לערוך) במשקל מַ-עְרָכָה. כמו מַ-עְרָכֶת, מַ-עֲרָכִי. הקידומת מ מציינת קבוצה.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic morphology is built on the root + pattern (وزن) system. The
// game adapts to Arabic by assembling prefix + root + suffix tiles
// that match the meaning. Beginners learn the structural beauty of
// Arabic; native speakers see what they always knew but never said.
const BUILD_A_WORD_ROUNDS_AR: BuildAWordRound[] = [
  {
    target: "مكتبة",
    clue: "المكان الذي تُقرأ فيه الكتب",
    correct: ["م", "كتب", "ة"],
    pool: ["م", "ا", "كتب", "درس", "ة", "ون"],
    story: "م + كتب + ة. السابقة م تدلّ على المكان. الجذر كتب (الكتابة). اللاحقة ة تأنيث. مكان جامع للكتب.",
  },
  {
    target: "مدرسة",
    clue: "المكان الذي تدرس فيه الطلاب",
    correct: ["م", "درس", "ة"],
    pool: ["م", "ت", "درس", "علم", "ة", "ون"],
    story: "م + درس + ة. م مكان، درس الدراسة، ة تأنيث. على وزن مَفعَلة الذي يدلّ دائمًا على مكان فعل ما.",
  },
  {
    target: "كاتب",
    clue: "مَن يكتب الكلمات",
    correct: ["ك", "ا", "تب"],
    pool: ["ك", "ا", "تب", "ة", "م", "ون"],
    story: "ك + ا + تب. وزن فاعل للدلالة على من يفعل الفعل. كاتب، قارئ، حافظ، مدرّس. الوزن نفسه في آلاف الكلمات.",
  },
  {
    target: "مكتوب",
    clue: "ما تمّت كتابته",
    correct: ["م", "كتو", "ب"],
    pool: ["م", "كتو", "ب", "ة", "ا", "ون"],
    story: "م + كتو + ب. وزن مَفعول للدلالة على ما وقع عليه الفعل. مكتوب، مقروء، محفوظ، معروف.",
  },
  {
    target: "تعليم",
    clue: "نقل المعرفة من المعلّم إلى الطالب",
    correct: ["ت", "علي", "م"],
    pool: ["ت", "علي", "م", "ة", "ا", "ون"],
    story: "ت + علي + م. وزن تَفعيل لمصدر فعل الجذع الثاني (تعليم، تكريم، تنويم). يدلّ على الفعل المستمرّ.",
  },
  {
    target: "مفتاح",
    clue: "أداة تستخدم لفتح الأبواب",
    correct: ["م", "فتا", "ح"],
    pool: ["م", "فتا", "ح", "ة", "ا", "ون"],
    story: "م + فتا + ح. وزن مِفعال للدلالة على الأداة. مفتاح، مِنشار، مِكنسة، مِعطف. الأشياء التي بها نَفعل.",
  },
  {
    target: "متعلّم",
    clue: "مَن يقوم بعمليّة التعلّم",
    correct: ["مت", "علّ", "م"],
    pool: ["مت", "علّ", "م", "ة", "كا", "ون"],
    story: "مت + علّ + م. وزن مُتفعّل للدلالة على من يقوم بفعل على نفسه. متعلّم، متكلّم، متفائل. الفعل ينعكس عليه.",
  },
  {
    target: "كتابة",
    clue: "فعل تسجيل الكلمات على ورق",
    correct: ["كتا", "ب", "ة"],
    pool: ["كتا", "م", "ب", "ة", "ات", "ون"],
    story: "كتا + ب + ة. وزن فِعالة لمصدر الحرفة أو النشاط. كتابة، قراءة، خياطة، طبخة. الفعل كاسم.",
  },
  {
    target: "مطعم",
    clue: "المكان الذي يأكل فيه الناس",
    correct: ["م", "طعم"],
    pool: ["م", "طعم", "طع", "ة", "ت", "ون"],
    story: "م + طعم. وزن مَفعَل للدلالة على المكان (دون تأنيث). الجذر طعم هو الأكل والذوق. مَطعم، مَلعب، مَجلس، مَكتب. مكان الفعل.",
  },
  {
    target: "متفائل",
    clue: "الذي يتوقّع الخير في المستقبل",
    correct: ["مت", "فا", "ئل"],
    pool: ["مت", "فا", "ئل", "ة", "كا", "ون"],
    story: "مت + فا + ئل. وزن مُتفاعِل للدلالة على المنخرط في الفعل تجاه نفسه. متفائل، متشاءم، متضامن.",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Russian morphology is famously rich: prefix + root + suffix +
// ending build precise meaning. The game shows how a single root
// like ПИС can generate dozens of words depending on the affixes.
const BUILD_A_WORD_ROUNDS_RU: BuildAWordRound[] = [
  {
    target: "написать",
    clue: "завершить процесс письма",
    correct: ["на", "пис", "ать"],
    pool: ["на", "пере", "пис", "учи", "ать", "тель"],
    story: "на + пис + ать. Приставка «на» добавляет завершённость (совершенный вид). Корень «пис» отвечает за смысл письма. «Ать» — глагольное окончание.",
  },
  {
    target: "переписать",
    clue: "написать заново",
    correct: ["пере", "пис", "ать"],
    pool: ["пере", "на", "пис", "под", "ать", "ник"],
    story: "пере + пис + ать. Приставка «пере» означает повтор. «Перепис» = «снова пис». Тот же корень, другой префикс — другой смысл.",
  },
  {
    target: "учитель",
    clue: "тот, кто учит",
    correct: ["учи", "тель"],
    pool: ["учи", "пис", "тель", "ник", "ение", "ость"],
    story: "учи + тель. Корень «уч» отвечает за обучение. Суффикс «тель» обозначает деятеля (тот, кто делает). Учитель, писатель, водитель — одна модель.",
  },
  {
    target: "ученик",
    clue: "тот, кто учится",
    correct: ["уче", "ник"],
    pool: ["уче", "учи", "ник", "тель", "к", "а"],
    story: "уче + ник. Суффикс «ник» обозначает носителя признака или принадлежности. Школьник, ученик, дневник — все через «ник».",
  },
  {
    target: "подойти",
    clue: "приблизиться к чему-то",
    correct: ["по", "до", "йти"],
    pool: ["по", "до", "йти", "от", "ход", "ить"],
    story: "по + до + йти. Двойная приставка: «по» добавляет завершённость, «до» — указывает на достижение цели. «Йти» — корневая основа движения.",
  },
  {
    target: "приходить",
    clue: "регулярно появляться где-то",
    correct: ["при", "ход", "ить"],
    pool: ["при", "от", "ход", "пис", "ить", "ник"],
    story: "при + ход + ить. «При» — приближение. «Ход» — движение. «Ить» — несовершенный вид (повторяющееся действие).",
  },
  {
    target: "переход",
    clue: "место для перемещения через дорогу",
    correct: ["пере", "ход"],
    pool: ["пере", "при", "ход", "ник", "под", "ение"],
    story: "пере + ход. «Пере» — через. «Ход» — движение. Существительное без суффикса — мест действия. Подземный переход, пешеходный переход.",
  },
  {
    target: "подруга",
    clue: "девушка, с которой вы дружите",
    correct: ["по", "друг", "а"],
    pool: ["по", "под", "друг", "а", "ка", "ник"],
    story: "по + друг + а. «По» — приставка, добавляющая оттенок. «Друг» — основа. «А» — окончание женского рода. Друг → подруга.",
  },
  {
    target: "работник",
    clue: "человек, выполняющий труд",
    correct: ["работ", "ник"],
    pool: ["работ", "учи", "ник", "тель", "к", "а"],
    story: "работ + ник. «Работ» — основа труда. «Ник» — суффикс деятеля. Работник, школьник, ученик — стандартная модель.",
  },
  {
    target: "выходной",
    clue: "день отдыха после рабочих дней",
    correct: ["вы", "ход", "ной"],
    pool: ["вы", "от", "ход", "пис", "ной", "ник"],
    story: "вы + ход + ной. «Вы» — наружу. «Ход» — движение. «Ной» — суффикс прилагательного. Выходной = «выходящий из обычного ритма».",
  },
];

const ROUNDS_BY_LANG: Record<string, BuildAWordRound[]> = {
  en: BUILD_A_WORD_ROUNDS_EN,
  he: BUILD_A_WORD_ROUNDS_HE,
  ar: BUILD_A_WORD_ROUNDS_AR,
  ru: BUILD_A_WORD_ROUNDS_RU,
};

export function pickBuildAWordRounds(
  count: number,
  lang: string = "en",
): { rounds: BuildAWordRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
