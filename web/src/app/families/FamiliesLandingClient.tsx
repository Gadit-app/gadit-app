"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { track } from "@/lib/track";

/**
 * Family-plan campaign landing page. Single column, direct-response
 * structure: angle hero → the pain → how it works → family value →
 * safety (the closer) → one pricing card (Family, annual anchored) →
 * FAQ → final CTA. Clear is deliberately ABSENT (downsell only, per
 * the July 2026 funnel inversion); a single-child Deep link is the
 * only alternative shown.
 *
 * ?v=relief|anxiety|safe selects the hero angle so email/ad variants
 * share one page. The angle rides along in analytics events.
 *
 * Self-contained styling (scoped .fam-* classes in an inline <style>)
 * so campaign iterations never touch globals.css.
 */

const PRICE_FAMILY_YEARLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_YEARLY ?? "";
const PRICE_FAMILY_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY_MONTHLY ?? "";
const PRICE_DEEP_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? "";

type Angle = "relief" | "anxiety" | "safe";

type Copy = {
  heroBadge: string;
  angles: Record<Angle, { h1: string; sub: string }>;
  heroCta: string;
  heroTrust: string;
  ownerCta: string;
  painTitle: string;
  painBody1: string;
  painBody2: string;
  howTitle: string;
  steps: Array<{ t: string; d: string }>;
  famTitle: string;
  famItems: string[];
  safeTitle: string;
  safeItems: string[];
  safeLine: string;
  priceTitle: string;
  trialBadge: string;
  yearly: string;
  yearlyNote: string;
  monthly: string;
  billedYearly: string;
  billedMonthly: string;
  priceCta: string;
  cancelNote: string;
  singleChild: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  finalTitle: string;
  finalCta: string;
  footerTerms: string;
  footerPrivacy: string;
};

const COPY: Record<"he" | "en", Copy> = {
  he: {
    heroBadge: "המסלול המשפחתי של Gadit",
    angles: {
      relief: {
        h1: "די להיות המילון הפרטי של הבית",
        sub: "כשהילד שואל \"מה זה אומר?\", יש עכשיו מקום אחד שבו הוא מוצא את התשובה לבד: כל המשמעויות, תמונה לכל משמעות, והסבר בגובה של ילד. בלי צ'אט פתוח ובלי פרסומות.",
      },
      anxiety: {
        h1: "ילד שמדלג על מילים, מאבד את הסיפור",
        sub: "מילה אחת לא מובנת מספיקה כדי לאבד את החוט בקריאה ובשיעורים. Gadit נותן לכל ילד דרך פשוטה לעצור, להבין באמת, ולחזור לספר בביטחון.",
      },
      safe: {
        h1: "המסך היחיד שנותנים לילד בלי לפחד",
        sub: "לא צ'אט פתוח. לא פיד אינסופי. לא פרסומות. מקום אחד נקי שבו ילד מקליד מילה, מבין אותה עד הסוף, וחוזר לשיעורים.",
      },
    },
    heroCta: "מתחילים 14 ימי ניסיון חינם",
    heroTrust: "בלי צ'אט פתוח · בלי פרסומות · ביטול בלחיצה אחת",
    ownerCta: "לאזור המשפחה שלכם",
    painTitle: "רגע שכל הורה מכיר",
    painBody1: "שמונה בערב. שיעורי בית. \"אבא, מה זה נחוש?\" שתי דקות אחר כך: \"מה זה להסס?\" ובפעם השלישית הילד כבר מבקש את הטלפון \"רק לבדוק מילה\", ונעלם בתוך טיקטוק.",
    painBody2: "הבעיה היא לא הסקרנות של הילד. הבעיה היא שאין לו מקום בטוח לקבל בו תשובה לבד.",
    howTitle: "ככה זה עובד",
    steps: [
      {
        t: "מקלידים מילה, או מדביקים משפט שלם",
        d: "למילים יש יותר מפירוש אחד. Gadit מזהה איזו משמעות מתאימה בדיוק להקשר של המשפט.",
      },
      {
        t: "רואים, לא רק קוראים",
        d: "תמונה לכל משמעות, דוגמאות אמיתיות, ניבים ומקור המילה. ובמצב ילדים: הסבר שילד באמת מבין.",
      },
      {
        t: "והמילה נשארת",
        d: "כל מילה נשמרת במחברת האישית של הילד, עם תרגול קצר וחכם שמוודא שהיא נזכרת גם בעוד שבוע.",
      },
    ],
    famTitle: "מנוי אחד. כל הילדים.",
    famItems: [
      "עד 5 ילדים, לכל אחד פרופיל משלו",
      "כל ילד ברמה שלו ובקצב שלו",
      "מחברת מילים ותרגול אישיים לכל ילד",
      "עברית מלאה, אנגלית, ועוד 12 שפות",
    ],
    safeTitle: "בנוי כך שאפשר להשאיר אותם לבד איתו",
    safeItems: [
      "אין צ'אט פתוח ואין שיחה חופשית",
      "אין פרסומות ואין קישורים החוצה",
      "אין פיד, אין המלצות, אין חורי ארנב",
      "עמוד אחד נקי לכל מילה, וזהו",
    ],
    safeLine: "ילד נכנס, מבין את המילה, וחוזר למה שהוא עשה.",
    priceTitle: "מסלול המשפחה",
    trialBadge: "14 ימי ניסיון חינם",
    yearly: "$69 לשנה",
    yearlyNote: "יוצא $5.75 לחודש",
    monthly: "$6.99 לחודש",
    billedYearly: "שנתי",
    billedMonthly: "חודשי",
    priceCta: "מתחילים את הניסיון",
    cancelNote: "החיוב הראשון רק בתום 14 הימים. מבטלים בלחיצה אחת מדף החשבון, מתי שרוצים.",
    singleChild: "יש בבית תלמיד אחד? מסלול Deep ב-$4.99 לחודש",
    faqTitle: "שאלות של הורים",
    faq: [
      {
        q: "למה לא פשוט לשאול צ'אט או גוגל?",
        a: "כי אלה כלים למבוגרים. חיפוש בגוגל מחזיר פרסומות וקישורים לכל כיוון, וצ'אט פתוח הוא שיחה בלי גבולות שאף הורה לא משאיר בה ילד לבד. Gadit בנוי הפוך: עמוד אחד סגור ונקי לכל מילה, בגובה של ילד, בלי שום דרך ללכת לאיבוד.",
      },
      {
        q: "לאילו גילאים זה מתאים?",
        a: "הלב של Gadit הוא ילדים בגיל בית ספר, מכיתה א ועד תיכון. מצב ילדים מסביר לקטנים, וההסברים המלאים משרתים גם בני נוער והורים. את החשבון פותח ההורה.",
      },
      {
        q: "זה עוזר גם באנגלית?",
        a: "מאוד. אפשר לחפש מילה באנגלית ולקבל הסבר בעברית פשוטה, עם תמונה ודוגמאות. בשביל שיעורי אנגלית זה בדיוק הכלי שחסר בבית. ובסך הכל Gadit עובד ב-14 שפות.",
      },
      {
        q: "כמה ילדים אפשר לחבר?",
        a: "עד 5 ילדים במנוי משפחתי אחד, לכל ילד פרופיל, מחברת ותרגול משלו.",
      },
      {
        q: "אפשר לנסות בלי להתחייב?",
        a: "כן. מתחילים 14 ימי ניסיון עם כרטיס, אבל החיוב הראשון יורד רק בתום הניסיון. מבטלים בכל רגע קודם, בלחיצה אחת, ולא תחויבו בכלום.",
      },
    ],
    finalTitle: "נסו את זה הערב, בשיעורי הבית הבאים",
    finalCta: "מתחילים 14 ימי ניסיון חינם",
    footerTerms: "תנאים",
    footerPrivacy: "פרטיות",
  },
  en: {
    heroBadge: "The Gadit Family plan",
    angles: {
      relief: {
        h1: "Stop being the family dictionary",
        sub: "When your kid asks \"what does this mean?\", there is now one place they can find the answer alone: every meaning, a picture for each one, and an explanation at kid level. No open chat, no ads.",
      },
      anxiety: {
        h1: "A kid who skips words loses the story",
        sub: "One misunderstood word is enough to lose the thread in reading and homework. Gadit gives every child a simple way to stop, truly understand, and get back to the book with confidence.",
      },
      safe: {
        h1: "The one screen you can hand a child without worry",
        sub: "No open chat. No endless feed. No ads. One clean place where a kid types a word, understands it fully, and goes back to homework.",
      },
    },
    heroCta: "Start your 14-day free trial",
    heroTrust: "No open chat · No ads · Cancel in one click",
    ownerCta: "Go to your family space",
    painTitle: "A moment every parent knows",
    painBody1: "8 PM. Homework. \"Dad, what does reluctant mean?\" Two minutes later: \"What's hesitate?\" And the third time, they ask for your phone \"just to check a word\" and vanish into TikTok.",
    painBody2: "The problem is not your kid's curiosity. The problem is that they have no safe place to get the answer alone.",
    howTitle: "How it works",
    steps: [
      {
        t: "Type a word, or paste a whole sentence",
        d: "Words have more than one meaning. Gadit picks the exact meaning that fits the sentence.",
      },
      {
        t: "See it, not just read it",
        d: "A picture for every meaning, real examples, idioms and the word's origin. And in Kids Mode: an explanation a child actually understands.",
      },
      {
        t: "And the word sticks",
        d: "Every word lands in your child's personal notebook, with short smart practice that makes sure it is still there next week.",
      },
    ],
    famTitle: "One plan. All your kids.",
    famItems: [
      "Up to 5 kids, each with their own profile",
      "Each child at their own level and pace",
      "A personal word notebook and practice per child",
      "14 languages, full support for each",
    ],
    safeTitle: "Built so you can leave them alone with it",
    safeItems: [
      "No open chat, no free-form conversation",
      "No ads and no outbound links",
      "No feed, no recommendations, no rabbit holes",
      "One clean page per word, and that is it",
    ],
    safeLine: "A kid comes in, understands the word, and goes back to what they were doing.",
    priceTitle: "The Family plan",
    trialBadge: "14-day free trial",
    yearly: "$69 / year",
    yearlyNote: "that is $5.75 a month",
    monthly: "$6.99 / month",
    billedYearly: "Yearly",
    billedMonthly: "Monthly",
    priceCta: "Start the trial",
    cancelNote: "First charge only after the 14 days. Cancel anytime from your account page, one click.",
    singleChild: "Just one student at home? Deep is $4.99/month",
    faqTitle: "Questions parents ask",
    faq: [
      {
        q: "Why not just ask a chatbot or Google?",
        a: "Because those are tools for adults. Google returns ads and links in every direction, and an open chatbot is a boundless conversation no parent leaves a child alone in. Gadit is built the other way around: one closed, clean page per word, at kid level, with no way to get lost.",
      },
      {
        q: "What ages is it for?",
        a: "The heart of Gadit is school-age kids, from first grade through high school. Kids Mode explains for the young ones, and the full explanations serve teens and parents too. The parent opens the account.",
      },
      {
        q: "Does it help with a second language?",
        a: "Very much. A child can look up a word in English and get a simple explanation in their own language, with a picture and examples. Gadit works in 14 languages.",
      },
      {
        q: "How many kids can I add?",
        a: "Up to 5 kids on one Family plan, each with their own profile, notebook and practice.",
      },
      {
        q: "Can we try it without committing?",
        a: "Yes. The trial starts with a card, but the first charge happens only when the 14 days end. Cancel anytime before that, one click, and you pay nothing.",
      },
    ],
    finalTitle: "Try it tonight, on the next homework",
    finalCta: "Start your 14-day free trial",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
  },
};

const ANGLES: Angle[] = ["relief", "anxiety", "safe"];

export default function FamiliesLandingClient() {
  const params = useSearchParams();
  const { user, familyId, promptLogin } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const c = lang === "he" ? COPY.he : COPY.en;

  const rawAngle = params.get("v");
  const angle: Angle = ANGLES.includes(rawAngle as Angle) ? (rawAngle as Angle) : "relief";
  const hero = c.angles[angle];

  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const isOwner = !!user && familyId === user.uid;

  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track("families_lp_view", { angle, lang });
  }, [angle, lang]);

  function startTrial(source: string) {
    track("families_lp_cta", { angle, billing, source });
    if (isOwner) {
      window.location.href = href("/family");
      return;
    }
    const priceId = billing === "yearly" ? PRICE_FAMILY_YEARLY : PRICE_FAMILY_MONTHLY;
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
      },
    });
  }

  function startDeep() {
    track("families_lp_cta", { angle, billing: "deep_monthly", source: "single_child" });
    if (!PRICE_DEEP_MONTHLY) return;
    promptLogin({
      mode: "signup",
      onSuccess: () => {
        window.location.href = `${href("/checkout")}?price=${encodeURIComponent(PRICE_DEEP_MONTHLY)}`;
      },
    });
  }

  const ctaLabel = isOwner ? c.ownerCta : c.heroCta;

  return (
    <div dir={dir} className="fam-page">
      <style>{FAM_CSS}</style>

      <header className="fam-header">
        <Link href={href("/")} className="fam-wordmark">
          Gad<span className="fam-wordmark-it">it</span>
        </Link>
        <button type="button" className="fam-header-cta" onClick={() => startTrial("header")}>
          {isOwner ? c.ownerCta : c.trialBadge}
        </button>
      </header>

      <main>
        {/* Hero */}
        <section className="fam-hero">
          <div className="fam-badge">{c.heroBadge}</div>
          <h1 className="fam-h1">{hero.h1}</h1>
          <p className="fam-sub">{hero.sub}</p>
          <button type="button" className="fam-cta" onClick={() => startTrial("hero")}>
            {ctaLabel}
          </button>
          <div className="fam-trust">{c.heroTrust}</div>
        </section>

        {/* The pain */}
        <section className="fam-section">
          <h2 className="fam-h2">{c.painTitle}</h2>
          <p className="fam-body">{c.painBody1}</p>
          <p className="fam-body fam-body-strong">{c.painBody2}</p>
        </section>

        {/* How it works */}
        <section className="fam-section">
          <h2 className="fam-h2">{c.howTitle}</h2>
          <div className="fam-steps">
            {c.steps.map((s, i) => (
              <div key={i} className="fam-step">
                <div className="fam-step-num">{i + 1}</div>
                <div>
                  <div className="fam-step-title">{s.t}</div>
                  <div className="fam-step-desc">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Family value */}
        <section className="fam-section">
          <h2 className="fam-h2">{c.famTitle}</h2>
          <ul className="fam-list">
            {c.famItems.map((item, i) => (
              <li key={i}>
                <CheckIcon color="#0EA5A5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Safety — the closer */}
        <section className="fam-section fam-safe">
          <h2 className="fam-h2">{c.safeTitle}</h2>
          <ul className="fam-list">
            {c.safeItems.map((item, i) => (
              <li key={i}>
                <ShieldIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="fam-safe-line">{c.safeLine}</p>
        </section>

        {/* Pricing */}
        <section className="fam-section" id="fam-pricing">
          <div className="fam-price-card">
            <div className="fam-price-badge">{c.trialBadge}</div>
            <h2 className="fam-price-title">{c.priceTitle}</h2>

            <div className="fam-billing-toggle" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={billing === "yearly"}
                className={billing === "yearly" ? "is-active" : ""}
                onClick={() => setBilling("yearly")}
              >
                {c.billedYearly}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={billing === "monthly"}
                className={billing === "monthly" ? "is-active" : ""}
                onClick={() => setBilling("monthly")}
              >
                {c.billedMonthly}
              </button>
            </div>

            <div className="fam-price-amount">
              {billing === "yearly" ? c.yearly : c.monthly}
            </div>
            {billing === "yearly" && <div className="fam-price-note">{c.yearlyNote}</div>}

            <ul className="fam-list fam-price-list">
              {c.famItems.map((item, i) => (
                <li key={i}>
                  <CheckIcon color="#0EA5A5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="fam-cta fam-cta-wide" onClick={() => startTrial("pricing")}>
              {isOwner ? c.ownerCta : c.priceCta}
            </button>
            <p className="fam-cancel-note">{c.cancelNote}</p>
          </div>

          {!isOwner && (
            <button type="button" className="fam-single-link" onClick={startDeep}>
              {c.singleChild}
            </button>
          )}
        </section>

        {/* FAQ */}
        <section className="fam-section">
          <h2 className="fam-h2">{c.faqTitle}</h2>
          <div className="fam-faq">
            {c.faq.map((f, i) => (
              <details key={i} className="fam-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="fam-section fam-final">
          <h2 className="fam-h2">{c.finalTitle}</h2>
          <button type="button" className="fam-cta" onClick={() => startTrial("final")}>
            {isOwner ? c.ownerCta : c.finalCta}
          </button>
        </section>
      </main>

      <footer className="fam-footer">
        <span>© Gadit {new Date().getFullYear()}</span>
        <Link href={href("/terms")}>{c.footerTerms}</Link>
        <Link href={href("/privacy")}>{c.footerPrivacy}</Link>
      </footer>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const FAM_CSS = `
.fam-page {
  min-height: 100dvh;
  background: #f6f4ee;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}
.fam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
}
.fam-wordmark {
  font-weight: 800;
  font-size: 22px;
  color: #1f2937;
  text-decoration: none;
  letter-spacing: -0.02em;
}
.fam-wordmark-it { color: #0EA5A5; font-style: italic; }
.fam-header-cta {
  border: 1.5px solid #0EA5A5;
  background: transparent;
  color: #0b7d7d;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-hero {
  text-align: center;
  padding: 44px 20px 30px;
  max-width: 720px;
  margin: 0 auto;
}
.fam-badge {
  display: inline-block;
  background: rgba(14,165,165,0.1);
  color: #0b7d7d;
  border: 1px solid rgba(14,165,165,0.25);
  font-weight: 700;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}
.fam-h1 {
  font-size: clamp(30px, 6vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0 0 14px;
}
.fam-sub {
  font-size: clamp(16px, 2.5vw, 18.5px);
  line-height: 1.65;
  color: #4b5563;
  margin: 0 auto 24px;
  max-width: 620px;
}
.fam-cta {
  background: #0EA5A5;
  color: #fff;
  border: none;
  font-weight: 800;
  font-size: 17px;
  padding: 15px 30px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(14,165,165,0.35);
  transition: transform 160ms ease-out;
}
.fam-cta:active { transform: scale(0.97); }
.fam-cta-wide { width: 100%; }
.fam-trust {
  margin-top: 14px;
  font-size: 13.5px;
  color: #6b7280;
}
.fam-section {
  max-width: 720px;
  margin: 0 auto;
  padding: 34px 20px;
}
.fam-h2 {
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 16px;
  text-align: center;
}
.fam-body {
  font-size: 16.5px;
  line-height: 1.7;
  color: #374151;
  margin: 0 0 12px;
}
.fam-body-strong { font-weight: 700; color: #1f2937; }
.fam-steps { display: flex; flex-direction: column; gap: 16px; }
.fam-step {
  display: flex;
  gap: 14px;
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 16px;
  padding: 16px 18px;
  align-items: flex-start;
}
.fam-step-num {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(14,165,165,0.12);
  color: #0b7d7d;
  font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fam-step-title { font-weight: 700; font-size: 16px; margin-bottom: 3px; }
.fam-step-desc { color: #4b5563; font-size: 14.5px; line-height: 1.6; }
.fam-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
  max-width: 520px;
  margin-inline: auto;
}
.fam-list li {
  display: flex; gap: 10px; align-items: flex-start;
  font-size: 15.5px; line-height: 1.55;
}
.fam-safe {
  background: #fff;
  border-radius: 22px;
  border: 1px solid rgba(124,58,237,0.15);
  max-width: 680px;
}
.fam-safe-line {
  text-align: center;
  font-weight: 700;
  color: #7C3AED;
  margin: 18px 0 0;
  font-size: 15.5px;
}
.fam-price-card {
  background: #fff;
  border: 2px solid #0EA5A5;
  border-radius: 22px;
  padding: 26px 24px;
  max-width: 460px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 14px 40px rgba(14,165,165,0.12);
}
.fam-price-badge {
  display: inline-block;
  background: #0EA5A5;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  padding: 5px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.fam-price-title { font-size: 24px; font-weight: 800; margin: 0 0 14px; }
.fam-billing-toggle {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 14px;
}
.fam-billing-toggle button {
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 13.5px;
  color: #6b7280;
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
}
.fam-billing-toggle button.is-active { background: #fff; color: #0b7d7d; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
.fam-price-amount { font-size: 34px; font-weight: 800; direction: ltr; }
.fam-price-note { color: #0b7d7d; font-weight: 700; font-size: 14.5px; margin-top: 2px; }
.fam-price-list { margin: 18px auto; text-align: start; }
.fam-cancel-note { color: #6b7280; font-size: 12.5px; margin: 12px 0 0; line-height: 1.55; }
.fam-single-link {
  display: block;
  margin: 18px auto 0;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.fam-faq { display: flex; flex-direction: column; gap: 10px; }
.fam-faq-item {
  background: #fff;
  border: 1px solid rgba(31,41,55,0.08);
  border-radius: 14px;
  padding: 14px 18px;
}
.fam-faq-item summary {
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  list-style: none;
}
.fam-faq-item summary::-webkit-details-marker { display: none; }
.fam-faq-item p {
  margin: 10px 0 0;
  color: #4b5563;
  font-size: 14.5px;
  line-height: 1.65;
}
.fam-final { text-align: center; padding-bottom: 60px; }
.fam-footer {
  display: flex;
  gap: 18px;
  justify-content: center;
  padding: 22px;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid rgba(31,41,55,0.06);
}
.fam-footer a { color: #9ca3af; text-decoration: none; }
`;
