"use client";

/**
 * /help — the walkthroughs index. Renders GUIDES grouped by GUIDE_SECTIONS;
 * tapping a card opens that guide in the fullscreen player. Supports a
 * /help#<guide-id> deep link that opens the guide on load.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { gt } from "@/lib/guide-i18n";
import { GUIDES, GUIDE_SECTIONS, getGuide } from "@/lib/guides";
import { WalkthroughModal } from "@/components/Walkthrough";

export function HelpClient() {
  const { lang, dir } = useLang();
  const href = useHref();
  const [openId, setOpenId] = useState<string | null>(null);

  // Deep link: /help#<guide-id> opens that guide on load.
  useEffect(() => {
    const id = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (id && GUIDES[id]) setOpenId(id);
  }, []);

  const open = getGuide(openId);

  return (
    <div dir={dir} style={{ minHeight: "100dvh", background: "var(--paper, #F2F6F4)", fontFamily: '"Rubik", system-ui, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "20px 16px 64px" }}>
        <Link href={href("/")} style={{ fontSize: 13, color: "var(--ink-muted,#6B7280)", textDecoration: "none" }}>
          {dir === "rtl" ? "→" : "←"} Gadit
        </Link>

        <header style={{ textAlign: "center", padding: "18px 0 8px" }}>
          <h1 style={{ fontSize: 27, fontWeight: 800, margin: 0, color: "var(--ink,#0B1220)" }}>{gt(lang, "help.title")}</h1>
          <p style={{ fontSize: 15, color: "var(--ink-muted,#6B7280)", margin: "8px auto 0", maxWidth: "48ch" }}>{gt(lang, "help.sub")}</p>
        </header>

        {GUIDE_SECTIONS.map((sec) => (
          <section key={sec.titleKey} style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--teal-deep,#0A7472)", margin: "0 0 12px" }}>
              {gt(lang, sec.titleKey)}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {sec.guideIds.map((gid) => {
                const g = GUIDES[gid];
                if (!g) return null;
                return (
                  <button
                    key={gid}
                    type="button"
                    onClick={() => setOpenId(gid)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, textAlign: dir === "rtl" ? "right" : "left",
                      background: "var(--surface,#fff)", border: "1px solid var(--hairline,#E5E7EB)", borderRadius: 15,
                      padding: "14px 15px", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <span style={{ width: 42, height: 42, flex: "none", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 20, background: g.color + "1A" }}>{g.icon}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: "var(--ink,#0B1220)" }}>{gt(lang, g.titleKey)}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-muted,#6B7280)", marginTop: 2, lineHeight: 1.4 }}>{gt(lang, g.descKey)}</span>
                    </span>
                    <span style={{ color: g.color, fontSize: 18, flex: "none" }}>{dir === "rtl" ? "‹" : "›"}</span>
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
