import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono, Rubik, Cairo, Fraunces, Noto_Naskh_Arabic, Lora, Inter, Heebo, JetBrains_Mono, Noto_Sans_JP, Noto_Sans_Devanagari, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import type { Lang } from "@/lib/i18n";
import LoginModal from "@/components/LoginModal";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AutoUpdater } from "@/components/AutoUpdater";
import { InstallPwaPrompt } from "@/components/InstallPwaPrompt";
import { RefCapture } from "@/components/RefCapture";
import { KidRouteGuard } from "@/components/KidRouteGuard";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MetaPixel from "@/components/MetaPixel";
import Script from "next/script";

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
  // Italic loaded so the wordmark's "it" and the few italic display
  // rules render a real italic glyph rather than browser-synthesized
  // skew. The token used to be Lora; now everything routes through Rubik.
  style: ["normal", "italic"],
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

// Noto Sans Devanagari — Hindi body/display sans. Inter/Heebo/Cairo
// render Devanagari glyphs from system fallback which is inconsistent
// across OSes (Windows ships Mangal, Android Roboto's Devanagari subset,
// older macOS has no native fallback at all). Noto Sans Devanagari ships
// a complete Devanagari glyph set so the experience is stable on every
// platform, matching the same pattern used for Noto Sans JP.
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-hi",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Noto Sans Ethiopic — Amharic (Ge'ez script, LTR). Same story as
// Devanagari/JP: none of the Latin-oriented fonts carry fidel glyphs,
// and OS fallbacks (Windows Nyala/Ebrima, macOS Kefa) are wildly
// inconsistent, so the script ships its own self-contained font.
const notoSansEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-am",
  subsets: ["latin", "ethiopic"],
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
    title: "Gadit, להבין מילים עד הסוף",
    description:
      "כלי חדש שעוזר להבין כל מילה באמת. כל המשמעויות, דוגמאות, ניבים, ומקור המילה. חינמי להתחיל, שדרוג בעלות מאוד נמוכה. שווה לנסות.",
    locale: "he_IL",
  },
  en: {
    title: "Gadit, Understand words to the end",
    description:
      "A new tool that helps you really understand every word. All the meanings, examples, idioms, and where the word comes from. Free to start, very low-cost upgrade. Worth a try.",
    locale: "en_US",
  },
  uk: {
    title: "Gadit, Зрозуміти слова до кінця",
    description:
      "Новий інструмент, що допомагає по-справжньому зрозуміти кожне слово. Усі значення, приклади, ідіоми та походження слова. Безкоштовно почати, дешеве оновлення. Варто спробувати.",
    locale: "uk_UA",
  },
  tr: {
    title: "Gadit, Kelimeleri sonuna kadar anla",
    description:
      "Her kelimeyi gerçekten anlamana yardımcı olan yeni bir araç. Tüm anlamlar, örnekler, deyimler ve kelimenin kökeni. Başlaması ücretsiz, yükseltme çok uygun. Denemeye değer.",
    locale: "tr_TR",
  },
  pl: {
    title: "Gadit, Zrozum słowa do końca",
    description:
      "Nowe narzędzie, które pomaga naprawdę zrozumieć każde słowo. Wszystkie znaczenia, przykłady, idiomy i pochodzenie słowa. Zacznij za darmo, tania aktualizacja. Warto spróbować.",
    locale: "pl_PL",
  },
  fa: {
    title: "Gadit، درک کامل واژه‌ها",
    description:
      "ابزاری تازه که کمک می‌کند هر واژه را واقعاً بفهمید. همه معناها، مثال‌ها، اصطلاح‌ها و ریشه واژه. شروع رایگان، ارتقای بسیار کم‌هزینه. ارزش امتحان دارد.",
    locale: "fa_IR",
  },
  id: {
    title: "Gadit, Pahami kata sampai tuntas",
    description:
      "Alat baru yang membantu kamu benar-benar memahami setiap kata. Semua makna, contoh, idiom, dan asal kata. Gratis untuk memulai, peningkatan berbiaya sangat rendah. Layak dicoba.",
    locale: "id_ID",
  },
  ar: {
    title: "Gadit, لفهم الكلمات حتى النهاية",
    description:
      "أداة جديدة تساعدك على فهم كل كلمة حقًا. كل المعاني، أمثلة، تعابير، وأصل الكلمة. مجاني للبدء، ترقية بتكلفة منخفضة جدًا. تستحق التجربة.",
    locale: "ar",
  },
  ru: {
    title: "Gadit, Понять слова до конца",
    description:
      "Новый инструмент, который помогает по-настоящему понять каждое слово. Все значения, примеры, идиомы и происхождение слова. Бесплатно для начала, апгрейд по очень низкой цене. Стоит попробовать.",
    locale: "ru_RU",
  },
  es: {
    title: "Gadit, Entender las palabras hasta el final",
    description:
      "Una nueva herramienta que te ayuda a entender de verdad cada palabra. Todos los significados, ejemplos, modismos y el origen de la palabra. Gratis para empezar, upgrade a muy bajo costo. Vale la pena probar.",
    locale: "es_ES",
  },
  pt: {
    title: "Gadit, Entender as palavras até o fim",
    description:
      "Uma nova ferramenta que ajuda a entender de verdade cada palavra. Todos os significados, exemplos, expressões idiomáticas e a origem da palavra. Grátis para começar, upgrade com custo muito baixo. Vale a pena experimentar.",
    locale: "pt_BR",
  },
  de: {
    title: "Gadit, Wörter bis zum Ende verstehen",
    description:
      "Ein neues Tool, das dir hilft, jedes Wort wirklich zu verstehen. Alle Bedeutungen, Beispiele, Redewendungen und die Herkunft des Wortes. Kostenlos zum Starten, Upgrade zu sehr günstigen Preisen. Einen Versuch wert.",
    locale: "de_DE",
  },
  cs: {
    title: "Gadit, Pochopit slova do konce",
    description:
      "Nový nástroj, který vám pomůže opravdu pochopit každé slovo. Všechny významy, příklady, idiomy a původ slova. Zdarma na začátek, vylepšení za velmi nízkou cenu. Stojí za vyzkoušení.",
    locale: "cs_CZ",
  },
  sk: {
    title: "Gadit, Pochopiť slová do konca",
    description:
      "Nový nástroj, ktorý vám pomôže naozaj pochopiť každé slovo. Všetky významy, príklady, idiómy a pôvod slova. Zadarmo na začiatok, vylepšenie za veľmi nízku cenu. Stojí za vyskúšanie.",
    locale: "sk_SK",
  },
  fr: {
    title: "Gadit, Comprendre les mots jusqu'au bout",
    description:
      "Un nouvel outil qui aide à vraiment comprendre chaque mot. Tous les sens, exemples, expressions et l'origine du mot. Gratuit pour commencer, mise à niveau à très bas prix. Ça vaut le coup d'essayer.",
    locale: "fr_FR",
  },
  it: {
    title: "Gadit, Capire le parole fino in fondo",
    description:
      "Un nuovo strumento che aiuta a capire davvero ogni parola. Tutti i significati, esempi, modi di dire e l'origine della parola. Gratis per iniziare, upgrade a costo molto basso. Vale la pena provarlo.",
    locale: "it_IT",
  },
  ja: {
    title: "Gadit, 言葉を最後まで理解する",
    description:
      "すべての言葉を本当に理解できる新しいツール。すべての意味、例文、イディオム、語源まで。無料で始められて、有料プランも非常に手頃。試す価値があります。",
    locale: "ja_JP",
  },
  hi: {
    title: "Gadit, हर शब्द को पूरी तरह समझें",
    description:
      "हर शब्द को सच में समझने का नया तरीका। हर अर्थ, असली वाक्य, मुहावरे और शब्द का इतिहास, सब एक जगह। मुफ्त शुरू करें, बहुत किफायती दामों पर अपग्रेड करें। आज़माने लायक।",
    locale: "hi_IN",
  },
  am: {
    title: "Gadit, ቃላትን እስከ መጨረሻው ይረዱ",
    description:
      "እያንዳንዱን ቃል በእውነት እንዲረዱ የሚያግዝ አዲስ መሣሪያ። ሁሉም ትርጉሞች፣ ምሳሌዎች፣ ፈሊጦች እና የቃሉ መነሻ። ለመጀመር ነፃ ነው፣ ማሻሻያውም በጣም ተመጣጣኝ ዋጋ አለው። መሞከር ተገቢ ነው።",
    locale: "am_ET",
  },
};

const ALL_LANGS: Lang[] = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am"];

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
  // .jpg, not .png — WhatsApp's OG scraper silently dropped the
  // gradient-heavy 928 KB PNG in our 2026-06-18 launch test. Same
  // pixels at JPEG q85 are ~25 KB and scrape reliably.
  const ogImage = `/og/${lang}.jpg`;

  // Per-page canonical + hreflang. The middleware forwards the
  // ORIGINAL request path (with any /he, /de... prefix) in
  // x-gadit-path. Before 2026-07-04 the canonical was hardcoded to
  // the homepage for every route, which told Google to drop every
  // other page from the index ("Alternate page with proper canonical
  // tag" in the GSC report). Now each URL is canonical to itself and
  // its hreflang alternates point at the SAME page in each language.
  // Routes that define their own alternates (e.g. /word/[word])
  // override this wholesale, unchanged.
  const rawPath = headersList.get("x-gadit-path") || "/";
  const trimmed =
    rawPath !== "/" && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  const pathSegs = trimmed.split("/").filter(Boolean);
  const hasLangPrefix = !!pathSegs[0] && ALL_LANGS.includes(pathSegs[0] as Lang);
  const logicalPath = "/" + (hasLangPrefix ? pathSegs.slice(1) : pathSegs).join("/");
  const BASE = "https://www.gadit.app";
  const urlForLang = (l: Lang) =>
    l === "en"
      ? `${BASE}${logicalPath === "/" ? "" : logicalPath}`
      : `${BASE}/${l}${logicalPath === "/" ? "" : logicalPath}`;
  const canonical = trimmed === "/" ? BASE : `${BASE}${trimmed}`;

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
      canonical,
      languages: {
        ...Object.fromEntries(ALL_LANGS.map((l) => [l, urlForLang(l)])),
        "x-default": urlForLang("en"),
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: canonical,
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

const SUPPORTED_LANGS: Lang[] = ["he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja", "hi", "am"];

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
    initialLang === "he" || initialLang === "ar" || initialLang === "fa" ? "rtl" : "ltr";

  return (
    <html
      lang={initialLang}
      dir={initialDir}
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${cairo.variable} ${fraunces.variable} ${notoNaskhArabic.variable} ${lora.variable} ${inter.variable} ${heebo.variable} ${jetbrainsMono.variable} ${notoSansJp.variable} ${notoSansDevanagari.variable} ${notoSansEthiopic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <LangProvider initialLang={initialLang}>
            <AuthProvider>
              {/* MarketingHeader is rendered per-route from each page's
                  Client component, so it sits inside the dark canvas
                  with the rest of the chrome. Header is no longer
                  global. */}
              <LoginModal />
              {/* KidRouteGuard reads useAuth()/useHref(), so it MUST live
                  inside AuthProvider + LangProvider (not next to
                  RefCapture, which is provider-free). */}
              <KidRouteGuard />
              {children}
              <InstallPwaPrompt />
            </AuthProvider>
          </LangProvider>
          <ServiceWorkerRegister />
          <AutoUpdater />
          <RefCapture />
          <Analytics />
          <SpeedInsights />
          {/* Meta Pixel — base code + funnel standard events (see
              components/MetaPixel.tsx). Never loads on /c/ classroom
              routes: kids on school devices are not ad-tracking
              subjects, by policy and by positioning. */}
          <MetaPixel />
          {/* Affonso affiliate-tracking pixel. RESTORED 2026-08-05: the
              embed DASHBOARD was retired (bad API key) and /affiliate now
              redirects to the in-house /partners portal, but Affonso's
              MARKETPLACE keeps bringing international affiliates Gadi never
              recruited, and this pixel is what credits their referrals. It
              runs IN PARALLEL with the in-house program: our RefCapture
              ignores codes that aren't in-house partners, Affonso ignores
              codes that aren't its own, so there is no double-attribution.
              First-party delivery via the /r/* rewrites in next.config.ts
              (defeats ad blockers). Program ID is public. */}
          <Script
            src="/r/pixel.js"
            strategy="afterInteractive"
            data-affonso="cmq3oz349000p11r2lloq0xb2"
            data-cookie_duration="60"
            data-api-base="/r"
          />
        </body>
    </html>
  );
}
