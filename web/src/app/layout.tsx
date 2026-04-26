import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik, Cairo, Fraunces, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
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
  weight: ["400", "500", "600"],
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gadit.app"),
  title: "Gadit — Every word, understood.",
  description: "Not just a dictionary. Understand any word in any language — instantly.",
  applicationName: "Gadit",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gadit",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "https://www.gadit.app",
    languages: {
      en: "https://www.gadit.app",
      he: "https://www.gadit.app",
      ar: "https://www.gadit.app",
      ru: "https://www.gadit.app",
      es: "https://www.gadit.app",
      pt: "https://www.gadit.app",
      fr: "https://www.gadit.app",
      "x-default": "https://www.gadit.app",
    },
  },
  openGraph: {
    title: "Gadit — Every word, understood.",
    description: "Not just a dictionary. Understand any word in any language — instantly.",
    url: "https://www.gadit.app",
    siteName: "Gadit",
    type: "website",
    locale: "en_US",
    alternateLocale: ["he_IL", "ar", "ru_RU", "es_ES", "pt_BR", "fr_FR"],
  },
  twitter: {
    card: "summary",
    title: "Gadit — Every word, understood.",
    description: "Not just a dictionary. Understand any word in any language — instantly.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${cairo.variable} ${fraunces.variable} ${notoNaskhArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <LangProvider>
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
        </body>
    </html>
  );
}
