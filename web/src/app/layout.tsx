import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import Header from "@/components/Header";
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
      className={`${geistSans.variable} ${geistMono.variable} ${rubik.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <LangProvider>
            <AuthProvider>
              <Header />
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
