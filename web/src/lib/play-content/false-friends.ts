/**
 * False Friends — cross-language cognate trap game content.
 *
 * Each round shows a foreign word + its native language + a tempting
 * English "twin". The player decides: real cognate (means what it
 * looks like) or false friend (means something completely different).
 *
 * Massive engagement for our multilingual audience. A Spanish speaker
 * recognising "embarazada" → "pregnant" and laughing at the trap is
 * the moment that turns a player into a fan.
 *
 * Mix is intentional: ~60% false friends, ~40% real cognates. If every
 * answer were FALSE the game would become trivial.
 */

export type FalseFriendsRound = {
  foreignWord: string;
  /** ISO country code for the flag (flagcdn). Picked to match the language
   *  most commonly associated with the word (Spanish → es; German → de). */
  foreignFlag: string;
  /** Display name of the language. */
  foreignLang: string;
  /** The English word the foreign word LOOKS like it should mean. */
  englishTwin: string;
  /** True if the foreign word actually means the English twin
   *  (real cognate). False if it's a trap. */
  isReal: boolean;
  /** Short reveal explaining the actual meaning. ≤140 chars. */
  story: string;
};

const FALSE_FRIENDS_ROUNDS_EN: FalseFriendsRound[] = [
  {
    foreignWord: "embarazada",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "embarrassed",
    isReal: false,
    story: "It actually means 'pregnant'. Telling a Spanish speaker you're embarazada is a very different announcement than you intended.",
  },
  {
    foreignWord: "Gift",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "gift",
    isReal: false,
    story: "It means poison. A 'Geschenk' is the German word for present. Be careful what you offer.",
  },
  {
    foreignWord: "librairie",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "library",
    isReal: false,
    story: "It means bookshop. A library in French is 'bibliothèque'. The trap catches English speakers in Paris every day.",
  },
  {
    foreignWord: "familia",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "family",
    isReal: true,
    story: "Real twin. Both from Latin familia (household). Shared roots, same meaning across centuries.",
  },
  {
    foreignWord: "sensible",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "sensible",
    isReal: false,
    story: "It means sensitive, not sensible. A French 'personne sensible' is one who feels deeply, not one with good judgement.",
  },
  {
    foreignWord: "Kind",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "kind",
    isReal: false,
    story: "It means child. The German word for kind (the adjective) is 'nett'. Confusing if you compliment somebody on being 'kind'.",
  },
  {
    foreignWord: "constipado",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "constipated",
    isReal: false,
    story: "Estar constipado means to have a cold (a stuffed nose). Constipated as in English is 'estreñido'. Don't mix up your symptoms at the pharmacy.",
  },
  {
    foreignWord: "telefon",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "telephone",
    isReal: true,
    story: "Real twin. Both are 19th-century Greek-derived inventions: tele (far) + phone (sound). Same engineering, same word, two spellings.",
  },
  {
    foreignWord: "actual",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "actual",
    isReal: false,
    story: "It means current, present-day. Spanish 'actualmente' = currently, NOT actually. The English 'actually' is closer to 'realmente'.",
  },
  {
    foreignWord: "mist",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "mist",
    isReal: false,
    story: "It means manure. Yes, really. The German for mist (the foggy kind) is 'Nebel'. Imagine the misunderstanding on a country drive.",
  },
  {
    foreignWord: "preservativo",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "preservative",
    isReal: false,
    story: "It means condom. Italian for food preservative is 'conservante'. Read your supermarket labels carefully in Rome.",
  },
  {
    foreignWord: "musica",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "music",
    isReal: true,
    story: "Real twin. From Latin musica, from Greek mousike — 'the art of the Muses'. Same source word for the whole western family.",
  },
  {
    foreignWord: "carta",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "card",
    isReal: false,
    story: "Una carta in Spanish is a letter (the mail kind) or a menu. A card is 'una tarjeta'. Tricky because both come from Latin charta (paper).",
  },
  {
    foreignWord: "burro",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "burro (donkey)",
    isReal: false,
    story: "In Italian, burro is butter. In Spanish, burro is donkey. The same letters, two different farms. Both languages get the joke.",
  },
  {
    foreignWord: "fabrik",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "fabric",
    isReal: false,
    story: "Fabrik means factory. The German for fabric (cloth) is 'Stoff'. Both 'Fabrik' and 'fabric' come from Latin fabrica (workshop) — they drifted.",
  },
  {
    foreignWord: "intelligente",
    foreignFlag: "it",
    foreignLang: "Italian",
    englishTwin: "intelligent",
    isReal: true,
    story: "Real twin. From Latin intelligere (to understand). One of the cleanest borrowings — same meaning, same Latin path.",
  },
  {
    foreignWord: "chef",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "chef",
    isReal: false,
    story: "In German, Chef means boss (the person in charge). The cooking chef is 'Koch'. Both come from French chef (head). The job changed; the title travelled.",
  },
  {
    foreignWord: "sympathique",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "sympathetic",
    isReal: false,
    story: "It means nice, likeable. French 'sympathique' is a pure compliment about charm; English 'sympathetic' is about sharing pain. Romantic vs. clinical.",
  },
  {
    foreignWord: "demander",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "to demand",
    isReal: false,
    story: "It just means to ask, politely. The French for 'demand' (aggressively) is 'exiger'. The English version somehow developed an attitude.",
  },
  {
    foreignWord: "doctor",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "doctor",
    isReal: true,
    story: "Real twin. From Latin doctor (teacher). The medical sense came later in both languages. A PhD and an MD share this word for good reason.",
  },
  {
    foreignWord: "vermist",
    foreignFlag: "nl",
    foreignLang: "Dutch",
    englishTwin: "Vermist (missing)",
    isReal: true,
    story: "Real twin. Dutch vermist = missing (as in a missing person). Both derive from the same Germanic root meaning to fail to find.",
  },
  {
    foreignWord: "salir",
    foreignFlag: "es",
    foreignLang: "Spanish",
    englishTwin: "to salivate / dirty",
    isReal: false,
    story: "It means to leave / exit. Looks like 'sully' or 'saliva' but is unrelated. The verb 'to dirty' in Spanish is 'ensuciar'.",
  },
  {
    foreignWord: "billion",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "billion",
    isReal: false,
    story: "In German, eine Billion = a trillion (1,000,000,000,000). A US billion is 'eine Milliarde'. A thousand-times-off mistake waiting to happen.",
  },
  {
    foreignWord: "lecture",
    foreignFlag: "fr",
    foreignLang: "French",
    englishTwin: "lecture",
    isReal: false,
    story: "It means reading. French 'la lecture' is the act of reading; a lecture (the academic talk) is 'un cours' or 'une conférence'.",
  },
  {
    foreignWord: "auto",
    foreignFlag: "de",
    foreignLang: "German",
    englishTwin: "auto (car)",
    isReal: true,
    story: "Real twin. Short for Auto-mobil in both languages, from Greek auto (self) + Latin mobilis (moving). A car literally moves itself.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Cross-language traps relevant to a Hebrew speaker. We pick words that
// (a) a Hebrew speaker would recognise from English/European tourism,
// (b) have surprising or embarrassing mistranslations, (c) are educational
// rather than just funny.
const FALSE_FRIENDS_ROUNDS_HE: FalseFriendsRound[] = [
  {
    foreignWord: "embarazada",
    foreignFlag: "es",
    foreignLang: "ספרדית",
    englishTwin: "נבוך",
    isReal: false,
    story: "זה אומר 'בהריון'. דובר ספרדית שתגיד לו אתה 'embarazada' תקבל מבט מאוד מבולבל.",
  },
  {
    foreignWord: "Gift",
    foreignFlag: "de",
    foreignLang: "גרמנית",
    englishTwin: "מתנה",
    isReal: false,
    story: "בגרמנית Gift = רעל. מתנה בגרמנית = Geschenk. תיזהר מה אתה מציע בברלין.",
  },
  {
    foreignWord: "preservativo",
    foreignFlag: "it",
    foreignLang: "איטלקית",
    englishTwin: "חומר משמר",
    isReal: false,
    story: "באיטלקית preservativo = קונדום. כשתקרא תוויות מזון ברומא, חפש 'conservante'.",
  },
  {
    foreignWord: "constipado",
    foreignFlag: "es",
    foreignLang: "ספרדית",
    englishTwin: "סובל מעצירות",
    isReal: false,
    story: "estar constipado = להצטנן (להיות עם אף סתום). 'עצירות' בספרדית היא 'estreñido'.",
  },
  {
    foreignWord: "familia",
    foreignFlag: "es",
    foreignLang: "ספרדית",
    englishTwin: "משפחה",
    isReal: true,
    story: "תאום אמיתי. מאותה לטינית familia (משק בית). שלושה אלפי שנים והמשמעות זהה.",
  },
  {
    foreignWord: "Kind",
    foreignFlag: "de",
    foreignLang: "גרמנית",
    englishTwin: "אדיב",
    isReal: false,
    story: "בגרמנית Kind = ילד. 'אדיב' בגרמנית הוא 'nett' או 'freundlich'.",
  },
  {
    foreignWord: "Chef",
    foreignFlag: "de",
    foreignLang: "גרמנית",
    englishTwin: "שף",
    isReal: false,
    story: "בגרמנית Chef = בוס (האחראי). השף שמבשל הוא 'Koch'. שתי המילים מצרפתית chef (ראש), אבל התפצלו.",
  },
  {
    foreignWord: "burro",
    foreignFlag: "it",
    foreignLang: "איטלקית",
    englishTwin: "חמור (כמו בספרדית)",
    isReal: false,
    story: "באיטלקית burro = חמאה. בספרדית burro = חמור. אותן אותיות, שתי חוות שונות לגמרי.",
  },
  {
    foreignWord: "librairie",
    foreignFlag: "fr",
    foreignLang: "צרפתית",
    englishTwin: "ספריה",
    isReal: false,
    story: "בצרפתית librairie = חנות ספרים. הספרייה היא 'bibliothèque'. תייר עברי בפריז מתבלבל פעם אחת ולעולם לא יותר.",
  },
  {
    foreignWord: "musica",
    foreignFlag: "it",
    foreignLang: "איטלקית",
    englishTwin: "מוסיקה",
    isReal: true,
    story: "תאום אמיתי. מהיוונית mousike (אמנות המוזות). אותה מילה בכל אירופה, אותה משמעות. נקייה.",
  },
  {
    foreignWord: "actual",
    foreignFlag: "es",
    foreignLang: "ספרדית",
    englishTwin: "ממשי (כמו באנגלית 'actual')",
    isReal: false,
    story: "בספרדית actual = עכשווי. 'actualmente' זה 'כיום', לא 'באמת'. הצרפתית לקחה אותו כיוון.",
  },
  {
    foreignWord: "fabrik",
    foreignFlag: "de",
    foreignLang: "גרמנית",
    englishTwin: "בד (כמו 'fabric' באנגלית)",
    isReal: false,
    story: "בגרמנית Fabrik = מפעל. הבד הוא 'Stoff'. שתי המילים מלטינית fabrica (סדנה), התפצלו.",
  },
  {
    foreignWord: "intelligente",
    foreignFlag: "it",
    foreignLang: "איטלקית",
    englishTwin: "אינטליגנטי",
    isReal: true,
    story: "תאום אמיתי. מלטינית intelligere (להבין). המסלול הקלאסי: לטינית → איטלקית → אירופה כולה.",
  },
  {
    foreignWord: "auto",
    foreignFlag: "de",
    foreignLang: "גרמנית",
    englishTwin: "אוטו (מכונית)",
    isReal: true,
    story: "תאום אמיתי. קיצור של automobil בשתי השפות, מיוונית auto (עצמי) + לטינית mobilis (נע). תקיף ומדויק.",
  },
  {
    foreignWord: "doctor",
    foreignFlag: "es",
    foreignLang: "ספרדית",
    englishTwin: "דוקטור / רופא",
    isReal: true,
    story: "תאום אמיתי. מלטינית doctor (מורה). הרפואה הצטרפה למשמעות אחרי. תואר אקדמי וכלי רפואי באים מאותו מקום.",
  },
];

// ─── Arabic content (MSA) ──────────────────────────────────────
// Cross-language traps for an Arabic-speaking learner. Focus on English
// and European words an Arab tourist or learner would encounter that
// look familiar but mean something else entirely.
const FALSE_FRIENDS_ROUNDS_AR: FalseFriendsRound[] = [
  {
    foreignWord: "embarazada",
    foreignFlag: "es",
    foreignLang: "الإسبانية",
    englishTwin: "مُحرَج (مثل embarrassed بالإنجليزية)",
    isReal: false,
    story: "في الإسبانية تعني حامل (في الحمل). تخيّل أن تقول لإسبانية أنّك embarazada فتفاجأ بنظرتها.",
  },
  {
    foreignWord: "Gift",
    foreignFlag: "de",
    foreignLang: "الألمانية",
    englishTwin: "هدية",
    isReal: false,
    story: "في الألمانية Gift تعني سُمّ. الهدية بالألمانية Geschenk. لا تقدّم لألماني Gift دون انتباه.",
  },
  {
    foreignWord: "librairie",
    foreignFlag: "fr",
    foreignLang: "الفرنسية",
    englishTwin: "مكتبة",
    isReal: false,
    story: "في الفرنسية librairie تعني المكتبة التي تبيع الكتب. المكتبة العامة هي bibliothèque. خطأ شائع للسائحين.",
  },
  {
    foreignWord: "familia",
    foreignFlag: "es",
    foreignLang: "الإسبانية",
    englishTwin: "عائلة",
    isReal: true,
    story: "توأم حقيقي. كلتا الكلمتين من اللاتينية familia (الأسرة). نفس الجذر، نفس المعنى عبر القرون.",
  },
  {
    foreignWord: "sensible",
    foreignFlag: "fr",
    foreignLang: "الفرنسية",
    englishTwin: "عاقل / حكيم",
    isReal: false,
    story: "في الفرنسية sensible تعني حسّاس عاطفيًا. العاقل بالفرنسية raisonnable. التشابه في الكتابة خادع.",
  },
  {
    foreignWord: "Kind",
    foreignFlag: "de",
    foreignLang: "الألمانية",
    englishTwin: "لطيف",
    isReal: false,
    story: "في الألمانية Kind تعني طفل. اللطيف بالألمانية nett أو freundlich. كلمتان متشابهتان بمعنيين مختلفين تمامًا.",
  },
  {
    foreignWord: "burro",
    foreignFlag: "it",
    foreignLang: "الإيطالية",
    englishTwin: "حمار (مثل بالإسبانية)",
    isReal: false,
    story: "في الإيطالية burro تعني زبدة. في الإسبانية الحرف نفسه burro يعني الحمار. لغتان أختان، معنيان متباعدان.",
  },
  {
    foreignWord: "preservativo",
    foreignFlag: "it",
    foreignLang: "الإيطالية",
    englishTwin: "مادة حافظة للطعام",
    isReal: false,
    story: "في الإيطالية preservativo تعني واقي ذكري. مادة الحفظ الغذائية بالإيطالية هي conservante. انتبه لقراءة المُلصقات.",
  },
  {
    foreignWord: "musica",
    foreignFlag: "it",
    foreignLang: "الإيطالية",
    englishTwin: "موسيقى",
    isReal: true,
    story: "توأم حقيقي. من اليونانية mousiké (فنّ الموزات). نفس الكلمة في كلّ اللغات الأوروبية، ووصلت العربية كذلك.",
  },
  {
    foreignWord: "actual",
    foreignFlag: "es",
    foreignLang: "الإسبانية",
    englishTwin: "فعلي / حقيقي (مثل actual بالإنجليزية)",
    isReal: false,
    story: "في الإسبانية actual تعني حالي / معاصر. الفعلي بالإسبانية real. الصلة بالإنجليزية actual مضلّلة تمامًا.",
  },
  {
    foreignWord: "doctor",
    foreignFlag: "es",
    foreignLang: "الإسبانية",
    englishTwin: "طبيب",
    isReal: true,
    story: "توأم حقيقي. من اللاتينية doctor (المعلّم). الطبيب والمحاضر الجامعي يحملان نفس اللقب في كثير من اللغات.",
  },
  {
    foreignWord: "lecture",
    foreignFlag: "fr",
    foreignLang: "الفرنسية",
    englishTwin: "محاضرة",
    isReal: false,
    story: "في الفرنسية lecture تعني القراءة. المحاضرة هي conférence أو cours. خطأ شائع لمن يتعلّم الفرنسية من الإنجليزية.",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Cross-language traps for a Russian speaker. Many false friends
// involve English or other European languages that look similar to
// Russian internationalisms but mean something different. Mix of
// real cognates (~40%) and traps (~60%) so the game stays unpredictable.
const FALSE_FRIENDS_ROUNDS_RU: FalseFriendsRound[] = [
  {
    foreignWord: "embarazada",
    foreignFlag: "es",
    foreignLang: "испанский",
    englishTwin: "смущённая",
    isReal: false,
    story: "По-испански значит беременная. Скажи испанке, что ты embarazada — она вряд ли подумает о смущении.",
  },
  {
    foreignWord: "Gift",
    foreignFlag: "de",
    foreignLang: "немецкий",
    englishTwin: "подарок",
    isReal: false,
    story: "По-немецки Gift означает яд. Подарок по-немецки — Geschenk. Будь осторожен с тем, что предлагаешь в Берлине.",
  },
  {
    foreignWord: "magasin",
    foreignFlag: "fr",
    foreignLang: "французский",
    englishTwin: "журнал (magazine)",
    isReal: false,
    story: "По-французски magasin — это магазин. Журнал во французском — revue. Тот же корень, разные смыслы.",
  },
  {
    foreignWord: "familia",
    foreignFlag: "es",
    foreignLang: "испанский",
    englishTwin: "семья",
    isReal: true,
    story: "Настоящий близнец. Оба слова из латинского familia (домашние). Одно слово, один смысл через тысячелетия.",
  },
  {
    foreignWord: "Kind",
    foreignFlag: "de",
    foreignLang: "немецкий",
    englishTwin: "добрый (kind)",
    isReal: false,
    story: "По-немецки Kind — это ребёнок. Добрый по-немецки — nett. Две похожие буквы, два разных понятия.",
  },
  {
    foreignWord: "Chef",
    foreignFlag: "de",
    foreignLang: "немецкий",
    englishTwin: "повар (chef)",
    isReal: false,
    story: "По-немецки Chef — начальник. Повар — Koch. Оба слова от французского chef (глава), но разошлись по смыслам.",
  },
  {
    foreignWord: "burro",
    foreignFlag: "it",
    foreignLang: "итальянский",
    englishTwin: "осёл (как в испанском burro)",
    isReal: false,
    story: "По-итальянски burro — это масло. По-испански burro — осёл. Одно слово, две разные фермы.",
  },
  {
    foreignWord: "preservativo",
    foreignFlag: "it",
    foreignLang: "итальянский",
    englishTwin: "консервант",
    isReal: false,
    story: "По-итальянски preservativo — это презерватив. Пищевой консервант — conservante. Будь внимателен с этикетками.",
  },
  {
    foreignWord: "actual",
    foreignFlag: "es",
    foreignLang: "испанский",
    englishTwin: "актуальный",
    isReal: true,
    story: "Настоящий близнец. Оба слова от латинского actualis (действующий, текущий). Русский «актуальный» взял именно это значение.",
  },
  {
    foreignWord: "intelligent",
    foreignFlag: "fr",
    foreignLang: "французский",
    englishTwin: "интеллигентный",
    isReal: false,
    story: "По-французски intelligent — просто умный. Русский «интеллигентный» означает образованного и культурного. Семантика разошлась в 19 веке.",
  },
  {
    foreignWord: "doctor",
    foreignFlag: "es",
    foreignLang: "испанский",
    englishTwin: "доктор / врач",
    isReal: true,
    story: "Настоящий близнец. От латинского doctor (учитель). Медицинский смысл пришёл позже, но сохранился во всех европейских языках.",
  },
  {
    foreignWord: "lecture",
    foreignFlag: "fr",
    foreignLang: "французский",
    englishTwin: "лекция",
    isReal: false,
    story: "По-французски lecture — это чтение. Лекция по-французски — conférence. Распространённая ошибка изучающих французский.",
  },
];

const ROUNDS_BY_LANG: Record<string, FalseFriendsRound[]> = {
  en: FALSE_FRIENDS_ROUNDS_EN,
  he: FALSE_FRIENDS_ROUNDS_HE,
  ar: FALSE_FRIENDS_ROUNDS_AR,
  ru: FALSE_FRIENDS_ROUNDS_RU,
};

export function pickFalseFriendsRounds(
  count: number,
  lang: string = "en",
): { rounds: FalseFriendsRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
