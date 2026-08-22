"use client";

/**
 * AppearancePicker — compact "choose your look" DROPDOWN (Gadi 2026-08-16).
 * Lives in the topbar so a kid can change their skin from any screen (word
 * collection, games, search), not from inside one page. Kids pick a playful
 * skin the way they pick a Roblox skin. Sets the global data-theme via
 * useTheme() (localStorage + cross-tab sync in @/lib/appearance); purely
 * visual, no server state.
 *
 * Kids gamification v2 (unlock economy, 2026-08-22): the 5 original skins are
 * free, but new skins (sunset/aurora/cosmos/lava) UNLOCK as the child climbs
 * ranks. Availability is derived from the child's EARNED rank, not gift
 * points, so it can't be faked. Locked skins show a 🔒 and the rank needed.
 */

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { useAuth } from "@/lib/auth-context";
import {
  THEMES,
  KID_THEMES,
  ADULT_THEMES,
  useTheme,
  themeName,
  type ThemeMeta,
} from "@/lib/appearance";
import { RANKS, rankFor, POINTS } from "@/lib/gamification";
import { rankLabel } from "@/lib/gamification-labels";

const UNLOCK_AT: Record<string, string> = { en: "unlock at", he: "נפתח בדרגת" };
function unlockLabel(lang: string) { return UNLOCK_AT[lang] ?? UNLOCK_AT.en; }

// Session cache of the kid's earned rank index. The KidsGameHeader writes it
// on every compute; the picker reads it here (or fetches once if absent, e.g.
// on the word page where no header is mounted). Shared key.
const RANK_CACHE = "gadit-kid-rankindex";

export function AppearancePicker({ scope = "kid" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang } = useLang();
  const { user } = useAuth();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const [rankIndex, setRankIndex] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  // Resolve the kid's earned rank so we know which skins are unlocked.
  useEffect(() => {
    if (scope !== "kid") return;
    try {
      const cached = sessionStorage.getItem(RANK_CACHE);
      if (cached != null) { setRankIndex(Number(cached) || 0); return; }
    } catch { /* sessionStorage blocked */ }
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/notebook", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const data = (await res.json()) as { items?: Array<{ understood?: boolean }> };
        const items = data.items ?? [];
        const points = items.length + items.filter((i) => i.understood).length * POINTS.understood;
        const idx = rankFor(points).index;
        if (!cancelled) {
          setRankIndex(idx);
          try { sessionStorage.setItem(RANK_CACHE, String(idx)); } catch { /* ignore */ }
        }
      } catch { /* gamification gating is best-effort */ }
    })();
    return () => { cancelled = true; };
  }, [scope, user]);

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

  function isLocked(t: ThemeMeta): boolean {
    return t.unlockAtRank != null && rankIndex < t.unlockAtRank;
  }

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
          {list.map((t) => {
            const locked = isLocked(t);
            const justUnlocked = t.unlockAtRank != null && t.unlockAtRank === rankIndex;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={theme === t.id}
                aria-disabled={locked}
                className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
                style={locked ? { cursor: "not-allowed", opacity: 0.6 } : undefined}
                onClick={() => { if (locked) return; setTheme(t.id); setOpen(false); }}
              >
                <span className="wb-skin-emoji" aria-hidden="true">{locked ? "🔒" : t.emoji}</span>
                <span className="wb-skin-name" style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {themeName(t, lang)}
                    {justUnlocked && !locked && <span aria-hidden="true">✨</span>}
                  </span>
                  {locked && (
                    <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>
                      {unlockLabel(lang)} {rankLabel(RANKS[t.unlockAtRank!].key, lang)}
                    </span>
                  )}
                </span>
                <span className="wb-skin-dots" aria-hidden="true" style={locked ? { filter: "grayscale(0.7)" } : undefined}>
                  {t.swatch.map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
