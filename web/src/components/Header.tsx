"use client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { LANGUAGES } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { user, logout, promptLogin } = useAuth();
  const { lang, setLang, t, dir } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRTL = dir === "rtl";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-slate-100/80"
      style={{ background: "rgb(255 255 255 / 0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-6">

        {/* Logo — always on reading-start side */}
        <Link
          href="/"
          className="text-lg font-bold shrink-0"
          style={{ color: "#0F172A", order: isRTL ? 3 : 0 }}
        >
          <span style={{ color: "#2563EB" }}>Gad</span>it
        </Link>

        {/* Center nav — full on desktop, condensed on mobile */}
        <nav
          className="flex items-center gap-1 flex-1 justify-center min-w-0"
          style={{ order: 1 }}
          dir={dir}
        >
          <Link
            href="/"
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            {t.navSearch}
          </Link>
          <a
            href="/#how-it-works"
            className="hidden sm:inline-block px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            {t.navHowItWorks}
          </a>
          <a
            href="/#features"
            className="hidden sm:inline-block px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            {t.navFeatures}
          </a>
          <Link
            href="/pricing"
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            {t.pricing}
          </Link>
        </nav>

        {/* Right actions — always on reading-end side */}
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ order: isRTL ? 0 : 2 }}
        >
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen((v) => !v); setMenuOpen(false); }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="hidden sm:inline">{LANGUAGES.find((l) => l.code === lang)?.label}</span>
              <span className="text-xs opacity-60">▾</span>
            </button>
            {langOpen && (
              <div
                className="absolute top-11 bg-white rounded-2xl py-1.5 z-50 min-w-36"
                style={{
                  [isRTL ? "left" : "right"]: 0,
                  boxShadow: "0 4px 20px rgb(0 0 0 / 0.10), 0 1px 4px rgb(0 0 0 / 0.06)",
                  border: "1px solid rgb(226 232 240)"
                }}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-start px-4 py-2 text-sm transition-all hover:bg-slate-50 flex items-center justify-between ${lang === l.code ? "text-blue-600 font-semibold" : "text-slate-600"}`}
                  >
                    {l.label}
                    {lang === l.code && <span className="text-blue-500 text-xs">✓</span>}
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
                className="flex items-center gap-2 hover:opacity-80 transition-all rounded-full"
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
                <div
                  className="absolute top-11 bg-white rounded-2xl py-1.5 z-50 min-w-44"
                  style={{
                    [isRTL ? "left" : "right"]: 0,
                    boxShadow: "0 4px 20px rgb(0 0 0 / 0.10), 0 1px 4px rgb(0 0 0 / 0.06)",
                    border: "1px solid rgb(226 232 240)"
                  }}
                >
                  <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-100 truncate">
                    {user.displayName ?? user.email}
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-start px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    {t.accountNav}
                  </Link>
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
              className="px-4 py-1.5 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: "rgb(226 232 240)",
                color: "#374151",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(147 197 253)";
                (e.currentTarget as HTMLButtonElement).style.color = "#2563EB";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(226 232 240)";
                (e.currentTarget as HTMLButtonElement).style.color = "#374151";
              }}
            >
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
