"use client";

/**
 * SayModal — opens the "Say it" tool as a window OVER the current screen
 * instead of navigating to a separate page (Gadi 2026-08-18). This keeps a
 * kid inside their own skin/theme (the modal floats over their themed page,
 * dimmed behind) and always gives a clear way back (X / backdrop / Esc), so
 * it never feels like a dead-end separate window.
 *
 * Mounted once globally in layout. Opened by dispatching:
 *   window.dispatchEvent(new Event("gadit:open-say"))
 * (the nav "Say it" links fire this instead of routing).
 */

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang-context";
import { SayTool } from "@/app/say/SayTool";

export const OPEN_SAY_EVENT = "gadit:open-say";

export function SayModal() {
  const { dir } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener(OPEN_SAY_EVENT, openIt);
    return () => window.removeEventListener(OPEN_SAY_EVENT, openIt);
  }, []);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 200, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(10,14,20,0.55)", backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        animation: "sayFade 0.16s ease-out",
      }}
    >
      <div
        className="wordbook"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 600, maxHeight: "90dvh", overflowY: "auto",
          background: "var(--surface, #fff)", color: "var(--ink, #14181F)",
          borderRadius: 22, padding: "26px 26px 30px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
          animation: "sayPop 0.18s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <SayTool onClose={() => setOpen(false)} />
      </div>
      <style>{`
        @keyframes sayFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sayPop { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}
