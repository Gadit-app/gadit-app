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
import { useAuth } from "@/lib/auth-context";

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
  icon: "definitions" | "examples" | "idioms" | "origin" | "image" | "kids" | "compose" | "quiz" | "compare";
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
    heroTitle: "להבין מילים\nעד הסוף",
    heroSub: "",
    ctaPrimary: "נסו עכשיו",
    ctaSecondary: "לראות את התמחור",
    signin: "התחברות", pricing: "תמחור", search: "חיפוש", features: "פיצ'רים",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "כל המשמעויות, לא רק הראשית",
        body: "מילה אחת – כל ההגדרות שלה מסודרות זו לצד זו, כולל הקשר (פורמלי, עממי, ספרותי). כל הגדרה ב-card משלה." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "3 דוגמאות חיות לכל הגדרה",
        body: "לא רק 'משפט אחד מתוך מילון'. דוגמאות מהשפה היומיומית שמראות איך המילה באמת חיה בקונטקסט." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "ניבים וצירופים",
        body: "אוסף הביטויים שמשתמשים במילה — לדוגמה 'חלום בהקיץ' — עם הסבר תמציתי לכל אחד." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "מקור המילה",
        body: "מאיזו שפה המילה הגיעה ומה היא הייתה במקור. סיפור היסטורי קצר ברקע." },
      { id: "image",       icon: "image",       tier: "clear", title: "תמונה חיה לכל מילה",
        body: "AI מייצר עבורכם תמונה ייחודית שמתארת את המילה — מעוגן ויזואלי שעוזר לזכור." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "הסבר לילדים",
        body: "אותה מילה, בשפה של ילד בן 8. עם דוגמאות מעולמם." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "חברו משפט וקבלו משוב",
        body: "כתבו משפט משלכם עם המילה. ה-AI יבדוק טון, דקדוק, ויציע שיפורים. כלי תרגול אישי." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "חידון מותאם אישית",
        body: "4 שאלות שמתמקדות במה שעלול לבלבל בדיוק במילה הזאת. תרגול קצר וממוקד." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "השוואת מילים דומות",
        body: "מתי 'חופש' ומתי 'דרור'? כלי שמעמיד שתי מילים זו מול זו ומראה את ההבדל המעשי." },
    ],
  },
  en: {
    heroTitle: "Understand words\nto the end",
    heroSub: "",
    ctaPrimary: "Try it now",
    ctaSecondary: "See pricing",
    signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Every meaning, not just the primary",
        body: "One word — all its meanings laid out side by side, with register tags (formal, colloquial, literary). Each meaning in its own card." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "3 vivid examples per meaning",
        body: "Not stale dictionary citations. Real-world sentences showing how the word actually lives in context." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idioms & expressions",
        body: "A collection of expressions that use the word — with a concise explanation each." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Word origin",
        body: "Which language the word came from and what it originally meant. Short historical background." },
      { id: "image",       icon: "image",       tier: "clear", title: "Vivid image per word",
        body: "AI generates a unique image for the word — a visual anchor that helps you remember." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Kids' explanation",
        body: "Same word, in 8-year-old language. With examples from their world." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Compose a sentence, get feedback",
        body: "Write your own sentence with the word. AI checks tone and grammar, suggests improvements. A personal practice tool." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalized quiz",
        body: "4 questions focused on what's commonly confused about this specific word. Short, targeted practice." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Compare similar words",
        body: "When 'freedom' and when 'liberty'? A tool that puts two words side by side and shows the practical difference." },
    ],
  },
};

function FeatureIcon({ name, color }: { name: Feature["icon"]; color: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "definitions": return <svg {...common}><path d="M3 5.5C3 4.7 3.7 4 4.5 4H11v15H4.5C3.7 19 3 18.3 3 17.5V5.5Z" /><path d="M21 5.5C21 4.7 20.3 4 19.5 4H13v15h6.5C20.3 19 21 18.3 21 17.5V5.5Z" /><path d="M6 8h2.5M6 11h2.5M15.5 8H18M15.5 11H18" /></svg>;
    case "examples":    return <svg {...common}><path d="M5 6h14M5 12h14M5 18h10" /></svg>;
    case "idioms":      return <svg {...common}><path d="M21 11.5a8 8 0 1 1-3.4-6.6L21 4l-1 4" /><path d="M8 13h.01M12 13h.01M16 13h.01" /></svg>;
    case "origin":      return <svg {...common}><path d="M5 5h11a2.5 2.5 0 0 1 2.5 2.5V18a2 2 0 0 1-2 2H7" /><path d="M5 5a2 2 0 0 0-2 2v2h2" /><path d="M7 20a2 2 0 0 1-2-2V9" /><path d="M9 9h6M9 12h6M9 15h4" /></svg>;
    case "image":       return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="8" cy="10" r="1.5" /><path d="M3 16.5l4-3.5 4 3 4-4 6 4" /></svg>;
    case "kids":        return <svg {...common}><circle cx="12" cy="9" r="3.2" /><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>;
    case "compose":     return <svg {...common}><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M14 6l4 4" /></svg>;
    case "quiz":        return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .8-1.5 1.4-1.5 2.5" /><circle cx="12" cy="17.5" r="0.6" fill={color} stroke="none" /></svg>;
    case "compare":     return <svg {...common}><rect x="3" y="5" width="8" height="14" rx="1" /><rect x="13" y="5" width="8" height="14" rx="1" /><path d="M7 9v6M17 9v6" /></svg>;
  }
}

const TIER_COLOR: Record<Tier, { fg: string; bg: string }> = {
  basic: { fg: "var(--ink-faint)", bg: "rgba(11, 15, 25, 0.06)" },
  clear: { fg: "var(--teal-edge)", bg: "var(--teal-soft)" },
  deep:  { fg: "var(--deep-fg)",   bg: "var(--deep-bg)" },
};

export function FeaturesPage() {
  const { lang, dir } = useLang();
  const { user, promptLogin } = useAuth();
  const c = COPY[lang] ?? COPY.en;

  return (
    <div className="wordbook wb-shell-page" dir={dir}>
      <header className="wb-shell-topbar">
        <Link href="/" className="wb-wordmark">
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
          <Link href="/pricing" className="wb-shell-navlink">{c.pricing}</Link>
        </nav>
        <div className="wb-shell-actions">
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
      </header>

      <main className="wb-features-main">
        <div className="wb-features-hero">
          <div className="wb-features-logo">
            Gad<span className="wb-features-logo-it">it</span>
          </div>
          <h1 className="wb-features-title">{c.heroTitle}</h1>
          <div className="wb-features-cta-row">
            <Link href="/" className="wb-features-cta-primary">{c.ctaPrimary}</Link>
            <Link href="/pricing" className="wb-features-cta-secondary">{c.ctaSecondary}</Link>
          </div>
        </div>

        <div className="wb-features-grid">
          {c.list.map((f) => {
            const t = TIER_COLOR[f.tier];
            return (
              <article key={f.id} className="wb-feature-card">
                <div className="wb-feature-icon" style={{ background: t.bg, color: t.fg }}>
                  <FeatureIcon name={f.icon} color={t.fg} />
                </div>
                <div className="wb-feature-body">
                  <div className="wb-feature-head">
                    <h3 className="wb-feature-title">{f.title}</h3>
                    <span className={`wb-tier-pill wb-tier-pill-${f.tier}`}>{c.tierLabel[f.tier]}</span>
                  </div>
                  <p className="wb-feature-text">{f.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="wb-features-cta-bottom">
          <Link href="/" className="wb-features-cta-primary">{c.ctaPrimary}</Link>
          <Link href="/pricing" className="wb-features-cta-secondary">{c.ctaSecondary}</Link>
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
