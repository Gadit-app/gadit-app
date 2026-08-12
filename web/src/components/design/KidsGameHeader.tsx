"use client";

import { useMemo } from "react";
import { computeGamification, toLocalDateStr } from "@/lib/gamification";
import { gameCopy, rankLabel } from "@/lib/gamification-labels";

/**
 * Kids gamification header (Gadi 2026-08-12) — shown on the child's own
 * notebook page for Family-plan kids. Three tiles from data that already
 * exists (the notebook's addedAt dates): a FORGIVING daily streak, a weekly
 * new-words goal, and an explorer rank with progress to the next. No
 * streaks-that-punish, no leaderboards — the reward is the child's own
 * progress. See lib/gamification.ts for the pure logic.
 */

const RANK_EMOJI = ["🌱", "🔍", "🧭", "🗺️", "🎖️", "👑"];

export function KidsGameHeader({
  addedAtDates,
  lang,
  dir,
}: {
  addedAtDates: string[];
  lang: string;
  dir: "rtl" | "ltr";
}) {
  const g = useMemo(() => {
    const now = Date.now();
    const todayStr = toLocalDateStr(new Date(now).toISOString());
    return computeGamification(addedAtDates, now, todayStr);
  }, [addedAtDates]);

  const c = gameCopy(lang);
  const weeklyPct = Math.min(100, Math.round((g.weekly / g.weeklyGoal) * 100));
  const weeklyDone = g.weekly >= g.weeklyGoal;
  const toNext = g.rank.next === null ? 0 : Math.max(0, g.rank.next - g.distinct);

  return (
    <div dir={dir} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, margin: "4px 0 22px" }}>
      {/* Streak */}
      <Tile bg="linear-gradient(135deg, #FFF7ED, #FFEDD5)" border="rgba(245,158,11,0.28)">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 34, lineHeight: 1, filter: g.streak > 0 ? "none" : "grayscale(1) opacity(0.5)" }}>🔥</span>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#B45309", lineHeight: 1 }}>{g.streak}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#B45309", opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.4 }}>{c.streakTitle}</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "#92400E", marginTop: 8 }}>
          {g.streak > 0 ? c.streakDays(g.streak) : c.streakStart}
        </div>
      </Tile>

      {/* Weekly goal */}
      <Tile bg="linear-gradient(135deg, #F0FDFA, #CCFBF1)" border="rgba(14,165,165,0.28)">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0F766E", textTransform: "uppercase", letterSpacing: 0.4 }}>🎯 {c.weeklyTitle}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F766E" }}>{g.weekly}/{g.weeklyGoal}</span>
        </div>
        <div style={{ marginTop: 10, background: "rgba(15,118,110,0.14)", borderRadius: 999, height: 9, overflow: "hidden" }}>
          <div style={{ width: `${weeklyPct}%`, height: "100%", background: weeklyDone ? "#059669" : "#0EA5A5", borderRadius: 999, transition: "width 400ms cubic-bezier(0.23,1,0.32,1)" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "#0F766E", marginTop: 8 }}>
          {weeklyDone ? `✅ ${c.weeklyDone}` : c.weeklyProgress(g.weekly, g.weeklyGoal)}
        </div>
      </Tile>

      {/* Explorer rank */}
      <Tile bg="linear-gradient(135deg, #F5F3FF, #EDE9FE)" border="rgba(124,58,237,0.24)">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>{RANK_EMOJI[g.rank.index] ?? "🏅"}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#6D28D9", lineHeight: 1.15 }}>{rankLabel(g.rank.key, lang)}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6D28D9", opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.4 }}>{c.rankTitle}</div>
          </div>
        </div>
        <div style={{ marginTop: 10, background: "rgba(124,58,237,0.14)", borderRadius: 999, height: 9, overflow: "hidden" }}>
          <div style={{ width: `${Math.round(g.rank.progress * 100)}%`, height: "100%", background: "#7C3AED", borderRadius: 999, transition: "width 400ms cubic-bezier(0.23,1,0.32,1)" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "#6D28D9", marginTop: 8 }}>
          {g.rank.next === null ? `⭐ ${c.topRank}` : c.toNext(toNext)}
        </div>
      </Tile>
    </div>
  );
}

function Tile({ children, bg, border }: { children: React.ReactNode; bg: string; border: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "14px 16px" }}>
      {children}
    </div>
  );
}
