/**
 * Real words from real families and teachers (Gadi 2026-10-12: Reut Arbel,
 * a teacher and a mother of three, and Ziv, grade 5). Shortened from what
 * they sent, one sentence per line. Hebrew landing pages only for now.
 * A child is named by first name and grade only.
 */
export type Testimonial = { quote: string; who: string };

export function Testimonials({ kicker, title, items }: { kicker: string; title: string; items: Testimonial[] }) {
  return (
    <div className="gt-quotes">
      <div className="gt-quotes-kicker">{kicker}</div>
      <h2 className="gt-quotes-title">{title}</h2>
      <div className="gt-quotes-grid">
        {items.map((t) => (
          <figure key={t.who} className="gt-quote">
            <blockquote>
              {t.quote.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </blockquote>
            <figcaption>{t.who}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export const FAMILY_TESTIMONIALS_HE: Testimonial[] = [
  {
    quote: [
      "כאמא לילדה שמתמודדת עם קשיים שפתיים, הרבה פעמים הרגשתי תסכול כשהיא לא הבינה הוראות או מושגים פשוטים.",
      "מאז שהכנסתי את Gadit לטלפונים של שלושת הילדים שלי, השינוי פשוט מדהים.",
      "לימדתי אותם הרגל אחד: לא מבינים מילה? פותחים Gadit.",
      "היום הם כבר לא באים לשאול אותי על כל דבר, הם בודקים לבד.",
      "ובסופי שבוע אנחנו עוברים יחד על המילים החדשות של השבוע, ומשחקים בהן.",
    ].join("\n"),
    who: "רעות ארבל, אמא לשלושה",
  },
  {
    quote: [
      "Gadit היא אפליקציה כיפית, נוחה וידידותית מאוד, במיוחד לילדים!",
      "הבת שלי התאמנה איתה לקראת הכתבה באנגלית.",
      "בעבר היינו מכינות כרטיסיות, אבל עם Gadit הכול נעשה הרבה יותר פשוט ומהנה.",
      "האפליקציה מציעה דרכים אינטראקטיביות וכיפיות לתרגל, כמו משחק זיכרון ותרגול הכתבה שבו מקבלים מילה וצריך לכתוב אותה.",
      "במקרה שלנו, היא תרגלה מילים מעברית לאנגלית.",
      "הבת שלי מאוד נהנתה מהתרגול, וגם הצליחה מאוד בהכתבה!",
      "אני כבר רואה איך נמשיך להשתמש באפליקציה גם לתרגול בעברית וגם באנגלית.",
      "ממליצה בחום גדול!",
    ].join("\n"),
    who: "גת מגידו, אמא של זיו",
  },
  {
    quote: [
      "מאוד מאוד מאוד אהבתי את ההכתבות, את המשחקים, ואת שיעורי הבית שאפשר לתרגם עם Gadit.",
      "אפשר לצלם טקסט של שיעורי הבית ואז לראות את הפירוש של כל המילים.",
      "אם יש שני פירושים למילה אז הוא נותן לי את שני הפירושים.",
      "יש גם יעדים שזה גם ממש כאילו מוסיף מוטיבציה להמשיך ללמוד מילים חדשות.",
      "ממש ממש ממש ממש ממש ממש אוהבת את האפליקציה.",
    ].join("\n"),
    who: "זיו, כיתה ה'",
  },
  {
    quote: [
      "Gadit פשוט מעולה!",
      "הוא ממש עוזר לי ללמוד טוב יותר ולהבין את מה שאני קוראת.",
      "ממליצה מאוד!",
    ].join("\n"),
    who: "תום, בת 15",
  },
];

export const SCHOOL_TESTIMONIALS_HE: Testimonial[] = [
  {
    quote: [
      "Gadit הפך לכוכב של השיעור.",
      "כשנתקלים במילה קשה, התלמידים עצמם מבקשים: \"המורה, תעלי את הפירוש ב-Gadit!\"",
      "הילדים כבר לא מתביישים לשאול כשמילה לא ברורה, כי הם יודעים שנמצא את התשובה יחד.",
      "ההגדרות כתובות בגובה העיניים, והתמונות והדוגמאות מבהירות את המילה מיד.",
      "כל שבוע אנחנו עושים הכתבה על המילים שלמדנו, ואמא של תלמידה סיפרה לי שהופתעה שהבת שלה יודעת מה פירוש המילה \"שאון\".",
    ].join("\n"),
    who: "רעות ארבל, מורה",
  },
];
