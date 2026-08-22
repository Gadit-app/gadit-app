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

// Store micro-copy (en + he, English fallback — matches the existing picker
// label pattern; full-language coverage is a follow-up like UNLOCK_AT).
const STORE_COPY: Record<string, { balance: string; buy: string; owned: string; need: string }> = {
  en: { balance: "Gift points", buy: "Get", owned: "Yours", need: "more to get" },
  he: { balance: "נקודות מתנה", buy: "קבל", owned: "שלך", need: "עוד כדי לקבל" },
};
function storeCopy(lang: string) { return STORE_COPY[lang] ?? STORE_COPY.en; }

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
  const [giftPoints, setGiftPoints] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = storeCopy(lang);

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

  // Load the kid's gift wallet (balance + owned skins) for the store. Refetch
  // when the menu opens so a fresh parent gift shows without a reload.
  useEffect(() => {
    if (scope !== "kid" || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/api/kids/wallet", { headers: { Authorization: `Bearer ${idToken}` } });
        if (!res.ok) return;
        const w = (await res.json()) as { giftPoints?: number; ownedSkins?: string[] };
        if (cancelled) return;
        setGiftPoints(Number(w.giftPoints) || 0);
        setOwnedSkins(Array.isArray(w.ownedSkins) ? w.ownedSkins : []);
      } catch { /* wallet is best-effort; store just shows 0 */ }
    })();
    return () => { cancelled = true; };
  }, [scope, user, open]);

  async function buySkin(t: ThemeMeta) {
    if (!user || t.price == null || buying) return;
    setBuying(t.id);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/kids/buy-skin", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ themeId: t.id }),
      });
      const data = (await res.json()) as { owned?: boolean; giftPoints?: number; ownedSkins?: string[] };
      if (res.ok && data.owned) {
        setGiftPoints(Number(data.giftPoints) || 0);
        setOwnedSkins(Array.isArray(data.ownedSkins) ? data.ownedSkins : ownedSkins);
        setTheme(t.id); // wear it right away — the reward moment
        setOpen(false);
      }
    } catch { /* leave state as-is on failure */ } finally {
      setBuying(null);
    }
  }

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

  // A skin can be reached two ways: EARNED by climbing ranks (free) or BOUGHT
  // with gift points. It is selectable if free, rank-reached, or owned; else
  // it is for sale (and affordable when the wallet covers the price).
  function skinState(t: ThemeMeta) {
    const rankReached = t.unlockAtRank != null && rankIndex >= t.unlockAtRank;
    const isFree = t.unlockAtRank == null && t.price == null;
    const isOwned = t.price != null && ownedSkins.includes(t.id);
    const selectable = isFree || rankReached || isOwned;
    const forSale = !selectable && t.price != null;
    const affordable = forSale && giftPoints >= (t.price ?? Infinity);
    return { selectable, isOwned, forSale, affordable, rankReached };
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
          {scope === "kid" && (
            <div className="wb-skin-dd-wallet" aria-hidden="true">
              <span>🎁 {copy.balance}</span>
              <strong>{giftPoints}</strong>
            </div>
          )}
          {list.map((t) => {
            const st = skinState(t);
            const justUnlocked = t.unlockAtRank != null && t.unlockAtRank === rankIndex;
            const busy = buying === t.id;
            // The whole row acts as: select (selectable) | buy (for sale &
            // affordable) | inert (for sale & too dear).
            const onClick = () => {
              if (busy) return;
              if (st.selectable) { setTheme(t.id); setOpen(false); return; }
              if (st.forSale && st.affordable) { void buySkin(t); }
            };
            const inert = st.forSale && !st.affordable;
            const shortRankHint = t.unlockAtRank != null && !st.rankReached && !st.isOwned;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={theme === t.id}
                aria-disabled={inert}
                className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
                style={inert ? { cursor: "not-allowed", opacity: 0.65 } : busy ? { opacity: 0.7 } : undefined}
                onClick={onClick}
              >
                <span className="wb-skin-emoji" aria-hidden="true">{st.forSale ? "🔒" : t.emoji}</span>
                <span className="wb-skin-name" style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {themeName(t, lang)}
                    {justUnlocked && st.selectable && <span aria-hidden="true">✨</span>}
                    {st.isOwned && <span className="wb-skin-owned" aria-hidden="true">{copy.owned}</span>}
                  </span>
                  {st.forSale && (
                    <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 500 }}>
                      {st.affordable
                        ? `${copy.buy} · 🎁 ${t.price}`
                        : `🎁 ${t.price} · ${(t.price ?? 0) - giftPoints} ${copy.need}`}
                      {shortRankHint && ` · ${unlockLabel(lang)} ${rankLabel(RANKS[t.unlockAtRank!].key, lang)}`}
                    </span>
                  )}
                </span>
                <span className="wb-skin-dots" aria-hidden="true" style={st.forSale ? { filter: "grayscale(0.7)" } : undefined}>
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
