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

/** A rounded content sheet (the white card meanings sit on). */
export function Sheet({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 16, padding: 14, ...style }}>{children}</div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: WT.tealDeep, marginBottom: 6 }}>{children}</div>;
}

/** The speaker button (TTSButton): a cone with two sound waves. */
export function SpeakerBtn({ size = 26, active }: { size?: number; active?: boolean }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", border: `1px solid ${active ? WT.teal : WT.line}`, background: active ? "rgba(14,165,165,.12)" : WT.surface, display: "grid", placeItems: "center", color: WT.tealDeep, flex: "none", boxShadow: active ? "0 0 0 5px rgba(14,165,165,.14)" : "none" }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10" />
      </svg>
    </span>
  );
}

/** The word page head (result.tsx WordHeader): part of speech, the word,
 *  its speaker and, for a Hebrew or Arabic word, the Niqqud button. */
export function WordHead({ word, pos, niqqud, niqqudOn, speaking }: { word: string; pos?: string; niqqud?: string; niqqudOn?: boolean; speaking?: boolean }) {
  return (
    <div>
      {pos && <div style={{ fontSize: 11.5, color: WT.muted, marginBottom: 2 }}>{pos}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: WT.ink, lineHeight: 1.2 }}>{word}</div>
        <SpeakerBtn active={speaking} />
        {niqqud && (
          <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: `1px solid ${niqqudOn ? WT.teal : WT.line}`, background: niqqudOn ? "rgba(14,165,165,.1)" : WT.surface, color: niqqudOn ? WT.tealDeep : WT.soft }}>
            {niqqudOn ? "✓ " : ""}{niqqud}
          </span>
        )}
      </div>
    </div>
  );
}

/** One meaning card (result.tsx MeaningEntry): number, part of speech,
 *  definition, bulleted examples, then optional links and the tab row. */
export function MeaningCard({ n = 1, pos, meaning, examples = [], links, tabs, activeTab, image, children }: {
  n?: number; pos?: string; meaning: string; examples?: string[];
  links?: ReactNode; tabs?: string[]; activeTab?: number; image?: boolean; children?: ReactNode;
}) {
  return (
    <Sheet style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: WT.teal, color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center", flex: "none" }}>{n}</span>
        <div>
          {pos && <span style={{ fontSize: 11, color: WT.muted, background: WT.paper, borderRadius: 6, padding: "1px 6px", marginInlineEnd: 6 }}>{pos}</span>}
          <span style={{ fontSize: 14.5, color: WT.ink, lineHeight: 1.5 }}>{meaning}</span>
        </div>
      </div>
      {examples.map((ex, k) => (
        <div key={k} style={{ marginTop: 6, marginInlineStart: 28, fontSize: 13, color: WT.muted, lineHeight: 1.5 }}>• {ex}</div>
      ))}
      {links && <div style={{ marginTop: 8, marginInlineStart: 28, display: "flex", flexDirection: "column", gap: 5 }}>{links}</div>}
      {children}
      {tabs && (
        <div style={{ marginTop: 10, display: "flex", gap: 4, borderTop: `1px solid ${WT.line}`, paddingTop: 8, flexWrap: "wrap" }}>
          {tabs.map((t, k) => (
            <span key={k} style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 8, color: k === activeTab ? WT.tealDeep : WT.soft, background: k === activeTab ? "rgba(14,165,165,.12)" : WT.paper }}>{t}</span>
          ))}
        </div>
      )}
      {image && (
        <div style={{ marginTop: 8, height: 92, borderRadius: 12, background: "linear-gradient(135deg,#D9F2EF,#FFF6DA)", display: "grid", placeItems: "center", fontSize: 34 }}>🧒🔍</div>
      )}
    </Sheet>
  );
}

/** A teal text link as under a meaning ("+ More example sentences"). */
export function TextLink({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 12.5, fontWeight: 600, color: WT.tealDeep }}>{children}</span>;
}

/** Section heading on the word page ("Definitions", "Word Origin"). */
export function SectionHead({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 800, color: WT.ink }}>{icon}{children}</div>;
}

/** The home / word-page search pill: field, mic inside, round search button. */
export function SearchPill({ text, placeholder, focused, micOn }: { text?: string; placeholder?: string; focused?: boolean; micOn?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: WT.surface, border: `1.5px solid ${focused ? WT.teal : WT.line}`, borderRadius: 999, padding: "5px 5px 5px 14px", paddingInlineStart: 14, boxShadow: focused ? "0 0 0 3px rgba(14,165,165,0.12)" : "0 2px 8px rgba(15,23,42,.05)" }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 15, color: text ? WT.ink : WT.faint, fontWeight: text ? 600 : 400 }}>{text || placeholder}</span>
      <span style={{ width: 30, height: 30, borderRadius: "50%", display: "grid", placeItems: "center", background: micOn ? "rgba(14,165,165,.14)" : "transparent", boxShadow: micOn ? "0 0 0 4px rgba(14,165,165,.12)" : "none" }}><MicIcon /></span>
      <span style={{ width: 34, height: 34, borderRadius: "50%", background: WT.teal, display: "grid", placeItems: "center", flex: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
      </span>
    </div>
  );
}

/** The optional sentence box under the search pill. */
export function SentenceBox({ text, placeholder, focused, tall }: { text?: string; placeholder: string; focused?: boolean; tall?: boolean }) {
  return (
    <div style={{ background: WT.surface, border: `1.5px solid ${focused ? WT.teal : WT.line}`, borderRadius: 18, padding: "10px 14px", minHeight: tall ? 62 : 40, fontSize: 12.5, lineHeight: 1.5, color: text ? WT.ink : WT.faint, boxShadow: focused ? "0 0 0 3px rgba(14,165,165,0.12)" : "none" }}>
      {text || placeholder}
    </div>
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

/** The real top bar on a phone (ToolPage / WbShellChrome): wordmark, the
 *  Kids switch beside it (Family members), then on the trailing side share,
 *  the "?" guides button (grown-ups), the rank badge, the avatar and the menu
 *  (☰) button. On a phone the menu items live behind ☰; `menuOpen` shows it. */
export function AppBar({ kids, kidsOn, rank, help, avatar = true, menuOpen, highlight }: {
  /** Label of the Kids switch ("Kids"); omitted = no switch. */
  kids?: string;
  kidsOn?: boolean;
  /** Rank picture key (/ranks/<key>.webp) for the badge; omitted = none. */
  rank?: string;
  help?: boolean;
  avatar?: boolean;
  menuOpen?: boolean;
  /** Ring one control to point at it. */
  highlight?: "kids" | "rank" | "help" | "avatar" | "menu";
}) {
  const ring = (k: string) => (highlight === k ? { boxShadow: "0 0 0 3px rgba(14,165,165,.35)" } : {});
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0 8px", borderBottom: `1px solid ${WT.line}` }}>
      <div dir="ltr" style={{ fontSize: 19, fontWeight: 800, color: WT.ink, letterSpacing: "-0.01em" }}>
        Gad<span style={{ color: WT.teal }}>it</span>
      </div>
      {kids && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 28, padding: "0 7px 0 4px", borderRadius: 999, border: `1px solid ${kidsOn ? "rgba(14,165,165,.5)" : WT.line}`, background: kidsOn ? "rgba(14,165,165,.1)" : WT.surface, fontSize: 11.5, fontWeight: 700, color: kidsOn ? WT.ink : WT.soft, marginInlineStart: 4, ...ring("kids") }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kidsOn ? "/play/kids-mascot.webp" : "/play/kids-mascot-sleep.webp"} alt="" width={22} height={22} style={{ objectFit: "contain", opacity: kidsOn ? 1 : 0.8 }} />
          {kids}
          <span style={{ position: "relative", width: 24, height: 14, borderRadius: 999, background: kidsOn ? WT.teal : "#CBD5E1", flex: "none" }}>
            <span style={{ position: "absolute", top: 2, insetInlineStart: kidsOn ? 12 : 2, width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
          </span>
        </span>
      )}
      <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 5 }}>
        {help && <span style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${WT.line}`, background: WT.surface, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: WT.tealDeep, ...ring("help") }}>?</span>}
        {rank && <span style={{ borderRadius: 999, ...ring("rank") }}><RankBadge rank={rank} /></span>}
        {avatar && <span style={{ width: 26, height: 26, borderRadius: "50%", background: WT.teal, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, ...ring("avatar") }}>D</span>}
        <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", color: WT.ink, background: menuOpen ? WT.paper : "transparent", ...ring("menu") }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </span>
      </div>
    </div>
  );
}

/** The open top menu (☰ dropdown on a phone, the row of links on a computer):
 *  the search icon, then the menu items in their real order. */
export function TopMenu({ items, active }: { items: string[]; active?: number }) {
  return (
    <div style={{ alignSelf: "flex-end", marginTop: -6, minWidth: "62%", background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 14, padding: 6, boxShadow: "0 10px 28px rgba(15,23,42,0.14)" }}>
      {items.map((label, k) => (
        <div key={k} style={{ padding: "8px 10px", borderRadius: 8, fontSize: 13.5, fontWeight: k === active ? 700 : 500, color: k === active ? WT.tealDeep : WT.ink, background: k === active ? "rgba(14,165,165,.1)" : "transparent" }}>{label}</div>
      ))}
    </div>
  );
}

/** Rank badge as in the top bar (KidsGameHeader TopRankBadge): the rank
 *  picture in a light purple circle, with a thin progress bar under it. */
export function RankBadge({ rank, size = 28 }: { rank: string; size?: number }) {
  return (
    <span style={{ width: size, height: size, borderRadius: 999, border: "1.5px solid rgba(139,92,246,.35)", background: "rgba(139,92,246,.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", flex: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/ranks/${rank}.webp`} alt="" width={size - 6} height={size - 6} style={{ objectFit: "contain" }} />
      <span style={{ position: "absolute", insetInline: 5, bottom: -3, height: 3, borderRadius: 999, background: "rgba(17,17,17,.12)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: "60%", background: "#8B5CF6" }} />
      </span>
    </span>
  );
}

/** A text field as drawn in the app, with an optional mic inside it. */
export function Field({ text, placeholder, mic, focused, label, multiline }: { text?: string; placeholder?: string; mic?: boolean; focused?: boolean; label?: string; multiline?: boolean }) {
  return (
    <div>
      {label && <div style={{ fontSize: 12.5, fontWeight: 600, color: WT.soft, marginBottom: 5 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: multiline ? "flex-start" : "center", gap: 8, background: WT.surface, border: `1.5px solid ${focused ? WT.teal : WT.line}`, borderRadius: 12, padding: "10px 12px", minHeight: multiline ? 58 : undefined, boxShadow: focused ? "0 0 0 3px rgba(14,165,165,0.12)" : "none" }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.45, color: text ? WT.ink : WT.faint, fontWeight: text ? 500 : 400 }}>{text || placeholder}</span>
        {mic && <MicIcon />}
      </div>
    </div>
  );
}

export function MicIcon({ color = WT.tealDeep }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

/** A soft note line (e.g. "saved to your notebook"). */
export function Note({ children, color = WT.tealDeep, bg = "rgba(14,165,165,.08)" }: { children: ReactNode; color?: string; bg?: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: bg, color, borderRadius: 12, padding: "9px 12px", fontSize: 12.5, lineHeight: 1.5, fontWeight: 500 }}>{children}</div>
  );
}

/** Tabs row (e.g. /family Home · Family · Settings). */
export function Tabs({ items, active }: { items: string[]; active: number }) {
  return (
    <div style={{ display: "flex", gap: 4, background: WT.surface, border: `1px solid ${WT.line}`, borderRadius: 12, padding: 4 }}>
      {items.map((t, k) => (
        <span key={k} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 9, fontSize: 13, fontWeight: k === active ? 700 : 500, color: k === active ? "#fff" : WT.soft, background: k === active ? WT.teal : "transparent" }}>{t}</span>
      ))}
    </div>
  );
}

/** A picture tile like the Play / Homework / Practice cards: image + name. */
export function Tile({ img, title, sub, highlight }: { img?: string; title: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: WT.surface, border: `${highlight ? 2 : 1}px solid ${highlight ? WT.teal : WT.line}`, borderRadius: 14, overflow: "hidden", minWidth: 0 }}>
      {img && (
        <div style={{ height: 62, background: "linear-gradient(160deg,#FFF6DA,#FFFFFF)", display: "grid", placeItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" style={{ maxWidth: "100%", maxHeight: 58, objectFit: "contain" }} />
        </div>
      )}
      <div style={{ padding: "7px 8px 8px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: WT.ink, lineHeight: 1.3 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: WT.muted, lineHeight: 1.35, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/** The "Gad it!" button at the end of a word (result.tsx GadItButton):
 *  full width, deep teal, a check after the label, a hint line under it. */
export function GadItBtn({ label, hint, done }: { label: string; hint?: string; done?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 46, borderRadius: 14, fontSize: 16.5, fontWeight: 800, color: "#fff", background: done ? "#0F9E6E" : "#0B7F7F", boxShadow: "0 2px 6px rgba(11,127,127,.25)" }}>
        <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{label}</span>
        <span aria-hidden="true">✓</span>
      </div>
      {hint && <div style={{ textAlign: "center", fontSize: 11.5, color: WT.muted, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

/** A QR-code stand-in (checkerboard) for the pairing frame. */
export function QrBlock({ code }: { code?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ width: 120, height: 120, borderRadius: 12, background: "#fff", border: `1px solid ${WT.line}`, padding: 10 }}>
        <div style={{ width: "100%", height: "100%", backgroundImage: `repeating-conic-gradient(${WT.ink} 0 25%, #fff 0 50%)`, backgroundSize: "20px 20px", borderRadius: 4 }} />
      </div>
      {code && <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.18em", color: WT.ink, direction: "ltr" }}>{code}</div>}
    </div>
  );
}
