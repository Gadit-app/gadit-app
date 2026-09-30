"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/lang-context";
import { cjkHref } from "@/lib/cjk-fonts";

/**
 * Chinese / Japanese / Korean fonts load at RUNTIME from Google Fonts, and
 * only on those UI languages. Their glyph sets are tens of MB split into ~100
 * unicode-range slices, too heavy to keep in the repo; the browser downloads
 * only the slices a page actually uses. Everything else is self-hosted
 * (src/app/fonts.css), so the build never calls Google. Gadi 2026-09-30.
 */
/** Adds the stylesheet when the user switches to a CJK language in-app. */
export function CjkFonts() {
  const { lang } = useLang();
  useEffect(() => {
    const href = cjkHref(lang);
    if (!href || document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [lang]);
  return null;
}
