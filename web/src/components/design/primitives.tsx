/**
 * Gadit V2 design system — primitive components.
 *
 * These are the small, reusable building blocks that show up across every
 * V2 screen (Result, Pricing, Login, Notebook, etc.). They render against
 * the dark navy stage and embed the electric-blue ring motif so the brand
 * language stays consistent.
 *
 * Tokens live in globals.css under the gd-* prefix; this file only consumes
 * them. If you need a new color or spacing value, add it as a CSS var first.
 */

import type { CSSProperties, ReactNode } from "react";

type Tier = "basic" | "clear" | "deep" | "free";

// ─── GaditMark ─────────────────────────────────────────────────────
// Echoes the app icon: white "G" inside an electric-blue ring on navy.
// Used in Header and anywhere the product mark appears at small scale.
export function GaditMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 50%, oklch(0.22 0.08 260) 0%, oklch(0.13 0.05 265) 100%)",
        boxShadow:
          "inset 0 0 0 1.2px oklch(0.72 0.19 245), " +
          "0 0 0 1px oklch(0.72 0.19 245 / 0.25), " +
          "0 0 10px oklch(0.72 0.19 245 / 0.5)",
        color: "white",
        fontFamily: "var(--font-fraunces), serif",
        fontWeight: 500,
        fontSize: size * 0.52,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}
    >
      <span style={{ transform: "translateY(-1px)" }}>G</span>
    </div>
  );
}

// ─── Wordmark ──────────────────────────────────────────────────────
// The Gadit wordmark — open-G + electric-blue "it" + starburst tittle,
// sourced from web/public/wordmark-{compact,full}.svg.
//
// Default variant is "compact": tightened glow filters for crisp
// rendering at Header sizes (28–40px high). Use variant="full" for
// hero/marketing surfaces where the heavier glow has room to breathe.
//
// Height is the only prop — width auto-scales from the SVG's intrinsic
// aspect ratio (~620:240). 28px height ≈ 72px wide, which matches the
// rhythm we had with the legacy GaditMark + Geist text.
export function Wordmark({
  variant = "compact",
  height = 28,
}: {
  variant?: "compact" | "full";
  height?: number;
}) {
  const src =
    variant === "full" ? "/wordmark-full.svg" : "/wordmark-compact.svg";
  return (
    // Use a plain <img> tag so the SVG's filter chains and gradients
    // render exactly as authored. Inlining the SVG via fetch+dangerouslySet
    // would give us style hooks but cost a flash of unstyled content; the
    // SVG is small (~5KB) and gets cached aggressively.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Gadit"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}

// ─── TierBadge ─────────────────────────────────────────────────────
// "Clear" or "Deep" pill. Free/Basic returns nothing — the absence is the
// signal. Deep adds a luminous halo on the dot to feel earned.
export function TierBadge({
  tier,
  small = false,
}: {
  tier: Tier;
  small?: boolean;
}) {
  if (!tier || tier === "free" || tier === "basic") return null;
  const isDeep = tier === "deep";
  return (
    <span
      className="gd-font-sans-ui inline-flex items-center gap-1.5"
      style={{
        fontSize: small ? 10 : 11,
        letterSpacing: "0.1em",
        fontWeight: 600,
        textTransform: "uppercase",
        color: "var(--gd-electric)",
        padding: small ? "2px 8px" : "3px 10px",
        borderRadius: 999,
        background: "oklch(0.72 0.19 245 / 0.1)",
        boxShadow: `inset 0 0 0 1px oklch(0.72 0.19 245 / ${
          isDeep ? 0.55 : 0.35
        })`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "var(--gd-electric)",
          boxShadow: isDeep ? "0 0 6px var(--gd-electric)" : "none",
        }}
      />
      {isDeep ? "Deep" : "Clear"}
    </span>
  );
}

// ─── ReportFlag ────────────────────────────────────────────────────
// Small, unobtrusive flag in the corner of content cards. Click handler
// is wired by the consumer (typically opens the existing ReportButton modal).
// Note: per UX review, this should NOT appear on Kids cards or other
// child-facing surfaces.
export function ReportFlag({
  label = "Report",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="gd-flag-btn gd-font-sans-ui inline-flex items-center gap-1.5"
      style={{ fontSize: 11.5 }}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 1.5v11M3 2h6.5l-1 2 1 2H3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}

// ─── MeaningBadge ──────────────────────────────────────────────────
// Numbered circle for each meaning card — its electric-blue ring is the
// visual signature that ties every meaning back to the logo motif.
export function MeaningBadge({ n }: { n: number }) {
  return (
    <span
      className="gd-font-sans-ui inline-flex items-center justify-center"
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        fontWeight: 500,
        fontSize: 13,
        color: "var(--gd-electric-deep)",
        background: "var(--gd-paper-50)",
        boxShadow:
          "inset 0 0 0 1.5px var(--gd-electric), " +
          "0 0 0 3px oklch(0.72 0.19 245 / 0.1)",
      }}
    >
      {n}
    </span>
  );
}

// ─── Eyebrow ───────────────────────────────────────────────────────
// Small uppercase tracker label that sits above content blocks ("MEANING 1",
// "ORIGIN", "FOR KIDS"). Style prop accepted — this fixes the bug Claude
// Design's prototype had where Eyebrow didn't forward style.
export function Eyebrow({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`gd-eyebrow ${className}`} style={style}>
      {children}
    </div>
  );
}

// ─── KidsGlyph ─────────────────────────────────────────────────────
// Crescent moon + sparkle, evoking "dream" + "child imagination" — chosen
// over an emoji or a literal kid face so the Kids card feels warm without
// being patronizing.
export function KidsGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: "oklch(0.55 0.15 60)" }}
    >
      <path
        d="M16 4a8 8 0 1 0 4 12 6 6 0 0 1-4-12z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M7 6l.7 1.8L9.5 8.5 7.7 9.2 7 11l-.7-1.8L4.5 8.5l1.8-.7L7 6z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── LockGlyph ─────────────────────────────────────────────────────
// Padlock icon for tier-locked surfaces. Outlined, never filled — the
// "frosted, not construction tape" aesthetic.
export function LockGlyph({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M4 6V4.5a3 3 0 0 1 6 0V6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="2.5"
        y="6"
        width="9"
        height="6.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
