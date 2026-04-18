import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import LoginModal from "@/components/LoginModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gadit — Every word, understood.",
  description: "Not just a dictionary. Understand any word in any language — instantly.",
  openGraph: {
    title: "Gadit — Every word, understood.",
    description: "Not just a dictionary. Understand any word in any language — instantly.",
    url: "https://gadit.app",
    siteName: "Gadit",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <AuthProvider>
            <Header />
            <LoginModal />
            {children}
          </AuthProvider>
        </body>
    </html>
  );
}
