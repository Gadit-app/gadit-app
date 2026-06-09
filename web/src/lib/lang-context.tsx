"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Lang, detectBrowserLang, getLangDir, T } from "./i18n";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof T["en"];
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextType | null>(null);

/**
 * LangProvider accepts an optional `initialLang` so the server can pass
 * the lang it read from the cookie. When provided, the first client
 * render matches the server render (no hydration mismatch) AND the
 * correct language shows from the very first frame (no English flash).
 *
 * On first load without a cookie, falls back to the browser locale,
 * but that still gives a single frame of English content for users
 * whose browser locale doesn't match their chosen UI — which is rare.
 */
export function LangProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? "en");

  useEffect(() => {
    // If the server didn't seed us (first visit), fall back to the
    // previously-saved choice in localStorage or detected browser lang.
    if (initialLang) return;
    const saved = localStorage.getItem("gadit-lang") as Lang | null;
    setLangState(saved ?? detectBrowserLang());
  }, [initialLang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("gadit-lang", l);
    } catch { /* private mode / blocked */ }
    // Cookie persists across reloads and lets the server read the lang
    // during SSR so /word and /home don't flash English first.
    try {
      document.cookie = `gadit-lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch { /* ignore */ }
    // Update the URL to carry the new lang prefix so the page can be
    // shared in this language. Middleware accepts /he/pricing,
    // /en/word/X, etc. — we just swap the leading segment.
    try {
      // English is the canonical brand surface — no prefix.
      // Every other supported language carries a /<lang>/ prefix so
      // the URL the user is on stays shareable in that language.
      // Keep this set in sync with middleware.ts SUPPORTED_LANGS.
      const supported = new Set([
        "he", "en", "ar", "ru", "es", "pt", "fr", "de", "cs", "sk", "it", "ja",
      ]);
      const url = new URL(window.location.href);
      const segs = url.pathname.split("/").filter(Boolean);
      // Strip any existing lang prefix so we don't end up with
      // /fr/de/pricing when switching from German to French.
      if (segs.length > 0 && supported.has(segs[0])) {
        segs.shift();
      }
      // Re-add the new prefix only for non-default langs.
      if (l !== "en") segs.unshift(l);
      url.pathname = segs.length ? "/" + segs.join("/") : "/";
      window.history.replaceState({}, "", url.toString());
    } catch { /* ignore */ }
  }

  const dir = getLangDir(lang);

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang], dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
