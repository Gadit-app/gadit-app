"use client";

/**
 * /help — the walkthroughs index. Renders GUIDES grouped by GUIDE_SECTIONS as
 * cards with a play button; tapping one opens that guide in the fullscreen
 * player. Supports a /help#<guide-id> deep link that opens the guide on load.
 * Visual language mirrors the Yooniz guides page (featured card, colored icon
 * squares, play buttons).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { gt } from "@/lib/guide-i18n";
import { GUIDES, GUIDE_SECTIONS, getGuide } from "@/lib/guides";
import { WalkthroughModal } from "@/components/Walkthrough";

function PlayCircle({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 40, height: 40, flex: "none", borderRadius: "50%",
        background: color + "1A", display: "grid", placeItems: "center",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill={color} aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
        <path d="M4.5 3.2v9.6c0 .5.5.8 1 .55l7.3-4.8a.65.65 0 0 0 0-1.1L5.5 2.65a.65.65 0 0 0-1 .55Z" />
      </svg>
    </span>
  );
}

function CapIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  );
}

export function HelpClient() {
  const { lang, dir } = useLang();
  const href = useHref();
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (id && GUIDES[id]) setOpenId(id);
  }, []);

  const open = getGuide(openId);
  const firstGuideId = GUIDE_SECTIONS[0]?.guideIds[0];
  const teal = "#0EA5A5";

  return (
    <div dir={dir} style={{ minHeight: "100dvh", background: "var(--paper, #F2F6F4)", fontFamily: '"Rubik", system-ui, sans-serif' }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "18px 16px 72px" }}>
        <Link href={href("/")} style={{ fontSize: 13, color: "var(--ink-muted,#6B7280)", textDecoration: "none" }}>
          {dir === "rtl" ? "→" : "←"} Gadit
        </Link>

        {/* Header — icon + title, start-aligned like Yooniz */}
        <header style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 0 4px" }}>
          <span style={{ marginTop: 4 }}><CapIcon color={teal} /></span>
          <div>
            <h1 style={{ fontSize: 27, fontWeight: 800, margin: 0, color: "var(--ink,#0B1220)" }}>{gt(lang, "help.title")}</h1>
            <p style={{ fontSize: 14.5, color: "var(--ink-muted,#6B7280)", margin: "6px 0 0", maxWidth: "60ch", lineHeight: 1.5 }}>{gt(lang, "help.sub")}</p>
          </div>
        </header>

        {/* Featured card — start the basics (opens the first guide) */}
        {firstGuideId && (
          <button
            type="button"
            onClick={() => setOpenId(firstGuideId)}
            style={{
              width: "100%", marginTop: 16, display: "flex", alignItems: "center", gap: 14,
              textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer", fontFamily: "inherit",
              background: "var(--surface,#fff)", border: `1px solid ${teal}55`, borderRadius: 18,
              padding: "16px 18px", boxShadow: `0 6px 18px ${teal}14`,
            }}
          >
            <span style={{ width: 44, height: 44, flex: "none", borderRadius: 13, background: teal + "1A", display: "grid", placeItems: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" />
              </svg>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--ink,#0B1220)" }}>{gt(lang, "help.tourTitle")}</span>
              <span style={{ display: "block", fontSize: 13, color: "var(--ink-muted,#6B7280)", marginTop: 2 }}>{gt(lang, "help.tourSub")}</span>
            </span>
            <span style={{ flex: "none", background: teal, color: "#fff", fontSize: 14, fontWeight: 700, padding: "9px 18px", borderRadius: 11 }}>
              {gt(lang, "help.tourBtn")}
            </span>
          </button>
        )}

        {GUIDE_SECTIONS.map((sec) => (
          <section key={sec.titleKey} style={{ marginTop: 30 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, textAlign: "center", color: "var(--ink,#0B1220)", margin: "0 0 14px" }}>
              {gt(lang, sec.titleKey)}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {sec.guideIds.map((gid) => {
                const g = GUIDES[gid];
                if (!g) return null;
                return (
                  <button
                    key={gid}
                    type="button"
                    onClick={() => setOpenId(gid)}
                    aria-label={gt(lang, "help.play")}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textAlign: dir === "rtl" ? "right" : "left",
                      background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 16,
                      padding: "14px 15px", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ width: 44, height: 44, flex: "none", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 21, background: g.color + "1A" }}>{g.icon}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: "var(--ink,#0B1220)" }}>{gt(lang, g.titleKey)}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-muted,#6B7280)", marginTop: 2, lineHeight: 1.45 }}>{gt(lang, g.descKey)}</span>
                    </span>
                    <PlayCircle color={g.color} flip={dir === "rtl"} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {open && (
        <WalkthroughModal
          guideId={open.id}
          title={gt(lang, open.titleKey)}
          steps={open.steps(lang)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
