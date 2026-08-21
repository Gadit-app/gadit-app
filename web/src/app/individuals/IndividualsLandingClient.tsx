"use client";

/**
 * /individuals — sales landing for the solo product (Gadi 2026-08-18).
 *
 * "Individuals" and "Pricing" used to point at the same /pricing page. Now
 * Individuals is its own landing (like /families and /schools) that sells
 * the single-learner story, with pricing at the bottom; /pricing stays
 * separate. Marketing landing, so it's force-light in all themes.
 *
 * EN + HE first (Gadi to approve the structure); other languages fall back
 * to English until we replicate.
 */

import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { type Lang } from "@/lib/i18n";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { WbShellNav, WbShellBurger } from "@/components/design/WbShellChrome";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { HomeFooter } from "@/components/design/home";

const PRICE_CLEAR = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const PRICE_DEEP = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY ?? "";

type Feature = { t: string; b: string };
type Copy = {
  signIn: string;
  heroTitle: string; heroSub: string; heroCta2: string;
  problemEyebrow: string; problemTitle: string; problemBody: string;
  solutionEyebrow: string; solutionTitle: string; solutionBody: string;
  featuresEyebrow: string; featuresTitle: string; features: Feature[];
  whoEyebrow: string; whoTitle: string; who: string[];
  pricingEyebrow: string; pricingTitle: string;
  clearName: string; clearDesc: string; deepName: string; deepDesc: string;
  perMonth: string; choose: string;
  finalTitle: string; heroCta: string;
};

const COPY: Partial<Record<Lang, Copy>> = {
  en: {
    signIn: "Sign in",
    heroTitle: "Understand every word. Build your vocabulary.",
    heroSub: "The dictionary that explains any word at your level, in 30+ languages, saves it to your notebook, and helps you remember it. Your own vocabulary, growing every day.",
    heroCta2: "See plans",
    problemEyebrow: "The problem",
    problemTitle: "A definition alone isn't enough",
    problemBody: "Dictionaries give definitions, but without an image, examples that stick, games or practice, a word never really lands or stays.",
    solutionEyebrow: "The idea",
    solutionTitle: "The whole word, not just a line",
    solutionBody: "Every meaning, three living examples, an image, and where the word comes from. In your language, at your level. Then it's saved, practised, and played with until it sticks.",
    featuresEyebrow: "What you get",
    featuresTitle: "Everything you need to actually learn a word",
    features: [
      { t: "The dictionary", b: "Every meaning, examples, an image and the origin, for any word." },
      { t: "Your notebook", b: "Every word you look up is saved automatically, sorted by language." },
      { t: "In your language", b: "Kid-level explanations in 30+ languages. New to a language? Understand it in the one you think in." },
      { t: "Games & practice", b: "Word games and smart practice that make a word stay." },
      { t: "Say it", b: "Type or speak a sentence and hear it in the language you're learning." },
    ],
    whoEyebrow: "Who it's for",
    whoTitle: "Made for anyone who loves to understand",
    who: ["Language learners", "New immigrants", "Curious minds", "Parents teaching one child"],
    pricingEyebrow: "Pricing",
    pricingTitle: "Start free. Go deeper from $2.99.",
    clearName: "Clear", clearDesc: "The full dictionary. Every meaning, examples, image and origin.",
    deepName: "Deep", deepDesc: "Everything in Clear, plus the notebook, practice and games.",
    perMonth: "/mo", choose: "Choose",
    heroCta: "Start free",
    finalTitle: "Want to understand every word?",
  },
  he: {
    signIn: "התחברות",
    heroTitle: "להבין כל מילה. לבנות אוצר מילים.",
    heroSub: "המילון שמסביר כל מילה ברמה שלך, ב-30+ שפות, שומר אותה במחברת ועוזר לזכור. אוצר המילים האישי שלך, שגדל כל יום.",
    heroCta2: "למחירים",
    problemEyebrow: "הבעיה",
    problemTitle: "הגדרה לבד לא מספיקה",
    problemBody: "מילונים נותנים הגדרות, אבל בלי תמונה שממחישה, בלי דוגמאות שנשארות, בלי משחקים ובלי תרגול, המילה לא נקלטת ולא נשארת.",
    solutionEyebrow: "הרעיון",
    solutionTitle: "כל המילה, לא רק שורה",
    solutionBody: "כל המשמעויות, שלוש דוגמאות חיות, תמונה, ומאיפה המילה הגיעה. בשפה שלך, ברמה שלך. ואז היא נשמרת, מתרגלים אותה, ומשחקים איתה עד שהיא נכנסת.",
    featuresEyebrow: "מה מקבלים",
    featuresTitle: "כל מה שצריך כדי באמת ללמוד מילה",
    features: [
      { t: "המילון", b: "כל המשמעויות, דוגמאות, תמונה ומקור המילה, לכל מילה." },
      { t: "המחברת שלך", b: "כל מילה שחיפשת נשמרת אוטומטית, מסודרת לפי שפה." },
      { t: "בשפה שלך", b: "הסבר ברמת ילד ב-30+ שפות. חדש בשפה? מבינים אותה בשפה שבה חושבים." },
      { t: "משחקים ותרגול", b: "משחקי מילים ותרגול חכם שגורמים למילה להישאר." },
      { t: "תגיד את זה", b: "מקלידים או אומרים משפט ושומעים אותו בשפה שרוצים ללמוד." },
    ],
    whoEyebrow: "למי זה",
    whoTitle: "בשביל כל מי שאוהב להבין",
    who: ["לומדי שפות", "עולים חדשים", "סקרנים", "הורים שמלמדים ילד"],
    pricingEyebrow: "מחירים",
    pricingTitle: "להתחיל בחינם. להעמיק מ-$2.99.",
    clearName: "Clear", clearDesc: "המילון המלא. כל משמעות, דוגמאות, תמונה ומקור.",
    deepName: "Deep", deepDesc: "כל מה שב-Clear, ועוד המחברת, תרגול ומשחקים.",
    perMonth: "/חודש", choose: "בחירה",
    heroCta: "להתחיל בחינם",
    finalTitle: "רוצה להבין כל מילה?",
  },
};
function copy(lang: Lang): Copy { return COPY[lang] ?? COPY.en!; }

export function IndividualsLandingClient() {
  const { lang, dir } = useLang();
  const { user, promptLogin } = useAuth();
  const href = useHref();
  const t = copy(lang);

  const buy = (priceId: string) => {
    if (!priceId) { window.location.href = href("/pricing"); return; }
    if (!user) { promptLogin({ mode: "signup" }); return; }
    window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`;
  };
  const startFree = () => { if (user) { window.location.href = href("/"); } else { promptLogin({ mode: "signup" }); } };
  const ctaBtn: React.CSSProperties = { background: "#0EA5A5", color: "#fff", border: "none", borderRadius: 999, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };

  const teal = "#0EA5A5";
  const sectionMax = 1080;

  return (
    <div className="wordbook wb-shell-page wb-force-light" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href={href("/")} className="wb-wordmark" dir="ltr" translate="no">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <WbShellNav active="individuals" />
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/individuals"
            currentPage
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitcher />
          {user ? <WbUserMenu /> : (
            <>
              <StartFreeCTA />
              <button type="button" className="wb-shell-link" onClick={() => promptLogin({ mode: "signin" })}>{t.signIn}</button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta"><StartFreeCTA /></div>
        <div className="wb-shell-mobile-menu-cluster">
          <ShareButton
            url="https://www.gadit.app/individuals"
            currentPage
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitchMobile />
          <WbShellBurger active="individuals" />
        </div>
      </header>

      <main style={{ flex: 1, color: "var(--ink)" }}>
        {/* Hero */}
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "56px 20px 44px", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.12, margin: "0 0 18px", textWrap: "balance" }}>{t.heroTitle}</h1>
          <p style={{ fontSize: "clamp(16px, 2.2vw, 19px)", lineHeight: 1.6, color: "var(--ink-soft)", maxWidth: 640, margin: "0 auto 28px" }}>{t.heroSub}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={startFree} style={ctaBtn}>{t.heroCta}</button>
            <a href="#pricing" style={{ color: teal, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>{t.heroCta2}</a>
          </div>
        </section>

        {/* Problem */}
        <Band bg="var(--mist)">
          <Eyebrow>{t.problemEyebrow}</Eyebrow>
          <h2 style={h2s}>{t.problemTitle}</h2>
          <p style={leadP}>{t.problemBody}</p>
        </Band>

        {/* Solution */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
          <Eyebrow>{t.solutionEyebrow}</Eyebrow>
          <h2 style={h2s}>{t.solutionTitle}</h2>
          <p style={leadP}>{t.solutionBody}</p>
        </section>

        {/* Features */}
        <Band bg="var(--mist)">
          <div style={{ maxWidth: sectionMax, margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Eyebrow>{t.featuresEyebrow}</Eyebrow>
              <h2 style={h2s}>{t.featuresTitle}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 28 }}>
              {t.features.map((f) => (
                <div key={f.t} style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 16, padding: 22, textAlign: dir === "rtl" ? "right" : "left" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: teal }}>{f.t}</div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>{f.b}</div>
                </div>
              ))}
            </div>
          </div>
        </Band>

        {/* Who it's for */}
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
          <Eyebrow>{t.whoEyebrow}</Eyebrow>
          <h2 style={h2s}>{t.whoTitle}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 20 }}>
            {t.who.map((w) => (
              <span key={w} style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 999, padding: "9px 18px", fontSize: 15, fontWeight: 600 }}>{w}</span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <Band bg="var(--mist)" id="pricing">
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", textAlign: "center" }}>
            <Eyebrow>{t.pricingEyebrow}</Eyebrow>
            <h2 style={h2s}>{t.pricingTitle}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 28 }}>
              <PriceCard name={t.clearName} price="$2.99" per={t.perMonth} desc={t.clearDesc} accent="var(--teal-deep, #0F766E)" cta={t.choose} onClick={() => buy(PRICE_CLEAR)} />
              <PriceCard name={t.deepName} price="$4.99" per={t.perMonth} desc={t.deepDesc} accent="#6D28D9" cta={t.choose} onClick={() => buy(PRICE_DEEP)} featured />
            </div>
          </div>
        </Band>

        {/* Final CTA */}
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "56px 20px 64px", textAlign: "center" }}>
          <h2 style={{ ...h2s, marginBottom: 22 }}>{t.finalTitle}</h2>
          <div style={{ display: "flex", justifyContent: "center" }}><button type="button" onClick={startFree} style={ctaBtn}>{t.heroCta}</button></div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

const h2s: React.CSSProperties = { fontSize: "clamp(24px, 3.4vw, 32px)", fontWeight: 800, lineHeight: 1.18, margin: "0 0 14px", textWrap: "balance" };
const leadP: React.CSSProperties = { fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 620, margin: "0 auto" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0EA5A5", marginBottom: 10 }}>{children}</div>;
}

function Band({ children, bg, id }: { children: React.ReactNode; bg: string; id?: string }) {
  return (
    <section id={id} style={{ background: bg, padding: "48px 20px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
    </section>
  );
}

function PriceCard({ name, price, per, desc, accent, cta, onClick, featured }: {
  name: string; price: string; per: string; desc: string; accent: string; cta: string; onClick: () => void; featured?: boolean;
}) {
  return (
    <div style={{ background: "var(--surface)", border: featured ? `1.5px solid ${accent}` : "1px solid var(--rule)", borderRadius: 18, padding: "26px 22px", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent }}>{name}</div>
      <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{price}<span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-muted)" }}>{per}</span></div>
      <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)", minHeight: 44 }}>{desc}</div>
      <button type="button" onClick={onClick} style={{ marginTop: 8, width: "100%", background: accent, color: "#fff", border: "none", borderRadius: 999, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{cta}</button>
    </div>
  );
}
