"use client";
import { useState } from "react";
import Link from "next/link";

type Locale = "en" | "he";

export default function LegalPage({
  en,
  he,
  lastUpdated,
}: {
  en: { title: string; body: React.ReactNode };
  he: { title: string; body: React.ReactNode };
  lastUpdated: string;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const active = locale === "en" ? en : he;
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Language toggle */}
        <div className="flex justify-end mb-6" dir="ltr">
          <div className="inline-flex rounded-full bg-white border border-slate-200 p-1 text-xs">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: locale === "en" ? "rgb(37 99 235)" : "transparent",
                color: locale === "en" ? "white" : "rgb(100 116 139)",
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale("he")}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: locale === "he" ? "rgb(37 99 235)" : "transparent",
                color: locale === "he" ? "white" : "rgb(100 116 139)",
              }}
            >
              עברית
            </button>
          </div>
        </div>

        <article className="bg-white rounded-3xl px-6 sm:px-10 py-8 sm:py-10" style={{ border: "1px solid rgb(226 232 240 / 0.9)", boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.04)" }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0F172A", letterSpacing: "-0.5px" }}>
            {active.title}
          </h1>
          <p className="text-xs text-slate-400 mb-8">
            {locale === "en" ? "Last updated: " : "עודכן לאחרונה: "}
            {lastUpdated}
          </p>

          <div className="legal-body">{active.body}</div>

          {locale === "he" && (
            <p className="text-xs text-slate-400 mt-10 pt-6 border-t border-slate-100">
              תרגום זה ניתן לנוחות בלבד. בכל מקרה של סתירה בין הנוסח העברי לאנגלי —{" "}
              <button
                type="button"
                onClick={() => setLocale("en")}
                className="underline hover:text-blue-600"
              >
                הנוסח האנגלי
              </button>{" "}
              הוא המחייב.
            </p>
          )}
        </article>

        <Link href="/" className="block text-center mt-8 text-sm text-slate-500 hover:text-blue-600 transition-colors">
          {locale === "en" ? "← Back to Gadit" : "→ חזרה ל-Gadit"}
        </Link>
      </div>
    </main>
  );
}
