# GADIT — Redesign Brief (for AI design tools)

> Two versions of the same brief: English first (for Claude/ChatGPT/Gemini/v0/Lovable/Midjourney/etc.), Hebrew below it.
> Drop the relevant section into any tool that can produce design mockups, mood boards, or UI screens.

---

## ENGLISH PROMPT

### What Gadit is

Gadit is a multilingual word-understanding app. The user types a word in any language, and Gadit returns:
- All meanings of the word (not just the dominant one)
- 3 examples per meaning
- Etymology (where the word came from, told as a short story)
- Idioms and expressions
- A generated image that visualizes the word
- Optional: a kids-friendly explanation, a quiz, "compose a sentence" practice, and a personal notebook

It works in 7 UI languages (English, Hebrew, Arabic, Russian, Spanish, Portuguese, French) with full RTL support for Hebrew and Arabic.

The site is www.gadit.app. Stack: Next.js + React + Tailwind + Firebase. We're not asking you to redesign the technology — only the visual identity, copy tone, and feature presentation.

### Who it's for

This is the most important constraint. Gadit must work for **three audiences at once**:

1. **Curious adults** — language learners, writers, translators, parents who want a serious dictionary
2. **Teenagers** — students using it for school, kids who got curious about a word from a book or song
3. **Children (8+)** — early readers exploring vocabulary, often with a parent

The hard rule: what works for adults is often boring or intimidating for kids. What works for kids is often too childish for adults. We need the **middle line** — visually rich enough that an 11-year-old leans forward, calm enough that a 45-year-old translator takes it seriously.

The previous design was too dark and "space-themed" (galaxy, stars, deep navy). It read as an adult tool. We're moving away from that.

### The new core metaphor: collecting words like treasure

The product is fundamentally about **collecting**. Every word a user understands is added to their personal collection. Over time the collection grows.

We're framing this as **a personal treasure island**:
- Each user has their own small island floating on a calm sea
- On the island sits a treasure chest
- Every word the user has truly understood (read its meaning + examples + etymology) drops as a coin into the chest
- The chest fills up over weeks and months — the user can open it any time and see their collected words as glowing coins

The Hebrew phrase "אוצר מילים" (otzar milim) literally means "treasure of words" / "vocabulary." We're taking this dead metaphor and making it visually alive.

Subscription tiers tie into the metaphor:
- **Basic (free)** — a simple wooden chest, basic island
- **Clear (mid)** — wooden chest with iron bands, more features unlocked on the island
- **Deep (premium)** — antique gold-bound chest with pearls, lush island with full features

### What MUST stay (do not redesign these out)

- All current features: search, multi-meaning, examples, etymology, idioms, generated image, kids explanation, quiz, compose sentence, notebook, compare two words, pricing page, account page
- 7-language support with RTL for Hebrew and Arabic
- The 3-tier subscription model (Basic / Clear / Deep)
- The site name "Gadit" and the lowercase wordmark style
- Search-as-front-door — the main action on the homepage is typing a word

### What we want to change

**Background**:
- FROM: black/navy "galaxy" stage with stars
- TO: warm white / soft cream paper background. The page should feel calm and bright, not heavy or moody.

**Color**:
- FROM: monochrome dark with one electric-blue accent
- TO: a richer palette where colors are tied to features. Each feature should have its own visual color signature, so a returning user instantly knows "the blue card is meanings, the amber card is etymology, the teal card is the image, the coral card is the quiz." Color is functional, not decorative.

**Typography (English)**:
- FROM: a heavy academic serif that reads as "old textbook"
- TO: a warmer book-quality serif (Fraunces, Lora, or similar) — still feels dictionary-like, but rounder and more inviting. Body text in a clean humanist sans (Inter, Manrope, or similar). Hebrew stays on Rubik or moves to Assistant. Arabic stays on Cairo.

**Iconography & illustrations**:
- FROM: minimal line icons, no illustrations
- TO: each feature should have its own small illustrated icon or scene. NOT clip-art, NOT cartoon. Think modern flat illustration with a hand-drawn quality — like the Duolingo characters, but more refined. Or like the iconography in the Things 3 app. The illustrations should signal what the feature does at a glance.

**Hero (homepage)**:
- A small island floats in a calm pastel sea, with a treasure chest visible on it. The user's search bar is below or beside it. As anonymous visitors search words, animated coins drop into the chest one by one — a quiet "you're collecting" feedback loop. After signup, the chest belongs to the user permanently.

**Word result page**:
- Each section (meanings, examples, etymology, idioms, image, kids, quiz) gets its own colored card with its own small illustrated icon
- When the user finishes reading and clicks "Save to notebook," a coin animation drops the word into their chest (small celebratory micro-animation, ~600ms, not annoying)

**Notebook**:
- FROM: a list of saved words
- TO: a visualization of the user's chest contents. Words appear as glowing coins. Coins look duller for words the user only briefly looked at, brighter and more golden for words the user explored deeply (read all sections, did the quiz, saved an image). Becomes a satisfying personal trophy case.

### Tone

- Warm, curious, slightly playful — but not silly
- Adult enough that a 50-year-old academic uses it without embarrassment
- Approachable enough that a 10-year-old finds it inviting
- Avoid: gamified XP bars, points, streaks, leaderboards. The "collection" feeling should come from genuinely accumulating value (real words you understood), not from extrinsic rewards
- Avoid: childish mascots with eyes. No googly-eyed treasure chest. The chest is beautiful and inert — it's a vessel, not a character.

### Color palette to consider

These are starting points, not mandatory:
- **Page background**: warm paper white `#FAF6EE`
- **Sea/primary accent**: deep teal `#0E7490` with soft turquoise `#14B8A6`
- **Treasure gold**: warm gold `#D4A24C` (not yellow, not metallic glitter — book-illustration gold)
- **Wood / earth**: warm brown `#8B5E34`
- **Sunset / CTA**: coral orange `#F97316`
- **Text**: warm near-black `#1F2937`
- **Soft tints for feature cards**: each feature gets its own pastel tint as a card background — sky blue for meanings, sand for etymology, mint for image, peach for kids, lavender for quiz. Saturation low (12-18%), so cards feel calm next to each other.

### What to deliver (if you're producing mockups)

1. The homepage hero with the treasure island concept
2. A word-result page showing 3-4 feature cards with their distinct colors and icons
3. The notebook page showing words-as-coins
4. The pricing page showing the 3 chest variants for Basic / Clear / Deep
5. A mobile version of the homepage hero

Keep RTL in mind — for any Hebrew/Arabic mock, the entire layout flips horizontally.

### What success looks like

A 11-year-old looks at the homepage and says "I want to collect words too."
A 45-year-old looks at the same homepage and thinks "this is a serious tool that respects my time."
Both feelings should coexist on the same screen. That's the whole brief.

---

## הפרומפט בעברית

### מה זה גדית

גדית היא אפליקציית הבנת מילים רב-לשונית. המשתמש מקליד מילה בכל שפה, וגדית מחזירה:
- כל המשמעויות של המילה (לא רק העיקרית)
- 3 דוגמאות לכל משמעות
- אטימולוגיה (מקור המילה כסיפור קצר)
- ניבים וביטויים
- תמונה שמייצרת ויזואל למילה
- אופציונלי: הסבר ידידותי-לילדים, חידון, תרגול "כתוב משפט", ומחברת אישית

זה עובד ב-7 שפות ממשק (אנגלית, עברית, ערבית, רוסית, ספרדית, פורטוגזית, צרפתית) עם תמיכה מלאה ב-RTL.

האתר הוא www.gadit.app. אנחנו לא מבקשים לעצב את הטכנולוגיה מחדש — רק את הזהות הוויזואלית, טון הקופי, והאופן שבו הפיצ'רים מוצגים.

### למי זה מיועד

זאת המגבלה הכי חשובה. גדית חייבת לעבוד עבור **שלושה קהלים בו זמנית**:

1. **מבוגרים סקרנים** — לומדי שפה, כותבים, מתרגמים, הורים שרוצים מילון רציני
2. **בני נוער** — תלמידים שמשתמשים לצורכי בית-ספר, ילדים שהתעוררה אצלם סקרנות ממילה בספר או בשיר
3. **ילדים (8+)** — קוראים מתחילים שחוקרים אוצר מילים, לרוב עם הורה

הכלל הברזל: מה שעובד למבוגרים הוא לרוב משעמם או מאיים לילדים. מה שעובד לילדים הוא לרוב ילדותי מדי למבוגרים. אנחנו צריכים את **קו האמצע** — עשיר ויזואלית מספיק כדי שילד בן 11 יתכופף קדימה, רגוע מספיק כדי שמתרגם בן 45 ייקח את זה ברצינות.

העיצוב הקודם היה כהה מדי ובסגנון "חלל" (גלקסיה, כוכבים, נייבי עמוק). זה נקרא ככלי למבוגרים. אנחנו זזים מזה.

### המטאפורה החדשה: לאסוף מילים כמו אוצר

המוצר הוא במהותו עניין של **איסוף**. כל מילה שמשתמש מבין מתווספת לאוסף האישי שלו. לאורך זמן האוסף גדל.

אנחנו ממסגרים את זה כ**אי אוצר אישי**:
- לכל משתמש יש אי קטן משלו צף על ים שקט
- על האי יש תיבת אוצר
- כל מילה שהמשתמש הבין באמת (קרא משמעות + דוגמאות + אטימולוגיה) נופלת כמטבע לתוך התיבה
- התיבה מתמלאת לאורך שבועות וחודשים — המשתמש יכול לפתוח אותה בכל רגע ולראות את המילים שאסף כמטבעות זוהרים

הביטוי "אוצר מילים" קיים בעברית מאות שנים. אנחנו לוקחים מטאפורה מתה ומחזירים אותה לחיים ויזואליים.

מסלולי המנוי מתחברים למטאפורה:
- **Basic (חינם)** — תיבת עץ פשוטה, אי בסיסי
- **Clear (אמצע)** — תיבת עץ עם פסי ברזל, יותר פיצ'רים פתוחים על האי
- **Deep (פרימיום)** — תיבת אוצר עתיקה כרוכה בזהב עם פנינים, אי שופע עם כל הפיצ'רים

### מה חייב להישאר (אל תעצב את זה החוצה)

- כל הפיצ'רים הנוכחיים: חיפוש, ריבוי משמעויות, דוגמאות, אטימולוגיה, ניבים, תמונה מיוצרת, הסבר לילדים, חידון, תרגול משפט, מחברת, השוואה בין שתי מילים, עמוד מחירים, עמוד חשבון
- תמיכה ב-7 שפות עם RTL לעברית וערבית
- מודל 3 המסלולים (Basic / Clear / Deep)
- שם האתר "Gadit" וסגנון ה-wordmark באותיות קטנות
- חיפוש כדלת הראשית — הפעולה הראשית בעמוד הבית היא הקלדת מילה

### מה אנחנו רוצים לשנות

**רקע**:
- מ: רקע שחור/נייבי עם כוכבים
- ל: רקע לבן חם / נייר קרם רך. העמוד צריך להרגיש רגוע ומואר, לא כבד או דרמטי

**צבע**:
- מ: מונוכרום כהה עם הדגשה אחת בכחול חשמלי
- ל: פלטה עשירה יותר שבה הצבעים קשורים לפיצ'רים. לכל פיצ'ר תהיה חתימת צבע ויזואלית משלו, כך שמשתמש חוזר ידע מיד "הקלף הכחול הוא משמעויות, הקלף הענברי הוא אטימולוגיה, הקלף הטורקיז הוא התמונה, הקלף האלמוג הוא החידון". הצבע הוא פונקציונלי, לא דקורטיבי

**טיפוגרפיה (אנגלית)**:
- מ: serif אקדמי כבד שנקרא כמו "ספר לימוד ישן"
- ל: serif חם באיכות ספרותית (Fraunces, Lora, או דומה) — עדיין מרגיש מילוני, אבל עגול ומזמין יותר. גוף טקסט בסאן הומניסטי נקי (Inter, Manrope, או דומה). עברית נשארת על Rubik או עוברת ל-Assistant. ערבית נשארת על Cairo

**אייקונוגרפיה ואיורים**:
- מ: אייקוני קו מינימליים, ללא איורים
- ל: לכל פיצ'ר יהיה אייקון או סצנה מאויירת קטנה משלו. לא קליפ-ארט, לא קריקטורה. תחשבו איור שטוח מודרני באיכות יד-אנושית — כמו דמויות Duolingo, אבל מעודן יותר. או כמו האייקונוגרפיה באפליקציית Things 3. האיורים צריכים לסמן מה הפיצ'ר עושה במבט אחד

**Hero (עמוד בית)**:
- אי קטן צף על ים בפסטל רגוע, עם תיבת אוצר נראית עליו. שורת החיפוש של המשתמש מתחת או לידו. כשמבקרים אנונימיים מחפשים מילים, מטבעות מונפשים נופלים לתוך התיבה אחד-אחד — לולאת משוב שקטה של "אתה אוסף". אחרי הרשמה, התיבה שייכת למשתמש לצמיתות

**עמוד תוצאת מילה**:
- כל סקציה (משמעויות, דוגמאות, אטימולוגיה, ניבים, תמונה, ילדים, חידון) מקבלת קלף בצבע משלה עם אייקון מאוייר קטן משלה
- כשהמשתמש מסיים לקרוא ולוחץ "שמור למחברת", אנימציה של מטבע מורידה את המילה לתוך התיבה שלו (מיקרו-אנימציה חגיגית קטנה, ~600ms, לא מציקה)

**מחברת**:
- מ: רשימה של מילים שמורות
- ל: ויזואליזציה של תוכן התיבה של המשתמש. מילים מופיעות כמטבעות זוהרים. מטבעות נראים עמומים יותר למילים שהמשתמש רק הציץ בהן, בהירים וזהובים יותר למילים שהמשתמש חקר לעומק (קרא את כל הסקציות, עשה את החידון, שמר תמונה). הופך לתצוגת גביעים אישית מספקת

### טון

- חם, סקרני, מעט שובב — אבל לא טיפשי
- בוגר מספיק שאקדמאי בן 50 משתמש בו בלי בושה
- נגיש מספיק שילד בן 10 מוצא אותו מזמין
- להימנע מ: שורות XP, נקודות, רצפים, לוחות מובילים. תחושת ה"אוסף" צריכה לבוא מהצטברות אמיתית של ערך (מילים אמיתיות שהבנת), לא מתגמולים חיצוניים
- להימנע מ: קמעות ילדותיים עם עיניים. לא תיבת אוצר עם עיניים גוגליות. התיבה יפה ושקטה — היא כלי קיבול, לא דמות

### פלטת צבעים לשיקול

נקודות התחלה, לא חובה:
- **רקע עמוד**: לבן נייר חם `#FAF6EE`
- **ים/הדגשה ראשית**: טורקיז עמוק `#0E7490` עם טורקיז רך `#14B8A6`
- **זהב אוצר**: זהב חם `#D4A24C` (לא צהוב, לא נצנצים מתכתיים — זהב של איור-ספר)
- **עץ / אדמה**: חום חם `#8B5E34`
- **שקיעה / CTA**: כתום אלמוג `#F97316`
- **טקסט**: כמעט-שחור חם `#1F2937`
- **גוונים רכים לקלפי פיצ'רים**: כל פיצ'ר מקבל גוון פסטל משלו כרקע קלף — תכלת למשמעויות, חול לאטימולוגיה, מנטה לתמונה, אפרסק לילדים, לבנדר לחידון. רוויה נמוכה (12-18%), כך שהקלפים מרגישים רגועים זה ליד זה

### מה לספק (אם אתה מייצר mockups)

1. עמוד הבית עם קונספט אי-האוצר
2. עמוד תוצאת מילה שמראה 3-4 קלפי פיצ'רים עם הצבעים והאייקונים המובחנים שלהם
3. עמוד המחברת שמראה מילים-כמטבעות
4. עמוד המחירים שמראה את 3 וריאנטי התיבה ל-Basic / Clear / Deep
5. גרסת מובייל של ה-Hero בעמוד הבית

לזכור RTL — לכל mock בעברית/ערבית, כל ה-layout מתהפך אופקית

### איך נראית הצלחה

ילד בן 11 מסתכל על עמוד הבית ואומר "אני רוצה לאסוף מילים גם".
מבוגר בן 45 מסתכל על אותו עמוד הבית וחושב "זה כלי רציני שמכבד את הזמן שלי".
שתי התחושות צריכות לדור באותו מסך. זאת כל הסקירה.
