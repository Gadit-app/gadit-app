import Image from "next/image";
import type { SubjectsBandLang } from "@/lib/subjects-langs";

/**
 * "Subjects" on the Families and Individuals landing pages (Gadi 2026-10-26):
 * the copy of the band and a faithful static recreation of the /subjects
 * word list (SubjectsClient.tsx), with real demo data copied from the
 * curriculum sets. Only he, en, de and ar have the feature: the pages show the
 * band only when subjectsBandLangFor(lang) (lib/subjects-langs.ts) is not null.
 */

type BandCopy = { kicker: string; title: string; lines: string[]; note: string };

const HE: BandCopy = {
  kicker: "חדש ב-Gadit",
  title: "המילים החשובות של כל מקצוע בבית הספר",
  lines: [
    "חשבון, גאומטריה, מדעים, עברית, אנגלית, מולדת, גאוגרפיה והיסטוריה.",
    "בוחרים מקצוע ונושא, ומקבלים את המילים שמופיעות בשיעור.",
    "כל מילה מוסברת רק במשמעות של המקצוע: \"שבר\" בחשבון הוא לא שבר ביד.",
    "כפתור אחד מוסיף את כל המילים למחברת, ומתרגלים אותן במשחקים לפני המבחן.",
  ],
  note: "בקרוב מקצועות נוספים.",
};
const EN: BandCopy = {
  kicker: "New in Gadit",
  title: "The key words of every school subject",
  lines: [
    "Math, geometry, science, English, life skills, geography and history.",
    "Pick a subject and a topic, and get the words that come up in the lesson.",
    "Every word is explained in that subject's meaning only: a \"table\" in math isn't the one you eat at.",
    "One button adds all the words to the notebook, to practise in the games before the test.",
  ],
  note: "More subjects coming soon.",
};
const DE_LINES_TAIL = [
  "Jedes Wort wird nur in der Bedeutung des Fachs erklärt: Ein \"Bruch\" in Mathematik ist kein Knochenbruch.",
  "Ein Knopf legt alle Wörter ins Notizbuch, zum Üben in den Spielen vor der Prüfung.",
];
/** Families page: parents are addressed with "Sie". */
const DE_SIE: BandCopy = {
  kicker: "Neu in Gadit",
  title: "Die wichtigsten Wörter jedes Schulfachs",
  lines: [
    "Mathematik, Geometrie, Natur und Technik, Deutsch, Geografie und Geschichte.",
    "Wählen Sie ein Fach und ein Thema, und Sie bekommen die Wörter, die im Unterricht vorkommen.",
    ...DE_LINES_TAIL,
  ],
  note: "Bald kommen weitere Fächer.",
};
/** Individuals page: the reader is addressed with "du". */
const DE_DU: BandCopy = {
  ...DE_SIE,
  lines: [
    "Mathematik, Geometrie, Natur und Technik, Deutsch, Geografie und Geschichte.",
    "Wähle ein Fach und ein Thema, und du bekommst die Wörter, die im Unterricht vorkommen.",
    ...DE_LINES_TAIL,
  ],
};

/** Arabic (Gadi 2026-10-28): one copy for both pages, the reader addressed in the singular like the rest of the Arabic landing. */
const AR: BandCopy = {
  kicker: "جديد في Gadit",
  title: "الكلمات المهمة في كل مادة دراسية",
  lines: [
    "الرياضيات، العلوم، الكيمياء، الفيزياء، الأحياء، اللغة العربية، الموطن والمجتمع، الجغرافيا والتاريخ.",
    "اختر المادة والموضوع، واحصل على الكلمات التي ترد في الدرس.",
    "كل كلمة تُشرح بمعناها في المادة فقط: «الجذر» في الرياضيات ليس جذر الشجرة.",
    "زر واحد يضيف كل الكلمات إلى الدفتر، للتدرب عليها في الألعاب قبل الامتحان.",
  ],
  note: "قريبا مواد أخرى.",
};

export function subjectsBandCopy(ui: SubjectsBandLang, page: "families" | "individuals"): BandCopy {
  if (ui === "he") return HE;
  if (ui === "de") return page === "families" ? DE_SIE : DE_DU;
  if (ui === "ar") return AR;
  return EN;
}

/**
 * The topic screen as the app shows it, with real words: elementary
 * geometry, angles (Gadi 2026-10-26). Hebrew: Firestore
 * curriculumSets/cur-0fbf7bc106 "זוויות" (12 words); English:
 * curriculum-sets-za.json cur-za-73cc2e30ef (Grade 7, the last year of
 * primary school in South Africa, 8 words); German: curriculum-sets-de.json
 * cur-de-103530cf09 "Geometrie" (12 words); Arabic: Firestore
 * curriculumSets/cur-ar-4e5bc665fd "أشكال هندسيّة وأجسام" (grade 4, 12 words). A few of the words, with their
 * definitions copied as they are, in their real order. One row is open with
 * its picture, like a meaning on the word page: an obtuse angle
 * (public/fam/obtuse-angle.webp, drawn once in the Gadit house style, no
 * text, shared by the 4 languages).
 * UI strings as in SubjectsClient.tsx (STR).
 */
type MockWord = { w: string; d: string; open?: boolean };
const MOCK: Record<SubjectsBandLang, {
  subject: string; topic: string; count: string; hint: string; listen: string; add: string; picture: string;
  words: MockWord[];
}> = {
  he: {
    subject: "גאומטריה",
    topic: "זוויות",
    count: "12 מילים",
    hint: "לחיצה על מילה פותחת הסבר מלא שלה, בדיוק במשמעות של המקצוע הזה.",
    listen: "האזנה",
    add: "הוספת המילים למחברת",
    picture: "זווית קהה: שתי קרניים שנפגשות בקדקוד, פתוחות יותר מזווית ישרה",
    words: [
      { w: "זווית", d: "המרחב הנוצר בין שני קווים ישרים הנפגשים בנקודה." },
      { w: "זווית ישרה", d: "זווית שגודלה 90 מעלות." },
      { w: "זווית חדה", d: "זווית שגודלה קטן מ-90 מעלות." },
      { w: "זווית קהה", d: "זווית שגודלה גדול מ-90 מעלות וקטן מ-180 מעלות.", open: true },
      { w: "זווית שטוחה", d: "זווית שגודלה 180 מעלות." },
    ],
  },
  en: {
    subject: "Geometry",
    topic: "Construction of geometric figures",
    count: "8 words",
    hint: "Tap a word for its full explanation, in exactly this subject's meaning.",
    listen: "Listen",
    add: "Add these words to my notebook",
    picture: "An obtuse angle: two rays meeting at a vertex, opened wider than a right angle",
    words: [
      { w: "protractor", d: "A tool used to measure angles in degrees." },
      { w: "acute angles", d: "Angles that are less than 90 degrees." },
      { w: "right-angles", d: "Angles that are exactly 90 degrees." },
      { w: "obtuse angles", d: "Angles that are more than 90 degrees but less than 180 degrees.", open: true },
      { w: "parallel lines", d: "Lines that are always the same distance apart and never meet." },
    ],
  },
  de: {
    subject: "Geometrie",
    topic: "Geometrie",
    count: "12 Wörter",
    hint: "Tippe auf ein Wort: Es wird dir genau in der Bedeutung für dieses Fach erklärt.",
    listen: "Anhören",
    add: "Diese Wörter ins Notizbuch aufnehmen",
    picture: "Ein stumpfer Winkel: zwei Strecken treffen sich in einem Punkt, weiter geöffnet als ein rechter Winkel",
    words: [
      { w: "Punkt", d: "Ein Punkt zeigt eine genaue Lage. Er hat keine Länge, Breite oder Höhe." },
      { w: "Strecke", d: "Eine Strecke ist die gerade Verbindung zwischen zwei Punkten. Sie hat einen Anfang und ein Ende." },
      { w: "Winkel", d: "Ein Winkel entsteht, wenn zwei Linien oder Strecken an einem Punkt zusammentreffen. Er zeigt die Grösse der Drehung.", open: true },
      { w: "parallel", d: "Parallele Geraden haben immer den gleichen Abstand. Sie schneiden sich nie." },
    ],
  },
  ar: {
    subject: "الرياضيات",
    topic: "أشكال هندسيّة وأجسام",
    count: "12 كلمة",
    hint: "اضغط على كلمة لترى شرحها الكامل، بمعناها في هذه المادة بالضبط.",
    listen: "استماع",
    add: "إضافة هذه الكلمات إلى دفتري",
    picture: "زاوية منفرجة: ضلعان يلتقيان في رأس، وفتحتهما أكبر من الزاوية القائمة",
    words: [
      { w: "مضلع", d: "شكل مستو مغلق يتكون من قطع مستقيمة فقط، مثل المثلث والمربع والمستطيل." },
      { w: "ضلع", d: "قطعة مستقيمة تكوّن جزءا من حدود الشكل الهندسي أو وجها من أوجه بعض المجسمات." },
      { w: "رأس", d: "نقطة يلتقي فيها ضلعان في شكل مستو، أو عدة أحرف في مجسم." },
      { w: "زاوية", d: "مقدار الفتحة بين ضلعين يلتقيان في نقطة واحدة داخل الشكل أو عند حدوده.", open: true },
      { w: "مثلث", d: "مضلع له ثلاثة أضلاع وثلاثة رؤوس، وهو أبسط الأشكال المضلعّة." },
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
export function SubjectsScreenMock({ ui }: { ui: SubjectsBandLang }) {
  const m = MOCK[ui];
  return (
    <div className="lp-subj-screen" role="img" aria-label={`${m.subject}: ${m.topic}, ${m.count}`} dir={ui === "he" || ui === "ar" ? "rtl" : "ltr"} lang={ui}>
      <style>{CSS}</style>
      <div className="lp-subj-hero">
        <span className="lp-subj-hero-img">
          <Image src="/subjects/cat-math.webp" alt="" width={88} height={88} sizes="72px" />
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
          <li key={x.w} className={x.open ? "lp-subj-word is-open" : "lp-subj-word"}>
            <div className="lp-subj-word-head">
              <span className="lp-subj-w">{x.w}</span>
              <span className="lp-subj-listen" title={m.listen}><Speaker /></span>
            </div>
            <span className="lp-subj-d">{x.d}</span>
            {x.open && (
              <span className="lp-subj-pic">
                <Image src="/fam/obtuse-angle.webp" alt={m.picture} width={768} height={768} sizes="(max-width: 560px) 70vw, 260px" />
              </span>
            )}
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
.lp-subj-word.is-open { border-color: #9FDCD6; box-shadow: 0 10px 24px -16px rgba(15,111,108,0.45); }
.lp-subj-pic { display: block; width: 100%; max-width: 260px; aspect-ratio: 4 / 3; margin: 10px auto 0; overflow: hidden; border-radius: 14px; background: #FBF1E1; }
.lp-subj-pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lp-subj-add { display: flex; justify-content: center; margin-top: 14px; }
.lp-subj-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px; border-radius: 999px; background: #0F6F6C; color: #fff; font-size: 15px; font-weight: 700; text-align: center; box-shadow: 0 8px 20px -12px rgba(15,111,108,0.6); }
@media (max-width: 560px) {
  .lp-subj-screen { padding: 16px 12px 16px; border-radius: 24px; }
  .lp-subj-btn { width: 100%; box-sizing: border-box; }
}
`;
