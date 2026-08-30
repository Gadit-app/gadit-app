"use client";

/**
 * FamiliesV2Client — NON-LIVE preview of the redesigned Family landing.
 *
 * Design language ported from the approved light prototype: one light
 * ground, teal as the single action color, an eyebrow label system,
 * big clamp typography, soft-shadow cards, scroll reveal, and a sticky
 * mobile CTA. Hebrew-first for the preview (localization comes after the
 * design is locked). Every feature gets its own section with its real
 * screenshot from /public/fam; the two new features (Say it, tap any
 * word) use built-in mockups. Price sits at the very end.
 *
 * Lives at /families-v2 only. The live /families page is untouched.
 */

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const FEATURES: Array<{ img?: string; mock?: "say" | "everyword"; eyebrow: string; title: string; body: string }> = [
  { img: "meanings", eyebrow: "כל המשמעויות", title: "כל מילה, מוסברת בשפה שלך.", body: "מילה בכל שפה מקבלת את כל המשמעויות שלה, דוגמאות לפי הקשר, ניבים ומקור היסטורי, מוסברת בשפה שמדברים בבית." },
  { img: "kids-mode", eyebrow: "מצב ילדים", title: "הסבר בגובה של ילד, לא של מילון.", body: "אותה מילה, מנוסחת פשוט וברור לילד. בלי הגדרות יבשות שהוא סוגר בלי להבין." },
  { mock: "everyword", eyebrow: "כל מילה", title: "לחיצה על כל מילה בתוך ההסבר.", body: "גם מילה בתוך ההסבר לא מובנת? לחיצה אחת פותחת אותה מיד, בלי לצאת מהעמוד. ככה ההבנה לא נתקעת באמצע." },
  { mock: "say", eyebrow: "Say it", title: "לשמוע כל מילה, ולתרגל את ההגייה.", body: "הילד שומע איך אומרים את המילה, אומר אותה בעצמו, ומקבל משוב על ההגייה. בטוח לדבר, בלי בושה." },
  { img: "context", eyebrow: "מצב הקשר", title: "המשמעות הנכונה, למשפט הנכון.", body: "מדביקים משפט שלם, וגדית בוחר את המשמעות שמתאימה בדיוק להקשר. סוף לבלבול בין משמעויות." },
  { img: "notebook", eyebrow: "מחברת וחידונים", title: "המילים נשארות, וחוזרות לתרגול.", body: "כל מילה שהילד לומד נשמרת במחברת אישית, וחוזרת בחידונים ובתרגול חכם כדי שהיא באמת תיקבע." },
  { img: "games", eyebrow: "משחקי מילים", title: "למידה שלא מרגישה כמו שיעורי בית.", body: "משחקי מילים שהופכים את התרגול למשהו שהילד רוצה לחזור אליו, ובונים אוצר מילים תוך כדי." },
  { img: "profiles", eyebrow: "פרופיל לכל ילד", title: "כל ילד, הקצב שלו, המחברת שלו.", body: "לכל ילד פרופיל נפרד עם היסטוריה, מחברת ורצף ימי למידה משלו. אותה משפחה, מסלול אישי לכל אחד." },
];

function MockEveryWord() {
  return (
    <div className="gdx-mock">
      <div className="gdx-mock-h">מה זה אומר?</div>
      <p className="gdx-mock-para">
        התהליך שבו צמח לוקח אור שמש, מים ו
        <span className="gdx-mock-hl">פחמן דו-חמצני</span>
        , והופך אותם למזון.
      </p>
      <div className="gdx-pop">
        <div className="gdx-pop-w">פחמן דו-חמצני</div>
        <div className="gdx-pop-d">גז שנמצא באוויר. צמחים משתמשים בו כדי לייצר מזון.</div>
      </div>
    </div>
  );
}

function MockSay() {
  return (
    <div className="gdx-mock">
      <div className="gdx-say-w" translate="no">Butterfly</div>
      <div className="gdx-say-row">
        <span className="gdx-say-btn">▶</span>
        <span className="gdx-say-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span className="gdx-say-lbl">כך אומרים</span>
      </div>
      <div className="gdx-say-practice">
        <span className="gdx-say-mic">🎙️</span>
        <div>
          <div className="gdx-say-stars">★★★★<span>★</span></div>
          <div className="gdx-say-heard">שמעתי: batterfly, כמעט מדויק</div>
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
      (entries) => {
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add("is-in");
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="gdx">
      <style>{GDX_CSS}</style>

      {/* header */}
      <header className="gdx-head">
        <span className="gdx-logo" translate="no">Gad<i>it</i></span>
        <Link href="/checkout" className="gdx-head-cta">להתחיל חינם</Link>
      </header>

      {/* HERO */}
      <section className="sec hero">
        <div className="wrap hero-grid">
          <div className="rv">
            <span className="eyebrow">מנוי משפחתי · עד 5 ילדים</span>
            <h1>שהילד שלך יבין כל מילה בבית הספר, עד הסוף.</h1>
            <p className="lead">גדית מסביר כל מילה בשפה שמדברים בבית, בגובה של ילד, ובונה אוצר מילים שנשאר. את ההתקדמות של כל ילד רואים בלוח אחד.</p>
            <div className="cta-wrap">
              <Link href="/checkout" className="btn">להתחיל 14 יום חינם</Link>
              <div className="btn-sub">בלי כרטיס בהתחלה · אפשר לבטל בכל רגע</div>
            </div>
            <div className="chips">
              <span className="chip">כל מילה, בשפה שלך</span>
              <span className="chip">לוח בקרה להורה</span>
              <span className="chip">33 שפות</span>
            </div>
          </div>
          <div className="stage rv">
            <div className="shot shot-hero">
              <Image src="/fam/hero.webp" alt="" width={1200} height={900} sizes="(max-width:900px) 92vw, 460px" priority />
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="sec surf">
        <div className="narrow rv">
          <span className="eyebrow">מוכר לך?</span>
          <h2 className="start">הילד קורא את המילים, אבל לא באמת מבין אותן.</h2>
          <ul className="pain">
            <li>שיעורי הבית לוקחים שעתיים, כי כל פסקה מלאה במילים שהוא לא מכיר.</li>
            <li>הוא שואל "מה זה אומר?", ואין תמיד את המילה המדויקת בשפה שלו.</li>
            <li>מילון רגיל נותן הגדרה יבשה, והוא סוגר אותה בלי להבין.</li>
            <li>וקשה לדעת אילו מילים חסרות לו, עד שמגיע המבחן.</li>
          </ul>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="sec">
        <div className="narrow center rv">
          <span className="eyebrow">מה זה גדית</span>
          <h2>כלי אחד שהופך כל מילה לא מובנת למילה שהילד מבין, זוכר, ויודע להשתמש בה.</h2>
        </div>
      </section>

      {/* FEATURES, one section per feature */}
      {FEATURES.map((f, i) => (
        <section key={i} className={`sec ${i % 2 === 0 ? "surf" : ""}`}>
          <div className={`wrap feat ${i % 2 === 1 ? "flip" : ""} rv`}>
            <div className="feat-text">
              <span className="eyebrow">{f.eyebrow}</span>
              <h2 className="start">{f.title}</h2>
              <p className="feat-body">{f.body}</p>
            </div>
            <div className="feat-visual">
              {f.img ? (
                <div className="shot">
                  <Image src={`/fam/${f.img}.webp`} alt="" width={1200} height={900} sizes="(max-width:900px) 92vw, 440px" />
                </div>
              ) : f.mock === "everyword" ? (
                <MockEveryWord />
              ) : (
                <MockSay />
              )}
            </div>
          </div>
        </section>
      ))}

      {/* PARENT DASHBOARD, the moat */}
      <section className="sec surf">
        <div className="wrap rv">
          <span className="eyebrow">לוח בקרה להורה</span>
          <h2 className="start" style={{ marginBottom: 8 }}>לראות בדיוק איפה כל ילד צריך עזרה, בלי לרחף מעליו.</h2>
          <p className="lead" style={{ marginBottom: 26 }}>כל מילה שילד מחפש נשמרת. הלוח מראה לך מה הוא לומד השבוע, מה חוזר, ומה כדאי לתרגל.</p>
          <div className="dash">
            {[
              { n: "מאיה · כיתה ד׳", c: "#0EA5A5", bars: [40, 70, 55, 90, 60] },
              { n: "יונתן · כיתה ב׳", c: "#0891B2", bars: [30, 45, 35, 50, 65] },
              { n: "נועה · כיתה ו׳", c: "#D97706", bars: [80, 60, 95, 70, 85] },
            ].map((k, i) => (
              <div className="drow" key={i}>
                <span className="kidname"><span className="dot" style={{ background: k.c }}>{k.n[0]}</span>{k.n}</span>
                <span className="dbars">{k.bars.map((h, j) => <span className="dbar" key={j} style={{ height: `${h}%` }} />)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="sec">
        <div className="narrow rv">
          <span className="eyebrow">גדית מול מילון רגיל</span>
          <h2 className="start" style={{ marginBottom: 22 }}>ההבדל בין להגדיר מילה, לבין להבין אותה.</h2>
          <table className="cmp">
            <thead><tr><th>&nbsp;</th><th className="brand">Gadit</th><th>מילון רגיל</th></tr></thead>
            <tbody>
              {["הסבר בגובה של ילד", "מוסבר בשפה שמדברים בבית", "לחיצה על כל מילה בתוך ההסבר", "מחברת ותרגול שחוזרים", "לוח בקרה להורה"].map((r, i) => (
                <tr key={i}><td>{r}</td><td className="yes">✓</td><td className="no">לא</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="sec surf">
        <div className="narrow rv">
          <div className="guard">
            <div className="gbadge">✓</div>
            <div>
              <h3>14 יום להתרשם, בלי סיכון</h3>
              <p>מתחילים חינם. אם זה לא מתאים, מבטלים לפני תום הניסיון בלחיצה אחת, ולא מחייבים אותך בכלל.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="narrow rv">
          <div className="center" style={{ marginBottom: 24 }}><span className="eyebrow">שאלות נפוצות</span><h2>מה שכדאי לדעת לפני שמתחילים.</h2></div>
          {[
            ["לכמה ילדים זה מספיק?", "עד 5 ילדים תחת אותו מנוי, כל אחד עם פרופיל, מחברת והתקדמות משלו."],
            ["הילד שלי לומד בשפה אחרת, זה יעבוד?", "כן. גדית מסביר כל מילה בשפה שבוחרים, מתוך 33 שפות ממשק, ומזהה את שפת הלימוד בנפרד."],
            ["איך מחייבים אותי?", "בשקלים, בכרטיס ישראלי רגיל, בלי עמלות המרה: ₪199 לשנה או ₪19.90 לחודש, אחרי 14 ימי הניסיון."],
            ["אפשר לבטל?", "בכל רגע, בלחיצה אחת מהחשבון. אם מבטלים לפני תום הניסיון, לא מחייבים בכלל."],
          ].map(([q, a], i) => (
            <details key={i}><summary>{q}</summary><div className="a">{a}</div></details>
          ))}
        </div>
      </section>

      {/* PRICE, at the very end */}
      <section className="sec">
        <div className="wrap center rv" style={{ marginBottom: 26 }}>
          <span className="eyebrow">מנוי משפחתי</span>
          <h2>עכשיו שראית הכל, מחיר אחד לכל המשפחה.</h2>
        </div>
        <div className="pricebox rv">
          <span className="trial">14 יום חינם, בלי חיוב</span>
          <div className="price">19.90<small> ₪ לחודש</small></div>
          <div className="pricenote">עד 5 ילדים, כל אחד עם פרופיל משלו. או ₪199 לשנה, וחוסכים קרוב לחודשיים.</div>
          <Link href="/checkout" className="btn">להתחיל 14 יום חינם</Link>
          <div className="btn-sub">אחרי הניסיון: ₪19.90 לחודש. ביטול בלחיצה אחת מהחשבון, בלי חיוב.</div>
        </div>
      </section>

      {/* FINAL */}
      <section className="sec final band">
        <div className="narrow wrap rv">
          <span className="eyebrow">אפשר להתחיל היום</span>
          <h2>תני לילד שלך את המילים להבין כל שיעור.</h2>
          <p className="lead" style={{ marginBottom: 26 }}>14 יום חינם. עד 5 ילדים. לוח אחד שרואה את כולם.</p>
          <Link href="/checkout" className="btn">להתחיל 14 יום חינם</Link>
        </div>
      </section>

      {/* STICKY MOBILE */}
      <div className="sticky">
        <div className="sp">19.90 ₪<span> / חודש · 14 יום חינם</span></div>
        <Link href="/checkout" className="btn">להתחיל</Link>
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
.gdx .feat-visual .shot{max-width:440px;margin-inline:auto}

.gdx .pain{display:grid;gap:12px;margin-top:20px;padding:0;list-style:none}
.gdx .pain li{background:var(--surf);border:1px solid var(--line);border-right:3px solid var(--teal);border-radius:12px;padding:15px 18px;color:var(--soft);font-size:16.5px;box-shadow:0 8px 20px rgba(11,18,32,.05)}

.gdx .dash{background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:clamp(16px,3vw,26px);box-shadow:0 26px 60px rgba(11,18,32,.12)}
.gdx .drow{display:flex;align-items:center;justify-content:space-between;padding:14px 4px;border-bottom:1px solid var(--line2)}
.gdx .drow:last-child{border-bottom:none}
.gdx .kidname{display:flex;align-items:center;gap:10px;color:var(--ink);font-size:15px;font-weight:600}
.gdx .dot{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:800;color:#fff}
.gdx .dbars{display:flex;align-items:flex-end;gap:4px;height:36px}
.gdx .dbar{width:9px;background:var(--teal);border-radius:3px;opacity:.9}

.gdx-mock{background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 26px 60px rgba(11,18,32,.14);max-width:440px;margin-inline:auto;position:relative}
.gdx-mock-h{font-size:13px;font-weight:700;color:var(--teal-deep);margin-bottom:10px}
.gdx-mock-para{font-size:17px;line-height:1.7;color:var(--ink)}
.gdx-mock-hl{background:rgba(14,165,165,.16);border-bottom:2px solid var(--teal);border-radius:4px;padding:0 3px;font-weight:700;cursor:pointer}
.gdx-pop{margin-top:16px;background:#0B1220;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 16px 34px rgba(11,18,32,.25)}
.gdx-pop-w{font-weight:800;font-size:15px;margin-bottom:4px}
.gdx-pop-d{font-size:13.5px;color:#C2CCDB;line-height:1.5}
.gdx-say-w{font-weight:900;font-size:30px;color:var(--ink);letter-spacing:-.01em;direction:ltr;text-align:right}
.gdx-say-row{display:flex;align-items:center;gap:12px;margin:16px 0}
.gdx-say-btn{width:38px;height:38px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font-size:14px;flex:0 0 auto}
.gdx-say-wave{display:flex;align-items:center;gap:3px;flex:1}
.gdx-say-wave i{width:4px;border-radius:2px;background:rgba(14,165,165,.55);height:12px}
.gdx-say-wave i:nth-child(2){height:22px}.gdx-say-wave i:nth-child(3){height:30px}.gdx-say-wave i:nth-child(4){height:18px}.gdx-say-wave i:nth-child(5){height:26px}.gdx-say-wave i:nth-child(6){height:14px}.gdx-say-wave i:nth-child(7){height:22px}
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
.gdx details .a{padding:0 20px 18px;color:var(--soft);font-size:15.5px}

.gdx .pricebox{background:linear-gradient(180deg,#fff,#F3F8F7);border:1px solid var(--line);border-radius:22px;padding:clamp(26px,4vw,40px);text-align:center;max-width:560px;margin:0 auto;box-shadow:0 26px 60px rgba(11,18,32,.12)}
.gdx .trial{display:inline-block;background:rgba(14,165,165,.10);border:1px solid rgba(14,165,165,.28);color:var(--teal-deep);font-weight:700;font-size:13.5px;border-radius:999px;padding:6px 16px;margin-bottom:18px}
.gdx .price{color:var(--teal);font-weight:900;font-size:clamp(52px,9vw,84px);line-height:1;letter-spacing:-.02em}
.gdx .price small{font-size:22px;font-weight:700;color:var(--soft)}
.gdx .pricenote{color:var(--muted);font-size:15px;margin:10px 0 22px}

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
