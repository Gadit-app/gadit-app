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
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";
import { GaditDemoAnimation } from "@/components/design/GaditDemoAnimation";

const LANGS = [
  { code: "he", label: "עברית", flag: "il" },
  { code: "en", label: "English", flag: "gb" },
  { code: "ar", label: "العربية", flag: "sa" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "es", label: "Español", flag: "es" },
  { code: "pt", label: "Português", flag: "pt" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "cs", label: "Čeština", flag: "cz" },
  { code: "sk", label: "Slovenčina", flag: "sk" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "ja", label: "日本語", flag: "jp" },
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
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
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
  heroEyebrow: string;
  heroTitle: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  signin: string;
  pricing: string;
  search: string;
  features: string;
  sectionLabel: string;
  finalCtaTitle: string;
  finalCtaSub: string;
  finalCtaBtn: string;
  tierLabel: { basic: string; clear: string; deep: string };
  list: Feature[];
}> = {
  he: {
    heroEyebrow: "פיצ'רים",
    heroTitle: "סוף סוף מילון שלא עוצר בהגדרה.",
    heroSub: "Gadit מבין כל מילה עד הסוף. כל המשמעויות, דוגמאות בהקשר, ניבים, מקור היסטורי ותרגול. עד שהמילה באמת ברורה. אנחנו קוראים לזה לעשות GAD למילה.",
    ctaPrimary: "התחילו חינם",
    ctaSecondary: "צפו בתמחור",
    signin: "התחברות", pricing: "תמחור", search: "חיפוש", features: "פיצ'רים",
    sectionLabel: "מה תקבלו",
    finalCtaTitle: "מוכנים לנסות?",
    finalCtaSub: "התחילו עם Basic לגמרי חינם. שדרוג בשבריר שניה, רק כשתרצו לראות יותר.",
    finalCtaBtn: "התחילו עכשיו",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "כל ההגדרות למילה",                  body: "כל המשמעויות של המילה, גם הנדירות, מסודרות לפי שכיחות שימוש." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "דוגמאות לפי הקשר",                  body: "שלושה משפטים לכל משמעות, כדי שתראו איך המילה חיה בתוך משפט אמיתי." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "ניבים וצירופי מילים",               body: "ביטויים שהמילה חלק מהם, יחד עם פירוש הביטוי כולו." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "מקור המילה",                        body: "מאיזו שפה הגיעה המילה, ומה היא במקור הייתה." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "הסבר לילדים",                       body: "הסבר פשוט וברור, בשפה שילד יבין בלי מונחים מסובכים." },
      { id: "image",       icon: "image",       tier: "clear", title: "המילה כתמונה",                     body: "תמונה ייחודית לכל מילה, לפי המשמעות המדויקת שאתם קוראים." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "מחברת מילים אישית",                 body: "שמרו מילים שאתם רוצים לזכור. זמינות גם בלי חיבור לאינטרנט." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "כתבו משפט וקבלו משוב",             body: "כתבו משפט משלכם עם המילה, וקבלו תיקון ומשוב מיידי." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "חידונים מותאמים אישית",             body: "חידון יומי על המילים שלמדתם, כדי שהן יישארו אצלכם לזמן ארוך." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "משחקי מילים",                       body: "משחקים שבונים אוצר מילים: שיוך, ניחוש, יצירת קשרים בין מילים." },
    ],
  },
  en: {
    heroEyebrow: "Features",
    heroTitle: "A dictionary that doesn't stop at the definition.",
    heroSub: "Gadit understands a word all the way through. Every meaning, real sentences in context, idioms, origin and practice. Until the word actually clicks. That's what we call GAD-ing a word.",
    ctaPrimary: "Start free",
    ctaSecondary: "See pricing",
    signin: "Sign in", pricing: "Pricing", search: "Search", features: "Features",
    sectionLabel: "What you get",
    finalCtaTitle: "Ready to try it?",
    finalCtaSub: "Start with Basic, completely free. Upgrade in a tap, only when you want more.",
    finalCtaBtn: "Start now",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Every definition",                 body: "All meanings of the word, even the rare ones, ordered by how often they're used." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Real sentences in context",        body: "Three real sentences per meaning, so the context lands immediately." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idioms and expressions",           body: "Every expression the word is part of, with the full meaning of the phrase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Where the word came from",         body: "The language the word started in, and what it originally meant." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Kids' explanation",                body: "A clear, simple version a child can read without any jargon." },
      { id: "image",       icon: "image",       tier: "clear", title: "The word as an image",             body: "A unique image for the word, matched to the exact meaning you're reading." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Personal word notebook",           body: "Save the words you want to remember. Available even without internet." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Write a sentence, get feedback",   body: "Compose your own sentence with the word and get instant correction and feedback." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalized quizzes",             body: "A daily quiz on the words you learned, so they stay with you for the long run." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Word games",                       body: "Games that grow your vocabulary: matching, guessing, building connections between words." },
    ],
  },
  de: {
    heroEyebrow: "Funktionen",
    heroTitle: "Was ein Wörterbuch längst tun sollte.",
    heroSub: "Gadit versteht ein Wort bis zum Ende. Nicht nur eine Definition. Jede Bedeutung, echte Beispielsätze im Kontext, Redewendungen, Herkunft und alles, was ein normales Wörterbuch nie zeigen konnte.",
    ctaPrimary: "Kostenlos starten",
    ctaSecondary: "Preise ansehen",
    signin: "Anmelden", pricing: "Preise", search: "Suche", features: "Funktionen",
    sectionLabel: "Das bekommst du",
    finalCtaTitle: "Bereit, es zu testen?",
    finalCtaSub: "Beginne mit Basic, völlig kostenlos. Upgrade in einem Tipp, sobald du mehr willst.",
    finalCtaBtn: "Jetzt starten",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Jede Definition",                   body: "Alle Bedeutungen eines Wortes, auch die seltenen, geordnet nach Häufigkeit." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Echte Sätze im Kontext",            body: "Drei echte Beispielsätze pro Bedeutung, damit der Kontext sofort sitzt." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Redewendungen und Ausdrücke",       body: "Jeder Ausdruck, in dem das Wort vorkommt, samt vollständiger Bedeutung der Phrase." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Woher das Wort stammt",             body: "Die Ursprungssprache des Wortes und seine ursprüngliche Bedeutung." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Erklärung für Kinder",              body: "Eine klare, einfache Version, die ein Kind ohne Fachjargon lesen kann." },
      { id: "image",       icon: "image",       tier: "clear", title: "Das Wort als Bild",                 body: "Ein einzigartiges KI-Bild zum Wort, generiert aus Bedeutung und Kontext." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Persönliches Wörter-Notizbuch",     body: "Speichere Wörter, die du dir merken willst. Auch ohne Internet verfügbar." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Satz schreiben, Feedback erhalten", body: "Schreibe deinen eigenen Satz mit dem Wort und erhalte sofort Korrektur und Feedback." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalisierte Quizze",            body: "Ein tägliches Quiz zu den Wörtern, die du gelernt hast, damit sie bleiben." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Wortspiele",                        body: "Spiele, die deinen Wortschatz aufbauen: Zuordnen, Raten, Verbindungen knüpfen." },
    ],
  },
  cs: {
    heroEyebrow: "Funkce",
    heroTitle: "Co měl slovník dělat odjakživa.",
    heroSub: "Gadit rozumí slovu úplně. Ne jen jedna definice a hotovo. Každý význam, skutečné věty v kontextu, idiomy, původ a to, co běžný slovník nikdy neuměl ukázat.",
    ctaPrimary: "Začni zdarma",
    ctaSecondary: "Zobrazit ceník",
    signin: "Přihlásit se", pricing: "Ceník", search: "Hledat", features: "Funkce",
    sectionLabel: "Co získáš",
    finalCtaTitle: "Připraven to zkusit?",
    finalCtaSub: "Začni s Basicem úplně zdarma. Upgrade jediným ťuknutím, jakmile budeš chtít víc.",
    finalCtaBtn: "Začni teď",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Každá definice",                     body: "Všechny významy slova, i ty vzácné, seřazené podle frekvence použití." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Skutečné věty v kontextu",           body: "Tři skutečné věty pro každý význam, abys kontext pochopil hned." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idiomy a slovní spojení",            body: "Každý výraz, v němž se slovo vyskytuje, i s plným významem celé fráze." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Odkud slovo pochází",                body: "Z jakého jazyka slovo přišlo a co původně znamenalo." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Vysvětlení pro děti",                body: "Jasná, jednoduchá verze, kterou dítě přečte bez složitých pojmů." },
      { id: "image",       icon: "image",       tier: "clear", title: "Slovo jako obrázek",                 body: "Jedinečný obrázek od AI ke slovu, vytvořený podle jeho významu a kontextu." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Osobní sešit slov",                  body: "Ulož si slova, která si chceš zapamatovat. Dostupné i bez internetu." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Napiš větu, dostaň zpětnou vazbu",   body: "Sestav vlastní větu se slovem a okamžitě dostaň opravu a zpětnou vazbu." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalizované kvízy",              body: "Denní kvíz na slova, která ses naučil, aby ti zůstala nadlouho." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Slovní hry",                         body: "Hry, které rozšiřují slovní zásobu: přiřazování, hádání, propojování slov." },
    ],
  },
  sk: {
    heroEyebrow: "Funkcie",
    heroTitle: "Čo mal slovník robiť odjakživa.",
    heroSub: "Gadit rozumie slovu úplne. Nielen jedna definícia a hotovo. Každý význam, skutočné vety v kontexte, idiómy, pôvod a to, čo bežný slovník nikdy nevedel ukázať.",
    ctaPrimary: "Začni zadarmo",
    ctaSecondary: "Zobraziť cenník",
    signin: "Prihlásiť sa", pricing: "Cenník", search: "Hľadať", features: "Funkcie",
    sectionLabel: "Čo získaš",
    finalCtaTitle: "Pripravený to vyskúšať?",
    finalCtaSub: "Začni s Basicom úplne zadarmo. Upgrade jediným klikom, len čo budeš chcieť viac.",
    finalCtaBtn: "Začni teraz",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "Každá definícia",                    body: "Všetky významy slova, aj tie vzácne, zoradené podľa frekvencie použitia." },
      { id: "examples",    icon: "examples",    tier: "basic", title: "Skutočné vety v kontexte",           body: "Tri skutočné vety pre každý význam, aby si kontext pochopil hneď." },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "Idiómy a slovné spojenia",           body: "Každý výraz, v ktorom sa slovo vyskytuje, aj s plným významom celej frázy." },
      { id: "origin",      icon: "origin",      tier: "basic", title: "Odkiaľ slovo pochádza",              body: "Z akého jazyka slovo prišlo a čo pôvodne znamenalo." },
      { id: "kids",        icon: "kids",        tier: "clear", title: "Vysvetlenie pre deti",               body: "Jasná, jednoduchá verzia, ktorú dieťa prečíta bez zložitých pojmov." },
      { id: "image",       icon: "image",       tier: "clear", title: "Slovo ako obrázok",                  body: "Jedinečný obrázok od AI ku slovu, vytvorený podľa jeho významu a kontextu." },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "Osobný zošit slov",                  body: "Ulož si slová, ktoré si chceš zapamätať. Dostupné aj bez internetu." },
      { id: "compose",     icon: "compose",     tier: "clear", title: "Napíš vetu, dostaň spätnú väzbu",    body: "Zostav vlastnú vetu so slovom a okamžite dostaň opravu a spätnú väzbu." },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "Personalizované kvízy",              body: "Denný kvíz na slová, ktoré si sa naučil, aby ti zostali nadlho." },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "Slovné hry",                         body: "Hry, ktoré rozširujú slovnú zásobu: priraďovanie, hádanie, prepájanie slov." },
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
  const href = useHref();
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
        <Link href={href("/")} className="wb-wordmark" dir="ltr">
          Gad<span className="wb-wordmark-it">it</span>
        </Link>
        <nav className="wb-shell-nav">
          <Link href={href("/")} className="wb-shell-navlink wb-shell-navlink-icon" aria-label={c.search}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" />
            </svg>
          </Link>
          <Link href={href("/features")} className="wb-shell-navlink is-active">{c.features}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink">{c.pricing}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/affiliates")} className="wb-shell-navlink">{v2(lang, "navAffiliates")}</Link>
          )}
        </nav>
        <div className="wb-shell-actions">
          {user && (
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
          )}
          <LangSwitch />
          {user ? (
            <WbUserMenu />
          ) : (
            <>
              <StartFreeCTA />
              <button type="button" className="wb-shell-link" onClick={() => promptLogin({ mode: "signin" })}>
                {c.signin}
              </button>
            </>
          )}
        </div>
        <div className="wb-shell-mobile-cta">
          <StartFreeCTA />
        </div>
        {/* Mobile identity cluster — 2026-06-19 redesign. */}
        {user && (
          <div className="wb-shell-mobile-identity">
            <ShareButton
              url="https://www.gadit.app/"
              title={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).title}
              text=""
              shareLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).shareLabel}
              copiedLabel={(APP_SHARE_COPY[lang] ?? APP_SHARE_COPY.en).copiedLabel}
            />
            <WbUserMenu />
          </div>
        )}
        <div className="wb-shell-mobile-menu-cluster">
        <LangSwitchMobile />
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
        </div>
        {menuOpen && (
          <div ref={menuRef} className="wb-shell-mobile-menu" role="menu">
            <Link href={href("/")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.search}
            </Link>
            <Link href={href("/features")} className="wb-shell-mobile-link is-active" onClick={() => setMenuOpen(false)}>
              {c.features}
            </Link>
            <Link href={href("/pricing")} className="wb-shell-mobile-link" onClick={() => setMenuOpen(false)}>
              {c.pricing}
            </Link>
            <div className="wb-shell-mobile-menu-sep" />
            {user ? (
              <Link href={href("/account")} onClick={() => setMenuOpen(false)}>
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

      <main className="wb-feat-main">
        {/* Hero — eyebrow + Lora-italic display + supporting text + two
            CTAs. Generous top spacing so the headline gets vertical room
            to breathe; the eye should land on it first, not the nav. */}
        <section className="wb-feat-hero">
          <div className="wb-feat-eyebrow">{c.heroEyebrow}</div>
          <h1 className="wb-feat-display">{c.heroTitle}</h1>
          <p className="wb-feat-lede">{c.heroSub}</p>
          <div className="wb-feat-cta-row">
            <Link href={href("/")} className="wb-feat-cta-primary">{c.ctaPrimary}</Link>
            <Link href={href("/pricing")} className="wb-feat-cta-ghost">{c.ctaSecondary}</Link>
          </div>
        </section>

        {/* Auto-cycling demo tour — walks the visitor through what each
            tier unlocks plus the partner program. See
            GaditDemoAnimation.tsx for the scene state machine. */}
        <GaditDemoAnimation />

        {/* Bento grid — first card spans two columns on desktop so the
            'every definition' feature (the product's core promise) lands
            as the heaviest visual weight. Other features sit at equal
            weight in single-column cards. Stagger animation on initial
            load, gated by prefers-reduced-motion. */}
        <section className="wb-feat-section">
          <div className="wb-feat-section-label">{c.sectionLabel}</div>
          <div className="wb-feat-bento">
            {c.list.map((f, i) => {
              const t = TIER_COLOR[f.tier];
              return (
                <article
                  key={f.id}
                  className={`wb-feat-card${i === 0 ? " is-featured" : ""}`}
                  style={{ ["--wb-stagger" as string]: `${i * 45}ms` }}
                >
                  <div className="wb-feat-card-head">
                    <div className="wb-feat-card-icon" style={{ background: t.bg, color: t.fg }}>
                      <FeatureIcon name={f.icon} color={t.fg} />
                    </div>
                    <span className={`wb-feat-tier-chip wb-feat-tier-chip-${f.tier}`}>{c.tierLabel[f.tier]}</span>
                  </div>
                  <h3 className="wb-feat-card-title">{f.title}</h3>
                  {f.body && <p className="wb-feat-card-body">{f.body}</p>}
                </article>
              );
            })}
          </div>
        </section>

        {/* Final CTA — single full-width card that recaps the value
            proposition in one sentence and gives one big primary action.
            No competing secondary link here; the page's whole job has
            been to make the user want to click this. */}
        <section className="wb-feat-final">
          <h2 className="wb-feat-final-title">{c.finalCtaTitle}</h2>
          <p className="wb-feat-final-sub">{c.finalCtaSub}</p>
          <Link href={href("/")} className="wb-feat-final-btn">{c.finalCtaBtn}</Link>
        </section>
      </main>

      <GadVerbStamp />

      <footer className="wb-home-footer">
        <span>© 2026 Gadit</span>
        <span>·</span>
        <Link href={href("/")}>{lang === "he" ? "בית" : "Home"}</Link>
        <span>·</span>
        <Link href={href("/privacy")}>Privacy</Link>
        <span>·</span>
        <Link href={href("/terms")}>Terms</Link>
      </footer>
    </div>
  );
}
