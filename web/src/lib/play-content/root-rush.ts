/**
 * Root Rush — multi-select etymology game content.
 *
 * Each round shows a Latin/Greek root + its meaning, then 6 word tiles.
 * Three tiles contain the root; three are visual lookalikes that don't.
 * Player taps the 3 that belong to the root family.
 *
 * The 3 correct words must all be GENUINE descendants of the root. The
 * 3 distractors should LOOK plausible — share a first syllable or
 * vague vibe — but actually come from a different root. False trail
 * is the whole game.
 *
 * Why curated: getting the etymology right requires authoritative
 * sources. Generating it via LLM hallucinates ("scribble" → SCRIB?
 * Actually it does share — but it's harder to verify confidently).
 */

export type RootRushRound = {
  /** The root in display form, e.g. "SPECT". */
  root: string;
  /** Origin language label, e.g. "Latin" or "Greek". */
  origin: string;
  /** What the root means in plain English. */
  meaning: string;
  /** Six words. First 3 are correct, last 3 are distractors.
   *  Display order is randomised per session. */
  correct: [string, string, string];
  distractors: [string, string, string];
  /** Reveal line shown after the round. ≤180 chars. Highlights the
   *  trickiest distractor or a memorable point about the root. */
  story: string;
};

const ROOT_RUSH_ROUNDS_EN: RootRushRound[] = [
  {
    root: "SPECT",
    origin: "Latin",
    meaning: "to look, to see",
    correct: ["inspect", "spectator", "prospect"],
    distractors: ["special", "speed", "speak"],
    story: "Once you spot SPECT you'll see it everywhere: inspect (look in), prospect (look forward), spectator (watcher). Beware special and speak — different roots.",
  },
  {
    root: "SCRIB / SCRIPT",
    origin: "Latin",
    meaning: "to write",
    correct: ["describe", "scripture", "manuscript"],
    distractors: ["scrap", "screen", "scream"],
    story: "From Latin scribere. Manuscript = manu (hand) + script (written) = hand-written. The 'scr' tricks you, but scrap, screen and scream all come from elsewhere.",
  },
  {
    root: "PORT",
    origin: "Latin",
    meaning: "to carry",
    correct: ["transport", "import", "portable"],
    distractors: ["portrait", "porch", "porridge"],
    story: "From portare (to carry). Transport = carry across; import = carry in. Portrait LOOKS like it fits but comes from a different Latin word — protrahere (to draw forth).",
  },
  {
    root: "TELE",
    origin: "Greek",
    meaning: "far, distant",
    correct: ["television", "telescope", "telegraph"],
    distractors: ["temple", "temper", "tempo"],
    story: "Greek tele = far. Telescope = far-seer, telegraph = far-writer, television = far-vision. The TEMP family is from Latin tempus (time) — completely unrelated.",
  },
  {
    root: "AQUA",
    origin: "Latin",
    meaning: "water",
    correct: ["aquarium", "aqueduct", "aquatic"],
    distractors: ["acquire", "acrobat", "accent"],
    story: "Latin aqua = water. Aqueduct = water-leader (carries water). Acquire LOOKS like a match but it's ad + quaerere (to seek toward) — different family altogether.",
  },
  {
    root: "BIO",
    origin: "Greek",
    meaning: "life",
    correct: ["biology", "biography", "antibiotic"],
    distractors: ["bingo", "biscuit", "binary"],
    story: "Greek bios = life. Biology = study of life. Antibiotic = against life (kills bacteria). Biscuit is from Latin bis coctus = twice-cooked. Tricky 'bi' start.",
  },
  {
    root: "ASTRO / ASTER",
    origin: "Greek",
    meaning: "star",
    correct: ["astronaut", "astronomy", "asterisk"],
    distractors: ["asthma", "astray", "astonish"],
    story: "Greek aster = star. Astronaut = star-sailor (literally). Asterisk = little star. Astonish actually comes from Latin tonare (thunder) — different cosmic source.",
  },
  {
    root: "GEO",
    origin: "Greek",
    meaning: "earth, land",
    correct: ["geology", "geography", "geometry"],
    distractors: ["gentle", "generous", "genuine"],
    story: "Greek ge = earth. Geography = writing about earth. Geometry = measuring the earth. The GEN words come from Latin gens (clan, kin) — different origin entirely.",
  },
  {
    root: "AUDI",
    origin: "Latin",
    meaning: "to hear",
    correct: ["audio", "audience", "auditorium"],
    distractors: ["author", "auction", "August"],
    story: "Latin audire = to hear. An audience is literally 'those who hear'. Author comes from auctor (originator) — totally different. August is from Augustus the emperor.",
  },
  {
    root: "MAN / MANU",
    origin: "Latin",
    meaning: "hand",
    correct: ["manual", "manuscript", "manipulate"],
    distractors: ["mansion", "manner", "mango"],
    story: "Latin manus = hand. Manuscript = handwritten. Manipulate = handle. Mansion is from manere (to remain), and mango is from Tamil mankay. Hands off.",
  },
  {
    root: "GRAPH",
    origin: "Greek",
    meaning: "to write, to draw",
    correct: ["photograph", "autograph", "telegraph"],
    distractors: ["grape", "gravity", "grass"],
    story: "Greek graphein = to write. Photograph = writing with light. Autograph = self-written. The GR distractors are all unrelated — gravity is from Latin gravis (heavy).",
  },
  {
    root: "PHONE",
    origin: "Greek",
    meaning: "sound, voice",
    correct: ["telephone", "microphone", "symphony"],
    distractors: ["phantom", "photo", "physical"],
    story: "Greek phone = sound. Symphony = sounding together. The PH- distractors are all from different Greek words: phantom (appear), photo (light), physical (nature).",
  },
  {
    root: "ANTHRO",
    origin: "Greek",
    meaning: "human, person",
    correct: ["anthropology", "misanthrope", "philanthropy"],
    distractors: ["anchor", "antique", "ankle"],
    story: "Greek anthropos = human. Philanthropy = love of humans; misanthrope = hater of humans. The AN- distractors are wildly unrelated lookalikes.",
  },
  {
    root: "CRED",
    origin: "Latin",
    meaning: "to believe",
    correct: ["credit", "incredible", "credentials"],
    distractors: ["create", "crew", "creek"],
    story: "Latin credere = to believe. Credit = trust extended. Incredible = unbelievable. Credentials = things that make you believable. CREATE comes from creare instead.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew is BUILT on a 3-letter root system. Every native speaker
// knows this intuitively. This game makes it explicit — and showcases
// the deep structural beauty of the language. Distractors are words
// that LOOK like they share a root but actually come from elsewhere.
const ROOT_RUSH_ROUNDS_HE: RootRushRound[] = [
  {
    root: "ש.מ.ר",
    origin: "עברית",
    meaning: "לשמור, להגן, לעקוב",
    correct: ["שומר", "משמרת", "שמירה"],
    distractors: ["שמן", "שמיים", "שמט"],
    story: "שמר נמצא בכל מקום: שומר, מִשמר, מַשמרת, שמרנות. הסחות 'שמן' מ-שׁ.מ.נ. ו'שמיים' מ-שׁ.מ.י.מ.",
  },
  {
    root: "כ.ת.ב",
    origin: "עברית",
    meaning: "לכתוב, לרשום",
    correct: ["כתב", "מכתב", "כתבן"],
    distractors: ["כתם", "כיתה", "כפר"],
    story: "השורש המקראי שעבר את כל ההיסטוריה. 'כתם' מ-כ.ת.מ., 'כיתה' מ-כ.ת.ת. (לחלק לחלקים), שורשים שונים לגמרי.",
  },
  {
    root: "ל.מ.ד",
    origin: "עברית",
    meaning: "ללמוד, להוראה",
    correct: ["לומד", "מלמד", "תלמיד"],
    distractors: ["להב", "ילד", "ימים"],
    story: "מ-ל.מ.ד נגזרו לומד (פעיל), מלמד (פיעל), תלמיד (משקל), תלמוד (משקל). 'ילד' למרות הצליל הוא מ-י.ל.ד.",
  },
  {
    root: "ש.פ.ט",
    origin: "עברית",
    meaning: "לדון, לקבוע משפט",
    correct: ["שופט", "משפט", "שפיטה"],
    distractors: ["שפן", "שפתיים", "שפע"],
    story: "השורש של דיני התורה: שופט, משפט, נשפט, שפיטה. השפן הוא מ-ש.פ.נ., השפתיים מ-ש.פ.ה. (מילה דו-הברתית).",
  },
  {
    root: "ק.ר.א",
    origin: "עברית",
    meaning: "לקרוא בקול, לחנן בשם",
    correct: ["קורא", "מקרא", "קריאה"],
    distractors: ["קרוב", "קר", "קרקע"],
    story: "ק.ר.א הוא לקרוא טקסט בקול וגם להעניק שם. הסחות: 'קרוב' מ-ק.ר.ב., 'קר' שורש ק.ר.ר., 'קרקע' מ-ק.ר.ק.",
  },
  {
    root: "ה.ל.כ",
    origin: "עברית",
    meaning: "ללכת, להתקדם",
    correct: ["הולך", "מהלך", "הליכה"],
    distractors: ["הר", "היום", "הוד"],
    story: "ה.ל.כ הוא שורש התנועה בעברית. בנוסף נגזרו הלך (פעיל), מתהלך (התפעל), נילך, להלן. הסחות הם שורשים שונים.",
  },
  {
    root: "ר.צ.ה",
    origin: "עברית",
    meaning: "לרצות, לאוות",
    correct: ["רצון", "מרוצה", "רצונות"],
    distractors: ["רץ", "רצח", "רצף"],
    story: "ר.צ.ה. (רוצה, מתרצה, רצוי). הסחות: 'רץ' מ-ר.ו.צ., 'רצח' שורש ר.צ.ח. ו'רצף' שורש ר.צ.פ. שלושה שורשים שונים.",
  },
  {
    root: "ע.ב.ד",
    origin: "עברית",
    meaning: "לעבוד, לשרת",
    correct: ["עובד", "עבדות", "מעבד"],
    distractors: ["עברית", "עבי", "עין"],
    story: "ע.ב.ד הוא עבד (עובד), מעבדה, עבדות. הסחות: 'עברית' מ-ע.ב.ר., 'עבי' תואר השם של עבה (ע.ב.ה.), 'עין' מ-ע.י.נ.",
  },
  {
    root: "ד.ב.ר",
    origin: "עברית",
    meaning: "לדבר, לאמור",
    correct: ["דובר", "דיבור", "מדבר"],
    distractors: ["דבש", "דבק", "דקה"],
    story: "ד.ב.ר נמצא בכל הזיקוקים של עברית: דובר, דברן, להגיד דבר. הסחות: 'דבש' מ-ד.ב.ש., 'דבק' מ-ד.ב.ק.",
  },
  {
    root: "א.כ.ל",
    origin: "עברית",
    meaning: "לאכול, לכלות",
    correct: ["אוכל", "מאכל", "אכילה"],
    distractors: ["אומר", "אדם", "אש"],
    story: "א.כ.ל הוא שורש המזון: אוכל, מאכל, נאכל, מאכל, אכלן. הסחות הם שורשים שונים לגמרי לפי האות השנייה.",
  },
  {
    root: "ר.א.ה",
    origin: "עברית",
    meaning: "לראות, להבחין",
    correct: ["רואה", "מראה", "ראייה"],
    distractors: ["ראש", "רחב", "רעב"],
    story: "ר.א.ה (רואה, מראה, ראייה, מורא, ראוי). הסחות: 'ראש' מ-ר.א.ש., 'רחב' מ-ר.ח.ב., 'רעב' מ-ר.ע.ב.",
  },
  {
    root: "ג.ד.ל",
    origin: "עברית",
    meaning: "לגדול, להתפתח",
    correct: ["גדול", "גידול", "מגדל"],
    distractors: ["גג", "גזע", "גלגל"],
    story: "ג.ד.ל הוא שורש ההתפתחות בעברית. גדל, מגדל, גדולה, התגדל. הסחות הם שורשים אחרים לחלוטין: ג.ג.ג., ג.ז.ע., ג.ל.ג.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Arabic shares the 3-letter root system with Hebrew. Native speakers
// use it daily but rarely articulate it. This game makes the structural
// beauty of Arabic explicit. Distractors share letters but come from
// different roots.
const ROOT_RUSH_ROUNDS_AR: RootRushRound[] = [
  {
    root: "ك.ت.ب",
    origin: "العربية",
    meaning: "الكتابة والتسجيل",
    correct: ["كاتب", "مكتبة", "كتاب"],
    distractors: ["كَتِف", "كِتمان", "كرة"],
    story: "من ك.ت.ب اشتُقّ: كاتب (الفاعل)، كتاب (المفعول)، مكتبة (المكان). كَتِف من ك.ت.ف، كِتمان من ك.ت.م.",
  },
  {
    root: "ع.ل.م",
    origin: "العربية",
    meaning: "المعرفة والتعليم",
    correct: ["عالِم", "تعليم", "مَعلم"],
    distractors: ["عَمل", "عَلَى", "عَلَن"],
    story: "ع.ل.م الجذر الذهبي للمعرفة. عالم، تعليم، عَلامة، مَعلوم. الفروق في الحركات تفصل بين الجذور الثلاثية.",
  },
  {
    root: "ج.م.ع",
    origin: "العربية",
    meaning: "الجمع والتجميع",
    correct: ["جامعة", "جُمعة", "مُجتمَع"],
    distractors: ["جَمل", "جَنّة", "جِسم"],
    story: "ج.م.ع للجمع. جامعة (مكان الجمع)، جُمعة (يوم الجمع)، مجتمع (المُجمَّع). الجمل من ج.م.ل، الجسم من ج.س.م.",
  },
  {
    root: "د.ر.س",
    origin: "العربية",
    meaning: "الدراسة والتعلّم",
    correct: ["دَرس", "مُدرّس", "مدرسة"],
    distractors: ["دَرَجة", "دَفع", "دَواء"],
    story: "د.ر.س جذر التعليم. درس، مدرسة، مدرّس، دراسة، دارس. الدرجة من د.ر.ج، الدفع من د.ف.ع.",
  },
  {
    root: "ع.م.ل",
    origin: "العربية",
    meaning: "الفعل والعمل",
    correct: ["عامِل", "عَمَل", "مَعمَل"],
    distractors: ["عُمر", "عَمّ", "عُملة"],
    story: "ع.م.ل للفعل والعمل. عمل، عامل، معمول، معمل، عمليّة. العمر من ع.م.ر، العملة من ع.م.ل أيضًا فعلًا.",
  },
  {
    root: "ق.ر.أ",
    origin: "العربية",
    meaning: "القراءة والتلاوة",
    correct: ["قارِئ", "قراءة", "قرآن"],
    distractors: ["قَريب", "قُربى", "قِطار"],
    story: "ق.ر.أ جذر القرآن. قراءة، قارئ، مقروء، قرآن (الجامع المتلوّ). القريب من ق.ر.ب، القطار من ق.ط.ر.",
  },
  {
    root: "ك.ل.م",
    origin: "العربية",
    meaning: "الكلام والقول",
    correct: ["كلمة", "متكلّم", "كلام"],
    distractors: ["كُلّ", "كَلب", "كِيلة"],
    story: "ك.ل.م جذر اللغة نفسه. كلمة، كلام، تكلّم، مكالمة. كلّ من ك.ل.ل، كلب من ك.ل.ب.",
  },
  {
    root: "ر.ك.ب",
    origin: "العربية",
    meaning: "الركوب والصعود",
    correct: ["راكِب", "مَركَب", "ركوب"],
    distractors: ["ركبة", "رَكام", "رِكاز"],
    story: "ر.ك.ب الجذر للحركة. راكب، مركب، مركبة، ركوب، تركيب. الركبة من نفس الجذر فعلاً (موضع الانثناء).",
  },
  {
    root: "س.م.ع",
    origin: "العربية",
    meaning: "السمع والإصغاء",
    correct: ["سامِع", "سَماع", "مِسْماع"],
    distractors: ["سَمَكة", "سَكوت", "سَنة"],
    story: "س.م.ع جذر السمع. سامع، مُستمع، سمّاعة، مَسموع. السمك من س.م.ك، السكوت من س.ك.ت.",
  },
  {
    root: "ن.ز.ل",
    origin: "العربية",
    meaning: "النزول والهبوط",
    correct: ["نازِل", "مَنزِل", "نُزول"],
    distractors: ["نَجاة", "نَدى", "نَقل"],
    story: "ن.ز.ل جذر النزول. نازل، منزل (المكان الذي يَنزِل فيه الناس)، إنزال. النجاة من ن.ج.و، النقل من ن.ق.ل.",
  },
];

const ROUNDS_BY_LANG: Record<string, RootRushRound[]> = {
  en: ROOT_RUSH_ROUNDS_EN,
  he: ROOT_RUSH_ROUNDS_HE,
  ar: ROOT_RUSH_ROUNDS_AR,
};

export function pickRootRushRounds(
  count: number,
  lang: string = "en",
): { rounds: RootRushRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
