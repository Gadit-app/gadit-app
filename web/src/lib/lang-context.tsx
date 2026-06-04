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
      const supported = new Set(["he", "en", "ar", "ru", "es", "pt", "fr"]);
      const url = new URL(window.location.href);
      const segs = url.pathname.split("/").filter(Boolean);
      if (segs.length > 0 && supported.has(segs[0])) {
        segs[0] = l;
      } else {
        segs.unshift(l);
      }
      url.pathname = "/" + segs.join("/");
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
