"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { LANGUAGES, type Lang } from "@/lib/i18n";

/**
 * Compact language switcher meant for the mobile topbar.
 *
 * Motivation (2026-06-19, Reut's Russian-speaking friend): on mobile
 * the only language affordance is buried inside the burger menu, so
 * people who land in the wrong locale don't realise Gadit speaks
 * their language at all. This component sits inline in the topbar
 * next to the burger so the option is visible the moment the page
 * loads, just like on desktop.
 *
 * Visible only at screen widths ≤ 720px (the same breakpoint where
 * the desktop LangSwitch / wb-shell-actions row hides). On wider
 * screens this returns null structurally so no extra DOM ships.
 *
 * The trigger shows: globe icon + the 2-letter language code (HE,
 * EN, RU, AR, ES, PT, FR, DE, CS, SK, IT, JA). Code, not native
 * label, because labels like "Português" / "Slovenčina" / "العربية"
 * blow up the width budget next to the burger. A user who can't
 * decode the code still sees a language affordance and a globe icon,
 * which is enough signal to tap and discover the full list.
 *
 * The dropdown panel is identical to the desktop LangSwitch panel —
 * native labels with flag PNGs from flagcdn.com — so the discovery
 * flow lands them on familiar ground.
 */
export function LangSwitchMobile() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={wrapRef} className="wb-shell-lang-mobile-wrap">
      <button
        type="button"
        className="wb-shell-lang-mobile-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        <span className="wb-shell-lang-mobile-code">{active.code.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d={open ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
        </svg>
      </button>
      {open && (
        <ul className="wb-shell-lang-mobile-menu" role="listbox" aria-label="Language">
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className={l.code === lang ? "is-active" : ""}
                onClick={() => {
                  setLang(l.code as Lang);
                  setOpen(false);
                }}
                style={{ direction: l.dir }}
              >
                <img
                  className="wb-shell-lang-mobile-flag"
                  src={`https://flagcdn.com/40x30/${l.flag}.png`}
                  srcSet={`https://flagcdn.com/80x60/${l.flag}.png 2x`}
                  width={20}
                  height={15}
                  alt=""
                  loading="lazy"
                />
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
