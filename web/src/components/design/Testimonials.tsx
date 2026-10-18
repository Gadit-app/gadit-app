import Image from "next/image";
/**
 * Real words from real families and teachers (Gadi 2026-10-12: Reut Arbel,
 * a teacher and a mother of three, and Ziv, grade 5). Shortened from what
 * they sent, one sentence per line. Hebrew landing pages only for now.
 * A child is named by first name and grade only.
 */
export type Testimonial = { quote: string; who: string; photo?: string };

/** Name line with the person's round photo (Gadi 2026-10-18: real faces make
 *  the words feel real). Photos live in /public/testimonials, 192px webp. */
function Who({ t }: { t: Testimonial }) {
  return (
    <figcaption className="gt-quote-who">
      {t.photo && <Image src={t.photo} alt="" width={52} height={52} unoptimized className="gt-quote-photo" />}
      <span>{t.who}</span>
    </figcaption>
  );
}

/** One testimonial between two sections (Gadi 2026-10-18): the words sit
 *  next to the topic they talk about instead of only at the bottom. */
export function InlineTestimonial({ item }: { item: Testimonial }) {
  return (
    <figure className="gt-quote gt-quote-inline">
      <blockquote>
        {item.quote.split("\n").map((line, i) => <p key={i}>{line}</p>)}
      </blockquote>
      <Who t={item} />
    </figure>
  );
}

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
            <Who t={t} />
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Amir Levi, father of Tom and Ori (2026-10-18). Lightly edited: one
 *  sentence per line, the brand in Latin letters. */
export const AMIR_LEVI_HE: Testimonial = {
  quote: [
    "אפליקציית Gadit נותנת לנו כמשפחה, מענה לצורך אמיתי וחשוב, במיוחד עבור הילדים.",
    "היא כוללת הגדרות מילוניות מקיפות עם דוגמאות, והכל בצורה נגישה וקלה להבנה.",
    "הילדים יכולים ללמוד באופן עצמאי יותר, להבין מילים חדשות ולהעשיר את אוצר המילים שלהם.",
    "ממליץ בחום על האפליקציה, לכל המשפחה!",
  ].join("\n"),
  who: "אמיר לוי, אבא של תום ואורי",
  photo: "/testimonials/amir-levi.webp",
};

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
    photo: "/testimonials/reut-arbel.webp",
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
    photo: "/testimonials/gat-megido.webp",
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
    photo: "/testimonials/ziv.webp",
  },
  {
    quote: [
      "Gadit פשוט מעולה!",
      "הוא ממש עוזר לי ללמוד טוב יותר ולהבין את מה שאני קוראת.",
      "ממליצה מאוד!",
    ].join("\n"),
    who: "תום, בת 15",
  },
  {
    // Romi, 12, sent through her father (2026-10-17). Lightly edited: the
    // brand in Latin letters, one sentence per line, no dashes.
    quote: [
      "Gadit מאוד עוזרת לי בלימודים!",
      "בעבר, כל פעם שנתקלתי במילה חדשה, הרגשתי שאני צריכה להיסחב עם מיליון ספרים ומילונים רק כדי להבין את הפירוש והמקור שלה.",
      "היום אני פשוט לוקחת את הטלפון או הטאבלט, מקלידה את המילה בצ'יק צ'אק, והיא מיד מופיעה.",
      "אחד הדברים שאני הכי אוהבת זה מצב הילדים.",
      "אתמול, למשל, נתקלתי במילה לא מובנת שתיארה סוג של ז'קט, ומיד קיבלתי תמונה של הז'קט לצד כל ההגדרות!",
      "אם אני קוראת משהו בטלפון ורואה מילים קשות, אני ישר פותחת את Gadit ובודקת.",
      "אני כל כך שמחה שיש את Gadit, מילון אמיתי, חכם ונוח שבאמת עוזר לי בחיים.",
    ].join("\n"),
    who: "רומי, בת 12",
    photo: "/testimonials/romi.webp",
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
