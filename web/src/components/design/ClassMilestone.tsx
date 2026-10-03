"use client";

import { useEffect, useState } from "react";
import { KidsCelebration } from "@/components/design/KidsCelebration";
import { classCopy, rankNameAt, type ClassScope } from "@/lib/class-milestones";

/**
 * Class dictionary progress + milestone celebration (Gadi 2026-10-03).
 * The chip sits under the search bar on school screens; the overlay takes
 * the whole screen when this screen's word landed the class on a new rank,
 * so the kid at the class computer can turn around and tell everyone.
 */

export type ClassProgress = { count: number; next: number | null; scope: ClassScope };
export type ClassMilestoneHit = { count: number; rankIndex: number };

export function ClassProgressChip({ progress, lang }: { progress: ClassProgress; lang: string }) {
  const c = classCopy(lang);
  const pct = progress.next ? Math.min(100, Math.round((progress.count / progress.next) * 100)) : 100;
  return (
    <div
      dir={lang === "he" ? "rtl" : "ltr"}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px", borderRadius: 999,
        background: "var(--surface, #fff)", border: "1px solid var(--rule, #E4EAE8)", fontSize: 14,
        color: "var(--ink-soft, #3F4856)", boxShadow: "0 4px 14px -8px rgba(16,40,60,.25)",
      }}
    >
      <span style={{ fontWeight: 700, color: "var(--ink, #0B1220)" }}>{c.label[progress.scope]}: {c.words(progress.count)}</span>
      {progress.next && (
        <>
          <span aria-hidden="true" style={{ width: 64, height: 6, borderRadius: 99, background: "color-mix(in srgb, #0EA5A5 16%, transparent)", overflow: "hidden" }}>
            <span style={{ display: "block", width: `${pct}%`, height: "100%", background: "#0EA5A5", borderRadius: 99 }} />
          </span>
          <span>{c.toNext(progress.next - progress.count)}</span>
        </>
      )}
    </div>
  );
}

export function ClassMilestoneOverlay({
  hit, scope, lang, onClose,
}: { hit: ClassMilestoneHit; scope: ClassScope; lang: string; onClose: () => void }) {
  const c = classCopy(lang);
  const [run, setRun] = useState(1);
  // A few waves of fireworks while the overlay is up.
  useEffect(() => {
    const ids = [1400, 2800, 4200].map((ms, i) => window.setTimeout(() => setRun(i + 2), ms));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.wow(scope, hit.count)}
      dir={lang === "he" ? "rtl" : "ltr"}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 16,
        background: "radial-gradient(circle at 50% 40%, rgba(14,165,165,.92), rgba(8,80,90,.96))",
      }}
    >
      <KidsCelebration runId={run} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", zIndex: 2, maxWidth: 640, width: "100%", textAlign: "center", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}
      >
        <div aria-hidden="true" style={{ fontSize: "clamp(64px, 12vw, 120px)", lineHeight: 1 }}>🎉</div>
        <div style={{ fontSize: "clamp(30px, 5.4vw, 56px)", fontWeight: 800, lineHeight: 1.15, textWrap: "balance" }}>
          {c.wow(scope, hit.count)}
        </div>
        <div style={{
          fontSize: "clamp(18px, 2.6vw, 26px)", fontWeight: 700, background: "rgba(255,255,255,.16)",
          border: "1px solid rgba(255,255,255,.35)", borderRadius: 999, padding: "8px 22px",
        }}>
          {c.rank(rankNameAt(hit.rankIndex, lang))}
        </div>
        <div style={{ fontSize: "clamp(17px, 2.2vw, 22px)", opacity: .95 }}>{c.tell}</div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          style={{
            marginTop: 10, font: "inherit", fontSize: 18, fontWeight: 700, cursor: "pointer",
            background: "#fff", color: "#0B6E6E", border: 0, borderRadius: 999, padding: "12px 34px",
          }}
        >
          {c.close}
        </button>
      </div>
    </div>
  );
}
