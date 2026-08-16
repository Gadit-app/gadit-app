"use client";

/**
 * AppearancePicker — the "choose your look" chips (Gadi 2026-08-16). Kids
 * pick a playful skin the way they pick a Roblox skin; adults get plain
 * light/dark. Sets the global data-theme via useTheme(). Purely visual, no
 * server state (localStorage + cross-tab sync in @/lib/appearance).
 */

import { useLang } from "@/lib/lang-context";
import {
  THEMES,
  KID_THEMES,
  ADULT_THEMES,
  useTheme,
  themeName,
  type ThemeMeta,
} from "@/lib/appearance";

export function AppearancePicker({ scope = "all" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang } = useLang();
  const [theme, setTheme] = useTheme();

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the 5 skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  return (
    <div className="wb-skin-picker" role="radiogroup" aria-label="Theme">
      {list.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={theme === t.id}
          className={`wb-skin-chip${theme === t.id ? " is-active" : ""}`}
          onClick={() => setTheme(t.id)}
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
  );
}
