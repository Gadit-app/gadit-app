"use client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LANGUAGES } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { user, logout, promptLogin } = useAuth();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-slate-100/80" style={{ background: "rgb(255 255 255 / 0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold shrink-0" style={{ color: "#0F172A" }}>
          <span style={{ color: "#2563EB" }}>Gad</span>it
        </Link>

        <div className="flex items-center gap-3 ms-auto">
          <a href="/#how-it-works" className="hidden md:block text-sm text-slate-500 hover:text-blue-600 transition-all">
            {t.navHowItWorks}
          </a>
          <a href="/#features" className="hidden md:block text-sm text-slate-500 hover:text-blue-600 transition-all">
            {t.navFeatures}
          </a>
          <Link href="/pricing" className="text-sm text-slate-500 hover:text-blue-600 transition-all">
            {t.pricing}
          </Link>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen((v) => !v); setMenuOpen(false); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              {LANGUAGES.find((l) => l.code === lang)?.label}
              <span className="text-xs">▾</span>
            </button>
            {langOpen && (
              <div className="absolute end-0 top-11 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 min-w-36 z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-start px-4 py-2 text-sm transition-all hover:bg-slate-50 ${lang === l.code ? "text-blue-600 font-semibold" : "text-slate-600"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setMenuOpen((v) => !v); setLangOpen(false); }}
                className="flex items-center gap-2 hover:opacity-80 transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "#2563EB" }}>
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                )}
              </button>
              {menuOpen && (
                <div className="absolute end-0 top-11 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 min-w-40 z-50">
                  <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100">
                    {user.displayName ?? user.email}
                  </div>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-start px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => promptLogin()}
              className="px-4 py-1.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
