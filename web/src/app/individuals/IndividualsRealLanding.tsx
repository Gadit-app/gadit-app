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
 *
 * Revised per the 7-AI review + council verdict Gadi approved on 2026-10-08:
 * card and reminder line under the hero CTA, "who it's for" right after the
 * pain, the secondary tools in one block, a 5-line price list with the
 * yearly saving, a quiet free-account link next to the price, new FAQs.
 */

type Step = { t: string; b: string; img: string };
type Tool = { kicker: string; title: string; body: string; points: string[]; img: string; img2?: string };
type MiniTool = { kicker: string; title: string; body: string; img: string };

const C = {
  topCta: "ניסיון חינם",
  credPill: "הצוות של Gadit לימד יותר מ-15,000 לומדים ב-15 שנה",
  h1: "להבין כל מילה עד הסוף.",
  whatIs: "נתקעתם על מילה במכתב מהבנק, במאמר או בחוזה? תקבלו את כל המשמעויות, דוגמאות ומקור המילה, בהסבר בשפה שלכם. כל מילה נשמרת במחברת, ו-Gadit מחזיר אותה עד שהיא נשארת.",
  heroCta: "התחילו 14 ימי ניסיון חינם",
  ctaNote: "נדרש כרטיס אשראי, והחיוב הראשון רק בתום 14 הימים. יומיים לפני כן נשלח תזכורת במייל. ביטול בלחיצה, בלי טלפון.",
  howCta: "איך זה עובד",
  heroPoints: [`${INDIVIDUAL_DISPLAY.ilsMonthly} לחודש`, "הסבר ב-33 שפות", "בלי פרסומות"],
  shotAlt: "מסך אמיתי מתוך Gadit",
  pain: {
    title: "מבינים את הרעיון, אבל מילה אחת עוצרת הכול",
    lead: "מילה שמבינים רק בערך נשארת בערך.",
    paras: [
      "במאמר באנגלית, במכתב מהבנק, בשיעור או בפגישה, מילה אחת לא ברורה מפילה משפט שלם.",
      "מתרגם נותן מילה מקבילה. הוא לא מסביר מה המילה אומרת במשפט הזה, ולא עוזר לזכור אותה בפעם הבאה.",
    ],
    reframe: "Gadit מסביר כל מילה עד הסוף, מוצא את המשמעות שמתאימה למשפט, ושומר אותה בשבילכם.",
  },
  whoKicker: "בשביל מי",
  whoTitle: "קוראים, לומדים או עובדים בשפה שעוד לא שולטים בה?",
  who: [
    { t: "עולים חדשים", b: "מכתבים מהבנק, טפסים ומיילים מהעבודה. כל מילה בעברית מוסברת בשפה שלכם." },
    { t: "סטודנטים", b: "מאמרים באנגלית ומושגים מקצועיים, עם המשמעות המדויקת לפי המשפט." },
    { t: "אנשי מקצוע", b: "חוזים, מסמכים ומיילים, בלי לנחש מה מילה אחת אומרת." },
    { t: "לומדי שפות", b: "מילים, ניבים והגייה, ומחברת שמחזירה כל מילה עד שהיא נשארת." },
  ],
  howKicker: "איך זה עובד",
  howTitle: "ארבעה צעדים, ואוצר המילים שלכם גדל",
  steps: [
    { t: "חפשו מילה, בכל שפה", b: "כל המשמעויות של המילה, דוגמאות לכל משמעות, תמונה ומקור המילה. ההסבר תמיד בשפה שלכם.", img: "word" },
    { t: "המשמעות הנכונה לפי המשפט", b: "כתבו את המשפט שבו המילה הופיעה, ו-Gadit יבחר את המשמעות שמתאימה בדיוק למשפט הזה.", img: "context" },
    { t: "כל מילה נשמרת במחברת שלכם", b: "כל מילה שחיפשתם נשמרת מעצמה. אוצר המילים שלכם נבנה במקום אחד, ואפשר לחזור לכל מילה.", img: "notebook" },
    { t: "תרגלו עד שהמילה נשארת", b: "תרגול חכם מחזיר כל מילה בזמן הנכון: מילה ששכחתם חוזרת מהר, ומילה שידעתם חוזרת בעוד כמה ימים.", img: "practice" },
  ] as Step[],
  stepsCta: "התחילו 14 ימי ניסיון חינם",
  photo: {
    kicker: "צילום דף",
    title: "צלמו דף, והבינו כל מילה בו",
    body: "מאמר, חוזה, מכתב או פרק מספר. צלמו או הדביקו את הטקסט, ולחצו על כל מילה כדי לקבל את המשמעות שלה. אפשר גם להבין משפט שלם בלחיצה.",
    points: ["צילום דף ישר מהמצלמה", "לחיצה על כל מילה", "המילים החשובות בקטע, לפני שמתחילים לקרוא"],
    img: "read",
    img2: "read-word",
  } as Tool,
  moreKicker: "עוד כלים",
  moreTitle: "עוד כלים שעוזרים לזכור",
  more: [
    { kicker: "תגיד את זה", title: "שמעו משפט, ואמרו אותו בעצמכם", body: "Gadit מקריא את המשפט בקול, ואתם מקבלים ציון על ההגייה.", img: "say" },
    { kicker: "השוואת מילים", title: "שתי מילים דומות, וההבדל ביניהן", body: "ההבדל בין affect ל-effect, או בין אומנות לאמנות, עם דוגמאות והטעות הנפוצה.", img: "compare" },
    { kicker: "משחקים וחידונים", title: "תרגול קצר מהמילים שלכם", body: "חידונים ומשחקים שנבנים מהמילים שחיפשתם ושנשמרו במחברת שלכם.", img: "play" },
  ] as MiniTool[],
  priceKicker: "מחיר",
  priceTitle: "Individual: כל הכלים, לאדם אחד",
  monthly: "לחודש",
  yearlyLine: `או ${INDIVIDUAL_DISPLAY.ilsYearly} לשנה, חודשיים מתנה`,
  bothTrial: "בשני המסלולים 14 ימי ניסיון חינם.",
  includes: [
    "חיפושים ללא הגבלה, עם המשמעות לפי המשפט",
    "מחברת לכל המילים ותרגול חכם",
    "צילום דף ולחיצה על כל מילה",
    "תגיד את זה: תרגול הגייה עם ציון",
    "משחקים, חידונים והשוואת מילים",
  ],
  priceCta: "התחילו 14 ימי ניסיון חינם",
  priceTerms: "14 ימי ניסיון חינם, ואחריהם {price} לחודש.\nנדרש כרטיס אשראי, ויומיים לפני החיוב נשלח תזכורת במייל.\nמבטלים בכל רגע מעמוד החשבון, בלי לפנות לאף אחד.",
  freeLink: "עדיין לא רוצים להזין כרטיס? התחילו בחשבון חינמי, 10 חיפושים ביום.",
  familyNote: "יש ילדים בבית?\nFamily עולה ₪19.90 לחודש, ומצרף עד 5 ילדים וגם את ההורה השני, עם מצב ילדים ולוח הורה.",
  familyLink: "להכיר את Family",
  faqKicker: "שאלות נפוצות",
  faqTitle: "מה שואלים לפני שמתחילים",
  faq: [
    { q: "מה ההבדל בין Gadit למתרגם?", a: "Gadit מסביר מילים.\nלכל מילה הוא נותן את כל המשמעויות, דוגמאות, תמונה ומקור המילה, ובוחר את המשמעות שמתאימה למשפט.\nכשהמילה בשפה אחרת מופיעה גם מילה מקבילה, אבל העיקר הוא להבין אותה עד הסוף." },
    { q: "באילו שפות זה עובד?", a: "מחפשים מילה בכל שפה.\nההסבר נכתב באחת מ-33 שפות, ביניהן עברית, אנגלית, רוסית, ערבית, אמהרית, צרפתית וספרדית." },
    { q: "על אילו מכשירים זה עובד?", a: "בכל דפדפן, בטלפון ובמחשב, בלי התקנה.\nבאנדרואיד יש גם אפליקציה ב-Google Play." },
    { q: "מה קורה לדף שצילמתי?", a: "התמונה משמשת רק כדי לקרוא את הטקסט, ולא נשמרת אצלנו." },
    { q: "אפשר להשתמש בחינם?", a: "כן.\nבחשבון חינמי יש 10 חיפושים ביום, ומחברת עד 30 מילים.\nIndividual פותח חיפושים ללא הגבלה ואת כל הכלים." },
    { q: "מה קורה למילים אם לא ממשיכים?", a: "כל המילים שכבר שמרתם נשארות במחברת.\nבחשבון החינמי אפשר להמשיך לחפש 10 מילים ביום." },
    { q: "כמה זמן לוקחת ההרשמה?", a: "פחות מדקה, עם מייל או עם חשבון Google." },
    { q: "איך מבטלים?", a: "בעמוד החשבון, בלחיצה על \"ניהול חיוב\".\nאם מבטלים לפני תום 14 ימי הניסיון, לא יהיה שום חיוב.\nיומיים לפני סוף הניסיון יגיע אליכם מייל תזכורת עם התאריך והסכום." },
    { q: "מה ההבדל בין Individual ל-Family?", a: "Individual הוא לאדם אחד, עם כל הכלים.\nFamily מתאים כשיש ילדים בבית: עד 5 ילדים וגם ההורה השני, לכל ילד אזור משלו, מצב ילדים, לוח הורה ותרגול הכתבה." },
  ],
  finalTitle: "המילה הבאה כבר לא תעצור אתכם.",
  finalBody: "14 ימי ניסיון חינם.\nביטול בכל רגע, בלי טלפון.",
  finalCta: "התחילו 14 ימי ניסיון חינם",
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
    track("individual_trial_click", { where, page: "individuals-real", billing: yearly ? "yearly" : "monthly" });
    const priceId = yearly ? INDIVIDUAL_YEARLY : INDIVIDUAL_MONTHLY;
    const checkoutUrl = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
    promptLogin({ mode: "signup", resumeUrl: checkoutUrl, onSuccess: () => { window.location.href = checkoutUrl; } });
  };
  // The free account, offered only next to the price (council 2026-10-08).
  const startFree = () => {
    track("individual_free_click", { page: "individuals-real" });
    const home = href("/");
    promptLogin({ mode: "signup", resumeUrl: home, onSuccess: () => { window.location.href = home; } });
  };
  const t = C.photo;
  return (
    <div className="ind" dir="rtl" lang="he">
      <style>{CSS + CSS2}</style>
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
              <p className="ind-cta-note"><Lines text={C.ctaNote} /></p>
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
            <p className="ind-reframe"><Lines text={C.pain.reframe} /></p>
          </div>
        </section>

        <section className="ind-band ind-tint">
          <div className="ind-kicker">{C.whoKicker}</div>
          <h2 className="ind-h2 ind-center">{C.whoTitle}</h2>
          <div className="ind-who">
            {C.who.map((w) => (
              <div key={w.t} className="ind-who-card">
                <h3 className="ind-who-t">{w.t}</h3>
                <p className="ind-who-b"><Lines text={w.b} /></p>
              </div>
            ))}
          </div>
        </section>

        <section className="ind-band ind-white" id="how">
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
          <div className="ind-steps-cta">
            <button type="button" className="ind-cta" onClick={() => start("steps")}>{C.stepsCta}</button>
          </div>
        </section>

        <section className="ind-band ind-tint">
          <div className="ind-feature">
            <div className="ind-feature-text">
              <div className="ind-kicker ind-start">{t.kicker}</div>
              <h2 className="ind-h2">{t.title}</h2>
              <p className="ind-body"><Lines text={t.body} /></p>
              <ul className="ind-list">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <div className="ind-feature-visual is-pair">
              <Phone name={t.img} />
              {t.img2 && <Phone name={t.img2} />}
            </div>
          </div>
        </section>

        <section className="ind-band ind-white">
          <div className="ind-kicker">{C.moreKicker}</div>
          <h2 className="ind-h2 ind-center">{C.moreTitle}</h2>
          <div className="ind-more">
            {C.more.map((m) => (
              <div key={m.img} className="ind-more-card">
                <div className="ind-kicker ind-start">{m.kicker}</div>
                <h3 className="ind-h3">{m.title}</h3>
                <p className="ind-body"><Lines text={m.body} /></p>
                <Phone name={m.img} />
              </div>
            ))}
          </div>
        </section>

        <section className="ind-band ind-tint" id="price">
          <div className="ind-kicker">{C.priceKicker}</div>
          <h2 className="ind-h2 ind-center"><Lines text={C.priceTitle} /></h2>
          <div className="ind-price-card">
            <div className="ind-price-row">
              <span className="ind-price" dir="ltr">{INDIVIDUAL_DISPLAY.ilsMonthly}</span>
              <span className="ind-price-per">{C.monthly}</span>
            </div>
            <button type="button" className="ind-price-year ind-yearly-btn" onClick={() => start("price-yearly", true)}>{C.yearlyLine}</button>
            <div className="ind-both-trial">{C.bothTrial}</div>
            <ul className="ind-includes">{C.includes.map((p) => <li key={p}><Check />{p}</li>)}</ul>
            <button type="button" className="ind-cta ind-cta-wide" onClick={() => start("price")}>{C.priceCta}</button>
            <p className="ind-terms"><Lines text={C.priceTerms.replace("{price}", INDIVIDUAL_DISPLAY.ilsMonthly)} /></p>
          </div>
          <button type="button" className="ind-free-link" onClick={startFree}>{C.freeLink}</button>
          <p className="ind-family-note">
            <Lines text={C.familyNote} /><br /><Link href={href("/families")}>{C.familyLink}</Link>
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
          <p className="ind-body ind-center"><Lines text={C.finalBody} /></p>
          <button type="button" className="ind-cta" onClick={() => start("final")}>{C.finalCta}</button>
        </section>
      </main>
      {/* Legal links on a page that starts a trial / collects details (QA 2026-10-07). */}
      <footer style={{ textAlign: "center", padding: "26px 16px 34px", fontSize: 13.5, color: "#6B7A80" }}>
        <a href={href("/terms")} style={{ color: "inherit" }}>תנאי שימוש</a>
        <span style={{ margin: "0 10px" }}>·</span>
        <a href={href("/privacy")} style={{ color: "inherit" }}>מדיניות פרטיות</a>
        <span style={{ margin: "0 10px" }}>·</span>
        <span dir="ltr">© Gadit 2026</span>
      </footer>
    </div>
  );
}

const CSS2 = `
.ind-cta-note { margin: 12px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--body); max-width: 460px; }
.ind-steps-cta { text-align: center; margin-top: 40px; }
.ind-more { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; max-width: 1060px; margin: 34px auto 0; }
.ind-more-card { background: #fff; border-radius: 28px; padding: 26px 22px 30px; box-shadow: var(--card), 0 0 0 1px rgba(15,72,68,0.05); display: grid; gap: 6px; align-content: start; }
.ind-more-card .ind-phone { max-width: 210px; margin-top: 14px; }
.ind-yearly-btn { display: block; margin: 6px auto 0; background: none; border: 0; padding: 0; font: inherit; font-size: 15px; color: var(--teal-d); font-weight: 700; text-decoration: underline; cursor: pointer; }
.ind-both-trial { margin-top: 4px; font-size: 13.5px; color: var(--body); }
.ind-free-link { display: block; margin: 18px auto 0; background: none; border: 0; font: inherit; font-size: 14px; color: var(--body); text-decoration: underline; cursor: pointer; text-align: center; max-width: 520px; }
@media (max-width: 860px) {
  .ind-cta-note { margin-inline: auto; text-align: center; }
  .ind-more { grid-template-columns: 1fr; padding-inline: 16px; }
}
`;

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
/* The sticky header must not cover an anchor target, and its CTA stays on one
   line on narrow phones (QA 2026-10-07). */
#how { scroll-margin-top: 88px; }
@media (max-width: 400px) { .ind-top .ind-top-cta { white-space: nowrap; padding: 8px 11px; font-size: 12.5px; } }
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
