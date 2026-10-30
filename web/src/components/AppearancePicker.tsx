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
import { RANKS } from "@/lib/gamification";
import { useServerRank } from "@/lib/use-rank-state";
import { rankLabel } from "@/lib/gamification-labels";
import { SkinsPanel, SkinUnlockMoment, skinCopy } from "@/components/KidSkins";
import { KidsCelebration } from "@/components/design/KidsCelebration";
import { avatarUrl } from "@/lib/family";

// The hint under a locked skin: the rank it opens at, in every UI language.
const LOCK_COPY: Record<string, { orRank: string }> = {
  en: { orRank: "Opens at {rank}" },
  ar: { orRank: "يفتح عند {rank}" },
  ru: { orRank: "Открывается на {rank}" },
  es: { orRank: "Se abre en {rank}" },
  pt: { orRank: "Abre em {rank}" },
  fr: { orRank: "S'ouvre à {rank}" },
  de: { orRank: "Öffnet sich bei {rank}" },
  cs: { orRank: "Otevře se na {rank}" },
  sk: { orRank: "Otvorí sa na {rank}" },
  it: { orRank: "Si sblocca a {rank}" },
  ja: { orRank: "{rank}でひらくよ" },
  hi: { orRank: "{rank} पर खुलता है" },
  am: { orRank: "በ{rank} ይከፈታል" },
  uk: { orRank: "Відкривається на {rank}" },
  tr: { orRank: "{rank} seviyesinde açılır" },
  pl: { orRank: "Odblokowuje się na poziomie {rank}" },
  fa: { orRank: "در {rank} باز می‌شود" },
  id: { orRank: "Terbuka di {rank}" },
  nl: { orRank: "Gaat open bij {rank}" },
  el: { orRank: "Ξεκλειδώνει στο {rank}" },
  zu: { orRank: "Kuvuleka ku-{rank}" },
  xh: { orRank: "Iyavuleka ku-{rank}" },
  nso: { orRank: "E bula go {rank}" },
  tn: { orRank: "E bulega kwa {rank}" },
  st: { orRank: "E bula ho {rank}" },
  ts: { orRank: "Yi pfuleka eka {rank}" },
  ss: { orRank: "Kuyavuleka ku-{rank}" },
  ve: { orRank: "Zwi vulea kha {rank}" },
  nr: { orRank: "Kuvuleka ku-{rank}" },
  vi: { orRank: "Mở ở {rank}" },
  fil: { orRank: "Magbubukas sa {rank}" },
  af: { orRank: "Maak oop by {rank}" },
  sw: { orRank: "Hufunguka kwenye {rank}" },
  "zh-CN": { orRank: "在 {rank} 解锁" },
  "zh-TW": { orRank: "在 {rank} 解鎖" },
  ko: { orRank: "{rank}에서 열려" },
  th: { orRank: "เปิดที่ {rank}" },
  bn: { orRank: "{rank}-এ খুলবে" },
  da: { orRank: "Åbner ved {rank}" },
  hu: { orRank: "{rank} szinten nyílik meg" },
  he: { orRank: "נפתח בדרגת {rank}" },
};
function lockCopy(lang: string) { return LOCK_COPY[lang] ?? LOCK_COPY.en; }

export function AppearancePicker({ scope = "kid" }: { scope?: "all" | "kid" | "adult" }) {
  const { lang, dir } = useLang();
  const { user, familyRole, avatarId } = useAuth();
  const [skinsOpen, setSkinsOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const copy = lockCopy(lang);

  const list: ThemeMeta[] =
    scope === "kid"
      ? [THEMES[0], ...KID_THEMES] // Light (classic) + the skins
      : scope === "adult"
        ? ADULT_THEMES
        : THEMES;

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  // The kid's rank as the server computes it (/api/rank: new words +
  // completed practices, never below the rank floor), so the unlocked skins
  // match the rank the child sees.
  const serverRank = useServerRank(user, scope === "kid");
  const rankIndex = serverRank?.rankIndex ?? 0;
  // Avatar skins open by completed practice (lib/looks.ts), kids only.
  const isKid = scope === "kid" && familyRole === "kid";
  const sc = skinCopy(lang);

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

  // A skin is unlocked PURELY by rank (= distinct words learned). Free skins
  // have no rank gate; earnable skins unlock when their rank is reached. No
  // gift-points / store path anymore (Gadi 2026-08-27).
  function bump() { setCelebrate((x) => x + 1); }

  function skinState(t: ThemeMeta) {
    const rankReached = t.unlockAtRank != null && rankIndex >= t.unlockAtRank;
    const isFree = t.unlockAtRank == null;
    const selectable = isFree || rankReached;
    return { selectable, rankReached };
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
          {isKid && user && (
            <>
              <button
                type="button"
                className="wb-skin-dd-item"
                onClick={() => { setOpen(false); setSkinsOpen(true); }}
                style={{ fontWeight: 800 }}
              >
                {avatarUrl(avatarId) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl(avatarId)!} alt="" width={26} height={26} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span className="wb-skin-emoji" aria-hidden="true">🧑‍🚀</span>
                )}
                <span className="wb-skin-name">{sc.open}</span>
              </button>
              <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.7, padding: "6px 10px 2px" }}>{sc.backgrounds}</div>
            </>
          )}
          {list.map((t) => {
            const st = skinState(t);
            const justUnlocked = t.unlockAtRank != null && t.unlockAtRank === rankIndex;
            const locked = !st.selectable;
            const onClick = () => { if (st.selectable) { setTheme(t.id); setOpen(false); } };
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={theme === t.id}
                aria-disabled={locked}
                className={`wb-skin-dd-item${theme === t.id ? " is-active" : ""}`}
                style={locked ? { cursor: "not-allowed", opacity: 0.65 } : undefined}
                onClick={onClick}
              >
                <span className="wb-skin-emoji" aria-hidden="true">{locked ? "🔒" : t.emoji}</span>
                <span className="wb-skin-name" style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                    {themeName(t, lang)}
                    {justUnlocked && st.selectable && <span aria-hidden="true">✨</span>}
                  </span>
                  {/* Locked → show the rank (words) it unlocks at. */}
                  {locked && t.unlockAtRank != null && (
                    <span className="wb-skin-earnhint">
                      {copy.orRank.replace("{rank}", rankLabel(RANKS[t.unlockAtRank].key, lang))}
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
      {isKid && user && skinsOpen && (
        <SkinsPanel user={user} lang={lang} dir={dir} practices={serverRank?.practices ?? 0} avatarId={avatarId} onClose={() => setSkinsOpen(false)} />
      )}
      {isKid && user && (
        <>
          <KidsCelebration runId={celebrate} />
          <SkinUnlockMoment user={user} lang={lang} dir={dir} practices={serverRank ? serverRank.practices : null} onCelebrate={bump} />
        </>
      )}
    </div>
  );
}
