import type { EmailContent } from "./render";

/**
 * "Key words by subject" (/subjects, launched 2026-10-26) in email: the
 * "what's new" announcement to subscribers, its Basic version with a trial
 * close, and the two onboarding-series emails (fam2-subjects, ind-subjects).
 * One source for the shared paragraphs so the four never drift apart.
 *
 * The feature exists only in the he / en / de interface, so every one of
 * these emails goes ONLY to people whose language is one of SUBJECTS_LANGS
 * (never an English fallback). Every sentence is its own paragraph.
 */

export const SUBJECTS_LANGS = ["he", "en", "de"] as const;
export type SubjectsLang = (typeof SUBJECTS_LANGS)[number];

const L = (...lines: string[]) => lines.join("\n\n");

const GREETING: Record<SubjectsLang, string> = { he: "היי {שם},", en: "Hi {name},", de: "Hallo {name}," };

/** First line of the series emails. */
const INTRO_SERIES: Record<SubjectsLang, string> = {
  he: "בתפריט העליון של Gadit יש לשונית בשם **מקצועות**.",
  en: "Gadit has a tab called **Subjects** in the top menu.",
  de: "Oben im Menü von Gadit gibt es den Reiter **Fächer**.",
};

const MIDDLE: Record<SubjectsLang, string> = {
  he: L(
    "## כל מקצוע והמילים החשובות שלו",
    "מתמטיקה, כימיה, פיזיקה, ביולוגיה, היסטוריה וגאוגרפיה.",
    "בוחרים מקצוע, צעירים או בוגרים, ואז נושא, למשל \"חומרים ותערובות\" בכימיה.",
    "מקבלים את המילים החשובות של הנושא, כל אחת עם ההסבר שלה במקצוע הזה.",
    "## רק המשמעות של המקצוע",
    "\"תא\" בביולוגיה הוא לא תא בכלא, ו\"תמיסה\" בכימיה היא לא סתם נוזל.",
    "לחיצה על מילה פותחת הסבר מלא עם דוגמאות, רק במשמעות של המקצוע.",
    "אפשר גם להקשיב לכל מילה.",
  ),
  en: L(
    "## Every subject and its key words",
    "Math, chemistry, physics, biology, history and geography.",
    "Pick a subject, younger or older, then a topic, like \"Solutions as special mixtures\" in chemistry.",
    "You get the topic's key words, each explained the way that subject uses it.",
    "## Only the meaning that fits the subject",
    "A \"cell\" in biology isn't a prison cell, and \"power\" in physics isn't about who's in charge.",
    "Tap a word for a full explanation with examples, in that subject's meaning only.",
    "You can listen to every word too.",
  ),
  de: L(
    "## Jedes Fach mit seinen wichtigsten Wörtern",
    "Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
    "Wähle ein Fach, Jüngere oder Ältere, dann ein Thema, zum Beispiel \"Stoffe und ihre Eigenschaften\" in Chemie.",
    "Du bekommst die wichtigsten Wörter des Themas, jedes so erklärt, wie das Fach es braucht.",
    "## Nur die Bedeutung, die zum Fach passt",
    "Eine \"Zelle\" in Biologie ist keine Gefängniszelle, und \"Strom\" in Physik ist kein Fluss.",
    "Tippe auf ein Wort für eine ganze Erklärung mit Beispielen, nur in der Bedeutung des Fachs.",
    "Du kannst dir jedes Wort auch anhören.",
  ),
};

const PRACTISE: Record<SubjectsLang, string> = {
  he: L("## מתרגלים לפני המבחן", "כפתור אחד מוסיף את כל המילים של הנושא למחברת.", "משם מתרגלים אותן במשחקים, עד שהן יושבות."),
  en: L("## Practise before the test", "One button adds all the topic's words to the notebook.", "From there you practise them in the games until they stick."),
  de: L("## Üben vor der Prüfung", "Ein Knopf legt alle Wörter des Themas ins Notizbuch.", "Dort übst du sie in den Spielen, bis sie sitzen."),
};

/** Family series only: the last line of the practise part. */
const KIDS_LINE: Record<SubjectsLang, string> = {
  he: "גם הילדים רואים את הלשונית בפרופיל שלהם.",
  en: "Your kids see the tab on their own profiles too.",
  de: "Deine Kinder sehen den Reiter auch in ihrem eigenen Profil.",
};

const SUBJECT_SERIES: Record<SubjectsLang, string> = {
  he: "המילים החשובות של כל מקצוע, במקום אחד",
  en: "Every subject's key words, in one place",
  de: "Die wichtigsten Wörter jedes Fachs, an einem Ort",
};
const CTA: Record<SubjectsLang, string> = { he: "למילות המפתח במקצועות", en: "See key words by subject", de: "Zu den Schlüsselwörtern" };
const CTA_TRY: Record<SubjectsLang, string> = { he: "לנסות 14 יום חינם", en: "Try 14 days free", de: "14 Tage kostenlos testen" };

const mail = (subject: string, body: string, ctaText: string): EmailContent => ({ subject, heading: "", body, ctaText, next: "" });

/** The line under the button that points to the next series email. */
const NEXT_FAMILY: Record<SubjectsLang, string> = {
  he: "במייל הבא נראה מה הילד עשה בשבועיים הראשונים.",
  en: "In the next email, we will show what your child did in the first two weeks.",
  de: "In der nächsten E-Mail zeigen wir, was Ihr Kind in den ersten zwei Wochen gemacht hat.",
};
const NEXT_INDIV: Record<SubjectsLang, string> = {
  he: "במייל הבא נראה מה כבר בניתם בשבועיים הראשונים.",
  en: "In the next email, we'll look at what you've already built in your first two weeks.",
  de: "In der nächsten E-Mail sehen wir uns an, was du in deinen ersten zwei Wochen schon aufgebaut hast.",
};

/** The launch announcement, in Gadi's own wording (2026-10-26): good news
 *  first, what the Subjects area is, how it works, more subjects coming, and a
 *  question to reply to (replies reach gadi@gadit.app). Addressed in the
 *  singular, signed by Gadi and the team. The series emails keep the calmer
 *  copy above. */
const ANN: Record<SubjectsLang, { subject: string; body: string; tryFree: string; soon: string; cta: string; signature: string }> = {
  he: {
    subject: "חדש ב-Gadit: המילים החשובות של כל מקצוע בבית הספר",
    body: L(
      "היי {שם},",
      "שמחים לבשר לך על משהו חדש ב-Gadit.",
      "הוספנו אזור חדש שנקרא **מקצועות**.",
      "זה המקום של המילים החשובות ביותר בכל מקצוע או נושא שלומדים בבית הספר: מתמטיקה, כימיה, פיזיקה, ביולוגיה, היסטוריה וגאוגרפיה.",
      "הוא מופיע בתפריט העליון במחשב, או בלחיצה על שלושת הפסים בטלפון הנייד.",
      "## איך זה עובד",
      "בוחרים את המקצוע, ואז צעירים או בוגרים, ואז את הנושא, למשל \"חומרים ותערובות\" בכימיה.",
      "מקבלים את המילים שמופיעות בשיעור, כל אחת עם ההסבר שלה במקצוע הזה.",
      "## בלי לבלבל בין משמעויות",
      "\"תא\" בביולוגיה הוא לא תא בכלא, ו\"תמיסה\" בכימיה היא לא סתם נוזל.",
      "לחיצה על המילה פותחת הסבר מלא עם דוגמאות ותמונה, רק במשמעות של המקצוע.",
      "ואפשר גם להקשיב לכל מילה ולהסבר שלה.",
      "## מגיעים מוכנים למבחן",
      "כפתור אחד מוסיף את כל המילים של הנושא למחברת.",
      "משם מתרגלים אותן במשחקים, עד שהן יושבות.",
    ),
    tryFree: L("## לנסות חינם", "מילות המפתח במקצועות כלולות במנויי Individual ו-Family.", "שני המנויים מתחילים ב-14 יום ניסיון חינם, ואפשר לבטל בכל רגע."),
    soon: L(
      "## ובקרוב, עוד מקצועות",
      "אנחנו כבר עובדים על המקצועות הבאים.",
      "ונשמח לשמוע ממך: איזה מקצוע היית רוצה לראות ברשימה?",
      "פשוט עונים למייל הזה, ואנחנו קוראים כל תשובה.",
    ),
    cta: "לגלות את המקצועות",
    signature: "גדי והצוות של Gadit",
  },
  en: {
    subject: "New in Gadit: the key words of every school subject",
    body: L(
      "Hi {name},",
      "We're happy to share something new in Gadit.",
      "We've added a new area called **Subjects**.",
      "It's the place for the most important words of every subject and topic taught at school: math, chemistry, physics, biology, history and geography.",
      "You'll find it in the top menu on a computer, or by tapping the three lines on your phone.",
      "## How it works",
      "Pick the subject, then younger or older, then the topic, like \"Solutions as special mixtures\" in chemistry.",
      "You get the words that come up in the lesson, each with its explanation in that subject.",
      "## No mixed-up meanings",
      "A \"cell\" in biology isn't a prison cell, and \"power\" in physics isn't about who's in charge.",
      "Tapping a word opens a full explanation with examples and a picture, in that subject's meaning only.",
      "You can also listen to every word and its explanation.",
      "## Ready for the test",
      "One button adds all the topic's words to the notebook.",
      "From there you practise them in the games until they stick.",
    ),
    tryFree: L("## Try it free", "Key words by subject come with the Individual and Family plans.", "Both start with a 14-day free trial, and you can cancel any time."),
    soon: L(
      "## More subjects soon",
      "We're already working on the next ones.",
      "And we'd love to hear from you: which subject would you like to see on the list?",
      "Just reply to this email. We read every answer.",
    ),
    cta: "Explore Subjects",
    signature: "Gadi and the Gadit team",
  },
  de: {
    subject: "Neu in Gadit: die wichtigsten Wörter jedes Schulfachs",
    body: L(
      "Hallo {name},",
      "Wir freuen uns, Ihnen etwas Neues in Gadit vorzustellen.",
      "Es gibt jetzt einen neuen Bereich namens **Fächer**.",
      "Hier finden Sie die wichtigsten Wörter jedes Fachs und Themas aus der Schule: Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
      "Sie finden ihn oben im Menü am Computer, oder mit einem Tipp auf die drei Striche am Handy.",
      "## So funktioniert es",
      "Wählen Sie das Fach, dann Jüngere oder Ältere, dann das Thema, zum Beispiel \"Stoffe und ihre Eigenschaften\" in Chemie.",
      "Sie bekommen die Wörter, die im Unterricht vorkommen, jedes mit seiner Erklärung in diesem Fach.",
      "## Keine verwechselten Bedeutungen",
      "Eine \"Zelle\" in Biologie ist keine Gefängniszelle, und \"Strom\" in Physik ist kein Fluss.",
      "Ein Tipp auf das Wort öffnet eine ganze Erklärung mit Beispielen und Bild, nur in der Bedeutung des Fachs.",
      "Jedes Wort und seine Erklärung lassen sich auch anhören.",
      "## Gut vorbereitet für die Prüfung",
      "Ein Knopf legt alle Wörter des Themas ins Notizbuch.",
      "Dort üben Ihre Kinder sie in den Spielen, bis sie sitzen.",
    ),
    tryFree: DE_SIE.try_free,
    soon: L(
      "## Bald kommen weitere Fächer",
      "Wir arbeiten schon an den nächsten.",
      "Und wir möchten gern von Ihnen hören: Welches Fach würden Sie gern auf der Liste sehen?",
      "Antworten Sie einfach auf diese E-Mail. Wir lesen jede Antwort.",
    ),
    cta: "Fächer entdecken",
    signature: "Gadi und das Gadit-Team",
  },
};

const announce = (l: SubjectsLang, body: string, ctaText: string): EmailContent =>
  ({ subject: ANN[l].subject, heading: "", body, ctaText, next: "", closing: "", signature: ANN[l].signature });

/** Announcement "2026-10-subjects" (Family owners + Individual). */
export function subjectsAnnouncement(l: SubjectsLang): EmailContent {
  return announce(l, L(ANN[l].body, ANN[l].soon), ANN[l].cta);
}

/** Announcement "2026-10-subjects-basic" (Basic accounts): the trial close before "more subjects soon". */
export function subjectsAnnouncementBasic(l: SubjectsLang): EmailContent {
  return announce(l, L(ANN[l].body, ANN[l].tryFree, ANN[l].soon), CTA_TRY[l]);
}

/** Onboarding series email: fam2-subjects (family: true) or ind-subjects. */
export function subjectsSeries(l: SubjectsLang, family: boolean): EmailContent {
  const body = family && l === "de"
    ? L(GREETING.de, INTRO_SERIES.de, DE_SIE.middle, L(DE_SIE.practise, DE_SIE.kids))
    : L(GREETING[l], INTRO_SERIES[l], MIDDLE[l], family ? L(PRACTISE[l], KIDS_LINE[l]) : PRACTISE[l]);
  return { ...mail(SUBJECT_SERIES[l], body, CTA[l]), next: (family ? NEXT_FAMILY : NEXT_INDIV)[l] };
}

export const SUBJECTS_SERIES_KEYS = { family: "fam2-subjects", individual: "ind-subjects" } as const;

/** The German series emails as code translations (email-templates-store
 *  CODE_I18N), so German works without a Firestore entry. */
export const SUBJECTS_SERIES_I18N: Record<string, Partial<Record<string, EmailContent>>> = {
  [SUBJECTS_SERIES_KEYS.family]: { de: subjectsSeries("de", true) },
  [SUBJECTS_SERIES_KEYS.individual]: { de: subjectsSeries("de", false) },
};
