"use client";

/**
 * AppearancePicker — compact "choose your look" DROPDOWN (Gadi 2026-08-16).
 * Lives in the topbar so a kid can change their skin from any screen (word
 * collection, games, search), not from inside one page. Kids pick a playful
 * skin the way they pick a Roblox skin. Sets the global data-theme via
 * useTheme() (localStorage + cross-tab sync in @/lib/appearance); purely
 * visual, no server state.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import {
  THEMES,
  KID_THEMES,
  ADULT_THEMES,
  useTheme,
  themeName,
  type ThemeMeta,
} from "@/lib/appearance";

export function AppearancePicker({ scope = "kid" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang } = useLang();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the 5 skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="wb-skin-dd" ref={ref}>
      <button
        type="button"
        className="wb-skin-dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={themeName(current, lang)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="wb-skin-emoji" aria-hidden="true">{current.emoji}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="wb-skin-dd-menu" role="listbox">
          {list.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={theme === t.id}
              className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
              onClick={() => { setTheme(t.id); setOpen(false); }}
            >
              <span className="wb-skin-emoji" aria-hidden="true">{t.emoji}</span>
              <span className="wb-skin-name">{themeName(t, lang)}</span>
              <span className="wb-skin-dots" aria-hidden="true">
                {t.swatch.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
