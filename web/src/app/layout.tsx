import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik, Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LangProvider } from "@/lib/lang-context";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";
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
  alternates: {
    canonical: "https://www.gadit.app",
    // Tell Google the same page serves multiple language variants based on the
    // user's chosen UI locale. The URL is the same — the served language is
    // selected client-side from LangContext + cookie.
    languages: {
      en: "https://www.gadit.app",
      he: "https://www.gadit.app",
      ar: "https://www.gadit.app",
      ru: "https://www.gadit.app",
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
    alternateLocale: ["he_IL", "ar", "ru_RU"],
  },
  twitter: {
    card: "summary",
    title: "Gadit — Every word, understood.",
    description: "Not just a dictionary. Understand any word in any language — instantly.",
  },
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
          <Analytics />
          <SpeedInsights />
        </body>
    </html>
  );
}
