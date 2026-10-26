import Image from "next/image";
import type { SubjectsUiLang } from "@/lib/subjects-langs";

/**
 * "Subjects" on the Families and Individuals landing pages (Gadi 2026-10-26):
 * the copy of the band and a faithful static recreation of the /subjects
 * word list (SubjectsClient.tsx), with real demo data copied from the
 * curriculum sets. Only he, en and de have the feature: the pages show the
 * band only when subjectsLangFor(lang) (lib/subjects-langs.ts) is not null.
 */

type BandCopy = { kicker: string; title: string; lines: string[]; note: string };

const HE: BandCopy = {
  kicker: "חדש ב-Gadit",
  title: "המילים החשובות של כל מקצוע בבית הספר",
  lines: [
    "מתמטיקה, כימיה, פיזיקה, ביולוגיה, היסטוריה וגאוגרפיה.",
    "בוחרים מקצוע ונושא, ומקבלים את המילים שמופיעות בשיעור.",
    "כל מילה מוסברת רק במשמעות של המקצוע: \"תא\" בביולוגיה הוא לא תא בכלא.",
    "כפתור אחד מוסיף את כל המילים למחברת, ומתרגלים אותן במשחקים לפני המבחן.",
  ],
  note: "בקרוב מקצועות נוספים.",
};
const EN: BandCopy = {
  kicker: "New in Gadit",
  title: "The key words of every school subject",
  lines: [
    "Math, chemistry, physics, biology, history and geography.",
    "Pick a subject and a topic, and get the words that come up in the lesson.",
    "Every word is explained in that subject's meaning only: a \"cell\" in biology isn't a prison cell.",
    "One button adds all the words to the notebook, to practise in the games before the test.",
  ],
  note: "More subjects coming soon.",
};
const DE_LINES_TAIL = [
  "Jedes Wort wird nur in der Bedeutung des Fachs erklärt: Eine \"Zelle\" in Biologie ist keine Gefängniszelle.",
  "Ein Knopf legt alle Wörter ins Notizbuch, zum Üben in den Spielen vor der Prüfung.",
];
/** Families page: parents are addressed with "Sie". */
const DE_SIE: BandCopy = {
  kicker: "Neu in Gadit",
  title: "Die wichtigsten Wörter jedes Schulfachs",
  lines: [
    "Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
    "Wählen Sie ein Fach und ein Thema, und Sie bekommen die Wörter, die im Unterricht vorkommen.",
    ...DE_LINES_TAIL,
  ],
  note: "Bald kommen weitere Fächer.",
};
/** Individuals page: the reader is addressed with "du". */
const DE_DU: BandCopy = {
  ...DE_SIE,
  lines: [
    "Mathematik, Chemie, Physik, Biologie, Geschichte und Geografie.",
    "Wähle ein Fach und ein Thema, und du bekommst die Wörter, die im Unterricht vorkommen.",
    ...DE_LINES_TAIL,
  ],
};

export function subjectsBandCopy(ui: SubjectsUiLang, page: "families" | "individuals"): BandCopy {
  if (ui === "he") return HE;
  if (ui === "de") return page === "families" ? DE_SIE : DE_DU;
  return EN;
}

/**
 * The topic screen as the app shows it, with real words. Hebrew: Firestore
 * curriculumSets/cur-85291ca745 (12 words); English: curriculum-sets-za.json
 * cur-za-ffbae8649d (8 words); German: curriculum-sets-de.json
 * cur-de-1992a697f0 (12 words). The first words in their real order.
 * UI strings as in SubjectsClient.tsx (STR).
 */
const MOCK: Record<SubjectsUiLang, {
  subject: string; topic: string; count: string; hint: string; listen: string; add: string;
  words: { w: string; d: string }[];
}> = {
  he: {
    subject: "כימיה",
    topic: "חומרים ותערובות",
    count: "12 מילים",
    hint: "לחיצה על מילה פותחת הסבר מלא שלה, בדיוק במשמעות של המקצוע הזה.",
    listen: "האזנה",
    add: "הוספת המילים למחברת",
    words: [
      { w: "חומר", d: "כל דבר שיש לו מסה ותופס מקום במרחב." },
      { w: "תערובת", d: "שילוב של שני חומרים או יותר, שכל אחד מהם שומר על תכונותיו." },
      { w: "תמיסה", d: "תערובת הומוגנית של חומר מומס בתוך ממס." },
      { w: "ממס", d: "החומר שבתוכו מתמוסס חומר אחר ליצירת תמיסה." },
      { w: "מומס", d: "החומר שמתמוסס בתוך ממס ליצירת תמיסה." },
    ],
  },
  en: {
    subject: "Chemistry",
    topic: "Solutions as special mixtures",
    count: "8 words",
    hint: "Tap a word for its full explanation, in exactly this subject's meaning.",
    listen: "Listen",
    add: "Add these words to my notebook",
    words: [
      { w: "solutions", d: "Mixtures where a solute is dissolved in a solvent." },
      { w: "soluble", d: "Able to be dissolved in a liquid." },
      { w: "insoluble", d: "Not able to be dissolved in a liquid." },
      { w: "evaporating", d: "The process of a liquid turning into a gas." },
      { w: "crystallisation", d: "The formation of crystals from a solution." },
    ],
  },
  de: {
    subject: "Chemie",
    topic: "Stoffe und ihre Eigenschaften",
    count: "12 Wörter",
    hint: "Tippe auf ein Wort: Es wird dir genau in der Bedeutung für dieses Fach erklärt.",
    listen: "Anhören",
    add: "Diese Wörter ins Notizbuch aufnehmen",
    words: [
      { w: "Stoff", d: "Ein Stoff ist ein Material mit bestimmten Eigenschaften. Zum Beispiel Holz, Glas, Wasser oder Eisen." },
      { w: "Eigenschaft", d: "Eine Eigenschaft beschreibt, wie ein Stoff ist. Dazu gehören zum Beispiel Farbe, Härte oder ob er Wasser aufnimmt." },
      { w: "fest", d: "Ein fester Stoff behält seine Form. Er fliesst nicht und lässt sich nicht einfach in ein anderes Gefäss giessen." },
      { w: "flüssig", d: "Ein flüssiger Stoff hat keine eigene Form. Er fliesst und nimmt die Form des Gefässes an." },
    ],
  },
};

function Speaker() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** A picture of the screen: nothing in it is a control. */
export function SubjectsScreenMock({ ui }: { ui: SubjectsUiLang }) {
  const m = MOCK[ui];
  return (
    <div className="lp-subj-screen" role="img" aria-label={`${m.subject}: ${m.topic}, ${m.count}`} dir={ui === "he" ? "rtl" : "ltr"} lang={ui}>
      <style>{CSS}</style>
      <div className="lp-subj-hero">
        <span className="lp-subj-hero-img">
          <Image src="/subjects/chemistry.webp" alt="" width={88} height={88} sizes="72px" />
        </span>
        <div className="lp-subj-hero-text">
          <div className="lp-subj-cat">{m.subject}</div>
          <div className="lp-subj-title">{m.topic}</div>
          <div className="lp-subj-meta">{m.count}</div>
        </div>
      </div>
      <p className="lp-subj-hint">{m.hint}</p>
      <ul className="lp-subj-words">
        {m.words.map((x) => (
          <li key={x.w} className="lp-subj-word">
            <div className="lp-subj-word-head">
              <span className="lp-subj-w">{x.w}</span>
              <span className="lp-subj-listen" title={m.listen}><Speaker /></span>
            </div>
            <span className="lp-subj-d">{x.d}</span>
          </li>
        ))}
      </ul>
      <div className="lp-subj-add"><span className="lp-subj-btn">{m.add}</span></div>
    </div>
  );
}

/** The copy column, one sentence per line (the colon line stays whole). */
export function SubjectsLines({ copy, pClass, noteClass }: { copy: BandCopy; pClass: string; noteClass: string }) {
  return (
    <>
      <p className={pClass}>
        {copy.lines.map((t) => <span key={t} style={{ display: "block" }}>{t}</span>)}
      </p>
      <p className={noteClass}>{copy.note}</p>
    </>
  );
}

// Same look as the /subjects page (globals.css .wb-subj-*), scoped for the landing pages.
const CSS = `
.lp-subj-screen { width: 100%; max-width: 420px; margin: 0 auto; box-sizing: border-box; padding: 20px 16px 18px; border-radius: 28px; background: #F2F6F4; border: 1px solid rgba(15,72,68,0.08); box-shadow: 0 34px 70px -28px rgba(16,40,60,0.40), 0 8px 20px rgba(16,40,60,0.08); text-align: start; }
.lp-subj-hero { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.lp-subj-hero-img { display: block; width: 72px; height: 72px; flex-shrink: 0; overflow: hidden; border-radius: 18px; background: #F2F6F4; box-shadow: 0 6px 18px rgba(11,18,32,.08); }
.lp-subj-hero-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lp-subj-hero-text { min-width: 0; }
.lp-subj-cat { font-size: 14px; font-weight: 700; color: #0EA5A5; }
.lp-subj-title { margin: 2px 0 3px; font-size: 21px; font-weight: 800; line-height: 1.2; color: #0B0F19; text-wrap: balance; }
.lp-subj-meta { font-size: 13.5px; font-weight: 600; color: #5C6270; }
.lp-subj-hint { margin: 0 0 12px; font-size: 13.5px; line-height: 1.5; color: #5C6270; }
.lp-subj-words { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px;
  -webkit-mask-image: linear-gradient(180deg, #000 82%, transparent 100%); mask-image: linear-gradient(180deg, #000 82%, transparent 100%); }
.lp-subj-word { padding: 10px 14px 12px; background: #fff; border: 1px solid #E2E5EA; border-radius: 14px; }
.lp-subj-word-head { display: flex; align-items: center; gap: 8px; }
.lp-subj-w { font-size: 17px; font-weight: 800; color: #155E75; overflow-wrap: anywhere; }
.lp-subj-listen { flex-shrink: 0; display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: #E0F6F4; color: #0B7D7D; }
.lp-subj-d { display: block; margin-top: 3px; font-size: 14.5px; line-height: 1.5; color: #3A3F4B; }
.lp-subj-add { display: flex; justify-content: center; margin-top: 14px; }
.lp-subj-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px; border-radius: 999px; background: #0F6F6C; color: #fff; font-size: 15px; font-weight: 700; text-align: center; box-shadow: 0 8px 20px -12px rgba(15,111,108,0.6); }
@media (max-width: 560px) {
  .lp-subj-screen { padding: 16px 12px 16px; border-radius: 24px; }
  .lp-subj-btn { width: 100%; box-sizing: border-box; }
}
`;
