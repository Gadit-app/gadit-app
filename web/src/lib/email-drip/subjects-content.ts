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

/** Basic announcement only: the trial close before the button. */
const TRY_FREE: Record<SubjectsLang, string> = {
  he: L("## לנסות חינם", "מילות המפתח במקצועות כלולות במנויי Individual ו-Family.", "שני המנויים מתחילים ב-14 יום ניסיון חינם, ואפשר לבטל בכל רגע."),
  en: L("## Try it free", "Key words by subject come with the Individual and Family plans.", "Both start with a 14-day free trial, and you can cancel any time."),
  de: L("## Kostenlos ausprobieren", "Die Schlüsselwörter nach Fach gehören zu den Abos Individual und Family.", "Beide starten mit 14 Tagen kostenlos, und du kannst jederzeit kündigen."),
};


/** German for parents: the family series addresses them with "Sie"
 *  (emailTemplates fam2-*), the Individual series with "du". */
const DE_SIE = {
  middle: L(
    "## Jedes Fach mit seinen wichtigsten Wörtern",
    "Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
    "Wählen Sie ein Fach, Jüngere oder Ältere, dann ein Thema, zum Beispiel \"Stoffe und ihre Eigenschaften\" in Chemie.",
    "Sie bekommen die wichtigsten Wörter des Themas, jedes so erklärt, wie das Fach es braucht.",
    "## Nur die Bedeutung, die zum Fach passt",
    "Eine \"Zelle\" in Biologie ist keine Gefängniszelle, und \"Strom\" in Physik ist kein Fluss.",
    "Ein Tipp auf ein Wort öffnet eine ganze Erklärung mit Beispielen, nur in der Bedeutung des Fachs.",
    "Jedes Wort lässt sich auch anhören.",
  ),
  practise: L("## Üben vor der Prüfung", "Ein Knopf legt alle Wörter des Themas ins Notizbuch.", "Dort üben Ihre Kinder sie in den Spielen, bis sie sitzen."),
  kids: "Ihre Kinder sehen den Reiter auch in ihrem eigenen Profil.",
  try_free: L("## Kostenlos ausprobieren", "Die Schlüsselwörter nach Fach gehören zu den Abos Individual und Family.", "Beide starten mit 14 Tagen kostenlos, und Sie können jederzeit kündigen."),
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

/** The launch announcement has its own, warmer copy (Gadi 2026-10-26: "it's
 *  something new and great, it should feel like it"): good news first, what a
 *  subject means at school, more subjects coming, and a question to reply to
 *  (replies reach gadi@gadit.app). The series emails keep the calmer copy above. */
const ANN: Record<SubjectsLang, { subject: string; open: string; middle: string; practise: string; soon: string; cta: string }> = {
  he: {
    subject: "חדש ב-Gadit: המילים החשובות של כל מקצוע בבית הספר",
    open: L(
      "שמחים לבשר לכם על משהו חדש ב-Gadit.",
      "הוספנו אזור חדש: **מקצועות**.",
      "זה המקום של המילים החשובות במקצועות של בית הספר: מתמטיקה, כימיה, פיזיקה, ביולוגיה, היסטוריה וגאוגרפיה.",
      "הוא מופיע בתפריט העליון.",
    ),
    middle: L(
      "## בדיוק מה שלומדים בכיתה",
      "בוחרים מקצוע, צעירים או בוגרים, ואז נושא, למשל \"חומרים ותערובות\" בכימיה.",
      "מקבלים את המילים שמופיעות בשיעור, כל אחת עם ההסבר שלה במקצוע הזה.",
      "## בלי לבלבל בין משמעויות",
      "\"תא\" בביולוגיה הוא לא תא בכלא, ו\"תמיסה\" בכימיה היא לא סתם נוזל.",
      "לחיצה על מילה פותחת הסבר מלא עם דוגמאות, רק במשמעות של המקצוע.",
      "ואפשר גם להקשיב לכל מילה.",
    ),
    practise: L("## מגיעים מוכנים למבחן", "כפתור אחד מוסיף את כל המילים של הנושא למחברת.", "משם מתרגלים אותן במשחקים, עד שהן יושבות."),
    soon: L(
      "## ובקרוב, עוד מקצועות",
      "אנחנו כבר עובדים על המקצועות הבאים.",
      "ונשמח לשמוע מכם: באיזה מקצוע הייתם רוצים לראות את מילות המפתח?",
      "פשוט עונים למייל הזה, ואנחנו קוראים כל תשובה.",
    ),
    cta: "לגלות את המקצועות",
  },
  en: {
    subject: "New in Gadit: the key words of every school subject",
    open: L(
      "We're happy to share something new in Gadit.",
      "We've added a new area: **Subjects**.",
      "It's where you'll find the key words of school subjects: math, chemistry, physics, biology, history and geography.",
      "You'll find it in the top menu.",
    ),
    middle: L(
      "## Exactly what's taught in class",
      "Pick a subject, younger or older, then a topic, like \"Solutions as special mixtures\" in chemistry.",
      "You get the words that come up in the lesson, each explained the way that subject uses it.",
      "## No mixed-up meanings",
      "A \"cell\" in biology isn't a prison cell, and \"power\" in physics isn't about who's in charge.",
      "Tap a word for a full explanation with examples, in that subject's meaning only.",
      "You can listen to every word too.",
    ),
    practise: L("## Ready for the test", "One button adds all the topic's words to the notebook.", "From there you practise them in the games until they stick."),
    soon: L(
      "## More subjects soon",
      "We're already working on the next ones.",
      "And we'd love to hear from you: which subject's key words would you like to see?",
      "Just reply to this email. We read every answer.",
    ),
    cta: "Explore Subjects",
  },
  de: {
    subject: "Neu in Gadit: die wichtigsten Wörter jedes Schulfachs",
    open: L(
      "Wir freuen uns, Ihnen etwas Neues in Gadit vorzustellen.",
      "Es gibt jetzt einen neuen Bereich: **Fächer**.",
      "Hier finden Sie die wichtigsten Wörter der Schulfächer: Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
      "Sie finden ihn oben im Menü.",
    ),
    middle: L(
      "## Genau das, was im Unterricht vorkommt",
      "Wählen Sie ein Fach, Jüngere oder Ältere, dann ein Thema, zum Beispiel \"Stoffe und ihre Eigenschaften\" in Chemie.",
      "Sie bekommen die Wörter, die im Unterricht vorkommen, jedes so erklärt, wie das Fach es braucht.",
      "## Keine verwechselten Bedeutungen",
      "Eine \"Zelle\" in Biologie ist keine Gefängniszelle, und \"Strom\" in Physik ist kein Fluss.",
      "Ein Tipp auf ein Wort öffnet eine ganze Erklärung mit Beispielen, nur in der Bedeutung des Fachs.",
      "Jedes Wort lässt sich auch anhören.",
    ),
    practise: L("## Gut vorbereitet für die Prüfung", "Ein Knopf legt alle Wörter des Themas ins Notizbuch.", "Dort üben Ihre Kinder sie in den Spielen, bis sie sitzen."),
    soon: L(
      "## Bald kommen weitere Fächer",
      "Wir arbeiten schon an den nächsten.",
      "Und wir möchten gern von Ihnen hören: Zu welchem Fach würden Sie gern die wichtigsten Wörter sehen?",
      "Antworten Sie einfach auf diese E-Mail. Wir lesen jede Antwort.",
    ),
    cta: "Fächer entdecken",
  },
};

/** Announcement "2026-10-subjects" (Family owners + Individual). */
export function subjectsAnnouncement(l: SubjectsLang): EmailContent {
  const a = ANN[l];
  return mail(a.subject, L(GREETING[l], a.open, a.middle, a.practise, a.soon), a.cta);
}

/** Announcement "2026-10-subjects-basic" (Basic accounts): the trial close before "more subjects soon". */
export function subjectsAnnouncementBasic(l: SubjectsLang): EmailContent {
  const a = ANN[l];
  const tryFree = l === "de" ? DE_SIE.try_free : TRY_FREE[l];
  return mail(a.subject, L(GREETING[l], a.open, a.middle, a.practise, tryFree, a.soon), CTA_TRY[l]);
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
