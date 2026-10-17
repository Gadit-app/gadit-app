"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lines } from "../families/RealScreens";
import { SCH_PAGE_CSS } from "./SchoolsRealLanding";
import { LangSwitcher } from "@/components/design/LangSwitcher";
import { useHref } from "@/lib/href";
import { useAuth } from "@/lib/auth-context";
import { track } from "@/lib/track";
import { SCHOOLS_TIER_LIST, type SchoolsTierKey, SCHOOLS_TIERS } from "@/lib/schools-prices";
import { fill, landingDir, landingFont, screensLang } from "@/lib/landing-i18n";
import type { SchCopy } from "./i18n/types";

/**
 * The international Schools page (Gadi 2026-10-17): the Hebrew real-screens
 * page (SchoolsRealLanding) for schools outside Israel, in every language
 * but Hebrew. Same layout and styles; only what such a school really gets
 * (CAPS units for South Africa, any word on the projector, students on their
 * own devices with a class code, the lookup dashboard), priced in US dollars
 * with the self-serve 14-day trial of the Stripe tiers (lib/schools-prices).
 * Screens: public/sch/screens/en/.
 */

function Shot({ name, phone, priority = false, lang, alt }: { name: string; phone?: boolean; priority?: boolean; lang: string; alt: string }) {
  const src = `/sch/screens/${screensLang(lang)}/${name}.webp`;
  if (phone) {
    return (
      <div className="sch-phone">
        <div className="sch-phone-screen">
          <Image src={src} alt={alt} width={780} height={1688} sizes="(max-width: 760px) 62vw, 270px" priority={priority} />
        </div>
      </div>
    );
  }
  return (
    <div className="sch-laptop">
      <div className="sch-laptop-screen">
        <Image src={src} alt={alt} width={1600} height={1000} sizes="(max-width: 760px) 92vw, 620px" priority={priority} />
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

export function SchoolsGlobalLanding({ copy: C, lang }: { copy: SchCopy; lang: string }) {
  const href = useHref();
  const { schoolId, promptLogin } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const from = SCHOOLS_TIERS.s.usdMonthly;
  const toPricing = (where: string) => {
    track("schools_order_click", { where, kind: "trial", page: "schools-global", lang });
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // The same self-serve path as the old international page: sign up, then
  // the tier's Stripe price in /checkout (SchoolsLandingClient.clickSchoolsTier).
  const startTier = (tier: SchoolsTierKey) => {
    const t = SCHOOLS_TIERS[tier];
    const priceId = billing === "yearly" ? t.yearly : t.monthly;
    track("schools_order_click", { where: "tier", kind: tier, billing, page: "schools-global", lang });
    const go = () => { window.location.href = `${href("/checkout")}?price=${encodeURIComponent(priceId)}`; };
    promptLogin({ mode: "signup", resumeUrl: `${href("/checkout")}?price=${encodeURIComponent(priceId)}`, onSuccess: go });
  };
  return (
    <div className="sch" dir={landingDir(lang)} lang={lang} style={{ fontFamily: landingFont(lang) }}>
      <style>{SCH_PAGE_CSS + GLOBAL_CSS}</style>
      <header className="sch-top">
        <Link href={href("/")} className="sch-logo" aria-label="Gadit" dir="ltr" translate="no">
          Gad<span>it</span>
        </Link>
        <div className="sch-top-end">
          {schoolId ? (
            <Link href={href("/schools/manage")} className="sch-top-cta" style={{ textDecoration: "none" }}>{C.dashCta}</Link>
          ) : (
            <button type="button" className="sch-top-cta" onClick={() => toPricing("top")}>{C.topCta}</button>
          )}
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
                <button type="button" className="sch-cta" onClick={() => toPricing("hero")}>{C.heroCta}</button>
                <a href="#how" className="sch-ghost">{C.howCta}</a>
              </div>
              <p className="sch-cta-note"><Lines text={fill(C.ctaNote, { from })} /></p>
              <ul className="sch-points">
                {C.heroPoints.map((p) => <li key={p}><Check />{p}</li>)}
              </ul>
            </div>
            <div className="sch-hero-visual">
              <Shot name="stage" priority lang={lang} alt={C.shotAlt} />
            </div>
          </div>
        </section>

        <section className="sch-band sch-white">
          <div className="sch-narrow">
            <h2 className="sch-h2 sch-center">{C.pain.title}</h2>
            <p className="sch-lead sch-center">{C.pain.lead}</p>
            {C.pain.paras.map((p, i) => <p key={i} className="sch-body sch-center"><Lines text={p} /></p>)}
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
                <Shot name={s.img} phone={s.phone} lang={lang} alt={C.shotAlt} />
              </div>
            ))}
          </div>
        </section>

        <section className="sch-band sch-white">
          <div className="sch-narrow">
            <div className="sch-kicker">{C.prep.kicker}</div>
            <h2 className="sch-h2 sch-center">{C.prep.title}</h2>
            <p className="sch-body sch-center"><Lines text={C.prep.body} /></p>
          </div>
        </section>

        {C.tools.map((t, i) => (
          <section key={t.img} className={`sch-band ${i % 2 ? "sch-white" : "sch-tint"}`}>
            <div className={`sch-feature${t.phone ? " is-phone" : ""}${i % 2 ? " is-flipped" : ""}`}>
              <div className="sch-feature-text">
                <div className="sch-kicker sch-start">{t.kicker}</div>
                <h2 className="sch-h2">{t.title}</h2>
                <p className="sch-body"><Lines text={t.body} /></p>
                <ul className="sch-list">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              <div className="sch-feature-visual"><Shot name={t.img} phone={t.phone} lang={lang} alt={C.shotAlt} /></div>
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

        <section className="sch-band sch-tint">
          <div className="sch-narrow">
            <div className="sch-kicker">{C.whoKicker}</div>
            <h2 className="sch-h2 sch-center">{C.whoTitle}</h2>
            <p className="sch-body sch-center"><Lines text={C.whoBody} /></p>
          </div>
        </section>

        <section className="sch-band sch-white">
          <div className="sch-narrow">
            <div className="sch-kicker">{C.trialKicker}</div>
            <h2 className="sch-h2 sch-center">{C.trialTitle}</h2>
            <ul className="sch-safe">{C.trialItems.map((p) => <li key={p}><Check /><span>{p}</span></li>)}</ul>
          </div>
        </section>

        <section className="sch-band sch-tint" id="pricing">
          <div className="sch-kicker">{C.priceKicker}</div>
          <h2 className="sch-h2 sch-center">{C.priceTitle}</h2>
          <p className="sch-body sch-center sch-narrow"><Lines text={C.priceSub} /></p>
          <div className="schg-toggle" role="tablist">
            <button type="button" role="tab" aria-selected={billing === "monthly"} className={billing === "monthly" ? "is-on" : ""} onClick={() => setBilling("monthly")}>{C.billedMonthly}</button>
            <button type="button" role="tab" aria-selected={billing === "yearly"} className={billing === "yearly" ? "is-on" : ""} onClick={() => setBilling("yearly")}>
              {C.billedYearly}<span className="schg-save">{C.yearlySave}</span>
            </button>
          </div>
          <div className="sch-tiers">
            {SCHOOLS_TIER_LIST.map((t) => (
              <div key={t.key} className="sch-tier">
                <div className="sch-tier-label">{fill(C.upTo, { students: t.maxStudents.toLocaleString("en-US") })}</div>
                <div className="sch-tier-price"><span dir="ltr">{billing === "yearly" ? t.usdYearly : t.usdMonthly}</span> <small>{billing === "yearly" ? C.perYear : C.perMonth}</small></div>
                <div className="sch-tier-year">{billing === "yearly" ? fill(C.yearlyPerMonth, { price: t.usdYearlyPerMonth }) : " "}</div>
                <button type="button" className="sch-cta schg-tier-cta" onClick={() => startTier(t.key)}>{C.tierCta}</button>
              </div>
            ))}
          </div>
          <div className="sch-includes">
            <div className="sch-includes-title">{C.includesTitle}</div>
            <ul>{C.includes.map((p) => <li key={p}><Check />{p}</li>)}</ul>
          </div>
          <p className="sch-larger"><Lines text={C.larger} /> <Link href={href("/contact")} className="schg-contact">{C.contactLink}</Link></p>
        </section>

        <section className="sch-band sch-white">
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
          <button type="button" className="sch-cta" onClick={() => toPricing("final")}>{C.finalCta}</button>
        </section>
      </main>
      <footer style={{ textAlign: "center", padding: "26px 16px 34px", fontSize: 13.5, color: "#6B7A80" }}>
        <a href={href("/terms")} style={{ color: "inherit" }}>{C.terms}</a>
        <span style={{ margin: "0 10px" }}>·</span>
        <a href={href("/privacy")} style={{ color: "inherit" }}>{C.privacy}</a>
        <span style={{ margin: "0 10px" }}>·</span>
        <span dir="ltr">© Gadit 2026</span>
      </footer>
    </div>
  );
}

const GLOBAL_CSS = `
/* A long language name (українська, Tshivenḓa) must not push the bar past a phone screen (2026-10-17). */
@media (max-width: 480px) { .sch .sch-top-lang button[aria-haspopup] > span { display: none; } }
.schg-toggle { display: flex; justify-content: center; gap: 6px; margin: 22px auto 0; background: #fff; border-radius: 999px; padding: 5px; width: max-content; max-width: 100%; box-shadow: var(--soft); }
.schg-toggle button { font: inherit; font-weight: 700; font-size: 15px; border: 0; background: none; color: var(--body); padding: 9px 20px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
.schg-toggle button.is-on { background: var(--teal); color: #fff; }
.schg-save { font-size: 12px; font-weight: 800; background: #FEF3C7; color: #92400E; border-radius: 999px; padding: 2px 8px; }
.schg-tier-cta { width: 100%; margin-top: 18px; font-size: 16px; padding: 13px 18px; }
.schg-contact { color: var(--teal-d); font-weight: 700; }
`;
