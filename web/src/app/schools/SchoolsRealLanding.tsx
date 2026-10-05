"use client";

import Image from "next/image";
import Link from "next/link";
import { Lines } from "../families/RealScreens";
import { SchoolOrderForm } from "./SchoolOrderForm";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

/**
 * The new Hebrew Schools landing (Gadi 2026-10-05), built like the Families
 * real-screens page: every claim is shown on the actual Gadit screen, captured
 * from a seeded demo school (fictional, never a real school). The buyer is a
 * principal; the one action is the order form at #order (₪ annual, tax
 * invoice). Screens live in public/sch/screens/he/{name}.webp: desktop shots
 * at 16:10 (projector, catalog, dashboards) and phone shots at 390x844.
 */

type Step = { t: string; b: string; img: string; phone?: boolean };
type Tool = { kicker: string; title: string; body: string; points: string[]; img: string; phone?: boolean };

const C = {
  topCta: "להזמנה לבית הספר",
  credPill: "לפי תוכניות הלימודים, מגן ועד י״ב",
  h1: "כל תלמיד מבין את השיעור.",
  whatIs: "המילים החשובות של כל יחידת לימוד, מוכנות להקרנה בכיתה. וכל תלמיד מקבל הסבר לכל מילה קשה, גם בשפה שלו.",
  heroCta: "להזמנה לבית הספר",
  howCta: "איך זה עובד",
  heroPoints: ["114 מקצועות, 1,626 יחידות לימוד", "בלי חשבונות לתלמידים", "גם לחינוך הערבי"],
  shotAlt: "מסך אמיתי מתוך Gadit",
  pain: {
    title: "למה תלמיד שיודע את החומר נכשל במבחן?",
    lead: "הוא לא הבין מילה אחת, וכל השאלה נשענה עליה.",
    paras: [
      "בכל שיעור יש כמה מילים שכל השיעור בנוי עליהן: פוטוסינתזה, ריבונות, מכנה משותף.",
      "תלמיד שלא הבין אחת מהן לא מרים יד. הוא מנחש וממשיך, והפער גדל משיעור לשיעור.",
      "והמורה מסבירה את אותה מילה שוב ושוב, ועדיין לא יודעת מי באמת הבין.",
    ],
    strong: "הבעיה היא לא החומר. חסרות המילים.",
    reframe: "Gadit נותן לכל כיתה את המילים של השיעור, ולכל תלמיד הסבר לכל מילה ברגע שהוא צריך אותו.",
  },
  howKicker: "איך זה עובד",
  howTitle: "ארבעה צעדים, מיחידת הלימוד ועד ההבנה",
  steps: [
    { t: "בוחרים מקצוע ויחידת לימוד", b: "כל המקצועות מגן ועד י״ב, בחינוך הממלכתי ובממלכתי דתי. בכל יחידה 10 עד 12 מילות מפתח, עם הגדרה שמתאימה בדיוק לשיעור.", img: "sets" },
    { t: "מקרינים את המילים בכיתה", b: "כל מילה על המסך הגדול, עם תמונה, הגדרה ודוגמאות. בכיתות הנמוכות אפשר להציג עם ניקוד.", img: "stage" },
    { t: "חידון ומשחק לכל הכיתה", b: "הכיתה עונה יחד על חידון ומשחק שנבנים מהמילים של היחידה. ככה רואים מיד אם המילים נקלטו.", img: "quiz" },
    { t: "כל תלמיד ממשיך מהמכשיר שלו", b: "התלמיד נכנס עם קוד הכיתה ובוחר את השם שלו, בלי סיסמה ובלי חשבון. כל מילה שהוא מחפש מוסברת לו במילים פשוטות ועם תמונה.", img: "join", phone: true },
  ] as Step[],
  tools: [
    {
      kicker: "בשפה של התלמיד",
      title: "תלמיד שחושב ברוסית, באמהרית או בערבית מבין את השיעור",
      body: "הוא קורא את החומר בעברית, אבל עדיין חושב בשפת הבית. ב-Gadit הוא מחפש את המילה ומקבל הסבר מלא בשפה שלו, ואז ממשיך בשיעור עם כל הכיתה.",
      points: ["הסבר מלא, לא מילה מתורגמת", "המילה בעברית נשארת במרכז", "עולים חדשים וכל תלמיד שמתקשה בשפה"],
      img: "student-lang",
      phone: true,
    },
    {
      kicker: "מילון הכיתה",
      title: "הכיתה בונה מילון משלה",
      body: "כל מילה שתלמיד מחפש נכנסת למילון של הכיתה. כשהמילון מגיע ליעד חדש, כל הכיתה חוגגת על המסך.",
      points: ["כל המילים שהכיתה חיפשה במקום אחד", "דרגות ויעדים לכיתה כולה", "מוטיבציה בלי תחרות בין תלמידים"],
      img: "dictionary",
    },
    {
      kicker: "להנהלה ולצוות",
      title: "רואים מה כל כיתה לא הבינה",
      body: "בלוח של בית הספר רואים כמה מילים כל כיתה למדה, אילו מילים חיפשו הכי הרבה השבוע, ואיפה אותה מילה חוזרת שוב ושוב. ככה יודעים מה כדאי ללמד מחדש.",
      points: ["כל הכיתות במסך אחד", "המילים שהכי קשות לכל כיתה", "חיפוש חוזר מסמן מילה שלא הובנה"],
      img: "overview",
    },
    {
      kicker: "החינוך הערבי",
      title: "אותו כלי, בתוכניות הלימודים של החינוך הערבי",
      body: "52 מקצועות ו-1,410 יחידות לימוד לפי תוכניות הלימודים של החינוך הערבי. ממשק בערבית, מילים בערבית תקנית, ואפשרות להציג עם תשכיל.",
      points: ["ממשק מלא בערבית", "תשכיל לכיתות הנמוכות", "עברית ואנגלית כשפה נוספת"],
      img: "ar-stage",
    },
  ] as Tool[],
  safeKicker: "פרטיות ובטיחות",
  safeTitle: "בטוח לבית הספר מהיום הראשון",
  safe: [
    "בלי חשבונות לתלמידים: בלי מייל, בלי סיסמה ובלי תעודת זהות.",
    "החיפושים מתויגים רק לפי שם פרטי מרשימת הכיתה.",
    "קוד הכיתה פעיל בשעות הלימודים.",
    "בלי פרסומות ובלי תוכן שלא מתאים לילדים.",
    "בלי התקנה ובלי צוות מחשוב. עובד בכל דפדפן.",
  ],
  priceKicker: "מחירים",
  priceTitle: "מחיר לפי גודל בית הספר",
  priceSub: "ממלאים טופס קצר, ואנחנו פותחים את בית הספר ושולחים חשבונית מס. תשלום שנתי בהעברה בנקאית או בהזמנת רכש.",
  perMonth: "לחודש",
  orYearly: "או",
  perYear: "לשנה",
  plusVat: "+ מע״מ",
  tiers: [
    { label: "עד 100 תלמידים", monthly: 349, yearly: 3490 },
    { label: "101 עד 500 תלמידים", monthly: 649, yearly: 6490 },
    { label: "501 עד 1,000 תלמידים", monthly: 949, yearly: 9490 },
  ],
  includesTitle: "בכל התוכניות",
  includes: [
    "כל תוכנית הלימודים, מגן ועד י״ב",
    "מסך מקרן, חידון ומשחק לכיתה",
    "כיתות ללא הגבלה",
    "מילון כיתה, דרגות ויעדים",
    "לוח בית ספר ולוח מורה",
    "הסבר בשפת הבית של התלמיד",
  ],
  larger: "יותר מ-1,000 תלמידים או רשת בתי ספר? נשמח להכין הצעה מותאמת.",
  orderTitle: "להזמנה לבית הספר",
  orderSub: "משאירים פרטים, ואנחנו חוזרים אליך עם פתיחת בית הספר וחשבונית מס.",
  faqKicker: "שאלות נפוצות",
  faqTitle: "מה מנהלים שואלים לפני שמזמינים",
  faq: [
    { q: "המילים מתאימות למה שהמורה מלמדת?", a: "כן. כל יחידה נבנתה לפי תוכנית הלימודים של המקצוע והשכבה, עם הגדרה שמתאימה להקשר של השיעור. אותה מילה מקבלת משמעות אחרת במדעים ובהיסטוריה, ו-Gadit מגדיר אותה לפי השיעור." },
    { q: "אם אין התחברות, איך יודעים איזה תלמיד חיפש מה?", a: "המורה מכינה מראש רשימה של שמות פרטיים. התלמיד נכנס עם קוד הכיתה ובוחר את השם שלו בלחיצה אחת. כל חיפוש מתויג לאותו שם, בלי מייל, בלי סיסמה ובלי מידע אישי." },
    { q: "צריך להתקין משהו?", a: "לא. Gadit עובד בכל דפדפן, על מחשב הכיתה, על מקרן או על הטלפון של התלמיד. אין צורך בצוות מחשוב." },
    { q: "זה תרגום?", a: "לא. Gadit מסביר מילים. לכל מילה הוא נותן את המשמעות שמתאימה לשיעור, דוגמאות, תמונה ומקור המילה. תלמיד שעוד לא שולט בעברית מקבל את אותו הסבר בשפה שלו, והמילה בעברית נשארת במרכז." },
    { q: "זה עובד גם מחוץ לשעות הלימודים?", a: "קוד הכיתה פעיל בשעות הלימודים (ברירת המחדל: א׳ עד ה׳, 7:30 עד 15:00, ואפשר לשנות). מחוץ לשעות האלה הקוד נותן מילון בסיסי בלבד." },
    { q: "איך משלמים?", a: "תשלום שנתי בהעברה בנקאית או בהזמנת רכש, מול חשבונית מס. אין צורך במכרז." },
  ],
  finalTitle: "בשיעור הבא, כל תלמיד יכול להבין כל מילה.",
  finalBody: "ההקמה לוקחת כמה דקות. בלי התקנה, בלי צוות מחשוב ובלי טפסי הורים.",
  finalCta: "להזמנה לבית הספר",
};

function Shot({ name, phone, priority = false }: { name: string; phone?: boolean; priority?: boolean }) {
  if (phone) {
    return (
      <div className="sch-phone">
        <div className="sch-phone-screen">
          <Image src={`/sch/screens/he/${name}.webp`} alt={C.shotAlt} width={780} height={1688} sizes="(max-width: 760px) 62vw, 270px" priority={priority} />
        </div>
      </div>
    );
  }
  return (
    <div className="sch-laptop">
      <div className="sch-laptop-screen">
        <Image src={`/sch/screens/he/${name}.webp`} alt={C.shotAlt} width={1600} height={1000} sizes="(max-width: 760px) 92vw, 620px" priority={priority} />
      </div>
      <div className="sch-laptop-base" aria-hidden />
    </div>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#0EA5A5" opacity="0.14" />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="#0b7d7d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SchoolsRealLanding() {
  const href = useHref();
  const toOrder = (where: string) => {
    track("schools_order_click", { where, page: "schools-real" });
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="sch" dir="rtl" lang="he">
      <style>{CSS}</style>
      <header className="sch-top">
        <Link href={href("/")} className="sch-logo" aria-label="Gadit" dir="ltr" translate="no">
          Gad<span>it</span>
        </Link>
        <div className="sch-top-end">
          <button type="button" className="sch-top-cta" onClick={() => toOrder("top")}>{C.topCta}</button>
          <div className="sch-top-lang"><LangSwitcher variant="muted" /></div>
        </div>
      </header>

      <main>
        <section className="sch-hero">
          <div className="sch-hero-grid">
            <div className="sch-hero-text">
              <div className="sch-pill">
                <span className="sch-pill-dots" aria-hidden><i style={{ background: "#0EA5A5" }} /><i style={{ background: "#D9A21B" }} /><i style={{ background: "#7C3AED" }} /></span>
                {C.credPill}
              </div>
              <h1 className="sch-h1">{C.h1}</h1>
              <p className="sch-whatis"><Lines text={C.whatIs} /></p>
              <div className="sch-ctas">
                <button type="button" className="sch-cta" onClick={() => toOrder("hero")}>{C.heroCta}</button>
                <a href="#how" className="sch-ghost">{C.howCta}</a>
              </div>
              <ul className="sch-points">
                {C.heroPoints.map((p) => <li key={p}><Check />{p}</li>)}
              </ul>
            </div>
            <div className="sch-hero-visual">
              <Shot name="stage" priority />
              <div className="sch-hero-phone"><Shot name="student" phone priority /></div>
            </div>
          </div>
        </section>

        <section className="sch-band sch-white">
          <div className="sch-narrow">
            <h2 className="sch-h2 sch-center">{C.pain.title}</h2>
            <p className="sch-lead sch-center">{C.pain.lead}</p>
            {C.pain.paras.map((p, i) => <p key={i} className="sch-body"><Lines text={p} /></p>)}
            <p className="sch-strong"><Lines text={C.pain.strong} /></p>
            <p className="sch-reframe"><Lines text={C.pain.reframe} /></p>
          </div>
        </section>

        <section className="sch-band sch-tint" id="how">
          <div className="sch-kicker">{C.howKicker}</div>
          <h2 className="sch-h2 sch-center">{C.howTitle}</h2>
          <div className="sch-steps">
            {C.steps.map((s, i) => (
              <div key={s.img} className={`sch-step${s.phone ? " is-phone" : ""}`}>
                <div className="sch-step-text">
                  <span className="sch-num">{i + 1}</span>
                  <h3 className="sch-h3">{s.t}</h3>
                  <p className="sch-body"><Lines text={s.b} /></p>
                </div>
                <Shot name={s.img} phone={s.phone} />
              </div>
            ))}
          </div>
        </section>

        {C.tools.map((t, i) => (
          <section key={t.img} className={`sch-band ${i % 2 ? "sch-tint" : "sch-white"}`}>
            <div className={`sch-feature${t.phone ? " is-phone" : ""}${i % 2 ? " is-flipped" : ""}`}>
              <div className="sch-feature-text">
                <div className="sch-kicker sch-start">{t.kicker}</div>
                <h2 className="sch-h2">{t.title}</h2>
                <p className="sch-body"><Lines text={t.body} /></p>
                <ul className="sch-list">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              <div className="sch-feature-visual"><Shot name={t.img} phone={t.phone} /></div>
            </div>
          </section>
        ))}

        <section className="sch-band sch-white">
          <div className="sch-narrow">
            <div className="sch-kicker">{C.safeKicker}</div>
            <h2 className="sch-h2 sch-center">{C.safeTitle}</h2>
            <ul className="sch-safe">{C.safe.map((p) => <li key={p}><Check /><span>{p}</span></li>)}</ul>
          </div>
        </section>

        <section className="sch-band sch-tint" id="pricing">
          <div className="sch-kicker">{C.priceKicker}</div>
          <h2 className="sch-h2 sch-center">{C.priceTitle}</h2>
          <p className="sch-body sch-center sch-narrow"><Lines text={C.priceSub} /></p>
          <div className="sch-tiers">
            {C.tiers.map((t) => (
              <div key={t.label} className="sch-tier">
                <div className="sch-tier-label">{t.label}</div>
                <div className="sch-tier-price"><span dir="ltr">₪{t.monthly.toLocaleString("en-US")}</span> <small>{C.perMonth}</small></div>
                <div className="sch-tier-year">{C.orYearly} <span dir="ltr">₪{t.yearly.toLocaleString("en-US")}</span> {C.perYear} {C.plusVat}</div>
              </div>
            ))}
          </div>
          <div className="sch-includes">
            <div className="sch-includes-title">{C.includesTitle}</div>
            <ul>{C.includes.map((p) => <li key={p}><Check />{p}</li>)}</ul>
          </div>
          <p className="sch-larger">{C.larger}</p>
        </section>

        <section className="sch-band sch-white" id="order">
          <div className="sch-order">
            <h2 className="sch-h2 sch-center">{C.orderTitle}</h2>
            <p className="sch-body sch-center">{C.orderSub}</p>
            <SchoolOrderForm />
          </div>
        </section>

        <section className="sch-band sch-tint">
          <div className="sch-narrow">
            <div className="sch-kicker">{C.faqKicker}</div>
            <h2 className="sch-h2 sch-center">{C.faqTitle}</h2>
            <div className="sch-faq">
              {C.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p><Lines text={f.a} /></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="sch-final">
          <h2 className="sch-h2 sch-center">{C.finalTitle}</h2>
          <p className="sch-body sch-center"><Lines text={C.finalBody} /></p>
          <button type="button" className="sch-cta" onClick={() => toOrder("final")}>{C.finalCta}</button>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.sch { --ink: #1E293B; --body: #475569; --teal: #0EA5A5; --teal-d: #0b7d7d; --tint: #F0F8F8;
  --card: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(16,40,60,0.06), 0 28px 60px -24px rgba(16,40,60,0.30);
  --soft: 0 0 0 1px rgba(15,72,68,0.04), 0 1px 2px rgba(15,72,68,0.05), 0 10px 28px -10px rgba(15,72,68,0.12);
  background: #fff; color: var(--ink); font-family: var(--font-rubik), 'Rubik', 'Heebo', system-ui, sans-serif; }
.sch-top { position: sticky; top: 0; z-index: 60; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 32px; background: rgba(255,255,255,0.86); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); border-bottom: 1px solid rgba(15,72,68,0.08); }
.sch-logo { font-family: var(--font-inter), 'Inter', system-ui, sans-serif; font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.03em; color: #0B0F19; text-decoration: none; }
.sch-logo span { color: var(--teal); font-style: italic; font-weight: 500; }
.sch-top-end { display: flex; align-items: center; gap: 10px; }
.sch-top-cta { background: var(--teal); color: #fff; border: 0; border-radius: 999px; padding: 10px 20px; font: inherit; font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 6px 16px rgba(14,165,165,0.28); }
.sch-top-lang { border: 1px solid rgba(31,41,55,0.14); border-radius: 999px; padding: 2px 6px; }

.sch-hero { background: radial-gradient(90% 70% at 85% 0%, rgba(14,165,165,0.10) 0%, rgba(14,165,165,0) 60%), linear-gradient(180deg, #EEF7F6 0%, #FFFFFF 70%); padding: 56px 24px 84px; }
.sch-hero-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; text-align: center; }
.sch-pill { display: inline-flex; align-items: center; gap: 10px; background: #fff; border-radius: 999px; padding: 7px 16px 7px 12px; font-weight: 700; font-size: 14px; color: #1f2937; box-shadow: var(--soft); margin-bottom: 18px; }
.sch-pill-dots { display: inline-flex; }
.sch-pill-dots i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; margin-inline-start: -5px; }
.sch-h1 { font-size: clamp(38px, 5vw, 60px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; margin: 0 0 20px; text-wrap: balance; }
.sch-whatis { font-size: 18px; line-height: 1.75; color: var(--body); margin: 0 auto 28px; max-width: 540px; }
.sch-ctas { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; }
.sch-cta { background: var(--teal); color: #fff; border: 0; font: inherit; font-weight: 800; font-size: 17px; padding: 15px 30px; border-radius: 14px; cursor: pointer; box-shadow: 0 12px 26px -8px rgba(14,165,165,0.55); transition: transform .16s ease, box-shadow .16s ease; }
.sch-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -8px rgba(14,165,165,0.6); }
.sch-ghost { background: #fff; color: var(--teal-d); border: 1.5px solid rgba(14,165,165,0.35); border-radius: 999px; padding: 13px 24px; font-weight: 700; font-size: 16px; text-decoration: none; box-shadow: var(--soft); }
.sch-points { list-style: none; padding: 0; margin: 20px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; justify-content: center; }
.sch-points li { display: inline-flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 600; color: #1f2937; }
.sch-hero-visual { position: relative; display: flex; justify-content: center; padding-bottom: 24px; }
.sch-hero-visual .sch-laptop { max-width: 640px; }
.sch-hero-phone { position: absolute; bottom: -10px; inset-inline-end: -8px; width: 34%; max-width: 190px; transform: rotate(-4deg); }
.sch-hero-phone .sch-phone { max-width: none; }
@media (min-width: 980px) {
  .sch-hero { min-height: calc(100svh - 62px); display: grid; align-content: center; padding: clamp(24px, 4vh, 48px) 32px clamp(32px, 6vh, 64px); }
  .sch-hero-grid { grid-template-columns: 0.9fr 1.1fr; gap: 48px; text-align: start; }
  .sch-whatis { margin-inline: 0; }
  .sch-ctas, .sch-points { justify-content: flex-start; }
  .sch-h1 { font-size: clamp(36px, min(4vw, 7.4vh), 60px); }
}

.sch-laptop { width: 100%; max-width: 620px; margin: 0 auto; }
.sch-laptop-screen { background: #0E1116; border-radius: 16px 16px 4px 4px; padding: 10px 10px 12px; box-shadow: 0 34px 70px -24px rgba(16,40,60,0.50), 0 10px 22px rgba(16,40,60,0.12); line-height: 0; }
.sch-laptop-screen img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; border-radius: 6px; display: block; }
.sch-laptop-base { height: 14px; margin: 0 -5%; background: linear-gradient(180deg, #D9DEE5 0%, #AEB6C1 100%); border-radius: 0 0 14px 14px; box-shadow: 0 10px 18px -8px rgba(16,40,60,0.35); }
.sch-phone { width: 100%; max-width: 270px; margin: 0 auto; background: #0E1116; border-radius: 36px; padding: 8px; box-shadow: 0 34px 70px -24px rgba(16,40,60,0.50), 0 10px 22px rgba(16,40,60,0.12); }
.sch-phone-screen { border-radius: 29px; overflow: hidden; line-height: 0; background: #F2F6F4; aspect-ratio: 390 / 844; }
.sch-phone-screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }

.sch-band { padding: clamp(64px, 10vh, 108px) 20px; }
.sch-white { background: #fff; }
.sch-tint { background: var(--tint); }
.sch-narrow { max-width: 720px; margin: 0 auto; }
.sch-center { text-align: center; }
.sch-kicker { text-align: center; font-weight: 800; font-size: 13px; letter-spacing: 0.08em; color: var(--teal-d); margin-bottom: 14px; }
.sch-kicker.sch-start { text-align: start; }
.sch-h2 { font-size: clamp(28px, 3.3vw, 42px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.18; margin: 0 0 20px; text-wrap: balance; }
.sch-h3 { font-size: 25px; font-weight: 800; margin: 0 0 10px; line-height: 1.3; text-wrap: balance; }
.sch-lead { font-size: 22px; font-weight: 700; margin: 0 0 26px; text-wrap: balance; }
.sch-body { font-size: 17.5px; line-height: 1.85; color: var(--body); margin: 0 0 14px; }
.sch-strong { font-size: 20px; font-weight: 800; color: var(--ink); margin: 26px 0 0; text-align: center; }
.sch-reframe { font-size: 23px; line-height: 1.5; font-weight: 700; color: var(--teal-d); margin: 26px 0 0; text-align: center; text-wrap: balance; }

.sch-steps { display: grid; gap: 30px; max-width: 1040px; margin: 40px auto 0; }
.sch-step { background: #fff; border-radius: 32px; padding: 40px 48px; box-shadow: var(--card); display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 36px; align-items: center; }
.sch-step.is-phone { grid-template-columns: 1.2fr 0.8fr; }
.sch-step .sch-phone { max-width: 250px; }
.sch-num { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: var(--teal); color: #fff; font-weight: 800; font-size: 16px; margin-bottom: 12px; }

.sch-feature { max-width: 1140px; margin: 0 auto; background: #fff; border-radius: 32px; padding: clamp(28px, 5vh, 56px) 56px; box-shadow: var(--card), 0 0 0 1px rgba(15,72,68,0.05); display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 52px; align-items: center; }
.sch-feature.is-phone { grid-template-columns: 1.2fr 0.8fr; }
.sch-feature.is-flipped .sch-feature-text { order: 2; }
.sch-list { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 12px; }
.sch-list li { display: flex; gap: 9px; align-items: flex-start; font-size: 16px; font-weight: 600; color: #1f2937; }
.sch-list li::before { content: ""; flex: none; width: 8px; height: 8px; margin-top: 9px; border-radius: 50%; background: var(--teal); }

.sch-safe { list-style: none; padding: 30px 34px; margin: 26px 0 0; display: grid; gap: 16px; background: #fff; border-radius: 28px; box-shadow: var(--card); }
.sch-safe li { display: flex; gap: 10px; align-items: flex-start; font-size: 17px; line-height: 1.6; font-weight: 600; }
.sch-safe svg { flex: none; margin-top: 4px; }

.sch-tiers { max-width: 980px; margin: 34px auto 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.sch-tier { background: #fff; border-radius: 26px; padding: 28px 24px; box-shadow: var(--card); text-align: center; }
.sch-tier-label { font-weight: 800; font-size: 16px; color: var(--teal-d); margin-bottom: 12px; }
.sch-tier-price { font-size: 40px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.sch-tier-price small { font-size: 15px; font-weight: 600; color: var(--body); }
.sch-tier-year { margin-top: 8px; font-size: 14px; color: var(--body); font-variant-numeric: tabular-nums; }
.sch-includes { max-width: 980px; margin: 22px auto 0; background: #fff; border-radius: 26px; padding: 26px 32px; box-shadow: var(--soft); }
.sch-includes-title { font-weight: 800; margin-bottom: 14px; }
.sch-includes ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 24px; }
.sch-includes li { display: flex; gap: 8px; align-items: center; font-weight: 600; font-size: 15.5px; }
.sch-larger { text-align: center; margin: 20px 0 0; color: var(--body); font-size: 15px; }
.sch-order { max-width: 720px; margin: 0 auto; }

.sch-faq { display: grid; gap: 12px; margin-top: 26px; }
.sch-faq details { background: #fff; border-radius: 20px; box-shadow: var(--soft); padding: 18px 22px; }
.sch-faq summary { cursor: pointer; font-weight: 800; font-size: 17px; list-style-position: inside; }
.sch-faq p { margin: 12px 0 0; font-size: 16px; line-height: 1.8; color: var(--body); }

.sch-final { background: linear-gradient(160deg, #E6F6F5 0%, #FFFFFF 75%); padding: clamp(64px, 10vh, 108px) 20px; display: grid; justify-items: center; gap: 6px; }

@media (max-width: 860px) {
  .sch-top { padding: 10px 14px; }
  .sch-top-cta { padding: 9px 14px; font-size: 13.5px; }
  .sch-hero { padding: 36px 16px 64px; }
  .sch-pill { font-size: 12.5px; }
  .sch-whatis { font-size: 16.5px; }
  .sch-step, .sch-step.is-phone { grid-template-columns: 1fr; padding: 28px 20px; border-radius: 26px; gap: 22px; }
  .sch-feature, .sch-feature.is-phone { grid-template-columns: 1fr; padding: 28px 20px; border-radius: 26px; gap: 26px; }
  .sch-feature.is-flipped .sch-feature-text { order: 0; }
  .sch-step .sch-phone, .sch-feature .sch-phone { max-width: 230px; }
  .sch-h3 { font-size: 22px; }
  .sch-reframe { font-size: 20px; }
  .sch-tiers { grid-template-columns: 1fr; }
  .sch-includes ul { grid-template-columns: 1fr; }
  .sch-safe { padding: 24px 20px; }
}
`;
