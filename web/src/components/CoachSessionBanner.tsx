"use client";

/**
 * When a coach has entered a student's profile (a session minted by
 * /api/coach/enter, carrying a `coach: true` token claim), show a slim fixed
 * bar with a clear way back: "Exit coaching" signs out of the student and
 * returns to /coach. Mounted globally in layout; renders nothing for ordinary
 * sessions. Gadi 2026-08-22.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

const LABEL: Record<string, { coaching: (name: string) => string; exit: string }> = {
  en: { coaching: (n) => (n ? `Coaching ${n}` : "Coaching a student"), exit: "Exit coaching" },
  he: { coaching: (n) => (n ? `מאמן את ${n}` : "מאמן תלמיד"), exit: "יציאה מהאימון" },
};
function lbl(lang: string) { return LABEL[lang] ?? LABEL.en; }

export function CoachSessionBanner() {
  const { user } = useAuth();
  const { lang, dir } = useLang();
  const router = useRouter();
  const [isCoach, setIsCoach] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setIsCoach(false); return; }
      try {
        const res = await user.getIdTokenResult();
        if (cancelled) return;
        setIsCoach(res.claims?.coach === true);
        setName(user.displayName || "");
      } catch {
        if (!cancelled) setIsCoach(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!isCoach) return null;
  const c = lbl(lang);

  async function exit() {
    try {
      const { signOut, getAuth } = await import("firebase/auth");
      await signOut(getAuth());
    } catch { /* ignore */ }
    router.push("/coach");
  }

  return (
    <div
      dir={dir}
      role="status"
      style={{
        position: "sticky", top: 0, zIndex: 60, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        padding: "8px 16px", background: "#7C3AED", color: "#fff",
        fontSize: 14, fontWeight: 600,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden="true">🎓</span>{c.coaching(name)}
      </span>
      <button
        type="button"
        onClick={exit}
        style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        {c.exit}
      </button>
    </div>
  );
}
