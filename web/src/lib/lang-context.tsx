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

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("gadit-lang") as Lang | null;
    setLangState(saved ?? detectBrowserLang());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("gadit-lang", l);
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
