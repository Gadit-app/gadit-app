"use client";

import Image from "next/image";
import Link from "next/link";
import { Lines } from "../families/RealScreens";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { track } from "@/lib/track";
import { INDIVIDUAL_MONTHLY, INDIVIDUAL_YEARLY, INDIVIDUAL_DISPLAY } from "@/lib/individual-prices";

/**
 * The Hebrew Individuals landing (Gadi 2026-10-06), built like the Families
 * and Schools real-screens pages: every tool is shown on the actual Gadit
 * screen, captured from a demo Individual subscriber ("דנה"). The one action
 * is the 14-day Individual trial. Screens: public/ind/screens/he/{name}.webp
 * (phone, 780x1688).
 */

type Step = { t: string; b: string; img: string };
type Tool = { kicker: string; title: string; body: string; points: string[]; img: string; img2?: string };

const C = {
  topCta: "14 יום ניסיון חינם",
  credPill: "15 שנות ניסיון עם יותר מ-15,000 לומדים",
  h1: "להבין כל מילה עד הסוף.",
  whatIs: "מקלידים מילה בכל שפה, ומקבלים את כל המשמעויות שלה, דוגמאות, תמונה ומקור המילה. כל מילה נשמרת במחברת שלך, ו-Gadit עוזר לך לזכור אותה.",
  heroCta: "14 יום ניסיון חינם",
  howCta: "איך זה עובד",
  heroPoints: [`${INDIVIDUAL_DISPLAY.ilsMonthly} לחודש`, "33 שפות", "בלי פרסומות"],
  shotAlt: "מסך אמיתי מתוך Gadit",
  pain: {
    title: "מבינים את הרעיון, אבל מילה אחת עוצרת הכול",
    lead: "מילה שמבינים רק בערך, נשארת בערך.",
    paras: [
      "במאמר באנגלית, במכתב מהבנק, בשיעור או בפגישה. מילה אחת לא ברורה, ומשפט שלם מתפספס.",
      "מתרגם נותן מילה מקבילה. הוא לא מסביר מה המילה אומרת במשפט הזה, ולא עוזר לזכור אותה בפעם הבאה.",
    ],
    strong: "מה שחסר זה לא עוד תרגום. מה שחסר זה להבין.",
    reframe: "Gadit מסביר כל מילה עד הסוף, לפי המשפט שבו היא הופיעה, ושומר אותה בשבילך.",
  },
  howKicker: "איך זה עובד",
  howTitle: "ארבעה צעדים, ואוצר המילים שלך גדל",
  steps: [
    { t: "מחפשים מילה, בכל שפה", b: "כל המשמעויות של המילה, דוגמאות לכל משמעות, תמונה ומקור המילה. ההסבר תמיד בשפה שלך.", img: "word" },
    { t: "המשמעות הנכונה לפי המשפט", b: "כותבים את המשפט שבו המילה הופיעה, ו-Gadit בוחר את המשמעות שמתאימה בדיוק למשפט הזה.", img: "context" },
    { t: "כל מילה נשמרת במחברת שלך", b: "בלי ללחוץ על כלום. אוצר המילים שלך נבנה במקום אחד, ואפשר לחזור לכל מילה.", img: "notebook" },
    { t: "מתרגלים עד שהמילה נשארת", b: "תרגול חכם מחזיר כל מילה בזמן הנכון: מילה ששכחת חוזרת מהר, ומילה שידעת חוזרת בעוד כמה ימים.", img: "practice" },
  ] as Step[],
  tools: [
    {
      kicker: "כל מילה",
      title: "מצלמים דף, ומבינים כל מילה בו",
      body: "מאמר, חוזה, מכתב או פרק מספר. מצלמים או מדביקים את הטקסט, ולוחצים על כל מילה כדי לקבל את המשמעות שלה. אפשר גם להבין משפט שלם בלחיצה.",
      points: ["צילום דף ישר מהמצלמה", "לחיצה על כל מילה", "המילים החשובות בקטע, לפני שמתחילים לקרוא"],
      img: "read",
      img2: "read-word",
    },
    {
      kicker: "תגיד את זה",
      title: "לשמוע משפט, ואז להגיד אותו בעצמך",
      body: "כותבים משפט ובוחרים את השפה שלומדים. Gadit מראה איך אומרים אותו ומקריא אותו בקול. אחר כך אומרים אותו בעצמך, ומקבלים ציון על ההגייה.",
      points: ["הקראה בקול", "תרגול הגייה עם ציון", "בכל שפה שלומדים"],
      img: "say",
    },
    {
      kicker: "השוואת מילים",
      title: "שתי מילים דומות, וההבדל ביניהן",
      body: "affect או effect? אומנות או אמנות? כותבים שתי מילים, ומקבלים את ההבדל ביניהן, דוגמאות וטעות נפוצה.",
      points: ["ההבדל במשפט אחד", "דוגמאות לכל מילה", "הטעות שכולם עושים"],
      img: "compare",
    },
    {
      kicker: "משחקים וחידונים",
      title: "תרגול קצר מהמילים שלך",
      body: "חידונים, משחק זיכרון, ערבול אותיות והשלמת משפט. הכול נבנה מהמילים שחיפשת ונשמרו במחברת שלך.",
      points: ["כמה דקות ביום", "רק המילים שלך", "בלי פרסומות ובלי הסחות"],
      img: "play",
    },
  ] as Tool[],
  whoKicker: "בשביל מי",
  whoTitle: "לכל מי שקורא, לומד או עובד בשפה שעוד לומדים",
  who: [
    { t: "עולים חדשים", b: "מכתבים מהבנק, טפסים ומיילים מהעבודה. כל מילה בעברית מוסברת בשפה שלך." },
    { t: "סטודנטים ותלמידים", b: "מאמרים באנגלית ומושגים מקצועיים, עם המשמעות המדויקת לפי המשפט." },
    { t: "אנשי מקצוע", b: "חוזים, מסמכים ומיילים, בלי לנחש מה מילה אחת אומרת." },
    { t: "לומדי שפות", b: "מילים, ניבים והגייה, ומחברת שמחזירה כל מילה עד שהיא נשארת." },
  ],
  priceKicker: "מחיר",
  priceTitle: "Individual: כל הכלים, לאדם אחד",
  monthly: "לחודש",
  yearlyOr: "או",
  yearly: "לשנה",
  includes: [
    "חיפושים ללא הגבלה",
    "כל המשמעויות, דוגמאות, תמונה ומקור המילה",
    "המשמעות הנכונה לפי המשפט",
    "מחברת לכל המילים, ותרגול חכם",
    "כל מילה: מצלמים דף ולוחצים על כל מילה",
    "תגיד את זה: תרגול הגייה עם ציון",
    "חברו משפט וקבלו משוב",
    "משחקים, חידונים והשוואת מילים",
  ],
  priceCta: "14 יום ניסיון חינם",
  priceTerms: "14 יום ניסיון חינם, ואחריהם {price} לחודש. אפשר לבטל בכל רגע לפני תום הניסיון, בלחיצה אחת מעמוד החשבון, ולא יהיה שום חיוב.",
  familyNote: "יש ילדים בבית? Family עולה ₪19.90 לחודש, ומצרף עד 5 ילדים עם מצב ילדים ולוח הורה.",
  familyLink: "להכיר את Family",
  faqKicker: "שאלות נפוצות",
  faqTitle: "מה שואלים לפני שמתחילים",
  faq: [
    { q: "זה מתרגם?", a: "לא. Gadit מסביר מילים. לכל מילה הוא נותן את כל המשמעויות, דוגמאות, תמונה ומקור המילה, ובוחר את המשמעות שמתאימה למשפט. כשהמילה בשפה אחרת מופיעה גם מילה מקבילה, אבל העיקר הוא להבין אותה עד הסוף." },
    { q: "באילו שפות זה עובד?", a: "אפשר לחפש מילה בכל שפה. ההסבר נכתב בשפת הממשק שבחרת, ו-Gadit עובד ב-33 שפות." },
    { q: "אפשר להשתמש בחינם?", a: "כן. בחשבון חינמי יש 10 חיפושים ביום, ומחברת עד 30 מילים. Individual פותח חיפושים ללא הגבלה ואת כל הכלים." },
    { q: "איך מבטלים?", a: "בעמוד החשבון, בלחיצה על \"ניהול חיוב\". אם מבטלים לפני תום 14 ימי הניסיון, לא יהיה שום חיוב. יומיים לפני סוף הניסיון יגיע אליך מייל תזכורת עם התאריך והסכום." },
    { q: "מה ההבדל בין Individual ל-Family?", a: "Individual הוא לאדם אחד, עם כל הכלים. Family מתאים כשיש ילדים בבית: עד 5 ילדים וגם ההורה השני, לכל ילד אזור משלו, מצב ילדים, לוח הורה ותרגול הכתבה." },
  ],
  finalTitle: "המילה הבאה שתעצור אותך, כבר לא תעצור.",
  finalBody: "14 יום ניסיון חינם. ביטול בלחיצה אחת.",
  finalCta: "להתחיל עכשיו",
};

function Phone({ name, priority = false }: { name: string; priority?: boolean }) {
  return (
    <div className="ind-phone">
      <div className="ind-phone-screen">
        <Image src={`/ind/screens/he/${name}.webp`} alt={C.shotAlt} width={780} height={1688} sizes="(max-width: 760px) 62vw, 270px" priority={priority} />
      </div>
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

export function IndividualsRealLanding() {
  const href = useHref();
  const { promptLogin } = useAuth();
  const start = (where: string, yearly = false) => {
    track("individual_trial_click", { where, page: "individuals-real" });
    const priceId = yearly ? INDIVIDUAL_YEARLY : INDIVIDUAL_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: () => { window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`; } });
  };
  return (
    <div className="ind" dir="rtl" lang="he">
      <style>{CSS}</style>
      <header className="ind-top">
        <Link href={href("/")} className="ind-logo" aria-label="Gadit" dir="ltr" translate="no">Gad<span>it</span></Link>
        <div className="ind-top-end">
          <button type="button" className="ind-top-cta" onClick={() => start("top")}>{C.topCta}</button>
          <div className="ind-top-lang"><LangSwitcher variant="muted" /></div>
        </div>
      </header>

      <main>
        <section className="ind-hero">
          <div className="ind-hero-grid">
            <div className="ind-hero-text">
              <div className="ind-pill">
                <span className="ind-pill-dots" aria-hidden><i style={{ background: "#0EA5A5" }} /><i style={{ background: "#F59E0B" }} /><i style={{ background: "#7C3AED" }} /></span>
                {C.credPill}
              </div>
              <h1 className="ind-h1">{C.h1}</h1>
              <p className="ind-whatis"><Lines text={C.whatIs} /></p>
              <div className="ind-ctas">
                <button type="button" className="ind-cta" onClick={() => start("hero")}>{C.heroCta}</button>
                <a href="#how" className="ind-ghost">{C.howCta}</a>
              </div>
              <ul className="ind-points">{C.heroPoints.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            </div>
            <div className="ind-hero-visual">
              <Phone name="notebook" priority />
              <Phone name="word" priority />
            </div>
          </div>
        </section>

        <section className="ind-band ind-white">
          <div className="ind-narrow">
            <h2 className="ind-h2 ind-center">{C.pain.title}</h2>
            <p className="ind-lead ind-center">{C.pain.lead}</p>
            {C.pain.paras.map((p, i) => <p key={i} className="ind-body ind-center"><Lines text={p} /></p>)}
            <p className="ind-strong"><Lines text={C.pain.strong} /></p>
            <p className="ind-reframe"><Lines text={C.pain.reframe} /></p>
          </div>
        </section>

        <section className="ind-band ind-tint" id="how">
          <div className="ind-kicker">{C.howKicker}</div>
          <h2 className="ind-h2 ind-center">{C.howTitle}</h2>
          <div className="ind-steps">
            {C.steps.map((s, i) => (
              <div key={s.img} className="ind-step">
                <div className="ind-step-text">
                  <span className="ind-num">{i + 1}</span>
                  <h3 className="ind-h3">{s.t}</h3>
                  <p className="ind-body"><Lines text={s.b} /></p>
                </div>
                <Phone name={s.img} />
              </div>
            ))}
          </div>
        </section>

        {C.tools.map((t, i) => (
          <section key={t.img} className={`ind-band ${i % 2 ? "ind-tint" : "ind-white"}`}>
            <div className={`ind-feature${i % 2 ? " is-flipped" : ""}`}>
              <div className="ind-feature-text">
                <div className="ind-kicker ind-start">{t.kicker}</div>
                <h2 className="ind-h2">{t.title}</h2>
                <p className="ind-body"><Lines text={t.body} /></p>
                <ul className="ind-list">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              <div className={`ind-feature-visual${t.img2 ? " is-pair" : ""}`}>
                <Phone name={t.img} />
                {t.img2 && <Phone name={t.img2} />}
              </div>
            </div>
          </section>
        ))}

        <section className="ind-band ind-white">
          <div className="ind-kicker">{C.whoKicker}</div>
          <h2 className="ind-h2 ind-center">{C.whoTitle}</h2>
          <div className="ind-who">
            {C.who.map((w) => (
              <div key={w.t} className="ind-who-card">
                <h3 className="ind-who-t">{w.t}</h3>
                <p className="ind-who-b">{w.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ind-band ind-tint" id="price">
          <div className="ind-kicker">{C.priceKicker}</div>
          <h2 className="ind-h2 ind-center">{C.priceTitle}</h2>
          <div className="ind-price-card">
            <div className="ind-price-row">
              <span className="ind-price" dir="ltr">{INDIVIDUAL_DISPLAY.ilsMonthly}</span>
              <span className="ind-price-per">{C.monthly}</span>
            </div>
            <div className="ind-price-year">{C.yearlyOr} <span dir="ltr">{INDIVIDUAL_DISPLAY.ilsYearly}</span> {C.yearly}</div>
            <ul className="ind-includes">{C.includes.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            <button type="button" className="ind-cta ind-cta-wide" onClick={() => start("price")}>{C.priceCta}</button>
            <p className="ind-terms">{C.priceTerms.replace("{price}", INDIVIDUAL_DISPLAY.ilsMonthly)}</p>
          </div>
          <p className="ind-family-note">
            {C.familyNote} <Link href={href("/families")}>{C.familyLink}</Link>
          </p>
        </section>

        <section className="ind-band ind-white">
          <div className="ind-narrow">
            <div className="ind-kicker">{C.faqKicker}</div>
            <h2 className="ind-h2 ind-center">{C.faqTitle}</h2>
            <div className="ind-faq">
              {C.faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p><Lines text={f.a} /></p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ind-final">
          <h2 className="ind-h2 ind-center">{C.finalTitle}</h2>
          <p className="ind-body ind-center">{C.finalBody}</p>
          <button type="button" className="ind-cta" onClick={() => start("final")}>{C.finalCta}</button>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.ind { --ink: #1E293B; --body: #475569; --teal: #0EA5A5; --teal-d: #0b7d7d; --tint: #F0F8F8;
  --card: inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 4px rgba(16,40,60,0.06), 0 28px 60px -24px rgba(16,40,60,0.30);
  --soft: 0 0 0 1px rgba(15,72,68,0.04), 0 1px 2px rgba(15,72,68,0.05), 0 10px 28px -10px rgba(15,72,68,0.12);
  background: #fff; color: var(--ink); font-family: var(--font-rubik), 'Rubik', 'Heebo', system-ui, sans-serif; }
.ind-top { position: sticky; top: 0; z-index: 60; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 32px; background: rgba(255,255,255,0.86); backdrop-filter: saturate(160%) blur(12px); -webkit-backdrop-filter: saturate(160%) blur(12px); border-bottom: 1px solid rgba(15,72,68,0.08); }
.ind-logo { font-family: var(--font-inter), 'Inter', system-ui, sans-serif; font-weight: 600; font-size: 30px; line-height: 1; letter-spacing: -0.03em; color: #0B0F19; text-decoration: none; }
.ind-logo span { color: var(--teal); font-style: italic; font-weight: 500; }
.ind-top-end { display: flex; align-items: center; gap: 10px; }
.ind-top-cta { background: var(--teal); color: #fff; border: 0; border-radius: 999px; padding: 10px 20px; font: inherit; font-weight: 700; font-size: 14.5px; cursor: pointer; box-shadow: 0 6px 16px rgba(14,165,165,0.28); }
.ind-top-lang { border: 1px solid rgba(31,41,55,0.14); border-radius: 999px; padding: 2px 6px; }
.ind-hero { background: radial-gradient(90% 70% at 85% 0%, rgba(14,165,165,0.10) 0%, rgba(14,165,165,0) 60%), linear-gradient(180deg, #EEF7F6 0%, #FFFFFF 70%); padding: 56px 24px 84px; }
.ind-hero-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; text-align: center; }
.ind-pill { display: inline-flex; align-items: center; gap: 10px; background: #fff; border-radius: 999px; padding: 7px 16px 7px 12px; font-weight: 700; font-size: 14px; color: #1f2937; box-shadow: var(--soft); margin-bottom: 18px; }
.ind-pill-dots { display: inline-flex; }
.ind-pill-dots i { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; margin-inline-start: -5px; }
.ind-h1 { font-size: clamp(38px, 5vw, 62px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; margin: 0 0 20px; text-wrap: balance; }
.ind-whatis { font-size: 18px; line-height: 1.75; color: var(--body); margin: 0 auto 28px; max-width: 540px; }
.ind-ctas { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; }
.ind-cta { background: var(--teal); color: #fff; border: 0; font: inherit; font-weight: 800; font-size: 17px; padding: 15px 30px; border-radius: 14px; cursor: pointer; box-shadow: 0 12px 26px -8px rgba(14,165,165,0.55); transition: transform .16s ease; }
.ind-cta:hover { transform: translateY(-2px); }
.ind-cta-wide { width: 100%; margin-top: 18px; }
.ind-ghost { background: #fff; color: var(--teal-d); border: 1.5px solid rgba(14,165,165,0.35); border-radius: 999px; padding: 13px 24px; font-weight: 700; font-size: 16px; text-decoration: none; box-shadow: var(--soft); }
.ind-points { list-style: none; padding: 0; margin: 20px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; justify-content: center; }
.ind-points li { display: inline-flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 600; color: #1f2937; }
.ind-hero-visual { display: flex; justify-content: center; align-items: center; max-width: 560px; margin: 0 auto; padding: 18px 0 26px; }
.ind-hero-visual .ind-phone { max-width: 240px; flex: 1 1 0; }
.ind-hero-visual .ind-phone:first-child { transform: rotate(5deg) translateY(10px); z-index: 2; margin-inline-end: -36px; }
.ind-hero-visual .ind-phone:last-child { transform: rotate(-6deg) translateY(34px); z-index: 1; }
@media (min-width: 980px) {
  .ind-hero { min-height: calc(100svh - 62px); display: grid; align-content: center; padding: clamp(24px, 4vh, 48px) 32px clamp(32px, 6vh, 64px); }
  .ind-hero-grid { grid-template-columns: 1fr 1fr; gap: 48px; text-align: start; }
  .ind-whatis { margin-inline: 0; }
  .ind-ctas, .ind-points { justify-content: flex-start; }
  .ind-h1 { font-size: clamp(36px, min(4.2vw, 7.6vh), 62px); }
  .ind-hero-visual .ind-phone { max-width: min(240px, 30vh); }
}
.ind-phone { width: 100%; max-width: 270px; margin: 0 auto; background: #0E1116; border-radius: 36px; padding: 8px; box-shadow: 0 34px 70px -24px rgba(16,40,60,0.50), 0 10px 22px rgba(16,40,60,0.12); }
.ind-phone-screen { border-radius: 29px; overflow: hidden; line-height: 0; background: #F2F6F4; aspect-ratio: 390 / 844; }
.ind-phone-screen img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.ind-band { padding: clamp(64px, 10vh, 108px) 20px; }
.ind-white { background: #fff; }
.ind-tint { background: var(--tint); }
.ind-narrow { max-width: 720px; margin: 0 auto; }
.ind-center { text-align: center; }
.ind-kicker { text-align: center; font-weight: 800; font-size: 13px; letter-spacing: 0.08em; color: var(--teal-d); margin-bottom: 14px; }
.ind-kicker.ind-start { text-align: start; }
.ind-h2 { font-size: clamp(28px, 3.3vw, 42px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.18; margin: 0 0 20px; text-wrap: balance; }
.ind-h3 { font-size: 25px; font-weight: 800; margin: 0 0 10px; line-height: 1.3; text-wrap: balance; }
.ind-lead { font-size: 22px; font-weight: 700; margin: 0 0 26px; text-wrap: balance; }
.ind-body { font-size: 17.5px; line-height: 1.85; color: var(--body); margin: 0 0 14px; }
.ind-strong { font-size: 20px; font-weight: 800; color: var(--ink); margin: 26px 0 0; text-align: center; }
.ind-reframe { font-size: 23px; line-height: 1.5; font-weight: 700; color: var(--teal-d); margin: 26px 0 0; text-align: center; text-wrap: balance; }
.ind-steps { display: grid; gap: 30px; max-width: 940px; margin: 40px auto 0; }
.ind-step { background: #fff; border-radius: 32px; padding: 40px 52px; box-shadow: var(--card); display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 36px; align-items: center; }
.ind-step .ind-phone { max-width: 250px; }
.ind-num { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: var(--teal); color: #fff; font-weight: 800; font-size: 16px; margin-bottom: 12px; }
.ind-feature { max-width: 1060px; margin: 0 auto; background: #fff; border-radius: 32px; padding: clamp(28px, 5vh, 56px) 56px; box-shadow: var(--card), 0 0 0 1px rgba(15,72,68,0.05); display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 52px; align-items: center; }
.ind-feature.is-flipped .ind-feature-text { order: 2; }
.ind-feature-visual.is-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ind-feature-visual.is-pair .ind-phone { max-width: 220px; }
.ind-list { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 12px; }
.ind-list li { display: flex; gap: 9px; align-items: flex-start; font-size: 16px; font-weight: 600; color: #1f2937; }
.ind-list li::before { content: ""; flex: none; width: 8px; height: 8px; margin-top: 9px; border-radius: 50%; background: var(--teal); }
.ind-who { max-width: 1000px; margin: 32px auto 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.ind-who-card { background: var(--tint); border-radius: 22px; padding: 22px 20px; }
.ind-who-t { font-size: 18px; font-weight: 800; margin: 0 0 8px; }
.ind-who-b { font-size: 15px; line-height: 1.7; color: var(--body); margin: 0; }
.ind-price-card { max-width: 520px; margin: 30px auto 0; background: #fff; border-radius: 30px; padding: 32px 30px; box-shadow: var(--card); text-align: center; }
.ind-price-row { display: flex; justify-content: center; align-items: baseline; gap: 8px; }
.ind-price { font-size: 52px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ind-price-per { font-size: 17px; font-weight: 600; color: var(--body); }
.ind-price-year { margin-top: 6px; font-size: 15px; color: var(--body); }
.ind-includes { list-style: none; padding: 0; margin: 22px 0 0; display: grid; gap: 10px; text-align: start; }
.ind-includes li { display: flex; gap: 8px; align-items: center; font-weight: 600; font-size: 15.5px; }
.ind-terms { margin: 14px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--body); }
.ind-family-note { text-align: center; margin: 22px auto 0; max-width: 560px; font-size: 15px; color: var(--body); }
.ind-family-note a { color: #6D28D9; font-weight: 700; }
.ind-faq { display: grid; gap: 12px; margin-top: 26px; }
.ind-faq details { background: #fff; border-radius: 20px; box-shadow: var(--soft); padding: 18px 22px; }
.ind-faq summary { cursor: pointer; font-weight: 800; font-size: 17px; }
.ind-faq p { margin: 12px 0 0; font-size: 16px; line-height: 1.8; color: var(--body); }
.ind-final { background: linear-gradient(160deg, #E6F6F5 0%, #FFFFFF 75%); padding: clamp(64px, 10vh, 108px) 20px; display: grid; justify-items: center; gap: 6px; }
@media (max-width: 860px) {
  .ind-top { padding: 10px 14px; }
  .ind-top-cta { padding: 9px 14px; font-size: 13.5px; }
  .ind-hero { padding: 36px 16px 64px; }
  .ind-pill { font-size: 12px; white-space: nowrap; }
  .ind-whatis { font-size: 16.5px; }
  .ind-hero-visual .ind-phone { max-width: 190px; }
  .ind-step { grid-template-columns: 1fr; padding: 28px 20px; border-radius: 26px; gap: 22px; }
  .ind-feature { grid-template-columns: 1fr; padding: 28px 20px; border-radius: 26px; gap: 26px; }
  .ind-feature.is-flipped .ind-feature-text { order: 0; }
  .ind-step .ind-phone, .ind-feature .ind-phone { max-width: 230px; }
  .ind-feature-visual.is-pair .ind-phone { max-width: 170px; }
  .ind-h3 { font-size: 22px; }
  .ind-reframe { font-size: 20px; }
  .ind-who { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) { .ind-who { grid-template-columns: 1fr; } }
`;
