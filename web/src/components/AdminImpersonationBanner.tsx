"use client";

/**
 * When an admin has signed in AS a school (a session minted by
 * /api/admin/impersonate-school, carrying an `adminImpersonation` token claim),
 * show a slim fixed banner so it is never mistaken for the admin's own account.
 * "Exit" signs out and returns to /admin/schools, where the admin logs back in
 * as themselves. Same session model as the coach banner. Mounted globally in
 * layout; renders nothing for ordinary sessions.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

export function AdminImpersonationBanner() {
  const { user } = useAuth();
  const { dir, lang } = useLang();
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setActive(false); return; }
      try {
        const res = await user.getIdTokenResult();
        if (cancelled) return;
        setActive(res.claims?.adminImpersonation === true);
        setName(user.displayName || "");
      } catch {
        if (!cancelled) setActive(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!active) return null;

  const label = lang === "he"
    ? { viewing: name ? `צופה כאדמין: ${name}` : "צופה כאדמין בבית ספר", exit: "יציאה" }
    : { viewing: name ? `Viewing as admin: ${name}` : "Viewing a school as admin", exit: "Exit" };

  async function exit() {
    try {
      const { signOut, getAuth } = await import("firebase/auth");
      await signOut(getAuth());
    } catch { /* ignore */ }
    router.push("/admin/schools");
  }

  return (
    <div
      dir={dir}
      role="status"
      style={{
        position: "sticky", top: 0, zIndex: 60, width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        padding: "8px 16px", background: "#B45309", color: "#fff",
        fontSize: 14, fontWeight: 600,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span aria-hidden="true">👁️</span>{label.viewing}
      </span>
      <button
        type="button"
        onClick={exit}
        style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
      >
        {label.exit}
      </button>
    </div>
  );
}
