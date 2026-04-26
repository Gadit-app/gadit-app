"use client";

/**
 * LangSwitcher — language picker for V2 surfaces.
 *
 * Two visual variants on the same dropdown:
 *   - "dark"  → for the navy header. Pill button with translucent fill,
 *               panel sits below with backdrop blur.
 *   - "muted" → for the footer's quieter band. Plainer pill, same panel.
 *
 * Both variants render a globe icon + the active language's native
 * label (e.g. "עברית", "Français") so the user can read it even when
 * the rest of the UI is in a language they don't speak — important for
 * the recovery case where someone landed in the wrong locale.
 *
 * The dropdown panel itself is always warm-paper on dark backdrop,
 * regardless of variant — that's the same surface treatment as result
 * cards and pricing tiers, so it feels native to the design system.
 *
 * Closes on: outside click, ESC, language selection.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { LANGUAGES, type Lang } from "@/lib/i18n";

type Variant = "dark" | "muted";

export function LangSwitcher({ variant = "dark" }: { variant?: Variant }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click + ESC
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

  const triggerStyle =
    variant === "dark"
      ? {
          color: "oklch(0.92 0.01 265)",
          background: "oklch(1 0 0 / 0.06)",
          boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.12)",
        }
      : {
          color: "oklch(0.78 0.02 265)",
          background: "oklch(1 0 0 / 0.03)",
          boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 0.08)",
        };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="gd-font-sans-ui inline-flex items-center gap-2 transition-colors"
        style={{
          fontSize: 13,
          fontWeight: 500,
          padding: "8px 14px",
          borderRadius: 999,
          ...triggerStyle,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M1.5 7h11M7 1.5c1.7 2 1.7 9 0 11M7 1.5c-1.7 2-1.7 9 0 11"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span>{active.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .15s",
          }}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language"
          style={{
            position: "absolute",
            insetBlockStart: "calc(100% + 8px)",
            insetInlineEnd: 0,
            minWidth: 180,
            background: "var(--gd-paper-50)",
            color: "var(--gd-ink-900)",
            borderRadius: 14,
            padding: 6,
            boxShadow:
              "0 0 0 1px oklch(0 0 0 / 0.08), " +
              "0 18px 40px -12px oklch(0.08 0.08 260 / 0.6), " +
              "0 6px 18px -8px oklch(0.08 0.08 260 / 0.45)",
            zIndex: 50,
          }}
        >
          {LANGUAGES.map((l) => {
            const selected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setLang(l.code as Lang);
                  setOpen(false);
                }}
                className="gd-font-sans-ui w-full text-start flex items-center justify-between transition-colors"
                style={{
                  fontSize: 13.5,
                  padding: "9px 12px",
                  borderRadius: 9,
                  background: selected ? "oklch(0.72 0.19 245 / 0.1)" : "transparent",
                  color: selected ? "oklch(0.42 0.15 250)" : "var(--gd-ink-700)",
                  fontWeight: selected ? 600 : 500,
                  // Native labels include Arabic/Hebrew, so let the
                  // language's own script render naturally regardless of
                  // the surrounding UI direction.
                  direction: l.dir,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0 0 0 / 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }
                }}
              >
                <span>{l.label}</span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3 7.5l2.5 2.5L11 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
