"use client";

/**
 * PricingPageRoute — CrispTech pricing screen for the launch.
 *
 * 3 tier cards, each painted in its tier colour:
 *   Basic  = neutral gray   (free)
 *   Clear  = teal #0EA5A5   (mid)
 *   Deep   = purple #7C3AED (premium)
 *
 * Shares the wordbook palette + masthead with / and /word so the
 * whole product reads as one design system.
 *
 * Stripe checkout flow is unchanged: anonymous → promptLogin (signup);
 * signed-in → POST /api/create-checkout → Stripe-hosted Checkout.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";

type Billing = "monthly" | "yearly";

const PRICE_CLEAR_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const PRICE_CLEAR_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY  ?? "";
const PRICE_DEEP_MONTHLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY  ?? "";
const PRICE_DEEP_YEARLY   = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY   ?? "";

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
] as const;

function LangSwitch() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div ref={wrapRef} className="wb-lang-chip-wrap">
      <button
        type="button"
        className="wb-lang-chip"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        {active.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="wb-lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? "is-active" : ""}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface TierCardProps {
  id: "basic" | "clear" | "deep";
  name: string;
  price: string;
  period: string;
  subPrice?: string;
  tagline: string;
  features: string[];
  cta: string;
  ctaSub?: string;
  badge?: string;
  onCta: () => void;
}

function TierCard({ id, name, price, period, subPrice, tagline, features, cta, ctaSub, badge, onCta }: TierCardProps) {
  return (
    <div className={`wb-tier-card wb-tier-${id}`}>
      {badge && <div className="wb-tier-badge">{badge}</div>}
      <div className="wb-tier-name">{name}</div>
      <div className="wb-tier-tagline">{tagline}</div>
      <div className="wb-tier-price-row">
        <span className="wb-tier-price">{price}</span>
        {period && <span className="wb-tier-period">{period}</span>}
      </div>
      <div className="wb-tier-subprice">{subPrice ?? " "}</div>
      <button type="button" className="wb-tier-cta" onClick={onCta}>
        {cta}
      </button>
      {ctaSub && <div className="wb-tier-cta-sub">{ctaSub}</div>}
      <div className="wb-tier-sep" />
      <ul className="wb-tier-features">
        {features.map((f, i) => (
          <li key={i}>
            <span className="wb-tier-check"><CheckIcon /></span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const COPY: Record<string, {
  heroTitle: string;
  heroSub: string;
  monthly: string;
  yearly: string;
  save: string;
  signin: string;
  pricing: string;
  search: string;
  tierBasic: { name: string; tagline: string; cta: string; features: string[] };
  tierClear: { name: string; tagline: string; cta: string; badge: string; features: string[] };
  tierDeep:  { name: string; tagline: string; cta: string; features: string[] };
  mo: string; yr: string;
  freeForever: string;
  saveTrustBasic?: string;
  trustClear?: string;
}> = {
  he: {
    heroTitle: "התחילו חינם",
    heroSub: "שדרגו כשתרצו להעמיק.",
    monthly: "חודשי", yearly: "שנתי",
    save: "חיסכון 17%",
    signin: "התחברות",
    pricing: "תמחור",
    search: "חיפוש",
    mo: "/חודש", yr: "/שנה",
    freeForever: "חינם לתמיד",
    tierBasic: {
      name: "Basic",
      tagline: "להתחיל ולהבין מילים.",
      cta: "התחילו חינם",
      features: [
        "20 חיפושי מילים ליום",
        "כל המשמעויות (לא רק העיקרית)",
        "3 דוגמאות לכל משמעות",
        "מקור המילה ורקע היסטורי",
        "מחברת אישית",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: "להבין באמת — תמונה, ילדים, ניבים.",
      cta: "נסו 14 יום חינם",
      badge: "הכי פופולרי",
      features: [
        "כל מה שיש ב-Basic",
        "חיפושים ללא הגבלה",
        "תמונה חיה לכל מילה",
        "הסבר לילדים",
        "חברו משפט עם משוב",
        "ניבים וצירופי מילים",
        "היסטוריית חיפוש מלאה",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: "להעמיק — חידון, השוואה, תרגול.",
      cta: "התחילו עם Deep",
      features: [
        "כל מה שיש ב-Clear",
        "חידון מותאם אישית",
        "השוואת מילים דומות",
        "תרגול ולמידה לטווח ארוך",
        "מחברת חכמה למילים דומות",
        "ייצוא תוכן",
      ],
    },
  },
  en: {
    heroTitle: "Start free.",
    heroSub: "Upgrade only when you want depth.",
    monthly: "Monthly", yearly: "Yearly",
    save: "Save 17%",
    signin: "Sign in",
    pricing: "Pricing",
    search: "Search",
    mo: "/mo", yr: "/yr",
    freeForever: "Free forever",
    tierBasic: {
      name: "Basic",
      tagline: "Get started, understand words.",
      cta: "Start now",
      features: [
        "20 word searches per day",
        "All meanings (not just the primary)",
        "3 examples per meaning",
        "Word origin & history",
        "Personal notebook",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: "Really understand — image, kids, idioms.",
      cta: "Try 14 days free",
      badge: "Most popular",
      features: [
        "Everything in Basic",
        "Unlimited searches",
        "AI-generated image per word",
        "Kids' explanation",
        "Compose-a-sentence with feedback",
        "Idioms & expressions",
        "Full search history",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: "Go deeper — quiz, compare, practice.",
      cta: "Start with Deep",
      features: [
        "Everything in Clear",
        "Personalized quizzes",
        "Compare similar words",
        "Long-term practice & retention",
        "Smart notebook for related words",
        "Export content",
      ],
    },
  },
};

export function PricingPageRoute() {
  const { lang, dir } = useLang();
  const { user, promptLogin } = useAuth();
  const [billing, setBilling] = useState<Billing>("monthly");
  const c = COPY[lang] ?? COPY.en;

  async function startCheckout(priceId: string, freshUser: { getIdToken: () => Promise<string> }) {
    if (!priceId) {
      console.error("Missing Stripe priceId");
      window.alert("Pricing is misconfigured. Please contact support.");
      return;
    }
    try {
      const idToken = await freshUser.getIdToken();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (data.url) { window.location.href = data.url; return; }
      if (res.status === 403 && data.error === "email_not_verified") {
        window.alert(lang === "he" ? "אנא אמתו את כתובת המייל. שלחנו לכם לינק אימות בהרשמה." : "Please verify your email before subscribing.");
        return;
      }
      window.alert(lang === "he" ? "לא הצלחנו לפתוח את הצ'קאאוט. נסו שוב." : "Could not open checkout. Please try again.");
    } catch (e) {
      console.error("Checkout error:", e);
    }
  }

  function clickBasic() {
    promptLogin({ mode: "signup", onSuccess: () => { window.location.href = "/"; } });
  }
  function clickClear() {
    const priceId = billing === "yearly" ? PRICE_CLEAR_YEARLY : PRICE_CLEAR_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: (u) => startCheckout(priceId, u) });
  }
  function clickDeep() {
    const priceId = billing === "yearly" ? PRICE_DEEP_YEARLY : PRICE_DEEP_MONTHLY;
    promptLogin({ mode: "signup", onSuccess: (u) => startCheckout(priceId, u) });
  }

  const clearMonthly = "$2.99";
  const clearYearly  = "$29.99";
  const deepMonthly  = "$4.99";
  const deepYearly   = "$49.99";

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href="/" className="wb-shell-navlink">{c.search}</Link>
          <Link href="/pricing" className="wb-shell-navlink is-active">{c.pricing}</Link>
        </nav>
        <div className="wb-shell-actions">
          <LangSwitch />
          {user ? (
            <Link href="/notebook" className="wb-shell-link">{lang === "he" ? "המחברת" : "Notebook"}</Link>
          ) : (
            <button type="button" className="wb-shell-link" onClick={() => promptLogin({ mode: "signin" })}>
              {c.signin}
            </button>
          )}
        </div>
      </header>

      <main className="wb-pricing-main">
        <div className="wb-pricing-hero">
          <h1 className="wb-pricing-title">{c.heroTitle}</h1>
          <p className="wb-pricing-sub">{c.heroSub}</p>
          <div className="wb-pricing-toggle">
            <button
              type="button"
              className={billing === "monthly" ? "is-active" : ""}
              onClick={() => setBilling("monthly")}
            >
              {c.monthly}
            </button>
            <button
              type="button"
              className={billing === "yearly" ? "is-active" : ""}
              onClick={() => setBilling("yearly")}
            >
              {c.yearly}
              <span className="wb-pricing-save">{c.save}</span>
            </button>
          </div>
        </div>

        <div className="wb-pricing-grid">
          <TierCard
            id="basic"
            name={c.tierBasic.name}
            tagline={c.tierBasic.tagline}
            price={"$0"}
            period={""}
            subPrice={c.freeForever}
            features={c.tierBasic.features}
            cta={c.tierBasic.cta}
            onCta={clickBasic}
          />
          <TierCard
            id="clear"
            name={c.tierClear.name}
            tagline={c.tierClear.tagline}
            price={billing === "yearly" ? clearYearly : clearMonthly}
            period={billing === "yearly" ? c.yr : c.mo}
            subPrice={billing === "yearly" ? `≈ $2.49 ${c.mo}` : undefined}
            badge={c.tierClear.badge}
            features={c.tierClear.features}
            cta={c.tierClear.cta}
            onCta={clickClear}
          />
          <TierCard
            id="deep"
            name={c.tierDeep.name}
            tagline={c.tierDeep.tagline}
            price={billing === "yearly" ? deepYearly : deepMonthly}
            period={billing === "yearly" ? c.yr : c.mo}
            subPrice={billing === "yearly" ? `≈ $4.16 ${c.mo}` : undefined}
            features={c.tierDeep.features}
            cta={c.tierDeep.cta}
            onCta={clickDeep}
          />
        </div>
      </main>

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href="/">{lang === "he" ? "בית" : "Home"}</Link>
        <span>·</span>
        <Link href="/privacy">Privacy</Link>
        <span>·</span>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}
