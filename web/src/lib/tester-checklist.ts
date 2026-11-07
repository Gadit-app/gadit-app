/**
 * The testers' QA checklist (Gadi 2026-11-02): every game in Gadit, what to
 * play and what to check, for Osher (12, Hebrew) and Dean (8, English).
 * Each child ticks their own copy on /tester (users/{uid}.testerChecks);
 * the same list prints (scratchpad build of the printable sheets).
 * Plain data, no imports, so a script can read it too.
 */

export type CheckItem = { id: string; he: string; en: string };
export type CheckSection = { id: string; he: string; en: string; where: { he: string; en: string }; together?: boolean; items: CheckItem[]; link?: string };

/** The checks every game gets, around its own. */
function game(id: string, he: string, en: string, where: { he: string; en: string }, own: [string, string][], together = false): CheckSection {
  return {
    id, he, en, where, together,
    items: [
      { id: `${id}.play`, he: "שיחקתי סיבוב שלם עד הסוף", en: "I played a whole round to the end" },
      ...own.map(([h, e], i) => ({ id: `${id}.c${i + 1}`, he: h, en: e })),
      { id: `${id}.listen`, he: "הקשבתי למילים: כולן נקראו נכון", en: "I listened to the words: all were read right" },
      { id: `${id}.typo`, he: "חיפשתי שגיאות כתיב ותשובות לא נכונות", en: "I looked for spelling mistakes and wrong answers" },
      { id: `${id}.x`, he: "לחצתי ✕ באמצע וזה יצא מהמשחק", en: "I pressed ✕ in the middle and it left the game" },
      { id: `${id}.rate`, he: "שלחתי דירוג ב-🧪", en: "I sent a rating with 🧪" },
    ],
  };
}

const PLAY = { he: "משחקים ← מהמחברת שלכם", en: "Play → From your notebook" };
const WORDS = { he: "משחקים ← משחקי מילים", en: "Play → Word games" };
const CATCH = { he: "משחקים ← 🧪 תופסים אותיות", en: "Play → 🧪 Letter Catch" };
const WORLDS = { he: "משחקים ← עולמות המילים", en: "Play → Word Worlds" };
const DUEL = { he: "משחקים ← שחקו עם מישהו", en: "Play → Play with someone" };

export const CHECKLIST: CheckSection[] = [
  {
    id: "start", he: "לפני שמתחילים", en: "Before you start", where: { he: "פעם אחת", en: "Once" },
    items: [
      { id: "start.me", he: "בראש המסך כתוב השם שלי", en: "My name is at the top of the screen" },
      { id: "start.fab", he: "אני רואה את עיגול ה-🧪 ואת ה-💰 בצד", en: "I can see the 🧪 circle and the 💰 on the side" },
      { id: "start.mic", he: "שלחתי הקלטת בדיקה ב-🧪, ואישרתי מיקרופון", en: "I sent a test voice note with 🧪 and allowed the microphone" },
      { id: "start.pay", he: "פתחתי את 💰 התשלום החודשי שלי", en: "I opened 💰 My monthly pay" },
      { id: "start.sound", he: "כיביתי והדלקתי צלילים בכפתור ♫", en: "I turned sounds off and on with the ♫ button" },
    ],
  },

  // What was built from the testers' own notes (Gadi 2026-11-07): one
  // section per fixed game, so a tester can tick that the fix really works.
  {
    id: "fixed-catch", he: "חדש! תיקנו לפי מה שביקשתם: גחליליות", en: "New! Fixed from your notes: Fireflies", where: CATCH,
    items: [
      { id: "fixed-catch.pace", he: "בכרטיס המילה בחרתי 🐢 איטי, 🙂 רגיל ו-🚀 מהיר, והגחליליות באמת זזו לאט או מהר", en: "On the word card I picked 🐢 slow, 🙂 normal and 🚀 fast, and the fireflies really moved slow or fast" },
      { id: "fixed-catch.decoys", he: "ב-🙂 רגיל וב-🚀 מהיר באו קודם אותיות לא נכונות, האות הנכונה לא הגיעה מיד", en: "On 🙂 normal and 🚀 fast, wrong letters came first, the right letter did not come straight away" },
      { id: "fixed-catch.ring", he: "טעיתי פעמיים בכוונה: טבעת הבהבה סביב האות הנכונה והשאר החווירו", en: "I made two mistakes on purpose: a ring blinked around the right letter and the others went pale" },
      { id: "fixed-catch.ok", he: "הכול עובד כמו שביקשתי (אם לא, שלחתי הקלטה ב-🧪)", en: "It all works the way I asked (if not, I sent a voice note with 🧪)" },
    ],
  },
  {
    id: "fixed-duel", he: "חדש! תיקנו לפי מה שביקשתם: דו קרב", en: "New! Fixed from your notes: Duel", where: DUEL, together: true,
    items: [
      { id: "fixed-duel.short", he: "ההגדרות קצרות ומספיקים לקרוא אותן", en: "The meanings are short and I have time to read them" },
      { id: "fixed-duel.three", he: "יש 3 תשובות לבחירה ולא 4", en: "There are 3 answers to pick from, not 4" },
      { id: "fixed-duel.time", he: "לכל שאלה יש 20 שניות", en: "Each question has 20 seconds" },
      { id: "fixed-duel.ok", he: "הכול עובד כמו שביקשתי (אם לא, שלחתי הקלטה ב-🧪)", en: "It all works the way I asked (if not, I sent a voice note with 🧪)" },
    ],
  },

  // Letter Catch
  game("fireflies", "תופסים אותיות: גחליליות", "Letter Catch: Fireflies", CATCH, [
    ["האות הנכונה תמיד מופיעה בסוף", "The right letter always shows up in the end"],
    ["טעיתי בכוונה: הינשוף או הצפרדע אמרו איזו אות זאת", "I made a mistake on purpose: the owl or frog said which letter it was"],
    ["אחרי שתי טעויות טבעת הבהבה סביב האות הנכונה", "After two mistakes a ring blinked around the right letter"],
    ["אחרי 5 מילים הצנצנת התמלאה", "After 5 words the jar filled up"],
  ]),
  game("coaster-snow", "רכבת הרים: שלג", "Roller coaster: Snow", CATCH, [
    ["השלטים מופיעים משני צדי המסילה", "The signs come on both sides of the track"],
    ["אפשר לקרוא את האותיות בזמן", "I can read the letters in time"],
    ["שום דבר לא רועד ולא כואב בעיניים", "Nothing shakes or hurts my eyes"],
  ]),
  game("coaster-jungle", "רכבת הרים: ג'ונגל", "Roller coaster: Jungle", CATCH, [
    ["השלטים מופיעים משני צדי המסילה", "The signs come on both sides of the track"],
    ["הקוף אומר איזו אות זאת כשטועים", "The monkey says which letter it was when I'm wrong"],
    ["שום דבר לא רועד ולא כואב בעיניים", "Nothing shakes or hurts my eyes"],
  ]),
  game("coaster-space", "רכבת הרים: חלל", "Roller coaster: Space", CATCH, [
    ["השלטים מופיעים משני צדי המסילה", "The signs come on both sides of the track"],
    ["החייזר אומר איזו אות זאת כשטועים", "The alien says which letter it was when I'm wrong"],
    ["שום דבר לא רועד ולא כואב בעיניים", "Nothing shakes or hurts my eyes"],
  ]),
  game("fair-cans", "לונה פארק: פחיות", "Funfair: Cans", CATCH, [
    ["הכדור מגיע לפחית שלחצתי עליה", "The ball reaches the can I tapped"],
    ["הפחית הנכונה נופלת מהמדף", "The right can falls off the shelf"],
    ["המדפים זזים ואפשר לקרוא את האותיות", "The shelves move and I can read the letters"],
  ]),
  game("fair-balloons", "לונה פארק: בלונים", "Funfair: Balloons", CATCH, [
    ["הבועה מגיעה לבלון שלחצתי עליו", "The bubble reaches the balloon I tapped"],
    ["הבלון הנכון מתפוצץ לקונפטי", "The right balloon pops into confetti"],
    ["אפשר לפגוע גם בבלון שעולה גבוה", "I can hit a balloon even when it floats up high"],
  ]),
  game("fair-target", "לונה פארק: מטרה", "Funfair: Target", CATCH, [
    ["החץ נדבק לעיגול הנכון ומסתובב עם הגלגל", "The arrow sticks to the right circle and spins with the wheel"],
    ["אחרי פגיעה האותיות על הגלגל מתחלפות", "After a hit the letters on the wheel change"],
    ["הגלגל משנה כיוון ועדיין אפשר לקלוע", "The wheel changes direction and I can still hit"],
  ]),

  // Word Worlds
  {
    id: "worlds-map", he: "עולמות המילים: המפה", en: "Word Worlds: The map", where: WORLDS,
    items: [
      { id: "worlds-map.open", he: "המפה נפתחת ורואים את כל 7 העולמות", en: "The map opens and shows all 7 worlds" },
      { id: "worlds-map.lock", he: "עולם נעול כותב כמה מילים חסרות כדי לפתוח אותו", en: "A locked world says how many words are left to open it" },
      { id: "worlds-map.unlock", he: "אחרי 5 מילים נפתח העולם הבא", en: "After 5 words the next world opens" },
    ],
  },
  ...([
    ["jungle", "עולם הג'ונגל", "Jungle World"], ["space", "תחנת החלל", "Space Station"], ["castle", "טירת הקסמים", "Magic Castle"],
    ["ninja", "כפר הנינג'ות", "Ninja Village"], ["stadium", "האצטדיון", "Stadium"], ["forest", "היער הקסום", "Magic Forest"], ["city", "העיר בלילה", "City at Night"],
  ] as [string, string, string][]).map(([w, he, en]) => game(`world-${w}`, `עולמות המילים: ${he}`, `Word Worlds: ${en}`, WORLDS, [
    ["בכל דלת יש אות, ובחרתי את האות הבאה", "Every door has a letter and I picked the next letter"],
    ["דלת לא נכונה: יצאה דמות מצחיקה", "A wrong door: a funny character came out"],
    ["בשער אייתי את כל המילה", "At the gate I spelled the whole word"],
    ["המילה הופיעה בעולם שלי, ואפשר לגרור אותה", "The word showed up in my world and I can drag it"],
  ])),
  game("worlds-peek", "עולמות המילים: מסלול האותיות המציצות", "Word Worlds: Peeking letters trail", { he: "עולמות המילים ← כניסה לעולם ← 🧪 מסלול האותיות המציצות", en: "Word Worlds → enter a world → 🧪 Peeking letters trail" }, [
    ["האותיות מציצות מאחורי דברים ואפשר לתפוס אותן", "Letters peek out from behind things and I can catch them"],
    ["אחרי מילה שלמה המסלול ממשיך למילה הבאה", "After a whole word the trail goes on to the next word"],
    ["כפתור 🗺️ לוקח לעולם שלי", "The 🗺️ button takes me to my world"],
  ]),
  {
    id: "worlds-stars", he: "עולמות המילים: כוכבים וקישוטים", en: "Word Worlds: Stars and decorations", where: WORLDS,
    items: [
      { id: "worlds-stars.find", he: "מצאתי כוכבים שמתחבאים בדרך", en: "I found stars hiding along the way" },
      { id: "worlds-stars.buy", he: "קניתי קישוט בכוכבים, והוא הופיע בעולם", en: "I bought a decoration with stars and it showed up in my world" },
      { id: "worlds-stars.move", he: "הזזתי מילים וקישוטים, והם נשארו במקום", en: "I moved words and decorations and they stayed where I put them" },
    ],
  },
  {
    id: "worlds-friends", he: "עולמות המילים: חברים", en: "Word Worlds: Friends", where: WORLDS, together: true,
    items: [
      { id: "worlds-friends.add", he: "הוספנו אחד את השני כחברים עם קוד", en: "We added each other as friends with a code" },
      { id: "worlds-friends.visit", he: "ביקרתי בעולם של אחי", en: "I visited my brother's world" },
      { id: "worlds-friends.gift", he: "שלחתי מילה במתנה, והיא הגיעה", en: "I sent a word as a gift and it arrived" },
    ],
  },

  // Notebook games
  game("flashcards", "כרטיסי מילים", "Word cards", PLAY, [
    ["הכרטיס מתהפך ורואים את התשובה", "The card flips and shows the answer"],
    ["כפתורי 'ידעתי' ו'לא ידעתי' עובדים", "The 'I knew it' and 'I didn't know' buttons work"],
  ]),
  game("flashdefs", "כרטיסי הגדרות", "Definition cards", PLAY, [
    ["ההגדרה מתאימה למילה", "The meaning fits the word"],
  ]),
  game("truefalse", "נכון או לא?", "True or false?", PLAY, [
    ["כשההסבר לא שייך, באמת 'לא נכון' היא התשובה", "When the meaning doesn't belong, 'false' really is the answer"],
  ]),
  game("quiz", "חידון הגדרות", "Definition quiz", PLAY, [
    ["רק תשובה אחת נכונה בכל שאלה", "Only one answer is right in each question"],
  ]),
  game("fillblank", "השלמת משפט", "Fill the blank", PLAY, [
    ["המשפט נשמע הגיוני עם המילה הנכונה", "The sentence makes sense with the right word"],
  ]),
  game("context", "בלש ההקשר", "Context detective", PLAY, [
    ["הסיפור ברור ומבינים מה קרה", "The story is clear and I understand what happened"],
    ["המשמעות הנכונה באמת מתאימה למשפט", "The right meaning really fits the sentence"],
  ]),
  game("memory", "זיכרון", "Memory", PLAY, [
    ["כל זוג באמת מתאים אחד לשני", "Every pair really goes together"],
    ["כל הקלפים מתהפכים", "All the cards flip"],
  ]),
  game("anagram", "ערבול אותיות", "Letter scramble", PLAY, [
    ["מהאותיות אפשר לבנות רק את המילה הנכונה", "The letters make only the right word"],
  ]),
  game("speed", "חידון מהיר", "Speed quiz", PLAY, [
    ["השעון עובד והניקוד מופיע בסוף", "The timer works and the score shows at the end"],
  ]),

  // Word games
  game("twin", "מלכודת תאומים", "Twin trap", WORDS, [
    ["רק מילה אחת מתאימה למשפט", "Only one word fits the sentence"],
  ]),
  game("time", "מסע בזמן", "Time travel", WORDS, [
    ["המשמעות הישנה נשמעת נכונה (אפשר לשאול את אבא)", "The old meaning sounds right (you can ask Dad)"],
  ]),
  game("passport", "דרכון מילים", "Word passport", WORDS, [
    ["המדינה והדגל מתאימים למקור של המילה", "The country and flag fit where the word came from"],
  ]),
  game("friends", "חברים מזויפים", "False friends", WORDS, [
    ["ההסבר אומר בדיוק למה המילים שונות או דומות", "The explanation says exactly why the words differ or match"],
  ]),
  game("root", "ציד שורשים", "Root hunt", WORDS, [
    ["שלוש המילים באמת באות מאותו שורש", "The three words really come from the same root"],
  ]),
  game("shade", "סולם עוצמה", "Strength ladder", WORDS, [
    ["הסדר מהחלש לחזק נשמע הגיוני", "The order from weak to strong makes sense"],
  ]),
  game("build", "בנה מילה", "Build a word", WORDS, [
    ["החלקים בונים בדיוק את המילה", "The pieces build exactly the word"],
  ]),
  game("idiom", "מפענח ניבים", "Idiom decoder", WORDS, [
    ["הפירוש של הניב נכון", "The meaning of the idiom is right"],
  ]),
  game("lens", "עדשת משמעות", "Meaning lens", WORDS, [
    ["המשמעות שנבחרה מתאימה למשפט", "The chosen meaning fits the sentence"],
  ]),
  game("artist", "אמן אטימולוגיה", "Etymology artist", WORDS, [
    ["השורש העתיק באמת נתן את המילה", "The old root really gave this word"],
  ]),

  // Play with someone
  {
    id: "duel-same", he: "שחקו עם מישהו: על אותו מכשיר", en: "Play with someone: Same device", where: DUEL, together: true,
    items: [
      { id: "duel-same.play", he: "שיחקנו דו קרב שלם על מחשב אחד", en: "We played a whole duel on one device" },
      { id: "duel-same.turns", he: "התורות עברו נכון בינינו", en: "The turns passed between us the right way" },
      { id: "duel-same.win", he: "בסוף כתוב נכון מי ניצח", en: "At the end it says the right winner" },
      { id: "duel-same.again", he: "'עוד משחק' עובד", en: "'Play again' works" },
      { id: "duel-same.rate", he: "שלחתי דירוג ב-🧪", en: "I sent a rating with 🧪" },
    ],
  },
  {
    id: "duel-code", he: "שחקו עם מישהו: עם קוד הזמנה", en: "Play with someone: Invite code", where: DUEL, together: true,
    items: [
      { id: "duel-code.join", he: "אחד יצר קוד והשני הצטרף ממכשיר אחר", en: "One of us made a code and the other joined from another device" },
      { id: "duel-code.sync", he: "שנינו ראינו את אותן שאלות", en: "We both saw the same questions" },
      { id: "duel-code.win", he: "בסוף שנינו ראינו את אותה תוצאה", en: "At the end we both saw the same result" },
      { id: "duel-code.rate", he: "שלחתי דירוג ב-🧪", en: "I sent a rating with 🧪" },
    ],
  },
  {
    id: "duel-online", he: "שחקו עם מישהו: מי שמחובר עכשיו", en: "Play with someone: Online now", where: DUEL, together: true,
    items: [
      { id: "duel-online.find", he: "מצאנו אחד את השני ברשימה", en: "We found each other in the list" },
      { id: "duel-online.play", he: "שיחקנו עד הסוף בלי שהמשחק נתקע", en: "We played to the end without it getting stuck" },
      { id: "duel-online.rate", he: "שלחתי דירוג ב-🧪", en: "I sent a rating with 🧪" },
    ],
  },

  // More practice
  game("spell", "הכתבה", "Spelling", { he: "שיעורי בית ← הכתבה", en: "Homework → Spelling" }, [
    ["הקריין אומר את המילה ואני מקליד אותה", "The speaker says the word and I type it"],
    ["כשטעיתי, ראיתי איפה הטעות", "When I was wrong I saw where the mistake was"],
  ]),
  game("say", "תגידו את זה", "Say it", { he: "תגידו את זה", en: "Say it" }, [
    ["אמרתי מילה במיקרופון וקיבלתי תשובה אם אמרתי נכון", "I said a word into the microphone and it told me if I said it right"],
  ]),
  {
    id: "rewards", he: "דרגות ותלבושות", en: "Ranks and skins", where: { he: "האזור האישי", en: "My area" },
    items: [
      { id: "rewards.rank", he: "אחרי תרגול, הנקודות והדרגה שלי עלו", en: "After practice my points and rank went up" },
      { id: "rewards.skin", he: "נפתחה לי תלבושת חדשה ואפשר לבחור אותה", en: "A new skin opened and I can pick it" },
    ],
  },
];

/** Each section opens its game straight away (Gadi 2026-11-02); every game has its own link. */
const PLAY_IDS = new Set(["flashcards", "flashdefs", "truefalse", "quiz", "fillblank", "context", "memory", "anagram", "speed", "twin", "time", "passport", "friends", "root", "shade", "build", "idiom", "lens", "artist"]);
export function sectionLink(id: string): string {
  if (id === "start") return "/play";
  if (id === "fireflies") return "/catch?scene=fireflies";
  if (id === "fixed-catch") return "/catch?scene=fireflies";
  if (id === "fixed-duel") return "/play?game=duel";
  if (id.startsWith("coaster-")) return `/catch?scene=coaster&world=${id.slice(8)}`;
  if (id.startsWith("fair-")) return `/catch?scene=fair&stall=${id.slice(5)}`;
  if (id === "worlds-peek") return "/world/jungle?mode=peek";
  if (id === "worlds-stars") return "/world/jungle";
  if (id.startsWith("world-")) return `/world/${id.slice(6)}`;
  if (id.startsWith("worlds-")) return "/world";
  if (PLAY_IDS.has(id)) return `/play?game=${id}`;
  if (id.startsWith("duel-")) return "/play?game=duel";
  if (id === "spell") return "/homework";
  if (id === "say") return "/say";
  return "/";
}
for (const s of CHECKLIST) s.link = sectionLink(s.id);

export const CHECK_IDS: string[] = CHECKLIST.flatMap((s) => s.items.map((i) => i.id));
export const CHECK_TOTAL = CHECK_IDS.length;
