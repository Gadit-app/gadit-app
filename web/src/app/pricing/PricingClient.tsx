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
import { v2 } from "@/lib/i18n-v2";
import { ShareButton, APP_SHARE_COPY } from "@/components/ShareButton";
import { LangSwitchMobile } from "@/components/LangSwitchMobile";
import { StartFreeCTA } from "@/components/StartFreeCTA";
import { GadVerbStamp } from "@/components/GadVerbStamp";
import { WbUserMenu } from "@/components/design/WbUserMenu";
import { useAuth } from "@/lib/auth-context";
import { useHref } from "@/lib/href";

type Billing = "monthly" | "yearly";

const PRICE_CLEAR_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_MONTHLY ?? "";
const PRICE_CLEAR_YEARLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLEAR_YEARLY  ?? "";
const PRICE_DEEP_MONTHLY  = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_MONTHLY  ?? "";
const PRICE_DEEP_YEARLY   = process.env.NEXT_PUBLIC_STRIPE_PRICE_DEEP_YEARLY   ?? "";

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
                <img className="wb-lang-flag" src={`https://flagcdn.com/40x30/${l.flag}.png`} srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`} width="20" height="15" alt="" loading="lazy" />{l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Bold + tier-coloured highlight for the new "layer" word in a
 *  tier tagline (e.g. 'see' in Clear, 'remember forever' in Deep).
 *  The actual colour is inherited from the parent tier card via
 *  .wb-tier-clear / .wb-tier-deep selectors in globals.css. */
function Hl({ children }: { children: React.ReactNode }) {
  return <span className="wb-tier-tagline-hl">{children}</span>;
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
  tagline: React.ReactNode;
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
  features: string;
  tierBasic: { name: string; tagline: React.ReactNode; cta: string; features: string[] };
  tierClear: { name: string; tagline: React.ReactNode; cta: string; badge: string; features: string[] };
  tierDeep:  { name: string; tagline: React.ReactNode; cta: string; features: string[] };
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
    features: "פיצ'רים",
    mo: "/חודש", yr: "/שנה",
    freeForever: "חינם לתמיד",
    tierBasic: {
      name: "Basic",
      tagline: "להבין את המילה",
      cta: "התחילו חינם",
      features: [
        "20 חיפושי מילים ליום",
        "כל ההגדרות למילה",
        "דוגמאות של משפטים לפי הקשר",
        "ניבים וצירופי מילים",
        "מקור המילה",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>להבין <Hl>ולראות</Hl> את המילה</>,
      cta: "נסו 14 יום חינם",
      badge: "הכי פופולרי",
      features: [
        "כל מה שיש ב-Basic",
        "חיפושים ללא הגבלה",
        "הסבר לילדים",
        "המחשת המילה בתמונה",
        "מחברת מילים אישית",
        "חיבור משפט עם המילה וקבלת משוב",
        "היסטוריית חיפוש מלאה",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>להבין, לראות <Hl>ולזכור את המילה לתמיד</Hl></>,
      cta: "נסו 14 יום חינם",
      features: [
        "כל מה שיש ב-Clear",
        "חידונים מותאמים אישית",
        "משחקי מילים",
        "תרגול ולמידה לטווח ארוך",
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
    features: "Features",
    mo: "/mo", yr: "/yr",
    freeForever: "Free forever",
    tierBasic: {
      name: "Basic",
      tagline: "Understand the word",
      cta: "Start now",
      features: [
        "20 word searches per day",
        "Every definition of the word",
        "Sentence examples by context",
        "Idioms & expressions",
        "Word origin",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Understand and <Hl>see</Hl> the word</>,
      cta: "Try 14 days free",
      badge: "Most popular",
      features: [
        "Everything in Basic",
        "Unlimited searches",
        "Kids' explanation",
        "Word illustrated as an image",
        "Personal word notebook",
        "Compose a sentence and get feedback",
        "Full search history",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Understand, see, and <Hl>remember the word forever</Hl></>,
      cta: "Try 14 days free",
      features: [
        "Everything in Clear",
        "Personalized quizzes",
        "Word games",
        "Long-term practice & retention",
        "Export content",
      ],
    },
  },
  ar: {
    heroTitle: "ابدأ مجانًا.",
    heroSub: "ارتقِ متى أردت التعمّق.",
    monthly: "شهري", yearly: "سنوي",
    save: "وفّر 17%",
    signin: "تسجيل دخول",
    pricing: "الأسعار",
    search: "بحث",
    features: "المزايا",
    mo: "/شهر", yr: "/سنة",
    freeForever: "مجاني للأبد",
    tierBasic: {
      name: "Basic",
      tagline: "فهم الكلمة",
      cta: "ابدأ مجانًا",
      features: [
        "20 عملية بحث يوميًا",
        "كل تعريفات الكلمة",
        "أمثلة جمل حسب السياق",
        "تعابير وعبارات",
        "أصل الكلمة",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>فهم و<Hl>رؤية</Hl> الكلمة</>,
      cta: "جرّب 14 يومًا مجانًا",
      badge: "الأكثر شيوعًا",
      features: [
        "كل ما في Basic",
        "عمليات بحث بلا حدود",
        "شرح للأطفال",
        "صورة توضيحية للكلمة",
        "دفتر كلمات شخصي",
        "اكتب جملة وتلقَّ تعليقًا",
        "سجل بحث كامل",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>فهم ورؤية و<Hl>تذكّر للأبد</Hl></>,
      cta: "جرّب 14 يومًا مجانًا",
      features: [
        "كل ما في Clear",
        "اختبارات مخصصة",
        "ألعاب كلمات",
        "تمرين وحفظ طويل المدى",
        "تصدير المحتوى",
      ],
    },
  },
  ru: {
    heroTitle: "Начните бесплатно.",
    heroSub: "Обновите подписку, когда захотите углубиться.",
    monthly: "Ежемесячно", yearly: "Ежегодно",
    save: "Экономия 17%",
    signin: "Войти",
    pricing: "Цены",
    search: "Поиск",
    features: "Возможности",
    mo: "/мес", yr: "/год",
    freeForever: "Бесплатно навсегда",
    tierBasic: {
      name: "Basic",
      tagline: "Понять слово",
      cta: "Начать бесплатно",
      features: [
        "20 поисков слов в день",
        "Все определения слова",
        "Примеры предложений по контексту",
        "Идиомы и выражения",
        "Происхождение слова",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Понять и <Hl>увидеть</Hl> слово</>,
      cta: "Пробовать 14 дней",
      badge: "Самый популярный",
      features: [
        "Всё из Basic",
        "Безлимитные поиски",
        "Объяснение для детей",
        "Иллюстрация слова",
        "Личная тетрадь слов",
        "Составить фразу и получить отзыв",
        "Полная история поиска",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Понять, увидеть и <Hl>запомнить навсегда</Hl></>,
      cta: "Пробовать 14 дней",
      features: [
        "Всё из Clear",
        "Персональные викторины",
        "Игры со словами",
        "Долгосрочная практика и запоминание",
        "Экспорт контента",
      ],
    },
  },
  es: {
    heroTitle: "Empieza gratis.",
    heroSub: "Actualiza solo cuando quieras profundizar.",
    monthly: "Mensual", yearly: "Anual",
    save: "Ahorra 17%",
    signin: "Iniciar sesión",
    pricing: "Precios",
    search: "Búsqueda",
    features: "Funciones",
    mo: "/mes", yr: "/año",
    freeForever: "Gratis para siempre",
    tierBasic: {
      name: "Basic",
      tagline: "Entender la palabra",
      cta: "Empezar gratis",
      features: [
        "20 búsquedas por día",
        "Todas las definiciones de la palabra",
        "Ejemplos según contexto",
        "Modismos y expresiones",
        "Origen de la palabra",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Entender y <Hl>ver</Hl> la palabra</>,
      cta: "Prueba 14 días gratis",
      badge: "Más popular",
      features: [
        "Todo lo de Basic",
        "Búsquedas ilimitadas",
        "Explicación para niños",
        "Ilustración de la palabra",
        "Cuaderno personal de palabras",
        "Compón una frase y recibe feedback",
        "Historial de búsqueda completo",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Entender, ver y <Hl>recordar para siempre</Hl></>,
      cta: "Prueba 14 días gratis",
      features: [
        "Todo lo de Clear",
        "Pruebas personalizadas",
        "Juegos de palabras",
        "Práctica y retención a largo plazo",
        "Exportar contenido",
      ],
    },
  },
  pt: {
    heroTitle: "Comece grátis.",
    heroSub: "Atualize só quando quiser aprofundar.",
    monthly: "Mensal", yearly: "Anual",
    save: "Economize 17%",
    signin: "Entrar",
    pricing: "Preços",
    search: "Buscar",
    features: "Recursos",
    mo: "/mês", yr: "/ano",
    freeForever: "Grátis para sempre",
    tierBasic: {
      name: "Basic",
      tagline: "Entender a palavra",
      cta: "Começar grátis",
      features: [
        "20 buscas de palavras por dia",
        "Todas as definições da palavra",
        "Exemplos por contexto",
        "Expressões idiomáticas",
        "Origem da palavra",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Entender e <Hl>ver</Hl> a palavra</>,
      cta: "Experimente 14 dias grátis",
      badge: "Mais popular",
      features: [
        "Tudo do Basic",
        "Buscas ilimitadas",
        "Explicação para crianças",
        "Ilustração da palavra",
        "Caderno pessoal de palavras",
        "Componha uma frase e receba feedback",
        "Histórico completo de busca",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Entender, ver e <Hl>lembrar para sempre</Hl></>,
      cta: "Experimente 14 dias grátis",
      features: [
        "Tudo do Clear",
        "Quizzes personalizados",
        "Jogos com palavras",
        "Prática e retenção a longo prazo",
        "Exportar conteúdo",
      ],
    },
  },
  fr: {
    heroTitle: "Commencez gratuitement.",
    heroSub: "Passez au supérieur seulement quand vous voulez approfondir.",
    monthly: "Mensuel", yearly: "Annuel",
    save: "Économisez 17%",
    signin: "Connexion",
    pricing: "Tarifs",
    search: "Recherche",
    features: "Fonctionnalités",
    mo: "/mois", yr: "/an",
    freeForever: "Gratuit pour toujours",
    tierBasic: {
      name: "Basic",
      tagline: "Comprendre le mot",
      cta: "Commencer gratuitement",
      features: [
        "20 recherches de mots par jour",
        "Toutes les définitions du mot",
        "Exemples selon le contexte",
        "Idiomes et expressions",
        "Origine du mot",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Comprendre et <Hl>voir</Hl> le mot</>,
      cta: "Essayez 14 jours gratuits",
      badge: "Le plus populaire",
      features: [
        "Tout du Basic",
        "Recherches illimitées",
        "Explication pour enfants",
        "Illustration du mot",
        "Carnet personnel de mots",
        "Composez une phrase et recevez un retour",
        "Historique de recherche complet",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Comprendre, voir et <Hl>retenir à jamais</Hl></>,
      cta: "Essayez 14 jours gratuits",
      features: [
        "Tout du Clear",
        "Quiz personnalisés",
        "Jeux de mots",
        "Pratique et mémorisation à long terme",
        "Exporter du contenu",
      ],
    },
  },
  de: {
    heroTitle: "Kostenlos starten.",
    heroSub: "Upgrade nur, wenn du tiefer eintauchen willst.",
    monthly: "Monatlich", yearly: "Jährlich",
    save: "17% sparen",
    signin: "Anmelden",
    pricing: "Preise",
    search: "Suche",
    features: "Funktionen",
    mo: "/Monat", yr: "/Jahr",
    freeForever: "Für immer kostenlos",
    tierBasic: {
      name: "Basic",
      tagline: "Das Wort verstehen",
      cta: "Kostenlos starten",
      features: [
        "20 Wortsuchen pro Tag",
        "Jede Definition des Wortes",
        "Beispielsätze im Kontext",
        "Redewendungen & Ausdrücke",
        "Wortursprung",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Das Wort verstehen und <Hl>sehen</Hl></>,
      cta: "14 Tage kostenlos testen",
      badge: "Am beliebtesten",
      features: [
        "Alles aus Basic",
        "Unbegrenzte Suchen",
        "Erklärung für Kinder",
        "Wort als Bild dargestellt",
        "Persönliches Wörter-Notizbuch",
        "Satz schreiben und Feedback bekommen",
        "Vollständiger Suchverlauf",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Verstehen, sehen und <Hl>für immer behalten</Hl></>,
      cta: "14 Tage kostenlos testen",
      features: [
        "Alles aus Clear",
        "Personalisierte Quizze",
        "Wortspiele",
        "Langfristiges Üben & Behalten",
        "Inhalte exportieren",
      ],
    },
  },
  cs: {
    heroTitle: "Začni zdarma.",
    heroSub: "Upgraduj, jen když budeš chtít jít hlouběji.",
    monthly: "Měsíčně", yearly: "Ročně",
    save: "Ušetři 17%",
    signin: "Přihlásit se",
    pricing: "Ceník",
    search: "Hledat",
    features: "Funkce",
    mo: "/měsíc", yr: "/rok",
    freeForever: "Navždy zdarma",
    tierBasic: {
      name: "Basic",
      tagline: "Pochopit slovo",
      cta: "Začni zdarma",
      features: [
        "20 vyhledávání slov denně",
        "Každá definice slova",
        "Příklady vět podle kontextu",
        "Idiomy a slovní spojení",
        "Původ slova",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Pochopit a <Hl>vidět</Hl> slovo</>,
      cta: "Vyzkoušej 14 dní zdarma",
      badge: "Nejoblíbenější",
      features: [
        "Vše z Basic",
        "Neomezené vyhledávání",
        "Vysvětlení pro děti",
        "Slovo znázorněné obrázkem",
        "Osobní sešit slov",
        "Napiš větu a získej zpětnou vazbu",
        "Úplná historie vyhledávání",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Pochop, viď a <Hl>zapamatuj si navždy</Hl></>,
      cta: "Vyzkoušej 14 dní zdarma",
      features: [
        "Vše z Clear",
        "Personalizované kvízy",
        "Slovní hry",
        "Dlouhodobé procvičování & zapamatování",
        "Export obsahu",
      ],
    },
  },
  sk: {
    heroTitle: "Začni zadarmo.",
    heroSub: "Upgraduj, len keď budeš chcieť ísť hlbšie.",
    monthly: "Mesačne", yearly: "Ročne",
    save: "Ušetri 17%",
    signin: "Prihlásiť sa",
    pricing: "Cenník",
    search: "Hľadať",
    features: "Funkcie",
    mo: "/mesiac", yr: "/rok",
    freeForever: "Navždy zadarmo",
    tierBasic: {
      name: "Basic",
      tagline: "Pochopiť slovo",
      cta: "Začni zadarmo",
      features: [
        "20 vyhľadávaní slov denne",
        "Každá definícia slova",
        "Príklady viet podľa kontextu",
        "Idiómy a slovné spojenia",
        "Pôvod slova",
      ],
    },
    tierClear: {
      name: "Clear",
      tagline: <>Pochopiť a <Hl>vidieť</Hl> slovo</>,
      cta: "Vyskúšaj 14 dní zadarmo",
      badge: "Najobľúbenejšie",
      features: [
        "Všetko z Basic",
        "Neobmedzené vyhľadávanie",
        "Vysvetlenie pre deti",
        "Slovo znázornené obrázkom",
        "Osobný zošit slov",
        "Napíš vetu a získaj spätnú väzbu",
        "Úplná história vyhľadávaní",
      ],
    },
    tierDeep: {
      name: "Deep",
      tagline: <>Pochop, viď a <Hl>zapamätaj si navždy</Hl></>,
      cta: "Vyskúšaj 14 dní zadarmo",
      features: [
        "Všetko z Clear",
        "Personalizované kvízy",
        "Slovné hry",
        "Dlhodobé precvičovanie & zapamätanie",
        "Export obsahu",
      ],
    },
  },
};

export function PricingPageRoute() {
  const { lang, dir, setLang } = useLang();
  const { user, plan, promptLogin } = useAuth();
  const href = useHref();
  const [billing, setBilling] = useState<Billing>("monthly");
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
      // 'email_not_verified' branch removed in concert with the server-
      // side gate — the API no longer returns it. The only remaining
      // failure on this path is a generic 'something went wrong'.
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
          <Link href={href("/features")} className="wb-shell-navlink">{c.features}</Link>
          {user && (plan === "clear" || plan === "deep") && (
            <Link href={href("/notebook")} className="wb-shell-navlink">{v2(lang, "navNotebook")}</Link>
          )}
          {user && plan === "deep" && (
            <Link href={href("/play")} className="wb-shell-navlink">{v2(lang, "navPlay")}</Link>
          )}
          <Link href={href("/pricing")} className="wb-shell-navlink is-active">{c.pricing}</Link>
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
            <Link href={href("/")} onClick={() => setMenuOpen(false)}>{c.search}</Link>
            <Link href={href("/features")} onClick={() => setMenuOpen(false)}>{c.features}</Link>
            <Link href={href("/pricing")} className="is-active" onClick={() => setMenuOpen(false)}>{c.pricing}</Link>
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
