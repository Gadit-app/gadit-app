/**
 * curated-play-words — notebook-independent fallback pool for the 5
 * notebook-driven games (Quiz, Fill Blank, Memory, Anagram, Speed).
 *
 * Motivation: Gadi 2026-07-03 flagged that a first-time user (or a kid
 * handed the app) sees the notebook games as locked because they
 * haven't added 4+ words yet. This pool lets those games run before
 * the user has any notebook of their own — the same "content ships
 * with the app" pattern the 10 curated games already use.
 *
 * When the user does build up a notebook, PlayClient prefers the
 * notebook. This file only kicks in when the notebook is empty or
 * hasn't reached the minimum for a given game.
 *
 * Round 1 languages: English + Hebrew, adult + kids variants. Other
 * UI languages fall back to the English adult pool. The kids variants
 * skew toward concrete objects and playground vocabulary; the adult
 * variants are the sort of vocabulary language learners try to master.
 */

import type { PlayWord } from "@/lib/play-engine";

// ─── Adult English ─────────────────────────────────────────────
// Vocabulary a mid-intermediate English learner would actively try to
// pick up: verbs of purpose, precision nouns, ideas that feel adult
// without being obscure.
const CURATED_ADULT_EN: PlayWord[] = [
  {
    word: "resilient",
    language: "en",
    meaning: "able to recover quickly from difficulty or setbacks",
    examples: [
      "A resilient team keeps working even after a rough quarter.",
      "Kids raised in supportive homes tend to grow up more resilient.",
      "The economy proved surprisingly resilient after the shock.",
    ],
    uiLang: "en",
  },
  {
    word: "meticulous",
    language: "en",
    meaning: "extremely careful about small details",
    examples: [
      "She kept meticulous notes of every meeting.",
      "His meticulous approach to editing catches mistakes everyone else misses.",
      "The lab requires meticulous cleaning between experiments.",
    ],
    uiLang: "en",
  },
  {
    word: "endeavor",
    language: "en",
    meaning: "to try hard to achieve something; also, a serious effort",
    examples: [
      "We endeavor to answer every message within a day.",
      "Starting a company is a long endeavor with a lot of setbacks.",
      "He endeavored to finish the report before the deadline.",
    ],
    uiLang: "en",
  },
  {
    word: "candid",
    language: "en",
    meaning: "honest and direct, sometimes bluntly so",
    examples: [
      "Her candid feedback helped the whole team improve.",
      "In a candid interview, the founder admitted the launch was rushed.",
      "I'd rather have a candid friend than a polite stranger.",
    ],
    uiLang: "en",
  },
  {
    word: "nuance",
    language: "en",
    meaning: "a subtle difference in meaning, feeling, or tone",
    examples: [
      "Translating poetry is hard because each line has its own nuance.",
      "There's a nuance between confidence and arrogance.",
      "The film captured the nuance of a long friendship.",
    ],
    uiLang: "en",
  },
  {
    word: "advocate",
    language: "en",
    meaning: "to publicly support a cause; also, a person who does so",
    examples: [
      "She advocates for cleaner air in her city.",
      "As a patient advocate, he helps others navigate the hospital.",
      "The teacher advocated for more art in the school day.",
    ],
    uiLang: "en",
  },
  {
    word: "linger",
    language: "en",
    meaning: "to stay somewhere longer than necessary",
    examples: [
      "We let the conversation linger long after dessert.",
      "The smell of coffee seemed to linger in the kitchen all morning.",
      "Don't linger at the door, come on in.",
    ],
    uiLang: "en",
  },
  {
    word: "prudent",
    language: "en",
    meaning: "acting with careful thought about future consequences",
    examples: [
      "It's prudent to save some of every paycheck.",
      "A prudent driver leaves extra space in the rain.",
      "The board made the prudent choice to wait a quarter.",
    ],
    uiLang: "en",
  },
  {
    word: "reluctant",
    language: "en",
    meaning: "unwilling or hesitant to do something",
    examples: [
      "He was reluctant to talk about the accident.",
      "She gave a reluctant nod and picked up the phone.",
      "The dog was reluctant to leave the warm couch.",
    ],
    uiLang: "en",
  },
  {
    word: "elaborate",
    language: "en",
    meaning: "to explain in more detail; also, complex or detailed",
    examples: [
      "Could you elaborate on that idea?",
      "She wore an elaborate costume to the party.",
      "The cake was decorated with elaborate sugar flowers.",
    ],
    uiLang: "en",
  },
  {
    word: "concise",
    language: "en",
    meaning: "giving a lot of information in few words",
    examples: [
      "Please keep the summary concise, one paragraph max.",
      "His writing style is concise but never dry.",
      "A concise answer respects the reader's time.",
    ],
    uiLang: "en",
  },
  {
    word: "curiosity",
    language: "en",
    meaning: "a strong desire to know or learn something",
    examples: [
      "Her curiosity led her to study bees for twenty years.",
      "Kids are born with an endless curiosity about the world.",
      "Out of curiosity, I opened the drawer.",
    ],
    uiLang: "en",
  },
  {
    word: "gratitude",
    language: "en",
    meaning: "the feeling of being thankful",
    examples: [
      "He wrote a short note of gratitude to his mentor.",
      "Practicing gratitude every morning changed her mood.",
      "The team expressed gratitude for the small win.",
    ],
    uiLang: "en",
  },
  {
    word: "hesitate",
    language: "en",
    meaning: "to pause before doing or saying something",
    examples: [
      "Don't hesitate to ask if you need help.",
      "She hesitated at the door, then walked in.",
      "He hesitated for a moment before signing.",
    ],
    uiLang: "en",
  },
  {
    word: "genuine",
    language: "en",
    meaning: "real and not fake; also, sincere",
    examples: [
      "Her smile was genuine, not for the camera.",
      "The store only sells genuine leather bags.",
      "It was a genuine attempt to help.",
    ],
    uiLang: "en",
  },
];

// ─── Adult Hebrew ──────────────────────────────────────────────
// אוצר מילים שדוברי עברית בוגרים עובדים על ההעמקה שלו — פעלים
// עדינים, מושגים מדויקים, ניואנסים.
const CURATED_ADULT_HE: PlayWord[] = [
  {
    word: "התמדה",
    language: "he",
    meaning: "המשך פעולה או מאמץ לאורך זמן, גם כשקשה",
    examples: [
      "היא הגיעה להישגים בזכות התמדה בלימודים.",
      "הצוות הראה התמדה יוצאת דופן במשך כל השנה.",
      "בלי התמדה יומיומית, אימון לא נותן תוצאות.",
    ],
    uiLang: "he",
  },
  {
    word: "מודעות",
    language: "he",
    meaning: "הבנה עצמית או הכרה במשהו קיים, פנימי או חיצוני",
    examples: [
      "פיתחתי מודעות לחשיבות של שינה טובה.",
      "הקורס נועד להעלות את המודעות לזכויות עובדים.",
      "מודעות עצמית היא הצעד הראשון לשינוי.",
    ],
    uiLang: "he",
  },
  {
    word: "עדינות",
    language: "he",
    meaning: "רוך, זהירות ורגישות בגישה או במגע",
    examples: [
      "הוא לימד את הילד לרכוב באופניים בעדינות רבה.",
      "התמונה מציגה עדינות רבה בהעברת רגש.",
      "היא ענתה בעדינות אבל בבירור.",
    ],
    uiLang: "he",
  },
  {
    word: "סלחני",
    language: "he",
    meaning: "מסוגל לסלוח בקלות, לא נוטר טינה",
    examples: [
      "היחסים שלהם החזיקו כי שניהם היו סלחניים.",
      "מנהיג טוב הוא סלחני כלפי טעויות בלתי מכוונות.",
      "הוא זוכה בכבוד כי הוא סלחני אבל לא נאיבי.",
    ],
    uiLang: "he",
  },
  {
    word: "ענווה",
    language: "he",
    meaning: "צניעות, היעדר יומרה למרות הצלחה או ידע",
    examples: [
      "המדען קיבל את הפרס בענווה.",
      "יש בו ענווה אמיתית, לא רק חיצונית.",
      "ענווה היא סימן של ביטחון עצמי בשל.",
    ],
    uiLang: "he",
  },
  {
    word: "יזמות",
    language: "he",
    meaning: "הפיכת רעיון למציאות עסקית או פרויקטלית",
    examples: [
      "היזמות הישראלית ידועה בעולם בזכות הישגיה.",
      "היא בחרה בקריירה של יזמות במקום עבודה תאגידית.",
      "יזמות דורשת יכולת לספוג כישלונות בלי לוותר.",
    ],
    uiLang: "he",
  },
  {
    word: "בהירות",
    language: "he",
    meaning: "צלילות מחשבה או ביטוי, ללא בלבול",
    examples: [
      "יש בהירות מיוחדת בכתיבה שלה.",
      "ההסבר שלו היה מלא בהירות ופשטות.",
      "אחרי שינה טובה אני מרגיש בהירות מחשבתית.",
    ],
    uiLang: "he",
  },
  {
    word: "אמפתיה",
    language: "he",
    meaning: "יכולת להרגיש ולהבין את הרגשות של אדם אחר",
    examples: [
      "המורה הצליחה בזכות אמפתיה גדולה לתלמידים.",
      "אמפתיה נלמדת בעיקר בבית ולא בבית ספר.",
      "בלי אמפתיה קשה לנהל צוות בהצלחה.",
    ],
    uiLang: "he",
  },
  {
    word: "התמסרות",
    language: "he",
    meaning: "מסירה עצמית מלאה לפעילות או לקשר",
    examples: [
      "הוא ידוע בהתמסרות שלו למקצוע כבר עשרים שנה.",
      "התמסרות מלאה לפרויקט לפעמים באה על חשבון החיים.",
      "היא רוקדת בהתמסרות מוחלטת.",
    ],
    uiLang: "he",
  },
  {
    word: "בהלה",
    language: "he",
    meaning: "פחד פתאומי וחזק",
    examples: [
      "אחזה בי בהלה של רגע כשלא מצאתי את הארנק.",
      "אין סיבה לפרוץ בצעקות, זו לא בהלה אמיתית.",
      "הידיעה עוררה בהלה בקרב התושבים.",
    ],
    uiLang: "he",
  },
  {
    word: "הכרה",
    language: "he",
    meaning: "מודעות, זיהוי; גם — הודאה ברשמיות",
    examples: [
      "הצבא נתן לו הכרה על שרותו המצטיין.",
      "היא הגיעה להכרה שהיא צריכה להחליף עבודה.",
      "הפרויקט מקבל הכרה בינלאומית.",
    ],
    uiLang: "he",
  },
  {
    word: "ספקן",
    language: "he",
    meaning: "מי שנוטה לפקפק לפני שהוא מקבל דבר כאמת",
    examples: [
      "הוא ספקן בטבעו וזה עוזר לו כעיתונאי.",
      "ספקן בריא לא הופך אותך לציני.",
      "היא ניגשה לטענה בגישה ספקנית.",
    ],
    uiLang: "he",
  },
  {
    word: "יוזמה",
    language: "he",
    meaning: "פתיחה של פעולה חדשה מרצון עצמי",
    examples: [
      "היא הראתה יוזמה כשהציעה שיפוץ למשרד.",
      "היוזמה החדשה של העיריה זכתה לתגובות חמות.",
      "בלי יוזמה מהצוות, המנהל לא היה יודע על הבעיה.",
    ],
    uiLang: "he",
  },
  {
    word: "מרפא",
    language: "he",
    meaning: "משהו שמביא ריפוי או הקלה",
    examples: [
      "הזמן הוא לפעמים המרפא הטוב ביותר.",
      "המרפא הגיע לאחר טיפול ממושך.",
      "לעיסוק בטבע יש כוח מרפא.",
    ],
    uiLang: "he",
  },
  {
    word: "יושרה",
    language: "he",
    meaning: "עמידה בעקרונות מוסריים גם כשקשה",
    examples: [
      "היא בחרה להתפטר מתוך יושרה.",
      "יושרה מקצועית חשובה יותר מרווח קצר טווח.",
      "המנהיג נודע ביושרה שלו במשך עשרות שנים.",
    ],
    uiLang: "he",
  },
];

// ─── Kids English ──────────────────────────────────────────────
// Concrete objects, playground words, family life. Meanings written
// the way a parent would explain them to a curious child, not a
// dictionary abstract.
const CURATED_KIDS_EN: PlayWord[] = [
  {
    word: "brave",
    language: "en",
    meaning: "willing to do something scary or hard",
    examples: [
      "It was brave of you to try the big slide.",
      "The brave puppy walked right up to the horse.",
      "You don't have to be big to be brave.",
    ],
    uiLang: "en",
  },
  {
    word: "gentle",
    language: "en",
    meaning: "soft and careful, not rough",
    examples: [
      "Be gentle with the baby chicks.",
      "Grandma gave the flowers a gentle spray of water.",
      "The wind was gentle enough to sail but not to knock things over.",
    ],
    uiLang: "en",
  },
  {
    word: "curious",
    language: "en",
    meaning: "wanting to know or learn about something",
    examples: [
      "The curious cat opened every drawer in the room.",
      "I'm curious what's inside the wrapped box.",
      "Kids are naturally curious about how things work.",
    ],
    uiLang: "en",
  },
  {
    word: "cheerful",
    language: "en",
    meaning: "happy and bright in the way you feel or act",
    examples: [
      "Her cheerful voice made the whole class laugh.",
      "Even on a rainy day he was cheerful.",
      "The classroom felt cheerful with all the drawings on the walls.",
    ],
    uiLang: "en",
  },
  {
    word: "clever",
    language: "en",
    meaning: "smart at finding good ideas or solutions",
    examples: [
      "That was a clever way to fold the paper airplane.",
      "The clever fox found food even in winter.",
      "She had a clever plan to hide the surprise.",
    ],
    uiLang: "en",
  },
  {
    word: "friend",
    language: "en",
    meaning: "someone you like and enjoy spending time with",
    examples: [
      "My best friend lives right next door.",
      "A good friend listens when you're sad.",
      "New friends can turn into lifelong friends.",
    ],
    uiLang: "en",
  },
  {
    word: "help",
    language: "en",
    meaning: "to do something that makes another person's job easier",
    examples: [
      "Can you help me set the table for dinner?",
      "She helped her little brother tie his shoes.",
      "Asking for help is a sign of being brave.",
    ],
    uiLang: "en",
  },
  {
    word: "share",
    language: "en",
    meaning: "to let someone else have or use part of what is yours",
    examples: [
      "Let's share the cookies with everyone.",
      "He shared his umbrella with the girl in the rain.",
      "Sharing your toys makes playing more fun.",
    ],
    uiLang: "en",
  },
  {
    word: "listen",
    language: "en",
    meaning: "to pay attention to a sound or to what someone is saying",
    examples: [
      "Listen for the school bell.",
      "When we listen well, we understand each other better.",
      "The baby listened carefully to the music box.",
    ],
    uiLang: "en",
  },
  {
    word: "explore",
    language: "en",
    meaning: "to look around a new place to see what is there",
    examples: [
      "We spent all afternoon exploring the forest trail.",
      "The rover explores rocks on Mars.",
      "Kids love to explore attics and old boxes.",
    ],
    uiLang: "en",
  },
  {
    word: "wonder",
    language: "en",
    meaning: "to ask yourself a question about something amazing",
    examples: [
      "I wonder how a bee knows where its home is.",
      "She looked up at the stars and wondered how far they were.",
      "Never lose your sense of wonder.",
    ],
    uiLang: "en",
  },
  {
    word: "kind",
    language: "en",
    meaning: "acting nicely and thinking about other people's feelings",
    examples: [
      "It was kind of you to save me a seat.",
      "A kind word can make someone's whole day.",
      "The kind neighbour helped carry the groceries upstairs.",
    ],
    uiLang: "en",
  },
];

// ─── Kids Hebrew ───────────────────────────────────────────────
// מילים שילד בכיתה א-ו פוגש בבית, בגן ובבית הספר. פירושים כמו שהורה
// היה מסביר לילד סקרן.
const CURATED_KIDS_HE: PlayWord[] = [
  {
    word: "אמיץ",
    language: "he",
    meaning: "מוכן לעשות משהו קשה או מפחיד",
    examples: [
      "היה אמיץ מצדך לדבר מול כל הכיתה.",
      "הכלב הקטן היה אמיץ מכולם ליד החתול הגדול.",
      "אתה לא חייב להיות גדול כדי להיות אמיץ.",
    ],
    uiLang: "he",
  },
  {
    word: "עדין",
    language: "he",
    meaning: "רך וזהיר, לא חזק מדי",
    examples: [
      "תהיה עדין עם הגור החדש.",
      "היא ליטפה את הפרפר במגע עדין.",
      "הרוח היתה עדינה, בדיוק כמו שאהבנו.",
    ],
    uiLang: "he",
  },
  {
    word: "סקרן",
    language: "he",
    meaning: "רוצה לדעת יותר, מתעניין בהכל",
    examples: [
      "החתול הסקרן פתח את כל המגירות בחדר.",
      "ילדים סקרנים לומדים דברים חדשים בכל יום.",
      "הייתי סקרן לדעת מה מסתתר בקופסא.",
    ],
    uiLang: "he",
  },
  {
    word: "חכם",
    language: "he",
    meaning: "מוצא רעיונות טובים ופתרונות למרות שקשה",
    examples: [
      "זה היה רעיון חכם מאוד לקחת מטריה.",
      "ילד חכם יודע לבקש עזרה כשצריך.",
      "מי שבאמת חכם יודע גם להקשיב.",
    ],
    uiLang: "he",
  },
  {
    word: "חבר",
    language: "he",
    meaning: "מישהו שאתה אוהב להיות איתו ולשחק איתו",
    examples: [
      "החבר הכי טוב שלי גר בבניין שלי.",
      "חבר אמיתי מקשיב גם כשאתה עצוב.",
      "חברים חדשים יכולים להפוך לחברי כל החיים.",
    ],
    uiLang: "he",
  },
  {
    word: "לעזור",
    language: "he",
    meaning: "לעשות משהו שמקל על מישהו אחר",
    examples: [
      "אתה יכול לעזור לי לסדר את השולחן?",
      "היא עזרה לאחיה הקטן לקשור את השרוכים.",
      "לבקש עזרה זה גם סוג של אומץ.",
    ],
    uiLang: "he",
  },
  {
    word: "לחלוק",
    language: "he",
    meaning: "לתת למישהו אחר חלק ממה שיש לך",
    examples: [
      "בואו נלמד לחלוק את העוגיות עם כולם.",
      "נחמד מצדך לחלוק את המטריה שלך בגשם.",
      "כשיודעים לחלוק צעצועים, המשחק יותר כיף.",
    ],
    uiLang: "he",
  },
  {
    word: "להקשיב",
    language: "he",
    meaning: "לשים לב לצליל או למה שמישהו אומר",
    examples: [
      "חשוב להקשיב כשמישהו מדבר אליך.",
      "כדאי להקשיב לפעמון של בית הספר.",
      "התינוק אוהב להקשיב לתיבת המוזיקה.",
    ],
    uiLang: "he",
  },
  {
    word: "לגלות",
    language: "he",
    meaning: "למצוא משהו חדש שלא ידעת עליו קודם",
    examples: [
      "טיילנו בחצר וגילינו קן ציפורים.",
      "המדענים גילו כוכב חדש בשמיים.",
      "אני אוהבת לגלות ספרים חדשים בספריה.",
    ],
    uiLang: "he",
  },
  {
    word: "פלא",
    language: "he",
    meaning: "משהו מדהים שמפתיע ומרגש",
    examples: [
      "הים בלילה עם כוכבים היה פלא של ממש.",
      "כל פלא בעולם מתחיל בסקרנות של מישהו.",
      "היא הסתכלה על הפרפר כמו על פלא.",
    ],
    uiLang: "he",
  },
  {
    word: "נחמד",
    language: "he",
    meaning: "מתייחס יפה, חושב על ההרגשה של אחרים",
    examples: [
      "היה נחמד מצדך לשמור לי מקום.",
      "מילה נחמדה יכולה לשמח את כל היום של מישהו.",
      "השכן הנחמד עזר לנו עם התיקים.",
    ],
    uiLang: "he",
  },
  {
    word: "לחלום",
    language: "he",
    meaning: "לראות תמונות בשינה או לדמיין משהו נהדר",
    examples: [
      "חלמתי הלילה שאני עף מעל העיר.",
      "אני חולמת להיות אסטרונאוטית.",
      "לכל אחד מותר לחלום בגדול.",
    ],
    uiLang: "he",
  },
];

// ─── Public API ────────────────────────────────────────────────

/** Get the curated fallback pool for a UI language. When kids is true
 *  we return the age-6-12 pool; otherwise the adult pool. Any UI
 *  language other than Hebrew or English falls back to English so
 *  every user sees a valid game rather than an empty state. */
export function getCuratedPlayPool(
  uiLang: string,
  kids: boolean = false,
): PlayWord[] {
  if (kids) {
    if (uiLang === "he") return CURATED_KIDS_HE;
    return CURATED_KIDS_EN;
  }
  if (uiLang === "he") return CURATED_ADULT_HE;
  return CURATED_ADULT_EN;
}

/** How many words the curated pool guarantees per lang+variant. Used
 *  by PlayClient to decide whether the notebook is "sufficient" or
 *  whether we should fall through to the curated pool. If a language
 *  is not covered we still return the EN pool size. */
export function curatedPoolSize(uiLang: string, kids: boolean = false): number {
  return getCuratedPlayPool(uiLang, kids).length;
}
