/**
 * guide-i18n — all text for the in-app walkthroughs (titles, descriptions,
 * section names, per-step captions, and the labels that appear INSIDE the
 * recreated frames). Kept out of the components so the same guide renders in
 * every language. Authored he + en (Gadit's primary pair); every other
 * language falls back to en until translated, matching the app's established
 * component-i18n pattern. Add a language by adding its key to any entry.
 */

import type { Lang } from "@/lib/i18n";
import { TR } from "@/lib/guide-i18n-translations";

type Entry = Partial<Record<Lang, string>> & { en: string };
type Dict = Record<string, Entry>;

const G: Dict = {
  // ── page + chrome ──
  "help.title": { en: "Guides", he: "הדרכות" },
  "help.sub": { en: "Every action in the app, in a short guide that shows exactly how. No narration, just the screens.", he: "כל פעולה באפליקציה, במדריך קצר שמראה בדיוק איך עושים אותה. בלי קריינות, רק המסכים." },
  "help.tourTitle": { en: "New here? Start with the basics", he: "חדשים כאן? מתחילים מהבסיס" },
  "help.tourSub": { en: "A quick guide to searching your first word.", he: "מדריך קצר לחיפוש המילה הראשונה שלכם." },
  "help.tourBtn": { en: "Start", he: "התחילו" },
  "help.play": { en: "Play guide", he: "הפעלת ההדרכה" },

  // ── sections ──
  "sec.start": { en: "Getting started", he: "מתחילים" },
  "sec.family": { en: "Family & install", he: "משפחה והתקנה" },
  "sec.learn": { en: "Learning tools", he: "כלים ללמידה" },

  // ── shared frame labels ──
  "ui.searchPlaceholder": { en: "Type a word", he: "הקלידו מילה" },
  "ui.nav.notebook": { en: "Notebook", he: "מחברת" },
  "ui.nav.say": { en: "Say it", he: "תגיד את זה" },
  "ui.nav.reader": { en: "Every word", he: "כל מילה" },
  "ui.nav.games": { en: "Games", he: "משחקים" },
  "ui.kidsMode": { en: "Kids Mode", he: "מצב ילדים" },
  "ui.save": { en: "Save to notebook", he: "שמירה במחברת" },
  "ui.saved": { en: "Saved", he: "נשמר" },
  "ui.family": { en: "Family", he: "משפחה" },
  "ui.pairDevice": { en: "Pair device", he: "חיבור מכשיר" },
  "ui.signIn": { en: "Sign in", he: "התחברות" },
  "ui.joinCode": { en: "Joining a family? Enter your code", he: "הצטרפות למשפחה? הזנת קוד" },
  "ui.share": { en: "Share", he: "שיתוף" },
  "ui.addHome": { en: "Add to Home Screen", he: "הוסף למסך הבית" },
  "ui.photo": { en: "Photograph text", he: "צילום טקסט" },
  "ui.paste": { en: "Paste text", he: "הדבקת טקסט" },
  "ui.keyWords": { en: "Key words in this passage", he: "המילים החשובות בקטע" },
  "ui.listen": { en: "Listen", he: "להאזנה" },
  "ui.record": { en: "Record yourself", he: "הקליטו את עצמכם" },
  "ui.weekly": { en: "+{n} this week", he: "+{n} השבוע" },

  // ── demo content shown inside frames ──
  "demo.word": { en: "curious", he: "סקרן" },
  "demo.pos": { en: "adjective", he: "שם תואר" },
  "demo.meaning": { en: "wanting to learn or know more about something.", he: "מי שרוצה ללמוד ולדעת עוד על משהו." },
  "demo.example": { en: "The curious child asked many questions.", he: "הילד הסקרן שאל הרבה שאלות." },
  "demo.kidsMeaning": { en: "someone who loves to learn new things and ask lots of questions.", he: "מישהו שאוהב ללמוד דברים חדשים ולשאול הרבה שאלות." },
  "demo.word2": { en: "brave", he: "אמיץ" },
  "demo.word3": { en: "ocean", he: "אוקיינוס" },
  "demo.passage": { en: "The ancient sailors used the stars to navigate the vast ocean.", he: "המלחים הקדמונים השתמשו בכוכבים כדי לנווט באוקיינוס העצום." },
  "demo.kw1": { en: "ancient", he: "קדמונים" },
  "demo.kw2": { en: "navigate", he: "לנווט" },
  "demo.kw3": { en: "vast", he: "עצום" },
  "demo.child1": { en: "Maya", he: "מאיה" },
  "demo.child2": { en: "Daniel", he: "דניאל" },
  "demo.feedback": { en: "Spot on!", he: "מדויק!" },

  // ── guide: search ──
  "search.title": { en: "Search a word", he: "איך מחפשים מילה" },
  "search.desc": { en: "Type any word and get all its meanings, examples and a picture.", he: "מקלידים מילה ומקבלים את כל המשמעויות, דוגמאות ותמונה." },
  "search.s1": { en: "Type any word you don't understand in the search box.", he: "הקלידו כל מילה שלא הבנתם בתיבת החיפוש." },
  "search.s2": { en: "Gadit shows every meaning, not just one, each with examples.", he: "גדית מראה את כל המשמעויות, לא רק אחת, כל אחת עם דוגמאות." },
  "search.s3": { en: "Scroll down for a picture and where the word comes from.", he: "גוללים למטה לתמונה ולמקור המילה." },

  // ── guide: save ──
  "save.title": { en: "Save a word", he: "איך שומרים מילה" },
  "save.desc": { en: "Keep words in a personal notebook that grows over time.", he: "שומרים מילים במחברת אישית שגדלה עם הזמן." },
  "save.s1": { en: "On a word, tap 'Save to notebook'.", he: "בכרטיס המילה, לוחצים על 'שמירה במחברת'." },
  "save.s2": { en: "The word is now in your personal notebook.", he: "המילה נמצאת עכשיו במחברת האישית שלכם." },
  "save.s3": { en: "Every saved word builds a vocabulary that keeps growing.", he: "כל מילה שנשמרת בונה אוצר מילים שממשיך לגדול." },

  // ── guide: kids ──
  "kids.title": { en: "Turn on Kids Mode", he: "מפעילים מצב ילדים" },
  "kids.desc": { en: "Switch every explanation to language a young child understands.", he: "מעבירים כל הסבר לשפה שילד צעיר מבין." },
  "kids.s1": { en: "Turn on the 'Kids Mode' switch.", he: "מפעילים את מתג 'מצב ילדים'." },
  "kids.s2": { en: "Now the explanation is in simple words, with a picture.", he: "עכשיו ההסבר בשפה פשוטה, עם תמונה." },

  // ── guide: reader ──
  "reader.title": { en: "Read any text", he: "קוראים טקסט שלם" },
  "reader.desc": { en: "Photograph or paste a whole text and learn the words from it.", he: "מצלמים או מדביקים טקסט שלם ולומדים ממנו את המילים." },
  "reader.s1": { en: "Open 'Every word' and photograph or paste a text.", he: "נכנסים ל'כל מילה' ומצלמים או מדביקים טקסט." },
  "reader.s2": { en: "The text opens with its key words highlighted at the top.", he: "הטקסט נפרש, ולמעלה מופיעות המילים החשובות בקטע." },
  "reader.s3": { en: "Tap any word to get a simple explanation right there.", he: "נגיעה בכל מילה נותנת הסבר פשוט במקום." },

  // ── guide: say ──
  "say.title": { en: "Practice pronunciation", he: "מתרגלים הגייה" },
  "say.desc": { en: "Hear how a word sounds and practice saying it out loud.", he: "שומעים איך מילה נשמעת ומתרגלים להגיד אותה בקול." },
  "say.s1": { en: "Open 'Say it' and hear the word pronounced.", he: "נכנסים ל'תגיד את זה' ושומעים איך הוגים." },
  "say.s2": { en: "Record yourself saying the word.", he: "מקליטים את עצמכם אומרים את המילה." },
  "say.s3": { en: "Get instant feedback: spot on, almost, or not quite.", he: "מקבלים משוב מיידי: מדויק, כמעט, או לא בדיוק." },

  // ── guide: install ──
  "install.title": { en: "Install Gadit on your phone", he: "מתקינים את Gadit בטלפון" },
  "install.desc": { en: "Add Gadit to your home screen so it opens like an app.", he: "מוסיפים את Gadit למסך הבית כדי שייפתח כמו אפליקציה." },
  "install.s1": { en: "Open gadit.app in your browser and tap Share.", he: "פותחים את gadit.app בדפדפן ולוחצים על שיתוף." },
  "install.s2": { en: "Choose 'Add to Home Screen'.", he: "בוחרים 'הוסף למסך הבית'." },
  "install.s3": { en: "The Gadit icon appears on your home screen.", he: "האייקון של Gadit מופיע במסך הבית." },

  // ── guide: pair ──
  "pair.title": { en: "Connect your child's device", he: "מחברים את המכשיר של הילד" },
  "pair.desc": { en: "Pair a child's phone to your family with a QR or 6-digit code.", he: "מחברים את הטלפון של הילד למשפחה עם QR או קוד בן 6 ספרות." },
  "pair.s1": { en: "In 'Family', tap 'Pair device' next to your child.", he: "באזור 'משפחה', לוחצים 'חיבור מכשיר' ליד הילד." },
  "pair.s2": { en: "A QR code and a 6-digit code appear.", he: "מופיעים קוד QR וקוד בן 6 ספרות." },
  "pair.s3": { en: "On the child's phone: Sign in, then 'Joining a family? Enter your code'.", he: "במכשיר הילד: 'התחברות', ואז 'הצטרפות למשפחה? הזנת קוד'." },
  "pair.s4": { en: "Type the 6 digits and the child is connected to the family.", he: "מקלידים את 6 הספרות והילד מחובר למשפחה." },

  // ── guide: dashboard ──
  "dash.title": { en: "See each child's progress", he: "רואים את ההתקדמות של כל ילד" },
  "dash.desc": { en: "The parent dashboard shows how each child's vocabulary grows.", he: "לוח הבקרה להורה מראה איך אוצר המילים של כל ילד גדל." },
  "dash.s1": { en: "Open the 'Family' area.", he: "נכנסים לאזור 'משפחה'." },
  "dash.s2": { en: "See how many words each child learned and added this week.", he: "רואים כמה מילים כל ילד למד וכמה נוספו השבוע." },

  // ── section: account ──
  "sec.account": { en: "Account", he: "חשבון" },

  // ── extra frame labels ──
  "ui.niqqud": { en: "Vowel points", he: "ניקוד" },
  "ui.contextPaste": { en: "Paste a sentence", he: "הדבקת משפט" },
  "ui.inContext": { en: "in this context", he: "בהקשר הזה" },
  "ui.oppos": { en: "Opposites", he: "הפכים" },
  "ui.similar": { en: "Similar words", he: "מילים דומות" },
  "ui.mistakes": { en: "Common mistakes", he: "טעויות נפוצות" },
  "ui.remember": { en: "How to remember", he: "איך לזכור" },
  "ui.addMember": { en: "Add a family member", he: "הוספת בן משפחה" },
  "ui.name": { en: "Name", he: "שם" },
  "ui.roleKid": { en: "Child", he: "ילד" },
  "ui.roleParent": { en: "Parent", he: "הורה" },
  "ui.saveBtn": { en: "Save", he: "שמירה" },
  "ui.alertsLabel": { en: "Word alerts", he: "התראות על מילים" },
  "ui.settings": { en: "Settings", he: "הגדרות" },
  "ui.points": { en: "points", he: "נקודות" },
  "ui.correct": { en: "Correct!", he: "נכון!" },
  "ui.skins": { en: "Characters", he: "דמויות" },
  "ui.giftStore": { en: "Gift store", he: "חנות מתנות" },
  "ui.redeem": { en: "Redeem", he: "מימוש" },
  "ui.upgrade": { en: "Upgrade", he: "שדרוג" },
  "ui.myAccount": { en: "My account", he: "האזור האישי" },
  "ui.plans": { en: "Manage plans", he: "ניהול התוכניות" },
  "ui.card": { en: "Card details", he: "פרטי כרטיס אשראי" },
  "ui.planFamily": { en: "Family", he: "Family" },

  // ── extra demo content ──
  "demo.wordNiqqud": { en: "cu·ri·ous", he: "סַקְרָן" },
  "demo.contextSentence": { en: "The flowing river cut through the valley.", he: "הנהר הזורם חתך את העמק." },
  "demo.contextWord": { en: "cut", he: "חתך" },
  "demo.contextMeaning": { en: "sliced and passed through something.", he: "פילח ועבר דרך משהו." },
  "demo.oppositeWord": { en: "indifferent", he: "אדיש" },
  "demo.giftName": { en: "30 min screen time", he: "חצי שעת מסך" },
  "demo.alertText": { en: "Maya looked up the word 'curious'", he: "מאיה חיפשה את המילה 'סקרן'" },
  "demo.quizQ": { en: "What does 'curious' mean?", he: "מה זה 'סקרן'?" },
  "demo.quizWrong": { en: "tired", he: "עייף" },

  // ── guide: listen ──
  "listen.title": { en: "Hear how a word sounds", he: "שומעים איך הוגים" },
  "listen.desc": { en: "Tap the speaker to hear any word pronounced correctly.", he: "לוחצים על הרמקול ושומעים כל מילה נהגית נכון." },
  "listen.s1": { en: "On a word, tap the speaker icon.", he: "בכרטיס המילה, לוחצים על אייקון הרמקול." },
  "listen.s2": { en: "Hear the word pronounced correctly, in its own language.", he: "שומעים את המילה נהגית נכון, בשפה שלה." },

  // ── guide: niqqud ──
  "niqqud.title": { en: "Add vowel points", he: "ניקוד למילה" },
  "niqqud.desc": { en: "Add vowel points to a Hebrew word, or tashkeel in Arabic.", he: "מוסיפים ניקוד למילה בעברית (ותשקיל בערבית)." },
  "niqqud.s1": { en: "On a Hebrew word, tap 'Vowel points'.", he: "על מילה בעברית, לוחצים על 'ניקוד'." },
  "niqqud.s2": { en: "The word gets vowel points so you can read it right.", he: "המילה מקבלת ניקוד ורואים איך קוראים אותה." },

  // ── guide: context ──
  "context.title": { en: "Context mode", he: "מצב הקשר" },
  "context.desc": { en: "Paste a sentence and get the exact meaning that fits it.", he: "מדביקים משפט ומקבלים את המשמעות שמתאימה לו בדיוק." },
  "context.s1": { en: "Paste a sentence from the book into the context box.", he: "מדביקים משפט מהספר בתיבת ההקשר." },
  "context.s2": { en: "Gadit picks the exact meaning that fits that sentence.", he: "גדית בוחר בדיוק את המשמעות שמתאימה למשפט." },

  // ── guide: wordExtras ──
  "extras.title": { en: "Opposites & word questions", he: "הפכים ושאלות על המילה" },
  "extras.desc": { en: "At the bottom of a word: opposites, similar words, mistakes and more.", he: "בתחתית המילה: הפכים, מילים דומות, טעויות נפוצות ועוד." },
  "extras.s1": { en: "Scroll to the bottom of a word for the chips.", he: "בתחתית כרטיס המילה, רואים את הצ'יפים." },
  "extras.s2": { en: "Tap a chip and the answer opens right there.", he: "לחיצה על צ'יפ פותחת את התשובה במקום." },

  // ── guide: addChild ──
  "addchild.title": { en: "Add a child", he: "הוספת ילד למשפחה" },
  "addchild.desc": { en: "Add a child with a name and role. Up to 5 in one plan.", he: "מוסיפים ילד עם שם ותפקיד. עד 5 ילדים במנוי." },
  "addchild.s1": { en: "In 'Family', tap 'Add a family member'.", he: "באזור 'משפחה', לוחצים 'הוספת בן משפחה'." },
  "addchild.s2": { en: "Choose a name and role (child or parent).", he: "בוחרים שם ותפקיד (ילד או הורה)." },
  "addchild.s3": { en: "The child's card appears in your family.", he: "הכרטיס של הילד מופיע במשפחה." },

  // ── guide: alerts ──
  "alerts.title": { en: "Word alerts", he: "התראות על מילים" },
  "alerts.desc": { en: "Get notified when your child looks up a new word.", he: "מקבלים הודעה כשהילד מחפש מילה חדשה." },
  "alerts.s1": { en: "In 'Family', open the alert settings.", he: "באזור 'משפחה', נכנסים להגדרות ההתראות." },
  "alerts.s2": { en: "Turn alerts on.", he: "מפעילים את ההתראות." },
  "alerts.s3": { en: "You get a note when your child looks up a word.", he: "מקבלים הודעה כשהילד מחפש מילה." },

  // ── guide: games ──
  "games.title": { en: "Quizzes & games", he: "חידונים ומשחקים" },
  "games.desc": { en: "Play with the words your child actually looked up.", he: "משחקים על המילים שהילד עצמו חיפש." },
  "games.s1": { en: "Open 'Games'.", he: "נכנסים ל'משחקים'." },
  "games.s2": { en: "Answer a quiz about a word the child met.", he: "עונים על חידון על מילה שהילד פגש." },
  "games.s3": { en: "Every correct answer earns points.", he: "כל תשובה נכונה מזכה בנקודות." },

  // ── guide: rewards ──
  "rewards.title": { en: "Characters & gift store", he: "דמויות וחנות מתנות" },
  "rewards.desc": { en: "Earn points, pick a character, and parents set up rewards.", he: "צוברים נקודות, בוחרים דמות, וההורה מגדיר פרסים." },
  "rewards.s1": { en: "Earn points and pick a character or skin.", he: "צוברים נקודות ובוחרים דמות או עיצוב." },
  "rewards.s2": { en: "In the gift store, a parent sets a real reward.", he: "בחנות המתנות, ההורה מגדיר פרס אמיתי." },
  "rewards.s3": { en: "The child redeems the reward with earned points.", he: "הילד ממש את הפרס בנקודות שצבר." },

  // ── guide: account ──
  "account.title": { en: "Upgrade & manage plan", he: "שדרוג וניהול מנוי" },
  "account.desc": { en: "Upgrade a plan and manage your subscription.", he: "משדרגים תוכנית ומנהלים את המנוי מהאזור האישי." },
  "account.s1": { en: "Open My account and Manage plans.", he: "נכנסים לאזור האישי ולניהול התוכניות." },
  "account.s2": { en: "Tap upgrade for the plan you want.", he: "לוחצים על שדרוג לתוכנית הרצויה." },
  "account.s3": { en: "You land straight on the card details screen.", he: "מגיעים ישר למסך הוספת כרטיס האשראי." },
};

export function gt(lang: Lang, key: string): string {
  const e = G[key];
  if (!e) return key;
  // he + en are authored in G (the source). Every other language reads from the
  // generated TR layer, falling back to English until translated.
  if (lang === "he") return e.he ?? e.en;
  if (lang === "en") return e.en;
  return TR[lang]?.[key] ?? e.en;
}

/** Interpolate {n} etc. */
export function gtf(lang: Lang, key: string, vars: Record<string, string | number>): string {
  let s = gt(lang, key);
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
