/**
 * Time Traveler — etymology meaning-shift game content.
 *
 * Each round shows a HISTORICAL meaning (often surprising — what a word
 * meant 200-1000 years ago) and three modern words. The player picks
 * the modern word that descended from that meaning.
 *
 * The "wait, *nice* used to mean *stupid*?!" reaction is the whole game.
 * Every reveal is a tiny piece of trivia worth re-telling.
 *
 * Why curated: etymology shifts are well-documented historical facts.
 * Generating them via LLM risks hallucination ("awful actually used to
 * mean..." → no it didn't). Curated content from authoritative sources
 * (OED, Etymonline) keeps us honest.
 */

export type TimeTravelerRound = {
  /** What the word USED to mean (often surprising). 1-2 lines. */
  oldMeaning: string;
  /** Three options. Order randomised per session. */
  options: [string, string, string];
  /** Index 0/1/2 of the correct modern word. */
  correctIdx: 0 | 1 | 2;
  /** Short reveal explaining the drift. ≤180 chars. */
  story: string;
  /** Approximate century the old meaning was used, for the timeline. */
  era: string;
};

const TIME_TRAVELER_ROUNDS_EN: TimeTravelerRound[] = [
  {
    oldMeaning: "Foolish, ignorant, or simple-minded.",
    options: ["nice", "wise", "mean"],
    correctIdx: 0,
    story: "From Latin nescius (ignorant). Drifted through 'shy' (14c), 'precise' (17c), 'pleasant' (18c+). One word, six personalities across the centuries.",
    era: "13th century",
  },
  {
    oldMeaning: "Inspiring awe — full of wonder and reverence.",
    options: ["amazing", "awful", "horrid"],
    correctIdx: 1,
    story: "Awful = 'awe-ful'. Shakespeare meant 'majestic'. By the 1800s the negative sense took over. Awesome kept the positive job.",
    era: "13th century",
  },
  {
    oldMeaning: "Causing terror — frightening to behold.",
    options: ["terrible", "thrilling", "terrific"],
    correctIdx: 2,
    story: "Same root as terror. Both 'terrific' and 'terrible' started as fear words; only terrific flipped to positive in the 1880s.",
    era: "17th century",
  },
  {
    oldMeaning: "Carefree, light-hearted, joyful.",
    options: ["jolly", "gay", "merry"],
    correctIdx: 1,
    story: "Until the 1960s, gay just meant cheerful. Christmas carols still use the original sense. Words don't ask permission to shift.",
    era: "12th-19th century",
  },
  {
    oldMeaning: "Showing skill, learning, and sophistication. A compliment.",
    options: ["wise", "clever", "cunning"],
    correctIdx: 2,
    story: "Cunning was praise — meant 'knowing one's craft'. Only after 1600 did it pick up the sneaky edge it has today.",
    era: "12th-16th century",
  },
  {
    oldMeaning: "A young person of any gender.",
    options: ["lad", "child", "girl"],
    correctIdx: 2,
    story: "In medieval English, 'girl' meant any kid. The female-specific meaning didn't lock in until the 1500s.",
    era: "13th century",
  },
  {
    oldMeaning: "Mischievous, sly, or cunning. Usually rude.",
    options: ["naughty", "wanton", "pretty"],
    correctIdx: 2,
    story: "Pretty meant 'crafty' or 'tricksy' in Old English. The 'attractive' meaning is a Tudor-era softening.",
    era: "Old English",
  },
  {
    oldMeaning: "A wretched person or peasant.",
    options: ["lord", "villain", "knave"],
    correctIdx: 1,
    story: "Villain meant 'farm worker' (from villa = country house). The 'evil character' meaning came from rich snobbery toward the rural poor.",
    era: "14th century",
  },
  {
    oldMeaning: "Worthy of mention — notable or remarkable.",
    options: ["egregious", "elegant", "exquisite"],
    correctIdx: 0,
    story: "Egregious = ex grege ('outside the flock' — i.e. standing out). Originally praise. Now means 'shockingly bad'. Total 180 since the 1500s.",
    era: "16th century",
  },
  {
    oldMeaning: "A young man, especially a servant.",
    options: ["boy", "knight", "knave"],
    correctIdx: 2,
    story: "Knave used to be the German Knabe — just a boy. Card decks still use it for the Jack. The 'scoundrel' sense is a downgrade.",
    era: "Old English",
  },
  {
    oldMeaning: "Glaringly bright, dazzling, or noisy.",
    options: ["loud", "glaring", "garish"],
    correctIdx: 2,
    story: "Originally any bright, attention-grabbing thing. Drifted to 'tastelessly flashy' in the 1700s. Same word, harsher judgment.",
    era: "16th century",
  },
  {
    oldMeaning: "Decisive, final — having reached an end.",
    options: ["terminal", "ultimate", "definite"],
    correctIdx: 1,
    story: "From Latin ultimus (last). 'Ultimate Frisbee' kept the original 'final' sense; everyday English drifted to mean 'best'.",
    era: "14th century",
  },
  {
    oldMeaning: "Wide-awake; keen and energetic.",
    options: ["smart", "alert", "savvy"],
    correctIdx: 0,
    story: "Smart originally meant 'sharp, stinging' (think 'a smart slap'). 'Clever' is a relative newcomer — only since the 1800s.",
    era: "Old English",
  },
  {
    oldMeaning: "Filled with grief, sad, sorrowful.",
    options: ["happy", "merry", "silly"],
    correctIdx: 2,
    story: "Silly comes from Old English sælig — 'blessed, holy'. Drifted through 'innocent' → 'weak' → 'foolish'. Holy man to clown in 1,000 years.",
    era: "Old English",
  },
  {
    oldMeaning: "A meal — what you sat down and chewed.",
    options: ["meat", "snack", "supper"],
    correctIdx: 0,
    story: "Meat originally meant any solid food. 'Sweetmeats' kept the old sense. The flesh-only meaning narrowed in the 1300s.",
    era: "Old English",
  },
  {
    oldMeaning: "A small, weak, or trivial thing.",
    options: ["puny", "petty", "modest"],
    correctIdx: 1,
    story: "Petty is just French petit. Lost the neutral 'small' meaning, kept only the dismissive one. 'Petty crime' = small crime, but petty person = jerk.",
    era: "14th century",
  },
  {
    oldMeaning: "A bird's claw or talon.",
    options: ["fang", "clutch", "ferocious"],
    correctIdx: 2,
    story: "Ferocious is from Latin ferox — 'of the wild beast', literally meaning having sharp claws. The adjective took over; the talons were forgotten.",
    era: "Latin",
  },
  {
    oldMeaning: "Reasonable — based on solid common sense.",
    options: ["sane", "obvious", "sensible"],
    correctIdx: 2,
    story: "Sensible meant 'evident to the senses'. Drifted to 'showing good sense'. The shoe brand picks the second meaning — sensible shoes, not perceivable ones.",
    era: "15th century",
  },
  {
    oldMeaning: "Pleasant, gentle, and good-natured.",
    options: ["kind", "gentle", "naive"],
    correctIdx: 2,
    story: "Naive comes from Latin nativus — 'native, natural'. Originally meant unspoiled by city tricks. Now means gullible. Same word, harsher world.",
    era: "16th century",
  },
  {
    oldMeaning: "Skilled in cooking and kitchen craft.",
    options: ["sophisticated", "refined", "fancy"],
    correctIdx: 2,
    story: "Fancy is short for 'fantasy'. Originally about decorative cooking (fancy cakes). The 'expensive' meaning came later. Word kept the eye-candy job.",
    era: "16th century",
  },
  {
    oldMeaning: "Madness or insanity. A serious medical condition.",
    options: ["fury", "frenzy", "fanatic"],
    correctIdx: 1,
    story: "Frenzy comes from Greek phrēn (mind) + dis-ease. Once a clinical term. Now means any wild excitement — 'shopping frenzy'. The Romans wouldn't be amused.",
    era: "14th century",
  },
  {
    oldMeaning: "A person on a religious pilgrimage.",
    options: ["traveler", "tourist", "pilgrim"],
    correctIdx: 1,
    story: "Tourist comes from 'tour' (a circuit). For 200 years it specifically meant religious pilgrim. The Grand Tour aristocrats secularized it in the 1700s.",
    era: "17th-18th century",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew etymology shifts. The Tanakh and Mishna give us a rich
// archaeological record of how Hebrew words have drifted — sometimes
// dramatically — over 3,000 years. Each story is a tiny piece of
// Hebrew linguistic history.
const TIME_TRAVELER_ROUNDS_HE: TimeTravelerRound[] = [
  {
    oldMeaning: "אדם בעל מנוחה ויישוב — עשיר, בעל הון.",
    options: ["מסכן", "עני", "אביון"],
    correctIdx: 0,
    story: "מ-מ׳ + שכן (יישוב, מנוחה). פעם 'מסכן' היה מי שיש לו ישוב יציב. דרך לטינית miser (אומלל) המשמעות התהפכה.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "ידיד קרוב או בן ברית.",
    options: ["אלוף", "חבר", "רֵעַ"],
    correctIdx: 0,
    story: "במקרא 'אלוף' = ידיד נאמן ('אלופנו עזבנו' — חברנו עזבנו). המשמעות 'מנצח / ראש שבט' היא מאוחרת.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "פעולה של רעש או טלטול.",
    options: ["נער", "ילד", "צעיר"],
    correctIdx: 0,
    story: "מהשורש נ.ע.ר (לנער, להתנער). 'נער' פעם היה כל מי שמרעיש, ילד או משרת. המשמעות 'צעיר' לבדה התגבשה מאוחר יותר.",
    era: "תנ״כית",
  },
  {
    oldMeaning: "אצל, ליד — מילת מקום.",
    options: ["איתו", "אצלו", "עמו"],
    correctIdx: 1,
    story: "בעברית מקראית 'אצל' היה רק מקומי ('אצל הבאר'). המשמעות 'בבעלות / בידיעת' היא חידוש של ימי הביניים.",
    era: "ימי הביניים",
  },
  {
    oldMeaning: "פעולת הריגה והשמדה.",
    options: ["אוכל", "טורף", "אופה"],
    correctIdx: 0,
    story: "'אש אוכלת' = אש משמידה. 'חרב אוכלת' = חרב הורגת. רק במאות האחרונות 'אוכל' התמקד במזון אדם.",
    era: "תנ״כית",
  },
  {
    oldMeaning: "חלל שאליו נכנסים — חודרים אליו.",
    options: ["חדר", "בית", "אולם"],
    correctIdx: 0,
    story: "מהשורש ח.ד.ר (לחדור, להיכנס פנימה). פעם 'חדר' היה הפעולה. אחר כך הפך לשם המקום שחודרים אליו.",
    era: "מקראית מאוחרת",
  },
  {
    oldMeaning: "אדם שאינו זר — בן הארץ.",
    options: ["אזרח", "תושב", "ילדיד"],
    correctIdx: 0,
    story: "'אזרח' במקרא = 'ילד הארץ' לעומת 'גר'. השפה החדשה אימצה את המילה למעמד פוליטי-משפטי.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "להאיר, להבריק (פועל).",
    options: ["צוהר", "שחר", "כוכב"],
    correctIdx: 1,
    story: "בעברית עתיקה 'שחר' היה פועל (לדרוש, לחפש מוקדם בבוקר). המשמעות 'הוד הבוקר' היא של תהילים.",
    era: "מקראית מוקדמת",
  },
  {
    oldMeaning: "אישה שנותנת חלב מבית אביה — אינה אם.",
    options: ["שפחה", "מינקת", "אומנת"],
    correctIdx: 1,
    story: "במקרא 'מינקת' היא אישה שמינקת את התינוק עבור משפחה אחרת. תפקיד מקצועי לא רק ביולוגי.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "מי שמלמד דבריו על-פה.",
    options: ["משנן", "מורה", "תנא"],
    correctIdx: 2,
    story: "'תנא' מהשורש שנ״י (לחזור, לשנן). תנא במשנה = מי שמכיר את הטקסטים על-פה. הפך למלומד היסטורי.",
    era: "תקופת המשנה",
  },
  {
    oldMeaning: "חלק, גורל, חבל ארץ.",
    options: ["חבל", "גזרה", "מנה"],
    correctIdx: 1,
    story: "'גזרה' פעם הייתה חבל ארץ ('גזרה לבת ים'). הפך אחר כך ל'גזרת דין', 'גזרת חוק', וגם 'גזרת אישה'.",
    era: "תנ״כית-תלמודית",
  },
  {
    oldMeaning: "כלי גדול לאחסון תבואה.",
    options: ["מטמון", "אסם", "אוצר"],
    correctIdx: 2,
    story: "'אוצר' במקרא = מחסן פיזי לתבואה או מטבעות. המשמעות הפיגורטיבית ('אוצר בלום') מאוחרת.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "פלא, נס שמיימי.",
    options: ["מופת", "אות", "ניסי"],
    correctIdx: 0,
    story: "'מופת' במקרא = פלא של ממש ('עשיתי בה את אותותיי ואת מופתיי'). היום נשתמש בו ל'דוגמה לחיקוי'.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "מקום שבו מתאספים לעבודה משותפת.",
    options: ["יער", "בית", "חצר"],
    correctIdx: 2,
    story: "'חצר' במקרא = שטח פתוח לאספה, מרכז חיים. רק מאוחר התכווצה למשמעות 'שטח קטן בין בתים'.",
    era: "תקופת המקרא",
  },
];

// ─── Per-language router ───────────────────────────────────────
const ROUNDS_BY_LANG: Record<string, TimeTravelerRound[]> = {
  en: TIME_TRAVELER_ROUNDS_EN,
  he: TIME_TRAVELER_ROUNDS_HE,
};

export function pickTimeTravelerRounds(
  count: number,
  lang: string = "en",
): { rounds: TimeTravelerRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
