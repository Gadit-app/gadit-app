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
  "sec.account": { en: "Account", he: "חשבון" },

  // ── frame labels: top bar and menu (WbShellChrome, ToolKidsToggle) ──
  "ui.nav.search": { en: "Search", he: "חיפוש" },
  "ui.nav.notebook": { en: "Notebook", he: "מחברת" },
  "ui.nav.myWords": { en: "My words", he: "אוצר המילים" },
  "ui.nav.practice": { en: "Practice", he: "תרגולים" },
  "ui.nav.homework": { en: "Homework", he: "שיעורי בית" },
  "ui.nav.reader": { en: "Every Word", he: "כל מילה" },
  "ui.nav.say": { en: "Say it", he: "תגיד את זה" },
  "ui.nav.games": { en: "Play", he: "משחקים" },
  "ui.kidsMode": { en: "Kids", he: "ילדים" },

  // ── frame labels: home and word page (HomeClient, WordClient, result.tsx) ──
  "ui.tagline": { en: "Understand words to the end", he: "להבין כל מילה עד הסוף" },
  "ui.searchPlaceholder": { en: "Type a word", he: "הקלידו מילה" },
  "ui.sentencePh": { en: "(Optional) Type the sentence where the word appears to get one precise definition", he: "(אופציונלי) הקלידו את המשפט שבו מופיעה המילה כדי לקבל הגדרה אחת מדויקת" },
  "ui.definitions": { en: "Definitions", he: "הגדרות" },
  "ui.tabImage": { en: "Image", he: "תמונה" },
  "ui.tabKids": { en: "Kids' explanation", he: "הסבר לילדים" },
  "ui.tabQuiz": { en: "Quiz", he: "חידון" },
  "ui.tabGames": { en: "Word games", he: "משחקי מילים" },
  "ui.origin": { en: "Word Origin", he: "מקור המילה" },
  "ui.originLang": { en: "Language", he: "שפה" },
  "ui.originWord": { en: "Original word", he: "מילה מקורית" },
  "ui.originMeant": { en: "Originally meant", he: "המקור" },
  "ui.gadIt": { en: "Gad it!", he: "Gad it!" },
  "ui.gadHint": { en: "Tap when you've understood, and the word is marked as understood in your notebook", he: "לחצו כשהבנתם, והמילה תסומן במחברת שלכם כמילה שהבנתם" },
  "ui.gadDone": { en: "Now I gad it!", he: "Now I gad it!" },
  "ui.gadDoneSub": { en: "The word is marked as understood in your notebook.", he: "המילה סומנה במחברת כמילה שהבנתם." },
  "ui.savedNote": { en: "This word and its meanings are saved in your notebook, and available offline too", he: "המילה והפירושים שלה נשמרו במחברת שלכם, וזמינים גם בלי אינטרנט" },
  "ui.niqqud": { en: "Niqqud", he: "ניקוד" },
  "ui.moreExamples": { en: "+ More example sentences", he: "+ עוד משפטים לדוגמה" },
  "ui.compose": { en: "Write a sentence of your own and check you understood", he: "חברו משפט משלכם ובדקו שהבנתם" },
  "ui.checkSentence": { en: "Check sentence", he: "בדיקת המשפט" },
  "ui.perfect": { en: "Perfect", he: "מצוין" },
  "ui.wqTitle": { en: "Have a question about this word?", he: "יש לך שאלה על המילה הזאת?" },
  "ui.oppos": { en: "Opposites", he: "הפכים" },
  "ui.similar": { en: "Similar words", he: "מילים דומות במשמעות" },
  "ui.wordFamily": { en: "Word family", he: "מילים מאותו שורש" },
  "ui.mistakes": { en: "Common mistakes", he: "טעויות נפוצות" },
  "ui.remember": { en: "How to remember it", he: "איך לזכור את המילה" },

  // ── frame labels: notebook, kids screen ──
  "ui.myNotebook": { en: "My Notebook", he: "המחברת שלי" },
  "ui.offline": { en: "✓ Offline", he: "✓ זמין אופליין" },
  "ui.freeCount": { en: "{n} of 30 words in your free notebook", he: "{n} מתוך 30 מילים במחברת החינמית" },
  "ui.whoUsing": { en: "Who's using?", he: "מי משתמש עכשיו?" },
  "ui.exitShared": { en: "Exit shared screen", he: "יציאה מהמסך המשותף" },

  // ── frame labels: install (InstallPwaPrompt) ──
  "ui.share": { en: "Share", he: "שיתוף" },
  "ui.addHome": { en: "Add to Home Screen", he: "הוסף למסך הבית" },
  "ui.installTitle": { en: "Add Gadit to your phone", he: "הוסיפו את Gadit לטלפון" },
  "ui.installAndroid": { en: "One-tap install, Gadit opens like a real app from your home screen.", he: "התקנה בלחיצה אחת, Gadit יפתח כמו אפליקציה ממסך הבית." },
  "ui.install": { en: "Install", he: "התקן" },
  "ui.later": { en: "Later", he: "אחר כך" },

  // ── frame labels: family (FamilyClient, FamilyAddClient, pairing, /join) ──
  "ui.tabHome": { en: "Home", he: "דף הבית" },
  "ui.tabFamily": { en: "Family", he: "בני המשפחה" },
  "ui.settings": { en: "Settings", he: "הגדרות" },
  "ui.children": { en: "Children", he: "ילדים" },
  "ui.addMember": { en: "Add a family member", he: "הוספת בן משפחה" },
  "ui.whoJoining": { en: "Who's joining the family?", he: "מי מצטרף למשפחה?" },
  "ui.pickRole": { en: "Pick a role", he: "בחרו תפקיד" },
  "ui.nameColor": { en: "Name & color", he: "שם וצבע" },
  "ui.roleDad": { en: "Dad", he: "אבא" },
  "ui.roleMom": { en: "Mom", he: "אמא" },
  "ui.roleSon": { en: "Son", he: "בן" },
  "ui.roleDaughter": { en: "Daughter", he: "בת" },
  "ui.name": { en: "Name", he: "שם" },
  "ui.ageOpt": { en: "Age (optional)", he: "גיל (לא חובה)" },
  "ui.avatarColor": { en: "Avatar color", he: "צבע אווטאר" },
  "ui.cancel": { en: "Cancel", he: "ביטול" },
  "ui.addToFamily": { en: "Add to family", he: "הוסף למשפחה" },
  "ui.dupTitle": { en: "{name} is already in the family", he: "{name} כבר במשפחה" },
  "ui.dupBody": { en: "Reconnect the existing profile? All the words and progress are kept.", he: "לחבר מחדש את הפרופיל הקיים? כל המילים וההתקדמות נשמרים." },
  "ui.reconnect": { en: "Reconnect", he: "לחבר מחדש" },
  "ui.addAnyway": { en: "Add a new profile anyway", he: "להוסיף פרופיל חדש בכל זאת" },
  "ui.pairDevice": { en: "Pair device", he: "חיבור מכשיר" },
  "ui.reconnectNote": { en: "✓ Reconnecting brings back all the words and progress.", he: "✓ חיבור מחדש מחזיר את כל המילים וההתקדמות." },
  "ui.pairQr": { en: "1. Connect with a QR code", he: "1. חיבור עם קוד QR" },
  "ui.or": { en: "or", he: "או" },
  "ui.yourCode": { en: "Your code", he: "הקוד שלכם" },
  "ui.joinLine": { en: "Got a connection code from a parent?", he: "יש לכם קוד חיבור מההורה?" },
  "ui.enterCode": { en: "Enter code", he: "הזנת קוד" },
  "ui.joinTitle": { en: "Join a family", he: "כניסה למשפחה" },
  "ui.joinSub": { en: "Type the 6-digit code your parent generated", he: "הקלידו את הקוד בן 6 הספרות שההורה ייצר" },
  "ui.sixDigit": { en: "6-digit code", he: "קוד 6 ספרות" },
  "ui.continue": { en: "Continue", he: "המשך" },
  "ui.joined": { en: "Joined! Taking you to Gadit...", he: "מחובר! מעביר אתכם ל-Gadit..." },
  "ui.greetEvening": { en: "Good evening", he: "ערב טוב" },
  "ui.kidsLine": { en: "{n} kids in the family · {w} words learned", he: "{n} ילדים במשפחה · {w} מילים נלמדו" },
  "ui.familyWords": { en: "words in the family's notebooks", he: "מילים במחברות המשפחה" },
  "ui.newThisWeek": { en: "new words this week", he: "מילים חדשות השבוע" },
  "ui.overview": { en: "Overview", he: "מבט על" },
  "ui.wordsInNb": { en: "words in notebook", he: "מילים במחברת" },
  "ui.daysRow": { en: "🔥 {n} days in a row", he: "🔥 {n} ימים ברצף" },
  "ui.weekly": { en: "+{n} this week", he: "+{n} השבוע" },
  "ui.recentWords": { en: "Recent words", he: "מילים אחרונות" },
  "ui.leaderboard": { en: "🏆 Family leaderboard", he: "🏆 לוח המובילים של המשפחה" },
  "ui.leaderSub": { en: "Different words each person has looked up so far", he: "כמה מילים שונות כל אחד חיפש עד היום" },
  "ui.you": { en: "You", he: "את/ה" },
  "ui.recentLookups": { en: "Recent lookups", he: "חיפושים אחרונים" },
  "ui.recentSub": { en: "Every word your kids looked up, newest first.", he: "כל מילה שהילדים חיפשו, מהחדש לישן." },
  "ui.today": { en: "Today", he: "היום" },
  "ui.alertsLabel": { en: "Alerts about your kids", he: "התראות על הילדים" },
  "ui.alertsSub": { en: "Get notified about everything your kids do in Gadit: words they look up, dictations, lessons, games and reading.", he: "קבלו הודעה על כל מה שהילדים עושים ב-Gadit: מילים שחיפשו, הכתבות, שיעורים, משחקים וקריאה." },
  "ui.alertsSwitch": { en: "Tell me what my kids do in Gadit", he: "עדכנו אותי על מה שהילדים עושים ב-Gadit" },
  "ui.alertNow": { en: "Everything, right away", he: "כל דבר, מיד" },
  "ui.alertNowSub": { en: "A notification as soon as they look up a word or finish a practice.", he: "הודעה ברגע שמחפשים מילה או מסיימים תרגול." },
  "ui.alertDaily": { en: "Daily summary", he: "סיכום יומי" },
  "ui.alertDailySub": { en: "One notification at the end of the day.", he: "התראה אחת בסוף היום." },
  "ui.alertWhat": { en: "What should we tell you about?", he: "על מה לעדכן אתכם?" },
  "ui.alertCat1": { en: "Words they look up", he: "מילים שחיפשו" },
  "ui.alertCat2": { en: "Games and duels", he: "משחקים ודו-קרב" },
  "ui.alertCat3": { en: "Homework and practice", he: "שיעורי בית ותרגולים" },
  "ui.alertDevice": { en: "🔔 Turn on alerts on this device", he: "🔔 הפעל התראות במכשיר הזה" },

  // ── frame labels: homework (SpellClient, HomeworkIntake) ──
  "ui.hwAdd": { en: "Add homework", he: "הוסיפו שיעורי בית" },
  "ui.hwPhoto": { en: "Photograph", he: "צלמו" },
  "ui.hwUpload": { en: "Upload", he: "העלו" },
  "ui.hwPaste": { en: "Paste", he: "הדביקו" },
  "ui.hwLearn": { en: "Learning words", he: "לומדים מילים" },
  "ui.hwRead": { en: "Reading a text", he: "קוראים טקסט" },
  "ui.hwTest": { en: "Getting ready for a test", he: "מתכוננים למבחן" },
  "ui.hwWhat": { en: "What is it?", he: "מה זה?" },
  "ui.hwWordList": { en: "A word list", he: "רשימת מילים" },
  "ui.hwText": { en: "A text to read", he: "טקסט לקריאה" },
  "ui.hwPages": { en: "Workbook pages", he: "דפי חוברת" },
  "ui.hwWhen": { en: "When is the test?", he: "מתי המבחן?" },
  "ui.hwTomorrow": { en: "Tomorrow", he: "מחר" },
  "ui.hwWeek": { en: "In a week", he: "בעוד שבוע" },
  "ui.hwNoTest": { en: "No test", he: "אין מבחן" },
  "ui.hwSave": { en: "Save", he: "שמרו" },
  "ui.hwTodo": { en: "To do", he: "מה צריך להכין" },
  "ui.hwWords": { en: "{n} words", he: "{n} מילים" },
  "ui.hwStart": { en: "Start", he: "מתחילים" },
  "ui.hwWhichLang": { en: "Which language are you learning?", he: "איזו שפה לומדים?" },
  "ui.hwSpelling": { en: "Spelling", he: "הכתבה" },
  "ui.hwSpellingSub": { en: "Hear a word and write it", he: "שומעים מילה וכותבים אותה" },
  "ui.hwPick": { en: "Listen and pick", he: "הקשיבו ובחרו" },
  "ui.hwPickSub": { en: "Hear a word and pick it from three", he: "שומעים מילה ובוחרים אותה מבין שלוש" },
  "ui.hwPickPic": { en: "Listen and pick the picture", he: "הקשיבו ובחרו תמונה" },
  "ui.hwPickPicSub": { en: "Hear a word and pick its picture from three", he: "שומעים מילה ובוחרים את התמונה שלה מבין שלוש" },

  // ── frame labels: ranks (KidsGameHeader, gamification-labels, appearance) ──
  "ui.yourRanks": { en: "Your ranks", he: "הדרגות שלכם" },
  "ui.ranksSub": { en: "You've earned {n} points. New word = 1 point · Finished practice = 10 points", he: "צברתם {n} נקודות. מילה חדשה = נקודה · תרגול שסיימתם = 10 נקודות" },
  "ui.points": { en: "points", he: "נקודות" },
  "ui.youHere": { en: "You're here", he: "אתם כאן" },
  "ui.locked": { en: "Locked", he: "נעול" },
  "ui.dayStreak": { en: "Day streak", he: "רצף ימים" },
  "ui.daysInRow": { en: "{n} days in a row", he: "{n} ימים ברצף" },
  "ui.weeklyGoal": { en: "Weekly goal", he: "יעד שבועי" },
  "ui.goalWords": { en: "{n} / {g} new words", he: "{n} / {g} מילים חדשות" },
  "ui.yourRank": { en: "Your rank", he: "הדרגה שלך" },
  "ui.toNext": { en: "{n} more points to level up", he: "עוד {n} נקודות לדרגה הבאה" },
  "ui.skinSpace": { en: "Space", he: "חלל" },
  "ui.skinSunset": { en: "Sunset", he: "שקיעה" },
  "ui.skinAurora": { en: "Aurora", he: "זוהר" },
  "rank.scout": { en: "Word Scout", he: "מגלה מתחיל" },
  "rank.explorer": { en: "Word Explorer", he: "מגלה מילים" },
  "rank.tracker": { en: "Word Tracker", he: "חוקר מילים" },
  "rank.ranger": { en: "Word Ranger", he: "מגלה מנוסה" },
  "rank.guide": { en: "Word Guide", he: "מדריך מילים" },

  // ── frame labels: Every Word (ReaderClient, PassageKeyWords, WordPopover, ReadingCheck) ──
  "ui.readerTitle": { en: "Understand every word", he: "להבין כל מילה" },
  "ui.readerSub": { en: "Paste a text, photograph a page, upload an image or capture your screen.", he: "הדביקו טקסט, צלמו עמוד, העלו תמונה או צלמו את המסך שלכם." },
  "ui.readerPh": { en: "Paste text or a screenshot here…", he: "הדביקו כאן טקסט, או השתמשו בכפתורים שלמטה: צלמו עמוד, העלו תמונה או PDF, או שתפו מסך." },
  "ui.photo": { en: "Photograph with camera", he: "צלמו עמוד" },
  "ui.upload": { en: "Upload image or PDF", he: "העלו תמונה או PDF" },
  "ui.shareScreen": { en: "Share screen", he: "שתפו מסך" },
  "ui.openText": { en: "Open text", he: "פתחו את הטקסט" },
  "ui.keyWords": { en: "Key words in this text", he: "המילים החשובות בקטע" },
  "ui.worthLearning": { en: "Words worth learning", he: "מילים שכדאי ללמוד" },
  "ui.tapHint": { en: "Tap any word to see its meaning. Words you've opened turn green.", he: "לוחצים על כל מילה כדי לראות את ההסבר שלה. מילים שפתחת נצבעות בירוק." },
  "ui.openFull": { en: "Open full definition →", he: "פתחו את ההגדרה המלאה ←" },
  "ui.checkWords": { en: "Words from the text", he: "מילים מהטקסט" },
  "ui.aOfB": { en: "{a} of {b}", he: "{a} מתוך {b}" },
  "ui.whatMeans": { en: "What does “{w}” mean here?", he: "מה פירוש המילה «{w}» כאן?" },
  "ui.correct": { en: "Correct!", he: "נכון!" },

  // ── frame labels: Say it (SayTool) ──
  "ui.saySub": { en: "Type a sentence, pick the language you're learning, and hear exactly how to say it.", he: "מקלידים משפט, בוחרים שפה, ושומעים בדיוק איך אומרים את זה." },
  "ui.typeIn": { en: "I'll type in", he: "מקלידים ב" },
  "ui.sayIn": { en: "Say it in", he: "שומעים ב" },
  "ui.howToSay": { en: "Here's how to say it", he: "ככה אומרים את זה" },
  "ui.nowYouTry": { en: "Now you try", he: "עכשיו תורכם" },
  "ui.practiceSay": { en: "Practice saying it", he: "תרגול הגייה" },
  "ui.spotOn": { en: "✓ Spot on. That sounded right.", he: "✓ מדויק. נשמע נכון." },

  // ── frame labels: Practice (SpellClient area="practice") ──
  "ui.practiceSub": { en: "Pick what to practise today.", he: "בחרו מה מתרגלים היום." },
  "ui.prRead": { en: "Reading comprehension", he: "קריאה עם בדיקת הבנה" },
  "ui.prDict": { en: "Dictation", he: "הכתבה" },
  "ui.prLang": { en: "Learning a language", he: "לומדים שפה" },
  "ui.pasteList": { en: "Paste your own list", he: "הדבקת רשימה משלך" },
  "ui.pasteListSub": { en: "One word per line, in your language or English.", he: "מילה בכל שורה, בשפה שלכם או באנגלית." },
  "ui.createSet": { en: "Create set", he: "יצירת סט" },
  "ui.photoList": { en: "Photograph the list", he: "צילום הרשימה" },
  "ui.writeIn": { en: "Write in English", he: "כתבו באנגלית" },
  "ui.dictCorrect": { en: "✓ Correct!", he: "✓ נכון!" },
  "ui.next": { en: "Next", he: "הבא" },

  // ── frame labels: Play and Word Duel (PlayClient, DuelHub, DuelGame, DuelStats) ──
  "ui.wordGames": { en: "Word Games", he: "משחקי מילים" },
  "ui.fromNotebook": { en: "From your notebook", he: "מהמחברת שלך" },
  "ui.gWordCards": { en: "Word cards", he: "כרטיסיות מילים" },
  "ui.gTrueFalse": { en: "True or false?", he: "נכון או לא?" },
  "ui.gQuiz": { en: "Definition Quiz", he: "חידון הגדרות" },
  "ui.gMemory": { en: "Memory Match", he: "משחק זיכרון" },
  "ui.secOrigin": { en: "Origin & History", he: "מקור והיסטוריה" },
  "ui.secPrecision": { en: "Precision & Confusables", he: "דיוק במילים" },
  "ui.gTime": { en: "Time Traveler", he: "מסע בזמן" },
  "ui.gPassport": { en: "Word Passport", he: "דרכון מילים" },
  "ui.gTwin": { en: "Twin Trap", he: "מלכודת תאומים" },
  "ui.gShade": { en: "Shade Slider", he: "סולם עוצמה" },
  "ui.nPoints": { en: "{n} points", he: "{n} נקודות" },
  "ui.pointsRule": { en: "New word = 1 point · Finished practice = 10 points", he: "מילה חדשה = נקודה · תרגול שסיימתם = 10 נקודות" },
  "ui.duelCard": { en: "Play with someone", he: "שחקו עם מישהו" },
  "ui.duelCardSub": { en: "Play each other: a parent against a kid, siblings or friends.", he: "שחקו אחד נגד השני: הורה נגד ילד, אחים או חברים." },
  "ui.duelTitle": { en: "Word Duel", he: "דו-קרב מילים" },
  "ui.duelSub": { en: "The same questions for both players. Right and fast wins.", he: "אותן שאלות לשני השחקנים. מי שעונה נכון ומהר יותר, מנצח." },
  "ui.dSame": { en: "On this device", he: "על אותו מכשיר" },
  "ui.dSameSub": { en: "Pass the device between players on every question.", he: "מעבירים את המכשיר בין השחקנים בכל שאלה." },
  "ui.dInvite": { en: "Invite someone", he: "להזמין למשחק" },
  "ui.dInviteSub": { en: "Send a code or a link to family or a friend.", he: "שולחים קוד או קישור לבן משפחה או לחבר." },
  "ui.dCode": { en: "I have a code", he: "יש לי קוד" },
  "ui.dCodeSub": { en: "Join a game someone opened.", he: "מצטרפים למשחק שמישהו פתח." },
  "ui.dOnline": { en: "Someone online now", he: "מישהו שמחובר עכשיו" },
  "ui.dOnlineSub": { en: "A random player your age. Only a nickname and an avatar, no names and no chat.", he: "יריב אקראי בגילכם. רק כינוי ודמות, בלי שמות ובלי צ'אט." },
  "ui.dBot": { en: "Against Word Bot", he: "נגד רובוט המילים" },
  "ui.dBotSub": { en: "Quick practice, any time.", he: "תרגול מהיר, בכל שעה." },
  "ui.duelKids": { en: "Word Duel with other kids", he: "דו-קרב מול ילדים אחרים" },
  "ui.duelKidsSub": { en: "When this is on, your kids can play Word Duel with other kids their age who are online at the same moment. They only see a nickname and an avatar.", he: "כשזה פעיל, הילדים יכולים לשחק בדו-קרב מילים מול ילדים אחרים בגילם שמחוברים באותו רגע. הם רואים רק כינוי ודמות." },
  "ui.youWon": { en: "You won!", he: "ניצחתם!" },
  "ui.rightOf": { en: "{n} of {t} right", he: "{n} מתוך {t} נכונות" },
  "ui.winsTable": { en: "Wins table", he: "טבלת הניצחונות" },
  "ui.winsGames": { en: "{w} wins · {g} games", he: "{w} ניצחונות · {g} משחקים" },
  "ui.playAgain": { en: "Play again", he: "עוד משחק" },

  // ── frame labels: account (AccountClient, retention-i18n.json) ──
  "ui.myAccount": { en: "Account", he: "חשבון" },
  "ui.yourSpace": { en: "{name}'s space", he: "המרחב של {name}" },
  "ui.planCard": { en: "Plan", he: "תוכנית" },
  "ui.basicLine": { en: "Start with the essentials.", he: "התחילו עם היסודות." },
  "ui.familyLine": { en: "Up to 5 children, plus parents", he: "עד 5 ילדים, וגם ההורים" },
  "ui.upFamily": { en: "Upgrade to Family", he: "שדרוג ל-Family" },
  "ui.upIndividual": { en: "Upgrade to Individual", he: "שדרוג ל-Individual" },
  "ui.card": { en: "Card details", he: "פרטי כרטיס אשראי" },
  "ui.manageBilling": { en: "Manage billing", he: "ניהול חיוב" },
  "ui.changePlan": { en: "Change plan", he: "שינוי תוכנית" },
  "ui.cxTitle": { en: "Cancel your subscription?", he: "לבטל את המנוי?" },
  "ui.cxBody": { en: "You keep full access until the end of your current period. You can resume any time before then.", he: "הגישה המלאה נשמרת עד סוף התקופה הנוכחית. אפשר לחדש בכל רגע לפני כן." },
  "ui.cxWhy": { en: "What made you cancel? (optional)", he: "מה גרם לכם לבטל? (לא חובה)" },
  "ui.rsAuto": { en: "I didn't want an automatic charge", he: "לא רצינו חיוב אוטומטי" },
  "ui.rsUse": { en: "I didn't use it enough", he: "לא השתמשנו בזה מספיק" },
  "ui.rsPrice": { en: "Too expensive for me", he: "יקר מדי בשבילנו" },
  "ui.rsKids": { en: "It isn't right for my children", he: "לא מתאים לילדים שלנו" },
  "ui.cxKeep": { en: "Keep my subscription", he: "להשאיר את המנוי" },
  "ui.cxAnyway": { en: "Cancel anyway", he: "בכל זאת לבטל" },
  "ui.pauseTitle": { en: "A break instead of cancelling?", he: "אולי הפסקה במקום ביטול?" },
  "ui.pauseBody": { en: "You can pause the subscription for a month, with no payment. Everything stays as it is, and the subscription continues by itself after a month.", he: "אפשר להשהות את המנוי לחודש, בלי תשלום. הכול נשאר כמו שהוא, והמנוי ממשיך מעצמו אחרי חודש." },
  "ui.pauseBtn": { en: "Pause for a month", he: "להשהות לחודש" },
  "ui.renewTitle": { en: "No problem, we'll turn off automatic renewal", he: "אין בעיה, נכבה את החידוש האוטומטי" },
  "ui.renewBody": { en: "Your trial keeps running to the end, and there will be no charge.", he: "הניסיון ממשיך עד סופו, ולא יהיה שום חיוב." },
  "ui.renewBtn": { en: "Turn off renewal and keep the trial", he: "לכבות את החידוש ולהמשיך בניסיון" },
  "ui.cancelsAtEnd": { en: "Cancels at the end of the billing period", he: "מבוטל בסוף תקופת החיוב" },
  "ui.mistake": { en: "I cancelled by mistake, keep the subscription", he: "ביטלתי בטעות, להמשיך את המנוי" },

  // ── demo content shown inside frames ──
  "demo.word": { en: "curious", he: "סקרן" },
  "demo.pos": { en: "adjective", he: "שם תואר" },
  "demo.meaning": { en: "wanting to learn or know more about something.", he: "מי שרוצה ללמוד ולדעת עוד על משהו." },
  "demo.example": { en: "The curious child asked many questions.", he: "הילד הסקרן שאל הרבה שאלות." },
  "demo.meaning2": { en: "strange or unusual.", he: "מי שמתעניין יותר מדי בענייני אחרים." },
  "demo.example2": { en: "A curious noise came from the attic.", he: "השכן הסקרן הציץ מבעד לחלון." },
  "demo.kidsMeaning": { en: "someone who loves to learn new things and ask lots of questions.", he: "מישהו שאוהב ללמוד דברים חדשים ולשאול הרבה שאלות." },
  "demo.originLang": { en: "Latin", he: "ארמית" },
  "demo.originWord": { en: "curiosus", he: "סְקַר" },
  "demo.originMeant": { en: "careful, eager to know", he: "להביט, להסתכל" },
  "demo.mySentence": { en: "My curious cat opened every box in the house.", he: "החתול הסקרן שלי פתח כל קופסה בבית." },
  "demo.feedbackMsg": { en: "Great, you used 'curious' in exactly the right sense.", he: "מצוין, השתמשתם ב'סקרן' בדיוק במשמעות הנכונה." },
  "demo.moreEx1": { en: "She was curious about the old map.", he: "היא הייתה סקרנית לגבי המפה הישנה." },
  "demo.moreEx2": { en: "Curious students learn faster.", he: "תלמידים סקרנים לומדים מהר יותר." },
  "demo.familyAnswer": { en: "curiosity, curiously", he: "סקרנות, להסתקרן, סקרנית" },
  "demo.word2": { en: "brave", he: "אמיץ" },
  "demo.word2m": { en: "ready to face danger or pain.", he: "מי שלא מפחד להתמודד עם סכנה." },
  "demo.word3": { en: "ocean", he: "אוקיינוס" },
  "demo.word3m": { en: "a very large area of salt water.", he: "גוף מים מלוחים עצום." },
  "demo.contextSentence": { en: "The flowing river cut through the valley.", he: "הנהר הזורם חתך את העמק." },
  "demo.contextWord": { en: "cut", he: "חתך" },
  "demo.contextPos": { en: "verb", he: "פועל" },
  "demo.contextMeaning": { en: "sliced and passed through something.", he: "פילח ועבר דרך משהו." },
  "demo.passage": { en: "The ancient sailors used the stars to navigate the vast ocean.", he: "המלחים הקדמונים השתמשו בכוכבים כדי לנווט באוקיינוס העצום." },
  "demo.kw1": { en: "ancient", he: "קדמונים" },
  "demo.kw1m": { en: "very old", he: "מאוד עתיקים" },
  "demo.kw2": { en: "navigate", he: "לנווט" },
  "demo.kw2m": { en: "to find the way", he: "למצוא את הדרך" },
  "demo.kw3": { en: "vast", he: "עצום" },
  "demo.kw3m": { en: "very large", he: "גדול מאוד" },
  "demo.quizWrong": { en: "tired", he: "עייף" },
  "demo.quizWrong2": { en: "to fight", he: "להילחם" },
  "demo.child1": { en: "Maya", he: "מאיה" },
  "demo.child2": { en: "Daniel", he: "דניאל" },
  "demo.parent": { en: "Dana", he: "דנה" },
  "demo.alertText": { en: "Maya looked up the word 'curious'", he: "מאיה חיפשה את המילה 'סקרן'" },
  "demo.hwList": { en: "apple, school, friend, yellow, teacher, garden", he: "תפוח, בית ספר, חבר, צהוב, מורה, גינה" },
  "demo.sayFrom": { en: "English", he: "עברית" },
  "demo.sayTo": { en: "Spanish", he: "אנגלית" },
  "demo.saySentence": { en: "Where is the train station?", he: "איפה תחנת הרכבת?" },
  "demo.sayResult": { en: "¿Dónde está la estación de tren?", he: "Where is the train station?" },
  "demo.testList": { en: "abundant, diligent, reluctant", he: "abundant, diligent, reluctant" },
  "demo.dictWord": { en: "diligent", he: "diligent" },

  // ── guide: search ──
  "search.title": { en: "Search a word", he: "איך מחפשים מילה" },
  "search.desc": { en: "Type or say a word and get all its meanings, examples, a picture and its origin.", he: "מקלידים או אומרים מילה ומקבלים את כל המשמעויות, דוגמאות, תמונה ומקור." },
  "search.s1": { en: "Type a word in the search box, or tap the mic and say it.", he: "מקלידים מילה בתיבת החיפוש, או לוחצים על המיקרופון ואומרים אותה." },
  "search.s2": { en: "Gadit shows every meaning, not just one, each with examples.", he: "Gadit מראה את כל המשמעויות, לא רק אחת, כל אחת עם דוגמאות." },
  "search.s3": { en: "Tap 'Image' under a meaning to see a picture of it.", he: "לוחצים 'תמונה' מתחת למשמעות כדי לראות תמונה שלה." },
  "search.s4": { en: "At the end: where the word comes from, then the 'Gad it!' button.", he: "בסוף: מקור המילה, ואחריו הכפתור 'Gad it!'." },

  // ── guide: listen ──
  "listen.title": { en: "Hear how a word sounds", he: "שומעים איך הוגים" },
  "listen.desc": { en: "Tap the speaker to hear any word pronounced correctly.", he: "לוחצים על הרמקול ושומעים כל מילה נהגית נכון." },
  "listen.s1": { en: "Next to the word, tap the speaker icon.", he: "ליד המילה, לוחצים על אייקון הרמקול." },
  "listen.s2": { en: "Hear the word pronounced correctly, in its own language.", he: "שומעים את המילה נהגית נכון, בשפה שלה." },

  // ── guide: niqqud ──
  "niqqud.title": { en: "Add vowel points", he: "ניקוד למילה" },
  "niqqud.desc": { en: "Add vowel points to a Hebrew word, or tashkeel in Arabic.", he: "מוסיפים ניקוד למילה בעברית (ותשקיל בערבית)." },
  "niqqud.s1": { en: "On a Hebrew word, tap 'Niqqud'.", he: "על מילה בעברית, לוחצים על 'ניקוד'." },
  "niqqud.s2": { en: "The word gets vowel points so you can read it right.", he: "המילה מקבלת ניקוד ורואים איך קוראים אותה." },

  // ── guide: save (the notebook fills itself) ──
  "save.title": { en: "Your notebook fills itself", he: "המחברת מתמלאת לבד" },
  "save.desc": { en: "Every word you look up is saved to your notebook automatically.", he: "כל מילה שמחפשים נשמרת במחברת אוטומטית." },
  "save.s1": { en: "Every word you look up is saved by itself, nothing to tap.", he: "כל מילה שמחפשים נשמרת מעצמה, בלי ללחוץ על כלום." },
  "save.s2": { en: "To see your words, open 'Notebook' in the top menu.", he: "כדי לראות את המילים, פותחים 'מחברת' בתפריט העליון." },
  "save.s3": { en: "All your words are there, and on paid plans they work offline too.", he: "כל המילים שם, ובמנויים בתשלום הן זמינות גם בלי אינטרנט." },
  "save.s4": { en: "On Basic, the free notebook keeps up to 30 words.", he: "ב-Basic, המחברת החינמית שומרת עד 30 מילים." },

  // ── guide: context (the sentence field) ──
  "context.title": { en: "The right meaning for your sentence", he: "המשמעות הנכונה למשפט שלכם" },
  "context.desc": { en: "Add the sentence where the word appears and get the one meaning that fits.", he: "מוסיפים את המשפט שבו מופיעה המילה ומקבלים את המשמעות שמתאימה לו." },
  "context.s1": { en: "Type the word, and in the field below it, the sentence where it appears.", he: "מקלידים את המילה, ובשדה שמתחת את המשפט שבו היא מופיעה." },
  "context.s2": { en: "Gadit gives the one meaning that fits that sentence.", he: "Gadit נותן את המשמעות האחת שמתאימה למשפט." },
  "context.s3": { en: "The same field is under the search bar on every word page.", he: "אותו שדה נמצא מתחת לשורת החיפוש בכל עמוד מילה." },

  // ── guide: wordpage (more on every word) ──
  "wordpage.title": { en: "More on every word", he: "עוד בכל מילה" },
  "wordpage.desc": { en: "Write your own sentence, get more examples and mark the word as understood.", he: "כותבים משפט משלכם, מקבלים עוד דוגמאות ומסמנים שהבנתם." },
  "wordpage.s1": { en: "Under a meaning, tap 'Write a sentence of your own and check you understood'.", he: "מתחת למשמעות, לוחצים 'חברו משפט משלכם ובדקו שהבנתם'." },
  "wordpage.s2": { en: "Write or say your sentence, tap 'Check sentence' and get feedback right there.", he: "כותבים או מקליטים את המשפט, לוחצים 'בדיקת המשפט' ומקבלים משוב במקום." },
  "wordpage.s3": { en: "On paid plans, '+ More example sentences' adds three new examples.", he: "במנויים בתשלום, '+ עוד משפטים לדוגמה' מוסיף שלוש דוגמאות חדשות." },
  "wordpage.s4": { en: "At the end, tap 'Gad it!' and the word is marked as understood in your notebook.", he: "בסוף, לוחצים 'Gad it!' והמילה מסומנת במחברת כמילה שהבנתם." },

  // ── guide: extras (word questions) ──
  "extras.title": { en: "Questions about a word", he: "שאלות על המילה" },
  "extras.desc": { en: "On paid plans: opposites, similar words, word family, common mistakes and how to remember it.", he: "במנויים בתשלום: הפכים, מילים דומות, מילים מאותו שורש, טעויות נפוצות ואיך לזכור." },
  "extras.s1": { en: "After 'Gad it!', 'Have a question about this word?' offers five questions.", he: "אחרי 'Gad it!', בחלק 'יש לך שאלה על המילה הזאת?' יש חמש שאלות." },
  "extras.s2": { en: "Tap a question and the answer opens right below.", he: "לוחצים על שאלה, והתשובה נפתחת מיד מתחת." },

  // ── guide: kids ──
  "kids.title": { en: "Kids Mode", he: "מצב ילדים" },
  "kids.desc": { en: "One switch in the top bar explains every word the way you'd explain it to a child.", he: "מתג אחד בסרגל העליון מסביר כל מילה כמו שמסבירים לילד." },
  "kids.s1": { en: "On Family, turn on the 'Kids' switch next to the logo.", he: "ב-Family, מפעילים את המתג 'ילדים' שליד הלוגו." },
  "kids.s2": { en: "Now every explanation is written for a child.", he: "עכשיו כל הסבר כתוב בשפה של ילד." },
  "kids.s3": { en: "While it is on, the menu shows 'Homework' instead of 'Practice'.", he: "כשהמתג פועל, בתפריט מופיע 'שיעורי בית' במקום 'תרגולים'." },
  "kids.s4": { en: "On a shared device, open 'Shared kids screen' in My family, and each child taps their own picture.", he: "במכשיר משותף, פותחים 'מסך משותף לילדים' ב'המשפחה שלי', וכל ילד לוחץ על התמונה שלו." },

  // ── guide: install ──
  "install.title": { en: "Install Gadit on your phone", he: "מתקינים את Gadit בטלפון" },
  "install.desc": { en: "Add Gadit to your home screen on iPhone, or install it on Android.", he: "מוסיפים את Gadit למסך הבית באייפון, או מתקינים באנדרואיד." },
  "install.s1": { en: "On iPhone, open gadit.app in Safari and tap the Share button.", he: "באייפון, פותחים את gadit.app ב-Safari ולוחצים על כפתור השיתוף." },
  "install.s2": { en: "Scroll, choose 'Add to Home Screen' and tap 'Add'.", he: "גוללים, בוחרים 'הוסף למסך הבית' ולוחצים 'הוסף'." },
  "install.s3": { en: "On Android, install the Gadit app from Google Play, or tap 'Install' in Chrome.", he: "באנדרואיד, מתקינים את האפליקציה Gadit מ-Google Play, או לוחצים 'התקן' ב-Chrome." },
  "install.s4": { en: "Gadit now opens from its icon, like any app.", he: "מעכשיו Gadit נפתחת מהאייקון, כמו כל אפליקציה." },

  // ── guide: addChild ──
  "addchild.title": { en: "Add a family member", he: "הוספת בן משפחה" },
  "addchild.desc": { en: "Pick a role, a name and a colour, with up to 5 children on Family.", he: "בוחרים תפקיד, שם וצבע, עד 5 ילדים ב-Family." },
  "addchild.s1": { en: "In My family, on the Family tab, tap 'Add a family member'.", he: "ב'המשפחה שלי', בלשונית 'בני המשפחה', לוחצים 'הוספת בן משפחה'." },
  "addchild.s2": { en: "Pick a role: Dad, Mom, Son or Daughter.", he: "בוחרים תפקיד: אבא, אמא, בן או בת." },
  "addchild.s3": { en: "Type a name, pick a colour, add an age if you like, and tap 'Add to family'.", he: "מקלידים שם, בוחרים צבע, מוסיפים גיל אם רוצים, ולוחצים 'הוסף למשפחה'." },
  "addchild.s4": { en: "If the name is already in the family, you can reconnect that profile and keep its words.", he: "אם השם כבר במשפחה, אפשר לחבר מחדש את הפרופיל הזה ולשמור את המילים שלו." },

  // ── guide: pair ──
  "pair.title": { en: "Connect your child's device", he: "מחברים את המכשיר של הילד" },
  "pair.desc": { en: "Connect a child's device with a QR code or a 6-digit code.", he: "מחברים את המכשיר של הילד עם קוד QR או קוד בן 6 ספרות." },
  "pair.s1": { en: "On the Family tab, tap 'Pair device' on the child's card.", he: "בלשונית 'בני המשפחה', לוחצים 'חיבור מכשיר' בכרטיס של הילד." },
  "pair.s2": { en: "Scan the QR code with the child's device, or open gadit.app/join there and type the code.", he: "סורקים את קוד ה-QR במכשיר של הילד, או נכנסים שם ל-gadit.app/join ומקלידים את הקוד." },
  "pair.s3": { en: "On iPhone, open Gadit from its home-screen icon and tap 'Enter code'.", he: "באייפון, פותחים את Gadit מהאייקון במסך הבית ולוחצים 'הזנת קוד'." },
  "pair.s4": { en: "Type the 6 digits, and a reconnected child gets all their words back.", he: "מקלידים את 6 הספרות, וילד שמתחבר מחדש מקבל בחזרה את כל המילים שלו." },

  // ── guide: dashboard ──
  "dash.title": { en: "See each child's progress", he: "רואים את ההתקדמות של כל ילד" },
  "dash.desc": { en: "The parent dashboard shows how each child's vocabulary grows.", he: "לוח הבקרה להורה מראה איך אוצר המילים של כל ילד גדל." },
  "dash.s1": { en: "Open 'My family' from the avatar menu, and the Home tab sums up the family.", he: "פותחים את 'המשפחה שלי' מתפריט האווטאר, ולשונית 'דף הבית' מסכמת את המשפחה." },
  "dash.s2": { en: "Each child has a card with words, streak, rank and recent words.", he: "לכל ילד כרטיס עם מילים, רצף, דרגה ומילים אחרונות." },
  "dash.s3": { en: "The family leaderboard shows how many words each of you looked up.", he: "לוח המובילים של המשפחה מראה כמה מילים כל אחד חיפש." },
  "dash.s4": { en: "'Recent lookups' lists every word the kids looked up, newest first.", he: "ב'חיפושים אחרונים' מופיעה כל מילה שהילדים חיפשו, מהחדשה לישנה." },

  // ── guide: alerts ──
  "alerts.title": { en: "Alerts about your kids", he: "התראות על הילדים" },
  "alerts.desc": { en: "Hear about words, dictations, lessons, games, reading and duels.", he: "מקבלים הודעה על מילים, הכתבות, שיעורים, משחקים, קריאה ודו-קרב." },
  "alerts.s1": { en: "In My family, on Settings, turn on 'Tell me what my kids do in Gadit'.", he: "ב'המשפחה שלי', בלשונית 'הגדרות', מפעילים 'עדכנו אותי על מה שהילדים עושים ב-Gadit'." },
  "alerts.s2": { en: "Choose 'Everything, right away' or 'Daily summary'.", he: "בוחרים 'כל דבר, מיד' או 'סיכום יומי'." },
  "alerts.s3": { en: "Pick what to hear about, and turn on alerts once on each device.", he: "בוחרים על מה לעדכן, ומפעילים התראות פעם אחת בכל מכשיר." },
  "alerts.s4": { en: "Alerts arrive by email, and as a phone banner where possible.", he: "ההתראות מגיעות למייל, וגם כבאנר בטלפון כשאפשר." },

  // ── guide: homework ──
  "homework.title": { en: "Homework", he: "שיעורי בית" },
  "homework.desc": { en: "For kids on Family: add homework by photo or paste, then practise it.", he: "לילדים ב-Family: מוסיפים שיעורי בית בצילום או בהדבקה, ומתרגלים אותם." },
  "homework.s1": { en: "In 'Homework', tap Photograph, Upload or Paste to add tonight's homework.", he: "ב'שיעורי בית' לוחצים 'צלמו', 'העלו' או 'הדביקו' כדי להוסיף את שיעורי הבית." },
  "homework.s2": { en: "Check the words, choose what it is and when the test is, then tap Save.", he: "בודקים את המילים, בוחרים מה זה ומתי המבחן, ולוחצים 'שמרו'." },
  "homework.s3": { en: "The homework waits under 'To do', next to learning words, reading and test prep.", he: "שיעורי הבית מחכים ב'מה צריך להכין', ליד לימוד מילים, קריאה והכנה למבחן." },
  "homework.s4": { en: "'Learning words' has dictation, listen and pick, a picture game and language lessons.", he: "ב'לומדים מילים' יש הכתבה, 'הקשיבו ובחרו', משחק תמונות ושיעורי שפה." },

  // ── guide: ranks ──
  "ranks.title": { en: "Ranks, streaks and the family leaderboard", he: "דרגות, רצפים ולוח המובילים" },
  "ranks.desc": { en: "Every new word and every finished practice moves you toward the next rank.", he: "כל מילה חדשה וכל תרגול שמסיימים מקדמים לדרגה הבאה." },
  "ranks.s1": { en: "Tap the rank badge in the top bar to see your ranks.", he: "לוחצים על תג הדרגה בסרגל העליון כדי לראות את הדרגות." },
  "ranks.s2": { en: "A new word earns 1 point and a finished practice earns 10.", he: "מילה חדשה שווה נקודה, ותרגול שמסיימים שווה 10 נקודות." },
  "ranks.s3": { en: "Kids see a day streak, a weekly goal and their rank, and higher ranks unlock new looks.", he: "ילדים רואים רצף ימים, יעד שבועי ודרגה, ודרגות גבוהות פותחות עיצובים חדשים." },
  "ranks.s4": { en: "The family leaderboard in My family shows who looked up the most words.", he: "לוח המובילים ב'המשפחה שלי' מראה מי חיפש הכי הרבה מילים." },

  // ── guide: reader ──
  "reader.title": { en: "Read any text", he: "קוראים טקסט שלם" },
  "reader.desc": { en: "Photograph, paste or upload a text, tap any word, then check you understood.", he: "מצלמים, מדביקים או מעלים טקסט, לוחצים על כל מילה, ובסוף בודקים שהבנתם." },
  "reader.s1": { en: "In 'Every Word', paste a text, photograph a page, upload an image or PDF, or share your screen.", he: "ב'כל מילה' מדביקים טקסט, מצלמים עמוד, מעלים תמונה או PDF, או משתפים מסך." },
  "reader.s2": { en: "'Key words in this text' shows the words worth learning first.", he: "'המילים החשובות בקטע' מראה את המילים שכדאי ללמוד קודם." },
  "reader.s3": { en: "Tap any word for its meaning, and every word you open turns green.", he: "לוחצים על כל מילה כדי לראות את ההסבר שלה, וכל מילה שפתחתם נצבעת בירוק." },
  "reader.s4": { en: "At the end, the reading check asks what the words mean in the text.", he: "בסוף, בדיקת ההבנה שואלת מה פירוש המילים בתוך הטקסט." },

  // ── guide: say ──
  "say.title": { en: "Say it in another language", he: "אומרים את זה בשפה אחרת" },
  "say.desc": { en: "Type a sentence, pick a language, hear it and practise saying it.", he: "מקלידים משפט, בוחרים שפה, שומעים אותו ומתרגלים להגיד אותו." },
  "say.s1": { en: "In 'Say it', type or record a sentence and pick the language to hear it in.", he: "ב'תגיד את זה' מקלידים או מקליטים משפט, ובוחרים באיזו שפה לשמוע אותו." },
  "say.s2": { en: "Tap 'Say it' and hear exactly how it sounds.", he: "לוחצים 'תגיד את זה' ושומעים בדיוק איך זה נשמע." },
  "say.s3": { en: "Then tap 'Practice saying it' and say it aloud.", he: "אחר כך לוחצים 'תרגול הגייה' ואומרים את זה בקול." },
  "say.s4": { en: "You get up to five stars, and a tip when it is not there yet.", he: "מקבלים עד חמישה כוכבים, ועצה כשזה עוד לא מדויק." },

  // ── guide: practice ──
  "practice.title": { en: "Practice", he: "תרגולים" },
  "practice.desc": { en: "For grown-ups on Individual and Family: reading, test prep, dictation and a language.", he: "למבוגרים ב-Individual וב-Family: קריאה, הכנה למבחן, הכתבה ושפה." },
  "practice.s1": { en: "Open 'Practice' in the top menu.", he: "פותחים 'תרגולים' בתפריט העליון." },
  "practice.s2": { en: "Pick one of four: reading, a test, dictation or a language.", he: "בוחרים אחד מארבעה: קריאה, מבחן, הכתבה או שפה." },
  "practice.s3": { en: "For a test, paste the word list and practise until the day.", he: "למבחן, מדביקים את רשימת המילים ומתרגלים עד היום עצמו." },
  "practice.s4": { en: "In dictation you hear a word, write it and see the right spelling.", he: "בהכתבה שומעים מילה, כותבים אותה ורואים את הכתיב הנכון." },

  // ── guide: games ──
  "games.title": { en: "Word games", he: "משחקי מילים" },
  "games.desc": { en: "Games on the words in your notebook, and many more.", he: "משחקים על המילים מהמחברת שלכם, ועוד הרבה." },
  "games.s1": { en: "Open 'Play' in the top menu.", he: "פותחים 'משחקים' בתפריט העליון." },
  "games.s2": { en: "'From your notebook' plays on the words you looked up.", he: "ב'מהמחברת שלך' משחקים על המילים שחיפשתם." },
  "games.s3": { en: "Below are more games on word origins, precise words and word structure.", he: "מתחת יש עוד משחקים על מקור המילים, דיוק במילים ומבנה המילה." },
  "games.s4": { en: "Every finished game earns 10 points toward your rank.", he: "כל משחק שמסיימים שווה 10 נקודות לדרגה." },

  // ── guide: duel ──
  "duel.title": { en: "Word Duel", he: "דו-קרב מילים" },
  "duel.desc": { en: "The same questions against family, a friend or Word Bot.", he: "אותן שאלות מול בן משפחה, חבר או רובוט המילים." },
  "duel.s1": { en: "In 'Play', tap 'Play with someone'.", he: "ב'משחקים', לוחצים 'שחקו עם מישהו'." },
  "duel.s2": { en: "Play on this device, invite with a code or link, join with a code, or play Word Bot.", he: "משחקים על אותו מכשיר, מזמינים עם קוד או קישור, מצטרפים עם קוד, או משחקים נגד רובוט המילים." },
  "duel.s3": { en: "To play someone online now, a parent turns on 'Word Duel with other kids' in Settings.", he: "כדי לשחק מול מישהו שמחובר עכשיו, ההורה מפעיל 'דו-קרב מול ילדים אחרים' בהגדרות." },
  "duel.s4": { en: "Right and fast wins, and the wins table keeps score.", he: "מי שעונה נכון ומהר יותר מנצח, וטבלת הניצחונות שומרת את התוצאות." },

  // ── guide: account ──
  "account.title": { en: "Upgrade & manage plan", he: "שדרוג וניהול מנוי" },
  "account.desc": { en: "Upgrade a plan and manage your subscription.", he: "משדרגים תוכנית ומנהלים את המנוי." },
  "account.s1": { en: "Open 'Account' from the avatar menu to see your plan.", he: "פותחים את 'החשבון שלי' מתפריט האווטאר ורואים את התוכנית." },
  "account.s2": { en: "On Basic, tap 'Upgrade to Family' or 'Upgrade to Individual'.", he: "ב-Basic, לוחצים 'שדרוג ל-Family' או 'שדרוג ל-Individual'." },
  "account.s3": { en: "You land straight on the card details screen.", he: "מגיעים ישר למסך הוספת כרטיס האשראי." },
  "account.s4": { en: "On a paid plan, 'Manage billing' and 'Change plan' handle the rest.", he: "במנוי בתשלום, 'ניהול חיוב' ו'שינוי תוכנית' מטפלים בכל השאר." },

  // ── guide: cancel ──
  "cancel.title": { en: "Cancel, pause or stop renewal", he: "ביטול, השהיה או כיבוי החידוש" },
  "cancel.desc": { en: "What happens when you cancel, and the gentler options on the way.", he: "מה קורה כשמבטלים, ואילו אפשרויות עדינות יותר יש בדרך." },
  "cancel.s1": { en: "In Account, tap 'Cancel subscription' and pick a reason if you like.", he: "ב'החשבון שלי', לוחצים 'ביטול המנוי' ובוחרים סיבה אם רוצים." },
  "cancel.s2": { en: "On a monthly plan, you can pause for a month instead, with no payment.", he: "במנוי חודשי, אפשר במקום זה להשהות לחודש, בלי תשלום." },
  "cancel.s3": { en: "In a free trial, the reason 'I didn't want an automatic charge' lets you just turn off renewal.", he: "בתקופת ניסיון, הסיבה 'לא רצינו חיוב אוטומטי' מאפשרת פשוט לכבות את החידוש." },
  "cancel.s4": { en: "If you change your mind, tap 'I cancelled by mistake, keep the subscription'.", he: "אם התחרטתם, לוחצים 'ביטלתי בטעות, להמשיך את המנוי'." },
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
