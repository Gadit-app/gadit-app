"use client";

/**
 * Walkthrough — the in-app tutorial "video" player.
 *
 * The "videos" are NOT recorded footage. Each is a phone frame that steps
 * through a few DOM frames — every frame a faithful recreation of a real Gadit
 * screen (same colors, same icons) — with a caption and a blinking tap marker.
 * Why: never goes stale (update a frame in code, not a re-shoot), free
 * translation (text comes from i18n), light + fast (no video files), and
 * visually consistent with the app. Modeled on the Yooniz walkthrough system.
 *
 * Playback rules: a guide plays ONLY on demand, and only ONE at a time — the
 * fullscreen modal is where a guide actually runs. Steps auto-advance ~3s; the
 * user can step back/forward or replay; the last step reveals a single CTA.
 */

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { useLang } from "@/lib/lang-context";
import { track } from "@/lib/track";

export type WalkStep = {
  /** What happens in this step — shown as the caption under the frame. */
  caption: string;
  /** The recreated screen JSX. Must fill its container (100% w/h). */
  screen: ReactNode;
  /** Optional blinking tap marker, positioned in % of the frame. */
  tap?: { x: string; y: string };
};

const STEP_MS = 3000;

const CHROME: Record<string, { close: string; replay: string; step: string; got: string; back: string; next: string }> = {
  en: { close: "Close", replay: "Replay", step: "Step", got: "Got it", back: "Back", next: "Next" },
  he: { close: "סגירה", replay: "לצפייה שוב", step: "שלב", got: "הבנתי", back: "הקודם", next: "הבא" },
  ar: { close: "إغلاق", replay: "إعادة", step: "خطوة", got: "فهمت", back: "السابق", next: "التالي" },
  ru: { close: "Закрыть", replay: "Заново", step: "Шаг", got: "Понятно", back: "Назад", next: "Далее" },
  es: { close: "Cerrar", replay: "Repetir", step: "Paso", got: "Entendido", back: "Atrás", next: "Siguiente" },
  fr: { close: "Fermer", replay: "Revoir", step: "Étape", got: "Compris", back: "Retour", next: "Suivant" },
};
function chrome(lang: string) {
  return CHROME[lang] ?? CHROME.en;
}

/** The phone-frame player. Plays only when `playing` is true. */
export function WalkthroughPlayer({
  steps,
  playing,
  onReachEnd,
}: {
  steps: WalkStep[];
  playing: boolean;
  onReachEnd?: () => void;
}) {
  const { lang, dir } = useLang();
  const c = chrome(lang);
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to the first frame whenever playback (re)starts.
  useEffect(() => {
    if (playing) setI(0);
  }, [playing]);

  // Auto-advance while playing, stopping on the final frame.
  useEffect(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!playing) return;
    if (i >= steps.length - 1) { onReachEnd?.(); return; }
    timer.current = setTimeout(() => setI((n) => Math.min(n + 1, steps.length - 1)), STEP_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [i, playing, steps.length, onReachEnd]);

  const step = steps[i];
  if (!step) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minHeight: 0, flex: 1 }} dir={dir}>
      {/* Phone frame — fixed 540:1020 aspect, fills the height it's given. */}
      <div
        style={{
          position: "relative",
          aspectRatio: "540 / 1020",
          height: "100%",
          maxHeight: "62vh",
          maxWidth: "100%",
          borderRadius: 30,
          border: "8px solid #0B1220",
          background: "#F2F6F4",
          overflow: "hidden",
          boxShadow: "0 22px 50px rgba(11,18,32,0.28)",
          flex: "0 1 auto",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }} dir={dir}>{step.screen}</div>
        {step.tap && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: step.tap.x,
              top: step.tap.y,
              width: 34,
              height: 34,
              marginInlineStart: -17,
              marginTop: -17,
              borderRadius: "50%",
              background: "rgba(14,165,165,0.35)",
              border: "2px solid #0EA5A5",
              animation: "gd-walk-tap 1.1s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Caption */}
      <div style={{ textAlign: "center", minHeight: 44 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0EA5A5", letterSpacing: ".04em", marginBottom: 3 }}>
          {c.step} {i + 1}/{steps.length}
        </div>
        <div style={{ fontSize: 15.5, lineHeight: 1.5, color: "var(--ink, #0B1220)", maxWidth: 420 }}>
          {step.caption}
        </div>
      </div>

      {/* Progress dots + manual controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          aria-label={c.back}
          style={ctrlBtn(i === 0)}>{dir === "rtl" ? "›" : "‹"}</button>
        <div style={{ display: "flex", gap: 6 }}>
          {steps.map((_, k) => (
            <span key={k} onClick={() => setI(k)} style={{
              width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
              background: k === i ? "#0EA5A5" : "var(--hairline, #D6DEE0)",
              transition: "background .2s",
            }} />
          ))}
        </div>
        <button type="button" onClick={() => setI((n) => Math.min(steps.length - 1, n + 1))} disabled={i >= steps.length - 1}
          aria-label={c.next}
          style={ctrlBtn(i >= steps.length - 1)}>{dir === "rtl" ? "‹" : "›"}</button>
      </div>
    </div>
  );
}

function ctrlBtn(disabled: boolean): CSSProperties {
  return {
    width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--hairline,#E5E7EB)",
    background: "var(--surface,#fff)", color: "var(--ink,#0B1220)", fontSize: 20, lineHeight: 1,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, display: "grid", placeItems: "center",
  };
}

/** Fullscreen modal — the one place a guide actually runs. */
export function WalkthroughModal({
  guideId,
  title,
  steps,
  ctaLabel,
  onCta,
  onClose,
}: {
  guideId: string;
  title: string;
  steps: WalkStep[];
  ctaLabel?: string;
  onCta?: () => void;
  onClose: () => void;
}) {
  const { lang, dir } = useLang();
  const c = chrome(lang);
  const [atEnd, setAtEnd] = useState(false);
  const [playToken, setPlayToken] = useState(0);

  // One guide open at a time + a measurement event, on open.
  useEffect(() => {
    track("guide_open", { guide: guideId, lang });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [guideId, lang, onClose]);

  return (
    <div
      dir={dir}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1100, background: "rgba(11,18,32,0.72)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
        padding: "max(16px, env(safe-area-inset-top)) 16px 20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface, #fff)", color: "var(--ink,#0B1220)", borderRadius: 20,
          width: "100%", maxWidth: 480, flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
          padding: "16px 18px 18px", boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          fontFamily: '"Rubik", system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{title}</h2>
          <button type="button" onClick={onClose} aria-label={c.close}
            style={{ flex: "none", width: 30, height: 30, borderRadius: 9, border: "1px solid var(--hairline,#E5E7EB)",
              background: "var(--paper,#F3F4F6)", color: "var(--ink-muted,#6B7280)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        {/* Player fills the remaining height */}
        <WalkthroughPlayer key={playToken} steps={steps} playing onReachEnd={() => setAtEnd(true)} />

        {/* Footer: CTA appears once the guide has played through */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
          <button type="button" onClick={() => { setAtEnd(false); setPlayToken((t) => t + 1); }}
            style={{ padding: "11px 18px", borderRadius: 12, border: "1px solid var(--hairline,#E5E7EB)",
              background: "transparent", color: "var(--ink,#0B1220)", fontSize: 14, fontWeight: 600, cursor: "pointer",
              opacity: atEnd ? 1 : 0.55 }}>
            {c.replay}
          </button>
          <button type="button" onClick={() => { (onCta ?? onClose)(); }}
            style={{ padding: "11px 22px", borderRadius: 12, border: "none",
              background: "#0EA5A5", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {ctaLabel || c.got}
          </button>
        </div>
      </div>
    </div>
  );
}
