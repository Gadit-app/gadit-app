import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono, Rubik, Cairo, Fraunces, Noto_Naskh_Arabic, Lora, Inter, Heebo, JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";
import LoginModal from "@/components/LoginModal";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
});

// Display serif for word titles, definitions, and "lexical" moments.
// opsz axis (9-144) lets a giant word title feel warm, while 20pt serves
// body text without feeling stiff. Variable weight is required when axes
// is supplied — Next.js rejects pinned weights alongside axes.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Native Naskh shapes for Arabic — chosen over Cairo (which is a Latin
// font adapted to Arabic) after a native reader flagged Cairo as feeling
// "not natural". Cairo stays loaded for now to avoid regressions in
// existing components; new design system uses noto.
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Wordbook redesign — Lora (Latin display + body italic) replaces Fraunces
// for the Word Result page only. Fraunces stays loaded for the legacy V2
// home / pricing / notebook screens until those are ported in a later round.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Heebo — Hebrew sans for CrispTech. Modern, geometric, designed
// specifically for Hebrew (unlike Rubik which is more rounded/friendly).
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// JetBrains Mono — monospace for code-style chrome (kbd hints, file
// names, version stamps). Used sparingly; signals "this is technical".
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Inter — body sans for the wordbook design. Coexists with Geist for now.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Noto Sans JP — Japanese body/display sans. Pulled in for the ja UI
// locale. Inter/Heebo/Cairo render Japanese glyphs from system fallback
// which is inconsistent across OSes; Noto Sans JP ships a self-contained
// Japanese glyph set so the experience is stable on Windows, macOS,
// Android and ChromeOS alike.
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Per-language metadata strings used by generateMetadata below. The
// description is the same first-person share blurb that ShareButton
// uses for the Web Share API, so the social-card preview that gets
// posted on WhatsApp / Twitter / Telegram says the same thing as
// when a user invokes the in-app share. Title is third-person.
const META: Record<Lang, { title: string; description: string; locale: string }> = {
  he: {
    title: "Gadit — מילון דיגיטלי חכם",
    description:
      "גיליתי מילון דיגיטלי חדש שמפרש מילים ומראה דוגמאות לכל הגדרה, ניבים וצירופי מילים וגם המקור של המילה ומאיפה היא הגיעה. זה חינמי עם אפשרויות לשדרג בעלות נמוכה מאוד. שווה לנסות.",
    locale: "he_IL",
  },
  en: {
    title: "Gadit — Smart digital dictionary",
    description:
      "I discovered a new digital dictionary that explains words and shows examples for every definition, idioms and expressions, and the origin of each word and where it came from. It's free with very low-cost upgrade options. Worth a try.",
    locale: "en_US",
  },
  ar: {
    title: "Gadit — قاموس رقمي ذكي",
    description:
      "اكتشفت قاموسًا رقميًا جديدًا يشرح الكلمات ويعرض أمثلة لكل تعريف، تعابير وعبارات، وكذلك أصل الكلمة ومن أين جاءت. مجاني مع خيارات ترقية بتكلفة منخفضة جدًا. يستحق التجربة.",
    locale: "ar",
  },
  ru: {
    title: "Gadit — Умный цифровой словарь",
    description:
      "Нашёл новый цифровой словарь, который объясняет слова и показывает примеры для каждого определения, идиомы и выражения, а также происхождение слова и откуда оно взялось. Бесплатно, с очень дешёвой опцией апгрейда. Стоит попробовать.",
    locale: "ru_RU",
  },
  es: {
    title: "Gadit — Diccionario digital inteligente",
    description:
      "Descubrí un nuevo diccionario digital que explica las palabras y muestra ejemplos para cada definición, modismos y expresiones, y también el origen de cada palabra y de dónde viene. Es gratis con opciones de actualización a muy bajo costo. Vale la pena probar.",
    locale: "es_ES",
  },
  pt: {
    title: "Gadit — Dicionário digital inteligente",
    description:
      "Descobri um novo dicionário digital que explica palavras e mostra exemplos para cada definição, expressões idiomáticas, e também a origem de cada palavra e de onde ela veio. É grátis com opções de upgrade a um custo muito baixo. Vale a pena experimentar.",
    locale: "pt_BR",
  },
  de: {
    title: "Gadit — Intelligentes digitales Wörterbuch",
    description:
      "Ich habe ein neues digitales Wörterbuch entdeckt, das Wörter erklärt und für jede Definition Beispiele zeigt, dazu Redewendungen und Ausdrücke sowie die Herkunft jedes Wortes. Kostenlos, mit sehr günstigen Upgrade-Optionen. Einen Versuch wert.",
    locale: "de_DE",
  },
  cs: {
    title: "Gadit — Chytrý digitální slovník",
    description:
      "Objevil jsem nový digitální slovník, který vysvětluje slova a ukazuje příklady pro každou definici, idiomy a fráze, a také původ každého slova a odkud pochází. Zdarma s velmi levnými možnostmi vylepšení. Stojí za vyzkoušení.",
    locale: "cs_CZ",
  },
  sk: {
    title: "Gadit — Inteligentný digitálny slovník",
    description:
      "Objavil som nový digitálny slovník, ktorý vysvetľuje slová a ukazuje príklady pre každý význam, idiómy a frázy, a tiež pôvod každého slova a odkiaľ pochádza. Zadarmo s veľmi lacnými možnosťami vylepšenia. Stojí za vyskúšanie.",
    locale: "sk_SK",
  },
  fr: {
    title: "Gadit — Dictionnaire numérique intelligent",
    description:
      "J'ai découvert un nouveau dictionnaire numérique qui explique les mots et montre des exemples pour chaque définition, des idiomes et expressions, et aussi l'origine de chaque mot et d'où il vient. C'est gratuit avec des options de mise à niveau à très bas coût. Ça vaut le coup d'essayer.",
    locale: "fr_FR",
  },
  it: {
    title: "Gadit — Dizionario digitale intelligente",
    description:
      "Ho scoperto un nuovo dizionario digitale che spiega le parole e mostra esempi per ogni definizione, modi di dire ed espressioni, e anche l'origine di ogni parola. Gratis con opzioni di aggiornamento a bassissimo costo. Vale la pena provarlo.",
    locale: "it_IT",
  },
  ja: {
    title: "Gadit — 賢いデジタル辞書",
    description:
      "言葉を解説し、意味ごとに例文・イディオム・表現・語源まで見せてくれる新しいデジタル辞書を見つけました。無料で使えて、有料プランも非常に手頃。一度試す価値があります。",
    locale: "ja_JP",
  },
};

const ALL_LANGS: Lang[] = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

export async function generateMetadata(): Promise<Metadata> {
  // Resolve language for this request, exactly the same chain the
  // RootLayout uses below: URL-prefix header set by middleware first
  // (so /he/pricing gets HE metadata even on a cookieless OG fetcher),
  // then the persisted gadit-lang cookie, then EN default.
  const headersList = await headers();
  const cookieStore = await cookies();
  const headerLang  = headersList.get("x-gadit-lang") as Lang | null;
  const cookieLang  = cookieStore.get("gadit-lang")?.value as Lang | undefined;
  const lang: Lang =
    (headerLang && ALL_LANGS.includes(headerLang) && headerLang) ||
    (cookieLang && ALL_LANGS.includes(cookieLang) && cookieLang) ||
    "en";

  const m = META[lang];
  const ogImage = `/og/${lang}.png`;

  return {
    metadataBase: new URL("https://www.gadit.app"),
    title: m.title,
    description: m.description,
    applicationName: "Gadit",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Gadit",
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    alternates: {
      canonical: "https://www.gadit.app",
      languages: {
        en: "https://www.gadit.app",
        he: "https://www.gadit.app/he",
        ar: "https://www.gadit.app/ar",
        ru: "https://www.gadit.app/ru",
        es: "https://www.gadit.app/es",
        pt: "https://www.gadit.app/pt",
        fr: "https://www.gadit.app/fr",
        de: "https://www.gadit.app/de",
        cs: "https://www.gadit.app/cs",
        sk: "https://www.gadit.app/sk",
        "x-default": "https://www.gadit.app",
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: "https://www.gadit.app",
      siteName: "Gadit",
      type: "website",
      locale: m.locale,
      alternateLocale: ALL_LANGS.filter((l) => l !== lang).map((l) => META[l].locale),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: m.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0EA5A5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const SUPPORTED_LANGS: Lang[] = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve initial lang: URL-prefix header (set by middleware for
  // /he/, /en/ etc.) first, so the very first HTML painted matches
  // the URL the user shared. Then cookie. Then English default.
  const cookieStore = await cookies();
  const headersList = await headers();
  const headerLang  = headersList.get("x-gadit-lang") as Lang | null;
  const cookieLang  = cookieStore.get("gadit-lang")?.value as Lang | undefined;
  const initialLang: Lang =
    (headerLang && SUPPORTED_LANGS.includes(headerLang) && headerLang) ||
    (cookieLang && SUPPORTED_LANGS.includes(cookieLang) && cookieLang) ||
    "en";
  const initialDir: "ltr" | "rtl" =
    initialLang === "he" || initialLang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${cairo.variable} ${fraunces.variable} ${notoNaskhArabic.variable} ${lora.variable} ${inter.variable} ${heebo.variable} ${jetbrainsMono.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <LangProvider initialLang={initialLang}>
            <AuthProvider>
              {/* MarketingHeader is rendered per-route from each page's
                  Client component, so it sits inside the dark canvas
                  with the rest of the chrome. Header is no longer
                  global. */}
              <LoginModal />
              {children}
            </AuthProvider>
          </LangProvider>
          <ServiceWorkerRegister />
          <Analytics />
          <SpeedInsights />
          {/* Affonso affiliate-tracking pixel — sets a 60-day
              affonso_referral cookie when a visitor lands with
              ?ref=CODE in the URL. Captured at checkout time and
              attributed via Stripe metadata. afterInteractive is the
              App Router-safe strategy for third-party tracking: it
              still fires early enough to catch the ?ref= param on
              the first navigation, while keeping initial paint
              snappy.

              Cookie duration: 60 days — must match the value set in
              Affonso dashboard (Tracking & Coupons → Cookie Lifetime).
              60 days matches the consumer audience: parents, teachers
              and bloggers decide slowly — a referred reader who comes
              back two weeks later still attributes to the affiliate. */}
          <Script
            src="https://cdn.affonso.io/js/pixel.min.js"
            strategy="afterInteractive"
            data-affonso="cmq3oz349000p11r2lloq0xb2"
            data-cookie_duration="60"
          />
        </body>
    </html>
  );
}
