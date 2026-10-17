"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";

export type CopyLoaders<T> = Record<string, () => Promise<{ default: T }>>;

/**
 * The copy of a landing page in the visitor's language (2026-10-17). The
 * server sends the copy of the language it rendered; when the visitor picks
 * another language (the switcher changes the language without a reload),
 * that language's copy file is fetched on demand, so a visitor only ever
 * downloads the languages they look at. Until it arrives the page stays as
 * it was. A language with no copy file falls back to English.
 */
export function useLandingCopy<T>(loaders: CopyLoaders<T>, initial: { lang: string; copy: T }): { lang: string; copy: T } {
  const { lang } = useLang();
  // asked: the language the copy was loaded for; shown: the copy's own language.
  const [cur, setCur] = useState({ asked: initial.lang, lang: initial.lang, copy: initial.copy });
  useEffect(() => {
    if (lang === cur.asked) return;
    let alive = true;
    const own = !!loaders[lang];
    void (own ? loaders[lang] : loaders.en)().then((m) => { if (alive) setCur({ asked: lang, lang: own ? lang : "en", copy: m.default }); }).catch(() => {});
    return () => { alive = false; };
  }, [lang, cur.asked, loaders]);
  return { lang: cur.lang, copy: cur.copy };
}
