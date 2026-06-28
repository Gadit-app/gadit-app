/**
 * Etymology Artist — literal root meaning → modern word game content.
 *
 * Each round shows the LITERAL translation of a word's ancient root —
 * "river horse", "star sailor", "lion's tooth" — and four modern
 * English words. Pick the one whose origin matches the literal phrase.
 *
 * Text-only V1. V2 will replace the literal phrase with an AI-generated
 * image of the literal scene (the original "Etymology Artist" pitch).
 * The literal phrases alone are already surprising — half the players
 * never realized hippopotamus literally means river horse in Greek.
 */

export type EtymologyArtistRound = {
  /** Literal translation of the root. Often surprising or absurd. */
  literal: string;
  /** Origin language(s) for the root. */
  origin: string;
  /** Four modern English candidates. Order randomised per session. */
  options: [string, string, string, string];
  /** Index 0-3 of the correct modern word. */
  correctIdx: 0 | 1 | 2 | 3;
  /** Reveal expanding on the etymology. ≤180 chars. */
  story: string;
};

const ETYMOLOGY_ARTIST_ROUNDS_EN: EtymologyArtistRound[] = [
  {
    literal: "river horse",
    origin: "Greek hippos + potamos",
    options: ["hippopotamus", "rhinoceros", "manatee", "platypus"],
    correctIdx: 0,
    story: "Ancient Greeks saw the chunky riverine grazer and called it the obvious thing: a horse-of-the-river. The Romans borrowed the Greek directly.",
  },
  {
    literal: "star sailor",
    origin: "Greek astron + nautes",
    options: ["pilot", "captain", "astronaut", "navigator"],
    correctIdx: 2,
    story: "Coined in 1929, decades before space travel was practical. The Greeks gave us sailors, the 20th century gave us new oceans.",
  },
  {
    literal: "lion's tooth",
    origin: "French dent de lion",
    options: ["thistle", "dandelion", "marigold", "buttercup"],
    correctIdx: 1,
    story: "Medieval French herbalists noticed the jagged leaf edges and named the flower for them. The English just kept the French pronunciation.",
  },
  {
    literal: "bad star",
    origin: "Italian dis + astro",
    options: ["disaster", "catastrophe", "calamity", "tragedy"],
    correctIdx: 0,
    story: "From Renaissance astrology. A misfortune was caused by an unfavourable star position. The science is out; the word is forever.",
  },
  {
    literal: "flesh-eater",
    origin: "Greek sarx + phagein",
    options: ["sarcophagus", "carnivore", "vulture", "predator"],
    correctIdx: 0,
    story: "Greek stone coffins were thought to literally consume the body inside. The word kept the gruesome metaphor even as the practice changed.",
  },
  {
    literal: "to make alive",
    origin: "Latin vivificare",
    options: ["motivate", "rejuvenate", "vivify", "energize"],
    correctIdx: 2,
    story: "Latin vivus (alive) + facere (make). Most -ify verbs in English are 'make this' (clarify = make clear, justify = make just). Vivify = make alive.",
  },
  {
    literal: "empty orchestra",
    origin: "Japanese kara + ōkesutora",
    options: ["karaoke", "anime", "manga", "kabuki"],
    correctIdx: 0,
    story: "Born in 1971 Kobe, Japan. A drummer rigged a tape player to replace a missing band. 'Orchestra' was already a Japanese loanword from English.",
  },
  {
    literal: "without a place",
    origin: "Greek ou + topos",
    options: ["utopia", "dystopia", "exodus", "atlas"],
    correctIdx: 0,
    story: "Thomas More coined utopia in 1516 for his ideal fictional society — literally 'no place'. He was being clever: it's perfect because it cannot exist.",
  },
  {
    literal: "self moving",
    origin: "Greek autos + Latin mobilis",
    options: ["bicycle", "automobile", "locomotive", "scooter"],
    correctIdx: 1,
    story: "Coined 1875, before cars were common. Auto- means self (any motion, any context); mobile means moving. The horse no longer needed.",
  },
  {
    literal: "knowing nothing",
    origin: "Latin nescius",
    options: ["nice", "naive", "ignorant", "innocent"],
    correctIdx: 0,
    story: "Latin nescius (not knowing). It drifted from 'foolish' to 'shy' to 'precise' to 'pleasant' over 500 years. Nice has had a wild career.",
  },
  {
    literal: "fear of strangers",
    origin: "Greek xenos + phobos",
    options: ["agoraphobia", "claustrophobia", "xenophobia", "acrophobia"],
    correctIdx: 2,
    story: "Greek xenos = stranger / foreigner / guest (the same word covered all three). The fear-of-strangers sense came in modern psychology, 1880s.",
  },
  {
    literal: "the worship of bread",
    origin: "Greek artos + latreia",
    options: ["artolatry", "iconolatry", "idolatry", "bibliolatry"],
    correctIdx: 0,
    story: "Real word, used (rarely) in medieval church disputes about Communion. -latry as a suffix attaches to anything: artolatry (bread), bibliolatry (books).",
  },
  {
    literal: "lover of sound",
    origin: "Greek philos + phone",
    options: ["philanthropist", "philharmonic", "philosopher", "telephone"],
    correctIdx: 1,
    story: "Greek philos = lover. Philharmonic = lover of harmony / sound. Philosopher = lover of wisdom. Philanthropist = lover of humans. Phil- is everywhere.",
  },
];

// ─── Hebrew content ────────────────────────────────────────────
// Hebrew etymology surprises even native speakers. Words from Greek,
// Latin, Persian, Arabic — but also pure Hebrew compounds whose
// literal meaning is hidden under everyday use. Each round reveals
// a small archaeological discovery in the language.
const ETYMOLOGY_ARTIST_ROUNDS_HE: EtymologyArtistRound[] = [
  {
    literal: "סוס נהר",
    origin: "יוונית hippos + potamos",
    options: ["היפופוטם", "תנין", "סוסי ים", "תמסח"],
    correctIdx: 0,
    story: "היוונים העתיקים ראו את הבהמה השמנה במים, וקראו לו 'סוס נהר'. השם נדבק בלי שינוי דרך הלטינית עד לעברית.",
  },
  {
    literal: "מלאך הים",
    origin: "פיניקית milgah + yam",
    options: ["שיוט", "מלח (איש ים)", "אונייה", "ספן"],
    correctIdx: 1,
    story: "המלח באנייה היה במקור 'מלאך הים' — מי שמטעם הים. המילה התקצרה לאות אחת ולמלך הים שאיבד את כתרו.",
  },
  {
    literal: "אדמה בארץ זהב",
    origin: "פיניקית aurum + terra",
    options: ["דרום", "אמריקה", "אוסטרליה", "אוצר"],
    correctIdx: 1,
    story: "אֲמֵרִיגוּ וֵסְפּוּצִ'י נתן את שמו ליבשת. ה'אמריקה' הזה הוא צירוף איטלקי, לא 'ארץ זהב' — סתיר את הביטוי.",
  },
  {
    literal: "מי כובס",
    origin: "פרסית jameh + ab",
    options: ["מכבסה", "סבון", "מטליות", "תליות"],
    correctIdx: 0,
    story: "מאהֶ'בּ הפרסי = מי כביסה. נכנס לעברית התלמודית. הפך לרחיצה, אחר כך למקום, אחר כך למכבסה המודרנית.",
  },
  {
    literal: "אש בשמיים",
    origin: "יוונית astron + nautes",
    options: ["אסטרונאוט", "אסטרונום", "אאוטו-פיילוט", "טייס"],
    correctIdx: 0,
    story: "אסטרון = כוכב, נאוטס = מלח. 'מלח של כוכבים'. נטבע ב-1929, שנים לפני שיגור אדם לחלל. החזון קדם להמצאה.",
  },
  {
    literal: "אצל הלוויתן",
    origin: "ארמית leviatan",
    options: ["לוויתן", "כריש", "תמנון", "דולפין"],
    correctIdx: 0,
    story: "לוויתן הוא בעל החיים המקראי הענק. השורש 'לוי' (להתלוות / לחבר), כי הגוף השאיר אחריו מסעות אדירים.",
  },
  {
    literal: "כיסא של המלך",
    origin: "אכדית kussu + שׁ",
    options: ["כס המלוכה", "כסא", "מלכודת", "מלצר"],
    correctIdx: 0,
    story: "כיסא = שורש אכדי kussu. 'כס מלכות' = ביטוי קלאסי לכסא ההגמוני. נכנס לעברית מהשפות השמיות.",
  },
  {
    literal: "מי שכותב על-פה",
    origin: "ארמית תנא (לחזור)",
    options: ["תנא", "סופר", "פילוסוף", "רב"],
    correctIdx: 0,
    story: "תנא = מי שמכיר על-פה את המסורת ושנה אותה לתלמידיו. השורש הארמי שׁנ״י = לחזור, ללמד שוב ושוב.",
  },
  {
    literal: "הולך אל מבול",
    origin: "אכדית abubu",
    options: ["מבול", "סופה", "גשם", "ים"],
    correctIdx: 0,
    story: "מבול נכנס מהמיתוס המסופוטמי. abubu האכדי = מבול אסון. נכנס לעברית כשם פרטי לאירוע ההיסטורי-מיתי של נח.",
  },
  {
    literal: "ידיד הגרגרים",
    origin: "ארמית פילוקרון",
    options: ["פילוסוף", "פילולוג", "פילנתרופ", "פילגש"],
    correctIdx: 1,
    story: "מהיוונית philos (אוהב) + logos (מילה). 'אוהב מילים'. פילולוג = חוקר השפה. הגרגרים מטאפורה לדברי אומנות מילים.",
  },
  {
    literal: "סופג מים מהאדמה",
    origin: "ארמית ספג",
    options: ["ספוג", "סבוגה", "סדק", "טפיל"],
    correctIdx: 0,
    story: "ספג בארמית = שתי, ספיגה. נכנס לעברית התלמודית. הצורה הביולוגית של ספוג ים הגיעה אחר כך, כשהתחילו ללקטו.",
  },
  {
    literal: "אוכל הכל",
    origin: "יוונית pan + phagein",
    options: ["טבעוני", "צמחוני", "אוכל-כל", "צרכן"],
    correctIdx: 2,
    story: "פאן = הכל, פגיין = לאכול. 'אוכל הכל'. ביטוי שעבר לטינית גם לאנגלית כ omnivore. בעברית 'אוכל-כל' המנדה הוא חידוש.",
  },
  {
    literal: "ילד הים",
    origin: "ארמית ים + ילד",
    options: ["ים-בני", "ים-תלמיד", "ים-של-שלמה", "תלמיד-חכם"],
    correctIdx: 2,
    story: "'ים של שלמה' = ספר תלמודי הכולל יסודות הים של חכמה. ים = כמות גדולה, שלמה = שלמות. ילד הים = מקור הידע.",
  },
];

const ROUNDS_BY_LANG: Record<string, EtymologyArtistRound[]> = {
  en: ETYMOLOGY_ARTIST_ROUNDS_EN,
  he: ETYMOLOGY_ARTIST_ROUNDS_HE,
};

export function pickEtymologyArtistRounds(
  count: number,
  lang: string = "en",
): { rounds: EtymologyArtistRound[]; contentLang: string } {
  const contentLang = ROUNDS_BY_LANG[lang] ? lang : "en";
  const pool = ROUNDS_BY_LANG[contentLang];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { rounds: shuffled.slice(0, count), contentLang };
}
