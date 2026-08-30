"use client";

/**
 * FamiliesV2Client — NON-LIVE preview of the redesigned Family landing.
 *
 * Design language ported from the approved light prototype: one light
 * ground, teal as the single action color, an eyebrow label system, big
 * clamp typography, soft-shadow cards, scroll reveal, sticky mobile CTA.
 * The COPY is the existing (good) Hebrew from the live /families page,
 * kept verbatim, plus two added feature sections for Say it and tap-any-
 * word. Each existing feature uses its real /public/fam screenshot; the
 * two new features use polished built-in mockups. Price sits at the very
 * end, after every feature. Hebrew-first for the preview; localization
 * comes once the design is locked. Lives only at /families-v2 — the live
 * /families page is untouched.
 */

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const CHECKOUT = "/checkout";

type Feat = { img?: string; mock?: "say" | "everyword"; kicker: string; title: string; body: string };

// Existing feature copy is verbatim from the live /families he block; the
// two `mock` entries (כל מילה, Say it) are the added copy Gadi asked for.
const FEATURES: Feat[] = [
  {
    img: "meanings", kicker: "כל המשמעויות", title: "מילה אחת. כל הפירושים. תמונה לכל אחד.",
    body: "למילה אחת יש הרבה פעמים כמה משמעויות שונות, ושם ילדים מתבלבלים. Gadit מציג את כולן במקום אחד, כל אחת עם שלוש דוגמאות אמיתיות ותמונה משלה, כי מוח של ילד זוכר תמונות הרבה יותר טוב ממילים.",
  },
  {
    img: "kids-mode", kicker: "מצב ילדים", title: "הסבר בגובה העיניים של הילד",
    body: "מתג אחד, וכל ההסברים עוברים לשפה שילד בן 8 באמת מבין. בלי מילים קשות שמסבירות מילים קשות, בלי הגדרות מעגליות. פשוט להבין.",
  },
  {
    mock: "everyword", kicker: "כל מילה", title: "לוחצים על כל מילה בתוך ההסבר",
    body: "גם מילה בתוך ההסבר לא מובנת לילד? לחיצה אחת פותחת אותה מיד, בלי לצאת מהעמוד. ההבנה לא נתקעת באמצע, וכל מילה מובילה בטבעיות למילה הבאה.",
  },
  {
    img: "context", kicker: "הבנת הקשר", title: "מדביקים משפט, מקבלים את הפירוש הנכון",
    body: "לרוב המילים יש יותר מפירוש אחד, ושם ילדים הולכים לאיבוד. מדביקים את המשפט מהספר או מדף העבודה, ו-Gadit מסמן בדיוק איזו משמעות מתאימה להקשר הזה.",
  },
  {
    mock: "say", kicker: "Say it", title: "לשמוע כל מילה, ולהגיד אותה בקול",
    body: "הילד שומע איך אומרים כל מילה, אומר אותה בעצמו, ומקבל משוב על ההגייה. ככה נוח לו לדבר ולא רק לקרוא, בלי בושה ובלי פחד לטעות.",
  },
  {
    img: "notebook", kicker: "מחברת אישית", title: "המילים לא בורחות",
    body: "כל מילה שהילד חיפש נשמרת במחברת האישית שלו, ותרגול קצר וחכם מחזיר אותה בדיוק כשהיא עומדת להישכח. ככה אוצר מילים באמת נבנה, מילה אחרי מילה.",
  },
  {
    img: "profiles", kicker: "פרופיל לכל ילד", title: "לכל ילד המרחב שלו",
    body: "לכל ילד במשפחה פרופיל נפרד: המחברת שלו, התרגול שלו וההיסטוריה שלו. מצב ילדים מתאים את ההסבר, פשוט וברור לקטנים ומלא יותר לגדולים, ואף אחד לא דורך לאף אחד על המילים.",
  },
  {
    img: "games", kicker: "משחקי מילים", title: "משחקי למידה על המילים של הילד",
    body: "חידונים ומשחקים קצרים שבנויים על המילים שהילד עצמו חיפש. כמה דקות של משחק, ואוצר המילים גדל בלי מאמץ.",
  },
  {
    img: "english", kicker: "אנגלית", title: "העוזר הכי טוב לשיעורי אנגלית",
    body: "הילד מקליד מילה באנגלית ומקבל הסבר פשוט בעברית, עם תמונה ודוגמאות. בלי לנדוד בין מילון, גוגל טרנסלייט ויוטיוב. שיעורי אנגלית מפסיקים להיות מלחמה.",
  },
];

const CHAIN_STEPS = [
  "הילד מקליד מילה שהוא לא מבין",
  "מקבל הסבר בגובה העיניים שלו, תמונה ושלוש דוגמאות",
  "המילה נשמרת במחברת האישית שלו",
  "וחוזרת בתרגול קצר, עד שהיא באמת שלו",
];

const STACK_ITEMS = [
  "חיפושים בלי הגבלה לכל המשפחה",
  "כל המשמעויות, עם תמונה לכל משמעות",
  "מצב ילדים לכל הגילאים",
  "בדיקת משפטים עם משוב מיידי",
  "מחברת אישית ותרגול חכם לכל ילד",
  "משחקי מילים וחידונים",
  "עד 5 ילדים בפרופילים נפרדים",
  "30+ שפות, כולל עברית מלאה ואנגלית",
];

const COMPARE_ROWS: Array<{ label: string; gadit: boolean }> = [
  { label: "עמוד אחד נקי לכל מילה", gadit: true },
  { label: "הסבר בגובה העיניים של הילד", gadit: true },
  { label: "תמונה לכל משמעות", gadit: true },
  { label: "מחברת ותרגול שנשארים", gadit: true },
  { label: "בלי פרסומות וקישורים לכל כיוון", gadit: true },
  { label: "בלי צ'אט פתוח בלי גבולות", gadit: true },
];

const DASH_KIDS = [
  { name: "מאיה", total: 63, week: 15, c: "#0EA5A5" },
  { name: "נועה", total: 47, week: 12, c: "#0891B2" },
  { name: "עידו", total: 31, week: 8, c: "#D97706" },
];

const FAQ: Array<[string, string]> = [
  ["מה אני מקבל ב-Gadit?", "כל מילה שהילד מחפש מקבלת עמוד אחד נקי: כל המשמעויות, הסבר בגובה העיניים של הילד (מצב ילדים), שלוש דוגמאות אמיתיות, ותמונה לכל משמעות. בנוסף, הבנת הקשר (מדביקים משפט ומקבלים את המשמעות הנכונה), מחברת מילים אישית עם תרגול חכם, משחקי מילים וחידונים, לוח בקרה להורה שמראה כמה כל ילד למד, עד 5 ילדים בפרופילים נפרדים, והכול ב-30+ שפות, במרחב סגור ובטוח, בלי צ'אט פתוח ובלי פרסומות."],
  ["למה לא פשוט לשאול צ'אט או גוגל?", "כי אלה כלים למבוגרים. חיפוש בגוגל מחזיר פרסומות וקישורים לכל כיוון, וצ'אט פתוח הוא שיחה בלי גבולות שאף הורה לא משאיר בה ילד לבד. Gadit בנוי הפוך: עמוד אחד סגור ונקי לכל מילה, בגובה העיניים של הילד, בלי שום דרך ללכת לאיבוד."],
  ["איך אני יודע שהילד באמת מתקדם?", "יש לכם לוח בקרה להורה. במבט אחד רואים כמה מילים כל ילד למד, כמה נוספו השבוע ואילו מילים אחרונות. כל כלי אחר עונה לילד ושוכח, ו-Gadit שומר כל מילה במחברת האישית של הילד, כך שאתם רואים את אוצר המילים גדל שבוע אחרי שבוע."],
  ["לאילו גילאים זה מתאים?", "הלב של Gadit הוא ילדים בגיל בית ספר, מכיתה א ועד תיכון. מצב ילדים מסביר בפשטות לקטנים, וההסברים המלאים משרתים גם בני נוער והורים. את החשבון פותח ההורה."],
  ["זה עוזר גם באנגלית ובשפות נוספות?", "מאוד. אפשר לחפש מילה באנגלית ולקבל הסבר בעברית פשוטה, עם תמונה ודוגמאות, בדיוק הכלי שחסר בבית לשיעורי אנגלית. וזה עובד ב-30+ שפות, כך שהילד יכול לקבל את ההסבר גם בשפה שמדברים אצלכם בבית."],
  ["המחיר באמת בשקלים?", "כן. החיוב בשקלים, בכרטיס ישראלי רגיל, בלי עמלות המרה ובלי הפתעות: ₪199 לשנה או ₪19.90 לחודש, אחרי 14 ימי הניסיון."],
  ["כמה ילדים אפשר לחבר?", "עד 5 ילדים במנוי משפחתי אחד, לכל ילד פרופיל, מחברת ותרגול משלו."],
  ["אפשר לנסות בלי להתחייב?", "כן. מתחילים 14 ימי ניסיון עם כרטיס, אבל החיוב הראשון יורד רק בתום הניסיון. מבטלים בכל רגע קודם, בלחיצה אחת, ולא תחויבו בכלום."],
];

function MockEveryWord() {
  return (
    <div className="gdx-mock">
      <div className="gdx-mock-bar"><span /><span /><span /></div>
      <div className="gdx-mock-body">
        <div className="gdx-mock-h">מה זה אומר?</div>
        <p className="gdx-mock-para">
          התהליך שבו צמח לוקח אור שמש, מים ו<span className="gdx-mock-hl">פחמן דו-חמצני</span>, והופך אותם למזון שלו.
        </p>
        <div className="gdx-pop">
          <div className="gdx-pop-w">פחמן דו-חמצני</div>
          <div className="gdx-pop-d">גז שנמצא באוויר. צמחים משתמשים בו כדי לייצר לעצמם מזון.</div>
        </div>
      </div>
    </div>
  );
}

function MockSay() {
  return (
    <div className="gdx-mock">
      <div className="gdx-mock-bar"><span /><span /><span /></div>
      <div className="gdx-mock-body">
        <div className="gdx-say-w" translate="no">Butterfly</div>
        <div className="gdx-say-row">
          <span className="gdx-say-btn" aria-hidden>▶</span>
          <span className="gdx-say-wave"><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <span className="gdx-say-lbl">כך אומרים</span>
        </div>
        <div className="gdx-say-practice">
          <span className="gdx-say-mic" aria-hidden>🎙️</span>
          <div>
            <div className="gdx-say-stars" aria-hidden>★★★★<span>★</span></div>
            <div className="gdx-say-heard">שמעתי: batterfly, כמעט מדויק</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamiliesV2Client({ withNav = false }: { withNav?: boolean }) {
  void withNav;
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".gdx .rv");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((x) => {
        if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="gdx">
      <style>{GDX_CSS}</style>

      <header className="gdx-head">
        <span className="gdx-logo" translate="no">Gad<i>it</i></span>
        <Link href={CHECKOUT} className="gdx-head-cta">להתחיל חינם</Link>
      </header>

      {/* HERO */}
      <section className="sec hero">
        <div className="wrap hero-grid">
          <div className="rv">
            <span className="eyebrow">מנוי משפחתי · עד 5 ילדים</span>
            <h1>די להיות המילון הפרטי של הבית.</h1>
            <p className="lead">מהיום, כשהילד שואל "מה זה אומר?", יש לו מקום אחד שבו הוא מוצא את התשובה לבד: כל המשמעויות, תמונה לכל משמעות, והסבר בגובה העיניים של הילד. בלי צ'אט פתוח ובלי פרסומות.</p>
            <div className="cta-wrap">
              <Link href={CHECKOUT} className="btn">מתחילים 14 ימי ניסיון חינם</Link>
              <div className="btn-sub">בלי צ'אט פתוח · בלי פרסומות · ביטול בלחיצה אחת</div>
            </div>
            <div className="chips">
              <span className="chip">30+ שפות ממשק</span>
              <span className="chip">תמונה לכל משמעות</span>
              <span className="chip">עד 5 ילדים</span>
            </div>
          </div>
          <div className="stage rv">
            <div className="shot shot-hero"><Image src="/fam/hero.webp" alt="" width={1200} height={900} sizes="(max-width:900px) 92vw, 460px" priority /></div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="sec surf">
        <div className="narrow rv">
          <span className="eyebrow">נקודת הכאב האמיתית</span>
          <h2 className="start">הילד קורא, אבל לא תמיד באמת מבין.</h2>
          <p className="para">אתם דווקא שמחים כשהילד עוצר ושואל מה זה מילה. הבעיה היא כל המילים שהוא לא עוצר לשאול עליהן. הוא מדלג עליהן, ממשיך לקרוא, והחומר לא נכנס. אוצר המילים נשאר דל, וההבנה נשברת מילה אחרי מילה.</p>
          <p className="para">וזה נוגע בהרבה יותר מציון. ילד שלא מבין מרגיש שהוא לא מספיק טוב, מתוסכל מהלימודים, ומאבד ביטחון. וזה קורה בשקט, בלי שאף אחד יודע להצביע איפה בדיוק נשבר החוט.</p>
          <p className="reframe">וזה בדיוק המקום שבו Gadit נכנס.</p>
        </div>
      </section>

      {/* PUZZLE */}
      <section className="sec">
        <div className="narrow center rv">
          <span className="eyebrow">מה קורה בראש של הילד</span>
          <h2>טקסט הוא פאזל. כל מילה היא חתיכה.</h2>
          <p className="para" style={{ textAlign: "center", marginInline: "auto", maxWidth: 640 }}>כשילד קורא, המוח שלו מרכיב תמונה שלמה מהמילים. כל מילה שהוא מבין היא חתיכה שנכנסת למקום. כל מילה שחסרה היא חור בתמונה. מספיק שלושה-ארבעה חורים, והילד כבר לא רואה את התמונה, גם אם הגה כל אות נכון.</p>
          <p className="reframe" style={{ textAlign: "center" }}>כשכל המילים ברורות, הילד רואה את התמונה השלמה.</p>
        </div>
      </section>

      {/* CHAIN / HOW */}
      <section className="sec surf">
        <div className="narrow rv">
          <div className="center" style={{ marginBottom: 26 }}>
            <span className="eyebrow">איך זה עובד</span>
            <h2>על כל מילה, הילד מקבל את כל זה.</h2>
          </div>
          <ol className="steps">
            {CHAIN_STEPS.map((s, i) => <li key={i}><span className="step-n">{i + 1}</span><span>{s}</span></li>)}
          </ol>
        </div>
      </section>

      {/* FEATURES, one section per feature */}
      {FEATURES.map((f, i) => (
        <section key={i} className={`sec ${i % 2 === 0 ? "" : "surf"}`}>
          <div className={`wrap feat ${i % 2 === 1 ? "flip" : ""} rv`}>
            <div className="feat-text">
              <span className="eyebrow">{f.kicker}</span>
              <h2 className="start">{f.title}</h2>
              <p className="feat-body">{f.body}</p>
            </div>
            <div className="feat-visual">
              {f.img ? (
                <div className="shot"><Image src={`/fam/${f.img}.webp`} alt="" width={1200} height={900} sizes="(max-width:900px) 92vw, 440px" /></div>
              ) : f.mock === "everyword" ? <MockEveryWord /> : <MockSay />}
            </div>
          </div>
        </section>
      ))}

      {/* PARENT DASHBOARD, the moat */}
      <section className="sec surf">
        <div className="wrap rv">
          <span className="eyebrow">לוח הבקרה להורה</span>
          <h2 className="start" style={{ marginBottom: 8 }}>אתם רואים בדיוק כמה כל ילד למד.</h2>
          <p className="lead" style={{ marginBottom: 26 }}>לכל ילד במשפחה מחברת מילים אישית שגדלה. בלוח הבקרה שלכם אתם רואים במבט אחד כמה מילים כל ילד למד, כמה נוספו השבוע, ואת ההתקדמות שבוע אחרי שבוע.</p>
          <div className="dash">
            {DASH_KIDS.map((k, i) => (
              <div className="drow" key={i}>
                <span className="kidname"><span className="dot" style={{ background: k.c }}>{k.name[0]}</span>{k.name}</span>
                <span className="kidnums"><b>{k.total}</b> מילים · <span className="wk">+{k.week} השבוע</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="sec">
        <div className="narrow rv">
          <span className="eyebrow">ההבדל</span>
          <h2 className="start" style={{ marginBottom: 22 }}>למה לא פשוט לחפש בגוגל או לשאול צ'אט?</h2>
          <table className="cmp">
            <thead><tr><th>&nbsp;</th><th className="brand" translate="no">Gadit</th><th>האינטרנט הפתוח</th></tr></thead>
            <tbody>
              {COMPARE_ROWS.map((r, i) => (
                <tr key={i}><td>{r.label}</td><td className="yes">✓</td><td className="no">לא</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SAFE */}
      <section className="sec surf">
        <div className="narrow rv">
          <span className="eyebrow">מרחב בטוח</span>
          <h2 className="start">אזור נפרד ונקי, לא שער לשום מקום אחר.</h2>
          <p className="para">Gadit הוא מקום סגור לגמרי: אין צ'אט פתוח, אין פיד, אין פרסומות ואין קישורים החוצה. הילד לא נשאב מכאן לטיקטוק או לאף אפליקציה אחרת. יש כאן דבר אחד לעשות: להבין מילה, ולחזור ללימודים.</p>
          <p className="reframe">מסך אחד שאפשר לתת לילד בראש שקט.</p>
        </div>
      </section>

      {/* STACK */}
      <section className="sec">
        <div className="narrow rv">
          <div className="center" style={{ marginBottom: 24 }}>
            <span className="eyebrow">מה מקבלים</span>
            <h2>הכול כלול במסלול המשפחתי.</h2>
          </div>
          <ul className="stack">
            {STACK_ITEMS.map((s, i) => <li key={i}><span className="stack-c">✓</span>{s}</li>)}
          </ul>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="sec surf">
        <div className="narrow rv">
          <div className="guard">
            <div className="gbadge" aria-hidden>✓</div>
            <div>
              <h3>המבחן שלכם: שבועיים</h3>
              <p>תנו לזה שבועיים בשימוש אמיתי, בחינם. אם עד יום ה-14 לא הצטברו במחברת של הילד לפחות 20 מילים חדשות, מבטלים בלחיצה אחת ולא שילמתם שקל.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="narrow rv">
          <div className="center" style={{ marginBottom: 24 }}><span className="eyebrow">שאלות של הורים</span><h2>מה שכדאי לדעת לפני שמתחילים.</h2></div>
          {FAQ.map(([q, a], i) => (
            <details key={i}><summary>{q}</summary><div className="a">{a}</div></details>
          ))}
        </div>
      </section>

      {/* PRICE, at the very end */}
      <section className="sec">
        <div className="wrap center rv" style={{ marginBottom: 26 }}>
          <span className="eyebrow">התמחור</span>
          <h2>עכשיו שראית הכול, מסלול המשפחה.</h2>
          <p className="lead" style={{ maxWidth: 560, marginInline: "auto" }}>פחות משיעור פרטי אחד, לשנה שלמה, לכל הילדים בבית.</p>
        </div>
        <div className="pricebox rv">
          <span className="trial">14 ימי ניסיון חינם</span>
          <div className="price">19.90<small> ₪ לחודש</small></div>
          <div className="pricenote">עד 5 ילדים, כל אחד עם פרופיל משלו. או ₪199 לשנה, פחות מ-17 ₪ לחודש לכל המשפחה, וחוסכים קרוב לחודשיים.</div>
          <Link href={CHECKOUT} className="btn">מתחילים את הניסיון</Link>
          <div className="btn-sub">החיוב בשקלים, רק בתום 14 הימים. מבטלים בלחיצה אחת מדף החשבון, מתי שרוצים.</div>
        </div>
      </section>

      {/* FINAL */}
      <section className="sec final band">
        <div className="narrow wrap rv">
          <span className="eyebrow">אפשר להתחיל היום</span>
          <h2>התחילו היום, וראו את אוצר המילים גדל.</h2>
          <p className="lead" style={{ marginBottom: 26 }}>שבועיים חינם. ביטול בלחיצה. והילד לומד להבין מילים לבד, ואוצר המילים שלו גדל.</p>
          <Link href={CHECKOUT} className="btn">מתחילים 14 ימי ניסיון חינם</Link>
        </div>
      </section>

      {/* STICKY MOBILE */}
      <div className="sticky">
        <div className="sp">19.90 ₪<span> / חודש · 14 יום חינם</span></div>
        <Link href={CHECKOUT} className="btn">להתחיל</Link>
      </div>
    </div>
  );
}

const GDX_CSS = `
.gdx{
  --bg:#F1F6F4; --surf:#FFFFFF; --band:#EEF4F2;
  --ink:#0B1220; --soft:#41474F; --muted:#6B7280;
  --teal:#0EA5A5; --teal-deep:#0B8A8A;
  --line:rgba(11,18,32,.10); --line2:rgba(11,18,32,.06); --r:16px;
  font-family:'Rubik','Heebo',system-ui,Arial,sans-serif;
  direction:rtl; text-align:right; line-height:1.62; font-size:18px;
  color:var(--soft); background:var(--bg); overflow-x:clip; min-height:100dvh;
}
.gdx *{box-sizing:border-box}
.gdx img{max-width:100%;display:block;height:auto}
.gdx a{text-decoration:none;color:inherit}
.gdx .sec{padding:clamp(46px,6vw,84px) 20px;position:relative}
.gdx .wrap{max-width:1120px;margin:0 auto}
.gdx .narrow{max-width:820px;margin:0 auto}
.gdx .surf{background:var(--surf)}
.gdx .band{background:var(--band)}
.gdx .center{text-align:center}
.gdx .center .eyebrow{justify-content:center}
.gdx .start{text-align:right}
.gdx .para{font-size:17px;line-height:1.72;color:var(--soft);margin-top:16px}
.gdx .reframe{font-size:clamp(19px,2.4vw,23px);font-weight:800;color:var(--teal-deep);margin-top:20px}

.gdx-head{display:flex;align-items:center;justify-content:space-between;max-width:1120px;margin:0 auto;padding:16px 20px}
.gdx-logo{font-weight:800;font-size:24px;color:var(--ink);letter-spacing:-.02em;direction:ltr}
.gdx-logo i{color:var(--teal);font-style:italic;font-weight:600}
.gdx-head-cta{border:1.6px solid var(--teal);color:var(--teal-deep);font-weight:700;font-size:14px;padding:8px 16px;border-radius:999px}

.gdx .eyebrow{color:var(--teal-deep);font-weight:700;font-size:14px;letter-spacing:.06em;margin-bottom:12px;display:inline-flex;align-items:center;gap:8px}
.gdx .eyebrow::before{content:"";width:22px;height:2px;background:var(--teal);border-radius:2px}
.gdx h1{color:var(--ink);font-weight:900;font-size:clamp(32px,6vw,58px);line-height:1.07;letter-spacing:-.02em;text-wrap:balance;margin:0}
.gdx h2{color:var(--ink);font-weight:800;font-size:clamp(25px,3.8vw,40px);line-height:1.14;letter-spacing:-.01em;text-wrap:balance;margin:0;text-align:center}
.gdx h2.start{text-align:right}
.gdx h3{color:var(--ink);font-weight:700;font-size:20px;line-height:1.25;margin:0 0 4px}
.gdx .lead{font-size:clamp(17px,2vw,20px);color:var(--soft);margin-top:16px}

.gdx .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--teal);color:#fff;font-weight:900;font-size:18px;border:none;border-radius:14px;padding:17px 38px;cursor:pointer;min-height:44px;box-shadow:0 10px 26px rgba(14,165,165,.30);transition:transform .16s ease,box-shadow .16s ease}
.gdx .btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(14,165,165,.40);background:var(--teal-deep)}
.gdx .cta-wrap{margin-top:26px}
.gdx .btn-sub{color:var(--muted);font-size:14px;margin-top:12px}

.gdx .hero{position:relative;overflow:clip}
.gdx .hero::before{content:"";position:absolute;inset:0;background:radial-gradient(56% 55% at 82% 4%,rgba(14,165,165,.14),transparent 60%),radial-gradient(50% 50% at 8% 96%,rgba(14,165,165,.08),transparent 62%)}
.gdx .hero .wrap{position:relative}
.gdx .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(28px,4vw,56px);align-items:center}
.gdx .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.gdx .chip{font-size:13.5px;color:var(--soft);background:var(--surf);border:1px solid var(--line);border-radius:999px;padding:7px 14px}

.gdx .shot{border-radius:20px;overflow:hidden;border:1px solid var(--line);box-shadow:0 26px 60px rgba(11,18,32,.14);line-height:0}
.gdx .shot-hero{max-width:460px;margin-inline:auto}

.gdx .feat{display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,56px);align-items:center}
.gdx .feat.flip .feat-text{order:2}
.gdx .feat.flip .feat-visual{order:1}
.gdx .feat-body{font-size:16.5px;line-height:1.7;color:var(--soft);margin-top:12px}
.gdx .feat-visual .shot,.gdx .feat-visual .gdx-mock{max-width:440px;margin-inline:auto}

.gdx .steps{list-style:none;margin:0;padding:0;display:grid;gap:12px;counter-reset:s}
.gdx .steps li{display:flex;align-items:center;gap:14px;background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:15px 18px;font-size:16.5px;color:var(--ink);font-weight:600;box-shadow:0 8px 20px rgba(11,18,32,.05)}
.gdx .step-n{flex:0 0 auto;width:30px;height:30px;border-radius:50%;background:rgba(14,165,165,.12);color:var(--teal-deep);font-weight:800;font-size:15px;display:grid;place-items:center}

.gdx .stack{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.gdx .stack{grid-template-columns:1fr}}
.gdx .stack li{display:flex;align-items:flex-start;gap:10px;background:var(--surf);border:1px solid var(--line);border-radius:12px;padding:13px 16px;font-size:15.5px;color:var(--ink);box-shadow:0 8px 20px rgba(11,18,32,.05)}
.gdx .stack-c{flex:0 0 auto;color:var(--teal-deep);font-weight:800}

.gdx .dash{background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:clamp(16px,3vw,26px);box-shadow:0 26px 60px rgba(11,18,32,.12)}
.gdx .drow{display:flex;align-items:center;justify-content:space-between;padding:15px 4px;border-bottom:1px solid var(--line2);gap:12px;flex-wrap:wrap}
.gdx .drow:last-child{border-bottom:none}
.gdx .kidname{display:flex;align-items:center;gap:10px;color:var(--ink);font-size:16px;font-weight:700}
.gdx .dot{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:14px;font-weight:800;color:#fff}
.gdx .kidnums{color:var(--soft);font-size:15px}
.gdx .kidnums b{color:var(--ink);font-size:19px;font-weight:800}
.gdx .kidnums .wk{color:var(--teal-deep);font-weight:700}

.gdx-mock{background:var(--surf);border:1px solid var(--line);border-radius:18px;box-shadow:0 26px 60px rgba(11,18,32,.14);overflow:hidden}
.gdx-mock-bar{display:flex;gap:6px;padding:12px 16px;border-bottom:1px solid var(--line2);background:#FAFCFB}
.gdx-mock-bar span{width:10px;height:10px;border-radius:50%;background:#D6DEE4}
.gdx-mock-body{padding:22px}
.gdx-mock-h{font-size:13px;font-weight:700;color:var(--teal-deep);margin-bottom:10px}
.gdx-mock-para{font-size:17px;line-height:1.75;color:var(--ink)}
.gdx-mock-hl{background:rgba(14,165,165,.16);border-bottom:2px solid var(--teal);border-radius:4px;padding:0 3px;font-weight:700}
.gdx-pop{margin-top:16px;background:#0B1220;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 16px 34px rgba(11,18,32,.25)}
.gdx-pop-w{font-weight:800;font-size:15px;margin-bottom:4px}
.gdx-pop-d{font-size:13.5px;color:#C2CCDB;line-height:1.5}
.gdx-say-w{font-weight:900;font-size:30px;color:var(--ink);letter-spacing:-.01em;direction:ltr;text-align:right}
.gdx-say-row{display:flex;align-items:center;gap:12px;margin:16px 0}
.gdx-say-btn{width:38px;height:38px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font-size:14px;flex:0 0 auto}
.gdx-say-wave{display:flex;align-items:center;gap:3px;flex:1}
.gdx-say-wave i{width:4px;border-radius:2px;background:rgba(14,165,165,.55);height:14px}
.gdx-say-wave i:nth-child(2){height:24px}.gdx-say-wave i:nth-child(3){height:32px}.gdx-say-wave i:nth-child(4){height:18px}.gdx-say-wave i:nth-child(5){height:28px}.gdx-say-wave i:nth-child(6){height:14px}.gdx-say-wave i:nth-child(7){height:22px}
.gdx-say-lbl{font-size:12.5px;color:var(--muted);font-weight:600;flex:0 0 auto}
.gdx-say-practice{display:flex;align-items:center;gap:12px;background:var(--band);border-radius:14px;padding:14px 16px;margin-top:6px}
.gdx-say-mic{font-size:22px}
.gdx-say-stars{color:var(--teal);font-size:18px;letter-spacing:2px}
.gdx-say-stars span{color:#D6DEE4}
.gdx-say-heard{font-size:13px;color:var(--muted);margin-top:3px}

.gdx .cmp{width:100%;border-collapse:collapse;background:var(--surf);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;box-shadow:0 12px 30px rgba(11,18,32,.06)}
.gdx .cmp th,.gdx .cmp td{padding:14px 16px;border-bottom:1px solid var(--line2);font-size:15.5px}
.gdx .cmp td:first-child{text-align:right;color:var(--soft)}
.gdx .cmp th,.gdx .cmp td:not(:first-child){text-align:center}
.gdx .cmp thead th{color:var(--ink);font-weight:800;font-size:14px}
.gdx .cmp th.brand{color:var(--teal-deep)}
.gdx .cmp .yes{color:var(--teal-deep);font-weight:800}
.gdx .cmp .no{color:var(--muted)}

.gdx .guard{display:flex;gap:18px;align-items:center;background:var(--surf);border:1px solid var(--line);border-radius:var(--r);padding:22px;box-shadow:0 12px 30px rgba(11,18,32,.06)}
.gdx .guard p{font-size:15.5px;color:var(--soft)}
.gdx .gbadge{flex:0 0 auto;width:56px;height:56px;border-radius:50%;background:rgba(14,165,165,.12);border:1px solid rgba(14,165,165,.3);display:grid;place-items:center;color:var(--teal-deep);font-size:24px;font-weight:800}

.gdx details{background:var(--surf);border:1px solid var(--line);border-radius:12px;margin-bottom:10px;overflow:hidden;box-shadow:0 8px 20px rgba(11,18,32,.05)}
.gdx summary{cursor:pointer;list-style:none;padding:17px 20px;color:var(--ink);font-weight:700;font-size:16.5px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.gdx summary::-webkit-details-marker{display:none}
.gdx summary::after{content:"+";color:var(--teal-deep);font-weight:800;font-size:22px}
.gdx details[open] summary::after{content:"\\2212"}
.gdx details .a{padding:0 20px 18px;color:var(--soft);font-size:15.5px;line-height:1.7}

.gdx .pricebox{background:linear-gradient(180deg,#fff,#F3F8F7);border:1px solid var(--line);border-radius:22px;padding:clamp(26px,4vw,40px);text-align:center;max-width:560px;margin:0 auto;box-shadow:0 26px 60px rgba(11,18,32,.12)}
.gdx .trial{display:inline-block;background:rgba(14,165,165,.10);border:1px solid rgba(14,165,165,.28);color:var(--teal-deep);font-weight:700;font-size:13.5px;border-radius:999px;padding:6px 16px;margin-bottom:18px}
.gdx .price{color:var(--teal);font-weight:900;font-size:clamp(52px,9vw,84px);line-height:1;letter-spacing:-.02em}
.gdx .price small{font-size:22px;font-weight:700;color:var(--soft)}
.gdx .pricenote{color:var(--muted);font-size:15px;margin:10px auto 22px;max-width:440px}

.gdx .final{text-align:center;position:relative;overflow:clip}
.gdx .final .wrap{position:relative}

.gdx .sticky{position:fixed;left:0;right:0;bottom:0;z-index:40;display:none;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-top:1px solid var(--line);padding:10px 14px;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 -8px 24px rgba(11,18,32,.08)}
.gdx .sticky .sp{color:var(--teal-deep);font-weight:900;font-size:19px}
.gdx .sticky .sp span{color:var(--muted);font-size:13px;font-weight:600}
.gdx .sticky .btn{padding:13px 22px;font-size:16px}

.gdx .rv{opacity:0;transform:translateY(38px) scale(.975);transition:opacity .72s cubic-bezier(.22,.7,.3,1),transform .72s cubic-bezier(.22,.7,.3,1)}
.gdx .rv.is-in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.gdx .rv{opacity:1;transform:none;transition:none}}

@media (max-width:900px){
  .gdx .hero-grid{grid-template-columns:1fr}
  .gdx .feat{grid-template-columns:1fr}
  .gdx .feat.flip .feat-text{order:1}
  .gdx .feat.flip .feat-visual{order:2}
  .gdx .sticky{display:flex}
  .gdx{padding-bottom:76px}
}
`;
