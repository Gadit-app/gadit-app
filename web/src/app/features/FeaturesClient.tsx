"use client";

/**
 * /features — landing page that shows everything Gadit does.
 * Same CrispTech shell as / and /pricing. The page walks the
 * visitor through the seven feature blocks (one per row), each
 * paired with the tier badge that unlocks it.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { useAuth } from "@/lib/auth-context";

const LANGS = [
  { code: "he", label: "עברית" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "cs", label: "Čeština" },
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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
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
      <button type="button" className="wb-lang-chip" onClick={() => setOpen((v) => !v)}>
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
              <button type="button" className={l.code === lang ? "is-active" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Tier = "basic" | "clear" | "deep";

interface Feature {
  id: string;
  title: string;
  body: string;
  tier: Tier;
  icon: "definitions" | "examples" | "idioms" | "origin" | "notebook" | "image" | "kids" | "compose" | "quiz" | "compare";
}

const COPY: Record<string, {
  heroTitle: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  signin: string;
  pricing: string;
  search: string;
  features: string;
  tierLabel: { basic: string; clear: string; deep: string };
  list: Feature[];
}> = {
  he: {
    heroTitle: "מה Gadit נותן לכם:",
    heroSub: "",
    ctaPrimary: "נסו עכשיו חינם",
    ctaSecondary: "",
    signin: "התחברות", pricing: "תמחור", search: "חיפוש", features: "פיצ'רים",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "כל ההגדרות למילה",                              body: "" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "דוגמאות של משפטים לפי הקשר",                  body: "" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "ניבים וצירופי מילים",                          body: "" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "מקור המילה",                                    body: "" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "הסבר לילדים",                                   body: "" },
      { id: "image",       icon: "image",       tier: "clear", title: "המחשת המילה בתמונה",                          body: "" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "מחברת מילים אישית",                            body: "" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "חיבור משפט עם המילה וקבלת משוב",            body: "" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "חידונים מותאמים אישית",                       body: "" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "משחקי מילים",                                  body: "" },
    ],
  },
  en: {
    heroTitle: "What Gadit gives you:",
    heroSub: "",
    ctaPrimary: "Try it now",
    ctaSecondary: "See pricing",
    signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Every definition of the word",          body: "" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Sentence examples by context",         body: "" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idioms & expressions",                 body: "" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Word origin",                          body: "" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Kids' explanation",                    body: "" },
      { id: "image",       icon: "image",       tier: "clear", title: "Word illustrated as an image",         body: "" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Personal word notebook",               body: "" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Compose a sentence and get feedback",  body: "" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalized quizzes",                 body: "" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Word games",                           body: "" },
    ],
  },
  de: {
    heroTitle: "Was Gadit dir bietet:",
    heroSub: "",
    ctaPrimary: "Jetzt kostenlos testen",
    ctaSecondary: "Preise ansehen",
    signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Jede Definition des Wortes",            body: "" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Beispielsätze im Kontext",              body: "" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Redewendungen & Ausdrücke",             body: "" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Wortursprung",                          body: "" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Erklärung für Kinder",                  body: "" },
      { id: "image",       icon: "image",       tier: "clear", title: "Wort als Bild dargestellt",             body: "" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Persönliches Wörter-Notizbuch",         body: "" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Satz schreiben und Feedback erhalten",  body: "" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalisierte Quizze",                body: "" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Wortspiele",                            body: "" },
    ],
  },
  cs: {
    heroTitle: "Co ti Gadit dává:",
    heroSub: "",
    ctaPrimary: "Vyzkoušej zdarma",
    ctaSecondary: "Ceník",
    signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Každá definice slova",                  body: "" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Příklady vět podle kontextu",           body: "" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idiomy a slovní spojení",               body: "" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Původ slova",                           body: "" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Vysvětlení pro děti",                   body: "" },
      { id: "image",       icon: "image",       tier: "clear", title: "Slovo znázorněné obrázkem",             body: "" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Osobní sešit slov",                     body: "" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Napiš větu a získej zpětnou vazbu",     body: "" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalizované kvízy",                 body: "" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Slovní hry",                            body: "" },
    ],
  },
};

function FeatureIcon({ name, color }: { name: Feature["icon"]; color: string }) {
  // Crisper, more geometric icon set (lucide-inspired). 1.75 stroke
  // keeps the lines clearly visible at 38-48px without looking heavy,
  // square caps + miter joins replace the previous rounded "sketchy"
  // feel with something more precise + modern.
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "definitions": return <svg {...common}><path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /></svg>;
    case "examples":    return <svg {...common}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /><circle cx="3" cy="6" r="0.6" fill={color} stroke="none" /><circle cx="3" cy="12" r="0.6" fill={color} stroke="none" /><circle cx="3" cy="18" r="0.6" fill={color} stroke="none" /></svg>;
    case "idioms":      return <svg {...common}><path d="M21 12a8 8 0 1 1-2.5-5.8L21 5v4h-4" /><path d="M9 13h.01M12 13h.01M15 13h.01" /></svg>;
    case "origin":      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" /></svg>;
    case "notebook":    return <svg {...common}><path d="M6 4h12a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><path d="M9 4v17" /><path d="M12 9h4M12 13h4" /></svg>;
    case "image":       return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 16-4-4-8 8" /></svg>;
    case "kids":        return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" /></svg>;
    case "compose":     return <svg {...common}><path d="M14 4l6 6L8 22H2v-6z" /><path d="M13 5l6 6" /></svg>;
    case "quiz":        return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.5 1-1.5 2.2" /><circle cx="12" cy="17" r="0.7" fill={color} stroke="none" /></svg>;
    case "compare":     return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>;
  }
}

const TIER_COLOR: Record<Tier, { fg: string; bg: string }> = {
  basic: { fg: "var(--basic-fg)",  bg: "var(--basic-bg)" },
  clear: { fg: "var(--teal-edge)", bg: "var(--teal-soft)" },
  deep:  { fg: "var(--deep-fg)",   bg: "var(--deep-bg)" },
};

export function FeaturesPage() {
  const { lang, dir, setLang } = useLang();
  const { user, plan, promptLogin } = useAuth();
  const c = COPY[lang] ?? COPY.en;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (burgerRef.current?.contains(target)) return;
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setMenuOpen(false); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href="/" className="wb-shell-navlink wb-shell-navlink-icon" aria-label={c.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href="/features" className="wb-shell-navlink is-active">{c.features}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href="/notebook" className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          <Link href="/pricing" className="wb-shell-navlink">{c.pricing}</Link>
        </nav>
        <div className="wb-shell-actions">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
          <LangSwitch />
          {user ? (
            <Link href="/account" className="wb-avatar" aria-label="Account">
              {user.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.photoURL} alt="" />
              ) : (
                <span>{(user.email?.[0] || "G").toUpperCase()}</span>
              )}
            </Link>
          ) : (
            <button type="button" className="wb-shell-link" onClick={() => promptLogin({ mode: "signin" })}>
              {c.signin}
            </button>
          )}
        </div>
        <div className="wb-shell-share-mobile-wrap">
          <ShareButton
            url="https://www.gadit.app/"
            title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
            text=""
            shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
            copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
          />
        </div>
                <button
          ref={burgerRef}
          type="button"
          className="wb-shell-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        {menuOpen && (
          <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
            <Link href="/" className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.search}
            </Link>
            <Link href="/features" className="wb-shell-mobile-link is-active" onClick={() => setMenuOpen(false)}>
              {c.features}
            </Link>
            <Link href="/pricing" className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.pricing}
            </Link>
            <div className="wb-shell-mobile-menu-sep" />
            <div className="wb-shell-mobile-langs">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={l.code === lang ? "is-active" : ""}
                  onClick={() => { setLang(l.code); setMenuOpen(false); }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="wb-shell-mobile-menu-sep" />
            {user ? (
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                {(user.email?.[0] || "G").toUpperCase()} · {user.email ?? "Account"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => { setMenuOpen(false); promptLogin({ mode: "signin" }); }}
              >
                {c.signin}
              </button>
            )}
          </div>
        )}
      </header>

      <main className="wb-features-main">
        <div className="wb-features-hero">
          <div className="wb-features-logo">
            Gad<span className="wb-features-logo-it">it</span>
          </div>
          <h1 className="wb-features-title">{c.heroTitle}</h1>
        </div>

        <div className="wb-features-grid">
          {c.list.map((f) => {
            const t = TIER_COLOR[f.tier];
            return (
              <article key={f.id} className={`wb-feature-card wb-feature-card-${f.tier}`}>
                <div className="wb-feature-illust" style={{ background: t.bg, color: t.fg }}>
                  <FeatureIcon name={f.icon} color={t.fg} />
                </div>
                <h3 className="wb-feature-title">{f.title}</h3>
                <span className={`wb-tier-pill wb-tier-pill-${f.tier}`}>{c.tierLabel[f.tier]}</span>
              </article>
            );
          })}
        </div>

        <div className="wb-features-cta-bottom">
          <Link href="/" className="wb-features-cta-primary">{c.ctaPrimary}</Link>
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
