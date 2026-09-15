/**
 * guide-i18n — all text for the in-app walkthroughs (titles, descriptions,
 * section names, per-step captions, and the labels that appear INSIDE the
 * recreated frames). Kept out of the components so the same guide renders in
 * every language. Authored he + en (Gadit's primary pair); every other
 * language falls back to en until translated, matching the app's established
 * component-i18n pattern. Add a language by adding its key to any entry.
 */

import type { Lang } from "@/lib/i18n";

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
};

export function gt(lang: Lang, key: string): string {
  const e = G[key];
  if (!e) return key;
  return e[lang] ?? e.en;
}

/** Interpolate {n} etc. */
export function gtf(lang: Lang, key: string, vars: Record<string, string | number>): string {
  let s = gt(lang, key);
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
