"use client";

/**
 * walkthrough-ui — small, faithful recreations of Gadit screen pieces used to
 * build walkthrough frames. Same colors and shapes as the real app, light
 * theme (the app renders light). No live data / hooks — pure presentational,
 * so a frame is cheap and never pulls in feature logic. All text is passed in
 * by the step-builders (already translated), so these stay language-agnostic.
 */

import type { ReactNode, CSSProperties } from "react";

export const WT = {
  teal: "#0EA5A5",
  tealDeep: "#0A7472",
  purple: "#7C3AED",
  paper: "#F2F6F4",
  surface: "#FFFFFF",
  ink: "#0B1220",
  soft: "#3F4856",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#E5E7EB",
  gold: "#D98324",
};

/** The phone canvas: full height, light ground, column layout. */
export function Screen({ children, bg = WT.paper, pad = 12 }: { children: ReactNode; bg?: string; pad?: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, display: "flex", flexDirection: "column", padding: pad, gap: 10, fontFamily: '"Rubik", system-ui, sans-serif', overflow: "hidden" }}>
      {children}
    </div>
  );
}

/** Top bar with the Gadit wordmark and a couple of round icon buttons. */
export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 8px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: WT.ink, letterSpacing: "-0.01em" }}>
        Gad<span style={{ color: WT.teal }}>it</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>{right}</div>
    </div>
  );
}

export function IconDot({ children, bg = WT.surface, color = WT.muted }: { children?: ReactNode; bg?: string; color?: string }) {
  return (
    <span style={{ width: 30, height: 30, borderRadius: "50%", background: bg, color, border: `1px solid ${WT.line}`, display: "grid", placeItems: "center", fontSize: 14 }}>{children}</span>
  );
}

/** The word search field. */
export function SearchField({ text, placeholder, focused }: { text?: string; placeholder?: string; focused?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: WT.surface, border: `1.5px solid ${focused ? WT.teal : WT.line}`, borderRadius: 14, padding: "11px 14px", boxShadow: focused ? "0 0 0 3px rgba(14,165,165,0.12)" : "none" }}>
      <span style={{ color: focused ? WT.teal : WT.faint, fontSize: 15 }}>🔍</span>
      <span style={{ fontSize: 15, color: text ? WT.ink : WT.faint, fontWeight: text ? 600 : 400 }}>{text || placeholder}</span>
    </div>
  );
}

/** A rounded content sheet (the white card meanings sit on). */
export function Sheet({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 16, padding: 14, ...style }}>{children}</div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: WT.tealDeep, marginBottom: 6 }}>{children}</div>;
}

/** A word result: headword, one meaning, one example, optional image block. */
export function WordCard({ word, pos, meaning, example, showImage }: { word: string; pos?: string; meaning: string; example?: string; showImage?: boolean }) {
  return (
    <Sheet>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: WT.ink }}>{word}</div>
        <span style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${WT.line}`, display: "grid", placeItems: "center", fontSize: 13, color: WT.teal }}>🔊</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: WT.teal, color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center", flex: "none" }}>1</span>
        <div>
          {pos && <span style={{ fontSize: 11, color: WT.muted, background: WT.paper, borderRadius: 6, padding: "1px 6px", marginInlineEnd: 6 }}>{pos}</span>}
          <span style={{ fontSize: 15, color: WT.ink, lineHeight: 1.5 }}>{meaning}</span>
        </div>
      </div>
      {example && (
        <div style={{ marginTop: 8, marginInlineStart: 28, fontSize: 13.5, color: WT.muted, lineHeight: 1.5 }}>• {example}</div>
      )}
      {showImage && (
        <div style={{ marginTop: 10, height: 78, borderRadius: 12, background: "linear-gradient(135deg,#D9F2EF,#EAF6F3)", display: "grid", placeItems: "center", fontSize: 26 }}>🖼️</div>
      )}
    </Sheet>
  );
}

export function Chip({ children, active, color = WT.teal }: { children: ReactNode; active?: boolean; color?: string }) {
  return (
    <span style={{ fontSize: 13, fontWeight: 600, padding: "7px 13px", borderRadius: 999, border: `1px solid ${active ? color : WT.line}`, background: active ? color : WT.surface, color: active ? "#fff" : WT.ink, whiteSpace: "nowrap" }}>{children}</span>
  );
}

export function PrimaryBtn({ children, color = WT.teal, full }: { children: ReactNode; color?: string; full?: boolean }) {
  return (
    <div style={{ display: full ? "block" : "inline-block", textAlign: "center", background: color, color: "#fff", fontSize: 15, fontWeight: 700, padding: "12px 20px", borderRadius: 12 }}>{children}</div>
  );
}

export function GhostBtn({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "inline-block", textAlign: "center", background: WT.surface, color: WT.ink, fontSize: 14, fontWeight: 600, padding: "11px 18px", borderRadius: 12, border: `1px solid ${WT.line}` }}>{children}</div>
  );
}

/** A settings / list row with an icon bubble, label, and optional trailing. */
export function Row({ icon, label, sub, trailing, iconBg = WT.paper }: { icon: ReactNode; label: string; sub?: string; trailing?: ReactNode; iconBg?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 14, padding: "12px 14px" }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: iconBg, display: "grid", placeItems: "center", fontSize: 18, flex: "none" }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: WT.ink }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: WT.muted, marginTop: 1 }}>{sub}</div>}
      </div>
      {trailing}
    </div>
  );
}

/** A small kid-progress card for the parent dashboard frame. */
export function KidStat({ name, words, weekly, avatar }: { name: string; words: string; weekly: string; avatar: string }) {
  return (
    <Sheet style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 42, height: 42, borderRadius: "50%", background: "#EAF6F3", display: "grid", placeItems: "center", fontSize: 22, flex: "none" }}>{avatar}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: WT.ink }}>{name}</div>
        <div style={{ fontSize: 12.5, color: WT.muted }}>{weekly}</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: WT.teal }}>{words}</div>
      </div>
    </Sheet>
  );
}

/** Toggle pill for the Kids Mode frame. */
export function Toggle({ on, label }: { on: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 14, padding: "12px 14px" }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: WT.ink }}>{label}</span>
      <span style={{ width: 44, height: 26, borderRadius: 999, background: on ? WT.teal : WT.line, position: "relative", transition: "background .2s", flex: "none" }}>
        <span style={{ position: "absolute", top: 3, insetInlineStart: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "inset-inline-start .2s" }} />
      </span>
    </div>
  );
}

/** Bottom nav bar: notebook / say / reader / games. Labels passed in. */
export function BottomNav({ items, active }: { items: { icon: string; label: string }[]; active: number }) {
  return (
    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-around", background: WT.surface, borderTop: `1px solid ${WT.line}`, borderRadius: "14px 14px 0 0", padding: "8px 4px 4px" }}>
      {items.map((it, k) => (
        <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: k === active ? WT.teal : WT.faint }}>
          <span style={{ fontSize: 17 }}>{it.icon}</span>
          <span style={{ fontSize: 10, fontWeight: k === active ? 700 : 500 }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/** A QR-code stand-in (checkerboard) for the pairing frame. */
export function QrBlock({ code }: { code: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 120, height: 120, borderRadius: 12, background: "#fff", border: `1px solid ${WT.line}`, padding: 10 }}>
        <div style={{ width: "100%", height: "100%", backgroundImage: `repeating-conic-gradient(${WT.ink} 0 25%, #fff 0 50%)`, backgroundSize: "20px 20px", borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.18em", color: WT.ink, direction: "ltr" }}>{code}</div>
    </div>
  );
}
