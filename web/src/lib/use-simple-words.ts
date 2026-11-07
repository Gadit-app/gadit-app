"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

/**
 * "In simple words" (Gadi 2026-11-05): grown-ups want simple definitions too.
 * It shows the same short explanation Kids Mode shows (the kidsExplanation
 * every paid definition already carries, so it costs nothing), without the
 * rest of Kids Mode: no kid skins, no kid menu, no kid pictures. Open to
 * every paid plan, Individual included; Kids Mode stays a Family tool.
 *
 * Kept on the device, like Kids Mode, and synced across components and tabs.
 * Counts as on only for a paid plan, so a switch left on from a paid account
 * (or set by hand in storage) does nothing on a free one.
 */
const KEY = "gadit-simple-words";
const EVENT_NAME = "gadit-simple-words-change";

const read = () => {
  try { return typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1"; } catch { return false; }
};

export function useSimpleWords(): [boolean, (next: boolean) => void] {
  const { plan } = useAuth();
  const paid = plan === "clear" || plan === "deep";
  const [on, setOn] = useState<boolean>(read);
  useEffect(() => {
    const sync = () => setOn(read());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);
  const set = useCallback((next: boolean) => {
    try {
      if (next) window.localStorage.setItem(KEY, "1");
      else window.localStorage.removeItem(KEY);
    } catch { /* storage blocked */ }
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);
  return [on && paid, set];
}

/** The switch's name in every UI language. */
export const SIMPLE_WORDS_LABEL: Record<string, string> = {
  he: "במילים פשוטות",
  en: "In simple words",
  ar: "بكلمات بسيطة",
  ru: "Простыми словами",
  uk: "Простими словами",
  es: "En palabras simples",
  pt: "Em palavras simples",
  fr: "En mots simples",
  de: "In einfachen Worten",
  cs: "Jednoduše",
  sk: "Jednoducho",
  pl: "Prostymi słowami",
  it: "In parole semplici",
  nl: "In eenvoudige woorden",
  da: "Med enkle ord",
  el: "Με απλά λόγια",
  hu: "Egyszerűen",
  tr: "Basit kelimelerle",
  id: "Dengan kata sederhana",
  vi: "Bằng lời đơn giản",
  fil: "Sa simpleng salita",
  af: "In eenvoudige woorde",
  sw: "Kwa maneno rahisi",
  ja: "かんたんに",
  "zh-CN": "简单说",
  "zh-TW": "簡單說",
  ko: "쉬운 말로",
  th: "แบบง่าย ๆ",
  hi: "आसान शब्दों में",
  bn: "সহজ কথায়",
  am: "በቀላል ቃላት",
  fa: "به زبان ساده",
  zu: "Ngamagama alula",
  xh: "Ngamagama alula",
  nso: "Ka mantšu a bonolo",
  tn: "Ka mafoko a a bonolo",
  st: "Ka mantswe a bonolo",
  ts: "Hi marito yo olova",
  ss: "Ngemagama lalula",
  ve: "Nga maipfi a leluwaho",
  nr: "Ngamagama alula",
};
export const simpleWordsLabel = (lang: string) => SIMPLE_WORDS_LABEL[lang] ?? SIMPLE_WORDS_LABEL.en;
