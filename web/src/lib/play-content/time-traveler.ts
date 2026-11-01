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
    story: "From Latin ultimus ('last'). In formal English it still means 'final'; everyday use later broadened to 'best' or 'most extreme'.",
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
    oldMeaning: "Blessed or fortunate.",
    options: ["happy", "merry", "silly"],
    correctIdx: 2,
    story: "Silly comes from Old English sælig ('happy, blessed'). It drifted through 'innocent' and 'helpless' before landing on 'foolish'.",
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
    oldMeaning: "Wild-beast-like; savage and untamed.",
    options: ["fang", "clutch", "ferocious"],
    correctIdx: 2,
    story: "From Latin ferox ('fierce, wild'). It first meant 'wild-beast-like'; later it broadened to any violently aggressive person or thing.",
    era: "17th century",
  },
  {
    oldMeaning: "Perceptible by the senses; capable of being felt.",
    options: ["sane", "obvious", "sensible"],
    correctIdx: 2,
    story: "Sensible meant 'evident to the senses'. Drifted to 'showing good sense'. The shoe brand picks the second meaning — sensible shoes, not perceivable ones.",
    era: "15th century",
  },
  {
    oldMeaning: "Natural, innocent, and unaffected.",
    options: ["kind", "gentle", "naive"],
    correctIdx: 2,
    story: "Naive comes from Latin nativus — 'native, natural'. Originally meant unspoiled by city tricks. Now means gullible. Same word, harsher world.",
    era: "16th century",
  },
  {
    oldMeaning: "Imagination or a personal whim.",
    options: ["sophisticated", "refined", "fancy"],
    correctIdx: 2,
    story: "Fancy is a shortening of fantasy. It first meant 'imagination' or 'a liking', then developed the modern 'ornamental' and 'expensive' senses.",
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
    oldMeaning: "A person making a tour, especially the Grand Tour.",
    options: ["traveler", "tourist", "pilgrim"],
    correctIdx: 1,
    story: "From 'tour' (a circuit). First used for people making a tour, especially the Grand Tour, then broadened to any pleasure traveler.",
    era: "18th century",
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
    options: ["אלוף", "מפקד", "מאמן"],
    correctIdx: 0,
    story: "במקרא 'אלוף' יכול להיות גם ידיד קרוב וגם ראש שבט. בעברית החדשה נשארה בעיקר המשמעות של מנהיג או מצטיין.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "משרת צעיר, שליח או נושא כלים.",
    options: ["נער", "ילד", "צעיר"],
    correctIdx: 0,
    story: "במקרא 'נער' אינו רק ילד: הוא יכול להיות גם משרת, שליח או נושא כלים. בעברית החדשה נשארה בעיקר המשמעות של צעיר.",
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
    oldMeaning: "חדר פנימי או נסתר בבית.",
    options: ["חדר", "בית", "אולם"],
    correctIdx: 0,
    story: "במקרא 'חדר' היה לרוב חדר פנימי, לעיתים מוצנע. בעברית החדשה התרחבה המילה לכל חלל נפרד.",
    era: "מקראית מאוחרת",
  },
  {
    oldMeaning: "אדם שאינו זר — בן הארץ.",
    options: ["אזרח", "תושב", "אורח"],
    correctIdx: 0,
    story: "'אזרח' במקרא = 'ילד הארץ' לעומת 'גר'. השפה החדשה אימצה את המילה למעמד פוליטי-משפטי.",
    era: "תקופת המקרא",
  },
  {
    oldMeaning: "לחפש, לדרוש בהתמדה.",
    options: ["צוהר", "שחר", "כוכב"],
    correctIdx: 1,
    story: "במקרא 'שיחר' פירושו לדרוש או לחפש בהתמדה, לעיתים משעת בוקר מוקדמת. בעברית החדשה 'שחר' מזוהה בעיקר עם הבוקר המוקדם.",
    era: "מקראית מוקדמת",
  },
  {
    oldMeaning: "אישה שמניקה תינוק שאינו שלה.",
    options: ["שפחה", "מינקת", "גננת"],
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
    oldMeaning: "מחסן או בית אוצר לתבואה ולמטבעות.",
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

// ─── Arabic content (MSA) ──────────────────────────────────────
// Classical and modern meaning shifts in Arabic. Many words from the
// Quran or pre-Islamic poetry now carry different connotations. Each
// round is a small archaeology of Arabic semantic change.
const TIME_TRAVELER_ROUNDS_AR: TimeTravelerRound[] = [
  {
    oldMeaning: "مادّةٌ زيتيّة سوداء تُستخرَج من الأرض.",
    options: ["نَفط", "زَيت", "قَطران"],
    correctIdx: 0,
    story: "كانت كلمة نَفط تُطلق قديمًا على مادّة زيتية سوداء تُستخرج من الأرض، ثم غلبت في الاستعمال الحديث بمعنى البترول.",
    era: "ما قبل الإسلام",
  },
  {
    oldMeaning: "الخمر.",
    options: ["شاي", "قَهوة", "نَبيذ"],
    correctIdx: 1,
    story: "في الجاهلية كانت قَهوة تعني الخمر. مع وصول البنّ من اليمن في القرن الخامس عشر، انتقلت إلى المشروب البني الشهير.",
    era: "ما قبل الإسلام والعصر العباسي",
  },
  {
    oldMeaning: "السكون والامتناع عن العمل.",
    options: ["نوم", "سَبت", "راحة"],
    correctIdx: 1,
    story: "السبت في العربية القديمة فعل: سَبَت = استراح وامتنع. أصبح بعد الإسلام اسم يوم. الجذر السامي مشترك مع العبرية.",
    era: "ما قبل الإسلام",
  },
  {
    oldMeaning: "مجموعة من المسافرين تسير معًا.",
    options: ["قافِلة", "سَيّارة", "رِحلة"],
    correctIdx: 1,
    story: "كلمة سيّارة في القرآن تعني قافلة من المسافرين (يوسف 19). في القرن العشرين خُصّصت للمركبة ذات المحرّك.",
    era: "العصر الجاهلي والقرآن",
  },
  {
    oldMeaning: "كلّ زمنٍ قصير أو لحظة.",
    options: ["دقيقة", "ساعة", "لحظة"],
    correctIdx: 1,
    story: "الساعة في القرآن واللغة الكلاسيكية كانت تعني أيّ فترة قصيرة (والساعة قائمة). تحدّدت لاحقًا بستين دقيقة.",
    era: "القرآن والعصر الكلاسيكي",
  },
  {
    oldMeaning: "الكائناتُ المستترة عن الأبصار.",
    options: ["شَبَح", "جِنّ", "ظِلّ"],
    correctIdx: 1,
    story: "سُمِّي الجِنّ بذلك لاستتارهم عن الأبصار. وكان اللفظ قديمًا أوسع قليلًا، ثم تحدّد في الإسلام للكائنات الروحية المعروفة.",
    era: "العصر الجاهلي",
  },
  {
    oldMeaning: "موضعُ المبيت ليلًا.",
    options: ["خَيمة", "بَيت", "فُندق"],
    correctIdx: 1,
    story: "البيت من باتَ: موضعُ المبيت ليلًا، وكان يُطلق أيضًا على الخيمة. ثم غلب في الاستعمال على المسكن الدائم.",
    era: "العصر الجاهلي",
  },
  {
    oldMeaning: "مَن يأمر ويُصدِر الأوامر.",
    options: ["مَلِك", "أمير", "زَعيم"],
    correctIdx: 1,
    story: "الأمير من الفعل أَمَرَ، أي مَن يُصدر الأوامر. كان لقبًا لأيّ قائد عسكري. تخصّص لاحقًا لأبناء الملوك والحكّام.",
    era: "العصر الإسلامي المبكّر",
  },
  {
    oldMeaning: "الرجل الكبير في السنّ.",
    options: ["مُعلّم", "شَيخ", "حَكيم"],
    correctIdx: 1,
    story: "الشيخ في الأصل هو المُسنّ بمعنى عمري بحت. اكتسب لاحقًا معنى ديني (شيخ المسجد) أو قبلي (شيخ القبيلة).",
    era: "العصر الجاهلي",
  },
  {
    oldMeaning: "أيّ شيءٍ مكتوب أو رسالة.",
    options: ["كِتاب", "وَرَقة", "رِسالة"],
    correctIdx: 0,
    story: "كلمة كتاب في القرآن تعني الرسالة أو الوثيقة (هذا كِتاب من سليمان). تحدّدت لاحقًا بمعنى المُجلّد المؤلَّف.",
    era: "القرآن",
  },
  {
    oldMeaning: "التلاوة أو القراءة.",
    options: ["قُرآن", "إلقاء", "خَطابة"],
    correctIdx: 0,
    story: "قُرآن من الجذر قرأ، وكان في الأصل مصدرًا بمعنى التلاوة أو القراءة، ثم صار اسمًا عَلَمًا للكتاب المقدّس.",
    era: "القرآن وصدر الإسلام",
  },
  {
    oldMeaning: "ما يَجمع الناسَ أو الأشياء.",
    options: ["جامعة", "نادي", "مؤتمر"],
    correctIdx: 0,
    story: "الجامعة من الجذر جمع، وهي في الأصل صفةٌ لما يضمّ أو يجمع. ثم صارت في العصر الحديث اسمًا للمؤسّسة التعليمية.",
    era: "العصر العبّاسي",
  },
];

// ─── Russian content ───────────────────────────────────────────
// Russian etymology offers dramatic surprises. Many words from Old
// Slavic or 18th-century Russian carry totally different meanings
// today. Each round is a small archaeological dig into the language.
const TIME_TRAVELER_ROUNDS_RU: TimeTravelerRound[] = [
  {
    oldMeaning: "Красота, очарование, привлекательность.",
    options: ["краса", "зараза", "уродство"],
    correctIdx: 1,
    story: "В 18 веке «зараза» значила обаяние, чары. От «заразить» — поразить (взгляд, красоту). К концу 19 века смысл сполз к болезни.",
    era: "18 век",
  },
  {
    oldMeaning: "Заклинатель, заговаривающий болезни.",
    options: ["доктор", "врач", "целитель"],
    correctIdx: 1,
    story: "Слово «врач» от «врать» — в древности значило «говорить заклинания», шептать. Лекари-шаманы заговаривали болезни. Со временем «врать» стало ложью, а «врач» остался медиком.",
    era: "Древняя Русь",
  },
  {
    oldMeaning: "Партнёр по торговле, спутник каравана.",
    options: ["купец", "товарищ", "друг"],
    correctIdx: 1,
    story: "От «товар», партнёр по торговле. В советское время стало универсальным обращением, а позже утратило этот статус.",
    era: "Древняя Русь",
  },
  {
    oldMeaning: "Тяжкий труд, рабский труд.",
    options: ["работа", "услуга", "помощь"],
    correctIdx: 0,
    story: "Корень «раб» связан с подневольным трудом. Со временем слово расширилось до нейтрального значения «труд, занятие».",
    era: "Древняя Русь",
  },
  {
    oldMeaning: "Свободный человек, кочевник.",
    options: ["казак", "странник", "беглец"],
    correctIdx: 0,
    story: "От тюркского «казак» — свободный, не подчинённый никому. Только в Российской империи термин стал означать военное сословие.",
    era: "16 век",
  },
  {
    oldMeaning: "Христианин (в противоположность язычнику).",
    options: ["мужик", "крестьянин", "земледелец"],
    correctIdx: 1,
    story: "«Крестьянин» от «христианин». В Средние века крещёные земледельцы Руси противопоставлялись язычникам. Социальный смысл пришёл позже.",
    era: "Средние века",
  },
  {
    oldMeaning: "Девственная, юная женщина.",
    options: ["девушка", "женщина", "невеста"],
    correctIdx: 0,
    story: "Корень «дева» в древнерусском — нетронутая, чистая. Современное «девушка» сохранило только возрастной оттенок, потеряв исходную семантику.",
    era: "Древняя Русь",
  },
  {
    oldMeaning: "Непригодный для воинской службы.",
    options: ["лентяй", "негодяй", "трус"],
    correctIdx: 1,
    story: "«Негодяй» в 18 веке — рекрут, не годный к службе. Постепенно слово приобрело моральную окраску и стало означать подлеца.",
    era: "18 век",
  },
  {
    oldMeaning: "Житель города или местечка.",
    options: ["мещанин", "горожанин", "купец"],
    correctIdx: 0,
    story: "«Мещанин» от польск. mieszczanin, «горожанин». В России так называли сословие городских жителей; позже слово получило оттенок «обывателя».",
    era: "17–18 век",
  },
  {
    oldMeaning: "Маленькая, изящная вещь.",
    options: ["игрушка", "сундук", "пустяк"],
    correctIdx: 2,
    story: "«Пустяк» от «пустой». Изначально нейтрально — что-то небольшое, пустотелое. С 19 века значит «несущественное», часто с пренебрежением.",
    era: "18 век",
  },
  {
    oldMeaning: "Исход дела, результат.",
    options: ["успех", "случай", "удача"],
    correctIdx: 0,
    story: "«Успех» в 18 веке значил «исход дела, результат». К 19 веку сузилось до «положительного результата».",
    era: "18 век",
  },
  {
    oldMeaning: "Маленькое окошко, отверстие в стене.",
    options: ["окно", "проём", "форточка"],
    correctIdx: 0,
    story: "«Окно» от «око» — маленький глаз дома. В древности окна были крошечными — для тепла. Современный размер — заслуга стекла Нового времени.",
    era: "Древняя Русь",
  },
];

// ─── Per-language router ───────────────────────────────────────
const ROUNDS_BY_LANG: Record<string, TimeTravelerRound[]> = {
  en: TIME_TRAVELER_ROUNDS_EN,
  he: TIME_TRAVELER_ROUNDS_HE,
  ar: TIME_TRAVELER_ROUNDS_AR,
  ru: TIME_TRAVELER_ROUNDS_RU,
};


/** Content for a language that ships as a file (Gadi 2026-10-11: native
 *  rounds for the 29 languages beyond he/en/ar/ru, loaded on the play page
 *  by lib/play-content/remote.ts). */
export function registerTimeTravelerRounds(lang: string, rounds: TimeTravelerRound[], kids?: TimeTravelerRound[]): void {
  if (rounds.length) ROUNDS_BY_LANG[lang] = rounds;
  void kids;
}

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
