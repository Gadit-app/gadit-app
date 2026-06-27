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
  { code: "hi", label: "हिन्दी", flag: "in" },
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

type Tier = "basic" | "clear" | "deep" | "family";

type FeatureIconName =
  | "definitions" | "examples" | "idioms" | "origin"
  | "notebook" | "image" | "kids" | "compose"
  | "quiz" | "compare"
  | "profile" | "qr" | "dashboard" | "people";

interface Feature {
  id: string;
  title: string;
  body: string;
  tier: Tier;
  icon: FeatureIconName;
}

/**
 * Gadi 2026-06-26 transformation: the page used to be a flat 10-card
 * bento (a feature list). Now it tells a story.
 *
 *   1. Hero (problem the visitor recognizes)
 *   2. Demo animation (carries through from before)
 *   3. Three GROUPED feature sections that mirror the user's journey:
 *      Understand -> Learn -> Master. Tier color also walks the
 *      Basic -> Clear -> Deep ladder, so the visual hierarchy IS the
 *      pricing tie-back.
 *   4. Tier tie-back micro-section that names what each tier adds.
 *   5. Final CTA with the "Now I gad it!" character.
 *
 * Adding new fields to all 12 languages would explode this file; we
 * keep proper HE + EN translations and fall back to EN for the other
 * 10 langs (whose existing 10-feature list still works as before -
 * only the page-shell copy switches).
 */
type GroupKey = "understand" | "learn" | "master";

const FEATURE_GROUPS: Record<GroupKey, Feature["id"][]> = {
  understand: ["definitions", "examples", "idioms", "origin"],
  learn:      ["kids", "image", "notebook", "compose"],
  master:     ["quiz", "compare"],
};

interface GroupCopy {
  // ReactNode so Clear / Deep / Family titles can wrap the new word
  // in a tier-coloured <Hl> highlight, matching the /pricing tagline
  // pattern. Each title's NEW addition over the tier below picks up
  // the tier accent so the visual journey reads at a glance.
  groupTitles: Record<GroupKey, React.ReactNode>;
  groupSubs: Record<GroupKey, string>;
  // Family renders as a 4th group on /features with the same card-
  // grid chrome as Basic / Clear / Deep above. Each feature carries
  // its own icon + title + body, identical shape to Feature in the
  // c.list array used by the three tier groups.
  family: {
    title: React.ReactNode;
    sub: string;
    features: Array<{
      id: string;
      icon: FeatureIconName;
      title: string;
      body: string;
    }>;
  };
  bubble: string;
}

/** Tier-coloured highlight span used inside the group titles. Colour
 *  is inherited from the parent .wb-feat-group-{tier} class via
 *  globals.css so the same component lights up the correct hue per
 *  tier without prop-drilling. */
function Hl({ children }: { children: React.ReactNode }) {
  return <span className="wb-feat-group-title-hl">{children}</span>;
}

const GROUP_COPY: Record<"he" | "en" | "hi", GroupCopy> = {
  he: {
    groupTitles: {
      understand: "להבין את המילה",
      learn: <>להבין <Hl>ולראות</Hl> את המילה</>,
      master: <>להבין, לראות <Hl>ולזכור את המילה לתמיד</Hl></>,
    },
    groupSubs: {
      understand:
        "כל המשמעויות, דוגמאות בהקשר, ניבים שהיא חיה בהם, והמקור ההיסטורי שלה.",
      learn:
        "תמונה למילה, מצב ילדים בשפה פשוטה, מחברת אישית, וכתיבת משפט עם משוב.",
      master:
        "חידונים מותאמים אישית ומשחקי מילים שמטמיעים את המילה לטווח ארוך.",
    },
    family: {
      title: <>להבין, לראות, לזכור <Hl>לכל בני המשפחה</Hl></>,
      sub: "מנוי אחד שנותן לכל בן משפחה חשבון משלו, עם כל הפיצ'רים המתקדמים. עד 5 ילדים.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "פרופיל נפרד לכל בן משפחה",
          body: "מחברת מילים, היסטוריית חיפושים, ורצף ימי למידה אישי לכל ילד והורה.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "חיבור מכשיר בקוד QR",
          body: "הילד מצלם QR בטלפון שלו ונכנס לחשבון, נשאר מחובר לתמיד בלי סיסמה.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "לוח בקרה להורה",
          body: "רואים את כל המילים שכל ילד חיפש ומתי, ועוקבים אחרי הקצב של כל אחד.",
        },
        {
          id: "people",
          icon: "people",
          title: "עד 5 ילדים תחת אותו מנוי",
          body: "כל ילד מקבל את כל פיצ'רי Deep, ההורה משלם פעם אחת על כל המשפחה.",
        },
      ],
    },
    // Brand pun stays in Latin in every language - like the Gadit
    // wordmark itself. See feedback_brand_name_english memory.
    bubble: "Now I gad it!",
  },
  en: {
    groupTitles: {
      understand: "Understand the word",
      learn: <>Understand and <Hl>see</Hl> the word</>,
      master: <>Understand, see, and <Hl>remember the word forever</Hl></>,
    },
    groupSubs: {
      understand:
        "Every meaning, real sentences in context, the idioms it lives in, and where it came from.",
      learn:
        "An image for the word, a kid-friendly version, a personal notebook, and a sentence you write with feedback.",
      master:
        "Personalized quizzes and word games that lock the word in for the long run.",
    },
    family: {
      title: <>Understand, see, remember <Hl>for the whole family</Hl></>,
      sub: "One subscription gives every family member their own account, with all the advanced features. Up to 5 children.",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "A separate profile per family member",
          body: "Word notebook, search history, and personal learning streak for every child and parent.",
        },
        {
          id: "qr",
          icon: "qr",
          title: "Pair a device with a QR code",
          body: "Your child scans a QR on their phone and signs in. Stays paired forever, no password.",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "Parent dashboard",
          body: "See every word each child looked up and when, follow their pace at a glance.",
        },
        {
          id: "people",
          icon: "people",
          title: "Up to 5 children on one subscription",
          body: "Every child gets full Deep features. Parent pays once for the whole family.",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
  hi: {
    groupTitles: {
      understand: "शब्द को समझें",
      learn: <>शब्द को समझें और <Hl>देखें</Hl></>,
      master: <>समझें, देखें और <Hl>हमेशा के लिए शब्द को याद रखें</Hl></>,
    },
    groupSubs: {
      understand:
        "हर अर्थ, संदर्भ में असली वाक्य, मुहावरे जिनमें यह शब्द जीता है, और यह कहाँ से आया।",
      learn:
        "शब्द की एक तस्वीर, बच्चों के लिए सरल समझ, व्यक्तिगत नोटबुक, और एक वाक्य जो आप लिखें और फ़ीडबैक पाएँ।",
      master:
        "व्यक्तिगत क्विज़ और शब्द-खेल जो शब्द को लम्बे समय तक पक्का करते हैं।",
    },
    family: {
      title: <>समझें, देखें, याद रखें <Hl>पूरे परिवार के लिए</Hl></>,
      sub: "एक सब्सक्रिप्शन हर बच्चे को अपना अलग खाता देता है, सभी उन्नत सुविधाओं के साथ। 5 बच्चों तक।",
      features: [
        {
          id: "profile",
          icon: "profile",
          title: "हर बच्चे के लिए अलग प्रोफ़ाइल",
          body: "शब्द-नोटबुक, खोज इतिहास और हर बच्चे और माता-पिता के लिए व्यक्तिगत सीखने का सिलसिला।",
        },
        {
          id: "qr",
          icon: "qr",
          title: "QR कोड से डिवाइस जोड़ें",
          body: "आपका बच्चा अपने फ़ोन पर QR स्कैन करे और साइन इन हो जाए। हमेशा जुड़ा रहता है, बिना पासवर्ड।",
        },
        {
          id: "dashboard",
          icon: "dashboard",
          title: "माता-पिता का डैशबोर्ड",
          body: "देखें हर बच्चे ने कौन-सा शब्द कब खोजा। एक नज़र में हर एक की रफ़्तार समझें।",
        },
        {
          id: "people",
          icon: "people",
          title: "एक सब्सक्रिप्शन में 5 बच्चे तक",
          body: "हर बच्चे को Deep की पूरी सुविधाएँ। माता-पिता एक बार पूरे परिवार के लिए भुगतान करें।",
        },
      ],
    },
    bubble: "Now I gad it!",
  },
};

function pickGroupCopy(lang: string): GroupCopy {
  if (lang === "he") return GROUP_COPY.he;
  if (lang === "hi") return GROUP_COPY.hi;
  return GROUP_COPY.en;
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
  hi: {
    heroEyebrow: "सुविधाएँ",
    heroTitle: "एक शब्दकोश जो परिभाषा पर नहीं रुकता।",
    heroSub: "Gadit हर शब्द को पूरी तरह समझता है। हर अर्थ, संदर्भ में असली वाक्य, मुहावरे, उत्पत्ति और अभ्यास। जब तक शब्द सच में क्लिक न कर जाए। इसी को हम शब्द को GAD करना कहते हैं।",
    ctaPrimary: "मुफ्त शुरू करें",
    ctaSecondary: "क़ीमत देखें",
    signin: "साइन इन", pricing: "क़ीमत", search: "खोज", features: "सुविधाएँ",
    sectionLabel: "आपको क्या मिलता है",
    finalCtaTitle: "आज़माने को तैयार?",
    finalCtaSub: "Basic से बिल्कुल मुफ्त शुरू करें। एक टैप में अपग्रेड करें, सिर्फ़ तब जब और चाहिए।",
    finalCtaBtn: "अभी शुरू करें",
    tierLabel: { basic: "Basic", clear: "Clear", deep: "Deep" },
    list: [
      { id: "definitions", icon: "definitions", tier: "basic", title: "हर परिभाषा",                       body: "शब्द के सभी अर्थ, यहाँ तक कि दुर्लभ भी, उपयोग की आवृत्ति के क्रम में।" },
      { id: "examples",    icon: "examples",    tier: "basic", title: "संदर्भ में असली वाक्य",              body: "हर अर्थ के लिए तीन असली वाक्य, ताकि संदर्भ तुरंत समझ आए।" },
      { id: "idioms",      icon: "idioms",      tier: "basic", title: "मुहावरे और अभिव्यक्तियाँ",          body: "हर अभिव्यक्ति जिसमें यह शब्द आता है, पूरे मुहावरे के अर्थ के साथ।" },
      { id: "origin",      icon: "origin",      tier: "basic", title: "शब्द कहाँ से आया",                  body: "जिस भाषा से शब्द शुरू हुआ, और मूल रूप से उसका अर्थ क्या था।" },
      { id: "kids",        icon: "kids",        tier: "clear", title: "बच्चों के लिए समझ",                 body: "एक साफ़, सरल संस्करण जिसे बच्चा बिना भारी शब्दों के पढ़ सके।" },
      { id: "image",       icon: "image",       tier: "clear", title: "शब्द एक तस्वीर में",                body: "हर शब्द के लिए एक अनोखी तस्वीर, उसी अर्थ से मेल खाती जो आप पढ़ रहे हैं।" },
      { id: "notebook",    icon: "notebook",    tier: "clear", title: "व्यक्तिगत शब्द-नोटबुक",             body: "वे शब्द सहेजें जो आप याद रखना चाहते हैं। बिना इंटरनेट भी उपलब्ध।" },
      { id: "compose",     icon: "compose",     tier: "clear", title: "वाक्य लिखें, फ़ीडबैक पाएँ",          body: "शब्द के साथ अपना वाक्य बनाएँ और तुरंत सुधार और फ़ीडबैक पाएँ।" },
      { id: "quiz",        icon: "quiz",        tier: "deep",  title: "व्यक्तिगत क्विज़",                    body: "आपके सीखे हुए शब्दों पर रोज़ की क्विज़, ताकि वे आपके साथ लम्बे समय तक रहें।" },
      { id: "compare",     icon: "compare",     tier: "deep",  title: "शब्द खेल",                          body: "ऐसे खेल जो आपकी शब्दावली बढ़ाते हैं: मिलान, अनुमान, शब्दों के बीच कनेक्शन बनाना।" },
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
    case "profile":     return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case "qr":          return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M14 21h3M21 14v7M17 17h4" /></svg>;
    case "dashboard":   return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
    case "people":      return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M14 20a5 5 0 0 1 7-4" /></svg>;
  }
}

const TIER_COLOR: Record<Tier, { fg: string; bg: string }> = {
  basic:  { fg: "var(--basic-fg)",  bg: "var(--basic-bg)" },
  clear:  { fg: "var(--teal-edge)", bg: "var(--teal-soft)" },
  deep:   { fg: "var(--deep-fg)",   bg: "var(--deep-bg)" },
  family: { fg: "#1E40AF",          bg: "#DBEAFE" },
};

export function FeaturesPage() {
  const { lang, dir, setLang } = useLang();
  const { user, plan, promptLogin } = useAuth();
  const href = useHref();
  const c = COPY[lang] ?? COPY.en;
  const gc = pickGroupCopy(lang);
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
        {/* Hero, same eyebrow / italic display / two-CTA shape as
            before. The "it" character only appears at the very end now;
            anchoring it here floated awkwardly between the topbar and
            the title and didn't pay off the metaphor. */}
        <section className="wb-feat-hero">
          <div className="wb-feat-eyebrow">{c.heroEyebrow}</div>
          <h1 className="wb-feat-display">{c.heroTitle}</h1>
          <p className="wb-feat-lede">{c.heroSub}</p>
          <div className="wb-feat-cta-row">
            <Link href={href("/")} className="wb-feat-cta-primary">{c.ctaPrimary}</Link>
            <Link href={href("/pricing")} className="wb-feat-cta-ghost">{c.ctaSecondary}</Link>
          </div>
        </section>

        {/* Auto-cycling demo tour, walks the visitor through what each
            tier unlocks plus the partner program. See
            GaditDemoAnimation.tsx for the scene state machine. */}
        <GaditDemoAnimation />

        {/* Three feature groups, Understand -> Learn -> Master.
            Each group is one Basic / Clear / Deep tier respectively,
            so the visual journey IS the pricing ladder. Within each
            group the cards keep the original visual treatment from
            the bento grid, just smaller (always equal weight inside
            the group). */}
        <section className="wb-feat-groups">
          {(Object.keys(FEATURE_GROUPS) as GroupKey[]).map((groupKey) => {
            const ids = FEATURE_GROUPS[groupKey];
            const groupFeatures = c.list.filter((f) => ids.includes(f.id));
            if (groupFeatures.length === 0) return null;
            const groupTier: Tier =
              groupKey === "understand" ? "basic" : groupKey === "learn" ? "clear" : "deep";
            return (
              <div key={groupKey} className={`wb-feat-group wb-feat-group-${groupTier}`}>
                <div className="wb-feat-group-head">
                  <span className={`wb-feat-tier-chip wb-feat-tier-chip-${groupTier}`}>
                    {c.tierLabel[groupTier]}
                  </span>
                  <h2 className="wb-feat-group-title">{gc.groupTitles[groupKey]}</h2>
                  <p className="wb-feat-group-sub">{gc.groupSubs[groupKey]}</p>
                </div>
                <div className="wb-feat-group-cards">
                  {groupFeatures.map((f) => {
                    const t = TIER_COLOR[f.tier];
                    return (
                      <article key={f.id} className="wb-feat-card">
                        <div className="wb-feat-card-head">
                          <div className="wb-feat-card-icon" style={{ background: t.bg, color: t.fg }}>
                            <FeatureIcon name={f.icon} color={t.fg} />
                          </div>
                        </div>
                        <h3 className="wb-feat-card-title">{f.title}</h3>
                        {f.body && <p className="wb-feat-card-body">{f.body}</p>}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* Family, rendered as a 4th group with the same card-grid
            chrome as Basic / Clear / Deep above so the visual rhythm
            stays consistent. Royal-blue accent (matches /pricing). */}
        <section className="wb-feat-groups wb-feat-groups-family">
          <div className="wb-feat-group wb-feat-group-family">
            <div className="wb-feat-group-head">
              <span className="wb-feat-tier-chip wb-feat-tier-chip-family">
                Family
              </span>
              <h2 className="wb-feat-group-title">{gc.family.title}</h2>
              <p className="wb-feat-group-sub">{gc.family.sub}</p>
            </div>
            <div className="wb-feat-group-cards">
              {gc.family.features.map((f) => {
                const t = TIER_COLOR.family;
                return (
                  <article key={f.id} className="wb-feat-card">
                    <div className="wb-feat-card-head">
                      <div className="wb-feat-card-icon" style={{ background: t.bg, color: t.fg }}>
                        <FeatureIcon name={f.icon} color={t.fg} />
                      </div>
                    </div>
                    <h3 className="wb-feat-card-title">{f.title}</h3>
                    {f.body && <p className="wb-feat-card-body">{f.body}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA, character + speech bubble + one big button.
            The bubble carries the brand verb ("Now I gad it!") so the
            page closes on the same metaphor it opened with. */}
        <section className="wb-feat-final">
          <div className="wb-feat-final-character">
            <div className="wb-feat-final-bubble">{gc.bubble}</div>
            <img
              src="/gad-it-character.png"
              alt=""
              aria-hidden="true"
              width={180}
              height={180}
              loading="lazy"
              decoding="async"
            />
          </div>
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
