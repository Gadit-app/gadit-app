"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/lang-context";
import { useHref } from "@/lib/href";
import { planCopy } from "@/lib/plan-copy";
import { track } from "@/lib/track";
import type { User } from "firebase/auth";

/**
 * "Who is Gadit for?" right after a new sign-up (Gadi 2026-10-06, from the
 * 7-assistant council): a parent goes straight to Family, a teacher or a
 * principal to Schools, and "for me" stays where they are. Saved on the user
 * doc as `audience` so emails can follow it later.
 */
type Audience = "me" | "child" | "class";

export function AudienceQuestion({ user, onDone }: { user: User; onDone: () => void }) {
  const { lang, dir } = useLang();
  const href = useHref();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pick(a: Audience | "skip") {
    if (busy) return;
    setBusy(true);
    track("signup_audience", { audience: a, lang });
    if (a !== "skip") {
      try {
        const token = await user.getIdToken();
        await fetch("/api/account/audience", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ audience: a }),
        });
      } catch { /* best effort: never block the new user */ }
    }
    onDone();
    if (a === "child") router.push(href("/families"));
    else if (a === "class") router.push(href("/schools"));
  }

  const btn: React.CSSProperties = {
    display: "block", width: "100%", padding: "14px 18px", borderRadius: 14, border: "1.5px solid rgba(14,165,165,0.35)",
    background: "#fff", color: "#0B3B3B", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", textAlign: "center",
  };
  return (
    <div role="dialog" aria-modal="true" dir={dir}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10,25,30,0.45)", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#F7FBFA", borderRadius: 22, padding: "28px 22px 18px", boxShadow: "0 30px 70px -20px rgba(10,30,40,0.45)", display: "grid", gap: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#13262A", textAlign: "center" }}>{planCopy(lang, "audTitle")}</div>
        <div style={{ fontSize: 14.5, color: "#5B6E70", textAlign: "center", marginBottom: 6 }}>{planCopy(lang, "audSub")}</div>
        <button type="button" style={btn} disabled={busy} onClick={() => pick("me")}>{planCopy(lang, "audMe")}</button>
        <button type="button" style={btn} disabled={busy} onClick={() => pick("child")}>{planCopy(lang, "audChild")}</button>
        <button type="button" style={btn} disabled={busy} onClick={() => pick("class")}>{planCopy(lang, "audClass")}</button>
        <button type="button" disabled={busy} onClick={() => pick("skip")}
          style={{ background: "none", border: 0, color: "#5B6E70", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", padding: 6 }}>
          {planCopy(lang, "audSkip")}
        </button>
      </div>
    </div>
  );
}
