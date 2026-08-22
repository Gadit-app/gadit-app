"use client";

/**
 * When a device is in Kids Mode (a kid tapped in via /kids), keep the kid
 * boxed in: a slim bar with "Switch kid" (back to the /kids switcher) and
 * "Exit Kids Mode" (become the parent again). Shown only for a kid session
 * that carries the `gadit-kids-mode` session flag. A focus mode, not a lock.
 * Mounted globally in layout. Gadi 2026-08-22.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";

const L: Record<string, { label: string; switchKid: string; exit: string }> = {
  en: { label: "Kids Mode", switchKid: "Switch kid", exit: "Exit" },
  he: { label: "מצב ילדים", switchKid: "החלף ילד", exit: "יציאה" },
};
function lbl(lang: string) { return L[lang] ?? L.en; }

export function KidsModeBar() {
  const { user, familyRole } = useAuth();
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { setOn(sessionStorage.getItem("gadit-kids-mode") === "1"); } catch { setOn(false); }
  }, [user, familyRole]);

  if (!on || familyRole !== "kid" || !user) return null;
  const c = lbl(lang);

  async function exit() {
    if (busy || !user) return;
    setBusy(true);
    try {
      const idToken = await user.getIdToken();
      // Find the owner and become them again.
      const gRes = await fetch("/api/family/switch-member", { headers: { Authorization: `Bearer ${idToken}` } });
      const gJson = (await gRes.json()) as { members?: Array<{ id: string; isOwner: boolean }> };
      const owner = (gJson.members ?? []).find((m) => m.isOwner);
      if (!owner) throw new Error();
      const pRes = await fetch("/api/family/switch-member", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ memberId: owner.id }),
      });
      const pJson = (await pRes.json()) as { token?: string };
      if (!pRes.ok || !pJson.token) throw new Error();
      const { signInWithCustomToken, getAuth } = await import("firebase/auth");
      await signInWithCustomToken(getAuth(), pJson.token);
      try { sessionStorage.removeItem("gadit-kids-mode"); } catch { /* ignore */ }
      router.push(href("/family"));
    } catch {
      setBusy(false);
    }
  }

  return (
    <div dir={dir} role="status"
      style={{ position: "sticky", top: 0, zIndex: 60, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "7px 14px", background: "#F59E0B", color: "#1a1206", fontSize: 14, fontWeight: 700 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span aria-hidden="true">🧒</span>{c.label}</span>
      <button type="button" onClick={() => router.push(href("/kids"))}
        style={{ background: "rgba(0,0,0,0.12)", color: "#1a1206", border: "none", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        {c.switchKid}
      </button>
      <button type="button" onClick={exit} disabled={busy}
        style={{ background: "transparent", color: "#1a1206", border: "1px solid rgba(0,0,0,0.28)", borderRadius: 999, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "inherit" }}>
        {c.exit}
      </button>
    </div>
  );
}
